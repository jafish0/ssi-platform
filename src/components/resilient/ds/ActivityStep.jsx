// Resilient Roots design system — ActivityStep (Resilient Roots Draft 1).
// Ported from the Claude Design export, components/learning/ActivityStep.jsx:
// the storyboard's numbered-step row (numeral disc + title + one line).

import IconDisc from './IconDisc.jsx'

export default function ActivityStep({ number, title, body, tone = 'teal', style }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', ...style }}>
      <IconDisc size={44} tone={tone}>
        {number}
      </IconDisc>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 4 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--fs-h4)',
            fontWeight: 'var(--fw-bold)',
            color: 'var(--text-heading)',
            lineHeight: 'var(--lh-heading)',
          }}
        >
          {title}
        </span>
        {body ? (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--fs-body-sm)',
              lineHeight: 'var(--lh-body)',
              color: 'var(--text-muted)',
              textWrap: 'pretty',
            }}
          >
            {body}
          </span>
        ) : null}
      </div>
    </div>
  )
}
