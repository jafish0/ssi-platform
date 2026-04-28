// Pull-forward token resolution.
//
// Tokens look like one of:
//   {{response.<token_key>}}
//   {{response.<token_key>.<path.to.value>}}
//   {{response.<token_key>.responses.0.and_statement}}
//
// Path segments may be dot-separated string keys or numeric array indices.

export function resolveTokenPath(path, responses) {
  if (typeof path !== 'string' || !path) return undefined
  const trimmed = path.trim()

  // Strip optional "response." prefix
  const cleaned = trimmed.startsWith('response.')
    ? trimmed.slice('response.'.length)
    : trimmed

  const parts = cleaned.split('.')
  if (parts.length === 0) return undefined

  let current = responses[parts[0]]
  for (let i = 1; i < parts.length; i++) {
    if (current === null || current === undefined) return undefined
    const seg = parts[i]
    if (Array.isArray(current)) {
      const idx = Number(seg)
      if (!Number.isInteger(idx)) return undefined
      current = current[idx]
    } else if (typeof current === 'object') {
      current = current[seg]
    } else {
      return undefined
    }
  }
  return current
}

// Replace all {{response.xxx}} occurrences in a string with their resolved values.
export function interpolate(text, responses) {
  if (typeof text !== 'string') return text
  return text.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, expr) => {
    const value = resolveTokenPath(expr, responses)
    if (value === undefined || value === null) return ''
    if (typeof value === 'string') return value
    try {
      return JSON.stringify(value)
    } catch {
      return ''
    }
  })
}

// Helper: extract the bare token expression from "{{...}}" or pass-through.
export function unwrapTokenExpression(maybeWrapped) {
  if (typeof maybeWrapped !== 'string') return ''
  const m = maybeWrapped.match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/)
  return m ? m[1].trim() : maybeWrapped.trim()
}
