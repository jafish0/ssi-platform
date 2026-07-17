// GAINS Teens demo page at /gains-demo — the internal review surface for
// the GAINS for Teens SSI ("The Long Light"), mirroring the Ready for
// Roots /demo pattern and reusing its feedback pipeline. Unlisted; shared
// by link. Feedback from this page is tagged program="gains-teens" plus a
// section (pre-post / activities / concept-art / pitch) so admin triage
// can tell GAINS comments apart from RfR in the shared table.
//
// Concept art is served from the static pitch site at /long-light/ (the
// WebP in public/long-light/ and public/long-light/art/) — absolute paths,
// no imports, so the two surfaces share one copy of each asset.
//
// The written pitch section reuses the EXACT spec text from the pitch
// page's spec panel (public/long-light/index.html) so the two stay in
// sync — when that copy changes, update both.

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HardHat, Play, Film } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'

export const GAINS_FEEDBACK_SECTIONS = [
  { value: 'pre-post', label: 'Pre/Post Measures & Consent' },
  { value: 'activities', label: 'Activities' },
  { value: 'videos', label: 'Videos' },
  { value: 'concept-art', label: 'Concept Art' },
  { value: 'traversal-prototype', label: 'Traversal prototype' },
  { value: 'pitch', label: 'The pitch (written)' },
  { value: 'general', label: 'General / whole page' },
]

// ---------- Psychoeducation video scripts (Draft 9). Videos aren't
// produced yet — each card shows the verbatim script + length + zone. ----------

const VIDEOS = [
  {
    track: 'Trauma 101 · Video 1',
    title: 'What trauma is',
    duration: '25 sec',
    zone: 'Zone 1 · The Hollow',
    script:
      'A trauma is any frightening, dangerous, or violent event that harms or threatens to harm your life or well-being (for example, physical abuse, a serious car accident, or even a natural disaster). A trauma can also be something that happens to someone you love or something you witness (for example, seeing parents physically hurt one another, or having someone close suddenly die). Our minds and bodies automatically react to trauma in multiple ways, and even after the trauma is over our bodies have difficulty relaxing.',
  },
  {
    track: 'Trauma 101 · Video 2',
    title: 'The four reactions',
    duration: '45 sec',
    zone: 'Zone 2 · The Lantern Path',
    note: 'Production note: show each category label on screen as it’s described.',
    script:
      'Experiencing trauma can cause lots of reactions, in addition to our body’s responses, and these are grouped into four main categories. Hypervigilance or reactivity: feeling more on edge or jumpy, on the lookout for danger — this can even make sleeping hard because your body and mind just won’t calm down. Intrusion: not being able to stop thinking about the trauma, or feeling like it’s happening all over again. Avoidance: trying hard not to think about it or staying away from reminders — it might feel okay at first, but pushing things down always causes more problems in the long term. And negative changes in mood and thoughts: more sadness, anger, or worry, and thoughts like “there’s no one I can trust” or “what happened was my fault.” Let’s look at some examples to better understand what these reactions look like.',
  },
  {
    track: 'Trauma 101 · Video 3',
    title: 'These are normal; help works',
    duration: '25 sec',
    zone: 'Zone 3 · The Mistfields',
    script:
      'Even though it may not feel like it, these are all normal reactions to experiencing trauma — your brain and body’s way of trying to keep you safe. But here’s the most important thing: trauma is something that happened to you, but it doesn’t define who you are. There are healthy ways to recover from even the worst things that happen to us. None of these characters healed alone — they recovered with the help of a good support system. Trauma therapy is one part of a good support system that can help people recover from very difficult things.',
  },
  {
    track: 'Growth Mindset',
    title: 'Choosing your mindset',
    duration: '~55 sec',
    zone: 'Part 2 · getting-help (Zone 4–5)',
    script:
      'Your mindset is a collection of beliefs, attitudes, and thoughts that shape how you understand yourself and the world. Think of it like colored glasses — put on a blue-tinted pair and everything looks blue, but you can choose a green pair and turn everything green. We often talk about two mindsets people “wear”: fixed and growth. With a fixed mindset on, you might think trauma therapy won’t help you, because nothing can change how you feel or think about what happened. That’s tricky: if you have that thought, you probably won’t want to begin trauma therapy, or you won’t really commit to it — and then things really don’t change for you. But that’s not because the thought was true; it’s a result of the fixed mindset you’re wearing. When you choose to put on your growth mindset, you recognize that you have the power to change your thoughts, behaviors, skills, and life. This growth mindset is important for wanting to begin and commit to trauma therapy, and it will help you get the most benefit from treatment.',
  },
]

