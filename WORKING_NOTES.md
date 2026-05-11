# Working Notes — RSD (Ready! Set! Dedicate!)

A bidirectional scratchpad shared between Josh, Claude Cowork (Claude desktop chat, used for thinking through ideas), and Claude Code (CLI, used for implementation).

> Both Claude Cowork and Claude Code should read this file when starting a session in this repo.
>
> **Append-only conventions:**
> - "Recently shipped" — newest at top. One bullet per commit, with hash + date + one-line summary. Claude Code updates this after each push.
> - "Ideas / drafts" — drop polished prompts here for the next Claude Code session, or rough ideas you want Claude Cowork to help you refine. No deletion needed; once a draft ships, move it (verbatim) into "Recently shipped" so the history stays intact.

---

## ⬇ Recently shipped (Claude Code → Claude Cowork)

> What's been built recently, so Claude Cowork has the running context without re-reading the entire git log.

- **`2dfc310` · 2026-05-11** — Auth, third pass (and hopefully the real root cause). After signing in successfully, the dashboard hung on Loading and the "Reset session" button itself didn't respond to clicks. Root cause: supabase-js's `auth.lock` (navigator.locks-based) gets contested and hangs *every* subsequent authenticated call — both the `user_roles` SELECT in `fetchRole` (so AuthContext never flips `loading=false`) and `supabase.auth.signOut` (so the Reset button can't clean up). Three fixes: (a) `src/lib/supabase.js` passes a pass-through lock function to disable navigator.locks entirely — overkill for a single-user admin app; (b) `fetchRole` is now wrapped in a 4s timeout; (c) `resetAndReload` is now synchronous and bypasses `supabase.auth.signOut` entirely — it just removes `sb-*-auth-token` from localStorage and hard-reloads. The Reset button can never hang.
- **`761b827` · 2026-05-11** — Auth follow-up: the page-load race fix in `4e60c77` left the actual sign-in attempt unprotected. User reported the button still hangs on "Signing in…" on second+ visits in both Chrome and Edge. Root cause: supabase-js's `signInWithPassword` does its own best-effort cleanup of any existing session in localStorage before processing new credentials; when that cleanup hangs (revoke-call network blip, navigator.locks contention from a prior wedged session), the whole promise never resolves. New `src/lib/authReset.js` exports `clearAllAuthState()` + `withTimeout()` (extracted from AuthContext). `AdminLoginPage.handleSignIn` now calls `clearAllAuthState()` BEFORE `signInWithPassword`, and wraps the call in a 12s timeout so it can't hang silently — on timeout we re-clear state and surface a clear retry message.
- **`4e60c77` · 2026-05-11** — Auth bootstrap rewrite to actually fix the recurring "have to clear site data to log in" bug. Root cause: `AuthContext` was calling both `getSession()` and registering `onAuthStateChange` in the same tick, racing against each other (supabase-js fires `INITIAL_SESSION` synchronously on subscription). The two paths called `fetchRole + setLoading(false)` independently in non-deterministic order, occasionally wedging on `Loading…` forever. Fix follows the supabase-recommended pattern: use ONLY `onAuthStateChange` as source of truth, dedupe by `user_id` so `TOKEN_REFRESHED` doesn't re-flash loading, 5s watchdog forces clean logged-out state if no event arrives, and ProtectedRoute's loading screen now shows a "Reset session & sign in" button after 6s as an in-app escape hatch.
- **`f5a2662` · 2026-05-11** — Hotfix: `/admin/feedback` was crashing with a TDZ error (`Cannot access '_' before initialization`) because `downloadSpreadsheet` was declared above `filtered` while referencing it in its useCallback deps. Moved it below `filtered` + `counts`. Likely also resolves the "have to clear site data to log in" symptom — when the Feedback page crashed mid-render, React unmounted the whole tree, so any tab with `/admin/feedback` in history looked blank on reload.
- **`9c57519` · 2026-05-11** — Feedback system: activity versions + CSV download. New `src/lib/activityVersions.js` is the source of truth for sandbox-activity versions (all 6 RSD activities at v1.0); convention documented in `CLAUDE.md` (bump in the same commit as the activity change). `public.feedback.activity_version` column + edge fn v3 capture which version each comment is about. Version badge shown on the sandbox page (so testers see what they're poking at) and in the admin table + expanded detail. New "Download CSV" button on `/admin/feedback` exports the currently filtered rows as `feedback-<filter>-YYYY-MM-DD.csv` (12 columns including `activity_version`).
- **`c959174` · 2026-05-10** — Added `STATE_OF_THE_PLATFORM.md` — accurate live snapshot (Supabase tables + row counts + RLS, all 11 edge functions, migrations, recent commits, repo layout, Vercel/domain/email pipeline, Qualtrics integration, deferred work) framed for the CTAC-apps-consolidation decision (status quo vs shared Supabase vs single mega-app).
- **`cdbd78c` · 2026-05-08** — Added Stephanie to the feedback submitter roster (FeedbackButton dropdown + AdminFeedbackPage labels + `submit-feedback` edge function allow-list + `public.feedback.submitter` CHECK constraint).
- **`0287706` · 2026-05-08** — Feedback collection on the public demo. New `public.feedback` table (admin-only RLS) + `submit-feedback` edge function (anon, validates roster + category + message). Persistent **Give feedback** button in `DemoPageLayout` auto-fills "Where you are" from the route. Admin review at `/admin/feedback` (filter by status/category, expand row to triage status `new → acknowledged → addressed | declined` and edit `admin_notes` inline). New Feedback nav item in AdminLayout (admin-only). INFRASTRUCTURE.md change-log updated.

---

## ⬆ Ideas / drafts for the next Claude Code session (Claude Cowork → Claude Code)

> Drop polished prompts here for the next Claude Code session to pick up. When Josh starts a new session with Claude Code, he'll say "read WORKING_NOTES.md, the latest draft is at the bottom" and Claude Code will work from there. Drafts can also be rough — Claude Cowork can help refine them in place before handing off.

<!-- Add new drafts BELOW this line, newest at the bottom so Claude Code works through them in submission order. -->

_(none yet — Claude Cowork, drop drafts here)_

---
