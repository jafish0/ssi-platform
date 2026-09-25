// "The Fogline Runner" -- Zone 2's exit into Zone 3 (GAINS Draft 98).
//
// Replaces the drag-the-lens Fogline (Draft 95): that traversal played too
// much like The First Light and framed the Focusing Lens as a magnifier
// instead of the aimed beam the Ascent already established. This is an
// auto-runner instead -- the Traveler runs in place at a fixed screen x
// while the world scrolls left under her. Tap to jump (hold longer to jump
// higher). Each fog wall brings the world to a full stop before she ever
// reaches it (Draft 102 #2 -- she can no longer collide with fog at all);
// a single tap then activates the Focusing Lens, growing a beam from the
// lantern to the wall over ~0.9s that thins the fog and reveals the
// ordinary object it always was, then the run eases back in. A missed gap
// has Spark swoop down and lift the Traveler back onto the trail.
//
// Unlike the old Fogline (whose interesting bits lived in a DOM layer above
// a nearly-static Phaser scene, see the deleted FoglineTraversal.jsx), EVERY
// mechanic here is native Phaser: parallax scroll, a hand-rolled jump arc
// (no other traversal scene in this codebase uses Arcade Physics, so this
// one doesn't either -- see `updatePlayerVertical`), fog walls, the beam.
// VO is still host-owned (through zoneAudio's speak/duck, so it can duck
// the host's own music/ambience) -- this scene only asks for a cue by name
// via `cfg.onEvent({type:'cue', name})`; simple one-shot SFX (jump/land/
// stumble/gap-whoosh) are scene-local, same split the old fogline scene
// used for its own sfx vs. host VO.

const FRAME_W = 1080
const FRAME_H = 1920
const RUN_SPEED = 380 // px/s the world scrolls left under the fixed Traveler
const TRAIL_Y = 1150 // where the trail's walking surface sits (feet level)
const PLAYER_X = 300 // the Traveler's fixed screen x
// Draft 103: every runner pose is now one FRAME of a single spritesheet
// (7 cols x 2 rows, 736x691 per frame -- see traveler-runner-sheet.json)
// instead of 14 separate texture files. One sprite object, one scale, set
// ONCE at creation (applyPlayerScale takes no argument and is called
// exactly once in buildPlayer) -- Draft 101/102's per-texture and
// per-pose scaling were both symptomatic fixes for what turned out to be
// (at least in significant part) individual pose files silently serving
// stale, differently-sized bytes under unchanged filenames after an
// update -- the same class of bug the ridge rename (Draft 102 #1) fixed.
// A single shared texture makes that whole failure mode impossible: there
// is no second file that could go stale out of sync with the first.
const PLAYER_CANVAS_H = 691
const TRAVELER_H = 173 // 691 * 0.25

// Maps this scene's own pose-key vocabulary (used throughout the state
// machine below) to the spritesheet's frame index, per its own
// documented frame order (run-1..8, jump-1-takeoff, jump-2-apex,
// jump-3-land, stumble-1-trip, stumble-2-catch, activate).
const FRAME_INDEX = {
  'run-1': 0,
  'run-2': 1,
  'run-3': 2,
  'run-4': 3,
  'run-5': 4,
  'run-6': 5,
  'run-7': 6,
  'run-8': 7,
  'jump-takeoff': 8,
  'jump-apex': 9,
  'jump-land': 10,
  'stumble-trip': 11,
  'stumble-catch': 12,
  activate: 13,
}

const GRAVITY_Y = 2100
const JUMP_V0 = 980 // base upward speed on any tap (clears the ~180-220px gaps)
const HOLD_MAX_MS = 300 // "Mario Run" hold window: keep lifting for up to this long
const HOLD_GRAVITY_SCALE = 0.3 // gravity is cut to this fraction while boosting
const COYOTE_MS = 100
const INPUT_BUFFER_MS = 100

