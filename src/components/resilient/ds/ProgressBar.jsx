// Resilient Roots design system — ProgressBar (Resilient Roots Draft 1).
// Ported from the Claude Design export, components/feedback/ProgressBar.jsx,
// near verbatim. Fills ease over --dur-slow (360ms), 0 under reduced motion.

export default function ProgressBar({ value = 0, max = 100, label, showValue = false, size = 'md', tone = 'accent', style }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const h = size === 'sm' ? 6 : size === 'lg' ? 14 : 10
  const fill = tone === 'brand' ? 'var(--brand)' : tone === 'ok' ? 'var(--ok)' : 'var(--accent)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%', ...style }}>
      {label || showValue ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--fs-caption)',
            color: 'var(--text-muted)',
          }}
        >
          <span>{label}</span>
          {showValue ? <span style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-body)' }}>{Math.round(pct)}%</span> : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={typeof label === 'string' ? label : undefined}
        style={{ height: h, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)', overflow: 'hidden' }}
      >
        <div
          style={{
            width: pct + '%',
            height: '100%',
            borderRadius: 'var(--radius-pill)',
            background: fill,
            transition: 'width var(--dur-slow) var(--ease-out)',
          }}
        />
      </div>
    </div>
  )
}
