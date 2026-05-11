// Shared auth-state-reset primitive used by:
//   - AuthContext bootstrap watchdog (when no event arrives in 5s)
//   - AuthContext role-fetch-error recovery (when a "valid" session is
//     rejected by RLS on its first authenticated call)
//   - AuthContext.resetAndReload() — the in-app "Reset session" button
//   - AdminLoginPage.handleSignIn — called BEFORE every sign-in attempt
//     so we never hand supabase-js a polluted starting state.
//
// Why this exists: supabase-js's signInWithPassword does its own
// best-effort cleanup of any existing session in localStorage before
// processing new credentials. When that cleanup hangs (network blip on
// the refresh-token revoke call, navigator.locks contention from a
// previous wedged tab, etc.), the whole signInWithPassword promise
// never resolves and the button sits on "Signing in…" forever.
// Clearing storage by hand BEFORE calling signInWithPassword eliminates
// the path that hangs.

import { supabase } from './supabase.js'

export async function clearAllAuthState() {
  // First ask supabase-js to clean up properly (revoke refresh token,
  // clear its own storage). scope:'local' so we don't hit the network —
  // when this is called we already suspect the network/auth is unreliable.
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch (err) {
    console.warn('signOut(local) failed (ignored):', err)
  }
  // Belt-and-suspenders: if supabase-js's own teardown didn't run for
  // some reason (race, storage lock contention, broken adapter), nuke
  // any sb-*-auth-token keys by hand. Safe to run even when there's
  // nothing to clear.
  try {
    if (typeof localStorage !== 'undefined') {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && /^sb-.*-auth-token/.test(k)) keys.push(k)
      }
      keys.forEach((k) => localStorage.removeItem(k))
    }
  } catch (err) {
    console.warn('manual localStorage cleanup failed (ignored):', err)
  }
}

// Run `fn()` and reject if it takes longer than `ms`. Used by the sign-in
// flow so a hung supabase-js call can't sit on "Signing in…" forever.
export function withTimeout(fn, ms, label = 'operation') {
  return new Promise((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error(`${label} timed out after ${ms}ms`))
    }, ms)
    Promise.resolve()
      .then(fn)
      .then(
        (v) => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          resolve(v)
        },
        (err) => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          reject(err)
        },
      )
  })
}
