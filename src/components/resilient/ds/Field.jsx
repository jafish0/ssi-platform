// Resilient Roots design system — Field (Resilient Roots Draft 1).
// Ported from the Claude Design export, components/forms/Field.jsx: the
// label + hint/error wrapper shared by every form control.

export default function Field({ label, hint, error, required = false, htmlFor, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style }}>
      {label ? (
        <label
          htmlFor={htmlFor}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-body-sm)',
            fontWeight: 'var(--fw-bold)',
            color: 'var(--text-heading)',
          }}
        >
          {label}
          {required ? <span style={{ color: 'var(--alert)', marginLeft: 3 }}>*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-caption)', color: 'var(--alert)' }}>{error}</span>
      ) : hint ? (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>{hint}</span>
      ) : null}
    </div>
  )
}
