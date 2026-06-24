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
import { TEST_REGISTRY } from '../lib/testRegistry.js'
import { rowsToCSV, downloadCSV, todayStamp } from '../lib/csv.js'
import { buildWideRows, buildCodebookRows } from '../lib/exportFlatten.js'
import { buildSpssSyntax } from '../lib/spssSyntax.js'
import { buildRsdDemoDataset } from '../lib/demoDataset.js'
import { CAST, FAMILY_PHOTO } from '../lib/castData.js'
import TreeProgress from '../components/TreeProgress.jsx'

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
    heading: 'Wide and rooted.',
    body: 'Almost there. Your roots are wide, your branches are full. You can feel the difference.',
  },
  {
    context: 'You finished the program.',
    heading: 'Look what you grew.',
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
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-4 py-2 min-h-[44px] text-[14px]"
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
                  className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-4 py-2 min-h-[44px] text-[14px]"
                >
                  <Play size={14} strokeWidth={2} />
                  Launch test
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Meet the cast — preview of Holly's video script (Script 2.0)
          before animation: character cards + per-line ElevenLabs voice
          samples + a closing Family Photo. Sits between Tests and Data
          export so the reviewer flows sandbox → surveys → cast → export. */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          Meet the cast
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-5 max-w-[760px]">
          Preview of the cast and voice samples for Holly&apos;s video script
          (Script 2.0). Tap any line to hear it read.
        </p>

        {/* Full-script download — so reviewers can read along while they
            listen. The `download` attr sets a clean saved filename. */}
        <div className="mb-6">
          <p className="text-[13px] text-slate-500 italic mb-2">
            Want the full script while you listen? Grab it here.
          </p>
          <a
            href="/cast/script/ready-for-roots-script-v2.docx"
            download="Ready for Roots — Script 2.0.docx"
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 text-sm font-semibold"
          >
            <Download size={16} strokeWidth={2} />
            Download Script 2.0 (.docx)
          </a>
        </div>

        <div className="space-y-4">
          {CAST.map((character) => (
            <CastCard key={character.id} character={character} />
          ))}
        </div>

        {/* Family Photo — borderless hero-style closer */}
        <figure className="mt-6 mx-auto w-full max-w-[820px] text-center">
          <img
            src={FAMILY_PHOTO.image}
            alt={FAMILY_PHOTO.alt}
            className="w-full h-auto rounded-2xl shadow-card"
          />
          <figcaption className="text-[13px] text-slate-500 italic mt-3">
            {FAMILY_PHOTO.caption}
          </figcaption>
        </figure>
      </section>

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

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 max-w-[520px] mx-auto">
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
                  (i === treeStage ? 'bg-amber-500' : 'bg-slate-200 hover:bg-slate-300')
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
              className="bg-amber-50 hover:bg-amber-100 disabled:opacity-40 disabled:hover:bg-amber-50 border border-amber-300 rounded-full px-5 py-2 text-sm text-slate-700"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setTreeStage((s) => Math.min(TREE_MAX_STAGE, s + 1))}
              disabled={treeStage === TREE_MAX_STAGE}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 text-white rounded-full px-5 py-2 text-sm font-semibold"
            >
              Next
            </button>
          </div>
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => setTreeStage(0)}
              className="text-amber-700 hover:text-amber-900 underline text-sm"
            >
              Reset to start
            </button>
          </div>
        </div>
      </section>

      {/* Data export demo */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-3">
          Data export demo
        </h2>

        <div className="bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl px-4 py-3 mb-4 flex items-start gap-2 text-[14px]">
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
              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3 mt-3">
                <p className="text-[12px] uppercase tracking-wide text-amber-800 font-semibold mb-2">
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
// amber-500; secondary use amber-100/text-amber-800 — matches the
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
    ? 'inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-2 min-h-[44px] text-[13px]'
    : 'inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-800 font-semibold rounded-full px-4 py-2 min-h-[44px] text-[13px]'
  return (
    <div className="border border-slate-200 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <h3 className="text-[15px] font-semibold text-slate-800 mb-1 flex items-baseline gap-2">
            <span className="text-amber-700 font-bold">{number}.</span>
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

// ---------- Reusable: cast character card ----------
//
// Image on the left (~40%) + text on the right (~60%) on desktop; stacks
// on mobile. A card's right column branches on one of these optional
// fields, in precedence order: `voiceSamples` (labeled audio-only
// voice-model previews — native <audio> per entry; Sam 16's locked
// Brayden voice), `videos` (one or more rendered Sam's Story shots —
// each an optional label + a 9:16 player [native <video> for `src`,
// YouTube iframe for `youtubeId`] + spoken-line caption), `lines`
// (per-line scene cue + quoted text; each line shows a native <audio>
// player if it has an `audio` clip, else a "Voice model coming soon"
// note), or `description` (a paragraph for cast who don't speak in
// Script 2.0 yet). See src/lib/castData.js.

function CastCard({ character }) {
  const { name, image, alt, role, lines, description, landscape, videos, voiceSamples } = character
  return (
    <article
      tabIndex={0}
      className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6"
    >
      {/* Image column */}
      <div className="w-full md:w-2/5 flex-shrink-0">
        <img
          src={image}
          alt={alt}
          className={
            'w-full rounded-xl shadow-card ' +
            // Sam 14 is landscape — crop to a gentle ~4:3 portrait so the
            // faces stay centered. Portrait images render at natural ratio.
            (landscape
              ? 'object-cover aspect-[4/3] max-h-[320px] md:max-h-none'
              : 'h-auto max-h-[280px] md:max-h-none object-cover md:object-contain')
          }
        />
      </div>

      {/* Text column */}
      <div className="w-full md:w-3/5">
        <h3 className="text-2xl font-bold text-slate-700 mb-1">{name}</h3>
        <p className="text-sm italic text-slate-500 mb-4">{role}</p>

        {/* Voice samples render as their own block ABOVE the
            videos/lines/description content (Draft 34) — a card can have
            both (Sam 14: voice sample + lines). */}
        {voiceSamples && voiceSamples.length > 0 && (
          <div className="mx-auto w-full max-w-[320px] mb-6">
            {voiceSamples.map((vs, i) => (
              <div key={i}>
                {vs.label && (
                  <p
                    className={
                      'text-sm font-semibold text-slate-700 mb-2 ' +
                      (i === 0 ? '' : 'mt-4')
                    }
                  >
                    {vs.label}
                  </p>
                )}
                <audio
                  controls
                  preload="metadata"
                  src={vs.src}
                  aria-label={`Voice sample: ${name} — ${vs.label || 'voice model'}`}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}

        {videos && videos.length > 0 ? (
          <div className="mx-auto w-full max-w-[320px]">
            {videos.map((v, i) => (
              <div key={i}>
                {v.label && (
                  <p
                    className={
                      'text-sm font-semibold text-slate-700 mb-2 ' +
                      (i === 0 ? '' : 'mt-6')
                    }
                  >
                    {v.label}
                  </p>
                )}
                <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
                  {v.src ? (
                    // Self-hosted clip — native player, no overlay chrome
                    // blocking the frame (unlike the YouTube Short embed).
                    <video
                      src={v.src}
                      title={`${name} — Sam's Story video`}
                      controls
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 h-full w-full rounded-2xl border border-amber-200 bg-black object-cover"
                    />
                  ) : (
                    <iframe
                      src={`https://www.youtube.com/embed/${v.youtubeId}`}
                      title={`${name} — Sam's Story video`}
                      className="absolute inset-0 h-full w-full rounded-2xl border border-amber-200"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )}
                </div>
                {v.caption && (
                  <p className="mt-2 text-center text-sm text-slate-600 italic">
                    {v.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : lines && lines.length > 0 ? (
          <div className="space-y-7">
            {lines.map((line, i) => (
              <div key={i}>
                <p className="text-sm italic text-slate-500 leading-tight mb-1">
                  {line.scene}
                </p>
                <p className="text-base text-slate-700 leading-relaxed mb-2">
                  &ldquo;{line.text}&rdquo;
                </p>
                {line.audio ? (
                  <audio
                    controls
                    preload="metadata"
                    src={line.audio}
                    aria-label={`Audio: ${name} — ${line.scene}`}
                    className="w-full mt-1"
                  />
                ) : voiceSamples && voiceSamples.length > 0 ? (
                  // Voice sample is shown above — suppress the stale
                  // "coming soon" note for this card's lines (Draft 34).
                  null
                ) : (
                  <p className="mt-1 text-sm italic text-slate-400">
                    Voice model coming soon
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : description ? (
          <p className="text-base text-slate-700 leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
    </article>
  )
}
