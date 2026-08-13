// Cast data for the /demo "Meet the cast" section (Draft 22, 2026-06-03).
//
// Previews Holly's video script (Script 2.0) before animation: each
// character card shows a small photo and a role line.
//
// Draft 52 (2026-07-16): a full-assembly video preview now renders at the
// TOP of the Sam's Story area on /demo (above these cast cards) — the
// first assembled Sam's Story cut (Male variant, YouTube embed). That
// featured section lives in DemoPage.jsx, not here; this note is just
// draft-context bookkeeping.
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
// /demo sections (Draft 35; array form since Draft 42 so a card could
// appear in multiple sections at once — no current card does):
//   - `'sams-story'` — the narrative-video cast (Holly's Script 2.0): five
//     Sam variants — Sam (18 years old), Sam (Female) and Sam (Female, 14
//     years old), Sam (Gender Neutral), and Sam (14 years old). (Sam
//     Female's image is LOCKED as of Draft 56 B (2026-07-28): a single
//     composite — V1 face/jawline + V2 skin tone + V1 softer hair, per
//     the 2026-07-27 meeting — renders on the card; the earlier Draft
//     50 B "pick between" candidates and the Draft 48 images are retired
//     to disk-only. Foster Mom, Foster Dad, and Mrs. Johnson were
//     retired 2026-08-13 — the dining-table scene (Foster Mom/Dad) is
//     fully covered by the assembled Sam's Story video above this
//     section, and Josh wanted the section trimmed to just the Sam
//     variants. Sam variants' voice-sample audio was removed the same
//     day for the same reason: the finished Sam's Story video supersedes
//     it. The closing Family Photo was removed the same day too.)
//   - `'learning-skills'` — the psychoeducation track that wraps the six
//     activities (Adrienne's script; Kai narrates). Used to carry a
//     single Kai card (photo + all 8 scenes of narrator audio); retired
//     2026-08-13 once all 8 scenes existed as finished video — the
//     Learning Skills for Belonging section on /demo now renders those
//     videos directly (see LEARNING_SKILLS_CARDS in DemoPage.jsx) instead
//     of pulling from CAST, so no card currently carries this tag.
//   (The `'proposed-alternative'` exploration section from Drafts 42/44
//   was retired 2026-07-10 after its cards graduated into the two
//   sections above.)
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
// A card can carry one content shape, in precedence order — none of the
// current cast cards use `videos`, `voiceSamples`, `lines`, `scenes`, or
// `description` as of the 2026-08-13 cast cleanup (Kai's 8 narrator-audio
// scenes, Foster Mom/Dad, Mrs. Johnson, and all Sam-variant voice samples
// were retired once the psychoeducation track and Sam's Story existed as
// finished video); the shapes stay documented here for whenever new cast
// content needs them:
//   - `videos`: [{ src | youtubeId, caption, label? }, ...] — one or
//     more rendered video shots. Per entry: `src` = self-hosted mp4
//     (native <video>, no overlay chrome) OR `youtubeId` = YouTube Short
//     embed (mutually exclusive); `caption` = the spoken line verbatim;
//     `label` = optional section heading for the first shot in a group.
//   - `voiceSamples`: [{ label, src }] — labeled audio-only voice-model
//     previews, rendered as native <audio> players. Renders ABOVE any
//     lines/scenes content.
//   - `lines`: [{ scene, text, audio? }] — scripted lines. `audio` is
//     optional: a line with an ElevenLabs sample renders an <audio>
//     player; a line without one renders a "Voice model coming soon"
//     note — unless the card also has `voiceSamples`.
//   - `scenes`: [{ label, audio, text?, duration?, durationSeconds?,
//     handoff?, description? }, ...] — longer-form narrator audio
//     organized by scene rather than per-line. `text` is the full spoken
//     script printed alongside the clip; `duration` (e.g. "0:51") +
//     `durationSeconds` (51) show the length and sum to a total runtime;
//     `handoff` names the activity the scene hands off to. Each renders
//     as label + duration/handoff + text + native <audio>.
//   - `description`: a paragraph for characters who don't speak yet.

export const CAST = [
  {
    // id + asset filenames stay `sam-16` — internal identifiers, not
    // user-visible. Only the display strings age the character up to 18
    // (Draft 42, 2026-07-01): a design decision to read as a young adult
    // with more distance from adolescence. Holly's Script 2.0 still
    // narratively references "16-year-old Sam" internally — unchanged.
    // Paired with Sam (14) below in the 2-up grid (2026-08-13).
    id: 'sam-16',
    shows: ['sams-story'],
    name: 'Sam (18 years old)',
    image: '/cast/images/sam-16.png',
    alt: 'Sam at 18 — the narrator, four years later',
    role: 'Our narrator — Sam four years later.',
  },
  {
    id: 'sam-14',
    shows: ['sams-story'],
    name: 'Sam (14 years old)',
    image: '/cast/images/sam-14.png',
    alt: 'Sam at 14 — the 14-year-old version of the main character',
    role: 'The 14-year-old version — at the heart of every flashback.',
    // Sam 14 image is landscape (2304×1296) — crop to a gentle ~4:3 so
    // faces stay centered (see `landscape` flag, handled in the view).
    landscape: true,
  },
  {
    // Sam (Female) — Draft 48, 2026-07-10. Completes the three-variant
    // Sam 18 set (Male / Female / Gender Neutral). Paired with Sam
    // (Female) — 14 years old below in the 2-up grid (2026-08-13).
    id: 'sam-female',
    shows: ['sams-story'],
    name: 'Sam (Female)',
    alt: 'Sam, female variant — 18-year-old young woman narrator, same character as Sam Male',
    // Draft 56 B (2026-07-28): Female Sam is now LOCKED as a single
    // composite — Version 1's face/jawline + Version 2's skin tone +
    // Version 1's softer hair, per the team decision at the 2026-07-27
    // meeting. Replaces the two Draft 50 B "pick between" candidates
    // (sam-female-v2-version-1/2.png) and the Draft 48 files
    // (sam-female-variant-1*.png), all of which stay on disk unreferenced.
    image: '/cast/images/sam-female-v3.png',
    role: 'The female variant of Sam — now locked as a single composite (Version 1 face/jawline + Version 2 skin tone + Version 1 softer hair, per the 2026-07-27 meeting).',
  },
  {
    // Sam (Female) — 14 years old. Added 2026-08-13, moved down from the
    // weekly review section (Draft 61) now that it has a permanent home
    // paired next to the Sam (Female) adult card above.
    id: 'sam-female-14',
    shows: ['sams-story'],
    name: 'Sam (Female) — 14 years old',
    image: '/cast/images/sam-female-14.png',
    alt: 'Sam, female variant — 14-year-old, the younger companion to the adult female narrator',
    role: 'The 14-year-old female variant of Sam — the younger companion to the adult female narrator.',
  },
  {
    // Sam (Gender Neutral) — promoted out of Proposed Alternative Cast
    // (Draft 46, 2026-07-10). Design reuses the blonde Kai Variant 2
    // visual, differentiating from dark-haired Sam Male.
    id: 'sam-nonbinary',
    shows: ['sams-story'],
    name: 'Sam (Gender Neutral)',
    image: '/cast/images/kai-variant-2.png',
    alt: 'Sam, gender-neutral variant',
    role: 'The gender-neutral variant of Sam — same character, different presentation. Character design reuses the current Kai visual (blonde).',
  },
]
