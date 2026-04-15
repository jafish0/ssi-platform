# SSI Platform — Item Type `content_json` Schemas
**Document:** 002_item_type_schemas_v3.md  
**Phase:** 0 — Foundation  
**Status:** ✅ Architect sign-off complete — ready to implement  
**Changes from v2:** custom_activity type added, open questions 1 & 2 closed, RSD activity mapping updated, SQL constraint fix noted

---

## Conventions

- All fields marked `// REQUIRED` must be present for the Delivery App to render the item
- All fields marked `// OPTIONAL` have a documented default if absent
- `{{token_key}}` syntax in text strings is resolved at render time by the Delivery App
- The `token_key` column on the `items` table identifies *this item's output* for pull-forward
- `{{...}}` references inside content strings pull from *other items' outputs*
- Scoring is always computed server-side (Edge Function or export layer) — never in the browser

---

## Item Types

| # | Type | Has Input | Clinical Use |
|---|---|---|---|
| 1 | `psychometric_scale` | ✅ Rating | Pre/post measures, embedded assessment |
| 2 | `video` | ❌ | Psychoeducation, testimonials |
| 3 | `text_prompt` | ❌ | Instructions, teaching segments |
| 4 | `free_text` | ✅ Text | Open reflection, letter sections |
| 5 | `structured_activity` | ✅ Multi-field | Action plans, simple multi-field activities |
| 6 | `guided_creative` | ✅ Structured stanzas | Poem builder, keepsake artifacts |
| 7 | `choice` | ✅ Selection | Preference, psychoeducation checks |
| 8 | `page_break` | ❌ | Pacing, transitions |
| 9 | `custom_activity` | ✅ Varies | Complex activities with bespoke React components |

---

## ⚠️ SQL Migration Fix Required

The `items_type_check` constraint in `001_ssi_platform_schema.sql` must be updated to match
this type list. The original migration has `action_plan` which is replaced by `structured_activity`.
Apply this fix in the Supabase SQL Editor after running the original migration:

```sql
ALTER TABLE items DROP CONSTRAINT items_type_check;

ALTER TABLE items ADD CONSTRAINT items_type_check
  CHECK (type IN (
    'psychometric_scale',
    'video',
    'text_prompt',
    'free_text',
    'structured_activity',
    'guided_creative',
    'choice',
    'page_break',
    'custom_activity'
  ));
```

---

## 1. `psychometric_scale`

Administers a validated rating scale. Two modes: `research_only` (raw data, nothing shown to
participant) and `display_score` (score computed server-side at response-save time and returned
to the app for display).

**Pre/post pattern:** The same scale definition appears in two items — one early (pretest) and
one late (posttest). Distinguished by `token_key` on the `items` table only (e.g. `hopelessness_pre`
vs `hopelessness_post`). The `content_json` is identical for both.

```jsonc
{
  // REQUIRED
  "scale_name": "Beck Hopelessness Scale (4-item)",
  "instructions": "For each statement, please select the response that best describes how you have been feeling over the past week.",
  "mode": "research_only",         // "research_only" | "display_score"
  "format": "likert",              // "likert" | "vas" | "binary"
  "items": [
    {
      "id": "bhs1",
      "text": "My future seems dark to me.",
      "reverse_scored": false       // Flags item for server-side score inversion
    },
    {
      "id": "bhs2",
      "text": "I might as well give up because I can't make things better.",
      "reverse_scored": false
    }
  ],

  // REQUIRED for format: "likert"
  "anchors": {
    "min_value": 0,
    "max_value": 3,
    "min_label": "Not at all true for me",
    "max_label": "Very true for me",
    "show_midpoint_label": false,
    "midpoint_label": ""
  },

  // OPTIONAL — for format: "vas"
  "vas_config": {
    "min_value": 0,
    "max_value": 100,
    "min_label": "Not at all",
    "max_label": "Extremely",
    "step": 1
  },

  // REQUIRED only when mode: "display_score"
  "scoring": {
    "method": "sum",               // "sum" | "mean" — subscale logic handled server-side
    "min_possible": 0,
    "max_possible": 12,
    "display_label": "Your score",
    "interpretation_bands": [      // Optional: label score ranges for participant display
      { "min": 0,  "max": 3,  "label": "Low", "color": "green" },
      { "min": 4,  "max": 8,  "label": "Moderate", "color": "amber" },
      { "min": 9,  "max": 12, "label": "High", "color": "red" }
    ],
    "display_message": "Here's how you scored. There are no right or wrong answers."
  },

  // OPTIONAL — display
  "display_one_at_a_time": false,
  "randomize_order": false,
  "show_progress": true
}
```

