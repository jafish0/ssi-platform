// "The First Light" — Zone 1's exit into Zone 2 (GAINS Draft 82, redesigned
// Draft 85). Reuses the walkable-zone engine's movement (tap-to-move over a
// walkable polygon + waypoint graph, y-depth sorting, direction-picked walk
// cycles, footsteps by surface, companion Spark with lag/bob/trail --
// ported from zoneWalkScene.js).
//
// Draft 85 flips the premise. The trail up to the Lantern Path went dark --
// its six lamp posts stand unlit, painted right into the plate. The
// Traveler carries the first flame and relights them one by one; each lit
// lamp's pool stays lit permanently, so the trail behind fills in with
// light while the Traveler's own circle never changes size. By the crest,
// the whole trail is a chain of light left for whoever comes after.
//
// Unlike the zones (progress pushed in from React), this traversal is
// self-contained end to end like climbScene/traversalScene -- it owns its
// own state and reports out only through cfg.onComplete. cfg.onDuck lets a
// HOST zone duck its own ambience under this scene's VO (Zone 1 hands its
// music over into this traversal rather than restarting it -- see
// GainsZonePage) without this scene needing to know anything about the
// host's audio manager.
//
// Config (via registry key 'traversalConfig'):
//   { routeUrl, travelerUrls, sparkUrls,
//     shapeUrls: { tree, boulder, signpost },
//     musicUrl, heartbeatUrl,
//     sfxUrls: { chime, whoosh, stepStone, stepGrass, arriveSwell },
//     voUrls: { start, firstEmber, shape, halfway, arrive },
//     reducedMotion, onComplete, onDuck }
//
// Coordinates are the plate's logical 1080x1920 space, same convention as
// the walkable zones (the route plate is authored at that scale).

const W = 1080
const H = 1920

// Derived per-frame from the sprite's own live native height (see
// applyTravelerScale()) rather than a shared source-height ratio -- Zone 1's
// Traveler frames aren't all the same source height, so a shared ratio
// rendered some frames larger than others (most visibly idle vs walking).
const TRAVELER_H = 250
const SHADOW_SCALE_AT_1 = (TRAVELER_H / 560) * 3.1
const SPARK_H = 180
const SPARK_SRC_H = 255
const SPARK_ALPHA = 0.96
const SPARK_HALO_ALPHA = 0.26
const WALK_SPEED = 250
const WALK_FPS = 8
const TAP_MAX_DIST = 14
const TAP_MAX_MS = 350
const SNAP_MAX = 170

// Draft 85: every light radius is now fixed -- nothing grows. The
// Traveler's own circle stays this size the whole traversal; what changes
// as you go is how much of the trail is ALREADY lit behind you (each lit
// lamp's own permanent pool).
const TRAVELER_LIGHT_R = 220
const SPARK_LIGHT_R = 70
const LAMP_POOL_R = 420
const LAMP_POOL_OPEN_MS = 800
const LAMP_REACH_R = 90
const LAMP_RAISE_MS = 500
// A shape "looms" once within this multiple of the Traveler's own light
// radius, and resolves (silhouette fades, revealing the plate's own painted
// object beneath) once the Traveler's circle OR a lit lamp's pool actually
// reaches it.
const LOOM_FACTOR = 1.5
const SHAPE_FADE_MS = 600
const CREST_TRIGGER_R = 260
const CREST_SEQUENCE_MS = 1200
// Draft 87: an unlit lamp's glimmer -- a small bright core plus a soft
// pulsing halo, both above the darkness mask so they're always visible.
// Sizes are diameters in px; the 'glow' texture is 32px native.
const GLIMMER_CORE_PX = 8
const GLIMMER_HALO_PX = 40
const GLIMMER_PULSE_MS = 1600
// The catch: the head flame's bloom roughly doubles the old size, flares
// briefly, then settles into a steady (still gently flickering) glow.
const LAMP_FLARE_PX = 160
const LAMP_FLARE_PEAK_PX = 220
const LAMP_FLARE_MS = 400
const LAMP_REDIRECT_COOLDOWN_MS = 2000
// The "look back" beat on the halfway line: a temporary zoom-in centered
// between lamps 1-3 so the lit trail behind reads clearly, then back.
const LOOKBACK_ZOOM = 1.6
const LOOKBACK_CENTER = { x: 550, y: 1150 }
const LOOKBACK_HOLD_MS = 900
const LOOKBACK_TWEEN_MS = 700

// ---- the route (authored against the 1080x1920 plate) -----------------
// Lamp `base` is where the Traveler walks to (and the reach-check origin);
// `head` is where the flame/glow renders and the mask's pool is centered.
const ROUTE = {
  start: { x: 574, y: 1859 },
  crest: { x: 712, y: 138 }, // where the ground rises into the Lantern Path
  lamps: [
    { base: { x: 849, y: 1538 }, head: { x: 809, y: 1331 } },
    { base: { x: 356, y: 1194 }, head: { x: 384, y: 1033 } },
    { base: { x: 310, y: 918 }, head: { x: 319, y: 786 } },
    { base: { x: 798, y: 763 }, head: { x: 784, y: 648 } },
    { base: { x: 362, y: 505 }, head: { x: 370, y: 402 } },
    { base: { x: 763, y: 344 }, head: { x: 757, y: 252 } },
  ],
  shapes: [
    { key: 'signpost', x: 241, y: 1377 },
    { key: 'boulder', x: 826, y: 907 },
    { key: 'tree', x: 953, y: 539 },
  ],
  // Walkable = within WALK_HALF_WIDTH of the polyline through these nodes
  // (see isWalkable) -- a "capsule" ribbon rather than authored quads,
  // since the trail's sharp S-curve bends made per-segment quads overshoot
  // badly at each corner (verified by overlaying them on the actual plate).
  nodes: [
    [574, 1859], [849, 1538], [356, 1194], [310, 918], [798, 763],
    [362, 505], [763, 344], [712, 138],
  ],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  depth: { yNear: 1859, yFar: 138, sNear: 1.0, sFar: 0.6 },
}

