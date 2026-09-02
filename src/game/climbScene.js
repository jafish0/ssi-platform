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
//   GOLD — positive feelings (hope, joy, courage, calm, pride, gratitude),
//     collected by steering into them. Replaces the old plain oxygen orbs
//     as the Second Wind charge (same collect logic/sound, just labeled).
//   RED — negative feelings, the obstacles. Tap one to fire the climber's
//     Focusing Lens beam at it: enough hits and it shatters, releasing more
//     gold to gather (facing it powers the climb; gold stays the main
//     breath source).
// Tap-vs-drag is disambiguated by total pointer displacement + duration
// (see the pointerdown/pointerup handlers in create()) — steering-by-drag
// is completely unchanged, a tap on a red just additionally fires the beam.
// Art is procedural (Cowork can supply painted feeling art in a follow-up):
// gold motes reuse the existing warm orb art verbatim (it's already
// gold-toned); red gets a red/ember glow texture, same makeGlowTexture()
// approach as the existing ambient motes, just a second color + texture key.
//
// Draft 64 (Josh's review of the live Draft 63 build) revised the reds:
// gold was too small to read its word, so it's now bigger and a little
// slower (ORB_W/GOLD_SPEED). Reds are no longer a random falling swarm --
// one of each negative feeling (RED_WORDS), met one at a time as a single
// big, slow, BLOCKING cloud (RED_CHECKPOINTS schedules them across the
// climb) rather than something you dodge: while one is up, climb progress
// is frozen (not breath drain, not gold spawning) until it's cleared. Taps
// now progressively lighten the cloud and reveal its name underneath
// ("name it to tame it") instead of an instant multi-hit-then-gone; once
// fully cleared it releases real, collectible gold feelings (RED_REWARD_GOLD)
// rather than an instant breath top-up. A stuck player (untouched past
// HINT_DELAY_MS) gets a pulsing tap-ring + a short text nudge on the cloud.
// The old un-blasted-red-hits-the-climber knockback is gone -- reds don't
// approach the climber anymore, they just block until faced.

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
// Draft 64: gold was too small to read its word while falling -- bigger and
// a little slower so it's both legible and catchable.
const ORB_W = 36 // gold-mote width on screen (height derived from its 256×408 art)
const COLLECT_R = 68 // collection radius — forgiving, but you still steer
const GOLD_SPEED = 175 // was 210 -- "slow their fall a little"

