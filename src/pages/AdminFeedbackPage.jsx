// Admin review surface for IRF Team feedback collected on the public /demo
// surface. Reads + writes go directly through the supabase-js client because
// the admin RLS policy on public.feedback grants is_admin() full access.
//
// Workflow: rows arrive as `new`, an admin moves them through
// acknowledged → addressed | declined and can leave inline `admin_notes`.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, MessageSquare, ChevronDown, ChevronRight, Download } from 'lucide-react'
import AdminLayout from '../components/AdminLayout.jsx'
import { supabase } from '../lib/supabase.js'
import { rowsToCSV, downloadCSV, todayStamp } from '../lib/csv.js'

const STATUSES = [
  { value: 'new', label: 'New', cls: 'bg-ctac-teal-100 text-ctac-teal-800' },
  { value: 'acknowledged', label: 'Acknowledged', cls: 'bg-sky-100 text-sky-800' },
  { value: 'addressed', label: 'Addressed', cls: 'bg-emerald-100 text-emerald-800' },
  { value: 'declined', label: 'Declined', cls: 'bg-slate-200 text-slate-700' },
]

const CATEGORIES = [
  { value: 'activity_copy', label: 'Activity copy' },
  { value: 'activity_design', label: 'Activity design' },
  { value: 'bug', label: 'Bug' },
  { value: 'data_export', label: 'Data export' },
  { value: 'video', label: 'Video / animation' },
  { value: 'general', label: 'General' },
]

