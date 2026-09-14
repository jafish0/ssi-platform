// Generic walkable-zone page (GAINS Draft 68, genericized Draft 80): one
// 9:16 phone frame, and EVERYTHING happens inside it. A scene-state machine
// runs the loop:
//
//   intro ─Begin─▶ walk ─tap Spark─▶ video ─ended─▶ walk (Spark follows)
//     ─tap station─▶ activity ─done─▶ gear (award) ─equip─▶ walk (exit lights
//     up) ─tap exit─▶ transition ─VO ends─▶ traversal ─done─▶ end
//     ─Play again─▶ intro
//
// Progression lives HERE (talkedToSpark → watchedVideo → didActivity →
// exitUnlocked); the Phaser scene (ZoneStage / zoneWalkScene) only renders,
// moves the Traveler and reports taps/arrivals. Wrong-order taps get Spark's
// voiced redirects instead of greyed-out UI.
//
// Everything that differs zone to zone -- the plate, Spark's lines, the
// station's activity, the zone's own gear, which traversal ends it, the end
// card -- comes in through the `zone` config (`zone/zones.js`); this file is
// the one template both Zone 3 and Zone 4 run on (`GainsZone3Page` /
// `GainsZone4Page` are thin wrappers picking a config). The Phaser scene's
// own plate-specific geometry (spots, polygons, waypoints) lives alongside
// it in `zoneWalkScene.js`, selected by `zone.id`.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react'
import FeedbackButton from '../components/FeedbackButton.jsx'
import FullscreenStage from '../components/gains/zone/FullscreenStage.jsx'
import TraversalGame from '../components/TraversalGame.jsx'
import GearAward from '../components/gains/GearAward.jsx'
import ZoneStage from '../components/gains/zone/ZoneStage.jsx'
import GearHud from '../components/gains/zone/GearHud.jsx'
import SparkBubble from '../components/gains/zone/SparkBubble.jsx'
import VideoScene from '../components/gains/zone/VideoScene.jsx'
import ZoneOverlays from '../components/gains/zone/ZoneOverlays.jsx'
import { createZoneAudio } from '../components/gains/zone/zoneAudio.js'
import GainsButton from '../components/gains/ds/Button.jsx'
import { GAINS_FEEDBACK_SECTIONS } from './GainsDemoPage.jsx'
import '../styles/gains-tokens.css'

// Tester-only skips (video, activity): dev builds, or `?dev` on the URL.
// Never shown to kids in the real flow.
const DEV_SKIP =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) ||
  (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('dev'))

const REDIRECT_COOLDOWN_MS = 4000
const TITLE_CARD_MS = 2600
// Soft-bloom crossfade: the veil rises, the scene swaps under it at the
// peak, the veil melts away.
const BLOOM_IN_MS = 380

