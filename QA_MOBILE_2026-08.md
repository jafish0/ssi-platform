# QA — Mobile + resumability pass on the live participant flow (Draft 68)

**Date:** 2026-08-14 · **Author:** Claude Code · Companion to `AUDIT_2026-08.md`.

**Method:** full participant walkthrough of the live delivery path (code entry → assent → pretest → all activities → wrap-up → completion) against the current published v5 and the production Supabase backend, at 375×667 with a 390×844 spot-check, using `TEST-RSD-001`. Error states exercised with three temporary QA codes (deleted after). One QA session completed (all 57 items responded); one interruption-demo session marked abandoned. Live intervention content untouched.

---

## Prioritized fix list

### P0 — blocks a kid from completing

**P0-1 · Session resume does not survive a browser close — real participants get locked out.**
`validate-code` unconditionally INSERTs a new session on every call (deployed source, verified); the client keeps `session_id` in **sessionStorage**, which dies with the tab. Real participant codes are minted `max_uses: 1`. So the guaranteed-on-phones interruption path is: kid closes browser mid-session → reopens the link → re-enters their code → **"That code has already been used."** — locked out, with all their work stranded in the orphaned session. Even with a multi-use code they'd get a brand-new session starting at the assent (demonstrated live: new session `caca3f6a…` at section 0 while `302722b5…` held 15 responses at section 3). Resume currently works **only** for a same-tab reload.
→ **Follow-up draft candidate: "Resume-by-code."** `validate-code` returns the existing `in_progress` session for an access code instead of inserting a new one (small edge-function change; also fixes the multi-use replay hole), plus client-side `localStorage` for `session_id` as a belt-and-suspenders same-device fast path. Must land before any real participant gets a code.

**P0-2 · BSS: the "What I'm already doing" bucket is unreachable by drag on a phone.**
At 375×667 the first bucket's drop zone (~page-y 282–500) and the top skill card (~page-y 1179) are more than one viewport apart, and the ghost-chip pointer drag has **no mid-drag edge auto-scroll** (verified in source — the only `scrollTo` calls are screen-transition scroll-to-top). A real finger cannot hold a card and reach the first bucket in any scroll position. Empirically reproduced: a drop attempted at viewport-edge y≈5 did not register. Buckets 2–3 are (barely) reachable; bucket 1 is not. The keyboard path exists but is undiscoverable on touch.
→ **Follow-up draft candidate: "BSS mobile placement."** Edge auto-scroll during drag, and/or a tap-card-then-tap-bucket placement mode on touch. (BSS MAJOR-adjacent; needs its own verification pass.)

### P1 — confusing but survivable

**P1-1 · Mid-activity progress is lost on any interruption.** Persistence is item-granular; a multi-screen `custom_activity` (Allies/Safety Net is ~15 screens) saves only once at its end, and `CustomActivity` doesn't even forward `existingResponse`. Reload mid-activity → the activity restarts at screen 1; typed text is gone (demonstrated in Self-Reflection). Note: the draft's premise of a "debounced response save" doesn't exist — there is no debounce anywhere in the engine; saves fire on item submission only. → Follow-up draft candidate: per-activity checkpoint saves through the existing `save-response` upsert (activities already own their `token_key`; they could save partial state as they go and rehydrate from a forwarded `existingResponse`).

**P1-2 · Code-entry errors gave no next step.** ✅ **Fixed this session** (copy-only): used/expired/inactive/invalid messages now end with a concrete action ("ask your caregiver to help you get a new code", etc.). Verified rendering live.

**P1-3 · The live code-entry placeholder advertises a real, active, unlimited code.** The input placeholder is literally `e.g. TEST-RSD-001` — which is an active `max_uses: 100` code in production. Anyone who types the example gets a real session. → Before beta: deactivate `TEST-RSD-001` (or re-cohort it) and change the placeholder to a fake-format example. Left untouched here because internal testing still uses it.

