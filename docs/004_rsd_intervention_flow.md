# Ready! Set! Dedicate! — Intervention Flow Map
**Document:** 004_rsd_intervention_flow.md  
**Purpose:** Concrete section and item definitions for Supabase seed data  
**Status:** Draft — awaiting clinical team review  
**Last Updated:** April 2026

This document maps the full RSD session into sections and items using the platform's
data model. Every row here becomes a database record. The Builder will eventually
manage this content — but for the first deployment, this is the seed data we apply
manually after Phase 0 schema migration.

---

## Session Overview

| # | Section | Type | Est. Time | Key Items |
|---|---|---|---|---|
| 0 | Welcome | `intro` | ~1 min | Intro text, context setting |
| 1 | Pretest Measures | `psychometric` | ~4 min | 5 validated scales |
| 2 | Psychoeducation — Part 1 | `psychoeducation` | ~4 min | Kai video (All About Belonging) |
| 3 | Self-Reflection | `activity` | ~4 min | SelfReflection custom activity |
| 4 | Psychoeducation — Part 2 | `psychoeducation` | ~3.5 min | Kai video (Skills for Belonging) |
| 5 | Getting Unstuck | `activity` | ~5 min | GettingUnstuck custom activity |
| 6 | Building Your Safety Net | `activity` | ~5 min | AlliesSafetyNet custom activity |
| 7 | Belonging Skills | `activity` | ~3 min | BelongingSkillsSort custom activity |
| 8 | Who I Am | `activity` | ~5 min | WhoIAmPoem custom activity |
| 9 | Action Plan | `activity` | ~3 min | structured_activity (TBD fields) |
| 10 | Letter to Another Youth | `activity` | ~5 min | LetterBuilder custom activity |
| 11 | Closing | `outro` | ~2 min | Summary, keepsake display |
| 12 | Posttest Measures | `psychometric` | ~4 min | Same 5 scales, post token_keys |

**Total estimated time: ~48 min**  
*(Target per ARBIY spec: ~45–50 min)*

---

## Section 0 — Welcome

**Type:** `intro`  
**Purpose:** Orient the participant, set expectations, reduce anxiety about the session.

| order | type | token_key | Notes |
|---|---|---|---|
| 0 | `text_prompt` | — | Heading: "Welcome to Ready! Set! Dedicate!" — brief intro copy about the session |
| 1 | `text_prompt` | — | "Here's what to expect" — time estimate, what they'll do, that there are no right/wrong answers |
| 2 | `page_break` | — | "Let's get started →" |

---

## Section 1 — Pretest Measures

**Type:** `psychometric`  
**Purpose:** Establish baseline on all proximal outcome measures before any intervention content.  
**IRB note:** All items `mode: "research_only"` — nothing displayed to participant.

| order | type | token_key | Scale | Items |
|---|---|---|---|---|
| 0 | `psychometric_scale` | `hopelessness_pre` | Beck Hopelessness Scale | 4 items |
| 1 | `psychometric_scale` | `self_agency_pre` | Overall Sense of Control (OSOC) | TBD |
| 2 | `psychometric_scale` | `belong_stress_pre` | Stress Related to Belongingness | 1–2 items |
| 3 | `psychometric_scale` | `fear_rejection_pre` | Need to Belong — Fear of Rejection | 3 items |
| 4 | `psychometric_scale` | `appraisals_pre` | Unhelpful Appraisals | TBD — JE drafting |
| 5 | `psychometric_scale` | `belong_behaviors_pre` | Belonging-Promoting Behaviors | TBD — Jessica drafting |
| 6 | `page_break` | — | Transition to psychoeducation — warm framing |

> **⚠️ Pending:** Item content for OSOC, appraisals, and belonging-promoting behaviors scales not yet finalized. Placeholders in Builder until clinical team delivers final items.

---

## Section 2 — Psychoeducation Part 1

**Type:** `psychoeducation`  
**Purpose:** Deliver "All About Belonging" content via Kai video + brief reflection.  
**Source:** Kai psychoeducation script (ARBIY doc) — Part I, ~4 min

| order | type | token_key | Notes |
|---|---|---|---|
| 0 | `text_prompt` | — | Brief intro: "First, meet Kai — someone who gets it." |
| 1 | `video` | `kai_video_1` | Vimeo: Kai Part I — All About Belonging (~4 min). required_completion: true |
| 2 | `text_prompt` | — | "What stood out to you? Keep that in mind as we continue." |
| 3 | `page_break` | — | Transition to self-reflection |

