// Mindfulness "Mindful Place" (GAINS Zone 4 activity) — Draft 33, reworked
// Drafts 34-35, 37-39, rebuilt Draft 57. On-screen copy calls it "Mindful
// Place" now; the internal filename/import name and the `review-mindfulness`
// feedback tag are unchanged on purpose (Draft 57 renamed user-facing text
// only, not internal slugs).
//
// Spark leads a guided calm-place visualization that does double duty:
// grounding (the 3-3-3 technique: see / hear / breathe) AND calm-place
// visualization. Built from the staged assets in
// `Gains for Teens/long-light-site/{art,audio}/mindfulness/` (mirrored into
// public/long-light/ for serving): a dusk pond background, four layered
// overlay SVGs (rain, lightning, fireflies, reeds) with their own idle
// animations in motion.css, a painterly frog PNG, and one looping ambient
// soundscape plus Spark voice-F narration.
//
// Flow, guided and no-fail:
//   intro   — "Begin" gesture (required for audio autoplay).
//   arrive  — Spark settles the player into the scene.
//   see     — pick any 3 of 6 predefined option chips (frog, lightning, pond,
//             fireflies, trees, clouds).
//   hear    — pick any 3 of 5 predefined sound chips (rain, thunder, frogs,
//             crickets, music) -- selection only, see §Audio below.
//   breathe — a guided box-breath, synced to Spark's count in mind-04, for 2
//             cycles, paced by concentric rings + an on-screen count.
//   close   — Oxygen Mask earned; can practice the whole exercise again once
//             to "level up" the mask (a reinforcing message only -- no
//             mechanical difference in the mask itself), then ends cleanly.
//
// Draft 33 had SEE/HEAR as scene-tapping (invisible hotspots over the art).
// Two problems surfaced in testing: the hotspots (and the bottom panel bar
// they shared space with) covered too much of the scene, including the frog,
// and HEAR effectively had only one reliably tappable option. Draft 34 drops
// scene-tapping for both steps in favor of predefined chips in a bar at the
// TOP of the frame (over the open sky), leaving the scene — frog included —
// fully visible below at all times. Selecting a chip whose element has a
// matching animated layer (frog, lightning, fireflies) briefly pulses that
// layer as a non-blocking nicety; pond/trees/clouds live in the static
// background image, so they have no layer to pulse.
//
// --- Draft 57 (2026-09-02): audio + breathing rebuild ---
// Audio. The old three-track ambient mix (music/rain/frog, each with its own
// volume dance for the Hear step) is gone, replaced by ONE looping
// soundscape bed (already contains all the Hear sounds) plus short Spark
// narration clips that auto-play once per step, ducking the bed while they
// speak (see NARRATION_CLIPS / the stepKey effect below). Hear's chips are
// now selection-only against that one bed -- there's no separate per-sound
// file to play anymore, so tapping a chip just marks it found (and, for
// Thunder, still pulses the lightning layer as a visual nicety).
//
// Breathing. The box-breath is now paced by mind-04-breathe.mp3's own
// spoken count rather than a plain 1-second ticker: LEAD_IN/PHASE_DUR/
// AGAIN_BRIDGE/CYCLE2_START below are that clip's exact timing structure
// (Spark's script), and the visual phase is derived every ~150ms from the
// audio element's real `currentTime` (see breathePhaseAt) so the rings,
// count and frog stay locked to what's actually playing instead of drifting
// on their own clock. The single glow blob is replaced by four concentric
// rings that expand/brighten together on the inhale and contract on the
// exhale, plus a focus vignette that darkens the scene's edges only while
// breathing is active. The frog is now a plain painterly PNG (not an SVG
// with its own #frog-body idle loop) planted bottom-left; a wrapping element
// gets the same box-breath transform inline while breathing is active, with
// a bottom transform-origin so its feet stay planted.
//
// Practice loop + the "done" bug. The old code had two overlapping repeat
// mechanisms (a breath-only "practice again" capped at 2, and a separate
// "do it again" that quietly looped back through `restart()` to the very
// intro screen -- Ginny's reported bug). Draft 57 replaces both with one
// loop: on the FIRST full completion (see→hear→breathe), Spark's mind-06
// invites practice with "Practice again" / "Move on"; "Practice again" reruns
// the WHOLE exercise (not just the breath). On the SECOND completion,
// mind-07's level-up message shows with a single "I'm all set" button. There
// is no path back to `mode: 'intro'` from anywhere in the close screen --
// `finish()` only sets a `finished` flag that hides the button row and
// leaves the last message on screen, which is what "ends the activity
// cleanly" means here.
//
// Draft 37 had brought all three (now-retired) tracks up to one shared,
// clearly audible ambient level for Hear's duration and briefly nudged a
// tapped chip's own track louder; Draft 39 found that nudge read as a second
// copy of the same sound starting on top of the ambient bed and dropped it.
// Both are moot now that Hear has nothing to play per-chip at all.

import { useEffect, useRef, useState } from 'react'

