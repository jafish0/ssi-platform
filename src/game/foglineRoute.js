// The Fogline's stone-hop graph (GAINS Draft 95, concept doc §8b, verbatim).
// Its own tiny module so both `foglineScene.js` (Phaser, lazy-loaded) and
// `FoglineTraversal.jsx` (the DOM lens/fog/focus layer, which needs the
// same coordinates for its rim/glimmer markers) can import it WITHOUT the
// DOM component's static import dragging the whole Phaser scene file back
// into the main bundle (Vite/Rollup can't split a module that's both
// dynamically AND statically imported elsewhere).
//
// index 0 is the start (between the lamps); the Traveler is already
// standing there on mount. Index 11 is the arrival point at the plateau.
export const FOGLINE_STONES = [
  { x: 540, y: 1720 }, // start
  { x: 545, y: 1435 }, // S1
  { x: 445, y: 1275 }, // S2
  { x: 575, y: 1130 }, // S3
  { x: 485, y: 985 }, // S4
  { x: 590, y: 860 }, // S5 -- halfway line (t2-04)
  { x: 525, y: 725 }, // S6
  { x: 605, y: 605 }, // S7
  { x: 515, y: 500 }, // S8
  { x: 590, y: 415 }, // S9
  { x: 530, y: 315 }, // S10
  { x: 540, y: 225 }, // arrival (t2-05)
]
