// SPSS syntax (.sps) generator. Reads the same column registry that
// exportFlatten.js produces and emits an SPSS syntax file that, when
// opened in SPSS, imports the participant CSV and applies every piece
// of metadata in one syntax run — variable labels, value labels,
// measurement levels, formats, and a final SAVE to a .sav file.
//
// This is the same approach REDCap and KoboToolbox ship as their
// primary SPSS export today. (Qualtrics ships both a native .sav and
// a separate .sps for relabeling. Native-.sav is a Phase B follow-up
// if Jessica finds the syntax-run friction; see Task #11 in plans.)
//
// Validation: every variable name we emit is checked against SPSS's
// rules — 64-char max, must start with a letter, no spaces, no SPSS
// reserved words — and the generator throws with a clear error rather
// than producing a bad file. That's a hard fail-stop: a partial .sps
// would corrupt downstream analysis.

import { planWideColumns } from './exportFlatten.js'

// ---------- Per-scale value labels and measurement levels ----------
// Keyed by the prefix of the snapshot token_key (i.e. before _pre/_post),
// matching SCALE_ABBREVIATIONS in exportFlatten.js. Add entries here when
// introducing a new scale at the data layer.
const VALUE_LABELS_BY_SCALE = {
  hopelessness: {
    0: 'Absolutely disagree',
    1: 'Somewhat disagree',
    2: 'Somewhat agree',
    3: 'Absolutely agree',
  },
  self_agency: {
    1: 'Never',
    2: 'Rarely',
    3: 'Sometimes',
    4: 'Often',
    5: 'Always',
  },
  loneliness: {
    1: 'Hardly ever',
    2: 'Some of the time',
    3: 'Often',
  },
  fear_rejection: {
    1: 'Strongly disagree',
    2: 'Moderately disagree',
    3: 'Neither agree nor disagree',
    4: 'Moderately agree',
    5: 'Strongly agree',
  },
  belong_behaviors: {
    0: 'Never',
    1: 'Sometimes',
    2: 'Often',
    3: 'Always',
  },
  // belong_stress (Belonging Worries 0–10 slider) and program_helpfulness
  // (Program Expectation 1–10 slider) are continuous — no discrete labels.
  // program_acceptability post-only — anchor scheme not in locked doc;
  // leaving without explicit labels until Jessica confirms.
  // appraisals — origin unclear, see exportFlatten.js note. Skip value
  // labels to avoid mislabeling.
}

const LEVEL_BY_SCALE = {
  hopelessness: 'ordinal',
  self_agency: 'ordinal',
  loneliness: 'ordinal',
  fear_rejection: 'ordinal',
  belong_behaviors: 'ordinal',
  belong_stress: 'scale',           // 0–10 slider
  program_helpfulness: 'scale',     // 1–10 slider
  program_acceptability: 'ordinal',
  appraisals: 'ordinal',
}

// ---------- Fixed session-level columns (mirrors exportFlatten) ----------
const FIXED_COLS = [
  { name: 'session_id',        label: 'Internal session UUID',                    format: 'A36',  level: 'nominal' },
  { name: 'access_code',       label: 'Access code used to start the session',    format: 'A40',  level: 'nominal' },
  { name: 'cohort',            label: 'Cohort label on the access code',          format: 'A80',  level: 'nominal' },
  { name: 'intervention_slug', label: 'Slug of the intervention',                 format: 'A40',  level: 'nominal' },
  { name: 'version_number',    label: 'Snapshot version the session ran on',      format: 'F4',   level: 'scale'   },
  { name: 'status',            label: 'Session status',                           format: 'A20',  level: 'nominal' },
  { name: 'started_at',        label: 'When the session was started (ISO 8601)',  format: 'A25',  level: 'nominal' },
  { name: 'completed_at',      label: 'When the session was completed (ISO 8601)', format: 'A25', level: 'nominal' },
  { name: 'last_active_at',    label: 'Last activity timestamp (ISO 8601)',       format: 'A25',  level: 'nominal' },
]
const STATUS_VALUE_LABELS = {
  in_progress: 'In progress',
  completed: 'Completed',
  abandoned: 'Abandoned',
}

// ---------- SPSS variable-name validation ----------
const SPSS_RESERVED_WORDS = new Set([
  'ALL', 'AND', 'BY', 'EQ', 'GE', 'GT', 'LE', 'LT',
  'NE', 'NOT', 'OR', 'TO', 'WITH',
])

