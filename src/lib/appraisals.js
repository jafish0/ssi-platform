// Shared "Appraisals about self, others and future" item set — used by
// BOTH `GettingUnstuck.jsx` (the intervention activity) AND the
// FollowUp Survey (`FollowUp.jsx`). Single source of truth so any
// future wording revisions happen in exactly one place and pre/follow-up
// comparability is preserved.
//
// Source: `Final Measures/FollowUp Survey Draft Belongingness_5.2.26.docx`,
// "Appraisals about self, others and future" section. Locked 2026-05-18.
// Item wording is verbatim from the locked doc — do not paraphrase.
//
// The `dimension` field is analyst-context only (not shown in the kid's
// UI): which of the three appraisal targets each item probes
// (`future` | `self` | `others`).

// `help_suggestions` (added Draft 26, 2026-06-08) feeds the Getting
// Unstuck "I need help" button — 3+ alternative thoughts per item the
// kid can read or tap to pre-fill their response. PLACEHOLDER CONTENT
// for now: Stephanie is producing the real alternative-thought lists;
// when they arrive, swap the strings here (no UI change needed).
export const APPRAISAL_ITEMS = [
  {
    id: 'a1',
    text: 'I will never really feel like I belong.',
    dimension: 'future',
    help_suggestions: [
      '[Placeholder — Stephanie is producing real content. Example shape: "There have been moments, even brief ones, when I have felt I belonged."]',
      '[Placeholder — second alternative thought.]',
      '[Placeholder — third alternative thought.]',
    ],
  },
  {
    id: 'a2',
    text: 'Everyone will eventually leave me or give up on me.',
    dimension: 'future',
    help_suggestions: [
      '[Placeholder — alternative thought for "everyone will leave me."]',
      '[Placeholder — second alternative thought.]',
      '[Placeholder — third alternative thought.]',
    ],
  },
  {
    id: 'a3',
    text: 'I am not lovable.',
    dimension: 'self',
    help_suggestions: [
      '[Placeholder — alternative thought for "I am not lovable."]',
      '[Placeholder — second alternative thought.]',
      '[Placeholder — third alternative thought.]',
    ],
  },
  {
    id: 'a4',
    text: 'No one would want me to be a part of their family.',
    dimension: 'self',
    help_suggestions: [
      '[Placeholder — alternative thought for "no one would want me."]',
      '[Placeholder — second alternative thought.]',
      '[Placeholder — third alternative thought.]',
    ],
  },
  {
    id: 'a5',
    text: "I can't trust anyone.",
    dimension: 'others',
    help_suggestions: [
      '[Placeholder — alternative thought for "I can\'t trust anyone."]',
      '[Placeholder — second alternative thought.]',
      '[Placeholder — third alternative thought.]',
    ],
  },
  {
    id: 'a6',
    text: 'My real family will be mad if I like my foster or adoptive family.',
    dimension: 'others',
    help_suggestions: [
      '[Placeholder — alternative thought for "my real family will be mad."]',
      '[Placeholder — second alternative thought.]',
      '[Placeholder — third alternative thought.]',
    ],
  },
]

// Scale used wherever these items appear (intervention rating + survey
// rating both use the same scale + anchors). Draft 26 (2026-06-08):
// shifted from 0-5 (6 points) to 0-4 (5 points) per Holly — cleaner
// middle anchor (2 = "Somewhat True", exactly the middle). Both Getting
// Unstuck and the FollowUp Survey read this, so the change applies to
// both at once.
export const APPRAISAL_SCALE = {
  min: 0,
  max: 4,
  anchors: [
    { v: 0, label: 'Not At All True' },
    { v: 2, label: 'Somewhat True' },
    { v: 4, label: 'Definitely True' },
  ],
}
