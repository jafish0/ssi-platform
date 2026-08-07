// GAINS Teens demo page at /gains-demo — the internal review surface for
// the GAINS for Teens SSI ("The Long Light"). Reorganized (Draft 12) to
// read like the actual GAME FLOW, top to bottom:
//   Zone Map (roadmap) → Child Assent & Measures → Playable Characters →
//   Zone 1…5 (each: image, characters, video/script, activity, gear,
//   traversal) with "in development" placeholders where pending.
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

export const GAINS_FEEDBACK_SECTIONS = [
  // Ideas & Demos for Review — one thread per proposal
  { value: 'review-exposition', label: 'Review: Exposition' },
  { value: 'review-character', label: 'Review: Character progression' },
  { value: 'review-arcades', label: 'Review: Arcade ideas' },
  { value: 'review-gear', label: 'Review: Gear toolbox' },
  { value: 'review-rename', label: 'Review: Zone rename' },
  { value: 'review-spark-voice', label: "Review: Spark's voice" },
  // The official breakdown
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
    zone: '1 · The Hollow',
    scene: 'darkest; candle, beacon far above',
    video: 'Video 1 — what trauma is',
    activity: 'Body Mapping',
    gear: 'TBD',
    goal: 'Understand trauma; normalize bodily responses.',
  },
  {
    zone: '2 · The Lantern Path',
    scene: 'brightening slopes; lanterns to relight',
    video: 'Video 2 — the four reactions',
    activity: 'Character Examples',
    gear: 'TBD',
    goal: 'Recognize and name common trauma reactions.',
  },
  {
    zone: '3 · The Mistfields',
    scene: 'above first clouds; light breaks through',
    video: 'Video 3 — these are normal; help works + Getting the best trauma therapy',
    activity: 'Bridge beat (TBD)',
    gear: 'A Wingsuit',
    goal: 'Normalize + instill hope; bridge to getting help.',
  },
  {
    zone: '4 · The Bright Reaches',
    scene: 'above the clouds; warm, open',
    video: 'What to Expect from Therapy — ends with the 3-3-3 rule',
    activity: 'Mindfulness: 3-3-3 (see / hear / feel + breathing)',
    gear: 'Oxygen Mask — helps you breathe',
    goal: 'Demystify therapy; teach grounding.',
  },
  {
    zone: '5 · The Threshold',
    scene: 'the Beacon; door opens into light',
    video: 'Part 2 (pending): shame/reluctance + Growth Mindset',
    activity: 'TBD (CTAC)',
    gear: 'Final gear / full toolkit',
    goal: 'Address shame; commit; readiness.',
  },
]

// ---------- Ideas & Demos for Review (Draft 24) ----------
// A staging area at the top of the page: proposals and previews the team
// comments on BEFORE they're folded into the official zone breakdown. Items
// 3–5 are text-only; items 1, 2 and 6 are things moved up out of their
// official spots while they're under discussion.
const REVIEW_ARCADES = [
  {
    title: 'Reaching the Lantern Path — a slower, revealing arcade',
    body: 'You hold the Lantern, which lights only a small circle; you feel your way out of the opening zone and the path unfolds as you go.',
    alts: 'Alternates for comment: a "keep it lit" tending game vs. gusts; or a "hold still to reveal the next safe step" patience crossing.',
  },
  {
    title: 'Clearing the darkness → the Mistfields',
    body: 'With the amplified light you drag to aim and release a light-bloom that sweeps a cone of fog clear, revealing the background; when the area is cleared the camera pans up above the cloud line — "You made it to the Mistfields."',
    alts: 'Framed as lifting/dissolving darkness, not combat.',
  },
]

const REVIEW_GEAR_POINTS = [
  'Everything you earn is one growing toolkit, not scattered pickups. It starts as a simple Lantern (Spark’s gift). Each psychoed character teaches a skill and gives you a part; the parts combine the Lantern into the Focusing Glass. In the Mistfields it grows bird-of-light wings (a reskin of the existing bird traversal — no mechanical change). At the summit, the fully-built kit lights the Beacon at the Summit of Mount Hope.',
  'Intent for comment: tools grow stronger the more they’re used (practice), and the real power is in combining them — the coping-skills-toolbox idea.',
]

const REVIEW_GEAR_THEME =
  'Every activity earns a tool. The tools combine and grow — a lantern becomes a Focusing Glass, the Glass grows wings — so you reach the summit carrying everything you’ve learned.'

