// Resilient Roots design system — Tag (Resilient Roots Draft 1).
// Ported from the Claude Design export, components/core/Tag.jsx. Change:
// an interactive tag is a real <button> (keyboard and screen reader for
// free) instead of a span with role="button".

import { useState } from 'react'
import { X } from 'lucide-react'

export default function Tag({ children, selected = false, onSelect, onRemove, disabled = false, style, ...rest }) {
  const [hover, setHover] = useState(false)
  const interactive = !!onSelect
  const El = interactive ? 'button' : 'span'
  return (
    <El
      {...(interactive ? { type: 'button', disabled, 'aria-pressed': selected } : null)}
      onClick={disabled ? undefined : onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        minHeight: 34,
        padding: '6px var(--space-4)',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-body-sm)',
        fontWeight: 'var(--fw-medium)',
        border: '1px solid ' + (selected ? 'var(--accent)' : 'var(--border-subtle)'),
        background: selected ? 'var(--accent-soft)' : hover && interactive ? 'var(--sage-50)' : 'var(--surface-card)',
        color: selected ? 'var(--teal-800)' : 'var(--text-body)',
        cursor: interactive && !disabled ? 'pointer' : 'default',
        opacity: disabled ? 0.45 : 1,
        transition: 'var(--transition-control)',
        ...style,
      }}
      {...rest}
    >
      {children}
      {onRemove ? (
        <X
          size={14}
          strokeWidth={1.75}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          style={{ cursor: 'pointer' }}
        />
      ) : null}
    </El>
  )
}
