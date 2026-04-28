import { useEffect, useState } from 'react'
import { PrimaryButton } from './shared.jsx'

export default function PageBreak({ content, onSave }) {
  const heading = content?.heading
  const body = content?.body
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
            <h1 className="text-[28px] font-bold leading-tight mb-4 text-slate-800">
              {heading}
            </h1>
          )}
          {body && (
            <p className="text-[16px] leading-relaxed text-slate-700 mb-8 max-w-md mx-auto">
              {body}
            </p>
          )}
          <PrimaryButton onClick={handleContinue} disabled={submitting}>
            {submitting ? 'Saving…' : continueLabel}
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}
