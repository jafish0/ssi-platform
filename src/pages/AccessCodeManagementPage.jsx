import { useEffect, useMemo, useState } from 'react'
import { Copy, Plus, RefreshCw } from 'lucide-react'
import AdminLayout from '../components/AdminLayout.jsx'
import { supabase } from '../lib/supabase.js'
import { generateCodeBatch, prefixFromSlug } from '../lib/codes.js'

function statusOf(code) {
  if (!code.is_active) return 'inactive'
  if (code.expires_at && new Date(code.expires_at) < new Date()) return 'expired'
  if (code.max_uses !== null && code.use_count >= code.max_uses) return 'exhausted'
  return 'active'
}

function StatusBadge({ status }) {
  const map = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-slate-200 text-slate-700',
    expired: 'bg-rose-100 text-rose-800',
    exhausted: 'bg-ctac-teal-100 text-ctac-teal-800',
  }
  return (
    <span
      className={
        'inline-block rounded-full px-2.5 py-1 text-[12px] font-medium capitalize ' +
        (map[status] || 'bg-slate-100 text-slate-700')
      }
    >
      {status}
    </span>
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

export default function AccessCodeManagementPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [interventions, setInterventions] = useState([])
  const [codes, setCodes] = useState([])
  const [reload, setReload] = useState(0)
  const [showInactive, setShowInactive] = useState(false)

  // Generation form
  const [genIntv, setGenIntv] = useState('')
  const [genType, setGenType] = useState('individual') // individual | batch
  const [genCount, setGenCount] = useState(1)
  const [genCohort, setGenCohort] = useState('')
  const [genExpires, setGenExpires] = useState('')
  const [generating, setGenerating] = useState(false)
  const [recentlyGenerated, setRecentlyGenerated] = useState([])
  const [genError, setGenError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      supabase.from('interventions').select('id, name, slug').order('name'),
      supabase
        .from('access_codes')
        .select('id, code, intervention_id, cohort_label, expires_at, max_uses, use_count, is_active, created_at')
        .order('created_at', { ascending: false })
        .limit(500),
    ])
      .then(([ivRes, cRes]) => {
        if (cancelled) return
        if (ivRes.error) throw ivRes.error
        if (cRes.error) throw cRes.error
        setInterventions(ivRes.data || [])
        setCodes(cRes.data || [])
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Codes load failed', err)
        setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reload])

  const interventionMap = useMemo(() => {
    const m = {}
    for (const iv of interventions) m[iv.id] = iv
    return m
  }, [interventions])

  const visibleCodes = useMemo(() => {
    if (showInactive) return codes
    return codes.filter((c) => c.is_active)
  }, [codes, showInactive])

  async function handleGenerate(e) {
    e.preventDefault()
    setGenError(null)
    if (!genIntv) {
      setGenError('Pick an intervention.')
      return
    }
    const intervention = interventionMap[genIntv]
    if (!intervention) {
      setGenError('Intervention not found.')
      return
    }
    const count = genType === 'batch' ? Math.max(1, Math.min(100, Number(genCount) || 1)) : 1
    const maxUses = genType === 'individual' ? 1 : null

    setGenerating(true)
    try {
      const prefix = prefixFromSlug(intervention.slug)
      // Generate plenty extra in case of collisions
      const candidates = generateCodeBatch(count + 5, prefix)

      // Take exactly `count`. If there's a unique-constraint conflict on
      // insert we'll surface the error.
      const toInsert = candidates.slice(0, count).map((code) => ({
        intervention_id: intervention.id,
        code,
        cohort_label: genCohort.trim() || null,
        max_uses: maxUses,
        expires_at: genExpires ? new Date(genExpires).toISOString() : null,
      }))

      const { data, error: iErr } = await supabase
        .from('access_codes')
        .insert(toInsert)
        .select('id, code, cohort_label, max_uses, use_count, is_active, expires_at, intervention_id, created_at')

      if (iErr) {
        if (iErr.code === '23505') {
          setGenError('One of the generated codes already existed — try again.')
        } else {
          setGenError(iErr.message || 'Failed to create codes.')
        }
        return
      }

      setRecentlyGenerated((data || []).map((c) => c.code))
      setCodes((prev) => [...(data || []), ...prev])
      setGenCohort('')
      setGenExpires('')
    } catch (err) {
      console.error(err)
      setGenError('Unexpected error — see console.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDeactivate(codeId) {
    if (!confirm('Deactivate this code? Existing sessions are unaffected.')) return
    const { error: uErr } = await supabase
      .from('access_codes')
      .update({ is_active: false })
      .eq('id', codeId)
    if (uErr) {
      alert('Failed to deactivate: ' + uErr.message)
      return
    }
    setCodes((prev) => prev.map((c) => (c.id === codeId ? { ...c, is_active: false } : c)))
  }

  function copyAll() {
    const text = recentlyGenerated.join('\n')
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => alert(`Copied ${recentlyGenerated.length} code(s) to clipboard.`),
        () => alert('Copy failed — select and copy manually.'),
      )
    }
  }

  function copyOne(code) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(
        () => {},
        () => {},
      )
    }
  }

  return (
    <AdminLayout title="Access Codes">
      {/* Generate */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Plus size={18} strokeWidth={1.5} className="text-ctac-teal-700" />
          <h2 className="text-[16px] font-semibold text-slate-800">Generate codes</h2>
        </div>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Intervention</label>
            <select
              value={genIntv}
              onChange={(e) => setGenIntv(e.target.value)}
              className="w-full text-[14px] px-3 py-2 min-h-[44px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
            >
              <option value="">Choose…</option>
              {interventions.map((iv) => (
                <option key={iv.id} value={iv.id}>
                  {iv.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Code type</label>
            <div className="flex gap-2">
              {[
                { v: 'individual', label: 'Individual (1 use)' },
                { v: 'batch', label: 'Batch (cohort)' },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setGenType(opt.v)}
                  aria-pressed={genType === opt.v}
                  className={
                    'flex-1 min-h-[44px] rounded-2xl border text-[14px] font-medium transition-colors ' +
                    (genType === opt.v
                      ? 'bg-ctac-teal-200 border-ctac-teal-400 text-ctac-teal-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-ctac-teal-300')
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {genType === 'batch' && (
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1">How many codes (1–100)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={genCount}
                onChange={(e) => setGenCount(e.target.value)}
                className="w-full text-[14px] px-3 py-2 min-h-[44px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
              />
            </div>
          )}
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Cohort label (optional)</label>
            <input
              type="text"
              value={genCohort}
              onChange={(e) => setGenCohort(e.target.value)}
              maxLength={80}
              placeholder="e.g. Spring 2026 Wave 1"
              className="w-full text-[14px] px-3 py-2 min-h-[44px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Expiration (optional)</label>
            <input
              type="date"
              value={genExpires}
              onChange={(e) => setGenExpires(e.target.value)}
              className="w-full text-[14px] px-3 py-2 min-h-[44px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
            />
          </div>
          {genError && (
            <div className="md:col-span-2 text-[13px] text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2">
              {genError}
            </div>
          )}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-50 text-white font-semibold rounded-full px-6 py-2 min-h-[48px] text-[15px]"
            >
              {generating ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </form>

        {recentlyGenerated.length > 0 && (
          <div className="mt-4 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[13px] font-medium text-ctac-teal-800">
                {recentlyGenerated.length} new code{recentlyGenerated.length === 1 ? '' : 's'}:
              </div>
              <button
                type="button"
                onClick={copyAll}
                className="flex items-center gap-1 text-[13px] text-ctac-teal-700 hover:text-ctac-teal-900"
              >
                <Copy size={14} strokeWidth={1.5} />
                Copy all
              </button>
            </div>
            <div className="font-mono text-[14px] text-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 max-h-[240px] overflow-y-auto">
              {recentlyGenerated.map((c) => (
                <div key={c} className="bg-white rounded px-3 py-1 border border-slate-200">{c}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-[16px] font-semibold text-slate-800">All codes</h2>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-[13px] text-slate-700">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-4 h-4 accent-ctac-teal-500"
              />
              Show inactive / expired
            </label>
            <button
              type="button"
              onClick={() => setReload((r) => r + 1)}
              className="flex items-center gap-1 text-[13px] text-ctac-teal-700 hover:text-ctac-teal-900"
            >
              <RefreshCw size={14} strokeWidth={1.5} />
              Refresh
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-[14px]">
            {error.message || 'Failed to load codes.'}
          </div>
        ) : visibleCodes.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-[14px]">No codes yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-ctac-teal-50 text-left text-[12px] uppercase tracking-wide text-ctac-teal-800">
                  <th className="px-4 py-3 whitespace-nowrap">Code</th>
                  <th className="px-4 py-3">Intervention</th>
                  <th className="px-4 py-3">Cohort</th>
                  <th className="px-4 py-3 whitespace-nowrap">Uses</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap">Expires</th>
                  <th className="px-4 py-3 whitespace-nowrap">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {visibleCodes.map((c) => {
                  const status = statusOf(c)
                  const iv = interventionMap[c.intervention_id]
                  return (
                    <tr key={c.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-mono text-[13px] whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => copyOne(c.code)}
                          className="text-slate-800 hover:text-ctac-teal-700"
                          title="Click to copy"
                        >
                          {c.code}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{iv?.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{c.cohort_label || '—'}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {c.use_count}/{c.max_uses ?? '∞'}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={status} /></td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(c.expires_at)}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(c.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        {c.is_active && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(c.id)}
                            className="text-[13px] text-slate-600 hover:text-rose-600"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
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
