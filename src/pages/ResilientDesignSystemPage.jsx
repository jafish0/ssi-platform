// Resilient Roots design system showcase at /resilient-demo/design-system
// (Resilient Roots Draft 1, Phase C.6). The page Holly reviews the system
// on, so it IS the system: every colour, size and component below renders
// from the `.resilient-theme` tokens and the ported components in
// src/components/resilient/ds/, not screenshots.
//
// Source: `Resilient Roots/Design System Export/` (tokens/*.css for the hex
// values and sizes, readme.md for roles and type rules, components/ for the
// component code, ui_kits/participant-app/ActivityScreen.jsx for the sample
// screen). Comments on this page go to `review-design-system`, the same
// thread as its card on the hub.

import { useState } from 'react'
import {
  ArrowRight,
  Bookmark,
  ChevronLeft,
  CircleHelp,
  HeartHandshake,
  Sprout,
  Wind,
  Brain,
  Play,
} from 'lucide-react'
import DemoPageShell from '../components/resilient/DemoPageShell.jsx'
import Button from '../components/resilient/ds/Button.jsx'
import Card from '../components/resilient/ds/Card.jsx'
import Badge from '../components/resilient/ds/Badge.jsx'
import Tag from '../components/resilient/ds/Tag.jsx'
import IconDisc from '../components/resilient/ds/IconDisc.jsx'
import ProgressBar from '../components/resilient/ds/ProgressBar.jsx'
import ActivityStep from '../components/resilient/ds/ActivityStep.jsx'
import Field from '../components/resilient/ds/Field.jsx'
import Textarea from '../components/resilient/ds/Textarea.jsx'
import Toast from '../components/resilient/ds/Toast.jsx'
import { REVIEW_CARDS } from './resilientReviewCards.js'

const CARD = REVIEW_CARDS.find((c) => c.key === 'design-system')
const LOGO = '/resilient/logo.jpg'

// Hex values from tokens/colors.css; roles from the export's readme.
const DECK_COLORS = [
  { name: 'Sage', token: '--sage-500', hex: '#84B59F', role: 'Brand spine, header bands' },
  { name: 'Pale mint', token: '--sage-100', hex: '#E9F1ED', role: 'Explainer panels, sunken surfaces' },
  { name: 'Deep teal', token: '--teal-600', hex: '#50808E', role: 'Icon discs and every interactive element' },
  { name: 'Slate charcoal', token: '--ink-700', hex: '#36454F', role: 'All body copy, never pure black' },
  { name: 'White', token: '--paper-100', hex: '#FFFFFF', role: 'Cards', hairline: true },
]
const LOGO_COLORS = [
  { name: 'Forest', token: '--sage-800', hex: '#3D5B47', role: 'Deep brand grounds' },
  { name: 'Cream', token: '--paper-300', hex: '#FAF6F0', role: 'Page background, from the logo’s paper', hairline: true },
  { name: 'Gold', token: '--gold-500', hex: '#C9A567', role: 'A sparing highlight, never a surface' },
]
const STATUS_COLORS = [
  { name: 'Okay', token: '--ok', hex: '#4F7563' },
  { name: 'Caution', token: '--caution', hex: '#B98F4C' },
  { name: 'Alert', token: '--alert', hex: '#A85A4B' },
  { name: 'Info', token: '--info', hex: '#50808E' },
]
const RAMPS = [
  { name: 'Sage', steps: ['900', '800', '700', '600', '500', '400', '300', '200', '100', '50'], prefix: '--sage-' },
  { name: 'Teal', steps: ['900', '800', '700', '600', '500', '400', '300', '200', '100'], prefix: '--teal-' },
  { name: 'Ink', steps: ['900', '800', '700', '600', '500', '400', '300', '200', '100'], prefix: '--ink-' },
  { name: 'Gold', steps: ['700', '600', '500', '300', '100'], prefix: '--gold-' },
]