**Response value shape:**
```jsonc
{
  "scale_responses": {
    "bhs1": 2,
    "bhs2": 1
  },
  "computed_score": 3,              // null if mode: "research_only"
  "display_shown": false            // true if score was shown to participant
}
```

---

## 2. `video`

Renders a Vimeo embedded player. Supports context text before and after. Completion tracking for IRB.

```jsonc
{
  // REQUIRED
  "vimeo_url": "https://vimeo.com/123456789",
  "title": "Meet Kai — Building Your Inner Circle",

  // OPTIONAL
  "context_before": "Before you watch, take a breath. This video is about someone a lot like you.",
  "context_after": "What stood out to you? Keep that in mind as we continue.",
  "required_completion": true,
  "completion_threshold": 0.85,     // Fraction of video that counts as "watched"
  "autoplay": false,
  "show_controls": true,
  "caption_track_url": ""
}
```

**Response value shape:**
```jsonc
{
  "watched": true,
  "completion_fraction": 0.91,
  "play_count": 1
}
```

---

## 3. `text_prompt`

Display-only instructional or psychoeducational text. No participant input. Supports pull-forward token interpolation.

```jsonc
{
  // REQUIRED
  "body": "You mentioned earlier that {{response.getting_unstuck.responses.0.and_statement}}. That kind of thinking takes real strength.",

  // OPTIONAL
  "heading": "Something to think about",
  "format": "standard",             // "standard" | "callout" | "pull_forward_highlight"
  "show_continue_button": true,
  "continue_label": "Keep going →"
}
```

**Response value shape:**
```jsonc
{ "viewed": true }
```

---

## 4. `free_text`

Multi-line text area for open participant writing.

```jsonc
{
  // REQUIRED
  "prompt": "What would you want them to know about how hard belonging can feel?",

  // OPTIONAL
  "sentence_starter": "Something I'd want you to know is...",
  "placeholder": "Start writing here — there are no wrong answers.",
  "min_chars": 0,
  "max_chars": 500,
  "show_char_count": true,
  "word_bank": [
    { "id": "wb1", "text": "life has thrown a lot of changes at you" },
    { "id": "wb2", "text": "you're carrying more than most people know" }
  ],
  "word_bank_label": "Need a nudge? Tap to add:",
  "word_bank_mode": "append",       // "append" (additive) | "replace" (replaces field)
  "pull_forward": {
    "token": "{{response.getting_unstuck.responses.0.and_statement}}",
    "label": "From your Getting Unstuck earlier:",
    "user_can_exclude": true
  },
  "rows": 5
}
```

**Response value shape:**
```jsonc
{
  "text": "Something I'd want you to know is that things can change...",
  "word_bank_used": ["wb1"],
  "pull_forward_included": true,
  "char_count": 247
}
```

---

## 5. `structured_activity`

Flexible multi-field container for simpler clinical activities. Each SSI defines its own fields.
For activities with complex mechanics (branching, visual interactions, multi-step flows),
use `custom_activity` instead.

**Supported field types:** `free_text`, `single_choice`, `multiple_choice`, `number_input`, `rating`, `drag_and_drop`

