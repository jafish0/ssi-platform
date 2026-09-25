// /gains-demo/zone2 — Zone 2 "The Lantern Path" (GAINS Draft 94 Phase A,
// Draft 95 Phase B).
//
// A bespoke page rather than another `zone` entry for GainsZonePage.jsx:
// Zone 2 is genuinely a different SHAPE from Zones 1/3/4 (free-order
// multi-station plate 2, no single activity/gear beat on plate 1, per-plate
// music) and retrofitting that into the shared single-station template
// risked the three already-shipped zones for a shape only this one needs.
// It reuses every LOWER-level shared piece instead: ZoneStage (the Phaser
// walkable scene, extended for Zone 2's stations/friends), ZoneOverlays,
// GearHud (added Draft 95, once there's finally gear to show), GearAward,
// SparkBubble, VideoScene, FullscreenStage, and a Zone-2-specific audio
// manager (createZone2Audio).
//
// Scene state machine:
//   intro -Begin-> walk(plate1) -tap Spark-> video(zone) -ended->
//     walk(plate1, exit lit) -tap exit-> walk(plate2) -any order-
//     [tap friend -> video(station) -ended-> station sequence -> part] x4
//     -> assembly (drag parts onto the Lantern) -> gear (GearAward) ->
//     walk(plate2, exit lit) -tap exit-> transition ("Into the Mistfields!")
//     -> fogline (the traversal) -> end

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Volume2, VolumeX, RotateCcw, ArrowRight } from 'lucide-react'
import FullscreenStage from '../components/gains/zone/FullscreenStage.jsx'
import ZoneStage from '../components/gains/zone/ZoneStage.jsx'
import ZoneOverlays from '../components/gains/zone/ZoneOverlays.jsx'
import GearHud from '../components/gains/zone/GearHud.jsx'
import GearAward from '../components/gains/GearAward.jsx'
import SparkBubble from '../components/gains/zone/SparkBubble.jsx'
import VideoScene from '../components/gains/zone/VideoScene.jsx'
import PartsTray from '../components/gains/zone/PartsTray.jsx'
import StationSequence from '../components/gains/zone/StationSequence.jsx'
import LensBuildView from '../components/gains/zone/LensBuildView.jsx'
import FoglineRunTraversal from '../components/gains/zone/FoglineRunTraversal.jsx'
import GainsButton from '../components/gains/ds/Button.jsx'
import { createZone2Audio } from '../components/gains/zone/zoneAudio.js'
import { ZONE2 } from '../components/gains/zone/zone2Config.js'
import '../styles/gains-tokens.css'

const DEV_SKIP =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) ||
  (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('dev'))

const REDIRECT_COOLDOWN_MS = 4000
const TITLE_CARD_MS = 2600
const BLOOM_IN_MS = 380

