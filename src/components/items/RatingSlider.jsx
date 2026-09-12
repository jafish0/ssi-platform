// RatingSlider — custom pointer-drawn 0..N slider, ported from GAINS for
// Teens' RangeSlider.jsx (Draft 73/76) after Josh flagged the native
// `<input type=range>` version used here (Draft 108, all three
// PsychometricScale/SurveyItems/Pretest sliders): its "rest one tick
// before min" hack lives on the SAME continuous track as the real
// answer range, so (1) dragging back toward min can silently no-op right
// at the boundary — the browser lets the thumb drift into the dead tick
// while the onChange guard rejects it, leaving the displayed value stuck
// — and (2) there's no visually distinct place the slider actually
// starts from, just one more tick blending into the line.
//
// This keeps GAINS' fix: the rest position is a separate, off-track
// "parking spot" (not reachable by dragging along the real min..max
// range at all), and once an answer is set it stays a real point ON the
// track, freely reachable anywhere including exactly at min. Like
// GAINS', once touched there's no dragging back to "unanswered" — an
// answer stays an answer until the caller resets it.
//
// Generalized from GAINS' version to take an arbitrary `step` (GAINS'
// Readiness Ruler is always whole ticks 1..10; Ready for Roots' VAS
// items can be 0-100/step 1, so ticks-drawn and step-snapped are no
// longer the same thing) and an optional explicit `ticks` array (VAS
// thins a 0-100 line to 11 labeled ticks — see buildVasNumberLine in
// PsychometricScale.jsx — while still snapping drag/keys to every step).
//
// Callers keep owning the anchor-label row and the value/placeholder
// readout below this, same as before — this component only draws the
// track, ticks, thumb, and parking spot.

import { useRef } from 'react'

const PAD_LEFT = 44 // px reserved for the parking spot, left of the track
const PAD_RIGHT = 16
const THUMB = 28
const HIT = 48

const CSS = `
.rfr-rating-slider-thumb { transition: left .12s ease-out; }
@media (prefers-reduced-motion: reduce) { .rfr-rating-slider-thumb { transition: none; } }
`

export default function RatingSlider({ min, max, step = 1, value, onChange, ticks, ariaLabel }) {
  const trackRef = useRef(null)
  const dragging = useRef(false)
  const touched = value != null
  const tickValues =
    ticks && ticks.length > 0
      ? ticks
      : Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => min + i * step)

  const frac = (v) => (max > min ? (v - min) / (max - min) : 0)
  const posLeft = (f) => `calc(${PAD_LEFT}px + (100% - ${PAD_LEFT + PAD_RIGHT}px) * ${f})`
  const parkLeft = `${PAD_LEFT / 2 - 2}px`

  // A pointer that STARTS in the parking zone (more than half a step left
  // of min) is never an answer; a drag already in progress that slides
  // off the left end just clamps to min instead.
  function valueFromClientX(clientX, moving = false) {
    const el = trackRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const usable = rect.width - PAD_LEFT - PAD_RIGHT
    if (usable <= 0) return null
    const t = (clientX - rect.left - PAD_LEFT) / usable
    const stepFrac = step / (max - min)
    if (t < -stepFrac / 2) return moving ? min : null
    const raw = min + t * (max - min)
    const snapped = Math.round(raw / step) * step
    return Math.max(min, Math.min(max, snapped))
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
    const cur = touched ? value : min - step
    let next = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(max, cur + step)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(min, cur - step)
    else if (e.key === 'Home') next = min
    else if (e.key === 'End') next = max
    else return
    e.preventDefault()
    commit(next)
  }

  const thumbLeft = touched ? posLeft(frac(value)) : parkLeft

  return (
    <div style={{ userSelect: 'none' }}>
      <style>{CSS}</style>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={touched ? value : undefined}
        aria-valuetext={touched ? String(value) : 'not yet chosen'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative w-full outline-none focus-visible:ring-2 focus-visible:ring-ctac-teal-400 rounded-xl"
        style={{ height: 66, touchAction: 'none', cursor: 'pointer' }}
      >
        {/* the line */}
        <div
          className="absolute bg-slate-200 rounded-full"
          style={{ left: PAD_LEFT, right: PAD_RIGHT, top: 22, height: 4 }}
        />
        {/* the answered portion, min -> chosen value */}
        {touched && (
          <div
            className="absolute bg-ctac-teal-500 rounded-full"
            style={{
              left: PAD_LEFT,
              width: `calc((100% - ${PAD_LEFT + PAD_RIGHT}px) * ${frac(value)})`,
              top: 22,
              height: 4,
            }}
          />
        )}
        {/* ticks + labels */}
        {tickValues.map((n) => {
          const on = touched && n === value
          return (
            <div key={n} className="absolute" style={{ left: posLeft(frac(n)), top: 14, width: 0 }} aria-hidden="true">
              <div
                className={'absolute rounded-full ' + (on ? 'bg-ctac-teal-500' : 'bg-slate-300')}
                style={{ left: -1, top: 0, width: 2, height: 20 }}
              />
              <div
                className={
                  'absolute text-center leading-none tabular-nums ' +
                  (on ? 'text-ctac-teal-800 font-semibold' : 'text-slate-400')
                }
                style={{ left: -14, width: 28, top: 26, fontSize: on ? 12 : 10 }}
              >
                {n}
              </div>
            </div>
          )
        })}
        {/* parking spot, left of the track (visible only while unanswered) */}
        {!touched && (
          <div
            className="absolute rounded-full border-2 border-dashed border-slate-300"
            aria-hidden="true"
            style={{ left: `calc(${parkLeft} - ${THUMB / 2}px)`, top: 24 - THUMB / 2, width: THUMB, height: THUMB, opacity: 0.8 }}
          />
        )}
        {/* the thumb (48px hit area, 28px visible) */}
        <div
          className="rfr-rating-slider-thumb absolute flex items-center justify-center"
          aria-hidden="true"
          style={{ left: `calc(${thumbLeft} - ${HIT / 2}px)`, top: 24 - HIT / 2, width: HIT, height: HIT }}
        >
          <div
            className={
              'rounded-full border-2 ' +
              (touched ? 'bg-ctac-teal-500 border-white shadow' : 'bg-white border-slate-300')
            }
            style={{ width: THUMB, height: THUMB }}
          />
        </div>
      </div>
    </div>
  )
}
