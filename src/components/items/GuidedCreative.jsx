import { useMemo, useRef, useState } from 'react'
import { PrimaryButton, WordBankChip } from './shared.jsx'

function buildArtifactText(stanzas, prompts) {
  const stanzaBlocks = []
  for (const stanza of stanzas || []) {
    const lines = []
    for (const p of stanza.prompts || []) {
      const v = prompts[p.id]
      if (v && v.trim()) {
        lines.push(`${p.starter} ${v.trim()}`)
      }
    }
    if (lines.length) stanzaBlocks.push(lines.join('\n'))
  }
  return stanzaBlocks.join('\n\n')
}

export default function GuidedCreative({ content, onSave, existingResponse }) {
  const stanzas = content?.stanzas || []
  const wordBanks = content?.word_banks || {}
  const [stanzaIndex, setStanzaIndex] = useState(0)
  const [prompts, setPrompts] = useState(() => existingResponse?.prompts || {})
  const [usedChips, setUsedChips] = useState(existingResponse?.word_bank_used || [])
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const activeStanza = stanzas[stanzaIndex]
  const isLastStanza = stanzaIndex >= stanzas.length - 1

  // Apply pull_forward_from defaults when entering each stanza
  function ensurePullForwardDefaults(stanza) {
    setPrompts((prev) => {
      const next = { ...prev }
      let changed = false
      for (const p of stanza?.prompts || []) {
        if (p.pull_forward_from && !next[p.id]) {
          const v = next[p.pull_forward_from]
          if (v) {
            next[p.id] = v
            changed = true
          }
        }
      }
      return changed ? next : prev
    })
  }

  function setPrompt(id, value) {
    setPrompts((prev) => ({ ...prev, [id]: value }))
  }

  function chipsForPrompt(promptId) {
    return wordBanks[promptId] || wordBanks.__global__ || []
  }

  const inputRefs = useRef({})

  function appendChip(promptId, chip) {
    setUsedChips((prev) => (prev.includes(chip.id) ? prev : [...prev, chip.id]))
    const el = inputRefs.current[promptId]
    if (!el) {
      setPrompts((prev) => ({
        ...prev,
        [promptId]: ((prev[promptId] || '') + ' ' + chip.text).trim(),
      }))
      return
    }
    const cur = el.value
    const start = el.selectionStart ?? cur.length
    const end = el.selectionEnd ?? cur.length
    const before = cur.slice(0, start)
    const after = cur.slice(end)
    const insert = (before && !before.endsWith(' ') ? ' ' : '') + chip.text
    const next = before + insert + after
    setPrompts((prev) => ({ ...prev, [promptId]: next }))
    requestAnimationFrame(() => {
      el.focus()
      const pos = (before + insert).length
      el.setSelectionRange(pos, pos)
    })
  }

  function isStanzaComplete(stanza) {
    return (stanza?.prompts || []).every((p) => {
      if (!p.required) return true
      const v = prompts[p.id]
      return typeof v === 'string' && v.trim().length > 0
    })
  }

  async function handleNext() {
    if (!activeStanza || !isStanzaComplete(activeStanza)) return
    if (!isLastStanza) {
      const next = stanzaIndex + 1
      setStanzaIndex(next)
      ensurePullForwardDefaults(stanzas[next])
      return
    }
    // Last stanza → save artifact
    setSubmitting(true)
    try {
      const fullArtifactText = buildArtifactText(stanzas, prompts)
      await onSave({
        prompts,
        full_artifact_text: fullArtifactText,
        word_bank_used: usedChips,
      })
      setCompleted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (completed) {
    const artifactText = buildArtifactText(stanzas, prompts)
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-3 text-center">{content?.title}</h2>
        {content?.artifact_framing?.header && (
          <p className="text-center text-[14px] text-slate-600 italic mb-4">
            {content.artifact_framing.header}
          </p>
        )}
        <div
          className={
            'bg-white rounded-3xl shadow-card p-8 mb-6 ' +
            (content?.artifact_type === 'card' ? 'text-center text-[20px] leading-relaxed' : 'text-[16px] leading-relaxed whitespace-pre-wrap')
          }
        >
          {artifactText}
        </div>
        {content?.artifact_framing?.footer && (
          <p className="text-center text-[14px] text-slate-600 italic mb-4">
            {content.artifact_framing.footer}
          </p>
        )}
        {content?.completion_message && (
          <p className="text-center text-[15px] text-slate-700 mb-4">
            {content.completion_message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2">{content?.title}</h2>
      {content?.instructions && (
        <p className="text-[16px] leading-relaxed text-slate-700 mb-4">{content.instructions}</p>
      )}

      {stanzas.length > 1 && (
        <div className="flex justify-center gap-2 mb-5">
          {stanzas.map((_, i) => (
            <span
              key={i}
              className={
                'rounded-full ' +
                (i === stanzaIndex
                  ? 'w-2 h-2 bg-ctac-teal-400'
                  : i < stanzaIndex
                    ? 'w-2 h-2 bg-ctac-teal-200'
                    : 'w-1.5 h-1.5 bg-slate-200')
              }
            />
          ))}
        </div>
      )}

      <div className="space-y-5">
        {(activeStanza?.prompts || []).map((p) => {
          const chips = chipsForPrompt(p.id)
          return (
            <div key={p.id}>
              <label className="block text-[14px] font-medium text-slate-700 mb-2">
                {p.starter}
                {p.required && <span className="text-rose-400 ml-1">*</span>}
                {p.hint && (
                  <span className="ml-2 text-slate-500 font-normal italic">— {p.hint}</span>
                )}
              </label>
              <input
                ref={(el) => (inputRefs.current[p.id] = el)}
                type="text"
                value={prompts[p.id] || ''}
                onChange={(e) => setPrompt(p.id, e.target.value)}
                maxLength={p.max_chars || 200}
                className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
              />
              {chips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {chips.map((chip) => (
                    <WordBankChip
                      key={chip.id}
                      chip={chip}
                      onTap={(c) => appendChip(p.id, c)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-end mt-6">
        <PrimaryButton
          onClick={handleNext}
          disabled={!activeStanza || !isStanzaComplete(activeStanza) || submitting}
        >
          {submitting ? 'Saving…' : isLastStanza ? 'Finish' : 'Next →'}
        </PrimaryButton>
      </div>
    </div>
  )
}
