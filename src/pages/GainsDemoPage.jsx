// GAINS Teens demo page at /gains-demo — the internal review surface for
// the GAINS for Teens SSI ("The Long Light"). Reorganized (Draft 12) to
// read like the actual GAME FLOW, top to bottom:
//   Zone Map (roadmap) → Playable Characters → Zone 1…5 (each: image,
//   characters, video/script, activity, gear, traversal) with "in
//   development" placeholders where pending.
// Draft 54 (2026-09-01): the Child Assent & Measures packet is a proposal
// under review, not adopted canon yet -- it now lives as the Pre-test/
// Post-test items at the top of "Ideas & Demos for Review" (see
// MeasurementFlow.jsx), not as its own section further down the page.
// Unlisted; shared by link. Feedback reuses the shared pipeline tagged
// program="gains-teens" + a section (see GAINS_FEEDBACK_SECTIONS).
//
// Art is served from the static pitch site at /long-light/ (absolute
// paths) so this page and the pitch share one copy of each asset. Video
// scripts are the verbatim psychoeducation copy.

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HardHat, Film, Play } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'
import FeedbackButton from '../components/FeedbackButton.jsx'
import BodyMapping from '../components/BodyMapping.jsx'
import MindfulnessCalmPlace from '../components/MindfulnessCalmPlace.jsx'
import ElevatorPitch from '../components/ElevatorPitch.jsx'
import ExpositionIntro from '../components/gains/ExpositionIntro.jsx'
import MeasurementFlow from '../components/gains/MeasurementFlow.jsx'
import GainsCard from '../components/gains/ds/Card.jsx'
import GainsBadge from '../components/gains/ds/Badge.jsx'
import GainsButton from '../components/gains/ds/Button.jsx'
// Shadowmend design-system tokens (Draft 49). Every variable is declared
// under `.gains-theme`, applied to this page's own content wrapper below --
// see the file header comment there. That scoping, not where the CSS is
// imported from, is what keeps Ready for Roots and the rest of the app
// unaffected: nothing outside a `.gains-theme` element can see these vars.
import '../styles/gains-tokens.css'

export const GAINS_FEEDBACK_SECTIONS = [
  // Ideas & Demos for Review — one thread per proposal
  { value: 'review-finalboss', label: 'Review: Final Boss summit script' },
  { value: 'review-pretest', label: 'Review: Pre-test measures flow' },
  { value: 'review-posttest', label: 'Review: Post-test measures flow' },
  // Draft 55 (2026-09-01): each video now gets its own comment box so
  // feedback maps per-video in the CSV export; review-videos stays as the
  // one "overall / general note" box for the group.
  { value: 'review-videos', label: 'Review: Videos — overall / general note' },
  { value: 'video-1', label: 'Review: Video 1 — What is Trauma' },
  { value: 'video-2', label: 'Review: Video 2 — The Four Reactions' },
  { value: 'video-3', label: 'Review: Video 3 — Getting the Best Therapy' },
  { value: 'video-4', label: 'Review: Video 4 — What Therapy Feels Like' },
  { value: 'video-5', label: 'Review: Video 5 — Growth Mindset' },
  // Retired as their proposals were adopted (labels are kept in
  // AdminFeedbackPage so existing rows still label correctly):
  //   review-rename     — the zone rename, accepted 2026-08-11, now canon
  //   review-exposition — adopted 2026-08-13, now the Exposition section
  //   review-arcades    — adopted 2026-08-13, now under Prototypes and In Development
  //   review-gear       — adopted 2026-08-13, now under Prototypes and In Development
  //   review-character  — adopted 2026-08-27 (Draft 51), now the Playable
  //                       Character section's four-stage strip
  //   review-spark-voice — decided 2026-08-27 (Draft 51): Option F: see the
  //                        Narrator card in Playable Character
  { value: 'review-bodymap', label: 'Review: Body Mapping activity' },
  { value: 'review-mindfulness', label: 'Review: Mindfulness Calm Place' },
  { value: 'review-zone3pitch', label: 'Review: Zone 3 Elevator Pitch' },
  // The official breakdown
  // assent-measures — superseded by review-pretest/review-posttest (Draft
  // 54, 2026-09-01): the packet moved back into the review section since
  // it's still a proposal, not adopted canon. Label kept so historical
  // feedback rows still read correctly.
  { value: 'assent-measures', label: 'Child Assent / Measures' },
  { value: 'exposition', label: 'Exposition' },
  { value: 'npcs', label: 'NPCs' },
  { value: 'zone-1', label: 'Zone 1' },
  { value: 'zone-2', label: 'Zone 2' },
  { value: 'zone-3', label: 'Zone 3' },
  { value: 'zone-4', label: 'Zone 4' },
  { value: 'zone-5', label: 'Zone 5' },
  { value: 'general', label: 'General Feedback' },
]

const ART = '/long-light/art'
const AUDIO = '/long-light/audio'

// Draft 50: shared style for the small uppercase section-eyebrow headings
// ("World and Development Map", "NPCs", etc.) that repeat throughout this
// page -- one definition instead of restating the same style object at
// each of the ~7 call sites.
const SECTION_LABEL_STYLE = { letterSpacing: 'var(--tracking-caps)', color: 'var(--text-warm)', fontFamily: 'var(--font-core)' }

// ---------- NPCs (Draft 20) ----------
// Spark's intro line is VERBATIM (all-ASCII source: straight apostrophes) —
// don't re-typeset it. The four symptom creatures have no voice lines yet.
const SPARK_INTRO_LINE =
  "Welcome to Shadowmend, my name is Spark. Everyone that comes here has experienced really scary and stressful things. They usually arrive with a darkness around them that can feel upsetting and heavy and also make it hard for others to really see or get to know them. It's my job to teach you more about trauma and ways to feel better. Together, we will move through each of the five levels; learning, playing games, and getting gear to help us reach Mount Hope, where that darkness around you will get lighter, helping everyone see the amazing person you are!"

const SYMPTOM_CREATURES = [
  { src: `${ART}/emberwick.webp`, name: 'Emberwick', tag: 'reactivity / hypervigilance' },
  { src: `${ART}/mirefly.webp`, name: 'Mirefly', tag: 'intrusion' },
  { src: `${ART}/hollowshell.webp`, name: 'Hollowshell', tag: 'avoidance' },
  { src: `${ART}/dimmet.webp`, name: 'Dimmet', tag: 'negative mood / thoughts' },
]

// ---------- Characters (for the per-zone "who's here" chips) ----------
const CHAR = {
  spark: { name: 'The Spark', role: 'narrator', src: `${ART}/narrator-spark.webp` },
  emberwick: { name: 'Emberwick', src: `${ART}/emberwick.webp` },
  mirefly: { name: 'Mirefly', src: `${ART}/mirefly.webp` },
  hollowshell: { name: 'Hollowshell', src: `${ART}/hollowshell.webp` },
  dimmet: { name: 'Dimmet', src: `${ART}/dimmet.webp` },
}

// ---------- Video scripts (verbatim) ----------
const V1 =
  'A trauma is any frightening, dangerous, or violent event that harms or threatens to harm your life or well-being (for example, physical abuse, a serious car accident, or even a natural disaster). A trauma can also be something that happens to someone you love or something you witness (for example, seeing parents physically hurt one another, or having someone close suddenly die). Our minds and bodies automatically react to trauma in multiple ways, and even after the trauma is over our bodies have difficulty relaxing.'

