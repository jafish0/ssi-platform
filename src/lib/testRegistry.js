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
const Pretest = lazy(() => import('../activities/Pretest.jsx'))

// --- Registry ---
export const TEST_REGISTRY = [
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
    id: 'pretest',
    displayName: 'Pretest',
    category: 'Ready for Roots test',
    description:
      'The pretest survey shown before activities begin. Captures demographics and baseline measures (Beck Hopelessness, Adolescent Sense of Control, UCLA Loneliness, Need to Belong, Belonging Promoting Behaviors, Belonging Worries, Program Expectation).',
    component: Pretest,
    mockProps: {},
  },
]

export function findTestEntry(id) {
  return TEST_REGISTRY.find((e) => e.id === id) || null
}