const SUBMITTER_LABELS = {
  ginny: 'Ginny',
  adrienne: 'Adrienne',
  jessica: 'Jessica',
  holly: 'Holly',
  bianca: 'Bianca',
  stephanie: 'Stephanie',
  josh: 'Josh',
  anonymous: 'Anonymous',
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function StatusBadge({ value }) {
  const meta = STATUSES.find((s) => s.value === value) || STATUSES[0]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ${meta.cls}`}>
      {meta.label}
    </span>
  )
}

function CategoryBadge({ value }) {
  const meta = CATEGORIES.find((c) => c.value === value)
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium bg-slate-100 text-slate-700">
      {meta ? meta.label : value}
    </span>
  )
}

function truncate(text, n = 200) {
  if (!text) return ''
  if (text.length <= n) return text
  return text.slice(0, n).trimEnd() + '…'
}

export default function AdminFeedbackPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rows, setRows] = useState([])
  const [reloadKey, setReloadKey] = useState(0)

  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  // Per-row optimistic state for status / notes saves
  const [savingId, setSavingId] = useState(null)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError(err.message || 'Could not load feedback.')
        } else {
          setRows(data || [])
        }
      })
      .then(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const refresh = useCallback(() => setReloadKey((k) => k + 1), [])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false
      return true
    })
  }, [rows, statusFilter, categoryFilter])

  const counts = useMemo(() => {
    return {
      total: rows.length,
      new: rows.filter((r) => r.status === 'new').length,
    }
  }, [rows])

  // NOTE: must be declared AFTER `filtered` — useCallback evaluates its
  // dependency array at call time, so referencing `filtered` here while
  // it's still in the temporal dead zone crashes the whole page render.
  const downloadSpreadsheet = useCallback(() => {
    // Export the *currently filtered* set. The filter UI is right above
    // the button, so "what you see is what you get" is the intuitive
    // contract here — if you want everything, set both filters to All
    // first. Mirrors the behavior of the /admin/exports CSV.
    const headers = [
      'created_at',
      'submitter',
      'category',
      'status',
      'area',
      'activity_id',
      'activity_version',
      'page_path',
      'message',
      'admin_notes',
      'user_agent',
      'id',
    ]
    const stamp = todayStamp()
    const csv = rowsToCSV(headers, filtered)
    const filterTag =
      statusFilter === 'all' && categoryFilter === 'all'
        ? 'all'
        : [
            statusFilter !== 'all' ? statusFilter : null,
            categoryFilter !== 'all' ? categoryFilter : null,
          ].filter(Boolean).join('-')
    downloadCSV(`feedback-${filterTag}-${stamp}.csv`, csv)
  }, [filtered, statusFilter, categoryFilter])

  async function updateRow(id, patch) {
    setSaveError(null)
    setSavingId(id)
    // Optimistic update
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    try {
      const { error: err } = await supabase
        .from('feedback')
        .update(patch)
        .eq('id', id)
      if (err) throw err
    } catch (err) {
      setSaveError(err.message || 'Could not save.')
      // Roll back by refetching
      refresh()
    } finally {
      setSavingId(null)
    }
  }

  return (
    <AdminLayout title="Feedback">
      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-[18px] font-semibold text-slate-800 mb-1 flex items-center gap-2">
              <MessageSquare size={18} strokeWidth={1.5} className="text-ctac-teal-600" />
              IRF Team feedback
            </h2>
            <p className="text-[14px] text-slate-600">
              {counts.total} total
              {counts.new > 0 && (
                <span className="ml-2 text-ctac-teal-700">· {counts.new} new</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={downloadSpreadsheet}
              disabled={filtered.length === 0}
              title={
                filtered.length === 0
                  ? 'No rows in the current view'
                  : `Download ${filtered.length} row${filtered.length === 1 ? '' : 's'} as CSV`
              }
              className="inline-flex items-center gap-1.5 bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-40 disabled:hover:bg-ctac-teal-500 text-white font-semibold rounded-full px-4 py-2 min-h-[36px] text-[13px]"
            >
              <Download size={14} strokeWidth={2} />
              Download CSV
            </button>
            <button
              type="button"
              onClick={refresh}
              className="flex items-center gap-1 text-[13px] text-ctac-teal-700 hover:text-ctac-teal-900"
            >
              <RefreshCw size={14} strokeWidth={1.5} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <div>
            <label className="block text-[12px] text-slate-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-[14px] px-3 py-2 min-h-[40px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
            >
              <option value="all">All</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] text-slate-500 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-[14px] px-3 py-2 min-h-[40px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
            >
              <option value="all">All</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {saveError && (
        <div role="alert" className="mb-4 text-[13px] text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2">
          {saveError}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-[14px]">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-[14px]">
            No feedback{rows.length > 0 ? ' matches these filters.' : ' yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-ctac-teal-50 text-left text-[12px] uppercase tracking-wide text-ctac-teal-800">
                  <th className="px-3 py-3 w-8"></th>
                  <th className="px-3 py-3 whitespace-nowrap">Received</th>
                  <th className="px-3 py-3">From</th>
                  <th className="px-3 py-3">Where</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Message</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const expanded = expandedId === r.id
                  return (
                    <FeedbackRow
                      key={r.id}
                      row={r}
                      expanded={expanded}
                      saving={savingId === r.id}
                      onToggle={() => setExpandedId(expanded ? null : r.id)}
                      onUpdate={(patch) => updateRow(r.id, patch)}
                    />
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

function FeedbackRow({ row, expanded, saving, onToggle, onUpdate }) {
  const [notes, setNotes] = useState(row.admin_notes || '')

  // Keep local textarea in sync if the row is refetched / replaced.
  useEffect(() => {
    setNotes(row.admin_notes || '')
  }, [row.admin_notes])

  function handleNotesBlur() {
    const next = notes.trim() === '' ? null : notes
    if (next === (row.admin_notes ?? null)) return
    onUpdate({ admin_notes: next })
  }

  return (
    <>
      <tr
        className="border-t border-slate-100 hover:bg-ctac-teal-50/40 cursor-pointer"
        onClick={onToggle}
      >
        <td className="px-3 py-3 text-slate-400">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </td>
        <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
          {fmtDateTime(row.created_at)}
        </td>
        <td className="px-3 py-3 text-slate-800 whitespace-nowrap">
          {SUBMITTER_LABELS[row.submitter] || row.submitter}
        </td>
        <td className="px-3 py-3 text-slate-700">
          <span>{row.area || '—'}</span>
          {row.activity_version && (
            <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-ctac-teal-100 text-ctac-teal-800 align-middle">
              {row.activity_version}
            </span>
          )}
        </td>
        <td className="px-3 py-3">
          <CategoryBadge value={row.category} />
        </td>
        <td className="px-3 py-3 text-slate-700 max-w-[420px]">
          {truncate(row.message, 160)}
        </td>
        <td className="px-3 py-3">
          <StatusBadge value={row.status} />
        </td>
      </tr>
      {expanded && (
        <tr className="border-t border-slate-100 bg-slate-50/60">
          <td></td>
          <td colSpan={6} className="px-3 py-4">
            <div className="space-y-4 max-w-[820px]">
              <div>
                <div className="text-[12px] uppercase tracking-wide text-slate-500 mb-1">
                  Full message
                </div>
                <div className="text-[14px] text-slate-800 whitespace-pre-wrap bg-white border border-slate-200 rounded-2xl px-3 py-2">
                  {row.message}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                <div>
                  <div className="text-[12px] uppercase tracking-wide text-slate-500">Page</div>
                  <div className="text-slate-700 font-mono break-all">{row.page_path || '—'}</div>
                </div>
                <div>
                  <div className="text-[12px] uppercase tracking-wide text-slate-500">Activity ID</div>
                  <div className="text-slate-700 font-mono">{row.activity_id || '—'}</div>
                </div>
                <div>
                  <div className="text-[12px] uppercase tracking-wide text-slate-500">Activity version</div>
                  <div className="text-slate-700 font-mono">{row.activity_version || '—'}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[12px] uppercase tracking-wide text-slate-500">User agent</div>
                  <div className="text-slate-600 break-all">{row.user_agent || '—'}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-[12px] text-slate-500 mb-1">Status</label>
                  <select
                    value={row.status}
                    disabled={saving}
                    onChange={(e) => onUpdate({ status: e.target.value })}
                    className="text-[14px] px-3 py-2 min-h-[40px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                {saving && (
                  <span className="text-[12px] text-slate-500 pb-2">Saving…</span>
                )}
              </div>

              <div>
                <label className="block text-[12px] text-slate-500 mb-1">
                  Admin notes <span className="text-slate-400">(saves on blur)</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="Triage notes, decisions, follow-up tasks…"
                  className="w-full text-[14px] leading-relaxed px-3 py-2 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