const V2 =
  'Experiencing trauma can cause lots of reactions, in addition to our body’s responses, and these are grouped into four main categories. Hypervigilance or reactivity: feeling more on edge or jumpy, on the lookout for danger — this can even make sleeping hard because your body and mind just won’t calm down. Intrusion: not being able to stop thinking about the trauma, or feeling like it’s happening all over again. Avoidance: trying hard not to think about it or staying away from reminders — it might feel okay at first, but pushing things down always causes more problems in the long term. And negative changes in mood and thoughts: more sadness, anger, or worry, and thoughts like “there’s no one I can trust” or “what happened was my fault.” Let’s look at some examples to better understand what these reactions look like.'

const V3 =
  'Even though it may not feel like it, these are all normal reactions to experiencing trauma — your brain and body’s way of trying to keep you safe. But here’s the most important thing: trauma is something that happened to you, but it doesn’t define who you are. There are healthy ways to recover from even the worst things that happen to us. None of these characters healed alone — they recovered with the help of a good support system. Trauma therapy is one part of a good support system that can help people recover from very difficult things.'

// Zone 3's second video — Holly's shortened revision (Draft 19), VERBATIM.
// Her source is all-ASCII: straight apostrophes and a plain "4-5" hyphen.
// Don't re-typeset it to curly quotes/en dashes.
const TIPS = `Research has found that teens of all races, ethnicities, and genders who receive trauma treatment see significant improvement in their PTSD, depression, and anxiety symptoms.

To participate in trauma therapy, find a trauma-informed therapist who provides trauma-focused cognitive behavior therapy or EMDR and will meet with you once a week for roughly 4-5 months. In therapy, your parents or caregivers will learn about trauma and how to help you at home, but they won't join you in every session and a trauma-informed therapist knows how to talk with caregivers without breaking your privacy.

But before beginning treatment, you can ask your therapist to discuss what information is private. Therapy is confidential, so no one else will know that you are in treatment or anything that goes on in your sessions. But a trauma-informed therapist should also advocate for your privacy in sessions. So, while your therapist will need to tell your caregiver if they're worried about your or someone else's safety, they can keep other information private.`

const GROWTH =
  'Your mindset is a collection of beliefs, attitudes, and thoughts that shape how you understand yourself and the world. Think about it like colored glasses – you put on a blue-tinted pair and all of a sudden, a yellow lemon looks green. Our mindset works like glasses; they can change the way something seems to us, but that doesn’t make it true – even if the lemon looks green, we know that it’s really yellow. We often consider two types of mindsets that people “wear”: fixed and growth mindsets. If you currently have on your fixed mindset, you might find yourself thinking that trauma therapy won’t help you because nothing can change how you feel or think because of what happened to you. This is tricky because if you have that thought, you probably won’t want to begin trauma therapy, or you won’t really commit to it, and then things really don’t change for you. But that’s not because your thought was true - it’s a result of the fixed mindset you’re wearing. When you choose to put on your growth mindset, you choose to recognize that you have the power to change your thoughts, behaviors, skills, and life. This growth mindset is important for wanting to begin and commit to trauma therapy and will help you get the most benefit from treatment.'

const WHAT_TO_EXPECT = `Trauma therapy — here’s the deal.

The first few sessions are about building trust, asking about what’s going on and what you actually want out of this — and yeah, you’ll dig into how your thoughts, feelings, and past stuff connect.

You’ll feel a mix of things. Relief, because someone’s actually listening without judging you. Tired, because processing heavy stuff takes energy. Uncomfortable sometimes — that’s normal, not a sign something is wrong; it means the process is working.

You set the pace — you don’t have to spill everything on day one. Just be honest as you go, and speak up if something’s not working.

Your therapist will teach you skills that are proven to actually work. No single skill fixes everything, but the more tools you have, the more ready you’ll be for whatever comes your way.

For example, here is a cool trick called “grounding” that can help your brain hit the pause button when you are upset.`

// ---------- Top Zone Map (the living roadmap) ----------
const ZONE_MAP_ROWS = [
  {
    zone: '1 · The Dark Abyss',
    scene: 'darkest; candle, beacon far above',
    video: 'Video 1 — what trauma is',
    activity: 'Body Mapping',
    gear: 'Lantern',
    goal: 'Understand trauma; normalize bodily responses.',
  },
  {
    zone: '2 · The Lantern Path',
    scene: 'brightening slopes; lanterns to relight',
    video: 'Video 2 — the four reactions',
    activity: 'Character Examples',
    gear: 'Focusing Lens (in development)',
    goal: 'Recognize and name common trauma reactions.',
  },
  {
    zone: '3 · The Mistfields',
    scene: 'above first clouds; light breaks through',
    video: 'Video 3 — these are normal; help works + Getting the best trauma therapy',
    activity: 'Message to Your Guardian',
    gear: 'A Wingsuit',
    goal: 'Normalize + instill hope; bridge to getting help.',
  },
  {
    zone: '4 · The Bright Reaches',
    scene: 'above the clouds; warm, open',
    video: 'What to Expect from Therapy — ends with the 3-3-3 rule',
    activity: 'Mindfulness: Calm Place (3-3-3)',
    gear: 'Oxygen Mask — helps you breathe',
    goal: 'Demystify therapy; teach grounding.',
  },
  {
    zone: '5 · The Threshold',
    scene: 'the Beacon; door opens into light',
    video: 'Part 2 (pending): shame/reluctance + Growth Mindset',
    activity: 'TBD (CTAC)',
    gear: 'Goggles (growth mindset) (in development)',
    goal: 'Address shame; commit; readiness.',
  },
]

// ---------- Ideas & Demos for Review (Draft 24, reordered Draft 51) ----------
// A staging area at the top of the page: proposals and previews the team
// comments on BEFORE they're folded into the official zone breakdown.

// Draft 51: the five zone psychoeducation videos, added to the top of the
// review section as their own group. Each Vimeo link is unlisted (a privacy
// hash, not a public video), so they're embedded via player.vimeo.com's own
// `?h=` hash-embed URL rather than the public vimeo.com/{id} page -- that's
// the standard, non-awkward way to embed an unlisted Vimeo video anywhere.
// Draft 55 (2026-09-01): re-rendered links for 1/2/3/5 (Video 4 unchanged),
// exported clean -- no baked-in captions or "Spark" label; real captions go
// on in Vimeo as text tracks. Each carries its own feedback `section` tag so
// a comment maps to a specific video in the CSV export instead of all five
// sharing one `review-videos` box.
const REVIEW_VIDEOS = [
  { title: 'Zone 1 — What is Trauma', id: '1223203599', h: 'a9c90c2fa2', section: 'video-1' },
  { title: 'Zone 2 — The Four Reactions', id: '1223210105', h: '315f412718', section: 'video-2' },
  { title: 'Zone 3 — Getting the Best Therapy', id: '1223207965', h: 'd0c77b8f23', section: 'video-3' },
  { title: 'Zone 4 — What Therapy Feels Like', id: '1222092263', h: 'bca4fdcea9', section: 'video-4' },
  { title: 'Zone 5 — Growth Mindset', id: '1223211325', h: 'b8579c9aa1', section: 'video-5' },
]

const REVIEW_ARCADES = [
  {
    title: 'Reaching the Lantern Path — a slower, revealing arcade',
    body: 'You hold the Lantern, which lights only a small circle; you feel your way out of the opening zone and the path unfolds as you go.',
  },
  {
    title: 'Clearing the darkness → the Mistfields',
    body: 'With the amplified light you drag to aim and release a light-bloom that sweeps a cone of fog clear, revealing the background; when the area is cleared the camera pans up above the cloud line and says "You made it to the Mistfields."',
  },
]

