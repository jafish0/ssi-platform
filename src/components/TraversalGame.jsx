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
// To replay, remount this component with a changed `key` from the parent —
// that guarantees a full teardown + fresh game each run (no accumulating
// WebGL contexts).

import { useEffect, useRef } from 'react'

const ASSETS = {
  bgUrl: '/gains/traversal/ravine-bg.webp',
  fgUrl: '/gains/traversal/ravine-fg.png',
  birdUrl: '/gains/traversal/bird.png',
  musicUrl: '/gains/traversal/audio/music-ascent-loop.mp3',
  sfxCollectUrl: '/gains/traversal/audio/sfx-collect.mp3',
}

export default function TraversalGame({
  goal = 50,
  started = false,
  muted = false,
  reducedMotion = false,
  onComplete,
}) {
  const containerRef = useRef(null)
  const gameRef = useRef(null)
  // Latest values without re-running the mount effect.
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const startedRef = useRef(started)
  startedRef.current = started
  const mutedRef = useRef(muted)
  mutedRef.current = muted

  useEffect(() => {
    let game = null
    let cancelled = false

    Promise.all([import('phaser'), import('../game/traversalScene.js')])
      .then(([PhaserMod, sceneMod]) => {
        if (cancelled || !containerRef.current) return
        const Phaser = PhaserMod.default || PhaserMod
        const Scene = sceneMod.makeTraversalScene(Phaser)

        game = new Phaser.Game({
          type: Phaser.AUTO,
          parent: containerRef.current,
          width: 540,
          height: 960,
          backgroundColor: '#05070e',
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          fps: { target: 60 },
          render: { antialias: true, powerPreference: 'high-performance' },
          scene: [Scene],
        })

        // Registry is available synchronously; the scene reads config in
        // init() and polls 'traversalStarted' in update().
        game.registry.set('traversalConfig', {
          ...ASSETS,
          goal,
          reducedMotion,
          onComplete: (result) => {
            if (onCompleteRef.current) onCompleteRef.current(result)
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
  }, [goal, reducedMotion])

  // Signal the flight to begin once the instructions are dismissed.
  useEffect(() => {
    if (gameRef.current && started) {
      gameRef.current.registry.set('traversalStarted', true)
    }
  }, [started])

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
