// Item-type-aware flattening for the SPSS-friendly wide export and the
// matching codebook.
//
// Pure functions — no React, no Supabase. They take a published version
// snapshot (the schema) and the response data and produce flat rows.
// That keeps them testable and lets the same code run against either real
// Supabase data or the synthetic demo dataset.
//
// ---------- Column naming convention (Jessica, 2026-05-11) ----------
//
// Psychometric scales follow `<timepoint>_<scale_abbrev>_<item#>`
//   e.g.  pre_bhs_1   pre_bhs_2   post_ascs_3
// Score columns:        `<timepoint>_<scale_abbrev>_score`
//
// Demographics use bare names (no timepoint prefix) — they're captured
// once at pretest, e.g. `age`, `sex`, `race_white`, `home_years`.
//
// Activity payloads use a short activity prefix:
//   unstuck_*   safety_net_*   sort_*   poem_*   letter_*   reflect_*
//
// See SCALE_ABBREVIATIONS and ACTIVITY_PREFIXES below for the mappings.

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

// ---------- Scale abbreviation map (psychometric_scale only) ----------
// Keys are the prefix of the snapshot's token_key (the part before the
// _pre / _post / _fu suffix). Add a new entry here when introducing a
// new scale at the data layer.
const SCALE_ABBREVIATIONS = {
  hopelessness: 'bhs',          // Beck Hopelessness Scale
  self_agency: 'ascs',          // Adolescent Sense of Control Scale
  loneliness: 'ucla',           // UCLA 3-Item Loneliness Scale
  fear_rejection: 'nb',         // Need to Belong
  belong_behaviors: 'bpb',      // Belonging Promoting Behaviors
  belong_stress: 'bw',          // Belonging Worries (2 sliders)
  program_helpfulness: 'pe',    // Program Expectation
  program_acceptability: 'pa',  // Program Acceptability (post-only)
  // `appraisals` doesn't map to any item in the locked pretest doc.
  // Flagged for Jessica/Stephanie to confirm origin. Mapping to `app`
  // for now so the column name is predictable — see Discrepancy note
  // in the 2026-05-11 batch brief.
  appraisals: 'app',
}

function parseScaleTokenKey(tk) {
  // "hopelessness_pre" → { scale: "hopelessness", phase: "pre", abbrev: "bhs" }
  // Returns null if the key doesn't fit the pattern or the scale isn't mapped.
  const m = /^(.+?)_(pre|post|fu)$/.exec(String(tk || ''))
  if (!m) return null
  const scale = m[1]
  const phase = m[2]
  const abbrev = SCALE_ABBREVIATIONS[scale]
  if (!abbrev) return null
  return { scale, phase, abbrev }
}

function extractItemNumber(id) {
  // "bhs1" → 1, "ph_post1" → 1, "a9" → 9. Returns null if no trailing digits.
  const m = /(\d+)$/.exec(String(id || ''))
  return m ? parseInt(m[1], 10) : null
}

// ---------- Custom-activity short prefixes ----------
// Per Jessica's 2026-05-11 brief: keep an activity-prefixed pattern, but
// shorter than the underlying component name.
const ACTIVITY_PREFIXES = {
  GettingUnstuck: 'unstuck',
  AlliesSafetyNet: 'safety_net',
  BelongingSkillsSort: 'sort',
  WhoIAmPoem: 'poem',
  LetterBuilder: 'letter',
  SelfReflection: 'reflect',
}

