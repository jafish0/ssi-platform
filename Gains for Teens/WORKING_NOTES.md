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
