// "The First Light" — a new traversal (GAINS Draft 82), Zone 1's exit into
// Zone 2. Reuses the walkable-zone engine's movement (tap-to-move over a
// walkable polygon + waypoint graph, y-depth sorting, direction-picked walk
// cycles, footsteps by surface, companion Spark with lag/bob/trail --
// ported from zoneWalkScene.js) and adds the one new thing: a darkness mask
// that reveals the route as six lamps are lit along the way.
//
// One line: it's dark; the Lantern lights only a small circle; tap toward
// faint embers and each one you reach flares into a lamp and widens your
// light, revealing the next few steps, until the Lantern Path opens at the
// crest. Non-fail, no timer, nothing chases you.
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
//   { routeUrl, travelerUrls, sparkUrls, emberUrl, lampUrl,
//     shapeUrls: { tree, boulder, signpost, creature },
//     musicUrl, heartbeatUrl,
//     sfxUrls: { chime, whoosh, stepStone, stepGrass, arriveSwell },
//     voUrls: { start, firstEmber, shape, halfway, arrive },
//     reducedMotion, onComplete, onDuck }
//
// Coordinates are the plate's logical 1080x1920 space, same convention as
// the walkable zones (the route plate is authored at that scale).

const W = 1080
const H = 1920

const FIG_H = 250
const SRC_FIG_H = 560
const SPARK_H = 180
const SPARK_SRC_H = 255
const SPARK_ALPHA = 0.96
const SPARK_HALO_ALPHA = 0.26
const WALK_SPEED = 250
const WALK_FPS = 8
const TAP_MAX_DIST = 14
const TAP_MAX_MS = 350
const SNAP_MAX = 170

// Light radius grows one step per lamp lit (0..6).
const LIGHT_MIN = 180
const LIGHT_MAX = 520
const SPARK_LIGHT_R = 110
const LAMP_POOL_R = 190
// A shape "looms" once within this multiple of the current light radius,
// and resolves (silhouette fades, revealing the plate's own painted object)
// once the light itself reaches it.
const LOOM_FACTOR = 1.5
const SHAPE_FADE_MS = 600
const EMBER_REACH_R = 90
const CREST_TRIGGER_R = 260

// ---- the route (authored against the 1080x1920 plate) -----------------
const ROUTE = {
  start: { x: 540, y: 1830 },
  crest: { x: 555, y: 260 }, // where the ground rises into the Lantern Path
  embers: [
    { x: 560, y: 1650 },
    { x: 520, y: 1440 },
    { x: 580, y: 1200 },
    { x: 540, y: 950 },
    { x: 570, y: 660 },
    { x: 555, y: 380 },
  ],
  shapes: [
    { key: 'tree', x: 260, y: 800 },
    { key: 'boulder', x: 260, y: 1260 },
    { key: 'signpost', x: 800, y: 760 },
    { key: 'creature', x: 820, y: 1010 },
  ],
  // A generous ribbon following the path's gentle curve, bottom to crest.
  polys: [
    [[420, 1830], [660, 1830], [660, 1650], [420, 1650]],
    [[420, 1650], [660, 1650], [640, 1440], [400, 1440]],
    [[400, 1440], [640, 1440], [700, 1200], [440, 1200]],
    [[440, 1200], [700, 1200], [660, 950], [400, 950]],
    [[400, 950], [660, 950], [690, 660], [430, 660]],
    [[430, 660], [690, 660], [675, 380], [415, 380]],
    [[415, 380], [675, 380], [660, 200], [430, 200]],
  ],
  nodes: [
    [540, 1830], [560, 1650], [520, 1440], [580, 1200], [540, 950],
    [570, 660], [555, 380], [555, 260],
  ],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  depth: { yNear: 1830, yFar: 260, sNear: 1.0, sFar: 0.62 },
}

