import { useEffect, useMemo, useRef, useState } from 'react'
import { resolveTokenPath, unwrapTokenExpression } from '../../lib/tokens.js'
import {
  PrimaryButton,
  PullForwardCallout,
  WordBankChip,
} from './shared.jsx'

export default function FreeText({ content, onSave, existingResponse, sessionData }) {
  const starter = content?.sentence_starter || ''
  const initial = existingResponse?.text ?? starter
  const [text, setText] = useState(initial)
  const [usedChips, setUsedChips] = useState(existingResponse?.word_bank_used || [])
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef(null)

  const pullForwardConfig = content?.pull_forward
  const pullForwardValue = useMemo(() => {
    if (!pullForwardConfig?.token) return null
    const expr = unwrapTokenExpression(pullForwardConfig.token)
    return resolveTokenPath(expr, sessionData || {})
  }, [pullForwardConfig, sessionData])

  const [pullForwardIncluded, setPullForwardIncluded] = useState(
    existingResponse?.pull_forward_included !== undefined
      ? existingResponse.pull_forward_included
      : !!pullForwardValue,
  )

  useEffect(() => {
    if (existingResponse?.text !== undefined) setText(existingResponse.text)
  }, [existingResponse])

  function appendChip(chip) {
    setUsedChips((prev) => (prev.includes(chip.id) ? prev : [...prev, chip.id]))
    const ta = textareaRef.current
    if (!ta) {
      setText((prev) => (prev ? `${prev} ${chip.text}` : chip.text))
      return
    }
    const start = ta.selectionStart ?? text.length
    const end = ta.selectionEnd ?? text.length
    const before = text.slice(0, start)
    const after = text.slice(end)
    const insert = (before && !before.endsWith(' ') ? ' ' : '') + chip.text
    const next = before + insert + after
    setText(next)
    requestAnimationFrame(() => {
      ta.focus()
      const pos = (before + insert).length
      ta.setSelectionRange(pos, pos)
    })
  }

  const minChars = content?.min_chars ?? 0
  const maxChars = content?.max_chars ?? 5000
  const charCount = text.length
  const meetsMin = charCount >= minChars
  const exceedsMax = charCount > maxChars
  const canSave = meetsMin && !exceedsMax && !submitting

  async function handleSave() {
    if (!canSave) return
    setSubmitting(true)
    try {
      await onSave({
        text,
        word_bank_used: usedChips,
        pull_forward_included: pullForwardConfig ? pullForwardIncluded : false,
        char_count: charCount,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <p className="text-[16px] leading-relaxed text-slate-800 mb-4">{content?.prompt}</p>

      {pullForwardConfig && pullForwardValue && (
        <PullForwardCallout
          label={pullForwardConfig.label}
          value={pullForwardValue}
          included={pullForwardIncluded}
          onToggle={pullForwardConfig.user_can_exclude ? setPullForwardIncluded : null}
        />
      )}

      <textarea
        ref={textareaRef}
        rows={content?.rows || 5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={content?.placeholder || ''}
        maxLength={maxChars}
        className="w-full text-[16px] leading-relaxed px-4 py-3 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
      />

      {content?.show_char_count !== false && (
        <div className="text-[13px] text-slate-500 mt-2">
          {charCount}{maxChars ? ` / ${maxChars}` : ''}{minChars > 0 && charCount < minChars ? ` · at least ${minChars}` : ''}
        </div>
      )}

      {content?.word_bank?.length > 0 && (
        <div className="mt-5">
          {content.word_bank_label && (
            <div className="text-[14px] font-medium text-slate-600 mb-2">
              {content.word_bank_label}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {content.word_bank.map((chip) => (
              <WordBankChip key={chip.id} chip={chip} onTap={appendChip} />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <PrimaryButton onClick={handleSave} disabled={!canSave}>
          {submitting ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </div>
    </div>
  )
}
