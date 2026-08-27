// Shadowmend design system — Card (Draft 50).
// Ported from Claude Design project 08785bf5-7c7a-49df-b4d7-a431c47e345f,
// components/core/Card.jsx, near verbatim.

import { useState } from 'react'

const TONES = {
  frosted: { background: 'var(--surface-card)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)', color: 'var(--text-body)' },
  raised: { background: 'var(--surface-card-raised)', border: '1px solid var(--border-strong)', backdropFilter: 'var(--blur-panel)', color: 'var(--text-body)' },
  sheet: { background: 'var(--surface-sheet)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-sheet)', color: 'var(--text-body)' },
  light: { background: 'var(--surface-light)', border: '1px solid var(--border-on-light)', color: 'var(--text-on-light)' },
}

export default function Card({ children, tone = 'frosted', glow = false, padding = 'var(--space-6)', style, onClick, ...rest }) {
  const [hover, setHover] = useState(false)
  const t = TONES[tone] || TONES.frosted
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 'var(--radius-xl)',
        padding,
        ...t,
        boxShadow: glow ? 'var(--glow-md), var(--shadow-md)' : 'var(--shadow-md)',
        transform: onClick && hover ? 'translateY(var(--lift-hover))' : 'none',
        cursor: onClick ? 'pointer' : undefined,
        transition: 'transform var(--dur-calm) var(--ease-settle), box-shadow var(--dur-calm) var(--ease-soft)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
