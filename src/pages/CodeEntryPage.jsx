import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { callEdgeFunction } from '../lib/api.js'
import LogoStrip from '../components/LogoStrip.jsx'

const ERROR_MESSAGES = {
  invalid_code: "That code didn't work — try again?",
  expired_code: 'That code has expired.',
  exhausted_code: 'That code has already been used.',
  inactive_code: "That code isn't active right now.",
  inactive_intervention: "This program isn't open yet.",
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

  // Auto-submit if a code was provided in the URL
  useEffect(() => {
    const urlCode = params.get('code')
    if (urlCode && !submitting) {
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
              placeholder="e.g. TEST-RSD-001"
              className="w-full text-[16px] font-mono tracking-wider px-4 py-3 min-h-[52px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white disabled:opacity-60"
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
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[16px] rounded-full px-8 py-4 min-h-[52px] transition-colors"
          >
            {submitting ? 'One moment…' : "Let's go"}
          </button>
        </form>

        <p className="text-[13px] text-slate-500 mt-6">
          Researcher or admin?{' '}
          <a
            href="/admin"
            className="text-amber-700 hover:text-amber-900 underline"
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
