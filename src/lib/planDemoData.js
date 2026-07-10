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

// The full belonging-promoting-behavior set, mirroring the BSS registry
// (`BEHAVIORS` in BelongingSkillsSort.jsx — 7 skills, bs1–bs7). Used by
// Plan v2.0's Screen 7 checklist ("Which belonging-promoting behaviors
// were you using?") and the not-tried-yet radar callout on the review.
export const ALL_BELONGING_SKILLS = [
  { id: 'bs1', title: 'Active listening' },
  { id: 'bs2', title: 'Inclusive language' },
  { id: 'bs3', title: 'Expressing gratitude' },
  { id: 'bs4', title: 'Helping out' },
  { id: 'bs5', title: 'Inviting others' },
  { id: 'bs6', title: 'Including others in activities' },
  { id: 'bs7', title: 'Working through disagreements' },
]

export const PLAN_DEMO_DATA = {
  // From Belonging Skills Sort → willing_to_try. `howExample` seeds the
  // v2.0 "How could you demonstrate this skill?" placeholder per skill.
  willingToTrySkills: [
    {
      id: 'bs1',
      title: 'Active listening',
      definition:
        "Giving someone your full attention when they're talking — eyes on them, no phone.",
      howExample:
        'e.g., giving someone your full attention when they’re talking — eyes on them, no phone',
    },
    {
      id: 'bs2',
      title: 'Inclusive language',
      definition:
        'Using words like “we” and “us” so people feel like they belong in the group.',
      howExample: 'e.g., saying “we” and “us” when you’re making plans with the group',
    },
    {
      id: 'bs4',
      title: 'Helping out',
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
