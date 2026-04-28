import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRole = useCallback(async (userId) => {
    if (!userId) {
      setRole(null)
      return null
    }
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to fetch user role:', error)
      setRole(null)
      return null
    }

    // Pick the strongest role (admin beats researcher)
    const roles = (data || []).map((r) => r.role)
    const resolved = roles.includes('admin')
      ? 'admin'
      : roles.includes('researcher')
        ? 'researcher'
        : null
    setRole(resolved)
    return resolved
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data?.session?.user ?? null
      if (cancelled) return
      setUser(sessionUser)
      if (sessionUser) {
        await fetchRole(sessionUser.id)
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
