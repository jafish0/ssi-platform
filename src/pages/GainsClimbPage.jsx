// "The Ascent" climb prototype at /gains-demo/climb (GAINS Draft 17).
//
// The second playable traversal — Zone 4 (Bright Reaches) → Zone 5 (the
// Beacon). Instructions → Begin (also the mobile audio-unlock gesture) →
// climb → completion beat → replay in place. NOT wired into the real
// SessionEngine yet.
//
// 2026-09-03 (Josh): like Zone 4, this is now a full-viewport stage
// (FullscreenStage) instead of a page with the demo header and a
// description -- the hub card on /gains-demo carries the description; the
// in-frame instructions carry the controls.

import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react'
import TraversalGame from '../components/TraversalGame.jsx'
import FullscreenStage from '../components/gains/zone/FullscreenStage.jsx'

export default function GainsClimbPage() {
  const [restartNonce, setRestartNonce] = useState(0)
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)
  const [result, setResult] = useState(null)

  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    const prev = document.title
    document.title = 'GAINS for Teens — The Ascent (climb prototype)'
    return () => {
      document.title = prev
    }
  }, [])

  function climbAgain() {
    setResult(null)
    setRestartNonce((n) => n + 1)
  }

  return (
    <FullscreenStage section="review-ascent" onRestart={climbAgain} showRestart={started && !result}>
      <TraversalGame
        mode="climb"
        started={started}
        muted={muted}
        reducedMotion={reducedMotion}
        restartSignal={restartNonce}
        onComplete={setResult}
      />

      {started && !result && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/35 hover:bg-black/55 text-white/90"
        >
          {muted ? <VolumeX size={18} strokeWidth={1.75} /> : <Volume2 size={18} strokeWidth={1.75} />}
        </button>
      )}

      {/* Instructions */}
      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-7 bg-gradient-to-b from-[#05070e]/70 via-[#05070e]/80 to-[#05070e]/90">
          <Sparkles size={30} strokeWidth={1.5} className="text-amber-200 mb-3" />
          <h2 className="text-[22px] font-bold text-white mb-3">The Ascent</h2>
          <ul className="text-[14px] text-amber-50/90 leading-relaxed space-y-2 mb-6 text-left max-w-[290px]">
            <li>• Steer with one thumb — drag anywhere (or the arrow keys).</li>
            <li>
              • Collect the glowing <strong className="text-white">gold feelings</strong> —
              hope, courage, pride, calm — to refill your{' '}
              <strong className="text-white">Second Wind</strong> and keep climbing.
            </li>
            <li>
              • <strong className="text-white">Heavy feelings</strong> drift into your
              path and block the way. <strong className="text-white">Tap one to fire
              your Focusing Lens</strong> — a beam of light reveals what it is, then
              shatters it into gold feelings you can gather.
            </li>
            <li>
              • If your air runs low, the darkness closes in — grab a gold feeling
              and it clears.
            </li>
          </ul>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-7 py-3 text-[15px]"
          >
            Begin the ascent
          </button>
          <p className="text-[12px] text-white/50 mt-4">Best with sound on 🔊</p>
        </div>
      )}

      {/* Completion beat */}
      {result && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-amber-100/10 to-[#05070e]/70 backdrop-blur-[2px]">
          <Sparkles size={30} strokeWidth={1.5} className="text-amber-200 mb-3" />
          <h2 className="text-[22px] font-bold text-white mb-2">
            You reached the Beacon.
          </h2>
          <p className="text-[15px] text-amber-100/90 mb-6">
            You gathered{' '}
            <span className="font-bold text-white">{result.orbsCollected}</span>{' '}
            {result.orbsCollected === 1 ? 'orb' : 'orbs'} on the way up, and the
            darkness lifted in the light of the Beacon.
          </p>
          <button
            type="button"
            onClick={climbAgain}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-6 py-2.5 text-[15px]"
          >
            <RotateCcw size={16} strokeWidth={2} />
            Climb again
          </button>
        </div>
      )}
    </FullscreenStage>
  )
}
