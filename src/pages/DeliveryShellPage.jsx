import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import SessionGuard from '../components/SessionGuard.jsx'
import { SessionProvider, useSession } from '../engine/SessionEngine.jsx'
import TreeProgress from '../components/TreeProgress.jsx'
import SplashScreen from '../components/SplashScreen.jsx'
// Draft 88 Part B: the post-posttest completion screen is the ONE place a
// participant can save their keepsake — the five mid-flow download buttons
// are gone, so nothing invites them out of the app before the posttest.
import {
  Keepsake,
  PlanDownloads,
  PlanReview,
  buildSavedPlanModel,
} from '../activities/Plan.jsx'

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

// First-completion celebration (Draft 74). The engine already carries
// enough state to tell the moment apart without a new flag:
//   - just finished THIS session → `completed` true but `sessionMeta.status`
//     is still 'in_progress' (sessionMeta is set once at bootstrap and
//     never mutated) and no exitInfo → celebrate.
//   - exit_on hard branch (e.g. assent "No") → exitInfo set → its own
//     friendly exit copy, no celebration.
//   - re-entering an already-completed session → bootstrap saw
//     status 'completed' → the original revisit copy.
// Copy is deliberately self-contained: no emails / gift cards / follow-up
// timing (the incentive workflow is Qualtrics-side). Team may reword.
//
// Draft 75: the copy (and the tree visual) are overridable per
// intervention via the LAST section's config_json.celebration —
// { heading, line1, line2, show_tree } — so the 90-day follow-up can say
// "thanks for checking back in" instead of "you finished the whole
// program". Defaults preserve the Draft 74 main-program copy.
function CelebrationScreen({ onBackToStart, config, keepsakeModel }) {
  // TreeProgress only animates on a FORWARD stage change after mount, so
  // mount at seed and grow to full bloom for the payoff moment.
  const [stage, setStage] = useState(0)
  const showTree = config?.show_tree !== false
  useEffect(() => {
    const t = setTimeout(() => setStage(5), 400)
    return () => clearTimeout(t)
  }, [])
  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-10 bg-ctac-teal-50">
      <div className="w-full max-w-[640px] bg-white rounded-2xl shadow-card p-6 sm:p-8 text-center">
        {showTree && (
          <div className="mx-auto w-full max-w-[240px] mb-4">
            <TreeProgress stage={stage} animated />
          </div>
        )}
        <h1 className="text-[28px] font-bold leading-tight mb-3 text-ctac-navy">
          {config?.heading || 'You did it — you finished the whole program.'}
        </h1>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-2">
          {config?.line1 || "You built a plan, and it's yours to keep."}
        </p>
        <p className="text-[15px] leading-relaxed text-slate-600 mb-6">
          {config?.line2 ||
            "You're all set — you can close this window whenever you're ready."}
        </p>
        {/* Draft 88 Part B: the real keepsake, rendered from the saved
            payloads, with the program's only download actions. Absent
            (null model) for interventions without a plan activity — the
            90-day follow-up keeps the plain celebration. */}
        {keepsakeModel && (
          <div className="mt-2 mb-6 text-left">
            <h2 className="text-[18px] font-semibold text-ctac-navy text-center mb-4">
              Here&apos;s everything you made today.
            </h2>
            <Keepsake>
              <PlanReview model={keepsakeModel} />
            </Keepsake>
            <PlanDownloads model={keepsakeModel} />
            <p className="text-[13px] text-slate-500 text-center mt-3">
              Or just take a screenshot — whatever&apos;s easiest for keeping
              it with you.
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onBackToStart}
          className="text-ctac-teal-700 hover:text-ctac-teal-900 underline text-[14px] min-h-[48px]"
        >
          ← Back to start
        </button>
      </div>
    </main>
  )
}

function CompletedScreen() {
  const { exitInfo, sessionMeta, sections, responses } = useSession()
  const navigate = useNavigate()
  function handleStart() {
    sessionStorage.removeItem('session_id')
    navigate('/', { replace: true })
  }
  // Note: an 'exited' session never reaches this screen on revisit — the
  // engine resumes it instead (Draft 88 Part A). exitInfo covers the
  // exit-screen-this-visit case; 'completed' covers genuine revisits.
  const firstCompletion = !exitInfo && sessionMeta?.status !== 'completed'
  if (firstCompletion) {
    const celebrationConfig =
      sections[sections.length - 1]?.config_json?.celebration || null
    return (
      <CelebrationScreen
        onBackToStart={handleStart}
        config={celebrationConfig}
        keepsakeModel={buildSavedPlanModel(responses)}
      />
    )
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

  // Draft 93: a genuinely new session (flagged by CodeEntryPage, never set
  // on a resume) shows the splash before anything else. Read once at mount
  // — sessionStorage is only ever cleared by clicking Begin below, so a
  // reload of the shell route before Begin correctly re-shows the splash,
  // and a reload anywhere past it (flag already cleared) never does.
  const splashKey = `splash_pending_${sessionId}`
  const [showSplash, setShowSplash] = useState(
    () => sessionStorage.getItem(splashKey) === '1',
  )

  // Auto-redirect /session/:id to /session/:id/step once content is loaded
  useEffect(() => {
    if (loading || error || completed) return
    if (!sections.length) return
    if (showSplash) return
    const onShellRoute = location.pathname === `/session/${sessionId}`
    if (onShellRoute) {
      navigate(`/session/${sessionId}/step`, { replace: true })
    }
  }, [loading, error, completed, sections.length, showSplash, location.pathname, navigate, sessionId])

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen error={error} />
  if (completed) return <CompletedScreen />
  if (showSplash) {
    return (
      <SplashScreen
        onBegin={() => {
          sessionStorage.removeItem(splashKey)
          setShowSplash(false)
          navigate(`/session/${sessionId}/step`, { replace: true })
        }}
      />
    )
  }
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
