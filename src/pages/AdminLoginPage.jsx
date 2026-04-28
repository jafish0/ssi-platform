import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // If already signed in, jump to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [loading, user, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setSubmitting(true)
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (signInErr) {
      setError("Those credentials didn't work — try again?")
      setSubmitting(false)
      return
    }
    navigate('/admin/dashboard', { replace: true })
  }

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-[540px] bg-white rounded-2xl shadow-card p-6 sm:p-8">
        <h1 className="text-[28px] font-bold leading-tight mb-2">Sign in</h1>
        <p className="text-[14px] text-slate-500 mb-6">
          Researcher and admin access.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
              className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white disabled:opacity-60"
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
              className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white disabled:opacity-60"
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
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[16px] rounded-full px-8 py-4 min-h-[52px] transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