function pointInPoly(px, py, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    const hit = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    if (hit) inside = !inside
  }
  return inside
}

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
      this.path = []
      this.pendingTarget = null
      this.facing = 'back'
      this.moving = false
      this.lampsLit = 0
      this.shapesRevealed = 0
      this.lightRadius = LIGHT_MIN
      this.arrived = false
      this.started = false
      this.firstTapDone = false
      this.anyLooming = false
    }

    preload() {
      const c = this.cfg
      if (c.routeUrl) this.load.image('route', c.routeUrl)
      Object.entries(c.travelerUrls || {}).forEach(([k, url]) => this.load.image(`t-${k}`, url))
      ;(c.sparkUrls || []).forEach((url, i) => this.load.image(`spark-${i}`, url))
      if (c.emberUrl) this.load.image('ember', c.emberUrl)
      if (c.lampUrl) this.load.image('lamp', c.lampUrl)
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
      // see the depth notes in makeMask). Reduced motion: none.
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

      this.buildEmbers()
      this.buildShapes()
      this.buildTraveler()
      this.buildSpark()
      this.buildMask()
      this.buildInput()

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
      this.updateEmbers()
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
      // A gentle nudge: Spark drifts a little ahead toward the first ember
      // for a few seconds, then settles into normal companion lag.
      const first = this.route.embers[0]
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
    }

    // ---- darkness mask ----
    // A RenderTexture, cleared and refilled near-opaque every frame, then
    // erased (soft radial stamps) at the Traveler, Spark, and every lit
    // lamp -- so it hides the PLATE (and only the plate: the traveler,
    // spark, embers and shapes render at a higher depth than the mask and
    // manage their own visibility, since a shape must still be visible as
    // it looms even though it's outside the erased area). A very faint
    // ~3% ambient stays everywhere so it never reads as a true void.
    buildMask() {
      if (!this.textures.exists('light-soft')) {
        const R = 256
        const tex = this.textures.createCanvas('light-soft', R * 2, R * 2)
        const ctx = tex.getContext()
        const grd = ctx.createRadialGradient(R, R, 0, R, R, R)
        grd.addColorStop(0, 'rgba(255,255,255,1)')
        grd.addColorStop(0.72, 'rgba(255,255,255,0.92)')
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
      rt.fill(0x03060d, 0.97)
      const stampAt = (x, y, radius) => {
        this.lightStamp.setPosition(x, y).setScale(radius / this.lightTexR)
        rt.erase(this.lightStamp)
      }
      for (const e of this.route.embers) {
        if (e.lit) stampAt(e.x, e.y, LAMP_POOL_R)
      }
      if (this.spark) stampAt(this.spark.x, this.spark.y, SPARK_LIGHT_R)
      if (this.traveler) stampAt(this.traveler.x, this.traveler.y - 130, this.lightRadius)
    }

    // ---- embers -> lamps ----
    buildEmbers() {
      this.emberSprites = this.route.embers.map((e) => {
        const img = this.textures.exists('ember')
          ? this.add.image(e.x, e.y, 'ember').setOrigin(0.5, 1)
          : this.add.rectangle(e.x, e.y, 24, 70, 0x3a2a10).setOrigin(0.5, 1)
        // Lamp-post height, normalized like the shapes/traveler -- the
        // source art (273x895) is a full waist-to-finial iron lamp post,
        // scaled down to a sensible in-world prop height rather than
        // rendered at its native pixel size.
        const srcH = img.height || 380
        img.setScale(Math.min(1, 380 / srcH))
        img.setDepth(H + 50)
        // Always a faint glimmer, even far away, so there's something to
        // walk toward -- brightens a touch once truly nearby.
        img.setAlpha(0.5)
        e.sprite = img
        e.lit = false
        return e
      })
    }

    updateEmbers() {
      if (!this.traveler) return
      for (const e of this.route.embers) {
        if (e.lit) continue
        const d = Phaser.Math.Distance.Between(this.traveler.x, this.traveler.y, e.x, e.y)
        const near = clamp(1 - (d - EMBER_REACH_R) / 260, 0, 1)
        e.sprite.setAlpha(0.5 + near * 0.4)
        if (d <= EMBER_REACH_R) this.lightEmber(e)
      }
    }

    lightEmber(e) {
      e.lit = true
      this.lampsLit += 1
      if (this.textures.exists('lamp')) e.sprite.setTexture('lamp')
      e.sprite.setAlpha(1)
      if (!this.reduced) {
        const burst = this.add
          .particles(e.x, e.y - 60, 'glow', {
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
      }
      this.playSfx('chime')
      const targetRadius = LIGHT_MIN + (LIGHT_MAX - LIGHT_MIN) * (this.lampsLit / this.route.embers.length)
      if (this.reduced) this.lightRadius = targetRadius
      else {
        this.tweens.add({ targets: this, lightRadius: targetRadius, duration: 900, ease: 'Sine.out' })
      }
      if (this.lampsLit === 1) this.playVo('firstEmber')
      if (this.lampsLit === 3) this.playVo('halfway')
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
        s.resolved = false
        s.looming = false
        return s
      })
    }

    updateShapes(delta) {
      if (!this.traveler) return
      let anyLooming = false
      for (const s of this.route.shapes) {
        if (s.resolved) continue
        const d = Phaser.Math.Distance.Between(this.traveler.x, this.traveler.y, s.x, s.y)
        const loomR = this.lightRadius * LOOM_FACTOR
        if (d <= this.lightRadius) {
          // The light reaches it: resolve (fade the silhouette, revealing
          // the plate's own painted, now-lit object beneath).
          s.resolved = true
          s.looming = false
          this.shapesRevealed += 1
          this.tweens.add({ targets: s.sprite, alpha: 0, duration: SHAPE_FADE_MS, ease: 'Sine.out' })
          if (this.shapesRevealed === 1) this.playVo('shape')
        } else if (d <= loomR) {
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
      if (this.lampsLit < this.route.embers.length) return
      const d = Phaser.Math.Distance.Between(this.traveler.x, this.traveler.y, this.route.crest.x, this.route.crest.y)
      if (d <= CREST_TRIGGER_R) this.arrive()
    }

    arrive() {
      if (this.arrived) return
      this.arrived = true
      this.path = []
      this.setMoving(false)
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
          this.time.delayedCall(1100, () => {
            if (typeof this.cfg.onComplete === 'function') {
              this.cfg.onComplete({ lampsLit: this.lampsLit, shapesRevealed: this.shapesRevealed })
            }
          })
        },
      })
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
      const k = (FIG_H / SRC_FIG_H) * s
      this.traveler.setPosition(x, y)
      this.travelerBase = k
      this.applyTravelerScale()
      this.traveler.setDepth(H + 50)
      this.shadow.setPosition(x, y + 4 * s).setScale(k * 3.1, k * 3.1).setDepth(H + 49)
      this.dust.setDepth(H + 45)
    }

    applyTravelerScale() {
      const k = this.travelerBase || FIG_H / SRC_FIG_H
      const bobK = this.moving || !this.bob ? 1 : 1 + 0.014 * this.bob.v
      this.traveler.setScale(k, k * bobK)
    }

    setMoving(m) {
      if (m === this.moving) return
      this.moving = m
      if (!m) {
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
        this.dust.setDepth(H + 45)
        this.dust.explode(4, x + Phaser.Math.Between(-14, 14) * s, y - 2)
      }
      this.playSfx('stepStone')
    }

    // ---- walkable geometry (ported from zoneWalkScene.js) ----
    isWalkable(x, y) {
      return this.route.polys.some((p) => pointInPoly(x, y, p))
    }

    nearestWalkable(x, y) {
      if (this.isWalkable(x, y)) return { x, y, d: 0 }
      let best = null
      for (const poly of this.route.polys) {
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const p = projectOnSegment(x, y, poly[j][0], poly[j][1], poly[i][0], poly[i][1])
          const cx = poly.reduce((a, q) => a + q[0], 0) / poly.length
          const cy = poly.reduce((a, q) => a + q[1], 0) / poly.length
          const px = p.x + (cx - p.x) * 0.03
          const py = p.y + (cy - p.y) * 0.03
          if (!this.isWalkable(px, py)) continue
          const d = Math.hypot(px - x, py - y)
          if (!best || d < best.d) best = { x: px, y: py, d }
        }
      }
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

    walkTo(x, y) {
      const { x: fx, y: fy } = this.traveler
      if (this.segmentClear(fx, fy, x, y)) {
        this.path = [{ x, y }]
      } else {
        const na = this.nearestNode(fx, fy)
        const nb = this.nearestNode(x, y)
        const pts = this.nodePath(na, nb).map((i) => ({ x: this.route.nodes[i][0], y: this.route.nodes[i][1] }))
        while (pts.length > 1 && this.segmentClear(fx, fy, pts[1].x, pts[1].y)) pts.shift()
        while (pts.length > 1 && this.segmentClear(pts[pts.length - 2].x, pts[pts.length - 2].y, x, y)) pts.pop()
        this.path = [...pts, { x, y }]
      }
      if (this.path.length) this.face(this.path[0].x - fx, this.path[0].y - fy)
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
      if (!this.started || this.arrived) return
      this.firstTapDone = true
      const w = this.nearestWalkable(x, y)
      if (!w || w.d > SNAP_MAX) return
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
