# Working Notes — GAINS for Teens (“The Long Light”)

A bidirectional scratchpad for the **GAINS for Teens** SSI, shared between Josh,
Claude Cowork (desktop chat — ideation, feasibility, UX, prompt-drafting) and
Claude Code (CLI — implementation).

> GAINS for Teens is the **second** single-session intervention on this platform,
> a sibling to Ready for Roots. It rides the **same app** (React/Vite + Supabase +
> Vercel, deployed to ctac.app), so GAINS code lands in the shared repo — but its
> planning and history live **here**, separate from Ready for Roots.
>
> **Which working-notes file?**
> - GAINS for Teens work → **this file** (`Gains for Teens/WORKING_NOTES.md`).
> - Ready for Roots work → root `WORKING_NOTES.md`.
> - Shared platform / SessionEngine / infra changes affecting both programs → root
>   `WORKING_NOTES.md` (it’s the platform layer); cross-reference here if relevant.
>
> **Draft numbering is independent** — GAINS starts at Draft 1 here. Do not continue
> Ready for Roots’ numbering.
>
> **Append-only conventions (same as root):**
> - "Recently shipped" — newest at top; one bullet per commit (hash + date + summary).
> - "Ideas / drafts" — newest at bottom; polished prompts for the next Claude Code session.
>   Once a draft ships, move it (verbatim) into "Recently shipped" with the commit hash.

---

## Project anchors

- **World:** "The Long Light" — a 9:16 vertical dream-ascent from a dark valley (the
  Hollow) up to a lighthouse Beacon at the summit (= the therapist). Creatures, not
  people; first-person real-world bookends; the phone becomes the lantern in the dream.
- **Loop:** psychoeducation video → reinforcing activity → gear-up → brief Tier-2
  (Canvas/WebGL) traversal → find the next glyph → repeat. Rides the existing
  SessionEngine; the traversal is the one new item type.
- **Concept brief:** `Gains for Teens/GAINS for Teens - Concept Brief.docx` (internal
  reference — not for the team yet).
- **Pitch site:** `Gains for Teens/The Long Light - Concept Pitch.html` (deploy-ready
  copy staged at `Gains for Teens/long-light-site/`). **Live at
  https://ssi.ctac.app/long-light/** (unlisted).
- **Deploy domain — important:** the SSI app (Vercel project `ctac-ssi`, this repo)
  serves at **`ssi.ctac.app`**, NOT the bare `ctac.app`. The bare `ctac.app` domain is
  attached to a *different* Vercel project (`sts-bsc-manager`) and shows "STS-BSC
  Manager" — it will bounce you to `ctac.app/`. Always test SSI/GAINS URLs against the
  `ssi.` subdomain.
- **Meetings:** kicked off 2026-06-29; next 2026-07-06, 9am.

---

## ⬅ TODO for Claude Cowork (Claude Code → Claude Cowork)

Asks pointed the other way — things Cowork/Josh need to source or decide.

- **Option-2 transition phrases (2026-08-06).** The Exposition card's intro narration is now
  the Option-2 Spark line (Shadowmend), but its **seven transition phrases are pending** —
  the earlier set was built around Cinder and the old level names, so it was pulled rather
  than silently rewritten. Need an Option-2 set: one line per hand-off (into Zone 1, then
  after each zone's gear through to Mount Hope). Drop them in a draft and Claude Code will
  wire them into the same card.

- ~~**Spark voice A/B/C are not loudness-matched (2026-08-13).**~~ ✅ **RESOLVED
  2026-08-14** by the Draft 29 re-mixes (b4f7465). The old set ran -9.3 / -12.4 / -15.3 dBFS
  RMS, a 6 dB spread with A and B clipping at full scale, which biased a blind vote toward
  whichever was loudest. The new set measures **-23.1 / -23.9 / -23.1, a 0.85 dB spread**,
  peaking at -8.7 / -7.7 / -7.9 with no clipping. The A/B/C vote is a fair comparison now.

- ~~**Orb collect sound for the climb traversal (2026-07-27).**~~ ✅ **RESOLVED
  2026-07-28** — Josh supplied "Woosh 1" (air whoosh); shipped in 9efaf02 as
  `public/gains/climb/audio/sfx-air-intake.mp3`.

---

## ✍ Writing style (standing rule)

- **No em dashes inside a sentence.** Josh, 2026-08-06: "I really don't like them, let's
  never use them in sentence." Rewrite as separate sentences, or use a comma / colon /
  parentheses. This applies to all copy we author (UI, captions, intros, notes).
- **Em dashes are fine as a true separator** — titles and label/descriptor pairs, e.g.
  "Zone 1 — The Hollow", "Video 1 — what trauma is", "Oxygen Mask — helps you breathe".
- **Verbatim source text is exempt.** Scripts and quotes from Stephanie / Sprang / Holly
  stay exactly as written (they still contain em dashes in V2, V3 and "What to Expect").
  Flag them rather than silently re-typesetting.

---

## Visual style (canonical) — "Long Light" vector-silhouette

The GAINS environment-art style, locked 2026-07-02. **Minimalist atmospheric
vector-silhouette landscape**, in the visual language of Alto-style endless-runner
games. Applies to all zones and future GAINS environment/asset art. (Supersedes the
Jun 30 painterly plates.)

Core traits:
- **Layered silhouette depth** — near-black foreground shapes, softer purple/blue mid
  layers, hazy distant mountains/architecture; typically 4-7 depth planes.
- **Large glowing celestial focal point** — a low sun/moon/crescent/comet as the center
  of gravity; clean circle with soft radial glow.
- **Dreamy gradient sky** — smooth teal → indigo → violet → pink → coral; the sky carries
  most of the emotional color.
- **Simple geometric scenery** — castles, towers, bridges, trees, arches reduced to
  angular silhouettes, not detailed illustration.
- **High-contrast foreground** — closest layer very dark navy/plum/black-purple so the sky
  reads brighter.
- **Atmospheric particles** — small stars, dust, sparkles, soft fog for depth.
- **Tiny narrative detail** — a small traveler, lantern, bird, balloon, or string lights at
  very small scale.
- **Soft cinematic light** — warm window/lantern glow; gentle bloom through mist.
- **Mood** — peaceful, good-lonely, adventurous, meditative, nostalgic.

Design language: flat vector environment art with atmospheric gradient compositing, layered
parallax silhouettes, soft bloom lighting, simplified geometric architecture, dreamy twilight
palette. Detail comes from composition, color, depth, and lighting — NOT texture or linework.
Not watercolor/painterly.

Palette: deep navy / black-purple foregrounds · dusty mauve & violet midgrounds · coral, blush,
peach, lavender skies · teal/cyan night gradients · warm pale-yellow lantern/window glow · white
sun/moon with pink or blue bloom.

Prompt-ready (reuse for new zones/assets):
> Minimalist atmospheric vector landscape, layered parallax silhouettes of mountains, castles,
> bridges, trees, and distant architecture, deep near-black navy foreground, hazy purple and
> mauve midground layers, smooth twilight gradient sky shifting from teal and indigo to lavender,
> coral, and soft pink, enormous glowing sun or moon near the horizon, tiny stars and drifting
> particles, warm glowing lanterns and windows, simple angular geometric forms, cinematic depth,
> peaceful dreamlike adventure-game environment, clean flat shapes, soft bloom lighting, no
> outlines, no photorealism, no painterly texture.

**Key instruction:** keep objects simple, dark, and graphic; put the visual richness in the sky
gradients and layered depth.

---

## ⬇ Recently shipped (Claude Code → Claude Cowork)

- **6f28c2f** (2026-09-01) — Draft 54: **Paginate the measures into the real
  app flow, in a mobile container, at the top of the review section.**
  Reworks the Draft 53 measurement packet from one flat scroll into a real
  administration flow: one instrument per page inside the same mobile phone
  frame the playable activities use, with a "Step X of Y" progress indicator
  (dots) and a Continue button (Finish on the last page) — nothing is stored
  or scored, matching Draft 53's review-only scope. `MeasurementPacket.jsx`
  is now a shared data module (instrument definitions + a small field-
  renderer per instrument, e.g. `DemographicsFields`, `CTSFields`,
  `TherapyHistoryFields`) so no item text was retyped; new
  `MeasurementFlow.jsx` adds the paginated chrome and is instantiated twice
  — **Pre-test** (Demographics → Event: time since trauma → CTS → Therapy
  history → Beck Hopelessness-4 → Motivation Ruler → Implicit Theories →
  Trauma & Treatment Beliefs, 8 pages) and **Post-test** (the Pre+Post
  instruments again + Program Feedback Scale, 5 pages), each with its own
  independent state. The therapy-history page's Continue stays disabled
  until the top question is answered, since the sub-questions shown depend
  on it. Since this is still a proposal and not adopted canon, both flows
  now sit as items 1 and 2 at the top of "Ideas & Demos for Review" (above
  the videos) instead of their own Child Assent & Measures section further
  down the page — that section is removed, and its feedback-dropdown value
  (`assent-measures`) is kept (commented as superseded) so historical
  feedback rows still label correctly; new `review-pretest`/`review-posttest`
  section values added for the two new items' comment threads. Verified
  locally and live: page order, all 8/5 pages in order, therapy-history
  branching and Continue-gating, the Finish → "complete, nothing saved" →
  Start over end state, no horizontal overflow at 375px, Ready for Roots
  unaffected, clean build.

- **af00a92** (2026-09-01) — Draft 53: **Build the measurement packet into
  Child Assent & Measures.** Adds the full GAINS measurement packet to
  `/gains-demo`, rendered as the actual questionnaires with the app's form
  controls in the Shadowmend design system. Source of truth: Stephanie's
  `Gains Teens Measurements_SG.docx` — every item (including the CTS and
  Beck-4 items that were embedded as images in the source doc) is
  transcribed verbatim, nothing invented or placeholdered.
  **Scope, per the draft: team review only.** All state is local/ephemeral —
  nothing is persisted or scored. **Live data capture + scoring to Supabase is
  a separate follow-up**, noted on the page itself, mirroring how Ready for
  Roots' own pretest/posttest went from demo-only to a real DB pipeline.
  Four new hand-authored form primitives under `src/components/gains/ds/`
  (RadioList, CheckboxList, LikertScale, TextInput/TextArea) — the DesignSync
  connector's authorization had lapsed this session, so these were authored
  directly rather than ported, matching the same Shadowmend token language
  already established across Drafts 49–52 (amber selected state,
  translucent-quiet unselected, 48px tap targets, Nunito). New
  `src/components/gains/MeasurementPacket.jsx` composes all nine instruments,
  grouped exactly as specified — Pre-only: Demographics, Event: time since
  trauma, Child Trauma Screen (CTS) Reactions Subscale, Therapy history (with
  its two-level Yes/No branching). Pre + Post: Beck Hopelessness Scale-4,
  Motivation/Readiness to Change Ruler, Implicit Theories of Emotion Scale,
  Trauma and Treatment Beliefs. Post-only: Program Feedback Scale (including
  its two free-response items).
  **Verified via direct DOM/state interaction** (screenshots broke past the
  review section's Vimeo iframes in this headless environment — a known
  compositing quirk unrelated to this change, confirmed by DOM content being
  fully correct throughout): all 9 instruments render under the correct
  headings; every verbatim item text check passed (CTS's kept doc numbering
  5–10, all 3 Trauma Beliefs reverse-scored markers); the therapy-history
  branching correctly shows/hides each nested question on both paths and
  cleanly clears the other branch when switched; CheckboxList's multi-select
  (Race) and single-select-via-wrapper (Sex) both work, including the
  "Another (write it in)" free-text reveal; LikertScale's per-item
  independent selection confirmed; text inputs and free-response textareas
  capture typed text. Confirmed live on ssi.ctac.app. 48px tap targets
  confirmed by direct measurement; no overflow at 375px; Ready for Roots
  (`/demo`) confirmed unaffected with no console errors; clean build.

- **c5de9ca** (2026-08-27) — Draft 52: **Review videos: resize + stack vertically;
  fix the visible demo title.**
  1. The five review videos were rendering in an oversized 2-up 16:9 grid. Resized
  each to its natural phone-portrait 9:16 and switched to a single vertical stack,
  constrained to the same ~360px width as the playable-activity phone frames
  elsewhere on the page (the same `-mx-4 sm:mx-auto sm:max-w-[360px]` pattern).
  2. The page's own `<h1>` still read "GAINS for Teens — The Long Light"; changed
  to "GAINS for Teens — Shadowmend / Long Light" per Draft 51's original ask, which
  had only touched a different meta line.
  **Verified:** confirmed live on ssi.ctac.app — all 5 videos render at 360×640
  (9:16), stacked vertically with no horizontal overlap; the h1 reads the new
  title; no overflow at 375px; clean build.

- **a14dcac** (2026-08-27) — Draft 51: **Demo cleanup — videos into review (top),
  Spark→Narrator in Characters, Traveler strip→Playable Character.** Styling stays
  the current design-system look; no activity logic or copy changed.
  1. Added the five zone psychoeducation videos as a new first item ("Videos") in
  Ideas & Demos for Review, each embedded via Vimeo's `?h=` privacy-hash URL — the
  standard way to embed an unlisted video. New `review-videos` feedback section for
  comments on the group.
  2. Retired the "Spark's voice (six options)" review item — the team has decided
  on Option F. Spark now appears in the Playable Character section labeled
  "Narrator," with his art and a single voice-sample player for the adopted file
  (`spark-voice-f.mp3`). `SPARK_VOICE_OPTIONS` and the six-player picker were
  deleted, not just hidden.
  3. Moved the Traveler four-stage progression ("How the character changes") out of
  the review section into Playable Character, replacing the single generic
  Traveler placeholder now that the team's adopted the strip. Added the requested
  note underneath about the stages getting an inner-light regeneration.
  Review section now numbers 1–4: Videos, Body Mapping, Mindfulness: Calm Place,
  Zone 3: Message to Your Guardian. `review-character` and `review-spark-voice`
  stay in `AdminFeedbackPage`'s label map (retired, not deleted) so historical
  feedback rows still read correctly; `review-videos` was added there too.
  **Verified:** confirmed live on ssi.ctac.app — all 5 video iframes render with
  correct titles and hash-embed URLs; the Narrator card's audio resolves to the
  right file; the four Traveler stages + the inner-light note render in Playable
  Character; the retired items are gone and remaining review items renumber
  correctly (1–4); no console errors; no overflow at 375px; clean build.

- **20082b2** (2026-08-27) — Draft 50: **Roll the Shadowmend design system across
  the whole /gains-demo page.** Extends Draft 49's foundation (the `.gains-theme`
  tokens + the `ds/` primitives) to the entire page. Styling only — no activity
  logic, copy, hit-targets, timing, or feedback wiring changed.
  **Structural sections** (`src/pages/GainsDemoPage.jsx`): `.gains-theme` now wraps
  the whole page body instead of just the Exposition card, inside a new dark "world"
  panel (`var(--sky-abyss)`) so the frosted-glass Card treatment has a twilight
  backdrop instead of the page's light teal. Restyled: the Ideas & Demos for Review
  banner and its six item cards, the World & Development Map roadmap card + table,
  the In Development (Final Boss script) card, the Child Assent placeholder, the
  Playable Character / NPCs art cards, every Zone 1–5 section card, and the
  Prototypes and In Development cards (traversal prototype wrapper/chrome only —
  the Phaser canvas interior is untouched, per the draft's own exception). Shared
  components restyled once each so every call site cascades: Pill (now composed
  from a new Badge primitive), Beat, ArtCard, PrototypeCard, CharacterChips,
  ReviewItem, InDevelopmentCard, ZoneSection. Two new `ds/` primitives (Card, Badge)
  ported alongside Draft 49's four.
  **Playable activities** (chrome only, re-tested end-to-end after each):
  - `BodyMapping.jsx`: dark sky-abyss background, restyled panels/CTA/write-in
    field. The body diagram's idle-state line art was `#334155` (dark slate) tuned
    for a light background — switched to a light `#CBD5E1` so it stays visible
    against the new dark backdrop (a color-only fix, no geometry/hit-target
    changes). Re-tested: reveal all 5 → region's own copy → Continue → closing →
    Continue → select mode → write-in field → Done → Start over.
  - `MindfulnessCalmPlace.jsx`: was already dark-themed, so this was a closer
    color-only pass (chips, sheet panels, buttons) with no backdrop change.
    Re-tested: Begin → arrive → see (3) → hear (3) → breathe (ready → active,
    glow/frog breathe-along untouched → done) → close → practice-decline loop →
    restart; confirmed all three audio tracks paused after restart.
  - `ElevatorPitch.jsx`: restyled the message-builder sheet, SelectStep options
    (including "Write your own" custom mode), and every CTA. Re-tested the full
    six-step build (including a custom "help" entry) → review (assembled message
    correct) → Save It → the dedicated 988 safety screen → done (Wingsuit, no
    disclaimer left behind) → Start over.
  **Verified:** confirmed live on ssi.ctac.app; Ready for Roots (`/demo`) renders
  unchanged with no console errors; no overflow at 375px on the restyled page;
  clean build.

- **1533944** (2026-08-27) — Draft 49: **Adopt the Shadowmend design system into the
  GAINS demo — tokens (scoped) + the Exposition card restyled as proof of concept.**
  Imported from Claude Design (project `08785bf5-7c7a-49df-b4d7-a431c47e345f`,
  "Shadow Mend Design System") via the DesignSync connector. Styling only — no
  activity logic touched.
  **Part 1 — tokens** ([gains-tokens.css](../src/styles/gains-tokens.css)): colors,
  spacing, radii, shadows, motion eases, Nunito type scale, 48px tap targets, ported
  from the design system's `tokens/*.css`. Every custom property is declared under a
  `.gains-theme` class rather than `:root` — the app also serves Ready for Roots and
  other interventions on the existing amber/slate Tailwind theme, so nothing outside
  an element carrying `.gains-theme` can see these variables. Deliberately dropped the
  source's bare element-selector rules (`h1`/`p`/`button`/etc. from `tokens/base.css`):
  `.gains-theme h1 {...}` would carry higher CSS specificity than a single Tailwind
  color/font utility class and could silently reskin sections this draft doesn't
  touch. Each ported component sets its own font/color/weight inline instead.
  **Part 2 — one starter screen**
  ([ExpositionIntro.jsx](../src/components/gains/ExpositionIntro.jsx)): restyled the
  Exposition card (Spark's intro) as the proof of concept — the Mount Hope twilight
  backdrop, the Traveler in its dark stage with a soft halo, Spark's glassy dialogue
  sheet, Nunito narration type, the amber pill CTA at 48px+ with glow/press states,
  and a soft-bloom acknowledgment on click-through. Composed from four small ported
  primitives under `src/components/gains/ds/` (Button, SceneFrame, SparkDialogue,
  CharacterFigure, ParticleField) mirroring the design system's own structure, so
  future screens can reuse them when we roll the look outward. Reused the app's
  EXISTING art (`map-and-world.webp`, `narrator-spark.webp`,
  `traveler-stage1-hallow.webp`) instead of importing the design system's own asset
  copies — these already match the target look, so this stayed a styling-only change
  with no new binaries to stage/mirror/cache-bust. `SPARK_INTRO_LINE` stays the single
  verbatim source in `GainsDemoPage.jsx`; `ExpositionIntro` only restyles its
  presentation, passed in as a prop.
  **Verified:** confirmed live on ssi.ctac.app — the restyled card renders (Mount Hope
  art, Traveler figure, Spark dialogue, amber CTA), the click-through
  button/acknowledgment transition works, and the page's own `<h1>` and every other
  GAINS card (NPCs, Zone 1, etc.) kept their original color/font, unaffected by the
  new tokens. Also spot-checked `/demo` (Ready for Roots) loads with no console
  errors and no visual change. No overflow at 375px on the restyled card; build clean.

- **7c2ddfe** (2026-08-24) — Draft 48: **Zone 3 "Message to Your Guardian" —
  reorder steps, 988 safety on its own screen.** Order + layout only (Spark reading
  the message aloud is still coming in the narration draft).
  1. Reordered `STEPS` (and the render blocks, for readability) to Greeting →
  Situation → Request → Normalize → Offer → Benefit — request used to come after
  normalize/offer, Stephanie + Holly asked for it right after situation instead. The
  "STEP X OF 6" labels were renumbered to match (Request is now Step 3, Normalize
  Step 4, Offer Step 5), and the assembled-message array was reordered to
  `[greeting, situation, request, normalize, offer, help]`.
  2. The 988 safety disclaimer moved off the `done` step (where it sat beside the
  Wingsuit award) onto its own new `safety` step in the `STEPS` array, landing right
  after `review`/Save It and before `done` — Holly/admin wanted it "on its own page,
  before they get the gear." Copy is unchanged, still verbatim from Dr. Sprang.
  3. Left the "write it as a note first" reassurance line on `review` untouched —
  the draft flagged that placement as an open question with no decision yet.
  **Verified** end-to-end live on ssi.ctac.app: walked greeting → situation → request
  (confirmed "Step 3 of 6" + "Now make your request" prompt) → normalize → offer →
  help → review, where the assembled message read in the new order ("hey Mom, I've
  been having a hard time lately. I would like to talk with a trauma therapist.
  Therapy isn't just for when things are in crisis. ..."); Save It landed on the new
  safety screen (disclaimer visible, no Wingsuit/"You did it" yet, single Continue
  button); tapping Continue there landed on `done` with the Wingsuit message and no
  disclaimer left behind. No overflow at 375px; no console errors; build clean. No
  `src/activities` changes → no version bump.

- **8750b15** (2026-08-24) — Draft 47: **Mindfulness UI/copy fixes, non-audio.**
  1. The final breathe screen no longer reuses "Follow Spark's count" from the ready
  screen — `INSTRUCTIONS.breathe` split into `breatheReady`/`breatheDone`, and the
  instruction lookup is now breatheStage-aware instead of a flat `INSTRUCTIONS[mode]`
  lookup.
  2. Confirmed Hear's sound levels were already flat throughout (Draft 39 had already
  removed the per-tap volume nudge) — no ramp existed to fix, verified via direct
  `audio.volume` reads before and after tapping chips.
  3. Reworded the See prompt to "What are three things you can see."
  4. Added a directive line before breathing ("On the next page, you'll see a count
  from Spark to follow along with") and renamed the button to "Begin box breathing."
  5. Wired the frog to breathe along with the box count during the active breathing
  stage: its own idle `om-breathe` loop is suspended via a new `.om-breathing-along`
  class, and its `#frog-body` scale/lift is driven inline from a new
  `FROG_BREATHE_TARGETS` map, phase-synced to the same count as the big glow at a
  subtler amplitude. The art restyle to match the painterly scene is still pending a
  new asset from Cowork; this only wires the behavior so it's ready to receive it.
  **Verified:** stale "follow Spark's count" text gone from the final breathe screen
  (confirmed live); Hear volumes read identical (0.4) before and after tapping three
  chips; See prompt reads the new wording (confirmed live); breathe screen shows the
  new orientation line and "Begin box breathing" button; the frog's inline transform
  tracked the live phase (`translateY(-6px) scale(1.08)` on Breathe In,
  `translateY(2px) scale(0.94)` on Breathe Out) with its idle animation suspended
  during that stretch and correctly resumed afterward; no overflow at 375px; no
  console errors beyond an unrelated transient Vite HMR reconnect from restarting the
  dev server mid-session; build clean. No `src/activities` changes → no version bump.

- **721b5f2** (2026-08-24) — Draft 46: **Body Mapping fixes — heart side, stomach
  position, Continue before the closing, write-in area.** All non-audio.
  1. Mirrored the heart marker (target, icon, check badge) from the viewer's left to
  the viewer's right — the body's own left chest — across the torso's x=350
  centerline (cx 294 → 406), so it reads anatomically correct and stays clearly
  distinct from the lungs.
  2. Lowered the stomach marker ~30 units (cy 478 → 508, icon/check offsets shifted
  to match) so it isn't floating in empty space beneath the heart/lungs cluster.
  3. Fixed the 5th-reveal flow: it used to auto-flip to the closing line on a 1.1s
  timer, which meant a well-timed Continue tap could skip the 5th region's own copy
  entirely. Now the 5th region's own panel shows first (no timer), and the same
  Continue button requires an explicit second tap to reveal the closing line, then a
  third to advance to Part 2 — removed the `closingTimerRef`/`useEffect` cleanup
  entirely in favor of this tap-driven flow.
  4. Added a write-in "Is there another area you feel it in your body? (write it in)"
  option to Part 2 only — a dashed prompt button that expands to a text input on tap
  (same reveal-on-tap shape as ElevatorPitch's "Write your own"), and counts toward
  the "N selected" total alongside tapped regions.
  **Verified:** heart/stomach geometry confirmed via `getBBox`-style attribute checks
  both locally and live; the 5th reveal shows its own copy with no auto-jump, and the
  closing/advance now takes two explicit Continue taps (confirmed live on
  ssi.ctac.app); the write-in field engages, accepts text, and increments the
  selected count; figure height measured identical (364.3125px) across every mode —
  reveal, mid-reveal, 5th-reveal, closing shown, select collapsed, select expanded,
  and done — confirming the invisible-spacer reservation still holds with the new
  write-in field folded in; no horizontal overflow at 375px; no console errors; build
  clean. No `src/activities` changes → no version bump.

- **b50d520** (2026-08-20) — Drafts 44–45: **World & Development Map moves up, zone cards
  sync to the grid, "Focusing Glass" → "Focusing Lens."** Implemented together since 45
  syncs to 44's grid.
  **Draft 44:** moved "World and Development Map" to render directly after "Ideas & Demos
  for Review," ahead of "In Development" (new order: Review → World & Development Map →
  In Development → the official breakdown). Filled in the grid: Zone 1 gear → **Lantern**;
  Zone 2 gear → **Focusing Lens (in development)**; Zone 3 activity → **Message to Your
  Guardian** (gear stays A Wingsuit); Zone 4 activity → **Mindfulness: Calm Place (3-3-3)**
  (gear stays Oxygen Mask); Zone 5 gear → **Goggles (growth mindset) (in development)**.
  **Draft 45:** renamed "Focusing Glass" → "Focusing Lens" everywhere it appeared. Synced
  the per-zone breakdown cards to the grid — Zone 3's activity dropped its `pending: true`
  flag now that it's adopted and built (matching Zone 1's Body Mapping convention); Zone
  4's description was rewritten to describe the actual built Mindfulness activity rather
  than the generic pre-build 3-3-3 text. Added a Final Boss synopsis to the Zone 5 card via
  a new optional `zone.synopsis` field, rendered as its own "In development" Beat —
  summarizing the adopted script (three barriers, each cleared with an earned tool, ending
  at lighting the Beacon). This is Cowork's own summary, not Holly's verbatim script, so
  its one em dash got rewritten as two sentences per the standing style rule; the "→"
  connectors aren't covered by that rule and stayed.
  **Verified:** section order is exactly Review → World & Development Map → In
  Development → the rest; every grid cell matches; every synced zone card field matches
  the grid; Zone 5 shows the Final Ascent synopsis with its own pill; no "Focusing Glass"
  remains anywhere. No overflow at 375px; no console errors.

- **5314073** (2026-08-20) — Draft 43: **six new Spark voice contenders (A–F), plain
  labels only.** Goes from three players to six — A/B/C replaced with new audio (same
  filenames), D/E/F are new. Labels are plain "Spark A" through "Spark F" with no
  per-voice description or commentary anywhere, matching the existing neutral-labeling
  intent from Draft 28 so the team keeps picking blind. Kept the shared intro script and
  the `review-spark-voice` comment thread.
  Added a `?v=3` cache-bust to all six URLs. Re-verified against the live host that
  `Cache-Control` is still `max-age=0, must-revalidate` with an ETag (so browsers already
  get fresh bytes without it) before adding it anyway — zero-cost, and it turns "no stale
  audio plays" from something that follows from Cache-Control semantics into something
  the URL itself guarantees.
  Also cleaned up a stale comment on this item left over from the zone-rename proposal
  that used to share this space (accepted back in Draft 25).
  **Verified:** all six players show plain labels with no commentary anywhere; all six
  decode with distinct durations and audibly play; all six URLs carry `?v=3` and serve
  200 with correct file sizes; the shared intro script and comment thread are intact. No
  page overflow at 375px; no console errors.

- **784327c** (2026-08-20) — Draft 42: **the final Zone 1 traveler art is live.** The
  skin-tone-matched final version was already sitting in the working tree at both
  `traveler-stage1-hallow.webp` paths — committed here for the first time.
  Added a `?v=2` cache-bust to the image URL. This one genuinely needed it: unlike the mp3
  audio files (served `max-age=0, must-revalidate`, so an ETag change alone gets browsers
  the new bytes), `.webp` is served `public, max-age=31536000, immutable` — browsers are
  told never to revalidate for a year, so overwriting the file at the same URL without a
  version bump would have left it stale for a long time.
  **Verified:** the versioned URL serves 200 with the new file's exact byte size (32050,
  matching the updated webp); the two committed copies are byte-identical; no console
  errors.

- **a7a56a2** (2026-08-19) — Draft 41: **Elevator Pitch gets Dr. Sprang's Normalize/Offer
  steps and safety copy.** Two new select-one steps inserted between situation and
  request: **Normalize it** (4 options) and **Offer to make it easy** (4 options), both
  keeping "Write your own" from Draft 38. The activity goes from 4 steps to **6**; the
  "STEP X of N" indicator and every step's number updated to match.
  Assembly now stitches all six parts in order — greeting, situation, normalize, offer,
  request, help — via a small map/join rather than the old four-part template literal,
  since spelling out six positions inline was getting unwieldy.
  Also added two pieces of **verbatim** safety/reassurance copy from Dr. Sprang: a
  reassurance line on the review screen (write it as a note first; it's saved to the
  action plan either way) and a **988 crisis-line safety disclaimer** on the done screen —
  both rendered exactly as written, including her informal punctuation ("off- you",
  "parents- reach") and an apparent "you family physician" wording, since this is
  clinical/safety wording from a named source, not ours to re-typeset.
  **Verified:** all six steps show the right "Step N of 6" label and exact option wording;
  "Write your own" still works on the two new steps; the assembled message includes all
  six parts in order with correct punctuation; the reassurance line and safety disclaimer
  both appear verbatim; "Save It" still saves and the Wingsuit is still awarded. No
  overflow at 375px across every step including the longest option and both new copy
  blocks; comment thread still opens preset to `review-zone3pitch`; no console errors.

- **ab997df** (2026-08-19) — Draft 40: **a new "In Development" section, and the Final
  Boss script moves into it.** Sits between "Ideas & Demos for Review" and the official
  zone breakdown — a pipeline stage for things the team has adopted but hasn't built yet
  (Review → In Development → the official zones/canon), distinct from "Prototypes and In
  Development" further down (specifically the playable traversals plus the arcade/gear
  proposals adopted in the 2026-08-13 review).
  Moved Holly's Final Boss summit script (Ginny approved it) out of the numbered review
  list and into the new section, verbatim, unchanged. Kept its `review-finalboss` comment
  thread since the draft said doing so is harmless — it just no longer sits in this week's
  review queue. The remaining review items renumber 1–5 with no gap.
  Also fixed a stale cross-reference the renumbering created: Body Mapping's narration
  note pointed at "Spark's voice (item 3 above)" — Spark's voice is item 2 now.
  **Verified:** In Development renders in the right spot (Review → In Development → World
  and Development Map onward, ending with Prototypes and In Development); the Final Boss
  script is gone from review and appears verbatim in the new section; the review list
  renumbers cleanly; the comment thread still opens preset to `review-finalboss`. No
  overflow at 375px; no console errors.

