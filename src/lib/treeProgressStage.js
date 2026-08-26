// The 7 real, scored activities the tree grows across — deliberately NOT
// derived from Object.keys(ACTIVITY_REGISTRY): that registry also holds
// Demographics/PlacementDisruptionWorry (pretest items, registered there
// only so the engine can render them as custom_activity items) and could
// grow further with non-narrative activities later. Discovered live: with
// the derived list, completing Demographics during the pretest incorrectly
// triggered a tree-growth interstitial before the participant had even
// reached the first real activity. An explicit list is the correct fix,
// not a workaround — "is this a real scored activity" and "is this
// rendered via ACTIVITY_REGISTRY" are different questions that happened to
// have the same answer only until Demographics/PDW were added.
export const REAL_ACTIVITY_COMPONENT_NAMES = [
  'SelfReflection',
  'WhoIAmPoem',
  'AlliesSafetyNet',
  'BelongingSkillsSort',
  'GettingUnstuck',
  'LetterBuilder',
  'Plan',
]

// Derives the tree's growth stage (0-5) from how many of the real,
// scored activities in this section list have a saved response.
// Uses ceil (not floor/round) so the FIRST completed activity always
// produces visible growth, at the cost of two "flat" steps elsewhere
// in a 7-activity -> 6-stage mapping (unavoidable — 7 doesn't divide
// evenly into 5 growth-steps).
export function deriveTreeStage(sections, responsesByItemId) {
  const realItems = (sections || []).flatMap((s) => s.items || [])
    .filter((it) => it.type === 'custom_activity' &&
      REAL_ACTIVITY_COMPONENT_NAMES.includes(it.content_json?.component_name))
  const total = realItems.length || 7
  const completed = realItems.filter((it) => (responsesByItemId || {})[it.id] != null).length
  return Math.max(0, Math.min(5, Math.ceil((completed * 5) / total)))
}

// Copy tone: warm, grounded, second-person, quietly proud (matches the
// established Ready for Roots voice). Keyed by component_name — only
// activities that actually cross a stage boundary under the ceil
// mapping need an entry. In the real delivery order (SelfReflection,
// WhoIAmPoem, AlliesSafetyNet, BelongingSkillsSort, GettingUnstuck,
// LetterBuilder, Plan) that's completed-count 1, 2, 3, 5, 6 — i.e.
// SelfReflection, WhoIAmPoem, AlliesSafetyNet, GettingUnstuck, and
// LetterBuilder. BelongingSkillsSort (completed-count 4) and Plan
// (completed-count 7) land on "flat" steps under the 7-activities ->
// 5-growth-steps ceil mapping and never trigger the interstitial in
// practice — verified by computing the stage transitions directly
// rather than assuming.
export const INTERSTITIAL_COPY = {
  SelfReflection: {
    heading: 'Something’s taking root.',
    body: 'That kind of honesty with yourself matters. Your tree just started to grow.',
  },
  WhoIAmPoem: {
    heading: 'Your roots are reaching a little further.',
    body: 'You just put something true about yourself into words. It shows.',
  },
  AlliesSafetyNet: {
    heading: 'New growth, right on schedule.',
    body: 'You just named the people who have your back — and your tree’s growing because of it.',
  },
  GettingUnstuck: {
    heading: 'Your tree is filling out.',
    body: 'Working through something hard isn’t easy. Yours is growing because you did it anyway.',
  },
  LetterBuilder: {
    heading: 'Almost in full bloom.',
    body: 'You just wrote something honest and lasting. Your tree’s nearly there.',
  },
  // Safety net — used if a component name isn't in the table above
  // (e.g. future activities, or the two "flat" activities in a
  // reordered delivery sequence where they'd otherwise cross a
  // boundary), so no real activity accidentally shows nothing.
  DEFAULT: {
    heading: 'Your tree grew a little.',
    body: 'Every piece you finish helps it grow — a little more today than yesterday.',
  },
}
