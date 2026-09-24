// Walkable zone — the Phaser scene behind /gains-demo/zone4 (GAINS Draft 68).
//
// The "in-world" template from `Gains for Teens/Walkable Zones — Concept.md`:
// a single-screen 3/4-view painterly plate you move through by tapping, with
// a handful of interactables (Spark, an activity station, the exit) that the
// React page gates. This scene owns RENDERING and MOVEMENT only:
//   - the plate, depth-sorted sprites (Traveler, Spark, frog, markers)
//   - tap-to-move with a walkable polygon set + a small waypoint graph so
//     the Traveler follows the path instead of cutting through rock
//   - direction-picked walk cycles, depth scaling, drop shadow, footstep
//     dust, tap marker, first-tap hint
//   - Spark as a waiting objective or a lagging companion with a light trail
//   - interactable glow/lock/done states, the "path lights up" beat
// PROGRESSION (what's active, which line plays, what a tap on a locked thing
// means) lives in React (GainsZone4Page) and is pushed in via setProgress();
// the scene reports back through cfg.onEvent:
//   { type: 'ready' }
//   { type: 'tap', target: 'spark'|'pond'|'exit'|null }   a tap landed
//   { type: 'arrive', target }                             walked up to it
//   { type: 'step', surface: 'stone'|'grass' }             footstep
//   { type: 'proximity', pond: 0..1 }                      ~8Hz, for audio
//   { type: 'firstTap' }
// Zone 4 was the first instance; the plate-specific data (spots, polygons,
// waypoints) is the ZONE4 block below. Zone 3 (Draft 80) is the second data
// block, ZONE3 -- same scene, same mechanics, new plate. `init()` picks the
// right block from `this.cfg.zoneId`. A "pond" here just means "the
// station" (the second interactable, after Spark) -- not every zone's
// station is literally water: Zone 3's is a waystone, so its `pond` ellipse
// is simply omitted (see the `this.zone.pond &&` guards below) and there's
// no `spots.frog`.
//
// Coordinates are the plate's logical 1080x1920 space (9:16, same as the
// Claude Design overlay layers' viewBox), scaled to fit the phone frame.

const W = 1080
const H = 1920

// Traveler on-screen height at depth-scale 1 (the bottom of the path).
// Draft 84: this used to be paired with a SRC_FIG_H assumed-shared source
// height (560px) and one scale factor applied to every frame -- true for
// Zone 3/4's asset set, but Zone 1's own frames vary source height by
// direction (idle vs walk-back vs walk-front vs walk-side all differ), so a
// shared ratio rendered them at different on-screen sizes. applyTravelerScale()
// now derives the scale from whichever frame is actually on screen (Phaser
// keeps `sprite.height` current on every setTexture()/animation frame), so
// every frame always displays at exactly TRAVELER_H * depthScale regardless
// of its source PNG's height.
const TRAVELER_H = 250
// One-time calibration used only to keep the shadow's size unchanged (the
// shadow is a plain procedural ellipse, not tied to any Traveler source PNG).
const SHADOW_SCALE_AT_1 = (TRAVELER_H / 560) * 3.1
const SPARK_H = 180
// Draft 69: Spark's frames are the alpha flame cut-outs (194x255), drawn in
// NORMAL blend with a soft additive halo behind -- the on-black ADD frames
// blew out to a white flare over the bright plate and lost the face.
const SPARK_SRC_H = 255
const SPARK_ALPHA = 0.96
const SPARK_HALO_ALPHA = 0.26
const FROG_W = 105 // at depth-scale 1; scaled down with distance like everything else
// Draft 94 (Zone 2, item 1): the four camp friends -- "roughly the
// Traveler's knee to waist height" -- displayed bottom-anchored like the
// frog, scaled by height like everything else at depth-scale 1.
const FRIEND_H = TRAVELER_H * 0.75
// A tap within this of a station friend's own spot counts as tapping them
// (matches INTERACT_R.pond's scale -- friends are a similar-sized target).
const STATION_R = 150
const WALK_SPEED = 250 // logical px/s at depth-scale 1
// Phase C tune: 8 fps over the 6-frame cycle puts the two footfalls at
// ~2.7 steps/s, closer to a walk than 9 fps's near-jog cadence.
const WALK_FPS = 8
const TAP_MAX_DIST = 14
const TAP_MAX_MS = 350
// A tap just off the walkable area snaps to the nearest walkable point if
// it's within this; further out is ignored.
const SNAP_MAX = 170
// 2026-09-03 (Josh): companion Spark used to hover right by the exit and
// steal the tap (replaying the "ready" line). Spark's radius is a little
// tighter, the active objective is hit-tested before Spark, and Spark
// keeps to the side away from the objective (see updateSpark).
const INTERACT_R = { spark: 110, pond: 150, exit: 170 }
const IDLE_NUDGE_MS = 6000
const NUDGE_COOLDOWN_MS = 9000
const PROXIMITY_EVERY_MS = 120

// ---- Zone 4: the Bright Reaches ---------------------------------------
const ZONE4 = {
  // Where things stand. `*Stand` is where the Traveler stops to interact.
  // Draft 69 (Josh's marked-up screenshot): Spark waits on the grassy LEFT
  // edge beside the path, so the player walks up to him first; the Traveler
  // stops on the path next to him, not on top of him. The frog sits on the
  // pond's far (upper-right) bank.
  // Draft 70: the pond's activity trigger (`pond`) is the upper-right bank
  // right beside the frog -- that's where the Mindful Place starts and where
  // the Traveler walks to (on the bank, never in the water).
  spots: {
    start: { x: 470, y: 1830 },
    sparkWait: { x: 240, y: 1110 },
    sparkStand: { x: 412, y: 1128 },
    pond: { x: 770, y: 862 },
    frog: { x: 830, y: 880 },
    exit: { x: 400, y: 500 },
    exitStand: { x: 400, y: 532 },
  },
  // Spark's "glide to the pond" gesture target (hovers over the bank by the
  // trigger), and where the exit's light-path starts (the junction).
  pondHover: { x: 720, y: 815 },
  // The water itself is not walkable. Draft 70: enlarged to cover the whole
  // surface (the lower-right lobe used to poke outside the old ellipse, so
  // you could wade in there).
  pond: { x: 816, y: 1052, rx: 215, ry: 150 },
  // Walkable set = union of these polygons, minus the pond. Authored against
  // the plate: the lit stone path (bottom → junction → plateau → ridge) and
  // the grassy pond clearing, which joins the path only through its upper-
  // left gap (the clearing's lower-left is rock). The clearing's top edge
  // reaches up to the far bank so the Traveler can stand beside the frog.
  polys: [
    [[230, 1920], [720, 1920], [680, 1640], [300, 1640]],
    [[300, 1640], [680, 1640], [620, 1420], [330, 1420]],
    [[330, 1420], [620, 1420], [560, 1240], [350, 1240]],
    [[350, 1240], [560, 1240], [610, 1000], [400, 1000]],
    [[560, 975], [672, 893], [700, 842], [890, 836], [1018, 941], [1037, 1104], [912, 1210], [672, 1210], [600, 1120], [580, 1060]],
    [[400, 1000], [610, 1000], [620, 880], [380, 880]],
    [[330, 900], [660, 900], [760, 730], [150, 730]],
    [[150, 730], [760, 730], [560, 600], [100, 600]],
    [[100, 600], [560, 600], [500, 455], [300, 455]],
  ],
  grassPolys: [4],
  // Waypoint graph (a tree) along the path centerline; routing goes
  // straight when the segment is clear, else via the nearest nodes.
  // Node 5 hugs the bank on the way to the pond trigger (Draft 70).
  nodes: [
    [470, 1830], [490, 1600], [470, 1380], [460, 1170], [500, 1040],
    [690, 900], [500, 930], [430, 820], [330, 700], [330, 600], [400, 520],
  ],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [6, 7], [7, 8], [8, 9], [9, 10]],
  // The exit's "path lights up" follows these nodes, junction → exit.
  lightPathNodes: [4, 6, 7, 8, 9, 10],
  // Depth scale: 1 at the bottom of the path, ~0.6 at the ridge.
  depth: { yNear: 1830, yFar: 460, sNear: 1.0, sFar: 0.6 },
}


