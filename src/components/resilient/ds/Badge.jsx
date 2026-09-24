// Resilient Roots design system — Badge (Resilient Roots Draft 1).
// Ported from the Claude Design export, components/core/Badge.jsx, near
// verbatim. `icon` takes a lucide-react component.

const TONES = {
  neutral: { background: 'var(--ink-100)', color: 'var(--ink-700)' },
  brand: { background: 'var(--brand-soft)', color: 'var(--sage-900)' },
  accent: { background: 'var(--accent-soft)', color: 'var(--teal-800)' },
  ok: { background: 'var(--ok-soft)', color: 'var(--ok)' },
  caution: { background: 'var(--caution-soft)', color: 'var(--gold-700)' },
  alert: { background: 'var(--alert-soft)', color: 'var(--alert)' },
}

export default function Badge({ children, tone = 'neutral', icon: IconC, style, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: '3px var(--space-3)',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-caption)',
        fontWeight: 'var(--fw-bold)',
        letterSpacing: '.02em',
        lineHeight: 1.45,
        ...TONES[tone],
        ...style,
      }}
      {...rest}
    >
      {IconC ? <IconC size={13} strokeWidth={1.75} aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
