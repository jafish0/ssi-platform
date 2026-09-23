import { useEffect, useRef, useState } from 'react'
import { Download, Pause, RotateCcw, Volume2 } from 'lucide-react'
import { interpolate } from '../../lib/tokens.js'
import { PrimaryButton } from './shared.jsx'
import { downloadPdf } from '../../lib/pdf.js'
import CrisisLifelineNote from '../CrisisLifelineNote.jsx'
import { claim, release } from '../../lib/narrationCoordinator.js'

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
//
// Draft 108 Part H (2026-09-10 team meeting): nothing told a participant
// this "read to me" option even existed, and Assent is the first place it
// appears. Two independent tweaks, stacked: (1) the collapsed pill's icon
// is now a real `Volume2` glyph instead of a plain 🔊 emoji, so it reads
// consistently across devices instead of however each OS happens to render
// that emoji — this is the *reliable* fix, always visible regardless of
// autoplay support. (2) `content_json.audio_autoplay_attempt` opts a
// specific item into ALSO trying to play the narration automatically in
// the background on mount, via a disposable `Audio()` instance separate
// from the pill's own audioRef — a pure best-effort bonus on top of (1),
// not a replacement for it: most mobile browsers block audio without a
// user gesture and will silently no-op here, leaving the pill exactly as
// it always was, tap-to-reveal-and-play.
//
// 2026-09-15 fix + extension (two testers + Josh flagged the bug):
// (a) the background autoplay-attempt and the manual pill used to be
// completely independent — nothing stopped someone from tapping "Read
// this to me" while the autoplay clip was already sounding, stacking a
// second overlapping audio stream. `autoplayBusy` now tracks whether the
// autoplay-attempt sequence is actually audibly playing (not just
// "attempted" — a blocked/never-started attempt, the common mobile case,
// leaves this false) and disables the pill button only for that window,
// so it fails open the instant autoplay never actually started or
// finishes/errors out. (b) `content_json.audio_url_2` is an optional
// second clip (the 988 crisis-line paragraph, which TextPrompt renders
// right after the main body via `showCrisisNote`) — when present, both
// the autoplay-attempt AND the manual pill play `src` then `src2` back
// to back, matching that reading order, instead of only ever narrating
// the first clip.
//
// 2026-09-17 (Draft 113, answering Draft 112): `autoplayBusy` only ever
// coordinated this ONE item's own two mechanisms against each other. It
// says nothing about an unrelated narration source elsewhere on the same
// screen (a NarrationPill, a KaiNarrationPlayer) — today that can't
// actually happen on the two items that use this component (Assent,
// Welcome), but the shared narrationCoordinator makes the guarantee
// hold everywhere, not just by coincidence of today's content. Every
// place this component starts sounding now also calls the coordinator's
// `claim`, on top of (not instead of) the existing autoplayBusy logic,
// which still drives the visible disabled state.
function TextPromptNarration({ src, src2, gated, onComplete, autoplayAttempt }) {
  const audioRef = useRef(null)
  const revealedAudioRef = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [completed, setCompleted] = useState(false)
  // Which clip is currently loaded into the manual (revealed) player —
  // 0 = src, 1 = src2. Only ever advances to 1 if src2 exists.
  const [sequenceIndex, setSequenceIndex] = useState(0)
  // True only while the background autoplay-attempt sequence is actually
  // sounding. Drives disabling the manual pill (see fix above).
  const [autoplayBusy, setAutoplayBusy] = useState(false)
  const token = useRef({}).current

  useEffect(() => {
    if (!gated) return
    setLoadFailed(false)
    const el = audioRef.current
    if (!el) return
    claim(token, () => el.pause())
    el.play().catch(() => {})
    // Draft 115 Part F.4: pause on unmount too, not just release() — a
    // still-sounding <audio> element isn't silenced by removing it from
    // the DOM alone (same gap KaiNarrationPlayer had).
    return () => {
      el.pause()
      release(token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gated, src])

  useEffect(() => {
    if (gated || !autoplayAttempt) return
    let cancelled = false
    let current = null
    const clips = [src, src2].filter(Boolean)

    function stopThisAttempt() {
      cancelled = true
      if (current) current.pause()
      setAutoplayBusy(false)
    }

    function playAt(i) {
      if (cancelled || i >= clips.length) {
        setAutoplayBusy(false)
        release(token)
        return
      }
      current = new Audio(clips[i])
      const advance = () => playAt(i + 1)
      current.addEventListener('ended', advance)
      current.addEventListener('error', advance)
      current
        .play()
        .then(() => {
          if (!cancelled) {
            setAutoplayBusy(true)
            claim(token, stopThisAttempt)
          }
        })
        .catch(() => {
          // Blocked by the browser's autoplay policy (the common mobile
          // case) or otherwise failed to start — fail open immediately so
          // the manual pill is never left disabled for a sequence that
          // never actually made a sound.
          cancelled = true
          setAutoplayBusy(false)
        })
    }

    playAt(0)

    return () => {
      cancelled = true
      if (current) current.pause()
      setAutoplayBusy(false)
      release(token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gated, autoplayAttempt, src, src2])

  // The manual-reveal player's own claim (see the `!revealed` button
  // below) isn't tied to an effect with a natural cleanup point the way
  // the two above are — release it too if this whole item unmounts while
  // that player is still mid-playback (e.g. the participant navigates
  // away). A harmless no-op if something else already released it.
  // Draft 115 Part F.4: pause the revealed player's own element too —
  // release() alone only forgets the coordinator claim, it doesn't stop
  // a still-sounding <audio> element that's merely been unmounted.
  useEffect(
    () => () => {
      const el = revealedAudioRef.current
      if (el) el.pause()
      release(token)
    },
    [token]
  )

  // Advance the manual/revealed player to the second clip once the first
  // one ends, and explicitly (re)issue play() on the src change — some
  // browsers don't re-run the `autoplay` attribute's play-on-load behavior
  // reliably when only the `src` attribute changes on an already-mounted
  // element. Fails open: if this play() is blocked, native `controls` are
  // still visible so the participant can just press play themselves.
  useEffect(() => {
    if (gated || !revealed || sequenceIndex === 0) return
    const el = revealedAudioRef.current
    if (!el) return
    el.play().catch(() => {})
  }, [gated, revealed, sequenceIndex])

  function handleError() {
    setLoadFailed(true)
    if (gated) {
      // Fail open, same as KaiNarrationPlayer: a missing/broken mp3 must not
      // permanently lock Continue behind audio that will never play.
      setPlaying(false)
      setCompleted(true)
      release(token)
      onComplete?.()
    }
  }

  function handleTogglePlay() {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
    } else {
      claim(token, () => el.pause())
      el.play().catch(() => {})
    }
  }

  function handleReplay() {
    const el = audioRef.current
    if (!el) return
    claim(token, () => el.pause())
    el.currentTime = 0
    el.play().catch(() => {})
  }

  function handleEnded() {
    setPlaying(false)
    setCompleted(true)
    release(token)
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
          onClick={() => {
            // Belt-and-suspenders alongside `disabled` below: while the
            // background autoplay-attempt is actually sounding, a tap here
            // must not reveal-and-play a second overlapping stream.
            if (autoplayBusy) return
            setSequenceIndex(0)
            claim(token, () => setRevealed(false))
            setRevealed(true)
          }}
          disabled={autoplayBusy}
          aria-disabled={autoplayBusy}
          className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 min-h-[44px] text-[14px] font-semibold ${
            autoplayBusy
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-ctac-teal-50 hover:bg-ctac-teal-100 border-ctac-teal-200 text-ctac-teal-800'
          }`}
        >
          <Volume2 size={16} strokeWidth={2} />
          Read this to me
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
          ref={revealedAudioRef}
          autoPlay
          controls
          preload="auto"
          src={sequenceIndex === 0 ? src : src2}
          onEnded={() => {
            if (sequenceIndex === 0 && src2) {
              setSequenceIndex(1)
            } else {
              release(token)
            }
          }}
          onError={() => {
            // Fail open: only surface the "not available" message for the
            // first clip. If the optional second clip (src2) breaks after
            // the first already played fine, silently stop rather than
            // showing an error for content the participant already heard.
            if (sequenceIndex === 0) setLoadFailed(true)
          }}
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
  // Optional second clip for the autoplay-attempt / manual-pill sequence —
  // e.g. the 988 crisis-line paragraph read right after the main body, to
  // match `showCrisisNote`'s reading-order placement below. See
  // TextPromptNarration's 2026-09-15 comment for the full sequencing.
  const audioUrl2 = content?.audio_url_2
  const audioGated = content?.audio_gated === true
  const audioAutoplayAttempt = content?.audio_autoplay_attempt === true
  const [narrationComplete, setNarrationComplete] = useState(false)
  const irbStamp = content?.irb_stamp
  const showCrisisNote = content?.show_crisis_note === true
  const continueLocked = audioGated && !!audioUrl && !narrationComplete
  const footerNote = content?.footer_note

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
          src2={audioUrl2}
          gated={audioGated}
          autoplayAttempt={audioAutoplayAttempt}
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
      {/* Draft 108 Part A.5 (2026-09-10 team meeting): a note ABOUT the
          content above (e.g. "we'll save this so you have it later") reads
          like part of the highlighted content itself when it's inside
          `wrapperClass`'s shaded box. content_json.footer_note renders in
          plain space instead, near the Continue button. */}
      {footerNote && (
        <p className="text-[14px] text-slate-600 mb-6">{interpolate(footerNote, sessionData || {})}</p>
      )}
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
