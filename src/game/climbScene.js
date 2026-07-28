// "The Ascent" — Zone 4 → Zone 5 climb traversal (GAINS Draft 17).
//
// The SECOND traversal, built on the same foundation as the Draft 8 bird
// flight: same lazy-loaded disposable <TraversalGame> wrapper, same
// registry-config + `traversalStarted` gating, same audio pattern (music
// created once, restart-in-place on replay so iOS keeps its unlocked
// AudioContext), same no-globals / report-out-via-onComplete contract.
// Only the mechanic is new — proving the engine reskins.
//
// Vertical one-thumb CLIMB through three stages (tree → mountain → spire),
// brightening as you rise. "Second Wind" (a breath meter) drains as you
// climb — faster at altitude — and is refilled by orbs (air-blooms) that
// drift down past you. The Shadow wells up from below as a rising wall of
// smoke: high breath and you pull ahead, low breath and it closes in — but
// it can NEVER catch you. Empty breath only makes the climb weary and slow,
// never fatal. Rest ledges pause the drain and push the Shadow back.
// Reaching the Beacon fires `onComplete({ orbsCollected })`.
//
// Config (registry key 'traversalConfig'):
//   { stageUrls[3], climbUrls[3], orbUrl, shadowUrl, musicUrl, sfxOrbUrl,
//     durationMs, reducedMotion, palette, onComplete }

const GAME_W = 540
const GAME_H = 960
const PLATE_RATIO = 2304 / 1296 // stage plates are 9:16
const PLATE_ZOOM = 1.4 // >1 so there's vertical travel to pan through
// A deliberately TINY climber against a vast wall — the "small traveler,
// big world" read of the Long Light style. Everything else scales off it.
const CLIMB_FIG_H = 48 // on-screen height of the climber figure
const CLIMB_SRC_FIG_H = 1010 // opaque figure height inside the 1351px canvas
const CLIMB_SRC_H = 1351
const ORB_W = 14 // orb width on screen (height derived from its 256×408 art)
const COLLECT_R = 34 // collection radius — forgiving, but you still steer

const DEFAULTS = {
  durationMs: 48000,
  reducedMotion: false,
  palette: { bloom: 0xfff3d0, orb: 0xffe3a0, ink: 0x05070e, warm: 0xffd9a0 },
}

// Per-stage breath drain (fraction per second) — the climb gets harder up
// high. `arrival` is the beat shown when you cross into that stage.
const STAGES = [
  { key: 'stage-tree', drain: 0.08, arrival: null },
  {
    key: 'stage-mountain',
    drain: 0.11,
    arrival: 'You reached the Great Mountain!\nKeep going!',
  },
  {
    key: 'stage-spire',
    drain: 0.135,
    arrival: 'You reached the Crystal Spire —\nalmost there!',
  },
]

// How long the climb holds on a stage-arrival beat.
const STAGE_PAUSE_MS = 5400

// How fast the Shadow slides toward its target position (per-frame lerp).
const SHADOW_EASE = 0.045
// The breath→distance curve. Squaring means the Shadow starts closing while
// your breath is still moderate, instead of only once you're nearly empty —
// so ignoring orbs gets you chased noticeably sooner.
const SHADOW_BREATH_CURVE = (b) => b * b

// Rest ledges: progress windows where the drain stops and the Shadow stalls.
const LEDGES = [
  { from: 0.30, to: 0.36 },
  { from: 0.64, to: 0.70 },
]

