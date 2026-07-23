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
import { HardHat, Film, Play, Waves } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'

export const GAINS_FEEDBACK_SECTIONS = [
  { value: 'assent-measures', label: 'Child Assent / Measures' },
  { value: 'exposition', label: 'Exposition' },
  { value: 'zone-1', label: 'Zone 1' },
  { value: 'zone-2', label: 'Zone 2' },
  { value: 'zone-3', label: 'Zone 3' },
  { value: 'zone-4', label: 'Zone 4' },
  { value: 'zone-5', label: 'Zone 5' },
  { value: 'general', label: 'General Feedback' },
]

const ART = '/long-light/art'

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

const TIPS = `Here are some tips for getting the best trauma therapy:

1. Find a therapist who says they are trauma-informed.

2. Ask them what evidence-based trauma treatment they plan to use, what you’ll be asked to do, and how long they think you’ll need to be in therapy. A trauma-informed therapist should probably mention trauma-focused cognitive behavior therapy (or TF-CBT) or EMDR, and plan to meet with you once a week for roughly 4–5 months, not indefinitely. They should also plan to work with at least one of your parents or caregivers to help them understand your current symptoms and how to help you at home. But don’t worry, your caregiver won’t join you in every session and a trauma-informed therapist knows how to talk with caregivers without breaking your privacy.

3. Speaking of privacy, before beginning treatment, ask your therapist to discuss what information is private. Therapy is confidential, so no one else will know that you are in treatment or anything that goes on in your sessions. But a trauma-informed therapist should also advocate for your privacy in sessions. So, while your therapist will need to tell your caregiver if they’re worried about your or someone else’s safety, they can keep other information private.

And good news: participating in trauma therapy is very likely to help you. Research has found that teens who receive trauma treatment, such as TF-CBT, see significant improvement in their PTSD, depression, and anxiety symptoms — and that’s true regardless of who you are as a person, like your race, ethnicity, and gender.`

const GROWTH =
  'Your mindset is a collection of beliefs, attitudes, and thoughts that shape how you understand yourself and the world. Think about it like colored glasses – you put on a blue-tinted pair and all of a sudden, a yellow lemon looks green. Our mindset works like glasses; they can change the way something seems to us, but that doesn’t make it true – even if the lemon looks green, we know that it’s really yellow. We often consider two types of mindsets that people “wear”: fixed and growth mindsets. If you currently have on your fixed mindset, you might find yourself thinking that trauma therapy won’t help you because nothing can change how you feel or think because of what happened to you. This is tricky because if you have that thought, you probably won’t want to begin trauma therapy, or you won’t really commit to it, and then things really don’t change for you. But that’s not because your thought was true - it’s a result of the fixed mindset you’re wearing. When you choose to put on your growth mindset, you choose to recognize that you have the power to change your thoughts, behaviors, skills, and life. This growth mindset is important for wanting to begin and commit to trauma therapy and will help you get the most benefit from treatment.'

const WHAT_TO_EXPECT = `Trauma therapy — here’s the deal.

The first few sessions are about building trust, asking about what’s going on and what you actually want out of this — and yeah, you’ll dig into how your thoughts, feelings, and past stuff connect.

You’ll feel a mix of things. Relief, because someone’s actually listening without judging you. Tired, because processing heavy stuff takes energy. Uncomfortable sometimes — that’s normal, not a sign something is wrong; it means the process is working.

You set the pace — you don’t have to spill everything on day one. Just be honest as you go, and speak up if something’s not working.

Your therapist will teach you skills that are proven to actually work. No single skill fixes everything, but the more tools you have, the more ready you’ll be for whatever comes your way.`

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

// ---------- Playable characters ----------
const PLAYABLE = [
  {
    src: `${ART}/avatar-construct.webp`,
    name: 'The Construct',
    blurb: 'Stone and warm light, quietly unstoppable.',
  },
  {
    src: `${ART}/avatar-creature.webp`,
    name: 'The Creature',
    blurb: 'Small and curious, with a lantern for a tail.',
  },
  {
    placeholder: true,
    name: 'The Traveler',
    blurb: 'Redesign in progress.',
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
      { title: 'Getting the best trauma therapy', duration: '~90 sec', script: TIPS },
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
      { title: 'What to Expect from Therapy', duration: '~60 sec', script: WHAT_TO_EXPECT },
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
      text: 'Underwater flight — use the Oxygen Mask you earned; collect air bubbles to keep it full and dodge underwater obstacles.',
      pending: true,
      underwater: true,
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

      {/* C. Playable Characters */}
      <section className="mb-10">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-2">
          Playable Characters
        </h2>
        <p className="text-[13px] text-slate-500 italic mb-4 max-w-[760px]">
          The traveler the participant chooses to become for the climb.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[640px]">
          {PLAYABLE.map((c) => (
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

      {/* Exposition — the opening that sets up the world (placeholder) */}
      <section className="mb-8">
        <h3 className="text-[18px] font-bold text-slate-800">Exposition</h3>
        <p className="text-[13px] text-slate-500 mb-3">
          The opening that sets up the world, before Zone 1.
        </p>
        <div className="bg-white rounded-2xl shadow-card p-5 border-2 border-dashed border-slate-200">
          <div className="mb-3">
            <Pill icon={HardHat}>In development</Pill>
          </div>
          <p className="text-[14px] text-slate-700 leading-relaxed">
            We need an introduction that sets up the game: What is this place?
            What are they doing here? And why are these creatures telling me
            about trauma?
          </p>
        </div>
      </section>

      {ZONES.map((z) => (
        <ZoneSection key={z.n} zone={z} />
      ))}
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

// Image card (playable characters). Handles a dashed placeholder when the
// art isn't ready yet.
function ArtCard({ src, name, blurb, placeholder }) {
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
        <img src={src} alt={name} loading="lazy" className="w-full h-auto rounded-xl mb-3" />
      )}
      <figcaption className="flex-1">
        <h4 className="text-[14px] font-semibold text-slate-800 leading-tight">{name}</h4>
        {blurb && <p className="text-[12px] text-slate-600 leading-relaxed mt-1.5">{blurb}</p>}
      </figcaption>
    </figure>
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
                  to="/gains-demo/traversal"
                  className="inline-flex items-center gap-2 bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white font-semibold rounded-full px-4 py-2 min-h-[40px] text-[13px]"
                >
                  <Play size={14} strokeWidth={2} />
                  Play the traversal prototype
                </Link>
              </>
            ) : t.end ? (
              <p>{t.text}</p>
            ) : (
              <>
                <div className="mb-1.5">
                  <Pill icon={t.underwater ? Waves : HardHat}>In development</Pill>
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