// The five grounding steps from storyboard slide 4, as the export's
// participant-app kit renders them (ActivityScreen.jsx).
const GROUNDING_STEPS = [
  { n: 1, t: 'Categories', b: 'Name as many movies, animals, or foods as you can' },
  { n: 2, t: 'Objects', b: 'Describe every object you can see around you' },
  { n: 3, t: 'Step by Step', b: 'Walk through something you know how to do well' },
  { n: 4, t: 'Count Backwards', b: 'Start at 100 and count down by sevens' },
  { n: 5, t: 'Names and Facts', b: 'List loved ones and one fun fact about each' },
]

export default function ResilientDesignSystemPage() {
  return (
    <DemoPageShell
      title="Design system"
      docTitle="Resilient Roots — Design system"
      blurb={CARD.blurb}
      section="review-design-system"
      route="/resilient-demo/design-system"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <LogoSection />
        <PaletteSection />
        <TypeSection />
        <ComponentsSection />
        <SampleScreenSection />
        <ConfirmCallout />
      </div>
    </DemoPageShell>
  )
}

// ---------- shared bits ----------

function SectionHead({ n, title, children }) {
  return (
    <header style={{ marginBottom: 'var(--space-6)' }}>
      <Eyebrow>{`${n} of 6`}</Eyebrow>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--fs-h2)',
          fontWeight: 'var(--fw-bold)',
          lineHeight: 'var(--lh-heading)',
          color: 'var(--text-heading)',
          margin: 'var(--space-1) 0 0',
        }}
      >
        {title}
      </h2>
      {children && (
        <p style={{ margin: 'var(--space-2) 0 0', lineHeight: 'var(--lh-body)', maxWidth: 'var(--measure)', color: 'var(--text-body)' }}>
          {children}
        </p>
      )}
    </header>
  )
}

function Eyebrow({ children, style }) {
  return (
    <div
      style={{
        fontSize: 'var(--fs-eyebrow)',
        letterSpacing: 'var(--ls-eyebrow)',
        textTransform: 'uppercase',
        fontWeight: 'var(--fw-bold)',
        color: 'var(--accent)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Caption({ children, style }) {
  return (
    <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)', lineHeight: 'var(--lh-body)', ...style }}>
      {children}
    </div>
  )
}

function GroupLabel({ children }) {
  return (
    <h3
      style={{
        fontSize: 'var(--fs-h4)',
        fontWeight: 'var(--fw-bold)',
        color: 'var(--text-heading)',
        margin: '0 0 var(--space-3)',
      }}
    >
      {children}
    </h3>
  )
}

// ---------- 1. Logo and name ----------

function LogoSection() {
  return (
    <section>
      <SectionHead n={1} title="Logo and name" />
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <img
            src={LOGO}
            alt="Resilient Roots logo: a tree of life whose canopy encircles a pregnant figure"
            width={184}
            height={184}
            style={{
              width: 184,
              height: 184,
              flex: '0 0 auto',
              borderRadius: 'var(--radius-circle)',
              boxShadow: 'var(--shadow-card)',
            }}
          />
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 6vw, 2.75rem)',
                fontWeight: 'var(--fw-bold)',
                lineHeight: 'var(--lh-tight)',
                color: 'var(--surface-band-deep)',
              }}
            >
              Resilient Roots
            </div>
            <div style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text-body)', marginTop: 'var(--space-2)' }}>
              Where safety, calm, and confidence grow
            </div>
          </div>
        </div>
      </Card>
      <Caption style={{ marginTop: 'var(--space-3)' }}>
        Shown in a circle, as the app header would use it, because the current file has its cream background built
        in; on its own it only works on cream or white. Where the mark would be too small to read, the name is set in
        Figtree 700 instead.
      </Caption>
    </section>
  )
}

// ---------- 2. Color palette ----------

