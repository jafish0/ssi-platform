// Public temporary demo page at /demo. Combines:
//   1. The 6 Ready for Roots activity cards (clickable, launch into /demo/sandbox/:id)
//   2. The data-export demo with the "How exports work" explainer always
//      expanded and four export buttons.
//
// Intended for sharing with the team or external reviewers without
// requiring admin sign-in. Easy to delete later:
//   - This file + DemoSandboxPage.jsx + DemoPageLayout.jsx
//   - The /demo and /demo/sandbox/:id routes in App.jsx
//   - The get-rsd-snapshot edge function

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Download, AlertCircle } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'
import FeedbackButton from '../components/FeedbackButton.jsx'
import { TEST_REGISTRY } from '../lib/testRegistry.js'
import { rowsToCSV, downloadCSV, todayStamp } from '../lib/csv.js'
import { buildWideRows, buildCodebookRows } from '../lib/exportFlatten.js'
import { buildSpssSyntax } from '../lib/spssSyntax.js'
import { buildRsdDemoDataset } from '../lib/demoDataset.js'
import TreeProgress from '../components/TreeProgress.jsx'
import TreeProgressMontage from '../components/TreeProgressMontage.jsx'
// SessionSummary still exists in the codebase but is no longer rendered in
// the /demo preview (Draft 38 D.1) — kept for potential reuse.

// "For Review This Week" cards (Draft 60, extended by Draft 61 + 63). The
// top-of-page review section. Replaces Draft 57's "Video Preview" section
// (Part/Scene hierarchy) with a richer per-card structure, each with its
// own dedicated feedback affordance (FeedbackButton's `initialArea`)
// rather than everything landing in one global feedback bucket.
// Data-driven so a new week's batch is a data-only addition — append a
// card (with an optional `groupSubheading` to start a new visual group)
// and it renders below the existing ones, no JSX changes needed. A card
// sets exactly one of `youtubeId` (video embed) or `imageSrc` (still
// image) — Draft 61 added the image-card variant for the Sam Female
// composites, which have no video yet. A card can also set `knownIssue`
// (Draft 63) — a short italic note rendered below the description when a
// cut has a flagged problem but is otherwise fine to review.
//
// Kai Part 1 (the four scenes that have graduated out of weekly review)
// moved to LEARNING_SKILLS_CARDS below (2026-08-13) — they now render
// permanently in the "Learning Skills for Belonging" section instead of
// here. The Sam Female Adult/14 image cards moved down into the Sam's
// Story cast section for the same reason (both already had a home there).
//
// Draft 90 (2026-08-19): Sam's Story V5 graduated to the Sam's Story
// section as the Male Version (its own ReviewCard there now); Part 2
// Scenes 1-2 + Conclusion graduated to LEARNING_SKILLS_CARDS having
// cleared review; the Kai (Gender Neutral) — 14yo card was retired
// outright (no longer needed on the demo, per Josh). Part 2 Scene 3
// stayed here as a placeholder pending Adrienne's script rewrite.
//
// Draft 91 (2026-08-19): the rewrite landed and the redo is in — Scene
// 3 now has a real youtubeId, so it plays like every other card. Stays
// in REVIEW_CARDS for a round of team feedback (Josh's call) rather
// than graduating straight to LEARNING_SKILLS_CARDS; that's a follow-up
// draft once/if it clears review, same as Scenes 1-2 + Conclusion.
const REVIEW_CARDS = [
  {
    title: 'Ready for Roots — Intro Video',
    youtubeId: 'PQMnbd1NuJ8',
    description:
      "The program's opening video — orients participants before the pretest.",
    feedbackArea: 'Intro Video',
  },
  {
    title: "Sam's Story — Female Version",
    youtubeId: 'Ughh-3a8Urs',
    description: "The female cut of Sam's Story, up for review.",
    feedbackArea: "Sam's Story — Female Version",
  },
  {
    title: 'Learning Skills for Belonging — Part 2, Scene 3: Putting it All Together',
    youtubeId: 'PPKC4yGSiGQ',
    description:
      'Self-regulation, the too-heavy-shield metaphor, box breathing, and the shift from a fixed mindset to a growth mindset.',
    feedbackArea: 'Kai Part 2 Scene 3: Putting it All Together',
  },
  // Draft 92 (2026-08-19): the Assent screen's new optional "read this to
  // me" narration, previewed here as an audio card (ReviewCard's new
  // `audioSrc` branch — no video, no image).
  {
    title: 'Assent — "Read This to Me" Narration',
    audioSrc: '/kai-narration/assent.mp3',
    description:
      "A narration option on the assent screen, for participants who'd rather listen than read.",
    feedbackArea: 'Assent Narration',
  },
]

