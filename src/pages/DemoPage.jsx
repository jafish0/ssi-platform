// Public temporary demo page at /demo. Combines:
//   1. The 6 RSD activity cards (clickable, launch into /demo/sandbox/:id)
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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export default function DemoPage() {
  const [snapshot, setSnapshot] = useState(null)
  const [versionNumber, setVersionNumber] = useState(null)
  const [snapshotErr, setSnapshotErr] = useState(null)
  const [snapshotLoading, setSnapshotLoading] = useState(true)
  const [exporting, setExporting] = useState(null)

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

  const activities = TEST_REGISTRY.filter((e) => e.category === 'RSD activity')
  const tests = TEST_REGISTRY.filter((e) => e.category === 'RSD test')

  return (
    <DemoPageLayout>
      {/* Intro */}
      <section className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-800 mb-2">
          Ready! Set! Dedicate! — Activities Testing and Data Export Demo
        </h1>
        <p className="text-[15px] text-slate-700 leading-relaxed max-w-[720px]">
          Three things you can do here. <strong>Test the activities</strong> —
          launch any of the six RSD activities in isolation; nothing you
          enter is saved. <strong>Try the pretest</strong> — walk through
          the live participant-facing pretest as it&apos;ll paginate in a
          real session. <strong>Try the data export</strong> — download
          CSVs for SPSS / Excel built from a synthetic 52-participant
          dataset. The same export pipeline that ships your real research
          data produces these files.
        </p>
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
        <p className="text-[14px] text-slate-700 leading-relaxed mt-5 max-w-[760px]">
          An <strong>individual plan</strong> can be generated for each youth
          based on their responses across these activities — pulling forward
          their stuck-thought reframes, named allies, identified skills, and
          poem lines into a single keepsake artifact. Before I design that
          plan, though, I need to refine the activities above so the inputs
          I pull from are clinically right. Try them out and tell me what
          should change.
        </p>
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
            <strong>Tests.</strong> Pre-, post-, and follow-up surveys
            that bookend the program. Currently shown: pretest.
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

      {/* Data export demo */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-3">
          Data export demo
        </h2>

        <div className="bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl px-4 py-3 mb-4 flex items-start gap-2 text-[14px]">
          <AlertCircle size={16} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
          <div>
            The exports below run against a <strong>synthetic
            52-participant RSD dataset</strong> generated in your browser.
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
              Loading RSD intervention…
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
