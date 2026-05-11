import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { clearAllAuthState, hardClearLocalAuthStorage, withTimeout } from '../lib/authReset.js'

const AuthContext = createContext(null)

// If no auth event arrives within this window, assume supabase-js is wedged
// (offline refresh hang, broken localStorage state, revoked refresh token
// that's silently failing) and force a clean logged-out state so the user
// at least sees the login form. Empirically, a healthy boot fires
// INITIAL_SESSION in well under a second.
const WATCHDOG_MS = 5000

// If fetchRole takes longer than this, treat it as a wedged auth state
// machine and recover. user_roles is a tiny table behind a fast index;
// 4s is generous.
const ROLE_FETCH_TIMEOUT_MS = 4000

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

  // Use a ref to dedupe concurrent role fetches when supabase-js fires
  // multiple events in quick succession (e.g. INITIAL_SESSION + TOKEN_REFRESHED
  // for the same user). Otherwise we re-flash loading=true unnecessarily.
  const lastHandledUserId = useRef(null)

  useEffect(() => {
    let cancelled = false
    let watchdog = null

    // Following the supabase-js recommended pattern: subscribe FIRST, then
    // let INITIAL_SESSION drive bootstrap. Do NOT also call getSession() —
    // the two paths race each other and that's what was wedging the page.
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return

      // We got an event — the watchdog can stand down.
      if (watchdog) {
        clearTimeout(watchdog)
        watchdog = null
      }

      const sessionUser = session?.user ?? null

      if (!sessionUser) {
        lastHandledUserId.current = null
        setUser(null)
        setRole(null)
        setLoading(false)
        return
      }

      // Same user we already resolved — just keep state as-is and make sure
      // loading is false. Avoids the loading→ready→loading flicker on
      // TOKEN_REFRESHED.
      if (lastHandledUserId.current === sessionUser.id && event !== 'SIGNED_IN') {
        setLoading(false)
        return
      }
      lastHandledUserId.current = sessionUser.id

      setUser(sessionUser)
      let hadError = false
      try {
        const result = await withTimeout(
          () => fetchRole(sessionUser.id),
          ROLE_FETCH_TIMEOUT_MS,
          'fetchRole',
        )
        hadError = !!result?.hadError
      } catch (err) {
        // Either fetchRole threw, OR our 4s timeout fired because the
        // supabase auth state machine is wedged and the REST call is
        // sitting waiting for a token that never arrives.
        console.warn('Auth: fetchRole failed/timed out:', err)
        hadError = true
      }
      if (cancelled) return

      if (hadError) {
        // Stale / revoked token OR wedged supabase-js state. Best-effort
        // recovery: nuke local state so the user lands on the login form.
        console.warn('Auth: clearing state after role-fetch failure.')
        await clearAllAuthState()
        if (cancelled) return
        lastHandledUserId.current = null
        setUser(null)
        setRole(null)
      }
      setLoading(false)
    })

    // Watchdog. If supabase-js never fires an event (very rare, but it
    // happens — e.g. if its async storage adapter throws or a refresh hangs
    // without rejecting), we'd otherwise sit on Loading… forever. After 5s
    // assume the worst and force the user out to the login form.
    watchdog = setTimeout(async () => {
      if (cancelled) return
      console.warn('Auth watchdog tripped — no auth event in', WATCHDOG_MS, 'ms.')
      await clearAllAuthState()
      if (cancelled) return
      lastHandledUserId.current = null
      setUser(null)
      setRole(null)
      setLoading(false)
    }, WATCHDOG_MS)

    return () => {
      cancelled = true
      if (watchdog) clearTimeout(watchdog)
      sub?.subscription?.unsubscribe()
    }
  }, [fetchRole])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    lastHandledUserId.current = null
    setUser(null)
    setRole(null)
    navigate('/admin', { replace: true })
  }, [navigate])

  // Exposed for the "Stuck? Reset session" button on the loading screen.
  // This MUST never hang — its whole purpose is to escape a wedged state.
  // So we deliberately do NOT await supabase.auth.signOut (which is one
  // of the things that hangs in the wedged case). We just nuke the
  // localStorage auth keys synchronously and force a hard reload; any
  // in-flight supabase-js promises are abandoned by the page unload.
  const resetAndReload = useCallback(() => {
    hardClearLocalAuthStorage()
    window.location.replace('/admin')
  }, [])

  const value = { user, role, loading, signOut, resetAndReload }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return ctx
}
