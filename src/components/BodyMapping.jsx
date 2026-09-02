// Body Mapping (GAINS Activity 1) — Draft 27, revised Draft 32.
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

// Copy revised 2026-08-19 (Draft 32) — Stephanie's final wording, all five
// regions. Body overtook Head as the longest text with this revision (254 vs
// 223 chars), so the worst-case spacer below now measures off Body.
const REGIONS = [
  {
    id: 'lungs',
    label: 'Lungs',
    text: 'We start breathing faster, to help our body take in more oxygen which prepares your muscles to respond to a danger or threat',
  },
  {
    id: 'head',
    label: 'Head',
    text: 'Thoughts begin to race through our heads to allow us to make quick decisions, but this also makes it hard to think clearly, can cause us to feel dizzy, and can even make us feel detached or like things around us aren’t real',
  },
  {
    id: 'heart',
    label: 'Heart',
    text: 'Our hearts start beating faster to pump blood and oxygen to all our muscles, so they are ready to react',
  },
  {
    id: 'stomach',
    label: 'Stomach',
    text: 'Our stomach might feel upset or we might feel nauseous because blood is moving away from our stomach and into our arms and legs because those muscles may need it more-to run away or fight',
  },
  {
    id: 'body',
    label: 'Body',
    text: 'Our body heats up, leading to more sweating. Our muscles get tense, and we might feel shaky or tingly. Our arms and legs can also start to feel heavy. Each of these reactions is because our body is using a LOT of energy at once to be able to act quickly.',
  },
]

// The tallest the copy panel can ever be, and which region that is — found
// dynamically rather than hardcoded, because the "worst case" region isn't
// stable across copy revisions (Head was longest pre-Draft-32; Body is now).
const LONGEST_REGION = REGIONS.reduce((a, b) =>
  b.text.length > a.text.length ? b : a
)

const INSTRUCTIONS = {
  reveal: 'Click to reveal different areas of the body that react during and after a trauma.',
  select: 'Click on each of these reactions you have had recently.',
  done: 'Nice noticing.',
}

const CLOSING =
  'Each of these things help us respond to danger, but these responses can stick around even after the danger has passed or can pop up if something reminds us of the danger or trauma.'

