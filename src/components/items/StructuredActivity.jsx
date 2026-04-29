import { useMemo, useState } from 'react'
import { resolveTokenPath, unwrapTokenExpression } from '../../lib/tokens.js'
import { PrimaryButton, PullForwardCallout } from './shared.jsx'

// Loose RFC-5322-style validator — accepts most real addresses without
// rejecting legitimate but unusual ones (`+` aliases, dotted local parts).
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function StructuredActivity({ content, onSave, existingResponse, sessionData }) {
  const fields = content?.fields || []
  const layout = content?.layout || 'single_column'
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  // Resolve any field-level pull-forward defaults.
  const initialValues = useMemo(() => {
    const stored = existingResponse?.fields || {}
    const result = {}
    for (const f of fields) {
      if (stored[f.id] !== undefined) {
        result[f.id] = stored[f.id]
        continue
      }
      // pull_forward only applies to free_text fields
      if (f.type === 'free_text' && f.pull_forward?.token) {
        const expr = unwrapTokenExpression(f.pull_forward.token)
        const v = resolveTokenPath(expr, sessionData || {})
        if (typeof v === 'string') result[f.id] = v
      }
    }
    return result
  }, [fields, existingResponse, sessionData])

  const [values, setValues] = useState(initialValues)
  const [pullIncluded, setPullIncluded] = useState(() => {
    const fromExisting = existingResponse?.pull_forward_included || {}
    const result = {}
    for (const f of fields) {
      if (f.type === 'free_text' && f.pull_forward?.token) {
        result[f.id] =
          fromExisting[f.id] !== undefined ? fromExisting[f.id] : true
      }
    }
    return result
  })

  function setFieldValue(id, value) {
    setValues((prev) => ({ ...prev, [id]: value }))
  }

  function isFieldComplete(f) {
    const v = values[f.id]
    if (!f.required) {
      // optional email fields still need to validate format if filled
      if (f.type === 'free_text' && f.input_type === 'email' && typeof v === 'string' && v.trim()) {
        return EMAIL_RX.test(v.trim())
      }
      return true
    }
    if (v === undefined || v === null || v === '') return false
    if (Array.isArray(v) && v.length === 0) return false
    if (f.type === 'free_text' && f.input_type === 'email') {
      return typeof v === 'string' && EMAIL_RX.test(v.trim())
    }
    return true
  }

  const allComplete = fields.every(isFieldComplete)

  async function handleSave() {
    if (!allComplete || submitting) return
    setSubmitting(true)
    try {
      await onSave({
        fields: values,
        pull_forward_included: pullIncluded,
      })
      setSaved(true)
    } finally {
      setSubmitting(false)
    }
  }

  const gridClass =
    layout === 'two_column'
      ? 'grid grid-cols-1 md:grid-cols-2 gap-5'
      : 'space-y-5'

  return (
    <div>
      {content?.title && (
        <h2 className="text-[22px] font-semibold mb-2">{content.title}</h2>
      )}
      {content?.instructions && (
        <p className="text-[16px] leading-relaxed text-slate-700 mb-6">{content.instructions}</p>
      )}

      <div className={gridClass}>
        {fields.map((f) => (
          <FieldRenderer
            key={f.id}
            field={f}
            value={values[f.id]}
            onChange={(v) => setFieldValue(f.id, v)}
            sessionData={sessionData}
            pullIncluded={pullIncluded[f.id]}
            onPullToggle={(b) => setPullIncluded((prev) => ({ ...prev, [f.id]: b }))}
          />
        ))}
      </div>

      {saved && content?.completion_message && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-[15px] text-slate-700">
          {content.completion_message}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <PrimaryButton onClick={handleSave} disabled={!allComplete || submitting}>
          {submitting ? 'Saving…' : saved ? 'Saved' : 'Save'}
        </PrimaryButton>
      </div>
    </div>
  )
}

function FieldRenderer({ field, value, onChange, sessionData, pullIncluded, onPullToggle }) {
  const labelEl = (
    <label className="block text-[14px] font-medium text-slate-700 mb-2">
      {field.label}
      {field.required && <span className="text-rose-400 ml-1">*</span>}
    </label>
  )

  const pullValue =
    field.type === 'free_text' && field.pull_forward?.token
      ? resolveTokenPath(unwrapTokenExpression(field.pull_forward.token), sessionData || {})
      : null

  switch (field.type) {
    case 'free_text': {
      // input_type lets a free_text field render as a single-line input
      // instead of a textarea, optionally with email/phone semantics.
      const inputType = field.input_type
      const showEmailError =
        inputType === 'email' &&
        typeof value === 'string' &&
        value.trim().length > 0 &&
        !EMAIL_RX.test(value.trim())
      const sharedCx =
        'w-full text-[16px] leading-relaxed px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white'
      return (
        <div>
          {labelEl}
          {pullValue && (
            <PullForwardCallout
              label={field.pull_forward?.label}
              value={pullValue}
              included={pullIncluded}
              onToggle={field.pull_forward?.user_can_exclude ? onPullToggle : null}
            />
          )}
          {inputType === 'single_line' || inputType === 'email' || inputType === 'phone' ? (
            <input
              type={inputType === 'email' ? 'email' : inputType === 'phone' ? 'tel' : 'text'}
              inputMode={inputType === 'phone' ? 'tel' : inputType === 'email' ? 'email' : undefined}
              autoComplete={
                inputType === 'email' ? 'email' : inputType === 'phone' ? 'tel' : 'off'
              }
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder || ''}
              maxLength={field.max_chars || undefined}
              className={
                sharedCx + ' min-h-[52px] ' + (showEmailError ? 'border-rose-300 ' : '')
              }
            />
          ) : (
            <textarea
              rows={field.rows || 3}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder || ''}
              maxLength={field.max_chars || undefined}
              className={sharedCx}
            />
          )}
          {showEmailError && (
            <div className="text-[13px] text-rose-600 mt-1">
              That doesn&apos;t look like a valid email.
            </div>
          )}
        </div>
      )
    }

    case 'single_choice':
      return (
        <div>
          {labelEl}
          <div className="space-y-2" role="radiogroup">
            {(field.options || []).map((opt) => {
              const sel = value === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  onClick={() => onChange(opt.id)}
                  className={
                    'w-full text-left rounded-2xl border min-h-[52px] px-5 py-3 text-[16px] transition-colors ' +
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
        </div>
      )

    case 'multiple_choice': {
      const selectedArr = Array.isArray(value) ? value : []
      return (
        <div>
          {labelEl}
          <div className="space-y-2">
            {(field.options || []).map((opt) => {
              const sel = selectedArr.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    if (sel) onChange(selectedArr.filter((x) => x !== opt.id))
                    else if (
                      !field.max_selections ||
                      selectedArr.length < field.max_selections
                    )
                      onChange([...selectedArr, opt.id])
                  }}
                  aria-pressed={sel}
                  className={
                    'w-full text-left rounded-2xl border min-h-[52px] px-5 py-3 text-[16px] transition-colors ' +
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
        </div>
      )
    }

    case 'number_input': {
      const min = Number.isFinite(field.min) ? field.min : null
      const max = Number.isFinite(field.max) ? field.max : null
      const step = field.step || 1
      // If the range is small and discrete, render as bubble buttons.
      const useBubbles =
        min !== null &&
        max !== null &&
        step > 0 &&
        (max - min) / step <= 10
      if (useBubbles) {
        const stops = []
        for (let v = min; v <= max; v += step) stops.push(v)
        return (
          <div>
            {labelEl}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(48px,1fr))] gap-2">
              {stops.map((v) => {
                const sel = value === v
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onChange(v)}
                    aria-pressed={sel}
                    className={
                      'min-h-[52px] rounded-2xl border text-[16px] font-semibold transition-colors ' +
                      (sel
                        ? 'bg-amber-200 border-amber-400 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300')
                    }
                  >
                    {v}
                  </button>
                )
              })}
            </div>
          </div>
        )
      }
      return (
        <div>
          {labelEl}
          <input
            type="number"
            min={field.min}
            max={field.max}
            step={step}
            value={value ?? ''}
            onChange={(e) => {
              const n = e.target.value === '' ? '' : Number(e.target.value)
              onChange(n)
            }}
            className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
          />
        </div>
      )
    }

    case 'rating': {
      const min = field.min_value ?? 1
      const max = field.max_value ?? 5
      const stops = []
      for (let v = min; v <= max; v++) stops.push(v)
      return (
        <div>
          {labelEl}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(48px,1fr))] gap-2">
            {stops.map((v) => {
              const sel = value === v
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange(v)}
                  className={
                    'min-h-[48px] rounded-2xl border text-[16px] font-medium transition-colors ' +
                    (sel
                      ? 'bg-amber-200 border-amber-400 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300')
                  }
                >
                  {v}
                </button>
              )
            })}
          </div>
          <div className="flex justify-between text-[13px] text-slate-500 mt-2">
            <span>{field.min_label || ''}</span>
            <span>{field.max_label || ''}</span>
          </div>
        </div>
      )
    }

    case 'drag_and_drop':
      return (
        <DragDropField field={field} value={value} onChange={onChange} />
      )

    default:
      return (
        <div className="text-[14px] text-rose-600">
          Unsupported field type: {field.type}
        </div>
      )
  }
}