```jsonc
{
  // REQUIRED
  "title": "My Belonging Plan",
  "instructions": "Fill in each piece. This plan is yours to keep.",
  "fields": [

    // --- free_text field ---
    {
      "id": "ap_goal",
      "label": "One belonging skill I want to work on:",
      "type": "free_text",
      "placeholder": "e.g. reach out to someone in my corner",
      "max_chars": 200,
      "required": true,
      "token_key": "action_goal",
      "pull_forward": {
        "token": "{{response.belonging_skills_sort.willing_to_try.0}}",
        "label": "From your skills sort:",
        "user_can_exclude": true
      }
    },

    // --- single_choice field ---
    {
      "id": "ap_when",
      "label": "I'll try this by:",
      "type": "single_choice",
      "options": [
        { "id": "aw1", "text": "Today" },
        { "id": "aw2", "text": "This week" },
        { "id": "aw3", "text": "This month" }
      ],
      "required": true
    },

    // --- multiple_choice field ---
    {
      "id": "ap_barriers",
      "label": "What might get in the way? (Select all that apply)",
      "type": "multiple_choice",
      "options": [
        { "id": "ab1", "text": "Not knowing how to start" },
        { "id": "ab2", "text": "Feeling nervous" },
        { "id": "ab3", "text": "Not having the right person around" },
        { "id": "ab4", "text": "Not having enough time" }
      ],
      "max_selections": null,
      "required": false
    },

    // --- number_input field ---
    {
      "id": "ap_confidence",
      "label": "How confident are you that you'll try this? (1–10)",
      "type": "number_input",
      "min": 1,
      "max": 10,
      "step": 1,
      "required": true
    },

    // --- rating field ---
    {
      "id": "ap_readiness",
      "label": "How ready do you feel to work on belonging right now?",
      "type": "rating",
      "min_value": 1,
      "max_value": 5,
      "min_label": "Not ready",
      "max_label": "Very ready",
      "required": true
    },

    // --- drag_and_drop field ---
    {
      "id": "ap_sort",
      "label": "Sort these supports into what feels most useful to you right now.",
      "type": "drag_and_drop",
      "items": [
        { "id": "dd1", "text": "Talking to someone in my safety net" },
        { "id": "dd2", "text": "Practicing a belonging skill this week" },
        { "id": "dd3", "text": "Noticing moments I feel like I belong" }
      ],
      "buckets": [
        { "id": "b_now",   "label": "I'll do this now" },
        { "id": "b_later", "label": "I'll do this later" }
      ],
      "allow_unplaced": true,
      "token_key": "ap_support_sort",
      "required": false
    }

  ],

  // OPTIONAL
  "layout": "single_column",        // "single_column" | "two_column"
  "completion_message": "That's your plan. It belongs to you.",
  "pull_forward": {
    "target_field_id": "ap_goal",
    "token": "{{response.belonging_skills_sort.willing_to_try.0}}",
    "label": "From your skills sort:",
    "user_can_exclude": true
  }
}
```

**Response value shape:**
```jsonc
{
  "fields": {
    "ap_goal": "Practice active listening with Coach Davis",
    "ap_when": "aw2",
    "ap_barriers": ["ab2"],
    "ap_confidence": 7,
    "ap_readiness": 4,
    "ap_sort": {
      "b_now":   ["dd1"],
      "b_later": ["dd2"],
      "unplaced": ["dd3"]
    }
  },
  "pull_forward_included": { "ap_goal": true }
}
```

---

## 6. `guided_creative`

Produces a formatted artifact (poem, letter, keepsake card) from structured prompted inputs.
Each prompt becomes a line or stanza. Output is rendered as a finished creative piece — not a form.

**Clinical use:** "Who I Am" poem (George Ella Lyons format, Dr. Sprang).

