import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Play, FlaskConical } from 'lucide-react'
import AdminLayout from '../components/AdminLayout.jsx'
import { TEST_REGISTRY } from '../lib/testRegistry.js'

export default function TestingDashboardPage() {
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return TEST_REGISTRY
    return TEST_REGISTRY.filter(
      (e) =>
        e.displayName.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q),
    )
  }, [filter])

  const grouped = useMemo(() => {
    const out = {}
    for (const e of filtered) {
      if (!out[e.category]) out[e.category] = []
      out[e.category].push(e)
    }
    return out
  }, [filtered])

  return (
    <AdminLayout title="Testing & QA">
      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-2xl">
            <FlaskConical size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-slate-800">Component sandbox</h2>
            <p className="text-[14px] text-slate-600 mt-1">
              Launch any activity or item-type renderer in isolation with mock props.
              Useful for QA, demos, and clinical review of an individual component
              without walking the full intervention.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by name, category, or description…"
            className="w-full text-[14px] pl-9 pr-4 py-2 min-h-[44px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-500 text-[14px]">
          No components match "{filter}".
        </div>
      ) : (
        Object.entries(grouped).map(([category, entries]) => (
          <section key={category} className="mb-6">
            <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-3">
              {category} ({entries.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="bg-white rounded-2xl shadow-card p-4 flex flex-col"
                >
                  <h3 className="text-[16px] font-semibold text-slate-800 mb-1">
                    {entry.displayName}
                  </h3>
                  <div className="text-[12px] font-mono text-slate-400 mb-2">{entry.id}</div>
                  <p className="text-[13px] text-slate-600 leading-relaxed flex-1 mb-4">
                    {entry.description}
                  </p>
                  <Link
                    to={`/admin/testing/${entry.id}`}
                    className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-4 py-2 min-h-[44px] text-[14px]"
                  >
                    <Play size={14} strokeWidth={2} />
                    Launch test
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </AdminLayout>
  )
}
