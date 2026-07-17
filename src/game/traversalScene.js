// Reusable Tier-2 traversal scene for GAINS for Teens (Draft 8).
//
// This is the SEED of the reusable `traversal` item type — every future
// zone reskins it by passing different art/palette/duration. It is
// engine-agnostic: it keeps NO globals, reads its config from the game
// registry, and reports results out through `onComplete` so React owns all
// persistent state.
//
// `makeTraversalScene(Phaser)` returns a Scene subclass — Phaser is passed
// in because it's dynamically imported (code-split) by <TraversalGame>, so
// the class can't be declared at module top level.
//
// Vertical, no-fail ascent: the world (a fixed ravine plate, dark bottom →
// gold top) pans upward past a lower-centre bird the player steers with one
// thumb. "Connection" motes descend from the top of the channel (the lights
// you're climbing toward) and are collected on overlap (purely additive —
// missing them costs nothing). The bird is clamped to the open channel, so it
// can never crash, stall, or fail — it always reaches the top, where a warm
// bloom plays and `onComplete({ motesCollected })` fires.
//
// Config (via registry key 'traversalConfig'):
//   { bgUrl, fgUrl, birdUrl, durationMs, reducedMotion, palette, onComplete }

// Source art is 768×1376; the game renders at a fixed 540×960 (9:16) base
// and Phaser's Scale.FIT handles the device — so all layout math below is
// in stable base-pixel coordinates and needs no resize recompute.
const GAME_W = 540
const GAME_H = 960
const PLATE_RATIO = 1376 / 768 // height / width of the source plates

const DEFAULTS = {
  durationMs: 35000,
  reducedMotion: false,
  palette: { bloom: 0xfff3d0, mote: 0xffd27a, ink: 0x05070e },
}

