// Spark's voiced popup inside the walkable zone (GAINS Draft 68): portrait +
// the line as text, floating just under the gear HUD while the VO plays. The
// voice is the primary cue; this is the backup (and the only cue with sound
// off). It sits at the TOP of the frame over the sky, because the bottom is
// where the Traveler starts and the path runs -- a bubble there covered the
// player. Same look as the design system's SparkDialogue, compacted for a
// phone frame.

const SPARK_PORTRAIT = '/long-light/art/narrator-spark.webp'

export default function SparkBubble({ text, visible }) {
  if (!text) return null
  return (
    <div
      className="absolute left-3 right-3 z-20"
      style={{
        top: 58,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(-8px)',
        transition: 'opacity var(--dur-calm) var(--ease-soft), transform var(--dur-calm) var(--ease-settle)',
      }}
      aria-live="polite"
    >
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          alignItems: 'flex-start',
          background: 'var(--surface-sheet)',
          backdropFilter: 'var(--blur-sheet)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-3) var(--space-4)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <span
          style={{
            flex: '0 0 auto',
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-pill)',
            overflow: 'hidden',
            border: '1px solid var(--border-warm)',
            boxShadow: 'var(--glow-sm)',
          }}
        >
          <img src={SPARK_PORTRAIT} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 42%' }} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--text-label)',
              letterSpacing: 'var(--tracking-caps)',
              textTransform: 'uppercase',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--text-warm)',
              marginBottom: 2,
            }}
          >
            Spark
          </div>
          <p style={{ fontSize: 14, lineHeight: 'var(--leading-snug)', color: 'var(--text-bright)', margin: 0 }}>{text}</p>
        </div>
      </div>
    </div>
  )
}
