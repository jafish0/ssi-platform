// The review cards on /gains-demo (Draft 71) and the blurb each dedicated
// page repeats at its top. The blurbs are Josh's "what's new / what to look
// for" text, VERBATIM -- they replace the long team email, so don't reword
// them. `links` open the dedicated 9:16 pages in the same tab.
//
// Draft 77: Body Mapping, Message to Your Guardian and Mindful Place are
// back here as review cards (reversing Draft 74's graduation -- the team
// wants the three activities together while they're still under review).
// Draft 80 adds Zone 3 (walkable) right before Zone 4. Draft 82 adds The
// First Light (a standalone traversal prototype) right after the Ascent --
// the two bare-mechanic traversal prototypes sit together. Draft 83 adds
// Zone 1 (walkable) right before Zone 3 -- the three walkable zones sit
// together. Draft 89: Pre/Post test moves out to its own canon section
// (see GainsDemoPage.jsx) and is no longer a card here; the remaining nine
// are reordered zones-and-videos-first. Order is fixed: Zone 1 · Zone 3 ·
// Zone 4 · Videos · Body Mapping · Guardian · Mindful Place · Ascent · The
// First Light. Draft 94 adds Zone 2 between Zone 1 and Zone 3 (renumbered).
// Draft 95 adds The Fogline right after Zone 2's card (renumbered again) --
// the Focusing Lens assembly and the traversal it unlocks. Draft 97 adds
// the title screen FIRST, above Zone 1 (renumbered again) -- the game's
// front door, name not yet adopted by the team.

