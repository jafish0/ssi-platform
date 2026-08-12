# Kai narration audio

Audio-only Kai narration clips (Draft 62, 2026-08-11 meeting) — replacing
three "Video Coming Soon" placeholders in Allies/Safety Net and Getting
Unstuck. Recorded by Josh and processed through the ElevenLabs Kai voice
model, then dropped into this folder at the paths below.

Referenced by `KaiNarrationPlayer` (`src/components/KaiNarrationPlayer.jsx`)
via `audioSrc="/kai-narration/<filename>.mp3"`.

Expected filenames:

- `safety-net-allies-intro.mp3` — Allies/Safety Net, before Step 1 (ally
  selection intro)
- `safety-net-inspect-intro.mp3` — Allies/Safety Net, before Step 2
  (Inspect your net)
- `getting-unstuck-strategies-intro.mp3` — Getting Unstuck, before the
  Challenge / Both-And exercise

Until a file lands at one of these paths, that spot's `<audio>` element
has nothing to load — expected until Josh drops the mp3s in. This is not
a bug and no placeholder audio should be added to work around it.
