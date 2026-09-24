// "The Fogline" -- Zone 2's exit into Zone 3 (GAINS Draft 95). Reuses the
// walkable-zone engine's Traveler + companion Spark + depth-sort +
// footsteps, but movement here is hop-to-stone only (no free tap-to-walk):
// all of the interesting interaction -- the draggable Focusing Lens, the
// fog it reveals, the stone-focus timer, and the two looming shapes -- is
// owned by the DOM/React layer (`FoglineTraversal.jsx`), not this scene.
// That's a deliberate split: the pre-converted overlay assets (fog-a/b,
// mist-top, motes, lamp-glow) are animated SVGs meant to sit as DOM layers
// ABOVE the Phaser canvas (see their own motion.css: "mask #layer-fog-a and
// #layer-fog-b... in code"), and the stones/bush/stump are already painted
// into the plate art itself (nothing here renders them) -- so a CSS
// mask-image driven by the lens's live DOM position is the natural reveal
// mechanism, not a second, competing Phaser RenderTexture mask.
//
// This scene's only job: place the Traveler + Spark on the plate, and on a
// 'hop' command (see registry key 'foglineCommand', written by
// TraversalGame's imperative `sendCommand`), animate a short arc-hop from
// the current stone to the requested one, then report back via
// cfg.onEvent({ type: 'hopped', index }). It never calls cfg.onComplete --
// FoglineTraversal.jsx owns the shape/VO/completion sequencing and decides
// when the traversal is actually done.
//
// Config (via registry key 'traversalConfig'):
//   { plateUrl, travelerUrls, sparkUrls,
//     sfxUrls: { hop, whoosh },
//     reducedMotion, onEvent, onDuck }
//
// Coordinates are the plate's logical 1080x1920 space, same convention as
// the walkable zones and firstLightScene.

import { FOGLINE_STONES } from './foglineRoute.js'

const W = 1080
const H = 1920

const TRAVELER_H = 250
const SHADOW_SCALE_AT_1 = (TRAVELER_H / 560) * 3.1
const SPARK_H = 180
const SPARK_SRC_H = 255
const SPARK_ALPHA = 0.96
const SPARK_HALO_ALPHA = 0.26
const WALK_FPS = 8
const HOP_MS = 500
const HOP_MS_REDUCED = 1
const HOP_ARC_PX = 60

const STONES = FOGLINE_STONES
const DEPTH = { yNear: 1859, yFar: 138, sNear: 1.0, sFar: 0.62 }

