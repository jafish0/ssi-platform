// Resilient Roots demo hub at /resilient-demo (Resilient Roots Draft 1):
// the internal review surface for the third SSI (PI Holly Huber Gifford).
// Same structure as /gains-demo, top to bottom:
//   Proposals — comment before we make them official: four numbered cards
//     (design system first), each with its own comment thread
//   → a round-closing divider
//   → Program Map (one row per section)
//   → Prototypes and In Development (empty for now)
// Unlisted; shared by link. Feedback is tagged program="resilient-roots"
// plus a section (resilientFeedbackSections.js).
//
// Styled with Holly's design system under the `.resilient-theme` scope
// (src/styles/resilient-theme.css, imported by DemoPageShell): cream page,
// sage header band, white cards with the soft sage-tinted shadow, teal
// buttons, Figtree. Nothing outside this route sees those tokens.

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'
import FeedbackButton from '../components/FeedbackButton.jsx'
import { SageBand } from '../components/resilient/DemoPageShell.jsx'
import Button from '../components/resilient/ds/Button.jsx'
import Card from '../components/resilient/ds/Card.jsx'
import Badge from '../components/resilient/ds/Badge.jsx'
import IconDisc from '../components/resilient/ds/IconDisc.jsx'
import { RESILIENT_FEEDBACK_SECTIONS } from './resilientFeedbackSections.js'
import { REVIEW_CARDS, PROGRAM_MAP, PROGRAM_GOALS } from './resilientReviewCards.js'
import '../styles/resilient-theme.css'

export default function ResilientDemoPage() {
  useEffect(() => {
    const prev = document.title
    document.title = 'Resilient Roots · Team Demo'
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <DemoPageLayout
      banner={false}
      rootClassName="resilient-theme"
      hero={
        <SageBand eyebrow="Team demo · For review" title="Resilient Roots" width={860}>
          <p
            style={{
              fontSize: 'var(--fs-body-lg)',
              lineHeight: 'var(--lh-body)',
              maxWidth: 'var(--measure)',
              margin: 'var(--space-3) 0 0',
            }}
          >
            A single-session program for expecting parents who have experienced trauma. Leave a comment on any card;
            every box goes to its own thread.
          </p>
        </SageBand>
      }
      homeTo="/resilient-demo"
      homeLabel="Resilient Roots · Demo"
      footerPath="/resilient-demo"
      feedbackProgram="resilient-roots"
      feedbackSections={RESILIENT_FEEDBACK_SECTIONS}
      feedbackDefaultSection="general"
    >
      <div className="max-w-[860px] mx-auto" style={{ paddingTop: 'var(--space-4)' }}>
        <section style={{ marginBottom: 'var(--space-12)' }}>
          <SectionTitle eyebrow="This round">Proposals — comment before we make them official</SectionTitle>
          <div className="space-y-4">
            {REVIEW_CARDS.map(({ key, ...c }) => (
              <ReviewCard key={key} {...c} />
            ))}
          </div>
        </section>

        <RoundDivider />

        <section style={{ marginBottom: 'var(--space-12)' }}>
          <SectionTitle eyebrow="Canon · updated as we go">Program Map</SectionTitle>
          <ProgramMap />
        </section>

        <section style={{ marginBottom: 'var(--space-8)' }}>
          <SectionTitle eyebrow="Built pieces">Prototypes and In Development</SectionTitle>
          <Card tone="mint" padding="md">
            <p style={{ margin: 0 }}>Nothing here yet.</p>
          </Card>
        </section>
      </div>
    </DemoPageLayout>
  )
}

function SectionTitle({ eyebrow, children }) {
  return (
    <header style={{ marginBottom: 'var(--space-5)' }}>
      <div
        style={{
          fontSize: 'var(--fs-eyebrow)',
          letterSpacing: 'var(--ls-eyebrow)',
          textTransform: 'uppercase',
          fontWeight: 'var(--fw-bold)',
          color: 'var(--accent)',
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontSize: 'var(--fs-h2)',
          fontWeight: 'var(--fw-bold)',
          lineHeight: 'var(--lh-heading)',
          color: 'var(--text-heading)',
          margin: 'var(--space-1) 0 0',
        }}
      >
        {children}
      </h2>
    </header>
  )
}

function ReviewCard({ n, title, section, blurb, links, list, table }) {
  return (
    <Card as="article" padding="md">
      <div className="flex items-start gap-4">
        <IconDisc size={40} tone={n === 1 ? 'teal' : 'mint'}>
          {n}
        </IconDisc>
        <div className="min-w-0 flex-1">
          <h3
            style={{
              fontSize: 'var(--fs-h3)',
              fontWeight: 'var(--fw-bold)',
              lineHeight: 'var(--lh-heading)',
              color: 'var(--text-heading)',
              margin: '6px 0 var(--space-2)',
            }}
          >
            {title}
          </h3>
          <p style={{ margin: 0, lineHeight: 'var(--lh-body)', maxWidth: 'var(--measure)' }}>{blurb}</p>

          {list && (
            <ol
              className="sm:columns-2 gap-x-8"
              style={{ margin: 'var(--space-4) 0 0', paddingLeft: '1.6em', fontSize: 'var(--fs-body-sm)', listStyle: 'decimal' }}
            >
              {list.map((item) => (
                <li key={item} style={{ padding: '2px 0', breakInside: 'avoid' }}>
                  {item}
                </li>
              ))}
            </ol>
          )}

          {table && <MeasuresTable rows={table} />}

          {links.length > 0 && (
            <div className="flex flex-wrap gap-2" style={{ marginTop: 'var(--space-5)' }}>
              {links.map((l) => (
                <Button key={l.to} as={Link} to={l.to} iconEnd={ArrowRight}>
                  {l.label}
                </Button>
              ))}
            </div>
          )}

          <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
            <FeedbackButton
              program="resilient-roots"
              sections={RESILIENT_FEEDBACK_SECTIONS}
              defaultSection={section}
              label="Comment on this"
              subtle
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

function MeasuresTable({ rows }) {
  const mark = (on) =>
    on ? (
      <Check size={16} strokeWidth={2.25} aria-label="Yes" style={{ color: 'var(--accent)', display: 'inline' }} />
    ) : (
      <span aria-label="No" style={{ color: 'var(--ink-300)' }}>
        ·
      </span>
    )
  const th = {
    textAlign: 'center',
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--fs-caption)',
    fontWeight: 'var(--fw-bold)',
    color: 'var(--text-heading)',
    whiteSpace: 'nowrap',
  }
  return (
    <div style={{ marginTop: 'var(--space-4)' }}>
      <div className="overflow-x-auto" style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-body-sm)' }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left' }}>Measure</th>
              <th style={th}>Pre</th>
              <th style={th}>Immediate post</th>
              <th style={th}>6-week follow-up</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, pre, post, fu]) => (
              <tr key={name} style={{ borderTop: '1px solid var(--sage-200)' }}>
                <td style={{ padding: 'var(--space-2) var(--space-3)' }}>{name}</td>
                <td style={{ textAlign: 'center' }}>{mark(pre)}</td>
                <td style={{ textAlign: 'center' }}>{mark(post)}</td>
                <td style={{ textAlign: 'center' }}>{mark(fu)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 'var(--space-2)' }}>
        <Badge tone="caution">Not yet locked</Badge>
      </div>
    </div>
  )
}

