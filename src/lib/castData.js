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
// A card can carry one of three content shapes, in precedence order:
//   - `video`: { youtubeId, caption } — an embedded YouTube Short of a
//     rendered Sam's Story shot (Sam 16, as of Draft 29 2026-06-12).
//   - `lines`: [{ scene, text, audio? }] — scripted lines. `audio` is
//     optional: a line with an ElevenLabs sample renders an <audio>
//     player (Foster Mom); a line without one renders a "Voice model
//     coming soon" note (Sam 14, since 2026-06-12).
//   - `description`: a paragraph for characters who don't speak in
//     Script 2.0 yet (Foster Dad, Mrs. Johnson).
// Sam 16's card now previews the first rendered Sam's Story shot (the
// bedroom opening-narration beat) via YouTube Short; its seven audio
// scratch clips at /cast/audio/sam-16-line-*.mp3 are left in place but
// no longer referenced.

export const CAST = [
  {
    id: 'sam-16',
    name: 'Sam (16 years old)',
    image: '/cast/images/sam-16.png',
    alt: 'Sam at 16 — the narrator, two years later',
    role: 'Our narrator — Sam two years later.',
    video: {
      youtubeId: 'q7QwX79vtEA',
      caption: "Opening narration — the first scene of Sam's Story.",
    },
  },
  {
    id: 'sam-14',
    name: 'Sam (14 years old)',
    image: '/cast/images/sam-14.png',
    alt: 'Sam at 14 — the 14-year-old version of the main character',
    role: 'The 14-year-old version — at the heart of every flashback.',
    // Sam 14 image is landscape (2304×1296) — crop to a gentle ~4:3 so
    // faces stay centered (see `landscape` flag, handled in the view).
    landscape: true,
    // Audio scratch clips removed 2026-06-12 — a line with no `audio`
    // renders a "Voice model coming soon" note instead of a player.
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
    name: 'Foster Dad',
    image: '/cast/images/foster-dad.png',
    alt: 'Foster Dad — the anchor to Foster Mom’s spark',
    role: 'The anchor to Foster Mom’s spark.',
    description:
      'No spoken lines in Script 2.0. Foster Dad is present at the dining-table scene alongside Foster Mom and 14-year-old Sam; the script describes his body language as solid, steady, and supportive — the still half of the conversation. If a line is added in a later revision (for example, an exchange with Foster Mom after Sam walks away), it would slot into the post-rejection beat.',
  },
  {
    id: 'mrs-johnson',
    name: 'Mrs. Johnson',
    image: '/cast/images/mrs-johnson.png',
    alt: 'Mrs. Johnson — Sam’s teacher and the catalyst for change',
    role: 'Sam’s teacher and the catalyst for change.',
    description:
      'No directly quoted lines in Script 2.0. Mrs. Johnson is referenced in 16-year-old Sam’s voice-over as the teacher who suggested he join the backstage crew of the school musical — the invitation that becomes the turning point in the story. If her own dialogue is added in a later revision (for example, the moment where she invites Sam to join the crew), it would slot into the school / hallway scene before Sam’s decision to try it.',
  },
]

export const FAMILY_PHOTO = {
  image: '/cast/images/family-photo.png',
  alt: 'Sam with his foster family',
  caption: 'Sam and his foster family, after the realization.',
}
