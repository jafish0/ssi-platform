import { useMemo, useState } from 'react'
import { PrimaryButton } from './shared.jsx'

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Choice({ content, onSave, existingResponse }) {
  const isMultiple = content?.selection_type === 'multiple'
  const style = content?.display_style || 'card_grid'

  const options = useMemo(() => {
    let opts = content?.options || []
    if (content?.show_none_option) {
      opts = [...opts, { id: '__none__', text: 'None of these' }]
    }
    if (content?.randomize_order) opts = shuffle(opts)
    return opts
  }, [content])

  const [selected, setSelected] = useState(() => {
    if (isMultiple) return existingResponse?.selected || []
    return existingResponse?.selected || null
  })
  const [submitting, setSubmitting] = useState(false)

  function isSelected(id) {
    if (isMultiple) return Array.isArray(selected) && selected.includes(id)
    return selected === id
  }

  async function commit(value) {
    setSubmitting(true)
    try {
      await onSave({ selected: value })
    } finally {
      setSubmitting(false)
    }
  }

  function handleClick(id) {
    if (submitting) return
    if (!isMultiple) {
      setSelected(id)
      // brief amber flash, then auto-advance via save
      setTimeout(() => commit(id), 150)
      return
    }
    setSelected((prev) => {
      const arr = Array.isArray(prev) ? prev : []
      if (arr.includes(id)) return arr.filter((x) => x !== id)
      if (content?.max_selections && arr.length >= content.max_selections) return arr
      return [...arr, id]
    })
  }

  async function handleContinue() {
    if (!isMultiple) return
    if (!Array.isArray(selected) || selected.length === 0) return
    await commit(selected)
  }

  const containerClass =
    style === 'card_grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
      : style === 'chip_row'
        ? 'flex flex-wrap gap-2'
        : 'flex flex-col gap-2'

  return (
    <div>
      <p className="text-[16px] leading-relaxed text-slate-800 mb-5">{content?.prompt}</p>
      <div className={containerClass}>
        {options.map((opt) => {
          const sel = isSelected(opt.id)
          if (style === 'chip_row') {
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleClick(opt.id)}
                className={
                  'rounded-full px-4 py-2 min-h-[44px] text-[14px] transition-colors ' +
                  (sel
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700')
                }
              >
                {opt.text}
              </button>
            )
          }
          if (style === 'list') {
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleClick(opt.id)}
                className={
                  'text-left rounded-2xl border min-h-[52px] px-5 py-3 text-[16px] transition-colors ' +
                  (sel
                    ? 'bg-amber-200 border-amber-400 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300')
                }
              >
                {opt.text}
              </button>
            )
          }
          // card_grid
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleClick(opt.id)}
              className={
                'text-left rounded-2xl border min-h-[80px] px-5 py-4 text-[16px] transition-colors ' +
                (sel
                  ? 'bg-amber-200 border-amber-400 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300')
              }
            >
              {opt.text}
            </button>
          )
        })}
      </div>

      {isMultiple && (
        <div className="flex justify-end mt-6">
          <PrimaryButton
            onClick={handleContinue}
            disabled={!Array.isArray(selected) || selected.length === 0 || submitting}
          >
            {submitting ? 'Saving…' : 'Save'}
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}