function validateSpssVarName(name) {
  if (!name) throw new Error('SPSS validation: empty variable name')
  if (name.length > 64) {
    throw new Error(`SPSS validation: variable name too long (${name.length} chars, max 64): ${name}`)
  }
  if (!/^[A-Za-z]/.test(name)) {
    throw new Error(`SPSS validation: variable name must start with a letter: ${name}`)
  }
  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error(`SPSS validation: variable name contains invalid characters: ${name}`)
  }
  if (SPSS_RESERVED_WORDS.has(name.toUpperCase())) {
    throw new Error(`SPSS validation: '${name}' is a reserved SPSS keyword`)
  }
}

function quoteString(s) {
  // SPSS string literals use single quotes; escape internal single quotes
  // by doubling them. Replace newlines/tabs with spaces — labels are
  // single-line.
  return `'${String(s ?? '').replace(/[\r\n\t]+/g, ' ').replace(/'/g, "''")}'`
}

function truncateLabel(s, max = 255) {
  // SPSS variable labels are limited to ~255 chars.
  if (!s) return ''
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

// Parse a token_key like "hopelessness_pre" → { scale: "hopelessness" }.
// Returns null for non-matching keys.
function scaleKeyForToken(tk) {
  const m = /^(.+?)_(pre|post|fu)$/.exec(String(tk || ''))
  return m ? m[1] : null
}

// Format string for the column's data type. Defaults to A1000 for strings
// and F2 for numerics — SPSS happily widens later as needed.
function inferFormat(col) {
  const av = String(col.allowed_values || '').toLowerCase()
  if (av === 'free text' || av === 'json' || av.startsWith('semicolon-separated')) {
    // 8000 covers a 5000-char letter (LetterBuilder cap) with headroom.
    // Some free-text rows include a leading semicolon list; A8000 is safe.
    return 'A8000'
  }
  if (av === 'integer count' || av === 'integer' || av === '0 or 1') {
    return 'F4'
  }
  // psychometric ranges like "0–3", "1–5", "0–10". Single digit fits F1,
  // double digit fits F2. Default to F2 — wider is safe for likert too.
  if (/^\d+[–-]\d+$/.test(av)) {
    const [, , max] = /^(\d+)[–-](\d+)$/.exec(av) || []
    return Number(max) <= 9 ? 'F1' : 'F2'
  }
  if (av && /^[a-z0-9_]+( \| [a-z0-9_]+)+$/i.test(av)) {
    // categorical id like "yes | no" — string column
    return 'A40'
  }
  return 'A100'
}

// Build VALUE LABELS group lines for psychometric_scale items whose scale
// key has known labels.
function groupValueLabels(allCols) {
  // Map from scaleKey → array of column names
  const byScale = {}
  for (const c of allCols) {
    if (c.item_type !== 'psychometric_scale') continue
    const sk = scaleKeyForToken(c.source_token_key)
    if (!sk) continue
    if (!VALUE_LABELS_BY_SCALE[sk]) continue
    if (!byScale[sk]) byScale[sk] = []
    byScale[sk].push(c.name)
  }
  const out = []
  for (const [sk, names] of Object.entries(byScale)) {
    if (names.length === 0) continue
    const labels = VALUE_LABELS_BY_SCALE[sk]
    out.push(`  ${names.join(' ')}`)
    const lvls = Object.keys(labels)
      .map(Number)
      .sort((a, b) => a - b)
    for (const v of lvls) {
      out.push(`    ${v} ${quoteString(labels[v])}`)
    }
    out.push('  /')
  }
  return out
}

function groupVariableLevels(allCols) {
  // Group every column by measurement level. Cols whose scale level isn't
  // explicitly mapped fall back to a sensible default per item_type.
  const buckets = { nominal: [], ordinal: [], scale: [] }
  for (const c of FIXED_COLS) buckets[c.level].push(c.name)
  for (const c of allCols) {
    if (c.item_type === 'psychometric_scale') {
      const sk = scaleKeyForToken(c.source_token_key)
      const lvl = (sk && LEVEL_BY_SCALE[sk]) || 'ordinal'
      buckets[lvl].push(c.name)
    } else if (c.item_type === 'psychometric_scale_score') {
      buckets.scale.push(c.name)
    } else if (c.item_type === 'choice' || c.item_type === 'choice_quiz') {
      buckets.nominal.push(c.name)
    } else {
      // free_text, custom_activity, structured_activity_field — call them
      // nominal so SPSS treats them as strings/categorical by default.
      buckets.nominal.push(c.name)
    }
  }
  const lines = []
  for (const lvl of ['ordinal', 'scale', 'nominal']) {
    if (buckets[lvl].length === 0) continue
    lines.push(`  ${buckets[lvl].join(' ')} (${lvl})`)
  }
  return lines
}

function groupFormats(allCols) {
  // Bucket by format string.
  const byFmt = {}
  for (const c of FIXED_COLS) {
    if (!byFmt[c.format]) byFmt[c.format] = []
    byFmt[c.format].push(c.name)
  }
  for (const c of allCols) {
    const fmt = inferFormat(c)
    if (!byFmt[fmt]) byFmt[fmt] = []
    byFmt[fmt].push(c.name)
  }
  const lines = []
  for (const [fmt, names] of Object.entries(byFmt)) {
    lines.push(`  ${names.join(' ')} (${fmt})`)
  }
  return lines
}

// ---------- Main generator ----------
export function buildSpssSyntax({
  snapshot,
  csvFileName = 'participant_data.csv',
  savFileName = 'participant_data.sav',
  meta = {},
}) {
  const cols = planWideColumns(snapshot)

  // VALIDATE FIRST. We refuse to emit a malformed .sps file — better to
  // throw with a clear error so the caller can surface it to the user
  // than to produce a syntax file SPSS will choke on later.
  for (const c of FIXED_COLS) validateSpssVarName(c.name)
  for (const c of cols) validateSpssVarName(c.name)

  // Compose VARIABLES list with format specifiers for GET DATA.
  const allCols = [...FIXED_COLS, ...cols.map((c) => ({
    name: c.name,
    label: c.prompt || '',
    format: inferFormat(c),
  }))]
  const variablesList = allCols.map((c) => `${c.name} ${c.format}`).join(' ')

  // Header comment.
  const generatedAt = new Date().toISOString()
  const rowsHint = typeof meta.row_count === 'number' ? `, rows ${meta.row_count}` : ''
  const versionHint = meta.snapshot_version != null
    ? `, snapshot v${meta.snapshot_version}`
    : ''
  const interventionHint = meta.intervention_slug
    ? `, intervention ${meta.intervention_slug}`
    : ''

  const lines = []
  lines.push(`* Generated by SSI Platform — ${generatedAt}${rowsHint}${versionHint}${interventionHint}.`)
  lines.push(`* Column naming convention: <timepoint>_<scale_abbrev>_<item#> for psychometric scales.`)
  lines.push(`* See INFRASTRUCTURE.md change-log entry "2026-05-11 — Export column-naming refactor" for the full mapping.`)
  lines.push('')

  // GET DATA — load the CSV.
  lines.push('GET DATA')
  lines.push('  /TYPE=TXT')
  lines.push(`  /FILE='${csvFileName}'`)
  lines.push(`  /ENCODING='UTF8'`)
  lines.push(`  /DELIMITERS=','`)
  lines.push(`  /QUALIFIER='"'`)
  lines.push('  /FIRSTCASE=2')
  lines.push(`  /VARIABLES=${variablesList}.`)
  lines.push('')

  // VARIABLE LABELS.
  lines.push('VARIABLE LABELS')
  for (const c of allCols) {
    lines.push(`  ${c.name} ${quoteString(truncateLabel(c.label))}`)
  }
  lines.push('  /.')
  lines.push('')

  // VALUE LABELS — psychometric scales + status.
  const valueLabelBlocks = groupValueLabels(cols)
  if (valueLabelBlocks.length > 0) {
    lines.push('VALUE LABELS')
    for (const ln of valueLabelBlocks) lines.push(ln)
    // Status has its own value labels.
    lines.push('  status')
    for (const [k, v] of Object.entries(STATUS_VALUE_LABELS)) {
      // Status is a string column, so its value labels use string keys.
      lines.push(`    ${quoteString(k)} ${quoteString(v)}`)
    }
    lines.push('  /.')
    lines.push('')
  }

  // VARIABLE LEVEL — measurement levels.
  const levelLines = groupVariableLevels(cols)
  if (levelLines.length > 0) {
    lines.push('VARIABLE LEVEL')
    for (const ln of levelLines) lines.push(ln)
    lines[lines.length - 1] = lines[lines.length - 1] + ' /.'
    lines.push('')
  }

  // FORMATS — covered already in VARIABLES list but emitting again as the
  // SPSS recommended pattern.
  const formatLines = groupFormats(cols)
  if (formatLines.length > 0) {
    lines.push('FORMATS')
    for (const ln of formatLines) lines.push(ln)
    lines[lines.length - 1] = lines[lines.length - 1] + ' /.'
    lines.push('')
  }

  // Save the labeled dataset.
  lines.push(`SAVE OUTFILE='${savFileName}'.`)
  lines.push('EXECUTE.')
  lines.push('')

  return lines.join('\n')
}
