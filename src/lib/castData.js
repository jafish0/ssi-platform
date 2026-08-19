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
//   - `'sams-story'` — retired (Draft 90, 2026-08-19). The five character-
//     design Sam variants that carried this tag (18yo, 14yo, Female,
//     Female 14yo, Gender Neutral) are gone from CAST entirely — Sam's
//     Story on /demo now renders finished narrative VIDEOS by variant
//     (ReviewCard, in DemoPage.jsx) as each cut clears review, rather
//     than character-design preview cards from here. No card currently
//     carries this tag; kept as documentation in case a future variant
//     needs a pre-video design-preview card again.
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

// Empty as of Draft 90 (2026-08-19) — the last cards standing (the five
// Sam's Story character-design variants) graduated to finished-video
// ReviewCards in DemoPage.jsx and were removed from here. Still exported
// (and still imported by IRBPreviewPage.jsx) so nothing needs the file
// deleted; the shape documentation above stays for whenever new
// pre-video cast content needs a home again.
export const CAST = []
