// Test/QA registry — used by /admin/testing to render any single activity
// in isolation, with mock props.
//
// Separate from the runtime ACTIVITY_REGISTRY (which is keyed by
// component_name and used by the engine to resolve custom_activity items).
// This registry adds metadata (id, displayName, description, category) and
// realistic mock props so the QA team can poke at one component at a time.
//
// Components are loaded lazily so the admin bundle doesn't pull every
// activity at boot.

import { lazy } from 'react'

// --- Lazy imports ---
const GettingUnstuck = lazy(() => import('../activities/GettingUnstuck.jsx'))
const AlliesSafetyNet = lazy(() => import('../activities/AlliesSafetyNet.jsx'))
const SelfReflection = lazy(() => import('../activities/SelfReflection.jsx'))
const BelongingSkillsSort = lazy(() => import('../activities/BelongingSkillsSort.jsx'))
const WhoIAmPoem = lazy(() => import('../activities/WhoIAmPoem.jsx'))
const LetterBuilder = lazy(() => import('../activities/LetterBuilder.jsx'))
const Plan = lazy(() => import('../activities/Plan.jsx'))
const Assent = lazy(() => import('../activities/Assent.jsx'))
const Pretest = lazy(() => import('../activities/Pretest.jsx'))
const Posttest = lazy(() => import('../activities/Posttest.jsx'))
const FollowUp = lazy(() => import('../activities/FollowUp.jsx'))

