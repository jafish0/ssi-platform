import { useEffect, useRef, useState } from 'react'
import { PrimaryButton } from './shared.jsx'

function vimeoIdFromUrl(url) {
  if (typeof url !== 'string') return null
  const m = url.match(/vimeo\.com\/(\d+)/)
  return m ? m[1] : null
}

// Resolve the video source for this item (Draft 67 Part C).
//
// Config shapes, in precedence order:
//   1. Variant-aware (new): { variant_key, variants: { <key>: <youtube-id> },
//      fallback } — looks up the session's saved variant selection
//      (sessionData[variant_key].selected, written by an earlier choice item
//      with that token_key) in the variants map. Missing/unset/unknown
//      selection → the fallback key's entry. This covers preview mode, old
//      sessions, and the window where some variant cuts don't exist yet —
//      point missing variants at nothing and they inherit the fallback.
//   2. Single-source YouTube (new): { youtube_id }
//   3. Single-source Vimeo (original, unchanged): { vimeo_url }
//
// The session-variable mechanism is deliberately the existing token /
// pull-forward system rather than a new session_variables column: a choice
// item with token_key "sam_variant" saves { selected: 'male' } via
// save-response, get-session-responses restores it on resume keyed by
// token_key, and every item renderer already receives that map as
// `sessionData`. Choice made once early, readable by every later item,
// survives resume — no schema or edge-function changes.
export function resolveSource(content, sessionData) {
  const variants = content?.variants
  if (variants && typeof variants === 'object' && !Array.isArray(variants)) {
    const key = content?.variant_key
    const raw = key ? sessionData?.[key]?.selected : null
    const selected = typeof raw === 'string' && variants[raw] ? raw : null
    const fallback =
      typeof content?.fallback === 'string' && variants[content.fallback]
        ? content.fallback
        : null
    const used = selected || fallback
    if (used) return { kind: 'youtube', id: variants[used], variantUsed: used }
    return { kind: 'none', id: null, variantUsed: null }
  }
  if (typeof content?.youtube_id === 'string' && content.youtube_id) {
    return { kind: 'youtube', id: content.youtube_id, variantUsed: null }
  }
  const vimeoId = vimeoIdFromUrl(content?.vimeo_url)
  if (vimeoId) return { kind: 'vimeo', id: vimeoId, variantUsed: null }
  return { kind: 'none', id: null, variantUsed: null }
}

export default function VideoPlayer({ content, onSave, sessionData, existingResponse, onContinueRef }) {
  const source = resolveSource(content, sessionData)
  const requireCompletion = content?.required_completion === true
  const threshold = content?.completion_threshold ?? 0.85
  const showControls = content?.show_controls !== false
  const autoplay = content?.autoplay === true
  // Most produced Kai/Sam cuts are vertical shorts — authored with
  // orientation: 'portrait' they render in a constrained 9:16 box instead
  // of a letterboxed full-width 16:9 frame. Default stays landscape.
  const portrait = content?.orientation === 'portrait'

  const iframeRef = useRef(null)
  const [completionFraction, setCompletionFraction] = useState(
    existingResponse?.completion_fraction ?? 0,
  )
  const [playCount, setPlayCount] = useState(existingResponse?.play_count ?? 0)
  const [submitting, setSubmitting] = useState(false)

  // Listen to Vimeo postMessage events to track watch progress.
  useEffect(() => {
    function handleMessage(e) {
      if (typeof e.data !== 'string' && typeof e.data !== 'object') return
      let payload = e.data
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch {
          return
        }
      }
      if (!payload || typeof payload !== 'object') return
      if (payload.event === 'play') setPlayCount((c) => c + 1)
      if (payload.event === 'timeupdate' && payload.data) {
        const pct = Number(payload.data.percent)
        if (!Number.isNaN(pct)) {
          setCompletionFraction((prev) => Math.max(prev, pct))
        }
      }
      if (payload.event === 'ended') setCompletionFraction(1)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Completion tracking only exists for Vimeo (its postMessage progress
  // events above). A plain YouTube embed reports nothing without the
  // IFrame API, so required_completion is unenforceable there — fail open
  // (Continue enabled) rather than lock the participant, same philosophy
  // as KaiNarrationPlayer's missing-audio path. Gating parity for YouTube
  // is an open question in AUDIT_2026-08.md.
  const watched = completionFraction >= threshold
  const canContinue = source.kind !== 'vimeo' || !requireCompletion || watched

  async function handleContinue() {
    if (submitting) return
    setSubmitting(true)
    try {
      if (source.kind === 'youtube') {
        await onSave({
          watched: null,
          completion_fraction: null,
          play_count: null,
          source: 'youtube',
          video_id: source.id,
          ...(source.variantUsed ? { variant_used: source.variantUsed } : {}),
        })
      } else {
        // Original Vimeo payload shape, byte-for-byte — live analysis
        // code may depend on it.
        await onSave({
          watched,
          completion_fraction: Number(completionFraction.toFixed(2)),
          play_count: playCount,
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // playsinline keeps iOS Safari from forcing fullscreen on play; rel=0
  // limits the end-of-video recommendation wall to same-channel videos
  // (YouTube no longer allows disabling it entirely) — Draft 68 Part D.
  const embedUrl =
    source.kind === 'youtube'
      ? `https://www.youtube.com/embed/${source.id}?playsinline=1&rel=0${autoplay ? '&autoplay=1' : ''}`
      : source.kind === 'vimeo'
        ? `https://player.vimeo.com/video/${source.id}?api=1&player_id=vimeo-player&title=0&byline=0&portrait=0${autoplay ? '&autoplay=1' : ''}${showControls ? '' : '&controls=0'}`
        : null

  const frameWrapperClass = portrait
    ? 'relative w-full max-w-[360px] mx-auto bg-black rounded-2xl overflow-hidden mb-4 shadow-card'
    : 'relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-4 shadow-card'

  return (
    <div>
      {content?.title && <h2 className="text-[22px] font-semibold mb-3">{content.title}</h2>}
      {content?.context_before && (
        <p className="text-[16px] leading-relaxed text-slate-700 mb-4">{content.context_before}</p>
      )}

      {embedUrl ? (
        <div
          className={frameWrapperClass}
          style={portrait ? { aspectRatio: '9 / 16' } : undefined}
        >
          <iframe
            id={source.kind === 'vimeo' ? 'vimeo-player' : undefined}
            ref={iframeRef}
            src={embedUrl}
            title={content?.title || 'Video'}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      ) : (
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 mb-4 text-center text-[14px] text-slate-500">
          Video unavailable.
        </div>
      )}

      {source.kind === 'vimeo' && requireCompletion && !watched && (
        <p className="text-[13px] text-slate-500 mb-4">
          Watch the video to continue. ({Math.round(completionFraction * 100)}% watched)
        </p>
      )}

      {content?.context_after && (
        <p className="text-[16px] leading-relaxed text-slate-700 mb-4">{content.context_after}</p>
      )}

      <div className="flex justify-end">
        <PrimaryButton onClick={handleContinue} disabled={!canContinue || submitting}>
          {submitting ? 'Saving…' : 'Continue'}
        </PrimaryButton>
      </div>
    </div>
  )
}
