// Resilient Roots design system — Textarea (Resilient Roots Draft 1).
// Ported from the Claude Design export, components/forms/Textarea.jsx:
// 10px field radius, teal border + 3px focus ring on focus.

import { useState } from 'react'

export default function Textarea({ rows = 5, invalid = false, disabled = false, style, ...rest }) {
  const [focus, setFocus] = useState(false)
  return (
    <textarea
      rows={rows}
      disabled={disabled}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        width: '100%',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--fs-body)',
        color: 'var(--text-body)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        lineHeight: 'var(--lh-body)',
        resize: 'vertical',
        outline: 'none',
        transition: 'var(--transition-control)',
        borderColor: invalid ? 'var(--alert)' : focus ? 'var(--focus-ring)' : 'var(--border-subtle)',
        boxShadow: focus ? 'var(--ring-focus)' : 'none',
        background: disabled ? 'var(--ink-100)' : 'var(--surface-card)',
        ...style,
      }}
      {...rest}
    />
  )
}