const REVIEW_GEAR_POINTS = [
  'Everything you earn is one growing toolkit, not scattered pickups. It starts as a simple Lantern (Spark’s gift). Each psychoed character teaches a skill and gives you a part; the parts combine the Lantern into the Focusing Lens. In the Mistfields it grows bird-of-light wings (a reskin of the existing bird traversal, with no mechanical change). At the summit, the fully-built kit lights the Beacon at the Summit of Mount Hope.',
  'Intent for comment: tools grow stronger the more they’re used (practice), and the real power is in combining them. That is the coping-skills-toolbox idea.',
]

// Holly's first-draft summit script (Draft 30). VERBATIM — every `text` value
// below is copied exactly from her draft, including its punctuation and
// smart quotes; don't reword it. Bracketed stage directions in her draft
// (e.g. "*Player puts on goggles*") become `direction` entries rendered in
// italics instead of literal asterisks; where two directions sat back to
// back on one line, they are kept as two separate entries rather than joined
// with punctuation of our own. The numbered options are their own type so
// they can render as a list instead of running into the surrounding prose.
const FINAL_BOSS_SCRIPT = [
  { type: 'direction', text: 'Growth mindset script ends, player has earned the night vision goggles' },
  { type: 'spark', text: 'Congratulations, you’re ready to climb the final summit!' },
  { type: 'direction', text: 'steps onto staircase, lanterns go out on the staircase or everything just goes dark. Player can’t move forwards.' },
  { type: 'spark', text: '“Oh, this happens sometimes when you feel hopeful about trauma therapy, but you’re also not sure whether it’s worth trying because you worry it may not help. Let’s revisit the gear you’ve earned to see if we can overcome these mixed feelings. First, you need to put on your growth mindset goggles to see more clearly.”' },
  { type: 'direction', text: 'Player puts on goggles' },
  { type: 'direction', text: 'Vision returns and two signposts (or floating bubbles or something) are now visible on the staircase:' },
  { type: 'choices', items: [
    'I have the power to change my thoughts and feelings, and therapy can help me learn how to do this',
    'Research shows that trauma therapy is very likely to help me feel better',
  ] },
  { type: 'spark', text: '“Can you see more clearly now? Select the message that you want to carry with you when you need a reminder”' },
  { type: 'direction', text: 'Player chooses message (saved for action plan/summary at the end)' },
  { type: 'spark', text: 'Great job! Let’s keep climbing!' },
  { type: 'direction', text: 'Regular game lighting returns and player removes goggles and continues up the stairs' },
  { type: 'direction', text: 'Now, dark fog obscures the path and the player cannot advance' },
  { type: 'spark', text: 'I see! It can be hard to start something like trauma therapy if you’re remembering bad experiences you’ve had in therapy in the past, or if you’ve heard others talk about negative experiences. Let’s try using your wingsuit to get over this fog.' },
  { type: 'direction', text: 'Player puts on wingsuit and flies. In the fog, comes across a character who can provide a positive testimonial from a teen. This clears the fog and allows the player to land on the cleared staircase' },
  { type: 'spark', text: 'Fantastic! It’s important to remember that just because you or someone you know has had a bad experience in the past, that doesn’t mean that others haven’t had good experiences or that you can’t have good experiences in the future! You’re almost there now, keep going!' },
  { type: 'direction', text: 'Now, the light from the tower is close but it’s blinding to the player, the player can no longer see the Spark, and the player cannot proceed' },
  { type: 'spark', text: 'The light must feel very bright to you! When you experience trauma, it’s normal to feel like you’re the only one going through it and to feel alone or like you’re caught in a spotlight. In reality, before turning 18, three out of every four kids will experience at least one potentially traumatic event. Trauma makes you feel alone, but the truth is: you are not alone. Pull out your lantern to see the truth.' },
  { type: 'direction', text: 'Player pulls out lantern which allows them to see that the bright light ahead is made up of characters holding their own lanterns. One or two characters come to join the player' },
  { type: 'spark', text: 'Now you can see that the light was bright because so many other people have walked this same path before you. Your new friends will join you as you make the final steps of this journey.' },
]

const REVIEW_GEAR_THEME =
  'Every activity earns a tool. The tools combine and grow. A lantern becomes a Focusing Lens, and the Lens grows wings, so you reach the summit carrying everything you’ve learned.'

// ---------- Playable character ----------
// One protagonist (the team dropped the choose-your-character set), shown as
// the four-stage progression: the same traveler with their darkness lightening
// as they climb — the Option-2 promise made visible on the character. All four
// plates are 9:16 so they line up as an even strip. Zone labels/captions are
// placeholder copy from Draft 23. The old avatar files stay in the repo.
const TRAVELER_STAGES = [
  {
    // ?v=2: skin-tone-matched final art (Draft 42), same filename as the
    // pre-final version — cache-bust so browsers/CDN don't keep serving the
    // old bytes now that the file's been updated in place.
    src: `${ART}/traveler-stage1-hallow.webp?v=2`,
    name: 'Zone 1 — The Dark Abyss',
    blurb: 'Arrives wrapped in shadow.',
  },
  {
    src: `${ART}/avatar-human-traveler.webp`,
    name: 'Zone 2',
    blurb: 'The journey begins.',
  },
  {
    src: `${ART}/traveler-stage3.webp`,
    name: 'Zones 3–4',
    blurb: 'The light grows.',
  },
  {
    src: `${ART}/traveler-stage4-bright.webp`,
    name: 'Zone 5 · Mount Hope',
    blurb: 'Fully seen.',
  },
]

