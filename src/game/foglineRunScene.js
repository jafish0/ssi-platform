// "The Fogline Runner" -- Zone 2's exit into Zone 3 (GAINS Draft 98).
//
// Replaces the drag-the-lens Fogline (Draft 95): that traversal played too
// much like The First Light and framed the Focusing Lens as a magnifier
// instead of the aimed beam the Ascent already established. This is an
// auto-runner instead -- the Traveler runs in place at a fixed screen x
// while the world scrolls left under her. One input: tap to jump (hold
// longer to jump higher), and when a fog wall enters the "lens window"
// a few body-lengths ahead, the SAME press-and-hold instead activates the
// Focusing Lens (a beam from the lantern that thins the fog over ~0.9s,
// shrinking the looming shape inside down to the ordinary object it always
// was). Nothing here can end the run: an unactivated wall just stumbles you
// to a stop (hold the lens to clear it and resume), and a missed gap has
// Spark swoop down and lift you back onto the trail.
//
// Unlike the old Fogline (whose interesting bits lived in a DOM layer above
// a nearly-static Phaser scene, see the deleted FoglineTraversal.jsx), EVERY
// mechanic here is native Phaser: parallax scroll, a hand-rolled jump arc
// (no other traversal scene in this codebase uses Arcade Physics, so this
// one doesn't either -- see `updatePlayerVertical`), fog walls, motes, the
// beam. VO is still host-owned (through zoneAudio's
// speak/duck, so it can duck the host's own music/ambience) -- this scene
// only asks for a cue by name via `cfg.onEvent({type:'cue', name})`; simple
// one-shot SFX (jump/land/stumble/mote/gap-whoosh) are scene-local, same
// split the old fogline scene used for its own sfx vs. host VO.

const FRAME_W = 1080
const FRAME_H = 1920
const RUN_SPEED = 380 // px/s the world scrolls left under the fixed Traveler
const TRAIL_Y = 1150 // where the trail's walking surface sits (feet level)
const PLAYER_X = 300 // the Traveler's fixed screen x
const TRAVELER_H = 160 // display height (~1/12 of frame height)

const GRAVITY_Y = 2600
const JUMP_V0 = 620 // base upward speed on any tap (clears the ~180-220px gaps)
const HOLD_MAX_MS = 250 // "Mario Run" hold window: keep lifting for up to this long
const HOLD_GRAVITY_SCALE = 0.32 // gravity is cut to this fraction while boosting
const COYOTE_MS = 100
const INPUT_BUFFER_MS = 100

const LENS_WINDOW_PX = 640 // ~4 body-lengths ahead: the window a wall enters
const WALL_HALF_W = 180 // fog column is ~360px wide
const ACTIVATE_MS = 900 // hold-to-clear duration once the lens is engaged
const STUMBLE_OBSTACLE_MS = 600
const STUMBLE_EASE_IN_MS = 400 // resuming scroll after a fog stumble clears
const GAP_DOWN_MS = 400
const GAP_UP_MS = 500
const WHOOP_MAX = 2
const MOTE_NOTCH_CAP = 6

// Where the beam originates -- the lantern at the Traveler's hand, roughly
// chest height and slightly ahead of her screen-fixed body center.
const BEAM_ORIGIN_X = PLAYER_X + 40
const BEAM_ORIGIN_Y = TRAIL_Y - 90

const RUN_FRAME_MS = 1000 / 14 // ~14fps run cycle
// t2r-01-start's own runtime (~9.7s) -- the scene has no channel to learn
// when the HOST's speak() promise resolves (VO is host-owned so it can
// duck the host's music/ambience), so the opening freeze is timed against
// the known clip length instead of a round-trip signal.
const INTRO_VO_MS = 9700
const AUTO_VAULT_H = 60 // obstacles shorter than this are cosmetic (skip anim only)

// Display heights (props/obstacles get their width from their own aspect
// ratio scaled to this height); hitboxes are 20% smaller than the art per
// the asset manifest.
const DISPLAY_H = {
  log: 110,
  boulder: 120,
  bush: 120,
  stump: 130,
  signpost: 200,
}
const HITBOX_SHRINK = 0.8

// Looming-shape sizes inside each fog wall (width x height, logical px).
const SHAPE_SIZE = {
  hunched: { w: 260, h: 200 },
  tall: { w: 120, h: 420 },
  wide: { w: 380, h: 150 },
  big: { w: 320, h: 360 },
  none: null,
}

