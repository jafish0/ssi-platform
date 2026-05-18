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

export const APPRAISAL_ITEMS = [
  { id: 'a1', text: 'I will never really feel like I belong.',                                 dimension: 'future' },
  { id: 'a2', text: 'Everyone will eventually leave me or give up on me.',                     dimension: 'future' },
  { id: 'a3', text: 'I am not lovable.',                                                       dimension: 'self'   },
  { id: 'a4', text: 'No one would want me to be a part of their family.',                      dimension: 'self'   },
  { id: 'a5', text: "I can't trust anyone.",                                                   dimension: 'others' },
  { id: 'a6', text: 'My real family will be mad if I like my foster or adoptive family.',      dimension: 'others' },
]

// Scale used wherever these items appear (intervention rating + survey
// rating both use the same scale + anchors).
export const APPRAISAL_SCALE = {
  min: 0,
  max: 5,
  anchors: [
    { v: 0, label: 'Not At All True' },
    { v: 3, label: 'Somewhat True' },
    { v: 5, label: 'Definitely True' },
  ],
}