**P1-4 · Live v5 psychometric copy shows literal doubled apostrophes to participants** ("Things just won''t work out…", "I don''t deserve…", "I can''t trust anyone") — an authoring artifact stored in the item content itself, confirmed rendered on-screen. Data-only fix in the working tables + republish; fold into the v6 authoring draft (AUDIT F6 territory).

### P2 — polish

- **Kai narration gate:** the transcript pushes the disabled Continue below the fold (~1,300px page at 667px viewport). Gate + release verified working with real audio; suggest a one-line hint near the disabled button ("The button unlocks when Kai finishes") — touches GU/ASN, so bundle with their next MINOR bumps.
- **Completion screen copy:** on FIRST completion the kid sees "You've already finished this one." — the engine's revisit copy doing double duty. Anticlimactic after 45 minutes; deserves a congratulatory variant.
- **VAS slider tracks are 16px tall** — thin for young-teen thumbs (Likert buttons are a comfortable 70×48). Consider a taller thumb/track on mobile.
- **YouTube end-screen wall:** ✅ partially mitigated this session — `rel=0` (recommendations limited to same-channel; YouTube no longer allows full removal) and `playsinline=1` (stops iOS forcing fullscreen) added to the YouTube embed path shipped dark in Draft 67. Severity for the decision: with `rel=0`, a paused/ended video shows same-channel tiles only — acceptable if all cuts live on the CTAC channel; self-hosting remains the clean-room option.

## What passed

- **Layout:** no horizontal overflow on any screen type at 375×667 or 390×844 (code entry, assent, text prompts, page breaks, Likert scales, VAS sliders, video items, all activity screens walked, outro, free-text, completion).
- **Touch targets:** every participant-facing control ≥40px (Likert cells 70×48; Kai Replay 96×40; ally tiles, buckets, strategy buttons all comfortable). Only the admin "Sign in here" link (16px) is small — not participant-facing.
- **Keyboard/inputs:** 16px input font at code entry (no iOS zoom-on-focus); textareas focus-scroll normally.
- **Same-tab resume:** reload mid-section resumes at the section start with all saved responses intact (section-granular by design); 57/57 items had server-side responses at completion; `status='completed'` + `completed_at` set; the Qualtrics webhook correctly did not fire (no `external_ref` on the test code).
- **Two-tab:** by construction, sessionStorage is per-tab, so tabs can never share a session id — no response clobbering path exists (each tab is its own session at worst).
- **KaiNarrationPlayer (Part B):** autoplay worked under emulation; Continue-gate releases on genuine audio end; Replay works by touch; transcript always visible; fail-open + Play-button fallback paths exist in code. **Real-iPhone confirmation still needed from Josh** — desktop-Chrome emulation cannot reproduce iOS Safari's autoplay block, so the Play-fallback's real-world prominence is unverified.
- **Video items (Part D):** aspect-ratio boxes reserve space (no layout shift); the live Vimeo placeholders play at 303×170; Draft 67's portrait YouTube items render 9:16 at 308×548 on 390px.
- **Error states (Part E):** all five paths (empty/mistyped/used/expired/inactive) produce kid-friendly, non-technical copy — now with next steps (P1-2 fix); no raw errors, no silent failures, no dead ends. Console noise during the walkthrough traced to third-party Vimeo-embed telemetry (403s), not app errors.

## Shipped in this session

1. `src/pages/CodeEntryPage.jsx` — next-step guidance in all code-entry error messages (P1-2).
2. `src/components/items/VideoPlayer.jsx` — `playsinline=1&rel=0` on YouTube embeds (P2/Part D).

No activity version bumps (neither change touches an activity component).

## Named follow-up draft candidates

1. **Resume-by-code** (P0-1): `validate-code` returns the existing in-progress session; client localStorage fallback.
2. **BSS mobile placement** (P0-2): drag edge auto-scroll and/or tap-to-place on touch.
3. **Activity checkpoint saves** (P1-1): partial-state saves through `save-response` + `existingResponse` forwarding to custom activities.
