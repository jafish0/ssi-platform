// React wrapper around the reusable Phaser TraversalScene (GAINS Draft 8).
//
// Phaser is lazy-loaded via dynamic import() so it's code-split into its own
// chunk and never bloats the main app bundle — it only downloads when a
// traversal actually mounts. The wrapper owns the Phaser.Game lifecycle:
// it creates the game on mount and calls game.destroy(true) on unmount to
// free the WebGL context. Persistent state lives in React; the scene reports
// results out through onComplete.
//
// The game mounts and idles immediately; the flight begins only when
// `started` flips true (set from the instructions "Begin" tap) — that also
// serves as the mobile audio-unlock gesture. `muted` toggles the sound.
//
// To replay, bump `restartSignal` — the wrapper calls scene.restart() in
// place rather than remounting. This deliberately reuses the ONE Phaser.Game
// (and its already-unlocked AudioContext): remounting would mint a fresh
// context that WebKit starts suspended with no gesture left to unlock it, so
// replayed audio would go silent (esp. in reduced motion, which has no touch).

import { useEffect, useRef } from 'react'

// Each mode is a scene + its asset set. The wrapper (lifecycle, audio
// unlock, dispose, restart-in-place) is shared — that's the reusable
// Tier-2 foundation; a new traversal is a new entry here plus a scene.
const MODES = {
  flight: {
    sceneKey: 'Traversal',
    loadScene: () =>
      import('../game/traversalScene.js').then((m) => m.makeTraversalScene),
    assets: {
      // Draft 81: the Mistfields→Bright Reaches plates + the Traveler in
      // the Wingsuit, replacing the placeholder ravine + bird now that this
      // is the real Zone 3 exit (and not just the standalone prototype).
      bgUrl: '/gains/traversal/flight-bg.webp',
      fgUrl: '/gains/traversal/flight-fg.png',
      birdUrl: '/gains/traversal/traveler-glide.png',
      musicUrl: '/gains/traversal/audio/music-ascent-loop.mp3',
      sfxCollectUrl: '/gains/traversal/audio/sfx-collect.mp3',
    },
  },
  climb: {
    sceneKey: 'Climb',
    loadScene: () =>
      import('../game/climbScene.js').then((m) => m.makeClimbScene),
    assets: {
      stageUrls: [
        '/gains/climb/stage-tree.webp',
        '/gains/climb/stage-mountain.webp',
        '/gains/climb/stage-spire.webp',
      ],
      // right → mid → left (the scene cycles right→mid→left→mid)
      climbUrls: [
        '/gains/climb/climb-right.png',
        '/gains/climb/climb-mid.png',
        '/gains/climb/climb-left.png',
      ],
      orbUrl: '/gains/climb/orb.png',
      // (no pursuer art — tension is a procedural darkness aura at the edges)
      musicUrl: '/gains/climb/audio/climb-music.mp3',
      // Air-whoosh on orb collect (Josh's "Woosh 1"), replacing the old beep.
      sfxOrbUrl: '/gains/climb/audio/sfx-air-intake.mp3',
    },
  },
  // Draft 82: "The First Light" -- Zone 1's exit into Zone 2. Reuses the
  // walkable-zone engine's movement, so it renders at that engine's own
  // 1080x1920 logical size (see `width`/`height` below) rather than the
  // other traversals' 540x960 -- its positions are authored against the
  // route plate at that scale. Draft 85: redesigned -- the lamps are
  // painted into the plate now (no ember/lamp sprites), and there are only
  // three shapes (the creature is retired).
  firstlight: {
    sceneKey: 'FirstLight',
    loadScene: () =>
      import('../game/firstLightScene.js').then((m) => m.makeFirstLightScene),
    width: 1080,
    height: 1920,
    assets: {
      routeUrl: '/gains/firstlight/route.webp',
      travelerUrls: (() => {
        const urls = { 'idle-front': '/long-light/zone1/traveler/idle-front.webp', 'idle-back': '/long-light/zone1/traveler/idle-back.webp' }
        for (const d of ['walk-back', 'walk-front', 'walk-side', 'walk-side-left']) {
          for (let i = 1; i <= 6; i++) urls[`${d}-${i}`] = `/long-light/zone1/traveler/${d}-${i}.webp`
        }
        return urls
      })(),
      sparkUrls: [1, 2, 3, 4].map((i) => `/long-light/zone1/spark/flicker-${i}.webp`),
      shapeUrls: {
        tree: '/gains/firstlight/sprites/shape-tree.png',
        boulder: '/gains/firstlight/sprites/shape-boulder.png',
        signpost: '/gains/firstlight/sprites/shape-signpost.png',
      },
      // Standalone-only (Zone 1 hands its own ambience over instead --
      // see TraversalGame's `skipMusic` prop, wired from GainsZonePage).
      musicUrl: '/long-light/zone1/audio/ambience.mp3',
      heartbeatUrl: '/gains/firstlight/audio/heartbeat.mp3',
      sfxUrls: {
        chime: '/long-light/zone4/sfx/chime-unlock.mp3',
        whoosh: '/long-light/zone4/sfx/spark-whoosh.mp3',
        stepStone: '/long-light/zone4/sfx/step-stone-1.mp3',
        arriveSwell: '/long-light/zone4/sfx/arrive-swell.mp3',
      },
      voUrls: {
        start: '/gains/firstlight/audio/t1-01-start.mp3',
        firstEmber: '/gains/firstlight/audio/t1-02-first-ember.mp3',
        shape: '/gains/firstlight/audio/t1-03-shape.mp3',
        halfway: '/gains/firstlight/audio/t1-04-halfway.mp3',
        arrive: '/gains/firstlight/audio/t1-05-arrive.mp3',
      },
    },
  },
}

