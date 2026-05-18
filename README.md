# SSI Platform

A dual-mode web application for delivering Single Session Interventions.
First deployment: **Ready for Roots** — an intervention targeting
belongingness for youth ages 11–17 in out-of-home care. (Formerly
*Ready! Set! Dedicate!* / RSD — renamed 2026-05-13.)

See `docs/` for planning documents and [`INFRASTRUCTURE.md`](INFRASTRUCTURE.md) for the live deployment, email, and auth configuration (production URL, Vercel/Supabase/Resend setup, operational gotchas, open follow-ups).

## Local development

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:5173. Requires a `.env.local` with
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
