// GAINS demo feedback section tags (Draft 71 moved them out of
// GainsDemoPage.jsx so the dedicated playable pages and shared review
// pieces can import them without pulling in the whole demo page).
// GainsDemoPage re-exports this for older importers.
//
// One thread per proposal in "Ideas & Demos for Review", per-video tags,
// then the official breakdown. Retired slugs are listed in the comment so
// the history stays readable; AdminFeedbackPage keeps labels for them so
// existing rows still label correctly.

export const GAINS_FEEDBACK_SECTIONS = [
  // Ideas & Demos for Review — one thread per proposal
  { value: 'review-finalboss', label: 'Review: Final Boss summit script' },
  { value: 'review-pretest', label: 'Review: Pre-test measures flow' },
  { value: 'review-posttest', label: 'Review: Post-test measures flow' },
  // Draft 55 (2026-09-01): each video now gets its own comment box so
  // feedback maps per-video in the CSV export; review-videos stays as the
  // one "overall / general note" box for the group.
  { value: 'review-videos', label: 'Review: Videos — overall / general note' },
  { value: 'video-1', label: 'Review: Video 1 — What is Trauma' },
  { value: 'video-2', label: 'Review: Video 2 — The Four Reactions' },
  { value: 'video-3', label: 'Review: Video 3 — Getting the Best Therapy' },
  { value: 'video-4', label: 'Review: Video 4 — What Therapy Feels Like' },
  { value: 'video-5', label: 'Review: Video 5 — Growth Mindset' },
  // Retired as their proposals were adopted (labels are kept in
  // AdminFeedbackPage so existing rows still label correctly):
  //   review-rename     — the zone rename, accepted 2026-08-11, now canon
  //   review-exposition — adopted 2026-08-13 (the PoC card itself was
  //                       removed in Draft 67)
  //   review-arcades    — adopted 2026-08-13, now under Prototypes and In Development
  //   review-gear       — adopted 2026-08-13, now under Prototypes and In Development
  //   review-character  — adopted 2026-08-27 (Draft 51), now the Playable
  //                       Character strip under Prototypes and In Development
  //   review-spark-voice — decided 2026-08-27 (Draft 51): Option F: see the
  //                        Narrator card
  { value: 'review-bodymap', label: 'Review: Body Mapping activity' },
  { value: 'review-mindfulness', label: 'Review: Mindfulness Mindful Place' },
  { value: 'review-zone3pitch', label: 'Review: Zone 3 Elevator Pitch' },
  { value: 'review-ascent', label: 'Review: The Ascent (climb)' },
  { value: 'review-zone4', label: 'Review: Zone 4 walkable zone' },
  // The official breakdown
  // assent-measures — superseded by review-pretest/review-posttest (Draft
  // 54, 2026-09-01): the packet moved back into the review section since
  // it's still a proposal, not adopted canon. Label kept so historical
  // feedback rows still read correctly.
  { value: 'assent-measures', label: 'Child Assent / Measures' },
  { value: 'exposition', label: 'Exposition' },
  { value: 'npcs', label: 'NPCs' },
  { value: 'zone-1', label: 'Zone 1' },
  { value: 'zone-2', label: 'Zone 2' },
  { value: 'zone-3', label: 'Zone 3' },
  { value: 'zone-4', label: 'Zone 4' },
  { value: 'zone-5', label: 'Zone 5' },
  { value: 'general', label: 'General Feedback' },
]
