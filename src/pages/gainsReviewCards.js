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
// together. Order is fixed: Pre/Post · Body Mapping · Guardian · Mindful
// Place · Ascent · The First Light · Zone 1 · Zone 3 · Zone 4 · Videos.

export const REVIEW_CARDS = [
  {
    key: 'prepost',
    n: 1,
    title: 'Pre/Post test',
    section: 'review-pretest',
    blurb:
      "The measures, paginated the way they'll be administered, one page at a time with a Continue button. Pre-test: demographics, the event and time since, the Child Trauma Screen, therapy history, Beck Hopelessness, the readiness ruler, Implicit Theories of Emotion, and Trauma & Treatment Beliefs. Post-test: the pre+post instruments again plus the Program Feedback Scale. Look for item wording, order, and anything missing.",
    links: [
      { label: 'Open the Pre-test', to: '/gains-demo/pretest' },
      { label: 'Open the Post-test', to: '/gains-demo/posttest' },
    ],
  },
  {
    key: 'bodymap',
    n: 2,
    title: 'Body Mapping',
    section: 'review-bodymap',
    blurb:
      "The write-in prompt now reads 'Is there another area where you feel a trauma reaction in your body? If so, write it in the box below,' the stomach sits a little lower, and the closing summary text is larger.",
    links: [{ label: 'Open Body Mapping', to: '/gains-demo/bodymap' }],
  },
  {
    key: 'guardian',
    n: 3,
    title: 'Message to Your Guardian',
    section: 'review-zone3pitch',
    blurb:
      "The Wingsuit screen makes clear that planning your message is what earns it and no longer suggests waiting for the perfect moment. The safety page explains what 988 is. Step 4 now reads 'Therapy can help me…' (the 'also' is gone).",
    links: [{ label: 'Open Message to Your Guardian', to: '/gains-demo/guardian' }],
  },
  {
    key: 'mindful',
    n: 4,
    title: 'Mindful Place',
    section: 'review-mindfulness',
    blurb:
      "Formerly Calm Place. Spark narrates each step, the sounds are one balanced soundscape (rain, thunder, frogs, crickets, and music), the breathing is guided by concentric rings that expand and contract with Spark's count, the frog is the new painterly one and breathes along with you, and finishing earns the Oxygen Mask with the option to practice again to level it up. The choice chips now sit in even rows.",
    links: [{ label: 'Open Mindful Place', to: '/gains-demo/mindful' }],
  },
  {
    key: 'ascent',
    n: 5,
    title: 'The Ascent',
    section: 'review-ascent',
    blurb:
      "The Zone 4 to 5 climb got the rework we talked about. The climber is bigger. The obstacles are now feelings that fall toward you. Gold feelings (hope, courage, curiosity, resilience, and more) you collect to refill your Second Wind. Red feelings (sadness, shame, guilt, anger, resentment, helplessness, hopelessness, regret) block your path. Tap one to fire your Focusing Lens. The cloud lightens, the feeling's name is revealed, and it shatters into gold you can gather. It's framed as protecting yourself rather than fighting.",
    links: [{ label: 'Play the Ascent', to: '/gains-demo/climb', play: true }],
  },
  {
    key: 'firstlight',
    n: 6,
    title: 'The First Light',
    section: 'review-firstlight',
    blurb:
      "A traversal, Zone 1 → Zone 2: the trail's lamps went out. You carry the first light and relight them one by one, leaving a lit path behind you for whoever comes next. Your own circle of light never grows -- what changes is how much of the trail is already lit behind you. Things that loomed in the dark turn out to be ordinary once the light reaches them (a leaning tree, a boulder, a signpost). Six lamps in, the strung lanterns at the crest catch in sequence and the Lantern Path opens.",
    links: [{ label: 'Play The First Light', to: '/gains-demo/firstlight', play: true }],
  },
  {
    key: 'zone1',
    n: 7,
    title: 'Zone 1: The Dark Abyss — walkable zone',
    section: 'review-zone1',
    blurb:
      "The opening of the game. You arrive in the dark, walk up to a distant light to meet Spark, and watch the welcome video. Then, on the other side of the passage: the video on what trauma is, Body Mapping at the Mirror Pool (now with Spark narrating), your first gear, the Lantern, and The First Light, a traversal where you carry that flame back up a dark trail, relighting its lamps one by one.",
    links: [{ label: 'Play Zone 1', to: '/gains-demo/zone1', play: true }],
  },
  {
    key: 'zone3',
    n: 8,
    title: 'Zone 3: The Mistfields — walkable zone',
    section: 'review-zone3',
    blurb:
      'The Mistfields as a place you move through. Find Spark, watch the video, follow Spark to the waystone to plan your message to your guardian, earn and equip your Wingsuit, then head for the broken bridge and fly across to the Bright Reaches. Same template as Zone 4, new world.',
    links: [{ label: 'Play Zone 3', to: '/gains-demo/zone3', play: true }],
  },
  {
    key: 'zone4',
    n: 9,
    title: 'Zone 4: The Bright Reaches — walkable zone',
    section: 'review-zone4',
    blurb:
      'The first walkable zone: the Bright Reaches as a place you move through. Tap the ground to walk. Find Spark, watch the video, follow Spark to the pond for the Mindful Place, earn and equip your Oxygen Mask, then head for the exit and climb toward Mount Hope. Spark redirects you if you try something too early. It all happens inside one phone-sized frame, the way it will in the real app. Prototype stage. Does it feel like a game to you?',
    links: [{ label: 'Play Zone 4', to: '/gains-demo/zone4', play: true }],
  },
  {
    key: 'videos',
    n: 10,
    title: 'Videos',
    section: 'review-videos',
    blurb:
      "All of the video feedback is in. Video 1 has the revised script (our minds and bodies react to keep us safe), the updated body map that matches the activity, and the 'you see something happen' wording. Video 2 lost the gray circle, the jittery bubble, and the busy animations in the middle of the screen. Video 3 no longer refers to 'these characters,' and it frames TF-CBT and EMDR as examples rather than the only options. Video 4 was re-rendered to take the narration text out. Video 5's glasses have stems. The narration text at the bottom of all the videos is gone; captions are a CC toggle in the player. Each video has its own comment box.",
    links: [{ label: 'Open the videos', to: '/gains-demo/videos' }],
  },
]

export function reviewCard(key) {
  return REVIEW_CARDS.find((c) => c.key === key) || null
}