// ---- Zone 3: the Mistfields -------------------------------------------
const ZONE3 = {
  // The path climbs from the bottom of the plate to the old rope bridge at
  // the top (out/impassable -- the Wingsuit is how you actually cross).
  // The waystone + lantern (the "station") sits in a small clearing just
  // off the path to the right. Spark waits off the path in the verge to
  // the left, same pattern as Zone 4.
  spots: {
    start: { x: 600, y: 1830 },
    sparkWait: { x: 240, y: 1190 },
    sparkStand: { x: 540, y: 1200 },
    pond: { x: 760, y: 930 }, // the waystone -- the station trigger/stand point
    exit: { x: 660, y: 410 }, // the bridge head
    exitStand: { x: 600, y: 470 },
  },
  // Spark's "glide to the station" gesture target, hovering by the waystone.
  pondHover: { x: 700, y: 900 },
  // No water here -- the waystone needs no exclusion ellipse (see the
  // `this.zone.pond &&` guards on isWalkable/hitInteractable/updateProximity).
  // Walkable set: a ribbon following the path's gentle curve from the
  // entry up to the bridge head, wide enough to include the waystone
  // clearing without a separate bulge polygon.
  polys: [
    [[460, 1830], [740, 1830], [750, 1650], [470, 1650]],
    [[470, 1650], [750, 1650], [755, 1450], [475, 1450]],
    [[475, 1450], [755, 1450], [780, 1250], [500, 1250]],
    [[500, 1250], [780, 1250], [800, 1050], [520, 1050]],
    [[520, 1050], [800, 1050], [780, 850], [500, 850]],
    [[500, 850], [780, 850], [760, 650], [480, 650]],
    [[480, 650], [760, 650], [740, 470], [460, 470]],
  ],
  grassPolys: [], // one surface throughout (stone/dirt) -- no grass foley
  // Waypoint graph along the path centerline (a straight chain -- the path
  // doesn't fork the way Zone 4's does around the pond).
  nodes: [
    [600, 1830], [610, 1650], [615, 1450], [640, 1250], [660, 1050],
    [640, 850], [620, 650], [600, 470],
  ],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  // The exit's "path lights up" runs from the waystone's level up to the
  // bridge head.
  lightPathNodes: [4, 5, 6, 7],
  depth: { yNear: 1830, yFar: 460, sNear: 1.0, sFar: 0.6 },
}

// ---- Zone 1: the Dark Abyss (two connected plates, Draft 83) ----------
// Plate 1 is the arrival: a long, empty walk up to Spark (waiting far up
// near the passage), tap him, watch the intro video, cut to Plate 2. Only
// Spark is ever interactable here -- `pond`/`exit` are parked far
// off-canvas so the shared hit-testing/marker code (which always reads
// `spots.pond`/`spots.exit`) has real numbers to read but can never
// actually be reached or shown.
const ZONE1_INTRO = {
  spots: {
    start: { x: 540, y: 1860 },
    sparkWait: { x: 720, y: 150 },
    sparkStand: { x: 700, y: 260 },
    pond: { x: -4000, y: -4000 },
    exit: { x: -4000, y: -3900 },
    exitStand: { x: -4000, y: -3900 },
  },
  pondHover: { x: -4000, y: -4000 },
  polys: [
    [[390, 1860], [690, 1860], [705, 1600], [405, 1600]],
    [[405, 1600], [705, 1600], [730, 1350], [430, 1350]],
    [[430, 1350], [730, 1350], [760, 1100], [460, 1100]],
    [[460, 1100], [760, 1100], [790, 870], [490, 870]],
    [[490, 870], [790, 870], [820, 650], [520, 650]],
    [[520, 650], [820, 650], [845, 430], [545, 430]],
    [[545, 430], [845, 430], [860, 220], [560, 220]],
  ],
  grassPolys: [],
  nodes: [
    [540, 1860], [555, 1600], [580, 1350], [610, 1100], [640, 870],
    [670, 650], [695, 430], [710, 220],
  ],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  lightPathNodes: [],
  depth: { yNear: 1860, yFar: 150, sNear: 1.0, sFar: 0.6 },
}

// Plate 2, the main map: the passage from Plate 1 lets out at the top of
// this one (same palette/path stone -- Plate 1's exit and this entry are
// the two sides of one doorway). Spark is now a short way off; the
// station is the Mirror Pool's top (far) bank, where the stone steps come
// down to meet the water; the exit is the head of those steps.
//
// Draft 84 rebuild: the pool ellipse below is fitted to the actual art (the
// candle-ring in public/long-light/zone1/ov/plate2/layer-candles.svg and the
// poolSheen ellipse in layer-pool.svg both independently converge on this
// footprint -- the previous {680,880,rx240,ry110} was ~180px off from where
// the water actually is, which is why it used to be walkable straight
// through). The route is now a real ring: an entry stem down to a
// near-bank junction, two arcs around the pool (each point verified clear
// of the ellipse with margin), rejoining at the top-bank landing station,
// then up the switchback stairs (waypoints are the actual stair-candle
// positions from layer-candles.svg) to the exit.
const ZONE1_MAIN = {
  spots: {
    start: { x: 540, y: 1780 },
    sparkWait: { x: 300, y: 1300 },
    sparkStand: { x: 460, y: 1300 },
    pond: { x: 586, y: 563 },
    exit: { x: 785, y: 120 },
    exitStand: { x: 740, y: 220 },
  },
  // Spark's glide-to-the-station target, hovering just off the landing.
  pondHover: { x: 630, y: 535 },
  // The Mirror Pool -- fitted to the candle ring (see comment above).
  pond: { x: 586, y: 793, rx: 340, ry: 200 },
  polys: [
    [[390, 1780], [690, 1780], [690, 1550], [390, 1550]],
    [[390, 1550], [690, 1550], [650, 1300], [350, 1300]],
    [[350, 1300], [650, 1300], [630, 1150], [370, 1150]],
    [[370, 1150], [630, 1150], [966, 1023], [206, 1023]],
    // The pool clearing: a generous rectangle spanning both arcs: the
    // `pond` ellipse above carves the water itself out of it.
    [[150, 1050], [1020, 1050], [1020, 530], [150, 530]],
    [[450, 563], [750, 563], [820, 350], [480, 350]],
    [[480, 350], [820, 350], [900, 120], [560, 120]],
  ],
  grassPolys: [],
  nodes: [
    [540, 1780], [540, 1550], [500, 1300], [520, 1150],
    [586, 1023], // near-bank junction
    [332, 956], [226, 793], [332, 630], // left arc, low -> wide -> high
    [840, 956], [946, 793], [840, 630], // right arc, low -> wide -> high
    [586, 563], // top-bank landing (= spots.pond)
    [688, 412], [592, 363], [699, 256], // switchback stair candles
    [785, 120], // exit
  ],
  edges: [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [4, 5], [5, 6], [6, 7], [7, 11],
    [4, 8], [8, 9], [9, 10], [10, 11],
    [11, 12], [12, 13], [13, 14], [14, 15],
  ],
  // The exit's "path lights up" runs from the top-bank landing to the exit.
  lightPathNodes: [11, 12, 13, 14, 15],
  depth: { yNear: 1780, yFar: 120, sNear: 1.0, sFar: 0.58 },
}

