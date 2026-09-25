// The Fogline Runner's host wrapper (GAINS Draft 98) -- replaces
// `FoglineTraversal.jsx`. Unlike the old drag-the-lens Fogline, every
// mechanic (the run, the jump arc, the fog walls, the lens beam, motes,
// the gap rescue) lives entirely inside `foglineRunScene.js`; this
// component's only job is mounting `TraversalGame mode="foglinerun"` and
// translating the scene's named cues into host `speak()` calls -- the
// scene already applies its own one-shot/repeat-count gating before
// emitting a cue, so this is a plain lookup, not another layer of "have we
// said this before" bookkeeping.
import { forwardRef } from 'react'
import TraversalGame from '../../TraversalGame.jsx'

const CUE_FILES = {
  start: 't2r-01-start.mp3',
  'first-jump': 't2r-02-first-jump.mp3',
  'fog-ahead': 't2r-03-fog-ahead.mp3',
  stumble: 't2r-04-stumble.mp3',
  'shrink-1': 't2r-05-shrink-1.mp3',
  'shrink-2': 't2r-06-shrink-2.mp3',
  'clear-ahead': 't2r-07-clear-ahead.mp3',
  whoop: 't2r-08-whoop.mp3',
  'gap-rescue': 't2r-09-catch.mp3',
  'final-wall': 't2r-10-final-wall.mp3',
  // Draft 100 #9: `t2-05-arrive` mentioned the (now-removed) bridge reveal
  // -- retired in favor of a line written for this ending.
  arrive: 't2r-11-arrive.mp3',
}

const FoglineRunTraversal = forwardRef(function FoglineRunTraversal(
  { started, muted, reducedMotion, restartSignal = 0, speak, duck, onComplete },
  ref,
) {
  function handleEvent(evt) {
    if (evt.type !== 'cue') return
    const file = CUE_FILES[evt.name]
    if (!file) return
    if (evt.name === 'arrive') {
      duck?.(true)
      speak?.(file).then(() => duck?.(false))
    } else {
      speak?.(file)
    }
  }

  return (
    <TraversalGame
      ref={ref}
      mode="foglinerun"
      started={started}
      muted={muted}
      reducedMotion={reducedMotion}
      restartSignal={restartSignal}
      onComplete={onComplete}
      onEvent={handleEvent}
    />
  )
})

export default FoglineRunTraversal
