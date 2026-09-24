// Resilient Roots design system — IconDisc (Resilient Roots Draft 1).
// Ported from the Claude Design export, components/core/IconDisc.jsx. The
// brand's recurring unit: a glyph (or numeral) centred in a filled circle.
// `icon` takes a lucide-react component; `children` renders a numeral.

const TONES = {
  teal: { background: 'var(--accent)', color: 'var(--text-on-accent)' },
  sage: { background: 'var(--brand)', color: 'var(--text-on-accent)' },
  mint: { background: 'var(--surface-sunken)', color: 'var(--accent-hover)' },
  gold: { background: 'var(--highlight-soft)', color: 'var(--gold-700)' },
  outline: { background: 'transparent', color: 'var(--accent)', boxShadow: 'inset 0 0 0 2px var(--teal-300)' },
}

export default function IconDisc({ icon: IconC, children, size = 64, tone = 'teal', label, style }) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-circle)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
        fontFamily: 'var(--font-display)',
        fontWeight: 'var(--fw-bold)',
        fontSize: size * 0.42,
        ...TONES[tone],
        ...style,
      }}
    >
      {IconC ? <IconC size={Math.round(size * 0.46)} strokeWidth={1.75} aria-hidden="true" /> : children}
    </span>
  )
}
