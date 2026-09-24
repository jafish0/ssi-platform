// "The Fogline" (GAINS Draft 95) -- the DOM layer that owns everything
// interesting about this traversal: the draggable Focusing Lens, the fog it
// reveals, the stone-focus timer, the two looming shapes, the assist
// glimmer, and Spark's VO sequencing. `TraversalGame mode="fogline"` (see
// `src/game/foglineScene.js`) is a thin slave underneath: it renders the
// plate + Traveler + companion Spark and animates one hop per command this
// component sends it, nothing more. See foglineScene.js's own header
// comment for why the split lands here rather than inside Phaser -- in
// short, the fog is DOM/SVG (its motion.css says so: "mask #layer-fog-a and
// #layer-fog-b... in code") and the stones/bush/stump are already painted
// into the plate art, so there's nothing left for Phaser to own besides the
// hop animation itself.
//
// Reusable by both the wired-in Zone 2 flow (GainsZone2Page passes its own
// zone2Audio manager's speak/duck/sfx) and the standalone practice page
// (which has no host audio manager -- see GainsFoglinePage.jsx).

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import TraversalGame from '../../TraversalGame.jsx'
import { FOGLINE_STONES } from '../../../game/foglineRoute.js'

const OV_BASE = '/long-light/zone2/ov/fogline'
const LENS_R = 150 // logical px (1080-wide plate), matches the draft
const LENS_FEATHER = 30
const FOCUS_R = 140
const SHAPE_NUDGE_R = 200
const STILL_PX = 8
const HOLD_MS = 500
const GLIMMER_FIRST_MS = 12000
const GLIMMER_REPEAT_MS = 8000

const SHAPES = [
  { key: 'hunched', x: 250, y: 590 },
  { key: 'tall', x: 845, y: 1195 },
]

const MASKED_LAYERS = [
  { key: 'fog-a', file: 'layer-fog-a.svg' },
  { key: 'fog-b', file: 'layer-fog-b.svg' },
]
const AMBIENT_LAYERS = [
  { key: 'mist-top', file: 'layer-mist-top.svg', blend: 'normal' },
  { key: 'motes', file: 'layer-motes.svg', blend: 'screen' },
  { key: 'lamp-glow', file: 'layer-lamp-glow.svg', blend: 'screen' },
]

function fetchText(url) {
  return fetch(url).then((r) => (r.ok ? r.text() : null)).catch(() => null)
}
function prepSvg(svg) {
  return svg.replace(/preserveAspectRatio="[^"]*"/, '').replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ')
}
function pct(x, y) {
  return { left: `${(x / 1080) * 100}%`, top: `${(y / 1920) * 100}%` }
}