// Scoped so the region styles can't collide with anything else on the page.
// Ported from the redrawn asset (Draft 32, 2026-08-19), which added the idle
// pulse/glow so each un-tapped region visibly invites a tap (Ginny's ask:
// "is it possible for these areas to enlarge or pulse to show action").
// Selectors target `.bm-icon` itself, not `.bm-icon path` — the source art's
// icon paths carry no fill/stroke of their own and inherit from their parent
// `<g class="bm-icon">`, so styling the child paths directly would do nothing.
const SVG_CSS = `
.bm-region { cursor: pointer; -webkit-tap-highlight-color: transparent; }
.bm-region .bm-target {
  fill: #CBD5E1; fill-opacity: .08;
  stroke: #CBD5E1; stroke-opacity: .4; stroke-width: 1.6; stroke-dasharray: 5 5;
  transform-box: fill-box; transform-origin: center;
  transition: fill .3s ease, fill-opacity .3s ease, stroke .3s ease,
              stroke-opacity .3s ease, stroke-width .3s ease;
  animation: bmIdlePulse 2.6s ease-in-out infinite;
}
.bm-region .bm-icon {
  fill: none; stroke: #CBD5E1; stroke-opacity: .65; stroke-width: 3.2;
  stroke-linecap: round; stroke-linejoin: round;
  transition: stroke .3s ease, stroke-opacity .3s ease, stroke-width .3s ease;
  animation: bmIdleIcon 2.6s ease-in-out infinite;
}
.bm-region .bm-check { opacity: 0; transition: opacity .25s ease; }

/* Staggered so the five idle pulses don't all beat in lockstep. */
#bm-region-head    .bm-target, #bm-region-head    .bm-icon { animation-delay: 0s; }
#bm-region-lungs   .bm-target, #bm-region-lungs   .bm-icon { animation-delay: .35s; }
#bm-region-heart   .bm-target, #bm-region-heart   .bm-icon { animation-delay: .7s; }
#bm-region-stomach .bm-target, #bm-region-stomach .bm-icon { animation-delay: 1.05s; }
#bm-region-body    .bm-target, #bm-region-body    .bm-icon { animation-delay: 1.4s; }

@keyframes bmIdlePulse {
  0%, 100% { transform: scale(1);    stroke-opacity: .32; }
  50%      { transform: scale(1.07); stroke-opacity: .6;  }
}
@keyframes bmIdleIcon {
  0%, 100% { stroke-opacity: .5; }
  50%      { stroke-opacity: .8; }
}

.bm-region:hover .bm-target { fill-opacity: .11; stroke-opacity: .55; }
.bm-region:hover .bm-icon { stroke-opacity: .85; }
.bm-region:focus { outline: none; }
.bm-region:focus-visible .bm-target { stroke-opacity: .9; stroke-width: 2.4; }

.bm-region.is-active .bm-target {
  fill: #F59E0B; fill-opacity: .22;
  stroke: #F59E0B; stroke-opacity: .95; stroke-width: 2.6; stroke-dasharray: none;
  filter: url(#bmAmberGlow);
  animation: none; transform: scale(1);
}
.bm-region.is-active .bm-icon { stroke: #B45309; stroke-opacity: 1; stroke-width: 3.6; animation: none; }

.bm-region.is-selected .bm-target {
  fill: #F59E0B; fill-opacity: .4;
  stroke: #B45309; stroke-opacity: 1; stroke-width: 3; stroke-dasharray: none;
  animation: none; transform: scale(1);
}
.bm-region.is-selected .bm-icon { stroke: #78350F; stroke-opacity: 1; stroke-width: 3.6; animation: none; }
.bm-region.is-selected .bm-check { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .bm-region .bm-target, .bm-region .bm-icon { animation: none; }
}
`

// Redrawn torso-focused asset (Draft 32, 2026-08-19): source viewBox is
// 0 0 700 780. Measured via getBBox() in the browser (not guessed), the drawn
// content (base outline + all five regions) occupies x 116..561, y 44..711.
// The crop below pads that out asymmetrically rather than centering on it,
// because the padding need is asymmetric: the Head region's glow filter
// extends ~60% of its own bounding box beyond its edge when active, and Head
// sits close to the top (its own top edge is at y=68) while the Body/hand
// region sits close to the left (its own left edge is at x=116) — so top and
// left need the most slack, not a uniform margin.
const VIEW_BOX = '56 0 545 760'

// Shared by the live CTA and by the invisible spacer that reserves its slot.
// Draft 50: restyled to the Shadowmend amber pill (chrome only -- layout
// classes are untouched). Tailwind's arbitrary-value syntax
// (`bg-[var(--x)]`) resolves CSS custom properties directly, so the hover
// state still works without needing inline styles/JS hover tracking.
const CTA_CLASS =
  'w-full mt-2 py-2.5 rounded-full bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] text-[var(--text-on-warm)] text-[15px] font-extrabold text-center transition-colors'

// The three pieces of the copy block. Factored out because the block renders
// them twice: once invisibly at their worst case to reserve height, once live.
// Both copies must stay identical or the reservation drifts.
function PanelBox({ label, text, muted }) {
  return (
    <div
      className="rounded-2xl px-3.5 py-2.5"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)' }}
    >
      {label && (
        <div className="font-extrabold text-[13px] mb-0.5" style={{ color: 'var(--text-warm)' }}>
          {label}
        </div>
      )}
      <div
        className="text-[12.5px] leading-snug"
        style={{ color: muted ? 'var(--text-faint)' : 'var(--text-body)' }}
      >
        {text}
      </div>
    </div>
  )
}

