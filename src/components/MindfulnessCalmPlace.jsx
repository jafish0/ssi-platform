// Mindfulness "Calm Place" (GAINS Zone 4 activity) — Draft 33, reworked Drafts 34-35.
//
// Spark leads a guided calm-place visualization that does double duty:
// grounding (the 3-3-3 technique: see / hear / breathe) AND calm-place
// visualization. Built from the staged assets in
// `Gains for Teens/long-light-site/{art,audio}/mindfulness/` (mirrored into
// public/long-light/ for serving): a dusk pond background, five layered
// overlay SVGs (rain, lightning, fireflies, reeds, frog) with their own idle
// animations in motion.css, and three looping ambient audio tracks.
//
// Flow, guided and no-fail:
//   intro   — "Begin" gesture (required for audio autoplay).
//   arrive  — Spark settles the player into the scene.
//   see     — pick any 3 of 6 predefined option chips (frog, lightning, pond,
//             fireflies, trees, clouds).
//   hear    — pick any 3 of 4 predefined sound chips (rain, thunder, frogs,
//             music).
//   breathe — a guided box-breath: in (4) - hold (4) - out (4) - hold (4),
//             for 2 cycles, paced by a large glow and an on-screen count.
//   close   — Oxygen Mask earned; can practice the breath again (up to 2
//             more times) to "upgrade" it, a reinforcing message only —
//             no mechanical difference in the mask itself.
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
// Draft 35 reworked breathe: the original subtle pulse gave no direction, so
// it's now a directive box-breath. Pacing is driven by a plain 1-second
// setInterval counting elapsed ticks, with phase/cycle/count derived by
// simple division rather than tracked as separate incrementing state — this
// sidesteps the coordination bugs a naive "increment count, and if it
// overflows also increment phase, and if THAT overflows also increment
// cycle" approach invites. The glow's expand/contract is a CSS transition
// (not a keyframe animation) timed to each phase's real 4-second duration,
// which lets a phase change that doesn't alter the target (hold following
// in, hold following out) simply hold still without any extra logic.

import { useEffect, useRef, useState } from 'react'

const ART = '/long-light/art/mindfulness'
const AUDIO = '/long-light/audio/mindfulness'

const LAYER_URLS = {
  rain: `${ART}/layer-rain.svg`,
  lightning: `${ART}/layer-lightning.svg`,
  fireflies: `${ART}/layer-fireflies.svg`,
  reeds: `${ART}/layer-reeds.svg`,
  frog: `${ART}/frog.svg`,
}

// Idle-loop keyframes for the overlay layers, copied verbatim from the
// staged motion.css (Draft 33's asset). Per-element durations/delays live in
// each SVG's own style attributes; this only supplies the keyframes.
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

#frog-body{animation:om-breathe 4.6s ease-in-out infinite}
@keyframes om-breathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-4px) scale(1.015)}}

@media (prefers-reduced-motion:reduce){
  .drop,#layer-lightning,.reed,.fly,.fly-core,.fly-glow,#frog-body{animation:none}
}
`

// Component-specific styling: makes each injected layer fill the frame
// (xMidYMid slice, forced below at fetch time, keeps it aligned with the
// object-cover background rather than letterboxing at a different aspect
// ratio), the chip-selection "pulse" nicety, and the breathing glow.
const SCENE_CSS = `
.om-layer, .om-layer svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.om-pulse { animation: omPulseFlash .9s ease-out; }
@keyframes omPulseFlash { 0% { filter: brightness(1); } 30% { filter: brightness(1.85); } 100% { filter: brightness(1); } }
@media (prefers-reduced-motion: reduce) { .om-pulse { animation: none; } }
.om-glow-breath {
  position: absolute; left: 50%; top: 50%; border-radius: 9999px;
  background: radial-gradient(circle, rgba(253,230,138,.95) 0%, rgba(245,158,11,.55) 45%, rgba(245,158,11,0) 72%);
  width: 68%; aspect-ratio: 1 / 1;
  transition: transform 4s linear, opacity 4s linear, filter 4s linear;
}
/* Gentle shimmer layered on top while holding at full (post-inhale). Applies
   to filter, not transform, so it doesn't fight the phase transition above. */
