// Resilient Roots design system — Button (Resilient Roots Draft 1).
// Ported from the Claude Design export,
// `Resilient Roots/Design System Export/components/core/Button.jsx`, near
// verbatim. Changes: plain JS default export; `icon` / `iconEnd` take a
// lucide-react component (e.g. `ArrowRight`) instead of a Lucide name
// string, since the app already bundles lucide-react (no CDN script).
// `as` lets it render a react-router Link with the same styling.

import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'

const SIZES = {
  sm: { height: 'var(--control-h-sm)', padding: '0 var(--space-4)', fontSize: 'var(--fs-body-sm)' },
  md: { height: 'var(--control-h-md)', padding: '0 var(--space-6)', fontSize: 'var(--fs-body)' },
  lg: { height: 'var(--control-h-lg)', padding: '0 var(--space-8)', fontSize: 'var(--fs-body-lg)' },
}
const VARIANTS = {
  primary: { background: 'var(--accent)', color: 'var(--text-on-accent)', border: '1px solid transparent' },
  secondary: { background: 'var(--surface-card)', color: 'var(--accent-hover)', border: '1px solid var(--teal-300)' },
  brand: { background: 'var(--brand)', color: 'var(--text-on-accent)', border: '1px solid transparent' },
  ghost: { background: 'transparent', color: 'var(--accent-hover)', border: '1px solid transparent' },
  quiet: { background: 'var(--surface-sunken)', color: 'var(--text-heading)', border: '1px solid transparent' },
}
const HOVER = {
  primary: 'var(--accent-hover)',
  secondary: 'var(--teal-100)',
  brand: 'var(--brand-hover)',
  ghost: 'var(--teal-100)',
  quiet: 'var(--sage-200)',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: IconStart,
  iconEnd: IconEnd,
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  as,
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = useState(false)
  const [press, setPress] = useState(false)
  const v = VARIANTS[variant] || VARIANTS.primary
  const iconSize = size === 'lg' ? 20 : 18
  const El = as || 'button'
  const elProps = El === 'button' ? { type, disabled: disabled || loading } : null
  return (
    <El
      {...elProps}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setPress(false)
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        width: fullWidth ? '100%' : 'auto',
        minWidth: fullWidth ? 0 : 'var(--hit-min)',
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--fw-bold)',
        lineHeight: 1,
        textDecoration: 'none',
        borderRadius: 'var(--radius-control)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'var(--transition-control), transform var(--dur-instant) var(--ease-standard)',
        transform: press && !disabled ? 'scale(.98)' : 'none',
        boxShadow: variant === 'primary' || variant === 'brand' ? 'var(--shadow-sm)' : 'none',
        ...SIZES[size],
        ...v,
        background: hover && !disabled ? HOVER[variant] : v.background,
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <LoaderCircle size={18} strokeWidth={1.75} style={{ animation: 'rr-spin 900ms linear infinite' }} />
      ) : IconStart ? (
        <IconStart size={iconSize} strokeWidth={1.75} aria-hidden="true" />
      ) : null}
      {children}
      {IconEnd ? <IconEnd size={iconSize} strokeWidth={1.75} aria-hidden="true" /> : null}
    </El>
  )
}
