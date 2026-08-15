// Real cross-activity pull-forward for the Plan activity (Draft 72,
// Plan v4.0 — closes the flow-integration item deferred since Draft 21).
//
// In a live session, every item renderer receives `sessionData`: the
// token_key-keyed map of saved response payloads (restored on resume by
// get-session-responses). This module maps those raw upstream payloads
// into the exact `planData` contract Plan.jsx has rendered since v3.x —
// the component's screens, review, and PNG/PDF keepsake don't change
// shape, only their source.
//
// `src/lib/planDemoData.js` remains strictly the sandbox / IRB-preview
// fallback, used only when no real source payloads exist.
//
// Upstream payload shapes (each activity owns its own; keys verified
// against the source components 2026-08-15):
//   belonging_skills_sort → { willing_to_try: [bsId], not_interested: [bsId],
//     unplaced: [bsId], already_doing: [bsId] }
//   getting_unstuck → { appraisals: { [id]: { selected, strategy,
//     response?, and_statement?, randomly_selected?, text? (a_other) } } }
//   allies_safety_net → { allies: [{id, name, custom, support_types}],
//     removed_via_inspect: [allyId], strengthened: { [type]:
//     { additional_person, action, skipped } } }
//   letter_builder → { letter }
//   who_i_am_poem → { full_poem_text } (v2.7+)
//   self_reflection → { inclusion: { memory, thoughts, feelings } }

import { ALL_BELONGING_SKILLS } from './planDemoData.js'
import { APPRAISAL_ITEMS } from './appraisals.js'

// Per-skill "How could you demonstrate this skill?" placeholder seeds.
// All 7 need one because any subset can surface (the demo data only
// carried the three skills it hardcoded).
const HOW_EXAMPLES = {
  bs1: 'e.g., putting my phone down when my sister is telling me about her day',
  bs2: 'e.g., saying "we" and "us" when I\'m making plans with friends',
  bs3: 'e.g., thanking my foster mom for driving me to practice',
  bs4: 'e.g., offering to help before someone has to ask',
  bs5: 'e.g., asking someone to watch a movie with me this weekend',
  bs6: 'e.g., looping the new kid into the game we\'re already playing',
  bs7: 'e.g., staying calm and talking it out instead of walking away',
}

const SOURCE_KEYS = [
  'belonging_skills_sort',
  'getting_unstuck',
  'allies_safety_net',
  'letter_builder',
  'who_i_am_poem',
  'self_reflection',
]

// True when the session has saved at least one upstream payload — the
// signal to render from real data instead of the synthetic demo set.
export function hasRealPlanSources(sessionData) {
  return !!sessionData && SOURCE_KEYS.some((k) => sessionData[k])
}

function toSkillEntry(id) {
  const s = ALL_BELONGING_SKILLS.find((x) => x.id === id)
  return s ? { ...s, howExample: HOW_EXAMPLES[id] || '' } : null
}

// Build the Plan's `planData` contract from real session payloads.
// Returns null when no upstream payloads exist (callers fall back to
// PLAN_DEMO_DATA). Every section handles missing/half-done upstream
// activities gracefully (Draft 72 Part C) — the Plan must always be
// completable and the keepsake must never look broken.
export function buildRealPlanData(sessionData) {
  if (!hasRealPlanSources(sessionData)) return null

  const bss = sessionData.belonging_skills_sort || {}
  const gu = sessionData.getting_unstuck || {}
  const asn = sessionData.allies_safety_net || {}

  // Skills to Try — the kid's willing-to-try bucket, resolved through the
  // shared behaviors set (never duplicate the text). Empty bucket → offer
  // the FULL skills list to browse and pick one from (mirrors GU v5.9's
  // spirit: the kid still does the practice), flagged so Screen 2 can
  // explain.
  const willingIds = Array.isArray(bss.willing_to_try) ? bss.willing_to_try : []
  let willingToTrySkills = willingIds.map(toSkillEntry).filter(Boolean)
  let skillsFromFullList = false
  if (willingToTrySkills.length === 0) {
    willingToTrySkills = ALL_BELONGING_SKILLS.map((s) => ({
      ...s,
      howExample: HOW_EXAMPLES[s.id] || '',
    }))
    skillsFromFullList = true
  }

  // Radar list — skills the kid put in "not now" or never placed. When
  // the full-list fallback fired, the radar duplicates the pick list, so
  // suppress it.
  const notTriedYetIds = skillsFromFullList
    ? []
    : [
        ...(Array.isArray(bss.not_interested) ? bss.not_interested : []),
        ...(Array.isArray(bss.unplaced) ? bss.unplaced : []),
      ]

  // Thoughts to Practice — Getting Unstuck's worked thoughts (including
  // the v5.9 randomly-selected fallback pair; they carry the same
  // selected+strategy shape). Challenge → the kid's reframe. Both/And →
  // the softened root joined with the kid's AND-completion, matching how
  // GU's own builder presents the sentence.
  const appraisalById = Object.fromEntries(APPRAISAL_ITEMS.map((i) => [i.id, i]))
  const pickedThoughts = Object.entries(gu.appraisals || {})
    .filter(([, e]) => e && e.selected && e.strategy)
    .map(([id, e]) => {
      const reg = appraisalById[id]
      const original = reg?.text || e.text || ''
      let tellYourself = ''
      if (e.strategy === 'both_and') {
        const statement = (e.and_statement || '').trim()
        const root = reg?.both_and_root || original
        tellYourself = statement ? `${root} AND ${statement}` : ''
      } else {
        tellYourself = (e.response || '').trim()
      }
      return tellYourself ? { original, tellYourself, strategy: e.strategy } : null
    })
    .filter(Boolean)

  // Your People — kept allies (post-Inspect) + non-skipped Strengthen
  // entries with actual content.
  const removed = new Set(
    Array.isArray(asn.removed_via_inspect) ? asn.removed_via_inspect : [],
  )
  const keptAllies = (Array.isArray(asn.allies) ? asn.allies : [])
    .filter((a) => a && !removed.has(a.id))
    .map((a) => ({ id: a.id, name: a.name, types: a.support_types || [] }))
  const strengthening = ['practical', 'emotional', 'social']
    .map((t) => {
      const e = asn.strengthened?.[t]
      if (!e || e.skipped) return null
      const person = (e.additional_person || '').trim()
      const action = (e.action || '').trim()
      return person || action ? { type: t, person, action } : null
    })
    .filter(Boolean)

  const letter = (sessionData.letter_builder?.letter || '').trim()
  const poemText = (sessionData.who_i_am_poem?.full_poem_text || '').trim()
  const inclusionText = (sessionData.self_reflection?.inclusion?.memory || '').trim()

  return {
    willingToTrySkills,
    skillsFromFullList,
    inclusionText,
    notTriedYetIds,
    pickedThoughts,
    keptAllies,
    strengthening,
    letter,
    poemLines: poemText
      ? poemText.split('\n').map((l) => l.trim()).filter(Boolean)
      : [],
  }
}