// --- Registry ---
export const TEST_REGISTRY = [
  {
    id: 'assent',
    displayName: 'Child Assent',
    category: 'Ready for Roots assent',
    description:
      'The child assent screen — the very first thing a participant sees, before the pretest. Reads the IRB assent, then chooses Yes (continue) or No (friendly exit). Copy verbatim from the assent document (7.22.26).',
    component: Assent,
    mockProps: {},
  },
  {
    id: 'getting-unstuck',
    displayName: 'Getting Unstuck',
    category: 'Ready for Roots activity',
    description: 'Rate stuck thoughts on frequency + believability; pick a strategy (Challenge or Both/And) for the ones you want to work on.',
    component: GettingUnstuck,
    mockProps: {},
  },
  {
    id: 'allies-safety-net',
    displayName: 'Allies / Safety Net',
    category: 'Ready for Roots activity',
    description: 'Build a safety net by tapping who provides practical, emotional, and social support.',
    component: AlliesSafetyNet,
    mockProps: {},
  },
  {
    id: 'self-reflection',
    displayName: 'Self-Reflection',
    category: 'Ready for Roots activity',
    description: 'Inclusion + exclusion memories with thoughts/feelings.',
    component: SelfReflection,
    mockProps: {},
  },
  {
    id: 'belonging-skills-sort',
    displayName: 'Belonging Skills Sort',
    category: 'Ready for Roots activity',
    description: 'Drag-and-drop seven behaviors into "already doing" / "willing to try".',
    component: BelongingSkillsSort,
    mockProps: {},
  },
  {
    id: 'who-i-am-poem',
    displayName: 'Who I Am Poem',
    category: 'Ready for Roots activity',
    description: '10-line "I am" poem on a single screen with a worked example.',
    component: WhoIAmPoem,
    mockProps: {},
  },
  {
    id: 'letter-builder',
    displayName: 'Letter to Another Youth',
    category: 'Ready for Roots activity',
    description: 'Single-screen free write — no scaffolding, no pull-forward.',
    component: LetterBuilder,
    mockProps: {},
  },
  {
    id: 'plan',
    displayName: 'Your Plan',
    category: 'Ready for Roots activity',
    description:
      'The closing activity: turns the kid\'s work across the other six into a takeable action plan — pick a skill to try (how + who + when), thoughts to practice, people in their corner, words of wisdom, and a saveable PNG/PDF keepsake. This sandbox shows synthetic demo data; in a live session the Plan reads the kid\'s real upstream payloads (v4.0).',
    component: Plan,
    mockProps: {},
  },
  // TEMP (Draft 72 verification surfaces) — unlisted: the 'internal QA'
  // category matches none of /demo's section filters, so these are
  // reachable only by direct URL (/demo/sandbox/plan-real-preview and
  // /demo/sandbox/plan-sparse-preview). They mount the REAL Plan v4.0
  // real-data path by injecting captured live-session payloads as
  // sessionData (mockProps spread after the sandbox's default
  // sessionData: {}, so it overrides). Delete alongside the other TEMP
  // demo surfaces.
  {
    id: 'plan-real-preview',
    displayName: 'Your Plan — real-data preview (QA)',
    category: 'internal QA',
    description:
      'Plan v4.0 rendering REAL upstream payloads (captured from a completed live QA session): 6 willing-to-try skills, 2 GU fallback-pair thoughts, 1 kept ally + 3 strengthen entries, letter; poem payload predates v2.7 so the poem section collapses.',
    component: Plan,
    mockProps: {
      sessionData: {
        belonging_skills_sort: { unplaced: ['bs7'], already_doing: [], not_interested: [], willing_to_try: ['bs1', 'bs2', 'bs3', 'bs4', 'bs5', 'bs6'] },
        getting_unstuck: { appraisals: {
          a3: { response: 'A more helpful thought (QA).', selected: true, strategy: 'challenge', truth_rating: 0, randomly_selected: true },
          a6: { response: 'A more helpful thought (QA).', selected: true, strategy: 'challenge', truth_rating: 0, randomly_selected: true },
        } },
        allies_safety_net: {
          allies: [{ id: 'foster-mom', name: 'Foster Mom', custom: false, support_types: ['practical', 'emotional', 'social'] }],
          removed_via_inspect: [],
          strengthened: {
            practical: { action: 'Ask for help with homework this week', skipped: false, additional_person: 'Coach' },
            emotional: { action: 'Text her on rough days', skipped: false, additional_person: 'Aunt J' },
            social: { action: 'Invite them to study Friday', skipped: false, additional_person: 'Alex' },
          },
        },
        letter_builder: { letter: 'Dear friend, belonging takes time and that is okay. (QA)' },
        who_i_am_poem: { characteristics: 'kind and funny' },
        self_reflection: { inclusion: { memory: 'When my coach put me in the starting lineup.' }, exclusion: { memory: 'x' } },
      },
    },
  },
  {
    id: 'plan-sparse-preview',
    displayName: 'Your Plan — sparse-session preview (QA)',
    category: 'internal QA',
    description:
      'Plan v4.0 with BSS + Letter skipped entirely: full-skills-list fallback with its copy, a both_and-composed thought, removed-ally filtering, one surviving strengthen entry, poem via full_poem_text, no inclusion (screen 3 skipped). Keepsake must render clean.',
    component: Plan,
    mockProps: {
      sessionData: {
        getting_unstuck: { appraisals: {
          a2: { selected: true, strategy: 'both_and', and_statement: 'people can also stay.', truth_rating: 3 },
          a_other: { selected: true, strategy: 'challenge', response: 'My own reframe.', text: 'My custom stuck thought.', truth_rating: 4 },
        } },
        allies_safety_net: {
          allies: [
            { id: 'coach', name: 'Coach', custom: false, support_types: ['practical'] },
            { id: 'friend', name: 'Friend', custom: false, support_types: ['social'] },
          ],
          removed_via_inspect: ['friend'],
          strengthened: {
            practical: { action: '', skipped: true, additional_person: '' },
            emotional: { action: 'Text her.', skipped: false, additional_person: 'Aunt J' },
            social: { action: '', skipped: false, additional_person: '' },
          },
        },
        who_i_am_poem: { characteristics: 'brave', full_poem_text: 'I am brave\nI am from here\nI am brave\nI am brave' },
        self_reflection: { inclusion: { memory: '' }, exclusion: { memory: 'x' } },
      },
    },
  },
  {
    id: 'pretest',
    displayName: 'Pretest',
    category: 'Ready for Roots test',
    description:
      'The pretest survey shown before activities begin. Captures demographics and baseline measures (Beck Hopelessness, Adolescent Sense of Control, UCLA Loneliness, Need to Belong, Belonging Promoting Behaviors, Belonging Worries, Program Expectation).',
    component: Pretest,
    mockProps: {},
  },
  {
    id: 'posttest',
    displayName: 'Posttest',
    category: 'Ready for Roots test',
    description:
      'The posttest survey shown immediately after the program. Re-asks the pretest scales that change with the intervention (BHS, ASCS, NB, Belonging Worries) plus a new Program Feedback Acceptability scale and two open-response items.',
    component: Posttest,
    mockProps: {},
  },
  {
    id: 'followup',
    displayName: 'FollowUp (90-day)',
    category: 'Ready for Roots test',
    description:
      'The 90-day follow-up survey. Same item set as the pretest where applicable (BHS, ASCS, UCLA, NB, BPB, Belonging Worries) plus the 6 shared Appraisals items from Getting Unstuck and two follow-up-only items (permanency, placement-disruption worry).',
    component: FollowUp,
    mockProps: {},
  },
]

export function findTestEntry(id) {
  return TEST_REGISTRY.find((e) => e.id === id) || null
}
