// Cast data for the /demo "Meet the cast" section (Draft 22, 2026-06-03).
//
// Previews Holly's video script (Script 2.0) before animation: each
// character card shows an image, a role line, and either a list of
// scripted lines with ElevenLabs voice samples, or a description
// paragraph for characters who don't speak in Script 2.0 yet.
//
// Assets live in /public/cast/ (served as static files, referenced by
// absolute URL — NOT imported through Vite, since there are a lot of
// them and they're large media). Images: /cast/images/*.png. Audio:
// /cast/audio/*.mp3.
//
// Line text is verbatim from `Video Content/Character_Profiles.docx`.
// Scene cues are the per-line stage directions from the same doc.
//
// Every card carries a `shows` array placing it in one or more parallel
// /demo sections (Draft 35; array form since Draft 42 so a card can
// appear in multiple sections — Sam 18 + Sam 14 render in both their
// home section and the proposed-alternative section):
//   - `'sams-story'` — the narrative-video cast (Holly's Script 2.0):
//     Sam 18 (formerly presented as 16), Sam 14, Foster Mom, Foster Dad,
//     Mrs. Johnson.
//   - `'learning-skills'` — the psychoeducation track that wraps the six
//     activities (Adrienne's script): Kai.
//   - `'proposed-alternative'` — Draft 42's "Proposed Alternative Cast"
//     section, for team review only (not shipping). Reuses Sam 18 + Sam
//     14, plus four new-or-repurposed cards: a nonbinary Sam variant
//     (reusing Kai's current Variant 1 image), a female Sam placeholder
//     (`placeholder: true`, no build yet), and two proposed peer-mentor
//     Kai identities (male / female, early-20s Black young adult).
//
// Image shape (one of):
//   - `image` (string) — single character image (most cards).
//   - `images`: [{ label, src, alt }, ...] — multiple design variants
//     rendered side-by-side with captions (Kai). When present, `image`
//     is ignored.
//   - `placeholder: true` — no image yet; the image column renders a
//     dashed-outline "Coming soon" silhouette instead (Draft 42, Sam —
//     Female). Takes precedence over `image`/`images` when set.
//
// A card can carry one content shape, in precedence order:
//   - `videos`: [{ src | youtubeId, caption, label? }, ...] — one or
//     more rendered Sam's Story shots (Sam 16). Per entry: `src` =
//     self-hosted mp4 (native <video>, no overlay chrome) OR `youtubeId`
//     = YouTube Short embed (mutually exclusive); `caption` = the spoken
//     line verbatim; `label` = optional section heading for the first
//     shot in a group.
//   - `voiceSamples`: [{ label, src }] — labeled audio-only voice-model
//     previews, rendered as native <audio> players. Sam 16 + Sam 14 use
//     this to demo the locked Brayden voice (Voice Changer pipeline
//     locked 2026-06-24). Renders ABOVE any lines/scenes content.
//   - `lines`: [{ scene, text, audio? }] — scripted lines. `audio` is
//     optional: a line with an ElevenLabs sample renders an <audio>
//     player (Foster Mom); a line without one renders a "Voice model
//     coming soon" note — unless the card also has `voiceSamples`.
//   - `scenes`: [{ label, audio, text?, duration?, durationSeconds?,
//     handoff?, description? }, ...] — longer-form narrator audio
//     organized by scene rather than per-line (Kai). `text` (new
//     2026-06-30, Draft 40) is the full spoken script printed alongside
//     the clip; `duration` (e.g. "0:51") + `durationSeconds` (51) show the
//     length and sum to the total runtime; `handoff` names the activity
//     the scene hands off to. Kai now carries all 8 final voiceover scenes
//     (total runtime 6:27); `description` is unused on Kai's scenes (the
//     duration + handoff display directly) but other cards may still use
//     it. Each renders as label + duration/handoff + text + native <audio>.
//   - `description`: a paragraph for characters who don't speak yet
//     (Foster Dad, Mrs. Johnson).
// Sam 16's card currently previews the locked Brayden voice across all
// narrator lines via a single audio sample. The four Draft 31 mp4s
// remain at /cast/video/sam-16-line-*.mp4 but are no longer referenced —
// they'll return re-rendered with Brayden audio under the speech-first
// pipeline. The seven older audio scratch clips at
// /cast/audio/sam-16-line-*.mp3 are also still in place, unreferenced.

