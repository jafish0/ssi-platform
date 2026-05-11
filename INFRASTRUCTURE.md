# SSI Platform Infrastructure

Live state of the SSI Platform's deployment, email, and auth infrastructure as of **2026-05-06**.

This document is point-in-time. If you're picking it up later, treat the structure as authoritative but verify any specific value (URL, key name, DNS record) against the actual systems before relying on it. Anything marked "live" or "current" reflects state at the date above.

---

## URLs

- **Production app:** https://ssi.ctac.app
- **Admin dashboard route:** https://ssi.ctac.app/admin (currently login + stub layout — full admin/invite flow not yet built; see "Open follow-ups")
- **Vercel-assigned aliases** (kept for back-compat, do not advertise externally):
  - https://ctac-ssi.vercel.app
  - https://ctac-ssi-joshua-fisherkellers-projects.vercel.app
  - https://ctac-ssi-git-main-joshua-fisherkellers-projects.vercel.app
- **Per-deployment URLs** (rotate every push, do NOT reference): e.g. `https://ctac-{hash}-joshua-fisherkellers-projects.vercel.app`

## Hosting (Vercel)

- **Account/team:** `joshua-fisherkellers-projects` (`team_ti8TW3UA0TrjflqjpHLwl3I0`)
- **Project:** `ctac-ssi` (`prj_A2ONKp94GuqrcyeKVHE0Atznr7fX`)
- **Stack:** Vite + React (auto-detected, no framework preset configured)
- **Node version:** 24.x
- **Branch routing:** `main` → production
- **Required Vercel env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (set in Vercel dashboard, NOT in repo)

## Domain & DNS

The umbrella domain `ctac.app` is registered through Vercel Domains and shared across all CTAC programs (BSC, SSI, future TIC/TIPE/FourC). Subdomain → app routing is auto-managed by Vercel CNAME when a subdomain is attached to a project.

| Subdomain | Project | Status |
|---|---|---|
| `ssi.ctac.app` | `ctac-ssi` | Live (attached 2026-05-06) |
| `bsc.ctac.app` | `sts-bsc-manager` | Live |
| `tic.ctac.app` | — | Planned |
| `tipe.ctac.app` | — | Planned |
| `fourc.ctac.app` | — | Planned |
| `ctac.app` apex | — | Reserved for future CTAC landing/portal |

