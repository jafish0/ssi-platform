import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { clearAllAuthState, withTimeout } from '../lib/authReset.js'

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// supabase-js's signInWithPassword does its own best-effort cleanup of any
// existing session in localStorage before processing new credentials. If
// that cleanup hangs (network blip, lock contention from a prior wedged
// run), the call never resolves and the button sits on "Signing in…"
// forever. We pre-clear state to avoid that path, and timeout below as a
// final safety net.
const SIGN_IN_TIMEOUT_MS = 12000

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [resetSent, setResetSent] = useState(false)

  // If already signed in, jump to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [loading, user, navigate])

  async function handleSignIn(e) {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setSubmitting(true)

    // Clear any stale supabase-js auth state before attempting sign-in.
    // Without this, a previous wedged/revoked session in localStorage can
    // make signInWithPassword hang during its internal cleanup, leaving
    // the button stuck on "Signing in…" forever.
    await clearAllAuthState()

    try {
      const { error: signInErr } = await withTimeout(
        () =>
          supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          }),
        SIGN_IN_TIMEOUT_MS,
        'Sign-in',
      )
      if (signInErr) {
        setError("Those credentials didn't work — try again?")
        setSubmitting(false)
        return
      }
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      // Timeout (or unexpected throw). Clear state again so the next
      // attempt is also clean, and surface a clear retry message.
      console.warn('Sign-in failed:', err)
      await clearAllAuthState()
      setError(
        "Sign-in didn't complete. Please refresh the page and try again. If it keeps happening, let Josh know.",
      )
      setSubmitting(false)
    }
  }

  async function handleSendReset(e) {
    e.preventDefault()
    setError(null)
    setResetSent(false)
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !EMAIL_RX.test(trimmed)) {
      setError('Please enter the email address on your account.')
      return
    }
    setSubmitting(true)
    // We don't pass redirectTo — the live recovery email template should
    // hard-code the /set-password URL with TokenHash, same way as the
    // invite template does. (See docs/supabase_recovery_email_template.html.)
    const { error: rErr } = await supabase.auth.resetPasswordForEmail(trimmed)
    setSubmitting(false)
    // Always show the same message regardless of whether the email exists,
    // to avoid leaking which addresses have accounts.
    if (rErr && !/security|rate/i.test(rErr.message || '')) {
      console.warn('resetPasswordForEmail error', rErr)
    }
    setResetSent(true)
  }

  function switchMode(next) {
    setMode(next)
    setError(null)
    setResetSent(false)
    setPassword('')
  }

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-[540px] bg-white rounded-2xl shadow-card p-6 sm:p-8">
        {mode === 'signin' ? (
          <>
            <h1 className="text-[28px] font-bold leading-tight mb-2">Sign in</h1>
            <p className="text-[14px] text-slate-500 mb-6">
              Researcher and admin access.
            </p>

            <form onSubmit={handleSignIn} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[14px] font-medium text-slate-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-[14px] font-medium text-slate-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white disabled:opacity-60"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="text-[14px] text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[16px] rounded-full px-8 py-4 min-h-[52px] transition-colors"
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="text-[13px] text-slate-500 mt-4 text-center">
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="text-ctac-teal-700 hover:text-ctac-teal-900 underline"
              >
                Forgot your password?
              </button>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-[28px] font-bold leading-tight mb-2">Reset your password</h1>
            <p className="text-[14px] text-slate-500 mb-6">
              We&apos;ll email you a link to set a new password.
            </p>

            {resetSent ? (
              <div role="status" className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-[14px]">
                  <CheckCircle2 size={16} strokeWidth={2} />
                  Check your email. If an account exists for that address, a
                  reset link is on its way.
                </div>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  The link will expire in about an hour. If you don&apos;t see
                  it, check your Junk folder.
                </p>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-ctac-teal-700 hover:text-ctac-teal-900 underline text-[14px]"
                >
                  ← Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendReset} noValidate className="space-y-5">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-[14px] font-medium text-slate-700 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white disabled:opacity-60"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="text-[14px] text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[16px] rounded-full px-8 py-4 min-h-[52px] transition-colors"
                >
                  {submitting ? 'Sending…' : 'Send reset link'}
                </button>

                <p className="text-[13px] text-slate-500 text-center">
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="text-ctac-teal-700 hover:text-ctac-teal-900 underline"
                  >
                    ← Back to sign in
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  )
}
