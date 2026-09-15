// NarrationControls — per-item audio narration for the measures/surveys
// (Draft 102). Distinct from KaiNarrationPlayer: these are short, single-
// line clips read on request, not gated narration a participant must sit
// through — no autoplay, no Continue-gating, no forward-seek lock (that
// stricter treatment belongs to the longer Kai narration, not a two-second
// question read-aloud). Modeled on Assent.jsx's AssentNarration: a
// collapsed pill that reveals a native <audio autoPlay controls> on click,
// fails open (a broken/missing file just shows a plain message instead of
// a dead control).
//
// Each of the three clips is independent and optional — pass only the
// URLs that exist for a given item; a prop left undefined renders no
// button for that clip at all (e.g. an open-response demographics field
// has a question clip but no options clip).
import { useRef, useState } from 'react'

// NarrationPill — `src` is one URL or an array of URLs played back to back
// (e.g. LetterBuilder's "Read me the instructions" reading 5 separate
// clips in sequence as if they were one). A native <audio> only has one
// `src`, so a sequence swaps `src` on `onEnded` and calls `.play()` again;
// `controls` is dropped for a sequence (its scrub bar would only span the
// current clip, which is confusing) in favor of the same collapsed-pill
// look for the whole sequence, matching KaiNarrationPlayer/TextPrompt's
// own no-visible-scrubber precedent for anything longer than one clip.
export function NarrationPill({ label, src }) {
  const [revealed, setRevealed] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)
  const indexRef = useRef(0)

  const srcs = Array.isArray(src) ? src.filter(Boolean) : src ? [src] : []
  const isSequence = srcs.length > 1

  if (srcs.length === 0) return null

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => {
          indexRef.current = 0
          setRevealed(true)
        }}
        className="inline-flex items-center gap-1.5 bg-ctac-teal-50 hover:bg-ctac-teal-100 border border-ctac-teal-200 text-ctac-teal-800 font-semibold rounded-full px-3 py-1.5 min-h-[36px] text-[13px]"
      >
        🔊 {label}
      </button>
    )
  }

  if (loadFailed) {
    return (
      <span className="text-[12px] text-slate-500 italic px-1">
        Audio not available yet.
      </span>
    )
  }

  if (!isSequence) {
    return (
      <audio
        autoPlay
        controls
        preload="auto"
        src={srcs[0]}
        onError={() => setLoadFailed(true)}
        className="h-9 max-w-[220px]"
      >
        Your browser does not support the audio element.
      </audio>
    )
  }

  function handleEnded() {
    const next = indexRef.current + 1
    if (next >= srcs.length) {
      setPlaying(false)
      return
    }
    indexRef.current = next
    const el = audioRef.current
    if (!el) return
    el.src = srcs[next]
    el.play().catch(() => {})
  }

  return (
    <button
      type="button"
      onClick={() => {
        const el = audioRef.current
        if (!el) return
        if (playing) el.pause()
        else el.play().catch(() => {})
      }}
      className="inline-flex items-center gap-1.5 bg-ctac-teal-100 hover:bg-ctac-teal-200 border border-ctac-teal-300 text-ctac-teal-900 font-semibold rounded-full px-3 py-1.5 min-h-[36px] text-[13px]"
    >
      🔊 {playing ? 'Pause' : label}
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
      />
    </button>
  )
}

export default function NarrationControls({
  questionAudioUrl,
  answersAudioUrl,
  instructionsAudioUrl,
  className = '',
}) {
  if (!questionAudioUrl && !answersAudioUrl && !instructionsAudioUrl) return null
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <NarrationPill label="Read me the question" src={questionAudioUrl} />
      <NarrationPill label="Read the answers" src={answersAudioUrl} />
      <NarrationPill label="Read the instructions" src={instructionsAudioUrl} />
    </div>
  )
}

// NarrationButton — for a screen that needs a custom label and/or a
// sequence of clips under ONE button, where the fixed question/answers/
// instructions 3-slot layout of NarrationControls doesn't fit (Draft 111
// Part D: e.g. "Read me this strategy", "Read the questions to ask
// yourself" playing two clips back to back). `src` is one URL or an array.
export function NarrationButton({ label, src, className = '' }) {
  if (!src || (Array.isArray(src) && src.filter(Boolean).length === 0)) return null
  return (
    <div className={`inline-flex ${className}`}>
      <NarrationPill label={label} src={src} />
    </div>
  )
}