function ProgressLine({ revealed }) {
  return (
    <div className="text-[12px] text-center mt-1.5" style={{ color: 'var(--text-faint)' }}>
      {revealed} of {REGIONS.length} revealed
    </div>
  )
}

// Draft 46 (Holly/Ginny, 2026-08-24): the write-in "another area" option for
// Part 2. Collapsed to a dashed prompt button until tapped, then becomes a
// text input — same reveal-on-tap shape as ElevatorPitch's "Write your own".
function OtherAreaField({ value, onChange }) {
  if (value === null) {
    return (
      <button
        type="button"
        onClick={() => onChange('')}
        className="w-full text-left mt-1.5 px-3.5 py-2.5 rounded-2xl text-[12px] leading-snug border border-dashed hover:border-[var(--border-warm)] hover:text-[var(--text-warm)] transition-colors"
        style={{ borderColor: 'var(--border-soft)', color: 'var(--text-faint)' }}
      >
        Is there another area where you feel a trauma reaction in your body? If so, write it in the box below.
      </button>
    )
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g., sweating, clenching jaw"
      autoFocus
      className="w-full mt-1.5 text-[12.5px] px-3.5 py-2.5 rounded-2xl focus:outline-none"
      style={{ background: 'var(--action-quiet)', border: '1px solid var(--border-warm)', color: 'var(--text-body)' }}
    />
  )
}

function ClosingBox() {
  return (
    <div
      className="mt-1.5 rounded-2xl px-3 py-2 text-[11.5px] leading-snug"
      style={{ background: 'rgba(253,230,138,.10)', border: '1px solid var(--border-warm)', color: 'var(--text-body)' }}
    >
      {CLOSING}
    </div>
  )
}

