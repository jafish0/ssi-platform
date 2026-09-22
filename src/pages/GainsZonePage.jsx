// Generic walkable-zone page (GAINS Draft 68, genericized Draft 80, two-
// plate `introPlate` support added Draft 83). One 9:16 phone frame, and
// EVERYTHING happens inside it. A scene-state machine runs the loop:
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
// the one template Zones 1/3/4 all run on (`GainsZone1Page`/`GainsZone3Page`/
// `GainsZone4Page` are thin wrappers picking a config). The Phaser scene's
// own plate-specific geometry (spots, polygons, waypoints) lives alongside
// it in `zoneWalkScene.js`, selected by a zoneId.
//
// Draft 83: `zone.introPlate` (Zone 1 only) adds one extra PHASE before the
// loop above -- a simpler plate where only Spark is interactable (no
// station/exit, no arrival lock, the walk cue shows immediately and Spark
// beckons on idle). Reaching Spark there plays the intro plate's own video;
// `ended` soft-bloom-cuts to the zone's MAIN plate and the loop above begins
// as normal (with the usual arrival lock + `arrive` line). Zones without
// `introPlate` skip this phase entirely and are unaffected.

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
// Draft 83: how long the intro plate waits with no movement before Spark
// beckons again.
const BECKON_IDLE_MS = 8000
// Draft 90 (item 14): the flight track used to only start loading once
// TraversalGame's own scene mounted (well after the exit tap), which on a
// cold cache read as ~10s of silence before the music caught up. Kicking
// off a plain browser fetch as soon as the exit unlocks gives it a head
// start; by the time the traversal actually mounts, Phaser's own loader
// (same URL) hits a warm HTTP cache instead of a cold network fetch.
const TRAVERSAL_MUSIC_PRELOAD = {
  flight: '/gains/traversal/audio/music-ascent-loop.mp3',
  climb: '/gains/climb/audio/climb-music.mp3',
}

// Draft 90 (item 1): a small floating "Tap here" pointer over whichever
// target is currently the one thing to do -- Spark on arrival, the station
// after follow-me, the exit after the gear award. Positioned by percentage
// against the 1080x1920 logical canvas (the phone frame is always exactly
// 9:16, so it lines up with the Phaser world without needing a live bridge
// to the scene). Coordinates are each plate's own `sparkStand`/`pond`/
// `exitStand` spot from zoneWalkScene.js's per-zone geometry.
const POINTER_SPOTS = {
  zone1intro: { spark: { x: 700, y: 260 } },
  zone1main: { spark: { x: 460, y: 1300 }, pond: { x: 586, y: 563 }, exit: { x: 740, y: 220 } },
  zone3: { spark: { x: 540, y: 1200 }, pond: { x: 760, y: 930 }, exit: { x: 600, y: 470 } },
  zone4: { spark: { x: 412, y: 1128 }, pond: { x: 770, y: 862 }, exit: { x: 400, y: 532 } },
}

function TapHerePointer({ x, y }) {
  return (
    <div
      className="absolute z-10 flex flex-col items-center"
      style={{
        left: `${(x / 1080) * 100}%`,
        top: `${(y / 1920) * 100}%`,
        transform: 'translate(-50%, calc(-100% - 14px))',
        pointerEvents: 'none',
        animation: 'gz-tap-here-bob 1.6s ease-in-out infinite',
      }}
    >
      <span
        className="rounded-full px-3 py-1.5 text-[12px] font-bold whitespace-nowrap"
        style={{ background: 'var(--action-quiet)', color: 'var(--text-bright)', border: '1px solid var(--border-warm)', boxShadow: 'var(--glow-sm)' }}
      >
        Tap here
      </span>
      <span
        className="mt-1"
        style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '7px solid var(--action-quiet)' }}
      />
    </div>
  )
}