---

## Section 3 — Self-Reflection Exercise

**Type:** `activity`  
**Purpose:** Ground the session in the youth's own belonging experiences before skill-building.  
**Clinical source:** Dr. Sprang

| order | type | token_key | Notes |
|---|---|---|---|
| 0 | `text_prompt` | — | Brief framing: "Before we go further, let's start with you." |
| 1 | `custom_activity` | `self_reflection` | Component: SelfReflection — inclusion + exclusion memories, thoughts/feelings |
| 2 | `page_break` | — | Transition to Part 2 video |

---

## Section 4 — Psychoeducation Part 2

**Type:** `psychoeducation`  
**Purpose:** Deliver "Skills for Belonging" content via Kai video.  
**Source:** Kai psychoeducation script (ARBIY doc) — Part II, ~3.5 min

| order | type | token_key | Notes |
|---|---|---|---|
| 0 | `video` | `kai_video_2` | Vimeo: Kai Part II — Skills for Belonging (~3.5 min). required_completion: true |
| 1 | `text_prompt` | — | "Now let's put some of these ideas into practice." |
| 2 | `page_break` | — | Transition to activities |

---

## Section 5 — Getting Unstuck With Thoughts

**Type:** `activity`  
**Purpose:** Identify and challenge unhelpful appraisals related to belonging.  
**Clinical source:** Stephanie

| order | type | token_key | Notes |
|---|---|---|---|
| 0 | `text_prompt` | — | Intro copy from Stephanie's slides: "Like Kai said, sometimes certain thoughts keep us stuck..." |
| 1 | `custom_activity` | `getting_unstuck` | Component: GettingUnstuck — thought selection + fight/both-and strategy per thought |
| 2 | `page_break` | — | Affirming transition: "That's real work. Let's keep going." |

---

## Section 6 — Building Your Safety Net

**Type:** `activity`  
**Purpose:** Identify, evaluate, and strengthen the participant's support network.  
**Clinical source:** Stephanie

| order | type | token_key | Notes |
|---|---|---|---|
| 0 | `text_prompt` | — | Intro: "Now let's think about the people in your corner." Support type definitions recap. |
| 1 | `custom_activity` | `allies_safety_net` | Component: AlliesSafetyNet — build, inspect, strengthen, view |
| 2 | `page_break` | — | Transition |

---

## Section 7 — Belonging Skills Sort

**Type:** `activity`  
**Purpose:** Self-assess belonging-promoting behaviors — what I'm doing, what I'm willing to try.  
**Clinical source:** Dr. Sprang

| order | type | token_key | Notes |
|---|---|---|---|
| 0 | `text_prompt` | — | Intro: "You just learned about belonging skills. Let's see where you are with them." |
| 1 | `custom_activity` | `belonging_skills_sort` | Component: BelongingSkillsSort — drag and drop sort |
| 2 | `page_break` | — | Transition |

---

## Section 8 — Who I Am Poem

**Type:** `activity`  
**Purpose:** Identity affirmation through structured creative expression.  
**Clinical source:** Dr. Sprang (George Ella Lyons format)

| order | type | token_key | Notes |
|---|---|---|---|
| 0 | `text_prompt` | — | Intro: "This next part is about you — who you are, what you carry, what you hope for." |
| 1 | `custom_activity` | `who_i_am_poem` | Component: WhoIAmPoem — two-stanza poem builder, keepsake output |
| 2 | `page_break` | — | Affirming transition before action planning |

---

## Section 9 — Action Plan

**Type:** `activity`  
**Purpose:** Translate session insights into one concrete commitment.  
**Note:** Field configuration TBD — clinical team to specify. Pull-forward from BelongingSkillsSort `willing_to_try` and AlliesSafetyNet `allies`.

| order | type | token_key | Notes |
|---|---|---|---|
| 0 | `text_prompt` | — | Intro: "You've done a lot today. Let's make one concrete plan." |
| 1 | `structured_activity` | `action_plan` | Fields TBD — at minimum: goal (pull-forward from willing_to_try), who can help (pull-forward from allies), when |
| 2 | `page_break` | — | Transition to letter |

> **⚠️ Pending:** Clinical team to specify action plan field configuration. Placeholder `structured_activity` item until confirmed.

---

## Section 10 — Letter to Another Youth

**Type:** `activity`  
**Purpose:** Session synthesis and meaning-making through the helper therapy principle.