// ---------- Concept-art data (labels/descriptions from the pitch page's
// "The World & Its Travelers" gallery — keep in sync with it) ----------

const ART = '/long-light/art'

const AVATARS = [
  {
    src: `${ART}/avatar-traveler-1.webp`,
    name: 'The Traveler',
    blurb: 'Hooded and wrapped, a small light in hand.',
  },
  {
    src: `${ART}/avatar-creature.webp`,
    name: 'The Creature',
    blurb: 'Small and curious, with a lantern for a tail.',
  },
  {
    src: `${ART}/avatar-traveler-2.webp`,
    name: 'The Wayfarer',
    blurb: 'Veiled, lighting the path with a lantern-staff.',
  },
  {
    src: `${ART}/avatar-construct.webp`,
    name: 'The Construct',
    blurb: 'Stone and warm light, quietly unstoppable.',
  },
]

const MESSENGERS = [
  {
    src: `${ART}/emberwick.webp`,
    name: 'The Emberwick',
    symptom: 'Reactivity / hypervigilance',
    blurb:
      'Huge ears catch every sound and its lantern flares at the smallest one; it never sleeps. It learned, from someone who’d walked this path before, to tell true danger from its echoes — and its flame finally learned to rest.',
  },
  {
    src: `${ART}/mirefly.webp`,
    name: 'The Mirefly',
    symptom: 'Intrusion',
    blurb:
      'It circles the same flame, trailed by fading images of itself, reliving one moment on a loop. With help it saw the memories for what they were — echoes, not the thing returning — and the circle opened.',
  },
  {
    src: `${ART}/hollowshell.webp`,
    name: 'The Hollowshell',
    symptom: 'Avoidance',
    blurb:
      'It sealed itself inside a shell to feel safe, until nothing warm could reach it. Opening a single seam, a little at a time and with support, is what let the light back in.',
  },
  {
    src: `${ART}/dimmet.webp`,
    name: 'The Dimmet',
    symptom: 'Negative mood / thoughts',
    blurb:
      'It walks bent under its own dark cloud, its glow turned low, sure the weight is its alone to carry. It learned those heavy thoughts weren’t facts, set the stone down, and turned its light back up.',
  },
]

const ZONES = [
  {
    src: '/long-light/zone1.webp',
    name: 'Zone I — The Hollow',
    blurb:
      'The dark valley floor. A single candle in hand, and a warm beacon impossibly far above — the first glimpse of where you’re headed.',
  },
  {
    src: '/long-light/zone2.webp',
    name: 'Zone II — The Lantern Path',
    blurb:
      'Brightening slopes, and a winding trail of lanterns to relight as you climb up out of the dark.',
  },
  {
    src: '/long-light/zone3.webp',
    name: 'Zone III — The Mistfields',
    blurb: 'Above the first clouds, where light finally breaks through the mist.',
  },
  {
    src: '/long-light/zone4.webp',
    name: 'Zone IV — The Bright Reaches',
    blurb: 'Over the cloudline into open, warm, sunlit highland.',
  },
  {
    src: '/long-light/zone5.webp',
    name: 'Zone V — The Threshold',
    blurb: 'The summit and the Beacon — the door that opens into light.',
  },
]

// ---------- Written pitch (spec) data — verbatim from the pitch page's
// spec panel in public/long-light/index.html ----------

