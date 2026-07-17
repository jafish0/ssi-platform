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
import { HardHat, Image as ImageIcon } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'

export const GAINS_FEEDBACK_SECTIONS = [
  { value: 'pre-post', label: 'Pre/Post Measures & Consent' },
  { value: 'activities', label: 'Activities' },
  { value: 'concept-art', label: 'Concept Art' },
  { value: 'pitch', label: 'The pitch (written)' },
  { value: 'general', label: 'General / whole page' },
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
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-3">
          Activities
        </h2>
        <InDevelopmentCard
          label="Activities in development."
          note="As activities are built they'll appear here as launchable sandbox cards, the same way the Ready for Roots demo works."
        />
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

        {/* Narrator — art coming */}
        <h3 className="text-[16px] font-semibold text-slate-800 mb-1">The narrator</h3>
        <div className="max-w-[360px]">
          <div className="bg-white rounded-2xl shadow-card p-4">
            <div
              role="img"
              aria-label="The narrator — art coming soon"
              className="w-full aspect-[9/16] max-h-[280px] bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 mb-3"
            >
              <ImageIcon size={28} strokeWidth={1.5} className="mb-2 opacity-50" />
              <span className="text-sm italic">Art coming</span>
            </div>
            <h4 className="text-[15px] font-semibold text-slate-800">The Narrator</h4>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Concept art in progress.
            </p>
          </div>
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
