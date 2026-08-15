// Qualtrics-integration smoke-test harness (Draft 76).
//
// Simulates the Qualtrics side of the handshake against the LIVE edge
// functions, so the ctac.app half of the integration is verified before
// (and independently of) the Qualtrics survey build.
//
// Usage:
//   node scripts/qualtrics-smoke.mjs [--code RSD-XXXX-XXXX] [--fu-code RSD-YYYY-YYYY]
//
// Environment:
//   PARTNER_API_KEY_QUALTRICS  (optional) — with it, the harness mints its
//     own test codes exactly as Qualtrics will (same headers, same bodies).
//     Without it, the auth legs still run (asserting mint rejects
//     unauthenticated calls) and the completion legs use codes passed via
//     --code / --fu-code (mint them with matching external_refs first).
//   SUPABASE URL + anon key are read from .env.local.
//
// What it verifies, in order:
//   1. mint-access-code rejects a missing key, a wrong x-partner-key, a
//      wrong Authorization token, and the PUBLIC anon JWT (all 401).
//      The real key is NEVER sent in Authorization — see the note at the
//      mint leg for why (the gateway logs a prefix of it).
//   2. (key only) two mint calls — intervention + follow-up — return
//      code/url/slug and round-trip the fake external_ref.
//   3. validate-code creates a session on first entry (resumed: false)
//      and returns the SAME session on re-entry (resumed: true) — the
//      single-use resume contract Qualtrics's emailed links rely on.
//   4. update-session-progress completes the session (the same call the
//      client makes); get-session confirms status 'completed'.
//   5. Repeats 3–4 on the follow-up slug (rsd-follow-up-90d, live since
//      Draft 75).
//   6. Webhook: with QUALTRICS_COMPLETION_WEBHOOK_URL unset the deployed
//      function no-ops silently (verified in source) — full webhook
//      delivery is only assertable in Thursday's joint test (see
//      docs/QUALTRICS_SETUP.md §7). The harness notes which case applies.
//
// The harness leaves residue on purpose (sessions + codes are real rows);
// it prints the exact cleanup SQL at the end. Run that cleanup.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = readFileSync(join(root, '.env.local'), 'utf8')
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim()
const ANON = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim()
const PARTNER_KEY = process.env.PARTNER_API_KEY_QUALTRICS || null

const args = process.argv.slice(2)
const argVal = (name) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : null
}
let interventionCode = argVal('--code')
let followupCode = argVal('--fu-code')

