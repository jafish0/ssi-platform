// /set-password — landing page for invite-by-email and password-recovery links.
//
// IMPORTANT (Microsoft Safe Links gotcha — see INFRASTRUCTURE.md):
// Outlook / Defender Safe Links pre-fetches every link in external email to
// scan it for malicious content. If we called supabase.auth.verifyOtp() on
// mount, the pre-fetch would CONSUME the one-time-use token and the real
// human's click would arrive with an already-expired OTP.
//
// To stay safe to pre-fetch, this route does NOT call any auth API on mount.
// It only renders a static "Welcome — click to continue" screen. verifyOtp
// runs only when the user clicks the button. From there we collect a
// password and call updateUser.

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react'
import LogoStrip from '../components/LogoStrip.jsx'
import { supabase } from '../lib/supabase.js'

const PASSWORD_MIN = 12

function validatePassword(pw) {
  if (!pw || pw.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters.`
  }
  if (!/[A-Za-z]/.test(pw)) return 'Password must contain at least one letter.'
  if (!/\d/.test(pw)) return 'Password must contain at least one number.'
  return null
}

export default function SetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  // Read the OTP params from the URL ON MOUNT but do NOT verify them yet.
  const tokenHash = params.get('token_hash')
  const linkType = params.get('type') || 'invite'

  // Stage:
  //   'idle'      — show welcome + Continue button (Safe Links–safe)
  //   'verifying' — verifyOtp in flight after user click
  //   'verified'  — show password form
  //   'saving'    — updateUser in flight
  //   'done'      — redirected to /admin/dashboard
  //   'error'     — terminal failure
  const [stage, setStage] = useState('idle')
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [pwError, setPwError] = useState(null)

  const linkLooksValid = useMemo(() => Boolean(tokenHash), [tokenHash])

  useEffect(() => {
    // Friendly note for the missing-params case — but no API calls, so
    // pre-fetching a malformed link is harmless.
    if (!linkLooksValid) {
      setError(
        "This link doesn't have the information we need. Please use the most recent link from your email, or ask the person who invited you to send a new one.",
      )
    }
  }, [linkLooksValid])

  async function handleContinue() {
    if (!tokenHash) return
    setStage('verifying')
    setError(null)
    const { data, error: vErr } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: linkType,
    })
    if (vErr) {
      console.warn('verifyOtp failed', vErr)
      // Most common: 'Token has expired or is invalid' from a previously-used
      // or aged-out link. Leave the user with a clear next step.
      setError(
        "This invitation link can't be used anymore. It may have already been used, expired, or been pre-scanned by your email security. Ask whoever invited you to send a new one.",
      )
      setStage('error')
      return
    }
    setEmail(data?.user?.email || '')
    setStage('verified')
  }

  async function handleSetPassword(e) {
    e.preventDefault()
    setPwError(null)
    const v = validatePassword(pw)
    if (v) {
      setPwError(v)
      return
    }
    if (pw !== pw2) {
      setPwError("Those passwords don't match.")
      return
    }
    setStage('saving')
    const { error: uErr } = await supabase.auth.updateUser({ password: pw })
    if (uErr) {
      setPwError(uErr.message || 'Could not save password. Try again.')
      setStage('verified')
      return
    }
    setStage('done')
    // The user is already signed in via the verifyOtp call above — go
    // straight to the admin dashboard.
    setTimeout(() => navigate('/admin/dashboard', { replace: true }), 250)
  }

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-[520px]">
        <LogoStrip variant="full" />
        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
          {stage === 'error' || (stage === 'idle' && !linkLooksValid) ? (
            <div role="alert">
              <div className="flex items-center gap-2 mb-3 text-rose-600">
                <AlertTriangle size={18} strokeWidth={2} />
                <h1 className="text-[20px] font-semibold">Link unavailable</h1>
              </div>
              <p className="text-[15px] leading-relaxed text-slate-700 mb-6">
                {error}
              </p>
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold rounded-full px-5 py-2 min-h-[44px]"
              >
                Go to sign in
              </Link>
            </div>
          ) : stage === 'idle' ? (
            // Safe-Links-safe welcome screen. NO API calls until user clicks.
            <>
              <div className="flex items-center gap-2 mb-3 text-amber-700">
                <KeyRound size={20} strokeWidth={1.5} />
                <h1 className="text-[24px] font-bold leading-tight text-slate-800">
                  Welcome to the SSI Platform
                </h1>
              </div>
              <p className="text-[16px] leading-relaxed text-slate-700 mb-6">
                You&apos;ve been invited as an admin. Click the button below to
                continue and set your password.
              </p>
              <button
                type="button"
                onClick={handleContinue}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[16px] rounded-full px-8 py-4 min-h-[52px]"
              >
                Continue
              </button>
              <p className="text-[12px] text-slate-500 mt-4 leading-relaxed">
                Already have an account?{' '}
                <Link to="/admin" className="text-amber-700 hover:text-amber-900 underline">
                  Sign in here
                </Link>
                .
              </p>
            </>
          ) : stage === 'verifying' ? (
            <p className="text-[14px] text-slate-500 italic text-center py-8">
              Verifying your invitation…
            </p>
          ) : stage === 'done' ? (
            <div className="text-center py-6">
              <CheckCircle2
                size={36}
                strokeWidth={1.5}
                className="text-emerald-500 mx-auto mb-3"
              />
              <h2 className="text-[20px] font-semibold mb-2">All set</h2>
              <p className="text-[15px] text-slate-700">
                Taking you to the admin dashboard…
              </p>
            </div>
          ) : (
            // verified or saving — password form
            <form onSubmit={handleSetPassword} noValidate>
              <h1 className="text-[24px] font-bold leading-tight text-slate-800 mb-2">
                Set your password
              </h1>
              {email && (
                <p className="text-[14px] text-slate-500 mb-5">
                  Account: <span className="font-medium text-slate-700">{email}</span>
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="pw"
                    className="block text-[14px] font-medium text-slate-700 mb-2"
                  >
                    New password
                  </label>
                  <input
                    id="pw"
                    type="password"
                    autoComplete="new-password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    disabled={stage === 'saving'}
                    minLength={PASSWORD_MIN}
                    className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <label
                    htmlFor="pw2"
                    className="block text-[14px] font-medium text-slate-700 mb-2"
                  >
                    Confirm password
                  </label>
                  <input
                    id="pw2"
                    type="password"
                    autoComplete="new-password"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    disabled={stage === 'saving'}
                    className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white disabled:opacity-60"
                  />
                </div>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  At least {PASSWORD_MIN} characters, including a letter and a number.
                </p>
              </div>

              {pwError && (
                <div
                  role="alert"
                  className="mt-4 text-[14px] text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3"
                >
                  {pwError}
                </div>
              )}

              <button
                type="submit"
                disabled={stage === 'saving'}
                className="w-full mt-5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold text-[16px] rounded-full px-8 py-4 min-h-[52px]"
              >
                {stage === 'saving' ? 'Saving…' : 'Save & sign in'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
