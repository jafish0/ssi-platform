// React wrapper around the walkable-zone Phaser scene (GAINS Draft 68).
//
// Same lifecycle contract as TraversalGame: Phaser is lazy-loaded so it stays
// in its own chunk, the game is created on mount and destroyed on unmount,
// and the scene reports out through a callback. Unlike TraversalGame this
// stage is DRIVEN from React while it runs: `progress`/`paused` props push
// state into the scene, and the imperative ref exposes the one-shot beats
// (Spark's glide gesture, the exit's light-path).
//
// The canvas is 1080x1920 logical, FIT-scaled into whatever 9:16 box the
// parent gives it (the phone frame on GainsZone4Page).

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const SCENE_KEY = 'ZoneWalk'

const ZoneStage = forwardRef(function ZoneStage(
  { zoneId, base, mapFile = 'map.webp', spriteBase, frogUrl, friends, reducedMotion = false, onEvent, progress, paused = true, started = false },
  ref,
) {
  const containerRef = useRef(null)
  const gameRef = useRef(null)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent
  // Latest desired state, re-applied when the scene comes up (it may not be
  // ready the moment a prop changes).
  const wantRef = useRef({ progress, paused, started })
  wantRef.current = { progress, paused, started }

  function scene() {
    const g = gameRef.current
    if (!g) return null
    try {
      const s = g.scene.getScene(SCENE_KEY)
      return s && s.ready ? s : null
    } catch {
      return null
    }
  }

  useEffect(() => {
    let game = null
    let cancelled = false
    // Zone 3 (Draft 80) reuses Zone 4's Traveler + Spark art wholesale
    // (they share Traveler stage 3) rather than duplicating the files, so
    // the sprite URLs can come from a different base than the map/audio.
    const sb = spriteBase || base
    const travelerUrls = { 'idle-front': `${sb}/traveler/idle-front.webp`, 'idle-back': `${sb}/traveler/idle-back.webp` }
    for (const d of ['walk-back', 'walk-front', 'walk-side', 'walk-side-left']) {
      for (let i = 1; i <= 6; i++) travelerUrls[`${d}-${i}`] = `${sb}/traveler/${d}-${i}.webp`
    }

    Promise.all([import('phaser'), import('../../../game/zoneWalkScene.js')])
      .then(([PhaserMod, sceneMod]) => {
        if (cancelled || !containerRef.current) return
        const Phaser = PhaserMod.default || PhaserMod
        const Scene = sceneMod.makeZoneWalkScene(Phaser)
        game = new Phaser.Game({
          type: Phaser.AUTO,
          parent: containerRef.current,
          width: 1080,
          height: 1920,
          backgroundColor: '#1a1330',
          scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
          render: { antialias: true, powerPreference: 'high-performance' },
          scene: [Scene],
        })
        game.registry.set('zoneConfig', {
          zoneId,
          // Draft 83: `mapFile` defaults to 'map.webp' (every zone so far),
          // overridable for Zone 1's two differently-named plates sharing
          // one `base` folder.
          mapUrl: `${base}/${mapFile}`,
          travelerUrls,
          sparkUrls: [1, 2, 3, 4].map((i) => `${sb}/spark/flicker-${i}.webp`),
          frogUrl, // optional -- only Zone 4's pond has a frog
          friends, // optional -- Draft 94 (Zone 2): [{ id, before, after }]
          reducedMotion,
          onEvent: (evt) => {
            if (evt.type === 'ready') {
              // Apply whatever React already wanted before the scene was up.
              const s = scene()
              const w = wantRef.current
              if (s) {
                if (w.progress) s.setProgress(w.progress)
                s.setPaused(w.paused)
                if (w.started) s.beginZone()
              }
            }
            if (onEventRef.current) onEventRef.current(evt)
          },
        })
        gameRef.current = game
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[ZoneStage] failed to load Phaser', err)
      })

    return () => {
      cancelled = true
      const g = game || gameRef.current
      if (g) {
        try {
          g.destroy(true)
        } catch {
          /* ignore teardown races */
        }
        gameRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId, base, mapFile, spriteBase, frogUrl, friends, reducedMotion])

  useEffect(() => {
    const s = scene()
    if (s && progress) s.setProgress(progress)
  }, [progress])

  useEffect(() => {
    const s = scene()
    if (s) s.setPaused(paused)
  }, [paused])

  useEffect(() => {
    const s = scene()
    if (s && started) s.beginZone()
  }, [started])

  useImperativeHandle(ref, () => ({
    sparkGlideTo(kind) {
      const s = scene()
      if (s) s.sparkGlideTo(kind)
    },
    lightPath() {
      const s = scene()
      if (s) s.lightPath()
    },
    // Draft 93 (item 1): the live position for React's "Tap here" pointer
    // (Zone 1 only) -- see zoneWalkScene.js's pointerPosFor for why this
    // can't be a static table.
    pointerPosFor(target) {
      const s = scene()
      return s ? s.pointerPosFor(target) : null
    },
    // Draft 94 (Zone 2): the camp friends' crossfade + live position, for
    // the press-and-hold lantern gesture and its overlay UI (both owned by
    // React -- see StationSequence.jsx).
    setStationLight(id, t) {
      const s = scene()
      if (s) s.setStationLight(id, t)
    },
    stationPosFor(id) {
      const s = scene()
      return s ? s.stationPosFor(id) : null
    },
  }))

  return <div ref={containerRef} className="w-full h-full" style={{ touchAction: 'none' }} />
})

export default ZoneStage
