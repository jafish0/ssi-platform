// Zone 4 "The Bright Reaches" walkable zone at /gains-demo/zone4 (GAINS
// Draft 68). The first instance of the walkable-zone template from
// `Gains for Teens/Walkable Zones — Concept.md`: one 9:16 phone frame, and
// EVERYTHING happens inside it. A scene-state machine runs the loop:
//
//   intro ─Begin─▶ walk ─tap Spark─▶ video ─ended─▶ walk (Spark follows)
//     ─tap pond─▶ activity (Mindful Place) ─done─▶ gear (Oxygen Mask award)
//     ─equip─▶ walk (exit lights up) ─tap exit─▶ transition ─VO ends─▶
//     climb (the Ascent) ─Beacon─▶ end ─Play again─▶ intro
//
// Progression lives HERE (talkedToSpark → watchedVideo → didActivity →
// exitUnlocked); the Phaser scene (ZoneStage / zoneWalkScene) only renders,
// moves the Traveler and reports taps/arrivals. Wrong-order taps get Spark's
// voiced redirects (lines 5/6/7) instead of greyed-out UI.
//
// Phase A ships the walkable world with STUB hand-offs (the video / activity
// / gear / climb scenes are placeholder cards that immediately advance the
// state) so the gating + companion loop is testable; Phase B swaps in the
// real Vimeo player, MindfulnessCalmPlace, GearAward and TraversalGame.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'
import ZoneStage from '../components/gains/zone/ZoneStage.jsx'
import GearHud from '../components/gains/zone/GearHud.jsx'
import SparkBubble from '../components/gains/zone/SparkBubble.jsx'
import { createZoneAudio } from '../components/gains/zone/zoneAudio.js'
import GainsButton from '../components/gains/ds/Button.jsx'
import { GAINS_FEEDBACK_SECTIONS } from './GainsDemoPage.jsx'
import '../styles/gains-tokens.css'

const BASE = '/long-light/zone4'
const POND_SOUNDSCAPE = '/long-light/audio/mindfulness/soundscape.mp3'
const MASK_SRC = `${BASE}/gear/oxygen-mask.webp`

// Spark's lines (voice F), VERBATIM from
// `Gains for Teens/Walkable Zones/Zone 4 — Spark Voice Lines (voice F).md`.
const LINES = {
  welcome: { file: 'z4-00-welcome.mp3', text: 'Welcome to the Bright Reaches.' },
  arrive: {
    file: 'z4-01-arrive.mp3',
    text: "Oh — something's different about you. It's like the light inside you is brighter. Come over here — I want to tell you about what therapy is actually like.",
  },
  followMe: {
    file: 'z4-02-follow-me.mp3',
    text: "Follow me! I've got an idea for an activity we can do now. There's a calm little pond just up the path.",
  },
  ready: {
    file: 'z4-03-ready.mp3',
    text: "You've got your Oxygen Mask now. I think you're ready to keep climbing — the air gets thin up there, and it'll help you breathe. Head for the path up toward Mount Hope.",
  },
  exitTransition: {
    file: 'z4-04-exit-transition.mp3',
    text: "We're headed for Mount Hope! Here's how the climb works. Steer with one thumb. Collect the glowing gold feelings to keep your Second Wind up. And when a heavy feeling blocks your path, tap it to fire your Focusing Lens — it'll show you what it is, and turn it into light. Ready? Let's go.",
  },
  redirectPond: { file: 'z4-05-redirect-pond-first.mp3', text: 'Hold on — come find me first. I want to tell you something.' },
  redirectExitVideo: { file: 'z4-06-redirect-exit-before-video.mp3', text: 'Not yet! Come talk to me before you head up.' },
  redirectExitActivity: {
    file: 'z4-07-redirect-exit-before-activity.mp3',
    text: "The mountain's too high right now — you'll need an Oxygen Mask to breathe up there. Let's go to the pond first.",
  },
}

const SFX_PRELOAD = ['step-stone-1', 'step-stone-2', 'step-stone-3', 'step-grass-1', 'step-grass-2', 'step-grass-3', 'chime-unlock', 'spark-whoosh', 'ui-tap', 'equip-flash', 'arrive-swell']

