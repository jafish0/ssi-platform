import { useEffect, useId, useRef, useState } from 'react'
import { PrimaryButton } from './shared.jsx'

// Draft 97 (2026-08-26): unlisted/private Vimeo videos — which the real
// production library is (verified live: the numeric id alone 403s) —
// require the access hash Vimeo appends after the id
// (vimeo.com/{id}/{hash}) to actually play; the app's earlier placeholder
// video happened to be a PUBLIC Vimeo demo clip, so this never came up
// before. Captured separately from `id` (which stays the bare numeric id
// everywhere else — analytics' `video_id`, etc.) and appended only to the
// embed URL as `&h=`. Exported — DemoPage.jsx's ReviewCard needs the same
// parsing for its own (untracked, ungated) Vimeo embeds.
export function vimeoInfoFromUrl(url) {
  if (typeof url !== 'string') return null
  const m = url.match(/vimeo\.com\/(\d+)(?:\/([a-zA-Z0-9]+))?/)
  if (!m) return null
  return { id: m[1], hash: m[2] || null }
}

// Resolve the video source for this item (Draft 67 Part C).
//
// Config shapes, in precedence order:
//   1. Variant-aware (new): { variant_key, variants: { <key>: <source> },
//      fallback } — looks up the session's saved variant selection
//      (sessionData[variant_key].selected, written by an earlier choice item
//      with that token_key) in the variants map. Missing/unset/unknown
//      selection → the fallback key's entry. This covers preview mode, old
//      sessions, and the window where some variant cuts don't exist yet —
//      point missing variants at nothing and they inherit the fallback.
//      A variant <source> is either a YouTube id (Draft 67) or a Vimeo URL
//      (Draft 80) — detected per entry, so one map may even mix hosts
//      during a window where cuts live in different places.
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
// Classify one variants-map entry (Draft 80): a Vimeo URL resolves to the
// vimeo player (with its postMessage watch tracking + gating); any other
// non-empty string is a YouTube id, exactly as Draft 67 shipped.
function sourceFromVariantValue(value, variantUsed) {
  const vimeo = vimeoInfoFromUrl(value)
  if (vimeo) return { kind: 'vimeo', id: vimeo.id, hash: vimeo.hash, variantUsed }
  if (typeof value === 'string' && value) {
    return { kind: 'youtube', id: value, variantUsed }
  }
  return { kind: 'none', id: null, variantUsed: null }
}

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
    if (used) return sourceFromVariantValue(variants[used], used)
    return { kind: 'none', id: null, variantUsed: null }
  }
  if (typeof content?.youtube_id === 'string' && content.youtube_id) {
    return { kind: 'youtube', id: content.youtube_id, variantUsed: null }
  }
  const vimeo = vimeoInfoFromUrl(content?.vimeo_url)
  if (vimeo) return { kind: 'vimeo', id: vimeo.id, hash: vimeo.hash, variantUsed: null }
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
  // Unique per-instance player id: pages can mount several Vimeo players
  // at once (variant preview), and duplicate DOM ids are invalid HTML.
  // Tracking itself is scoped by e.source, not this id.
  const reactId = useId()
  const playerId = `vimeo-player-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  // Rehydrate watch state only when the prior save belongs to the video
  // THIS mount resolved (Draft 80 review): after a back-navigation variant
  // change, the remounted player must not inherit another cut's progress —
  // that would open a required_completion gate for a video the participant
  // never played and attribute the old cut's watch data to the new one.
  // Single-source items rehydrate unconditionally: their source can't
  // change between visits and their payloads carry no provenance fields.
  const priorMatchesSource = !source.variantUsed
    ? true
    : existingResponse?.variant_used === source.variantUsed &&
      existingResponse?.video_id === source.id
  const [completionFraction, setCompletionFraction] = useState(
    priorMatchesSource ? (existingResponse?.completion_fraction ?? 0) : 0,
  )
  const [playCount, setPlayCount] = useState(
    priorMatchesSource ? (existingResponse?.play_count ?? 0) : 0,
  )
  // Whether the current viewing run has already been counted — see the
  // 'play' handler. A run ends at 'finish', so play_count reads as
  // "times the participant played the video through from the start."
  const runCountedRef = useRef(false)
  const [submitting, setSubmitting] = useState(false)

  // Listen to Vimeo postMessage events to track watch progress. Scoped to
  // THIS instance's iframe (e.source check, Draft 80) so pages that mount
  // more than one Vimeo player — the variant preview does — don't cross-feed
  // each other's play counts and progress.
  useEffect(() => {
    function handleMessage(e) {
      if (e.origin !== 'https://player.vimeo.com') return
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return
      let payload = e.data
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch {
          return
        }
      }
      if (!payload || typeof payload !== 'object') return
      // The player only emits events after an explicit addEventListener
      // subscription — it announces readiness, we subscribe. Subscribe under
      // BOTH protocol dialects: the api=1 embed answers a 'timeupdate'
      // subscription with events named 'playProgress' (and ends with
      // 'finish'), the modern SDK naming is 'timeupdate'/'ended'. Verified
      // live 2026-08-15: without the legacy names the progress stream never
      // matched and completion_fraction stayed 0 forever.
      if (payload.event === 'ready') {
        for (const ev of ['play', 'timeupdate', 'playProgress', 'ended', 'finish']) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ method: 'addEventListener', value: ev }),
            'https://player.vimeo.com',
          )
        }
      }
      if (payload.event === 'play') {
        // Count plays-from-the-start, once per viewing run — NOT every
        // 'play' event: the player fires one on each pause→resume (HTML5
        // semantics) and its startup jitters play@0/pause@0/play@0
        // (observed live 2026-08-15), all of which would read as replays
        // in the engagement analysis. A run is counted at its first
        // within-a-second play and only re-arms at 'finish', so the field
        // means "times the participant played the video from the start."
        const secs = Number(payload?.data?.seconds)
        if (!runCountedRef.current && (Number.isNaN(secs) || secs <= 1)) {
          setPlayCount((c) => c + 1)
          runCountedRef.current = true
        }
      }
      if ((payload.event === 'timeupdate' || payload.event === 'playProgress') && payload.data) {
        const pct = Number(payload.data.percent)
        if (!Number.isNaN(pct)) {
          setCompletionFraction((prev) => Math.max(prev, pct))
        }
      }
      if (payload.event === 'ended' || payload.event === 'finish') {
        runCountedRef.current = false
        setCompletionFraction(1)
      }
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
      } else if (source.kind === 'vimeo' && source.variantUsed) {
        // Variant-resolved Vimeo (Draft 80): the real watch fields —
        // that's the point of the Vimeo path — plus the same provenance
        // fields the YouTube variant path records.
        await onSave({
          watched,
          completion_fraction: Number(completionFraction.toFixed(2)),
          play_count: playCount,
          source: 'vimeo',
          video_id: source.id,
          variant_used: source.variantUsed,
        })
      } else {
        // Original single-source Vimeo payload shape, byte-for-byte —
        // live analysis code may depend on it.
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
        ? `https://player.vimeo.com/video/${source.id}?api=1&player_id=${playerId}&title=0&byline=0&portrait=0${source.hash ? `&h=${source.hash}` : ''}${autoplay ? '&autoplay=1' : ''}${showControls ? '' : '&controls=0'}`
        : null

  const frameWrapperClass = portrait
    ? 'relative w-full max-w-[360px] md:max-w-[480px] mx-auto bg-black rounded-2xl overflow-hidden mb-4 shadow-card'
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
            id={source.kind === 'vimeo' ? playerId : undefined}
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
