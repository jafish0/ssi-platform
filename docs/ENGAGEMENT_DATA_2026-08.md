# Engagement data — what the study promises vs. what the app records

**Date:** 2026-08-15 (Draft 79 — read-only recon, zero production changes)
**Grounding:** every claim below was verified against a real completed session —
the Draft 68 QA run, session `302722b5-baeb-428b-8fdd-3cabbd9418ef`
(ready-set-dedicate v5, started 01:01:12Z, completed 01:20:08Z, 57/57 responses) —
plus the deployed component/edge-function sources. Numbers quoted are that
session's actual data.

**The promise being audited** (participant-flow doc, IRB language):
"intervention engagement data (activity content, video watch, time on task)."

---

## 1. What one completed session actually captures today

The single most useful structural fact: **every item writes a response row when
the participant advances past it — including non-question items.** A
`text_prompt` saves `{viewed: true}`, a `page_break` saves `{advanced: true}`,
a video saves its payload on Continue. Each row carries `responded_at` (first
save) and `updated_at` (last save, touched on re-save/revisit). So a completed
session is not just answers — it is an ordered, timestamped trail of every
screen the participant moved through.

### 1a. Activity content — RICH (promise met)

Per-activity payloads, one line each (all present in the cited session):

| Activity (token) | What the payload captures |
|---|---|
| `self_reflection` | inclusion + exclusion memories, thoughts, feelings (6 free texts) |
| `getting_unstuck` | per-appraisal (a1–a6 + optional other): truth rating 0–4, selected?, strategy (challenge/both_and), response text |
| `allies_safety_net` | ally list w/ support types, explicit "none for X" flags, inspect removals, inspection_completed, per-type strengthen entries (person/action/skipped) |
| `belonging_skills_sort` | already_doing / willing_to_try / not_interested buckets + unplaced (distinguishes skipped from declined) |
| `who_i_am_poem` | all 8 poem fields, keyed |
| `action_plan` (structured) | all fields + `pull_forward_included` |
| `letter_builder` | full letter text |
| psychometric scales (×15 pre/post) | per-sub-item responses + computed score + display_shown |
| free texts (×2 post) | text, char_count, word_bank_used, pull_forward_included |
| `assent` choice | selection (a No exits via `exit_on` and still records the choice + session status) |

Everything flows into the SPSS wide export + codebook (`exportFlatten.js`),
with a full-JSON fallback column per activity so nothing is lost.

### 1b. Video engagement — SPLIT BY HOSTING (this is Monday's Q4)

What a video item saves depends entirely on where the video is hosted:

- **Vimeo path** (what live v5's two Kai items use today — still the
  `_placeholder: true` config awaiting final production URLs):
  `{watched, completion_fraction, play_count}`. This is REAL watch data:
  Vimeo's postMessage events feed play counts and a monotonic max
  percent-watched; `watched` = fraction ≥ the authored threshold (0.85 on
  both Kai items). Gating already exists as a config flag
  (`required_completion` — currently `false`, so Continue is never locked).
  In the cited session both Kai items saved
  `{watched: false, play_count: 0, completion_fraction: 0}` — the QA run
  clicked past without playing, and the record faithfully says so.