const ART = '/long-light/art/mindfulness'
const AUDIO = '/long-light/audio/mindfulness'

const LAYER_URLS = {
  rain: `${ART}/layer-rain.svg`,
  lightning: `${ART}/layer-lightning.svg`,
  fireflies: `${ART}/layer-fireflies.svg`,
  reeds: `${ART}/layer-reeds.svg`,
}

// Idle-loop keyframes for the four overlay layers, copied verbatim from the
// staged motion.css (Draft 33's asset). Per-element durations/delays live in
// each SVG's own style attributes; this only supplies the keyframes. The
// frog's own idle loop used to live here too (#frog-body/om-breathe) -- it's
// a plain PNG now, so its idle motion is CSS on a wrapper div instead (see
// .om-frog-idle in SCENE_CSS).
const MOTION_CSS = `
.drop{animation-name:om-rain;animation-timing-function:linear;animation-iteration-count:infinite}
@keyframes om-rain{from{transform:translate(0,-200px)}to{transform:translate(-56px,420px)}}

#layer-lightning{animation:om-flash 6s linear infinite}
@keyframes om-flash{
  0%,50%{opacity:0}
  53%{opacity:.9} 57%{opacity:.25} 60%{opacity:1}
  65%{opacity:.35} 68%{opacity:.75} 80%{opacity:.05}
  88%,100%{opacity:0}
}

.reed{animation-name:om-sway;animation-timing-function:ease-in-out;animation-iteration-count:infinite;will-change:transform}
@keyframes om-sway{0%,100%{transform:rotate(-1.6deg)}50%{transform:rotate(2deg)}}

.fly{animation-name:om-drift-a;animation-timing-function:ease-in-out;animation-iteration-count:infinite;will-change:transform}
.fly--b{animation-name:om-drift-b}
@keyframes om-drift-a{
  0%,100%{transform:translate(0,0)}
  20%{transform:translate(46px,-34px)}
  45%{transform:translate(18px,-72px)}
  70%{transform:translate(-40px,-46px)}
  85%{transform:translate(-22px,-12px)}
}
@keyframes om-drift-b{
  0%,100%{transform:translate(0,0)}
  22%{transform:translate(-52px,-26px)}
  48%{transform:translate(-14px,-66px)}
  72%{transform:translate(38px,-40px)}
  88%{transform:translate(20px,-10px)}
}
.fly-core,.fly-glow{animation-name:om-blink;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
@keyframes om-blink{0%{opacity:.1}18%{opacity:1}42%{opacity:.35}60%{opacity:1}85%{opacity:.05}100%{opacity:.1}}

@media (prefers-reduced-motion:reduce){
  .drop,#layer-lightning,.reed,.fly,.fly-core,.fly-glow{animation:none}
}
`

// Component-specific styling: makes each injected layer fill the frame
// (xMidYMid slice, forced below at fetch time, keeps it aligned with the
// object-cover background rather than letterboxing at a different aspect
// ratio), the chip-selection "pulse" nicety, the breathing rings + focus
// vignette (Draft 57), and the frog's idle/breathing motion.
const SCENE_CSS = `
.om-layer, .om-layer svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.om-pulse { animation: omPulseFlash .9s ease-out; }
@keyframes omPulseFlash { 0% { filter: brightness(1); } 30% { filter: brightness(1.85); } 100% { filter: brightness(1); } }
@media (prefers-reduced-motion: reduce) { .om-pulse { animation: none; } }

/* Draft 57: four concentric rings replace the old single glow blob for the
   breathe step. They share one phase-driven scale/opacity/brightness on the
   group wrapper -- transforms on a parent scale its centered children
   together, so the four rings expand/contract as one nested set without
   individually-tracked math. Draft 58: thicker strokes, a bigger box-shadow
   glow, and a wider min/max scale range (see RING_TARGETS) so the swell
   reads as obvious motion rather than static circles. */
.om-ring-group { position: absolute; inset: 0; pointer-events: none; transform-origin: 50% 50%; transition: transform 5s ease-in-out, opacity 5s ease-in-out, filter 5s ease-in-out; }
.om-ring-group.om-shimmer { animation: omShimmer 1.1s ease-in-out infinite; }
@keyframes omShimmer { 0%, 100% { filter: brightness(1.1); } 50% { filter: brightness(1.4); } }
.om-ring { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); aspect-ratio: 1 / 1; border-radius: 9999px; border-style: solid; border-color: rgba(253,230,138,.9); box-shadow: 0 0 32px rgba(245,158,11,.45); }
.om-ring--1 { width: 24%; border-width: 5px; }
.om-ring--2 { width: 40%; border-width: 4px; opacity: .85; }
.om-ring--3 { width: 56%; border-width: 3px; opacity: .62; }
.om-ring--4 { width: 72%; border-width: 2.5px; opacity: .38; }

/* Draft 58: deepened from Draft 57's original (too subtle against the busy
   rain/fireflies scene) -- darker at the edge and starting closer in, so the
   rings/count clearly pop without blacking out the pond entirely. Still a
   soft radial darken, not a hard frame. */
.om-vignette { position: absolute; inset: 0; background: radial-gradient(circle at 50% 46%, rgba(4,10,20,0) 16%, rgba(4,10,20,.5) 55%, rgba(4,10,20,.82) 100%); opacity: 0; transition: opacity 1s ease; pointer-events: none; }
.om-vignette.is-active { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .om-ring-group { transition: none; }
  .om-ring-group.om-shimmer { animation: none; }
  .om-vignette { transition: none; }
}

/* Draft 57: the frog's default idle motion, now CSS on a wrapper div rather
   than the old SVG's #frog-body keyframe. Swapped out for an inline
   transform driven by the same box-breath cadence as the rings while the
   breathe step is active (see the frogSwellRef effect below) -- the wrapper
   simply drops this class for that stretch so the two never fight. */
.om-frog-idle { animation: omFrogIdle 4.6s ease-in-out infinite; }
@keyframes omFrogIdle {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  50% { transform: translateY(-3px) scale(1.01, 1.02); }
}
@media (prefers-reduced-motion: reduce) { .om-frog-idle { animation: none; } }
`

