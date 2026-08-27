// Shadowmend design system — ParticleField (Draft 49).
// Ported from Claude Design project 08785bf5-7c7a-49df-b4d7-a431c47e345f,
// components/world/ParticleField.jsx, near verbatim. Deterministic (sine-
// based, not Math.random) so the drift pattern is stable across renders.

import { useMemo } from 'react'

export default function ParticleField({ count = 18, color = 'var(--gold-300)', style, ...rest }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const r = (n) => (((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1
        return { left: r(1) * 100, top: r(2) * 100, size: 2 + r(3) * 3, delay: -r(4) * 9, dur: 7 + r(5) * 8, op: 0.25 + r(6) * 0.5 }
      }),
    [count]
  )
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }} {...rest}>
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: m.left + '%',
            top: m.top + '%',
            width: m.size,
            height: m.size,
            borderRadius: 'var(--radius-pill)',
            background: color,
            opacity: m.op,
            boxShadow: '0 0 8px rgba(253,230,138,.7)',
            animation: `sm-drift ${m.dur}s linear ${m.delay}s infinite, sm-breathe ${m.dur / 2}s ease-in-out ${m.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
