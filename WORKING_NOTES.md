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

_(none — 2026-05-11 batch shipped as commit `7b7046e`, archived verbatim under that entry in Recently shipped)_

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