// SEE step: six predefined options, any three unlock Continue. `glowLayer`
// names the `.om-layer[data-layer]` to briefly pulse on selection; pond,
// trees and clouds live only in the static background image, so they have
// none.
const SEE_ITEMS = [
  { id: 'frog', label: 'Frog', affirm: 'A little frog, resting on its lily pad.', glowLayer: 'frog' },
  { id: 'lightning', label: 'Lightning', affirm: 'A soft flash of light, far off in the sky.', glowLayer: 'lightning' },
  { id: 'pond', label: 'Pond', affirm: 'The still, calm water of the pond.' },
  { id: 'fireflies', label: 'Fireflies', affirm: 'Fireflies, drifting and glowing.', glowLayer: 'fireflies' },
  { id: 'trees', label: 'Trees', affirm: 'Trees standing quietly at the water’s edge.' },
  { id: 'clouds', label: 'Clouds', affirm: 'Clouds drifting slowly overhead.' },
]

// HEAR step: five predefined sound options, any three unlock Continue.
// Draft 57: selection only -- the one ambient soundscape already contains
// all five, so tapping a chip just marks it "found," nothing plays or
// changes volume. Thunder still pulses the lightning layer (its `glowLayer`)
// so it reads as its own distinct element even though it shares Rain's
// place in the mix.
const HEAR_ITEMS = [
  { id: 'rain', label: 'Rain', affirm: 'The rain, tapping softly.' },
  { id: 'thunder', label: 'Thunder', affirm: 'A low rumble of distant thunder.', glowLayer: 'lightning' },
  { id: 'frogs', label: 'Frogs', affirm: 'Frogs and the brook, murmuring together.' },
  { id: 'crickets', label: 'Crickets', affirm: 'Crickets, chirping steadily in the grass.' },
  { id: 'music', label: 'Music', affirm: 'A quiet melody, drifting through the air.' },
]

const PULSE_MS = 900

// Draft 57: one quiet looping bed for the whole activity, ducked while a
// narration clip is speaking (see the stepKey effect below), then restored.
const BED_VOLUME = 0.3
const BED_DUCK_MULT = 0.4

// Spark voice-F narration, one clip per step, keyed by the `stepKey` derived
// below from mode/breatheStage/completionCount. Fires once per step entry
// (guarded by lastNarrationKeyRef) and ducks the bed for its duration.
const NARRATION_CLIPS = {
  arrive: 'mind-01-arrive.mp3',
  see: 'mind-02-see.mp3',
  hear: 'mind-03-hear.mp3',
  breathe: 'mind-04-breathe.mp3',
  breatheDone: 'mind-05-done.mp3',
  'close-1': 'mind-06-close.mp3',
  'close-2': 'mind-07-leveledup.mp3',
}

function stepKeyFor(mode, breatheStage, completionCount, finished) {
  if (mode === 'arrive') return 'arrive'
  if (mode === 'see') return 'see'
  if (mode === 'hear') return 'hear'
  if (mode === 'breathe' && breatheStage === 'active') return 'breathe'
  if (mode === 'breathe' && breatheStage === 'done') return 'breatheDone'
  if (mode === 'close' && !finished) return `close-${completionCount}`
  return null
}

// Box breathing, paced by mind-04-breathe.mp3's own spoken count rather than
// a plain ticker -- these are that clip's exact timing structure (Spark's
// script), read directly off the audio element's `currentTime`:
//   0.0-7.0s   lead-in, rings/frog idle & small while Spark talks
//   7.0-27.0s  cycle 1 -- 4 phases x 5.0s (in, hold, out, hold)
//   27.0-29.0s "again" bridge -- hold small/idle, don't restart yet
//   29.0-49.0s cycle 2 -- 4 phases x 5.0s, same shape as cycle 1
const LEAD_IN = 7.0
const PHASE_DUR = 5.0
const AGAIN_BRIDGE = 2.0
const CYCLES = 2

