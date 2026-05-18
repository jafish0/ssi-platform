# SSI Platform — state of the platform

Snapshot: **2026-05-10**. Source-of-truth values pulled from Supabase MCP + git log + repo, not paraphrased from memory.

This doc exists to support a decision about whether to consolidate CTAC apps (BSC, SSI, future TIC / TIPE / FourC) into a single project / repo / Supabase instance, vs. keep them separate. Read alongside `INFRASTRUCTURE.md` (lower-level config) and `WORKING_NOTES.md` (recent ship log + drafts in flight).

---

## TL;DR

- **Live and stable** at https://ssi.ctac.app. Two interventions imported and end-to-end runnable: *Ready for Roots* (youth; formerly *Ready! Set! Dedicate!* / RSD, renamed 2026-05-13) and *GAINS for Professionals* (adults). 15 sessions, 351 responses recorded so far (mostly seed/test data).
- **One repo, one Vercel project, one Supabase project** today — but the schema is **intervention-agnostic**: a single `interventions` table is the top-level partition, and Ready for Roots + GAINS already coexist cleanly inside it.
- **Shared infrastructure across CTAC apps** (umbrella domain `ctac.app`, Resend sender domain, DMARC/DKIM/SPF) is already in place. Adding a sibling app is "spin up another Vercel project + Supabase project + attach a subdomain" — no DNS work, no email-pipeline work.
- **The consolidation question is essentially "Supabase + repo," not infra.** Email and DNS are already shared. Vercel projects are cheap to spin up. The real decision is: do all CTAC programs share a single Postgres schema and a single React app, or do they stay isolated?

---

## What's been built

### Two delivery modes

The same React+Supabase app runs two surfaces from one codebase:

1. **Participant delivery** at `/` — code entry → consented participant runs through an intervention → responses stored, completion webhook fires.
2. **Researcher / admin portal** at `/admin/*` — login + role-gated routes for everything below.

### Admin portal pages (under `/admin`)

| Route | Role | Purpose |
|---|---|---|
| `/admin` | public | Email/password login + "Forgot password?" inline mode |
| `/admin/dashboard` | researcher+ | Researcher landing |
| `/admin/interventions` | admin | List/edit interventions (Builder entry) |
| `/admin/interventions/:id` | admin | **Builder** — section + item editor, token picker, preview, publish-with-version-snapshot |
| `/admin/codes` | researcher+ | Access-code management (mint individual / cohort codes, see use_count) |
| `/admin/exports` | admin | SPSS-ready wide CSV + codebook PDF + 52-participant Ready for Roots demo dataset |
| `/admin/team` | admin | Invite admins (TokenHash flow) + roster + last-sign-in |
| `/admin/feedback` | admin | IRF-Team feedback triage from the public demo (filter / status workflow / inline notes) |
| `/admin/testing` | admin | Activity sandbox for any of the 6 Ready for Roots activities with mock props |

### Builder

- Section + item CRUD with drag-to-reorder (`@dnd-kit`).
- 9 item types: `psychometric_scale`, `video`, `text_prompt`, `free_text`, `structured_activity`, `guided_creative`, `choice`, `page_break`, `custom_activity`.
- **Custom-activity registry** (`src/lib/activityRegistry.js`) — Builder can drop in any of the 6 hand-coded Ready for Roots activities as a black-box step.
- **Pull-forward / token system** — items declare a `token_key`; later items reference responses as `{{response.token_key.path}}`. Used heavily for letter builders, action plans, etc.
- **Publish creates an immutable version snapshot** (full JSON) so participants always see the version they started on, even if the intervention is republished mid-session.

### Delivery engine

- `SessionEngine` + `ItemRenderer` — read-from-snapshot (never live), debounced response save, resumable mid-session.
- 6 Ready for Roots custom activities (full React components, all under `src/activities/`):
  - `GettingUnstuck.jsx`
  - `AlliesSafetyNet.jsx`
  - `SelfReflection.jsx`
  - `BelongingSkillsSort.jsx`
  - `WhoIAmPoem.jsx`
  - `LetterBuilder.jsx`
- GAINS for Professionals: imported from a Qualtrics QSF (no custom activities — built entirely from the standard item types + hard-exit branching).
- Quiz feedback (correct/incorrect + retry) on `Choice` items.
- Auto-scroll-to-top on every item change. PDFs of completion artifacts via `jspdf` + `html2canvas` (client-side, no server roundtrip).

