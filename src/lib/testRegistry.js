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

// --- Mock sessionData used by activities that consume pull-forward data ---
const MOCK_SESSION_DATA = {
  getting_unstuck: {
    activity: 'getting_unstuck',
    stuck_thought_ids: ['st2'],
    responses: [
      {
        thought_id: 'st2',
        thought_text: "My foster/adoptive family isn't my real family.",
        strategy: 'both_and',
        and_statement: 'there can still be a place for them in my life',
      },
    ],
  },
  allies_safety_net: {
    activity: 'allies_safety_net',
    allies: [
      { name: 'Coach Davis', support_types: ['emotional', 'social'] },
      { name: 'Ms. Johnson', support_types: ['instrumental'] },
    ],
    removed_allies: [],
    gaps_identified: [],
  },
}

// --- Registry ---
export const TEST_REGISTRY = [
  {
    id: 'getting-unstuck',
    displayName: 'Getting Unstuck',
    category: 'RSD activity',
    description: 'Identify stuck thoughts; pick a strategy (Fight or Both/And) for each.',
    component: GettingUnstuck,
    mockProps: {},
  },
  {
    id: 'allies-safety-net',
    displayName: 'Allies / Safety Net',
    category: 'RSD activity',
    description: 'Build, inspect, strengthen, and view a support network.',
    component: AlliesSafetyNet,
    mockProps: {},
  },
  {
    id: 'self-reflection',
    displayName: 'Self-Reflection',
    category: 'RSD activity',
    description: 'Inclusion + exclusion memories with thoughts/feelings.',
    component: SelfReflection,
    mockProps: {},
  },
  {
    id: 'belonging-skills-sort',
    displayName: 'Belonging Skills Sort',
    category: 'RSD activity',
    description: 'Drag-and-drop seven behaviors into "already doing" / "willing to try".',
    component: BelongingSkillsSort,
    mockProps: {},
  },
  {
    id: 'who-i-am-poem',
    displayName: 'Who I Am Poem',
    category: 'RSD activity',
    description: 'Two-stanza George-Ella-Lyons-style poem with keepsake card.',
    component: WhoIAmPoem,
    mockProps: {},
  },
  {
    id: 'letter-builder',
    displayName: 'Letter to Another Youth',
    category: 'RSD activity',
    description:
      'Six-section letter with pull-forward from Getting Unstuck and Allies/Safety Net.',
    component: LetterBuilder,
    mockProps: { sessionData: MOCK_SESSION_DATA },
  },
]

export function findTestEntry(id) {
  return TEST_REGISTRY.find((e) => e.id === id) || null
}