export const CAST = [
  {
    // id + asset filenames stay `sam-16` — internal identifiers, not
    // user-visible. Only the display strings age the character up to 18
    // (Draft 42, 2026-07-01): a design decision to read as a young adult
    // with more distance from adolescence. Holly's Script 2.0 still
    // narratively references "16-year-old Sam" internally — unchanged.
    id: 'sam-16',
    shows: ['sams-story', 'proposed-alternative'],
    name: 'Sam (18 years old)',
    image: '/cast/images/sam-16.png',
    alt: 'Sam at 18 — the narrator, four years later',
    role: 'Our narrator — Sam four years later.',
    // Brayden-voiced "Older Sam" voice-model demo (all narrator lines
    // stitched). Voice pipeline locked 2026-06-24 (Josh records →
    // ElevenLabs Voice Changer → Brayden = Sam). Replaced the four Draft
    // 31 video clips (Line 1 + Line 3 shots) — the team's feedback was
    // about the voices, so we surface only the new locked voice; the
    // videos return later re-rendered with Brayden audio. The four mp4s
    // remain at /cast/video/sam-16-line-*.mp4, unreferenced for now.
    voiceSamples: [
      {
        label: 'New Older Sam Voice Model — All Lines',
        src: '/cast/audio/older-sam-narrator.mp3',
      },
    ],
  },
  {
    id: 'sam-14',
    shows: ['sams-story', 'proposed-alternative'],
    name: 'Sam (14 years old)',
    image: '/cast/images/sam-14.png',
    alt: 'Sam at 14 — the 14-year-old version of the main character',
    role: 'The 14-year-old version — at the heart of every flashback.',
    // Sam 14 image is landscape (2304×1296) — crop to a gentle ~4:3 so
    // faces stay centered (see `landscape` flag, handled in the view).
    landscape: true,
    // Brayden-voiced Sam 14 demo (both lines stitched), via the same
    // Voice Changer pipeline as Sam 16 (locked 2026-06-24). Supersedes
    // the per-line "Voice model coming soon" notes — the voice model is
    // ready now. `lines` stays for scene-cue + verbatim context under the
    // sample. Source is WAV (no ffmpeg on hand to convert; small + all
    // browsers play it).
    voiceSamples: [
      {
        label: 'New Sam 14 Voice Model — Both Lines',
        src: '/cast/audio/sam-14-voice-sample.wav',
      },
    ],
    lines: [
      {
        scene: 'Inner monologue voice-over (the moment after the adoption question)',
        text: 'How do I feel about that? I have literally no idea.',
      },
      {
        scene: 'At the dining table (becomes angry, before leaving)',
        text: 'You aren’t my parents and you never will be.',
      },
    ],
  },
  {
    id: 'foster-mom',
    shows: ['sams-story'],
    name: 'Foster Mom',
    image: '/cast/images/foster-mom.png',
    alt: 'Foster Mom — the spark in the foster home',
    role: 'The spark in the foster home.',
    lines: [
      {
        audio: '/cast/audio/foster-mom-line-1.mp3',
        scene: 'At the dining table (excited, happy voice — the cold open of the script)',
        text:
          'Sam, you’ve been in our foster home for two years now and we really want you to be an official part of this family. How would you feel about us adopting you?',
      },
    ],
  },
  {
    id: 'foster-dad',
    shows: ['sams-story'],
    name: 'Foster Dad',
    image: '/cast/images/foster-dad.png',
    alt: 'Foster Dad — the anchor to Foster Mom’s spark',
    role: 'The anchor to Foster Mom’s spark.',
    description:
      'No spoken lines in Script 2.0. Foster Dad is present at the dining-table scene alongside Foster Mom and 14-year-old Sam; the script describes his body language as solid, steady, and supportive — the still half of the conversation. If a line is added in a later revision (for example, an exchange with Foster Mom after Sam walks away), it would slot into the post-rejection beat.',
  },
  {
    id: 'mrs-johnson',
    shows: ['sams-story'],
    name: 'Mrs. Johnson',
    image: '/cast/images/mrs-johnson.png',
    alt: 'Mrs. Johnson — Sam’s teacher and the catalyst for change',
    role: 'Sam’s teacher and the catalyst for change.',
    description:
      'No directly quoted lines in Script 2.0. Mrs. Johnson is referenced in 16-year-old Sam’s voice-over as the teacher who suggested he join the backstage crew of the school musical — the invitation that becomes the turning point in the story. If her own dialogue is added in a later revision (for example, the moment where she invites Sam to join the crew), it would slot into the school / hallway scene before Sam’s decision to try it.',
  },
  {
    // Kai — narrator for the "Learning Skills for Belonging"
    // psychoeducation track wrapping the six activities (Adrienne's
    // script, 2026-06-04). Multi-variant design images + scene-organized
    // audio (longer-form than Sam's per-line shape). Two scenes recorded
    // so far of eight; same Voice Changer pipeline as Sam.
    id: 'kai',
    shows: ['learning-skills'],
    name: 'Kai',
    alt: 'Kai — the narrator for Learning Skills for Belonging',
    images: [
      {
        label: 'Variant 1',
        src: '/cast/images/kai-variant-1.png',
        alt: 'Kai, character design variant 1',
      },
      {
        label: 'Variant 2',
        src: '/cast/images/kai-variant-2.png',
        alt: 'Kai, character design variant 2',
      },
    ],
    role: 'Our narrator for the psychoeducation track — a gender-neutral young adult, foster-care alumni, now working as a peer mentor for kids in the system.',
    // First animated clip (Draft 41, 2026-06-30). Self-hosted 9:16 mp4,
    // same pattern as Sam's Story shots. Renders as a featured block above
    // the voiceover scenes. As more scenes are animated they extend this
    // array.
    videos: [
      {
        label: 'First animated scene preview',
        src: '/cast/video/kai-demo-1.mp4',
        caption:
          'The opening of Scene 1 — The Scan. Covers the first ~35 seconds. The rest of the animation is in production.',
        durationSeconds: 35,
      },
    ],
    scenes: [
      {
        label: 'Part I, Scene 1 — The Scan',
        audio: '/cast/audio/kai-pt1-scene-1-the-scan.mp3',
        duration: '0:51',
        durationSeconds: 51,
        handoff: 'Self-Reflection',
        text: "Hey. I'm Kai. I spent time in foster care too, so I know the drill. Now, I get to help other kids in the system and share some of the life hacks I've picked up. I'm glad you're here, because we're talking about something we all deal with 24/7: Belonging. Think about that moment when you walk into a crowded cafeteria or a new class. You're scanning the room, right? Your brain is doing a million calculations per second: Who looks cool? Who looks mean? Where's my spot? That \"scan\" isn't you being awkward — it's actually your brain trying to protect you. It's looking for safety, connection, and a place to land. Because let's be real: feeling like you don't fit in is more than just a bummer. It actually hurts. It can be confusing, lonely, and make it hard to know who you even are. Let's take a minute to think about this some more.",
      },
      {
        label: "Part I, Scene 2 — The Why (It's in Your DNA)",
        audio: '/cast/audio/kai-pt1-scene-2-the-why.mp3',
        duration: '0:35',
        durationSeconds: 35,
        handoff: 'Who I Am Poem',
        text: "So, why are our brains so obsessed with fitting in? Basically, belonging isn't just a \"nice to have\" type of thing — it's a survival requirement, right up there with food, sleep, and having a roof over your head. Back in the day, being part of a group meant you didn't go hungry or get eaten by a saber-toothed tiger. Today, it's still wired into our biology. We need to feel accepted, respected, and \"seen\" for who we actually are — including our culture, our history, and where we come from. This activity can help you think about some of these things.",
      },
      {
        label: 'Part I, Scene 3 — Building a Safety Net',
        audio: '/cast/audio/kai-pt1-scene-3-safety-net.mp3',
        duration: '1:19',
        durationSeconds: 79,
        handoff: 'Allies / Safety Net',
        text: "We know belonging is a basic need, but here's the secret: you don't just need one place to belong. You need a few. Think of it like a safety net. If one string snaps — like after a fight with a friend — the other strings catch you. We need this safety net because it provides different types of support for us to change and grow, providing the \"green light\" to try new things. It's a lot easier to take risks, like joining a team or trying out for a play, when you know you've got a crew behind you — both in and outside of your home. One thing that can really help is having an adult that you can talk to or trust for advice. In high school, I had this one teacher who actually \"got\" me, and it changed the whole vibe of a really tough year because I could count on her for emotional and practical support. Social support is important too. You've probably noticed that your friend group matters way more these days. When building your crew, think of it like a GPS. If you hang with a group that's constantly in trouble or giving up on school, it's easy to get redirected down that same path. But if you find people who are hyped about your goals? They become your literal social support system, helping you figure it out along the way. It's good to think about who you are and what kind of safety net you might need. This next activity will help you do that.",
      },
      {
        label: 'Part I, Scene 4 — The Foster Care "Extra Level"',
        audio: '/cast/audio/kai-pt1-scene-4-extra-level.mp3',
        duration: '0:40',
        durationSeconds: 40,
        text: "Look, everyone struggles with figuring out where they belong at times, but for those of us growing up in foster or relative care? It's like playing the Belonging Game on \"Hard Mode.\" While other kids are just worried about where to sit in the cafeteria, we're dealing with moving houses, switching schools, or leaving our siblings and old neighborhoods behind. It's stressful. Sometimes you feel guilty for liking a new placement — like you're being disloyal to your family. Or you feel like you can't fully trust anyone because you've had to move so many times. I know it's tough, but these strategies we're learning can help you find your people and begin to feel more at home — no matter where you're living.",
      },
      {
        label: 'Part II, Scene 1 — Building Skills for Belonging',
        audio: '/cast/audio/kai-pt2-scene-1-building-skills.mp3',
        duration: '1:09',
        durationSeconds: 69,
        handoff: 'Belonging Skills Sort',
        text: "Belonging isn't just a place you land; it's something you build, brick by brick, with the people around you — whether that's a foster family, friends, teammates or others. Here are a few skills that help. When others talk, try Active Listening. Don't just wait for your turn to speak; actually try to catch what they're saying. It makes people feel understood and safe. When things get tense, aim for Conflict Resolution. It's not about winning; it's about solving the problem in a way that the relationship survives the argument. Try to use Inclusive Language like we, us, and our group, and include others in conversations and activities. Take a risk and invite others to join you, and chances are they will want to return the favor! Finally, Provide Support by being the person who shows up when a friend or family member needs help, and being brave enough to Express Gratitude can build emotional bridges between you and your friends and family. I know, it might feel cringe at first, but these efforts reinforce that others matter to you and can deepen our bonds. This next activity can help you think about how to use these skills.",
      },
      {
        label: 'Part II, Scene 2 — The Roadblocks',
        audio: '/cast/audio/kai-pt2-scene-2-roadblocks.mp3',
        duration: '0:31',
        durationSeconds: 31,
        handoff: 'Getting Unstuck',
        text: "Sometimes belonging feels impossible because of things you can't control, like switching schools mid-year. When you hit those roadblocks, your brain might try to protect you with some unhelpful thoughts. For example: All-or-Nothing Thinking — having thoughts like \"I'll never fit in here\" that keep you from trying to connect to others. Or Holding onto the Past — staying so focused on thinking about who we lost that we can't let anyone new in. This next activity will help you learn to challenge unhelpful thoughts like these.",
      },
      {
        label: 'Part II, Scene 3 — Putting It All Together',
        audio: '/cast/audio/kai-pt2-scene-3-putting-it-all-together.mp3',
        duration: '1:06',
        durationSeconds: 66,
        handoff: 'Letter to Another Youth',
        text: "And another potential roadblock? Self-Regulation or Self-Control. The challenge is to be able to feel that sting of \"maybe they don't like me\" and being able to breathe through it so you don't just bail or shut down when things get awkward or scary. My friend Ash used to go silent every time she moved homes because she thought, \"they're just going to move me again anyway.\" Her silence was like a shield that's too heavy — it kept her safe from getting hurt, but it also kept her totally alone. Do you have some good strategies to keep calm at these moments? We can give you a list of skills to practice if you need ideas. And finally, it helps to realize that a lot of belonging happens in our own heads. Instead of a fixed mindset, try a growth mindset. Making friends and connections is a skill you practice, not something you're just born with. If one placement or social situation doesn't work out, it's not a permanent fail — it's just one data point and we can keep working on it. Now that you've learned more about this, what might you tell another kid worried about whether they belong?",
      },
      {
        label: 'Conclusion',
        audio: '/cast/audio/kai-conclusion.mp3',
        duration: '0:16',
        durationSeconds: 16,
        text: "Finding that sense of belonging can be tough for everyone, and it's even harder when you are in foster or relative care. But remember: your story isn't over just because the current chapter has been a little chaotic. You've got new skills now — give them a try!",
      },
    ],
  },

  // ---------- Proposed Alternative Cast (Draft 42, 2026-07-01) ----------
  // For team review only — not shipping yet. Reimagines Kai's identity
  // design: the current Kai V1 image gets repositioned as a nonbinary Sam
  // variant, and two new peer-mentor Kai concepts are proposed with more
  // specific identities. Sam 18 + Sam 14 (above) also carry
  // 'proposed-alternative' in their `shows` so they render here again for
  // side-by-side comparison.
  {
    id: 'sam-nonbinary',
    shows: ['proposed-alternative'],
    name: 'Sam — Gender Neutral',
    image: '/cast/images/kai-variant-2.png',
    alt: 'Sam, nonbinary variant — proposed character-design reuse of the current Kai (Variant 2, blonde)',
    role: "Sam's nonbinary variant. Uses the character design currently in the Kai role — the gender-neutral design fits precisely here.",
  },
  {
    id: 'sam-female-placeholder',
    shows: ['proposed-alternative'],
    name: 'Sam — Female',
    placeholder: true,
    alt: 'Sam, female variant — coming soon placeholder',
    role: 'The female Sam variant. Character build not yet started.',
  },
  {
    id: 'kai-man-alternative',
    shows: ['proposed-alternative'],
    name: 'Kai — Male (proposed)',
    image: '/cast/images/kai-man.png',
    alt: 'Kai, proposed male variant — early-20s Black young man peer mentor',
    role: 'Proposed peer-mentor Kai — an early-20s Black young man. Foster-care alumni, now working with kids in the system.',
    voiceSamples: [
      {
        label: 'Voice sample',
        src: '/cast/audio/kai-man-voice-sample.mp3',
      },
    ],
  },
  {
    id: 'kai-woman-alternative',
    shows: ['proposed-alternative'],
    name: 'Kai — Female (proposed)',
    image: '/cast/images/kai-woman.png',
    alt: 'Kai, proposed female variant — early-20s Black young woman peer mentor',
    role: 'Proposed peer-mentor Kai — an early-20s Black young woman. Foster-care alumni, now working with kids in the system.',
    voiceSamples: [
      {
        label: 'Voice sample',
        src: '/cast/audio/kai-woman-voice-sample.mp3',
      },
    ],
  },
]

export const FAMILY_PHOTO = {
  image: '/cast/images/family-photo.png',
  alt: 'Sam with his foster family',
  caption: 'Sam and his foster family, after the realization.',
}
