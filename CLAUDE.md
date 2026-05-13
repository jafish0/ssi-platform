# Project memory — SSI Platform

## The two-Claude workflow

Josh works with two Claude surfaces on this repo:

- **Claude Cowork** — Claude desktop chat. Thinking partner for feasibility,
  UX, trade-offs, scope, and prompt drafting. **Does not** write code or run
  shell commands on this project.
- **Claude Code** — this CLI. The implementer. Reads drafts, builds, tests,
  commits, pushes.

They communicate through `WORKING_NOTES.md` at the repo root. It has two
sections, both append-only:

- **Recently shipped** (Claude Code → Claude Cowork) — newest at top.
  One bullet per commit: hash + date + one-line summary. Claude Code
  appends here after every push so Cowork has running context without
  re-reading git log.
- **Ideas / drafts for the next Claude Code session** (Claude Cowork →
  Claude Code) — newest at bottom. Polished implementation prompts
  Claude Cowork has prepared, ready for Claude Code to pick up. Once a
  draft ships, move it (verbatim) into "Recently shipped" with the
  commit hash so the history stays intact.

## Session start — both surfaces

Read `WORKING_NOTES.md` first. It's the fastest way to ground in what's
been shipped recently and what's queued.

If `WORKING_NOTES.md` is missing, bootstrap it before doing other work.

## After every push (Claude Code only)

1. If the change came from a draft in "Ideas / drafts," move that draft
   verbatim into "Recently shipped" and append the commit hash + date.
2. If the change was developed in-conversation (no draft), still log a
   one-line bullet under "Recently shipped" with the commit hash + date.

## Other repo conventions worth knowing

- Plain JavaScript React (Vite) — **not** TypeScript.
- Tailwind v3 with the project's amber/slate palette. Primary CTAs are
  `bg-amber-500 hover:bg-amber-600 text-white rounded-full`. Inputs are
  `bg-amber-50 border border-amber-200 rounded-2xl`.
- Supabase-backed (Postgres + Auth + Edge Functions in Deno + RLS).
  Schema changes go through Supabase MCP `apply_migration`. Edge functions
  ship via Supabase MCP `deploy_edge_function`.
- `INFRASTRUCTURE.md` is the long-form change log + ops doc. Every
  schema or edge-function change should append a change-log entry there.
- The public demo lives at `/demo` and `/demo/sandbox/:activityId`.
  Marked TEMP in comments — the relevant files are easy to `git rm`
  together when the demo is no longer needed.

## Sandbox activity versions

`src/lib/activityVersions.js` is the source of truth for which build of
each sandbox activity is currently live. The version is shown as a badge
on the sandbox page (so testers know what they're poking at) and is
captured in every feedback submission (so admin triage can tell which
version a comment refers to).

**When you change an activity file under `src/activities/`, bump its
version in the same commit.** Format is `vMAJOR.MINOR`:

- Bump **MINOR** for copy / wording / styling / small UX tweaks
- Bump **MAJOR** for structural changes to the flow, scoring, or data shape

Always update `updated` to today's date and **prepend** a one-line note
to `changelog` (older notes stay so the history is readable without git
archaeology).

## Supabase migrations — explicit Data API grants

Starting **October 30, 2026**, Supabase stops auto-granting access to
the Data API roles (`anon`, `authenticated`, `service_role`) on tables
created in `public`. Existing tables keep their current grants, but
**any new table** created after that cutover needs explicit `GRANT`
statements or supabase-js calls will return `42501`.

When using Supabase MCP `apply_migration` to create a new public-schema
table that the app will read or write via supabase-js, include the
grant block alongside the RLS policy. Standard pattern:

```sql
CREATE TABLE public.your_table (...);

-- Data API roles must be explicitly granted (Supabase change effective
-- Oct 30, 2026 — see INFRASTRUCTURE.md change log).
GRANT SELECT                          ON public.your_table TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.your_table TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.your_table TO service_role;

ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY ...
  ON public.your_table
  FOR ...
  USING (...);
```

Tune the verbs per table — a write-only edge-function intake table
might only grant `INSERT` to `anon` and full CRUD to `service_role`.
RLS does the actual access gating; the grants just make the table
visible to the Data API.
