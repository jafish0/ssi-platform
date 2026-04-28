import { useNavigate } from 'react-router-dom'
import SessionGuard from '../components/SessionGuard.jsx'

function ShellContent({ session }) {
  const navigate = useNavigate()

  function handleBack() {
    sessionStorage.removeItem('session_id')
    navigate('/', { replace: true })
  }

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-amber-400 origin-left"
        style={{ width: '0%' }}
        aria-hidden="true"
      />
      <main className="min-h-screen flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-[540px] bg-white rounded-2xl shadow-card p-6 sm:p-8">
          <h1 className="text-[28px] font-bold leading-tight mb-3">
            Session active
          </h1>
          <p className="text-[16px] leading-relaxed text-slate-700 mb-6">
            You&apos;re signed in to this session. The full experience is being
            built — check back soon.
          </p>

          <dl className="space-y-3 text-[14px] mb-6">
            <div>
              <dt className="font-medium text-slate-600">Session id</dt>
              <dd className="font-mono text-slate-800 break-all">
                {session?.session_id || '—'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-600">Status</dt>
              <dd className="text-slate-800 capitalize">
                {session?.status?.replace('_', ' ') || '—'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-600">Intervention</dt>
              <dd className="font-mono text-slate-800">
                {session?.intervention_slug || '—'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-600">Current section</dt>
              <dd className="text-slate-800">{session?.current_section ?? 0}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleBack}
            className="text-[14px] text-amber-700 hover:text-amber-900 underline min-h-[48px]"
          >
            ← Back to start
          </button>
        </div>
      </main>
    </>
  )
}

export default function DeliveryShellPage() {
  return <SessionGuard>{(session) => <ShellContent session={session} />}</SessionGuard>
}