export function makeTraversalScene(Phaser) {
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

  return class TraversalScene extends Phaser.Scene {
    constructor() {
      super('Traversal')
    }

    init() {
      const cfg = this.game.registry.get('traversalConfig') || {}
      this.cfg = {
        ...DEFAULTS,
        ...cfg,
        palette: { ...DEFAULTS.palette, ...(cfg.palette || {}) },
      }
      this.durationMs = this.cfg.durationMs
      this.reduced = !!this.cfg.reducedMotion

      // Channel the bird is kept inside (no-fail bounds).
      this.minX = GAME_W * 0.2
      this.maxX = GAME_W * 0.8
      this.baseY = GAME_H * 0.72

      this.elapsed = 0
      this.p = 0
      this.arrived = false
      this.ready = false
      this.motes = 0
      this.conns = []
      this.connSpeed = 170 // px/s, descending from the top of the channel
      this.targetX = GAME_W / 2
    }

    preload() {
      this.load.image('rv-bg', this.cfg.bgUrl)
      this.load.image('rv-fg', this.cfg.fgUrl)
      this.load.image('bird', this.cfg.birdUrl)
    }

    create() {
      const P = this.cfg.palette
      this.makeGlowTexture(P.mote)
      this.makeVignetteTexture(P.ink)

      // --- parallax plates (origin top-centre; y = top edge) ---
      // Both plates are scaled a little wider than the viewport so there's
      // vertical travel to pan through; the nearer fg is zoomed more and
      // therefore translates further → parallax depth.
      const bgW = GAME_W * 1.14
      const bgH = bgW * PLATE_RATIO
      this.travelBg = bgH - GAME_H
      this.bg = this.add
        .image(GAME_W / 2, 0, 'rv-bg')
        .setOrigin(0.5, 0)
        .setDisplaySize(bgW, bgH)
        .setDepth(5)

      const fgW = GAME_W * 1.32
      const fgH = fgW * PLATE_RATIO
      this.travelFg = fgH - GAME_H
      this.fg = this.add
        .image(GAME_W / 2, 0, 'rv-fg')
        .setOrigin(0.5, 0)
        .setDisplaySize(fgW, fgH)
        .setDepth(12)

      this.positionPlates(0)

      // --- ambient rising motes (skipped under reduced motion) ---
      if (!this.reduced) {
        this.ambient = this.add
          .particles(0, 0, 'mote', {
            x: { min: 0, max: GAME_W },
            y: GAME_H + 8,
            lifespan: 6500,
            speedY: { min: -70, max: -38 },
            speedX: { min: -14, max: 14 },
            scale: { start: 0.5, end: 0.12 },
            alpha: { start: 0.55, end: 0 },
            frequency: 230,
            quantity: 1,
            blendMode: 'ADD',
          })
          .setDepth(20)
      }

      // --- bird ---
      this.bird = this.add
        .image(GAME_W / 2, this.baseY, 'bird')
        .setDepth(45)
        .setScale(0.2)
      if (!this.reduced) {
        // wing-flap (subtle vertical squash)
        this.tweens.add({
          targets: this.bird,
          scaleY: 0.185,
          duration: 430,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
        })
        // sparkle trail
        this.trail = this.add
          .particles(0, 0, 'mote', {
            follow: this.bird,
            followOffset: { x: 0, y: 20 },
            lifespan: 620,
            speedY: { min: 20, max: 60 },
            speedX: { min: -22, max: 22 },
            scale: { start: 0.34, end: 0 },
            alpha: { start: 0.5, end: 0 },
            frequency: 75,
            blendMode: 'ADD',
          })
          .setDepth(44)
      }

      // --- vignette + arrival bloom + counter ---
      this.add.image(GAME_W / 2, GAME_H / 2, 'vignette').setDepth(40)
      this.bloom = this.add
        .rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, P.bloom, 1)
        .setDepth(60)
        .setAlpha(0)
      this.counter = this.add
        .text(GAME_W / 2, 42, '✦ 0', {
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          fontSize: '26px',
          color: '#ffe9b0',
        })
        .setOrigin(0.5, 0.5)
        .setDepth(70)
        .setAlpha(0.85)

      // --- input (one thumb; pointer + arrow keys) ---
      this.cursors = this.input.keyboard.createCursorKeys()
      const steer = (pointer) => {
        if (!this.reduced && !this.arrived) {
          this.targetX = clamp(pointer.x, this.minX, this.maxX)
        }
      }
      this.input.on('pointermove', steer)
      this.input.on('pointerdown', steer)

      // --- connection-mote spawner ---
      this.spawnTimer = this.time.addEvent({
        delay: this.reduced ? 1300 : 950,
        loop: true,
        callback: () => this.spawnConn(),
      })
      this.time.delayedCall(500, () => this.spawnConn())

      this.ready = true
    }

    positionPlates(p) {
      // As p 0→1 the plates translate downward (content scrolls down) — the
      // sensation of rising toward the gold summit.
      this.bg.y = this.travelBg * (p - 1)
      this.fg.y = this.travelFg * (p - 1)
    }

    spawnConn() {
      if (this.arrived) return
      const x = this.reduced
        ? GAME_W / 2 + Phaser.Math.Between(-55, 55)
        : Phaser.Math.Between(this.minX, this.maxX)
      const m = this.add
        .image(x, -30, 'mote')
        .setDepth(30)
        .setScale(1.5)
        .setTint(this.cfg.palette.mote)
        .setBlendMode('ADD')
      if (!this.reduced) {
        this.tweens.add({
          targets: m,
          scale: 1.85,
          duration: 720,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut',
        })
      }
      this.conns.push(m)
    }

    collect(m, i) {
      this.motes += 1
      this.counter.setText('✦ ' + this.motes)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(10)
        } catch {
          /* ignore */
        }
      }
      if (!this.reduced) {
        const burst = this.add
          .particles(m.x, m.y, 'mote', {
            lifespan: 520,
            speed: { min: 70, max: 175 },
            scale: { start: 0.55, end: 0 },
            alpha: { start: 0.9, end: 0 },
            blendMode: 'ADD',
            emitting: false,
          })
          .setDepth(46)
        burst.explode(12)
        this.time.delayedCall(650, () => burst.destroy())
      }
      m.destroy()
      this.conns.splice(i, 1)
    }

    arrive() {
      if (this.arrived) return
      this.arrived = true
      if (this.spawnTimer) this.spawnTimer.remove()
      const finish = () =>
        this.time.delayedCall(this.reduced ? 120 : 420, () => {
          if (typeof this.cfg.onComplete === 'function') {
            this.cfg.onComplete({ motesCollected: this.motes })
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
          duration: 640,
          ease: 'Quad.out',
          onComplete: () => {
            this.tweens.add({ targets: this.bloom, alpha: 0.32, duration: 700 })
            finish()
          },
        })
      }
    }

    update(time, delta) {
      if (!this.ready) return

      if (!this.arrived) {
        this.elapsed += delta
        this.p = Math.min(1, this.elapsed / this.durationMs)
        this.positionPlates(this.p)
        if (this.p >= 1) this.arrive()
      }

      // steering + bob
      if (!this.reduced) {
        if (this.cursors.left.isDown) this.targetX -= 6
        if (this.cursors.right.isDown) this.targetX += 6
        this.targetX = clamp(this.targetX, this.minX, this.maxX)
        this.bird.x += (this.targetX - this.bird.x) * 0.12
        const desiredTilt = clamp((this.targetX - this.bird.x) * 0.0016, -0.26, 0.26)
        this.bird.rotation += (desiredTilt - this.bird.rotation) * 0.1
        this.bird.y = this.baseY + Math.sin(time * 0.004) * 8
      } else {
        // calm auto-centred ascent
        this.bird.x += (GAME_W / 2 - this.bird.x) * 0.05
        this.bird.y = this.baseY
      }

      // connection motes descend from the top + collection
      for (let i = this.conns.length - 1; i >= 0; i--) {
        const m = this.conns[i]
        m.y += (this.connSpeed * delta) / 1000
        if (
          !this.arrived &&
          Phaser.Math.Distance.Between(this.bird.x, this.bird.y, m.x, m.y) < 40
        ) {
          this.collect(m, i)
          continue
        }
        if (m.y > GAME_H + 40) {
          m.destroy()
          this.conns.splice(i, 1)
        }
      }
    }

    // --- procedural textures (no extra assets to load) ---

    makeGlowTexture(color) {
      if (this.textures.exists('mote')) return
      const R = 16
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      for (let i = 6; i >= 1; i--) {
        g.fillStyle(color, 0.16)
        g.fillCircle(R, R, R * (i / 6))
      }
      g.fillStyle(0xffffff, 0.95)
      g.fillCircle(R, R, 3)
      g.generateTexture('mote', R * 2, R * 2)
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
        GAME_H * 0.56,
        GAME_H * 0.2,
        GAME_W / 2,
        GAME_H * 0.56,
        GAME_H * 0.78,
      )
      grd.addColorStop(0, `rgba(${r},${gg},${b},0)`)
      grd.addColorStop(1, `rgba(${r},${gg},${b},0.55)`)
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, GAME_W, GAME_H)
      tex.refresh()
    }
  }
}
