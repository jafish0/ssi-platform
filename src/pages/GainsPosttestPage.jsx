// /gains-demo/posttest — the Post-test measures flow (the Pre+Post
// instruments again plus the Program Feedback Scale) in its own 9:16 frame
// (Draft 71). Review-only; nothing is stored or scored.

import PlayableShell from '../components/gains/PlayableShell.jsx'
import MeasurementFlow from '../components/gains/MeasurementFlow.jsx'
import { PREPOST_BLURB } from './gainsReviewCards.js'

export default function GainsPosttestPage() {
  return (
    <PlayableShell title="Post-test: measures flow" blurb={PREPOST_BLURB} section="review-posttest" route="/gains-demo/posttest">
      <MeasurementFlow flow="post" />
    </PlayableShell>
  )
}
