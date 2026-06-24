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
// Every card carries a `show` field placing it in one of two parallel
// /demo sections (Draft 35):
//   - `show: 'sams-story'` — the narrative-video cast (Holly's Script
//     2.0): Sam 16, Sam 14, Foster Mom, Foster Dad, Mrs. Johnson.
//   - `show: 'learning-skills'` — the psychoeducation track that wraps
//     the six activities (Adrienne's script): Kai.
//
// Image shape (one of):
//   - `image` (string) — single character image (most cards).
//   - `images`: [{ label, src, alt }, ...] — multiple design variants
//     rendered side-by-side with captions (Kai). When present, `image`
//     is ignored.
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
//   - `scenes`: [{ label, audio, description? }, ...] — longer-form
//     narrator audio organized by scene rather than per-line (Kai). Each
//     renders as label + optional description + native <audio>.
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
    id: 'sam-16',
    show: 'sams-story',
    name: 'Sam (16 years old)',
    image: '/cast/images/sam-16.png',
    alt: 'Sam at 16 — the narrator, two years later',
    role: 'Our narrator — Sam two years later.',
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
    show: 'sams-story',
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
    show: 'sams-story',
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
    show: 'sams-story',
    name: 'Foster Dad',
    image: '/cast/images/foster-dad.png',
    alt: 'Foster Dad — the anchor to Foster Mom’s spark',
    role: 'The anchor to Foster Mom’s spark.',
    description:
      'No spoken lines in Script 2.0. Foster Dad is present at the dining-table scene alongside Foster Mom and 14-year-old Sam; the script describes his body language as solid, steady, and supportive — the still half of the conversation. If a line is added in a later revision (for example, an exchange with Foster Mom after Sam walks away), it would slot into the post-rejection beat.',
  },
  {
    id: 'mrs-johnson',
    show: 'sams-story',
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
    show: 'learning-skills',
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
    scenes: [
      {
        label: 'Scene 1 — The Scan',
        audio: '/cast/audio/kai-scene-1-the-scan.mp3',
        description: '≈ 1:00. Opens the journey, hands off to Self-Reflection.',
      },
      {
        label: 'Scene 2 — The Why (It’s in Your DNA)',
        audio: '/cast/audio/kai-scene-2-the-why.mp3',
        description: '≈ 0:45. Why belonging matters. Hands off to Who I Am Poem.',
      },
    ],
  },
]

export const FAMILY_PHOTO = {
  image: '/cast/images/family-photo.png',
  alt: 'Sam with his foster family',
  caption: 'Sam and his foster family, after the realization.',
}
