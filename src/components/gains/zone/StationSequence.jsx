// The camp friend station sequence (GAINS Draft 94, Zone 2, item 1b) --
// beats 3-6 of "what happens at a station": name it, hold up the lantern,
// the lesson + thank-you, the part to the tray. Beat 1 (watch the station
// video) already happened before this mounts (GainsZone2Page plays it via
// the same VideoScene the zone's own video uses); Spark's `z2-04-name-it`
// line also already played, right before this mounted.
//
// Rendered as an OVERLAY on top of the still-visible walkable plate (not a
// full-screen takeover like BodyMapping/ElevatorPitch/MindfulnessCalmPlace)
// -- the whole point is the player is looking at their friend on the actual
// game world throughout. `posFor()` maps the friend's live Phaser position
// to a screen percentage, the same technique GainsZonePage's "Tap here"
// pointer uses, so the quiz/hold UI always sits right over them regardless
// of exactly where their station geometry places them.

import { useEffect, useRef, useState } from 'react'

const CHIPS = [
  { id: 'reactivity', label: 'Reactivity' },
  { id: 'intrusion', label: 'Intrusion' },
  { id: 'avoidance', label: 'Avoidance' },
  { id: 'mood', label: 'Negative mood and thoughts' },
]

const HOLD_MS = 2000