.om-glow-breath.om-shimmer { animation: omShimmer 1.1s ease-in-out infinite; }
@keyframes omShimmer {
  0%, 100% { filter: brightness(1.08); }
  50% { filter: brightness(1.25); }
}
@media (prefers-reduced-motion: reduce) {
  .om-glow-breath { transition: none; }
  .om-glow-breath.om-shimmer { animation: none; }
}
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

// HEAR step: four predefined sound options, any three unlock Continue.
// `audioKey` maps to the actual audio ref/volume to nudge — Rain and Thunder
// are the same recording (light rain + gentle thunder together), so both
// nudge `rain`; Thunder additionally pulses the lightning layer so it reads
// as its own distinct element despite sharing audio with Rain.
const HEAR_ITEMS = [
  { id: 'rain', label: 'Rain', affirm: 'The rain, tapping softly.', audioKey: 'rain' },
  { id: 'thunder', label: 'Thunder', affirm: 'A low rumble of distant thunder.', audioKey: 'rain', glowLayer: 'lightning' },
  { id: 'frogs', label: 'Frogs', affirm: 'Frogs and the brook, murmuring together.', audioKey: 'frog' },
  { id: 'music', label: 'Music', affirm: 'A quiet melody, drifting through the air.', audioKey: 'music' },
]

const BASE_VOLUME = { music: 0.35, rain: 0.12, frog: 0.12 }
// Draft 37: rain/frog used to sit at a whisper (0.12) the whole time, so
// "find three things you can hear" was really "find the one thing already
// audible, then tap blind for the other two." All three sit at one shared,
// clearly audible level for the duration of the Hear step, then drop back to
// BASE_VOLUME's quiet background once the step ends.
const HEAR_AMBIENT_VOLUME = 0.4
const NUDGE_VOLUME = 0.85
const NUDGE_MS = 2400
const PULSE_MS = 900

// Box breathing: 4 phases x 4 one-second counts each = 16s/cycle, x 2 cycles
// (Draft 37: was 3, testing feedback said 2).
const BREATHE_PHASES = [
  { key: 'in', label: 'Breathe in' },
  { key: 'hold1', label: 'Hold' },
  { key: 'out', label: 'Breathe out' },
  { key: 'hold2', label: 'Hold' },
]
const COUNTS_PER_PHASE = 4
const BREATHE_CYCLES = 2
const TICK_MS = 1000
const TICKS_PER_CYCLE = BREATHE_PHASES.length * COUNTS_PER_PHASE
const TOTAL_BREATHE_TICKS = BREATHE_CYCLES * TICKS_PER_CYCLE

// Glow target per phase. hold1 repeats `in`'s target (holds at full) and
// hold2 repeats `out`'s (holds small); since the CSS value doesn't change
// between in->hold1 or out->hold2, the transition just arrives and stays,
// with no extra "hold in place" logic needed.
const GLOW_TARGETS = {
  in: { scale: 1.4, opacity: 1, brightness: 1.15 },
  hold1: { scale: 1.4, opacity: 1, brightness: 1.15 },
  out: { scale: 0.5, opacity: 0.45, brightness: 0.85 },
  hold2: { scale: 0.5, opacity: 0.45, brightness: 0.85 },
}

