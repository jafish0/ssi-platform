// Walkable zone — the Phaser scene behind /gains-demo/zone4 (GAINS Draft 68).
//
// The "in-world" template from `Gains for Teens/Walkable Zones — Concept.md`:
// a single-screen 3/4-view painterly plate you move through by tapping, with
// a handful of interactables (Spark, an activity station, the exit) that the
// React page gates. This scene owns RENDERING and MOVEMENT only:
//   - the plate, depth-sorted sprites (Traveler, Spark, frog, markers)
//   - tap-to-move with a walkable polygon set + a small waypoint graph so
//     the Traveler follows the path instead of cutting through rock
//   - direction-picked walk cycles, depth scaling, drop shadow, footstep
//     dust, tap marker, first-tap hint
//   - Spark as a waiting objective or a lagging companion with a light trail
//   - interactable glow/lock/done states, the "path lights up" beat
// PROGRESSION (what's active, which line plays, what a tap on a locked thing
// means) lives in React (GainsZone4Page) and is pushed in via setProgress();
// the scene reports back through cfg.onEvent:
//   { type: 'ready' }
//   { type: 'tap', target: 'spark'|'pond'|'exit'|null }   a tap landed
//   { type: 'arrive', target }                             walked up to it
//   { type: 'step', surface: 'stone'|'grass' }             footstep
//   { type: 'proximity', pond: 0..1 }                      ~8Hz, for audio
//   { type: 'firstTap' }
// Zone 4 is the first instance; the plate-specific data (spots, polygons,
// waypoints) is the ZONE4 block below. A second zone is a second data block.
//
// Coordinates are the plate's logical 1080x1920 space (9:16, same as the
// Claude Design overlay layers' viewBox), scaled to fit the phone frame.

const W = 1080
const H = 1920

// Traveler on-screen height at depth-scale 1 (the bottom of the path). The
// exported frames are all 560px tall with the feet on the canvas bottom, so
// one scale factor + origin (0.5, 1) aligns every direction's baseline.
const FIG_H = 250
const SRC_FIG_H = 560
const SPARK_H = 180
const SPARK_SRC_H = 290
const FROG_W = 105
const WALK_SPEED = 250 // logical px/s at depth-scale 1
// Phase C tune: 8 fps over the 6-frame cycle puts the two footfalls at
// ~2.7 steps/s, closer to a walk than 9 fps's near-jog cadence.
const WALK_FPS = 8
const TAP_MAX_DIST = 14
const TAP_MAX_MS = 350
// A tap just off the walkable area snaps to the nearest walkable point if
// it's within this; further out is ignored.
const SNAP_MAX = 170
const INTERACT_R = { spark: 130, pond: 150, exit: 170 }
const IDLE_NUDGE_MS = 6000
const NUDGE_COOLDOWN_MS = 9000
const PROXIMITY_EVERY_MS = 120