const LOOP_BEATS = [
  {
    lead: 'Discover a glyph → watch the message.',
    text: 'A carved glyph, read with the phone, plays a ~30-second psychoeducation clip left by someone who walked this path before.',
  },
  {
    lead: 'Take on the challenge.',
    text: 'A short activity that reinforces what the message just taught.',
  },
  {
    lead: 'Earn gear.',
    text: 'Completing the challenge yields a piece of gear — the coping idea made tangible — that helps with what’s ahead.',
  },
  {
    lead: 'Clear an obstacle.',
    pending: '(Needs to be developed.)',
    text: 'Somewhere on the path stands a barrier: an unhelpful thought or misconception about therapy (for example, “therapy won’t work”). You get past it — going over or around it, never destroying it — by answering with what you’ve learned (for example, “therapy is effective, and it can help me put this behind me”).',
  },
  {
    lead: 'Travel to the next zone.',
    text: 'A brief, fun, arcade-style traversal — you pilot your traveler across to the next, brighter environment, where the next glyph waits.',
  },
]

const DESIGN_PRINCIPLES = [
  {
    lead: 'No-fail, always.',
    text: 'Challenges and traversals are forgiving and success-guaranteed — retry freely, no game-over, no score-shaming. A therapeutic dose can’t be gated behind dexterity, and “I failed at coping” is a message we must never send.',
  },
  {
    lead: 'Gear is the skill.',
    text: 'Where possible each reward is the coping idea in physical form (a grounding “anchor,” a naming “lantern”). By the summit the traveler is fully equipped — which reads as “you’ve built a toolkit for what’s next.”',
  },
  {
    lead: 'Understanding brightens the world.',
    text: 'The psychoeducation arc is lined up with the dark→light gradient: the confusing, frightening material sits in the low dark zones; understanding and hope arrive as the world lightens.',
  },
  {
    lead: 'Alone → not alone.',
    text: 'The teen sets off resentful and alone; every glyph is proof others walked here first; by the top they’re accompanied — and the caregiver’s “I’ll meet you there” pays off at the summit.',
  },
  {
    lead: 'The phone is the interface.',
    text: 'The teen’s own phone becomes the in-world tool: scanner, map, inventory (the toolkit), and where the caregiver’s check-ins arrive.',
  },
  {
    lead: 'One reusable traversal.',
    text: 'A single arcade pattern reskinned per zone — low-twitch, one-handed — not five separate mini-games.',
  },
]

const FRAME_TEXT =
  'The Long Light is an adventure the participant plays. They choose a traveler to become and set out on a quest. Something happened to that traveler, kept deliberately vague, and the journey is about coming to understand it: what trauma is, how it shows up, and how people find their way to help. The player is only ever the traveler, a covered figure or a creature and never a specific face, which keeps the experience free of gender, race, and body type. Along the way they meet others who made the same climb and learned what helped, and the journey ends by reaching the Beacon: proof that help is real and within reach.'

const MESSENGERS_INTRO =
  'Original creatures of the story’s world — no borrowed IP. Each embodies one of the four trauma-reaction categories, reads as a simple dark silhouette in the vector style, and recovered with support (the peer voice). They do double duty: the travelers you meet at glyphs and the cast of the Character Examples challenge.'

const MESSENGER_SPEC_LINES = [
  {
    lead: 'The Emberwick — reactivity / hypervigilance.',
    text: 'Oversized ears and a lantern that flares at every sound; never sleeps. Learned to tell real danger from echoes so its flame could rest.',
  },
  {
    lead: 'The Mirefly — intrusion.',
    text: 'A moth trailed by fading after-images, circling the same flame. Learned the memories were echoes, not the event returning, and they loosened once faced with help.',
  },
  {
    lead: 'The Hollowshell — avoidance.',
    text: 'Curled in a sealed shell, light leaking from one crack. Learned that opening a sliver at a time, with support, let the warmth back in.',
  },
  {
    lead: 'The Dimmet — negative mood / thoughts.',
    text: 'Hunched under its own dark cloud, glow turned low. Learned those thoughts weren’t facts, set the weight down, and turned its light back up.',
  },
]