| order | type | token_key | Notes |
|---|---|---|---|
| 0 | `text_prompt` | — | Framing: "You've learned a lot today. Now share it." Helper therapy principle explained briefly. |
| 1 | `custom_activity` | `letter_builder` | Component: LetterBuilder — 6 sections, pull-forward from getting_unstuck + allies_safety_net |
| 2 | `page_break` | — | Transition to closing |

---

## Section 11 — Closing

**Type:** `outro`  
**Purpose:** Celebrate completion, display keepsakes, set up post-session follow-through.

| order | type | token_key | Notes |
|---|---|---|---|
| 0 | `text_prompt` | — | "You did it." — warm completion message |
| 1 | `text_prompt` | — | Display Who I Am poem keepsake (pull-forward: `{{response.who_i_am_poem.full_poem_text}}`) |
| 2 | `text_prompt` | — | Display letter keepsake (pull-forward: `{{response.letter_builder.full_letter_text}}`) |
| 3 | `text_prompt` | — | "One more thing before you go..." — transition to posttest framing |
| 4 | `page_break` | — | "Almost done →" |

---

## Section 12 — Posttest Measures

**Type:** `psychometric`  
**Purpose:** Administer same measures as pretest. token_keys use `_post` suffix.  
**IRB note:** All items `mode: "research_only"`. Order matches pretest.

| order | type | token_key | Scale |
|---|---|---|---|
| 0 | `psychometric_scale` | `hopelessness_post` | Beck Hopelessness Scale |
| 1 | `psychometric_scale` | `self_agency_post` | Overall Sense of Control (OSOC) |
| 2 | `psychometric_scale` | `belong_stress_post` | Stress Related to Belongingness |
| 3 | `psychometric_scale` | `fear_rejection_post` | Need to Belong — Fear of Rejection |
| 4 | `psychometric_scale` | `appraisals_post` | Unhelpful Appraisals |
| 5 | `psychometric_scale` | `belong_behaviors_post` | Belonging-Promoting Behaviors |
| 6 | `text_prompt` | — | "Thank you for completing Ready! Set! Dedicate! — final warm message" |

---

## Open Items Before This Can Be Seeded

| Item | Owner | Status |
|---|---|---|
| OSOC scale items and anchors | Clinical team | ⚠️ Pending |
| Belong stress measure items | Clinical team | ⚠️ Pending |
| Unhelpful appraisals scale items | JE | ⚠️ In progress |
| Belonging-promoting behaviors scale | Jessica | ⚠️ In progress |
| Action plan field configuration | Clinical team | ⚠️ Pending |
| Stuck thoughts final list | Stephanie | ⚠️ Pending |
| Kai video Vimeo URLs | Production team | ⚠️ Not yet produced |
| Intro and transition copy (all sections) | Clinical team | ⚠️ Draft needed |
| Closing copy | Clinical team | ⚠️ Draft needed |

---

## Token Key Reference (Full Session)

| token_key | Section | Type | Pull-forward target |
|---|---|---|---|
| `hopelessness_pre` | 1 | psychometric_scale | — |
| `self_agency_pre` | 1 | psychometric_scale | — |
| `belong_stress_pre` | 1 | psychometric_scale | — |
| `fear_rejection_pre` | 1 | psychometric_scale | — |
| `appraisals_pre` | 1 | psychometric_scale | — |
| `belong_behaviors_pre` | 1 | psychometric_scale | — |
| `kai_video_1` | 2 | video | — |
| `kai_video_2` | 4 | video | — |
| `self_reflection` | 3 | custom_activity | → getting_unstuck (planned) |
| `getting_unstuck` | 5 | custom_activity | → letter_builder s3 |
| `allies_safety_net` | 6 | custom_activity | → letter_builder s4, action_plan |
| `belonging_skills_sort` | 7 | custom_activity | → action_plan |
| `who_i_am_poem` | 8 | custom_activity | → closing display |
| `action_plan` | 9 | structured_activity | — |
| `letter_builder` | 10 | custom_activity | → closing display |
| `hopelessness_post` | 12 | psychometric_scale | — |
| `self_agency_post` | 12 | psychometric_scale | — |
| `belong_stress_post` | 12 | psychometric_scale | — |
| `fear_rejection_post` | 12 | psychometric_scale | — |
| `appraisals_post` | 12 | psychometric_scale | — |
| `belong_behaviors_post` | 12 | psychometric_scale | — |

---

*This document is the bridge between the clinical spec and the database. Once open items above are resolved, this becomes the Phase 2 seeding script.*
