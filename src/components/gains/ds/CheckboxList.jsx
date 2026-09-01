// Shadowmend design system — CheckboxList (Draft 53).
// Hand-authored, matching RadioList's visual language but multi-select
// (toggles membership in an array instead of single value). Supports an
// "Another" option that reveals a free-text field on selection -- same
// reveal-on-tap shape used elsewhere in this app (ElevatorPitch's "Write
// your own", BodyMapping's "another area" write-in).

import { useState } from 'react'

export default function CheckboxList({ options, value, onChange, otherOption, otherValue, onOtherChange, name }) {
  const [otherEngaged, setOtherEngaged] = useState(Boolean(otherValue))
  const toggle = (v) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  }
  return (
    <div className="space-y-2" role="group" aria-label={name}>
      {options.map((opt) => {
        const selected = value.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={() => toggle(opt.value)}
            className="w-full text-left px-3.5 rounded-2xl text-[13px] leading-snug border transition-colors flex items-center gap-2.5"
            style={{
              minHeight: 'var(--tap-min)',
              padding: '10px 14px',
              background: selected ? 'var(--action-primary)' : 'var(--action-quiet)',
              borderColor: selected ? 'var(--action-primary)' : 'var(--border-soft)',
              color: selected ? 'var(--text-on-warm)' : 'var(--text-body)',
              fontWeight: selected ? 'var(--weight-bold)' : 'var(--weight-regular)',
            }}
          >
            <span
              aria-hidden="true"
              className="flex-shrink-0 rounded-[6px] flex items-center justify-center"
              style={{
                width: 18,
                height: 18,
                border: '1.5px solid ' + (selected ? 'var(--text-on-warm)' : 'var(--border-strong)'),
                background: selected ? 'var(--text-on-warm)' : 'transparent',
              }}
            >
              {selected && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4.5L4 7.5L10 1" stroke="var(--action-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {opt.label}
          </button>
        )
      })}
      {otherOption && (
        <>
          {!otherEngaged ? (
            <button
              type="button"
              onClick={() => setOtherEngaged(true)}
              className="w-full text-left px-3.5 rounded-2xl text-[13px] leading-snug border border-dashed"
              style={{ minHeight: 'var(--tap-min)', padding: '10px 14px', borderColor: 'var(--border-soft)', color: 'var(--text-faint)' }}
            >
              {otherOption}
            </button>
          ) : (
            <input
              type="text"
              value={otherValue || ''}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder={otherOption}
              autoFocus
              className="w-full text-[14px] px-3.5 py-2.5 rounded-2xl focus:outline-none"
              style={{ minHeight: 'var(--tap-min)', background: 'var(--action-quiet)', border: '1px solid var(--border-warm)', color: 'var(--text-bright)' }}
            />
          )}
        </>
      )}
    </div>
  )
}