// ---------- The five zone sections (the game flow) ----------
const ZONES = [
  {
    n: 'Zone 1',
    name: 'The Dark Abyss',
    scenery: 'The dark valley floor. A single candle in hand, and the beacon far above.',
    image: '/long-light/zone1.webp',
    characters: ['spark'],
    videos: [{ title: 'Video 1 — What trauma is', duration: '25 sec', script: V1 }],
    activity: {
      title: 'Body Mapping',
      desc: (
        <>
          <p>
            <strong>Part 1:</strong> tap to reveal how five parts of the body
            react during and after trauma. <strong>Lungs</strong> (breathe
            faster to take in more oxygen), <strong>Head</strong> (thoughts
            race, hard to think clearly, dizzy or detached/unreal),{' '}
            <strong>Heart</strong> (beats faster and harder),{' '}
            <strong>Stomach</strong> (upset or nauseous as blood moves to the
            arms and legs), <strong>Body</strong> (heats up and sweats, muscles
            tense, shaky or tingly). These responses can linger after the
            danger passes or resurface when something reminds you of it.
          </p>
          <p className="mt-2">
            <strong>Part 2:</strong> tap each reaction you’ve felt recently.
          </p>
        </>
      ),
    },
    gear: 'Lantern.',
    traversal: { text: 'Traversal to Zone 2.', pending: true },
    goal: 'Understand what trauma is; normalize the body’s responses.',
  },
  {
    n: 'Zone 2',
    name: 'The Lantern Path',
    scenery: 'Brightening slopes, and a winding trail of lanterns to relight.',
    image: '/long-light/zone2.webp',
    characters: ['spark', 'emberwick', 'mirefly', 'hollowshell', 'dimmet'],
    videos: [{ title: 'Video 2 — The four reactions', duration: '45 sec', note: 'Production note: show each category label on screen as it’s described.', script: V2 }],
    activity: {
      title: 'Character Examples',
      desc: (
        <>
          Meet the four messenger creatures:{' '}
          <strong>Emberwick, Mirefly, Hollowshell, Dimmet</strong>. For
          each, hear a short script and choose which of the four symptom types it
          shows (reactivity, intrusion, avoidance, negative mood/thoughts). Ends
          with an animation of all four creatures’ symptoms easing.
        </>
      ),
    },
    gear: 'Focusing Lens (in development).',
    traversal: { text: 'Traversal to Zone 3.', pending: true },
    goal: 'Recognize and name common trauma reactions.',
  },
  {
    n: 'Zone 3',
    name: 'The Mistfields',
    scenery: 'Above the first clouds, where light finally breaks through the mist.',
    image: '/long-light/zone3.webp',
    characters: ['spark'],
    videos: [
      { title: 'Video 3 — These are normal; help works', duration: '25 sec', script: V3 },
      { title: 'Getting the best trauma therapy', duration: '~60 sec (est.)', script: TIPS },
    ],
    activity: {
      title: 'Message to Your Guardian',
      desc: (
        <>
          Holly’s and Dr. Sprang’s message-builder, step by step: greeting,
          describe the situation, normalize it, offer to make it easy, make
          your request, then how it’ll help. The six steps assemble into
          one message to a guardian, with a “Write your own” option at
          every step. Saved to the action plan; earns the Wingsuit.
        </>
      ),
    },
    gear: 'A Wingsuit — lets you take flight.',
    traversal: {
      text: 'The bird flight, “the power of connections.” Gather connections to climb from the Mistfields up to the Bright Reaches.',
      playable: true,
    },
    goal: 'Normalize and instill hope; bridge toward getting help.',
  },
  {
    n: 'Zone 4',
    name: 'The Bright Reaches',
    scenery: 'Over the cloudline into open, warm, sunlit highland.',
    image: '/long-light/zone4.webp',
    characters: ['spark'],
    videos: [
      { title: 'What to Expect from Therapy', duration: '47 sec', script: WHAT_TO_EXPECT },
    ],
    activity: {
      title: 'Mindfulness: Calm Place (3-3-3)',
      desc: (
        <>
          Spark leads a calm-place visualization that doubles as the 3-3-3
          technique: pick three things you can see, then three things you
          can hear, then follow a guided box-breath with Spark. Earns the
          Oxygen Mask, with a chance to practice again and upgrade it.
        </>
      ),
    },
    gear: 'Oxygen Mask — helps you breathe.',
    traversal: {
      text: 'The Ascent, a one-thumb climb through tree, mountain, and crystal spire up to the Beacon. Orbs refill your Second Wind; as it runs low your own darkness closes in from the edges, and each orb pushes it back.',
      playable: true,
      playHref: '/gains-demo/climb',
      playLabel: 'Play the climb prototype',
    },
    goal: 'Demystify therapy; reduce fear of the unknown; teach grounding/breathing.',
  },
  {
    n: 'Zone 5',
    name: 'The Threshold',
    scenery: 'The summit and the Beacon. The door that opens into light.',
    image: '/long-light/zone5.webp',
    characters: ['spark'],
    videos: [
      {
        title: 'Part 2 — shame / reluctance to reach out',
        duration: 'pending',
        pending: true,
        pendingNote: 'Pending.',
      },
      { title: 'Growth Mindset — Choosing your mindset', duration: '~55 sec', script: GROWTH },
    ],
    activity: { title: 'Activity', pending: true, desc: 'To be designed with CTAC.' },
    // Draft 45: a short synopsis of the adopted Final Boss summit script
    // (FINAL_BOSS_SCRIPT, in the In Development section) — this is the
    // encounter that follows the Part 2 growth-mindset activity above,
    // ending in the Arrival below. Our own summary, not Holly's verbatim
    // script, so it follows the standing no-em-dash style rule.
    synopsis: {
      title: 'The Final Ascent',
      desc: (
        <>
          Three barriers block the last climb, each a mixed feeling about
          starting therapy, each cleared with a tool you’ve earned.
          Darkness (mixed feelings) → the growth-mindset goggles reveal a
          message to carry. Fog (past bad experiences) → the wingsuit
          carries you to a teen’s positive testimonial. A blinding light
          (feeling alone) → your lantern shows the light is really many
          others holding their own lanterns. You’re not alone. Then you
          light the Beacon at the summit of Mount Hope.
        </>
      ),
    },
    gear: 'Goggles (growth mindset) (in development).',
    traversal: { text: 'Arrival at the Beacon. The journey’s end.', end: true },
    goal: 'Address shame; end on readiness to commit and go.',
  },
]

