// Standalone traversal prototype at /gains-demo/traversal (GAINS Draft 8).
//
// Hosts the reusable <TraversalGame> in a 9:16 frame so the team can play it
// and leave feedback (reuses the shared feedback system, tagged
// program="gains-teens", section="traversal-prototype"). NOT wired into the
// real SessionEngine — this is a playable proof of the Tier-2 game engine
// and the no-fail feel.
//
// Flow: instructions screen → Begin (also unlocks mobile audio) → flight
// (gather GOAL connections to arrive) → completion beat → Fly again.

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'
import TraversalGame from '../components/TraversalGame.jsx'
import { GAINS_FEEDBACK_SECTIONS } from './GainsDemoPage.jsx'

const GOAL = 50

export default function GainsTraversalPage() {
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
    document.title = 'GAINS for Teens — Traversal prototype'
    return () => {
      document.title = prev
    }
  }, [])

  function begin() {
    setStarted(true)
  }

  // Fly again: clear the result and bump the restart signal — the wrapper
  // restarts the scene in place (reusing the unlocked audio), and it begins
  // immediately because `started` is already true.
  function flyAgain() {
    setResult(null)
    setRestartNonce((n) => n + 1)
  }

  return (
    <DemoPageLayout
      banner={false}
      homeTo="/gains-demo"
      homeLabel="GAINS for Teens · Demo"
      footerPath="/gains-demo/traversal"
      feedbackProgram="gains-teens"
      feedbackSections={GAINS_FEEDBACK_SECTIONS}
      feedbackDefaultSection="zone-2"
    >
      <div className="mb-4">
        <Link
          to="/gains-demo"
          className="inline-flex items-center gap-1 text-ctac-teal-700 hover:text-ctac-teal-900 text-[13px] font-medium"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to GAINS demo
        </Link>
      </div>

      <section className="mb-5">
        <h1 className="text-[24px] font-bold text-slate-800 mb-1">
          Traversal prototype — the ascent
        </h1>
        <p className="text-[14px] text-slate-600 leading-relaxed max-w-[620px]">
          A first playable of the between-zone flight. Gather{' '}
          <strong>{GOAL} connections</strong> to reach the light. It&apos;s{' '}
          <strong>no-fail</strong>: you can&apos;t crash or lose. Concept art,
          music, and feel are prototype-stage.
        </p>
      </section>

      {/* 9:16 game frame with instructions + completion overlays */}
      <div className="mx-auto w-full max-w-[420px]">
        <div
          className="relative w-full overflow-hidden rounded-3xl bg-[#05070e] shadow-card"
          style={{ aspectRatio: '9 / 16' }}
        >
          <TraversalGame
            goal={GOAL}
            started={started}
            muted={muted}
            reducedMotion={reducedMotion}
            restartSignal={restartNonce}
            onComplete={setResult}
          />

          {/* Mute toggle — always available once the flight is up */}
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

          {/* Instructions — shown until the player begins */}
          {!started && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-7 bg-gradient-to-b from-[#05070e]/70 via-[#05070e]/80 to-[#05070e]/90">
              <Sparkles size={30} strokeWidth={1.5} className="text-amber-200 mb-3" />
              <h2 className="text-[22px] font-bold text-white mb-3">The Ascent</h2>
              <ul className="text-[14px] text-amber-50/90 leading-relaxed space-y-2 mb-6 text-left max-w-[280px]">
                <li>• Steer with one thumb — drag anywhere (or use the arrow keys).</li>
                <li>• Gather the <strong className="text-white">connections</strong> drifting down — each one lifts you higher.</li>
                <li>• Reach <strong className="text-white">{GOAL} connections</strong> to arrive at the light.</li>
                <li>• You can&apos;t crash or fall. Take your time.</li>
              </ul>
              <button
                type="button"
                onClick={begin}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-7 py-3 text-[15px]"
              >
                Begin the climb
              </button>
              <p className="text-[12px] text-white/50 mt-4">Best with sound on 🔊</p>
            </div>
          )}

          {/* Completion beat */}
          {result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-amber-100/10 to-[#05070e]/70 backdrop-blur-[2px]">
              <Sparkles size={30} strokeWidth={1.5} className="text-amber-200 mb-3" />
              <h2 className="text-[22px] font-bold text-white mb-2">
                You gathered {result.motesCollected} Connections!
              </h2>
              <p className="text-[15px] text-amber-100/90 mb-6">
                You are ready for the next challenge.
              </p>
              <button
                type="button"
                onClick={flyAgain}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-6 py-2.5 text-[15px]"
              >
                <RotateCcw size={16} strokeWidth={2} />
                Fly again
              </button>
            </div>
          )}
        </div>

        {/* Replay control below the frame (available during flight) */}
        {started && !result && (
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={flyAgain}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full px-5 py-2 min-h-[40px] text-[13px]"
            >
              <RotateCcw size={14} strokeWidth={2} />
              Restart
            </button>
          </div>
        )}

        <p className="text-center text-[12px] text-slate-400 mt-3">
          Prototype · not yet wired into the session flow · reduced-motion
          supported
        </p>
      </div>
    </DemoPageLayout>
  )
}
