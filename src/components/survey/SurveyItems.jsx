// Shared survey-item renderers used by all three timepoint surveys
// (Pretest, Posttest, FollowUp). Extracted 2026-05-13 so visual styling
// stays in lockstep across pre / post / follow-up — small tweaks here
// land in all three at once.
//
// Pretest.jsx (built 2026-05-11) has its own near-identical inline
// copies of these components that predate this module. Leaving them
// in place for now to avoid churn; if a refactor becomes worth it,
// swap them out one-for-one — the props shape and visual output match.
//
// All components render a single survey question. Per-screen validation
// + state lives in the parent activity component.

// ---------- Likert grid ----------
//
// Renders a row of equal-width tiles, one per scale point, each tile
// showing the integer value above and the anchor label below. Matches
// the Pretest BHS/ASCS/UCLA/NB/BPB rendering exactly.
//
// `anchors` is an array of { v: number, label: string }.
export function LikertItem({ prompt, anchors, value, onChange }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
      <div className="text-[15px] leading-relaxed text-slate-800 mb-3">{prompt}</div>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${anchors.length}, minmax(0, 1fr))` }}
      >
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
              <span
                className={
                  'text-[10px] leading-tight mt-1 ' +
                  (selected ? 'text-ctac-teal-50' : 'text-slate-500')
                }
              >
                {a.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Slider 0–N ----------
//
// `touched` is hoisted up so the parent can use it for per-screen
// validation. Until touched, the slider thumb renders at the visual
// midpoint with muted styling and a "Drag the slider" hint — the
// participant must explicitly interact before the response counts.
export function SliderItem({ prompt, min, max, anchors, value, touched, onChange }) {
  const displayValue = touched ? value : Math.round((min + max) / 2)
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
      <div className="text-[15px] leading-relaxed text-slate-800 mb-4">{prompt}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={displayValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className={
          'w-full h-2 rounded-full appearance-none cursor-pointer ' +
          (touched ? 'accent-ctac-teal-500' : 'accent-slate-300')
        }
      />
      <div className="flex justify-between mt-1 text-[11px] text-slate-500">
        {anchors.map((a, i) => (
          <span key={i}>{a}</span>
        ))}
      </div>
      <div className="text-center mt-3 text-[14px]">
        {touched ? (
          <span className="font-semibold text-ctac-teal-800">{value}</span>
        ) : (
          <span className="text-slate-400 italic">Drag the slider to choose.</span>
        )}
      </div>
    </div>
  )
}

// ---------- Number input ----------

export function NumberInput({ prompt, value, onChange, min, max, hint }) {
  return (
    <div className="mb-4">
      <label className="block text-[15px] text-slate-800 mb-2">{prompt}</label>
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value
          if (raw === '') return onChange(null)
          const n = Number(raw)
          if (Number.isNaN(n)) return
          onChange(n)
        }}
        min={min}
        max={max}
        className="w-full max-w-[140px] text-[16px] px-4 py-3 min-h-[48px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
      />
      {hint && <p className="text-[12px] text-slate-500 mt-1">{hint}</p>}
    </div>
  )
}

// ---------- Radio group ----------
//
// `options` is an array of { value, label }. `value` is what gets
// stored in the parent state.
export function RadioGroup({ prompt, options, value, onChange }) {
  return (
    <div className="mb-4">
      <div className="text-[15px] text-slate-800 mb-2">{prompt}</div>
      <div className="flex flex-col gap-2">
        {options.map((o) => {
          const selected = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={selected}
              className={
                'text-left rounded-2xl border min-h-[48px] px-4 py-2 text-[15px] transition-colors ' +
                (selected
                  ? 'bg-ctac-teal-200 border-ctac-teal-400 text-ctac-teal-900'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-ctac-teal-300')
              }
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Checkbox group ----------
//
// Each option has its own column key in the parent state (e.g.
// `race_white`, `race_black`). `values` is the parent state slice
// containing those keys; `onToggle(key)` flips the value between 0 and 1.
export function CheckboxGroup({ prompt, options, values, onToggle }) {
  return (
    <div className="mb-4">
      <div className="text-[15px] text-slate-800 mb-2">{prompt}</div>
      <div className="flex flex-col gap-2">
        {options.map((o) => {
          const checked = values[o.key] === 1
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onToggle(o.key)}
              aria-pressed={checked}
              className={
                'text-left rounded-2xl border min-h-[44px] px-4 py-2 text-[14px] flex items-center gap-3 transition-colors ' +
                (checked
                  ? 'bg-ctac-teal-100 border-ctac-teal-400 text-ctac-teal-900'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-ctac-teal-300')
              }
            >
              <span
                className={
                  'inline-flex items-center justify-center rounded-md w-5 h-5 border-2 flex-shrink-0 ' +
                  (checked ? 'bg-ctac-teal-500 border-ctac-teal-500 text-white' : 'border-slate-300')
                }
              >
                {checked ? '✓' : ''}
              </span>
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------- ScaleScreen ----------
//
// Convenience wrapper for a full screen of LikertItems that share a
// stem (e.g. "Below are several statements that may apply to you…").
// Used by every psychometric-scale screen in the surveys.
export function ScaleScreen({ heading, stem, items, anchors, data, setField }) {
  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-2">{heading}</h2>
      <p className="text-[14px] text-slate-600 mb-4 italic">{stem}</p>
      {items.map((it) => (
        <LikertItem
          key={it.key}
          prompt={it.text}
          anchors={anchors}
          value={data[it.key]}
          onChange={(v) => setField(it.key, v)}
        />
      ))}
    </div>
  )
}

// ---------- Progress strip ----------
//
// Thin amber bar + "Step X of Y" + screen label, identical to the
// Pretest header.
export function ProgressStrip({ stepIndex, totalSteps, screenLabel }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[12px] text-slate-500 uppercase tracking-wide">
          Step {stepIndex + 1} of {totalSteps}
        </span>
        <span className="text-[12px] text-slate-500">{screenLabel}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-ctac-teal-500 transition-all"
          style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  )
}
