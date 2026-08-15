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

// Sub-item conditional display (Draft 78). A scale item may declare
//   show_if: { item_id: '<another item in this scale>', operator, value }
// with operators equals | not_equals | gt | gte | lt | lte | in.
// Returns one of three states:
//   'shown'   — no show_if, condition met, or config malformed (fail open:
//               a broken condition must surface the item, never silently
//               drop a locked-instrument question)
//   'hidden'  — gate answered and condition failed. Renders the item's
//               optional skip_note in its place; excluded from the
//               Continue gate; its response is pruned from the payload.
//   'pending' — gate not yet answered. Renders nothing (the dependent
//               item appears only once the gate has an answer).
// Conditions are single-level: the gate item must not itself be gated.
function subItemVisibility(item, allItems, responses) {
  const cond = item?.show_if
  if (!cond || !cond.item_id) return 'shown'
  if (cond.item_id === item.id || !allItems.some((it) => it.id === cond.item_id)) {
    console.warn('psychometric_scale show_if references a missing/self item:', cond.item_id)
    return 'shown'
  }
  const gate = responses[cond.item_id]
  if (gate === undefined || gate === null) return 'pending'
  switch (cond.operator) {
    case 'equals':
      return gate === cond.value ? 'shown' : 'hidden'
    case 'not_equals':
      return gate !== cond.value ? 'shown' : 'hidden'
    case 'gt':
      return gate > cond.value ? 'shown' : 'hidden'
    case 'gte':
      return gate >= cond.value ? 'shown' : 'hidden'
    case 'lt':
      return gate < cond.value ? 'shown' : 'hidden'
    case 'lte':
      return gate <= cond.value ? 'shown' : 'hidden'
    case 'in':
      return Array.isArray(cond.value) && cond.value.includes(gate) ? 'shown' : 'hidden'
    default:
      console.warn('psychometric_scale show_if has unknown operator:', cond.operator)
      return 'shown'
  }
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

  const visibilityOf = (it, resp = responses) => subItemVisibility(it, items, resp)
  const visibleOrdered = orderedItems.filter((it) => visibilityOf(it) === 'shown')

  // If an upstream answer change hides items past the cursor in
  // one-at-a-time mode, keep the cursor on a real item.
  useEffect(() => {
    if (oneAtATime && activeIndex > 0 && activeIndex >= visibleOrdered.length) {
      setActiveIndex(Math.max(0, visibleOrdered.length - 1))
    }
  }, [oneAtATime, activeIndex, visibleOrdered.length])

  function setItemResponse(itemId, value) {
    const next = { ...responses, [itemId]: value }
    setResponses(next)
    if (oneAtATime) {
      // Advance within the list as it will look AFTER this answer —
      // a show_if downstream may have just appeared or disappeared.
      const vis = orderedItems.filter((it) => visibilityOf(it, next) === 'shown')
      const pos = vis.findIndex((it) => it.id === itemId)
      if (pos !== -1 && pos < vis.length - 1) {
        setTimeout(() => setActiveIndex(pos + 1), 200)
      }
    }
  }

  const allAnswered = items
    .filter((it) => visibilityOf(it) === 'shown')
    .every((it) => responses[it.id] !== undefined)

  // Drop responses for items that are hidden (or pending) at save time so
  // an answer given before an upstream change never rides along as an
  // orphan — e.g. bw2 answered, then bw1 moved to 0.
  function pruneToVisible(resp) {
    const pruned = {}
    for (const it of items) {
      if (visibilityOf(it, resp) === 'shown' && resp[it.id] !== undefined) {
        pruned[it.id] = resp[it.id]
      }
    }
    return pruned
  }

  async function handleContinue() {
    if (!allAnswered || submitting) return
    setSubmitting(true)
    const pruned = pruneToVisible(responses)
    const computed = computeScore(content, pruned)
    const willDisplay = content?.mode === 'display_score'
    const payload = {
      scale_responses: pruned,
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

  const itemsToRender = oneAtATime
    ? [visibleOrdered[activeIndex]].filter(Boolean)
    : orderedItems

  if (showScore) {
    const score = computeScore(content, pruneToVisible(responses))
    const band = getInterpretation(content, score)
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-3">{content.scoring.display_label || 'Your score'}</h2>
        <p className="text-[16px] text-slate-700 mb-4">
          {content.scoring.display_message || ''}
        </p>
        <div className="bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl p-6 text-center mb-6">
          <div className="text-[48px] font-bold text-ctac-teal-700 leading-none">{score}</div>
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
      {content?.scale_name && (
        <h2 className="text-[22px] font-semibold mb-2">{content.scale_name}</h2>
      )}
      {content?.instructions && (
        <p className="text-[16px] leading-relaxed text-slate-700 mb-6">{content.instructions}</p>
      )}

      {showProgress && oneAtATime && (
        <div className="flex justify-center gap-2 mb-6">
          {visibleOrdered.map((_, i) => (
            <span
              key={i}
              className={
                'rounded-full ' +
                (i === activeIndex
                  ? 'w-2 h-2 bg-ctac-teal-400'
                  : i < activeIndex
                    ? 'w-2 h-2 bg-ctac-teal-200'
                    : 'w-1.5 h-1.5 bg-slate-200')
              }
            />
          ))}
        </div>
      )}

      <div className="space-y-6 mb-6">
        {itemsToRender.map((it) => {
          const vis = visibilityOf(it)
          if (vis === 'pending') return null
          if (vis === 'hidden') {
            // Skipped by show_if. Show the authored note (styled to match
            // the survey-mirror skip notice) or nothing at all.
            if (!it.skip_note) return null
            return (
              <div key={it.id} className="border-b border-slate-200 pb-5 last:border-b-0">
                <div
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] text-slate-600 italic"
                  aria-live="polite"
                >
                  {it.skip_note}
                </div>
              </div>
            )
          }
          return (
            <ScaleItemRow
              key={it.id}
              item={it}
              format={format}
              anchors={content?.anchors}
              vasConfig={content?.vas_config}
              value={responses[it.id]}
              onChange={(v) => setItemResponse(it.id, v)}
            />
          )
        })}
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
  // Per-point anchor labels (Draft 73, additive). Optional
  // anchors.anchor_labels array, index 0 = the min point. When present:
  // every point renders its label under the number (small, wraps —
  // buttons grow taller, never shrink below the 48px touch target), the
  // selected point's meaning is echoed prominently under the row, the
  // now-redundant min/max end-label row is hidden, and each radio gets
  // an aria-label carrying its anchor text. When absent, rendering is
  // pixel-identical to the original min/max-only behavior.
  const pointLabels =
    Array.isArray(anchors?.anchor_labels) && anchors.anchor_labels.length > 0
      ? anchors.anchor_labels
      : null
  const labelFor = (v) => (pointLabels ? pointLabels[v - min] || '' : '')
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
              aria-label={
                pointLabels
                  ? labelFor(v)
                    ? `${v} — ${labelFor(v)}`
                    : String(v)
                  : undefined
              }
              onClick={() => onChange(v)}
              className={
                'min-h-[48px] rounded-2xl border text-[16px] font-medium transition-colors ' +
                (pointLabels ? 'px-1 py-2 flex flex-col items-center justify-center gap-1 ' : '') +
                (selected
                  ? 'bg-ctac-teal-200 border-ctac-teal-400 text-ctac-teal-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-ctac-teal-300')
              }
            >
              {pointLabels ? (
                <>
                  <span>{v}</span>
                  <span
                    className={
                      'text-[10px] leading-tight font-normal text-center ' +
                      (selected ? 'text-ctac-teal-900' : 'text-slate-500')
                    }
                  >
                    {labelFor(v)}
                  </span>
                </>
              ) : (
                v
              )}
            </button>
          )
        })}
      </div>
      {pointLabels ? (
        value != null && (
          <p className="text-[13px] font-medium text-ctac-teal-800" aria-live="polite">
            Your answer: {value} — {labelFor(value)}
          </p>
        )
      ) : (
        <div className="flex justify-between text-[13px] text-slate-500">
          <span>{anchors?.min_label || ''}</span>
          <span>{anchors?.max_label || ''}</span>
        </div>
      )}
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
        className="w-full accent-ctac-teal-400"
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
                ? 'bg-ctac-teal-200 border-ctac-teal-400 text-ctac-teal-900'
                : 'bg-white border-slate-200 text-slate-700 hover:border-ctac-teal-300')
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
