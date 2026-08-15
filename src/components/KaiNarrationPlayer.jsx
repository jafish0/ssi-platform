// KaiNarrationPlayer — shared audio-narration player (Draft 62 Part C).
//
// Used in three spots where a "Video Coming Soon" placeholder previously
// sat (Allies/Safety Net intro + Inspect-education, Getting Unstuck
// before the Challenge/Both-And exercise) — the team decided at the
// 2026-08-11 meeting that Kai's voice-only narration is enough; no video
// needed for these. Auto-plays on mount; the parent activity gates its
// Continue button on `onComplete` firing (participant can't skip past
// Kai's narration without at least letting it play once).
//
// Deliberately NOT styled like a video placeholder — it's clearly an
// audio player + transcript, using the warm amber palette instead of the
// dark 16:9 video-frame look used elsewhere in these activities.
//
// Draft 65 Part A (2026-08-13): a small circular Kai portrait sits to the
// left of the speaker icon so the participant sees who's talking — the
// icon still signals "audio," the portrait signals "who."
//
// Fails open: if the audio fails to load (e.g. Josh hasn't dropped the mp3
// in at its expected path yet — see public/kai-narration/README.md), this
// treats the transcript as the intended fallback (per the draft's own
// framing of the transcript as "a fallback if audio fails") and calls
// onComplete immediately rather than leaving the parent's Continue button
// permanently disabled.

import { useEffect, useRef, useState } from 'react'
import { Volume2, RotateCcw } from 'lucide-react'

export default function KaiNarrationPlayer({ audioSrc, transcript, onComplete }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [progress, setProgress] = useState(0) // 0..1

  // Attempt auto-play on mount. Browsers block this without prior user
  // interaction — the participant has already interacted with the page to
  // reach this screen, so it usually succeeds; if blocked, fall back to a
  // visible Play button.
  useEffect(() => {
    setLoadFailed(false)
    const el = audioRef.current
    if (!el) return
    const p = el.play()
    if (p && typeof p.catch === 'function') {
      p.then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc])

  // The mp3 for a given spot may not exist yet (Josh drops these in after
  // this ships — see public/kai-narration/README.md). The transcript is
  // explicitly meant to work as a fallback when audio fails, so a load
  // error must not permanently lock the parent's Continue button: treat it
  // as "nothing to play" and let the participant continue on the text.
  function handleError() {
    setPlaying(false)
    setLoadFailed(true)
    setCompleted(true)
    onComplete?.()
  }

  function handlePlayClick() {
    audioRef.current?.play().catch(() => {})
  }

  function handleReplay() {
    const el = audioRef.current
    if (!el) return
    el.currentTime = 0
    el.play().catch(() => {})
  }

  function handleTimeUpdate() {
    const el = audioRef.current
    if (!el || !el.duration) return
    setProgress(el.currentTime / el.duration)
  }

  function handleEnded() {
    setPlaying(false)
    setCompleted(true)
    onComplete?.()
  }

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <img
          src="/cast/images/kai-man.png"
          alt="Kai"
          className="w-10 h-10 rounded-full border-2 border-amber-300 object-cover object-top flex-shrink-0"
        />
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white flex-shrink-0"
        >
          <Volume2 size={16} strokeWidth={2} />
        </span>
        <span className="text-[14px] font-semibold text-ctac-navy">
          {loadFailed
            ? 'Audio not available yet'
            : playing
              ? 'Kai is speaking…'
              : completed
                ? 'Kai finished speaking'
                : 'Kai has something to say'}
        </span>
      </div>

      {loadFailed ? (
        <p className="text-[13px] text-amber-800 italic mb-3">
          The audio for this isn&apos;t ready yet — read along below, then
          continue whenever you&apos;re ready.
        </p>
      ) : (
        <>
          {/* Native controls stay available (visible) for accessible seek /
              pause / volume + keyboard support; the amber progress bar
              below is an always-visible "how far along" indicator alongside
              them. */}
          <audio
            ref={audioRef}
            src={audioSrc}
            controls
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={handleEnded}
            onError={handleError}
            className="w-full mb-3"
          >
            Your browser does not support the audio element.
          </audio>

          <div
            className="h-1.5 w-full bg-amber-200 rounded-full overflow-hidden mb-4"
            role="progressbar"
            aria-label="Narration progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <div
              className="h-full bg-amber-500 transition-[width]"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>

          {/* On small screens the transcript pushes the parent's gated
              Continue button below the fold, so its disabled state reads
              as broken rather than waiting — say what unlocks it
              (Draft 71 F). Hidden once the gate has released. */}
          {!completed && (
            <p className="text-[12px] text-amber-700/80 italic mb-3">
              The Continue button unlocks when Kai finishes.
            </p>
          )}

          <div className="flex items-center gap-3 mb-4">
            {autoplayBlocked && !playing && !completed && (
              <button
                type="button"
                onClick={handlePlayClick}
                aria-label="Play Kai's narration"
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-4 py-2 min-h-[40px] text-[13px]"
              >
                <Volume2 size={14} strokeWidth={2} />
                Play
              </button>
            )}
            {completed && (
              <button
                type="button"
                onClick={handleReplay}
                aria-label="Replay Kai's narration"
                className="inline-flex items-center gap-1.5 bg-white hover:bg-amber-100 text-amber-800 font-semibold rounded-full border border-amber-300 px-4 py-2 min-h-[40px] text-[13px]"
              >
                <RotateCcw size={14} strokeWidth={2} />
                Replay
              </button>
            )}
          </div>
        </>
      )}

      {transcript && (
        <div className="text-[14px] leading-relaxed text-slate-800 border-t border-amber-200 pt-3">
          {transcript}
        </div>
      )}
    </div>
  )
}
