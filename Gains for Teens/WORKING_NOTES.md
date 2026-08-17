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
