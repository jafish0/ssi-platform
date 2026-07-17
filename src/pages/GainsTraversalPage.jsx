// Standalone traversal prototype at /gains-demo/traversal (GAINS Draft 8).
//
// Hosts the reusable <TraversalGame> in a 9:16 frame so the team can play it
// and leave feedback (reuses the shared feedback system, tagged
// program="gains-teens", section="traversal-prototype"). NOT wired into the
// real SessionEngine — this is a playable proof of the Tier-2 game engine
// and the no-fail feel.

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Sparkles } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'
import TraversalGame from '../components/TraversalGame.jsx'
import { GAINS_FEEDBACK_SECTIONS } from './GainsDemoPage.jsx'

export default function GainsTraversalPage() {
  const [runKey, setRunKey] = useState(0)
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

  function replay() {
    setResult(null)
    setRunKey((k) => k + 1)
  }

  return (
    <DemoPageLayout
      banner={false}
      homeTo="/gains-demo"
      homeLabel="GAINS for Teens · Demo"
      footerPath="/gains-demo/traversal"
      feedbackProgram="gains-teens"
      feedbackSections={GAINS_FEEDBACK_SECTIONS}
      feedbackDefaultSection="traversal-prototype"
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
          A first playable of the between-zone flight. Steer with one thumb
          (drag anywhere, or arrow keys on desktop) and gather the lights
          drifting down toward you — the <em>connections</em> that carry you up.
          It&apos;s{' '}
          <strong>no-fail</strong>: you can&apos;t crash or lose, and you always
          reach the light. Concept art and feel are prototype-stage.
        </p>
      </section>

      {/* 9:16 game frame with the completion overlay */}
      <div className="mx-auto w-full max-w-[420px]">
        <div
          className="relative w-full overflow-hidden rounded-3xl bg-[#05070e] shadow-card"
          style={{ aspectRatio: '9 / 16' }}
        >
          <TraversalGame
            key={runKey}
            reducedMotion={reducedMotion}
            onComplete={setResult}
          />

          {result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-amber-100/10 to-[#05070e]/70 backdrop-blur-[2px]">
              <Sparkles size={30} strokeWidth={1.5} className="text-amber-200 mb-3" />
              <h2 className="text-[22px] font-bold text-white mb-1">
                You reached the light.
              </h2>
              <p className="text-[15px] text-amber-100/90 mb-6">
                You gathered{' '}
                <span className="font-bold text-white">{result.motesCollected}</span>{' '}
                {result.motesCollected === 1 ? 'connection' : 'connections'}.
              </p>
              <button
                type="button"
                onClick={replay}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-6 py-2.5 text-[15px]"
              >
                <RotateCcw size={16} strokeWidth={2} />
                Fly again
              </button>
            </div>
          )}
        </div>

        {/* Replay control below the frame (also available mid-flight) */}
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full px-5 py-2 min-h-[40px] text-[13px]"
          >
            <RotateCcw size={14} strokeWidth={2} />
            Replay
          </button>
        </div>

        <p className="text-center text-[12px] text-slate-400 mt-3">
          Prototype · not yet wired into the session flow · reduced-motion
          supported
        </p>
      </div>
    </DemoPageLayout>
  )
}
