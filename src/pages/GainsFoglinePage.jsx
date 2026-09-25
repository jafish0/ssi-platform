// "The Fogline" traversal prototype at /gains-demo/fogline (GAINS Draft 98,
// replacing Draft 95's drag-the-lens version with an auto-runner) — Zone 2
// (The Lantern Path) → Zone 3. Instructions → Begin (also the mobile
// audio-unlock gesture) → the traversal → completion beat → replay in
// place, same pattern as The First Light (GainsFirstLightPage.jsx).
//
// No host zone here, so this page runs its own small audio bed rather than
// reaching for createZone2Audio's full per-plate manager -- there's only
// ever one "plate" to play. The runner's music needs a genuinely gapless
// intro->loop splice (a 20-50ms gap is audible at the seam), so it's
// scheduled on the Web Audio clock the same way the title screen's
// `unlockAndPlay` does -- a single `<audio>` element with `.loop = true`
// can't do that handoff without a seam.

import { useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react'
import FoglineRunTraversal from '../components/gains/zone/FoglineRunTraversal.jsx'
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

  const audioRef = useRef({ ctx: null, master: null, musicGain: null, ambienceGain: null, unlocked: false })
  const voRef = useRef(null)

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  useEffect(() => {
    const prev = document.title
    document.title = 'GAINS for Teens — The Fogline (traversal prototype)'
    voRef.current = new Audio()
    voRef.current.preload = 'auto'
    return () => {
      document.title = prev
      voRef.current?.pause()
      if (audioRef.current.ctx) audioRef.current.ctx.close().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (voRef.current) voRef.current.muted = muted
    const a = audioRef.current
    if (a.master) a.master.gain.value = muted ? 0 : 1
  }, [muted])

  async function unlockAndPlay() {
    const a = audioRef.current
    if (a.unlocked) return
    a.unlocked = true
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      const ctx = new AC()
      if (ctx.state === 'suspended') await ctx.resume().catch(() => {})
      const master = ctx.createGain()
      master.gain.value = muted ? 0 : 1
      master.connect(ctx.destination)
      const musicGain = ctx.createGain()
      musicGain.connect(master)
      const ambienceGain = ctx.createGain()
      ambienceGain.gain.value = AMBIENCE_VOL
      ambienceGain.connect(master)
      a.ctx = ctx
      a.master = master
      a.musicGain = musicGain
      a.ambienceGain = ambienceGain

      const [introBuf, loopBuf, ambBuf] = await Promise.all(
        [`${BASE}/audio/z2-music-runner-intro.mp3`, `${BASE}/audio/z2-music-runner-loop.mp3`, `${BASE}/audio/z2-amb-forest.mp3`].map((url) =>
          fetch(url)
            .then((r) => r.arrayBuffer())
            .then((buf) => ctx.decodeAudioData(buf)),
        ),
      )
      // The decode above is the one real await -- a fast unmount (or a
      // second unlock attempt) could close the context before it resolves.
      if (ctx.state === 'closed') return

      const startAt = ctx.currentTime + 0.06
      musicGain.gain.value = MUSIC_VOL
      const introSrc = ctx.createBufferSource()
      introSrc.buffer = introBuf
      introSrc.connect(musicGain)
      introSrc.start(startAt)
      const loopSrc = ctx.createBufferSource()
      loopSrc.buffer = loopBuf
      loopSrc.loop = true
      loopSrc.connect(musicGain)
      loopSrc.start(startAt + introBuf.duration)

      const ambSrc = ctx.createBufferSource()
      ambSrc.buffer = ambBuf
      ambSrc.loop = true
      ambSrc.connect(ambienceGain)
      ambSrc.start(startAt)
    } catch {
      /* audio is a nice-to-have here, never block begin on it */
    }
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
    const a = audioRef.current
    if (a.musicGain) a.musicGain.gain.value = on ? MUSIC_VOL * DUCK_MUL : MUSIC_VOL
    if (a.ambienceGain) a.ambienceGain.gain.value = on ? AMBIENCE_VOL * DUCK_MUL : AMBIENCE_VOL
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
      <FoglineRunTraversal
        started={started}
        muted={muted}
        reducedMotion={reducedMotion}
        restartSignal={restartNonce}
        onComplete={setResult}
        speak={speak}
        duck={duck}
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
              • <strong style={{ color: 'var(--text-bright)' }}>Tap to jump</strong> gaps and logs — hold a little longer for a bigger jump.
            </li>
            <li>
              • When a wall of fog rolls in, <strong style={{ color: 'var(--text-bright)' }}>hold to activate the Focusing Lens</strong>.
            </li>
            <li>• Look straight at what's looming in the fog and it gets smaller.</li>
            <li>• Non-fail — nothing here can end the run.</li>
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
            {result.motesCollected >= result.totalMotes ? (
              <>You ran the whole fogline and gathered every mote of light along the way.</>
            ) : (
              <>
                You found your way through the fog, gathering <strong>{result.motesCollected}</strong> of{' '}
                <strong>{result.totalMotes}</strong> motes of light along the way.
              </>
            )}
          </p>
          <GainsButton onClick={again} iconLeft={<RotateCcw size={16} strokeWidth={2} />}>
            Try again
          </GainsButton>
        </div>
      )}
    </FullscreenStage>
  )
}