- **YouTube path** (Draft 67 — the Sam variant cuts and any `youtube_id`
  item): saves `{watched: null, completion_fraction: null, play_count: null,
  source: 'youtube', video_id, variant_used?}`. The nulls are deliberate: a
  plain YouTube embed reports nothing without the IFrame API, so the record
  honestly says "shown, not measured" (and exports as SPSS missing, not
  zero). Which variant played IS captured (`variant_used`, plus the gating
  choice item's own token). `required_completion` is unenforceable — the
  component fails open by design (VideoPlayer.jsx:96–103).
- **Addendum (2026-08-15, post-Draft 80):** video payloads live in the
  responses table and the admin Long/Summary exports, but the researcher
  wide CSV / SPSS syntax / codebook emitted **no columns for video items
  at all** — `exportFlatten.js` skipped the type despite a comment saying
  otherwise (pre-existing gap found in the Draft 80 review). **Closed
  same day:** `exportFlatten.js` now emits `<tk>_watched` /
  `<tk>_completion_fraction` / `<tk>_play_count` / `<tk>_variant_used`
  for every token_key'd video item, blank-safe — YouTube's deliberate
  nulls, pre-variant rows, and unreached items all export as blanks,
  which SPSS reads as missing (never zero). `variant_used` in the wide
  CSV is the cut that *actually played* (fallback-resolved), so analysts
  no longer have to infer it from the choice item's pick. Also note:
  Draft 80 shipped engine parity, so Vimeo watch tracking + gating now
  work on variant-selected videos too — the "Vimeo has it today" option
  in §2 covers the Sam variants as well, not just single-source items.

### 1c. Time on task — DERIVABLE (better than expected)

What exists, per level:

- **Session:** `started_at`, `completed_at`, `last_active_at` → total
  wall-clock span. Cited session: 18m 55s.
- **Per screen:** because every advance saves a row, the delta between
  consecutive `responded_at` values ≈ dwell on the later screen (the save
  fires at the moment of advancing off it). This is not a proxy that needs
  building — it is already recorded. Demonstrated per-section derivation on
  the cited session (pure SQL over existing rows):

  | Section | Duration | | Section | Duration |
  |---|---|---|---|---|
  | Assent | 0:37 | | Your safety net | 0:39 |
  | Welcome | 0:22 | | Belonging skills | 5:31 |
  | A few quick questions | 1:39 | | Who I am | 0:35 |
  | All About Belonging (video 1) | 2:09 | | Your plan | 2:05 |
  | Your story | 0:54 | | A letter | 0:03 |
  | Skills for Belonging (video 2) | 0:42 | | You did it | 0:37 |
  | Getting unstuck | 2:07 | | Wrap-up questions | 0:48 |

  (QA click-through durations — the point is the derivation, not the values.)
- **Honest limits, stated plainly:** idle-vs-active cannot be distinguished
  (a kid staring at the ceiling and a kid reading look identical); a resume
  break inflates exactly one delta (the item spanning the break) — trim or
  winsorize in analysis; back-navigation only surfaces when a revisit
  re-saves (visible as `updated_at` > `responded_at`, which the cited
  session shows on two screens); the first item's dwell is measured from
  `started_at`.

### 1d. Navigation / attrition — ADEQUATE

- **Where a kid stopped:** `sessions.status` (`in_progress` / `completed` /
  `abandoned`) + `current_section` (section-granular, synced on every
  section transition by `update-session-progress`) + `last_active_at` (when),
  plus the response trail shows the exact last item saved.
- **Assent declines:** recorded (the No selection saves, the session
  completes via the exit rule) — decline-at-assent is distinguishable from
  mid-program abandonment.
- **Resume counts: NOT recorded.** Resume-by-code (Draft 69) deliberately
  doesn't bump `use_count` on resume, and nothing else counts re-entries. A
  long `responded_at` gap suggests a break but can't distinguish
  resume-after-close from idling. (`sessions.metadata_json` exists and is
  empty `{}` — a natural home if a counter is ever wanted.)
- **Within-session back/forward navigation:** not recorded (no event log).

---

## 2. Gap analysis against the promise

| Promised | Status today |
|---|---|
| Activity content | **Recorded** — rich, structured, export-mapped |
| Video watch | **Split:** recorded for Vimeo-hosted items (percent watched, plays, threshold flag); **NOT recorded** for YouTube-hosted items (explicit nulls; variant shown is recorded) |
| Time on task | **Derivable with modest analysis effort** — per-screen dwell from existing timestamps; total + per-section + per-item all computable; idle-vs-active not distinguishable (no system can, honestly) |

### Gap: video watch — the options, with honest costs

This is the same decision as Monday's open question #4 (video gating), and
they should be decided **as one**, because the same piece of engineering
unlocks both:

1. **YouTube IFrame API route.** What it buys: play/pause events and
   percent-watched for YouTube-hosted videos (parity with today's Vimeo
   payload) AND the ability to gate Continue on watch percentage — Q4's
   gating is unenforceable without it. What it costs: a real implementation
   draft (load the API script, replace the bare iframe with a controlled
   player, poll currentTime/duration since YouTube has no timeupdate event,
   iOS testing) — comparable in size to Draft 67, plus the UX decision of
   whether gating means locked (Vimeo-style `required_completion`) or
   encouraged. One build covers all nine v6 video items.
2. **Cheap proxy — time-on-screen.** Already recorded (the `responded_at`
   delta across the video item; cited session: 1m54s on the video-1 screen).
   Zero build. Measures screen dwell, NOT watching — a kid can mute and
   scroll past, or watch twice; it can't tell.
3. **Accept the beta-level answer.** "Video shown, variant recorded, watch
   not measured" (nulls in the export make the non-measurement explicit).
   Zero build.

**The hosting decision comes first.** If the final Kai production cuts land
on **Vimeo**, watch tracking exists TODAY and gating is a one-line config
change per item (`required_completion: true`) — option 1 is only needed for
the YouTube-hosted Sam variant cuts. If everything standardizes on
**YouTube** (where the Sam variants already live), option 1 is the only
route to the promised "video watch" data. Recommendation for a
20-participant beta: put the hosting question and the gating question on
the table together Monday; if the team wants either watch data or gating on
YouTube-hosted items, build the IFrame API once (it delivers both); if
neither, adopt option 3 explicitly and note it in the IRB continuing-review
language ("video presentation recorded; watch duration not captured").

### Gap: time on task — is a per-render timestamp worth building?

No. Because every screen saves on advance, the previous item's save time IS
(to within network latency) the current item's arrival time — the derived
delta is already arrival-to-departure dwell, not an approximation of it. A
per-item-render timestamp would only tighten the two edge cases (first item
of a sitting; item spanning a resume break), which analysis can flag from
the session timestamps anyway. Recommendation: no code; write the dwell
derivation into the analysis plan (the SQL in §1c is the template), with a
winsorize rule for resume-spanning deltas.

### Gap: resume counts (unpromised, but adjacent)

Not recorded. If the team decides re-entry frequency matters for the beta,
the cheap future change is a counter bump in `validate-code`'s resume branch
into `sessions.metadata_json` — deferred unless someone asks for it.

---

## 3. Bottom line for Monday

- **Activity content:** promise met, nothing to decide.
- **Time on task:** promise met via derivation, nothing to build — document
  the derivation in the analysis plan.
- **Video watch:** genuinely open, and it is ONE decision with Q4, not two:
  *where do the final videos live, and do we gate on watching them?*
  Vimeo → tracking exists, gating is config. YouTube → one IFrame-API build
  buys both tracking and gating for all nine v6 videos, or the team
  explicitly accepts "shown + variant" as the beta answer.
