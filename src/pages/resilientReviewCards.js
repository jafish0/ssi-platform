// The review cards on /resilient-demo (Resilient Roots Draft 1) and the
// blurb each dedicated page repeats at its top. Same split as
// gainsReviewCards.js so a dedicated page (/resilient-demo/<piece>) can
// import its card without pulling in the whole hub.
//
// Design system is card 1 (Josh, 2026-09-24: the priority piece for Holly
// right now, and the only one with a working page in Draft 1). The other
// three are proposals with no Open button yet. Each card's `section` is its
// own comment thread (resilientFeedbackSections.js).
//
// Section order, activity inventory, measures grid and program goals come
// from Holly's script, draft 3 (`Resilient Roots/Resilient Roots program
// development draft 3 (Holly, 2026-09-03).md`); where draft 3 and the
// original proposal disagree, draft 3 wins (Josh, 2026-09-03).

export const SECTION_ORDER = [
  'Program intro',
  'Pre-test',
  'Part 1 — Postpartum',
  'Part 2 — CBT intro and behaviors',
  'Part 3 — Trauma',
  'Part 4 — CBT: physical sensations',
  'Part 5 — Trauma and postpartum',
  'Part 6 — CBT: thoughts',
  'Conclusion',
  'Post-test',
]

// Draft 3's measures planning table: [measure, pre, immediate post, 6-week].
export const MEASURES_GRID = [
  ['Demographics', true, false, false],
  ['Knowledge quiz (trauma and CBT)', true, true, true],
  ['Parenting expectations', true, true, false],
  ['Hope for Parenting Scale (Cole et al., 2021)', true, true, true],
  ['Intention to use program strategies', true, true, false],
  ['PHQ-9', true, false, true],
  ['Program Feedback Scale', false, true, false],
  ['Self-report of strategy use', false, false, true],
  ['Mother-to-Infant Bonding Scale (Taylor et al., 2005)', false, false, true],
  ['Edinburgh postpartum depression screen', false, false, true],
]

export const REVIEW_CARDS = [
  {
    key: 'design-system',
    n: 1,
    title: 'Design system',
    section: 'review-design-system',
    blurb:
      "Here's the visual language for Resilient Roots, built from your storyboard deck and logo. Take a look and tell us what's right, what's off, and about the three swaps noted on the page.",
    links: [{ label: 'Open the design system', to: '/resilient-demo/design-system' }],
  },
  {
    key: 'overview',
    n: 2,
    title: 'Program overview and section map',
    section: 'review-overview',
    blurb:
      'One continuous session, about 45 minutes of content plus the measures. This is the order it runs in, from the script (draft 3). Does the order match how you picture the program, and are these the names you want each part to go by?',
    list: SECTION_ORDER,
    links: [],
  },
  {
    key: 'measures',
    n: 3,
    title: 'Measures plan',
    section: 'review-measures',
    blurb:
      'What participants complete at each time point, taken from the measures table in the script (draft 3). Not yet locked: instrument versions, the follow-up delivery, and what the app does after a high PHQ-9 or Edinburgh score are all still open.',
    table: MEASURES_GRID,
    links: [],
  },
  {
    key: 'action-plan',
    n: 4,
    title: 'Action plan concept',
    section: 'review-action-plan',
    blurb:
      "The action plan builds up across the session. Nearly every activity adds something to it: a support person, self-care and bonding activities, two grounding strategies, the kind of parent you want to be and how, likely triggers with body cues and a calming strategy, one core belief, and a closing reflection. At the end, participants review the whole plan and get it along with a resources and provider list. How would you like it delivered: on screen, by email, as a PDF, or some mix?",
    links: [],
  },
]

// The four program goals, verbatim from the script (draft 3).
export const PROGRAM_GOALS = [
  { n: 1, text: 'Increase knowledge on biological and psychological changes to expect during postpartum' },
  { n: 2, text: 'Improve knowledge on trauma and how experiences of trauma can impact motherhood' },
  {
    n: 3,
    text: 'Describe the interconnection of their thoughts, physical sensations, and behaviors (e.g., the cognitive triangle)',
  },
  { n: 4, text: 'Utilize cognitive and behavioral strategies to cope with postpartum challenges and support safe parenting.' },
]

// Program Map: one row per section. Activities and action-plan outputs are
// placed where the script (draft 3) puts them. Clinical goal is filled only
// where a program goal maps obviously (Draft 1): Part 1 → 1, Parts 3 and
// 5 → 2, Part 2 → 3, Parts 2/4/6 → 4. No videos are recorded yet.
export const PROGRAM_MAP = [
  {
    section: 'Intro',
    video: 'Welcome from Holly',
    activity: 'Pre-test measures',
    plan: '—',
    goal: 'TBD',
  },
  {
    section: 'Part 1 — Postpartum',
    video: 'Part 1 video',
    activity: 'Two knowledge checks',
    plan: '—',
    goal: 'Goal 1',
  },
  {
    section: 'Part 2 — CBT intro and behaviors',
    video: 'Part 2 video',
    activity:
      'Drag and sort (the 3 a.m. crying scenario → thoughts, physical sensations, behaviors) · Short response: primary support person, with an "I do not have anyone" option (→ National Maternal Mental Health Hotline, 1-833-TLC-MAMA) · Select self-care activities (with Other write-in) · Select bonding activities',
    plan: 'Support person · Self-care activities · Bonding activities',
    goal: 'Goals 3 and 4',
  },
  {
    section: 'Part 3 — Trauma',
    video: 'Part 3 video',
    activity: 'Two knowledge checks',
    plan: '—',
    goal: 'Goal 2',
  },
  {
    section: 'Part 4 — CBT: physical sensations',
    video: 'Part 4 video',
    activity: 'Select two grounding strategies',
    plan: 'Two grounding strategies',
    goal: 'Goal 4',
  },
  {
    section: 'Part 5 — Trauma and postpartum',
    video: 'Part 5 video',
    activity:
      'Free write: parenting values, then how you will live them (with an "I need help" prefilled option) · Free write: predicted triggers, where you feel it in your body, and your calming strategy',
    plan: 'Parenting values and how · Triggers, body cues, calming strategy',
    goal: 'Goal 2',
  },
  {
    section: 'Part 6 — CBT: thoughts',
    video: 'Part 6 video',
    activity: 'Pick one core belief (or write your own)',
    plan: 'One core belief',
    goal: 'Goal 4',
  },
  {
    section: 'Conclusion',
    video: 'Conclusion video',
    activity: 'Free write: closing reflection · Action plan review · Resources and provider list · Post-test measures',
    plan: 'Closing reflection',
    goal: 'TBD',
  },
]