- **ea6c111** (2026-08-19) — Draft 39: **Mindfulness Hear-step taps are select-only now,
  no more doubled audio.** Follow-up to Draft 37: the ambient bed plays all three tracks
  correctly, but tapping a chip still briefly nudged that track's own volume up (0.4 → 0.85,
  easing back after 2.4s) on top of the bed already playing underneath — reported as
  sounding like a second copy of the same file starting.
  Removed the nudge mechanism entirely. Tapping a chip now only updates state (selects it,
  counts it toward the three needed) and, for Frog/Lightning/Thunder, pulses the matching
  overlay layer — nothing touches an audio element's volume on tap anymore. The only place
  Hear's volumes change is `enterHear()` (up on arrival) and `startBreathe()` (back down on
  the way out), both already in place from Draft 37. Also dropped the now-orphaned
  `audioKey` field and `audioRefFor()` helper, which existed solely to tell the removed
  nudge which ref to touch.
  **Verified:** tapping Rain, then Thunder, then Frogs during Hear leaves all three tracks
  flat at the ambient 0.4 the whole time — no volume change, no doubled playback — while
  Thunder still correctly pulses the lightning layer and the count still advances to 3 of
  3; leaving Hear still correctly drops all three back down. No overflow at 375px; comment
  thread still opens preset to `review-mindfulness`; no console errors.

- **93a8f9b** (2026-08-19) — Draft 38: **Elevator Pitch gets "Write your own" on every
  select step, and the final button now reads "Save It."** Each of the three select-one
  steps (situation, request, help) offers a "Write your own" option that swaps the preset
  list for a text input. Whether a step is in custom mode is derived from its value itself
  (non-null but not one of the presets), not tracked as a separate flag, so returning to a
  step via "Change something" shows the right view — input with the typed text, or the
  preset list with the right one highlighted — with no extra state to keep in sync. A typed
  line flows into the assembled message exactly like a preset would. Added a "Choose from
  the list instead" link back out of custom mode, a small addition beyond the letter of the
  draft but consistent with how flexible the rest of this activity already is.
  Renamed "Send it" → **"Save It"** (it saves to the action-plan collector, nothing is
  actually sent), including the internal handler name and the review screen's helper text.
  **Verified:** "Write your own" appears on all three steps; Continue stays disabled until
  custom text is typed; a custom answer assembles identically to a preset (punctuation
  still comes out right); "Change something" correctly re-shows custom text rather than the
  preset list; "Choose from the list instead" correctly reverts; the flow still completes
  to the Wingsuit reward. The tallest step (6 buttons: 5 presets + Write your own) still
  fits with no overflow at 375px; comment thread still opens preset to `review-zone3pitch`;
  no console errors.

