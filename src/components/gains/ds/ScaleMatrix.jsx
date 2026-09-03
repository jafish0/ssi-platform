// Shadowmend design system — ScaleMatrix (2026-09-03, Josh: "halve the
// number of Continues on the pre-test").
//
// The paper-form layout for a rated scale: the response options are COLUMN
// HEADERS printed once at the top, and every item is its text plus one row
// of tap circles under those headers. Compared to a full-text button per
// option per item (RadioList) this is roughly half the height, so a whole
// 4-point instrument (CTS, Beck-4) fits one phone-frame page, and the
// 6-point end-anchored scales fit three items per page.
//
// Two flavors:
//   - labeled:  `options[].label` become the column headers (CTS, Beck-4);
//               circles are blank, filled when selected.
//   - numeric:  pass `minLabel`/`maxLabel`; the circles show the point
//               number and the two anchors print once above the items
//               (Implicit Theories, Trauma Beliefs, Program Feedback).
// `values` is the whole answer map; each item's `key` indexes into it.

const CIRCLE = 40 // px; a compact tap target, still comfortably tappable

// `missing` (optional) lists item keys the tester still has to answer after
// trying to continue; those rows get the warm-coral highlight.
export default function ScaleMatrix({ items, options, values, onChange, name, minLabel, maxLabel, missing = [] }) {
  const numeric = Boolean(minLabel || maxLabel)
  const cols = { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }
  return (
    <div role="group" aria-label={name}>
      {!numeric && (
        <div className="grid mb-1" style={cols}>
          {options.map((o) => (
            <div key={o.value} className="text-[10px] leading-tight text-center px-0.5 font-semibold" style={{ color: 'var(--text-muted)' }}>
              {o.label}
            </div>
          ))}
        </div>
      )}
      {numeric && (
        <div className="flex justify-between text-[11px] mb-1" style={{ color: 'var(--text-faint)' }}>
          <span>
            {options[0].value} = {minLabel}
          </span>
          <span>
            {options[options.length - 1].value} = {maxLabel}
          </span>
        </div>
      )}
      {items.map((item) => {
        const current = values[item.key]
        const isMissing = missing.includes(item.key)
        return (
          <div
            key={item.key}
            className="pt-1.5 mt-1"
            data-missing={isMissing || undefined}
            style={{
              borderTop: '1px solid var(--border-soft)',
              ...(isMissing ? { borderLeft: '3px solid var(--coral-400)', paddingLeft: 8, marginLeft: -11, borderRadius: 4 } : null),
            }}
          >
            <p className="text-[13px] leading-snug mb-1.5" style={{ color: isMissing ? 'var(--coral-400)' : 'var(--text-bright)' }}>
              {item.n != null && <span style={{ color: isMissing ? 'var(--coral-400)' : 'var(--text-warm)' }}>{item.n}. </span>}
              {item.text}
            </p>
            <div role="radiogroup" aria-label={item.text} className="grid" style={{ ...cols, gap: 4 }}>
              {options.map((o) => {
                const selected = current === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={numeric ? `${o.value} of ${options[options.length - 1].value}` : o.label}
                    onClick={() => onChange(item.key, o.value)}
                    className="mx-auto rounded-full flex items-center justify-center text-[12px] font-bold transition-colors"
                    style={{
                      width: CIRCLE,
                      height: CIRCLE,
                      background: selected ? 'var(--action-primary)' : 'var(--action-quiet)',
                      border: '1px solid ' + (selected ? 'var(--action-primary)' : 'var(--border-strong)'),
                      color: selected ? 'var(--text-on-warm)' : 'var(--text-body)',
                      boxShadow: selected ? 'var(--glow-sm)' : 'none',
                    }}
                  >
                    {numeric ? o.value : selected ? '✓' : ''}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