export default function BodyMapping() {
  const [mode, setMode] = useState('reveal') // reveal | select | done
  const [revealed, setRevealed] = useState([])
  const [selected, setSelected] = useState([])
  const [lastRevealed, setLastRevealed] = useState(null)
  // Whether the panel is currently given over to the closing line.
  const [showClosing, setShowClosing] = useState(false)
  // Draft 46 (Holly, 2026-08-24): the write-in "another area" option, added
  // to Part 2 only. null = not yet engaged (the prompt button shows);
  // '' or text = engaged (the input shows), and any non-empty value counts
  // toward the "N selected" total alongside the tapped regions.
  const [customArea, setCustomArea] = useState(null)

  const allRevealed = revealed.length === REGIONS.length

  function tapRegion(id) {
    if (mode === 'reveal') {
      setLastRevealed(id)
      if (revealed.includes(id)) {
        // Re-tapping an already-revealed region (most often the whole-body
        // one, since it's drawn underneath and left for last) always shows
        // that region's own description, even after the closing has taken
        // over the panel.
        setShowClosing(false)
        return
      }
      setRevealed((r) => [...r, id])
    } else if (mode === 'select') {
      setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
    }
  }

  function advance() {
    if (mode === 'reveal') setMode('select')
    else if (mode === 'select') setMode('done')
  }

  // Draft 46 (Holly, 2026-08-24): the 5th reveal used to auto-flip to the
  // closing line on a timer, which meant a well-timed Continue tap right
  // after the 5th reveal could skip past that region's own copy without ever
  // showing it. Fixed by making the flip an explicit tap: the SAME Continue
  // button first reveals the closing line (replacing the 5th region's own
  // panel), then on a second tap advances to Part 2, exactly like every
  // other mode transition in this activity.
  function ctaClick() {
    if (mode === 'reveal' && allRevealed && !showClosing) {
      setShowClosing(true)
      return
    }
    advance()
  }

  function restart() {
    setMode('reveal')
    setRevealed([])
    setSelected([])
    setLastRevealed(null)
    setShowClosing(false)
    setCustomArea(null)
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
    const selectedCount = selected.length + (customArea ? 1 : 0)
    panel =
      selectedCount === 0
        ? { muted: true, label: null, text: 'Tap any reaction you’ve felt recently.' }
        : {
            muted: false,
            label: selectedCount + ' selected',
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
    <div
      className="flex flex-col h-full w-full px-4 py-3 overflow-hidden"
      style={{ background: 'var(--sky-abyss)', color: 'var(--text-body)', fontFamily: 'var(--font-core)' }}
    >
      {/* header */}
      <div className="flex-shrink-0">
        <div className="text-[10px] font-extrabold tracking-[0.16em] uppercase" style={{ color: 'var(--text-warm)' }}>
          Activity 1 · Body mapping
        </div>
        <h3 className="text-[17px] font-extrabold leading-tight mt-0.5 mb-1.5" style={{ color: 'var(--text-bright)' }}>
          Where trauma shows up
        </h3>
        <div
          className="rounded-2xl px-3 py-2 flex gap-2 items-start"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)' }}
        >
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

      {/* Figure. Takes every pixel the fixed header, copy block and CTA don't
          use, which is a constant because those all reserve their worst case.
          It used to be the other way round: the figure took "whatever room is
          left", so each region's copy length changed the leftover space and the
          body visibly grew and shrank from tap to tap (Josh, 2026-08-13).
          min-h-0 is load-bearing: a column flex item defaults to
          min-height:auto, which clamps it up to the SVG's intrinsic aspect
          height and would let it push the rest of the layout around. */}
      <div className="flex-1 min-h-0 my-2 flex items-center justify-center">
        <svg
          viewBox={VIEW_BOX}
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

          {/* Redrawn torso-focused figure (Draft 32, 2026-08-19): head, torso
              and both arms/hands, real hands rather than a full-body outline.
              Replaces the old full-figure silhouette per the team's request
              to bring heart/lungs closer to anatomically correct spots and
              move the body/lightning-bolt icon off its old spot (it's now on
              the hand). Ported 1:1 from
              Gains for Teens/Activities/body-map.svg; only ids/classNames
              were namespaced (bm- prefix) and attributes converted to JSX. */}
          <g id="bm-base" fill="none" stroke="#CBD5E1" strokeOpacity="0.7" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M350,44 C394,44 420,79 420,124 C420,152 413,171 404,186 C395,202 378,216 350,216 C322,216 305,202 296,186 C287,171 280,152 280,124 C280,79 306,44 350,44 Z" fill="#CBD5E1" fillOpacity="0.08" />
            <path d="M281,120 C272,118 268,126 271,136 C274,146 281,148 284,145" strokeWidth="3.4" />
            <path d="M419,120 C428,118 432,126 429,136 C426,146 419,148 416,145" strokeWidth="3.4" />

            <path d="M322,198 C318,228 314,246 304,258 C266,268 232,280 214,302 C222,324 232,338 244,350 C250,394 254,432 256,472 C258,508 252,542 248,574 C244,608 246,642 248,700 L452,700 C454,642 456,608 452,574 C448,542 442,508 444,472 C446,432 450,394 456,350 C468,338 478,324 486,302 C468,280 434,268 396,258 C386,246 382,228 378,198 Z" fill="#CBD5E1" fillOpacity="0.08" />

            <path d="M214,302 C192,314 180,340 176,372 C170,412 165,452 160,492 C155,530 150,568 146,604 C143,626 138,646 139,664 C140,684 146,700 154,708 C159,713 167,711 169,703 C171,694 169,684 170,674 C172,660 178,650 182,638 C186,620 190,600 194,578 C200,540 208,498 214,456 C220,414 228,376 244,350 C232,338 222,324 214,302 Z" fill="#CBD5E1" fillOpacity="0.08" />
            <path d="M141,652 C152,644 164,640 176,642" strokeWidth="3" />
            <path d="M147,703 C150,690 151,678 150,666" strokeWidth="2.8" />
            <path d="M158,709 C161,696 162,684 161,672" strokeWidth="2.8" />
            <path d="M170,674 C175,668 179,658 180,648" strokeWidth="2.8" />

            <path d="M486,302 C508,314 520,340 524,372 C530,412 535,452 540,492 C545,530 550,568 554,604 C557,626 562,646 561,664 C560,684 554,700 546,708 C541,713 533,711 531,703 C529,694 531,684 530,674 C528,660 522,650 518,638 C514,620 510,600 506,578 C500,540 492,498 486,456 C480,414 472,376 456,350 C468,338 478,324 486,302 Z" fill="#CBD5E1" fillOpacity="0.08" />
            <path d="M559,652 C548,644 536,640 524,642" strokeWidth="3" />
            <path d="M553,703 C550,690 549,678 550,666" strokeWidth="2.8" />
            <path d="M542,709 C539,696 538,684 539,672" strokeWidth="2.8" />
            <path d="M530,674 C525,668 521,658 520,648" strokeWidth="2.8" />

            <g strokeOpacity="0.32" strokeWidth="3.2">
              <path d="M308,262 C330,278 370,278 392,262" />
              <path d="M286,300 C312,344 388,344 414,300" />
              <path d="M350,286 L350,352" />
              <path d="M288,404 C316,446 384,446 412,404" />
              <path d="M350,432 L350,556" />
              <path d="M338,556 C346,562 354,562 362,556" />
              <path d="M262,644 C300,656 400,656 438,644" />
            </g>
          </g>

          <g id="bm-regions">
            <g {...regionProps('head', 'Head: racing thoughts, dizziness, feeling detached')} id="bm-region-head">
              <circle className="bm-target" cx="350" cy="122" r="54" />
              <g className="bm-icon" transform="translate(350,122) scale(1.3)">
                <path d="M-1,-16 C-9,-19 -17,-13 -15,-5 C-20,0 -17,9 -9,11 C-6,17 4,18 8,13 C17,12 20,3 15,-3 C17,-12 8,-19 0,-15" />
                <path d="M0,-15 L0,13" />
                <path d="M-8,-6 L-2,-3" />
                <path d="M8,4 L1,6" />
              </g>
              <g className="bm-check" transform="translate(390,162)">
                <circle r="14" fill="#B45309" />
                <path d="M-6,0 L-1.5,5 L6.5,-5" fill="none" stroke="#FFFBEB" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>

            <g {...regionProps('lungs', 'Lungs: breathing')} id="bm-region-lungs">
              <circle className="bm-target" cx="352" cy="296" r="48" />
              <g className="bm-icon" transform="translate(352,296) scale(1.25)">
                <path d="M0,-18 L0,-2" />
                <path d="M-1,-4 C-11,-6 -18,3 -16,13 C-15,19 -6,19 -4,12 C-1,4 -1,-1 -1,-4 Z" />
                <path d="M1,-4 C11,-6 18,3 16,13 C15,19 6,19 4,12 C1,4 1,-1 1,-4 Z" />
              </g>
              <g className="bm-check" transform="translate(387,331)">
                <circle r="14" fill="#B45309" />
                <path d="M-6,0 L-1.5,5 L6.5,-5" fill="none" stroke="#FFFBEB" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>

            {/* Draft 46 (Holly, 2026-08-24): the heart reads more anatomically
                correct on the body's own left side, which is the viewer's
                RIGHT (a front-facing figure mirrors left/right) -- it was on
                the viewer's left (cx 294, left of the torso's x=350
                centerline). Mirrored across that centerline (350 + (350-294)
                = 406); the check badge keeps the same +29/+29 offset used by
                every other region's badge (a uniform down-right convention,
                not itself anatomically mirrored). */}
            <g {...regionProps('heart', 'Heart: heartbeat')} id="bm-region-heart">
              <circle className="bm-target" cx="406" cy="380" r="40" />
              <g className="bm-icon" transform="translate(406,380) scale(1.15)">
                <path d="M0,13 C-15,3 -19,-6 -13,-12 C-8,-17 -1,-15 0,-9 C1,-15 8,-17 13,-12 C19,-6 15,3 0,13 Z" />
              </g>
              <g className="bm-check" transform="translate(435,409)">
                <circle r="13" fill="#B45309" />
                <path d="M-5.5,0 L-1.5,4.5 L6,-4.5" fill="none" stroke="#FFFBEB" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>

            {/* Draft 46 (Holly): lowered ~30 units so it isn't floating in
                empty space beneath the heart/lungs cluster. Draft 56
                (Holly, 2026-08-31): nudged another ~30 units lower so it
                reads as sitting a bit lower on the torso; still clear of
                the body/hand target below (cy 616). */}
            <g {...regionProps('stomach', 'Stomach: gut feelings')} id="bm-region-stomach">
              <circle className="bm-target" cx="352" cy="538" r="46" />
              <g className="bm-icon" transform="translate(352,538) scale(1.25)">
                <path d="M-8,-17 C-6,-9 -8,-5 -11,-1 C-15,6 -12,15 -4,17 C5,19 13,12 13,2 C13,-8 5,-16 -5,-16" />
                <path d="M-8,-17 L-1,-19" />
              </g>
              <g className="bm-check" transform="translate(385,571)">
                <circle r="14" fill="#B45309" />
                <path d="M-6,0 L-1.5,5 L6.5,-5" fill="none" stroke="#FFFBEB" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>

            <g {...regionProps('body', 'Body: sweat, tension, shaky or heavy limbs')} id="bm-region-body">
              <circle className="bm-target" cx="162" cy="616" r="46" />
              <g className="bm-icon" transform="translate(162,616) scale(1.3)">
                <path d="M-3,-20 L-15,2 L-3,2 L-7,20 L15,-4 L3,-4 L7,-20 Z" />
              </g>
              <g className="bm-check" transform="translate(195,649)">
                <circle r="14" fill="#B45309" />
                <path d="M-6,0 L-1.5,5 L6.5,-5" fill="none" stroke="#FFFBEB" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
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
        {/* Worst case is the longest region panel plus the counter, plus the
            Part-2 write-in field (it never appears alongside the counter, but
            reserving both keeps this one spacer correct for every mode
            without needing a second, mode-specific spacer). The closing
            REPLACES the region panel rather than stacking under it, and it is
            shorter than the longest panel, so this spacer covers every
            state. */}
        <div className="col-start-1 row-start-1 invisible" aria-hidden="true">
          <PanelBox label={LONGEST_REGION.label} text={LONGEST_REGION.text} />
          <ProgressLine revealed={REGIONS.length} />
          <OtherAreaField value="" onChange={() => {}} />
        </div>

        <div className="col-start-1 row-start-1 flex flex-col justify-end">
          {/* Once all five are revealed, the panel gives itself over to the
              closing line alone once Continue is tapped a first time (Draft
              46): it is the payoff, and keeping the last region's description
              on screen under it was the single biggest block of text in the
              activity (Josh, 2026-08-13). Tapping any region afterwards
              brings its description back, so nothing is stranded. The
              counter stops once it would read 5 of 5, since the closing and
              the enabled Continue already say you're done. */}
          {mode === 'reveal' && allRevealed && showClosing ? (
            <ClosingBox />
          ) : (
            <>
              <PanelBox
                label={panel.label}
                text={panel.text}
                muted={panel.muted}
              />
              {mode === 'reveal' && !allRevealed && (
                <ProgressLine revealed={revealed.length} />
              )}
              {mode === 'select' && (
                <OtherAreaField value={customArea} onChange={setCustomArea} />
              )}
            </>
          )}
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
            <button type="button" onClick={ctaClick} className={CTA_CLASS}>
              {mode === 'reveal' ? 'Continue' : 'Done'}
            </button>
          )}

          {mode === 'done' && (
            <button
              type="button"
              onClick={restart}
              className="w-full mt-2.5 py-2 text-[13px] font-semibold underline text-[var(--text-warm)] hover:text-[var(--brand-flame)] transition-colors"
            >
              Start over
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