const REDIRECT_COOLDOWN_MS = 4000
const TITLE_CARD_MS = 2600
// Soft-bloom crossfade: the veil rises, the scene swaps under it at the
// peak, the veil melts away.
const BLOOM_IN_MS = 380

export default function GainsZone4Page() {
  const [scene, setScene] = useState('intro') // intro|walk|video|activity|gear|transition|climb|end
  const [started, setStarted] = useState(false) // the walk has begun (post title card)
  const [showTitle, setShowTitle] = useState(false)
  const [veil, setVeil] = useState(false)
  const [muted, setMuted] = useState(false)
  const [bubble, setBubble] = useState(null) // { text, visible }
  const [progress, setProgressState] = useState({ talked: false, watched: false, didActivity: false, exitUnlocked: false, leveledUp: false })
  const [maskEquipped, setMaskEquipped] = useState(false)
  const [maskFly, setMaskFly] = useState(0)
  const [runKey, setRunKey] = useState(0) // bumps to remount the stage on Play again

  const frameRef = useRef(null)
  const stageRef = useRef(null)
  const audioRef = useRef(null)
  const timersRef = useRef([])
  const lastRedirectRef = useRef(0)
  const progressRef = useRef(progress)
  progressRef.current = progress
  const sceneRef = useRef(scene)
  sceneRef.current = scene

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    const prev = document.title
    document.title = 'GAINS for Teens — Zone 4: The Bright Reaches (walkable prototype)'
    return () => {
      document.title = prev
    }
  }, [])

  // One audio manager per page visit.
  useEffect(() => {
    const a = createZoneAudio({ base: BASE, pondUrl: POND_SOUNDSCAPE })
    audioRef.current = a
    return () => {
      timersRef.current.forEach(clearTimeout)
      a.dispose()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.setMuted(muted)
  }, [muted])

  // The beds belong to the walk; the video, activity and climb bring their
  // own sound.
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (scene === 'walk' && started) a.startBeds()
    else a.stopBeds()
  }, [scene, started])

  function later(fn, ms) {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }

  function setProgress(patch) {
    setProgressState((p) => ({ ...p, ...patch }))
  }

  const say = useCallback((key) => {
    const line = LINES[key]
    const a = audioRef.current
    if (!line) return Promise.resolve()
    setBubble({ text: line.text, visible: true })
    const p = a ? a.speak(line.file) : Promise.resolve()
    return p.then(() => {
      setBubble((b) => (b && b.text === line.text ? { ...b, visible: false } : b))
    })
  }, [])

  function transitionTo(next, after) {
    setVeil(true)
    later(() => {
      setScene(next)
      if (after) after()
      later(() => setVeil(false), 120)
    }, BLOOM_IN_MS)
  }

  // ---- Begin: the audio-unlock gesture, then the arrival beat ----
  function begin() {
    const a = audioRef.current
    if (a) {
      a.unlock()
      a.preloadSfx(SFX_PRELOAD)
      a.sfx('arrive-swell')
    }
    setScene('walk')
    setShowTitle(true)
    say('welcome')
    later(() => {
      setShowTitle(false)
      setStarted(true)
      say('arrive')
    }, TITLE_CARD_MS)
  }

  // ---- gating ----
  function redirect(key) {
    const now = Date.now()
    if (now - lastRedirectRef.current < REDIRECT_COOLDOWN_MS) return
    lastRedirectRef.current = now
    say(key)
  }

  function handleTap(target) {
    const p = progressRef.current
    if (target === 'spark') {
      // "Where do I go?" — after the first talk, Spark replays the objective.
      if (p.talked) redirect(p.didActivity ? 'ready' : 'followMe')
    } else if (target === 'pond') {
      if (!p.watched) redirect('redirectPond')
    } else if (target === 'exit') {
      if (!p.watched) redirect('redirectExitVideo')
      else if (!p.didActivity) redirect('redirectExitActivity')
    }
  }

  function handleArrive(target) {
    const p = progressRef.current
    if (sceneRef.current !== 'walk') return
    if (target === 'spark' && !p.talked) {
      setProgress({ talked: true })
      audioRef.current?.stopSpeech()
      setBubble(null)
      transitionTo('video')
    } else if (target === 'pond' && p.watched && !p.didActivity) {
      audioRef.current?.stopSpeech()
      setBubble(null)
      transitionTo('activity')
    } else if (target === 'exit' && p.exitUnlocked) {
      audioRef.current?.stopSpeech()
      setBubble(null)
      transitionTo('transition', () => {
        say('exitTransition').then(() => {
          if (sceneRef.current === 'transition') transitionTo('climb')
        })
      })
    }
  }

  const onZoneEvent = useCallback((evt) => {
    const a = audioRef.current
    switch (evt.type) {
      case 'step':
        if (a) a.sfx(`step-${evt.surface}-${1 + Math.floor(Math.random() * 3)}`)
        break
      case 'proximity':
        if (a) a.setPond(evt.pond)
        break
      case 'sfx':
        if (a) a.sfx(evt.name)
        break
      case 'tap':
        if (evt.target) handleTap(evt.target)
        break
      case 'arrive':
        if (evt.target) handleArrive(evt.target)
        break
      default:
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- hand-offs back into the walk ----
  function onVideoEnded() {
    setProgress({ watched: true })
    transitionTo('walk', () => {
      audioRef.current?.sfx('chime-unlock')
      stageRef.current?.sparkGlideTo('pond')
      say('followMe')
    })
  }

  function onActivityComplete({ leveledUp } = {}) {
    setProgress({ leveledUp: !!leveledUp })
    transitionTo('gear')
  }

  function onGearEquip() {
    audioRef.current?.sfx('equip-flash')
    setMaskEquipped(true)
    setMaskFly((n) => n + 1)
  }

  function onGearContinue() {
    setProgress({ didActivity: true, exitUnlocked: true })
    transitionTo('walk', () => {
      audioRef.current?.sfx('chime-unlock')
      stageRef.current?.lightPath()
      say('ready')
    })
  }

  function onClimbComplete() {
    transitionTo('end')
  }

  function playAgain() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    audioRef.current?.stopSpeech()
    setBubble(null)
    setProgressState({ talked: false, watched: false, didActivity: false, exitUnlocked: false, leveledUp: false })
    setMaskEquipped(false)
    setStarted(false)
    setShowTitle(false)
    setRunKey((k) => k + 1)
    setScene('intro')
  }

  const zoneProgress = useMemo(
    () => ({
      spark: progress.talked ? 'done' : 'active',
      pond: !progress.watched ? 'locked' : progress.didActivity ? 'done' : 'active',
      exit: progress.exitUnlocked ? 'active' : 'locked',
      sparkMode: progress.watched ? 'companion' : 'waiting',
    }),
    [progress],
  )

  const stageMounted = scene !== 'climb' && scene !== 'end'
  const walkPaused = scene !== 'walk' || showTitle
  const hudVisible = started && scene !== 'intro' && scene !== 'climb' && scene !== 'end'

  return (
    <DemoPageLayout
      banner={false}
      homeTo="/gains-demo"
      homeLabel="GAINS for Teens · Demo"
      footerPath="/gains-demo/zone4"
      feedbackProgram="gains-teens"
      feedbackSections={GAINS_FEEDBACK_SECTIONS}
      feedbackDefaultSection="review-zone4"
    >
      <div className="mb-4">
        <Link to="/gains-demo" className="inline-flex items-center gap-1 text-ctac-teal-700 hover:text-ctac-teal-900 text-[13px] font-medium">
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to GAINS demo
        </Link>
      </div>

      <section className="mb-5">
        <h1 className="text-[24px] font-bold text-slate-800 mb-1">Zone 4: The Bright Reaches — walkable zone</h1>
        <p className="text-[14px] text-slate-600 leading-relaxed max-w-[620px]">
          Our first walkable zone. Move through the Bright Reaches like a game: find Spark, watch the video,
          follow Spark to the pond for the Mindful Place, earn and equip your Oxygen Mask, then head for the
          exit and climb toward Mount Hope. Everything happens inside the one phone frame. Tap the ground to
          move; tap Spark, the pond, or the exit to interact. Spark will redirect you if you try something
          too early. Art, sound, and feel are prototype-stage.
        </p>
      </section>

      <div className="gains-theme">
        <div className="mx-auto w-full max-w-[420px]">
          <div
            ref={frameRef}
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: '9 / 16',
              borderRadius: 'var(--radius-2xl)',
              border: '1px solid var(--border-soft)',
              boxShadow: 'var(--shadow-lg)',
              background: 'var(--surface-abyss)',
              fontFamily: 'var(--font-core)',
            }}
          >
            {/* The walkable world: mounted from intro through transition so
                its state persists under the in-frame scenes. */}
            {stageMounted && (
              <div className="absolute inset-0">
                <ZoneStage
                  key={runKey}
                  ref={stageRef}
                  base={BASE}
                  reducedMotion={reducedMotion}
                  onEvent={onZoneEvent}
                  progress={zoneProgress}
                  paused={walkPaused}
                  started={started}
                />
              </div>
            )}

            {hudVisible && <GearHud maskEquipped={maskEquipped} maskSrc={MASK_SRC} flyIn={maskFly} frameRef={frameRef} />}

            {scene === 'walk' && <SparkBubble text={bubble?.text} visible={!!bubble?.visible} />}

            {/* Intro: the Begin tap (audio unlock). */}
            {scene === 'intro' && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-7"
                style={{ background: 'linear-gradient(180deg, rgba(2,17,39,.55) 0%, rgba(2,17,39,.78) 60%, rgba(2,17,39,.92) 100%)' }}
              >
                <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--text-warm)', marginBottom: 12 }} />
                <div className="text-[11px] font-extrabold uppercase mb-2" style={{ letterSpacing: 'var(--tracking-caps)', color: 'var(--text-warm)' }}>
                  Zone 4
                </div>
                <h2 className="text-[26px] font-extrabold mb-3" style={{ color: 'var(--text-bright)' }}>
                  The Bright Reaches
                </h2>
                <p className="text-[14px] leading-relaxed mb-6 max-w-[290px]" style={{ color: 'var(--text-body)' }}>
                  Tap the path to move. Tap Spark, the pond, or the way up to interact. Spark will guide you.
                </p>
                <GainsButton size="lg" onClick={begin}>
                  Begin
                </GainsButton>
                <p className="text-[12px] mt-4" style={{ color: 'var(--text-faint)' }}>
                  Best with sound on 🔊
                </p>
              </div>
            )}

            {/* Arrival title card, over a light veil that fades to the world. */}
            {scene === 'walk' && showTitle && (
              <div
                className="absolute inset-0 flex items-center justify-center text-center px-6 z-20"
                style={{ background: 'radial-gradient(120% 90% at 50% 40%, rgba(255,247,234,.92) 0%, rgba(253,230,138,.7) 45%, rgba(245,153,110,.35) 100%)', animation: 'z4-title-veil 2.6s var(--ease-soft) both' }}
              >
                <div style={{ animation: 'sm-rise var(--dur-slow) var(--ease-settle) both' }}>
                  <div className="text-[12px] font-extrabold uppercase mb-2" style={{ letterSpacing: 'var(--tracking-caps)', color: 'var(--amber-700)' }}>
                    Zone 4
                  </div>
                  <h2 className="text-[30px] font-extrabold leading-tight" style={{ color: 'var(--text-on-warm)' }}>
                    Welcome to the Bright Reaches
                  </h2>
                </div>
              </div>
            )}

            {/* ---- Phase A stubs: each advances the state so the loop is
                testable before the real hand-offs land in Phase B. ---- */}
            {scene === 'video' && (
              <StubScene
                eyebrow="Video 4"
                title="What Therapy Feels Like"
                body="Video 4 plays here (Phase B: the Vimeo player, in-frame). Continuing…"
                onDone={onVideoEnded}
              />
            )}
            {scene === 'activity' && (
              <StubScene
                eyebrow="Zone 4 · Mindfulness"
                title="Mindful Place"
                body="The Mindful Place activity runs here (Phase B). Continuing…"
                onDone={() => onActivityComplete({ leveledUp: false })}
              />
            )}
            {scene === 'gear' && (
              <StubScene
                eyebrow="Gear earned"
                title="Oxygen Mask"
                body="The Gear Award sequence goes here (Phase B). Continuing…"
                onDone={() => {
                  onGearEquip()
                  later(onGearContinue, 900)
                }}
              />
            )}
            {scene === 'transition' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20" style={{ background: 'var(--veil-bottom)' }}>
                <div style={{ animation: 'sm-bloom var(--dur-bloom) var(--ease-bloom) both' }}>
                  <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--text-warm)', margin: '0 auto 12px' }} />
                  <h2 className="text-[28px] font-extrabold mb-3" style={{ color: 'var(--text-bright)' }}>
                    We&apos;re headed for Mount Hope!
                  </h2>
                  <p className="text-[14px] leading-relaxed max-w-[300px] mx-auto" style={{ color: 'var(--text-body)' }}>
                    {LINES.exitTransition.text}
                  </p>
                </div>
              </div>
            )}
            {scene === 'climb' && (
              <StubScene
                eyebrow="The Ascent"
                title="Climb to the Beacon"
                body="The Ascent climb runs here, in-frame (Phase B). Continuing…"
                onDone={onClimbComplete}
              />
            )}
            {scene === 'end' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style={{ background: 'var(--sky-beacon)' }}>
                <div style={{ animation: 'sm-bloom var(--dur-bloom) var(--ease-bloom) both' }}>
                  <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--text-on-warm)', margin: '0 auto 12px' }} />
                  <h2 className="text-[26px] font-extrabold mb-2" style={{ color: 'var(--text-on-warm)' }}>
                    You reached the Beacon.
                  </h2>
                  <p className="text-[14px] mb-6" style={{ color: 'rgba(58,29,5,.8)' }}>Zone 5 · to be continued</p>
                  <GainsButton onClick={playAgain} iconLeft={<RotateCcw size={16} strokeWidth={2} />}>
                    Play again
                  </GainsButton>
                </div>
              </div>
            )}

            {/* Soft-bloom crossfade veil. */}
            <div
              className="absolute inset-0 z-30"
              style={{
                pointerEvents: 'none',
                background: 'radial-gradient(110% 80% at 50% 45%, rgba(255,247,234,.98) 0%, rgba(253,230,138,.9) 40%, rgba(245,153,110,.75) 100%)',
                opacity: veil ? 1 : 0,
                transition: veil ? `opacity ${BLOOM_IN_MS}ms var(--ease-soft)` : 'opacity 900ms var(--ease-bloom)',
              }}
            />

            {scene !== 'intro' && scene !== 'end' && (
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? 'Unmute' : 'Mute'}
                className="absolute z-40 p-2 rounded-full"
                style={{ top: 10, right: 10, background: 'rgba(2,17,39,.45)', color: 'var(--text-bright)' }}
              >
                {muted ? <VolumeX size={18} strokeWidth={1.75} /> : <Volume2 size={18} strokeWidth={1.75} />}
              </button>
            )}
          </div>

          {scene !== 'intro' && (
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={playAgain}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full px-5 py-2 min-h-[40px] text-[13px]"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                <RotateCcw size={14} strokeWidth={2} />
                Restart the zone
              </button>
            </div>
          )}

          <p className="text-center text-[12px] text-slate-400 mt-3" style={{ fontFamily: 'system-ui, sans-serif' }}>
            Prototype · not yet wired into the session flow · reduced-motion supported
          </p>
        </div>
      </div>

      <style>{`
        @keyframes z4-title-veil { 0% { opacity: 1 } 70% { opacity: 1 } 100% { opacity: 0 } }
      `}</style>
    </DemoPageLayout>
  )
}

// Phase A placeholder for an in-frame scene: shows what will live here, then
// advances after a beat so the surrounding loop can be exercised.
function StubScene({ eyebrow, title, body, onDone, delayMs = 1600 }) {
  useEffect(() => {
    const id = setTimeout(onDone, delayMs)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-7 z-20" style={{ background: 'var(--surface-sheet)', backdropFilter: 'var(--blur-sheet)' }}>
      <div style={{ animation: 'sm-bloom var(--dur-bloom) var(--ease-bloom) both' }}>
        <div className="text-[11px] font-extrabold uppercase mb-2" style={{ letterSpacing: 'var(--tracking-caps)', color: 'var(--text-warm)' }}>
          {eyebrow}
        </div>
        <h2 className="text-[24px] font-extrabold mb-3" style={{ color: 'var(--text-bright)' }}>
          {title}
        </h2>
        <p className="text-[14px] leading-relaxed max-w-[280px] mx-auto" style={{ color: 'var(--text-muted)' }}>
          {body}
        </p>
      </div>
    </div>
  )
}
