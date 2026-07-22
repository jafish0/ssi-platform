// IRB Review Preview — /irb-preview (Draft 53).
//
// A single-page, linear, professional walkthrough of the entire Ready for
// Roots participant flow, built for IRB reviewers (Jessica shares the URL).
// Unlisted: no nav link, not referenced from /demo, no sitemap entry.
//
// Differences from /demo: top-to-bottom reading order, no feedback button,
// no version badges, no admin affordances, and no data persistence — every
// embedded activity/survey is rendered with a no-op `onSave`, so nothing is
// written. (The feedback FAB and version badges live in DemoPageLayout /
// DemoSandboxPage, which this page does not use, so there is nothing extra
// to suppress here.)
//
// Palette note: the spec (written pre-Draft-37) called for amber accents,
// but the app's brand is now CTAC teal/navy and the embedded activities all
// render in teal — so the shell uses teal/navy on a light neutral base to
// stay visually consistent with what the activities actually look like.
//
// Flow order per Josh's 2026-07-23 placement update: the intervention opens
// with Sam's Story, alternates Kai psychoeducation with the six core
// activities, and closes with The Plan.

import { Suspense, useState } from 'react'
import { ChevronDown, ChevronUp, ArrowUp } from 'lucide-react'
import { CAST } from '../lib/castData.js'
import { findTestEntry } from '../lib/testRegistry.js'
import { resolveTokenPath } from '../lib/tokens.js'

const noop = () => {}
const rt = (path) => resolveTokenPath(path, {})

// --- Kai psychoeducation scenes (authoritative in-app copy + audio) ---
const KAI = CAST.find((c) => c.id === 'kai')
const KAI_SCENES = KAI?.scenes || []

// Each Kai scene names the activity it hands off to; map that to the
// sandbox registry id so we can render the real activity right after.
const HANDOFF_TO_ID = {
  'Self-Reflection': 'self-reflection',
  'Who I Am Poem': 'who-i-am-poem',
  'Allies / Safety Net': 'allies-safety-net',
  'Belonging Skills Sort': 'belonging-skills-sort',
  'Getting Unstuck': 'getting-unstuck',
  'Letter to Another Youth': 'letter-builder',
}

const SAMS_STORY_YOUTUBE_ID = 'tsnVUlklYi8'

const TOC = [
  { href: '#parent-consent', label: 'Parent Consent' },
  { href: '#child-assent', label: 'Child Assent' },
  { href: '#pretest', label: 'Welcome & Pretest' },
  { href: '#intervention', label: 'Intervention' },
  { href: '#posttest', label: 'Posttest' },
  { href: '#follow-up', label: '90-Day Follow-up' },
]

function ActivityFallback() {
  return (
    <div className="text-[14px] text-slate-500 italic text-center py-10">
      Loading…
    </div>
  )
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="mb-4">
      {eyebrow && (
        <div className="text-[12px] font-semibold uppercase tracking-wide text-ctac-teal-700 mb-1">
          {eyebrow}
        </div>
      )}
      <h2 className="text-[24px] font-bold text-ctac-navy leading-tight">{title}</h2>
    </div>
  )
}

// One embedded activity/survey, rendered inline with no persistence.
function EmbeddedActivity({ id }) {
  const entry = findTestEntry(id)
  if (!entry) return null
  const Component = entry.component
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
      <Suspense fallback={<ActivityFallback />}>
        <Component onSave={noop} sessionData={{}} resolveToken={rt} {...entry.mockProps} />
      </Suspense>
    </div>
  )
}

// Collapsed-by-default activity card used inside the Intervention section.
function CollapsibleActivity({ id, ordinal }) {
  const entry = findTestEntry(id)
  const [open, setOpen] = useState(false)
  if (!entry) return null
  return (
    <div className="border border-ctac-teal-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 bg-ctac-teal-50 hover:bg-ctac-teal-100 transition-colors"
      >
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wide text-ctac-teal-700 mb-0.5">
            Activity{ordinal ? ` ${ordinal}` : ''}
          </div>
          <div className="text-[17px] font-semibold text-ctac-navy">{entry.displayName}</div>
          <p className="text-[13px] text-slate-600 leading-relaxed mt-1 max-w-[640px]">
            {entry.description}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ctac-teal-700 whitespace-nowrap mt-1">
          {open ? (
            <>
              Collapse <ChevronUp size={16} strokeWidth={2} />
            </>
          ) : (
            <>
              Expand to try <ChevronDown size={16} strokeWidth={2} />
            </>
          )}
        </span>
      </button>
      {open && (
        <div className="p-4 sm:p-5 bg-white border-t border-ctac-teal-200">
          <Suspense fallback={<ActivityFallback />}>
            {(() => {
              const Component = entry.component
              return <Component onSave={noop} sessionData={{}} resolveToken={rt} {...entry.mockProps} />
            })()}
          </Suspense>
        </div>
      )}
    </div>
  )
}

