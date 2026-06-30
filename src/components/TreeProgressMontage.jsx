// TreeProgressMontage — the cinematic "look how far you've come" growth
// replay that lands at the end of the intervention (Draft 37, Parts C–F).
//
// It reuses the <TreeProgress> rendering primitive but drives it through
// an orchestrated playback timeline (stages 0 → 5 on a deliberate curve:
// slow start, accelerate, slow back down for the bloom) instead of
// user-controlled stepping. Three coordinated layers ride on top:
//   - synced text captions that fade in/out at specific beats (Part D)
//   - a CSS background warm-shift from cream → pale-peach gradient (Part E)
//   - a soft radial glow behind the tree the moment stage 5 lands (Part F)
//
// Props:
//   onComplete  fn   — fired once when playback finishes (or is skipped)
//   autoPlay    bool (default true)  — play on mount; false renders the
//                                      final stage-5 state at rest
//   skippable   bool (default true)  — show a Skip button after 1s
//   className   string               — wrapper styling
//
// Reduced motion (`prefers-reduced-motion: reduce`): the whole timeline is
// skipped — stage 5 + glow + closing caption render immediately and
// onComplete fires on the next tick. Standard a11y move.
//
// Replay (Part C.3/C.6): "Watch again" bumps `playCount`, which re-runs
// the playback effect from beat 0. The stroke-dashoffset draw-in only
// plays on a forward stage change, so resetting stage 5 → 0 (a backward
// jump, rendered instantly by TreeProgress) and then advancing forward
// again gives a clean re-draw without any manual dashoffset juggling.
//
// Draft 38 additions:
//   - Part C: crossfade between stages. On each advance we render a static
//     "ghost" of the OUTGOING stage underneath the incoming one and fade it
//     out over ~320ms while the new stage draws in on top — so there's no
//     blank frame during React's reconciliation. The ghost is a separate
//     non-animated <TreeProgress> layer, keyed so its fade-out restarts each
//     advance; it unmounts once faded.
//   - Part D: the montage owns its closer. When playback completes it shows
//     a "Ready for your plan?" CTA → /the-plan (the SessionSummary block was
//     pulled out of the /demo preview).

import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import TreeProgress from './TreeProgress.jsx'

// Stage advances on a non-linear curve (ms from playback start). Slow
// 1s hold on the seed, a quick 0→2 spurt, steadier 2→4, then stage 5.
const STAGE_SCHEDULE = [
  { t: 0, stage: 0 },
  { t: 1000, stage: 1 },
  { t: 1600, stage: 2 },
  { t: 2500, stage: 3 },
  { t: 3400, stage: 4 },
  { t: 4200, stage: 5 },
]
// Glow lands just after stage 5 sets, in sync with the blossom cascade.
const GLOW_AT = 4600
const SKIP_AT = 1000
const TOTAL = 7000

const MONTAGE_CSS = `
.tpm-container {
  background: #fdfcf7;
  transition: background 6s ease-in-out;
}
.tpm-container.is-playing {
  background: linear-gradient(180deg, #fff8ed 0%, #fdfcf7 100%);
}
.tpm-tree {
  transition: filter 800ms ease-in;
}
.tpm-tree.is-glowing {
  filter: drop-shadow(0 0 40px rgba(253, 192, 48, 0.45));
}
.tpm-caption {
  transition: opacity 400ms ease;
  text-shadow: 0 1px 10px rgba(255, 255, 255, 0.9), 0 0 4px rgba(255, 255, 255, 0.9);
}
@keyframes tpmGhostOut { from { opacity: 1; } to { opacity: 0; } }
.tpm-ghost { animation: tpmGhostOut 320ms ease-out forwards; }
@media (prefers-reduced-motion: reduce) {
  .tpm-container, .tpm-tree, .tpm-caption { transition: none !important; }
  .tpm-ghost { animation: none !important; opacity: 0; }
}
`

const CLOSING_CAPTION = 'Look how far you’ve come.'

