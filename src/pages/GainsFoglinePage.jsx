// "The Fogline" traversal prototype at /gains-demo/fogline (GAINS Draft 95)
// — Zone 2 (The Lantern Path) → Zone 3. Instructions → Begin (also the
// mobile audio-unlock gesture) → the traversal → completion beat → replay
// in place, same pattern as The First Light (GainsFirstLightPage.jsx).
//
// No host zone here, so this page runs its own small audio bed (fogline
// music + forest ambience, both looped) rather than reaching for
// createZone2Audio's full per-plate manager -- there's only ever one
// "plate" to play.

import { useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react'
import FoglineTraversal from '../components/gains/zone/FoglineTraversal.jsx'
import FullscreenStage from '../components/gains/zone/FullscreenStage.jsx'
import GainsButton from '../components/gains/ds/Button.jsx'
import '../styles/gains-tokens.css'

const BASE = '/long-light/zone2'
const MUSIC_VOL = 0.32
const AMBIENCE_VOL = 0.13 * 0.4
const DUCK_MUL = 0.15

export default function GainsFoglinePage() {
  const [restartNonce, setRestartNonce] = useState(0)
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)
  const [result, setResult] = useState(null)

  const musicRef = useRef(null)
  const ambienceRef = useRef(null)
  const voRef = useRef(null)
  const unlockedRef = useRef(false)

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    const prev = document.title
    document.title = 'GAINS for Teens — The Fogline (traversal prototype)'
    musicRef.current = new Audio(`${BASE}/audio/z2-music-fogline.mp3`)
    musicRef.current.loop = true
    musicRef.current.preload = 'auto'
    ambienceRef.current = new Audio(`${BASE}/audio/z2-amb-forest.mp3`)
    ambienceRef.current.loop = true
    ambienceRef.current.preload = 'auto'
    voRef.current = new Audio()
    voRef.current.preload = 'auto'
    return () => {
      document.title = prev
      musicRef.current?.pause()
      ambienceRef.current?.pause()
      voRef.current?.pause()
    }
  }, [])

  useEffect(() => {
    ;[musicRef.current, ambienceRef.current, voRef.current].forEach((el) => {
      if (el) el.muted = muted
    })
  }, [muted])

  function unlockAndPlay() {
    if (unlockedRef.current) return
    unlockedRef.current = true
    ;[musicRef.current, ambienceRef.current].forEach((el) => {
      if (!el) return
      el.volume = el === musicRef.current ? MUSIC_VOL : AMBIENCE_VOL
      el.play().catch(() => {})
    })
  }

  function speak(file) {
    const vo = voRef.current
    if (!vo) return Promise.resolve()
    return new Promise((resolve) => {
      const finish = () => resolve()
      vo.pause()
      vo.currentTime = 0
      vo.src = `${BASE}/audio/${file}`
      vo.addEventListener('ended', finish, { once: true })
      vo.addEventListener('error', finish, { once: true })
      const p = vo.play()
      if (p && p.catch) p.catch(finish)
    })
  }

  function duck(on) {
    if (musicRef.current) musicRef.current.volume = on ? MUSIC_VOL * DUCK_MUL : MUSIC_VOL
    if (ambienceRef.current) ambienceRef.current.volume = on ? AMBIENCE_VOL * DUCK_MUL : AMBIENCE_VOL
  }

  function begin() {
    unlockAndPlay()
    setStarted(true)
  }

  function again() {
    setResult(null)
    setRestartNonce((n) => n + 1)
  }

  return (
    <FullscreenStage section="review-fogline" onRestart={again} showRestart={started && !result}>
      <FoglineTraversal
        started={started}
        muted={muted}
        reducedMotion={reducedMotion}
        restartSignal={restartNonce}
        onComplete={setResult}
        speak={speak}
        duck={duck}
        sfx={() => {}}
      />

      {started && !result && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="absolute z-10 p-2 rounded-full"
          style={{ top: 10, right: 10, background: 'rgba(2,17,39,.45)', color: 'var(--text-bright)' }}
        >
          {muted ? <VolumeX size={18} strokeWidth={1.75} /> : <Volume2 size={18} strokeWidth={1.75} />}
        </button>
      )}

      {/* Instructions */}
      {!started && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-7"
          style={{ background: 'linear-gradient(180deg, rgba(2,17,39,.55) 0%, rgba(2,17,39,.78) 60%, rgba(2,17,39,.92) 100%)' }}
        >
          <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--text-warm)', marginBottom: 12 }} />
          <h2 className="text-[22px] font-extrabold mb-3" style={{ color: 'var(--text-bright)' }}>
            The Fogline
          </h2>
          <ul className="text-[14px] leading-relaxed space-y-2 mb-6 text-left max-w-[290px]" style={{ color: 'var(--text-body)' }}>
            <li>• Fog makes everything look bigger than it is.</li>
            <li>
              • <strong style={{ color: 'var(--text-bright)' }}>Drag the Focusing Lens</strong> anywhere to see what's really there.
            </li>
            <li>• Hold it still on the next stone to bring it into focus, then tap to hop.</li>
            <li>• Look closely and the path shows itself one step at a time.</li>
            <li>• Non-fail — take your time.</li>
          </ul>
          <GainsButton size="lg" onClick={begin}>
            Begin
          </GainsButton>
          <p className="text-[12px] mt-4" style={{ color: 'var(--text-body)' }}>
            Best with sound on 🔊
          </p>
        </div>
      )}

      {/* Completion beat */}
      {result && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style={{ background: 'var(--sky-beacon)' }}>
          <Sparkles size={30} strokeWidth={1.5} style={{ color: 'var(--text-on-warm)', margin: '0 auto 12px' }} />
          <h2 className="text-[22px] font-extrabold mb-2" style={{ color: 'var(--text-on-warm)' }}>
            You reached the Mistfields.
          </h2>
          <p className="text-[15px] mb-6" style={{ color: 'rgba(58,29,5,.85)' }}>
            You found your way in <strong>{result.stonesHopped}</strong> hops and brought{' '}
            <strong>{result.shapesRevealed}</strong> of 2 looming shapes into focus.
          </p>
          <GainsButton onClick={again} iconLeft={<RotateCcw size={16} strokeWidth={2} />}>
            Try again
          </GainsButton>
        </div>
      )}
    </FullscreenStage>
  )
}
