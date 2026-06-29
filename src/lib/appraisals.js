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

// `help_suggestions` feeds the Getting Unstuck "I need help" button —
// alternative thoughts the kid can read or tap to pre-fill their
// response. Strategy-keyed (Draft 27, 2026-06-09): Stephanie wrote
// DISTINCT alternatives for the Challenge strategy vs the Both/And
// strategy, so the panel surfaces only the set matching the kid's
// current strategy. Content is from Stephanie's "Alternative Thoughts
// list" v2 doc (`Alternative Thoughts list (1).docx`, 2026-06-12),
// verbatim — do not paraphrase. v2 incorporates Holly's a5 Challenge
// edit ("…even just a little bit, and trust can grow" — Stephanie
// agreed) plus minor punctuation alignment. (a6's alternatives say
// "My family" where the locked item reads "My real family"; that's
// intentional per Stephanie — the alternatives mirror the kid's
// natural phrasing.)
//
// `both_and_root` (Draft 36, 2026-06-29) — a softened/conditional
// version of the original absolute statement, used ONLY by the Getting
// Unstuck Both/And path as the seed the kid AND-extends (the UI appends
// " AND " + the kid's input). You can't coherently and-extend an
// absolute ("I will never belong AND ___" reads as agreement), so the
// Both/And seed needs this softened root. The original `text` is
// unchanged and still drives the Pick rating screen, the Challenge path,
// and the pretest / FollowUp Survey measures — `both_and_root` is
// intervention-side only and never affects measurement comparability.
export const APPRAISAL_ITEMS = [
  {
    id: 'a1',
    text: 'I will never really feel like I belong.',
    dimension: 'future',
    both_and_root: 'I don’t feel like I belong right now',
    help_suggestions: {
      challenge: [
        'It is possible for me to feel like I belong.',
        'There are people out there who will understand me and who I am.',
      ],
      both_and: [
        "I don't feel like I belong, right now, AND there are things I can do to change that.",
        "I don't feel like I belong, right now, AND I won't always feel that way.",
      ],
    },
  },
  {
    id: 'a2',
    text: 'Everyone will eventually leave me or give up on me.',
    dimension: 'future',
    both_and_root: 'People have left me in the past',
    help_suggestions: {
      challenge: [
        "Just because people have left me in the past, doesn't mean everyone will leave me.",
        "Everyone is not the same, and there are people that won't leave or give up on me.",
      ],
      both_and: [
        "People have left me in the past AND that doesn't mean everyone will leave me in the future.",
        "People have left me in the past AND there are people out there who won't leave or give up on me.",
      ],
    },
  },
  {
    id: 'a3',
    text: 'I am not lovable.',
    dimension: 'self',
    both_and_root: 'I do not feel like I am lovable',
    help_suggestions: {
      challenge: [
        'Everyone is worthy of love, including me.',
        "I may not love everything about myself right now, but that doesn't make me unlovable.",
      ],
      both_and: [
        'I do not feel like I am lovable AND there are people out there who can and do love me.',
        'I do not feel like I am lovable AND I am capable of being loved if I accept it and let others in.',
      ],
    },
  },
  {
    id: 'a4',
    text: 'No one would want me to be a part of their family.',
    dimension: 'self',
    both_and_root: 'I feel that no one would want me to be a part of their family',
    help_suggestions: {
      challenge: [
        "Even if I haven't found a forever family yet, I am worthy of this and can find a chosen family one day.",
        'There are people that care about me and may want to include me in their family, if I let them.',
      ],
      both_and: [
        'I feel that no one would want me to be a part of their family AND I am worth choosing and being included.',
        'I feel that no one would want me to be a part of their family AND that feeling might not be true, there may be people that want me to be a part of their family.',
      ],
    },
  },
  {
    id: 'a5',
    text: "I can't trust anyone.",
    dimension: 'others',
    both_and_root: 'I feel like I can’t trust anyone',
    help_suggestions: {
      challenge: [
        'There are people I can trust, even just a little bit, and trust can grow.',
        "Other people have betrayed me but that doesn't mean everyone will.",
      ],
      both_and: [
        "I feel like I can't trust anyone AND not everyone will betray me.",
        "I feel like I can't trust anyone AND there are people out there that are trustworthy.",
      ],
    },
  },
  {
    id: 'a6',
    text: 'My real family will be mad if I like my foster or adoptive family.',
    dimension: 'others',
    both_and_root: 'My family might get mad if I like my foster or adoptive family',
    help_suggestions: {
      challenge: [
        'People that love me want me to be safe and happy, even if it is with a different family.',
        'It is okay to like my birth family and my foster and adoptive family.',
      ],
      both_and: [
        "My family might get mad if I like my foster or adoptive family AND it's okay to let myself feel safe and cared for.",
        'My family might get mad if I like my foster or adoptive family AND I can care about lots of different people in my life.',
      ],
    },
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
