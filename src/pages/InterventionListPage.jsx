import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil } from 'lucide-react'
import AdminLayout from '../components/AdminLayout.jsx'
import CreateInterventionModal from '../components/builder/CreateInterventionModal.jsx'
import { supabase } from '../lib/supabase.js'

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
  const [showCreate, setShowCreate] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    supabase
      .from('interventions')
      .select(
        'id, name, slug, is_active, current_version_id, created_at, intervention_versions!intervention_versions_intervention_id_fkey(version_number, id, published_at)',
      )
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (cancelled) return
        if (e) {
          setError(e)
        } else {
          const enriched = (data || []).map((iv) => {
            const versions = iv.intervention_versions || []
            const cur = versions.find((v) => v.id === iv.current_version_id)
            const lastPublished = versions
              .map((v) => v.published_at)
              .filter(Boolean)
              .sort()
              .reverse()[0]
            return {
              ...iv,
              version_count: versions.length,
              current_version_number: cur?.version_number ?? null,
              last_published_at: lastPublished || null,
            }
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
  }, [reload])

  async function toggleActive(iv) {
    if (!iv.current_version_id && !iv.is_active) {
      alert('Publish a version before activating this intervention.')
      return
    }
    const { error: e } = await supabase
      .from('interventions')
      .update({ is_active: !iv.is_active })
      .eq('id', iv.id)
    if (e) {
      alert('Failed to update: ' + e.message)
      return
    }
    setRows((prev) =>
      prev.map((r) => (r.id === iv.id ? { ...r, is_active: !r.is_active } : r)),
    )
  }

  return (
    <AdminLayout title="Interventions">
      <CreateInterventionModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(id) => {
          setShowCreate(false)
          navigate(`/admin/interventions/${id}`)
        }}
      />

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-[16px] font-semibold text-slate-800">All interventions</h2>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white font-semibold rounded-full px-4 py-2 min-h-[44px] text-[14px]"
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
          <div className="p-8 text-center text-slate-500 text-[14px]">No interventions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-ctac-teal-50 text-left text-[12px] uppercase tracking-wide text-ctac-teal-800">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3 whitespace-nowrap">Versions</th>
                  <th className="px-4 py-3 whitespace-nowrap">Last published</th>
                  <th className="px-4 py-3 whitespace-nowrap">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((iv) => (
                  <tr key={iv.id} className="border-t border-slate-100 hover:bg-ctac-teal-50">
                    <td className="px-4 py-3 text-slate-800 font-medium">{iv.name}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-slate-600">{iv.slug}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(iv)}
                        className={
                          'rounded-full px-3 py-1 text-[12px] font-medium transition-colors ' +
                          (iv.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300')
                        }
                        title={
                          iv.is_active
                            ? 'Click to deactivate'
                            : iv.current_version_id
                              ? 'Click to activate'
                              : 'Publish a version first'
                        }
                      >
                        {iv.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {iv.version_count}
                      {iv.current_version_number !== null && (
                        <span className="ml-2 text-[12px] text-slate-500">(current: v{iv.current_version_number})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(iv.last_published_at)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(iv.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/interventions/${iv.id}`)}
                        className="inline-flex items-center gap-1 text-ctac-teal-700 hover:text-ctac-teal-900 font-medium text-[13px]"
                      >
                        <Pencil size={14} strokeWidth={1.5} />
                        Edit
                      </button>
                    </td>
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
