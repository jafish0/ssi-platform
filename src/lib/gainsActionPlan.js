// GAINS "action plan" collector — Draft 36 stub.
//
// Several GAINS activities produce a short piece of player-authored text
// meant to carry forward into an end-of-game action-plan summary (Zone 3's
// Elevator Pitch message here; the Final Boss growth-mindset choice from
// Draft 30's script is expected to use it too). That end-of-game summary
// doesn't exist yet — this is only the shared place those activities save
// into, so the text isn't lost once it's built. In-memory only, cleared on
// page reload; wiring it into a real persisted summary is a separate,
// larger build (flagged in Draft 36, not done here).

let items = []

export function addActionPlanItem(item) {
  items = [...items, item]
}

export function getActionPlanItems() {
  return items
}

export function clearActionPlanItems() {
  items = []
}