// The level, transcribed from Draft 98's beat sheet. `x` is world position
// in px along the ~23,200px trail. Walls reveal into a prop on the SAME
// world x (the "wall(12800, wide, log)" case: the revealed log is ALSO a
// jump obstacle once uncovered, added here as its own obstacle entry so the
// generic obstacle-collision path handles it with no special case).
const LEVEL = {
  gaps: [
    { x: 1400, w: 200 },
    { x: 4600, w: 220 },
    { x: 6700, w: 240 },
    { x: 9900, w: 260 },
    { x: 10700, w: 240 },
    { x: 15100, w: 280 },
    { x: 19200, w: 240 },
    { x: 20300, w: 260 },
    { x: 21300, w: 300 },
  ],
  obstacles: [
    { x: 2300, kind: 'log' },
    { x: 5900, kind: 'log' },
    { x: 9200, kind: 'boulder' },
    { x: 12980, kind: 'log' }, // the log revealed by wall 3, jumped right after
    { x: 14200, kind: 'log' },
  ],
  walls: [
    { x: 3200, shape: 'hunched', prop: 'bush', first: true },
    { x: 7800, shape: 'tall', prop: 'stump' },
    { x: 12800, shape: 'wide', prop: 'log' },
    { x: 17800, shape: 'big', prop: 'signpost' },
    { x: 22600, shape: 'none', prop: null, last: true },
  ],
  motes: [
    { x: 600, n: 5, pattern: 'line' },
    { x: 2700, n: 5, pattern: 'arc' },
    { x: 5200, n: 6, pattern: 'arc' },
    { x: 11400, n: 7, pattern: 'arc-high' },
    { x: 15900, n: 6, pattern: 'line' },
    { x: 19700, n: 4, pattern: 'arc' },
    { x: 20800, n: 4, pattern: 'arc' },
  ],
  arriveX: 23200,
  finalStretchX: 19000, // whoop line eligibility begins here
}

