// Synthetic 52-participant RSD dataset used by the Demo tab on the Data
// Export page. The shape matches what AdminExportsPage expects from real
// Supabase data:
//   - `sessions`: array of session-shaped rows (id, access_code, cohort,
//     intervention_slug, version_number, status, started_at, completed_at,
//     last_active_at).
//   - `responsesByItemId`: { [session_id]: { [item_id]: response_value } }
//
// We *do* need the published RSD snapshot at runtime because the synthetic
// responses key off real item ids — this means the demo dataset always
// matches whatever's currently published.

// ---------- Seedable RNG so the demo is deterministic across reloads ----------
function mulberry32(seed) {
  let t = seed >>> 0
  return function () {
    t = (t + 0x6D2B79F5) >>> 0
    let r = t
    r = Math.imul(r ^ (r >>> 15), r | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const PARTICIPANT_COUNT = 52
const COHORT = 'Demo cohort 2026'
const INTERVENTION_SLUG = 'ready-set-dedicate'

// Generic, non-PHI-sounding placeholder content.
// (Old ALLY_NAMES free-text list removed in Draft 8 — synthetic data
// now uses the stable AlliesSafetyNet v2 tile IDs from src/lib/allyTiles.js.)
const STUCK_THOUGHT_IDS = ['st1','st2','st3','st4','st5','st6','st7','st8']
const BEHAVIOR_IDS = ['bs1','bs2','bs3','bs4','bs5','bs6','bs7']
const RACE_OPTIONS = ['white','black','native','asian','pacific','other','prefer_not']
const JOB_OPTIONS = ['supervisor','direct','senior','admin','training','other'] // (not used by RSD demographics; placeholder list)

const REFLECTION_INCLUSION = [
  { memory: 'When I joined the soccer team and they cheered for me at practice.', thoughts: 'These people see me. I belong here.', feelings: 'Happy. Surprised.' },
  { memory: 'My birthday last year — my foster family decorated the kitchen.', thoughts: 'They thought of me.', feelings: 'Loved. A little teary.' },
  { memory: 'Talking with my best friend after school last week.', thoughts: "I can be myself with her.", feelings: 'Calm. Safe.' },
  { memory: 'When my teacher picked my poem to read out loud.', thoughts: 'I have something good to share.', feelings: 'Proud. Embarrassed but okay.' },
  { memory: 'At my cousin’s house playing video games.', thoughts: 'Nobody’s judging me here.', feelings: 'Relaxed.' },
]
const REFLECTION_EXCLUSION = [
  { memory: 'When I moved schools last year and no one talked to me at lunch for a week.', thoughts: "I won’t fit in here.", feelings: 'Lonely. Embarrassed.' },
  { memory: "When my old friend group stopped inviting me out.", thoughts: 'They don’t want me.', feelings: 'Sad. Angry.' },
  { memory: 'A team meeting where everyone laughed at an inside joke I didn’t know.', thoughts: "I’m on the outside again.", feelings: 'Confused. Small.' },
  { memory: 'A holiday where I ate alone in my room.', thoughts: 'Nobody noticed I was missing.', feelings: 'Heavy.' },
  { memory: 'Being the new kid in foster placement.', thoughts: "I have to figure this out alone.", feelings: 'Scared. Tired.' },
]

const INTENTIONS = [
  'I intend to text Coach once a week to check in.',
  'I intend to notice one thing I’m grateful for each morning.',
  'I intend to ask for help when homework gets hard.',
  'I intend to invite someone to sit with me at lunch.',
  'I intend to keep showing up to practice even when I’m tired.',
]
const YETS = [
  'I haven’t made a real friend at this school yet, but I’m working on it.',
  'I haven’t opened up to my foster mom yet, but I want to.',
  'I haven’t learned how to handle conflict yet, but I’m practicing.',
  'I haven’t felt fully at home yet, but I’m getting closer.',
]
const GROWTH = [
  'I want to learn how to ask for what I need without getting upset.',
  'I want to learn how to make first moves with new friends.',
  'I want to learn how to manage stress before tests.',
  'I want to learn how to set healthy limits with people.',
]
const CELEBRATE = [
  'I’ve been making my bed every morning. I went out for the school play.',
  'I told my teacher when I needed help. I tried out for the team.',
  'I texted my friend back instead of ghosting them. I asked a question in class.',
  'I let myself cry when I needed to. I hung out with my cousin instead of staying in.',
]
const COLLEAGUE_NOTES = [
  'You don’t have to figure this out by yourself. Belonging takes time. Be gentle with yourself.',
  'Two things can be true. You can miss your old life and like your new one.',
  'Look for the people who light you up, not the ones you’re trying to impress.',
]
const POEM_LINES = {
  i_am: ['someone who keeps trying', 'a kid who feels things deep', 'still learning who I am', 'curious and stubborn'],
  i_wonder: ['why some days are heavy and some are easy', 'if my real family thinks of me', 'what I’ll be like at 25'],
  i_fear: ['being forgotten', 'getting left out again', 'starting over'],
  i_suffer_when: ['nobody notices', 'I have to pretend I’m fine'],
  i_want: ['a place that feels like home', 'people I can lean on', 'to feel like I belong'],
  i_understand: ['I can survive hard things', 'change is part of life', 'I’m not alone in feeling this way'],
  i_believe: ['I deserve to be loved'],
  i_dream: ['of having a family that sticks'],
  i_try: ['to keep my walls down', 'to show up even when it’s hard'],
  i_hope: ['I find my people', 'things keep getting better'],
}
const LETTER_SECTIONS = {
  s1_why_writing: [
    'I wanted to write to you because someone wrote me a letter once and it stuck with me.',
    'I wanted to write because I know what it feels like to think nobody gets it.',
  ],
  s2_real_talk: [
    'I know belonging can feel impossible some days. Like everyone else got the rules and you didn’t.',
    'I know it can feel like you’re carrying things people can’t see.',
  ],
  s3_both_and: [
    'Something I learned: two things can be true at the same time. You can miss your old life and like your new one.',
    'Something I learned: I can feel scared AND keep going.',
  ],
  s4_people: [
    'When things feel heavy, find one person you trust. You only need one to start.',
    'When things feel heavy, ask. People say yes more often than you think.',
  ],
  s5_advice: [
    'If I could tell you one thing, it would be: notice the small wins. They count.',
    'If I could tell you one thing, it would be: start with one small thing. You don’t have to fix everything today.',
  ],
  s6_last_thing: [
    'Before I go, I want you to remember: you’re worth knowing.',
    'Before I go, I want you to remember: better days are possible.',
  ],
}

// ---------- helpers ----------
function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}
function pickN(rng, arr, n) {
  const copy = arr.slice()
  const out = []
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rng() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}
function intInRange(rng, min, max) {
  return Math.floor(min + rng() * (max - min + 1))
}
// Synthetic answer picker for AlliesSafetyNet v3 inspect flags.
// `noisy=true` (≈20% of inspected allies) leans toward "yes" / "not_sure";
// otherwise most answers are "no" reflecting healthy allies.
function pickFlag(rng, noisy) {
  if (noisy) {
    const r = rng()
    if (r < 0.35) return 'yes'
    if (r < 0.60) return 'not_sure'
    return 'no'
  }
  const r = rng()
  if (r < 0.05) return 'yes'
  if (r < 0.15) return 'not_sure'
  return 'no'
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}
// Days/hours offset → ISO timestamp.
function daysAgoIso(days, hoursOffset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(d.getHours() - hoursOffset, 0, 0, 0)
  return d.toISOString()
}

// Walk the snapshot and build a token_key → { item_id, type, content_json } index.
function indexSnapshot(snapshot) {
  const byToken = {}
  for (const sec of snapshot?.sections || []) {
    for (const it of sec.items || []) {
      if (it.token_key) byToken[it.token_key] = it
    }
  }
  return byToken
}

// Generate a synthetic response_value for one item, given the participant
// profile. `phase` is 'pre' or 'post' so we can shift posttest distributions.
function makeResponseValue(item, rng, profile, phase) {
  const c = item.content_json || {}
  const tk = item.token_key || ''

  switch (item.type) {
    case 'page_break':
      return { advanced: true }
    case 'text_prompt':
    case 'video':
      return { viewed: true, watched: true, completion_fraction: 1, play_count: 1 }
    case 'psychometric_scale': {
      const isVas = c.format === 'vas'
      const items = c.items || []
      const anchors = isVas ? c.vas_config || {} : c.anchors || {}
      const min = anchors.min_value ?? 0
      const max = anchors.max_value ?? (isVas ? 10 : 4)
      // Baseline level reflects participant.severity (0..1) — higher means more
      // distress; adjust direction for individual item polarity.
      const baselineMid = (min + max) / 2
      const span = (max - min) / 2
      const sev = profile.severity
      // Tiny improvement (toward better) on post — mostly visible on hopelessness
      // and belong_stress items via item.token_key heuristics.
      const isImprovementToken = /hopeless|belong_stress|fear_rejection/i.test(tk)
      const isPositiveToken = /self_agency|belong_behaviors|program_helpfulness/i.test(tk)
      const postShift = phase === 'post'
        ? (isImprovementToken ? -0.6 : isPositiveToken ? 0.5 : 0.1)
        : 0
      const scale_responses = {}
      for (const sItem of items) {
        const dir = sItem.reverse_scored ? -1 : 1
        const target = baselineMid + dir * (sev - 0.5) * span * 1.2 + postShift
        const noise = (rng() - 0.5) * span * 0.6
        const raw = clamp(Math.round(target + noise), min, max)
        scale_responses[sItem.id] = raw
      }
      return { scale_responses, computed_score: null, display_shown: false }
    }
    case 'free_text': {
      const text = (() => {
        if (tk === 'intention') return pick(rng, INTENTIONS)
        if (tk === 'yet_statement') return pick(rng, YETS)
        if (tk === 'pro_growth_area') return pick(rng, GROWTH)
        if (tk === 'celebrate_areas') return pick(rng, CELEBRATE)
        if (tk === 'colleague_note') return pick(rng, COLLEAGUE_NOTES)
        if (tk === 'intention_plan') return 'I’ll start this Sunday and check in with myself each Friday.'
        if (tk === 'yet_plan') return 'I’ll bring it up with my counselor next week.'
        if (tk === 'pro_growth_plan') return 'Read one short article each week and try one thing.'
        if (tk === 'celebrate_plan') return 'Get pizza with my cousin this Friday.'
        if (tk === 'other_strategies') return 'Take 5 deep breaths before reacting.'
        if (tk === 'belonging_definition') return 'Belonging means feeling safe being myself with the people in my life.'
        if (tk === 'program_likes_post') return 'It felt like the program actually got me. The poem part was unexpected.'
        if (tk === 'program_changes_post') return 'A little shorter would be good. The videos were helpful.'
        return 'I’m still thinking about this.'
      })()
      return {
        text,
        char_count: text.length,
        word_bank_used: [],
        pull_forward_included: tk.endsWith('_plan'),
      }
    }
    case 'choice': {
      const opts = c.options || []
      if (!opts.length) return { selected: null }
      if (c.selection_type === 'multiple') {
        const n = intInRange(rng, 1, Math.min(3, opts.length))
        return { selected: pickN(rng, opts.map((o) => o.id), n) }
      }
      // For consent and incentive_register the demo always picks the "agree" / first option
      if (tk === 'consent') return { selected: 'agree' }
      if (tk === 'incentive_register') return { selected: 'yes' }
      // Quiz items — most participants get them right after at most one wrong attempt
      if (c.quiz?.correct_id) {
        const correct = c.quiz.correct_id
        const otherIds = opts.map((o) => o.id).filter((id) => id !== correct)
        const gotItOnFirst = rng() < 0.7
        const attempts = gotItOnFirst ? [correct] : [pick(rng, otherIds), correct]
        return { selected: correct, attempts, got_correct: true }
      }
      return { selected: pick(rng, opts.map((o) => o.id)) }
    }
    case 'structured_activity': {
      const fields = {}
      for (const f of c.fields || []) {
        switch (f.type) {
          case 'free_text': {
            // Demographics or plan free_text — short generic strings.
            if (f.id === 'name') fields[f.id] = `Demo Participant ${profile.id}`
            else if (f.id === 'email') fields[f.id] = `demo${profile.id}@example.org`
            else if (f.id === 'phone') fields[f.id] = '555-555-0100'
            else fields[f.id] = pick(rng, ['Trying my best.', 'Not sure yet.', 'Working on it.'])
            break
          }
          case 'single_choice': {
            const opts = f.options || []
            if (f.id === 'hispanic') fields[f.id] = profile.hispanic ? 'yes' : 'no'
            else if (opts.length) fields[f.id] = pick(rng, opts).id
            break
          }
          case 'multiple_choice': {
            const opts = f.options || []
            if (f.id === 'race') fields[f.id] = [profile.race]
            else fields[f.id] = pickN(rng, opts.map((o) => o.id), intInRange(rng, 0, Math.min(2, opts.length)))
            break
          }
          case 'number_input': {
            if (f.id === 'age') fields[f.id] = profile.age
            else if (f.id === 'years_field' || f.id === 'years_employer') fields[f.id] = intInRange(rng, 0, 5)
            else if (f.id === 'education') fields[f.id] = intInRange(rng, 6, 14)
            else if (f.id === 'confidence') fields[f.id] = intInRange(rng, f.min ?? 1, f.max ?? 10)
            else fields[f.id] = intInRange(rng, f.min ?? 0, f.max ?? 10)
            break
          }
          case 'rating': {
            fields[f.id] = intInRange(rng, f.min_value ?? 1, f.max_value ?? 5)
            break
          }
          case 'drag_and_drop': {
            const items = f.items || []
            const buckets = f.buckets || []
            const result = {}
            for (const b of buckets) result[b.id] = []
            const remaining = items.map((i) => i.id)
            for (const id of remaining) {
              const bucket = pick(rng, buckets.concat({ id: '_unplaced' }))
              if (bucket.id === '_unplaced') {
                result.unplaced = result.unplaced || []
                result.unplaced.push(id)
              } else {
                result[bucket.id].push(id)
              }
            }
            fields[f.id] = result
            break
          }
          default:
            break
        }
      }
      return { fields, pull_forward_included: {} }
    }
    case 'custom_activity': {
      const componentName = c.component_name
      if (componentName === 'GettingUnstuck') {
        // GettingUnstuck v2 (commit 7b7046e): rate ALL 8 thoughts on
        // frequency + believability; pick which to work on (≥3 on either
        // unlocks selection); strategies are Fight it / Both/And it.
        // The synthetic distributions here intentionally produce a mix —
        // most participants rate a couple thoughts highly and pick 1–3.
        const appraisals = STUCK_THOUGHT_IDS.map((id) => ({
          thought_id: id,
          thought_text: `Stuck thought ${id}`,
          frequency: intInRange(rng, 1, 5),
          believability: intInRange(rng, 1, 5),
          selected: false,
        }))
        // Pick 1–3 thoughts to "select" from the eligibility set
        const eligible = appraisals.filter(
          (a) => a.frequency >= 3 || a.believability >= 3,
        )
        const pool = eligible.length > 0 ? eligible : appraisals
        const chosen = pickN(rng, pool, Math.min(pool.length, intInRange(rng, 1, 3)))
        const chosenIds = new Set(chosen.map((a) => a.thought_id))
        for (const a of appraisals) {
          if (chosenIds.has(a.thought_id)) a.selected = true
        }
        const responses = chosen.map((a) => {
          const useFight = rng() < 0.5
          return {
            thought_id: a.thought_id,
            thought_text: a.thought_text,
            strategy: useFight ? 'fight' : 'both_and',
            ...(useFight
              ? { fight_response: 'Maybe that’s not totally true — last week Coach showed up.' }
              : { and_statement: 'there can still be people who stay.' }),
          }
        })
        return {
          activity: 'getting_unstuck',
          appraisals,
          stuck_thought_ids: [...chosenIds],
          responses,
          saved_at: new Date().toISOString(),
        }
      }
      if (componentName === 'AlliesSafetyNet') {
        // v3.0 (Draft 9 of the 2026-05-11 batch): same build payload as
        // v2.0 plus per-ally inspection state and an
        // `inspection_completed` flag. Inspection distribution: ~80%
        // inspect all allies, ~15% inspect partial, ~5% skip entirely.
        // Of inspected, ~20% have at least one "yes" flag, ~10% remove
        // at least one ally.
        //
        // v2.0 build-phase block (unchanged):
        const TILE_IDS = [
          'foster', 'bio', 'sibling', 'grandparent', 'otherfam',
          'counselor', 'teacher', 'coach', 'babysitter', 'neighbor',
          'friend', 'therapist', 'caseworker',
        ]
        const TILE_NAMES = {
          foster: 'Foster Parent', bio: 'Biological Parent', sibling: 'Sibling',
          grandparent: 'Grandparent', otherfam: 'Other family (aunts, uncles, cousins)',
          counselor: 'School Counselor', teacher: 'Teacher', coach: 'Coach',
          babysitter: 'Babysitter', neighbor: 'Neighbor', friend: 'Friend',
          therapist: 'Therapist', caseworker: 'Caseworker / Social Worker',
        }
        const bucket = rng()
        let nAllies
        let lowAllies
        if (bucket < 0.10) {
          nAllies = intInRange(rng, 0, 1)
          lowAllies = true
        } else if (bucket < 0.80) {
          nAllies = intInRange(rng, 2, 4)
          lowAllies = false
        } else {
          nAllies = intInRange(rng, 5, 7)
          lowAllies = false
        }
        const chosenIds = pickN(rng, TILE_IDS, nAllies)
        const SUPPORT_TYPE_IDS = ['practical', 'emotional', 'social']
        const allies = chosenIds.map((id) => {
          const types = pickN(rng, SUPPORT_TYPE_IDS, intInRange(rng, 1, 3))
          return { id, name: TILE_NAMES[id], custom: false, support_types: types }
        })
        // Per-type none flags: only set when we have low allies and the
        // type isn't covered. Otherwise all-false.
        const covered = new Set(allies.flatMap((a) => a.support_types))
        const none_for = {
          practical: lowAllies && !covered.has('practical') && rng() < 0.6,
          emotional: lowAllies && !covered.has('emotional') && rng() < 0.4,
          social: lowAllies && !covered.has('social') && rng() < 0.5,
        }

        // ----- v3.0 inspection state -----
        const inspectionBucket = rng()
        // Per-participant inspection coverage:
        //   <0.80 → inspect all
        //   <0.95 → inspect a partial set
        //   else  → skip entirely
        let inspectFraction
        if (inspectionBucket < 0.80) inspectFraction = 1
        else if (inspectionBucket < 0.95) inspectFraction = 0.5 + rng() * 0.4 // 50–90%
        else inspectFraction = 0

        const inspectedAllies = allies.map((a) => {
          const willInspect = rng() < inspectFraction
          if (!willInspect) return a // unchanged
          // Most inspected allies have clean "no" answers; ~20% have at
          // least one "yes" on one of the 4 dimensions.
          const noisy = rng() < 0.20
          const flags = {
            trouble: pickFlag(rng, noisy),
            isolate: pickFlag(rng, noisy),
            lies:    pickFlag(rng, noisy),
            afraid:  pickFlag(rng, noisy),
          }
          // ~10% of inspected allies get removed; bias removal slightly
          // higher when there are "yes" flags.
          const hasYes = Object.values(flags).some((v) => v === 'yes')
          const removeThreshold = hasYes ? 0.35 : 0.05
          const removed = rng() < removeThreshold
          return {
            ...a,
            inspected: true,
            flags,
            kept_in_net: !removed,
          }
        })
        const inspection_completed = inspectedAllies.every((a) => a.inspected)

        return {
          activity: 'allies_safety_net',
          version: '3.0',
          allies: inspectedAllies,
          none_for,
          inspection_completed,
          saved_at: new Date().toISOString(),
        }
      }
      if (componentName === 'SelfReflection') {
        return {
          activity: 'self_reflection',
          inclusion: pick(rng, REFLECTION_INCLUSION),
          exclusion: pick(rng, REFLECTION_EXCLUSION),
          saved_at: new Date().toISOString(),
        }
      }
      if (componentName === 'BelongingSkillsSort') {
        const shuffled = pickN(rng, BEHAVIOR_IDS, BEHAVIOR_IDS.length)
        const already = shuffled.slice(0, intInRange(rng, 1, 3))
        const willing = shuffled.slice(already.length, already.length + intInRange(rng, 1, 3))
        const unplaced = shuffled.slice(already.length + willing.length)
        return {
          activity: 'belonging_skills_sort',
          already_doing: already,
          willing_to_try: willing,
          unplaced,
          saved_at: new Date().toISOString(),
        }
      }
      if (componentName === 'WhoIAmPoem') {
        // WhoIAmPoem v2 (commit 7b7046e): 8 keyed fields on a single
        // screen; lines 6/10 reconstruct from `characteristics` at
        // render time. Old `stanza_1`, `stanza_2`, `full_poem_text`
        // are gone.
        return {
          activity: 'who_i_am_poem',
          characteristics: pick(rng, POEM_LINES.i_am),
          from: pick(rng, ['a small kitchen with the radio on', 'a house that\'s changed a few times', 'a town where the seasons matter']),
          fear: pick(rng, POEM_LINES.i_fear),
          suffer_when: pick(rng, POEM_LINES.i_suffer_when),
          want: pick(rng, POEM_LINES.i_want),
          believe: pick(rng, POEM_LINES.i_believe),
          dream: pick(rng, POEM_LINES.i_dream),
          going: pick(rng, ['somewhere I can be myself', 'closer to the people I want around', 'wherever quiet mornings are']),
          saved_at: new Date().toISOString(),
        }
      }
      if (componentName === 'LetterBuilder') {
        // LetterBuilder v2 (commit 7b7046e): collapsed 6 sections to a
        // single free-write. Save shape is now { activity, letter, saved_at }.
        // Stitch a believable letter from the legacy section lines so the
        // demo body has variety without re-curating new content.
        const letter = [
          pick(rng, LETTER_SECTIONS.s1_why_writing),
          pick(rng, LETTER_SECTIONS.s2_real_talk),
          pick(rng, LETTER_SECTIONS.s3_both_and),
          pick(rng, LETTER_SECTIONS.s5_advice),
          pick(rng, LETTER_SECTIONS.s6_last_thing),
        ].join(' ')
        return {
          activity: 'letter_builder',
          letter,
          saved_at: new Date().toISOString(),
        }
      }
      // Unknown custom activity — fall back to a stub.
      return { activity: componentName || 'unknown', saved_at: new Date().toISOString() }
    }
    default:
      return null
  }
}

// Build the demo dataset given a published RSD snapshot.
// Returns { sessions, responsesByItemId } shaped exactly like real data.
export function buildRsdDemoDataset(snapshot, opts = {}) {
  const { count = PARTICIPANT_COUNT, seed = 20260506, versionNumber = 2 } = opts
  if (!snapshot || !Array.isArray(snapshot.sections)) {
    return { sessions: [], responsesByItemId: {} }
  }
  const tokenIndex = indexSnapshot(snapshot)
  const allItems = []
  for (const sec of snapshot.sections || []) {
    for (const it of sec.items || []) allItems.push(it)
  }
  const rng = mulberry32(seed)
  const sessions = []
  const responsesByItemId = {}

  for (let i = 1; i <= count; i++) {
    const id = String(i).padStart(3, '0')
    const sessionId = `demo-${id}`
    const daysAgo = intInRange(rng, 1, 180)
    const startedAt = daysAgoIso(daysAgo, 1)
    const completedMinutes = intInRange(rng, 35, 55)
    const completedAt = new Date(new Date(startedAt).getTime() + completedMinutes * 60 * 1000).toISOString()

    const profile = {
      id,
      age: intInRange(rng, 11, 17),
      hispanic: rng() < 0.2,
      race: pick(rng, RACE_OPTIONS),
      severity: rng(), // 0..1; higher = more distress on baseline measures
    }

    sessions.push({
      id: sessionId,
      access_code: `DEMO-RSD-${id}`,
      cohort: COHORT,
      intervention_slug: INTERVENTION_SLUG,
      version_number: versionNumber,
      status: 'completed',
      started_at: startedAt,
      completed_at: completedAt,
      last_active_at: completedAt,
      is_demo: true,
    })

    const respMap = {}
    for (const item of allItems) {
      const tk = item.token_key || ''
      const phase = /_post$/.test(tk) ? 'post' : /_pre$/.test(tk) ? 'pre' : 'pre'
      const rv = makeResponseValue(item, rng, profile, phase)
      if (rv !== null) respMap[item.id] = rv
    }
    responsesByItemId[sessionId] = respMap
    void tokenIndex // referenced for completeness; per-token lookups happen inside makeResponseValue if needed
  }

  return { sessions, responsesByItemId }
}
