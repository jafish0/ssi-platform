// Public temporary demo page at /demo. Combines:
//   1. The 6 RSD activity cards (clickable, launch into /demo/sandbox/:id)
//   2. The data-export demo with the "How exports work" explainer always
//      expanded, the four export buttons, and basic filters.
//
// Intended for sharing with the team or external reviewers without
// requiring admin sign-in. Easy to delete:
//   - This file + DemoSandboxPage.jsx + DemoPageLayout.jsx
//   - The /demo and /demo/sandbox/:id routes in App.jsx
//   - The get-rsd-snapshot edge function

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Download, FileText, Sparkles, AlertCircle } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'
import { TEST_REGISTRY } from '../lib/testRegistry.js'
import { rowsToCSV, downloadCSV, todayStamp } from '../lib/csv.js'
import { buildWideRows, buildCodebookRows } from '../lib/exportFlatten.js'
import { buildRsdDemoDataset } from '../lib/demoDataset.js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function DemoPage() {
  // ---- snapshot + demo dataset ----
  const [snapshot, setSnapshot] = useState(null)
  const [versionNumber, setVersionNumber] = useState(null)
  const [snapshotErr, setSnapshotErr] = useState(null)
  const [snapshotLoading, setSnapshotLoading] = useState(true)

  // ---- filter state ----
  const [statusFilter, setStatusFilter] = useState('completed')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
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

  function applyFilters(sessions) {
    return sessions.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (dateFrom && s.started_at && new Date(s.started_at) < new Date(dateFrom)) return false
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        if (s.started_at && new Date(s.started_at) > end) return false
      }
      return true
    })
  }

  function runExport(kind) {
    if (!snapshot || !demo) return
    setExporting(kind)
    try {
      const filtered = applyFilters(demo.sessions)
      const stamp = todayStamp()
      const prefix = 'demo_ready-set-dedicate'

      if (kind === 'long') {
        const rows = []
        for (const s of filtered) {
          const m = demo.responsesByItemId[s.id] || {}
          for (const itemId of Object.keys(m)) {
            const rv = m[itemId]
            let token_key = ''
            let item_type = ''
            for (const sec of snapshot?.sections || []) {
              for (const it of sec.items || []) {
                if (it.id === itemId) {
                  token_key = it.token_key || ''
                  item_type = it.type
                }
              }
            }
            rows.push({
              session_id: s.id,
              access_code: s.access_code,
              session_status: s.status,
              started_at: s.started_at || '',
              completed_at: s.completed_at || '',
              item_type,
              token_key,
              response_value: typeof rv === 'string' ? rv : JSON.stringify(rv),
            })
          }
        }
        const headers = [
          'session_id', 'access_code', 'session_status', 'started_at',
          'completed_at', 'item_type', 'token_key', 'response_value',
        ]
        downloadCSV(`${prefix}_responses_${stamp}.csv`, rowsToCSV(headers, rows))
        return
      }

      if (kind === 'summary') {
        const tokenSet = new Set()
        const respByToken = {}
        for (const s of filtered) {
          const m = demo.responsesByItemId[s.id] || {}
          respByToken[s.id] = {}
          for (const itemId of Object.keys(m)) {
            const rv = m[itemId]
            for (const sec of snapshot?.sections || []) {
              for (const it of sec.items || []) {
                if (it.id === itemId && it.token_key) {
                  tokenSet.add(it.token_key)
                  respByToken[s.id][it.token_key] = typeof rv === 'string' ? rv : JSON.stringify(rv)
                }
              }
            }
          }
        }
        const tokens = Array.from(tokenSet).sort()
        const headers = ['session_id', 'access_code', 'cohort', 'status', 'started_at', 'completed_at', ...tokens]
        const rows = filtered.map((s) => {
          const row = {
            session_id: s.id,
            access_code: s.access_code,
            cohort: s.cohort,
            status: s.status,
            started_at: s.started_at || '',
            completed_at: s.completed_at || '',
          }
          for (const t of tokens) row[t] = respByToken[s.id]?.[t] || ''
          return row
        })
        downloadCSV(`${prefix}_summary_${stamp}.csv`, rowsToCSV(headers, rows))
        return
      }

      if (kind === 'wide') {
        const { headers, rows } = buildWideRows({
          snapshot,
          sessions: filtered,
          responsesByItemId: demo.responsesByItemId,
        })
        downloadCSV(`${prefix}_wide_${stamp}.csv`, rowsToCSV(headers, rows))
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
  const filteredCount = demo ? applyFilters(demo.sessions).length : 0

  return (
    <DemoPageLayout>
      {/* Intro */}
      <section className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-800 mb-2">
          Try the SSI Platform — Ready! Set! Dedicate!
        </h1>
        <p className="text-[15px] text-slate-700 leading-relaxed max-w-[720px]">
          Two things you can do here. <strong>Test the activities</strong> —
          launch any of the six RSD activities in isolation; nothing you
          enter is saved. <strong>Try the data export</strong> — generate
          CSVs for SPSS / Excel against a synthetic 52-participant dataset.
          The same export pipeline that ships your real research data
          produces these files.
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
              <h3 className="text-[16px] font-semibold text-slate-800 mb-1">
                {entry.displayName}
              </h3>
              <div className="text-[12px] font-mono text-slate-400 mb-2">{entry.id}</div>
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

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4 text-[14px] text-slate-700 leading-relaxed">
          <div className="flex items-center gap-2 mb-2 text-amber-900 font-semibold">
            <Sparkles size={16} strokeWidth={1.5} />
            How exports work
          </div>
          <p className="mb-2">
            <strong>Numeric data is stored numeric.</strong> Likert
            responses are integers, VAS sliders are integers, choices are
            option IDs. There is no narrative-to-numeric recoding required
            to use this data in SPSS or Excel.
          </p>
          <div className="mb-2">
            <strong>Three export formats:</strong>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>
                <strong>Wide / SPSS-ready</strong> — one row per session,
                every scale item in its own column. Drops straight into
                SPSS.
              </li>
              <li>
                <strong>Summary</strong> — one row per session, one column
                per measure with the raw response object. Useful for
                inspection.
              </li>
              <li>
                <strong>Long</strong> — one row per response. Useful for
                audit / debugging.
              </li>
            </ul>
          </div>
          <p className="mb-2">
            <strong>Codebook</strong> ships alongside the wide CSV
            documenting every column — prompt, anchors, allowed values,
            reverse-scored flag.
          </p>
          <p className="mb-2">
            <strong>Reverse-scored items are flagged in the codebook but
            NOT pre-applied.</strong> Researchers do scoring in SPSS so it
            stays under their control (matches Qualtrics behavior).
          </p>
          <p>
            <strong>Open-ended fields stay open-ended.</strong> Free-text
            responses become a single text column. No automatic
            quantification — that work belongs to the analyst.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          {snapshotLoading ? (
            <p className="text-[14px] text-slate-500 italic">Loading RSD intervention…</p>
          ) : snapshotErr ? (
            <p className="text-[14px] text-rose-600">{snapshotErr}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-[12px] font-medium text-slate-600 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full text-[14px] px-3 py-2 min-h-[40px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">All statuses</option>
                    <option value="completed">Completed only</option>
                    <option value="in_progress">In progress</option>
                    <option value="abandoned">Abandoned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-600 mb-1">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full text-[14px] px-3 py-2 min-h-[40px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-slate-600 mb-1">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full text-[14px] px-3 py-2 min-h-[40px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="text-[12px] text-slate-500 mb-3">
                {filteredCount} of {demo?.sessions?.length || 0} synthetic sessions match the
                current filters.
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => runExport('long')}
                  disabled={exporting !== null}
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold rounded-full px-4 py-2 min-h-[44px] text-[13px]"
                >
                  <FileText size={14} strokeWidth={1.5} />
                  Long format
                </button>
                <button
                  type="button"
                  onClick={() => runExport('summary')}
                  disabled={exporting !== null}
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold rounded-full px-4 py-2 min-h-[44px] text-[13px]"
                >
                  <FileText size={14} strokeWidth={1.5} />
                  Summary
                </button>
                <button
                  type="button"
                  onClick={() => runExport('wide')}
                  disabled={exporting !== null}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-2 min-h-[44px] text-[13px]"
                >
                  <Download size={14} strokeWidth={2} />
                  {exporting === 'wide' ? 'Exporting…' : 'Wide / SPSS-ready'}
                </button>
                <button
                  type="button"
                  onClick={() => runExport('codebook')}
                  disabled={exporting !== null}
                  className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-800 font-semibold rounded-full px-4 py-2 min-h-[44px] text-[13px]"
                >
                  <Download size={14} strokeWidth={2} />
                  Codebook
                </button>
              </div>

              {/* Quick preview of the demo dataset */}
              {demo?.sessions?.length > 0 && (
                <details className="mt-5">
                  <summary className="cursor-pointer text-[13px] text-amber-700 hover:text-amber-900">
                    Preview first 10 demo sessions
                  </summary>
                  <div className="overflow-x-auto mt-2 border border-slate-200 rounded-2xl">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="bg-amber-50 text-left text-[11px] uppercase tracking-wide text-amber-800">
                          <th className="px-3 py-2">Access code</th>
                          <th className="px-3 py-2">Cohort</th>
                          <th className="px-3 py-2 whitespace-nowrap">Started</th>
                          <th className="px-3 py-2 whitespace-nowrap">Completed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applyFilters(demo.sessions).slice(0, 10).map((s) => (
                          <tr key={s.id} className="border-t border-slate-100">
                            <td className="px-3 py-1.5 font-mono text-slate-800">{s.access_code}</td>
                            <td className="px-3 py-1.5 text-slate-700">{s.cohort}</td>
                            <td className="px-3 py-1.5 text-slate-600 whitespace-nowrap">{fmtDate(s.started_at)}</td>
                            <td className="px-3 py-1.5 text-slate-600 whitespace-nowrap">{fmtDate(s.completed_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      </section>
    </DemoPageLayout>
  )
}
