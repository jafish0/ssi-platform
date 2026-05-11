// Activity versions — source of truth for which build of each sandbox
// activity is currently live. Used by:
//   - DemoSandboxPage (visible badge so testers know what they're poking at)
//   - FeedbackButton  (included in the submit-feedback payload so admin
//                      triage can tell which version a comment refers to)
//   - AdminFeedbackPage (shown in the expanded row + CSV export)
//
// Versioning convention
// ---------------------
// vMAJOR.MINOR
//   - Bump MINOR for copy / wording / styling / small UX tweaks.
//   - Bump MAJOR for structural changes to the flow, scoring, or data shape.
// Always update `updated` to today and prepend a one-line note to
// `changelog` when bumping. Older notes stay so the history is readable
// without git archaeology.
//
// When you change an activity component, BUMP THE VERSION in the same
// commit. Future-Josh / future-Claude relies on this being accurate.

export const ACTIVITY_VERSIONS = {
  'getting-unstuck': {
    version: 'v2.0',
    updated: '2026-05-11',
    changelog: [
      '2026-05-11 · v2.0 — replaced the Kai-quote intro (Ginny: confusing) with a per-thought 5-point appraisal scale (frequency + believability). Eligibility threshold: rated ≥3 on either scale unlocks the "I want to work on this" button. "Fight it" renamed to "Challenge it" throughout (Stephanie — more clinically standard), including data keys (`fight` → `challenge`, `fight_response` → `challenge_response`). Restored the three challenge prompts as scaffolding above a single open-ended response field (Stephanie\'s PPT slide 12). Both/And unchanged. Save payload gains an `appraisals` array covering all 8 thoughts. Breaking change to data shape, demo-only.',
      '2026-05-11 · v1.0 — initial demo release.',
    ],
  },
  'allies-safety-net': {
    version: 'v1.0',
    updated: '2026-05-11',
    changelog: [
      '2026-05-11 · v1.0 — initial demo release (drag-id parsing fix already folded in).',
    ],
  },
  'self-reflection': {
    version: 'v1.1',
    updated: '2026-05-11',
    changelog: [
      '2026-05-11 · v1.1 — exclusion prompt reframed as agentive ("someone made you feel like you did not belong") per Holly\'s 2026-05-11 feedback.',
      '2026-05-11 · v1.0 — initial demo release.',
    ],
  },
  'belonging-skills-sort': {
    version: 'v2.0',
    updated: '2026-05-11',
    changelog: [
      '2026-05-11 · v2.0 — replaced all 7 skill labels with the kid-friendly Belonging Promoting Behaviors items from the locked pretest doc. Added tap-toggle "?" affordance on each card showing a 1–2 sentence definition (per Ginny, Stephanie, Holly). Unplaced layout switched from horizontal-wrap to vertical-stack to fit the longer sentence-style labels.',
      '2026-05-11 · v1.0 — initial demo release.',
    ],
  },
  'who-i-am-poem': {
    version: 'v2.0',
    updated: '2026-05-11',
    changelog: [
      '2026-05-11 · v2.0 — rebuilt to Ginny\'s 10-line structure on a single screen (Poem structure.png). 8 kid inputs; lines 6 and 10 auto-mirror line 1. Worked example shown above the inputs (Holly). George Ella Lyon attribution removed (Ginny: "this isn\'t the Lyons format"). Save payload reshaped to 8 keys + saved_at — breaking change, demo-only.',
      '2026-05-11 · v1.0 — initial demo release.',
    ],
  },
  'letter-builder': {
    version: 'v2.0',
    updated: '2026-05-11',
    changelog: [
      '2026-05-11 · v2.0 — collapsed 6-section structured letter to a single free-write screen per Stephanie\'s 2026-05-11 feedback. Removed: click-to-add word-bank chips, cross-activity pull-forward from Getting Unstuck and Allies/Safety Net, keepsake-view step. Added a short context line and a one-sentence example (greyed/italic) outside the textarea. Save payload reshaped to { activity, letter, saved_at } — breaking change, demo-only.',
      '2026-05-11 · v1.0 — initial demo release.',
    ],
  },
}

// Convenience lookup. Returns null if the id isn't registered (e.g. for
// feedback submitted from the demo home page).
export function getActivityVersion(id) {
  if (!id) return null
  return ACTIVITY_VERSIONS[id] || null
}
