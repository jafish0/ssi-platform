// Resilient Roots design system — Toast (Resilient Roots Draft 1).
// Ported from the Claude Design export, components/feedback/Toast.jsx.
// Low-alarm status colours only; the dismiss x is a real button.

import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react'

const TONES = {
  ok: { icon: CheckCircle2, color: 'var(--ok)', background: 'var(--ok-soft)' },
  info: { icon: Info, color: 'var(--teal-800)', background: 'var(--info-soft)' },
  caution: { icon: AlertTriangle, color: 'var(--gold-700)', background: 'var(--caution-soft)' },
  alert: { icon: AlertCircle, color: 'var(--alert)', background: 'var(--alert-soft)' },
}

export default function Toast({ children, tone = 'ok', onDismiss, style }) {
  const t = TONES[tone] || TONES.ok
  const ToneIcon = t.icon
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-5)',
        borderRadius: 'var(--radius-pill)',
        background: t.background,
        color: t.color,
        boxShadow: 'var(--shadow-raised)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-body-sm)',
        fontWeight: 'var(--fw-medium)',
        ...style,
      }}
    >
      <ToneIcon size={18} strokeWidth={1.75} aria-hidden="true" />
      <span style={{ flex: 1 }}>{children}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{ display: 'inline-flex', background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', opacity: 0.7 }}
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  )
}
