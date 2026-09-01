// Shadowmend design system — RadioList (Draft 53).
// Hand-authored (not ported -- the DesignSync connector's authorization had
// lapsed by this draft) to match the established Shadowmend token language:
// same translucent-quiet/amber-selected treatment already used by
// ElevatorPitch's SelectStep and BodyMapping's OtherAreaField. A vertical
// list of full-text, single-select options -- for Yes/No questions and any
// scale where every point has its own distinct label (not just numbers).

export default function RadioList({ options, value, onChange, name }) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className="w-full text-left px-3.5 rounded-2xl text-[13px] leading-snug border transition-colors"
            style={{
              minHeight: 'var(--tap-min)',
              padding: '10px 14px',
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
