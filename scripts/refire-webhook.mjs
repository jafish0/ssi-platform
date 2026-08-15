// Re-fire the Qualtrics completion webhook for one session (Draft 82).
//
// The completion webhook (update-session-progress v3) records its outcome
// in sessions.metadata_json.webhook. When that record says 'failed' — or
// is missing entirely (sessions completed before v3) — this script is the
// recovery path: it rebuilds the exact original payload from the session
// row and re-POSTs it, then updates the record on the session.
//
// Usage:
//   node scripts/refire-webhook.mjs <session_id> [--dry-run]
//
// Environment:
//   SUPABASE_SERVICE_ROLE_KEY        (required) — dashboard → Project
//     Settings → API. Needed to read sessions/access_codes and write the
//     metadata record; the anon key can't (RLS).
//   QUALTRICS_COMPLETION_WEBHOOK_URL (required unless --dry-run) — same
//     value as the edge-function secret.
//   QUALTRICS_API_TOKEN              (optional) — sent as X-API-TOKEN.
//   SUPABASE_URL                     (optional) — defaults to
//     VITE_SUPABASE_URL from .env.local.
//
// Finding sessions that need it (the recovery procedure at study scale —
// this query + this script, no admin UI):
//
//   SELECT s.id, s.completed_at, ac.code, ac.external_ref,
//          s.metadata_json->'webhook' AS webhook
//   FROM sessions s
//   JOIN access_codes ac ON ac.id = s.access_code_id
//   WHERE s.status = 'completed'
//     AND ac.external_ref IS NOT NULL
//     AND (s.metadata_json->'webhook'->>'status' IS DISTINCT FROM 'delivered');
//
// Idempotency (verified against docs/QUALTRICS_SETUP.md §4): the Qualtrics
// receiver matches on external_ref and SETS flags (study_completed /
// followup_completed, completed_at) — re-setting them is harmless. The one
// duplicate-sensitive step is the confirmation EMAIL, which could re-send
// on a true duplicate delivery. So: only re-fire sessions whose record is
// 'failed' or missing (the query above already filters to those); if in
// doubt, check with the Qualtrics side whether the response was flagged.
//
// The delivery algorithm below (3 attempts, 2s/4s backoff, no retry on
// 4xx) is a verbatim port of update-session-progress v3's deliverWebhook —
// keep them in sync if either changes.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function envLocal(name) {
  try {
    const env = readFileSync(join(root, '.env.local'), 'utf8')
    const m = env.match(new RegExp(`${name}=(.*)`))
    return m ? m[1].trim() : null
  } catch {
    return null
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || envLocal('VITE_SUPABASE_URL')
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const WEBHOOK_URL = process.env.QUALTRICS_COMPLETION_WEBHOOK_URL
const API_TOKEN = process.env.QUALTRICS_API_TOKEN || null

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const sessionId = args.find((a) => !a.startsWith('--'))

// Abort with a message. Uses exceptions + process.exitCode rather than
// process.exit(): on Windows, process.exit() with live keep-alive fetch
// sockets can crash Node with STATUS_STACK_BUFFER_OVERRUN (0xC0000409),
// turning a clean run into a garbage exit code.
class Abort extends Error {}
function die(msg) {
  throw new Abort(msg)
}

const restHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
}

async function restGet(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: restHeaders })
  if (!r.ok) die(`REST GET ${path} → HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`)
  return r.json()
}

// ---- verbatim port of update-session-progress v3 deliverWebhook ----
const WEBHOOK_MAX_ATTEMPTS = 3
const WEBHOOK_BACKOFF_MS = [2000, 4000]