// Stable list of the 8 RSD stuck-thought IDs — used to emit per-thought
// columns from the GettingUnstuck activity payload (one column per thought
// × field). Must stay in sync with src/activities/GettingUnstuck.jsx.
const STUCK_THOUGHT_IDS = ['st1', 'st2', 'st3', 'st4', 'st5', 'st6', 'st7', 'st8']

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
          const parsed = parseScaleTokenKey(tk)
          for (let i = 0; i < items.length; i++) {
            const sItem = items[i]
            const itemNum = extractItemNumber(sItem.id) ?? i + 1
            // New convention if the scale maps; fall back to the old
            // <tk>_<sItem.id> shape only for unmapped scales so nothing
            // silently disappears from the export.
            const rawName = parsed
              ? `${parsed.phase}_${parsed.abbrev}_${itemNum}`
              : `${tk}_${sItem.id}`
            cols.push({
              name: sanitizeCol(rawName),
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
            const scoreName = parsed
              ? `${parsed.phase}_${parsed.abbrev}_score`
              : `${tk}_score`
            cols.push({
              name: sanitizeCol(scoreName),
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
          const prefix = ACTIVITY_PREFIXES[componentName] || sanitizeCol(tk)
          // Per-component well-known scalars.
          if (componentName === 'GettingUnstuck') {
            // Per-thought appraisal columns. v2.0 of the activity (commit
            // 7b7046e) added frequency + believability ratings for every
            // stuck thought (not just the chosen ones). Strategy/response
            // columns are empty for unchosen thoughts.
            for (const stId of STUCK_THOUGHT_IDS) {
              cols.push({
                name: sanitizeCol(`${prefix}_freq_${stId}`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: `${stId}.frequency`,
                prompt: `How often do you have stuck thought ${stId}?`,
                allowed_values: '1–5 (Never→Always)',
                notes: 'GettingUnstuck v2 appraisal',
                extract: (rv) =>
                  rv?.appraisals?.find((a) => a.thought_id === stId)?.frequency ?? '',
              })
              cols.push({
                name: sanitizeCol(`${prefix}_belief_${stId}`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: `${stId}.believability`,
                prompt: `How strongly do you believe stuck thought ${stId}?`,
                allowed_values: '1–5 (Not at all→Completely)',
                notes: 'GettingUnstuck v2 appraisal',
                extract: (rv) =>
                  rv?.appraisals?.find((a) => a.thought_id === stId)?.believability ?? '',
              })
              cols.push({
                name: sanitizeCol(`${prefix}_selected_${stId}`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: `${stId}.selected`,
                prompt: `Did the participant choose to work on stuck thought ${stId}?`,
                allowed_values: '0 or 1',
                notes: 'GettingUnstuck v2',
                extract: (rv) =>
                  rv?.appraisals?.find((a) => a.thought_id === stId)?.selected ? 1 : 0,
              })
              cols.push({
                name: sanitizeCol(`${prefix}_strategy_${stId}`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: `${stId}.strategy`,
                prompt: `Strategy chosen for stuck thought ${stId}`,
                allowed_values: 'challenge | both_and | (blank if not chosen)',
                notes: 'GettingUnstuck v2',
                extract: (rv) =>
                  rv?.responses?.find((r) => r.thought_id === stId)?.strategy ?? '',
              })
              cols.push({
                name: sanitizeCol(`${prefix}_response_${stId}`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: `${stId}.response`,
                prompt: `Open-ended response for stuck thought ${stId}`,
                allowed_values: 'free text',
                notes: 'Challenge response or Both/And statement, depending on strategy',
                extract: (rv) => {
                  const r = rv?.responses?.find((x) => x.thought_id === stId)
                  return r?.challenge_response ?? r?.and_statement ?? ''
                },
              })
            }
            cols.push(
              {
                name: sanitizeCol(`${prefix}_thought_ids`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'stuck_thought_ids',
                prompt: 'Stuck thoughts the participant chose to work on',
                allowed_values: 'semicolon-separated thought ids',
                notes: 'GettingUnstuck',
                extract: (rv) => joinList(rv?.stuck_thought_ids),
              },
              {
                name: sanitizeCol(`${prefix}_n_challenge`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'n_challenge',
                prompt: 'Count of Challenge-strategy responses',
                allowed_values: 'integer',
                notes: 'GettingUnstuck (was n_fight before the 2026-05-11 rename)',
                extract: (rv) =>
                  (rv?.responses || []).filter((r) => r.strategy === 'challenge').length,
              },
              {
                name: sanitizeCol(`${prefix}_n_both_and`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'n_both_and',
                prompt: 'Count of Both/And-strategy responses',
                allowed_values: 'integer',
                notes: 'GettingUnstuck',
                extract: (rv) =>
                  (rv?.responses || []).filter((r) => r.strategy === 'both_and').length,
              },
            )
          } else if (componentName === 'AlliesSafetyNet') {
            // v2.0 (Draft 8 of the 2026-05-11 batch): payload shape is
            //   { allies: [{ id, name, custom, support_types: [...] }],
            //     none_for: { practical, emotional, social } }
            // Per-tile selection columns are deliberately omitted for now —
            // discuss with Jessica before encoding 15+ binary columns; they
            // may be too sparse. Counts + none-flags + names list ship.
            cols.push(
              {
                name: sanitizeCol(`${prefix}_ally_count`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'ally_count',
                prompt: 'Total deduplicated ally count',
                allowed_values: 'integer',
                notes: 'AlliesSafetyNet v2',
                extract: (rv) => (rv?.allies || []).length,
              },
              {
                name: sanitizeCol(`${prefix}_practical_count`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'practical_count',
                prompt: 'Allies providing practical support',
                allowed_values: 'integer',
                notes: 'AlliesSafetyNet v2',
                extract: (rv) =>
                  (rv?.allies || []).filter((a) => (a.support_types || []).includes('practical')).length,
              },
              {
                name: sanitizeCol(`${prefix}_emotional_count`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'emotional_count',
                prompt: 'Allies providing emotional support',
                allowed_values: 'integer',
                notes: 'AlliesSafetyNet v2',
                extract: (rv) =>
                  (rv?.allies || []).filter((a) => (a.support_types || []).includes('emotional')).length,
              },
              {
                name: sanitizeCol(`${prefix}_social_count`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'social_count',
                prompt: 'Allies providing social support',
                allowed_values: 'integer',
                notes: 'AlliesSafetyNet v2',
                extract: (rv) =>
                  (rv?.allies || []).filter((a) => (a.support_types || []).includes('social')).length,
              },
              {
                name: sanitizeCol(`${prefix}_none_practical`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'none_practical',
                prompt: 'Participant affirmed no practical support allies',
                allowed_values: '0 or 1',
                notes: 'AlliesSafetyNet v2 — explicit "none of these" tap, not just skip',
                extract: (rv) => (rv?.none_for?.practical ? 1 : 0),
              },
              {
                name: sanitizeCol(`${prefix}_none_emotional`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'none_emotional',
                prompt: 'Participant affirmed no emotional support allies',
                allowed_values: '0 or 1',
                notes: 'AlliesSafetyNet v2',
                extract: (rv) => (rv?.none_for?.emotional ? 1 : 0),
              },
              {
                name: sanitizeCol(`${prefix}_none_social`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'none_social',
                prompt: 'Participant affirmed no social support allies',
                allowed_values: '0 or 1',
                notes: 'AlliesSafetyNet v2',
                extract: (rv) => (rv?.none_for?.social ? 1 : 0),
              },
              {
                name: sanitizeCol(`${prefix}_ally_names`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'ally_names',
                prompt: 'Ally display names',
                allowed_values: 'semicolon-separated names',
                notes: 'AlliesSafetyNet v2',
                extract: (rv) => joinList((rv?.allies || []).map((a) => a.name)),
              },
              {
                name: sanitizeCol(`${prefix}_ally_ids`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'ally_ids',
                prompt: 'Ally tile IDs',
                allowed_values: 'semicolon-separated tile ids',
                notes: 'AlliesSafetyNet v2',
                extract: (rv) => joinList((rv?.allies || []).map((a) => a.id)),
              },
            )
          } else if (componentName === 'BelongingSkillsSort') {
            cols.push(
              {
                name: sanitizeCol(`${prefix}_already_doing`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'already_doing',
                prompt: 'Behaviors marked already doing',
                allowed_values: 'semicolon-separated behavior ids',
                notes: 'BelongingSkillsSort',
                extract: (rv) => joinList(rv?.already_doing),
              },
              {
                name: sanitizeCol(`${prefix}_willing_to_try`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'willing_to_try',
                prompt: 'Behaviors marked willing to try',
                allowed_values: 'semicolon-separated behavior ids',
                notes: 'BelongingSkillsSort',
                extract: (rv) => joinList(rv?.willing_to_try),
              },
              {
                name: sanitizeCol(`${prefix}_n_already`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: 'n_already',
                prompt: 'Count of behaviors already doing',
                allowed_values: 'integer',
                notes: 'BelongingSkillsSort',
                extract: (rv) => (rv?.already_doing || []).length,
              },
              {
                name: sanitizeCol(`${prefix}_n_willing`),
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
            // v2.0 (commit 7b7046e) reshaped the save payload to 8 keyed
            // fields. Emit one column per field; reconstruct full poem on
            // the analyst's side if needed.
            const POEM_FIELDS = [
              ['characteristics', 'Line 1: "I am" — two special characteristics'],
              ['from',            'Line 2: "I am from" — a place, people, or way of life'],
              ['fear',            'Line 3: "I fear"'],
              ['suffer_when',     'Line 4: "I suffer when"'],
              ['want',            'Line 5: "I want"'],
              ['believe',         'Line 7: "I believe"'],
              ['dream',           'Line 8: "I dream"'],
              ['going',           'Line 9: "I am going"'],
            ]
            for (const [field, prompt] of POEM_FIELDS) {
              cols.push({
                name: sanitizeCol(`${prefix}_${field}`),
                source_token_key: tk,
                item_type: 'custom_activity',
                sub_id: field,
                prompt,
                allowed_values: 'free text',
                notes: 'WhoIAmPoem v2',
                extract: (rv) => rv?.[field] || '',
              })
            }
          } else if (componentName === 'LetterBuilder') {
            // v2.0 (commit 7b7046e) collapsed the 6-section letter to a
            // single free-write. Just one text column now.
            cols.push({
              name: sanitizeCol(`${prefix}_text`),
              source_token_key: tk,
              item_type: 'custom_activity',
              sub_id: 'letter',
              prompt: 'Letter text (single free-write)',
              allowed_values: 'free text',
              notes: 'LetterBuilder v2',
              extract: (rv) => rv?.letter || '',
            })
          } else if (componentName === 'SelfReflection') {
            for (const ctx of ['inclusion', 'exclusion']) {
              for (const sub of ['memory', 'thoughts', 'feelings']) {
                cols.push({
                  name: sanitizeCol(`${prefix}_${ctx}_${sub}`),
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
            name: sanitizeCol(`${prefix}_json`),
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
