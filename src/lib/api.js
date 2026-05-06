import { supabase } from './supabase.js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function parseAndThrow(res) {
  let data
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || 'Something went wrong'
    const err = new Error(message)
    err.status = res.status
    err.code = data && data.code
    throw err
  }
  return data
}

// Anonymous edge-function call — uses the publishable anon key only.
// Used for participant flows (validate-code, save-response, etc.).
export async function callEdgeFunction(name, body) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
  return parseAndThrow(res)
}

// Authenticated edge-function call — sends the signed-in user's JWT so the
// function can verify the caller's identity (e.g. for admin-only actions
// like invite-admin / list-admins).
export async function callAuthedEdgeFunction(name, body) {
  const { data: sess } = await supabase.auth.getSession()
  const token = sess?.session?.access_token
  if (!token) {
    const err = new Error('Not signed in.')
    err.status = 401
    throw err
  }
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body || {}),
  })
  return parseAndThrow(res)
}
