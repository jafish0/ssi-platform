// Item-type-aware flattening for the SPSS-friendly wide export and the
// matching codebook.
//
// Pure functions — no React, no Supabase. They take a published version
// snapshot (the schema) and the response data and produce flat rows.
// That keeps them testable and lets the same code run against either real
// Supabase data or the synthetic demo dataset.

// ---------- Helpers ----------

const sanitizeCol = (s) =>
  String(s || '')
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase()

const SKIP_TYPES = new Set(['page_break', 'text_prompt', 'video'])
// We DO emit columns for video items only when they have a token_key (rare
// but possible). For text_prompt / page_break there's no research signal.

function joinList(arr, sep = ';') {
  if (!Array.isArray(arr)) return ''
  return arr.filter((x) => x !== null && x !== undefined).join(sep)
}

function asScalar(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v
  if (Array.isArray(v)) return joinList(v)
  // Object → stringify so it shows up but the user knows to look closer.
  try {
    return JSON.stringify(v)
  } catch {
    return ''
  }
}

// ---------- Column planning ----------

// Walk the snapshot once and produce the list of column descriptors that
// the wide export will produce. Each descriptor knows enough to:
//   - emit its column in row order
//   - extract its value from a response_value
//   - render its codebook row
export function planWideColumns(snapshot) {
  const cols = []
  const sections = snapshot?.sections || []

  for (const section of sections) {
    for (const item of section.items || []) {
      const tk = item.token_key
      if (!tk) continue
      if (SKIP_TYPES.has(item.type)) continue
      const c = item.content_json || {}

      switch (item.type) {
        case 'psychometric_scale': {
          const items = c.items || []
          const isVas = c.format === 'vas'
          const anchors = isVas ? c.vas_config || {} : c.anchors || {}
          for (const sItem of items) {
            cols.push({
              name: sanitizeCol(`${tk}_${sItem.id}`),
              source_token_key: tk,
              item_type: item.type,
              sub_id: sItem.id,
              prompt: sItem.text || '',
              anchor_min: anchors.min_value ?? '',
              anchor_max: anchors.max_value ?? '',
              anchor_min_label: anchors.min_label || '',
              anchor_max_label: anchors.max_label || '',
              reverse_scored: !!sItem.reverse_scored,
              allowed_values:
                anchors.min_value !== undefined && anchors.max_value !== undefined
                  ? `${anchors.min_value}–${anchors.max_value}`
                  : '',
              notes: c.instructions || '',
              extract: (rv) => {
                const s = rv?.scale_responses || {}
                const v = s[sItem.id]
                return v === undefined ? '' : v
              },
            })
          }
          if (c.scoring) {
            cols.push({
              name: sanitizeCol(`${tk}_score`),
              source_token_key: tk,
              item_type: 'psychometric_scale_score',
              sub_id: '',
              prompt: c.scoring.display_label || `Computed score for ${tk}`,
              anchor_min: c.scoring.min_possible ?? '',
              anchor_max: c.scoring.max_possible ?? '',
              anchor_min_label: '',
              anchor_max_label: '',
              reverse_scored: false,
              allowed_values: '',
              notes: 'Server-side computed score (display_score mode only)',
              extract: (rv) => (rv?.computed_score == null ? '' : rv.computed_score),
            })
          }
          break
        }
        case 'free_text': {
          cols.push({
            name: sanitizeCol(tk),
            source_token_key: tk,
            item_type: item.type,
            sub_id: '',
            prompt: c.prompt || '',
            anchor_min: '',
            anchor_max: '',
            anchor_min_label: '',
            anchor_max_label: '',
            reverse_scored: false,
            allowed_values: 'free text',
            notes: '',
            extract: (rv) => (rv?.text == null ? '' : rv.text),
          })
          cols.push({
            name: sanitizeCol(`${tk}_chars`),
            source_token_key: tk,
            item_type: item.type,
            sub_id: '',
            prompt: `Character count for ${tk}`,
            anchor_min: c.min_chars ?? 0,
            anchor_max: c.max_chars ?? '',
            anchor_min_label: '',
            anchor_max_label: '',
            reverse_scored: false,
            allowed_values: 'integer',
            notes: '',
            extract: (rv) => (rv?.char_count == null ? '' : rv.char_count),
          })
          break
        }
        case 'choice': {
          if (c.selection_type === 'multiple') {
            for (const opt of c.options || []) {
              cols.push({
                name: sanitizeCol(`${tk}_${opt.id}`),
                source_token_key: tk,
                item_type: item.type,
                sub_id: opt.id,
                prompt: `${c.prompt || ''}  → ${opt.text || opt.id}`,
                anchor_min: 0,
                anchor_max: 1,
                anchor_min_label: 'not selected',
                anchor_max_label: 'selected',
                reverse_scored: false,
                allowed_values: '0 or 1',
                notes: 'Binary indicator: 1 if option selected, 0 otherwise',
                extract: (rv) => {
                  const sel = Array.isArray(rv?.selected) ? rv.selected : []
                  return sel.includes(opt.id) ? 1 : 0
                },
              })
            }
          } else {
            cols.push({
              name: sanitizeCol(tk),
              source_token_key: tk,
              item_type: item.type,
              sub_id: '',
              prompt: c.prompt || '',
              anchor_min: '',
              anchor_max: '',
              anchor_min_label: '',
              anchor_max_label: '',
              reverse_scored: false,
              allowed_values: (c.options || []).map((o) => o.id).join(' | '),
              notes: 'Selected option id',
              extract: (rv) =>
                Array.isArray(rv?.selected) ? rv.selected[0] || '' : rv?.selected || '',
            })
            // Quiz mode → also emit got_correct
            if (c.quiz?.correct_id) {
              cols.push({
                name: sanitizeCol(`${tk}_got_correct`),
                source_token_key: tk,
                item_type: 'choice_quiz',
                sub_id: '',
                prompt: `Did the participant get the quiz right? (${tk})`,
                anchor_min: 0,
                anchor_max: 1,
                anchor_min_label: 'incorrect',
                anchor_max_label: 'correct',
                reverse_scored: false,
                allowed_values: '0 or 1',
                notes: '',
                extract: (rv) => (rv?.got_correct ? 1 : 0),
              })
            }
          }
          break
        }
        case 'structured_activity': {
          for (const f of c.fields || []) {
            const labelPrompt = f.label || f.id
            switch (f.type) {
              case 'multiple_choice': {
                for (const opt of f.options || []) {
                  cols.push({
                    name: sanitizeCol(`${tk}_${f.id}_${opt.id}`),
                    source_token_key: tk,
                    item_type: 'structured_activity_field',
                    sub_id: `${f.id}.${opt.id}`,
                    prompt: `${labelPrompt} → ${opt.text || opt.id}`,
                    anchor_min: 0,
                    anchor_max: 1,
                    anchor_min_label: 'not selected',
                    anchor_max_label: 'selected',
                    reverse_scored: false,
                    allowed_values: '0 or 1',
                    notes: 'Binary indicator (multi-choice field)',
                    extract: (rv) => {
                      const arr = rv?.fields?.[f.id]
                      return Array.isArray(arr) && arr.includes(opt.id) ? 1 : 0
                    },
                  })
                }
                break
              }
              case 'drag_and_drop': {
                // For each bucket emit a count of items placed there.
                for (const b of f.buckets || []) {
                  cols.push({
                    name: sanitizeCol(`${tk}_${f.id}_${b.id}_n`),
                    source_token_key: tk,
                    item_type: 'structured_activity_field',
                    sub_id: `${f.id}.${b.id}`,
                    prompt: `${labelPrompt} → ${b.label || b.id} (count)`,
                    anchor_min: 0,
                    anchor_max: (f.items || []).length,
                    anchor_min_label: '',
                    anchor_max_label: '',
                    reverse_scored: false,
                    allowed_values: 'integer count',
                    notes: 'Number of items placed in bucket',
                    extract: (rv) => {
                      const v = rv?.fields?.[f.id]
                      const arr = v && typeof v === 'object' ? v[b.id] : null
                      return Array.isArray(arr) ? arr.length : 0
                    },
                  })
                }
                break
              }
              case 'free_text':
              case 'single_choice':
              case 'number_input':
              case 'rating':
              default: {
                cols.push({
                  name: sanitizeCol(`${tk}_${f.id}`),
                  source_token_key: tk,
                  item_type: 'structured_activity_field',
                  sub_id: f.id,
                  prompt: labelPrompt,
                  anchor_min: f.min ?? f.min_value ?? '',
                  anchor_max: f.max ?? f.max_value ?? '',
                  anchor_min_label: f.min_label || '',
                  anchor_max_label: f.max_label || '',
                  reverse_scored: false,
                  allowed_values:
                    f.type === 'single_choice'
                      ? (f.options || []).map((o) => o.id).join(' | ')
                      : f.type === 'free_text'
                        ? 'free text'
                        : f.type === 'number_input'
                          ? 'integer'
                          : f.type === 'rating'
                            ? `${f.min_value ?? ''}–${f.max_value ?? ''}`
                            : '',
                  notes: '',
                  extract: (rv) => asScalar(rv?.fields?.[f.id]),
                })
                break
              }
            }
          }
          break
        }
        case 'custom_activity': {
          const componentName = c.component_name || ''
          // Per-component well-known scalars.
          if (componentName === 'GettingUnstuck') {
            cols.push(
              {
                name: sanitizeCol(`${tk}_thought_ids`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'stuck_thought_ids',
                prompt: 'Stuck thoughts selected',
                allowed_values: 'semicolon-separated thought ids',
                notes: 'GettingUnstuck',
                extract: (rv) => joinList(rv?.stuck_thought_ids),
              },
              {
                name: sanitizeCol(`${tk}_n_fight`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'n_fight',
                prompt: 'Count of fight-strategy responses',
                allowed_values: 'integer',
                notes: 'GettingUnstuck',
                extract: (rv) =>
                  (rv?.responses || []).filter((r) => r.strategy === 'fight').length,
              },
              {
                name: sanitizeCol(`${tk}_n_both_and`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'n_both_and',
                prompt: 'Count of both/and-strategy responses',
                allowed_values: 'integer',
                notes: 'GettingUnstuck',
                extract: (rv) =>
                  (rv?.responses || []).filter((r) => r.strategy === 'both_and').length,
              },
            )
          } else if (componentName === 'AlliesSafetyNet') {
            cols.push(
              {
                name: sanitizeCol(`${tk}_n_allies`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'n_allies',
                prompt: 'Number of allies named',
                allowed_values: 'integer',
                notes: 'AlliesSafetyNet',
                extract: (rv) => (rv?.allies || []).length,
              },
              {
                name: sanitizeCol(`${tk}_n_removed`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'n_removed',
                prompt: 'Number of allies removed during inspect step',
                allowed_values: 'integer',
                notes: 'AlliesSafetyNet',
                extract: (rv) => (rv?.removed_allies || []).length,
              },
              {
                name: sanitizeCol(`${tk}_n_gaps`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'n_gaps',
                prompt: 'Number of support-type gaps identified',
                allowed_values: 'integer',
                notes: 'AlliesSafetyNet',
                extract: (rv) => (rv?.gaps_identified || []).length,
              },
              {
                name: sanitizeCol(`${tk}_ally_names`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'ally_names',
                prompt: 'Ally names',
                allowed_values: 'semicolon-separated names',
                notes: 'AlliesSafetyNet',
                extract: (rv) => joinList((rv?.allies || []).map((a) => a.name)),
              },
            )
          } else if (componentName === 'BelongingSkillsSort') {
            cols.push(
              {
                name: sanitizeCol(`${tk}_already_doing`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'already_doing',
                prompt: 'Behaviors marked already doing',
                allowed_values: 'semicolon-separated behavior ids',
                notes: 'BelongingSkillsSort',
                extract: (rv) => joinList(rv?.already_doing),
              },
              {
                name: sanitizeCol(`${tk}_willing_to_try`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'willing_to_try',
                prompt: 'Behaviors marked willing to try',
                allowed_values: 'semicolon-separated behavior ids',
                notes: 'BelongingSkillsSort',
                extract: (rv) => joinList(rv?.willing_to_try),
              },
              {
                name: sanitizeCol(`${tk}_n_already`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'n_already',
                prompt: 'Count of behaviors already doing',
                allowed_values: 'integer',
                notes: 'BelongingSkillsSort',
                extract: (rv) => (rv?.already_doing || []).length,
              },
              {
                name: sanitizeCol(`${tk}_n_willing`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'n_willing',
                prompt: 'Count of behaviors willing to try',
                allowed_values: 'integer',
                notes: 'BelongingSkillsSort',
                extract: (rv) => (rv?.willing_to_try || []).length,
              },
            )
          } else if (componentName === 'WhoIAmPoem') {
            cols.push({
              name: sanitizeCol(`${tk}_full_poem_text`),
              source_token_key: tk,
              item_type: 'custom_activity',
              sub_id: 'full_poem_text',
              prompt: 'Assembled poem',
              allowed_values: 'free text',
              notes: 'WhoIAmPoem',
              extract: (rv) => rv?.full_poem_text || '',
            })
          } else if (componentName === 'LetterBuilder') {
            cols.push(
              {
                name: sanitizeCol(`${tk}_full_letter_text`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'full_letter_text',
                prompt: 'Assembled letter',
                allowed_values: 'free text',
                notes: 'LetterBuilder',
                extract: (rv) => rv?.full_letter_text || '',
              },
              {
                name: sanitizeCol(`${tk}_used_getting_unstuck`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'used_getting_unstuck',
                prompt: 'Did the letter pull-forward Getting Unstuck content?',
                allowed_values: '0 or 1',
                notes: 'LetterBuilder',
                extract: (rv) => (rv?.pull_forward_used?.getting_unstuck ? 1 : 0),
              },
              {
                name: sanitizeCol(`${tk}_used_allies`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'used_allies',
                prompt: 'Did the letter pull-forward Allies/Safety Net content?',
                allowed_values: '0 or 1',
                notes: 'LetterBuilder',
                extract: (rv) => (rv?.pull_forward_used?.allies_safety_net ? 1 : 0),
              },
            )
          } else if (componentName === 'SelfReflection') {
            for (const ctx of ['inclusion', 'exclusion']) {
              for (const sub of ['memory', 'thoughts', 'feelings']) {
                cols.push({
                  name: sanitizeCol(`${tk}_${ctx}_${sub}`),
                  source_token_key: tk,
                  item_type: 'custom_activity',
                  sub_id: `${ctx}.${sub}`,
                  prompt: `Self-reflection — ${ctx} — ${sub}`,
                  allowed_values: 'free text',
                  notes: 'SelfReflection',
                  extract: (rv) => rv?.[ctx]?.[sub] || '',
                })
              }
            }
          }
          // Always include a JSON fallback column so nothing is lost.
          cols.push({
            name: sanitizeCol(`${tk}_json`),
            source_token_key: tk,
            item_type: 'custom_activity',
            sub_id: 'json',
            prompt: `Full JSON output for ${tk}`,
            allowed_values: 'JSON',
            notes: 'Full activity output for fidelity / future analysis',
            extract: (rv) => {
              try {
                return JSON.stringify(rv ?? null)
              } catch {
                return ''
              }
            },
          })
          break
        }
        default:
          break
      }
    }
  }
  // De-duplicate column names — guard against duplicate token_keys.
  const seen = new Map()
  for (const c of cols) {
    if (seen.has(c.name)) {
      const n = seen.get(c.name) + 1
      seen.set(c.name, n)
      c.name = `${c.name}_${n}`
    } else {
      seen.set(c.name, 1)
    }
  }
  return cols
}

// Build wide rows. `responsesByItemId` is { [session_id]: { [item_id]: response_value } }.
// `itemsByTokenKey` maps token_key → item meta (so we can look up item.id from
// the snapshot when filling values; some custom_activity rows produce multiple
// columns from one response).
export function buildWideRows({ snapshot, sessions, responsesByItemId }) {
  const cols = planWideColumns(snapshot)
  // token_key → item.id (we extract from the snapshot to avoid a second arg).
  const tokenKeyToItemId = {}
  for (const sec of snapshot?.sections || []) {
    for (const it of sec.items || []) {
      if (it.token_key) tokenKeyToItemId[it.token_key] = it.id
    }
  }
  // group cols by token_key for value extraction
  const colsByToken = {}
  for (const c of cols) {
    if (!colsByToken[c.source_token_key]) colsByToken[c.source_token_key] = []
    colsByToken[c.source_token_key].push(c)
  }

  const rows = sessions.map((s) => {
    const respMap = responsesByItemId[s.id] || {}
    const row = {
      session_id: s.id,
      access_code: s.access_code || '',
      cohort: s.cohort || '',
      intervention_slug: s.intervention_slug || '',
      version_number: s.version_number ?? '',
      status: s.status || '',
      started_at: s.started_at || '',
      completed_at: s.completed_at || '',
      last_active_at: s.last_active_at || '',
    }
    for (const tk of Object.keys(colsByToken)) {
      const itemId = tokenKeyToItemId[tk]
      const rv = itemId ? respMap[itemId] : undefined
      for (const c of colsByToken[tk]) {
        row[c.name] = c.extract(rv)
      }
    }
    return row
  })

  const FIXED = [
    'session_id',
    'access_code',
    'cohort',
    'intervention_slug',
    'version_number',
    'status',
    'started_at',
    'completed_at',
    'last_active_at',
  ]
  const headers = [...FIXED, ...cols.map((c) => c.name)]
  return { headers, rows }
}

// Codebook rows — one per column the wide export produces, plus the fixed
// session-level columns.
export function buildCodebookRows(snapshot) {
  const cols = planWideColumns(snapshot)
  const fixed = [
    { name: 'session_id', source_token_key: '', item_type: 'session', prompt: 'Internal session UUID', allowed_values: 'UUID' },
    { name: 'access_code', source_token_key: '', item_type: 'session', prompt: 'Access code used to start the session', allowed_values: '' },
    { name: 'cohort', source_token_key: '', item_type: 'session', prompt: 'Cohort label on the access code', allowed_values: '' },
    { name: 'intervention_slug', source_token_key: '', item_type: 'session', prompt: 'Slug of the intervention', allowed_values: '' },
    { name: 'version_number', source_token_key: '', item_type: 'session', prompt: 'Snapshot version the session ran on', allowed_values: 'integer' },
    { name: 'status', source_token_key: '', item_type: 'session', prompt: 'Session status', allowed_values: 'in_progress | completed | abandoned' },
    { name: 'started_at', source_token_key: '', item_type: 'session', prompt: 'When the session was started', allowed_values: 'ISO 8601 timestamp' },
    { name: 'completed_at', source_token_key: '', item_type: 'session', prompt: 'When the session was completed (null if not)', allowed_values: 'ISO 8601 timestamp' },
    { name: 'last_active_at', source_token_key: '', item_type: 'session', prompt: 'Last activity timestamp', allowed_values: 'ISO 8601 timestamp' },
  ]
  const allRows = [...fixed, ...cols].map((c) => ({
    column_name: c.name,
    source_token_key: c.source_token_key || '',
    item_type: c.item_type || '',
    prompt_text: c.prompt || '',
    response_anchor_min: c.anchor_min ?? '',
    response_anchor_max: c.anchor_max ?? '',
    response_anchor_min_label: c.anchor_min_label || '',
    response_anchor_max_label: c.anchor_max_label || '',
    reverse_scored: c.reverse_scored ? 1 : 0,
    allowed_values: c.allowed_values || '',
    notes: c.notes || '',
  }))
  const headers = [
    'column_name',
    'source_token_key',
    'item_type',
    'prompt_text',
    'response_anchor_min',
    'response_anchor_max',
    'response_anchor_min_label',
    'response_anchor_max_label',
    'reverse_scored',
    'allowed_values',
    'notes',
  ]
  return { headers, rows: allRows }
}
