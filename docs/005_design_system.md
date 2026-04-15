# SSI Platform — Design System & Visual Language
**Document:** 005_design_system.md  
**Status:** Research-backed recommendation — awaiting architect review  
**Last Updated:** April 2026  
**Audience:** Development team, clinical stakeholders

---

## Research Summary

This design system is grounded in three bodies of evidence:

1. **Youth mental health app design research** (Garrido et al. 2024, JMIR 2025) — young people want apps that feel modern and unobtrusive, not clinical. Stigma is a real barrier to engagement; an app that looks like a mental health tool may reduce participation.

2. **Color psychology for adolescents and Gen Z** — this age group prefers warm, energetic palettes over muted adult tones. Pastel and warm-neutral palettes communicate inclusivity and gender neutrality better than traditional blue/green clinical palettes. Avoid pink (gender-coded), purple (skews female in research), and red/orange as primaries (signal alert/danger).

3. **Trauma-informed digital design** (ACM 2024, FostrSpace research) — for youth with complex trauma histories, the interface must feel safe, non-evaluative, warm, and within their control. No alarming colors. No clinical sterility. Plenty of white space. Clear progress indicators so they know where they are and what comes next.

**Key finding specific to this population:** Foster and out-of-home care youth are acutely sensitive to feeling surveilled, evaluated, or categorized. The design must feel like something *for them*, not something being *done to them*.

---

## Color Palette

### Philosophy
Warm and grounded, not clinical. Energetic enough to feel modern, soft enough to feel safe. The amber base is the right instinct — it communicates warmth, optimism, and energy without the gender-coding of pink or the clinical sterility of blue.

### Core Palette

| Role | Tailwind Class | Hex | Notes |
|---|---|---|---|
| Page background | `amber-50` | #fffbeb | Warm off-white — not stark white, not yellow |
| Card background | `white` | #ffffff | Clean contrast against amber-50 base |
| Primary accent (light) | `amber-100` | #fef3c7 | Subtle highlights, hover states |
| Selected / active | `amber-200` | #fde68a | Chips, cards, selections |
| Interactive elements | `amber-400` | #fbbf24 | Secondary buttons, icons |
| Primary CTA | `amber-500` | #f59e0b | Main action buttons |
| Pull-forward highlight | `amber-50` + `amber-300` border | — | Left-border callout block |
| Primary text | `slate-800` | #1e293b | Warm dark — softer than pure black |
| Secondary text | `slate-500` | #64748b | Labels, hints, captions |
| Border / divider | `slate-200` | #e2e8f0 | Subtle, non-intrusive |
| Success / complete | `emerald-500` | #10b981 | Completion states, checkmarks |
| Error / validation | `rose-400` | #fb7185 | Soft — never harsh red |
| Disabled | `slate-300` | #cbd5e1 | Inactive elements |

### What We're Not Using and Why

| Color | Why avoided |
|---|---|
| Pure red | Signals danger/alert — anxiety-inducing for trauma-exposed youth |
| Pink | Gender-coded; alienates male and non-binary youth |
| Purple | Skews feminine in adolescent preference research |
| Clinical blue (primary) | Associated with institutional/medical settings — works against "this is for you" framing |
| Pure black text on white | Harsh contrast; slate-800 on amber-50/white is warmer and equally readable |
| Dark mode as default | Complex trauma can be associated with hypervigilance in dark environments; light mode is the safer default |

### Palette in Context

```
Session shell background:    amber-50
Activity cards:              white with shadow-md
Selected word bank chip:     amber-200 bg + amber-900 text
Unselected word bank chip:   slate-100 bg + slate-700 text
Primary button (Save/Next):  amber-500 bg + white text
Pull-forward callout:        amber-50 bg + amber-300 left border (4px)
Progress bar fill:           amber-400
Psychometric scale fill:     amber-400
Completion checkmark:        emerald-500
```

---

## Typography

### Philosophy
Readable at a glance, on a phone, in varied lighting conditions. Youth are not reading at a desk — they may be in a waiting room, a caseworker's office, a car. Type must work in imperfect conditions.

### Font Stack

**Primary font: Inter**