export function makeFoglineScene(Phaser) {
  return class FoglineScene extends Phaser.Scene {
    constructor() {
      super('Fogline')
    }

    init() {
      this.cfg = this.registry.get('traversalConfig') || {}
      this.reduced = !!this.cfg.reducedMotion
      this.currentIndex = 0
      this.hopping = false
      this.facing = 'back'
      this.started = false
      this.lastCommandSeen = 0
    }

    preload() {
      const c = this.cfg
      if (c.plateUrl) this.load.image('fl-plate', c.plateUrl)
      Object.entries(c.travelerUrls || {}).forEach(([k, url]) => this.load.image(`t-${k}`, url))
      ;(c.sparkUrls || []).forEach((url, i) => this.load.image(`spark-${i}`, url))
      Object.entries(c.sfxUrls || {}).forEach(([k, url]) => url && this.load.audio(`flg-sfx-${k}`, url))
      this.load.on('loaderror', (file) => {
        // eslint-disable-next-line no-console
        console.warn('[fogline] asset failed to load:', file && file.key)
      })
    }

    create() {
      if (this.textures.exists('fl-plate')) {
        this.add.image(W / 2, H / 2, 'fl-plate').setDisplaySize(W, H).setDepth(0)
      } else {
        this.add.rectangle(W / 2, H / 2, W, H, 0x1a2436).setDepth(0)
      }
      this.makeTextures()
      this.buildTraveler()
      this.buildSpark()
      this.ready = true
    }

    update(time, delta) {
      if (!this.ready) return
      if (!this.started) {
        if (this.registry.get('traversalStarted')) this.started = true
        return
      }
      const cmd = this.registry.get('foglineCommand')
      if (cmd && cmd.token !== this.lastCommandSeen) {
        this.lastCommandSeen = cmd.token
        if (cmd.type === 'hop') this.hopTo(cmd.index)
      }
      this.updateSpark(time, delta)
    }

    makeTextures() {
      if (!this.textures.exists('shadow')) {
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        for (let i = 6; i >= 1; i--) {
          g.fillStyle(0x08101c, 0.11)
          g.fillEllipse(80, 28, (150 * i) / 6, (48 * i) / 6)
        }
        g.generateTexture('shadow', 160, 56)
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
    }

    depthScale(y) {
      const t = (y - DEPTH.yFar) / (DEPTH.yNear - DEPTH.yFar)
      return Phaser.Math.Clamp(DEPTH.sFar + (DEPTH.sNear - DEPTH.sFar) * t, DEPTH.sFar, DEPTH.sNear)
    }

    buildTraveler() {
      const dirs = ['walk-back', 'walk-front', 'walk-side', 'walk-side-left']
      dirs.forEach((d) => {
        const frames = []
        for (let i = 1; i <= 6; i++) if (this.textures.exists(`t-${d}-${i}`)) frames.push({ key: `t-${d}-${i}` })
        if (frames.length && !this.anims.exists(d)) this.anims.create({ key: d, frames, frameRate: WALK_FPS, repeat: -1 })
      })
      const start = STONES[0]
      this.shadow = this.add.image(start.x, start.y + 6, 'shadow').setOrigin(0.5, 0.5).setAlpha(0.55)
      const idleKey = this.textures.exists('t-idle-back') ? 't-idle-back' : 't-idle-front'
      this.traveler = this.add.sprite(start.x, start.y, idleKey).setOrigin(0.5, 1)
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
      this.bob = { v: 0 }
      if (!this.reduced) this.tweens.add({ targets: this.bob, v: 1, duration: 2300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      this.placeTraveler(start.x, start.y)
    }

    placeTraveler(x, y, arcOffset = 0) {
      const s = this.depthScale(y)
      this.traveler.setPosition(x, y - arcOffset)
      this.travelerDisplayH = TRAVELER_H * s
      this.applyTravelerScale()
      this.traveler.setDepth(y)
      this.shadow.setPosition(x, y + 4 * s).setScale(SHADOW_SCALE_AT_1 * s, SHADOW_SCALE_AT_1 * s).setDepth(y - 0.5)
      this.dust.setDepth(y - 0.2)
    }

    applyTravelerScale() {
      const displayH = this.travelerDisplayH || TRAVELER_H
      const bobK = this.hopping || !this.bob ? 1 : 1 + 0.014 * this.bob.v
      const k = displayH / this.traveler.height
      this.traveler.setScale(k, k * bobK)
    }

    face(dx, dy) {
      let dir
      if (Math.abs(dx) > Math.abs(dy) * 1.15) dir = dx > 0 ? 'side' : 'side-left'
      else dir = dy < 0 ? 'back' : 'front'
      this.facing = dir
      const key = `walk-${dir}`
      if (this.anims.exists(key)) this.traveler.play(key, true)
    }

    // ---- hop: a short arc from the current stone to the requested one.
    // `index` must be exactly `this.currentIndex + 1` -- FoglineTraversal.jsx
    // only ever asks for the next stone (the focus rule gates the tap), but
    // this guards it here too so a stray/duplicate command can't skip
    // stones or hop backwards.
    hopTo(index) {
      if (this.hopping || index !== this.currentIndex + 1 || index >= STONES.length) return
      this.hopping = true
      const from = STONES[this.currentIndex]
      const to = STONES[index]
      this.face(to.x - from.x, to.y - from.y)
      this.playSfx('whoosh')
      const finish = () => {
        this.currentIndex = index
        this.hopping = false
        this.traveler.anims.stop()
        const idle = this.facing === 'back' || this.facing === 'side-left' ? 't-idle-back' : 't-idle-front'
        if (this.textures.exists(idle)) this.traveler.setTexture(idle)
        this.applyTravelerScale()
        this.placeTraveler(to.x, to.y)
        this.playSfx('hop')
        this.dust.setDepth(to.y - 0.2)
        this.dust.explode(6, to.x, to.y - 2)
        this.emit('hopped', index)
      }
      if (this.reduced) {
        this.placeTraveler(to.x, to.y)
        this.time.delayedCall(HOP_MS_REDUCED, finish)
        return
      }
      const progress = { t: 0 }
      this.tweens.add({
        targets: progress,
        t: 1,
        duration: HOP_MS,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          const x = from.x + (to.x - from.x) * progress.t
          const y = from.y + (to.y - from.y) * progress.t
          const arc = Math.sin(progress.t * Math.PI) * HOP_ARC_PX
          this.placeTraveler(x, y, arc)
        },
        onComplete: finish,
      })
    }

    emit(type, index) {
      if (this.cfg.onEvent) {
        try {
          this.cfg.onEvent({ type, index })
        } catch {
          /* never let a listener break the loop */
        }
      }
    }

    playSfx(key) {
      const k = `flg-sfx-${key}`
      if (this.cache.audio.exists(k) && !this.sound.locked) this.sound.play(k, { volume: 0.55 })
    }

    // ---- Spark: companion from the start, lagging at the Traveler's
    // shoulder on the side away from the plate's own path bend, same feel
    // as firstLightScene/zoneWalkScene's companion mode. ----
    buildSpark() {
      const frames = []
      for (let i = 0; i < 4; i++) if (this.textures.exists(`spark-${i}`)) frames.push({ key: `spark-${i}` })
      if (!frames.length) return
      if (!this.anims.exists('flg-spark-flicker')) this.anims.create({ key: 'flg-spark-flicker', frames, frameRate: 5, repeat: -1 })
      const start = STONES[0]
      const sx = start.x - 90
      const sy = start.y - 40
      this.sparkHalo = this.add.image(sx, sy, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffd9a0)
      this.sparkHalo.setAlpha(SPARK_HALO_ALPHA).setScale(1.9)
      this.spark = this.add.sprite(sx, sy, 'spark-0').setAlpha(SPARK_ALPHA)
      this.spark.play('flg-spark-flicker')
      this.spark.setScale(SPARK_H / SPARK_SRC_H)
      this.sparkGround = { x: sx, y: sy }
    }

    updateSpark(time, delta) {
      if (!this.spark) return
      this.sparkBob = (this.sparkBob || 0) + delta / 1000
      const bob = this.reduced ? 0 : Math.sin(this.sparkBob * 2.1) * 9
      const t = this.traveler
      const gx = t.x - 100
      const gy = t.y - 20
      const k = 1 - Math.exp(-delta / 320)
      this.sparkGround.x += (gx - this.sparkGround.x) * k
      this.sparkGround.y += (gy - this.sparkGround.y) * k
      const s = this.depthScale(this.sparkGround.y)
      this.spark.setPosition(this.sparkGround.x, this.sparkGround.y - 215 * s + bob)
      this.spark.setScale((SPARK_H / SPARK_SRC_H) * s)
      this.spark.setDepth(this.sparkGround.y + 1)
      this.sparkHalo.setPosition(this.spark.x, this.spark.y + 10 * s).setScale(1.9 * s)
      this.sparkHalo.setDepth(this.sparkGround.y + 0.9)
    }
  }
}