const EXTERNAL_REF = `SMOKE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

let failures = 0
function check(cond, label, detail = '') {
  if (cond) console.log(`  ok   ${label}`)
  else {
    failures++
    console.error(`  FAIL ${label}${detail ? ' — ' + detail : ''}`)
  }
}
function note(label) {
  console.log(`  note ${label}`)
}

async function fn(name, body, extraHeaders = {}) {
  const r = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  })
  let data = null
  try {
    data = await r.json()
  } catch {
    /* non-JSON */
  }
  return { status: r.status, data }
}

console.log(`Qualtrics smoke harness — external_ref for this run: ${EXTERNAL_REF}\n`)

// ---- 1. mint auth enforcement ----
// Tri-state: 401 = auth enforced (secret configured, key rejected) — the
// healthy state. 500 = the PARTNER_API_KEY_QUALTRICS secret is NOT
// configured on the deployed function (its source returns "Server
// misconfigured" when the env var is missing) — a blocking action item
// for the Qualtrics build, reported loudly but distinctly from a code
// failure.
console.log('1. mint-access-code auth enforcement')
{
  const noKey = await fn('mint-access-code', { intervention_slug: 'ready-set-dedicate' })
  const badKey = await fn(
    'mint-access-code',
    { intervention_slug: 'ready-set-dedicate' },
    { 'x-partner-key': 'not-the-key' },
  )
  // Draft 84: the key is also accepted from Authorization, because that is
  // the header a Qualtrics Workflow WebService credential sends and its
  // name can't be changed there. Probe that path too — a wrong value must
  // still 401, and the PUBLIC anon JWT must never authorize.
  const badAuth = await fn(
    'mint-access-code',
    { intervention_slug: 'ready-set-dedicate' },
    { Authorization: 'Bearer not-the-key' },
  )
  const anonAuth = await fn(
    'mint-access-code',
    { intervention_slug: 'ready-set-dedicate' },
    { Authorization: `Bearer ${ANON}` },
  )
  if (noKey.status === 500 && badKey.status === 500) {
    failures++
    console.error(
      '  ACTION REQUIRED: mint-access-code returned 500 "Server misconfigured" —\n' +
        '    the PARTNER_API_KEY_QUALTRICS secret is NOT set in Supabase\n' +
        '    (dashboard → Project Settings → Edge Functions → Secrets).\n' +
        '    Qualtrics mint calls will fail until it is. Set it, then re-run.',
    )
  } else {
    check(noKey.status === 401, 'missing partner key rejected (401)', `got ${noKey.status}`)
    check(badKey.status === 401, 'wrong x-partner-key rejected (401)', `got ${badKey.status}`)
    check(badAuth.status === 401, 'wrong Authorization token rejected (401)', `got ${badAuth.status}`)
    check(
      anonAuth.status === 401,
      'public anon JWT in Authorization does NOT authorize (401)',
      `got ${anonAuth.status} — SECURITY: the public key must never mint codes`,
    )
  }
}

// ---- 2. mint (with key) ----
console.log('\n2. mint calls (as Qualtrics fires them)')
if (PARTNER_KEY) {
  // Both positive mints go via x-partner-key, deliberately — NOT via
  // Authorization, even though Authorization is the header the Qualtrics
  // Workflow uses. The Supabase gateway parses Authorization and writes
  // the first 10 characters of an unrecognized value into
  // `function_edge_logs`; x-partner-key is never captured. Sending the
  // REAL key in Authorization would deposit a prefix of it into project
  // logs on every harness run. The Authorization path gets negative-only
  // coverage above (wrong token + public anon JWT, neither of which is
  // secret), and its positive proof is the Qualtrics Workflow's own test
  // run — which has to send the real key that way regardless.
  const bodies = [
    { intervention_slug: 'ready-set-dedicate', external_ref: EXTERNAL_REF, max_uses: 1, cohort_label: 'smoke-harness' },
    { intervention_slug: 'rsd-follow-up-90d', external_ref: EXTERNAL_REF, max_uses: 1, cohort_label: 'smoke-harness' },
  ]
  for (const body of bodies) {
    const r = await fn('mint-access-code', body, { 'x-partner-key': PARTNER_KEY })
    check(r.status === 200, `mint ${body.intervention_slug} returns 200`, `got ${r.status}: ${JSON.stringify(r.data)}`)
    if (r.status === 200) {
      check(r.data.intervention_slug === body.intervention_slug, `  slug echoes (${r.data.intervention_slug})`)
      check(r.data.external_ref === EXTERNAL_REF, '  external_ref round-trips')
      check(/^https:\/\/ssi\.ctac\.app\/\?code=/.test(r.data.url), `  url shape (${r.data.url})`)
      if (body.intervention_slug === 'ready-set-dedicate') interventionCode = r.data.code
      else followupCode = r.data.code
    }
  }
} else {
  note('PARTNER_API_KEY_QUALTRICS not in env — mint legs skipped; using --code/--fu-code for the completion legs')
}

// ---- 3+4. validate → resume → complete, per slug ----
async function completionLeg(label, code, expectedSlug) {
  console.log(`\n${label} (${code || 'NO CODE PROVIDED'})`)
  if (!code) {
    note('skipped — no code available')
    return
  }
  const v1 = await fn('validate-code', { code })
  check(v1.status === 200 && v1.data?.session_id, 'first entry creates a session', JSON.stringify(v1.data))
  check(v1.data?.resumed === false, 'first entry resumed=false')
  check(v1.data?.intervention_slug === expectedSlug, `slug is ${expectedSlug}`, v1.data?.intervention_slug)
  const sid = v1.data?.session_id
  if (!sid) return

  const v2 = await fn('validate-code', { code })
  check(v2.status === 200 && v2.data?.session_id === sid, 're-entry returns the SAME session (resume-by-code)')
  check(v2.data?.resumed === true, 're-entry resumed=true')

  const done = await fn('update-session-progress', { session_id: sid, current_section: 99, status: 'completed' })
  check(done.status === 200 && done.data?.ok, 'completion call accepted')

  const gs = await fn('get-session', { session_id: sid })
  check(gs.status === 200 && gs.data?.status === 'completed', 'get-session shows completed', JSON.stringify(gs.data))

  const v3 = await fn('validate-code', { code })
  check(
    v3.status === 200 && v3.data?.session_id === sid && v3.data?.session_status === 'completed',
    'post-completion re-entry routes to the completed session (no new mint, no exhausted error)',
  )
  return sid
}

const sidA = await completionLeg('3. intervention slug', interventionCode, 'ready-set-dedicate')
const sidB = await completionLeg('4. follow-up slug', followupCode, 'rsd-follow-up-90d')

// ---- 5. webhook status ----
console.log('\n5. completion webhook')
note('QUALTRICS_COMPLETION_WEBHOOK_URL is a Supabase secret the harness cannot read.')
note('If UNSET (current state per STATE_OF_THE_PLATFORM): the deployed function no-ops silently — nothing to assert here.')
note("If SET: check the function logs for '[qualtrics-webhook try1] ok' entries for the two sessions above.")
if (PARTNER_KEY) {
  note(`Both minted codes carry external_ref ${EXTERNAL_REF}, so the webhook branch WAS entered (not the no-external_ref skip).`)
} else {
  note('Codes were supplied via --code/--fu-code — the webhook branch was entered iff they were minted with an external_ref.')
}

// ---- summary + cleanup ----
console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`)
console.log('\nCleanup SQL (run with service role):')
console.log(`  UPDATE access_codes SET is_active = false, cohort_label = 'smoke-harness (spent)' WHERE code IN ('${interventionCode || '?'}', '${followupCode || '?'}');`)
if (sidA || sidB) {
  console.log(`  -- completed smoke sessions can stay (status already 'completed'); to hide them from dashboards:`)
  console.log(`  UPDATE sessions SET status = 'abandoned' WHERE id IN (${[sidA, sidB].filter(Boolean).map((s) => `'${s}'`).join(', ')});`)
}
process.exit(failures === 0 ? 0 : 1)
