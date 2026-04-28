// Access code generation utilities.
//
// Charset excludes ambiguous characters (0/O, 1/I/L). Codes look like:
//   RSD-XXXX-XXXX
// Two 4-character groups joined by dashes, prefixed with the intervention slug.

const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomChar() {
  const idx = Math.floor(Math.random() * CHARSET.length)
  return CHARSET[idx]
}

function randomGroup(len) {
  let out = ''
  for (let i = 0; i < len; i++) out += randomChar()
  return out
}

// Build a participant access code with a custom prefix.
// Default prefix: 'RSD'. Format: PREFIX-XXXX-XXXX (8 random chars, 4+4).
export function generateAccessCode(prefix = 'RSD') {
  const safePrefix = (prefix || 'CODE')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6) || 'CODE'
  return `${safePrefix}-${randomGroup(4)}-${randomGroup(4)}`
}

// Generate N unique codes locally. Caller is responsible for ensuring DB uniqueness.
export function generateCodeBatch(count, prefix = 'RSD') {
  const set = new Set()
  while (set.size < count) {
    set.add(generateAccessCode(prefix))
  }
  return Array.from(set)
}

// Best-effort prefix derived from an intervention slug.
export function prefixFromSlug(slug) {
  if (!slug) return 'CODE'
  // 'ready-set-dedicate' -> 'RSD'
  const parts = slug.split(/[-_\s]+/).filter(Boolean)
  if (parts.length >= 2) {
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 4)
  }
  return slug.slice(0, 4).toUpperCase()
}
