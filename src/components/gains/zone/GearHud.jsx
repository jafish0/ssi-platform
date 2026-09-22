// Gear HUD for the walkable zone (GAINS Draft 68, genericized Draft 80):
// four small slots in the frame's top-left, in a fixed canonical order --
// Lantern, Focusing Lens, Wingsuit, Oxygen Mask -- the same order every
// zone's gear is earned in across the game.
//
// Gear already earned in an EARLIER zone shows as a plain, neutral icon
// (Draft 68's "dimmed placeholder" look -- see `earned`). THIS zone's own
// gear (`newKey`) starts as an empty dashed slot with no icon at all, then
// switches to `active` + the item's own image once `equipped`, flying in
// from the frame's center (see `flyIn`, bumped by the host on equip/receive
// -- `frameRef` measures against). Any other slot (gear not yet reached) is
// a locked preview, same empty/dashed look as the current zone's gear
// before it's earned.

import { useEffect, useRef, useState } from 'react'
import { Flame, Aperture, Wind } from 'lucide-react'

const SLOT = 34

const GEAR_ORDER = [
  { key: 'lantern', label: 'Lantern', icon: <Flame size={16} strokeWidth={1.75} /> },
  { key: 'lens', label: 'Focusing Lens', icon: <Aperture size={16} strokeWidth={1.75} /> },
  { key: 'wingsuit', label: 'Wingsuit', icon: <Wind size={16} strokeWidth={1.75} /> },
  // The Mask has no lucide stand-in -- like the others before it earned its
  // own art, it shows nothing at all while locked/previewed.
  { key: 'mask', label: 'Oxygen Mask', icon: null },
]

function Slot({ label, children, active, empty, slotRef }) {
  return (
    <div
      ref={slotRef}
      title={label}
      aria-label={label + (empty ? ' (not yet earned)' : '')}
      style={{
        width: SLOT,
        height: SLOT,
        borderRadius: 'var(--radius-pill)',
        display: 'grid',
        placeItems: 'center',
        background: active ? 'rgba(253,230,138,.18)' : 'var(--surface-sheet)',
        border: `1px ${empty ? 'dashed' : 'solid'} ${active ? 'var(--border-warm)' : 'var(--border-soft)'}`,
        boxShadow: active ? 'var(--glow-sm)' : 'none',
        color: active ? 'var(--text-warm)' : 'var(--text-faint)',
        opacity: empty ? 0.75 : 1,
        transition: 'background var(--dur-slow) var(--ease-soft), box-shadow var(--dur-slow) var(--ease-soft)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}

export default function GearHud({ earned = [], newKey, iconSrc, equipped, flyIn, frameRef }) {
  const newSlotRef = useRef(null)
  const [fly, setFly] = useState(null) // { x, y, w } target rect (frame-relative)

  // Fly-in: render a copy of the icon at the frame's center, then on the
  // next frame move it to the slot; the CSS transition carries it.
  useEffect(() => {
    if (!flyIn || !frameRef?.current || !newSlotRef.current) return
    const f = frameRef.current.getBoundingClientRect()
    const s = newSlotRef.current.getBoundingClientRect()
    setFly({ start: true, x: s.left - f.left + 3, y: s.top - f.top + 3, w: SLOT - 6 })
    const id = requestAnimationFrame(() => setFly((v) => (v ? { ...v, start: false } : v)))
    const done = setTimeout(() => setFly(null), 1000)
    return () => {
      cancelAnimationFrame(id)
      clearTimeout(done)
    }
  }, [flyIn, frameRef])

  return (
    <>
      <div className="absolute z-10 flex items-center gap-1.5" style={{ top: 12, left: 12, pointerEvents: 'none' }} aria-label="Your gear">
        {GEAR_ORDER.map((g) => {
          const isNew = g.key === newKey
          const active = isNew && !!equipped
          const empty = isNew ? !equipped : !earned.includes(g.key)
          return (
            <Slot key={g.key} label={g.label} active={active} empty={empty} slotRef={isNew ? newSlotRef : undefined}>
              {isNew ? (equipped && !fly ? <img src={iconSrc} alt="" style={{ width: SLOT - 6, height: SLOT - 6, objectFit: 'contain' }} /> : null) : earned.includes(g.key) ? g.icon : null}
            </Slot>
          )
        })}
      </div>
      {fly && (
        <img
          src={iconSrc}
          alt=""
          className="absolute z-20"
          style={{
            pointerEvents: 'none',
            left: fly.start ? '50%' : fly.x,
            top: fly.start ? '46%' : fly.y,
            width: fly.start ? 140 : fly.w,
            height: fly.start ? 140 : fly.w,
            transform: fly.start ? 'translate(-50%, -50%)' : 'none',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 18px rgba(253,230,138,.7))',
            transition: 'left .8s var(--ease-bloom), top .8s var(--ease-bloom), width .8s var(--ease-bloom), height .8s var(--ease-bloom), transform .8s var(--ease-bloom)',
          }}
        />
      )}
    </>
  )
}
