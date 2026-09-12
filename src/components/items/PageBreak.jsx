import { useEffect, useState } from 'react'
import { PrimaryButton } from './shared.jsx'
import NarrationControls from './NarrationControls.jsx'

export default function PageBreak({ content, onSave }) {
  const heading = content?.heading
  const body = content?.body
  // Draft 109 (2026-09-10 narration batch): this generic bridge-screen
  // renderer had zero narration wiring at all — every other content_json-
  // driven item type already supports at least one audio field. Two
  // separate optional clips (not one) since a bridge screen's heading and
  // body are recorded as distinct lines (e.g. almostdone_00/01 vs. 02/03).
  const headingAudioUrl = content?.heading_audio_url
  const bodyAudioUrl = content?.body_audio_url
  const continueLabel = content?.continue_label || 'Keep going →'
  const animation = content?.animation || 'fade'
  const [mounted, setMounted] = useState(animation !== 'fade')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (animation === 'fade') {
      const t = requestAnimationFrame(() => setMounted(true))
      return () => cancelAnimationFrame(t)
    }
  }, [animation])

  async function handleContinue() {
    if (submitting) return
    setSubmitting(true)
    try {
      await onSave({ advanced: true })
    } finally {
      setSubmitting(false)
    }
  }

  // Empty config: just render a continue button.
  const isMinimal = !heading && !body

  return (
    <div
      className={
        'transition-all duration-300 ease-out ' +
        (mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2')
      }
    >
      {isMinimal ? (
        <div className="flex justify-center">
          <PrimaryButton onClick={handleContinue} disabled={submitting}>
            {submitting ? 'Saving…' : continueLabel}
          </PrimaryButton>
        </div>
      ) : (
        <div className="text-center py-6">
          {heading && (
            <h1
              className={
                'text-[28px] font-bold leading-tight text-slate-800 ' +
                (headingAudioUrl ? 'mb-2' : 'mb-4')
              }
            >
              {heading}
            </h1>
          )}
          {headingAudioUrl && (
            <div className="flex justify-center mb-2">
              <NarrationControls questionAudioUrl={headingAudioUrl} />
            </div>
          )}
          {body && (
            <p
              className={
                'text-[16px] leading-relaxed text-slate-700 max-w-md mx-auto ' +
                (bodyAudioUrl ? 'mb-2' : 'mb-8')
              }
            >
              {body}
            </p>
          )}
          {bodyAudioUrl && (
            <div className="flex justify-center mb-8">
              <NarrationControls questionAudioUrl={bodyAudioUrl} />
            </div>
          )}
          <PrimaryButton onClick={handleContinue} disabled={submitting}>
            {submitting ? 'Saving…' : continueLabel}
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}
