import { useEffect, useRef, useState } from 'react'
import { PrimaryButton } from './shared.jsx'

function vimeoIdFromUrl(url) {
  if (typeof url !== 'string') return null
  const m = url.match(/vimeo\.com\/(\d+)/)
  return m ? m[1] : null
}

export default function VideoPlayer({ content, onSave, existingResponse, onContinueRef }) {
  const id = vimeoIdFromUrl(content?.vimeo_url)
  const requireCompletion = content?.required_completion === true
  const threshold = content?.completion_threshold ?? 0.85
  const showControls = content?.show_controls !== false
  const autoplay = content?.autoplay === true

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

  const watched = completionFraction >= threshold
  const canContinue = !requireCompletion || watched

  async function handleContinue() {
    if (submitting) return
    setSubmitting(true)
    try {
      await onSave({
        watched,
        completion_fraction: Number(completionFraction.toFixed(2)),
        play_count: playCount,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const embedUrl = id
    ? `https://player.vimeo.com/video/${id}?api=1&player_id=vimeo-player&title=0&byline=0&portrait=0${autoplay ? '&autoplay=1' : ''}${showControls ? '' : '&controls=0'}`
    : null

  return (
    <div>
      {content?.title && <h2 className="text-[22px] font-semibold mb-3">{content.title}</h2>}
      {content?.context_before && (
        <p className="text-[16px] leading-relaxed text-slate-700 mb-4">{content.context_before}</p>
      )}

      {embedUrl ? (
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-4 shadow-card">
          <iframe
            id="vimeo-player"
            ref={iframeRef}
            src={embedUrl}
            title={content?.title || 'Video'}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      ) : (
        <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 mb-4 text-center text-[14px] text-slate-500">
          Video unavailable.
        </div>
      )}

      {requireCompletion && !watched && (
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