function KaiScene({ scene, ordinal }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={KAI.image}
          alt=""
          className="w-10 h-10 rounded-full object-cover border border-ctac-teal-200"
        />
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wide text-ctac-teal-700">
            Kai · Psychoeducation{ordinal ? ` ${ordinal}` : ''}
          </div>
          <div className="text-[17px] font-semibold text-ctac-navy leading-tight">
            {scene.label}
          </div>
        </div>
        {scene.duration && (
          <span className="ml-auto text-[12px] text-slate-500">{scene.duration}</span>
        )}
      </div>
      {scene.audio && (
        <audio controls preload="none" src={scene.audio} className="w-full mb-3">
          Your browser does not support the audio element.
        </audio>
      )}
      <p className="text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap">
        {scene.text}
      </p>
    </div>
  )
}

function SamsStory() {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-ctac-teal-700 mb-1">
        Opening video
      </div>
      <h3 className="text-[18px] font-semibold text-ctac-navy mb-1">Sam&rsquo;s Story</h3>
      <p className="text-[14px] text-slate-600 leading-relaxed mb-4 max-w-[640px]">
        A short animated story that opens the intervention and sets the
        emotional context for the psychoeducation and activities that follow.
      </p>
      <div className="mx-auto w-full max-w-[360px]">
        <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
          <iframe
            src={`https://www.youtube.com/embed/${SAMS_STORY_YOUTUBE_ID}`}
            title="Sam's Story"
            className="absolute inset-0 h-full w-full rounded-2xl border border-ctac-teal-200"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

export default function IRBPreviewPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-800">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-[30px] sm:text-[34px] font-bold text-ctac-navy leading-tight mb-2">
            Ready for Roots — IRB Review Preview
          </h1>
          <p className="text-[16px] text-slate-600 leading-relaxed">
            A guided preview of the program flow for IRB reviewers. No data is
            saved from this tour.
          </p>

          {/* Table of contents */}
          <nav className="mt-6 bg-white rounded-2xl shadow-card p-5">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Contents
            </div>
            <ol className="flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
              {TOC.map((t, i) => (
                <li key={t.href}>
                  <a href={t.href} className="text-ctac-teal-700 hover:text-ctac-teal-900 font-medium">
                    {i + 1}. {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        {/* Section 1 — Parent Consent */}
        <section id="parent-consent" style={{ scrollMarginTop: '1rem' }} className="mb-12">
          <SectionHeading eyebrow="Step 1" title="Parent Consent (Qualtrics)" />
          <p className="text-[15px] leading-relaxed text-slate-700 mb-4 max-w-[680px]">
            Parents receive the consent form by email. On completion, a
            Participant ID (PID) is generated in Qualtrics and passed to
            ctac.app when the child follows the intervention link.
          </p>
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center">
            <div className="text-[13px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Coming soon
            </div>
            <p className="text-[15px] text-slate-600 leading-relaxed max-w-[520px] mx-auto">
              The parent consent lives in Qualtrics. Screenshots and a
              live-preview link will be added here when available.
            </p>
            {/* Josh: drop the consent screenshot + link here when ready.
                e.g. <img src="..." alt="Parent consent" /> and
                     <a href="...">Open the live consent form</a> */}
          </div>
        </section>

        {/* Section 2 — Child Assent */}
        <section id="child-assent" style={{ scrollMarginTop: '1rem' }} className="mb-12">
          <SectionHeading eyebrow="Step 2" title="Child Assent" />
          <p className="text-[15px] leading-relaxed text-slate-700 mb-4 max-w-[680px]">
            This is the first screen in ctac.app after the parent completes
            consent. The child reads the assent and chooses Yes or No —
            choosing &ldquo;No&rdquo; ends the session.
          </p>
          <EmbeddedActivity id="assent" />
          <div className="mt-4 text-center">
            <a
              href="#pretest"
              className="inline-flex items-center justify-center gap-2 bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white font-semibold rounded-full px-6 py-3 min-h-[44px] text-[14px]"
            >
              Continue tour →
            </a>
          </div>
        </section>

        {/* Section 3 — Welcome & Pretest */}
        <section id="pretest" style={{ scrollMarginTop: '1rem' }} className="mb-12">
          <SectionHeading eyebrow="Step 3" title="Welcome & Pretest Survey" />
          <p className="text-[15px] leading-relaxed text-slate-700 mb-4 max-w-[680px]">
            Shown immediately after the assent, the pretest collects the
            study&rsquo;s baseline measures.
          </p>
          <EmbeddedActivity id="pretest" />
        </section>

        {/* Section 4 — Intervention */}
        <section id="intervention" style={{ scrollMarginTop: '1rem' }} className="mb-12">
          <SectionHeading eyebrow="Step 4" title="Intervention" />
          <div className="bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl p-4 mb-5">
            <p className="text-[14px] leading-relaxed text-slate-700">
              The intervention opens with the animated video &ldquo;Sam&rsquo;s
              Story,&rdquo; then alternates between Kai&rsquo;s psychoeducation
              and the six core activities, and closes with a personalized
              planning activity (The Plan). Each activity is collapsed by
              default — use <span className="font-semibold">Expand to try</span> to
              open one inline.
            </p>
          </div>

          <div className="space-y-5">
            {/* Sam's Story opens the intervention */}
            <SamsStory />

            {/* Kai scenes interleaved with the activities they hand off to */}
            {KAI_SCENES.map((scene, i) => {
              const activityId = scene.handoff ? HANDOFF_TO_ID[scene.handoff] : null
              return (
                <div key={scene.label} className="space-y-5">
                  <KaiScene scene={scene} ordinal={i + 1} />
                  {activityId && <CollapsibleActivity id={activityId} />}
                </div>
              )
            })}

            {/* The Plan closes the intervention */}
            <CollapsibleActivity id="plan" />
          </div>
        </section>

        {/* Section 5 — Posttest */}
        <section id="posttest" style={{ scrollMarginTop: '1rem' }} className="mb-12">
          <SectionHeading eyebrow="Step 5" title="Posttest & Next Steps" />
          <p className="text-[15px] leading-relaxed text-slate-700 mb-4 max-w-[680px]">
            The posttest appears immediately after the intervention closes.
          </p>
          <EmbeddedActivity id="posttest" />
          <div className="mt-4 bg-white rounded-2xl shadow-card p-5">
            <h3 className="text-[16px] font-semibold text-ctac-navy mb-1">Next steps</h3>
            <p className="text-[14px] text-slate-700 leading-relaxed">
              After the posttest, the participant sees incentive information and
              a note that they will receive the 90-day follow-up survey by email.
            </p>
          </div>
        </section>

        {/* Section 6 — 90-Day Follow-up */}
        <section id="follow-up" style={{ scrollMarginTop: '1rem' }} className="mb-12">
          <SectionHeading eyebrow="Step 6" title="90-Day Follow-up" />
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
            <p className="text-[14px] leading-relaxed text-amber-900">
              In production, this survey is emailed to the participant 90 days
              after they complete the intervention. It is shown here for review
              purposes only.
            </p>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-700 mb-4 max-w-[680px]">
            The follow-up re-administers the measures that change with the
            program, plus a few follow-up-only items.
          </p>
          <EmbeddedActivity id="followup" />
        </section>

        {/* Wrap-up */}
        <footer className="mt-14 border-t border-slate-200 pt-8">
          <div className="bg-white rounded-2xl shadow-card p-6 text-center mb-6">
            <h2 className="text-[20px] font-bold text-ctac-navy mb-2">
              You&rsquo;ve completed the Ready for Roots preview.
            </h2>
            <p className="text-[15px] text-slate-700 leading-relaxed">
              Thank you for reviewing our program.
            </p>
          </div>
          <div className="text-[13px] text-slate-500 leading-relaxed text-center">
            <p>
              Platform questions: Josh Fisherkeller (
              <a href="mailto:joshua.fisherkeller@uky.edu" className="text-ctac-teal-700 hover:text-ctac-teal-900">
                joshua.fisherkeller@uky.edu
              </a>
              ). IRB questions: Jessica.
            </p>
            <p className="mt-4">
              <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="inline-flex items-center gap-1 text-ctac-teal-700 hover:text-ctac-teal-900 font-medium">
                <ArrowUp size={14} strokeWidth={2} /> Back to top
              </a>
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}