const REVIEW_RENAME_RATIONALE =
  '"The Hollow" was meant to convey an empty, desolate place — but that’s also how you’d spell what’s pronounced "holler" in Eastern Kentucky, and we don’t want to equate that emptiness with where anyone lives. A rename keeps the metaphor about an internal emotional state, not a real place.'

// ---------- Playable character ----------
// One protagonist (the team dropped the choose-your-character set), shown as
// the four-stage progression: the same traveler with their darkness lightening
// as they climb — the Option-2 promise made visible on the character. All four
// plates are 9:16 so they line up as an even strip. Zone labels/captions are
// placeholder copy from Draft 23. The old avatar files stay in the repo.
const TRAVELER_STAGES = [
  {
    src: `${ART}/traveler-stage1-hallow.webp`,
    name: 'Zone 1 — The Hollow',
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
    name: 'The Hollow',
    scenery: 'The dark valley floor — a single candle in hand, the beacon far above.',
    image: '/long-light/zone1.webp',
    characters: ['spark'],
    videos: [{ title: 'Video 1 — What trauma is', duration: '25 sec', script: V1 }],
    activity: {
      title: 'Body Mapping',
      desc: (
        <>
          <p>
            <strong>Part 1:</strong> tap to reveal how five parts of the body
            react during and after trauma — <strong>Lungs</strong> (breathe
            faster to take in more oxygen), <strong>Head</strong> (thoughts
            race, hard to think clearly, dizzy or detached/unreal),{' '}
            <strong>Heart</strong> (beats faster and harder),{' '}
            <strong>Stomach</strong> (upset or nauseous as blood moves to the
            arms and legs), <strong>Body</strong> (heats up and sweats, muscles
            tense, shaky or tingly) — then note these responses can linger after
            the danger passes or resurface when something reminds you of it.
          </p>
          <p className="mt-2">
            <strong>Part 2:</strong> tap each reaction you’ve felt recently.
          </p>
        </>
      ),
    },
    gear: 'TBD.',
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
          Meet the four messenger creatures —{' '}
          <strong>Emberwick, Mirefly, Hollowshell, Dimmet</strong> — and for
          each, hear a short script and choose which of the four symptom types it
          shows (reactivity, intrusion, avoidance, negative mood/thoughts). Ends
          with an animation of all four creatures’ symptoms easing.
        </>
      ),
    },
    gear: 'TBD.',
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
      title: 'Bridge beat',
      pending: true,
      desc: 'A light, reflective bridge beat (TBD) — a message, not a drill.',
    },
    gear: 'A Wingsuit — lets you take flight.',
    traversal: {
      text: 'The bird flight — “the power of connections.” Gather connections to climb from the Mistfields up to the Bright Reaches.',
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
      title: 'Mindfulness — the 3-3-3 rule',
      desc: (
        <>
          <p>
            Try it right now if you’re feeling panicky or overwhelmed — the
            3-3-3 rule. Identify each of these in your surroundings:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>3 things you see</strong> — look around and name three
              objects you can see.
            </li>
            <li>
              <strong>3 sounds you hear</strong> — close your eyes and tune in to
              three different sounds around you.
            </li>
            <li>
              <strong>3 deep breaths</strong> — breathe along with an expanding
              circle that guides a long, slow inhale and exhale.
            </li>
          </ul>
        </>
      ),
    },
    gear: 'Oxygen Mask — helps you breathe.',
    traversal: {
      text: 'The Ascent — a one-thumb climb through tree, mountain, and crystal spire up to the Beacon. Orbs refill your Second Wind; as it runs low your own darkness closes in from the edges, and each orb pushes it back.',
      playable: true,
      playHref: '/gains-demo/climb',
      playLabel: 'Play the climb prototype',
    },
    goal: 'Demystify therapy; reduce fear of the unknown; teach grounding/breathing.',
  },
  {
    n: 'Zone 5',
    name: 'The Threshold',
    scenery: 'The summit and the Beacon — the door that opens into light.',
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
    gear: 'Final gear / full toolkit.',
    traversal: { text: 'Arrival at the Beacon — the journey’s end.', end: true },
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
      {/* Intro */}
      <section className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-800 mb-2">
          GAINS for Teens — The Long Light
        </h1>
        <p className="text-[14px] text-slate-600 leading-relaxed max-w-[760px]">
          An internal walkthrough of the intervention, laid out the way it
          plays: the roadmap first, then the characters you can be, then each
          zone of the climb — video, activity, gear, and the arcade flight to
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

      {/* Ideas & Demos for Review — staging area above the official
          breakdown. Each item carries its own comment thread. */}
      <section className="mb-12">
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 overflow-hidden">
          <div className="bg-amber-400/90 px-5 py-2">
            <span className="text-[12px] font-bold uppercase tracking-wide text-amber-950">
              Proposals — comment before we make them official
            </span>
          </div>
          <div className="p-5">
            <h2 className="text-[20px] font-bold text-slate-800 mb-1">
              Ideas &amp; Demos for Review
            </h2>
            <p className="text-[14px] italic text-slate-600 leading-relaxed mb-5 max-w-[720px]">
              These are proposals and previews under discussion. Comment on any
              item below before we fold it into the official zones.
            </p>

            <div className="space-y-4">
              {/* 1 — Exposition (Option 2) */}
              <ReviewItem
                n={1}
                title="Exposition (Stephanie’s Option 2)"
                section="review-exposition"
              >
                <p className="leading-relaxed">{SPARK_INTRO_LINE}</p>
              </ReviewItem>

              {/* 2 — How the character changes */}
              <ReviewItem
                n={2}
                title="How the character changes"
                section="review-character"
              >
                <p className="mb-3">
                  One traveler, the whole way up — the darkness they arrive with
                  lightens as they climb, until everyone can see the person
                  they’ve always been.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[680px]">
                  {TRAVELER_STAGES.map((c) => (
                    <ArtCard key={c.name} {...c} uniform />
                  ))}
                </div>
              </ReviewItem>

              {/* 3 — Possible new arcade activities */}
              <ReviewItem
                n={3}
                title="Possible new arcade activities"
                section="review-arcades"
              >
                <div className="space-y-3">
                  {REVIEW_ARCADES.map((a) => (
                    <div key={a.title}>
                      <p className="font-semibold text-slate-800">{a.title}</p>
                      <p className="leading-relaxed">{a.body}</p>
                      <p className="text-[13px] italic text-slate-500 mt-1">{a.alts}</p>
                    </div>
                  ))}
                </div>
              </ReviewItem>

              {/* 4 — The gear that evolves */}
              <ReviewItem
                n={4}
                title="The gear that evolves: a growing toolbox"
                section="review-gear"
              >
                <div className="space-y-2">
                  {REVIEW_GEAR_POINTS.map((p, i) => (
                    <p key={i} className="leading-relaxed">{p}</p>
                  ))}
                </div>
                <p className="text-[14px] italic text-slate-700 border-l-2 border-amber-300 pl-3 mt-3">
                  {REVIEW_GEAR_THEME}
                </p>
              </ReviewItem>

              {/* 5 — Proposed zone rename */}
              <ReviewItem
                n={5}
                title="Proposed zone rename"
                section="review-rename"
              >
                <p className="leading-relaxed mb-2">
                  Rename the opening zone (currently{' '}
                  <strong>“the Hollow”</strong>) to <strong>“The Deep”</strong>,
                  with <strong>“Lowreach”</strong> as an alternative. Proposal
                  only — the official breakdown below is unchanged.
                </p>
                <p className="text-[14px] italic text-slate-700 border-l-2 border-amber-300 pl-3">
                  {REVIEW_RENAME_RATIONALE}
                </p>
              </ReviewItem>

              {/* 6 — Spark's voice */}
              <ReviewItem
                n={6}
                title="Spark’s voice (voice-model preview)"
                section="review-spark-voice"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0 mx-auto sm:mx-0 w-[110px]">
                    <img
                      src={`${ART}/narrator-spark.webp`}
                      alt="Spark — the narrator and guide"
                      loading="lazy"
                      className="w-full h-auto rounded-2xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-700 mb-1.5">
                      Spark&apos;s intro narration — how does the voice model sound?
                    </p>
                    <audio
                      controls
                      preload="metadata"
                      src="/long-light/audio/spark-introduction.mp3"
                      aria-label="Audio: Spark's intro narration"
                      className="w-full mb-2"
                    />
                    <p className="text-[13px] text-slate-500 italic">
                      Script is the Exposition text in item 1 above.
                    </p>
                  </div>
                </div>
              </ReviewItem>
            </div>
          </div>
        </div>
      </section>

      {/* A. Zone Map — the living roadmap */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
          <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600">
            World and Development Map
          </h2>
          <span className="text-[12px] text-slate-400 italic">updated as we go</span>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="lg:w-[220px] flex-shrink-0 mx-auto lg:mx-0 w-[180px]">
              <img
                src={`${ART}/map-and-world.webp`}
                alt="The world of The Long Light — the climb from the dark valley to the Beacon"
                loading="lazy"
                className="w-full rounded-2xl"
              />
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full min-w-[720px] text-[13px] leading-relaxed border-collapse">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2 border-b-2 border-slate-300 align-bottom">Zone &amp; scenery</th>
                    <th className="px-3 py-2 border-b-2 border-slate-300 align-bottom">Video</th>
                    <th className="px-3 py-2 border-b-2 border-slate-300 align-bottom">Activity</th>
                    <th className="px-3 py-2 border-b-2 border-slate-300 align-bottom">Gear</th>
                    <th className="px-3 py-2 border-b-2 border-slate-300 align-bottom">Clinical goal</th>
                  </tr>
                </thead>
                <tbody>
                  {ZONE_MAP_ROWS.map((r) => (
                    <tr key={r.zone} className="align-top">
                      <td className="px-3 py-2.5 border-b border-slate-200">
                        <span className="font-semibold whitespace-nowrap text-slate-800">{r.zone}</span>
                        <span className="block text-[12px] text-slate-500">{r.scene}</span>
                      </td>
                      <td className="px-3 py-2.5 border-b border-slate-200 text-slate-700">{r.video}</td>
                      <td className="px-3 py-2.5 border-b border-slate-200 text-slate-700">{r.activity}</td>
                      <td className="px-3 py-2.5 border-b border-slate-200 text-slate-700">{r.gear}</td>
                      <td className="px-3 py-2.5 border-b border-slate-200 text-slate-700">{r.goal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* B. Child Assent & Measures */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-3">
          Child Assent &amp; Measures
        </h2>
        <InDevelopmentCard label="In development." note="Assent flow and pre/post measures not identified yet." />
      </section>

      {/* C. Playable Character (single protagonist) */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          Playable Character
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-4 max-w-[760px]">
          You play as the Traveler.
        </p>
        {/* The four-stage progression is a proposal for now — it lives in
            Ideas & Demos for Review at the top until the team signs off. */}
        <div className="max-w-[220px]">
          <ArtCard
            src={`${ART}/avatar-human-traveler.webp`}
            name="The Traveler"
            blurb="A young traveler setting out to understand what happened — and find the way forward."
          />
        </div>
      </section>

      {/* C2. NPCs — the four symptom creatures. (Spark's card sits in the
          review section at the top while his voice model is under review.) */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          NPCs
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-4 max-w-[760px]">
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
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600">
          The climb
        </h2>
      </section>

      {/* Exposition — the opening that sets up the world (Option-2 text) */}
      <section className="mb-8">
        <h3 className="text-[18px] font-bold text-slate-800">Exposition</h3>
        <p className="text-[13px] text-slate-500 mb-3">
          The opening that sets up the world, before Zone 1.
        </p>
        <div className="bg-white rounded-2xl shadow-card p-5 border-2 border-dashed border-slate-200">
          <div className="mb-4">
            <Pill icon={HardHat}>In development</Pill>
          </div>

          <p className="text-[14px] text-slate-700 leading-relaxed">
            Exposition — proposal under review (see{' '}
            <strong>Ideas &amp; Demos for Review</strong> at the top).
          </p>
        </div>
      </section>

      {ZONES.map((z) => (
        <ZoneSection key={z.n} zone={z} />
      ))}

      {/* F. Prototypes — the playable traversals, side by side */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          Prototypes
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-4 max-w-[760px]">
          Playable traversals — both built on the same game engine. Not wired
          into the session flow yet.
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
      </section>
    </DemoPageLayout>
  )
}

// ---------- Reusable pieces ----------

// One proposal in the review section, with its own comment thread pinned to
// that item's feedback section tag.
function ReviewItem({ n, title, section, children }) {
  return (
    <article className="bg-white rounded-2xl border border-amber-200 p-5">
      <h3 className="text-[16px] font-semibold text-slate-800 mb-2">
        <span className="text-amber-700">{n}.</span> {title}
      </h3>
      <div className="text-[14px] text-slate-700 leading-relaxed">{children}</div>
      <div className="mt-4 pt-3 border-t border-amber-100">
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

function InDevelopmentCard({ label, note }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-8 max-w-[760px] border-2 border-dashed border-slate-200 text-center">
      <HardHat size={28} strokeWidth={1.5} className="text-slate-400 mx-auto mb-3" />
      <p className="text-[16px] font-semibold text-slate-700 mb-1">{label}</p>
      {note && <p className="text-[13px] text-slate-500">{note}</p>}
    </div>
  )
}

// Image card (playable character, NPCs). `tag` renders a small pill — used
// for the symptom labels. `uniform` pins the image to a 9:16 box so a row of
// them lines up exactly even if the source plates differ in pixel size (the
// traveler-progression strip mixes a 941×1672 plate with 576×1024 ones).
// Handles a dashed placeholder when art isn't ready.
function ArtCard({ src, name, tag, blurb, placeholder, uniform }) {
  return (
    <figure className="bg-white rounded-2xl shadow-card p-3 flex flex-col">
      {placeholder ? (
        <div
          role="img"
          aria-label={`${name} — art in progress`}
          className="w-full aspect-[3/4] bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[13px] italic mb-3"
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
        <h4 className="text-[14px] font-semibold text-slate-800 leading-tight">{name}</h4>
        {tag && (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 mt-1 text-[11px] font-medium bg-ctac-teal-100 text-ctac-teal-800">
            {tag}
          </span>
        )}
        {blurb && <p className="text-[12px] text-slate-600 leading-relaxed mt-1.5">{blurb}</p>}
      </figcaption>
    </figure>
  )
}

function PrototypeCard({ img, title, blurb, href }) {
  return (
    <article className="bg-white rounded-2xl shadow-card p-4 flex gap-4">
      <div
        className="flex-shrink-0 w-[74px] overflow-hidden rounded-xl bg-[#05070e]"
        style={{ aspectRatio: '9 / 16' }}
        aria-hidden="true"
      >
        <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-slate-800 leading-tight mb-1">
          {title}
        </h3>
        <p className="text-[12px] text-slate-600 leading-relaxed mb-3">{blurb}</p>
        <Link
          to={href}
          className="inline-flex items-center gap-1.5 bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white font-semibold rounded-full px-4 py-2 min-h-[40px] text-[13px]"
        >
          <Play size={13} strokeWidth={2} />
          Play
        </Link>
      </div>
    </article>
  )
}

function Pill({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
      <Icon size={13} strokeWidth={2} />
      {children}
    </span>
  )
}

function Beat({ label, children }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1.5">
        {label}
      </div>
      <div className="text-[14px] text-slate-700 leading-relaxed">{children}</div>
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
          <span key={key} className="inline-flex items-center gap-1.5 bg-slate-100 rounded-full pl-1 pr-3 py-1">
            <img src={c.src} alt="" loading="lazy" className="w-6 h-6 rounded-full object-cover" />
            <span className="text-[12px] font-medium text-slate-700">
              {c.name}
              {c.role ? <span className="text-slate-400"> · {c.role}</span> : null}
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
      <h3 className="text-[18px] font-bold text-slate-800">
        {zone.n} · {zone.name}
      </h3>
      <p className="text-[13px] text-slate-500 mb-3">{zone.scenery}</p>

      <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col md:flex-row gap-5">
        <div className="md:w-[190px] flex-shrink-0 mx-auto md:mx-0 w-[150px]">
          <img src={zone.image} alt={`${zone.name} — zone plate`} loading="lazy" className="w-full rounded-2xl" />
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
                    <span className="font-semibold text-slate-800">{v.title}</span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium bg-slate-100 text-slate-600 whitespace-nowrap">
                      {v.duration}
                    </span>
                  </div>
                  <div className="mb-2">
                    <Pill icon={Film}>Video in production</Pill>
                  </div>
                  {v.note && <p className="text-[12px] italic text-slate-500 mb-1.5">{v.note}</p>}
                  {v.pending ? (
                    <p className="text-[13px] italic text-slate-500">{v.pendingNote}</p>
                  ) : (
                    <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">{v.script}</p>
                  )}
                </div>
              ))}
            </div>
          </Beat>

          <Beat label="Activity">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
              <span className="font-semibold text-slate-800">{zone.activity.title}</span>
              <Pill icon={HardHat}>
                {zone.activity.pending ? 'To be designed' : 'Interactive version in development'}
              </Pill>
            </div>
            <div className="text-[13px] text-slate-700 leading-relaxed">{zone.activity.desc}</div>
          </Beat>

          <Beat label="Gear earned">{zone.gear}</Beat>

          <Beat label={t.end ? 'Arrival' : 'Traversal to the next zone'}>
            {t.playable ? (
              <>
                <p className="mb-2">{t.text}</p>
                <Link
                  to={t.playHref || '/gains-demo/traversal'}
                  className="inline-flex items-center gap-2 bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white font-semibold rounded-full px-4 py-2 min-h-[40px] text-[13px]"
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
