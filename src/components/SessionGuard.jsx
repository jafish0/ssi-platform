import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { callEdgeFunction } from '../lib/api.js'

export default function SessionGuard({ children }) {
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const [state, setState] = useState({ status: 'checking', session: null })

  useEffect(() => {
    let cancelled = false
    const stored = sessionStorage.getItem('session_id')

    if (!sessionId || !stored || stored !== sessionId) {
      sessionStorage.removeItem('session_id')
      navigate('/', { replace: true })
      return () => {
        cancelled = true
      }
    }

    callEdgeFunction('get-session', { session_id: sessionId })
      .then((data) => {
        if (cancelled) return
        if (!data || data.status === 'abandoned') {
          sessionStorage.removeItem('session_id')
          navigate('/', { replace: true })
          return
        }
        setState({ status: 'ok', session: data })
      })
      .catch(() => {
        if (cancelled) return
        sessionStorage.removeItem('session_id')
        navigate('/', { replace: true })
      })

    return () => {
      cancelled = true
    }
  }, [sessionId, navigate])

  if (state.status === 'checking') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-500 text-[14px]">Loading…</p>
      </main>
    )
  }

  return typeof children === 'function' ? children(state.session) : children
}
