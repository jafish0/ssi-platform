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

export const ZONES = {
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
    video: { id: '1223708060', h: '2ab5970912', title: 'Zone 4 — What Therapy Feels Like' },
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
        text: "Oh — something's different about you again. The light inside you is brighter than when we met. Come over here for a moment. I want to tell you something important: you don't have to go through this alone.",
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
    video: { id: '1223207965', h: 'd0c77b8f23', title: 'Zone 3 — Getting the Best Therapy' },
    ActivityComponent: ElevatorPitch,
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
