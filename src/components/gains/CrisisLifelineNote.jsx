// GAINS-themed 988 crisis-lifeline callout (Draft 59, 2026-09-02).
//
// Reuses the approved `CRISIS_LIFELINE_TEXT` wording from the shared
// `CrisisLifelineNote.jsx` (Ready for Roots' light amber-50/slate version)
// so the copy stays in one place -- but themed with the Shadowmend/GAINS
// dark tokens instead, since that light card looks wrong on GAINS' dark
// scenes. Calm, not urgent: matches the other on-theme cards already used
// in these activities (border-warm over a dark surface), not red/alarming.

import { Phone } from 'lucide-react'
import { CRISIS_LIFELINE_TEXT } from '../CrisisLifelineNote.jsx'

export default function GainsCrisisLifelineNote({ className = '' }) {
  return (
    <div
      className={`rounded-2xl px-3.5 py-3 flex items-start gap-2.5 ${className}`}
      style={{ background: 'rgba(253,230,138,.10)', border: '1px solid var(--border-warm)' }}
    >
      <Phone size={16} strokeWidth={2} style={{ color: 'var(--text-warm)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-bright)' }}>
        {CRISIS_LIFELINE_TEXT}
      </p>
    </div>
  )
}
