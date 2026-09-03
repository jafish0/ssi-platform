// /gains-demo/mindful — the Mindful Place activity (Zone 4) standalone in
// its own 9:16 frame (Draft 71). No `onComplete` here: the standalone
// close-screen ending is what's under review; the in-zone hand-off lives in
// /gains-demo/zone4.

import PlayableShell from '../components/gains/PlayableShell.jsx'
import MindfulnessCalmPlace from '../components/MindfulnessCalmPlace.jsx'
import { reviewCard } from './gainsReviewCards.js'

export default function GainsMindfulPage() {
  const card = reviewCard('mindful')
  return (
    <PlayableShell title="Mindful Place" blurb={card.blurb} section="review-mindfulness" route="/gains-demo/mindful">
      <MindfulnessCalmPlace />
    </PlayableShell>
  )
}
