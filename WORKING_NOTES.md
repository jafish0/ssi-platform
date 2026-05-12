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

_(none — Draft 9 shipped as commit `70d117b`, summarized under that entry in Recently shipped above)_

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