// Draft 94 (Zone 2): a uniform-width walkable ribbon along a waypoint
// chain, generated rather than hand-authored per segment -- Zone 2's trail
// winds through many more waypoints than Zones 1/3/4's, and the overlay art
// (not this polygon) is what actually reads as "the path" to the player, so
// a consistent width is a fair trade for not hand-tuning ~10 quads by eye.
function ribbon(points, width) {
  const half = width / 2
  const polys = []
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1]
    const [bx, by] = points[i]
    const dx = bx - ax
    const dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    const nx = (-dy / len) * half
    const ny = (dx / len) * half
    polys.push([
      [ax + nx, ay + ny],
      [bx + nx, by + ny],
      [bx - nx, by - ny],
      [ax - nx, ay - ny],
    ])
  }
  return polys
}

// ---- Zone 2: The Lantern Path (two connected plates, Draft 94) --------
// Plate 1: the arrival trail, same shape as Zone 1's -- walk up to Spark
// (the station is Spark herself, no separate pond/activity spot), watch
// Video 2, then to the exit at the top. Coordinates verbatim from the
// draft (`Gains for Teens/Walkable Zones/Zone 2/Zone 2 — Concept...md` §2).
const ZONE2_PLATE1_PATH = [
  [560, 1800], [600, 1500], [600, 1300], [470, 1100], [480, 950],
  [600, 800], [620, 650], [500, 520], [560, 400], [650, 300], [700, 180],
]
const ZONE2_PLATE1 = {
  spots: {
    start: { x: 560, y: 1800 },
    sparkWait: { x: 300, y: 960 },
    sparkStand: { x: 470, y: 1000 },
    // No separate station on this plate -- Spark herself is it (see the
    // file header's note on what a "pond" here means). Parked off-canvas
    // so the shared hit-test code always has real numbers to read.
    pond: { x: -4000, y: -4000 },
    exit: { x: 715, y: 120 },
    exitStand: { x: 715, y: 120 },
  },
  pondHover: { x: -4000, y: -4000 },
  polys: ribbon(ZONE2_PLATE1_PATH, 260),
  grassPolys: [],
  nodes: ZONE2_PLATE1_PATH,
  edges: ZONE2_PLATE1_PATH.slice(1).map((_, i) => [i, i + 1]),
  lightPathNodes: [3, 4, 5, 6, 7, 8, 9, 10],
  depth: { yNear: 1800, yFar: 180, sNear: 1.0, sFar: 0.6 },
}

// Plate 2: the camp clearing. No single "station" -- `stations` (Draft 94,
// item 1a) lists the four friends, any order, all required. The fire is a
// non-walkable disc (reusing the existing single-ellipse exclusion field,
// `pond`, despite the name -- it's just "the one thing you can't walk
// through").
const ZONE2_PLATE2 = {
  spots: {
    start: { x: 562, y: 1836 },
    sparkWait: { x: 551, y: 1148 },
    sparkStand: { x: 551, y: 1148 },
    pond: { x: -4000, y: -4000 }, // no single station here -- see `stations`
    exit: { x: 872, y: 333 },
    exitStand: { x: 872, y: 333 },
  },
  pondHover: { x: -4000, y: -4000 },
  // The fire -- not walkable, r≈120. Reuses the single-ellipse exclusion
  // field but is NOT an interactable (see `noPondTarget`/hitInteractable).
  pond: { x: 551, y: 792, rx: 120, ry: 120 },
  noPondTarget: true,
  // A generous clearing floor; the fire ellipse above carves out its disc.
  polys: [
    [[380, 1836], [744, 1836], [744, 1500], [380, 1500]],
    [[300, 1500], [820, 1500], [900, 1000], [220, 1000]],
    [[180, 1000], [940, 1000], [1000, 500], [120, 500]],
    [[300, 500], [960, 500], [960, 260], [300, 260]],
  ],
  grassPolys: [0, 1, 2, 3],
  nodes: [
    [562, 1836], [551, 1450], [551, 1148], [551, 950], [872, 333],
  ],
  edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  lightPathNodes: [2, 3, 4],
  depth: { yNear: 1836, yFar: 260, sNear: 1.0, sFar: 0.62 },
  // Draft 94 (item 1a): the four free-order friend stations. `x/y` is where
  // the friend sits. Station data (name/answer/vo/part) lives in
  // zones.js -- this is only the geometry the scene needs to hit-test and
  // route to.
  //
  // `standX/standY` (Draft 96 item 2a): where the Traveler stops to face
  // them. Emberwick/Mirefly sit ABOVE the fire (smaller y); the old
  // straight toward-fire stand point put the Traveler at a LARGER y than
  // the friend, which -- depth sorts on y, larger paints on top -- drew
  // the Traveler in front of exactly the before/after change the beat is
  // about (Josh's screenshot). Hollowshell/Dimmet sit BELOW the fire, so
  // the same toward-fire point already lands at a smaller y than them and
  // never had this problem; moved to the side anyway, purely so the
  // Traveler doesn't plant themselves directly between the friend and the
  // fire glow. `depthCapFor` (see setActiveStation/placeTraveler) is the
  // real guarantee either way -- these values are chosen to already read
  // right without leaning on that clamp.
  stations: [
    { id: 'emberwick', x: 310, y: 626, standX: 396, standY: 588 },
    { id: 'mirefly', x: 803, y: 637, standX: 717, standY: 599 },
    { id: 'hollowshell', x: 293, y: 976, standX: 203, standY: 950 },
    { id: 'dimmet', x: 803, y: 999, standX: 893, standY: 973 },
  ],
}

const ZONES = {
  zone4: ZONE4,
  zone3: ZONE3,
  zone1intro: ZONE1_INTRO,
  zone1main: ZONE1_MAIN,
  zone2plate1: ZONE2_PLATE1,
  zone2plate2: ZONE2_PLATE2,
}

// ---- geometry helpers -------------------------------------------------
function pointInPoly(px, py, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    const hit = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    if (hit) inside = !inside
  }
  return inside
}

function inEllipse(px, py, e) {
  const dx = (px - e.x) / e.rx
  const dy = (py - e.y) / e.ry
  return dx * dx + dy * dy <= 1
}

function projectOnSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax
  const vy = by - ay
  const len2 = vx * vx + vy * vy || 1
  let t = ((px - ax) * vx + (py - ay) * vy) / len2
  t = Math.max(0, Math.min(1, t))
  return { x: ax + vx * t, y: ay + vy * t }
}