// Kai's four Part 1 scenes (2026-08-13) — pulled out of weekly review and
// into a permanent home in the "Learning Skills for Belonging" section,
// replacing the old CAST-driven Kai card (photo + 8 scenes of narrator
// audio) now that these scenes exist as finished video. Same `ReviewCard`
// shape/component as REVIEW_CARDS, just rendered under a different
// section heading.
const LEARNING_SKILLS_CARDS = [
  {
    title: 'Learning Skills for Belonging — Part 1, Scene 1: The Scan',
    youtubeId: 'fNSK011fNnI',
    description:
      'Kai introduces himself and the concept of the belonging scan — the way our brains constantly evaluate social situations.',
    feedbackArea: 'Kai Part 1 Scene 1: The Scan',
  },
  {
    title: "Learning Skills for Belonging — Part 1, Scene 2: The Why (It's in Your DNA)",
    youtubeId: 'u1b2FoAwZPs',
    description:
      'Why belonging is a survival requirement wired into human biology — from ancient humans around fires to modern families sharing meals.',
    feedbackArea: 'Kai Part 1 Scene 2: The Why',
  },
  {
    title: 'Learning Skills for Belonging — Part 1, Scene 3: Building a Safety Net',
    youtubeId: 'z9IMWmArols',
    description:
      'The safety-net metaphor for belonging — you need multiple places to belong. Includes the GPS metaphor for friend groups.',
    feedbackArea: 'Kai Part 1 Scene 3: Building a Safety Net',
  },
  {
    title: 'Learning Skills for Belonging — Part 1, Scene 4: The Foster Care "Extra Level"',
    youtubeId: 'hTgGTKsx2Oo',
    description:
      'The specific difficulty of building belonging while in foster or relative care — "playing the Belonging Game on Hard Mode."',
    feedbackArea: 'Kai Part 1 Scene 4: The Foster Care Extra Level',
    knownIssue:
      'Known issue: the opening line’s "foster or relative care" pronunciation is being re-recorded. A new cut will replace this one.',
  },
  // Part 2 Scenes 1-2 + Conclusion graduated out of weekly review here
  // (Draft 90, 2026-08-19) — cleared review. Scene 3 stays in
  // REVIEW_CARDS (placeholder) pending its script rewrite; it joins this
  // list once that rewrite lands and it graduates in turn.
  {
    title: 'Learning Skills for Belonging — Part 2, Scene 1: Building Skills for Belonging',
    youtubeId: 'mHiQ6lTi1R8',
    description:
      'Kai introduces the five core belonging skills — Active Listening, Conflict Resolution, Inclusive Language, Provide Support, and Express Gratitude.',
    feedbackArea: 'Kai Part 2 Scene 1: Building Skills for Belonging',
    groupSubheading: {
      title: 'Learning Skills for Belonging — Part 2',
      intro:
        'Part 2 continues the psychoeducation series — Scene 3 is being revised and will join once it’s ready.',
    },
  },
  {
    title: 'Learning Skills for Belonging — Part 2, Scene 2: The Roadblocks',
    youtubeId: 'BV4cOda5on4',
    description:
      'Two unhelpful thinking patterns that block belonging — All-or-Nothing Thinking and Holding onto the Past.',
    feedbackArea: 'Kai Part 2 Scene 2: The Roadblocks',
  },
  {
    title: 'Learning Skills for Belonging — Conclusion',
    youtubeId: 'GIxBJpD6O-E',
    description:
      "Kai's closing encouragement — your story isn't over just because the current chapter has been chaotic.",
    feedbackArea: 'Kai Conclusion',
  },
]

