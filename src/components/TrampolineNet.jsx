// TrampolineNet — parameterised SVG visual of a kid's safety net,
// styled as a circular trampoline with three woven wedges (Practical,
// Emotional, Social). Ally icons sit inside their type wedge(s); empty
// types collapse to a labelled 15° sliver.
//
// Visual reference: Activity ideas/trampoline-safety-net.svg. The
// reference has wedge angles hardcoded for a specific ratio; this
// component reimplements the geometry parametrically and scales the
// wedge angles to the actual ally distribution. Rim, woven pattern,
// label pills, and "YOU" hub match the reference.
//
// The reference is intentionally minimalist — woven pattern + rim +
// hub + labels, nothing else. Previous versions of this component also
// drew 24 radial cord lines and 4 concentric ring guides; those were
// dropped in 2026-05-12 to match the cleaner aesthetic.
//
// Geometry convention: angles are measured CLOCKWISE from 12 o'clock
// (the top of the net). This is the natural reading order for the
// participant and also matches the reference SVG's path constructions.
//
// Sizing: the SVG fills its parent container (width="100%") with the
// viewBox preserving the 400×440 aspect ratio. Callers control the
// rendered size via wrapper max-width — usually
// `max-w-[420px] md:max-w-[700px]` so phones stay compact and desktops
// take advantage of the available real estate. The `size` prop is kept
// as an optional max-width override for callers that need an explicit
// cap.

import { useMemo } from 'react'
import { ALLY_TILES, SUPPORT_TYPES } from '../lib/allyTiles.js'

// ---------- Geometry constants ----------
const VIEWBOX_W = 400
const VIEWBOX_H = 440
const CENTER_X = 200
const CENTER_Y = 215
const NET_RADIUS = 150
const RIM_OUTER = 162
const RIM_MID = 157
const RIM_INNER = 152
const HUB_OUTER = 22
const HUB_INNER = 20
const LABEL_RING = NET_RADIUS + 22 // where label-pill centers sit
const EMPTY_TYPE_SLIVER_DEG = 15

// Type-specific palette (lifted from the reference SVG).
const TYPE_STYLE = {
  practical: {
    label: 'Practical',
    patternId: 'tnet-practical',
    bg: '#FEF1D6',
    stroke: '#F59E0B',
    dot: '#B45309',
    pill: '#B45309',
  },
  emotional: {
    label: 'Emotional',
    patternId: 'tnet-emotional',
    bg: '#F8E5E5',
    stroke: '#C98686',
    dot: '#8E4A4A',
    pill: '#8E4A4A',
  },
  social: {
    label: 'Social',
    patternId: 'tnet-social',
    bg: '#E4EFE6',
    stroke: '#84A98C',
    dot: '#4E7257',
    pill: '#4E7257',
  },
}

// Angles measured CLOCKWISE from 12 o'clock, in radians.
const TWO_PI = Math.PI * 2
const degToRad = (d) => (d * Math.PI) / 180

function pointAt(angle, radius) {
  return {
    x: CENTER_X + radius * Math.sin(angle),
    y: CENTER_Y - radius * Math.cos(angle),
  }
}

// Build the SVG path for a pie-wedge from angle a1 → a2 (clockwise),
// at radius r. Uses the "large-arc" flag only if the span exceeds 180°.
function wedgePath(a1, a2, r) {
  const p1 = pointAt(a1, r)
  const p2 = pointAt(a2, r)
  const largeArc = a2 - a1 > Math.PI ? 1 : 0
  return `M ${CENTER_X} ${CENTER_Y} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`
}

// ---------- Wedge layout ----------

