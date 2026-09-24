// The Focusing Lens assembly (GAINS Draft 95, Zone 2 item 1) -- a full-frame
// build view: the base Lantern image center, the four parts (from the Parts
// Tray) draggable around the edges, four faint outlines on the Lantern where
// each one goes. Drag a part onto its outline -> snap with a chime and a
// small flare; drop it anywhere else -> it drifts back, no penalty. On the
// fourth snap, the Lantern cross-fades to the finished Focusing Lens image
// and a ring of clarity sweeps out across the frame before the caller's
// `onComplete` fires (the caller shows the standard GearAward next).
//
// Pointer-events drag (not HTML5 DnD, not a library), same technique as
// `BelongingSkillsSort.jsx`: works uniformly on mouse/touch/pen and renders
// a fully custom ghost. Simplified for four fixed targets (no auto-scroll,
// no keyboard arrow-cycling) but keeps the same tap-vs-drag slop threshold
// and a tap-to-select + tap-a-target fallback so it's usable without a drag
// gesture at all.

import { useEffect, useRef, useState } from 'react'

const TAP_SLOP_PX = 8
const SNAP_ANIM_MS = 260
const RING_MS = 1500
const RING_MS_REDUCED = 500

export default function LensBuildView({ baseSrc, finishedSrc, targets, parts, reducedMotion, onSfx, onComplete }) {
  const [placed, setPlaced] = useState({}) // partId -> true
  const [drag, setDrag] = useState(null) // { partId, x, y, offsetX, offsetY, originX, originY, hoveredTarget }
  const [dropAnim, setDropAnim] = useState(null) // { partId, kind: 'settle'|'spring', x, y }
  const [selected, setSelected] = useState(null) // tap-to-select fallback
  const [allDone, setAllDone] = useState(false)
  const [ring, setRing] = useState(false)
  const frameRef = useRef(null)
  const targetRefs = useRef({})
  const chipRefs = useRef({})

  const placedCount = Object.keys(placed).length
  const remaining = parts.filter((p) => !placed[p.partId] && !(drag && drag.partId === p.partId) && !(dropAnim && dropAnim.partId === p.partId))

  useEffect(() => {
    if (placedCount < parts.length) return
    setAllDone(true)
    const t1 = setTimeout(() => {
      onSfx?.('equip-flash')
      setRing(true)
    }, 260)
    const t2 = setTimeout(
      () => onComplete?.(),
      260 + (reducedMotion ? RING_MS_REDUCED : RING_MS),
    )
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placedCount])

  function targetAtPoint(clientX, clientY) {
    for (const t of targets) {
      const node = targetRefs.current[t.partId]
      if (!node || placed[t.partId]) continue
      const r = node.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      if (Math.hypot(clientX - cx, clientY - cy) <= r.width / 2 + 40) return t.partId
    }
    return null
  }

  function snapPart(partId) {
    onSfx?.('chime-unlock')
    setPlaced((p) => ({ ...p, [partId]: true }))
    setSelected(null)
  }

  function startDrag(partId, e) {
    if (drag || dropAnim || placed[partId]) return
    const rect = e.currentTarget.getBoundingClientRect()
    setDrag({
      partId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left + rect.width / 2,
      originY: rect.top + rect.height / 2,
      hoveredTarget: null,
    })
    setSelected(null)
  }

  useEffect(() => {
    if (!drag) return
    function move(e) {
      const hovered = targetAtPoint(e.clientX, e.clientY)
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY, hoveredTarget: hovered } : d))
    }
    function up(e) {
      setDrag((d) => {
        if (!d) return d
        const upX = e?.clientX ?? d.x
        const upY = e?.clientY ?? d.y
        if (!d.hoveredTarget && Math.hypot(upX - d.startX, upY - d.startY) < TAP_SLOP_PX) {
          setSelected(d.partId)
          return null
        }
        if (d.hoveredTarget) {
          const node = targetRefs.current[d.hoveredTarget]
          const r = node?.getBoundingClientRect()
          setDropAnim({ partId: d.partId, kind: 'settle', x: r ? r.left + r.width / 2 : d.x, y: r ? r.top + r.height / 2 : d.y, targetId: d.hoveredTarget })
        } else {
          setDropAnim({ partId: d.partId, kind: 'spring', x: d.originX, y: d.originY })
        }
        return d
      })
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [drag])

  useEffect(() => {
    if (!dropAnim) return
    const t = setTimeout(() => {
      if (dropAnim.kind === 'settle') snapPart(dropAnim.partId)
      setDropAnim(null)
      setDrag(null)
    }, SNAP_ANIM_MS + 20)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropAnim])

  function tapTarget(partId) {
    if (!selected || placed[selected]) return
    snapPart(selected)
  }

  const ghostPart = drag ? parts.find((p) => p.partId === drag.partId) : dropAnim ? parts.find((p) => p.partId === dropAnim.partId) : null
  const ghostX = drag ? drag.x : dropAnim ? dropAnim.x : 0
  const ghostY = drag ? drag.y : dropAnim ? dropAnim.y : 0
  const ghostAnimating = !!dropAnim

  return (
    <div
      ref={frameRef}
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: 'rgba(2,17,39,.9)', animation: reducedMotion ? undefined : 'sm-bloom var(--dur-bloom) var(--ease-bloom) both' }}
      aria-live="polite"
    >
      <style>{`
        @keyframes lens-flare { 0% { opacity: 0; transform: scale(.6) } 40% { opacity: 1; transform: scale(1.15) } 100% { opacity: 0; transform: scale(1.6) } }
        @keyframes lens-pulse { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.04) } }
        @keyframes ring-clarity { from { clip-path: circle(0% at 50% 50%); filter: brightness(1) saturate(1) } to { clip-path: circle(75% at 50% 50%); filter: brightness(1) saturate(1) } }
      `}</style>

      <div className="relative" style={{ width: '58%', maxWidth: 260, aspectRatio: '1 / 1' }}>
        <img
          src={baseSrc}
          alt="The Lantern"
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            opacity: allDone ? 0 : 1,
            transition: allDone ? `opacity ${reducedMotion ? 200 : 500}ms var(--ease-soft)` : undefined,
            animation: allDone ? undefined : 'lens-pulse 3.4s var(--ease-soft) infinite',
          }}
        />
        <img
          src={finishedSrc}
          alt="The Focusing Lens"
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            opacity: allDone ? 1 : 0,
            transition: `opacity ${reducedMotion ? 200 : 500}ms var(--ease-soft)`,
            clipPath: ring ? undefined : 'circle(0% at 50% 50%)',
            animation: ring && !reducedMotion ? `ring-clarity ${RING_MS - 200}ms var(--ease-soft) both` : ring ? undefined : undefined,
            ...(ring && reducedMotion ? { clipPath: 'circle(75% at 50% 50%)' } : {}),
          }}
        />

        {targets.map((t) => (
          <button
            key={t.partId}
            type="button"
            ref={(el) => {
              targetRefs.current[t.partId] = el
            }}
            onClick={() => tapTarget(t.partId)}
            aria-label={`Place part on ${t.partId} outline`}
            className="absolute rounded-full"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: `${t.r * 2}%`,
              height: `${t.r * 2}%`,
              transform: 'translate(-50%, -50%)',
              border: placed[t.partId] ? 'none' : `2px dashed ${drag?.hoveredTarget === t.partId ? 'var(--text-warm)' : 'rgba(253,230,138,.55)'}`,
              background: drag?.hoveredTarget === t.partId ? 'rgba(253,230,138,.18)' : 'transparent',
              transition: 'background 120ms, border-color 120ms',
            }}
          />
        ))}
      </div>

      {!allDone && (
        <>
          <p className="text-[13px] text-center px-8 mt-5 mb-2" style={{ color: 'var(--text-body)' }}>
            Drag each part onto its place on the Lantern.
          </p>
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-4 flex-wrap px-6">
            {remaining.map((p) => (
              <button
                key={p.partId}
                type="button"
                ref={(el) => {
                  chipRefs.current[p.partId] = el
                }}
                onPointerDown={(e) => startDrag(p.partId, e)}
                aria-label={`${p.partLabel}, drag onto the Lantern`}
                className="rounded-2xl flex flex-col items-center justify-center p-2"
                style={{
                  width: 76,
                  height: 76,
                  background: selected === p.partId ? 'rgba(253,230,138,.25)' : 'var(--surface-sheet)',
                  border: selected === p.partId ? '2px solid var(--text-warm)' : '1px solid var(--border-soft)',
                  touchAction: 'none',
                }}
              >
                <img src={p.partSrc} alt={p.partLabel} draggable={false} style={{ width: 44, height: 44, objectFit: 'contain', pointerEvents: 'none' }} />
              </button>
            ))}
          </div>
        </>
      )}

      {ghostPart && (
        <div
          className="fixed pointer-events-none z-40 flex items-center justify-center"
          style={{
            left: ghostX,
            top: ghostY,
            width: 76,
            height: 76,
            transform: 'translate(-50%, -50%)',
            transition: ghostAnimating ? `left ${SNAP_ANIM_MS}ms var(--ease-settle), top ${SNAP_ANIM_MS}ms var(--ease-settle)` : undefined,
          }}
        >
          <img src={ghostPart.partSrc} alt="" style={{ width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.4))' }} />
          {dropAnim?.kind === 'settle' && !reducedMotion && (
            <div
              className="absolute rounded-full"
              style={{ width: 90, height: 90, background: 'radial-gradient(circle, rgba(253,230,138,.9) 0%, rgba(253,230,138,0) 70%)', animation: 'lens-flare 420ms var(--ease-soft) both' }}
            />
          )}
        </div>
      )}
    </div>
  )
}