// Draft 102 #2: the world now STOPS at each wall instead of just opening a
// window while still running toward it -- the Traveler can no longer
// collide with fog at all. STOP_TRIGGER_PX is measured from the wall's
// near edge; the deceleration itself covers a further ~115px (see
// WALL_STOP_MS below), landing the wall in the right third of the frame
// with the beam still a real distance to cross once tapped.
const STOP_TRIGGER_PX = 560
const WALL_HALF_W = 180 // fog column is ~360px wide
// The trail art's own walking surface, measured in from its top edge --
// shared by the trail layer itself, the gap tile (cropped/scaled
// identically to it), and every standing entity's bottom-anchor Y
// (`TRAIL_Y` itself never moves; this is which row of the ART lands on
// that screen line). Draft 100 #1 measured the stone band's NEAR edge
// (73 -> 150); Draft 101 #5 moves it again, to the band's MIDDLE (the
// stone band runs roughly 150-330) so the Traveler reads as standing ON
// the path rather than right at its far edge.
const GROUND_Y_IN_LAYER = 235
const GAP_TILE_CHASM_W = 304 // the tile's own native chasm width at scale 1
const FOG_COL_H = 650 // bottom sits on the trail, top reaches roughly y=500
// Draft 101 #4: activation is a single tap, not a hold -- the beam grows
// to the wall automatically over this duration once tapped, no longer
// tied to how long the pointer stays down.
const ACTIVATE_MS = 900
const STUMBLE_OBSTACLE_MS = 600
const STUMBLE_EASE_IN_MS = 400 // resuming scroll after an OBSTACLE stumble
const WALL_STOP_MS = 600 // Draft 102 #2: decelerating to a stop at a wall
const WALL_RESUME_EASE_MS = 500 // Draft 102 #2: easing back in once cleared
const WALL_NUDGE_MS = 6000 // Draft 102 #2: t2r-04 nudge if not tapped by then
const GAP_DOWN_MS = 400
const GAP_UP_MS = 500
const WHOOP_MAX = 2
const ARRIVE_SLOW_MS = 1500 // Draft 100 #9: slow-to-a-stop duration on the last wall
const ARRIVE_VO_MS = 3600 // t2r-11-arrive.mp3's own runtime (~3.3s) + a small buffer

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
    { x: 3200, prop: 'bush', first: true },
    { x: 7800, prop: 'stump' },
    { x: 12800, prop: 'log' },
    { x: 17800, prop: 'signpost' },
    { x: 22600, prop: null, last: true },
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
      // Draft 102 #2: 'stumble-fog' is gone -- the world now stops before
      // a wall is ever reached, so fog can no longer be collided with.
      this.state = 'run' // run | jump | stumble-obstacle | wall-stop | gap-fall | gap-rescue
      this.grounded = true
      this.airborneSinceGroundMs = 0 // coyote timer
      this.bufferedJumpMs = -1 // input buffer (negative = none pending)
      this.pointerDown = false
      this.lensWindowActive = false
      this.activatingLens = false
      this.activeWall = null
      this.nextWallIdx = 0
      this.wallsClearedAhead = 0
      this.firstJumpFired = false
      this.shrinkCount = 0
      this.whoopCount = 0
      this.arrived = false
      this.runFrame = 0
      this.runFrameMs = 0
      this.holdBoostMs = 0
      this.resumeEase = 0
      this.resumeEaseTotal = 0
      this.wallStopElapsed = 0
      this.wallNudgeFired = false
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
      if (c.travelerSheetUrl) {
        this.load.spritesheet('traveler-sheet', c.travelerSheetUrl, { frameWidth: 736, frameHeight: PLAYER_CANVAS_H })
      }
      Object.entries(c.propUrls || {}).forEach(([k, url]) => load(`prop-${k}`, url))
      Object.entries(c.fogWallUrls || {}).forEach(([k, url]) => load(`fogwall-${k}`, url))
      load('gaptile', c.gapTileUrl)
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
      this.buildPlayer()
      this.buildSpark()
      this.buildBeamGraphics()
      this.setupInput()
      this.ready = true
      // `started` (below) only means "Begin was tapped" -- the actual go
      // signal waits for the intro line, requested in update() the moment
      // that happens (never here at create(), which runs at PAGE LOAD
      // before any user gesture; the host's speak() would just be blocked
      // by autoplay policy this early anyway).
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
        this.devCheckJumpReach()
      }
    }

    // Draft 100 #3: a dev-only sanity check, run once at scene start -- logs
    // any table gap the max (full-hold) jump can't clear by a 60px margin.
    // Mirrors updatePlayerVertical's own per-frame integration (fixed
    // 16ms steps) rather than a closed-form calculation, so it reflects
    // what actually happens in play, not just the constants' theory.
    devCheckJumpReach() {
      const simulate = (holdMs) => {
        const STEP = 16
        let vy = -JUMP_V0
        let y = 0
        let minY = 0
        let t = 0
        let holdBoostMs = 0
        for (let i = 0; i < 400; i++) {
          holdBoostMs += STEP
          const boosting = t <= holdMs && holdBoostMs <= HOLD_MAX_MS && vy < 0
          const g = boosting ? GRAVITY_Y * HOLD_GRAVITY_SCALE : GRAVITY_Y
          vy += (g * STEP) / 1000
          y += (vy * STEP) / 1000
          if (y < minY) minY = y
          t += STEP
          if (t > STEP && y >= 0) break
        }
        return { range: (RUN_SPEED * t) / 1000, apex: -minY }
      }
      const tap = simulate(0)
      const hold = simulate(HOLD_MAX_MS)
      LEVEL.gaps.forEach((g) => {
        if (g.w + 60 > hold.range) {
          // eslint-disable-next-line no-console
          console.warn(`[FoglineRun] gap at x=${g.x} (w=${g.w}) may not clear: max hold range ~${hold.range.toFixed(0)}px`)
        }
      })
      // eslint-disable-next-line no-console
      console.info(`[FoglineRun] jump reach -- tap: range ${tap.range.toFixed(0)}px; hold: range ${hold.range.toFixed(0)}px, apex ${hold.apex.toFixed(0)}px`)
    }

    // ---- procedural textures (glow dot for the beam bloom, dust puff) ----
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
      // The fog wall's column: feathered ~60px on each side AND fading in
      // from the top, so it reads as a soft drift of fog rather than a
      // flat pale card standing in the trail (a one-time build, reused by
      // every wall). Banded vertically (coarser than the per-pixel
      // horizontal feather) purely to keep the one-time draw-call count
      // reasonable.
      if (!this.textures.exists('frun-fogcol')) {
        const w = WALL_HALF_W * 2
        const h = FOG_COL_H
        const feather = 60
        const topFadeFrac = 0.3 // top 30% of the column fades in from 0
        const bands = 20
        const g = this.make.graphics({ add: false })
        for (let b = 0; b < bands; b++) {
          const vFrac = b / bands
          const vAlpha = vFrac < topFadeFrac ? vFrac / topFadeFrac : 1
          const bandY = vFrac * h
          const bandH = h / bands + 1
          for (let x = 0; x < w; x++) {
            let hAlpha = 1
            if (x < feather) hAlpha = x / feather
            else if (x > w - feather) hAlpha = (w - x) / feather
            const a = Math.max(0, Math.min(1, hAlpha)) * Math.max(0, Math.min(1, vAlpha)) * 0.92
            g.fillStyle(0xd7dde8, a)
            g.fillRect(x, bandY, 1, bandH)
          }
        }
        g.generateTexture('frun-fogcol', w, h)
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
      // TOP-anchored instead: its walking surface sits well below the
      // art's own top edge, with a tall rocky cliff-face painted below that
      // -- anchoring by its bottom would put the Traveler waist-deep in
      // that cliff face instead of standing on the path.
      this.far = this.makeScrollLayer('bg-far', 0.15, 1, { originY: 1, anchorY: 1150 })
      this.ridge = this.makeScrollLayer('bg-ridge', 0.45, 2, { originY: 1, anchorY: 1180 })
      // Draft 100 #1: GROUND_Y_IN_LAYER is which row of the art itself
      // lands on the TRAIL_Y screen line (re-measured -- the stone ground,
      // not the grass-tuft line above it).
      this.trailLayer = this.makeScrollLayer('bg-trail', 1.0, 3, { originY: 0, anchorY: TRAIL_Y - GROUND_Y_IN_LAYER })
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
    // like the other layers (factor 1.0, already built above) and never
    // actually has a hole cut in it -- these overlays are the ONLY thing
    // visually breaking the path open at each gap. Draft 98 addendum:
    // a painted tile (broken trail edges either side of a chasm) replaces
    // the original ship's flat gradient overlay -- cropped/scaled
    // identically to the trail layer itself, so its edges line up with
    // the surrounding ground, and scaled HORIZONTALLY ONLY to match each
    // gap's own width (the tile's chasm is ~304px wide at scale 1, its
    // native size; the two 300px-wide gaps are close enough to ship at
    // that native scale unmodified). ----
    buildTrailAndGaps() {
      const hasTile = this.textures.exists('gaptile')
      this.gapFills = LEVEL.gaps.map((g) => {
        if (hasTile) {
          const scaleX = Math.max(0.66, Math.min(1, g.w / GAP_TILE_CHASM_W))
          const img = this.add
            .image(g.x + g.w / 2, TRAIL_Y - GROUND_Y_IN_LAYER, 'gaptile')
            .setOrigin(0.5, 0)
            .setDepth(4)
          img.setScale(scaleX, 1)
          return { ...g, obj: img }
        }
        // Fallback if the painted tile is ever missing: the flat gradient
        // this shipped with originally.
        const width = g.w + 8
        const container = this.add.container(g.x + g.w / 2, TRAIL_Y).setDepth(4)
        const body = this.add.graphics()
        body.fillGradientStyle(0x11151f, 0x11151f, 0x11151f, 0x11151f, 0.95, 0.95, 0, 0)
        body.fillRect(-width / 2, 0, width, 420)
        const rim = this.add.rectangle(0, 1, width, 5, 0xd7dde8, 0.6).setOrigin(0.5, 0)
        container.add([body, rim])
        return { ...g, obj: container }
      })
      this.buildGapMask()
    }

    // Draft 100 #2: the trail layer is a continuously-tiled scroll (no
    // actual hole in it), so the gap tile's own painted chasm -- correctly
    // transparent -- was letting the trail's plain ground texture show
    // through from behind instead of the sky/far/ridge layers already
    // drawn behind IT. An inverted geometry mask hides the trail layer's
    // tiles under each gap's own world-x range (redrawn every frame in
    // `updateGapMask`, since gap screen positions scroll); the gap tile
    // itself sits on top at depth 4, unaffected (masks apply per-object).
    buildGapMask() {
      this.gapMaskGfx = this.make.graphics({ add: false })
      const mask = this.gapMaskGfx.createGeometryMask()
      mask.invertAlpha = true
      this.trailLayer.tiles.forEach((t) => t.setMask(mask))
    }

    updateGapMask() {
      const g = this.gapMaskGfx
      g.clear()
      g.fillStyle(0xffffff, 1)
      const top = TRAIL_Y - GROUND_Y_IN_LAYER - 40
      const height = FRAME_H - top + 100
      for (const gap of LEVEL.gaps) {
        const left = gap.x - this.scrollX
        if (left + gap.w < -50 || left > FRAME_W + 50) continue
        g.fillRect(left, top, gap.w, height)
      }
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

    // Draft 98 addendum: painted fog-wall sprites (cycled a/b/c across the
    // five walls) replace the procedural column. Bottom-anchored ON the
    // trail; scaled to ~1.9x the Traveler's display height; a small
    // per-wall scale "wobble" plus a slow, continuous vertical "breathe"
    // (scaleY drifting a further 4% up and back) so five identical crops
    // of the same three sprites don't read as static cutouts. Cool tint
    // for walls 1-4, a touch warmer for the last one (it has no prop --
    // clearing it ends the run, see beginArrive).
    buildWalls() {
      const FOG_WALL_KEYS = ['a', 'b', 'c']
      const FOG_WALL_DISPLAY_H = TRAVELER_H * 1.9
      const TINT_COOL = 0xcfe0f2
      const TINT_WARM = 0xf5e3c9
      this.walls = LEVEL.walls.map((w, i) => {
        const wallKey = `fogwall-${FOG_WALL_KEYS[i % FOG_WALL_KEYS.length]}`
        const hasSprite = this.textures.exists(wallKey)
        const col = this.add.image(w.x, TRAIL_Y, hasSprite ? wallKey : 'frun-fogcol').setOrigin(0.5, 1).setDepth(21)
        if (hasSprite) {
          const srcH = this.textures.get(wallKey).getSourceImage().height
          const wobble = 1 + (((i * 7 + 3) % 5) / 5 - 0.5) * 0.16 // deterministic, roughly ±8%
          const baseScale = (FOG_WALL_DISPLAY_H / srcH) * wobble
          col.setScale(baseScale)
          col.setTint(w.last ? TINT_WARM : TINT_COOL)
          const breatheMs = 3000 + ((i * 733) % 2000) // 3000-5000ms, varied per wall
          this.tweens.add({
            targets: col,
            scaleY: baseScale * 1.04,
            duration: breatheMs,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut',
          })
        }
        // Draft 100 #7: the looming blob is gone -- the painted fog sprite
        // alone is "something in the way," and the prop reveals as the fog
        // thins (see updateLensActivation) instead of needing its own
        // stand-in shape.
        let propObj = null
        if (w.prop) {
          const key = `prop-${w.prop}`
          const targetH = DISPLAY_H[w.prop] || 120
          propObj = this.textures.exists(key)
            ? this.add.image(w.x, TRAIL_Y, key).setOrigin(0.5, 1)
            : this.add.rectangle(w.x, TRAIL_Y, targetH, targetH, 0x2a3550).setOrigin(0.5, 1)
          const srcH = propObj.height || targetH
          propObj.baseScale = targetH / srcH
          propObj.setScale(propObj.baseScale * 1.3)
          propObj.setDepth(19)
          propObj.setAlpha(0)
        }
        return { ...w, col, propObj, cleared: false, beamProgress: 0 }
      })
    }

    // No other traversal scene in this codebase uses Phaser's Arcade
    // Physics plugin (the shared Phaser.Game config in TraversalGame.jsx
    // doesn't enable it), so the jump arc is hand-rolled: `this.playerVY`
    // integrates against `this.playerGravity` each frame in
    // `updatePlayerVertical()`, same manual-kinematics style as
    // `climbScene.js`'s falling feelings.
    buildPlayer() {
      const hasSheet = this.textures.exists('traveler-sheet')
      this.player = this.add.sprite(PLAYER_X, TRAIL_Y, hasSheet ? 'traveler-sheet' : '__DEFAULT', hasSheet ? FRAME_INDEX['run-1'] : undefined)
      this.player.setOrigin(0.5, 1)
      this.player.setDepth(30)
      this.applyPlayerScale()
      this.playerVY = 0
      this.currentPoseKey = 'run-1'
    }

    // Draft 103: ONE scale call, ever, right here at creation -- every
    // pose is a same-size frame of the same spritesheet texture now, so
    // there is no per-texture/per-pose case left to scale for (Draft
    // 101/102's own scale calls, one per texture-swap, are gone with
    // them). If jump/stumble/activate ever read a different size again,
    // it did NOT come from this method.
    applyPlayerScale() {
      this.player.setScale(TRAVELER_H / PLAYER_CANVAS_H)
    }

    setPlayerFrame(key) {
      if (this.currentPoseKey === key) return
      const idx = FRAME_INDEX[key]
      if (idx === undefined || !this.textures.exists('traveler-sheet')) return
      this.currentPoseKey = key
      this.player.setFrame(idx)
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.info(
          `[FoglineRun] pose=${key} scaleX=${this.player.scaleX.toFixed(4)} displayHeight=${this.player.displayHeight.toFixed(1)} frameW=${this.player.frame.width}`,
        )
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

    // The activate glyph is the ONLY persistent lantern-area visual --
    // alpha 0 until a wall enters the lens window, so it only ever shows
    // when the lens is actually needed (an earlier persistent "lantern
    // glow" for mote collection sat at this same fixed point but didn't
    // track the Traveler through a jump and had no real reason to be
    // visible outside the lens window; removed). Draft 100 #6: the
    // 'activate' texture is a full-body Traveler pose (see setPlayerFrame
    // usage in updateLensActivation), not an icon -- the glyph uses the
    // small procedural glow instead, tinted to read as a lantern spark.
    buildBeamGraphics() {
      this.beam = this.add.graphics().setDepth(50)
      this.lensGlyph = this.add
        .image(BEAM_ORIGIN_X, BEAM_ORIGIN_Y, 'frun-glow')
        .setDisplaySize(40, 40)
        .setTint(0xffe9b6)
        .setDepth(36)
        .setAlpha(0)
    }

    setupInput() {
      this.input.on('pointerdown', () => this.onPress())
      this.input.on('pointerup', () => this.onRelease())
      this.input.on('pointerupoutside', () => this.onRelease())
    }

    onPress() {
      if (!this.started) return
      this.pointerDown = true
      // Draft 101 #4: activation is now a single TAP -- once engaged,
      // `activatingLens` drives itself to completion in
      // updateLensActivation regardless of further presses or releases,
      // so ignore any input for the rest of that run (also blocks a jump
      // attempt landing mid-activation; the Traveler must stay in the
      // 'activate' pose until the wall clears).
      if (this.activatingLens) return
      // Draft 102 #2: the world is fully stopped at a wall by the time
      // it's activatable (no more "still running toward it" window), and
      // a tap here always activates -- jumping is disabled while stopped.
      if (this.lensWindowActive && this.activeWall) {
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
      // Draft 101 #4: activation auto-progresses once tapped -- releasing
      // no longer freezes or cancels it (superseding Draft 98 §2's hold
      // model).
    }

    beginJump() {
      this.state = 'jump'
      this.grounded = false
      this.playerVY = -JUMP_V0
      this.holdBoostMs = 0
      this.setPlayerFrame('jump-takeoff')
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
      this.setPlayerFrame('jump-land')
      this.time.delayedCall(90, () => {
        if (this.state === 'run') this.setPlayerFrame('run-1')
      })
    }

    // ---- obstacle stumble (logs/boulders only -- Draft 102 #2 removed
    // the fog-wall stumble entirely; the world stops before a wall is
    // ever reached, see updateWalls/beginWallStop) ----
    beginObstacleStumble() {
      this.state = 'stumble-obstacle'
      this.grounded = true
      this.playerVY = 0
      this.player.y = TRAIL_Y
      this.setPlayerFrame('stumble-trip')
      this.playSfx('stumble', { rate: 0.8 })
      this.time.delayedCall(220, () => this.setPlayerFrame('stumble-catch'))
      this.time.delayedCall(STUMBLE_OBSTACLE_MS, () => this.resumeFromObstacleStumble())
    }

    resumeFromObstacleStumble() {
      if (this.state !== 'stumble-obstacle') return
      this.state = 'run'
      this.setPlayerFrame('run-1')
      this.resumeEase = STUMBLE_EASE_IN_MS
      this.resumeEaseTotal = STUMBLE_EASE_IN_MS
    }

    // ---- gap fall / rescue ----
    beginGapFall() {
      this.state = 'gap-fall'
      this.grounded = false
      this.playerVY = 0
      this.setPlayerFrame('run-1')
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

    // ---- lens activation progress (per-wall, auto-runs once tapped) ----
    // Draft 101 #4: a single tap starts this; it now runs to completion on
    // its own (ACTIVATE_MS), independent of the pointer. The Traveler
    // stays in the 'activate' pose for the whole thing, restored the
    // instant it's NOT running any more -- cleared, or nothing active.
    updateLensActivation(delta) {
      const wall = this.activeWall
      if (!wall || !this.activatingLens) {
        this.restorePoseAfterActivate()
        return
      }
      this.setPlayerFrame('activate')
      wall.beamProgress = Math.min(ACTIVATE_MS, wall.beamProgress + delta)
      const t = wall.beamProgress / ACTIVATE_MS
      this.drawBeam(t)
      // The wall visibly thins as the beam grows, not just at completion.
      wall.col.setAlpha(1 - t * 0.65)
      // Draft 100 #7: the prop reveals progressively over the LAST half of
      // the activation (scale 1.3 -> 1.0, fading in) instead of popping in
      // as a separate tween once the wall is already fully cleared.
      if (wall.propObj) {
        const revealT = Math.max(0, Math.min(1, (t - 0.5) / 0.5))
        wall.propObj.setAlpha(revealT)
        wall.propObj.setScale(wall.propObj.baseScale * (1.3 - 0.3 * revealT))
      }
      if (t >= 1) this.clearWall(wall)
    }

    restorePoseAfterActivate() {
      if (this.state === 'wall-stop') this.setPlayerFrame('stumble-catch')
      else if (this.state === 'run') this.setPlayerFrame(`run-${this.runFrame || 1}`)
    }

    // Draft 101 #4: the beam now GROWS from the lantern to the wall over
    // ACTIVATE_MS (an automatic tap-and-watch beat, not a held charge-up --
    // superseding the instant-full-length flash from the earlier hold
    // model), with a light flicker on the core line for some life.
    drawBeam(t) {
      this.beam.clear()
      if (t <= 0) return
      const sx = BEAM_ORIGIN_X
      const sy = BEAM_ORIGIN_Y
      const wall = this.activeWall
      if (!wall) return
      const exFull = wall.x - this.scrollX
      const eyFull = TRAIL_Y - 120
      const ex = sx + (exFull - sx) * t
      const ey = sy + (eyFull - sy) * t
      const flicker = 0.85 + Math.sin(t * 40) * 0.15
      this.beam.lineStyle(10, 0xfff3d0, 0.3)
      this.beam.beginPath()
      this.beam.moveTo(sx, sy)
      this.beam.lineTo(ex, ey)
      this.beam.strokePath()
      this.beam.lineStyle(4, 0xfff3d0, 0.95 * flicker)
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
      this.wallsClearedAhead += 1
      if (this.wallsClearedAhead === 1) this.emitCue('clear-ahead')
      this.tweens.add({ targets: wall.col, alpha: 0, duration: 520, ease: 'Sine.out' })
      // The prop is already fully revealed (alpha 1, base scale) by the
      // per-frame ramp in updateLensActivation once beamProgress reaches
      // ACTIVATE_MS -- nothing left to animate here.
      this.shrinkCount += 1
      if (this.shrinkCount === 1) this.emitCue('shrink-1')
      else if (this.shrinkCount === 2) this.emitCue('shrink-2')
      else this.playSfx('wallclear')
      if (wall.last) {
        this.beginArrive()
        return
      }
      // Draft 102 #2: every wall clear now resumes from a full stop (the
      // world never kept moving toward a wall in the first place) --
      // ease back in rather than snapping straight to full speed.
      this.state = 'run'
      this.grounded = true
      this.playerVY = 0
      this.resumeEase = WALL_RESUME_EASE_MS
      this.resumeEaseTotal = WALL_RESUME_EASE_MS
    }

    // Draft 100 #9: no cut to Zone 3, no bridge -- the run just ends. The
    // world keeps scrolling but decelerates to a full stop over
    // ARRIVE_SLOW_MS (the background keeps its normal look, no fade), THEN
    // Spark's arrival line plays, and onComplete fires after its own
    // runtime -- not the fixed guess used before this was two separate
    // beats (`arriveSlowElapsed` drives the deceleration in update()).
    beginArrive() {
      this.state = 'arrive-slow'
      this.arriveSlowElapsed = 0
      this.time.delayedCall(ARRIVE_SLOW_MS, () => {
        this.arrived = true
        this.setPlayerFrame('run-1')
        this.emitCue('arrive')
        this.time.delayedCall(ARRIVE_VO_MS, () => {
          this.cfg.onComplete?.({})
        })
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
      // stop the world; an obstacle stumble and a gap fall/rescue do, then
      // ease back in via `resumeEase`; a wall stop decelerates itself down
      // to zero over WALL_STOP_MS via `wallStopElapsed` -- see updateWalls).
      const scrolling = this.state !== 'stumble-obstacle' && this.state !== 'gap-fall' && this.state !== 'gap-rescue'
      if (scrolling) {
        let speed = RUN_SPEED
        if (this.state === 'arrive-slow') {
          this.arriveSlowElapsed += dt
          speed = RUN_SPEED * Math.max(0, 1 - this.arriveSlowElapsed / ARRIVE_SLOW_MS)
        } else if (this.state === 'wall-stop') {
          this.wallStopElapsed += dt
          speed = RUN_SPEED * Math.max(0, 1 - this.wallStopElapsed / WALL_STOP_MS)
        } else if (this.resumeEase) {
          const k = Math.max(0, this.resumeEase - dt) / this.resumeEaseTotal
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

      this.updateWorldPositions()
      this.updateGapMask()
      this.updatePlayerVertical(dt)
      this.updateGroundCollision(worldX)
      this.updateWalls(worldX)
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
      if (this.playerVY > 0) this.setPlayerFrame('jump-apex')
    }

    updateGroundCollision(worldX) {
      if (this.state === 'gap-fall' || this.state === 'gap-rescue') return
      const overGap = this.gapFills.some((g) => worldX >= g.x - 4 && worldX <= g.x + g.w + 4)
      if (this.player.y >= TRAIL_Y) {
        if (overGap && this.state !== 'stumble-obstacle' && this.state !== 'wall-stop') {
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
              this.beginObstacleStumble()
            }
          }
        }
      }
    }

    // Draft 102 #2: the world now stops at each wall instead of opening a
    // window while still running toward it. Once the wall's near edge is
    // within STOP_TRIGGER_PX, `beginWallStop` takes over -- the Traveler
    // can no longer reach (let alone collide with) the wall at all.
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
      if (!wall.cleared && this.state === 'run' && dist <= STOP_TRIGGER_PX) {
        this.beginWallStop(wall)
        return
      }
      if (wall.last && this.lensWindowActive && this.activeWall === wall && !wall.calledLast) {
        wall.calledLast = true
        this.emitCue('final-wall')
      }
      // A nudge, once per wall, if the player hasn't tapped a while after
      // stopping (t2r-04 -- the old fog-stumble line, repurposed).
      if (
        this.state === 'wall-stop' &&
        this.activeWall === wall &&
        !this.activatingLens &&
        !this.wallNudgeFired &&
        this.wallStopElapsed >= WALL_NUDGE_MS
      ) {
        this.wallNudgeFired = true
        this.emitCue('stumble')
      }
    }

    beginWallStop(wall) {
      this.state = 'wall-stop'
      this.wallStopElapsed = 0
      this.wallNudgeFired = false
      this.grounded = true
      this.playerVY = 0
      this.player.y = TRAIL_Y
      this.lensWindowActive = true
      this.activeWall = wall
      this.lensGlyph.setAlpha(1)
      this.setPlayerFrame('stumble-catch')
      if (wall.first) this.emitCue('fog-ahead')
      else this.playSfx('chime')
    }

    // Every level-table entity is stored and iterated in WORLD-space (its
    // fixed position along the ~23,200px trail); only the collision math
    // (`updateGroundCollision`/`updateWalls`, both keyed off
    // `worldX = scrollX + PLAYER_X`) accounted for that scrollX offset --
    // the sprites themselves were left sitting at their raw world-x
    // forever, correct-looking only in the opening seconds while scrollX
    // was still near zero, then silently scrolling off to the right
    // forever (a wall thousands of px into the level was never once
    // inside the visible 0-1080 screen range). This is the one place
    // world-x becomes screen-x for every scrolling entity.
    updateWorldPositions() {
      for (const o of this.obstacles) {
        if (o.obj) o.obj.x = o.x - this.scrollX
      }
      for (const w of this.walls) {
        w.col.x = w.x - this.scrollX
        if (w.propObj) w.propObj.x = w.x - this.scrollX
      }
      for (const g of this.gapFills) {
        g.obj.x = g.x + g.w / 2 - this.scrollX
      }
    }

    updateRunAnimation(dt) {
      if (this.state !== 'run' && this.state !== 'arrive-slow') return
      this.runFrameMs += dt
      if (this.runFrameMs >= RUN_FRAME_MS) {
        this.runFrameMs = 0
        this.runFrame = (this.runFrame % 8) + 1
        this.setPlayerFrame(`run-${this.runFrame}`)
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
