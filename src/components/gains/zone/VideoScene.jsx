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
import GainsButton from '../ds/Button.jsx'

export default function VideoScene({ id, h, title, onEnded, allowSkip = false }) {
  const hostRef = useRef(null)
  const [failed, setFailed] = useState(false)
  const endedRef = useRef(onEnded)
  endedRef.current = onEnded

  useEffect(() => {
    if (!hostRef.current) return undefined
    let player
    try {
      player = new Player(hostRef.current, {
        url: `https://vimeo.com/${id}/${h}`,
        autoplay: true,
        controls: true,
        title: false,
        byline: false,
        portrait: false,
        playsinline: true,
        dnt: true,
        responsive: false,
        width: hostRef.current.clientWidth || 420,
      })
      player.on('ended', () => endedRef.current && endedRef.current())
      player.on('error', () => setFailed(true))
      player.ready().catch(() => setFailed(true))
    } catch {
      setFailed(true)
    }
    return () => {
      if (player) player.destroy().catch(() => {})
    }
  }, [id, h])

  return (
    <div className="absolute inset-0 z-20" style={{ background: 'var(--surface-abyss)' }}>
      <style>{`.z4-video iframe { position: absolute; inset: 0; width: 100% !important; height: 100% !important; }`}</style>
      <div ref={hostRef} className="z4-video absolute inset-0" aria-label={title} />
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