// ---- Zone 4: the Bright Reaches ---------------------------------------
const ZONE4 = {
  // Where things stand. `*Stand` is where the Traveler stops to interact.
  spots: {
    start: { x: 470, y: 1830 },
    sparkWait: { x: 590, y: 1440 },
    sparkStand: { x: 478, y: 1452 },
    pond: { x: 600, y: 1095 },
    frog: { x: 700, y: 1060 },
    exit: { x: 400, y: 500 },
    exitStand: { x: 400, y: 532 },
  },
  // Spark's "glide to the pond" gesture target (hovers over the water's
  // near edge), and where the exit's light-path starts (the junction).
  pondHover: { x: 660, y: 960 },
  // The water itself is not walkable.
  pond: { x: 816, y: 1052, rx: 196, ry: 130 },
  // Walkable set = union of these polygons, minus the pond. Authored against
  // the plate: the lit stone path (bottom → junction → plateau → ridge) and
  // the grassy pond clearing, which joins the path only through its upper-
  // left gap (the clearing's lower-left is rock).
  polys: [
    [[230, 1920], [720, 1920], [680, 1640], [300, 1640]],
    [[300, 1640], [680, 1640], [620, 1420], [330, 1420]],
    [[330, 1420], [620, 1420], [560, 1240], [350, 1240]],
    [[350, 1240], [560, 1240], [610, 1000], [400, 1000]],
    [[560, 975], [672, 893], [864, 883], [1018, 941], [1037, 1104], [912, 1210], [672, 1210], [600, 1120], [580, 1060]],
    [[400, 1000], [610, 1000], [620, 880], [380, 880]],
    [[330, 900], [660, 900], [760, 730], [150, 730]],
    [[150, 730], [760, 730], [560, 600], [100, 600]],
    [[100, 600], [560, 600], [500, 455], [300, 455]],
  ],
  grassPolys: [4],
  // Waypoint graph (a tree) along the path centerline; routing goes
  // straight when the segment is clear, else via the nearest nodes.
  nodes: [
    [470, 1830], [490, 1600], [470, 1380], [460, 1170], [500, 1040],
    [600, 1090], [500, 930], [430, 820], [330, 700], [330, 600], [400, 520],
  ],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [6, 7], [7, 8], [8, 9], [9, 10]],
  // The exit's "path lights up" follows these nodes, junction → exit.
  lightPathNodes: [4, 6, 7, 8, 9, 10],
  // Depth scale: 1 at the bottom of the path, ~0.6 at the ridge.
  depth: { yNear: 1830, yFar: 460, sNear: 1.0, sFar: 0.6 },
}

// ---- geometry helpers -------------------------------------------------
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

function inEllipse(px, py, e) {
  const dx = (px - e.x) / e.rx
  const dy = (py - e.y) / e.ry
  return dx * dx + dy * dy <= 1
}

function projectOnSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax
  const vy = by - ay
  const len2 = vx * vx + vy * vy || 1
  let t = ((px - ax) * vx + (py - ay) * vy) / len2
  t = Math.max(0, Math.min(1, t))
  return { x: ax + vx * t, y: ay + vy * t }
}

