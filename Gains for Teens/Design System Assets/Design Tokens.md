# Shadowmend / The Long Light — Design Tokens (captured from the Design system)

Concrete values to apply when styling the real GAINS demo to match the design system. (Palette hexes live in `GAINS Style Guide.md`.)

## Screen
- Mobile frame: `--screen-w` / `--screen-h` = **420 × 880**
- Screen gutters: **20px** sides; content **pinned to the bottom**
- `--stack` = **12px** between choices; `--stack-section` = **32px** between blocks

## Spacing
- Base **4px**, rhythm **8px**
- Scale (px): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80

## Tap targets (teens, thumbs, phones)
- **48px minimum**; sizes: 40 (sm) / 48 (min) / 52 (default) / 60 (lg)

## Corner radii
- Nothing is sharp: **8 / 14 / 20 / 28 / 36 px**

## Shadows
- Cool navy, soft, **never black**: sm / md / lg / sheet

## Motion ("soft eases only — nothing snaps"; living light breathes/drifts/blooms, always running)
- `--ease-soft` = cubic-bezier(.4,0,.2,1) — UI — **200ms** hover/press
- `--ease-settle` = cubic-bezier(.22,1,.36,1) — press / arrive — **340ms** panels, choices
- `--ease-bloom` = cubic-bezier(.16,.84,.44,1) — light swelling — **600ms** zone change / **1200ms** light arriving
- `--ease-drift` = cubic-bezier(.37,0,.63,1) — particles / breath — Spark breathe **4.5s**, halos

## Type
- **Nunito.** Roles: Body & narration, Display scale, Eyebrows & meta; mind Line length; Weights per role (exposition uses Nunito 800, -0.02em per the wordmark).

## Copy / UI
- Primary CTA style seen: **"Keep going"** amber pill.
- **No light-gray body/helper text (Draft 79, 9/14 check-in).** `--text-faint`
  and `--text-muted` read as disabled/unimportant on the dark Shadowmend
  surfaces, especially for teens on phones. Participant-facing text --
  helper lines, progress labels ("Step X of Y"), slider ticks/anchors,
  option and write-in labels, captions, blurbs -- uses `--text-body` or
  brighter. Reserve `--text-faint`/`--text-muted` for genuine reviewer-only
  chrome: badges/pills and "Prototype · not yet wired…"-style dev footers,
  and deliberate earned/unearned game-state indicators (e.g. the gear HUD's
  dimmed not-yet-earned slots). Placeholder text may sit one step softer
  than body text but must stay clearly readable.

## Screen set (the 8 session screens, in order)
Assent → Exposition → Zone map → Video → Activity → Gear → Final Boss → Beacon (with per-zone Z1–Z5 variants).

## Color groups (see style guide for hexes)
Ink & deep navy · Dusk blues · Twilight violets · Rose & sky · Creature accents · Warm light · Zone ramp · Twilight skies · Protection veils.
