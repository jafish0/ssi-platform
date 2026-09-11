// Shadowmend design system — RangeSlider (Draft 73, 9/11 review).
//
// The Ready-for-Roots ruler pattern (see SliderItem in
// src/activities/Pretest.jsx) in this program's look: an <input type="range">
// with the anchor text at each end, NO default value -- the thumb rests one
// tick before `min` (not an answerable value) until the tester drags it, so
// "answered" means a deliberate choice, and the chosen number shows large.
// Untouched = `value` null/undefined, which the measures flow counts as
// unanswered.

export default function RangeSlider({ min = 1, max = 10, value, onChange, minLabel, maxLabel, name }) {
  const touched = value != null
  const restValue = min - 1
  const shown = touched ? value : restValue
  return (
    <div>
      <input
        type="range"
        min={restValue}
        max={max}
        step={1}
        value={shown}
        aria-label={name}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={touched ? value : undefined}
        aria-valuetext={touched ? String(value) : 'not yet chosen'}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (n < min) return
          onChange(n)
        }}
        className="w-full cursor-pointer"
        style={{ accentColor: touched ? 'var(--action-primary)' : 'var(--slate-300)', height: 28 }}
      />
      <div className="flex justify-between text-[12px] font-semibold -mt-0.5" style={{ color: 'var(--text-body)' }}>
        <span>{minLabel != null ? minLabel : min}</span>
        <span>{maxLabel != null ? maxLabel : max}</span>
      </div>
      <div className="text-center mt-1 leading-none" aria-hidden="true">
        {touched ? (
          <span className="text-[26px] font-extrabold" style={{ color: 'var(--text-warm)' }}>
            {value}
          </span>
        ) : (
          <span className="text-[12px] italic" style={{ color: 'var(--text-muted)' }}>
            Drag the slider to choose.
          </span>
        )}
      </div>
    </div>
  )
}
