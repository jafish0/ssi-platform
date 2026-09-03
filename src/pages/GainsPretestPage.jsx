// /gains-demo/pretest — the Pre-test measures flow in its own 9:16 frame
// (Draft 71). Review-only; nothing is stored or scored.

import { HardHat } from 'lucide-react'
import PlayableShell from '../components/gains/PlayableShell.jsx'
import MeasurementFlow from '../components/gains/MeasurementFlow.jsx'
import GainsBadge from '../components/gains/ds/Badge.jsx'
import { reviewCard } from './gainsReviewCards.js'

export default function GainsPretestPage() {
  const card = reviewCard('prepost')
  return (
    <PlayableShell
      title="Pre-test: measures flow"
      blurb={card.blurb}
      section="review-pretest"
      route="/gains-demo/pretest"
      note={
        <div className="mt-3 gains-theme">
          <GainsBadge tone="warm" icon={<HardHat size={13} strokeWidth={2} />} style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600 }}>
            Assent flow not built yet
          </GainsBadge>
        </div>
      }
    >
      <MeasurementFlow flow="pre" />
    </PlayableShell>
  )
}
