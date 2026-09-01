// Shadowmend design system — TextInput / TextArea (Draft 53).
// Hand-authored, matching the input styling already established in
// BodyMapping's write-in field and ElevatorPitch's greeting/custom fields.

export function TextInput({ value, onChange, placeholder, type = 'text', className = '', ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={'w-full text-[14px] px-3.5 py-2.5 rounded-2xl focus:outline-none ' + className}
      style={{ minHeight: 'var(--tap-min)', background: 'var(--action-quiet)', border: '1px solid var(--border-soft)', color: 'var(--text-bright)' }}
      {...rest}
    />
  )
}

export function TextArea({ value, onChange, placeholder, rows = 3, maxLength, ...rest }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className="w-full text-[14px] px-3.5 py-2.5 rounded-2xl focus:outline-none resize-none"
      style={{ background: 'var(--action-quiet)', border: '1px solid var(--border-soft)', color: 'var(--text-bright)' }}
      {...rest}
    />
  )
}
