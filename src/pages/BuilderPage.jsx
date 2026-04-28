import { useParams } from 'react-router-dom'
import AdminStubLayout from '../components/AdminStubLayout.jsx'

export default function BuilderPage() {
  const { id } = useParams()
  return (
    <AdminStubLayout title="Builder">
      <p className="text-[14px] text-slate-600">
        Intervention id: <span className="font-mono">{id}</span>
      </p>
    </AdminStubLayout>
  )
}
