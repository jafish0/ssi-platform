// Zone 2 "The Lantern Path" content (GAINS Draft 94, Phase A). Consumed by
// the bespoke `GainsZone2Page.jsx` (not the shared `zones.js`/
// `GainsZonePage.jsx` template -- see that page's own header comment for
// why). Spark's lines are VERBATIM from
// `Gains for Teens/Walkable Zones/Zone 2/Zone 2 — Concept (The Lantern
// Path, the Four Friends, the Focusing Lens, the Fogline).md` §7; the
// friend scripts and thank-you lines from §4/§7 of the same doc.

const BASE = '/long-light/zone2'
const FRIENDS = `${BASE}/friends`
const PARTS = `${BASE}/parts`
const GEAR = `${BASE}/gear`

export const ZONE2 = {
  base: BASE,
  // No sfx/ folder of its own -- reuse Zone 4's pack, same as Zones 1/3.
  sfxBase: '/long-light/zone4',
  docTitle: 'GAINS for Teens — Zone 2: The Lantern Path (walkable prototype)',
  transitionHeading: 'Into the Mistfields!',
  sfxPreload: ['step-stone-1', 'step-stone-2', 'step-stone-3', 'step-grass-1', 'step-grass-2', 'step-grass-3', 'chime-unlock', 'spark-whoosh', 'ui-tap', 'equip-flash', 'arrive-swell'],
  video: { id: '1227442904', h: '46f782197e', title: 'Zone 2 — The Four Reactions' },

  vo: {
    welcome: { file: 'z2-00-welcome.mp3', text: 'The Lantern Path. Look at that. Every one of those was dark before you came through.' },
    arrive: {
      file: 'z2-01-arrive.mp3',
      text: 'Come here, I want to show you something. There’s more to trauma than what it does to your body. Let me explain.',
    },
    followMe: {
      file: 'z2-02-follow-me.mp3',
      text: 'Those four reactions? They’re not just words. There are some other travelers camped up ahead, on the same path you’re on. They’ve gotten a bit stuck. Maybe you and I can help them figure out what’s going on. Come on.',
    },
    campArrive: {
      file: 'z2-03-camp-arrive.mp3',
      text: 'Here they are. Each one of them is dealing with one of the four. Go say hi and listen. Any order, just tap whoever you want to talk to first.',
    },
    nameIt: { file: 'z2-04-name-it.mp3', text: 'Which one does that sound like?' },
    redirectFriendsFirst: { file: 'z2-13-redirect-friends-first.mp3', text: 'Not yet. Let’s meet everyone first.' },
    redirectExitVideo: { file: 'z2-14-redirect-exit-before-video.mp3', text: 'Hold on, watch this first.' },
    // Draft 95 will use these (the assembly/Fogline hand-off); wired here
    // now since the audio was already normalized and copied in Draft 94's
    // asset pass.
    redirectExitLens: { file: 'z2-15-redirect-exit-before-lens.mp3', text: 'You’ve got the parts. Build it first, at the fire.' },
    gearSpark: { file: 'z2-gear-spark.mp3', text: 'You didn’t find this. You built it, by helping four friends see what was happening to them. That’s what it does. It helps you see.' },
    ready: {
      file: 'z2-11-ready.mp3',
      text: 'Look at them. All four, sitting by the fire together. I hope we helped them along on their journey. You’ll be okay, you four. I’ll come back and check on you. ... Now, let’s see what this lens can do. The trail into the mist starts up there.',
    },
    exitTransition: { file: 'z2-12-exit-transition.mp3', text: 'Into the Mistfields. Keep the lens up.' },
    partHints: [
      { file: 'z2-07-part-hint-1.mp3', text: 'Huh. That looks like it’d fit a lantern.' },
      { file: 'z2-08-part-hint-2.mp3', text: 'Another one. These are definitely lantern parts.' },
      { file: 'z2-09-part-hint-3.mp3', text: 'Three. I’ve got a feeling about this.' },
      {
        file: 'z2-10-all-parts.mp3',
        text: 'Wait. Ring, glass, clasp, wick. Do you know what you’ve got? That’s everything you need to build a Focusing Lens. Come to the fire.',
      },
    ],
  },

  plate1: {
    mapFile: 'plate1.webp',
    overlayLayers: [
      { key: 'fog', file: 'layer-fog.svg', blend: 'normal' },
      { key: 'lamp-glow', file: 'layer-lamp-glow.svg', blend: 'screen' },
      { key: 'embers', file: 'layer-embers.svg', blend: 'screen' },
      { key: 'lantern-sway', file: 'layer-lantern-sway.svg', blend: 'normal' },
      { key: 'exit-glow', file: 'layer-exit-glow.svg', blend: 'screen' },
    ],
  },
  plate2: {
    mapFile: 'plate2.webp',
    overlayLayers: [
      { key: 'fire', file: 'layer-fire.svg', blend: 'screen' },
      { key: 'sparks', file: 'layer-sparks.svg', blend: 'screen' },
      { key: 'fog', file: 'layer-fog.svg', blend: 'normal' },
      { key: 'motes', file: 'layer-motes.svg', blend: 'screen' },
      { key: 'exit-glow', file: 'layer-exit-glow.svg', blend: 'screen' },
    ],
  },

  friendTextures: [
    { id: 'emberwick', before: `${FRIENDS}/emberwick-before.webp`, after: `${FRIENDS}/emberwick-after.webp` },
    { id: 'mirefly', before: `${FRIENDS}/mirefly-before.webp`, after: `${FRIENDS}/mirefly-after.webp` },
    { id: 'hollowshell', before: `${FRIENDS}/hollowshell-before.webp`, after: `${FRIENDS}/hollowshell-after.webp` },
    { id: 'dimmet', before: `${FRIENDS}/dimmet-before.webp`, after: `${FRIENDS}/dimmet-after.webp` },
  ],

  // The four free-order stations (Draft 94, item 1a/2). Order here is just
  // the tray-fill order once collected -- any friend can be visited first.
  stations: [
    {
      id: 'emberwick',
      name: 'Emberwick',
      partLabel: 'Steadyring',
      partSrc: `${PARTS}/part-steadyring.webp`,
      video: { id: '1229872174', h: 'af0ffa46d4', title: 'Zone 2 station — Emberwick (reactivity)' },
      answer: 'reactivity',
      vo: {
        hint: { file: 'z2-05-hint-emberwick.mp3', text: 'Look at him. He can’t sit still, he’s watching everything. Which one is that?' },
        lesson: {
          file: 'z2-lesson-emberwick.mp3',
          text: 'That’s reactivity. His body’s still on guard, like the danger never ended. Look, just knowing what it is helps her settle.',
        },
      },
      thanksAudio: 'friends/f2-emberwick-02-thanks.mp3',
      thanksText: 'Thank you. Here, take this. It’s called a Steadyring. Kept my flame from shaking. Maybe it fits your lantern.',
    },
    {
      id: 'mirefly',
      name: 'Mirefly',
      partLabel: 'Clearglass',
      partSrc: `${PARTS}/part-clearglass.webp`,
      video: { id: '1229872199', h: '36e4d74a97', title: 'Zone 2 station — Mirefly (intrusion)' },
      answer: 'intrusion',
      vo: {
        hint: { file: 'z2-05-hint-mirefly.mp3', text: 'Look at her. She keeps going right back there, like it’s happening again. Which one is that?' },
        lesson: {
          file: 'z2-lesson-mirefly.mp3',
          text: 'That’s intrusion. Her mind keeps replaying it to try to make sense of it. See? When you know what’s happening, it gets a little quieter.',
        },
      },
      thanksAudio: 'friends/f2-mirefly-02-thanks.mp3',
      thanksText: 'That’s better. Take this, it’s Clearglass. It shows what’s really there. I think it goes on a lantern.',
    },
    {
      id: 'hollowshell',
      name: 'Hollowshell',
      partLabel: 'Openclasp',
      partSrc: `${PARTS}/part-openclasp.webp`,
      video: { id: '1229872207', h: 'c2e7c80508', title: 'Zone 2 station — Hollowshell (avoidance)' },
      answer: 'avoidance',
      vo: {
        hint: { file: 'z2-05-hint-hollowshell.mp3', text: 'Look at her. She won’t come out, won’t talk about it, takes the long way around. Which one is that?' },
        lesson: {
          file: 'z2-lesson-hollowshell.mp3',
          text: 'That’s avoidance. Hiding feels safer, but it keeps things stuck. Look who’s coming out.',
        },
      },
      thanksAudio: 'friends/f2-hollowshell-02-thanks.mp3',
      thanksText: 'Thanks for not giving up on me. This is an Openclasp. It lets things open. Try it on your lantern.',
    },
    {
      id: 'dimmet',
      name: 'Dimmet',
      partLabel: 'Kindlewick',
      partSrc: `${PARTS}/part-kindlewick.webp`,
      video: { id: '1229872170', h: '7bc6212f82', title: 'Zone 2 station — Dimmet (negative mood and thoughts)' },
      answer: 'mood',
      vo: {
        hint: { file: 'z2-05-hint-dimmet.mp3', text: 'Look at him. Everything’s gray, and he’s blaming himself. Which one is that?' },
        lesson: {
          file: 'z2-lesson-dimmet.mp3',
          text: 'That’s the change in mood and thoughts. It’s not the truth about him, it’s what trauma does. Look, the color’s coming back.',
        },
      },
      thanksAudio: 'friends/f2-dimmet-02-thanks.mp3',
      thanksText: 'I feel a little more like me. Here. A Kindlewick. It brings a flame back. It’s a lantern part, I think.',
    },
  ],

  // Draft 95: the build-view assembly (drag the four parts from `stations`
  // onto the base Lantern image, below) and the GearAward that follows it.
  // `gearKey: 'lens'` matches `GearHud`'s canonical GEAR_ORDER slot 2 --
  // Zones 3/4's `gearEarnedBefore` already assume it (see zones.js).
  build: {
    baseSrc: '/long-light/zone1/gear/lantern.webp',
    targets: [
      { partId: 'emberwick', x: 50, y: 22, r: 15 }, // Steadyring -- the brass collar under the cap
      { partId: 'mirefly', x: 50, y: 47, r: 17 }, // Clearglass -- the front face
      { partId: 'hollowshell', x: 30, y: 58, r: 14 }, // Openclasp -- the door's front edge, left of the glass
      { partId: 'dimmet', x: 50, y: 78, r: 15 }, // Kindlewick -- inside, at the base of the flame
    ],
  },
  gear: {
    gearKey: 'lens',
    name: 'Focusing Lens',
    itemSrc: `${GEAR}/gear-focusing-lens.webp`,
    equippedSrc: `${GEAR}/celebrate.webp`,
    title: 'You built the Focusing Lens!',
    subline: 'Look closely at something and it gets clearer, and smaller, and you can see the next step.',
    sparkLine: 'You didn’t find this. You built it, by helping four friends see what was happening to them. That’s what it does. It helps you see.',
    sparkLineAudio: 'z2-gear-spark.mp3',
    equipLabel: 'Equip lens',
  },
  gearEarnedBefore: ['lantern'],
}
