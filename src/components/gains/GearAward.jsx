// Gear Award (GAINS Draft 68 Phase B) — the reusable "you earned a piece of
// gear" beat, shown inside the zone frame after an activity.
//
//   reveal   — the world behind dims/blurs; a soft radial bloom; the item
//              floats center, gently turning, with a sparkle. Title + subline
//              + one big amber pill ("Equip mask").
//   equipped — a quick light-flash, then the equipped figure (mask on, fist
//              up), "Equipped!", a short Spark line, and Continue. The host
//              plays the SFX and flies the icon into the HUD via onEquip.
//
// Parameterized by { name, itemSrc, equippedSrc, title, subline, sparkLine,
// leveledUp } so the Lantern, Focusing Lens, Wingsuit and Goggles reuse it;
// `leveledUp` swaps the title and brightens the glow (same screens, no new
// art).

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import GainsButton from './ds/Button.jsx'

const CSS = `
@keyframes ga-float { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-10px) rotate(3deg); } }
@keyframes ga-twinkle { 0%, 100% { opacity: .15; transform: scale(.7); } 50% { opacity: 1; transform: scale(1.1); } }
@keyframes ga-flash { 0% { opacity: 0; } 25% { opacity: 1; } 100% { opacity: 0; } }
@keyframes ga-bloom-pulse { 0%, 100% { opacity: .7; transform: scale(.94); } 50% { opacity: 1; transform: scale(1.06); } }
.ga-item { animation: ga-float 4.2s var(--ease-drift) infinite; }
.ga-twinkle { animation: ga-twinkle 2.4s var(--ease-soft) infinite; }
.ga-twinkle--b { animation-delay: -1.1s; }
.ga-flash { animation: ga-flash .5s var(--ease-soft) both; }
.ga-bloom { animation: ga-bloom-pulse var(--dur-breathe) var(--ease-drift) infinite; }
@media (prefers-reduced-motion: reduce) { .ga-item, .ga-twinkle, .ga-bloom { animation: none; } .ga-flash { animation-duration: 1ms; } }
`

export default function GearAward({ name, itemSrc, equippedSrc, title, subline, sparkLine, leveledUp = false, onEquip, onContinue, equipLabel }) {
  const [stage, setStage] = useState('reveal') // reveal | equipped
  const [flash, setFlash] = useState(false)

  function equip() {
    setFlash(true)
    if (onEquip) onEquip()
    setTimeout(() => setStage('equipped'), 180)
    setTimeout(() => setFlash(false), 600)
  }

  const glow = leveledUp
    ? 'radial-gradient(circle at 50% 50%, rgba(253,230,138,.85) 0%, rgba(245,153,110,.5) 38%, rgba(245,153,110,0) 72%)'
    : 'var(--glow-warm)'

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'rgba(2,17,39,.62)', backdropFilter: 'var(--blur-sheet)', animation: 'sm-bloom var(--dur-bloom) var(--ease-bloom) both' }}
    >
      <style>{CSS}</style>

      {/* radial bloom behind the item */}
      <div
        className="ga-bloom absolute"
        style={{ width: '120%', aspectRatio: '1 / 1', left: '-10%', top: stage === 'reveal' ? '8%' : '2%', background: glow, filter: leveledUp ? 'brightness(1.25)' : 'none', pointerEvents: 'none' }}
      />

      {flash && <div className="ga-flash absolute inset-0 z-30" style={{ background: 'radial-gradient(circle at 50% 45%, #fff7ea 0%, rgba(253,230,138,.9) 40%, rgba(255,247,234,0) 80%)', pointerEvents: 'none' }} />}

      {stage === 'reveal' ? (
        <div className="relative flex flex-col items-center" style={{ animation: 'sm-rise var(--dur-slow) var(--ease-settle) both' }}>
          <div className="relative mb-5" style={{ width: 190, height: 190 }}>
            <img
              src={itemSrc}
              alt={name}
              className="ga-item"
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: `drop-shadow(0 0 ${leveledUp ? 34 : 22}px rgba(253,230,138,.75))` }}
            />
            <Sparkles size={22} strokeWidth={1.75} className="ga-twinkle absolute" style={{ top: 6, right: 4, color: 'var(--text-warm)' }} />
            <Sparkles size={16} strokeWidth={1.75} className="ga-twinkle ga-twinkle--b absolute" style={{ bottom: 18, left: 2, color: 'var(--light-100)' }} />
          </div>
          <div className="text-[11px] font-extrabold uppercase mb-2" style={{ letterSpacing: 'var(--tracking-caps)', color: 'var(--text-warm)' }}>
            {leveledUp ? 'Gear leveled up' : 'Gear earned'}
          </div>
          <h2 className="text-[26px] font-extrabold leading-tight mb-2" style={{ color: 'var(--text-bright)' }}>
            {title}
          </h2>
          <p className="text-[14px] leading-relaxed mb-6 max-w-[280px]" style={{ color: 'var(--text-body)' }}>
            {subline}
          </p>
          <GainsButton size="lg" onClick={equip}>
            {equipLabel || `Equip ${name.toLowerCase().split(' ').pop()}`}
          </GainsButton>
        </div>
      ) : (
        <div className="relative flex flex-col items-center" style={{ animation: 'sm-bloom var(--dur-bloom) var(--ease-bloom) both' }}>
          <img
            src={equippedSrc}
            alt={`Traveler wearing the ${name}`}
            className="mb-4"
            style={{ height: 'min(46vh, 340px)', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 26px rgba(253,230,138,.55))' }}
          />
          <h2 className="text-[26px] font-extrabold mb-2" style={{ color: 'var(--text-bright)' }}>
            Equipped!
          </h2>
          {sparkLine && (
            <p className="text-[14px] leading-relaxed mb-6 max-w-[280px]" style={{ color: 'var(--text-body)' }}>
              <span className="font-extrabold" style={{ color: 'var(--text-warm)' }}>Spark:</span> {sparkLine}
            </p>
          )}
          <GainsButton size="lg" onClick={onContinue}>
            Continue
          </GainsButton>
        </div>
      )}
    </div>
  )
}
