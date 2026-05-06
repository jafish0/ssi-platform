import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

// How long to wait for `getSession()` before assuming the local auth state
// is wedged (stale refresh token, network blip, etc.) and forcing a clean
// recovery. supabase-js caches sessions in localStorage but if it tries to
// refresh and that hangs, the whole AuthProvider stays loading=true and the
// admin pages get stuck on a "Loading…" screen — exactly the bug we're
// trying to fix.
const BOOTSTRAP_TIMEOUT_MS = 5000

async function getSessionWithTimeout() {
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve({ __timedOut: true }), BOOTSTRAP_TIMEOUT_MS)
  })
  const result = await Promise.race([supabase.auth.getSession(), timeoutPromise])
  if (result?.__timedOut) {
    return { timedOut: true, session: null }
  }
  return { timedOut: false, session: result?.data?.session ?? null }
}

async function clearLocalSession() {
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch (err) {
    console.warn('Local signOut failed (ignored):', err)
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // fetchRole returns { role, hadError } so callers can distinguish "no role
  // assigned" (legitimate) from "query failed" (likely auth/RLS issue).
  const fetchRole = useCallback(async (userId) => {
    if (!userId) {
      setRole(null)
      return { role: null, hadError: false }
    }
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (error) {
      console.warn('Failed to fetch user role:', error)
      setRole(null)
      return { role: null, hadError: true }
    }

    const roles = (data || []).map((r) => r.role)
    const resolved = roles.includes('admin')
      ? 'admin'
      : roles.includes('researcher')
        ? 'researcher'
        : null
    setRole(resolved)
    return { role: resolved, hadError: false }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      let session
      try {
        const result = await getSessionWithTimeout()
        if (result.timedOut) {
          console.warn('Auth bootstrap: getSession timed out, clearing local session.')
          await clearLocalSession()
          session = null
        } else {
          session = result.session
        }
      } catch (err) {
        console.warn('Auth bootstrap threw, clearing local session:', err)
        await clearLocalSession()
        session = null
      }

      if (cancelled) return
      const sessionUser = session?.user ?? null
      setUser(sessionUser)

      if (sessionUser) {
        const { hadError } = await fetchRole(sessionUser.id)
        if (cancelled) return
        if (hadError) {
          // Likely a stale token rejected by RLS — bail out cleanly so the
          // user can re-login instead of getting stuck on Loading…
          console.warn('Auth bootstrap: role fetch failed, clearing local session.')
          await clearLocalSession()
          setUser(null)
          setRole(null)
        }
      } else {
        setRole(null)
      }
      if (!cancelled) setLoading(false)
    }

    bootstrap()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null
      setUser(sessionUser)
      if (sessionUser) {
        await fetchRole(sessionUser.id)
      } else {
        setRole(null)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
      sub?.subscription?.unsubscribe()
    }
  }, [fetchRole])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    navigate('/admin', { replace: true })
  }, [navigate])

  const value = { user, role, loading, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return ctx
}
