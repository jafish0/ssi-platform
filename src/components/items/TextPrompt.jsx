import { useState } from 'react'
import { Download } from 'lucide-react'
import { interpolate } from '../../lib/tokens.js'
import { PrimaryButton } from './shared.jsx'
import { downloadPdf } from '../../lib/pdf.js'

export default function TextPrompt({ content, onSave, sessionData }) {
  const [submitting, setSubmitting] = useState(false)
  const heading = content?.heading
  const body = interpolate(content?.body || '', sessionData || {})
  const format = content?.format || 'standard'
  const showButton = content?.show_continue_button !== false
  const continueLabel = content?.continue_label || 'Keep going →'
  const downloadCfg = content?.download_button

  async function handleContinue() {
    if (submitting) return
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
    <div>
      {heading && <h2 className="text-[22px] font-semibold mb-3">{heading}</h2>}
      <div className={wrapperClass}>
        {format === 'pull_forward_highlight' && (
          <div className="text-[13px] font-medium text-ctac-teal-800 mb-1">
            From earlier:
          </div>
        )}
        <p className={bodyClass}>{body}</p>
      </div>
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
            <PrimaryButton onClick={handleContinue} disabled={submitting}>
              {submitting ? 'Saving…' : continueLabel}
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  )
}
