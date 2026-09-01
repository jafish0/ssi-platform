import { useEffect, useRef, useState } from 'react'
import { Download, Pause, RotateCcw, Volume2 } from 'lucide-react'
import { interpolate } from '../../lib/tokens.js'
import { PrimaryButton } from './shared.jsx'
import { downloadPdf } from '../../lib/pdf.js'
import CrisisLifelineNote from '../CrisisLifelineNote.jsx'

// "Read this to me" narration — a collapsed pill, not an always-visible
// player: ported from Assent.jsx's AssentNarration, made src-driven so any
// text_prompt item can opt in via content_json.audio_url. Does not autoplay
// on mount and does not gate the Continue button — pure accessibility/
// support add-on. Fail-open: a missing/broken mp3 swaps in a plain message
// instead of a dead control.
//
// Draft 107 (2026-09-01): `content_json.audio_gated` opts a specific item
// into Kai-style behavior instead — autoplay on mount, no native scrub bar
// (same "remove the thing that lets you skip" fix as KaiNarrationPlayer,
// Draft 106), and the Continue button held until `onComplete` fires.
// Deliberately per-item rather than a change to the shared default: Assent
// and the 90-day follow-up's "Welcome back" also use this same component
// for their own audio_url, and Josh's ask was specifically about the main
// Welcome screen — an opt-in flag means those two keep today's optional,
// non-gating pill unless a later draft turns it on for them too.
function TextPromptNarration({ src, gated, onComplete }) {
  const audioRef = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!gated) return
    setLoadFailed(false)
    const el = audioRef.current
    if (!el) return
    el.play().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gated, src])

  function handleError() {
    setLoadFailed(true)
    if (gated) {
      // Fail open, same as KaiNarrationPlayer: a missing/broken mp3 must not
      // permanently lock Continue behind audio that will never play.
      setPlaying(false)
      setCompleted(true)
      onComplete?.()
    }
  }

  function handleTogglePlay() {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
    } else {
      el.play().catch(() => {})
    }
  }

  function handleReplay() {
    const el = audioRef.current
    if (!el) return
    el.currentTime = 0
    el.play().catch(() => {})
  }

  function handleEnded() {
    setPlaying(false)
    setCompleted(true)
    onComplete?.()
  }

  if (gated) {
    return (
      <div className="mb-5 rounded-2xl border border-ctac-teal-200 bg-ctac-teal-50 p-4 text-center">
        {loadFailed ? (
          <p className="text-[13px] text-slate-600 italic">
            The audio isn&apos;t available yet — you can keep reading below.
          </p>
        ) : (
          <>
            {/* No native `controls` — no visible scrub bar means no seek
                gesture to police, same reasoning as KaiNarrationPlayer. */}
            <audio
              ref={audioRef}
              src={src}
              preload="auto"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={handleEnded}
              onError={handleError}
              className="hidden"
            >
              Your browser does not support the audio element.
            </audio>
            <div className="flex items-center justify-center gap-3">
              {!completed && (
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  aria-label={playing ? 'Pause narration' : 'Play narration'}
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-4 py-2 min-h-[40px] text-[13px]"
                >
                  {playing ? (
                    <Pause size={14} strokeWidth={2} />
                  ) : (
                    <Volume2 size={14} strokeWidth={2} />
                  )}
                  {playing ? 'Pause' : 'Play'}
                </button>
              )}
              {completed && (
                <button
                  type="button"
                  onClick={handleReplay}
                  aria-label="Replay narration"
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-ctac-teal-100 text-ctac-teal-800 font-semibold rounded-full border border-ctac-teal-300 px-4 py-2 min-h-[40px] text-[13px]"
                >
                  <RotateCcw size={14} strokeWidth={2} />
                  Replay
                </button>
              )}
            </div>
            {!completed && (
              <p className="text-[12px] text-ctac-teal-700/80 italic mt-2">
                The Continue button unlocks when this finishes playing.
              </p>
            )}
          </>
        )}
      </div>
    )
  }

  if (!revealed) {
    return (
      <div className="text-center mb-5">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="inline-flex items-center gap-2 bg-ctac-teal-50 hover:bg-ctac-teal-100 border border-ctac-teal-200 text-ctac-teal-800 font-semibold rounded-full px-4 py-2 min-h-[44px] text-[14px]"
        >
          🔊 Read this to me
        </button>
      </div>
    )
  }

  return (
    <div className="mb-5 rounded-2xl border border-ctac-teal-200 bg-ctac-teal-50 p-4 text-center">
      {loadFailed ? (
        <p className="text-[13px] text-slate-600 italic">
          The audio isn&apos;t available yet — you can keep reading below.
        </p>
      ) : (
        <audio
          autoPlay
          controls
          preload="auto"
          src={src}
          onError={() => setLoadFailed(true)}
          className="w-full"
        >
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  )
}

// The IRB approval stamp (as it appears on the stamped consent/assent PDF
// on file) — content_json.irb_stamp is an array of lines, e.g.
// ['IRB Approval', '8/13/2026', 'IRB # 115131', 'IRB3']. Positioned to sit
// near the top-right corner of the item card, matching where the stamp
// appears on the physical document.
function IRBStamp({ lines }) {
  return (
    <div
      className="absolute -top-2 -right-2 sm:top-0 sm:right-0 border-2 border-orange-600 rounded px-2 py-1 bg-white text-center leading-tight"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      {lines.map((line, i) => (
        <div key={i} className="text-[10px] text-blue-900 whitespace-nowrap">
          {line}
        </div>
      ))}
    </div>
  )
}

export default function TextPrompt({ content, onSave, sessionData }) {
  const [submitting, setSubmitting] = useState(false)
  const heading = content?.heading
  const body = interpolate(content?.body || '', sessionData || {})
  const format = content?.format || 'standard'
  const showButton = content?.show_continue_button !== false
  const continueLabel = content?.continue_label || 'Keep going →'
  const downloadCfg = content?.download_button
  const audioUrl = content?.audio_url
  const audioGated = content?.audio_gated === true
  const [narrationComplete, setNarrationComplete] = useState(false)
  const irbStamp = content?.irb_stamp
  const showCrisisNote = content?.show_crisis_note === true
  const continueLocked = audioGated && !!audioUrl && !narrationComplete

  async function handleContinue() {
    if (submitting || continueLocked) return
    setSubmitting(true)
    try {
      await onSave({ viewed: true })
    } finally {
      setSubmitting(false)
    }
  }

  function handleDownload() {
    downloadPdf({
      title: heading || downloadCfg?.label || 'Your plan',
      body,
      filename: downloadCfg?.filename || 'plan.pdf',
    })
  }

  let bodyClass = 'text-[16px] leading-relaxed text-slate-800 whitespace-pre-wrap'
  let wrapperClass = ''
  if (format === 'callout') {
    wrapperClass = 'bg-ctac-teal-50 border-l-4 border-ctac-teal-300 rounded-2xl px-5 py-4 mb-6'
  } else if (format === 'pull_forward_highlight') {
    wrapperClass = 'bg-ctac-teal-50 border-l-4 border-ctac-teal-300 rounded-2xl px-5 py-4 mb-6'
  } else {
    wrapperClass = 'mb-6'
  }

  return (
    <div className="relative">
      {irbStamp?.length > 0 && <IRBStamp lines={irbStamp} />}
      {audioUrl && (
        <TextPromptNarration
          src={audioUrl}
          gated={audioGated}
          onComplete={() => setNarrationComplete(true)}
        />
      )}
      {heading && <h2 className="text-[22px] font-semibold mb-3">{heading}</h2>}
      <div className={wrapperClass}>
        {format === 'pull_forward_highlight' && !content?.hide_pull_forward_label && (
          <div className="text-[13px] font-medium text-ctac-teal-800 mb-1">
            From earlier:
          </div>
        )}
        <p className={bodyClass}>{body}</p>
      </div>
      {showCrisisNote && <CrisisLifelineNote className="mb-6" />}
      {(downloadCfg || showButton) && (
        <div className="flex flex-wrap justify-end gap-3">
          {downloadCfg && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-ctac-teal-100 hover:bg-ctac-teal-200 text-ctac-teal-800 font-semibold rounded-full px-6 py-3 min-h-[52px] transition-colors"
            >
              <Download size={18} strokeWidth={1.5} />
              {downloadCfg.label || 'Download'}
            </button>
          )}
          {showButton && (
            <PrimaryButton onClick={handleContinue} disabled={submitting || continueLocked}>
              {submitting ? 'Saving…' : continueLabel}
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  )
}
