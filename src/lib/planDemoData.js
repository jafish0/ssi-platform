// Synthetic single-kid data for the Plan activity's /demo/sandbox preview
// (Draft 39 Part D). No real cross-activity persistence exists yet (flow
// integration is deferred per Draft 21), so the Plan reads these hardcoded
// outputs to render believable Screens 2–6.
//
// When real flow integration lands, this file is replaced by a
// `useKidSession()`-style hook that pulls each activity's real saved
// payload; the Plan component's props don't change.
//
// Skill ids (bs1/bs2/bs4) match the Belonging Skills Sort registry
// (`BEHAVIORS` in BelongingSkillsSort.jsx) so the export's per-skill
// columns line up. Ally ids match ALLY_TILES. The poem + letter are
// original text (the published-poet lock applies to the poem).

// The full belonging-promoting-behavior set — `text` + `definition` are
// VERBATIM from the BSS registry (`BEHAVIORS` in BelongingSkillsSort.jsx,
// 7 skills, bs1–bs7; field names match too, per Draft 49 B) so what the
// Plan surfaces visually reads as the same content the kid just sorted.
// Used by Plan v2.0's Screen 7 checklist ("Which belonging-promoting
// behaviors were you using?") and the not-tried-yet radar callout.
export const ALL_BELONGING_SKILLS = [
  {
    id: 'bs1',
    text: 'Pay close attention when someone is talking to you (without checking your phone or getting distracted)',
    definition:
      "Giving someone your full attention when they're speaking — eyes on them, no phone, no looking around.",
  },
  {
    id: 'bs2',
    text: 'Use words like "we," "us," or "our group" to make people feel included',
    definition:
      'Saying things that signal everyone belongs in the group — "we" instead of "you guys," "our team" instead of "the group."',
  },
  {
    id: 'bs3',
    text: 'Say thank you or tell others when they do something you appreciate',
    definition:
      'Telling someone you noticed and appreciated what they did, instead of just thinking it.',
  },
  {
    id: 'bs4',
    text: 'Help someone out when they need it',
    definition: 'Offering help when you see someone needs it, without waiting to be asked.',
  },
  {
    id: 'bs5',
    text: 'Invite others to spend time with you',
    definition:
      'Reaching out to bring someone into your plans or your day, instead of waiting for them to ask.',
  },
  {
    id: 'bs6',
    text: 'Include others in conversations and activities (like watching a movie, going for a walk, or playing a game)',
    definition:
      "Making space for others in what you're already doing — looping them into the conversation, the game, the show.",
  },
  {
    id: 'bs7',
    text: 'Talk through a disagreement with someone until you find an answer that works for everyone',
    definition:
      'Staying with a disagreement until you find something that works for everyone, instead of walking away or giving up.',
  },
]

export const PLAN_DEMO_DATA = {
  // The three skills below (bs1 Active Listening, bs2 Inclusive Language,
  // bs4 Helping Out) are the three skills Kai highlights in Part II,
  // Scene 1 of the psychoeducation video. They're used here as demo
  // synthetic content because cross-activity flow integration (real reads
  // from BSS's willing-to-try output) is still deferred per Draft 21.
  //
  // When flow integration lands, this hardcoded array is replaced by a
  // real read from the participant's BSS save payload — filtered to
  // willing_to_try, looked up in ALL_BELONGING_SKILLS for text/definition,
  // and paired with per-skill howExample values (all 7 will need one so
  // any subset can surface). The kid's actual sorting drives the content,
  // not this static trio. Kept as a fallback for when BSS hasn't been
  // completed in the session.
  //
  // `howExample` seeds the v2.0 "How could you demonstrate this skill?"
  // placeholder per skill.
  willingToTrySkills: [
    {
      id: 'bs1',
      text: 'Pay close attention when someone is talking to you (without checking your phone or getting distracted)',
      definition:
        "Giving someone your full attention when they're speaking — eyes on them, no phone, no looking around.",
      howExample: 'e.g., putting my phone down when my sister is telling me about her day',
    },
    {
      id: 'bs2',
      text: 'Use words like "we," "us," or "our group" to make people feel included',
      definition:
        'Saying things that signal everyone belongs in the group — "we" instead of "you guys," "our team" instead of "the group."',
      howExample: 'e.g., saying "we" and "us" when I\'m making plans with friends',
    },
    {
      id: 'bs4',
      text: 'Help someone out when they need it',
      definition: 'Offering help when you see someone needs it, without waiting to be asked.',
      howExample: 'e.g., offering to help before someone has to ask',
    },
  ],

  // From Self-Reflection → the "time I felt I belonged" text. Drives the
  // v2.0 Screen 7 inclusion reflection; if empty, that screen is skipped.
  inclusionText:
    'When my coach put me in the starting lineup my first game on the team.',

  // BSS skills the demo kid put in "not now" (or never placed) — feeds
  // the read-only "keep on your radar" reminder on the review screen.
  notTriedYetIds: ['bs6', 'bs7'],

  // From Getting Unstuck → selected appraisals (the picked-and-worked thoughts)
  pickedThoughts: [
    {
      original: 'I will never really feel like I belong.',
      tellYourself:
        "I don't feel like I belong right now, AND I won't always feel this way.",
      strategy: 'both_and',
    },
    {
      original: "I can't trust anyone.",
      tellYourself:
        'There are people I can trust, even just a little — and trust can grow.',
      strategy: 'challenge',
    },
  ],

  // From Allies / Safety Net → kept allies (post-Inspect) + Strengthen
  keptAllies: [
    { id: 'foster-mom', name: 'Foster Mom', types: ['practical', 'emotional'] },
    { id: 'coach', name: 'Coach Diaz', types: ['practical'] },
    { id: 'teacher', name: 'Mrs. Garcia', types: ['emotional'] },
    { id: 'best-friend', name: 'Alex', types: ['social'] },
    { id: 'sibling', name: 'Sam', types: ['social'] },
  ],
  strengthenCommitments: [
    { type: 'practical', text: "I'll ask Coach Diaz for help with my homework this week." },
    { type: 'emotional', text: "I'll text Mrs. Garcia when I'm having a rough day." },
    { type: 'social', text: "I'll invite Alex to study with me on Friday." },
  ],

  // From Letter to Another Youth
  letter:
    "Hey — I don't know you, but I know some of what you're carrying. Moving again. New faces who already have their groups. The way you learn not to unpack all the way. I used to think that meant something was wrong with me. It doesn't. You get to belong somewhere, even if it takes a few tries to find it. Keep the people who show up for you — and let yourself be one of those people for someone else. You're not behind. You're just getting started. — Someone who's been there",

  // From Who I Am Poem (the finished 10-line keepsake)
  poemLines: [
    'I am the kid who laughs too loud in quiet rooms.',
    'I am from a small town and a long line of movers.',
    'I fear that the next goodbye is already coming.',
    'I suffer when plans change and no one tells me why.',
    'I want a place where no one asks me to leave.',
    'I am the kid who laughs too loud in quiet rooms.',
    'I believe people can surprise you if you let them.',
    'I dream of a door with my name already on it.',
    'I am going somewhere that finally feels like mine.',
    'I am the kid who laughs too loud in quiet rooms.',
  ],
}
