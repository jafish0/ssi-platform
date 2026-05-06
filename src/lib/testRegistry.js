// Test/QA registry — used by /admin/testing to render any single activity
// or item-type renderer in isolation, with mock props.
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

const PsychometricScale = lazy(() => import('../components/items/PsychometricScale.jsx'))
const VideoPlayer = lazy(() => import('../components/items/VideoPlayer.jsx'))
const TextPrompt = lazy(() => import('../components/items/TextPrompt.jsx'))
const FreeText = lazy(() => import('../components/items/FreeText.jsx'))
const StructuredActivity = lazy(() => import('../components/items/StructuredActivity.jsx'))
const GuidedCreative = lazy(() => import('../components/items/GuidedCreative.jsx'))
const Choice = lazy(() => import('../components/items/Choice.jsx'))
const PageBreak = lazy(() => import('../components/items/PageBreak.jsx'))

// --- Mock sessionData used by item renderers that resolve pull-forward tokens ---
const MOCK_SESSION_DATA = {
  intention: { text: 'I intend to spend ten minutes each Monday reviewing what I want to learn this week.' },
  yet_statement: { text: "I haven't mastered setting boundaries with clients yet, but I'm learning." },
  pro_growth_area: { text: 'Protecting myself from secondary traumatic stress.' },
  belonging_definition: { text: 'Belonging means feeling safe being yourself around the people in your life.' },
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

// --- Sample content_json blobs ---
const SCALE_LIKERT_SAMPLE = {
  scale_name: '',
  instructions: 'Rate how true each statement feels for you right now.',
  mode: 'research_only',
  format: 'likert',
  items: [
    { id: 's1', text: 'I feel like I belong somewhere.', reverse_scored: true },
    { id: 's2', text: 'I worry about being left out.', reverse_scored: false },
    { id: 's3', text: 'I can be myself with the people I care about.', reverse_scored: true },
  ],
  anchors: { min_value: 0, max_value: 4, min_label: 'Not at all', max_label: 'Very much' },
  show_progress: true,
}

const SCALE_VAS_SAMPLE = {
  scale_name: '',
  instructions: 'Drag the slider to indicate how true each statement is for you.',
  mode: 'research_only',
  format: 'vas',
  items: [
    { id: 'v1', text: 'I will never really feel like I belong.', reverse_scored: false },
    { id: 'v2', text: 'No one understands me.', reverse_scored: false },
  ],
  vas_config: { min_value: 0, max_value: 10, min_label: 'Not at all true', max_label: 'Definitely true', step: 1 },
  show_progress: false,
}

const VIDEO_SAMPLE = {
  vimeo_url: 'https://vimeo.com/76979871',
  title: 'Sample video',
  context_before: 'A short context paragraph that appears above the player.',
  context_after: 'And another paragraph that shows after the player.',
  required_completion: false,
  show_controls: true,
}

const TEXT_PROMPT_SAMPLE = {
  heading: 'Something to think about',
  body:
    'You said earlier: "{{response.belonging_definition.text}}". Hold onto that.\n\nThis paragraph is plain copy — useful for psychoeducation, transitions, or pull-forward callouts.',
  format: 'pull_forward_highlight',
  continue_label: 'Keep going →',
}

const FREE_TEXT_SAMPLE = {
  prompt: 'What does belonging mean to you?',
  sentence_starter: 'Belonging means ',
  placeholder: 'Anything is fine here.',
  min_chars: 1,
  max_chars: 400,
  show_char_count: true,
  rows: 5,
  word_bank: [
    { id: 'wb1', text: 'feeling safe' },
    { id: 'wb2', text: 'being noticed' },
    { id: 'wb3', text: 'being yourself' },
  ],
  word_bank_label: 'Need a nudge? Tap to add:',
  pull_forward: {
    token: '{{response.intention.text}}',
    label: 'From your intention earlier:',
    user_can_exclude: true,
  },
}

const STRUCTURED_ACTIVITY_SAMPLE = {
  title: 'Mini plan',
  instructions: 'Fill in each piece. This is just a test sample.',
  fields: [
    {
      id: 'goal',
      label: 'One small thing I want to try this week',
      type: 'free_text',
      placeholder: 'e.g. text my mentor about a coffee',
      max_chars: 200,
      required: true,
    },
    {
      id: 'when',
      label: "I'll try this by:",
      type: 'single_choice',
      options: [
        { id: 'today', text: 'Today' },
        { id: 'week', text: 'This week' },
        { id: 'month', text: 'This month' },
      ],
      required: true,
    },
    {
      id: 'confidence',
      label: 'Confidence (1–10)',
      type: 'number_input',
      min: 1,
      max: 10,
      step: 1,
      required: true,
    },
    {
      id: 'support',
      label: 'Who could help?',
      type: 'multiple_choice',
      options: [
        { id: 'mentor', text: 'A mentor' },
        { id: 'peer', text: 'A peer' },
        { id: 'family', text: 'A family member' },
      ],
      required: false,
    },
  ],
  layout: 'single_column',
  completion_message: "That's your plan.",
}

const GUIDED_CREATIVE_SAMPLE = {
  title: 'Quick poem',
  artifact_type: 'poem',
  instructions: 'Just one stanza. First answer is fine.',
  stanzas: [
    {
      id: 'st1',
      prompts: [
        { id: 'p1', starter: 'I am', hint: 'two things about you', max_chars: 80, required: true },
        { id: 'p2', starter: 'I hope', hint: 'something you actually hope for', max_chars: 80, required: true },
      ],
    },
  ],
  word_banks: {
    __global__: [
      { id: 'g1', text: 'still figuring things out' },
      { id: 'g2', text: 'trying my best' },
    ],
  },
  completion_message: "That's yours to keep.",
}

const CHOICE_SAMPLE = {
  prompt: 'Which of these feels most true for you right now?',
  options: [
    { id: 'c1', text: 'I feel like I belong somewhere' },
    { id: 'c2', text: "I'm still looking for my place" },
    { id: 'c3', text: 'It depends on where I am' },
    { id: 'c4', text: "I'm not sure" },
  ],
  selection_type: 'single',
  display_style: 'card_grid',
}

const CHOICE_QUIZ_SAMPLE = {
  prompt: 'Which term describes a state of emotional, physical, and mental exhaustion caused by prolonged stress?',
  options: [
    { id: 'sts', text: 'Secondary Traumatic Stress' },
    { id: 'burnout', text: 'Burnout' },
    { id: 'moral', text: 'Moral Distress' },
  ],
  selection_type: 'single',
  display_style: 'list',
  quiz: {
    correct_id: 'burnout',
    correct_message: "Right — that's burnout.",
    incorrect_message: 'Not quite — give it another try.',
    allow_retry: true,
  },
}

const PAGE_BREAK_SAMPLE = {
  heading: "You're halfway there.",
  body: 'Take a breath. The next part is about the people in your corner.',
  continue_label: "I'm ready →",
  show_progress: true,
  animation: 'fade',
}

// --- Registry ---
export const TEST_REGISTRY = [
  // RSD custom activities
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

  // Item-type renderers
  {
    id: 'psychometric-scale-likert',
    displayName: 'Psychometric Scale — Likert',
    category: 'Item type',
    description: 'Multi-item Likert scale with reverse-scored items and a Continue button.',
    component: PsychometricScale,
    mockProps: { content: SCALE_LIKERT_SAMPLE },
  },
  {
    id: 'psychometric-scale-vas',
    displayName: 'Psychometric Scale — VAS sliders',
    category: 'Item type',
    description: 'Continuous slider scale for 0–10 / 1–10 measures.',
    component: PsychometricScale,
    mockProps: { content: SCALE_VAS_SAMPLE },
  },
  {
    id: 'video',
    displayName: 'Video player',
    category: 'Item type',
    description: 'Vimeo embed with context_before/after and optional required completion.',
    component: VideoPlayer,
    mockProps: { content: VIDEO_SAMPLE },
  },
  {
    id: 'text-prompt',
    displayName: 'Text prompt',
    category: 'Item type',
    description:
      'Display-only copy with token interpolation. Sample uses a pull-forward token to render mocked session data.',
    component: TextPrompt,
    mockProps: { content: TEXT_PROMPT_SAMPLE, sessionData: MOCK_SESSION_DATA },
  },
  {
    id: 'free-text',
    displayName: 'Free text',
    category: 'Item type',
    description: 'Open writing field with sentence starter, word bank, and pull-forward callout.',
    component: FreeText,
    mockProps: { content: FREE_TEXT_SAMPLE, sessionData: MOCK_SESSION_DATA },
  },
  {
    id: 'structured-activity',
    displayName: 'Structured activity',
    category: 'Item type',
    description: 'Multi-field form: free_text, single_choice, multiple_choice, number_input.',
    component: StructuredActivity,
    mockProps: { content: STRUCTURED_ACTIVITY_SAMPLE },
  },
  {
    id: 'guided-creative',
    displayName: 'Guided creative',
    category: 'Item type',
    description: 'Stanza/prompt builder that produces a keepsake artifact.',
    component: GuidedCreative,
    mockProps: { content: GUIDED_CREATIVE_SAMPLE },
  },
  {
    id: 'choice',
    displayName: 'Choice',
    category: 'Item type',
    description: 'Single- or multi-select with card_grid / list / chip_row styles.',
    component: Choice,
    mockProps: { content: CHOICE_SAMPLE },
  },
  {
    id: 'choice-quiz',
    displayName: 'Choice — quiz mode',
    category: 'Item type',
    description: 'Choice with quiz feedback (correct / incorrect + retry).',
    component: Choice,
    mockProps: { content: CHOICE_QUIZ_SAMPLE },
  },
  {
    id: 'page-break',
    displayName: 'Page break',
    category: 'Item type',
    description: 'Section transition card with heading, body, and Continue button.',
    component: PageBreak,
    mockProps: { content: PAGE_BREAK_SAMPLE },
  },
]

export function findTestEntry(id) {
  return TEST_REGISTRY.find((e) => e.id === id) || null
}