### Public demo

- `/demo` — combines an activity sandbox (try the 6 Ready for Roots activities standalone) with the data-export demo (52 synthetic participants, runs the real export pipeline).
- `/demo/sandbox/:activityId` — direct deep-link to any one activity.
- Persistent **Give feedback** button in the header — modal auto-fills "Where you are" from the route, fixed roster of 8 submitters (Ginny / Adrienne / Jessica / Holly / Bianca / Stephanie / Josh / Anonymous), 5 categories. Lands in `/admin/feedback`.

### Auth + invite flow

- Supabase Auth with email/password.
- **TokenHash + `/set-password` pattern** to defeat Microsoft Safe Links pre-fetching invite OTPs. Used for both invites and password recovery.
- Custom invite + recovery email templates (Outlook-safe table-button pattern; no `linear-gradient` because Word/Outlook strips it).
- 5-second timeout in `AuthContext` bootstrap with auto-recovery via `signOut({ scope: 'local' })` to fix the "stuck on Signing in" bug after deploys.

---

## Repo

- **GitHub:** https://github.com/jafish0/ssi-platform
- **Local working tree:** `C:\Users\jafish0\Documents\Claude\SSI App\SSI Platform A`
- **Stack:** plain JavaScript (no TypeScript), React 18, Vite 5, Tailwind v3, React Router v6
- **Key dependencies:** `@supabase/supabase-js`, `@dnd-kit/core` + `@dnd-kit/sortable`, `lucide-react`, `jspdf`, `html2canvas` (transitively via jspdf)
- **Source size:** 65 `.jsx`/`.js` files under `src/`

### Repo top-level docs

| File | Purpose |
|---|---|
| `INFRASTRUCTURE.md` | Long-form ops doc — DNS, Resend, SMTP, email pipeline, MCP coverage gaps, change log |
| `WORKING_NOTES.md` | Bidirectional Claude Cowork ↔ Claude Code scratchpad (recently shipped + drafts queued) |
| `CLAUDE.md` | Project-scoped memory for Claude Code (workflow + repo conventions) |
| `STATE_OF_THE_PLATFORM.md` | This doc |
| `RSD_Flow_Option_A.md`, `RSD_Flow_Option_B.md` | Ready for Roots design alternatives (filenames retain "RSD" — internal artifacts) |
| `IRB_Feedback_Notes.md`, `RSD_Completion_GiftCard_Flow.md` | Process notes |
| Various `*_claude_code_prompt.md` | Archived prompts that built the major features |

### Source layout

```
src/
  activities/          6 hand-coded Ready for Roots activity components
  components/
    builder/           Builder-specific UI (sidebar, item configs, token picker, publish modal)
    items/             Renderers for the 9 item types
    AdminLayout, DemoPageLayout, FeedbackButton, LogoStrip, ProtectedRoute, SessionGuard
  contexts/            AuthContext (5s bootstrap timeout with recovery)
  engine/              SessionEngine + ItemRenderer (delivery loop)
  hooks/               useDebouncedCallback
  lib/                 activityRegistry, api (callEdgeFunction / callAuthedEdgeFunction),
                       builderUtils, codes, csv, demoDataset (52 synthetic participants),
                       exportFlatten, pdf, supabase (client), testRegistry, tokens
  pages/               17 page components — one per route
```

### Recent commit history (last 20)

```
e1199c7 Log Stephanie roster addition in WORKING_NOTES
cdbd78c Add Stephanie to feedback submitter roster
e17aed3 Add CLAUDE.md memory + log feedback ship in WORKING_NOTES
0287706 Add feedback collection on /demo + admin review at /admin/feedback
c1d983e Demo: change all first-person-plural copy to singular
e9f194e Demo: IRF Team banner, hide activity slugs, add individual-plan note
333acfd Demo: rename headline
e1c3798 Demo polish: drop GAINS logo, reorder buttons, add encouragement copy
47d67d6 Demo page: drop status/date filters and session preview
deb0ca8 feat: temporary public /demo page
4862350 docs: park Qualtrics smoke-test in INFRASTRUCTURE follow-ups
11a8e6e docs: add Qualtrics two-way integration to INFRASTRUCTURE.md
5a00a81 feat: dedicated /admin/exports page with SPSS-ready wide export
53b9c22 feat: forgot-password flow with TokenHash + /set-password pattern
af556be feat: admin invite flow with TokenHash + /set-password pattern
72e5017 Fix login getting stuck after deploys
0e8468c Testing dashboard: trim to the 6 RSD activities
9198695 Testing/QA dashboard: sandbox any activity or item type with mock props
877691e PsychometricScale: hide H2 heading when scale_name is empty
6bf06bd Quiz feedback (correct/incorrect + retry) on Choice
```

