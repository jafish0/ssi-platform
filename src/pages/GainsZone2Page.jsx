// /gains-demo/zone2 — Zone 2 "The Lantern Path" (GAINS Draft 94, Phase A).
//
// A bespoke page rather than another `zone` entry for GainsZonePage.jsx:
// Zone 2 is genuinely a different SHAPE from Zones 1/3/4 (free-order
// multi-station plate 2, no single activity/gear beat on plate 1, per-plate
// music) and retrofitting that into the shared single-station template
// risked the three already-shipped zones for a shape only this one needs.
// It reuses every LOWER-level shared piece instead: ZoneStage (the Phaser
// walkable scene, extended for Zone 2's stations/friends), ZoneOverlays,
// GearHud is NOT used here (Draft 94 has no gear yet -- PartsTray fills
// that role until Draft 95's Focusing Lens), SparkBubble, VideoScene,
// FullscreenStage, and a Zone-2-specific audio manager (createZone2Audio).
//
// Scene state machine:
//   intro -Begin-> walk(plate1) -tap Spark-> video(zone) -ended->
//     walk(plate1, exit lit) -tap exit-> walk(plate2) -any order-
//     [tap friend -> video(station) -ended-> station sequence -> part] x4
//     -> end (Phase A stub; Draft 95 replaces with the assembly + Fogline)
//
// Draft 95 will add: the build-view lens assembly, the GearAward, and the
// Fogline traversal, replacing this file's temporary end card.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import FullscreenStage from '../components/gains/zone/FullscreenStage.jsx'
import ZoneStage from '../components/gains/zone/ZoneStage.jsx'
import ZoneOverlays from '../components/gains/zone/ZoneOverlays.jsx'
import SparkBubble from '../components/gains/zone/SparkBubble.jsx'
import VideoScene from '../components/gains/zone/VideoScene.jsx'
import PartsTray from '../components/gains/zone/PartsTray.jsx'
import StationSequence from '../components/gains/zone/StationSequence.jsx'
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
  const [scene, setScene] = useState('intro') // intro|walk|video|end
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
  const [fireLevel, setFireLevel] = useState(0)
  const [runKey, setRunKey] = useState(0)

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

  function lockAndSay(line) {
    setIntroLock(true)
    return say(line).then(() => setIntroLock(false))
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
    say(ZONE2.vo.welcome)
    later(() => {
      setShowTitle(false)
      setStarted(true)
      audioRef.current?.sfx('chime-unlock')
      lockAndSay(ZONE2.vo.arrive)
    }, TITLE_CARD_MS)
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
    if (target === 'exit' && !exitUnlockedRef.current) redirect(ZONE2.vo.redirectFriendsFirst)
  }
  function handleArrivePlate2(target) {
    if (target === 'exit' && exitUnlockedRef.current) {
      audioRef.current?.stopSpeech()
      setBubble(null)
      transitionTo('end')
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
      if (hint) later(() => say(hint), 250)
      if (count >= 4) later(() => setExitUnlocked(true), 250)
      return next
    })
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
    setPlate('plate1')
    plateRef.current = 'plate1'
    setRunKey((k) => k + 1)
    setScene('intro')
  }

  const stageMounted = scene !== 'end'
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

        {plate === 'plate2' && started && scene !== 'end' && <PartsTray stations={ZONE2.stations} filled={doneCount} />}

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
                You've gathered all four parts.
              </h2>
              <p className="text-[14px] mb-6" style={{ color: 'rgba(58,29,5,.85)' }}>
                The Focusing Lens is coming in the next build.
              </p>
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