export default function TreeProgressMontage({
  onComplete,
  autoPlay = true,
  skippable = true,
  className = '',
}) {
  const navigate = useNavigate()
  const [stage, setStage] = useState(0)
  // Crossfade (Draft 38 C): the outgoing stage rendered underneath while it
  // fades out. `ghostKey` remounts the ghost so its CSS fade restarts.
  const [prevStage, setPrevStage] = useState(null)
  const [ghostKey, setGhostKey] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [glowing, setGlowing] = useState(false)
  const [caption, setCaption] = useState({ text: 'This is where you started.', visible: false })
  const [showSkip, setShowSkip] = useState(false)
  const [done, setDone] = useState(false)
  const [playCount, setPlayCount] = useState(0)

  const timers = useRef([])
  const completedRef = useRef(false)
  // Keep the latest onComplete in a ref so the playback effect doesn't
  // restart every time the parent passes a fresh inline callback.
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setPlaying(false)
    setShowSkip(false)
    setDone(true)
    if (onCompleteRef.current) onCompleteRef.current()
  }, [])

  const skip = useCallback(() => {
    clearTimers()
    setPrevStage(null)
    setStage(5)
    setGlowing(true)
    setCaption({ text: CLOSING_CAPTION, visible: true })
    finish()
  }, [clearTimers, finish])

  const replay = useCallback(() => {
    setPlayCount((c) => c + 1)
  }, [])

  useEffect(() => {
    completedRef.current = false
    setDone(false)
    clearTimers()

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    setPrevStage(null)

    // At-rest (no autoplay, first mount) or reduced motion: jump to the
    // final stage-5 state and report complete without animating.
    if (reduced || (!autoPlay && playCount === 0)) {
      setStage(5)
      setGlowing(true)
      setPlaying(false)
      setShowSkip(false)
      setCaption({ text: CLOSING_CAPTION, visible: true })
      const t = setTimeout(finish, 50)
      timers.current.push(t)
      return clearTimers
    }

    // Animated playback.
    setStage(0)
    setGlowing(false)
    setPlaying(true)
    setShowSkip(false)
    setCaption({ text: 'This is where you started.', visible: true })

    const push = (ms, fn) => timers.current.push(setTimeout(fn, ms))
    // Each advance crossfades: stamp the outgoing stage as a ghost (which
    // fades out via CSS) the instant the new stage mounts and draws in.
    STAGE_SCHEDULE.forEach(({ t, stage: s }, i) => {
      const from = i > 0 ? STAGE_SCHEDULE[i - 1].stage : null
      push(t, () => {
        if (from != null) {
          setPrevStage(from)
          setGhostKey((k) => k + 1)
        }
        setStage(s)
      })
      // Drop the ghost once its 320ms fade-out has finished.
      if (from != null) push(t + 360, () => setPrevStage(null))
    })
    push(GLOW_AT, () => setGlowing(true))
    if (skippable) push(SKIP_AT, () => setShowSkip(true))
    // Caption beats — fade out before the next one fades in (no overlap).
    push(1000, () => setCaption((c) => ({ ...c, visible: false })))
    push(3000, () => setCaption({ text: 'Here’s what you’ve built.', visible: true }))
    push(4500, () => setCaption((c) => ({ ...c, visible: false })))
    push(6000, () => setCaption({ text: CLOSING_CAPTION, visible: true }))
    push(TOTAL, finish)

    return clearTimers
  }, [playCount, autoPlay, skippable, clearTimers, finish])

  return (
    <div className={`tpm-container ${playing ? 'is-playing' : ''} rounded-2xl px-6 py-8 ${className}`}>
      <style>{MONTAGE_CSS}</style>

      {/* Caption band — fixed height so the tree below never jumps as
          captions fade in and out. */}
      <div className="h-16 flex items-center justify-center px-2">
        <p
          className="tpm-caption text-xl md:text-3xl font-bold text-ctac-navy text-center"
          style={{ opacity: caption.visible ? 1 : 0 }}
          aria-live="polite"
        >
          {caption.text}
        </p>
      </div>

      {/* Tree — the incoming stage (top, draws in) sits above a fading
          ghost of the outgoing stage (Draft 38 C crossfade). */}
      <div className="relative mx-auto w-full max-w-[300px]">
        {prevStage != null && (
          <div key={ghostKey} className="tpm-ghost absolute inset-0 z-0" aria-hidden="true">
            <TreeProgress stage={prevStage} animated={false} />
          </div>
        )}
        <div className={`tpm-tree relative z-10 ${glowing ? 'is-glowing' : ''}`}>
          <TreeProgress stage={stage} animated />
        </div>
      </div>

      {/* Controls — Skip during playback; "Ready for your plan?" closer once
          complete (Draft 38 D), with Watch again as a secondary affordance. */}
      <div className="mt-6">
        {showSkip && !done && (
          <div className="flex items-center justify-center min-h-[40px]">
            <button
              type="button"
              onClick={skip}
              className="text-slate-500 hover:text-slate-700 underline text-sm"
            >
              Skip
            </button>
          </div>
        )}
        {done && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-ctac-navy mb-4">Ready for your plan?</h3>
            <button
              type="button"
              onClick={() => navigate('/the-plan')}
              className="bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white rounded-full px-8 py-4 text-lg font-semibold transition-colors"
            >
              Open your plan
            </button>
            <div className="mt-4">
              <button
                type="button"
                onClick={replay}
                className="text-ctac-teal-700 hover:text-ctac-teal-900 underline text-sm"
              >
                Watch again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
