// 988 Suicide & Crisis Lifeline callout (Draft 96, 2026-08-24 team meeting
// — Dr. Sprang's ask). Today the app only points participants to their
// caregiver or sprang@uky.edu if they're distressed; the team wants 988
// visible as its own callout — not folded into paragraph text — at the
// beginning of the program (Assent.jsx), the end (DeliveryShellPage.jsx's
// CelebrationScreen), and on the action plan keepsake (Plan.jsx, both the
// on-screen review and the PNG/PDF export, which draws `CRISIS_LIFELINE_TEXT`
// directly rather than this component since it renders to SVG, not JSX).
//
// Deliberately calm, not alarming — per Sprang, "just a pop-up or something
// with text," same amber/slate palette as the rest of the app, no red or
// urgent styling. Modeled on Plan.jsx's `QualifierNote` (an existing
// amber-toned "important note" callout), not a new interaction pattern —
// there's no modal/dialog component for participant-facing screens.
//
// Draft copy, reviewable — Sprang should confirm exact wording before this
// ships, same as every other participant-facing copy in this app.
import { Phone } from 'lucide-react'

export const CRISIS_LIFELINE_TEXT =
  'If at any time during this program you feel very distressed, please reach out to your parent or guardian. You can also call or text 988 (Suicide & Crisis Lifeline) — free, confidential support, 24/7.'

export default function CrisisLifelineNote({ className = '' }) {
  return (
    <div
      className={`border-l-4 border-amber-300 bg-amber-50 rounded-r-2xl px-4 py-3 flex items-start gap-2.5 ${className}`}
    >
      <Phone size={16} strokeWidth={2} className="text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm text-slate-700">
        If at any time during this program you feel very distressed, please
        reach out to your parent or guardian. You can also call or text{' '}
        <strong className="font-semibold text-amber-800">988</strong>{' '}
        (Suicide &amp; Crisis Lifeline) — free, confidential support, 24/7.
      </p>
    </div>
  )
}
