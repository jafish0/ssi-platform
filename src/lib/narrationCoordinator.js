// narrationCoordinator — app-wide "only one narration clip active at a
// time" rule (Draft 113, answering Draft 112's investigation).
//
// Three independent narration surfaces play audio with zero awareness of
// each other: NarrationPill (the per-item "read this to me" pills),
// KaiNarrationPlayer (the gated Kai narration on Safety Net/Getting
// Unstuck), and TextPromptNarration (Assent's autoplay+manual pill, and
// the Welcome screen's gated player). Draft 112 found two real bugs from
// that: Kai autoplaying while a nearby pill is also manually played
// (Safety Net), and two independent pills both played in quick succession
// (Getting Unstuck's Challenge/Both-And strategy buttons) — both are just
// "two things started sounding, nothing told either one to stop."
//
// The fix is this tiny claim/release pair. Every one of those components
// calls `claim(token, stop)` right before it starts sounding; if
// something else is currently claimed, that other thing's own `stop`
// fires FIRST. Critically, `stop` must fully tear the previous clip's
// <audio> back down (NarrationPill collapses to its unrevealed button,
// discarding the element), not just call `.pause()` on it — a paused-
// but-still-mounted element keeps its resource footprint, which is
// exactly the concurrently-*mounted*-elements pressure Draft 112 Part A
// points at as the likely cause of the mobile pretest playback failures
// (long scale pages with many revealed pills, each never torn back down).
// `release(token)` is called on natural completion/error/unmount so a
// finished clip never blocks the next one from starting cleanly.
//
// Deliberately a plain module (not React context): these three components
// live in unrelated parts of the tree with no common provider, and this
// needs to work the same way regardless of nesting.

let activeToken = null
let activeStop = null

export function claim(token, stop) {
  if (activeToken && activeToken !== token && activeStop) {
    activeStop()
  }
  activeToken = token
  activeStop = stop
}

export function release(token) {
  if (activeToken === token) {
    activeToken = null
    activeStop = null
  }
}