// Lightweight drag-and-drop using HTML5 drag API.
// Mobile fallback: tap-to-select an item, then tap a bucket to place it.
function DragDropField({ field, value, onChange }) {
  const items = field.items || []
  const buckets = field.buckets || []

  const initial = useMemo(() => {
    const v = value || {}
    const result = {}
    for (const b of buckets) result[b.id] = Array.isArray(v[b.id]) ? v[b.id] : []
    result.unplaced = Array.isArray(v.unplaced)
      ? v.unplaced
      : items.map((i) => i.id).filter((id) => !buckets.some((b) => (v[b.id] || []).includes(id)))
    return result
  }, [value, buckets, items])

  const [placement, setPlacement] = useState(initial)
  const [tapSelected, setTapSelected] = useState(null)

  function commit(next) {
    setPlacement(next)
    onChange(next)
  }

  function moveItem(itemId, toBucket) {
    const next = { unplaced: [...placement.unplaced], ...{} }
    for (const b of buckets) next[b.id] = [...placement[b.id]]
    // remove
    next.unplaced = next.unplaced.filter((id) => id !== itemId)
    for (const b of buckets) next[b.id] = next[b.id].filter((id) => id !== itemId)
    // add
    if (toBucket === 'unplaced') next.unplaced.push(itemId)
    else next[toBucket].push(itemId)
    commit(next)
  }

  function handleDragStart(e, itemId) {
    e.dataTransfer.setData('text/plain', itemId)
    e.dataTransfer.effectAllowed = 'move'
  }
  function handleDrop(e, bucketId) {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('text/plain')
    if (itemId) moveItem(itemId, bucketId)
  }
  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleTap(itemId) {
    setTapSelected((prev) => (prev === itemId ? null : itemId))
  }
  function handleBucketTap(bucketId) {
    if (tapSelected) {
      moveItem(tapSelected, bucketId)
      setTapSelected(null)
    }
  }

  return (
    <div>
      <div className="text-[14px] font-medium text-slate-700 mb-2">{field.label}</div>

      {/* Unplaced items pool */}
      <div className="mb-4">
        <div className="text-[13px] text-slate-500 mb-2">Items</div>
        <div className="flex flex-wrap gap-2">
          {placement.unplaced.map((id) => {
            const it = items.find((x) => x.id === id)
            if (!it) return null
            const sel = tapSelected === id
            return (
              <div
                key={id}
                draggable
                onDragStart={(e) => handleDragStart(e, id)}
                onClick={() => handleTap(id)}
                className={
                  'cursor-grab active:cursor-grabbing select-none rounded-xl px-4 py-3 min-h-[48px] text-[15px] transition-shadow ' +
                  (sel
                    ? 'bg-amber-200 text-amber-900 shadow-card'
                    : 'bg-white text-slate-800 shadow-card')
                }
              >
                {it.text}
              </div>
            )
          })}
          {placement.unplaced.length === 0 && (
            <div className="text-[13px] text-slate-400 italic">All items placed</div>
          )}
        </div>
      </div>

      {/* Drop buckets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {buckets.map((b) => (
          <div
            key={b.id}
            onDrop={(e) => handleDrop(e, b.id)}
            onDragOver={handleDragOver}
            onClick={() => handleBucketTap(b.id)}
            className={
              'rounded-2xl border-2 border-dashed p-4 min-h-[120px] transition-colors ' +
              (placement[b.id]?.length > 0
                ? 'bg-white border-amber-300'
                : 'bg-amber-50 border-amber-200')
            }
          >
            <div className="text-[14px] font-semibold text-amber-800 mb-2">{b.label}</div>
            <div className="flex flex-wrap gap-2">
              {(placement[b.id] || []).map((id) => {
                const it = items.find((x) => x.id === id)
                if (!it) return null
                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, id)}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTap(id)
                    }}
                    className="cursor-grab select-none bg-white rounded-xl px-4 py-2 text-[14px] text-slate-800 shadow-card"
                  >
                    {it.text}
                  </div>
                )
              })}
              {(placement[b.id] || []).length === 0 && (
                <div className="text-[13px] text-slate-500 italic">Drop here</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
