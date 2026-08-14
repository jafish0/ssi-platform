// Body Mapping (GAINS Activity 1) — Draft 27.
//
// Stephanie's activity, built from the blueprint in
// `Gains for Teens/Activities/` (body-map.svg + the vanilla-JS prototype).
// The SVG is inlined rather than <img>-embedded so the per-region states can
// be driven from React: each region <g> gets `active` (Part 1 reveal glow) or
// `selected` (Part 2 amber fill + check badge) from component state.
//
// Two no-fail parts, no scoring:
//   1. Reveal  — tap each of the five regions to learn what it does (N of 5),
//                then a closing line unlocks Continue.
//   2. Select  — tap the reactions you've felt recently, then Done.
//
// Fits the app's 9:16 vertical frame. The figure is a FIXED share of the
// frame and the copy block below it is the flexible one, so the body never
// moves or resizes as you tap between regions (it used to: the figure was
// flex-1, so a long region text stole its space). Region copy is VERBATIM
// from Stephanie; don't reword it.

import { useState } from 'react'

const REGIONS = [
  {
    id: 'lungs',
    label: 'Lungs',
    text: 'We start breathing faster, to help our body take in more oxygen',
  },
  {
    id: 'head',
    label: 'Head',
    text: 'Thoughts begin to race through our heads to allow us to make quick decisions, but this also makes it hard to think clearly, can cause us to feel dizzy, and can even make us feel detached or like things around us aren’t real',
  },
  {
    id: 'heart',
    label: 'Heart',
    text: 'Our hearts start beating faster because it is harder to pump blood to all our muscles',
  },
  {
    id: 'stomach',
    label: 'Stomach',
    text: 'Our stomach might feel upset or we might feel nauseous because blood is moving away from our stomach and into our arms and legs',
  },
  {
    id: 'body',
    label: 'Body',
    text: 'Our body heats up, leading to more sweating. Our muscles also get tense, and we might feel shaky or tingly.',
  },
]

// The tallest the copy panel can ever be. Head is not just the longest of the
// five by a little, it is ~55% longer than the next one, so it wraps tallest at
// every width and is a safe stand-in for "worst case" without hardcoding a
// pixel height. If a region's copy is ever rewritten longer than Head's, this
// needs to follow it.
const LONGEST_REGION_TEXT = REGIONS.reduce(
  (a, b) => (b.text.length > a.text.length ? b : a),
  REGIONS[0]
).text

const INSTRUCTIONS = {
  reveal: 'Click to reveal different areas of the body that react during and after a trauma.',
  select: 'Click on each of these reactions you have had recently.',
  done: 'Nice noticing.',
}

const CLOSING =
  'Each of these things help us respond to danger, but these responses can stick around even after the danger has passed or can pop up if something reminds us of the danger or trauma.'

// Scoped so the region styles can't collide with anything else on the page.
const SVG_CSS = `
.bm-region { cursor: pointer; }
.bm-region .bm-target { fill:#334155; fill-opacity:0; transition:fill-opacity .25s, fill .25s; }
.bm-region .bm-icon path { fill:none; stroke:#334155; stroke-width:2.4; stroke-linejoin:round; stroke-linecap:round; transition:stroke .25s; }
.bm-region .bm-check { opacity:0; transition:opacity .2s; }
.bm-region:hover .bm-target { fill:#334155; fill-opacity:.06; }
.bm-region:focus { outline:none; }
.bm-region:focus-visible .bm-target { fill:#334155; fill-opacity:.12; }
.bm-region.is-active .bm-target { fill:#F59E0B; fill-opacity:.20; filter:url(#bmAmberGlow); }
.bm-region.is-active .bm-icon path { stroke:#B45309; }
.bm-region.is-selected .bm-target { fill:#F59E0B; fill-opacity:.24; }
.bm-region.is-selected .bm-icon path { stroke:#B45309; }
.bm-region.is-selected .bm-check { opacity:1; }
@media (prefers-reduced-motion: reduce) {
  .bm-region .bm-target, .bm-region .bm-icon path, .bm-region .bm-check { transition: none; }
}
`

// Shared by the live CTA and by the invisible spacer that reserves its slot.
const CTA_CLASS =
  'w-full mt-2 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[15px] font-extrabold text-center'

// The three pieces of the copy block. Factored out because the block renders
// them twice: once invisibly at their worst case to reserve height, once live.
// Both copies must stay identical or the reservation drifts.
function PanelBox({ label, text, muted }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5">
      {label && (
        <div className="font-extrabold text-amber-700 text-[13px] mb-0.5">
          {label}
        </div>
      )}
      <div
        className={
          'text-[12.5px] leading-snug ' +
          (muted ? 'text-slate-400' : 'text-slate-700')
        }
      >
        {text}
      </div>
    </div>
  )
}

