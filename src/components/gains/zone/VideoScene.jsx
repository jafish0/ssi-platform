// In-frame Vimeo scene for the walkable zone (GAINS Draft 68 Phase B).
//
// Spark's video plays INSIDE the phone frame via the Vimeo Player SDK so we
// can catch `ended` and bloom back to the world. The zone's videos are
// unlisted (id + privacy hash), which the SDK takes as a `url` with the hash
// in the path. Autoplay is fine here: the tap on Spark was the gesture. A
// small Skip appears only under the tester flag (never for kids); a load
// error falls back to a plain Continue so nobody can get stuck.

import { useEffect, useRef, useState } from 'react'
import Player from '@vimeo/player'
import { Volume2 } from 'lucide-react'
import GainsButton from '../ds/Button.jsx'

export default function VideoScene({ id, h, title, onEnded, allowSkip = false }) {
  const hostRef = useRef(null)
  const [failed, setFailed] = useState(false)
  // Draft 90 (item 3): every video starts from a tap on Spark, so it should
  // start unmuted off that same gesture rather than defaulting to Vimeo's
  // own muted-autoplay fallback. If a browser still won't allow sound to
  // start automatically (its own autoplay policy, nothing to do with the
  // tap that got us here), this shows a one-tap "Tap for sound" overlay
  // instead of leaving people to hunt for Vimeo's own tiny unmute icon.
  const [needsSoundTap, setNeedsSoundTap] = useState(false)
  const playerRef = useRef(null)
  const endedRef = useRef(onEnded)
  endedRef.current = onEnded

  useEffect(() => {
    if (!hostRef.current) return undefined
    let player
    try {
      player = new Player(hostRef.current, {
        url: `https://vimeo.com/${id}/${h}`,
        autoplay: true,
        muted: false,
        controls: true,
        title: false,
        byline: false,
        portrait: false,
        playsinline: true,
        dnt: true,
        responsive: false,
        width: hostRef.current.clientWidth || 420,
      })
      playerRef.current = player
      player.on('ended', () => endedRef.current && endedRef.current())
      player.on('error', () => setFailed(true))
      player
        .ready()
        .then(() => player.getMuted())
        .then((muted) => {
          if (muted) setNeedsSoundTap(true)
        })
        .catch(() => setFailed(true))
    } catch {
      setFailed(true)
    }
    return () => {
      if (player) player.destroy().catch(() => {})
    }
  }, [id, h])

  function unmute() {
    setNeedsSoundTap(false)
    playerRef.current?.setMuted(false).catch(() => {})
    playerRef.current?.play().catch(() => {})
  }

  return (
    <div className="absolute inset-0 z-20" style={{ background: 'var(--surface-abyss)' }}>
      <style>{`.z4-video iframe { position: absolute; inset: 0; width: 100% !important; height: 100% !important; }`}</style>
      <div ref={hostRef} className="z4-video absolute inset-0" aria-label={title} />
      {needsSoundTap && !failed && (
        <button
          type="button"
          onClick={unmute}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-[14px] font-bold"
          style={{ background: 'rgba(2,17,39,.55)', color: 'var(--text-bright)' }}
        >
          <Volume2 size={28} strokeWidth={1.75} />
          Tap for sound
        </button>
      )}
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-7" style={{ background: 'var(--surface-sheet)' }}>
          <p className="text-[14px] mb-4" style={{ color: 'var(--text-body)' }}>
            The video could not load here. You can keep going.
          </p>
          <GainsButton onClick={() => endedRef.current && endedRef.current()}>Continue</GainsButton>
        </div>
      )}
      {allowSkip && !failed && (
        <button
          type="button"
          onClick={() => endedRef.current && endedRef.current()}
          className="absolute z-30 rounded-full px-3 py-1.5 text-[11px] font-bold"
          style={{ bottom: 12, right: 12, background: 'rgba(2,17,39,.6)', color: 'var(--text-muted)', border: '1px solid var(--border-soft)' }}
        >
          Skip (testers)
        </button>
      )}
    </div>
  )
}
