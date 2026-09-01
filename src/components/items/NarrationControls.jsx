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
import { useState } from 'react'

function NarrationPill({ label, src }) {
  const [revealed, setRevealed] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  if (!src) return null

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => setRevealed(true)}
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

  return (
    <audio
      autoPlay
      controls
      preload="auto"
      src={src}
      onError={() => setLoadFailed(true)}
      className="h-9 max-w-[220px]"
    >
      Your browser does not support the audio element.
    </audio>
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
