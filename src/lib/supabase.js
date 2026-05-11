import { createClient } from '@supabase/supabase-js'

// auth.lock: supabase-js defaults to using navigator.locks to coordinate
// auth state changes across tabs. This is great for apps where the same
// user might have many tabs open and we need refresh-token rotation to
// happen exactly once — but it's also a known source of wedging when
// the lock state gets stuck (a prior tab crashed mid-acquire, browser
// quirks, etc.). Symptoms in our case:
//   - signInWithPassword hangs on second+ visits (lock held during
//     internal session cleanup)
//   - any authenticated REST call hangs after sign-in (every REST call
//     awaits the auth state machine for a current access_token; if the
//     lock is contended, the REST call sits forever)
//   - even signOut({scope:'local'}) hangs, so the in-app "Reset session"
//     button itself can wedge.
//
// This is an admin app — one user per browser, usually one tab. We don't
// need cross-tab synchronisation; we much prefer the calls to just resolve.
// Pass-through lock function = no locking at all.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      lock: (_name, _acquireTimeout, fn) => fn(),
    },
  },
)