function RoundDivider() {
  return (
    <div
      className="flex items-center gap-4"
      role="separator"
      aria-label="End of this round's review items"
      style={{ marginBottom: 'var(--space-12)' }}
    >
      <div className="flex-1 h-px" style={{ background: 'var(--border-brand)' }} />
      <Card tone="mint" padding="md" style={{ textAlign: 'center', maxWidth: 520 }}>
        <p style={{ margin: 0, fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)' }}>
          That is all for review this round.
        </p>
        <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-body)' }}>
          As items above are approved, they move down to the Program Map to become canon.
        </p>
      </Card>
      <div className="flex-1 h-px" style={{ background: 'var(--border-brand)' }} />
    </div>
  )
}

// Table on wide screens; the same rows as stacked cards on phones, since a
// four-column grid of long activity text is unreadable at 375px.
function ProgramMap() {
  const cell = { padding: 'var(--space-3) var(--space-4)', verticalAlign: 'top', lineHeight: 'var(--lh-body)' }
  const head = {
    ...cell,
    textAlign: 'left',
    fontSize: 'var(--fs-eyebrow)',
    letterSpacing: 'var(--ls-eyebrow)',
    textTransform: 'uppercase',
    fontWeight: 'var(--fw-bold)',
    color: 'var(--text-on-band)',
    background: 'var(--surface-band)',
  }
  const goalBadge = (g) => <Badge tone={g === 'TBD' ? 'neutral' : 'brand'}>{g}</Badge>

  return (
    <>
      <Card padding="none" className="hidden md:block" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-body-sm)' }}>
          <thead>
            <tr>
              <th style={head}>Section</th>
              <th style={head}>Video</th>
              <th style={head}>Activity</th>
              <th style={head}>Action-plan output</th>
              <th style={head}>Clinical goal</th>
            </tr>
          </thead>
          <tbody>
            {PROGRAM_MAP.map((r, i) => (
              <tr key={r.section} style={{ borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
                <td style={{ ...cell, fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)', minWidth: 150 }}>{r.section}</td>
                <td style={{ ...cell, color: 'var(--text-muted)', minWidth: 110 }}>{r.video}</td>
                <td style={cell}>{r.activity}</td>
                <td style={cell}>{r.plan}</td>
                <td style={{ ...cell, whiteSpace: 'nowrap' }}>{goalBadge(r.goal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="md:hidden space-y-3">
        {PROGRAM_MAP.map((r) => (
          <Card key={r.section} padding="sm">
            <div className="flex items-start justify-between gap-3">
              <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)' }}>{r.section}</div>
              {goalBadge(r.goal)}
            </div>
            <dl style={{ margin: 'var(--space-2) 0 0', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-body)' }}>
              <MapRow label="Video">{r.video}</MapRow>
              <MapRow label="Activity">{r.activity}</MapRow>
              <MapRow label="Action plan">{r.plan}</MapRow>
            </dl>
          </Card>
        ))}
      </div>

      <Card tone="mint" padding="md" style={{ marginTop: 'var(--space-4)' }}>
        <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)', marginBottom: 'var(--space-2)' }}>
          Program goals (from the script)
        </div>
        <ol style={{ margin: 0, paddingLeft: '1.4em', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-body)', listStyle: 'decimal' }}>
          {PROGRAM_GOALS.map((g) => (
            <li key={g.n}>{g.text}</li>
          ))}
        </ol>
        <p style={{ margin: 'var(--space-3) 0 0', fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>
          Goals 1 and 2 are the psychoeducation goals; 3 and 4 are the CBT goals. No videos are recorded yet.
        </p>
      </Card>
    </>
  )
}

function MapRow({ label, children }) {
  return (
    <div style={{ marginTop: 'var(--space-1)' }}>
      <dt style={{ display: 'inline', fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)' }}>{label}: </dt>
      <dd style={{ display: 'inline', margin: 0 }}>{children}</dd>
    </div>
  )
}
