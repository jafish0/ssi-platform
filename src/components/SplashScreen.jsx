// SplashScreen (Draft 93) — landing screen shown once, before a genuinely
// new participant sees anything else (including the assent). Purely
// delivery-flow chrome, like `CelebrationScreen` in `DeliveryShellPage.jsx`
// — not a versioned activity, so it's not tracked in `activityVersions.js`.
//
// Music autoplay follows KaiNarrationPlayer's fail-open philosophy: attempt
// `play()` on mount, catch a block silently, and never let ambient audio
// gate anything — the mute/unmute control is the only feedback, there's no
// error state to show. Fades the loop out (rather than cutting it) when
// Begin is clicked, per Josh's addendum to the draft. Draft 94 Part B
// (2026-08-20): starts muted rather than playing audibly — the loop still
// autoplays (silently) on mount, and the mute icon reflects that starting
// state, so a participant opts IN to sound rather than having to opt out.
//
// Sizing (fixed after Josh flagged the sandbox preview as badly cropped —
// the original `bg-cover` over a raw `min-h-screen` box stretched the 9:16
// tree image to whatever shape the surrounding page happened to be, cropping
// away the deliberately-composed sky/ground margins whenever that shape
// wasn't close to portrait, e.g. the sandbox's wide, non-full-viewport-height
// card). The frame is `w-full` — always the actual available width,
// whatever that is, so it's never fighting a flex/shrink ancestor the way a
// viewport-unit-based width would be once nested a few levels deep inside
// the sandbox's own layout — with height derived from that width via
// `aspect-ratio: 9/16` (same convention `ReviewCard` uses). Since the
// source image's native ratio IS exactly 9:16, that frame never needs to
// crop the image — it's centered in a `min-h-[100dvh]` flex wrapper, so on
// a real phone (usually a little taller than 9:16) the frame spans the
// full device width with a thin, on-brand letterbox strip top and bottom,
// never a cropped composition.
import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const FADE_MS = 500
const FADE_STEPS = 10

export default function SplashScreen({ onBegin }) {
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(true)
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

  const frame = (
    <div className="relative overflow-hidden w-full" style={{ aspectRatio: '9 / 16' }}>
      <img
        src="/splash/tree.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <audio ref={audioRef} src="/splash/ambient.wav" loop muted={muted} />

      <button
        type="button"
        onClick={handleToggleMute}
        aria-label={muted || autoplayBlocked ? 'Turn music on' : 'Turn music off'}
        className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/70 hover:bg-white/90 text-slate-700 shadow-card backdrop-blur-sm"
      >
        {muted || autoplayBlocked ? (
          <VolumeX size={20} strokeWidth={2} />
        ) : (
          <Volume2 size={20} strokeWidth={2} />
        )}
      </button>

      {/* Positioned by `top`/`bottom` percentage (which resolve against
          this relatively-positioned frame's HEIGHT, unlike padding/margin
          percentages, which always resolve against width) so the title and
          button land in the image's actual open sky / open ground bands
          regardless of the frame's rendered pixel size — 14% down sits
          inside the sky (open through ~34%), 6% up from the bottom sits
          inside the roots/ground band (open from ~77%). */}
      <h1
        className="absolute left-0 right-0 px-6 text-center text-[32px] sm:text-[40px] font-bold leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
        style={{ top: '14%' }}
      >
        Ready for Roots
      </h1>
      <div className="absolute left-0 right-0 px-6 text-center" style={{ bottom: '6%' }}>
        <button
          type="button"
          onClick={handleBegin}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[18px] rounded-full px-10 py-4 min-h-[56px] shadow-card"
        >
          Begin
        </button>
      </div>
    </div>
  )

  return (
    <main className="min-h-[100dvh] w-full flex items-center justify-center bg-[#2b2417]">
      {frame}
    </main>
  )
}
