// Shell for a dedicated Resilient Roots review page (Resilient Roots Draft
// 1): /resilient-demo/<piece>. Same idea as GAINS' PlayableShell, minus the
// 9:16 game frame: DemoPageLayout under the `.resilient-theme` scope, a sage
// band carrying the back link, title and the review card's blurb, then the
// piece in the platform's standard mobile-first content width, a Restart
// (remounts the piece via a key bump, so its own state resets without a
// reset API), and a comment box. The header's Give feedback and the inline
// comment button both default to the page's own tag.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import DemoPageLayout from '../DemoPageLayout.jsx'
import FeedbackButton from '../FeedbackButton.jsx'
import { RESILIENT_FEEDBACK_SECTIONS } from '../../pages/resilientFeedbackSections.js'
import '../../styles/resilient-theme.css'

// Full-bleed sage band at the top of every Resilient Roots page. `width`
// is the page content column width (728 = DemoPageLayout narrow main minus
// its px-4) so the band text lines up with the content below it.
export function SageBand({ eyebrow, title, children, back, width = 728 }) {
  return (
    <div style={{ background: 'var(--surface-band)', color: 'var(--text-on-band)' }}>
      <div className="mx-auto px-4" style={{ maxWidth: width + 32, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        {back}
        {eyebrow && (
          <div
            style={{
              fontSize: 'var(--fs-eyebrow)',
              letterSpacing: 'var(--ls-eyebrow)',
              textTransform: 'uppercase',
              fontWeight: 'var(--fw-bold)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--fs-h1)',
            fontWeight: 'var(--fw-bold)',
            lineHeight: 'var(--lh-heading)',
            margin: 0,
          }}
        >
          {title}
        </h1>
        {children}
      </div>
    </div>
  )
}

export default function DemoPageShell({ title, docTitle, blurb, section, route, note, children }) {
  const [runKey, setRunKey] = useState(0)

  useEffect(() => {
    const prev = document.title
    document.title = docTitle || `Resilient Roots — ${title}`
    return () => {
      document.title = prev
    }
  }, [title, docTitle])

  const back = (
    <Link
      to="/resilient-demo"
      className="inline-flex items-center gap-1"
      style={{
        color: 'var(--text-on-band)',
        fontSize: 'var(--fs-body-sm)',
        fontWeight: 'var(--fw-medium)',
        textDecoration: 'none',
        marginBottom: 'var(--space-4)',
      }}
    >
      <ArrowLeft size={16} strokeWidth={1.75} />
      Back to the Resilient Roots demo
    </Link>
  )

  return (
    <DemoPageLayout
      banner={false}
      rootClassName="resilient-theme"
      hero={
        <SageBand eyebrow="Resilient Roots · For review" title={title} back={back}>
          {blurb && (
            <p
              style={{
                fontSize: 'var(--fs-body-lg)',
                lineHeight: 'var(--lh-body)',
                maxWidth: 'var(--measure)',
                margin: 'var(--space-3) 0 0',
              }}
            >
              {blurb}
            </p>
          )}
          {note}
        </SageBand>
      }
      narrow
      homeTo="/resilient-demo"
      homeLabel="Resilient Roots · Demo"
      footerPath={route}
      feedbackProgram="resilient-roots"
      feedbackSections={RESILIENT_FEEDBACK_SECTIONS}
      feedbackDefaultSection={section}
    >
      <div key={runKey}>{children}</div>

      <div
        className="flex flex-wrap items-center justify-between gap-3"
        style={{ marginTop: 'var(--space-10)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-subtle)' }}
      >
        <FeedbackButton
          program="resilient-roots"
          sections={RESILIENT_FEEDBACK_SECTIONS}
          defaultSection={section}
          label="Comment on this page"
        />
        <button
          type="button"
          onClick={() => setRunKey((k) => k + 1)}
          className="inline-flex items-center gap-1.5 rounded-full px-5 min-h-[44px]"
          style={{
            background: 'var(--surface-sunken)',
            color: 'var(--text-heading)',
            fontWeight: 'var(--fw-bold)',
            fontSize: 'var(--fs-body-sm)',
            border: 'none',
          }}
        >
          <RotateCcw size={16} strokeWidth={1.75} />
          Restart
        </button>
      </div>
      <p style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
        Review preview · nothing on this page is saved
      </p>
    </DemoPageLayout>
  )
}
