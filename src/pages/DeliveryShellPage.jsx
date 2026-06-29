import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import SessionGuard from '../components/SessionGuard.jsx'
import { SessionProvider, useSession } from '../engine/SessionEngine.jsx'

function ProgressBar() {
  const { progressFraction } = useSession()
  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-ctac-teal-100 z-50"
      aria-hidden="true"
    >
      <div
        className="h-full bg-ctac-teal-400 transition-all duration-[600ms] ease-out"
        style={{ width: `${Math.round(progressFraction * 100)}%` }}
      />
    </div>
  )
}

function CompletedScreen() {
  const { exitInfo } = useSession()
  const navigate = useNavigate()
  function handleStart() {
    sessionStorage.removeItem('session_id')
    navigate('/', { replace: true })
  }
  const title = exitInfo?.title || "You've already finished this one."
  const message =
    exitInfo?.message || 'Thanks for showing up. Your responses are saved.'
  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-[540px] bg-white rounded-2xl shadow-card p-6 sm:p-8 text-center">
        <h1 className="text-[28px] font-bold leading-tight mb-3">{title}</h1>
        <p className="text-[16px] leading-relaxed text-slate-700 whitespace-pre-wrap mb-6">
          {message}
        </p>
        <button
          type="button"
          onClick={handleStart}
          className="text-ctac-teal-700 hover:text-ctac-teal-900 underline text-[14px] min-h-[48px]"
        >
          ← Back to start
        </button>
      </div>
    </main>
  )
}

function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <p className="text-[14px] text-slate-500">Loading…</p>
    </main>
  )
}

function ErrorScreen({ error }) {
  const navigate = useNavigate()
  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-[540px] bg-white rounded-2xl shadow-card p-6">
        <h1 className="text-[22px] font-semibold mb-3">Something went wrong</h1>
        <p className="text-[15px] text-slate-700 mb-4">
          We couldn&apos;t load this session. Try again in a moment, or start over.
        </p>
        <p className="text-[12px] text-slate-500 font-mono break-all mb-4">
          {error?.message || 'Unknown error'}
        </p>
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem('session_id')
            navigate('/', { replace: true })
          }}
          className="text-ctac-teal-700 hover:text-ctac-teal-900 underline text-[14px] min-h-[48px]"
        >
          ← Back to start
        </button>
      </div>
    </main>
  )
}

function ShellInner() {
  const { loading, error, completed, sections, currentSection } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const { sessionId } = useParams()

  // Auto-redirect /session/:id to /session/:id/step once content is loaded
  useEffect(() => {
    if (loading || error || completed) return
    if (!sections.length) return
    const onShellRoute = location.pathname === `/session/${sessionId}`
    if (onShellRoute) {
      navigate(`/session/${sessionId}/step`, { replace: true })
    }
  }, [loading, error, completed, sections.length, location.pathname, navigate, sessionId])

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen error={error} />
  if (completed) return <CompletedScreen />
  if (!sections.length) {
    return (
      <main className="min-h-screen flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-[540px] bg-white rounded-2xl shadow-card p-6">
          <h1 className="text-[22px] font-semibold mb-3">No content yet</h1>
          <p className="text-[15px] text-slate-700">
            This program doesn&apos;t have content to show yet. Check back soon.
          </p>
        </div>
      </main>
    )
  }

  return (
    <>
      <ProgressBar />
      <Outlet />
    </>
  )
}

export default function DeliveryShellPage() {
  const { sessionId } = useParams()
  return (
    <SessionGuard>
      <SessionProvider sessionId={sessionId}>
        <ShellInner />
      </SessionProvider>
    </SessionGuard>
  )
}
