// SplashScreen (Draft 93) — full-bleed landing screen shown once, before a
// genuinely new participant sees anything else (including the assent).
// Purely delivery-flow chrome, like `CelebrationScreen` in
// `DeliveryShellPage.jsx` — not a versioned activity, so it's not tracked in
// `activityVersions.js`.
//
// Music autoplay follows KaiNarrationPlayer's fail-open philosophy: attempt
// `play()` on mount, catch a block silently, and never let ambient audio
// gate anything — the mute/unmute control is the only feedback, there's no
// error state to show. Fades the loop out (rather than cutting it) when
// Begin is clicked, per Josh's addendum to the draft.
import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const FADE_MS = 500
const FADE_STEPS = 10

export default function SplashScreen({ onBegin }) {
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const p = el.play()
    if (p && typeof p.catch === 'function') {
      p.then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true))
    }
  }, [])

  function handleToggleMute() {
    const el = audioRef.current
    if (!el) return
    if (el.paused) {
      // Blocked autoplay — this click is a user gesture, so play() is
      // allowed here even though it wasn't on mount.
      el.volume = 1
      el.play()
        .then(() => setAutoplayBlocked(false))
        .catch(() => {})
      setMuted(false)
      return
    }
    setMuted((m) => !m)
  }

  function handleBegin() {
    const el = audioRef.current
    if (!el || el.paused || fading) {
      onBegin?.()
      return
    }
    setFading(true)
    const startVolume = el.volume
    let step = 0
    const timer = setInterval(() => {
      step += 1
      el.volume = Math.max(0, startVolume * (1 - step / FADE_STEPS))
      if (step >= FADE_STEPS) {
        clearInterval(timer)
        el.pause()
        onBegin?.()
      }
    }, FADE_MS / FADE_STEPS)
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-between bg-cover bg-center px-6 py-10 text-center"
      style={{ backgroundImage: 'url(/splash/tree.jpg)' }}
    >
      <audio ref={audioRef} src="/splash/ambient.wav" loop muted={muted} />

      <button
        type="button"
        onClick={handleToggleMute}
        aria-label={muted || autoplayBlocked ? 'Turn music on' : 'Turn music off'}
        className="self-end inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/70 hover:bg-white/90 text-slate-700 shadow-card backdrop-blur-sm"
      >
        {muted || autoplayBlocked ? (
          <VolumeX size={20} strokeWidth={2} />
        ) : (
          <Volume2 size={20} strokeWidth={2} />
        )}
      </button>

      <h1 className="text-[32px] sm:text-[40px] font-bold leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] mt-6">
        Ready for Roots
      </h1>

      <button
        type="button"
        onClick={handleBegin}
        className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[18px] rounded-full px-10 py-4 min-h-[56px] shadow-card mb-4"
      >
        Begin
      </button>
    </main>
  )
}
