// Shadowmend design system — SceneFrame (Draft 49).
// Ported from Claude Design project 08785bf5-7c7a-49df-b4d7-a431c47e345f,
// components/world/SceneFrame.jsx, near verbatim: a full-bleed backdrop
// image over one of the twilight sky gradients, with top/bottom veils for
// legibility and a drifting ParticleField. `veil`/`particles` match the
// source API.

import ParticleField from './ParticleField.jsx'

const SKIES = {
  abyss: 'var(--sky-abyss)',
  dusk: 'var(--sky-dusk)',
  twilight: 'var(--sky-twilight)',
  dawn: 'var(--sky-dawn)',
  beacon: 'var(--sky-beacon)',
}

export default function SceneFrame({ children, image, alt = '', sky = 'dusk', particles = true, veil = 'bottom', overlay, style, ...rest }) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        background: SKIES[sky] || SKIES.dusk,
        isolation: 'isolate',
        ...style,
      }}
      {...rest}
    >
      {image && (
        <img
          src={image}
          alt={alt}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      {particles && <ParticleField />}
      {(veil === 'bottom' || veil === 'both') && (
        <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '62%', background: 'var(--veil-bottom)' }} />
      )}
      {(veil === 'top' || veil === 'both') && (
        <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '26%', background: 'var(--veil-top)' }} />
      )}
      {overlay}
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  )
}