const FoglineTraversal = forwardRef(function FoglineTraversal(
  { started, muted, reducedMotion, restartSignal = 0, speak, duck, sfx, onComplete },
  ref,
) {
  const gameRef = useRef(null)
  const frameRef = useRef(null)
  const [frameW, setFrameW] = useState(360)
  const [layers, setLayers] = useState(null)
  const [motion, setMotion] = useState('')

  const [lensPos, setLensPos] = useState({ x: FOGLINE_STONES[0].x, y: FOGLINE_STONES[0].y })
  const [dragging, setDragging] = useState(false)
  const [locked, setLocked] = useState(true) // t2-01-start holds the lens until it ends
  const [nextIndex, setNextIndex] = useState(1)
  const [focused, setFocused] = useState(false)
  const [glimmerAt, setGlimmerAt] = useState(0) // bumps to retrigger the CSS pulse
  const [shapesResolved, setShapesResolved] = useState({})
  const [shapesShrinking, setShapesShrinking] = useState({})
  const [arriving, setArriving] = useState(false)

  const pointerRef = useRef({ x: 0, y: 0 })
  const stillSinceRef = useRef(0)
  const lastStillPosRef = useRef(null)
  const shapeHoldRef = useRef({})
  const idleSinceRef = useRef(0)
  const lastGlimmerRef = useRef(0)
  const nudgeFiredRef = useRef(false)
  const resolveFiredRef = useRef(false)
  const firstStoneFiredRef = useRef(false)
  const halfwayFiredRef = useRef(false)
  const stonesHoppedRef = useRef(0)
  const nextIndexRef = useRef(1)
  nextIndexRef.current = nextIndex
  const focusedRef = useRef(false)
  focusedRef.current = focused

  // ---- fetch the overlay set once ----
  useEffect(() => {
    let cancelled = false
    const all = [...MASKED_LAYERS, ...AMBIENT_LAYERS]
    Promise.all([fetchText(`${OV_BASE}/motion.css`), ...all.map((l) => fetchText(`${OV_BASE}/${l.file}`))]).then(([css, ...svgs]) => {
      if (cancelled) return
      setMotion(css || '')
      setLayers(all.map((l, i) => (svgs[i] ? { ...l, svg: prepSvg(svgs[i]) } : null)).filter(Boolean))
    })
    return () => {
      cancelled = true
    }
  }, [])

  // ---- track the frame's rendered width so the lens's logical radius
  // (authored against the 1080-wide plate) converts to real px for the
  // mask-image (CSS radial-gradient's circle() needs a length, not a
  // percentage) -- same technique GearHud already uses for its fly-in
  // animation against a frameRef. ----
  useEffect(() => {
    if (!frameRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setFrameW(e.contentRect.width)
    })
    ro.observe(frameRef.current)
    return () => ro.disconnect()
  }, [])

  // ---- reset + t2-01-start, on mount once started AND on every replay.
  // `restartSignal` only resets the Phaser scene underneath (TraversalGame
  // restarts it in place) -- this component's own React state (which
  // stone's next, the lens position, resolved shapes, the fired-once VO
  // flags) doesn't touch Phaser at all, so without this it would carry
  // over stale into "Try again" while the scene silently reset under it. ----
  const firstRunRef = useRef(true)
  useEffect(() => {
    if (!started) return
    if (firstRunRef.current) {
      firstRunRef.current = false
    } else {
      setNextIndex(1)
      nextIndexRef.current = 1
      setFocused(false)
      focusedRef.current = false
      setShapesResolved({})
      setShapesShrinking({})
      setArriving(false)
      setGlimmerAt(0)
      setLensPos({ x: FOGLINE_STONES[0].x, y: FOGLINE_STONES[0].y })
      posRef.current = { x: FOGLINE_STONES[0].x, y: FOGLINE_STONES[0].y }
      stonesHoppedRef.current = 0
      shapeHoldRef.current = {}
      lastStillPosRef.current = null
      nudgeFiredRef.current = false
      resolveFiredRef.current = false
      firstStoneFiredRef.current = false
      halfwayFiredRef.current = false
    }
    setLocked(true)
    idleSinceRef.current = performance.now()
    speak?.('t2-01-start.mp3').then(() => setLocked(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, restartSignal])

  // Latest values for the rAF loop below, without tearing it down and
  // restarting it on every change (see the loop's own comment for why that
  // mattered: an early version keyed a *separate* setInterval off `lensPos`
  // itself, which re-mounted on literally every eased frame and made the
  // 500ms "held still" check sample at whatever cadence React's re-render
  // happened to allow -- coarse and unpredictable enough that a stone could
  // read as "focused" while the lens was still hundreds of px away, because
  // two widely-spaced samples of a smoothly-moving point can land closer
  // together than STILL_PX purely by chance).
  const draggingRef = useRef(false)
  draggingRef.current = dragging
  const lockedRef = useRef(true)
  lockedRef.current = locked
  const shapesResolvedRef = useRef({})
  shapesResolvedRef.current = shapesResolved
  // The rAF loop's own working copy of the lens position -- a plain ref
  // (not the `lensPos` state) so the loop can mutate it every frame without
  // paying for a re-render each time; `lensPos` is a throttled mirror of
  // this, pushed for rendering only (see the loop below). The restart
  // effect above resets THIS too, not just the state mirror -- otherwise
  // the very next throttled push would stomp the reset state right back to
  // wherever this ref was left at "arrival."
  const posRef = useRef({ x: FOGLINE_STONES[0].x, y: FOGLINE_STONES[0].y })

  // ---- the single per-frame loop: lens follow, stillness/focus timer,
  // shape timers, assist glimmer. One rAF loop for the whole traversal so
  // the stillness check always samples the SAME position the lens is
  // actually being rendered at, at a true 60fps cadence -- not gated behind
  // a second effect keyed on state that loop itself changes. ----
  useEffect(() => {
    if (!started) return
    let raf = null
    let lastT = performance.now()
    let renderThrottle = 0
    function tick(now) {
      const dt = now - lastT
      lastT = now
      const pos = posRef.current

      if (draggingRef.current && !lockedRef.current) {
        const k = 1 - Math.exp(-dt / 140)
        pos.x += (pointerRef.current.x - pos.x) * k
        pos.y += (pointerRef.current.y - pos.y) * k
      }

      if (!lockedRef.current) {
        const last = lastStillPosRef.current
        const moved = last ? Math.hypot(pos.x - last.x, pos.y - last.y) : Infinity
        lastStillPosRef.current = { x: pos.x, y: pos.y }
        if (moved > STILL_PX) stillSinceRef.current = now

        if (!focusedRef.current && nextIndexRef.current < FOGLINE_STONES.length) {
          const st = FOGLINE_STONES[nextIndexRef.current]
          const d = Math.hypot(pos.x - st.x, pos.y - st.y)
          if (d <= FOCUS_R && now - stillSinceRef.current >= HOLD_MS) {
            focusedRef.current = true
            setFocused(true)
            sfx?.('chime-unlock')
            if (!firstStoneFiredRef.current && nextIndexRef.current === 1) {
              firstStoneFiredRef.current = true
              speak?.('t2-02-first-stone.mp3')
            }
          } else if (now - idleSinceRef.current > GLIMMER_FIRST_MS && now - lastGlimmerRef.current > GLIMMER_REPEAT_MS) {
            lastGlimmerRef.current = now
            setGlimmerAt(now)
          }
        }

        SHAPES.forEach((s) => {
          if (shapesResolvedRef.current[s.key]) return
          const d = Math.hypot(pos.x - s.x, pos.y - s.y)
          const holdKey = s.key
          if (d <= FOCUS_R) {
            shapeHoldRef.current[holdKey] = shapeHoldRef.current[holdKey] || now
            if (now - shapeHoldRef.current[holdKey] >= HOLD_MS) {
              shapeHoldRef.current[holdKey] = null
              setShapesShrinking((s2) => ({ ...s2, [holdKey]: true }))
              setTimeout(() => setShapesResolved((s2) => ({ ...s2, [holdKey]: true })), reducedMotion ? 1 : 800)
              if (!resolveFiredRef.current) {
                resolveFiredRef.current = true
                speak?.('t2-03b-shape-resolves.mp3')
              }
            }
          } else {
            shapeHoldRef.current[holdKey] = null
            if (d <= SHAPE_NUDGE_R && moved > STILL_PX && !nudgeFiredRef.current) {
              nudgeFiredRef.current = true
              speak?.('t2-03a-first-shape.mp3')
            }
          }
        })
      }

      // Push to React state at ~15fps -- plenty smooth for a dragged
      // position and CSS-transitioned markers, without a full re-render
      // (mask gradient + every layer div) on every single rAF tick.
      renderThrottle += dt
      if (renderThrottle > 66) {
        renderThrottle = 0
        setLensPos({ x: pos.x, y: pos.y })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started])

  function beginDrag(e) {
    if (locked || arriving) return
    const rect = frameRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 1080
    const y = ((e.clientY - rect.top) / rect.height) * 1920
    pointerRef.current = { x, y }
    setDragging(true)
  }
  useEffect(() => {
    if (!dragging) return
    function move(e) {
      const rect = frameRef.current.getBoundingClientRect()
      pointerRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 1080,
        y: ((e.clientY - rect.top) / rect.height) * 1920,
      }
    }
    function up() {
      setDragging(false)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [dragging])

  function onHopEvent(evt) {
    if (evt?.type !== 'hopped') return
    stonesHoppedRef.current += 1
    idleSinceRef.current = performance.now()
    stillSinceRef.current = performance.now()
    // Set the refs directly, not just the state -- the rAF loop reads
    // these every frame and shouldn't have to wait a render to notice a
    // hop landed (same reasoning as the focus-timer fix above).
    focusedRef.current = false
    setFocused(false)
    nextIndexRef.current = evt.index + 1
    setNextIndex(evt.index + 1)
    if (evt.index === 5 && !halfwayFiredRef.current) {
      halfwayFiredRef.current = true
      speak?.('t2-04-halfway.mp3')
    }
    if (evt.index === FOGLINE_STONES.length - 1) {
      setArriving(true)
      duck?.(true)
      speak?.('t2-05-arrive.mp3').then(() => {
        duck?.(false)
        setTimeout(() => onComplete?.({ stonesHopped: stonesHoppedRef.current, shapesRevealed: Object.keys(shapesResolved).length }), reducedMotion ? 200 : 2000)
      })
    }
  }

  function tapStone() {
    if (!focused || arriving) return
    gameRef.current?.sendCommand({ type: 'hop', index: nextIndex })
  }

  const scale = frameW / 1080
  const lensRPx = LENS_R * scale
  const lensXPct = (lensPos.x / 1080) * 100
  const lensYPct = (lensPos.y / 1920) * 100
  const maskStyle = useMemo(() => {
    const clear = Math.max(0, lensRPx - LENS_FEATHER)
    const grad = `radial-gradient(circle ${lensRPx}px at ${lensXPct}% ${lensYPct}%, transparent 0px, transparent ${clear}px, black ${lensRPx}px)`
    return { WebkitMaskImage: grad, maskImage: grad }
  }, [lensRPx, lensXPct, lensYPct])

  const nextStone = FOGLINE_STONES[nextIndex]

  return (
    <div ref={frameRef} className="relative w-full h-full" style={{ touchAction: 'none' }} onPointerDown={beginDrag}>
      <style>{`
        .flg-ov { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .flg-ov svg { position: absolute; inset: 0; width: 100% !important; height: 100% !important; display: block; }
        @keyframes flg-glimmer { 0% { opacity: 0; transform: scale(.6) } 40% { opacity: .95; transform: scale(1.2) } 100% { opacity: 0; transform: scale(1.6) } }
        @keyframes flg-rim-in { from { opacity: 0; transform: scale(.7) } to { opacity: 1; transform: scale(1) } }
        .flg-shape { transition: opacity ${reducedMotion ? 200 : 800}ms var(--ease-soft), transform ${reducedMotion ? 200 : 800}ms var(--ease-soft) }
      `}</style>

      <TraversalGame
        ref={gameRef}
        mode="fogline"
        started={started}
        muted={muted}
        reducedMotion={reducedMotion}
        restartSignal={restartSignal}
        onEvent={onHopEvent}
        onDuck={duck}
      />

      {layers && (
        <>
          <div className="flg-ov" style={maskStyle} aria-hidden="true">
            {motion && <style>{motion}</style>}
            {layers
              .filter((l) => MASKED_LAYERS.some((m) => m.key === l.key))
              .map((l) => (
                <div key={l.key} data-layer={l.key} style={{ opacity: 0.62 }} dangerouslySetInnerHTML={{ __html: l.svg }} />
              ))}
          </div>
          <div className="flg-ov" aria-hidden="true">
            {layers
              .filter((l) => AMBIENT_LAYERS.some((m) => m.key === l.key))
              .map((l) => (
                <div key={l.key} data-layer={l.key} style={{ mixBlendMode: AMBIENT_LAYERS.find((m) => m.key === l.key).blend }} dangerouslySetInnerHTML={{ __html: l.svg }} />
              ))}
          </div>
        </>
      )}

      {SHAPES.map((s) => {
        if (shapesResolved[s.key]) return null
        const shrinking = shapesShrinking[s.key]
        const wide = s.key === 'hunched'
        return (
          <div
            key={s.key}
            className="absolute flg-shape"
            style={{
              ...pct(s.x, s.y),
              transform: `translate(-50%, -100%) scale(${shrinking ? 0.1 : 1})`,
              opacity: shrinking ? 0 : 0.86,
              width: wide ? '18%' : '11%',
              aspectRatio: wide ? '1.3 / 1' : '0.6 / 1',
              borderRadius: '50% 50% 42% 42% / 60% 60% 40% 40%',
              background: 'radial-gradient(ellipse at 50% 30%, rgba(10,14,24,.95) 0%, rgba(10,14,24,.75) 70%, rgba(10,14,24,0) 100%)',
            }}
          />
        )
      })}

      {!arriving && nextStone && (
        <button
          type="button"
          onClick={tapStone}
          aria-label={focused ? 'Hop to the next stone' : 'The next stone (not yet in focus)'}
          className="absolute rounded-full"
          style={{
            ...pct(nextStone.x, nextStone.y),
            width: 64,
            height: 64,
            transform: 'translate(-50%, -50%)',
            border: focused ? '3px solid #f5cf7a' : 'none',
            boxShadow: focused ? '0 0 18px 4px rgba(245,207,122,.55)' : 'none',
            animation: focused ? 'flg-rim-in 300ms var(--ease-settle) both' : glimmerAt ? 'flg-glimmer 1.4s var(--ease-soft)' : undefined,
            background: 'transparent',
            cursor: focused ? 'pointer' : 'default',
          }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background: '#03060d',
          opacity: arriving ? 0 : 0,
          transition: arriving ? `opacity ${reducedMotion ? 200 : 2000}ms var(--ease-soft)` : undefined,
          pointerEvents: 'none',
        }}
      />

      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: `${lensXPct}%`,
          top: `${lensYPct}%`,
          width: lensRPx * 2,
          height: lensRPx * 2,
          transform: 'translate(-50%, -50%)',
          border: '3px solid rgba(214,178,110,.85)',
          boxShadow: 'inset 0 0 30px rgba(255,240,210,.25), 0 0 20px rgba(214,178,110,.35)',
          background: 'radial-gradient(circle, rgba(255,255,255,.05) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
    </div>
  )
})

export default FoglineTraversal