// Half-width of the walkable ribbon around the trail's node polyline (a
// "capsule" corridor -- see isWalkable/nearestWalkable), tuned against the
// actual painted trail width in traversal1-route.png.
const WALK_HALF_WIDTH = 105

function projectOnSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax
  const vy = by - ay
  const len2 = vx * vx + vy * vy || 1
  let t = ((px - ax) * vx + (py - ay) * vy) / len2
  t = Math.max(0, Math.min(1, t))
  return { x: ax + vx * t, y: ay + vy * t }
}

export function makeFirstLightScene(Phaser) {
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

  return class FirstLightScene extends Phaser.Scene {
    constructor() {
      super('FirstLight')
    }

    init() {
      this.cfg = this.registry.get('traversalConfig') || {}
      this.reduced = !!this.cfg.reducedMotion
      this.route = ROUTE
      // Mutable per-lamp/shape state lives on the shared ROUTE object (a
      // module-level singleton), not per-scene-instance -- reset it here so
      // a replay (scene.restart()) doesn't inherit the previous
      // playthrough's lit/resolved flags.
      this.route.lamps.forEach((l) => {
        l.lit = false
        l.poolRadius = 0
      })
      this.route.shapes.forEach((s) => {
        s.resolved = false
        s.looming = false
      })
      this.path = []
      this.pendingTarget = null
      this.facing = 'back'
      this.moving = false
      this.lampsLit = 0
      this.shapesRevealed = 0
      this.arrived = false
      this.started = false
      this.firstTapDone = false
      this.anyLooming = false
      this.lightingLamp = false
      this.lookedBack = false
    }

    preload() {
      const c = this.cfg
      if (c.routeUrl) this.load.image('route', c.routeUrl)
      Object.entries(c.travelerUrls || {}).forEach(([k, url]) => this.load.image(`t-${k}`, url))
      ;(c.sparkUrls || []).forEach((url, i) => this.load.image(`spark-${i}`, url))
      Object.entries(c.shapeUrls || {}).forEach(([k, url]) => this.load.image(`shape-${k}`, url))
      if (c.musicUrl) this.load.audio('fl-music', c.musicUrl)
      if (c.heartbeatUrl) this.load.audio('fl-heartbeat', c.heartbeatUrl)
      Object.entries(c.sfxUrls || {}).forEach(([k, url]) => url && this.load.audio(`fl-sfx-${k}`, url))
      Object.entries(c.voUrls || {}).forEach(([k, url]) => url && this.load.audio(`fl-vo-${k}`, url))
      this.load.on('loaderror', (file) => {
        // eslint-disable-next-line no-console
        console.warn('[firstLight] asset failed to load:', file && file.key)
      })
    }

    create() {
      this.makeTextures()

      if (this.textures.exists('route')) {
        this.add.image(W / 2, H / 2, 'route').setDisplaySize(W, H).setDepth(0)
      } else {
        this.add.rectangle(W / 2, H / 2, W, H, 0x05070e).setDepth(0)
      }

      // Ambient dust, always faintly visible in the dark (above the mask --
      // see the depth notes in buildMask). Reduced motion: none.
      if (!this.reduced) {
        this.dustAmbient = this.add
          .particles(0, 0, 'glow', {
            x: { min: 0, max: W },
            y: { min: 0, max: H },
            lifespan: 7000,
            speedY: { min: -10, max: -3 },
            speedX: { min: -4, max: 4 },
            scale: { start: 0.22, end: 0.05 },
            alpha: { start: 0.2, end: 0 },
            frequency: 260,
            quantity: 1,
            tint: 0xd8c9ea,
            blendMode: 'ADD',
          })
          .setDepth(H + 60)
      }

      this.buildLamps()
      this.buildShapes()
      this.buildTraveler()
      this.buildSpark()
      this.buildMask()
      this.buildInput()

      this.camDefaultZoom = 1
      this.cameras.main.setZoom(this.camDefaultZoom).setScroll(0, 0)

      // Music: skipped entirely when the host hands its own ambience over
      // (see TraversalGame's skipMusic -> no musicUrl in cfg).
      if (this.cache.audio.exists('fl-music')) {
        this.music = this.sound.add('fl-music', { loop: true, volume: 0.32 })
      }
      if (this.cache.audio.exists('fl-heartbeat')) {
        this.heartbeat = this.sound.add('fl-heartbeat', { loop: true, volume: 0 })
      }

      this.ready = true
    }

    // ---- lifecycle: gated behind React's Begin tap, same as the other
    // traversals (also the mobile audio-unlock gesture). ----
    update(time, delta) {
      if (!this.ready) return
      if (!this.started) {
        if (this.registry.get('traversalStarted')) {
          this.begin()
        }
        return
      }
      this.updateTraveler(delta)
      this.updateSpark(time, delta)
      this.updateLamps()
      this.updateShapes(delta)
      this.updateMask()
      if (!this.arrived) this.maybeArrive()
    }

    begin() {
      this.started = true
      if (this.music) {
        if (this.sound.locked) this.sound.once(Phaser.Sound.Events.UNLOCKED, () => this.music.play())
        else this.music.play()
      }
      this.playVo('start')
      // A gentle nudge: Spark drifts a little ahead toward the first lamp
      // for a few seconds, then settles into normal companion lag.
      const first = this.route.lamps[0].head
      this.sparkGesture = { x: first.x, y: first.y + 120, until: this.time.now + 3000 }
    }

    // ---- textures (procedural; no extra assets) ----
    makeTextures() {
      if (!this.textures.exists('glow')) {
        const R = 16
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        for (let i = 6; i >= 1; i--) {
          g.fillStyle(0xffffff, 0.16)
          g.fillCircle(R, R, R * (i / 6))
        }
        g.fillStyle(0xffffff, 0.95)
        g.fillCircle(R, R, 3)
        g.generateTexture('glow', R * 2, R * 2)
        g.destroy()
      }
      if (!this.textures.exists('dust')) {
        const R = 10
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        g.fillStyle(0xffffff, 0.55)
        g.fillCircle(R, R, R * 0.8)
        g.generateTexture('dust', R * 2, R * 2)
        g.destroy()
      }
      if (!this.textures.exists('shadow')) {
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        for (let i = 6; i >= 1; i--) {
          g.fillStyle(0x08101c, 0.11)
          g.fillEllipse(80, 28, (150 * i) / 6, (48 * i) / 6)
        }
        g.generateTexture('shadow', 160, 56)
        g.destroy()
      }
      // Draft 87: the tap-ring, ported from zoneWalkScene.js's recipe --
      // a UI cue, so it renders above the mask (see showTapMarker).
      if (!this.textures.exists('ring')) {
        const R = 96
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        g.lineStyle(10, 0xffffff, 1)
        g.strokeCircle(R, R, R - 8)
        g.lineStyle(22, 0xffffff, 0.22)
        g.strokeCircle(R, R, R - 8)
        g.generateTexture('ring', R * 2, R * 2)
        g.destroy()
      }
    }

    // ---- darkness mask ----
    // A RenderTexture, cleared and refilled near-opaque every frame, then
    // erased (soft radial stamps) at the Traveler, Spark, and every lit
    // lamp's own permanent pool -- so it hides the PLATE (and only the
    // plate: the traveler, spark, and shapes render at a higher depth than
    // the mask and manage their own visibility, since a shape must still be
    // visible as it looms even though it's outside the erased area). A
    // faint ~4% ambient stays everywhere so it never reads as a true void.
    buildMask() {
      if (!this.textures.exists('light-soft')) {
        const R = 256
        const tex = this.textures.createCanvas('light-soft', R * 2, R * 2)
        const ctx = tex.getContext()
        const grd = ctx.createRadialGradient(R, R, 0, R, R, R)
        grd.addColorStop(0, 'rgba(255,255,255,1)')
        grd.addColorStop(0.6, 'rgba(255,255,255,1)')
        grd.addColorStop(0.85, 'rgba(255,255,255,0.85)')
        grd.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(R, R, R, 0, Math.PI * 2)
        ctx.fill()
        tex.refresh()
        this.lightTexR = R
      }
      this.lightStamp = this.make.image({ key: 'light-soft', add: false })
      this.mask = this.add.renderTexture(0, 0, W, H).setOrigin(0, 0).setDepth(H + 40)
      this.updateMask()
    }

    updateMask() {
      if (!this.mask) return
      const rt = this.mask
      rt.clear()
      rt.fill(0x03060d, 0.96)
      const stampAt = (x, y, radius) => {
        if (radius <= 0) return
        this.lightStamp.setPosition(x, y).setScale(radius / this.lightTexR)
        rt.erase(this.lightStamp)
      }
      for (const l of this.route.lamps) {
        if (l.lit) stampAt(l.head.x, l.head.y, l.poolRadius)
      }
      if (this.spark) stampAt(this.spark.x, this.spark.y, SPARK_LIGHT_R)
      if (this.traveler) stampAt(this.traveler.x, this.traveler.y - 130, TRAVELER_LIGHT_R)
    }

    // ---- lamps: unlit glimmer -> reached -> raised -> caught -> pool opens ----
    // Draft 87: split into a small bright CORE (a "there's a lamp here" dot)
    // and a soft pulsing HALO, both above the mask (H+40) so they're always
    // visible in the dark regardless of the light circle -- the original
    // single tiny sprite (scaled well under its own texture size) read as
    // invisible in practice.
    buildLamps() {
      this.lampSprites = this.route.lamps.map((l) => {
        const halo = this.add.image(l.head.x, l.head.y, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffcf8a)
        halo.setScale(GLIMMER_HALO_PX / 32).setAlpha(0.5).setDepth(H + 47)
        const core = this.add.image(l.head.x, l.head.y, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xfff0c8)
        core.setScale(GLIMMER_CORE_PX / 32).setAlpha(0.85).setDepth(H + 48)
        l.glimmerHalo = halo
        l.glimmerCore = core
        return l
      })
    }

    // Drives the unlit glimmers' pulse directly off scene time (rather than
    // a per-lamp tween) so the nearest-unlit lamp can be boosted brighter
    // without fighting a tween already in flight, and checks proximity for
    // the catch -- proximity only: reaching a lamp's radius lights it even
    // if the tap that's walking you past it was aimed further up the trail
    // (Draft 87 item 9).
    updateLamps() {
      if (!this.traveler) return
      let nearest = null
      let nearestD = Infinity
      for (const l of this.route.lamps) {
        if (l.lit) continue
        const d = Phaser.Math.Distance.Between(this.traveler.x, this.traveler.y, l.base.x, l.base.y)
        if (d < nearestD) {
          nearestD = d
          nearest = l
        }
      }
      const phase = this.reduced ? 0.5 : (Math.sin((this.time.now / GLIMMER_PULSE_MS) * Math.PI * 2) + 1) / 2
      for (const l of this.route.lamps) {
        if (l.lit) continue
        const isNearest = l === nearest
        const base = isNearest ? 0.6 : 0.48
        const swing = isNearest ? 0.22 : 0.14
        l.glimmerHalo.setAlpha(base + phase * swing)
        l.glimmerCore.setAlpha(isNearest ? 1 : 0.82)
      }
      if (this.lightingLamp) return
      for (const l of this.route.lamps) {
        if (l.lit) continue
        const d = Phaser.Math.Distance.Between(this.traveler.x, this.traveler.y, l.base.x, l.base.y)
        if (d <= LAMP_REACH_R) {
          this.lightLamp(l)
          return
        }
      }
    }

    lightLamp(l) {
      this.lightingLamp = true
      this.path = []
      this.pendingTarget = null
      // Face the lamp for the raise beat -- set the idle facing directly
      // rather than calling face() (which plays the WALK animation; calling
      // it right after stopping was why the Traveler kept walking in place
      // pressed against the post).
      this.facing = l.head.y - this.traveler.y < 0 ? 'back' : 'front'
      this.setMoving(false)
      this.time.delayedCall(this.reduced ? 0 : LAMP_RAISE_MS, () => {
        l.lit = true
        this.lampsLit += 1
        const haloPx0 = LAMP_FLARE_PX / 32
        const haloPx1 = LAMP_FLARE_PEAK_PX / 32
        l.glimmerCore.setAlpha(1).setScale((GLIMMER_CORE_PX * 1.3) / 32)
        l.glimmerHalo.setScale(haloPx0).setAlpha(0.85)
        if (!this.reduced) {
          this.tweens.add({
            targets: l.glimmerHalo,
            scale: haloPx1,
            duration: LAMP_FLARE_MS,
            ease: 'Sine.out',
            onComplete: () => {
              this.tweens.add({
                targets: l.glimmerHalo,
                scale: { from: haloPx1, to: haloPx0 * 1.15 },
                alpha: { from: 0.85, to: 0.66 },
                duration: 900,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
              })
            },
          })
          // A soft light-ring, expanding outward once and fading.
          const ring = this.add
            .image(l.head.x, l.head.y, 'glow')
            .setBlendMode(Phaser.BlendModes.ADD)
            .setTint(0xffe3a0)
            .setAlpha(0.7)
            .setScale(haloPx0 * 0.6)
            .setDepth(H + 54)
          this.tweens.add({ targets: ring, scale: haloPx1 * 2.4, alpha: 0, duration: 700, ease: 'Sine.out', onComplete: () => ring.destroy() })
          const burst = this.add
            .particles(l.head.x, l.head.y, 'glow', {
              lifespan: 520,
              speed: { min: 40, max: 140 },
              scale: { start: 0.4, end: 0 },
              alpha: { start: 0.95, end: 0 },
              tint: 0xffe3a0,
              blendMode: 'ADD',
              emitting: false,
            })
            .setDepth(H + 55)
          burst.explode(14)
          this.time.delayedCall(650, () => burst.destroy())
        } else {
          l.glimmerHalo.setScale(haloPx1).setAlpha(0.8)
        }
        this.playSfx('chime')
        if (this.reduced) l.poolRadius = LAMP_POOL_R
        else this.tweens.add({ targets: l, poolRadius: LAMP_POOL_R, duration: LAMP_POOL_OPEN_MS, ease: 'Sine.out' })
        if (this.lampsLit === 1) this.playVo('firstEmber')
        if (this.lampsLit === 3) {
          this.playVo('halfway')
          this.lookBack()
        }
        this.lightingLamp = false
      })
    }

    // ---- the "look back" beat on the halfway line: zoom in on the lit
    // lamps behind, hold, then return to the normal full-plate view. ----
    lookBack() {
      if (this.reduced || this.lookedBack) return
      this.lookedBack = true
      const cam = this.cameras.main
      const cx = LOOKBACK_CENTER.x - W / (2 * LOOKBACK_ZOOM)
      const cy = LOOKBACK_CENTER.y - H / (2 * LOOKBACK_ZOOM)
      this.tweens.add({
        targets: cam,
        zoom: LOOKBACK_ZOOM,
        scrollX: cx,
        scrollY: cy,
        duration: LOOKBACK_TWEEN_MS,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.time.delayedCall(LOOKBACK_HOLD_MS, () => {
            this.tweens.add({
              targets: cam,
              zoom: this.camDefaultZoom,
              scrollX: 0,
              scrollY: 0,
              duration: LOOKBACK_TWEEN_MS,
              ease: 'Sine.easeInOut',
            })
          })
        },
      })
    }

    // ---- shapes in the dark ----
    buildShapes() {
      this.shapeSprites = this.route.shapes.map((s) => {
        const key = `shape-${s.key}`
        const img = this.textures.exists(key)
          ? this.add.image(s.x, s.y, key).setOrigin(0.5, 0.85)
          : this.add.rectangle(s.x, s.y, 60, 90, 0x0a0e18).setOrigin(0.5, 0.85)
        // Normalize to a reasonable footprint regardless of the source art's
        // own pixel size (they vary: the tree canopy is much taller than the
        // signpost, etc.) -- cap the tallest edge to ~260px logical.
        const srcH = img.height || 260
        const k = Math.min(1, 260 / srcH)
        img.setScale(k)
        img.setDepth(H + 50) // above the mask (H+40) -- see buildMask's depth notes
        img.setAlpha(0)
        s.sprite = img
        return s
      })
    }

    updateShapes() {
      if (!this.traveler) return
      let anyLooming = false
      for (const s of this.route.shapes) {
        if (s.resolved) continue
        const dTraveler = Phaser.Math.Distance.Between(this.traveler.x, this.traveler.y, s.x, s.y)
        const nearLampPool = this.route.lamps.some(
          (l) => l.lit && Phaser.Math.Distance.Between(l.head.x, l.head.y, s.x, s.y) <= l.poolRadius,
        )
        const loomR = TRAVELER_LIGHT_R * LOOM_FACTOR
        if (dTraveler <= TRAVELER_LIGHT_R || nearLampPool) {
          // The light reaches it: resolve (fade the silhouette, revealing
          // the plate's own painted, now-lit object beneath).
          s.resolved = true
          s.looming = false
          this.shapesRevealed += 1
          this.tweens.add({ targets: s.sprite, alpha: 0, duration: SHAPE_FADE_MS, ease: 'Sine.out' })
          if (this.shapesRevealed === 1) this.playVo('shape')
        } else if (dTraveler <= loomR) {
          s.looming = true
          anyLooming = true
          if (s.sprite.alpha < 0.88) {
            this.tweens.add({ targets: s.sprite, alpha: 0.88, duration: 260 })
          }
        } else if (s.looming) {
          s.looming = false
          this.tweens.add({ targets: s.sprite, alpha: 0, duration: 260 })
        }
      }
      if (anyLooming !== this.anyLooming) {
        this.anyLooming = anyLooming
        if (this.heartbeat) {
          // Kill any in-flight volume tween first -- without this, a stale
          // fade-out's onComplete (500ms after a since-reversed transition)
          // could stop() a heartbeat a NEWER looming shape just restarted.
          this.tweens.killTweensOf(this.heartbeat)
          if (anyLooming) {
            if (!this.heartbeat.isPlaying) this.heartbeat.play()
            this.tweens.add({ targets: this.heartbeat, volume: 0.4, duration: 500 })
          } else {
            this.tweens.add({
              targets: this.heartbeat,
              volume: 0,
              duration: 500,
              onComplete: () => {
                if (!this.anyLooming) this.heartbeat.stop()
              },
            })
          }
        }
      }
    }

    // ---- arrival ----
    maybeArrive() {
      const d = Phaser.Math.Distance.Between(this.traveler.x, this.traveler.y, this.route.crest.x, this.route.crest.y)
      if (d > CREST_TRIGGER_R) return
      // The route always walks the Traveler past every lamp on the way
      // here (see walkTo), so this shouldn't be reachable with any lamp
      // still unlit -- but if it ever is, pulse the nearest miss instead
      // of silently doing nothing.
      if (this.lampsLit < this.route.lamps.length) {
        this.pulseMissedLamp()
        return
      }
      this.arrive()
    }

    pulseMissedLamp() {
      const now = this.time.now
      if (this.lastMissPulseAt && now - this.lastMissPulseAt < LAMP_REDIRECT_COOLDOWN_MS) return
      this.lastMissPulseAt = now
      const unlit = this.route.lamps.find((l) => !l.lit)
      if (!unlit) return
      this.tweens.add({ targets: unlit.glimmerHalo, scale: unlit.glimmerHalo.scale * 1.7, alpha: 0.95, duration: 260, yoyo: true, ease: 'Sine.easeOut' })
    }

    arrive() {
      if (this.arrived) return
      this.arrived = true
      this.path = []
      this.setMoving(false)
      this.lightCrestLanterns(() => {
        this.playSfx('arriveSwell')
        this.playVo('arrive')
        if (this.music) this.tweens.add({ targets: this.music, volume: 0, duration: 900 })
        const bloom = this.add.rectangle(W / 2, H / 2, W, H, 0xffe9b0, 0).setDepth(H + 70)
        this.tweens.add({
          targets: bloom,
          fillAlpha: this.reduced ? 0.4 : 0.92,
          duration: this.reduced ? 700 : 900,
          ease: 'Sine.out',
          onComplete: () => {
            this.time.delayedCall(2000, () => {
              if (typeof this.cfg.onComplete === 'function') {
                this.cfg.onComplete({ lampsLit: this.lampsLit, shapesRevealed: this.shapesRevealed })
              }
            })
          },
        })
      })
    }

    // A handful of small flame dots strung across the crest, catching left
    // to right as if the last lamp passed its flame along -- purely
    // decorative (the mask's own bloom right after is what actually
    // reveals the whole trail below).
    lightCrestLanterns(onDone) {
      if (this.reduced) {
        onDone()
        return
      }
      const dots = [
        { x: 580, y: 150 },
        { x: 640, y: 128 },
        { x: 700, y: 112 },
        { x: 760, y: 120 },
        { x: 820, y: 140 },
        { x: 870, y: 165 },
      ]
      dots.forEach((p, i) => {
        this.time.delayedCall((CREST_SEQUENCE_MS / dots.length) * i, () => {
          const dot = this.add
            .image(p.x, p.y, 'glow')
            .setBlendMode(Phaser.BlendModes.ADD)
            .setTint(0xffd9a0)
            .setAlpha(0)
            .setScale(0.05)
            .setDepth(H + 56)
          this.tweens.add({ targets: dot, alpha: 0.8, scale: 0.16, duration: 220, ease: 'Sine.out' })
        })
      })
      this.time.delayedCall(CREST_SEQUENCE_MS, onDone)
    }

    // ---- audio ----
    playVo(key) {
      const k = `fl-vo-${key}`
      if (!this.cache.audio.exists(k)) return
      if (this.currentVo) this.currentVo.stop()
      const vo = this.sound.add(k, { volume: 0.9 })
      this.currentVo = vo
      this.cfg.onDuck?.(true)
      vo.once('complete', () => this.cfg.onDuck?.(false))
      vo.once('stop', () => this.cfg.onDuck?.(false))
      if (this.music) {
        this.tweens.add({ targets: this.music, volume: 0.1, duration: 250, yoyo: false })
        vo.once('complete', () => this.tweens.add({ targets: this.music, volume: 0.32, duration: 500 }))
      }
      if (this.sound.locked) this.sound.once(Phaser.Sound.Events.UNLOCKED, () => vo.play())
      else vo.play()
    }

    playSfx(key) {
      const k = `fl-sfx-${key}`
      if (this.cache.audio.exists(k) && !this.sound.locked) this.sound.play(k, { volume: 0.6 })
    }

    // ---- traveler (ported from zoneWalkScene.js) ----
    buildTraveler() {
      const dirs = ['walk-back', 'walk-front', 'walk-side', 'walk-side-left']
      dirs.forEach((d) => {
        const frames = []
        for (let i = 1; i <= 6; i++) if (this.textures.exists(`t-${d}-${i}`)) frames.push({ key: `t-${d}-${i}` })
        if (frames.length && !this.anims.exists(d)) {
          this.anims.create({ key: d, frames, frameRate: WALK_FPS, repeat: -1 })
        }
      })
      const start = this.route.start
      this.shadow = this.add.image(start.x, start.y + 6, 'shadow').setOrigin(0.5, 0.5).setAlpha(0.55)
      const idleKey = this.textures.exists('t-idle-back') ? 't-idle-back' : 't-idle-front'
      this.traveler = this.add.sprite(start.x, start.y, idleKey).setOrigin(0.5, 1)
      this.traveler.on('animationupdate', (anim, frame) => {
        if (frame.index === 1 || frame.index === 4) this.footstep()
      })
      this.dust = this.add.particles(0, 0, 'dust', {
        lifespan: { min: 380, max: 620 },
        speed: { min: 12, max: 55 },
        angle: { min: 200, max: 340 },
        gravityY: -30,
        scale: { start: 0.9, end: 0.1 },
        alpha: { start: 0.55, end: 0 },
        tint: 0xd8c9ea,
        emitting: false,
      })
      this.dust.setDepth(H + 45)
      this.facing = 'back'
      this.bob = { v: 0 }
      if (!this.reduced) {
        this.tweens.add({ targets: this.bob, v: 1, duration: 2300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      }
      this.placeTraveler(start.x, start.y)
    }

    depthScale(y) {
      const d = this.route.depth
      const t = (y - d.yFar) / (d.yNear - d.yFar)
      return Phaser.Math.Clamp(d.sFar + (d.sNear - d.sFar) * t, 0.56, 1.04)
    }

    placeTraveler(x, y) {
      const s = this.depthScale(y)
      this.traveler.setPosition(x, y)
      this.travelerDisplayH = TRAVELER_H * s
      this.applyTravelerScale()
      this.traveler.setDepth(y)
      this.shadow.setPosition(x, y + 4 * s).setScale(SHADOW_SCALE_AT_1 * s, SHADOW_SCALE_AT_1 * s).setDepth(y - 0.5)
      this.dust.setDepth(y - 0.2)
    }

    applyTravelerScale() {
      const displayH = this.travelerDisplayH || TRAVELER_H
      const bobK = this.moving || !this.bob ? 1 : 1 + 0.014 * this.bob.v
      // Derived from this sprite's own current native frame height (Phaser
      // keeps it current on setTexture()/animation-frame-advance), never a
      // shared source-height guess -- so a mismatched source PNG can never
      // change this frame's on-screen size.
      const k = displayH / this.traveler.height
      this.traveler.setScale(k, k * bobK)
    }

    setMoving(m) {
      if (m === this.moving) return
      this.moving = m
      if (m) {
        if (this.tapMarker) this.fadeTapMarker()
      } else {
        this.traveler.anims.stop()
        const idle = this.facing === 'back' ? 't-idle-back' : 't-idle-front'
        if (this.textures.exists(idle)) this.traveler.setTexture(idle)
        this.applyTravelerScale()
      }
    }

    updateTraveler(delta) {
      if (!this.traveler) return
      if (!this.path.length) {
        if (this.moving) this.setMoving(false)
        else if (this.bob) this.applyTravelerScale()
        return
      }
      const dt = delta / 1000
      let { x, y } = this.traveler
      let budget = WALK_SPEED * this.depthScale(y) * dt
      while (budget > 0 && this.path.length) {
        const tgt = this.path[0]
        const dx = tgt.x - x
        const dy = tgt.y - y
        const dist = Math.hypot(dx, dy)
        if (dist <= budget) {
          x = tgt.x
          y = tgt.y
          budget -= dist
          this.path.shift()
        } else {
          x += (dx / dist) * budget
          y += (dy / dist) * budget
          budget = 0
          this.face(dx, dy)
        }
      }
      this.setMoving(true)
      this.placeTraveler(x, y)
      if (!this.path.length) this.setMoving(false)
    }

    face(dx, dy) {
      let dir
      if (Math.abs(dx) > Math.abs(dy) * 1.15) dir = dx > 0 ? 'side' : 'side-left'
      else dir = dy < 0 ? 'back' : 'front'
      if (dir !== this.facing || !this.traveler.anims.isPlaying) {
        this.facing = dir
        const key = `walk-${dir}`
        if (this.anims.exists(key)) this.traveler.play(key, true)
      }
    }

    footstep() {
      const { x, y } = this.traveler
      const s = this.depthScale(y)
      if (!this.reduced && this.dust) {
        this.dust.setDepth(y - 0.2)
        this.dust.explode(4, x + Phaser.Math.Between(-14, 14) * s, y - 2)
      }
      this.playSfx('stepStone')
    }

    // ---- walkable geometry: a capsule ribbon around the node polyline ----
    isWalkable(x, y) {
      const nodes = this.route.nodes
      for (let i = 0; i + 1 < nodes.length; i++) {
        const [ax, ay] = nodes[i]
        const [bx, by] = nodes[i + 1]
        const p = projectOnSegment(x, y, ax, ay, bx, by)
        if (Math.hypot(x - p.x, y - p.y) <= WALK_HALF_WIDTH) return true
      }
      return false
    }

    nearestWalkable(x, y) {
      const nodes = this.route.nodes
      let best = null
      for (let i = 0; i + 1 < nodes.length; i++) {
        const [ax, ay] = nodes[i]
        const [bx, by] = nodes[i + 1]
        const p = projectOnSegment(x, y, ax, ay, bx, by)
        const d = Math.hypot(x - p.x, y - p.y)
        if (!best || d < best.d) best = { x: p.x, y: p.y, d }
      }
      if (best && best.d <= WALK_HALF_WIDTH) return { x, y, d: 0 }
      return best
    }

    segmentClear(ax, ay, bx, by) {
      const d = Math.hypot(bx - ax, by - ay)
      const n = Math.max(2, Math.ceil(d / 22))
      for (let i = 0; i <= n; i++) {
        const t = i / n
        if (!this.isWalkable(ax + (bx - ax) * t, ay + (by - ay) * t)) return false
      }
      return true
    }

    nearestNode(x, y) {
      let bi = 0
      let bd = Infinity
      this.route.nodes.forEach(([nx, ny], i) => {
        const d = Math.hypot(nx - x, ny - y)
        if (d < bd) {
          bd = d
          bi = i
        }
      })
      return bi
    }

    nodePath(a, b) {
      if (a === b) return [a]
      const adj = {}
      this.route.edges.forEach(([u, v]) => {
        ;(adj[u] = adj[u] || []).push(v)
        ;(adj[v] = adj[v] || []).push(u)
      })
      const prev = { [a]: null }
      const queue = [a]
      while (queue.length) {
        const u = queue.shift()
        if (u === b) break
        for (const v of adj[u] || []) {
          if (!(v in prev)) {
            prev[v] = u
            queue.push(v)
          }
        }
      }
      if (!(b in prev)) return [a, b]
      const out = []
      for (let cur = b; cur !== null; cur = prev[cur]) out.unshift(cur)
      return out
    }

    // Draft 87 item 9: deliberately no shortcut-trimming across nodes here
    // (unlike zoneWalkScene.js). The node chain IS the sequence of lamp
    // waypoints, and proximity-only lighting depends on every tap walking
    // the Traveler past each lamp between here and there, never around it
    // -- a "clear" straight line that stayed inside the walkable ribbon
    // could otherwise cut a corner wide enough to miss a lamp's own reach
    // radius. A direct line is only used when the tap lands on the SAME
    // local stretch (nearest to the same node) as the Traveler already is,
    // where there's no intervening lamp to skip.
    walkTo(x, y) {
      const { x: fx, y: fy } = this.traveler
      const na = this.nearestNode(fx, fy)
      const nb = this.nearestNode(x, y)
      if (na === nb && this.segmentClear(fx, fy, x, y)) {
        this.path = [{ x, y }]
      } else {
        const pts = this.nodePath(na, nb).map((i) => ({ x: this.route.nodes[i][0], y: this.route.nodes[i][1] }))
        this.path = [...pts, { x, y }]
      }
      if (this.path.length) this.face(this.path[0].x - fx, this.path[0].y - fy)
    }

    // ---- tap marker (Draft 87 item 8, ported from zoneWalkScene.js) ----
    // A UI cue, not part of the world -- rendered above the mask so it's
    // visible in the dark like the glimmers.
    showTapMarker(x, y) {
      if (this.tapMarker) this.tapMarker.destroy()
      const ring = this.add.image(x, y, 'ring').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe9b8).setDepth(H + 49)
      ring.setScale(0.25).setAlpha(0.9)
      this.tweens.add({ targets: ring, scale: 0.75, alpha: 0, duration: 650, ease: 'Sine.easeOut', onComplete: () => ring.destroy() })
      const spot = this.add.image(x, y, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe9b8).setDepth(H + 49)
      spot.setScale(0.55).setAlpha(0.42)
      this.tapMarker = spot
    }

    fadeTapMarker() {
      const m = this.tapMarker
      this.tapMarker = null
      if (!m) return
      this.tweens.add({ targets: m, alpha: 0, scale: m.scale * 0.6, duration: 320, onComplete: () => m.destroy() })
    }

    // ---- input ----
    buildInput() {
      this.input.on('pointerdown', (p) => {
        this.pDown = { x: p.x, y: p.y, t: this.time.now }
      })
      this.input.on('pointerup', (p) => {
        if (!this.pDown || !this.started || this.arrived) return
        const d = Phaser.Math.Distance.Between(p.x, p.y, this.pDown.x, this.pDown.y)
        const dur = this.time.now - this.pDown.t
        this.pDown = null
        if (d > TAP_MAX_DIST || dur > TAP_MAX_MS) return
        this.handleTap(p.x, p.y)
      })
    }

    handleTap(x, y) {
      if (!this.started || this.arrived || this.lightingLamp) return
      this.firstTapDone = true
      const w = this.nearestWalkable(x, y)
      if (!w || w.d > SNAP_MAX) return
      this.showTapMarker(w.x, w.y)
      this.walkTo(w.x, w.y)
    }

    // ---- Spark (companion from the very start -- no "waiting" phase here) ----
    buildSpark() {
      const frames = []
      for (let i = 0; i < 4; i++) if (this.textures.exists(`spark-${i}`)) frames.push({ key: `spark-${i}` })
      if (!frames.length) return
      if (!this.anims.exists('fl-spark-flicker')) this.anims.create({ key: 'fl-spark-flicker', frames, frameRate: 5, repeat: -1 })
      const start = this.route.start
      const sx = start.x - 90
      const sy = start.y - 40
      this.sparkHalo = this.add.image(sx, sy, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffd9a0)
      this.sparkHalo.setAlpha(SPARK_HALO_ALPHA).setScale(1.9).setDepth(H + 52)
      this.spark = this.add.sprite(sx, sy, 'spark-0').setAlpha(SPARK_ALPHA)
      this.spark.play('fl-spark-flicker')
      this.spark.setScale(SPARK_H / SPARK_SRC_H).setDepth(H + 53)
      this.sparkGround = { x: sx, y: sy }
      this.trail = this.add.particles(0, 0, 'glow', {
        lifespan: { min: 450, max: 800 },
        speed: { min: 4, max: 16 },
        scale: { start: 0.16, end: 0.02 },
        alpha: { start: 0.42, end: 0 },
        tint: [0xffe3a0, 0xfff3d0, 0xffc98a],
        blendMode: 'ADD',
        frequency: 60,
        emitting: false,
      })
      this.trail.setDepth(H + 51)
      this.trail.startFollow(this.spark)
    }

    updateSpark(time, delta) {
      if (!this.spark) return
      this.sparkBob = (this.sparkBob || 0) + delta / 1000
      const bob = this.reduced ? 0 : Math.sin(this.sparkBob * 2.1) * 9
      let gx
      let gy
      if (this.sparkGesture && time < this.sparkGesture.until) {
        gx = this.sparkGesture.x
        gy = this.sparkGesture.y
      } else {
        this.sparkGesture = null
        const t = this.traveler
        gx = t.x - 105 + (this.nudge ? this.nudge.dx : 0)
        gy = t.y - 20 + (this.nudge ? this.nudge.dy : 0)
      }
      const k = 1 - Math.exp(-delta / 320)
      this.sparkGround.x += (gx - this.sparkGround.x) * k
      this.sparkGround.y += (gy - this.sparkGround.y) * k
      const s = this.depthScale(this.sparkGround.y)
      const speed = Math.hypot(gx - this.sparkGround.x, gy - this.sparkGround.y)
      this.spark.setPosition(this.sparkGround.x, this.sparkGround.y - 215 * s + bob)
      this.spark.setScale((SPARK_H / SPARK_SRC_H) * s)
      this.sparkHalo.setPosition(this.spark.x, this.spark.y + 10 * s).setScale(1.9 * s)
      if (this.trail) this.trail.emitting = !this.reduced && speed > 18
    }
  }
}
