import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { callEdgeFunction } from '../lib/api.js'
import LogoStrip from '../components/LogoStrip.jsx'

// Every message ends with a concrete next step a kid can act on (Draft 68
// Part E — "kid-friendly and says what to do next").
const ERROR_MESSAGES = {
  invalid_code: "That code didn't work — check it and try again? Codes look like the one on your link.",
  expired_code: 'That code has expired. Ask your caregiver to help you get a new one.',
  exhausted_code: 'That code has already been used. If that was you and you got interrupted, ask your caregiver to help you get a new code.',
  inactive_code: "That code isn't active right now. Ask your caregiver to check on it.",
  inactive_intervention: "This program isn't open yet. Check back soon, or ask your caregiver.",
  unpublished_intervention: "This program isn't ready yet — check back soon.",
}

function messageForError(err) {
  if (!err) return 'Something went wrong — try again in a moment?'
  if (err.code && ERROR_MESSAGES[err.code]) return ERROR_MESSAGES[err.code]
  if (err.message && err.message.length < 120) return err.message
  return "That didn't work — try again?"
}

export default function CodeEntryPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [code, setCode] = useState(params.get('code') || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Auto-submit if a code was provided in the URL. Ref-guarded (Draft 75
  // fix): the `!submitting` state check can't stop a double-fire because
  // the state hasn't flushed between StrictMode's dev double-effect runs —
  // two racing validate-code calls each minted a session (caught in QA:
  // two sessions 21ms apart on a single-use code). A ref is synchronous.
  const autoSubmittedRef = useRef(false)
  useEffect(() => {
    const urlCode = params.get('code')
    if (urlCode && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true
      submit(urlCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit(rawCode) {
    const trimmed = (rawCode || '').trim()
    if (!trimmed) {
      setError({ message: 'Please enter your code.' })
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const data = await callEdgeFunction('validate-code', { code: trimmed })
      if (!data?.session_id) {
        throw new Error('No session returned.')
      }
      sessionStorage.setItem('session_id', data.session_id)
      // Resume-by-code (Draft 69): a single-use code with an existing
      // in-progress session returns that session with resumed: true —
      // flag it so the delivery page can greet the participant instead
      // of silently teleporting them mid-flow. Draft 88: 'exited'
      // sessions (rule-based early exit, e.g. assent "No") resume the
      // same way — the engine flips them back to in_progress.
      if (data.resumed && ['in_progress', 'exited'].includes(data.session_status)) {
        sessionStorage.setItem('resumed_notice', '1')
      } else {
        // Draft 93: the splash screen is first-start only — flag a
        // genuinely new session (not a resume) so DeliveryShellPage shows
        // it before the normal flow, then clears the flag once Begin is
        // clicked. Keyed by session_id, same spirit as `resumed_notice`.
        sessionStorage.setItem(`splash_pending_${data.session_id}`, '1')
      }
      navigate(`/session/${data.session_id}`, { replace: true })
    } catch (err) {
      setError(err)
      setSubmitting(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    submit(code)
  }

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-[540px]">
        <LogoStrip variant="full" />
        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
        <h1 className="text-[28px] font-bold leading-tight mb-3">
          Welcome
        </h1>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-6">
          Enter the code you were given and we&apos;ll get started — at your
          pace.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="code"
              className="block text-[14px] font-medium text-slate-700 mb-2"
            >
              Your access code
            </label>
            <input
              id="code"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={submitting}
              placeholder="e.g. RSD-XXXX-0000"
              className="w-full text-[16px] font-mono tracking-wider px-4 py-3 min-h-[52px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white disabled:opacity-60"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="text-[14px] text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3"
            >
              {messageForError(error)}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[16px] rounded-full px-8 py-4 min-h-[52px] transition-colors"
          >
            {submitting ? 'One moment…' : "Let's go"}
          </button>
        </form>

        <p className="text-[13px] text-slate-500 mt-6">
          Researcher or admin?{' '}
          <a
            href="/admin"
            className="text-ctac-teal-700 hover:text-ctac-teal-900 underline"
          >
            Sign in here
          </a>
          .
        </p>
        </div>
      </div>
    </main>
  )
}
