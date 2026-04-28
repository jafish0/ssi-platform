import { useEffect, useMemo, useState } from 'react'
import { PrimaryButton } from './shared.jsx'

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function computeScore(content, scaleResponses) {
  if (!content?.scoring) return null
  const items = content.items || []
  const min = content.anchors?.min_value ?? 0
  const max = content.anchors?.max_value ?? 0
  const values = items.map((it) => {
    const raw = scaleResponses[it.id]
    if (raw === undefined || raw === null) return null
    if (it.reverse_scored) return max + min - raw
    return raw
  })
  const valid = values.filter((v) => v !== null)
  if (valid.length === 0) return null
  if (content.scoring.method === 'mean') {
    return valid.reduce((s, v) => s + v, 0) / valid.length
  }
  return valid.reduce((s, v) => s + v, 0)
}

function getInterpretation(content, score) {
  if (!content?.scoring?.interpretation_bands || score === null) return null
  return content.scoring.interpretation_bands.find(
    (b) => score >= b.min && score <= b.max,
  )
}

export default function PsychometricScale({ content, onSave, existingResponse }) {
  const items = content?.items || []
  const format = content?.format || 'likert'
  const oneAtATime = content?.display_one_at_a_time === true
  const showProgress = content?.show_progress !== false

  const orderedItems = useMemo(() => {
    if (content?.randomize_order) return shuffle(items)
    return items
  }, [items, content?.randomize_order])

  const [responses, setResponses] = useState(() => existingResponse?.scale_responses || {})
  const [activeIndex, setActiveIndex] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (existingResponse?.scale_responses) {
      setResponses(existingResponse.scale_responses)
    }
  }, [existingResponse])

  function setItemResponse(itemId, value) {
    setResponses((prev) => ({ ...prev, [itemId]: value }))
    if (oneAtATime && activeIndex < orderedItems.length - 1) {
      setTimeout(() => setActiveIndex((i) => i + 1), 200)
    }
  }

  const allAnswered = items.every((it) => responses[it.id] !== undefined)

  async function handleContinue() {
    if (!allAnswered || submitting) return
    setSubmitting(true)
    const computed = computeScore(content, responses)
    const willDisplay = content?.mode === 'display_score'
    const payload = {
      scale_responses: responses,
      computed_score: willDisplay ? computed : null,
      display_shown: willDisplay && !!content?.scoring,
    }
    try {
      await onSave(payload)
      if (willDisplay && content?.scoring) {
        setShowScore(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const itemsToRender = oneAtATime ? [orderedItems[activeIndex]].filter(Boolean) : orderedItems

  if (showScore) {
    const score = computeScore(content, responses)
    const band = getInterpretation(content, score)
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-3">{content.scoring.display_label || 'Your score'}</h2>
        <p className="text-[16px] text-slate-700 mb-4">
          {content.scoring.display_message || ''}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-6">
          <div className="text-[48px] font-bold text-amber-700 leading-none">{score}</div>
          {band && (
            <div className="text-[14px] font-medium text-slate-600 mt-2">
              {band.label}
            </div>
          )}
        </div>
        {/* Continue handled by parent */}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2">{content?.scale_name || 'Scale'}</h2>
      {content?.instructions && (
        <p className="text-[16px] leading-relaxed text-slate-700 mb-6">{content.instructions}</p>
      )}

      {showProgress && oneAtATime && (
        <div className="flex justify-center gap-2 mb-6">
          {orderedItems.map((_, i) => (
            <span
              key={i}
              className={
                'rounded-full ' +
                (i === activeIndex
                  ? 'w-2 h-2 bg-amber-400'
                  : i < activeIndex
                    ? 'w-2 h-2 bg-amber-200'
                    : 'w-1.5 h-1.5 bg-slate-200')
              }
            />
          ))}
        </div>
      )}

      <div className="space-y-6 mb-6">
        {itemsToRender.map((it) => (
          <ScaleItemRow
            key={it.id}
            item={it}
            format={format}
            anchors={content?.anchors}
            vasConfig={content?.vas_config}
            value={responses[it.id]}
            onChange={(v) => setItemResponse(it.id, v)}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <PrimaryButton onClick={handleContinue} disabled={!allAnswered || submitting}>
          {submitting ? 'Saving…' : 'Continue'}
        </PrimaryButton>
      </div>
    </div>
  )
}

function ScaleItemRow({ item, format, anchors, vasConfig, value, onChange }) {
  return (
    <div className="border-b border-slate-200 pb-5 last:border-b-0">
      <p className="text-[16px] text-slate-800 mb-3">{item.text}</p>
      {format === 'likert' && (
        <LikertRow anchors={anchors} value={value} onChange={onChange} />
      )}
      {format === 'vas' && (
        <VASRow vasConfig={vasConfig} value={value} onChange={onChange} />
      )}
      {format === 'binary' && (
        <BinaryRow value={value} onChange={onChange} />
      )}
    </div>
  )
}

function LikertRow({ anchors, value, onChange }) {
  const min = anchors?.min_value ?? 0
  const max = anchors?.max_value ?? 4
  const values = []
  for (let v = min; v <= max; v++) values.push(v)
  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(48px,1fr))] gap-2 mb-2" role="radiogroup">
        {values.map((v) => {
          const selected = value === v
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(v)}
              className={
                'min-h-[48px] rounded-2xl border text-[16px] font-medium transition-colors ' +
                (selected
                  ? 'bg-amber-200 border-amber-400 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300')
              }
            >
              {v}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between text-[13px] text-slate-500">
        <span>{anchors?.min_label || ''}</span>
        <span>{anchors?.max_label || ''}</span>
      </div>
    </div>
  )
}

function VASRow({ vasConfig, value, onChange }) {
  const min = vasConfig?.min_value ?? 0
  const max = vasConfig?.max_value ?? 100
  const step = vasConfig?.step ?? 1
  const v = value ?? Math.round((min + max) / 2)
  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-amber-400"
      />
      <div className="flex justify-between text-[13px] text-slate-500 mt-1">
        <span>{vasConfig?.min_label || min}</span>
        <span className="font-mono text-slate-700">{value ?? '—'}</span>
        <span>{vasConfig?.max_label || max}</span>
      </div>
    </div>
  )
}

function BinaryRow({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { v: 1, label: 'Yes' },
        { v: 0, label: 'No' },
      ].map((opt) => {
        const selected = value === opt.v
        return (
          <button
            key={opt.v}
            type="button"
            onClick={() => onChange(opt.v)}
            className={
              'min-h-[52px] rounded-2xl border text-[16px] font-semibold transition-colors ' +
              (selected
                ? 'bg-amber-200 border-amber-400 text-amber-900'
                : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300')
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