function ProgressLine({ revealed }) {
  return (
    <div className="text-[12px] text-slate-400 text-center mt-1.5">
      {revealed} of {REGIONS.length} revealed
    </div>
  )
}

function ClosingBox() {
  return (
    <div className="mt-1.5 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2 text-[11.5px] leading-snug">
      {CLOSING}
    </div>
  )
}

export default function BodyMapping() {
  const [mode, setMode] = useState('reveal') // reveal | select | done
  const [revealed, setRevealed] = useState([])
  const [selected, setSelected] = useState([])
  const [lastRevealed, setLastRevealed] = useState(null)

  const allRevealed = revealed.length === REGIONS.length

  function tapRegion(id) {
    if (mode === 'reveal') {
      setLastRevealed(id)
      setRevealed((r) => (r.includes(id) ? r : [...r, id]))
    } else if (mode === 'select') {
      setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
    }
  }

  function advance() {
    if (mode === 'reveal') setMode('select')
    else if (mode === 'select') setMode('done')
  }

  function restart() {
    setMode('reveal')
    setRevealed([])
    setSelected([])
    setLastRevealed(null)
  }

  const regionClass = (id) => {
    const on =
      (mode === 'reveal' && revealed.includes(id)) ||
      (mode !== 'reveal' && selected.includes(id))
    if (!on) return 'bm-region'
    return 'bm-region ' + (mode === 'reveal' ? 'is-active' : 'is-selected')
  }

  const regionProps = (id, label) => ({
    className: regionClass(id),
    role: 'button',
    tabIndex: mode === 'done' ? -1 : 0,
    'aria-label': label,
    'aria-pressed': mode === 'reveal' ? revealed.includes(id) : selected.includes(id),
    onClick: () => tapRegion(id),
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        tapRegion(id)
      }
    },
  })

  // ---- panel + instruction copy per mode ----
  let instruction = INSTRUCTIONS.reveal
  let panel = { muted: true, label: null, text: 'Tap a glowing area to learn what it does.' }

  if (mode === 'reveal' && lastRevealed) {
    const r = REGIONS.find((x) => x.id === lastRevealed)
    panel = { muted: false, label: r.label, text: r.text }
  } else if (mode === 'select') {
    instruction = INSTRUCTIONS.select
    panel =
      selected.length === 0
        ? { muted: true, label: null, text: 'Tap any reaction you’ve felt recently.' }
        : {
            muted: false,
            label: selected.length + ' selected',
            text: 'You can pick as many as fit.',
          }
  } else if (mode === 'done') {
    instruction = INSTRUCTIONS.done
    panel = {
      muted: false,
      label: 'You did it',
      text: 'Noticing where big feelings show up is the first step to feeling better.',
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 text-slate-700 px-4 py-3 overflow-hidden">
      {/* header */}
      <div className="flex-shrink-0">
        <div className="text-[10px] font-extrabold tracking-[0.16em] uppercase text-amber-700">
          Activity 1 · Body mapping
        </div>
        <h3 className="text-[17px] font-extrabold text-slate-800 leading-tight mt-0.5 mb-1.5">
          Where trauma shows up
        </h3>
        <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2 flex gap-2 items-start">
          <span
            className="flex-shrink-0 w-[22px] h-[22px] rounded-full mt-0.5"
            style={{
              background: 'radial-gradient(circle at 40% 35%, #FDE68A, #F59E0B)',
              boxShadow: '0 0 10px rgba(245,158,11,.5)',
            }}
            aria-hidden="true"
          />
          {/* All three instructions are stacked in one grid cell and the
              inactive ones are hidden, so the slot is always as tall as the
              longest of them. A fixed min-height can't do this: the three are
              different lengths and wrap to a different number of lines at every
              frame width, which made the header change height and the figure
              slide up and down on Continue / Done. */}
          <span className="grid text-[13px] leading-snug">
            {Object.entries(INSTRUCTIONS).map(([key, text]) => (
              <span
                key={key}
                className={
                  'col-start-1 row-start-1 ' +
                  (text === instruction ? '' : 'invisible')
                }
                aria-hidden={text === instruction ? undefined : 'true'}
              >
                {text}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Figure. Deliberately a FIXED share of the frame, not flex-1.
          It used to take "whatever room is left", which meant each region's
          copy length changed the leftover space and the body visibly grew and
          shrank from tap to tap (Josh, 2026-08-13 — worst between Lungs, two
          lines, and Head, seven). The figure is the anchor now; the copy block
          below absorbs the variance instead. A percentage rather than a pixel
          height so it still scales between the narrow demo embed and a real
          full-screen phone. */}
      {/* Figure. Takes every pixel the fixed header, copy block and CTA don't
          use, which is a constant because the copy block below reserves its
          worst case. min-h-0 is load-bearing: a column flex item defaults to
          min-height:auto, which clamps it up to the SVG's intrinsic aspect
          height and would let it push the rest of the layout around. */}
      <div className="flex-1 min-h-0 my-2 flex items-center justify-center">
        <svg
          viewBox="0 0 600 1000"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          role="group"
          aria-label="Body map with five tappable regions"
        >
          <style>{SVG_CSS}</style>
          <defs>
            <filter id="bmAmberGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" result="b" />
              <feColorMatrix
                in="b"
                type="matrix"
                values="0 0 0 0 0.96  0 0 0 0 0.62  0 0 0 0 0.04  0 0 0 0.75 0"
                result="g"
              />
              <feMerge>
                <feMergeNode in="g" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g id="bm-base">
            <path
              d="M320,150 C340,140 352,122 352,98 C352,46 330,32 300,32 C270,32 248,46 248,98 C248,122 260,140 280,150 L280,176 C280,198 266,206 246,216 C230,224 222,232 216,248 Q196,300 176,356 Q158,420 146,486 C142,508 140,528 150,538 C160,548 170,542 172,530 Q178,510 184,492 Q200,424 214,360 Q222,308 236,266 Q238,320 240,362 Q232,400 224,442 Q232,530 238,622 Q243,662 245,702 Q247,790 251,882 L237,916 C232,927 237,933 247,933 L263,933 C271,933 274,927 273,916 Q277,808 281,702 Q288,610 296,522 L300,514 L304,522 Q312,610 319,702 Q323,808 327,916 C326,927 329,933 337,933 L353,933 C363,933 368,927 363,916 L349,882 Q353,790 355,702 Q357,662 362,622 Q368,530 376,442 Q368,400 360,362 Q362,320 364,266 Q378,308 386,360 Q400,424 416,492 Q422,510 428,530 C430,542 440,548 450,538 C460,528 458,508 454,486 Q442,420 424,356 Q404,300 384,248 C378,232 370,224 354,216 C334,206 320,198 320,176 Z"
              fill="#334155"
              fillOpacity="0.045"
              stroke="#334155"
              strokeWidth="5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M282,182 Q300,192 318,182"
              fill="none"
              stroke="#334155"
              strokeOpacity="0.35"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>

          <g id="bm-regions">
            {/* whole body sits first so the smaller targets stack above it */}
            <g {...regionProps('body', 'Whole body: sweat, tension, shakiness')}>
              <path
                className="bm-target"
                d="M320,150 C340,140 352,122 352,98 C352,46 330,32 300,32 C270,32 248,46 248,98 C248,122 260,140 280,150 L280,176 C280,198 266,206 246,216 C230,224 222,232 216,248 Q196,300 176,356 Q158,420 146,486 C142,508 140,528 150,538 C160,548 170,542 172,530 Q178,510 184,492 Q200,424 214,360 Q222,308 236,266 Q238,320 240,362 Q232,400 224,442 Q232,530 238,622 Q243,662 245,702 Q247,790 251,882 L237,916 C232,927 237,933 247,933 L263,933 C271,933 274,927 273,916 Q277,808 281,702 Q288,610 296,522 L300,514 L304,522 Q312,610 319,702 Q323,808 327,916 C326,927 329,933 337,933 L353,933 C363,933 368,927 363,916 L349,882 Q353,790 355,702 Q357,662 362,622 Q368,530 376,442 Q368,400 360,362 Q362,320 364,266 Q378,308 386,360 Q400,424 416,492 Q422,510 428,530 C430,542 440,548 450,538 C460,528 458,508 454,486 Q442,420 424,356 Q404,300 384,248 C378,232 370,224 354,216 C334,206 320,198 320,176 Z"
              />
              <circle className="bm-target" cx="300" cy="672" r="44" />
              <g className="bm-icon" transform="translate(300,672) scale(1.15)">
                <path d="M-3,-20 L-15,2 L-3,2 L-7,20 L15,-4 L3,-4 L7,-20 Z" />
              </g>
              <g className="bm-check" transform="translate(334,706)">
                <circle r="14" fill="#B45309" />
                <path
                  d="M-6,0 L-1.5,5 L6.5,-5"
                  fill="none"
                  stroke="#FFFBEB"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>

            <g {...regionProps('head', 'Head: brain and thoughts')}>
              <circle className="bm-target" cx="300" cy="96" r="46" />
              <g className="bm-icon" transform="translate(300,96) scale(1.25)">
                <path d="M-1,-16 C-9,-19 -17,-13 -15,-5 C-20,0 -17,9 -9,11 C-6,17 4,18 8,13 C17,12 20,3 15,-3 C17,-12 8,-19 0,-15" />
                <path d="M0,-15 L0,13" />
                <path d="M-8,-6 L-2,-3" />
                <path d="M8,4 L1,6" />
              </g>
              <g className="bm-check" transform="translate(336,130)">
                <circle r="14" fill="#B45309" />
                <path
                  d="M-6,0 L-1.5,5 L6.5,-5"
                  fill="none"
                  stroke="#FFFBEB"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>

            <g {...regionProps('lungs', 'Lungs: breathing')}>
              <circle className="bm-target" cx="300" cy="240" r="42" />
              <g className="bm-icon" transform="translate(300,240) scale(1.1)">
                <path d="M0,-18 L0,-2" />
                <path d="M-1,-4 C-11,-6 -18,3 -16,13 C-15,19 -6,19 -4,12 C-1,4 -1,-1 -1,-4 Z" />
                <path d="M1,-4 C11,-6 18,3 16,13 C15,19 6,19 4,12 C1,4 1,-1 1,-4 Z" />
              </g>
              <g className="bm-check" transform="translate(332,272)">
                <circle r="14" fill="#B45309" />
                <path
                  d="M-6,0 L-1.5,5 L6.5,-5"
                  fill="none"
                  stroke="#FFFBEB"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>

            <g {...regionProps('heart', 'Heart: heartbeat')}>
              <circle className="bm-target" cx="258" cy="322" r="38" />
              <g className="bm-icon" transform="translate(258,322) scale(1.05)">
                <path d="M0,13 C-15,3 -19,-6 -13,-12 C-8,-17 -1,-15 0,-9 C1,-15 8,-17 13,-12 C19,-6 15,3 0,13 Z" />
              </g>
              <g className="bm-check" transform="translate(286,350)">
                <circle r="13" fill="#B45309" />
                <path
                  d="M-5.5,0 L-1.5,4.5 L6,-4.5"
                  fill="none"
                  stroke="#FFFBEB"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>

            <g {...regionProps('stomach', 'Stomach: gut feelings')}>
              <circle className="bm-target" cx="302" cy="418" r="40" />
              <g className="bm-icon" transform="translate(302,418) scale(1.1)">
                <path d="M-8,-17 C-6,-9 -8,-5 -11,-1 C-15,6 -12,15 -4,17 C5,19 13,12 13,2 C13,-8 5,-16 -5,-16" />
                <path d="M-8,-17 L-1,-19" />
              </g>
              <g className="bm-check" transform="translate(332,448)">
                <circle r="13" fill="#B45309" />
                <path
                  d="M-5.5,0 L-1.5,4.5 L6,-4.5"
                  fill="none"
                  stroke="#FFFBEB"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Copy block. Its height is set by an INVISIBLE worst-case spacer (the
          longest region text, plus the progress line, plus the closing) sharing
          one grid cell with the live copy, so the block is always exactly as
          tall as it could ever need to be and never changes size. That keeps
          the figure above it constant while letting the figure be flex-1 and
          take every pixel this block doesn't need. The live copy is bottom
          aligned in the cell so the text sits against the CTA rather than
          floating in the middle (Josh, 2026-08-13). */}
      <div className="flex-none grid">
        {/* Worst case is the longest panel plus the closing. The counter and
            the closing never co-occur, and the closing is the taller of the
            two, so reserving the closing covers both. */}
        <div className="col-start-1 row-start-1 invisible" aria-hidden="true">
          <PanelBox label="Head" text={LONGEST_REGION_TEXT} />
          <ClosingBox />
        </div>

        <div className="col-start-1 row-start-1 flex flex-col justify-end">
          <PanelBox label={panel.label} text={panel.text} muted={panel.muted} />

          {/* The counter is dropped once it reads 5 of 5: the closing line and
              the now-enabled Continue already say you're done, and the row it
              was taking is worth more to the figure. */}
          {mode === 'reveal' && !allRevealed && (
            <ProgressLine revealed={revealed.length} />
          )}

          {mode === 'reveal' && allRevealed && <ClosingBox />}
        </div>
      </div>

      {/* CTA, pinned below the copy block so it is always reachable. Same
          invisible-spacer trick as the copy block: the button is absent for the
          first four reveals and the two button styles differ in height, and
          without a reserved slot that difference lands on the flex-1 figure and
          resizes the body the moment Continue appears. */}
      <div className="flex-none grid">
        <div className="col-start-1 row-start-1 invisible" aria-hidden="true">
          <div className={CTA_CLASS}>Continue</div>
        </div>

        <div className="col-start-1 row-start-1 flex flex-col justify-end">
          {((mode === 'reveal' && allRevealed) || mode === 'select') && (
            <button type="button" onClick={advance} className={CTA_CLASS}>
              {mode === 'reveal' ? 'Continue' : 'Done'}
            </button>
          )}

          {mode === 'done' && (
            <button
              type="button"
              onClick={restart}
              className="w-full mt-2.5 py-2 text-[13px] font-semibold text-amber-700 hover:text-amber-900 underline"
            >
              Start over
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