- **46c4c7d** (2026-08-19) — Draft 37: **four fixes to Mindfulness — no more disclaimer,
  Hear is actually hearable, 2 breath rounds, practice-to-upgrade the mask.**
  **1.** Removed the "First-draft script... for review" disclaimer from the review-item
  description. Draft 33's own instruction had already said "no disclaimers" for this one;
  this reaffirms the standing rule that the demo must never show draft/for-review/
  placeholder text. While there, also updated the description itself, which had gone stale
  after Drafts 34–35 replaced scene-tapping with chips and the subtle pulse with a box-breath.
  **2.** Hear step audio: music played from the start, but rain and frog sat at a whisper
  (0.12) until tapped, so "find three things you can hear" was really "find the one thing
  already audible, then tap blind." All three now come up to one shared, clearly audible
  level (0.4) for the duration of the Hear step specifically, dropping back to the quiet
  background once the step ends; a tapped chip still nudges its own track further forward
  on top of that. Went with the draft's stated preferred interpretation (ambient bed on
  entry, tap to select) over its flagged alternative, since consistency across all four
  chips was the actual requirement either way.
  **3.** Breathing runs **2 cycles** now, not 3 — one constant changed.
  **4.** Oxygen Mask practice-to-upgrade loop: after breathing completes, the close screen
  now offers "Want to practice again to upgrade your mask?" instead of going straight to
  "Do it again / I'm all set." Accepting re-runs just the box-breath and returns to the
  same offer, up to 2 accepted practices total; declining, or reaching that cap, falls
  through to the original close screen. Purely a reinforcing message as specified — no
  mechanical change, no different mask state exists to switch to. (The draft's suggested
  reinforcing line used an em dash; rewrote it as two sentences per the standing style
  rule, since this line isn't attributed to Stephanie or Holly by name.)
  **Verified live:** the disclaimer and stale description are gone; entering Hear jumps all
  three tracks to 0.4 together, a tap nudges to 0.85, and leaving Hear correctly drops all
  three back to their original levels; ran two full practice rounds back to back (each
  timing out at 2 cycles, ~32–34s real time) — the first ends at the Oxygen Mask message
  with the offer, the second (practiceCount 1) shows the reinforcing message and offers
  again, and declining there falls through to the original screen correctly. No overflow
  at 375px; comment thread still opens preset to `review-mindfulness`; no console errors.

- **6438889** (2026-08-19) — Draft 36: **the Zone 3 "Elevator Pitch" message-builder is
  playable.** Holly's end-of-Zone-3 activity, built over a full-bleed Mistfields bridge
  backdrop: the teen assembles a short message asking a guardian for trauma therapy one
  step at a time (greeting, situation, request, how it'll help), reviews it, sends it, and
  earns the Wingsuit. No-fail throughout, every pick can be revisited before sending.
  Every prompt and option is Holly's wording, kept exactly as written — her three
  select-one sets are punctuated inconsistently in the draft (some end with a period, most
  don't), so they render byte-for-byte as given while selecting. Assembly adds terminal
  punctuation only where a line doesn't already have it, which is what produces one
  naturally-punctuated paragraph without ever rewording her actual text; checked the
  assembled result against her own worked example and it stitches identically.
  **Per the draft's own note**, there's no shared "action plan" collector yet for the short
  pieces of player-authored text these reflective activities produce (this message,
  eventually the Final Boss growth-mindset choice). Stubbed a minimal shared module
  (`src/lib/gainsActionPlan.js`, in-memory only) that Send It saves into, so the message
  isn't silently dropped and a later activity can push into the same list. Wiring this into
  a real end-of-game summary is flagged as separate, larger work — not attempted here.
  The card sits in a translucent scrim near the **top** of the frame rather than
  lower-center, since the draft calls out the bridge art as busiest there.
  **Verified:** intro renders verbatim; Continue disables on an empty greeting and enables
  once text is typed; all four option sets (4/3/5 choices) render with Holly's exact
  wording; "Change something" returns with the prior pick still selected; the assembled
  message matches Holly's punctuation pattern exactly; "Send it" reaches the Wingsuit close
  with "Start over" available; the longest step (5 options) still fits with no overflow at
  375px or 1280px; item numbering across the section (1–6) is correct; comment thread opens
  preset to `review-zone3pitch`; no console errors from this component.

- **bba5ecb** (2026-08-19) — Draft 35: **Mindfulness's breathing step is now a directive
  box-breath.** From testing feedback: the old subtle glow-pulse gave no direction.
  Spark now introduces it explicitly ("Now, let's feel. Feel your lungs fill as you breathe
  with me.") behind a **"Start breathing"** tap, rather than dropping the participant
  straight into ambiguous motion. The exercise is a standard box breath — **in (4) → hold
  (4) → out (4) → hold (4)**, for 3 cycles — paced by a large amber glow that's now clearly
  the focal point, with the phase word ("Breathe in" / "Hold" / "Breathe out" / "Hold") and
  a live 1–4 count shown large and centered on it. The bottom panel bar is hidden outright
  while it's running, so the glow has the whole frame to itself; it returns for the lead-in
  and closing message either side of it.
  **Pacing** is a plain 1-second `setInterval` counting total elapsed ticks (0–48), with
  phase, cycle, and the in-phase count all **derived** from that one number by division
  rather than tracked as separate incrementing state — avoids the bug class where advancing
  the count also has to remember to advance the phase, which also has to remember to
  advance the cycle, all in one tick handler. The glow's expand/contract is a CSS
  **transition** (not a keyframe animation) with duration set to the phase's real length
  (4s), so a phase change that doesn't alter the target (hold following in, hold following
  out) just arrives and stays, no extra "freeze in place" logic needed; a gentle shimmer
  layers on top during the post-inhale hold via a separate `filter`-only keyframe so it
  doesn't fight the transition on `transform`.
  This ticked-timer design also sidesteps the Draft 33 limitation where this headless
  preview pane never reports the page visible and CSS `animationend` didn't reliably fire —
  a plain JS interval isn't tied to compositing the same way, so the **entire 3-cycle
  sequence could be watched running and completing in real time** this time.
  Also removed now-dead code the rework left behind: the old `manualBreath()` reduced-motion
  tap-through fallback (the phase/count text paces identically regardless of motion
  preference now, so a separate path isn't needed — only the glow's transition/shimmer are
  what `prefers-reduced-motion` now suppresses), and `repCount`, which existed only to
  intensify the old glow's pulse and had no reader left once the box-breath's targets became
  fixed values.
  **Verified over the real ~48-second sequence, twice** (including once via "Do it again",
  confirming the full loop back through See/Hear into a fresh session): phase and count
  progress correctly tick by tick into cycle 2 at exactly the 17th tick; the glow's style
  matches the correct target at every phase; the shimmer applies exactly on the first
  hold-after-inhale tick; the bottom bar is absent throughout and returns correctly either
  side; the sequence auto-completes to "Beautifully done." with no manual counting. No
  overflow at 375px; comment thread still opens preset to `review-mindfulness`; no console
  errors.

- **e7f2ffe** (2026-08-19) — Draft 34: **Mindfulness's See/Hear steps are chips at the top
  now, and the Hear dead end is fixed.** From testing feedback on Draft 33: the SEE/HEAR
  scene-tapping hotspots (and the bottom panel bar sharing space with them) covered too
  much of the scene, including the frog, and HEAR only had one reliably selectable option
  ("Music"), a dead end since the step needs three picks to advance.
  **Root cause of the Hear bug:** "Music" was a full-frame catch-all layered on top of the
  whole scene, so a tap anywhere else counted as hearing the music — including taps meant
  for the frog or rain areas, since the catch-all sat on top of them in paint order. My own
  automated testing during Draft 33 missed this: it called `.click()` directly on specific
  DOM nodes, which always fires that node's handler regardless of what visually overlaps it
  on screen, unlike a real tap which hit-tests at a screen coordinate.
  **Fix:** dropped scene-tapping entirely. SEE and HEAR are now predefined chip rows in a
  bar at the **top** of the frame, over the open sky; the scene — the frog especially —
  stays fully visible below at all times (verified by hit-testing the frog's exact screen
  coordinates during See and confirming the topmost element there is the frog itself, not
  any UI). The bottom panel bar (Spark's script) is suppressed during See/Hear so the two
  never compete for space.
  **SEE** is six options (Frog, Lightning, Pond, Fireflies, Trees, Clouds), pick any 3.
  **HEAR** is four (Rain, Thunder, Frogs, Music), pick any 3. Rain and Thunder both nudge
  the same `rain.mp3` (light rain and gentle thunder are one recording); Thunder
  additionally pulses the lightning layer so it reads as its own element despite sharing
  audio with Rain. Selecting Frog/Lightning/Fireflies (the three with an animated overlay
  layer) briefly bumps that layer's brightness as a non-blocking nicety; Pond/Trees/Clouds
  live only in the static background image, so they have none.
  **Verified:** all 6 See chips and 4 Hear chips are independently selectable; Frog/
  Lightning pulse correctly and clear themselves after ~900ms; Thunder nudges rain.mp3's
  volume to 0.85 AND pulses the lightning layer; Hear now reaches 3/3 using Rain + Thunder
  + Frogs alone, without ever touching Music — closing the exact dead end that was
  reported. No overflow at 375px; chips wrap and stay inside the frame; comment thread
  still opens preset to `review-mindfulness`; no console errors.

- **79e0aec** (2026-08-19) — Draft 33: **the Mindfulness "Calm Place" activity is
  playable.** Zone 4's grounding activity: Spark leads a calm-place visualization that
  does double duty, teaching the 3-3-3 technique (see / hear / breathe) while earning the
  Oxygen Mask gear for the climb ahead.
  Built from the staged assets (dusk pond background, five layered overlay SVGs — rain,
  lightning, fireflies, reeds, frog — with idle animations from the staged motion.css, and
  three looping ambient tracks). **Flow:** intro (Begin gesture, for audio autoplay) →
  arrive → **see** (tap any 3 of 5 living elements) → **hear** (tap all 3 sound sources) →
  **breathe** (an amber glow paces 3 slow breaths) → **close** (Oxygen Mask earned, "do it
  again?"). Repeating strengthens the glow (brighter, larger) up to a cap.
  **Four of the five overlay SVGs don't ship their own tap targets**, so this adds
  invisible hotspots as percentages of the art's native 1080×1920 space, positioned
  non-overlapping; `frog.svg` already has its own `#frog-tap` hit rect, handled by event
  delegation instead. **Layers are fetched at runtime and inlined**, not hand-transcribed
  into JSX — `rain.svg` alone has ~90 generated `<line>` elements, and copying that by hand
  risks silent errors. Each fetched SVG's `preserveAspectRatio` is rewritten to
  `xMidYMid slice` so every layer crops-to-fill like the background image instead of
  letterboxing, keeping them pixel-aligned.
  **Audio** starts synchronously inside the Begin tap (satisfies the browser's autoplay
  policy) at a quiet ambient volume for all three tracks; during Hear, tapping a sound's
  source briefly raises that track's volume then eases it back, so "that sound comes
  forward" is audible, not just narrated. **The breathing glow** is a CSS animation with a
  fixed iteration-count of 3, so `animationend` marks it done with no manual counting;
  `prefers-reduced-motion` swaps it for a 3-tap manual breathe-through so the step stays
  completable rather than just skipping the animation. **Hear reuses two of See's
  hotspots** (rain, frog); music has no single visual source, so it's a full-frame
  catch-all layered behind the other two.
  **Also fixed a real bug** found while touching this file: Body Mapping's "Reading it for
  now" note pointed at "Spark's voice (item 5 above)," stale from before Draft 30 inserted
  Final Boss as item 1 and pushed everything down — Spark's voice is item 3 now.
  **Verified:** all ten assets serve; Begin starts all three tracks at the correct ambient
  volumes; the full sequence works end to end, including each Hear tap nudging its
  track's volume to 0.85 and back; "Do it again" resets to See while audio keeps playing
  and measurably increases the glow's intensity (1.15/.85 → 1.20/.88); "I'm all set" fully
  stops and resets all three tracks. No overflow at 375px or 1280px; comment thread opens
  preset to `review-mindfulness`; item numbering across the section (1–5) is correct; no
  console errors.
  *The CSS-animation completion path couldn't be watched running live in this headless
  preview pane (it never reports non-hidden visibility, the same constraint noted earlier
  for Phaser's rAF loops), so its handler was verified with a synthetic `animationend`
  event instead, confirming the completion logic independent of the compositor.*

- **(check, no new work)** Draft 31 (add Maggie to the feedback dropdown) turned out to
  already be shipped: Maggie was added to the shared `SUBMITTERS` list in
  `src/components/FeedbackButton.jsx` back in **41b3ed9** (2026-08-06, Draft 89, a Ready for
  Roots draft), and that component is shared across both demos, so GAINS already had her.
  Confirmed live on ssi.ctac.app before marking the draft shipped; no commit needed.

- **72af0ff** (2026-08-19) — Draft 32: **Body Mapping's reveal/closing race bug is fixed,
  and the figure is redrawn torso-focused with a tap-reaction pulse.** From 2026-08-17 team
  feedback plus the 2026-08-19 art/copy follow-up.
  **The bug (Stephanie's report):** tapping the last unrevealed region sometimes showed the
  closing line instead of that region's own line. Revealing the 5th region set `showClosing`
  true in the *same* state update that revealed it, so the region's own panel never
  rendered, not even for a frame. Not specific to any one region, it happened to whichever
  one was tapped 5th, but testers experienced it as "the body map bug" because the
  whole-body hit-target is largest and drawn underneath the other four, so it's naturally
  the one left for last. **Fixed:** the just-completed region shows its own panel first, and
  a ref-tracked timer hands the panel to the closing line ~1.1s later instead of in the same
  tick; the timer cancels if the participant re-taps a region to re-read it, advances to
  Part 2, or restarts.
  **Tap reaction (Ginny's ask):** ships inside the redrawn asset, not as separate code, each
  un-tapped region idle-pulses (staggered per region) to invite a tap, settling to a steady
  glow once active or selected. Respects prefers-reduced-motion.
  **Torso-focused reposition (Holly's ask):** the full-body silhouette is replaced with a
  torso-focused figure (head, torso, both arms with real hands) so heart and lungs sit
  anatomically closer together, and the body/lightning-bolt icon moves onto the hand, off
  its old spot. This also satisfies Bianca's separate "more realistic, with hands" ask as a
  byproduct, no extra code needed. The crop was measured with `getBBox()` in a live render,
  not guessed, with asymmetric padding since the padding need is asymmetric (Head's glow can
  extend past the canvas top; the Body/hand region sits close to the left edge).
  **Copy:** Stephanie's final wording for all five regions, verbatim. Body overtook Head as
  the longest text with this revision (254 vs 223 chars), so the "longest region" spacer is
  now found by `reduce()` rather than hardcoded to Head, since the worst case isn't stable
  across copy revisions.
  **Verified:** revealed all five with the whole-body/hand region LAST (the exact reported
  scenario) — its own panel shows immediately, holds the full window, then the closing
  takes over; re-tapping afterward restores cleanly. Panel stays 8px above the CTA at both
  375px and 1280px with the new longer copy; body height/position spread is **0.00px**
  across the full sequence at both widths; no overflow. Active/selected styling confirmed
  correct by rasterizing the live SVG and sampling pixels, after `getComputedStyle` reads
  proved unreliable in this environment. Keyboard activation still works; the comment
  thread still opens preset to `review-bodymap`; no console errors.

- **ee5aea4** (2026-08-14) — Draft 30: **Holly's Final Boss summit script is up for
  review.** Text-only, nothing built yet: her first-draft script for the final climb to
  the Beacon, where the earned gear helps the player move past mixed feelings about
  starting therapy. Placed as the new **first item** with its own comment thread
  (`review-finalboss`), pushing the other three down to 2–4 (character progression,
  Spark's voice, Body Mapping).
  The script renders from a typed array (direction / spark / choices) rather than one
  prose blob, so "stage directions in italics, Spark's lines intact" is structural instead
  of a parser guessing at asterisks. Every line is copied exactly from Holly's draft,
  smart quotes and all; bracketed directions become italic entries with the asterisks
  stripped (they were her markup for "italicize this," not literal characters), and where
  two directions sat back to back on one line they stay as two separate entries rather than
  joined with punctuation of our own.
  The one-line intro above the script is new framing copy, not Holly's script, so the
  standing no-em-dash rule applies there; used a colon instead of a dash.
  **Verified:** item order is 1 Final Boss, 2 character progression, 3 Spark's voice, 4 Body
  Mapping; the rendered script has zero literal asterisk characters; direction count (11)
  and Spark-line count (8) match the source array; the two choices render as a numbered
  list; the comment thread opens preset to `review-finalboss`; no console errors. No
  `src/activities` changes, so no version bumps.

- **b4f7465** (2026-08-14) — Draft 29: **the three Spark voice mixes are refreshed.**
  Same filenames, new audio, mirrored from `long-light-site/audio/` into `public/`.
  Asset-only: the A/B/C players already point at these paths, so no wiring change and no
  version bumps.
  **No cache-busting string, and the draft's suggested `?v=2` is not needed.** Vercel serves
  `/long-light/*.mp3` as `max-age=0, must-revalidate` with an ETag that is literally the
  file's md5 (verified against the live host: the deployed ETag equalled the md5 of the file
  it was replacing), so every browser revalidates on load and gets the new bytes. A version
  string would just mean hand-bumping three URLs on every future swap.
  **These mixes fix the loudness bias** flagged when the last set shipped: the old files ran
  -9.3 / -12.4 / -15.3 dBFS RMS (6 dB spread, A and B clipping at full scale), the new ones
  are **-23.1 / -23.9 / -23.1, a 0.85 dB spread**, peaking at -8.7 / -7.7 / -7.9 with no
  clipping. The blind vote is a fair comparison now and that TODO is closed.
  The three are also properly distinct (pairwise cross-correlation 0.06–0.07) and no longer
  share a sample-identical length: **39.0s / 43.2s / 41.1s**, where B and C previously
  matched to the sample.
  **Verified:** all three decode, reach readyState 4 and play; durations match the decoded
  audio; the retired `spark-introduction.mp3` is still unreferenced.

- **8cc8e93** (2026-08-13) — Body Mapping: **the closing stands alone and the figure is
  now half the screen.** Josh: still needs to be significantly bigger, and the closing
  should show without the last region's description under it. Three levers, all buying the
  figure height:
  1. **The closing replaces the region description** instead of stacking under it. That was
     the biggest block of text in the activity and it only appeared in the state that was
     already fullest. Tapping any region afterwards brings its description back so nothing
     is stranded, and the "N of 5" counter stops rather than reading 5 of 5 under a closing
     that already says you're done. Since the reserved height is the worst case, removing a
     stacked block from that case hands the whole difference to the figure.
  2. **The SVG viewBox is cropped to the silhouette.** The art is drawn in a 600×1000 box
     but the body only occupies x 140..460, y 32..933, so a tenth of the height was empty
     margin the figure was paying for. The padding kept is for the amber glow, which blurs
     ~21px past an active region and would otherwise cut off at the edge.
  3. **The demo frame goes 700 → 780** at 360 wide, a ratio of 2.17. That is an iPhone 15
     Pro (393×852) rather than the older 9:16, so more realistic, not less, and every pixel
     reaches the figure because everything else reserves a fixed size.
  **Measured at 1280px:** the body is **408px, 52% of the frame**, up from 260 before this
  change and 182 before the layout work started, so **+57% now and +124% overall**. At
  375px it is 358px, up from 198 (+81%). Spread stays **0.00px** on both axes at both
  widths, the copy still sits 8px above the button, and the full sequence was verified
  fresh at both widths (five reveals, closing alone at 5/5, re-tap restoring a description,
  Part 2, Done, Start over). No overflow, no console errors.

- **e513a5b** (2026-08-13) — **Three proposals adopted and moved out of review**, plus a
  bigger Body Mapping figure. From the Aug 13 team review.
  **Moves.** The **Exposition** (Option 2) moved down into its own Exposition section under
  The climb, which until now was a placeholder pointing back up at the proposal; it carries
  the verbatim script, marked "script adopted, build pending" since the text is settled but
  the build is not. The **arcade ideas** and the **gear toolbox** moved to the prototypes
  section as in-development cards. That section is renamed **"Prototypes and In
  Development"** and its note says both traversal games will be fully developed, and that
  what follows them is adopted work being built out.
  **Renumbering.** The three review items left are now 1–3: character progression, Spark's
  voice, Body Mapping. `review-exposition`, `review-arcades` and `review-gear` are retired
  from the demo dropdown following the `review-rename` precedent; their labels stay in
  AdminFeedbackPage so existing rows still read correctly.
  **Body Mapping**, from Josh: the state with the most text left the copy floating well
  above the Continue button, wasting space the figure could use. The copy block now sizes
  itself from an **invisible worst-case spacer** (longest region text plus the closing)
  sharing one grid cell with the live copy, so it is always exactly as tall as it could ever
  need to be and never changes. That frees the figure to be `flex-1` and take every
  remaining pixel while staying pixel-constant, and the live copy is bottom-aligned so it
  sits against the button. The CTA slot needed the same treatment: it is empty for the first
  four reveals and the two button styles differ in height, and that difference otherwise
  landed on the figure and resized the body by 47px the moment Continue appeared. Two
  supporting changes: the **"N of 5" counter is dropped once it reads 5 of 5** (the closing
  and the enabled Continue already say you're done, and the row is worth more to the
  figure), and the frame **reclaims the review card's padding on phones** (`-mx-4`) so it is
  289px rather than 257px, since at 257 every line wrapped taller than it will in the app.
  **Measured across 11 states at 375px and 1280px:** the body is **42% taller on desktop**
  (182 → 260px) and 9% on mobile (182 → 198px), the copy sits **8px above the button** in
  every state, and the body's size and position spread is **0.00px** on both axes at both
  widths. No frame or page overflow, frame stays inside its card, no console errors.
  *Available if wanted: another ~30% on the figure, but only by dropping the last region's
  text in the all-revealed state so the closing stands alone. That is a content call, so I
  left it.*

- **5846cf6** (2026-08-13) — Body Mapping: **the figure no longer resizes between taps**,
  plus a narration note. From Josh reviewing the live demo: "when you click on the
  different parts, the body gets bigger and smaller."
  **Cause:** the figure was the `flex-1` element, so it took whatever room was left after
  the copy panel. Each region's text is a different length (Lungs wraps to two lines, Head
  to seven), so every tap changed the leftover space and the body rescaled.
  **Fix:** inverted the layout. The figure is a fixed share of the frame height and the
  copy block below it is the flexible, scrollable one; the CTA moved outside the scroll
  region so it stays pinned. Two gotchas this needed: `min-h-0` on the figure container
  (a column flex item defaults to `min-height:auto`, which clamps it up to the SVG's
  intrinsic height and silently ignores the basis, giving 372px instead of 202px), and the
  three modes' instruction lines wrap to a different number of lines at every width, so
  they are now stacked in one grid cell with the inactive ones hidden and the slot is
  always as tall as the longest. A fixed min-height can't do that, the line count is
  width-dependent.
  **Frame min-height 620 → 700.** The embed is only ~257px wide, well under a real phone,
  so copy wraps to more lines here than it will in the app. At 620 the end state scrolled
  by 138px; at 700 the single-region states never scroll and only the all-revealed end
  state does, by 59px at 375px and not at all on desktop. Desktop is now 360×700 (ratio
  1.94) rather than 360×640, which sits closer to a modern phone than 9:16 does.
  **Also:** a note above the phone frame saying the activity reads on screen for now and
  gets audio narration once the team picks Spark's voice.
  **Verified** at 375px and 1280px by measuring the silhouette's box relative to the frame
  across 11 states (initial, all five Part 1 taps, Head revealed last, Part 2 start, Part 2
  selected, done, after restart): **height spread 0.00px and position spread 0.00px** at
  both widths. No frame or horizontal overflow, CTA and Start over always inside the frame,
  no console errors.

- **6b12a14** (2026-08-13) — Draft 28: **Spark's voice is now a three-way A/B/C.**
  The two players on review item 5 become three. A and B were overwritten with the new
  versions, C is new, and all three are mirrored from `long-light-site/audio/` into
  `public/long-light/audio/`. The players were two hardcoded blocks and are now mapped
  from a `SPARK_VOICE_OPTIONS` list, so a fourth contender is a one-line change. Labels
  stay neutral (Option A/B/C) since the team is picking blind. Spark's Option-2 intro text
  stays alongside as the shared reference script, and the `review-spark-voice` thread is
  untouched. Description copy avoids the em dash per the standing style rule (the draft's
  suggested line used one).
  **Cache check:** overwriting a.mp3 and b.mp3 at the same URL is safe. `/long-light/*.mp3`
  matches no immutable rule in `vercel.json`, and the live host serves it
  `max-age=0, must-revalidate` with an ETag, so browsers revalidate and get the new bytes.
  No cache-busting query string needed.
  **Verified:** three players render and all three decode and play (37.8s / 41.1s /
  41.1s); the retired `spark-introduction.mp3` is still unreferenced; the thread opens
  preset to `review-spark-voice`; mobile at 375px stacks all three full-width with no
  horizontal overflow; no console errors. No `src/activities` changes, so no version bumps.
  *B and C report a **sample-identical** length, so I checked whether C was an accidental
  duplicate export of B: cross-correlation is 0.021 (a duplicate would be ~1.0), with
  different RMS and peak. They're genuinely different takes that share a fixed-length
  music bed. See the loudness note in the TODO section, it affects the vote.*

- **1f4d072** (2026-08-13) — Draft 27: **the Body Mapping activity is playable.**
  Built from the blueprint in `Gains for Teens/Activities/` as
  `src/components/BodyMapping.jsx`. The SVG is **inlined** rather than embedded as an
  image, so the five region groups take their state from React: `is-active` for the
  Part 1 reveal glow, `is-selected` for the Part 2 amber fill + check badge. Classes are
  `bm-` prefixed and the glow filter id is namespaced so nothing collides with the page.
  **Flow** is no-fail and unscored: Part 1 taps reveal each region's line with an
  "N of 5" counter, all five unlock the closing line + **Continue**; Part 2 clears the
  reveals, switches the instruction, and taps toggle a selection, with **Done** ending on
  the gentle closing. **Region copy and the closing are verbatim Stephanie** (diffed
  against the prototype: 5/5 regions + closing match exactly).
  **Placement:** a new playable item in **Ideas & Demos for Review** with its own comment
  thread (`review-bodymap`, added to the demo dropdown and the admin labels), so it's now
  **item 6**. Deliberately **not** registered as a versioned sandbox activity, since it
  isn't wired into a zone or the SessionEngine yet, so there's no `activityVersions.js`
  entry per CLAUDE.md; that comes when the team blesses it and it moves into Zone 1.
  Two things beyond the draft: a **"Start over"** link on the end screen so reviewers can
  replay, and **keyboard access** (regions are `role="button"`, tabbable, Enter/Space
  activated, `aria-pressed` reflecting state).
  **The 9:16 fit needed a real fix.** Nested inside two padded cards, a strict 9:16 box on
  a 375px screen is only ~257×455, shorter than any actual phone. Once the closing panel
  and the button were both showing, content ran to 569px, overflowed, and squeezed the
  figure to zero height. The frame now carries a 620px `minHeight` and the activity's
  fixed chrome was tightened.
  **Verified** at 750px and 375px: full play-through (reveal 1→5 → closing + Continue →
  reveals cleared, instruction switches → select toggles on and off → Done → closing +
  Start over); no vertical overflow in the worst case at either width; Continue sits fully
  inside the frame; desktop keeps a true 9:16 (360×640, ratio 1.78); no horizontal
  overflow; the comment thread opens preset to `review-bodymap`; no console errors.

- **0d63109** (2026-08-13) — Drafts 25 + 26 (Aug 11 meeting).
  **25A — new Zone 1 traveler art** (face visible with a sad expression, hood/cloak/aura
  unchanged); asset swap only, same 576×1024, renders in the progression strip.
  **25B — the opening zone is now "The Dark Abyss"** in canon. Renamed every user-facing
  reference across the demo (zone title, Zone Map row, the strip's Zone 1 label) and the
  pitch site (h2, zone-map row, aria-label), in both the live copy and the staging source.
  **"Hollowshell" deliberately untouched** (it's the avoidance creature, a separate name).
  Since the rename is accepted, the rename proposal was **removed from Ideas & Demos for
  Review** and `review-rename` retired from the demo dropdown (admin label kept for
  existing rows); remaining review items renumbered, so **Spark's voice is now item 5**.
  **26 — Spark's voice is now an A/B test.** The rejected somber take
  (`spark-introduction.mp3`) is unwired; **Option A** and **Option B** players sit above
  Spark's Option-2 intro text (the reference script both voices read), with a neutral
  prompt asking which the team prefers. The `review-spark-voice` thread is unchanged.
  **Verified:** 3 "The Dark Abyss" refs and **zero** "the Hollow" zone refs; Hollowshell
  intact; Lowreach/proposal gone; items renumbered 1–5; both new players load (37.8s /
  41.1s) and the old file is no longer fetched; new art renders with the updated label;
  `review-rename` absent from the demo dropdown but present in admin labels; no console
  errors.
  *Note: the file is still named `traveler-stage1-hallow.webp` on disk. It's not
  user-facing, so it was left alone rather than churning paths; say the word to rename it.*

- **6c3d6be** (2026-08-06) — **Em-dash cleanup + four lines cut** (in-conversation).
  Rewrote ~25 mid-sentence em dashes across the demo, climb and traversal pages into plain
  sentences (see the new **Writing style** standing rule above). Removed the four lines Josh
  called out: the two arcade "Alternates for comment" / "Framed as lifting/dissolving
  darkness" notes (the `alts` field is gone entirely), "Proposal only … the official
  breakdown below is unchanged," and "Script is the Exposition text in item 1 above."
  **Deliberately kept:** em dashes acting as true separators (titles, label/descriptor
  pairs) and the **verbatim narration scripts** (V2, V3, "What to Expect"), which are
  Stephanie's / Sprang's / Holly's words. **Those three scripts still contain em dashes —
  flagged for Josh** rather than changed, since rewriting them would diverge from the source
  docs. Verified on all three pages: lines gone, rewrites render, no console errors.

- **1febed8** (2026-08-06) — Draft 24: new **"Ideas & Demos for Review"** section at the
  very top of `/gains-demo` — a staging area for proposals/previews to be commented on
  *before* they're folded into the official zones. Amber callout + "Proposals — comment
  before we make them official" ribbon + the draft's intro line. **Six items, each with its
  OWN comment thread**: `FeedbackButton` gained `label`/`subtle` props so it can be dropped
  inline per item pinned to that item's tag (`review-exposition`, `review-character`,
  `review-arcades`, `review-gear`, `review-rename`, `review-spark-voice` — all added to the
  dropdown + admin labels).
  **Moves out of official spots:** (1) the Option-2 **Exposition** text moved up; the
  official Exposition card kept structurally but its body is now a pointer to the review
  section. (2) The **four-stage Traveler strip** moved up; **Playable Character restored to
  its pre-Draft-23 state** (single current Traveler). (6) **Spark's card + intro audio**
  moved up from NPCs, which now holds just the four symptom creatures.
  **Text-only items:** (3) two arcade proposals w/ alternates, (4) the growing-toolbox gear
  idea + theme line, (5) the zone rename **"The Deep"** (alt **"Lowreach"**) with the
  Eastern-Kentucky "holler" rationale — **proposal only, the official breakdown still says
  the Hollow**.
  *Small deviation:* item 6 points at item 1 for the script rather than repeating the same
  ~100-word paragraph twice in one section — item 6 exists to react to how the voice sounds.
  **Verified:** review section renders first; all 6 per-item threads open preset to their own
  tag and a live submission round-tripped as `section=review-rename` (then deleted); Playable
  Character back to one card; Exposition is a pointer; NPCs = 4 creatures, no audio; official
  zone breakdown, 5-row map table and both prototypes unchanged; the Hollow not renamed; no
  console errors.

- **274ab8b** (2026-08-06) — Traveler strip **actually** bigger (Josh: "they aren't any
  bigger just stacked on top of each other" — he was right). b812925 was near a no-op:
  on a phone the strip was **already** `grid-cols-2` and the 452px cap sits above a 375px
  screen, so images stayed 142px — zero visible change; on desktop 157 → 196px just read as
  "4 in a row became 2×2". Now **2-up from tablet width up** (680px container) and **1-up on
  phones**, since two 9:16 portraits side by side on a 375px screen can only ever be
  thumbnails. Both paths land **~310px** — roughly double the original. Measured: 1280px →
  310px each (**+97%** vs the original 157px); 375px → 319px each (**+125%** vs 142px).
  Uniform sizes, no overflow.
  *Lesson for future "make it bigger" asks: check the actual rendered px at the viewport the
  reviewer is using — a max-width cap above the screen width changes nothing.*

- **b812925** (2026-08-06) — Traveler-strip tweaks (in-conversation): Zone 1 label reverted
  from the draft's placeholder **"The Hallow" → "The Hollow"** (matches the zone sections),
  and the progression is now **two per line at every width with each image 25% larger**
  (196px vs the old 4-up's 157px at 1280px) so the darkness lightening between stages reads
  clearly. Verified at 1280px and 375px: 2 columns, images uniform, both rows' captions
  aligned, no horizontal overflow.

- **ae9cb67** (2026-08-06) — Draft 23: **Playable Character now shows the Traveler's
  four-stage progression** instead of a single card — the same traveler with their darkness
  lightening as they climb (the Option-2 promise made visible on the character): Zone 1 —
  The Hallow "Arrives wrapped in shadow." → Zone 2 "The journey begins." (the existing
  image) → Zones 3–4 "The light grows." → Zone 5 · Mount Hope "Fully seen." 4-up on
  desktop, 2-up on mobile, with the draft's lead-in line. Zone labels/captions are the
  draft's placeholder copy, rendered as-is for Josh to tune (note they say **"The Hallow"**
  where the zone sections say "The Hollow"). NPCs section untouched.
  **One addition beyond the draft:** the stage-2 plate is 941×1672 while the three new ones
  are 576×1024, so the strip rendered 1px uneven. `ArtCard` gained an opt-in **`uniform`**
  prop pinning the image to a 9:16 box (`object-cover`), used only by this row — the strip
  is exact now and stays exact if art is swapped at a different size later.
  Verified at 750px and 375px: all four in order, images 200, rendered sizes **identical**
  (143×254 / 142×252), captions pixel-aligned on desktop, grid 4→2 columns on mobile, no
  horizontal overflow, NPC cards unaffected, no console errors.

- **c26f1e4** (2026-08-06) — **Exposition card swapped to the Option-2 text** (Josh's call,
  resolving the ⚠ flagged on 6a47bb8). The card had still held the earlier proposal
  (Shadowveil / Spryte / **Cinder**), which contradicted the rest of the page. Now:
  • intro narration = the **Option-2 Spark line** (Shadowmend), rendered from the **same
  `SPARK_INTRO_LINE` constant the NPCs card uses**, so the two copies can't drift apart,
  plus a pointer to where the recording lives; • the **seven transition phrases are
  pending** — they were written around Cinder and the old level names and no Option-2 set
  exists yet, so they were pulled rather than silently rewritten (**now a TODO for Cowork**,
  above); • dropped the unused `EXPO_INTRO`/`EXPO_TRANSITIONS` constants. Verified **zero**
  occurrences of Shadowveil / Spryte / Cinder anywhere on the page, NPC audio still plays,
  no console errors. **The demo is now internally consistent on Option-2 lore.**

- **6a47bb8** (2026-08-06) — Drafts 20 + 21 + 22, shipped together (the team adopted
  **Option 2**, which has no shadow character).
  **Draft 20 — NPCs section** on `/gains-demo`, right after Playable Character: **Spark**
  featured with art, the recorded **intro narration** (`/long-light/audio/spark-introduction.mp3`,
  `preload="metadata"`, 38.2s) and the line text **verbatim** (all-ASCII source → straight
  apostrophes preserved); then the four **symptom creatures** as art + name + symptom pill,
  no voice lines yet. New feedback option **NPCs** (`section=npcs`) + admin label; `ArtCard`
  regained `tag` support for the pills.
  **Draft 22 — removed the entire "The Shadow" section** (concept copy, the "all light is a
  faced shadow" cosmology, the 3-phase transformation art, and "The narrator's arc"), its
  `SHADOW_PHASES`/`NARRATOR_ARC` data, and the `section=shadow` feedback option. Admin label
  kept for old rows; the three shadow images stay on disk, just unused.
  **Draft 21 — the climb has no pursuer.** The procedural rising wave is gone; tension is now
  the traveler's **own darkness closing in from the screen EDGES** as Second Wind drops (a
  radial "hole" texture driven by `aura`, two rings for depth, slow breathing pulse), with the
  world dimming and the **music ducking** as it presses in, all receding on collect. Added the
  **Second Wind recovery beat** — an orb caught while low shoves the darkness back at once,
  flashes light, and grants a longer surge. **Climber +15%** (48 → 55px) with orbs (14 → 16)
  and collect radius (34 → 39) scaled to match. Stage beats/ledges now just ease and clear the
  edges. All Shadow copy removed from the climb page, the Zone 4 traversal text, and the
  Prototypes card.
  **Tuning note worth keeping:** the aura's first curve (inherited from the pursuer's distance
  math) darkened the frame to 0.55 within ~3s of *every* run — before the first orb can reach
  you. Reshaped to `(1-breath)^1.8` so a healthy Second Wind keeps the frame clear and it only
  bites as you run low.
  **Verified** — harness (real ClimbScene loop, stubbed Phaser) **14/14**: collecting orbs
  peaks at aura **0.12** (clear, ~44s); ignoring every orb → visible at **3.7s**, heavy by
  **7.0s**, capped at 0.92 so the climber is never blacked out, still completes (~91s);
  reduced motion stays clear; 3 stages + both beats intact; **no-fail holds everywhere**.
  Browser: demo order Map → Assent → Playable → **NPCs** → climb → zones → Prototypes with no
  Shadow section; Spark audio loads; dropdown has NPCs, not Shadow; climb mounts, 3 restarts
  keep one canvas + live context, no pursuer asset fetched, no console errors.
  **⚠ Left for the team:** the **Exposition card still holds Stephanie's earlier proposal**
  (Shadowveil / Spryte / **Cinder the shadow creature** / Mount Hope), which now sits beside
  the Option-2 Spark line (**Shadowmend** / Spark / no shadow character). Neither draft asked
  to change it, so it's untouched — but the two world names and the presence/absence of a
  shadow character contradict. Say the word and I'll swap the Exposition card to the Option-2
  text.

- **1e391b6** (2026-07-28) — Draft 19: Zone 3's **second** video ("Getting the best trauma
  therapy") now carries **Holly's shortened script, verbatim** (3 paragraphs, down from the
  numbered-tips version), and its estimate drops **~90 sec → ~60 sec (est.)**. Zone 3's
  first video (Video 3, "These are normal; help works") untouched. Kept verbatim: her
  source is all-ASCII, so the straight apostrophes (won't / they're / else's) and the plain
  **"4-5"** hyphen stay rather than being re-typeset to the curly quotes + en dash the rest
  of the page uses; a comment above the constant says so. Verified all 3 paragraphs match
  the source **character-for-character** (scripted diff), Zone 3 renders both cards with
  the new script + duration, old script and ~90 sec label gone, no errors.

- **9399844** (2026-07-28) — Draft 18: Exposition card now carries **Stephanie's
  intro/transition text, verbatim**, in two labeled parts (the Spark's intro narration +
  the 7 transition phrases); the "Stephanie writing a draft" placeholder is gone. Kept
  deliberately as-written — her wording, her **straight apostrophes** (her source is
  all-ASCII, unlike the rest of the page's curly typography), and her production notes in
  `{}` / `[]` (`{show the shadow creature}`, `{insert gear}`, `[maybe gear for this level
  could be a lantern]`, `[show phase 2 of the shadow]`). A comment above the constants
  says not to "tidy" it. Verified all 8 strings match the working-notes source
  **character-for-character** via a scripted diff; 7 transitions render; no errors.
  **⚠ Naming divergence for Cowork/Josh to reconcile** (left alone on purpose, since the
  ask was verbatim): her text introduces new lore — world **"Shadowveil"**, narrator
  **"Spryte"** (vs the demo's "The Spark"), a companion **"Cinder"** (the shadow creature
  the player is helping become a spark), and the summit **"Mount Hope"** (vs "the
  Beacon"). It also says **"Level"** not "Zone", **"the Hallow"** (demo: "The Hollow"),
  **"the Path"** (demo: "The Lantern Path"), and contains two likely typos — "starting
  help Cinder" and "final assent" (ascent). Notably it also reframes the Shadow: here the
  shadow is a *friend you're helping*, where the demo's Shadow section has it as the
  player's own trauma that pursues them. Worth a deliberate decision before this copy
  propagates into the zones.

- **bec20e5** (2026-07-28) — Climb round 4 + demo copy (in-conversation).
  **The Shadow is now procedural, not a sprite** — Josh found the image goofy and wanted
  "a gradient black wave… translucent." It's drawn as a vertical gradient (clear at the
  crest → ~0.95 ink at the base) with everything above an *undulating carved crest*
  erased, plus soft wisps licking off it; two offset/flipped layers drift against each
  other so the crest moves. Reads as darkness welling up rather than an object.
  `shadow-pursuer.webp` is no longer loaded (**−251 KB** download; file kept on disk).
  Gradient ramps to ~0.85 within a third of the wave so a close Shadow actually darkens
  the lower frame instead of a weak ~40% haze, while the crest stays feathered.
  **Shadow faster again:** round 3 only moved the "threatening" moment ~0.4s (my earlier
  9.2s figure was inflated by a harness artifact — one stray orb; the real number was
  ~5.5s), so this time the **drain** went up where it actually binds: 0.08/0.11/0.135 →
  **0.105/0.14/0.17**, plus curve exponent 2 → 2.4 and ease 0.045 → 0.06.
  **Demo Zone 4 script** now ends with "For example, here is a cool trick called
  'grounding' that can help your brain hit the pause button when you are upset." — hands
  off into the 3-3-3 activity.
  Measured (14/14 harness assertions pass; harness fixed to truly collect **zero** orbs in
  the ignore scenario, so these are honest): ignoring every orb → Shadow **on screen 2.2s**,
  **within 150px at 3.9s** (was ~5.5s), right behind by ~9.5s, closing to the 36px floor,
  still completes (~91s), still never contacts. Collecting orbs → **~44s**, stays ~179px
  away, never close.

- **9efaf02** (2026-07-28) — Climb round 3 (in-conversation). **Air whoosh wired** as the
  orb-collect sound (Josh's "Woosh 1" →
  `public/gains/climb/audio/sfx-air-intake.mp3`) — resolves the Cowork TODO. The clip is
  1.15s and orbs arrive ~every 1s, so it plays through ONE reusable Sound instance that
  stops+retriggers per collect rather than stacking whooshes; volume 0.45.
  **Stage holds tripled** (1800 → 5400ms). **Shadow pursuit sped up** — Josh: ignoring
  orbs, it didn't come fast enough. Because its position is breath-derived, the real
  bottleneck was the drain timeline, so three coupled changes: ease 0.02 → 0.045
  (`SHADOW_EASE`), breath→distance curve **squared** (`SHADOW_BREATH_CURVE`, so it starts
  closing while breath is still moderate), and per-stage drains 0.055/0.075/0.095 →
  **0.08/0.11/0.135**. Measured (Node harness, real update loop, 14/14 assertions pass):
  ignoring every orb → Shadow **on screen at 3.3s** (was ~8s) and **within 150px at 9.2s**
  (was ~13s), closing to the 36px floor, still completes (~84s), still never contacts.
  Collecting orbs → **~44s**, Shadow stays ~247px away and never gets close. Punishes
  ignoring orbs without threatening a player who plays along; no-fail intact everywhere.

- **6c31139** (2026-07-27) — Climb round 2 (in-conversation) + adversarial-review fixes.
  Josh's notes: **orb SFX removed** (beep didn't fit — music + haptic remain; see the
  TODO-for-Cowork above for the air-intake replacement); **climber +20%** (40 → 48px);
  **new instructions copy** (air thinning near the summit / use your Second Wind gear to
  collect oxygen / the Shadow is closer than you think — climb quickly); **stage-arrival
  beats** — crossing into a stage holds the climb 1.8s and names it ("You reached the
  Great Mountain! / Keep going!", "You reached the Crystal Spire — almost there!"),
  pausing breath drain and pushing the Shadow back; finite by construction so the ascent
  always resumes and still completes; rest-ledge text suppressed during a beat.
  **Review fixes** (3-lens adversarial review of the climb; 7 confirmed findings → 3 real
  issues): (a) pre-start idle bob wasn't gated on `prefers-reduced-motion` (the canvas
  shows through the translucent overlay) — now gated; (b) orb/mote pulse tweens are
  `repeat:-1` and Phaser's `destroy()` does **not** kill tweens targeting an object, so
  they piled up writing to dead objects — both scenes now destroy via
  `removeOrb()`/`removeConn()` which `killTweensOf` first (**this also fixed the
  already-shipped flight scene**); (c) rest-ledge text had no depth and sat behind the
  opaque depth-5 plates so it was never visible — already resolved by the stage-beat work
  (both text layers now at depth 72/74).
  **Verification:** built a Node harness that drives the REAL `ClimbScene.update()` loop
  against a stubbed Phaser (the headless preview pane never fires `requestAnimationFrame`,
  so the loop can't run there) — **12/12 assertions pass** across normal / breath-pinned-
  empty / reduced-motion runs: completes exactly once, all 3 stages, both beats at
  p=1/3 and 2/3, p monotonic, orbs collect, Shadow never reaches the feet (min gap 36px).
  Flight page regression-checked in a browser. **Measured pace:** ~37s collecting orbs
  freely, ~52s at base rate, **~91s collecting none** (the 0.55 weary floor) — the draft
  target was 40–60s, so the passive tail runs long; knobs are the surge (1.5), the floor
  (0.55) and `durationMs`. Awaiting Josh's device play-through before tuning.

- **0e2704d** (2026-07-27) — Climb scale pass (in-conversation): the climber read way too
  big, so figure height **300 → 40px** (~1/8) — a tiny traveler against a vast wall, per
  the visual-style guide. Everything sized off it followed: orbs 46 → **14px** wide,
  collection radius 62 → **34** (still forgiving on a thumb, but you must steer — 34 in a
  302px lane), smaller/slower collect burst, reduced bob. Also had to pull the **Shadow's
  approach distances** in (near edge baseY+120 → +36, clamp +95 → +22) — tuned for the
  300px climber, they'd have read as "not chasing" next to a tiny one; still strictly
  below the feet so no contact, no-fail intact. Sizes are now named constants
  (`CLIMB_FIG_H`, `ORB_W`, `COLLECT_R`) at the top of `climbScene.js` — further tuning is
  one number.

- **c0ce3b9** (2026-07-27) — Draft 17: **"The Ascent"** — the second traversal (Zone 4→5
  climb), built by reusing/extending the Draft 8 engine. `src/game/climbScene.js`:
  vertical one-thumb climb through three crossfading stages (tree → mountain → spire)
  brightening to the Beacon; 3-frame climb cycle (right→mid→left→mid), bottom-anchored;
  **Second Wind** breath meter drains faster at altitude, refilled by orbs that drift
  down (each = speed surge + sfx + haptic); **the Shadow** wells up from below, closing
  when breath is low and receding when high, hard-clamped so it can NEVER catch you; rest
  ledges pause the drain and push it back; empty breath only makes the climb weary (rate
  floor 0.55), never fatal; Beacon bloom → `onComplete({ orbsCollected })`.
  **Engine reuse:** `<TraversalGame>` is now **mode-switched** (`flight` | `climb`) — one
  wrapper owns the shared lifecycle (lazy-loaded Phaser, `destroy(true)` on unmount,
  restart-in-place replay that keeps the unlocked iOS AudioContext, live mute). A third
  traversal = a `MODES` entry + a scene file. Playable at **/gains-demo/climb**, linked
  from Zone 4's traversal beat and a new **Prototypes** section listing both playables
  side by side. Assets at `public/gains/climb/` (+`audio/`).
  **DEVIATION:** Zone 4's traversal was Draft 12's (pending) underwater Oxygen-Mask
  flight; Draft 17 defines the Zone 4→5 traversal as this climb, so that description was
  replaced (gear stays the Oxygen Mask). Flagged to Josh — easy to restore. Feedback tags
  `zone-4` (the retired `traversal-prototype` option is gone from the dropdown).
  **Verify note:** routes + all 10 assets 200, 540×960 WebGL canvas mounts, instructions
  → Begin works, **5 in-place restarts keep exactly one canvas with a live context**, no
  console errors, build passes (climbScene splits to its own ~9KB chunk; phaser stays
  separate). The RAF-driven climb itself can't run in the headless pane — device
  play-through pending; an adversarial 3-lens code review of the new logic was run in
  parallel.

- **ed80698** (2026-07-27) — Drafts 15 + 16 (demo). **Draft 15:** added **"The narrator's
  arc"** subsection inside The Shadow — the Spark's thread through the journey in five
  beats (Early hint → naming it → the reveal → the transformation → Your Spark) with
  their lines, carrying the post-traumatic-growth idea (light = the strength grown from
  facing the dark, with help). **Draft 16:** (1) dropped the choose-your-character set —
  Playable Characters now shows a **single protagonist**, the new human-faced Traveler
  (`avatar-human-traveler.webp`, "You play as the Traveler"); Creature/Construct/old
  hooded Traveler no longer displayed (files kept in repo; the `/long-light/` pitch 4-up
  left for a later cleanup). (2) Exposition placeholder → **"Stephanie writing a draft."**
  No version bumps. Verified on a prod preview: single Traveler card, narrator arc (5
  beats + lines), Exposition text, avatar 200, no console errors, build passes.

- **564580e** (2026-07-23) — Drafts 13 + 14: added **"The Shadow"** section to the demo
  (after Zone 5, "Concept in development") — the antagonist arc that spans the journey:
  what it is, how it resolves (you **face** it, never fight/destroy — it burns down to a
  **Spark** you carry onward), the locked cosmology ("all light in this world is a faced
  shadow"), and how it's built in (build-up / training / climax, no-fail). Includes the
  **three-phase transformation arc** — Looming (`shadow.webp`) → The Turning
  (`shadow-phase2.webp`) → Your Spark (`shadow-phase3.webp`). Also replaced the Playable
  Characters **Traveler placeholder with a real card** using the redesigned
  `avatar-traveler-1.webp` ("Hooded and wrapped, a warm light in hand") — same filename,
  so the `/long-light/` pitch character-select gets the new Traveler too. Feedback dropdown
  + admin gained **The Shadow** (`section=shadow`). No version bumps. Verified on a prod
  preview: Shadow section after Zone 5 with 3 phases + copy, Traveler card real (3
  avatars), shadow art serves 200 image/webp, dropdown has The Shadow, build passes.
  *(Draft 13 introduced the section with a TBD art slot; Draft 14 filled it with the
  3-phase art + real Traveler — shipped together.)*

- **2a4b57b** (2026-07-17) — Demo: moved the **Wingsuit gear + playable bird-flight
  traversal from Zone 2 → Zone 3** (flight now climbs Mistfields → Bright Reaches; Zone 2
  traversal is a placeholder again). Gear is now **TBD** for Zone 1 (was An Anchor) and
  Zone 2 (was Wingsuit); Zone 3 gear = the Wingsuit (was Hope); map-table gears updated
  to match. **Zone 4** got the real **"What to Expect from Therapy"** script (Sprang's
  doc) in place of the pending placeholder, and the Mindfulness activity is now the actual
  **3-3-3 rule** (3 see / 3 hear / 3 deep breaths with an expanding circle) from the same
  doc; map-table Zone 4 video no longer marked pending. No version bumps. Verified: one
  play link, in Zone 3 only; gears correct; Zone 4 script + 3-3-3 render; build passes.

- **b7cd9dd** (2026-07-17) — Demo tweaks (in-conversation): Zone 2 gear → **"A Wingsuit
  — lets you take flight"** (was A Lantern; matches the flight traversal), in both the
  map table and the zone. Renamed the top section **"Zone Map — the roadmap" → "World
  and Development Map."** Added a new **Exposition** section right before Zone 1 — a
  placeholder for the intro that sets up the world (what is this place / what are they
  doing here / why are these creatures telling me about trauma). Retuned the demo's
  **feedback options** to the reorganized structure: Child Assent / Measures · Exposition
  · Zone 1–5 · General Feedback (demo defaults to General; the traversal prototype page
  defaults to Zone 2). Admin keeps the retired section slugs labeled for old rows. No
  version bumps.

- **0ce5ddd** (2026-07-17) — Draft 12 (supersedes + folds in Draft 11): restructured the
  GAINS demo (`/gains-demo`) to read like the game flow, top→bottom — **Zone Map**
  roadmap (world-map image + 5-col table, "updated as we go") → **Child Assent &
  Measures** (renamed, in dev) → **Playable Characters** (The Construct + The Creature +
  a Traveler "redesign in progress" placeholder; Wayfarer removed) → **Zone 1–5** sections
  (each: zone image, in-zone character chips — Spark everywhere + the 4 messengers in Zone
  2 — video/script, activity, gear, and the traversal to the next zone). Zone 2's
  traversal links the playable bird-flight prototype; Zone 4's is the pending underwater
  flight (Oxygen Mask). Folded in from Draft 11: **narrator = The Spark only** (Lantern
  Keeper dropped), new **"Getting the best trauma therapy"** script (Zone 3), updated
  lemon/colored-glasses **Growth Mindset** script (Zone 5). Removed the old standalone
  Videos / Activities / Concept Art / Pitch sections (content now lives in the zones,
  characters, and map). Feedback sections retuned (zone-map / assent-measures /
  characters / videos / activities / traversal-prototype / general); admin keeps retired
  slugs labeled for old rows. No version bumps. Verified in dev: page order, all
  zone/character art 200, Zone 2 messengers + play link, no old sections, no errors,
  build passes. *(Note: this commit sits on top of the parallel Ready-for-Roots work
  stream's commits — Child Assent, IRB preview, Pretest/Posttest — on shared `main`;
  history is linear and intact.)*

- **483ba76** (2026-07-17) — Traversal tweak (in-conversation): raised the bird's resting
  position from 0.72 → 0.62 of the frame height (up a bit, between its old lower-third
  spot and centre; also lengthens the runway for the top-descending connections). One
  constant in `traversalScene.js`. Bird placement isn't RAF-independent-verifiable in the
  headless pane — quick eyeball on device.

- **38e6977** (2026-07-17) — Drafts 9 + 10: GAINS demo page additions (both edit
  `/gains-demo`). **Draft 9 — Videos section** (after Activities): the four
  psychoeducation scripts verbatim — Trauma 101 Videos 1–3 + the Growth Mindset script —
  each card with track + duration + zone mapping, a "Video in production" pill, and the
  script (Video 2 keeps its on-screen-label production note); structured so the real
  Vimeo player drops in later. New feedback tag `section=videos`. **Draft 10A —
  Activities:** replaced the empty state with two placeholder cards (Body Mapping,
  Character Examples) marked "Interactive version in development," full descriptions from
  Stephanie's July 17 doc. **Draft 10B — narrator slot:** now shows both options (The
  Spark, The Lantern Keeper) with art + descriptions under "Narrator — two options (which
  fits best?)," inviting a preference via feedback; 2 new WebP in `public/long-light/art/`.
  Admin feedback gained the `videos` label. No `src/activities` changes → no version
  bumps. Verified in dev: all cards render, both narrator images 200, feedback dropdown
  has Videos, no errors, build passes.

- **fee9ff4** (2026-07-17) — Traversal replay-audio fix + arrival copy (in-conversation).
  A 3-lens adversarial code-review workflow on the Draft 8 changes found one real bug:
  replaying by remounting the game minted a fresh AudioContext outside the tap handler,
  which WebKit/iOS starts suspended with no gesture left to unlock — so music + collect
  SFX went silent on every "Fly again," and *permanently* in reduced motion (no steering
  touch to unlock). Fix: replay now restarts the scene **in place** on the one
  already-unlocked game (`scene.restart()` via a `restartSignal` prop) instead of
  remounting; music is created once and reused, `startMusic()` resets volume (arrive
  fades it out) and restarts cleanly. Also Josh's arrival copy: **"You gathered N
  Connections! / You are ready for the next challenge."** (was "You reached the light.")
  Josh confirmed the live prototype plays great on device.

- **7552b51** (2026-07-17) — Traversal audio + goal + instructions (in-conversation).
  Wired the two MP3s Josh made: a looping background track (`music-ascent-loop.mp3`,
  starts on begin / mobile audio-unlock) and a collect beep (`sfx-collect.mp3`) on each
  connection, plus a live mute toggle. Added the intro **instructions screen** (how to
  play + the goal; "Begin the climb" gates the flight via the `traversalStarted`
  registry flag) and made the win condition **gather 50 "connections"** — the ascent is
  now collection-driven (each connection eases the climb dark→gold; 50 = arrival),
  counter shows N/50. Still no-fail. (Superseded same day by fee9ff4's replay-audio fix.)

- **ea493a4** (2026-07-17) — Traversal tweak (in-conversation, no draft): connection
  lights now **descend from the top** of the channel and drift down toward the bird as
  it climbs (was spawning below and rising) — reads as flying up to meet the lights
  ahead, and gives a longer intercept runway. Ambient ember particles still rise
  (atmosphere). Prototype + demo copy updated to match. (Still can't run the RAF loop
  in the headless pane — worth an eyeball on device.)

- **83f6757** (2026-07-17) — Draft 8: first Phaser traversal prototype + **reusable
  Tier-2 game foundation**. Added Phaser 3 (`phaser@^3.90.0`), lazy-loaded via dynamic
  `import('phaser')` so it code-splits into its own ~1.48 MB chunk — main bundle
  unchanged. `src/game/traversalScene.js` (`makeTraversalScene(Phaser)` factory) is the
  engine-agnostic vertical no-fail ascent: ravine plate pans dark→gold over ~35s,
  one-thumb bird steering clamped to a channel (can't crash/fail), rising collectible
  "connection" motes, parallax fg + ambient/trail particles, procedural glow+vignette
  textures, arrival bloom → `onComplete({ motesCollected })`; config via the
  `traversalConfig` registry key; `prefers-reduced-motion` → calm auto-centred path.
  `src/components/TraversalGame.jsx` is the React wrapper (dynamic import, base
  540×960 `Scale.FIT`, `destroy(true)` on unmount, replay via `key` remount — state in
  React). Playable at **/gains-demo/traversal** (`GainsTraversalPage`) with a
  Replay/Fly-again beat; linked from a new **Prototypes** card on `/gains-demo`. Not
  wired into the real SessionEngine yet — but engine-agnostic so that refactor is
  trivial (this is the reusable foundation, per the ambition note). Feedback reuses the
  shared pipeline tagged `section=traversal-prototype` (new `defaultSection` prop
  preselects it on the prototype page) — no schema/edge-fn change. Art static at
  `public/gains/traversal/`. **Verify note:** the headless preview pane doesn't fire
  `requestAnimationFrame`, so the timed loop/arrival couldn't be exercised there;
  verified instead: WebGL canvas mounts, assets 200, no errors, clean disposal across
  6 replays (canvas stays 1), feedback tag round-trip, prod build passes. Worth a live
  play-through on a real phone before the next meeting. INFRASTRUCTURE.md change-log
  entry added.

- **94a66a4** (2026-07-17) — Draft 7: GAINS Teens demo page at **/gains-demo**
  (unlisted React route, `src/pages/GainsDemoPage.jsx`), mirroring the RfR `/demo`
  pattern with the RfR feedback system reused. Sections: Pre/Post Measures & Consent
  ("In development"), Activities (empty state, RfR pattern), Concept Art (4 player
  avatars, 4 messengers w/ symptom labels, world map, 5 zones — all reusing the WebP
  served from `/long-light/` via absolute paths; narrator "art coming" slot), and the
  written Gameplay Loop & Zone Map spec verbatim from the pitch page's spec panel.
  Feedback: migration `feedback_add_program_section` added `program` (default
  `ready-for-roots`, backfills old rows) + `section` to `public.feedback`;
  `submit-feedback` edge fn → v5 (accepts `program`/`section`, program allow-listed);
  GAINS modal has a Section select (pre-post / activities / concept-art / pitch /
  general); `/admin/feedback` gained a Program filter, GAINS badge + section tag, and
  program/section in the CSV. Verified end-to-end: test submission landed tagged
  `gains-teens` + `concept-art` (then deleted); RfR demo regression-checked
  (unchanged). Change-log entry in INFRASTRUCTURE.md (note there: the v5 deploy
  flipped `verify_jwt` false→true — harmless with the legacy anon JWT, redeploy with
  false if the client ever moves to `sb_publishable_*` keys).

- **dd4d1cc** (2026-07-17) — Draft 6: added `<base href="/long-light/">` to the pitch
  page `<head>` so relative asset paths resolve correctly at BOTH `/long-light` and
  `/long-light/` (no-slash URL serves 200 rather than redirecting, so relative refs
  were resolving against `/` and 404ing — every image broken for anyone whose email
  client stripped the slash). No internal anchors/links affected. Verified live: base
  tag serving on both URL forms.

- **d3cf367** (2026-07-08) — Spec §3 "The frame" copy replaced (in-conversation, no
  draft): now the participant-focused framing — "an adventure the participant plays,"
  quest to understand what trauma is / how it shows up / how people find their way to
  help; ends at the Beacon as "proof that help is real and within reach." Drops the
  "game, not a dream / no falling asleep" negation line from Draft 5.

- **2df2b73** (2026-07-08) — Premise copy trim (in-conversation, no draft): removed the
  second premise line ("It's built for any teen heading toward trauma therapy — turning
  it over, referred, or just starting — and it never hangs on a specific appointment.").
  The premise now ends on "The climb is the intervention; the light is where help is
  real."

- **7a743a0** (2026-07-08) — Draft 5: adventure reframe of the pitch page (game, not
  dream; no "therapy is tomorrow"). Hero has both stacked taglines + "Scroll to begin";
  premise is "It starts with a light in the distance" (any teen heading toward trauma
  therapy, no specific appointment); ending is arrival at the Beacon ("You reach the
  light"), stats kept. Spec panel: 5-beat loop incl. the pending non-violent "Clear an
  obstacle" beat; §3 renamed "The frame" with the adventure framing; global scrub on
  kept sections ("traveler" not "creature", "toolkit for what's next", "brightening
  slopes" in Zone II card + §5 table). Gallery: new "Choose your traveler"
  character-select (Traveler / Creature / Wayfarer / Construct, equal size, 4-across
  desktop → 2×2 → 1-wide); messengers regrouped under "Those who walked before you".
  Four avatar WebP added to `public/long-light/art/`. Scroll engine untouched; no
  version bumps. Remaining "dream/asleep/appointment" words on the page are only the
  approved copy that negates the old frame.

- **fb7e3c4** (2026-07-08) — Draft 4: split /long-light/ caching in vercel.json — HTML
  (bare path, trailing slash, *.html) gets `no-cache, must-revalidate`; *.webp gets
  `public, max-age=31536000, immutable`. Fixes the stale-HTML risk from Draft 1's
  blanket cache exclusion so the plain URL always revalidates the document while art
  stays long-cached.

- **e70e070** (2026-07-02) — Draft 3: added "The World & Its Travelers" concept-art
  section to the pitch page, after the spec appendix and before the footer. World map
  as tall centerpiece (500px), the hooded Traveler featured larger (560px — clearly
  the hero), then a 2×2 grid (1-wide mobile) of the four messenger creatures with
  image + name + description. Six WebP assets (~325 KB) at `public/long-light/art/`;
  dark-ink captions (section sits at the bright gold end of the scroll). **Deviation
  from the draft:** the closing note says "final clinical wording is pending CTAC
  review" instead of naming Stephanie — consistent with the 3114867 name scrub. Also
  brought the full `long-light-site/` staging folder (incl. Concept Art source PNGs)
  into git.

- **3114867** (2026-07-02) — Spec panel copy scrub (in-conversation, no draft): removed
  the "Clinical wording is Stephanie's to own; these are the vessels" line from §4,
  changed §5 to just "pending" (intro + both Part 2 table cells — no Stephanie), and
  removed both names from the spec header meta line ("concept mapped against CTAC
  Part 1"). Also brought `Gains for Teens/long-light-site/index.html` (the staging
  source of truth) into git.

- **8f1d90f** (2026-07-02) — Draft 2: refreshed the live pitch (`public/long-light/`,
  https://ssi.ctac.app/long-light/) for the July 6 team pitch. Swapped the five
  painterly PNGs (~18 MB) for the new vector-silhouette WebP plates (~282 KB total —
  this also closes the Draft 1 image-optimization follow-up). Each zone card now has a
  short description + labeled **Video / Challenge / Clinical goal** fields (pending
  items muted italic; no gear on cards). Appended sections 1–5 of the Gameplay Loop &
  Zone Map spec as a cream reading panel before the footer — zone-map `<table>`
  (horizontal-scroll on narrow screens, **Gear earned column kept**) + the Video 3
  note; section 6 (open questions) omitted. Scroll engine untouched. No
  `src/activities` changes → no version bumps. vercel.json rules are path-based, so
  they cover `.webp` with no edit.

- **c8b0369** (2026-06-30) — Draft 1: hosted "The Long Light" concept pitch as a
  static page at `public/long-light/`. **Live at https://ssi.ctac.app/long-light/**
  (verified serving on the domain: `/long-light/` → 200, 15,963-byte pitch page, all
  5 zone PNGs → 200). Copied the staged scroll-to-ascend `index.html` + 5 zone PNGs in
  verbatim; excluded `/long-light/` from the vercel.json SPA rewrite (so the static
  files serve, not the SPA fallback) and from the global no-cache header (so the ~18 MB
  of PNGs cache). Verified in preview: all 5 plates load in order, dark→gold brighten
  on scroll, no 404s. Unlisted — not linked from app nav or `/demo`. (PNGs left
  unoptimized; see note below.)
  **Domain gotcha:** Draft 1 said the target was `ctac.app/long-light/`, but the SSI
  app actually serves at the **`ssi.ctac.app`** subdomain — the bare `ctac.app` is a
  different Vercel project (`sts-bsc-manager`). Use `ssi.ctac.app` for all SSI/GAINS
  URLs (see Project anchors).

> **Follow-up (optional):** the 5 zone PNGs total ~18 MB. No image-optimization tool
> (sharp / cwebp / ImageMagick) was available in this environment, so they shipped
> as-is — heavy but functional. If revisited, convert to ~1–2 MB WebP/JPG and update
> the five `url("zoneN.png")` refs in `public/long-light/index.html`.

---

## ⬆ Ideas / drafts for the next Claude Code session (Claude Cowork → Claude Code)

<!-- Add new drafts BELOW this line, newest at the bottom. -->

### Draft 1 — Host "The Long Light" concept-pitch page on ctac.app (static, in public/) — ✅ SHIPPED c8b0369 (2026-06-30)

**Context.** As a team pitch for the GAINS for Teens world concept ("The Long Light"),
Claude Cowork built a standalone, scroll-to-ascend HTML page: as you scroll, the page
rises from near-black into warm gold (a beacon glow swelling at the top, drifting light
motes), walking through five environment zones, each captioned with the gameplay loop it
carries. The medium performs the intervention. Josh wants it hosted on ctac.app as part
of this app's normal deploy — **no new Vercel project** (cost).

**Source.** A deploy-ready copy is staged at `Gains for Teens/long-light-site/` —
`index.html` plus `zone1.png`–`zone5.png`, with all image refs already web-safe
(lowercase, no spaces). (The originals in `Gains for Teens/` have spaces/mixed case; use
the staged copy, which is case-correct for a case-sensitive server.)

**Do:**
1. Copy `Gains for Teens/long-light-site/` into the app as `public/long-light/` (so
   `public/long-light/index.html` + the five PNGs). Target URL: **ctac.app/long-light/**.
   These are plain static assets — NOT part of the React/Vite app: no routing, no
   Supabase, no imports, no build step. The page is self-contained (one Google Fonts
   `<link>`; otherwise inline CSS/JS).
2. Verify the Vercel SPA rewrite (vercel.json) doesn't swallow it. Filesystem files
   normally take precedence on Vercel, but confirm `/long-light/` serves the static file
   rather than the SPA `index.html` fallback; add an explicit rule for `/long-light/(.*)`
   if needed.
3. Do NOT link it from the app nav or `/demo` — it's an unlisted internal pitch URL for now.

**Optional (recommended if quick):** the 5 PNGs total ~18 MB, heavy for a web page.
Convert to optimized JPG/WebP (~1–2 MB each) and update the five `url("zoneN.png")` refs
in `index.html` to match. Not required to function.

**Verify:** load `/long-light/` in preview — all five plates load in order (Hollow →
Lantern Path → Mistfields → Bright Reaches → Threshold), the background brightens
dark→gold on scroll, no image 404s in console/network. No `src/activities` changes, so
**no activity version bumps**. Append the usual Recently-shipped bullet after push.

*End of Draft 1.*

### Draft 2 — Update "The Long Light" pitch page: new vector art + per-zone detail + concept spec appendix — ✅ SHIPPED 8f1d90f (2026-07-02)

**Context.** Refresh the live pitch (`public/long-light/`, https://ssi.ctac.app/long-light/) for the July 6 team pitch: (a) swap in the new vector-silhouette art, (b) give each zone concrete detail, and (c) append the written concept as a readable spec at the end.

**Assets (already staged).** `Gains for Teens/long-light-site/` holds `zone1.webp … zone5.webp` (~28–69 KB each) and `index.html` (image refs already point to the `.webp`). Treat `long-light-site/` as the source of truth; sync it to `public/long-light/` at the end.

**Deploy mechanics.**
- Sync `public/long-light/` to the source: updated `index.html` + `zone1–5.webp`; **delete the old `zone1–5.png`** (~18 MB painterly plates from Draft 1) so only the `.webp` remain. Copy only `index.html` + `zone*.webp` (ignore any locked source PNGs left in the staging folder).
- Keep the Draft 1 `vercel.json` handling for `/long-light/` (SPA-rewrite bypass + caching); confirm it applies to `.webp`.

**Keep untouched** the existing scroll engine: the dark→gold scroll-driven background, beacon glow, drifting motes, and reveal-on-scroll. Only the content below changes.

**Change 1 — per-zone cards.** Each of the five zone cards keeps its image + name, and adds a short description plus three labeled fields — **Video, Challenge, Clinical goal**. **Do NOT show a "gear earned" field on the cards.** Render "pending" text muted/italic. Copy:

- **Zone I — The Hollow**
  - Description: The dark valley floor. A single candle in hand, and a warm beacon impossibly far above — the first glimpse of where you're headed.
  - Video: What trauma is — a definition and examples, and how the body reacts and can't seem to relax afterward.
  - Challenge: Body Mapping — reveal how five areas of the body react, then tap the reactions you've felt.
  - Clinical goal: Understand what trauma is; normalize the body's responses.
- **Zone II — The Lantern Path**
  - Description: Waking slopes, and a winding trail of lanterns to relight as you climb up out of the dark.
  - Video: The four reaction types — reactivity, intrusion, avoidance, and negative mood or thoughts.
  - Challenge: Character Examples — meet the four messenger creatures and recognize each one's symptom type.
  - Clinical goal: Recognize and name common trauma reactions.
- **Zone III — The Mistfields**
  - Description: Above the first clouds, where light finally breaks through the mist.
  - Video: These reactions are normal — trauma doesn't define you, recovery happens with support, and therapy is part of that support.
  - Challenge (pending): A light, reflective bridge beat (TBD) — a message, not a drill.
  - Clinical goal: Normalize and instill hope; bridge toward getting help.
- **Zone IV — The Bright Reaches**
  - Description: Over the cloudline into open, warm, sunlit highland.
  - Video (pending): Part 2 — pending. What to expect from therapy.
  - Challenge (pending): To be designed with CTAC.
  - Clinical goal: Demystify therapy; reduce fear of the unknown.
- **Zone V — The Threshold**
  - Description: The summit and the Beacon — the door that opens into light.
  - Video (pending): Part 2 — pending. Shame and reluctance to reach out; hope; then arrival.
  - Challenge (pending): To be designed with CTAC.
  - Clinical goal: Address shame; end on readiness to go.

**Change 2 — spec appendix.** After the "morning / You wake" section and before the footer, add a new section presenting the f
### Draft 3 — Add a "The Travelers" concept-art section to the pitch page — ✅ SHIPPED e70e070 (2026-07-02)

**Depends on Draft 2** (adds a section to the same `public/long-light/index.html`). Can ship together with Draft 2 or right after.

**Context.** Add a concept-art gallery to the pitch page so the team can see the world's characters. The **main character (the covered traveler) should be featured noticeably LARGER than the four creatures** — it's the hero.

**Assets (already staged, web-optimized WebP).** In `Gains for Teens/long-light-site/art/`:
- `map-and-world.webp` (the full journey map + world overview — the winding lantern-and-glyph path from the dark valley up to the Beacon; doubles as the “follow the map” object and the world establishing shot)
- `main-character.webp` (the hooded, fully-covered traveler, glowing eyes, holding the phone)
- `emberwick.webp`, `mirefly.webp`, `hollowshell.webp`
- `dimmet.webp` (hunched creature carrying a heavy stone, its glow turned low)

**Deploy note:** sync the whole `art/` subfolder into `public/long-light/art/` (in addition to the Draft 2 files). Same vercel.json static handling applies.

**Placement.** A new section titled **"The World & Its Travelers"** AFTER the spec appendix panel (from Draft 2) and before the footer.

**Layout.**
- Intro line under the title: *"The world of The Long Light, and the ones who walk it."*
- **Open with the world:** feature `map-and-world.webp` as a tall centerpiece at the top of the section (it is a vertical 9:16 epic — let it be large and striking), with the world caption beside or below it.
- **Featured:** the main character image, large (roughly the width of two creature cards / a hero row), centered, with its caption beside or below it.
- **Below:** a responsive grid (2×2 on desktop, 1-wide on mobile) of the four creature cards — image + name + description.
- The concept art already has its own dark backgrounds, so cards can sit on the page's atmospheric background; put captions in a legible light color (add a subtle translucent dark scrim behind caption text if contrast needs it). Keep the existing scroll engine untouched.

**Copy.**

- **The World (the map).** One climb, five regions. The path winds up from the dark valley where you wake — past the glyph-stones and lanterns left by those who came before, over the mist bridge, and into the light — to the Beacon at the summit. It is the map you are told to follow and the world you will cross.
- **The Traveler (you).** Every inch covered for a cold, unfamiliar country — so anyone can be the one inside the hood. The phone you fell asleep holding is now the light you carry. This is who you become the moment the dream begins.
- **The Emberwick — reactivity / hypervigilance.** Huge ears catch every sound and its lantern flares at the smallest one; it never sleeps. It learned, from someone who'd walked this path before, to tell true danger from its echoes — and its flame finally learned to rest.
- **The Mirefly — intrusion.** It circles the same flame, trailed by fading images of itself, reliving one moment on a loop. With help it saw the memories for what they were — echoes, not the thing returning — and the circle opened.
- **The Hollowshell — avoidance.** It sealed itself inside a shell to feel safe, until nothing war
### Draft 4 — Fix caching so /long-light/ serves fresh HTML (currently stale) — ✅ SHIPPED fb7e3c4 (2026-07-08)

**Problem.** After Drafts 2–3 shipped, the new page is live and correct — confirmed by fetching `https://ssi.ctac.app/long-light/index.html?v=TEST`, which returns the vector art, per-zone Video/Challenge/Clinical-goal fields, the spec panel, and the "The World & Its Travelers" gallery. **But the plain URL `https://ssi.ctac.app/long-light/` still serves the STALE Draft-1 HTML** (old zone captions, no spec panel, no gallery). This matters: the team is about to be emailed the plain link and must see the current page.

**Root cause.** Draft 1 excluded `/long-light/` from the app's global no-cache header so the images would cache — which also lets `index.html` get cached (CDN/browser) and served stale.

**Fix.** Split caching by type for `/long-light/` (in `vercel.json` headers, or wherever Draft 1 set the exclusion):
- **HTML** (`/long-light/`, `/long-light/index.html`, any `.html`): `Cache-Control: no-cache, must-revalidate` (always revalidate, so document is fresh).
- **Static assets** (`.webp` and any images): keep long cache, e.g. `Cache-Control: public, max-age=31536000, immutable` (safe — content is stable, filenames are the version).

Then redeploy (purges the Vercel edge cache for the path).

**Verify.** Fetch the **plain** URL `https://ssi.ctac.app/long-light/` (NO query string), fresh, and confirm it now returns the NEW content: per-zone Video/Challenge/Clinical-goal, the "Gameplay Loop & Zone Map" spec panel, and "The World & Its Travelers" gallery with all six art pieces. Confirm the HTML response carries a `no-cache`/`must-revalidate` `Cache-Control`, and that the `.webp` still return 200 (cached). No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 4.*

### Draft 5 — Rebuild "The Long Light" pitch page for the adventure reframe (replaces current content) — ✅ SHIPPED 7a743a0 (2026-07-08)

**Context.** Sprang's feedback: reframe from a *dream* to an *adventure game*, drop the "therapy is tomorrow" timeline, add the obstacle beat, keep all metaphors non-violent. This rewrites the page Drafts 2–3 built. **Keep the scroll engine exactly as-is** (dark→gold scroll background, beacon glow, drifting motes, reveal-on-scroll) — only content/copy and the gallery change. Make sure the Draft 4 caching fix is in place so the new page serves fresh.

**New assets (staged).** Four player-avatar WebP in `long-light-site/art/`: `avatar-traveler-1.webp`, `avatar-creature.webp`, `avatar-traveler-2.webp`, `avatar-construct.webp`. (Existing zone, messenger, and map WebP stay.)

**Global scrub (whole page).** Remove all dream/sleep language ("dream," "falls asleep," "drifts off," "wake/wakes up," "the dream is the intervention") and all appointment-timing language ("tomorrow," "in the morning," "time to get ready for our appointment"). Where the playable character is referenced use **"traveler,"** not "creature" (the avatar may be a creature OR a covered figure). Keep every metaphor non-violent (no fight/beat/destroy; no armor-as-combat).

**1. Hero.** Replace the tagline "A dream that rehearses the bravest thing you'll do tomorrow" with both approved lines, stacked:
- Primary (large): *A journey to understand what happened — and to find the way forward.*
- Secondary (smaller, beneath): *Climb out of the dark. You're not the first, and you're not alone.*
Keep the eyebrow "GAINS for Teens · A Single-Session Intervention" and the "Scroll to begin" cue.

**2. Premise section.** Replace the "Tonight, a teen can't sleep…" section with:
- Heading: **It starts with a light in the distance.**
- Body: *The Long Light is a single-session adventure — a game, not a lesson. You choose a traveler and set out across a dark land toward a distant beacon. Something happened to them, kept deliberately vague, and the journey is about coming to understand it, and yourself, one step at a time. Along the path you find messages left by others who made the same climb, and what they learned about healing. The climb is the intervention; the light is where help is real.*
- Second line: *It's built for any teen heading toward trauma therapy — turning it over, referred, or just starting — and it never hangs on a specific appointment.*

**3. Zone cards (I–V).** Keep the Description / Video / Challenge / Clinical goal fields as-is (content-accurate); just apply the global scrub if any dream/tomorrow words appear.

**4. Ending section.** Replace "And then — morning / You wake. You're ready to go / 'time to get ready for our appointment'" with an arrival, not a waking:
- Eyebrow: **The Beacon**
- Heading: *You reach the light.*
- Line: *You climb the last steps and the door opens. You didn't make it alone — everyone who left a glyph walked this same path. The adventure ends here; the real one is yours to begin, and now you know the way.*
- Keep the three stats (~25–30 minutes / 1 session / 5 zones of the climb).
- In the closing summary line, change "a teen about to start trauma therapy" → "any teen heading toward trauma therapy."

**5. Spec panel.**
- **§1 The gameplay loop** — replace with the new **5-beat** loop (change intro "as the creature ascends" → "as the traveler climbs"):
  1. **Discover a glyph → watch the message.** A carved glyph, read with the phone, plays a ~30-second psychoeducation clip left by someone who walked this path before.
  2. **Take on the challenge.** A short activity that reinforces what the message just taught.
  3. **Earn gear.** Completing the challenge yields a piece of gear — the coping idea made tangible — that helps with what's ahead.
  4. **Clear an obstacle.** *(Needs to be developed.)* Somewhere on the path stands a barrier: an unhelpful thought or misconception about therapy (for example, "therapy won't work"). You get past it — going over or around it, never destroying it — by answering with what you've learned (for example, "therapy is effective, and it can help me put this behind me").
  5. **Travel to the next zone.** A brief, fun, arcade-style traversal — you pilot your traveler across to the next, brighter environment, where the next glyph waits.
- **§3 The frame** (rename from "The frame story") — replace the dream/POV-bookend beats with the adventure framing:
  *The Long Light is a game the tee

> [Note: the archived Draft 5 text just above was cut off by a write error; the full shipped text is in git commit 7a743a0.]

### Draft 6 — Fix relative asset paths so the pitch images don't 404 without a trailing slash — ✅ SHIPPED dd4d1cc (2026-07-17)

**Problem (live now).** `public/long-light/index.html` references images with **relative** paths (`url("zone1.webp")`, `art/…​.webp`). The files live at `public/long-light/` and `public/long-light/art/`. Those resolve correctly only when the page URL ends in a trailing slash (`/long-light/`). But the server redirects `https://ssi.ctac.app/long-light/` → `https://ssi.ctac.app/long-light` (drops the slash), so the browser resolves the relative paths against `/` and requests `/art/…​.webp` and `/zone1.webp`, which 404. Net effect: **every image on the pitch page is broken.** Confirmed by fetching the page (image src URLs resolve to `ssi.ctac.app/art/…`, not `…/long-light/art/…`).

**Fix (either works; `<base>` is one line).**
1. Add `<base href="/long-light/">` to the `<head>` of `public/long-light/index.html`, so all relative assets resolve against `/long-light/` no matter the trailing slash. Confirm it doesn't break any in-page behavior (there are no meaningful internal `#` anchors, but check the scroll cue).
2. OR make every asset path absolute: `url("/long-light/zone1.webp")` for the five zone backgrounds and `/long-light/art/…​.webp` for all gallery images.

Optionally also set `trailingSlash`/redirect config so `/long-light/` is canonical, but the `<base>`/absolute fix is what actually resolves it.

**Verify.** Load BOTH `https://ssi.ctac.app/long-light` (no slash) and `https://ssi.ctac.app/long-light/` (with slash); confirm all images load on both — the 5 zone plates, the world map, the 4 travelers, and the 4 messengers — with no 404s. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 6.*
long-light/: hero shows both taglines; NO "dream/tomorrow/wake" anywhere; premise + ending are the new copy; loop shows 5 beats incl. the pending obstacle; gallery shows World + 4 selectable travelers + 4 messengers; all art loads; scroll dark→gold intact. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 5.*


### Draft 7 — GAINS Teens demo page (mirrors Ready for Roots demo; reuses the RfR feedback system) — ✅ SHIPPED 94a66a4 (2026-07-17)

**Context.** Pitch is approved. Stand up an internal **GAINS Teens demo page** for the team to review and leave feedback — the same kind of surface as the Ready for Roots `/demo`, reusing the **RfR feedback system** (the team specifically likes it). Separate from the public `/long-light/` pitch page. Unlisted; shared by link.

**Route.** A **separate, standalone** React route in this app — e.g. `/gains-demo`. **Do NOT add to or modify the Ready for Roots `/demo` page; leave it entirely untouched.** This is its own page; the only thing shared with Ready for Roots is the **feedback-system code** (`FeedbackButton` + the submission/admin pipeline), NOT the page. It must render inside the app so it can use that feedback pipeline.

**Feedback system (reuse RfR).** Wire the existing `FeedbackButton` / feedback submission + `AdminFeedbackPage` pipeline onto this page. **Tag GAINS demo feedback distinctly from Ready for Roots** — add a `program` value (e.g. `"gains-teens"`) and, since there are no versioned activities yet, tag the **section** the feedback was left on (pre-post, activities, concept-art, pitch) so comments are attributable and admin triage can filter GAINS vs RfR in the shared table. If the feedback schema needs a column for program/section, add it via `apply_migration` following the CLAUDE.md grant + RLS pattern, and log it in INFRASTRUCTURE.md.

**Sections (in order):**
1. **Pre/Post Measures & Consent** — placeholder only: a card that reads **"In development."** (Measures not identified yet.)
2. **Activities** — same structure as the Ready for Roots demo's activities section, but none exist yet: an **empty state** ("Activities in development") using the RfR pattern so activities can be dropped in later.
3. **Concept Art** — pull and **organize the art we have**, reusing the WebP already in `public/long-light/art/` and `public/long-light/` (use absolute paths, e.g. `/long-light/art/…`):
   - **Choose your traveler** (player avatars): `avatar-traveler-1.webp` (The Traveler), `avatar-creature.webp` (The Creature), `avatar-traveler-2.webp` (The Wayfarer), `avatar-construct.webp` (The Construct).
   - **The messengers**: `emberwick.webp`, `mirefly.webp`, `hollowshell.webp`, `dimmet.webp` (with symptom labels).
   - **The world map**: `map-and-world.webp`.
   - **The zones**: `zone1.webp`–`zone5.webp` (The Hollow, The Lantern Path, The Mistfields, The Bright Reaches, The Threshold).
   - Leave a slot for the **narrator** (art coming). Reuse the labels/descriptions from the pitch page's "The World & Its Travelers" gallery.
4. **The pitch (written)** — render the full **Gameplay Loop & Zone Map** spec: the intro line + sections 1–5 (The gameplay loop, Design principles, The frame, The messengers, Zone map table). **Reuse the exact spec text already in `public/long-light/index.html` (the spec panel)** so the two stay in sync — do not rewrite it.

**Style.** Match the app's demo styling / CTAC palette (consistent with the RfR demo). No scroll-cinematics needed — this is a clean, sectioned review page. Optionally link out to the live pitch at `/long-light/`.

**Verify.** Load the route; all sections render; Pre/Post + Activities show "in development"; concept art loads (4 avatars, 4 messengers, map, 5 zones) with no 404s; the written spec matches the pitch page; the feedback button submits and is tagged GAINS + section; it shows in the admin feedback view, distinguishable from RfR. Record any schema change in INFRASTRUCTURE.md. Log Recently-shipped + mark shipped.

*End of Draft 7.*


### Draft 8 — Bird traversal POC: first Phaser build (vertical no-fail flyer) + reusable Tier-2 game foundation — ✅ SHIPPED 83f6757 (2026-07-17)

**Ambition note:** build this as the **reusable game foundation**, not a throwaway. Every future traversal (and the Tier-2 layer generally) should reskin this. Polish it — it's the first thing that proves the engine and the feel.

**Context.** First real-time game build for GAINS Teens. Prove three things once: (1) a Phaser canvas mounts and disposes cleanly inside the React app on a phone, (2) a one-thumb, no-fail vertical flight *feels good*, (3) on completion it hands control back to React. Build as a **standalone playable demo first**; architect it so refactoring into a `traversal` SessionEngine item type later is trivial.

**Whole experience is 9:16 portrait**, so this is a **vertical ascent** (rising toward the light), not a horizontal side-scroll.

**Tech.**
- Add **Phaser 3** as a dependency, **lazy-loaded via dynamic `import('phaser')`** and code-split so it never bloats the main app bundle.
- React wrapper `<TraversalGame config={...} onComplete={...} />`: creates `Phaser.Game` into a container ref on mount; **`game.destroy(true)` on unmount** to free the WebGL context; handles resize; portrait scale (`Scale.FIT` or RESIZE), cap devicePixelRatio (~2). `touch-action: none` on the canvas so page scroll/gestures don't fight it.
- Generic **`TraversalScene`** parameterized by `{ bgUrl, fgUrl, birdUrl, durationMs, palette, onComplete }` so future zones reskin by passing different art — this is the seed of the reusable `traversal` item type. **Keep all persistent state in React; the scene is disposable and reports results out via `onComplete` — no globals.**

**Assets (staged, in `Gains for Teens/game-assets/traversal/`; copy into the app, e.g. `public/gains/traversal/`, referenced by absolute path):**
- `bird.png` — transparent bird sprite, top/rear view (560×602), glowing eyes + tail accents. The player mounts this; leave room to composite a small rider later (not needed for the POC).
- `ravine-bg.webp` — the tall vertical ravine plate (768×1376), **dark at the bottom → gold at the top**. This *is* the ascent arc.
- `ravine-fg.png` — transparent near-black foreground cliffs layer for parallax.

**Mechanic (vertical, no-fail).**
- The world is the ravine. The **camera starts at the bottom of the plate and pans UP to the gold top over ~35s** (tunable const 30–45s). The bird sits lower-center, bobbing, as the world scrolls down past it.
- **Parallax:** `ravine-bg` slowest (far), `ravine-fg` cliffs a bit faster (near), plus a rising **light-mote particle layer**. (Plate is a fixed composition, not tiling — implement as a vertical pan up the scaled plate, fg offset for depth.)
- **Control:** one thumb. Touch/drag to set the bird's target x; it eases toward it and tilts slightly toward travel, leveling out on release. Support pointer + arrow keys for desktop testing. Reachable one-handed.
- **Connection motes:** glowing motes drift up the channel; overlapping the bird collects them (shimmer + soft pop + counter + optional `navigator.vibrate(10)`). Purely additive — missing them costs nothing. (These are "the power of connections.")
- **No-fail, hard rule:** the bird is gently kept in the open channel; nearing a cliff produces a soft wind-nudge back — **never a crash, death, restart, or score-shame.** It *always* reaches the top.
- **Arrival:** when the camera reaches the gold top, play a warm white-gold bloom + gentle arrival beat, then call `onComplete({ motesCollected })`.

**Juice (ambitious but tasteful).** Wing-flap via tween (subtle scaleY + y-bob + slight rotation toward steer), a soft sparkle trail behind the bird, drifting motes, gentle vignette, warm bloom at arrival. **Respect `prefers-reduced-motion`:** cut particles/bob, auto-center the steering, and play a calm auto-ascent that still arrives.

**Standalone demo + wiring.**
- Add a standalone route (e.g. `/gains-demo/traversal`) and/or a **"Play the traversal prototype"** entry in a Prototypes area of the GAINS demo page (Draft 7) so the team can play it and leave feedback (reuse the feedback system, tagged `program=gains-teens`, `section=traversal-prototype`). Include a **Replay** button and a short "You gathered N connections" completion beat.
- Do **not** wire it into the real SessionEngine flow yet — but keep `TraversalScene`/`<TraversalGame>` engine-agnostic so that refactor is trivial.

**Quality bar.** Target ~60fps on a mid phone; lazy-load Phaser; cap DPR; **dispose cleanly on unmount AND on repeated replays — verify no WebGL-context/canvas leak by replaying 5+ times**; no memory growth. Accessible: reduced-motion path, one-handed controls, no color-only cues.

**Verify.** Plays on desktop + mobile viewport in portrait; one-thumb steering; motes collect; genuinely no-fail (can't lose, always arrives); arrival fires `onComplete`; replay works and disposes cleanly (no accumulating contexts); reduced-motion path works; feedback submits tagged. No `src/activities` changes → no activity version bumps. Note the new dependency + any structure in INFRASTRUCTURE.md if relevant. Log Recently-shipped + mark shipped.

*End of Draft 8.*


### Draft 9 — Add a "Videos" section to the GAINS demo page (psychoed video scripts) — ✅ SHIPPED 38e6977 (2026-07-17)

**Follow-up to Draft 7** (the GAINS demo page). Add a new **"Videos"** section that holds the psychoeducation video **scripts** we have so far. The videos aren't produced yet, so each card shows a **"Video in production"** placeholder + the script + duration + which zone/beat it maps to. Leave the card structured so the real video (reuse the Ready for Roots Vimeo `VideoPlayer` pattern) can be dropped in later. Source docs live in `Gains for Teens/` (`GAINS Teens Part 1 and 2 Activities and Script Integrated.docx`, `Growth Mindset Script to send.docx`); the exact copy is inline below — use it verbatim.

**Placement.** New "Videos" section on the demo (suggest right after Activities, before Concept Art). Reuse the feedback system, tagged `program=gains-teens`, `section=videos`.

**Scope.** The Videos section holds only the four video scripts below. The Character Examples belong to the Character Examples *activity* (not Videos), so don't put them here. (Note: Stephanie's current July 17 doc already casts our own creatures — Emberwick/Mirefly/Hollowshell/Dimmet — in that activity, so there's no IP concern anymore.)

**Cards (in order):**

**1. Trauma 101 — Video 1 · "What trauma is" (25 sec) → Zone 1 (The Hollow)**
> A trauma is any frightening, dangerous, or violent event that harms or threatens to harm your life or well-being (for example, physical abuse, a serious car accident, or even a natural disaster). A trauma can also be something that happens to someone you love or something you witness (for example, seeing parents physically hurt one another, or having someone close suddenly die). Our minds and bodies automatically react to trauma in multiple ways, and even after the trauma is over our bodies have difficulty relaxing.

**2. Trauma 101 — Video 2 · "The four reactions" (45 sec) → Zone 2 (The Lantern Path)**
*(production note: show each category label on screen as it's described)*
> Experiencing trauma can cause lots of reactions, in addition to our body's responses, and these are grouped into four main categories. Hypervigilance or reactivity: feeling more on edge or jumpy, on the lookout for danger — this can even make sleeping hard because your body and mind just won't calm down. Intrusion: not being able to stop thinking about the trauma, or feeling like it's happening all over again. Avoidance: trying hard not to think about it or staying away from reminders — it might feel okay at first, but pushing things down always causes more problems in the long term. And negative changes in mood and thoughts: more sadness, anger, or worry, and thoughts like "there's no one I can trust" or "what happened was my fault." Let's look at some examples to better understand what these reactions look like.

**3. Trauma 101 — Video 3 · "These are normal; help works" (25 sec) → Zone 3 (The Mistfields)**
> Even though it may not feel like it, these are all normal reactions to experiencing trauma — your brain and body's way of trying to keep you safe. But here's the most important thing: trauma is something that happened to you, but it doesn't define who you are. There are healthy ways to recover from even the worst things that happen to us. None of these characters healed alone — they recovered with the help of a good support system. Trauma therapy is one part of a good support system that can help people recover from very difficult things.

**4. Growth Mindset (~55 sec) → Part 2 / getting-help (Zone 4–5 area)**
> Your mindset is a collection of beliefs, attitudes, and thoughts that shape how you understand yourself and the world. Think of it like colored glasses — put on a blue-tinted pair and everything looks blue, but you can choose a green pair and turn everything green. We often talk about two mindsets people "wear": fixed and growth. With a fixed mindset on, you might think trauma therapy won't help you, because nothing can change how you feel or think about what happened. That's tricky: if you have that thought, you probably won't want to begin trauma therapy, or you won't really commit to it — and then things really don't change for you. But that's not because the thought was true; it's a result of the fixed mindset you're wearing. When you choose to put on your growth mindset, you recognize that you have the power to change your thoughts, behaviors, skills, and life. This growth mindset is important for wanting to begin and commit to trauma therapy, and it will help you get the most benefit from treatment.

**Verify.** The Videos section renders four cards, each with title + duration + "Video in production" placeholder + script + zone mapping; no IP character content present; feedback works tagged `section=videos`. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 9.*


### Draft 10 — GAINS demo: activity placeholder cards + narrator options — ✅ SHIPPED 38e6977 (2026-07-17)

**Follow-up to Draft 7 (demo page).** Two additions.

**A. Activities section — replace the empty state with placeholder cards for the two activities we now have content for** (from Stephanie's July 17 doc). Descriptions only for now (interactive versions built later); style them like the Videos cards, each marked **"Interactive version in development."**

- **Body Mapping** — ~1 min · pairs with Video 1 · Zone 1 · goal: normalize the body's responses.
  *Part 1:* tap to reveal how five parts of the body react during and after trauma — **Lungs** (breathe faster to take in more oxygen), **Head** (thoughts race, hard to think clearly, dizzy or detached/unreal), **Heart** (beats faster and harder), **Stomach** (upset or nauseous as blood moves to the arms and legs), **Body** (heats up and sweats, muscles tense, shaky or tingly) — then note these responses can linger after the danger passes or resurface when something reminds you of it. *Part 2:* tap each reaction you've felt recently.
- **Character Examples** — ~1 min · pairs with Video 2 · Zone 2 · goal: recognize and name trauma reactions.
  Meet the four messenger creatures — **Emberwick, Mirefly, Hollowshell, Dimmet** — and for each, hear a short script and choose which of the four symptom types it shows (reactivity, intrusion, avoidance, negative mood/thoughts). Ends with an animation of all four creatures' symptoms easing.

**B. Concept Art section — fill the narrator slot with the TWO options** (staged: `art/narrator-spark.webp`, `art/narrator-keeper.webp`). Present as **"Narrator — two options (which fits best?)"** so the team can weigh in via feedback. The narrator narrates, gives instructions, and delivers much of the psychoeducation, accompanying the journey.
- **Option 1 — The Spark.** A small companion spirit of living light, a piece of the Beacon's glow that travels beside you and lights the way. Best as an ever-present voice threaded through the whole journey.
- **Option 2 — The Lantern Keeper.** A serene hooded guide whose lantern is its face; an ancient keeper of the path who has made the climb and now lights it for others. Best as a mentor who appears at key moments.

**Verify.** Activities section shows the two placeholder cards (each "interactive version in development"); Concept Art narrator slot shows both options with images + descriptions and invites a preference; feedback works (tagged). No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 10.*


### Draft 11 — GAINS demo updates from the July meeting — ⚠️ SUPERSEDED by Draft 12 · ✅ changes folded into 0ce5ddd (2026-07-17)

Follow-up to the demo (Drafts 7–10). Four edits:

**1. Narrator — keep The Spark, remove The Lantern Keeper.** The team chose **The Spark**. In the Concept Art section, drop the Lantern Keeper option and the "two options / which fits best?" framing; present The Spark as THE narrator ("The Narrator — The Spark", keep its description). `art/narrator-keeper.webp` is no longer referenced.

**2. Choose your traveler — remove The Wayfarer → three avatars.** Drop `avatar-traveler-2.webp` (The Wayfarer) from the character-select. Leaves **three**: The Traveler, The Creature, The Construct. (The Traveler art is being redesigned separately — keep the current `avatar-traveler-1.webp` for now; a new file will swap in under the same name later.)

**3. Videos — add a new video card right after Video 3, in Zone 3.** Place it immediately after "These are normal; help works" (Video 3). Title: **Getting the best trauma therapy** · ~90 sec (est.) · Zone 3 · goal: how to find and start good trauma therapy. "Video in production" placeholder + this script:
> Here are some tips for getting the best trauma therapy:
> 1. Find a therapist who says they are trauma-informed.
> 2. Ask them what evidence-based trauma treatment they plan to use, what you'll be asked to do, and how long they think you'll need to be in therapy. A trauma-informed therapist should probably mention trauma-focused cognitive behavior therapy (or TF-CBT) or EMDR, and plan to meet with you once a week for roughly 4–5 months, not indefinitely. They should also plan to work with at least one of your parents or caregivers to help them understand your current symptoms and how to help you at home. But don't worry, your caregiver won't join you in every session and a trauma-informed therapist knows how to talk with caregivers without breaking your privacy.
> 3. Speaking of privacy, before beginning treatment, ask your therapist to discuss what information is private. Therapy is confidential, so no one else will know that you are in treatment or anything that goes on in your sessions. But a trauma-informed therapist should also advocate for your privacy in sessions. So, while your therapist will need to tell your caregiver if they're worried about your or someone else's safety, they can keep other information private.
> And good news: participating in trauma therapy is very likely to help you. Research has found that teens who receive trauma treatment, such as TF-CBT, see significant improvement in their PTSD, depression, and anxiety symptoms — and that's true regardless of who you are as a person, like your race, ethnicity, and gender.

**4. Videos — replace the Growth Mindset ("Choosing your mindset") script** with this updated version (lemon/colored-glasses edit):
> Your mindset is a collection of beliefs, attitudes, and thoughts that shape how you understand yourself and the world. Think about it like colored glasses – you put on a blue-tinted pair and all of a sudden, a yellow lemon looks green. Our mindset works like glasses; they can change the way something seems to us, but that doesn't make it true – even if the lemon looks green, we know that it's really yellow. We often consider two types of mindsets that people "wear": fixed and growth mindsets. If you currently have on your fixed mindset, you might find yourself thinking that trauma therapy won't help you because nothing can change how you feel or think because of what happened to you. This is tricky because if you have that thought, you probably won't want to begin trauma therapy, or you won't really commit to it, and then things really don't change for you. But that's not because your thought was true - it's a result of the fixed mindset you're wearing. When you choose to put on your growth mindset, you choose to recognize that you have the power to change your thoughts, behaviors, skills, and life. This growth mindset is important for wanting to begin and commit to trauma therapy and will help you get the most benefit from treatment.

**Verify.** Narrator shows only The Spark; character-select shows three avatars (no Wayfarer); Videos has the new "Getting the best trauma therapy" card after Video 3 in Zone 3; Growth Mindset card shows the new lemon/colored-glasses script. Feedback still works. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 11.*


### Draft 12 — Restructure the GAINS demo around the game flow (SUPERSEDES Draft 11) — ✅ SHIPPED 0ce5ddd (2026-07-17)

**Implement this INSTEAD of Draft 11 — it folds in all of Draft 11's changes.** Reorganize the demo page (built in Drafts 7–10) so it reads like the actual game flow. This is mostly reorganization: **reuse the existing video scripts, activity descriptions, and art already in the demo**; the new bits are called out.

**New page order (top → bottom):**

**A. TOP — the living Zone Map.** Move the 5-zone map table to the very top as the roadmap, with a note "updated as we go." Show the world-map image (`/long-light/art/map-and-world.webp`) here too. Keep the table's 5 columns (Zone & scenery / Video / Activity / Gear / Clinical goal), and update cells to current info: Zone 3 Video add "+ Getting the best trauma therapy"; Zone 4 → Video "What to Expect from Therapy (pending) — ends with the 3-3-3 rule", Activity "Mindfulness: 3-3-3 (see/hear/feel + breathing)", Gear "Oxygen Mask — helps you breathe", Goal "Demystify therapy; teach grounding"; Zone 5 Video "Part 2 (pending): shame/reluctance + Growth Mindset".

**B. Section — Child Assent & Measures.** Keep first (rename to this); placeholder "In development."

**C. Section — Playable Characters.** NEW. The avatars the participant chooses. For now show **The Construct** (`/long-light/art/avatar-construct.webp`) and **The Creature** (`/long-light/art/avatar-creature.webp`), each with name + short description, plus a **placeholder slot for The Traveler** ("redesign in progress"). (Wayfarer removed entirely.)

**D. Sections — the game flow, Zone 1 → Zone 5** (one section each, in order). Every zone section shows: the **zone image** (`/long-light/zone1.webp`…`zone5.webp`); **zone name + scenery**; **Characters in this zone** (The Spark/narrator in all; plus zone-specific); **Video/script**; **Activity**; **Gear earned**; **Traversal (arcade game to the next zone)**. Use "in development" placeholders for anything not done.
- **Zone 1 · The Hollow** — Characters: Spark. Video: Video 1 "What trauma is". Activity: Body Mapping. Gear: An Anchor. Traversal → Zone 2: placeholder. Goal: understand trauma; normalize bodily responses.
- **Zone 2 · The Lantern Path** — Characters: Spark + the four messengers (Emberwick, Mirefly, Hollowshell, Dimmet). Video: Video 2 "The four reactions". Activity: Character Examples. Gear: A Lantern. Traversal → Zone 3: the **bird flight ("power of connections")** — link the existing playable prototype here. Goal: recognize/name reactions.
- **Zone 3 · The Mistfields** — Characters: Spark. Videos: Video 3 "These are normal; help works", then **"Getting the best trauma therapy"** (NEW — script below). Activity: bridge beat (TBD placeholder). Gear: Hope. Traversal → Zone 4: placeholder. Goal: normalize + hope; bridge to getting help.
- **Zone 4 · The Bright Reaches** — Characters: Spark. Video: "What to Expect from Therapy" (pending Sprang) — ends with the 3-3-3 rule. Activity: **Mindfulness (3-3-3)** — name 3 things you see (tap 3 options), 3 you hear (audio over the image, tap 3), then feel = deep breathing with concentric rings expanding/contracting on a slow 3-count, then ends. Gear: **Oxygen Mask** (helps you breathe). Traversal → Zone 5: **underwater flight** — use the Oxygen Mask; collect air bubbles to keep it full, dodge underwater obstacles. Goal: demystify therapy; teach grounding/breathing.
- **Zone 5 · The Threshold** — Characters: Spark. Videos: Part 2 shame/reluctance (pending) + **Growth Mindset "Choosing your mindset"** (updated script below). Activity: TBD (CTAC placeholder). Gear: final gear / full toolkit. Traversal: arrival at the Beacon (journey end). Goal: address shame; commit; readiness.

**E. REMOVE** the old standalone **Videos**, **Activities**, and **Concept Art** sections and the entire **"The Pitch (written)"** section — their content now lives in the per-zone sections, Playable Characters, and the top Zone Map. Keep the traversal prototype playable (linked from Zone 2). Narrator = **The Spark** only; drop the Lantern Keeper everywhere.

**New/updated scripts (folded in from Draft 11):**
- **Zone 3 — "Getting the best trauma therapy"** (~90 sec, Holly): Here are some tips for getting the best trauma therapy: 1) Find a therapist who says they are trauma-informed. 2) Ask what evidence-based trauma treatment they plan to use, what you'll be asked to do, and how long they think you'll need to be in therapy. A trauma-informed therapist should probably mention trauma-focused cognitive behavior therapy (TF-CBT) or EMDR, and plan to meet once a week for roughly 4–5 months, not indefinitely. They should also plan to work with at least one of your parents or caregivers to help them understand your symptoms and how to help at home — but your caregiver won't join every session, and a trauma-informed therapist knows how to talk with caregivers without breaking your privacy. 3) Speaking of privacy, before beginning treatment, ask your therapist to discuss what information is private. Therapy is confidential, so no one else will know you're in treatment or what goes on in sessions; a trauma-informed therapist also advocates for your privacy — while they must tell your caregiver if they're worried about your or someone else's safety, they can keep other information private. And good news: participating in trauma therapy is very likely to help you. Research finds teens who receive trauma treatment such as TF-CBT see significant improvement in PTSD, depression, and anxiety symptoms — regardless of who you are, like your race, ethnicity, and gender.
- **Zone 5 — Growth Mindset "Choosing your mindset"** (updated): Your mindset is a collection of beliefs, attitudes, and thoughts that shape how you understand yourself and the world. Think about it like colored glasses – you put on a blue-tinted pair and all of a sudden, a yellow lemon looks green. Our mindset works like glasses; they can change the way something seems to us, but that doesn't make it true – even if the lemon looks green, we know that it's really yellow. We often consider two types of mindsets that people "wear": fixed and growth mindsets. If you currently have on your fixed mindset, you might find yourself thinking that trauma therapy won't help you because nothing can change how you feel or think because of what happened to you. This is tricky because if you have that thought, you probably won't want to begin trauma therapy, or you won't really commit to it, and then things really don't change for you. But that's not because your thought was true - it's a result of the fixed mindset you're wearing. When you choose to put on your growth mindset, you choose to recognize that you have the power to change your thoughts, behaviors, skills, and life. This growth mindset is important for wanting to begin and commit to trauma therapy and will help you get the most benefit from treatment.

**Verify.** Page order: Zone Map (top) → Child Assent & Measures → Playable Characters (Construct + Creature + Traveler placeholder) → Zone 1…5 sections (each with image, characters, video, activity, gear, traversal; placeholders where pending). No old Videos/Activities/Concept-Art/Pitch sections remain. Narrator = Spark only. Feedback works (tagged). No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 12.*


### Draft 13 — Add "The Shadow" section to the GAINS demo (after the Zones) — ✅ SHIPPED 564580e (2026-07-23)

Add a new section titled **"The Shadow"** on `/gains-demo`, placed **after the Zone 5 section** (before the footer). It's a concept-in-development section (like the other placeholders) that presents the antagonist/arc tying the whole journey together. Mark it clearly **"Concept in development."** Use the looming Shadow art at `/long-light/art/shadow.webp`. The **end-state art — a Shadow → embering → Spark transformation — is still TBD**; leave a slot for it.

**Copy / content:**

- **What it is.** The Shadow is the past trauma that follows the player through the entire journey — a looming presence at the edges of the zones and traversals, the unresolved weight they're carrying.
- **How it resolves (the arc).** The player faces the Shadow at the end, in the light — the climactic encounter where you use everything you've learned and earned. **Important framing: you don't fight or destroy it.** In keeping with the no-violence rule (and how healing actually works), you *face* it — shining your light and using the skills and gear you've gathered along the way — and it loses its power: as you face it, its darkness burns down to a small warm light — it becomes a **Spark**, the same kind of being as the narrator. You carry that Spark onward as your own inner light. Trauma faced and transformed, not erased.
- **The cosmology (the big idea — LOCKED).** *All light in this world is a faced shadow.* The Spark who guides you was a shadow someone once faced; so are the lanterns along the path, the messenger creatures who recovered, and the Beacon itself — the gathered light of everyone who made the climb. When you face your Shadow it turns to light and you add it to that, and you **leave carrying your own Spark** (the internalized hope/skill the game exists to hand the participant). Guardrail: the light comes from *facing it with help* — courage + support + skills — NEVER from the trauma itself being good; final wording is CTAC's to bless.
- **How it's built in (concept).**
  - *Build-up:* a looming background presence that grows from zone to zone.
  - *Training:* each earlier traversal teaches you to use one skill/gear under pressure.
  - *Climax:* the final traversal / summit approach brings them all together — a **no-fail**, call-and-response "hold the light and use your skills" sequence where the Shadow shrinks with each skill you apply, until you pass through it into the Beacon and it settles into a small, carry-able companion-shadow.
- **Ties it together with** the dark→light spine, Sprang's "avoidance creature shrinks" note, and the recovered-creature "symptoms lessening" animation.

**Feedback:** reuse the feedback system; add a **`section=shadow`** option to the demo feedback dropdown and label it in admin.

**Verify.** "The Shadow" section renders after Zone 5 with the concept text, an art placeholder, and an "in development" marker; feedback dropdown includes The Shadow. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 13.*


### Draft 14 — New Traveler art + Shadow transformation arc — ✅ SHIPPED 564580e (2026-07-23)

**Assets** (staged in `long-light-site/art/`; copy into `public/long-light/art/`):
- `avatar-traveler-1.webp` — **UPDATED**: the redesigned Traveler (softer, heroic; replaces the old "too scary" one). Same filename, so replacing the file updates it everywhere it's referenced (demo Playable Characters + pitch character-select).
- `shadow-phase2.webp` — NEW: "The Turning" (the Shadow burning into light, golden core kindling).
- `shadow-phase3.webp` — NEW: "Your Spark" (the Spark born from the faced shadow).

**Changes:**
1. **Demo → Playable Characters:** replace the "The Traveler — redesign in progress" placeholder with a real card — image `avatar-traveler-1.webp`, name **The Traveler**, description "Hooded and wrapped, a warm light in hand." (Section now shows three real avatars: Traveler, Creature, Construct.)
2. **Demo → The Shadow section:** replace the "end-state art TBD" slot with the **three-phase transformation arc**, in order with labels (keep the existing cosmology copy):
   - Phase 1 — **Looming** (`/long-light/art/shadow.webp`) — the Shadow that follows you.
   - Phase 2 — **The Turning** (`/long-light/art/shadow-phase2.webp`) — faced, its darkness burns to light.
   - Phase 3 — **Your Spark** (`/long-light/art/shadow-phase3.webp`) — it becomes a Spark, your own light to carry onward.
3. Copy the two new webp into `public/long-light/art/`; make sure `avatar-traveler-1.webp` there is the updated file.

**Verify:** Playable Characters shows three real avatars (Traveler image updated, no placeholder); the Shadow section shows the 3-phase arc in order; the pitch page `/long-light/` character-select shows the new Traveler; all art returns 200. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 14.*


### Draft 15 — Add "The narrator's arc" to the demo's Shadow section — ✅ SHIPPED ed80698 (2026-07-27)

Add a subsection titled **"The narrator's arc"** inside the existing "The Shadow" section on `/gains-demo` (that section is already marked "Concept in development," so no other disclaimers needed). It shows how the Spark threads the Shadow through the whole journey and carries the post-traumatic-growth idea (the light is the strength that grows from facing the dark, with help). Intro line: *"The Spark carries a quiet thread the whole way up — a light that was once a shadow too."* Then the lines, grouped by beat:

**Early — a hint**
- "I'll be with you the whole way up. I know this path better than you'd think."
- "That dark thing trailing behind you? I'm not afraid of it. I've got my reasons — I'll tell you at the top."

**As it looms — naming it**
- "You've felt it behind you, haven't you. That's the weight of what happened, and it's been with you a long time."
- "We're not running from it, and we're not fighting it. We're climbing toward the light — because light is how you face a thing like that."

**The reveal**
- "Before you turn around, a secret. Every light in this place — the lanterns, the Beacon, me — we were all shadows once."
- "Facing ours didn't just make the dark smaller. It changed us. We came back carrying something we didn't have before. That's what a light really is: not a shadow erased, but a shadow faced — and what grows from facing it."
- "You're not the first, and you're not alone. Hold your light up, use everything you've gathered, and face it."

**The transformation**
- "See? It was never here to destroy you. Faced — with help — it becomes something you can carry. Not the weight it was. A light. A strength."

**Your Spark**
- "That light is yours now. It grew out of the hardest thing you carry — because you faced it, with help, and didn't do it alone."
- "What happened will always be part of your story. But it won't loom over you the same way — and the courage it took to face it becomes part of you too. That's yours to keep."

**Verify.** The Shadow section now includes "The narrator's arc" with the five beats and their lines, rendering after the cosmology/transformation content; no errors. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 15.*


### Draft 16 — Demo: single playable character + Exposition note — ✅ SHIPPED ed80698 (2026-07-27)

Two demo edits (both on `/gains-demo`):

**1. Down to ONE playable character.** The team decided to drop the choose-your-character set and use a single protagonist: the new **human-faced Traveler** (`art/avatar-human-traveler.webp`, staged; copy to `public/long-light/art/`). In the Playable Characters section, show **only this one** — remove the Creature and Construct cards (and the old hooded Traveler). Keep the section but present it as the single protagonist (e.g., heading "The Traveler" / "You play as the Traveler"), card = the human-traveler image + name **The Traveler** + description "A young traveler setting out to understand what happened — and find the way forward."
   - **Do NOT delete** the other avatar files (`avatar-traveler-1.webp`, `avatar-creature.webp`, `avatar-construct.webp`) — just stop displaying them on the demo.
   - Note: the `/long-light/` pitch page still has the old "Choose your traveler" 4-up; leave it for now (separate cleanup later).

**2. Exposition section.** Replace the placeholder text with: **"Stephanie writing a draft."**

**Verify.** Playable Characters shows exactly one card (the human-faced Traveler); Creature/Construct no longer displayed; Exposition reads "Stephanie writing a draft"; avatar art 200. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 16.*


### Draft 17 — Zone 4→5 "The Ascent" climb traversal (Phaser; reuse/extend the traversal engine) — ✅ SHIPPED c0ce3b9 (2026-07-27)  _(SHIPPED — post-launch changes are in Draft 21; edits inside this archived block are superseded)_

**Ambition (Fable):** the second traversal, built by **reusing/extending the Draft 8 traversal foundation** — proving the engine reskins to a new mechanic. Polished, no-fail, on-brand.

**Concept.** A vertical, one-thumb CLIMB from Zone 4 (Bright Reaches) up to Zone 5 (the Beacon), through three stages — **tree → mountain → crystal spire** — brightening as you rise. The player is the human Traveler, climbing. "**Second Wind**" (a breath meter) drains as you climb (faster at altitude) and is refilled by collecting glowing **orbs** (air-blooms). The tension comes from the breath itself: as Second Wind runs low a **darkness closes in around you** (Option-2 lore — the traveler's own darkness), pushed back each time you grab an orb. Reaching the Beacon = arrival into Zone 5; the Shadow falls away, unable to follow into the light (a breadcrumb for the final face-off).

**Assets** (staged in `Gains for Teens/game-assets/climb/`; copy into the app, e.g. `public/gains/climb/`):
- Climb sprite, 3 frames, already registered on a common 520×1351 canvas, bottom-aligned: `climb-right.png`, `climb-mid.png`, `climb-left.png`. Cycle: **right → mid → left → mid → loop.**
- Stage backgrounds (9:16, 1296×2304, scroll vertically): `stage-tree.webp`, `stage-mountain.webp`, `stage-spire.webp`.
- Collectible: `orb.png` (transparent, additive glow).
- Audio: `climb-music.mp3` (looping background, "Skyiceberg – Epic"), `sfx-orb.mp3` (collect beep).
- (No pursuer — the chasing Shadow is REMOVED per the Option-2 lore. `shadow-pursuer.webp` stays staged but unused for now.)

**Engine.** Reuse the Draft 8 lazy-loaded, disposable `<TraversalGame>` React wrapper + Phaser setup (destroy on unmount, one WebGL context at a time, portrait scale, DPR cap, `touch-action:none`). Add a **climb mode** — a `ClimbScene` sharing the framework (or a `mode` param on the existing scene). Keep state in React; report via `onComplete`. Reuse the Draft 8 audio pattern (music created once; restart-in-place on replay to dodge the iOS suspended-AudioContext bug; mute toggle).

**Mechanic (no-fail):**
- The world scrolls DOWN as the Traveler climbs UP; stages transition tree → mountain → spire over ~40–60s (tunable); a warm light overlay grows as you ascend, blooming at the Beacon.
- One thumb: drag/steer the Traveler left/right along the surface toward orbs and up the climbing lane; the 3-frame cycle plays with a bob (compressed on mid-pull, extended on reach).
- **Second Wind meter** drains slowly, faster in the mountain and spire stages. Orbs refill it — each = a surge of climb speed + `sfx-orb` + optional `navigator.vibrate(10)`. Missing an orb costs nothing.
- If Second Wind empties, the Traveler slows and climbs wearily — **never falls, never dies**; an orb restores pace.
- **Character size:** render the Traveler sprite **~15% larger** than the base (team request).
- **Tension = the breath + the encroaching darkness (NO shadow character; no-fail).** High Second Wind = bright, warm, clear world. As it drains, a **dark vignette/haze creeps in from the screen edges** (the traveler's own darkness, per Option-2 lore), colors desaturate, the climb slows, and the music dims — urgent without ever failing. Grabbing an orb snaps the light back (bright flood + music swell). If Second Wind empties you don't fall — you slow to a labored crawl in near-dark, and the next orb triggers a dramatic **"Second Wind"** recovery surge. Ramp pressure by making orbs **sparser and more spread out** (side reaches / small risk-reward detours) as you climb higher and breath drains faster. **Put the relief beats at the stage transitions:** crossing tree → mountain and mountain → spire eases the pressure — a brief "catch your breath" moment (plentiful orbs, calmer pace, warm light) — before the next stage ramps the drain back up. No streak/combo system (the run is short enough it doesn't need one).
- **Arrival:** at the spire's top, a warm white-gold Beacon bloom; the last of the darkness lifts and you arrive in full light; fire `onComplete({ orbsCollected })` with a short "You reached the Beacon" beat + Replay.

**Juice:** climb bob, cloak sway, orb sparkle + collect pop, drifting motes, the brightening overlay, Beacon bloom, subtle vignette, the Shadow's dark haze at the bottom edge. `prefers-reduced-motion`: calm auto-climb, orbs auto-collect, the Shadow gentle and distant, minimal particles.

**Where it lives:** a **second playable prototype** on the GAINS demo (Prototypes area), labeled "The Ascent — Zone 4→5 climb," beside the bird flight. Reuse the feedback system (tag `section=traversal-prototype`). Not wired into the real session flow yet.

**Quality bar:** ~60fps mid-phone; lazy-load Phaser; dispose cleanly on unmount AND repeated replays (verify no WebGL/AudioContext leak over 5+ replays); reduced-motion path; one-handed. (Assets a bit heavy — stage webp ~600KB each, music 4.7MB — optional optimization later.)

**Verify:** plays desktop + mobile portrait; one-thumb climb; orbs refill Second Wind; genuinely no-fail (can't fall/lose; always ascends); the Shadow pursues but never catches; three stages transition tree→mountain→spire brightening to the Beacon; arrival fires onComplete; replay works + disposes cleanly; music/SFX play and survive replay; reduced-motion path; feedback submits tagged. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 17.*


### Draft 18 — Exposition card: Stephanie's reworked exposition, OPTION 2 (verbatim)  — ✅ SHIPPED c26f1e4 (2026-08-06)

The team chose **Option 2** of Stephanie's reworked exposition (Sprang + Holly both picked it). On `/gains-demo`, put Option 2's narration on the Exposition card, **verbatim** — this REPLACES the earlier Shadowveil / Spryte / Cinder draft. New canon in Option 2: world = **Shadowmend**, narrator = **Spark** (no "Spryte"), and **no shadow/Cinder character** — the "darkness" is the traveler's OWN aura that lightens toward Mount Hope.

**The Spark's intro narration (Option 2):**
> Welcome to Shadowmend, my name is Spark. Everyone that comes here has experienced really scary and stressful things. They usually arrive with a darkness around them that can feel upsetting and heavy and also make it hard for others to really see or get to know them. It's my job to teach you more about trauma and ways to feel better. Together, we will move through each of the five levels; learning, playing games, and getting gear to help us reach Mount Hope, where that darkness around you will get lighter, helping everyone see the amazing person you are!

**Transition phrases: HOLD for now.** Stephanie's doc still carries the Option-1 transition phrases that reference "Cinder" (whom Option 2 removes). Do NOT put them on the card yet — pending an Option-2-consistent rewrite.

**Verify.** Exposition card shows the Option 2 narration verbatim; no Cinder / Shadowveil references anywhere; nothing else changes. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 18.*


### Draft 19 — Zone 3: shortened second-video script (Holly's revision) — ✅ SHIPPED 1e391b6 (2026-07-28)

On `/gains-demo`, in **Zone 3 (The Mistfields)**, replace the script of the **second video** — "Getting the best trauma therapy" (the card that comes after Video 3) — with Holly's shortened revision below, **verbatim**. Also update its duration estimate from ~90 sec down to **~60 sec (est.)**. Leave the first Zone 3 video (Video 3, "These are normal; help works") unchanged.

New script (verbatim):
> Research has found that teens of all races, ethnicities, and genders who receive trauma treatment see significant improvement in their PTSD, depression, and anxiety symptoms.
> To participate in trauma therapy, find a trauma-informed therapist who provides trauma-focused cognitive behavior therapy or EMDR and will meet with you once a week for roughly 4-5 months. In therapy, your parents or caregivers will learn about trauma and how to help you at home, but they won't join you in every session and a trauma-informed therapist knows how to talk with caregivers without breaking your privacy.
> But before beginning treatment, you can ask your therapist to discuss what information is private. Therapy is confidential, so no one else will know that you are in treatment or anything that goes on in your sessions. But a trauma-informed therapist should also advocate for your privacy in sessions. So, while your therapist will need to tell your caregiver if they're worried about your or someone else's safety, they can keep other information private.

**Verify.** Zone 3's second video card shows the shortened script + ~60 sec; the first Zone 3 video is unchanged. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 19.*


### Draft 20 — Demo: add an "NPCs" section (Spark + the four symptom creatures) — ✅ SHIPPED 6a47bb8 (2026-08-06)

On `/gains-demo`, add a new section titled **"NPCs"** immediately AFTER the Playable Character section.

**1. Spark** (first, featured):
- Image: `/long-light/art/narrator-spark.webp`.
- Name: **Spark** — the narrator and guide.
- **Audio player** with Spark's intro voice line: copy `spark-introduction.mp3` into `public/long-light/audio/` and reference `/long-light/audio/spark-introduction.mp3` (reuse the demo's existing audio-player pattern, `preload="metadata"`). Label it "Spark's intro narration."
- Show the line text beneath the player (verbatim):
> Welcome to Shadowmend, my name is Spark. Everyone that comes here has experienced really scary and stressful things. They usually arrive with a darkness around them that can feel upsetting and heavy and also make it hard for others to really see or get to know them. It's my job to teach you more about trauma and ways to feel better. Together, we will move through each of the five levels; learning, playing games, and getting gear to help us reach Mount Hope, where that darkness around you will get lighter, helping everyone see the amazing person you are!

**2. The symptom creatures** (below Spark, in a row/grid — same style as the messengers gallery). Image + name + symptom label, **no lines / no audio yet** (leave room to add voice lines later):
- **Emberwick** — reactivity / hypervigilance — `/long-light/art/emberwick.webp`
- **Mirefly** — intrusion — `/long-light/art/mirefly.webp`
- **Hollowshell** — avoidance — `/long-light/art/hollowshell.webp`
- **Dimmet** — negative mood / thoughts — `/long-light/art/dimmet.webp`

**Assets:** `spark-introduction.mp3` staged at `Gains for Teens/long-light-site/audio/` → copy to `public/long-light/audio/`. All images already deployed in `public/long-light/art/`.

**Feedback:** add an **NPCs** option (`section=npcs`) to the demo feedback dropdown + admin labels.

**Verify.** NPCs section renders right after Playable Character; Spark card shows the image, name, a working audio player (plays the intro), and the line text; the four creatures show image + name + symptom with no audio; feedback dropdown has NPCs. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 20.*


### Draft 21 — Climb ("The Ascent"): remove the Shadow, bigger climber, darkness-aura tension — ✅ SHIPPED 6a47bb8 (2026-08-06)

Post-launch changes to the **already-shipped** climb (`src/game/climbScene.js`; Draft 17 + rounds). The team adopted Option 2 lore, which has **no shadow character**, so:

1. **Remove the Shadow entirely.** The live climb currently has a procedural welling-up dark wave (the pursuer, round bec20e5). Rip it out — no pursuer from below, no dark wave. Remove Shadow references from the instructions/copy too (e.g., "the Shadow is closer than you think — climb quickly").

2. **Replace the tension with a "darkness aura" (Option-2 lore).** Instead of darkness rising from below, the traveler's OWN darkness closes in from the screen **edges** as Second Wind drops: a dark vignette + slight desaturation creeping inward from the borders, the climb slowing, the music dimming — all receding/brightening each time an orb is collected. Breath high = bright, warm, clear; breath low = the darkness presses in around the edges. Reuse the existing breath-derived darkness logic, just re-target it from a bottom wave to an **edge vignette/aura**. Still strictly no-fail.

3. **"Second Wind" recovery beat.** Keep the empty-breath weary crawl (rate floor), and when an orb is collected after breath has run low, add a brighter recovery surge (light floods back, small burst) — earns the gear name.

4. **Bigger climber.** Increase the climber ~15% (`CLIMB_FIG_H` ≈ 48px → ~55px) and scale its dependents (orb size, collect radius, bob) proportionally, as the earlier scale pass did, so the balance holds.

5. **Keep everything else** (three stages tree→mountain→spire, orbs, the air-intake collect sound, music, the stage-arrival relief beats at each transition) — but reword the arrival beats so they no longer "push the Shadow back"; just ease/brighten. Relief beats stay at the stage transitions.

**Verify.** No Shadow anywhere in the climb (no wave, no copy); at low breath the darkness now closes in from the screen edges and lightens on collect; climber ~15% larger; still strictly no-fail; three stages + arrival + audio intact. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 21.*


### Draft 22 — Demo: remove the "The Shadow" antagonist section — ✅ SHIPPED 6a47bb8 (2026-08-06)

On `/gains-demo`, **remove the entire "The Shadow" section** (the antagonist-arc concept section after Zone 5, added in Drafts 13/14/15): its "what it is" copy, the "all light is a faced shadow" cosmology, the three-phase transformation art (Looming `shadow.webp` → The Turning `shadow-phase2.webp` → Your Spark `shadow-phase3.webp`), and "The narrator's arc" subsection. **Option 2 has no shadow character/antagonist**, so this whole section no longer fits and should be pulled.

- Remove the section entirely. Drop its feedback option (`section=shadow`) from the demo dropdown (keep the admin label for any old rows).
- The three transformation images become unused on the demo — **keep the files on disk**, just stop displaying them.
- Leave everything else (the Option-2 exposition and the "darkness lightens" idea live in the Exposition card / narration now, not in a dedicated Shadow section).

**Verify.** The "The Shadow" section is gone; the demo flows cleanly (Zone 5 → whatever follows → footer) with no broken links or empty anchors; feedback dropdown no longer lists The Shadow. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 22.*


### Draft 23 — Playable Character: show the Traveler's four-stage progression — ✅ SHIPPED ae9cb67 (2026-08-06)

In the **Playable Character** section of `/gains-demo`, replace the single traveler image with the **four-stage progression** — the same traveler, their darkness lightening as they climb toward Mount Hope (this is the Option-2 promise made visible on the character). Show the four left-to-right (a 4-up row on desktop; wrap/stack gracefully on mobile), each with its zone label + a short caption underneath.

Images (all already staged in `long-light-site/art/`, served at `/long-light/art/`):

1. `/long-light/art/traveler-stage1-hallow.webp` — **Zone 1 — The Hallow** · "Arrives wrapped in shadow."
2. `/long-light/art/avatar-human-traveler.webp` — **Zone 2** · "The journey begins." *(existing image, now stage 2)*
3. `/long-light/art/traveler-stage3.webp` — **Zones 3–4** · "The light grows."
4. `/long-light/art/traveler-stage4-bright.webp` — **Zone 5 · Mount Hope** · "Fully seen."

Notes:
- A short lead-in line above the row is welcome, e.g. *"One traveler, the whole way up — the darkness they arrive with lightens as they climb, until everyone can see the person they've always been."* (Josh can tweak this copy.)
- All four share the same dimensions/pose, so they should line up as a clean strip. Keep them uniformly sized.
- Captions/zone labels are placeholder copy — fine to render as-is; Josh will adjust wording later.
- This is the **Playable Character** section only — leave the new **NPCs** section (Draft 20) untouched.

**Verify.** Playable Character section shows four traveler stages in order with zone labels beneath each; images load (no 404s); row is responsive on mobile. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 23.*


### Draft 24 — New "Ideas & Demos for Review" section at the top of the demo — ✅ SHIPPED 1febed8 (2026-08-06)

Add a new section, **"Ideas & Demos for Review,"** as the **very first section** of `/gains-demo` (above the Zone Map / official zone breakdown). It's a staging area where proposals and previews live for team comment BEFORE they're folded into the official zones. **Do NOT otherwise change the official Zone breakdown / structure** — this draft only (a) adds this new top section, and (b) moves two already-shipped items up into it.

Mark it visually as provisional (tinted callout band / "Proposals — comment before we make them official" ribbon). Intro line:
> *"These are proposals and previews under discussion. Comment on any item below before we fold it into the official zones."*

Each item gets its own comment thread using the existing Ready-for-Roots-style feedback system, with a distinct section tag (suggested: `review-exposition`, `review-character`, `review-arcades`, `review-gear`, `review-rename`).

**Item 1 — Exposition (Stephanie's Option 2).** MOVE the Option-2 exposition text (currently live on the official Exposition card, shipped c26f1e4) UP into this section, with a comment thread. Leave the official Exposition card in place structurally but replace its body with a short pointer: *"Exposition — proposal under review (see Ideas & Demos for Review at the top)."*

**Item 2 — How the character changes (four-stage Traveler progression).** MOVE the four-stage Traveler strip (currently in the official Playable Character section, shipped ae9cb67 + polish) UP into this section as a proposal, with a comment thread. **Restore the official Playable Character section to its pre-Draft-23 state** (the single current Traveler). Same four images already in `long-light-site/art/`.

**Item 3 — Possible new arcade activities (text only, no playable stub).**
- *Reaching the Lantern Path — a slower, revealing arcade.* You hold the Lantern, which lights only a small circle; you feel your way out of the opening zone and the path unfolds as you go. (Alternates noted for comment: a "keep it lit" tending game vs. gusts; or a "hold still to reveal the next safe step" patience crossing.)
- *Clearing the darkness → the Mistfields.* With the amplified light you **drag to aim and release a light-bloom that sweeps a cone of fog clear**, revealing the background; when the area is cleared the camera pans up above the cloud line — *"You made it to the Mistfields."* (Framed as lifting/dissolving darkness, not combat.)

**Item 4 — The gear that evolves: a growing toolbox (text only).**
- Everything you earn is one **growing toolkit**, not scattered pickups. It starts as a simple **Lantern** (Spark's gift). Each psychoed character teaches a skill and gives you a **part**; the parts combine the Lantern into the **Focusing Glass**. In the Mistfields it grows **bird-of-light wings** (a reskin of the existing bird traversal — no mechanical change). At the summit, the fully-built kit **lights the Beacon** at the Summit of Mount Hope.
- Theme line: *"Every activity earns a tool. The tools combine and grow — a lantern becomes a Focusing Glass, the Glass grows wings — so you reach the summit carrying everything you've learned."*
- Intent for comment: tools **grow stronger the more they're used** (practice), and the real power is in **combining** them — the coping-skills-toolbox idea.

**Item 5 — Proposed zone rename (text only).** Propose renaming the opening zone (currently **"the Hollow"**) to **"The Deep"**, with **"Lowreach"** offered as an alternative. Include the rationale for comment:
> *"'The Hollow' was meant to convey an empty, desolate place — but that's also how you'd spell what's pronounced 'holler' in Eastern Kentucky, and we don't want to equate that emptiness with where anyone lives. A rename keeps the metaphor about an internal emotional state, not a real place."*
Do NOT rename the zone in the official breakdown yet — proposal only.

**Item 6 — Spark's voice (voice-model preview).** MOVE the **Spark** card — including its intro voice audio (`/long-light/audio/spark-introduction.mp3`, the ElevenLabs voice-model output) and its Option-2 intro text — UP from the NPCs section into this review section, with its own comment thread (`review-spark-voice`), so the team can react to how Spark sounds. Leave the four symptom creatures where they are in the NPCs section (that section then holds just the creatures).

**Verify.** The "Ideas & Demos for Review" section renders at the very top; exposition + progression now appear there and are removed from / pointered out of their official spots; items 3–5 render as text; each item has a working comment thread with its own tag; the official Zone breakdown is otherwise unchanged; no 404s on the four traveler images; the Spark card + its audio now play in the review section and the NPCs section still shows the four creatures. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 24.*


### Draft 25 — Zone 1 art update + rename the opening zone "the Hollow" → "The Dark Abyss" — ✅ SHIPPED 0d63109 (2026-08-13)

Two changes from the Aug 11 team meeting.

**Part A — New Zone 1 traveler art.** The Zone 1 / stage-1 traveler image has been replaced on disk at `long-light-site/art/traveler-stage1-hallow.webp` (same 576×1024 dimensions as the other three stages). Per the team's feedback, the face is now visible with a sad expression (clearly human, not a monster) while the hood stays up and the dark cloak, aura, and tendrils are unchanged. No code change is needed beyond committing the updated asset — just confirm it renders in the four-stage Traveler progression strip (currently in the "Ideas & Demos for Review" section) and anywhere else the stage-1 traveler shows.

**Part B — Rename the opening zone: "the Hollow" → "The Dark Abyss".** The team accepted this rename (it keeps the darkness→light metaphor). Promote it into canon now:
- Rename every **user-facing** reference to the opening zone from **"the Hollow" / "The Hollow"** to **"The Dark Abyss"** across the demo (`/gains-demo`) and the pitch site (`/long-light/`): the zone title, the Zone Map / zone chart, section headings, body copy, and the Zone 1 label under the traveler progression strip.
- **Do NOT rename "Hollowshell"** — that's the avoidance symptom creature (a separate name). Leave it exactly as-is.
- Since the rename is now accepted, **remove the rename proposal (Item 5) from the "Ideas & Demos for Review" section** — it's been promoted to canon. The `review-rename` feedback option can retire (keep the admin label for any existing rows).

**Verify.** No user-facing "the Hollow" zone references remain (grep the demo + pitch site); "Hollowshell" is untouched; the opening zone reads "The Dark Abyss" everywhere, including the Zone Map and the strip's Zone 1 label; the new Zone 1 art renders in the strip; the review section no longer shows the rename proposal. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 25.*


### Draft 26 — Review section: swap Spark's voice for two new contenders (A/B) — ✅ SHIPPED 0d63109 (2026-08-13)

In the **"Ideas & Demos for Review"** section, update the **Spark's voice** item (`review-spark-voice`, Item 6).

- **Remove** the current rejected voice player (`/long-light/audio/spark-introduction.mp3` — the somber one the team passed on at the Aug 11 meeting).
- **Add two audio players** for the new contenders, labeled neutrally so the team isn't biased:
  - **Option A** → `/long-light/audio/spark-voice-a.mp3`
  - **Option B** → `/long-light/audio/spark-voice-b.mp3`
  (Both files are already staged in `long-light-site/audio/`.)
- Keep Spark's Option-2 intro text alongside the players (both voices are reading that same intro, so it's the reference script).
- Update the item's prompt so it asks the team to compare and comment on which they prefer (the `review-spark-voice` comment thread stays).

**Verify.** The review section's Spark item now shows two players (Option A and Option B) that both play; the old `spark-introduction.mp3` player is gone; Spark's intro text still shows; the comment thread still works. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 26.*


### Draft 27 — Build the Body Mapping activity (Activity 1), 9:16 — ✅ SHIPPED 1f4d072 (2026-08-13)

Build Stephanie's **Body Mapping** activity as a real interactive component for `/gains-demo`. Blueprint files are in `Gains for Teens/Activities/`:
- `body-map.svg` — the finished figure: neutral gender-inclusive outline, five region groups with ids `region-lungs`, `region-head`, `region-heart`, `region-stomach`, `region-body` (each with an icon + circular hit-target), plus an internal `<style>` defining `.region` / `.region.active` / `.region.selected` states and an `amberGlow` filter.
- `Body Map (prototype).html` — a working vanilla-JS reference of the exact interaction.

**Inline the SVG into the component** and drive the region classes from component state (don't just embed the static file as an image — the states need to toggle).

**MUST fit the same 9:16 vertical mobile format as everything else in the app.** The figure scales to fit the vertical frame with the instruction line, the copy panel, and the button all visible without awkward scrolling; no horizontal overflow. Use the app's amber/slate design system (amber-500 `rounded-full` CTA, amber-50 `rounded-2xl` panels).

**Flow (no-fail, no scoring):**
- **Part 1 — reveal.** Instruction (Spark): *"Click to reveal different areas of the body that react during and after a trauma."* Tapping a region adds the `active` glow and shows that region's line in the copy panel. Track progress ("N of 5"). When all five are revealed, show the closing line and unlock a **Continue** button.
- **Part 2 — select.** Same figure/icons. Clear the reveals and switch the instruction to: *"Click on each of these reactions you have had recently."* Tapping a region toggles `selected` (amber fill + check badge). A **Done** button ends on a gentle closing (e.g., *"Noticing where big feelings show up is the first step to feeling better."*).

**Verbatim copy — use Stephanie's exact wording:**
- **Lungs** — "We start breathing faster, to help our body take in more oxygen"
- **Head** — "Thoughts begin to race through our heads to allow us to make quick decisions, but this also makes it hard to think clearly, can cause us to feel dizzy, and can even make us feel detached or like things around us aren’t real"
- **Heart** — "Our hearts start beating faster because it is harder to pump blood to all our muscles"
- **Stomach** — "Our stomach might feel upset or we might feel nauseous because blood is moving away from our stomach and into our arms and legs"
- **Body** — "Our body heats up, leading to more sweating. Our muscles also get tense, and we might feel shaky or tingly."
- **Closing (after all 5 revealed)** — "Each of these things help us respond to danger, but these responses can stick around even after the danger has passed or can pop up if something reminds us of the danger or trauma."

**Placement.** It hasn't been team-reviewed yet, so add it as a **playable demo in the "Ideas & Demos for Review" section** (new item "Body Mapping activity," its own comment thread, tag `review-bodymap`). Once the team blesses it, it moves into its zone as Activity 1.

**Verify.** Renders and fits the 9:16 frame on mobile (no overflow, everything reachable); Part 1 reveal → all-5 → closing → Continue works; Part 2 select toggles with check badges → Done closing; copy matches Stephanie's verbatim exactly; amber/slate styling; appears in the review section with a working comment thread. Follow the repo's convention for GAINS demo interactive pieces; if registered as a versioned activity, add its version entry per CLAUDE.md. Log Recently-shipped + mark shipped.

*End of Draft 27.*


### Draft 28 — Review section: replace Spark's voice players with three new contenders (A/B/C) — ✅ SHIPPED 6b12a14 (2026-08-13)

In the **"Ideas & Demos for Review"** section, update the **Spark's voice** item (`review-spark-voice`).

- **Replace** the current two players (Option A / Option B) with **three** players, labeled neutrally:
  - **Option A** → `/long-light/audio/spark-voice-a.mp3`
  - **Option B** → `/long-light/audio/spark-voice-b.mp3`
  - **Option C** → `/long-light/audio/spark-voice-c.mp3`
  (All three files are already staged in `long-light-site/audio/` — the A/B files have been overwritten with the new versions and C is new.)
- Update the item description to say something like: **"Three voices to choose from — each with music and reverb added."** Keep Spark's Option-2 intro text alongside as the shared reference script.
- Keep the `review-spark-voice` comment thread; ask the team which of the three they prefer.

**Verify.** The Spark item now shows three players (A, B, C) that all play; no leftover second-only layout; the intro text still shows; the comment thread still works. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 28.*


<!-- REFERENCE (not a draft) — Spark voice file map (2026-08-13) -->
<!--
Current Spark voice contenders in the review section, staged from `Voices/Spark with Music/`:
  Option A  =  long-light-site/audio/spark-voice-a.mp3  <-  "Spark 1 with Music and Reverb.mp3"  (ElevenLabs voice: ____ — Josh to fill)
  Option B  =  long-light-site/audio/spark-voice-b.mp3  <-  "Spark 2 with Music and Reverb.mp3"  (ElevenLabs voice: ____)
  Option C  =  long-light-site/audio/spark-voice-c.mp3  <-  "Spark 3 with Music and Reverb.mp3"  (ElevenLabs voice: ____)
Note: source filename numbers are NOT the ElevenLabs voice numbers (last batch, "Spark 2" was actually "spark 6" on ElevenLabs), so trace the winner by the source file, and Josh should note the real ElevenLabs voice name/id next to whichever the team picks.
-->


### Draft 29 — Refresh the three Spark voice files (replaced, same filenames) — ✅ SHIPPED b4f7465 (2026-08-14)

The three Spark voice mp3s in `long-light-site/audio/` — `spark-voice-a.mp3`, `spark-voice-b.mp3`, `spark-voice-c.mp3` — have been **replaced with new versions** (same filenames, new audio; updated music/reverb mixes). The review-section A/B/C players from Draft 28 already point at these paths, so **no wiring change is needed** — just commit and redeploy the updated assets.

**Caching caveat:** because the filenames are unchanged, browsers / the CDN may serve the OLD cached audio. To force the new files, bump a version query string on the three audio sources (e.g., `spark-voice-a.mp3?v=2`), or otherwise ensure the deploy invalidates those three assets.

**Verify.** On a hard refresh, all three review-section players play the NEW audio (not stale cached versions). No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 29.*


### Draft 30 — Review section: add "Final Boss" summit script (VERBATIM, text-only), at the top — ✅ SHIPPED ee5aea4 (2026-08-14)

Add a new item to the **"Ideas & Demos for Review"** section, placed as the **first item** (top of the section). It's Holly's first-draft script for the final summit sequence — **text only, no mechanics to build yet**, up for the team to read and comment on today. Its own comment thread, tag `review-finalboss`.

Short framing line above the copy: *"First-draft script for the final summit — the last climb to the Beacon, where the gear you've earned helps you move past mixed feelings about starting therapy. Shown verbatim for review."*

Then render the following **verbatim** (keep wording exactly; show the *stage directions* in italics and Spark's lines as written):

*Growth mindset script ends, player has earned the night vision goggles*
Spark: Congratulations, you’re ready to climb the final summit!
*steps onto staircase, lanterns go out on the staircase or everything just goes dark. Player can’t move forwards.*
Spark: “Oh, this happens sometimes when you feel hopeful about trauma therapy, but you’re also not sure whether it’s worth trying because you worry it may not help. Let’s revisit the gear you’ve earned to see if we can overcome these mixed feelings. First, you need to put on your growth mindset goggles to see more clearly.”
*Player puts on goggles* *Vision returns and two signposts (or floating bubbles or something) are now visible on the staircase*:
1. I have the power to change my thoughts and feelings, and therapy can help me learn how to do this
2. Research shows that trauma therapy is very likely to help me feel better
Spark: “Can you see more clearly now? Select the message that you want to carry with you when you need a reminder”
*Player chooses message (saved for action plan/summary at the end)
Spark: Great job! Let’s keep climbing!
*Regular game lighting returns and player removes goggles and continues up the stairs*
*Now, dark fog obscures the path and the player cannot advance*
Spark: I see! It can be hard to start something like trauma therapy if you’re remembering bad experiences you’ve had in therapy in the past, or if you’ve heard others talk about negative experiences. Let’s try using your wingsuit to get over this fog.
*Player puts on wingsuit and flies. In the fog, comes across a character who can provide a positive testimonial from a teen. This clears the fog and allows the player to land on the cleared staircase*
Spark: Fantastic! It’s important to remember that just because you or someone you know has had a bad experience in the past, that doesn’t mean that others haven’t had good experiences or that you can’t have good experiences in the future! You’re almost there now, keep going!
*Now, the light from the tower is close but it’s blinding to the player, the player can no longer see the Spark, and the player cannot proceed*
Spark: The light must feel very bright to you! When you experience trauma, it’s normal to feel like you’re the only one going through it and to feel alone or like you’re caught in a spotlight. In reality, before turning 18, three out of every four kids will experience at least one potentially traumatic event. Trauma makes you feel alone, but the truth is: you are not alone. Pull out your lantern to see the truth.
*Player pulls out lantern which allows them to see that the bright light ahead is made up of characters holding their own lanterns. One or two characters come to join the player*
Spark: Now you can see that the light was bright because so many other people have walked this same path before you. Your new friends will join you as you make the final steps of this journey.

**Verify.** The "Final Boss" item appears as the first item in the review section; the copy reads verbatim (stage directions italicized, Spark lines intact); its comment thread works (`review-finalboss`). Text only — no new game mechanics. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 30.*


### Draft 31 — Add new team member "Maggie" to the feedback comment dropdown — ✅ ALREADY SHIPPED 41b3ed9 (2026-08-06, Draft 89)

A new team member, **Maggie**, needs to be added to the **submitter dropdown** on the feedback/comment form (the same list that currently has Stephanie, Ginny, Holly, Bianca, Josh). Add **"Maggie"** as an option, matching however the existing names are defined (same casing/format for the stored `submitter` value, e.g. `maggie`).

If that dropdown is shared across both demos, adding her once covers both `/gains-demo` and Ready for Roots; if the lists are separate, add her to the **GAINS** one at minimum (and Ready for Roots too if that's where she's commenting).

**Verify.** The comment form's submitter dropdown now lists Maggie; selecting her and submitting stores the comment under her name; existing names still work. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 31.*

### Draft 32 — Body Mapping fixes: reveal/closing race bug, tap animation, torso-focused repositioning — ✅ SHIPPED 72af0ff (2026-08-19)

From 2026-08-17 team feedback on the `review-bodymap` demo (Drafts 26/27). Four changes, one file: `src/components/BodyMapping.jsx` (rendered via `src/pages/GainsDemoPage.jsx`).

**1. Real bug, found and diagnosed (Stephanie's report): tapping the last unrevealed region sometimes shows the closing line instead of that region's own line.** This isn't specific to the lightning-bolt/body icon — it happens to whichever region is tapped 5th, but testers experience it as "the body map bug" because the whole-body hit-target is the largest and drawn underneath the other four, so it's naturally the one people leave for last. Root cause, confirmed by reading `tapRegion()` (lines 145–159): revealing the 5th region sets `showClosing` to `true` in the *same* state update that reveals it, so the render branch's `allRevealed && showClosing` check wins outright on that exact tap — the just-revealed region's own `PanelBox` never renders, even for a frame. Fix: don't let `showClosing` become true on the same tap that reveals the last region — show that region's own panel first (as every other region gets), and only surface the closing line on the *next* interaction (e.g. a "Continue" tap, or a brief delay) rather than instantly replacing the content the participant just asked to see.

**2. New ask (Ginny): make the tapped region visibly react** — "is it possible for these areas to enlarge or pulse to show action" — admin decision: **yes, build it.** A brief scale-up or pulse animation on tap (before/alongside the copy panel appearing) for all five regions, reveal and select modes both.

**3. Reposition symbols, torso-focused (Holly, admin-decided):** *"Let's make the body map focused on the torso, that way Holly's comments about area placement can be accommodated."* Holly's specific asks were (a) move the lightning-bolt/body icon somewhere other than its current spot, and (b) place the heart and lungs icons closer to their real anatomical positions (acknowledged as tricky since they sit close together). Concretely: recenter the icon layout around the torso rather than the current full-figure spread, and nudge heart/lungs into biologically closer positions within that torso focus.

**4. Copy update (Ginny, admin-decided — merge into the existing "Body" line):** current verbatim (from the canonical copy block above) is *"Our body heats up, leading to more sweating. Our muscles also get tense, and we might feel shaky or tingly."* Ginny's ask: fold in "shaky or heavy limbs, feeling like you need to sit or you will fall." Suggested merged wording, **flagged for Stephanie/Sprang sign-off before shipping** since this is clinical verbatim content, not ours to phrase unilaterally: *"Our body heats up, leading to more sweating. Our muscles also get tense, and we might feel shaky or tingly, or feel weak in our legs — like we need to sit down or we might fall."* Do not ship new clinical wording without that confirmation; if it hasn't arrived, ship items 1–3 alone and leave the copy as-is.

**Not in this draft — flagged, not actioned:** Bianca's ask to make the body shape "more realistic, with hands" is an art-asset change (a new/edited SVG or illustration), not a code change — needs new artwork before there's anything for Code to wire in.

**Verify.** Reveal mode: tapping the 5th region (whichever one it is) shows that region's own copy first, not the closing line; closing line still appears correctly once the participant moves on. All five regions show a visible tap reaction (pulse/scale) in both reveal and select modes. Layout is torso-focused; heart/lungs sit closer together and closer to anatomically correct positions; the body/lightning-bolt icon has moved off its old spot. If the copy update has Stephanie/Sprang sign-off by the time this ships, the Body line reads the merged wording; otherwise unchanged. Still fits the 9:16 frame on mobile, no overflow. Log Recently-shipped + mark shipped.

---

**UPDATE 2026-08-19 — new art + final copy now in hand (resolves items 3 & 4 above):**

- **Item 3 (realism / torso / reposition) is now handled by ART, not manual code repositioning.** A new realistic torso SVG is staged at `Gains for Teens/Activities/body-map.svg` (viewBox 700×780 — torso + head + arms, real hands; `region-body` lightning-bolt is now on the **hand**; heart/lungs repositioned to anatomically closer spots; region ids unchanged). It already ships the `.region / .region.active / .region.selected` styles AND `idlePulse` / `idleIcon` idle animations — so **item 2's tap/pulse affordance ships inside the asset**: keep it and have it settle on `active`/`selected`. **Swap the inlined SVG for this file** rather than hand-nudging icon coordinates.
- **Item 4 (copy) is resolved — Stephanie sent the revised copy; use it verbatim (no placeholder / no pending sign-off):**
  - Lungs — "We start breathing faster, to help our body take in more oxygen which prepares your muscles to respond to a danger or threat"
  - Head — "Thoughts begin to race through our heads to allow us to make quick decisions, but this also makes it hard to think clearly, can cause us to feel dizzy, and can even make us feel detached or like things around us aren’t real"
  - Heart — "Our hearts start beating faster to pump blood and oxygen to all our muscles, so they are ready to react"
  - Stomach — "Our stomach might feel upset or we might feel nauseous because blood is moving away from our stomach and into our arms and legs because those muscles may need it more-to run away or fight"
  - Body — "Our body heats up, leading to more sweating. Our muscles get tense, and we might feel shaky or tingly. Our arms and legs can also start to feel heavy. Each of these reactions is because our body is using a LOT of energy at once to be able to act quickly."
  - Closing (only AFTER all five revealed) — "Each of these things help us respond to danger, but these responses can stick around even after the danger has passed or can pop up if something reminds us of the danger or trauma."
- **Item 1 (the reveal/closing race bug) still applies** — fix as diagnosed (don't flip `showClosing` on the same tap that reveals the 5th region; show that region's own panel first, closing only on the next interaction).
- **Panel sizing:** the revised Stomach and Body lines are longer than before — make sure the copy panel fits them in the 9:16 frame without clipping.

*End of Draft 32.*

---

### Note — Character Zone 1: mixed signal, confirm before treating as resolved

2026-08-17 feedback on `review-character`: Ginny ("better") and Holly ("I think the new Zone 1 design is perfect!") both read as approving a Zone 1 design already in front of them. Stephanie's comment — "I wonder if the traveler's skin tone in Zone 1 could more similarly match the other Zones" — has no admin resolution recorded and could go either way: it may be about the SAME design Ginny/Holly are approving (in which case it's a live, unresolved note worth a real answer), or it may be about a design that's since been superseded by whatever Ginny/Holly are reacting to (in which case it's already moot). Worth a one-line confirmation from Stephanie against the current Zone 1 art before deciding there's nothing to do here.

---

### Open question for Josh (do not decide in code) — Spark voice A/B/C, no clear winner yet

2026-08-17 feedback on `review-spark-voice` (Drafts 28/29's three loudness-matched contenders): opinions split, no majority —

- **Ginny:** Option A ("sounds a little older but could pass as adolescent")
- **Bianca:** Option A ("voice B has a louder echo, and voice C sounds a little off")
- **Stephanie:** leaning B or C
- **Holly:** C first, B second

2 votes for A, the other 2 split between B and C with no second choice in common. This needs an actual team decision (or Josh breaking the tie), not something to resolve by picking the loudest opinion in the sheet.

**Separately, a production note regardless of which voice wins (Stephanie):** reduce the echo on the voice track and lower the background music slightly — an audio-mix task on whichever file(s) survive the decision above, not a code change.

---

### Note — "Add Maggie" is already covered by Draft 31, still pending

The 2026-08-17 feedback sheet's unattributed row ("Add Maggie as a review name option") is the same ask as **Draft 31** above (add Maggie to the feedback/comment submitter dropdown), which is already written and waiting — it just hasn't shipped yet. No new draft needed; this is a pointer so it doesn't get drafted twice.

### Correction — 2026-08-18: retracting three items from the 8/17 notes above

Three items logged above were a mistake — that content got pulled over from
feedback on a different project and doesn't belong in this file. Disregard:

- "Open question for Josh — Spark voice A/B/C, no clear winner yet"
- "Note — Character Zone 1: mixed signal, confirm before treating as resolved"
- Draft 32, item 4 (the body-map copy addition + its Stephanie/Sprang
  sign-off flag) — not a real pending item. Draft 32's items 1-3 (the
  reveal/closing race fix, tap animation, torso-focused repositioning) are
  unaffected and still stand as written.

### Note — Kai psychoeducation video fixes from the 2026-08-17 meeting + feedback (misfiled into root notes, now logged here correctly)

Four items, three ready to build/produce now, one blocked:

1. **Kai Part 2 Scene 1 ("Building Skills for Belonging"):** caption/audio
   says "deepen our bones," should be "deepen our bonds" — needs redo
   line/video generation.
2. **Kai Part 2 Scene 3 ("Putting It All Together"):** around 20 seconds,
   "move" reads/sounds like "moob" — needs redo line/video generation.
3. **Box-breathing Kai clip:** the team wants a short addition — Kai briefly
   models a box-breathing technique — to give participants something
   concrete beyond "here's a list of skills." Still being scripted
   (Josh/Adrienne), not yet delivered.
4. **BLOCKED — growth-mindset / self-regulation script gap:** the team
   agreed the current script introduces "we can give you a list of skills to
   try" and a fixed-vs-growth-mindset reference without ever following up or
   fully explaining either. Adrienne is rewriting this section (reinstating
   a growth-mindset definition cut for length, plus new content on
   self-regulation/affect-regulation) and will send it to Josh. **Not yet
   delivered — nothing to build until the revised script lands.**

### Correction — 2026-08-18 (later still): the Kai note above was misfiled too — Kai is Ready for Roots, not GAINS

The "Note — Kai psychoeducation video fixes from the 2026-08-17 meeting..."
section above was itself a misfiling, going the other direction. Kai is the
Ready for Roots "Learning Skills for Belonging" narrator (confirmed by Josh
directly, and independently by the codebase — Kai's narration wires into
`src/activities/GettingUnstuck.jsx` and `AlliesSafetyNet.jsx`, both Ready
for Roots activities; GAINS's narrator is Spark). Disregard that whole note
here — it's now logged correctly in root `WORKING_NOTES.md`.


### Draft 33 — Build the Mindfulness "Calm Place" activity (Zone 4), 9:16, immersive layered scene — ✅ SHIPPED 79e0aec (2026-08-19)

Build the mindfulness / visualization activity as a real interactive component for `/gains-demo`, placed as a **playable demo in the "Ideas & Demos for Review" section** (new item "Mindfulness: Calm Place", tag `review-mindfulness`). Spark leads a **"calm place" visualization** — double duty: it teaches grounding (3-3-3: see / hear / breathe) AND calm-place visualization.

**Assets (all staged):**
- Background: `/long-light/art/mindfulness/pond-bg.webp` (full-screen dusk pond scene, 9:16).
- Overlay layers (transparent SVGs, 1080×1920 to match): `layer-rain.svg`, `layer-lightning.svg`, `layer-fireflies.svg`, `layer-reeds.svg`, `frog.svg` — in `/long-light/art/mindfulness/`.
- Animations: `/long-light/art/mindfulness/motion.css` — idle keyframes for rain fall, gentle lightning flash, reed sway, firefly drift. **Inline the SVGs** (fetch+innerHTML or paste the markup) and include this CSS so the animations run. (NOTE: ripples were intentionally removed — ignore the `om-ripple`/`.ring` keyframe.)
- Audio: `/long-light/audio/mindfulness/` → `music.mp3` (ambient bed, ~20s loop), `rain.mp3` (light rain + gentle thunder, ~60s loop), `frog.mp3` (frogs + brook, ~60s loop).

**Composition & animation:**
- Full-screen 9:16 scene: background at the base, overlay layers stacked on top — airborne pieces (rain, lightning, fireflies) over the sky; foreground pieces (reeds, frog) low. Keep it lightweight for mobile.
- Layers animate continuously via `motion.css` (rain falling, occasional soft distant lightning flash, reeds swaying, fireflies drifting; frog idle with a periodic hop).
- The music bed loops softly from the start (see autoplay note).

**Flow (guided, no-fail):**
- **Spark intro** (visualization framing) — script below.
- **STEP 1 — SEE 3:** "Find three things you can see." Player taps three living elements in the scene (frog, rain, fireflies, reeds, lightning). Each tapped element gives a soft glow/scale acknowledgment + a brief Spark affirmation; progress "N of 3."
- **STEP 2 — HEAR 3:** "Find three things you can hear." Three sounds are available — **rain, frog/brook, and the music**. As the player taps each (or taps its source in the scene), that sound comes forward and Spark names it. (There are exactly three, so they'll notice all three.)
- **STEP 3 — FEEL / BREATHE:** an on-brand **Spark glow** (warm amber light) expands and contracts to pace ~3 slow breaths ("breathe in as the light grows… and out as it fades"), with a soft cue.
- **CLOSE:** Spark affirms; player earns the **Oxygen Mask** (the gear that unlocks the Ascent climb). Offer **"Would you like to do it again?"** → repeating strengthens (brighter light / mask upgrade), per the practice mechanic.

**Spark script (FIRST-DRAFT copy — to be refined per Stephanie/Holly; render it cleanly in the demo, no disclaimers):**
- Intro: "Before we climb on, let's try something you can use whenever things feel like too much. It's called finding your calm place. Take a slow breath… and let's step in."
- Arrive: "This is a calm place. Any time you feel overwhelmed, you can close your eyes and come back here in your mind. Let's use our senses to really arrive."
- See: "First — look around. Tap three things you can see." → (after 3) "Noticing what's around you brings you back to right now."
- Hear: "Now — listen. Tap three things you can hear." → (after 3) "Sound can anchor you, even when your thoughts are racing."
- Breathe: "Last — let's breathe together. Breathe in as the light grows… and out as it fades." → (after 3 cycles) "Beautifully done."
- Close: "That's your calm place — you can come back any time you need a moment. Take this with you: an Oxygen Mask. It'll help you breathe easy on the climb ahead."
- Repeat prompt: "Want to stay a little longer?"

**System / UI:** amber/slate for Spark's text panel + buttons (amber-500 `rounded-full` CTA), but keep UI minimal so the scene breathes. Mobile 9:16.

**Notes / handle:**
- **Autoplay:** browsers block audio autoplay — start the ambient bed on the first user gesture (an "Enter your calm place" / "Begin" tap).
- **"Write your own" for See:** Josh floated tap OR free-text for the See step; for this first pass do **tap-only** (simpler; the scene is the point) — free-text can come later.

**Verify.** Full 9:16 scene renders with animated layers (rain, lightning flashes, reed sway, firefly drift, frog hop); music bed plays after the first tap; See 3 → Hear 3 (three sounds) → Breathe (Spark glow) → earn Oxygen Mask → repeat option; strictly no-fail; lightweight on mobile; appears in the review section with a working comment thread (`review-mindfulness`). No `src/activities` changes → no version bumps (unless registered as a versioned activity). Log Recently-shipped + mark shipped.

*End of Draft 33.*


### Draft 34 — Mindfulness activity: move selections to the top as chips (stop blocking the scene) + fix the Hear step — ✅ SHIPPED e7f2ffe (2026-08-19)

Testing feedback on Draft 33: the selection UI covers too much of the scene (including the frog), and the Hear step only exposed one selectable sound (music), so it couldn't be completed. Rework the two selection steps.

**General layout.** Move the selection UI to the **TOP of the screen**, over the open sky (there's empty space up there). The scene and its animated layers (especially the frog and foreground) stay fully visible below. Selections should never cover the frog or the pond.

**Step 1 — SEE (predefined option chips, not scene-tapping).** Drop the "tap elements in the scene and the app names them" approach. Instead show a row/grid of **predefined option chips at the top**: **Frog, Lightning, Pond, Fireflies, Trees, Clouds** (things visible in the scene). The player taps to pick **three**; selected chips highlight (amber). When three are selected, advance. (Optional, non-blocking nicety: selecting a chip that has a matching animated layer — frog, lightning, fireflies — can briefly pulse/glow that element in the scene. Skip for pond/trees/clouds, which live in the background image.)

**Step 2 — HEAR (predefined sound chips — and fix the progression bug).** Same pattern: **sound chips at the top** — **Rain, Thunder, Frogs, Music** (four options; pick any **three**). Tapping a chip brings that sound forward/plays it and selects it; when three are selected, advance. **Fix the bug:** every chip must be individually selectable — the current build only surfaced Music, which blocked progress. Audio-file mapping: **Rain and Thunder both come from the one `rain.mp3`** (light rain + gentle thunder are in the same recording) — selecting either starts/holds that bed, and **Thunder** additionally syncs to the lightning-flash visual so it reads as its own element; **Frogs** = `frog.mp3`; **Music** = `music.mp3`. Picking three of the four completes the step; by the end they layer into a calm soundscape.

**Keep everything else:** the immersive background + animated overlay layers + ambient audio bed, Spark's script, Step 3 breathing (Spark glow expand/contract), the Oxygen Mask reward + "do it again," 9:16, strictly no-fail, and the `review-mindfulness` placement.

**Verify.** Selection chips sit at the top over the sky and never cover the frog/scene; SEE shows the six options and advances after any three; HEAR shows the four sound chips (Rain, Thunder, Frogs, Music), each plays when tapped, and advances after any three (progression works now — the music-only dead end is gone); breathing → Oxygen Mask → repeat all still work; still 9:16 and lightweight. No `src/activities` changes → no version bumps (unless registered as a versioned activity). Log Recently-shipped + mark shipped.

*End of Draft 34.*


### Draft 35 — Mindfulness "Calm Place": make the breathing step directive (box-breath counts + a bigger, count-timed Spark glow) — ✅ SHIPPED bba5ecb (2026-08-19)

Testing feedback: the breathing step (Step 3) is too subtle and gives the participant no direction. Rework it into a clearly **guided box-breathing** exercise.

**Direction / copy.** Spark introduces and counts it, and the phase shows prominently on screen. Replace the current breathe copy:
- Lead-in (Spark): "Now, let's feel. Feel your lungs fill as you breathe with me."
- Guide a box breath for ~3 full cycles: **Breathe in (2, 3, 4) → Hold (2, 3, 4) → Breathe out (2, 3, 4) → Hold (2, 3, 4)**, repeated.
- Close (after the cycles): "Beautifully done."

**The Spark glow — much more pronounced and timed to the counts.** Keep the amber Spark glow, but make it large and clearly the focal point (not the current subtle pulse), animated in lockstep with the box count:
- **Inhale (4 counts):** the glow smoothly **expands and brightens** to full.
- **Hold (4 counts):** it holds at full with a gentle shimmer.
- **Exhale (4 counts):** it smoothly **contracts and dims**.
- **Hold (4 counts):** it rests small and dim.
- Each count ≈ 1 second (≈4s per phase, 16s/cycle); ~3 cycles (adjustable).
- Show the current **phase word** ("Breathe in" / "Hold" / "Breathe out" / "Hold") large and centered on/under the glow, with a visible **count (2, 3, 4)** or a filling ring, so the participant always knows exactly what to do.
- If a soft breath/chime cue gets added later, play a gentle tone at each phase change (no cue file staged yet — fine to ship silent for now).

**Keep everything else** (scene, See/Hear chips, Oxygen Mask reward + "do it again," 9:16, no-fail) unchanged — this only reworks the breathe step.

**Verify.** Step 3 shows a large, prominent Spark glow that visibly expands on the inhale, holds, contracts on the exhale, and holds again — in time with an on-screen count; the phase words and counts are clearly legible; Spark's box-breath direction reads; runs ~3 cycles then closes to the Oxygen Mask reward; still 9:16, no-fail. No `src/activities` changes → no version bumps (unless registered as a versioned activity). Log Recently-shipped + mark shipped.

*End of Draft 35.*


### Draft 36 — Build the Zone 3 "Elevator Pitch" activity (message to your guardian), 9:16 — ✅ SHIPPED 6438889 (2026-08-19)

Build Holly's end-of-Zone-3 activity as a real interactive component for `/gains-demo`, placed as a **playable demo in the "Ideas & Demos for Review" section** (new item "Zone 3: Message to Your Guardian", tag `review-zone3pitch`). It's a guided **message-builder**: the teen assembles a short "elevator pitch" asking a guardian for trauma therapy, then earns the **Wingsuit** to cross the bridge (the Mistfields → Bright Reaches flight).

**Format:** the activity plays over a **full-screen Mistfields bridge backdrop** — `/long-light/art/zone3/bridge-bg.webp` (a rope bridge reaching toward a far cliff that drops into the mist = the impassable bridge; the Wingsuit lets you fly the gap). The message-builder UI sits in cards on top; because the art is busiest in the lower-center, put the cards on a soft translucent scrim/panel so the text stays readable. Amber/slate styling, 9:16, no-fail.

**Flow (Holly's copy — verbatim):**
- **Spark intro:** "Sometimes things feel like a dead end. For some teens, getting their parents or caregivers on board with trauma therapy feels like a bridge that can’t be crossed. But with a little preparation and courage, you can overcome any obstacle. Take this time to plan out a message for your guardians."
- **Step 1 — Greeting (free text):** prompt "Start with a greeting" with placeholder e.g. "hey Dad". A text input.
- **Step 2 — Describe the situation (select one):** prompt "Next, describe the situation."
  - "I’ve been having a hard time lately."
  - "Something has been bothering me for a while"
  - "I don’t feel like myself right now"
  - "I’m struggling with what happened"
- **Step 3 — Make your request (select one):** prompt "Now make your request."
  - "I would like to talk with a trauma therapist."
  - "I want to start trauma therapy."
  - "Can we talk about finding me a trauma therapist?"
- **Step 4 — How it'll help (select one):** prompt "And finally, finish with how this will help you."
  - "I think this will help me feel better"
  - "I think this will help me feel like myself again"
  - "I think this will help me understand what happened"
  - "I think this will help me get along with people better"
  - "I think this will help me to be able to reach my goals at school"
- **Assemble:** stitch the four parts into a natural message and present it back — greeting + comma, then the three picks as sentences. Example: *"Hey Dad, I’ve been having a hard time lately. I would like to talk with a trauma therapist. I think this will help me feel better."*
- **Save + reward:** save the assembled message for the end-of-game **action plan / summary**, and award the **Wingsuit** ("to cross the bridge"). Spark closes warmly.

**Notes:**
- No-fail; the teen can change selections before finalizing. A "Continue" / "Send it" button assembles + saves.
- Keep Holly's prompts and all option text **exactly** as written.
- **Action-plan collector:** if a saved-items store doesn't exist yet, stub it (a shared "action plan items" list) so this message is retained — the same collector the Final Boss growth-mindset message will use. The full end-of-game action-plan aggregation is a separate future item; flag if it needs a broader build.

**Verify.** Renders 9:16; Spark intro shows; greeting free-text works; each select-one step shows the exact options and requires a pick; the assembled message reads naturally with the chosen parts; the message is saved/retained and the Wingsuit is awarded; strictly no-fail; appears in the review section with a working comment thread (`review-zone3pitch`). No `src/activities` changes → no version bumps (unless registered as a versioned activity). Log Recently-shipped + mark shipped.

*End of Draft 36.*


### Draft 37 — Mindfulness "Calm Place" fixes: remove disclaimer text, Hear-step audio, 2 breath rounds, practice-to-upgrade the Oxygen Mask — ✅ SHIPPED 46c4c7d (2026-08-19)

Revisions to the shipped Mindfulness activity (Drafts 33–35).

**1. Remove the first-draft disclaimer text.** Delete any on-screen lines like *"First-draft script. Spark's lines here are a first pass, meant to be refined with Stephanie and Holly. Rendered cleanly below for review."* — and anything similar. The demo must never show "draft / for-review / placeholder" disclaimers; render Spark's lines cleanly with no meta text. (Reaffirms the standing rule.)

**2. Hear step — make the sounds actually hearable and consistent.** Right now the music auto-plays but Rain / Thunder / Frogs only make sound when their chip is clicked — inconsistent, and it makes "find three things you can hear" hard because the other sounds aren't audible until tapped. Fix so all four behave consistently. **Preferred behavior:** when the Hear step begins, a soft ambient bed of the sounds plays so the player can genuinely hear them, and tapping a chip **selects** it (and brings that sound forward); advance when three are selected. (If Josh prefers the opposite — nothing plays until tapped, music included — do that instead; the requirement is **consistency** so it's a real listening task, not music-only. Flagging this as an interpretation to confirm.)

**3. Breathing — two rounds, not three.** The box-breath runs **two** full cycles (in–hold–out–hold ×2), then stops.

**4. Oxygen Mask → "practice again to upgrade" loop.** After the breathing completes and the player earns the **Oxygen Mask**, offer: **"Want to practice again to upgrade your mask?"**
- If yes → run the breathing again (two rounds) → then show a reinforcing message: **"Your practice made this tool stronger — it should work really well on the climb ahead."**
- They can practice again up to **two times** total. After the second practice (or if they decline), continue / close.
- This is **purely a reinforcing message** — the point is to teach that practicing makes a coping tool stronger. **No actual gameplay change**: there is no "un-upgraded" state referenced anywhere and the mask is not mechanically different. Just the prompt + the message.

**Keep everything else:** the scene + animated layers, the See/Hear chips at the top, the Spark-glow breathing visual, 9:16, no-fail, and the `review-mindfulness` placement.

**Verify.** No disclaimer / "for review" / "first-draft" text anywhere in the activity; on the Hear step the sounds are audible and all four chips behave consistently, advancing after any three; the breathing runs exactly two rounds; on completion the Oxygen Mask is earned, then "Want to practice again to upgrade your mask?" appears, re-running the breathing (max two practices) and showing the "Your practice made this tool stronger…" message; no mechanical gameplay change; still 9:16, no-fail. No `src/activities` changes → no version bumps (unless registered as a versioned activity). Log Recently-shipped + mark shipped.

*End of Draft 37.*


### Draft 38 — Zone 3 "Message to Your Guardian": add "Write your own" to every step + rename final button to "Save It" — ✅ SHIPPED 93a8f9b (2026-08-19)

Tweaks to the Zone 3 elevator-pitch activity (Draft 36).

**1. "Write your own" on every select step.** Each of the three select-one steps — Describe the situation, Make your request, How it'll help — gets an additional **"Write your own"** option that reveals a text box for the teen to type their own line. So every step lets them use their own words instead of a preset (the greeting is already free text). A typed custom line flows into the assembled message exactly like a preset selection would.

**2. Rename the final button** from "Send it" to **"Save It"** — it saves the message to the action plan, it isn't sent anywhere.

**Keep everything else:** the verbatim preset options, the message assembly, the Mistfields bridge backdrop, the Wingsuit reward, save-to-action-plan, 9:16, no-fail, and the `review-zone3pitch` placement.

**Verify.** Each select step shows a "Write your own" choice that opens a text input; a typed custom line flows into the assembled message correctly; the final button reads "Save It"; the message still saves and the Wingsuit is still awarded. No `src/activities` changes → no version bumps (unless registered as a versioned activity). Log Recently-shipped + mark shipped.

*End of Draft 38.*


### Draft 39 — Mindfulness Hear step: tapping a chip should only select it (no second audio playback) — ✅ SHIPPED ea6c111 (2026-08-19)

Follow-up to Draft 37. The Hear-step ambient bed now plays correctly, but tapping a sound chip still starts a **new** playback of that sound on top of the already-playing bed, so two copies of the same file overlap.

**Fix:** remove the play-on-click trigger. Tapping a chip only **selects** it (highlights it, counts it toward the three needed) — it must not start, instantiate, or replay an audio element. The sound the player is "noticing" is the one already playing in the ambient bed.

**Verify.** On the Hear step, all sounds are audible via the ambient bed; tapping a chip selects/highlights it and advances the count with **no doubled or echoed audio** (no second instance of the same file); advancing after any three still works; the rest of the activity is unchanged. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 39.*


### Draft 40 — Demo: add an "In Development" section; move the Final Boss out of review into it — ✅ SHIPPED ab997df (2026-08-19)

Add a new **"In Development"** section to `/gains-demo`, placed **below the "Ideas & Demos for Review" section** and above the official Zone breakdown. It holds items the team has **adopted** and that are moving toward being built — no longer soliciting review, but visible in the pipeline (Review → In Development → the official zones/canon).

**Move the Final Boss summit script** (currently the first item in "Ideas & Demos for Review", tag `review-finalboss`) OUT of the review section and INTO the new "In Development" section. Keep Holly's script text **verbatim**. It's adopted (Ginny approved it), pending the build of the actual summit sequence. Keep its comment thread if that's easy (harmless) — it just no longer sits in this week's review list.

With the Final Boss gone from review, the remaining review items shift up with no gap.

**Verify.** A new "In Development" section renders below the review section; the Final Boss summit script now appears there (verbatim) and is gone from "Ideas & Demos for Review"; the review section's remaining items reflow cleanly; no broken links or threads. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 40.*


### Draft 41 — Zone 3 "Message to Your Guardian": Dr. Sprang's two new steps + safety disclaimer — ✅ SHIPPED a7a56a2 (2026-08-19)

Dr. Sprang expanded Holly's Zone 3 activity (builds on Drafts 36 + 38). Insert two new select-one steps and add closing safety copy. The activity goes from 4 steps to **6** — update the "STEP X OF N" indicator to /6. All select steps, including the two new ones, keep the **"Write your own"** option from Draft 38.

**New step order:**
1. Greeting (write-in) — unchanged
2. Describe the situation (select 1 of 4) — unchanged
3. **Normalize it — NEW (select 1 of 4):** prompt "Normalize it"
   - "Therapy isn’t just for when things are in crisis"
   - "A lot of kids my age use therapy to feel better"
   - "Therapy is a good place to think things through"
   - "Therapy can also help me sleep better, make better grades, improve my connection to people"
4. **Offer to make it easy — NEW (select 1 of 4):** prompt "Offer to make it easy"
   - "I know some people I can ask to find out the best person to go to that is nearby"
   - "There is a counselor at school that I could talk to"
   - "If you can’t take me, we could check into telehealth options"
   - "I am willing to call a few places and check to see if they take our insurance"
5. Make your request (select 1 of 3) — unchanged
6. And finally, finish with how this will help you (select 1 of 5) — unchanged

**Assembled message** now includes the two new parts in this order: greeting, situation, normalize, offer, request, benefit — stitched into a natural paragraph.

**Add two pieces of closing copy (verbatim):**
- Reassurance line near the finish/save: "If asking directly feels hard, how about writing this in a note first to take the pressure off- you will get a copy of this message in your action plan to make it easier"
- **Safety disclaimer** shown at the end — this is a real, keep-it disclaimer (crisis resources), NOT a for-review note; render it clearly: "Note: if what is going on feels urgent, like you are struggling to cope or having thoughts of hurting yourself or someone else, don’t wait to convince your parents- reach out immediately to a school counselor, you family physician or call or text 988 immediately."

**Keep everything else:** the bridge backdrop, the "Save It" button, the Wingsuit reward, save-to-action-plan, 9:16, no-fail, and the `review-zone3pitch` placement.

**Verify.** 6 steps with a correct "STEP X OF 6" indicator; the two new steps show the exact options plus a "Write your own" box; the assembled message includes the normalize + offer lines in order and reads naturally; the "write it as a note" line and the 988 safety disclaimer both appear (disclaimer clearly legible at the end); "Save It" saves and the Wingsuit is awarded. No `src/activities` changes → no version bumps (unless registered as a versioned activity). Log Recently-shipped + mark shipped.

*End of Draft 41.*


### Draft 42 — Ship the final Zone 1 traveler art (commit + deploy + cache-bust) — ✅ SHIPPED 784327c (2026-08-20)

The Zone 1 / stage-1 traveler art has been updated to the skin-tone-matched **final** version (from `Gains for Teens/ZONE 1 TRAVELER FINAL.png`) at both `public/long-light/art/traveler-stage1-hallow.webp` (the copy the demo actually serves) and the `long-light-site/art/` source copy. **These are uncommitted working-tree changes, so they aren't live yet** — that's why the new art isn't showing.

- **Commit and deploy** the updated `traveler-stage1-hallow.webp` (both the `public/long-light/art/` served copy and the `long-light-site/art/` source copy).
- Because the filename is unchanged, **add a cache-bust** so browsers/CDN stop serving the old image: append a version query to the Zone 1 traveler image URL in `src/pages/GainsDemoPage.jsx` (the `traveler-stage1-hallow.webp` entry, ~line 227) — e.g. `traveler-stage1-hallow.webp?v=2` — or your preferred cache-busting method.

**Verify.** On the live demo after a hard refresh, the Zone 1 traveler in the progression strip shows the new skin-tone-matched art (warmer/darker skin, visible sad face, hood up, dark cloak/aura); the other stages are unchanged. Log Recently-shipped + mark shipped.

*End of Draft 42.*


### Draft 43 — Review section: replace the Spark voices with the new six (A–F), plain labels only — ✅ SHIPPED 5314073 (2026-08-20)

In the "Ideas & Demos for Review" section's **Spark's voice** item (`review-spark-voice`): take down the current voices and replace them with **six** new contenders, labeled only **"Spark A" through "Spark F"** — **no descriptions or commentary** about any voice (no "old man," "young male," etc.).

Files (all staged in `public/long-light/audio/` and `long-light-site/audio/`):
- Spark A → `/long-light/audio/spark-voice-a.mp3`
- Spark B → `/long-light/audio/spark-voice-b.mp3`
- Spark C → `/long-light/audio/spark-voice-c.mp3`
- Spark D → `/long-light/audio/spark-voice-d.mp3`
- Spark E → `/long-light/audio/spark-voice-e.mp3`
- Spark F → `/long-light/audio/spark-voice-f.mp3`

Show six players labeled Spark A–F. Keep Spark's Option-2 intro text as the shared reference script and keep the `review-spark-voice` comment thread (ask which they prefer).

**Cache-bust:** a/b/c reuse existing filenames with NEW audio, so append a version query (e.g. `?v=3`) to all six audio URLs (or your preferred cache-bust) so no stale audio plays. Commit + deploy.

**Verify.** Six players Spark A–F, each plays its (new) audio; no per-voice descriptions/commentary anywhere; the intro text and comment thread are intact; a/b/c play the NEW files, not cached old ones. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 43.*

<!-- REFERENCE (not a draft) — Spark voice A–F source map (2026-08-20), for tracing a winner. Demo shows plain labels only. -->
<!--
  Spark A = spark-voice-a.mp3 <- "Spark A uses spark 7 in 11 labs.mp3"        (ElevenLabs: spark 7)
  Spark B = spark-voice-b.mp3 <- "Spark B Uses spark 6 on eleven labs.mp3"    (ElevenLabs: spark 6)
  Spark C = spark-voice-c.mp3 <- "Spark C not sure the eleven model.mp3"       (ElevenLabs: unknown)
  Spark D = spark-voice-d.mp3 <- "Spark D Old Man Spark.mp3"                   (the old-man/wizard voice)
  Spark E = spark-voice-e.mp3 <- "Spark E Male Young.mp3"                      (young male)
  Spark F = spark-voice-f.mp3 <- "Spark F Spark 5 on eleven labs.mp3"         (ElevenLabs: spark 5)
  Sources: Gains for Teens/Voices/Spark with Music/New Sparks/
-->


### Draft 44 — Demo: move the World & Development Map up + fill in the Zone Map grid — ✅ SHIPPED b50d520 (2026-08-20)

**1. Move the section.** Move the **World & Development Map** section (the Zone Map roadmap table + the `map-and-world.webp` image, driven by `ZONE_MAP_ROWS`) so it renders as the **first section after "Ideas & Demos for Review"** — above the "In Development" section and everything else. New page order: Ideas & Demos for Review → World & Development Map → In Development → (Child Assent & Measures, Playable Character, zones, Prototypes…).

**2. Update the grid cells (`ZONE_MAP_ROWS`):**
- **Zone 1 · The Dark Abyss** — gear `TBD` → **"Lantern"**.
- **Zone 2 · The Lantern Path** — gear `TBD` → **"Focusing Lens (in development)"**.
- **Zone 3 · The Mistfields** — activity `Bridge beat (TBD)` → **"Message to Your Guardian"** (Holly's elevator-pitch, now adopted). Gear stays **"A Wingsuit"** (earned by that activity to cross the bridge).
- **Zone 4 · The Bright Reaches** — activity → **"Mindfulness: Calm Place (3-3-3)"** (built). Gear stays **"Oxygen Mask."**
- **Zone 5 · The Threshold** — gear `Final gear / full toolkit` → **"Goggles (growth mindset) (in development)"**. Activity can stay as the pending Part 2 / Growth Mindset; if you want, note the **Final Boss summit (in development)** there since the team adopted it.

Leave the rest of each row (scene, video, goal) as-is.

**Naming flag:** Josh's latest term is **"Focusing Lens"**, but our gear/toolbox canon + the transition-phrases draft used **"Focusing Glass."** Using "Focusing Lens" here per Josh; we may want to reconcile to one name across the exposition/transition copy later.

**Verify.** The World & Development Map is the first section after "Ideas & Demos for Review"; the grid shows Lantern (Z1), Focusing Lens (in development) (Z2), Message to Your Guardian + Wingsuit (Z3), Mindfulness: Calm Place + Oxygen Mask (Z4), Goggles (growth mindset) (in development) (Z5); no layout breaks; the world-map image still renders. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 44.*


### Draft 45 — "Focusing Lens" rename + sync the Zone breakdown cards to the grid + Final Boss synopsis on Zone 5 — ✅ SHIPPED b50d520 (2026-08-20)

**1. Rename "Focusing Glass" → "Focusing Lens"** everywhere it appears in the demo/app (all user-facing copy; update comments where it aids clarity). "Focusing Lens" is now the canonical gear name.

**2. Sync the per-zone breakdown cards (the detailed Zone sections below the map) to Draft 44's grid** so the cards and the grid agree:
- Zone 1 · The Dark Abyss — gear: **Lantern**
- Zone 2 · The Lantern Path — gear: **Focusing Lens (in development)**
- Zone 3 · The Mistfields — activity: **Message to Your Guardian** (Holly's elevator-pitch, adopted); gear: **Wingsuit**
- Zone 4 · The Bright Reaches — activity: **Mindfulness: Calm Place (3-3-3)**; gear: **Oxygen Mask**
- Zone 5 · The Threshold — gear: **Goggles (growth mindset) (in development)**

**3. Add a Final Boss synopsis to the Zone 5 card** (short summary of the adopted summit script; mark it in development):
> **The Final Ascent (in development).** Three barriers block the last climb, each a mixed feeling about starting therapy, each cleared with a tool you've earned. Darkness (mixed feelings) → the growth-mindset goggles reveal a message to carry. Fog (past bad experiences) → the wingsuit carries you to a teen's positive testimonial. A blinding light (feeling alone) → your lantern shows the light is really many others holding their own lanterns — you're not alone. Then you light the Beacon at the summit of Mount Hope.

**Verify.** No "Focusing Glass" remains in user-facing copy (all read "Focusing Lens"); each Zone card's gear/activity matches the World & Development Map grid; the Zone 5 card shows the Final Boss synopsis marked in development. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 45.*


### Draft 46 — Body Mapping fixes (Aug 24 feedback): heart side, stomach position, Continue before the closing, write-in area — ✅ SHIPPED 721b5f2 (2026-08-24)

Fixes to the Body Mapping activity (inlined SVG + logic). All non-audio.

1. **Move the heart to the correct side.** Reposition the `region-heart` marker (and its icon) to the character's **left side of the chest — which appears on the viewer's right**, mirrored from where it is now — keeping it clearly distinct from the lungs. (Holly: "the heart will look more normal on the body's left side.")
2. **Lower the stomach graphic.** Move the `region-stomach` marker down a bit so there isn't a gap of empty space above it. (Holly.)
3. **Continue before the closing message.** Right now, selecting the 5th part jumps straight to the final/closing message, so you can't read the 5th part's own copy. Fix: after the 5th selection, show **that part's own copy first**, then require a **"Continue"** tap to advance to the closing message. (Holly.)
4. **Add a write-in "another area" option.** Add a free-text option — "Is there another area you feel it in your body? (write it in)" — so participants can name other symptoms/areas (Ginny gave examples: sweating, clenching jaw). Place it as an extra option in the select pass; the write-in flows through like the other selections.

**Verify.** Heart sits on the body's left (viewer's right), distinct from lungs; stomach graphic lowered with less empty space; selecting the 5th part shows its copy then a Continue → closing (no fast jump); a write-in "another area" option works. No `src/activities` changes → no version bumps. Log + mark shipped.

*End of Draft 46.*


### Draft 47 — Mindfulness UI/copy fixes (Aug 24 feedback), non-audio — ✅ SHIPPED 8750b15 (2026-08-24)

Fixes to the Mindfulness "Calm Place" activity. (The guided **voice** count and any Spark narration are separate — coming in the pre-generated-F-clip narration draft; this draft is text/visual/mix only.)

1. **Fix the leftover directions text.** On the final screen after the breathing, it still says "follow Spark's count." Replace that with appropriate closing text (it's no longer the breathing screen). (Holly.)
2. **Keep sound levels consistent.** Don't increase/ramp the ambient sounds during the "what can you hear" section — hold them at a steady level throughout. (Stephanie.)
3. **Reword the See prompt** to **"What are three things you can see"** (keep the chip selection). (Holly/admin.)
4. **More directive breathing orientation (text).** Before the breathing, add a short, specific line, e.g. *"On the next page, you'll see a count from Spark to follow along with."* And rename the "start breathing" button to **"Begin box breathing."**
5. **Frog — breathe-along + restyle.** (a) During the breathing step, have the frog gently **"breathe along"** — scale up on the inhale, hold, scale down on the exhale, in time with the box count. (b) The frog reads as off-style vs. the painterly scene (Maggie + Holly) — it needs an art restyle to match; **new asset pending** (Cowork will provide a painterly frog that fits the scene). Wire the breathe-along now; swap the frog art when the new asset lands.

**Verify.** No "follow Spark's count" text left on the final screen; ambient sound stays level during the Hear step; See prompt reads "What are three things you can see"; breathing has the more directive orientation line + "Begin box breathing" button; the frog breathes along with the box count. No `src/activities` changes → no version bumps. Log + mark shipped.

*End of Draft 47.*


### Draft 48 — Zone 3 "Message to Your Guardian": reorder steps + put the 988 safety message on its own page before the gear — ✅ SHIPPED 7c2ddfe (2026-08-24)

Changes from the Aug 24 feedback. (Spark **reading** the final message = audio, coming in the narration draft; this is order + layout only.)

1. **Reorder the steps.** Move "Make your request" up to right after "Describe the situation." New order: **Greeting → Situation → Request → Normalize → Offer → Benefit.** Update the "STEP X OF 6" indicator and the assembled-message order to match this sequence. (Stephanie + Holly: request should come before normalize/offer.)
2. **988 safety message on its own page, before the gear.** Pull the safety disclaimer ("Note: if what is going on feels urgent… call or text 988 immediately") out of the end block and give it its **own dedicated screen**, shown **after the message is saved but before the Wingsuit award**. Keep the copy verbatim. (Holly/admin: "on its own page, before they get the gear. Gear presentation will come after.")

Open question (Holly, no decision yet): the "write it as a note first" reassurance line could become its own page too, or live in the action plan — leaving it where it is for now unless you say otherwise.

**Verify.** Step order is Greeting → Situation → Request → Normalize → Offer → Benefit with a correct "OF 6" indicator; the assembled message reflects the new order; the 988 safety message appears on its own screen after save and before the Wingsuit award; copy verbatim. No `src/activities` changes → no version bumps. Log + mark shipped.

*End of Draft 48.*


### Draft 49 — Adopt the Shadowmend design system into the GAINS demo (tokens first + one starter screen) — ✅ SHIPPED 1533944 (2026-08-27)

Bring the **"Shadowmend / The Long Light"** design system into the real GAINS demo, incrementally. **Styling only — keep all activity logic intact.** Source of truth: the design system sent to you from Claude Design (if it's been shared with you), plus `Gains for Teens/Design System Assets/Design Tokens.md` and `GAINS Style Guide.md` in the repo.

**SCOPE CAREFULLY — GAINS only.** The SSI platform also hosts Ready for Roots (and others) on the current amber/slate theme. Do **not** change global/app-wide styles. Introduce the design-system tokens **scoped to the GAINS demo** — a GAINS theme wrapper / CSS-variable namespace applied only to `/gains-demo` and its components — so nothing outside GAINS shifts.

**Part 1 — tokens (GAINS-scoped CSS variables):**
- **Colors:** the palette groups + hexes from the style guide (ink/deep navy, dusk blues, twilight violets, rose & sky, warm light/amber, zone ramp).
- **Spacing:** 4px base / 8px rhythm; scale 4–80.
- **Corner radii:** 8 / 14 / 20 / 28 / 36 (nothing sharp).
- **Shadows:** cool-navy, soft, never black (sm / md / lg / sheet).
- **Motion:** `--ease-soft` (.4,0,.2,1 · 200ms), `--ease-settle` (.22,1,.36,1 · 340ms), `--ease-bloom` (.16,.84,.44,1 · 600–1200ms), `--ease-drift` (.37,0,.63,1 · ~4.5s). Soft eases only — nothing snaps.
- **Type:** Nunito, role scale (body/narration, display, eyebrow/meta), sensible line length.
- **Tap targets:** 48px minimum.
- **Screen frame:** mobile 9:16; 20px gutters, content pinned to bottom; 12px between choices, 32px between blocks.

**Part 2 — one starter screen.** Restyle just the **Exposition card** (Spark's intro) to the design system as the proof of concept: twilight/ink background with warm accents, Nunito narration type, the spacing/gutters, the amber pill CTA at 48px, soft eases on transitions. Keep the Option-2 exposition copy exactly. Don't touch other screens yet — we'll roll outward once this looks right.

**Verify.** The GAINS demo picks up the tokens (colors, spacing, radii, shadows, eases, Nunito, 48px targets) **scoped to GAINS only** — Ready for Roots and the rest of the app look unchanged; the Exposition card is restyled to the Shadowmend look with its copy intact; no activity logic changed; no console errors. Log Recently-shipped + mark shipped.

*End of Draft 49.*


### Draft 50 — Roll the Shadowmend design system across the whole /gains-demo page — ✅ SHIPPED 20082b2 (2026-08-27)

Extend Draft 49's foundation (the `.gains-theme` tokens in `src/styles/gains-tokens.css` + the `ds/` primitives in `src/components/gains/ds/`) to the **entire** `/gains-demo` page. **Styling only — do not change any activity logic, copy, hit-targets, data/feedback wiring, or the flow.** Keep Ready for Roots and all other interventions untouched (tokens stay scoped under `.gains-theme`; no `:root` or bare element-selector rules).

**Do it section by section, in this order, and verify after each** (don't big-bang the whole file blind):

1. **Page root** — wrap the `/gains-demo` page in `.gains-theme` so the tokens apply page-wide. Confirm nothing outside `/gains-demo` is affected.
2. **Ideas & Demos for Review** section + its cards → SceneFrame/panel styling, Nunito, the amber pill CTA, soft eases.
3. **World & Development Map** (the roadmap table + world image) → restyle to the twilight/ink palette + type; keep the grid data.
4. **In Development** section (Final Boss synopsis) → same treatment.
5. **Per-zone cards** (Zone 1–5: video cards, activity cards, gear, characters) → SceneFrame + SparkDialogue + Button primitives; keep all copy/scripts.
6. **NPCs** (Spark + the four creatures) and **Playable Character** (the four-stage strip) → restyle chrome only.
7. **Playable activities** (Body Mapping, Mindfulness: Calm Place, Zone 3 Message to Your Guardian) → restyle **chrome only** (backgrounds, panels, buttons, type). **Do NOT touch their interaction logic, region hit-targets, breathing timing, chip behavior, or copy.** Re-test each after: Body Map reveal→continue→select; Mindfulness see/hear/breathe + practice loop; Zone 3 six steps → safety page → gear.

**Known exceptions:** the traversal prototypes are **Phaser canvases** — restyle only their surrounding wrapper/chrome; the game interior is pixels and stays as-is (it gets the look through its own art, separately). The `.mp3`/`.webp` assets and audio behavior are unchanged.

**Verify.** The whole `/gains-demo` reads as one cohesive Shadowmend/Long Light surface (twilight palette, Nunito, soft-bloom motion, amber pill CTAs, 48px targets); every activity still functions exactly as before (Body Map, Mindfulness, Zone 3 all tested end-to-end); the review comment threads still work; no overflow at 375px; Ready for Roots (`/demo`) is visually and functionally unchanged with no console errors; clean build. Log Recently-shipped + mark shipped.

*End of Draft 50.*


### Draft 51 — Demo cleanup: videos into review (top), Spark→Narrator in Characters, Traveler strip→Playable Character — ✅ SHIPPED a14dcac (2026-08-27)

Reorganize `/gains-demo` (styling stays the current design-system look; keep all logic/copy).

**1. Add the five zone videos to the TOP of "Ideas & Demos for Review."** New first items, each a titled card that embeds the Vimeo video (or a clickable thumbnail card linking out if embedding the unlisted links is awkward). Titles + links:
- **Zone 1 — What is Trauma:** https://vimeo.com/1222082001/c65abe5b9f
- **Zone 2 — The Four Reactions:** https://vimeo.com/1222089263/d3825818f8
- **Zone 3 — Getting the Best Therapy:** https://vimeo.com/1222097986/4c7cf651e2
- **Zone 4 — What Therapy Feels Like:** https://vimeo.com/1222092263/bca4fdcea9
- **Zone 5 — Growth Mindset:** https://vimeo.com/1222095414/82f1e6b6f1
Give them a shared "Videos" heading; a comment thread for them is welcome (e.g. `review-videos`).

**2. Spark → the Characters area as "Narrator," with the chosen voice.** Retire the "Spark's voice (six options)" review item (the voice is decided). In the **Playable Character / Characters** area, present **Spark labeled "Narrator"** with Spark's art + a single voice-sample player for the **adopted voice: Option F (`/long-light/audio/spark-voice-f.mp3`)**. (If Spark already appears in the NPCs section, keep that, but this is where the Narrator label + the chosen voice sample live.)

**3. Move the Traveler four-stage progression out of review → Playable Character.** Take the "How the character changes" strip (the four Traveler stages) out of "Ideas & Demos for Review" and place it in the **Playable Character** section. Add a note under it: *"These stage images will be regenerated with an inner light — a glow in the chest that grows brighter across the stages."*

**4. Rename the top-of-demo label** from "Long Light" to **"Shadowmend / Long Light"** (the header/title at the very top of `/gains-demo`).

**After this,** the review section reads: the five Videos (top) → Body Mapping → Mindfulness: Calm Place → Zone 3: Message to Your Guardian. (Character progression + Spark voice have moved out.)

**Verify.** Five videos play/link at the top of the review section; Spark appears as "Narrator" in the Characters area with the Option-F sample; the four-stage Traveler strip is in Playable Character with the inner-light note; the review section's remaining items reflow cleanly; design-system styling intact; Ready for Roots untouched; no console errors. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 51.*


### Draft 52 — Review videos: resize + stack vertically; fix the visible demo title — ✅ SHIPPED c5de9ca (2026-08-27)

**1. Resize the five review videos and stack them vertically.** Right now they render in an oversized 2-up grid. Instead, show them in a **single vertical column, one after another**, each sized to its **natural phone-portrait 9:16** at about the **same width as the playable activity cards** (constrained max-width, centered) — not full-width/oversized. Keep each video's title above it and the shared "Videos" heading + comment thread.

**2. Fix the visible demo title.** The header at the top of `/gains-demo` still reads **"GAINS for Teens — The Long Light."** Change "The Long Light" → **"Shadowmend / Long Light"** so it reads **"GAINS for Teens — Shadowmend / Long Light."** (Draft 51 shipped without this visible-title change — it only touched a spec meta line.)

**Verify.** The five videos are a single vertical stack, each at ~activity size (9:16, constrained width, centered), all playing; the top-of-page title reads "GAINS for Teens — Shadowmend / Long Light"; no overflow; design-system styling intact. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 52.*


### Draft 53 — Build the measurement packet into the demo (Child Assent & Measures) — ✅ SHIPPED af00a92 (2026-09-01)

Add the GAINS measurement packet to `/gains-demo` in the **"Child Assent & Measures"** section, rendered as the actual questionnaires using the app's form controls + the Shadowmend design system (radios, checkboxes, Likert scales, text inputs; Nunito; 48px targets; scoped `.gains-theme`; mobile 9:16). Source of truth: `Gains for Teens/Measurements/Gains Teens Measurements_SG.docx`.

**Scope:** this is for team review on the demo (the page already says no real participant data). Render the forms; ephemeral/local state is fine. **Live data capture + scoring to Supabase is a SEPARATE follow-up** (mirroring Ready for Roots) — note it, don't build it here.

**IMPORTANT — use the real items, no invented content.** All items come from Stephanie's measurement doc; the CTS and Beck-4 items were embedded as images, now transcribed below. Build every instrument with its verbatim items. Every instrument now has its full item text — nothing is missing, nothing to placeholder.

Group each instrument **once**, labeled by when it's administered.

**PRE-ONLY**
1. **Demographics**
   - Age — "What is your current age?" (text)
   - Grade — "What grade are you in?" (text)
   - Race/Ethnicity — "Choose one or more races that you consider yourself to be." (multi-select): White or Caucasian; Black or African American; American Indian/Native American/Alaska Native; Asian; Native Hawaiian or Other Pacific Islander; Another (text); Prefer not to say
   - "Are you of Spanish, Hispanic, or Latino origin?" — Yes / No
   - Sex — "Please select your sex." — Boy/Male; Girl/Female; Nonbinary; Another (text); Prefer not to say
2. **Event: time since trauma** — show verbatim: "Sometimes scary or very upsetting things happen to people where they feel like their life or the life of someone close to them is in danger (like being hurt, seeing someone else hurt, being in a car accident, or not getting food or having a safe place to live). These things are called trauma experiences. When was the LAST time something like this happened to you?" → two text entries: months, years.
3. **Child Trauma Screen (CTS) — Reactions Subscale** (from Stephanie's doc). Prompt: "How often did each of these happen in the last 30 days?" 4-point scale: Never/Rarely = 0 · 1-2 times per month = 1 · 1-2 times per week = 2 · 3+ times per week = 3. Items (keep the doc's numbering 5–10):
   5. Strong feelings in your body when you remember something that happened (sweating, heart beats fast, feel sick).
   6. Try to stay away from people, places, or things that remind you about something that happened.
   7. Trouble feeling happy.
   8. Trouble sleeping.
   9. Hard to concentrate or pay attention.
   10. Feel alone and not close to people around you.
4. **Therapy history (present & past)** — with branching:
   - "Are you currently talking to a mental health therapist about any stressful issues in your life or for any reason?" — Yes / No
   - If **yes** → "Are you talking with your therapist about any traumatic experiences you have had?" — Yes / No
   - If **no** → "Have you ever talked to a mental health therapist in the past?" — Yes / No
     - If **yes** → "When was the last time you were in therapy?" — Less Than A Week Ago / About A Month Ago / Between 2-6 Months Ago / Between 6 Months-1 Year Ago / Over 1 year Ago
     - and → "Did you talk with your therapist about any traumatic experiences you have had?" — Yes / No

**PRE + POST** (administered both times)
5. **Beck Hopelessness Scale-4** (from Stephanie's doc). Prompt: "Please share how you are feeling, right now, at this moment." 4-point scale: Absolutely Disagree = 0 · Somewhat Disagree = 1 · Somewhat Agree = 2 · Absolutely Agree = 3. Sum to a total. Items:
   1. I feel that my future is hopeless and that things will not improve.
   2. My future seems dark to me.
   3. Things just won't work out the way I want them to.
   4. There's no use in really trying to get something I want, because I probably won't get it.
6. **Motivation / Readiness to Change Ruler** — 10-point scale. Verbatim items:
   - "At this moment, how ready are you to work towards dealing with any of the difficulties you may have related to your trauma experiences?"
   - "At this moment, how confident are you in your ability to improve those difficulties related to your trauma experiences?"
   - "How helpful do you think trauma therapy would be for you?"
   - "What is the reason for your response/rating." (text entry)
7. **Implicit Theories of Emotion Scale – Child Version** — 6 items; 6-point (Strongly disagree → Strongly agree). Verbatim items:
   1. I can't really control my feelings. It's just the way I am.
   2. If I want to, I can change how I feel.
   3. My feelings are something about me that I can't change very much.
   4. Even if I usually feel a certain way, I can change the feelings I have.
   5. No matter how hard I might try, I can't really change the feelings I have.
   6. I can learn to change my feelings.
8. **Trauma and Treatment Beliefs** — 6 items; 6-point (Strongly disagree → Strongly agree). Verbatim items (note reverse-scored):
   1. A traumatic event is a really scary experience that is almost impossible to recover from.
   2. Once a trauma is over our bodies and reactions always go back to "normal," like it never happened. (reverse scored)
   3. Having a hard time sleeping, difficulties concentrating, and not being able to relax can be reactions to experiencing trauma.
   4. Therapy doesn't really help most people that have experienced trauma. (reverse scored)
   5. If someone feels uncomfortable in therapy it means it is not working. (reverse scored)
   6. How someone thinks about things can change how they feel and what they do.

**POST-ONLY**
9. **Program Feedback Scale** (from Stephanie's doc). The first four items on a 0 (Really disagree) → 4 (Really agree) scale; the last two are free-response text entries. Items:
   1. This program was easy to use
   2. I understood the program
   3. I enjoyed the program
   4. I think the program would be helpful to other kids my age
   5. What did you like about the program? Please share as many true thoughts and feelings as you would like. (free-response text)
   6. What would you change about the program? Please share as many true thoughts and feelings as you would like. (free-response text)

**Verify.** The packet renders in the Child Assent & Measures section, grouped Pre-only / Pre+Post / Post-only, each instrument labeled with its timing; every provided item appears verbatim with the correct response format (Likert scales show their anchors); every instrument renders with its full verbatim items (CTS, Beck-4, and the complete Program Feedback Scale) — nothing omitted, no placeholder rows, no fabricated items; the therapy-history branching works; design-system styling, no data stored. Note in the shipped log that live capture + scoring is a follow-up. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 53.*


### Draft 54 — Pretest: paginate the measures into the real app flow, in a mobile container, at the top of the review section — ✅ SHIPPED 6f28c2f (2026-09-01)

Rework the measurement packet (Draft 53 — `src/components/gains/MeasurementPacket.jsx`, using the `src/components/gains/ds/` form primitives) so it plays like it will in the real app: **paginated with Continue buttons, inside a mobile-display-sized container** (the same phone frame the playable activities/videos use), instead of the current single long scroll. Reuse the existing instruments/items exactly — this is a flow/layout change, no item edits.

**1. Paginate as the administration flow.** One instrument per page (split Demographics across pages if it's long), each page inside the mobile 9:16 frame. Each page shows the instrument, a **Continue** button, and a small **progress indicator** (e.g. "Step X of Y" or dots). The therapy-history branching stays within its page (Continue enabled once answered). A final page ends the flow cleanly — a "Done"/"Finish" (review-only, nothing stored).

**2. Pre-test vs post-test (matches how it's administered):**
- **Pre-test flow** = Pre-only + Pre+Post instruments: Demographics → Event/time since trauma → Child Trauma Screen → Therapy history → Beck Hopelessness-4 → Readiness/Motivation ruler → Implicit Theories of Emotion → Trauma & Treatment Beliefs.
- **Post-test flow** = the Pre+Post instruments again + the Post-only Program Feedback Scale.
Build the **Pre-test** as the primary paginated flow now; make the **Post-test** its own separate paginated flow (same pattern), so the two are distinct.

**3. Move to the top.** Place the **Pre-test** as the **first item** in the "Proposals — comment before we make them official" (Ideas & Demos for Review) section — above the videos. The Post-test flow can sit right after it.

Keep: verbatim items (no changes/omissions), Shadowmend styling, 48px tap targets, review-only (no data stored or scored), and the comment thread.

**Verify.** The measures render as a paginated flow (one instrument per page, Continue + progress) inside a mobile-sized container; the Pre-test is the first item at the top of the review section, above the videos; therapy-history branching works within its page; reaching the end finishes cleanly with nothing stored; the Post-test flow is present; Shadowmend styling intact; no overflow at 375px; Ready for Roots unaffected; clean build. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 54.*