---

## Hosting (Vercel)

- **Account / team:** `joshua-fisherkellers-projects` (`team_ti8TW3UA0TrjflqjpHLwl3I0`)
- **Project:** `ctac-ssi` (`prj_A2ONKp94GuqrcyeKVHE0Atznr7fX`)
- **Stack detection:** Vite + React (auto, no preset)
- **Node:** 24.x
- **Production branch:** `main`
- **Required env vars in Vercel:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Cache headers:** `Cache-Control: no-cache` on non-asset paths in `vercel.json` to prevent stale `index.html` pointing at old chunk hashes (the recurring "stuck on Signing in" bug)

### Domains

| Subdomain | Project | Status |
|---|---|---|
| `ssi.ctac.app` | `ctac-ssi` | Live (since 2026-05-06) |
| `bsc.ctac.app` | `sts-bsc-manager` (separate Vercel project) | Live |
| `tic.ctac.app` | — | Reserved |
| `tipe.ctac.app` | — | Reserved |
| `fourc.ctac.app` | — | Reserved |
| `ctac.app` apex | — | Reserved for landing/portal |

The umbrella domain `ctac.app` is registered through Vercel Domains. DNS records (DMARC, DKIM via `resend._domainkey`, SPF on `send`, MX, CAA) live on the parent and benefit every subdomain automatically. **No per-app DNS work** when adding a new sibling app — just attach a subdomain to the new Vercel project.