export function makeClimbScene(Phaser) {
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
  const lerp = (a, b, t) => a + (b - a) * t

  return class ClimbScene extends Phaser.Scene {
    constructor() {
      super('Climb')
    }

    init() {
      const cfg = this.game.registry.get('traversalConfig') || {}
      this.cfg = {
        ...DEFAULTS,
        ...cfg,
        palette: { ...DEFAULTS.palette, ...(cfg.palette || {}) },
      }
      this.reduced = !!this.cfg.reducedMotion
      this.durationMs = this.cfg.durationMs

      this.minX = GAME_W * 0.22
      this.maxX = GAME_W * 0.78
      this.baseY = GAME_H * 0.74 // feet line; climber is bottom-anchored

      this.started = false
      this.arrived = false
      this.ready = false

      this.p = 0 // overall climb progress 0..1
      this.stageIndex = 0
      this.breath = 1 // Second Wind, 0..1
      this.surgeMs = 0 // remaining orb speed-surge time
      this.orbs = []
      this.orbCount = 0
      this.targetX = GAME_W / 2
      this.frameIdx = 0
      this.frameMs = 0
      this.shadowTop = GAME_H + 200
      this.onLedge = false
      this.pauseMs = 0 // stage-arrival beat: holds the climb briefly
    }

    preload() {
      const c = this.cfg
      STAGES.forEach((s, i) => this.load.image(s.key, c.stageUrls[i]))
      // right → mid → left → mid
      this.load.image('climb-right', c.climbUrls[0])
      this.load.image('climb-mid', c.climbUrls[1])
      this.load.image('climb-left', c.climbUrls[2])
      this.load.image('orb', c.orbUrl)
      this.load.image('shadow-pursuer', c.shadowUrl)
      if (c.musicUrl) this.load.audio('climb-music', c.musicUrl)
      if (c.sfxOrbUrl) this.load.audio('sfx-orb', c.sfxOrbUrl)
    }

    create() {
      const P = this.cfg.palette
      this.makeGlowTexture(P.orb)
      this.makeVignetteTexture(P.ink)

      // --- stage plates (only the active one is visible; crossfade between) ---
      const plateW = GAME_W * PLATE_ZOOM
      const plateH = plateW * PLATE_RATIO
      this.travel = plateH - GAME_H
      this.plates = STAGES.map((s) =>
        this.add
          .image(GAME_W / 2, 0, s.key)
          .setOrigin(0.5, 0)
          .setDisplaySize(plateW, plateH)
          .setDepth(5)
          .setAlpha(0),
      )
      this.plates[0].setAlpha(1)
      this.positionPlate(0, 0)

      // --- ambient rising motes ---
      if (!this.reduced) {
        this.ambient = this.add
          .particles(0, 0, 'glow', {
            x: { min: 0, max: GAME_W },
            y: GAME_H + 8,
            lifespan: 6000,
            speedY: { min: -90, max: -50 },
            speedX: { min: -12, max: 12 },
            scale: { start: 0.42, end: 0.1 },
            alpha: { start: 0.5, end: 0 },
            frequency: 260,
            quantity: 1,
            blendMode: 'ADD',
          })
          .setDepth(18)
      }

      // --- the Shadow: a rising wall of smoke, always below the climber ---
      const shW = GAME_W * 1.18
      this.shadow = this.add
        .image(GAME_W / 2, this.shadowTop, 'shadow-pursuer')
        .setOrigin(0.5, 0)
        .setDisplaySize(shW, shW * (1621 / 1000))
        .setDepth(28)
        .setAlpha(0.95)

      // --- the climber (bottom-anchored so the feet stay planted) ---
      const scale = CLIMB_FIG_H / CLIMB_SRC_FIG_H
      this.climbScale = scale
      this.climber = this.add
        .image(GAME_W / 2, this.baseY, 'climb-mid')
        .setOrigin(0.5, 1)
        .setDisplaySize(520 * scale, CLIMB_SRC_H * scale)
        .setDepth(40)

      // --- warm brightening overlay + arrival bloom + vignette ---
      this.warm = this.add
        .rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, P.warm, 1)
        .setDepth(44)
        .setBlendMode('ADD')
        .setAlpha(0)
      this.add.image(GAME_W / 2, GAME_H / 2, 'vignette').setDepth(46)
      this.bloom = this.add
        .rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, P.bloom, 1)
        .setDepth(60)
        .setAlpha(0)

      // --- HUD: Second Wind meter + orb counter (hidden until begin) ---
      this.hud = this.add.container(0, 0).setDepth(70).setAlpha(0)
      this.meterBg = this.add
        .rectangle(GAME_W / 2, 44, 300, 12, 0x000000, 0.35)
        .setOrigin(0.5, 0.5)
      this.meterFill = this.add
        .rectangle(GAME_W / 2 - 148, 44, 296, 8, 0xffe3a0, 1)
        .setOrigin(0, 0.5)
      this.meterLabel = this.add
        .text(GAME_W / 2, 24, 'SECOND WIND', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          fontSize: '11px',
          color: '#ffe9b0',
        })
        .setOrigin(0.5, 0.5)
        .setAlpha(0.8)
      this.orbText = this.add
        .text(GAME_W / 2, 68, '✦ 0', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          fontSize: '20px',
          color: '#ffe9b0',
        })
        .setOrigin(0.5, 0.5)
        .setAlpha(0.85)
      this.ledgeText = this.add
        .text(GAME_W / 2, GAME_H * 0.3, 'A rest ledge — catch your breath.', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          fontSize: '15px',
          color: '#fff3d0',
        })
        .setOrigin(0.5, 0.5)
        .setDepth(72)
        .setAlpha(0)
      // Stage-arrival beat ("You reached the Great Mountain!") — shown for
      // STAGE_PAUSE_MS while the climb holds.
      this.stageText = this.add
        .text(GAME_W / 2, GAME_H * 0.42, '', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          fontSize: '26px',
          color: '#fff6de',
          align: 'center',
          lineSpacing: 8,
          stroke: '#2a1a06',
          strokeThickness: 4,
        })
        .setOrigin(0.5, 0.5)
        .setDepth(74)
        .setAlpha(0)
      this.hud.add([this.meterBg, this.meterFill, this.meterLabel, this.orbText])

      // --- audio: create music once so it survives scene.restart() ---
      if (!this.music && this.cache.audio.exists('climb-music')) {
        this.music = this.sound.add('climb-music', { loop: true, volume: 0.3 })
      }
      // ONE reusable air-whoosh instance: the clip is ~1.15s and orbs arrive
      // about every second, so retriggering a single sound keeps collects crisp
      // instead of letting whooshes pile up on each other.
      if (!this.sfxOrb && this.cache.audio.exists('sfx-orb')) {
        this.sfxOrb = this.sound.add('sfx-orb', { volume: 0.45 })
      }

      // --- input: one thumb (pointer) + arrow keys for desktop ---
      this.cursors = this.input.keyboard.createCursorKeys()
      const steer = (pointer) => {
        if (!this.reduced && this.started && !this.arrived) {
          this.targetX = clamp(pointer.x, this.minX, this.maxX)
        }
      }
      this.input.on('pointermove', steer)
      this.input.on('pointerdown', steer)

      this.ready = true
    }

    // Flipped on when React sets registry 'traversalStarted' (polled in update).
    begin() {
      if (this.started) return
      this.started = true
      this.hud.setAlpha(1)
      this.startMusic()
      this.orbTimer = this.time.addEvent({
        delay: this.reduced ? 1400 : 1050,
        loop: true,
        callback: () => this.spawnOrb(),
      })
      this.time.delayedCall(500, () => this.spawnOrb())
    }

    startMusic() {
      if (!this.music) return
      const go = () => {
        if (!this.music || this.arrived) return
        this.music.stop()
        this.music.setVolume(0.3)
        this.music.play()
      }
      if (this.sound.locked) {
        this.sound.once(Phaser.Sound.Events.UNLOCKED, go)
      } else {
        go()
      }
    }

    positionPlate(i, localP) {
      // localP 0 → showing the plate's bottom; 1 → its top.
      this.plates[i].y = this.travel * (localP - 1)
    }

    setStage(next) {
      if (next === this.stageIndex || next > 2) return
      const prev = this.stageIndex
      this.stageIndex = next
      this.positionPlate(next, 0)
      this.showStageArrival(STAGES[next].arrival)
      if (this.reduced) {
        this.plates[prev].setAlpha(0)
        this.plates[next].setAlpha(1)
        return
      }
      this.plates[next].setAlpha(0)
      this.tweens.add({ targets: this.plates[next], alpha: 1, duration: 900 })
      this.tweens.add({ targets: this.plates[prev], alpha: 0, duration: 900 })
      // soft haze to cover the seam
      const haze = this.add
        .rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0xffffff, 1)
        .setDepth(43)
        .setBlendMode('ADD')
        .setAlpha(0)
      this.tweens.add({
        targets: haze,
        alpha: 0.16,
        duration: 320,
        yoyo: true,
        onComplete: () => haze.destroy(),
      })
    }

    // A quick beat as you cross into a new stage: hold the climb, name where
    // you are, then carry on. Finite by construction (pauseMs counts down in
    // update), so it can never stall the ascent.
    showStageArrival(message) {
      if (!message) return
      this.pauseMs = STAGE_PAUSE_MS
      this.stageText.setText(message)
      this.tweens.killTweensOf(this.stageText)
      this.stageText.setAlpha(0).setScale(0.94)
      this.tweens.add({
        targets: this.stageText,
        alpha: 1,
        scale: 1,
        duration: 320,
        ease: 'Back.out',
      })
      this.time.delayedCall(STAGE_PAUSE_MS - 380, () => {
        this.tweens.add({ targets: this.stageText, alpha: 0, duration: 360 })
      })
    }

    spawnOrb() {
      if (this.arrived) return
      const x = this.reduced
        ? GAME_W / 2 + Phaser.Math.Between(-40, 40)
        : Phaser.Math.Between(this.minX, this.maxX)
      const o = this.add
        .image(x, -50, 'orb')
        .setDepth(30)
        .setDisplaySize(ORB_W, ORB_W * (408 / 256))
        .setBlendMode('ADD')
      if (!this.reduced) {
        this.tweens.add({
          targets: o,
          scaleX: o.scaleX * 1.15,
          scaleY: o.scaleY * 1.15,
          duration: 760,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
        })
      }
      this.orbs.push(o)
    }

    collectOrb(o, i) {
      this.orbCount += 1
      this.orbText.setText('✦ ' + this.orbCount)
      this.breath = clamp(this.breath + 0.3, 0, 1)
      this.surgeMs = 1100
      if (this.sfxOrb && !this.sound.locked) {
        this.sfxOrb.stop() // retrigger from the top rather than overlapping
        this.sfxOrb.play()
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(10)
        } catch {
          /* ignore */
        }
      }
      if (!this.reduced) {
        const burst = this.add
          .particles(o.x, o.y, 'glow', {
            lifespan: 460,
            speed: { min: 30, max: 85 },
            scale: { start: 0.28, end: 0 },
            alpha: { start: 0.9, end: 0 },
            blendMode: 'ADD',
            emitting: false,
          })
          .setDepth(42)
        burst.explode(9)
        this.time.delayedCall(650, () => burst.destroy())
      }
      this.removeOrb(o, i)
    }

    // Orbs carry an infinite (repeat:-1) pulse tween. Phaser's destroy() does
    // NOT kill tweens targeting the object, so they must be killed by hand or
    // they pile up in the TweenManager writing to dead objects.
    removeOrb(o, i) {
      this.tweens.killTweensOf(o) // no-op under reduced motion (no tween made)
      o.destroy()
      this.orbs.splice(i, 1)
    }

    arrive() {
      if (this.arrived) return
      this.arrived = true
      if (this.orbTimer) this.orbTimer.remove()
      if (this.music && this.music.isPlaying) {
        this.tweens.add({ targets: this.music, volume: 0, duration: 1000 })
      }
      // The Shadow can't follow into the light — it falls away below.
      this.tweens.add({
        targets: this.shadow,
        y: GAME_H + 400,
        alpha: 0.2,
        duration: 900,
        ease: 'Quad.in',
      })
      const finish = () =>
        this.time.delayedCall(this.reduced ? 120 : 420, () => {
          if (typeof this.cfg.onComplete === 'function') {
            this.cfg.onComplete({ orbsCollected: this.orbCount })
          }
        })
      if (this.reduced) {
        this.tweens.add({
          targets: this.bloom,
          alpha: 0.3,
          duration: 900,
          ease: 'Sine.inOut',
          onComplete: finish,
        })
      } else {
        this.tweens.add({
          targets: this.bloom,
          alpha: 0.92,
          duration: 700,
          ease: 'Quad.out',
          onComplete: () => {
            this.tweens.add({ targets: this.bloom, alpha: 0.34, duration: 700 })
            finish()
          },
        })
      }
    }

    update(time, delta) {
      if (!this.ready) return

      // Idle behind the instructions screen until React flips the flag.
      if (!this.started) {
        if (this.game.registry.get('traversalStarted')) {
          this.begin()
        } else {
          // Reduced motion: stay still behind the instructions overlay (the
          // canvas shows through it), matching the in-run reduced path.
          if (!this.reduced) {
            this.climber.y = this.baseY + Math.sin(time * 0.003) * 4
          }
          return
        }
      }

      const dt = delta / 1000

      if (!this.arrived) {
        // --- stage-arrival beat: hold the climb (and the drain) briefly ---
        const beat = this.pauseMs > 0
        if (beat) this.pauseMs -= delta

        // --- rest ledges: drain pauses, Shadow stalls ---
        // (suppressed during a stage beat so the two messages never overlap)
        const ledge =
          !beat && LEDGES.some((l) => this.p >= l.from && this.p <= l.to)
        if (ledge !== this.onLedge) {
          this.onLedge = ledge
          this.tweens.add({
            targets: this.ledgeText,
            alpha: ledge ? 0.9 : 0,
            duration: 400,
          })
        }

        // A ledge or a stage beat both ease off the climb.
        const hold = beat || ledge

        // --- Second Wind drains (faster up high), orbs refill it ---
        if (!hold) {
          this.breath = clamp(
            this.breath - STAGES[this.stageIndex].drain * dt,
            0,
            1,
          )
        }

        // --- climb rate: surge after an orb, weary when out of breath.
        //     NEVER zero — the climb always continues (no-fail). ---
        if (this.surgeMs > 0) this.surgeMs -= delta
        let rate = 1
        if (this.surgeMs > 0) rate = 1.5
        else if (this.breath <= 0) rate = 0.55
        else if (this.breath < 0.25) rate = 0.8
        // The stage beat pauses forward progress — finite, so the ascent
        // always resumes and still always completes.
        if (beat) rate = 0

        this.p = Math.min(1, this.p + (delta / this.durationMs) * rate)

        // --- stage + plate panning ---
        const raw = this.p * 3
        const idx = Math.min(2, Math.floor(raw))
        if (idx !== this.stageIndex) this.setStage(idx)
        this.positionPlate(this.stageIndex, Math.min(1, raw - this.stageIndex))

        // --- brightening as you rise ---
        this.warm.setAlpha(this.p * 0.2)

        // --- the Shadow: closes when breath is low, recedes when high.
        //     Hard-clamped so it can never reach the climber. ---
        // Distances are relative to the (small) climber so it reads as a real
        // pursuit; the clamp keeps the smoke's top edge strictly below the
        // climber's feet (body spans baseY-CLIMB_FIG_H..baseY), so no contact.
        const far = GAME_H + 150
        const near = this.baseY + 36
        let target = lerp(
          near,
          far,
          this.reduced ? 1 : SHADOW_BREATH_CURVE(this.breath),
        )
        if (hold) target = far
        this.shadowTop += (target - this.shadowTop) * SHADOW_EASE
        this.shadowTop = Math.max(this.baseY + 22, this.shadowTop)
        this.shadow.y = this.shadowTop

        // --- HUD meter ---
        this.meterFill.width = Math.max(0, 296 * this.breath)
        this.meterFill.fillColor = this.breath < 0.25 ? 0xffb27a : 0xffe3a0

        if (this.p >= 1) this.arrive()
      }

      // --- steering + climb cycle (right → mid → left → mid) ---
      if (!this.reduced) {
        if (this.cursors.left.isDown) this.targetX -= 6
        if (this.cursors.right.isDown) this.targetX += 6
        this.targetX = clamp(this.targetX, this.minX, this.maxX)
        this.climber.x += (this.targetX - this.climber.x) * 0.1
        const sway = clamp((this.targetX - this.climber.x) * 0.0014, -0.1, 0.1)
        this.climber.rotation += (sway - this.climber.rotation) * 0.1
      } else {
        this.climber.x += (GAME_W / 2 - this.climber.x) * 0.05
      }

      if (!this.arrived) {
        const stepMs = this.breath <= 0 ? 420 : this.surgeMs > 0 ? 190 : 260
        this.frameMs += delta
        if (this.frameMs >= stepMs) {
          this.frameMs = 0
          this.frameIdx = (this.frameIdx + 1) % 4
          const key = ['climb-right', 'climb-mid', 'climb-left', 'climb-mid'][
            this.frameIdx
          ]
          this.climber.setTexture(key)
          this.climber.setDisplaySize(520 * this.climbScale, CLIMB_SRC_H * this.climbScale)
        }
        // reach/pull bob: rises on the reach frames, settles on mid.
        // Kept proportional to the (small) figure so it reads as effort, not jitter.
        const bob = this.reduced ? 0 : this.frameIdx % 2 === 0 ? -2 : 0
        this.climber.y = this.baseY + bob + (this.reduced ? 0 : Math.sin(time * 0.006) * 1.2)
      }

      // --- orbs drift down past the climber ---
      const orbSpeed = 210
      for (let i = this.orbs.length - 1; i >= 0; i--) {
        const o = this.orbs[i]
        o.y += orbSpeed * dt
        if (
          !this.arrived &&
          Phaser.Math.Distance.Between(this.climber.x, this.baseY - CLIMB_FIG_H * 0.55, o.x, o.y) <
            COLLECT_R
        ) {
          this.collectOrb(o, i)
          continue
        }
        if (o.y > GAME_H + 60) {
          this.removeOrb(o, i)
        }
      }
    }

    // --- procedural textures (shared shapes; no extra downloads) ---

    makeGlowTexture(color) {
      if (this.textures.exists('glow')) return
      const R = 16
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      for (let i = 6; i >= 1; i--) {
        g.fillStyle(color, 0.16)
        g.fillCircle(R, R, R * (i / 6))
      }
      g.fillStyle(0xffffff, 0.95)
      g.fillCircle(R, R, 3)
      g.generateTexture('glow', R * 2, R * 2)
      g.destroy()
    }

    makeVignetteTexture(ink) {
      if (this.textures.exists('vignette')) return
      const tex = this.textures.createCanvas('vignette', GAME_W, GAME_H)
      if (!tex) return
      const ctx = tex.getContext()
      const r = (ink >> 16) & 0xff
      const gg = (ink >> 8) & 0xff
      const b = ink & 0xff
      const grd = ctx.createRadialGradient(
        GAME_W / 2,
        GAME_H * 0.55,
        GAME_H * 0.22,
        GAME_W / 2,
        GAME_H * 0.55,
        GAME_H * 0.8,
      )
      grd.addColorStop(0, `rgba(${r},${gg},${b},0)`)
      grd.addColorStop(1, `rgba(${r},${gg},${b},0.5)`)
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, GAME_W, GAME_H)
      tex.refresh()
    }
  }
}