**DNS records on `ctac.app`** (managed in Vercel; the Vercel MCP does NOT expose DNS editing — must use the dashboard at https://vercel.com/joshua-fisherkellers-projects/~/domains/ctac.app):

| Record | Type | Value / purpose |
|---|---|---|
| `_dmarc` | TXT | `v=DMARC1; p=none;` (monitor mode — see "DMARC tightening plan") |
| `resend._domainkey` | TXT | DKIM, auto-managed by Resend |
| `send` | TXT | `v=spf1 include:amazonses.com ~all` (Resend's SES-backed sending) |
| `send` | MX | bounce/feedback routing to AWS SES |
| (multiple) | CAA | Vercel certificate authority authorization |

These all live on the parent domain and benefit every subdomain automatically. No per-app DNS configuration needed.

## Supabase

- **Project name:** Single Session Intervention Platform
- **Project ref:** `fflezknnpmbemeqyqxml`
- **Region:** `us-west-2`
- **DB host:** `db.fflezknnpmbemeqyqxml.supabase.co`
- **API URL:** `https://fflezknnpmbemeqyqxml.supabase.co` (referenced in app code via `import.meta.env.VITE_SUPABASE_URL` — do NOT hardcode anywhere)
- **Dashboard:** https://supabase.com/dashboard/project/fflezknnpmbemeqyqxml

### Auth URL configuration

- **Site URL:** `https://ssi.ctac.app`
- **Redirect URLs allowlist:**
  - `https://ssi.ctac.app/**` (primary — set 2026-05-06)
  - `https://fflezknnpmbemeqyqxml.supabase.co/**` (legacy default, kept for Supabase internal callbacks)

### Custom SMTP (Resend)

- **Host:** `smtp.resend.com`
- **Port:** `465`
- **Username:** `resend`
- **Password:** managed via Resend API key `supabase-smtp-ssi` (Resend → API Keys → see "Resend keys" below)
- **Sender email:** `no-reply@ctac.app`
- **Sender name:** `CTAC`
- **Effective rate limit:** 30 emails/hour (auto-bumped from default 2/h when custom SMTP is enabled)

### Auth email templates

- **Invite user template:** Customized 2026-05-06 with CTAC navy/teal branding. Live source lives in the Supabase dashboard (templates are dashboard-only — Supabase MCP cannot edit them). Source archived at [`docs/supabase_invite_email_template.html`](docs/supabase_invite_email_template.html) for version control.
- **Other templates** (recovery, magic link, email change, reauthentication): currently default Supabase. Customize using the same Outlook-safe pattern when those flows are added.

## Resend

- **Org:** `uky`
- **Verified domain:** `ctac.app` (DKIM/SPF/DMARC verified at the parent domain — covers all subdomains)
- **API keys** (one per app for blast-radius isolation):

| Key name | Permission | Domain scope | Used by |
|---|---|---|---|
| `supabase-smtp-bsc` | Sending access | `ctac.app` | BSC-Manager Supabase SMTP |
| `supabase-smtp-ssi` | Sending access | `ctac.app` | SSI Supabase SMTP |
| `CTAC` | Full access | All domains | Original bootstrap key, kept for management/future use |

## Email pipeline (end-to-end)

```
Supabase Auth
    ↓ (sends via SMTP)
Resend (smtp.resend.com:465)
    ↓
AWS SES (Resend's underlying provider)
    ↓
Recipient (DKIM/SPF/DMARC verified via ctac.app)
```

---

## Operational gotchas

### Outlook + linear-gradient (CRITICAL)

Outlook on Windows desktop uses Word's HTML rendering engine, which silently strips the entire `background` property when it encounters `linear-gradient`. Any CTA button styled with a gradient background becomes invisible to UKY Exchange recipients.

**Mitigation:** Use the table-based solid-background button pattern from [`docs/supabase_invite_email_template.html`](docs/supabase_invite_email_template.html). Verified rendering in Outlook desktop on Windows on 2026-05-06.

### Microsoft Safe Links eats Supabase OTPs (CRITICAL — currently blocks invite flow)

Microsoft 365 / Defender Safe Links pre-fetches every URL in external emails to scan for malicious content. When the URL is Supabase's `/auth/v1/verify` endpoint, the pre-fetch consumes the one-time-use OTP before the user clicks. Result: every UKY-bound invite link arrives already expired with `error_code=otp_expired`.

Confirmed via SSI smoke test on 2026-05-06 — invite to `jafish0+ssi-test1@uky.edu` arrived correctly, but click-through landed on `https://ssi.ctac.app/#error=access_denied&error_code=otp_expired&...`.

**Mitigation (when invite UI is built):** In the email template, replace the default `{{ .ConfirmationURL }}` with a custom URL pointing at the app domain:

```html
<a href="https://ssi.ctac.app/set-password?token_hash={{ .TokenHash }}&type=invite">Accept Invitation</a>
```

Build a `/set-password` route that calls `supabase.auth.verifyOtp({ token_hash, type: 'invite' })` client-side on user action (mount or button click). Safe Links can pre-fetch the static React route harmlessly because the OTP-consuming call only happens in the browser. Same pattern applies to magic-link login, password recovery, and email-change confirmation flows.

### First-send junk landing

Emails from a fresh sender often land in Junk on the first send to any given recipient, even with valid DKIM/SPF/DMARC. This is standard inbox-reputation behavior, not a config issue. Mitigation: have recipients mark "Not Junk"; subsequent sends to the same recipient should land in inbox.

In SSI's case, the first-ever invite (2026-05-06) landed directly in inbox — likely because BSC-Manager has been sending from the same `ctac.app` domain for ~28 days, so reputation was already established.

### MCP coverage gaps

- **Vercel MCP** does NOT expose DNS record editing. For new DNS records on `ctac.app`, use https://vercel.com/joshua-fisherkellers-projects/~/domains/ctac.app
- **Supabase MCP** does NOT expose email template editing or auth URL configuration. Use the Supabase dashboard.

---

## DMARC tightening plan

Currently `p=none` (monitor mode). After ~4 weeks of clean sending across both BSC and SSI (target: ~early June 2026), tighten to `p=quarantine`. **Coordinate with BSC-Manager owner before changing** — the DMARC record lives on `ctac.app` and affects both apps. Do not modify in isolation.

---

## Partner integrations (server-to-server)

### Qualtrics — RSD consent + completion webhook

Two-way handshake between the lab's Qualtrics consent flow and the SSI Platform.

**Outbound from Qualtrics → SSI Platform**

- Endpoint: `POST https://fflezknnpmbemeqyqxml.supabase.co/functions/v1/mint-access-code`
- Auth: `x-partner-key: <PARTNER_API_KEY_QUALTRICS>` (shared secret stored as a Supabase Edge Function secret).
- Body: `{ intervention_slug, cohort_label?, max_uses?, expires_at?, external_ref? }`. Allow-listed slugs: `ready-set-dedicate`, `rsd-follow-up-90d`. `external_ref` should be the Qualtrics response ID so the two codes for one participant share it.
- Response: `{ code, intervention_slug, url, expires_at, external_ref }`.

**Inbound to Qualtrics ← SSI Platform**

- The `update-session-progress` edge function fires a one-shot webhook to `QUALTRICS_COMPLETION_WEBHOOK_URL` (with `X-API-TOKEN: <QUALTRICS_API_TOKEN>`) the first time a session transitions to `status='completed'`. Skipped silently if the access_code has no `external_ref` (e.g. codes minted via the Admin UI rather than Qualtrics).
- Payload: `{ external_ref, code, intervention_slug, session_id, completed_at }`. Qualtrics' workflow can branch on `intervention_slug` to route follow-up scheduling vs. gift-card flow.
- Retries once on 5xx / network error after 2s; never retries 4xx; fire-and-forget from the participant's perspective.

**Required Supabase Edge Function secrets**

- `PARTNER_API_KEY_QUALTRICS` — set this before Qualtrics can mint codes.
- `QUALTRICS_COMPLETION_WEBHOOK_URL` — set this once Qualtrics workflow exposes its inbound webhook URL.
- `QUALTRICS_API_TOKEN` — set if Qualtrics requires a token header (it does for direct API calls; the inbound-webhook flow may or may not need it depending on workflow config).

Manage at: Supabase dashboard → Project Settings → Edge Functions → Secrets, or via Supabase CLI.

**Related schema:** `access_codes.external_ref TEXT` (indexed, b-tree, partial WHERE NOT NULL). Multiple codes can share an `external_ref`; this is how a participant's intervention code and 90-day follow-up code are joined.

## Open follow-ups

- **Smoke-test the Qualtrics integration end-to-end (after team decisions).** Three secrets must be set first in Supabase → Project Settings → Edge Functions → Secrets:
  - `PARTNER_API_KEY_QUALTRICS` — generated value handed off in chat (`f6TVZubUCx_LYPyU7YsbiOIERt_PLuEe`); share with lab Qualtrics admin to configure on their side.
  - `QUALTRICS_COMPLETION_WEBHOOK_URL` — TBD; set once the Qualtrics workflow exposes its inbound webhook URL.
  - `QUALTRICS_API_TOKEN` — TBD; set if the Qualtrics workflow requires header auth on the inbound webhook.

  Then run:
  1. **Mint test (Task 2):** `curl -X POST https://fflezknnpmbemeqyqxml.supabase.co/functions/v1/mint-access-code -H "x-partner-key: $PARTNER_KEY" -H "Content-Type: application/json" -d '{"intervention_slug":"ready-set-dedicate","cohort_label":"Smoke test","max_uses":1,"external_ref":"R_TEST001"}'` — expect a JSON body with `code` and `url`. Wrong header → 401. Unknown slug → 400.
  2. **Webhook test (Task 3):** point `QUALTRICS_COMPLETION_WEBHOOK_URL` at https://webhook.site, walk a test session through to completion in the app, verify webhook.site receives a POST with `{ external_ref, code, intervention_slug, session_id, completed_at }`.
  3. **End-to-end:** swap webhook URL for the real Qualtrics inbound URL once the lab has their workflow built; do a real consent → mint → intervention → webhook → 90-day-follow-up dry run.

- ~~**Build admin invite flow.**~~ ✅ Shipped 2026-05-06. Uses TokenHash pattern + `/set-password` route + `invite-admin` / `list-admins` edge functions. UI lives at `/admin/team` (admin-only). See `src/pages/SetPasswordPage.jsx`, `src/pages/AdminTeamPage.jsx`, and the two edge functions in Supabase.
- ~~**Update invite email template after invite flow ships**~~ ✅ Updated in repo same day; live template repasted into Supabase dashboard 2026-05-06.
- ~~**Build forgot-password flow.**~~ ✅ Shipped 2026-05-06. Inline mode toggle on `/admin` (Forgot password? link) calls `supabase.auth.resetPasswordForEmail`. Recovery emails route through the same `/set-password` page (which already keys on `?type=`). Recovery template HTML at `docs/supabase_recovery_email_template.html` — needs to be pasted into Supabase dashboard → Authentication → Email Templates → Reset password.
- **Coordinate DMARC tightening** (~early June 2026) with BSC-Manager owner.
- **Customize remaining auth email templates** (magic link, email change, reauthentication) if/when those flows are added to the app. Each must use the TokenHash + `/set-password`-style pattern to survive Safe Links.
- **Revisit the legacy Vercel aliases** (`ctac-ssi.vercel.app` etc.) after a few months of `ssi.ctac.app` being live with no observed traffic — can be removed for hygiene.
- **Admin removal flow.** AdminTeamPage currently only adds; an admin can't be removed via UI. Either add a "Remove" button (with confirm + edge function) or keep it SQL-only for now.
- **Cleanup of leftover smoke-test users** in `auth.users` from earlier flows (e.g. `jafish0+ssi-test1@uky.edu`) — has no user_roles entry; harmless but can be deleted via dashboard.

---

## Quick-reference dashboards

- Vercel project: https://vercel.com/joshua-fisherkellers-projects/ctac-ssi
- Vercel domain settings (umbrella): https://vercel.com/joshua-fisherkellers-projects/~/domains/ctac.app
- Supabase project: https://supabase.com/dashboard/project/fflezknnpmbemeqyqxml
- Supabase auth URL config: https://supabase.com/dashboard/project/fflezknnpmbemeqyqxml/auth/url-configuration
- Supabase SMTP settings: https://supabase.com/dashboard/project/fflezknnpmbemeqyqxml/auth/smtp
- Supabase email templates: https://supabase.com/dashboard/project/fflezknnpmbemeqyqxml/auth/templates
- Supabase users: https://supabase.com/dashboard/project/fflezknnpmbemeqyqxml/auth/users
- Resend: https://resend.com/api-keys

---

## Change log

- **2026-05-11** — Auth bootstrap race fixed (the recurring "have to clear site data to log in" bug). Previous fix (commit `72e5017`, 2026-05-04) added a 5s `getSession()` timeout but didn't address the underlying race: `AuthContext` was calling both `getSession()` AND registering `onAuthStateChange` in the same tick, and supabase-js fires `INITIAL_SESSION` synchronously on subscription — so two parallel paths both called `fetchRole + setLoading(false)`, with non-deterministic order occasionally wedging the page. Rewritten to use **only** `onAuthStateChange` as the source of truth (the supabase-js recommended pattern). Added a 5s watchdog that clears `sb-*-auth-token` localStorage keys by hand if no event ever arrives, plus an in-app "Reset session & sign in" button on `ProtectedRoute`'s loading screen after 6s so users never need DevTools to recover. Commit `4e60c77`.
- **2026-05-08** — Feedback collection on the public demo. New `public.feedback` table (RLS: `is_admin()` for ALL; no public SELECT) with fields `page_path`, `area`, `activity_id`, `category`, `message`, `submitter`, `user_agent`, `status`, `admin_notes`. New public edge function `submit-feedback` (`verify_jwt=false`) validates message length, the category allow-list, and the fixed submitter roster (Ginny / Adrienne / Jessica / Holly / Bianca / Josh / Anonymous), captures the `user-agent` header, and inserts via the service-role client. UI: persistent **Give feedback** button rendered in `DemoPageLayout` (auto-fills "Where you are" from the route via `findTestEntry`). Admin review at `/admin/feedback` (admin-only) reads/writes directly through supabase-js — admins can move rows through `new → acknowledged → addressed | declined` and add inline `admin_notes`. No email notifications, no rate-limit, no attachments in v1; audience is the named IRF Team.
- **2026-05-06 (later)** — Admin invite flow shipped. New `/admin/team` page (admin-only) for inviting and listing admins. Two edge functions: `invite-admin` (admin-gated, calls `auth.admin.inviteUserByEmail` + upserts `user_roles`) and `list-admins` (joins `user_roles` with `auth.users` for email + last_sign_in_at + pending status). New `/set-password` route is Safe-Links-safe — verifyOtp only fires on user click, not on mount. Invite email template HTML updated to use TokenHash + `/set-password`. CORS on edge functions allow-listed to `ssi.ctac.app` + `ctac-ssi.vercel.app` + `localhost:5173`.
- **2026-05-06** — Migration from `ctac-{hash}-joshua-fisherkellers-projects.vercel.app` deployment URL to `ssi.ctac.app`. Attached subdomain in Vercel; updated Supabase auth Site URL + Redirect URLs; created Resend API key `supabase-smtp-ssi` and configured Supabase custom SMTP; customized invite email template with brand colors and Outlook-safe CTA button; ran first smoke test (email pipeline pass; click-through blocked by Microsoft Safe Links — design constraint captured for future invite-flow build).