export const REVIEW_CARDS = [
  {
    key: 'title',
    n: 1,
    title: 'Title screen — Shadowmend: The Long Light (proposed)',
    section: 'review-title',
    blurb:
      'A proposed name and the game’s first screen. The whole journey in one frame: the lantern at your feet, the trail up through the camp, the broken bridge, the pond, and the Beacon on Mount Hope. Tap to begin drops you into Zone 1. The name is a proposal, so tell us what you think of it.',
    links: [{ label: 'Open the title screen', to: '/gains-demo/title', play: true }],
  },
  {
    key: 'zone1',
    n: 2,
    title: 'Zone 1: The Dark Abyss — walkable zone',
    section: 'review-zone1',
    blurb:
      "The opening of the game. You arrive in the dark, walk up to a distant light to meet Spark, and watch the welcome video. Then, on the other side of the passage: the video on what trauma is, Body Mapping at the Mirror Pool (now with Spark narrating), your first gear, the Lantern, and The First Light, a traversal where you carry that flame back up a dark trail, relighting its lamps one by one.",
    links: [{ label: 'Play Zone 1', to: '/gains-demo/zone1', play: true }],
  },
  {
    key: 'zone2',
    n: 3,
    title: 'Zone 2: The Lantern Path — walkable zone',
    section: 'review-zone2',
    blurb:
      "The second walkable zone, and the first with more than one station. The trail continues from the First Light up to Spark, the video on the four trauma reactions, then a camp where four other travelers have gotten stuck, one with each reaction: Emberwick (reactivity), Mirefly (intrusion), Hollowshell (avoidance), Dimmet (negative mood and thoughts). Visit them in any order: watch their short video, name what's going on, then hold your lantern up to help them see it, and watch the change play out. Each one gives you a lantern part and the campfire grows a little brighter each time. Once you've met all four, drag the parts onto the Lantern at the fire to build the Focusing Lens, then head for the Fogline.",
    links: [{ label: 'Play Zone 2', to: '/gains-demo/zone2', play: true }],
  },
  {
    key: 'fogline',
    n: 4,
    title: 'The Fogline',
    section: 'review-fogline',
    blurb:
      "A traversal, Zone 2 → Zone 3: fog makes everything look bigger than it is. Drag the Focusing Lens around to see what's really there, hold it on a stone to bring it into focus, then hop. Look closely and the path shows itself one step at a time. Two shapes loom in the fog and turn out to be a bush and a stump once the lens holds steady on them.",
    links: [{ label: 'Play the Fogline', to: '/gains-demo/fogline', play: true }],
  },
  {
    key: 'zone3',
    n: 5,
    title: 'Zone 3: The Mistfields — walkable zone',
    section: 'review-zone3',
    blurb:
      "The Mistfields as a place you move through. Find Spark, watch the video, follow Spark to the waystone to plan your message to your guardian, earn and equip your Wingsuit, then head for the broken bridge and fly across to the Bright Reaches. The flight itself is new: you're now the Traveler in the Wingsuit instead of the bird, gliding and banking over painted Mistfields plates, up through the clouds to the golden summit and its beacon. The connection lights are warm gold, and the mist thins as you climb and clears as you break into the Bright Reaches.",
    links: [{ label: 'Play Zone 3', to: '/gains-demo/zone3', play: true }],
  },
  {
    key: 'zone4',
    n: 6,
    title: 'Zone 4: The Bright Reaches — walkable zone',
    section: 'review-zone4',
    blurb:
      'The first walkable zone: the Bright Reaches as a place you move through. Tap the ground to walk. Find Spark, watch the video, follow Spark to the pond for the Mindful Place, earn and equip your Oxygen Mask, then head for the exit and climb toward Mount Hope. Spark redirects you if you try something too early. It all happens inside one phone-sized frame, the way it will in the real app. Prototype stage. Does it feel like a game to you?',
    links: [{ label: 'Play Zone 4', to: '/gains-demo/zone4', play: true }],
  },
  {
    key: 'videos',
    n: 7,
    title: 'Videos',
    section: 'review-videos',
    blurb:
      "All five zone videos were re-rendered from Friday's notes. Spark is the new clean cutout with a gentle flicker throughout. On-screen words now appear as Spark says them, and where text used to show early to fill the screen, Spark floats up larger instead. Video 1 says 'it can happen to you… or someone you love,' its opening words and examples are re-timed, and the stray mid-screen sentence is gone. Video 2 lost the closing line about the characters. Video 3's timing is tightened. Video 4's three bubbles are evenly spaced and 'Building your toolbox' is gone. Video 5 says 'It's your mindset,' the 'two pairs of glasses' text is out, the phrases highlight as Spark speaks, and the four bubbles sit two by two. A new intro video, Welcome to Shadowmend, opens Zone 1 and is first on the videos page. Each video has its own comment box.",
    links: [{ label: 'Open the videos', to: '/gains-demo/videos' }],
  },
  {
    key: 'bodymap',
    n: 8,
    title: 'Body Mapping',
    section: 'review-bodymap',
    blurb:
      "Spark narration added. Spark now reads the intro, names each body region as you tap it, and reads the closing line and the write-in prompt. You have to hear a region's line through before moving to the next. This is also wired into Zone 1 and testable there at the Mirror Pool.",
    links: [{ label: 'Open Body Mapping', to: '/gains-demo/bodymap' }],
  },
  {
    key: 'guardian',
    n: 9,
    title: 'Message to Your Guardian',
    section: 'review-zone3pitch',
    blurb:
      "Spark narration added. Spark reads each step as it opens, and a Read to me button on the choice steps reads the options aloud one at a time. The 988 safety line plays through before you can continue. This is also wired into Zone 3 and testable there at the waystone.",
    links: [{ label: 'Open Message to Your Guardian', to: '/gains-demo/guardian' }],
  },
  {
    key: 'mindful',
    n: 10,
    title: 'Mindful Place',
    section: 'review-mindfulness',
    blurb:
      "Ready for final approval. Spark narrates each step, the sounds are one balanced soundscape (rain, thunder, frogs, crickets, and music), the breathing is guided by rings that expand and contract with Spark's count, the frog breathes along with you, and finishing earns the Oxygen Mask with the option to practice again to level it up. This is also testable in the full Zone 4.",
    links: [{ label: 'Open Mindful Place', to: '/gains-demo/mindful' }],
  },
  {
    key: 'ascent',
    n: 11,
    title: 'The Ascent',
    section: 'review-ascent',
    blurb:
      "The Zone 4 to 5 climb got the rework we talked about. The climber is bigger. The obstacles are now feelings that fall toward you. Gold feelings (hope, courage, curiosity, resilience, and more) you collect to refill your Second Wind. Red feelings (sadness, shame, guilt, anger, resentment, helplessness, hopelessness, regret) block your path. Tap one to fire your Focusing Lens. The cloud lightens, the feeling's name is revealed, and it shatters into gold you can gather. It's framed as protecting yourself rather than fighting. The climber is now the Traveler as she looks in Zone 4, mask on and Lantern at her hip, with a full climbing cycle.",
    links: [{ label: 'Play the Ascent', to: '/gains-demo/climb', play: true }],
  },
  {
    key: 'firstlight',
    n: 12,
    title: 'The First Light',
    section: 'review-firstlight',
    blurb:
      "A traversal, Zone 1 → Zone 2: the trail's lamps went out. You carry the first light and relight them one by one, leaving a lit path behind you for whoever comes next. Your own circle of light never grows -- what changes is how much of the trail is already lit behind you. Things that loomed in the dark turn out to be ordinary once the light reaches them (a leaning tree, a boulder, a signpost). Six lamps in, the strung lanterns at the crest catch in sequence and the Lantern Path opens.",
    links: [{ label: 'Play The First Light', to: '/gains-demo/firstlight', play: true }],
  },
]

// Draft 89: the Pre/Post test's own copy, now shown in a dedicated canon
// section on GainsDemoPage.jsx rather than a review card -- kept here so
// the dedicated pretest/posttest pages can still repeat the same blurb at
// their tops the way every other reviewed item does.
export const PREPOST_BLURB =
  "The measures, paginated the way they'll be administered, one page at a time with a Continue button. Pre-test: demographics, the event and time since, the Child Trauma Screen, therapy history, Beck Hopelessness, the readiness ruler, Implicit Theories of Emotion, and Trauma & Treatment Beliefs. Post-test: the pre+post instruments again plus the Program Feedback Scale. Look for item wording, order, and anything missing."

export function reviewCard(key) {
  return REVIEW_CARDS.find((c) => c.key === key) || null
}
