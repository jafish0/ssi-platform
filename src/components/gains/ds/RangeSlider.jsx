// Shadowmend design system — RangeSlider (Draft 73, rebuilt Draft 76).
//
// The Motivation / Readiness to Change Ruler items, drawn as a literal
// ruler (Draft 76, team feedback: bare numbers don't connect with a kid):
//   - the track is a NUMBER LINE with ten evenly spaced, labeled ticks 1–10;
//   - unanswered, the thumb parks in a distinct hollow spot to the LEFT of
//     tick 1, off the line, with "Drag the slider to choose." -- the visible
//     version of Ready for Roots' "rest one tick before min". It counts as
//     unanswered until dragged onto the line;
//   - dragging snaps to whole ticks; the chosen tick lights up amber and the
//     number shows large; once on the line the thumb can't go back to the
//     parking spot (an answer stays an answer until changed);
//   - optional `anchorLow` / `anchorHigh` words sit under tick 1 and tick 10
//     (left empty for now -- the source measure has no anchor wording).
// Custom-drawn (a native <input type="range"> can't show labeled ticks or
// an off-line parking spot), but keeps the semantics: role="slider", arrow
// / Home / End keys, a 48px thumb hit area, tokens throughout, and no
// motion under prefers-reduced-motion.

import { useRef } from 'react'

const PAD_LEFT = 44 // px reserved for the parking spot, left of tick 1
const PAD_RIGHT = 16
const THUMB = 28
const HIT = 48

const CSS = `
.gains-ruler-thumb { transition: left .12s ease-out; }
@media (prefers-reduced-motion: reduce) { .gains-ruler-thumb { transition: none; } }
`

export default function RangeSlider({ min = 1, max = 10, value, onChange, anchorLow, anchorHigh, name }) {
  const trackRef = useRef(null)
  const dragging = useRef(false)
  const touched = value != null
  const count = max - min + 1
  const ticks = Array.from({ length: count }, (_, i) => min + i)

  // Tick i (0-based) sits at this fraction of the usable track width.
  const frac = (i) => (count > 1 ? i / (count - 1) : 0)
  const tickLeft = (i) => `calc(${PAD_LEFT}px + (100% - ${PAD_LEFT + PAD_RIGHT}px) * ${frac(i)})`
  const parkLeft = `${PAD_LEFT / 2 - 2}px`

  // `moving` = part of a drag already in progress. A pointer that STARTS in
  // the parking zone (left of tick 1 by more than half a step) is never an
  // answer -- unanswered stays unanswered, and an existing answer stays put
  // -- while a drag that slides off the left end just clamps to 1.
  function valueFromClientX(clientX, moving = false) {
    const el = trackRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const usable = rect.width - PAD_LEFT - PAD_RIGHT
    if (usable <= 0) return null
    const t = (clientX - rect.left - PAD_LEFT) / usable
    const step = 1 / (count - 1)
    if (t < -step / 2) return moving ? min : null
    return Math.max(min, Math.min(max, min + Math.round(t * (count - 1))))
  }

  function commit(n) {
    if (n == null || n === value) return
    onChange(n)
  }

  function onPointerDown(e) {
    dragging.current = true
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    commit(valueFromClientX(e.clientX))
  }
  function onPointerMove(e) {
    if (!dragging.current) return
    commit(valueFromClientX(e.clientX, true))
  }
  function onPointerUp() {
    dragging.current = false
  }

  function onKeyDown(e) {
    const cur = touched ? value : min - 1
    let next = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(max, cur + 1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(min, cur - 1)
    else if (e.key === 'Home') next = min
    else if (e.key === 'End') next = max
    else return
    e.preventDefault()
    commit(next)
  }

  const thumbLeft = touched ? tickLeft(value - min) : parkLeft

  return (
    <div data-ruler style={{ userSelect: 'none' }}>
      <style>{CSS}</style>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={name}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={touched ? value : undefined}
        aria-valuetext={touched ? String(value) : 'not yet chosen'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative outline-none focus-visible:ring-2"
        style={{ height: 66, touchAction: 'none', cursor: 'pointer', borderRadius: 12 }}
      >
        {/* the line */}
        <div
          className="absolute"
          style={{ left: PAD_LEFT, right: PAD_RIGHT, top: 22, height: 4, borderRadius: 2, background: 'var(--border-strong)' }}
        />
        {/* the answered portion, tick 1 -> chosen tick */}
        {touched && (
          <div
            className="absolute"
            style={{ left: PAD_LEFT, width: `calc((100% - ${PAD_LEFT + PAD_RIGHT}px) * ${frac(value - min)})`, top: 22, height: 4, borderRadius: 2, background: 'var(--action-primary)', boxShadow: 'var(--glow-sm)' }}
          />
        )}
        {/* ticks + labels */}
        {ticks.map((n, i) => {
          const on = touched && n === value
          return (
            <div key={n} className="absolute" style={{ left: tickLeft(i), top: 14, width: 0 }} aria-hidden="true">
              <div style={{ position: 'absolute', left: -1, top: 0, width: 2, height: 20, borderRadius: 1, background: on ? 'var(--action-primary)' : 'var(--border-strong)' }} />
              <div
                className="absolute text-center leading-none"
                style={{
                  left: -14,
                  width: 28,
                  top: 26,
                  fontSize: on ? 13 : 11,
                  fontWeight: on ? 800 : 600,
                  color: on ? 'var(--text-warm)' : 'var(--text-body)',
                }}
              >
                {n}
              </div>
            </div>
          )
        })}
        {/* parking spot, left of tick 1 (visible only while unanswered) */}
        {!touched && (
          <div
            className="absolute rounded-full"
            aria-hidden="true"
            style={{ left: `calc(${parkLeft} - ${THUMB / 2}px)`, top: 24 - THUMB / 2, width: THUMB, height: THUMB, border: '2px dashed var(--border-strong)', opacity: 0.8 }}
          />
        )}
        {/* the thumb (48px hit area, 28px visible) */}
        <div
          className="gains-ruler-thumb absolute flex items-center justify-center"
          aria-hidden="true"
          style={{ left: `calc(${thumbLeft} - ${HIT / 2}px)`, top: 24 - HIT / 2, width: HIT, height: HIT }}
        >
          <div
            className="rounded-full"
            style={{
              width: THUMB,
              height: THUMB,
              background: touched ? 'var(--action-primary)' : 'var(--surface-night)',
              border: touched ? '2px solid var(--light-100)' : '2px solid var(--border-strong)',
              boxShadow: touched ? 'var(--glow-md)' : 'none',
              opacity: touched ? 1 : 0.85,
            }}
          />
        </div>
      </div>
      {(anchorLow || anchorHigh) && (
        <div className="relative text-[10px] font-semibold leading-tight" style={{ height: 14, color: 'var(--text-body)' }} aria-hidden="true">
          <span className="absolute" style={{ left: PAD_LEFT - 10 }}>
            {anchorLow}
          </span>
          <span className="absolute text-right" style={{ right: PAD_RIGHT - 10 }}>
            {anchorHigh}
          </span>
        </div>
      )}
      <div className="text-center mt-1 leading-none" aria-hidden="true">
        {touched ? (
          <span className="text-[26px] font-extrabold" style={{ color: 'var(--text-warm)' }}>
            {value}
          </span>
        ) : (
          <span className="text-[12px] italic" style={{ color: 'var(--text-body)' }}>
            Drag the slider to choose.
          </span>
        )}
      </div>
    </div>
  )
}