export function makeZoneWalkScene(Phaser) {
  return class ZoneWalkScene extends Phaser.Scene {
    constructor() {
      super({ key: 'ZoneWalk' })
    }

    init() {
      this.cfg = this.registry.get('zoneConfig') || {}
      this.zone = ZONES[this.cfg.zoneId] || ZONE4
      this.ready = false
      this.began = false
      this.paused = true
      this.progress = { spark: 'active', pond: 'locked', exit: 'locked', sparkMode: 'waiting' }
      // Draft 96 (item 2): which friend station is currently in its
      // sequence (video through part-fly), if any -- set by React via
      // `setActiveStation` the moment it mounts StationSequence, cleared
      // when the station completes. Used to keep the Traveler and Spark
      // from rendering in front of the friend they're supposed to be
      // looking at (see placeTraveler/updateSpark/maybeNudge).
      this.activeStationId = null
      this.path = []
      this.pendingTarget = null
      this.facing = 'back'
      this.moving = false
      this.firstTapDone = false
      this.lastInputAt = 0
      this.lastNudgeAt = 0
      this.lastProximityAt = 0
      this.sparkGesture = null
      this.reduced = !!this.cfg.reducedMotion
    }

    // ---- lifecycle ----
    preload() {
      const c = this.cfg
      if (c.mapUrl) this.load.image('map', c.mapUrl)
      Object.entries(c.travelerUrls || {}).forEach(([k, url]) => this.load.image(`t-${k}`, url))
      ;(c.sparkUrls || []).forEach((url, i) => this.load.image(`spark-${i}`, url))
      if (c.frogUrl) this.load.image('frog', c.frogUrl)
      // Draft 94 (Zone 2): the camp friends' before/after textures, keyed
      // by station id (matches `zone.stations[].id`).
      ;(c.friends || []).forEach((f) => {
        this.load.image(`friend-${f.id}-before`, f.before)
        this.load.image(`friend-${f.id}-after`, f.after)
      })
      // A missing file must never take the zone down.
      this.load.on('loaderror', (file) => {
        // eslint-disable-next-line no-console
        console.warn('[zoneWalk] asset failed to load:', file && file.key)
      })
    }

    create() {
      this.makeTextures()
      const z = this.zone

      if (this.textures.exists('map')) {
        this.add.image(W / 2, H / 2, 'map').setDisplaySize(W, H).setDepth(0)
      } else {
        this.add.rectangle(W / 2, H / 2, W, H, 0x2a1f3d).setDepth(0)
      }

      // Frog on the pond (Mindful Place's painterly frog, reused).
      if (this.textures.exists('frog')) {
        const frog = this.add.image(z.spots.frog.x, z.spots.frog.y, 'frog').setOrigin(0.5, 0.9)
        frog.setScale((FROG_W * this.depthScale(z.spots.frog.y)) / frog.width)
        frog.setDepth(z.spots.frog.y)
        this.frog = frog
        if (!this.reduced) {
          this.tweens.add({ targets: frog, y: frog.y - 4, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        }
      }

      this.buildTraveler()
      this.buildSpark()
      this.buildStations()
      this.buildMarkers()
      this.buildInput()

      this.applyProgress()
      this.ready = true
      if (this.wantBegin) this.beginZone()
      this.emit({ type: 'ready' })
    }

    update(time, delta) {
      this.updateTraveler(delta)
      this.updateSpark(time, delta)
      this.updateProximity(time)
      this.maybeNudge(time)
    }

    emit(evt) {
      if (this.cfg.onEvent) {
        try {
          this.cfg.onEvent(evt)
        } catch {
          /* never let a listener break the loop */
        }
      }
    }

    // ---- public API (called from React via the game instance) ----
    beginZone() {
      if (!this.ready) {
        this.wantBegin = true
        return
      }
      if (this.began) return
      this.began = true
      this.paused = false
      this.lastInputAt = this.time.now
      // "camera settles": a slow zoom-out from a hair closer.
      if (!this.reduced) {
        this.cameras.main.setZoom(1.06)
        this.tweens.add({ targets: this.cameras.main, zoom: 1, duration: 2400, ease: 'Sine.easeOut' })
      }
      this.showHint()
    }

    setPaused(p) {
      this.paused = !!p
      if (this.paused) {
        this.path = []
        this.pendingTarget = null
        this.setMoving(false)
      } else {
        this.lastInputAt = this.time.now
      }
    }

    setProgress(p) {
      this.progress = { ...this.progress, ...p }
      if (this.ready) this.applyProgress()
      // Draft 94: a station marked done by React (its sequence completed)
      // but not yet reflected here (e.g. the scene just (re)mounted) snaps
      // straight to its after-image -- the crossfade itself only plays out
      // live, driven by setStationLight during the actual hold gesture.
      if (p.stationsDone && this.stations) {
        Object.keys(p.stationsDone).forEach((id) => {
          if (p.stationsDone[id] && this.stations[id] && !this.stations[id].done) this.setStationLight(id, 1)
        })
      }
    }

    // Spark glides toward a spot (the "follow me" gesture toward the pond),
    // then goes back to following the Traveler.
    sparkGlideTo(kind) {
      if (!this.ready || !this.spark) return
      const target = kind === 'pond' ? this.zone.pondHover : null
      if (!target) return
      this.sparkGesture = { x: target.x, y: target.y, until: this.time.now + 3200 }
      this.emit({ type: 'sfx', name: 'spark-whoosh' })
    }

    // The exit is now active: a line of light-motes rises along the path to
    // it (the chime is the page's job, alongside the state change).
    lightPath() {
      if (!this.ready) return
      const pts = this.zone.lightPathNodes.map((i) => this.zone.nodes[i])
      // Sample the polyline evenly.
      const segs = []
      let total = 0
      for (let i = 1; i < pts.length; i++) {
        const d = Phaser.Math.Distance.Between(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1])
        segs.push({ a: pts[i - 1], b: pts[i], d })
        total += d
      }
      const COUNT = 18
      for (let k = 0; k <= COUNT; k++) {
        let along = (total * k) / COUNT
        let seg = segs[0]
        for (const s of segs) {
          if (along <= s.d) {
            seg = s
            break
          }
          along -= s.d
        }
        const t = seg.d ? along / seg.d : 0
        const x = seg.a[0] + (seg.b[0] - seg.a[0]) * t + Phaser.Math.Between(-22, 22)
        const y = seg.a[1] + (seg.b[1] - seg.a[1]) * t
        this.time.delayedCall(k * 85, () => {
          const s = this.depthScale(y)
          const m = this.add.image(x, y, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe3a0)
          m.setScale(0.12 * s).setAlpha(0).setDepth(y + 2)
          this.tweens.add({
            targets: m,
            y: y - 70 * s,
            alpha: { from: 0, to: 0.95 },
            scale: 0.42 * s,
            duration: 700,
            ease: 'Sine.easeOut',
            yoyo: true,
            hold: 200,
            onComplete: () => m.destroy(),
          })
        })
      }
    }

    // ---- textures ----
    makeTextures() {
      if (!this.textures.exists('glow')) {
        const R = 64
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        for (let i = 10; i >= 1; i--) {
          g.fillStyle(0xffffff, 0.09 * (1 - i / 11))
          g.fillCircle(R, R, (R * i) / 10)
        }
        g.generateTexture('glow', R * 2, R * 2)
        g.destroy()
      }
      if (!this.textures.exists('ring')) {
        const R = 96
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        g.lineStyle(10, 0xffffff, 1)
        g.strokeCircle(R, R, R - 8)
        g.lineStyle(22, 0xffffff, 0.22)
        g.strokeCircle(R, R, R - 8)
        g.generateTexture('ring', R * 2, R * 2)
        g.destroy()
      }
      if (!this.textures.exists('dust')) {
        const R = 12
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        g.fillStyle(0xffffff, 0.55)
        g.fillCircle(R, R, R * 0.8)
        g.fillStyle(0xffffff, 0.35)
        g.fillCircle(R, R, R)
        g.generateTexture('dust', R * 2, R * 2)
        g.destroy()
      }
      if (!this.textures.exists('shadow')) {
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        for (let i = 6; i >= 1; i--) {
          g.fillStyle(0x08101c, 0.11)
          g.fillEllipse(80, 28, (150 * i) / 6, (48 * i) / 6)
        }
        g.generateTexture('shadow', 160, 56)
        g.destroy()
      }
      if (!this.textures.exists('lock')) {
        // A small padlock: body + shackle.
        const g = this.make.graphics({ x: 0, y: 0, add: false })
        g.fillStyle(0x0d1c2a, 0.85)
        g.fillCircle(32, 32, 30)
        g.lineStyle(5, 0xfff3d0, 0.95)
        g.strokeCircle(32, 32, 30)
        g.fillStyle(0xfff3d0, 1)
        g.fillRoundedRect(20, 30, 24, 18, 4)
        g.lineStyle(4, 0xfff3d0, 1)
        g.beginPath()
        g.arc(32, 30, 8, Math.PI, 0, false)
        g.strokePath()
        g.generateTexture('lock', 64, 64)
        g.destroy()
      }
    }

    // ---- traveler ----
    buildTraveler() {
      const z = this.zone
      const dirs = ['walk-back', 'walk-front', 'walk-side', 'walk-side-left']
      dirs.forEach((d) => {
        const frames = []
        for (let i = 1; i <= 6; i++) if (this.textures.exists(`t-${d}-${i}`)) frames.push({ key: `t-${d}-${i}` })
        if (frames.length && !this.anims.exists(d)) {
          this.anims.create({ key: d, frames, frameRate: WALK_FPS, repeat: -1 })
        }
      })

      const start = z.spots.start
      this.shadow = this.add.image(start.x, start.y + 6, 'shadow').setOrigin(0.5, 0.5).setAlpha(0.55)
      const idleKey = this.textures.exists('t-idle-back') ? 't-idle-back' : 't-idle-front'
      this.traveler = this.add.sprite(start.x, start.y, idleKey).setOrigin(0.5, 1)
      this.traveler.on('animationupdate', (anim, frame) => {
        // Two footfalls per 6-frame cycle.
        if (frame.index === 1 || frame.index === 4) this.footstep()
      })
      this.dust = this.add.particles(0, 0, 'dust', {
        lifespan: { min: 380, max: 620 },
        speed: { min: 12, max: 55 },
        angle: { min: 200, max: 340 },
        gravityY: -30,
        scale: { start: 0.9, end: 0.1 },
        alpha: { start: 0.55, end: 0 },
        tint: 0xf6dcb4,
        emitting: false,
      })
      this.dust.setDepth(start.y - 0.2)
      this.facing = 'back'
      // Breathing bob while idle: a hair of vertical stretch from the feet,
      // applied on top of the depth scale (see applyTravelerScale).
      this.bob = { v: 0 }
      if (!this.reduced) {
        this.tweens.add({ targets: this.bob, v: 1, duration: 2300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      }
      this.placeTraveler(start.x, start.y)
    }

    depthScale(y) {
      const d = this.zone.depth
      const t = (y - d.yFar) / (d.yNear - d.yFar)
      return Phaser.Math.Clamp(d.sFar + (d.sNear - d.sFar) * t, 0.56, 1.04)
    }

    placeTraveler(x, y) {
      const s = this.depthScale(y)
      this.traveler.setPosition(x, y)
      this.travelerDisplayH = TRAVELER_H * s
      this.applyTravelerScale()
      // Draft 96 (item 2a): depth is normally just the ground y (nearer-
      // to-camera paints on top), but while a station is active the
      // Traveler must never win that ordering against the friend they're
      // standing at -- clamp it behind them by a small margin instead.
      this.traveler.setDepth(this.depthCapFor(y, 6))
      this.shadow.setPosition(x, y + 4 * s).setScale(SHADOW_SCALE_AT_1 * s, SHADOW_SCALE_AT_1 * s).setDepth(y - 0.5)
      this.dust.setDepth(y - 0.2)
    }

    applyTravelerScale() {
      const displayH = this.travelerDisplayH || TRAVELER_H
      const bobK = this.moving || !this.bob ? 1 : 1 + 0.014 * this.bob.v
      // Derived from this sprite's own current native frame height (Phaser
      // keeps it current on setTexture()/animation-frame-advance), never a
      // shared source-height guess -- so a mismatched source PNG can never
      // change this frame's on-screen size.
      const k = displayH / this.traveler.height
      this.traveler.setScale(k, k * bobK)
    }

    setMoving(m) {
      if (m === this.moving) return
      this.moving = m
      if (!m) {
        this.traveler.anims.stop()
        const idle = this.facing === 'back' ? 't-idle-back' : 't-idle-front'
        if (this.textures.exists(idle)) this.traveler.setTexture(idle)
        this.applyTravelerScale()
        if (this.tapMarker) this.fadeTapMarker()
        if (this.pendingTarget) {
          const t = this.pendingTarget
          this.pendingTarget = null
          this.emit({ type: 'arrive', target: t })
        }
      }
    }

    updateTraveler(delta) {
      if (!this.traveler) return
      if (!this.path.length) {
        if (this.moving) this.setMoving(false)
        else if (this.bob) this.applyTravelerScale()
        return
      }
      const dt = delta / 1000
      let { x, y } = this.traveler
      let budget = WALK_SPEED * this.depthScale(y) * dt
      while (budget > 0 && this.path.length) {
        const tgt = this.path[0]
        const dx = tgt.x - x
        const dy = tgt.y - y
        const dist = Math.hypot(dx, dy)
        if (dist <= budget) {
          x = tgt.x
          y = tgt.y
          budget -= dist
          this.path.shift()
        } else {
          x += (dx / dist) * budget
          y += (dy / dist) * budget
          budget = 0
          this.face(dx, dy)
        }
      }
      this.setMoving(true)
      this.placeTraveler(x, y)
      if (!this.path.length) this.setMoving(false)
    }

    face(dx, dy) {
      let dir
      if (Math.abs(dx) > Math.abs(dy) * 1.15) dir = dx > 0 ? 'side' : 'side-left'
      else dir = dy < 0 ? 'back' : 'front'
      if (dir !== this.facing || !this.traveler.anims.isPlaying) {
        this.facing = dir
        const key = `walk-${dir}`
        if (this.anims.exists(key)) this.traveler.play(key, true)
      }
    }

    footstep() {
      const { x, y } = this.traveler
      const s = this.depthScale(y)
      if (!this.reduced && this.dust) {
        this.dust.setDepth(y - 0.2)
        this.dust.explode(4, x + Phaser.Math.Between(-14, 14) * s, y - 2)
      }
      this.emit({ type: 'step', surface: this.surfaceAt(x, y) })
    }

    // ---- walkable geometry ----
    isWalkable(x, y) {
      if (this.zone.pond && inEllipse(x, y, this.zone.pond)) return false
      return this.zone.polys.some((p) => pointInPoly(x, y, p))
    }

    surfaceAt(x, y) {
      return this.zone.grassPolys.some((i) => pointInPoly(x, y, this.zone.polys[i])) ? 'grass' : 'stone'
    }

    nearestWalkable(x, y) {
      if (this.isWalkable(x, y)) return { x, y, d: 0 }
      let best = null
      for (const poly of this.zone.polys) {
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const p = projectOnSegment(x, y, poly[j][0], poly[j][1], poly[i][0], poly[i][1])
          // Pull a hair inside so it lands on the walkable side.
          const cx = poly.reduce((a, q) => a + q[0], 0) / poly.length
          const cy = poly.reduce((a, q) => a + q[1], 0) / poly.length
          const px = p.x + (cx - p.x) * 0.03
          const py = p.y + (cy - p.y) * 0.03
          if (!this.isWalkable(px, py)) continue
          const d = Math.hypot(px - x, py - y)
          if (!best || d < best.d) best = { x: px, y: py, d }
        }
      }
      return best
    }

    segmentClear(ax, ay, bx, by) {
      const d = Math.hypot(bx - ax, by - ay)
      const n = Math.max(2, Math.ceil(d / 22))
      for (let i = 0; i <= n; i++) {
        const t = i / n
        if (!this.isWalkable(ax + (bx - ax) * t, ay + (by - ay) * t)) return false
      }
      return true
    }

    nearestNode(x, y) {
      let bi = 0
      let bd = Infinity
      this.zone.nodes.forEach(([nx, ny], i) => {
        const d = Math.hypot(nx - x, ny - y)
        if (d < bd) {
          bd = d
          bi = i
        }
      })
      return bi
    }

    nodePath(a, b) {
      if (a === b) return [a]
      const adj = {}
      this.zone.edges.forEach(([u, v]) => {
        ;(adj[u] = adj[u] || []).push(v)
        ;(adj[v] = adj[v] || []).push(u)
      })
      const prev = { [a]: null }
      const queue = [a]
      while (queue.length) {
        const u = queue.shift()
        if (u === b) break
        for (const v of adj[u] || []) {
          if (!(v in prev)) {
            prev[v] = u
            queue.push(v)
          }
        }
      }
      if (!(b in prev)) return [a, b]
      const out = []
      for (let cur = b; cur !== null; cur = prev[cur]) out.unshift(cur)
      return out
    }

    route(fx, fy, tx, ty) {
      if (this.segmentClear(fx, fy, tx, ty)) return [{ x: tx, y: ty }]
      const na = this.nearestNode(fx, fy)
      const nb = this.nearestNode(tx, ty)
      const pts = this.nodePath(na, nb).map((i) => ({ x: this.zone.nodes[i][0], y: this.zone.nodes[i][1] }))
      // Smooth the ends: skip leading nodes we can already reach directly,
      // and trailing ones the target can be reached from directly.
      while (pts.length > 1 && this.segmentClear(fx, fy, pts[1].x, pts[1].y)) pts.shift()
      while (pts.length > 1 && this.segmentClear(pts[pts.length - 2].x, pts[pts.length - 2].y, tx, ty)) pts.pop()
      if (pts.length === 1 && this.segmentClear(fx, fy, tx, ty)) return [{ x: tx, y: ty }]
      return [...pts, { x: tx, y: ty }]
    }

    walkTo(x, y, target = null) {
      const { x: fx, y: fy } = this.traveler
      this.path = this.route(fx, fy, x, y)
      this.pendingTarget = target
      if (this.path.length && this.hint) this.hideHint() // first successful move
      // Kick the walk animation immediately so there's no idle frame lag.
      if (this.path.length) this.face(this.path[0].x - fx, this.path[0].y - fy)
    }

    // ---- input ----
    buildInput() {
      this.input.on('pointerdown', (p) => {
        this.pDown = { x: p.x, y: p.y, t: this.time.now }
      })
      this.input.on('pointerup', (p) => {
        if (!this.pDown || this.paused || !this.began) return
        const d = Phaser.Math.Distance.Between(p.x, p.y, this.pDown.x, this.pDown.y)
        const dur = this.time.now - this.pDown.t
        this.pDown = null
        if (d > TAP_MAX_DIST || dur > TAP_MAX_MS) return
        this.handleTap(p.x, p.y)
      })
    }

    handleTap(x, y) {
      // pointerup already checks this; guarding here too keeps any other
      // caller honest (nothing moves before the zone has begun or while a
      // scene/intro line has it paused).
      if (this.paused || !this.began) return
      this.lastInputAt = this.time.now
      if (!this.firstTapDone) {
        this.firstTapDone = true
        this.emit({ type: 'firstTap' })
      }
      const z = this.zone
      const target = this.hitInteractable(x, y)
      if (target) {
        this.emit({ type: 'tap', target })
        const st = target.startsWith('station:') && z.stations && z.stations.find((s) => `station:${s.id}` === target)
        const stand = st
          ? { x: st.standX, y: st.standY }
          : target === 'spark'
            ? this.sparkStandPoint()
            : target === 'pond'
              ? z.spots.pond
              : z.spots.exitStand
        this.showTapMarker(stand.x, stand.y)
        this.walkTo(stand.x, stand.y, target)
        return
      }
      this.emit({ type: 'tap', target: null })
      const w = this.nearestWalkable(x, y)
      if (!w || w.d > SNAP_MAX) return
      this.showTapMarker(w.x, w.y)
      this.walkTo(w.x, w.y, null)
    }

    hitInteractable(x, y) {
      const z = this.zone
      // Objectives first, so a companion Spark hovering near the exit or
      // the pond can't steal the tap meant for them.
      if (Phaser.Math.Distance.Between(x, y, z.spots.exit.x, z.spots.exit.y) < INTERACT_R.exit) return 'exit'
      // Draft 94 (Zone 2, item 1a): free-order stations. A completed one is
      // inert -- `this.stations[id].done` -- so re-tapping it falls through
      // to a plain walk-there tap instead of retriggering the sequence.
      if (z.stations) {
        for (const st of z.stations) {
          if (this.stations && this.stations[st.id] && this.stations[st.id].done) continue
          if (Phaser.Math.Distance.Between(x, y, st.x, st.y) < STATION_R) return `station:${st.id}`
        }
      }
      // Draft 94: Zone 2's plate 2 reuses `z.pond` purely as a walkable
      // exclusion (the fire) with no matching interactable -- `stations`
      // replaces it as the tap target, so this whole check is skipped
      // there (`noPondTarget`).
      const pondHit =
        !z.noPondTarget &&
        ((z.pond && inEllipse(x, y, { ...z.pond, rx: z.pond.rx + 40, ry: z.pond.ry + 40 })) ||
          Phaser.Math.Distance.Between(x, y, z.spots.pond.x, z.spots.pond.y) < INTERACT_R.pond)
      if (pondHit) return 'pond'
      if (this.spark && Phaser.Math.Distance.Between(x, y, this.spark.x, this.spark.y) < INTERACT_R.spark) return 'spark'
      return null
    }

    // Where to stand to talk to Spark: the fixed stand spot while Spark is
    // waiting; when Spark is a companion it's already at your shoulder, so
    // "walk to Spark" just means stay put.
    sparkStandPoint() {
      if (this.progress.sparkMode === 'waiting') return this.zone.spots.sparkStand
      return { x: this.traveler.x, y: this.traveler.y }
    }

    // Draft 93 (item 1): the live on-screen position for React's "Tap here"
    // pointer (Zone 1 only) to sit over. `this.spark.x/y` is the actual
    // sprite -- updated every frame in update() -- so it's correct whether
    // Spark is waiting at a fixed stand or riding along as a companion at
    // the Traveler's shoulder; a static copy of `sparkStand` (the old Draft
    // 90 approach) went stale the moment Spark became a companion, which is
    // the bug Josh's Zone 3 screenshot caught (pointer sitting mid-path).
    // Pond and exit don't move, but reading them from the zone's own spots
    // here too means there's exactly one source of truth for all three.
    pointerPosFor(target) {
      const z = this.zone
      if (target === 'spark') return this.spark ? { x: this.spark.x, y: this.spark.y } : null
      if (target === 'pond') return z.spots.pond || null
      if (target === 'exit') return z.spots.exitStand || null
      return null
    }

    showTapMarker(x, y) {
      const s = this.depthScale(y)
      if (this.tapMarker) this.tapMarker.destroy()
      const ring = this.add.image(x, y, 'ring').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe9b8)
      ring.setScale(0.25 * s).setAlpha(0.9).setDepth(y - 0.4)
      this.tweens.add({ targets: ring, scale: 0.75 * s, alpha: 0, duration: 650, ease: 'Sine.easeOut', onComplete: () => ring.destroy() })
      const spot = this.add.image(x, y, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe9b8)
      spot.setScale(0.55 * s).setAlpha(0.42).setDepth(y - 0.4)
      this.tapMarker = spot
    }

    fadeTapMarker() {
      const m = this.tapMarker
      this.tapMarker = null
      if (!m) return
      this.tweens.add({ targets: m, alpha: 0, scale: m.scale * 0.6, duration: 320, onComplete: () => m.destroy() })
    }

    // Draft 75 (9/11 review): testers didn't realize they could walk. The
    // first-move cue is now an unmistakable instruction pill plus the ghost
    // tap pulsing ON THE PATH between the Traveler and Spark, and it stays
    // up until the first successful tap-to-move (see walkTo), not until any
    // tap. Reduced motion: static text and ring, no pulse.
    showHint() {
      const t = this.traveler
      const sp = this.zone.spots.sparkWait
      // A point on the path roughly a third of the way from the Traveler
      // toward Spark -- where the first tap should land.
      const hx = t.x + (sp.x - t.x) * 0.12
      const hy = t.y + (sp.y - t.y) * 0.38
      const s = this.depthScale(hy)
      const ring = this.add.image(hx, hy, 'ring').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe9b8).setDepth(H + 10)
      ring.setScale(0.3 * s).setAlpha(0.9)
      const dot = this.add.image(hx, hy, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe9b8).setDepth(H + 10)
      dot.setScale(0.5 * s).setAlpha(0.55)
      const text = this.add
        .text(hx, hy - 110 * s, 'Tap the path to walk', {
          fontFamily: 'Nunito, ui-rounded, system-ui, sans-serif',
          fontSize: '34px',
          fontStyle: '800',
          color: '#fff7ea',
          backgroundColor: 'rgba(2, 17, 39, 0.78)',
          padding: { left: 26, right: 26, top: 12, bottom: 12 },
          shadow: { offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.5)', blur: 12, fill: true },
        })
        .setOrigin(0.5, 1)
        .setDepth(H + 10)
      this.hint = [ring, dot, text]
      if (!this.reduced) {
        this.tweens.add({ targets: ring, scale: { from: 0.3 * s, to: 0.75 * s }, alpha: { from: 0.9, to: 0 }, duration: 1100, repeat: -1, ease: 'Sine.easeOut' })
        this.tweens.add({ targets: dot, alpha: { from: 0.55, to: 0.2 }, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        this.tweens.add({ targets: text, y: hy - 118 * s, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      }
    }

    hideHint() {
      if (!this.hint) return
      const items = this.hint
      this.hint = null
      this.tweens.add({ targets: items, alpha: 0, duration: 300, onComplete: () => items.forEach((i) => i.destroy()) })
    }

    // ---- Spark ----
    buildSpark() {
      const z = this.zone
      const frames = []
      for (let i = 0; i < 4; i++) if (this.textures.exists(`spark-${i}`)) frames.push({ key: `spark-${i}` })
      if (!frames.length) return
      if (!this.anims.exists('spark-flicker')) this.anims.create({ key: 'spark-flicker', frames, frameRate: 5, repeat: -1 })
      const wait = z.spots.sparkWait
      const s = this.depthScale(wait.y)
      // Soft additive halo behind the flame (the only ADD-blended part).
      this.sparkHalo = this.add.image(wait.x, wait.y - 130 * s, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffd9a0)
      this.sparkHalo.setAlpha(SPARK_HALO_ALPHA).setScale(1.9 * s).setDepth(wait.y + 0.9)
      this.spark = this.add.sprite(wait.x, wait.y - 130 * s, 'spark-0').setAlpha(SPARK_ALPHA)
      this.spark.play('spark-flicker')
      this.spark.setScale((SPARK_H / SPARK_SRC_H) * s).setDepth(wait.y + 1)
      this.sparkGround = { x: wait.x, y: wait.y }
      this.sparkBob = 0
      // Waiting-objective pulse ring on the ground under Spark (kept gentle
      // so it doesn't stack into a hot spot with the halo).
      this.sparkRing = this.add.image(wait.x, wait.y, 'ring').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe3a0)
      this.sparkRing.setScale(0.45 * s).setAlpha(0.5).setDepth(wait.y - 0.6)
      this.sparkRingBase = 0.45 * s
      this.pulse(this.sparkRing, this.sparkRingBase, 0.55)
      // Companion light-trail, soft.
      this.trail = this.add.particles(0, 0, 'glow', {
        lifespan: { min: 450, max: 800 },
        speed: { min: 4, max: 16 },
        scale: { start: 0.16, end: 0.02 },
        alpha: { start: 0.42, end: 0 },
        tint: [0xffe3a0, 0xfff3d0, 0xffc98a],
        blendMode: 'ADD',
        frequency: 60,
        emitting: false,
      })
      this.trail.setDepth(wait.y + 0.5)
      this.trail.startFollow(this.spark)
    }

    pulse(img, baseScale, maxAlpha = 0.95) {
      if (this.reduced) return
      this.tweens.add({
        targets: img,
        scale: { from: baseScale * 0.82, to: baseScale * 1.14 },
        alpha: { from: maxAlpha, to: maxAlpha * 0.3 },
        duration: 1300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    updateSpark(time, delta) {
      if (!this.spark) return
      const z = this.zone
      this.sparkBob += delta / 1000
      const bob = this.reduced ? 0 : Math.sin(this.sparkBob * 2.1) * 9
      if (this.progress.sparkMode === 'waiting') {
        const w = z.spots.sparkWait
        const s = this.depthScale(w.y)
        this.spark.setPosition(w.x, w.y - 130 * s + bob)
        this.spark.setScale((SPARK_H / SPARK_SRC_H) * s).setDepth(w.y + 1)
        this.placeSparkHalo(s, w.y)
        if (this.trail) this.trail.emitting = false
        return
      }
      // Companion: lag toward the Traveler's shoulder (or the gesture spot).
      let gx
      let gy
      if (this.sparkGesture && time < this.sparkGesture.until) {
        gx = this.sparkGesture.x
        gy = this.sparkGesture.y
      } else {
        this.sparkGesture = null
        const t = this.traveler
        const s = this.depthScale(t.y)
        // Hover on the side AWAY from the active objective (the pond is to
        // the right of the path, the exit straight up it, an active
        // friend station wherever that friend happens to be -- Draft 96
        // item 2b), so Spark never sits between the Traveler and the
        // thing they're about to tap, or on top of a friend mid-station.
        const activeSt = this.activeStationFriend()
        const obj = activeSt || (this.progress.pond === 'active' ? z.spots.pond : this.progress.exit === 'active' ? z.spots.exit : null)
        let side = -1
        if (obj && obj.x < t.x - 40) side = 1
        gx = t.x + side * 105 * s + (this.nudge ? this.nudge.dx : 0)
        gy = t.y - 20 * s + (this.nudge ? this.nudge.dy : 0)
        // Draft 96 (item 2c): treat every friend's perch (+40px) as a
        // no-hover zone for Spark's idle drift too, not just the active
        // one -- otherwise she can still drift onto a friend she isn't
        // currently visiting while the Traveler walks past the camp.
        if (z.stations) {
          for (const st of z.stations) {
            const d = Math.hypot(gx - st.x, gy - st.y)
            const minD = FRIEND_H * 0.5 + 40
            if (d < minD && d > 0.01) {
              gx = st.x + ((gx - st.x) / d) * minD
              gy = st.y + ((gy - st.y) / d) * minD
            }
          }
        }
      }
      const k = 1 - Math.exp(-delta / 320)
      this.sparkGround.x += (gx - this.sparkGround.x) * k
      this.sparkGround.y += (gy - this.sparkGround.y) * k
      const s = this.depthScale(this.sparkGround.y)
      const speed = Math.hypot(gx - this.sparkGround.x, gy - this.sparkGround.y)
      this.spark.setPosition(this.sparkGround.x, this.sparkGround.y - 215 * s + bob)
      this.spark.setScale((SPARK_H / SPARK_SRC_H) * s).setDepth(this.depthCapFor(this.sparkGround.y, 4) + 1)
      this.placeSparkHalo(s, this.sparkGround.y)
      if (this.trail) {
        this.trail.setDepth(this.sparkGround.y + 0.5)
        this.trail.emitting = !this.reduced && speed > 18
      }
    }

    // The halo rides on the flame's center, a hair behind it in depth --
    // Draft 96 (item 2b): while a station is active, also capped behind
    // that friend, same as the Traveler and Spark's own body.
    placeSparkHalo(s, groundY) {
      if (!this.sparkHalo) return
      this.sparkHalo.setPosition(this.spark.x, this.spark.y + 10 * s)
      this.sparkHalo.setScale(1.9 * s).setDepth(this.depthCapFor(groundY, 4) + 0.9)
    }

    // ---- Zone 2 camp friends (Draft 94, item 1) ----
    // Each friend is two stacked images (before, after) at the same spot;
    // the "after" one starts at alpha 0 (or 1, for a station already
    // completed in an earlier run/StrictMode remount) and ramps up as the
    // player holds the lantern on them -- a plain crossfade, not a texture
    // swap, so it can pause and resume mid-fade. Inserted in before-then-
    // after order so "after" naturally paints on top at the same depth.
    buildStations() {
      const z = this.zone
      if (!z.stations || !z.stations.length) return
      this.stations = {}
      z.stations.forEach((st) => {
        const beforeKey = `friend-${st.id}-before`
        const afterKey = `friend-${st.id}-after`
        if (!this.textures.exists(beforeKey)) return
        const s = this.depthScale(st.y)
        const scaleFor = (img) => (FRIEND_H * s) / img.height
        const before = this.add.image(st.x, st.y, beforeKey).setOrigin(0.5, 1)
        before.setScale(scaleFor(before)).setDepth(st.y)
        const after = this.textures.exists(afterKey)
          ? this.add.image(st.x, st.y, afterKey).setOrigin(0.5, 1).setScale(scaleFor(before)).setDepth(st.y).setAlpha(0)
          : null
        if (!this.reduced) {
          const targets = after ? [before, after] : [before]
          this.tweens.add({
            targets,
            scaleX: '+=0.015',
            scaleY: '+=0.015',
            duration: 4000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          })
        }
        this.stations[st.id] = { before, after, done: false }
      })
    }

    // Draft 94: driven by the React-side press-and-hold gesture (see
    // StationSequence) -- `t` is 0..1, the after-image's alpha. Setting it
    // to 1 (or back below 1, though the host never does that once lit)
    // is exactly what "release early, pauses; hold again, continues" needs
    // -- there's no separate paused/resumed state to track here at all.
    setStationLight(id, t) {
      const st = this.stations && this.stations[id]
      if (!st || !st.after) return
      st.after.setAlpha(Phaser.Math.Clamp(t, 0, 1))
      st.done = t >= 1
    }

    // Draft 96 (item 2): React calls this the moment a station sequence
    // mounts/unmounts. See `depthCapFor` -- while a station is active, the
    // Traveler and Spark are never allowed to render in front of that
    // friend, however the exact stand point happens to fall.
    setActiveStation(id) {
      this.activeStationId = id || null
    }

    // The friend the Traveler/Spark should never draw in front of right
    // now, if any -- `null` outside an active station sequence.
    activeStationFriend() {
      if (!this.activeStationId || !this.zone.stations) return null
      return this.zone.stations.find((s) => s.id === this.activeStationId) || null
    }

    // Clamp a would-be depth so it stays behind the active friend by
    // `margin` -- used for both the Traveler and Spark so neither can ever
    // paint over the before/after cross-fade the station is all about,
    // regardless of the exact stand point in play.
    depthCapFor(y, margin) {
      const friend = this.activeStationFriend()
      return friend ? Math.min(y, friend.y - margin) : y
    }

    // The live on-screen position of a friend (for React to position the
    // quiz chips / hold-ring overlay precisely over them), same technique
    // as `pointerPosFor`.
    stationPosFor(id) {
      const st = this.zone.stations && this.zone.stations.find((s) => s.id === id)
      return st ? { x: st.x, y: st.y } : null
    }

    // ---- interactable markers ----
    buildMarkers() {
      const z = this.zone
      const mk = (spot, ringScale) => {
        const s = this.depthScale(spot.y)
        const ring = this.add.image(spot.x, spot.y, 'ring').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe3a0)
        ring.setScale(ringScale * s).setAlpha(0).setDepth(spot.y - 0.6)
        const dim = this.add.image(spot.x, spot.y - 10 * s, 'glow').setTint(0x0b1226).setAlpha(0).setDepth(spot.y - 0.7)
        dim.setScale(1.6 * s, 0.9 * s)
        const lock = this.add.image(spot.x, spot.y - 46 * s, 'lock').setAlpha(0).setDepth(spot.y + 0.8).setScale(0.9 * s)
        return { ring, dim, lock, baseRing: ringScale * s, tween: null }
      }
      this.markers = {
        pond: mk(z.spots.pond, 0.55),
        exit: mk(z.spots.exit, 0.7),
      }
      // Exit: a soft standing glow toward the beacon when active.
      const e = z.spots.exit
      const es = this.depthScale(e.y)
      this.exitGlow = this.add.image(e.x, e.y - 60 * es, 'glow').setBlendMode(Phaser.BlendModes.ADD).setTint(0xffe3a0)
      this.exitGlow.setScale(2.2 * es, 3.4 * es).setAlpha(0).setDepth(e.y - 0.65)
    }

    applyProgress() {
      const p = this.progress
      if (!this.markers) return
      for (const key of ['pond', 'exit']) {
        const m = this.markers[key]
        const state = p[key]
        if (m.tween) {
          m.tween.stop()
          m.tween = null
        }
        this.tweens.killTweensOf([m.ring, m.dim, m.lock])
        if (state === 'active') {
          m.dim.setAlpha(0)
          m.lock.setAlpha(0)
          m.ring.setAlpha(0.9)
          this.pulse(m.ring, m.baseRing)
        } else if (state === 'locked') {
          m.ring.setAlpha(0)
          m.dim.setAlpha(0.42)
          m.lock.setAlpha(0.8)
        } else {
          m.ring.setAlpha(0)
          m.dim.setAlpha(0)
          m.lock.setAlpha(0)
        }
      }
      if (this.exitGlow) {
        this.tweens.killTweensOf(this.exitGlow)
        if (p.exit === 'active') {
          this.exitGlow.setAlpha(0.55)
          if (!this.reduced) this.tweens.add({ targets: this.exitGlow, alpha: { from: 0.35, to: 0.75 }, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        } else this.exitGlow.setAlpha(0)
      }
      if (this.sparkRing) {
        this.tweens.killTweensOf(this.sparkRing)
        if (p.spark === 'active' && p.sparkMode === 'waiting') {
          this.sparkRing.setAlpha(0.5)
          this.pulse(this.sparkRing, this.sparkRingBase, 0.55)
        } else this.sparkRing.setAlpha(0)
      }
    }

    // ---- ambient reporting ----
    updateProximity(time) {
      if (!this.traveler || !this.zone.pond || time - this.lastProximityAt < PROXIMITY_EVERY_MS) return
      this.lastProximityAt = time
      const z = this.zone
      const d = Phaser.Math.Distance.Between(this.traveler.x, this.traveler.y, z.pond.x, z.pond.y)
      const pond = Phaser.Math.Clamp(1 - (d - 220) / 520, 0, 1)
      this.emit({ type: 'proximity', pond })
    }

    // Idle with an objective pending: Spark (as companion) drifts a little
    // toward it and back, a wordless "this way."
    maybeNudge(time) {
      if (this.paused || !this.began || !this.spark || this.progress.sparkMode !== 'companion') return
      if (this.moving || this.nudge) return
      if (time - this.lastInputAt < IDLE_NUDGE_MS || time - this.lastNudgeAt < NUDGE_COOLDOWN_MS) return
      const z = this.zone
      const obj = this.progress.pond === 'active' ? z.spots.pond : this.progress.exit === 'active' ? z.spots.exit : null
      if (!obj) return
      this.lastNudgeAt = time
      const dx = obj.x - this.traveler.x
      const dy = obj.y - this.traveler.y
      const len = Math.hypot(dx, dy) || 1
      this.nudge = { dx: 0, dy: 0 }
      this.tweens.add({
        targets: this.nudge,
        dx: (dx / len) * 150,
        dy: (dy / len) * 150,
        duration: 900,
        yoyo: true,
        hold: 350,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.nudge = null
        },
      })
      this.emit({ type: 'nudge' })
    }
  }
}
