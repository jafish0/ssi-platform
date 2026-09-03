// Shadowmend design system — RadioList (Draft 53).
// Hand-authored (not ported -- the DesignSync connector's authorization had
// lapsed by this draft) to match the established Shadowmend token language:
// same translucent-quiet/amber-selected treatment already used by
// ElevatorPitch's SelectStep and BodyMapping's OtherAreaField. A list of
// full-text, single-select options -- for Yes/No questions and any scale
// where every point has its own distinct label (not just numbers).
//
// Draft 71: `columns` lays the options out in a grid (2 columns halves the
// height of a 4-point scale) so a measures step fits a 9:16 phone frame
// without scrolling. Default stays the single column.

export default function RadioList({ options, value, onChange, name, columns = 1 }) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={columns > 1 ? 'grid gap-1.5' : 'space-y-2'}
      style={columns > 1 ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
    >
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={'w-full rounded-2xl text-[13px] leading-snug border transition-colors ' + (columns > 1 ? 'text-center' : 'text-left')}
            style={{
              // Grid mode trims to a 44px target (Apple HIG's floor) so a
              // 4-point scale fits a phone frame; the list keeps 48.
              minHeight: columns > 1 ? 44 : 'var(--tap-min)',
              padding: columns > 1 ? '5px 10px' : '10px 14px',
              background: selected ? 'var(--action-primary)' : 'var(--action-quiet)',
              borderColor: selected ? 'var(--action-primary)' : 'var(--border-soft)',
              color: selected ? 'var(--text-on-warm)' : 'var(--text-body)',
              fontWeight: selected ? 'var(--weight-bold)' : 'var(--weight-regular)',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