const BREATHE_PHASES = [
  { key: 'in', label: 'Breathe in' },
  { key: 'hold1', label: 'Hold' },
  { key: 'out', label: 'Breathe out' },
  { key: 'hold2', label: 'Hold' },
]

// Derives which phase of which cycle (or lead-in/bridge/end) a given elapsed
// time falls in, generically over CYCLES/LEAD_IN/PHASE_DUR/AGAIN_BRIDGE --
// tuning any of those automatically moves every cycle/bridge boundary after
// it (e.g. LEAD_IN=7, PHASE_DUR=5, AGAIN_BRIDGE=2, CYCLES=2 lands cycle 1 at
// 7-27s, the "again" bridge at 27-29s, and cycle 2 at 29-49s, matching
// mind-04-breathe.mp3's script). Nothing here is tracked as separate state;
// it all comes back out of this one function each time `breatheElapsed`
// updates.
function breathePhaseAt(t) {
  if (t < LEAD_IN) return { kind: 'leadin' }
  let cycleStart = LEAD_IN
  for (let cycle = 1; cycle <= CYCLES; cycle++) {
    const cycleEnd = cycleStart + 4 * PHASE_DUR
    if (t < cycleEnd) {
      const rel = t - cycleStart
      const idx = Math.min(3, Math.floor(rel / PHASE_DUR))
      return { kind: 'cycle', cycle, phase: BREATHE_PHASES[idx], elapsedInPhase: rel - idx * PHASE_DUR }
    }
    if (cycle < CYCLES && t < cycleEnd + AGAIN_BRIDGE) return { kind: 'bridge' }
    cycleStart = cycleEnd + AGAIN_BRIDGE
  }
  return { kind: 'end' }
}

// A 1-2-3-4 tick within each 5-second phase, purely a visual rhythm cue
// alongside Spark's spoken count.
function tickFromElapsed(elapsedInPhase) {
  return Math.min(4, Math.floor((elapsedInPhase / PHASE_DUR) * 4) + 1)
}

// Ring group target per phase. hold1 repeats `in`'s target (holds at full)
// and hold2 repeats `out`'s (holds small); since the CSS value doesn't
// change between in->hold1 or out->hold2, the transition just arrives and
// stays, with no extra "hold in place" logic needed. `idle` covers lead-in,
// the "again" bridge, and anything outside an active breathe step.
// Draft 58: widened the scale/opacity/brightness range noticeably (Josh's
// note that the shipped rings looked too faint/thin) -- big and bright at
// the top of the inhale, clearly smaller and dimmer at the bottom of the
// exhale, so the swell is unmistakable at a glance.
const RING_TARGETS = {
  idle: { scale: 0.55, opacity: 0.28, brightness: 0.75 },
  in: { scale: 1.55, opacity: 1, brightness: 1.4 },
  hold1: { scale: 1.55, opacity: 1, brightness: 1.4 },
  out: { scale: 0.42, opacity: 0.3, brightness: 0.65 },
  hold2: { scale: 0.42, opacity: 0.3, brightness: 0.65 },
}

// Draft 47 (Maggie/Holly, 2026-08-24): the frog "breathes along" with the
// count during the active breathing stage. Draft 57: retargeted onto the
// painterly PNG's wrapper div (bottom-anchored via transform-origin, see
// the frogSwellRef effect) instead of the old SVG's #frog-body, with
// separate x/y scale so the swell reads as a soft belly-breath rather than
// a uniform balloon. Subtler than the rings: this is a frog, not a balloon.
// Draft 58: tightened scaleX to near-1 (was 1.03/0.985) so the wide lily pad
// doesn't visibly stretch sideways -- the swell is now almost entirely
// vertical (scaleY), matching a belly rising rather than the whole pad
// inflating.
const FROG_BREATHE_TARGETS = {
  idle: { translateY: 1, scaleX: 0.995, scaleY: 0.97 },
  in: { translateY: -4, scaleX: 1.01, scaleY: 1.05 },
  hold1: { translateY: -4, scaleX: 1.01, scaleY: 1.05 },
  out: { translateY: 1, scaleX: 0.995, scaleY: 0.97 },
  hold2: { translateY: 1, scaleX: 0.995, scaleY: 0.97 },
}

// Draft 57: arrive/close now carry a single narration-matched line as the
// panel's main message (see panelText below), so their old separate
// `instruction` line is retired to avoid repeating the same sentiment twice
// on screen.
const INSTRUCTIONS = {
  intro: 'Tap to begin.',
  arrive: '',
  see: 'What are three things you can see',
  hear: 'Find three things you can hear.',
  // Draft 47 (2026-08-24): shown before breathing starts, so it orients the
  // player to what's coming rather than describing the breathing itself.
  breatheReady: 'On the next page, you’ll see a count from Spark to follow along with.',
  // Draft 47 (Holly): the final breathe screen used to reuse `breatheReady`
  // ("follow Spark's count"), which is stale once the breathing is over.
  breatheDone: 'Ready to keep going?',
  close: '',
}

