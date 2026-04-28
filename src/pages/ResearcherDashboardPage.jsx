import { Fragment, useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import AdminLayout from '../components/AdminLayout.jsx'
import { supabase } from '../lib/supabase.js'
import { rowsToCSV, downloadCSV, todayStamp } from '../lib/csv.js'

function StatusBadge({ status }) {
  const map = {
    completed: 'bg-emerald-100 text-emerald-800',
    in_progress: 'bg-amber-100 text-amber-800',
    abandoned: 'bg-slate-200 text-slate-700',
  }
  return (
    <span
      className={
        'inline-block rounded-full px-2.5 py-1 text-[12px] font-medium capitalize ' +
        (map[status] || 'bg-slate-100 text-slate-700')
      }
    >
      {status?.replace('_', ' ') || '—'}
    </span>
  )
}

function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="text-[13px] text-slate-500 font-medium mb-1">{label}</div>
      <div className="text-[28px] font-bold text-slate-800 leading-tight">{value}</div>
      {hint && <div className="text-[12px] text-slate-500 mt-1">{hint}</div>}
    </div>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return (
    d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }) +
    ' ' +
    d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })
  )
}

export default function ResearcherDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [interventions, setInterventions] = useState([])
  const [sessions, setSessions] = useState([])
  const [reload, setReload] = useState(0)

  // Filters
  const [interventionFilter, setInterventionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Sorting
  const [sortKey, setSortKey] = useState('started_at')
  const [sortDir, setSortDir] = useState('desc')

  // Expand row
  const [expandedId, setExpandedId] = useState(null)
  const [expandedResponses, setExpandedResponses] = useState({})

  // Export state
  const [exporting, setExporting] = useState(null)
  const [exportInterventionId, setExportInterventionId] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      supabase
        .from('interventions')
        .select('id, name, slug, is_active, current_version_id'),
      supabase
        .from('sessions')
        .select(
          'id, status, started_at, completed_at, last_active_at, current_section, access_code_id, version_id, access_codes(code, intervention_id), intervention_versions(intervention_id)',
        )
        .order('started_at', { ascending: false })
        .limit(500),
    ])
      .then(([ivRes, sessRes]) => {
        if (cancelled) return
        if (ivRes.error) throw ivRes.error
        if (sessRes.error) throw sessRes.error
        setInterventions(ivRes.data || [])
        setSessions(sessRes.data || [])
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Dashboard load failed', err)
        setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reload])

  // Stats
  const stats = useMemo(() => {
    const total = sessions.length
    const completed = sessions.filter((s) => s.status === 'completed').length
    const inProgress = sessions.filter((s) => s.status === 'in_progress').length
    const abandoned = sessions.filter((s) => s.status === 'abandoned').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, inProgress, abandoned, completionRate }
  }, [sessions])

  const interventionMap = useMemo(() => {
    const m = {}
    for (const iv of interventions) m[iv.id] = iv
    return m
  }, [interventions])

  // Filter + sort sessions for the table
  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (interventionFilter !== 'all') {
        const ivId =
          s.intervention_versions?.intervention_id ||
          s.access_codes?.intervention_id
        if (ivId !== interventionFilter) return false
      }
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (dateFrom) {
        if (new Date(s.started_at) < new Date(dateFrom)) return false
      }
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        if (new Date(s.started_at) > end) return false
      }
      return true
    })
  }, [sessions, interventionFilter, statusFilter, dateFrom, dateTo])

  const sorted = useMemo(() => {
    const arr = filtered.slice().sort((a, b) => {
      const get = (row) => {
        if (sortKey === 'access_code') return row.access_codes?.code || ''
        if (sortKey === 'intervention')
          return interventionMap[
            row.intervention_versions?.intervention_id ||
              row.access_codes?.intervention_id
          ]?.name || ''
        return row[sortKey] || ''
      }
      const av = get(a)
      const bv = get(b)
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr.slice(0, 50)
  }, [filtered, sortKey, sortDir, interventionMap])

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  async function expandRow(sessionId) {
    if (expandedId === sessionId) {
      setExpandedId(null)
      return
    }
    setExpandedId(sessionId)
    if (expandedResponses[sessionId]) return
    const { data, error: rErr } = await supabase
      .from('responses')
      .select('id, item_id, response_value, items(token_key, type)')
      .eq('session_id', sessionId)
    if (rErr) {
      console.error('Failed to load responses', rErr)
      return
    }
    setExpandedResponses((prev) => ({ ...prev, [sessionId]: data || [] }))
  }

  async function exportLong(intvId) {
    setExporting('long')
    try {
      const intervention = interventions.find((i) => i.id === intvId)
      if (!intervention) throw new Error('Intervention not found')

      // Get all sessions for this intervention via their access codes
      const { data: codes, error: cErr } = await supabase
        .from('access_codes')
        .select('id, code')
        .eq('intervention_id', intvId)
      if (cErr) throw cErr
      const codeIds = (codes || []).map((c) => c.id)
      const codeById = Object.fromEntries((codes || []).map((c) => [c.id, c]))

      if (codeIds.length === 0) {
        downloadCSV(
          `${intervention.slug}_responses_${todayStamp()}.csv`,
          rowsToCSV(['note'], [{ note: 'No sessions yet for this intervention.' }]),
        )
        return
      }

      const { data: sessRows, error: sErr } = await supabase
        .from('sessions')
        .select('id, status, started_at, completed_at, access_code_id')
        .in('access_code_id', codeIds)
      if (sErr) throw sErr

      const sessionIds = sessRows.map((s) => s.id)
      if (sessionIds.length === 0) {
        downloadCSV(
          `${intervention.slug}_responses_${todayStamp()}.csv`,
          rowsToCSV(['note'], [{ note: 'No sessions yet for this intervention.' }]),
        )
        return
      }

      // Fetch in chunks if needed (Supabase default page is 1000)
      const allResponses = []
      const chunkSize = 50
      for (let i = 0; i < sessionIds.length; i += chunkSize) {
        const chunk = sessionIds.slice(i, i + chunkSize)
        const { data: rRows, error: rErr } = await supabase
          .from('responses')
          .select('id, session_id, item_id, response_value, responded_at, items(type, token_key)')
          .in('session_id', chunk)
        if (rErr) throw rErr
        allResponses.push(...(rRows || []))
      }

      const sessionById = Object.fromEntries(sessRows.map((s) => [s.id, s]))

      const rows = allResponses.map((r) => {
        const sess = sessionById[r.session_id]
        const code = sess ? codeById[sess.access_code_id] : null
        return {
          session_id: r.session_id,
          access_code: code?.code || '',
          session_status: sess?.status || '',
          started_at: sess?.started_at || '',
          completed_at: sess?.completed_at || '',
          item_type: r.items?.type || '',
          token_key: r.items?.token_key || '',
          response_value:
            typeof r.response_value === 'string'
              ? r.response_value
              : JSON.stringify(r.response_value),
          responded_at: r.responded_at || '',
        }
      })

      const headers = [
        'session_id',
        'access_code',
        'session_status',
        'started_at',
        'completed_at',
        'item_type',
        'token_key',
        'response_value',
        'responded_at',
      ]
      const csv = rowsToCSV(headers, rows)
      downloadCSV(`${intervention.slug}_responses_${todayStamp()}.csv`, csv)
    } catch (err) {
      console.error('Export failed', err)
      alert('Export failed — see console for details.')
    } finally {
      setExporting(null)
    }
  }

  async function exportSummary(intvId) {
    setExporting('summary')
    try {
      const intervention = interventions.find((i) => i.id === intvId)
      if (!intervention) throw new Error('Intervention not found')

      const { data: codes, error: cErr } = await supabase
        .from('access_codes')
        .select('id, code, cohort_label')
        .eq('intervention_id', intvId)
      if (cErr) throw cErr
      const codeIds = (codes || []).map((c) => c.id)
      const codeById = Object.fromEntries((codes || []).map((c) => [c.id, c]))

      if (codeIds.length === 0) {
        downloadCSV(
          `${intervention.slug}_summary_${todayStamp()}.csv`,
          rowsToCSV(['note'], [{ note: 'No sessions yet.' }]),
        )
        return
      }

      const { data: sessRows, error: sErr } = await supabase
        .from('sessions')
        .select('id, status, started_at, completed_at, access_code_id')
        .in('access_code_id', codeIds)
      if (sErr) throw sErr
      const sessionIds = sessRows.map((s) => s.id)

      const tokenSet = new Set()
      const responsesBySession = {}
      const chunkSize = 50
      for (let i = 0; i < sessionIds.length; i += chunkSize) {
        const chunk = sessionIds.slice(i, i + chunkSize)
        const { data: rRows, error: rErr } = await supabase
          .from('responses')
          .select('session_id, response_value, items(token_key)')
          .in('session_id', chunk)
        if (rErr) throw rErr
        for (const r of rRows || []) {
          const tk = r.items?.token_key
          if (!tk) continue
          tokenSet.add(tk)
          if (!responsesBySession[r.session_id]) responsesBySession[r.session_id] = {}
          responsesBySession[r.session_id][tk] =
            typeof r.response_value === 'string'
              ? r.response_value
              : JSON.stringify(r.response_value)
        }
      }

      const tokenColumns = Array.from(tokenSet).sort()
      const headers = [
        'session_id',
        'access_code',
        'cohort',
        'status',
        'started_at',
        'completed_at',
        ...tokenColumns,
      ]
      const rows = sessRows.map((s) => {
        const code = codeById[s.access_code_id]
        const tokenVals = responsesBySession[s.id] || {}
        const row = {
          session_id: s.id,
          access_code: code?.code || '',
          cohort: code?.cohort_label || '',
          status: s.status,
          started_at: s.started_at || '',
          completed_at: s.completed_at || '',
        }
        for (const tk of tokenColumns) row[tk] = tokenVals[tk] || ''
        return row
      })
      const csv = rowsToCSV(headers, rows)
      downloadCSV(`${intervention.slug}_summary_${todayStamp()}.csv`, csv)
    } catch (err) {
      console.error('Summary export failed', err)
      alert('Summary export failed — see console for details.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard label="Total sessions" value={stats.total} />
        <StatCard label="In progress" value={stats.inProgress} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Abandoned" value={stats.abandoned} />
        <StatCard
          label="Completion rate"
          value={`${stats.completionRate}%`}
          hint={`${stats.completed} of ${stats.total}`}
        />
      </div>

      {/* Export panel */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Download size={18} strokeWidth={1.5} className="text-amber-700" />
          <h2 className="text-[16px] font-semibold text-slate-800">Export data</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={exportInterventionId}
            onChange={(e) => setExportInterventionId(e.target.value)}
            className="flex-1 min-w-[200px] text-[14px] px-3 py-2 min-h-[44px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
          >
            <option value="">Choose an intervention…</option>
            {interventions.map((iv) => (
              <option key={iv.id} value={iv.id}>
                {iv.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!exportInterventionId || exporting !== null}
            onClick={() => exportLong(exportInterventionId)}
            className="bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-800 font-semibold rounded-full px-5 py-2 min-h-[44px] text-[14px]"
          >
            {exporting === 'long' ? 'Exporting…' : 'Long format (one row per response)'}
          </button>
          <button
            type="button"
            disabled={!exportInterventionId || exporting !== null}
            onClick={() => exportSummary(exportInterventionId)}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-full px-5 py-2 min-h-[44px] text-[14px]"
          >
            {exporting === 'summary' ? 'Exporting…' : 'Summary (one row per session)'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-semibold text-slate-800">Recent sessions</h2>
          <button
            type="button"
            onClick={() => setReload((r) => r + 1)}
            className="flex items-center gap-1 text-[13px] text-amber-700 hover:text-amber-900"
            title="Reload"
          >
            <RefreshCw size={14} strokeWidth={1.5} />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={interventionFilter}
            onChange={(e) => setInterventionFilter(e.target.value)}
            className="text-[14px] px-3 py-2 min-h-[44px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
          >
            <option value="all">All interventions</option>
            {interventions.map((iv) => (
              <option key={iv.id} value={iv.id}>
                {iv.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-[14px] px-3 py-2 min-h-[44px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In progress</option>
            <option value="abandoned">Abandoned</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-[14px] px-3 py-2 min-h-[44px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
            placeholder="From"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-[14px] px-3 py-2 min-h-[44px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
            placeholder="To"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-[14px]">
            {error.message || 'Failed to load sessions.'}
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-[14px]">
            No sessions match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-amber-50 text-left text-[12px] uppercase tracking-wide text-amber-800">
                  <SortableHeader label="Code" k="access_code" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Intervention" k="intervention" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Status" k="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Started" k="started_at" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Last active" k="last_active_at" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="Completed" k="completed_at" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => {
                  const ivId =
                    s.intervention_versions?.intervention_id ||
                    s.access_codes?.intervention_id
                  const iv = interventionMap[ivId]
                  const isExpanded = expandedId === s.id
                  return (
                    <Fragment key={s.id}>
                      <tr
                        onClick={() => expandRow(s.id)}
                        className="border-t border-slate-100 hover:bg-amber-50 cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono text-[13px] text-slate-700">
                          {s.access_codes?.code || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-800">{iv?.name || '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(s.started_at)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(s.last_active_at)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(s.completed_at)}</td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-t border-slate-100 bg-amber-50/40">
                          <td colSpan={6} className="px-4 py-4">
                            <ResponsesPreview rows={expandedResponses[s.id]} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function SortableHeader({ label, k, sortKey, sortDir, onSort }) {
  const active = sortKey === k
  return (
    <th
      onClick={() => onSort(k)}
      className="px-4 py-3 cursor-pointer select-none whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (sortDir === 'asc'
          ? <ChevronUp size={14} strokeWidth={1.5} />
          : <ChevronDown size={14} strokeWidth={1.5} />)}
      </span>
    </th>
  )
}

function ResponsesPreview({ rows }) {
  if (!rows) return <div className="text-[13px] text-slate-500">Loading…</div>
  if (rows.length === 0)
    return <div className="text-[13px] text-slate-500 italic">No responses saved yet.</div>
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {rows.map((r) => {
        const value =
          typeof r.response_value === 'string'
            ? r.response_value
            : JSON.stringify(r.response_value)
        const trimmed = value.length > 200 ? value.slice(0, 200) + '…' : value
        return (
          <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-3">
            <div className="text-[12px] font-mono text-amber-800 mb-1">
              {r.items?.token_key || `(no token, ${r.items?.type})`}
            </div>
            <div className="text-[12px] text-slate-700 break-all whitespace-pre-wrap font-mono">
              {trimmed}
            </div>
          </div>
        )
      })}
    </div>
  )
}