// Compute angular ranges for each support type given the ally distribution.
// Empty types get an EMPTY_TYPE_SLIVER_DEG sliver; remaining angle is
// distributed proportionally by ally count. Returns an array in
// SUPPORT_TYPES order, each entry = { typeId, startAngle, endAngle,
// isEmpty, count, midAngle }.
function computeWedges(allies) {
  const counts = {}
  for (const t of SUPPORT_TYPES) counts[t.id] = 0
  for (const a of allies) {
    if (a.removed) continue
    for (const t of a.support_types || []) {
      if (counts[t] != null) counts[t] += 1
    }
  }
  const emptyTypes = SUPPORT_TYPES.filter((t) => counts[t.id] === 0).map((t) => t.id)
  const totalAllyCount = SUPPORT_TYPES.reduce((s, t) => s + counts[t.id], 0)
  const sliverDeg = EMPTY_TYPE_SLIVER_DEG
  const totalSliverDeg = emptyTypes.length * sliverDeg
  let remainingDeg = 360 - totalSliverDeg
  // Edge case: every type is empty. Render three equal slivers so the
  // visual still reads as a net.
  if (emptyTypes.length === SUPPORT_TYPES.length) {
    remainingDeg = 0
  }

  // Walk types in order, starting from 12 o'clock (angle 0).
  let cursorDeg = 0
  return SUPPORT_TYPES.map((t) => {
    const isEmpty = counts[t.id] === 0
    let widthDeg
    if (isEmpty) {
      widthDeg = sliverDeg
      // Degenerate "all empty" case: distribute 360° evenly.
      if (emptyTypes.length === SUPPORT_TYPES.length) widthDeg = 360 / SUPPORT_TYPES.length
    } else {
      widthDeg = totalAllyCount > 0 ? (counts[t.id] / totalAllyCount) * remainingDeg : 0
    }
    const startDeg = cursorDeg
    const endDeg = cursorDeg + widthDeg
    cursorDeg = endDeg
    return {
      typeId: t.id,
      startAngle: degToRad(startDeg),
      endAngle: degToRad(endDeg),
      midAngle: degToRad((startDeg + endDeg) / 2),
      widthDeg,
      isEmpty,
      count: counts[t.id],
    }
  })
}

// Place each ally in its wedge(s). Returns an array of { ally, x, y,
// size, wedgeTypeId } records — one per (ally × type) pairing, so a
// multi-type ally renders in both wedges.
function placeAllies(allies, wedges) {
  const placements = []
  for (const wedge of wedges) {
    if (wedge.isEmpty) continue
    // Filter allies that belong to this wedge AND are not removed.
    const inWedge = allies.filter(
      (a) => !a.removed && (a.support_types || []).includes(wedge.typeId),
    )
    if (inWedge.length === 0) continue
    // Icon size scales down as wedges get crowded.
    const size = inWedge.length >= 10 ? 20 : inWedge.length >= 6 ? 24 : 32
    // Distribute angular positions evenly within the wedge, with a
    // small inset from the divider lines so icons don't ride the edge.
    const insetRad = Math.min(degToRad(6), (wedge.endAngle - wedge.startAngle) / 4)
    const innerAngle = wedge.startAngle + insetRad
    const outerAngle = wedge.endAngle - insetRad
    const innerRadius = 72
    const outerRadius = 112
    inWedge.forEach((a, i) => {
      const n = inWedge.length
      // Angle: spread evenly. With one ally, place at midAngle.
      const angle =
        n === 1
          ? wedge.midAngle
          : innerAngle + ((outerAngle - innerAngle) * i) / (n - 1)
      // Radius: stagger inner/outer to avoid overlap.
      const radius =
        n === 1
          ? (innerRadius + outerRadius) / 2
          : i % 2 === 0
            ? innerRadius + 8
            : outerRadius - 8
      const p = pointAt(angle, radius)
      placements.push({
        ally: a,
        x: p.x,
        y: p.y,
        size,
        wedgeTypeId: wedge.typeId,
      })
    })
  }
  return placements
}

// Position a label pill outside the rim at the wedge midpoint. Always
// horizontal text (the kid shouldn't have to tilt their head).
function labelPosition(midAngle) {
  return pointAt(midAngle, LABEL_RING)
}

// ---------- Component ----------

