// mint-access-code: server-to-server endpoint for partner systems
// (currently Qualtrics consent flow) to mint a participant access code
// for a configured intervention.
//
// Auth: shared secret, accepted from EITHER the `x-partner-key` header
// (documented primary) or `Authorization` (optionally `Bearer `-prefixed).
// Both are read because the two Qualtrics mechanisms differ: a Survey Flow
// web service element can name its own header, but a Workflow WebService
// task's stored credential always sends `Authorization: <token>` and its
// editor offers no way to rename it. JWT verification is disabled because
// Qualtrics has no Supabase JWT, so the value reaches this function
// verbatim and the shared secret is the actual auth gate.
//
// ⚠️ PREFER `x-partner-key` WHEREVER THE HEADER NAME CAN BE SET. The
// gateway does not *enforce* Authorization here, but it does *parse* it:
// a value it can't recognize as a Supabase key is logged to
// `function_edge_logs` as `request.sb.apikey.authorization.prefix` — the
// first 10 characters of the secret — with `...authorization.error =
// "invalid"`. `x-partner-key` is not captured by the log pipeline at all.
// So the Authorization path deposits a partial copy of the secret into
// project logs on every call (measured, not theorized: a 32-char sentinel
// logged exactly 10 chars). That is a confidentiality cost, not a bypass
// — ~130 bits remain and the 1000/day post-auth cap bounds abuse — but it
// means the Authorization-borne key should be treated as lower-trust
// material on a rotation schedule, and nothing that CAN send
// `x-partner-key` should send `Authorization` instead.
//
// ⚠️ DEPLOYMENT: this file is the repo-tracked source of truth. It MUST
// be deployed with verify_jwt DISABLED:
//
//   npx supabase functions deploy mint-access-code --no-verify-jwt --project-ref fflezknnpmbemeqyqxml
//
// Do NOT deploy this function through the Supabase MCP tool — MCP deploys
// flip verify_jwt back to true (the documented submit-feedback landmine),
// and Qualtrics sends no JWT, so that would break the integration ahead
// of the partner-key check. The other three public functions are deployed
// via MCP; this one is CLI-only for that reason.
//
// Mirrors the algorithm in src/lib/codes.js (PREFIX-XXXX-XXXX, no
// ambiguous chars). Edge functions can't import from src/, so the small
// algorithm is reimplemented here.
//
// v2 (Draft 77): daily rate limit keyed on the PARTNER KEY, not the IP —
// Qualtrics fires two mints per consent and batches can share one egress
// IP, so an IP cap could throttle legitimate consent bursts. 1000/day
// bounds a leaked-key incident at two orders of magnitude above any
// realistic consent volume. Counted AFTER auth so unauthenticated probes
// can't exhaust the partner's budget. Fails OPEN on counter errors.
//
// v3 (Draft 84): also accept the shared secret from `Authorization` (see
// the Auth note above). Unblocks the Qualtrics Workflow that replaced the
// Survey Flow web service elements after those were found never to fire
// on real submissions.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-partner-key',
  'Access-Control-Max-Age': '86400',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

// Mirrors src/lib/codes.js — keep in sync.
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
function randomGroup(len: number) {
  let out = ''
  for (let i = 0; i < len; i++) {
    out += CHARSET[Math.floor(Math.random() * CHARSET.length)]
  }
  return out
}
function prefixFromSlug(slug: string) {
  if (!slug) return 'CODE'
  const parts = slug.split(/[-_\s]+/).filter(Boolean)
  if (parts.length >= 2) {
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 4)
  }
  return slug.slice(0, 4).toUpperCase()
}
function generateAccessCode(prefix: string) {
  const safePrefix = (prefix || 'CODE')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6) || 'CODE'
  return `${safePrefix}-${randomGroup(4)}-${randomGroup(4)}`
}

// Slugs the partner is authorized to mint codes for. Anything outside this
// list is rejected even if the intervention exists, so a leaked partner key
// can't mint codes for arbitrary studies.
const ALLOWED_SLUGS = new Set(['ready-set-dedicate', 'rsd-follow-up-90d'])

// Public app origin used to assemble the participant URL in the response.
// Lives here rather than in env vars because it's not a secret and never
// changes between environments — every code is for the same SSI domain.
const APP_BASE_URL = 'https://ssi.ctac.app'

