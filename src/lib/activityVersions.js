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
    version: 'v3.0',
    updated: '2026-05-12',
    changelog: [
      '2026-05-12 · v3.0 — separated rating and selection into two distinct screens. Rate screen now shows all 8 thoughts with the 5-point scales only; the per-thought "I want to work on this" button is gone. New Pick screen filters to thoughts rated ≥3 on either scale and shows them as selectable cards with a max-2 selection limit (non-blocking "Pick up to 2" nudge on third tap). New affirmation path: if no thought clears the eligibility threshold, Pick is skipped and a short "That\'s good news" screen leads straight to Save. Data shape unchanged — only the path to becoming selected changed.',
      '2026-05-11 · v2.0 — replaced the Kai-quote intro (Ginny: confusing) with a per-thought 5-point appraisal scale (frequency + believability). Eligibility threshold: rated ≥3 on either scale unlocks the "I want to work on this" button. "Fight it" renamed to "Challenge it" throughout (Stephanie — more clinically standard), including data keys (`fight` → `challenge`, `fight_response` → `challenge_response`). Restored the three challenge prompts as scaffolding above a single open-ended response field (Stephanie\'s PPT slide 12). Both/And unchanged. Save payload gains an `appraisals` array covering all 8 thoughts. Breaking change to data shape, demo-only.',
      '2026-05-11 · v1.0 — initial demo release.',
    ],
  },
  'allies-safety-net': {
    version: 'v4.0',
    updated: '2026-05-12',
    changelog: [
      '2026-05-12 · v4.0 — four coupled changes: (1) Desktop-bigger TrampolineNet — every render site now uses a responsive `max-w-[420px] md:max-w-[700px]` wrapper, and the SVG fills 100% of that container instead of being fixed at 400px. (2) New "Show me a list of my allies instead" toggle below every net render, expanding an inline grouped-by-type ally list (with kept/removed status indicators on post-inspect contexts). (3) Inspect flow restructured into a linear walkthrough: net stays as a backdrop with the current ally highlighted (new `highlightedAllyId` prop on TrampolineNet); the inspect modal auto-opens for each ally in sequence and auto-advances on Keep/Remove. Back button in modals walks to the previous ally; X-closing drops to a fallback view with Resume/Skip buttons. The old "Done inspecting" button is gone. (4) Visual refresh to match the new cleaner reference SVG — dropped the 24 radial cord lines, 4 concentric ring guides, thick wedge dividers, and the dot circles inside the woven patterns. Proportional wedge sizing by ally count is retained. Save payload UNCHANGED (still v3-shape with added version bump to "4.0").',
      '2026-05-12 · v3.1 — post-save confirmation now shows the TrampolineNet visual + a "Save as image" button that exports a PNG of the kid\'s safety net (rasterized client-side from the inline SVG; ally icon hrefs inlined as data URLs first to avoid canvas-tainting issues). No data-shape change.',
      '2026-05-11 · v3.0 — Inspect step added. Step 1\'s placeholder final visual replaced with the real TrampolineNet component (see src/components/TrampolineNet.jsx) — parametric SVG matching the Claude Design reference (3 nested rims, woven type patterns, 24 cord lines, 4 ring guides, label pills, "YOU" hub). Step 2 (Inspect) is a new 3-screen flow inside the same activity: intro → interactive net (tap any ally to inspect) → final net. Per-ally inspect modal asks 4 clinical-safety questions (trouble / isolate / lies / afraid). Keep + Remove buttons stay equally weighted; subtle amber border on cards with a "yes" answer, no destructive red on Remove. Keep-with-yes triggers a keep-advisory modal; remove triggers a removal-acknowledgment modal. Save fires at the end of Step 2 (not Step 1 anymore). All 15 ally SVGs had their background <rect> stripped so they composite cleanly on the net wedges. Save payload extends v2.0: per-ally `inspected`, `flags`, `kept_in_net`; activity-level `inspection_completed` flag.',
      '2026-05-11 · v2.0 — full rewrite. Old 4-step flow (Build → Inspect → Strengthen → Review) replaced with Variant C: per-support-type multi-select grid across 5 paginated screens (intro + Practical + Emotional + Social + Safety Net visual). 15 new SVG ally tiles (foster, bio, sibling, grandparent, otherfam, counselor, teacher, coach, babysitter, neighbor, friend, therapist, caseworker, other1, other2) with two custom-name slots. Per-screen "None of these" affirmative button captures meaningful "no one for this type" responses. Final screen is a placeholder grouped-by-type visual — final net+pie visual is a separate follow-up. Save payload reshaped: deduplicated allies list with support_types arrays + none_for flags. Steps 2–4 of the legacy activity removed; will be rebuilt as Task #7 after team design discussion.',
      '2026-05-11 · v1.0 — initial demo release (drag-id parsing fix already folded in).',
    ],
  },
  'self-reflection': {
    version: 'v1.2',
    updated: '2026-05-12',
    changelog: [
      '2026-05-12 · v1.2 — reverted the v1.1 exclusion-prompt reframe back to the original wording ("Now think of a time you felt excluded — a time you felt like you did not belong"). The agentive reframe didn\'t go past Ginny\'s UX review and shipped early; Holly\'s proposal is moved to team-level design discussion.',
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
    version: 'v2.2',
    updated: '2026-05-12',
    changelog: [
      '2026-05-12 · v2.2 — removed the worked example block that v2.0 added above the input form. Feedback was that the example was nudging kids toward mimicry. Activity now opens directly with the input form.',
      '2026-05-12 · v2.1 — keepsake screen gains a "Save as image" button. Builds a self-contained SVG of the poem (matches the on-screen amber card styling, with a small "SSI Platform · YYYY-MM-DD" footer credit) and rasterizes to PNG client-side. No data-shape change.',
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
  pretest: {
    version: 'v1.0',
    updated: '2026-05-11',
    changelog: [
      '2026-05-11 · v1.0 — initial sandbox build of the locked Belonging pretest (29 items: 6 demographics + 7 scales). 10-screen paginated flow mirroring the live session layout. Sliders require explicit interaction before counting as answered; pre_bw_2 hidden when pre_bw_1 = 0. Save payload keyed by SPSS column names from Draft 6.',
    ],
  },
}

// Convenience lookup. Returns null if the id isn't registered (e.g. for
// feedback submitted from the demo home page).
export function getActivityVersion(id) {
  if (!id) return null
  return ACTIVITY_VERSIONS[id] || null
}