async function deliverWebhook(url, token, payload) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['X-API-TOKEN'] = token
  const body = JSON.stringify(payload)

  let lastError = null
  let lastHttpStatus = null
  for (let attempt = 1; attempt <= WEBHOOK_MAX_ATTEMPTS; attempt++) {
    try {
      const r = await fetch(url, { method: 'POST', headers, body })
      const text = await r.text().catch(() => '')
      lastHttpStatus = r.status
      if (r.ok) {
        console.log(`  attempt ${attempt}: HTTP ${r.status} — delivered`)
        return { status: 'delivered', attempts: attempt, last_http_status: r.status }
      }
      console.warn(`  attempt ${attempt}: HTTP ${r.status} ${text.slice(0, 200)}`)
      lastError = `HTTP ${r.status}`
      if (r.status < 500) {
        return { status: 'failed', attempts: attempt, last_error: lastError, last_http_status: r.status }
      }
    } catch (err) {
      lastError = String(err)
      console.warn(`  attempt ${attempt}: network error — ${lastError}`)
    }
    if (attempt < WEBHOOK_MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, WEBHOOK_BACKOFF_MS[attempt - 1]))
    }
  }
  return { status: 'failed', attempts: WEBHOOK_MAX_ATTEMPTS, last_error: lastError, ...(lastHttpStatus ? { last_http_status: lastHttpStatus } : {}) }
}

// ---- rebuild the payload exactly as the edge function does ----
async function main() {
  if (!sessionId || !/^[0-9a-fA-F-]{36}$/.test(sessionId)) die('usage: node scripts/refire-webhook.mjs <session_id> [--dry-run]')
  if (!SUPABASE_URL) die('SUPABASE_URL not set and .env.local not readable')
  if (!SERVICE_KEY) die('SUPABASE_SERVICE_ROLE_KEY is required (dashboard → Project Settings → API)')
  if (!WEBHOOK_URL && !dryRun) die('QUALTRICS_COMPLETION_WEBHOOK_URL is required (same value as the edge-function secret)')

  const sessions = await restGet(
    `sessions?id=eq.${sessionId}&select=id,status,completed_at,access_code_id,metadata_json`,
  )
  if (!sessions.length) die(`session ${sessionId} not found`)
  const session = sessions[0]
  if (session.status !== 'completed') die(`session is '${session.status}' — only completed sessions have a webhook to re-fire`)
  if (!session.access_code_id) die('session has no access_code_id')

  const codes = await restGet(
    `access_codes?id=eq.${session.access_code_id}&select=code,external_ref,intervention_id`,
  )
  if (!codes.length) die('access code row not found')
  const code = codes[0]
  if (!code.external_ref) die('access code has no external_ref — nothing for Qualtrics to match; the webhook is correctly skipped for this session')

  let interventionSlug = null
  if (code.intervention_id) {
    const ivs = await restGet(`interventions?id=eq.${code.intervention_id}&select=slug`)
    interventionSlug = ivs[0]?.slug || null
  }

  const payload = {
    external_ref: code.external_ref,
    code: code.code,
    intervention_slug: interventionSlug,
    session_id: session.id,
    completed_at: session.completed_at,
  }

  const prior = session.metadata_json?.webhook
  console.log(`session ${session.id}`)
  console.log(`  prior webhook record: ${prior ? JSON.stringify(prior) : '(none — pre-v3 completion)'}`)
  console.log(`  payload: ${JSON.stringify(payload)}`)
  if (prior?.status === 'delivered') {
    console.warn('  WARNING: record says already delivered — a re-fire may re-send the confirmation email (see header). Continuing because you asked.')
  }

  if (dryRun) {
    console.log('  --dry-run: not sending.')
    return 0
  }

  console.log(`  POST ${WEBHOOK_URL}`)
  const result = await deliverWebhook(WEBHOOK_URL, API_TOKEN, payload)

  // Update the record (merge; refired marks recovery-path delivery)
  const merged = {
    ...(session.metadata_json || {}),
    webhook: { ...result, at: new Date().toISOString(), refired: true },
  }
  const patch = await fetch(`${SUPABASE_URL}/rest/v1/sessions?id=eq.${sessionId}`, {
    method: 'PATCH',
    headers: { ...restHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({ metadata_json: merged }),
  })
  if (!patch.ok) die(`metadata update failed: HTTP ${patch.status} ${(await patch.text()).slice(0, 200)}`)

  console.log(`  recorded: ${JSON.stringify(merged.webhook)}`)
  return result.status === 'delivered' ? 0 : 1
}

try {
  process.exitCode = await main()
} catch (err) {
  if (err instanceof Abort) console.error(`error: ${err.message}`)
  else console.error(err)
  process.exitCode = 1
}