export function makeZoneWalkScene(Phaser) {
  return class ZoneWalkScene extends Phaser.Scene {
    constructor() {
      super({ key: 'ZoneWalk' })
    }

    init() {
      this.cfg = this.registry.get('zoneConfig') || {}
      this.zone = ZONE4
      this.ready = false
      this.began = false
      this.paused = true
      this.progress = { spark: 'active', pond: 'locked', exit: 'locked', sparkMode: 'waiting' }
      this.path = []
      this.pendingTarget = null
      this.facing = 'back'
      this.moving = false
      this.firstTapDone = false
      this.lastInputAt = 0
      this.lastNudgeAt = 0
      this.lastProximityAt = 0
      this.sparkGesture = null
      this.reduced = !!this.cfg.reducedMotion
    }

    // ---- lifecycle ----
    preload() {
      const c = this.cfg
      if (c.mapUrl) this.load.image('map', c.mapUrl)
      Object.entries(c.travelerUrls || {}).forEach(([k, url]) => this.load.image(`t-${k}`, url))
      ;(c.sparkUrls || []).forEach((url, i) => this.load.image(`spark-${i}`, url))
      if (c.frogUrl) this.load.image('frog', c.frogUrl)
      // A missing file must never take the zone down.
      this.load.on('loaderror', (file) => {
        // eslint-disable-next-line no-console
        console.warn('[zoneWalk] asset failed to load:', file && file.key)
      })
    }

    create() {
      this.makeTextures()
      const z = this.zone

      if (this.textures.exists('map')) {
        this.add.image(W / 2, H / 2, 'map').setDisplaySize(W, H).setDepth(0)
      } else {
        this.add.rectangle(W / 2, H / 2, W, H, 0x2a1f3d).setDepth(0)
      }

      // Frog on the pond (Mindful Place's painterly frog, reused).
      if (this.textures.exists('frog')) {
        const frog = this.add.image(z.spots.frog.x, z.spots.frog.y, 'frog').setOrigin(0.5, 0.9)
        frog.setScale(FROG_W / frog.width)
        frog.setDepth(z.spots.frog.y)
        this.frog = frog
        if (!this.reduced) {
          this.tweens.add({ targets: frog, y: frog.y - 4, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        }
      }

      this.buildTraveler()
      this.buildSpark()
      this.buildMarkers()
      this.buildInput()

      this.applyProgress()
      this.ready = true
      if (this.wantBegin) this.beginZone()
      this.emit({ type: 'ready' })
    }

    update(time, delta) {
      this.updateTraveler(delta)
      this.updateSpark(time, delta)
      this.updateProximity(time)
      this.maybeNudge(time)
    }

    emit(evt) {
      if (this.cfg.onEvent) {
        try {
          this.cfg.onEvent(evt)
        } catch {
          /* never let a listener break the loop */
        }
      }
    }

    // ---- public API (called from React via the game instance) ----
    beginZone() {
      if (!this.ready) {
        this.wantBegin = true
        return
      }
      if (this.began) return
      this.began = true
      this.paused = false
      this.lastInputAt = this.time.now
      // "camera settles": a slow zoom-out from a hair closer.
      if (!this.reduced) {
        this.cameras.main.setZoom(1.06)
        this.tweens.add({ targets: this.cameras.main, zoom: 1, duration: 2400, ease: 'Sine.easeOut' })
      }
      this.showHint()
    }

    setPaused(p) {
      this.paused = !!p
      if (this.paused) {
        this.path = []
        this.pendingTarget = null
        this.setMoving(false)
      } else {
        this.lastInputAt = this.time.now
      }
    }

    setProgress(p) {
      this.progress = { ...this.progress, ...p }
      if (this.ready) this.applyProgress()
    }

    // Spark glides toward a spot (the "follow me" gesture toward the pond),
    // then goes back to following the Traveler.
    sparkGlideTo(kind) {
      if (!this.ready || !this.spark) return
      const target = kind === 'pond' ? this.zone.pondHover : null
      if (!target) return
      this.sparkGesture = { x: target.x, y: target.y, until: this.time.now + 3200 }
      this.emit({ type: 'sfx', name: 'spark-whoosh' })
    }

    // The exit is now active: a line of light-motes rises along the path to
    // it (the chime is the page's job, alongside the state change).
    lightPath() {
      if (!this.ready) return
      const pts = this.zone.lightPathNodes.map((i) => this.zone.nodes[i])
      // Sample the polyline evenly.
      const segs = []
      let total = 0
      for (let i = 1; i < pts.length; i++) {
        const d = Phaser.Math.Distance.Between(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1])
        segs.push({ a: pts[i - 1], b: pts[i], d })
        total += d
      }
      const COUNT = 18
      for (let k = 0; k <= COUNT; k++) {
        let along = (total * k) / COUNT
        let seg = segs[0]
        for (const s of segs) {
          if (along <= s.d) {
            seg = s
            break
          }
          along -= s.d
        }
        const t = seg.d ? along / seg.d : 0
        const x = seg.a[0] + (seg.b[0] - seg.a[0]) * t + Phaser.Math.Between(-22, 22)
        const y = seg.a[1] + (seg.b[1] - seg.a[1]) * t
        this.time.delayedCall(k * 85, () => {
          const s = this.depthScale(y)
          const m = this.add.image(x, y, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe3a0)
          m.setScale(0.12 * s).setAlpha(0).setDepth(y + 2)
          this.tweens.add({
            targets: m,
            y: y - 70 * s,
            alpha: { from: 0, to: 0.95 },
            scale: 0.42 * s,
            duration: 700,
            ease: 'Sine.easeOut',
            yoyo: true,
            hold: 200,
            onComplete: () => m.destroy(),
          })
        })
      }
    }

    // ---- textures ----
    makeTextures() {
      if (!this.textures.exists('glow')) {
        const R = 64
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        for (let i = 10; i >= 1; i--) {
          g.fillStyle(0xffffff, 0.09 * (1 - i / 11))
          g.fillCircle(R, R, (R * i) / 10)
        }
        g.generateTexture('glow', R * 2, R * 2)
        g.destroy()
      }
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
      if (!this.textures.exists('dust')) {
        const R = 12
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        g.fillStyle(0xffffff, 0.55)
        g.fillCircle(R, R, R * 0.8)
        g.fillStyle(0xffffff, 0.35)
        g.fillCircle(R, R, R)
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
      if (!this.textures.exists('lock')) {
        // A small padlock: body + shackle.
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        g.fillStyle(0x0d1c2a, 0.85)
        g.fillCircle(32, 32, 30)
        g.lineStyle(5, 0xfff3d0, 0.95)
        g.strokeCircle(32, 32, 30)
        g.fillStyle(0xfff3d0, 1)
        g.fillRoundedRect(20, 30, 24, 18, 4)
        g.lineStyle(4, 0xfff3d0, 1)
        g.beginPath()
        g.arc(32, 30, 8, Math.PI, 0, false)
        g.strokePath()
        g.generateTexture('lock', 64, 64)
        g.destroy()
      }
    }

    // ---- traveler ----
    buildTraveler() {
      const z = this.zone
      const dirs = ['walk-back', 'walk-front', 'walk-side', 'walk-side-left']
      dirs.forEach((d) => {
        const frames = []
        for (let i = 1; i <= 6; i++) if (this.textures.exists(`t-${d}-${i}`)) frames.push({ key: `t-${d}-${i}` })
        if (frames.length && !this.anims.exists(d)) {
          this.anims.create({ key: d, frames, frameRate: WALK_FPS, repeat: -1 })
        }
      })

      const start = z.spots.start
      this.shadow = this.add.image(start.x, start.y + 6, 'shadow').setOrigin(0.5, 0.5).setAlpha(0.55)
      const idleKey = this.textures.exists('t-idle-back') ? 't-idle-back' : 't-idle-front'
      this.traveler = this.add.sprite(start.x, start.y, idleKey).setOrigin(0.5, 1)
      this.traveler.on('animationupdate', (anim, frame) => {
        // Two footfalls per 6-frame cycle.
        if (frame.index === 1 || frame.index === 4) this.footstep()
      })
      this.dust = this.add.particles(0, 0, 'dust', {
        lifespan: { min: 380, max: 620 },
        speed: { min: 12, max: 55 },
        angle: { min: 200, max: 340 },
        gravityY: -30,
        scale: { start: 0.9, end: 0.1 },
        alpha: { start: 0.55, end: 0 },
        tint: 0xf6dcb4,
        emitting: false,
      })
      this.dust.setDepth(start.y - 0.2)
      this.facing = 'back'
      // Breathing bob while idle: a hair of vertical stretch from the feet,
      // applied on top of the depth scale (see applyTravelerScale).
      this.bob = { v: 0 }
      if (!this.reduced) {
        this.tweens.add({ targets: this.bob, v: 1, duration: 2300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      }
      this.placeTraveler(start.x, start.y)
    }

    depthScale(y) {
      const d = this.zone.depth
      const t = (y - d.yFar) / (d.yNear - d.yFar)
      return Phaser.Math.Clamp(d.sFar + (d.sNear - d.sFar) * t, 0.56, 1.04)
    }

    placeTraveler(x, y) {
      const s = this.depthScale(y)
      const k = (FIG_H / SRC_FIG_H) * s
      this.traveler.setPosition(x, y)
      this.travelerBase = k
      this.applyTravelerScale()
      this.traveler.setDepth(y)
      this.shadow.setPosition(x, y + 4 * s).setScale(k * 3.1, k * 3.1).setDepth(y - 0.5)
      this.dust.setDepth(y - 0.2)
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
        if (this.tapMarker) this.fadeTapMarker()
        if (this.pendingTarget) {
          const t = this.pendingTarget
          this.pendingTarget = null
          this.emit({ type: 'arrive', target: t })
        }
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
      this.emit({ type: 'step', surface: this.surfaceAt(x, y) })
    }

    // ---- walkable geometry ----
    isWalkable(x, y) {
      if (inEllipse(x, y, this.zone.pond)) return false
      return this.zone.polys.some((p) => pointInPoly(x, y, p))
    }

    surfaceAt(x, y) {
      return this.zone.grassPolys.some((i) => pointInPoly(x, y, this.zone.polys[i])) ? 'grass' : 'stone'
    }

    nearestWalkable(x, y) {
      if (this.isWalkable(x, y)) return { x, y, d: 0 }
      let best = null
      for (const poly of this.zone.polys) {
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const p = projectOnSegment(x, y, poly[j][0], poly[j][1], poly[i][0], poly[i][1])
          // Pull a hair inside so it lands on the walkable side.
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
      this.zone.nodes.forEach(([nx, ny], i) => {
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
      this.zone.edges.forEach(([u, v]) => {
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

    route(fx, fy, tx, ty) {
      if (this.segmentClear(fx, fy, tx, ty)) return [{ x: tx, y: ty }]
      const na = this.nearestNode(fx, fy)
      const nb = this.nearestNode(tx, ty)
      const pts = this.nodePath(na, nb).map((i) => ({ x: this.zone.nodes[i][0], y: this.zone.nodes[i][1] }))
      // Smooth the ends: skip leading nodes we can already reach directly,
      // and trailing ones the target can be reached from directly.
      while (pts.length > 1 && this.segmentClear(fx, fy, pts[1].x, pts[1].y)) pts.shift()
      while (pts.length > 1 && this.segmentClear(pts[pts.length - 2].x, pts[pts.length - 2].y, tx, ty)) pts.pop()
      if (pts.length === 1 && this.segmentClear(fx, fy, tx, ty)) return [{ x: tx, y: ty }]
      return [...pts, { x: tx, y: ty }]
    }

    walkTo(x, y, target = null) {
      const { x: fx, y: fy } = this.traveler
      this.path = this.route(fx, fy, x, y)
      this.pendingTarget = target
      // Kick the walk animation immediately so there's no idle frame lag.
      if (this.path.length) this.face(this.path[0].x - fx, this.path[0].y - fy)
    }

    // ---- input ----
    buildInput() {
      this.input.on('pointerdown', (p) => {
        this.pDown = { x: p.x, y: p.y, t: this.time.now }
      })
      this.input.on('pointerup', (p) => {
        if (!this.pDown || this.paused || !this.began) return
        const d = Phaser.Math.Distance.Between(p.x, p.y, this.pDown.x, this.pDown.y)
        const dur = this.time.now - this.pDown.t
        this.pDown = null
        if (d > TAP_MAX_DIST || dur > TAP_MAX_MS) return
        this.handleTap(p.x, p.y)
      })
    }

    handleTap(x, y) {
      this.lastInputAt = this.time.now
      if (!this.firstTapDone) {
        this.firstTapDone = true
        this.hideHint()
        this.emit({ type: 'firstTap' })
      }
      const z = this.zone
      const target = this.hitInteractable(x, y)
      if (target) {
        this.emit({ type: 'tap', target })
        const stand = target === 'spark' ? this.sparkStandPoint() : target === 'pond' ? z.spots.pond : z.spots.exitStand
        this.showTapMarker(stand.x, stand.y)
        this.walkTo(stand.x, stand.y, target)
        return
      }
      this.emit({ type: 'tap', target: null })
      const w = this.nearestWalkable(x, y)
      if (!w || w.d > SNAP_MAX) return
      this.showTapMarker(w.x, w.y)
      this.walkTo(w.x, w.y, null)
    }

    hitInteractable(x, y) {
      const z = this.zone
      if (this.spark && Phaser.Math.Distance.Between(x, y, this.spark.x, this.spark.y) < INTERACT_R.spark) return 'spark'
      if (Phaser.Math.Distance.Between(x, y, z.spots.exit.x, z.spots.exit.y) < INTERACT_R.exit) return 'exit'
      const pondHit =
        inEllipse(x, y, { ...z.pond, rx: z.pond.rx + 40, ry: z.pond.ry + 40 }) ||
        Phaser.Math.Distance.Between(x, y, z.spots.pond.x, z.spots.pond.y) < INTERACT_R.pond
      if (pondHit) return 'pond'
      return null
    }

    // Where to stand to talk to Spark: the fixed stand spot while Spark is
    // waiting; when Spark is a companion it's already at your shoulder, so
    // "walk to Spark" just means stay put.
    sparkStandPoint() {
      if (this.progress.sparkMode === 'waiting') return this.zone.spots.sparkStand
      return { x: this.traveler.x, y: this.traveler.y }
    }

    showTapMarker(x, y) {
      const s = this.depthScale(y)
      if (this.tapMarker) this.tapMarker.destroy()
      const ring = this.add.image(x, y, 'ring').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe9b8)
      ring.setScale(0.25 * s).setAlpha(0.9).setDepth(y - 0.4)
      this.tweens.add({ targets: ring, scale: 0.75 * s, alpha: 0, duration: 650, ease: 'Sine.easeOut', onComplete: () => ring.destroy() })
      const spot = this.add.image(x, y, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe9b8)
      spot.setScale(0.55 * s).setAlpha(0.42).setDepth(y - 0.4)
      this.tapMarker = spot
    }

    fadeTapMarker() {
      const m = this.tapMarker
      this.tapMarker = null
      if (!m) return
      this.tweens.add({ targets: m, alpha: 0, scale: m.scale * 0.6, duration: 320, onComplete: () => m.destroy() })
    }

    showHint() {
      const { x, y } = this.traveler
      const s = this.depthScale(y)
      const hx = x + 10
      const hy = y - 190 * s
      const ring = this.add.image(hx, hy, 'ring').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe9b8).setDepth(H + 10)
      ring.setScale(0.22).setAlpha(0.85)
      const text = this.add
        .text(hx, hy - 60, 'Tap the path to move', {
          fontFamily: 'Nunito, ui-rounded, system-ui, sans-serif',
          fontSize: '30px',
          fontStyle: '800',
          color: '#fff7ea',
          stroke: '#1b1030',
          strokeThickness: 6,
        })
        .setOrigin(0.5, 1)
        .setDepth(H + 10)
      this.hint = [ring, text]
      if (!this.reduced) {
        this.tweens.add({ targets: ring, scale: { from: 0.22, to: 0.5 }, alpha: { from: 0.85, to: 0 }, duration: 1100, repeat: -1, ease: 'Sine.easeOut' })
        this.tweens.add({ targets: text, y: hy - 68, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      }
    }

    hideHint() {
      if (!this.hint) return
      const items = this.hint
      this.hint = null
      this.tweens.add({ targets: items, alpha: 0, duration: 300, onComplete: () => items.forEach((i) => i.destroy()) })
    }

    // ---- Spark ----
    buildSpark() {
      const z = this.zone
      const frames = []
      for (let i = 0; i < 4; i++) if (this.textures.exists(`spark-${i}`)) frames.push({ key: `spark-${i}` })
      if (!frames.length) return
      if (!this.anims.exists('spark-flicker')) this.anims.create({ key: 'spark-flicker', frames, frameRate: 5, repeat: -1 })
      const wait = z.spots.sparkWait
      const s = this.depthScale(wait.y)
      this.spark = this.add.sprite(wait.x, wait.y - 130 * s, 'spark-0').setBlendMode(Phaser.BlendModes.ADD)
      this.spark.play('spark-flicker')
      this.spark.setScale((SPARK_H / SPARK_SRC_H) * s).setDepth(wait.y + 1)
      this.sparkGround = { x: wait.x, y: wait.y }
      this.sparkBob = 0
      // Waiting-objective pulse ring on the ground under Spark.
      this.sparkRing = this.add.image(wait.x, wait.y, 'ring').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe3a0)
      this.sparkRing.setScale(0.45 * s).setAlpha(0.8).setDepth(wait.y - 0.6)
      this.sparkRingBase = 0.45 * s
      this.pulse(this.sparkRing, this.sparkRingBase)
      // Companion light-trail.
      this.trail = this.add.particles(0, 0, 'glow', {
        lifespan: { min: 500, max: 900 },
        speed: { min: 4, max: 18 },
        scale: { start: 0.22, end: 0.02 },
        alpha: { start: 0.8, end: 0 },
        tint: [0xffe3a0, 0xfff3d0, 0xffc98a],
        blendMode: 'ADD',
        frequency: 45,
        emitting: false,
      })
      this.trail.setDepth(wait.y + 0.5)
      this.trail.startFollow(this.spark)
    }

    pulse(img, baseScale) {
      if (this.reduced) return
      this.tweens.add({
        targets: img,
        scale: { from: baseScale * 0.82, to: baseScale * 1.14 },
        alpha: { from: 0.95, to: 0.28 },
        duration: 1300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    updateSpark(time, delta) {
      if (!this.spark) return
      const z = this.zone
      this.sparkBob += delta / 1000
      const bob = this.reduced ? 0 : Math.sin(this.sparkBob * 2.1) * 9
      if (this.progress.sparkMode === 'waiting') {
        const w = z.spots.sparkWait
        const s = this.depthScale(w.y)
        this.spark.setPosition(w.x, w.y - 130 * s + bob)
        this.spark.setScale((SPARK_H / SPARK_SRC_H) * s).setDepth(w.y + 1)
        if (this.trail) this.trail.emitting = false
        return
      }
      // Companion: lag toward the Traveler's shoulder (or the gesture spot).
      let gx
      let gy
      if (this.sparkGesture && time < this.sparkGesture.until) {
        gx = this.sparkGesture.x
        gy = this.sparkGesture.y
      } else {
        this.sparkGesture = null
        const t = this.traveler
        const s = this.depthScale(t.y)
        const side = this.facing === 'side' ? -1 : 1
        gx = t.x + side * 92 * s + (this.nudge ? this.nudge.dx : 0)
        gy = t.y - 20 * s + (this.nudge ? this.nudge.dy : 0)
      }
      const k = 1 - Math.exp(-delta / 320)
      this.sparkGround.x += (gx - this.sparkGround.x) * k
      this.sparkGround.y += (gy - this.sparkGround.y) * k
      const s = this.depthScale(this.sparkGround.y)
      const speed = Math.hypot(gx - this.sparkGround.x, gy - this.sparkGround.y)
      this.spark.setPosition(this.sparkGround.x, this.sparkGround.y - 215 * s + bob)
      this.spark.setScale((SPARK_H / SPARK_SRC_H) * s).setDepth(this.sparkGround.y + 1)
      if (this.trail) {
        this.trail.setDepth(this.sparkGround.y + 0.5)
        this.trail.emitting = !this.reduced && speed > 18
      }
    }

    // ---- interactable markers ----
    buildMarkers() {
      const z = this.zone
      const mk = (spot, ringScale) => {
        const s = this.depthScale(spot.y)
        const ring = this.add.image(spot.x, spot.y, 'ring').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe3a0)
        ring.setScale(ringScale * s).setAlpha(0).setDepth(spot.y - 0.6)
        const dim = this.add.image(spot.x, spot.y - 10 * s, 'glow').setTint(0x0b1226).setAlpha(0).setDepth(spot.y - 0.7)
        dim.setScale(1.6 * s, 0.9 * s)
        const lock = this.add.image(spot.x, spot.y - 46 * s, 'lock').setAlpha(0).setDepth(spot.y + 0.8).setScale(0.9 * s)
        return { ring, dim, lock, baseRing: ringScale * s, tween: null }
      }
      this.markers = {
        pond: mk(z.spots.pond, 0.55),
        exit: mk(z.spots.exit, 0.7),
      }
      // Exit: a soft standing glow toward the beacon when active.
      const e = z.spots.exit
      const es = this.depthScale(e.y)
      this.exitGlow = this.add.image(e.x, e.y - 60 * es, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe3a0)
      this.exitGlow.setScale(2.2 * es, 3.4 * es).setAlpha(0).setDepth(e.y - 0.65)
    }

    applyProgress() {
      const p = this.progress
      if (!this.markers) return
      for (const key of ['pond', 'exit']) {
        const m = this.markers[key]
        const state = p[key]
        if (m.tween) {
          m.tween.stop()
          m.tween = null
        }
        this.tweens.killTweensOf([m.ring, m.dim, m.lock])
        if (state === 'active') {
          m.dim.setAlpha(0)
          m.lock.setAlpha(0)
          m.ring.setAlpha(0.9)
          this.pulse(m.ring, m.baseRing)
        } else if (state === 'locked') {
          m.ring.setAlpha(0)
          m.dim.setAlpha(0.42)
          m.lock.setAlpha(0.8)
        } else {
          m.ring.setAlpha(0)
          m.dim.setAlpha(0)
          m.lock.setAlpha(0)
        }
      }
      if (this.exitGlow) {
        this.tweens.killTweensOf(this.exitGlow)
        if (p.exit === 'active') {
          this.exitGlow.setAlpha(0.55)
          if (!this.reduced) this.tweens.add({ targets: this.exitGlow, alpha: { from: 0.35, to: 0.75 }, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        } else this.exitGlow.setAlpha(0)
      }
      if (this.sparkRing) {
        this.tweens.killTweensOf(this.sparkRing)
        if (p.spark === 'active' && p.sparkMode === 'waiting') {
          this.sparkRing.setAlpha(0.8)
          this.pulse(this.sparkRing, this.sparkRingBase)
        } else this.sparkRing.setAlpha(0)
      }
    }

    // ---- ambient reporting ----
    updateProximity(time) {
      if (!this.traveler || time - this.lastProximityAt < PROXIMITY_EVERY_MS) return
      this.lastProximityAt = time
      const z = this.zone
      const d = Phaser.Math.Distance.Between(this.traveler.x, this.traveler.y, z.pond.x, z.pond.y)
      const pond = Phaser.Math.Clamp(1 - (d - 220) / 520, 0, 1)
      this.emit({ type: 'proximity', pond })
    }

    // Idle with an objective pending: Spark (as companion) drifts a little
    // toward it and back, a wordless "this way."
    maybeNudge(time) {
      if (this.paused || !this.began || !this.spark || this.progress.sparkMode !== 'companion') return
      if (this.moving || this.nudge) return
      if (time - this.lastInputAt < IDLE_NUDGE_MS || time - this.lastNudgeAt < NUDGE_COOLDOWN_MS) return
      const z = this.zone
      const obj = this.progress.pond === 'active' ? z.spots.pond : this.progress.exit === 'active' ? z.spots.exit : null
      if (!obj) return
      this.lastNudgeAt = time
      const dx = obj.x - this.traveler.x
      const dy = obj.y - this.traveler.y
      const len = Math.hypot(dx, dy) || 1
      this.nudge = { dx: 0, dy: 0 }
      this.tweens.add({
        targets: this.nudge,
        dx: (dx / len) * 150,
        dy: (dy / len) * 150,
        duration: 900,
        yoyo: true,
        hold: 350,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.nudge = null
        },
      })
      this.emit({ type: 'nudge' })
    }
  }
}