function Swatch({ name, token, hex, role, hairline }) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 88,
          background: `var(${token})`,
          borderBottom: hairline ? '1px solid var(--border-subtle)' : 'none',
        }}
      />
      <div style={{ padding: 'var(--space-3) var(--space-4) var(--space-4)' }}>
        <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)' }}>{name}</div>
        {role && <div style={{ fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--lh-heading)', marginTop: 2 }}>{role}</div>}
        <div
          style={{
            fontSize: 'var(--fs-caption)',
            color: 'var(--text-muted)',
            marginTop: 'var(--space-2)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {hex}
        </div>
      </div>
    </div>
  )
}

function PaletteSection() {
  return (
    <section>
      <SectionHead n={2} title="Color palette">
        The storyboard deck uses exactly five colours and so does the app. The logo adds three more. Status colours are
        softened versions of the same family, so nothing reads as alarming.
      </SectionHead>

      <GroupLabel>From the storyboard deck</GroupLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {DECK_COLORS.map((c) => (
          <Swatch key={c.name} {...c} />
        ))}
      </div>

      <GroupLabel>From the logo</GroupLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {LOGO_COLORS.map((c) => (
          <Swatch key={c.name} {...c} />
        ))}
      </div>

      <GroupLabel>Status, kept low-alarm</GroupLabel>
      <div className="flex flex-wrap gap-4 mb-8">
        {STATUS_COLORS.map((c) => (
          <div key={c.name} className="flex items-center gap-2">
            <span
              style={{ width: 28, height: 28, borderRadius: 'var(--radius-circle)', background: `var(${c.token})`, flex: '0 0 auto' }}
            />
            <span style={{ fontSize: 'var(--fs-body-sm)' }}>
              <strong style={{ color: 'var(--text-heading)' }}>{c.name}</strong>{' '}
              <span style={{ color: 'var(--text-muted)' }}>{c.hex}</span>
            </span>
          </div>
        ))}
      </div>

      <GroupLabel>Full ramps (for lighter and darker steps)</GroupLabel>
      <div className="space-y-2">
        {RAMPS.map((r) => (
          <div key={r.name} className="flex items-center gap-3">
            <span style={{ width: 44, fontSize: 'var(--fs-caption)', color: 'var(--text-muted)', flex: '0 0 auto' }}>{r.name}</span>
            <div className="flex flex-1 overflow-hidden" style={{ borderRadius: 'var(--radius-sm)', height: 28 }}>
              {r.steps.map((s) => (
                <span key={s} title={`${r.name} ${s}`} style={{ flex: 1, background: `var(${r.prefix}${s})` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------- 3. Type ----------

function Specimen({ caption, first, children }) {
  return (
    <div style={{ padding: 'var(--space-5) 0', borderTop: first ? 'none' : '1px solid var(--border-subtle)' }}>
      {children}
      <Caption style={{ marginTop: 'var(--space-2)' }}>{caption}</Caption>
    </div>
  )
}

function TypeSection() {
  return (
    <section>
      <SectionHead n={3} title="Type">
        Figtree throughout: bold for display and headings, regular for body. Sentence case everywhere in the app. All
        caps only for slide titles and small eyebrow labels. Nothing italic, nothing light.
      </SectionHead>
      <Card padding="lg">
        <div style={{ margin: 'calc(var(--space-5) * -1) 0' }}>
          <Specimen first caption="Display · Figtree 700 · 36 to 56px, scales with the screen · line height 1.1">
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--fs-display)',
                fontWeight: 'var(--fw-bold)',
                lineHeight: 'var(--lh-tight)',
                color: 'var(--text-heading)',
              }}
            >
              Where safety, calm, and confidence grow
            </div>
          </Specimen>
          <Specimen caption="Heading 1 · Figtree 700 · 32px · line height 1.25">
            <div style={{ fontSize: 'var(--fs-h1)', fontWeight: 'var(--fw-bold)', lineHeight: 'var(--lh-heading)', color: 'var(--text-heading)' }}>
              Your action plan
            </div>
          </Specimen>
          <Specimen caption="Heading 2 · Figtree 700 · 24px">
            <div style={{ fontSize: 'var(--fs-h2)', fontWeight: 'var(--fw-bold)', lineHeight: 'var(--lh-heading)', color: 'var(--text-heading)' }}>
              What to expect after your baby arrives
            </div>
          </Specimen>
          <Specimen caption="Heading 3 · Figtree 700 · 20px">
            <div style={{ fontSize: 'var(--fs-h3)', fontWeight: 'var(--fw-bold)', lineHeight: 'var(--lh-heading)', color: 'var(--text-heading)' }}>
              Two grounding strategies
            </div>
          </Specimen>
          <Specimen caption="Body · Figtree 400 · 16px · line height 1.5 · slate charcoal, lines kept under about 62 characters">
            <p style={{ margin: 0, fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)', maxWidth: 'var(--measure)' }}>
              This program is designed to help parents like you become the strong roots of your new baby’s life.
            </p>
          </Specimen>
          <Specimen caption="Body large · Figtree 400 · 18px · for explainer panels">
            <p style={{ margin: 0, fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-body)', maxWidth: 'var(--measure)' }}>
              Try one of these when your mind races, to bring your attention back to the present moment.
            </p>
          </Specimen>
          <Specimen caption="Eyebrow label · Figtree 700 · 12px · all caps, tracked +0.14em · teal">
            <Eyebrow>Part 4 · Physical sensations</Eyebrow>
          </Specimen>
          <Specimen caption="Slide title · Figtree 700 · all caps, tracked +0.06em · 106px on the 1080 × 1920 vertical slide (shown here at one quarter size)">
            <MiniSlide />
          </Specimen>
        </div>
      </Card>
    </section>
  )
}

// A vertical 9:16 slide at 1/4 scale: sage band over the top 31.6% (607 of
// 1920px, per the export), title in white on it, mint panel below.
function MiniSlide() {
  return (
    <div
      aria-label="Example vertical slide titled GROUNDING"
      role="img"
      style={{
        width: 270,
        height: 480,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: 'var(--paper-100)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: '31.6%',
          background: 'var(--surface-band)',
          color: 'var(--text-on-band)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 26.5, fontWeight: 'var(--fw-bold)', letterSpacing: 'var(--ls-display)', textTransform: 'uppercase' }}>
          Grounding
        </span>
      </div>
      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            background: 'var(--surface-sunken)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 12,
            lineHeight: 1.4,
            color: 'var(--text-body)',
          }}
        >
          Try one of these when your mind races, to bring your attention back to the present moment.
        </div>
        {GROUNDING_STEPS.map((s) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconDisc size={28} tone="teal" style={{ fontSize: 12 }}>
              {s.n}
            </IconDisc>
            <span style={{ fontSize: 12.5, fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)' }}>{s.t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- 4. Components ----------

function ComponentBlock({ title, caption, first, children }) {
  return (
    <div style={{ padding: 'var(--space-6) 0', borderTop: first ? 'none' : '1px solid var(--border-subtle)' }}>
      <GroupLabel>{title}</GroupLabel>
      {children}
      {caption && <Caption style={{ marginTop: 'var(--space-3)' }}>{caption}</Caption>}
    </div>
  )
}

function ComponentsSection() {
  const [picked, setPicked] = useState(['Belly breathing'])
  const [progress, setProgress] = useState(35)
  const toggle = (c) => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))

  return (
    <section>
      <SectionHead n={4} title="Components">
        These are the real, working pieces, not pictures. Hover, click and tab through them.
      </SectionHead>
      <Card padding="lg">
        <div style={{ margin: 'calc(var(--space-6) * -1) 0' }}>
          <ComponentBlock
            first
            title="Buttons"
            caption="Full pills, at least 44px tall for thumbs. Teal is the main action; hover darkens one step, press scales down slightly. A dimmed button stays visible so people can see what is still left."
          >
            <div className="flex flex-wrap gap-3">
              <Button iconEnd={ArrowRight}>Continue</Button>
              <Button variant="secondary" icon={Bookmark}>
                Save for later
              </Button>
              <Button variant="brand">Add to my plan</Button>
              <Button variant="ghost">Skip for now</Button>
              <Button disabled>3 left</Button>
            </div>
          </ComponentBlock>

          <ComponentBlock
            title="Cards"
            caption="White cards get a hairline and a soft green-tinted shadow, like paper on a desk. Mint and sage cards carry no border or shadow. Hover the first one."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card interactive padding="md">
                <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)' }}>White card</div>
                <div style={{ fontSize: 'var(--fs-body-sm)', marginTop: 4 }}>The default surface for content.</div>
              </Card>
              <Card tone="mint" padding="md">
                <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)' }}>Mint panel</div>
                <div style={{ fontSize: 'var(--fs-body-sm)', marginTop: 4 }}>For explainers and short prompts.</div>
              </Card>
              <Card tone="sage" padding="md">
                <div style={{ fontWeight: 'var(--fw-bold)' }}>Sage card</div>
                <div style={{ fontSize: 'var(--fs-body-sm)', marginTop: 4 }}>A brand moment, used sparingly.</div>
              </Card>
              <Card tone="outline" padding="md">
                <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)' }}>Outline card</div>
                <div style={{ fontSize: 'var(--fs-body-sm)', marginTop: 4 }}>For optional or secondary content.</div>
              </Card>
            </div>
          </ComponentBlock>

          <ComponentBlock
            title="Badges and tags"
            caption="Badges label things. Tags are choices you can tap; this is how picking two grounding strategies for the action plan could look."
          >
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge tone="accent">Part 4 of 6</Badge>
              <Badge tone="brand">In your plan</Badge>
              <Badge tone="neutral">5 min</Badge>
              <Badge tone="ok">Saved</Badge>
              <Badge tone="caution">Optional</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Belly breathing', 'Categories', 'Objects', 'Step by step', 'Count backwards', 'Names and facts'].map((c) => (
                <Tag key={c} selected={picked.includes(c)} onSelect={() => toggle(c)}>
                  {c}
                </Tag>
              ))}
            </div>
          </ComponentBlock>

          <ComponentBlock
            title="Icon discs"
            caption="The storyboard’s signature shape: a line icon or a number in a filled circle. Icons are Lucide, 1.75 line weight."
          >
            <div className="flex flex-wrap items-center gap-4">
              <IconDisc icon={Wind} label="Breathing" tone="teal" />
              <IconDisc icon={Sprout} label="Growth" tone="sage" />
              <IconDisc icon={HeartHandshake} label="Support" tone="mint" />
              <IconDisc icon={Brain} label="Thoughts" tone="gold" />
              <IconDisc icon={Play} label="Video" tone="outline" />
              <IconDisc size={48} tone="teal">
                1
              </IconDisc>
            </div>
          </ComponentBlock>

          <ComponentBlock
            title="Progress bar"
            caption="Fills ease in calmly over about a third of a second. Nothing bounces. Motion switches off for people who have reduced motion turned on."
          >
            <div className="space-y-4">
              <ProgressBar value={progress} label="Your progress through the session" showValue />
              <ProgressBar value={Math.min(100, progress + 30)} tone="brand" size="sm" label="Action plan filled in" />
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setProgress((p) => (p >= 100 ? 0 : Math.min(100, p + 15)))}>
                  {progress >= 100 ? 'Start over' : 'Move forward'}
                </Button>
              </div>
            </div>
          </ComponentBlock>
        </div>
      </Card>
    </section>
  )
}

// ---------- 5. A sample screen ----------

// Adapted from the export's ui_kits/participant-app (AppShell +
// ActivityScreen): the grounding activity from storyboard slide 4. The
// header uses the back-button variant, not the kit's logo variant, because
// the current raster logo can't sit on the sage band. The kit's "Next:
// check-in" button (a weekly check-in this program doesn't have) reads
// "Continue" here.
function SampleScreenSection() {
  const [picked, setPicked] = useState(['Animals'])
  const [saved, setSaved] = useState(false)
  const toggle = (c) => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))

  return (
    <section>
      <SectionHead n={5} title="A sample screen" />
      <div
        className="mx-auto"
        style={{
          width: '100%',
          maxWidth: 390,
          borderRadius: 32,
          overflow: 'hidden',
          background: 'var(--surface-page)',
          boxShadow: 'var(--shadow-overlay)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            background: 'var(--surface-band)',
            color: 'var(--text-on-band)',
            padding: 'var(--space-8) var(--gutter-screen) var(--space-5)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '0 0 auto',
            }}
          >
            <ChevronLeft size={20} strokeWidth={1.75} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 'var(--fs-eyebrow)', letterSpacing: 'var(--ls-eyebrow)', textTransform: 'uppercase', fontWeight: 'var(--fw-bold)' }}>
              Practice
            </div>
            <div style={{ fontSize: 'var(--fs-h2)', fontWeight: 'var(--fw-bold)', lineHeight: 1.2 }}>Grounding</div>
          </div>
          <div style={{ flex: 1 }} />
          <CircleHelp size={22} strokeWidth={1.75} aria-hidden="true" />
        </div>

        <div style={{ padding: 'var(--space-6) var(--gutter-screen) var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Card tone="mint" padding="md">
            <p style={{ margin: 0, fontSize: 'var(--fs-body-lg)', lineHeight: 'var(--lh-body)', textWrap: 'pretty' }}>
              Try one of these when your mind races, to bring your attention back to the present moment.
            </p>
          </Card>
          <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {GROUNDING_STEPS.map((s) => (
              <ActivityStep key={s.n} number={s.n} title={s.t} body={s.b} />
            ))}
          </Card>
          <Field label="Pick your categories" hint="Choose three, or add your own.">
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {['Animals', 'Movies', 'Foods', 'Musicians', 'Countries', 'TV shows'].map((c) => (
                <Tag key={c} selected={picked.includes(c)} onSelect={() => toggle(c)}>
                  {c}
                </Tag>
              ))}
            </div>
          </Field>
          <Field label="How did that feel?" hint="Optional. Nobody else reads this unless you share it." htmlFor="rr-sample-feel">
            <Textarea id="rr-sample-feel" rows={3} placeholder="A little calmer than before…" />
          </Field>
          {saved ? (
            <Toast tone="ok" onDismiss={() => setSaved(false)}>
              Your reflection is saved.
            </Toast>
          ) : null}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => setSaved(true)}>
              Save
            </Button>
            <Button fullWidth iconEnd={ArrowRight}>
              Continue
            </Button>
          </div>
        </div>
      </div>
      <Caption style={{ marginTop: 'var(--space-4)', textAlign: 'center', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
        One example of how these pieces come together — not the final app screens, Code will build the real ones against
        actual flows.
      </Caption>
    </section>
  )
}

// ---------- 6. Three things to confirm ----------

function ConfirmCallout() {
  const items = [
    {
      title: 'Figtree standing in for Aptos Display and Calibri',
      body: 'Your deck uses Aptos Display for headings and Calibri for body text. Neither is available as a web font, so Figtree is used for both. If you have licensed web font files, send them; otherwise tell us if Figtree works for you.',
    },
    {
      title: 'Lucide icons standing in for the deck’s Office stock icons',
      body: 'The icons in the deck come from Microsoft Office’s stock set, which can’t be redistributed in an app. Lucide is an open, line-style set that looks and weighs about the same. Is that okay, or is there a set you’d prefer?',
    },
    {
      title: 'The logo needs a transparent version',
      body: 'The current logo file is a JPG with its cream background built in, so it only works on cream or white. A transparent version (SVG or PNG) is needed before it can go anywhere else, like the sage header band.',
    },
  ]
  return (
    <section aria-labelledby="rr-confirm-heading">
      <div
        style={{
          background: 'var(--highlight-soft)',
          border: '1px solid var(--gold-300)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-8) var(--space-6)',
        }}
      >
        <Eyebrow style={{ color: 'var(--gold-700)' }}>6 of 6 · Please confirm</Eyebrow>
        <h2
          id="rr-confirm-heading"
          style={{
            fontSize: 'var(--fs-h2)',
            fontWeight: 'var(--fw-bold)',
            color: 'var(--text-heading)',
            margin: 'var(--space-1) 0 var(--space-6)',
          }}
        >
          Three things to confirm
        </h2>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {items.map((it, i) => (
            <li key={it.title} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
              <IconDisc size={40} tone="gold" style={{ background: 'var(--paper-100)' }}>
                {i + 1}
              </IconDisc>
              <div>
                <div style={{ fontWeight: 'var(--fw-bold)', color: 'var(--text-heading)', fontSize: 'var(--fs-h4)' }}>{it.title}</div>
                <p style={{ margin: 'var(--space-1) 0 0', lineHeight: 'var(--lh-body)', maxWidth: 'var(--measure)' }}>{it.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p
          style={{
            margin: 'var(--space-8) 0 0',
            paddingTop: 'var(--space-5)',
            borderTop: '1px solid var(--gold-300)',
            fontWeight: 'var(--fw-bold)',
            color: 'var(--text-heading)',
          }}
        >
          Comment below on any of this, or on the three items above specifically.
        </p>
      </div>
    </section>
  )
}
