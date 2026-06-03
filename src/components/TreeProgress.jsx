// TreeProgress — parametric SVG of a tree at one of six growth stages
// (0 Seed → 5 Blooming), per Draft 21's spec / Draft 25's build. The
// "Ready for Roots" progress metaphor: roots and canopy grow as a youth
// completes activities.
//
// The geometry is rebuilt from Claude Design's six locked reference SVGs
// (`Activity ideas/tree-stage-*.svg`) — the per-stage element data lives
// in `src/lib/treeStages.js`, machine-extracted so it matches the
// references exactly. The references are per-stage full redraws (the
// whole tree scales each stage), so this component swaps the complete
// element set on each stage change rather than revealing a single
// additive overlay.
//
// Animation: on a FORWARD stage change (and when `animated`), the new
// stage "grows in" — roots and branches draw on via a stroke-dashoffset
// sweep (normalized with pathLength=1), trunk/leaves/blossoms fade in,
// all lightly staggered so it reads as a moment of growth (~700ms total)
// rather than a flash. Backward steps and jumps render instantly.
// Respects `prefers-reduced-motion: reduce` (no animation).
//
// Props:
//   stage     0..5 (required)   — current growth stage
//   animated  bool (default true) — animate growth-in on forward change
//   className string             — wrapper styling (e.g. width cap)

import { useRef } from 'react'
import { TREE_STAGES } from '../lib/treeStages.js'

const GROUND_Y = 420

const STAGE_ARIA = [
  'Tree at stage 0 of 5 — a seed with a tiny sprout, roots just beginning below the surface.',
  'Tree at stage 1 of 5 — a sapling with a short trunk, a few leaves, and small spreading roots.',
  'Tree at stage 2 of 5 — a young tree with several branches, a small canopy, and deeper roots.',
  'Tree at stage 3 of 5 — an established tree with a full-height trunk, growing canopy, and substantial roots.',
  'Tree at stage 4 of 5 — a flourishing tree with a full canopy and wide, proud roots.',
  'Tree at stage 5 of 5 — a blooming tree, full canopy with blossoms and roots spread wide across the ground.',
]

// Keyframes + classes are global-but-idempotent (same definition each
// mount), so rendering this <style> once per instance is harmless. The
// reduced-motion block disables all of it.
const TP_CSS = `
@keyframes tpDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes tpFade { from { opacity: 0; } to { opacity: 1; } }
.tp-draw { stroke-dasharray: 1; animation: tpDraw 520ms ease-out both; }
.tp-fade { animation: tpFade 360ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .tp-draw, .tp-fade { animation: none !important; stroke-dasharray: none; opacity: 1; }
}
`

export default function TreeProgress({ stage = 0, animated = true, className = '' }) {
  const safe = Math.max(0, Math.min(5, Math.trunc(stage) || 0))

  // Derive animation direction from the previous stage. We update the
  // ref DURING render only when the stage actually changes, so incidental
  // re-renders (parent state churn) don't flip `play` mid-animation and
  // interrupt it — the classic "previous prop" ref pattern.
  const prevStageRef = useRef(safe)
  const playRef = useRef(false)
  if (safe !== prevStageRef.current) {
    playRef.current = safe > prevStageRef.current // animate on forward only
    prevStageRef.current = safe
  }
  const play = animated && playRef.current

  const data = TREE_STAGES[safe]

  return (
    <svg
      viewBox="0 0 400 600"
      width="100%"
      role="img"
      aria-label={STAGE_ARIA[safe]}
      className={className}
      style={{ display: 'block', height: 'auto' }}
    >
      <style>{TP_CSS}</style>

      {/* Ground line — always visible across all stages */}
      <line
        x1="24"
        y1={GROUND_Y}
        x2="376"
        y2={GROUND_Y}
        stroke="#e2e8f0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Keyed by stage so the group remounts on each change, restarting
          the CSS animation cleanly when `play` is on. */}
      <g key={safe}>
        {/* Roots — draw in first */}
        {data.roots.map((r, i) => (
          <path
            key={`root-${i}`}
            d={r.d}
            fill="none"
            stroke={r.stroke}
            strokeWidth={r.sw}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={play ? 1 : undefined}
            className={play ? 'tp-draw' : undefined}
            style={play ? { animationDelay: `${i * 35}ms` } : undefined}
          />
        ))}

        {/* Trunk (and seed/sprout at stage 0) — fades with the roots */}
        {data.trunk.map((t, i) =>
          t.kind === 'ellipse' ? (
            <ellipse
              key={`trunk-${i}`}
              cx={t.cx}
              cy={t.cy}
              rx={t.rx}
              ry={t.ry}
              fill={t.fill}
              className={play ? 'tp-fade' : undefined}
              style={play ? { animationDelay: '0ms' } : undefined}
            />
          ) : (
            <path
              key={`trunk-${i}`}
              d={t.d}
              fill={t.fill || 'none'}
              stroke={t.stroke || undefined}
              strokeWidth={t.sw || undefined}
              strokeLinecap="round"
              className={play ? 'tp-fade' : undefined}
              style={play ? { animationDelay: '40ms' } : undefined}
            />
          ),
        )}

        {/* Branches — draw in after roots */}
        {data.branches.map((b, i) => (
          <path
            key={`branch-${i}`}
            d={b.d}
            fill="none"
            stroke={b.stroke}
            strokeWidth={b.sw}
            strokeLinecap="round"
            pathLength={play ? 1 : undefined}
            className={play ? 'tp-draw' : undefined}
            style={play ? { animationDelay: `${180 + i * 45}ms` } : undefined}
          />
        ))}

        {/* Leaves — fade in (opacity only; many carry their own
            translate/rotate transform, so we never apply a CSS transform
            here that would clobber it) */}
        {data.leaves.map((l, i) => (
          <path
            key={`leaf-${i}`}
            d={l.d}
            fill={l.fill}
            transform={l.transform || undefined}
            className={play ? 'tp-fade' : undefined}
            style={play ? { animationDelay: `${360 + i * 25}ms` } : undefined}
          />
        ))}

        {/* Blossoms (stage 5 only) — each a cluster of petal circles */}
        {data.blossoms.map((petals, bi) => (
          <g
            key={`bloom-${bi}`}
            className={play ? 'tp-fade' : undefined}
            style={play ? { animationDelay: `${560 + bi * 25}ms` } : undefined}
          >
            {petals.map((c, ci) => (
              <circle key={ci} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} />
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
}
