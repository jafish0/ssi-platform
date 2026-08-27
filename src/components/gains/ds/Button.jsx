// Shadowmend design system — Button (Draft 49).
// Ported from Claude Design project 08785bf5-7c7a-49df-b4d7-a431c47e345f,
// components/core/Button.jsx, near verbatim. `sizes.lg` (--control-h-lg,
// 60px) clears the design system's 48px --tap-min floor with room to
// spare; every size does.

import { useState } from 'react'

const base = {
  fontFamily: 'var(--font-core)',
  fontWeight: 'var(--weight-bold)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  border: '1px solid transparent',
  borderRadius: 'var(--radius-pill)',
  textAlign: 'center',
  transition:
    'transform var(--dur-quick) var(--ease-settle), background var(--dur-quick) var(--ease-soft), box-shadow var(--dur-calm) var(--ease-soft), opacity var(--dur-quick) var(--ease-soft)',
}

const sizes = {
  sm: { height: 'var(--control-h-sm)', padding: '0 var(--space-5)', fontSize: 'var(--text-small)' },
  md: { height: 'var(--control-h)', padding: '0 var(--space-8)', fontSize: 'var(--text-body-size)' },
  lg: { height: 'var(--control-h-lg)', padding: '0 var(--space-10)', fontSize: 'var(--text-lead)' },
}

const variants = {
  primary: { background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-md), var(--glow-inset)' },
  secondary: { background: 'var(--action-quiet)', color: 'var(--text-bright)', borderColor: 'var(--border-strong)', backdropFilter: 'var(--blur-panel)' },
  ghost: { background: 'transparent', color: 'var(--text-body)' },
  glow: { background: 'transparent', color: 'var(--text-warm)', borderColor: 'var(--border-warm)', boxShadow: 'var(--glow-sm)' },
}

export default function Button({ children, variant = 'primary', size = 'md', fullWidth = false, disabled = false, iconLeft, iconRight, style, onClick, ...rest }) {
  const [hover, setHover] = useState(false)
  const [press, setPress] = useState(false)
  const v = variants[variant] || variants.primary
  const hoverStyle =
    !disabled && hover
      ? variant === 'primary'
        ? { background: 'var(--action-primary-hover)', boxShadow: 'var(--glow-lg), var(--glow-inset)' }
        : variant === 'secondary'
          ? { background: 'var(--action-quiet-hover)' }
          : { color: 'var(--text-bright)', boxShadow: variant === 'glow' ? 'var(--glow-md)' : 'none' }
      : null
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setPress(false)
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        ...base,
        ...sizes[size],
        ...v,
        ...hoverStyle,
        width: fullWidth ? '100%' : undefined,
        minWidth: 'var(--tap-min)',
        minHeight: 'var(--tap-min)',
        transform: press ? 'scale(var(--press-scale))' : 'none',
        opacity: disabled ? 'var(--opacity-disabled)' : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  )
}
