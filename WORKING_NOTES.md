# Working Notes — RSD (Ready! Set! Dedicate!)

A bidirectional scratchpad shared between Josh, Claude Cowork (Claude desktop chat, used for thinking through ideas), and Claude Code (CLI, used for implementation).

> Both Claude Cowork and Claude Code should read this file when starting a session in this repo.
>
> **Append-only conventions:**
> - "Recently shipped" — newest at top. One bullet per commit, with hash + date + one-line summary. Claude Code updates this after each push.
> - "Ideas / drafts" — drop polished prompts here for the next Claude Code session, or rough ideas you want Claude Cowork to help you refine. No deletion needed; once a draft ships, move it (verbatim) into "Recently shipped" so the history stays intact.

---

## ⬇ Recently shipped (Claude Code → Claude Cowork)

> What's been built recently, so Claude Cowork has the running context without re-reading the entire git log.

- **`<pending-tree>` · 2026-06-08** — Draft 26 Part F follow-up: swapped the tree-progress demo to Claude Design's new locked **"ready-for-roots-tree"** icon set (delivered in `Safety Net Exercise.zip → ready-for-roots-tree/`). The new six-stage set is noticeably **denser/fuller** — roots grow in count *and* branchiness per stage (1→6→9→15→20→28 root paths, incl. sub-roots + stage-5 spread roots), the three-tone canopy widens sharply, and stage 5 gains more blossoms (14 clusters). Extracted the six SVGs into **`src/assets/tree/`** (now the in-repo locked references, + `NOTES.md`); pointed `scripts/extract-tree-stages.mjs` at that folder and regenerated **`src/lib/treeStages.js`**. `TreeProgress.jsx` unchanged — it's parametric/data-driven and renders the new geometry as-is (same structure: per-stage full redraws, baked trunk widths, `<g>` layer ids). Verified via preview: stage 5 = 50 paths (28 roots + 1 trunk + 7 branches + 14 leaves) + 14 blossoms (84 petals), matching the extract. Also updated the **Growing Your Roots preamble** to the new locked 3-line copy ("Ready for Roots. Yours start here." / "This little seed is your tree…" / "Watch what grows."); Stage 0 caption unchanged. No version bump (demo surface). The "new tree icons (Josh providing)" non-code todo is now struck through as delivered.
- **`80fa689` · 2026-06-08** — Draft 26: Round 4 feedback bundle, six activity refinements in one commit. **A. Self-Reflection v1.2 → v1.3:** dropped the false "we'll come back to it" closing line (Holly); added example thought/feeling placeholders on both prompts (Ginny) — inclusion "e.g., People like me" / "e.g., Happy", exclusion "e.g., Nobody likes me" / "e.g., I felt sad". **B. Letter v2.1 → v2.2:** two optional scaffolding prompts under the instruction ("What is one skill you would recommend?" / "What is one helpful thought you could share?"). **C. Belonging Skills Sort v3.0 → v3.1:** "!" on encouragement; saveable PNG snapshot of the three sorted buckets (downloadSvgElementAsPng, unsorted excluded); one-time "reconsider unsorted items?" Yes/No prompt after first Save. **D. Allies / Safety Net v5.2 → v5.3** (the draft said "v5.1 → v5.2" but Draft 23 had already shipped v5.2, so this lands as v5.3): "!" on the ready line; percentage labels on every support-type heading (transition screens, selection question, TrampolineNet pills via new `percentByType` prop, ally-list headers) computed as allies-in-type ÷ total distinct allies; visual demotion of the full net (60% opacity + "small net is a place to start" caption) when total allies ≤ 2. **E. Getting Unstuck v5.3 → v5.4 (MAJOR) + FollowUp v1.0 → v1.1 (coupled):** shared appraisals truth-rating scale shifted **0-5 → 0-4** (anchors 0 Not At All / 2 Somewhat / 4 Definitely) in `src/lib/appraisals.js`, cascading to both the intervention and the survey; Pick threshold stays ≥2 (now exactly the middle anchor); new "I need help" button per thought opening a panel of alternative-thought suggestions (PLACEHOLDER content — Stephanie producing real lists; tap to pre-fill the response). exportFlatten value-range comments + demoDataset truth_rating regen updated (0..4). **F. Growing Your Roots:** preamble before Stage 0 ("Every time you complete an activity, your tree and roots will grow. Let's see how big it gets.") + revised Stage 0 caption ("Here's your tree." / "Right now it's a seed…"). Verified via preview: GU renders 5 scale buttons (0-4) with correct anchors; "I need help" panel works. **Out of scope (tracked in the non-code todos section):** new tree-progress icons (Josh), Stephanie's real "I need help" content, ElevenLabs voice work, female/nonbinary Sam assets, 9:16 video direction.
- **`edc439a` · 2026-06-04** — Draft 25: tree-progress preview. New parametric **`<TreeProgress />`** component (`src/components/TreeProgress.jsx`) rendering the "Ready for Roots" growth metaphor across six stages (Seed → Blooming) + a new **"Growing your roots"** click-through section on `/demo` (between Meet the cast and Data export) with stage dots, Previous/Next/Reset controls, and per-stage encouragement copy (Part C). Geometry is **machine-extracted** from Claude Design's six locked reference SVGs (`Activity ideas/tree-stage-*.svg`) via `scripts/extract-tree-stages.mjs` → `src/lib/treeStages.js`, so the component matches the references exactly rather than shipping them (same "rebuild parametrically" approach as the trampoline net). The references are per-stage full redraws (the whole tree scales each stage), so the component swaps the complete element set per stage. Forward stage changes animate growth-in (roots + branches draw on via `stroke-dashoffset` with `pathLength=1`; trunk/leaves/blossoms fade, staggered ~700ms); backward/jumps snap instantly; `prefers-reduced-motion` disables it. Verified against the references via DOM inspection — stage 5 = 13 roots, 6 branches, 14 leaves, 10 blossoms (60 petals). **Preview-only:** not wired into real activity completion or per-PID persistence (deferred until the activities are stitched into a continuous flow). No activity-version bump; INFRASTRUCTURE.md updated.
- **`41693ec` · 2026-06-04** — Draft 24: Meet the cast fixes + /demo polish. **(1)** Card order swapped so **Sam 16 (narrator) leads, then Sam 14** — matches how Holly's script opens. **(2)** Swapped the two Sam 14 audio files (their contents were mislabeled in Draft 22's asset prep): `sam-14-line-1.mp3` is now the inner-monologue line, `-line-2` the angry line — card-data mapping was already correct, only the underlying files were crossed. **(3)** Added a **"Download Script 2.0 (.docx)"** link under the Meet-the-cast heading (`/public/cast/script/ready-for-roots-script-v2.docx`, served with a clean `download` filename). **(4)** Removed the "individual plan" preview paragraph from the Activities section. **(5)** Page title → *"Ready for Roots — Activities Testing, Videos and Data Export Demo"*: updated the visible `<h1>`, set a matching `/demo`-only browser-tab title via `useEffect` (restored on unmount so other routes keep the default), and de-staled `index.html`'s app-wide `<title>` from the pre-rename *"Ready! Set! Dedicate!"* to *"Ready for Roots"* (a Draft 14 rename miss). No activity-version bump.
- **`ef557b0` · 2026-06-04** — Draft 23: Allies / Safety Net v5.1 → **v5.2 (MINOR)**. Each Strengthen screen now shows the kid which allies they already selected for that support type (post-Inspect, so removed allies are excluded) as a read-only refresher line above the "Is there anyone else…" prompt — singular/plural-aware, Oxford-comma list (`formatNameList` helper), skipped entirely when none. The `{type}` word keeps the per-type color. Helps the kid generate a genuinely new addition rather than restating someone already named. Display-only — reads from the existing `allies` array; no flow, data-shape, or export change.
- **`de7aa3e` · 2026-06-03** — Draft 22: replaced the /demo **Video** section (commit `d64dbdb`) with a new **"Meet the cast"** section previewing Holly's Script 2.0 before animation. Five character cards — **Sam (14)**, **Sam (16)**, **Foster Mom**, **Foster Dad**, **Mrs. Johnson** — plus a borderless **Family Photo** closer. Each card: image (left ~40% on desktop, stacked on mobile) + role line + either a list of scripted lines (scene cue + quoted text + native `<audio>` ElevenLabs sample per line) or a single description paragraph for the two characters who don't speak in Script 2.0 yet (Foster Dad, Mrs. Johnson). Sam-16's seven lines render in script-narrative order (1→2→3→4→6→7→5), not recording order — audio filenames keep their recorded numbers. Section sits between Tests and Data export. New `src/lib/castData.js` holds all card content (verbatim line text from `Character_Profiles.docx`); 16 assets (6 images + 10 mp3s) copied into `/public/cast/{images,audio}/` and served statically (not Vite-imported — large media). Removed the old Sam concept-art assets (`src/assets/demo/sam-boy-16*.png`) + their imports and the YouTube animation-sample embed (`A8vVBE_2dNI`). Kept the `video` feedback category (commit `1edd96f`) — now applies to cast/voice feedback. No activity-version bump (DemoPage section, not an activity); INFRASTRUCTURE.md change log updated. Out of scope: audio for Foster Dad + Mrs. Johnson (drop mp3s + a `lines` array into castData later and the cards extend the same way).
- **`0015acd` · 2026-06-01** — Draft 20: 2026-06-01 meeting bundle, three activities in one commit. **Getting Unstuck v5.2 → v5.3 (MINOR):** (1) Pick threshold reverted ≥3 → **≥2** (FINAL per meeting — third 3↔2 flip; full history now pinned in the `ELIGIBILITY_THRESHOLD` comment). (2) New `cycle_affirmation` phase — brief randomized "Nice work / Good job / …" + "Let's try the next one" beat between consecutive picked thoughts (Ginny's encouragement ask). Also surfaced a Challenge-vs-Both/And strategy explainer (video placeholder + text) on the affirmation path so kids who pick nothing still learn the strategies. No data-shape change. **Allies / Safety Net v5.0 → v5.1 (MINOR-ish):** Strengthen now runs for **all three support types** (was gap-only); removed the same-kid suggestion chips (Ginny's stress test: they re-suggested foster mom/dad everywhere and the net never expanded); copy reframed to neutral "Is there anyone else who could give you {type} support?"; typed-in names stay in the action callouts only, NOT added to the net visual (Stephanie's "isn't really in the net until we call him" framing). Data: `strengthened.{type}` always populated (no nulls); `gap_filler` → `additional_person`. exportFlatten drops `_strengthen_gaps_count`, adds `_strengthen_added_count` (0-3), renames `_filler` cols → `_person`. demoDataset regenerated (~50% fill per type). **Who I Am Poem v2.3 → v2.4 (MINOR):** removed visible line numbers + the "Line N — same as line 1" caption on the mirrored lines 6/10 (Ginny: confusing); they render silently now. No data-shape change. **Out of scope / still queued:** Draft 21 (tree-roots progress visual) — spec + assets only, integration deferred until activities are stitched into a continuous flow; left active in the Ideas section.
- **`1edd96f` · 2026-05-19** — Added a **Video / animation** category to the feedback form so reviewers can tag feedback about the new Video section. Touched all three validation layers: DB `feedback_category_check` CHECK constraint (migration `feedback_add_video_category`), the `submit-feedback` edge function allow-list (now v4), and the frontend (`FeedbackButton` dropdown + `AdminFeedbackPage` label/filter). Additive enum value — no data migration, existing rows unaffected.
- **`d64dbdb` · 2026-05-19** — Added a **Video** section to `/demo` (under the Data export demo) for team review of animation direction. Two cards: **Sam (boy version, age 16)** showing three character concept-art images (`backstage.png`, `Sam 2.png`, `Sam 3.png` from the repo-root `Video Content/` folder, copied into `src/assets/demo/` as `sam-boy-16{,-2,-3}.png` and imported as build assets) in a responsive 2-col grid; and **Animation sample**, an embedded YouTube Short (`A8vVBE_2dNI`) in a 9:16 portrait player capped at 320px wide. Demo-page-only, no activity version bump.
- **`7a7d547` · 2026-05-19** — Draft 19: Allies / Safety Net v4.1 → **v5.0** (MAJOR) + Getting Unstuck v5.1 → **v5.2** (MINOR), shipped as one commit. **Allies v5.0** is a substantial restructure driven by Stephanie's 2026-05-18 transcript spec, Holly's color-coding ask, and the new 22-tile icon set Josh delivered 2026-05-19. **(1)** 22-tile icon set replaces v4.x's 15 — foster/bio/grandparent each split into mom+dad / mother+father pairs, friend split to friend + best-friend + friends (group), boyfriend + girlfriend added, sneaky-link deliberately not registered per Josh's 2026-05-19 call. SVGs stripped of background `<rect>` per the existing pattern. **(2)** Color-coded support types per Holly: Practical = amber, Emotional = rose, Social = sky. Colors appear on the type word in each screen heading, the per-type tile background tint on selection grids, and the full background of the new transition screens. **(3)** Brief transition screens between Practical → Emotional → Social selection, resolving Ginny's "kind of looked similar" feedback. **(4)** Inspect (Part 2) restructured per Stephanie: educational screen with a video placeholder (Adrian to record actual content — placeholder is a styled 16:9 div with "Video coming soon" caption, no player UI) + the four red-flag bullets verbatim from her PPT → single X-out-on-net screen where the kid taps × on any ally to take them out (visual: ally fades to ~30% opacity, big red X overlays; tap × again to restore). The per-ally modal walkthrough with the 4 Yes/No questions is gone. **(5)** Strengthen (Part 3) rebuilt from scratch (last torn down in commit `d515d0e`): per-type gap detection on post-removal counts (0 or 1 ally = gap); per-gap screen with same-kid ally chips as suggestion shortcuts ("Anyone here also fit?" — taps pre-fill the gap_filler), "Who could that be?" filler input, "What's one thing you could do?" action textarea, and a Skip option. Number of Strengthen screens is dynamic (0–3) based on the kid's specific gap pattern. **(6)** Final Review screen shows the net post-removal, kept-allies list, Strengthen commitments rendered as per-type callouts, and the existing Save-as-image button (commit `92bfff9` retained). **Save payload reshaped (BREAKING, demo-only):** per-ally `inspected` / `flags` / `kept_in_net` replaced with a top-level `removed_via_inspect: [ally_id, ...]` array; new top-level `strengthened: { practical|emotional|social: {gap_filler, action, skipped} | null }`. **exportFlatten:** dropped `safety_net_total_flags` + the 4 `_flag_*_yes` columns; kept `_inspected_count` (now pre-removal total) / `_kept_count` / `_removed_count` / `_inspection_completed`; added `_strengthen_{type}_filler` / `_action` / `_skipped` per support type + `_strengthen_gaps_count`. **demoDataset:** regenerated for the new shape — ~30% of synthetic participants remove ≥1 ally during Inspect; Strengthen gaps follow naturally from post-removal counts; of those with a gap, ~70% fill in and ~30% skip; small string pools drive synthetic gap_filler / action values. **TrampolineNet:** new `inspectMode` prop + `onAllyToggleRemoved` callback drives the × overlay + 30%-opacity-with-X-overlay state on the new X-out screen; the v4 walkthrough rendering paths (highlighted ally + inspected checkmark) stay intact for backward compatibility. **Getting Unstuck v5.2** (the second half of Draft 19): one-line Pick-screen prompt edit per Holly's 2026-05-18 transcript — replaced "Which of these thoughts… Pick one or two." with "Pick the top two thoughts you would like to work on." so the max-2 guidance lives in the prompt itself rather than as a footnote. No flow / data / threshold changes — just the wording on the Pick screen heading. Bumps: allies-safety-net v4.1 → v5.0 (MAJOR), getting-unstuck v5.1 → v5.2 (MINOR).
- **`f705a41` · 2026-05-19** — Draft 18: /demo polish. **(1)** Removed the "Three things you can do here" intro paragraph and its three sub-paragraphs from `src/pages/DemoPage.jsx`; the section headers (Activities, Tests, Data export) are self-explanatory. **(2)** Hid the saved-output JSON panel from the participant-facing confirmation screens on Pretest, Posttest, and FollowUp (same call as commit `583d34c` made for `/demo/sandbox/*` activities). Dropped the *"The whole payload is visible in the saved-output panel below."* line and the JSON `<pre>` panel itself from the done-state and the pre-submit confirmation screens. Kept the simple "Thanks — your responses are saved." acknowledgment. `/admin/testing/*` surfaces untouched. **(3)** Flipped the persistent **Give feedback** button's submitter default from `"anonymous"` to `"ginny"` in `src/components/FeedbackButton.jsx` (initial useState + reset()). Anonymous stays as a selectable option for testers who want to submit without attribution. No activity version bumps — all three are demo-page polish, not activity-data-shape changes.
- **`6900549` · 2026-05-19** — Draft 17: Getting Unstuck v5.1. Single-line revert of the Pick-screen eligibility threshold from `truth_rating ≥ 2` (set in Draft 15) back to `≥ 3` (the original v3.0/v4.0 threshold). Josh's clinical-content call overrides Stephanie's 2026-05-15 lowering — items rated below "Somewhat True" (3) on the 0-5 anchor scale aren't endorsed strongly enough to be worth the Pick / Challenge / Both-and flow. Affirmation path hit more often as a result; intended behavior. Constant flip in `src/activities/GettingUnstuck.jsx` (`ELIGIBILITY_THRESHOLD = 3`) plus header-comment + Other-screen-note updates so the docstring matches reality. No data-shape change, no flow change. v5.0 → v5.1 (MINOR).
- **`4d5ec6a` · 2026-05-13** — Draft 16: Posttest + FollowUp paginated sandbox activities built from the locked Final Measures docs. New `src/components/survey/SurveyItems.jsx` extracts the shared item renderers (LikertItem / SliderItem / NumberInput / RadioGroup / CheckboxGroup / ScaleScreen / ProgressStrip) so all three timepoint surveys render visually identically; Pretest left as-is for now to avoid churn. **Posttest.jsx (v1.0, 18 items, 9 screens):** BHS / ASCS / NB / Belonging Worries (with skip-Q2-on-Q1=0) / Perceived Helpfulness (past-tense pe_1) / Program Feedback Acceptability (NEW: 3 Likert + 2 open-response, optional, 2000-char cap). Save flat-keyed `post_*`. **FollowUp.jsx (v1.0, 30 items, 11 screens):** BHS / ASCS / UCLA / NB / BPB / **Appraisals (imported from `src/lib/appraisals.js`)** so survey items match the Getting Unstuck v5.0 intervention exactly / Belonging Worries / Permanency (NEW: radio + Other-text reveal) / Disruption Worry (NEW: 0-4 Likert). Save flat-keyed `fu_*`. Wiring: both registered in `TEST_REGISTRY` under `'Ready for Roots test'` category; activityVersions entries at v1.0; DemoPage Tests intro updated; `program_feedback: 'pf'` added to `SCALE_ABBREVIATIONS`. demoDataset NOT extended — the synthetic 52-participant dataset walks the snapshot's item structure, not these sandbox-only activities; when these scales make it into a real snapshot, demoDataset's existing logic picks them up automatically.
- **`27e4d52` · 2026-05-13** — Draft 15: Getting Unstuck v5.0 — structural rebuild. 8 RSD-specific stuck thoughts → 6 locked Appraisal items shared with the FollowUp Survey (new `src/lib/appraisals.js` single-source-of-truth). Dropped "how often" rating dimension; only "how true" remains on a 0-5 scale with Not At All / Somewhat / Definitely True anchors. Pick eligibility threshold lowered from ≥3 to ≥2 (Stephanie: kids who rated above 1 weren't being pulled forward). New "Other thought" screen between Rate and Pick — Yes/No, optional free text + same 0-5 rating, eligible for Pick if rated ≥2. Fight → Challenge naming **finalized after three flips** (Josh's 2026-05-18 call is final): button "Challenge it", data key `strategy: "challenge"`, response field renamed to `response`. Jessica's 2026-05-18 copy edit applied ("those questions?"). Save payload reshaped to `appraisals: { a1..a6 [+a_other]: { truth_rating, selected, strategy?, response?, and_statement?, text? } }`. exportFlatten emits `unstuck_truth_a*`, `_selected_a*`, `_strategy_a*`, `_response_a*` + the same set for `a_other` + `unstuck_other_text` + rollups. demoDataset regenerated. v4.0 → v5.0 (MAJOR, breaking data shape).
- **`0852261` · 2026-05-13** — Draft 14: renamed intervention "Ready! Set! Dedicate!" / "RSD" → **"Ready for Roots"** in all user-facing text. Internal code slugs (`ready-set-dedicate`), access-code prefix (`RSD-XXXX-XXXX`), and `RSD_*` filenames are unchanged — internal artifacts. Touched: DemoPage hero + body copy, AdminExports demo-tab strings, `testRegistry` categories (`'RSD activity'` → `'Ready for Roots activity'`, `'RSD test'` → `'Ready for Roots test'`) with DemoPage filter calls matching, plus repo-root docs (README, INFRASTRUCTURE, STATE_OF_THE_PLATFORM, SSI_Platform_Overview, RSD_Completion_GiftCard_Flow). The `.docx` parallels of the overview + gift-card-flow docs need a manual rename pass — flagged in INFRASTRUCTURE.md change log. No activity-version bumps, no code-logic changes, no data-shape changes.
- **`88c3358` · 2026-05-13** — Draft 12: Belonging Skills Sort v3.0 — five converging pieces of feedback from the 2026-05-18 review meeting shipped as one rebuild. **(1)** Two CSS drop-zones → three illustrated trapezoidal bucket SVGs (shared `BucketSvg` component, amber-300/500). **(2)** New "Not interested right now" bucket — equal styling on purpose (Stephanie's call: don't desaturate, the whole point is to legitimize "not for me" as a valid answer). **(3)** Placement rebuilt as real pointer-event drag with a ghost-chip follower (Holly: "see the text moving") — offsets above the finger on touch, settles into bucket with a 240ms ease-out transition + bucket pulse on drop, springs back to origin on drop outside any bucket. Uses pointer events not @dnd-kit so it works uniformly on mouse/touch/pen. **(4)** Placed cards have a small × remove button that returns to unplaced (Jessica). **(5)** Full keyboard + screen-reader path: Tab/arrow nav, Space picks up, arrow keys cycle buckets, Space drops, Escape cancels; aria-live status region announces transitions. Save payload reshaped: now has `not_interested` array; `unplaced` stays in payload so analysts can distinguish "kid skipped" from "kid actively chose Not Interested." `exportFlatten.js` gains `sort_not_interested` + `sort_n_not_interested`. `demoDataset.js` distribution 25/25/15/35. v2.0 → v3.0 (MAJOR).
- **`b571464` · 2026-05-13** — Draft 13: small-copy bundle from the 2026-05-18 review meeting, shipped as one stopping point. **LetterBuilder v2.0 → v2.1 (MINOR)**: replaced the context line above the textarea per Stephanie (2026-05-15) — was "Write a letter to another teen who is starting where you are now…", now "What you would want to say to another teen who feels like they don't belong." Anchors the recipient in the same emotional state the kid is being asked to write to; direct second-person framing in the kid's voice. **WhoIAmPoem v2.2 → v2.3 (MINOR)**: auto-titled the finished-poem card and keepsake-image PNG "Who I Am" (replacing "Your Poem"), both surfaces updated. No data-shape changes on either.
- **`78a67cd` · 2026-05-12** — /demo Data export demo restructured: three numbered per-file blocks (Wide CSV / `.sps` syntax / Codebook CSV) instead of one long paragraph + button row. The `.sps` block now has its own amber "How to use it in SPSS" panel with a 3-step numbered list — save next to the CSV → open in SPSS → Run → All — plus a smaller italic fallback note about setting the working directory or editing the `/FILE=` path. Dropped the "Note: Qualtrics offers a native .sav…" paragraph per Josh. New `ExportFileBlock` helper at the bottom of `DemoPage.jsx` keeps the three files rendering consistently.
- **`71a37e9` · 2026-05-12** — Allies / Safety Net v4.1 (Draft 11): reverted the four inspect-modal questions to Stephanie's PPT Slide 4 originals — Q1 "usually get you into trouble" (was "sometimes get you in trouble"), Q2 "talking to or getting close to other people" (was the longer "spending time with other people who care about you"), Q4 "Do you feel afraid of {name}?" with the kid-perspective phrasing (was ally-active). Q3 unchanged. My v3.0 rewording was a judgment call about kid-friendly phrasing for content Stephanie wrote, not driven by team feedback; Josh decided to restore PPT phrasing as written. Flag keys + answer scheme unchanged — no data-shape change. Added a comment above `INSPECT_QUESTIONS` noting these are verbatim from the PPT.
- **`c02a379` · 2026-05-12** — Getting Unstuck v4.0: reverted v2.0's "Fight it" → "Challenge it" rename. Strategy button label back to "Fight it", data key back to `fight`, response field back to `fight_response`, export column back to `unstuck_n_fight` (allowed values `fight | both_and`), demoDataset synthetic data regenerates with `strategy: 'fight'`. Stephanie's clinical-content rationale ("more clinically standard") was overridden by Josh; the original RSD framing is restored. Rate/pick split + max-2 selection + affirmation path from v3.0 all stay. MAJOR bump because of the data-shape change; no real participant data exists yet so no migration concerns.
- **`6c4dfd2` · 2026-05-12** — Follow-up to v4.0: ally icons were bleeding across wedge color boundaries on the bigger desktop net. Fix is geometric — bumped placement radii from 72/112 to 95/125 (icons at larger r subtend less angular space) and replaced the fixed 6° inset with `asin(haloRadius / innerRadius) + 2°` so the inset auto-scales to the icon size at the inner placement ring. No version bump; this is a placement fix to v4.0, not a flow change.
- **`583d34c` · 2026-05-12** — Allies / Safety Net v4.0 — five coupled changes. **(1)** Desktop-bigger TrampolineNet: SVG now fills 100% of its container with the `size` prop demoted to an optional CSS max-width; every render site wraps in `mx-auto w-full max-w-[420px] md:max-w-[700px]` so phones stay compact and desktops use the available real estate. **(2)** "Show me a list of my allies instead" toggle below every net render — new `NetWithListToggle` helper + new `AllyList` sub-component (grouped by support type, with kept/removed indicators on post-inspect contexts). Inline-expand, not replace. **(3)** Inspect flow restructured into a linear walkthrough — net stays as non-interactive backdrop with the current ally highlighted via new `highlightedAllyId` prop; inspect modal auto-opens for each ally and auto-advances on Keep/Remove. Back nav works within modals (previous ally with answers preserved). X-close mid-walkthrough drops to a fallback view with "Resume inspecting" + "Skip the rest" buttons. "Done inspecting" button removed. **(4)** Visual refresh to match the new cleaner reference SVG — dropped 24 radial cord lines, 4 concentric ring guides, thick wedge dividers, and the dot circles inside the woven patterns. Proportional wedge sizing by ally count is RETAINED. **(5)** Unrelated: hid the "Saved Output" JSON panel from `/demo/sandbox/*` (reviewers find it distracting); the admin-side `/admin/testing/*` panel is untouched. Save payload UNCHANGED, just the version string bumps to "4.0".
- **`9b841da` · 2026-05-12** — Draft 10: three small-to-medium revisions to activities that shipped yesterday, bundled as one commit. **Self-Reflection v1.2 (revert):** exclusion prompt reverted to its pre-Draft-1 wording — the v1.1 agentive reframe didn't clear Ginny's UX review; Holly's proposal is moved to team-level design discussion. **Who I Am Poem v2.2 (content removal):** removed the worked example block above the input form — feedback was that the example was nudging kids toward mimicry. **Getting Unstuck v3.0 (MAJOR, structural flow change):** rating and selection are now separate screens. Rate screen shows the 8 scales only (no inline "I want to work on this" buttons). New Pick screen filters to eligible thoughts (≥3 on either scale) as selectable cards with a max-2 limit (non-blocking "Pick up to 2" nudge on a third tap). New affirmation path skips Pick entirely when no thoughts clear the threshold and leads straight to Save. Phase state moved from numeric `step` to named phases (`rate` / `pick` / `strategy` / `review` / `affirmation`) for clarity. Save payload UNCHANGED — only the path to becoming selected changed; export pipeline and demoDataset don't need updates.
- **`92bfff9` · 2026-05-12** — Participant-facing "Save as image" downloads on the two activities that produce a visual artifact: Allies / Safety Net and Who I Am Poem. The other activities don't have an output by design and keep their simple confirmation copy (Josh confirmed on 2026-05-12). New `src/lib/imageDownload.js` exports `downloadSvgElementAsPng` (rasterizes a live SVG DOM node — used by the Safety Net post-save confirmation, which now shows the TrampolineNet visual + Save-as-image button) and `downloadSvgStringAsPng` (rasterizes a built-on-demand SVG string — used by Who I Am Poem to build an SVG keepsake at click time that matches the on-screen amber card with a "SSI Platform · date" footer). The utility inlines `<image href>` references as data URLs before rasterization to avoid canvas-tainting; renders at 2× for retina quality; cream-paper background fills any transparent areas. No new dependencies — html2canvas would have worked (transitive via jspdf) but our visuals are pure SVG. AlliesSafetyNet bumped to v3.1, WhoIAmPoem to v2.1 (both MINOR, no data-shape changes).
- **`70d117b` · 2026-05-11** — Draft 9 of the Safety Net build: TrampolineNet parametric visual + Step 2 (Inspect). Three coupled changes shipped together. **(1)** Stripped the cream background `<rect>` from all 15 ally SVGs in `src/assets/allies/` so they composite cleanly on the woven trampoline-net wedges. **(2)** New `src/components/TrampolineNet.jsx` — parametric React reimplementation of the Claude Design reference (`Activity ideas/trampoline-safety-net.svg`). Matches the rim styling, woven type patterns, 24 radial cord lines, 4 ring guides, label pills, and "YOU" hub. Wedge sizing is proportional with empty types collapsing to a labelled 15° sliver. Ally icons sit in cream halos with optional `showInspectedMarks` (green check) and `interactive` (tappable button) modes; removed allies render in a faded "Taken out of net" strip below the rim. **(3)** `AlliesSafetyNet` v3.0 — expanded from 5 to 8 screens. Step 1's placeholder grouped-by-type visual is replaced with the real TrampolineNet. Step 2 (Inspect) is a new 3-screen flow inside the same activity: intro → interactive net (tap any ally to inspect) → final net + Save. Per-ally inspect modal asks 4 clinical-safety questions (trouble / isolate / lies / afraid) with Yes/No/Not sure radios. Keep + Remove buttons stay equally weighted; subtle amber border on "yes" cards, no destructive red. Keep-with-yes triggers a keep-advisory modal; remove triggers a removal-acknowledgment modal. Save now fires at the end of Step 2 (not Step 1). Save payload extends v2.0 with `inspected`, `flags`, `kept_in_net` per ally and an activity-level `inspection_completed` flag. `exportFlatten.js` gains 9 new safety_net_* columns (inspected_count, kept_count, removed_count, total_flags, 4 per-flag rollups, inspection_completed). `demoDataset.js` produces synthetic inspection per brief: ~80% inspect all, ~15% partial, ~5% skip; ~20% have a "yes" flag; removal probability tuned higher for noisy allies.
- **`d515d0e` · 2026-05-11** — Draft 8 of the Safety Net Step 1 rebuild. Full rewrite of `src/activities/AlliesSafetyNet.jsx` to Variant C (per-support-type multi-select grid). 5 paginated screens: intro → Practical → Emotional → Social → placeholder Safety Net visual. 15 new SVG ally tiles in `src/assets/allies/` (data-om-id attributes stripped); new `src/lib/allyTiles.js` is single source of truth for tile registry + support-type definitions. Custom tiles (other1, other2) accept inline names that persist across all three type screens. Per-type "None of these" buttons capture affirmative "no one for this type" responses (meaningfully distinct from skipping). Save payload reshaped to `{ allies: [{id, name, custom, support_types}], none_for: {practical, emotional, social}, saved_at }`. Old 4-step flow (Build → Inspect → Strengthen → Review, ~580 LOC) torn down entirely; Steps 2–4 will be rebuilt later as Task #7 after team design discussion. Version bumped to v2.0 (MAJOR). `exportFlatten.js` safety_net_* columns reshaped accordingly (counts + none-flags + names/ids list); per-tile binary columns deferred pending Jessica's review. `demoDataset.js` produces the new shape with the distribution from the brief (70/20/10).
- **`6e0308c` · 2026-05-11** — Draft 6 follow-up: SPSS syntax (`.sps`) generator I missed in `0415172`. New `src/lib/spssSyntax.js` reads the same column registry that `exportFlatten.planWideColumns()` produces, so the Wide CSV and the `.sps` stay in sync from a single source of truth. Emits header comment + `GET DATA` + `VARIABLE LABELS` + `VALUE LABELS` (psychometric scales grouped by shared anchor set; BHS/ASCS/UCLA/NB/BPB hard-coded labels) + `VARIABLE LEVEL` (ordinal/scale/nominal grouping) + `FORMATS` + `SAVE OUTFILE` to `.sav`. SPSS variable-name validation up front (64-char max, must start with a letter, no SPSS reserved words like `ALL`/`AND`/`BY`/etc.) — throws on violation rather than emitting a malformed file. `/demo` Data export now offers three downloads: Wide CSV, `.sps` syntax, Codebook CSV; copy rewritten to explain the SPSS bundle approach (open the `.sps` in SPSS to get a labeled `.sav`) with a note that the Qualtrics-native-`.sav` route is parked as Task #11 Phase B. INFRASTRUCTURE.md change-log entry added.
- **`aa94130` · 2026-05-11** — Draft 7 of the data-and-pretest batch: Pretest paginated sandbox activity on /demo. New `src/activities/Pretest.jsx` renders the locked Belonging pretest (29 items: 6 demographics + 7 scales — Beck Hopelessness, Adolescent Sense of Control, UCLA, Need to Belong, Belonging Promoting Behaviors, Belonging Worries, Program Expectation) as a 10-screen paginated flow mirroring the live session. Save payload is FLAT and keyed by the SPSS column names from Draft 6, so participant submissions match the export CSV exactly with no recoding. Sliders require explicit drag/tap before counting as answered; Belonging Worries Q2 hidden when Q1 = 0 (saves `pre_bw_2` as null). Back button on every screen, progress strip up top. Wired in via the existing `TEST_REGISTRY` pattern under a new `RSD test` category; new "Tests" section on DemoPage between Activities and Data export demo. `activityVersions.js` gets `pretest` at v1.0.
- **`0415172` · 2026-05-11** — Draft 6 of the data-and-pretest batch: export column-naming refactor per Jessica's 2026-05-11 brief. New convention `<timepoint>_<scale_abbrev>_<item#>` (e.g. `pre_bhs_1`, `post_ascs_3`); score columns `<timepoint>_<scale_abbrev>_score`. Scale abbreviations mapped in `src/lib/exportFlatten.js` (`SCALE_ABBREVIATIONS`): bhs, ascs, ucla, nb, bpb, bw, pe, pa. The `appraisals_*` columns from the live snapshot — origin unclear, not in the locked pretest doc — mapped to `app` with a code comment flagging "confirm with Jessica/Stephanie." Custom-activity payload columns now use short prefixes (`unstuck_*`, `safety_net_*`, `sort_*`, `poem_*`, `letter_*`, `reflect_*`) via `ACTIVITY_PREFIXES`. GettingUnstuck v2 emits per-thought columns covering all 8 stuck thoughts (`unstuck_freq_st1`..`st8`, `_belief_`, `_selected_`, `_strategy_`, `_response_`); `n_fight` renamed to `n_challenge`. WhoIAmPoem v2 emits 8 keyed-field columns; LetterBuilder v2 emits a single `letter_text` column. `src/lib/demoDataset.js` updated to produce the new save shapes for the three rebuilt activities. /demo's Data export section drops Summary + Long buttons (remain on `/admin/data-export`); new short copy explains the convention. INFRASTRUCTURE.md change-log entry added. No activity-version bumps — pipeline change only.
- **`7b7046e` · 2026-05-11** — RSD activities: 2026-05-11 review-meeting batch. Five drafts shipped together as one stopping-point per Josh's batched-stopping-point workflow. **Draft 1 — Self-Reflection (v1.1, MINOR):** exclusion prompt reframed as agentive ("Now think of a time someone made you feel like you did not belong"). **Draft 2 — Who I Am Poem (v2.0, MAJOR):** rebuilt to Ginny's 10-line structure on a single screen with a worked example; George Ella Lyon attribution removed; save payload reshaped. **Draft 3 — Belonging Skills Sort (v2.0, MAJOR):** all 7 labels replaced with the locked pretest-doc items; tap-toggle "?" definition popovers added per Ginny/Stephanie/Holly; unplaced layout switched to vertical-stack to fit the longer sentence-style labels. **Draft 4 — Letter to Another Youth (v2.0, MAJOR):** collapsed 6-section structured letter to single free-write per Stephanie; removed word-bank chips, cross-activity pull-forward, and keepsake step. **Draft 5 — Getting Unstuck (v2.0, MAJOR):** replaced Kai-quote intro with per-thought 5-point appraisal scale (frequency + believability; eligibility ≥3 on either unlocks selection); restored Stephanie's three challenge prompts as scaffolding above a single response field; renamed "Fight it" → "Challenge it" throughout including data keys. Per-activity changelog in `src/lib/activityVersions.js`. Original batch prompt preserved verbatim below.

  <details>
  <summary>Original batch prompt (verbatim, Claude Cowork → Claude Code)</summary>

  ### Batch: easy-wins from the 2026-05-11 review meeting (Claude Cowork, 2026-05-11)

  Josh approved Ginny's batched-stopping-point workflow on 2026-05-11 — work through all five drafts below in order, ship them as a coherent set, and Josh will announce one stopping point to the team afterward so reviewers see a stable build rather than a moving target. Order is smallest-to-largest. All five touch demo-only state with no real participants, so data-shape breaks are acceptable.

  #### Draft 1 — Self-Reflection: sharpen "excluded" prompt wording

  Holly flagged in the 2026-05-11 feedback round that the current exclusion prompt — *"Now think of a time you felt excluded — a time you felt like you did not belong"* — reads as a state of being rather than an event done to the kid. Reframe to make the exclusion agentive.

  **File:** `src/activities/SelfReflection.jsx`

  **Change:** Find the exclusion prompt (the second half of the inclusion/exclusion pair) and replace it with:

  > Now think of a time someone made you feel like you did not belong.

  The inclusion prompt stays as-is. This is the only copy change.

  **Version bump:** MINOR. Prepend a one-line entry to this activity's `changelog` in `src/lib/activityVersions.js`, set `updated` to today's date.

  **Approved by:** Josh, 2026-05-11. Treated as a clinical-content tweak Sprang doesn't need to weigh in on at this scale.

  #### Draft 2 — Who I Am Poem: rebuild to Ginny's 10-line structure

  Ginny sent a revised poem structure (image: `Poem structure.png` in the repo root). She has final word on platform UX per Josh's call. This supersedes the meeting transcript's "one stanza only" framing.

  **File:** `src/activities/WhoIAmPoem.jsx`

  **Replace the current poem flow with this 10-line structure.** Kid fills in 8 input fields; lines 6 and 10 auto-display whatever they wrote for line 1.

  | Line | Prompt | Kid input |
  |------|--------|-----------|
  | 1 | I am | two special characteristics you have |
  | 2 | I am from | a place, people, or way of life |
  | 3 | I fear | something you are afraid of |
  | 4 | I suffer when | an event that makes you sad or angry |
  | 5 | I want | an actual desire |
  | 6 | I am | *(auto: same text as line 1)* |
  | 7 | I believe | something you believe in |
  | 8 | I dream | something you actually dream about |
  | 9 | I am going | where you hope to be |
  | 10 | I am | *(auto: same text as line 1)* |

  **Behavior:**
  - 8 inputs (lines 1, 2, 3, 4, 5, 7, 8, 9). Lines 6 and 10 are display-only and mirror line 1.
  - Single screen. No multi-page flow.
  - Before the input form, show a brief worked example of a finished poem (Holly: *"I think we might want an example of a finished product here before we ask them to do it"*). Write something simple in-voice — don't pull from a published poet, since that's exactly what Ginny asked us to stop doing. Two to three lines of a sample is enough; doesn't need to be all 10.

  **Copy changes:**
  - Remove the "George Ella Lyon" / "Lyons format" / "Two-stanza George-Ella-Lyons-style poem with keepsake card" attribution entirely. Ginny was explicit: *"Remove this label — this isn't the Lyons format."* If a credit is wanted, "Inspired by traditional 'I am' poems" is fine. No named-poet attribution.
  - Keep tone warm and kid-friendly.

  **Data shape:**
  Save payload preserves the 8 unique inputs:
  ```
  {
    characteristics: "...",  // line 1
    from: "...",             // line 2
    fear: "...",             // line 3
    suffer_when: "...",      // line 4
    want: "...",             // line 5
    believe: "...",          // line 7
    dream: "...",            // line 8
    going: "...",            // line 9
    saved_at: "..."
  }
  ```
  Lines 6 and 10 reconstruct from `characteristics` at render time.

  **Version bump:** MAJOR. Prepend changelog entry, update `updated`.

  **Source:** `Poem structure.png` in the repo root.

  #### Draft 3 — Belonging Skills Sort: kid-friendly labels + hover-define tooltips

  Stephanie + Holly + Ginny all converged on this. Stephanie: language needs to be more child-friendly. Holly: *"reducing belonging uncertainty and creating space for belonging aren't specific enough... I'm not even sure what that means behaviorally."* Ginny: *"we should define these if you hover over the skill as a reminder."*

  **Files:** `src/activities/BelongingSkillsSort.jsx` and any associated data file under `src/lib/` that defines the skill list (check both).

  **Replace the existing 7 skill labels (`bs1`–`bs7`) with the 7 Belonging Promoting Behaviors items from the locked pretest doc** (`Pretest Draft Belongingness_5.2.26.docx`, "Belonging Promoting Behaviors (7 items)" section, confirmed final by Josh 2026-05-11). In this order:

  1. **`bs1`** — Pay close attention when someone is talking to you (without checking your phone or getting distracted)
  2. **`bs2`** — Use words like "we," "us," or "our group" to make people feel included
  3. **`bs3`** — Say thank you or tell others when they do something you appreciate
  4. **`bs4`** — Help someone out when they need it
  5. **`bs5`** — Invite others to spend time with you
  6. **`bs6`** — Include others in conversations and activities (like watching a movie, going for a walk, or playing a game)
  7. **`bs7`** — Talk through a disagreement with someone until you find an answer that works for everyone

  **Add hover-define tooltips** — each skill shows a 1–2 sentence definition on hover (desktop) or tap (mobile). Draft definitions below; refine in voice as needed:

  1. Giving someone your full attention when they're speaking — eyes on them, no phone, no looking around.
  2. Saying things that signal everyone belongs in the group — "we" instead of "you guys," "our team" instead of "the group."
  3. Telling someone you noticed and appreciated what they did, instead of just thinking it.
  4. Offering help when you see someone needs it, without waiting to be asked.
  5. Reaching out to bring someone into your plans or your day, instead of waiting for them to ask.
  6. Making space for others in what you're already doing — looping them into the conversation, the game, the show.
  7. Staying with a disagreement until you find something that works for everyone, instead of walking away or giving up.

  **Implementation notes:**
  - Tooltip must be tap-accessible on mobile (use a small "?" affordance or tap-to-toggle, not hover-only).
  - Skill IDs `bs1`–`bs7` stay sequential; the *meaning* of each ID is changing, but that's fine — demo-only state, no real participants.
  - The three categories (`already_doing`, `willing_to_try`, `unplaced`) stay as-is.

  **Version bump:** MAJOR (label set is structurally changing and per-ID meaning shifts).

  #### Draft 4 — Letter to Another Youth: collapse to one-page free write

  Meeting + feedback consensus 2026-05-11. Stephanie: *"the letter has too many steps and would be confusing for a kid"* — and she fed back to herself that the multi-section format produced a letter that *"was meaningless"* because the kid was just borrowing other people's words. Holly reported a bug where click-to-add inserts text before the prompt sentence — that whole interaction becomes moot once we remove click-to-add.

  **File:** `src/activities/LetterBuilder.jsx`

  **Rebuild as a single-screen free-write activity** modeled on the gains-professional one-page pattern. Look for that pattern elsewhere in `src/activities/` for the visual reference — it's a one-textarea, write-whatever-you-want layout.

  **Required changes:**
  1. **Collapse all 6 sections into one.** A single textarea, free-form. Save on continue.
  2. **Remove every click-to-add prompt button.** Do not import phrases from other activities (Getting Unstuck, etc.). The letter should come entirely from the kid — Stephanie was explicit.
  3. **Add a short context line above the textarea** describing who the kid is writing to (Stephanie: *"Maybe need to give them a little more context for who they are writing to"*). Suggested copy:
     > Write a letter to another teen who is starting where you are now. What do you want them to know?
  4. **Optional small example** *outside* the textarea (greyed/italic) showing the kind of letter that's welcome. Keep it short — one sentence — and generic. Not a model letter to copy.

  **Data shape:**
  - Save payload becomes `{ letter: "<full text>", saved_at: "..." }`. Drop all the structured per-section fields. Breaking change to the saved schema; acceptable since demo-only.
  - **Remove cross-activity coupling.** Stephanie's comment *"They may not do a both/and statement from getting unstuck, so not sure what would show up here if they didn't"* implies Letter Builder currently reads Getting Unstuck output. Kill that dependency entirely — the letter is freestanding now.

  **Version bump:** MAJOR (structural change, feature removal, data shape change).

  #### Draft 5 — Getting Unstuck: appraisal scale + restored challenge prompts + "Challenge it" rename

  Three changes from Stephanie's feedback + the 2026-05-11 meeting.

  **File:** `src/activities/GettingUnstuck.jsx`

  **Change 1 — Replace the intro panel with a 5-point appraisal scale on the stuck-thoughts screen.**

  Ginny called out that the current intro is confusing: the Kai quote followed by *"tap any thoughts that feel true for you"* doesn't read coherently — she had to re-read multiple times to figure out what to do. Stephanie's fix: drop the standalone intro panel and put the 5-point appraisal scale directly on the stuck-thoughts selection screen.

  For each preset stuck thought, alongside the thought itself, ask:
  - **How often do you have this thought?** (5-point scale)
  - **How strongly do you believe this thought is true?** (5-point scale)

  Anchors for both scales: 1 = Never / Not at all, 2 = Rarely / A little, 3 = Sometimes / Somewhat, 4 = Often / Mostly, 5 = Always / Completely.

  Stephanie noted these *"may fit with the pretest appraisal questions"* — keep that compatibility in mind. The pretest doc as locked doesn't include this exact appraisal instrument (Beck Hopelessness, ASCS, UCLA, Need to Belong, BPB, Belonging sliders, Expectation slider are the locked scales). If a separate appraisal scale exists elsewhere in the planning materials, align anchors to that; otherwise the anchors above are the working values.

  The kid then explicitly selects which thoughts they want to work on (suggested: any thought rated ≥ 3 on either scale is eligible; the kid picks from the eligible set).

  Remove the standalone Kai-quote intro panel entirely. If a brief intro is still needed, fold it into the appraisal screen as a single header line — but don't restate the Kai context, it's confusing.

  **Change 2 — Restore the three challenge prompts.**

  Stephanie's PPT slide 12 lists three prompts for the challenge strategy. The current build appears to only show one. Restore all three, displayed together as scaffolding above a single open-ended response field (not three separate inputs):

  > - Is there another way I can think about this?
  > - Is this really true, or can I think of a way it isn't true?
  > - Is this thought helping me, and if not, what is a thought that might be more helpful?

  **Change 3 — Rename "Fight it" → "Challenge it" throughout.**

  Stephanie's request — more clinically standard. Every UI label, button, and saved-data key that says "fight" or "fight_it" becomes "challenge" or "challenge_it." The "both/and" strategy stays as-is.

  **Data shape:**
  - Appraisal scores (frequency, believability) saved per stuck thought. New fields on the activity payload.
  - Strategy key rename from `fight_it` to `challenge_it`. Demo-only, no migration needed.

  **Version bump:** MAJOR.

  **Open question (not blocking — build text for now):** Stephanie asked whether the strategy explanation should be audio/video rather than text. Build text; we can swap to video later without restructuring the form.

  *End of 2026-05-11 batch. After all five ship, Josh announces one stopping point to the team for batched review.*

  </details>

- **`2dfc310` · 2026-05-11** — Auth, third pass (and hopefully the real root cause). After signing in successfully, the dashboard hung on Loading and the "Reset session" button itself didn't respond to clicks. Root cause: supabase-js's `auth.lock` (navigator.locks-based) gets contested and hangs *every* subsequent authenticated call — both the `user_roles` SELECT in `fetchRole` (so AuthContext never flips `loading=false`) and `supabase.auth.signOut` (so the Reset button can't clean up). Three fixes: (a) `src/lib/supabase.js` passes a pass-through lock function to disable navigator.locks entirely — overkill for a single-user admin app; (b) `fetchRole` is now wrapped in a 4s timeout; (c) `resetAndReload` is now synchronous and bypasses `supabase.auth.signOut` entirely — it just removes `sb-*-auth-token` from localStorage and hard-reloads. The Reset button can never hang.
- **`761b827` · 2026-05-11** — Auth follow-up: the page-load race fix in `4e60c77` left the actual sign-in attempt unprotected. User reported the button still hangs on "Signing in…" on second+ visits in both Chrome and Edge. Root cause: supabase-js's `signInWithPassword` does its own best-effort cleanup of any existing session in localStorage before processing new credentials; when that cleanup hangs (revoke-call network blip, navigator.locks contention from a prior wedged session), the whole promise never resolves. New `src/lib/authReset.js` exports `clearAllAuthState()` + `withTimeout()` (extracted from AuthContext). `AdminLoginPage.handleSignIn` now calls `clearAllAuthState()` BEFORE `signInWithPassword`, and wraps the call in a 12s timeout so it can't hang silently — on timeout we re-clear state and surface a clear retry message.
- **`4e60c77` · 2026-05-11** — Auth bootstrap rewrite to actually fix the recurring "have to clear site data to log in" bug. Root cause: `AuthContext` was calling both `getSession()` and registering `onAuthStateChange` in the same tick, racing against each other (supabase-js fires `INITIAL_SESSION` synchronously on subscription). The two paths called `fetchRole + setLoading(false)` independently in non-deterministic order, occasionally wedging on `Loading…` forever. Fix follows the supabase-recommended pattern: use ONLY `onAuthStateChange` as source of truth, dedupe by `user_id` so `TOKEN_REFRESHED` doesn't re-flash loading, 5s watchdog forces clean logged-out state if no event arrives, and ProtectedRoute's loading screen now shows a "Reset session & sign in" button after 6s as an in-app escape hatch.
- **`f5a2662` · 2026-05-11** — Hotfix: `/admin/feedback` was crashing with a TDZ error (`Cannot access '_' before initialization`) because `downloadSpreadsheet` was declared above `filtered` while referencing it in its useCallback deps. Moved it below `filtered` + `counts`. Likely also resolves the "have to clear site data to log in" symptom — when the Feedback page crashed mid-render, React unmounted the whole tree, so any tab with `/admin/feedback` in history looked blank on reload.
- **`9c57519` · 2026-05-11** — Feedback system: activity versions + CSV download. New `src/lib/activityVersions.js` is the source of truth for sandbox-activity versions (all 6 RSD activities at v1.0); convention documented in `CLAUDE.md` (bump in the same commit as the activity change). `public.feedback.activity_version` column + edge fn v3 capture which version each comment is about. Version badge shown on the sandbox page (so testers see what they're poking at) and in the admin table + expanded detail. New "Download CSV" button on `/admin/feedback` exports the currently filtered rows as `feedback-<filter>-YYYY-MM-DD.csv` (12 columns including `activity_version`).
- **`c959174` · 2026-05-10** — Added `STATE_OF_THE_PLATFORM.md` — accurate live snapshot (Supabase tables + row counts + RLS, all 11 edge functions, migrations, recent commits, repo layout, Vercel/domain/email pipeline, Qualtrics integration, deferred work) framed for the CTAC-apps-consolidation decision (status quo vs shared Supabase vs single mega-app).
- **`cdbd78c` · 2026-05-08** — Added Stephanie to the feedback submitter roster (FeedbackButton dropdown + AdminFeedbackPage labels + `submit-feedback` edge function allow-list + `public.feedback.submitter` CHECK constraint).
- **`0287706` · 2026-05-08** — Feedback collection on the public demo. New `public.feedback` table (admin-only RLS) + `submit-feedback` edge function (anon, validates roster + category + message). Persistent **Give feedback** button in `DemoPageLayout` auto-fills "Where you are" from the route. Admin review at `/admin/feedback` (filter by status/category, expand row to triage status `new → acknowledged → addressed | declined` and edit `admin_notes` inline). New Feedback nav item in AdminLayout (admin-only). INFRASTRUCTURE.md change-log updated.

---

## ⬆ Ideas / drafts for the next Claude Code session (Claude Cowork → Claude Code)

> Drop polished prompts here for the next Claude Code session to pick up. When Josh starts a new session with Claude Code, he'll say "read WORKING_NOTES.md, the latest draft is at the bottom" and Claude Code will work from there. Drafts can also be rough — Claude Cowork can help refine them in place before handing off.

<!-- Add new drafts BELOW this line, newest at the bottom so Claude Code works through them in submission order. -->

<!-- Drafts 18 + 19 shipped 2026-05-19, Draft 20 shipped 2026-06-01 — archived (commented out). Draft 21 below is still active (spec/assets only, integration deferred). -->

<!--

### Draft 20 — 2026-06-01 meeting bundle (Getting Unstuck v5.3 + Allies v5.1 + Poem v2.4)

Bundle of three small-to-medium changes from the 2026-06-01 review meeting. Ship as one commit so the team sees one stopping point.

---

#### Part A — Getting Unstuck v5.2 → v5.3 (MINOR)

Two changes to Getting Unstuck. Ship together.

##### A.1 — Pick-screen threshold flip (≥3 → ≥2)

**Context:** This is the third flip on this single line. The chronology, so future-us doesn't get whiplash:

- Original (v3.0 / v4.0): `truth_rating ≥ 3` carries forward.
- Draft 15 / commit `27e4d52` (v5.0): lowered to `≥ 2` per Stephanie's *"higher than 1"* feedback.
- Draft 17 / commit `6900549` (v5.1): reverted to `≥ 3` — Josh's clinical-content call, items below "Somewhat True" not worth the kid's time.
- **Now (v5.3): back to `≥ 2`.** Different rationale this time: the 2026-06-01 meeting landed on the operational-anchor logic — on the 0-5 scale, **2 is exactly the "Somewhat True" anchor**, so a kid who endorses an item even slightly (≥2) is meaningfully endorsing it and should get the option to work on it. Stephanie raised the issue again ("It did not pull forward thoughts I rated at a 1"), the team agreed in the meeting, Josh's admin note confirms.

**This is the final landing.** If a future round opens it again, we should have a serious clinical conversation rather than another constant flip.

**File:** `src/activities/GettingUnstuck.jsx`.

**Change:** `ELIGIBILITY_THRESHOLD = 2` (was `3`). The header comment at the top of the file plus the Other-screen narrative note (which was updated in Draft 17 to match `≥3`) need re-updating to say `≥2 ("Somewhat True" or above)`.

**Affirmation-path behavior:** if no items clear the `≥2` threshold, the kid still hits the affirmation path (no Pick screen, brief positive message, Save). The transcript discussion added a subtlety: in this no-eligible-thoughts case, the kid should still see the **strategy-explanation video** for Challenge vs. Both/And — even though they don't have a specific thought to work on, the educational content is valuable. The video is currently a placeholder per Draft 19; just make sure it surfaces on the affirmation path too (or at the very least, the text scaffolding does).

**Data shape:** no change.

**Export pipeline:** no change.

##### A.2 — Affirmation screens between consecutive thought-work cycles

**Context:** Ginny flagged in the feedback form *"I feel like we need some encouragement — like good work, nice job, let's try another"*; the transcript confirms — *"after each time they challenge that they needed an affirmation."* When the kid picks two thoughts to work on (max-2 cap from Draft 19), they go through Challenge or Both/And on the first thought, then directly to the second. Currently there's no transition.

**Change:** After the kid completes a thought (saves a Challenge response or a Both/And statement), if they have another selected thought still to work on, show a brief affirmation screen before the next thought's strategy screen.

**Screen content:**

- Short heading from a small rotating pool — *"Nice work."* · *"Good job."* · *"You're doing this."* · *"Keep going."* (~4–6 options, randomized so a kid working through two thoughts doesn't see identical copy back-to-back).
- A one-line follow-up: *"Let's try the next one."*
- Continue button.

Keep it small — single screen, no inputs, ~3 seconds of read time. Don't over-formalize the affirmation; the goal is a soft "you did the work, here's a beat to breathe" rather than a celebration.

**No affirmation screen** after the final thought (the activity ends with the existing Save / Review flow).

**Implementation note:** the affirmation screen is purely visual — no data is saved. Don't add anything to the payload.

**Out of scope here:** the *kind* of richer encouragement Ginny gestured at ("more encouragement and affirmation") could be expanded later — visual celebration, a tree-roots growth tick (tied to Draft 21), confetti, etc. For now, just text.

##### A.3 — Version bump

`getting-unstuck` v5.2 → **v5.3 (MINOR)**. Prepend changelog entry: *"v5.3 — Pick-screen threshold reverted to ≥2 ('Somewhat True' anchor logic, final per 2026-06-01 meeting); added brief affirmation screen between consecutive thought-work cycles per Ginny's encouragement ask."* Update `updated`.

---

#### Part B — Allies / Safety Net v5.0 → v5.1 (MINOR-ish; behavior change, no breaking data-shape)

Two related changes to the Strengthen step, both from Ginny's stress-test (she selected foster mom/dad for every support type and ended up with only those two in her net) and the meeting discussion.

##### B.1 — Strengthen runs for all three support types, not just gaps

**Context (v5.0 spec, per Draft 19):** Strengthen step ran only for support types with 0 or 1 ally (gap detection).

**New behavior:** Strengthen step runs **for all three support types**, regardless of how many allies the kid has selected. Same screens, same inputs, same Skip option — just always three screens instead of 0–3.

The rationale (transcript): even a kid with five practical-support allies might think of someone else worth adding when prompted. The gap-only detection misses that. Prompting everyone normalizes the "let's expand" framing.

##### B.2 — Remove the "same-kid ally suggestion chips" from Strengthen

**Context (v5.0 spec):** each Strengthen screen showed quick-add chips with names of allies the kid had selected for OTHER support types, so they could re-use a name without retyping.

**Remove these.** Per Ginny's stress test (kid selects foster mom/dad for every type → strengthen suggests them again → kid clicks the chip → safety net stays small): the chips encourage re-using existing allies instead of expanding. Goal of the Strengthen step is expansion. Take the chips out entirely.

Replace with a clean text input. The kid types the name from scratch.

##### B.3 — Copy adjustments for the new behavior

The Strengthen-screen heading was *"Let's strengthen your {type} support"* with a sub-line that varied by gap size (0-ally vs 1-ally). Replace both sub-lines with a single neutral version:

> Is there anyone else who could give you **{type}** support? Adding more people can make your safety net stronger.

(Color the **{type}** word per the existing support-type color scheme from Draft 19.)

The two inputs and Skip button stay as v5.0 spec'd them.

##### B.4 — Final Review screen — no change to net visualization

Per the meeting discussion: typed-in names from Strengthen stay in the action callouts only; they do **not** get added to the net visualization. Stephanie's framing — *"Frank isn't really in the net until we call him and see"* — the net should reflect actual current connections, not aspirational ones. The action callout is where the aspiration lives.

##### B.5 — Data shape + export pipeline

The `strengthened` object stays the same shape but is now always populated for all three types (no more `null`). Field semantics shift slightly:

- `gap_filler` → consider renaming the field to `additional_person` to match the new framing (this isn't strictly about filling a gap anymore). Optional — keep `gap_filler` if churn isn't worth it; if renaming, update `exportFlatten.js` columns to match.
- `action` unchanged.
- `skipped: bool` unchanged.

Export pipeline:

- Drop `safety_net_strengthen_gaps_count` (no longer meaningful — every kid sees all three types).
- Add `safety_net_strengthen_added_count` — integer 0-3, count of types where the kid filled in an additional person (i.e., `additional_person` non-empty AND `skipped = false`).
- Keep `safety_net_strengthen_{type}_filler` / `_action` / `_skipped` columns (renamed if field renamed in B.5 above).

##### B.6 — Demo dataset

`demoDataset.js` regenerate `safety_net_*` synthetic data:

- Every synthetic participant now goes through all three Strengthen screens.
- ~50% fill in an additional person per type (skip rate ~50%).
- Free-text values pull from the same small string pool from Draft 19.

##### B.7 — Version bump

`allies-safety-net` v5.0 → **v5.1 (MINOR)**. Behavior change but no breaking data-shape change at the JSON level. Prepend changelog entry: *"v5.1 — Strengthen step now runs for all three support types (not just gaps); removed the same-kid suggestion chips per Ginny's 2026-06-01 stress test (chips encouraged re-using existing allies rather than expanding); copy reframed as 'who else' instead of gap-specific phrasing."* Update `updated`.

---

#### Part C — Who I Am Poem v2.3 → v2.4 (MINOR copy/UI cleanup)

**Context:** Ginny's feedback — *"I think having line 6 and line 10 written in like that might be confusing."* Josh's admin note: *"Take out the numbering and take out the Instructions visible on line 6 and 10."* Meeting confirmed.

**File:** `src/activities/WhoIAmPoem.jsx`.

**Two changes:**

1. **Remove the visible line numbers** (the small "1", "2", "3"… numbers next to each input/display line). The kid doesn't need to see them — the structure is implicit in the layout.

2. **Remove the "same as line 1" instruction text** currently visible next to lines 6 and 10. Those two lines auto-mirror line 1 silently; the kid doesn't need to be told. Just render lines 6 and 10 as the mirrored "I am ___" text without explanation.

The poem structure itself, the auto-mirroring logic, and the keepsake output are all unchanged.

**Version bump:** v2.3 → **v2.4 (MINOR)**. Prepend changelog: *"v2.4 — Removed visible line numbers and the 'same as line 1' instructional text from lines 6 and 10 per Ginny's 2026-06-01 feedback ('confusing')."*

---

**Approved by:** Josh, 2026-06-01.

**Out of scope for this draft:**

- Continue buttons at the end of standalone activities (Ginny flagged across multiple). Per the meeting transcript, this is an artifact of activities being standalone for testing; covered by the eventual flow-integration draft.
- Self-Reflection "feedback for nonsense input or feeling/thought mismatches" (Ginny's question). Hard NLP problem, no clear meeting decision; defer.
- Sam character art revisions (brighter backgrounds, happier baseline, more ethnically ambiguous, age-appropriate clothing progression). Josh's asset-generation workflow, not a code change.
- The tree-roots progress visual — separate spec in Draft 21.

*End of Draft 20.*

-->

---

### Draft 21 — Tree-roots progress visual: spec + assets + state model (integration deferred)

**Status:** Design + asset prep now, integration deferred until the standalone activities are stitched into a continuous flow. The team converged on this at the 2026-06-01 meeting — ties cleanly to the Ready for Roots metaphor, addresses the kids-research finding about wanting feedback and a sense of progress, and resolves the "I'm at a dead end" feeling Ginny flagged across multiple standalone activities.

**What this draft delivers:**

1. A spec'd visual: a tree with growth stages, where the visible state grows as the kid completes sections of the intervention.
2. An asset list so Josh (or an art workflow) can generate the SVG growth-stage frames now.
3. A state model so the data tracking is decided before integration time.
4. A spec for the "progress reveal" screen that flashes between sections.

**What this draft does NOT deliver yet:**

- The actual integration into the participant flow (deferred — activities are still standalone). When the activities are stitched together, a follow-up draft wires this in.

---

#### 1. Visual spec

A tree that visibly grows as the kid progresses. Five growth stages:

| Stage | Trigger | Visual |
|---|---|---|
| **0 — Seed** | Intervention start | A small seed or sprout, roots barely visible underground. |
| **1 — Sapling** | After Self-Reflection | Roots have spread a little. Small trunk emerges above ground. A leaf or two. |
| **2 — Young tree** | After Getting Unstuck | More extensive root system underground (visibly bigger). Several branches. A few leaves. |
| **3 — Established tree** | After Belonging Skills Sort | Full root system. Sturdy trunk. Branches with leaves. |
| **4 — Flourishing tree** | After Allies / Safety Net | Roots clearly anchored and spread wide. Full canopy. Leaves are full color. |
| **5 — Blooming** | After Letter to Another Youth + Who I Am Poem (final activity / completion) | Same tree, now with flowers / fruit. Roots wind clear across the bottom of the frame. |

**Art direction notes:**

- The roots are the visual focus, not the canopy. Reinforces the "Ready for Roots" name. Roots should be more prominent than they would be on a typical tree illustration — drawn proudly, visible below an implied ground line.
- Style: soft, warm, not overly literal. Should match the platform's amber/slate palette and the Sam character's art direction once that's locked. Defer final style to Josh's art workflow.
- Same composition / framing across all six stages so the growth is continuous (kid sees the same tree, just bigger). One canvas, layered.
- SVG so it scales cleanly across desktop and mobile.
- 16:9 aspect ratio recommended so it fills a phone screen comfortably in landscape and works as a hero on desktop.

**Asset deliverable from Josh's side (when art workflow is ready):** six SVG files named `tree-stage-0.svg` through `tree-stage-5.svg`, dropped into `src/assets/tree/` (new directory).

---

#### 2. State model

Track which stages the kid has completed.

**New top-level participant state field** (decide location at integration time — likely a `progress` table or a column on the existing participant record):

```js
progress: {
  current_stage: 0 | 1 | 2 | 3 | 4 | 5,
  completed_activities: ["self-reflection", "getting-unstuck", ...],
  stage_advanced_at: { "1": "2026-06-15T...", "2": "...", ... }
}
```

`current_stage` is the highest stage the kid has unlocked. `completed_activities` is the source-of-truth list of activity slugs the kid has finished (drives the stage calculation). `stage_advanced_at` is a timestamp log so we know when each stage advanced (useful for analytics later).

The mapping from completed-activities count to stage is deterministic per the table above; compute on read rather than storing redundantly. This means if the activity order ever changes, only one mapping function changes.

**Persistence:** stage state lives keyed by PID (per the pending PID-linking requirement section below). For demo-only testing, can be localStorage-backed initially with a TODO comment to move to Supabase at flow-integration time.

---

#### 3. Progress-reveal screen spec

When the kid completes an activity and the stage advances, show a dedicated full-screen "progress reveal":

**Screen layout:**

- Centered tree visual (the new stage's SVG, full size).
- Above the tree: a short heading from a small rotating pool — *"Look at your roots."* · *"Your roots are growing."* · *"Keep going — your roots are spreading."*
- Below the tree: a one-line context — *"You finished {activity name}."* (where `{activity name}` is the just-completed activity's display name).
- A Continue button below that.

**Behavior:**

- Auto-shows after the kid's existing per-activity Save / Review screen, before they're routed back to the flow.
- Plays a subtle one-time animation: roots / branches grow into their new positions from the previous stage's resting state. ~600ms ease-out. If reduced-motion preference is set in the user's OS, skip the animation and just show the final state.
- Kid taps Continue → next activity in the flow (or completion screen if this was the final activity).

**Where in the flow:** between every activity, at the moment of stage advance. If the kid completes multiple activities in one session, they see the progress reveal between each (the metaphor needs the repeated reinforcement).

**Mobile:** the tree fills most of the screen vertically; heading + caption + Continue stack below it. Same composition as desktop, just smaller.

---

#### 4. Integration scope (out of this draft, parked for later)

When the activities are stitched into a continuous flow (no draft for this yet — depends on the Qualtrics-link handoff and the broader Ready for Roots participant-flow rebuild), this draft's deliverables get wired in. That work is:

- A new `<TreeProgress />` component that renders the right stage based on completed_activities.
- A routing change so the post-Save handler on each activity routes through the progress-reveal screen before the next activity.
- Persistence of the progress state per PID in Supabase (new column or new table).
- Backfill for any in-flight demo participants (probably just clear demo state).

Parked for a follow-up draft once the activities are joined.

---

**Approved by:** Josh, 2026-06-01 — design + assets + state model now, integration when the flow lands.

**Out of scope:**

- Actual SVG art generation — Josh's art workflow handles this, drops the six stage files into `src/assets/tree/`.
- Flow integration — deferred to a follow-up draft when standalone activities are joined.
- Variant trees (different art for different kid demographics, etc.) — not requested, not needed for MVP.

*End of Draft 21.*

---

<!-- Draft 25 shipped 2026-06-04 — archived (commented out). Draft 21 above stays active: its flow-integration intent is still pending. -->

<!--

### Draft 25 — Tree-progress preview: parametric `<TreeProgress />` component + new /demo "Growing your roots" section

Build the parametric React component for the tree-roots progress visual (per Draft 21's spec) and a click-through preview section on /demo so the team can see the visual progression with growth animation and per-stage encouragement copy.

**Two deliverables in one commit:**

1. `src/components/TreeProgress.jsx` — parametric SVG component with growth animation between stages.
2. New section on `src/pages/DemoPage.jsx` called **"Growing your roots"** — places `<TreeProgress />` inside click-through controls so reviewers can see all six stages with copy.

---

#### Source materials (locked references from Claude Design)

Claude Design has produced six reference SVG files showing the tree at each growth stage. They live in `SSI Platform A/Activity ideas/`:

- `tree-stage-0.svg` (Seed / sprout)
- `tree-stage-1.svg` (Sapling)
- `tree-stage-2.svg` (Young tree)
- `tree-stage-3.svg` (Established tree)
- `tree-stage-4.svg` (Flourishing tree)
- `tree-stage-5.svg` (Blooming)

**These files are visual references, not shipped assets.** Study them as you'd study the original `trampoline-safety-net.svg` reference (per commit `70d117b`): use them as the target for the parametric component, but **rebuild parametrically** in `<TreeProgress />` so the dev controls per-element animation. Don't ship the reference SVGs themselves.

All six files share:
- viewBox `0 0 400 600`
- Ground line at y≈420 (~70% above ground, ~30% below)
- Trunk base at x≈200
- Transparent background
- Semantic grouping by layer (`<g id="roots">`, `<g id="trunk">`, `<g id="branches">`, `<g id="leaves">`, `<g id="blossoms">`)
- Individual paths per root and per leaf

---

#### Part A — `<TreeProgress />` component

**File:** `src/components/TreeProgress.jsx` (new).

**Props:**

```jsx
<TreeProgress
  stage={0 | 1 | 2 | 3 | 4 | 5}   // required — current growth stage
  animated={boolean}               // optional, default true — animate growth-in on stage change
  className=""                     // optional — wrapper styling
/>
```

**Structure:**

The component renders one SVG with `viewBox="0 0 400 600"`, sized at full width of its container (capped via CSS `max-w-md` or similar on the wrapper). Inside the SVG:

- Ground line (single horizontal stroke, always visible across all stages)
- `<g class="roots">` containing root paths — each root is its own `<path>` with a memorable id (`root-primary`, `root-lateral-1`, `root-lateral-2`, …)
- `<g class="trunk">` containing the trunk path — same shape across all stages, just visible portion controlled by stroke-dasharray
- `<g class="branches">` containing each branch as its own `<path>`
- `<g class="leaves">` containing each leaf as its own grouped shape
- `<g class="blossoms">` containing flowers — only renders at stage 5

**Stage logic — what's visible at each stage:**

| Stage | Visible roots | Visible trunk | Visible branches | Visible leaves | Blossoms |
|---|---|---|---|---|---|
| 0 | Tiny taproot only | Seed/sprout | none | none | none |
| 1 | Taproot + 2-3 small laterals | Short, thin trunk | none | 1-2 leaves on sprout | none |
| 2 | More laterals, deeper | Mid-height, slightly thicker | 2-3 branches | ~5 leaves | none |
| 3 | Substantial spread | Full-height, mature thickness | 4-6 branches | ~12 leaves | none |
| 4 | Wide, proud | Full mature trunk | Full canopy structure | Full canopy of leaves | none |
| 5 | Same as 4, possibly extending further | Same as 4 | Same as 4 | Same as 4 | Blossoms/fruit on branches |

The exact per-stage element set comes from Claude Design's reference SVGs — match them visually as the locked target.

**Implementation pattern:**

Hand-code the SVG paths in the component (study Claude Design's references; extract the actual path `d` attributes and clean them up). Use a per-element `visible` flag derived from the current `stage` prop:

```jsx
const ROOTS = [
  { id: "root-primary", d: "M200,420 L200,520", minStage: 0 },
  { id: "root-lateral-1", d: "M200,450 Q170,470 140,495", minStage: 1 },
  { id: "root-lateral-2", d: "M200,450 Q230,470 260,495", minStage: 1 },
  // …
];

{ROOTS.filter(r => r.minStage <= stage).map(r => (
  <path key={r.id} d={r.d} stroke={ROOT_COLOR} strokeWidth={2} fill="none" />
))}
```

Same pattern for branches, leaves, blossoms. Each element has a `minStage` — the first stage at which it appears. Once visible, it stays visible (growth is additive; nothing is removed).

**Animation between stages:**

When `stage` changes and `animated` is true, new elements (those whose `minStage === currentStage`) animate in:

- **Roots and branches:** stroke-dashoffset animation. Each path's full length is computed (use `pathLength={1}` attribute trick to normalize), then transition `stroke-dashoffset` from 1 to 0 over ~400ms ease-out so the line draws in from origin to tip.
- **Leaves and blossoms:** opacity 0 → 1 + scale 0.6 → 1 over ~300ms ease-out, staggered ~50ms between siblings so they appear in a soft cascade rather than all at once.
- **Trunk thickening (stages 1 → 4):** the trunk's `stroke-width` transitions smoothly (1.5 at stage 0, 2 at stage 1, 3 at stage 2, 4 at stage 3, 5 at stages 4-5). CSS transition on `stroke-width` over ~400ms.

**Total reveal duration:** ~600-800ms for new branches + roots to draw in, with leaves staggering slightly behind. Should feel like a moment of growth, not a flash.

**Accessibility:**

- Respect `prefers-reduced-motion: reduce` — when set, skip all transitions and just show the final state instantly. Wrap CSS transitions in `@media (prefers-reduced-motion: no-preference)`.
- The SVG should have `role="img"` and an `aria-label` describing the current stage (e.g., `"Tree at stage 3 of 5 — established, with growing roots and a small canopy"`).

**Visual styling (from the locked palette):**

- Roots: stroke `#5a3a1f` to `#4a2d18`, varied stroke widths (primary 3, laterals 2)
- Trunk: stroke + fill `#8b5a2b` to `#7c4d24`
- Leaves: fill `#7c9a76` to `#5e8460`, no stroke (or very thin slate-700 outline)
- Blossoms: fill `#f59e0b` or `#fda4af`
- Ground line: `#e2e8f0` (slate-200), `stroke-width: 1.5`

---

#### Part B — "Growing your roots" section on /demo

**File:** `src/pages/DemoPage.jsx` — new section.

**Placement:** between **Meet the cast** and **Data export demo**. Keeps the narrative-content sections grouped and the technical export section at the bottom.

**Section heading:** **"Growing your roots"**

**Sub-line** (small, italic, slate):

> Preview of the between-activity progress visual. Click through to see how the tree grows as a youth completes each activity.

**Layout:**

A centered card (`bg-amber-50`, `rounded-2xl`, `border border-amber-200`, ~32px padding) containing:

1. **The tree visual** — `<TreeProgress stage={currentStage} animated />` at ~280px wide, centered.
2. **Stage caption** — a heading + body block beneath the tree, ~24px below.
3. **Stage indicator dots** — six small dots beneath the caption showing position in the 6-stage sequence; the active stage's dot is filled amber-500, the others are slate-200. Tappable (clicking a dot jumps to that stage).
4. **Controls row** — three buttons centered below the dots:
   - **Previous** (`bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full px-5 py-2 text-sm text-slate-700`) — disabled at stage 0.
   - **Next** (`bg-amber-500 hover:bg-amber-600 text-white rounded-full px-5 py-2 text-sm font-semibold`) — disabled at stage 5.
   - **Reset to start** (`text-amber-700 underline text-sm`) — secondary affordance, resets to stage 0.

**Behavior:**

- Default stage on section mount: 0.
- Next button: `setStage(s => Math.min(5, s + 1))` — triggers the growth animation.
- Previous button: `setStage(s => Math.max(0, s - 1))` — visual "rewinds" to the prior state. The growth animation only plays on forward steps; back is an instant snap to the prior state (or a brief fade — judgment call).
- Stage dot click: jump directly to that stage. If jumping forward more than one stage, the animation should still play for the new elements at the target stage (not all intermediate stages — that would feel chaotic).
- Reset button: snap to stage 0.

---

#### Part C — Per-stage encouragement copy

These are the captions that appear below the tree at each stage. **Heading** is the big line; **body** is the short follow-on. The activity context is the italic line above the heading.

**Stage 0 — Seed / sprout** (intro state, before any activity completed)

- *Activity context:* "Before you begin."
- **Heading:** Just getting started.
- **Body:** Every tree starts as a seed. Yours starts here.

**Stage 1 — Sapling** (after the first activity)

- *Activity context:* "You finished Self-Reflection."
- **Heading:** Look — roots are forming.
- **Body:** You took the first step. Notice the small roots starting below the surface.

**Stage 2 — Young tree** (after the second activity)

- *Activity context:* "You finished Belonging Skills Sort."
- **Heading:** Your roots are reaching further.
- **Body:** Two activities in. New roots are spreading, and your first branches are starting to grow.

**Stage 3 — Established tree** (after the third activity)

- *Activity context:* "You finished Getting Unstuck."
- **Heading:** Solid roots, steady ground.
- **Body:** Halfway there. Your roots are deep enough to hold you steady — whatever comes next.

**Stage 4 — Flourishing tree** (after the fourth activity)

- *Activity context:* "You finished Allies / Safety Net."
- **Heading:** Wide and rooted.
- **Body:** Almost there. Your roots are wide, your branches are full. You can feel the difference.

**Stage 5 — Blooming** (after the final activities)

- *Activity context:* "You finished the program."
- **Heading:** Look what you grew.
- **Body:** Roots wide. Branches full. Even blossoms now. This is what belonging can look like.

**Notes on the copy:**

- The activity-name pairing in the activity-context line is **illustrative** for the preview — the actual production flow may end up with a different activity order, in which case the activity names get reshuffled. Josh can tune.
- The body copy intentionally *points out what's visibly different* at each stage ("Notice the small roots," "New roots are spreading," "your roots are deep enough," "your roots are wide, your branches are full," "even blossoms now"). The visual progress and the verbal reinforcement reinforce each other.
- Tone is "quietly proud" per Draft 21's mood direction — warm, grounded, second-person. Not bouncy.

**Copy styling:**

- Activity context: italic, `text-sm`, slate-500.
- Heading: `text-xl font-bold`, slate-700, ~8px below the context line.
- Body: `text-base`, slate-700, ~8px below the heading.

---

#### Out of scope for this draft

- **Real flow integration.** This is preview-only on /demo. The component does NOT yet wire into actual activity completion — that's deferred until the activities are stitched into a continuous flow (per the Cleanup queue). When that happens, a follow-up draft routes activity Save → progress-reveal screen → next activity.
- **Per-PID persistence.** No Supabase column for `current_stage` yet. Preview state lives in component-local React state.
- **Backend tracking.** No analytics yet on which stages get viewed.
- **Animation variants.** No alternate animation styles (cross-fade, spring physics, etc.). One animation style, locked.

#### Version bump

No activity-version bump. This is a new component + new /demo section, not a change to any existing activity. Update `INFRASTRUCTURE.md` change log: *"Added 'Growing your roots' preview section to /demo with parametric `<TreeProgress />` component showing six growth stages + per-stage encouragement copy. Visual references from Claude Design at `Activity ideas/tree-stage-*.svg`; component rebuilt parametrically using those as locked targets."*

**Approved by:** Josh, 2026-06-04.

*End of Draft 25.*

-->

---

<!-- Draft 26 shipped 2026-06-08 — archived (commented out). -->

<!--

### Draft 26 — Round 4 feedback bundle (Self-Reflection v1.3 + Letter v2.2 + BSS v3.1 + Allies v5.2 + Getting Unstuck v5.4 + FollowUp scale change + Tree-progress copy)

Bundle of activity refinements driven by the 2026-06-08 review meeting feedback (Round 4 Feedback.csv). Ship as one commit so the team sees one stopping point. **Getting Unstuck + FollowUp Survey share an Appraisals scale change that must be applied to both in the same commit** — they read from the same locked item set and the scale shift is a coupled data-shape change.

---

#### Part A — Self-Reflection v1.2 → v1.3 (MINOR)

Two small changes.

**File:** `src/activities/SelfReflection.jsx`.

1. **Remove the closing "we'll come back to it" message.** Holly flagged this isn't true — there's no later activity that comes back to the kid's reflections. Strip the line; the existing simple Save confirmation stays.

2. **Add example thoughts and feelings to each side of the prompt.** Ginny asked for these because the input fields can read as ambiguous (what kind of thought? what kind of feeling?).

   For the **inclusion** prompt, add italic placeholder/example text alongside the thoughts and feelings fields:
   - Thought example: *"e.g., People like me"*
   - Feeling example: *"e.g., Happy"*

   For the **exclusion** prompt:
   - Thought example: *"e.g., Nobody likes me"*
   - Feeling example: *"e.g., I felt sad"*

   Render as small italic placeholder text inside the textareas, or as small italic helper text directly below each field label — whichever pattern is already in use elsewhere in the activity. Don't pre-fill the inputs.

**Version bump:** v1.2 → v1.3 (MINOR, copy + UX hint). Prepend changelog: *"v1.3 — Removed closing 'we'll come back to it' message; added example thought/feeling text on inclusion and exclusion prompts."*

---

#### Part B — Letter to Another Youth v2.1 → v2.2 (MINOR)

Add two additional scaffolding prompts to the existing instruction line.

**File:** `src/activities/LetterBuilder.jsx`.

The current single instruction above the textarea reads: *"What you would want to say to another teen who feels like they don't belong."* Keep that as the primary prompt, and **append two more smaller prompts below it** as suggestions the kid can use or ignore:

> - What is one skill you would recommend?
> - What is one helpful thought you could share?

Render the two new prompts as a small italic list under the primary instruction, in slate-500. Not bullet-required reading, just two seeds to help kids who freeze on the blank textarea.

**No data-shape change.** Save payload `{ letter, saved_at }` unchanged.

**Version bump:** v2.1 → v2.2 (MINOR, copy addition). Prepend changelog: *"v2.2 — Added two optional scaffolding prompts under the main instruction: 'What is one skill you would recommend?' and 'What is one helpful thought you could share?'"*

---

#### Part C — Belonging Skills Sort v3.0 → v3.1 (MINOR-medium)

Three changes.

**File:** `src/activities/BelongingSkillsSort.jsx`.

1. **Punctuation tweak on encouragement.** Wherever the activity says "Nice work" / "Good job" / similar without final punctuation, add an exclamation mark: "Nice work!" / "Good job!" Matches the energy of the moment.

2. **Saveable snapshot output.** Currently the post-submit screen says something like *"That's a snapshot of where you are."* Render an actual visual snapshot of the kid's three sorted buckets with the skill names inside each bucket, and offer a Save-as-image button (same `downloadSvgElementAsPng` pattern used by Allies / Safety Net and Who I Am Poem per commit `92bfff9`). The snapshot becomes a downloadable PNG keepsake. Unsorted items are excluded from the snapshot.

3. **Reconsider-unsorted prompt.** After the kid clicks the initial Continue/Save, if there are any unsorted items still sitting in the unplaced area, surface a follow-up screen:

   > **You didn't sort these.** Are any of these worth reconsidering?
   >
   > [list of unsorted skill cards]
   >
   > [Yes] [No]

   - **Yes:** the kid returns to the sort interface with only the previously-unsorted items still draggable; sort what they want, leave the rest. On Continue, those newly-sorted items get added to the appropriate buckets and the snapshot regenerates.
   - **No:** proceed straight to the snapshot screen. Unsorted items don't appear in the snapshot.

   This is a one-time prompt — if they reconsider once and still leave items unsorted, don't ask again.

**Data shape:** No change to the existing `{already_doing, willing_to_try, not_interested, unplaced}` arrays. The reconsider step just gives the kid one more chance to move items from `unplaced` into the placement arrays before final save.

**Version bump:** v3.0 → v3.1 (MINOR). Prepend changelog: *"v3.1 — Added '!' to encouragement strings; added saveable snapshot of sorted buckets as a PNG keepsake; added a one-time 'reconsider unsorted items?' prompt after initial Continue, with Yes/No options."*

---

#### Part D — Allies / Safety Net v5.1 → v5.2 (MINOR-medium)

Three changes from Adrienne's Round 4 feedback.

**File:** `src/activities/AlliesSafetyNet.jsx` + `src/components/TrampolineNet.jsx`.

1. **Encouragement punctuation.** Same fix as Part C — add exclamation marks: "Good job!" etc.

2. **Percentage labels on each support type heading.** Throughout the activity, whenever a support type word appears as a heading (Practical / Emotional / Social), append the percentage of the kid's total ally count that falls in that type:

   > Practical Support (22%)
   > Emotional Support (45%)
   > Social Support (33%)

   The percentage is computed against the kid's TOTAL ally count (counting any ally who appears in multiple support types as a single ally for the denominator, but contributing to each support type's numerator they appear in). If total allies is zero, render the label without the percentage (just "Practical Support").

   These labels surface:
   - On the per-support-type selection screen heading (Step 1)
   - On the Inspect step (Step 2) where the net is displayed
   - On the Final Review screen
   - Anywhere else the support type names appear

3. **Visually demote the trampoline net when total support is low.** Adrienne flagged that with 1 ally total, the net visual reads as "full" because the wedges fill the available space. When the kid has **2 or fewer total allies**, the TrampolineNet should render with reduced visual weight:

   - Reduce overall opacity to ~60%.
   - Add a small slate-600 caption above or below the net: *"A small net is a place to start — let's keep building."*

   The visual demotion only applies on screens where the FULL net is displayed (Step 2 Inspect intro, Step 2 X-out screen, Final Review). The Step 1 per-type selection screens are unaffected.

   For 3+ allies total, the net renders at full visual weight as before.

**Data shape:** No change.

**Export pipeline:** No new columns. Percentages are computed at render time from existing data.

**Version bump:** v5.1 → v5.2 (MINOR-medium). Prepend changelog: *"v5.2 — Added '!' to encouragement strings; added percentage labels to each support type heading throughout (computed from current ally counts); added visual demotion of the trampoline net (60% opacity + 'small net is a place to start' caption) when total ally count is 2 or fewer."*

---

#### Part E — Getting Unstuck v5.3 → v5.4 (MAJOR — scale change) + FollowUp Survey Appraisals scale change (coupled)

**Three coupled changes; one bumps Getting Unstuck to MAJOR because the scale shifts and the save payload range changes.**

**Files:**
- `src/activities/GettingUnstuck.jsx`
- `src/lib/appraisals.js` (the shared module from Draft 15 with the 6 items)
- `src/activities/FollowUp.jsx` (the Appraisals scale section)
- `src/lib/exportFlatten.js` (value-range comments / docs)
- `src/lib/demoDataset.js` (synthetic data regenerator)

##### E.1 — Scale shift: 0–5 (6 points) → 0–4 (5 points)

Holly's ask: 5-point scale instead of 6. Cleaner middle anchor and easier mental load for the kid.

**New scale:**

| Value | Anchor |
|---|---|
| 0 | Not At All True |
| 1 | (unlabeled) |
| **2** | **Somewhat True** (middle, exactly) |
| 3 | (unlabeled) |
| 4 | Definitely True |

This applies BOTH in Getting Unstuck (where the kid rates the 6 appraisal items) AND in the FollowUp Survey's Appraisals scale section (which uses the same 6 items from `src/lib/appraisals.js`).

`src/lib/appraisals.js` should export the scale definition alongside the items so both consumers stay in sync.

##### E.2 — Pick threshold stays at ≥2

The threshold logic doesn't change in spirit — items rated "Somewhat True" or above carry forward to the Pick screen. On the new 0–4 scale that's `truth_rating >= 2` (items rated 2, 3, or 4 carry; items rated 0 or 1 don't). Same behavior as v5.3, just translated to the new scale where 2 is exactly the middle anchor.

The affirmation path (no items clear ≥2) stays unchanged.

##### E.3 — "I need help" button per thought

Holly's ask. On each thought-work screen (where the kid is generating a Challenge or Both/And response), add a small *"I need help"* button below the response field.

**Behavior:** Tapping the button opens a small panel showing 3–5 alternative thought suggestions tailored to that specific appraisal item. The kid can read them for inspiration, optionally tap one to pre-fill the response field as a starting point (they can then edit), or close the panel without using any.

**Content:** Stephanie is producing the alternative-thought lists per appraisal item. **For this draft, build the UI with placeholder content** — a small array per item with generic "Sample alternative thought..." text. When Stephanie's content arrives, swap the placeholders for real content in a follow-up commit (no UI change needed).

Suggested placeholder structure in `src/lib/appraisals.js`:

```js
export const APPRAISALS = [
  {
    id: "a1",
    text: "I will never really feel like I belong.",
    dimension: "future",
    help_suggestions: [
      "[Placeholder — Stephanie is producing real content. Example shape: 'There have been moments, even brief ones, when I have felt I belonged.']",
      "[Placeholder — second alternative thought.]",
      "[Placeholder — third alternative thought.]",
    ],
  },
  // ...same for a2–a6
];
```

The kid's free-write response stays primary; help-button content is supportive only.

##### E.4 — Data shape changes

The save payload for Getting Unstuck still has the shape:

```js
appraisals: {
  a1: { truth_rating: 0..4, selected: bool, strategy?: "challenge"|"both_and", response?: "..." },
  // ...a6 [+ a_other]
}
```

`truth_rating` range narrows from `0..5` to `0..4`. The FollowUp Survey's appraisals section uses the same range.

`exportFlatten.js`: update any value-range comments on `unstuck_truth_a*` and `fu_app_*` columns. The columns themselves stay (same names, new max value).

`demoDataset.js`: regenerate synthetic `truth_rating` values to fall in 0..4 instead of 0..5.

##### E.5 — Version bumps

- `getting-unstuck` v5.3 → **v5.4 (MAJOR)** because the scale changes and the saved value range shifts. No real participant data exists yet so no migration concerns. Prepend changelog: *"v5.4 — Truth-rating scale shifted from 0-5 (6 points) to 0-4 (5 points), with anchor labels at 0 Not At All True / 2 Somewhat True / 4 Definitely True; threshold for Pick eligibility stays at ≥2 ('Somewhat True' or above); added 'I need help' button per thought that opens an alternative-thought-suggestions panel (placeholder content; Stephanie producing real content)."*
- `followup` v1.0 → **v1.1 (MINOR-major)** — same scale change applied to the Appraisals section. Item wording and order unchanged. Prepend changelog: *"v1.1 — Appraisals scale shifted from 0-5 to 0-4 to match Getting Unstuck v5.4."*

---

#### Part F — Growing Your Roots: locked preamble + Stage 0 copy + drop in new tree assets

**Files:** `src/components/TreeProgress.jsx` (or wherever the per-stage captions live — likely in the DemoPage data array) + `src/assets/tree/` (drop in the new SVG assets per below).

1. **Add a preamble before Stage 0.** On the screen where the kid first encounters the tree (intro, or before the first activity), show this preamble copy:

   > **Ready for Roots. Yours start here.**
   >
   > This little seed is your tree. As you finish each activity, your roots will reach further and your branches will fill in.
   >
   > Watch what grows.

   Three lines, structured so the first line is the bold framing (program name + ownership), the middle line is the explanation, and the closer is short and invitational. Render the first line as bold-or-larger, the body lines regular. Center the block above the Stage 0 tree visual on the intro/before-first-activity screen.

2. **Replace the Stage 0 caption.** The current Stage 0 caption block ("Just getting started." / "Every tree starts as a seed. Yours starts here.") gets replaced with:

   - **Heading:** Here's your tree.
   - **Body:** Right now it's a seed. As you finish each activity, you'll watch it grow into something bigger.

   Holly flagged that the prior copy felt like it was missing a personal hook — "Yours starts here" without context. The new preamble (item 1) plus this Stage 0 caption together name the kid's relationship to the tree more directly.

3. **Drop in the new tree icon set.** Claude Design has produced the locked six-stage reference SVGs. They live in `SSI Platform A/Safety Net Exercise.zip` → `ready-for-roots-tree/`:

   - `tree-stage-0.svg` through `tree-stage-5.svg`
   - All six share viewBox `0 0 400 600`, ground line at y=420, trunk base at x=200, transparent background
   - Semantic layer groups: `<g id="ground">`, `<g id="roots">`, `<g id="trunk">`, `<g id="branches">`, `<g id="leaves">`, `<g id="blossoms">` (stage 5 only)
   - Per-element ids inside each layer (`root-tap`, `root-lat-N`, `branch-N`, `clump-dN`, `leaf-N`, `bloom-N`) — the dev can target individual paths for the growth animation
   - Full build notes from Claude Design at `Safety Net Exercise.zip` → `ready-for-roots-tree/NOTES.md` (read this — it documents the exact id conventions, the three-tone foliage approach, the sub-root naming pattern, and the locked-trunk-anchor strategy)

   **Action:** Extract the six SVGs into `src/assets/tree/` with the same filenames. Then build the parametric `<TreeProgress />` component per Draft 25's spec, using these six files as the locked visual reference. Match the per-element semantic ids so the animation hooks (stroke-dashoffset for roots/branches, opacity+scale for leaves/blossoms, X-scale transform for trunk thickening) work as intended.

   Trunk is the same continuous path across all six stages — only `height`, `wBase`, and `wTop` change. That's the parametric handle for trunk growth.

**Version bump:** No activity bump; this is a component + asset + copy update on the demo preview surface.

---

**Approved by:** Josh, 2026-06-08, after reviewing Round 4 Feedback.csv and the meeting notes.

**Out of scope for this draft:**

- New tree-progress icons (Josh providing). When delivered, follow-up draft updates the SVG asset / parametric component.
- Stephanie's "I need help" alternative-thought content (Stephanie producing). When delivered, follow-up commit swaps placeholders for real content in `src/lib/appraisals.js`.
- ElevenLabs voice work (Josh).
- Female + Nonbinary Sam character images and voice lines (Josh).
- Video format change to 9:16 vertical (production-direction note for Adrian — no code impact on the demo).

*End of Draft 26.*

-->

---

<!-- Draft 22 shipped 2026-06-03 — archived (commented out). -->

<!--

### Draft 22 — "Meet the cast" section on /demo (replaces the existing Video section)

New section on the /demo page that previews Holly's video script before it's animated. **Five** character cards with images + script lines + ElevenLabs audio playback per line (where lines exist), followed by a closing Family Photo. The team gets to hear how the voices land on each line and react in feedback before production locks.

**This draft replaces the existing Video section** added in commit `d64dbdb` (2026-05-19) — the two-card preview with Sam concept-art images and the embedded YouTube animation sample. See Step 0 below.

**Source materials** (all in `SSI Platform A/Video Content/`, drop into the repo during this build):

- **Images:** `Sam 14.png`, `Sam 16.png`, `Foster Mom 2.png`, `Foster Dad 2.png`, `Mrs Johnson.png`, `Family Photo.png`
- **Audio:** `Sam 14 Line 1.mp3`, `Sam 14 Line 2.mp3`, `Sam Line 1.mp3` through `Sam Line 7.mp3`, `Foster Mom.mp3` — 10 files total

---

#### 0. Remove the existing Video section first

Before adding the new section, tear out the old one. Per commit `d64dbdb`, the current `/demo` Video section (positioned under Data export) has:

- A section heading + container
- Card 1: a 2-column grid of three Sam concept-art images
- Card 2: an embedded YouTube Short (`A8vVBE_2dNI`) in a 9:16 portrait player

**Remove:**

- The Video section JSX from `src/pages/DemoPage.jsx` (heading, container, both cards, intro copy).
- The three Sam concept-art assets from `src/assets/demo/`: `sam-boy-16.png`, `sam-boy-16-2.png`, `sam-boy-16-3.png`. Delete the files and the import statements.
- The YouTube embed reference (`A8vVBE_2dNI`).
- Any helper components that were specific to the Video section.

**Keep:**

- The **"Video / animation" feedback category** added in commit `1edd96f` (DB CHECK constraint, edge function v4 allow-list, FeedbackButton dropdown, AdminFeedbackPage label/filter). It still applies to the new Meet the cast section — reviewers tag feedback about voices, character look, animation direction. No DB migration needed; just keep what's already there.
- The source files in `SSI Platform A/Video Content/` (`backstage.png`, `Sam 2.png`, `Sam 3.png`, etc.). Those are working artifacts in the repo-root content folder, not in `src/`. Leave them alone.

---

#### 1. Asset prep (rename + relocate)

Move the new assets into the repo under `/public/cast/` with web-safe kebab-case names:

**Images → `/public/cast/images/`:**
- `Sam 14.png` → `sam-14.png`
- `Sam 16.png` → `sam-16.png`
- `Foster Mom 2.png` → `foster-mom.png` (this is the v2 image — the canonical version going forward; ignore the older `Foster Mom.png`)
- `Foster Dad 2.png` → `foster-dad.png` (the v2 image; ignore the older `Foster Dad.png`)
- `Mrs Johnson.png` → `mrs-johnson.png`
- `Family Photo.png` → `family-photo.png`

**Audio → `/public/cast/audio/`:**
- `Sam 14 Line 1.mp3` → `sam-14-line-1.mp3`
- `Sam 14 Line 2.mp3` → `sam-14-line-2.mp3`
- `Sam Line 1.mp3` → `sam-16-line-1.mp3`
- `Sam Line 2.mp3` → `sam-16-line-2.mp3`
- `Sam Line 3.mp3` → `sam-16-line-3.mp3`
- `Sam Line 4.mp3` → `sam-16-line-4.mp3`
- `Sam Line 5.mp3` → `sam-16-line-5.mp3`
- `Sam Line 6.mp3` → `sam-16-line-6.mp3`
- `Sam Line 7.mp3` → `sam-16-line-7.mp3`
- `Foster Mom.mp3` → `foster-mom-line-1.mp3`

The 16yo Sam audio files map to the seven voice-over blocks in `Video Content/Character_Profiles.docx` in order (line 1 → opening narration, …, line 7 → closing metaphor). The 14yo Sam files map line 1 → inner monologue, line 2 → angry rejection. Foster Mom has the one dining-table line.

---

#### 2. Page placement + section heading

New section on `src/pages/DemoPage.jsx`. Place it **between the Tests section and the Data export section** — that order takes the reviewer from activity sandbox → survey instruments → cast & voices → export. Tonally it sits well in the middle since it's the most narrative slot.

**Section heading:** **"Meet the cast"**

**Section sub-line** (small, italic, slate):

> Preview of the cast and voice samples for Holly's video script (Script 2.0). Tap any line to hear it read.

---

#### 3. Component spec

Build a new component, suggested name `<CastCard />` (or co-located in `src/pages/DemoPage.jsx` if that's lighter — judgment call).

**Per-card layout (desktop):**

Image column on the left at ~40% of card width, text column on the right at ~60%. Card has a subtle amber-200 border with `rounded-2xl` corners and `bg-amber-50` background — matches the existing demo card pattern. ~24px padding inside.

**Per-card layout (mobile):**

Image stacks on top, full width of the card, capped at ~280px tall with `object-cover` so it doesn't dominate the screen. Text and audio stack below.

**Image:**

- Sam 14 image is landscape (2304×1296). Render at full column width on desktop, `object-cover` to a slight portrait crop (~4:3) so the heads/faces remain centered.
- Sam 16, Foster Mom, Foster Dad, Mrs. Johnson images are portrait (~1122×1402). Render at full column width on desktop, natural aspect.
- All images: `rounded-xl`, subtle drop shadow.

**Cards with audio vs without:**

Three of the five cards have audio lines (Sam 14, Sam 16, Foster Mom). Two cards do not (Foster Dad, Mrs. Johnson) — neither character speaks in Script 2.0 yet. For audio-less cards, the text column has the character name, role line, and a single description paragraph in place of the lines list. No `<audio>` element. Layout otherwise identical so the cards visually balance the page. When their lines get recorded later, drop the mp3s in and the cards extend the same way as the audio-bearing ones.

**Text column:**

1. **Character name** — heading-style, `text-2xl font-bold text-slate-700`.
2. **Role line** (italic, slate-500, `text-sm`):
   - Sam (14): *"The 14-year-old version — at the heart of every flashback."*
   - Sam (16): *"Our narrator — Sam two years later."*
   - Foster Mom: *"The spark in the foster home."*
   - Foster Dad: *"The anchor to Foster Mom's spark."*
   - Mrs. Johnson: *"Sam's teacher and the catalyst for change."*
3. **Lines list** — one block per line:
   - **Scene context** (italic, slate-500, `text-sm`, ~80% leading): the per-line scene cue from `Character_Profiles.docx`.
   - **Quoted line** (regular weight, `text-base`, slate-700, with smart-quote curlies `"…"` wrapping the line text): full line text verbatim from the doc.
   - **Audio control:** native HTML5 `<audio controls src="/cast/audio/{filename}.mp3" preload="metadata" />` — full width of the text column, slight top margin. The native browser controls handle play / pause / scrubbing / volume. Keep it simple — no custom player.
   - Spacing between lines: ~28px so the blocks read as separate beats.

---

#### 4. Card data (paste-and-go content for each card)

##### Card 1 — Sam (14 years old)

**Image:** `/cast/images/sam-14.png`
**Role line:** *The 14-year-old version — at the heart of every flashback.*

**Line 1.1** (`/cast/audio/sam-14-line-1.mp3`)
*Scene:* Inner monologue voice-over (the moment after the adoption question)
*Line:* "How do I feel about that? I have literally no idea."

**Line 1.2** (`/cast/audio/sam-14-line-2.mp3`)
*Scene:* At the dining table (becomes angry, before leaving)
*Line:* "You aren't my parents and you never will be."

##### Card 2 — Sam (16 years old)

**Image:** `/cast/images/sam-16.png`
**Role line:** *Our narrator — Sam two years later.*

**Line 2.1** (`/cast/audio/sam-16-line-1.mp3`)
*Scene:* Voice-over (opening narration)
*Line:* "I remember this moment like it was yesterday. I was removed from my real mom when I was 10 and lived with my foster family after bouncing around placements for a couple of years."

**Line 2.2** (`/cast/audio/sam-16-line-2.mp3`)
*Scene:* Voice-over (reflecting on his thoughts at the adoption-offer moment)
*Line:* "When she asked me this, the first thing I thought was 'they don't love me, they're just offering to do this because they feel bad for me.' I remembered the years where I moved from family to family because no one wanted me and I thought 'this will never work out, I don't even want to get my hopes up.' But at the same time, I was already hopeful, and that made me feel guilty. What was wrong with me that I felt excited about being adopted by this family, when my real mom was still out there? I couldn't give up on her by agreeing to be adopted."

**Line 2.3** (`/cast/audio/sam-16-line-3.mp3`)
*Scene:* Voice-over (after the rejection — grimace)
*Line:* "Yeah, that was a low blow. But at the time I really couldn't picture myself belonging to their family. I had been through a lot. Going from elementary to middle to high school isn't easy for anyone, but it was even harder for me because I was changing schools and houses all the time. Who could keep up with friends or teams during all of that? It was tough but I was used to doing everything by myself my whole life."

**Line 2.4** (`/cast/audio/sam-16-line-4.mp3`)
*Scene:* Voice-over (Mrs. Johnson, backstage crew, opening night)
*Line:* "After I said no, I stayed with my foster parents who said they understood but I could tell it was an issue. Not too long after they and my case worker really encouraged me to participate in something at school. My favorite teacher Mrs. Johnson was directing the school musical, and she suggested that I join the backstage crew. I had never done anything like that but I thought it was lowkey enough to try and I knew that Mrs. Johnson would support me if it was hard. Even though at first I didn't really care, I got really into it when I saw how we were all working on this one massive production and by opening night I wanted the show to run perfectly. After the show when everyone in the cast and crew were cheering and celebrating together, I really felt like a part of something for maybe the first time ever… and then I knew what I had been missing out on by holding back."

**Line 2.5** (`/cast/audio/sam-16-line-5.mp3`)
*Scene:* Voice-over (the metaphor and the resolution — closing narration)
*Line:* "On the final night of our show, I was backstage using the light from the stage manager's lamp to read the directions for the next scene change while looking out at the main character standing on stage in her spotlight. And I realized: this backstage light isn't gone or unimportant just because of the spotlight shining on stage. Actually, the show only works because both lights are there. That's a lot like my mom and my new family. I'm only me because of both of my families. That's when I knew two things can be true at the same time: I can love and miss my mom, and I can belong to my new family too. I don't have to choose between them because they're just different roles in the same production, and they're both part of my story."

**Line 2.6** (`/cast/audio/sam-16-line-6.mp3`)
*Scene:* Voice-over (drive home, recognizing unhelpful thoughts)
*Line:* "On the drive home with my foster family, I thought again about how I had said no to being adopted. I realized a lot of my thoughts weren't necessarily true, like the thought that they only offered to adopt me because they felt bad for me, not because they loved me — I didn't have any evidence for that. Even some thoughts that were true, like that past placements hadn't stuck, weren't helpful for me to think about, because my past placements and my current one weren't the same. Those thoughts weren't helping me, and they were actually getting in the way of me locking in with my current foster family."

**Line 2.7** (`/cast/audio/sam-16-line-7.mp3`)
*Scene:* Voice-over (transitioning toward the realization)
*Line:* "Recognizing that helped me begin to picture myself belonging to their family. But there was still something major that I couldn't figure out: how could I be adopted and belong to a new family when my real mom was still out there?"

**Note on Sam 16 line order in the UI:** display in script-narrative order (1 → 2 → 3 → 4 → 6 → 7 → 5) so the team hears them in story order, not in recording order. Audio file numbers 5 and 6/7 were recorded out of sequence (line 5 is the closing metaphor; lines 6 and 7 are middle-of-arc beats that were recorded after the rest). The line numbering on the audio files stays; only the UI render order shifts.

##### Card 3 — Foster Mom

**Image:** `/cast/images/foster-mom.png`
**Role line:** *The spark in the foster home.*

**Line 3.1** (`/cast/audio/foster-mom-line-1.mp3`)
*Scene:* At the dining table (excited, happy voice — the cold open of the script)
*Line:* "Sam, you've been in our foster home for two years now and we really want you to be an official part of this family. How would you feel about us adopting you?"

##### Card 4 — Foster Dad (no audio yet)

**Image:** `/cast/images/foster-dad.png`
**Role line:** *The anchor to Foster Mom's spark.*

**Description paragraph** (in place of the lines list — no `<audio>` element on this card):

> No spoken lines in Script 2.0. Foster Dad is present at the dining-table scene alongside Foster Mom and 14-year-old Sam; the script describes his body language as solid, steady, and supportive — the still half of the conversation. If a line is added in a later revision (for example, an exchange with Foster Mom after Sam walks away), it would slot into the post-rejection beat.

##### Card 5 — Mrs. Johnson (no audio yet)

**Image:** `/cast/images/mrs-johnson.png`
**Role line:** *Sam's teacher and the catalyst for change.*

**Description paragraph** (in place of the lines list — no `<audio>` element on this card):

> No directly quoted lines in Script 2.0. Mrs. Johnson is referenced in 16-year-old Sam's voice-over as the teacher who suggested he join the backstage crew of the school musical — the invitation that becomes the turning point in the story. If her own dialogue is added in a later revision (for example, the moment where she invites Sam to join the crew), it would slot into the school / hallway scene before Sam's decision to try it.

**Card display order in the section:** Sam 14 → Sam 16 → Foster Mom → Foster Dad → Mrs. Johnson → Family Photo. That order tracks the script narrative: main character (two ages), parents at the opening table, teacher who appears mid-story, closing family image.

---

#### 5. Family Photo — closing image

After the five character cards, render the Family Photo as a wide closing image. **No card border** — let it sit as a hero-style closer, full width of the section (capped at the same max-width as the cards), centered, with `rounded-2xl` and a subtle drop shadow.

**Image:** `/cast/images/family-photo.png` (landscape ~4:3)

**Caption** (below the image, centered, italic, slate-500, `text-sm`):

> Sam and his foster family, after the realization.

---

#### 6. Accessibility + a few small details

- Each `<audio>` element gets an `aria-label` of the form *"Audio: {character} — {scene description}"* so screen readers announce what's about to play.
- Each character image gets a real `alt` attribute matching the role line (e.g., `alt="Sam at 14 — the 14-year-old version of the main character"`).
- The Family Photo's `alt` is `"Sam with his foster family"`.
- Cards have `tabindex="0"` so keyboard users can scroll through them; the audio controls inside are natively focusable.

---

#### 7. Out of scope for this draft

- **Audio for Mrs. Johnson and Foster Dad.** Both cards ship with image + description text only. When their voice recordings exist, adding `<audio>` elements to those cards is a small follow-up — drop the mp3s in `/public/cast/audio/`, extend the card data with a `lines` array, and the card renders the same way as the audio-bearing ones.
- No transcript download, no per-line copy-to-clipboard, no fancy playback ordering controls. Native audio controls only. Keep this lightweight and shippable in one session.
- No analytics on which lines get the most plays. Future-us can add if helpful.

#### 8. Version bump

No activity-version bump. This is a new DemoPage section replacing the existing Video section, not a change to any existing activity. Update `INFRASTRUCTURE.md` change log with a one-line entry: *"Replaced the /demo Video section (commit `d64dbdb`) with a new 'Meet the cast' section — five character cards (Sam 14, Sam 16, Foster Mom, Foster Dad, Mrs. Johnson) + Family Photo closer. Audio playback on the three cards with recorded ElevenLabs lines; image + description only on the two without."*

**Approved by:** Josh, 2026-06-03.

*End of Draft 22.*

-->

---

<!-- Drafts 23 + 24 shipped 2026-06-04 — archived (commented out). -->

<!--

### Draft 23 — Allies / Safety Net v5.1 → v5.2: show previously-selected allies above each Strengthen prompt

Small follow-up surfaced during Josh's verification of Draft 20 (2026-06-04). The Strengthen step now runs for all three support types (v5.1), and Josh wants each Strengthen screen to remind the kid which allies they already selected for that support type before asking *"Is there anyone else…"*. Improves recall — the kid sees their list, then generates an addition instead of vaguely restating someone they already named.

**File:** `src/activities/AlliesSafetyNet.jsx`.

**Change:** On each Strengthen screen, **above the existing "Is there anyone else who could give you {type} support?" question**, add a reminder block listing the allies the kid selected for that support type in Step 1 (post-Inspect, so removed allies don't show).

**Copy format:**

> Here are the people you already selected for **{type}** support: *{list of names}*.

The **{type}** word stays colored + bold per the v5.0 color scheme (amber for practical, rose for emotional, sky for social — same treatment used elsewhere in the activity). Names render as a comma-separated list in a slightly smaller font weight than the main prompt — read-only, no tap-targets, no chips. Just a plain inline list so it reads like a refresher rather than a UI element.

**Names to use:**

- Predefined tile names from `src/lib/allyTiles.js` (e.g., "Foster Mom," "Best Friend," "Coach").
- For the two custom `other1` / `other2` tiles, use the inline-entered name the kid typed.
- Order them in the order the kid selected them (or alphabetically — judgment call; tile-registry order is fine if simpler).
- Comma-separated, with "and" before the last item if there are three or more (standard Oxford-comma style).

**Edge case — kid selected zero allies for that support type:**

If the kid picked "None of these" for the type (or somehow got to Strengthen with zero allies for it after Inspect removal), **skip the reminder line entirely**. The existing "Is there anyone else..." prompt stands on its own — no awkward "Here are the people you already selected: (none)" copy.

**Edge case — exactly one ally:**

Render the line in the singular form: *"Here is the person you already selected for {type} support: {name}."* — small grammatical concession that reads more naturally than the plural form for a list of one.

**Visual placement:**

The reminder block sits between the screen heading ("Let's strengthen your {type} support") and the existing "Is there anyone else..." question. ~16px of vertical spacing between heading and reminder, then ~12px between reminder and question. Slight slate-500 color on the reminder text so it visually demotes vs the question — it's context, not a call to action.

**Data:** no shape change. The reminder reads from the existing `allies` array, filtered by `support_types` containing the current step's type, with any `removed_via_inspect` ids excluded.

**Export pipeline:** no change. This is a display-only addition.

**Version bump:** v5.1 → **v5.2 (MINOR)** — copy/UI addition, no flow or data change. Prepend changelog: *"v5.2 — Each Strengthen screen now shows the kid which allies they already selected for that support type above the 'Is there anyone else...' prompt, so the new-name suggestion is generated against a visible reminder of the existing list."* Update `updated` to today's date.

**Approved by:** Josh, 2026-06-04, after verifying Draft 20 in the demo.

*End of Draft 23.*

---

### Draft 24 — Meet the cast fixes + /demo polish (Sam reorder, audio rename, script download, paragraph removal, title update)

Five small post-ship changes from Josh's 2026-06-04 review of the live demo. Bundle as one commit.

**Files touched:**

- `src/pages/DemoPage.jsx` (Meet the cast card-data list, Activities section, page heading)
- `/public/cast/audio/` (rename two Sam 14 mp3s)
- `/public/cast/script/` (new directory — drop the script .docx in)
- `index.html` or wherever the HTML `<title>` is set for the page (only if it's separate from the visible heading)

#### Change 1 — Card order: Sam 16 leads, then Sam 14

The current order per Draft 22 is Sam 14 → Sam 16 → Foster Mom → Foster Dad → Mrs. Johnson → Family Photo. Swap the first two so the 16-year-old (the narrator) comes before the 14-year-old (the kid he's narrating about).

**New display order:** **Sam 16 → Sam 14** → Foster Mom → Foster Dad → Mrs. Johnson → Family Photo.

Reasoning: 16yo Sam opens Holly's script with his voice-over; leading the cast preview with him matches the actual opening of the video. 14yo Sam then follows as the character the narration centers on.

#### Change 2 — Swap the two Sam 14 audio file names

The two Sam 14 audio files in `/public/cast/audio/` were misnamed during Draft 22's asset prep. Rename them so the file names match the line ordering.

**Current state (after Draft 22 shipped):**

- `sam-14-line-1.mp3` actually contains the *"You aren't my parents and you never will be."* angry line — which is **line 2** per the script.
- `sam-14-line-2.mp3` actually contains the *"How do I feel about that? I have literally no idea."* inner monologue — which is **line 1** per the script.

**Rename atomically** via a temp filename (so we don't lose either file if interrupted):

1. `mv sam-14-line-1.mp3 sam-14-line-tmp.mp3`
2. `mv sam-14-line-2.mp3 sam-14-line-1.mp3`
3. `mv sam-14-line-tmp.mp3 sam-14-line-2.mp3`

**After the swap:**

- `sam-14-line-1.mp3` → *"How do I feel about that? I have literally no idea."* (inner monologue — line 1)
- `sam-14-line-2.mp3` → *"You aren't my parents and you never will be."* (angry — line 2)

**No change to the card-data list itself.** The line text + audio path mapping per Draft 22 was correct in principle; only the underlying file *contents* didn't match the names. After the rename, the existing mapping resolves to the right audio for each line text.

#### Change 3 — Add a Script 2.0 download link under the section heading

Reviewers want to read the full script while listening to the voice samples. Add a download affordance at the top of the Meet the cast section, between the existing sub-line and the first character card.

**Asset to drop in:**

Copy `SSI Platform A/Video Content/Script 2.0.docx` → `/public/cast/script/ready-for-roots-script-v2.docx`.

(The repo-side filename is kebab-case for web safety; the user's downloaded file gets a clean display name via the `download` attribute — see below.)

**Placement:**

Inside the Meet the cast section container, between the existing sub-line (*"Preview of the cast and voice samples for Holly's video script (Script 2.0)…"*) and the first character card. ~24px of vertical spacing above and below so it has breathing room.

**Copy:**

A short prompt above the button (one line, italic, slate-500, `text-sm`):

> Want the full script while you listen? Grab it here.

Button label:

> **Download Script 2.0 (.docx)**

**Markup pattern** (Tailwind, matches existing demo CTAs):

```jsx
<a
  href="/cast/script/ready-for-roots-script-v2.docx"
  download="Ready for Roots — Script 2.0.docx"
  className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 text-sm font-semibold"
>
  <DownloadIcon className="w-4 h-4" />
  Download Script 2.0 (.docx)
</a>
```

`<DownloadIcon />` can be a lucide-react `Download` icon (the project already uses lucide-react elsewhere; if not, an inline SVG download glyph works fine).

The **`download` attribute** is the important part — it sets the saved filename so the user gets a clean `Ready for Roots — Script 2.0.docx` in their Downloads folder rather than the URL-kebab slug.

**Out of scope:** No PDF version, no inline preview, no version history. Just one .docx download. When the script revs (Script 3.0 etc.), swap the file in `/public/cast/script/` and update the button label.

#### Change 4 — Remove the "individual plan" paragraph under the Activities section

There's a paragraph currently sitting somewhere in the Activities section (likely under the section heading or below the activity cards) that previews future work on a per-youth synthesis artifact. Take it out for now — the work it describes isn't on the near-term roadmap and surfacing it on the review demo distracts reviewers from the activities themselves.

**File:** `src/pages/DemoPage.jsx` (Activities section).

**Remove this exact paragraph block** (and its surrounding spacing):

> An individual plan can be generated for each youth based on their responses across these activities — pulling forward their stuck-thought reframes, named allies, identified skills, and poem lines into a single keepsake artifact. Before I design that plan, though, I need to refine the activities above so the inputs I pull from are clinically right. Try them out and tell me what should change.

Don't replace it with anything. The Activities section heading + the activity tiles carry the page on their own.

#### Change 5 — Update the page title

The main `/demo` page title currently reads:

> Ready for Roots — Activities Testing and Data Export Demo

Change to:

> Ready for Roots — Activities Testing, Videos and Data Export Demo

Reflects the new Meet the cast / Videos section that Draft 22 added between Tests and Data export. The Oxford-comma question is intentionally skipped — leave the title with the comma after "Testing" and no comma before "and" to match Josh's exact phrasing.

**Files to update:**

- The visible page heading in `src/pages/DemoPage.jsx` (likely an `<h1>` near the top).
- The HTML document `<title>` tag — check `index.html` or wherever the document title is set for `/demo`. If it's dynamic via something like react-helmet, update there. If the title is set in a single static spot, that's the only place to change.

If both are present, make sure both match.

#### Version bump

No activity version bump (no activity changed). No `INFRASTRUCTURE.md` change-log entry — these are fixes to the just-shipped Draft 22 / `Meet the cast` section, not a new feature.

**Approved by:** Josh, 2026-06-04, after reviewing the live `/demo` Meet the cast section.

*End of Draft 24.*

-->

<!-- Drafts 18 + 19 archived below. -->

<!--

### Draft 18 — Demo polish: drop the "Three things you can do here" intro + hide the saved-output panel on Tests

Two small UI removals surfaced during Josh's 2026-05-19 demo walkthrough. Both are content/visibility removals — no logic changes, no version bumps on any activity.

#### Change 1 — Remove the "Three things you can do here" intro paragraph from /demo

**File:** `src/pages/DemoPage.jsx` (or wherever the /demo landing hero / intro block lives).

**Remove this block entirely** (the three "Test the activities / Try the pretest / Try the data export" callouts under it):

> Three things you can do here.
>
> Test the activities — launch any of the six Ready for Roots activities in isolation; nothing you enter is saved.
>
> Try the pretest — walk through the live participant-facing pretest as it'll paginate in a real session.
>
> Try the data export — download CSVs for SPSS / Excel built from a synthetic 52-participant dataset. The same export pipeline that ships your real research data produces these files.

Just delete it. Don't replace it with anything — the section headers ("Ready for Roots activities", "Ready for Roots tests", "Data export") are self-explanatory. If a one-line page subtitle is desired, leave the existing hero line as-is and let the section labels carry the structure.

#### Change 2 — Hide the saved-output JSON panel on the three Test surveys

After submitting Pretest, Posttest, or FollowUp on /demo, the confirmation currently reads:

> Thanks — your responses are saved.
> The whole payload is visible in the saved-output panel below.

…followed by a panel showing the full save payload as formatted JSON. Reviewers don't need to see this — same call as commit `583d34c` made for the `/demo/sandbox/*` activities ("hid the 'Saved Output' JSON panel from `/demo/sandbox/*`"). Apply the same pattern to the Test surveys.

**Files:** `src/activities/Pretest.jsx`, `src/activities/Posttest.jsx`, `src/activities/FollowUp.jsx` — or the shared confirmation/save component if these surveys share one. (`SurveyItems.jsx` is plausible — check there first.)

**Change:** On the post-submit confirmation screen for the three timepoint tests:

- Drop the line *"The whole payload is visible in the saved-output panel below."*
- Drop the JSON saved-output panel itself.
- Keep the simple acknowledgment line — *"Thanks — your responses are saved."* — that's enough.

The admin-side data inspection surfaces (`/admin/testing/*`, the data export demo) stay untouched. This change only affects the participant-facing confirmation screens on /demo.

#### Change 3 — Default the feedback-form submitter to "Ginny Sprang"

The persistent **Give feedback** button on /demo opens a form with a submitter dropdown (per commits `0287706` + `cdbd78c`). The current default is **Anonymous**. Josh wants the default to be **Ginny Sprang** while keeping the rest of the roster unchanged — Stephanie, Holly, Ginny, Josh, Jessica, and Anonymous all remain selectable, just the initial selection flips.

**File:** the FeedbackButton component (probably `src/components/FeedbackButton.jsx` or wherever the persistent feedback form lives — same component touched in commits `0287706` and `cdbd78c`).

**Change:** Change the initial value of the submitter selector from `"anonymous"` to `"ginny"`. No other change to the form, the roster, the edge function allow-list, the `public.feedback.submitter` CHECK constraint, or the admin labels — Anonymous stays as a valid selectable option for testers who want to submit without attribution.

**Version bump:** No activity version bumps. All three changes in Draft 18 are demo-page polish, not changes to any activity's data shape, flow, or content.

**Approved by:** Josh, 2026-05-19, after walking through the demo punch list.

*End of Draft 18.*

---

### Draft 19 — Allies / Safety Net v5.0 (major rework) + Getting Unstuck v5.2 (Pick copy edit)

Bundled because both came out of the 2026-05-18 review meeting; Allies is the big change, the Getting Unstuck Pick copy edit is one line. Ship as one commit so the team gets one stopping point.

---

#### Part A — Allies / Safety Net v4.1 → v5.0 (MAJOR)

Substantial restructure driven by Stephanie's vision for the Inspect step (transcript 2026-05-18), Holly's color-coding idea for the three support types, the new 22-tile icon set Josh delivered 2026-05-19, and the return of a Strengthen step (Part 3) that was torn down in commit `d515d0e` and is now being rebuilt from Stephanie's transcript spec.

**Files:**

- `src/activities/AlliesSafetyNet.jsx` — the activity component.
- `src/lib/allyTiles.js` — tile registry (single source of truth per commit `d515d0e`).
- `src/assets/allies/` — drop the existing 15 SVGs, replace with the 22 SVGs from `Activity ideas/safety-net-icons.zip` (2026-05-19). **Pull `sneaky-link.svg` and do not register it** — Josh's 2026-05-19 call after the meeting consensus leaned toward boyfriend/girlfriend only. Leave the file unimported.
- `src/components/TrampolineNet.jsx` — gets a small new prop for the Inspect X-out interaction.
- `src/lib/exportFlatten.js` — data shape changes ripple through here.
- `src/lib/demoDataset.js` — synthetic data regenerator.

##### A.1 — New tile registry (22 tiles)

Drop the existing 15-tile set; replace with the 22-tile set from the zip. Strip the cream background `<rect>` from each SVG before importing — same pattern as commit `70d117b` (the README in the zip even calls out *"delete the first <rect> element for a fully transparent background"*).

**Tiles** (id → display name):

| id | name |
|---|---|
| `foster-mom` | Foster Mom |
| `foster-dad` | Foster Dad |
| `bio-mom` | Biological Mom |
| `bio-dad` | Biological Dad |
| `sibling` | Sibling |
| `grandmother` | Grandmother |
| `grandfather` | Grandfather |
| `otherfam` | Other Family |
| `counselor` | School Counselor |
| `teacher` | Teacher |
| `coach` | Coach |
| `babysitter` | Babysitter |
| `neighbor` | Neighbor |
| `friend` | Friend |
| `best-friend` | Best Friend |
| `friends` | Friends (group) |
| `boyfriend` | Boyfriend |
| `girlfriend` | Girlfriend |
| `therapist` | Therapist |
| `caseworker` | Caseworker |
| `other1` | Other (custom name) |
| `other2` | Other (custom name) |

Total: 22. **Do not include `sneaky-link`.**

`other1` / `other2` retain the existing inline-text-input + cross-screen persistence behavior from commit `d515d0e`.

Grid layout stays the same pattern: 2 columns on mobile, 3 on tablet/desktop. With 22 tiles instead of 15 the kid will scroll a bit on mobile (~11 rows) — acceptable, no pagination needed.

##### A.2 — Color-coded support types

Per Holly's transcript suggestion (2026-05-18): each of the three support types gets its own color identity that persists across screens.

**Proposed colors** (Tailwind v3 native classes — Josh, push back if you want a different palette):

| Type | Heading color | Tile background tint | Transition-screen background |
|---|---|---|---|
| **Practical** | `text-amber-700` | `bg-amber-50` | `bg-amber-100` |
| **Emotional** | `text-rose-700` | `bg-rose-50` | `bg-rose-100` |
| **Social** | `text-sky-700` | `bg-sky-50` | `bg-sky-100` |

Practical stays in the platform's existing amber family (anchors the kid's familiarity with the rest of the activities). Emotional gets a soft warm rose. Social gets a cool sky-blue. All three are pale enough that the SVG tiles read cleanly on top.

Where the colors apply:

- **The word "practical" / "emotional" / "social" in screen headings** — colored + bold + larger than surrounding copy. Holly's specific ask: *"capitalized and bolded or something… maybe like each of the three different supports has a different color."*
- **The tile background tint** on the per-type selection grid — subtle, so the kid sees they're on a different screen even if they're looking at the same grid of icons.
- **The transition-screen background** (see A.3) — full color, brief moment.

##### A.3 — Transition screens between Practical → Emotional → Social

Before each of the three support-type selection screens, show a brief transition screen with the type name, a one-line definition, and a Continue button. Resolves Ginny's *"it kept having to look back and say no what why is this different than what I just did before looked kind of similar"* feedback.

**Transition copy** (matches the existing per-type definition copy, just promoted to a full screen):

- *Practical.* The people who help you with things — rides, food, getting your homework done.
- *Emotional.* The people you go to when you're upset or just need to talk.
- *Social.* The people you have fun with — hanging out, playing games, going places.

Each transition screen uses the matching color background (A.2 table). One screen, one heading, one definition, one Continue button. ~3 seconds of read time.

The intro screen for the whole activity (before Practical) explains what a safety net is and previews that they'll go through three types of support.

##### A.4 — Inspect (Part 2) — restructure per Stephanie

**Out:** the current per-ally walkthrough where each ally surfaces in a modal with the four PPT red-flag questions and Keep/Remove buttons (commit `583d34c` / `71a37e9`).

**In:** Stephanie's two-screen pattern from the transcript.

- **Screen 1 — Education.** A placeholder video block at top of the screen (Adrian to record actual content). Below it: a short summary of the four red flags as bullet copy — *"Watch out for relationships where the person usually gets you into trouble, tries to keep you from talking to or getting close to other people, frequently lies to you, or makes you feel afraid."* (Stephanie's PPT phrasing, verbatim from commit `71a37e9`.) Continue button.

  The video placeholder is a styled `<div>` with a caption like *"Video coming soon"* — Claude Code: do NOT build a player UI; just leave a structurally-positioned container with a fixed aspect ratio so Adrian's eventual video drops in cleanly.

- **Screen 2 — X-out screen.** The kid's full TrampolineNet renders as the centerpiece, same visual as v4.0. **Each ally icon gets a small × affordance overlaid in the top-right corner of its halo.** Tapping × removes that ally from the net (visual: ally fades to ~30% opacity, an X mark overlays). Tapping again restores. Below the net: a short instruction *"Tap the × on anyone you want to take out of your safety net."* and a Continue button.

  No modal, no per-ally questions, no keep/remove advisory. The kid removes whoever they decide to remove based on the educational content, full stop.

- **TrampolineNet component:** add a new `inspectMode` prop. When true, render each ally with the × overlay and handle the tap-to-toggle-remove interaction. When false, the existing v4.x behavior (just display, optional `interactive` mode for the older walkthrough) is preserved — don't delete it yet, just add the new mode alongside.

**Data shape change for Inspect:** drop per-ally `inspected` and `flags` objects. Replace with one array `removed_via_inspect: ["ally_id_1", ...]`. Keep `inspection_completed: bool` (true once the kid taps Continue on Screen 2).

##### A.5 — Strengthen (Part 3, NEW)

Rebuilt from Stephanie's transcript spec — the v1 implementation is gone (torn down in commit `d515d0e`) so this is a fresh build.

After Inspect, before Save, run the Strengthen step.

**Gap detection logic:**

After Inspect (so post-removal counts), for each support type compute the number of allies. A gap is:

- **0 allies** in a support type → complete gap
- **1 ally** in a support type → thin gap (Stephanie's *"only one person in an area"*)

(The imbalance case Stephanie raised — *"a thousand people in practical and nobody in emotional"* — is rare in practice and is covered by the 0-allies gap on the other side. Leave it for a future polish round.)

**For each gap (loop through the gap list in order Practical → Emotional → Social):**

Show one screen per gap with:

- **Header:** *"Let's strengthen your {type} support."* Colored per A.2.
- **Sub-line for 0-ally case:** *"Right now nobody is in your {type} support. Is there someone in your life who could be?"*
- **Sub-line for 1-ally case:** *"Right now you have one person in your {type} support. Is there someone else who could help out?"*
- **Suggestion chips (per Holly's transcript point):** if the kid has ≥1 ally in any OTHER support type, surface those names as quick-add chips with the prompt *"Anyone here also fit?"* — tapping a chip pre-fills the gap_filler input. Holly: *"if it was a rebalance issue, you have a lot of people in practical support. Can any of them also be play the role of emotional support?"*
- **Two text inputs:**
  - `gap_filler` — *"Who could that be?"* (max ~50 chars)
  - `action` — *"What's one thing you could do to make that happen?"* (max ~200 chars, textarea)
- **Skip button** — kid can skip a gap (we don't force engagement; respect kid agency). If skipped, both inputs save as empty strings.
- Continue button.

Action-input suggestion examples for the placeholder text: *"e.g., text them and ask if we can hang out this weekend"* or *"ask my school counselor for a recommendation."* Per Stephanie's transcript: *"reach out to them. ask one of your ask another supportive person for a recommendation."*

##### A.6 — Final Review + Save

Screen 4 — Review/Save. Single screen showing:

- Final TrampolineNet (post-removal — the version after Inspect Screen 2).
- A small list below the net summarizing kept allies grouped by support type.
- Any strengthening commitments from Part 3, rendered as "Your plan to strengthen {type} support: {action}" callouts.
- "Save as image" button (existing per commit `92bfff9`) — keep working.
- Continue/Save button.

##### A.7 — Save payload (new shape)

```js
{
  activity: "allies_safety_net",
  allies: [
    {id, name, custom, support_types: ["practical", "emotional", "social"]}, ...
  ],
  none_for: { practical: bool, emotional: bool, social: bool },
  removed_via_inspect: ["ally_id_1", ...],
  inspection_completed: bool,
  strengthened: {
    practical: { gap_filler: "...", action: "...", skipped: bool } | null,
    emotional: { gap_filler: "...", action: "...", skipped: bool } | null,
    social:    { gap_filler: "...", action: "...", skipped: bool } | null,
  },
  saved_at: "..."
}
```

`strengthened.{type}` is `null` if no gap existed for that type. If a gap existed and the kid filled it in, the inputs save. If they skipped, `skipped: true` and the inputs are empty strings.

##### A.8 — Export pipeline updates

`src/lib/exportFlatten.js` `safety_net_*` column changes:

**Drop** (no per-ally flag questions anymore):

- `safety_net_total_flags`
- `safety_net_n_trouble`
- `safety_net_n_isolate`
- `safety_net_n_lies`
- `safety_net_n_afraid`

**Keep / repurpose**:

- `safety_net_inspected_count` — total ally count BEFORE removal (just the allies-grid count)
- `safety_net_kept_count` — ally count AFTER removal
- `safety_net_removed_count` — count of `removed_via_inspect`
- `safety_net_inspection_completed` — bool

**Add for Strengthen:**

- `safety_net_strengthen_practical_filler` — text or null
- `safety_net_strengthen_practical_action` — text or null
- `safety_net_strengthen_practical_skipped` — bool or null
- ...same triple for `emotional` and `social`
- `safety_net_strengthen_gaps_count` — 0, 1, 2, or 3

##### A.9 — Demo dataset

`src/lib/demoDataset.js` regenerate `safety_net_*` synthetic data:

- ~30% of synthetic participants have at least one inspect-removal.
- ~50% have at least one Strengthen gap (1-ally case is the most common).
- Of those with a gap, ~70% fill it in, ~30% skip.
- Sample gap-filler names from a small string pool ("Aunt Tasha", "Coach Davis", "my friend Maya", etc.).

##### A.10 — Version bump

`activityVersions.js`: `allies-safety-net` v4.1 → **v5.0** (MAJOR — tile set changes, data shape changes, interaction model changes for Inspect, new Part 3). Update `updated` to today's date. Prepend changelog entry:

> v5.0 — 22-tile icon set replaces v4.x's 15-tile set (no sneaky-link). Color-coded support types (amber / rose / sky) with transition screens between Practical → Emotional → Social. Inspect (Part 2) restructured per Stephanie: educational screen with video placeholder + single X-out-on-net screen, replacing the per-ally modal walkthrough. Strengthen (Part 3) rebuilt from scratch: gap detection (0 or 1 ally in a support type), per-gap "who could that be / what could you do" prompts with same-kid ally chips as suggestions, skippable. Save payload reshaped accordingly; per-flag export columns dropped, Strengthen columns added.

---

#### Part B — Getting Unstuck v5.1 → v5.2 (MINOR copy edit)

Holly's 2026-05-18 transcript suggestion: on the Pick screen, change the framing so the "max 2" guidance is in the prompt itself rather than as a footnote.

**File:** `src/activities/GettingUnstuck.jsx`.

**Change:** On the Pick screen, the prompt above the eligible-thoughts list (currently roughly *"Pick the thoughts you'd like to work on. (You can pick up to 2.)"*) becomes:

> Pick the top two thoughts you would like to work on.

That's the only change to the screen — the max-2 cap behavior, the eligible-thoughts filter, and the non-blocking nudge on a third tap all stay as v5.0 implemented them. Just the prompt text shifts.

**Version bump:** v5.1 → v5.2 (MINOR, copy edit). Prepend changelog: *"v5.2 — Pick-screen prompt reworded to 'Pick the top two thoughts you would like to work on' (Holly's 2026-05-18 transcript suggestion)."*

---

**Approved by:** Josh, 2026-05-19, after Cowork review of the meeting transcript + new icon set.

**Out of scope for this draft:**

- Adrian's actual video content for the Inspect Part 2 educational screen — placeholder only, video drops in later.
- Adrian's video content for the Both-and strategy on Getting Unstuck (Holly raised this in the transcript; Stephanie offered to script a 1-minute version). Separate work, not blocking this draft.
- The Pretest refactor to use `SurveyItems.jsx` (still pending from Draft 16 — separate).
- The four `RSD_Flow_*.docx` files are still in the Cleanup queue, deferred until build is near-done.

*End of Draft 19.*

-->

<!--

### Draft 17 — Getting Unstuck v5.1: revert Pick threshold to ≥3

Small revert. In Draft 15 / commit `27e4d52` the Pick-screen eligibility threshold was lowered from `truth_rating ≥ 3` to `truth_rating ≥ 2` based on Stephanie's 2026-05-15 feedback that thoughts she rated "higher than a 1" weren't being pulled forward. Josh has now decided (2026-05-18) that the clinical threshold should stay at **≥ 3** — items rated below "Somewhat True" on the 0-5 anchor scale aren't endorsed strongly enough to be worth the kid's time on the Pick / Challenge / Both-and flow.

This restores the original v4.0 / v3.0 threshold. Same pattern as the Fight → Challenge boomerang in Draft 15 — Stephanie's reported expectation is being overridden by Josh's clinical-content call. The doc file `Final Measures/FollowUp Survey Draft Belongingness_5.2.26.docx` doesn't specify a Pick threshold (the FollowUp Survey just measures, doesn't pick), so this is purely an intervention-side decision.

**File:** `src/activities/GettingUnstuck.jsx`.

**Change:** In the eligibility filter that determines which appraisal items appear on the Pick screen, restore the comparison to `>= 3`. This applies identically to `a1`–`a6` and to `a_other` when present.

Affirmation-path behavior stays unchanged in spec — if no items clear the ≥ 3 threshold, the activity skips Pick and goes to the brief positive-message Save path. With ≥ 3 instead of ≥ 2, the affirmation path will be hit more often than under v5.0; that's the intended behavior, not a regression.

**Data shape:** No change. The `truth_rating` integers (0-5) saved per item are unchanged; only the eligibility comparison shifts.

**Export pipeline:** No change. `unstuck_truth_a*`, `unstuck_selected_a*`, etc. all keep their columns and value sets.

**Version bump:** v5.0 → **v5.1 (MINOR)** — single-line threshold revert, no data-shape change, no flow change. Prepend changelog entry: *"v5.1 — Reverted Pick-screen eligibility threshold from ≥2 back to ≥3 (Josh, 2026-05-18 — clinical-content call overriding the v5.0 lowering)."* Update `updated` to today's date.

**Approved by:** Josh, 2026-05-18.

*End of Draft 17.*

-->

---

### Cleanup queue — manual housekeeping (not build work)

> Lightweight to-do list for non-code cleanup that should happen before the project is considered "done." Not Claude Code drafts — these are doc-rewrites, file moves, or polish passes Josh wants to remember without making them blocking.

**Replace the four `RSD_Flow_*.docx` files with a single up-to-date flow doc.**

Status: deferred until the build is closer to done — Josh's 2026-05-18 call. Once the architecture, link-generation approach, and final activity flow are stable, write one clean flow doc (working name TBD — likely `ReadyForRoots_Participant_Flow.docx` or `Participant_Flow.docx`) that supersedes:

- `RSD_Flow_Option_A.docx` — pre-decision option (2026-05-07, superseded by Option B pick on 2026-05-08).
- `RSD_Flow_Option_B.docx` — the chosen option, but pre-rename and pre-Qualtrics-link-handoff change.
- `RSD_Participant_Flow.docx` — consolidated post-decision flow, pre-rename, pre-glossary (2026-05-08 16:06).
- `RSD_Participant_Flow_updated.docx` — same body as Participant_Flow.docx plus a 5-paragraph glossary (2026-05-08 16:15). **This is the current source of truth** until the new doc is written.

The new doc should reflect: (a) the Ready for Roots name; (b) Qualtrics-generated participant links replacing the access-code minting pattern (Josh's 2026-05-18 call — no more `RSD-XXXX-XXXX` codes); (c) the locked Final Measures (Pretest 29 / Posttest 18 / FollowUp 30 items); (d) the Questions for Guardian items in the Qualtrics consent. The PID-linking requirement (the standalone section below) is the technical companion to this flow doc.

After the new doc lands, leave the four old `RSD_Flow_*.docx` files in place as historical snapshots — they document the decision path and shouldn't be deleted, just superseded.

---

**Round 4 non-code todos (2026-06-08).** Items from the 2026-06-08 review meeting that are non-code, asset-production, or content-creation work — captured here so they don't fall off the radar while Draft 26 ships.

- **ElevenLabs voice re-passes (Josh).** Specific notes from the team:
  - 14yo Sam — try higher pitch / mumbly / angrier as workarounds for the platform's child-voice restriction (Ginny's suggestion). Replace clips in the demo as new versions land.
  - Foster Mom — slightly speed up delivery, but the voice itself is approved (Ginny).
  - 16yo Sam — fix pacing on two specific lines: *"I remember this moment, like, it was, yesterday"* (pauses too long) and the 14yo question *"how do I feel about that?"* (not question-y enough) (Holly).
  - Goal: take several more passes and replace the demo clips with new versions for team approval.

- ~~**New tree-progress icons (Josh providing).** The current tree gets longer at each stage but doesn't get fuller. Josh is producing a revised icon set that adds more canopy and more root variety per stage, not just length. When delivered, follow-up draft swaps the SVG assets and may tune the parametric `<TreeProgress />` component to match.~~ **DELIVERED 2026-06-08** — Claude Design produced six locked SVGs (`tree-stage-0.svg` through `tree-stage-5.svg`) at `SSI Platform A/Safety Net Exercise.zip` → `ready-for-roots-tree/`. Three-tone canopy clumps, root system densifies per stage (more laterals + sub-roots, not just longer), stage 5 adds amber + rose blossoms. Full build notes at `ready-for-roots-tree/NOTES.md`. Folded into Draft 26 Part F — Claude Code drops these into `src/assets/tree/` when Draft 26 ships.

- **Female Sam character images + voice lines.** Per the Round 4 meeting decision, the video will eventually ship in three variants — male, female, and nonbinary Sam. Female variant images (use the Character Builder prompts from `Activity ideas/Tree_Progress_Design_Prompt.md`'s sibling doc `Character_Builder_Prompts.md`) and voice lines (ElevenLabs, same script). Generate when there's time.

- **Nonbinary Sam character images + voice lines.** Same as above for the nonbinary variant.

- **Video format = 9:16 vertical.** Confirmed at the 2026-06-08 meeting. Production direction for Adrian's eventual video work — vertical mobile-first format (1080×1920 target resolution). Not a current code change; informs the eventual video container styling when real video drops in.

- **Stephanie's "I need help" alternative-thought content for Getting Unstuck.** Stephanie is producing the per-appraisal-item alternative thought suggestions that the new "I need help" button will surface (per Draft 26 Part E.3). Expected end of week (2026-06-08 → ~2026-06-13). When delivered, follow-up commit swaps the placeholder strings in `src/lib/appraisals.js` for real content. No UI change needed.

*End of cleanup queue.*

<!--

### Draft 14 — Intervention rename: Ready! Set! Dedicate! → Ready for Roots

**Status as of 2026-05-18: Josh announced the rename.** All user-facing text on ctac.app, in documentation, and in outbound email templates needs to change. Internal code slugs, activity IDs, file names, and the repo folder name **stay as-is** to avoid massive churn. We can do an optional internal-rename pass later if Josh wants.

**Scope of this draft:** User-facing text only. Ship as one commit so the demo + admin both flip in lockstep — reviewers shouldn't see "RSD" on one screen and "Ready for Roots" on the next.

**Find-and-replace mapping (user-facing surfaces only):**

| Old | New |
|---|---|
| `Ready! Set! Dedicate!` | `Ready for Roots` |
| `Ready Set Dedicate` | `Ready for Roots` |
| `RSD` (when used as the program name, not as a code identifier) | `Ready for Roots` |

**Files to update — confirm during build by grepping the repo for the strings above:**

1. **Page titles + headers in `src/`** — Demo landing page header, admin landing page header, any `<title>` tags, hero copy on `/demo`, and any activity intro screens that mention the program by name.
2. **Activity intro copy** — Pretest intro paragraph, posttest intro, follow-up intro (the survey doc preambles all reference "this program" or "our project" rather than naming it directly, but check `src/activities/*.jsx` for any hardcoded program-name references).
3. **`README.md`** — repo readme.
4. **`CLAUDE.md`** — project memory file; update the "Project memory — SSI Platform" framing if it references the intervention by name.
5. **`INFRASTRUCTURE.md`** — change-log doc; add a new change-log entry for the rename, but also update header/intro text if it names the intervention.
6. **`STATE_OF_THE_PLATFORM.md`** — accurate-snapshot doc; update any references.
7. **`SSI_Platform_Overview.md` and `.docx`** — update both.
8. **Resend / email templates** — if any outbound emails (program invite, gift-card delivery, 90-day follow-up reminder) include the program name in subject or body, update.
9. **Gift-card flow copy** in `RSD_Completion_GiftCard_Flow.md` — update the user-facing strings inside the doc; the file name itself stays.
10. **Any other repo-root `.md` files** that mention the program by name (do a `grep -rn "Ready! Set! Dedicate"` + `grep -rn "RSD"` and audit by hand — RSD appears in code slugs and file names that should NOT change).

**What does NOT change:**

- Internal code slugs and identifiers — activity IDs (`getting-unstuck`, `allies-safety-net`, etc.) stay; any internal constant like `RSD_VERSION` (if it exists) stays.
- Repo folder name `SSI Platform A`.
- File names like `RSD_Feedback_Review_v2.xlsx`, `RSD_Flow_Option_B.md` — these are internal artifacts, not user-facing.
- Memory file names in the Cowork side (e.g., `project_rsd_*`).
- The IRB label "Belongingness SSGMI" — that's a separate study-protocol label, not the user-facing name.
- The Vercel deployment URL `ctac.app/demo` — unless Josh asks, we keep the route as-is.

**Version bump:** No activity-version bumps; this is documentation + copy only. **Do** add an entry to `INFRASTRUCTURE.md`'s change log dated today: *"Renamed intervention from Ready! Set! Dedicate! / RSD to Ready for Roots in all user-facing text. Internal code slugs and file names unchanged."*

**Open questions (build text for now, flag at the bottom of the commit message):**

- Should the demo route stay at `/demo` or change to something like `/ready-for-roots/demo`? Default: keep `/demo` until Josh says otherwise.
- Should an abbreviation be introduced (e.g., RFR)? Default: no; use the full name everywhere user-facing. Easy to add later if a need surfaces.

**Approved by:** Josh, 2026-05-18.

*End of Draft 14.*

---

### Draft 15 — Getting Unstuck v4.2: appraisal-items rebuild + final Challenge rename + threshold fix

**Status as of 2026-05-18:** The Getting Unstuck activity needs to use the **same 6 Appraisal items as the FollowUp Survey** (locked in `Final Measures/FollowUp Survey Draft Belongingness_5.2.26.docx`), drop the "how often" rating dimension, swap to a 0-5 scale with the survey's anchors, add an Other-thought addendum, fix a pull-forward threshold bug Stephanie reported, and finalize the Fight → Challenge rename (which has now boomeranged twice — Josh is committing to Challenge going forward).

**Driving feedback (oldest → newest):**

- Stephanie (2026-05-15): *"Need to discuss if we want to include 'how often do you have this thought.' I think we just ask how strongly do you believe this thought to be true for you. This also needs a middle anchor for 3 'Somewhat.'"*
- Stephanie (2026-05-15): *"There should be 6 appraisal questions."*
- Stephanie (2026-05-15): *"It did not pull forward thoughts I selected that I believed to be true — higher than a 1."*
- Ginny (in meeting, 2026-05-18): *"Is there another thought you've had that we didn't list here? If yes then question."*
- Jessica (2026-05-18, 14:45): *"What comes up for you when you ask yourself those questions? (add the word question[s])"* — small copy edit on the challenge-prompts response screen.

**File:** `src/activities/GettingUnstuck.jsx` (plus the data registry in `src/lib/`, `exportFlatten.js`, and `demoDataset.js`).

#### Change 1 — Replace the 8 stuck thoughts with the 6 locked appraisal items

The 8 thoughts (`st1`–`st8`) are out. Use these 6 items, in this order. Source: `Final Measures/FollowUp Survey Draft Belongingness_5.2.26.docx`, "Appraisals about self, others and future" section. Same wording, same scale, same anchors — this matters because we want the FollowUp Survey to read the same items at follow-up that the kid worked with during the intervention.

1. **`a1`** — I will never really feel like I belong. *(future)*
2. **`a2`** — Everyone will eventually leave me or give up on me. *(future)*
3. **`a3`** — I am not lovable. *(self)*
4. **`a4`** — No one would want me to be a part of their family. *(self)*
5. **`a5`** — I can't trust anyone. *(others)*
6. **`a6`** — My real family will be mad if I like my foster or adoptive family. *(others)*

Item IDs `a1`–`a6` (for "appraisals"). The `(future / self / others)` qualifier is for analyst context; not shown in the kid's UI.

**Implementation note:** Build the 6 items as a constant near the top of the activity component. Same data also lives in the FollowUp Survey component (Draft 16) — extract to `src/lib/appraisals.js` so it's a single source of truth and any future wording revisions only happen in one place.

#### Change 2 — Drop the "how often" scale; keep only "how strongly"

Only one rating per appraisal item. The scale is **0–5** with these anchors (the same as the FollowUp Survey):

> 0 = Not At All True · 3 = Somewhat True · 5 = Definitely True

(intermediate values 1, 2, 4 are unlabeled — pick the slider style or radio style that matches the existing pretest BHS UI for consistency).

The current activity stores frequency + believability per thought. Drop frequency entirely. Save payload keeps only the believability rating (renamed to `truth_rating` to match the new "how true" framing — or keep `belief` if that's less churn).

#### Change 3 — Lower the pull-forward threshold

Stephanie said items she rated **above 1** should carry forward to the Pick screen. The current threshold (per commit `9b841da`) is ≥3 on either scale. New rule: any item where `truth_rating ≥ 2` is eligible for the Pick screen. (On the 0-5 scale, `2` is the first rating that signals at least minimal endorsement.)

If no items clear the ≥2 threshold, the existing **affirmation path** (skip Pick, go to Save with a brief positive message) still applies — that path stays as-is.

#### Change 4 — Add the "Other thought" addendum

After the rate screen, before the pick screen, show one more rate-style screen for an optional Other thought.

**Screen copy:**

> Is there another thought you've had that we didn't list here?

Yes / No buttons. If **No**: continue to Pick.

If **Yes**: show a free-text input ("Type the thought in your own words") plus the same 0-5 scale with the same anchors. The kid rates their own thought the same way they rated the 6 listed items. After they continue, go to Pick.

The Other item gets ID `a_other` and is included in the eligibility filter using the same `truth_rating ≥ 2` rule. If the kid says No, `a_other` is absent from the save payload entirely.

#### Change 5 — Rename "Fight" → "Challenge" everywhere (final, no more reverts)

This is the third commit on this rename. Josh's 2026-05-18 decision: **Challenge stays.** Apply to:

- Strategy button label: "Fight it" → **"Challenge it"**
- Data keys: `strategy: "fight"` → `strategy: "challenge"`; allowed values `challenge | both_and`
- Response field: `fight_response` → `challenge_response`
- Export column: `unstuck_n_fight` → `unstuck_n_challenge`
- `demoDataset.js` synthetic data uses `strategy: "challenge"`
- Any UI copy that says "fight" in user-visible text

The three challenge-prompt scaffolding lines above the response field (from Stephanie's PPT slide 12) stay:

> - Is there another way I can think about this?
> - Is this really true, or can I think of a way it isn't true?
> - Is this thought helping me, and if not, what is a thought that might be more helpful?

#### Change 6 — Jessica's copy edit

On the screen above the response field, the prompt currently reads (roughly): *"What comes up for you when you ask yourself those?"* Update to:

> What comes up for you when you ask yourself those questions?

(add the word "questions" — Jessica's 2026-05-18 14:45 submission).

#### Change 7 — Data shape and export pipeline

The new save payload shape (replacing the v4.0/v3.0 shape):

```js
{
  activity: "getting_unstuck",
  appraisals: {
    a1: { truth_rating: 0..5, selected: bool, strategy?: "challenge"|"both_and", response?: "..." },
    a2: { ... },
    // ...a6
    a_other?: { text: "...", truth_rating: 0..5, selected: bool, strategy?: ..., response?: ... }
  },
  saved_at: "..."
}
```

`exportFlatten.js` updates:

- Drop `unstuck_freq_st1..st8` columns entirely.
- Replace `unstuck_belief_st1..st8` with `unstuck_truth_a1..a6` (and `unstuck_truth_a_other` when present, else null).
- `unstuck_selected_a1..a6` (binary 0/1).
- `unstuck_strategy_a1..a6` (`challenge` | `both_and` | null).
- `unstuck_response_a1..a6` (free text).
- `unstuck_n_challenge`, `unstuck_n_both_and` (counts).
- For `a_other`: add `unstuck_other_text` (free text of the kid's own thought) alongside the per-item columns above.

`demoDataset.js`: regenerate synthetic data using `a1..a6` IDs and `truth_rating: 0..5`. Roughly ~30% of synthetic responses include a non-empty `a_other`. Strategy distribution: ~60% `challenge`, ~40% `both_and`.

`src/lib/appraisals.js` (new shared module): exports the 6 appraisal items, IDs `a1`–`a6`, with `text` and `dimension` (`future` | `self` | `others`) fields. Both `GettingUnstuck.jsx` and the FollowUp Survey (Draft 16) import from here.

#### Change 8 — Version bump

`belonging-skills-sort` analog: `getting-unstuck` from v4.0 (current) → v4.2 (skipping 4.1, since the change is structural enough to warrant a MINOR-after-MAJOR jump but doesn't introduce a wholly new flow — keeps the v4.x family).

Actually — bump to **v5.0 (MAJOR)** since the item set is new, the scale changed (1-5 → 0-5), and the column registry is reshaped. Prepend a changelog entry: *"v5.0 — Replaced 8 stuck thoughts with 6 locked appraisal items from the FollowUp Survey; dropped 'how often' rating dimension; scale moved to 0-5 with Not At All / Somewhat / Definitely True anchors; threshold for Pick eligibility lowered to ≥2; added optional Other thought addendum; Fight → Challenge rename finalized; copy edit on challenge-prompt question screen."* Update `updated` to today's date.

**Approved by:** Josh, 2026-05-18.

*End of Draft 15.*

---

### Draft 16 — Posttest + FollowUp Survey build (paginated sandbox + admin entries)

**Status as of 2026-05-18:** The locked Posttest (18 items) and FollowUp Survey (30 items) docs are in `Final Measures/`. Build both as paginated sandbox activities mirroring the live participant flow, same pattern as `Pretest.jsx` (commit `aa94130`). Ship as one commit so /demo gains both new "Tests" entries together.

**Source docs:**

- `Final Measures/Posttest Draft Belongingness_5.2.26.docx`
- `Final Measures/FollowUp Survey Draft Belongingness_5.2.26.docx`

Both share scales with the Pretest where item wording and anchors are identical — keep them identical so within-subject change scores at pre/post and pre/follow-up are valid. **Do not paraphrase** any item text or scale anchor — this is psychometric content.

#### Component 1 — Posttest (18 items)

**File:** `src/activities/Posttest.jsx` (new).

**Intro paragraph (verbatim from the doc):**

> Thank you for your participation in this program! Now, we would like to ask you some questions about what you are thinking and feeling right now. Some of these questions will be the same as questions you answered at the start of this of the program, but others will be different. If you experience feelings of distress, please tell your caregiver or you can email us at sprang@uky.edu. Your experiences are very important to us!

**Item sections (in order):**

1. **Beck Hopelessness Scale** (4 items, identical to pretest BHS, scale 0-3: Absolutely disagree, Somewhat disagree, Somewhat agree, Absolutely agree).
2. **Adolescent Sense of Control Scale** (3 items, identical to pretest ASCS, scale 1-5: Never, Rarely, Sometimes, Often, Always).
3. **Need to Belong Scale** (3 items, identical to pretest NB, scale 1-5: Strongly disagree → Strongly agree).
4. **Belonging (2 items)** (slider 0-10, identical to pretest; same skip logic — if Q1 = 0, Q2 is hidden and `post_bw_2` saves as null).
5. **Perceived helpfulness of program** (1 item, slider 1-10, anchors "Not at all / Somewhat / Very Much"). The wording differs from pretest's expectation item:

   > At this point, how helpful has this program been for helping you feel close to your family and friends?

   (Pretest asks "how helpful do you think this program *will be*"; posttest asks "how helpful *has this program been*." Match the pretest item's `pre_pe_1` column with `post_pe_1`.)

6. **Program Feedback Scale: Acceptability (5 items, NEW)** — first time on the platform.

   Scale for items 1-3 (Likert): 0-4 — Really Disagree, Disagree, Neither Agree nor Disagree, Agree, Really Agree.

   1. I enjoyed the program.
   2. I understood the program.
   3. I would recommend this program to other kids my age.

   Items 4-5 are open-response (textarea, no character limit):

   4. What did you like about the program? Please share as many true thoughts and feelings as you would like.
   5. What would you change about the program? Please share as many true thoughts and feelings as you would like.

**Column-name plan** (`post_*` prefix, following Jessica's locked convention):

- `post_bhs_1..4`, `post_bhs_score`
- `post_ascs_1..3`, `post_ascs_score`
- `post_nb_1..3`, `post_nb_score`
- `post_bw_1`, `post_bw_2` (null when Q1 = 0)
- `post_pe_1` (perceived helpfulness)
- `post_pf_1..3` (program feedback Likert), `post_pf_score`
- `post_pf_open_like` (text), `post_pf_open_change` (text)

Register `pf` in `SCALE_ABBREVIATIONS` in `exportFlatten.js`.

**Save payload shape:** flat, keyed by SPSS column names (same pattern as `Pretest.jsx`). No nested objects.

#### Component 2 — FollowUp Survey (30 items)

**File:** `src/activities/FollowUp.jsx` (new).

**Intro paragraph (verbatim):**

> Thanks for participating in our program about 3 months ago. To better understand the helpfulness of this program to you and how you are thinking and feeling right now, we would like to ask you some questions. Some of these questions will be the same as questions you answered at the start of this of the program, but others will be different. When you complete this short survey, you will receive another $25 gift card to thank you for your time. If you experience feelings of distress when answering these questions, please tell your caregiver or you can email us at sprang@uky.edu.

**Item sections (in order):**

1. **Beck Hopelessness Scale** (4 items, identical wording).
2. **Adolescent Sense of Control Scale** (3 items, identical wording).
3. **UCLA 3-Item Loneliness Scale** (3 items, identical to pretest UCLA, scale 1-3: Hardly ever, Some of the time, Often).
4. **Need to Belong Scale** (3 items, identical wording).
5. **Belonging Promoting Behaviors** (7 items, identical to pretest BPB, scale 0-3: Never, Sometimes, Often, Always).
6. **Appraisals about self, others and future (6 items)** — **import from `src/lib/appraisals.js`** (the shared module created in Draft 15). Scale 0-5 with anchors Not At All True / Somewhat True / Definitely True. Same item set, same wording.
7. **Belonging (2 items)** (same slider + skip logic as pretest/posttest).
8. **Permanency (1 item, NEW)** — single-select radio with 4 options + Other (free text):

   > Since you completed the Belonging course have you (please select one of the following):
   > - Remained in the same home
   > - Moved to a new foster home
   > - Returned to live with birth family
   > - Other: (please specify)

   Selecting "Other" reveals a text input.

9. **Placement Disruption Worry (1 item, NEW)** — scale 0-4: Not at all, A little, Somewhat, Very, Extremely.

   > How worried are you right now that this placement will change?

**Column-name plan** (`fu_*` prefix):

- `fu_bhs_1..4`, `fu_bhs_score`
- `fu_ascs_1..3`, `fu_ascs_score`
- `fu_ucla_1..3`, `fu_ucla_score`
- `fu_nb_1..3`, `fu_nb_score`
- `fu_bpb_1..7`, `fu_bpb_score`
- `fu_app_1..6`, `fu_app_score` (register `app` in `SCALE_ABBREVIATIONS` — this column is shared between FollowUp's appraisals section and Getting Unstuck's truth-rating data, so the convention has to match)
- `fu_bw_1`, `fu_bw_2`
- `fu_permanency` (string enum: `same_home` | `new_foster` | `birth_family` | `other`), `fu_permanency_other` (text, populated only when `fu_permanency = "other"`)
- `fu_disruption_worry` (0-4 integer)

#### Wiring + demo entries

- Register both in `TEST_REGISTRY` under the "RSD test" category (or rename that category to "Ready for Roots test" if Draft 14 has shipped first; if Drafts 14 and 16 ship in the same session, do them in 14 → 16 order so the category name is already updated).
- Add `posttest` and `followup` entries to `src/lib/activityVersions.js` at v1.0 each. `updated` = today.
- Add demo entries to `/demo` under the "Tests" section (same pattern as the Pretest entry).
- `demoDataset.js` generates synthetic posttest + followup rows. Distributions: psychometric scales drift slightly relative to pretest (e.g., mean BHS at posttest ≈ pretest - 0.3 with noise); permanency distribution roughly 70/15/10/5 (same_home / new_foster / birth_family / other); disruption_worry roughly normal around 1.

#### Pagination + UX consistency

- Same `<ScreenSliderQuestion>` / `<ScreenLikertGrid>` (or equivalent components used in `Pretest.jsx`) for visual consistency.
- Progress strip up top.
- Back button on every screen.
- Sliders require explicit drag/tap before counting as answered (per the pretest precedent).
- Mobile-first responsive layout; same amber/slate palette.

#### Version bump

Both activities at v1.0 (new). No bump for Getting Unstuck or Pretest here — those are separate concerns.

**Approved by:** Josh, 2026-05-18.

**Open questions (build text for now, flag at the bottom of the commit message):**

- The Posttest doesn't include UCLA or BPB but the Pretest and FollowUp do. This is an intentional design choice per the locked docs; flag for Jessica to confirm at next data-review.
- `post_pf_open_like` and `post_pf_open_change` are unbounded free text — set a reasonable maxlength (~2000 chars) in the textarea component to prevent abuse without limiting genuine responses.

*End of Draft 16.*

-->

<!--

### Draft 12 — Belonging Skills Sort v3.0: visual buckets + ghost-chip drag + Not Interested bucket + remove-from-bucket

Five converging pieces of feedback from the 2026-05-18 review meeting + the 20 minutes of submissions immediately before it. All five resolve into one coherent rebuild of the placement interaction; ship as a single v3.0 commit.

**Driving feedback (verbatim, oldest → newest):**

- Stephanie (2026-05-15): *"I can't drag responses straight into the 'what I'm already doing box.'"*
- Stephanie (2026-05-15): *"Do we need a third option for if they are not doing it currently and not willing to try it?"*
- Holly (2026-05-18, 14:48): *"Is it possible for you to select a skill and actually 'drag' it with your mouse? Like, you would be able to see the text moving towards the box you want to put it in."*
- Ginny (2026-05-18, 14:57, anonymous): *"We call these buckets — can the spaces where we drag things look like buckets?"*
- Jessica (2026-05-18, 14:58): *"If they accidentally drag an option, then change their mind, can they delete it or do they have to reset the whole page?"*

The team aligned on a single direction in the meeting: replace the existing drop-zone-plus-tap interaction with a real drag-and-drop into visually rendered buckets, with a third "Not Interested" bucket and a way to remove items after placement.

**File:** `src/activities/BelongingSkillsSort.jsx` (plus the skill registry in `src/lib/` if there's a separate data file — confirm at build time).

---

#### Change 1 — Visual bucket graphics replacing the drop zones

Render each category as an illustrated bucket — not a labeled rectangle. A simple trapezoidal bucket SVG with a handle reads as a bucket to a teen at first glance; CSS rectangles do not. Single reusable SVG component takes a `label` prop and a `color` prop.

Three buckets, displayed side-by-side on desktop and stacked vertically on mobile (the existing breakpoint pattern in the activity is fine):

1. **What I'm already doing** — amber-300 fill, amber-500 outline
2. **What I'm willing to try** — amber-300 fill, amber-500 outline
3. **Not interested right now** — amber-300 fill, amber-500 outline

**Equal styling on purpose.** Resist the temptation to grey out or desaturate the Not Interested bucket. Visual hierarchy that demotes it implies the kid should feel bad for picking it; the whole point of adding the bucket is to legitimize "not for me" as a valid answer.

The bucket label sits above the bucket. Placed skill cards stack inside the bucket (clipped to the bucket's inner area, scrollable if more than ~3 stack up — though with only 7 skills total this should be rare).

#### Change 2 — Add the "Not Interested" bucket as a third category

The current data shape has `already_doing`, `willing_to_try`, and `unplaced` arrays. Add a fourth array: `not_interested`. The kid starts with all 7 skills in `unplaced` and ends with each skill in exactly one of the three placement arrays (or remaining in `unplaced` if they skip — same as today).

**New save shape:**

```js
{
  activity: "belonging_skills_sort",
  already_doing: ["bs4"],
  willing_to_try: ["bs7"],
  not_interested: ["bs2"],
  unplaced: ["bs1", "bs3", "bs5", "bs6"],
  saved_at: "2026-05-18T..."
}
```

`unplaced` stays in the payload so we can distinguish "kid didn't engage with this skill" from "kid actively chose Not Interested." That's the whole reason for adding the bucket — preserve the signal.

#### Change 3 — Real drag with a ghost-chip visual

Replace the current placement interaction with pointer-events-based drag-and-drop using a floating ghost chip that follows the cursor or finger. This addresses Holly's "I want to see the text moving" directly.

**Interaction model:**

1. **Pointer-down on a skill card** in the unplaced list: card scales up slightly (Tailwind `scale-105`), gains an amber-500 ring (`ring-2 ring-amber-500`), and a drop shadow lifts it visually (`shadow-lg`). Original card stays in place but dims to ~40% opacity (`opacity-40`) so the kid sees where they picked it up from.

2. **A ghost chip lifts off and follows the pointer.** The chip is a small rounded pill (~120-160px wide, ~36-44px tall) showing the skill number badge ("1", "2", …) plus the first ~30 chars of the label with ellipsis. Don't try to drag the full sentence — labels are long enough that a full-card ghost would cover half the screen on mobile.

3. **On mobile, offset the ghost chip ~32px above the finger** so the thumb doesn't cover it. On desktop, anchor the chip slightly above-right of the cursor (~12px offset).

4. **Pointer-move** updates the chip position. While the pointer is over a valid bucket, that bucket gets an amber-200 glow (`ring-4 ring-amber-200 ring-offset-2`) and the chip itself adds a subtle scale-up to confirm "ready to drop here."

5. **Pointer-up over a bucket**: ghost chip animates with an arc-into-bucket motion (~250ms, ease-out) and "settles" into the bucket's inner area as the real placed card. The original card removes from the unplaced list. The arc gives even quick-release users (touch users especially) the visual reinforcement that the skill traveled.

6. **Pointer-up outside any bucket**: ghost chip springs back to the origin position with a quick bounce (~200ms) and the original card returns to full opacity. No placement happens.

**Use `pointerdown` / `pointermove` / `pointerup` events**, not HTML5 `dragstart`/`dragover`/`drop`. HTML5 drag-and-drop has effectively no touch support across browsers and the ghost image is browser-controlled. Pointer events work uniformly on mouse, touch, and pen.

**Cursor states**: `cursor-grab` on hover, `cursor-grabbing` while dragging.

#### Change 4 — Remove items from buckets

Placed cards inside a bucket show a small × button in the top-right corner (Tailwind: `absolute top-1 right-1 w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 text-slate-600 text-xs flex items-center justify-center`). Tapping × returns the skill to the unplaced list (moves it from whatever category it's in back to `unplaced`).

The × is the primary removal affordance. **Do not** also support "drag the placed card out of the bucket back to unplaced" — the × is a one-tap escape hatch and a different intent (correcting a mistake) than drag (sorting). Keep the interaction model simple: drag to place, × to remove.

#### Change 5 — Keyboard + screen-reader accessibility

Pointer events alone aren't accessible. Add a keyboard fallback:

- Tab into the unplaced list. Arrow keys navigate between skill cards. Each card has an aria-label like "Skill 1: Pay close attention when someone is talking to you."
- Space or Enter "picks up" the focused skill — same visual state as pointer-down (ring, shadow, dimmed original). Focus moves to the first bucket. An aria-live region announces "Skill 1 picked up. Choose a bucket: Already doing, Willing to try, Not interested right now."
- Arrow keys cycle between the three buckets. Space or Enter drops the skill into the focused bucket. Aria-live announces "Skill 1 placed in Already doing."
- Escape cancels the pickup and returns focus to the original card.
- Tab into a placed card focuses the × button; Space/Enter removes.

#### Change 6 — Export pipeline updates

`src/lib/exportFlatten.js` currently emits `sort_*` columns derived from the three-array shape. Add columns for `not_interested`:

- `sort_not_interested_count` — integer count of items in `not_interested`
- `sort_not_interested_<skill_id>` — per-skill binary (1 if placed there, 0 otherwise), matching the existing per-skill column pattern for `already_doing` and `willing_to_try` if that pattern exists; otherwise just emit the count.

Verify the existing convention by reading the current emission code — match it. If `unplaced` currently doesn't get its own count column, leave that as-is.

`src/lib/demoDataset.js` synthetic data generator needs updated probabilities so that each of the 7 skills has ~25% chance of `already_doing`, ~25% `willing_to_try`, ~15% `not_interested`, ~35% `unplaced` — adjust to a reasonable distribution, doesn't need to be precise.

#### Change 7 — Version bump

`src/lib/activityVersions.js`: bump `belonging-skills-sort` from v2.0 to v3.0 (MAJOR — new bucket, new data shape, new interaction model). Update `updated` to today's date. Prepend a one-line changelog entry:

> v3.0 — Visual bucket graphics replace drop zones; added "Not interested right now" as a third placement bucket; rebuilt placement as pointer-event drag with a ghost-chip follower and arc-into-bucket animation; placed cards have an × remove button; keyboard + screen-reader accessibility added.

---

**Out of scope for this draft:**

- The bs1-bs7 skill labels themselves don't change. The 7 Belonging Promoting Behaviors items from the locked pretest doc (set in commit `7b7046e`, Draft 3) stay.
- Hover/tap-define tooltips on each skill (the "?" affordance) stay. They should continue to work in the unplaced list; consider whether they should also work on placed cards inside a bucket (probably yes, but small — the kid may want to re-read a definition before deciding to remove).
- The activity-completion criteria (when "Continue" enables) stays the same as today.

**Approved by:** Josh, 2026-05-18, in Cowork session reviewing the 2026-05-18 meeting feedback.

*End of Draft 12.*

---

### Draft 13 — Small-copy bundle: Letter to Another Youth v2.1 + Who I Am Poem v2.3

Two unrelated small copy changes from the 2026-05-18 review meeting. Both are one-line edits with no data-shape implications; ship as a single commit so the team sees one stopping point rather than two micro-pushes.

#### Change 1 — Letter to Another Youth v2.1: new instruction copy

**Driving feedback:** Stephanie (2026-05-15): *"Instead of 'another teen starting where you are' would we want to say maybe another teen in out of home care that doesn't feel like they fit in or belong? something like that?"*

The current context line above the textarea (set in commit `7b7046e`, Draft 4) reads roughly: *"Write a letter to another teen who is starting where you are now. What do you want them to know?"* The framing of "starting where you are now" is too vague — the recipient isn't anchored in the same emotional state the kid is being asked to write to. Stephanie's reframe lands on the actual recipient: another teen who doesn't feel like they belong.

**File:** `src/activities/LetterBuilder.jsx`

**Change:** Replace the existing context line above the textarea with:

> What you would want to say to another teen who feels like they don't belong.

This becomes the entire instruction line above the textarea. Don't keep the "Write a letter…" wrapper — the new line is the prompt. Tone is intentionally direct ("you would want to say") rather than instructional ("write a letter to…") so the kid is composing in their own voice rather than performing the task of letter-writing.

Keep any small "optional" example block outside the textarea as-is if one exists from v2.0. If none exists, don't add one.

**Version bump:** v2.0 → v2.1 (MINOR, copy change). Prepend changelog entry: *"Replaced context line above the textarea with Stephanie's reframe — 'What you would want to say to another teen who feels like they don't belong.'"* Update `updated` to today's date.

**No data-shape changes.** Save payload `{ letter: "<full text>", saved_at: "..." }` unchanged.

#### Change 2 — Who I Am Poem v2.3: auto-title the output "Who I Am"

**Driving feedback:** Stephanie (2026-05-15): *"It would be nice to give this a title to replace 'Your Poem.'"* Confirmed in the 2026-05-18 meeting: title the output **"Who I Am"** (matches the activity name itself, which is the natural read).

**File:** `src/activities/WhoIAmPoem.jsx` — and the keepsake-card builder used by `downloadSvgStringAsPng` (per commit `92bfff9`, the SVG keepsake card was added there; check `src/lib/imageDownload.js` if the title lives there instead).

**Change:** Wherever the finished poem is displayed (the on-screen amber card after the kid submits, AND the downloadable PNG keepsake card) — replace the title text **"Your Poem"** with **"Who I Am."** Both surfaces should match; the keepsake-card SVG is built to mirror the on-screen card per the v2.1 spec, so updating both at once preserves that invariant.

The "SSI Platform · date" footer on the keepsake card stays as-is.

If the title currently lives as a single string constant near the top of the component or in the SVG builder, this is a one-line edit. If there are two separate hardcoded strings (one for the card, one for the SVG), update both.

**Version bump:** v2.2 → v2.3 (MINOR, copy change). Prepend changelog entry: *"Auto-titled the finished-poem card and keepsake-image PNG 'Who I Am' (replacing 'Your Poem')."* Update `updated` to today's date.

**No data-shape changes.** Save payload unchanged.

---

**Approved by:** Josh, 2026-05-18, in Cowork session reviewing the 2026-05-18 meeting feedback.

**Out of scope for this draft:**

- Allies / Safety Net icon additions (Boyfriend/Girlfriend, multi-friend redesign, split parent/grandparent tiles, possibly foster sibling) are parked — Josh is preparing those icons himself before that draft goes to Claude Code.
- The Getting Unstuck v4.2 changes (drop "how often", add the six locked appraisal items + 0-5 anchor scale, add "Other thought" option, rename Fight → Challenge yet again, Jessica's "add the word questions" copy edit, fix the pull-forward threshold bug) will follow as Draft 14.

*End of Draft 13.*

-->

---

### Pending requirement — PID linking between Qualtrics consent and ctac.app surveys

**Status:** Not a ready-to-ship prompt yet — captured here so it isn't forgotten when the Qualtrics consent build kicks off. This requirement is part of the IRB protocol (per the wording Josh sent Jessica on 2026-05-18 for the Description of Research Procedures), so it has to be in place before the first real participant goes through.

**Background.** The RSD study links the caregiver consent (collected in Qualtrics) to all child-facing surveys (assent, pretest, intervention activities, posttest, 90-day follow-up — all in ctac.app) via a Participant ID (PID). The child's name is never collected by ctac.app. The IRB language Josh proposed:

> A random alphanumeric PID is generated at the time of consent that contains no identifying information (no name, no date of birth, no email). The PID is passed to ctac.app as a URL parameter in the program link sent to the caregiver's email, and ctac.app stores all subsequent child-facing data keyed only by that PID. The caregiver's email address is required only to deliver the program link, the 90-day follow-up link, and the e-gift-card incentives; it is stored in a separate access-controlled table, not co-located with the child's response data.

**Build requirements (must be in place before first real participant):**

1. **PID generation.** Decide on Qualtrics' built-in `ResponseID` vs. a custom random PID stored as embedded data. Awaiting Jessica's preference — either works for the IRB. If we go custom, generate in Qualtrics with a JS embedded-data block (e.g., 12-char base32) so the PID is fixed at consent time.

2. **PID handoff to ctac.app.** The intervention link emailed from Qualtrics must include the PID as a URL parameter (e.g., `https://ctac.app/start?pid=ABC123XYZ`). ctac.app reads the PID on entry and stamps every saved row (assent, pretest, activity payloads, posttest) with it. Same mechanism for the 90-day follow-up link.

3. **Participants table in Supabase.** New `public.participants` table holding `(pid PRIMARY KEY, caregiver_email, consent_date, follow_up_due_date, follow_up_sent_at, completed_at)`. RLS-locked so it's accessible only to designated research personnel — no `anon` grants, only `service_role` / `authenticated` admins. This is the linking table; it lives separate from the response tables.

4. **Response tables stamped with PID.** Wherever child-facing data is currently saved (`assents`, `pretest_responses`, `activity_saves`, `posttest_responses`, `follow_up_responses` — exact table names per current schema), each row needs a `pid` column. Existing demo data may need a backfill or just left as null (demo-only). Decide based on schema state at build time.

5. **Child name never collected.** Audit all ctac.app screens to confirm no name-entry field for the kid. The "Other (custom)" ally tile names in Safety Net are fine — those are ally names, not the kid's name — but worth a sanity check on whatever copy currently asks for input.

6. **90-day follow-up scheduling.** A scheduled job (Supabase edge function on cron, or Resend-side schedule) reads from `participants` where `follow_up_due_date <= now()` AND `follow_up_sent_at IS NULL`, sends the follow-up email with the PID-stamped link, and marks `follow_up_sent_at`. Same gift-card workflow on completion of the follow-up survey.

**Supabase migration note.** Per CLAUDE.md, new public-schema tables created after 2026-10-30 need explicit Data API grants alongside RLS. The `participants` table is RLS-locked to admins only — `anon` gets no grants, `authenticated` gets nothing (RLS-policed), `service_role` gets full CRUD for the scheduled job.

**Questions to ask the caregiver inside the Qualtrics consent survey:**

Source: `Final Measures/Questions for Guardian.docx` (locked 2026-05-18).

1. Child first and last name (collected in Qualtrics only — never passed to ctac.app)
2. Caregiver first and last name
3. Caregiver email (collected twice with a "must match" validator — used for program-link delivery, follow-up reminder, gift cards)
4. Placement type — single-select: Foster care (non-relative) · Concurrent placement (foster/adoptive) · Relative caregiver · Other (specify)
5. County of residence (free text)

These five items live entirely in Qualtrics and never reach ctac.app. The bridge to ctac.app is the PID + caregiver email pair stored in the `participants` table per item 3 above. Placement type and county should be stored as embedded data in Qualtrics so they're exportable in the same SPSS bundle as the consent ResponseID.

**Open before build:**
- Jessica's preference on PID source (`ResponseID` vs custom random).
- Whether the gift-card-sending workflow is already wired up or needs to be part of this build.
- Coordination with whoever sets up the Qualtrics consent (likely Jessica or Adrienne) so the URL-parameter handoff is in place on both sides.
- Where (if anywhere) the placement-type and county fields surface in analysis — they're collected in consent but may also be useful as covariates in the child-facing data analysis. Decide whether to mirror those two fields into the ctac.app `participants` table at consent time, or just leave them in Qualtrics.

*End of pending requirement. When the Qualtrics consent build begins, this draft can be refined into a ready-to-ship implementation prompt.*

<!--

### Draft 11 — Revert Safety Net Inspect questions to Stephanie's PPT originals

Small copy revert. In commit `70d117b` (Draft 9) I reworded Stephanie's four PPT red-flag questions in the Safety Net Inspect modal — softened "usually" to "sometimes," added a "who care about you" qualifier to the isolation question, restructured the afraid-of question. The rewording wasn't driven by team feedback (Holly's clinical-safety concern was about the *keep/remove framing*, not the question wording itself); it was my judgment call about kid-friendly phrasing for clinical content Stephanie wrote. Josh decided 2026-05-12: restore Stephanie's wording as written.

**File:** `src/activities/AlliesSafetyNet.jsx` — find the four inspect-modal question strings and revert.

**Restore to these exact strings** (preserving the per-ally Yes / No / Not sure answer scheme):

1. *Does [name] usually get you into trouble?*
2. *Does [name] try to keep you from talking to or getting close to other people?*
3. *Does [name] frequently lie to you?*
4. *Do you feel afraid of [name]?*

Where `[name]` is the runtime substitution of the ally's display name (existing pattern in the code — don't change the substitution mechanism, just the question template strings).

The question framing notes from Slide 4 of Stephanie's PowerPoint:
- The PPT phrasing was a descriptive list under *"Is there anyone in your net that:"* — these are the bullets cast as per-ally yes/no questions, which is the natural modal form. Question 4's pronoun flips because the original is framed from the kid's perspective ("you feel afraid of"), not the ally's behavior.

**Version bump:** v4.0 → v4.1 (MINOR, copy revert). Prepend changelog entry: "Reverted inspect-modal question wording to Stephanie's PPT originals."

**No data-shape changes.** The `flags` keys (`trouble`, `isolate`, `lies`, `afraid`) and the Yes/No/Not sure value set are unchanged. Export columns unchanged.

*End of Draft 11.*

-->

<!--

### Draft 10 — 2026-05-11 evening revisions (Self-Reflection revert + Poem example removal + Getting Unstuck sequence change)

Three small-to-medium revisions to activities that shipped earlier today. Bundle as one commit.

#### Change 1 — Self-Reflection: revert exclusion prompt to original

In commit `7b7046e` Draft 1 we changed the exclusion prompt to *"Now think of a time someone made you feel like you did not belong."* That change should have gone past Ginny (who has final-word UX authority) and didn't. Revert it.

**File:** `src/activities/SelfReflection.jsx`

**Change:** Revert the exclusion prompt to its previous wording:

> Now think of a time you felt excluded — a time you felt like you did not belong.

The inclusion prompt stays as-is. This is the only change.

**Version bump:** v1.1 → v1.2 (MINOR, copy revert). Prepend changelog entry noting the revert and that Holly's reframe proposal is moved to team-level design discussion.

#### Change 2 — Who I Am Poem: remove the worked example

Draft 2 added a brief worked example of a finished poem before the input form. Take it back out.

**File:** `src/activities/WhoIAmPoem.jsx`

**Change:** Remove the example block entirely. Don't replace it with anything — the activity starts directly with the input form.

**Version bump:** v2.0 → v2.1 (MINOR, content removal). Prepend changelog entry: "Removed worked example before input form."

#### Change 3 — Getting Unstuck: separate rating from selection

In Draft 5 each thought had a 5-point appraisal scale plus an inline "I want to work on this" button that appeared when the thought met the eligibility threshold (freq ≥3 OR belief ≥3 on either scale). The kid rated AND chose what to work on in the same step. Restructure into two distinct steps.

**File:** `src/activities/GettingUnstuck.jsx`

**New flow:**

1. **Rate screen** (existing, modified). Show all 8 thoughts with the 5-point frequency + believability scales per thought. Below the list: a single primary **"Keep going"** button. **Remove the per-thought "I want to work on this" button entirely.**

2. **Pick screen** (new). Filter to thoughts where the kid rated ≥3 on EITHER frequency OR believability — same eligibility criteria as the previous build. Show those eligible thoughts as selectable cards. Header: *"Which of these thoughts would you like to work on?"* Subhead: *"Pick one or two."* Cards are tappable; selection limit is 2. Trying to select a third gently nudges with a small "Pick up to 2" hint (visual, non-blocking — show the hint as a small line under the cards or near the touched card). Continue button enabled when 1 or 2 are selected.

3. **Strategy screen** (existing). Plays out on the 1-2 thoughts the kid picked on the Pick screen. No other changes to this step.

**Edge case — no eligible thoughts.** If no thought meets the ≥3 threshold on either scale (kid rated everything low), skip the Pick screen entirely and show a brief affirmation screen: *"Looks like none of these thoughts are sticking with you right now — that's good news!"* with a Continue button that goes straight to Save (no strategy step).

**Data shape:** unchanged. The `unstuck_selected_st<n>` flag continues to mean "kid is working on this thought"; what changes is the path to becoming selected (previously: clicked "I want to work on this" inline; now: picked from filtered set on a separate screen).

**Version bump:** v2.0 → v3.0 (MAJOR, structural flow change). Prepend changelog entry: "Separated rating and selection into two distinct screens; max 2 thoughts may be selected to work on."

*End of 2026-05-11 evening revisions batch.*

-->

<!--

### Draft 9 — Trampoline-net visual component + Safety Net Step 2 (Inspect) + ally-icon transparency fix

Three coupled changes that ship together. **(1)** Strip the cream background tile from each of the 15 ally SVGs so they sit transparently on any backdrop. **(2)** Build the parameterized trampoline-net React component we've been designing — this is the visual that Step 1 (final screen) and Step 2 (centerpiece) both consume. **(3)** Build Step 2 "Inspect Your Safety Net" using that component as an interactive surface.

The trampoline-net visual is based on a Claude Design–generated reference at `Activity ideas/trampoline-safety-net.svg` (or wherever Josh dropped it — also in uploads as `trampoline-safety-net (1).svg`). The reference SVG has hardcoded wedge angles for a specific 2/4/3 ratio; we **do not** use it verbatim. We re-implement the geometry parametrically in React and use the reference as a visual target for patterns, colors, label pills, rim, and "YOU" hub.

---

#### Step 0 — Fix the ally-icon backgrounds

Per the icon-set README: *"delete the first `<rect>` element for a fully transparent background."* Apply this to all 15 SVGs in `src/assets/allies/`. The first `<rect>` is the `#FAF6EF` cream tile (`<rect x="0" y="0" width="100" height="100" rx="14" ry="14" fill="#FAF6EF" ... />`). One-line sed pass works:

```
sed -i -E 's|<rect x="0" y="0" width="100" height="100" rx="14" ry="14" fill="#FAF6EF"[^/]*/>||' src/assets/allies/*.svg
```

After the fix, the icons sit cleanly on any background — both the cream tile context of the Step 1 grid (the *tile* component still has its own card background) and the colored trampoline-net wedges in Step 2.

---

#### Step 1 — Build the `TrampolineNet` React component

**Location:** new `src/components/TrampolineNet.jsx` (or whatever the project's components convention is).

**Visual reference:** `Activity ideas/trampoline-safety-net.svg`. Match the rim styling (3 nested circles, dark brown → lighter brown → dark brown), the woven net patterns (one per support type with type-specific colors), the radial cord lines + concentric ring guides inside, the thick wedge-divider lines, the center "YOU" hub disc, and the label pills outside the rim.

**Type-specific palette** (lift from the reference SVG):
- **Practical**: bg `#FEF1D6`, stroke `#F59E0B`, dots `#B45309`, label pill `#B45309`
- **Emotional**: bg `#F8E5E5`, stroke `#C98686`, dots `#8E4A4A`, label pill `#8E4A4A`
- **Social**: bg `#E4EFE6`, stroke `#84A98C`, dots `#4E7257`, label pill `#4E7257`

**Props (component API):**
```
{
  allies: [
    { id, name, custom, support_types: ['practical', ...], inspected?, removed?: false },
    ...
  ],
  interactive: false,        // false in Step 1; true in Step 2
  onAllyTap?: (allyId) => {}, // fires only when interactive
  showLabels?: true,          // ally name pills under each icon
  showInspectedMarks?: false  // small checkmark on inspected allies (Step 2 only)
}
```

**Wedge sizing — proportional, with sliver-plus-label for empty types:**
- Compute counts per type from the allies array (allies with `removed === true` excluded).
- If a type has 0 allies, reserve a 15° sliver and label it *"no [type] allies yet"* in muted type.
- Remaining 345° (or 360° if no zero types) distributes proportionally by count.
- Edge case: all three types empty → render an empty net (rim + center hub, three equal grey-shaded sliver wedges, each labeled).

**Ally placement within wedges:**
- For each wedge, place each ally's icon as an `<image>` element at a position computed from:
  - Angle: distribute evenly within the wedge's angular range
  - Radius: stagger between ~70 and ~110 from center to avoid overlap (alternate inner/outer for adjacent allies)
- Icon size: 32×32 by default. For wedges with 6+ allies, scale down to 24×24. For 10+, 20×20.
- Each ally appears once per wedge they're in. A multi-type ally (e.g., Mom = practical + emotional) renders twice — once in each wedge. Honest about "she contributes to both."
- Ally name shown as a small pill below each icon (toggleable via `showLabels`).

**Inspected-mark rendering (`showInspectedMarks: true`):**
- Each inspected ally gets a small green checkmark in the upper-right of their icon
- Removed allies (when in a Step 2 review state) are shown faded/grayed within their wedge with an X overlay, OR moved to a separate "removed from net" area below — pick whichever reads cleaner

**Interactive behavior (`interactive: true`):**
- Each ally icon is a tappable target (full icon + small padding)
- Tap fires `onAllyTap(allyId)`
- Visual feedback on tap: brief amber ring pulse

**Mobile fidelity:** the visual must work at 390px wide. The rim+wedges scale down responsively; ally icons stay readable. Test at phone viewport.

---

#### Step 2 — Replace Step 1's placeholder final visual with the real `TrampolineNet`

In `src/activities/AlliesSafetyNet.jsx`, Screen 5 ("Your Safety Net") currently renders a placeholder (three stacked sections). Replace with:

```
<TrampolineNet allies={state.allies} interactive={false} showLabels={true} />
```

Keep the existing copy and Save button above/below the visual.

---

#### Step 3 — Build Safety Net Step 2 (Inspect)

**Add Step 2 as a follow-on flow** within the same `AlliesSafetyNet.jsx` activity, after the existing Step 1 save (or as a continue from the Step 1 final screen — TBD by you, but I'd lean toward a single Continue button on the Step 1 final screen that says "Inspect your net" and advances into Step 2). The save event for the whole activity fires at the end of Step 2.

**Framing matters here — clinical-safety language.** The whole purpose of this redesign is to address Holly's flag (don't imply real-life dropping) and Stephanie's "more visual, less per-person interrogation" ask. Use the copy below as written; if Stephanie wants to revise, she will.

**Screen 1 — Inspect intro.**

> **Inspect your safety net.**
>
> Your safety net is the people you'd reach out to when you really need support. Not every important person in your life belongs in your safety net — and that's okay.
>
> An ally who belongs in your safety net is someone who:
> - cares about you
> - is a positive influence
> - tries to help when you need it
>
> Let's check in on each ally. You can choose to keep them in your net or take them out. Taking someone out of your safety net doesn't mean they're not in your life — it just means they're not who you'd lean on right now for support.

Single Continue button → advances to Screen 2.

**Screen 2 — The interactive net.**

The `TrampolineNet` rendered with `interactive={true}` and `showInspectedMarks={true}`. Above the visual, a header strip:

> **Tap each ally to check in on them.**
> *X of Y inspected*

Where X is the count of allies with `inspected === true`, Y is the total. A "Done inspecting" button at the bottom — disabled until all allies are inspected, OR available with a confirmation modal asking "You haven't checked in on N allies — want to keep going, or finish anyway?" (let the kid skip if they want).

Tapping any ally opens the per-ally inspect modal (Screen 3, modal overlay).

**Screen 3 — Per-ally inspect modal.**

Modal overlay (not full screen — partial overlay, dismissable by Back or Save). Content:

> **Check in on [name].**
>
> [Ally icon, 80×80, centered]
>
> These questions might feel uncomfortable. You can answer honestly — the questions stay between you and the app.
>
> *Does [name] sometimes get you in trouble?* [Yes / No / Not sure]
> *Does [name] try to keep you from spending time with other people who care about you?* [Yes / No / Not sure]
> *Does [name] frequently lie to you?* [Yes / No / Not sure]
> *Does [name] sometimes make you feel afraid?* [Yes / No / Not sure]
>
> [Keep [name] in my net]    [Take [name] out of my net]

Visual treatment: if any "yes" is selected, the question card gets a subtle amber border — gentle acknowledgment, not an alarm. The keep/remove buttons stay equally weighted; don't style "remove" as destructive (no red).

**Keep button** → returns to Screen 2, ally marked `inspected: true`. If any "yes" was selected, show the keep-advisory (Screen 4) before returning to net.

**Remove button** → returns to Screen 2 with the removal acknowledgment (Screen 5) shown briefly, ally marked `inspected: true, removed: true`. Net re-renders with that ally faded/X'd or moved to a "removed" section, wedge proportions recalculate (a wedge may collapse to its sliver-plus-label state if its last ally got removed).

**Screen 4 — Keep-advisory (shown after kid keeps an ally with any "yes").**

> Keeping someone in your safety net is your choice, even when things feel complicated.
>
> Some things to remember:
> - You get to decide who you reach out to when you need support.
> - Some relationships are mixed — that's normal.
> - If a relationship feels really hard, talking to a trusted adult, counselor, or therapist can help.

Single Continue button → back to Screen 2.

**Screen 5 — Removal acknowledgment (shown after a remove).**

> Taken out of your safety net. They're still in your life — this is just about who you lean on for support right now.
>
> You can always change your mind later.

Single Continue button → back to Screen 2.

**Screen 6 — Inspection complete.**

When all allies are inspected (or the kid hits "Done inspecting" early), show:

> **Your safety net is ready.**
>
> [Final `TrampolineNet` rendering, non-interactive, showLabels true]
>
> [Save my safety net] button

Save fires the full activity save event.

---

**Save payload shape (extends Step 1's shape):**

```
{
  activity: "allies_safety_net",
  version: "3.0",
  allies: [
    {
      id: "foster",
      name: "Foster Parent",
      custom: false,
      support_types: ["practical", "emotional"],
      inspected: true,
      flags: { trouble: "no", isolate: "no", lies: "no", afraid: "no" },
      kept_in_net: true
    },
    {
      id: "other1",
      name: "Aunt Lisa",
      custom: true,
      support_types: ["emotional", "social"],
      inspected: true,
      flags: { trouble: "yes", isolate: "no", lies: "not_sure", afraid: "no" },
      kept_in_net: false
    },
    ...
  ],
  none_for: { practical: false, emotional: false, social: false },
  inspection_completed: true,  // false if kid skipped some
  saved_at: "..."
}
```

`flags` values are `"yes" | "no" | "not_sure"` strings. `kept_in_net` defaults to `true`; only `false` if kid actively removed.

**Export columns** (extend the `safety_net_*` set):
- `safety_net_inspected_count` — number of allies inspected
- `safety_net_kept_count` — number kept in net
- `safety_net_removed_count` — number removed
- `safety_net_total_flags` — sum of "yes" answers across all flag dimensions
- Per-flag rollups: `safety_net_flag_trouble_yes`, `_flag_isolate_yes`, `_flag_lies_yes`, `_flag_afraid_yes` — counts of "yes" across allies for each flag dimension
- Per-tile inspection columns deferred — discuss with Jessica before adding

`demoDataset.js` distribution: ~80% of demo participants complete inspection on all allies, 15% complete partial, 5% skip entirely. Of inspected, ~20% have at least one "yes" flag, ~10% remove at least one ally.

---

**Version bump:** `allies_safety_net` to v3.0 (MAJOR). Step 2 is new structural functionality and the save payload extends.

**Files to change / create:**
- `src/assets/allies/*.svg` — remove background `<rect>` (Step 0).
- New: `src/components/TrampolineNet.jsx` — parameterized net visual.
- `src/activities/AlliesSafetyNet.jsx` — swap Step 1 final-screen placeholder, append Step 2 flow.
- `src/lib/activityVersions.js` — bump to v3.0, prepend changelog entry.
- `src/lib/exportFlatten.js` — add new safety_net_* columns.
- `src/lib/demoDataset.js` — extend synthetic data for inspection state.

**Visual reference file location:** `Activity ideas/trampoline-safety-net (1).svg` in the repo root (or wherever Josh has it). Use as styling reference only — re-implement parametrically.

*End of 2026-05-11 Safety Net Step 2 + visual draft.*

-->

<!--

### Draft 8 — Allies / Safety Net Step 1 rebuild (Variant C flow + new SVG icon set)

Full replacement of `src/activities/AlliesSafetyNet.jsx`. The current 4-step flow (Build → Inspect → Strengthen → Review) is being torn down. This draft delivers Step 1 (Build) only, with a competent placeholder final visual. Steps 2–4 are queued as Task #7 — strip them entirely in this commit; they'll be rebuilt later after the team's Step 2 design discussion.

**Source of truth for the flow:** the 2026-05-11 review meeting + memory `project_team_email_pending.md` notes pending team discussion of ally-tile splits (don't pre-empt — build with the current 15 tiles, the team will weigh in on splits later).

**Variant chosen:** per-support-type multi-select grid (recorded transcript landing point — see meeting notes). Not one-at-a-time-per-tile, not pre-filter-then-categorize.

---

**Step 0 — Drop in the new SVG icon set.**

Source: `Activity ideas/safety-net-icons.zip` (in repo root). Contains 15 SVGs at 100×100 viewBox plus a `README.txt`.

Process for each SVG before committing it to the repo:
1. Strip the `data-om-id="..."` attributes that Claude Design embedded — these are internal tracking IDs, useless to us, and add ~30% size. A regex pass works: `sed -i -E 's/ data-om-id="[^"]*"//g' src/assets/allies/*.svg`
2. **Keep** the first `<rect>` background tile. The cream `#FAF6EF` tile reads as a card; the activity will look cleaner with it. If we later want transparent, the README explains the one-line removal.

Target location: `src/assets/allies/*.svg`. Use whatever SVG import pattern is already in the codebase (check if Vite is configured for `?react` component imports via vite-plugin-svgr, or just import as URL strings — either is fine for these).

**Tile registry.** Create `src/lib/allyTiles.js` (or co-locate in the activity file if cleaner) — a single data structure mapping tile ID → display name → icon import. The 15 entries:

| ID | Display name | Icon file |
|----|--------------|-----------|
| `foster` | Foster Parent | foster.svg |
| `bio` | Biological Parent | bio.svg |
| `sibling` | Sibling | sibling.svg |
| `grandparent` | Grandparent | grandparent.svg |
| `otherfam` | Other family (aunts, uncles, cousins) | otherfam.svg |
| `counselor` | School Counselor | counselor.svg |
| `teacher` | Teacher | teacher.svg |
| `coach` | Coach | coach.svg |
| `babysitter` | Babysitter | babysitter.svg |
| `neighbor` | Neighbor | neighbor.svg |
| `friend` | Friend | friend.svg |
| `therapist` | Therapist | therapist.svg |
| `caseworker` | Caseworker / Social Worker | caseworker.svg |
| `other1` | Other (custom) | other1.svg |
| `other2` | Other (custom) | other2.svg |

---

**Activity flow — 5 screens, paginated.**

Match the pretest's paginated pattern (Continue + Back buttons, progress strip up top). Single sandbox component, internal step state.

**Screen 1 — Intro.** Brief copy explaining what an "ally" is and previewing the three support types. Suggested copy (refine in voice as needed):

> **Who are the allies in your safety net?**
>
> An ally is someone you trust to provide support and help you become the person you want to be. They might not always get it right, but you know they care about you, they're a positive influence, and they try to help.
>
> The strongest safety nets have allies who provide different kinds of support:
>
> - **Practical** — people who help you solve problems, teach you things, or make sure you have what you need.
> - **Emotional** — people who help you feel good about yourself, listen to you, or help you cope with hard feelings.
> - **Social** — people you can be yourself around, or who help you feel less alone.
>
> Let's build your safety net.

Single Continue button to start.

**Screens 2, 3, 4 — One per support type (Practical → Emotional → Social).**

Each screen has the same structure:
1. **Header:** *"Who provides [practical] support for you?"*
2. **Definition repeated** (one line, lighter weight): *"People who help you solve problems, teach you things, or make sure you have what you need."*
3. **Tile grid:** all 15 tiles. **2 columns on mobile**, 3 columns on tablet/desktop. Each tile ≈ 180×140px showing the SVG icon (≈100×100) on top with the display name centered below. Tappable target is the full tile.
4. **Selection behavior:**
   - Tap = select (amber-500 ring + subtle checkmark in the corner)
   - Tap again = deselect
   - Multi-select; no limit on number selected
   - **Other tiles** (`other1`, `other2`): tapping opens an inline text input. The kid types a name; on commit (Enter or blur), the tile shows the custom name and is selected. The custom name persists across the three type screens — if the kid named "Aunt Lisa" on the Practical screen, the same `other1` tile shows "Aunt Lisa" pre-filled on the Emotional and Social screens.
5. **"None of these" affirmative button** below the grid: *"None of these are [practical] support for me."* This captures the kid affirmatively saying "no one for this type" — meaningfully different from "kid scrolled past without selecting." Tapping it deselects everything on the screen and visibly marks the "none" state.
6. **Back + Continue** buttons at the bottom (Continue is primary amber-500 CTA).

**Selection state is per-type-screen.** A kid selecting "Mom" on the Practical screen does NOT pre-select Mom on the Emotional screen. Mom starts unselected on Emotional; tapping her selects her there too. The cumulative result is one ally entity with the union of support types tapped across screens.

**Screen 5 — Your Safety Net (placeholder visual for now).**

Show the assembled set of selected allies grouped by support type. **Placeholder layout to ship in this commit:**

- Three labeled sections stacked vertically: Practical, Emotional, Social.
- Inside each section, show the SVG icons of all allies tagged with that support type, with names below. Use a soft section background to visually contain each group.
- If a support type has no allies, show muted copy: *"No practical support allies yet — that's okay. Sometimes it starts with looking for someone who could become one."*
- Multi-type allies appear once in each of their sections (they're duplicated visually but it's one ally entity in the data).

This placeholder is **deliberately not the final visual** — Josh is exploring a merged "net + pie" visual in Claude Design separately. A follow-up commit will swap this placeholder for the final visual. Build the data shape so the swap is just a render-layer change; the underlying data is the source of truth.

Below the visual: a Save button that fires the activity save and shows the standard "your responses are saved" confirmation.

---

**Save payload shape.**

```
{
  activity: "allies_safety_net",
  version: "2.0",
  allies: [
    { id: "foster", name: "Foster Parent", custom: false, support_types: ["practical", "emotional"] },
    { id: "sibling", name: "Sibling", custom: false, support_types: ["emotional"] },
    { id: "other1", name: "Aunt Lisa", custom: true, support_types: ["emotional", "social"] }
  ],
  none_for: { practical: false, emotional: false, social: true },
  saved_at: "..."
}
```

- `allies` is the **deduplicated** list — each tile ID (or custom name for `other1`/`other2`) appears once with the union of its support types.
- `none_for.<type>` is `true` only when the kid actively tapped the "None of these" button for that type. If they just continued without selecting anything *and* without tapping None, it's `false` (meaningful distinction — captures whether the kid considered the type vs. skipped through it).
- Empty `allies` array is valid — possible if all three types got "None of these."

Update `src/lib/demoDataset.js` to produce the new payload shape for this activity. Synthetic distribution: ~70% of demo participants have 2–4 allies, ~20% have 5–7, ~10% have 0–1 with at least one "None of these" flag.

Update the export pipeline columns to match the new shape — under the `safety_net_*` activity prefix that Draft 6 established:
- `safety_net_ally_count` — total deduplicated ally count
- `safety_net_practical_count`, `_emotional_count`, `_social_count`
- `safety_net_none_practical`, `_none_emotional`, `_none_social` (0/1)
- Per-tile selections may be too sparse to encode as columns — discuss with Jessica before going down that path; for now stick to counts + none-flags.

---

**Files to change / create:**
- `src/activities/AlliesSafetyNet.jsx` — full rewrite per above.
- `src/assets/allies/*.svg` — 15 new icon files (stripped of `data-om-id` attributes).
- `src/lib/allyTiles.js` (new) — tile registry data structure.
- `src/lib/activityVersions.js` — bump `allies_safety_net` to v2.0 (MAJOR). Prepend changelog entry. Set `updated` to today's date.
- `src/lib/exportFlatten.js` — update activity payload columns for the new shape.
- `src/lib/demoDataset.js` — generate synthetic data matching the new shape.

**Tear-down note.** The existing Step 2 (Inspect), Step 3 (Strengthen), Step 4 (Review) code paths in the current `AlliesSafetyNet.jsx` are gone in this commit. Don't preserve them. Task #7 will rebuild Step 2 from scratch after the team's design discussion next week.

**Version bump:** MAJOR. v1.x → v2.0. Per `CLAUDE.md` convention, bump in this same commit, prepend changelog entry to `activityVersions.js`.

*End of 2026-05-11 Safety Net Step 1 draft.*

-->

<!--

### Draft 6 — Export variable rename + .sps syntax generator + /demo data-export section simplification

Two coupled changes plus a UI cleanup. **(1)** Refactor the export pipeline to produce Jessica's SPSS-compatible column naming — the current `exportFlatten.js` produces names like `hopelessness_pre_bhs1`; after the rename that becomes `pre_bhs_1`. **(2)** Generate a companion `.sps` SPSS syntax file alongside the CSV that applies variable labels, value labels, types, and measurement levels in one syntax run after CSV import. This is what REDCap and KoboToolbox ship as their primary SPSS export today — research-platform standard, not a workaround. (Qualtrics ships both — native `.sav` *and* a separate `.sps` for relabeling. We're parking the native-.sav path as Task #11 Phase B, additive only if Jessica finds the syntax-run friction.) **(3)** Simplify the `/demo` data-export section to one CSV + .sps + Codebook bundle with a short explanation. Leave `/admin/data-export` untouched.

**Convention (memory: `project_spss_variable_naming.md`):**
- Pattern: `<timepoint>_<scale>_<item#>`
- Timepoints: `pre`, `post`, `fu`
- Numeric for likert/sliders (store the number, not the label); string for free text
- Response values must match across pre/post/follow-up surveys for the same scale

**Files to change:**
- `src/lib/exportFlatten.js` — primary refactor. Each scale needs an explicit `abbreviation` field; the column builder reads from a **column registry** data structure that becomes the single source of truth for both CSV columns and the .sps file. `sanitizeCol` stays as a safety net but the input it sanitizes is now constructed correctly upstream.
- **New: `src/lib/spssSyntax.js`** — generator for the `.sps` syntax file. Reads from the same column registry as `exportFlatten.js`. Emits the syntax text Jessica runs in SPSS after CSV import. Performs SPSS variable-name validation at generation time (64-char max, must start with a letter, no spaces, no reserved words like `ALL`/`AND`/`BY`/`EQ`/`GE`/`GT`/`LE`/`LT`/`NE`/`NOT`/`OR`/`TO`/`WITH`) — throw with a clear error if a column name fails, rather than emitting a bad file.
- `src/lib/demoDataset.js` — column references update; synthetic data *values* stay identical so the demo dataset remains reproducible.
- `src/pages/DemoPage.jsx` — drop Summary + Long buttons from the Data export demo section. Replace with three downloads: Wide CSV, `.sps` syntax, Codebook CSV. Add the explanation copy below. `/admin/data-export` is untouched (still has all four formats).

**Proposed scale abbreviations** (call these out in the commit message so Jessica can react in the next review batch):

| Scale | Abbreviation | Example column |
|------|--------------|----------------|
| Beck Hopelessness | `bhs` | `pre_bhs_1` |
| Adolescent Sense of Control | `ascs` | `pre_ascs_1` |
| UCLA 3-Item Loneliness | `ucla` | `pre_ucla_1` |
| Need to Belong | `nb` | `pre_nb_1` |
| Belonging Promoting Behaviors | `bpb` | `pre_bpb_1` |
| Belonging Worries (2-slider) | `bw` | `pre_bw_1`, `pre_bw_2` |
| Program Expectation | `pe` | `pre_pe_1` |

Score columns become `pre_bhs_score`, `pre_ascs_score`, etc.

**Demographic column names** (bare, no timepoint prefix):

| Field | Column(s) | Coding |
|------|-----------|--------|
| Age | `age` | numeric |
| Sex | `sex` | 1=Female, 2=Male, 3=Prefer not to answer |
| Grade | `grade` | numeric |
| Race (multi-select) | `race_white`, `race_black`, `race_amind`, `race_alaskan`, `race_pi`, `race_asian`, `race_pna`, `race_dunno` | 0/1 per column |
| Hispanic | `hispanic` | 0=No, 1=Yes |
| Time in current home | `home_years`, `home_months` | numeric |

**Activity payload columns** — not psychometric scales, so the `<timepoint>_<scale>_<item#>` pattern doesn't apply cleanly. Keep an activity-prefixed pattern: `unstuck_*`, `safety_net_*`, `letter_*`, `poem_*`, `sort_*`, `reflect_*`. Shorten existing names where they're clunky but preserve the meaning.

For the Getting Unstuck appraisal scores added in commit `7b7046e`: suggested `unstuck_freq_<thought_id>` and `unstuck_belief_<thought_id>` for the per-thought 5-point scores; `unstuck_strategy_<thought_id>` for the strategy choice (`challenge` / `bothand`); `unstuck_response_<thought_id>` for the open text.

**Discrepancy to investigate during build:** the current code produces columns under a scale called `appraisals_*` (e.g., `appraisals_pre_a1`) that isn't part of the locked pretest doc. Possibly the appraisal instrument Stephanie referenced for Getting Unstuck. Either rename to `pre_app_<item#>` and leave a comment flagging "origin unclear, confirm with Jessica/Stephanie," or drop it from the pretest export and route it through the activity-payload path under `unstuck_*`. Use your judgment based on what the scale's items look like.

**.sps syntax file format.** The generator emits a single text file that, when opened in SPSS, imports the CSV and applies every piece of metadata in one syntax run. Skeleton:

```
* Generated by RSD export — timestamp {ISO 8601}, rows {N}, activity versions {snapshot}.

GET DATA
  /TYPE=TXT
  /FILE='participant_data.csv'
  /ENCODING='UTF8'
  /DELIMITERS=','
  /QUALIFIER='"'
  /FIRSTCASE=2
  /VARIABLES={list with format specifiers like "age F2 sex F1 pre_bhs_1 F1 ..."}.

VARIABLE LABELS
  pre_bhs_1 "Beck Hopelessness item 1: I feel that my future is hopeless..."
  pre_bhs_2 "Beck Hopelessness item 2: My future seems dark to me."
  ...
  /.

VALUE LABELS
  pre_bhs_1 pre_bhs_2 pre_bhs_3 pre_bhs_4
    0 "Absolutely disagree"
    1 "Somewhat disagree"
    2 "Somewhat agree"
    3 "Absolutely agree"
  /
  pre_ascs_1 pre_ascs_2 pre_ascs_3
    1 "Never" 2 "Rarely" 3 "Sometimes" 4 "Often" 5 "Always"
  /
  sex
    1 "Female" 2 "Male" 3 "Prefer not to answer"
  /
  hispanic 0 "No" 1 "Yes"
  /.

VARIABLE LEVEL
  pre_bhs_1 pre_bhs_2 pre_bhs_3 pre_bhs_4 (ordinal)
  pre_bw_1 pre_bw_2 pre_pe_1 (scale)
  sex race_white race_black race_amind race_alaskan race_pi race_asian race_pna race_dunno hispanic (nominal)
  age grade home_years home_months (scale)
  /.

FORMATS
  age home_years home_months grade (F2)
  pre_bhs_1 pre_bhs_2 pre_bhs_3 pre_bhs_4 pre_ascs_1 pre_ascs_2 pre_ascs_3 (F1)
  pre_bw_1 pre_bw_2 pre_pe_1 (F2)
  /.

SAVE OUTFILE='participant_data.sav'.
EXECUTE.
```

The header comment at the top is critical for triage — when Jessica references "the export from last Tuesday" three weeks from now, the timestamp and activity-version snapshot let us identify which build it came from.

**Encoding details.** Emit the CSV as UTF-8 with BOM. The `/ENCODING='UTF8'` in the syntax handles any non-ASCII characters in free-text responses (which there will be).

**/demo Data export demo section — new copy:**

Replace the current 4-button layout with this:

> **Download the SPSS bundle.** Three files: the Wide CSV (your data), the `.sps` syntax file (variable labels, value labels, types, and measurement levels), and the Codebook CSV (short column names mapped to full item text). To get a labeled `.sav` dataset in SPSS, open the `.sps` file in SPSS — it imports the CSV and applies all metadata in one run, ending with a saved `.sav`. This is the same approach REDCap and KoboToolbox use as their primary SPSS export — it's the research-platform standard, not a workaround.
>
> Column names follow SPSS-import conventions: timepoint first, then scale abbreviation, then item number (e.g., `pre_bhs_1` is pretest Beck Hopelessness item 1).
>
> *Note: Qualtrics offers a native `.sav` file directly. We may add that as a second download option later if the open-via-syntax step proves clunky in practice — for now, all the same metadata lands in your `.sav` via this two-step.*
>
> [Download CSV] [Download .sps] [Download Codebook]

Drop the existing collapsible "How exports work" panel (or fold its substance into the new note). The Summary and Long buttons are gone from `/demo` — they remain available on `/admin/data-export`.

**Update `INFRASTRUCTURE.md`** with a change-log entry describing the new column naming and the .sps generator.

**No activity-version bumps** — none of the activities change.

---

### Draft 7 — Pretest Demo: interactive sandbox entry on /demo

Build the pretest as a fully interactive sandbox entry, rendered as it'll appear in the live app. Captures responses with the new SPSS column names from Draft 6.

**Source content (FINAL, confirmed by Josh 2026-05-11):** `Pretest Draft Belongingness_5.2.26.docx`. 29 items: 6 demographics + 7 scales. Embedded below verbatim so you don't need to re-extract from the docx.

**Files:**
- New: `src/activities/Pretest.jsx` — the rendered pretest.
- `src/lib/testRegistry.js` (or wherever `TEST_REGISTRY` lives) — add a new category `RSD test` with one entry: `pretest`.
- `src/pages/DemoPage.jsx` — add a new section "Tests" between the existing Activities and Data export demo sections; render items where `category === 'RSD test'` with the same card layout.
- `src/pages/DemoSandboxPage.jsx` — should accept the new pretest entry automatically via the registry pattern; verify the sandbox route `/demo/sandbox/pretest` renders.
- `src/lib/activityVersions.js` — add a `pretest` entry at v1.0 so the version badge works on the sandbox page. (Treat as a structural artifact, not a content version — initial 1.0.)
- `src/lib/demoDataset.js` — if it doesn't already generate pretest responses, extend it. Use the SPSS column names from Draft 6.

**Layout — paginated, mirroring the live session.** The goal of this demo is to show the team exactly how the pretest will paginate and feel in a real participant session — not to serve as a one-page review of items the team has already gone over endlessly. Build this to live-session fidelity from the start.

- **One section per screen.** Suggested screen breakdown: (1) Intro / "Begin" → (2) Demographics → (3) Beck Hopelessness → (4) Adolescent Sense of Control → (5) UCLA Loneliness → (6) Need to Belong → (7) Belonging Promoting Behaviors → (8) Belonging Worries → (9) Program Expectation → (10) Thank-you / Submit. Ten screens. Adjust if a tighter grouping reads better (e.g., combining the two-item Belonging Worries with Program Expectation), but err toward more screens, not fewer — short single-section screens are easier on a kid.
- **Progress indicator** at the top of each screen — either a thin progress bar or "Step X of 9" text. Pick whichever reads cleanest in the existing amber/slate style.
- **Continue button** at the bottom of each section (primary amber-500 CTA per repo conventions). Validation: don't advance until required items on the current screen are answered (sliders default to no-value; explicit interaction required).
- **Back button** available on every screen except the intro, so the kid can revise prior answers.
- **Mobile-first.** Participants will mostly be on phones. Make sure each screen fits within a phone viewport without horizontal scroll, sliders are thumb-friendly, and the Continue button stays reachable.
- **Conditional skip on Belonging Worries Q2** — if `pre_bw_1` is 0, the screen auto-advances past Q2 (or Q2 doesn't render and the section ends after Q1). `pre_bw_2` saves as null/empty.
- **Final screen** shows a brief "Thanks — your responses are saved" message and the Submit action that fires the save panel capture. Don't show the JSON payload on this screen (it's already visible in the sandbox save panel below the activity frame).

**Items (verbatim from the locked doc):**

#### Intro (display only, no input)

> Thank you for joining our project! We want to learn what helps kids and teens feel like they belong with their families and in their communities.
>
> We will ask you some questions before and after you watch some videos and complete some activities. Some of these questions might ask about feelings that are hard to talk about. If you feel upset and want to talk to someone, please tell your caregiver or email us at sprang@uky.edu. By completing the program today, you will receive a $25 e-gift card as a thank you. We're so glad you're working with us!

#### Section 1 — Demographics (6 items)

1. **How old are you?** — number input → `age`
2. **What is your sex?** — radio (Female=1, Male=2, Prefer not to answer=3) → `sex`
3. **What race do you consider yourself (choose all that apply)?** — checkboxes (White, Black/African American, American Indian, Alaska Native, Pacific Islander, Asian, Prefer not to answer, I don't know) → `race_white`, `race_black`, `race_amind`, `race_alaskan`, `race_pi`, `race_asian`, `race_pna`, `race_dunno`
4. **Are you Hispanic or Latino?** — radio (No=0, Yes=1) → `hispanic`
5. **What grade are you currently in at school?** — number input → `grade`
6. **How long have you lived in your current home?** — two number inputs (years + months) → `home_years`, `home_months`

#### Section 2 — Beck Hopelessness Scale (4 items)

Stem: *Please share how you are feeling right now, at this moment.*
Scale: Absolutely disagree (0) · Somewhat disagree (1) · Somewhat agree (2) · Absolutely agree (3)

- `pre_bhs_1` I feel that my future is hopeless and that things will not improve.
- `pre_bhs_2` My future seems dark to me.
- `pre_bhs_3` Things just won't work out the way I want them to.
- `pre_bhs_4` There is no use in really trying to get something I want because I probably won't get it.

#### Section 3 — Adolescent Sense of Control Scale (3 items)

Stem: *Below are several statements that may apply to you. There are no right or wrong answers or trick questions. Based on your understanding of the question, select how often this applies to you.*
Scale: Never (1) · Rarely (2) · Sometimes (3) · Often (4) · Always (5)

- `pre_ascs_1` If I decide to, I can make changes to get more control over how close I feel to other people in my life.
- `pre_ascs_2` I am able to act in ways that help me feel close to people in my life.
- `pre_ascs_3` I have the skills and ability to improve how close I get to people in my life.

#### Section 4 — UCLA 3-Item Loneliness Scale (3 items)

Stem: *Please answer the following:*
Scale: Hardly ever (1) · Some of the time (2) · Often (3)

- `pre_ucla_1` How often do you feel that you lack companionship?
- `pre_ucla_2` How often do you feel left out?
- `pre_ucla_3` How often do you feel isolated from others?

#### Section 5 — Need to Belong (3 items)

Stem: *For each of the statements below, indicate the degree to which you agree or disagree with the statement using the scale below.*
Scale: Strongly disagree (1) · Moderately disagree (2) · Neither agree nor disagree (3) · Moderately agree (4) · Strongly agree (5)

- `pre_nb_1` If other people don't seem to accept me, I don't let it bother me.
- `pre_nb_2` I seldom (hardly ever) worry about whether other people care about me.
- `pre_nb_3` My feelings are easily hurt when I feel that others do not accept me.

#### Section 6 — Belonging Promoting Behaviors (7 items)

Stem: *How often do you:*
Scale: Never (0) · Sometimes (1) · Often (2) · Always (3)

- `pre_bpb_1` Pay really close attention to what someone is saying to you without letting yourself get distracted (like not checking your phone while they are speaking)?
- `pre_bpb_2` Use words like "we" or "us" or "our group" that make people feel included?
- `pre_bpb_3` Say "Thank You" and/or tell others when they do something you appreciate?
- `pre_bpb_4` Help someone out when they need it?
- `pre_bpb_5` Invite others (like family members and friends) to spend time with you?
- `pre_bpb_6` Include others in conversations and/or invite them to join in your activities (like watching a movie together, going for a walk, or playing a game)?
- `pre_bpb_7` Talk through a disagreement with someone until you find an answer that works for everyone?

#### Section 7 — Belonging Worries (2 slider items)

Slider 0–10. Anchors: Not at all · Moderately · A lot

- `pre_bw_1` To what degree do you have worries about belonging (e.g., fitting in, being understood or accepted)?
  - **Conditional skip:** if `pre_bw_1` is 0, hide Q2 (don't show the slider). On save, store `pre_bw_2` as null/empty.
- `pre_bw_2` To what degree do your worries about belonging interfere with your desire to stay in your current home?

#### Section 8 — Program Expectation (1 slider)

Stem: *Please rate the following sentence based on how you feel at this moment.*
Slider 1–10. Anchors: Not at all · Somewhat · Very Much

- `pre_pe_1` At this point, how helpful do you think this program will be for helping you feel close to your family and friends?

**Save payload:** flat object keyed by the column names above, plus `saved_at`. The save panel on the sandbox shows the JSON so reviewers can confirm the shape matches the export.

**Registry entry shape (suggested):**
```
{
  id: 'pretest',
  category: 'RSD test',
  displayName: 'Pretest',
  description: 'The pretest survey shown before activities begin. Captures demographics and baseline measures (Beck Hopelessness, Adolescent Sense of Control, UCLA Loneliness, Need to Belong, Belonging Promoting Behaviors, Belonging Worries, Program Expectation).',
  component: 'Pretest',
  route: '/demo/sandbox/pretest',
}
```

**DemoPage new section:**

Add the new "Tests" section after the existing Activities section. Same card layout as Activities. Single card for now (pretest); posttest + follow-up will be added later. Section header copy:

> **Tests.** Pre-, post-, and follow-up surveys that bookend the program. Currently shown: pretest.

*End of 2026-05-11 data-and-pretest batch.*

-->

<!--

#### Draft 1 — Self-Reflection: sharpen "excluded" prompt wording

Holly flagged in the 2026-05-11 feedback round that the current exclusion prompt — *"Now think of a time you felt excluded — a time you felt like you did not belong"* — reads as a state of being rather than an event done to the kid. Reframe to make the exclusion agentive.

**File:** `src/activities/SelfReflection.jsx`

**Change:** Find the exclusion prompt (the second half of the inclusion/exclusion pair) and replace it with:

> Now think of a time someone made you feel like you did not belong.

The inclusion prompt stays as-is. This is the only copy change.

**Version bump:** MINOR. Prepend a one-line entry to this activity's `changelog` in `src/lib/activityVersions.js`, set `updated` to today's date.

**Approved by:** Josh, 2026-05-11. Treated as a clinical-content tweak Sprang doesn't need to weigh in on at this scale.

---

#### Draft 2 — Who I Am Poem: rebuild to Ginny's 10-line structure

Ginny sent a revised poem structure (image: `Poem structure.png` in the repo root). She has final word on platform UX per Josh's call. This supersedes the meeting transcript's "one stanza only" framing.

**File:** `src/activities/WhoIAmPoem.jsx`

**Replace the current poem flow with this 10-line structure.** Kid fills in 8 input fields; lines 6 and 10 auto-display whatever they wrote for line 1.

| Line | Prompt | Kid input |
|------|--------|-----------|
| 1 | I am | two special characteristics you have |
| 2 | I am from | a place, people, or way of life |
| 3 | I fear | something you are afraid of |
| 4 | I suffer when | an event that makes you sad or angry |
| 5 | I want | an actual desire |
| 6 | I am | *(auto: same text as line 1)* |
| 7 | I believe | something you believe in |
| 8 | I dream | something you actually dream about |
| 9 | I am going | where you hope to be |
| 10 | I am | *(auto: same text as line 1)* |

**Behavior:**
- 8 inputs (lines 1, 2, 3, 4, 5, 7, 8, 9). Lines 6 and 10 are display-only and mirror line 1.
- Single screen. No multi-page flow.
- Before the input form, show a brief worked example of a finished poem (Holly: *"I think we might want an example of a finished product here before we ask them to do it"*). Write something simple in-voice — don't pull from a published poet, since that's exactly what Ginny asked us to stop doing. Two to three lines of a sample is enough; doesn't need to be all 10.

**Copy changes:**
- Remove the "George Ella Lyon" / "Lyons format" / "Two-stanza George-Ella-Lyons-style poem with keepsake card" attribution entirely. Ginny was explicit: *"Remove this label — this isn't the Lyons format."* If a credit is wanted, "Inspired by traditional 'I am' poems" is fine. No named-poet attribution.
- Keep tone warm and kid-friendly.

**Data shape:**
Save payload preserves the 8 unique inputs:
```
{
  characteristics: "...",  // line 1
  from: "...",             // line 2
  fear: "...",             // line 3
  suffer_when: "...",      // line 4
  want: "...",             // line 5
  believe: "...",          // line 7
  dream: "...",            // line 8
  going: "...",            // line 9
  saved_at: "..."
}
```
Lines 6 and 10 reconstruct from `characteristics` at render time.

**Version bump:** MAJOR. Prepend changelog entry, update `updated`.

**Source:** `Poem structure.png` in the repo root.

---

#### Draft 3 — Belonging Skills Sort: kid-friendly labels + hover-define tooltips

Stephanie + Holly + Ginny all converged on this. Stephanie: language needs to be more child-friendly. Holly: *"reducing belonging uncertainty and creating space for belonging aren't specific enough... I'm not even sure what that means behaviorally."* Ginny: *"we should define these if you hover over the skill as a reminder."*

**Files:** `src/activities/BelongingSkillsSort.jsx` and any associated data file under `src/lib/` that defines the skill list (check both).

**Replace the existing 7 skill labels (`bs1`–`bs7`) with the 7 Belonging Promoting Behaviors items from the locked pretest doc** (`Pretest Draft Belongingness_5.2.26.docx`, "Belonging Promoting Behaviors (7 items)" section, confirmed final by Josh 2026-05-11). In this order:

1. **`bs1`** — Pay close attention when someone is talking to you (without checking your phone or getting distracted)
2. **`bs2`** — Use words like "we," "us," or "our group" to make people feel included
3. **`bs3`** — Say thank you or tell others when they do something you appreciate
4. **`bs4`** — Help someone out when they need it
5. **`bs5`** — Invite others to spend time with you
6. **`bs6`** — Include others in conversations and activities (like watching a movie, going for a walk, or playing a game)
7. **`bs7`** — Talk through a disagreement with someone until you find an answer that works for everyone

**Add hover-define tooltips** — each skill shows a 1–2 sentence definition on hover (desktop) or tap (mobile). Draft definitions below; refine in voice as needed:

1. Giving someone your full attention when they're speaking — eyes on them, no phone, no looking around.
2. Saying things that signal everyone belongs in the group — "we" instead of "you guys," "our team" instead of "the group."
3. Telling someone you noticed and appreciated what they did, instead of just thinking it.
4. Offering help when you see someone needs it, without waiting to be asked.
5. Reaching out to bring someone into your plans or your day, instead of waiting for them to ask.
6. Making space for others in what you're already doing — looping them into the conversation, the game, the show.
7. Staying with a disagreement until you find something that works for everyone, instead of walking away or giving up.

**Implementation notes:**
- Tooltip must be tap-accessible on mobile (use a small "?" affordance or tap-to-toggle, not hover-only).
- Skill IDs `bs1`–`bs7` stay sequential; the *meaning* of each ID is changing, but that's fine — demo-only state, no real participants.
- The three categories (`already_doing`, `willing_to_try`, `unplaced`) stay as-is.

**Version bump:** MAJOR (label set is structurally changing and per-ID meaning shifts).

---

#### Draft 4 — Letter to Another Youth: collapse to one-page free write

Meeting + feedback consensus 2026-05-11. Stephanie: *"the letter has too many steps and would be confusing for a kid"* — and she fed back to herself that the multi-section format produced a letter that *"was meaningless"* because the kid was just borrowing other people's words. Holly reported a bug where click-to-add inserts text before the prompt sentence — that whole interaction becomes moot once we remove click-to-add.

**File:** `src/activities/LetterBuilder.jsx`

**Rebuild as a single-screen free-write activity** modeled on the gains-professional one-page pattern. Look for that pattern elsewhere in `src/activities/` for the visual reference — it's a one-textarea, write-whatever-you-want layout.

**Required changes:**
1. **Collapse all 6 sections into one.** A single textarea, free-form. Save on continue.
2. **Remove every click-to-add prompt button.** Do not import phrases from other activities (Getting Unstuck, etc.). The letter should come entirely from the kid — Stephanie was explicit.
3. **Add a short context line above the textarea** describing who the kid is writing to (Stephanie: *"Maybe need to give them a little more context for who they are writing to"*). Suggested copy:
   > Write a letter to another teen who is starting where you are now. What do you want them to know?
4. **Optional small example** *outside* the textarea (greyed/italic) showing the kind of letter that's welcome. Keep it short — one sentence — and generic. Not a model letter to copy.

**Data shape:**
- Save payload becomes `{ letter: "<full text>", saved_at: "..." }`. Drop all the structured per-section fields. Breaking change to the saved schema; acceptable since demo-only.
- **Remove cross-activity coupling.** Stephanie's comment *"They may not do a both/and statement from getting unstuck, so not sure what would show up here if they didn't"* implies Letter Builder currently reads Getting Unstuck output. Kill that dependency entirely — the letter is freestanding now.

**Version bump:** MAJOR (structural change, feature removal, data shape change).

---

#### Draft 5 — Getting Unstuck: appraisal scale + restored challenge prompts + "Challenge it" rename

Three changes from Stephanie's feedback + the 2026-05-11 meeting.

**File:** `src/activities/GettingUnstuck.jsx`

**Change 1 — Replace the intro panel with a 5-point appraisal scale on the stuck-thoughts screen.**

Ginny called out that the current intro is confusing: the Kai quote followed by *"tap any thoughts that feel true for you"* doesn't read coherently — she had to re-read multiple times to figure out what to do. Stephanie's fix: drop the standalone intro panel and put the 5-point appraisal scale directly on the stuck-thoughts selection screen.

For each preset stuck thought, alongside the thought itself, ask:
- **How often do you have this thought?** (5-point scale)
- **How strongly do you believe this thought is true?** (5-point scale)

Anchors for both scales: 1 = Never / Not at all, 2 = Rarely / A little, 3 = Sometimes / Somewhat, 4 = Often / Mostly, 5 = Always / Completely.

Stephanie noted these *"may fit with the pretest appraisal questions"* — keep that compatibility in mind. The pretest doc as locked doesn't include this exact appraisal instrument (Beck Hopelessness, ASCS, UCLA, Need to Belong, BPB, Belonging sliders, Expectation slider are the locked scales). If a separate appraisal scale exists elsewhere in the planning materials, align anchors to that; otherwise the anchors above are the working values.

The kid then explicitly selects which thoughts they want to work on (suggested: any thought rated ≥ 3 on either scale is eligible; the kid picks from the eligible set).

Remove the standalone Kai-quote intro panel entirely. If a brief intro is still needed, fold it into the appraisal screen as a single header line — but don't restate the Kai context, it's confusing.

**Change 2 — Restore the three challenge prompts.**

Stephanie's PPT slide 12 lists three prompts for the challenge strategy. The current build appears to only show one. Restore all three, displayed together as scaffolding above a single open-ended response field (not three separate inputs):

> - Is there another way I can think about this?
> - Is this really true, or can I think of a way it isn't true?
> - Is this thought helping me, and if not, what is a thought that might be more helpful?

**Change 3 — Rename "Fight it" → "Challenge it" throughout.**

Stephanie's request — more clinically standard. Every UI label, button, and saved-data key that says "fight" or "fight_it" becomes "challenge" or "challenge_it." The "both/and" strategy stays as-is.

**Data shape:**
- Appraisal scores (frequency, believability) saved per stuck thought. New fields on the activity payload.
- Strategy key rename from `fight_it` to `challenge_it`. Demo-only, no migration needed.

**Version bump:** MAJOR.

**Open question (not blocking — build text for now):** Stephanie asked whether the strategy explanation should be audio/video rather than text. Build text; we can swap to video later without restructuring the form.

---

*End of 2026-05-11 batch. After all five ship, Josh announces one stopping point to the team for batched review.*

-->

---
