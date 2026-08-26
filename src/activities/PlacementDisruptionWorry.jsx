// PlacementDisruptionWorry — single-screen custom_activity filling a gap
// between the live Pretest and the polished (non-live) /demo Pretest.jsx
// reference component. The live pretest currently has no way to capture
// this item; this component fills that gap so it can be inserted as its
// own section.
//
// Item, anchors, and the save-payload key are copied verbatim from
// Pretest.jsx's 'pdw' screen (LikertItem helper + DISRUPTION_ANCHORS) so the
// SPSS column convention stays identical — this is deliberately NOT an
// import of Pretest.jsx, which is a TEMP demo-only file per CLAUDE.md and
// must not be a dependency of live content. Same 0–4 locked anchors as the
// FollowUp survey's disruption item.

import { useState } from 'react'

const DISRUPTION_ANCHORS = [
  { v: 0, label: 'Not at all' },
  { v: 1, label: 'A little' },
  { v: 2, label: 'Somewhat' },
  { v: 3, label: 'Very' },
  { v: 4, label: 'Extremely' },
]

// ---------- Reusable item renderer (copied from Pretest.jsx verbatim) ----------

function LikertItem({ prompt, anchors, value, onChange }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
      <div className="text-[15px] leading-relaxed text-slate-800 mb-3">{prompt}</div>
      <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${anchors.length}, minmax(0, 1fr))` }}>
        {anchors.map((a) => {
          const selected = value === a.v
          return (
            <button
              key={a.v}
              type="button"
              onClick={() => onChange(a.v)}
              aria-pressed={selected}
              className={
                'min-h-[56px] rounded-2xl border text-center px-1 py-2 transition-colors flex flex-col items-center justify-center ' +
                (selected
                  ? 'bg-ctac-teal-500 border-ctac-teal-500 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-ctac-teal-300')
              }
            >
              <span className="text-[16px] font-semibold leading-none">{a.v}</span>
              <span className={'text-[10px] leading-tight mt-1 ' + (selected ? 'text-ctac-teal-50' : 'text-slate-500')}>
                {a.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Main component ----------

export default function PlacementDisruptionWorry({ onSave = console.log }) {
  const [value, setValue] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSelect(v) {
    setValue(v)
    setSubmitting(true)
    try {
      await onSave({ pre_disruption_worry: v })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-3">Your placement</h2>
      <LikertItem
        prompt="How worried are you right now that this placement will change?"
        anchors={DISRUPTION_ANCHORS}
        value={value}
        onChange={handleSelect}
      />
      {submitting && (
        <p className="text-[13px] text-slate-500 italic">Saving…</p>
      )}
    </div>
  )
}
