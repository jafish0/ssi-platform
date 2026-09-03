// The seven review cards on /gains-demo (Draft 71) and the blurb each
// dedicated page repeats at its top. The blurbs are Josh's "what's new /
// what to look for" text, VERBATIM -- they replace the long team email, so
// don't reword them. `links` open the dedicated 9:16 pages in the same tab.

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
    key: 'videos',
    n: 2,
    title: 'Videos',
    section: 'review-videos',
    blurb:
      "All of the video feedback is in. Video 1 has the revised script (our minds and bodies react to keep us safe), the updated body map that matches the activity, and the 'you see something happen' wording. Video 2 lost the gray circle, the jittery bubble, and the busy animations in the middle of the screen. Video 3 no longer refers to 'these characters,' and it frames TF-CBT and EMDR as examples rather than the only options. Video 4 was re-rendered to take the narration text out. Video 5's glasses have stems. The narration text at the bottom of all the videos is gone; captions are a CC toggle in the player. Each video has its own comment box.",
    links: [{ label: 'Open the videos', to: '/gains-demo/videos' }],
  },
  {
    key: 'bodymap',
    n: 3,
    title: 'Body Mapping',
    section: 'review-bodymap',
    blurb:
      "The write-in prompt now reads 'Is there another area where you feel a trauma reaction in your body? If so, write it in the box below,' and the stomach sits a little lower.",
    links: [{ label: 'Open Body Mapping', to: '/gains-demo/bodymap' }],
  },
  {
    key: 'mindful',
    n: 4,
    title: 'Mindful Place',
    section: 'review-mindfulness',
    blurb:
      "Formerly Calm Place, and now finished. Spark narrates each step, the sounds are one balanced soundscape (rain, thunder, frogs, crickets, and music, so everything is audible), the breathing is guided by concentric rings that expand and contract with Spark's count, the frog is the new painterly one and breathes along with you, and finishing earns the Oxygen Mask with the option to practice again to level it up. The bug where 'done' sent you back to the beginning is fixed.",
    links: [{ label: 'Open Mindful Place', to: '/gains-demo/mindful' }],
  },
  {
    key: 'guardian',
    n: 5,
    title: 'Message to Your Guardian',
    section: 'review-zone3pitch',
    blurb:
      'The Wingsuit screen now makes clear that planning your message is what earns it, and it no longer suggests waiting for the perfect moment. The safety page explains what 988 is.',
    links: [{ label: 'Open Message to Your Guardian', to: '/gains-demo/guardian' }],
  },
  {
    key: 'ascent',
    n: 6,
    title: 'The Ascent',
    section: 'review-ascent',
    blurb:
      "The Zone 4 to 5 climb got the rework we talked about. The climber is bigger. The obstacles are now feelings that fall toward you. Gold feelings (hope, courage, curiosity, resilience, and more) you collect to refill your Second Wind. Red feelings (sadness, shame, guilt, anger, resentment, helplessness, hopelessness, regret) block your path. Tap one to fire your Focusing Lens. The cloud lightens, the feeling's name is revealed, and it shatters into gold you can gather. It's framed as protecting yourself rather than fighting.",
    links: [{ label: 'Play the Ascent', to: '/gains-demo/climb', play: true }],
  },
  {
    key: 'zone4',
    n: 7,
    title: 'Zone 4: The Bright Reaches — walkable zone',
    section: 'review-zone4',
    blurb:
      'The first walkable zone: the Bright Reaches as a place you move through. Tap the ground to walk. Find Spark, watch the video, follow Spark to the pond for the Mindful Place, earn and equip your Oxygen Mask, then head for the exit and climb toward Mount Hope. Spark redirects you if you try something too early. It all happens inside one phone-sized frame, the way it will in the real app. Prototype stage. Does it feel like a game to you?',
    links: [{ label: 'Play Zone 4', to: '/gains-demo/zone4', play: true }],
  },
]

export function reviewCard(key) {
  return REVIEW_CARDS.find((c) => c.key === key)
}