const INSTRUCTIONS = {
  intro: 'Tap to begin.',
  arrive: 'Let’s use our senses to really arrive.',
  see: 'Find three things you can see.',
  hear: 'Find three things you can hear.',
  breathe: 'Follow Spark’s count.',
  close: 'That’s your calm place.',
}

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
      className={
        'px-3 py-1.5 rounded-full text-[13px] font-semibold border transition-colors ' +
        (active
          ? 'bg-amber-500 border-amber-500 text-white'
          : 'bg-white/15 border-white/30 text-white hover:bg-white/25')
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
  // ready (Spark's lead-in, not yet started) | active (timer running) | done
  const [breatheStage, setBreatheStage] = useState('ready')
  const [breatheTicks, setBreatheTicks] = useState(0) // 1..TOTAL_BREATHE_TICKS while active
  // How many times the box-breath has been re-run from the close screen's
  // "practice again" offer (capped at 2), and whether the offer's been
  // turned down -- either one stops the offer from showing again.
  const [practiceCount, setPracticeCount] = useState(0)
  const [practiceDeclined, setPracticeDeclined] = useState(false)

  const containerRef = useRef(null)
  const musicRef = useRef(null)
  const rainRef = useRef(null)
  const frogRef = useRef(null)
  const nudgeTimers = useRef({})
  const pulseTimers = useRef({})
  const breatheTimerRef = useRef(null)
  // A pending nudge's setTimeout reads this to pick its revert target -- mode
  // itself is stale inside that closure by the time it fires (up to 2.4s
  // later, easily long enough to have left Hear).
  const modeRef = useRef(mode)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    let cancelled = false
    Promise.all(Object.values(LAYER_URLS).map(loadLayer)).then((results) => {
      if (cancelled) return
      const keys = Object.keys(LAYER_URLS)
      setLayers(Object.fromEntries(keys.map((k, i) => [k, results[i]])))
    })
    return () => {
      cancelled = true
      Object.values(nudgeTimers.current).forEach(clearTimeout)
      Object.values(pulseTimers.current).forEach(clearTimeout)
      clearInterval(breatheTimerRef.current)
    }
  }, [])

  const audioRefFor = (key) => (key === 'rain' ? rainRef : key === 'frog' ? frogRef : musicRef)

  function nudge(audioKey) {
    const ref = audioRefFor(audioKey)
    const el = ref.current
    if (!el) return
    el.volume = NUDGE_VOLUME
    clearTimeout(nudgeTimers.current[audioKey])
    nudgeTimers.current[audioKey] = setTimeout(() => {
      if (!ref.current) return
      ref.current.volume = modeRef.current === 'hear' ? HEAR_AMBIENT_VOLUME : BASE_VOLUME[audioKey]
    }, NUDGE_MS)
  }

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
    setMode('arrive')
    // Called synchronously inside the tap handler (a real user gesture),
    // which is what satisfies the browser's audio-autoplay policy.
    ;[musicRef, rainRef, frogRef].forEach((ref) => {
      const el = ref.current
      if (!el) return
      el.currentTime = 0
    })
    if (musicRef.current) musicRef.current.volume = BASE_VOLUME.music
    if (rainRef.current) rainRef.current.volume = BASE_VOLUME.rain
    if (frogRef.current) frogRef.current.volume = BASE_VOLUME.frog
    ;[musicRef, rainRef, frogRef].forEach((ref) => ref.current && ref.current.play().catch(() => {}))
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
    nudge(item.audioKey)
    if (item.glowLayer) flashLayer(item.glowLayer)
  }

  // All three tracks come up to one shared, clearly audible level for the
  // duration of Hear (see HEAR_AMBIENT_VOLUME); tapping a chip nudges its
  // track further forward on top of that baseline.
  function enterHear() {
    setMode('hear')
    if (musicRef.current) musicRef.current.volume = HEAR_AMBIENT_VOLUME
    if (rainRef.current) rainRef.current.volume = HEAR_AMBIENT_VOLUME
    if (frogRef.current) frogRef.current.volume = HEAR_AMBIENT_VOLUME
  }

  function startBreathe() {
    clearInterval(breatheTimerRef.current)
    // Leaving Hear: drop back to the quiet background bed rather than
    // carrying its louder, "genuinely hearable" mix into the rest of the
    // activity.
    Object.values(nudgeTimers.current).forEach(clearTimeout)
    if (musicRef.current) musicRef.current.volume = BASE_VOLUME.music
    if (rainRef.current) rainRef.current.volume = BASE_VOLUME.rain
    if (frogRef.current) frogRef.current.volume = BASE_VOLUME.frog
    setBreatheStage('ready')
    setBreatheTicks(0)
    setMode('breathe')
  }

  // Ticks once per second regardless of phase/cycle boundaries; phase, cycle
  // and the on-screen count are all derived from this single number (see
  // below), rather than tracked as separate state that would need to be kept
  // in sync with each other on every tick.
  function beginBreathing() {
    setBreatheStage('active')
    setBreatheTicks(1)
    clearInterval(breatheTimerRef.current)
    breatheTimerRef.current = setInterval(() => {
      setBreatheTicks((t) => {
        const next = t + 1
        if (next > TOTAL_BREATHE_TICKS) {
          clearInterval(breatheTimerRef.current)
          setBreatheStage('done')
          return t
        }
        return next
      })
    }, TICK_MS)
  }

  // "Practice again" (close screen, up to 2 times): re-runs just the
  // box-breath, not the whole activity. Purely a reinforcing message once it
  // finishes -- no mechanical change to the Oxygen Mask, there's no
  // "un-upgraded" state anywhere to reference.
  function practiceAgain() {
    setPracticeCount((c) => c + 1)
    startBreathe()
  }

  function declinePractice() {
    setPracticeDeclined(true)
  }

  function again() {
    clearInterval(breatheTimerRef.current)
    setSeen([])
    setHeard([])
    setLastSeen(null)
    setLastHeard(null)
    setBreatheStage('ready')
    setBreatheTicks(0)
    setPracticeCount(0)
    setPracticeDeclined(false)
    setMode('see')
  }

  function restart() {
    clearInterval(breatheTimerRef.current)
    setMode('intro')
    setSeen([])
    setHeard([])
    setLastSeen(null)
    setLastHeard(null)
    setBreatheStage('ready')
    setBreatheTicks(0)
    setPracticeCount(0)
    setPracticeDeclined(false)
    ;[musicRef, rainRef, frogRef].forEach((ref) => {
      const el = ref.current
      if (!el) return
      el.pause()
      el.currentTime = 0
    })
  }

  const seeAllFound = seen.length >= 3
  const hearAllFound = heard.length >= 3
  const inSelectionStep = mode === 'see' || mode === 'hear'

  // Phase/cycle/count-in-phase, all derived from the single elapsed-ticks
  // counter rather than tracked separately.
  const tickIdx0 = Math.max(0, breatheTicks - 1)
  const withinCycle = tickIdx0 % TICKS_PER_CYCLE
  const breathePhase = BREATHE_PHASES[Math.floor(withinCycle / COUNTS_PER_PHASE)]
  const breatheCount = (withinCycle % COUNTS_PER_PHASE) + 1

  // ---- panel copy per mode ----
  let instruction = INSTRUCTIONS[mode]
  let panelLabel = null
  let panelText = 'Take a slow breath, and let’s step in.'

  if (mode === 'intro') {
    panelText =
      'Before we climb on, let’s try something you can use whenever things feel like too much. It’s called finding your calm place. Take a slow breath… and let’s step in.'
  } else if (mode === 'arrive') {
    panelText =
      'This is a calm place. Any time you feel overwhelmed, you can close your eyes and come back here in your mind.'
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
    if (practiceCount === 0) {
      panelLabel = 'You did it'
      panelText =
        'That’s your calm place. You can come back any time you need a moment. Take this with you: an Oxygen Mask. It’ll help you breathe easy on the climb ahead.'
    } else {
      panelText = 'Your practice made this tool stronger. It should work really well on the climb ahead.'
    }
  }

  const showScene = mode !== 'intro'
  const breatheTarget = GLOW_TARGETS[breathePhase.key]
  const glowStyle = {
    transform: `translate(-50%, -50%) scale(${breatheTarget.scale})`,
    opacity: breatheTarget.opacity,
    filter: `brightness(${breatheTarget.brightness})`,
  }

  return (
    <div ref={containerRef} className="relative flex flex-col h-full w-full bg-slate-900 overflow-hidden">
      <style>{SCENE_CSS}</style>
      <style>{MOTION_CSS}</style>

      {/* audio always mounted (not yet playing) so `begin()` can call .play()
          synchronously inside the real user gesture */}
      <audio ref={musicRef} src={`${AUDIO}/music.mp3`} loop preload="auto" />
      <audio ref={rainRef} src={`${AUDIO}/rain.mp3`} loop preload="auto" />
      <audio ref={frogRef} src={`${AUDIO}/frog.mp3`} loop preload="auto" />

      {/* background pond, always present; the animated overlay layers only
          mount once the scene starts, so nothing animates unopened in the
          review list */}
      <img
        src={`${ART}/pond-bg.webp`}
        alt="A calm dusk pond, Spark's calm place"
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
          <div
            className="om-layer"
            data-layer="frog"
            dangerouslySetInnerHTML={{ __html: layers.frog }}
          />

          {mode === 'breathe' && breatheStage === 'active' && (
            <>
              <div
                className={
                  'om-glow-breath' + (breathePhase.key === 'hold1' ? ' om-shimmer' : '')
                }
                style={glowStyle}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-white text-[22px] font-extrabold drop-shadow-lg mb-1">
                  {breathePhase.label}
                </div>
                <div className="text-white text-[52px] font-extrabold drop-shadow-lg leading-none">
                  {breatheCount}
                </div>
              </div>
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
          <div className="text-[10px] font-extrabold tracking-[0.16em] uppercase text-amber-300 mb-1">
            Zone 4 · Mindfulness
          </div>
          <div className="text-[12px] text-amber-100/90 mb-2">{instruction}</div>

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
            <div className="bg-white/95 backdrop-blur rounded-2xl px-3.5 py-2.5 mb-2">
              {panelLabel && (
                <div className="font-extrabold text-amber-700 text-[13px] mb-0.5">{panelLabel}</div>
              )}
              <div className="text-[13px] text-slate-700 leading-snug">{panelText}</div>
            </div>
          ) : null}

          <div className="text-[12px] text-amber-100/70 text-center mb-1.5">
            {mode === 'see' ? `${seen.length} of 3 found` : `${heard.length} of 3 heard`}
          </div>

          {((mode === 'see' && seeAllFound) || (mode === 'hear' && hearAllFound)) && (
            <button
              type="button"
              onClick={() => (mode === 'see' ? enterHear() : startBreathe())}
              className="w-full py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[15px] font-extrabold"
            >
              Continue
            </button>
          )}
        </div>
      )}

      {/* Spark's panel for the non-selection steps: a floating bar rather
          than a separate card below the scene, so the artwork fills nearly
          the whole frame ("keep UI minimal so the scene breathes"). Hidden
          outright while breathing is active: the glow + phase/count overlay
          IS the UI for that stretch (Draft 35 — "make it large and clearly
          the focal point"), and a panel competing for the same space would
          undercut that. */}
      {!inSelectionStep && !(mode === 'breathe' && breatheStage === 'active') && (
        <div className="relative mt-auto px-4 pb-4 pt-10 bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-transparent">
          <div className="text-[10px] font-extrabold tracking-[0.16em] uppercase text-amber-300 mb-1">
            Zone 4 · Mindfulness
          </div>
          <div className="bg-white/95 backdrop-blur rounded-2xl px-3.5 py-2.5 mb-2">
            {panelLabel && (
              <div className="font-extrabold text-amber-700 text-[13px] mb-0.5">{panelLabel}</div>
            )}
            <div className="text-[13px] text-slate-700 leading-snug">{panelText}</div>
          </div>

          <div className="text-[12px] text-amber-100/90 mb-2 min-h-[16px]">{instruction}</div>

          {mode === 'intro' && (
            <button
              type="button"
              onClick={begin}
              className="w-full py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[15px] font-extrabold"
            >
              Begin
            </button>
          )}

          {mode === 'arrive' && (
            <button
              type="button"
              onClick={() => setMode('see')}
              className="w-full py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[15px] font-extrabold"
            >
              I’m here
            </button>
          )}

          {mode === 'breathe' && breatheStage === 'ready' && (
            <button
              type="button"
              onClick={beginBreathing}
              className="w-full py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[15px] font-extrabold"
            >
              Start breathing
            </button>
          )}

          {mode === 'breathe' && breatheStage === 'done' && (
            <button
              type="button"
              onClick={() => setMode('close')}
              className="w-full py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[15px] font-extrabold"
            >
              Continue
            </button>
          )}

          {/* Practice-to-upgrade the Oxygen Mask (Draft 37), up to 2 times.
              A distinct, narrower loop from "Do it again" below -- this one
              only re-runs the breath, not the whole activity -- so it's
              offered first and gates on its own counter rather than sharing
              state with the full-activity repeat. */}
          {mode === 'close' && practiceCount < 2 && !practiceDeclined && (
            <div className="space-y-2">
              <p className="text-[12px] text-amber-100/90 text-center">
                Want to practice again to upgrade your mask?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={practiceAgain}
                  className="flex-1 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[14px] font-extrabold"
                >
                  Practice again
                </button>
                <button
                  type="button"
                  onClick={declinePractice}
                  className="flex-1 py-2.5 rounded-full bg-white/90 hover:bg-white text-amber-700 text-[14px] font-extrabold"
                >
                  No, I’m ready
                </button>
              </div>
            </div>
          )}

          {mode === 'close' && (practiceCount >= 2 || practiceDeclined) && (
            <div className="space-y-2">
              <p className="text-[12px] text-amber-100/90 text-center">Want to stay a little longer?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={again}
                  className="flex-1 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[14px] font-extrabold"
                >
                  Do it again
                </button>
                <button
                  type="button"
                  onClick={restart}
                  className="flex-1 py-2.5 rounded-full bg-white/90 hover:bg-white text-amber-700 text-[14px] font-extrabold"
                >
                  I’m all set
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
