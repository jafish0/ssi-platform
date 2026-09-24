// Resilient Roots design system — Card (Resilient Roots Draft 1).
// Ported from the Claude Design export, components/core/Card.jsx, near
// verbatim (plain JS default export). White card = hairline + soft
// sage-tinted shadow; mint and sage tones carry no border or shadow.

import { useState } from 'react'

const TONES = {
  default: { background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' },
  mint: { background: 'var(--surface-sunken)', border: '1px solid transparent', boxShadow: 'none' },
  sage: { background: 'var(--surface-band)', border: '1px solid transparent', boxShadow: 'none', color: 'var(--text-on-band)' },
  outline: { background: 'transparent', border: '1px solid var(--border-brand)', boxShadow: 'none' },
}
const PADS = { none: 0, sm: 'var(--space-4)', md: 'var(--space-6)', lg: 'var(--space-8)' }

export default function Card({ children, tone = 'default', padding = 'md', interactive = false, as = 'div', style, ...rest }) {
  const [hover, setHover] = useState(false)
  const El = as
  return (
    <El
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 'var(--radius-card)',
        padding: PADS[padding],
        color: 'var(--text-body)',
        transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',
        cursor: interactive ? 'pointer' : undefined,
        ...TONES[tone],
        ...(interactive && hover ? { boxShadow: 'var(--shadow-raised)', transform: 'translateY(-2px)' } : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </El>
  )
}