export default function GainsDemoPage() {
  useEffect(() => {
    const prev = document.title
    document.title = 'GAINS for Teens — The Long Light · Team Demo'
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <DemoPageLayout
      homeTo="/gains-demo"
      homeLabel="GAINS for Teens · Demo"
      footerPath="/gains-demo"
      feedbackProgram="gains-teens"
      feedbackSections={GAINS_FEEDBACK_SECTIONS}
      feedbackDefaultSection="general"
    >
      {/* Draft 50: the `.gains-theme` token scope now wraps the WHOLE page
          body (was just the Exposition card under Draft 49), per the
          draft's step 1. This is safe broadly -- gains-tokens.css declares
          only custom properties (no bare element-selector rules), so
          nothing changes for a section that doesn't explicitly reference a
          `var(--...)`. DemoPageLayout's own chrome (header/banner/footer)
          is outside this wrapper (it's shared with Ready for Roots) and
          stays on its own teal theme regardless. The intro blurb just below
          is inside the scope but not explicitly restyled -- Draft 50's
          section list starts at "Ideas & Demos for Review"; this is meta
          commentary about the review page itself, not part of the in-world
          experience. */}
      <div className="gains-theme">
      {/* Intro */}
      <section className="mb-6">
        <h1 className="text-[28px] font-bold text-slate-800 mb-2">
          GAINS for Teens — Shadowmend / Long Light
        </h1>
        <p className="text-[14px] text-slate-600 leading-relaxed max-w-[760px]">
          An internal walkthrough of the intervention, laid out the way it
          plays: the roadmap first, then the characters you can be, then each
          zone of the climb: video, activity, gear, and the arcade flight to
          the next zone. Use <strong>Give feedback</strong> (top right) and pick
          the section your comment is about.
        </p>
        <p className="text-[13px] text-slate-500 mt-2">
          The scroll-through concept pitch lives at{' '}
          <a href="/long-light/" target="_blank" rel="noreferrer" className="text-ctac-teal-700 hover:text-ctac-teal-900 underline">
            /long-light/
          </a>
          .
        </p>
      </section>

      {/* Draft 50: everything below is one dark "world" panel -- the
          Shadowmend frosted-glass Card treatment (rgba cream at low
          opacity, backdrop-blur) only reads correctly over a twilight
          backdrop, not the page's light teal. This is the one place the
          restyle reaches outside an individual section: a shared backdrop
          so every card below sits on the same surface instead of floating
          on mismatched ground. */}
      <div className="rounded-[28px] p-4 sm:p-6" style={{ background: 'var(--sky-abyss)' }}>

      {/* Ideas & Demos for Review — staging area above the official
          breakdown. Each item carries its own comment thread. */}
      <section className="mb-12">
        <div className="rounded-[28px] overflow-hidden" style={{ border: '1px solid var(--border-warm)' }}>
          <div className="px-5 py-2" style={{ background: 'var(--action-primary)' }}>
            <span
              className="text-[12px] font-bold uppercase tracking-wide"
              style={{ letterSpacing: 'var(--tracking-caps)', color: 'var(--text-on-warm)', fontFamily: 'var(--font-core)' }}
            >
              Proposals — comment before we make them official
            </span>
          </div>
          <div className="p-5" style={{ background: 'var(--surface-card)', backdropFilter: 'var(--blur-panel)' }}>
            <h2 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'var(--font-core)', color: 'var(--text-bright)' }}>
              Ideas &amp; Demos for Review
            </h2>
            <p className="text-[14px] italic leading-relaxed mb-5 max-w-[720px]" style={{ color: 'var(--text-muted)' }}>
              These are proposals and previews under discussion. Comment on any
              item below before we fold it into the official zones.
            </p>

            <div className="space-y-4">
              {/* Adopted and moved out of this section: the Exposition (now
                  its own section under The climb), the arcade ideas and the
                  gear toolbox (both now under Prototypes and In Development),
                  the Final Boss summit script (now in the new In Development
                  section below), the character-progression strip (now the
                  Playable Character section) and Spark's voice picker (now
                  decided -- see the Narrator card in Playable Character). */}

              {/* 1 — the measurement packet's Pre-test flow (Draft 54). Draft
                  53's flat scroll is now paginated one instrument per page,
                  inside the same mobile phone frame as the playable
                  activities below, matching how it will actually be
                  administered. Nothing is stored or scored. */}
              <ReviewItem n={1} title="Pre-test: measures flow (playable)" section="review-pretest">
                <p className="mb-3">
                  The measurement packet (Demographics through Trauma &amp;
                  Treatment Beliefs), paginated one instrument per page with a
                  progress indicator and a Continue button. Every item is
                  transcribed verbatim from Stephanie&apos;s measures doc.
                  Review-only — nothing is saved.
                </p>
                <div className="mb-3">
                  <Pill icon={HardHat}>Assent flow not built yet</Pill>
                </div>
                <div className="-mx-4 sm:mx-auto sm:w-full sm:max-w-[360px]">
                  <div
                    className="relative w-full overflow-hidden rounded-3xl"
                    style={{ aspectRatio: '360 / 780', minHeight: '780px', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-lg)' }}
                  >
                    <MeasurementFlow flow="pre" />
                  </div>
                </div>
              </ReviewItem>

              {/* 2 — the same instruments administered again post-program,
                  plus the Post-only Program Feedback Scale. */}
              <ReviewItem n={2} title="Post-test: measures flow (playable)" section="review-posttest">
                <p className="mb-3">
                  The Pre+Post instruments again, plus the Program Feedback
                  Scale at the end. Same paginated flow as the Pre-test above.
                </p>
                <div className="-mx-4 sm:mx-auto sm:w-full sm:max-w-[360px]">
                  <div
                    className="relative w-full overflow-hidden rounded-3xl"
                    style={{ aspectRatio: '360 / 780', minHeight: '780px', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-lg)' }}
                  >
                    <MeasurementFlow flow="post" />
                  </div>
                </div>
              </ReviewItem>

              {/* 3 — the five zone psychoeducation videos (Draft 51) */}
              <ReviewItem n={3} title="Videos" section="review-videos">
                <p className="mb-3">
                  The five zone psychoeducation videos, one per zone. Each has
                  its own comment box below it; use the box at the bottom of
                  this card for anything about the videos as a group.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {REVIEW_VIDEOS.map((v) => (
                    <ReviewVideo key={v.id} {...v} />
                  ))}
                </div>
              </ReviewItem>

              {/* 4 — Body Mapping activity (playable) */}
              <ReviewItem
                n={4}
                title="Body Mapping activity (playable)"
                section="review-bodymap"
              >
                <p className="mb-3">
                  Activity 1, built from Stephanie&apos;s blueprint. Part 1 reveals
                  how five parts of the body react during and after a trauma.
                  Part 2 asks which of those reactions you&apos;ve felt recently.
                  No scoring, nothing to get wrong. Try it here in the phone
                  frame.
                </p>
                <p
                  className="mb-3 rounded-2xl px-3.5 py-2.5 text-[13px]"
                  style={{ background: 'rgba(253,230,138,.10)', border: '1px solid var(--border-warm)' }}
                >
                  <strong className="font-semibold" style={{ color: 'var(--text-warm)' }}>Reading it for now.</strong>{' '}
                  Once we settle on Spark&apos;s voice (item 2 above), we will
                  add audio narration so each of these lines is read aloud
                  instead.
                </p>
                {/* Phone frame. Nested inside two padded cards, a strict 9:16
                    box on a 375px screen would only be ~455px tall, shorter
                    than any real phone, which squeezed the figure out. It is
                    also narrower than a real phone, so copy wraps to more lines
                    here than it will in the app. 360x780 is a ratio of 2.17,
                    which is an iPhone 15 Pro (393x852) rather than the older
                    9:16, and every pixel of the extra height goes to the figure
                    since everything else in the activity is a fixed size. */}
                {/* -mx-4 on phones claws back the review card's own padding so
                    the frame isn't squeezed to ~257px, well under a real phone,
                    which made every line of copy wrap taller than it will in
                    the app. Back to normal from sm: up, where there is room. */}
                <div className="-mx-4 sm:mx-auto sm:w-full sm:max-w-[360px]">
                  <div
                    className="relative w-full overflow-hidden rounded-3xl"
                    style={{ aspectRatio: '360 / 780', minHeight: '780px', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-lg)' }}
                  >
                    <BodyMapping />
                  </div>
                </div>
              </ReviewItem>

              {/* 5 — Mindfulness "Calm Place" activity (playable) */}
              <ReviewItem
                n={5}
                title="Mindfulness: Calm Place (playable)"
                section="review-mindfulness"
              >
                <p className="mb-3">
                  A Zone 4 grounding activity: Spark leads a calm-place
                  visualization that doubles as the 3-3-3 technique. Pick
                  three things you can see, then three things you can hear,
                  then follow a guided box-breath with Spark. Earns the
                  Oxygen Mask for the climb ahead, with a chance to practice
                  again and upgrade it. Has sound (tap Begin to start it) and
                  works best with headphones or the volume up.
                </p>
                <div className="-mx-4 sm:mx-auto sm:w-full sm:max-w-[360px]">
                  <div
                    className="relative w-full overflow-hidden rounded-3xl"
                    style={{ aspectRatio: '360 / 780', minHeight: '780px', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-lg)' }}
                  >
                    <MindfulnessCalmPlace />
                  </div>
                </div>
              </ReviewItem>

              {/* 6 — Zone 3 "Elevator Pitch" message-builder (playable) */}
              <ReviewItem
                n={6}
                title="Zone 3: Message to Your Guardian (playable)"
                section="review-zone3pitch"
              >
                <p className="mb-3">
                  Holly&apos;s end-of-Zone-3 activity: the teen builds a short
                  message asking a guardian for trauma therapy, one step at a
                  time (greeting, situation, request, how it&apos;ll help),
                  then sends it and earns the Wingsuit to cross the bridge.
                  No-fail; every pick can be changed before sending.
                </p>
                <div className="-mx-4 sm:mx-auto sm:w-full sm:max-w-[360px]">
                  <div
                    className="relative w-full overflow-hidden rounded-3xl"
                    style={{ aspectRatio: '360 / 780', minHeight: '780px', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-lg)' }}
                  >
                    <ElevatorPitch />
                  </div>
                </div>
              </ReviewItem>
            </div>
          </div>
        </div>
      </section>

      {/* A. World & Development Map — the living roadmap. Moved up (Draft 44)
          to sit directly after the review section, ahead of In Development,
          so the roadmap is the first thing after "what's up for discussion"
          rather than being buried below it. */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
          <h2 className="text-[14px] font-semibold uppercase" style={SECTION_LABEL_STYLE}>
            World and Development Map
          </h2>
          <span className="text-[12px] italic" style={{ color: 'var(--text-faint)' }}>updated as we go</span>
        </div>
        <div className="rounded-[24px] p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)', boxShadow: 'var(--shadow-md)' }}>
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="lg:w-[220px] flex-shrink-0 mx-auto lg:mx-0 w-[180px]">
              <img
                src={`${ART}/map-and-world.webp`}
                alt="The world of The Long Light — the climb from the dark valley to the Beacon"
                loading="lazy"
                className="w-full rounded-2xl"
                style={{ boxShadow: 'var(--shadow-md)' }}
              />
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full min-w-[720px] text-[13px] leading-relaxed border-collapse">
                <thead>
                  <tr className="text-left text-[11px] uppercase" style={{ letterSpacing: 'var(--tracking-wide)', color: 'var(--text-faint)' }}>
                    <th className="px-3 py-2 align-bottom" style={{ borderBottom: '2px solid var(--border-strong)' }}>Zone &amp; scenery</th>
                    <th className="px-3 py-2 align-bottom" style={{ borderBottom: '2px solid var(--border-strong)' }}>Video</th>
                    <th className="px-3 py-2 align-bottom" style={{ borderBottom: '2px solid var(--border-strong)' }}>Activity</th>
                    <th className="px-3 py-2 align-bottom" style={{ borderBottom: '2px solid var(--border-strong)' }}>Gear</th>
                    <th className="px-3 py-2 align-bottom" style={{ borderBottom: '2px solid var(--border-strong)' }}>Clinical goal</th>
                  </tr>
                </thead>
                <tbody>
                  {ZONE_MAP_ROWS.map((r) => (
                    <tr key={r.zone} className="align-top">
                      <td className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        <span className="font-semibold whitespace-nowrap" style={{ color: 'var(--text-bright)' }}>{r.zone}</span>
                        <span className="block text-[12px]" style={{ color: 'var(--text-faint)' }}>{r.scene}</span>
                      </td>
                      <td className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-body)' }}>{r.video}</td>
                      <td className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-body)' }}>{r.activity}</td>
                      <td className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-body)' }}>{r.gear}</td>
                      <td className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-body)' }}>{r.goal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* In Development — the pipeline stage between "under review" and "the
          official zones." Items here have been adopted by the team (no
          longer soliciting comment) but aren't built yet. Review → World &
          Development Map → In Development → the official zones/canon below. */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase mb-2" style={SECTION_LABEL_STYLE}>
          In Development
        </h2>
        <p className="text-[13px] italic mb-4 max-w-[760px]" style={{ color: 'var(--text-muted)' }}>
          Adopted by the team and moving toward being built, but not part of
          the official breakdown yet.
        </p>
        <div
          className="rounded-[24px] p-5"
          style={{ background: 'var(--surface-card)', border: '1px dashed var(--border-strong)', backdropFilter: 'var(--blur-panel)' }}
        >
          <div className="mb-3">
            <Pill icon={HardHat}>In development</Pill>
          </div>
          <h3 className="text-[15px] font-bold mb-2" style={{ fontFamily: 'var(--font-core)', color: 'var(--text-bright)' }}>
            Final Boss: the summit script
          </h3>
          <p className="mb-3 italic text-[14px]" style={{ color: 'var(--text-muted)' }}>
            Holly’s first-draft script for the final summit: the last climb
            to the Beacon, where the gear you’ve earned helps you move past
            mixed feelings about starting therapy. Adopted; the actual
            summit sequence isn’t built yet.
          </p>
          <div className="space-y-2 text-[14px] leading-relaxed" style={{ color: 'var(--text-body)' }}>
            {FINAL_BOSS_SCRIPT.map((line, i) => {
              if (line.type === 'direction') {
                return (
                  <p key={i} className="italic" style={{ color: 'var(--text-faint)' }}>
                    {line.text}
                  </p>
                )
              }
              if (line.type === 'choices') {
                return (
                  <ol key={i} className="list-decimal pl-5 space-y-1">
                    {line.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ol>
                )
              }
              return (
                <p key={i}>
                  <span className="font-semibold" style={{ color: 'var(--text-warm)' }}>Spark:</span>{' '}
                  {line.text}
                </p>
              )
            })}
          </div>
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
            <FeedbackButton
              program="gains-teens"
              sections={GAINS_FEEDBACK_SECTIONS}
              defaultSection="review-finalboss"
              label="Comment on this"
              subtle
            />
          </div>
        </div>
      </section>

      {/* C. Playable Character (single protagonist). Draft 51: the four-stage
          progression strip moved here from Ideas & Demos for Review now that
          the team's adopted it (it's no longer a proposal), replacing the
          single generic Traveler card that stood in for it. Spark, labeled
          Narrator with the team's adopted voice (Option F), lives in this
          same section too -- this is the "who you play as / who guides you"
          area, not just the playable character alone. */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase mb-2" style={SECTION_LABEL_STYLE}>
          Playable Character
        </h2>
        <p className="text-[13px] italic mb-4 max-w-[760px]" style={{ color: 'var(--text-muted)' }}>
          One traveler, the whole way up. The darkness they arrive with lightens
          as they climb, until everyone can see the person they’ve always been.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[680px]">
          {TRAVELER_STAGES.map((c) => (
            <ArtCard key={c.name} {...c} uniform />
          ))}
        </div>
        <p className="text-[12px] italic mt-3 max-w-[680px]" style={{ color: 'var(--text-faint)' }}>
          These stage images will be regenerated with an inner light — a glow
          in the chest that grows brighter across the stages.
        </p>

        <h3
          className="text-[12px] font-semibold uppercase mt-6 mb-2"
          style={{ letterSpacing: 'var(--tracking-wide)', color: 'var(--text-faint)', fontFamily: 'var(--font-core)' }}
        >
          Narrator
        </h3>
        <div className="max-w-[220px]">
          <NarratorCard />
        </div>
      </section>

      {/* C2. NPCs — the four symptom creatures. (Spark's card sits in the
          review section at the top while his voice model is under review.) */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase mb-2" style={SECTION_LABEL_STYLE}>
          NPCs
        </h2>
        <p className="text-[13px] italic mb-4 max-w-[760px]" style={{ color: 'var(--text-muted)' }}>
          The characters you meet along the way. Voice lines to come.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-[760px]">
          {SYMPTOM_CREATURES.map((c) => (
            <ArtCard key={c.name} {...c} />
          ))}
        </div>
      </section>

      {/* D. The game flow — Exposition → Zone 1 → Zone 5 */}
      <section className="mb-4">
        <h2 className="text-[14px] font-semibold uppercase" style={SECTION_LABEL_STYLE}>
          The climb
        </h2>
      </section>

      {/* Exposition — the opening that sets up the world. Stephanie's Option-2
          text, adopted by the team (2026-08-13). Restyled to the Shadowmend
          design system as Draft 49's proof of concept (2026-08-27): the
          `.gains-theme` wrapper is this component's only styling
          dependency, scoped to just this card per the draft (other GAINS
          screens below stay on the existing amber/slate look until we roll
          the Shadowmend look outward). SPARK_INTRO_LINE is still VERBATIM
          and still lives above as the single source — this only restyles
          its presentation. Flow into a real Zone 1 isn't wired yet, hence
          the pill. */}
      <section className="mb-8">
        <h3 className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-core)', color: 'var(--text-bright)' }}>Exposition</h3>
        <p className="text-[13px] mb-3" style={{ color: 'var(--text-muted)' }}>
          The opening that sets up the world, before Zone 1. Restyled to the
          Shadowmend design system (Draft 49) as the proof of concept —
          flow into Zone 1 is still in development.
        </p>
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Pill icon={HardHat}>In development</Pill>
          <span className="text-[12px] italic" style={{ color: 'var(--text-faint)' }}>
            Shadowmend styling adopted, flow to Zone 1 pending
          </span>
        </div>
        <div className="-mx-4 sm:mx-0 sm:w-full sm:max-w-[360px]">
          <div
            className="relative w-full overflow-hidden rounded-3xl"
            style={{ aspectRatio: '360 / 780', minHeight: '780px', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-lg)' }}
          >
            <ExpositionIntro line={SPARK_INTRO_LINE} />
          </div>
        </div>
      </section>

      {ZONES.map((z) => (
        <ZoneSection key={z.n} zone={z} />
      ))}

      {/* F. Prototypes and In Development — the playable traversals, plus the
          proposals the team adopted on 2026-08-13 (arcade ideas, gear toolbox)
          which moved down here out of Ideas & Demos for Review. */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase mb-2" style={SECTION_LABEL_STYLE}>
          Prototypes and In Development
        </h2>
        <p className="text-[13px] italic mb-4 max-w-[760px]" style={{ color: 'var(--text-muted)' }}>
          Playable traversals, both built on the same game engine. Both of these
          traversal games will be fully developed. Below them are the pieces the
          team has adopted and that are now being built out.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[760px]">
          <PrototypeCard
            img="/gains/traversal/ravine-bg.webp"
            title="The Flight — Zone 3 → 4"
            blurb="One-thumb bird flight. Gather 50 connections to reach the light."
            href="/gains-demo/traversal"
          />
          <PrototypeCard
            img="/gains/climb/stage-spire.webp"
            title="The Ascent — Zone 4 → 5"
            blurb="One-thumb climb through tree, mountain, and spire. Orbs refill your Second Wind; low air lets your darkness close in from the edges."
            href="/gains-demo/climb"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-[760px] mt-3">
          {/* Adopted 2026-08-13, moved from Ideas & Demos for Review */}
          <div
            className="rounded-[24px] p-5"
            style={{ background: 'var(--surface-card)', border: '1px dashed var(--border-strong)', backdropFilter: 'var(--blur-panel)' }}
          >
            <div className="mb-3">
              <Pill icon={HardHat}>In development</Pill>
            </div>
            <h3 className="text-[15px] font-bold mb-2" style={{ fontFamily: 'var(--font-core)', color: 'var(--text-bright)' }}>
              New arcade activities
            </h3>
            <div className="space-y-3 text-[13px]" style={{ color: 'var(--text-body)' }}>
              {REVIEW_ARCADES.map((a) => (
                <div key={a.title}>
                  <p className="font-semibold" style={{ color: 'var(--text-bright)' }}>{a.title}</p>
                  <p className="leading-relaxed">{a.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-[24px] p-5"
            style={{ background: 'var(--surface-card)', border: '1px dashed var(--border-strong)', backdropFilter: 'var(--blur-panel)' }}
          >
            <div className="mb-3">
              <Pill icon={HardHat}>In development</Pill>
            </div>
            <h3 className="text-[15px] font-bold mb-2" style={{ fontFamily: 'var(--font-core)', color: 'var(--text-bright)' }}>
              The gear that evolves: a growing toolbox
            </h3>
            <div className="space-y-2 text-[13px]" style={{ color: 'var(--text-body)' }}>
              {REVIEW_GEAR_POINTS.map((p, i) => (
                <p key={i} className="leading-relaxed">{p}</p>
              ))}
            </div>
            <p className="text-[13px] italic pl-3 mt-3" style={{ color: 'var(--text-muted)', borderLeft: '2px solid var(--border-warm)' }}>
              {REVIEW_GEAR_THEME}
            </p>
          </div>
        </div>
      </section>
      </div>
      </div>
    </DemoPageLayout>
  )
}

// ---------- Reusable pieces ----------

// One proposal in the review section, with its own comment thread pinned to
// that item's feedback section tag.
function ReviewItem({ n, title, section, children }) {
  return (
    <article className="rounded-[20px] p-5" style={{ background: 'var(--surface-card-raised)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)' }}>
      <h3 className="text-[16px] font-semibold mb-2" style={{ fontFamily: 'var(--font-core)', color: 'var(--text-bright)' }}>
        <span style={{ color: 'var(--text-warm)' }}>{n}.</span> {title}
      </h3>
      <div className="text-[14px] leading-relaxed" style={{ color: 'var(--text-body)' }}>{children}</div>
      <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
        <FeedbackButton
          program="gains-teens"
          sections={GAINS_FEEDBACK_SECTIONS}
          defaultSection={section}
          label="Comment on this"
          subtle
        />
      </div>
    </article>
  )
}

// Image card (playable character, NPCs). `tag` renders a small pill — used
// for the symptom labels. `uniform` pins the image to a 9:16 box so a row of
// them lines up exactly even if the source plates differ in pixel size (the
// traveler-progression strip mixes a 941×1672 plate with 576×1024 ones).
// Handles a dashed placeholder when art isn't ready.
function ArtCard({ src, name, tag, blurb, placeholder, uniform }) {
  return (
    <figure
      className="rounded-[20px] p-3 flex flex-col"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)', boxShadow: 'var(--shadow-md)' }}
    >
      {placeholder ? (
        <div
          role="img"
          aria-label={`${name} — art in progress`}
          className="w-full aspect-[3/4] rounded-xl flex items-center justify-center text-[13px] italic mb-3"
          style={{ background: 'rgba(255,247,234,.06)', border: '2px dashed var(--border-soft)', color: 'var(--text-faint)' }}
        >
          Redesign in progress
        </div>
      ) : (
        <img
          src={src}
          alt={name}
          loading="lazy"
          className={
            'w-full rounded-xl mb-3 ' +
            (uniform ? 'aspect-[9/16] object-cover' : 'h-auto')
          }
        />
      )}
      <figcaption className="flex-1">
        <h4 className="text-[14px] font-semibold leading-tight" style={{ fontFamily: 'var(--font-core)', color: 'var(--text-bright)' }}>{name}</h4>
        {tag && (
          <GainsBadge tone="water" style={{ marginTop: 4, height: 22, fontSize: 10 }}>{tag}</GainsBadge>
        )}
        {blurb && <p className="text-[12px] leading-relaxed mt-1.5" style={{ color: 'var(--text-muted)' }}>{blurb}</p>}
      </figcaption>
    </figure>
  )
}

// Draft 51: one of the five zone psychoeducation videos in the review
// section. Vimeo's `?h=` hash-embed URL is the standard way to embed an
// unlisted video anywhere -- no separate "unlisted" handling needed.
// Draft 52: these are phone-portrait videos (9:16, like the rest of the
// game), not landscape.
// Draft 55: laid out 2-per-row in a grid instead of a single stack, so each
// player now fills its own grid cell rather than being centered to a fixed
// 360px phone-frame width. Each card also gets its own comment box (tagged
// with that video's `section`) so feedback maps to a specific video in the
// CSV export instead of all five sharing one box.
function ReviewVideo({ title, id, h, section }) {
  return (
    <div>
      <p className="text-[13px] font-semibold mb-1.5" style={{ color: 'var(--text-bright)' }}>{title}</p>
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ aspectRatio: '9 / 16', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-md)' }}
      >
        <iframe
          src={`https://player.vimeo.com/video/${id}?h=${h}&title=0&byline=0&portrait=0`}
          title={title}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="mt-2">
        <FeedbackButton
          program="gains-teens"
          sections={GAINS_FEEDBACK_SECTIONS}
          defaultSection={section}
          label="Comment on this video"
          subtle
        />
      </div>
    </div>
  )
}

// Draft 51: Spark, presented as the Narrator with the team's adopted voice
// (Option F, decided -- the six-option picker that used to live in the
// review section is retired). Matches ArtCard's visual language by hand
// since ArtCard itself has no slot for an <audio> element.
function NarratorCard() {
  return (
    <figure
      className="rounded-[20px] p-3 flex flex-col"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)', boxShadow: 'var(--shadow-md)' }}
    >
      <img
        src={`${ART}/narrator-spark.webp`}
        alt="Spark, the narrator and guide"
        loading="lazy"
        className="w-full h-auto rounded-xl mb-3"
      />
      <figcaption className="flex-1">
        <h4 className="text-[14px] font-semibold leading-tight" style={{ fontFamily: 'var(--font-core)', color: 'var(--text-bright)' }}>
          Spark
        </h4>
        <GainsBadge tone="water" style={{ marginTop: 4, height: 22, fontSize: 10 }}>Narrator</GainsBadge>
        <p className="text-[12px] leading-relaxed mt-1.5" style={{ color: 'var(--text-muted)' }}>
          Your guide through Shadowmend.
        </p>
        <audio
          controls
          preload="metadata"
          src={`${AUDIO}/spark-voice-f.mp3?v=3`}
          aria-label="Spark's voice sample"
          className="w-full mt-2"
        />
      </figcaption>
    </figure>
  )
}

function PrototypeCard({ img, title, blurb, href }) {
  return (
    <article
      className="rounded-[20px] p-4 flex gap-4"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)', boxShadow: 'var(--shadow-md)' }}
    >
      <div
        className="flex-shrink-0 w-[74px] overflow-hidden rounded-xl bg-[#05070e]"
        style={{ aspectRatio: '9 / 16' }}
        aria-hidden="true"
      >
        <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold leading-tight mb-1" style={{ fontFamily: 'var(--font-core)', color: 'var(--text-bright)' }}>
          {title}
        </h3>
        <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>{blurb}</p>
        <Link
          to={href}
          className="inline-flex items-center gap-1.5 font-semibold rounded-full px-4 py-2 min-h-[48px] text-[13px]"
          style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
        >
          <Play size={13} strokeWidth={2} />
          Play
        </Link>
      </div>
    </article>
  )
}

// Draft 50: restyled to the Shadowmend Badge look. Pill is used all over
// the per-zone/in-development chrome, so restyling it here cascades
// everywhere it's used rather than touching each call site.
function Pill({ icon: Icon, children }) {
  return (
    <GainsBadge tone="warm" icon={<Icon size={13} strokeWidth={2} />} style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 'var(--weight-medium)' }}>
      {children}
    </GainsBadge>
  )
}

function Beat({ label, children }) {
  return (
    <div>
      <div
        className="text-[11px] uppercase font-semibold mb-1.5"
        style={{ letterSpacing: 'var(--tracking-wide)', color: 'var(--text-faint)', fontFamily: 'var(--font-core)' }}
      >
        {label}
      </div>
      <div className="text-[14px] leading-relaxed" style={{ color: 'var(--text-body)' }}>{children}</div>
    </div>
  )
}

function CharacterChips({ names }) {
  return (
    <div className="flex flex-wrap gap-2">
      {names.map((key) => {
        const c = CHAR[key]
        if (!c) return null
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1"
            style={{ background: 'var(--action-quiet)', border: '1px solid var(--border-soft)' }}
          >
            <img src={c.src} alt="" loading="lazy" className="w-6 h-6 rounded-full object-cover" />
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-body)' }}>
              {c.name}
              {c.role ? <span style={{ color: 'var(--text-faint)' }}> · {c.role}</span> : null}
            </span>
          </span>
        )
      })}
    </div>
  )
}

function ZoneSection({ zone }) {
  const t = zone.traversal
  return (
    <section className="mb-8">
      <h3 className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-core)', color: 'var(--text-bright)' }}>
        {zone.n} · {zone.name}
      </h3>
      <p className="text-[13px] mb-3" style={{ color: 'var(--text-muted)' }}>{zone.scenery}</p>

      <div
        className="rounded-[24px] p-5 flex flex-col md:flex-row gap-5"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)', boxShadow: 'var(--shadow-md)' }}
      >
        <div className="md:w-[190px] flex-shrink-0 mx-auto md:mx-0 w-[150px]">
          <img src={zone.image} alt={`${zone.name} — zone plate`} loading="lazy" className="w-full rounded-2xl" style={{ boxShadow: 'var(--shadow-md)' }} />
        </div>

        <div className="flex-1 space-y-4 min-w-0">
          <Beat label="Characters in this zone">
            <CharacterChips names={zone.characters} />
          </Beat>

          <Beat label={zone.videos.length > 1 ? 'Videos' : 'Video'}>
            <div className="space-y-3">
              {zone.videos.map((v) => (
                <div key={v.title}>
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                    <span className="font-semibold" style={{ color: 'var(--text-bright)' }}>{v.title}</span>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap"
                      style={{ background: 'var(--action-quiet)', color: 'var(--text-muted)' }}
                    >
                      {v.duration}
                    </span>
                  </div>
                  <div className="mb-2">
                    <Pill icon={Film}>Video in production</Pill>
                  </div>
                  {v.note && <p className="text-[12px] italic mb-1.5" style={{ color: 'var(--text-faint)' }}>{v.note}</p>}
                  {v.pending ? (
                    <p className="text-[13px] italic" style={{ color: 'var(--text-faint)' }}>{v.pendingNote}</p>
                  ) : (
                    <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-body)' }}>{v.script}</p>
                  )}
                </div>
              ))}
            </div>
          </Beat>

          <Beat label="Activity">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
              <span className="font-semibold" style={{ color: 'var(--text-bright)' }}>{zone.activity.title}</span>
              <Pill icon={HardHat}>
                {zone.activity.pending ? 'To be designed' : 'Interactive version in development'}
              </Pill>
            </div>
            <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text-body)' }}>{zone.activity.desc}</div>
          </Beat>

          {zone.synopsis && (
            <Beat label={zone.synopsis.title}>
              <div className="mb-1.5">
                <Pill icon={HardHat}>In development</Pill>
              </div>
              <div className="text-[13px] leading-relaxed" style={{ color: 'var(--text-body)' }}>{zone.synopsis.desc}</div>
            </Beat>
          )}

          <Beat label="Gear earned">{zone.gear}</Beat>

          <Beat label={t.end ? 'Arrival' : 'Traversal to the next zone'}>
            {t.playable ? (
              <>
                <p className="mb-2">{t.text}</p>
                <Link
                  to={t.playHref || '/gains-demo/traversal'}
                  className="inline-flex items-center gap-2 font-semibold rounded-full px-4 py-2 min-h-[48px] text-[13px]"
                  style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
                >
                  <Play size={14} strokeWidth={2} />
                  {t.playLabel || 'Play the traversal prototype'}
                </Link>
              </>
            ) : t.end ? (
              <p>{t.text}</p>
            ) : (
              <>
                <div className="mb-1.5">
                  <Pill icon={HardHat}>In development</Pill>
                </div>
                <p>{t.text}</p>
              </>
            )}
          </Beat>

          <Beat label="Clinical goal">{zone.goal}</Beat>
        </div>
      </div>
    </section>
  )
}
