// Per-zone content for the walkable-zone page template (GAINS Draft 68,
// genericized Draft 80). The Phaser-scene geometry (spots, walkable
// polygons, the waypoint graph) lives in `zoneWalkScene.js` alongside the
// scene that reads it -- this file is everything the REACT page needs to
// run its state machine and render its screens: Spark's lines, the
// station's activity, the zone's own gear, which traversal ends it, and
// the end card. `GainsZonePage.jsx` renders any of these; `GainsZone4Page`/
// `GainsZone3Page` are thin route wrappers picking one.
//
// Zone 4's values here are Draft 68-70/72-75's, moved verbatim (no
// behavior change). Zone 3 is the second instance: same template, the
// Mistfields plate, the Guardian message-builder as the station, the
// Wingsuit as the gear, the existing flight traversal as the exit.

import MindfulnessCalmPlace from '../../MindfulnessCalmPlace.jsx'
import ElevatorPitch from '../../ElevatorPitch.jsx'
import BodyMapping from '../../BodyMapping.jsx'

export const ZONES = {
  // Zone 1 is the opening of the game, so it gets one extra capability the
  // template didn't need before: `introPlate` (Draft 83) -- a first, much
  // simpler plate (only Spark is interactable, no station/exit, no
  // arrival lock) that plays before `GainsZonePage`'s normal loop begins
  // on the zone's own main plate. `introPlate.zoneId`/`base`/`mapFile`
  // point zoneWalkScene.js/ZoneStage at that plate's own geometry and art;
  // `introPlate.video`/`vo` are that plate's own content. Zones without
  // `introPlate` are entirely unaffected -- GainsZonePage skips the whole
  // phase for them.
  zone1: {
    id: 'zone1',
    // The zoneWalkScene.js walkable-scene registry keys the two plates as
    // 'zone1intro'/'zone1main' (distinct waypoint graphs) -- `mainZoneId`
    // points GainsZonePage at the right one once it leaves the intro plate,
    // since `id` alone ('zone1') isn't a key that registry recognizes.
    mainZoneId: 'zone1main',
    base: '/long-light/zone1',
    mapFile: 'plate2.webp', // the MAIN plate; the intro plate names its own below
    introPlate: {
      zoneId: 'zone1intro',
      base: '/long-light/zone1',
      mapFile: 'plate1.webp',
      video: { id: '1227051194', h: '8c2fcaf83f', title: 'Intro — Welcome to Shadowmend' },
      vo: {
        welcome: { file: 'z1-00-welcome.mp3', text: 'The Dark Abyss.' },
        beckon: { file: 'z1-01-beckon.mp3', text: 'Hello? Over here — come find me.' },
      },
    },
    docTitle: 'GAINS for Teens — Zone 1: The Dark Abyss (walkable prototype)',
    eyebrow: 'Zone 1',
    introTitle: 'The Dark Abyss',
    introInstructions: 'Tap the path to move. Tap Spark to interact. Spark will guide you.',
    welcomeTitle: 'The Dark Abyss',
    transitionHeading: "We're headed for the Lantern Path!",
    // The main plate's (Plate 2) five ambient SVG overlay layers -- fog,
    // candles, the Mirror Pool's ripples, embers, the steps' breathing
    // glow (see each file's <desc> in public/long-light/zone1/ov/plate2/).
    // The intro plate (Plate 1) has its own set but Draft 83 doesn't wire
    // a per-phase overlay swap yet -- see the WORKING_NOTES bullet.
    overlayLayers: [
      { key: 'fog', file: 'layer-fog.svg', blend: 'normal' },
      { key: 'candles', file: 'layer-candles.svg', blend: 'screen' },
      { key: 'pool', file: 'layer-pool.svg', blend: 'screen' },
      { key: 'embers', file: 'layer-embers.svg', blend: 'screen' },
      { key: 'stepsGlow', file: 'layer-steps-glow.svg', blend: 'screen' },
    ],
    overlaySub: 'plate2', // ZoneOverlays fetches `${base}/ov/${overlaySub}/${file}`
    // Zone 1 has no sfx/ folder of its own -- footsteps/chime/whoosh are
    // generic enough to borrow from Zone 4, same as Zone 3 does below.
    sfxBase: '/long-light/zone4',
    sfxPreload: ['step-stone-1', 'step-stone-2', 'step-stone-3', 'chime-unlock', 'spark-whoosh', 'ui-tap', 'equip-flash', 'arrive-swell'],
    // Spark's lines (voice F), VERBATIM from
    // `Gains for Teens/Walkable Zones/Zone 1/Zone 1 — Prep Package (traversal design + VO + prompts).md`.
    vo: {
      arrive: {
        file: 'z1-02-arrive.mp3',
        text: 'Come over here — let’s start with what trauma actually is.',
      },
      followMe: {
        file: 'z1-03-follow-me.mp3',
        text: 'Follow me. There’s a quiet pool just ahead — I want to try an activity with you to show you how your body reacts.',
      },
      ready: {
        file: 'z1-04-ready.mp3',
        text: "You've earned your Lantern. It only lights the next few steps — and that's all we ever need. Come on, this way.",
      },
      exitTransition: {
        file: 'z1-05-exit-transition.mp3',
        text: "We're headed for the Lantern Path! It's dark out there, but your Lantern will show you the next few steps. Tap where you see a little light, and we'll find our way together.",
      },
      redirectStation: { file: 'z1-06-redirect-pool-first.mp3', text: 'Hold on — come find me first.' },
      redirectExitVideo: { file: 'z1-07-redirect-exit-before-video.mp3', text: 'Not yet! Come talk to me before you head out there.' },
      redirectExitActivity: {
        file: 'z1-08-redirect-exit-before-activity.mp3',
        text: "It's too dark to go that way without a light. Let's visit the pool first.",
      },
    },
    video: { id: '1227441876', h: '651daacb8a', title: 'Zone 1 — What is Trauma' },
    ActivityComponent: BodyMapping,
    // Draft 83: Body Mapping's own narration (10 clips) -- on only inside
    // the zone. `onNarrate` is wired generically by GainsZonePage (it
    // ducks the zone's own ambience), not stored here.
    activityExtraProps: { narrate: true },
    gear: {
      gearKey: 'lantern',
      name: 'Lantern',
      itemSrc: '/long-light/zone1/gear/lantern.webp',
      equippedSrc: '/long-light/zone1/gear/celebrate.webp',
      title: 'You earned the Lantern!',
      subline: "It only lights the next few steps — and that's all we ever need.",
      sparkLine: "Hold it up. See? The dark isn't so big when you can see the next step.",
      equipLabel: 'Equip lantern',
    },
    // The Lantern is the FIRST gear -- every HUD slot starts empty.
    gearEarnedBefore: [],
    traversalMode: 'firstlight',
    // The First Light (Draft 82) inherits this zone's own ambience rather
    // than starting its own -- GainsZonePage keeps the beds running
    // through 'transition'/'climb' instead of stopping them, and passes
    // skipMusic + onDuck (duck-under-VO) to TraversalGame for this zone.
    continueAmbienceIntoTraversal: true,
    endCard: {
      background: 'var(--sky-beacon)',
      textColor: 'var(--text-on-warm)',
      subTextColor: 'rgba(58,29,5,.85)',
      heading: 'You reached the Lantern Path.',
      subtitle: null,
      // Zone 2 doesn't exist yet -- shown as a disabled preview rather
      // than a real link (Draft 83).
      nextHref: null,
      nextLabel: 'Continue to the Lantern Path',
      nextDisabled: true,
    },
    feedbackSection: 'review-zone1',
  },

  zone4: {
    id: 'zone4',
    base: '/long-light/zone4',
    frogUrl: '/long-light/art/mindfulness/frog-painterly.png', // the pond's frog -- Zone 4 only
    pondSoundscapeUrl: '/long-light/audio/mindfulness/soundscape.mp3',
    docTitle: 'GAINS for Teens — Zone 4: The Bright Reaches (walkable prototype)',
    eyebrow: 'Zone 4',
    introTitle: 'The Bright Reaches',
    introInstructions: 'Tap the path to move. Tap Spark, the pond, or the way up to interact. Spark will guide you.',
    welcomeTitle: 'Welcome to the Bright Reaches',
    transitionHeading: "We're headed for Mount Hope!",
    // The five ambient SVG overlay layers for this plate (ZoneOverlays.jsx).
    overlayLayers: [
      { key: 'clouds', file: 'layer-clouds.svg', blend: 'screen' },
      { key: 'motes', file: 'layer-motes.svg', blend: 'screen' },
      { key: 'sway', file: 'layer-sway.svg', blend: 'normal' },
      { key: 'beacon', file: 'layer-beacon.svg', blend: 'screen' },
      { key: 'pondGlint', file: 'layer-pond-glint.svg', blend: 'screen' },
    ],
    sfxPreload: ['step-stone-1', 'step-stone-2', 'step-stone-3', 'step-grass-1', 'step-grass-2', 'step-grass-3', 'chime-unlock', 'spark-whoosh', 'ui-tap', 'equip-flash', 'arrive-swell'],
    // Spark's lines (voice F), VERBATIM from
    // `Gains for Teens/Walkable Zones/Zone 4 — Spark Voice Lines (voice F).md`.
    vo: {
      welcome: { file: 'z4-00-welcome.mp3', text: 'Welcome to the Bright Reaches.' },
      arrive: {
        file: 'z4-01-arrive.mp3',
        text: "Oh! something's different about you! It's like the light inside you is brighter. Come over here for a moment. I want to tell you all about therapy.",
      },
      followMe: {
        file: 'z4-02-follow-me.mp3',
        text: 'Follow me! I know the perfect place to try the grounding activity',
      },
      ready: {
        file: 'z4-03-ready.mp3',
        text: "You've got your Oxygen Mask now. I think you're ready to keep climbing — the air gets thin up there, and it'll help you breathe. Head for the path up toward Mount Hope.",
      },
      exitTransition: {
        file: 'z4-04-exit-transition.mp3',
        text: "We're headed for Mount Hope! Here's how the climb works. Steer with one thumb. Collect the glowing gold feelings to keep your Second Wind up. And when a heavy feeling blocks your path, tap it to fire your Focusing Lens — it'll show you what it is, and turn it into light. Ready? Let's go.",
      },
      redirectStation: { file: 'z4-05-redirect-pond-first.mp3', text: 'Hold on — come find me first. I want to tell you something.' },
      redirectExitVideo: { file: 'z4-06-redirect-exit-before-video.mp3', text: 'Not yet! Come talk to me before you head up.' },
      redirectExitActivity: {
        file: 'z4-07-redirect-exit-before-activity.mp3',
        text: "The mountain's too high right now — you'll need an Oxygen Mask to breathe up there. Let's go to the pond first.",
      },
    },
    // Video 4 (same unlisted id + hash as reviewVideos.jsx). Draft 70
    // (2026-09-03): new render without the burned-in Spark subtitles.
    video: { id: '1227445659', h: '3a88ca76d5', title: 'Zone 4 — What Therapy Feels Like' },
    ActivityComponent: MindfulnessCalmPlace,
    gear: {
      gearKey: 'mask',
      name: 'Oxygen Mask',
      itemSrc: '/long-light/zone4/gear/oxygen-mask.webp',
      equippedSrc: '/long-light/zone4/gear/celebrate.webp',
      title: 'You earned the Oxygen Mask!',
      leveledUpTitle: 'Your Oxygen Mask leveled up!',
      subline: "It'll help you breathe easy on the climb ahead.",
      sparkLine: 'Perfect fit. Now you can breathe easy up there.',
      equipLabel: 'Equip mask',
    },
    gearEarnedBefore: ['lantern', 'lens', 'wingsuit'],
    traversalMode: 'climb',
    endCard: {
      background: 'var(--sky-beacon)',
      textColor: 'var(--text-on-warm)',
      subTextColor: 'rgba(58,29,5,.85)',
      heading: 'You reached the Beacon.',
      subtitle: 'Zone 5 · to be continued',
      nextHref: null,
      nextLabel: null,
    },
    feedbackSection: 'review-zone4',
  },

  zone3: {
    id: 'zone3',
    base: '/long-light/zone3',
    // Reuses Zone 4's Traveler (they share stage 3) and Spark flicker
    // frames, and Zone 4's SFX pack -- one copy of those files, not two.
    spriteBase: '/long-light/zone4',
    sfxBase: '/long-light/zone4',
    docTitle: 'GAINS for Teens — Zone 3: The Mistfields (walkable prototype)',
    eyebrow: 'Zone 3',
    introTitle: 'The Mistfields',
    introInstructions: 'Tap the path to move. Tap Spark, the waystone, or the bridge to interact. Spark will guide you.',
    welcomeTitle: 'Welcome to the Mistfields',
    transitionHeading: "We're headed for the Bright Reaches!",
    // The five ambient SVG overlay layers for the Mistfields plate: mist
    // banks, motes at the waystone, the waystone/bridge lantern flicker,
    // grass/rope sway, and the far high-ground glow (see each file's
    // <desc> in `public/long-light/zone3/ov/`).
    overlayLayers: [
      { key: 'mist', file: 'layer-mist.svg', blend: 'screen' },
      { key: 'motes', file: 'layer-motes.svg', blend: 'screen' },
      { key: 'lantern', file: 'layer-lantern.svg', blend: 'screen' },
      { key: 'sway', file: 'layer-sway.svg', blend: 'normal' },
      { key: 'beyond', file: 'layer-beyond.svg', blend: 'screen' },
    ],
    sfxPreload: ['step-stone-1', 'step-stone-2', 'step-stone-3', 'chime-unlock', 'spark-whoosh', 'ui-tap', 'equip-flash', 'arrive-swell'],
    // Spark's lines (voice F), VERBATIM from
    // `Gains for Teens/Walkable Zones/Zone 3/Zone 3 — Prep Package (VO + prompts).md`.
    vo: {
      welcome: { file: 'z3-00-welcome.mp3', text: 'Welcome to the Mistfields.' },
      arrive: {
        file: 'z3-01-arrive.mp3',
        text: "Oh! Something is changing. The light inside you is brighter than when we met. Come over here for a moment. I want to tell you something important: you don't have to go through this alone.",
      },
      followMe: {
        file: 'z3-02-follow-me.mp3',
        text: "Follow me! There's a quiet spot by the bridge. I've got an idea for how we can get the people who care about you on board.",
      },
      ready: {
        file: 'z3-03-ready.mp3',
        text: "You've got your Wingsuit! That bridge is out, but you don't need it anymore — you can fly. Head for the edge, and let's cross to the Bright Reaches.",
      },
      exitTransition: {
        file: 'z3-04-exit-transition.mp3',
        text: "We're headed for the Bright Reaches! Here's how the flight works. Steer with one thumb. Glide through the glowing connections to keep your wings strong — every person who's there for you lifts you higher. Ready? Let's fly.",
      },
      redirectStation: { file: 'z3-05-redirect-spot-first.mp3', text: 'Hold on — come find me first. I want to tell you something.' },
      redirectExitVideo: { file: 'z3-06-redirect-exit-before-video.mp3', text: 'Not yet! Come talk to me before you head out there.' },
      redirectExitActivity: {
        file: 'z3-07-redirect-exit-before-activity.mp3',
        text: "That bridge is out — there's no way across yet. Let's plan your message first, and then I'll show you how to get over.",
      },
    },
    video: { id: '1227443944', h: 'a507d992ff', title: 'Zone 3 — Getting the Best Therapy' },
    ActivityComponent: ElevatorPitch,
    // Draft 86: Spark narration + "Read to me" on the select steps.
    activityExtraProps: { narrate: true },
    gear: {
      gearKey: 'wingsuit',
      name: 'Wingsuit',
      itemSrc: '/long-light/zone3/gear/wingsuit.webp',
      equippedSrc: '/long-light/zone3/gear/celebrate.webp',
      title: 'You earned the Wingsuit!',
      subline: "It'll carry you across to the Bright Reaches.",
      sparkLine: "The bridge doesn't matter anymore. You can fly.",
      equipLabel: 'Equip wingsuit',
    },
    gearEarnedBefore: ['lantern', 'lens'],
    traversalMode: 'flight',
    endCard: {
      background: 'var(--sky-beacon)',
      textColor: 'var(--text-on-warm)',
      subTextColor: 'rgba(58,29,5,.85)',
      heading: 'You reached the Bright Reaches.',
      subtitle: null,
      nextHref: '/gains-demo/zone4',
      nextLabel: 'Continue to the Bright Reaches',
    },
    feedbackSection: 'review-zone3',
  },
}
