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
