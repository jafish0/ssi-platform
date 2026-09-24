// Resilient Roots demo feedback section tags (Resilient Roots Draft 1).
// Same { value, label } shape as GAINS_FEEDBACK_SECTIONS; submissions are
// tagged program = 'resilient-roots' plus one of these as `section`.
//
// One thread per proposal card on /resilient-demo. Later drafts add
// per-video (`video-N`) and per-activity (`review-<activity>`) tags as the
// pieces are built. When a tag is retired, leave its label in
// AdminFeedbackPage's RESILIENT_SECTION_LABELS so existing rows still
// label correctly (same convention as GAINS).

export const RESILIENT_FEEDBACK_SECTIONS = [
  { value: 'review-design-system', label: 'Review: Design system' },
  { value: 'review-overview', label: 'Review: Program overview and section map' },
  { value: 'review-measures', label: 'Review: Measures plan' },
  { value: 'review-action-plan', label: 'Review: Action plan concept' },
  { value: 'general', label: 'General note' },
]