export default function GainsZone2Page() {
  const [scene, setScene] = useState('intro') // intro|walk|video|assembly|gear|transition|fogline|end
  const [plate, setPlate] = useState('plate1')
  const [started, setStarted] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [introLock, setIntroLock] = useState(false)
  const [veil, setVeil] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const transitioningRef = useRef(false)
  const [muted, setMuted] = useState(false)
  const [bubble, setBubble] = useState(null)
  const [videoContent, setVideoContent] = useState(null) // { id, h, title, kind: 'zone'|'station' }
  const [talkedSpark, setTalkedSpark] = useState(false)
  const [watchedVideo, setWatchedVideo] = useState(false)
  const [exitUnlocked, setExitUnlocked] = useState(false)
  const [stationsDone, setStationsDone] = useState({})
  const [activeStationId, setActiveStationId] = useState(null)
  // Draft 96 (item 2): keep the scene's own idea of the active station in
  // sync so it can clamp the Traveler/Spark's depth behind that friend
  // (see zoneWalkScene.js's setActiveStation/depthCapFor).
  useEffect(() => {
    stageRef.current?.setActiveStation(activeStationId)
  }, [activeStationId])
  const [fireLevel, setFireLevel] = useState(0)
  const [runKey, setRunKey] = useState(0)
  // Draft 95
  const [gearNarrating, setGearNarrating] = useState(false)
  const [gearEquipped, setGearEquipped] = useState(false)
  const [gearFly, setGearFly] = useState(0)
  const [travResult, setTravResult] = useState(null)

  const frameRef = useRef(null)
  const stageRef = useRef(null)
  const audioRef = useRef(null)
  const timersRef = useRef([])
  const lastRedirectRef = useRef(0)
  const sceneRef = useRef(scene)
  sceneRef.current = scene
  const plateRef = useRef(plate)
  plateRef.current = plate
  const talkedRef = useRef(talkedSpark)
  talkedRef.current = talkedSpark
  const watchedRef = useRef(watchedVideo)
  watchedRef.current = watchedVideo
  const exitUnlockedRef = useRef(exitUnlocked)
  exitUnlockedRef.current = exitUnlocked
  const stationsDoneRef = useRef(stationsDone)
  stationsDoneRef.current = stationsDone

  const doneCount = ZONE2.stations.filter((p) => stationsDone[p.id]).length

  useEffect(() => {
    const prev = document.title
    document.title = ZONE2.docTitle
    return () => {
      document.title = prev
    }
  }, [])

  useEffect(() => {
    const a = createZone2Audio({ base: ZONE2.base, sfxBase: ZONE2.sfxBase })
    audioRef.current = a
    return () => {
      timersRef.current.forEach(clearTimeout)
      a.dispose()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    audioRef.current?.setMuted(muted)
  }, [muted])

  function later(fn, ms) {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }

  // ---- Spark's bubble + voice ----
  const say = useCallback((line) => {
    const a = audioRef.current
    if (!line) return Promise.resolve()
    setBubble({ text: line.text, visible: true })
    const p = a ? a.speak(line.file) : Promise.resolve()
    return p.then(() => {
      setBubble((b) => (b && b.text === line.text ? { ...b, visible: false } : b))
    })
  }, [])

  // A hard cap on top of `say()`'s own promise, same reasoning as
  // firstLightScene.js's arrive() courtesy: "a stuck/failed clip can never
  // strand the player here." Every recorded line in this zone finishes
  // well under this (the longest, `ready`, is ~17s) -- it only ever fires
  // if a line's audio genuinely never settles (network hiccup, a browser
  // that never emits 'ended'/'error' for some reason), so a lock doesn't
  // become permanent over something outside this page's control.
  const LOCK_TIMEOUT_MS = 22000
  function lockAndSay(line) {
    setIntroLock(true)
    return Promise.race([say(line), new Promise((resolve) => later(resolve, LOCK_TIMEOUT_MS))]).then(() => setIntroLock(false))
  }

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

  function begin() {
    const a = audioRef.current
    if (a) {
      a.unlock()
      a.setPlate('plate1')
      a.preloadSfx(ZONE2.sfxPreload)
      a.sfx('ui-tap')
      a.sfx('arrive-swell')
    }
    setScene('walk')
    setShowTitle(true)
    // Draft 96 (item 1): `arrive` used to fire off this same timer,
    // unconditionally -- cutting `welcome` off mid-sentence whenever the
    // line ran longer than TITLE_CARD_MS (it's 5.7s; the timer is 2.6s).
    // The title card still hides and movement still starts on the timer
    // (unchanged), but `arrive` now queues behind `welcome`'s own promise
    // instead: zone-flow Spark lines shouldn't interrupt each other.
    const welcomeDone = say(ZONE2.vo.welcome)
    later(() => {
      setShowTitle(false)
      setStarted(true)
    }, TITLE_CARD_MS)
    welcomeDone.then(() => {
      audioRef.current?.sfx('chime-unlock')
      lockAndSay(ZONE2.vo.arrive)
    })
  }

  function redirect(line) {
    const now = Date.now()
    if (now - lastRedirectRef.current < REDIRECT_COOLDOWN_MS) return
    lastRedirectRef.current = now
    say(line)
  }

  // ---- plate 1: Spark -> Video 2 -> follow-me -> exit ----
  function handleTapPlate1(target) {
    if (target === 'spark') {
      if (watchedRef.current) return // nothing to replay -- followMe already covered it
    } else if (target === 'exit') {
      if (!watchedRef.current) redirect(ZONE2.vo.redirectExitVideo)
    }
  }
  function handleArrivePlate1(target) {
    if (target === 'spark' && !talkedRef.current) {
      setTalkedSpark(true)
      audioRef.current?.stopSpeech()
      setBubble(null)
      transitionTo('video', () => {
        audioRef.current?.setVideoDuck('zoneVideo')
        setVideoContent({ ...ZONE2.video, kind: 'zone' })
      })
    } else if (target === 'exit' && exitUnlockedRef.current) {
      audioRef.current?.stopSpeech()
      setBubble(null)
      transitionTo('walk', () => {
        setPlate('plate2')
        plateRef.current = 'plate2'
        // Draft 94: plate 2 has its own exit, locked again until all four
        // stations are done -- `exitUnlocked` is one shared flag across
        // both plates, so it has to be reset here or plate 2's exit would
        // read as already open the instant the player arrives.
        setExitUnlocked(false)
        audioRef.current?.setPlate('plate2')
        setRunKey((k) => k + 1)
        audioRef.current?.sfx('chime-unlock')
        lockAndSay(ZONE2.vo.campArrive)
      })
    }
  }

  // ---- plate 2: any of the four friends, then the exit ----
  function handleTapPlate2(target) {
    if (target === 'exit' && !exitUnlockedRef.current) {
      const allFriendsDone = ZONE2.stations.every((s) => stationsDoneRef.current[s.id])
      redirect(allFriendsDone ? ZONE2.vo.redirectExitLens : ZONE2.vo.redirectFriendsFirst)
    }
  }
  function handleArrivePlate2(target) {
    if (target === 'exit' && exitUnlockedRef.current) {
      audioRef.current?.stopSpeech()
      setBubble(null)
      transitionTo('transition', () => {
        audioRef.current?.setPlate('foglinerun')
        lockAndSay(ZONE2.vo.exitTransition).then(() => later(() => transitionTo('fogline'), 300))
      })
      return
    }
    if (target.startsWith('station:')) {
      const id = target.slice('station:'.length)
      if (stationsDoneRef.current[id]) return
      audioRef.current?.stopSpeech()
      setBubble(null)
      setActiveStationId(id)
      transitionTo('video', () => {
        audioRef.current?.setVideoDuck('stationVideo')
        setVideoContent({ ...ZONE2.stations.find((p) => p.id === id).video, kind: 'station' })
      })
    }
  }

  function onZoneEvent(evt) {
    const a = audioRef.current
    switch (evt.type) {
      case 'step':
        if (a) a.sfx(`step-${evt.surface}-${1 + Math.floor(Math.random() * 3)}`)
        break
      case 'sfx':
        if (a) a.sfx(evt.name)
        break
      case 'tap':
        if (evt.target) (plateRef.current === 'plate1' ? handleTapPlate1 : handleTapPlate2)(evt.target)
        break
      case 'arrive':
        if (evt.target) (plateRef.current === 'plate1' ? handleArrivePlate1 : handleArrivePlate2)(evt.target)
        break
      default:
        break
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  function onVideoEnded() {
    audioRef.current?.setVideoDuck(null)
    const kind = videoContent?.kind
    setVideoContent(null)
    if (kind === 'zone') {
      setWatchedVideo(true)
      transitionTo('walk', () => {
        audioRef.current?.sfx('chime-unlock')
        lockAndSay(ZONE2.vo.followMe).then(() => setExitUnlocked(true))
      })
      return
    }
    // A station video: back to the (still-paused) plate, name-it plays,
    // then the sequence itself mounts as an overlay on top of it.
    transitionTo('walk', () => {
      say(ZONE2.vo.nameIt)
    })
  }

  function onStationLight(t) {
    if (activeStationId) stageRef.current?.setStationLight(activeStationId, t)
  }

  function onStationComplete() {
    const id = activeStationId
    setActiveStationId(null)
    setStationsDone((s) => {
      const next = { ...s, [id]: true }
      const count = ZONE2.stations.filter((p) => next[p.id]).length
      setFireLevel(count)
      audioRef.current?.sfx('chime-unlock')
      const hint = ZONE2.vo.partHints[count - 1]
      if (hint) {
        later(() => {
          say(hint).then(() => {
            if (count >= 4) later(() => transitionTo('assembly'), 300)
          })
        }, 250)
      } else if (count >= 4) {
        later(() => transitionTo('assembly'), 250)
      }
      return next
    })
  }

  // ---- Draft 95: the build-view assembly -> GearAward -> back on the
  // plate with the exit finally open. ----
  function onAssemblyComplete() {
    transitionTo('gear', () => audioRef.current?.sfx('equip-flash'))
  }

  function onGearReveal() {
    const file = ZONE2.gear.sparkLineAudio
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
    transitionTo('walk', () => {
      setExitUnlocked(true)
      audioRef.current?.sfx('chime-unlock')
      stageRef.current?.lightPath()
      lockAndSay(ZONE2.vo.ready)
    })
  }

  function onFoglineComplete(result) {
    setTravResult(result)
    transitionTo('end')
  }

  function playAgain() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    audioRef.current?.stopSpeech()
    setBubble(null)
    setTalkedSpark(false)
    setWatchedVideo(false)
    setExitUnlocked(false)
    setStationsDone({})
    setActiveStationId(null)
    setFireLevel(0)
    setVideoContent(null)
    setIntroLock(false)
    setStarted(false)
    setShowTitle(false)
    setGearNarrating(false)
    setGearEquipped(false)
    setTravResult(null)
    setPlate('plate1')
    plateRef.current = 'plate1'
    setRunKey((k) => k + 1)
    setScene('intro')
  }

  const stageMounted = scene !== 'fogline' && scene !== 'end'
  const walkPaused = scene !== 'walk' || showTitle || transitioning || introLock || !!activeStationId
  const walkBegun = started && !introLock

  const zoneProgress = useMemo(
    () => ({
      spark: talkedSpark ? 'done' : 'active',
      pond: 'locked', // unused on both plates -- see `noPondTarget`/`stations`
      exit: exitUnlocked ? 'active' : 'locked',
      sparkMode: (plate === 'plate1' ? watchedVideo : talkedSpark) ? 'companion' : 'waiting',
      stationsDone,
    }),
    [talkedSpark, exitUnlocked, watchedVideo, plate, stationsDone],
  )

  const activeStation = activeStationId ? ZONE2.stations.find((p) => p.id === activeStationId) : null
  const currentPlateCfg = plate === 'plate1' ? ZONE2.plate1 : ZONE2.plate2
  const exitOpenLayers = useMemo(() => new Set(exitUnlocked ? ['exit-glow'] : []), [exitUnlocked])
  const overlayCssVars = plate === 'plate2' ? { '--fire-level': fireLevel } : undefined

  return (
    <FullscreenStage section="review-zone2" onRestart={playAgain} showRestart={scene !== 'intro'} frameRef={frameRef}>
      <>
        {stageMounted && (
          <div className="absolute inset-0">
            <ZoneStage
              key={runKey}
              ref={stageRef}
              zoneId={plate === 'plate1' ? 'zone2plate1' : 'zone2plate2'}
              base={ZONE2.base}
              mapFile={currentPlateCfg.mapFile}
              friends={plate === 'plate2' ? ZONE2.friendTextures : undefined}
              reducedMotion={false}
              onEvent={onZoneEvent}
              progress={zoneProgress}
              paused={walkPaused}
              started={walkBegun}
            />
          </div>
        )}

        {stageMounted && (
          <ZoneOverlays
            base={ZONE2.base}
            sub={plate}
            layers={currentPlateCfg.overlayLayers}
            visible={scene === 'walk'}
            cssVars={overlayCssVars}
            activeLayers={exitOpenLayers}
          />
        )}

        {plate === 'plate2' && started && doneCount < 4 && <PartsTray stations={ZONE2.stations} filled={doneCount} />}

        {started && (scene === 'gear' || scene === 'walk') && plate === 'plate2' && doneCount >= 4 && (
          <GearHud earned={ZONE2.gearEarnedBefore} newKey={ZONE2.gear.gearKey} iconSrc={ZONE2.gear.itemSrc} equipped={gearEquipped} flyIn={gearFly} frameRef={frameRef} />
        )}

        {scene === 'walk' && !activeStationId && <SparkBubble text={bubble?.text} visible={!!bubble?.visible} />}

        {scene === 'walk' && activeStation && (
          <StationSequence
            station={activeStation}
            posFor={(id) => stageRef.current?.stationPosFor(id)}
            onLight={onStationLight}
            speakSpark={say}
            speakFriend={(file) => (audioRef.current ? audioRef.current.speak(file) : Promise.resolve())}
            sfx={(name) => audioRef.current?.sfx(name)}
            onComplete={onStationComplete}
          />
        )}

        {scene === 'assembly' && (
          <LensBuildView
            baseSrc={ZONE2.build.baseSrc}
            finishedSrc={ZONE2.gear.itemSrc}
            targets={ZONE2.build.targets}
            parts={ZONE2.stations.map((s) => ({ partId: s.id, partSrc: s.partSrc, partLabel: s.partLabel }))}
            reducedMotion={false}
            onSfx={(name) => audioRef.current?.sfx(name)}
            onComplete={onAssemblyComplete}
          />
        )}

        {scene === 'gear' && (
          <GearAward
            name={ZONE2.gear.name}
            itemSrc={ZONE2.gear.itemSrc}
            equippedSrc={ZONE2.gear.equippedSrc}
            title={ZONE2.gear.title}
            subline={ZONE2.gear.subline}
            sparkLine={ZONE2.gear.sparkLine}
            equipLabel={ZONE2.gear.equipLabel}
            onEquip={onGearEquip}
            onReveal={onGearReveal}
            equipDisabled={gearNarrating}
            onContinue={onGearContinue}
          />
        )}

        {scene === 'transition' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-7" style={{ background: 'var(--sky-beacon)' }}>
            <div style={{ animation: 'sm-rise var(--dur-slow) var(--ease-settle) both' }}>
              <Sparkles size={28} strokeWidth={1.5} style={{ color: 'var(--text-on-warm)', marginBottom: 12 }} />
              <h2 className="text-[26px] font-extrabold" style={{ color: 'var(--text-on-warm)' }}>
                {ZONE2.transitionHeading}
              </h2>
            </div>
          </div>
        )}

        {scene === 'fogline' && (
          <FoglineRunTraversal
            started
            muted={muted}
            reducedMotion={false}
            onComplete={onFoglineComplete}
            speak={(file) => (audioRef.current ? audioRef.current.speak(file) : Promise.resolve())}
            duck={(on) => audioRef.current?.duck(on)}
          />
        )}

        {scene === 'intro' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-7"
            style={{ background: 'linear-gradient(180deg, rgba(2,17,39,.55) 0%, rgba(2,17,39,.78) 60%, rgba(2,17,39,.92) 100%)' }}
          >
            <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--text-warm)', marginBottom: 12 }} />
            <div className="text-[11px] font-extrabold uppercase mb-2" style={{ letterSpacing: 'var(--tracking-caps)', color: 'var(--text-warm)' }}>
              Zone 2
            </div>
            <h2 className="text-[26px] font-extrabold mb-3" style={{ color: 'var(--text-bright)' }}>
              The Lantern Path
            </h2>
            <p className="text-[14px] leading-relaxed mb-6 max-w-[290px]" style={{ color: 'var(--text-body)' }}>
              Tap the path to move. Tap Spark, a friend, or the way ahead to interact. Spark will guide you.
            </p>
            <GainsButton size="lg" onClick={begin}>
              Begin
            </GainsButton>
            <p className="text-[12px] mt-4" style={{ color: 'var(--text-body)' }}>
              Best with sound on 🔊
            </p>
          </div>
        )}

        {scene === 'walk' && showTitle && (
          <div
            className="absolute inset-0 flex items-center justify-center text-center px-6 z-20"
            style={{ background: 'radial-gradient(120% 90% at 50% 40%, rgba(255,247,234,.92) 0%, rgba(253,230,138,.7) 45%, rgba(245,153,110,.35) 100%)', animation: 'z4-title-veil 2.6s var(--ease-soft) both' }}
          >
            <div style={{ animation: 'sm-rise var(--dur-slow) var(--ease-settle) both' }}>
              <div className="text-[12px] font-extrabold uppercase mb-2" style={{ letterSpacing: 'var(--tracking-caps)', color: 'var(--amber-700)' }}>
                Zone 2
              </div>
              <h2 className="text-[30px] font-extrabold leading-tight" style={{ color: 'var(--text-on-warm)' }}>
                The Lantern Path
              </h2>
            </div>
          </div>
        )}

        {scene === 'video' && videoContent && (
          <VideoScene id={videoContent.id} h={videoContent.h} title={videoContent.title} onEnded={onVideoEnded} allowSkip={DEV_SKIP} />
        )}

        {scene === 'end' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style={{ background: 'var(--sky-beacon)' }}>
            <div style={{ animation: 'sm-bloom var(--dur-bloom) var(--ease-bloom) both' }}>
              <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--text-on-warm)', margin: '0 auto 12px' }} />
              <h2 className="text-[26px] font-extrabold mb-2" style={{ color: 'var(--text-on-warm)' }}>
                You reached the Mistfields.
              </h2>
              {travResult && (
                <p className="text-[14px] mb-5" style={{ color: 'rgba(58,29,5,.85)' }}>
                  You found your way through the fog, one wall at a time.
                </p>
              )}
              <div className="mb-5">
                <Link
                  to="/gains-demo/zone3"
                  className="inline-flex items-center gap-2 font-semibold rounded-full px-4 py-2 min-h-[48px] text-[13px]"
                  style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
                >
                  Continue to the Mistfields
                  <ArrowRight size={14} strokeWidth={2} />
                </Link>
              </div>
              <GainsButton onClick={playAgain} iconLeft={<RotateCcw size={16} strokeWidth={2} />}>
                Play again
              </GainsButton>
            </div>
          </div>
        )}

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
