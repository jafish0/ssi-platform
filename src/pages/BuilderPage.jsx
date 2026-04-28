import { useParams, Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout.jsx'

export default function BuilderPage() {
  const { id } = useParams()
  return (
    <AdminLayout title="Builder">
      <div className="bg-white rounded-2xl shadow-card p-6 max-w-[640px]">
        <h2 className="text-[18px] font-semibold mb-2">Builder coming soon</h2>
        <p className="text-[15px] text-slate-700 mb-4">
          The intervention Builder UI ships in the next update. For now, RSD
          content lives in the database and is edited via SQL.
        </p>
        <p className="text-[13px] text-slate-500 mb-6">
          Intervention id: <span className="font-mono break-all">{id}</span>
        </p>
        <Link
          to="/admin/interventions"
          className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 text-[14px]"
        >
          ← Back to interventions
        </Link>
      </div>
    </AdminLayout>
  )
}
