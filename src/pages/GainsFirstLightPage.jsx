// "The First Light" traversal prototype at /gains-demo/firstlight (GAINS
// Draft 82) — Zone 1 (The Dark Abyss) → Zone 2 (the Lantern Path).
// Instructions → Begin (also the mobile audio-unlock gesture) → the
// traversal → completion beat → replay in place, same pattern as the
// Ascent (GainsClimbPage.jsx) and the flight (GainsTraversalPage.jsx).

import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react'
import TraversalGame from '../components/TraversalGame.jsx'
import FullscreenStage from '../components/gains/zone/FullscreenStage.jsx'
import GainsButton from '../components/gains/ds/Button.jsx'
import '../styles/gains-tokens.css'

export default function GainsFirstLightPage() {
  const [restartNonce, setRestartNonce] = useState(0)
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)
  const [result, setResult] = useState(null)

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    const prev = document.title
    document.title = 'GAINS for Teens — The First Light (traversal prototype)'
    return () => {
      document.title = prev
    }
  }, [])

  function again() {
    setResult(null)
    setRestartNonce((n) => n + 1)
  }

  return (
    <FullscreenStage section="review-firstlight" onRestart={again} showRestart={started && !result}>
      <TraversalGame
        mode="firstlight"
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
          className="absolute z-10 p-2 rounded-full"
          style={{ top: 10, right: 10, background: 'rgba(2,17,39,.45)', color: 'var(--text-bright)' }}
        >
          {muted ? <VolumeX size={18} strokeWidth={1.75} /> : <Volume2 size={18} strokeWidth={1.75} />}
        </button>
      )}

      {/* Instructions */}
      {!started && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-7"
          style={{ background: 'linear-gradient(180deg, rgba(2,17,39,.55) 0%, rgba(2,17,39,.78) 60%, rgba(2,17,39,.92) 100%)' }}
        >
          <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--text-warm)', marginBottom: 12 }} />
          <h2 className="text-[22px] font-extrabold mb-3" style={{ color: 'var(--text-bright)' }}>
            The First Light
          </h2>
          <ul className="text-[14px] leading-relaxed space-y-2 mb-6 text-left max-w-[290px]" style={{ color: 'var(--text-body)' }}>
            <li>
              • It's dark. Your <strong style={{ color: 'var(--text-bright)' }}>Lantern</strong> lights only a small circle.
            </li>
            <li>• Tap toward the faint embers you can see in the dark.</li>
            <li>
              • Each one you reach flares into a <strong style={{ color: 'var(--text-bright)' }}>lamp</strong> and your light grows,
              revealing the next few steps.
            </li>
            <li>• Things that loom in the dark turn out to be ordinary once you can see them.</li>
            <li>• Non-fail — take your time. Nothing hurts you, nothing chases you.</li>
          </ul>
          <GainsButton size="lg" onClick={() => setStarted(true)}>
            Begin
          </GainsButton>
          <p className="text-[12px] mt-4" style={{ color: 'var(--text-body)' }}>
            Best with sound on 🔊
          </p>
        </div>
      )}

      {/* Completion beat */}
      {result && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style={{ background: 'var(--sky-beacon)' }}>
          <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--text-on-warm)', margin: '0 auto 12px' }} />
          <h2 className="text-[22px] font-extrabold mb-2" style={{ color: 'var(--text-on-warm)' }}>
            The Lantern Path opens.
          </h2>
          <p className="text-[15px] mb-6" style={{ color: 'rgba(58,29,5,.85)' }}>
            You lit <strong>{result.lampsLit}</strong> lamps and found your way past{' '}
            <strong>{result.shapesRevealed}</strong> {result.shapesRevealed === 1 ? 'thing' : 'things'} that only looked scary in
            the dark.
          </p>
          <GainsButton onClick={again} iconLeft={<RotateCcw size={16} strokeWidth={2} />}>
            Try again
          </GainsButton>
        </div>
      )}
    </FullscreenStage>
  )
}
