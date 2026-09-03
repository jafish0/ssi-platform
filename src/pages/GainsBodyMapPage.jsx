// /gains-demo/bodymap — the Body Mapping activity (Zone 1) in its own 9:16
// frame (Draft 71).

import PlayableShell from '../components/gains/PlayableShell.jsx'
import BodyMapping from '../components/BodyMapping.jsx'
import { reviewCard } from './gainsReviewCards.js'

export default function GainsBodyMapPage() {
  const card = reviewCard('bodymap')
  return (
    <PlayableShell title="Body Mapping" blurb={card.blurb} section="review-bodymap" route="/gains-demo/bodymap">
      <BodyMapping />
    </PlayableShell>
  )
}