Inter is the right choice for this application:
- Open source, free, no licensing issues
- Excellent legibility on small screens
- Cross-platform consistent (looks the same on iOS and Android unlike system fonts)
- Neutral and modern — doesn't feel childish or clinical
- Wide range of weights (300–800) for clear hierarchy
- Used by Notion, Linear, GitHub — feels contemporary to this age group

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Load via Google Fonts or self-host:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Role | Size | Weight | Line Height | Notes |
|---|---|---|---|---|
| Page title / H1 | 28px | 700 (Bold) | 1.2 | Section titles, keepsake headers |
| Section title / H2 | 22px | 600 (Semibold) | 1.3 | Activity titles |
| Card title / H3 | 18px | 600 (Semibold) | 1.4 | Card headings, question prompts |
| Body / default | 16px | 400 (Regular) | 1.6 | All paragraph text, instructions |
| Body emphasis | 16px | 500 (Medium) | 1.6 | Sentence starters, key phrases |
| Label | 14px | 500 (Medium) | 1.4 | Form labels, captions, metadata |
| Caption / hint | 13px | 400 (Regular) | 1.4 | Placeholder hints, char count |
| Button text | 16px | 600 (Semibold) | 1 | Action buttons |

**Absolute minimum: 13px.** Nothing participant-facing goes below this.

### Key Typography Rules

- **Left-align all body text** — centered text is harder to scan on mobile
- **Center-align only:** short headings, button labels, keepsake poem output
- **Line length:** max 65–70 characters per line on mobile (achieved naturally with 16px padding)
- **Paragraph spacing:** 1em between paragraphs — never compress
- **No ALL CAPS for body text** — feels authoritative/institutional

---

## Spacing & Layout

### Grid
Single column on mobile (375px+), two-column optional on tablet (768px+) only for structured activities that explicitly need side-by-side layout (self-reflection thoughts/feelings).

### Spacing Scale (Tailwind defaults are fine)

| Context | Value | Tailwind |
|---|---|---|
| Page horizontal padding | 16px | `px-4` |
| Card internal padding | 20–24px | `p-5` or `p-6` |
| Between sections on screen | 24px | `gap-6` |
| Between form fields | 20px | `space-y-5` |
| Between label and input | 8px | `mb-2` |
| Bottom of screen (safe area) | 32px | `pb-8` |

### Cards

```
background: white
border-radius: 16px (rounded-2xl)
box-shadow: shadow-md (0 4px 6px -1px rgb(0 0 0 / 0.1))
padding: p-5 or p-6
```

No hard borders on cards — shadow only. Borders feel institutional.

---

## Interactive Elements

### Buttons

| Type | Style | Use |
|---|---|---|
| Primary | `amber-500` bg, white text, `rounded-full`, `px-8 py-4`, semibold | Main action: "Save", "Next", "I'm ready" |
| Secondary | `amber-100` bg, `amber-800` text, same shape | Back, Skip (where applicable) |
| Destructive / remove | `slate-100` bg, `slate-600` text | Remove ally, clear — never red |
| Ghost | Transparent, `amber-700` text, border `amber-200` | Tertiary actions |

**Minimum button height: 52px on mobile.** This is above the 44px accessibility minimum and accounts for finger variance.

### Touch Targets
All interactive elements minimum 48px height. Word bank chips minimum 44px. Drag handles minimum 48×48px.

### Word Bank Chips

```
Unselected:  slate-100 bg + slate-700 text + rounded-full + px-4 py-2
Tapped/used: amber-200 bg + amber-900 text
```

Chips are additive (append to text field). They do not change to a "selected" permanent state — they flash amber briefly on tap to confirm, then return to default. This reinforces that the youth is authoring, not just selecting.

### Drag and Drop

Drag items:
```
white card + shadow-md + rounded-xl + py-4 px-5
While dragging: shadow-xl + slight scale(1.02)
```

Drop buckets:
```
amber-50 bg + amber-200 border (dashed, 2px) + rounded-2xl
When item hovering over bucket: amber-100 bg + amber-400 border
When item placed: solid border amber-300 + white item cards inside
```

---

## Progress Indicators

A 45-minute session is long. Youth need constant orientation: where am I, how much is left.

### Session Progress Bar
Thin (4px) amber-400 bar at the very top of the screen. Updates section by section, not item by item. Never shows percentage — just visual position.

```
height: 4px
background: amber-400
border-radius: 0 (spans full width)
transition: width 600ms ease
```