// One review card: optional group subheading, then media (a 9:16 YouTube
// embed for `youtubeId` cards, a still image for `imageSrc` cards — Draft
// 61 —, an inline native player for `audioSrc` cards — Draft 92, no 9:16
// frame since that shape was designed around video/image — or a "video in
// production" placeholder when a card sets NONE of the three, e.g. a cut
// pulled pending a script rewrite — Draft 90) + description + a dedicated
// feedback button pinned to this item.
function ReviewCard({ card }) {
  return (
    <>
      {card.groupSubheading && (
        <div className="mb-4 max-w-[760px] mx-auto">
          <h3 className="text-[15px] font-semibold text-ctac-navy mb-1">
            {card.groupSubheading.title}
          </h3>
          {card.groupSubheading.intro && (
            <p className="text-[13px] text-slate-500 italic">
              {card.groupSubheading.intro}
            </p>
          )}
        </div>
      )}
      <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 max-w-[760px] mx-auto">
        <h4 className="text-[18px] font-bold text-ctac-navy mb-4 text-center">
          {card.title}
        </h4>
        {card.audioSrc ? (
          <div className="max-w-[420px] mx-auto mb-4">
            <audio controls preload="none" src={card.audioSrc} className="w-full">
              Your browser does not support the audio element.
            </audio>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[360px] mb-4">
            <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
              {card.imageSrc ? (
                <img
                  src={card.imageSrc}
                  alt={card.title}
                  className="absolute inset-0 h-full w-full object-cover rounded-2xl border border-amber-200"
                />
              ) : card.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${card.youtubeId}`}
                  title={card.title}
                  className="absolute inset-0 h-full w-full rounded-2xl border border-amber-200"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div
                  role="img"
                  aria-label={`${card.title} — video in production`}
                  className="absolute inset-0 h-full w-full rounded-2xl border-2 border-dashed border-amber-300 bg-amber-100/50 flex flex-col items-center justify-center text-amber-700"
                >
                  <svg viewBox="0 0 24 24" className="w-8 h-8 mb-2 opacity-50" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-[13px] italic">In production</span>
                </div>
              )}
            </div>
          </div>
        )}
        <p className="text-[13px] text-slate-600 leading-relaxed text-center mb-4 max-w-[480px] mx-auto">
          {card.description}
        </p>
        {card.knownIssue && (
          <p className="text-[12px] text-amber-700 italic text-center mb-4 max-w-[480px] mx-auto">
            {card.knownIssue}
          </p>
        )}
        <div className="text-center">
          <FeedbackButton
            label={`Leave a note on this ${card.audioSrc ? 'audio' : 'video'}`}
            initialArea={card.feedbackArea}
          />
        </div>
      </div>
    </>
  )
}

// Per-stage encouragement copy for the "Growing your roots" preview
// (Draft 25 Part C). Activity-name pairings are illustrative for the
// preview — the production flow order may differ; Josh can tune.
const TREE_STAGE_COPY = [
  {
    context: 'Before you begin.',
    heading: "Here's your tree.",
    body: "Right now it's a seed. As you finish each activity, you'll watch it grow into something bigger.",
  },
  {
    context: 'You finished Self-Reflection.',
    heading: 'Look — roots are forming.',
    body: 'You took the first step. Notice the small roots starting below the surface.',
  },
  {
    context: 'You finished Belonging Skills Sort.',
    heading: 'Your roots are reaching further.',
    body: 'Two activities in. New roots are spreading, and your first branches are starting to grow.',
  },
  {
    context: 'You finished Getting Unstuck.',
    heading: 'Solid roots, steady ground.',
    body: 'Halfway there. Your roots are deep enough to hold you steady — whatever comes next.',
  },
  {
    context: 'You finished Allies / Safety Net.',
    heading: 'Wide and rooted!',
    body: 'Almost there. Your roots are wide, your branches are full. You can feel the difference.',
  },
  {
    context: 'You finished the program.',
    heading: 'Look what you grew!',
    body: 'Roots wide. Branches full. Even blossoms now. This is what belonging can look like.',
  },
]
const TREE_MAX_STAGE = TREE_STAGE_COPY.length - 1

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export default function DemoPage() {
  const [snapshot, setSnapshot] = useState(null)
  const [versionNumber, setVersionNumber] = useState(null)
  const [snapshotErr, setSnapshotErr] = useState(null)
  const [snapshotLoading, setSnapshotLoading] = useState(true)
  const [exporting, setExporting] = useState(null)
  // "Growing your roots" preview — local-only stage cursor (0..5).
  const [treeStage, setTreeStage] = useState(0)
  // "Final reveal preview" — montage mounts (and auto-plays) on click; it
  // owns its own closer CTA (Draft 38 D).
  const [montagePlaying, setMontagePlaying] = useState(false)

  // Set the browser-tab title for /demo so it matches the visible H1.
  // Other routes keep the app-wide default ("Ready for Roots") from
  // index.html. Restore it on unmount so navigating away doesn't leave
  // the demo title behind.
  useEffect(() => {
    const prev = document.title
    document.title = 'Ready for Roots — Activities Testing, Videos and Data Export Demo'
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setSnapshotLoading(true)
    setSnapshotErr(null)
    fetch(`${SUPABASE_URL}/functions/v1/get-rsd-snapshot`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
      .then(async (r) => {
        const data = await r.json().catch(() => null)
        if (cancelled) return
        if (!r.ok) {
          setSnapshotErr(data?.error || `Snapshot fetch failed (HTTP ${r.status})`)
          return
        }
        setSnapshot(data?.snapshot || null)
        setVersionNumber(data?.version_number ?? null)
      })
      .catch((err) => {
        if (cancelled) return
        setSnapshotErr(err.message || 'Snapshot fetch failed.')
      })
      .finally(() => {
        if (!cancelled) setSnapshotLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const demo = useMemo(() => {
    if (!snapshot) return null
    return buildRsdDemoDataset(snapshot, { versionNumber: versionNumber ?? 0 })
  }, [snapshot, versionNumber])

  function runExport(kind) {
    if (!snapshot || !demo) return
    setExporting(kind)
    try {
      const sessions = demo.sessions
      const stamp = todayStamp()
      const prefix = 'demo_ready-set-dedicate'

      // Only Wide CSV, .sps syntax, and Codebook are exposed on /demo per
      // Jessica's 2026-05-11 brief. Summary and Long-format exports
      // remain available on /admin/data-export for internal use.

      if (kind === 'wide') {
        const { headers, rows } = buildWideRows({
          snapshot,
          sessions,
          responsesByItemId: demo.responsesByItemId,
        })
        downloadCSV(`${prefix}_wide_${stamp}.csv`, rowsToCSV(headers, rows))
        return
      }

      if (kind === 'sps') {
        // The .sps file references the CSV filename, so emit a name
        // matching the Wide CSV the user is expected to download alongside.
        const csvFileName = `${prefix}_wide_${stamp}.csv`
        const savFileName = `${prefix}_wide_${stamp}.sav`
        const syntax = buildSpssSyntax({
          snapshot,
          csvFileName,
          savFileName,
          meta: {
            row_count: sessions.length,
            snapshot_version: versionNumber,
            intervention_slug: 'ready-set-dedicate',
          },
        })
        // Plain text download — no CSV escaping. Use the same UTF-8 BOM-free
        // approach since SPSS expects ASCII-clean syntax.
        const blob = new Blob([syntax], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${prefix}_wide_${stamp}.sps`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return
      }

      if (kind === 'codebook') {
        const { headers, rows } = buildCodebookRows(snapshot)
        downloadCSV(`${prefix}_codebook_${stamp}.csv`, rowsToCSV(headers, rows))
        return
      }
    } catch (err) {
      console.error(err)
      alert('Export failed: ' + (err?.message || 'unknown error'))
    } finally {
      setExporting(null)
    }
  }

  const assent = TEST_REGISTRY.filter((e) => e.category === 'Ready for Roots assent')
  const activities = TEST_REGISTRY.filter((e) => e.category === 'Ready for Roots activity')
  const tests = TEST_REGISTRY.filter((e) => e.category === 'Ready for Roots test')

  return (
    <DemoPageLayout>
      {/* Intro */}
      <section className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-800 mb-2">
          Ready for Roots — Activities Testing, Videos and Data Export Demo
        </h1>
      </section>

      {/* For Review This Week (Draft 60) — replaces Draft 57 + 59's
          "Video Preview" section. Top-of-page review surface, restructured
          each week to hold whatever new video work is ready for team
          feedback. Each video is its own card with its own dedicated
          feedback button (area pre-filled per-card) rather than one global
          feedback bucket. Data-driven via REVIEW_CARDS — a new week's
          batch is a data-only addition. */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          For Review This Week
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-5 max-w-[760px]">
          The videos below are the new cuts we&apos;d like feedback on this
          week. Each card has its own comment button — use it to share
          notes specific to that video. New cuts drop into this section as
          they&apos;re ready.
        </p>

        {REVIEW_CARDS.map((card) => (
          <ReviewCard key={card.title} card={card} />
        ))}
      </section>

      {/* Child Assent — the very first thing a participant sees, before the
          pretest. Surfaced first so reviewers hit it in program order. */}
      {assent.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600">
              Start here — Child Assent
            </h2>
            <span className="text-[12px] text-slate-500">
              The first screen of the program.
            </span>
          </div>
          <p className="text-[14px] text-slate-700 leading-relaxed mb-4 max-w-[760px]">
            <strong>Assent.</strong> Before anything else, the child reads the
            assent and chooses whether to take part. Selecting{' '}
            <strong>No</strong> ends the session on a friendly exit screen;{' '}
            <strong>Yes</strong> leads into the pretest.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {assent.map((entry) => (
              <article key={entry.id} className="bg-white rounded-2xl shadow-card p-4 flex flex-col">
                <h3 className="text-[16px] font-semibold text-slate-800 mb-2">
                  {entry.displayName}
                </h3>
                <p className="text-[13px] text-slate-600 leading-relaxed flex-1 mb-4">
                  {entry.description}
                </p>
                <Link
                  to={`/demo/sandbox/${entry.id}`}
                  className="inline-flex items-center justify-center gap-2 bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white font-semibold rounded-full px-4 py-2 min-h-[44px] text-[14px]"
                >
                  <Play size={14} strokeWidth={2} />
                  Launch test
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Activities */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600">
            Activities ({activities.length})
          </h2>
          <span className="text-[12px] text-slate-500">
            Click Launch test to try one in a sandbox.
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activities.map((entry) => (
            <article key={entry.id} className="bg-white rounded-2xl shadow-card p-4 flex flex-col">
              <h3 className="text-[16px] font-semibold text-slate-800 mb-2">
                {entry.displayName}
              </h3>
              <p className="text-[13px] text-slate-600 leading-relaxed flex-1 mb-4">
                {entry.description}
              </p>
              <Link
                to={`/demo/sandbox/${entry.id}`}
                className="inline-flex items-center justify-center gap-2 bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white font-semibold rounded-full px-4 py-2 min-h-[44px] text-[14px]"
              >
                <Play size={14} strokeWidth={2} />
                Launch test
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Tests (pre-, post-, and follow-up surveys) */}
      {tests.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600">
              Tests ({tests.length})
            </h2>
            <span className="text-[12px] text-slate-500">
              Click Launch test to try one in a sandbox.
            </span>
          </div>
          <p className="text-[14px] text-slate-700 leading-relaxed mb-4 max-w-[760px]">
            <strong>Tests.</strong> Pre-, post-, and 90-day follow-up
            surveys that bookend the program. All three render as kids
            will see them in a real session.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tests.map((entry) => (
              <article key={entry.id} className="bg-white rounded-2xl shadow-card p-4 flex flex-col">
                <h3 className="text-[16px] font-semibold text-slate-800 mb-2">
                  {entry.displayName}
                </h3>
                <p className="text-[13px] text-slate-600 leading-relaxed flex-1 mb-4">
                  {entry.description}
                </p>
                <Link
                  to={`/demo/sandbox/${entry.id}`}
                  className="inline-flex items-center justify-center gap-2 bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white font-semibold rounded-full px-4 py-2 min-h-[44px] text-[14px]"
                >
                  <Play size={14} strokeWidth={2} />
                  Launch test
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Sam's Story — the narrative video, by variant. Was a
          character-design cast preview (Holly's Script 2.0, pre-
          animation); retired that framing (Draft 90, 2026-08-19) now
          that finished narrative videos exist per variant — Male
          graduated out of weekly review here, Female/Non-binary follow
          the same path once each clears review (see REVIEW_CARDS). The
          script download + character cast cards are gone with it —
          Josh: "we no longer need the script and all those associated
          images." */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          Sam&apos;s Story
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-5 max-w-[760px]">
          The finished narrative video, by character variant. Female and
          Non-binary versions join here once they clear review above.
        </p>

        <ReviewCard
          card={{
            title: "Sam's Story — Male Version",
            youtubeId: 'eEgHiFWatA0',
            description:
              "V5 cut with Jessica's Foster Mom audio cleaned up — volume lowered to match Sam's narration level, background hum removed.",
            feedbackArea: "Sam's Story — Male Version",
          }}
        />
      </section>

      {/* Learning Skills for Belonging — the psychoeducation track that
          wraps the six activities (Adrienne's script; Kai narrates). Now
          renders the finished Part 1 videos directly (2026-08-13) — these
          graduated out of the old CAST-driven Kai card (photo + 8 scenes
          of narrator audio) and out of weekly review once the cut videos
          existed; Part 2 stays in "For Review This Week" a little longer. */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          Learning Skills for Belonging
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-5 max-w-[760px]">
          Kai&apos;s psychoeducation videos that play interleaved with the
          activities.
        </p>

        <div>
          {LEARNING_SKILLS_CARDS.map((card) => (
            <ReviewCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      {/* The Proposed Alternative Cast section (Drafts 42/44) was retired
          2026-07-10 — everything real graduated into Sam's Story or
          Learning Skills (Drafts 45/46/47), and Josh pulled the section
          once only the Sam — Female placeholder remained. When the female
          Sam build lands, it goes straight into Sam's Story. */}

      {/* Growing your roots — preview of the between-activity progress
          visual (Draft 25). Click-through, local state only; not yet
          wired into real activity completion. */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          Growing your roots
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-5 max-w-[760px]">
          Preview of the between-activity progress visual. Click through to
          see how the tree grows as a youth completes each activity.
        </p>

        <div className="bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl p-8 max-w-[520px] mx-auto">
          {/* Preamble — only before the first activity (Stage 0), to set
              up the metaphor (Draft 26 Part F, locked copy 2026-06-08). */}
          {treeStage === 0 && (
            <div className="text-center mb-5">
              <p className="text-[17px] font-bold text-slate-700 mb-2">
                Ready for Roots. Yours start here.
              </p>
              <p className="text-[15px] text-slate-700 mb-2">
                This little seed is your tree. As you finish each activity, your
                roots will reach further and your branches will fill in.
              </p>
              <p className="text-[15px] text-slate-700">Watch what grows.</p>
            </div>
          )}
          <div className="mx-auto w-full max-w-[280px]">
            <TreeProgress stage={treeStage} animated />
          </div>

          {/* Stage caption */}
          <div className="text-center mt-6">
            <p className="text-sm italic text-slate-500">
              {TREE_STAGE_COPY[treeStage].context}
            </p>
            <h3 className="text-xl font-bold text-slate-700 mt-2">
              {TREE_STAGE_COPY[treeStage].heading}
            </h3>
            <p className="text-base text-slate-700 mt-2">
              {TREE_STAGE_COPY[treeStage].body}
            </p>
          </div>

          {/* Stage indicator dots */}
          <div className="flex justify-center gap-2 mt-6">
            {TREE_STAGE_COPY.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTreeStage(i)}
                aria-label={`Go to stage ${i}`}
                aria-current={i === treeStage}
                className={
                  'w-2.5 h-2.5 rounded-full transition-colors ' +
                  (i === treeStage ? 'bg-ctac-teal-500' : 'bg-slate-200 hover:bg-slate-300')
                }
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => setTreeStage((s) => Math.max(0, s - 1))}
              disabled={treeStage === 0}
              className="bg-ctac-teal-50 hover:bg-ctac-teal-100 disabled:opacity-40 disabled:hover:bg-ctac-teal-50 border border-ctac-teal-300 rounded-full px-5 py-2 text-sm text-slate-700"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setTreeStage((s) => Math.min(TREE_MAX_STAGE, s + 1))}
              disabled={treeStage === TREE_MAX_STAGE}
              className="bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-40 disabled:hover:bg-ctac-teal-500 text-white rounded-full px-5 py-2 text-sm font-semibold"
            >
              Next
            </button>
          </div>
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => setTreeStage(0)}
              className="text-ctac-teal-700 hover:text-ctac-teal-900 underline text-sm"
            >
              Reset to start
            </button>
          </div>
        </div>
      </section>

      {/* Final reveal preview — the end-of-session experience (Draft 37,
          Part H; Draft 38 D removed the summary block). The growth-replay
          montage now ends with its own "Ready for your plan?" closer that
          leads into The Plan. Not yet wired into the live flow (Draft 21
          deferred); demo content only. */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          Final reveal preview
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-5 max-w-[760px]">
          Preview of the end-of-session experience that plays after the last
          activity. The montage replays your growth from seed to bloom, then
          leads into The Plan (the kid’s final reflective activity).
        </p>

        <div className="bg-white border border-ctac-teal-200 rounded-2xl p-6 max-w-[760px] mx-auto">
          {!montagePlaying ? (
            <div className="text-center py-8">
              <button
                type="button"
                onClick={() => setMontagePlaying(true)}
                className="inline-flex items-center gap-2 bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white rounded-full px-8 py-4 text-[16px] font-semibold transition-colors"
              >
                <Play size={18} strokeWidth={2} fill="currentColor" />
                Play the growth montage
              </button>
            </div>
          ) : (
            <TreeProgressMontage />
          )}
        </div>
        {/* The "The Plan — coming soon" placeholder card was removed
            2026-07-13 — The Plan now ships as the seventh activity (its
            card is in the Activities section; the montage's "Open your
            plan" CTA routes to it). */}
      </section>

      {/* Data export demo */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-3">
          Data export demo
        </h2>

        <div className="bg-ctac-teal-100 border border-ctac-teal-300 text-ctac-teal-900 rounded-2xl px-4 py-3 mb-4 flex items-start gap-2 text-[14px]">
          <AlertCircle size={16} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
          <div>
            The exports below run against a <strong>synthetic
            52-participant Ready for Roots dataset</strong> generated in your browser.
            Filenames are prefixed <span className="font-mono">demo_</span>
            so they can&apos;t be confused with real research data. The
            same code path produces real exports in the admin dashboard.
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <p className="text-[14px] text-slate-700 leading-relaxed mb-2">
            <strong>Download the SPSS bundle.</strong> Three files designed to
            work together.
          </p>
          <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
            Column names follow SPSS-import conventions: timepoint first,
            then scale abbreviation, then item number (e.g.{' '}
            <span className="font-mono">pre_bhs_1</span> is pretest Beck
            Hopelessness item 1).
          </p>

          {snapshotLoading && (
            <p className="text-[14px] text-slate-500 italic mb-4">
              Loading Ready for Roots intervention…
            </p>
          )}
          {snapshotErr && (
            <p className="text-[14px] text-rose-600 mb-4">{snapshotErr}</p>
          )}

          <div className="space-y-4">
            {/* File 1 — Wide CSV */}
            <ExportFileBlock
              number={1}
              title="Wide CSV — your data"
              description="One row per session, every scale item in its own column."
              buttonLabel="Download Wide CSV"
              busyLabel="Exporting…"
              isPrimary={true}
              disabled={snapshotLoading || !!snapshotErr || exporting !== null}
              busy={exporting === 'wide'}
              onClick={() => runExport('wide')}
            />

            {/* File 2 — .sps syntax + how-to */}
            <ExportFileBlock
              number={2}
              title={
                <>
                  <span className="font-mono">.sps</span> syntax — labels the data
                </>
              }
              description={
                <>
                  Runs in SPSS to apply variable labels, value labels,
                  data types, and measurement levels, producing a labeled{' '}
                  <span className="font-mono">.sav</span>. This is the same
                  pattern REDCap and KoboToolbox use as their primary SPSS
                  export.
                </>
              }
              buttonLabel={<>Download <span className="font-mono">.sps</span> syntax</>}
              busyLabel="Exporting…"
              isPrimary={true}
              disabled={snapshotLoading || !!snapshotErr || exporting !== null}
              busy={exporting === 'sps'}
              onClick={() => runExport('sps')}
            >
              <div className="bg-ctac-teal-50/60 border border-ctac-teal-100 rounded-2xl p-3 mt-3">
                <p className="text-[12px] uppercase tracking-wide text-ctac-teal-800 font-semibold mb-2">
                  How to use it in SPSS
                </p>
                <ol className="list-decimal pl-5 text-[13px] text-slate-700 leading-relaxed space-y-1.5">
                  <li>
                    Save the <span className="font-mono">.sps</span> file in
                    the same folder as your Wide CSV.
                  </li>
                  <li>
                    Open the <span className="font-mono">.sps</span> file in
                    SPSS (<span className="italic">File → Open → Syntax</span>).
                  </li>
                  <li>
                    <span className="italic">Run → All</span>. SPSS will
                    import the CSV, apply all the labels and types, and save
                    a labeled <span className="font-mono">.sav</span> file in
                    the same folder.
                  </li>
                </ol>
                <p className="text-[12px] text-slate-500 italic mt-3">
                  If SPSS can&apos;t find the CSV, set the working directory
                  to that folder (<span className="italic">File → Change directory</span>),
                  or edit the <span className="font-mono">/FILE=</span> path
                  near the top of the syntax to the full path of your CSV.
                </p>
              </div>
            </ExportFileBlock>

            {/* File 3 — Codebook */}
            <ExportFileBlock
              number={3}
              title="Codebook CSV — what each column means"
              description="A reference table mapping each short column name to the full prompt text, allowed values, and reverse-scored flag. Useful for analysts who want to verify a column's meaning without running the syntax."
              buttonLabel="Download Codebook CSV"
              busyLabel="Exporting…"
              isPrimary={false}
              disabled={snapshotLoading || !!snapshotErr || exporting !== null}
              busy={exporting === 'codebook'}
              onClick={() => runExport('codebook')}
            />
          </div>
        </div>
      </section>
    </DemoPageLayout>
  )
}

// ---------- Reusable: per-file download block ----------
//
// Numbered card with a title + description on the left, a download
// button on the right, and optional children (used by the .sps block
// for the "How to use it in SPSS" instructions). Primary buttons use
// ctac-teal-500; secondary use ctac-teal-100/text-ctac-teal-800 — matches the
// project's CTA palette.

function ExportFileBlock({
  number,
  title,
  description,
  buttonLabel,
  busyLabel,
  isPrimary,
  disabled,
  busy,
  onClick,
  children,
}) {
  const buttonClass = isPrimary
    ? 'inline-flex items-center gap-2 bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-2 min-h-[44px] text-[13px]'
    : 'inline-flex items-center gap-2 bg-ctac-teal-100 hover:bg-ctac-teal-200 disabled:opacity-50 text-ctac-teal-800 font-semibold rounded-full px-4 py-2 min-h-[44px] text-[13px]'
  return (
    <div className="border border-slate-200 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <h3 className="text-[15px] font-semibold text-slate-800 mb-1 flex items-baseline gap-2">
            <span className="text-ctac-teal-700 font-bold">{number}.</span>
            <span>{title}</span>
          </h3>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={buttonClass}
        >
          <Download size={14} strokeWidth={2} />
          {busy ? busyLabel : buttonLabel}
        </button>
      </div>
      {children}
    </div>
  )
}