const ZONE_MAP_ROWS = [
  {
    zone: '1 · The Hollow',
    scene: 'darkest; candle, beacon far above',
    video: 'Video 1 — what trauma is (definition + examples; the body reacts and can’t relax).',
    challenge: 'Body Mapping — reveal how 5 body areas react, then tap the reactions you’ve felt.',
    gear: 'An Anchor — your body’s alarm can be steadied.',
    goal: 'Understand what trauma is; normalize bodily responses.',
  },
  {
    zone: '2 · The Lantern Path',
    scene: 'brightening slopes; lanterns to relight',
    video: 'Video 2 — the four reaction types: reactivity, intrusion, avoidance, negative mood/thoughts.',
    challenge: 'Character Examples — meet the four messenger creatures; recognize each one’s symptom type.',
    gear: 'A Lantern — naming what’s happening.',
    goal: 'Recognize and name common trauma reactions.',
  },
  {
    zone: '3 · The Mistfields',
    scene: 'above first clouds; light breaks through',
    video: 'Video 3 — these are normal; trauma doesn’t define you; recovery happens with support; therapy is part of that.',
    challenge: 'Bridge beat — light/reflective (TBD). A message, not a drill.',
    gear: 'Hope — you are not the first, and not alone.',
    goal: 'Normalize + instill hope; bridge to getting help.',
  },
  {
    zone: '4 · The Bright Reaches',
    scene: 'above the clouds; warm, open',
    video: 'Part 2 — pending. What to expect from therapy.',
    challenge: 'TBD (CTAC)',
    gear: 'A skill-as-gear (Part 2)',
    goal: 'Demystify therapy; reduce fear of the unknown.',
  },
  {
    zone: '5 · The Threshold',
    scene: 'the Beacon; door opens into light',
    video: 'Part 2 — pending. Shame / reluctance to reach out; hope; then arrival.',
    challenge: 'TBD (CTAC)',
    gear: 'Final gear / full toolkit',
    goal: 'Address shame; end on readiness to go.',
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
    >
      {/* Intro */}
      <section className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-800 mb-2">
          GAINS for Teens — The Long Light
        </h1>
        <p className="text-[14px] text-slate-600 leading-relaxed max-w-[760px]">
          Internal review page for the GAINS for Teens single-session
          intervention. Look through what&apos;s here and use the{' '}
          <strong>Give feedback</strong> button (top right) — pick the section
          your comment is about so it lands in the right pile.
        </p>
        <p className="text-[13px] text-slate-500 mt-2">
          The scroll-through concept pitch lives at{' '}
          <a
            href="/long-light/"
            target="_blank"
            rel="noreferrer"
            className="text-ctac-teal-700 hover:text-ctac-teal-900 underline"
          >
            /long-light/
          </a>
          .
        </p>
      </section>

      {/* 1. Pre/Post Measures & Consent */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-3">
          Pre/Post Measures &amp; Consent
        </h2>
        <InDevelopmentCard label="In development." note="Measures have not been identified yet." />
      </section>

      {/* 2. Activities */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          Activities
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-5 max-w-[760px]">
          The reinforcing activities we have content for. Interactive versions
          are in development — these describe how each will play.
        </p>
        <div className="space-y-4 max-w-[760px]">
          <ActivityCard
            title="Body Mapping"
            duration="~1 min"
            meta="Pairs with Video 1 · Zone 1"
            goal="Normalize the body’s responses."
          >
            <p className="text-[14px] text-slate-700 leading-relaxed">
              <strong>Part 1:</strong> tap to reveal how five parts of the body
              react during and after trauma — <strong>Lungs</strong> (breathe
              faster to take in more oxygen), <strong>Head</strong> (thoughts
              race, hard to think clearly, dizzy or detached/unreal),{' '}
              <strong>Heart</strong> (beats faster and harder),{' '}
              <strong>Stomach</strong> (upset or nauseous as blood moves to the
              arms and legs), <strong>Body</strong> (heats up and sweats, muscles
              tense, shaky or tingly) — then note these responses can linger
              after the danger passes or resurface when something reminds you of
              it.
            </p>
            <p className="text-[14px] text-slate-700 leading-relaxed mt-2">
              <strong>Part 2:</strong> tap each reaction you’ve felt recently.
            </p>
          </ActivityCard>

          <ActivityCard
            title="Character Examples"
            duration="~1 min"
            meta="Pairs with Video 2 · Zone 2"
            goal="Recognize and name trauma reactions."
          >
            <p className="text-[14px] text-slate-700 leading-relaxed">
              Meet the four messenger creatures —{' '}
              <strong>Emberwick, Mirefly, Hollowshell, Dimmet</strong> — and for
              each, hear a short script and choose which of the four symptom types
              it shows (reactivity, intrusion, avoidance, negative mood/thoughts).
              Ends with an animation of all four creatures’ symptoms easing.
            </p>
          </ActivityCard>
        </div>
      </section>

      {/* Videos — psychoeducation scripts (production pending) */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          Videos
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-5 max-w-[760px]">
          The psychoeducation video scripts. The videos aren’t produced yet —
          each card shows the script, its length, and where it lands in the climb.
        </p>
        <div className="space-y-4 max-w-[760px]">
          {VIDEOS.map((v) => (
            <VideoCard key={v.track} {...v} />
          ))}
        </div>
      </section>

      {/* Prototypes */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-3">
          Prototypes
        </h2>
        <article className="bg-white rounded-2xl shadow-card p-5 max-w-[760px] flex flex-col sm:flex-row sm:items-center gap-5">
          <div
            className="flex-shrink-0 mx-auto sm:mx-0 w-[120px] overflow-hidden rounded-2xl bg-[#05070e]"
            style={{ aspectRatio: '9 / 16' }}
            aria-hidden="true"
          >
            <img
              src="/gains/traversal/ravine-bg.webp"
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold text-slate-800 mb-1">
              The ascent — traversal flight
            </h3>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
              A first playable of the between-zone flight: one-thumb steering,
              “connection” lights drifting down to gather, and a no-fail climb
              toward the light. This is the reusable game engine every future
              zone will reskin.
            </p>
            <Link
              to="/gains-demo/traversal"
              className="inline-flex items-center justify-center gap-2 bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white font-semibold rounded-full px-4 py-2 min-h-[44px] text-[14px]"
            >
              <Play size={14} strokeWidth={2} />
              Play the traversal prototype
            </Link>
          </div>
        </article>
      </section>

      {/* 3. Concept Art */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          Concept Art
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-5 max-w-[760px]">
          The visual language of The Long Light — vector-silhouette
          environments and characters. All art is concept-stage.
        </p>

        {/* Choose your traveler */}
        <h3 className="text-[16px] font-semibold text-slate-800 mb-1">Choose your traveler</h3>
        <p className="text-[13px] text-slate-500 mb-4">
          The player avatars — you&apos;ll play as one of these.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {AVATARS.map((a) => (
            <ArtCard key={a.name} src={a.src} name={a.name} blurb={a.blurb} />
          ))}
        </div>

        {/* The messengers */}
        <h3 className="text-[16px] font-semibold text-slate-800 mb-1">The messengers</h3>
        <p className="text-[13px] text-slate-500 mb-4">
          Travelers who made this climb before — each embodies one of the four
          trauma-reaction types.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {MESSENGERS.map((m) => (
            <ArtCard key={m.name} src={m.src} name={m.name} tag={m.symptom} blurb={m.blurb} />
          ))}
        </div>

        {/* The world map */}
        <h3 className="text-[16px] font-semibold text-slate-800 mb-1">The world map</h3>
        <p className="text-[13px] text-slate-500 mb-4">
          One climb, five regions — the path winds up from the dark valley
          where you begin to the Beacon at the summit.
        </p>
        <div className="max-w-[360px] mb-8">
          <ArtCard
            src={`${ART}/map-and-world.webp`}
            name="The World (the map)"
            blurb="The map you are told to follow and the world you will cross."
          />
        </div>

        {/* The zones */}
        <h3 className="text-[16px] font-semibold text-slate-800 mb-1">The zones</h3>
        <p className="text-[13px] text-slate-500 mb-4">
          The five environments of the climb, dark to light.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {ZONES.map((z) => (
            <ArtCard key={z.name} src={z.src} name={z.name} blurb={z.blurb} />
          ))}
        </div>

        {/* Narrator — two options for the team to weigh in on */}
        <h3 className="text-[16px] font-semibold text-slate-800 mb-1">
          Narrator — two options (which fits best?)
        </h3>
        <p className="text-[13px] text-slate-500 mb-4 max-w-[620px]">
          The narrator narrates, gives instructions, and delivers much of the
          psychoeducation, accompanying the journey. Two directions — tell us
          which fits (use <strong>Give feedback</strong> → Concept Art).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[560px]">
          <ArtCard
            src={`${ART}/narrator-spark.webp`}
            name="Option 1 — The Spark"
            blurb="A small companion spirit of living light, a piece of the Beacon’s glow that travels beside you and lights the way. Best as an ever-present voice threaded through the whole journey."
          />
          <ArtCard
            src={`${ART}/narrator-keeper.webp`}
            name="Option 2 — The Lantern Keeper"
            blurb="A serene hooded guide whose lantern is its face; an ancient keeper of the path who has made the climb and now lights it for others. Best as a mentor who appears at key moments."
          />
        </div>
      </section>

      {/* 4. The pitch (written) */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-3">
          The pitch (written)
        </h2>
        <div className="bg-white rounded-2xl shadow-card p-6 max-w-[860px]">
          <h3 className="text-[22px] font-bold text-slate-800 leading-tight">
            GAINS for Teens — The Long Light
          </h3>
          <p className="text-[16px] font-semibold text-slate-700 mt-0.5">
            Gameplay Loop &amp; Zone Map
          </p>
          <p className="text-[12px] text-slate-500 mt-1.5 tracking-wide">
            Internal working spec · July 2026 · concept mapped against CTAC Part 1
          </p>
          <p className="text-[15px] italic text-slate-600 leading-relaxed mt-4">
            A teen anxious about trauma therapy chooses a traveler and sets out
            to climb from darkness to a distant light. The climb is the
            intervention; reaching the Beacon is proof that help is real and
            reachable.
          </p>

          <SpecHeading>1. The gameplay loop</SpecHeading>
          <p className="text-[14px] text-slate-700 leading-relaxed">
            One loop repeats per zone as the traveler climbs. Each turn:
          </p>
          <SpecList items={LOOP_BEATS} />

          <SpecHeading>2. Design principles</SpecHeading>
          <SpecList items={DESIGN_PRINCIPLES} />

          <SpecHeading>3. The frame</SpecHeading>
          <p className="text-[14px] text-slate-700 leading-relaxed">{FRAME_TEXT}</p>

          <SpecHeading>4. The messengers</SpecHeading>
          <p className="text-[14px] text-slate-700 leading-relaxed mb-2">{MESSENGERS_INTRO}</p>
          <SpecList items={MESSENGER_SPEC_LINES} />

          <SpecHeading>5. Zone map</SpecHeading>
          <p className="text-[14px] text-slate-700 leading-relaxed mb-3">
            First-pass mapping of CTAC&apos;s clinical content to the five
            zones. Part 1 (Trauma 101) is in current draft; Part 2 (what to
            expect from therapy; shame/reluctance) is not yet written, so Zones
            4–5 are placeholders.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[13px] leading-relaxed border-collapse">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 border-b-2 border-slate-300 align-bottom">Zone &amp; scenery</th>
                  <th className="px-3 py-2 border-b-2 border-slate-300 align-bottom">Psychoeducation (glyph → video)</th>
                  <th className="px-3 py-2 border-b-2 border-slate-300 align-bottom">Challenge / activity</th>
                  <th className="px-3 py-2 border-b-2 border-slate-300 align-bottom">Gear earned</th>
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
                    <td className="px-3 py-2.5 border-b border-slate-200 text-slate-700">{r.challenge}</td>
                    <td className="px-3 py-2.5 border-b border-slate-200 text-slate-700">{r.gear}</td>
                    <td className="px-3 py-2.5 border-b border-slate-200 text-slate-700">{r.goal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] italic text-slate-500 mt-3">
            Note: Video 3 is a message-only beat (the hopeful pivot), so Zone 3
            carries no discrete drill — it hands off from “understanding
            trauma” (Part 1) to “getting help” (Part 2).
          </p>
        </div>
      </section>
    </DemoPageLayout>
  )
}

// ---------- Reusable pieces ----------

function InDevelopmentCard({ label, note }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-8 max-w-[760px] border-2 border-dashed border-slate-200 text-center">
      <HardHat size={28} strokeWidth={1.5} className="text-slate-400 mx-auto mb-3" />
      <p className="text-[16px] font-semibold text-slate-700 mb-1">{label}</p>
      {note && <p className="text-[13px] text-slate-500">{note}</p>}
    </div>
  )
}

// Video-script card: title + duration + zone, a "Video in production" pill,
// an optional production note, and the verbatim script. Structured so a real
// player (the RfR Vimeo VideoPlayer pattern) can drop in later.
function VideoCard({ track, title, duration, zone, note, script }) {
  return (
    <article className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-0.5">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-ctac-teal-700 font-semibold">
            {track}
          </div>
          <h3 className="text-[16px] font-semibold text-slate-800">{title}</h3>
        </div>
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium bg-slate-100 text-slate-600 whitespace-nowrap">
          {duration}
        </span>
      </div>
      <div className="text-[12px] text-slate-500 mb-3">{zone}</div>
      <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-3">
        <Film size={13} strokeWidth={2} />
        Video in production
      </div>
      {note && <p className="text-[12px] italic text-slate-500 mb-2">{note}</p>}
      <p className="text-[14px] text-slate-700 leading-relaxed">{script}</p>
    </article>
  )
}

// Activity card: title + duration + zone/pairing + goal, an "Interactive
// version in development" pill, and the description (passed as children).
function ActivityCard({ title, duration, meta, goal, children }) {
  return (
    <article className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-0.5">
        <h3 className="text-[16px] font-semibold text-slate-800">{title}</h3>
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium bg-slate-100 text-slate-600 whitespace-nowrap">
          {duration}
        </span>
      </div>
      <div className="text-[12px] text-slate-500 mb-3">
        {meta} · Goal: {goal}
      </div>
      <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-3">
        <HardHat size={13} strokeWidth={2} />
        Interactive version in development
      </div>
      {children}
    </article>
  )
}

// Image card for the concept-art galleries. The art has its own dark
// background, so it sits in a white card with the caption below.
function ArtCard({ src, name, tag, blurb }) {
  return (
    <figure className="bg-white rounded-2xl shadow-card p-3 flex flex-col">
      <img src={src} alt={name} loading="lazy" className="w-full h-auto rounded-xl mb-3" />
      <figcaption className="flex-1">
        <h4 className="text-[14px] font-semibold text-slate-800 leading-tight">{name}</h4>
        {tag && (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 mt-1 text-[11px] font-medium bg-ctac-teal-100 text-ctac-teal-800">
            {tag}
          </span>
        )}
        {blurb && (
          <p className="text-[12px] text-slate-600 leading-relaxed mt-1.5">{blurb}</p>
        )}
      </figcaption>
    </figure>
  )
}

function SpecHeading({ children }) {
  return (
    <h4 className="text-[17px] font-bold text-slate-800 mt-7 mb-2">{children}</h4>
  )
}

function SpecList({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-2.5 mt-2">
      {items.map((it) => (
        <li key={it.lead} className="text-[14px] text-slate-700 leading-relaxed">
          <strong className="text-slate-800">{it.lead}</strong>{' '}
          {it.pending && <em className="text-slate-500">{it.pending}</em>}{' '}
          {it.text}
        </li>
      ))}
    </ul>
  )
}
