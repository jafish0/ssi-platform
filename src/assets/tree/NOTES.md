# Ready for Roots — Tree Growth Stages · Build Notes

Six locked stage references for the between-activity progress reveal. Each is a pure-vector
SVG on a shared `viewBox="0 0 400 600"`, transparent background, every file < 30kb.

## Files
| File | Stage | Trigger |
|---|---|---|
| `tree-stage-0.svg` | Seed / sprout | Start (no activity done) |
| `tree-stage-1.svg` | Sapling | After activity 1 |
| `tree-stage-2.svg` | Young tree | After activity 2 |
| `tree-stage-3.svg` | Established tree | After activity 3 |
| `tree-stage-4.svg` | Flourishing tree | After activity 4 |
| `tree-stage-5.svg` | Blooming | Full completion |

Open `Tree Growth Stages.html` to review all six side-by-side and download them.

## Locked invariants (true across all six files)
- **Canvas:** `0 0 400 600`, transparent, no frame.
- **Ground line:** `y=420`, drawn once in `<g id="ground">` as a single `slate-200` (`#e2e8f0`) stroke. Never moves. Roots live below it, the tree above it.
- **Trunk base anchor:** centered at `x=200`, base sits on `y=420`. The trunk silhouette is the **same continuous tapered path** every stage — only its height (`h`) and base/top half-widths grow. A consistent `+4px` lean to the right and a `1.55×` base flare (root buttress) are constant, so the dev can drive the whole trunk from three numbers: `h`, `wBase`, `wTop`.
- **Layer order & semantics:** `ground → roots → trunk → branches → leaves → blossoms`, each a `<g id="…">`. Every individual element inside carries a memorable id (`root-tap`, `root-lat-1`, `branch-3`, `clump-d2`, `leaf-1`, `bloom-5`, …) and a `class` matching its layer, so layers can be styled in bulk and elements animated individually.

## How the parts are built (so you can reproduce parametrically)
- **Roots** — every root is a **single continuous quadratic `<path>`** stroked with round caps (no fills), so `stroke-dasharray`/`stroke-dashoffset` draw-in works out of the box. Tiers by `stroke-width`: taproot (thickest, `#5a3a1f`), lateral roots (medium), sub-roots & fine roots (thin, `#4a2d18`). Naming: `root-tap`, `root-lat-N`, `root-fine-N`, and in stage 5 `root-spread-N` (the wide outer roots that wind toward the canvas edges). **Sub-roots** branch off a parent and are named for it — `root-lat-1-sub-1`, `root-tap-sub-2`, `root-spread-1-sub-1` — and each sub-root's first point sits *on* its parent's path, so when you animate the parent in first then the sub-root, the join looks continuous. **The root system densifies every stage:** more laterals appear, and existing laterals sprout more sub-roots, so the underground spread grows in count *and* branchiness, not just length.
- **Trunk** — one filled `<path id="trunk-main">`. To thicken between stages, scale it on the X axis about its base center (`transform-origin: 200px 420px`) — the path shape is identical stage-to-stage.
- **Branches** — single continuous quadratic stroke paths (`branch-N`), same draw-in technique as roots. Mostly tucked behind the canopy; tips peek through. They appear progressively and stay put once introduced.
- **Leaves / canopy** — the canopy is built from **foliage clumps** (`<path class="clump">`, bumpy rounded blobs) layered in three tones for depth: dark underclumps (`#5e8460`, ids `clump-dN`), mid clumps (`#7c9a76`, `clump-N`), light top clumps (`#90ab8a`). A few **individual pointed almond leaves** (`leaf-N`) sit at the canopy edge for texture. Each clump and leaf is its own grouped shape — fade-and-scale them in independently.
- **Blossoms (stage 5 only)** — `<g class="blossom" id="bloom-N">`, each a simple 5-petal flower (five small circles + a darker center). Two colors alternate: amber `#f59e0b` (center `#b45309`) and pale rose `#fda4af` (center `#f17a8a`). Ten of them, scattered across the canopy.

## Creative choices not dictated by the prompt
1. **Leaf shape** — symmetric **almond/pointed-both-ends** leaf, width ≈ 40% of length, drawn with two cubic curves. Used both as accent leaves and as the implied texture of the foliage clumps.
2. **Canopy as clumps, not scattered leaves** — a fully leaf-by-leaf canopy reads as noise at phone size, so the mass is rounded "leaf-cluster" blobs with a few accent leaves on top. This keeps each stage clean and gives the dev a small, countable set of shapes to animate. Blob bumpiness uses a seeded PRNG (seeds are baked into the files) so the same canopy reproduces exactly.
3. **Three-tone foliage** — dark clumps behind, mid in the middle, light on top. Reads as volume/sunlight without any gradient or filter (per your constraint). Same three greens you specified.
4. **Trunk lean + base flare** — a gentle constant rightward lean and a flared base keep it from feeling like a CAD cylinder and tie it visually to the roots.
5. **Stage 0 sprout** — a half-buried seed (`#seed` ellipse) + a short **green** shoot (`#sprout-stem`, leaf-green rather than brown, since it hasn't woodened yet) + two tiny cotyledon leaves. The taproot is a single short stroke. Deliberately tiny — the "you're just starting" state.
6. **Roots get prouder, denser, and more branched — not just longer** — between stages the laterals thicken and fan wider, *new* laterals are added, and existing laterals sprout `*-sub-*` child roots, so the system reads as a growing branching network. Stage 5 adds four `root-spread-*` roots (with their own sub-roots) that wind out toward the canvas edges for the "fully anchored" payoff.
7. **Canopy scales up sharply across stages** — clump radii roughly double from stage 2 to stage 4 and the canopy widens to nearly fill the canvas, so the reveal between activities feels like a real leap in growth rather than an incremental nudge.

## Animation-ready checklist (what was honored)
- ✅ Roots & branches are single continuous paths → `stroke-dashoffset` draw-in.
- ✅ Each leaf/clump/blossom is its own element with an id → independent fade/scale-in.
- ✅ Trunk is one path with a fixed base anchor → X-scale to thicken.
- ✅ Solid fills & strokes only — no gradients, filters, masks, or `<animate>` tags.
- ✅ Nothing is ever removed between stages; each stage adds to the last.
