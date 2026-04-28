import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const ROLE_RANK = { researcher: 1, admin: 2 }

export default function ProtectedRoute({ requiredRole = 'researcher', children }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-500 text-[14px]">Loading…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />
  }

  const userRank = ROLE_RANK[role] || 0
  const requiredRank = ROLE_RANK[requiredRole] || 0

  if (userRank < requiredRank) {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
        state={{ deniedReason: 'admin-only' }}
      />
    )
  }

  return children
}
