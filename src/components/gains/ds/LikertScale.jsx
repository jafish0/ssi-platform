// Shadowmend design system — LikertScale (Draft 53).
// Hand-authored. A row of numbered, single-select points (1..count) with
// only the two endpoints labeled -- the classic "Strongly disagree ...
// Strongly agree" Likert row, for scales where the anchors are on the ends
// only (Implicit Theories, Trauma Beliefs, Program Feedback, the Motivation
// Ruler), as opposed to RadioList where every point has its own label
// (CTS, Beck-4).

export default function LikertScale({ count, startAt = 1, minLabel, maxLabel, value, onChange, name }) {
  const points = Array.from({ length: count }, (_, i) => i + startAt)
  return (
    <div role="radiogroup" aria-label={name}>
      <div className="flex flex-wrap gap-2 justify-center">
        {points.map((n) => {
          const selected = value === n
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${n} of ${count}`}
              onClick={() => onChange(n)}
              className="rounded-full text-[13px] font-bold flex items-center justify-center transition-colors"
              style={{
                width: 'var(--tap-min)',
                height: 'var(--tap-min)',
                background: selected ? 'var(--action-primary)' : 'var(--action-quiet)',
                border: '1px solid ' + (selected ? 'var(--action-primary)' : 'var(--border-soft)'),
                color: selected ? 'var(--text-on-warm)' : 'var(--text-body)',
                boxShadow: selected ? 'var(--glow-sm)' : 'none',
              }}
            >
              {n}
            </button>
          )
        })}
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex justify-between mt-1.5 text-[11px]" style={{ color: 'var(--text-faint)' }}>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  )
}