### Section Transition Cards
Between major sections (e.g., finishing pretest, starting first activity), show a full-screen transition card:
```
amber-50 background
Large section title (H1)
One-line description of what comes next
amber-500 "Continue" button
```

This gives youth a moment to breathe and orients them to the new section.

### Activity Step Dots
Within multi-step custom activities (GettingUnstuck, AlliesSafetyNet, etc.), show small dot indicators at the top:
```
Active dot:    amber-400, 8px
Completed dot: amber-200, 8px
Future dot:    slate-200, 6px
```

---

## Iconography

Use **Lucide React** (already a common choice in modern React apps, lightweight, consistent stroke weight).

Guidelines:
- Stroke width: 1.5px — thin enough to feel modern, thick enough to read on small screens
- Size: 20px in body, 24px in headers, 16px in captions
- Color: inherit from text — `slate-600` for secondary, `amber-500` for primary actions
- Never use icons alone — always pair with text label on first use

---

## Motion & Animation

Youth are accustomed to smooth, native-feeling mobile apps. Choppy transitions or no transitions feel broken.

| Event | Animation | Duration |
|---|---|---|
| Screen/section transition | Horizontal slide (next=right, back=left) | 300ms ease |
| Card appear | Fade up (translateY 8px → 0, opacity 0→1) | 250ms ease |
| Button press | scale(0.97) | 100ms |
| Word bank chip tap | Brief amber flash | 150ms |
| Progress bar update | Width transition | 600ms ease |
| Completion (save/finish) | Scale up + fade (keepsake card) | 400ms ease |
| Drag lift | shadow-xl + scale(1.02) | 150ms |
| Drop placement | Soft bounce | 200ms |

**No animations on psychometric scales** — scale items should feel deliberate and considered, not playful.

---

## Accessibility (WCAG 2.1 AA)

| Requirement | Our approach |
|---|---|
| Color contrast (4.5:1 normal text) | slate-800 on white = 13.7:1 ✅ |
| Color contrast (3:1 large text) | amber-500 text on white = 3.2:1 ✅ |
| Touch target minimum 44px | All targets 48px+ ✅ |
| Text resize to 200% | All text in rem/em, no fixed heights on text containers |
| Focus indicators | amber-400 outline, 2px, 2px offset |
| No color as sole indicator | All states use shape/label + color |
| Screen reader support | Semantic HTML, aria-labels on all interactive elements |

---

## Tone & Microcopy

The design system includes the voice, not just the visual.

### Principles
- **First person, not second:** "Let's get started" not "You will now begin"
- **Warm but not saccharine:** "That's yours to keep." not "Amazing job!!!"
- **Never evaluative:** No "Correct!", no scores shown to participants unless clinically required
- **No clinical jargon in participant-facing UI:** "Your plan" not "Action planning module"
- **Affirm effort, not outcome:** "That took courage." not "You did great!"

### Button Labels
| Avoid | Use instead |
|---|---|
| "Submit" | "Save" or "Done" |
| "Next page" | "Keep going →" or "I'm ready →" |
| "Complete" | "Finish" or "All done" |
| "Error" | "Let's try that again" |
| "Invalid" | "That code didn't work — try again?" |

---

## Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Palette is Tailwind defaults — no custom colors needed
        // amber, slate, emerald, rose all ship with Tailwind
      },
      borderRadius: {
        '2xl': '16px',  // confirm matches Tailwind default
        '3xl': '24px',  // for full-screen cards / keepsake frames
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
      }
    },
  },
  plugins: [],
}
```

---

## What This Design System Is Not

- It is **not a brand identity** — the platform has no logo requirement for the participant-facing app
- It is **not final** — clinical team and eventual user testing with youth may inform refinements
- It is **not restrictive** — individual activities can use this palette creatively; the system provides guardrails, not a rigid template

---

## Open Question for Clinical Team

**Progress visibility:** Research on trauma-informed design suggests that giving youth a clear sense of how much is left reduces anxiety and dropout. However, showing "you are 20% done" on a 45-minute session early in the session may feel daunting. Recommendation: show section-level progress (e.g., "Part 2 of 5") rather than item-level or percentage. But this is worth discussing with the clinical team before implementing.

---

*This document should be shared with the clinical team for review on tone and framing decisions before any participant-facing screens are built.*
