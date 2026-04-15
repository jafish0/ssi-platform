# SSI Platform — Phase 0 Execution Checklist
**Document:** 003_phase0_execution_checklist.md  
**Status:** Ready to execute — awaiting desktop session  
**Last Updated:** April 2026

This is the single working document for Phase 0. Work top to bottom. Each step is either 
a Claude Code task (we build it together) or an architect decision (you confirm, we proceed).

---

## Artifacts Ready to Go
- `001_ssi_platform_schema.sql` — complete database migration, ready to apply
- `002_item_type_schemas_v2.md` — all 8 item types specced (+ custom_activity escape hatch to be rolled in as v3)

---

## Phase 0 Goal
Establish the schema, project infrastructure, and auth. Nothing rendered to participants yet,
but everything else will be built on top of this. Produces a testable scaffold with:
- Live Supabase database with all tables, RLS, and seed data
- React app deployed on Vercel with routing structure
- Working auth: participant code entry + researcher/admin login
- Dev/staging/production environment config

---

## Step 1 — Supabase Project Setup

### 1a. Create Supabase project
- [ ] Use Supabase connector to create new project
- [ ] Name: `ssi-platform`
- [ ] Region: us-east-1 (or closest to study population)
- [ ] Note project URL and anon key for env config

### 1b. Apply schema migration
- [ ] Open Supabase SQL Editor
- [ ] Paste and run `001_ssi_platform_schema.sql`
- [ ] Verify all 9 tables created: `interventions`, `intervention_versions`, `sections`, `items`, `access_codes`, `sessions`, `responses`, `scheduled_messages`, `user_roles`
- [ ] Verify seed data: `ready-set-dedicate` row exists in `interventions`
- [ ] Verify RLS enabled on all tables
- [ ] Verify indexes created

### 1c. Create first admin user
- [ ] In Supabase Auth > Users, create admin account (your email)
- [ ] In SQL Editor, insert admin role:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<your-user-uuid>', 'admin');
```

### 1d. Confirm RLS is working
- [ ] Run a SELECT on `interventions` as anon — should return 0 rows
- [ ] Run a SELECT as your admin user — should return the seeded row

**Architect checkpoint:** Confirm schema looks right in Supabase Table Editor before proceeding.

---

## Step 2 — React App Scaffold

### 2a. Create React project
- [ ] `npm create vite@latest ssi-platform -- --template react`
- [ ] `cd ssi-platform && npm install`
- [ ] Install core dependencies:
```bash
npm install @supabase/supabase-js react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2b. Environment configuration
- [ ] Create `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
- [ ] Create `.env.staging` and `.env.production` (same keys, different project values later)
- [ ] Add `.env*.local` to `.gitignore`

### 2c. Supabase client setup
- [ ] Create `src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### 2d. Routing structure
Two parallel app trees sharing one codebase:

```
/                          → Participant landing (code entry)
/session/:sessionId        → Delivery app shell
/session/:sessionId/step   → Active intervention step

/admin                     → Admin login
/admin/dashboard           → Researcher dashboard
/admin/interventions       → Intervention list (admin only)
/admin/interventions/:id   → Builder (admin only)
/admin/codes               → Access code management
```

- [ ] Implement routing with `react-router-dom`
- [ ] Create stub page components for every route (empty screens with route label)
- [ ] Confirm navigation between all routes works locally

### 2e. Tailwind setup
- [ ] Configure `tailwind.config.js` with content paths
- [ ] Add amber palette as primary (per RSD design system)
- [ ] Confirm Tailwind classes rendering in browser

**Architect checkpoint:** Review routing structure — confirm all routes make sense before we build auth on top of them.

---

## Step 3 — Auth Implementation

### 3a. Participant code entry flow
Flow: Landing page → code entry → validation → session creation → delivery app

- [ ] Build `CodeEntryPage` component
  - Text input for access code (or pre-filled from URL param)
  - Validate button
  - Error states: invalid code, expired code, inactive intervention
- [ ] Build `validateCode` service function
  - Queries `access_codes` table via service role (Edge Function or API route)
  - Checks: code exists, not expired, `max_uses` not exceeded, intervention `is_active`
  - On success: creates `sessions` row, increments `use_count`, returns `session_id`
