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
// drift down past you.
//
// Tension is the traveler's OWN darkness (Option-2 lore — there is no shadow
// character): as Second Wind drops, a dark aura closes in from the screen
// EDGES and the climb slows; each orb pushes it back out and floods light in
// (a brighter recovery surge if you were running low). Empty breath only makes
// the climb weary, never fatal. Rest ledges and the stage-arrival beats ease
// the drain and clear the edges.
// Reaching the Beacon fires `onComplete({ orbsCollected, feelingsCleared })`.
//
// Config (registry key 'traversalConfig'):
//   { stageUrls[3], climbUrls[3], orbUrl, musicUrl, sfxOrbUrl,
//     durationMs, reducedMotion, palette, onComplete }
//
// Draft 63 (Ginny/Sprang's 8/31 climb ideas): a feeling mechanic layered on
// top of the same climb bones. Feelings fall at you as you climb; you FACE
// them, which turns them to light (on-lore: "all light is a faced shadow").
// Two mote types, both falling from above:
//   GOLD — positive feelings (hope, joy, courage, calm, pride, gratitude),
//     collected by steering into them. Replaces the old plain oxygen orbs
//     as the Second Wind charge (same collect logic/sound, just labeled).
//   RED — negative feelings (sadness, shame, guilt, anger, resentment,
//     helplessness, hopelessness, regret), the obstacles. Varying size =
//     intensity (RED_TIERS). Tap directly on one to fire the climber's
//     Focusing Lens beam at it: its name flashes, and once it's taken
//     enough hits (1/2/3 by size — "two gears working together on the
//     hardest feelings," no separate charge-hold timing for this first
//     pass) it shatters into light motes (a small Second Wind top-up —
//     facing it powers the climb; gold stays the main breath source). If a
//     red reaches the climber un-blasted, it knocks the climber back a
//     little and drains Second Wind (feeding the darkness aura already
//     driven by breath below).
// Tap-vs-drag is disambiguated by total pointer displacement + duration
// (see the pointerdown/pointerup handlers in create()) — steering-by-drag
// is completely unchanged, a tap on a red just additionally fires the beam.
// Art is procedural for this pass (Cowork can supply painted feeling art in
// a follow-up): gold motes reuse the existing warm orb art verbatim (it's
// already gold-toned); red motes get a new red/ember glow texture, same
// makeGlowTexture() approach as the existing ambient motes, just a second
// color + texture key.

const GAME_W = 540
const GAME_H = 960
const PLATE_RATIO = 2304 / 1296 // stage plates are 9:16
const PLATE_ZOOM = 1.4 // >1 so there's vertical travel to pan through
// A deliberately BIG climber against a vast wall (Draft 63, Sprang: "that
// little climber seems so small, could it be bigger?") — reads as a real
// character rather than a speck. COLLECT_R is scaled up to match.
const CLIMB_FIG_H = 100 // on-screen height of the climber figure
const CLIMB_SRC_FIG_H = 1010 // opaque figure height inside the 1351px canvas
const CLIMB_SRC_H = 1351
const ORB_W = 16 // gold-mote width on screen (height derived from its 256×408 art)
const COLLECT_R = 68 // collection/hit radius — forgiving, but you still steer

// Draft 63 feeling vocabularies (Ginny/Sprang, 8/31 meeting) — GOLD is what
// you collect, RED is what you blast.
const GOLD_WORDS = ['hope', 'joy', 'courage', 'calm', 'pride', 'gratitude']
const RED_WORDS = [
  'sadness', 'shame', 'guilt', 'anger', 'resentment',
  'helplessness', 'hopelessness', 'regret',
]
// Red intensity tiers ("a small wisp of guilt vs a big wall of
// hopelessness") — a random tier per spawn, not a fixed size per word (no
// named feeling is presumed more "intense" than another). `hits` is how
// many taps shatter it; `weight` skews spawns toward the smaller, easier
// tier so the climb stays approachable one-thumb.
const RED_TIERS = [
  { scale: 0.85, hits: 1, weight: 3 },
  { scale: 1.3, hits: 2, weight: 2 },
  { scale: 1.75, hits: 3, weight: 1 },
]
const TAP_R = 50 // how forgiving a tap has to land on a red to blast it
// A tap (vs. a steering drag) is a pointer that barely moved and released
// quickly.
const TAP_MAX_DIST = 14
const TAP_MAX_MS = 350

const DEFAULTS = {
  durationMs: 48000,
  reducedMotion: false,
  palette: {
    bloom: 0xfff3d0,
    orb: 0xffe3a0,
    ink: 0x05070e,
    warm: 0xffd9a0,
    red: 0xff6a52, // ember/red glow for the negative-feeling motes
  },
}

