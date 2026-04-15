# Ready! Set! Dedicate! — Interactive Activities Documentation
**Project:** SSI Platform — Ready! Set! Dedicate! (Adoption Readiness Belongingness Intervention for Youth)  
**Status:** 6 Activities Specced — Clinical Sources Confirmed  
**Last Updated:** April 2026

> **Note on Component Code**  
> This document contains full clinical documentation, props interfaces, and output contracts for all six activities. Component code sections are placeholders until retrieved from the project repository or built fresh. Activities marked ⚠️ REBUILD have prior demo versions that do not match the confirmed clinical design and must be rebuilt.

---

## Table of Contents
1. [Design System & Shared Conventions](#1-design-system--shared-conventions)
2. [Getting Unstuck With Thoughts](#2-getting-unstuck-with-thoughts) — Stephanie
3. [Allies / Safety Net](#3-allies--safety-net) — Stephanie
4. [Self-Reflection Exercise](#4-self-reflection-exercise) — Dr. Sprang
5. [Belonging Skills Sort](#5-belonging-skills-sort) — Dr. Sprang
6. [Who I Am Poem](#6-who-i-am-poem) — Dr. Sprang
7. [Letter to Another Youth](#7-letter-to-another-youth)
8. [Shared Word Bank Reference](#8-shared-word-bank-reference)
9. [Pull-Forward Token Reference](#9-pull-forward-token-reference)

---

## 1. Design System & Shared Conventions

All six activities share a consistent design language and behavioral contract. Any new activity added to Ready! Set! Dedicate! should follow these conventions.

### Tailwind Palette
| Role | Class | Use |
|---|---|---|
| Page background | `amber-50` | App shell background |
| Card background | `white` | Activity cards, form cards |
| Card shadow | `shadow-md` or `shadow-lg` | All floating cards |
| Card radius | `rounded-2xl` | All cards |
| Primary text | `slate-800` | Body copy |
| Secondary text | `slate-500` | Labels, hints, secondary |
| Selected state | `amber-200` bg + `amber-900` text | Chips, cards when selected |
| Unselected chip | `slate-100` bg + `slate-700` text | Word bank pills default |
| Primary button | `amber` solid fill | Save, submit, proceed |
| Destructive/remove | `slate-100` — NOT red | Never use alarming colors |
| Pull-forward block | `amber-50` bg + `amber-300` left border | Highlighted prior session content |
| Progress indicator | Small dots or bar, `amber` for current | Top of each activity |
| Warning/inspect | `amber-100` bg + `amber-700` text | Safety net inspection prompts |

### Behavioral Conventions
- **Minimal free text** — scaffolded selection preferred; free text only where clinically necessary
- **No scoring or performance evaluation** — framing is always awareness, never right/wrong
- **All tap targets minimum 44–48px height** — mobile first, 375px+ viewport
- **onSave callback** — every activity accepts an `onSave(data)` prop that fires when youth saves output
- **initialStep prop** — every activity accepts `initialStep` for demo/testing purposes
- **No API calls** — all activities are fully offline and self-contained
- **Single file per component** — no external dependencies beyond React and Tailwind
- **custom_activity item type** — all six activities register in the platform's component registry

### Shared Props Interface
```typescript
interface ActivityProps {
  onSave?: (data: ActivityOutput) => void;  // defaults to console.log
  initialStep?: number;                      // defaults to 1
  sessionData?: SessionData;                 // for pull-forward where applicable
}
```

### Component Registry (Delivery App)
```javascript
const ACTIVITY_REGISTRY = {
  GettingUnstuck:       GettingUnstuck,
  AlliesSafetyNet:      AlliesSafetyNet,
  SelfReflection:       SelfReflection,
  BelongingSkillsSort:  BelongingSkillsSort,
  WhoIAmPoem:           WhoIAmPoem,
  LetterBuilder:        LetterBuilder,
};
```

---

## 2. Getting Unstuck With Thoughts

**File:** `GettingUnstuck.jsx`  
**Clinical Source:** Stephanie  
**Clinical Target:** Identifying and challenging unhelpful appraisals related to belonging  
**SSI Strategy Bucket:** Developing healthy appraisals  
**Item Type:** `custom_activity` → `GettingUnstuck`  
**Status:** ⚠️ REBUILD — prior demo version (BothAndBuilder) does not match confirmed clinical design  
**Est. Time:** ~5 min

### Clinical Purpose
Youth in out-of-home care often have "stuck thoughts" that block their sense of belonging — unhelpful or untrue appraisals that have become habitual. This activity helps youth identify which stuck thoughts apply to them, then choose a strategy to get unstuck: either challenging the thought directly (CBT cognitive restructuring) or using the Both/And reframe (dialectical acknowledgment). The dual-strategy approach is clinically important — not every stuck thought is simply untrue, and youth need both tools.

### Mechanic
Three-step flow:
1. **Select stuck thoughts** — youth tap any thoughts from a grid that feel true for them (multiple selection allowed). Framing is validating, not pathologizing.
2. **Choose a strategy per thought** — for each selected thought, youth choose one of two approaches:
   - **Fight it** — "Is there another way I can think about this? Is this really true?" → free text response
   - **Both/And it** — "This thought might have a piece of truth, but it leaves out other truths." → structured Both/And sentence builder
3. **Review and save** — all responses displayed as a formatted summary card

### Props
```typescript
interface GettingUnstuckProps {
  onSave?: (data: GettingUnstuckOutput) => void;
  initialStep?: number; // 1 | 2 | 3
}
```

### Output Contract
```typescript
interface GettingUnstuckOutput {
  activity: "getting_unstuck";
  stuck_thought_ids: string[];
  responses: UnstuckResponse[];
  saved_at: string;
}

interface UnstuckResponse {
  thought_id: string;
  thought_text: string;
  strategy: "fight" | "both_and";
  fight_response?: string;          // free text — present if strategy === "fight"
  and_statement?: string;           // assembled Both/And — present if strategy === "both_and"
}
```

### Pull-Forward Usage
`responses[].and_statement` feeds into:
- Letter Builder Section 3 (toggle: include/exclude)
- Action Plan (planned)

### Stuck Thoughts List
> ⚠️ Clinical team to confirm final list — content below is drawn from Stephanie's slides and ARBIY clinical framework

| ID | Text |
|---|---|
| st1 | "I'll never fit in here." |
| st2 | "My foster/adoptive family isn't my real family." |
| st3 | "A lot of people have given up on me in the past." |
| st4 | "Nobody really understands what I've been through." |
| st5 | "I can't trust people because things always change." |
| st6 | "I have to figure everything out on my own." |
| st7 | "I don't want to get my hopes up." |
| st8 | "People treat me differently because of my story." |

### Both/And Examples (shown as prompts during strategy step)
- "My foster family isn't my real family AND there can still be a place for them in my life"
- "I feel like no one understands me AND there are ways I can help people get to know me more"
- "A lot of people have given up on me in the past AND it doesn't mean everyone will"

### Intro Copy (from Stephanie's slides)
> "Like Kai said, it is usual to sometimes feel 'stuck' and like it is impossible to feel like we belong. And usually when we feel this way, there are certain thoughts that are keeping us 'stuck.'"

---

### Component Code

> **⚠️ Code to be built**  
> Prior demo version (BothAndBuilder) does not match this clinical design. Build fresh from spec above.

```jsx
// GettingUnstuck.jsx
// TO BE BUILT
```

---

## 3. Allies / Safety Net

**File:** `AlliesSafetyNet.jsx`  
**Clinical Source:** Stephanie  
**Clinical Target:** Identifying and building a supportive, caring network  
**SSI Strategy Bucket:** Creating opportunities to belong  
**Item Type:** `custom_activity` → `AlliesSafetyNet`  
**Status:** ⚠️ REBUILD — prior demo version (AllyMapBuilder) does not match confirmed clinical design  
**Est. Time:** ~5 min

### Clinical Purpose
Moves youth from the abstract idea of "having support" to a concrete, categorized picture of who is in their corner and what kind of support each person provides. Critically, this activity also helps youth evaluate the *health* of their relationships — identifying and removing allies whose characteristics describe unhealthy dynamics. The three support categories (Instrumental, Emotional, Social) are clinically grounded and align with the psychoeducation content delivered by Kai in the video segment.

### Key Difference from Prior Demo Version
The prior AllyMapBuilder organized allies by *relationship type* (teacher, coach, etc.). Stephanie's confirmed design organizes allies by *support type* (Instrumental/Practical, Emotional, Social). This is a meaningful clinical distinction — it focuses youth on what the relationship provides, not what label it has.

### Mechanic
Four-step flow:
1. **Build your net** — youth name up to 5 allies (first name/nickname only) and drag each into one or more support type buckets: Instrumental/Practical, Emotional, Social. An ally can appear in multiple buckets.
2. **Inspect your net** — for each ally, youth are asked a gatekeeping question: does this person usually get you into trouble, try to keep you from other people, frequently lie to you, or make you feel afraid? If yes, youth remove them. Framing is non-judgmental — "these characteristics describe an unhealthy relationship" not "this person is bad."
3. **Strengthen your net** — for each support category with only one person (or none), youth are prompted: is there someone who could fill this role? If yes, who? What could you do to encourage that support? If no, a validating message encourages them to stay open.
4. **View your net** — final visual display of the completed safety net with all allies and their support types.

### Branching Logic
```
For each support category (Instrumental, Emotional, Social):
  IF count >= 2 → skip to next category
  IF count === 1 → show "Is there anyone who could also provide this support?"
    IF yes/maybe → "Who? What could you do to encourage this?"
    IF no → validating message + continue
  IF count === 0 → same as count === 1 path
```

### Props
```typescript
interface AlliesSafetyNetProps {
  onSave?: (data: AlliesSafetyNetOutput) => void;
  initialStep?: number; // 1 | 2 | 3 | 4
}
```

### Output Contract
```typescript
interface AlliesSafetyNetOutput {
  activity: "allies_safety_net";
  allies: AllyRecord[];
  removed_allies: AllyRecord[];       // allies removed during inspection step
  gaps_identified: GapRecord[];       // support categories with < 2 people
  saved_at: string;
}

interface AllyRecord {
  name: string;                       // first name or nickname only
  support_types: SupportType[];       // one or more of the three types
}

interface GapRecord {
  support_type: SupportType;
  potential_ally?: string;            // name entered if youth identified someone
  action?: string;                    // what youth would do to encourage support
}

type SupportType = "instrumental" | "emotional" | "social";
```

### Support Type Definitions (shown to youth)
| Type | Label | Description |
|---|---|---|
| `instrumental` | Instrumental / Practical Support | Help you solve problems, teach you things, or make sure you have what you need |
| `emotional` | Emotional Support | Help you feel good about yourself, listen to you, or help you cope with hard feelings |
| `social` | Social Support | You feel like you can be yourself around them, or they help you feel less alone |

### Unhealthy Relationship Flags (Inspection Step)
Youth are asked if any ally:
- Usually gets you into trouble
- Tries to keep you from talking to or getting close to other people
- Frequently lies to you
- Makes you feel afraid

### Pull-Forward Usage
`allies` (filtered, post-inspection) feeds into:
- Letter Builder Section 4 (first ally name and support type, toggle: include/exclude)
- Action Plan (planned)

---

### Component Code

> **⚠️ Code to be built**  
> Prior demo version (AllyMapBuilder) does not match this clinical design. Build fresh from spec above.

```jsx
// AlliesSafetyNet.jsx
// TO BE BUILT
```

---

## 4. Self-Reflection Exercise

**File:** `SelfReflection.jsx`  
**Clinical Source:** Dr. Sprang  
**Clinical Target:** Exploring experiences of inclusion and exclusion; identifying associated thoughts and feelings  
**SSI Strategy Bucket:** Enhancing motivations to belong  
**Item Type:** `custom_activity` → `SelfReflection`  
**Status:** 🔲 To be built  
**Est. Time:** ~4 min

### Clinical Purpose
Grounds the intervention in the youth's own lived experience of belonging. By recalling both a time they felt included *and* a time they felt excluded, youth access the emotional reality of belonging before moving into skill-building. The side-by-side thoughts/feelings format (not a single text field) is clinically intentional — it prompts youth to separate cognitive and affective responses, which is foundational for the CBT appraisal work that follows.

### Mechanic
Two-part sequential flow — inclusion memory first, exclusion memory second. Each part follows the same two-screen pattern:

**Screen A:** "Think of a time you felt included — a time you really felt like you belonged. Write a few sentences about that experience."
→ Free text field

**Screen B:** "What thoughts and feelings were associated with that experience?"
→ Two-column input: Thoughts (left) | Feelings (right)

Then repeats for an exclusion memory ("a time you felt excluded — a time you felt like you did not belong").

### Props
```typescript
interface SelfReflectionProps {
  onSave?: (data: SelfReflectionOutput) => void;
  initialStep?: number; // 1 | 2 | 3 | 4
}
```

### Output Contract
```typescript
interface SelfReflectionOutput {
  activity: "self_reflection";
  inclusion: ReflectionEntry;
  exclusion: ReflectionEntry;
  saved_at: string;
}

interface ReflectionEntry {
  memory: string;           // free text description of the experience
  thoughts: string;         // free text — left column
  feelings: string;         // free text — right column
}
```

### Pull-Forward Usage
`exclusion.thoughts` and `exclusion.feelings` feed into:
- Getting Unstuck With Thoughts (informs which stuck thoughts feel relevant) — planned
- Action Plan (planned)

### Layout Note
The thoughts/feelings screen uses a `two_column` layout — two equal side-by-side text areas on tablet/desktop, stacked on mobile. Labels are simple: "Thoughts" and "Feelings." No word banks — this is open reflection.

---

### Component Code

```jsx
// SelfReflection.jsx
// TO BE BUILT
```

---

## 5. Belonging Skills Sort

**File:** `BelongingSkillsSort.jsx`  
**Clinical Source:** Dr. Sprang  
**Clinical Target:** Identifying belonging-promoting behaviors; self-assessment of current practice  
**SSI Strategy Bucket:** Competencies for belonging  
**Item Type:** `custom_activity` → `BelongingSkillsSort`  
**Status:** 🔲 To be built  
**Est. Time:** ~3 min

### Clinical Purpose
Makes belonging-promoting behaviors concrete and personally relevant. Rather than presenting a list of skills to learn, this activity asks youth to sort behaviors they already know into buckets based on where they are right now — which shifts the frame from deficit ("here's what you need to learn") to agency ("here's what you're already doing"). The "willing to try" bucket creates a natural bridge to action planning.

### Mechanic
Single-step drag-and-drop sort. Youth drag each of 7 belonging-promoting behaviors from a source list into one of two buckets: "What I'm already doing" or "What I'm willing to try." Items don't have to be placed — an implicit third state is "not for me right now" (unplaced).

### Props
```typescript
interface BelongingSkillsSortProps {
  onSave?: (data: BelongingSkillsSortOutput) => void;
  initialStep?: number; // 1
}
```

### Output Contract
```typescript
interface BelongingSkillsSortOutput {
  activity: "belonging_skills_sort";
  already_doing: string[];    // behavior IDs
  willing_to_try: string[];   // behavior IDs
  unplaced: string[];         // behavior IDs — not placed in either bucket
  saved_at: string;
}
```

### Behaviors List (from Dr. Sprang's slides)
| ID | Behavior |
|---|---|
| bs1 | Active listening / attention (smiling and eye contact) |
| bs2 | Using inclusive language |
| bs3 | Expressing gratitude |
| bs4 | Providing support to others |
| bs5 | Creating space for belonging |
| bs6 | Reducing belonging uncertainty |
| bs7 | Effective conflict resolution |

### Pull-Forward Usage
`willing_to_try` feeds into:
- Action Plan (planned) — pre-populates "what I want to work on"
- Letter Builder Section 5 (planned)

---

### Component Code

```jsx
// BelongingSkillsSort.jsx
// TO BE BUILT
```

---

## 6. Who I Am Poem

**File:** `WhoIAmPoem.jsx`  
**Clinical Source:** Dr. Sprang (George Ella Lyons format)  
**Clinical Target:** Identity affirmation; self-agency; celebrating unique personality, strengths, and cultural background  
**SSI Strategy Bucket:** Competencies for belonging; enhancing motivations to belong  
**Item Type:** `custom_activity` → `WhoIAmPoem`  
**Status:** 🔲 To be built  
**Est. Time:** ~5 min

### Clinical Purpose
Grounded in George Ella Lyons' "Where I'm From" poem format, adapted for belonging and identity work with this population. By completing structured sentence starters, youth produce a personalized identity artifact — a poem that is entirely their own words, assembled into something they can keep. The act of authoring something about themselves (rather than answering questions about themselves) is a deliberate self-agency move. The repeating "I am" line across both stanzas creates a sense of continuity and self-recognition.

### Mechanic
Two-stanza poem builder. Each stanza is presented one prompt at a time (or all at once — TBD based on UX testing). Youth complete each sentence starter with their own text. Required prompts must be filled before advancing; optional prompts can be skipped. The completed poem is rendered as a formatted keepsake card at the end.

The "I am" line from stanza 1 auto-populates the closing line of each stanza — youth write it once, it echoes.

### Props
```typescript
interface WhoIAmPoemProps {
  onSave?: (data: WhoIAmPoemOutput) => void;
  initialStep?: number; // 1 | 2 | 3 (stanza 1 | stanza 2 | keepsake view)
}
```

### Output Contract
```typescript
interface WhoIAmPoemOutput {
  activity: "who_i_am_poem";
  stanza_1: PoemStanza;
  stanza_2: PoemStanza;
  full_poem_text: string;   // complete assembled poem as plain text
  saved_at: string;
}

interface PoemStanza {
  i_am: string;             // required — echoed at end of each stanza
  i_wonder: string;         // required
  i_fear?: string;          // optional
  i_suffer_when?: string;   // optional
  i_want: string;           // required — stanza 1 only
  i_understand?: string;    // stanza 2
  i_believe?: string;       // stanza 2
  i_dream?: string;         // stanza 2
  i_try: string;            // required — stanza 2 only
  i_hope: string;           // required — stanza 2 only
}
```

### Stanza Structure (from Dr. Sprang's slides)

**Stanza 1**
| Starter | Hint | Required |
|---|---|---|
| I am | Two special characteristics you have | ✅ |
| I wonder | Something you are actually curious about | ✅ |
| I fear | Something you are afraid of | Optional |
| I suffer when | An event that makes you sad or angry | Optional |
| I want | An actual desire | ✅ |
| I am | *(repeat first line — auto-filled)* | ✅ |

**Stanza 2**
| Starter | Hint | Required |
|---|---|---|
| I understand | Something you know | ✅ |
| I believe | Something you believe in | Optional |
| I dream | Something you actually dream about | Optional |
| I try | Something you really make an effort about | ✅ |
| I hope | Something you actually hope for | ✅ |
| I am | *(repeat first line — auto-filled)* | ✅ |

### Pull-Forward Usage
`full_poem_text` feeds into:
- Session closing/keepsake screen (planned)
- Companion app handoff payload (planned)

---

### Component Code

```jsx
// WhoIAmPoem.jsx
// TO BE BUILT
```

---

## 7. Letter to Another Youth

**File:** `LetterBuilder.jsx`  
**Clinical Source:** Confirmed in ARBIY intervention structure (Step 7)  
**Clinical Target:** Meaning-making; self-agency; full-session synthesis  
**SSI Strategy Bucket:** Enhancing motivations to belong; competencies for belonging  
**Item Type:** `custom_activity` → `LetterBuilder`  
**Status:** ✅ Demo complete — pull-forward references updated for new activity set  
**Est. Time:** ~5 min

### Clinical Purpose
The closing activity of the SSI. By writing to a future youth rather than reflecting on themselves, youth become the expert — a deliberate self-agency move grounded in the "helper therapy principle." The letter synthesizes everything from the session into a single meaningful artifact. Pull-forward means large sections are already substantially written from earlier activity outputs, so the letter reflects the youth's own voice and choices back to them.

### Mechanic
Six guided sections, one per screen, each with:
- A sentence starter (pre-filled, editable)
- An optional word bank (tap to append — additive, not replacement)
- A short free text field (100–200 char max depending on section)
- Character count remaining

Sections 3 and 4 auto-populate from Getting Unstuck and Allies/Safety Net outputs respectively, with a toggle to include/exclude the pull-forward content.

Final letter renders as a formatted "keepsake" card with fixed opening and closing lines.

### Letter Structure
| Section | Prompt | Pull-Forward Source |
|---|---|---|
| 1 — Why I'm writing | "Start by telling them why you wrote this letter" | None |
| 2 — The real talk | "What would you want them to know about how hard belonging can feel?" | None |
| 3 — The Both/And | "Two things can be true at the same time" | Getting Unstuck `responses[0].and_statement` |
| 4 — People in your corner | "Tell them about finding support" | Allies/Safety Net `allies[0]` |
| 5 — What I want you to do | "Give them one piece of advice" | None |
| 6 — One last thing | "End with something warm" | None |

### Fixed Letter Framing (not editable)
**Opening:** "To a young person who needs to hear this,"  
**Closing:** "You've got this. And now you know — you're not alone. — Someone who gets it"

### Props
```typescript
interface LetterBuilderProps {
  onSave?: (data: LetterOutput) => void;
  initialStep?: number;  // 1–7
  sessionData?: {
    getting_unstuck?: GettingUnstuckOutput | null;
    allies_safety_net?: AlliesSafetyNetOutput | null;
  };
}
```

### Output Contract
```typescript
interface LetterOutput {
  activity: "letter_builder";
  sections: {
    s1_why_writing: string;
    s2_real_talk: string;
    s3_both_and: string;
    s4_people: string;
    s5_advice: string;
    s6_last_thing: string;
  };
  pull_forward_used: {
    getting_unstuck: boolean;
    allies_safety_net: boolean;
  };
  full_letter_text: string;
  saved_at: string;
}
```

### Word Banks by Section

**Section 1 — Why I'm writing**
- "belonging is possible, even when it feels far away"
- "you matter more than you might think right now"
- "things can change, even when they feel stuck"
- "you don't have to figure this out alone"
- "your story isn't over"

**Section 2 — The real talk**
- "life has thrown a lot of changes at you"
- "it can feel like everyone else has something figured out that you don't"
- "trusting people takes time, especially when things have changed a lot"
- "you're carrying more than most people know"
- "the world doesn't always make it easy"
- "it can feel like you have to hide parts of yourself"

**Section 5 — What I want you to do**
- "look for one person who makes you feel safe, and let them know you appreciate them"
- "notice one moment this week when you felt like you belonged, even a little"
- "remind yourself that two things can be true at once"
- "reach out to someone in your corner, even with something small"
- "give it time — belonging can grow slowly"
- "remember that you get to decide what belonging means for you"

**Section 6 — One last thing**
- "you are worth knowing"
- "your story matters"
- "you belong here, even when it doesn't feel like it"
- "better days are possible"
- "someone out there is rooting for you"
- "you are already doing the hard work"

### Important UX Note
Word bank pills are **additive** — tapping appends text to the text area at cursor position (or end). Youth should feel like they are authoring, not filling in blanks. This is a deliberate clinical choice — voice ownership matters for this activity.

---

### Component Code

> **⚠️ Code to be retrieved**  
> Demo version exists in prior Claude Code session. Pull-forward references need updating for new activity set before integration.

```jsx
// LetterBuilder.jsx
// RETRIEVE FROM CLAUDE CODE SESSION — update pull-forward refs
```

---

## 8. Shared Word Bank Reference

All word bank and clinical content is owned by the clinical team and must be reviewed before any participant-facing deployment.

### Content Review Checklist
- [ ] Stuck thoughts list (GettingUnstuck) — ⚠️ clinical team to confirm final list
- [ ] Both/And examples (GettingUnstuck) — reviewed by Stephanie
- [ ] Support type definitions (AlliesSafetyNet) — reviewed by Stephanie
- [ ] Unhealthy relationship flags (AlliesSafetyNet) — reviewed by Stephanie
- [ ] Belonging behaviors list (BelongingSkillsSort) — reviewed by Dr. Sprang
- [ ] Poem stanza prompts and hints (WhoIAmPoem) — reviewed by Dr. Sprang
- [ ] Letter section word banks (LetterBuilder) — initial pass complete, clinical review needed
- [ ] Language reviewed for age-appropriateness (11–17 range) — ✅ designed for this range
- [ ] Language reviewed for cultural humility — initial pass complete, clinical review needed
- [ ] Language reviewed for LGBTQ inclusivity — initial pass complete, clinical review needed

---

## 9. Pull-Forward Token Reference

The pull-forward system connects activity outputs across the session so earlier work surfaces in later activities automatically.

### Current Pull-Forward Connections
```
GettingUnstuck.output.responses[0].and_statement
  → LetterBuilder Section 3 (toggle: include/exclude)
  → Action Plan [PLANNED]

AlliesSafetyNet.output.allies[0].name
AlliesSafetyNet.output.allies[0].support_types[0]
  → LetterBuilder Section 4 (toggle: include/exclude)
  → Action Plan [PLANNED]

BelongingSkillsSort.output.willing_to_try[]
  → Action Plan [PLANNED]
  → LetterBuilder Section 5 [PLANNED]

SelfReflection.output.exclusion.thoughts
  → GettingUnstuck (informs stuck thought relevance) [PLANNED]

WhoIAmPoem.output.full_poem_text
  → Session closing/keepsake screen [PLANNED]
  → Companion app handoff payload [PLANNED]

LetterBuilder.output.full_letter_text
  → Session closing screen [PLANNED]
  → Companion app handoff payload [PLANNED]
```

### Token Syntax (Platform-Level)
```
{{response.getting_unstuck.responses.0.and_statement}}
{{response.allies_safety_net.allies.0.name}}
{{response.belonging_skills_sort.willing_to_try}}
{{response.self_reflection.exclusion.thoughts}}
{{response.who_i_am_poem.full_poem_text}}
```

### Session Data Shape
```javascript
{
  getting_unstuck: {
    activity: "getting_unstuck",
    stuck_thought_ids: ["st2", "st5"],
    responses: [
      {
        thought_id: "st2",
        thought_text: "My foster/adoptive family isn't my real family.",
        strategy: "both_and",
        and_statement: "My foster/adoptive family isn't my real family AND there can still be a place for them in my life"
      },
      {
        thought_id: "st5",
        thought_text: "I can't trust people because things always change.",
        strategy: "fight",
        fight_response: "Some people have stayed. Coach Davis has been there for two years."
      }
    ],
    saved_at: "2026-04-14T..."
  },
  allies_safety_net: {
    activity: "allies_safety_net",
    allies: [
      { name: "Coach Davis", support_types: ["emotional", "social"] },
      { name: "Ms. Johnson", support_types: ["instrumental"] }
    ],
    removed_allies: [],
    gaps_identified: [],
    saved_at: "2026-04-14T..."
  },
  self_reflection: {
    activity: "self_reflection",
    inclusion: {
      memory: "When the theatre crew celebrated on opening night...",
      thoughts: "I belong here. These people get me.",
      feelings: "Happy, relieved, surprised"
    },
    exclusion: {
      memory: "When I moved schools and no one talked to me at lunch...",
      thoughts: "I'll never fit in. No one wants to know me.",
      feelings: "Lonely, embarrassed, angry"
    },
    saved_at: "2026-04-14T..."
  },
  belonging_skills_sort: {
    activity: "belonging_skills_sort",
    already_doing: ["bs1", "bs3"],
    willing_to_try: ["bs4", "bs5"],
    unplaced: ["bs2", "bs6", "bs7"],
    saved_at: "2026-04-14T..."
  },
  who_i_am_poem: {
    activity: "who_i_am_poem",
    stanza_1: {
      i_am: "someone who keeps going no matter what",
      i_wonder: "why some things feel easy for others but hard for me",
      i_fear: "being forgotten",
      i_want: "a place that actually feels like home"
    },
    stanza_2: {
      i_understand: "I've survived things I didn't think I could",
      i_try: "to keep my walls down even when it's scary",
      i_hope: "I'll find my people"
    },
    full_poem_text: "I am someone who keeps going no matter what\n...",
    saved_at: "2026-04-14T..."
  },
  letter_builder: {
    activity: "letter_builder",
    sections: { s1_why_writing: "...", s2_real_talk: "...", ... },
    pull_forward_used: { getting_unstuck: true, allies_safety_net: true },
    full_letter_text: "To a young person who needs to hear this,\n...",
    saved_at: "2026-04-14T..."
  }
}
```

---

*This document is a living reference. All content marked ⚠️ requires clinical team sign-off before participant-facing deployment. Component code sections to be populated from the project repository or built fresh per spec.*