export default function TrampolineNet({
  allies = [],
  interactive = false,
  onAllyTap,
  showLabels = true,
  showInspectedMarks = false,
  highlightedAllyId = null,
  size,
}) {
  // Memo because both the activity and any wrapping page re-render
  // frequently; geometry math is cheap but allocates a lot of objects.
  const wedges = useMemo(() => computeWedges(allies), [allies])
  const placements = useMemo(() => placeAllies(allies, wedges), [allies, wedges])
  const removedAllies = useMemo(() => allies.filter((a) => a.removed), [allies])

  // Tile icon lookup — gracefully handle unknown ids by skipping the
  // image (placement still occupies its angular slot).
  const iconUrl = (allyId) => ALLY_TILES.find((t) => t.id === allyId)?.icon

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      width="100%"
      role="img"
      aria-label="Safety net visualization"
      style={{
        // `size` is an optional explicit cap; without it the SVG fills
        // its parent up to whatever max-width the wrapper sets.
        maxWidth: typeof size === 'number' ? `${size}px` : size,
        height: 'auto',
        display: 'block',
      }}
    >
      <defs>
        {/* Woven pattern per type — bg + two diagonal weave strokes. The
            old pattern definition also placed five dot circles at the
            corners + center of each 14×14 tile; those were dropped to
            match the cleaner reference. */}
        {SUPPORT_TYPES.map((t) => {
          const s = TYPE_STYLE[t.id]
          return (
            <pattern
              key={s.patternId}
              id={s.patternId}
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
            >
              <rect width="14" height="14" fill={s.bg} />
              <path
                d="M0 7 L7 0 M7 14 L14 7"
                stroke={s.stroke}
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M0 7 L7 14 M7 0 L14 7"
                stroke={s.stroke}
                strokeWidth="1.1"
                strokeLinecap="round"
                opacity="0.85"
              />
            </pattern>
          )
        })}
      </defs>

      {/* Rim — 3 nested circles for depth */}
      <circle cx={CENTER_X} cy={CENTER_Y} r={RIM_OUTER} fill="#5C3A28" />
      <circle cx={CENTER_X} cy={CENTER_Y} r={RIM_MID} fill="#7B5E45" />
      <circle cx={CENTER_X} cy={CENTER_Y} r={RIM_INNER} fill="#5C3A28" />

      {/* Wedges (woven net pattern per type) */}
      {wedges.map((w) => {
        // Empty wedges get a muted grey fill so they still read as a wedge slice.
        const fill = w.isEmpty
          ? '#EAE3D8'
          : `url(#${TYPE_STYLE[w.typeId].patternId})`
        return (
          <path
            key={`wedge-${w.typeId}`}
            d={wedgePath(w.startAngle, w.endAngle, NET_RADIUS)}
            fill={fill}
            opacity={w.isEmpty ? 0.55 : 1}
          />
        )
      })}

      {/* Ally icons + (optional) name pills */}
      {placements.map((p, idx) => {
        const url = iconUrl(p.ally.id)
        const half = p.size / 2
        const isInspected = !!p.ally.inspected
        const isHighlighted = highlightedAllyId && p.ally.id === highlightedAllyId
        const handleTap = interactive && onAllyTap ? () => onAllyTap(p.ally.id) : undefined
        // Halo stroke priority: highlighted (current walkthrough ally) >
        // inspected (already done) > default.
        const haloStroke = isHighlighted
          ? '#F59E0B'
          : isInspected
            ? '#10B981'
            : '#3B2A1F'
        const haloStrokeWidth = isHighlighted ? 3 : isInspected ? 1.8 : 0.6
        return (
          <g
            key={`ally-${p.ally.id}-${p.wedgeTypeId}-${idx}`}
            transform={`translate(${p.x} ${p.y})`}
            onClick={handleTap}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              outline: 'none',
            }}
            tabIndex={interactive ? 0 : -1}
            role={interactive ? 'button' : undefined}
            aria-label={interactive ? `Inspect ally ${p.ally.name}` : undefined}
            onKeyDown={(e) => {
              if (interactive && handleTap && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                handleTap()
              }
            }}
          >
            {/* Soft cream halo behind the icon so it reads on the patterned wedge */}
            <circle
              cx="0"
              cy="0"
              r={half + (isHighlighted ? 5 : 3)}
              fill="#FFFDF7"
              stroke={haloStroke}
              strokeWidth={haloStrokeWidth}
              opacity={0.95}
            />
            {url && (
              <image
                href={url}
                x={-half}
                y={-half}
                width={p.size}
                height={p.size}
                preserveAspectRatio="xMidYMid meet"
              />
            )}
            {/* Inspected checkmark (Step 2 only) */}
            {showInspectedMarks && isInspected && (
              <g transform={`translate(${half - 2} ${-half + 2})`}>
                <circle cx="0" cy="0" r="5" fill="#10B981" />
                <path
                  d="M -2.2 0 L -0.6 1.8 L 2.4 -1.6"
                  stroke="white"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}
            {/* Name pill */}
            {showLabels && (
              <g transform={`translate(0 ${half + 9})`}>
                <NamePill text={p.ally.name} />
              </g>
            )}
          </g>
        )
      })}

      {/* Center hub + "YOU" */}
      <circle cx={CENTER_X} cy={CENTER_Y} r={HUB_OUTER} fill="#3B2A1F" />
      <circle cx={CENTER_X} cy={CENTER_Y} r={HUB_INNER} fill="#5C3A28" />
      <text
        x={CENTER_X}
        y={CENTER_Y + 3}
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="10"
        fontWeight="700"
        fill="#FBE9B7"
        letterSpacing="0.1em"
      >
        YOU
      </text>

      {/* Type label pills outside the rim */}
      {wedges.map((w) => {
        const s = TYPE_STYLE[w.typeId]
        const p = labelPosition(w.midAngle)
        const text = w.isEmpty ? `No ${s.label.toLowerCase()} yet` : s.label
        const pillWidth = w.isEmpty ? 130 : 76
        const pillHeight = 22
        return (
          <g
            key={`label-${w.typeId}`}
            transform={`translate(${p.x - pillWidth / 2} ${p.y - pillHeight / 2})`}
          >
            <rect
              width={pillWidth}
              height={pillHeight}
              rx={pillHeight / 2}
              fill={s.pill}
              opacity={w.isEmpty ? 0.6 : 1}
            />
            <text
              x={pillWidth / 2}
              y={pillHeight / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontSize={w.isEmpty ? 10 : 11}
              fontWeight="700"
              fill="#FFFDF7"
              letterSpacing="0.02em"
            >
              {text}
            </text>
          </g>
        )
      })}

      {/* Removed allies (faded, in a strip under the net) */}
      {removedAllies.length > 0 && (
        <g transform={`translate(0 ${VIEWBOX_H - 30})`}>
          <text
            x={CENTER_X}
            y={-12}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize="9"
            fill="#7B5E45"
            fontStyle="italic"
          >
            Taken out of net (still in your life)
          </text>
          {removedAllies.map((a, i) => {
            const spacing = 36
            const totalW = (removedAllies.length - 1) * spacing
            const x = CENTER_X - totalW / 2 + i * spacing
            const url = iconUrl(a.id)
            return (
              <g
                key={`removed-${a.id}-${i}`}
                transform={`translate(${x} 6)`}
                opacity={0.5}
              >
                {url && (
                  <image
                    href={url}
                    x={-12}
                    y={-12}
                    width={24}
                    height={24}
                  />
                )}
                <line x1={-12} y1={-12} x2={12} y2={12} stroke="#5C3A28" strokeWidth="1.4" />
                <line x1={12} y1={-12} x2={-12} y2={12} stroke="#5C3A28" strokeWidth="1.4" />
              </g>
            )
          })}
        </g>
      )}
    </svg>
  )
}

// Small white-on-dark pill for ally names. Width is approximated from
// character count — good enough for the demo; can be replaced with
// canvas-measured text if labels ever look pinched.
function NamePill({ text }) {
  const safe = String(text || '')
  const truncated = safe.length > 14 ? safe.slice(0, 13) + '…' : safe
  const width = Math.max(36, truncated.length * 5.8 + 10)
  const height = 12
  return (
    <g>
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={height / 2}
        fill="#3B2A1F"
        opacity="0.85"
      />
      <text
        x="0"
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="8"
        fontWeight="600"
        fill="#FFFDF7"
      >
        {truncated}
      </text>
    </g>
  )
}