// GAINS feeling vocabularies (Ginny/Sprang, 8/31 meeting) — GOLD is what you
// collect, RED is what you blast.
const GOLD_WORDS = ['hope', 'joy', 'courage', 'calm', 'pride', 'gratitude']
const RED_WORDS = [
  'sadness', 'shame', 'guilt', 'anger', 'resentment',
  'helplessness', 'hopelessness', 'regret',
]
// Draft 64: reds are no longer a random falling swarm -- one of each
// negative feeling, met one at a time as a big, slow, BLOCKING cloud rather
// than something you dodge. `RED_CHECKPOINTS` schedules them at fixed climb
// progress (p), spaced out (see the array built below); `RED_TIERS` still
// varies size/hit-count across the sequence ("big ones take a few hits,
// matching their size") without ranking any specific named feeling as worse
// than another -- tiers cycle round-robin over the word list, not tied to
// which word it is.
const RED_TIERS = [
  { scale: 1.0, hits: 3 },
  { scale: 1.3, hits: 4 },
  { scale: 1.6, hits: 5 },
]
const RED_BASE_W = 170 // base cloud width -- "much bigger" than a gold orb
// Spread across the climb so you meet them one/a-few at a time, not at the
// very start or the very end.
const RED_CHECKPOINTS = (() => {
  const start = 0.1
  const end = 0.88
  const step = RED_WORDS.length > 1 ? (end - start) / (RED_WORDS.length - 1) : 0
  return RED_WORDS.map((word, i) => ({
    word,
    p: start + step * i,
    tier: RED_TIERS[i % RED_TIERS.length],
  }))
})()
// How many gold feelings a cleared red releases -- "shatters into gold
// feelings you can gather," a real reward to collect rather than an instant
// top-up.
const RED_REWARD_GOLD = 3
// How long (ms) an untouched blocking red sits before the tap hint appears.
const HINT_DELAY_MS = 2500
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
    // Draft 64: a deep, dusty red -- rendered as an opaque cloud (normal
    // blend, not ADD) so it reads as a dense obstacle against the warm
    // background art instead of blending into it like a light glow would.
    red: 0x8f2e22,
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
      this.motes = [] // falling gold (collectible) feelings
      this.orbCount = 0
      this.feelingsCleared = 0
      this.targetX = GAME_W / 2
      this.frameIdx = 0
      this.frameMs = 0
      this.aura = 0 // 0 = clear edges, 1 = darkness pressed all the way in
      this.onLedge = false
      this.pauseMs = 0 // stage-arrival beat: holds the climb briefly
      // Draft 64: the current blocking red (null = none up right now) and
      // how far through RED_CHECKPOINTS we've gotten.
      this.activeRed = null
      this.nextRedIdx = 0
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
      this.makeCloudTexture(P.red, 'cloud-red')
      this.makeVignetteTexture(P.ink)
      this.makeRingTexture()

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
        callback: () => this.spawnGold(),
      })
      this.time.delayedCall(500, () => this.spawnGold())
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

    spawnGold(x, y) {
      if (this.arrived) return
      const px =
        x != null
          ? x
          : this.reduced
            ? GAME_W / 2 + Phaser.Math.Between(-40, 40)
            : Phaser.Math.Between(this.minX, this.maxX)
      const py = y != null ? y : -50
      const word = Phaser.Utils.Array.GetRandom(GOLD_WORDS)
      const glow = this.add
        .image(0, 0, 'orb')
        .setDisplaySize(ORB_W, ORB_W * (408 / 256))
        .setBlendMode('ADD')
      const label = this.add
        .text(0, ORB_W * 1.1, word, {
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#fff3d0',
          stroke: '#3a2a06',
          strokeThickness: 3,
        })
        .setOrigin(0.5, 0.5)
      const m = this.add.container(px, py, [glow, label]).setDepth(30)
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

    // Draft 64: reds are now scripted, blocking encounters -- one at a time,
    // spaced across RED_CHECKPOINTS (see the constant above). Spawns a big,
    // slow-drifting cloud roughly centered in the lane; `update()` freezes
    // climb progress (not breath drain, not gold spawning) for as long as
    // `this.activeRed` is set.
    spawnRedCheckpoint(entry) {
      const w = RED_BASE_W * entry.tier.scale
      const x = GAME_W / 2
      const y = GAME_H * 0.46
      const glow = this.add.image(0, 0, 'cloud-red').setDisplaySize(w, w)
      const label = this.add
        .text(0, 0, entry.word, {
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          fontSize: '20px',
          fontStyle: 'bold',
          color: '#fff3f0',
          stroke: '#2a0704',
          strokeThickness: 4,
          align: 'center',
        })
        .setOrigin(0.5, 0.5)
        .setAlpha(0) // revealed progressively as the cloud lightens (hitRed)
      const m = this.add.container(x, y, [glow, label]).setDepth(32)
      m.kind = 'red'
      m.word = entry.word
      m.hitsNeeded = entry.tier.hits
      m.hitsTaken = 0
      m.stuckMs = 0
      m.hintRing = null
      m.hintText = null
      if (!this.reduced) {
        this.tweens.add({
          targets: glow,
          y: -8,
          duration: 2200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
        })
      }
      this.activeRed = m
    }

    // Tap-to-target: a tap landing on the active red's cloud registers a hit.
    // No-op otherwise -- a missed tap just nudges the steer target (see the
    // pointerdown handler in create()).
    tryBlast(x, y) {
      if (!this.started || this.arrived || !this.activeRed) return
      const m = this.activeRed
      const cloud = m.list[0]
      const r = cloud.displayWidth / 2 + 20 // a little forgiving beyond the cloud's own edge
      if (Phaser.Math.Distance.Between(x, y, m.x, m.y) < r) this.hitRed(m)
    }

    // "Name it to tame it": each hit lightens the cloud and reveals the
    // feeling's name a little more (surfacing as it clears); the tap hint
    // (if showing) clears on first contact. Once fully cleared it shatters
    // into gold feelings to gather -- see shatterRed.
    hitRed(m) {
      m.hitsTaken += 1
      m.stuckMs = 0
      this.hideStuckHint(m)
      this.fireBeam(m.x, m.y)
      const t = clamp(m.hitsTaken / m.hitsNeeded, 0, 1)
      const cloud = m.list[0]
      const label = m.list[1]
      this.tweens.add({ targets: cloud, alpha: Math.max(0.12, 1 - t), duration: 260, ease: 'Quad.out' })
      this.tweens.add({ targets: label, alpha: t, duration: 260, ease: 'Quad.out' })
      if (m.hitsTaken >= m.hitsNeeded) {
        this.shatterRed(m)
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

    // Facing a feeling turns it to light (on-lore): it shatters into real
    // gold feelings the player collects normally (steering into them, same
    // Second Wind refill) -- the reward IS the gathering, not an instant
    // top-up. Clears the block so climb progress resumes.
    shatterRed(m) {
      if (!this.reduced) {
        const burst = this.add
          .particles(m.x, m.y, 'glow', {
            lifespan: 520,
            speed: { min: 50, max: 140 },
            scale: { start: 0.34, end: 0 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            emitting: false,
          })
          .setDepth(42)
        burst.explode(10 + m.hitsNeeded * 3)
        this.time.delayedCall(700, () => burst.destroy())
      }
      for (let i = 0; i < RED_REWARD_GOLD; i++) {
        const gx = clamp(m.x + Phaser.Math.Between(-70, 70), this.minX, this.maxX)
        const gy = m.y + Phaser.Math.Between(-30, 30)
        this.time.delayedCall(i * 140, () => this.spawnGold(gx, gy))
      }
      this.feelingsCleared += 1
      this.hideStuckHint(m)
      this.removeRedCloud(m)
      this.activeRed = null
    }

    // The "tap me" nudge (Draft 64): shown once an untouched blocking red
    // has sat for HINT_DELAY_MS -- a pulsing ring plus a short text nudge,
    // both cleared the moment the player lands a first hit (see hitRed).
    showStuckHint(m) {
      if (m.hintRing) return
      const ring = this.add
        .image(m.x, m.y, 'tap-ring')
        .setDisplaySize(140, 140)
        .setDepth(33)
        .setAlpha(0.8)
      this.tweens.add({
        targets: ring,
        scale: 1.35,
        alpha: 0,
        duration: 1100,
        repeat: -1,
        ease: 'Sine.out',
      })
      const hint = this.add
        .text(m.x, m.y + 110, 'Tap to focus your lens', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#fff3d0',
          stroke: '#2a1a06',
          strokeThickness: 3,
        })
        .setOrigin(0.5, 0.5)
        .setDepth(33)
        .setAlpha(0)
      this.tweens.add({ targets: hint, alpha: 0.95, duration: 300 })
      m.hintRing = ring
      m.hintText = hint
    }

    hideStuckHint(m) {
      if (m.hintRing) {
        this.tweens.killTweensOf(m.hintRing)
        m.hintRing.destroy()
        m.hintRing = null
      }
      if (m.hintText) {
        this.tweens.killTweensOf(m.hintText)
        m.hintText.destroy()
        m.hintText = null
      }
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

    removeRedCloud(m) {
      m.list.slice().forEach((child) => this.tweens.killTweensOf(child))
      this.tweens.killTweensOf(m)
      m.destroy()
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

        // --- Draft 64: a blocking red feeling in the lane. Spawns the next
        //     scripted checkpoint once progress reaches it (only one active
        //     at a time); freezes forward progress only -- breath still
        //     drains and gold still falls, so there's still something to do
        //     and a reason to hurry while working the lens. ---
        if (
          !this.activeRed &&
          this.nextRedIdx < RED_CHECKPOINTS.length &&
          this.p >= RED_CHECKPOINTS[this.nextRedIdx].p
        ) {
          this.spawnRedCheckpoint(RED_CHECKPOINTS[this.nextRedIdx])
          this.nextRedIdx += 1
        }
        const blocked = !!this.activeRed
        if (blocked) {
          const m = this.activeRed
          if (m.hitsTaken === 0) {
            m.stuckMs += delta
            if (m.stuckMs > HINT_DELAY_MS && !m.hintRing) this.showStuckHint(m)
          }
        }

        // --- Second Wind drains (faster up high), orbs refill it ---
        if (!hold) {
          this.breath = clamp(
            this.breath - STAGES[this.stageIndex].drain * dt,
            0,
            1,
          )
        }

        // --- climb rate: surge after an orb, weary when out of breath.
        //     NEVER zero (unless blocked) — the climb always continues
        //     (no-fail); a blocking red is the one deliberate exception, and
        //     it's always finite (tap it enough and it shatters). ---
        if (this.surgeMs > 0) this.surgeMs -= delta
        let rate = 1
        if (this.surgeMs > 0) rate = 1.5
        else if (this.breath <= 0) rate = 0.55
        else if (this.breath < 0.25) rate = 0.8
        // The stage beat pauses forward progress — finite, so the ascent
        // always resumes and still always completes.
        if (beat) rate = 0
        if (blocked) rate = 0

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

      // --- gold feelings drift down past the climber ---
      const climberY = this.baseY - CLIMB_FIG_H * 0.55
      for (let i = this.motes.length - 1; i >= 0; i--) {
        const m = this.motes[i]
        m.y += GOLD_SPEED * dt
        if (
          !this.arrived &&
          Phaser.Math.Distance.Between(this.climber.x, climberY, m.x, m.y) < COLLECT_R
        ) {
          this.collectGold(m)
          continue
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

    // Draft 64: the blocking red cloud's texture -- a softer-edged, more
    // opaque blob than makeGlowTexture's bright core-and-falloff (that shape
    // is built for an ADD-blended light; this one is drawn NORMAL so it
    // reads as a dense, heavy obstacle instead of glowing light).
    makeCloudTexture(color, key = 'cloud-red') {
      if (this.textures.exists(key)) return
      const R = 100
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      for (let i = 10; i >= 1; i--) {
        g.fillStyle(color, 0.1)
        g.fillCircle(R, R, R * (i / 10))
      }
      g.generateTexture(key, R * 2, R * 2)
      g.destroy()
    }

    // The "tap me" hint ring shown on a big red the player is stuck on -- a
    // simple stroked circle, scaled/faded in a repeating tween (see
    // showStuckHint).
    makeRingTexture() {
      if (this.textures.exists('tap-ring')) return
      const R = 64
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      g.lineStyle(6, 0xfff3d0, 0.9)
      g.strokeCircle(R, R, R - 6)
      g.generateTexture('tap-ring', R * 2, R * 2)
      g.destroy()
    }
  }
}
