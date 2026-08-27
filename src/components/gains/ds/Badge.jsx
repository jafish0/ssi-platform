// Shadowmend design system — Badge (Draft 50).
// Ported from Claude Design project 08785bf5-7c7a-49df-b4d7-a431c47e345f,
// components/core/Badge.jsx, near verbatim.

const TONES = {
  warm: { background: 'rgba(253,230,138,.16)', color: 'var(--gold-300)', borderColor: 'var(--border-warm)' },
  quiet: { background: 'var(--action-quiet)', color: 'var(--text-muted)', borderColor: 'var(--border-soft)' },
  sky: { background: 'rgba(219,101,140,.18)', color: '#FFC7D8', borderColor: 'rgba(219,101,140,.42)' },
  water: { background: 'rgba(30,96,143,.24)', color: '#A8D8EE', borderColor: 'rgba(30,96,143,.5)' },
}

export default function Badge({ children, tone = 'warm', dot = false, icon, style, ...rest }) {
  const t = TONES[tone] || TONES.warm
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        height: 26,
        padding: '0 var(--space-3)',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--text-label)',
        fontWeight: 'var(--weight-bold)',
        letterSpacing: 'var(--tracking-caps)',
        textTransform: 'uppercase',
        border: '1px solid',
        fontFamily: 'var(--font-core)',
        ...t,
        ...style,
      }}
      {...rest}
    >
      {icon}
      {dot && <span style={{ width: 6, height: 6, borderRadius: 'var(--radius-pill)', background: 'currentColor', boxShadow: 'var(--glow-sm)' }} />}
      {children}
    </span>
  )
}