Legacy Vercel-assigned aliases kept for back-compat (don't advertise externally):
- `ctac-ssi.vercel.app`
- `ctac-ssi-joshua-fisherkellers-projects.vercel.app`
- `ctac-ssi-git-main-joshua-fisherkellers-projects.vercel.app`

---

## Supabase

- **Project name:** Single Session Intervention Platform
- **Project ref:** `fflezknnpmbemeqyqxml`
- **Region:** `us-west-2`
- **Postgres:** 17.6.1.104
- **Status:** ACTIVE_HEALTHY
- **Created:** 2026-04-15
- **Dashboard:** https://supabase.com/dashboard/project/fflezknnpmbemeqyqxml

### Schema (public) — 10 tables, all with RLS

Counts are live as of this snapshot.

| Table | Rows | Purpose |
|---|---|---|
| `interventions` | 2 | Top-level intervention registry (RSD, GAINS). Slug is unique; URL-safe. |
| `intervention_versions` | 6 | Immutable published snapshots (full JSON of sections+items at publish time). Append-only. |
| `sections` | 27 | Ordered sections within an intervention (mutable until published). |
| `items` | 109 | Atomic content items inside sections. Type-checked enum: `psychometric_scale`, `video`, `text_prompt`, `free_text`, `structured_activity`, `guided_creative`, `choice`, `page_break`, `custom_activity`. |
| `access_codes` | 2 | Participant access codes; `external_ref` links a participant's intervention + follow-up codes (Qualtrics integration). |
| `sessions` | 15 | One per participant run-through. `version_id` is frozen at start so the participant always sees the same content. |
| `responses` | 351 | All participant responses. `response_value JSONB` to handle every item type (text / number / array / structured object). |
| `scheduled_messages` | 0 | Twilio SMS queue (Phase 3, not yet wired). |
| `user_roles` | 2 | `researcher` / `admin` assignments. Checked at query time, not stored in JWT. |
| `feedback` | 7 | IRF-Team feedback from `/demo` (admin-only RLS, INSERT via service role from `submit-feedback` edge fn). |

### Migrations applied

| Version | Name |
|---|---|
| `20260415134009` | `001_initial_schema` |
| `20260507015929` | `add_external_ref_to_access_codes` |
| `20260508140529` | `add_feedback_table` |

(Some changes — like the Stephanie addition to the `feedback.submitter` CHECK constraint, or post-initial RLS policy tweaks — were applied via raw SQL and not captured as named migrations. If we consolidate or move projects, this is something to clean up: re-baseline migrations from the live schema.)

### Edge Functions (11 total)

| Slug | `verify_jwt` | Version | Purpose |
|---|---|---|---|
| `validate-code` | true | 1 | Participant code-entry validation |
| `get-session` | true | 1 | Resume an in-progress session |
| `save-response` | true | 1 | Persist a single response |
| `update-session-progress` | true | 2 | Update `current_section` + fire Qualtrics completion webhook on `status='completed'` |
| `get-session-responses` | true | 1 | Read all responses for a session |
| `get-version-snapshot` | true | 1 | Fetch the frozen JSON for a version |
| `invite-admin` | true | 1 | Admin-gated; calls `auth.admin.inviteUserByEmail` + upserts `user_roles` |
| `list-admins` | true | 1 | Joins `user_roles` with `auth.users` for the team page |
| `mint-access-code` | **false** | 1 | Public; partner-key auth (`x-partner-key`); used by Qualtrics |
| `get-rsd-snapshot` | **false** | 1 | Public read of the RSD published snapshot (powers `/demo` activity sandbox) |
| `submit-feedback` | **false** | 2 | Public; validates roster + category; writes via service role |

### Auth

- **Site URL:** `https://ssi.ctac.app`
- **Redirect allowlist:** `https://ssi.ctac.app/**` + `https://fflezknnpmbemeqyqxml.supabase.co/**`
- **Custom SMTP:** Resend (`smtp.resend.com:465`), sender `no-reply@ctac.app`, name `CTAC`. Effective rate limit 30 emails/hour.
- **Templates customized:** invite + recovery (Outlook-safe table-button pattern, archived in `docs/`). Magic-link / email-change / reauth still default Supabase.

---

## Email pipeline

```
Supabase Auth
    ↓ SMTP (smtp.resend.com:465)
Resend
    ↓
AWS SES (Resend's underlying provider)
    ↓
Recipient (DKIM/SPF/DMARC verified via ctac.app)
```

- **Resend org:** `uky`
- **Verified domain:** `ctac.app` (parent — every subdomain inherits)
- **API keys** (one per app for blast-radius isolation):
  - `supabase-smtp-bsc` — BSC-Manager
  - `supabase-smtp-ssi` — SSI
  - `CTAC` — bootstrap key, full access, kept for management
- **DMARC:** currently `p=none` (monitor mode). Tighten to `p=quarantine` after ~4 weeks of clean sending. Coordinate with BSC-Manager owner; the record lives on `ctac.app` so it's shared.

### Two known operational landmines

1. **Outlook + `linear-gradient`** — Word's HTML engine silently strips the entire `background` property when it sees `linear-gradient`. Use the table-based solid-background button pattern from `docs/supabase_invite_email_template.html`.
2. **Microsoft Safe Links** pre-fetches every URL in external emails and consumes Supabase's one-time-use OTPs before the user clicks. Mitigation is the **TokenHash + `/set-password`** pattern: email links to a static React route, and `verifyOtp` only runs on user action client-side. Already wired for invites + recovery; required for any future magic-link / email-change flow.

---

## Partner integration — Qualtrics two-way handshake

Used for RSD consent + 90-day follow-up scheduling.

**Outbound from Qualtrics → SSI:** `POST /functions/v1/mint-access-code` with `x-partner-key`. Body picks an allow-listed slug (`ready-set-dedicate` or `rsd-follow-up-90d`) and includes `external_ref` (Qualtrics response ID) so the two codes for one participant share it.

**Inbound to Qualtrics ← SSI:** `update-session-progress` fires a one-shot webhook to `QUALTRICS_COMPLETION_WEBHOOK_URL` (with `X-API-TOKEN`) the first time a session hits `status='completed'`. Payload: `{ external_ref, code, intervention_slug, session_id, completed_at }`. Retries once on 5xx after 2s; never on 4xx; fire-and-forget.

**Required Edge Function secrets** (set in Supabase dashboard → Project Settings → Edge Functions → Secrets):
- `PARTNER_API_KEY_QUALTRICS` (generated, handed off in chat)
- `QUALTRICS_COMPLETION_WEBHOOK_URL` (TBD — set when Qualtrics workflow exposes its inbound URL)
- `QUALTRICS_API_TOKEN` (TBD — if Qualtrics requires header auth)

End-to-end smoke test still pending until those secrets are set.

---

## Known deferred / non-built work

Carrying this honestly because consolidation decisions hinge on it.

- **Twilio SMS / `scheduled_messages` table** — table exists with 0 rows. No edge function, no UI. Phase 3, adult cohorts only.
- **Email notifications on new feedback** — admin checks `/admin/feedback` manually. Resend is wired; would be ~30 lines in the `submit-feedback` function.
- **Rate limiting on public edge functions** (`submit-feedback`, `mint-access-code`, `get-rsd-snapshot`) — none. Audience is the named IRF Team / lab partner. If a URL leaks, add per-IP daily counter.
- **Admin removal flow** — `/admin/team` only adds. Removal is SQL-only.
- **Migration baseline mismatch** — the live schema has had a few non-migration tweaks (e.g. the Stephanie CHECK-constraint update). If we move projects or hand off to another developer, re-baseline.
- **Qualtrics integration** — code is shipped, secrets need setting, end-to-end smoke test pending.
- **Magic-link / email-change / reauth email templates** — still default Supabase; will need TokenHash treatment when those flows are added.
- **Vercel legacy aliases** — kept for back-compat; remove for hygiene after a few months of clean `ssi.ctac.app` traffic.
- **Demo files marked TEMP** — `src/pages/DemoPage.jsx`, `src/pages/DemoSandboxPage.jsx`, `src/components/DemoPageLayout.jsx`, plus the two `/demo/*` routes in `App.jsx`. Easy to `git rm` together when the demo is no longer needed.

---

## Implications for consolidating CTAC apps

What's already shared across CTAC apps:

- **Domain umbrella:** `ctac.app` registered in Vercel; every CTAC subdomain inherits DKIM/SPF/DMARC/CAA automatically.
- **Email sender domain:** Resend's verified `ctac.app` already supports BSC and SSI; one Resend API key per app is the existing pattern.
- **Outlook-safe email template patterns + Safe-Links workaround** (TokenHash + `/set-password`) — battle-tested here, copyable to any future app.
- **Operational playbook** — `INFRASTRUCTURE.md` documents the gotchas so future apps don't re-discover them.

What's NOT shared today:

- **Supabase project** — SSI has its own (`fflezknnpmbemeqyqxml`). BSC-Manager has its own. Future apps would either share or get their own.
- **Vercel project + repo** — one per app today.
- **Auth users** — each Supabase project has its own `auth.users` table, so admins have to be re-invited per app.

### Three plausible consolidation patterns

| Pattern | Pros | Cons |
|---|---|---|
| **A. Status quo — one Supabase + Vercel per app** | Total isolation; one app's RLS bug can't leak another's data; easy to hand off / spin down | Admins re-invited per app; duplicated infra (auth, edge functions, RLS policies) per app; no cross-app reporting |
| **B. Shared Supabase, separate Vercel projects** | One admin user works everywhere; cross-app reporting easy; one place to manage RLS / edge functions | Schema needs an `app` partition column on every table; one bad migration can break all apps; harder blast-radius isolation |
| **C. Single mega-app (one Supabase + one Vercel + one repo)** | Maximum reuse; a single Builder serves every program | Each program has very different domain logic; the `interventions`-table abstraction works for SSI variants, less obviously for things like BSC's case-management; biggest blast radius |

The current SSI schema **already supports multiple interventions** cleanly inside one Supabase project — the `interventions` table is the natural top-level partition, and RSD + GAINS coexist there. So **Pattern B** is a natural extension of what's working today, **as long as** the new apps fit the "intervention with sections + items + responses" shape. If they don't (e.g. BSC's case-management surface), Pattern A is safer.

The infrastructure-level shared pieces (domain, email, DMARC) work the same under any of the three patterns — those decisions are already made well.

---

## Quick-reference dashboards

- Vercel project: https://vercel.com/joshua-fisherkellers-projects/ctac-ssi
- Vercel domains (umbrella): https://vercel.com/joshua-fisherkellers-projects/~/domains/ctac.app
- Supabase project: https://supabase.com/dashboard/project/fflezknnpmbemeqyqxml
- Supabase auth URL config: https://supabase.com/dashboard/project/fflezknnpmbemeqyqxml/auth/url-configuration
- Supabase email templates: https://supabase.com/dashboard/project/fflezknnpmbemeqyqxml/auth/templates
- Resend API keys: https://resend.com/api-keys
- GitHub: https://github.com/jafish0/ssi-platform