export default function GainsZonePage({ zone }) {
  const [scene, setScene] = useState('intro') // intro|walk|video|activity|gear|transition|climb|end
  const [started, setStarted] = useState(false) // the walk has begun (post title card)
  const [showTitle, setShowTitle] = useState(false)
  // 2026-09-03 (Josh): the Traveler can't move until Spark finishes the
  // arrive line -- the walk stays paused (and the tap hint waits) while the
  // arrive clip plays; a tap during the line does nothing. Draft 83: the
  // intro plate never sets this (movement is available the moment the walk
  // cue shows) -- only the main-plate arrival still locks.
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
  const [runKey, setRunKey] = useState(0) // bumps to remount the stage on Play again / plate switch
  // Draft 90 (item 10): a brief one-line instruction card the moment the
  // First Light traversal mounts inside a zone (the standalone
  // /gains-demo/firstlight page has its own pre-Begin instructions screen;
  // this covers the in-zone hand-off, which has none).
  const [travHint, setTravHint] = useState(false)
  // Draft 90 (item 1): which "Tap here" target the player has already
  // tapped once -- cleared implicitly whenever the active target moves on
  // (see pointerTarget below), so a NEW target always gets its own pointer.
  const [dismissedTarget, setDismissedTarget] = useState(null)
  // Draft 83: which plate is live. Zones without `introPlate` never leave
  // 'main'.
  const [platePhase, setPlatePhase] = useState(zone.introPlate ? 'intro' : 'main')

  const frameRef = useRef(null)
  const stageRef = useRef(null)
  const audioRef = useRef(null)
  const timersRef = useRef([])
  const beckonTimerRef = useRef(null)
  const lastRedirectRef = useRef(0)
  // Draft 87: whether the current activity's own narration is playing
  // right now -- set imperatively via onNarrate, read by onActivityComplete
  // to hold the Gear Award transition until it's done.
  const narratingRef = useRef(false)
  // Draft 92 (item 3): gates GearAward's Equip button while its own
  // recorded sparkLine plays on the reveal screen.
  const [gearNarrating, setGearNarrating] = useState(false)
  const progressRef = useRef(progress)
  progressRef.current = progress
  const sceneRef = useRef(scene)
  sceneRef.current = scene
  // `say()`/the beckon timer are long-lived callbacks (stable across
  // renders) that still need the CURRENT phase, so they read this ref
  // rather than the `platePhase` state closed over at creation time.
  const platePhaseRef = useRef(platePhase)
  platePhaseRef.current = platePhase

  const ActivityComponent = zone.ActivityComponent
  const introActive = !!(zone.introPlate && platePhase === 'intro')
  const plateZoneId = introActive ? zone.introPlate.zoneId : zone.mainZoneId || zone.id
  const plateBase = introActive ? zone.introPlate.base : zone.base
  const plateMapFile = introActive ? zone.introPlate.mapFile : zone.mapFile
  const currentVideo = introActive ? zone.introPlate.video : zone.video

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
      clearTimeout(beckonTimerRef.current)
      a.dispose()
      audioRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone.id])

  useEffect(() => {
    if (audioRef.current) audioRef.current.setMuted(muted)
  }, [muted])

  // The beds belong to the walk; the video, activity and (usually) the
  // traversal bring their own sound. Draft 83: a zone can ask to keep its
  // own ambience running INTO the traversal instead (Zone 1 hands its
  // track over to The First Light rather than restarting it) -- `transition`
  // and `climb` count as "still playing" for a zone that opts in.
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const keepGoing = zone.continueAmbienceIntoTraversal && (scene === 'transition' || scene === 'climb')
    if ((scene === 'walk' && started) || keepGoing) a.startBeds()
    else a.stopBeds()
  }, [scene, started, zone.continueAmbienceIntoTraversal])

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
      const voSet = zone.introPlate && platePhaseRef.current === 'intro' ? zone.introPlate.vo : zone.vo
      const line = voSet[key]
      const a = audioRef.current
      if (!line) return Promise.resolve()
      setBubble({ text: line.text, visible: true })
      const p = a ? a.speak(line.file) : Promise.resolve()
      return p.then(() => {
        setBubble((b) => (b && b.text === line.text ? { ...b, visible: false } : b))
      })
    },
    [zone.vo, zone.introPlate],
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

  // Locks movement (taps ignored, the tap cue hidden -- Spark's own glide/
  // light-path gestures are untouched, since those are driven imperatively
  // and don't check this), plays the given line, unlocks once it finishes
  // (resolves at once if the clip can't play, so nobody's ever stuck).
  // Draft 87: used for every key Spark line a player could otherwise walk
  // off during -- arrive, follow-me, and ready -- in every zone alike. The
  // short redirect lines stay unlocked on purpose.
  function lockAndSay(key) {
    setIntroLock(true)
    return say(key).then(() => setIntroLock(false))
  }

  // Used for every MAIN-plate arrival -- the very first one for a one-plate
  // zone, or the cut-in from Plate 1 for a two-plate one.
  function lockAndArrive() {
    audioRef.current?.sfx('chime-unlock')
    lockAndSay('arrive')
  }

  // Draft 83: the intro plate's own settle -- no lock at all (the walk cue
  // shows immediately), Spark beckons once right away and again on ~8s of
  // idle until reached.
  function clearBeckonTimer() {
    clearTimeout(beckonTimerRef.current)
  }
  function armBeckonTimer() {
    clearBeckonTimer()
    if (!zone.introPlate || platePhaseRef.current !== 'intro' || progressRef.current.talked) return
    beckonTimerRef.current = setTimeout(() => {
      if (platePhaseRef.current === 'intro' && !progressRef.current.talked && sceneRef.current === 'walk' && !transitioningRef.current) {
        say('beckon').then(() => armBeckonTimer())
      }
    }, BECKON_IDLE_MS)
  }
  function settleIntoIntroWalk() {
    setStarted(true)
    say('beckon')
    armBeckonTimer()
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
      if (zone.introPlate && platePhaseRef.current === 'intro') settleIntoIntroWalk()
      else {
        setStarted(true)
        lockAndArrive()
      }
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
      // which let "follow me" fire on the Spark tap itself). On the intro
      // plate `watched` never becomes true, so a re-tap there is simply
      // silent -- there's nothing to replay before the video.
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
      clearBeckonTimer()
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
        // Draft 83: moving resets the intro plate's idle-beckon countdown
        // (a no-op once past the intro -- armBeckonTimer's own guard bails).
        armBeckonTimer()
        break
      case 'proximity':
        if (a) a.setPond(evt.pond)
        break
      case 'sfx':
        if (a) a.sfx(evt.name)
        break
      case 'tap':
        if (evt.target) {
          handleTap(evt.target)
          setDismissedTarget(evt.target)
        }
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
  // Draft 83: on the intro plate, the video's end doesn't lead back into
  // THIS plate's walk at all -- it cuts to the zone's main plate instead.
  function switchToMainPlate() {
    clearBeckonTimer()
    transitionTo('walk', () => {
      setPlatePhase('main')
      // lockAndArrive() below calls say('arrive') in this same tick, before
      // React re-renders and updates platePhaseRef itself (see the effect
      // above) -- without this, say() would still read the stale 'intro'
      // value and look up 'arrive' in introPlate.vo (no such key), silently
      // no-op the lock and the VO (Draft 84 bugfix).
      platePhaseRef.current = 'main'
      setProgressState({ talked: false, watched: false, didActivity: false, exitUnlocked: false, leveledUp: false })
      setDismissedTarget(null)
      setRunKey((k) => k + 1)
      lockAndArrive()
    })
  }

  function onVideoEnded() {
    if (zone.introPlate && platePhaseRef.current === 'intro') {
      switchToMainPlate()
      return
    }
    setProgress({ watched: true })
    transitionTo('walk', () => {
      audioRef.current?.sfx('chime-unlock')
      stageRef.current?.sparkGlideTo('pond')
      lockAndSay('followMe')
    })
  }

  // Draft 87: an activity's own closing narration (Body Mapping's "nice
  // noticing" line, Zone 3's gm-* lines) shouldn't get cut off by the Gear
  // Award mounting right under it. Generic here so any ActivityComponent
  // that reports its own narration state via onNarrate gets the same
  // courtesy -- +300ms once the clip actually ends, or a ~12s hard cap so
  // a stuck/failed clip can never block the zone forever.
  function onActivityComplete(result) {
    setProgress({ leveledUp: !!(result && result.leveledUp) })
    // 2026-09-03 (Josh): the equip sound also marks RECEIVING the gear -- it
    // plays as the Gear Award reveal blooms in, and again on Equip.
    const proceed = () => transitionTo('gear', () => audioRef.current?.sfx('equip-flash'))
    if (!narratingRef.current) {
      proceed()
      return
    }
    const deadline = Date.now() + 12000
    const poll = () => {
      if (!narratingRef.current) later(proceed, 300)
      else if (Date.now() >= deadline) proceed()
      else later(poll, 150)
    }
    poll()
  }

  // Draft 92 (item 3): voices the Spark bubble the moment the Gear Award
  // screen MOUNTS on its reveal stage (before Equip is tapped), through the
  // zone's own shared audio manager (already unlocked at Begin) rather than
  // a fresh, unproven `<audio>` element -- exactly the "route every clip
  // through the shared manager" fix the iOS audio-unlock sweep asked for.
  // Used to fire after Equip and gate Continue (Draft 90); Josh's post-90
  // replay flagged that as the wrong screen. Zones without a recorded line
  // for their gear simply skip this -- `gearNarrating` stays false.
  function onGearReveal() {
    const file = zone.gear.sparkLineAudio
    if (!file || !audioRef.current) return
    setGearNarrating(true)
    audioRef.current.speak(file).then(() => setGearNarrating(false))
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
    const preloadUrl = TRAVERSAL_MUSIC_PRELOAD[zone.traversalMode]
    if (preloadUrl && !zone.continueAmbienceIntoTraversal) new Audio(preloadUrl).load()
    setProgress({ didActivity: true, exitUnlocked: true })
    transitionTo('walk', () => {
      audioRef.current?.sfx('chime-unlock')
      stageRef.current?.lightPath()
      lockAndSay('ready')
    })
  }

  useEffect(() => {
    if (scene === 'climb' && zone.traversalMode === 'firstlight') {
      setTravHint(true)
      later(() => setTravHint(false), 4000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])

  function onTraversalComplete(result) {
    setTravResult(result || null)
    transitionTo('end')
  }
  function playAgain() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    clearBeckonTimer()
    audioRef.current?.stopSpeech()
    setBubble(null)
    narratingRef.current = false
    setGearNarrating(false)
    setDismissedTarget(null)
    setProgressState({ talked: false, watched: false, didActivity: false, exitUnlocked: false, leveledUp: false })
    setGearEquipped(false)
    setTravResult(null)
    setIntroLock(false)
    setStarted(false)
    setShowTitle(false)
    setPlatePhase(zone.introPlate ? 'intro' : 'main')
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
  // Draft 90 (item 1): the one target "Tap here" should point at right now
  // -- these three states are mutually exclusive in the normal zone flow
  // (spark active until talked, then pond until the activity's done, then
  // exit once it's unlocked), and match exactly the three moments the draft
  // calls out: Spark on arrival, the station after follow-me, the exit
  // after the gear award.
  const pointerTarget =
    walkPaused
      ? null
      : zoneProgress.spark === 'active'
        ? 'spark'
        : zoneProgress.pond === 'active'
          ? 'pond'
          : zoneProgress.exit === 'active'
            ? 'exit'
            : null
  const pointerSpot = pointerTarget && POINTER_SPOTS[plateZoneId]?.[pointerTarget]
  const showPointer = !!pointerSpot && dismissedTarget !== pointerTarget
  // The scene's own "begin" (camera settle + tap hint) waits for the arrive
  // line too, so the hint doesn't invite a tap that would be ignored. The
  // intro plate never sets introLock, so this is true the moment `started`
  // is (i.e. immediately after the title card there).
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
              zoneId={plateZoneId}
              base={plateBase}
              mapFile={plateMapFile}
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
            out under the in-frame scenes, gone with the stage. Draft 83:
            the intro plate doesn't wire its own overlay set yet, so this
            only shows once on the main plate. */}
        {stageMounted && !introActive && (
          <ZoneOverlays base={zone.base} sub={zone.overlaySub} layers={zone.overlayLayers} visible={scene === 'walk' || scene === 'transition'} />
        )}

        {hudVisible && <GearHud earned={zone.gearEarnedBefore} newKey={zone.gear.gearKey} iconSrc={zone.gear.itemSrc} equipped={gearEquipped} flyIn={gearFly} frameRef={frameRef} />}

        {scene === 'walk' && <SparkBubble text={bubble?.text} visible={!!bubble?.visible} />}

        {scene === 'walk' && showPointer && <TapHerePointer x={pointerSpot.x} y={pointerSpot.y} />}

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

        {/* Spark → the current plate's video, in-frame; `ended` blooms back
            to the world (or, from the intro plate, cuts to the main one). */}
        {scene === 'video' && <VideoScene id={currentVideo.id} h={currentVideo.h} title={currentVideo.title} onEnded={onVideoEnded} allowSkip={DEV_SKIP} />}

        {/* Station → the zone's activity; its close screen hands off via
            onComplete (leveledUp if the activity supports it). `onNarrate`
            ducks this zone's own ambience under an activity's own narration
            (Body Mapping, Draft 83) -- unused by activities that don't
            accept it. */}
        {scene === 'activity' && (
          <div className="absolute inset-0 z-20">
            <ActivityComponent
              onComplete={onActivityComplete}
              onNarrate={(on) => {
                narratingRef.current = on
                audioRef.current?.duck(on)
              }}
              {...(zone.activityExtraProps || {})}
            />
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
            onReveal={onGearReveal}
            equipDisabled={gearNarrating}
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
            WebGL context is live. Draft 83: a zone that hands its own
            ambience over (`continueAmbienceIntoTraversal`) skips this
            traversal's own music and ducks THIS zone's bed under its VO
            instead. */}
        {scene === 'climb' && (
          <div className="absolute inset-0 z-20" style={{ background: '#05070e' }}>
            <TraversalGame
              mode={zone.traversalMode}
              started
              muted={muted}
              reducedMotion={reducedMotion}
              onComplete={onTraversalComplete}
              skipMusic={!!zone.continueAmbienceIntoTraversal}
              onDuck={zone.continueAmbienceIntoTraversal ? (on) => audioRef.current?.duck(on) : undefined}
            />
            {travHint && (
              <p
                className="absolute left-1/2 z-10 text-[13px] font-semibold text-center px-4 py-2 rounded-full"
                style={{
                  top: 24,
                  transform: 'translateX(-50%)',
                  background: 'var(--action-quiet)',
                  color: 'var(--text-bright)',
                  border: '1px solid var(--border-warm)',
                  pointerEvents: 'none',
                }}
              >
                Tap the trail to walk. Reach each lamp to light it.
              </p>
            )}
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
              {travResult && zone.traversalMode === 'firstlight' && typeof travResult.lampsLit === 'number' && (
                <p className="text-[14px] mb-1" style={{ color: zone.endCard.subTextColor }}>
                  You lit <strong>{travResult.lampsLit}</strong> lamps and found your way past <strong>{travResult.shapesRevealed}</strong>{' '}
                  {travResult.shapesRevealed === 1 ? 'thing' : 'things'} that only looked scary in the dark.
                </p>
              )}
              {zone.endCard.subtitle && (
                <p className="text-[14px] mb-6" style={{ color: zone.endCard.subTextColor }}>
                  {zone.endCard.subtitle}
                </p>
              )}
              {zone.endCard.nextDisabled ? (
                <div className={zone.endCard.subtitle ? 'mb-5' : 'mt-2 mb-5'}>
                  <span
                    className="inline-flex items-center gap-2 font-semibold rounded-full px-4 py-2 min-h-[48px] text-[13px]"
                    style={{ background: 'rgba(0,0,0,.12)', color: zone.endCard.textColor, opacity: 0.55, cursor: 'not-allowed' }}
                    aria-disabled="true"
                    title="Zone 2 isn't built yet"
                  >
                    {zone.endCard.nextLabel}
                    <ArrowRight size={14} strokeWidth={2} />
                  </span>
                  <p className="text-[11px] italic mt-1.5" style={{ color: zone.endCard.subTextColor }}>
                    Coming soon
                  </p>
                </div>
              ) : (
                zone.endCard.nextHref && (
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
                )
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
        @keyframes gz-tap-here-bob { 0%, 100% { margin-top: 0 } 50% { margin-top: -6px } }
      `}</style>
    </FullscreenStage>
  )
}
