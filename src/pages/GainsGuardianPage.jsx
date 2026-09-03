// /gains-demo/guardian — Zone 3's "Message to Your Guardian" message-builder
// in its own 9:16 frame (Draft 71).

import PlayableShell from '../components/gains/PlayableShell.jsx'
import ElevatorPitch from '../components/ElevatorPitch.jsx'
import { reviewCard } from './gainsReviewCards.js'

export default function GainsGuardianPage() {
  const card = reviewCard('guardian')
  return (
    <PlayableShell title="Message to Your Guardian" blurb={card.blurb} section="review-zone3pitch" route="/gains-demo/guardian">
      <ElevatorPitch />
    </PlayableShell>
  )
}
