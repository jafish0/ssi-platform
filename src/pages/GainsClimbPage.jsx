// "The Ascent" climb prototype at /gains-demo/climb (GAINS Draft 17).
//
// The second playable traversal — Zone 4 (Bright Reaches) → Zone 5 (the
// Beacon). Same shell as the bird-flight prototype page: instructions →
// Begin (also the mobile audio-unlock gesture) → climb → completion beat →
// replay in place. NOT wired into the real SessionEngine yet.

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'
import TraversalGame from '../components/TraversalGame.jsx'
import { GAINS_FEEDBACK_SECTIONS } from './GainsDemoPage.jsx'

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
    <DemoPageLayout
      banner={false}
      homeTo="/gains-demo"
      homeLabel="GAINS for Teens · Demo"
      footerPath="/gains-demo/climb"
      feedbackProgram="gains-teens"
      feedbackSections={GAINS_FEEDBACK_SECTIONS}
      feedbackDefaultSection="zone-4"
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
          The Ascent — Zone 4 → 5 climb
        </h1>
        <p className="text-[14px] text-slate-600 leading-relaxed max-w-[620px]">
          The second traversal prototype, built on the same game engine as the
          bird flight. Climb through three stages — tree, mountain, crystal
          spire — up to the Beacon. Gather orbs to keep your{' '}
          <strong>Second Wind</strong> up: as it runs low your own darkness
          closes in from the edges, and every orb pushes it back. It&apos;s{' '}
          <strong>no-fail</strong> — you can&apos;t fall or lose. Art, music,
          and feel are prototype-stage.
        </p>
      </section>

      {/* 9:16 game frame with instructions + completion overlays */}
      <div className="mx-auto w-full max-w-[420px]">
        <div
          className="relative w-full overflow-hidden rounded-3xl bg-[#05070e] shadow-card"
          style={{ aspectRatio: '9 / 16' }}
        >
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
                <li>• The air is getting thinner as you get closer to the summit.</li>
                <li>
                  • Use your <strong className="text-white">Second Wind</strong> gear to
                  collect oxygen to keep going.
                </li>
                <li>
                  • As your air runs low the{' '}
                  <strong className="text-white">darkness</strong> closes in around you —
                  grab an orb and it clears.
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
                {result.orbsCollected === 1 ? 'orb' : 'orbs'} on the way up — and the
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
        </div>

        {started && !result && (
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={climbAgain}
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
