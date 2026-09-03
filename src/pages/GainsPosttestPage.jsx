// /gains-demo/posttest — the Post-test measures flow (the Pre+Post
// instruments again plus the Program Feedback Scale) in its own 9:16 frame
// (Draft 71). Review-only; nothing is stored or scored.

import PlayableShell from '../components/gains/PlayableShell.jsx'
import MeasurementFlow from '../components/gains/MeasurementFlow.jsx'
import { reviewCard } from './gainsReviewCards.js'

export default function GainsPosttestPage() {
  const card = reviewCard('prepost')
  return (
    <PlayableShell title="Post-test: measures flow" blurb={card.blurb} section="review-posttest" route="/gains-demo/posttest">
      <MeasurementFlow flow="post" />
    </PlayableShell>
  )
}
