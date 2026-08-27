// Shadowmend design system — CharacterFigure (Draft 49).
// Ported from Claude Design project 08785bf5-7c7a-49df-b4d7-a431c47e345f,
// components/world/CharacterFigure.jsx. The source composites named
// `characters/traveler-N-*.webp` stage art; this app's existing Traveler
// art isn't split into those four discrete files, so `stage` here only
// picks the halo glow color/scale (still the intended "the darkness
// lightens as the Traveler climbs" cue) while `src` is passed explicitly.

const STAGES = {
  dark: { glow: 'rgba(70,90,150,.30)', scale: 0.96 },
  canonical: { glow: 'rgba(245,153,110,.45)', scale: 1 },
  lightening: { glow: 'rgba(253,214,138,.55)', scale: 1.01 },
  radiant: { glow: 'rgba(255,247,234,.70)', scale: 1.02 },
}

export default function CharacterFigure({ src, alt = 'The Traveler', stage = 'canonical', size = 260, halo = true, style, ...rest }) {
  const s = STAGES[stage] || STAGES.canonical
  return (
    <div style={{ position: 'relative', width: size, aspectRatio: '9 / 16', ...style }} {...rest}>
      {halo && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            top: '42%',
            width: size * 1.5,
            height: size * 1.5,
            transform: 'translate(-50%,-50%)',
            borderRadius: 'var(--radius-pill)',
            background: `radial-gradient(circle,${s.glow} 0%,rgba(0,0,0,0) 68%)`,
            animation: 'sm-breathe var(--dur-breathe) var(--ease-drift) infinite',
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          transform: `scale(${s.scale})`,
          transition: 'transform var(--dur-slow) var(--ease-settle)',
        }}
      />
    </div>
  )
}
