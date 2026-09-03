// Shadowmend design system — LikertScale (Draft 53).
// Hand-authored. A row of numbered, single-select points (1..count) with
// only the two endpoints labeled -- the classic "Strongly disagree ...
// Strongly agree" Likert row, for scales where the anchors are on the ends
// only (Implicit Theories, Trauma Beliefs, Program Feedback, the Motivation
// Ruler), as opposed to RadioList where every point has its own label
// (CTS, Beck-4).
//
// Draft 71: the points sit in a grid that always fits the width -- up to
// six points share one row (shrinking a little below the 48px tap target
// where the frame is narrow, never below 40px), and a 10-point ruler is two
// rows of five -- instead of the old flex-wrap, which broke a 6-point row
// into two ragged lines inside a 9:16 phone frame.

export default function LikertScale({ count, startAt = 1, minLabel, maxLabel, value, onChange, name }) {
  const points = Array.from({ length: count }, (_, i) => i + startAt)
  const cols = count > 6 ? Math.ceil(count / 2) : count
  return (
    <div role="radiogroup" aria-label={name}>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 6 }}>
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
              className="rounded-full text-[13px] font-bold flex items-center justify-center transition-colors mx-auto"
              style={{
                width: '100%',
                maxWidth: 'var(--tap-min)',
                aspectRatio: '1 / 1',
                minHeight: 40,
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