// Draft 57 on-screen copy, written to match the new narration verbatim.
const ARRIVE_TEXT = 'Welcome to your mindful place. Let’s use our senses to really arrive.'
const CLOSE_1_TEXT =
  'That is your mindful place. You don’t need this particular place at the pond to find it — you can do this anywhere you are. Here, take this with you — an Oxygen Mask! It’ll help you breathe easy on the climb ahead! If you want, you can practice again and make the mask work even better!'
const CLOSE_2_TEXT =
  'Congratulations — your practice actually leveled up your Oxygen Mask! The climb up to Mount Hope should be easier now.'

function loadLayer(url) {
  return fetch(url)
    .then((r) => r.text())
    .then((svg) => svg.replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" '))
}

function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-colors"
      style={
        active
          ? { background: 'var(--action-primary)', borderColor: 'var(--action-primary)', color: 'var(--text-on-warm)' }
          : { background: 'var(--action-quiet)', borderColor: 'var(--border-soft)', color: 'var(--text-bright)' }
      }
    >
      {label}
    </button>
  )
}

export default function MindfulnessCalmPlace() {
  const [layers, setLayers] = useState(null)
  const [mode, setMode] = useState('intro') // intro | arrive | see | hear | breathe | close
  const [seen, setSeen] = useState([])
  const [heard, setHeard] = useState([])
  const [lastSeen, setLastSeen] = useState(null)
  const [lastHeard, setLastHeard] = useState(null)
  // ready (Spark's lead-in, not yet started) | active (mind-04 playing) | done
  const [breatheStage, setBreatheStage] = useState('ready')
  // Seconds into mind-04-breathe.mp3, polled from the audio element while
  // breatheStage is 'active' (see the poll effect below). Phase/cycle/count
  // are all derived from this single number via breathePhaseAt, rather than
  // tracked separately.
  const [breatheElapsed, setBreatheElapsed] = useState(0)
  // How many times the FULL exercise (see -> hear -> breathe) has been
  // completed: 0 before the first run, 1 after the first, 2 after the
  // second (capped -- no practice offer is shown once it reaches 2).
  const [completionCount, setCompletionCount] = useState(0)
  // Draft 57: replaces the old restart()-to-intro loop (Ginny's bug). Once
  // true, the close screen's button row is hidden and the last message
  // simply stays on screen -- that's the whole "ends cleanly" fix, no new
  // screen or navigation needed.
  const [finished, setFinished] = useState(false)

  const containerRef = useRef(null)
  const soundscapeRef = useRef(null)
  const narrationRef = useRef(null)
  const frogSwellRef = useRef(null)
  const pulseTimers = useRef({})
  const lastNarrationKeyRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    Promise.all(Object.values(LAYER_URLS).map(loadLayer)).then((results) => {
      if (cancelled) return
      const keys = Object.keys(LAYER_URLS)
      setLayers(Object.fromEntries(keys.map((k, i) => [k, results[i]])))
    })
    return () => {
      cancelled = true
      Object.values(pulseTimers.current).forEach(clearTimeout)
      if (soundscapeRef.current) soundscapeRef.current.pause()
      if (narrationRef.current) narrationRef.current.pause()
    }
  }, [])

  // Non-blocking visual nicety: briefly bumps brightness on the named overlay
  // layer when a chip that maps to it is selected (see SEE_ITEMS/HEAR_ITEMS'
  // `glowLayer`). Done via direct DOM manipulation rather than React state,
  // since it's a one-off flourish with no bearing on app state.
  function flashLayer(name) {
    const el = containerRef.current && containerRef.current.querySelector(`[data-layer="${name}"]`)
    if (!el) return
    el.classList.remove('om-pulse')
    void el.offsetWidth // restart the animation if it's already mid-flash
    el.classList.add('om-pulse')
    clearTimeout(pulseTimers.current[name])
    pulseTimers.current[name] = setTimeout(() => el.classList.remove('om-pulse'), PULSE_MS)
  }

  function begin() {
    // Called synchronously inside the tap handler (a real user gesture),
    // which is what satisfies the browser's audio-autoplay policy -- and,
    // per Draft 57, is what unlocks the narration clips played from effects
    // shortly after this same gesture.
    const bed = soundscapeRef.current
    if (bed) {
      bed.currentTime = 0
      bed.volume = BED_VOLUME
      bed.play().catch(() => {})
    }
    setMode('arrive')
  }

  function tapSee(item) {
    if (mode !== 'see') return
    setLastSeen(item.id)
    setSeen((s) => (s.includes(item.id) ? s : [...s, item.id]))
    if (item.glowLayer) flashLayer(item.glowLayer)
  }

  function tapHear(item) {
    if (mode !== 'hear') return
    setLastHeard(item.id)
    setHeard((h) => (h.includes(item.id) ? h : [...h, item.id]))
    if (item.glowLayer) flashLayer(item.glowLayer)
  }

  function startBreathe() {
    setBreatheStage('ready')
    setBreatheElapsed(0)
    setMode('breathe')
  }

  function beginBreathing() {
    setBreatheStage('active')
    setBreatheElapsed(0)
  }

  // Breathe -> close, incrementing how many full runs have finished. Named
  // distinctly from a plain setMode so the completion count and the mode
  // change can never drift apart.
  function enterClose() {
    setCompletionCount((c) => c + 1)
    setMode('close')
  }

  // "Practice again" (close screen, offered once): reruns the WHOLE
  // exercise, not just the breath -- see the file header on why this
  // replaces the old two-loop setup.
  function practiceAgain() {
    setSeen([])
    setHeard([])
    setLastSeen(null)
    setLastHeard(null)
    setBreatheStage('ready')
    setBreatheElapsed(0)
    setMode('see')
  }

  function finish() {
    setFinished(true)
  }

  const seeAllFound = seen.length >= 3
  const hearAllFound = heard.length >= 3
  const inSelectionStep = mode === 'see' || mode === 'hear'
  const breathingAlong = mode === 'breathe' && breatheStage === 'active'

  const stepKey = stepKeyFor(mode, breatheStage, completionCount, finished)

  // Fires each narration clip once per step entry (guarded against re-fire
  // on re-render by comparing to the previously-fired key, not a
  // once-ever set -- so re-entering a step via "Practice again" fires it
  // again). Ducks the bed for the clip's duration, then restores it; for
  // the breathe clip specifically, its `ended` event is also what advances
  // breatheStage to 'done' (which is what makes mind-05 play next).
  useEffect(() => {
    if (!stepKey || stepKey === lastNarrationKeyRef.current) return
    const clip = NARRATION_CLIPS[stepKey]
    if (!clip) return
    lastNarrationKeyRef.current = stepKey
    const el = narrationRef.current
    const bed = soundscapeRef.current
    if (!el) return
    const restoreBed = () => {
      if (bed) bed.volume = BED_VOLUME
    }
    el.pause()
    el.currentTime = 0
    el.src = `${AUDIO}/${clip}`
    if (bed) bed.volume = BED_VOLUME * BED_DUCK_MULT
    el.addEventListener(
      'ended',
      () => {
        restoreBed()
        if (stepKey === 'breathe') setBreatheStage('done')
      },
      { once: true }
    )
    el.play().catch(() => restoreBed())
  }, [stepKey])

  // Polls the breathe clip's real playback position every ~150ms while it's
  // active, so the rings/count/frog stay locked to what's actually playing
  // instead of drifting on their own clock.
  useEffect(() => {
    if (!breathingAlong) return
    const id = setInterval(() => {
      const el = narrationRef.current
      if (el) setBreatheElapsed(el.currentTime)
    }, 150)
    return () => clearInterval(id)
  }, [breathingAlong])

  const phaseInfo = breathePhaseAt(breatheElapsed)
  const breathePhase = phaseInfo.kind === 'cycle' ? phaseInfo.phase : null
  const breatheTargetKey = breathePhase ? breathePhase.key : 'idle'
  const breatheCount = breathePhase ? tickFromElapsed(phaseInfo.elapsedInPhase) : null
  const ringTarget = RING_TARGETS[breatheTargetKey]
  const frogTarget = FROG_BREATHE_TARGETS[breatheTargetKey]

  // Draft 57: drives the frog wrapper's scale/lift straight onto its own
  // element (frogSwellRef), the same technique the old code used on the
  // SVG's #frog-body. Only takes over while breathingAlong; the wrapper
  // drops .om-frog-idle for that stretch so the CSS keyframe doesn't fight
  // this inline transform, and clearing the inline style on exit lets the
  // idle keyframe resume from its own natural state.
  useEffect(() => {
    const el = frogSwellRef.current
    if (!el) return
    if (breathingAlong) {
      el.style.transition = `transform ${PHASE_DUR}s ease-in-out`
      el.style.transform = `translateY(${frogTarget.translateY}px) scale(${frogTarget.scaleX}, ${frogTarget.scaleY})`
    } else {
      el.style.transition = ''
      el.style.transform = ''
    }
  }, [breathingAlong, frogTarget])

  // ---- panel copy per mode ----
  let instruction = mode === 'breathe' ? (breatheStage === 'done' ? INSTRUCTIONS.breatheDone : INSTRUCTIONS.breatheReady) : INSTRUCTIONS[mode]
  let panelLabel = null
  let panelText = 'Take a slow breath, and let’s step in.'

  if (mode === 'intro') {
    panelText =
      'Before we climb on, let’s try something you can use whenever things feel like too much. It’s called finding your mindful place. Take a slow breath… and let’s step in.'
  } else if (mode === 'arrive') {
    panelText = ARRIVE_TEXT
  } else if (mode === 'see') {
    if (lastSeen) {
      const item = SEE_ITEMS.find((x) => x.id === lastSeen)
      panelLabel = item.label
      panelText = item.affirm
    } else {
      panelText = 'Tap anything you notice.'
    }
  } else if (mode === 'hear') {
    if (lastHeard) {
      const item = HEAR_ITEMS.find((x) => x.id === lastHeard)
      panelLabel = item.label
      panelText = item.affirm
    } else {
      panelText = 'Tap a sound to bring it forward.'
    }
  } else if (mode === 'breathe') {
    panelText =
      breatheStage === 'done'
        ? 'Beautifully done.'
        : 'Now, let’s feel. Feel your lungs fill as you breathe with me.'
  } else if (mode === 'close') {
    if (completionCount >= 2) {
      panelLabel = 'Leveled up'
      panelText = CLOSE_2_TEXT
    } else {
      panelLabel = 'You did it'
      panelText = CLOSE_1_TEXT
    }
  }

  const showScene = mode !== 'intro'

  return (
    <div ref={containerRef} className="relative flex flex-col h-full w-full overflow-hidden" style={{ background: 'var(--surface-abyss)', fontFamily: 'var(--font-core)' }}>
      <style>{SCENE_CSS}</style>
      <style>{MOTION_CSS}</style>

      {/* audio always mounted (not yet playing) so `begin()` can call .play()
          synchronously inside the real user gesture. `narrationRef`'s src is
          swapped per step by the stepKey effect above. */}
      <audio ref={soundscapeRef} src={`${AUDIO}/soundscape.mp3`} loop preload="auto" />
      <audio ref={narrationRef} preload="auto" />

      {/* background pond, always present; the animated overlay layers only
          mount once the scene starts, so nothing animates unopened in the
          review list */}
      <img
        src={`${ART}/pond-bg.webp`}
        alt="A calm dusk pond, Spark's mindful place"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {showScene && layers && (
        <>
          <div className="om-layer" dangerouslySetInnerHTML={{ __html: layers.rain }} />
          <div
            className="om-layer"
            data-layer="lightning"
            dangerouslySetInnerHTML={{ __html: layers.lightning }}
          />
          <div
            className="om-layer"
            data-layer="fireflies"
            dangerouslySetInnerHTML={{ __html: layers.fireflies }}
          />
          <div className="om-layer" dangerouslySetInnerHTML={{ __html: layers.reeds }} />

          {/* Draft 57: painterly PNG, bottom-left, its own small wrapper
              rather than a full-frame .om-layer overlay. transform-origin
              is bottom-center so the box-breath swell (and the idle
              wobble) grows from its planted feet instead of its middle. */}
          <div className="absolute" data-layer="frog" style={{ left: '4%', bottom: '6%', width: '34%' }}>
            <div
              ref={frogSwellRef}
              className={breathingAlong ? '' : 'om-frog-idle'}
              style={{ transformOrigin: '50% 100%' }}
            >
              <img
                src={`${ART}/frog-painterly.png`}
                alt=""
                className="w-full h-auto block"
                style={{ filter: 'drop-shadow(0 8px 14px rgba(0,0,0,.35))' }}
              />
            </div>
          </div>

          {mode === 'breathe' && breatheStage === 'active' && (
            <>
              <div className="om-vignette is-active" />
              <div
                className={'om-ring-group' + (breatheTargetKey === 'hold1' ? ' om-shimmer' : '')}
                style={{
                  transform: `scale(${ringTarget.scale})`,
                  opacity: ringTarget.opacity,
                  filter: `brightness(${ringTarget.brightness})`,
                }}
              >
                <div className="om-ring om-ring--1" />
                <div className="om-ring om-ring--2" />
                <div className="om-ring om-ring--3" />
                <div className="om-ring om-ring--4" />
              </div>
              {breathePhase && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-white text-[22px] font-extrabold drop-shadow-lg mb-1">
                    {breathePhase.label}
                  </div>
                  <div className="text-white text-[52px] font-extrabold drop-shadow-lg leading-none">
                    {breatheCount}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Selection UI for See/Hear lives in a bar at the TOP, over the open
          sky, so the scene below — the frog especially — stays fully
          visible the whole time you're choosing (Josh, testing feedback on
          Draft 33: the old scene-tapping hotspots, and the panel bar they
          shared space with, covered too much of the scene). */}
      {inSelectionStep && (
        <div className="relative px-4 pt-4 pb-5 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-transparent">
          <div className="text-[10px] font-extrabold tracking-[0.16em] uppercase mb-1" style={{ color: 'var(--text-warm)' }}>
            Zone 4 · Mindfulness
          </div>
          <div className="text-[12px] mb-2" style={{ color: 'var(--text-body)' }}>{instruction}</div>

          <div className="flex flex-wrap gap-2 mb-2">
            {mode === 'see' &&
              SEE_ITEMS.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  active={seen.includes(item.id)}
                  onClick={() => tapSee(item)}
                />
              ))}
            {mode === 'hear' &&
              HEAR_ITEMS.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  active={heard.includes(item.id)}
                  onClick={() => tapHear(item)}
                />
              ))}
          </div>

          {(lastSeen && mode === 'see') || (lastHeard && mode === 'hear') ? (
            <div
              className="rounded-2xl px-3.5 py-2.5 mb-2"
              style={{ background: 'var(--surface-sheet)', backdropFilter: 'var(--blur-sheet)', border: '1px solid var(--border-soft)' }}
            >
              {panelLabel && (
                <div className="font-extrabold text-[13px] mb-0.5" style={{ color: 'var(--text-warm)' }}>{panelLabel}</div>
              )}
              <div className="text-[13px] leading-snug" style={{ color: 'var(--text-bright)' }}>{panelText}</div>
            </div>
          ) : null}

          <div className="text-[12px] text-center mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {mode === 'see' ? `${seen.length} of 3 found` : `${heard.length} of 3 heard`}
          </div>

          {((mode === 'see' && seeAllFound) || (mode === 'hear' && hearAllFound)) && (
            <button
              type="button"
              onClick={() => (mode === 'see' ? setMode('hear') : startBreathe())}
              className="w-full py-2.5 rounded-full text-[15px] font-extrabold transition-colors"
              style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
            >
              Continue
            </button>
          )}
        </div>
      )}

      {/* Spark's panel for the non-selection steps: a floating bar rather
          than a separate card below the scene, so the artwork fills nearly
          the whole frame ("keep UI minimal so the scene breathes"). Hidden
          outright while breathing is active: the rings + phase/count overlay
          IS the UI for that stretch (Draft 35 — "make it large and clearly
          the focal point"), and a panel competing for the same space would
          undercut that. */}
      {!inSelectionStep && !(mode === 'breathe' && breatheStage === 'active') && (
        <div className="relative mt-auto px-4 pb-4 pt-10 bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-transparent">
          <div className="text-[10px] font-extrabold tracking-[0.16em] uppercase mb-1" style={{ color: 'var(--text-warm)' }}>
            Zone 4 · Mindfulness
          </div>
          <div
            className="rounded-2xl px-3.5 py-2.5 mb-2"
            style={{ background: 'var(--surface-sheet)', backdropFilter: 'var(--blur-sheet)', border: '1px solid var(--border-soft)' }}
          >
            {panelLabel && (
              <div className="font-extrabold text-[13px] mb-0.5" style={{ color: 'var(--text-warm)' }}>{panelLabel}</div>
            )}
            <div className="text-[13px] leading-snug" style={{ color: 'var(--text-bright)' }}>{panelText}</div>
          </div>

          {instruction && (
            <div className="text-[12px] mb-2 min-h-[16px]" style={{ color: 'var(--text-body)' }}>{instruction}</div>
          )}

          {mode === 'intro' && (
            <button
              type="button"
              onClick={begin}
              className="w-full py-2.5 rounded-full text-[15px] font-extrabold"
              style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
            >
              Begin
            </button>
          )}

          {mode === 'arrive' && (
            <button
              type="button"
              onClick={() => setMode('see')}
              className="w-full py-2.5 rounded-full text-[15px] font-extrabold"
              style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
            >
              I’m here
            </button>
          )}

          {mode === 'breathe' && breatheStage === 'ready' && (
            <button
              type="button"
              onClick={beginBreathing}
              className="w-full py-2.5 rounded-full text-[15px] font-extrabold"
              style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
            >
              Begin box breathing
            </button>
          )}

          {mode === 'breathe' && breatheStage === 'done' && (
            <button
              type="button"
              onClick={enterClose}
              className="w-full py-2.5 rounded-full text-[15px] font-extrabold"
              style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
            >
              Continue
            </button>
          )}

          {/* Practice-to-level-up the Oxygen Mask (Draft 57), offered once:
              the whole exercise reruns from Practice again, not just the
              breath (see practiceAgain and the file header). */}
          {mode === 'close' && !finished && completionCount === 1 && (
            <div className="space-y-2">
              <p className="text-[12px] text-center" style={{ color: 'var(--text-body)' }}>
                Want to practice again to upgrade your mask?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={practiceAgain}
                  className="flex-1 py-2.5 rounded-full text-[14px] font-extrabold"
                  style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
                >
                  Practice again
                </button>
                <button
                  type="button"
                  onClick={finish}
                  className="flex-1 py-2.5 rounded-full text-[14px] font-extrabold"
                  style={{ background: 'var(--action-quiet)', color: 'var(--text-bright)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)' }}
                >
                  Move on
                </button>
              </div>
            </div>
          )}

          {/* Second completion: a single button that ends the activity --
              `finish()` only sets `finished`, which hides this row and
              leaves CLOSE_2_TEXT on screen. No path back to `mode: 'intro'`
              exists anywhere in this screen (Draft 57 fixes the old
              restart()-to-intro bug by removing that path entirely, not by
              guarding it). */}
          {mode === 'close' && !finished && completionCount >= 2 && (
            <button
              type="button"
              onClick={finish}
              className="w-full py-2.5 rounded-full text-[15px] font-extrabold"
              style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
            >
              I’m all set
            </button>
          )}
        </div>
      )}
    </div>
  )
}
