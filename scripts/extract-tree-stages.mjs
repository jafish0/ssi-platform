// Build helper (NOT shipped at runtime): parses the six locked
// tree-stage reference SVGs in `src/assets/tree/` and regenerates
// `src/lib/treeStages.js`, which `TreeProgress.jsx` reads. Run with:
//   node scripts/extract-tree-stages.mjs > src/lib/treeStages.js  (with header)
// — but in practice the wrapper below writes the file directly.
//
// Source set updated 2026-06-08 (Draft 26 Part F follow-up): Claude
// Design's denser "ready-for-roots-tree" set replaced the original
// Draft 25 references. Same structure/conventions (see NOTES.md), just
// fuller roots + canopy + blossoms.
//
// The references are per-stage full redraws (the whole tree scales each
// stage), so we capture the complete element set per stage rather than a
// single additive overlay.

import { readFileSync, writeFileSync } from 'node:fs'

const DIR = 'src/assets/tree'
const stages = []

function attr(tag, name) {
  // Negative lookbehind so `d` doesn't match inside `id`, `r` inside
  // `rx`/`stroke`, etc.
  const m = tag.match(new RegExp(`(?<![\\w-])${name}="([^"]*)"`))
  return m ? m[1] : null
}

// Pull the inner content of a <g id="..."> ... </g> block. Non-greedy —
// fine for roots/trunk/branches/leaves which contain no nested <g>.
function groupBody(svg, id) {
  const m = svg.match(new RegExp(`<g id="${id}"[^>]*>([\\s\\S]*?)</g>`))
  return m ? m[1] : ''
}

// Blossoms is the last group and contains nested <g class="blossom">
// elements, so the non-greedy matcher above would stop early. Grab
// everything from <g id="blossoms"> to the final </svg>.
function blossomsBody(svg) {
  const m = svg.match(/<g id="blossoms"[^>]*>([\s\S]*)<\/g>\s*<\/svg>/)
  return m ? m[1] : ''
}

function parsePaths(body) {
  const out = []
  const re = /<path\b[^>]*><\/path>|<path\b[^>]*\/?>/g
  let m
  while ((m = re.exec(body))) {
    const tag = m[0]
    out.push({
      d: attr(tag, 'd'),
      fill: attr(tag, 'fill'),
      stroke: attr(tag, 'stroke'),
      sw: attr(tag, 'stroke-width'),
      transform: attr(tag, 'transform'),
    })
  }
  return out
}

function parseTrunk(body) {
  const els = []
  // ellipses (seed)
  const er = /<ellipse\b[^>]*>(?:<\/ellipse>)?/g
  let m
  while ((m = er.exec(body))) {
    const t = m[0]
    els.push({
      kind: 'ellipse',
      cx: attr(t, 'cx'),
      cy: attr(t, 'cy'),
      rx: attr(t, 'rx'),
      ry: attr(t, 'ry'),
      fill: attr(t, 'fill'),
    })
  }
  for (const p of parsePaths(body)) {
    els.push({ kind: 'path', ...p })
  }
  return els
}

function parseBlossoms(body) {
  // each blossom is a <g ...> with several <circle> petals + a center.
  const out = []
  const gr = /<g\b[^>]*class="blossom"[^>]*>([\s\S]*?)<\/g>/g
  let m
  while ((m = gr.exec(body))) {
    const inner = m[1]
    const circles = []
    const cr = /<circle\b[^>]*>(?:<\/circle>)?/g
    let c
    while ((c = cr.exec(inner))) {
      const t = c[0]
      circles.push({
        cx: attr(t, 'cx'),
        cy: attr(t, 'cy'),
        r: attr(t, 'r'),
        fill: attr(t, 'fill'),
      })
    }
    out.push(circles)
  }
  return out
}

for (let s = 0; s <= 5; s++) {
  const svg = readFileSync(`${DIR}/tree-stage-${s}.svg`, 'utf8')
  stages.push({
    roots: parsePaths(groupBody(svg, 'roots')),
    trunk: parseTrunk(groupBody(svg, 'trunk')),
    branches: parsePaths(groupBody(svg, 'branches')),
    leaves: parsePaths(groupBody(svg, 'leaves')),
    blossoms: parseBlossoms(blossomsBody(svg)),
  })
}

// Write `src/lib/treeStages.js` directly (header + named export, compact
// single-line data so the auto-generated diff stays tidy).
const header = `// AUTO-GENERATED from the six locked reference SVGs in
// \`src/assets/tree/tree-stage-*.svg\` by \`scripts/extract-tree-stages.mjs\`.
// Do NOT hand-edit — re-run the extractor if the references change.
//
// Source set: Claude Design's CTAC-refreshed "Ready for Roots Tree"
// (Draft 37, 2026-06-29) — CTAC-palette greens/oranges baked in, with an
// amplified stage 4 + 5 (stage 5 now 30 blossom clusters). Sky/sun/cloud
// elements were removed by Josh; the atmospheric "wow" lives in the
// montage instead. See src/assets/tree/NOTES.md.
//
// Each entry is one growth stage (0 Seed -> 5 Blooming), holding the
// COMPLETE element set for that stage (per-stage full redraws — the whole
// tree scales each stage).
//   roots/branches: stroked <path> { d, stroke, sw }
//   trunk:          [{ kind:"ellipse"|"path", ... }]
//   leaves:         filled <path> { d, fill, transform? }
//   blossoms:       array of flowers, each an array of petal circles { cx, cy, r, fill }

`
writeFileSync('src/lib/treeStages.js', header + 'export const TREE_STAGES = ' + JSON.stringify(stages) + '\n')
process.stdout.write('Wrote src/lib/treeStages.js — ' + stages.length + ' stages, stage-5 blossoms: ' + stages[5].blossoms.length + '\n')