// Rate limit (Draft 77): per-partner-key daily cap, counted post-auth.
const RATE_LIMIT_MAX_PER_DAY = 1000
async function isRateLimited(supabase: ReturnType<typeof createClient>) {
  try {
    const day = new Date().toISOString().slice(0, 10)
    const bucket = `mint-access-code:partner:${day}`
    const { data, error } = await supabase.rpc('bump_rate_limit', { p_bucket: bucket })
    if (error) {
      console.warn('[rate-limit] counter error, failing open', String(error.message || error))
      return false
    }
    if (typeof data === 'number' && data > RATE_LIMIT_MAX_PER_DAY) {
      console.warn('[rate-limit] limit hit', { bucket, count: data })
      return true
    }
    return false
  } catch (err) {
    console.warn('[rate-limit] failing open', String(err))
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  // Auth
  const expected = Deno.env.get('PARTNER_API_KEY_QUALTRICS')
  if (!expected) {
    console.error('PARTNER_API_KEY_QUALTRICS is not configured')
    return json({ error: 'Server misconfigured' }, 500)
  }
  // v3 (Draft 84): Qualtrics Workflow WebService tasks send the stored
  // credential as `Authorization: <token>` with no way to rename the
  // header, so accept it there as well as in our documented
  // `x-partner-key`. x-partner-key wins when both are present. Trimmed
  // because an invisible trailing newline pasted into a credential field
  // would otherwise read as a bare "Invalid partner key" — it can only
  // ever remove whitespace, never match a different secret.
  const provided = (
    req.headers.get('x-partner-key') ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') ||
    ''
  ).trim()
  if (provided !== expected) {
    return json({ error: 'Invalid partner key' }, 401)
  }

  // Parse + validate input
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
  const slug = String(payload?.intervention_slug || '').trim()
  if (!slug) return json({ error: 'intervention_slug is required' }, 400)
  if (!ALLOWED_SLUGS.has(slug)) {
    return json({ error: `intervention_slug "${slug}" is not allowed` }, 400)
  }
  const cohort_label = payload?.cohort_label ? String(payload.cohort_label).trim() : null
  const external_ref = payload?.external_ref ? String(payload.external_ref).trim() : null
  const max_uses =
    payload?.max_uses === undefined || payload?.max_uses === null
      ? null
      : Number.isInteger(payload.max_uses) && payload.max_uses > 0
        ? payload.max_uses
        : null
  if (payload?.max_uses !== undefined && payload?.max_uses !== null && max_uses === null) {
    return json({ error: 'max_uses must be a positive integer or null' }, 400)
  }
  let expires_at: string | null = null
  if (payload?.expires_at) {
    const d = new Date(payload.expires_at)
    if (Number.isNaN(d.getTime())) {
      return json({ error: 'expires_at must be an ISO 8601 timestamp' }, 400)
    }
    expires_at = d.toISOString()
  }

  // Service-role client
  const url = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(url, serviceKey)

  if (await isRateLimited(supabase)) {
    return json({ error: 'Rate limit exceeded' }, 429)
  }

  // Look up intervention
  const { data: intervention, error: ivErr } = await supabase
    .from('interventions')
    .select('id, slug, name, is_active, current_version_id')
    .eq('slug', slug)
    .maybeSingle()
  if (ivErr) {
    console.error('intervention lookup failed', ivErr)
    return json({ error: 'Lookup failed' }, 500)
  }
  if (!intervention) {
    return json({ error: `intervention "${slug}" not found` }, 404)
  }
  if (!intervention.is_active) {
    return json(
      { error: `intervention "${slug}" is not active`, code: 'inactive_intervention' },
      409,
    )
  }
  if (!intervention.current_version_id) {
    return json(
      { error: `intervention "${slug}" has no published version`, code: 'unpublished_intervention' },
      409,
    )
  }

  // Insert with one retry on unique-constraint collision (Postgres 23505).
  const prefix = prefixFromSlug(slug)
  let inserted: any = null
  for (let attempt = 1; attempt <= 2; attempt++) {
    const code = generateAccessCode(prefix)
    const { data, error } = await supabase
      .from('access_codes')
      .insert({
        intervention_id: intervention.id,
        code,
        cohort_label,
        max_uses,
        expires_at,
        external_ref,
        is_active: true,
      })
      .select('id, code, expires_at, external_ref, intervention_id')
      .single()
    if (!error) {
      inserted = data
      break
    }
    if (error.code === '23505' && attempt < 2) {
      // Unique-constraint collision on `code` — extraordinarily unlikely
      // (8 chars from 31-char charset = ~9.5e11 space). Retry once.
      console.warn('mint-access-code: code collision, retrying once', { code })
      continue
    }
    console.error('access_codes insert failed', error)
    return json({ error: error.message || 'Insert failed' }, 500)
  }
  if (!inserted) {
    return json({ error: 'Could not allocate a unique code; try again.' }, 500)
  }

  return json({
    code: inserted.code,
    intervention_slug: intervention.slug,
    url: `${APP_BASE_URL}/?code=${inserted.code}`,
    expires_at: inserted.expires_at,
    external_ref: inserted.external_ref,
  })
})
