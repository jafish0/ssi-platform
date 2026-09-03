// Gear HUD for the walkable zone (GAINS Draft 68): four small slots in the
// frame's top-left. Lantern, Focusing Lens and Wingsuit show as earned but
// dimmed placeholders (they're from earlier zones); the Oxygen Mask slot sits
// empty until the Gear Award equips it, when the mask icon flies in from the
// frame's center (see the `flyIn` prop). Unobtrusive by design.

import { useEffect, useRef, useState } from 'react'
import { Flame, Aperture, Wind } from 'lucide-react'

const SLOT = 34

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

export default function GearHud({ maskEquipped, maskSrc, flyIn, frameRef }) {
  const maskSlotRef = useRef(null)
  const [fly, setFly] = useState(null) // { x, y, w } target rect (frame-relative)

  // Mask fly-in: render a copy of the icon at the frame's center, then on
  // the next frame move it to the slot; the CSS transition carries it.
  useEffect(() => {
    if (!flyIn || !frameRef?.current || !maskSlotRef.current) return
    const f = frameRef.current.getBoundingClientRect()
    const s = maskSlotRef.current.getBoundingClientRect()
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
      <div
        className="absolute z-10 flex items-center gap-1.5"
        style={{ top: 12, left: 12, pointerEvents: 'none' }}
        aria-label="Your gear"
      >
        <Slot label="Lantern">
          <Flame size={16} strokeWidth={1.75} />
        </Slot>
        <Slot label="Focusing Lens">
          <Aperture size={16} strokeWidth={1.75} />
        </Slot>
        <Slot label="Wingsuit">
          <Wind size={16} strokeWidth={1.75} />
        </Slot>
        <Slot label="Oxygen Mask" active={maskEquipped} empty={!maskEquipped} slotRef={maskSlotRef}>
          {maskEquipped && !fly && <img src={maskSrc} alt="" style={{ width: SLOT - 6, height: SLOT - 6, objectFit: 'contain' }} />}
        </Slot>
      </div>
      {fly && (
        <img
          src={maskSrc}
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
