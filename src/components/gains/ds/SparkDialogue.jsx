// Shadowmend design system — SparkDialogue (Draft 49).
// Ported from Claude Design project 08785bf5-7c7a-49df-b4d7-a431c47e345f,
// components/world/SparkDialogue.jsx, near verbatim.

export default function SparkDialogue({ children, speaker = 'Spark', avatar, text, actions, style, ...rest }) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--surface-sheet)',
        backdropFilter: 'var(--blur-sheet)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-2xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-lg)',
        animation: 'sm-rise var(--dur-calm) var(--ease-settle) both',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
        {avatar && (
          <span
            style={{
              position: 'relative',
              flex: '0 0 auto',
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-pill)',
              overflow: 'hidden',
              border: '1px solid var(--border-warm)',
              boxShadow: 'var(--glow-md)',
              animation: 'sm-breathe var(--dur-breathe) var(--ease-drift) infinite',
            }}
          >
            <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 42%' }} />
          </span>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: 0 }}>
          {speaker && (
            <span
              style={{
                fontSize: 'var(--text-label)',
                letterSpacing: 'var(--tracking-caps)',
                textTransform: 'uppercase',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--text-warm)',
              }}
            >
              {speaker}
            </span>
          )}
          <p style={{ fontSize: 'var(--text-lead)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-bright)', maxWidth: 'var(--measure-body)' }}>
            {text || children}
          </p>
        </div>
      </div>
      {actions && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--stack)', marginTop: 'var(--space-5)' }}>{actions}</div>}
    </div>
  )
}