```jsonc
{
  // REQUIRED
  "title": "Who I Am",
  "artifact_type": "poem",          // "poem" | "letter" | "card"
  "instructions": "Complete each line. Don't overthink it — your first answer is usually the truest one.",
  "stanzas": [
    {
      "id": "stanza_1",
      "prompts": [
        { "id": "p1", "starter": "I am",        "hint": "two special things about you",             "max_chars": 80, "required": true },
        { "id": "p2", "starter": "I wonder",    "hint": "something you're genuinely curious about", "max_chars": 80, "required": true },
        { "id": "p3", "starter": "I fear",      "hint": "something that worries you",               "max_chars": 80, "required": false },
        { "id": "p4", "starter": "I suffer when","hint": "something that makes you sad or angry",   "max_chars": 80, "required": false },
        { "id": "p5", "starter": "I want",      "hint": "something you actually desire",            "max_chars": 80, "required": true },
        {
          "id": "p1_repeat",
          "starter": "I am",
          "hint": "repeat your first line",
          "max_chars": 80,
          "required": true,
          "pull_forward_from": "p1"   // Auto-fills from stanza 1 p1 — youth write it once
        }
      ]
    },
    {
      "id": "stanza_2",
      "prompts": [
        { "id": "p7",  "starter": "I understand", "hint": "something you know to be true",        "max_chars": 80, "required": true },
        { "id": "p8",  "starter": "I believe",    "hint": "something you believe in",             "max_chars": 80, "required": false },
        { "id": "p9",  "starter": "I dream",      "hint": "something you actually dream about",   "max_chars": 80, "required": false },
        { "id": "p10", "starter": "I try",        "hint": "something you make a real effort at",  "max_chars": 80, "required": true },
        { "id": "p11", "starter": "I hope",       "hint": "something you actually hope for",      "max_chars": 80, "required": true },
        {
          "id": "p1_repeat_2",
          "starter": "I am",
          "hint": "repeat your first line one more time",
          "max_chars": 80,
          "required": true,
          "pull_forward_from": "p1"
        }
      ]
    }
  ],

  // OPTIONAL
  // Word banks can be per-prompt (keyed by prompt id) or global (key: "__global__")
  // Per-prompt banks take precedence over global when both are present
  "word_banks": {
    "__global__": [                  // Available on any prompt without its own bank
      { "id": "g1", "text": "still figuring things out" },
      { "id": "g2", "text": "trying my best" }
    ],
    "p3": [                          // Prompt-specific bank overrides global for p3
      { "id": "wb1", "text": "being left out" },
      { "id": "wb2", "text": "things changing too fast" }
    ]
  },
  "artifact_framing": {
    "header": "",
    "footer": ""
  },
  "completion_message": "That's your poem. It's yours to keep."
}
```

**Response value shape:**
```jsonc
{
  "prompts": {
    "p1": "someone who keeps going no matter what",
    "p2": "why some things feel easy for others but hard for me",
    "p3": "being forgotten",
    "p5": "a place that actually feels like home",
    "p1_repeat": "someone who keeps going no matter what",
    "p7": "I've survived things I didn't think I could",
    "p10": "to keep my walls down even when it's scary",
    "p11": "I'll find my people",
    "p1_repeat_2": "someone who keeps going no matter what"
  },
  "full_artifact_text": "I am someone who keeps going no matter what\nI wonder why some things...",
  "word_bank_used": ["wb1"]
}
```

---

## 7. `choice`

Single or multiple choice. Used for psychoeducation checks, preference selection, and light branching.

```jsonc
{
  // REQUIRED
  "prompt": "Which of these feels most true for you right now?",
  "options": [
    { "id": "c1", "text": "I feel like I belong somewhere" },
    { "id": "c2", "text": "I'm still looking for my place" },
    { "id": "c3", "text": "It depends on where I am" },
    { "id": "c4", "text": "I'm not sure" }
  ],
  "selection_type": "single",       // "single" | "multiple"

  // OPTIONAL
  "max_selections": null,
  "display_style": "card_grid",     // "card_grid" | "list" | "chip_row"
  "show_none_option": false,
  "randomize_order": false,
  "scoring": {
    "c1": 3,
    "c2": 1,
    "c3": 2,
    "c4": 0
  },
  "branching": null                 // Reserved for Phase 3+ skip logic
}
```

**Response value shape:**
```jsonc
// single:
{ "selected": "c2" }

// multiple:
{ "selected": ["c1", "c3"] }
```

---

## 8. `page_break`

Pacing and transition element. No input. Advances participant to next screen or section.

```jsonc
{
  // ALL OPTIONAL — valid with empty object {}
  "heading": "You're halfway there.",
  "body": "Take a breath. The next part is about the people in your corner.",
  "continue_label": "I'm ready →",
  "show_progress": true,
  "animation": "fade"               // "fade" | "slide" | "none"
}
```

**Response value shape:**
```jsonc
{ "advanced": true }
```

---

## 9. `custom_activity`

Escape hatch for activities whose mechanics cannot be expressed in `structured_activity` config —
complex visual interactions, multi-step flows with branching, bespoke clinical designs.

The `component_name` maps to a named React component in the Delivery App's component registry.
The Builder renders a dropdown of registered component names plus a JSON props editor for admins.

```jsonc
{
  // REQUIRED
  "component_name": "AlliesSafetyNet",  // Must exactly match a key in ACTIVITY_REGISTRY

  // OPTIONAL — passed directly as props to the component
  "props": {
    "max_allies": 5,
    "show_action_prompts": true
  }
}
```

