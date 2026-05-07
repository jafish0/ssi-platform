import { useEffect, useMemo, useState } from 'react'
import { Download, FileText, Database, Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import AdminLayout from '../components/AdminLayout.jsx'
import { supabase } from '../lib/supabase.js'
import { rowsToCSV, downloadCSV, todayStamp } from '../lib/csv.js'
import { buildWideRows, buildCodebookRows } from '../lib/exportFlatten.js'
import { buildRsdDemoDataset } from '../lib/demoDataset.js'

const TAB_REAL = 'real'
const TAB_DEMO = 'demo'

function HowExportsWork({ defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <section className="bg-amber-50 border border-amber-200 rounded-2xl mb-5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left hover:bg-amber-100/50"
      >
        <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-amber-900">
          <Sparkles size={16} strokeWidth={1.5} />
          How exports work
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-[14px] text-slate-700 leading-relaxed space-y-3">
          <p>
            <strong>Numeric data is stored numeric.</strong> Likert responses
            are integers, VAS sliders are integers, choices are option IDs.
            There is no narrative-to-numeric recoding required to use this
            data in SPSS or Excel.
          </p>
          <div>
            <strong>Three export formats:</strong>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>
                <strong>Wide / SPSS-ready</strong> — one row per session, every
                scale item in its own column. Drops straight into SPSS.
              </li>
              <li>
                <strong>Summary</strong> — one row per session, one column per
                measure with the raw response object. Useful for inspection.
              </li>
              <li>
                <strong>Long</strong> — one row per response. Useful for audit
                / debugging.
              </li>
            </ul>
          </div>
          <p>
            <strong>Codebook</strong> ships alongside the wide CSV documenting
            every column — prompt, anchors, allowed values, reverse-scored
            flag.
          </p>
          <p>
            <strong>Reverse-scored items are flagged in the codebook but NOT
            pre-applied.</strong> Researchers do scoring in SPSS so it stays
            under their control (matches Qualtrics behavior).
          </p>
          <p>
            <strong>Open-ended fields stay open-ended.</strong> Free-text
            responses become a single text column. No automatic
            quantification — that work belongs to the analyst.
          </p>
        </div>
      )}
    </section>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function StatusBadge({ status }) {
  const map = {
    completed: 'bg-emerald-100 text-emerald-800',
    in_progress: 'bg-amber-100 text-amber-800',
    abandoned: 'bg-slate-200 text-slate-700',
  }
  return (
    <span
      className={
        'inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ' +
        (map[status] || 'bg-slate-100 text-slate-700')
      }
    >
      {status?.replace('_', ' ') || '—'}
    </span>
  )
}

export default function AdminExportsPage() {
  const [tab, setTab] = useState(TAB_REAL)

  // Shared dataset state — for the Real tab pulled from Supabase, for Demo
  // synthesized from the published RSD snapshot.
  const [interventions, setInterventions] = useState([])
  const [interventionId, setInterventionId] = useState('')
  const [statusFilter, setStatusFilter] = useState('completed')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [cohortFilter, setCohortFilter] = useState('all')
  const [exporting, setExporting] = useState(null)

  // Demo data — generated client-side, lives in state until reload.
  const [demoSessions, setDemoSessions] = useState([])
  const [demoResponsesByItemId, setDemoResponsesByItemId] = useState({})
  const [demoSnapshot, setDemoSnapshot] = useState(null)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState(null)
  const [demoCohorts, setDemoCohorts] = useState([])

  // Real cohort labels are pulled from access_codes once the user picks an
  // intervention.
  const [realCohorts, setRealCohorts] = useState([])

  // ---- Load interventions ----
  useEffect(() => {
    let cancelled = false
    supabase
      .from('interventions')
      .select('id, slug, name, current_version_id')
      .order('name')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error(error)
          return
        }
        setInterventions(data || [])
        if (!interventionId && data?.length) setInterventionId(data[0].id)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Real-tab cohorts ----
  useEffect(() => {
    if (tab !== TAB_REAL || !interventionId) return
    let cancelled = false
    supabase
      .from('access_codes')
      .select('cohort_label')
      .eq('intervention_id', interventionId)
      .then(({ data }) => {
        if (cancelled) return
        const labels = Array.from(
          new Set((data || []).map((r) => r.cohort_label).filter(Boolean)),
        ).sort()
        setRealCohorts(labels)
      })
    return () => {
      cancelled = true
    }
  }, [tab, interventionId])

  // ---- Generate demo dataset on first switch to Demo tab ----
  useEffect(() => {
    if (tab !== TAB_DEMO) return
    if (demoSessions.length > 0) return
    let cancelled = false
    setDemoLoading(true)
    setDemoError(null)
    ;(async () => {
      try {
        // Find RSD intervention
        const { data: ivs, error: ivErr } = await supabase
          .from('interventions')
          .select('id, slug, current_version_id')
          .eq('slug', 'ready-set-dedicate')
          .single()
        if (ivErr) throw ivErr
        if (!ivs?.current_version_id) throw new Error('RSD has no published version yet.')
        const { data: ver, error: vErr } = await supabase
          .from('intervention_versions')
          .select('snapshot_json, version_number')
          .eq('id', ivs.current_version_id)
          .single()
        if (vErr) throw vErr
        if (cancelled) return
        const snapshot = ver?.snapshot_json
        const built = buildRsdDemoDataset(snapshot, { versionNumber: ver.version_number })
        setDemoSnapshot(snapshot)
        setDemoSessions(built.sessions)
        setDemoResponsesByItemId(built.responsesByItemId)
        setDemoCohorts(Array.from(new Set(built.sessions.map((s) => s.cohort))))
      } catch (err) {
        console.error('demo dataset build failed', err)
        setDemoError(err.message || 'Could not build demo dataset.')
      } finally {
        if (!cancelled) setDemoLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tab, demoSessions.length])

  // ---- Filtering helpers shared by both tabs ----
  function applyFilters(sessions) {
    return sessions.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (cohortFilter !== 'all' && (s.cohort || '') !== cohortFilter) return false
      if (dateFrom && s.started_at && new Date(s.started_at) < new Date(dateFrom)) return false
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        if (s.started_at && new Date(s.started_at) > end) return false
      }
      return true
    })
  }

  // ---- Real-data fetcher (used by all four export buttons in Real tab) ----
  async function fetchReal() {
    if (!interventionId) throw new Error('Pick an intervention first.')
    const intervention = interventions.find((i) => i.id === interventionId)
    if (!intervention) throw new Error('Intervention not found.')
    if (!intervention.current_version_id) {
      throw new Error('This intervention has no published version yet.')
    }
    // Snapshot for column planning
    const { data: ver, error: vErr } = await supabase
      .from('intervention_versions')
      .select('snapshot_json, version_number')
      .eq('id', intervention.current_version_id)
      .single()
    if (vErr) throw vErr
    const snapshot = ver?.snapshot_json
    // Sessions for this intervention via access_codes join
    const { data: codes } = await supabase
      .from('access_codes')
      .select('id, code, cohort_label')
      .eq('intervention_id', interventionId)
    const codeIds = (codes || []).map((c) => c.id)
    const codeById = Object.fromEntries((codes || []).map((c) => [c.id, c]))
    if (!codeIds.length) {
      return { snapshot, sessions: [], responsesByItemId: {}, intervention, version: ver }
    }
    const { data: sessRows } = await supabase
      .from('sessions')
      .select('id, status, started_at, completed_at, last_active_at, current_section, access_code_id')
      .in('access_code_id', codeIds)
    const sessions = (sessRows || []).map((s) => {
      const code = codeById[s.access_code_id]
      return {
        id: s.id,
        access_code: code?.code || '',
        cohort: code?.cohort_label || '',
        intervention_slug: intervention.slug,
        version_number: ver?.version_number ?? '',
        status: s.status,
        started_at: s.started_at,
        completed_at: s.completed_at,
        last_active_at: s.last_active_at,
      }
    })
    // Responses chunked
    const responsesByItemId = {}
    const sessionIds = sessions.map((s) => s.id)
    const chunk = 50
    for (let i = 0; i < sessionIds.length; i += chunk) {
      const ids = sessionIds.slice(i, i + chunk)
      const { data: rRows } = await supabase
        .from('responses')
        .select('id, session_id, item_id, response_value, responded_at, items(token_key, type)')
        .in('session_id', ids)
      for (const r of rRows || []) {
        if (!responsesByItemId[r.session_id]) responsesByItemId[r.session_id] = {}
        responsesByItemId[r.session_id][r.item_id] = r.response_value
      }
    }
    return { snapshot, sessions, responsesByItemId, intervention, version: ver }
  }

  // Demo data accessor
  function getDemoBundle() {
    const intervention = interventions.find((i) => i.slug === 'ready-set-dedicate')
    return {
      snapshot: demoSnapshot,
      sessions: demoSessions,
      responsesByItemId: demoResponsesByItemId,
      intervention: intervention || { slug: 'ready-set-dedicate' },
      version: { version_number: demoSessions[0]?.version_number ?? '' },
    }
  }

  // ---- Export handlers ----

  function exportFilenamePrefix(intervention, isDemo) {
    return (isDemo ? 'demo_' : '') + (intervention?.slug || 'intervention')
  }

  async function runExport(kind) {
    setExporting(kind)
    try {
      const bundle = tab === TAB_DEMO ? getDemoBundle() : await fetchReal()
      const { snapshot, sessions, responsesByItemId, intervention } = bundle
      const filtered = applyFilters(sessions)
      const stamp = todayStamp()
      const isDemo = tab === TAB_DEMO
      const prefix = exportFilenamePrefix(intervention, isDemo)

      if (kind === 'long') {
        const rows = []
        for (const s of filtered) {
          const m = responsesByItemId[s.id] || {}
          for (const itemId of Object.keys(m)) {
            const rv = m[itemId]
            // Look up token_key + item_type from the snapshot.
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
          const m = responsesByItemId[s.id] || {}
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
          responsesByItemId,
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

  const sessionsForPreview = useMemo(() => {
    if (tab === TAB_DEMO) return applyFilters(demoSessions).slice(0, 10)
    return [] // The real tab doesn't preview rows here — Dashboard does that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, demoSessions, statusFilter, cohortFilter, dateFrom, dateTo])

  const cohortChoices = tab === TAB_DEMO ? demoCohorts : realCohorts

  return (
    <AdminLayout title="Data export">
      {/* Tab strip */}
      <div className="bg-white rounded-2xl shadow-card p-1 mb-5 inline-flex gap-1">
        <button
          type="button"
          onClick={() => setTab(TAB_REAL)}
          className={
            'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[14px] font-medium transition-colors ' +
            (tab === TAB_REAL
              ? 'bg-amber-500 text-white'
              : 'text-slate-700 hover:bg-amber-50')
          }
        >
          <Database size={16} strokeWidth={1.5} />
          Real data
        </button>
        <button
          type="button"
          onClick={() => setTab(TAB_DEMO)}
          className={
            'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-[14px] font-medium transition-colors ' +
            (tab === TAB_DEMO
              ? 'bg-amber-500 text-white'
              : 'text-slate-700 hover:bg-amber-50')
          }
        >
          <Sparkles size={16} strokeWidth={1.5} />
          Demo · 52 RSD participants
        </button>
      </div>

      {tab === TAB_DEMO && (
        <div className="bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl px-4 py-3 mb-5 flex items-start gap-2 text-[14px]">
          <AlertCircle size={16} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
          <div>
            These rows are <strong>generated for demonstration</strong>. No
            real participants are included. The CSV filenames are prefixed
            <span className="font-mono"> demo_ </span>
            so they can&apos;t be confused with real research data. The same
            export pipeline runs against this dataset as against real Supabase
            data — what you see is what you&apos;ll get.
          </div>
        </div>
      )}

      <HowExportsWork defaultOpen={tab === TAB_DEMO} />

      {/* Filter row */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-[12px] font-medium text-slate-600 mb-1">
              Intervention
            </label>
            <select
              value={tab === TAB_DEMO ? (interventions.find((i) => i.slug === 'ready-set-dedicate')?.id || '') : interventionId}
              onChange={(e) => setInterventionId(e.target.value)}
              disabled={tab === TAB_DEMO}
              className="w-full text-[14px] px-3 py-2 min-h-[40px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 disabled:opacity-60"
            >
              {interventions.map((iv) => (
                <option key={iv.id} value={iv.id}>{iv.name}</option>
              ))}
            </select>
            {tab === TAB_DEMO && (
              <div className="text-[11px] text-slate-500 mt-1">Locked to RSD for the demo dataset.</div>
            )}
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-slate-600 mb-1">Cohort</label>
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              className="w-full text-[14px] px-3 py-2 min-h-[40px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
            >
              <option value="all">All cohorts</option>
              {cohortChoices.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5">
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
      </div>

      {/* Demo preview */}
      {tab === TAB_DEMO && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200">
            <h2 className="text-[15px] font-semibold text-slate-800">
              First 10 demo sessions
              <span className="ml-2 text-[12px] font-normal text-slate-500">
                (after filters — total {applyFilters(demoSessions).length})
              </span>
            </h2>
          </div>
          {demoLoading ? (
            <div className="p-6 text-center text-slate-500 text-[13px]">Generating demo dataset…</div>
          ) : demoError ? (
            <div className="p-6 text-center text-rose-600 text-[13px]">{demoError}</div>
          ) : sessionsForPreview.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-[13px]">No demo sessions match the current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-amber-50 text-left text-[11px] uppercase tracking-wide text-amber-800">
                    <th className="px-4 py-2">Access code</th>
                    <th className="px-4 py-2">Cohort</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 whitespace-nowrap">Started</th>
                    <th className="px-4 py-2 whitespace-nowrap">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsForPreview.map((s) => (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-mono text-slate-800">{s.access_code}</td>
                      <td className="px-4 py-2 text-slate-700">{s.cohort}</td>
                      <td className="px-4 py-2"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-2 text-slate-600 whitespace-nowrap">{fmtDate(s.started_at)}</td>
                      <td className="px-4 py-2 text-slate-600 whitespace-nowrap">{fmtDate(s.completed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