// Per-stage breath drain (fraction per second) — the climb gets harder up
// high. `arrival` is the beat shown when you cross into that stage.
const STAGES = [
  { key: 'stage-tree', drain: 0.105, arrival: null },
  {
    key: 'stage-mountain',
    drain: 0.14,
    arrival: 'You reached the Great Mountain!\nKeep going!',
  },
  {
    key: 'stage-spire',
    drain: 0.17,
    arrival: 'You reached the Crystal Spire —\nalmost there!',
  },
]

// How long the climb holds on a stage-arrival beat.
const STAGE_PAUSE_MS = 5400

// The darkness aura: how fast it creeps in/out (per-frame lerp) and how
// strongly low breath drives it. Shaped so a healthy Second Wind keeps the
// frame clear (breath 0.9 → ~0.01) and it bites as you run low (0.25 → ~0.55,
// empty → the cap). Without the curve, every run would open in darkness
// during the seconds before the first orb reaches you.
const AURA_EASE = 0.06
const AURA_FROM_BREATH = (b) => Math.pow(1 - b, 1.8)
const AURA_MAX = 0.92 // alpha at zero breath; never fully blacks the frame

// Rest ledges: progress windows where the drain stops and the edges clear.
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
      this.motes = [] // both gold (collectible) and red (blast) feelings
      this.orbCount = 0
      this.feelingsCleared = 0
      this.targetX = GAME_W / 2
      this.frameIdx = 0
      this.frameMs = 0
      this.aura = 0 // 0 = clear edges, 1 = darkness pressed all the way in
      this.onLedge = false
      this.pauseMs = 0 // stage-arrival beat: holds the climb briefly
      // tap-vs-drag disambiguation (Draft 63) -- see the pointerdown/up
      // handlers in create() and TAP_MAX_DIST/TAP_MAX_MS above.
      this.tapStartX = null
      this.tapStartY = null
      this.tapStartT = 0
    }

    preload() {
      const c = this.cfg
      STAGES.forEach((s, i) => this.load.image(s.key, c.stageUrls[i]))
      // right → mid → left → mid
      this.load.image('climb-right', c.climbUrls[0])
      this.load.image('climb-mid', c.climbUrls[1])
      this.load.image('climb-left', c.climbUrls[2])
      this.load.image('orb', c.orbUrl)
      // (no pursuer sprite — the darkness aura is drawn procedurally)
      if (c.musicUrl) this.load.audio('climb-music', c.musicUrl)
      if (c.sfxOrbUrl) this.load.audio('sfx-orb', c.sfxOrbUrl)
    }

    create() {
      const P = this.cfg.palette
      this.makeGlowTexture(P.orb)
      this.makeGlowTexture(P.red, 'glow-red')
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

      // --- the darkness aura: the traveler's OWN darkness, pressing in from
      // the edges as Second Wind drops (no pursuer, no shadow character).
      // Two rings so it reads as depth rather than a flat frame: a wide soft
      // haze plus a tighter, darker edge. Both sit above the world but below
      // the HUD, and are driven by `this.aura` in update(). ---
      this.makeAuraTexture()
      this.auraSoft = this.add
        .image(GAME_W / 2, GAME_H / 2, 'aura')
        .setDisplaySize(GAME_W * 1.02, GAME_H * 1.02)
        .setDepth(26)
        .setAlpha(0)
      this.auraEdge = this.add
        .image(GAME_W / 2, GAME_H / 2, 'aura')
        .setDisplaySize(GAME_W * 1.3, GAME_H * 1.24)
        .setDepth(28)
        .setAlpha(0)

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
      // Draft 63: a discrete tap additionally tries to blast a red feeling
      // (see tryBlast) -- steering-by-drag itself is completely unchanged,
      // tap-vs-drag is just measured on pointerup (small total displacement,
      // released quickly) so the two never conflict.
      this.cursors = this.input.keyboard.createCursorKeys()
      const steer = (pointer) => {
        if (!this.reduced && this.started && !this.arrived) {
          this.targetX = clamp(pointer.x, this.minX, this.maxX)
        }
      }
      this.input.on('pointermove', steer)
      this.input.on('pointerdown', (pointer) => {
        steer(pointer)
        this.tapStartX = pointer.x
        this.tapStartY = pointer.y
        this.tapStartT = this.time.now
      })
      this.input.on('pointerup', (pointer) => {
        if (this.tapStartX == null) return
        const dist = Phaser.Math.Distance.Between(
          this.tapStartX, this.tapStartY, pointer.x, pointer.y,
        )
        const dur = this.time.now - this.tapStartT
        this.tapStartX = null
        if (dist < TAP_MAX_DIST && dur < TAP_MAX_MS) this.tryBlast(pointer.x, pointer.y)
      })

      this.ready = true
    }

    // Flipped on when React sets registry 'traversalStarted' (polled in update).
    begin() {
      if (this.started) return
      this.started = true
      this.hud.setAlpha(1)
      this.startMusic()
      this.moteTimer = this.time.addEvent({
        delay: this.reduced ? 1400 : 1050,
        loop: true,
        callback: () => this.spawnMote(),
      })
      this.time.delayedCall(500, () => this.spawnMote())
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

    // Draft 63: picks which feeling falls next. Weighted toward gold so
    // Second Wind still has enough fuel now that reds share the same spawn
    // slots.
    spawnMote() {
      if (this.arrived) return
      if (Phaser.Math.FloatBetween(0, 1) < 0.6) this.spawnGold()
      else this.spawnRed()
    }

    spawnGold() {
      if (this.arrived) return
      const x = this.reduced
        ? GAME_W / 2 + Phaser.Math.Between(-40, 40)
        : Phaser.Math.Between(this.minX, this.maxX)
      const word = Phaser.Utils.Array.GetRandom(GOLD_WORDS)
      const glow = this.add
        .image(0, 0, 'orb')
        .setDisplaySize(ORB_W, ORB_W * (408 / 256))
        .setBlendMode('ADD')
      const label = this.add
        .text(0, ORB_W * 1.1, word, {
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#fff3d0',
          stroke: '#3a2a06',
          strokeThickness: 3,
        })
        .setOrigin(0.5, 0.5)
      const m = this.add.container(x, -50, [glow, label]).setDepth(30)
      m.kind = 'gold'
      if (!this.reduced) {
        this.tweens.add({
          targets: glow,
          scaleX: glow.scaleX * 1.15,
          scaleY: glow.scaleY * 1.15,
          duration: 760,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
        })
      }
      this.motes.push(m)
    }

    // Red feeling-obstacles: size (RED_TIERS) is randomized per spawn, not
    // fixed per word -- "varying size = intensity" is the point, not a
    // ranking of which named feeling is worse than another.
    spawnRed() {
      if (this.arrived) return
      const x = this.reduced
        ? GAME_W / 2 + Phaser.Math.Between(-40, 40)
        : Phaser.Math.Between(this.minX, this.maxX)
      const word = Phaser.Utils.Array.GetRandom(RED_WORDS)
      const tier = this.pickRedTier()
      const w = ORB_W * 1.7 * tier.scale
      const glow = this.add
        .image(0, 0, 'glow-red')
        .setDisplaySize(w, w)
        .setBlendMode('ADD')
      const label = this.add
        .text(0, 0, word, {
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#fff3f0',
          stroke: '#3a0a06',
          strokeThickness: 3,
          align: 'center',
          wordWrap: { width: w * 1.6 },
        })
        .setOrigin(0.5, 0.5)
      const m = this.add.container(x, -50, [glow, label]).setDepth(30)
      m.kind = 'red'
      m.hitsNeeded = tier.hits
      m.hitsTaken = 0
      if (!this.reduced) {
        this.tweens.add({
          targets: glow,
          scaleX: glow.scaleX * 1.1,
          scaleY: glow.scaleY * 1.1,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
        })
      }
      this.motes.push(m)
    }

    pickRedTier() {
      const total = RED_TIERS.reduce((s, t) => s + t.weight, 0)
      let r = Phaser.Math.FloatBetween(0, total)
      for (const t of RED_TIERS) {
        if (r < t.weight) return t
        r -= t.weight
      }
      return RED_TIERS[0]
    }

    collectGold(m) {
      this.orbCount += 1
      this.orbText.setText('✦ ' + this.orbCount)
      // "Second Wind" recovery beat: catching a gold feeling after running
      // low floods the light back in — a brighter flash and a longer surge
      // than a routine top-up, so the gear earns its name.
      const wasLow = this.breath < 0.3
      this.breath = clamp(this.breath + 0.3, 0, 1)
      this.surgeMs = wasLow ? 1600 : 1100
      if (wasLow && !this.reduced) {
        this.aura = Math.min(this.aura, 0.25) // shove the darkness back at once
        const flash = this.add
          .rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0xfff3d0, 1)
          .setDepth(45)
          .setBlendMode('ADD')
          .setAlpha(0)
        this.tweens.add({
          targets: flash,
          alpha: 0.3,
          duration: 160,
          yoyo: true,
          ease: 'Quad.out',
          onComplete: () => flash.destroy(),
        })
      }
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
        // the word blooms briefly before the burst carries it away
        const label = m.list[1]
        this.tweens.add({ targets: label, scale: 1.4, alpha: 0, duration: 380, ease: 'Quad.out' })
        const burst = this.add
          .particles(m.x, m.y, 'glow', {
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
      this.removeMote(m)
    }

    // A red feeling reaches the climber un-blasted: a small knockback +
    // Second Wind drain (feeding the darkness aura, which already reads
    // straight off breath in update()) rather than a fail state.
    hitByRed(m) {
      this.breath = clamp(this.breath - 0.12, 0, 1)
      const dir = this.climber.x < m.x ? -1 : 1
      this.targetX = clamp(this.targetX + dir * 26, this.minX, this.maxX)
      if (!this.reduced) {
        this.cameras.main.shake(140, 0.006)
        const flash = this.add
          .rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, this.cfg.palette.red, 1)
          .setDepth(45)
          .setBlendMode('ADD')
          .setAlpha(0)
        this.tweens.add({
          targets: flash,
          alpha: 0.22,
          duration: 120,
          yoyo: true,
          onComplete: () => flash.destroy(),
        })
      }
      this.removeMote(m)
    }

    // Tap-to-target: finds the nearest red feeling within TAP_R of the tap
    // and registers a hit on it. No-op if nothing's there (a missed tap just
    // nudges the steer target — see the pointerdown handler in create()).
    tryBlast(x, y) {
      if (!this.started || this.arrived) return
      let best = null
      let bestD = TAP_R
      for (const m of this.motes) {
        if (m.kind !== 'red') continue
        const d = Phaser.Math.Distance.Between(x, y, m.x, m.y)
        if (d < bestD) {
          bestD = d
          best = m
        }
      }
      if (best) this.hitRed(best)
    }

    // The Focusing Lens beam: fires from the climber to the tapped feeling,
    // flashes its name, and either shatters it (enough hits taken) or just
    // registers the hit -- big reds need a few taps ("two gears working
    // together on the hardest feelings").
    hitRed(m) {
      m.hitsTaken += 1
      this.fireBeam(m.x, m.y)
      const label = m.list[1]
      this.tweens.add({ targets: label, scale: 1.3, duration: 140, yoyo: true, ease: 'Quad.out' })
      if (m.hitsTaken >= m.hitsNeeded) {
        this.shatterRed(m)
      } else {
        const glow = m.list[0]
        this.tweens.add({ targets: glow, alpha: 0.5, duration: 90, yoyo: true })
      }
    }

    fireBeam(tx, ty) {
      if (this.reduced) return
      const sx = this.climber.x
      const sy = this.baseY - CLIMB_FIG_H * 0.6
      const g = this.add.graphics().setDepth(50)
      g.lineStyle(9, 0xfff3d0, 0.28)
      g.beginPath()
      g.moveTo(sx, sy)
      g.lineTo(tx, ty)
      g.strokePath()
      g.lineStyle(4, 0xfff3d0, 0.95)
      g.beginPath()
      g.moveTo(sx, sy)
      g.lineTo(tx, ty)
      g.strokePath()
      this.tweens.add({ targets: g, alpha: 0, duration: 240, onComplete: () => g.destroy() })
    }

    // Facing a feeling turns it to light (on-lore): the shatter burst reuses
    // the GOLD glow texture (not red) so the released motes visually read as
    // light, not as more of the feeling that just broke apart. A smaller
    // Second Wind top-up than a gold collect -- gold stays the main source.
    shatterRed(m) {
      if (!this.reduced) {
        const burst = this.add
          .particles(m.x, m.y, 'glow', {
            lifespan: 520,
            speed: { min: 50, max: 120 },
            scale: { start: 0.32, end: 0 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            emitting: false,
          })
          .setDepth(42)
        burst.explode(8 + m.hitsNeeded * 3)
        this.time.delayedCall(700, () => burst.destroy())
      }
      this.breath = clamp(this.breath + 0.08, 0, 1)
      this.feelingsCleared += 1
      this.removeMote(m)
    }

    // Motes carry infinite (repeat:-1) pulse tweens on their glow child.
    // Phaser's destroy() does NOT kill tweens targeting an object, so they
    // must be killed by hand (container + children) or they pile up in the
    // TweenManager writing to dead objects.
    removeMote(m) {
      m.list.slice().forEach((child) => this.tweens.killTweensOf(child))
      this.tweens.killTweensOf(m)
      m.destroy()
      const idx = this.motes.indexOf(m)
      if (idx > -1) this.motes.splice(idx, 1)
    }

    arrive() {
      if (this.arrived) return
      this.arrived = true
      if (this.moteTimer) this.moteTimer.remove()
      if (this.music && this.music.isPlaying) {
        this.tweens.add({ targets: this.music, volume: 0, duration: 1000 })
      }
      // The darkness lifts entirely at the Beacon.
      this.aura = 0
      this.tweens.add({
        targets: [this.auraSoft, this.auraEdge],
        alpha: 0,
        duration: 700,
        ease: 'Quad.out',
      })
      const finish = () =>
        this.time.delayedCall(this.reduced ? 120 : 420, () => {
          if (typeof this.cfg.onComplete === 'function') {
            this.cfg.onComplete({
              orbsCollected: this.orbCount,
              feelingsCleared: this.feelingsCleared,
            })
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

        // --- rest ledges: drain pauses, the edges clear ---
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

        // (the warm brightening is applied with the aura below, since the
        // closing darkness dims it)

        // --- the darkness aura: presses in from the edges as breath drops,
        //     recedes as it recovers. Never covers the centre (the texture is
        //     a radial hole), so the climber is always visible — no-fail. ---
        const auraTarget = hold
          ? 0
          : AURA_FROM_BREATH(this.reduced ? 1 : this.breath) * AURA_MAX
        this.aura += (auraTarget - this.aura) * AURA_EASE
        // A slow breathing pulse so the edges feel alive rather than static.
        const pulse = this.reduced ? 0 : Math.sin(time * 0.0011) * 0.03 * this.aura
        this.auraSoft.setAlpha(Math.max(0, this.aura * 0.75 + pulse))
        this.auraEdge.setAlpha(Math.max(0, this.aura + pulse))
        // The world dims a little as the darkness closes in.
        this.warm.setAlpha(Math.max(0, this.p * 0.2 - this.aura * 0.12))
        if (this.music && this.music.isPlaying && !this.arrived) {
          this.music.setVolume(0.3 * (1 - this.aura * 0.45))
        }

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

      // --- feelings drift down past the climber (Draft 63) ---
      const goldSpeed = 210
      const redSpeed = 185 // a touch slower -- a beat to notice and tap it
      const climberY = this.baseY - CLIMB_FIG_H * 0.55
      for (let i = this.motes.length - 1; i >= 0; i--) {
        const m = this.motes[i]
        m.y += (m.kind === 'gold' ? goldSpeed : redSpeed) * dt
        if (!this.arrived) {
          const hitR = m.kind === 'gold' ? COLLECT_R : COLLECT_R * 0.85
          if (Phaser.Math.Distance.Between(this.climber.x, climberY, m.x, m.y) < hitR) {
            if (m.kind === 'gold') this.collectGold(m)
            else this.hitByRed(m)
            continue
          }
        }
        if (m.y > GAME_H + 60) {
          this.removeMote(m)
        }
      }
    }

    // --- procedural textures (shared shapes; no extra downloads) ---

    // Draft 63: takes a texture `key` (default 'glow') so the same shared
    // shape can generate a second color -- 'glow-red' for the negative
    // feeling motes -- without touching the original 'glow' (ambient motes
    // + gold-collect/shatter bursts).
    makeGlowTexture(color, key = 'glow') {
      if (this.textures.exists(key)) return
      const R = 16
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      for (let i = 6; i >= 1; i--) {
        g.fillStyle(color, 0.16)
        g.fillCircle(R, R, R * (i / 6))
      }
      g.fillStyle(0xffffff, 0.95)
      g.fillCircle(R, R, 3)
      g.generateTexture(key, R * 2, R * 2)
      g.destroy()
    }

    // The darkness aura: a radial hole — clear in the middle, darkening
    // toward the edges — so it can be faded in to press the frame's borders
    // inward without ever blacking out the centre where the climber is.
    makeAuraTexture() {
      if (this.textures.exists('aura')) return
      const W = 512
      const H = 512
      const tex = this.textures.createCanvas('aura', W, H)
      if (!tex) return
      const ctx = tex.getContext()
      if (!ctx) return
      const grd = ctx.createRadialGradient(W / 2, H / 2, W * 0.12, W / 2, H / 2, W * 0.52)
      grd.addColorStop(0, 'rgba(3,3,9,0)')
      grd.addColorStop(0.45, 'rgba(3,3,9,0.18)')
      grd.addColorStop(0.75, 'rgba(2,2,7,0.62)')
      grd.addColorStop(1, 'rgba(1,1,5,0.95)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, W, H)
      tex.refresh()
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