- [ ] Store `session_id` in `sessionStorage`
- [ ] Redirect to `/session/:sessionId`

**Note:** Participant writes (session create, response upsert) use the Supabase service role
key via a server-side route — never the anon key client-side. This is the trust boundary.

### 3b. Researcher / Admin login
Flow: `/admin` login page → Supabase Auth → role check → dashboard or builder

- [ ] Build `AdminLoginPage` component
  - Email + password form
  - Supabase Auth `signInWithPassword`
  - Error handling: invalid credentials, unconfirmed email
- [ ] Build `AuthProvider` context
  - Wraps admin routes
  - Listens to `supabase.auth.onAuthStateChange`
  - Fetches user role from `user_roles` table on login
  - Exposes `user`, `role`, `loading` to child components
- [ ] Build `ProtectedRoute` component
  - Redirects unauthenticated users to `/admin`
  - Redirects researchers away from admin-only routes
- [ ] Apply `ProtectedRoute` to all `/admin/*` routes

### 3c. Session guard for delivery app
- [ ] Build `SessionGuard` component
  - Reads `session_id` from `sessionStorage`
  - Validates session exists and is `in_progress` (via API call)
  - Redirects to `/` if no valid session found
- [ ] Apply `SessionGuard` to all `/session/*` routes

**Architect checkpoint:** Review auth flows end-to-end before we add any content rendering.

---

## Step 4 — Vercel Deployment

### 4a. Initialize Vercel project
- [ ] Use Vercel connector to create new project
- [ ] Connect to GitHub repo (create repo first if needed)
- [ ] Configure build: `npm run build`, output `dist`

### 4b. Environment variables
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel environment
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` (server-side only — never expose to client)
- [ ] Set up preview (staging) and production environments separately

### 4c. Confirm deployment
- [ ] Push to main branch — Vercel auto-deploys
- [ ] Visit deployment URL — confirm React app loads
- [ ] Confirm Supabase connection works from deployed URL (not just localhost)
- [ ] Add Vercel deployment URL to Supabase allowed origins (Auth settings)

---

## Step 5 — Smoke Test

Before calling Phase 0 complete, walk through this checklist top to bottom:

**Database**
- [ ] All 9 tables visible in Supabase Table Editor
- [ ] `ready-set-dedicate` intervention exists with `is_active = false`
- [ ] Admin user exists with role in `user_roles`

**Participant flow**
- [ ] Manually insert a test access code in `access_codes`
- [ ] Enter code on landing page → session created → redirected to delivery shell
- [ ] Revisit `/` with no session → code entry page shown
- [ ] Revisit `/session/:id` with valid session → delivery shell shown
- [ ] Revisit `/session/:id` with invalid session → redirected to `/`

**Admin flow**
- [ ] Visit `/admin` → login page shown
- [ ] Login with admin credentials → redirected to dashboard
- [ ] Visit `/admin/interventions` as admin → allowed
- [ ] Logout → redirected to `/admin`
- [ ] Visit `/admin/interventions` while logged out → redirected to `/admin`

**Deployment**
- [ ] All of the above passes on the Vercel deployment URL, not just localhost

---

## Phase 0 Complete When...
All smoke test items checked. At that point we have a solid, secure foundation and Phase 2
(Admin Dashboard + SSI Builder) can begin.

---

## Pending Before Phase 2 Starts
- [ ] Finalize item type schemas v3 (roll in `custom_activity` escape hatch)
- [ ] Answer open schema question: `guided_creative` word bank scope (global vs per-prompt vs both)
- [ ] Retrieve RSD component `.jsx` files from Claude Code session and add to repo
- [ ] Clinical team review of all word bank content before any participant-facing deployment

---

## Reference
| Document | Purpose |
|---|---|
| `001_ssi_platform_schema.sql` | Database migration — apply in Step 1b |
| `002_item_type_schemas_v2.md` | Item type reference — informs Phase 2 Builder |
| `SSI_Platform_Master_Plan_2.docx` | Full platform spec |
| `RSD_Activities_Documentation.md` | Activity component specs and clinical content |
| `Adoption_Readiness_Belongingness_Intervention_for_Youth.docx` | Clinical framework and measures |
| `Sprang_exercise_section.pptx` | Dr. Sprang's self-reflection and poem exercises |
