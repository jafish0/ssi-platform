import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const ROLE_RANK = { researcher: 1, admin: 2 }

// How long to wait before offering the in-app session-reset escape hatch.
// The AuthContext watchdog trips at 5s, so this should be a little longer
// than that — if the watchdog is going to recover on its own, we don't want
// to flash the recovery UI unnecessarily.
const STUCK_THRESHOLD_MS = 6000

export default function ProtectedRoute({ requiredRole = 'researcher', children }) {
  const { user, role, loading, resetAndReload } = useAuth()
  const location = useLocation()
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    if (!loading) {
      setStuck(false)
      return
    }
    const t = setTimeout(() => setStuck(true), STUCK_THRESHOLD_MS)
    return () => clearTimeout(t)
  }, [loading])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-[420px]">
          <p className="text-slate-500 text-[14px]">Loading…</p>
          {stuck && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 text-left">
              <p className="text-[13px] text-slate-700 mb-3">
                Stuck on this screen for a while? This usually means a stale
                browser session needs to be cleared. Click below to reset and
                sign in fresh — you won&apos;t lose any work.
              </p>
              <button
                type="button"
                onClick={() => resetAndReload?.()}
                className="inline-flex items-center bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-4 py-2 min-h-[40px] text-[13px]"
              >
                Reset session &amp; sign in
              </button>
            </div>
          )}
        </div>
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
