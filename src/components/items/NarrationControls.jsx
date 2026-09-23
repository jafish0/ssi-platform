// NarrationControls — per-item audio narration for the measures/surveys
// (Draft 102). Distinct from KaiNarrationPlayer: these are short, single-
// line clips read on request, not gated narration a participant must sit
// through — no autoplay, no Continue-gating, no forward-seek lock (that
// stricter treatment belongs to the longer Kai narration, not a two-second
// question read-aloud). Fails open: a broken/missing file swaps in a
// plain message instead of a dead control.
//
// Draft 115 Part A (2026-09-22 — Dr. Sprang, Maggie, and Stephanie all
// raised this independently): two changes, both about the SAME button.
// (1) Icon-only now — no visible "Read me the question" / "Read the
// answers" label text, just the speaker glyph (a real Volume2 icon,
// matching the Draft 108 fix that already replaced the 🔊 emoji
// elsewhere — this file was the one holdout still using the emoji).
// aria-label carries the same words for screen readers, since there's no
// visible text to announce anymore. (2) NarrationControls' three slots
// (question/answers/instructions) now play as ONE sequence under a
// SINGLE button instead of up to three separate buttons side by side —
// once every pill looks like an identical unlabeled speaker icon, two or
// three of them in a row would be impossible to tell apart. The
// underlying clips are NOT merged into one audio file (nothing to
// re-generate every time either line's text changes) — this reuses the
// same sequence-playback NarrationPill already had for Draft 111's
// multi-clip NarrationButton case (e.g. Getting Unstuck's "Read the
// questions to ask yourself" playing two clips back to back).
//
// Single button, all states: unrevealed and revealed now render the SAME
// icon button (Volume2 when idle/paused, Pause when playing) — clicking
// it the first time reveals + claims + mounts the (hidden) <audio>
// element, which autoplays; clicking again toggles pause/resume; a
// finished clip restarts from the beginning on the next click. Draft 113
// (answering Draft 112's investigation): every reveal/resume claims the
// shared narrationCoordinator, so starting this pill collapses whichever
// ONE pill (or Kai clip, or Assent's player) was previously active —
// not just pausing it, fully discarding its <audio> element. This is
// what actually bounds how many narration <audio> elements can be
// mounted at once app-wide to one, and what stops two independently-
// triggered pills from ever sounding at the same time.
//
// Draft 115 Part F.4 (2026-09-22, background investigation): several
// screens (AlliesSafetyNet's per-type Transition/Type/Strengthen trio,
// SelfReflection's per-step heading/prompt pills) render a NarrationPill
// at the same JSX position across what is really a different item each
// time, with no `key` telling React they're distinct — so React reuses
// the same component instance and just updates its `src` prop instead of
// remounting. Without the reset effect below, `revealed` (and the
// mounted, autoPlay-ing <audio> element it renders) would carry over
// true from the previous item, and a `src` prop change on an
// already-mounted `<audio autoPlay>` element re-triggers playback with
// zero further clicks — reported as "recurring autoplay on later
// screens." Resetting whenever the resolved clip list actually changes
// fixes this regardless of whether every call site remembers a `key`
// (added at the known repeat sites too, belt-and-suspenders, but this is
// the fix that holds even where one gets missed).
import { useLayoutEffect, useRef, useState } from 'react'
import { Volume2, Pause } from 'lucide-react'
import { claim, release } from '../../lib/narrationCoordinator.js'

// `src` is one URL or an array of URLs played back to back as one
// sequence. `label` is never rendered as visible text — it's the
// aria-label only, so keep it as a plain description of what gets read
// (e.g. "Read this to me", "Read me this strategy").
export function NarrationPill({ label, src, className = '' }) {
  const [revealed, setRevealed] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)
  const indexRef = useRef(0)
  const token = useRef({}).current

  const srcs = Array.isArray(src) ? src.filter(Boolean) : src ? [src] : []
  const srcsKey = srcs.join('|')

  // Unmount (or a genuine change of clip, e.g. a reused component instance
  // moving on to a different item — see Draft 115 F.4 above): collapse the
  // pill and silence the element. A plain unmount alone does not stop a
  // still-sounding <audio> element (removing it from the DOM doesn't pause
  // it), so this must call .pause() itself rather than rely on release()
  // (which only forgets the coordinator claim). useLayoutEffect (not
  // useEffect) so this cleanup runs before the browser paints — changing
  // the `src` attribute on an already-mounted autoPlay element queues the
  // browser's resource-selection algorithm as a separate task, which can't
  // run before this synchronous cleanup does, so the pause is guaranteed
  // to land before the new clip could start sounding, not just likely to.
  useLayoutEffect(() => {
    return () => {
      const el = audioRef.current
      if (el) el.pause()
      release(token)
      setRevealed(false)
      setPlaying(false)
      indexRef.current = 0
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [srcsKey, token])

  if (srcs.length === 0) return null

  if (revealed && loadFailed) {
    return (
      <span className={`text-[12px] text-slate-500 italic px-1 ${className}`}>
        Audio not available yet.
      </span>
    )
  }

  function handleEnded() {
    const next = indexRef.current + 1
    if (next >= srcs.length) {
      setPlaying(false)
      release(token)
      return
    }
    indexRef.current = next
    const el = audioRef.current
    if (!el) return
    el.src = srcs[next]
    el.play().catch(() => {})
  }

  function handleToggle() {
    if (!revealed) {
      indexRef.current = 0
      claim(token, () => setRevealed(false))
      setRevealed(true)
      return
    }
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      return
    }
    // A finished clip (or sequence) replays from the top on the next
    // click; a merely-paused one resumes where it left off.
    if (el.ended) {
      indexRef.current = 0
      el.src = srcs[0]
      el.currentTime = 0
    }
    claim(token, () => setRevealed(false))
    el.play().catch(() => {})
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={playing ? `Pause — ${label}` : label}
      className={
        'inline-flex items-center justify-center w-9 h-9 min-w-[36px] min-h-[36px] rounded-full flex-shrink-0 transition-colors ' +
        (playing
          ? 'bg-ctac-teal-500 text-white'
          : 'bg-ctac-teal-50 hover:bg-ctac-teal-100 border border-ctac-teal-200 text-ctac-teal-800') +
        ' ' +
        className
      }
    >
      {playing ? <Pause size={16} strokeWidth={2} /> : <Volume2 size={16} strokeWidth={2} />}
      {revealed && (
        <audio
          ref={audioRef}
          autoPlay
          preload="auto"
          src={srcs[0]}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={handleEnded}
          onError={() => setLoadFailed(true)}
          className="hidden"
        >
          Your browser does not support the audio element.
        </audio>
      )}
    </button>
  )
}

// Each of the three clips is independent and optional — pass only the
// URLs that exist for a given item; whichever are provided play in
// question → answers → instructions order under the one button.
export default function NarrationControls({
  questionAudioUrl,
  answersAudioUrl,
  instructionsAudioUrl,
  className = '',
}) {
  const srcs = [questionAudioUrl, answersAudioUrl, instructionsAudioUrl].filter(Boolean)
  if (srcs.length === 0) return null
  return <NarrationPill label="Read this to me" src={srcs} className={className} />
}

// NarrationButton — for a screen that needs a custom label and/or a
// specific sequence of clips where NarrationControls' fixed question/
// answers/instructions 3-slot ordering doesn't fit (Draft 111 Part D:
// e.g. "Read me this strategy", "Read the questions to ask yourself"
// playing two clips back to back). `src` is one URL or an array.
export function NarrationButton({ label, src, className = '' }) {
  return <NarrationPill label={label} src={src} className={className} />
}