**Delivery App component registry:**
```javascript
// src/lib/activityRegistry.js
import GettingUnstuck      from '../activities/GettingUnstuck';
import AlliesSafetyNet     from '../activities/AlliesSafetyNet';
import SelfReflection      from '../activities/SelfReflection';
import BelongingSkillsSort from '../activities/BelongingSkillsSort';
import WhoIAmPoem          from '../activities/WhoIAmPoem';
import LetterBuilder       from '../activities/LetterBuilder';

export const ACTIVITY_REGISTRY = {
  GettingUnstuck,
  AlliesSafetyNet,
  SelfReflection,
  BelongingSkillsSort,
  WhoIAmPoem,
  LetterBuilder,
};
```

**Delivery App renderer (inside item renderer switch):**
```javascript
case 'custom_activity': {
  const Component = ACTIVITY_REGISTRY[item.content_json.component_name];
  if (!Component) {
    return <ActivityNotFound name={item.content_json.component_name} />;
  }
  return (
    <Component
      {...(item.content_json.props || {})}
      onSave={(data) => handleResponse(item.id, data)}
      sessionData={sessionData}
    />
  );
}
```

**Response value shape:**
```jsonc
// Shape varies by component — each custom activity defines its own output contract.
// See RSD_Activities_Documentation.md for per-component output contracts.
// The platform stores whatever object the component passes to onSave().
```

---

## Pre/Post Psychometric Pattern

The same scale `content_json` is used for both pretest and posttest items. The two items are
distinguished only by their `token_key` on the `items` table:

```
Item 1: type=psychometric_scale, token_key="hopelessness_pre",  order_index=0
Item 2: type=psychometric_scale, token_key="hopelessness_post", order_index=N
```

Builder UI should offer a "Copy as posttest" button — clones the item, appends `_post` to the
`token_key`, and places it at the end of the session flow.

**Known RSD measures (as of April 2026):**

| Measure | Items | token_key prefix | Notes |
|---|---|---|---|
| Beck Hopelessness Scale | 4 | `hopelessness` | Pre/post |
| Overall Sense of Control (OSOC) | TBD | `self_agency` | Pre/post |
| Stress Related to Belongingness | 1–2 | `belong_stress` | Pre/post |
| Need to Belong — Fear of Rejection | 3 | `fear_rejection` | Pre/post |
| Unhelpful Appraisals | TBD | `appraisals` | Pre/post — JE drafting |
| Belonging-Promoting Behaviors | TBD | `belong_behaviors` | Pre/post — Jessica drafting |

---

## RSD Activities Mapped to Item Types

| Activity | Item Type | Component | Status |
|---|---|---|---|
| Getting Unstuck With Thoughts | `custom_activity` | `GettingUnstuck` | ⚠️ Rebuild |
| Allies / Safety Net | `custom_activity` | `AlliesSafetyNet` | ⚠️ Rebuild |
| Self-Reflection Exercise | `custom_activity` | `SelfReflection` | 🔲 Build |
| Belonging Skills Sort | `custom_activity` | `BelongingSkillsSort` | 🔲 Build |
| Who I Am Poem | `custom_activity` | `WhoIAmPoem` | 🔲 Build |
| Letter to Another Youth | `custom_activity` | `LetterBuilder` | ✅ Retrieve + update |
| Action Plan | `structured_activity` | — | ⚠️ Fields TBD |

---

## Resolved Decisions

| Question | Decision |
|---|---|
| Complex activity renderer (Ally Map, Belonging Game) | `custom_activity` escape hatch — named React component in registry |
| Scoring in-app vs server-side | Server-side always. `display_score` mode triggers Edge Function at response-save time |
| Reverse scoring | Flagged per item in `content_json`; computed server-side only |
| `guided_creative` word banks | Both global (`__global__`) and per-prompt (keyed by prompt id) supported. Per-prompt takes precedence |
| `action_plan` type | Renamed `structured_activity` — field config is project-defined |

---

*This document is the authoritative spec for: Builder form config, Delivery App renderer switch statement, TypeScript interfaces, Zod validation schemas, and Edge Function scoring logic.*
