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
- **The Hollowshell — avoidance.** It sealed itself inside a shell to feel safe, until nothing warm could reach it. Opening a single seam, a little at a time and with support, is what let the light back in.
- **The Dimmet — negative mood / thoughts.** It walks bent under its own dark cloud, its glow turned low, sure the weight is its alone to carry. It learned those heavy thoughts weren't facts, set the stone down, and turned its light back up.

*Note: the creatures' recovery lines are concept copy; Stephanie owns the final clinical wording.*

**Verify:** load `/long-light/` — "The Travelers" section renders after the spec panel; main character is clearly the largest; four creature cards show image + name + description; art loads from `/long-light/art/`; no 404s; scroll/brighten still works. No `src/activities` changes → no version bumps. Log Recently-shipped + mark shipped.

*End of Draft 3.*