export default function GainsZonePage({ zone }) {
  const [scene, setScene] = useState('intro') // intro|walk|video|activity|gear|transition|climb|end
  const [started, setStarted] = useState(false) // the walk has begun (post title card)
  const [showTitle, setShowTitle] = useState(false)
  // 2026-09-03 (Josh): the Traveler can't move until Spark finishes the
  // arrive line -- the walk stays paused (and the tap hint waits) while the
  // arrive clip plays; a tap during the line does nothing.
  const [introLock, setIntroLock] = useState(false)
  const [veil, setVeil] = useState(false)
  // Draft 69: true from the moment a scene change starts until the veil
  // begins to lift. The walk scene is paused for the whole window, so a tap
  // landing during the bloom (e.g. tapping Spark again as you arrive) can't
  // trigger anything -- that's how "follow me" was firing on the Spark tap.
  const [transitioning, setTransitioning] = useState(false)
  const transitioningRef = useRef(false)
  const [muted, setMuted] = useState(false)
  const [bubble, setBubble] = useState(null) // { text, visible }
  const [progress, setProgressState] = useState({ talked: false, watched: false, didActivity: false, exitUnlocked: false, leveledUp: false })
  const [gearEquipped, setGearEquipped] = useState(false)
  const [gearFly, setGearFly] = useState(0)
  const [travResult, setTravResult] = useState(null)
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

  const ActivityComponent = zone.ActivityComponent

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    const prev = document.title
    document.title = zone.docTitle
    return () => {
      document.title = prev
    }
  }, [zone.docTitle])

  // One audio manager per page visit.
  useEffect(() => {
    const a = createZoneAudio({ base: zone.base, sfxBase: zone.sfxBase, pondUrl: zone.pondSoundscapeUrl })
    audioRef.current = a
    return () => {
      timersRef.current.forEach(clearTimeout)
      a.dispose()
      audioRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone.id])

  useEffect(() => {
    if (audioRef.current) audioRef.current.setMuted(muted)
  }, [muted])

  // The beds belong to the walk; the video, activity and traversal bring
  // their own sound.
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

  const say = useCallback(
    (key) => {
      const line = zone.vo[key]
      const a = audioRef.current
      if (!line) return Promise.resolve()
      setBubble({ text: line.text, visible: true })
      const p = a ? a.speak(line.file) : Promise.resolve()
      return p.then(() => {
        setBubble((b) => (b && b.text === line.text ? { ...b, visible: false } : b))
      })
    },
    [zone.vo],
  )

  function transitionTo(next, after) {
    transitioningRef.current = true
    setTransitioning(true)
    setVeil(true)
    later(() => {
      setScene(next)
      if (after) after()
      later(() => {
        setVeil(false)
        transitioningRef.current = false
        setTransitioning(false)
      }, 120)
    }, BLOOM_IN_MS)
  }

  // ---- Begin: the audio-unlock gesture, then the arrival beat ----
  function begin() {
    const a = audioRef.current
    if (a) {
      a.unlock()
      a.preloadSfx(zone.sfxPreload)
      a.sfx('ui-tap')
      a.sfx('arrive-swell')
    }
    setScene('walk')
    setShowTitle(true)
    say('welcome')
    later(() => {
      setShowTitle(false)
      setStarted(true)
      // Spark is the first active objective: the same chime every objective
      // gets when it lights up.
      audioRef.current?.sfx('chime-unlock')
      // Hold the walk until Spark has finished speaking (resolves at once if
      // the clip can't play, so nobody is ever stuck).
      setIntroLock(true)
      say('arrive').then(() => setIntroLock(false))
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
    if (sceneRef.current !== 'walk' || transitioningRef.current) return
    if (target === 'spark') {
      // "Where do I go?" — once the video's been watched, Spark replays the
      // current objective. Between the first talk and the video's end there
      // is no objective line yet (Draft 69: this used to key off `talked`,
      // which let "follow me" fire on the Spark tap itself).
      if (p.watched) redirect(p.didActivity ? 'ready' : 'followMe')
    } else if (target === 'pond') {
      if (!p.watched) redirect('redirectStation')
    } else if (target === 'exit') {
      if (!p.watched) redirect('redirectExitVideo')
      else if (!p.didActivity) redirect('redirectExitActivity')
    }
  }

  function handleArrive(target) {
    const p = progressRef.current
    if (sceneRef.current !== 'walk' || transitioningRef.current) return
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

  function onActivityComplete(result) {
    setProgress({ leveledUp: !!(result && result.leveledUp) })
    // 2026-09-03 (Josh): the equip sound also marks RECEIVING the gear -- it
    // plays as the Gear Award reveal blooms in, and again on Equip.
    transitionTo('gear', () => audioRef.current?.sfx('equip-flash'))
  }

  function onGearEquip() {
    const a = audioRef.current
    if (a) {
      a.sfx('ui-tap')
      later(() => a.sfx('equip-flash'), 120)
    }
    setGearEquipped(true)
    setGearFly((n) => n + 1)
  }

  function onGearContinue() {
    setProgress({ didActivity: true, exitUnlocked: true })
    transitionTo('walk', () => {
      audioRef.current?.sfx('chime-unlock')
      stageRef.current?.lightPath()
      say('ready')
    })
  }

  function onTraversalComplete(result) {
    setTravResult(result || null)
    transitionTo('end')
  }

  function playAgain() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    audioRef.current?.stopSpeech()
    setBubble(null)
    setProgressState({ talked: false, watched: false, didActivity: false, exitUnlocked: false, leveledUp: false })
    setGearEquipped(false)
    setTravResult(null)
    setIntroLock(false)
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
  const walkPaused = scene !== 'walk' || showTitle || transitioning || introLock
  // The scene's own "begin" (camera settle + tap hint) waits for the arrive
  // line too, so the hint doesn't invite a tap that would be ignored.
  const walkBegun = started && !introLock
  const hudVisible = started && scene !== 'intro' && scene !== 'climb' && scene !== 'end'

  return (
    <FullscreenStage section={zone.feedbackSection} onRestart={playAgain} showRestart={scene !== 'intro'} frameRef={frameRef}>
      <>
        {/* The walkable world: mounted from intro through transition so its
            state persists under the in-frame scenes. */}
        {stageMounted && (
          <div className="absolute inset-0">
            <ZoneStage
              key={runKey}
              ref={stageRef}
              zoneId={zone.id}
              base={zone.base}
              spriteBase={zone.spriteBase}
              frogUrl={zone.frogUrl}
              reducedMotion={reducedMotion}
              onEvent={onZoneEvent}
              progress={zoneProgress}
              paused={walkPaused}
              started={walkBegun}
            />
          </div>
        )}

        {/* Phase C: the Claude Design ambient layers over the plate. Faded
            out under the in-frame scenes, gone with the stage. */}
        {stageMounted && <ZoneOverlays base={zone.base} layers={zone.overlayLayers} visible={scene === 'walk' || scene === 'transition'} />}

        {hudVisible && <GearHud earned={zone.gearEarnedBefore} newKey={zone.gear.gearKey} iconSrc={zone.gear.itemSrc} equipped={gearEquipped} flyIn={gearFly} frameRef={frameRef} />}

        {scene === 'walk' && <SparkBubble text={bubble?.text} visible={!!bubble?.visible} />}

        {/* Intro: the Begin tap (audio unlock). */}
        {scene === 'intro' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-7"
            style={{ background: 'linear-gradient(180deg, rgba(2,17,39,.55) 0%, rgba(2,17,39,.78) 60%, rgba(2,17,39,.92) 100%)' }}
          >
            <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--text-warm)', marginBottom: 12 }} />
            <div className="text-[11px] font-extrabold uppercase mb-2" style={{ letterSpacing: 'var(--tracking-caps)', color: 'var(--text-warm)' }}>
              {zone.eyebrow}
            </div>
            <h2 className="text-[26px] font-extrabold mb-3" style={{ color: 'var(--text-bright)' }}>
              {zone.introTitle}
            </h2>
            <p className="text-[14px] leading-relaxed mb-6 max-w-[290px]" style={{ color: 'var(--text-body)' }}>
              {zone.introInstructions}
            </p>
            <GainsButton size="lg" onClick={begin}>
              Begin
            </GainsButton>
            <p className="text-[12px] mt-4" style={{ color: 'var(--text-body)' }}>
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
                {zone.eyebrow}
              </div>
              <h2 className="text-[30px] font-extrabold leading-tight" style={{ color: 'var(--text-on-warm)' }}>
                {zone.welcomeTitle}
              </h2>
            </div>
          </div>
        )}

        {/* Spark → the zone's video, in-frame; `ended` blooms back to the world. */}
        {scene === 'video' && <VideoScene id={zone.video.id} h={zone.video.h} title={zone.video.title} onEnded={onVideoEnded} allowSkip={DEV_SKIP} />}

        {/* Station → the zone's activity; its close screen hands off via
            onComplete (leveledUp if the activity supports it). */}
        {scene === 'activity' && (
          <div className="absolute inset-0 z-20">
            <ActivityComponent onComplete={onActivityComplete} />
            {DEV_SKIP && (
              <button
                type="button"
                onClick={() => onActivityComplete({ leveledUp: false })}
                className="absolute z-30 rounded-full px-3 py-1.5 text-[11px] font-bold"
                style={{ top: 12, right: 56, background: 'rgba(2,17,39,.6)', color: 'var(--text-body)', border: '1px solid var(--border-soft)' }}
              >
                Skip (testers)
              </button>
            )}
          </div>
        )}

        {/* Gear Award: reveal → Equip → equipped figure → Continue. */}
        {scene === 'gear' && (
          <GearAward
            name={zone.gear.name}
            itemSrc={zone.gear.itemSrc}
            equippedSrc={zone.gear.equippedSrc}
            title={progress.leveledUp ? zone.gear.leveledUpTitle || zone.gear.title : zone.gear.title}
            subline={zone.gear.subline}
            sparkLine={zone.gear.sparkLine}
            leveledUp={progress.leveledUp}
            equipLabel={zone.gear.equipLabel}
            onEquip={onGearEquip}
            onContinue={onGearContinue}
          />
        )}
        {scene === 'transition' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20" style={{ background: 'var(--veil-bottom)' }}>
            <div style={{ animation: 'sm-bloom var(--dur-bloom) var(--ease-bloom) both' }}>
              <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--text-warm)', margin: '0 auto 12px' }} />
              <h2 className="text-[28px] font-extrabold mb-3" style={{ color: 'var(--text-bright)' }}>
                {zone.transitionHeading}
              </h2>
              <p className="text-[14px] leading-relaxed max-w-[300px] mx-auto" style={{ color: 'var(--text-body)' }}>
                {zone.vo.exitTransition.text}
              </p>
            </div>
          </div>
        )}
        {/* The zone's traversal, in-frame, started straight away (the exit
            tap was the gesture; the transition VO just carried the
            directions). The walk stage is unmounted underneath so only one
            WebGL context is live. */}
        {scene === 'climb' && (
          <div className="absolute inset-0 z-20" style={{ background: '#05070e' }}>
            <TraversalGame mode={zone.traversalMode} started muted={muted} reducedMotion={reducedMotion} onComplete={onTraversalComplete} />
          </div>
        )}

        {scene === 'end' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style={{ background: zone.endCard.background }}>
            <div style={{ animation: 'sm-bloom var(--dur-bloom) var(--ease-bloom) both' }}>
              <Sparkles size={30} strokeWidth={1.5} style={{ color: zone.endCard.textColor, margin: '0 auto 12px' }} />
              <h2 className="text-[26px] font-extrabold mb-2" style={{ color: zone.endCard.textColor }}>
                {zone.endCard.heading}
              </h2>
              {travResult && zone.traversalMode === 'climb' && typeof travResult.orbsCollected === 'number' && (
                <p className="text-[14px] mb-1" style={{ color: zone.endCard.subTextColor }}>
                  You gathered <strong>{travResult.orbsCollected}</strong> gold {travResult.orbsCollected === 1 ? 'feeling' : 'feelings'} on the way up
                  {typeof travResult.feelingsCleared === 'number' && travResult.feelingsCleared > 0
                    ? ` and faced ${travResult.feelingsCleared} heavy ${travResult.feelingsCleared === 1 ? 'one' : 'ones'}.`
                    : '.'}
                </p>
              )}
              {travResult && zone.traversalMode === 'flight' && typeof travResult.motesCollected === 'number' && (
                <p className="text-[14px] mb-1" style={{ color: zone.endCard.subTextColor }}>
                  You gathered <strong>{travResult.motesCollected}</strong> {travResult.motesCollected === 1 ? 'connection' : 'connections'} on the flight across.
                </p>
              )}
              {zone.endCard.subtitle && (
                <p className="text-[14px] mb-6" style={{ color: zone.endCard.subTextColor }}>
                  {zone.endCard.subtitle}
                </p>
              )}
              {zone.endCard.nextHref && (
                <div className={zone.endCard.subtitle ? 'mb-5' : 'mt-2 mb-5'}>
                  <Link
                    to={zone.endCard.nextHref}
                    className="inline-flex items-center gap-2 font-semibold rounded-full px-4 py-2 min-h-[48px] text-[13px]"
                    style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
                  >
                    {zone.endCard.nextLabel}
                    <ArrowRight size={14} strokeWidth={2} />
                  </Link>
                </div>
              )}
              <GainsButton onClick={playAgain} iconLeft={<RotateCcw size={16} strokeWidth={2} />}>
                Play again
              </GainsButton>
              <div className="mt-5 flex justify-center">
                <FeedbackButton program="gains-teens" sections={GAINS_FEEDBACK_SECTIONS} defaultSection={zone.feedbackSection} label={`Comment on ${zone.eyebrow}`} subtle />
              </div>
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
      </>

      <style>{`
        @keyframes z4-title-veil { 0% { opacity: 1 } 70% { opacity: 1 } 100% { opacity: 0 } }
      `}</style>
    </FullscreenStage>
  )
}
