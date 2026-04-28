import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import AdminLayout from '../components/AdminLayout.jsx'
import { supabase } from '../lib/supabase.js'

function StatusBadge({ active }) {
  return (
    <span
      className={
        'inline-block rounded-full px-2.5 py-1 text-[12px] font-medium ' +
        (active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700')
      }
    >
      {active ? 'Active' : 'Inactive'}
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

export default function InterventionListPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rows, setRows] = useState([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    supabase
      .from('interventions')
      .select(
        'id, name, slug, is_active, current_version_id, created_at, intervention_versions!intervention_versions_intervention_id_fkey(version_number, id)',
      )
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (cancelled) return
        if (e) {
          setError(e)
        } else {
          // Compute current_version_number
          const enriched = (data || []).map((iv) => {
            const cur = (iv.intervention_versions || []).find(
              (v) => v.id === iv.current_version_id,
            )
            return { ...iv, current_version_number: cur?.version_number ?? null }
          })
          setRows(enriched)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AdminLayout title="Interventions">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-[16px] font-semibold text-slate-800">All interventions</h2>
          <button
            type="button"
            onClick={() => alert('Coming in the next update.')}
            className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold rounded-full px-4 py-2 min-h-[44px] text-[14px]"
          >
            <Plus size={16} strokeWidth={1.5} />
            Create new
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-[14px]">
            {error.message || 'Failed to load.'}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-[14px]">
            No interventions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-amber-50 text-left text-[12px] uppercase tracking-wide text-amber-800">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Current version</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((iv) => (
                  <tr
                    key={iv.id}
                    onClick={() => navigate(`/admin/interventions/${iv.id}`)}
                    className="border-t border-slate-100 hover:bg-amber-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-slate-800 font-medium">{iv.name}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-slate-600">{iv.slug}</td>
                    <td className="px-4 py-3"><StatusBadge active={iv.is_active} /></td>
                    <td className="px-4 py-3 text-slate-700">
                      {iv.current_version_number !== null
                        ? `v${iv.current_version_number}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(iv.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