export function makeFoglineRunScene(Phaser) {
  return class FoglineRunScene extends Phaser.Scene {
    constructor() {
      super('FoglineRun')
    }

    init() {
      this.cfg = this.registry.get('traversalConfig') || {}
      this.reduced = !!this.cfg.reducedMotion
      this.started = false
      this.beginRequested = false
      this.scrollX = 0
      this.state = 'run' // run | jump | stumble-obstacle | stumble-fog | gap-fall | gap-rescue
      this.grounded = true
      this.airborneSinceGroundMs = 0 // coyote timer
      this.bufferedJumpMs = -1 // input buffer (negative = none pending)
      this.pointerDown = false
      this.lensWindowActive = false
      this.activatingLens = false
      this.activeWall = null
      this.nextWallIdx = 0
      this.moteNotches = 0
      this.motesCollected = 0
      this.totalMotes = LEVEL.motes.reduce((n, g) => n + g.n, 0)
      this.wallsClearedAhead = 0
      this.firstJumpFired = false
      this.firstStumbleFired = false
      this.shrinkCount = 0
      this.whoopCount = 0
      this.arrived = false
      this.runFrame = 0
      this.runFrameMs = 0
      this.holdBoostMs = 0
      this.resumeEase = 0
    }

    preload() {
      const c = this.cfg
      const load = (key, url) => {
        if (url) this.load.image(key, url)
      }
      load('bg-sky', c.skyUrl)
      load('bg-far', c.farUrl)
      load('bg-ridge', c.ridgeUrl)
      load('bg-trail', c.trailUrl)
      Object.entries(c.runUrls || {}).forEach(([k, url]) => load(`run-${k}`, url))
      Object.entries(c.jumpUrls || {}).forEach(([k, url]) => load(`jump-${k}`, url))
      Object.entries(c.stumbleUrls || {}).forEach(([k, url]) => load(`stumble-${k}`, url))
      load('activate', c.activateUrl)
      Object.entries(c.propUrls || {}).forEach(([k, url]) => load(`prop-${k}`, url))
      load('mistfields', c.mistfieldsUrl)
      ;(c.sparkUrls || []).forEach((url, i) => load(`spark-${i + 1}`, url))
      Object.entries(c.sfxUrls || {}).forEach(([k, url]) => {
        if (url) this.load.audio(`frun-sfx-${k}`, url)
      })
      this.load.on('loaderror', (file) => {
        // eslint-disable-next-line no-console
        console.warn('[FoglineRun] failed to load', file.key, file.url)
      })
    }

    create() {
      this.cameras.main.setBackgroundColor('#0b1220')
      this.makeTextures()
      this.buildParallax()
      this.buildTrailAndGaps()
      this.buildObstacles()
      this.buildWalls()
      this.buildMotes()
      this.buildPlayer()
      this.buildSpark()
      this.buildBeamGraphics()
      this.buildMistfieldsReveal()
      this.setupInput()
      this.ready = true
      // `started` (below) only means "Begin was tapped" -- the actual go
      // signal waits for the intro line, requested in update() the moment
      // that happens (never here at create(), which runs at PAGE LOAD
      // before any user gesture; the host's speak() would just be blocked
      // by autoplay policy this early anyway).
    }

    // ---- procedural textures (glow dot for motes/beam bloom, dust puff) ----
    makeTextures() {
      if (!this.textures.exists('frun-glow')) {
        const g = this.make.graphics({ add: false })
        g.fillStyle(0xfff3d0, 1)
        g.fillCircle(16, 16, 16)
        g.generateTexture('frun-glow', 32, 32)
        g.destroy()
      }
      if (!this.textures.exists('frun-dust')) {
        const g = this.make.graphics({ add: false })
        g.fillStyle(0xd8c9a8, 1)
        g.fillCircle(6, 6, 6)
        g.generateTexture('frun-dust', 12, 12)
        g.destroy()
      }
    }

    // ---- parallax background: sky is static, far/ridge/trail scroll at
    // 0.15/0.45/1.0 of run speed. Each scrolling layer mirror-tiles (A,
    // flipped-A, A, ...) so a non-seamless source texture shows no hard
    // seam -- a recycled pool of Image tiles, alternating flipX by tile
    // INDEX so it stays consistent regardless of scroll position. ----
    buildParallax() {
      if (this.textures.exists('bg-sky')) {
        this.add.image(FRAME_W / 2, FRAME_H / 2, 'bg-sky').setDisplaySize(FRAME_W, FRAME_H).setDepth(0)
      }
      // Far mountains and the ridge are bottom-anchored (their own art ends
      // at its base, "vanishing" behind the next layer down). The trail is
      // TOP-anchored instead: its walking surface is only ~70px below the
      // art's own top edge, with a tall rocky cliff-face painted below that
      // -- anchoring by its bottom would put the Traveler waist-deep in
      // that cliff face instead of standing on the path.
      this.far = this.makeScrollLayer('bg-far', 0.15, 1, { originY: 1, anchorY: 1150 })
      this.ridge = this.makeScrollLayer('bg-ridge', 0.45, 2, { originY: 1, anchorY: 1180 })
      this.trailLayer = this.makeScrollLayer('bg-trail', 1.0, 3, { originY: 0, anchorY: TRAIL_Y - 70 })
    }

    makeScrollLayer(key, factor, depth, { originY, anchorY }) {
      if (!this.textures.exists(key)) return { factor, tiles: [], update() {} }
      const src = this.textures.get(key).getSourceImage()
      const tileW = src.width
      const count = Math.ceil(FRAME_W / tileW) + 3
      const tiles = []
      for (let i = 0; i < count; i++) {
        const img = this.add
          .image(i * tileW, anchorY, key)
          .setOrigin(0, originY)
          .setFlipX(i % 2 === 1)
          .setDepth(depth)
        tiles.push(img)
      }
      return {
        factor,
        tiles,
        tileW,
        update: (scrollX) => {
          const layerScroll = scrollX * factor
          tiles.forEach((img, i) => {
            let x = i * tileW - layerScroll
            // Recycle: once a tile is fully off the left edge, hop it to
            // the far right of the visible pool (keeps the flipX parity
            // tied to its ORIGINAL index, not its current slot, so the
            // mirrored A/flipped-A/A rhythm never breaks).
            const wrapped = Phaser.Math.Wrap(x, -tileW, (count - 1) * tileW)
            img.x = wrapped
          })
        },
      }
    }

    // ---- trail surface + visible gaps. The trail texture scrolls exactly
    // like the other layers (factor 1.0, already built above); gaps are
    // drawn as separate dark fill rectangles placed at their fixed world
    // positions so the ground visibly breaks open rather than just being
    // an invisible collision zone. ----
    buildTrailAndGaps() {
      this.gapFills = LEVEL.gaps.map((g) => {
        const rect = this.add
          .rectangle(g.x + g.w / 2, TRAIL_Y + 60, g.w + 8, FRAME_H - TRAIL_Y - 60 + 40, 0x05070d, 1)
          .setOrigin(0.5, 0)
          .setDepth(4)
        return { ...g, obj: rect }
      })
    }

    buildObstacles() {
      this.obstacles = LEVEL.obstacles.map((o) => {
        const key = `prop-${o.kind}`
        const targetH = DISPLAY_H[o.kind] || 100
        const img = this.textures.exists(key)
          ? this.add.image(o.x, TRAIL_Y, key).setOrigin(0.5, 1)
          : this.add.rectangle(o.x, TRAIL_Y, targetH, targetH, 0x2a3550).setOrigin(0.5, 1)
        const srcH = img.height || targetH
        const scale = targetH / srcH
        img.setScale(scale)
        img.setDepth(6)
        const w = (img.width || targetH) * scale
        return { ...o, obj: img, h: targetH, w, cleared: false }
      })
    }

    buildWalls() {
      this.walls = LEVEL.walls.map((w) => {
        const col = this.add
          .rectangle(w.x, TRAIL_Y - 250, WALL_HALF_W * 2, 620, 0xcdd6e6, 0.92)
          .setOrigin(0.5, 1)
          .setDepth(20)
        col.setBlendMode(Phaser.BlendModes.NORMAL)
        let shapeObj = null
        const size = SHAPE_SIZE[w.shape]
        if (size) {
          shapeObj = this.add
            .ellipse(w.x, TRAIL_Y, size.w, size.h, 0x0c1220, 0.72)
            .setOrigin(0.5, 1)
            .setDepth(21)
        }
        let propObj = null
        if (w.prop) {
          const key = `prop-${w.prop}`
          const targetH = DISPLAY_H[w.prop] || 120
          propObj = this.textures.exists(key)
            ? this.add.image(w.x, TRAIL_Y, key).setOrigin(0.5, 1)
            : this.add.rectangle(w.x, TRAIL_Y, targetH, targetH, 0x2a3550).setOrigin(0.5, 1)
          const srcH = propObj.height || targetH
          propObj.setScale(targetH / srcH)
          propObj.setDepth(19)
          propObj.setAlpha(0)
        }
        return { ...w, col, shapeObj, propObj, cleared: false, beamProgress: 0 }
      })
    }

    buildMotes() {
      this.motes = []
      LEVEL.motes.forEach((group) => {
        for (let i = 0; i < group.n; i++) {
          const t = group.n > 1 ? i / (group.n - 1) : 0
          let dx = t * 260
          let dy
          if (group.pattern === 'line') dy = -40
          else if (group.pattern === 'arc') dy = -180 * Math.sin(t * Math.PI) - 40
          else dy = -320 * Math.sin(t * Math.PI) - 60 // arc-high
          const x = group.x + dx
          const y = TRAIL_Y + dy
          const img = this.add.image(x, y, 'frun-glow').setDisplaySize(20, 20).setDepth(15).setBlendMode(Phaser.BlendModes.ADD)
          this.motes.push({ x, y, obj: img, collected: false })
        }
      })
    }

    // No other traversal scene in this codebase uses Phaser's Arcade
    // Physics plugin (the shared Phaser.Game config in TraversalGame.jsx
    // doesn't enable it), so the jump arc is hand-rolled: `this.playerVY`
    // integrates against `this.playerGravity` each frame in
    // `updatePlayerVertical()`, same manual-kinematics style as
    // `climbScene.js`'s falling feelings.
    buildPlayer() {
      this.player = this.add.sprite(PLAYER_X, TRAIL_Y, 'run-1')
      this.player.setOrigin(0.5, 1)
      this.player.setDepth(30)
      this.applyPlayerScale()
      this.playerVY = 0
    }

    applyPlayerScale() {
      const srcH = this.player.height || TRAVELER_H
      this.player.setScale(TRAVELER_H / srcH)
    }

    setPlayerTexture(key) {
      if (this.textures.exists(key) && this.player.texture.key !== key) {
        this.player.setTexture(key)
        this.applyPlayerScale()
      }
    }

    buildSpark() {
      const hasSpark = this.textures.exists('spark-1')
      this.spark = this.add.image(420, 700, hasSpark ? 'spark-1' : 'frun-glow').setDepth(35)
      if (!hasSpark) this.spark.setDisplaySize(70, 70).setTint(0xffe9c2)
      else this.spark.setDisplaySize(90, 90)
      this.sparkT = 0
      this.sparkFlickerFrame = 1
      this.sparkFlickerMs = 0
    }

    buildBeamGraphics() {
      this.beam = this.add.graphics().setDepth(50)
      this.lensGlyph = this.add
        .image(BEAM_ORIGIN_X, BEAM_ORIGIN_Y, this.textures.exists('activate') ? 'activate' : 'frun-glow')
        .setDisplaySize(48, 48)
        .setDepth(36)
        .setAlpha(0)
      // The lantern glow at the Traveler's hand brightens a notch per mote
      // collected (no HUD is on screen during the run to show it any other
      // way -- this scene fully replaces the walkable-zone stage).
      this.lanternGlow = this.add
        .image(BEAM_ORIGIN_X, BEAM_ORIGIN_Y, 'frun-glow')
        .setDepth(34)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDisplaySize(18, 18)
        .setAlpha(0.25)
    }

    // Wall 5 clearing reveals the Mistfields (Zone 3's own map plate) rather
    // than a prop -- placed behind everything, faded in as the fog opens.
    buildMistfieldsReveal() {
      if (!this.textures.exists('mistfields')) return
      this.mistfields = this.add.image(FRAME_W / 2, FRAME_H / 2, 'mistfields').setDepth(1).setAlpha(0)
      const src = this.textures.get('mistfields').getSourceImage()
      const k = Math.max(FRAME_W / src.width, FRAME_H / src.height)
      this.mistfields.setScale(k)
    }

    setupInput() {
      this.input.on('pointerdown', () => this.onPress())
      this.input.on('pointerup', () => this.onRelease())
      this.input.on('pointerupoutside', () => this.onRelease())
    }

    onPress() {
      if (!this.started) return
      this.pointerDown = true
      if (this.lensWindowActive && this.activeWall) {
        this.activatingLens = true
        return
      }
      if (this.state === 'stumble-fog' && this.activeWall) {
        this.activatingLens = true
        return
      }
      // Jump (grounded, or within coyote time; otherwise buffer it briefly
      // so an early tap right before landing isn't dropped).
      const canJump = this.state === 'run' && (this.grounded || this.airborneSinceGroundMs <= COYOTE_MS)
      if (canJump) this.beginJump()
      else if (this.state === 'jump') this.bufferedJumpMs = 0
    }

    onRelease() {
      this.pointerDown = false
      // Releasing mid-activation freezes progress rather than resetting it
      // -- "hold again and it continues" (Draft 98 §2).
      this.activatingLens = false
    }

    beginJump() {
      this.state = 'jump'
      this.grounded = false
      this.playerVY = -JUMP_V0
      this.holdBoostMs = 0
      this.setPlayerTexture('jump-takeoff')
      this.playSfx('jump')
      if (!this.firstJumpFired) {
        this.firstJumpFired = true
        this.emitCue('first-jump')
      }
      if (this.scrollX + PLAYER_X >= LEVEL.finalStretchX && this.whoopCount < WHOOP_MAX && Math.random() < 0.4) {
        this.whoopCount += 1
        this.emitCue('whoop')
      }
    }

    landFromJump() {
      this.state = 'run'
      this.grounded = true
      this.airborneSinceGroundMs = 0
      this.setPlayerTexture('jump-land')
      this.time.delayedCall(90, () => {
        if (this.state === 'run') this.setPlayerTexture('run-1')
      })
    }

    // ---- fog-wall stumble / lens-activate ----
    beginStumble(kind, wall) {
      this.state = kind === 'fog' ? 'stumble-fog' : 'stumble-obstacle'
      this.grounded = true
      this.playerVY = 0
      this.player.y = TRAIL_Y
      if (kind === 'fog') {
        this.activeWall = wall
        this.setPlayerTexture('stumble-trip')
        this.time.delayedCall(280, () => {
          if (this.state === 'stumble-fog') this.setPlayerTexture('stumble-catch')
        })
        if (!this.firstStumbleFired) {
          this.firstStumbleFired = true
          this.emitCue('stumble')
        }
        // Reduced motion (Draft 98 §6): no desaturate on stumble.
        if (!this.reduced) this.desaturate(true)
      } else {
        this.setPlayerTexture('stumble-trip')
        this.playSfx('stumble', { rate: 0.8 })
        this.time.delayedCall(220, () => this.setPlayerTexture('stumble-catch'))
        this.time.delayedCall(STUMBLE_OBSTACLE_MS, () => this.resumeFromObstacleStumble())
      }
    }

    resumeFromObstacleStumble() {
      if (this.state !== 'stumble-obstacle') return
      this.state = 'run'
      this.setPlayerTexture('run-1')
      this.resumeEase = STUMBLE_EASE_IN_MS
    }

    desaturate(on) {
      // A light, reversible grey -- no pipeline dependency, just a tint on
      // the whole scene's camera.
      this.cameras.main.setAlpha(1)
      if (on) this.cameras.main.setBackgroundColor('#1c2230')
      else this.cameras.main.setBackgroundColor('#0b1220')
    }

    // ---- gap fall / rescue ----
    beginGapFall() {
      this.state = 'gap-fall'
      this.grounded = false
      this.playerVY = 0
      this.setPlayerTexture('run-1')
      this.tweens.add({
        targets: this.player,
        y: TRAIL_Y + 260,
        duration: GAP_DOWN_MS,
        ease: 'Sine.in',
        onComplete: () => this.beginGapRescue(),
      })
    }

    beginGapRescue() {
      this.state = 'gap-rescue'
      this.emitCue('gap-rescue')
      this.playSfx('whoosh')
      const sparkHomeY = this.spark.y
      this.tweens.add({ targets: this.spark, y: sparkHomeY - 260, duration: GAP_DOWN_MS * 0.6 })
      // Find the gap the player is currently inside so the resume point is
      // just past its right edge, not wherever they happened to fall.
      const worldX = this.scrollX + PLAYER_X
      const gap = this.gapFills.find((g) => worldX >= g.x - 20 && worldX <= g.x + g.w + 20)
      const resumeShift = gap ? gap.x + gap.w + 40 - worldX : 0
      this.tweens.add({
        targets: this.player,
        y: TRAIL_Y,
        duration: GAP_UP_MS,
        ease: 'Sine.out',
        onComplete: () => {
          this.scrollX += resumeShift
          this.state = 'run'
          this.grounded = true
        },
      })
      this.tweens.add({
        targets: this.spark,
        y: sparkHomeY,
        duration: GAP_UP_MS,
        delay: GAP_DOWN_MS * 0.6,
      })
    }

    // ---- lens activation progress (per-wall, persists across releases) ----
    updateLensActivation(delta) {
      const wall = this.activeWall
      if (!wall || !this.activatingLens) return
      wall.beamProgress = Math.min(ACTIVATE_MS, wall.beamProgress + delta)
      const t = wall.beamProgress / ACTIVATE_MS
      this.drawBeam(t)
      if (t >= 1) this.clearWall(wall)
    }

    drawBeam(t) {
      this.beam.clear()
      if (t <= 0) return
      const sx = BEAM_ORIGIN_X
      const sy = BEAM_ORIGIN_Y
      const wall = this.activeWall
      if (!wall) return
      const tx = wall.x - this.scrollX
      const ty = TRAIL_Y - 120
      const ex = sx + (tx - sx) * Math.min(1, t * 1.15)
      const ey = sy + (ty - sy) * Math.min(1, t * 1.15)
      this.beam.lineStyle(9, 0xfff3d0, 0.28)
      this.beam.beginPath()
      this.beam.moveTo(sx, sy)
      this.beam.lineTo(ex, ey)
      this.beam.strokePath()
      this.beam.lineStyle(4, 0xfff3d0, 0.95)
      this.beam.beginPath()
      this.beam.moveTo(sx, sy)
      this.beam.lineTo(ex, ey)
      this.beam.strokePath()
    }

    clearWall(wall) {
      wall.cleared = true
      this.activatingLens = false
      this.activeWall = null
      this.lensWindowActive = false
      this.lensGlyph.setAlpha(0)
      this.beam.clear()
      const wasStumbled = this.state === 'stumble-fog'
      if (!wasStumbled) {
        this.wallsClearedAhead += 1
        if (this.wallsClearedAhead === 1) this.emitCue('clear-ahead')
      }
      if (wall.shapeObj) {
        this.tweens.add({ targets: wall.shapeObj, alpha: 0, scale: wall.shapeObj.scale * 1.15, duration: 420, ease: 'Sine.out' })
      }
      this.tweens.add({ targets: wall.col, alpha: 0, duration: 520, ease: 'Sine.out' })
      if (wall.propObj) {
        wall.propObj.setScale(wall.propObj.scale * 1.6)
        this.tweens.add({ targets: wall.propObj, alpha: 1, scale: wall.propObj.scale / 1.6, duration: 480, ease: 'Back.out' })
      }
      this.shrinkCount += 1
      if (this.shrinkCount === 1) this.emitCue('shrink-1')
      else if (this.shrinkCount === 2) this.emitCue('shrink-2')
      else this.playSfx('mote')
      if (wall.last) {
        this.beginArrive()
        return
      }
      if (wasStumbled) {
        this.state = 'run'
        this.grounded = true
        this.playerVY = 0
        // Ease back into the scroll rather than snapping to full speed.
        this.resumeEase = STUMBLE_EASE_IN_MS
      }
      this.desaturate(false)
    }

    beginArrive() {
      this.arrived = true
      this.state = 'arrive'
      this.emitCue('arrive')
      if (this.mistfields) {
        this.tweens.add({ targets: this.mistfields, alpha: 1, duration: 1600 })
      }
      const layersToFade = [this.far, this.ridge].filter(Boolean)
      layersToFade.forEach((l) => l.tiles.forEach((img) => this.tweens.add({ targets: img, alpha: 0, duration: 1800 })))
      this.tweens.add({ targets: this.player, x: this.player.x + 40, duration: 1800, onComplete: () => this.setPlayerTexture('run-1') })
      this.time.delayedCall(2200, () => {
        this.cfg.onComplete?.({ motesCollected: this.motesCollected, totalMotes: this.totalMotes })
      })
    }

    // ---- per-frame ----
    update(time, delta) {
      if (!this.ready) return
      // "Begin" tapped: request the opening line, then hold the world
      // frozen for its own length before the run actually starts (Draft 98
      // §4: "on mount, world frozen, run starts on its end").
      if (!this.beginRequested && this.registry.get('traversalStarted')) {
        this.beginRequested = true
        this.emitCue('start')
        this.time.delayedCall(INTRO_VO_MS, () => {
          this.started = true
        })
      }
      if (!this.started || this.arrived) return

      // Clamp: a backgrounded tab (or a slow device hitching) can hand a
      // single frame a huge `delta`, and at 380px/s world scroll a large
      // enough one-frame jump can tunnel straight through an obstacle's
      // hitbox without the per-frame collision check ever sampling inside
      // it. 50ms is generous (still fine at 20fps) and keeps the world's
      // physics deterministic regardless of frame timing.
      const dt = Math.min(delta, 50)

      // Advance the scroll unless something is holding it (a jump doesn't
      // stop the world; both stumble kinds and a gap fall/rescue do, then
      // ease back in via `resumeEase`).
      const scrolling =
        this.state !== 'stumble-fog' &&
        this.state !== 'stumble-obstacle' &&
        this.state !== 'gap-fall' &&
        this.state !== 'gap-rescue'
      if (scrolling) {
        let speed = RUN_SPEED
        if (this.resumeEase) {
          const k = Math.max(0, this.resumeEase - dt) / STUMBLE_EASE_IN_MS
          speed = RUN_SPEED * (1 - k)
          this.resumeEase = Math.max(0, this.resumeEase - dt)
        }
        this.scrollX += (speed * dt) / 1000
      }

      // Reduced motion (Draft 98 §6): only the trail scrolls -- the two
      // parallax layers behind it hold still instead of drifting.
      if (!this.reduced) {
        this.far?.update(this.scrollX)
        this.ridge?.update(this.scrollX)
      }
      this.trailLayer?.update(this.scrollX)

      const worldX = this.scrollX + PLAYER_X

      this.updatePlayerVertical(dt)
      this.updateGroundCollision(worldX)
      this.updateWalls(worldX)
      this.updateMotes(worldX)
      this.updateRunAnimation(dt)
      this.updateSpark()
      this.updateLensActivation(dt)

      // Coyote/buffer bookkeeping.
      if (!this.grounded) this.airborneSinceGroundMs += dt
      if (this.bufferedJumpMs >= 0) {
        this.bufferedJumpMs += dt
        if (this.bufferedJumpMs > INPUT_BUFFER_MS) this.bufferedJumpMs = -1
        else if (this.grounded) {
          this.beginJump()
          this.bufferedJumpMs = -1
        }
      }
    }

    // Manual jump-arc integrator (no Arcade Physics body -- see buildPlayer).
    // Only 'jump' and 'gap-fall' move the player vertically here; 'run' and
    // both stumble states hold y pinned at TRAIL_Y, and 'gap-rescue' is
    // driven entirely by its own tweens.
    updatePlayerVertical(dt) {
      if (this.state !== 'jump') return
      this.holdBoostMs += dt
      const boosting = this.pointerDown && this.holdBoostMs <= HOLD_MAX_MS && this.playerVY < 0
      const g = boosting ? GRAVITY_Y * HOLD_GRAVITY_SCALE : GRAVITY_Y
      this.playerVY += (g * dt) / 1000
      this.player.y += (this.playerVY * dt) / 1000
      if (this.playerVY > 0) this.setPlayerTexture('jump-apex')
    }

    updateGroundCollision(worldX) {
      if (this.state === 'gap-fall' || this.state === 'gap-rescue') return
      const overGap = this.gapFills.some((g) => worldX >= g.x - 4 && worldX <= g.x + g.w + 4)
      if (this.player.y >= TRAIL_Y) {
        if (overGap && this.state !== 'stumble-obstacle' && this.state !== 'stumble-fog') {
          this.beginGapFall()
          return
        }
        if (!overGap) {
          this.player.y = TRAIL_Y
          if (this.state === 'jump') {
            this.playerVY = 0
            this.landFromJump()
          }
        }
      }
      // Checked in both 'run' (never jumped) and 'jump' (jumped too early or
      // too late) states -- the height test alone tells us whether the
      // Traveler is clear, whichever state got her to this world position.
      if ((this.state === 'run' || this.state === 'jump') && !overGap) {
        for (const o of this.obstacles) {
          if (o.cleared) continue
          const half = (o.w * HITBOX_SHRINK) / 2
          if (worldX >= o.x - half && worldX <= o.x + half) {
            if (o.h < AUTO_VAULT_H) {
              o.cleared = true
              continue
            }
            const clearedHeight = this.player.y <= TRAIL_Y - o.h * HITBOX_SHRINK
            if (clearedHeight) {
              o.cleared = true
            } else if (this.state === 'run') {
              // Only a grounded approach stumbles outright -- a jump still
              // rising toward clearance gets to keep trying each frame.
              o.cleared = true
              this.beginStumble('obstacle', null)
            }
          }
        }
      }
    }

    updateWalls(worldX) {
      // Advance to the next uncleared wall as earlier ones fall behind.
      while (this.nextWallIdx < this.walls.length && this.walls[this.nextWallIdx].cleared && worldX > this.walls[this.nextWallIdx].x + 200) {
        this.nextWallIdx += 1
      }
      const wall = this.walls[this.nextWallIdx]
      if (!wall) {
        this.lensWindowActive = false
        return
      }
      const leftEdge = wall.x - WALL_HALF_W
      const dist = leftEdge - worldX
      if (!wall.cleared && dist <= LENS_WINDOW_PX && dist > -WALL_HALF_W) {
        if (!this.lensWindowActive || this.activeWall !== wall) {
          this.lensWindowActive = true
          this.activeWall = wall
          this.lensGlyph.setAlpha(1)
          if (wall.first) this.emitCue('fog-ahead')
          else this.playSfx('chime')
        }
      }
      if (wall.last && this.lensWindowActive && this.activeWall === wall && !wall.calledLast) {
        wall.calledLast = true
        this.emitCue('final-wall')
      }
      if (
        !wall.cleared &&
        this.state !== 'stumble-fog' &&
        this.state !== 'gap-fall' &&
        this.state !== 'gap-rescue' &&
        worldX >= leftEdge
      ) {
        this.beginStumble('fog', wall)
      }
    }

    updateMotes(worldX) {
      for (const m of this.motes) {
        if (m.collected) continue
        const screenX = m.x - this.scrollX
        const dx = screenX - PLAYER_X
        const dy = m.y - this.player.y
        if (Math.abs(dx) < 60 && Math.abs(dy) < 140) {
          m.collected = true
          this.motesCollected += 1
          this.tweens.add({ targets: m.obj, alpha: 0, scale: 1.8, duration: 240, onComplete: () => m.obj.destroy() })
          if (this.moteNotches < MOTE_NOTCH_CAP) {
            this.moteNotches += 1
            this.emit('mote-notch', { count: this.moteNotches })
            const k = this.moteNotches / MOTE_NOTCH_CAP
            this.tweens.add({
              targets: this.lanternGlow,
              alpha: 0.25 + k * 0.55,
              displayWidth: 18 + k * 22,
              displayHeight: 18 + k * 22,
              duration: 260,
              ease: 'Sine.out',
            })
          }
          this.playSfx('mote')
        }
      }
    }

    updateRunAnimation(dt) {
      if (this.state !== 'run') return
      this.runFrameMs += dt
      if (this.runFrameMs >= RUN_FRAME_MS) {
        this.runFrameMs = 0
        this.runFrame = (this.runFrame % 8) + 1
        this.setPlayerTexture(`run-${this.runFrame}`)
      }
    }

    // Spark drifts in a slow figure-eight above and ahead of the Traveler,
    // well clear of the action; dips down only for the gap-rescue tween
    // (handled separately in beginGapRescue).
    updateSpark() {
      if (this.state === 'gap-fall' || this.state === 'gap-rescue') return
      this.sparkT += 0.001 * 16
      const bx = 420
      const by = 700
      this.spark.x = bx + Math.sin(this.sparkT * 0.6) * 60
      this.spark.y = by + Math.sin(this.sparkT * 1.2) * 34
      if (this.textures.exists('spark-1')) {
        this.sparkFlickerMs += 16
        if (this.sparkFlickerMs > 220) {
          this.sparkFlickerMs = 0
          this.sparkFlickerFrame = (this.sparkFlickerFrame % 4) + 1
          if (this.textures.exists(`spark-${this.sparkFlickerFrame}`)) this.spark.setTexture(`spark-${this.sparkFlickerFrame}`)
        }
      }
    }

    // ---- host callbacks ----
    emit(type, extra) {
      try {
        this.cfg.onEvent?.({ type, ...extra })
      } catch {
        /* a listener error should never break the run */
      }
    }

    emitCue(name) {
      this.emit('cue', { name })
    }

    playSfx(key, opts) {
      const soundKey = `frun-sfx-${key}`
      if (this.cache.audio.exists(soundKey)) {
        this.sound.play(soundKey, { volume: 0.55, ...opts })
      }
    }
  }
}