export default function TraversalGame({
  mode = 'flight',
  goal = 50,
  durationMs,
  started = false,
  muted = false,
  reducedMotion = false,
  restartSignal = 0,
  onComplete,
  // Draft 82: when a host zone hands its own ambience over into this
  // traversal (Zone 1 -> The First Light) rather than restarting it, it
  // passes skipMusic so the scene never loads its own `musicUrl`, and
  // onDuck so the scene can duck the HOST's ambience under its own VO
  // without needing to know anything about the host's audio manager.
  skipMusic = false,
  onDuck,
}) {
  const containerRef = useRef(null)
  const gameRef = useRef(null)
  // Latest values without re-running the mount effect.
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const onDuckRef = useRef(onDuck)
  onDuckRef.current = onDuck
  const startedRef = useRef(started)
  startedRef.current = started
  const mutedRef = useRef(muted)
  mutedRef.current = muted

  useEffect(() => {
    let game = null
    let cancelled = false

    const modeDef = MODES[mode] || MODES.flight

    Promise.all([import('phaser'), modeDef.loadScene()])
      .then(([PhaserMod, makeScene]) => {
        if (cancelled || !containerRef.current) return
        const Phaser = PhaserMod.default || PhaserMod
        const Scene = makeScene(Phaser)

        game = new Phaser.Game({
          type: Phaser.AUTO,
          parent: containerRef.current,
          width: modeDef.width || 540,
          height: modeDef.height || 960,
          backgroundColor: '#05070e',
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          render: { antialias: true, powerPreference: 'high-performance' },
          scene: [Scene],
        })

        // Registry is available synchronously; the scene reads config in
        // init() and polls 'traversalStarted' in update().
        game.registry.set('traversalConfig', {
          ...modeDef.assets,
          ...(skipMusic ? { musicUrl: undefined } : {}),
          goal,
          ...(durationMs ? { durationMs } : {}),
          reducedMotion,
          onComplete: (result) => {
            if (onCompleteRef.current) onCompleteRef.current(result)
          },
          onDuck: (on) => {
            if (onDuckRef.current) onDuckRef.current(on)
          },
        })
        game.registry.set('traversalStarted', startedRef.current)
        game.sound.mute = mutedRef.current

        gameRef.current = game
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[TraversalGame] failed to load Phaser', err)
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
  }, [mode, goal, durationMs, reducedMotion, skipMusic])

  // Signal the flight to begin once the instructions are dismissed.
  useEffect(() => {
    if (gameRef.current && started) {
      gameRef.current.registry.set('traversalStarted', true)
    }
  }, [started])

  // Replay in place: restart the scene on the existing game (keeps the
  // already-unlocked AudioContext). Skips the initial render.
  const firstRestart = useRef(true)
  useEffect(() => {
    if (firstRestart.current) {
      firstRestart.current = false
      return
    }
    const game = gameRef.current
    if (!game) return
    game.registry.set('traversalStarted', true)
    const scene = game.scene.getScene((MODES[mode] || MODES.flight).sceneKey)
    if (scene && scene.scene) scene.scene.restart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartSignal])

  // Live mute toggle.
  useEffect(() => {
    if (gameRef.current) gameRef.current.sound.mute = muted
  }, [muted])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ touchAction: 'none' }}
    />
  )
}