export default function StationSequence({ station, posFor, onLight, speakSpark, speakFriend, sfx, onComplete }) {
  // quiz -> hold -> lesson -> thanks -> partFly -> (calls onComplete)
  const [step, setStep] = useState('quiz')
  const [wrongIds, setWrongIds] = useState([])
  const [correctId, setCorrectId] = useState(null)
  const [holdT, setHoldT] = useState(0)
  const [pos, setPos] = useState(() => posFor(station.id) || { x: 540, y: 960 })
  const [thanksText, setThanksText] = useState(null)

  const holdRef = useRef({ holding: false, raf: null, startedAt: 0, base: 0 })
  const stepRef = useRef(step)
  stepRef.current = step

  // Keep the overlay locked to the friend's live position (breathing scale
  // moves it a hair; cheap to just poll like the Tap-here pointer does).
  useEffect(() => {
    const id = setInterval(() => setPos(posFor(station.id) || pos), 120)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station.id])

  function pickChip(chip) {
    if (step !== 'quiz' || correctId) return
    if (chip.id === station.answer) {
      setCorrectId(chip.id)
      sfx?.('ui-tap')
      setTimeout(() => setStep('hold'), 550)
    } else {
      setWrongIds((w) => (w.includes(chip.id) ? w : [...w, chip.id]))
      speakSpark?.(station.vo.hint)
    }
  }

  // Press-and-hold: a plain rAF loop accumulating held time, paused (not
  // reset) on release -- "let go early and it pauses where it is, hold
  // again and it continues" is just "the base carries over."
  function startHold() {
    if (stepRef.current !== 'hold' || holdRef.current.holding) return
    holdRef.current.holding = true
    holdRef.current.startedAt = performance.now()
    const tick = (now) => {
      if (!holdRef.current.holding) return
      const elapsed = holdRef.current.base + (now - holdRef.current.startedAt)
      const t = Math.min(1, elapsed / HOLD_MS)
      setHoldT(t)
      onLight?.(t)
      if (t >= 1) {
        holdRef.current.holding = false
        sfx?.('equip-flash')
        setTimeout(() => setStep('lesson'), 500)
        return
      }
      holdRef.current.raf = requestAnimationFrame(tick)
    }
    holdRef.current.raf = requestAnimationFrame(tick)
  }
  function endHold() {
    if (!holdRef.current.holding) return
    holdRef.current.holding = false
    holdRef.current.base += performance.now() - holdRef.current.startedAt
    if (holdRef.current.raf) cancelAnimationFrame(holdRef.current.raf)
  }
  useEffect(() => () => endHold(), [])

  // Lesson (doubles as the correct-answer confirm -- there's no separate
  // line for that), then the friend's own thank-you (audio + a bubble from
  // THEM, not Spark -- their name as the label).
  useEffect(() => {
    if (step !== 'lesson') return
    let cancelled = false
    speakSpark?.(station.vo.lesson).then(() => {
      if (cancelled) return
      setStep('thanks')
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  useEffect(() => {
    if (step !== 'thanks') return
    let cancelled = false
    setThanksText(station.thanksText)
    speakFriend?.(station.thanksAudio).then(() => {
      if (cancelled) return
      setThanksText(null)
      setStep('partFly')
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const [flyDone, setFlyDone] = useState(false)
  useEffect(() => {
    if (step !== 'partFly') return
    sfx?.('equip-flash')
    const id = setTimeout(() => setFlyDone(true), 40)
    const done = setTimeout(() => onComplete?.(), 780)
    return () => {
      clearTimeout(id)
      clearTimeout(done)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const leftPct = (pos.x / 1080) * 100
  const topPct = (pos.y / 1920) * 100

  return (
    <div className="absolute inset-0 z-20" style={{ pointerEvents: 'none' }}>
      {step === 'quiz' && (
        <div
          className="absolute left-0 right-0 px-4 pb-5 pt-8"
          style={{ bottom: 0, pointerEvents: 'auto', background: 'linear-gradient(0deg, rgba(2,17,39,.92) 0%, rgba(2,17,39,.65) 70%, transparent 100%)' }}
        >
          <div className="flex flex-wrap justify-center gap-2">
            {CHIPS.map((chip) => {
              const isCorrect = correctId === chip.id
              const isWrong = wrongIds.includes(chip.id) && !correctId
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => pickChip(chip)}
                  disabled={!!correctId}
                  className="px-3 py-2 rounded-full text-[13px] font-bold text-center"
                  style={{
                    flex: '0 0 calc(50% - 6px)',
                    background: isCorrect ? 'var(--action-primary)' : 'var(--action-quiet)',
                    color: isCorrect ? 'var(--text-on-warm)' : isWrong ? 'var(--text-faint)' : 'var(--text-bright)',
                    border: `1px solid ${isCorrect ? 'var(--action-primary)' : 'var(--border-soft)'}`,
                    opacity: isWrong ? 0.55 : 1,
                    boxShadow: isCorrect ? 'var(--glow-sm)' : 'none',
                  }}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 'hold' && (
        <div
          className="absolute"
          style={{
            left: `${leftPct}%`,
            top: `${topPct}%`,
            transform: 'translate(-50%, -60%)',
            width: 220,
            height: 220,
            pointerEvents: 'auto',
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture?.(e.pointerId)
            startHold()
          }}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
        >
          {/* The warm pool of lantern light, growing with hold progress. */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(253,230,138,.55) 0%, rgba(245,158,11,.28) 45%, rgba(245,158,11,0) 75%)',
              transform: `scale(${0.4 + holdT * 0.9})`,
              opacity: 0.4 + holdT * 0.6,
              transition: 'transform 80ms linear, opacity 80ms linear',
            }}
          />
          <svg viewBox="0 0 100 100" className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(253,230,138,.3)" strokeWidth="4" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="var(--action-primary)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - holdT)}`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          {holdT === 0 && (
            <div
              className="absolute left-1/2 text-[12px] font-bold text-center whitespace-nowrap px-3 py-1.5 rounded-full"
              style={{ bottom: -34, transform: 'translateX(-50%)', background: 'var(--action-quiet)', color: 'var(--text-bright)', border: '1px solid var(--border-soft)' }}
            >
              Press and hold
            </div>
          )}
        </div>
      )}

      {step === 'thanks' && thanksText && (
        <div
          className="absolute px-3.5 py-2.5 rounded-2xl"
          style={{
            left: `${leftPct}%`,
            top: `${topPct}%`,
            transform: 'translate(-50%, calc(-100% - 16px))',
            maxWidth: 260,
            background: 'var(--surface-sheet)',
            backdropFilter: 'var(--blur-sheet)',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className="font-extrabold text-[13px] mb-0.5" style={{ color: 'var(--text-warm)' }}>
            {station.name}
          </div>
          <div className="text-[13px] leading-snug" style={{ color: 'var(--text-bright)' }}>
            {thanksText}
          </div>
        </div>
      )}

      {step === 'partFly' && (
        <img
          src={station.partSrc}
          alt=""
          className="absolute"
          style={{
            left: flyDone ? '50%' : `${leftPct}%`,
            top: flyDone ? 40 : `${topPct}%`,
            width: flyDone ? 28 : 64,
            height: flyDone ? 28 : 64,
            transform: flyDone ? 'translate(-50%, 0) rotate(360deg)' : 'translate(-50%, -100%) rotate(0deg)',
            opacity: flyDone ? 0 : 1,
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 12px rgba(253,230,138,.7))',
            transition: 'left .7s var(--ease-bloom), top .7s var(--ease-bloom), width .7s var(--ease-bloom), height .7s var(--ease-bloom), transform .7s var(--ease-bloom), opacity .7s var(--ease-bloom) .1s',
          }}
        />
      )}
    </div>
  )
}
