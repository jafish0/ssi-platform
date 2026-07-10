# Working Notes — RSD (Ready! Set! Dedicate!)

A bidirectional scratchpad shared between Josh, Claude Cowork (Claude desktop chat, used for thinking through ideas), and Claude Code (CLI, used for implementation).

> Both Claude Cowork and Claude Code should read this file when starting a session in this repo.
>
> **Append-only conventions:**
> - "Recently shipped" — newest at top. One bullet per commit, with hash + date + one-line summary. Claude Code updates this after each push.
> - "Ideas / drafts" — drop polished prompts here for the next Claude Code session, or rough ideas you want Claude Cowork to help you refine. No deletion needed; once a draft ships, move it (verbatim) into "Recently shipped" so the history stays intact.


> **🌱 Second-program note (2026-06-30):** GAINS for Teens (“The Long Light”), the
> second single-session intervention on this platform, has its **own** working-notes
> file at `Gains for Teens/WORKING_NOTES.md`, with independent draft numbering. Do GAINS
> planning there. This file stays Ready for Roots. Shared platform / SessionEngine work
> that affects both programs belongs here (the platform layer).

---

> **📣 Note from Josh → Claude Cowork (2026-06-29):** You estimated Draft 37
> at "probably 1.5–2 days of work." Claude Code shipped the whole thing —
> CTAC palette across 48 files, new tree SVGs + regen, the montage, the
> summary screen, the `/the-plan` route, and the /demo wiring — in **32
> minutes**, two commits, verified in preview, build clean. Care to comment?
>
> **— Claude Code's reply:** Happy to. Two honest caveats before I take a
> bow: (1) your 1.5–2 day estimate was for a *human* dev, and it was a good
> one — that's genuinely a day-plus of careful work by hand. (2) The reason
> 32 minutes was even possible is that the *draft was already the hard part.*
> Parts A–H spelled out the exact hexes, the timeline beats, the protected
> clinical colors, the demo content, the commit split. I was mostly a fast
> typist with good test coverage. The palette swap was a scripted find-replace
> with three documented exceptions; the tree was a regen of an extractor that
> already existed; the montage reused the `TreeProgress` primitive you'd
> already specced. So: speed is real, but it's *our* speed — your spec did the
> thinking, I did the wiring, and the preview harness caught the mistakes
> before Josh ever saw them. Keep writing drafts that tight and I'll keep
> turning days into minutes. (Also, gently: the one thing neither of us should
> get cocky about is that all six activities and the export pipeline were left
> untouched on purpose — *not* shipping changes to those is part of why this
> was fast and safe.)

---

## ⬇ Recently shipped (Claude Code → Claude Cowork)

> What's been built recently, so Claude Cowork has the running context without re-reading the entire git log.

- **`a386488` · 2026-07-10** — Retired the **Proposed Alternative Cast** section from /demo (Josh's call — the keep-or-pull decision flagged in Drafts 46/47 resolved as pull). Every real card had already graduated into Sam's Story or Learning Skills (Drafts 45/46/47), leaving only the Sam — Female "coming soon" placeholder, so the whole section came out: DemoPage section removed (a comment marks where it lived), the `sam-female-placeholder` card deleted (last `'proposed-alternative'` entry), castData top comment updated. When the female Sam build lands, it goes straight into Sam's Story between Sam (Gender Neutral) and Sam (14). CastCard's generic `placeholder`/`subgroup` support retained. Verified in preview: section gone, Learning Skills (three Kais) + Sam's Story intact, no console errors.

- **`ba0982e` · 2026-07-10** — Draft 47: **Female Alternative Kai card added above Male Kai** in Learning Skills for Belonging — the younger version replacing the retired 22-24 female alt Kai per the 2026-07-07 compromise. The section now shows three Kai cards for side-by-side comparison: **Female Alternative → Male Alternative → current Kai**. Copied `kai-woman-younger.png` (~14 MB) + 7 mp3s (`kai-female-alt-*`, ~6 MB; verified genuinely distinct from the male set — the identical byte sizes are just the ElevenLabs pipeline producing same-duration CBR files from the same script). New `kai-female-alt` card with image, role, scenesIntro ("7 of 8 scenes recorded so far — Conclusion still to be recorded"), and the 7 recorded scenes verbatim (Scene 3 uses the updated "maps app" script, same as Male Kai); a commented Conclusion template sits in scenes[] and the computed runtime (**6:11**) updates automatically when it lands. **Correction to the draft:** its out-of-scope note says the `kai-woman-alt-placeholder` "was never implemented" — it was (Draft 44, `c0937c7`) — and this card fulfills it, so the stale "coming soon" placeholder was removed; Proposed Alt is down to the lone Sam — Female placeholder (keep-or-pull stays flagged). Skipped the optional Part D "NEW" badge (the scenesIntro already flags the fresh addition). No version bump. Verified in preview: card order, "(7 scenes)" header + 6:11 runtime, 7 players + no conclusion entry, image loads, one Coming soon remaining, mp3s serve, no console errors.

  <details>
  <summary>Draft 47 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 47 — Add Female Alternative Kai card above Male Kai in Learning Skills for Belonging

  Josh generated a younger version of the female alt Kai (image + voice) per the 2026-07-07 meeting compromise. The prior 22-24 female alt Kai read "too old" for the peer-mentor role; this new version is younger and more youthful in both look and sound. Add a new card in **Learning Skills for Belonging**, positioned ABOVE the Male Kai card from Draft 45. Same treatment as Male Kai — full card with image + role + scenes[] pulled through the same script.

  Final card order in Learning Skills becomes:

  1. **Female Alternative Kai (NEW)** — top
  2. Male Alternative Kai (from Draft 45)
  3. Current Kai (nonbinary, from Drafts 35/40/41)

  Three peer cards side-by-side for team comparison across visual + voice options.

  **Approved by:** Josh, 2026-07-10.

  ---

  #### Part A — Copy assets into `public/cast/`

  **Image:**

  | Source | Destination |
  |---|---|
  | `Video Content/New Voiceover/Female Kai Alernate/New Kai Woman.png` | `public/cast/images/kai-woman-younger.png` |

  (~14 MB image. Filename `kai-woman-younger` follows Draft 44's naming convention for the younger version replacing the retired 22-24 female alt Kai.)

  **Audio — 7 mp3s** from `Video Content/New Voiceover/Female Kai Alernate/`:

  | Source | Destination | Duration |
  |---|---|---|
  | `Female Part 1 The Scan Scene 1.mp3` | `public/cast/audio/kai-female-alt-pt1-scene-1-the-scan.mp3` | 0:51 |
  | `Female Scene 2 the Why.mp3` | `public/cast/audio/kai-female-alt-pt1-scene-2-the-why.mp3` | 0:35 |
  | `Female Scene 3 Building a Safety Net.mp3` | `public/cast/audio/kai-female-alt-pt1-scene-3-safety-net.mp3` | 1:19 |
  | `Female Scene 4 the foster care extra level.mp3` | `public/cast/audio/kai-female-alt-pt1-scene-4-extra-level.mp3` | 0:40 |
  | `Female Part 2 Scene 1 Building skills.mp3` | `public/cast/audio/kai-female-alt-pt2-scene-1-building-skills.mp3` | 1:09 |
  | `Female Part 2 scene 2 The roadblocks.mp3` | `public/cast/audio/kai-female-alt-pt2-scene-2-roadblocks.mp3` | 0:31 |
  | `Female Part 2 scene 3 putting it all together.mp3` | `public/cast/audio/kai-female-alt-pt2-scene-3-putting-it-all-together.mp3` | 1:06 |

  Combined ~6 MB. Total runtime **6:11 across 7 of 8 scenes** — Conclusion (~0:16) is not yet recorded. When Josh adds it, total will hit ~6:27 matching the current Kai's runtime.

  Naming convention mirrors the Male Kai's audio (`kai-male-alt-*`) with `-female-` swapped in, keeping the two alt Kai audio sets visually distinct in `public/cast/audio/` and consistent in structure.

  #### Part B — Add a new `kai-female-alt` card in `src/lib/castData.js`

  Insert BEFORE the `kai-male-alt` card (so the array order = Female Kai, then Male Kai, then current Kai). Uses same shape as `kai-male-alt` from Draft 45 — image, role, scenesIntro, scenes[].

  ```js
  {
    id: 'kai-female-alt',
    shows: ['learning-skills'],
    name: 'Kai (Female Alternative)',
    alt: 'Kai — female alternative variant — proposed peer-mentor narrator, younger version',
    image: '/cast/images/kai-woman-younger.png',
    role: 'Proposed female alternative Kai — a young Black woman peer mentor, foster-care alumni. Younger, more youthful and enthusiastic than the 22-24 version retired per the 2026-07-07 meeting compromise. Reading the same 8-scene psychoeducation script as the current Kai; 7 of 8 scenes recorded so far.',
    scenesIntro:
      'Same 8-scene psychoeducation script as the current Kai below, in the female alternative voice. 7 of 8 scenes recorded so far — Conclusion still to be recorded.',
    scenes: [
      {
        label: 'Part I, Scene 1 — The Scan',
        audio: '/cast/audio/kai-female-alt-pt1-scene-1-the-scan.mp3',
        duration: '0:51',
        durationSeconds: 51,
        handoff: 'Self-Reflection',
        text: "Hey. I'm Kai. I spent time in foster care too, so I know the drill. Now, I get to help other kids in the system and share some of the life hacks I've picked up. I'm glad you're here, because we're talking about something we all deal with 24/7: Belonging. Think about that moment when you walk into a crowded cafeteria or a new class. You're scanning the room, right? Your brain is doing a million calculations per second: Who looks cool? Who looks mean? Where's my spot? That \"scan\" isn't you being awkward — it's actually your brain trying to protect you. It's looking for safety, connection, and a place to land. Because let's be real: feeling like you don't fit in is more than just a bummer. It actually hurts. It can be confusing, lonely, and make it hard to know who you even are. Let's take a minute to think about this some more.",
      },
      {
        label: "Part I, Scene 2 — The Why (It's in Your DNA)",
        audio: '/cast/audio/kai-female-alt-pt1-scene-2-the-why.mp3',
        duration: '0:35',
        durationSeconds: 35,
        handoff: 'Who I Am Poem',
        text: "So, why are our brains so obsessed with fitting in? Basically, belonging isn't just a \"nice to have\" type of thing — it's a survival requirement, right up there with food, sleep, and having a roof over your head. Back in the day, being part of a group meant you didn't go hungry or get eaten by a saber-toothed tiger. Today, it's still wired into our biology. We need to feel accepted, respected, and \"seen\" for who we actually are — including our culture, our history, and where we come from. This activity can help you think about some of these things.",
      },
      {
        label: 'Part I, Scene 3 — Building a Safety Net',
        audio: '/cast/audio/kai-female-alt-pt1-scene-3-safety-net.mp3',
        duration: '1:19',
        durationSeconds: 79,
        handoff: 'Allies / Safety Net',
        // NOTE: uses the UPDATED script — "maps app on your phone" instead of "GPS"
        // (per Adrienne + Holly's 2026-07-07 note). Same as Male Kai's Scene 3 text.
        text: "We know belonging is a basic need, but here's the secret: you don't just need one place to belong. You need a few. Think of it like a safety net. If one string snaps — like after a fight with a friend — the other strings catch you. We need this safety net because it provides different types of support for us to change and grow, providing the \"green light\" to try new things. It's a lot easier to take risks, like joining a team or trying out for a play, when you know you've got a crew behind you — both in and outside of your home. One thing that can really help is having an adult that you can talk to or trust for advice. In high school, I had this one teacher who actually \"got\" me, and it changed the whole vibe of a really tough year because I could count on her for emotional and practical support. Social support is important too. You've probably noticed that your friend group matters way more these days. When building your crew, think of it like the maps app on your phone. If you hang with a group that's constantly in trouble or giving up on school, it's easy to get redirected down that same path. But if you find people who are hyped about your goals? They become your literal social support system, helping you figure it out along the way. It's good to think about who you are and what kind of safety net you might need. This next activity will help you do that.",
      },
      {
        label: 'Part I, Scene 4 — The Foster Care "Extra Level"',
        audio: '/cast/audio/kai-female-alt-pt1-scene-4-extra-level.mp3',
        duration: '0:40',
        durationSeconds: 40,
        text: "Look, everyone struggles with figuring out where they belong at times, but for those of us growing up in foster or relative care? It's like playing the Belonging Game on \"Hard Mode.\" While other kids are just worried about where to sit in the cafeteria, we're dealing with moving houses, switching schools, or leaving our siblings and old neighborhoods behind. It's stressful. Sometimes you feel guilty for liking a new placement — like you're being disloyal to your family. Or you feel like you can't fully trust anyone because you've had to move so many times. I know it's tough, but these strategies we're learning can help you find your people and begin to feel more at home — no matter where you're living.",
      },
      {
        label: 'Part II, Scene 1 — Building Skills for Belonging',
        audio: '/cast/audio/kai-female-alt-pt2-scene-1-building-skills.mp3',
        duration: '1:09',
        durationSeconds: 69,
        handoff: 'Belonging Skills Sort',
        text: "Belonging isn't just a place you land; it's something you build, brick by brick, with the people around you — whether that's a foster family, friends, teammates or others. Here are a few skills that help. When others talk, try Active Listening. Don't just wait for your turn to speak; actually try to catch what they're saying. It makes people feel understood and safe. When things get tense, aim for Conflict Resolution. It's not about winning; it's about solving the problem in a way that the relationship survives the argument. Try to use Inclusive Language like we, us, and our group, and include others in conversations and activities. Take a risk and invite others to join you, and chances are they will want to return the favor! Finally, Provide Support by being the person who shows up when a friend or family member needs help, and being brave enough to Express Gratitude can build emotional bridges between you and your friends and family. I know, it might feel cringe at first, but these efforts reinforce that others matter to you and can deepen our bonds. This next activity can help you think about how to use these skills.",
      },
      {
        label: 'Part II, Scene 2 — The Roadblocks',
        audio: '/cast/audio/kai-female-alt-pt2-scene-2-roadblocks.mp3',
        duration: '0:31',
        durationSeconds: 31,
        handoff: 'Getting Unstuck',
        text: "Sometimes belonging feels impossible because of things you can't control, like switching schools mid-year. When you hit those roadblocks, your brain might try to protect you with some unhelpful thoughts. For example: All-or-Nothing Thinking — having thoughts like \"I'll never fit in here\" that keep you from trying to connect to others. Or Holding onto the Past — staying so focused on thinking about who we lost that we can't let anyone new in. This next activity will help you learn to challenge unhelpful thoughts like these.",
      },
      {
        label: 'Part II, Scene 3 — Putting It All Together',
        audio: '/cast/audio/kai-female-alt-pt2-scene-3-putting-it-all-together.mp3',
        duration: '1:06',
        durationSeconds: 66,
        handoff: 'Letter to Another Youth',
        text: "And another potential roadblock? Self-Regulation or Self-Control. The challenge is to be able to feel that sting of \"maybe they don't like me\" and being able to breathe through it so you don't just bail or shut down when things get awkward or scary. My friend Ash used to go silent every time she moved homes because she thought, \"they're just going to move me again anyway.\" Her silence was like a shield that's too heavy — it kept her safe from getting hurt, but it also kept her totally alone. Do you have some good strategies to keep calm at these moments? We can give you a list of skills to practice if you need ideas. And finally, it helps to realize that a lot of belonging happens in our own heads. Instead of a fixed mindset, try a growth mindset. Making friends and connections is a skill you practice, not something you're just born with. If one placement or social situation doesn't work out, it's not a permanent fail — it's just one data point and we can keep working on it. Now that you've learned more about this, what might you tell another kid worried about whether they belong?",
      },
      // NO Conclusion entry yet — Conclusion (~0:16) is missing from the source folder.
      // When Josh drops it in, add here:
      // {
      //   label: 'Conclusion',
      //   audio: '/cast/audio/kai-female-alt-conclusion.mp3',
      //   duration: '0:16',
      //   durationSeconds: 16,
      //   text: "Finding that sense of belonging can be tough for everyone, and it's even harder when you are in foster or relative care. But remember: your story isn't over just because the current chapter has been a little chaotic. You've got new skills now — give them a try!",
      // },
    ],
  },
  ```

  #### Part C — Positioning + runtime footer

  **Card position:** insert `kai-female-alt` BEFORE `kai-male-alt` in the CAST array. Renders top-to-bottom in Learning Skills for Belonging as: **Female Kai → Male Kai → current Kai**.

  **Runtime display:**

  - Header: *"Female Alternative Kai's voiceover (7 of 8 scenes)"* — right-aligned: *"Total runtime: 6:11"*
  - Footer recap: *"Total runtime: 6:11 · 7 of 8 scenes."*

  Computed dynamically from `durationSeconds` so when the Conclusion lands, the totals update automatically.

  #### Part D — Small "New" indicator (optional)

  Since this is the third Kai card added to Learning Skills in quick succession, worth considering a small "New" badge or note next to the Female Kai card's heading to signal this is the freshest addition. Something like a small amber pill saying *"NEW"* next to the card's name. Optional polish — skip if it clutters.

  #### What does NOT change

  - Male Kai card (from Draft 45) — unchanged; still renders in its existing position.
  - Current Kai card (voice, animated clip, both image variants) — unchanged.
  - Sam's Story section (Sam 18, Sam Nonbinary, Sam 14, Foster Mom, Foster Dad, Mrs. Johnson) — untouched.
  - All other /demo sections — untouched.
  - No `activityVersions.js` bump (DemoPage section addition).

  #### Out of scope (deferred)

  - **Conclusion recording for Female Kai** — Josh to record and drop; small follow-up commit fills in the entry using the commented-out template.
  - **Female Kai animation** — no animated clips for Female Kai yet.
  - **Full retirement of Proposed Alternative Cast section** — with Male Kai promoted (Draft 45), Sam Nonbinary promoted (Draft 46), and Female Kai now promoted here, the Proposed Alt section has just `sam-female-placeholder` left. Worth considering whether to pull the section entirely or hold it for the eventual Sam Female build. Separate cleanup decision.
  - **The "younger female Kai placeholder"** never actually materialized in castData.js per the shipped state (`kai-woman-alt-placeholder` was in Draft 44's spec but not implemented). Nothing to remove; this draft just adds the real card.

  *End of Draft 47.*

  </details>

- **`7abcc45` · 2026-07-10** — Draft 46: **Sam Nonbinary promoted into Sam's Story** with the Amara voice sample — same graduation pattern as Draft 45's Male Kai. Josh recorded the full all-Sam-18-lines script through the Amara gender-neutral voice model (the current Kai's voice); copied to `public/cast/audio/sam-nonbinary-narrator.mp3` (~3.5 MB, 3:38 — mirrors `older-sam-narrator.mp3` naming). The card moved in the CAST array to sit directly after sam-16, so Sam's Story renders **Sam (18) → Sam (Gender Neutral) → Sam (14)**; updated in place — `shows: ['sams-story']`, `subgroup` dropped, renamed *"Sam — Gender Neutral"* → **"Sam (Gender Neutral)"** to match the sibling parenthetical style, new alt/role, and a `voiceSamples` entry (*"New Sam Gender-Neutral Voice Model — All Lines"*). Keeps the blonde Kai Variant 2 image. Supersedes Draft 44 D's per-line recording prep. Top-of-file comment updated (Sam's Story = three Sam variants; Proposed Alt now placeholder-only after the 45/46 promotions — flagged for a future keep-or-pull decision, untouched here per the draft). No version bump. Verified in preview: card order, renamed label, voice player renders + mp3 serves, GN card uses kai-variant-2.png, Proposed Alt down to its two placeholders, no console errors.

  <details>
  <summary>Draft 46 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 46 — Promote Sam Nonbinary into Sam's Story with the Amara voice sample

  Josh recorded the full all-Sam-18-lines script (the same script Sam Male uses) through the Amara voice model — the current Kai's gender-neutral voice. Promote the existing `sam-nonbinary` card out of the Proposed Alternative Cast section and into **Sam's Story** section, positioned directly below Sam 18 (Sam Male). Add the new voice sample using the same `voiceSamples` shape Sam 18 uses (from Draft 33).

  Parallel to Draft 45's Male Kai promotion: same pattern of "a variant graduates from Proposed Alt to a shipped section" because Josh has recorded enough material to make it a peer card rather than a proof-of-concept.

  **Approved by:** Josh, 2026-07-10.

  ---

  #### Part A — Copy the Amara audio into `public/cast/audio/`

  **Source folder:** `Video Content/New Voiceover/Non Binary Sam/`

  | Source | Destination | Duration |
  |---|---|---|
  | `Non Binary Sam Amara.mp3` | `public/cast/audio/sam-nonbinary-narrator.mp3` | 3:38 (218s) |

  ~3.5 MB. Duration matches the shipped `older-sam-narrator.mp3` exactly — same all-lines script, just voiced through Amara (gender-neutral) instead of Brayden (Sam Male).

  Naming convention mirrors `older-sam-narrator.mp3` for the male Sam narrator, keeping the Sam-* prefix in `public/cast/audio/` consistent.

  #### Part B — Update the sam-nonbinary card in `src/lib/castData.js`

  Locate the current `sam-nonbinary` card (from Draft 42, currently in Proposed Alternative Cast). Update it in place:

  **Before (current shipped state):**

  ```js
  {
    id: 'sam-nonbinary',
    shows: ['proposed-alternative'],
    subgroup: 'sam-variants',
    name: 'Sam — Gender Neutral',
    image: '/cast/images/kai-variant-2.png',
    alt: 'Sam, nonbinary variant — proposed character-design reuse of the current Kai (Variant 2, blonde)',
    role: '...',
    // no voiceSamples
  },
  ```

  **After:**

  ```js
  {
    id: 'sam-nonbinary',
    shows: ['sams-story'],                    // ← promoted from proposed-alternative
    // remove `subgroup` field entirely (not needed in Sam's Story)
    name: 'Sam (Gender Neutral)',             // ← align with "Sam (18 years old)" / "Sam (14 years old)" parenthetical style
    image: '/cast/images/kai-variant-2.png',  // ← unchanged, keeps the blonde variant that differentiates from dark-haired Sam Male
    alt: 'Sam, gender-neutral variant — voiced through the Amara gender-neutral voice model',
    role: 'The gender-neutral variant of Sam — same character, different presentation. Character design reuses the current Kai visual (blonde); voice uses the Amara gender-neutral model reading the same all-lines narration script.',
    voiceSamples: [
      {
        label: 'New Sam Gender-Neutral Voice Model — All Lines',
        src: '/cast/audio/sam-nonbinary-narrator.mp3',
      },
    ],
  },
  ```

  ##### B.1 — Placement in the CAST array

  Move the card so it appears **directly after the `sam-16` card** (Sam Male / Sam 18) in the array. Render order in Sam's Story then becomes:

  1. Sam (18 years old) — Sam Male, existing
  2. **Sam (Gender Neutral) — NEW here, promoted from Proposed Alt**
  3. Sam (14 years old) — existing
  4. Foster Mom — existing
  5. Foster Dad — existing
  6. Mrs. Johnson — existing
  7. Family Photo — existing (rendered separately)

  Josh's ask: *"add a card for them under the Sam Male version"* → directly below Sam 18.

  ##### B.2 — Naming change rationale

  The current display name *"Sam — Gender Neutral"* uses a long dash that breaks the parenthetical convention used by *"Sam (18 years old)"* / *"Sam (14 years old)"*. Renaming to *"Sam (Gender Neutral)"* aligns with the sibling Sam entries. Non-invasive rename — Josh can revert if he prefers the em-dash.

  #### Part C — Update the top-of-file comment block

  The comment block in `castData.js` from Draft 42 describes the sam-nonbinary card as belonging to the Proposed Alternative section. Update to reflect its move into Sam's Story:

  - Any reference to sam-nonbinary being "proposed" or "for team review" — remove.
  - Add a note that Sam's Story now includes three Sam variants: Sam (18 years old) with the Brayden male voice, Sam (Gender Neutral) with the Amara gender-neutral voice, and Sam (14 years old) with the still-in-progress voice model.

  #### Part D — Downstream effect on the Proposed Alternative Cast section

  With sam-nonbinary promoted out, the Proposed Alternative section (after Draft 45 also removed Male Kai) is now down to placeholder-only cards:

  - `sam-female-placeholder` (Sam Female — coming soon)
  - `kai-woman-alt-placeholder` (Female alt Kai younger version — coming soon)

  Two placeholders and no "real" content. **Not blocking this draft** — but worth flagging that the section is thinning out, and at some point the placeholders can either:
  - **Get real content** (when the female Sam and younger female Kai are generated)
  - **Get pulled** entirely if the team's direction has fully shifted

  I'd not touch the section in this draft. Just note it for a future decision.

  #### What does NOT change

  - Sam 18 (sam-16 id) — unchanged; still uses `older-sam-narrator.mp3` in `voiceSamples`.
  - Sam 14 — unchanged.
  - Foster Mom, Foster Dad, Mrs. Johnson, Family Photo — unchanged.
  - Kai in Learning Skills for Belonging (both current Kai + Male Kai from Draft 45) — unchanged.
  - The Plan, activities, tree, montage — untouched.
  - All Sam Story video clips + Sam 14 voice sample — untouched.
  - No `activityVersions.js` bump (DemoPage section addition).

  #### Out of scope (deferred)

  - **Rename the display label back to em-dash version** if Josh prefers *"Sam — Gender Neutral"* over *"Sam (Gender Neutral)"* — small `name` field revert.
  - **Update the CastCard renderer to show the Amara voice sample stitched into scenes** — the current voiceSamples shape shows as a single stitched-lines player (same as Sam Male). No per-line breakdown yet.
  - **Clean up the Proposed Alternative Cast section** now that it's placeholder-only. Separate cleanup decision.
  - **Female Sam variant** — still awaited; would slot into Sam's Story between Sam (Gender Neutral) and Sam (14) once built.
  - **Consider retiring the Sam-Female placeholder** in Proposed Alt now that the section is meant for exploration and Sam Female's home would properly be Sam's Story once real. Follow-up.

  *End of Draft 46.*

  </details>

- **`8804d02` · 2026-07-10** — Draft 45: **Male Alternative Kai promoted into Learning Skills for Belonging** with the full 8-scene voiceover, rendered **above** the current Kai so the team can compare both voices reading the same script side by side (supersedes Draft 44 Part E). Copied 7 new mp3s (`kai-male-alt-*`, ~4.8 MB; the "Concludion" source typo normalized); **Scene 2 reuses the Draft 42 `kai-man-voice-sample.mp3` in place** (verified byte-identical to the source's Scene 2 file). Scene 3 carries the UPDATED script (*"maps app on your phone"* — Adrienne + Holly 2026-07-07), which is what this audio says; the current Kai's Scene 3 keeps *"GPS"* to match its older recording. Removed the `kai-man-alternative` card from Proposed Alt (option b — graduated), leaving that section with the Sam variants + the younger female Kai placeholder. CastCard gains optional `scenesIntro` (used by the male alt card: *"Same 8-scene psychoeducation script as the current Kai below…"*) and `roleNote` (the pointer under the current Kai, satisfying Draft 44 G). Runtime footers stay computed; note: the draft says 6:26 but its own per-scene durations sum to 387s = **6:27** (same script as the current Kai), so 6:27 renders. No version bump. Verified in preview (order, both runtimes, 7+1 audio players, maps-app vs GPS, no console errors).

  <details>
  <summary>Draft 45 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 45 — Add Male Alternative Kai as a peer card above the current Kai on /demo

  Josh finished recording all Kai lines through ElevenLabs with the Male Alternative Kai voice. Promote the male alt Kai from the "Proposed Alternative Cast" section (where Draft 42 initially placed it as a proof-of-concept card) to a peer position in the **Learning Skills for Belonging** section, ABOVE the current Kai card. Same card shape as the current Kai (image + role + all 8 scenes with script text + audio + duration + handoff + total runtime footer).

  Team can now compare both Kais on the same section of the demo — top card is the male alt, bottom card is the current Kai — reading the same scripts, hearing the different voice options side by side.

  **Approved by:** Josh, 2026-07-08.

  **Supersedes Draft 44 Part E** (which had planned to populate the male alt Kai's `scenes[]` slot inside the Proposed Alternative Cast section). The male alt Kai is being promoted out of Proposed Alt and into Learning Skills for Belonging. Draft 44's other parts still stand.

  ---

  #### Part A — Copy 7 new male alt Kai mp3s into `public/cast/audio/` (Scene 2 is already in place from Draft 42)

  **Source folder:** `Video Content/New Voiceover/Male Kai Alternate/`

  **Scene 2 (The Why) is already in the repo** — the `kai-man-voice-sample.mp3` file that Draft 42 added to `public/cast/audio/` (originally labeled as a "Voice sample" on the Male Kai card in Proposed Alt) is actually Male Kai's Scene 2 (The Why) recording. 35s duration matches. Reuse that file in place for Scene 2; **do not copy a new one for Scene 2.** The scenes[] entry references `/cast/audio/kai-man-voice-sample.mp3` directly.

  Copy the 7 new files:

  | Source | Destination | Duration |
  |---|---|---|
  | `Male Kai Part 1.mp3` | `public/cast/audio/kai-male-alt-pt1-scene-1-the-scan.mp3` | 0:51 |
  | *(Scene 2 already at `public/cast/audio/kai-man-voice-sample.mp3` from Draft 42)* | *(reuse in place)* | *0:35* |
  | `Male Kai Scene 3 Building a Safety Net.mp3` | `public/cast/audio/kai-male-alt-pt1-scene-3-safety-net.mp3` | 1:19 |
  | `Male Kai Scene 4 the foster care extra level.mp3` | `public/cast/audio/kai-male-alt-pt1-scene-4-extra-level.mp3` | 0:40 |
  | `Male Kai Part 2 Scene 1 Building skills.mp3` | `public/cast/audio/kai-male-alt-pt2-scene-1-building-skills.mp3` | 1:09 |
  | `Male Kai Part 2 Scene 2 The roadblocks.mp3` | `public/cast/audio/kai-male-alt-pt2-scene-2-roadblocks.mp3` | 0:31 |
  | `Male Kai Part 2 scene 3 putting it all together.mp3` | `public/cast/audio/kai-male-alt-pt2-scene-3-putting-it-all-together.mp3` | 1:06 |
  | `Male Kai Concludion.mp3` (typo in source filename) | `public/cast/audio/kai-male-alt-conclusion.mp3` | 0:16 |

  Combined new copies ~4.8 MB. **Total runtime 6:26 across all 8 scenes** (matching the current Kai's 6:27 within a second of rounding).

  Note: the "Male Kai Part 1.mp3" source filename is misleading — the duration (51s) confirms it's just Scene 1 (The Scan), not the whole Part I. Renaming to the scene-specific destination filename clarifies this.

  **Optional cleanup — rename `kai-man-voice-sample.mp3` for naming convention consistency:** could rename to `kai-male-alt-pt1-scene-2-the-why.mp3` to match the other Male Kai audio filenames. If renamed, update the scenes[] entry's `src` accordingly. Recommend **skipping the rename** — the current filename works, no need for churn, and this way the file's history from Draft 42 stays traceable.

  #### Part B — Reuse the existing `kai-man.png` image

  The male alt Kai image is already in the repo from Draft 42 at `public/cast/images/kai-man.png`. Reuse it for the new card — no new image copy needed.

  Whether the image stays referenced from the Proposed Alternative Cast card as well: Code's call. Two options:
  - **(a) Both cards reference the same image file.** Cleanest — one file, two cards, each in its section.
  - **(b) Remove the male alt Kai from Proposed Alternative Cast now that it's promoted.** Cleaner data hierarchy — one card per character.

  **Recommend (b)** — with Draft 44's regrouping of Proposed Alt into "Sam variants" + "Kai concepts," moving the male alt Kai out of that section leaves the Proposed Alt section with just Sam variants + the female Kai placeholder (awaiting the younger version). That's a cleaner mental model: Proposed Alt = "still exploring," Learning Skills = "here in the intervention." Male alt Kai has graduated to Learning Skills.

  If Code goes with (b), delete the `kai-man-alternative` card entry from castData.js. The image file stays in place (still referenced by the new card in Learning Skills).

  #### Part C — Add a new "Male Alternative Kai" card in `src/lib/castData.js`

  Add BEFORE the current Kai card in the CAST array (renders above it in the Learning Skills for Belonging section). Same shape as the current Kai card from Drafts 35, 40, 41 — image, role, scenes[]. No videos yet (animation hasn't been done for male alt Kai), no voiceSamples featured block.

  ```js
  {
    id: 'kai-male-alt',
    shows: ['learning-skills'],
    name: 'Kai (Male Alternative)',
    alt: 'Kai — male alternative variant — proposed peer-mentor narrator',
    image: '/cast/images/kai-man.png',
    role: 'Proposed male alternative Kai — an early-20s Black young man peer mentor, foster-care alumni. Reading the same 8-scene psychoeducation script as the current Kai.',
    scenes: [
      {
        label: 'Part I, Scene 1 — The Scan',
        audio: '/cast/audio/kai-male-alt-pt1-scene-1-the-scan.mp3',
        duration: '0:51',
        durationSeconds: 51,
        handoff: 'Self-Reflection',
        text: "Hey. I'm Kai. I spent time in foster care too, so I know the drill. Now, I get to help other kids in the system and share some of the life hacks I've picked up. I'm glad you're here, because we're talking about something we all deal with 24/7: Belonging. Think about that moment when you walk into a crowded cafeteria or a new class. You're scanning the room, right? Your brain is doing a million calculations per second: Who looks cool? Who looks mean? Where's my spot? That \"scan\" isn't you being awkward — it's actually your brain trying to protect you. It's looking for safety, connection, and a place to land. Because let's be real: feeling like you don't fit in is more than just a bummer. It actually hurts. It can be confusing, lonely, and make it hard to know who you even are. Let's take a minute to think about this some more.",
      },
      {
        label: "Part I, Scene 2 — The Why (It's in Your DNA)",
        // Reuses the file added in Draft 42 (originally labeled as a "Voice sample" on the
        // Male Kai card in Proposed Alt). 35s duration matches the current Kai's Scene 2 exactly —
        // this is the same script line in the male alt voice. Not copied fresh in Part A.
        audio: '/cast/audio/kai-man-voice-sample.mp3',
        duration: '0:35',
        durationSeconds: 35,
        handoff: 'Who I Am Poem',
        text: "So, why are our brains so obsessed with fitting in? Basically, belonging isn't just a \"nice to have\" type of thing — it's a survival requirement, right up there with food, sleep, and having a roof over your head. Back in the day, being part of a group meant you didn't go hungry or get eaten by a saber-toothed tiger. Today, it's still wired into our biology. We need to feel accepted, respected, and \"seen\" for who we actually are — including our culture, our history, and where we come from. This activity can help you think about some of these things.",
      },
      {
        label: 'Part I, Scene 3 — Building a Safety Net',
        audio: '/cast/audio/kai-male-alt-pt1-scene-3-safety-net.mp3',
        duration: '1:19',
        durationSeconds: 79,
        handoff: 'Allies / Safety Net',
        // NOTE: this scene uses the UPDATED script — "maps app on your phone" instead of "GPS"
        // (per Adrienne + Holly's 2026-07-07 note). Current Kai's Scene 3 text may still say
        // "GPS" and needs the same update in a follow-up if we want script parity.
        text: "We know belonging is a basic need, but here's the secret: you don't just need one place to belong. You need a few. Think of it like a safety net. If one string snaps — like after a fight with a friend — the other strings catch you. We need this safety net because it provides different types of support for us to change and grow, providing the \"green light\" to try new things. It's a lot easier to take risks, like joining a team or trying out for a play, when you know you've got a crew behind you — both in and outside of your home. One thing that can really help is having an adult that you can talk to or trust for advice. In high school, I had this one teacher who actually \"got\" me, and it changed the whole vibe of a really tough year because I could count on her for emotional and practical support. Social support is important too. You've probably noticed that your friend group matters way more these days. When building your crew, think of it like the maps app on your phone. If you hang with a group that's constantly in trouble or giving up on school, it's easy to get redirected down that same path. But if you find people who are hyped about your goals? They become your literal social support system, helping you figure it out along the way. It's good to think about who you are and what kind of safety net you might need. This next activity will help you do that.",
      },
      {
        label: 'Part I, Scene 4 — The Foster Care "Extra Level"',
        audio: '/cast/audio/kai-male-alt-pt1-scene-4-extra-level.mp3',
        duration: '0:40',
        durationSeconds: 40,
        text: "Look, everyone struggles with figuring out where they belong at times, but for those of us growing up in foster or relative care? It's like playing the Belonging Game on \"Hard Mode.\" While other kids are just worried about where to sit in the cafeteria, we're dealing with moving houses, switching schools, or leaving our siblings and old neighborhoods behind. It's stressful. Sometimes you feel guilty for liking a new placement — like you're being disloyal to your family. Or you feel like you can't fully trust anyone because you've had to move so many times. I know it's tough, but these strategies we're learning can help you find your people and begin to feel more at home — no matter where you're living.",
      },
      {
        label: 'Part II, Scene 1 — Building Skills for Belonging',
        audio: '/cast/audio/kai-male-alt-pt2-scene-1-building-skills.mp3',
        duration: '1:09',
        durationSeconds: 69,
        handoff: 'Belonging Skills Sort',
        text: "Belonging isn't just a place you land; it's something you build, brick by brick, with the people around you — whether that's a foster family, friends, teammates or others. Here are a few skills that help. When others talk, try Active Listening. Don't just wait for your turn to speak; actually try to catch what they're saying. It makes people feel understood and safe. When things get tense, aim for Conflict Resolution. It's not about winning; it's about solving the problem in a way that the relationship survives the argument. Try to use Inclusive Language like we, us, and our group, and include others in conversations and activities. Take a risk and invite others to join you, and chances are they will want to return the favor! Finally, Provide Support by being the person who shows up when a friend or family member needs help, and being brave enough to Express Gratitude can build emotional bridges between you and your friends and family. I know, it might feel cringe at first, but these efforts reinforce that others matter to you and can deepen our bonds. This next activity can help you think about how to use these skills.",
      },
      {
        label: 'Part II, Scene 2 — The Roadblocks',
        audio: '/cast/audio/kai-male-alt-pt2-scene-2-roadblocks.mp3',
        duration: '0:31',
        durationSeconds: 31,
        handoff: 'Getting Unstuck',
        text: "Sometimes belonging feels impossible because of things you can't control, like switching schools mid-year. When you hit those roadblocks, your brain might try to protect you with some unhelpful thoughts. For example: All-or-Nothing Thinking — having thoughts like \"I'll never fit in here\" that keep you from trying to connect to others. Or Holding onto the Past — staying so focused on thinking about who we lost that we can't let anyone new in. This next activity will help you learn to challenge unhelpful thoughts like these.",
      },
      {
        label: 'Part II, Scene 3 — Putting It All Together',
        audio: '/cast/audio/kai-male-alt-pt2-scene-3-putting-it-all-together.mp3',
        duration: '1:06',
        durationSeconds: 66,
        handoff: 'Letter to Another Youth',
        text: "And another potential roadblock? Self-Regulation or Self-Control. The challenge is to be able to feel that sting of \"maybe they don't like me\" and being able to breathe through it so you don't just bail or shut down when things get awkward or scary. My friend Ash used to go silent every time she moved homes because she thought, \"they're just going to move me again anyway.\" Her silence was like a shield that's too heavy — it kept her safe from getting hurt, but it also kept her totally alone. Do you have some good strategies to keep calm at these moments? We can give you a list of skills to practice if you need ideas. And finally, it helps to realize that a lot of belonging happens in our own heads. Instead of a fixed mindset, try a growth mindset. Making friends and connections is a skill you practice, not something you're just born with. If one placement or social situation doesn't work out, it's not a permanent fail — it's just one data point and we can keep working on it. Now that you've learned more about this, what might you tell another kid worried about whether they belong?",
      },
      {
        label: 'Conclusion',
        audio: '/cast/audio/kai-male-alt-conclusion.mp3',
        duration: '0:16',
        durationSeconds: 16,
        text: "Finding that sense of belonging can be tough for everyone, and it's even harder when you are in foster or relative care. But remember: your story isn't over just because the current chapter has been a little chaotic. You've got new skills now — give them a try!",
      },
    ],
  },
  ```

  #### Part D — Card positioning

  **Render the Male Kai card FIRST** in the Learning Skills for Belonging section, ABOVE the current Kai card. Two ways to achieve this:

  - **(a) Array order:** put the new `kai-male-alt` card BEFORE the current `kai` card in the CAST array. If the DemoPage filter for `shows: 'learning-skills'` renders in array order, this positioning is automatic.
  - **(b) Explicit sort:** if the filter uses some other ordering, add a `sortOrder` field or an explicit id-based sort.

  Recommend (a) — simpler. Just make sure the CAST array ordering has `kai-male-alt` before `kai`.

  #### Part E — Runtime footer

  Compute dynamically from `durationSeconds` per Draft 40's approach so the total stays accurate if scenes are ever added or swapped.

  Suggested wording for the header AND footer of the Male Kai voiceover section (parallel to the current Kai card):

  - **Header:** *"Male Alternative Kai's voiceover (all 8 scenes)"* — right-aligned duration: *"Total runtime: 6:26"*
  - **Intro paragraph** (below the header): *"Same 8-scene psychoeducation script as the current Kai below, in the male alternative voice."*
  - **Footer recap:** *"Total runtime: 6:26 · 8 scenes wrapping the 6 activities."*

  #### Part F — Small pointer note under the current Kai card

  Now that the two Kais sit side by side in Learning Skills, the current Kai's role line or intro could get a subtle pointer to help team members orient. Below the current Kai's role text (or as a small italic line above its voiceover section):

  > *A male alternative voice is also being explored — see the card above.*

  Non-competitive, just orienting. If Draft 44 Part G already added this pointer, this satisfies that instead of adding another one.

  #### Script text notes

  - **Scene 3 uses the UPDATED text** ("maps app on your phone" instead of "GPS"), per Adrienne + Holly's 2026-07-07 note. When the Male Kai audio plays, this is what he's saying.
  - **The current Kai card's Scene 3 text still says "GPS"** because the current Kai's audio was recorded before the script update. Options for the current Kai:
    - **Leave as-is** — the current Kai's audio hasn't been re-recorded with the new script, so the displayed text should match what plays.
    - **Update the current Kai's Scene 3 text to "maps app" too** — makes the on-screen script match Male Kai's script, but then the current Kai's audio would say "GPS" while the on-screen text says "maps app" — mismatch.

    **Recommend leaving current Kai as-is** — script text should match what the audio says. If the current Kai gets re-recorded with the new script later, update the text then.

  - **Scene 1 "life hacks" — kept as written.** No confirmation Josh made that swap during recording. If the male alt Kai's audio says something different from what's above (e.g., "what I've learned along the way"), tell me and I'll adjust.

  #### What does NOT change

  - The current Kai card in Learning Skills — all 8 scenes with the current voice, the first animated clip from Draft 41, both image variants — untouched.
  - The current Kai's Scene 3 text stays "GPS" (matching what the current audio says).
  - Sam's Story section, all other cast cards, /demo layout above and below Learning Skills — untouched.
  - No `activityVersions.js` bump (DemoPage section addition).
  - All previous Kai work (Drafts 35, 40, 41) stays intact.
  - Draft 44's other parts (Sam-18/Sam-14 duplication removal, sub-group regrouping in Proposed Alt, retiring the current 22-24 female alt Kai, Sam-NB voiceSamples slot prep) still stand independently.

  #### Out of scope (deferred)

  - **Male Kai animation** — first animated clip for the current Kai exists (Draft 41). No animation for Male Kai yet.
  - **Female alt Kai younger version** — still awaited per Draft 44 Part F.
  - **Current-Kai voice on Sam-NB lines** — still awaited per Draft 44 Part D.
  - **Re-recording the current Kai's Scene 3 with the "maps app" script update** — could be done later if the team wants script parity across both Kais. Not part of this draft.

  *End of Draft 45.*

  </details>

- **`c0937c7` · 2026-07-10** — Draft 44: reconfigured the **Proposed Alternative Cast** section per the 2026-07-07 compromise. Sam-18 + Sam-14 no longer duplicate into the section (back to `['sams-story']`; the intro references them verbally); cards regrouped into two labeled sub-groups via a new `subgroup` field — **"Sam variants"** (Sam — Gender Neutral, Sam — Female placeholder) and **"Alternative Kai concepts"** — in a two-column desktop grid; the intro paragraph rewritten to the neutral exploration framing (names Adrienne's keep-current-Kai preference; "Nothing is committed yet"); the early-20s female alt Kai **retired** and replaced with a *"younger version coming soon"* placeholder (kai-woman.png + its voice sample stay on disk, unreferenced); the Sam-Nonbinary card is prepped for a future `voiceSamples[]` drop (current-Kai voice on the two Sam-NB lines — filenames documented in a comment). Part E superseded by Draft 45; Part G's pointer landed with Draft 45. No version bump. Verified in preview.

  <details>
  <summary>Draft 44 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 44 — Reconfigure the Proposed Alternative Cast section (compromise + clarity)

  Follow-up to Draft 42. The 2026-07-07 meeting resulted in a compromise on the Kai / character-design discussion rather than a clean decision: the team is torn, and Josh proposed producing more comparison material rather than committing to a change. This draft cleans up the Proposed Alternative Cast section on /demo so it reads as a coherent "exploration space" rather than a bunch of competing variants stacked together.

  The core problems with the current Draft 42 rendering:
  - Sam-18 and Sam-14 cards appear twice (once in Sam's Story, once in Proposed Alternative) which felt duplicative rather than illustrative.
  - No visual grouping between "Sam variants under the proposal" vs "Alternative Kai concepts" — six cards in a flat row without structure.
  - The current 22-24 female alt Kai is being retired for a younger version (per the compromise), so that image needs to leave the section.

  **Approved by:** Josh, 2026-07-07.

  ---

  #### Part A — Remove the duplicate Sam-18 + Sam-14 cards from the Proposed Alternative section

  **Change:** update the `shows` array on Sam-18 (id `sam-16`) and Sam-14 to just `['sams-story']`. They no longer appear in Proposed Alternative.

  **Why:** the duplication was intended to show "the full alternative cast lineup" but it read as noise. Team members clicked back and forth wondering if these were different Sams. Removing the duplication clarifies: the Proposed Alternative section only shows what's DIFFERENT from the current setup, not the full lineup.

  The intro paragraph will explain that Sam-18 and Sam-14 remain unchanged in the proposed direction — just referenced verbally rather than re-rendered.

  ---

  #### Part B — Regroup the remaining cards into two visual sub-groups

  **Change:** within the Proposed Alternative Cast section, render two clearly-labeled sub-groups instead of a flat card list.

  **Sub-group 1 — "Sam variants"** (what the proposal would do with the existing Kai design):
  - **Sam — Nonbinary** (repurposed current Kai V1 image + eventually current Kai voice on Sam-NB lines — see Part D below)
  - **Sam — Female** (coming soon placeholder — same as today)

  **Sub-group 2 — "Alternative Kai concepts"** (proposed new peer-mentor Kais):
  - **Kai — Male (proposed)** (existing card from Draft 42 — image + short voice sample, eventually full voiceover — see Part E below)
  - **Kai — Female (proposed)** (**REPLACE** the current 22-24 version with a younger version once Josh generates it — see Part F below)

  Sub-group headings in `text-lg font-semibold text-ctac-navy`. Cards within each sub-group render in a two-column grid on desktop, stacked on mobile.

  ##### B.1 — Data-shape update

  Extend the `shows` array's semantic: allow a second value indicating the sub-group. Options:

  - **(a) Add a `subgroup` field on each card** (`subgroup: 'sam-variants' | 'kai-concepts'`) — cleaner, easier to render.
  - **(b) Use additional show values** (`shows: ['proposed-alternative-sam']` vs `shows: ['proposed-alternative-kai']`) — reuses existing filter mechanism but bloats the show taxonomy.

  **Recommend option (a)** — cleaner. Only cards in the Proposed Alternative section need the subgroup field; other cards ignore it.

  ---

  #### Part C — Update the section intro paragraph

  The current intro paragraph (from Draft 42) frames this as "here's a proposal, react to it." After the 2026-07-07 meeting, the framing needs to reflect (a) the team's mixed reaction, (b) the compromise to produce more material, and (c) that this is still exploration rather than a committed direction.

  **New intro paragraph** (Josh may edit before shipping):

  > *An exploration space for character-design alternatives, following up on the 2026-07-07 meeting discussion. The team is currently split on whether Kai's design should shift — one direction is to keep the current Kai and use its design for the Sam-Nonbinary variant we still need to build; another is to keep the current Kai as-is (Adrienne's preference) and build entirely separate Sam variants. This section shows the "in-between" material Josh is producing so we can compare side-by-side. Sam-18 and Sam-14 stay unchanged in either direction (see them in the Sam's Story section above). Nothing is committed yet.*

  Keep it neutral. Names Adrienne's preference briefly so it doesn't feel like the alternative is being pushed. Explicitly says nothing is committed.

  ---

  #### Part D — Prep: Sam-Nonbinary card gains a voiceSamples slot

  Once Josh records the current Kai voice on the Sam-Nonbinary lines (from Holly's script — the two Sam-14/Sam-NB lines: *"How do I feel about that? I have literally no idea."* and *"You aren't my parents and you never will be."*), that audio drops into the Sam-Nonbinary card as a voiceSamples entry.

  **Change now:** wire up the card's data shape to accept `voiceSamples[]` (same shape as Sam 16 uses from Draft 33). No asset file exists yet; add a placeholder empty array OR omit the field so the renderer skips it. When Josh has the audio, the file drops in a follow-up commit.

  **Suggested filename convention** for when the audio lands: `public/cast/audio/sam-nb-kai-voice-inner-monologue.mp3` and `sam-nb-kai-voice-rejection.mp3` (or bundled as one file — Josh's call at recording time).

  ---

  #### Part E — Prep: Kai Male (proposed) card upgrades to full voiceover

  Currently the male alt Kai card has ONE `voiceSamples` entry (~35s from Draft 42). Per the 2026-07-07 compromise, Josh will produce a full 8-scene voiceover set using the male alt Kai's voice — same 8 scenes as the current Kai's voiceover, just in the male alt voice.

  **Change now:** extend the male alt Kai card's data shape to accept a `scenes[]` array (same shape as the current Kai card uses from Draft 40 — `label`, `audio`, `duration`, `durationSeconds`, `handoff`, `text`). Empty array or omitted field for now.

  When Josh has recorded all 8 male-alt-Kai scenes, they land as a follow-up commit that populates the `scenes[]` array with the same script text (verbatim from Adrienne's script, matching the current Kai `scenes[]`).

  **Suggested filename convention:** `public/cast/audio/kai-man-alt-pt1-scene-1-the-scan.mp3` etc. — mirrors the current Kai audio naming with a `-man-alt-` infix.

  The card's rendering when populated will look identical to the current Kai card (from Draft 40) — same script text, same duration display, same total runtime footer.

  ---

  #### Part F — Retire the current female alt Kai; wait for the younger version

  Per the meeting compromise, the current female alt Kai (early-20s, 22-24 range) is being retired in favor of a younger female alt Kai (younger visual + younger voice). Josh will generate the new image and record a new voice sample.

  **Change now:** on the current female alt Kai card in castData.js, either:

  - **(a) Delete the card entirely** — cleanest; nothing renders for female alt Kai until the new version lands.
  - **(b) Convert to a placeholder** — same treatment as the Sam-Female placeholder (blank silhouette + "coming soon"). Signals that a female alt Kai is planned but isn't ready.

  **Recommend (b)** — placeholder — so the sub-group structure ("Sam variants" and "Alternative Kai concepts") stays balanced visually. The kai-woman.png file can stay in `/public/cast/images/` for reference; the card just doesn't reference it.

  **Suggested placeholder card:**

  ```js
  {
    id: 'kai-woman-alt-placeholder',
    shows: ['proposed-alternative'],
    subgroup: 'kai-concepts',
    name: 'Kai — Female (proposed, younger version)',
    placeholder: true,
    alt: 'Female alt Kai — younger version coming soon',
    role: 'Younger female alt Kai — image and voice sample coming soon per 2026-07-07 meeting compromise.',
  },
  ```

  When Josh has the new younger version generated, it drops in a follow-up commit that swaps the placeholder for a real card with image + voiceSamples.

  **Suggested filename convention:** `public/cast/images/kai-woman-younger.png` and `public/cast/audio/kai-woman-younger-voice-sample.mp3`.

  ---

  #### Part G — Update the "current" Kai card's intro copy (small note)

  The current Kai in the Learning Skills for Belonging section (from Draft 35 + updated through Draft 41) stays as the shipped voice of the intervention. But given the ongoing discussion, add a small note near its section heading so team members know both the current AND the alternative direction exist to look at.

  **Change:** below the Learning Skills for Belonging heading (or as a small footer at the end of the Kai card), add a subtle italic line:

  > *A proposed alternative direction is also being explored — see the Proposed Alternative Cast section at the bottom of the page.*

  Small, non-competitive framing. Just a pointer.

  ---

  #### What does NOT change

  - The current Kai in Learning Skills for Belonging — image variants, all 8 voiceover scenes, animated clip, role line — untouched.
  - Sam's Story section (Sam-18, Sam-14, Foster Mom, Foster Dad, Mrs. Johnson, Family Photo) — untouched apart from `shows` array cleanup on Sam-18/Sam-14.
  - All other sections of /demo — untouched.
  - No `activityVersions.js` bump (DemoPage section).

  #### Out of scope (will land as follow-up commits when Josh has the assets)

  - **Male alt Kai full voiceover set** — 8 mp3s + `scenes[]` array populated.
  - **Sam-Nonbinary voice lines** — audio using current Kai voice on the two Sam-NB lines.
  - **Younger female alt Kai** — new image + voice sample replacing the placeholder from Part F.
  - **Team review outcome** — if the team ultimately picks one direction at a future meeting, that decision drives a decisive commit: either the alternative Kais migrate into Learning Skills (retiring current Kai) OR the section gets torn down entirely.

  *End of Draft 44.*

  </details>

- **`7c3b283` · 2026-07-10** — Draft 43: **The Plan v1.1 → v2.0 (MAJOR)** — the 2026-07-07 meeting restructure, nine screens now. **(A)** Each Skills-to-try card gains a required *"How could you demonstrate this skill?"* text input with per-skill example placeholders (Sprang's higher-order-learning push); a full commitment is now skill + how + who + when and the Continue gate enforces it; `skills_to_try[].how` + `plan_skill_N_how` export columns. **(B)** *"Read your letter back"* → **"Words of Wisdom"** everywhere (screen heading + new sub-line, review-card label, PDF page, and the reflection prompt is now *"Any words of wisdom that stand out to you here?"*) — Part G's label audit confirms no stray "letter" labels remain. **(C)** New Screen 7 *"When you felt included."* — the kid's Self-Reflection inclusion text as a keepsake callout + a checklist of belonging-promoting behaviors they were already using (skipped when no inclusion text); `inclusion_reflection.behaviors_used[]` + `plan_inclusion_behavior_bs1..bs7` export columns. **(D)** Review gains a read-only *"keep on your radar"* list of not-tried-yet BSS skills. **(E)** Sprang's safety qualifier (*"…save them for the people who make you feel safe"*) on every BPB surface — Screen 7, review, PDF. **(F)** PDF grows to 6 pages (new inclusion-reflection page); PNG keepsake updated to match. planDemoData gains `ALL_BELONGING_SKILLS`, per-skill `howExample`, `inclusionText`, `notTriedYetIds`. Correction carried through: the draft says "8 BSS skills" but the registry has 7 (bs1–bs7). Verified end-to-end in preview (gating, all 9 screens, renames, checklist + qualifier, payload shape, 6-page PDF builds, no console errors).

  <details>
  <summary>Draft 43 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 43 — The Plan v1.0 → v2.0 (2026-07-07 team meeting bundle)

  Substantial revision to The Plan activity based on the 2026-07-07 meeting. Five coordinated changes plus one small bug fix. The intent is to (a) push participants toward higher-order learning (how they'd actually use skills, not just picking them), (b) add a clinically-important safety qualifier so the plan doesn't inadvertently reinforce dangerous connections, (c) surface the kid's Self-Reflection work as a positive reinforcement moment, and (d) sharpen the framing of the letter callback with Sprang's *"Words of Wisdom"* aha reframe.

  **MAJOR bump:** `plan` v1.0 → v2.0. Data shape grows (new save fields for skill-level "how" text, inclusion-behavior selections). Adds one new screen. Renames one section. Ship as one commit.

  **Approved by:** Josh + team, 2026-07-07.

  ---

  #### Part A — Skills to try: add a "How could you demonstrate this?" text input per skill

  **Current behavior (Draft 39):** Screen 2 shows one card per willing-to-try BSS skill with a *who* dropdown (kept allies) and a *when* chip group. Kid picks a name + timing per skill.

  **Feedback (Stephanie + Sprang, 2026-07-07):** the current format is directionally right but "clicking who and when" isn't producing enough clinical work. Sprang framed it as *"a higher-order learning scale to then start to think 'now, how would I actually do that.'"* Adding a small text box for the kid's own strategy pushes them into thinking about the *how*, not just the *who* and *when*.

  **Change:** Add a **new required text input** per skill card:

  > *"How could you demonstrate this skill?"*

  With a per-skill example placeholder pulled from the BSS skill registry — e.g., for Active Listening: *"e.g., giving someone your full attention when they're talking, eyes on them, no phone."* For Provide Support: *"e.g., checking in on a friend when they seem down."* Etc. The placeholder disappears when the kid types.

  Per Sprang's meeting language: *"kids are going to be doing a little bit, because otherwise they won't read their action plan."* Making this input required (not skippable) keeps the kid actively engaged rather than passively clicking through.

  **Card structure per willing-to-try skill:**

  1. Skill name (bold, ctac-navy)
  2. Skill description (small helper text from BSS registry)
  3. **NEW: *"How could you demonstrate this skill?"* text input with per-skill example placeholder**
  4. *Who could you try this with?* — allies dropdown (existing)
  5. *When could you try it?* — chip group (existing)

  **Continue gating:** the kid must complete at least one full commitment (skill + how + who + when) to advance, OR tap an explicit "Skip for now" (same as today's fallback).

  ##### A.1 — Data shape addition

  `plan_payload.skills_to_try[]` gains a `how` string per entry:

  ```js
  skills_to_try: [
    {
      skill_id: 'active-listening',
      skill_text: 'Active Listening',
      how: "I'll put my phone down when my sister is talking about her day",  // NEW
      who: 'Foster Mom',
      who_is_ally: true,
      when: 'This week',
      when_is_freetext: false,
    },
    // ...
  ],
  ```

  **Export pipeline:** add `plan_skill_N_how` columns (up to 8, matching the existing per-BSS-skill pattern). Same expansion rules as the existing `plan_skill_N_text` / `_who` / `_when` columns.

  ---

  #### Part B — Rename "Letter to yourself" / "Read your letter back" → "Words of Wisdom"

  Sprang framed this as the *"goosebump moment"* — the participant wrote the letter to another kid, but on the action plan we surface it back as *their own words of wisdom to themselves*. Same content, different framing. Adrienne agreed: *"I think that would be a real kind of like goosebump type of aha moment when they read it and they're like, oh, I wrote that."*

  **Files touched:** `src/activities/Plan.jsx` (screen label + review card reference) plus wherever the letter-callback string appears.

  ##### B.1 — Screen 5 heading

  Current: *"Read your letter back."*
  Sub-line: *"You wrote this for another kid. Now read it as if you wrote it for yourself."*

  **New heading:** *"Words of Wisdom."*
  **New sub-line:** *"You wrote this for another kid. But these are the things you might need to hear too — your own words of wisdom, coming from you."*

  ##### B.2 — Screen 7 review card label

  Current label on the review keepsake card: *"Letter to yourself"* (or "Letter to another" per Josh's transcript note — there's some label drift). Per Josh in the meeting: *"I saw your note, too — Adrian, I'll fix that label. I know it says a plan… A letter to yourself, yeah, uh, yeah, just in that one spot."*

  **Fix:** relabel the section on the review card to *"Words of Wisdom"* consistently. Same content underneath.

  ##### B.3 — PDF export label

  The 5-page PDF from Draft 39 has a page for the letter. Rename that page's title from *"Letter"* (or similar) to *"Words of Wisdom"* to match.

  ##### B.4 — Reflection prompt on Screen 5 — keep, but note the tension

  The *"What sticks out?"* optional text input was added in Draft 39 v1.0. Sprang expressed some concern that it might "lengthen the intervention" and be "duplicative" of the letter itself. Adrienne pushed back that the phrasing (words of wisdom reframe) is the payoff.

  **Change:** keep the optional prompt as-is for now, but rename it to match the new framing:

  - **Current:** *"What sticks out?"*
  - **New:** *"Any words of wisdom that stand out to you here?"* (or shorter: *"Anything that stands out?"* — Code's call)

  If the team wants it removed at the next review, easy to drop then.

  ---

  #### Part C — NEW Screen 7: "When you felt included" reflection + belonging-behaviors checklist

  Insert a new screen between the current Screen 6 (Who you are — poem) and the current Screen 7 (Your Plan review). This becomes the new **Screen 7**, and the existing review + save screens become Screens 8 + 9.

  ##### C.1 — Screen purpose

  Pull forward the participant's Self-Reflection *"time I felt included"* text, then let them CHECK the belonging-promoting behaviors they were using in that moment. Frames the action plan as *"keep doing what already works,"* not just *"try new things."*

  Sprang's framing from the meeting: *"belonging promoting behaviors you've used in the past that worked for you — to keep doing these. So the action plan isn't just about new things you're going to do; it's continuing to do the old things that were working for you."*

  ##### C.2 — Screen layout

  Heading: *"When you felt included."*

  Sub-line: *"Think back to what you wrote earlier."*

  Below the sub-line, a quoted callout showing the participant's inclusion text from Self-Reflection:

  > *"[participant's inclusion_text from Self-Reflection save payload]"*

  Below the callout, the prompt:

  > *Which belonging-promoting behaviors were you using?*

  Then a checklist of all belonging-promoting behaviors from the BSS skill registry (the same set as the BSS activity's 8 skills). Multi-select checkboxes, unlimited. Kid checks any that apply.

  Below the checklist, the safety qualifier (see Part E below).

  ##### C.3 — Data shape

  Save payload gains a new field:

  ```js
  inclusion_reflection: {
    behaviors_used: ['active-listening', 'provide-support'],  // array of skill_ids
  },
  ```

  **Export pipeline:** add per-skill `plan_inclusion_behavior_{skill_id}` binary columns (0/1 for each of the 8 BSS skills). Same pattern as BSS's per-skill export.

  ##### C.4 — Empty-state handling

  If the participant didn't complete Self-Reflection (or the inclusion text is empty), skip this screen entirely. Don't force the participant to reflect on an empty callout.

  ---

  #### Part D — Read-only reminder: "Belonging-promoting behaviors you haven't tried yet"

  **On the review screen (new Screen 8),** add a small read-only callout listing the BSS skills the kid put in the "not now" bucket (or hasn't picked at all — filter based on what data is available):

  > *Some other belonging-promoting behaviors to keep on your radar:*
  >
  > - [not-now skill 1]
  > - [not-now skill 2]
  > - …

  Framing: not asking them to commit to anything; just keeping the unused skills visible so they don't fall off the mental map.

  Sprang's meeting language: *"instead of them having to do another thing, maybe in the action plan it says: remember, here's some other belonging promoting behaviors you haven't tried yet, but it goes on the action plan so they can see it."*

  ##### D.1 — Empty-state

  If all BSS skills are in "doing now" or "willing to try," skip the callout entirely (don't render an empty section).

  ##### D.2 — Rendering location

  Renders as a small subsection at the bottom of the review keepsake card on Screen 8, below the main commitments. Also appears in the PDF export (Part F below).

  ---

  #### Part E — Safety qualifier text on belonging-promoting-behavior surfaces

  **Sprang was firm about this in the meeting**: whenever belonging-promoting behaviors are surfaced on the action plan, include an explicit qualifier reminder that these skills aren't universal.

  **Qualifier text (draft — Josh may want to tune):**

  > *A note: we don't want to use these belonging-promoting behaviors with people who get us in trouble or make us feel bad. Save them for the people who make you feel safe.*

  ##### E.1 — Where the qualifier appears

  Renders on:
  - **Screen 7** (the inclusion reflection screen from Part C) — below the checklist, above the Continue button.
  - **Screen 8** (review) — near the top of the "belonging-promoting behaviors" section of the keepsake card, before either the used behaviors (from Part C) or the not-tried-yet list (from Part D).
  - **PDF export** — same qualifier appears on the belonging-behaviors page.

  The qualifier text is the SAME on all three surfaces. Style: small, italic, muted (`text-sm italic text-slate-600`), possibly with a subtle amber-border callout box to signal "important note."

  ##### E.2 — Why this matters clinically

  Sprang's meeting quote: *"I don't want to reinforce any dangerous behavior… if the example they used was a time I felt included was with this gang of thieves because I was the most violent of the group, you know, that's not necessarily something we want to reinforce."* The qualifier keeps the intervention safe for the edge cases.

  ---

  #### Part F — PDF export: incorporate the new content

  The current 5-page PDF from Draft 39:
  1. Title page
  2. Commitments (skills + first ally)
  3. Mindset (thoughts to flip)
  4. Letter → **renamed to Words of Wisdom** (Part B)
  5. Poem

  **New page structure (6 pages):**
  1. Title page
  2. Commitments (skills + how + who + when)
  3. Mindset (thoughts to flip)
  4. **NEW: Inclusion reflection + belonging behaviors used** (Part C) + qualifier (Part E)
  5. Words of Wisdom (relabeled letter)
  6. Poem

  Add the not-tried-yet reminder (Part D) as a small callout on either the new Page 4 or in the footer of the Commitments page (Page 2) — Code's judgment based on layout fit.

  Filename convention stays `ready-for-roots-plan-{YYYY-MM-DD}.pdf`.

  ---

  #### Part G — Fix Screen 7 label typo

  Per Josh in the meeting: the review keepsake card has a label bug. It says *"letter to another"* somewhere it shouldn't, or the labeling is inconsistent between the letter section header and the callback framing.

  **Change:** audit all labels on the Plan review card (Screen 8 after renumbering) and make sure they consistently say *"Words of Wisdom"* (per Part B) rather than any mix of "letter," "letter to another," "letter to yourself." One canonical label everywhere.

  ---

  #### Updated screen count and flow (Plan v2.0)

  **Nine screens total (up from eight):**

  1. Intro
  2. Skills to try (with new "how" text input per skill)
  3. Thoughts to flip (read-only, unchanged)
  4. People in my corner (unchanged)
  5. Words of Wisdom (renamed from "Read your letter back")
  6. Who you are — full poem (unchanged)
  7. **NEW: When you felt included + behaviors checklist + safety qualifier**
  8. Your Plan (review — now includes inclusion behaviors + not-tried-yet reminder + qualifier)
  9. Saved (PNG + PDF — PDF now 6 pages)

  ---

  #### Version bump + changelog

  `plan` v1.0 → **v2.0 (MAJOR)**. Save payload grows by `skills_to_try[].how` + `inclusion_reflection.behaviors_used[]`. New required input on Screen 2. New screen (Screen 7). Renamed section (Words of Wisdom). Export columns grow.

  Prepend changelog: *"v2.0 — Round 7 (2026-07-07 meeting) restructure. Added per-skill 'How could you demonstrate this?' text input on Skills to try; renamed 'Letter to yourself' → 'Words of Wisdom' per Sprang's aha reframe; new screen surfacing the participant's Self-Reflection inclusion moment with a BPB checklist (which behaviors they were already using); safety qualifier text on all BPB surfaces per Sprang's dangerous-connection concern; read-only reminder of not-tried-yet BPBs on the review; PDF export gains a page for the inclusion reflection."*

  ---

  #### What does NOT change

  - The six upstream activities themselves (Self-Reflection, Poem, BSS, Allies, Getting Unstuck, Letter) — all unchanged.
  - Voice / video / cast section work — unchanged.
  - Pretest / Posttest / FollowUp Survey — unchanged.
  - Palette, tree, montage, summary screen — all unchanged.
  - The Plan's synthetic demo data (`src/lib/planDemoData.js`) does need updates to include: sample inclusion_text (for Screen 7 to render), sample "how" text per willing-to-try skill (Screen 2), sample inclusion behaviors selection.
  - The `/the-plan` route (from Draft 37) still resolves to the Plan activity; no routing change.

  #### Out of scope (still deferred)

  - **Real cross-activity flow integration.** Still deferred per Draft 21. The Plan reads synthetic demo data; real reads land when flow is stitched.
  - **Sending the plan to caregivers via email.** Discussed at the meeting; privacy concern flagged (participants might feel their confidentiality was breached). Not part of this draft.
  - **Print-off of psychoeducation summary material** (Ginny's idea). Also discussed; team landed on "not for this draft." Could revisit as an appendix / handout for foster parents in a future scope.
  - **Reflecting on exclusion moments** (was considered alongside the inclusion reflection). Team decided too much for one activity; inclusion-only is the scope.

  *End of Draft 43.*

  </details>

- **`7cce09e` · 2026-07-01** — Follow-up to Draft 42: the "Sam — Gender Neutral" card in Proposed Alternative Cast now uses Kai's **Variant 2 (blonde)** image instead of Variant 1. No other change to the card. Verified in preview.

- **`27177c0` · 2026-07-01** — Draft 42: added a **"Proposed Alternative Cast"** section to /demo (team review only, not shipping) + renamed Sam 16 to **Sam 18** everywhere on-screen. The alternative reimagines Kai's identity design: the current Kai V1 image is repositioned as a nonbinary Sam variant, and two new peer-mentor Kai concepts are proposed with more specific identities (early-20s Black man / woman) — both current and proposed stay visible side-by-side. **Sam 16 → 18:** display strings only (name/alt/role) on the sam-16 card; id, asset filenames, and the underlying script/video/audio are untouched. **`show` → `shows` array:** migrated every cast card off the singular `show` string so a card can appear in multiple sections (Sam 18 + Sam 14 now render in both Sam's Story and the new section); updated DemoPage's filters to `.shows.includes(...)`. **4 new assets** (kai-man.png, kai-woman.png, and two ~35s voice-sample mp3s) + **4 new cards**: Sam — Gender Neutral (reuses the existing kai-variant-1.png), Sam — Female (`placeholder: true` — dashed-outline "Coming soon" silhouette, no build yet), and Kai — Male / Kai — Female (proposed), each with an image + voice sample. New section renders after Learning Skills, before Growing your roots, with a teal-wash visual treatment and a neutral feedback-inviting intro. The current Learning Skills Kai (8 voiceover scenes, animated clip, both images) is completely untouched. No activityVersions bump. Verified in preview: Sam 18 renders twice (old "16" string gone), the new section + intro render, all 6 proposed cards show correctly, the placeholder renders exactly once, both new Kai images load, both new voice samples serve, no console errors. **Note:** shipping this draft surfaced that WORKING_NOTES.md had picked up unrelated data loss from an external edit (a truncated archived section) sitting uncommitted on disk — fixed separately in `1c8459b` by reconstructing from the last known-good commit.

  <details>
  <summary>Draft 42 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 42 — "Proposed Alternative Cast" section on /demo + Sam 16 → Sam 18 rename

  New section at the bottom of the character sections on /demo, presenting an alternative direction for the cast for team review. Also globally renames the current Sam 16 character to Sam 18 (in both the existing Sam's Story section AND the new proposed alternative section).

  The alternative direction — for team consideration, not for shipping yet — reimagines Kai's identity design. The current Kai character-design gets repositioned as the nonbinary Sam variant we've been planning, and two new Kai concepts are proposed as peer mentors with more specific identities (early-20s Black man and early-20s Black woman). Both current and proposed sections are visible side-by-side so the team can compare.

  **Approved by:** Josh, 2026-07-01.

  ---

  #### Part A — Global rename: Sam 16 → Sam 18

  Age up the current Sam narrator character from 16 to 18. Same person, same imagery, same voice, same script — just presented as older. Reflects a design decision to have the narrator read as a young adult with more distance from adolescence.

  **File:** `src/lib/castData.js`.

  **Changes to the existing Sam narrator card (currently `id: 'sam-16'`):**

  - `name`: *"Sam (16 years old)"* → *"Sam (18 years old)"*
  - `alt`: *"Sam at 16 — the narrator, two years later"* → *"Sam at 18 — the narrator, four years later"*
  - `role`: *"Our narrator — Sam two years later."* → *"Our narrator — Sam four years later."*

  **Do NOT change the `id` (`'sam-16'`).** The id is an internal identifier used by voiceSamples/videos references and by any test data. Renaming the id would cascade breakage. Just update the human-facing strings.

  **Do NOT change filenames.** `sam-16.png`, `sam-16-line-*.mp4`, etc. keep their current names — they're internal asset identifiers, not user-visible.

  **Do NOT modify the script.** Holly's Script 2.0 references "16-year-old Sam" narratively; that's fine to preserve internally. The user-facing character presentation is what's shifting.

  **Voice sample labels** on the Sam narrator card: any label currently referencing "Older Sam" (from Draft 33) can stay as-is — "Older Sam Narrator" reads correctly for an 18-year-old. If a label explicitly says "16," update to "18".

  #### Part B — Extend the `show` field to support multiple sections

  The current cast card shape from Draft 35 has a single `show: 'sams-story' | 'learning-skills'` string. For this draft, cards need to appear in **multiple sections** (Sam-18 and Sam-14 appear in both Sam's Story AND the Proposed Alternative Cast).

  **Change:** rename `show` to `shows` and make it a string array. Update all existing cards:

  - Sam-18 (was sam-16): `shows: ['sams-story', 'proposed-alternative']`
  - Sam-14: `shows: ['sams-story', 'proposed-alternative']`
  - Foster Mom, Foster Dad, Mrs. Johnson: `shows: ['sams-story']`
  - Family Photo: `shows: ['sams-story']`
  - Kai (current, from Draft 35/40/41): `shows: ['learning-skills']`

  For backward compatibility, the CastCard renderer can accept EITHER `shows: [...]` OR the legacy `show: '...'` — but since we're updating every card in this draft anyway, cleanest is to migrate fully to `shows` and delete the singular-form fallback logic.

  **Update the top-of-file comment** in castData.js to document the new `shows` array shape.

  #### Part C — Copy new assets

  Four new files.

  | Source | Destination |
  |---|---|
  | `Video Content/Kai - Man.png` | `public/cast/images/kai-man.png` |
  | `Video Content/Kai - Woman.png` | `public/cast/images/kai-woman.png` |
  | `Video Content/Kai Male Alternative.mp3` | `public/cast/audio/kai-man-voice-sample.mp3` |
  | `Video Content/Kai - Female Voice.mp3` | `public/cast/audio/kai-woman-voice-sample.mp3` |

  Both mp3s are ~35 seconds each — voice samples of the two proposed alternative Kai voices reading a shared opening line.

  #### Part D — Add four new cards to `src/lib/castData.js`

  All four cards go under `shows: ['proposed-alternative']`. Order them in this sequence in the CAST array (or grouped at the end):

  ##### Card 1 — Sam - Gender Neutral (repurposed current Kai V1)

  ```js
  {
    id: 'sam-nonbinary',
    name: 'Sam — Gender Neutral',
    shows: ['proposed-alternative'],
    image: '/cast/images/kai-variant-1.png',  // reuse the existing locked Kai V1 image
    alt: 'Sam, nonbinary variant — proposed character-design reuse of the current Kai',
    role: "Sam's nonbinary variant. Uses the character design currently in the Kai role — the gender-neutral design fits precisely here.",
  },
  ```

  Same image file as Kai's current Variant 1 (no new file needed). The label and role reframe it as the nonbinary Sam variant.

  ##### Card 2 — Sam - Female (coming soon placeholder)

  ```js
  {
    id: 'sam-female-placeholder',
    name: 'Sam — Female',
    shows: ['proposed-alternative'],
    placeholder: true,  // NEW flag — see rendering note below
    alt: 'Sam, female variant — coming soon placeholder',
    role: 'The female Sam variant. Character build not yet started.',
  },
  ```

  **Placeholder rendering:** the CastCard renderer needs a new `placeholder: true` branch. When set, render an outlined-person-silhouette SVG (or a neutral grey rectangle) in the image slot, with a small overlay label reading *"Coming soon."* No `image` field on this card; the renderer generates the placeholder visual inline.

  Simple placeholder SVG for the image slot (Code can adapt):

  ```jsx
  <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500">
    <svg viewBox="0 0 40 40" className="w-16 h-16 mb-2 opacity-40">
      {/* simple person silhouette */}
      <circle cx="20" cy="14" r="6" fill="currentColor" />
      <path d="M 8 36 Q 8 24, 20 24 Q 32 24, 32 36 Z" fill="currentColor" />
    </svg>
    <span className="text-sm italic">Coming soon</span>
  </div>
  ```

  ##### Card 3 — Kai (Male) — proposed alternative

  ```js
  {
    id: 'kai-man-alternative',
    name: 'Kai — Male (proposed)',
    shows: ['proposed-alternative'],
    image: '/cast/images/kai-man.png',
    alt: 'Kai, proposed male variant — early-20s Black young man peer mentor',
    role: "Proposed peer-mentor Kai — an early-20s Black young man. Foster-care alumni, now working with kids in the system.",
    voiceSamples: [
      {
        label: 'Voice sample',
        src: '/cast/audio/kai-man-voice-sample.mp3',
      },
    ],
  },
  ```

  ##### Card 4 — Kai (Female) — proposed alternative

  ```js
  {
    id: 'kai-woman-alternative',
    name: 'Kai — Female (proposed)',
    shows: ['proposed-alternative'],
    image: '/cast/images/kai-woman.png',
    alt: 'Kai, proposed female variant — early-20s Black young woman peer mentor',
    role: "Proposed peer-mentor Kai — an early-20s Black young woman. Foster-care alumni, now working with kids in the system.",
    voiceSamples: [
      {
        label: 'Voice sample',
        src: '/cast/audio/kai-woman-voice-sample.mp3',
      },
    ],
  },
  ```

  #### Part E — Render the new "Proposed Alternative Cast" section on `/demo`

  **Location:** at the bottom of the character sections on /demo. That's:

  - After the existing `## Sam's Story` section (from Draft 35)
  - After the existing `## Learning Skills for Belonging` section (Draft 35 + Draft 40 + Draft 41)
  - BEFORE the "Growing your roots" section and the Tests / Data export sections

  **File:** `src/pages/DemoPage.jsx`.

  **Section heading:**

  > **## Proposed Alternative Cast**

  Make it visually distinct so people notice it's different from the current cast — recommend a subtle background wash (`bg-slate-50` or `bg-ctac-teal-50/30`), a top border, and slightly larger heading spacing. It should feel like "we've entered a new consideration area," not just another cast section.

  **Intro paragraph** below the heading:

  > *An alternative direction for the cast, for team consideration. Sam gains the female + nonbinary variants we've been planning — the current Kai character-design is a natural fit for Sam — Gender Neutral (using the same locked visual). Kai's peer-mentor role is filled by two new options here, both early-20s Black young adults, to test whether more specific representation lands better with the target audience of foster youth in Kentucky. Curious what the team thinks.*

  Copy is intentionally neutral and invites feedback rather than declaring the alternative better. Josh can edit before shipping if the tone needs adjusting.

  **Card render order** (filter by `shows.includes('proposed-alternative')`):

  1. Sam (18 years old) — same card as in Sam's Story, rendered here again
  2. Sam (14 years old) — same card as in Sam's Story, rendered here again
  3. Sam — Gender Neutral (repurposed Kai V1 image)
  4. Sam — Female (coming soon placeholder)
  5. Kai — Male (proposed) — image + voice sample
  6. Kai — Female (proposed) — image + voice sample

  Same CastCard component handles all six — the renderer just filters the CAST array by `shows.includes('proposed-alternative')` and iterates.

  #### What does NOT change

  - **The current Kai in the Learning Skills for Belonging section stays exactly as today.** All 8 voiceover scenes, the animated clip, both Kai image variants — untouched. This draft ADDS a proposed alternative section for review; it does not remove or modify the current state.
  - **All other cast cards** — untouched apart from the Sam-16 → Sam-18 display rename.
  - **Sam's Story section** — same cards render there as today (with Sam-18's new display strings).
  - **Voice pipeline, tree, montage, summary, Plan, palette** — unchanged.
  - **No `activityVersions.js` bump** — DemoPage section addition.
  - **No changes to the underlying Sam narrator video clips or audio** — they still contain Sam at 16 narratively; only the display presentation shifts to "18."

  #### Out of scope (deferred pending team feedback)

  - **The full character-build production for the new Kai variants** — image generation is the pre-work Josh is doing outside the code. Once locked, the Character Builder session on Open Arts will produce the reference set.
  - **Building the actual Sam-Female character** — this draft ships a "coming soon" placeholder; the real build happens IF the alternative direction is approved by the team.
  - **The full voiceover sets for the proposed Kai variants** — this draft ships one ~35s voice sample per variant so the team can hear each voice. Full 8-scene voiceover sets happen after the team picks a direction.
  - **Removing the current Learning Skills Kai** — explicitly NOT part of this draft. The current Kai stays intact so the team can compare side-by-side. If the alternative is approved by the team, a follow-up draft would migrate the Learning Skills section over.
  - **Renaming the Sam narrator video clips / audio files** — filenames stay `sam-16-*.mp4` and `sam-16-*.mp3` etc. Internal identifiers; not user-visible.

  *End of Draft 42.*

  </details>

- **`6562600` · 2026-06-30** — Draft 41: put the **first Kai animated clip** on the demo. Josh's first rendered Kai animation (`Kai Demo 1.mp4` — the opening of Scene 1, ~35s, vertical 9:16) — the parallel moment to Sam Line 1 landing, first animated proof-of-concept for the visual direction. Copied the mp4 into `public/cast/video/kai-demo-1.mp4` (~4.7 MB, `preload=metadata`); added a `videos` array to Kai's card (label/src/caption/durationSeconds). The CastCard now renders `videos` as a **featured bordered block above the main content** — so Kai shows the animation preview AND the Draft 40 voiceover scenes (previously scenes/videos/lines were mutually exclusive). Reused the existing video player (native mp4 via `src`, YouTube embed via `youtubeId`), relocated it out of the precedence chain, and updated the doc comment. No version bump. Verified in preview: featured "First animated scene preview" block renders the clip + caption with the 8 voiceover scenes still below it (single video element, no double-render); mp4 serves; no console errors.

  <details>
  <summary>Draft 41 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 41 — First Kai animated clip on the demo

  First piece of Kai animation is rendered — Josh's `Kai Demo 1.mp4` covers the opening of Scene 1 ("Hi, I'm Kai…"). ~35 seconds of vertical 9:16, self-hosted (same pattern as Sam's mp4s from Drafts 31 and 33). Add it to the Kai card as a featured "First animated scene preview" block above the Draft 40 voiceover scenes block.

  This is the parallel moment to Sam Line 1 landing — first animated proof-of-concept for the visual direction. The remaining scenes are still audio-only on the card; this clip gives the team something to react to on the animation side.

  **Approved by:** Josh, 2026-06-30.

  #### Part A — Copy the mp4 into `public/cast/video/`

  | Source | Destination |
  |---|---|
  | `Video Content/Kai Demo 1.mp4` | `public/cast/video/kai-demo-1.mp4` |

  ~4.7 MB. Native `<video controls preload="metadata">` keeps the up-front fetch tiny.

  #### Part B — Add a `videos` array to Kai's card in `src/lib/castData.js`

  Currently Kai has `images`, `scenes`, plus the `show: 'learning-skills'` grouping field. Add a new optional `videos` field — array shape (so future Kai animation clips extend the same shape without another refactor):

  ```js
  videos: [
    {
      label: 'First animated scene preview',
      src: '/cast/video/kai-demo-1.mp4',
      caption: "The opening of Scene 1 — The Scan. Covers the first ~35 seconds. The rest of the animation is in production.",
      durationSeconds: 35,
    },
  ],
  ```

  Per-entry shape:
  - `label` (string) — section heading
  - `src` (string) — absolute URL to the mp4
  - `caption` (string) — italic line beneath the player explaining what the clip is
  - `durationSeconds` (number, optional) — for future use if a "Kai animation total runtime" footer ever makes sense; not displayed in this draft

  #### Part C — Render `videos` in CastCard above the `scenes` block

  The CastCard render order on Kai's card becomes:

  1. Photo grid (Variant 1 + Variant 2) — existing
  2. Role line — existing
  3. **NEW: `videos[]` featured block** — renders each video entry as: label (small bold heading) → native vertical 9:16 video player (320px-capped, same pattern as Sam 16's mp4 render from commit `516a330`) → italic caption underneath
  4. The Draft 40 "Kai's voiceover (all 8 scenes)" block — existing

  For the per-video rendering, follow the Sam 16 video player pattern Code already implemented:

  ```jsx
  <div className="mt-6 first:mt-0">
    <h4 className="text-base font-semibold text-ctac-navy mb-3">
      {video.label}
    </h4>
    <div className="mx-auto w-full max-w-[320px]">
      <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
        <video
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full rounded-2xl border border-ctac-teal-200"
        >
          <source src={video.src} type="video/mp4" />
        </video>
      </div>
      {video.caption && (
        <p className="mt-2 text-center text-sm text-slate-600 italic">
          {video.caption}
        </p>
      )}
    </div>
  </div>
  ```

  Wrap the videos block in a subtle visual separator (top + bottom border in `border-ctac-teal-200`, similar to how the Draft 40 voiceover block has its own bordered section).

  If the CastCard already had a `videos` render branch in the renderer (from Sam 16's old Draft 31 implementation that got removed in Draft 33), reuse and adapt — don't reimplement. Per Draft 33's notes, the videos branch was "kept in the renderer for future re-introduction," so it should still be there.

  #### What does NOT change

  - Kai's image variants, role line, voiceover scenes block (from Draft 40) — all unchanged.
  - The Sam's Story section, all other cast cards — unchanged.
  - The CTAC palette, tree visuals, montage, summary screen — unchanged.
  - The Plan activity — unchanged.
  - No version bump (DemoPage section).

  #### Out of scope (deferred)

  - **Additional Kai animation clips.** As more scenes are animated, they extend the same `videos[]` array on Kai's card. When 4+ clips exist, worth considering a "show all animations" / collapsed-by-default layout to keep the card compact.
  - **The remaining ~16s of Scene 1** that aren't in this first animated clip. The voiceover scene below still plays the full 51 seconds.
  - **Stitching animations to the matching voiceover scene.** Currently the animated clip and the audio scene are presented separately (animation block on top, voiceover scenes below). Could be combined later — when a scene has a matching animated clip, swap the audio player for the video player inline. Defer until enough scenes are animated to make that worthwhile.

  *End of Draft 41.*

  </details>

- **`176e242` · 2026-06-30** — Follow-up tweaks from Josh's review of Drafts 38/40. (1) **Kai Variant 2 reswapped** again — the Draft 38 render is replaced by `Light skinned blonde Kai.png` (the team's chosen version); Variant 1 still the locked primary. (2) Removed the "Recorded through the Voice Changer pipeline (Josh → ElevenLabs → Kai's locked voice)…" paragraph from Kai's voiceover header block. (3) Removed the "The psychoeducation track that wraps the six activities…" intro paragraph under the Learning Skills heading. (4) **Plan v1.0 → v1.1:** Screen 2 heading "Skills you said you'd try." → **"New Skills to Try"**. No data-shape change. Verified in preview.

- **`5c6afb0` · 2026-06-30** — Draft 40: put **Kai's full 8-scene voiceover** on the demo. All 8 narration scenes are recorded through the Voice Changer pipeline (Josh → ElevenLabs → Kai's locked voice); this replaces the 2 stale Draft 35 preview clips with the complete set so Sprang + Holly + Adrienne can validate Kai end-to-end before animation. Copied the 8 final mp3s into `public/cast/audio/` (~6.5 MB; the 2 superseded previews left unreferenced per the cleanup pattern). Extended the castData `scenes` shape with `text` (full spoken script, verbatim from the demo doc), `duration`/`durationSeconds`, and an optional `handoff` (the activity each scene leads into), and replaced Kai's scenes array with all 8 in narrative order. The CastCard now renders a header ("Kai's voiceover (8 scenes)") with **total runtime computed from durationSeconds (6:27)**, then per scene: label + duration + "→ handoff" + the full italic script + an `<audio preload=metadata>` player, then a footer recap. No version bump (demo surface). Verified in preview: 8 scenes with scripts, 6 handoffs (scenes 4 + Conclusion correctly have none), runtime 6:27, mp3s serve, no console errors. Cleanup note: the 2 old preview clips (`kai-scene-1-the-scan.mp3`, `kai-scene-2-the-why.mp3`) are now unreferenced — deletable in a future cleanup commit.

  <details>
  <summary>Draft 40 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 40 — Kai's full voiceover set on the demo (all 8 scenes, with scripts + durations + total runtime)

  All 8 Kai scenes are recorded and processed through the voice pipeline (Josh records → ElevenLabs Voice Changer → Kai's target voice). The 2 preview scenes on Kai's card (from Draft 35) are stale — final versions are now in `Video Content/New Voiceover/Kai Script/Final VoiceOver/`. Expand Kai's card to show **all 8 scenes** with the **full spoken text printed alongside each clip**, each scene's **duration**, and **total runtime (6:27)** displayed at the top and bottom of the scene list.

  Goal of this expansion: let the team experience Kai's narration end-to-end (script + voice paired), see how each scene hands off to its activity, and understand the runtime footprint of the psychoeducation track. This is the demo surface that lets Sprang + Holly + Adrienne validate Kai's voice work in full before the animation production starts.

  **Approved by:** Josh, 2026-06-30.

  ---

  #### Part A — Copy the 8 mp3s into `public/cast/audio/`

  | Source | Destination | Duration |
  |---|---|---|
  | `Final VoiceOver/Kai - The Scan Scene 1.mp3` | `public/cast/audio/kai-pt1-scene-1-the-scan.mp3` | 0:51 |
  | `Final VoiceOver/Scene 2 the Why.mp3` | `public/cast/audio/kai-pt1-scene-2-the-why.mp3` | 0:35 |
  | `Final VoiceOver/Scene 3 Building a Safety Net.mp3` | `public/cast/audio/kai-pt1-scene-3-safety-net.mp3` | 1:19 |
  | `Final VoiceOver/Scene 4 the foster care extra level.mp3` | `public/cast/audio/kai-pt1-scene-4-extra-level.mp3` | 0:40 |
  | `Final VoiceOver/Part 2 Scene 1 Building skills.mp3` | `public/cast/audio/kai-pt2-scene-1-building-skills.mp3` | 1:09 |
  | `Final VoiceOver/Part 2 scene 2 The roadblocks.mp3` | `public/cast/audio/kai-pt2-scene-2-roadblocks.mp3` | 0:31 |
  | `Final VoiceOver/Part 2 scene 3 putting it all together.mp3` | `public/cast/audio/kai-pt2-scene-3-putting-it-all-together.mp3` | 1:06 |
  | `Final VoiceOver/Conclusion.mp3` | `public/cast/audio/kai-conclusion.mp3` | 0:16 |

  Combined size ~6.5 MB. Total runtime **6:27** (387 seconds).

  The two preview mp3s from Draft 35 (`kai-scene-1-the-scan.mp3` and `kai-scene-2-the-why.mp3`) are superseded by the final versions. Leave the old files in place (unreferenced) per the established cleanup pattern, OR delete them — Code's call.

  #### Part B — Extend the `scenes` shape in `src/lib/castData.js`

  The current scenes shape (from Draft 35) is `{ label, audio, description }`. Extend to support:

  - `label` (string, existing) — the scene title, e.g., *"Part I, Scene 1 — The Scan"*
  - `audio` (string, existing) — absolute URL to the mp3
  - `text` (string, **new**) — the full spoken script for this scene, verbatim from `Script for Demo.docx`. Displays below the label so the team can read along while listening.
  - `duration` (string, **new**) — formatted duration string, e.g., *"0:51"*. Displays in the label row.
  - `durationSeconds` (number, **new**) — numeric duration for summing the total runtime. Same value as duration, just in seconds.
  - `handoff` (string, **new** optional) — the activity this scene hands off to, e.g., *"Self-Reflection"*. Displays alongside the duration in the label row. Omit for the bridge scene and the conclusion.
  - `description` (existing, **deprecated for Kai**) — was the duration-summary line; now unused on Kai's scenes since duration + handoff display directly. Other cards can keep using `description` if helpful.

  #### Part C — Replace Kai's `scenes` array with all 8 final scenes

  Update the Kai card's `scenes: [...]` array with the 8 final scene entries. Use the spoken text from `Final VoiceOver/Script for Demo.docx` verbatim. Quick reference for each:

  ##### Scene 1 — Part I: The Scan

  ```js
  {
    label: 'Part I, Scene 1 — The Scan',
    audio: '/cast/audio/kai-pt1-scene-1-the-scan.mp3',
    duration: '0:51',
    durationSeconds: 51,
    handoff: 'Self-Reflection',
    text: "Hey. I'm Kai. I spent time in foster care too, so I know the drill. Now, I get to help other kids in the system and share some of the life hacks I've picked up. I'm glad you're here, because we're talking about something we all deal with 24/7: Belonging. Think about that moment when you walk into a crowded cafeteria or a new class. You're scanning the room, right? Your brain is doing a million calculations per second: Who looks cool? Who looks mean? Where's my spot? That \"scan\" isn't you being awkward — it's actually your brain trying to protect you. It's looking for safety, connection, and a place to land. Because let's be real: feeling like you don't fit in is more than just a bummer. It actually hurts. It can be confusing, lonely, and make it hard to know who you even are. Let's take a minute to think about this some more.",
  },
  ```

  ##### Scene 2 — Part I: The Why (It's in Your DNA)

  ```js
  {
    label: "Part I, Scene 2 — The Why (It's in Your DNA)",
    audio: '/cast/audio/kai-pt1-scene-2-the-why.mp3',
    duration: '0:35',
    durationSeconds: 35,
    handoff: 'Who I Am Poem',
    text: "So, why are our brains so obsessed with fitting in? Basically, belonging isn't just a \"nice to have\" type of thing — it's a survival requirement, right up there with food, sleep, and having a roof over your head. Back in the day, being part of a group meant you didn't go hungry or get eaten by a saber-toothed tiger. Today, it's still wired into our biology. We need to feel accepted, respected, and \"seen\" for who we actually are — including our culture, our history, and where we come from. This activity can help you think about some of these things.",
  },
  ```

  ##### Scene 3 — Part I: Building a Safety Net

  ```js
  {
    label: 'Part I, Scene 3 — Building a Safety Net',
    audio: '/cast/audio/kai-pt1-scene-3-safety-net.mp3',
    duration: '1:19',
    durationSeconds: 79,
    handoff: 'Allies / Safety Net',
    text: "We know belonging is a basic need, but here's the secret: you don't just need one place to belong. You need a few. Think of it like a safety net. If one string snaps — like after a fight with a friend — the other strings catch you. We need this safety net because it provides different types of support for us to change and grow, providing the \"green light\" to try new things. It's a lot easier to take risks, like joining a team or trying out for a play, when you know you've got a crew behind you — both in and outside of your home. One thing that can really help is having an adult that you can talk to or trust for advice. In high school, I had this one teacher who actually \"got\" me, and it changed the whole vibe of a really tough year because I could count on her for emotional and practical support. Social support is important too. You've probably noticed that your friend group matters way more these days. When building your crew, think of it like a GPS. If you hang with a group that's constantly in trouble or giving up on school, it's easy to get redirected down that same path. But if you find people who are hyped about your goals? They become your literal social support system, helping you figure it out along the way. It's good to think about who you are and what kind of safety net you might need. This next activity will help you do that.",
  },
  ```

  ##### Scene 4 — Part I: The Foster Care "Extra Level"

  ```js
  {
    label: 'Part I, Scene 4 — The Foster Care "Extra Level"',
    audio: '/cast/audio/kai-pt1-scene-4-extra-level.mp3',
    duration: '0:40',
    durationSeconds: 40,
    // no handoff — this is the bridge to Part II
    text: "Look, everyone struggles with figuring out where they belong at times, but for those of us growing up in foster or relative care? It's like playing the Belonging Game on \"Hard Mode.\" While other kids are just worried about where to sit in the cafeteria, we're dealing with moving houses, switching schools, or leaving our siblings and old neighborhoods behind. It's stressful. Sometimes you feel guilty for liking a new placement — like you're being disloyal to your family. Or you feel like you can't fully trust anyone because you've had to move so many times. I know it's tough, but these strategies we're learning can help you find your people and begin to feel more at home — no matter where you're living.",
  },
  ```

  ##### Scene 5 — Part II: Building Skills for Belonging

  ```js
  {
    label: 'Part II, Scene 1 — Building Skills for Belonging',
    audio: '/cast/audio/kai-pt2-scene-1-building-skills.mp3',
    duration: '1:09',
    durationSeconds: 69,
    handoff: 'Belonging Skills Sort',
    text: "Belonging isn't just a place you land; it's something you build, brick by brick, with the people around you — whether that's a foster family, friends, teammates or others. Here are a few skills that help. When others talk, try Active Listening. Don't just wait for your turn to speak; actually try to catch what they're saying. It makes people feel understood and safe. When things get tense, aim for Conflict Resolution. It's not about winning; it's about solving the problem in a way that the relationship survives the argument. Try to use Inclusive Language like we, us, and our group, and include others in conversations and activities. Take a risk and invite others to join you, and chances are they will want to return the favor! Finally, Provide Support by being the person who shows up when a friend or family member needs help, and being brave enough to Express Gratitude can build emotional bridges between you and your friends and family. I know, it might feel cringe at first, but these efforts reinforce that others matter to you and can deepen our bonds. This next activity can help you think about how to use these skills.",
  },
  ```

  ##### Scene 6 — Part II: The Roadblocks

  ```js
  {
    label: 'Part II, Scene 2 — The Roadblocks',
    audio: '/cast/audio/kai-pt2-scene-2-roadblocks.mp3',
    duration: '0:31',
    durationSeconds: 31,
    handoff: 'Getting Unstuck',
    text: "Sometimes belonging feels impossible because of things you can't control, like switching schools mid-year. When you hit those roadblocks, your brain might try to protect you with some unhelpful thoughts. For example: All-or-Nothing Thinking — having thoughts like \"I'll never fit in here\" that keep you from trying to connect to others. Or Holding onto the Past — staying so focused on thinking about who we lost that we can't let anyone new in. This next activity will help you learn to challenge unhelpful thoughts like these.",
  },
  ```

  ##### Scene 7 — Part II: Putting It All Together

  ```js
  {
    label: 'Part II, Scene 3 — Putting It All Together',
    audio: '/cast/audio/kai-pt2-scene-3-putting-it-all-together.mp3',
    duration: '1:06',
    durationSeconds: 66,
    handoff: 'Letter to Another Youth',
    text: "And another potential roadblock? Self-Regulation or Self-Control. The challenge is to be able to feel that sting of \"maybe they don't like me\" and being able to breathe through it so you don't just bail or shut down when things get awkward or scary. My friend Ash used to go silent every time she moved homes because she thought, \"they're just going to move me again anyway.\" Her silence was like a shield that's too heavy — it kept her safe from getting hurt, but it also kept her totally alone. Do you have some good strategies to keep calm at these moments? We can give you a list of skills to practice if you need ideas. And finally, it helps to realize that a lot of belonging happens in our own heads. Instead of a fixed mindset, try a growth mindset. Making friends and connections is a skill you practice, not something you're just born with. If one placement or social situation doesn't work out, it's not a permanent fail — it's just one data point and we can keep working on it. Now that you've learned more about this, what might you tell another kid worried about whether they belong?",
  },
  ```

  ##### Scene 8 — Conclusion

  ```js
  {
    label: 'Conclusion',
    audio: '/cast/audio/kai-conclusion.mp3',
    duration: '0:16',
    durationSeconds: 16,
    // no handoff — this is the end
    text: "Finding that sense of belonging can be tough for everyone, and it's even harder when you are in foster or relative care. But remember: your story isn't over just because the current chapter has been a little chaotic. You've got new skills now — give them a try!",
  },
  ```

  **Order:** the array order above is the playback / narrative order. Render the scenes in this order, top to bottom.

  **Update the top-of-file comment block** in castData.js to note the new `scenes` shape fields (`text`, `duration`, `durationSeconds`, `handoff`) and to mention the 8-scene Kai voiceover landed 2026-06-30.

  #### Part D — Update CastCard rendering in `src/pages/DemoPage.jsx`

  The CastCard already renders `scenes[]` per Draft 35 (per-scene label + audio + optional description). Extend the renderer for Kai's expanded shape.

  **Block structure above the scenes list** (rendered once, just below Kai's image grid + role line):

  ```jsx
  <div className="mt-6 border-t border-ctac-teal-200 pt-6">
    <div className="flex items-baseline justify-between mb-4">
      <h4 className="text-lg font-semibold text-ctac-navy">Kai's voiceover (all 8 scenes)</h4>
      <div className="text-sm text-slate-600 italic">
        Total runtime: <span className="font-semibold text-ctac-navy">6:27</span>
      </div>
    </div>
    <p className="text-sm text-slate-600 mb-4">
      Recorded through the Voice Changer pipeline (Josh records → ElevenLabs → Kai's locked voice).
      Each scene introduces or follows one of the six activities.
    </p>
    {/* scenes loop here */}
  </div>
  ```

  **Per-scene rendering:**

  ```jsx
  <div className="mt-6 first:mt-0 pb-6 border-b border-slate-100 last:border-b-0">
    <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
      <h5 className="text-base font-semibold text-ctac-navy">{scene.label}</h5>
      <div className="text-sm text-slate-600">
        <span className="font-medium">{scene.duration}</span>
        {scene.handoff && (
          <span className="ml-3 text-slate-500">→ {scene.handoff}</span>
        )}
      </div>
    </div>
    <p className="text-sm text-slate-700 leading-relaxed italic mb-3">
      "{scene.text}"
    </p>
    <audio controls preload="metadata" className="w-full max-w-md">
      <source src={scene.audio} type="audio/mpeg" />
    </audio>
  </div>
  ```

  **Block below the scenes list** (footer recap):

  ```jsx
  <div className="mt-6 pt-4 border-t border-ctac-teal-200 text-sm text-slate-600 italic text-center">
    Total runtime: <span className="font-semibold text-ctac-navy not-italic">6:27</span>
     · 8 scenes wrapping the 6 activities.
  </div>
  ```

  The total runtime (6:27) can be hardcoded **OR** computed from the sum of `durationSeconds` across the scenes array. Computing it dynamically is cleaner — when scenes are added/removed later (e.g., variant Kai recordings), the total updates automatically. Recommend computing: `Math.floor(total/60) + ':' + String(total%60).padStart(2,'0')`.

  #### What does NOT change

  - Kai's two image variants (Variant 1 + Variant 2 with the blonde update from Draft 38) — unchanged.
  - Kai's `role` line and `show` grouping — unchanged.
  - The Sam's Story section, all other cast cards, the rest of /demo — unchanged.
  - Other cards' scenes / lines / description / voiceSamples shapes — unchanged (the new `text`, `duration`, `durationSeconds`, `handoff` fields are optional and only Kai uses them currently).
  - No version bump — DemoPage section + castData expansion, not an activity.

  #### Out of scope (deferred)

  - **Removing the two superseded preview mp3s** (`kai-scene-1-the-scan.mp3` + `kai-scene-2-the-why.mp3`) from `/public/cast/audio/`. They're now unreferenced. Leave in place per the established cleanup-decision pattern, OR delete in a separate cleanup commit later.
  - **Kai variant voicings.** If female / nonbinary Kai variants get separate voice recordings later, they'd extend the same shape (new `voiceSamples`-style field, or a `variants` array on each scene).
  - **Continuous playback** (play all 8 scenes in sequence). Each scene plays independently for now. A "play all" affordance could be a follow-up if reviewers want it.
  - **Scene-to-activity deep links.** The `handoff` field is display-only — not a hyperlink. Could become a clickable shortcut to that activity's sandbox in a follow-up.

  *End of Draft 40.*

  </details>

- **`ba00403` · 2026-06-30** — Draft 39: built **“Your Plan”**, the seventh Ready for Roots activity (the action plan that’s been parked since Round 4). An 8-screen paginated activity that turns the kid’s work across the other six into a takeable commitment document: intro → **skills to try** (each willing-to-try skill gets a *who* dropdown from the kept allies + a *when* chip group) → **thoughts to flip** (read-only flip cards from the Getting Unstuck picks) → **people in my corner** (kept allies by support type + Strengthen commitments + pick-one-ally-to-reach-out-first) → **read your letter back** (+ optional “What sticks out?” reflection) → **who you are** (the full poem) → **review** → **saved**, with a **PNG** keepsake (cream keepsake SVG via the existing rasterizer) and a **5-page PDF** (jsPDF, lazy-loaded: title / commitments / mindset / letter / poem). Reads synthetic content from `src/lib/planDemoData.js` (real cross-activity pull-forward stays deferred per Draft 21 — when the flow is stitched, the demo reads swap for real per-kid reads and the component is unchanged). Save payload: `{ skills_to_try[], first_ally_outreach, letter_reflection, saved_at }`. Registered in testRegistry so it auto-lists on /demo (now **Activities (7)**) and serves at `/demo/sandbox/plan`; `activityVersions` gains plan v1.0; `exportFlatten` gains the `plan_*` columns (forward-looking — they populate once the Plan is in a published snapshot). `/the-plan` (the montage closer CTA from Draft 38) now redirects into the real activity; the placeholder page was removed. Fonts unchanged (out of scope). Verified end-to-end in preview: all 8 screens, Continue gating, chips/selects, the save payload matches spec, PNG download fires + jsPDF makes a valid multi-page blob, /the-plan redirects, cold-load console clean. **Cleanup queue:** the long-standing “BSS pull-forward to action plan” and “Allies Strengthen pull-forward” items are now addressed by the Plan.

  <details>
  <summary>Draft 39 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 39 — Build "Your Plan" (The Plan activity demo)

  The seventh activity in the Ready for Roots arc — the one that's been parked as "the action plan, coming when the flow integrates" since Round 4. This draft builds it now as a standalone activity with hardcoded synthetic content, mirroring the same /demo/sandbox pattern as the other six. When real cross-activity flow integration eventually lands, the synthetic content reads get swapped for real persisted reads.

  The Plan's job: turn the kid's work across the six activities into a single, takeable, action-oriented commitment document. *"You did the work — here's what you're going to do with it."*

  **Three pulled-forward sections + a saveable keepsake.**

  **Approved by:** Josh, 2026-06-29.

  ---

  #### Part A — New activity file: `src/activities/Plan.jsx`

  Paginated activity following the same shape as the other six. **Eight screens:**

  1. **Intro** — sets the frame.
  2. **Skills to try** (pulls from BSS willing-to-try) — kid commits to who + when per skill.
  3. **Thoughts to flip** (pulls from Getting Unstuck picks) — read-only, no inputs.
  4. **People in my corner** (pulls from Allies / Safety Net) — kid picks one ally + when to reach out first.
  5. **Read your letter back** (pulls from Letter to Another Youth) — read-only, with an optional reflection prompt.
  6. **Who you are** (pulls from Who I Am Poem) — the kid's full poem as a grounding anchor, read-only.
  7. **Your Plan** — review screen showing everything they committed to.
  8. **Saved** — confirmation + save-as-image (PNG) + save-as-PDF affordances.

  ##### Screen 1 — Intro

  Heading: *"Your Plan."*

  Body copy:
  > *You worked through a lot. Now let's turn what you found into something you can carry with you. We're going to pull together the skills you wanted to try, the thoughts you've been working on, and the people in your corner — and you'll decide what you want to do first.*

  Continue button → Screen 2.

  ##### Screen 2 — Skills to try (the core action-generating section)

  Heading: *"Skills you said you'd try."*

  Sub-line: *"Pick who you'll try each one with, and when."*

  For each willing-to-try skill (from BSS payload's `willing_to_try` array — or the demo synthetic equivalent), render a card containing:

  - **Skill name** as the card title (e.g., *"Active Listening"*).
  - A short helper line under the title — could be the skill's definition pulled from the BSS skill registry, or omitted if it makes the card too dense. (Code's call — recommend including for clarity.)
  - **"Who could you try this with?"** — a `<select>` populated from the kid's kept allies (from Allies payload's `allies` filtered by `removed_via_inspect` exclusion). Options: each ally's display name, plus a final "Someone else…" option that reveals a text input.
  - **"When could you try it?"** — a chip group with these options: `"This week"`, `"This month"`, `"When the moment shows up"`, `"Other…"`. Tapping "Other…" reveals a short text input.

  Stack the cards vertically. If the demo synthetic data has 3 skills, that's 3 cards on this screen. If a real kid had 6 willing-to-try skills, that's 6 cards — still vertical.

  **Skip / continue logic:** the kid doesn't have to fill in *every* card. Continue is enabled as soon as the kid completes one full (skill + who + when) commitment, OR they can tap a separate "Skip for now" button that advances without saving any plan commitments. (Same flexibility as Strengthen step in Allies — don't force completion.)

  Continue button → Screen 3.

  ##### Screen 3 — Thoughts to flip (read-only)

  Heading: *"Thoughts you've been working on."*

  Sub-line: *"When these show up next, here's what you can tell yourself."*

  For each Getting Unstuck `selected: true` appraisal (the picked-and-worked thoughts), render a card:

  - **"When this comes up:"** with the appraisal's `text` (the original absolute statement) below in italic-quoted style.
  - **"Tell yourself:"** with the kid's own `response` (if `strategy === 'challenge'`) or `and_statement` (if `strategy === 'both_and'`), below in bold ctac-navy.
  - Subtle visual distinction so it reads as a flippable pair, not just two paragraphs.

  No inputs on this screen. The work was already done in Getting Unstuck; this surfaces it as a pocket-card reminder.

  Continue button → Screen 4.

  ##### Screen 4 — People in my corner

  Heading: *"Your people."*

  **Top block — kept allies grouped by support type:**

  Three small sections (Practical / Emotional / Social), each listing the kid's kept allies from that support type with their existing per-type color coding (amber / rose / sky). Compact horizontal layout if there's space, vertical if mobile.

  **Strengthen commitments callout:**

  Below the allies, surface each Strengthen commitment the kid made in Allies as a quoted callout — e.g., *"For practical support: I'll ask Foster Mom to drive me to practice this week."* — color-coded by type. Same pattern as the Allies Final Review screen.

  **The action prompt:**

  Below the commitments, one prompt:

  > *Pick one ally to reach out to first.*

  - A `<select>` populated from all the kept allies (no support-type grouping — just a flat list).
  - **"When will you reach out?"** — same chip group as Screen 2 (`"This week"` / `"This month"` / `"When the moment shows up"` / `"Other…"`).

  Continue button → Screen 5.

  ##### Screen 5 — Read your letter back

  Heading: *"Read your letter back."*

  Sub-line: *"You wrote this for another kid. Now read it as if you wrote it for yourself."*

  Below the sub-line, the kid's letter text rendered in a quoted keepsake-card layout. **Reuse the existing keepsake-card styling from Letter v2.3** so the surface visually echoes where they originally saved it — cream background, soft border, italic-quote treatment.

  Below the letter, a small **optional** reflection prompt:

  > *What sticks out?*

  A short text input (200-char max) below the prompt, clearly labeled as optional with a small *"Skip if you'd rather not"* helper text beside it. Saves to `plan_letter_reflection` if filled, null otherwise.

  Continue button advances regardless of whether the kid fills the reflection.

  Continue button → Screen 6.

  ##### Screen 6 — Who you are (the full poem)

  Heading: *"Who you are."*

  Sub-line: *"When the work gets hard, come back to this. Take it with you."*

  Below the sub-line, the kid's **full Who I Am Poem** rendered in the same keepsake-card layout the poem activity uses for its final save view (line-by-line, with the 10-line structure including the mirrored lines 6 and 10 showing line 1's text). Same warm cream background as the poem's keepsake.

  No inputs. Read-only grounding moment.

  Continue button → Screen 7.

  ##### Screen 7 — Your Plan (review)

  Heading: *"Here's your plan."*

  Below the heading, a comprehensive summary card showing everything they committed to and everything they're carrying with them:

  - **Skills you'll try** — list of the skill + who + when commitments from Screen 2.
  - **Thoughts to flip** — abbreviated version of Screen 3, just the "Tell yourself" lines without the original-thought header.
  - **First ally to reach out to** — the picked ally + when from Screen 4.
  - **Letter to yourself** — short quoted excerpt from the letter (first sentence or first ~120 chars + "…" if longer; the full letter is saved separately in the export and surfaces in full on the PDF).
  - **Who you are** — the kid's full poem rendered the same way as on Screen 6.

  Styled as a single long keepsake-card with a subtle border, ctac-teal-50 background, soft shadow, generous vertical spacing between sections. This is the page the kid would save / print / hand to their case worker.

  Below the keepsake card:

  - A primary "Save my plan" button → triggers Screen 8.
  - A secondary "Back" link to Screen 6 if they want to change something on an earlier screen.

  ##### Screen 8 — Saved + keepsake (PNG and PDF)

  Heading: *"Saved."*

  Body: *"This is yours. Come back to it any time."*

  Render:

  - The same keepsake-card from Screen 7 (the kid's full plan).
  - A **"Save as image (PNG)"** button — reuses `downloadSvgElementAsPng` or `downloadSvgStringAsPng` from `src/lib/imageDownload.js`. Generates a tall single-image PNG of the whole plan with footer *"Ready for Roots · {date}"*. Best for sharing on phone (text to a friend, save to camera roll).
  - A **"Save as PDF"** button — generates a multi-page PDF using `jspdf` (already a transitive dependency in the project per Draft 11's `imageDownload.js`). Suggested PDF structure:
    - **Page 1 (title page):** *"Your Plan"* heading, the kid's name placeholder (or generic *"Your Plan"* if no name is captured), today's date, the *"This is yours. Come back to it any time."* copy.
    - **Page 2 (commitments):** Skills you'll try + First ally to reach out to.
    - **Page 3 (mindset):** Thoughts to flip pairs.
    - **Page 4 (letter):** The full letter text (not the excerpt — the whole thing).
    - **Page 5 (poem):** The full 10-line poem.
    - Footer on every page: *"Ready for Roots · {date} · Page N of 5"*.
    - Use Arial / system sans throughout (font swap is out of scope per Draft 37).
    - PDF filename: `ready-for-roots-plan-{YYYY-MM-DD}.pdf`.
  - A **"Back to /demo"** link.

  Both PNG and PDF render the same content, just optimized for different use cases:
  - **PNG** = the kid's phone-shareable keepsake.
  - **PDF** = the document a case worker, foster parent, or therapist can read or print.

  #### Part B — Data shape

  Save payload:

  ```js
  {
    saved_at: "2026-06-29T...",
    skills_to_try: [
      {
        skill_id: "active-listening",        // matches BSS skill registry
        skill_text: "Active Listening",      // display copy at save time
        who: "Foster Mom",                   // ally name OR text from "Someone else..."
        who_is_ally: true,                   // false when "Someone else..." used
        when: "This week",                   // one of the chip values OR text from "Other..."
        when_is_freetext: false,
      },
      // ... one entry per skill the kid filled in
    ],
    first_ally_outreach: {
      ally: "Mrs. Garcia",                   // ally name from the kept allies list
      when: "This week",                     // same shape as above
      when_is_freetext: false,
    },
    letter_reflection: null,                 // string OR null — Screen 5 optional input
    // Note: thoughts-to-flip (Screen 3), letter callback (Screen 5 display), and
    // identity anchor (Screen 6) are read-only views of other activities' outputs —
    // nothing new saved for those beyond the optional letter_reflection.
  }
  ```

  #### Part C — Export pipeline (`src/lib/exportFlatten.js`)

  Add `plan_*` column mappings:

  - `plan_completed` (bool: did the kid save the plan).
  - `plan_n_skills` (int: count of skills the kid completed commitments for).
  - `plan_skill_1_text` ... `plan_skill_8_text` (one per BSS item — only populated if that skill was in their willing-to-try AND they completed a commitment for it).
  - `plan_skill_1_who` ... `plan_skill_8_who`.
  - `plan_skill_1_when` ... `plan_skill_8_when`.
  - `plan_first_ally`.
  - `plan_first_when`.
  - `plan_letter_reflection` (text or null — the optional Screen 5 reflection).

  Pattern matches BSS's per-item export shape from commit `0415172` — the variable-length willing-to-try list expands cleanly into fixed-column form because BSS has a known 8-skill registry.

  Add `plan: 'plan'` to the `SCALE_ABBREVIATIONS` constant in `exportFlatten.js`.

  Add `plan: '_'` (or a sensible prefix) to `ACTIVITY_PREFIXES`.

  #### Part D — Synthetic demo data (no real flow integration yet)

  For the /demo/sandbox preview, the Plan needs to render with believable content. Since no real cross-activity persistence exists, hard-code a single synthetic kid's data in a new helper file: `src/lib/planDemoData.js`.

  Suggested content:

  **Willing-to-try skills (from BSS):**
  1. *"Active Listening"*
  2. *"Inclusive Language"*
  3. *"Provide Support"*

  **Picked thoughts (from Getting Unstuck):**
  1. Original: *"I will never really feel like I belong."* / Tell yourself: *"I don't feel like I belong right now, AND I won't always feel this way."* (Both/And)
  2. Original: *"I can't trust anyone."* / Tell yourself: *"There are people I can trust, even just a little bit, and trust can grow."* (Challenge)

  **Kept allies:**
  - Practical: Foster Mom, Coach Diaz
  - Emotional: Foster Mom (multi-placed), Mrs. Garcia (favorite teacher)
  - Social: Alex (best friend), Sam (cousin)

  **Strengthen commitments:**
  - Practical: *"I'll ask Coach Diaz for help with my homework this week."*
  - Emotional: *"I'll text Mrs. Garcia when I'm having a rough day."*
  - Social: *"I'll invite Alex to study with me on Friday."*

  The Plan demo uses these as the source for Screens 2, 3, and 4. The kid's typed answers (Section A who/when, Section C first ally) save to localStorage in the sandbox for the duration of the demo session — same pattern as the other activities.

  When real flow integration ships, this file gets replaced by a `useKidSession()` hook (or equivalent) that pulls real saved payloads from each activity. The components themselves don't change.

  #### Part E — Activity registration

  Register the Plan in `TEST_REGISTRY` (or wherever the activity registry lives — possibly `src/lib/activityVersions.js` + a route map):

  - `id`: `'plan'`
  - `display name`: `'Your Plan'`
  - `category`: existing *'Ready for Roots activity'* category
  - `route`: `/demo/sandbox/plan`
  - `version`: `v1.0`

  Add `plan` entry to `src/lib/activityVersions.js` at v1.0 with creation date and a one-line changelog (*"v1.0 — Initial Plan activity built (pulls forward from BSS willing-to-try, Getting Unstuck picks, Allies/Safety Net; saves who+when commitments per skill and first-ally outreach)."*)

  Add to the /demo Activities section list so the team can find it.

  #### Part F — Replace the /the-plan placeholder

  The placeholder route from Draft 37 Part H.2 (and the closing CTA from Draft 38 Part D.2) currently goes to a "coming soon" page. Update the route handler so `/the-plan` redirects to (or wraps) `/demo/sandbox/plan` — the real activity is now the destination.

  The "Open your plan" CTA at the end of the montage now lands the kid in the actual Plan activity.

  #### Part G — Visual treatment

  Match the rest of the platform per Draft 37's CTAC palette:

  - Headings: `text-ctac-navy font-bold`.
  - Primary CTAs: `bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white rounded-full`.
  - Soft surfaces: `bg-ctac-teal-50` with `border-ctac-teal-200`.
  - Cards: rounded-2xl with soft drop-shadow.
  - Per-type allies in their existing color coding (Practical amber, Emotional rose, Social sky).
  - Keepsake card background: `bg-amber-50` or a cream color (warm, complements the teal) — gives it the "this is yours, take it" texture.

  #### What does NOT change

  - The six existing activities (Self-Reflection, Who I Am Poem, BSS, Allies, Getting Unstuck, Letter) — their flows + payloads + UIs untouched. The Plan reads from their saved outputs (or, for now, the synthetic demo data); it doesn't modify them.
  - The Pretest / Posttest / FollowUp Survey items — unchanged.
  - The growth montage + the /the-plan placeholder route from Drafts 37 + 38 — the placeholder gets replaced; the montage's closing CTA + transition stay as Draft 38 spec'd.
  - The export pipeline structure — just gains the new `plan_*` columns.

  #### Out of scope (deferred)

  - **Real cross-activity flow integration.** Still deferred. This draft uses synthetic demo data. When the flow lands, the demo data file gets swapped for real `useKidSession()`-style reads.
  - **Action-plan analytics** in the data export demo. Once real Plan submissions exist, the data export tab could surface "X% of kids completed at least one skill commitment" — but that needs real data first.
  - **Cleanup queue updates.** The "BSS pull-forward to action plan" and "Allies Strengthen pull-forward" items from the Round 4 / Round 5 / Round 6 cleanup queues can now be marked as addressed (the Plan resolves both).

  #### Now in scope (folded into v1.0 after the 2026-06-29 design discussion)

  - **Letter callback screen (Screen 5)** with optional reflection prompt — surfaces the kid's full letter back to them for re-reading; the *"What sticks out?"* input is opt-in.
  - **Identity anchor screen (Screen 6)** showing the kid's full Who I Am Poem as grounding before the review. Read-only, no inputs.
  - **PNG + PDF export** on the saved screen — both ship Day 1. PNG for sharing on phone; PDF for case workers / foster parents. `jspdf` generates a 5-page document (title / commitments / mindset / letter / poem).

  *End of Draft 39.*

  </details>

- **`48719d1` · 2026-06-29** — Draft 38: post-launch polish, four fixes from Josh's walkthrough of the post-Draft-37 demo. **(A) Kai Variant 2 image** — swapped in the new blonde/lighter-complexion render so Kai reads as visually distinct from Sam (the "they look like relatives" note); Variant 1 (the locked pick) unchanged, no castData.js change. **(B) Tree canopy clipping** — the stage-5 canopy reaches y ≈ -22, which the "0 0 400 600" viewBox clipped at the top; fixed the actual render viewBox in `TreeProgress.jsx` to "0 -30 400 630" (TreeProgress is data-driven from treeStages.js, so the SVG files' viewBox doesn't drive the app — but updated all six reference SVGs to match for parity). Roots/ground/trunk anchor unchanged. **(C) Montage crossfade** — killed the blank flicker between stages: each advance renders a static "ghost" of the outgoing stage underneath that fades out (~320ms) while the new stage draws in on top (verified the ghost fires on all 5 transitions). **(D) Closer rework** — removed the SessionSummary block from the /demo final-reveal preview (kept the component file for reuse); the montage now owns its closer — on completion it shows "Ready for your plan?" + an "Open your plan" CTA → /the-plan, with Watch again secondary. No activityVersions bump. Verified in preview (canopy visible, Kai serves the new 16.3 MB file, crossfade on all 5 advances, summary gone, CTA lands on /the-plan, no console errors).

  <details>
  <summary>Draft 38 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 38 — Post-launch polish (Kai variant swap + tree canopy fix + montage crossfade + Plan close)

  Four small-to-medium fixes from Josh's 2026-06-29 walkthrough of the post-Draft-37 demo. All coupled enough to ship together.

  #### Part A — Kai images: swap Variant 2 for the new blonde version

  Team picked Variant 1 at the 2026-06-29 meeting as the keeper (more fem-leaning, fits the voice better). The current Variant 2 is now stale. Josh produced a new Kai image with **blonde hair + lighter complexion** to visually distinguish Kai from Sam (who is dark-haired/dark-complected — the team's "they look like relatives" feedback).

  **File copy:**

  | Source | Destination |
  |---|---|
  | `Video Content/New Voiceover/Kai Script/New lighter whiter kai.png` | `public/cast/images/kai-variant-2.png` (overwrite the existing file) |

  The existing `kai-variant-1.png` stays exactly as-is — that's the team's locked pick.

  **No castData.js change** — the `images` array on Kai's card already references `kai-variant-1.png` and `kai-variant-2.png` (per Draft 35). Replacing the file in place is sufficient; the renderer picks up the new content automatically.

  If Code wants to update Variant 2's `alt` text in castData.js for accuracy: change from *"Kai, character design variant 2"* to *"Kai, character design variant 2 (blonde / lighter complexion)"*. Optional polish.

  #### Part B — Tree SVG canopy clipping fix

  **The bug:** in the stage 5 SVG, the canopy's topmost paths extend to **y = -22**, but the viewBox is `0 0 400 600`. Everything above y = 0 gets clipped by the viewBox. Result: the canopy appears cut off at the top in both the demo "Growing your roots" preview and the montage. Not a CSS issue — it's the SVG itself.

  **The fix:** extend the viewBox vertically by ~30 units on the top. The cleanest one-line change is to update each tree-stage SVG's viewBox from `0 0 400 600` to `0 -30 400 630`. That gives the canopy ~30 units of headroom while keeping the bottom (roots) unchanged and the trunk anchor at the same coordinate position.

  **Files to update** (all six):

  - `src/assets/tree/tree-stage-0.svg`
  - `src/assets/tree/tree-stage-1.svg`
  - `src/assets/tree/tree-stage-2.svg`
  - `src/assets/tree/tree-stage-3.svg`
  - `src/assets/tree/tree-stage-4.svg`
  - `src/assets/tree/tree-stage-5.svg`

  Each file: change the root `<svg>` element's `viewBox` attribute from `"0 0 400 600"` to `"0 -30 400 630"`. Two-character edit per file.

  **Regenerate `src/lib/treeStages.js`** after the viewBox change. The extracted geometry doesn't change, but if `extract-tree-stages.mjs` happens to read viewBox into the output (depends on the script's internals), regenerating ensures consistency.

  **Spot-check** the demo's Growing-your-roots preview at stage 5 and the montage at stage 5 to confirm the top of the canopy is visible. Should be a clear visual fix.

  **Note on horizontal:** the SVG content extends near the left/right edges too. If Code finds horizontal clipping during the spot-check, extend the viewBox to `-10 -30 420 630` (adds 10 units on each side, recenters horizontally). Likely not needed but worth noting.

  #### Part C — Growth montage: crossfade overlay between stages (eliminate the blank flicker)

  **The bug:** in `TreeProgressMontage`, when the auto-play advances from stage N to stage N+1, the SVG re-renders with the new stage's paths. During React's reconciliation + the new paths starting from `opacity: 0 / stroke-dashoffset: 1`, there's a brief blank moment where the previous stage is gone but the new stage hasn't started fading in. Reads as flicker.

  **The fix:** crossfade overlay during stage transitions. Both the previous stage and the new stage render simultaneously during the transition window; the previous stage fades out while the new stage fades in.

  **File:** `src/components/TreeProgressMontage.jsx`.

  **Implementation pattern:**

  1. Add a `previousStage` state alongside the existing `stage` state.
  2. When advancing stage (e.g., 2 → 3), set `previousStage = 2` and `stage = 3` simultaneously.
  3. Render BOTH stage trees in the SVG output during the transition window:
     - Previous stage's `<g>` rendered with `style={{ opacity: isTransitioning ? 0 : 1 }}` and a CSS `transition: opacity 300ms ease-out`.
     - New stage's `<g>` rendered with its existing fade-and-scale-in animation, but at slightly higher z-index so the new content visually layers on top of the old.
  4. After the new stage's animation completes (~600ms after stage change), clear `previousStage` from state so the old SVG content unmounts.
  5. Timing: the previous stage's fade-out (~300ms) should overlap with the first half of the new stage's fade-in (~600ms total). The 300ms overlap is what eliminates the blank gap.

  **Reduced-motion respect** stays the same — when `prefers-reduced-motion: reduce`, skip transitions and jump to the final stage state.

  **Spot-check** by playing the montage end-to-end. Each stage advance should feel like a smooth growth-on-top rather than a blank-and-reappear. Stage 5 (which has 30 blossoms) is the highest-risk transition since the fade-out of stage 4 needs to land before the blossoms start cascading in.

  #### Part D — Remove "This is what you built" summary section; replace montage closer

  Two coupled copy + structure changes on the post-montage experience.

  ##### D.1 — Remove the SessionSummary section from the /demo final-reveal preview

  The "This is what you built" summary (Part G of Draft 37) was demo-mode-only and renders below the montage today. Pull it out of the /demo preview entirely for now. The summary's logical purpose was to bridge the montage to The Plan — but it duplicates what The Plan itself will surface (the kid's outputs pulled forward). Better to delete it and let The Plan be the destination.

  **File:** `src/pages/DemoPage.jsx` (the Final reveal preview section).

  **Change:** drop the SessionSummary component from the preview section. The `SessionSummary.jsx` component file itself can stay in the codebase (might be useful later) — just don't render it here.

  ##### D.2 — Replace the montage closer with "Ready for your plan?" → /the-plan

  After the montage finishes, instead of transitioning to the SessionSummary block, end the montage with a single closing CTA.

  **File:** `src/components/TreeProgressMontage.jsx` (or wherever the post-montage end state renders).

  **Change:** when the montage completes (after the final "Look how far you've come" caption + the bloom cascade + the radial glow), render below the tree:

  > **Ready for your plan?**
  >
  > [Button: "Open your plan"] → routes to `/the-plan`

  The heading in `text-2xl font-semibold text-ctac-navy`. The button as a primary CTA (`bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white rounded-full px-8 py-4 text-lg`). The "Watch again" button (from Draft 37 Part C.3) can stay below this CTA or move next to it as a secondary affordance — Code's call.

  The `/the-plan` route placeholder from Draft 37 Part H.2 stays in place; this just hooks the new closing CTA to it.

  #### What does NOT change

  - Kai Variant 1 image (kept exactly as today).
  - All other cast cards (Sam 16, Sam 14, Foster Mom, Foster Dad, Mrs. Johnson, Family Photo).
  - The growth montage timing/pacing (~7-second timeline), text overlays, CSS background warm-shift, radial glow — all stay as Draft 37 spec'd them.
  - The CTAC palette swap, tree color choices, blossom counts — all Draft 37 work preserved.
  - The six activities themselves, the export pipeline, data shapes — untouched.
  - No `activityVersions.js` bump (DemoPage + components, not activities).

  #### Out of scope (Part E candidates, deferred)

  - **The Plan demo build itself.** Separate scope, larger build. See the design thinking below for what pulls forward.
  - **SessionSummary component as a reusable building block.** The file is staying in the codebase for potential reuse if The Plan or some other surface ever wants to show the kid's outputs.
  - **Polishing the Kai card layout** if the new blonde Variant 2 makes the two-variant grid feel uneven. Visual tweak if needed after the swap.

  **Approved by:** Josh, 2026-06-29.

  *End of Draft 38.*

  </details>

- **`70f2d41` · 2026-06-29** — Who I Am Poem **v2.5 → v2.6**. Removed the empty "I am ___" placeholder slots from the fill-in view entirely. Draft 36 (v2.5) had replaced the live line-1 echo with a blank "I am ___" slot to keep the 10-line shape visible — but Josh flagged that from the participant's side, before the poem is produced, those slots just read as broken/confusing. The mirror lines (6 + 10) still render on the finished keepsake card, where the repetition is the structural payoff. Dropped the now-unused `MirroredLine` component. Verified in preview: input view shows 0 placeholder slots, finished keepsake still repeats line 1. No data-shape change.

- **`59ec7fd` + `98071b6` · 2026-06-29** — Draft 37: the CTAC brand makeover + end-of-session reveal — the biggest draft yet, shipped in two commits. **Commit 1 (palette + tree, `59ec7fd`):** added the CTAC palette as Tailwind tokens (`ctac-teal` primary #00A79D, `ctac-navy` display, `ctac-green/orange/purple`) and swapped the app's amber UI → CTAC teal across 48 .jsx files (CTAs, inputs, pills, borders, accents) per Ginny's "more blue green tones." Kept warm/clinical (per spec): the Allies Practical wedge (amber, pending Stephanie's sign-off), the Emotional/Social wedges, and the bold small-net caption; tree colors come from the SVGs. Replaced the six tree-stage SVGs with Claude Design's CTAC-refreshed set (greens #1B9445/#8BC53F/#147A38, blossom oranges #FDC030/#E0950F, amplified stage 4+5, stage 5 now 30 blossom clusters; sky/sun/cloud removed) and made extract-tree-stages.mjs write treeStages.js directly, then regenerated. **Commit 2 (reveal, `98071b6`):** new `TreeProgressMontage` — auto-plays the tree 0→5 on a non-linear timeline with synced fade captions ("This is where you started." → "Here's what you've built." → "Look how far you've come."), a CSS cream→peach background warm-shift, and a radial glow at the bloom; Skip + Watch again; reduced-motion safe. New `SessionSummary` ("This is what you built") — six cards (Self-Reflection, poem, a compact TrampolineNet + Strengthen commitments, Belonging Skills buckets, Getting Unstuck thoughts, the Letter), `demoMode` synthetic kid (original poem/letter per the published-poet lock), "Ready for The Plan?" CTA + print. New `/the-plan` placeholder route. New /demo "Final reveal preview" section (Play → montage → summary, + a "The Plan — coming soon" card), inserted between "Growing your roots" and "Data export." Fonts NOT swapped (out of scope). No data-shape/export change; no activity version bump (Part H.3). Verified via preview: /demo shows 0 amber / 15 teal CTAs, stage-5 tree = 180 CTAC-orange blossoms, full montage→summary→/the-plan flow, no console errors. Cleanup queue gained: The Plan activity build, real flow integration, Allies Practical color harmonization (loop in Stephanie), and fonts (Fira/Marselis).

  <details>
  <summary>Draft 37 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 37 — CTAC brand palette swap + new tree SVGs + final reveal montage + summary screen

  The biggest draft we've shipped so far — eight parts, all visual, landing as one stopping point. Three coordinated layers of work:

  1. **App-wide palette shift** to the CTAC brand colors (Adrienne's pitch in the 2026-06-29 meeting, Ginny's explicit call: *"I would prefer more blue green kind of tones"* — and the new SVGs already use these colors).
  2. **Drop in the refreshed tree-stage SVGs** that Claude Design just delivered (significantly amplified stage 4 + 5, CTAC-aligned greens and oranges).
  3. **Build the final reveal montage** — a growth-replay sequence with synced text overlays and atmospheric polish that plays at the end of the intervention, transitioning into the kid's final activity (The Plan, which doesn't exist yet — wires to a placeholder for now).

  Big draft. Probably 1.5–2 days of work. Coupled because shipping any part standalone would leave the demo visually inconsistent (e.g., new palette without new tree, or new tree without the closing experience that ties the metaphor together).

  **Out of scope (explicit):**
  - **Fonts.** Fira Sans / Marselis Slab Pro from the CTAC brand doc are NOT being swapped in this draft. Color only.
  - **The Plan activity itself.** The summary screen transitions to The Plan, but The Plan is a separate scope. This draft only adds a placeholder destination.
  - **Real flow integration / cross-activity state persistence.** Still deferred per Draft 21. The summary screen uses hardcoded demo content for the /demo preview; real per-kid output pulling lands when the flow is stitched.

  **Approved by:** Josh, 2026-06-29.

  ---

  #### Part A — CTAC brand palette swap

  The lab's official color spec lives at `CTAC Colors and Fonts 2020.docx` (uploaded 2026-06-29). Key values for this swap:

  | CTAC name | Hex | App role |
  |---|---|---|
  | Light Blue (actually teal in RGB) | `#00A79D` | **Primary CTAs** (was amber-500/600) |
  | Dark Blue (navy) | `#0E1F56` | **Heading / display text** (was slate-900) |
  | Light Green | `#8BC53F` | Tree leaf variety, accent |
  | Dark Green | `#1B9445` | Tree leaf primary |
  | Light Orange | `#FDC030` | Tree blossoms, warm accents (was amber-100/300) |
  | Dark Orange | `#EC7424` | Strong warm accents (was amber-700) |
  | Light Purple | `#614489` | Held for future accent variety (no current use) |
  | Dark Purple | `#392055` | Held for future |

  ##### A.1 — Define CTAC palette as Tailwind tokens

  **File:** `tailwind.config.js`.

  Add the CTAC palette as a custom theme extension. Use semantic names so the rest of the codebase reads cleanly:

  ```js
  theme: {
    extend: {
      colors: {
        ctac: {
          // Primary brand teal (CTAC "Light Blue" — labeled blue but visually teal)
          teal: {
            50: '#e6f7f6',   // computed light shades
            100: '#ccefed',
            200: '#99dfdb',
            300: '#66cfc8',
            400: '#33bfb6',
            500: '#00A79D',  // CTAC spec exact value
            600: '#008e85',  // computed darker
            700: '#00756d',
            800: '#005c55',
            900: '#00433d',
          },
          // Display navy (CTAC "Dark Blue")
          navy: {
            DEFAULT: '#0E1F56',
            // optional shade ramp if needed for surfaces:
            50: '#e7e9ee',
            100: '#cfd3dd',
            // ... computed as needed
            900: '#0E1F56',
          },
          // Tree-aligned greens (CTAC spec exact values)
          green: {
            light: '#8BC53F',
            DEFAULT: '#1B9445',
            dark: '#147A38',  // already present in the new SVGs as a third leaf tone
          },
          // Warm accents (CTAC spec exact values)
          orange: {
            light: '#FDC030',
            DEFAULT: '#EC7424',
            // optional darker shade for hover states:
            dark: '#C25A1A',
          },
          // Held for future
          purple: {
            light: '#614489',
            DEFAULT: '#392055',
          },
        },
      },
    },
  },
  ```

  The computed shade ramps (50–900) for `ctac-teal` are approximate — Code can refine. The key is `ctac-teal-500` matches the CTAC spec exactly (`#00A79D`); the lighter/darker shades are derived.

  ##### A.2 — Class swap across the codebase

  Replace the amber palette with CTAC teal/navy/orange throughout. Mechanical search-and-replace, then a curated audit pass.

  **Mechanical swaps:**

  | Current | Replace with |
  |---|---|
  | `bg-amber-500 hover:bg-amber-600` (primary CTAs) | `bg-ctac-teal-500 hover:bg-ctac-teal-600` |
  | `bg-amber-50` (input surfaces) | `bg-ctac-teal-50` |
  | `border-amber-200` | `border-ctac-teal-200` |
  | `border-amber-300` | `border-ctac-teal-300` |
  | `text-amber-700` (strong amber text) | `text-ctac-teal-700` |
  | `text-amber-600` | `text-ctac-teal-600` |
  | `bg-amber-100` (soft surfaces / pills) | `bg-ctac-teal-100` |
  | `text-slate-900` (headings/display only — not body) | `text-ctac-navy` |

  **Curated exceptions** (DO NOT swap these — they should stay amber/warm):
  - **Allies / Safety Net Practical wedge color.** Per Holly's clinical color-coding from Draft 19, Practical = amber. Keep as-is in this draft — harmonizing Practical with the new palette would require Stephanie's clinical sign-off. Flag in Cleanup queue if the team wants to revisit.
  - **Tree visual** (`src/components/TreeProgress.jsx` and `src/lib/treeStages.js`). The tree's own colors come from the new SVGs in Part B; do not override with Tailwind classes.
  - **Allies Emotional wedge (rose)** and **Social wedge (sky)** — also clinical color-coding, keep as-is.
  - **Specifically warm-coded encouragement callouts** (the new bold "A small net is a place to start" caption from Draft 36) — should stay amber/warm so the warmth contrasts with the now-teal surrounding UI. Use `text-ctac-orange-dark` or similar warm color instead of teal, OR keep current amber.

  **Audit pass:** after the mechanical swap, Code reviews every amber reference in the diff and reverts the exceptions above. Should be a focused review — most amber references are general UI surfaces that benefit from the swap.

  ##### A.3 — Body text and slate references stay

  Body text (slate-600, slate-700) is not part of this swap. Slate stays for readable body copy. Only display text (slate-900 → ctac-navy) shifts.

  ##### A.4 — Brand consistency check after swap

  After Code completes the swap, do a visual review at minimum on:
  - /demo landing page (hero + activities + sections)
  - Each of the six activity sandboxes
  - Each test sandbox (Pretest / Posttest / FollowUp)
  - Data export demo
  - Meet-the-cast section (both Sam's Story and Learning Skills for Belonging)

  Goal: nothing looks broken or off-brand. If something does, surface it as a fix-up before merging.

  ---

  #### Part B — Drop in the new tree-stage SVGs

  Claude Design delivered refreshed tree SVGs in response to the 2026-06-29 feedback. Significantly amplified stage 4 + 5, CTAC palette baked in (greens `#1B9445` + `#8BC53F` + `#147A38`, oranges `#FDC030` + `#E0950F`). Stage 5 jumps from 14 → 30 blossom clusters and 56 → 81 paths — the "you arrived" feeling now lands geometrically.

  **(Note: Josh removed the sky/sun/cloud elements from Claude Design's delivered files because they looked bad in execution. The atmospheric "wow" lives in the montage instead — see Parts E + F.)**

  ##### B.1 — File replacement

  Source: `Ready for Roots Tree/tree-stage-{0..5}.svg` (six files).

  Destination: `src/assets/tree/tree-stage-{0..5}.svg` — replace the existing files in place.

  Also update `src/assets/tree/NOTES.md` if it exists with a one-line note about the 2026-06-29 refresh (CTAC palette + amplified stage 4/5).

  ##### B.2 — Regenerate `src/lib/treeStages.js`

  The TreeProgress component is data-driven from the extracted path data. Re-run the extraction:

  ```bash
  node scripts/extract-tree-stages.mjs
  ```

  This regenerates `src/lib/treeStages.js` from the new SVGs. The TreeProgress component itself doesn't need code changes — it renders whatever the new geometry produces.

  ##### B.3 — Verify visual + animation

  Spot-check the demo's existing "Growing your roots" preview section. Stage 5 should look meaningfully more flourishing than before. Forward stage transitions should still animate (draw-in for roots/branches, fade-and-scale for leaves/blossoms).

  If stage 5's 30 blossoms cause animation jank (too many simultaneous fade-ins), consider staggering the blossom appearance even more (50ms → 80ms between sibling fades). Minor tuning.

  ---

  #### Part C — Growth replay montage component

  New component: `src/components/TreeProgressMontage.jsx`.

  This is the cinematic playback of the kid's growth journey, designed to land at the end of the intervention as a "look how far you've come" moment. Auto-plays through stages 0→5 with deliberate timing, not user-controlled stepping.

  ##### C.1 — Component shape

  ```jsx
  <TreeProgressMontage
    onComplete={() => { /* transition to summary screen */ }}
    autoPlay={true}      // default; can pass false for triggered playback
    skippable={true}     // default; renders skip button after 1s
  />
  ```

  Internally, the component uses the same TreeProgress rendering primitives but with an orchestrated playback timeline:

  ##### C.2 — Timeline (~7 seconds total)

  | Time (s) | Beat | What happens |
  |---|---|---|
  | 0.0 – 1.0 | Stage 0 hold | Show stage 0 (seed). Brief pause for the kid to register where they started. |
  | 1.0 – 2.0 | Stages 0 → 2 | Quick growth — roots draw in via `stroke-dashoffset`, first leaves fade-and-scale in. ~500ms per stage advance. |
  | 2.0 – 4.0 | Stages 2 → 4 | Continued growth — more roots, more branches, denser canopy. Same per-stage animation pattern. |
  | 4.0 – 5.5 | Stage 5 arrival | Trunk reaches full thickness, branches extend to corners, leaves fill out. Blossoms held back (don't appear yet). |
  | 5.5 – 6.5 | Blossoms appear | The 30 blossoms fade-and-scale in with a staggered cascade (~30ms between each). Most impactful single visual moment. |
  | 6.5 – 7.0 | Final hold | Full stage 5 visible. Closing caption (Part D) lands here. |

  Times are approximate — Code can tune. The shape of the curve matters: slow start, accelerate through middle, slow back down for the bloom. Don't pace it linearly.

  ##### C.3 — Replay behavior

  After playback ends, render a small "Watch again" button below or near the tree. Click resets the animation state (paths back to `stroke-dashoffset: 1`, leaves/blossoms back to `opacity: 0 scale(0.6)`) and replays from beat 0.

  ##### C.4 — Reduced-motion respect

  If `prefers-reduced-motion: reduce`, render the final stage 5 state immediately without animation. Skip the timeline entirely. Standard a11y move.

  ##### C.5 — Skip behavior

  After 1 second into playback (so the kid can't accidentally skip the opening), show a small "Skip" button. Click jumps directly to stage 5 final state and fires `onComplete`.

  ##### C.6 — Animation reset is the fiddly part

  `stroke-dashoffset`-based draw-in animation only plays the first time. To replay, the component needs to reset all path `stroke-dashoffset` values back to their starting state, then trigger forward animation again. Cleanest approach: bump a `playKey` state on each play that re-mounts the SVG content via React key, forcing a fresh render with paths in starting state.

  ---

  #### Part D — Synced text overlay layer

  The text overlay sits above the SVG (z-indexed), fading captions in and out at specific beats. Provides the emotional spine of the montage.

  ##### D.1 — Suggested captions (Josh — edit before shipping if needed)

  | Time (s) | Caption | Style |
  |---|---|---|
  | 0.0 – 1.0 | *"This is where you started."* | Centered above the seed, ctac-navy text |
  | 3.0 – 4.5 | *"Here's what you've built."* | Centered above the tree as it fills out |
  | 6.0 – 7.0 | *"Look how far you've come."* | Centered above stage 5 — the closing line |

  All captions fade in over ~400ms, hold, fade out over ~400ms before the next one appears. No overlap.

  ##### D.2 — Styling

  - Font: existing platform sans (not Fira — fonts out of scope this draft).
  - Size: `text-2xl` or `text-3xl` on desktop, `text-xl` on mobile.
  - Color: `text-ctac-navy` (display navy).
  - Weight: `font-semibold` or `font-bold`.
  - Background: text-shadow or a subtle soft white halo so the text reads against the leaf/sky/blossom backgrounds. Not a solid background fill.

  ##### D.3 — Implementation

  A React state machine inside the montage component tracks the current beat and renders the current caption (or null). Use CSS `transition: opacity 400ms ease` for the fade.

  ---

  #### Part E — CSS background warm-shift

  The container that holds the montage (the section/page background, not the SVG itself) animates its background color from a muted neutral to a warm gradient over the course of the montage. Lives in CSS, not in the SVG.

  ##### E.1 — Animation

  ```css
  .montage-container {
    background: #fdfcf7; /* cream / off-white start */
    transition: background 6s ease-in-out;
  }

  .montage-container.is-playing {
    background: linear-gradient(180deg, #fff8ed 0%, #fdfcf7 100%);
    /* warm gradient: pale peach top → cream bottom */
  }
  ```

  Start state: solid cream. End state: warm gradient with a hint of peach at the top, fading to cream at the ground line. The kid feels sunlight without seeing a literal sun.

  ##### E.2 — Trigger

  Component adds the `.is-playing` class when playback starts; the CSS transition handles the 6-second warm-shift. Removes the class on replay reset.

  ---

  #### Part F — Radial glow at stage 5 arrival

  A soft warm halo appears behind the tree at the moment stage 5 lands. Subtle — feels like the tree is lit from within.

  ##### F.1 — Implementation

  Option (a) — **CSS box-shadow on the SVG container** (simpler):

  ```css
  .tree-container.stage-5-arrived {
    filter: drop-shadow(0 0 40px rgba(253, 192, 48, 0.4));
    transition: filter 800ms ease-in;
  }
  ```

  Where `rgba(253, 192, 48, 0.4)` is CTAC Light Orange at 40% alpha.

  Option (b) — **Inline SVG circle with blur** (more controllable):

  A separate `<circle>` element behind the tree's main `<g>` layers, with `filter: blur(40px)` and amber fill. Render conditional on `stage5Arrived === true`, with opacity transition.

  Either works. Recommend (a) for simplicity.

  ##### F.2 — Trigger

  Component sets `stage5Arrived = true` at time = 5.5s (when blossoms start appearing). The 800ms ease-in feels in sync with the bloom cascade.

  ---

  #### Part G — Summary screen (new component, demo data for now)

  New component: `src/components/SessionSummary.jsx`.

  After the montage's `onComplete` fires, the kid sees a screen showing their actual outputs from all six activities. *"This is what you built."* The personal content is the real emotional payoff — the kid sees their own work reflected back.

  ##### G.1 — Layout

  Single page, card-style layout. Two columns on desktop, stacked on mobile. Each card shows one activity's output:

  | Card | Content shown |
  |---|---|
  | **Self-Reflection** | The kid's inclusion + exclusion text, presented as quoted paragraphs |
  | **Who I Am Poem** | The finished 10-line poem, formatted as the keepsake card |
  | **Allies / Safety Net** | A compact TrampolineNet visualization with kept allies + the "I commit to" Strengthen actions |
  | **Belonging Skills Sort** | The three sorted buckets summarized — "Doing now: …" / "Willing to try: …" / "Not interested: …" |
  | **Getting Unstuck** | The kid's alternative thoughts they wrote (the Challenge or Both/And responses) |
  | **Letter to Another Youth** | The kid's full letter text in a keepsake card |

  Card style: rounded `bg-ctac-teal-50` with `border-ctac-teal-200`, padding, soft shadow. Card heading in `text-ctac-navy font-semibold`. Body content in slate-700.

  ##### G.2 — Header copy

  Above the cards:

  > *"This is what you built."*

  In `text-3xl font-bold text-ctac-navy`. Single sentence.

  ##### G.3 — CTA at the bottom

  Below the cards, a primary CTA button:

  > *"Ready for The Plan?"*

  Styled as `bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white rounded-full px-8 py-4 text-lg`. Click navigates to `/the-plan` (or wherever The Plan ends up routing — Part H specifies the placeholder).

  ##### G.4 — Demo data for /demo preview

  In the current /demo preview (Part H), no real per-kid persisted data exists yet. The SessionSummary component should accept a `demoMode` prop that, when true, renders hardcoded synthetic outputs for one example kid. Suggested demo content:

  - **Self-Reflection demo:** *"A time I felt I belonged: When my coach put me in the starting lineup my first game on the team."* / *"A time I felt I didn't belong: First day at my new school, everyone already had their groups."*
  - **Who I Am Poem demo:** A 10-line example poem with simple lines (avoid published poet text per the locked rule).
  - **Allies demo:** 4-5 allies across the three support types, with a couple of Strengthen action commitments.
  - **BSS demo:** 4 doing-now / 2 willing-to-try / 1 not-interested distribution.
  - **Getting Unstuck demo:** Two alternative thoughts — one Challenge, one Both/And.
  - **Letter demo:** A 100-word example letter.

  When the real flow integration lands, the `demoMode` prop drops; the component reads from the kid's persisted session state.

  ##### G.5 — Print / save affordance

  Below the summary cards, optionally surface a "Print or save your session" button (reusing the existing `downloadSvgStringAsPng` or print-friendly CSS). Lets the kid take their full session with them. Lower priority — could defer to a follow-up draft.

  ---

  #### Part H — /demo preview section + Plan placeholder

  The montage + summary aren't wired into the live activity flow yet (Draft 21 deferred). But the team needs to see them. Add a new preview section on /demo.

  ##### H.1 — New /demo section: "Final reveal preview"

  Insert between the existing "Growing your roots" section and "Tests." Heading: `## Final reveal preview`.

  Brief intro paragraph:

  > *Preview of the end-of-session experience that plays after the last activity. The montage replays your growth from seed to bloom, then transitions to a summary of everything you built, then leads into The Plan (the kid's final reflective activity — coming soon).*

  Below the intro, two stacked elements:

  1. **Play button**: "Play the growth montage" — clicking it renders the `<TreeProgressMontage />` component in playback. After it completes, automatically renders the `<SessionSummary demoMode />` underneath.
  2. **The Plan placeholder card**: a styled card explaining that The Plan is coming. Soft `bg-ctac-teal-50` background, ctac-navy heading: *"The Plan — coming soon"* with a one-line description about pulling forward the kid's BSS willing-to-try picks and Getting Unstuck responses into a structured action plan.

  ##### H.2 — The Plan route placeholder

  Add a placeholder route at `/the-plan` (or `/demo/the-plan` if you'd rather scope it under demo). Just a page with:

  > *The Plan*
  >
  > *This is where your action plan will live. We're still building it — check back soon.*
  >
  > [Back to /demo button]

  When the real Plan activity ships, this route gets replaced. The "Ready for The Plan?" button on SessionSummary points here.

  ##### H.3 — No version bump

  DemoPage section addition — not an activity. No `activityVersions.js` change.

  ---

  #### Cleanup queue additions

  - **The Plan activity build.** Spec + implementation. Should pull forward: BSS willing-to-try items, Allies Strengthen commitments, Getting Unstuck alternative thoughts. Asks the kid to add "who I'm going to do it with and when" per the 2026-06-29 meeting discussion. Big piece of work — its own scope.
  - **Real flow integration.** Wires the activities into a continuous flow, persists per-kid outputs across activities so SessionSummary can read real data (not demo data). Replaces the standalone `/demo/sandbox/*` pattern. Also covers the tree-progress visual triggering correctly between activities.
  - **Allies Practical wedge color harmonization.** If the team wants Practical (currently amber) to fit the CTAC palette, loop Stephanie in on a clinical-content review and propose a CTAC-aligned color (probably orange family). Defer until raised.
  - **Fonts.** Fira Sans / Marselis Slab Pro per the CTAC brand doc. Out of scope for Draft 37; revisit if visual brand consistency starts to feel incomplete.

  ---

  #### What does NOT change

  - The intervention's six activities themselves (Self-Reflection, Who I Am Poem, BSS, Allies, Getting Unstuck, Letter) — their internal flows + data + UI logic stay exactly as today. Only their visual styling (palette) shifts.
  - The Pretest / Posttest / FollowUp Survey sandboxes — palette only.
  - Data shapes, save payloads, export pipeline, demoDataset — none of this changes.
  - The Allies type colors (Practical = amber, Emotional = rose, Social = sky) — stay as-is per the clinical color-coding lock.
  - Sound / audio. Platform stays silent.
  - Particles, viewBox-zoom, animated SVG `<animate>` tags. None used.

  #### Suggested commit order if shipping in pieces

  Code may want to ship this in two sub-commits within the same session for easier review (since the diff will be huge):

  1. **Commit 1**: Parts A + B (palette + SVG drop-in). Visually the whole app shifts to CTAC colors with the new tree. Reviewable as a focused visual change.
  2. **Commit 2**: Parts C–H (montage + summary + Plan placeholder + /demo wiring). Builds on the palette foundation; introduces new components and the preview section.

  Single commit also fine if Code prefers — Josh's call.

  *End of Draft 37.*

  </details>

- **`a97807e` · 2026-06-29** — Draft 36: Round 6 feedback bundle, six activities in one commit. **Self-Reflection v1.4→v1.5:** fuller closing — "Our experiences can drive our thoughts and feelings about belonging. Thanks for sharing!" (Adrienne + Holly: the bare "Thanks for sharing" read abrupt/sarcastic). **Who I Am Poem v2.4→v2.5:** lines 6/10 show an empty "I am ___" slot during input instead of echoing line 1 as the kid types (Adrienne — the live repetition confused kids); the keepsake still mirrors. **Belonging Skills Sort v3.2→v3.3:** directions point at the list — "From the list of skills below, drag each one into a bucket." (Adrienne). **Getting Unstuck v5.7→v5.8 (MAJOR):** Challenge final prompt reworded to push for an alternative statement, not journaling (Adrienne); new per-appraisal `both_and_root` softened seed for the Both/And path (e.g. "I will never really feel like I belong" → "I don't feel like I belong right now") so the kid can coherently AND-extend it — input + review both use it; original `text` unchanged (Pick rating, Challenge, and pretest/FollowUp Survey still use it); a_other falls back to its text (Holly + Jessica + Stephanie). **Allies v5.5→v5.6:** removed the support-type percentage labels from every surface (misleading — one ally per type read as "100% supported"; also fixes the mobile "Social" clip); bolded + warm-colored the small-net caption so it reads as encouragement; dropped the confusing second "lots of room to grow" caption line. The Draft 32 "No one named for: {types}" callout is unchanged. **Growing your roots:** "!" on the stage 4/5 headings; stage-5 visual push (slight anchored scale-up + saturation/brightness lift). All copy/styling except D's additive `both_and_root` field — no breaking data/export change. Verified via preview (D + E). Added two Round 6 Cleanup-queue items (palette review — now superseded by Draft 37; single-ally visualization).

  <details>
  <summary>Draft 36 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 36 — Round 6 feedback bundle (Self-Reflection v1.5 + Who I Am Poem v2.5 + BSS v3.3 + Getting Unstuck v5.8 + Allies v5.6 + Growing your roots polish)

  Bundle of small-to-medium fixes from the 2026-06-29 review meeting (feedback CSV at `Meeting Notes and Feedback/6 29 feedback with notes.csv`, transcript at `Meeting Notes and Feedback/Jun 29 at 11-06 AM.txt`). Six activities touched, ship as one commit — same batched-stopping-point pattern as Drafts 26 + 32.

  Most changes are copy/styling. The only structural addition is Getting Unstuck's per-appraisal `both_and_root` field, which adds a softened seed prompt the Both/And path uses in place of the absolute original statement (the original `text` stays untouched so pretest/FollowUp Survey items don't change).

  **Approved by:** Josh, 2026-06-29.

  ---

  #### Part A — Self-Reflection v1.4 → v1.5 (MINOR copy change)

  Adrienne flagged the *"Thanks for sharing"* closing as too abrupt; Holly noted it reads slightly sarcastic. Team landed on a fuller closing that explains why we asked the kid to share.

  **File:** `src/activities/SelfReflection.jsx`.

  **Change:** Replace the closing message *"Thanks for sharing"* with:

  > *Our experiences can drive our thoughts and feelings about belonging. Thanks for sharing!*

  Two-sentence pattern — context line + the warm thanks with an exclamation point. The exclamation point is intentional (per Holly's note about a few warm punctuation marks across the activities being a positive direction).

  **Version bump:** v1.4 → v1.5 (MINOR). Prepend changelog: *"v1.5 — Closing message reworked per Adrienne + Holly's 2026-06-29 feedback ('Thanks for sharing' was too abrupt / read sarcastic). New copy: 'Our experiences can drive our thoughts and feelings about belonging. Thanks for sharing!'"* Update `updated`.

  ---

  #### Part B — Who I Am Poem v2.4 → v2.5 (MINOR; hide mirrored lines during input)

  Adrienne noted that lines 6 and 10 currently mirror line 1's text **as the kid types** in the fill-in view. The repetition during input is confusing (*"why does he keep saying that there?"*). Team agreed the mirroring is meaningful only on the final keepsake — that's where the structural repetition pays off — so hide it during input.

  **File:** `src/activities/WhoIAmPoem.jsx`.

  **Change:** During the fill-in input view, do not render the mirrored line 1 content at line 6 and line 10. The existing input fields and structural layout stay (8 input slots, with lines 6 and 10 as the silent display-only slots).

  Two clean ways to render the empty mirror slots during input — Code's call:

  1. **Render the slot as blank / empty** (just an empty "I am ___" with no value yet). Most literal interpretation of Adrienne's note.
  2. **Hide the slot entirely** during input and only reveal it on the final keepsake card. Cleaner visually but a less explicit signal that those lines exist.

  I'd lean **option 1** — keeps the 10-line structure visible (so the kid understands the poem's shape as they fill it in) but stops the "why is line 6 saying the same thing?" confusion. The mirroring kicks in only on the final saved card.

  **Keepsake card / final view: unchanged.** Lines 6 and 10 still mirror line 1 there. The whole point of the structure is the repetition framing the rest of the poem.

  **Data shape:** no change.

  **Version bump:** v2.4 → v2.5 (MINOR). Prepend changelog: *"v2.5 — Hid the mirrored line-1 content from lines 6 and 10 during input per Adrienne's 2026-06-29 feedback (the repetition was confusing kids as they typed); mirroring still renders on the final keepsake card where the repetition is the structural payoff."* Update `updated`.

  ---

  #### Part C — Belonging Skills Sort v3.2 → v3.3 (MINOR copy change)

  Adrienne: the kid lands on the bucket view first and the skill list scrolls into view below — current direction copy doesn't tell them where the skills are.

  **File:** `src/activities/BelongingSkillsSort.jsx`.

  **Change:** The current directions copy (something like *"Drag each skill into a bucket"*) becomes:

  > *From the list of skills below, drag each one into a bucket.*

  Adds the "below" pointer so the kid knows where to look. One-line copy edit.

  **Out of scope (already in Cleanup queue from Round 5, re-confirmed at the 2026-06-29 meeting):** Adrienne's per-category reflection prompts ("are there times you could do this more?" / "can you think of situations you could try?" / "could these be helpful in the future?") AND Holly's edge-case messages for "I'm already doing all of these" and "I'm not willing to do any of these" — **all deferred to the future action plan** that pulls willing-to-try items forward. Jessica's call at the meeting; matches the BSC platform's existing pattern.

  **Version bump:** v3.2 → v3.3 (MINOR). Prepend changelog: *"v3.3 — Directions copy updated to point the kid at the skill list below the buckets per Adrienne's 2026-06-29 feedback ('Drag each skill into a bucket' → 'From the list of skills below, drag each one into a bucket')."* Update `updated`.

  ---

  #### Part D — Getting Unstuck v5.7 → v5.8 (MAJOR — Both/And root softening; new `both_and_root` field per appraisal)

  Two changes. The first is a small copy edit; the second is a structural addition to the appraisals data shape so the Both/And path has a workable seed prompt.

  **Files:**
  - `src/lib/appraisals.js`
  - `src/activities/GettingUnstuck.jsx`

  ##### D.1 — Challenge prompt reword (Adrienne)

  Currently the Challenge path's final prompt to the kid is *"What comes up for you when you ask yourself those questions?"* — Adrienne flagged that this elicits journaling rather than producing an alternative thought. Reword to push toward crafting an actual alternative.

  **Change in `GettingUnstuck.jsx`:** the Challenge final-prompt copy becomes:

  > *Now that you've thought about your statement in different ways, what is a more helpful or more accurate statement you could tell yourself?*

  Replaces the existing copy verbatim. No other change to the Challenge flow.

  ##### D.2 — Both/And root softening: new `both_and_root` field per appraisal (Holly + Jessica + Stephanie)

  **The problem.** Each appraisal currently uses its absolute original statement (e.g., *"I will never really feel like I belong"*) as the seed for both Challenge and Both/And. That works for Challenge — kids think their way through challenging an absolute. It breaks Both/And — you can't coherently and-extend an absolute statement ("I will never really feel like I belong AND ___" reads as agreement with the absolute, not as holding two truths). The I-need-help suggestions on the Both/And side already use a softened root (e.g., *"I don't feel like I belong, right now, AND..."*) — so the suggestions and the input UI are mismatched.

  **The fix.** Add a new `both_and_root` field on each appraisal in `src/lib/appraisals.js`. The Both/And path in `GettingUnstuck.jsx` uses `both_and_root` as the seed prompt the kid sees; the kid completes the AND-extension. The original `text` field is **unchanged** and continues to be used for: the Pick rating screen, the Challenge path, and the pretest / FollowUp Survey measures.

  **Per-appraisal values** (match the existing `help_suggestions.both_and` wording so the suggestions and the seed prompt are consistent):

  | Item | Original `text` (unchanged) | New `both_and_root` |
  |---|---|---|
  | `a1` | *"I will never really feel like I belong."* | *"I don't feel like I belong right now"* |
  | `a2` | *"Everyone will eventually leave me or give up on me."* | *"People have left me in the past"* |
  | `a3` | *"I am not lovable."* | *"I do not feel like I am lovable"* |
  | `a4` | *"No one would want me to be a part of their family."* | *"I feel that no one would want me to be a part of their family"* |
  | `a5` | *"I can't trust anyone."* | *"I feel like I can't trust anyone"* |
  | `a6` | *"My real family will be mad if I like my foster or adoptive family."* | *"My family might get mad if I like my foster or adoptive family"* |

  Note: `both_and_root` is the root **without** the trailing *"AND..."* — the UI appends *" AND "* and the kid's input field. So the kid sees something like:

  > *I don't feel like I belong right now AND* `[___ kid's input ___]`

  **Change in `GettingUnstuck.jsx`:** the Both/And screen's seed-prompt rendering reads `appraisal.both_and_root` instead of `appraisal.text`, with *" AND "* appended before the input field. The `and_statement` save key stays the same (the kid's full completed thought, including the AND-extension, can be stored OR just the kid's input — Code's call to preserve the existing save shape; recommend storing the kid's completion only, since the root is derivable from the appraisal id).

  **Save payload:** no change. The kid's typed response continues to save as today. The seed prompt is display-only.

  **Pretest / FollowUp Survey:** **no change.** Those use `text` (the locked measures). `both_and_root` is intervention-side only.

  **Update the `src/lib/appraisals.js` top-of-file comment block** to document the new `both_and_root` field — note it's used only by the Getting Unstuck Both/And path, that it's intentionally a softened/conditional version of the original statement, and that pretest/FollowUp Survey items keep using `text` for measurement comparability.

  ##### D.3 — Version bump

  `getting-unstuck` v5.7 → **v5.8 (MAJOR)**. Bumping MAJOR because the appraisals data shape grows by a new required field per item — not a breaking export change, but it's a structural addition to the shared source-of-truth used by both intervention and survey, which is worth signaling. Prepend changelog: *"v5.8 — Challenge prompt reworded to push for alternative statement rather than journaling (Adrienne, 2026-06-29); Both/And path now uses a per-appraisal softened seed prompt via new `both_and_root` field, resolving the mismatch where the I-need-help Both/And suggestions used a softened root but the input UI used the original absolute statement (Holly + Jessica + Stephanie, 2026-06-29). Pretest + FollowUp Survey items unchanged — they continue using the original `text`."* Update `updated`.

  ---

  #### Part E — Allies / Safety Net v5.5 → v5.6 (MINOR; remove percentages, bold caption, drop second caption line)

  Three coupled changes from the longer meeting discussion. Big consensus: the percentage layer was misleading more than it was helping.

  **Files:**
  - `src/activities/AlliesSafetyNet.jsx`
  - `src/components/TrampolineNet.jsx`

  ##### E.1 — Remove the support-type percentage labels entirely

  Currently (after Draft 30) percentages render on the post-selection reveal, Inspect, Strengthen, and Review screens — on TrampolineNet pills and ally-list headers. Holly flagged that picking one person per type shows "100% / 100% / 100%" which reads as "fully supported" when it's really "one person per slot." The whole team agreed at the meeting that the math layer adds confusion and the visual alone tells the story.

  **Change:** Remove the percentage labels from every surface they currently appear on. That means:

  - TrampolineNet's percent pills — gone (the per-type label stays as just *"Practical"* / *"Emotional"* / *"Social"*).
  - Ally-list headers — gone.
  - The `percentByType` prop on TrampolineNet — recommend keeping the prop in the component but never passing it (defaults to off). Cheap to leave in place; easier to re-introduce if the team revisits.
  - The `showPercentages` gating prop from Draft 30 — also recommend keeping but never passing.

  **Side benefit:** the cut-off label issue on mobile (Stephanie's screenshot of *"Social"* cut off) is solved automatically by removing the suffix.

  ##### E.2 — Make the small-net caption bold and visually prominent

  Currently the *"A small net is a place to start"* caption renders in faint slate-500 italic. Adrienne + Holly both flagged it gets lost on the page. Make it bold and brighter so it actually reads as encouragement.

  **Change:** the existing small-net caption *"A small net is a place to start — let's keep building"* (or the variant currently in the code) becomes **bold** with a more prominent color — recommend `font-bold` plus `text-amber-700` or `text-rose-700` (whichever fits the platform amber palette best). Italic can stay or drop — Code's call. Goal: looks like encouragement, not body text.

  ##### E.3 — Delete the second caption line entirely

  The *"Lots of room to grow your safety net in the greyed-out areas."* line that Draft 30 added — delete it. Holly's note: it's confusing for kids who don't have greyed-out areas (e.g., one person per type, no empty wedges) but the message still rendered. Removing it leaves a cleaner single-caption state.

  **Change:** drop the second caption entirely from the low-ally state. Only the bolded *"A small net is a place to start — let's keep building"* line remains.

  ##### E.4 — Version bump

  `allies-safety-net` v5.5 → **v5.6 (MINOR)**. Prepend changelog: *"v5.6 — Support-type percentage labels removed entirely from all surfaces (TrampolineNet pills + ally-list headers + heading suffixes) per the 2026-06-29 meeting consensus — the percentages were misleading (one ally per type reading as 100% supported); bolded the small-net 'A small net is a place to start' caption so it actually reads as encouragement (Adrienne + Holly); dropped the second 'lots of room to grow in the greyed-out areas' caption line that confused kids without empty wedges (Holly)."* Update `updated`.

  ---

  #### Part F — Growing your roots: ! on encouragement copy + push stage 5 visual fuller

  **Files:**
  - `src/pages/DemoPage.jsx` (or wherever the per-stage encouragement copy lives — possibly `src/lib/treeStages.js` or inline)
  - `src/components/TreeProgress.jsx`

  ##### F.1 — Add occasional exclamation points to the per-stage encouragement copy

  Adrienne: *"adding in the occasional exclamation point to give the statements more feeling/encouragement! Not everywhere ... just a few."*

  **Change:** review the six per-stage encouragement messages (the copy that surfaces when the kid advances through tree stages) and add `!` to one or two that read as natural celebrations (likely stages 4 and 5, where the visual is most flourishing — but Code's judgment call). Don't blanket-add `!` to every stage; only where it lands.

  ##### F.2 — Push the stage 5 visual fuller / more dramatic

  Adrienne + Holly: the final stage should feel like a bigger "wow" moment — more canopy, more flair, possibly birds / sky / sun. Josh flagged SVG limitations in the meeting (the tree is parametric from Claude Design's reference SVGs).

  **Change:** attempt a visual push on stage 5 in `TreeProgress.jsx`. Practical options Code can try:

  - **More blossoms / fuller canopy** by increasing per-stage leaf and blossom counts at stage 5.
  - **Brighter color palette** at stage 5 (slight saturation lift on leaves + blossoms).
  - **Slight scale-up** of the whole tree at stage 5 (a small `transform: scale(1.05)` on the SVG group).

  **Out of scope:** new reference SVGs from Claude Design with sky / birds / sun. That'd be a separate ask. The closing video will carry the bigger "wow" moment per Josh's meeting note; stage 5 just needs to land as visibly more flourishing than stage 4, not as a complete scenic transformation.

  No version-bump line for the tree (it's a demo-section surface, not an activity). Note the changes in INFRASTRUCTURE.md change log if Code keeps that habit.

  ---

  #### Cleanup queue additions

  - **Color scheme review** — Adrienne would prefer the lab's usual blue/green palette over the current amber/brown. Josh's rationale (gender-neutral, less clinical, supports the tree metaphor) is sound. Not a Draft 36 change; flag for next meeting if the team wants to actually decide.
  - **Allies single-ally visualization** — Stephanie's idea: split the empty grey area into separate visible wedges (one for social, one for emotional) so the kid sees the absence as two distinct holes rather than one continuous blank. The percentage removal probably fixes most of the confusion by itself; revisit if it doesn't.

  ---

  #### What does NOT change

  - The Strengthen step's per-type example text (just fixed in Draft 32).
  - The "I need help creating a new thought" button (just fixed in Draft 32).
  - The empty-wedge *"No one named for: {types}"* callout from Draft 32 — unchanged. The percentages were the misleading layer, not the missing-type callout.
  - Sam 14 voice — confirmed at the meeting to stay as-is (Holly: *"I don't think it's worth the pennies have changed... it sounds really good, move forward"*).
  - Pretest / Posttest / FollowUp Survey items — unchanged. The Both/And softening is intervention-side only.
  - Data shapes, export pipeline, demoDataset — no breaking changes across any part; the `both_and_root` field is additive on the existing items.

  #### Out of scope (queued)

  - **Kai image regeneration** (blonde + slightly older) — Josh's parallel work, not code.
  - **Kai voice work continuation** — Josh's parallel work.
  - **Flow integration / action plan build** — still deferred per Draft 21 + Cleanup queue.
  - **Animation production for Sam's Story** — Josh's parallel work, next phase.

  *End of Draft 36.*

  </details>

- **`b1e719e` · 2026-06-24** — Draft 35: /demo cast restructure. Split the single **Meet the cast** section into two parallel named sections — **Sam's Story** (the narrative-video cast: Sam 16, Sam 14, Foster Mom, Foster Dad, Mrs. Johnson + Script 2.0 download + Family Photo) and **Learning Skills for Belonging** (the psychoeducation track that wraps the six activities) — and added **Kai**, that track's narrator. Four assets copied in (~11 MB): `kai-variant-{1,2}.png` + `kai-scene-{1-the-scan,2-the-why}.mp3`. **castData.js:** every card gains a `show` field (`'sams-story'` / `'learning-skills'`) for section grouping; two new optional shapes — `images: [{label,src,alt}]` (multi-variant design gallery) and `scenes: [{label,audio,description?}]` (scene-organized narrator audio). Kai card added with 2 image variants + 2 recorded scenes (8 locked total). **DemoPage:** renders the two sections filtered by `show`; CastCard gains an `images` gallery branch (side-by-side variants with captions) and a `scenes` branch (precedence scenes > videos > lines > description; `voiceSamples` still render above). No version bump (DemoPage section). Verified via preview: both sections present; Sam's Story = its 5 cards + Family Photo; Kai = 2 images + 2 scene players, both mp3s 200 `audio/mpeg`.

  <details>
  <summary>Draft 35 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 35 — /demo cast restructure: split into "Sam's Story" + "Learning Skills for Belonging" (add Kai)

  Three changes in one commit. **(1)** Restructure the existing Meet-the-cast section so it reads as **two parallel named sections** instead of one umbrella — Sam's Story (existing cast) and Learning Skills for Belonging (new Kai). **(2)** Add a new Kai cast card with **two character-design image variants** and **two scene audio samples** from Adrienne's psychoeducation script. **(3)** Extend castData.js to support multi-image cards and scene-keyed audio (Kai's structural shape is different from Sam's because Kai is a longer-form narrator with whole scenes rather than discrete lines).

  Source background: Kai is the gender-neutral peer-mentor narrator for the psychoeducation track wrapping the six activities — script is `Belonging Psychoeducation Script Parts I & II revisedAW with activities.docx` (Adrienne Whitt-Woosley, 2026-06-04). Voice pipeline same as Sam: Josh records → ElevenLabs Voice Changer → target voice model. Two images so far (Variant 1 + Variant 2), two scenes recorded so far (Scene 1 The Scan, Scene 2 The Why). The full eight-scene script is locked but the rest of the scenes aren't recorded yet.

  #### Change 1 — Copy assets

  Four files. Two images + two audio.

  | Source | Destination |
  |---|---|
  | `Video Content/New Voiceover/Kai Script/Kai 1.png` | `public/cast/images/kai-variant-1.png` |
  | `Video Content/New Voiceover/Kai Script/Kai 2.png` | `public/cast/images/kai-variant-2.png` |
  | `Video Content/New Voiceover/Kai Script/Kai - The Scan 11.mp3` | `public/cast/audio/kai-scene-1-the-scan.mp3` |
  | `Video Content/New Voiceover/Kai Script/Kai The Why 11.mp3` | `public/cast/audio/kai-scene-2-the-why.mp3` |

  Combined size ~11 MB. `preload="metadata"` on the audio keeps up-front fetch tiny.

  #### Change 2 — `src/lib/castData.js`: add `show` grouping + Kai card with multi-image + scenes shape

  Two new structural concepts:

  **(a) `show` field on every cast card.** Identifies which section a card belongs to. Allows the renderer to group cards under a heading.

  - Sam 16, Sam 14, Foster Mom, Foster Dad, Mrs. Johnson, Family Photo: `show: 'sams-story'`
  - Kai: `show: 'learning-skills'`

  **(b) Two new optional fields for the Kai card** (or any future card with a similar shape):

  - `images: [{ label, src, alt }, ...]` — for cards with multiple character design variants. Renders side-by-side (or stacked on mobile) with labels under each. When `images` is present, the existing single `image` field is ignored. Kai uses this; nobody else currently does.
  - `scenes: [{ label, audio, description? }, ...]` — for cards whose audio content is organized into longer scenes rather than discrete lines with stage cues. Each scene renders as: label heading + optional one-line description + native `<audio>` player. Kai uses this; other cast cards keep their existing `lines` shape.

  **Add the Kai card** at the end of the `CAST` array (or just before `FAMILY_PHOTO`):

  ```js
  {
    id: 'kai',
    name: 'Kai',
    show: 'learning-skills',
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
        label: 'Scene 2 — The Why (It\'s in Your DNA)',
        audio: '/cast/audio/kai-scene-2-the-why.mp3',
        description: '≈ 0:45. Why belonging matters. Hands off to Who I Am Poem.',
      },
    ],
  },
  ```

  **Add a `show` field to the existing cast cards** — same string `'sams-story'` for all five (Sam 16, Sam 14, Foster Mom, Foster Dad, Mrs. Johnson). The `FAMILY_PHOTO` export at the bottom of the file is separate from the `CAST` array — it can also be implicitly part of Sam's Story (no change to it).

  **Update the top-of-file comment block** to add:
  - A `show` field bullet explaining that each card belongs to one of two shows (Sam's Story = the narrative-video script; Learning Skills for Belonging = Adrienne's psychoeducation script that introduces the six activities).
  - A `images: [{ label, src, alt }, ...]` bullet for multi-variant cards.
  - A `scenes: [{ label, audio, description? }, ...]` bullet for cards organized by scene rather than per-line.

  #### Change 3 — `src/pages/DemoPage.jsx`: split Meet-the-cast into two named sections, render Kai's shape

  **Section header restructure.** The current `## Meet the cast` heading becomes **two parallel `## Sam's Story` and `## Learning Skills for Belonging` headings**, in that order on the page. Each renders the cards filtered by `show` value.

  **Order within each section:**

  `## Sam's Story` (preserves today's content unchanged):
  1. Script 2.0 download link (the existing Draft 24 affordance — stays under Sam's Story since it's Holly's script for that show).
  2. Cast cards in current order: Sam 16, Sam 14, Foster Mom, Foster Dad, Mrs. Johnson.
  3. Family Photo at the end.

  `## Learning Skills for Belonging` (new):
  1. Brief intro paragraph — *"The psychoeducation track that wraps the six activities. Kai narrates eight scenes total; two recorded so far."* (One sentence is enough; the heading does most of the work.)
  2. Kai card (only card in this section for now).

  **Render Kai's card.** New branch in the CastCard renderer to handle the new shapes:

  - **`images` array** (multi-image variant gallery): render the images side-by-side in a 2-column grid on desktop, stacked vertically on mobile. Each image at a reasonable size (`max-w-[280px]` or similar — they're character design references, the team needs to see them clearly but they shouldn't dominate). Below each image, render the `label` as a small caption (`text-sm text-slate-600 italic mt-1`).
  - **`role` line** below the images (same as other cards).
  - **`scenes` array**: render each scene as a labeled block. Per scene: `label` as a small bold heading (`text-sm font-semibold text-slate-700`), optional `description` as a smaller italic line below, native `<audio controls preload="metadata">` underneath. Stack vertically with reasonable spacing (`mt-4` between scenes).

  Precedence on the card (top to bottom):
  1. `voiceSamples` (if present — not used by Kai currently)
  2. `images` OR single `image` (whichever the card has)
  3. `role` line
  4. `scenes` OR `lines` OR `description` (whichever the card has)

  #### What does NOT change

  - The Activities section, Growing your roots section, Tests, Data export demo — all untouched.
  - The existing Sam 16 voiceSamples + Sam 14 voiceSamples (from Drafts 33 + 34) — preserved.
  - Existing Sam 14 / Foster Mom `lines` arrays — preserved.
  - Foster Dad / Mrs. Johnson `description` paragraphs — preserved.
  - Family Photo closer — preserved (renders under Sam's Story section).
  - The Script 2.0 download — stays in Sam's Story section, unchanged URL + behavior.
  - No `activityVersions.js` bump (DemoPage section).
  - No feedback-category change.

  #### Out of scope (queued for future drafts)

  - **Kai's Lines docx download link.** Parallel to Script 2.0 in Sam's Story. The doc exists at `Video Content/Kais_Lines.docx` — easy to add as a download under the Learning Skills for Belonging heading later, once it's been through team review. Not in this draft.
  - **Remaining Kai scenes** (Scenes 3, 4, Part II scenes, Conclusion). When recorded + voice-changed, extend the `scenes` array with new entries.
  - **Additional Kai image variants** if more land — `images` array extends.
  - **Kai voice-model sample** (parallel to Sam 16's `voiceSamples`). If a stitched all-scenes Kai voice demo is produced later, add `voiceSamples` to Kai's card the same way Sam 16 has it.

  **Approved by:** Josh, 2026-06-24 — after the two Kai images, two Kai scene audios, and the Voice Changer pipeline for Kai all landed.

  *End of Draft 35.*

  </details>

- **`c89c261` · 2026-06-24** — Draft 34: Meet-the-cast — added Sam 14's **Brayden-voiced "both lines" voice sample** (same Voice Changer pipeline as Sam 16, locked 2026-06-24), retiring the per-line "Voice model coming soon" notes. Copied `14 year old sam by josh.wav` (~1.36 MB) → `public/cast/audio/sam-14-voice-sample.wav` (WAV as-is — no ffmpeg on hand to convert; small + universally supported). **castData.js:** Sam 14 gains `voiceSamples: [{ label, src }]` alongside its existing `lines` (kept for scene-cue + verbatim context under the sample). **DemoPage CastCard:** `voiceSamples` now render as their own block ABOVE the videos/lines/description content (a card can have both — Sam 14 does); the "Voice model coming soon" line note is suppressed when a card has `voiceSamples`, and the final `description` fallback is null-safe. No version bump (DemoPage section). Verified via preview: Sam 14 shows the labeled voice player + both lines with no "coming soon"; Sam 16 + Foster Mom unchanged; wav serves 200 `audio/wav`.

  <details>
  <summary>Draft 34 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 34 — Meet-the-cast: add Sam 14's Brayden-voiced "14 year old sam by josh" audio sample

  Parallel to Draft 33, on the Sam 14 card. Josh ran his recordings of Sam 14's two lines through the same ElevenLabs Voice Changer + Brayden pipeline locked 2026-06-24. The lightening effect that solved the older-Sam voice problem also works for Sam 14 — the result is one continuous audio file demoing both Sam 14 beats.

  This makes the per-line *"Voice model coming soon"* notes that shipped in commit `4586532` (2026-06-12) stale — the voice model IS ready now. The card should reflect that.

  **The file:** `SSI Platform A/Video Content/New Voiceover/14 year old sam by josh.wav` (~1.36 MB). Brayden-voiced, both Sam 14 lines.

  #### Change 1 — Copy the audio into `public/cast/audio/`

  Source → destination:

  | Source | Destination |
  |---|---|
  | `Video Content/New Voiceover/14 year old sam by josh.wav` | `public/cast/audio/sam-14-voice-sample.{wav\|mp3}` |

  **Format choice:** the source is WAV (~1.36 MB). Two paths:

  - **Use the WAV as-is.** All modern browsers support `<audio>` playback of WAV; the file is small enough that the size isn't a real concern. Quickest path. Destination: `public/cast/audio/sam-14-voice-sample.wav`.
  - **Convert to MP3.** Smaller file, matches the format pattern of the other audio assets (`older-sam-narrator.mp3`, the legacy line clips). One-line `ffmpeg -i input.wav -codec:a libmp3lame -qscale:a 4 output.mp3` if ffmpeg is available. Destination: `public/cast/audio/sam-14-voice-sample.mp3`.

  *Recommend converting to MP3* for consistency with the rest of `/public/cast/audio/`, but either works. The `src` reference in castData.js follows whichever extension you pick.

  #### Change 2 — `src/lib/castData.js`: add `voiceSamples` to Sam 14, suppress "coming soon" notes

  Sam 14's card currently has `lines: [{ scene, text }, { scene, text }]` (audio fields removed in commit `4586532`, which made the renderer show *"Voice model coming soon"* for any `lines` entry without an `audio` field). Add a new `voiceSamples` field alongside `lines` — same shape as the Sam 16 entry from Draft 33.

  **Before (Sam 14 card):**

  ```js
  {
    id: 'sam-14',
    name: 'Sam (14 years old)',
    image: '/cast/images/sam-14.png',
    alt: 'Sam at 14 — the 14-year-old version of the main character',
    role: 'The 14-year-old version — at the heart of every flashback.',
    landscape: true,
    lines: [
      { scene: '…', text: 'How do I feel about that? I have literally no idea.' },
      { scene: '…', text: "You aren't my parents and you never will be." },
    ],
  },
  ```

  **After:**

  ```js
  {
    id: 'sam-14',
    name: 'Sam (14 years old)',
    image: '/cast/images/sam-14.png',
    alt: 'Sam at 14 — the 14-year-old version of the main character',
    role: 'The 14-year-old version — at the heart of every flashback.',
    landscape: true,
    voiceSamples: [
      {
        label: 'New Sam 14 Voice Model — Both Lines',
        src: '/cast/audio/sam-14-voice-sample.mp3',  // or .wav per Change 1
      },
    ],
    lines: [
      { scene: '…', text: 'How do I feel about that? I have literally no idea.' },
      { scene: '…', text: "You aren't my parents and you never will be." },
    ],
  },
  ```

  `lines` stays on Sam 14 — the scene cues + verbatim line text are still useful context for what's being voiced in the sample above. The audio is just the bundled both-lines preview rather than per-line clips.

  #### Change 3 — `src/pages/DemoPage.jsx`: suppress per-line "Voice model coming soon" notes when the card has a `voiceSamples` array

  The CastCard currently renders a *"Voice model coming soon"* note inline for any `lines` entry that lacks an `audio` field (per commit `4586532`). That note is now stale on Sam 14 because the voice model IS ready — the bundled sample is in `voiceSamples` above.

  **Update the renderer's line-block logic:** when the card has a non-empty `voiceSamples` array, suppress the *"Voice model coming soon"* fallback note for that card's lines. The line's scene cue + spoken-text still render; just drop the inline note.

  Don't change the fallback note for Foster Mom or any other card — those cards don't have `voiceSamples`, so the existing behavior (audio clip shown when `audio` is present, *"coming soon"* otherwise) stays exactly as today.

  Pseudocode:

  ```jsx
  {card.lines?.map(line => (
    <div key={...}>
      <span className="scene-cue">{line.scene}</span>
      <p>{line.text}</p>
      {line.audio && <audio src={line.audio} controls />}
      {!line.audio && !card.voiceSamples?.length && (
        <p className="italic text-slate-500">Voice model coming soon</p>
      )}
    </div>
  ))}
  ```

  (Actual JSX structure follows the existing CastCard pattern — Code will know where the note renders today.)

  #### Render order on Sam 14's card after this ships

  Voice samples are rendered above the lines (same precedence as Draft 33 established):

  1. Photo + role line (unchanged)
  2. **Voice sample**: *"New Sam 14 Voice Model — Both Lines"* label + native `<audio>` player
  3. Lines block: two scene-cue + line-text entries, no *"coming soon"* notes

  #### What does NOT change

  - The two Sam 14 lines themselves (scene cues + verbatim text) — preserved.
  - The legacy `sam-14-line-*.mp3` files at `/public/cast/audio/` (if any remain) — unreferenced, leave in place.
  - Sam 16's card (Draft 33 just shipped) — untouched.
  - Other cast cards — untouched.
  - No version bump — DemoPage section.

  #### Out of scope (queued)

  - Split the bundled Sam 14 voice sample into per-line clips and re-attach as `audio` fields on the `lines` entries. Possible later for per-line playback alongside the scene cues, but the bundled sample is enough surface area for the team to evaluate the voice. Leave for future iteration if the team wants finer-grained per-line listening.
  - Other characters' voice samples (Foster Mom / Foster Dad / Mrs. Johnson) — same `voiceSamples` shape, queued when those voice models are picked.
  - Re-rendering Sam 14 video shots with the new Brayden voice — there are no Sam 14 video shots yet; this is the first time Sam 14's voice has been on the demo.

  **Approved by:** Josh, 2026-06-24 — after exporting `14 year old sam by josh.wav` from the Voice Changer.

  *End of Draft 34.*

  </details>

- **`aa196c0` · 2026-06-24** — Draft 33: Meet-the-cast — swapped Sam 16's four video clips for the new **Brayden-voiced "Older Sam Narrator" audio sample** (all narrator lines stitched). Voice pipeline locked 2026-06-24 (Josh records → ElevenLabs Voice Changer → Brayden = Sam); the team's feedback was about the *voices*, so we surface only the new locked voice rather than show it beside the old-voice videos. Copied `Older Sam Narrator.mp3` (~3.5 MB) → `public/cast/audio/older-sam-narrator.mp3`. **castData.js:** Sam 16's `videos: [...]` → `voiceSamples: [{ label, src }]` (one all-lines sample); top-of-file comment updated. **DemoPage CastCard:** new `voiceSamples` branch (label + native `<audio controls preload="metadata">`), takes precedence over `videos`/`lines`/`description`; the `videos` branch is kept in the renderer for future re-introduction. The four `sam-16-line-*.mp4` files stay in `/public/cast/video/` unreferenced (return later re-rendered with Brayden audio under the speech-first pipeline). No version bump (DemoPage section). Verified via preview: Sam 16 card = 1 `<audio>` player, 0 videos/iframes, mp3 serves 200 `audio/mpeg`.

  <details>
  <summary>Draft 33 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 33 — Meet-the-cast: swap Sam 16's videos for the Brayden-voiced "Older Sam Narrator" audio sample

  Following the 2026-06-24 voice pipeline lock (Josh records → ElevenLabs Voice Changer → Brayden model = Sam's voice), Josh produced a single all-lines voice-model demo for Sam 16. **Two coupled changes:** add the new audio sample to Sam 16's card, AND remove the four existing video clips (Line 1 + Line 3 shots 1/2/3) that shipped in Draft 31. Reason: the team's feedback on the existing videos was that the *voices* didn't land. Rather than show the team the new locked voice next to the old voice in the videos (which would invite confusion), surface only the new voice — the videos can come back later, re-rendered with Brayden audio under the speech-first pipeline.

  **The file:** `SSI Platform A/Video Content/New Voiceover/Older Sam Narrator.mp3` (~3.5 MB). Brayden-voiced, all Sam 16 narrator lines stitched together.

  #### Change 1 — Copy the mp3 into `public/cast/audio/`

  Source path → destination:

  | Source | Destination |
  |---|---|
  | `Video Content/New Voiceover/Older Sam Narrator.mp3` | `public/cast/audio/older-sam-narrator.mp3` |

  Single new asset, ~3.5 MB. With `preload="metadata"` on the native `<audio>` element, up-front fetch is tiny and the full mp3 only loads on play.

  #### Change 2 — `src/lib/castData.js`: replace `videos` with `voiceSamples` on Sam 16

  Sam 16's card currently carries `videos: [...]` (from Draft 31) with four entries. Remove that field entirely. Add a new field, `voiceSamples: [...]`, in its place.

  **Before (Sam 16 card):**

  ```js
  {
    id: 'sam-16',
    name: 'Sam (16 years old)',
    image: '/cast/images/sam-16.png',
    alt: 'Sam at 16 — the narrator, two years later',
    role: 'Our narrator — Sam two years later.',
    videos: [ /* four entries: Line 1 + Line 3 shots 1/2/3 */ ],
  },
  ```

  **After:**

  ```js
  {
    id: 'sam-16',
    name: 'Sam (16 years old)',
    image: '/cast/images/sam-16.png',
    alt: 'Sam at 16 — the narrator, two years later',
    role: 'Our narrator — Sam two years later.',
    voiceSamples: [
      {
        label: 'New Older Sam Voice Model — All Lines',
        src: '/cast/audio/older-sam-narrator.mp3',
      },
    ],
  },
  ```

  Per `voiceSamples` entry shape:
  - `label` (string, required) — the section heading rendered above the audio player.
  - `src` (string, required) — absolute URL to the mp3 in `/cast/audio/`.

  The array shape is used so future voice samples (Sam 14, other character voice demos) can extend without another refactor.

  Other cast cards — no changes. `voiceSamples` is Sam-16-only for now.

  **Update the top-of-file comment block:**

  - Replace the current bullet describing `video` / `videos` as Sam 16's content shape with: `voiceSamples`: [{ label, src }] — labeled audio-only voice-model previews, rendered as native `<audio>` players. Sam 16's card uses this to demo the locked Brayden voice across all narrator lines (Voice Changer pipeline locked 2026-06-24).
  - Update the paragraph mentioning "Sam 16's card now previews four rendered Sam's Story shots" — rewrite to say Sam 16's card currently previews the locked Brayden voice across all narrator lines via a single audio sample. The four mp4s remain at `public/cast/video/sam-16-line-*.mp4` but are no longer referenced; they'll come back when re-rendered with Brayden audio under the speech-first pipeline.

  #### Change 3 — `src/pages/DemoPage.jsx`: render `voiceSamples` in CastCard; drop the `videos` branch for Sam 16

  In the CastCard renderer:

  1. **Add a `voiceSamples` render branch.** Iterate the array, render each entry's label as a small heading, then a native `<audio>` player below it.
  2. **The existing `videos` render branch stays in the renderer** for backward compatibility with future cards that may use videos again — just don't pass `videos` for Sam 16 anymore (handled automatically once `videos` is removed from Sam 16's card data in Change 2).

  **Render order for voice samples (top to bottom, per entry):**

  1. **Label** — small heading, same styling pattern as the per-video `label` in Draft 31 (probably `text-sm font-semibold text-slate-700 mt-4 mb-2`). First voice-sample's label can drop the `mt-4` to sit closer to the image/role line.
  2. **Audio player** — native `<audio controls preload="metadata">` with `src={entry.src}`. Centered or full-width within a sensible container (`max-w-[320px]` works to match the video sizing the team is used to, but full-width is also fine for audio). No styling chrome beyond the browser's default audio controls.

  **Precedence on the card.** A card can have any combination of `voiceSamples`, `videos`, `lines`, `description` going forward. For now Sam 16 will only have `voiceSamples`; Sam 14 + Foster Mom keep `lines`; Foster Dad + Mrs. Johnson keep `description`. When rendering, render `voiceSamples` first (if present), then whichever of `videos` / `lines` / `description` the card has below it. Today only Sam 16 has voice samples and no other content shape — so the renderer just produces image + role + voice sample.

  #### What does NOT change

  - The four `sam-16-line-*.mp4` files at `/public/cast/video/` — **left in place** but no longer referenced. Same pattern as the legacy `sam-16-line-*.mp3` files from earlier (Draft 29 left those in place when the audio-line clips were dropped). When Sam 16's videos return (Brayden-voiced via the speech-first pipeline), the files in `/public/cast/video/` may or may not be the ones we reference — easier to keep them around now and decide later than to delete and re-copy. *Recommend leaving in place.*
  - The Meet-the-cast section heading, the Script 2.0 download link, the Family Photo closer, and surrounding /demo page structure.
  - Other cast cards (Sam 14, Foster Mom, Foster Dad, Mrs. Johnson) — no changes.
  - No `activityVersions.js` bump — DemoPage section, not an activity.
  - No feedback-category change — existing `video` category still covers voice/video feedback on this surface.

  #### Out of scope (queued for future drafts)

  - **Sam 14 voice sample.** There's a `Sam 14.mp3` file in the same `New Voiceover/` folder (~328 KB) — Josh hasn't asked to add it yet. When confirmed, extend the same `voiceSamples` shape on Sam 14's card with an entry like `{ label: 'New Sam 14 Voice Model — Both Lines', src: '/cast/audio/sam-14-voice-sample.mp3' }`.
  - **Bring back the videos with Brayden voice.** Deferred pending the speech-first video gen A/B test (per the 2026-06-24 voice + workflow pivot planning notes above). When that lands and the workflow is validated, re-render Lines 1 + 3 with Brayden audio and re-introduce `videos: [...]` on Sam 16's card.
  - **Other characters' voice samples** (Foster Mom / Foster Dad / Mrs. Johnson) — when those voice models are chosen and tested, same `voiceSamples` shape extends to their cards.

  **Approved by:** Josh, 2026-06-24 — after the Brayden voice landed and Josh exported the all-lines stitched mp3.

  *End of Draft 33.*

  </details>

- **`a240bda` · 2026-06-18** — Draft 32: Round 5 feedback bundle, five activities in one commit. **Self-Reflection v1.3 → v1.4:** deleted the "Hold onto what came up" closing (Ginny + Holly); moved the example thought/feeling text out of the textarea placeholder into persistent help text so it stays visible while typing. **Letter v2.2 → v2.3:** closing rewritten to "You can save or print this letter and look back on it…" (Holly) — and since the done screen had no save affordance (the draft assumed one existed), it now shows the letter back in a keepsake card + a Save-as-image button (reuses `downloadSvgStringAsPng`). **Belonging Skills Sort v3.1 → v3.2:** snapshot closing "it's yours to keep" → "Think about when you could try out one of these skills." (Holly); action-plan pull-forward deferred to flow integration. **Getting Unstuck v5.6 → v5.7:** dropped the "Need an example?" disclosure (Stephanie's "pick one"; Josh kept "I need help"); renamed the button → "I need help creating a new thought" (Holly); restyled it bigger/bolder as a secondary CTA; confirmed on both Challenge + Both/And; removed the now-unused `BOTH_AND_EXAMPLES`. **Allies / Safety Net v5.4 → v5.5:** per-type Strengthen "e.g." examples now match the type (Practical "takes me to practice", Emotional "someone to talk to when I am feeling down", Social unchanged); reveal copy "show up" → "may show up"; empty-wedge "No {type} yet" pills made bigger + near-solid and a new color-coded "No one named for: {types}" callout renders below the net whenever any type has zero allies (Stephanie's gap-visibility ask). All copy/styling/behavior — no data-shape/export/save change. Verified via preview across all five. Added two Round 5 Cleanup-queue items.

  <details>
  <summary>Draft 32 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 32 — Round 5 feedback bundle (Self-Reflection v1.4 + Letter v2.3 + BSS v3.2 + Getting Unstuck v5.7 + Allies v5.5)

  Bundle of small-to-medium fixes from the 2026-06-18 review round (feedback CSV at `Meeting Notes and Feedback/6 18 Feedback.csv`). Five activities touched, ship as one commit so the demo flips in lockstep — same batched-stopping-point pattern as Draft 7b7046e (2026-05-11) and Draft 26 (2026-06-08).

  **Approved by:** Josh, 2026-06-18.

  ---

  #### Part A — Self-Reflection v1.3 → v1.4 (MINOR)

  Two changes from Ginny + Holly's overlapping feedback.

  ##### A.1 — Delete the "hold onto what came up" closing message

  Both Ginny and Holly independently flagged the closing line as inappropriate / unclear. Ginny also reported "no direction on how to proceed" on the same screen.

  **File:** `src/activities/SelfReflection.jsx`.

  **Change:** Delete the *"Hold onto what came up"* closing message entirely. No replacement copy. The kid moves straight to the next-step affordance (Continue button → next section, or save-and-done if the activity is being run in isolation). Same logic as the Draft 26 Part A change that removed the false *"we'll come back to it"* line — don't promise things we don't do.

  ##### A.2 — Move example placeholders out of the textarea

  Holly flagged that the example placeholders disappear when the kid starts typing. Currently they live as `placeholder=` attributes on the textarea, which is why. Examples should stay visible while the kid types.

  **Change:** Render the examples as small, persistent help text *above or alongside* the textarea (not inside it). Keep the wording exactly as locked in Draft 26 Part A — for the inclusion prompt: *"e.g., People like me"* / *"e.g., Happy"*; for the exclusion prompt: *"e.g., Nobody likes me"* / *"e.g., I felt sad."* Style as muted slate-500 italic small text so they read as guidance, not as content. The textarea's own `placeholder` can be empty or use a generic *"Type your response here…"*

  **Version bump:** v1.3 → v1.4 (MINOR). Prepend changelog: *"v1.4 — Deleted the 'hold onto what came up' closing message per Ginny + Holly's 2026-06-18 feedback; moved example placeholders out of the textarea so they remain visible while the kid types (Holly's ask)."* Update `updated`.

  ---

  #### Part B — Letter to Another Youth v2.2 → v2.3 (MINOR copy change)

  Holly flagged the *"That letter is yours"* closing message as passive — wants something more action-oriented.

  **File:** `src/activities/LetterBuilder.jsx`.

  **Change:** Replace the closing message with Josh's locked copy:

  > *"You can save or print this letter and look back on it whenever you need a reminder or some encouragement."*

  The existing save-as-PNG button (commit `92bfff9`) stays exactly as today — the new copy explicitly references "save," so the affordance needs to be visible.

  **Version bump:** v2.2 → v2.3 (MINOR). Prepend changelog: *"v2.3 — Closing message rewritten per Holly's 2026-06-18 feedback ('That letter is yours' → 'You can save or print this letter and look back on it whenever you need a reminder or some encouragement.')."* Update `updated`.

  ---

  #### Part C — Belonging Skills Sort v3.1 → v3.2 (MINOR copy change)

  Holly flagged the *"it's yours to keep"* closing message as too passive. Wants action-oriented.

  **File:** `src/activities/BelongingSkillsSort.jsx`.

  **Change:** Replace the closing message with:

  > *"Think about when you could try out one of these skills."*

  (Adapts Holly's suggested phrasing.) **Do not include** a "we'll come back to this in your action plan" callback yet — Josh's admin note flagged the pull-forward intent, but the action plan integration isn't built. Re-introducing a forward-referencing callback before the integration exists would repeat the false-callback anti-pattern Draft 26 Part A specifically removed. Add the pull-forward to the Cleanup queue (see end of this draft) for when the flow integration lands.

  **Version bump:** v3.1 → v3.2 (MINOR). Prepend changelog: *"v3.2 — Closing message rewritten per Holly's 2026-06-18 feedback ('it's yours to keep' → 'Think about when you could try out one of these skills'). Action-plan pull-forward deferred to the flow-integration draft."* Update `updated`.

  ---

  #### Part D — Getting Unstuck v5.6 → v5.7 (MINOR; "I need help" consolidation + restyle)

  Three pieces of feedback from Jessica, Stephanie, and Holly converge on the help-affordance UI. Resolution: drop the *"Need an example?"* button entirely, keep only *"I need help"* (Stephanie's "pick one" resolved in favor of "I need help" per Josh's 2026-06-18 call), rename it, restyle it, and ensure it appears on both Challenge and Both/And strategies.

  **File:** `src/activities/GettingUnstuck.jsx`.

  ##### D.1 — Drop the "Need an example?" button entirely

  Currently the *"Need an example?"* button appears on the Both/And strategy screens (Holly: *"the both/and pages have 'need an example?' buttons but the challenge it pages do not"*). Stephanie's instinct was that *"Need an example?"* and *"I need help"* are redundant — kids only need one help affordance per screen. Josh's resolution: keep *"I need help"* (the strategy-aware alternative-thoughts panel from Draft 27), drop *"Need an example?"* entirely.

  **Change:** Remove the *"Need an example?"* button and any associated example-content surfaces from the Both/And screens. Any state, data, or content tied specifically to that button (e.g., example-thought lists if those were separate from the help_suggestions content) can be removed — `help_suggestions` from `src/lib/appraisals.js` is now the single help-content source.

  ##### D.2 — Rename "I need help" to "I need help creating a new thought"

  Holly: *"Can the 'I need help' be a bit bigger and can it maybe say 'I need help creating a new thought' just so they don't see it and think it means technical help or something."*

  **Change:** The button label string becomes *"I need help creating a new thought."* Same behavior, same panel content, just renamed so kids understand it's about generating a new thought, not requesting tech support.

  ##### D.3 — Restyle "I need help creating a new thought" — bigger + bolder

  Jessica + Holly both flagged that the current button is too subtle.

  **Change:** Bump the button styling up a tier in prominence. Suggested target: from current size (probably `text-sm`) → `text-base font-semibold`, plus a clearer color tint — e.g., amber-100 background with amber-300 border, or whatever the platform's "secondary CTA" treatment is. Goal: the button reads as a clear, usable affordance, not as a subtle link. Don't push it all the way to a primary CTA (it shouldn't compete with the main Continue / Save buttons) — just visible.

  ##### D.4 — Ensure "I need help creating a new thought" appears on both Challenge and Both/And screens

  Per Draft 27, the help panel is strategy-aware (different alternative thoughts surface depending on the kid's current strategy). The button itself should already appear on both Challenge and Both/And per that design, but worth verifying — Josh's 2026-06-18 call is explicit: *"those should be on both Challenge it and the Both/And section."* If the button is currently only on one (or if there's any conditional rendering tied to the dropped *"Need an example?"* logic that gates *"I need help"* too), make sure it's unconditionally present on both strategy screens.

  **Version bump:** `getting-unstuck` v5.6 → **v5.7 (MINOR)**. Prepend changelog: *"v5.7 — Dropped the 'Need an example?' button per Stephanie's 2026-06-18 'pick one' feedback (Josh resolved in favor of keeping 'I need help'); renamed 'I need help' → 'I need help creating a new thought' (Holly's clarification ask); restyled the button bigger + bolder (Jessica + Holly); ensured the button appears on both Challenge and Both/And strategy screens."* Update `updated`.

  ---

  #### Part E — Allies / Safety Net v5.4 → v5.5 (MINOR; per-type Strengthen copy + reveal copy edit + empty-wedge prominence)

  Three pieces of feedback. Jessica positive on the percentages (no action). Holly flagged a mismatch on the Strengthen step's Practical example + a "doesn't apply to my net" issue on the post-save reveal. Stephanie asked for the empty wedges to read more visibly as gaps.

  **Files:**
  - `src/activities/AlliesSafetyNet.jsx`
  - `src/components/TrampolineNet.jsx`

  ##### E.1 — Per-type Strengthen examples should match each support type

  Holly: *"the 'e.g.' in the strengthen your practical support box is about hanging out during the weekend, but I think that's more social support."* Josh's admin note locks the replacement copy:

  **Change:** Update the per-type example text on each Strengthen screen so the example actually matches the support type:

  | Support type | Replacement example |
  |---|---|
  | Practical | *"e.g., takes me to practice"* |
  | Emotional | *"e.g., someone to talk to when I am feeling down"* |
  | Social | unchanged — keep the existing "hanging out during the weekend" wording (or whatever Social currently uses); Josh's note: *"Keep social"* |

  Find the current `e.g.` strings (likely in the Strengthen-screen sub-components or in a per-type config object) and swap Practical + Emotional. Don't touch Social.

  ##### E.2 — Post-save reveal: soften "show up" to "may show up"

  Holly: *"This says 'Some allies show up in more than one place — that's the strongest kind.' but that doesn't apply to the one I made so maybe rephrase?"* The line assumes multi-placement is happening, which isn't always true.

  **Change:** On the post-save reveal screen (the "Your safety net" view shown after the kid finishes selecting), change the line:

  - **From:** *"Some allies show up in more than one place — that's the strongest kind."*
  - **To:** *"Some allies may show up in more than one place — that's the strongest kind."*

  Single-word edit ("show" → "may show"). Conditional framing reads as accurate for kids whose allies are all single-placed AND kids who have multi-placed allies.

  ##### E.3 — Empty-wedge prominence

  Stephanie: *"If they report no one is an ally in one of the three areas, can the 'no support yet' area look bigger — so that it is a more visible hole or gap in their safety net?"*

  This is in tension with Draft 30's equal-120° thirds geometry (already shipping for total allies ≤ 2). Keep that geometry — don't break the cleanly-equal wedges. Stephanie's "look bigger" is read as "more visible as a gap," not literally bigger geometrically. Address with two coordinated visual moves:

  **Change E.3.a — Boost the "No {type} yet" pill prominence.** Currently the pill uses small text in a faded color. Bump the text size up (e.g., `text-sm` → `text-base font-medium`) and increase contrast — keep the per-type color (rose for emotional, sky for social) but darker / less faded. The pill should read as a definite label, not a quiet placeholder.

  **Change E.3.b — Add an explicit "Missing: {types}" callout below the net** when one or more support types have zero allies. Renders as a short line directly under the net visual (or the captions, if those are present). Format suggestion:

  > *No one named for: **emotional support**, **social support***

  Per-type words color-coded with the existing per-type colors (rose / sky). Singular vs plural handled per gap count. Doesn't render when all three types have at least one ally.

  This makes the gap explicit by name, which is harder for a kid to overlook than empty space alone.

  **Both changes apply at all ally counts** (not just ≤ 2), since a kid could have e.g. 3 practical + 0 emotional + 0 social and still need the gap call-out. The Draft 30 equal-thirds geometry only kicks in when total allies ≤ 2; the empty-pill restyling and Missing callout apply whenever any support type has zero allies.

  **Version bump:** `allies-safety-net` v5.4 → **v5.5 (MINOR)**. Prepend changelog: *"v5.5 — Strengthen per-type 'e.g.' examples rewritten so each actually matches its support type (Holly's 2026-06-18 feedback: 'hanging out on weekends' is social, not practical); softened post-save reveal copy ('show up' → 'may show up') so it doesn't read as wrong for kids without multi-placed allies; boosted empty-wedge 'No {type} yet' pill prominence + added explicit 'No one named for: {types}' callout below the net (Stephanie's gap-visibility ask)."* Update `updated`.

  ---

  #### Cleanup queue additions

  Add two items to the Cleanup queue (manual housekeeping section):

  1. **BSS sorted skills should pull forward to an action plan when that's built.** Josh's admin note on Holly's 2026-06-18 feedback expressed intent to reference the action plan in the BSS closing message; deferred this round because the action plan doesn't exist yet and we don't want to repeat the false-callback anti-pattern from Draft 26. Revisit when the flow integration draft lands (the same draft that wires Draft 21's tree-progress into the participant flow).

  2. **Re-check the *"I need help" / "Need an example?"* simplification with Stephanie at the next meeting.** Stephanie's "pick one" feedback was resolved in favor of "I need help" per Josh's 2026-06-18 call. Worth confirming with her at the next review whether the consolidated affordance reads right after seeing it in action — and whether the alternatives content from Draft 27 still feels sufficient as the sole help surface.

  ---

  #### What does NOT change

  - Pretest, Posttest, FollowUp Survey, Who I Am Poem — no feedback this round, untouched.
  - TrampolineNet's equal-120° thirds geometry from Draft 30 — preserved.
  - The Draft 27 strategy-aware `help_suggestions` content — unchanged (Stephanie's content stays as the panel content for "I need help creating a new thought").
  - Data shapes, export pipeline, demoDataset — no data changes across any of the five parts; all changes are copy / styling / behavior.

  #### Out of scope (queued)

  - Flow integration (Draft 21) — still deferred.
  - Action-plan pull-forward for BSS — Cleanup queue item.
  - Continuation of Sam's Story per-shot video work — independent of this draft.
  - Sam 14 / Female / Nonbinary variants — independent.

  *End of Draft 32.*

  </details>

- **`160db0f` · 2026-06-17** — Draft 31: Meet-the-cast — added **three Sam Line 3 videos** to the Sam 16 card (the wince/regret beat across three framings) alongside the existing Line 1, all self-hosted. Copied the three new mp4s into `public/cast/video/` as `sam-16-line-3-shot-{1,2,3}.mp4` (~18.4 MB) and renamed `sam-16-opening.mp4` → `sam-16-line-1.mp4` for naming consistency. **castData.js:** migrated the Sam 16 entry from the singular `video: {}` to a `videos: []` array — four entries, each `{ src, caption, label? }` where `caption` is the spoken line verbatim (as-aired text: Line 1 "different homes" synonym swap; Line 3 grade-school swap + comma pacing) and `label` heads each logical group ("Line 1 — Opening narration", "Line 3 — After the rejection"). **DemoPage CastCard:** iterates `videos[]` (optional label → 9:16 player → caption, stacked, mt-6 between entries); precedence `videos` > `lines` > `description`; dropped the legacy singular `video` branch (Sam 16 was its only consumer). Native `<video>` for `src`, YouTube iframe fallback for `youtubeId`. Verified via preview: Sam 16 card = 4 native `<video>` players, 0 iframes, all four mp4s serve 200 `video/mp4`, both labels + 4 captions present. DemoPage section, no version bump.

  <details>
  <summary>Draft 31 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 31 — Meet-the-cast: add three Sam Line 3 videos to the Sam 16 card (temp self-hosted)

  Three more rendered Sam's Story shots landed today (Sam Line 3, 2026-06-17) — the wince/regret beat across three framings (medium close-up → wider ¾ → tight close-up). Source mp4s sit at `SSI Platform A/Video Content/World Building/`. Add them to the Sam 16 cast card alongside Line 1, using the same self-hosted pattern as the existing `sam-16-opening.mp4` (per commit `516a330`).

  Josh's framing for the team: each video paired with its spoken line as caption, so the team sees *what's being said* alongside *what's been animated*.

  #### Change 1 — Copy mp4s into `public/cast/video/`

  Source paths (drop these in via `git mv` or `cp`, treating the public folder as authoritative):

  | Source | Destination |
  |---|---|
  | `Video Content/World Building/Yeah that was a low blow.mp4` | `public/cast/video/sam-16-line-3-shot-1.mp4` |
  | `Video Content/World Building/going from grade school to middle school.mp4` | `public/cast/video/sam-16-line-3-shot-2.mp4` |
  | `Video Content/World Building/who could keep up.mp4` | `public/cast/video/sam-16-line-3-shot-3.mp4` |

  Three new files, ~18.4 MB total. Combined with the existing Line 1 mp4, Sam 16's card carries ~27 MB of media — fine for temp hosting since `preload="metadata"` keeps the up-front fetch tiny, and the full mp4 only loads on play.

  **Optional rename for naming consistency:** `public/cast/video/sam-16-opening.mp4` → `public/cast/video/sam-16-line-1.mp4`. Tiny churn for cleaner naming — drops the inconsistent "opening" suffix in favor of the line-numbered scheme the new files use. If renamed, update the corresponding `src` in `castData.js` (Change 2 below). Skip the rename and the `src` keeps pointing at `sam-16-opening.mp4` — both are fine. *Recommend renaming* since this is a tiny diff and the consistency helps when more shots land.

  #### Change 2 — `src/lib/castData.js`: migrate Sam 16 to a `videos: []` array

  Current Sam 16 entry has `video: { src, caption }` — single-video object. Migrate to `videos: [ { src, caption, label? }, ... ]` so the card can carry multiple shots. Each entry has:

  - `src` (string, required) — absolute URL to the self-hosted mp4 in `/cast/video/`.
  - `caption` (string, required) — the spoken line for this shot, verbatim. This is what the team sees under each video.
  - `label` (string, optional) — section header rendered above this video. Use it for the *first* video in a logical group (Line 1, then Line 3); leave it off subsequent videos in the same group so they stack as continuations.
  - `youtubeId` (string, optional) — kept as a fallback shape so a future card can use a YouTube Short instead of self-hosted. Renderer should keep treating `src` and `youtubeId` as mutually exclusive within one entry.

  **New Sam 16 entry:**

  ```js
  {
    id: 'sam-16',
    name: 'Sam (16 years old)',
    image: '/cast/images/sam-16.png',
    alt: 'Sam at 16 — the narrator, two years later',
    role: 'Our narrator — Sam two years later.',
    videos: [
      {
        label: 'Line 1 — Opening narration',
        src: '/cast/video/sam-16-line-1.mp4',  // or '/cast/video/sam-16-opening.mp4' if not renamed
        caption:
          "I remember this moment like it was yesterday. I was removed from my real mom when I was 10 and lived with my foster family after bouncing around different homes for a couple of years.",
      },
      {
        label: 'Line 3 — After the rejection',
        src: '/cast/video/sam-16-line-3-shot-1.mp4',
        caption:
          "Yeah, that was a low blow. But at the time, I really couldn't picture myself belonging to their family. I had been through a lot.",
      },
      {
        src: '/cast/video/sam-16-line-3-shot-2.mp4',
        caption:
          "Going from grade school to middle school to high school isn't easy for anyone, but it was even harder for me because I was changing schools and houses all the time.",
      },
      {
        src: '/cast/video/sam-16-line-3-shot-3.mp4',
        caption:
          "Who could keep up with friends or teams during all of that? It was tough, but I was used to doing everything by myself my whole life.",
      },
    ],
  },
  ```

  **Captions are the spoken lines verbatim** — what the voice model actually said in each clip. Note the Line 1 caption uses "different homes" (the aired version, per the synonym-swap fix) — not the original "placements" text that was in the old `lines` array. Line 3 captions match the as-aired text including the grade-school synonym swap from shot 2 and the comma-after-"tough" pacing cue from shot 3.

  **Update the top-of-file comment block** to reflect the new shape:
  - The "A card can carry one of three content shapes" block: change the first bullet from `` `video`: { src | youtubeId, caption } `` to `` `videos`: [{ src | youtubeId, caption, label? }, ...] `` — array, with the per-entry shape spelled out.
  - The paragraph noting "Sam 16's card now previews the first rendered Sam's Story shot": rewrite to reference *"four rendered Sam's Story shots — Line 1 (opening) plus Line 3 across three framings (medium close-up → wider ¾ → tight close-up)"* and update the file path mention if the rename happens.

  Other cast cards (Sam 14, Foster Mom, Foster Dad, Mrs. Johnson, Family Photo) — no changes. None of them currently use `video`, so the migration from `video: {}` to `videos: []` is Sam-16-only.

  #### Change 3 — `src/pages/DemoPage.jsx`: iterate `videos[]` in CastCard

  Current CastCard renders Sam 16's single `card.video` in a 9:16 mp4 player + caption. Update to handle a `card.videos` array: iterate, render each entry's optional `label` (section header), then the video player, then the caption. Stack vertically with reasonable spacing between entries.

  **Render order per entry (top to bottom):**

  1. **Label**, if present. Small heading style — e.g., `text-sm font-semibold text-slate-700 mt-4 mb-2` (first label can drop the `mt-4`). Stays above the video so it groups visually with the videos beneath it.
  2. **Video player**. Same `max-w-[320px]` 9:16 player as today: native `<video controls playsInline preload="metadata">` when `entry.src` is set, falling back to the YouTube iframe when `entry.youtubeId` is set instead.
  3. **Caption**. Italic small text — same styling as the existing single-video caption (`mt-2 text-center text-sm text-slate-600 italic`).

  **Spacing between entries:** mt-6 or similar — give each video room to breathe so the four don't read as a single dense block. Within a labeled group (e.g., the three Line 3 shots), the lack of a label between entries 2 and 3 naturally groups them; spacing can stay equal.

  **Precedence order in CastCard stays as before** — `videos` (new) > `lines` > `description`. If a card has both `video` (legacy singular) and `videos` (new), prefer `videos`; if the codebase wants to keep `video` as a one-off shape for backwards compat, fine — but since Sam 16 is the only card with video right now, full migration is cleanest. **Recommend dropping legacy `video` support entirely** in this draft (delete the `video` branch from the renderer), since there's no other consumer.

  #### What does NOT change

  - The Meet-the-cast section heading, the Script 2.0 download link (Draft 24), the Family Photo closer, and the surrounding /demo page structure all stay as today.
  - The other cast cards' line / description handling — Sam 14 keeps lines with the "Voice model coming soon" notes, Foster Mom keeps her audio line, Foster Dad + Mrs. Johnson keep description paragraphs.
  - No `activityVersions.js` bump — Meet-the-cast is a DemoPage section, not an activity.
  - No feedback-category change — the existing `video` feedback category already covers feedback on these clips.
  - The seven legacy `sam-16-line-*.mp3` files at `/public/cast/audio/` stay in place (still unreferenced from Draft 29's cleanup decision).

  #### Out of scope (queued for future drafts)

  - Embedding the rest of the Sam 16 narrator beats as they're rendered (Line 2 — adoption-offer reflection, Line 6 — drive-home recognition, Line 7 — transition to metaphor, Line 5 — metaphor closing). When those land, just extend the `videos[]` array.
  - Other characters' video shots (Sam 14, Foster Mom, etc.) — when their Character Builder + voice work is done, they pick up the same `videos[]` shape.
  - Replacing the temp self-hosted mp4s with a CDN or proper video host — fine for now; revisit if the demo's storage footprint becomes a concern.

  **Approved by:** Josh, 2026-06-17 — after the three Sam Line 3 shots landed and were saved to `Video Content/World Building/`.

  *End of Draft 31.*

  </details>

- **`6038d1c` · 2026-06-12** — Draft 30: Allies / Safety Net **v5.3 → v5.4 (MINOR)**. Two fixes from Josh's 2026-06-12 walkthrough. **(1)** Support-type percentage labels gated to post-selection surfaces only — removed from the three transition screens and the per-type selection question (where they shifted live mid-flow, e.g. "Practical 100% / Emotional 0%" before the kid was asked about Emotional); still shown on the net reveal, Inspect, Review, and saved confirmation (pills + ally-list headers). **(2)** Low-ally geometry: when total allies ≤ 2, TrampolineNet now uses equal 120° thirds instead of proportional wedges (new `equalThirds` prop, same ≤2 threshold as the 60%-opacity demotion), so a single ally no longer expands to ~330° / reads as "this area is full"; filled wedge keeps pattern + icon, empty wedges keep greyed fill + "No X yet" pill (now with room not to overlap). Added a second caption line: "Lots of room to grow your safety net in the greyed-out areas." Display-only; no data-shape/export/save change. Verified via preview: selection screens show no %, reveal shows "Practical 100%" + both captions + three equal-120° wedges (all large-arc flags 0).

  <details>
  <summary>Draft 30 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 30 — Allies / Safety Net v5.3 → v5.4: gate percentages to post-selection + low-ally geometry fix

  Two small fixes to the Draft 26 Part D Safety Net percentage work + the Draft 19 wedge geometry, surfaced by Josh's 2026-06-12 walkthrough (with screenshot of the 1-ally case).

  **Files:**
  - `src/activities/AlliesSafetyNet.jsx`
  - `src/components/TrampolineNet.jsx`

  #### Change 1 — Percentage labels only show after all three support-type selections are done

  **Current behavior (Draft 26 Part D, commit `80fa689`):** support-type percentage labels appear on every screen that shows a support-type heading — transition screens, selection question screens, the TrampolineNet `percentByType` pills, and ally-list headers. Percentages recompute in real time as the kid adds allies in each type, with the denominator being total distinct allies across types.

  **Problem:** the percentages shift while the kid is mid-selection — after picking 1 Practical ally and before being asked about Emotional, the visual reads *"Practical 100% / Emotional 0%"* even though the kid hasn't been prompted for Emotional yet. The number-changing-in-real-time across the flow is also noisy. The percentages were intended as awareness on the final rendered net, not as live counters during selection.

  **Fix:** gate the percentage display on a phase check. Percentage labels only appear from the **post-selection rendered safety net** onward — once the kid has been through all three of the Practical / Emotional / Social selection screens.

  **Surfaces where percentages SHOULD show:**
  - The post-selection "Your safety net" reveal screen
  - Inspect step (Step 2) — the net + the ally list
  - Strengthen step (Step 3) — the net + the ally list (where shown)
  - Final Review screen

  **Surfaces where percentages should NOT show:**
  - The three transition screens (Practical / Emotional / Social intros)
  - The three selection question screens ("Who gives you {type} support?")
  - Any intermediate ally-list views during the selection flow

  **Implementation suggestion:** add a `showPercentages` prop to `TrampolineNet` (default `false`) and a parallel flag for the ally-list headings and any inline `{type} N%` heading copy. Set it to `true` only at phase boundaries `>= 'reveal'` (or whatever the phase enum looks like). When false, render headings as plain `Practical` / `Emotional` / `Social` without the trailing `N%`, and skip the TrampolineNet pills' percent text.

  **Data shape:** no change. The percentages are display-only; they're computed at render time from the existing `allies[]` array.

  #### Change 2 — Low-ally state uses equal 120° thirds geometry + a sharper empty-space caption

  **Current behavior (Draft 19, commit `7a7d547`):** TrampolineNet wedge sizing is proportional to per-type ally counts, with empty types collapsing to a 15° labelled sliver. Draft 26 Part D added 60% opacity + a "small net is a place to start" caption when total allies ≤ 2.

  **Problem:** when a kid has 1 ally total (e.g., 1 Practical, 0 Emotional, 0 Social — see Josh's 2026-06-12 screenshot at `/demo/sandbox/allies-safety-net`), the Practical wedge expands to ~330° and the two empty types are tiny 15° slivers at the top. Even with the 60% opacity + caption, the geometry still reads *"Practical is full of allies"* rather than *"you have one person and lots of room to grow."* The two `No emotional yet` / `No social yet` pill labels also stack and overlap in the small upper sliver because there's no space for them.

  **Fix:** when total distinct allies ≤ 2, switch to **equal 120° thirds** geometry across all three wedges regardless of which have content. The filled wedge keeps its yellow woven pattern + ally icon(s); the empty wedges keep their greyed-out / faded fill. Visually communicates *"1 of 3 areas has someone in it"* rather than *"this area is full."*

  Above 2 allies total, **keep current proportional geometry unchanged** — the existing behavior reads correctly once the net has any meaningful spread, and the proportional sizing was intentional per Draft 19.

  **Caption update:** in the same low-ally state (≤ 2 allies total), keep the existing italic "A small net is a place to start" line and add a second italic line directly below it:

  > *Lots of room to grow your safety net in the greyed-out areas.*

  Same styling as the existing caption (small, italic, centered, slate-600 or similar), stacked. Only renders in the low-ally state.

  Both lines disappear once total allies ≥ 3 (same threshold as the 60% opacity demotion).

  #### What does NOT change

  - Proportional wedge sizing for kids with 3+ allies (today's behavior preserved — Draft 19's spec stands above the threshold).
  - The 60% opacity demotion at ≤ 2 allies (still applied alongside the new geometry).
  - Wedge colors (amber / rose / sky for practical / emotional / social per Holly's color-coding from Draft 19).
  - The "No {type} yet" pill labels — they still appear in the empty wedges, just now those wedges are 120° each so the pills have room to sit without overlapping.
  - Save payload, export pipeline, demoDataset — no data shape change.

  #### Version bump

  `allies-safety-net` v5.3 → **v5.4 (MINOR)**. Prepend changelog: *"v5.4 — Support-type percentage labels gated to post-selection surfaces only (hidden during the Practical/Emotional/Social selection flow per Josh's 2026-06-12 walkthrough); low-ally state (≤ 2 total) now uses equal 120° thirds geometry instead of proportional so a single ally doesn't visually fill the net; added a second caption line ('Lots of room to grow your safety net in the greyed-out areas') alongside the existing 'small net is a place to start' line."* Update `updated`.

  **Approved by:** Josh, 2026-06-12.

  *End of Draft 30.*

  </details>

- **`516a330` · 2026-06-12** — Meet-the-cast: **self-hosted** the Sam 16 video instead of the YouTube Short (in-conversation, no draft). The Short's player chrome (title + controls) blocked the first ~5s of the frame. Copied `Video Content/World Building/Sam 16 I remember it like it was yesterday.mp4` → `public/cast/video/sam-16-opening.mp4` (~8.4 MB) and switched the Sam 16 `video` object from `youtubeId` to `src`. `CastCard` renders a native `<video controls playsInline preload="metadata">` when `video.src` is set (only a centered play button until playback, then controls auto-hide — no overlay), falling back to the YouTube iframe when a card provides `youtubeId` instead. Verified via preview: native `<video>` renders, mp4 serves 200 `video/mp4`. Temporary hosting; DemoPage section, no version bump.
- **`4586532` · 2026-06-12** — Meet-the-cast: dropped Sam 14's two ElevenLabs audio scratch clips, replaced each with a muted *"Voice model coming soon"* note (in-conversation, no draft). Removed the `audio` field from Sam 14's two line objects in `src/lib/castData.js`; the `CastCard` renderer now shows the "coming soon" note for any `lines` entry without an `audio` clip (scene cue + quoted text still render). Foster Mom keeps her audio player. Verified via preview: Sam 14 card = 0 audio elements, 2 "coming soon" notes, both lines intact. DemoPage section, no version bump.
- **`d8d3b1a` · 2026-06-12** — Draft 29: Meet-the-cast Sam 16 card swaps the seven ElevenLabs audio scratch clips for the first rendered **Sam's Story** shot (vertical 9:16 YouTube Short `q7QwX79vtEA`, the bedroom opening-narration beat). `src/lib/castData.js` Sam 16 entry's `lines` array → a `video: { youtubeId, caption }` object; top-of-file comment now documents the three card shapes (video / lines / description). `src/pages/DemoPage.jsx` CastCard gains a `video` branch (precedence video > lines > description) rendering the Short in a 320px-capped 9:16 player + italic caption, in the slot the lines block occupied. Other cast cards unchanged; the seven `sam-16-line-*.mp3` files left in `/public/cast/audio/` (unreferenced) per the draft. No version bump (DemoPage section). Verified via preview: Sam 16 card shows photo + embedded Short + caption, zero audio elements.

  <details>
  <summary>Draft 29 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 29 — Meet the cast: swap Sam 16's seven audio-line clips for the new Sam's Story opening-narration video

  The first per-shot Sam's Story video is rendered and uploaded — the Sam 16 bedroom narrator beat (Line 1, ~13 seconds, vertical 9:16). It supersedes the seven ElevenLabs audio scratch clips on the Sam 16 cast card, which were only ever a pre-animation stand-in for the team to hear voice direction. Now that we have an actual animated shot to show, drop the audio scratch and embed the video.

  **The video:** YouTube Short, ID `q7QwX79vtEA` — URL <https://www.youtube.com/shorts/q7QwX79vtEA>.

  #### Change 1 — `src/lib/castData.js`: reshape the Sam 16 card

  Remove the `lines: [ … ]` array from the Sam 16 entry (the seven scripted-line objects with `audio` / `scene` / `text`). Replace it with a single new `video` field.

  **Before (Sam 16 card):**

  ```js
  {
    id: 'sam-16',
    name: 'Sam (16 years old)',
    image: '/cast/images/sam-16.png',
    alt: 'Sam at 16 — the narrator, two years later',
    role: 'Our narrator — Sam two years later.',
    lines: [ /* seven scripted-line objects */ ],
  },
  ```

  **After:**

  ```js
  {
    id: 'sam-16',
    name: 'Sam (16 years old)',
    image: '/cast/images/sam-16.png',
    alt: 'Sam at 16 — the narrator, two years later',
    role: 'Our narrator — Sam two years later.',
    video: {
      youtubeId: 'q7QwX79vtEA',
      caption: 'Opening narration — the first scene of Sam\'s Story.',
    },
  },
  ```

  Use a `video` object (not just a string) so future scenes can be added by extending the same shape — `{ youtubeId, caption, recorded_at?, ... }` — and so other cast cards (Foster Mom, Sam 14, etc.) can pick up the same field later without a second refactor.

  **Update the file's top-of-file comment block** to drop the now-stale Sam 16 line-ordering note (the paragraph that explains the script-narrative-vs-recording-order ordering for `…-line-5/6/7`). That paragraph is meaningless once `lines` is gone from this card. Add a one-line replacement noting that Sam 16's card now previews the first rendered Sam's Story shot via YouTube Short.

  Other cast cards (Sam 14, Foster Mom, Foster Dad, Mrs. Johnson, Family Photo) — **no changes.** Sam 14 + Foster Mom keep their `lines` arrays; Foster Dad + Mrs. Johnson keep their `description` paragraphs. The card renderer needs to handle three card variants now: `video` (Sam 16), `lines` (Sam 14, Foster Mom), `description` (Foster Dad, Mrs. Johnson).

  #### Change 2 — `src/pages/DemoPage.jsx`: render the YouTube Short on cards with a `video` field

  In the Meet-the-cast section's per-card renderer, branch on which of the three optional fields the card has. Order of precedence: if `card.video`, render the YouTube embed (drop the `lines` and `description` branches for that card); else if `card.lines`, render the scripted-line block as today; else render the `card.description` paragraph as today.

  **YouTube Short embed pattern** (prior art: the removed Video section in commit `d64dbdb`, *"an embedded YouTube Short … in a 9:16 portrait player capped at 320px wide"*):

  ```jsx
  <div className="mx-auto w-full max-w-[320px]">
    <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
      <iframe
        src={`https://www.youtube.com/embed/${card.video.youtubeId}`}
        title={`${card.name} — Sam's Story video`}
        className="absolute inset-0 h-full w-full rounded-2xl border border-amber-200"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
    {card.video.caption && (
      <p className="mt-2 text-center text-sm text-slate-600 italic">
        {card.video.caption}
      </p>
    )}
  </div>
  ```

  Sits **below** the image + role line on the Sam 16 card — same vertical stacking the lines block currently uses (image on the left ~40% on desktop, role + lines block to the right; on mobile the image stacks above the lines block). The video lives in the same position the lines block does today — replacing it, not appended alongside.

  Use `aspectRatio: '9 / 16'` rather than the older padding-bottom percent trick — Tailwind's `aspect-[9/16]` class also works if cleaner.

  #### Change 3 — Asset cleanup (optional, leave files in place by default)

  The seven audio files at `/public/cast/audio/sam-16-line-*.mp3` are no longer referenced by `castData.js` after Change 1. Leave them in `/public/cast/audio/` for now — Josh may want them back if the next Sam's Story video iteration needs voice-direction refresh, and they're small enough that disk footprint isn't a concern. If a deliberate cleanup pass is wanted later, it's a separate commit (just `git rm /public/cast/audio/sam-16-line-*.mp3`).

  #### What does NOT change

  - The Meet-the-cast section heading, the Script 2.0 download link (Draft 24 Change 3), the Family Photo closer, and the surrounding /demo page structure all stay as today.
  - No `activityVersions.js` bump — Meet-the-cast is a DemoPage section, not an activity.
  - No `INFRASTRUCTURE.md` change-log entry needed (no schema or edge-function change).
  - No feedback-category change — the existing `video` feedback category (commit `1edd96f`) already covers feedback on this card.
  - The other cast cards' line / description handling is unchanged; the renderer just gains the `video` branch.

  #### Out of scope (queued for future drafts)

  - Embedding the next Sam's Story per-shot videos as they're rendered (Line 3 grimace beat, Line 7 transition beat, etc.). When those land, extend the same `video` field — possibly as `videos: [{ youtubeId, caption }, …]` if multiple shots per card need to be shown.
  - Female + Nonbinary Sam variants — separate future cards / variants.
  - Foster Mom / Foster Dad / Mrs. Johnson video shots — when their Character Builder locks are done and the relevant scenes are rendered, they'll pick up `video` the same way.

  **Approved by:** Josh, 2026-06-12 — after the Sam Line 1 video landed (per the Sam's Story per-shot video recipe section above) and was uploaded to YouTube.

  *End of Draft 29.*

  </details>

- **`f148028` · 2026-06-12** — Draft 28: Getting Unstuck **v5.5 → v5.6 (MINOR)**. Content-only swap of the "I need help" alternative thoughts to Stephanie's v2 source doc (`Alternative Thoughts list (1).docx`, 2026-06-12). Three string edits in `src/lib/appraisals.js`: **a5 Challenge #1** "There are people I can trust." → "There are people I can trust, even just a little bit, and trust can grow." (Holly's clinical edit — lowered entry bar + growth trajectory; Stephanie agreed); **a4 Both/And #2** em-dash → comma; **a5 Challenge #2** comma after "me" removed. Other 21 strings unchanged. Top-of-file comment updated to cite the v2 doc. No data-shape, UI, or export change. Verified via preview: a5 Challenge panel shows the new "even just a little bit, and trust can grow" text.

  <details>
  <summary>Draft 28 (verbatim, Claude Cowork → Claude Code)</summary>

  ### Draft 28 — Getting Unstuck "I need help" content: Holly's a5 trust edit + punctuation fixes from v2 source doc

  Follow-up to Draft 27 / commit `6f46da8`. Stephanie sent her Alternative Thoughts list to the team for review (2026-06-11). Holly proposed an addition to the **a5 ("I can't trust anyone")** Challenge alternative; Stephanie agreed. Josh also made a small typo edit. The v2 docx (`Alternative Thoughts list (1).docx`, uploaded 2026-06-12) is now the source of truth and supersedes the v1 content currently in `src/lib/appraisals.js`.

  This draft applies three changes, all in the `help_suggestions` content. No data-shape change, no UI change, no export-pipeline change — content-only swap.

  **File:** `src/lib/appraisals.js`.

  #### Change 1 — a5 Challenge #1 (the substantive clinical change)

  Holly added two phrases (tracked changes in the docx), Stephanie approved. The flat assertion becomes a starter-bar + growth-trajectory framing.

  - **From:** `'There are people I can trust.'`
  - **To:** `'There are people I can trust, even just a little bit, and trust can grow.'`

  This is the clinical lift: kids whose default schema is "trust is dangerous and total" can reject the flat version on its face but engage with the lowered entry bar (*"even just a little bit"*) + temporal hope (*"and trust can grow"*). Use Holly's text verbatim.

  #### Change 2 — a4 Both/And #2 (em-dash → comma)

  - **From:** `'I feel that no one would want me to be a part of their family AND that feeling might not be true — there may be people that want me to be a part of their family.'`
  - **To:** `'I feel that no one would want me to be a part of their family AND that feeling might not be true, there may be people that want me to be a part of their family.'`

  The em-dash was a Draft 27 transcription artifact; v2 doc uses a comma. Match the doc.

  #### Change 3 — a5 Challenge #2 (comma after "me" removed)

  - **From:** `"Other people have betrayed me, but that doesn't mean everyone will."`
  - **To:** `"Other people have betrayed me but that doesn't mean everyone will."`

  Same as Change 2 — v2 doc punctuation, match verbatim.

  #### What does NOT change

  The other 21 alternative-thought strings (a1 × 4, a2 × 4, a3 × 4, a4 Challenge × 2 + Both/And #1, a5 Both/And × 2, a6 × 4) are unchanged. The locked appraisal item text for a6 (*"My real family will be mad…"*) is unchanged — Stephanie's docx uses *"My family"* in the Stuck Thoughts column but the locked FollowUp Survey item keeps *"My real family"*; this is the same intentional divergence noted in Draft 27. The data shape, scale, scoring, export pipeline, and "I need help" panel UI are all unchanged.

  #### Version bump

  `getting-unstuck` v5.5 → **v5.6 (MINOR)**. Prepend changelog entry to `src/lib/activityVersions.js`: *"v5.6 — Updated 'I need help' alternative thoughts to v2 source doc (Holly's a5 Challenge edit "even just a little bit, and trust can grow" — Stephanie agreed — plus minor punctuation alignment on a4 Both/And and a5 Challenge)."* Update `updated` to today's date.

  Update the comment block at the top of `src/lib/appraisals.js` to note the v2 update — change the existing "Content is Stephanie's 'Alternative Thoughts' list, verbatim" sentence to reference the v2 doc (2026-06-12) with Holly's a5 edit.

  **Approved by:** Josh, 2026-06-12, after Holly + Stephanie agreed via email thread (2026-06-11).

  *End of Draft 28.*

  </details>

- **`6f46da8` · 2026-06-09** — Draft 27: Getting Unstuck **v5.4 → v5.5 (MINOR)**. Swapped the placeholder "I need help" alternative-thought content for Stephanie's real content (Alternative Thoughts list, 2026-06-09) and made the help panel **strategy-aware**. `help_suggestions` in `src/lib/appraisals.js` went from a flat array to a strategy-keyed object `{ challenge: [...], both_and: [...] }` — two alternatives per strategy per item, 24 total, verbatim from Stephanie (a6's alternatives say "My family" where the locked item reads "My real family" — intentional). `GettingUnstuck.jsx` help-panel read-path now resolves `help_suggestions[currentStrategy]` (defaults to challenge). Verified via preview on a1: Challenge panel shows the challenge alternatives (no "AND"), Both/And panel shows the both_and alternatives (all contain "AND"). No save-payload or export change.
- **`8a25a97` · 2026-06-08** — Draft 26 Part F follow-up: swapped the tree-progress demo to Claude Design's new locked **"ready-for-roots-tree"** icon set (delivered in `Safety Net Exercise.zip → ready-for-roots-tree/`). The new six-stage set is noticeably **denser/fuller** — roots grow in count *and* branchiness per stage (1→6→9→15→20→28 root paths, incl. sub-roots + stage-5 spread roots), the three-tone canopy widens sharply, and stage 5 gains more blossoms (14 clusters). Extracted the six SVGs into **`src/assets/tree/`** (now the in-repo locked references, + `NOTES.md`); pointed `scripts/extract-tree-stages.mjs` at that folder and regenerated **`src/lib/treeStages.js`**. `TreeProgress.jsx` unchanged — it's parametric/data-driven and renders the new geometry as-is (same structure: per-stage full redraws, baked trunk widths, `<g>` layer ids). Verified via preview: stage 5 = 50 paths (28 roots + 1 trunk + 7 branches + 14 leaves) + 14 blossoms (84 petals), matching the extract. Also updated the **Growing Your Roots preamble** to the new locked 3-line copy ("Ready for Roots. Yours start here." / "This little seed is your tree…" / "Watch what grows."); Stage 0 caption unchanged. No version bump (demo surface). The "new tree icons (Josh providing)" non-code todo is now struck through as delivered.
- **`80fa689` · 2026-06-08** — Draft 26: Round 4 feedback bundle, six activity refinements in one commit. **A. Self-Reflection v1.2 → v1.3:** dropped the false "we'll come back to it" closing line (Holly); added example thought/feeling placeholders on both prompts (Ginny) — inclusion "e.g., People like me" / "e.g., Happy", exclusion "e.g., Nobody likes me" / "e.g., I felt sad". **B. Letter v2.1 → v2.2:** two optional scaffolding prompts under the instruction ("What is one skill you would recommend?" / "What is one helpful thought you could share?"). **C. Belonging Skills Sort v3.0 → v3.1:** "!" on encouragement; saveable PNG snapshot of the three sorted buckets (downloadSvgElementAsPng, unsorted excluded); one-time "reconsider unsorted items?" Yes/No prompt after first Save. **D. Allies / Safety Net v5.2 → v5.3** (the draft said "v5.1 → v5.2" but Draft 23 had already shipped v5.2, so this lands as v5.3): "!" on the ready line; percentage labels on every support-type heading (transition screens, selection question, TrampolineNet pills via new `percentByType` prop, ally-list headers) computed as allies-in-type ÷ total distinct allies; visual demotion of the full net (60% opacity + "small net is a place to start" caption) when total allies ≤ 2. **E. Getting Unstuck v5.3 → v5.4 (MAJOR) + FollowUp v1.0 → v1.1 (coupled):** shared appraisals truth-rating scale shifted **0-5 → 0-4** (anchors 0 Not At All / 2 Somewhat / 4 Definitely) in `src/lib/appraisals.js`, cascading to both the intervention and the survey; Pick threshold stays ≥2 (now exactly the middle anchor); new "I need help" button per thought opening a panel of alternative-thought suggestions (PLACEHOLDER content — Stephanie producing real lists; tap to pre-fill the response). exportFlatten value-range comments + demoDataset truth_rating regen updated (0..4). **F. Growing Your Roots:** preamble before Stage 0 ("Every time you complete an activity, your tree and roots will grow. Let's see how big it gets.") + revised Stage 0 caption ("Here's your tree." / "Right now it's a seed…"). Verified via preview: GU renders 5 scale buttons (0-4) with correct anchors; "I need help" panel works. **Out of scope (tracked in the non-code todos section):** new tree-progress icons (Josh), Stephanie's real "I need help" content, ElevenLabs voice work, female/nonbinary Sam assets, 9:16 video direction.
- **`edc439a` · 2026-06-04** — Draft 25: tree-progress preview. New parametric **`<TreeProgress />`** component (`src/components/TreeProgress.jsx`) rendering the "Ready for Roots" growth metaphor across six stages (Seed → Blooming) + a new **"Growing your roots"** click-through section on `/demo` (between Meet the cast and Data export) with stage dots, Previous/Next/Reset controls, and per-stage encouragement copy (Part C). Geometry is **machine-extracted** from Claude Design's six locked reference SVGs (`Activity ideas/tree-stage-*.svg`) via `scripts/extract-tree-stages.mjs` → `src/lib/treeStages.js`, so the component matches the references exactly rather than shipping them (same "rebuild parametrically" approach as the trampoline net). The references are per-stage full redraws (the whole tree scales each stage), so the component swaps the complete element set per stage. Forward stage changes animate growth-in (roots + branches draw on via `stroke-dashoffset` with `pathLength=1`; trunk/leaves/blossoms fade, staggered ~700ms); backward/jumps snap instantly; `prefers-reduced-motion` disables it. Verified against the references via DOM inspection — stage 5 = 13 roots, 6 branches, 14 leaves, 10 blossoms (60 petals). **Preview-only:** not wired into real activity completion or per-PID persistence (deferred until the activities are stitched into a continuous flow). No activity-version bump; INFRASTRUCTURE.md updated.
- **`41693ec` · 2026-06-04** — Draft 24: Meet the cast fixes + /demo polish. **(1)** Card order swapped so **Sam 16 (narrator) leads, then Sam 14** — matches how Holly's script opens. **(2)** Swapped the two Sam 14 audio files (their contents were mislabeled in Draft 22's asset prep): `sam-14-line-1.mp3` is now the inner-monologue line, `-line-2` the angry line — card-data mapping was already correct, only the underlying files were crossed. **(3)** Added a **"Download Script 2.0 (.docx)"** link under the Meet-the-cast heading (`/public/cast/script/ready-for-roots-script-v2.docx`, served with a clean `download` filename). **(4)** Removed the "individual plan" preview paragraph from the Activities section. **(5)** Page title → *"Ready for Roots — Activities Testing, Videos and Data Export Demo"*: updated the visible `<h1>`, set a matching `/demo`-only browser-tab title via `useEffect` (restored on unmount so other routes keep the default), and de-staled `index.html`'s app-wide `<title>` from the pre-rename *"Ready! Set! Dedicate!"* to *"Ready for Roots"* (a Draft 14 rename miss). No activity-version bump.
- **`ef557b0` · 2026-06-04** — Draft 23: Allies / Safety Net v5.1 → **v5.2 (MINOR)**. Each Strengthen screen now shows the kid which allies they already selected for that support type (post-Inspect, so removed allies are excluded) as a read-only refresher line above the "Is there anyone else…" prompt — singular/plural-aware, Oxford-comma list (`formatNameList` helper), skipped entirely when none. The `{type}` word keeps the per-type color. Helps the kid generate a genuinely new addition rather than restating someone already named. Display-only — reads from the existing `allies` array; no flow, data-shape, or export change.
- **`de7aa3e` · 2026-06-03** — Draft 22: replaced the /demo **Video** section (commit `d64dbdb`) with a new **"Meet the cast"** section previewing Holly's Script 2.0 before animation. Five character cards — **Sam (14)**, **Sam (16)**, **Foster Mom**, **Foster Dad**, **Mrs. Johnson** — plus a borderless **Family Photo** closer. Each card: image (left ~40% on desktop, stacked on mobile) + role line + either a list of scripted lines (scene cue + quoted text + native `<audio>` ElevenLabs sample per line) or a single description paragraph for the two characters who don't speak in Script 2.0 yet (Foster Dad, Mrs. Johnson). Sam-16's seven lines render in script-narrative order (1→2→3→4→6→7→5), not recording order — audio filenames keep their recorded numbers. Section sits between Tests and Data export. New `src/lib/castData.js` holds all card content (verbatim line text from `Character_Profiles.docx`); 16 assets (6 images + 10 mp3s) copied into `/public/cast/{images,audio}/` and served statically (not Vite-imported — large media). Removed the old Sam concept-art assets (`src/assets/demo/sam-boy-16*.png`) + their imports and the YouTube animation-sample embed (`A8vVBE_2dNI`). Kept the `video` feedback category (commit `1edd96f`) — now applies to cast/voice feedback. No activity-version bump (DemoPage section, not an activity); INFRASTRUCTURE.md change log updated. Out of scope: audio for Foster Dad + Mrs. Johnson (drop mp3s + a `lines` array into castData later and the cards extend the same way).
- **`0015acd` · 2026-06-01** — Draft 20: 2026-06-01 meeting bundle, three activities in one commit. **Getting Unstuck v5.2 → v5.3 (MINOR):** (1) Pick threshold reverted ≥3 → **≥2** (FINAL per meeting — third 3↔2 flip; full history now pinned in the `ELIGIBILITY_THRESHOLD` comment). (2) New `cycle_affirmation` phase — brief randomized "Nice work / Good job / …" + "Let's try the next one" beat between consecutive picked thoughts (Ginny's encouragement ask). Also surfaced a Challenge-vs-Both/And strategy explainer (video placeholder + text) on the affirmation path so kids who pick nothing still learn the strategies. No data-shape change. **Allies / Safety Net v5.0 → v5.1 (MINOR-ish):** Strengthen now runs for **all three support types** (was gap-only); removed the same-kid suggestion chips (Ginny's stress test: they re-suggested foster mom/dad everywhere and the net never expanded); copy reframed to neutral "Is there anyone else who could give you {type} support?"; typed-in names stay in the action callouts only, NOT added to the net visual (Stephanie's "isn't really in the net until we call him" framing). Data: `strengthened.{type}` always populated (no nulls); `gap_filler` → `additional_person`. exportFlatten drops `_strengthen_gaps_count`, adds `_strengthen_added_count` (0-3), renames `_filler` cols → `_person`. demoDataset regenerated (~50% fill per type). **Who I Am Poem v2.3 → v2.4 (MINOR):** removed visible line numbers + the "Line N — same as line 1" caption on the mirrored lines 6/10 (Ginny: confusing); they render silently now. No data-shape change. **Out of scope / still queued:** Draft 21 (tree-roots progress visual) — spec + assets only, integration deferred until activities are stitched into a continuous flow; left active in the Ideas section.
- **`1edd96f` · 2026-05-19** — Added a **Video / animation** category to the feedback form so reviewers can tag feedback about the new Video section. Touched all three validation layers: DB `feedback_category_check` CHECK constraint (migration `feedback_add_video_category`), the `submit-feedback` edge function allow-list (now v4), and the frontend (`FeedbackButton` dropdown + `AdminFeedbackPage` label/filter). Additive enum value — no data migration, existing rows unaffected.
- **`d64dbdb` · 2026-05-19** — Added a **Video** section to `/demo` (under the Data export demo) for team review of animation direction. Two cards: **Sam (boy version, age 16)** showing three character concept-art images (`backstage.png`, `Sam 2.png`, `Sam 3.png` from the repo-root `Video Content/` folder, copied into `src/assets/demo/` as `sam-boy-16{,-2,-3}.png` and imported as build assets) in a responsive 2-col grid; and **Animation sample**, an embedded YouTube Short (`A8vVBE_2dNI`) in a 9:16 portrait player capped at 320px wide. Demo-page-only, no activity version bump.
- **`7a7d547` · 2026-05-19** — Draft 19: Allies / Safety Net v4.1 → **v5.0** (MAJOR) + Getting Unstuck v5.1 → **v5.2** (MINOR), shipped as one commit. **Allies v5.0** is a substantial restructure driven by Stephanie's 2026-05-18 transcript spec, Holly's color-coding ask, and the new 22-tile icon set Josh delivered 2026-05-19. **(1)** 22-tile icon set replaces v4.x's 15 — foster/bio/grandparent each split into mom+dad / mother+father pairs, friend split to friend + best-friend + friends (group), boyfriend + girlfriend added, sneaky-link deliberately not registered per Josh's 2026-05-19 call. SVGs stripped of background `<rect>` per the existing pattern. **(2)** Color-coded support types per Holly: Practical = amber, Emotional = rose, Social = sky. Colors appear on the type word in each screen heading, the per-type tile background tint on selection grids, and the full background of the new transition screens. **(3)** Brief transition screens between Practical → Emotional → Social selection, resolving Ginny's "kind of looked similar" feedback. **(4)** Inspect (Part 2) restructured per Stephanie: educational screen with a video placeholder (Adrian to record actual content — placeholder is a styled 16:9 div with "Video coming soon" caption, no player UI) + the four red-flag bullets verbatim from her PPT → single X-out-on-net screen where the kid taps × on any ally to take them out (visual: ally fades to ~30% opacity, big red X overlays; tap × again to restore). The per-ally modal walkthrough with the 4 Yes/No questions is gone. **(5)** Strengthen (Part 3) rebuilt from scratch (last torn down in commit `d515d0e`): per-type gap detection on post-removal counts (0 or 1 ally = gap); per-gap screen with same-kid ally chips as suggestion shortcuts ("Anyone here also fit?" — taps pre-fill the gap_filler), "Who could that be?" filler input, "What's one thing you could do?" action textarea, and a Skip option. Number of Strengthen screens is dynamic (0–3) based on the kid's specific gap pattern. **(6)** Final Review screen shows the net post-removal, kept-allies list, Strengthen commitments rendered as per-type callouts, and the existing Save-as-image button (commit `92bfff9` retained). **Save payload reshaped (BREAKING, demo-only):** per-ally `inspected` / `flags` / `kept_in_net` replaced with a top-level `removed_via_inspect: [ally_id, ...]` array; new top-level `strengthened: { practical|emotional|social: {gap_filler, action, skipped} | null }`. **exportFlatten:** dropped `safety_net_total_flags` + the 4 `_flag_*_yes` columns; kept `_inspected_count` (now pre-removal total) / `_kept_count` / `_removed_count` / `_inspection_completed`; added `_strengthen_{type}_filler` / `_action` / `_skipped` per support type + `_strengthen_gaps_count`. **demoDataset:** regenerated for the new shape — ~30% of synthetic participants remove ≥1 ally during Inspect; Strengthen gaps follow naturally from post-removal counts; of those with a gap, ~70% fill in and ~30% skip; small string pools drive synthetic gap_filler / action values. **TrampolineNet:** new `inspectMode` prop + `onAllyToggleRemoved` callback drives the × overlay + 30%-opacity-with-X-overlay state on the new X-out screen; the v4 walkthrough rendering paths (highlighted ally + inspected checkmark) stay intact for backward compatibility. **Getting Unstuck v5.2** (the second half of Draft 19): one-line Pick-screen prompt edit per Holly's 2026-05-18 transcript — replaced "Which of these thoughts… Pick one or two." with "Pick the top two thoughts you would like to work on." so the max-2 guidance lives in the prompt itself rather than as a footnote. No flow / data / threshold changes — just the wording on the Pick screen heading. Bumps: allies-safety-net v4.1 → v5.0 (MAJOR), getting-unstuck v5.1 → v5.2 (MINOR).
- **`f705a41` · 2026-05-19** — Draft 18: /demo polish. **(1)** Removed the "Three things you can do here" intro paragraph and its three sub-paragraphs from `src/pages/DemoPage.jsx`; the section headers (Activities, Tests, Data export) are self-explanatory. **(2)** Hid the saved-output JSON panel from the participant-facing confirmation screens on Pretest, Posttest, and FollowUp (same call as commit `583d34c` made for `/demo/sandbox/*` activities). Dropped the *"The whole payload is visible in the saved-output panel below."* line and the JSON `<pre>` panel itself from the done-state and the pre-submit confirmation screens. Kept the simple "Thanks — your responses are saved." acknowledgment. `/admin/testing/*` surfaces untouched. **(3)** Flipped the persistent **Give feedback** button's submitter default from `"anonymous"` to `"ginny"` in `src/components/FeedbackButton.jsx` (initial useState + reset()). Anonymous stays as a selectable option for testers who want to submit without attribution. No activity version bumps — all three are demo-page polish, not activity-data-shape changes.
- **`6900549` · 2026-05-19** — Draft 17: Getting Unstuck v5.1. Single-line revert of the Pick-screen eligibility threshold from `truth_rating ≥ 2` (set in Draft 15) back to `≥ 3` (the original v3.0/v4.0 threshold). Josh's clinical-content call overrides Stephanie's 2026-05-15 lowering — items rated below "Somewhat True" (3) on the 0-5 anchor scale aren't endorsed strongly enough to be worth the Pick / Challenge / Both-and flow. Affirmation path hit more often as a result; intended behavior. Constant flip in `src/activities/GettingUnstuck.jsx` (`ELIGIBILITY_THRESHOLD = 3`) plus header-comment + Other-screen-note updates so the docstring matches reality. No data-shape change, no flow change. v5.0 → v5.1 (MINOR).
- **`4d5ec6a` · 2026-05-13** — Draft 16: Posttest + FollowUp paginated sandbox activities built from the locked Final Measures docs. New `src/components/survey/SurveyItems.jsx` extracts the shared item renderers (LikertItem / SliderItem / NumberInput / RadioGroup / CheckboxGroup / ScaleScreen / ProgressStrip) so all three timepoint surveys render visually identically; Pretest left as-is for now to avoid churn. **Posttest.jsx (v1.0, 18 items, 9 screens):** BHS / ASCS / NB / Belonging Worries (with skip-Q2-on-Q1=0) / Perceived Helpfulness (past-tense pe_1) / Program Feedback Acceptability (NEW: 3 Likert + 2 open-response, optional, 2000-char cap). Save flat-keyed `post_*`. **FollowUp.jsx (v1.0, 30 items, 11 screens):** BHS / ASCS / UCLA / NB / BPB / **Appraisals (imported from `src/lib/appraisals.js`)** so survey items match the Getting Unstuck v5.0 intervention exactly / Belonging Worries / Permanency (NEW: radio + Other-text reveal) / Disruption Worry (NEW: 0-4 Likert). Save flat-keyed `fu_*`. Wiring: both registered in `TEST_REGISTRY` under `'Ready for Roots test'` category; activityVersions entries at v1.0; DemoPage Tests intro updated; `program_feedback: 'pf'` added to `SCALE_ABBREVIATIONS`. demoDataset NOT extended — the synthetic 52-participant dataset walks the snapshot's item structure, not these sandbox-only activities; when these scales make it into a real snapshot, demoDataset's existing logic picks them up automatically.
- **`27e4d52` · 2026-05-13** — Draft 15: Getting Unstuck v5.0 — structural rebuild. 8 RSD-specific stuck thoughts → 6 locked Appraisal items shared with the FollowUp Survey (new `src/lib/appraisals.js` single-source-of-truth). Dropped "how often" rating dimension; only "how true" remains on a 0-5 scale with Not At All / Somewhat / Definitely True anchors. Pick eligibility threshold lowered from ≥3 to ≥2 (Stephanie: kids who rated above 1 weren't being pulled forward). New "Other thought" screen between Rate and Pick — Yes/No, optional free text + same 0-5 rating, eligible for Pick if rated ≥2. Fight → Challenge naming **finalized after three flips** (Josh's 2026-05-18 call is final): button "Challenge it", data key `strategy: "challenge"`, response field renamed to `response`. Jessica's 2026-05-18 copy edit applied ("those questions?"). Save payload reshaped to `appraisals: { a1..a6 [+a_other]: { truth_rating, selected, strategy?, response?, and_statement?, text? } }`. exportFlatten emits `unstuck_truth_a*`, `_selected_a*`, `_strategy_a*`, `_response_a*` + the same set for `a_other` + `unstuck_other_text` + rollups. demoDataset regenerated. v4.0 → v5.0 (MAJOR, breaking data shape).
- **`0852261` · 2026-05-13** — Draft 14: renamed intervention "Ready! Set! Dedicate!" / "RSD" → **"Ready for Roots"** in all user-facing text. Internal code slugs (`ready-set-dedicate`), access-code prefix (`RSD-XXXX-XXXX`), and `RSD_*` filenames are unchanged — internal artifacts. Touched: DemoPage hero + body copy, AdminExports demo-tab strings, `testRegistry` categories (`'RSD activity'` → `'Ready for Roots activity'`, `'RSD test'` → `'Ready for Roots test'`) with DemoPage filter calls matching, plus repo-root docs (README, INFRASTRUCTURE, STATE_OF_THE_PLATFORM, SSI_Platform_Overview, RSD_Completion_GiftCard_Flow). The `.docx` parallels of the overview + gift-card-flow docs need a manual rename pass — flagged in INFRASTRUCTURE.md change log. No activity-version bumps, no code-logic changes, no data-shape changes.
- **`88c3358` · 2026-05-13** — Draft 12: Belonging Skills Sort v3.0 — five converging pieces of feedback from the 2026-05-18 review meeting shipped as one rebuild. **(1)** Two CSS drop-zones → three illustrated trapezoidal bucket SVGs (shared `BucketSvg` component, amber-300/500). **(2)** New "Not interested right now" bucket — equal styling on purpose (Stephanie's call: don't desaturate, the whole point is to legitimize "not for me" as a valid answer). **(3)** Placement rebuilt as real pointer-event drag with a ghost-chip follower (Holly: "see the text moving") — offsets above the finger on touch, settles into bucket with a 240ms ease-out transition + bucket pulse on drop, springs back to origin on drop outside any bucket. Uses pointer events not @dnd-kit so it works uniformly on mouse/touch/pen. **(4)** Placed cards have a small × remove button that returns to unplaced (Jessica). **(5)** Full keyboard + screen-reader path: Tab/arrow nav, Space picks up, arrow keys cycle buckets, Space drops, Escape cancels; aria-live status region announces transitions. Save payload reshaped: now has `not_interested` array; `unplaced` stays in payload so analysts can distinguish "kid skipped" from "kid actively chose Not Interested." `exportFlatten.js` gains `sort_not_interested` + `sort_n_not_interested`. `demoDataset.js` distribution 25/25/15/35. v2.0 → v3.0 (MAJOR).
- **`b571464` · 2026-05-13** — Draft 13: small-copy bundle from the 2026-05-18 review meeting, shipped as one stopping point. **LetterBuilder v2.0 → v2.1 (MINOR)**: replaced the context line above the textarea per Stephanie (2026-05-15) — was "Write a letter to another teen who is starting where you are now…", now "What you would want to say to another teen who feels like they don't belong." Anchors the recipient in the same emotional state the kid is being asked to write to; direct second-person framing in the kid's voice. **WhoIAmPoem v2.2 → v2.3 (MINOR)**: auto-titled the finished-poem card and keepsake-image PNG "Who I Am" (replacing "Your Poem"), both surfaces updated. No data-shape changes on either.
- **`78a67cd` · 2026-05-12** — /demo Data export demo restructured: three numbered per-file blocks (Wide CSV / `.sps` syntax / Codebook CSV) instead of one long paragraph + button row. The `.sps` block now has its own amber "How to use it in SPSS" panel with a 3-step numbered list — save next to the CSV → open in SPSS → Run → All — plus a smaller italic fallback note about setting the working directory or editing the `/FILE=` path. Dropped the "Note: Qualtrics offers a native .sav…" paragraph per Josh. New `ExportFileBlock` helper at the bottom of `DemoPage.jsx` keeps the three files rendering consistently.
- **`71a37e9` · 2026-05-12** — Allies / Safety Net v4.1 (Draft 11): reverted the four inspect-modal questions to Stephanie's PPT Slide 4 originals — Q1 "usually get you into trouble" (was "sometimes get you in trouble"), Q2 "talking to or getting close to other people" (was the longer "spending time with other people who care about you"), Q4 "Do you feel afraid of {name}?" with the kid-perspective phrasing (was ally-active). Q3 unchanged. My v3.0 rewording was a judgment call about kid-friendly phrasing for content Stephanie wrote, not driven by team feedback; Josh decided to restore PPT phrasing as written. Flag keys + answer scheme unchanged — no data-shape change. Added a comment above `INSPECT_QUESTIONS` noting these are verbatim from the PPT.
- **`c02a379` · 2026-05-12** — Getting Unstuck v4.0: reverted v2.0's "Fight it" → "Challenge it" rename. Strategy button label back to "Fight it", data key back to `fight`, response field back to `fight_response`, export column back to `unstuck_n_fight` (allowed values `fight | both_and`), demoDataset synthetic data regenerates with `strategy: 'fight'`. Stephanie's clinical-content rationale ("more clinically standard") was overridden by Josh; the original RSD framing is restored. Rate/pick split + max-2 selection + affirmation path from v3.0 all stay. MAJOR bump because of the data-shape change; no real participant data exists yet so no migration concerns.
- **`6c4dfd2` · 2026-05-12** — Follow-up to v4.0: ally icons were bleeding across wedge color boundaries on the bigger desktop net. Fix is geometric — bumped placement radii from 72/112 to 95/125 (icons at larger r subtend less angular space) and replaced the fixed 6° inset with `asin(haloRadius / innerRadius) + 2°` so the inset auto-scales to the icon size at the inner placement ring. No version bump; this is a placement fix to v4.0, not a flow change.
- **`583d34c` · 2026-05-12** — Allies / Safety Net v4.0 — five coupled changes. **(1)** Desktop-bigger TrampolineNet: SVG now fills 100% of its container with the `size` prop demoted to an optional CSS max-width; every render site wraps in `mx-auto w-full max-w-[420px] md:max-w-[700px]` so phones stay compact and desktops use the available real estate. **(2)** "Show me a list of my allies instead" toggle below every net render — new `NetWithListToggle` helper + new `AllyList` sub-component (grouped by support type, with kept/removed indicators on post-inspect contexts). Inline-expand, not replace. **(3)** Inspect flow restructured into a linear walkthrough — net stays as non-interactive backdrop with the current ally highlighted via new `highlightedAllyId` prop; inspect modal auto-opens for each ally and auto-advances on Keep/Remove. Back nav works within modals (previous ally with answers preserved). X-close mid-walkthrough drops to a fallback view with "Resume inspecting" + "Skip the rest" buttons. "Done inspecting" button removed. **(4)** Visual refresh to match the new cleaner reference SVG — dropped 24 radial cord lines, 4 concentric ring guides, thick wedge dividers, and the dot circles inside the woven patterns. Proportional wedge sizing by ally count is RETAINED. **(5)** Unrelated: hid the "Saved Output" JSON panel from `/demo/sandbox/*` (reviewers find it distracting); the admin-side `/admin/testing/*` panel is untouched. Save payload UNCHANGED, just the version string bumps to "4.0".
- **`9b841da` · 2026-05-12** — Draft 10: three small-to-medium revisions to activities that shipped yesterday, bundled as one commit. **Self-Reflection v1.2 (revert):** exclusion prompt reverted to its pre-Draft-1 wording — the v1.1 agentive reframe didn't clear Ginny's UX review; Holly's proposal is moved to team-level design discussion. **Who I Am Poem v2.2 (content removal):** removed the worked example block above the input form — feedback was that the example was nudging kids toward mimicry. **Getting Unstuck v3.0 (MAJOR, structural flow change):** rating and selection are now separate screens. Rate screen shows the 8 scales only (no inline "I want to work on this" buttons). New Pick screen filters to eligible thoughts (≥3 on either scale) as selectable cards with a max-2 limit (non-blocking "Pick up to 2" nudge on a third tap). New affirmation path skips Pick entirely when no thoughts clear the threshold and leads straight to Save. Phase state moved from numeric `step` to named phases (`rate` / `pick` / `strategy` / `review` / `affirmation`) for clarity. Save payload UNCHANGED — only the path to becoming selected changed; export pipeline and demoDataset don't need updates.
- **`92bfff9` · 2026-05-12** — Participant-facing "Save as image" downloads on the two activities that produce a visual artifact: Allies / Safety Net and Who I Am Poem. The other activities don't have an output by design and keep their simple confirmation copy (Josh confirmed on 2026-05-12). New `src/lib/imageDownload.js` exports `downloadSvgElementAsPng` (rasterizes a live SVG DOM node — used by the Safety Net post-save confirmation, which now shows the TrampolineNet visual + Save-as-image button) and `downloadSvgStringAsPng` (rasterizes a built-on-demand SVG string — used by Who I Am Poem to build an SVG keepsake at click time that matches the on-screen amber card with a "SSI Platform · date" footer). The utility inlines `<image href>` references as data URLs before rasterization to avoid canvas-tainting; renders at 2× for retina quality; cream-paper background fills any transparent areas. No new dependencies — html2canvas would have worked (transitive via jspdf) but our visuals are pure SVG. AlliesSafetyNet bumped to v3.1, WhoIAmPoem to v2.1 (both MINOR, no data-shape changes).
- **`70d117b` · 2026-05-11** — Draft 9 of the Safety Net build: TrampolineNet parametric visual + Step 2 (Inspect). Three coupled changes shipped together. **(1)** Stripped the cream background `<rect>` from all 15 ally SVGs in `src/assets/allies/` so they composite cleanly on the woven trampoline-net wedges. **(2)** New `src/components/TrampolineNet.jsx` — parametric React reimplementation of the Claude Design reference (`Activity ideas/trampoline-safety-net.svg`). Matches the rim styling, woven type patterns, 24 radial cord lines, 4 ring guides, label pills, and "YOU" hub. Wedge sizing is proportional with empty types collapsing to a labelled 15° sliver. Ally icons sit in cream halos with optional `showInspectedMarks` (green check) and `interactive` (tappable button) modes; removed allies render in a faded "Taken out of net" strip below the rim. **(3)** `AlliesSafetyNet` v3.0 — expanded from 5 to 8 screens. Step 1's placeholder grouped-by-type visual is replaced with the real TrampolineNet. Step 2 (Inspect) is a new 3-screen flow inside the same activity: intro → interactive net (tap any ally to inspect) → final net + Save. Per-ally inspect modal asks 4 clinical-safety questions (trouble / isolate / lies / afraid) with Yes/No/Not sure radios. Keep + Remove buttons stay equally weighted; subtle amber border on "yes" cards, no destructive red. Keep-with-yes triggers a keep-advisory modal; remove triggers a removal-acknowledgment modal. Save now fires at the end of Step 2 (not Step 1). Save payload extends v2.0 with `inspected`, `flags`, `kept_in_net` per ally and an activity-level `inspection_completed` flag. `exportFlatten.js` gains 9 new safety_net_* columns (inspected_count, kept_count, removed_count, total_flags, 4 per-flag rollups, inspection_completed). `demoDataset.js` produces synthetic inspection per brief: ~80% inspect all, ~15% partial, ~5% skip; ~20% have a "yes" flag; removal probability tuned higher for noisy allies.
- **`d515d0e` · 2026-05-11** — Draft 8 of the Safety Net Step 1 rebuild. Full rewrite of `src/activities/AlliesSafetyNet.jsx` to Variant C (per-support-type multi-select grid). 5 paginated screens: intro → Practical → Emotional → Social → placeholder Safety Net visual. 15 new SVG ally tiles in `src/assets/allies/` (data-om-id attributes stripped); new `src/lib/allyTiles.js` is single source of truth for tile registry + support-type definitions. Custom tiles (other1, other2) accept inline names that persist across all three type screens. Per-type "None of these" buttons capture affirmative "no one for this type" responses (meaningfully distinct from skipping). Save payload reshaped to `{ allies: [{id, name, custom, support_types}], none_for: {practical, emotional, social}, saved_at }`. Old 4-step flow (Build → Inspect → Strengthen → Review, ~580 LOC) torn down entirely; Steps 2–4 will be rebuilt later as Task #7 after team design discussion. Version bumped to v2.0 (MAJOR). `exportFlatten.js` safety_net_* columns reshaped accordingly (counts + none-flags + names/ids list); per-tile binary columns deferred pending Jessica's review. `demoDataset.js` produces the new shape with the distribution from the brief (70/20/10).
- **`6e0308c` · 2026-05-11** — Draft 6 follow-up: SPSS syntax (`.sps`) generator I missed in `0415172`. New `src/lib/spssSyntax.js` reads the same column registry that `exportFlatten.planWideColumns()` produces, so the Wide CSV and the `.sps` stay in sync from a single source of truth. Emits header comment + `GET DATA` + `VARIABLE LABELS` + `VALUE LABELS` (psychometric scales grouped by shared anchor set; BHS/ASCS/UCLA/NB/BPB hard-coded labels) + `VARIABLE LEVEL` (ordinal/scale/nominal grouping) + `FORMATS` + `SAVE OUTFILE` to `.sav`. SPSS variable-name validation up front (64-char max, must start with a letter, no SPSS reserved words like `ALL`/`AND`/`BY`/etc.) — throws on violation rather than emitting a malformed file. `/demo` Data export now offers three downloads: Wide CSV, `.sps` syntax, Codebook CSV; copy rewritten to explain the SPSS bundle approach (open the `.sps` in SPSS to get a labeled `.sav`) with a note that the Qualtrics-native-`.sav` route is parked as Task #11 Phase B. INFRASTRUCTURE.md change-log entry added.
- **`aa94130` · 2026-05-11** — Draft 7 of the data-and-pretest batch: Pretest paginated sandbox activity on /demo. New `src/activities/Pretest.jsx` renders the locked Belonging pretest (29 items: 6 demographics + 7 scales — Beck Hopelessness, Adolescent Sense of Control, UCLA, Need to Belong, Belonging Promoting Behaviors, Belonging Worries, Program Expectation) as a 10-screen paginated flow mirroring the live session. Save payload is FLAT and keyed by the SPSS column names from Draft 6, so participant submissions match the export CSV exactly with no recoding. Sliders require explicit drag/tap before counting as answered; Belonging Worries Q2 hidden when Q1 = 0 (saves `pre_bw_2` as null). Back button on every screen, progress strip up top. Wired in via the existing `TEST_REGISTRY` pattern under a new `RSD test` category; new "Tests" section on DemoPage between Activities and Data export demo. `activityVersions.js` gets `pretest` at v1.0.
- **`0415172` · 2026-05-11** — Draft 6 of the data-and-pretest batch: export column-naming refactor per Jessica's 2026-05-11 brief. New convention `<timepoint>_<scale_abbrev>_<item#>` (e.g. `pre_bhs_1`, `post_ascs_3`); score columns `<timepoint>_<scale_abbrev>_score`. Scale abbreviations mapped in `src/lib/exportFlatten.js` (`SCALE_ABBREVIATIONS`): bhs, ascs, ucla, nb, bpb, bw, pe, pa. The `appraisals_*` columns from the live snapshot — origin unclear, not in the locked pretest doc — mapped to `app` with a code comment flagging "confirm with Jessica/Stephanie." Custom-activity payload columns now use short prefixes (`unstuck_*`, `safety_net_*`, `sort_*`, `poem_*`, `letter_*`, `reflect_*`) via `ACTIVITY_PREFIXES`. GettingUnstuck v2 emits per-thought columns covering all 8 stuck thoughts (`unstuck_freq_st1`..`st8`, `_belief_`, `_selected_`, `_strategy_`, `_response_`); `n_fight` renamed to `n_challenge`. WhoIAmPoem v2 emits 8 keyed-field columns; LetterBuilder v2 emits a single `letter_text` column. `src/lib/demoDataset.js` updated to produce the new save shapes for the three rebuilt activities. /demo's Data export section drops Summary + Long buttons (remain on `/admin/data-export`); new short copy explains the convention. INFRASTRUCTURE.md change-log entry added. No activity-version bumps — pipeline change only.
- **`7b7046e` · 2026-05-11** — RSD activities: 2026-05-11 review-meeting batch. Five drafts shipped together as one stopping-point per Josh's batched-stopping-point workflow. **Draft 1 — Self-Reflection (v1.1, MINOR):** exclusion prompt reframed as agentive ("Now think of a time someone made you feel like you did not belong"). **Draft 2 — Who I Am Poem (v2.0, MAJOR):** rebuilt to Ginny's 10-line structure on a single screen with a worked example; George Ella Lyon attribution removed; save payload reshaped. **Draft 3 — Belonging Skills Sort (v2.0, MAJOR):** all 7 labels replaced with the locked pretest-doc items; tap-toggle "?" definition popovers added per Ginny/Stephanie/Holly; unplaced layout switched to vertical-stack to fit the longer sentence-style labels. **Draft 4 — Letter to Another Youth (v2.0, MAJOR):** collapsed 6-section structured letter to single free-write per Stephanie; removed word-bank chips, cross-activity pull-forward, and keepsake step. **Draft 5 — Getting Unstuck (v2.0, MAJOR):** replaced Kai-quote intro with per-thought 5-point appraisal scale (frequency + believability; eligibility ≥3 on either unlocks selection); restored Stephanie's three challenge prompts as scaffolding above a single response field; renamed "Fight it" → "Challenge it" throughout including data keys. Per-activity changelog in `src/lib/activityVersions.js`. Original batch prompt preserved verbatim below.

  <details>
  <summary>Original batch prompt (verbatim, Claude Cowork → Claude Code)</summary>

  ### Batch: easy-wins from the 2026-05-11 review meeting (Claude Cowork, 2026-05-11)

  Josh approved Ginny's batched-stopping-point workflow on 2026-05-11 — work through all five drafts below in order, ship them as a coherent set, and Josh will announce one stopping point to the team afterward so reviewers see a stable build rather than a moving target. Order is smallest-to-largest. All five touch demo-only state with no real participants, so data-shape breaks are acceptable.

  #### Draft 1 — Self-Reflection: sharpen "excluded" prompt wording

  Holly flagged in the 2026-05-11 feedback round that the current exclusion prompt — *"Now think of a time you felt excluded — a time you felt like you did not belong"* — reads as a state of being rather than an event done to the kid. Reframe to make the exclusion agentive.

  **File:** `src/activities/SelfReflection.jsx`

  **Change:** Find the exclusion prompt (the second half of the inclusion/exclusion pair) and replace it with:

  > Now think of a time someone made you feel like you did not belong.

  The inclusion prompt stays as-is. This is the only copy change.

  **Version bump:** MINOR. Prepend a one-line entry to this activity's `changelog` in `src/lib/activityVersions.js`, set `updated` to today's date.

  **Approved by:** Josh, 2026-05-11. Treated as a clinical-content tweak Sprang doesn't need to weigh in on at this scale.

  #### Draft 2 — Who I Am Poem: rebuild to Ginny's 10-line structure

  Ginny sent a revised poem structure (image: `Poem structure.png` in the repo root). She has final word on platform UX per Josh's call. This supersedes the meeting transcript's "one stanza only" framing.

  **File:** `src/activities/WhoIAmPoem.jsx`

  **Replace the current poem flow with this 10-line structure.** Kid fills in 8 input fields; lines 6 and 10 auto-display whatever they wrote for line 1.

  | Line | Prompt | Kid input |
  |------|--------|-----------|
  | 1 | I am | two special characteristics you have |
  | 2 | I am from | a place, people, or way of life |
  | 3 | I fear | something you are afraid of |
  | 4 | I suffer when | an event that makes you sad or angry |
  | 5 | I want | an actual desire |
  | 6 | I am | *(auto: same text as line 1)* |
  | 7 | I believe | something you believe in |
  | 8 | I dream | something you actually dream about |
  | 9 | I am going | where you hope to be |
  | 10 | I am | *(auto: same text as line 1)* |

  **Behavior:**
  - 8 inputs (lines 1, 2, 3, 4, 5, 7, 8, 9). Lines 6 and 10 are display-only and mirror line 1.
  - Single screen. No multi-page flow.
  - Before the input form, show a brief worked example of a finished poem (Holly: *"I think we might want an example of a finished product here before we ask them to do it"*). Write something simple in-voice — don't pull from a published poet, since that's exactly what Ginny asked us to stop doing. Two to three lines of a sample is enough; doesn't need to be all 10.

  **Copy changes:**
  - Remove the "George Ella Lyon" / "Lyons format" / "Two-stanza George-Ella-Lyons-style poem with keepsake card" attribution entirely. Ginny was explicit: *"Remove this label — this isn't the Lyons format."* If a credit is wanted, "Inspired by traditional 'I am' poems" is fine. No named-poet attribution.
  - Keep tone warm and kid-friendly.

  **Data shape:**
  Save payload preserves the 8 unique inputs:
  ```
  {
    characteristics: "...",  // line 1
    from: "...",             // line 2
    fear: "...",             // line 3
    suffer_when: "...",      // line 4
    want: "...",             // line 5
    believe: "...",          // line 7
    dream: "...",            // line 8
    going: "...",            // line 9
    saved_at: "..."
  }
  ```
  Lines 6 and 10 reconstruct from `characteristics` at render time.

  **Version bump:** MAJOR. Prepend changelog entry, update `updated`.

  **Source:** `Poem structure.png` in the repo root.

  #### Draft 3 — Belonging Skills Sort: kid-friendly labels + hover-define tooltips

  Stephanie + Holly + Ginny all converged on this. Stephanie: language needs to be more child-friendly. Holly: *"reducing belonging uncertainty and creating space for belonging aren't specific enough... I'm not even sure what that means behaviorally."* Ginny: *"we should define these if you hover over the skill as a reminder."*

  **Files:** `src/activities/BelongingSkillsSort.jsx` and any associated data file under `src/lib/` that defines the skill list (check both).

  **Replace the existing 7 skill labels (`bs1`–`bs7`) with the 7 Belonging Promoting Behaviors items from the locked pretest doc** (`Pretest Draft Belongingness_5.2.26.docx`, "Belonging Promoting Behaviors (7 items)" section, confirmed final by Josh 2026-05-11). In this order:

  1. **`bs1`** — Pay close attention when someone is talking to you (without checking your phone or getting distracted)
  2. **`bs2`** — Use words like "we," "us," or "our group" to make people feel included
  3. **`bs3`** — Say thank you or tell others when they do something you appreciate
  4. **`bs4`** — Help someone out when they need it
  5. **`bs5`** — Invite others to spend time with you
  6. **`bs6`** — Include others in conversations and activities (like watching a movie, going for a walk, or playing a game)
  7. **`bs7`** — Talk through a disagreement with someone until you find an answer that works for everyone

  **Add hover-define tooltips** — each skill shows a 1–2 sentence definition on hover (desktop) or tap (mobile). Draft definitions below; refine in voice as needed:

  1. Giving someone your full attention when they're speaking — eyes on them, no phone, no looking around.
  2. Saying things that signal everyone belongs in the group — "we" instead of "you guys," "our team" instead of "the group."
  3. Telling someone you noticed and appreciated what they did, instead of just thinking it.
  4. Offering help when you see someone needs it, without waiting to be asked.
  5. Reaching out to bring someone into your plans or your day, instead of waiting for them to ask.
  6. Making space for others in what you're already doing — looping them into the conversation, the game, the show.
  7. Staying with a disagreement until you find something that works for everyone, instead of walking away or giving up.

  **Implementation notes:**
  - Tooltip must be tap-accessible on mobile (use a small "?" affordance or tap-to-toggle, not hover-only).
  - Skill IDs `bs1`–`bs7` stay sequential; the *meaning* of each ID is changing, but that's fine — demo-only state, no real participants.
  - The three categories (`already_doing`, `willing_to_try`, `unplaced`) stay as-is.

  **Version bump:** MAJOR (label set is structurally changing and per-ID meaning shifts).

  #### Draft 4 — Letter to Another Youth: collapse to one-page free write

  Meeting + feedback consensus 2026-05-11. Stephanie: *"the letter has too many steps and would be confusing for a kid"* — and she fed back to herself that the multi-section format produced a letter that *"was meaningless"* because the kid was just borrowing other people's words. Holly reported a bug where click-to-add inserts text before the prompt sentence — that whole interaction becomes moot once we remove click-to-add.

  **File:** `src/activities/LetterBuilder.jsx`

  **Rebuild as a single-screen free-write activity** modeled on the gains-professional one-page pattern. Look for that pattern elsewhere in `src/activities/` for the visual reference — it's a one-textarea, write-whatever-you-want layout.

  **Required changes:**
  1. **Collapse all 6 sections into one.** A single textarea, free-form. Save on continue.
  2. **Remove every click-to-add prompt button.** Do not import phrases from other activities (Getting Unstuck, etc.). The letter should come entirely from the kid — Stephanie was explicit.
  3. **Add a short context line above the textarea** describing who the kid is writing to (Stephanie: *"Maybe need to give them a little more context for who they are writing to"*). Suggested copy:
     > Write a letter to another teen who is starting where you are now. What do you want them to know?
  4. **Optional small example** *outside* the textarea (greyed/italic) showing the kind of letter that's welcome. Keep it short — one sentence — and generic. Not a model letter to copy.

  **Data shape:**
  - Save payload becomes `{ letter: "<full text>", saved_at: "..." }`. Drop all the structured per-section fields. Breaking change to the saved schema; acceptable since demo-only.
  - **Remove cross-activity coupling.** Stephanie's comment *"They may not do a both/and statement from getting unstuck, so not sure what would show up here if they didn't"* implies Letter Builder currently reads Getting Unstuck output. Kill that dependency entirely — the letter is freestanding now.

  **Version bump:** MAJOR (structural change, feature removal, data shape change).

  #### Draft 5 — Getting Unstuck: appraisal scale + restored challenge prompts + "Challenge it" rename

  Three changes from Stephanie's feedback + the 2026-05-11 meeting.

  **File:** `src/activities/GettingUnstuck.jsx`

  **Change 1 — Replace the intro panel with a 5-point appraisal scale on the stuck-thoughts screen.**

  Ginny called out that the current intro is confusing: the Kai quote followed by *"tap any thoughts that feel true for you"* doesn't read coherently — she had to re-read multiple times to figure out what to do. Stephanie's fix: drop the standalone intro panel and put the 5-point appraisal scale directly on the stuck-thoughts selection screen.

  For each preset stuck thought, alongside the thought itself, ask:
  - **How often do you have this thought?** (5-point scale)
  - **How strongly do you believe this thought is true?** (5-point scale)

  Anchors for both scales: 1 = Never / Not at all, 2 = Rarely / A little, 3 = Sometimes / Somewhat, 4 = Often / Mostly, 5 = Always / Completely.

  Stephanie noted these *"may fit with the pretest appraisal questions"* — keep that compatibility in mind. The pretest doc as locked doesn't include this exact appraisal instrument (Beck Hopelessness, ASCS, UCLA, Need to Belong, BPB, Belonging sliders, Expectation slider are the locked scales). If a separate appraisal scale exists elsewhere in the planning materials, align anchors to that; otherwise the anchors above are the working values.

  The kid then explicitly selects which thoughts they want to work on (suggested: any thought rated ≥ 3 on either scale is eligible; the kid picks from the eligible set).

  Remove the standalone Kai-quote intro panel entirely. If a brief intro is still needed, fold it into the appraisal screen as a single header line — but don't restate the Kai context, it's confusing.

  **Change 2 — Restore the three challenge prompts.**

  Stephanie's PPT slide 12 lists three prompts for the challenge strategy. The current build appears to only show one. Restore all three, displayed together as scaffolding above a single open-ended response field (not three separate inputs):

  > - Is there another way I can think about this?
  > - Is this really true, or can I think of a way it isn't true?
  > - Is this thought helping me, and if not, what is a thought that might be more helpful?

  **Change 3 — Rename "Fight it" → "Challenge it" throughout.**

  Stephanie's request — more clinically standard. Every UI label, button, and saved-data key that says "fight" or "fight_it" becomes "challenge" or "challenge_it." The "both/and" strategy stays as-is.

  **Data shape:**
  - Appraisal scores (frequency, believability) saved per stuck thought. New fields on the activity payload.
  - Strategy key rename from `fight_it` to `challenge_it`. Demo-only, no migration needed.

  **Version bump:** MAJOR.

  **Open question (not blocking — build text for now):** Stephanie asked whether the strategy explanation should be audio/video rather than text. Build text; we can swap to video later without restructuring the form.

  *End of 2026-05-11 batch. After all five ship, Josh announces one stopping point to the team for batched review.*

  </details>

- **`2dfc310` · 2026-05-11** — Auth, third pass (and hopefully the real root cause). After signing in successfully, the dashboard hung on Loading and the "Reset session" button itself didn't respond to clicks. Root cause: supabase-js's `auth.lock` (navigator.locks-based) gets contested and hangs *every* subsequent authenticated call — both the `user_roles` SELECT in `fetchRole` (so AuthContext never flips `loading=false`) and `supabase.auth.signOut` (so the Reset button can't clean up). Three fixes: (a) `src/lib/supabase.js` passes a pass-through lock function to disable navigator.locks entirely — overkill for a single-user admin app; (b) `fetchRole` is now wrapped in a 4s timeout; (c) `resetAndReload` is now synchronous and bypasses `supabase.auth.signOut` entirely — it just removes `sb-*-auth-token` from localStorage and hard-reloads. The Reset button can never hang.
- **`761b827` · 2026-05-11** — Auth follow-up: the page-load race fix in `4e60c77` left the actual sign-in attempt unprotected. User reported the button still hangs on "Signing in…" on second+ visits in both Chrome and Edge. Root cause: supabase-js's `signInWithPassword` does its own best-effort cleanup of any existing session in localStorage before processing new credentials; when that cleanup hangs (revoke-call network blip, navigator.locks contention from a prior wedged session), the whole promise never resolves. New `src/lib/authReset.js` exports `clearAllAuthState()` + `withTimeout()` (extracted from AuthContext). `AdminLoginPage.handleSignIn` now calls `clearAllAuthState()` BEFORE `signInWithPassword`, and wraps the call in a 12s timeout so it can't hang silently — on timeout we re-clear state and surface a clear retry message.
- **`4e60c77` · 2026-05-11** — Auth bootstrap rewrite to actually fix the recurring "have to clear site data to log in" bug. Root cause: `AuthContext` was calling both `getSession()` and registering `onAuthStateChange` in the same tick, racing against each other (supabase-js fires `INITIAL_SESSION` synchronously on subscription). The two paths called `fetchRole + setLoading(false)` independently in non-deterministic order, occasionally wedging on `Loading…` forever. Fix follows the supabase-recommended pattern: use ONLY `onAuthStateChange` as source of truth, dedupe by `user_id` so `TOKEN_REFRESHED` doesn't re-flash loading, 5s watchdog forces clean logged-out state if no event arrives, and ProtectedRoute's loading screen now shows a "Reset session & sign in" button after 6s as an in-app escape hatch.
- **`f5a2662` · 2026-05-11** — Hotfix: `/admin/feedback` was crashing with a TDZ error (`Cannot access '_' before initialization`) because `downloadSpreadsheet` was declared above `filtered` while referencing it in its useCallback deps. Moved it below `filtered` + `counts`. Likely also resolves the "have to clear site data to log in" symptom — when the Feedback page crashed mid-render, React unmounted the whole tree, so any tab with `/admin/feedback` in history looked blank on reload.
- **`9c57519` · 2026-05-11** — Feedback system: activity versions + CSV download. New `src/lib/activityVersions.js` is the source of truth for sandbox-activity versions (all 6 RSD activities at v1.0); convention documented in `CLAUDE.md` (bump in the same commit as the activity change). `public.feedback.activity_version` column + edge fn v3 capture which version each comment is about. Version badge shown on the sandbox page (so testers see what they're poking at) and in the admin table + expanded detail. New "Download CSV" button on `/admin/feedback` exports the currently filtered rows as `feedback-<filter>-YYYY-MM-DD.csv` (12 columns including `activity_version`).
- **`c959174` · 2026-05-10** — Added `STATE_OF_THE_PLATFORM.md` — accurate live snapshot (Supabase tables + row counts + RLS, all 11 edge functions, migrations, recent commits, repo layout, Vercel/domain/email pipeline, Qualtrics integration, deferred work) framed for the CTAC-apps-consolidation decision (status quo vs shared Supabase vs single mega-app).
- **`cdbd78c` · 2026-05-08** — Added Stephanie to the feedback submitter roster (FeedbackButton dropdown + AdminFeedbackPage labels + `submit-feedback` edge function allow-list + `public.feedback.submitter` CHECK constraint).
- **`0287706` · 2026-05-08** — Feedback collection on the public demo. New `public.feedback` table (admin-only RLS) + `submit-feedback` edge function (anon, validates roster + category + message). Persistent **Give feedback** button in `DemoPageLayout` auto-fills "Where you are" from the route. Admin review at `/admin/feedback` (filter by status/category, expand row to triage status `new → acknowledged → addressed | declined` and edit `admin_notes` inline). New Feedback nav item in AdminLayout (admin-only). INFRASTRUCTURE.md change-log updated.

---

## ⬆ Ideas / drafts for the next Claude Code session (Claude Cowork → Claude Code)

> Drop polished prompts here for the next Claude Code session to pick up. When Josh starts a new session with Claude Code, he'll say "read WORKING_NOTES.md, the latest draft is at the bottom" and Claude Code will work from there. Drafts can also be rough — Claude Cowork can help refine them in place before handing off.

<!-- Add new drafts BELOW this line, newest at the bottom so Claude Code works through them in submission order. -->

<!-- Drafts 18 + 19 shipped 2026-05-19, Draft 20 shipped 2026-06-01 — archived (commented out). Draft 21 below is still active (spec/assets only, integration deferred). -->

<!--

### Draft 20 — 2026-06-01 meeting bundle (Getting Unstuck v5.3 + Allies v5.1 + Poem v2.4)

Bundle of three small-to-medium changes from the 2026-06-01 review meeting. Ship as one commit so the team sees one stopping point.

---

#### Part A — Getting Unstuck v5.2 → v5.3 (MINOR)

Two changes to Getting Unstuck. Ship together.

##### A.1 — Pick-screen threshold flip (≥3 → ≥2)

**Context:** This is the third flip on this single line. The chronology, so future-us doesn't get whiplash:

- Original (v3.0 / v4.0): `truth_rating ≥ 3` carries forward.
- Draft 15 / commit `27e4d52` (v5.0): lowered to `≥ 2` per Stephanie's *"higher than 1"* feedback.
- Draft 17 / commit `6900549` (v5.1): reverted to `≥ 3` — Josh's clinical-content call, items below "Somewhat True" not worth the kid's time.
- **Now (v5.3): back to `≥ 2`.** Different rationale this time: the 2026-06-01 meeting landed on the operational-anchor logic — on the 0-5 scale, **2 is exactly the "Somewhat True" anchor**, so a kid who endorses an item even slightly (≥2) is meaningfully endorsing it and should get the option to work on it. Stephanie raised the issue again ("It did not pull forward thoughts I rated at a 1"), the team agreed in the meeting, Josh's admin note confirms.

**This is the final landing.** If a future round opens it again, we should have a serious clinical conversation rather than another constant flip.

**File:** `src/activities/GettingUnstuck.jsx`.

**Change:** `ELIGIBILITY_THRESHOLD = 2` (was `3`). The header comment at the top of the file plus the Other-screen narrative note (which was updated in Draft 17 to match `≥3`) need re-updating to say `≥2 ("Somewhat True" or above)`.

**Affirmation-path behavior:** if no items clear the `≥2` threshold, the kid still hits the affirmation path (no Pick screen, brief positive message, Save). The transcript discussion added a subtlety: in this no-eligible-thoughts case, the kid should still see the **strategy-explanation video** for Challenge vs. Both/And — even though they don't have a specific thought to work on, the educational content is valuable. The video is currently a placeholder per Draft 19; just make sure it surfaces on the affirmation path too (or at the very least, the text scaffolding does).

**Data shape:** no change.

**Export pipeline:** no change.

##### A.2 — Affirmation screens between consecutive thought-work cycles

**Context:** Ginny flagged in the feedback form *"I feel like we need some encouragement — like good work, nice job, let's try another"*; the transcript confirms — *"after each time they challenge that they needed an affirmation."* When the kid picks two thoughts to work on (max-2 cap from Draft 19), they go through Challenge or Both/And on the first thought, then directly to the second. Currently there's no transition.

**Change:** After the kid completes a thought (saves a Challenge response or a Both/And statement), if they have another selected thought still to work on, show a brief affirmation screen before the next thought's strategy screen.

**Screen content:**

- Short heading from a small rotating pool — *"Nice work."* · *"Good job."* · *"You're doing this."* · *"Keep going."* (~4–6 options, randomized so a kid working through two thoughts doesn't see identical copy back-to-back).
- A one-line follow-up: *"Let's try the next one."*
- Continue button.

Keep it small — single screen, no inputs, ~3 seconds of read time. Don't over-formalize the affirmation; the goal is a soft "you did the work, here's a beat to breathe" rather than a celebration.

**No affirmation screen** after the final thought (the activity ends with the existing Save / Review flow).

**Implementation note:** the affirmation screen is purely visual — no data is saved. Don't add anything to the payload.

**Out of scope here:** the *kind* of richer encouragement Ginny gestured at ("more encouragement and affirmation") could be expanded later — visual celebration, a tree-roots growth tick (tied to Draft 21), confetti, etc. For now, just text.

##### A.3 — Version bump

`getting-unstuck` v5.2 → **v5.3 (MINOR)**. Prepend changelog entry: *"v5.3 — Pick-screen threshold reverted to ≥2 ('Somewhat True' anchor logic, final per 2026-06-01 meeting); added brief affirmation screen between consecutive thought-work cycles per Ginny's encouragement ask."* Update `updated`.

---

#### Part B — Allies / Safety Net v5.0 → v5.1 (MINOR-ish; behavior change, no breaking data-shape)

Two related changes to the Strengthen step, both from Ginny's stress-test (she selected foster mom/dad for every support type and ended up with only those two in her net) and the meeting discussion.

##### B.1 — Strengthen runs for all three support types, not just gaps

**Context (v5.0 spec, per Draft 19):** Strengthen step ran only for support types with 0 or 1 ally (gap detection).

**New behavior:** Strengthen step runs **for all three support types**, regardless of how many allies the kid has selected. Same screens, same inputs, same Skip option — just always three screens instead of 0–3.

The rationale (transcript): even a kid with five practical-support allies might think of someone else worth adding when prompted. The gap-only detection misses that. Prompting everyone normalizes the "let's expand" framing.

##### B.2 — Remove the "same-kid ally suggestion chips" from Strengthen

**Context (v5.0 spec):** each Strengthen screen showed quick-add chips with names of allies the kid had selected for OTHER support types, so they could re-use a name without retyping.

**Remove these.** Per Ginny's stress test (kid selects foster mom/dad for every type → strengthen suggests them again → kid clicks the chip → safety net stays small): the chips encourage re-using existing allies instead of expanding. Goal of the Strengthen step is expansion. Take the chips out entirely.

Replace with a clean text input. The kid types the name from scratch.

##### B.3 — Copy adjustments for the new behavior

The Strengthen-screen heading was *"Let's strengthen your {type} support"* with a sub-line that varied by gap size (0-ally vs 1-ally). Replace both sub-lines with a single neutral version:

> Is there anyone else who could give you **{type}** support? Adding more people can make your safety net stronger.

(Color the **{type}** word per the existing support-type color scheme from Draft 19.)

The two inputs and Skip button stay as v5.0 spec'd them.

##### B.4 — Final Review screen — no change to net visualization

Per the meeting discussion: typed-in names from Strengthen stay in the action callouts only; they do **not** get added to the net visualization. Stephanie's framing — *"Frank isn't really in the net until we call him and see"* — the net should reflect actual current connections, not aspirational ones. The action callout is where the aspiration lives.

##### B.5 — Data shape + export pipeline

The `strengthened` object stays the same shape but is now always populated for all three types (no more `null`). Field semantics shift slightly:

- `gap_filler` → consider renaming the field to `additional_person` to match the new framing (this isn't strictly about filling a gap anymore). Optional — keep `gap_filler` if churn isn't worth it; if renaming, update `exportFlatten.js` columns to match.
- `action` unchanged.
- `skipped: bool` unchanged.

Export pipeline:

- Drop `safety_net_strengthen_gaps_count` (no longer meaningful — every kid sees all three types).
- Add `safety_net_strengthen_added_count` — integer 0-3, count of types where the kid filled in an additional person (i.e., `additional_person` non-empty AND `skipped = false`).
- Keep `safety_net_strengthen_{type}_filler` / `_action` / `_skipped` columns (renamed if field renamed in B.5 above).

##### B.6 — Demo dataset

`demoDataset.js` regenerate `safety_net_*` synthetic data:

- Every synthetic participant now goes through all three Strengthen screens.
- ~50% fill in an additional person per type (skip rate ~50%).
- Free-text values pull from the same small string pool from Draft 19.

##### B.7 — Version bump

`allies-safety-net` v5.0 → **v5.1 (MINOR)**. Behavior change but no breaking data-shape change at the JSON level. Prepend changelog entry: *"v5.1 — Strengthen step now runs for all three support types (not just gaps); removed the same-kid suggestion chips per Ginny's 2026-06-01 stress test (chips encouraged re-using existing allies rather than expanding); copy reframed as 'who else' instead of gap-specific phrasing."* Update `updated`.

---

#### Part C — Who I Am Poem v2.3 → v2.4 (MINOR copy/UI cleanup)

**Context:** Ginny's feedback — *"I think having line 6 and line 10 written in like that might be confusing."* Josh's admin note: *"Take out the numbering and take out the Instructions visible on line 6 and 10."* Meeting confirmed.

**File:** `src/activities/WhoIAmPoem.jsx`.

**Two changes:**

1. **Remove the visible line numbers** (the small "1", "2", "3"… numbers next to each input/display line). The kid doesn't need to see them — the structure is implicit in the layout.

2. **Remove the "same as line 1" instruction text** currently visible next to lines 6 and 10. Those two lines auto-mirror line 1 silently; the kid doesn't need to be told. Just render lines 6 and 10 as the mirrored "I am ___" text without explanation.

The poem structure itself, the auto-mirroring logic, and the keepsake output are all unchanged.

**Version bump:** v2.3 → **v2.4 (MINOR)**. Prepend changelog: *"v2.4 — Removed visible line numbers and the 'same as line 1' instructional text from lines 6 and 10 per Ginny's 2026-06-01 feedback ('confusing')."*

---

**Approved by:** Josh, 2026-06-01.

**Out of scope for this draft:**

- Continue buttons at the end of standalone activities (Ginny flagged across multiple). Per the meeting transcript, this is an artifact of activities being standalone for testing; covered by the eventual flow-integration draft.
- Self-Reflection "feedback for nonsense input or feeling/thought mismatches" (Ginny's question). Hard NLP problem, no clear meeting decision; defer.
- Sam character art revisions (brighter backgrounds, happier baseline, more ethnically ambiguous, age-appropriate clothing progression). Josh's asset-generation workflow, not a code change.
- The tree-roots progress visual — separate spec in Draft 21.

*End of Draft 20.*

-->

---

### Draft 21 — Tree-roots progress visual: spec + assets + state model (integration deferred)

**Status:** Design + asset prep now, integration deferred until the standalone activities are stitched into a continuous flow. The team converged on this at the 2026-06-01 meeting — ties cleanly to the Ready for Roots metaphor, addresses the kids-research finding about wanting feedback and a sense of progress, and resolves the "I'm at a dead end" feeling Ginny flagged across multiple standalone activities.

**What this draft delivers:**

1. A spec'd visual: a tree with growth stages, where the visible state grows as the kid completes sections of the intervention.
2. An asset list so Josh (or an art workflow) can generate the SVG growth-stage frames now.
3. A state model so the data tracking is decided before integration time.
4. A spec for the "progress reveal" screen that flashes between sections.

**What this draft does NOT deliver yet:**

- The actual integration into the participant flow (deferred — activities are still standalone). When the activities are stitched together, a follow-up draft wires this in.

---

#### 1. Visual spec

A tree that visibly grows as the kid progresses. Five growth stages:

| Stage | Trigger | Visual |
|---|---|---|
| **0 — Seed** | Intervention start | A small seed or sprout, roots barely visible underground. |
| **1 — Sapling** | After Self-Reflection | Roots have spread a little. Small trunk emerges above ground. A leaf or two. |
| **2 — Young tree** | After Getting Unstuck | More extensive root system underground (visibly bigger). Several branches. A few leaves. |
| **3 — Established tree** | After Belonging Skills Sort | Full root system. Sturdy trunk. Branches with leaves. |
| **4 — Flourishing tree** | After Allies / Safety Net | Roots clearly anchored and spread wide. Full canopy. Leaves are full color. |
| **5 — Blooming** | After Letter to Another Youth + Who I Am Poem (final activity / completion) | Same tree, now with flowers / fruit. Roots wind clear across the bottom of the frame. |

**Art direction notes:**

- The roots are the visual focus, not the canopy. Reinforces the "Ready for Roots" name. Roots should be more prominent than they would be on a typical tree illustration — drawn proudly, visible below an implied ground line.
- Style: soft, warm, not overly literal. Should match the platform's amber/slate palette and the Sam character's art direction once that's locked. Defer final style to Josh's art workflow.
- Same composition / framing across all six stages so the growth is continuous (kid sees the same tree, just bigger). One canvas, layered.
- SVG so it scales cleanly across desktop and mobile.
- 16:9 aspect ratio recommended so it fills a phone screen comfortably in landscape and works as a hero on desktop.

**Asset deliverable from Josh's side (when art workflow is ready):** six SVG files named `tree-stage-0.svg` through `tree-stage-5.svg`, dropped into `src/assets/tree/` (new directory).

---

#### 2. State model

Track which stages the kid has completed.

**New top-level participant state field** (decide location at integration time — likely a `progress` table or a column on the existing participant record):

```js
progress: {
  current_stage: 0 | 1 | 2 | 3 | 4 | 5,
  completed_activities: ["self-reflection", "getting-unstuck", ...],
  stage_advanced_at: { "1": "2026-06-15T...", "2": "...", ... }
}
```

`current_stage` is the highest stage the kid has unlocked. `completed_activities` is the source-of-truth list of activity slugs the kid has finished (drives the stage calculation). `stage_advanced_at` is a timestamp log so we know when each stage advanced (useful for analytics later).

The mapping from completed-activities count to stage is deterministic per the table above; compute on read rather than storing redundantly. This means if the activity order ever changes, only one mapping function changes.

**Persistence:** stage state lives keyed by PID (per the pending PID-linking requirement section below). For demo-only testing, can be localStorage-backed initially with a TODO comment to move to Supabase at flow-integration time.

---

#### 3. Progress-reveal screen spec

When the kid completes an activity and the stage advances, show a dedicated full-screen "progress reveal":

**Screen layout:**

- Centered tree visual (the new stage's SVG, full size).
- Above the tree: a short heading from a small rotating pool — *"Look at your roots."* · *"Your roots are growing."* · *"Keep going — your roots are spreading."*
- Below the tree: a one-line context — *"You finished {activity name}."* (where `{activity name}` is the just-completed activity's display name).
- A Continue button below that.

**Behavior:**

- Auto-shows after the kid's existing per-activity Save / Review screen, before they're routed back to the flow.
- Plays a subtle one-time animation: roots / branches grow into their new positions from the previous stage's resting state. ~600ms ease-out. If reduced-motion preference is set in the user's OS, skip the animation and just show the final state.
- Kid taps Continue → next activity in the flow (or completion screen if this was the final activity).

**Where in the flow:** between every activity, at the moment of stage advance. If the kid completes multiple activities in one session, they see the progress reveal between each (the metaphor needs the repeated reinforcement).

**Mobile:** the tree fills most of the screen vertically; heading + caption + Continue stack below it. Same composition as desktop, just smaller.

---

#### 4. Integration scope (out of this draft, parked for later)

When the activities are stitched into a continuous flow (no draft for this yet — depends on the Qualtrics-link handoff and the broader Ready for Roots participant-flow rebuild), this draft's deliverables get wired in. That work is:

- A new `<TreeProgress />` component that renders the right stage based on completed_activities.
- A routing change so the post-Save handler on each activity routes through the progress-reveal screen before the next activity.
- Persistence of the progress state per PID in Supabase (new column or new table).
- Backfill for any in-flight demo participants (probably just clear demo state).

Parked for a follow-up draft once the activities are joined.

---

**Approved by:** Josh, 2026-06-01 — design + assets + state model now, integration when the flow lands.

**Out of scope:**

- Actual SVG art generation — Josh's art workflow handles this, drops the six stage files into `src/assets/tree/`.
- Flow integration — deferred to a follow-up draft when standalone activities are joined.
- Variant trees (different art for different kid demographics, etc.) — not requested, not needed for MVP.

*End of Draft 21.*

---

<!-- Draft 27 shipped 2026-06-09 — archived (commented out). -->

<!--

### Draft 27 — Getting Unstuck "I need help" alternative-thought content (Stephanie's content swap + strategy-aware help panel)

Follow-up to Draft 26 Part E.3. The Getting Unstuck "I need help" button was built in Draft 26 with placeholder alternative-thought content. Stephanie has now delivered the real content (per the Cleanup queue todo, 2026-06-09). This draft swaps the placeholders for real values **and** expands the data shape slightly because Stephanie's content is **strategy-aware** — she wrote distinct alternative thoughts for the **Challenge it** strategy versus the **Both/And** strategy.

The original Draft 26 placeholder used a single `help_suggestions` array per appraisal item. Stephanie's content is more useful if the help panel only shows alternatives matching the strategy the kid is currently working on (showing Both/And suggestions while the kid is doing Challenge would be confusing). So the data structure expands to two keyed arrays, and the panel reads the one matching `currentStrategy`.

**Files:**
- `src/lib/appraisals.js` — content swap + new shape
- `src/activities/GettingUnstuck.jsx` — small read-path change in the "I need help" panel

#### Change 1 — Reshape `help_suggestions` per appraisal item

In `src/lib/appraisals.js`, replace the placeholder single `help_suggestions: [...]` array with a strategy-keyed object:

```js
help_suggestions: {
  challenge: ["...", "..."],
  both_and: ["...", "..."],
}
```

Two suggestions per strategy, per item, per Stephanie's list (24 total alternative thoughts across the six items).

#### Change 2 — Locked content for each appraisal item

##### `a1` — *"I will never really feel like I belong."*

- **Challenge:**
  - "It is possible for me to feel like I belong."
  - "There are people out there who will understand me and who I am."
- **Both/And:**
  - "I don't feel like I belong, right now, AND there are things I can do to change that."
  - "I don't feel like I belong, right now, AND I won't always feel that way."

##### `a2` — *"Everyone will eventually leave me or give up on me."*

- **Challenge:**
  - "Just because people have left me in the past, doesn't mean everyone will leave me."
  - "Everyone is not the same, and there are people that won't leave or give up on me."
- **Both/And:**
  - "People have left me in the past AND that doesn't mean everyone will leave me in the future."
  - "People have left me in the past AND there are people out there who won't leave or give up on me."

##### `a3` — *"I am not lovable."*

- **Challenge:**
  - "Everyone is worthy of love, including me."
  - "I may not love everything about myself right now, but that doesn't make me unlovable."
- **Both/And:**
  - "I do not feel like I am lovable AND there are people out there who can and do love me."
  - "I do not feel like I am lovable AND I am capable of being loved if I accept it and let others in."

##### `a4` — *"No one would want me to be a part of their family."*

- **Challenge:**
  - "Even if I haven't found a forever family yet, I am worthy of this and can find a chosen family one day."
  - "There are people that care about me and may want to include me in their family, if I let them."
- **Both/And:**
  - "I feel that no one would want me to be a part of their family AND I am worth choosing and being included."
  - "I feel that no one would want me to be a part of their family AND that feeling might not be true — there may be people that want me to be a part of their family."

##### `a5` — *"I can't trust anyone."*

- **Challenge:**
  - "There are people I can trust."
  - "Other people have betrayed me, but that doesn't mean everyone will."
- **Both/And:**
  - "I feel like I can't trust anyone AND not everyone will betray me."
  - "I feel like I can't trust anyone AND there are people out there that are trustworthy."

##### `a6` — *"My real family will be mad if I like my foster or adoptive family."*

- **Challenge:**
  - "People that love me want me to be safe and happy, even if it is with a different family."
  - "It is okay to like my birth family and my foster and adoptive family."
- **Both/And:**
  - "My family might get mad if I like my foster or adoptive family AND it's okay to let myself feel safe and cared for."
  - "My family might get mad if I like my foster or adoptive family AND I can care about lots of different people in my life."

**Note on a6:** Stephanie's source doc uses *"My family"* in the alternatives where the locked appraisal item itself reads *"My real family"* — that's intentional (the alternatives mirror the kid's likely natural phrasing rather than the formal item). Keep the locked item text exactly as `src/lib/appraisals.js` has it (*"My real family will be mad if I like my foster or adoptive family."*) and use Stephanie's text **verbatim** in the help suggestions.

#### Change 3 — Strategy-aware help panel in GettingUnstuck.jsx

The "I need help" panel currently reads `appraisal.help_suggestions` as a flat array. Update the read path so it reads `appraisal.help_suggestions[currentStrategy]` instead, where `currentStrategy` is either `"challenge"` or `"both_and"` based on which strategy the kid is working on for that thought.

If `currentStrategy` is not yet set (edge case — the help button shouldn't be available before strategy selection, but defensively), fall back to the Challenge array as the default.

The panel UI doesn't need other changes — same "tap a suggestion to pre-fill the response field" behavior; same "close without using any" affordance.

#### Change 4 — Optional but recommended: order randomization

Within each strategy's array, the two suggestions can be rendered in either fixed order or randomized per session. Recommend **fixed order as written** (matches what Stephanie reviewed and signed off on; consistent across kids for evaluation purposes). If a future round wants A/B-tested randomization, we can revisit.

#### Data shape, export pipeline, version bump

No save-payload change. The free-text response the kid types still saves the same way. The `help_suggestions` content only surfaces in the help panel UI, not in any saved record.

Export pipeline: no change.

Version bump: `getting-unstuck` v5.4 → **v5.5 (MINOR)** — content swap from placeholders to real content, plus a small read-path refactor in the help panel. Prepend changelog: *"v5.5 — Replaced placeholder 'I need help' alternative-thought content with Stephanie's real content (Alternative Thoughts list, 2026-06-09); restructured `help_suggestions` as a strategy-keyed object so the panel surfaces Challenge-vs-Both/And-appropriate alternatives based on the kid's currently-selected strategy."*

**Approved by:** Josh, 2026-06-09, after receiving Stephanie's content.

*End of Draft 27.*

-->

---

<!-- Draft 25 shipped 2026-06-04 — archived (commented out). Draft 21 above stays active: its flow-integration intent is still pending. -->

<!--

### Draft 25 — Tree-progress preview: parametric `<TreeProgress />` component + new /demo "Growing your roots" section

Build the parametric React component for the tree-roots progress visual (per Draft 21's spec) and a click-through preview section on /demo so the team can see the visual progression with growth animation and per-stage encouragement copy.

**Two deliverables in one commit:**

1. `src/components/TreeProgress.jsx` — parametric SVG component with growth animation between stages.
2. New section on `src/pages/DemoPage.jsx` called **"Growing your roots"** — places `<TreeProgress />` inside click-through controls so reviewers can see all six stages with copy.

---

#### Source materials (locked references from Claude Design)

Claude Design has produced six reference SVG files showing the tree at each growth stage. They live in `SSI Platform A/Activity ideas/`:

- `tree-stage-0.svg` (Seed / sprout)
- `tree-stage-1.svg` (Sapling)
- `tree-stage-2.svg` (Young tree)
- `tree-stage-3.svg` (Established tree)
- `tree-stage-4.svg` (Flourishing tree)
- `tree-stage-5.svg` (Blooming)

**These files are visual references, not shipped assets.** Study them as you'd study the original `trampoline-safety-net.svg` reference (per commit `70d117b`): use them as the target for the parametric component, but **rebuild parametrically** in `<TreeProgress />` so the dev controls per-element animation. Don't ship the reference SVGs themselves.

All six files share:
- viewBox `0 0 400 600`
- Ground line at y≈420 (~70% above ground, ~30% below)
- Trunk base at x≈200
- Transparent background
- Semantic grouping by layer (`<g id="roots">`, `<g id="trunk">`, `<g id="branches">`, `<g id="leaves">`, `<g id="blossoms">`)
- Individual paths per root and per leaf

---

#### Part A — `<TreeProgress />` component

**File:** `src/components/TreeProgress.jsx` (new).

**Props:**

```jsx
<TreeProgress
  stage={0 | 1 | 2 | 3 | 4 | 5}   // required — current growth stage
  animated={boolean}               // optional, default true — animate growth-in on stage change
  className=""                     // optional — wrapper styling
/>
```

**Structure:**

The component renders one SVG with `viewBox="0 0 400 600"`, sized at full width of its container (capped via CSS `max-w-md` or similar on the wrapper). Inside the SVG:

- Ground line (single horizontal stroke, always visible across all stages)
- `<g class="roots">` containing root paths — each root is its own `<path>` with a memorable id (`root-primary`, `root-lateral-1`, `root-lateral-2`, …)
- `<g class="trunk">` containing the trunk path — same shape across all stages, just visible portion controlled by stroke-dasharray
- `<g class="branches">` containing each branch as its own `<path>`
- `<g class="leaves">` containing each leaf as its own grouped shape
- `<g class="blossoms">` containing flowers — only renders at stage 5

**Stage logic — what's visible at each stage:**

| Stage | Visible roots | Visible trunk | Visible branches | Visible leaves | Blossoms |
|---|---|---|---|---|---|
| 0 | Tiny taproot only | Seed/sprout | none | none | none |
| 1 | Taproot + 2-3 small laterals | Short, thin trunk | none | 1-2 leaves on sprout | none |
| 2 | More laterals, deeper | Mid-height, slightly thicker | 2-3 branches | ~5 leaves | none |
| 3 | Substantial spread | Full-height, mature thickness | 4-6 branches | ~12 leaves | none |
| 4 | Wide, proud | Full mature trunk | Full canopy structure | Full canopy of leaves | none |
| 5 | Same as 4, possibly extending further | Same as 4 | Same as 4 | Same as 4 | Blossoms/fruit on branches |

The exact per-stage element set comes from Claude Design's reference SVGs — match them visually as the locked target.

**Implementation pattern:**

Hand-code the SVG paths in the component (study Claude Design's references; extract the actual path `d` attributes and clean them up). Use a per-element `visible` flag derived from the current `stage` prop:

```jsx
const ROOTS = [
  { id: "root-primary", d: "M200,420 L200,520", minStage: 0 },
  { id: "root-lateral-1", d: "M200,450 Q170,470 140,495", minStage: 1 },
  { id: "root-lateral-2", d: "M200,450 Q230,470 260,495", minStage: 1 },
  // …
];

{ROOTS.filter(r => r.minStage <= stage).map(r => (
  <path key={r.id} d={r.d} stroke={ROOT_COLOR} strokeWidth={2} fill="none" />
))}
```

Same pattern for branches, leaves, blossoms. Each element has a `minStage` — the first stage at which it appears. Once visible, it stays visible (growth is additive; nothing is removed).

**Animation between stages:**

When `stage` changes and `animated` is true, new elements (those whose `minStage === currentStage`) animate in:

- **Roots and branches:** stroke-dashoffset animation. Each path's full length is computed (use `pathLength={1}` attribute trick to normalize), then transition `stroke-dashoffset` from 1 to 0 over ~400ms ease-out so the line draws in from origin to tip.
- **Leaves and blossoms:** opacity 0 → 1 + scale 0.6 → 1 over ~300ms ease-out, staggered ~50ms between siblings so they appear in a soft cascade rather than all at once.
- **Trunk thickening (stages 1 → 4):** the trunk's `stroke-width` transitions smoothly (1.5 at stage 0, 2 at stage 1, 3 at stage 2, 4 at stage 3, 5 at stages 4-5). CSS transition on `stroke-width` over ~400ms.

**Total reveal duration:** ~600-800ms for new branches + roots to draw in, with leaves staggering slightly behind. Should feel like a moment of growth, not a flash.

**Accessibility:**

- Respect `prefers-reduced-motion: reduce` — when set, skip all transitions and just show the final state instantly. Wrap CSS transitions in `@media (prefers-reduced-motion: no-preference)`.
- The SVG should have `role="img"` and an `aria-label` describing the current stage (e.g., `"Tree at stage 3 of 5 — established, with growing roots and a small canopy"`).

**Visual styling (from the locked palette):**

- Roots: stroke `#5a3a1f` to `#4a2d18`, varied stroke widths (primary 3, laterals 2)
- Trunk: stroke + fill `#8b5a2b` to `#7c4d24`
- Leaves: fill `#7c9a76` to `#5e8460`, no stroke (or very thin slate-700 outline)
- Blossoms: fill `#f59e0b` or `#fda4af`
- Ground line: `#e2e8f0` (slate-200), `stroke-width: 1.5`

---

#### Part B — "Growing your roots" section on /demo

**File:** `src/pages/DemoPage.jsx` — new section.

**Placement:** between **Meet the cast** and **Data export demo**. Keeps the narrative-content sections grouped and the technical export section at the bottom.

**Section heading:** **"Growing your roots"**

**Sub-line** (small, italic, slate):

> Preview of the between-activity progress visual. Click through to see how the tree grows as a youth completes each activity.

**Layout:**

A centered card (`bg-amber-50`, `rounded-2xl`, `border border-amber-200`, ~32px padding) containing:

1. **The tree visual** — `<TreeProgress stage={currentStage} animated />` at ~280px wide, centered.
2. **Stage caption** — a heading + body block beneath the tree, ~24px below.
3. **Stage indicator dots** — six small dots beneath the caption showing position in the 6-stage sequence; the active stage's dot is filled amber-500, the others are slate-200. Tappable (clicking a dot jumps to that stage).
4. **Controls row** — three buttons centered below the dots:
   - **Previous** (`bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full px-5 py-2 text-sm text-slate-700`) — disabled at stage 0.
   - **Next** (`bg-amber-500 hover:bg-amber-600 text-white rounded-full px-5 py-2 text-sm font-semibold`) — disabled at stage 5.
   - **Reset to start** (`text-amber-700 underline text-sm`) — secondary affordance, resets to stage 0.

**Behavior:**

- Default stage on section mount: 0.
- Next button: `setStage(s => Math.min(5, s + 1))` — triggers the growth animation.
- Previous button: `setStage(s => Math.max(0, s - 1))` — visual "rewinds" to the prior state. The growth animation only plays on forward steps; back is an instant snap to the prior state (or a brief fade — judgment call).
- Stage dot click: jump directly to that stage. If jumping forward more than one stage, the animation should still play for the new elements at the target stage (not all intermediate stages — that would feel chaotic).
- Reset button: snap to stage 0.

---

#### Part C — Per-stage encouragement copy

These are the captions that appear below the tree at each stage. **Heading** is the big line; **body** is the short follow-on. The activity context is the italic line above the heading.

**Stage 0 — Seed / sprout** (intro state, before any activity completed)

- *Activity context:* "Before you begin."
- **Heading:** Just getting started.
- **Body:** Every tree starts as a seed. Yours starts here.

**Stage 1 — Sapling** (after the first activity)

- *Activity context:* "You finished Self-Reflection."
- **Heading:** Look — roots are forming.
- **Body:** You took the first step. Notice the small roots starting below the surface.

**Stage 2 — Young tree** (after the second activity)

- *Activity context:* "You finished Belonging Skills Sort."
- **Heading:** Your roots are reaching further.
- **Body:** Two activities in. New roots are spreading, and your first branches are starting to grow.

**Stage 3 — Established tree** (after the third activity)

- *Activity context:* "You finished Getting Unstuck."
- **Heading:** Solid roots, steady ground.
- **Body:** Halfway there. Your roots are deep enough to hold you steady — whatever comes next.

**Stage 4 — Flourishing tree** (after the fourth activity)

- *Activity context:* "You finished Allies / Safety Net."
- **Heading:** Wide and rooted.
- **Body:** Almost there. Your roots are wide, your branches are full. You can feel the difference.

**Stage 5 — Blooming** (after the final activities)

- *Activity context:* "You finished the program."
- **Heading:** Look what you grew.
- **Body:** Roots wide. Branches full. Even blossoms now. This is what belonging can look like.

**Notes on the copy:**

- The activity-name pairing in the activity-context line is **illustrative** for the preview — the actual production flow may end up with a different activity order, in which case the activity names get reshuffled. Josh can tune.
- The body copy intentionally *points out what's visibly different* at each stage ("Notice the small roots," "New roots are spreading," "your roots are deep enough," "your roots are wide, your branches are full," "even blossoms now"). The visual progress and the verbal reinforcement reinforce each other.
- Tone is "quietly proud" per Draft 21's mood direction — warm, grounded, second-person. Not bouncy.

**Copy styling:**

- Activity context: italic, `text-sm`, slate-500.
- Heading: `text-xl font-bold`, slate-700, ~8px below the context line.
- Body: `text-base`, slate-700, ~8px below the heading.

---

#### Out of scope for this draft

- **Real flow integration.** This is preview-only on /demo. The component does NOT yet wire into actual activity completion — that's deferred until the activities are stitched into a continuous flow (per the Cleanup queue). When that happens, a follow-up draft routes activity Save → progress-reveal screen → next activity.
- **Per-PID persistence.** No Supabase column for `current_stage` yet. Preview state lives in component-local React state.
- **Backend tracking.** No analytics yet on which stages get viewed.
- **Animation variants.** No alternate animation styles (cross-fade, spring physics, etc.). One animation style, locked.

#### Version bump

No activity-version bump. This is a new component + new /demo section, not a change to any existing activity. Update `INFRASTRUCTURE.md` change log: *"Added 'Growing your roots' preview section to /demo with parametric `<TreeProgress />` component showing six growth stages + per-stage encouragement copy. Visual references from Claude Design at `Activity ideas/tree-stage-*.svg`; component rebuilt parametrically using those as locked targets."*

**Approved by:** Josh, 2026-06-04.

*End of Draft 25.*

-->

---

<!-- Draft 26 shipped 2026-06-08 — archived (commented out). -->

<!--

### Draft 26 — Round 4 feedback bundle (Self-Reflection v1.3 + Letter v2.2 + BSS v3.1 + Allies v5.2 + Getting Unstuck v5.4 + FollowUp scale change + Tree-progress copy)

Bundle of activity refinements driven by the 2026-06-08 review meeting feedback (Round 4 Feedback.csv). Ship as one commit so the team sees one stopping point. **Getting Unstuck + FollowUp Survey share an Appraisals scale change that must be applied to both in the same commit** — they read from the same locked item set and the scale shift is a coupled data-shape change.

---

#### Part A — Self-Reflection v1.2 → v1.3 (MINOR)

Two small changes.

**File:** `src/activities/SelfReflection.jsx`.

1. **Remove the closing "we'll come back to it" message.** Holly flagged this isn't true — there's no later activity that comes back to the kid's reflections. Strip the line; the existing simple Save confirmation stays.

2. **Add example thoughts and feelings to each side of the prompt.** Ginny asked for these because the input fields can read as ambiguous (what kind of thought? what kind of feeling?).

   For the **inclusion** prompt, add italic placeholder/example text alongside the thoughts and feelings fields:
   - Thought example: *"e.g., People like me"*
   - Feeling example: *"e.g., Happy"*

   For the **exclusion** prompt:
   - Thought example: *"e.g., Nobody likes me"*
   - Feeling example: *"e.g., I felt sad"*

   Render as small italic placeholder text inside the textareas, or as small italic helper text directly below each field label — whichever pattern is already in use elsewhere in the activity. Don't pre-fill the inputs.

**Version bump:** v1.2 → v1.3 (MINOR, copy + UX hint). Prepend changelog: *"v1.3 — Removed closing 'we'll come back to it' message; added example thought/feeling text on inclusion and exclusion prompts."*

---

#### Part B — Letter to Another Youth v2.1 → v2.2 (MINOR)

Add two additional scaffolding prompts to the existing instruction line.

**File:** `src/activities/LetterBuilder.jsx`.

The current single instruction above the textarea reads: *"What you would want to say to another teen who feels like they don't belong."* Keep that as the primary prompt, and **append two more smaller prompts below it** as suggestions the kid can use or ignore:

> - What is one skill you would recommend?
> - What is one helpful thought you could share?

Render the two new prompts as a small italic list under the primary instruction, in slate-500. Not bullet-required reading, just two seeds to help kids who freeze on the blank textarea.

**No data-shape change.** Save payload `{ letter, saved_at }` unchanged.

**Version bump:** v2.1 → v2.2 (MINOR, copy addition). Prepend changelog: *"v2.2 — Added two optional scaffolding prompts under the main instruction: 'What is one skill you would recommend?' and 'What is one helpful thought you could share?'"*

---

#### Part C — Belonging Skills Sort v3.0 → v3.1 (MINOR-medium)

Three changes.

**File:** `src/activities/BelongingSkillsSort.jsx`.

1. **Punctuation tweak on encouragement.** Wherever the activity says "Nice work" / "Good job" / similar without final punctuation, add an exclamation mark: "Nice work!" / "Good job!" Matches the energy of the moment.

2. **Saveable snapshot output.** Currently the post-submit screen says something like *"That's a snapshot of where you are."* Render an actual visual snapshot of the kid's three sorted buckets with the skill names inside each bucket, and offer a Save-as-image button (same `downloadSvgElementAsPng` pattern used by Allies / Safety Net and Who I Am Poem per commit `92bfff9`). The snapshot becomes a downloadable PNG keepsake. Unsorted items are excluded from the snapshot.

3. **Reconsider-unsorted prompt.** After the kid clicks the initial Continue/Save, if there are any unsorted items still sitting in the unplaced area, surface a follow-up screen:

   > **You didn't sort these.** Are any of these worth reconsidering?
   >
   > [list of unsorted skill cards]
   >
   > [Yes] [No]

   - **Yes:** the kid returns to the sort interface with only the previously-unsorted items still draggable; sort what they want, leave the rest. On Continue, those newly-sorted items get added to the appropriate buckets and the snapshot regenerates.
   - **No:** proceed straight to the snapshot screen. Unsorted items don't appear in the snapshot.

   This is a one-time prompt — if they reconsider once and still leave items unsorted, don't ask again.

**Data shape:** No change to the existing `{already_doing, willing_to_try, not_interested, unplaced}` arrays. The reconsider step just gives the kid one more chance to move items from `unplaced` into the placement arrays before final save.

**Version bump:** v3.0 → v3.1 (MINOR). Prepend changelog: *"v3.1 — Added '!' to encouragement strings; added saveable snapshot of sorted buckets as a PNG keepsake; added a one-time 'reconsider unsorted items?' prompt after initial Continue, with Yes/No options."*

---

#### Part D — Allies / Safety Net v5.1 → v5.2 (MINOR-medium)

Three changes from Adrienne's Round 4 feedback.

**File:** `src/activities/AlliesSafetyNet.jsx` + `src/components/TrampolineNet.jsx`.

1. **Encouragement punctuation.** Same fix as Part C — add exclamation marks: "Good job!" etc.

2. **Percentage labels on each support type heading.** Throughout the activity, whenever a support type word appears as a heading (Practical / Emotional / Social), append the percentage of the kid's total ally count that falls in that type:

   > Practical Support (22%)
   > Emotional Support (45%)
   > Social Support (33%)

   The percentage is computed against the kid's TOTAL ally count (counting any ally who appears in multiple support types as a single ally for the denominator, but contributing to each support type's numerator they appear in). If total allies is zero, render the label without the percentage (just "Practical Support").

   These labels surface:
   - On the per-support-type selection screen heading (Step 1)
   - On the Inspect step (Step 2) where the net is displayed
   - On the Final Review screen
   - Anywhere else the support type names appear

3. **Visually demote the trampoline net when total support is low.** Adrienne flagged that with 1 ally total, the net visual reads as "full" because the wedges fill the available space. When the kid has **2 or fewer total allies**, the TrampolineNet should render with reduced visual weight:

   - Reduce overall opacity to ~60%.
   - Add a small slate-600 caption above or below the net: *"A small net is a place to start — let's keep building."*

   The visual demotion only applies on screens where the FULL net is displayed (Step 2 Inspect intro, Step 2 X-out screen, Final Review). The Step 1 per-type selection screens are unaffected.

   For 3+ allies total, the net renders at full visual weight as before.

**Data shape:** No change.

**Export pipeline:** No new columns. Percentages are computed at render time from existing data.

**Version bump:** v5.1 → v5.2 (MINOR-medium). Prepend changelog: *"v5.2 — Added '!' to encouragement strings; added percentage labels to each support type heading throughout (computed from current ally counts); added visual demotion of the trampoline net (60% opacity + 'small net is a place to start' caption) when total ally count is 2 or fewer."*

---

#### Part E — Getting Unstuck v5.3 → v5.4 (MAJOR — scale change) + FollowUp Survey Appraisals scale change (coupled)

**Three coupled changes; one bumps Getting Unstuck to MAJOR because the scale shifts and the save payload range changes.**

**Files:**
- `src/activities/GettingUnstuck.jsx`
- `src/lib/appraisals.js` (the shared module from Draft 15 with the 6 items)
- `src/activities/FollowUp.jsx` (the Appraisals scale section)
- `src/lib/exportFlatten.js` (value-range comments / docs)
- `src/lib/demoDataset.js` (synthetic data regenerator)

##### E.1 — Scale shift: 0–5 (6 points) → 0–4 (5 points)

Holly's ask: 5-point scale instead of 6. Cleaner middle anchor and easier mental load for the kid.

**New scale:**

| Value | Anchor |
|---|---|
| 0 | Not At All True |
| 1 | (unlabeled) |
| **2** | **Somewhat True** (middle, exactly) |
| 3 | (unlabeled) |
| 4 | Definitely True |

This applies BOTH in Getting Unstuck (where the kid rates the 6 appraisal items) AND in the FollowUp Survey's Appraisals scale section (which uses the same 6 items from `src/lib/appraisals.js`).

`src/lib/appraisals.js` should export the scale definition alongside the items so both consumers stay in sync.

##### E.2 — Pick threshold stays at ≥2

The threshold logic doesn't change in spirit — items rated "Somewhat True" or above carry forward to the Pick screen. On the new 0–4 scale that's `truth_rating >= 2` (items rated 2, 3, or 4 carry; items rated 0 or 1 don't). Same behavior as v5.3, just translated to the new scale where 2 is exactly the middle anchor.

The affirmation path (no items clear ≥2) stays unchanged.

##### E.3 — "I need help" button per thought

Holly's ask. On each thought-work screen (where the kid is generating a Challenge or Both/And response), add a small *"I need help"* button below the response field.

**Behavior:** Tapping the button opens a small panel showing 3–5 alternative thought suggestions tailored to that specific appraisal item. The kid can read them for inspiration, optionally tap one to pre-fill the response field as a starting point (they can then edit), or close the panel without using any.

**Content:** Stephanie is producing the alternative-thought lists per appraisal item. **For this draft, build the UI with placeholder content** — a small array per item with generic "Sample alternative thought..." text. When Stephanie's content arrives, swap the placeholders for real content in a follow-up commit (no UI change needed).

Suggested placeholder structure in `src/lib/appraisals.js`:

```js
export const APPRAISALS = [
  {
    id: "a1",
    text: "I will never really feel like I belong.",
    dimension: "future",
    help_suggestions: [
      "[Placeholder — Stephanie is producing real content. Example shape: 'There have been moments, even brief ones, when I have felt I belonged.']",
      "[Placeholder — second alternative thought.]",
      "[Placeholder — third alternative thought.]",
    ],
  },
  // ...same for a2–a6
];
```

The kid's free-write response stays primary; help-button content is supportive only.

##### E.4 — Data shape changes

The save payload for Getting Unstuck still has the shape:

```js
appraisals: {
  a1: { truth_rating: 0..4, selected: bool, strategy?: "challenge"|"both_and", response?: "..." },
  // ...a6 [+ a_other]
}
```

`truth_rating` range narrows from `0..5` to `0..4`. The FollowUp Survey's appraisals section uses the same range.

`exportFlatten.js`: update any value-range comments on `unstuck_truth_a*` and `fu_app_*` columns. The columns themselves stay (same names, new max value).

`demoDataset.js`: regenerate synthetic `truth_rating` values to fall in 0..4 instead of 0..5.

##### E.5 — Version bumps

- `getting-unstuck` v5.3 → **v5.4 (MAJOR)** because the scale changes and the saved value range shifts. No real participant data exists yet so no migration concerns. Prepend changelog: *"v5.4 — Truth-rating scale shifted from 0-5 (6 points) to 0-4 (5 points), with anchor labels at 0 Not At All True / 2 Somewhat True / 4 Definitely True; threshold for Pick eligibility stays at ≥2 ('Somewhat True' or above); added 'I need help' button per thought that opens an alternative-thought-suggestions panel (placeholder content; Stephanie producing real content)."*
- `followup` v1.0 → **v1.1 (MINOR-major)** — same scale change applied to the Appraisals section. Item wording and order unchanged. Prepend changelog: *"v1.1 — Appraisals scale shifted from 0-5 to 0-4 to match Getting Unstuck v5.4."*

---

#### Part F — Growing Your Roots: locked preamble + Stage 0 copy + drop in new tree assets

**Files:** `src/components/TreeProgress.jsx` (or wherever the per-stage captions live — likely in the DemoPage data array) + `src/assets/tree/` (drop in the new SVG assets per below).

1. **Add a preamble before Stage 0.** On the screen where the kid first encounters the tree (intro, or before the first activity), show this preamble copy:

   > **Ready for Roots. Yours start here.**
   >
   > This little seed is your tree. As you finish each activity, your roots will reach further and your branches will fill in.
   >
   > Watch what grows.

   Three lines, structured so the first line is the bold framing (program name + ownership), the middle line is the explanation, and the closer is short and invitational. Render the first line as bold-or-larger, the body lines regular. Center the block above the Stage 0 tree visual on the intro/before-first-activity screen.

2. **Replace the Stage 0 caption.** The current Stage 0 caption block ("Just getting started." / "Every tree starts as a seed. Yours starts here.") gets replaced with:

   - **Heading:** Here's your tree.
   - **Body:** Right now it's a seed. As you finish each activity, you'll watch it grow into something bigger.

   Holly flagged that the prior copy felt like it was missing a personal hook — "Yours starts here" without context. The new preamble (item 1) plus this Stage 0 caption together name the kid's relationship to the tree more directly.

3. **Drop in the new tree icon set.** Claude Design has produced the locked six-stage reference SVGs. They live in `SSI Platform A/Safety Net Exercise.zip` → `ready-for-roots-tree/`:

   - `tree-stage-0.svg` through `tree-stage-5.svg`
   - All six share viewBox `0 0 400 600`, ground line at y=420, trunk base at x=200, transparent background
   - Semantic layer groups: `<g id="ground">`, `<g id="roots">`, `<g id="trunk">`, `<g id="branches">`, `<g id="leaves">`, `<g id="blossoms">` (stage 5 only)
   - Per-element ids inside each layer (`root-tap`, `root-lat-N`, `branch-N`, `clump-dN`, `leaf-N`, `bloom-N`) — the dev can target individual paths for the growth animation
   - Full build notes from Claude Design at `Safety Net Exercise.zip` → `ready-for-roots-tree/NOTES.md` (read this — it documents the exact id conventions, the three-tone foliage approach, the sub-root naming pattern, and the locked-trunk-anchor strategy)

   **Action:** Extract the six SVGs into `src/assets/tree/` with the same filenames. Then build the parametric `<TreeProgress />` component per Draft 25's spec, using these six files as the locked visual reference. Match the per-element semantic ids so the animation hooks (stroke-dashoffset for roots/branches, opacity+scale for leaves/blossoms, X-scale transform for trunk thickening) work as intended.

   Trunk is the same continuous path across all six stages — only `height`, `wBase`, and `wTop` change. That's the parametric handle for trunk growth.

**Version bump:** No activity bump; this is a component + asset + copy update on the demo preview surface.

---

**Approved by:** Josh, 2026-06-08, after reviewing Round 4 Feedback.csv and the meeting notes.

**Out of scope for this draft:**

- New tree-progress icons (Josh providing). When delivered, follow-up draft updates the SVG asset / parametric component.
- Stephanie's "I need help" alternative-thought content (Stephanie producing). When delivered, follow-up commit swaps placeholders for real content in `src/lib/appraisals.js`.
- ElevenLabs voice work (Josh).
- Female + Nonbinary Sam character images and voice lines (Josh).
- Video format change to 9:16 vertical (production-direction note for Adrian — no code impact on the demo).

*End of Draft 26.*

-->

---

<!-- Draft 22 shipped 2026-06-03 — archived (commented out). -->

<!--

### Draft 22 — "Meet the cast" section on /demo (replaces the existing Video section)

New section on the /demo page that previews Holly's video script before it's animated. **Five** character cards with images + script lines + ElevenLabs audio playback per line (where lines exist), followed by a closing Family Photo. The team gets to hear how the voices land on each line and react in feedback before production locks.

**This draft replaces the existing Video section** added in commit `d64dbdb` (2026-05-19) — the two-card preview with Sam concept-art images and the embedded YouTube animation sample. See Step 0 below.

**Source materials** (all in `SSI Platform A/Video Content/`, drop into the repo during this build):

- **Images:** `Sam 14.png`, `Sam 16.png`, `Foster Mom 2.png`, `Foster Dad 2.png`, `Mrs Johnson.png`, `Family Photo.png`
- **Audio:** `Sam 14 Line 1.mp3`, `Sam 14 Line 2.mp3`, `Sam Line 1.mp3` through `Sam Line 7.mp3`, `Foster Mom.mp3` — 10 files total

---

#### 0. Remove the existing Video section first

Before adding the new section, tear out the old one. Per commit `d64dbdb`, the current `/demo` Video section (positioned under Data export) has:

- A section heading + container
- Card 1: a 2-column grid of three Sam concept-art images
- Card 2: an embedded YouTube Short (`A8vVBE_2dNI`) in a 9:16 portrait player

**Remove:**

- The Video section JSX from `src/pages/DemoPage.jsx` (heading, container, both cards, intro copy).
- The three Sam concept-art assets from `src/assets/demo/`: `sam-boy-16.png`, `sam-boy-16-2.png`, `sam-boy-16-3.png`. Delete the files and the import statements.
- The YouTube embed reference (`A8vVBE_2dNI`).
- Any helper components that were specific to the Video section.

**Keep:**

- The **"Video / animation" feedback category** added in commit `1edd96f` (DB CHECK constraint, edge function v4 allow-list, FeedbackButton dropdown, AdminFeedbackPage label/filter). It still applies to the new Meet the cast section — reviewers tag feedback about voices, character look, animation direction. No DB migration needed; just keep what's already there.
- The source files in `SSI Platform A/Video Content/` (`backstage.png`, `Sam 2.png`, `Sam 3.png`, etc.). Those are working artifacts in the repo-root content folder, not in `src/`. Leave them alone.

---

#### 1. Asset prep (rename + relocate)

Move the new assets into the repo under `/public/cast/` with web-safe kebab-case names:

**Images → `/public/cast/images/`:**
- `Sam 14.png` → `sam-14.png`
- `Sam 16.png` → `sam-16.png`
- `Foster Mom 2.png` → `foster-mom.png` (this is the v2 image — the canonical version going forward; ignore the older `Foster Mom.png`)
- `Foster Dad 2.png` → `foster-dad.png` (the v2 image; ignore the older `Foster Dad.png`)
- `Mrs Johnson.png` → `mrs-johnson.png`
- `Family Photo.png` → `family-photo.png`

**Audio → `/public/cast/audio/`:**
- `Sam 14 Line 1.mp3` → `sam-14-line-1.mp3`
- `Sam 14 Line 2.mp3` → `sam-14-line-2.mp3`
- `Sam Line 1.mp3` → `sam-16-line-1.mp3`
- `Sam Line 2.mp3` → `sam-16-line-2.mp3`
- `Sam Line 3.mp3` → `sam-16-line-3.mp3`
- `Sam Line 4.mp3` → `sam-16-line-4.mp3`
- `Sam Line 5.mp3` → `sam-16-line-5.mp3`
- `Sam Line 6.mp3` → `sam-16-line-6.mp3`
- `Sam Line 7.mp3` → `sam-16-line-7.mp3`
- `Foster Mom.mp3` → `foster-mom-line-1.mp3`

The 16yo Sam audio files map to the seven voice-over blocks in `Video Content/Character_Profiles.docx` in order (line 1 → opening narration, …, line 7 → closing metaphor). The 14yo Sam files map line 1 → inner monologue, line 2 → angry rejection. Foster Mom has the one dining-table line.

---

#### 2. Page placement + section heading

New section on `src/pages/DemoPage.jsx`. Place it **between the Tests section and the Data export section** — that order takes the reviewer from activity sandbox → survey instruments → cast & voices → export. Tonally it sits well in the middle since it's the most narrative slot.

**Section heading:** **"Meet the cast"**

**Section sub-line** (small, italic, slate):

> Preview of the cast and voice samples for Holly's video script (Script 2.0). Tap any line to hear it read.

---

#### 3. Component spec

Build a new component, suggested name `<CastCard />` (or co-located in `src/pages/DemoPage.jsx` if that's lighter — judgment call).

**Per-card layout (desktop):**

Image column on the left at ~40% of card width, text column on the right at ~60%. Card has a subtle amber-200 border with `rounded-2xl` corners and `bg-amber-50` background — matches the existing demo card pattern. ~24px padding inside.

**Per-card layout (mobile):**

Image stacks on top, full width of the card, capped at ~280px tall with `object-cover` so it doesn't dominate the screen. Text and audio stack below.

**Image:**

- Sam 14 image is landscape (2304×1296). Render at full column width on desktop, `object-cover` to a slight portrait crop (~4:3) so the heads/faces remain centered.
- Sam 16, Foster Mom, Foster Dad, Mrs. Johnson images are portrait (~1122×1402). Render at full column width on desktop, natural aspect.
- All images: `rounded-xl`, subtle drop shadow.

**Cards with audio vs without:**

Three of the five cards have audio lines (Sam 14, Sam 16, Foster Mom). Two cards do not (Foster Dad, Mrs. Johnson) — neither character speaks in Script 2.0 yet. For audio-less cards, the text column has the character name, role line, and a single description paragraph in place of the lines list. No `<audio>` element. Layout otherwise identical so the cards visually balance the page. When their lines get recorded later, drop the mp3s in and the cards extend the same way as the audio-bearing ones.

**Text column:**

1. **Character name** — heading-style, `text-2xl font-bold text-slate-700`.
2. **Role line** (italic, slate-500, `text-sm`):
   - Sam (14): *"The 14-year-old version — at the heart of every flashback."*
   - Sam (16): *"Our narrator — Sam two years later."*
   - Foster Mom: *"The spark in the foster home."*
   - Foster Dad: *"The anchor to Foster Mom's spark."*
   - Mrs. Johnson: *"Sam's teacher and the catalyst for change."*
3. **Lines list** — one block per line:
   - **Scene context** (italic, slate-500, `text-sm`, ~80% leading): the per-line scene cue from `Character_Profiles.docx`.
   - **Quoted line** (regular weight, `text-base`, slate-700, with smart-quote curlies `"…"` wrapping the line text): full line text verbatim from the doc.
   - **Audio control:** native HTML5 `<audio controls src="/cast/audio/{filename}.mp3" preload="metadata" />` — full width of the text column, slight top margin. The native browser controls handle play / pause / scrubbing / volume. Keep it simple — no custom player.
   - Spacing between lines: ~28px so the blocks read as separate beats.

---

#### 4. Card data (paste-and-go content for each card)

##### Card 1 — Sam (14 years old)

**Image:** `/cast/images/sam-14.png`
**Role line:** *The 14-year-old version — at the heart of every flashback.*

**Line 1.1** (`/cast/audio/sam-14-line-1.mp3`)
*Scene:* Inner monologue voice-over (the moment after the adoption question)
*Line:* "How do I feel about that? I have literally no idea."

**Line 1.2** (`/cast/audio/sam-14-line-2.mp3`)
*Scene:* At the dining table (becomes angry, before leaving)
*Line:* "You aren't my parents and you never will be."

##### Card 2 — Sam (16 years old)

**Image:** `/cast/images/sam-16.png`
**Role line:** *Our narrator — Sam two years later.*

**Line 2.1** (`/cast/audio/sam-16-line-1.mp3`)
*Scene:* Voice-over (opening narration)
*Line:* "I remember this moment like it was yesterday. I was removed from my real mom when I was 10 and lived with my foster family after bouncing around placements for a couple of years."

**Line 2.2** (`/cast/audio/sam-16-line-2.mp3`)
*Scene:* Voice-over (reflecting on his thoughts at the adoption-offer moment)
*Line:* "When she asked me this, the first thing I thought was 'they don't love me, they're just offering to do this because they feel bad for me.' I remembered the years where I moved from family to family because no one wanted me and I thought 'this will never work out, I don't even want to get my hopes up.' But at the same time, I was already hopeful, and that made me feel guilty. What was wrong with me that I felt excited about being adopted by this family, when my real mom was still out there? I couldn't give up on her by agreeing to be adopted."

**Line 2.3** (`/cast/audio/sam-16-line-3.mp3`)
*Scene:* Voice-over (after the rejection — grimace)
*Line:* "Yeah, that was a low blow. But at the time I really couldn't picture myself belonging to their family. I had been through a lot. Going from elementary to middle to high school isn't easy for anyone, but it was even harder for me because I was changing schools and houses all the time. Who could keep up with friends or teams during all of that? It was tough but I was used to doing everything by myself my whole life."

**Line 2.4** (`/cast/audio/sam-16-line-4.mp3`)
*Scene:* Voice-over (Mrs. Johnson, backstage crew, opening night)
*Line:* "After I said no, I stayed with my foster parents who said they understood but I could tell it was an issue. Not too long after they and my case worker really encouraged me to participate in something at school. My favorite teacher Mrs. Johnson was directing the school musical, and she suggested that I join the backstage crew. I had never done anything like that but I thought it was lowkey enough to try and I knew that Mrs. Johnson would support me if it was hard. Even though at first I didn't really care, I got really into it when I saw how we were all working on this one massive production and by opening night I wanted the show to run perfectly. After the show when everyone in the cast and crew were cheering and celebrating together, I really felt like a part of something for maybe the first time ever… and then I knew what I had been missing out on by holding back."

**Line 2.5** (`/cast/audio/sam-16-line-5.mp3`)
*Scene:* Voice-over (the metaphor and the resolution — closing narration)
*Line:* "On the final night of our show, I was backstage using the light from the stage manager's lamp to read the directions for the next scene change while looking out at the main character standing on stage in her spotlight. And I realized: this backstage light isn't gone or unimportant just because of the spotlight shining on stage. Actually, the show only works because both lights are there. That's a lot like my mom and my new family. I'm only me because of both of my families. That's when I knew two things can be true at the same time: I can love and miss my mom, and I can belong to my new family too. I don't have to choose between them because they're just different roles in the same production, and they're both part of my story."

**Line 2.6** (`/cast/audio/sam-16-line-6.mp3`)
*Scene:* Voice-over (drive home, recognizing unhelpful thoughts)
*Line:* "On the drive home with my foster family, I thought again about how I had said no to being adopted. I realized a lot of my thoughts weren't necessarily true, like the thought that they only offered to adopt me because they felt bad for me, not because they loved me — I didn't have any evidence for that. Even some thoughts that were true, like that past placements hadn't stuck, weren't helpful for me to think about, because my past placements and my current one weren't the same. Those thoughts weren't helping me, and they were actually getting in the way of me locking in with my current foster family."

**Line 2.7** (`/cast/audio/sam-16-line-7.mp3`)
*Scene:* Voice-over (transitioning toward the realization)
*Line:* "Recognizing that helped me begin to picture myself belonging to their family. But there was still something major that I couldn't figure out: how could I be adopted and belong to a new family when my real mom was still out there?"

**Note on Sam 16 line order in the UI:** display in script-narrative order (1 → 2 → 3 → 4 → 6 → 7 → 5) so the team hears them in story order, not in recording order. Audio file numbers 5 and 6/7 were recorded out of sequence (line 5 is the closing metaphor; lines 6 and 7 are middle-of-arc beats that were recorded after the rest). The line numbering on the audio files stays; only the UI render order shifts.

##### Card 3 — Foster Mom

**Image:** `/cast/images/foster-mom.png`
**Role line:** *The spark in the foster home.*

**Line 3.1** (`/cast/audio/foster-mom-line-1.mp3`)
*Scene:* At the dining table (excited, happy voice — the cold open of the script)
*Line:* "Sam, you've been in our foster home for two years now and we really want you to be an official part of this family. How would you feel about us adopting you?"

##### Card 4 — Foster Dad (no audio yet)

**Image:** `/cast/images/foster-dad.png`
**Role line:** *The anchor to Foster Mom's spark.*

**Description paragraph** (in place of the lines list — no `<audio>` element on this card):

> No spoken lines in Script 2.0. Foster Dad is present at the dining-table scene alongside Foster Mom and 14-year-old Sam; the script describes his body language as solid, steady, and supportive — the still half of the conversation. If a line is added in a later revision (for example, an exchange with Foster Mom after Sam walks away), it would slot into the post-rejection beat.

##### Card 5 — Mrs. Johnson (no audio yet)

**Image:** `/cast/images/mrs-johnson.png`
**Role line:** *Sam's teacher and the catalyst for change.*

**Description paragraph** (in place of the lines list — no `<audio>` element on this card):

> No directly quoted lines in Script 2.0. Mrs. Johnson is referenced in 16-year-old Sam's voice-over as the teacher who suggested he join the backstage crew of the school musical — the invitation that becomes the turning point in the story. If her own dialogue is added in a later revision (for example, the moment where she invites Sam to join the crew), it would slot into the school / hallway scene before Sam's decision to try it.

**Card display order in the section:** Sam 14 → Sam 16 → Foster Mom → Foster Dad → Mrs. Johnson → Family Photo. That order tracks the script narrative: main character (two ages), parents at the opening table, teacher who appears mid-story, closing family image.

---

#### 5. Family Photo — closing image

After the five character cards, render the Family Photo as a wide closing image. **No card border** — let it sit as a hero-style closer, full width of the section (capped at the same max-width as the cards), centered, with `rounded-2xl` and a subtle drop shadow.

**Image:** `/cast/images/family-photo.png` (landscape ~4:3)

**Caption** (below the image, centered, italic, slate-500, `text-sm`):

> Sam and his foster family, after the realization.

---

#### 6. Accessibility + a few small details

- Each `<audio>` element gets an `aria-label` of the form *"Audio: {character} — {scene description}"* so screen readers announce what's about to play.
- Each character image gets a real `alt` attribute matching the role line (e.g., `alt="Sam at 14 — the 14-year-old version of the main character"`).
- The Family Photo's `alt` is `"Sam with his foster family"`.
- Cards have `tabindex="0"` so keyboard users can scroll through them; the audio controls inside are natively focusable.

---

#### 7. Out of scope for this draft

- **Audio for Mrs. Johnson and Foster Dad.** Both cards ship with image + description text only. When their voice recordings exist, adding `<audio>` elements to those cards is a small follow-up — drop the mp3s in `/public/cast/audio/`, extend the card data with a `lines` array, and the card renders the same way as the audio-bearing ones.
- No transcript download, no per-line copy-to-clipboard, no fancy playback ordering controls. Native audio controls only. Keep this lightweight and shippable in one session.
- No analytics on which lines get the most plays. Future-us can add if helpful.

#### 8. Version bump

No activity-version bump. This is a new DemoPage section replacing the existing Video section, not a change to any existing activity. Update `INFRASTRUCTURE.md` change log with a one-line entry: *"Replaced the /demo Video section (commit `d64dbdb`) with a new 'Meet the cast' section — five character cards (Sam 14, Sam 16, Foster Mom, Foster Dad, Mrs. Johnson) + Family Photo closer. Audio playback on the three cards with recorded ElevenLabs lines; image + description only on the two without."*

**Approved by:** Josh, 2026-06-03.

*End of Draft 22.*

-->

---

<!-- Drafts 23 + 24 shipped 2026-06-04 — archived (commented out). -->

<!--

### Draft 23 — Allies / Safety Net v5.1 → v5.2: show previously-selected allies above each Strengthen prompt

Small follow-up surfaced during Josh's verification of Draft 20 (2026-06-04). The Strengthen step now runs for all three support types (v5.1), and Josh wants each Strengthen screen to remind the kid which allies they already selected for that support type before asking *"Is there anyone else…"*. Improves recall — the kid sees their list, then generates an addition instead of vaguely restating someone they already named.

**File:** `src/activities/AlliesSafetyNet.jsx`.

**Change:** On each Strengthen screen, **above the existing "Is there anyone else who could give you {type} support?" question**, add a reminder block listing the allies the kid selected for that support type in Step 1 (post-Inspect, so removed allies don't show).

**Copy format:**

> Here are the people you already selected for **{type}** support: *{list of names}*.

The **{type}** word stays colored + bold per the v5.0 color scheme (amber for practical, rose for emotional, sky for social — same treatment used elsewhere in the activity). Names render as a comma-separated list in a slightly smaller font weight than the main prompt — read-only, no tap-targets, no chips. Just a plain inline list so it reads like a refresher rather than a UI element.

**Names to use:**

- Predefined tile names from `src/lib/allyTiles.js` (e.g., "Foster Mom," "Best Friend," "Coach").
- For the two custom `other1` / `other2` tiles, use the inline-entered name the kid typed.
- Order them in the order the kid selected them (or alphabetically — judgment call; tile-registry order is fine if simpler).
- Comma-separated, with "and" before the last item if there are three or more (standard Oxford-comma style).

**Edge case — kid selected zero allies for that support type:**

If the kid picked "None of these" for the type (or somehow got to Strengthen with zero allies for it after Inspect removal), **skip the reminder line entirely**. The existing "Is there anyone else..." prompt stands on its own — no awkward "Here are the people you already selected: (none)" copy.

**Edge case — exactly one ally:**

Render the line in the singular form: *"Here is the person you already selected for {type} support: {name}."* — small grammatical concession that reads more naturally than the plural form for a list of one.

**Visual placement:**

The reminder block sits between the screen heading ("Let's strengthen your {type} support") and the existing "Is there anyone else..." question. ~16px of vertical spacing between heading and reminder, then ~12px between reminder and question. Slight slate-500 color on the reminder text so it visually demotes vs the question — it's context, not a call to action.

**Data:** no shape change. The reminder reads from the existing `allies` array, filtered by `support_types` containing the current step's type, with any `removed_via_inspect` ids excluded.

**Export pipeline:** no change. This is a display-only addition.

**Version bump:** v5.1 → **v5.2 (MINOR)** — copy/UI addition, no flow or data change. Prepend changelog: *"v5.2 — Each Strengthen screen now shows the kid which allies they already selected for that support type above the 'Is there anyone else...' prompt, so the new-name suggestion is generated against a visible reminder of the existing list."* Update `updated` to today's date.

**Approved by:** Josh, 2026-06-04, after verifying Draft 20 in the demo.

*End of Draft 23.*

---

### Draft 24 — Meet the cast fixes + /demo polish (Sam reorder, audio rename, script download, paragraph removal, title update)

Five small post-ship changes from Josh's 2026-06-04 review of the live demo. Bundle as one commit.

**Files touched:**

- `src/pages/DemoPage.jsx` (Meet the cast card-data list, Activities section, page heading)
- `/public/cast/audio/` (rename two Sam 14 mp3s)
- `/public/cast/script/` (new directory — drop the script .docx in)
- `index.html` or wherever the HTML `<title>` is set for the page (only if it's separate from the visible heading)

#### Change 1 — Card order: Sam 16 leads, then Sam 14

The current order per Draft 22 is Sam 14 → Sam 16 → Foster Mom → Foster Dad → Mrs. Johnson → Family Photo. Swap the first two so the 16-year-old (the narrator) comes before the 14-year-old (the kid he's narrating about).

**New display order:** **Sam 16 → Sam 14** → Foster Mom → Foster Dad → Mrs. Johnson → Family Photo.

Reasoning: 16yo Sam opens Holly's script with his voice-over; leading the cast preview with him matches the actual opening of the video. 14yo Sam then follows as the character the narration centers on.

#### Change 2 — Swap the two Sam 14 audio file names

The two Sam 14 audio files in `/public/cast/audio/` were misnamed during Draft 22's asset prep. Rename them so the file names match the line ordering.

**Current state (after Draft 22 shipped):**

- `sam-14-line-1.mp3` actually contains the *"You aren't my parents and you never will be."* angry line — which is **line 2** per the script.
- `sam-14-line-2.mp3` actually contains the *"How do I feel about that? I have literally no idea."* inner monologue — which is **line 1** per the script.

**Rename atomically** via a temp filename (so we don't lose either file if interrupted):

1. `mv sam-14-line-1.mp3 sam-14-line-tmp.mp3`
2. `mv sam-14-line-2.mp3 sam-14-line-1.mp3`
3. `mv sam-14-line-tmp.mp3 sam-14-line-2.mp3`

**After the swap:**

- `sam-14-line-1.mp3` → *"How do I feel about that? I have literally no idea."* (inner monologue — line 1)
- `sam-14-line-2.mp3` → *"You aren't my parents and you never will be."* (angry — line 2)

**No change to the card-data list itself.** The line text + audio path mapping per Draft 22 was correct in principle; only the underlying file *contents* didn't match the names. After the rename, the existing mapping resolves to the right audio for each line text.

#### Change 3 — Add a Script 2.0 download link under the section heading

Reviewers want to read the full script while listening to the voice samples. Add a download affordance at the top of the Meet the cast section, between the existing sub-line and the first character card.

**Asset to drop in:**

Copy `SSI Platform A/Video Content/Script 2.0.docx` → `/public/cast/script/ready-for-roots-script-v2.docx`.

(The repo-side filename is kebab-case for web safety; the user's downloaded file gets a clean display name via the `download` attribute — see below.)

**Placement:**

Inside the Meet the cast section container, between the existing sub-line (*"Preview of the cast and voice samples for Holly's video script (Script 2.0)…"*) and the first character card. ~24px of vertical spacing above and below so it has breathing room.

**Copy:**

A short prompt above the button (one line, italic, slate-500, `text-sm`):

> Want the full script while you listen? Grab it here.

Button label:

> **Download Script 2.0 (.docx)**

**Markup pattern** (Tailwind, matches existing demo CTAs):

```jsx
<a
  href="/cast/script/ready-for-roots-script-v2.docx"
  download="Ready for Roots — Script 2.0.docx"
  className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 text-sm font-semibold"
>
  <DownloadIcon className="w-4 h-4" />
  Download Script 2.0 (.docx)
</a>
```

`<DownloadIcon />` can be a lucide-react `Download` icon (the project already uses lucide-react elsewhere; if not, an inline SVG download glyph works fine).

The **`download` attribute** is the important part — it sets the saved filename so the user gets a clean `Ready for Roots — Script 2.0.docx` in their Downloads folder rather than the URL-kebab slug.

**Out of scope:** No PDF version, no inline preview, no version history. Just one .docx download. When the script revs (Script 3.0 etc.), swap the file in `/public/cast/script/` and update the button label.

#### Change 4 — Remove the "individual plan" paragraph under the Activities section

There's a paragraph currently sitting somewhere in the Activities section (likely under the section heading or below the activity cards) that previews future work on a per-youth synthesis artifact. Take it out for now — the work it describes isn't on the near-term roadmap and surfacing it on the review demo distracts reviewers from the activities themselves.

**File:** `src/pages/DemoPage.jsx` (Activities section).

**Remove this exact paragraph block** (and its surrounding spacing):

> An individual plan can be generated for each youth based on their responses across these activities — pulling forward their stuck-thought reframes, named allies, identified skills, and poem lines into a single keepsake artifact. Before I design that plan, though, I need to refine the activities above so the inputs I pull from are clinically right. Try them out and tell me what should change.

Don't replace it with anything. The Activities section heading + the activity tiles carry the page on their own.

#### Change 5 — Update the page title

The main `/demo` page title currently reads:

> Ready for Roots — Activities Testing and Data Export Demo

Change to:

> Ready for Roots — Activities Testing, Videos and Data Export Demo

Reflects the new Meet the cast / Videos section that Draft 22 added between Tests and Data export. The Oxford-comma question is intentionally skipped — leave the title with the comma after "Testing" and no comma before "and" to match Josh's exact phrasing.

**Files to update:**

- The visible page heading in `src/pages/DemoPage.jsx` (likely an `<h1>` near the top).
- The HTML document `<title>` tag — check `index.html` or wherever the document title is set for `/demo`. If it's dynamic via something like react-helmet, update there. If the title is set in a single static spot, that's the only place to change.

If both are present, make sure both match.

#### Version bump

No activity version bump (no activity changed). No `INFRASTRUCTURE.md` change-log entry — these are fixes to the just-shipped Draft 22 / `Meet the cast` section, not a new feature.

**Approved by:** Josh, 2026-06-04, after reviewing the live `/demo` Meet the cast section.

*End of Draft 24.*

-->

<!-- Drafts 18 + 19 archived below. -->

<!--

### Draft 18 — Demo polish: drop the "Three things you can do here" intro + hide the saved-output panel on Tests

Two small UI removals surfaced during Josh's 2026-05-19 demo walkthrough. Both are content/visibility removals — no logic changes, no version bumps on any activity.

#### Change 1 — Remove the "Three things you can do here" intro paragraph from /demo

**File:** `src/pages/DemoPage.jsx` (or wherever the /demo landing hero / intro block lives).

**Remove this block entirely** (the three "Test the activities / Try the pretest / Try the data export" callouts under it):

> Three things you can do here.
>
> Test the activities — launch any of the six Ready for Roots activities in isolation; nothing you enter is saved.
>
> Try the pretest — walk through the live participant-facing pretest as it'll paginate in a real session.
>
> Try the data export — download CSVs for SPSS / Excel built from a synthetic 52-participant dataset. The same export pipeline that ships your real research data produces these files.

Just delete it. Don't replace it with anything — the section headers ("Ready for Roots activities", "Ready for Roots tests", "Data export") are self-explanatory. If a one-line page subtitle is desired, leave the existing hero line as-is and let the section labels carry the structure.

#### Change 2 — Hide the saved-output JSON panel on the three Test surveys

After submitting Pretest, Posttest, or FollowUp on /demo, the confirmation currently reads:

> Thanks — your responses are saved.
> The whole payload is visible in the saved-output panel below.

…followed by a panel showing the full save payload as formatted JSON. Reviewers don't need to see this — same call as commit `583d34c` made for the `/demo/sandbox/*` activities ("hid the 'Saved Output' JSON panel from `/demo/sandbox/*`"). Apply the same pattern to the Test surveys.

**Files:** `src/activities/Pretest.jsx`, `src/activities/Posttest.jsx`, `src/activities/FollowUp.jsx` — or the shared confirmation/save component if these surveys share one. (`SurveyItems.jsx` is plausible — check there first.)

**Change:** On the post-submit confirmation screen for the three timepoint tests:

- Drop the line *"The whole payload is visible in the saved-output panel below."*
- Drop the JSON saved-output panel itself.
- Keep the simple acknowledgment line — *"Thanks — your responses are saved."* — that's enough.

The admin-side data inspection surfaces (`/admin/testing/*`, the data export demo) stay untouched. This change only affects the participant-facing confirmation screens on /demo.

#### Change 3 — Default the feedback-form submitter to "Ginny Sprang"

The persistent **Give feedback** button on /demo opens a form with a submitter dropdown (per commits `0287706` + `cdbd78c`). The current default is **Anonymous**. Josh wants the default to be **Ginny Sprang** while keeping the rest of the roster unchanged — Stephanie, Holly, Ginny, Josh, Jessica, and Anonymous all remain selectable, just the initial selection flips.

**File:** the FeedbackButton component (probably `src/components/FeedbackButton.jsx` or wherever the persistent feedback form lives — same component touched in commits `0287706` and `cdbd78c`).

**Change:** Change the initial value of the submitter selector from `"anonymous"` to `"ginny"`. No other change to the form, the roster, the edge function allow-list, the `public.feedback.submitter` CHECK constraint, or the admin labels — Anonymous stays as a valid selectable option for testers who want to submit without attribution.

**Version bump:** No activity version bumps. All three changes in Draft 18 are demo-page polish, not changes to any activity's data shape, flow, or content.

**Approved by:** Josh, 2026-05-19, after walking through the demo punch list.

*End of Draft 18.*

---

### Draft 19 — Allies / Safety Net v5.0 (major rework) + Getting Unstuck v5.2 (Pick copy edit)

Bundled because both came out of the 2026-05-18 review meeting; Allies is the big change, the Getting Unstuck Pick copy edit is one line. Ship as one commit so the team gets one stopping point.

---

#### Part A — Allies / Safety Net v4.1 → v5.0 (MAJOR)

Substantial restructure driven by Stephanie's vision for the Inspect step (transcript 2026-05-18), Holly's color-coding idea for the three support types, the new 22-tile icon set Josh delivered 2026-05-19, and the return of a Strengthen step (Part 3) that was torn down in commit `d515d0e` and is now being rebuilt from Stephanie's transcript spec.

**Files:**

- `src/activities/AlliesSafetyNet.jsx` — the activity component.
- `src/lib/allyTiles.js` — tile registry (single source of truth per commit `d515d0e`).
- `src/assets/allies/` — drop the existing 15 SVGs, replace with the 22 SVGs from `Activity ideas/safety-net-icons.zip` (2026-05-19). **Pull `sneaky-link.svg` and do not register it** — Josh's 2026-05-19 call after the meeting consensus leaned toward boyfriend/girlfriend only. Leave the file unimported.
- `src/components/TrampolineNet.jsx` — gets a small new prop for the Inspect X-out interaction.
- `src/lib/exportFlatten.js` — data shape changes ripple through here.
- `src/lib/demoDataset.js` — synthetic data regenerator.

##### A.1 — New tile registry (22 tiles)

Drop the existing 15-tile set; replace with the 22-tile set from the zip. Strip the cream background `<rect>` from each SVG before importing — same pattern as commit `70d117b` (the README in the zip even calls out *"delete the first <rect> element for a fully transparent background"*).

**Tiles** (id → display name):

| id | name |
|---|---|
| `foster-mom` | Foster Mom |
| `foster-dad` | Foster Dad |
| `bio-mom` | Biological Mom |
| `bio-dad` | Biological Dad |
| `sibling` | Sibling |
| `grandmother` | Grandmother |
| `grandfather` | Grandfather |
| `otherfam` | Other Family |
| `counselor` | School Counselor |
| `teacher` | Teacher |
| `coach` | Coach |
| `babysitter` | Babysitter |
| `neighbor` | Neighbor |
| `friend` | Friend |
| `best-friend` | Best Friend |
| `friends` | Friends (group) |
| `boyfriend` | Boyfriend |
| `girlfriend` | Girlfriend |
| `therapist` | Therapist |
| `caseworker` | Caseworker |
| `other1` | Other (custom name) |
| `other2` | Other (custom name) |

Total: 22. **Do not include `sneaky-link`.**

`other1` / `other2` retain the existing inline-text-input + cross-screen persistence behavior from commit `d515d0e`.

Grid layout stays the same pattern: 2 columns on mobile, 3 on tablet/desktop. With 22 tiles instead of 15 the kid will scroll a bit on mobile (~11 rows) — acceptable, no pagination needed.

##### A.2 — Color-coded support types

Per Holly's transcript suggestion (2026-05-18): each of the three support types gets its own color identity that persists across screens.

**Proposed colors** (Tailwind v3 native classes — Josh, push back if you want a different palette):

| Type | Heading color | Tile background tint | Transition-screen background |
|---|---|---|---|
| **Practical** | `text-amber-700` | `bg-amber-50` | `bg-amber-100` |
| **Emotional** | `text-rose-700` | `bg-rose-50` | `bg-rose-100` |
| **Social** | `text-sky-700` | `bg-sky-50` | `bg-sky-100` |

Practical stays in the platform's existing amber family (anchors the kid's familiarity with the rest of the activities). Emotional gets a soft warm rose. Social gets a cool sky-blue. All three are pale enough that the SVG tiles read cleanly on top.

Where the colors apply:

- **The word "practical" / "emotional" / "social" in screen headings** — colored + bold + larger than surrounding copy. Holly's specific ask: *"capitalized and bolded or something… maybe like each of the three different supports has a different color."*
- **The tile background tint** on the per-type selection grid — subtle, so the kid sees they're on a different screen even if they're looking at the same grid of icons.
- **The transition-screen background** (see A.3) — full color, brief moment.

##### A.3 — Transition screens between Practical → Emotional → Social

Before each of the three support-type selection screens, show a brief transition screen with the type name, a one-line definition, and a Continue button. Resolves Ginny's *"it kept having to look back and say no what why is this different than what I just did before looked kind of similar"* feedback.

**Transition copy** (matches the existing per-type definition copy, just promoted to a full screen):

- *Practical.* The people who help you with things — rides, food, getting your homework done.
- *Emotional.* The people you go to when you're upset or just need to talk.
- *Social.* The people you have fun with — hanging out, playing games, going places.

Each transition screen uses the matching color background (A.2 table). One screen, one heading, one definition, one Continue button. ~3 seconds of read time.

The intro screen for the whole activity (before Practical) explains what a safety net is and previews that they'll go through three types of support.

##### A.4 — Inspect (Part 2) — restructure per Stephanie

**Out:** the current per-ally walkthrough where each ally surfaces in a modal with the four PPT red-flag questions and Keep/Remove buttons (commit `583d34c` / `71a37e9`).

**In:** Stephanie's two-screen pattern from the transcript.

- **Screen 1 — Education.** A placeholder video block at top of the screen (Adrian to record actual content). Below it: a short summary of the four red flags as bullet copy — *"Watch out for relationships where the person usually gets you into trouble, tries to keep you from talking to or getting close to other people, frequently lies to you, or makes you feel afraid."* (Stephanie's PPT phrasing, verbatim from commit `71a37e9`.) Continue button.

  The video placeholder is a styled `<div>` with a caption like *"Video coming soon"* — Claude Code: do NOT build a player UI; just leave a structurally-positioned container with a fixed aspect ratio so Adrian's eventual video drops in cleanly.

- **Screen 2 — X-out screen.** The kid's full TrampolineNet renders as the centerpiece, same visual as v4.0. **Each ally icon gets a small × affordance overlaid in the top-right corner of its halo.** Tapping × removes that ally from the net (visual: ally fades to ~30% opacity, an X mark overlays). Tapping again restores. Below the net: a short instruction *"Tap the × on anyone you want to take out of your safety net."* and a Continue button.

  No modal, no per-ally questions, no keep/remove advisory. The kid removes whoever they decide to remove based on the educational content, full stop.

- **TrampolineNet component:** add a new `inspectMode` prop. When true, render each ally with the × overlay and handle the tap-to-toggle-remove interaction. When false, the existing v4.x behavior (just display, optional `interactive` mode for the older walkthrough) is preserved — don't delete it yet, just add the new mode alongside.

**Data shape change for Inspect:** drop per-ally `inspected` and `flags` objects. Replace with one array `removed_via_inspect: ["ally_id_1", ...]`. Keep `inspection_completed: bool` (true once the kid taps Continue on Screen 2).

##### A.5 — Strengthen (Part 3, NEW)

Rebuilt from Stephanie's transcript spec — the v1 implementation is gone (torn down in commit `d515d0e`) so this is a fresh build.

After Inspect, before Save, run the Strengthen step.

**Gap detection logic:**

After Inspect (so post-removal counts), for each support type compute the number of allies. A gap is:

- **0 allies** in a support type → complete gap
- **1 ally** in a support type → thin gap (Stephanie's *"only one person in an area"*)

(The imbalance case Stephanie raised — *"a thousand people in practical and nobody in emotional"* — is rare in practice and is covered by the 0-allies gap on the other side. Leave it for a future polish round.)

**For each gap (loop through the gap list in order Practical → Emotional → Social):**

Show one screen per gap with:

- **Header:** *"Let's strengthen your {type} support."* Colored per A.2.
- **Sub-line for 0-ally case:** *"Right now nobody is in your {type} support. Is there someone in your life who could be?"*
- **Sub-line for 1-ally case:** *"Right now you have one person in your {type} support. Is there someone else who could help out?"*
- **Suggestion chips (per Holly's transcript point):** if the kid has ≥1 ally in any OTHER support type, surface those names as quick-add chips with the prompt *"Anyone here also fit?"* — tapping a chip pre-fills the gap_filler input. Holly: *"if it was a rebalance issue, you have a lot of people in practical support. Can any of them also be play the role of emotional support?"*
- **Two text inputs:**
  - `gap_filler` — *"Who could that be?"* (max ~50 chars)
  - `action` — *"What's one thing you could do to make that happen?"* (max ~200 chars, textarea)
- **Skip button** — kid can skip a gap (we don't force engagement; respect kid agency). If skipped, both inputs save as empty strings.
- Continue button.

Action-input suggestion examples for the placeholder text: *"e.g., text them and ask if we can hang out this weekend"* or *"ask my school counselor for a recommendation."* Per Stephanie's transcript: *"reach out to them. ask one of your ask another supportive person for a recommendation."*

##### A.6 — Final Review + Save

Screen 4 — Review/Save. Single screen showing:

- Final TrampolineNet (post-removal — the version after Inspect Screen 2).
- A small list below the net summarizing kept allies grouped by support type.
- Any strengthening commitments from Part 3, rendered as "Your plan to strengthen {type} support: {action}" callouts.
- "Save as image" button (existing per commit `92bfff9`) — keep working.
- Continue/Save button.

##### A.7 — Save payload (new shape)

```js
{
  activity: "allies_safety_net",
  allies: [
    {id, name, custom, support_types: ["practical", "emotional", "social"]}, ...
  ],
  none_for: { practical: bool, emotional: bool, social: bool },
  removed_via_inspect: ["ally_id_1", ...],
  inspection_completed: bool,
  strengthened: {
    practical: { gap_filler: "...", action: "...", skipped: bool } | null,
    emotional: { gap_filler: "...", action: "...", skipped: bool } | null,
    social:    { gap_filler: "...", action: "...", skipped: bool } | null,
  },
  saved_at: "..."
}
```

`strengthened.{type}` is `null` if no gap existed for that type. If a gap existed and the kid filled it in, the inputs save. If they skipped, `skipped: true` and the inputs are empty strings.

##### A.8 — Export pipeline updates

`src/lib/exportFlatten.js` `safety_net_*` column changes:

**Drop** (no per-ally flag questions anymore):

- `safety_net_total_flags`
- `safety_net_n_trouble`
- `safety_net_n_isolate`
- `safety_net_n_lies`
- `safety_net_n_afraid`

**Keep / repurpose**:

- `safety_net_inspected_count` — total ally count BEFORE removal (just the allies-grid count)
- `safety_net_kept_count` — ally count AFTER removal
- `safety_net_removed_count` — count of `removed_via_inspect`
- `safety_net_inspection_completed` — bool

**Add for Strengthen:**

- `safety_net_strengthen_practical_filler` — text or null
- `safety_net_strengthen_practical_action` — text or null
- `safety_net_strengthen_practical_skipped` — bool or null
- ...same triple for `emotional` and `social`
- `safety_net_strengthen_gaps_count` — 0, 1, 2, or 3

##### A.9 — Demo dataset

`src/lib/demoDataset.js` regenerate `safety_net_*` synthetic data:

- ~30% of synthetic participants have at least one inspect-removal.
- ~50% have at least one Strengthen gap (1-ally case is the most common).
- Of those with a gap, ~70% fill it in, ~30% skip.
- Sample gap-filler names from a small string pool ("Aunt Tasha", "Coach Davis", "my friend Maya", etc.).

##### A.10 — Version bump

`activityVersions.js`: `allies-safety-net` v4.1 → **v5.0** (MAJOR — tile set changes, data shape changes, interaction model changes for Inspect, new Part 3). Update `updated` to today's date. Prepend changelog entry:

> v5.0 — 22-tile icon set replaces v4.x's 15-tile set (no sneaky-link). Color-coded support types (amber / rose / sky) with transition screens between Practical → Emotional → Social. Inspect (Part 2) restructured per Stephanie: educational screen with video placeholder + single X-out-on-net screen, replacing the per-ally modal walkthrough. Strengthen (Part 3) rebuilt from scratch: gap detection (0 or 1 ally in a support type), per-gap "who could that be / what could you do" prompts with same-kid ally chips as suggestions, skippable. Save payload reshaped accordingly; per-flag export columns dropped, Strengthen columns added.

---

#### Part B — Getting Unstuck v5.1 → v5.2 (MINOR copy edit)

Holly's 2026-05-18 transcript suggestion: on the Pick screen, change the framing so the "max 2" guidance is in the prompt itself rather than as a footnote.

**File:** `src/activities/GettingUnstuck.jsx`.

**Change:** On the Pick screen, the prompt above the eligible-thoughts list (currently roughly *"Pick the thoughts you'd like to work on. (You can pick up to 2.)"*) becomes:

> Pick the top two thoughts you would like to work on.

That's the only change to the screen — the max-2 cap behavior, the eligible-thoughts filter, and the non-blocking nudge on a third tap all stay as v5.0 implemented them. Just the prompt text shifts.

**Version bump:** v5.1 → v5.2 (MINOR, copy edit). Prepend changelog: *"v5.2 — Pick-screen prompt reworded to 'Pick the top two thoughts you would like to work on' (Holly's 2026-05-18 transcript suggestion)."*

---

**Approved by:** Josh, 2026-05-19, after Cowork review of the meeting transcript + new icon set.

**Out of scope for this draft:**

- Adrian's actual video content for the Inspect Part 2 educational screen — placeholder only, video drops in later.
- Adrian's video content for the Both-and strategy on Getting Unstuck (Holly raised this in the transcript; Stephanie offered to script a 1-minute version). Separate work, not blocking this draft.
- The Pretest refactor to use `SurveyItems.jsx` (still pending from Draft 16 — separate).
- The four `RSD_Flow_*.docx` files are still in the Cleanup queue, deferred until build is near-done.

*End of Draft 19.*

-->

<!--

### Draft 17 — Getting Unstuck v5.1: revert Pick threshold to ≥3

Small revert. In Draft 15 / commit `27e4d52` the Pick-screen eligibility threshold was lowered from `truth_rating ≥ 3` to `truth_rating ≥ 2` based on Stephanie's 2026-05-15 feedback that thoughts she rated "higher than a 1" weren't being pulled forward. Josh has now decided (2026-05-18) that the clinical threshold should stay at **≥ 3** — items rated below "Somewhat True" on the 0-5 anchor scale aren't endorsed strongly enough to be worth the kid's time on the Pick / Challenge / Both-and flow.

This restores the original v4.0 / v3.0 threshold. Same pattern as the Fight → Challenge boomerang in Draft 15 — Stephanie's reported expectation is being overridden by Josh's clinical-content call. The doc file `Final Measures/FollowUp Survey Draft Belongingness_5.2.26.docx` doesn't specify a Pick threshold (the FollowUp Survey just measures, doesn't pick), so this is purely an intervention-side decision.

**File:** `src/activities/GettingUnstuck.jsx`.

**Change:** In the eligibility filter that determines which appraisal items appear on the Pick screen, restore the comparison to `>= 3`. This applies identically to `a1`–`a6` and to `a_other` when present.

Affirmation-path behavior stays unchanged in spec — if no items clear the ≥ 3 threshold, the activity skips Pick and goes to the brief positive-message Save path. With ≥ 3 instead of ≥ 2, the affirmation path will be hit more often than under v5.0; that's the intended behavior, not a regression.

**Data shape:** No change. The `truth_rating` integers (0-5) saved per item are unchanged; only the eligibility comparison shifts.

**Export pipeline:** No change. `unstuck_truth_a*`, `unstuck_selected_a*`, etc. all keep their columns and value sets.

**Version bump:** v5.0 → **v5.1 (MINOR)** — single-line threshold revert, no data-shape change, no flow change. Prepend changelog entry: *"v5.1 — Reverted Pick-screen eligibility threshold from ≥2 back to ≥3 (Josh, 2026-05-18 — clinical-content call overriding the v5.0 lowering)."* Update `updated` to today's date.

**Approved by:** Josh, 2026-05-18.

*End of Draft 17.*

-->

---

### Cleanup queue — manual housekeeping (not build work)

> Lightweight to-do list for non-code cleanup that should happen before the project is considered "done." Not Claude Code drafts — these are doc-rewrites, file moves, or polish passes Josh wants to remember without making them blocking.

**Replace the four `RSD_Flow_*.docx` files with a single up-to-date flow doc.**

Status: deferred until the build is closer to done — Josh's 2026-05-18 call. Once the architecture, link-generation approach, and final activity flow are stable, write one clean flow doc (working name TBD — likely `ReadyForRoots_Participant_Flow.docx` or `Participant_Flow.docx`) that supersedes:

- `RSD_Flow_Option_A.docx` — pre-decision option (2026-05-07, superseded by Option B pick on 2026-05-08).
- `RSD_Flow_Option_B.docx` — the chosen option, but pre-rename and pre-Qualtrics-link-handoff change.
- `RSD_Participant_Flow.docx` — consolidated post-decision flow, pre-rename, pre-glossary (2026-05-08 16:06).
- `RSD_Participant_Flow_updated.docx` — same body as Participant_Flow.docx plus a 5-paragraph glossary (2026-05-08 16:15). **This is the current source of truth** until the new doc is written.

The new doc should reflect: (a) the Ready for Roots name; (b) Qualtrics-generated participant links replacing the access-code minting pattern (Josh's 2026-05-18 call — no more `RSD-XXXX-XXXX` codes); (c) the locked Final Measures (Pretest 29 / Posttest 18 / FollowUp 30 items); (d) the Questions for Guardian items in the Qualtrics consent. The PID-linking requirement (the standalone section below) is the technical companion to this flow doc.

After the new doc lands, leave the four old `RSD_Flow_*.docx` files in place as historical snapshots — they document the decision path and shouldn't be deleted, just superseded.

---

**Round 6 follow-ups (2026-06-29, from Draft 36).**

- **Color scheme review.** Adrienne would prefer the lab's usual blue/green palette over the current amber/brown. Josh's rationale (gender-neutral, less clinical, supports the tree metaphor) is sound. *(NOTE: superseded — Draft 37 ships the CTAC teal/navy/green/orange palette swap. If that's shipped, this item is resolved.)*
- **Allies single-ally visualization.** Stephanie's idea: split the empty grey area into separate visible wedges (one for social, one for emotional) so the kid sees the absence as two distinct holes rather than one continuous blank. The percentage removal (Draft 36 Part E) + the "No one named for" callout (Draft 32) probably address most of the confusion; revisit if it doesn't.

---

**Round 5 follow-ups (2026-06-18, from Draft 32).**

- **BSS sorted skills should pull forward to an action plan when that's built.** Josh's admin note on Holly's 2026-06-18 feedback expressed intent to reference the action plan in the Belonging Skills Sort closing message; deferred in Draft 32 Part C because the action plan doesn't exist yet and we don't want to repeat the false-callback anti-pattern from Draft 26. Revisit when the flow-integration draft lands (the same draft that wires Draft 21's tree-progress into the participant flow).
- **Re-check the "I need help" / "Need an example?" simplification with Stephanie at the next meeting.** Stephanie's "pick one" feedback was resolved in favor of "I need help" per Josh's 2026-06-18 call (Draft 32 Part D dropped "Need an example?"). Worth confirming with her at the next review whether the consolidated affordance reads right in action — and whether the Draft 27 alternatives content still feels sufficient as the sole help surface.

---

**Round 4 non-code todos (2026-06-08).** Items from the 2026-06-08 review meeting that are non-code, asset-production, or content-creation work — captured here so they don't fall off the radar while Draft 26 ships.

- **ElevenLabs voice re-passes (Josh).** Specific notes from the team:
  - 14yo Sam — try higher pitch / mumbly / angrier as workarounds for the platform's child-voice restriction (Ginny's suggestion). Replace clips in the demo as new versions land.
  - Foster Mom — slightly speed up delivery, but the voice itself is approved (Ginny).
  - 16yo Sam — fix pacing on two specific lines: *"I remember this moment, like, it was, yesterday"* (pauses too long) and the 14yo question *"how do I feel about that?"* (not question-y enough) (Holly).
  - Goal: take several more passes and replace the demo clips with new versions for team approval.

- ~~**New tree-progress icons (Josh providing).** The current tree gets longer at each stage but doesn't get fuller. Josh is producing a revised icon set that adds more canopy and more root variety per stage, not just length. When delivered, follow-up draft swaps the SVG assets and may tune the parametric `<TreeProgress />` component to match.~~ **DELIVERED 2026-06-08** — Claude Design produced six locked SVGs (`tree-stage-0.svg` through `tree-stage-5.svg`) at `SSI Platform A/Safety Net Exercise.zip` → `ready-for-roots-tree/`. Three-tone canopy clumps, root system densifies per stage (more laterals + sub-roots, not just longer), stage 5 adds amber + rose blossoms. Full build notes at `ready-for-roots-tree/NOTES.md`. Folded into Draft 26 Part F — Claude Code drops these into `src/assets/tree/` when Draft 26 ships.

- **Female Sam character images + voice lines.** Per the Round 4 meeting decision, the video will eventually ship in three variants — male, female, and nonbinary Sam. Female variant images (use the Character Builder prompts from `Activity ideas/Tree_Progress_Design_Prompt.md`'s sibling doc `Character_Builder_Prompts.md`) and voice lines (ElevenLabs, same script). Generate when there's time.

- **Nonbinary Sam character images + voice lines.** Same as above for the nonbinary variant.

- **Video format = 9:16 vertical.** Confirmed at the 2026-06-08 meeting. Production direction for Adrian's eventual video work — vertical mobile-first format (1080×1920 target resolution). Not a current code change; informs the eventual video container styling when real video drops in.

- ~~**Stephanie's "I need help" alternative-thought content for Getting Unstuck.** Stephanie is producing the per-appraisal-item alternative thought suggestions that the new "I need help" button will surface (per Draft 26 Part E.3). Expected end of week (2026-06-08 → ~2026-06-13). When delivered, follow-up commit swaps the placeholder strings in `src/lib/appraisals.js` for real content. No UI change needed.~~ **DELIVERED 2026-06-09** — Stephanie's `Alternative Thoughts list.docx` provided 2 Challenge + 2 Both/And alternatives per appraisal item (24 total). Live as **Draft 27** above with the strategy-aware data-shape expansion (`help_suggestions` becomes a strategy-keyed object so the panel only surfaces alternatives matching the kid's current strategy).

*End of cleanup queue.*

---

### Sam's Story — per-shot video prompt recipe (proven, 2026-06-12)

> Production reference for generating per-shot videos in Open Arts. This is **not a Claude Code draft** — it's a captured recipe Josh + Cowork follow each time we generate a new shot. Update this section as we learn more.

#### The workflow that worked (Sam Line 1, opening narrator beat)

1. **In Open Arts:** select the locked character (e.g., Sam 16) from Character Builder.
2. Click **"Create Video from character."**
3. **Upload the world reference image** for the scene (e.g., the W7 bedroom render). Open Arts uses this as the environment anchor.
4. The voice model is **already uploaded** in Open Arts (per-character) — no need to re-attach it in the prompt.
5. **Paste the per-shot prompt** (structure below).
6. Generate. If the voice fumbles a specific word, iterate with one of the fixes in *"Calibration lessons"* below.

#### Prompt structure (paste-ready template)

> **[Character]** is **[position / setting]**, **[eyeline + demeanor]**, telling a story directly to the viewer in a **[voice description]**. He says, in his **[tone descriptor]**, at an **unhurried natural conversational pace with comfortable pauses between sentences**:
>
> "**[The spoken line, with natural punctuation — commas at beats, periods between sentences. Punctuation acts as pacing cues for the voice model.]**"
>
> Camera: **[shot size]**, **[height]**, **static** (no camera movement, no pan, no push-in). Vertical 9:16 composition. **[Framing detail — what fills upper/middle/lower thirds, what's softly visible behind.]**
>
> Performance: eyes are **just slightly off-camera** — talking to a friend, not lecturing. Expression is **[adjective + adjective]** — the face of someone who **[brief emotional state]**. Mouth moves precisely in sync with the spoken line. Subtle natural motion only: small head tilts, occasional natural blinks, a quiet breath between sentences. **No big gestures, no expressive acting, no animated face.**
>
> Mood: **[warm / grounded / settled / tense / etc.]** — short descriptor.
>
> Duration: approximately **[N]** seconds, matching the natural pace of the spoken line.

#### Duration calibration

- Voice model paces ~145–160 words per minute conversationally.
- Formula: **target_seconds ≈ (word_count ÷ 150) × 60**, then round to the nearest second.
- Sam Line 1 (~40 words) → 13 seconds was the sweet spot.
- **15 seconds caused fumbles** — the voice model was stretching to fill the duration, which is when "placements" became "posations." Don't over-budget the duration; pace anchors are better than padding.

#### Calibration lessons (what we learned from Sam Line 1)

- **"unhurried natural conversational pace with comfortable pauses between sentences"** — this phrase is the pace tamer. Use it verbatim.
- **Punctuation in the spoken line is a pacing cue.** Commas at natural breath beats, periods between sentences. Don't run sentences together.
- **Static camera reads better for reflective narrator beats** than push-ins or pans. Stillness is the point — it earns the emotional weight.
- **"Just slightly off-camera" gaze** = conversational, not lecturing. Eye-to-lens reads as confrontational at this age.
- **"Subtle natural motion only / no big gestures / no expressive acting"** — without these constraints, the model adds Pixar-style emoting that breaks the grounded tone. Triple-state the restraint.
- **Mouth-sync language is worth including** — "mouth moves precisely in sync with the spoken line" — even though the model usually handles this fine, it helps when the duration is tight.

#### When a specific word fumbles

The voice model tokenizes by syllable patterns and sometimes stumbles on words with unusual stress or low-frequency phonemes (e.g., "placements" → "posations" on the first Sam Line 1 take). Two fixes:

1. **Phonetic respell in the spoken line** — e.g., `"place-ments"` (with the hyphen written into the script). The model parses the hyphen as a syllable boundary.
2. **Synonym swap** — replace the problem word with a more common synonym. *Often a free upgrade in authenticity* if the original word was off-register for the character (e.g., "placements" is case-worker language; "different homes" is what a teen would actually say). **This was the fix Josh picked for Sam Line 1.**

When in doubt, prefer the synonym swap — it usually improves the line, not just the audio.

#### What carries over between shots

When generating the next per-shot prompt (e.g., Sam Line 3, Sam Line 7), keep the **Camera / Composition / Performance / Mood / Duration** sections nearly identical for the same narrator beat type. Only swap:

- The spoken line (with new punctuation cues).
- The duration (recalibrated to new word count).
- Performance adjectives if the emotional beat shifts (e.g., a grimace moment needs different expression language than a settled-reflective one).
- The world reference image at upload time if the scene changes.

#### Locked production state to surface per-shot (from memory)

When drafting per-shot prompts, Cowork will automatically surface the right lighting variant for the scene:

- **W3 + Mrs. Johnson (Scene 7 shots)** — add a warm-light variant sentence so her presence visibly warms the cool fluorescent hallway.
- **W4 + metaphor moment (Scene 11 shots)** — add the "two warm lights coexisting" sentence (foreground stage manager's lamp + distant spotlight in a curtain gap).
- **W1 closing shot (Scene 12.2)** — swap the base afternoon light to "soft late-afternoon or weekend morning" with the mood shifted from "gently anticipatory" to "settled, easy."

(Full production-state notes in Cowork memory: `project_sams_story_production_notes.md`.)

#### What's still TBD

- Female + Nonbinary Sam character builds — voice models + Character Builder locks not yet done.
- Foster Mom / Foster Dad / Mrs. Johnson Character Builder locks — status TBD; check before drafting prompts that need them.
- W2 (cafeteria), W5 (stage with spotlight), W6 (family car interior at dusk) — generated ad-hoc per shot, not locked in World Builder (Open Arts 4-world cap).

*End of Sam's Story per-shot video recipe.*

---

### Sam's Story — voice + workflow pivot (planning, week of 2026-06-22)

> Captured from the 2026-06-18 team review. Team's verdict on the new videos: **animation lands, voices don't.** Voice quality is the #1 thing blocking the next round of Sam's Story production. Recipe in the section above stays valid for visuals/microexpressions/cinematography; what changes is the audio path and the order of operations between audio and video gen.

#### The voice problem

ElevenLabs explicitly blocks generating children's voices for child-safety reasons (per Josh's note in the 2026-06-04 team email — confirmed by direct attempts during Sam Line 1 production). The current Sam 16 voice model is the same one being used for Sam 14, which is the mismatch the team flagged. **Dr. Sprang's specific ask:** find a woman's voice in ElevenLabs that could pass for 14yo Sam. Adult women's voices that read as adolescent boys are a known workaround in voiceover work.

#### Three voice-sourcing approaches to test next week

In rough order of expected control / quality:

1. **Adult-voice that passes as younger (Sprang's ask).** Browse the ElevenLabs voice library for adult women with voices that read as 13-15 years old. Test a few candidates against Sam 14's lines. Cheapest path — uses ElevenLabs library directly, no custom voice cloning needed. Risk: even the best candidates may carry adult cadence the kid-as-character can't sell.

2. **Custom voice model from existing clips of Ella and Lilly (from prior projects).** ElevenLabs voice cloning from real recordings. Consent paths are in hand — **Ella** is a research assistant (adult, just sounds young) who can consent directly; **Lilly** is Adrienne's daughter, and Adrienne can give consent as her parent. Worth a quick check with the IRB whether voice cloning of a minor for a downstream product needs separate review beyond the original recording consent, but the people side is unblocked. Likely the most authentic option since the source audio is actual young voices — and the team-internal personal connection (Adrienne's daughter, our own RA) avoids the "we cloned a stranger's kid" surface that more arms-length cloning would have.

3. **Josh's own voice + ElevenLabs voice changer (Josh's preferred read).** Josh records his own performance of Sam's lines, then ElevenLabs voice changer transforms the timbre to a target voice model. Most controllable approach: the *performance* (cadence, emotional inflection, pacing, breath) comes from Josh, who knows exactly how the lines should be read; the *timbre* comes from the model. Can be applied to all characters (Sam 14, Sam 16, Foster Mom, Foster Dad, Mrs. Johnson) using the same pipeline. Recording in optimal conditions in Josh's office eliminates the "voice model decided to fumble" failure mode entirely. **My read: this is the strongest of the three.** Tradeoff is that finding a target timbre that reads as 14yo is still constrained by ElevenLabs' library (back to problem 1), but the *performance* is locked the way Josh wants it.

These aren't mutually exclusive. A reasonable test plan: spend a morning on (1) — fast screening of library voices — and if nothing in the library lands, pivot to (3) for the most controllable workaround.

#### Workflow pivot — speech-first, then animate

Current workflow (Lines 1 + 3): visual prompt + uploaded voice model → Open Arts generates video and voice together. Voice fumbles ("placements," "elementary") forced full video re-renders, which burned credits.

**Proposed pivot:** lock the audio first, then animate to it.

1. **Step 1 — Audio.** Generate the spoken line in ElevenLabs (whichever voice approach from above), iterate until it lands exactly as wanted (pacing, emphasis, no fumbles). Audio is then locked.
2. **Step 2 — Video.** Use Open Arts' audio-driven video generation (the "use recorded speech first" option) — upload the finalized audio + the visual prompt, Open Arts generates a video that lip-syncs to the audio.

**Why this is likely the right pivot:**

- **Decouples voice and animation.** Voice can be iterated freely in ElevenLabs without burning Open Arts credits. Animation only renders once the audio is final.
- **Likely cheaper per video.** Open Arts isn't generating audio anymore — just visual + lip-sync. Should consume fewer credits per render, though we'll need to confirm empirically on the first test.
- **Faster iteration.** Audio fumbles happen in a tool that's cheap to re-run; only locked audio reaches the video step.
- **Performance locked in.** No more voice-model surprises. What's in the audio file is what the video will speak.
- **Plays naturally with Josh's voice-changer plan.** If Josh records himself + transforms to a target voice (option 3 above), the audio is already going to be pre-recorded and exported. Speech-first video is the natural next step from that pipeline.

**Tradeoffs to watch:**

- **Lip-sync quality.** Open Arts' lip-sync to imported audio may not match the all-in-one model's audio-visual coherence. Worth A/B testing on one shot — generate the same line via current workflow and via speech-first to compare lip-sync fidelity.
- **Two-tool workflow.** Adds an explicit handoff between ElevenLabs and Open Arts. Not a real cost since Josh was using both anyway, but worth being deliberate about file management (audio output → consistent location → uploaded into Open Arts).
- **Microexpressions stay in the visual prompt.** Performance language for non-mouth motion (gaze, head tilts, blinks, restraint) still belongs in the Open Arts prompt — that part of the recipe doesn't change. Only the mouth/voice handoff moves.

#### Next-week task list (for the week of 2026-06-22)

In suggested order:

1. **Screen ElevenLabs voice library for a 14yo-passing voice.** Sprang's ask. Should take less than an hour. If a strong candidate emerges, lock it as Sam 14's voice and move on. If not, escalate to option (3).
2. **Set up the voice-changer pipeline.** If option (3) is in play: pick a target voice model in ElevenLabs, record Josh delivering one test line (probably the Sam 14 inner-monologue line: *"How do I feel about that? I have literally no idea."*), transform, and compare to the library candidates from step 1.
3. **A/B test speech-first vs all-in-one video gen.** Take one already-rendered Sam 16 shot (Line 1 is a good candidate since the team has reactions to compare against) and re-generate it via speech-first using a pre-locked audio file. Compare lip-sync quality, render credit cost, and overall feel. If speech-first holds up, all subsequent shots use it.
4. **Set up the Ella + Lilly voice clone pipeline if option (2) is in play.** Get explicit consent from Ella directly + from Adrienne for Lilly. Confirm with the IRB whether voice cloning for the deployed product needs separate review beyond the original recording consent (likely yes, given the use case is different from the original project). If clear, upload representative clips to ElevenLabs voice cloning and test against Sam 14's lines.
5. **Update the per-shot video recipe section above** with the new speech-first workflow once it's been validated. The visual prompt structure (camera / composition / performance / mood / duration) stays valid; the "voice model is already uploaded" line becomes "audio file is pre-generated and uploaded as the lip-sync target."

#### Open questions for the team meeting

- Does Sprang have a specific ElevenLabs library voice in mind already, or is she trusting Josh to screen and pick?
- Permissions/consent path for using Ella + Lilly's audio as voice-cloning training data.
- Budget for the voice-changer subscription tier if option (3) becomes the standard pipeline (ElevenLabs pricing differs by feature access).
- Whether the FollowUp video work (further Sam Line 4 — Mrs. Johnson backstage; Line 5 — metaphor closing) should wait for the voice pivot to land, or proceed in parallel with the current voice as scratch and re-voice later. *My recommendation: wait. Re-rendering the visual a second time to swap voices costs credits we should avoid.*

#### Update — 2026-06-24: option 3 lands. Brayden is the locked Sam voice.

Josh tested the voice-changer pipeline first thing this week and it landed on the first real pass. He recorded himself reading Sam's lines (using the new `Sams_Story_Script.docx` as the recording script), then ran the audio through **ElevenLabs Voice Changer** with the **Brayden** voice model as the target. Brayden's timbre lightened Josh's voice into something that reads "just about perfect" for Sam — solving both the original voice-quality complaint AND the 14-passing-voice ask in one move (the lightening makes the result read younger than the previous voice).

**What this means for the workflow going forward:**

- **Brayden is locked as the target voice for Sam** (16, and presumably 14 — pending confirmation, but the same lightened output should work for both since the voice now reads younger).
- **Option 1 (library screening for a 14-passing voice) is parked** — Brayden's lightening already does what Sprang asked for. Library screening only needs to come back if we want a *distinctly different* voice for one of the other variants (female / nonbinary Sam).
- **Option 2 (Ella + Lilly cloning) deprioritized for the active production line** — not blocked, but no longer the most efficient path now that Brayden is working. Could still be useful for variants if Brayden's vibe doesn't fit a particular character.
- **Speech-first video generation is the natural next step.** With audio now pre-recorded and finalized in ElevenLabs, we no longer need Open Arts to generate audio at all. The remaining piece is to confirm Open Arts' audio-driven video gen lip-syncs cleanly to imported audio — A/B against one already-rendered shot before committing the workflow.

**Locked production pipeline (as of 2026-06-24):**

1. Read the per-line text from `Sams_Story_Script.docx` (or per-shot subset).
2. Record audio in Josh's office (optimal conditions, full performance direction).
3. Run audio through ElevenLabs Voice Changer → Brayden model for Sam (other characters TBD as they come up).
4. Open Arts audio-driven video gen: upload the finalized audio + the visual prompt from the per-shot recipe (camera, framing, performance microexpressions, mood, duration matched to the audio).
5. Save the rendered mp4 to `Video Content/World Building/` and feed into the Meet-the-cast section via the same data shape as Draft 31.

**Recipe update needed:** the "Sam's Story — per-shot video prompt recipe" section above still references the all-in-one workflow ("voice model is already attached per-character — no need to re-attach it in the prompt"). Next time we write a per-shot prompt, the recipe should be updated to reflect the new pipeline: audio is pre-generated and uploaded as the lip-sync target; the visual prompt still carries everything except the spoken-line generation. Will do that update inline with the next per-shot prompt we draft.

**Open follow-ups:**

- Confirm Brayden works for Sam 14 as cleanly as it works for Sam 16 (probably yes given the lightening effect, but worth a sanity check on the two locked Sam 14 lines).
- A/B test speech-first vs the all-in-one workflow on one already-rendered shot to validate lip-sync quality before scaling.
- Decide whether to re-render Lines 1 + 3 with the new Brayden voice (replacing the existing aired clips), or only apply Brayden going forward and leave the existing shots as historical scratch.

*End of voice + workflow pivot planning notes (last updated 2026-06-24).*

---

### Cowork ↔ Code calibration — don't quote estimates in human-dev time (2026-06-29)

> Process lesson captured after a near-miss where Claude Cowork's time estimate for Draft 37 almost scoped the work down.

**What happened.** Draft 37 was the biggest single piece of work we'd bundled — eight parts including an app-wide palette swap, new tree SVG drop-in, new montage component, summary screen, route placeholder, and demo wiring. When Josh said *"whew that sounds like a ton of work,"* I quoted **"1.5–2 days"** as the effort estimate and suggested splitting the draft into three smaller drafts to de-risk.

Claude Code shipped the whole thing in **32 minutes** across two commits. Two orders of magnitude off.

Josh's catch: *"If I had believed you, I might not have tried to make the scope of changes happen."* That's the real cost of the miscalibration — not the inaccurate number, the **decision it almost drove.** A padded estimate that gets believed shrinks the scope of what gets attempted. Smaller drafts mean slower progress, more rounds of team review on smaller changes, and the visual brand shift would have landed across three separate commits over multiple weeks instead of in one coherent push.

**Why I was off.** Two things:

1. **Estimating in human-dev hours by default.** That's the convention from the pre-Code era of this project. Once Code became the implementer, the relevant constraint shifted — but my framing didn't update. The WORKING_NOTES Recently-shipped log makes the actual pace plain (Drafts 33 + 34 + 35 all shipped within hours on 2026-06-24; Draft 31 same-session; the pattern is unambiguous). I had the data in front of me and still anchored to a generic dev's rate.
2. **Defensive padding.** A bigger draft = more places for something to surprise. Padding the estimate covered the "what if Code hits an edge case" risk. The downside is I wasn't actually quoting effort — I was quoting a worst-case I felt comfortable defending. That's not what the question was.

**What to do going forward.** Estimates should be quoted in **Josh's constraint, not Code's.** What actually bounds the work landing isn't typing speed — it's:

- **Review time.** How long Josh needs to look at the diff or preview before merging.
- **Decision points.** Where Josh has to weigh in on a choice that wasn't pre-spec'd in the draft.
- **Team check-ins.** Where Ginny / Stephanie / Holly / Adrienne need to weigh in before something ships.
- **Architectural risk.** Is this load-bearing? Could it break the export pipeline or the locked measures? Risk maps to review time, not dev time.
- **External dependencies.** Are we waiting on assets from Claude Design, recordings, or a team meeting?

A useful estimate phrasing: *"Code should ship this fast — under an hour given the spec is precise. The thing that'll take time is your preview pass before merge, especially the audit of the curated exceptions in the palette swap."*

**Pattern check before estimating.** Before quoting time on any draft, scan Recently-shipped for the most recent comparable draft (a Round-N bundle, a copy-only change, a new-component build) and use that turnaround as the prior. Only deviate when the new draft has materially different risk shape.

**Don't dilute the draft to fit a padded estimate.** If a draft is bundled, it's bundled because the changes belong together. Suggesting a split should be driven by a real reason (independent dependencies, separate review surfaces, etc.) — not by anchoring to an inflated time estimate that suggested the bundle was risky.

**How to apply (for me, going forward):** when Josh asks how long something will take, or expresses surprise at scope, answer in terms of his review burden and decision load, not Code's dev hours. When in doubt, undersell rather than oversell — the cost of a draft taking 2x longer than estimated is much smaller than the cost of Josh scoping down work because the estimate sounded daunting.

*End of calibration note.*

---

<!--

### Draft 14 — Intervention rename: Ready! Set! Dedicate! → Ready for Roots

**Status as of 2026-05-18: Josh announced the rename.** All user-facing text on ctac.app, in documentation, and in outbound email templates needs to change. Internal code slugs, activity IDs, file names, and the repo folder name **stay as-is** to avoid massive churn. We can do an optional internal-rename pass later if Josh wants.

**Scope of this draft:** User-facing text only. Ship as one commit so the demo + admin both flip in lockstep — reviewers shouldn't see "RSD" on one screen and "Ready for Roots" on the next.

**Find-and-replace mapping (user-facing surfaces only):**

| Old | New |
|---|---|
| `Ready! Set! Dedicate!` | `Ready for Roots` |
| `Ready Set Dedicate` | `Ready for Roots` |
| `RSD` (when used as the program name, not as a code identifier) | `Ready for Roots` |

**Files to update — confirm during build by grepping the repo for the strings above:**

1. **Page titles + headers in `src/`** — Demo landing page header, admin landing page header, any `<title>` tags, hero copy on `/demo`, and any activity intro screens that mention the program by name.
2. **Activity intro copy** — Pretest intro paragraph, posttest intro, follow-up intro (the survey doc preambles all reference "this program" or "our project" rather than naming it directly, but check `src/activities/*.jsx` for any hardcoded program-name references).
3. **`README.md`** — repo readme.
4. **`CLAUDE.md`** — project memory file; update the "Project memory — SSI Platform" framing if it references the intervention by name.
5. **`INFRASTRUCTURE.md`** — change-log doc; add a new change-log entry for the rename, but also update header/intro text if it names the intervention.
6. **`STATE_OF_THE_PLATFORM.md`** — accurate-snapshot doc; update any references.
7. **`SSI_Platform_Overview.md` and `.docx`** — update both.
8. **Resend / email templates** — if any outbound emails (program invite, gift-card delivery, 90-day follow-up reminder) include the program name in subject or body, update.
9. **Gift-card flow copy** in `RSD_Completion_GiftCard_Flow.md` — update the user-facing strings inside the doc; the file name itself stays.
10. **Any other repo-root `.md` files** that mention the program by name (do a `grep -rn "Ready! Set! Dedicate"` + `grep -rn "RSD"` and audit by hand — RSD appears in code slugs and file names that should NOT change).

**What does NOT change:**

- Internal code slugs and identifiers — activity IDs (`getting-unstuck`, `allies-safety-net`, etc.) stay; any internal constant like `RSD_VERSION` (if it exists) stays.
- Repo folder name `SSI Platform A`.
- File names like `RSD_Feedback_Review_v2.xlsx`, `RSD_Flow_Option_B.md` — these are internal artifacts, not user-facing.
- Memory file names in the Cowork side (e.g., `project_rsd_*`).
- The IRB label "Belongingness SSGMI" — that's a separate study-protocol label, not the user-facing name.
- The Vercel deployment URL `ctac.app/demo` — unless Josh asks, we keep the route as-is.

**Version bump:** No activity-version bumps; this is documentation + copy only. **Do** add an entry to `INFRASTRUCTURE.md`'s change log dated today: *"Renamed intervention from Ready! Set! Dedicate! / RSD to Ready for Roots in all user-facing text. Internal code slugs and file names unchanged."*

**Open questions (build text for now, flag at the bottom of the commit message):**

- Should the demo route stay at `/demo` or change to something like `/ready-for-roots/demo`? Default: keep `/demo` until Josh says otherwise.
- Should an abbreviation be introduced (e.g., RFR)? Default: no; use the full name everywhere user-facing. Easy to add later if a need surfaces.

**Approved by:** Josh, 2026-05-18.

*End of Draft 14.*

---

### Draft 15 — Getting Unstuck v4.2: appraisal-items rebuild + final Challenge rename + threshold fix

**Status as of 2026-05-18:** The Getting Unstuck activity needs to use the **same 6 Appraisal items as the FollowUp Survey** (locked in `Final Measures/FollowUp Survey Draft Belongingness_5.2.26.docx`), drop the "how often" rating dimension, swap to a 0-5 scale with the survey's anchors, add an Other-thought addendum, fix a pull-forward threshold bug Stephanie reported, and finalize the Fight → Challenge rename (which has now boomeranged twice — Josh is committing to Challenge going forward).

**Driving feedback (oldest → newest):**

- Stephanie (2026-05-15): *"Need to discuss if we want to include 'how often do you have this thought.' I think we just ask how strongly do you believe this thought to be true for you. This also needs a middle anchor for 3 'Somewhat.'"*
- Stephanie (2026-05-15): *"There should be 6 appraisal questions."*
- Stephanie (2026-05-15): *"It did not pull forward thoughts I selected that I believed to be true — higher than a 1."*
- Ginny (in meeting, 2026-05-18): *"Is there another thought you've had that we didn't list here? If yes then question."*
- Jessica (2026-05-18, 14:45): *"What comes up for you when you ask yourself those questions? (add the word question[s])"* — small copy edit on the challenge-prompts response screen.

**File:** `src/activities/GettingUnstuck.jsx` (plus the data registry in `src/lib/`, `exportFlatten.js`, and `demoDataset.js`).

#### Change 1 — Replace the 8 stuck thoughts with the 6 locked appraisal items

The 8 thoughts (`st1`–`st8`) are out. Use these 6 items, in this order. Source: `Final Measures/FollowUp Survey Draft Belongingness_5.2.26.docx`, "Appraisals about self, others and future" section. Same wording, same scale, same anchors — this matters because we want the FollowUp Survey to read the same items at follow-up that the kid worked with during the intervention.

1. **`a1`** — I will never really feel like I belong. *(future)*
2. **`a2`** — Everyone will eventually leave me or give up on me. *(future)*
3. **`a3`** — I am not lovable. *(self)*
4. **`a4`** — No one would want me to be a part of their family. *(self)*
5. **`a5`** — I can't trust anyone. *(others)*
6. **`a6`** — My real family will be mad if I like my foster or adoptive family. *(others)*

Item IDs `a1`–`a6` (for "appraisals"). The `(future / self / others)` qualifier is for analyst context; not shown in the kid's UI.

**Implementation note:** Build the 6 items as a constant near the top of the activity component. Same data also lives in the FollowUp Survey component (Draft 16) — extract to `src/lib/appraisals.js` so it's a single source of truth and any future wording revisions only happen in one place.

#### Change 2 — Drop the "how often" scale; keep only "how strongly"

Only one rating per appraisal item. The scale is **0–5** with these anchors (the same as the FollowUp Survey):

> 0 = Not At All True · 3 = Somewhat True · 5 = Definitely True

(intermediate values 1, 2, 4 are unlabeled — pick the slider style or radio style that matches the existing pretest BHS UI for consistency).

The current activity stores frequency + believability per thought. Drop frequency entirely. Save payload keeps only the believability rating (renamed to `truth_rating` to match the new "how true" framing — or keep `belief` if that's less churn).

#### Change 3 — Lower the pull-forward threshold

Stephanie said items she rated **above 1** should carry forward to the Pick screen. The current threshold (per commit `9b841da`) is ≥3 on either scale. New rule: any item where `truth_rating ≥ 2` is eligible for the Pick screen. (On the 0-5 scale, `2` is the first rating that signals at least minimal endorsement.)

If no items clear the ≥2 threshold, the existing **affirmation path** (skip Pick, go to Save with a brief positive message) still applies — that path stays as-is.

#### Change 4 — Add the "Other thought" addendum

After the rate screen, before the pick screen, show one more rate-style screen for an optional Other thought.

**Screen copy:**

> Is there another thought you've had that we didn't list here?

Yes / No buttons. If **No**: continue to Pick.

If **Yes**: show a free-text input ("Type the thought in your own words") plus the same 0-5 scale with the same anchors. The kid rates their own thought the same way they rated the 6 listed items. After they continue, go to Pick.

The Other item gets ID `a_other` and is included in the eligibility filter using the same `truth_rating ≥ 2` rule. If the kid says No, `a_other` is absent from the save payload entirely.

#### Change 5 — Rename "Fight" → "Challenge" everywhere (final, no more reverts)

This is the third commit on this rename. Josh's 2026-05-18 decision: **Challenge stays.** Apply to:

- Strategy button label: "Fight it" → **"Challenge it"**
- Data keys: `strategy: "fight"` → `strategy: "challenge"`; allowed values `challenge | both_and`
- Response field: `fight_response` → `challenge_response`
- Export column: `unstuck_n_fight` → `unstuck_n_challenge`
- `demoDataset.js` synthetic data uses `strategy: "challenge"`
- Any UI copy that says "fight" in user-visible text

The three challenge-prompt scaffolding lines above the response field (from Stephanie's PPT slide 12) stay:

> - Is there another way I can think about this?
> - Is this really true, or can I think of a way it isn't true?
> - Is this thought helping me, and if not, what is a thought that might be more helpful?

#### Change 6 — Jessica's copy edit

On the screen above the response field, the prompt currently reads (roughly): *"What comes up for you when you ask yourself those?"* Update to:

> What comes up for you when you ask yourself those questions?

(add the word "questions" — Jessica's 2026-05-18 14:45 submission).

#### Change 7 — Data shape and export pipeline

The new save payload shape (replacing the v4.0/v3.0 shape):

```js
{
  activity: "getting_unstuck",
  appraisals: {
    a1: { truth_rating: 0..5, selected: bool, strategy?: "challenge"|"both_and", response?: "..." },
    a2: { ... },
    // ...a6
    a_other?: { text: "...", truth_rating: 0..5, selected: bool, strategy?: ..., response?: ... }
  },
  saved_at: "..."
}
```

`exportFlatten.js` updates:

- Drop `unstuck_freq_st1..st8` columns entirely.
- Replace `unstuck_belief_st1..st8` with `unstuck_truth_a1..a6` (and `unstuck_truth_a_other` when present, else null).
- `unstuck_selected_a1..a6` (binary 0/1).
- `unstuck_strategy_a1..a6` (`challenge` | `both_and` | null).
- `unstuck_response_a1..a6` (free text).
- `unstuck_n_challenge`, `unstuck_n_both_and` (counts).
- For `a_other`: add `unstuck_other_text` (free text of the kid's own thought) alongside the per-item columns above.

`demoDataset.js`: regenerate synthetic data using `a1..a6` IDs and `truth_rating: 0..5`. Roughly ~30% of synthetic responses include a non-empty `a_other`. Strategy distribution: ~60% `challenge`, ~40% `both_and`.

`src/lib/appraisals.js` (new shared module): exports the 6 appraisal items, IDs `a1`–`a6`, with `text` and `dimension` (`future` | `self` | `others`) fields. Both `GettingUnstuck.jsx` and the FollowUp Survey (Draft 16) import from here.

#### Change 8 — Version bump

`belonging-skills-sort` analog: `getting-unstuck` from v4.0 (current) → v4.2 (skipping 4.1, since the change is structural enough to warrant a MINOR-after-MAJOR jump but doesn't introduce a wholly new flow — keeps the v4.x family).

Actually — bump to **v5.0 (MAJOR)** since the item set is new, the scale changed (1-5 → 0-5), and the column registry is reshaped. Prepend a changelog entry: *"v5.0 — Replaced 8 stuck thoughts with 6 locked appraisal items from the FollowUp Survey; dropped 'how often' rating dimension; scale moved to 0-5 with Not At All / Somewhat / Definitely True anchors; threshold for Pick eligibility lowered to ≥2; added optional Other thought addendum; Fight → Challenge rename finalized; copy edit on challenge-prompt question screen."* Update `updated` to today's date.

**Approved by:** Josh, 2026-05-18.

*End of Draft 15.*

---

### Draft 16 — Posttest + FollowUp Survey build (paginated sandbox + admin entries)

**Status as of 2026-05-18:** The locked Posttest (18 items) and FollowUp Survey (30 items) docs are in `Final Measures/`. Build both as paginated sandbox activities mirroring the live participant flow, same pattern as `Pretest.jsx` (commit `aa94130`). Ship as one commit so /demo gains both new "Tests" entries together.

**Source docs:**

- `Final Measures/Posttest Draft Belongingness_5.2.26.docx`
- `Final Measures/FollowUp Survey Draft Belongingness_5.2.26.docx`

Both share scales with the Pretest where item wording and anchors are identical — keep them identical so within-subject change scores at pre/post and pre/follow-up are valid. **Do not paraphrase** any item text or scale anchor — this is psychometric content.

#### Component 1 — Posttest (18 items)

**File:** `src/activities/Posttest.jsx` (new).

**Intro paragraph (verbatim from the doc):**

> Thank you for your participation in this program! Now, we would like to ask you some questions about what you are thinking and feeling right now. Some of these questions will be the same as questions you answered at the start of this of the program, but others will be different. If you experience feelings of distress, please tell your caregiver or you can email us at sprang@uky.edu. Your experiences are very important to us!

**Item sections (in order):**

1. **Beck Hopelessness Scale** (4 items, identical to pretest BHS, scale 0-3: Absolutely disagree, Somewhat disagree, Somewhat agree, Absolutely agree).
2. **Adolescent Sense of Control Scale** (3 items, identical to pretest ASCS, scale 1-5: Never, Rarely, Sometimes, Often, Always).
3. **Need to Belong Scale** (3 items, identical to pretest NB, scale 1-5: Strongly disagree → Strongly agree).
4. **Belonging (2 items)** (slider 0-10, identical to pretest; same skip logic — if Q1 = 0, Q2 is hidden and `post_bw_2` saves as null).
5. **Perceived helpfulness of program** (1 item, slider 1-10, anchors "Not at all / Somewhat / Very Much"). The wording differs from pretest's expectation item:

   > At this point, how helpful has this program been for helping you feel close to your family and friends?

   (Pretest asks "how helpful do you think this program *will be*"; posttest asks "how helpful *has this program been*." Match the pretest item's `pre_pe_1` column with `post_pe_1`.)

6. **Program Feedback Scale: Acceptability (5 items, NEW)** — first time on the platform.

   Scale for items 1-3 (Likert): 0-4 — Really Disagree, Disagree, Neither Agree nor Disagree, Agree, Really Agree.

   1. I enjoyed the program.
   2. I understood the program.
   3. I would recommend this program to other kids my age.

   Items 4-5 are open-response (textarea, no character limit):

   4. What did you like about the program? Please share as many true thoughts and feelings as you would like.
   5. What would you change about the program? Please share as many true thoughts and feelings as you would like.

**Column-name plan** (`post_*` prefix, following Jessica's locked convention):

- `post_bhs_1..4`, `post_bhs_score`
- `post_ascs_1..3`, `post_ascs_score`
- `post_nb_1..3`, `post_nb_score`
- `post_bw_1`, `post_bw_2` (null when Q1 = 0)
- `post_pe_1` (perceived helpfulness)
- `post_pf_1..3` (program feedback Likert), `post_pf_score`
- `post_pf_open_like` (text), `post_pf_open_change` (text)

Register `pf` in `SCALE_ABBREVIATIONS` in `exportFlatten.js`.

**Save payload shape:** flat, keyed by SPSS column names (same pattern as `Pretest.jsx`). No nested objects.

#### Component 2 — FollowUp Survey (30 items)

**File:** `src/activities/FollowUp.jsx` (new).

**Intro paragraph (verbatim):**

> Thanks for participating in our program about 3 months ago. To better understand the helpfulness of this program to you and how you are thinking and feeling right now, we would like to ask you some questions. Some of these questions will be the same as questions you answered at the start of this of the program, but others will be different. When you complete this short survey, you will receive another $25 gift card to thank you for your time. If you experience feelings of distress when answering these questions, please tell your caregiver or you can email us at sprang@uky.edu.

**Item sections (in order):**

1. **Beck Hopelessness Scale** (4 items, identical wording).
2. **Adolescent Sense of Control Scale** (3 items, identical wording).
3. **UCLA 3-Item Loneliness Scale** (3 items, identical to pretest UCLA, scale 1-3: Hardly ever, Some of the time, Often).
4. **Need to Belong Scale** (3 items, identical wording).
5. **Belonging Promoting Behaviors** (7 items, identical to pretest BPB, scale 0-3: Never, Sometimes, Often, Always).
6. **Appraisals about self, others and future (6 items)** — **import from `src/lib/appraisals.js`** (the shared module created in Draft 15). Scale 0-5 with anchors Not At All True / Somewhat True / Definitely True. Same item set, same wording.
7. **Belonging (2 items)** (same slider + skip logic as pretest/posttest).
8. **Permanency (1 item, NEW)** — single-select radio with 4 options + Other (free text):

   > Since you completed the Belonging course have you (please select one of the following):
   > - Remained in the same home
   > - Moved to a new foster home
   > - Returned to live with birth family
   > - Other: (please specify)

   Selecting "Other" reveals a text input.

9. **Placement Disruption Worry (1 item, NEW)** — scale 0-4: Not at all, A little, Somewhat, Very, Extremely.

   > How worried are you right now that this placement will change?

**Column-name plan** (`fu_*` prefix):

- `fu_bhs_1..4`, `fu_bhs_score`
- `fu_ascs_1..3`, `fu_ascs_score`
- `fu_ucla_1..3`, `fu_ucla_score`
- `fu_nb_1..3`, `fu_nb_score`
- `fu_bpb_1..7`, `fu_bpb_score`
- `fu_app_1..6`, `fu_app_score` (register `app` in `SCALE_ABBREVIATIONS` — this column is shared between FollowUp's appraisals section and Getting Unstuck's truth-rating data, so the convention has to match)
- `fu_bw_1`, `fu_bw_2`
- `fu_permanency` (string enum: `same_home` | `new_foster` | `birth_family` | `other`), `fu_permanency_other` (text, populated only when `fu_permanency = "other"`)
- `fu_disruption_worry` (0-4 integer)

#### Wiring + demo entries

- Register both in `TEST_REGISTRY` under the "RSD test" category (or rename that category to "Ready for Roots test" if Draft 14 has shipped first; if Drafts 14 and 16 ship in the same session, do them in 14 → 16 order so the category name is already updated).
- Add `posttest` and `followup` entries to `src/lib/activityVersions.js` at v1.0 each. `updated` = today.
- Add demo entries to `/demo` under the "Tests" section (same pattern as the Pretest entry).
- `demoDataset.js` generates synthetic posttest + followup rows. Distributions: psychometric scales drift slightly relative to pretest (e.g., mean BHS at posttest ≈ pretest - 0.3 with noise); permanency distribution roughly 70/15/10/5 (same_home / new_foster / birth_family / other); disruption_worry roughly normal around 1.

#### Pagination + UX consistency

- Same `<ScreenSliderQuestion>` / `<ScreenLikertGrid>` (or equivalent components used in `Pretest.jsx`) for visual consistency.
- Progress strip up top.
- Back button on every screen.
- Sliders require explicit drag/tap before counting as answered (per the pretest precedent).
- Mobile-first responsive layout; same amber/slate palette.

#### Version bump

Both activities at v1.0 (new). No bump for Getting Unstuck or Pretest here — those are separate concerns.

**Approved by:** Josh, 2026-05-18.

**Open questions (build text for now, flag at the bottom of the commit message):**

- The Posttest doesn't include UCLA or BPB but the Pretest and FollowUp do. This is an intentional design choice per the locked docs; flag for Jessica to confirm at next data-review.
- `post_pf_open_like` and `post_pf_open_change` are unbounded free text — set a reasonable maxlength (~2000 chars) in the textarea component to prevent abuse without limiting genuine responses.

*End of Draft 16.*

-->

<!--

### Draft 12 — Belonging Skills Sort v3.0: visual buckets + ghost-chip drag + Not Interested bucket + remove-from-bucket

Five converging pieces of feedback from the 2026-05-18 review meeting + the 20 minutes of submissions immediately before it. All five resolve into one coherent rebuild of the placement interaction; ship as a single v3.0 commit.

**Driving feedback (verbatim, oldest → newest):**

- Stephanie (2026-05-15): *"I can't drag responses straight into the 'what I'm already doing box.'"*
- Stephanie (2026-05-15): *"Do we need a third option for if they are not doing it currently and not willing to try it?"*
- Holly (2026-05-18, 14:48): *"Is it possible for you to select a skill and actually 'drag' it with your mouse? Like, you would be able to see the text moving towards the box you want to put it in."*
- Ginny (2026-05-18, 14:57, anonymous): *"We call these buckets — can the spaces where we drag things look like buckets?"*
- Jessica (2026-05-18, 14:58): *"If they accidentally drag an option, then change their mind, can they delete it or do they have to reset the whole page?"*

The team aligned on a single direction in the meeting: replace the existing drop-zone-plus-tap interaction with a real drag-and-drop into visually rendered buckets, with a third "Not Interested" bucket and a way to remove items after placement.

**File:** `src/activities/BelongingSkillsSort.jsx` (plus the skill registry in `src/lib/` if there's a separate data file — confirm at build time).

---

#### Change 1 — Visual bucket graphics replacing the drop zones

Render each category as an illustrated bucket — not a labeled rectangle. A simple trapezoidal bucket SVG with a handle reads as a bucket to a teen at first glance; CSS rectangles do not. Single reusable SVG component takes a `label` prop and a `color` prop.

Three buckets, displayed side-by-side on desktop and stacked vertically on mobile (the existing breakpoint pattern in the activity is fine):

1. **What I'm already doing** — amber-300 fill, amber-500 outline
2. **What I'm willing to try** — amber-300 fill, amber-500 outline
3. **Not interested right now** — amber-300 fill, amber-500 outline

**Equal styling on purpose.** Resist the temptation to grey out or desaturate the Not Interested bucket. Visual hierarchy that demotes it implies the kid should feel bad for picking it; the whole point of adding the bucket is to legitimize "not for me" as a valid answer.

The bucket label sits above the bucket. Placed skill cards stack inside the bucket (clipped to the bucket's inner area, scrollable if more than ~3 stack up — though with only 7 skills total this should be rare).

#### Change 2 — Add the "Not Interested" bucket as a third category

The current data shape has `already_doing`, `willing_to_try`, and `unplaced` arrays. Add a fourth array: `not_interested`. The kid starts with all 7 skills in `unplaced` and ends with each skill in exactly one of the three placement arrays (or remaining in `unplaced` if they skip — same as today).

**New save shape:**

```js
{
  activity: "belonging_skills_sort",
  already_doing: ["bs4"],
  willing_to_try: ["bs7"],
  not_interested: ["bs2"],
  unplaced: ["bs1", "bs3", "bs5", "bs6"],
  saved_at: "2026-05-18T..."
}
```

`unplaced` stays in the payload so we can distinguish "kid didn't engage with this skill" from "kid actively chose Not Interested." That's the whole reason for adding the bucket — preserve the signal.

#### Change 3 — Real drag with a ghost-chip visual

Replace the current placement interaction with pointer-events-based drag-and-drop using a floating ghost chip that follows the cursor or finger. This addresses Holly's "I want to see the text moving" directly.

**Interaction model:**

1. **Pointer-down on a skill card** in the unplaced list: card scales up slightly (Tailwind `scale-105`), gains an amber-500 ring (`ring-2 ring-amber-500`), and a drop shadow lifts it visually (`shadow-lg`). Original card stays in place but dims to ~40% opacity (`opacity-40`) so the kid sees where they picked it up from.

2. **A ghost chip lifts off and follows the pointer.** The chip is a small rounded pill (~120-160px wide, ~36-44px tall) showing the skill number badge ("1", "2", …) plus the first ~30 chars of the label with ellipsis. Don't try to drag the full sentence — labels are long enough that a full-card ghost would cover half the screen on mobile.

3. **On mobile, offset the ghost chip ~32px above the finger** so the thumb doesn't cover it. On desktop, anchor the chip slightly above-right of the cursor (~12px offset).

4. **Pointer-move** updates the chip position. While the pointer is over a valid bucket, that bucket gets an amber-200 glow (`ring-4 ring-amber-200 ring-offset-2`) and the chip itself adds a subtle scale-up to confirm "ready to drop here."

5. **Pointer-up over a bucket**: ghost chip animates with an arc-into-bucket motion (~250ms, ease-out) and "settles" into the bucket's inner area as the real placed card. The original card removes from the unplaced list. The arc gives even quick-release users (touch users especially) the visual reinforcement that the skill traveled.

6. **Pointer-up outside any bucket**: ghost chip springs back to the origin position with a quick bounce (~200ms) and the original card returns to full opacity. No placement happens.

**Use `pointerdown` / `pointermove` / `pointerup` events**, not HTML5 `dragstart`/`dragover`/`drop`. HTML5 drag-and-drop has effectively no touch support across browsers and the ghost image is browser-controlled. Pointer events work uniformly on mouse, touch, and pen.

**Cursor states**: `cursor-grab` on hover, `cursor-grabbing` while dragging.

#### Change 4 — Remove items from buckets

Placed cards inside a bucket show a small × button in the top-right corner (Tailwind: `absolute top-1 right-1 w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 text-slate-600 text-xs flex items-center justify-center`). Tapping × returns the skill to the unplaced list (moves it from whatever category it's in back to `unplaced`).

The × is the primary removal affordance. **Do not** also support "drag the placed card out of the bucket back to unplaced" — the × is a one-tap escape hatch and a different intent (correcting a mistake) than drag (sorting). Keep the interaction model simple: drag to place, × to remove.

#### Change 5 — Keyboard + screen-reader accessibility

Pointer events alone aren't accessible. Add a keyboard fallback:

- Tab into the unplaced list. Arrow keys navigate between skill cards. Each card has an aria-label like "Skill 1: Pay close attention when someone is talking to you."
- Space or Enter "picks up" the focused skill — same visual state as pointer-down (ring, shadow, dimmed original). Focus moves to the first bucket. An aria-live region announces "Skill 1 picked up. Choose a bucket: Already doing, Willing to try, Not interested right now."
- Arrow keys cycle between the three buckets. Space or Enter drops the skill into the focused bucket. Aria-live announces "Skill 1 placed in Already doing."
- Escape cancels the pickup and returns focus to the original card.
- Tab into a placed card focuses the × button; Space/Enter removes.

#### Change 6 — Export pipeline updates

`src/lib/exportFlatten.js` currently emits `sort_*` columns derived from the three-array shape. Add columns for `not_interested`:

- `sort_not_interested_count` — integer count of items in `not_interested`
- `sort_not_interested_<skill_id>` — per-skill binary (1 if placed there, 0 otherwise), matching the existing per-skill column pattern for `already_doing` and `willing_to_try` if that pattern exists; otherwise just emit the count.

Verify the existing convention by reading the current emission code — match it. If `unplaced` currently doesn't get its own count column, leave that as-is.

`src/lib/demoDataset.js` synthetic data generator needs updated probabilities so that each of the 7 skills has ~25% chance of `already_doing`, ~25% `willing_to_try`, ~15% `not_interested`, ~35% `unplaced` — adjust to a reasonable distribution, doesn't need to be precise.

#### Change 7 — Version bump

`src/lib/activityVersions.js`: bump `belonging-skills-sort` from v2.0 to v3.0 (MAJOR — new bucket, new data shape, new interaction model). Update `updated` to today's date. Prepend a one-line changelog entry:

> v3.0 — Visual bucket graphics replace drop zones; added "Not interested right now" as a third placement bucket; rebuilt placement as pointer-event drag with a ghost-chip follower and arc-into-bucket animation; placed cards have an × remove button; keyboard + screen-reader accessibility added.

---

**Out of scope for this draft:**

- The bs1-bs7 skill labels themselves don't change. The 7 Belonging Promoting Behaviors items from the locked pretest doc (set in commit `7b7046e`, Draft 3) stay.
- Hover/tap-define tooltips on each skill (the "?" affordance) stay. They should continue to work in the unplaced list; consider whether they should also work on placed cards inside a bucket (probably yes, but small — the kid may want to re-read a definition before deciding to remove).
- The activity-completion criteria (when "Continue" enables) stays the same as today.

**Approved by:** Josh, 2026-05-18, in Cowork session reviewing the 2026-05-18 meeting feedback.

*End of Draft 12.*

---

### Draft 13 — Small-copy bundle: Letter to Another Youth v2.1 + Who I Am Poem v2.3

Two unrelated small copy changes from the 2026-05-18 review meeting. Both are one-line edits with no data-shape implications; ship as a single commit so the team sees one stopping point rather than two micro-pushes.

#### Change 1 — Letter to Another Youth v2.1: new instruction copy

**Driving feedback:** Stephanie (2026-05-15): *"Instead of 'another teen starting where you are' would we want to say maybe another teen in out of home care that doesn't feel like they fit in or belong? something like that?"*

The current context line above the textarea (set in commit `7b7046e`, Draft 4) reads roughly: *"Write a letter to another teen who is starting where you are now. What do you want them to know?"* The framing of "starting where you are now" is too vague — the recipient isn't anchored in the same emotional state the kid is being asked to write to. Stephanie's reframe lands on the actual recipient: another teen who doesn't feel like they belong.

**File:** `src/activities/LetterBuilder.jsx`

**Change:** Replace the existing context line above the textarea with:

> What you would want to say to another teen who feels like they don't belong.

This becomes the entire instruction line above the textarea. Don't keep the "Write a letter…" wrapper — the new line is the prompt. Tone is intentionally direct ("you would want to say") rather than instructional ("write a letter to…") so the kid is composing in their own voice rather than performing the task of letter-writing.

Keep any small "optional" example block outside the textarea as-is if one exists from v2.0. If none exists, don't add one.

**Version bump:** v2.0 → v2.1 (MINOR, copy change). Prepend changelog entry: *"Replaced context line above the textarea with Stephanie's reframe — 'What you would want to say to another teen who feels like they don't belong.'"* Update `updated` to today's date.

**No data-shape changes.** Save payload `{ letter: "<full text>", saved_at: "..." }` unchanged.

#### Change 2 — Who I Am Poem v2.3: auto-title the output "Who I Am"

**Driving feedback:** Stephanie (2026-05-15): *"It would be nice to give this a title to replace 'Your Poem.'"* Confirmed in the 2026-05-18 meeting: title the output **"Who I Am"** (matches the activity name itself, which is the natural read).

**File:** `src/activities/WhoIAmPoem.jsx` — and the keepsake-card builder used by `downloadSvgStringAsPng` (per commit `92bfff9`, the SVG keepsake card was added there; check `src/lib/imageDownload.js` if the title lives there instead).

**Change:** Wherever the finished poem is displayed (the on-screen amber card after the kid submits, AND the downloadable PNG keepsake card) — replace the title text **"Your Poem"** with **"Who I Am."** Both surfaces should match; the keepsake-card SVG is built to mirror the on-screen card per the v2.1 spec, so updating both at once preserves that invariant.

The "SSI Platform · date" footer on the keepsake card stays as-is.

If the title currently lives as a single string constant near the top of the component or in the SVG builder, this is a one-line edit. If there are two separate hardcoded strings (one for the card, one for the SVG), update both.

**Version bump:** v2.2 → v2.3 (MINOR, copy change). Prepend changelog entry: *"Auto-titled the finished-poem card and keepsake-image PNG 'Who I Am' (replacing 'Your Poem')."* Update `updated` to today's date.

**No data-shape changes.** Save payload unchanged.

---

**Approved by:** Josh, 2026-05-18, in Cowork session reviewing the 2026-05-18 meeting feedback.

**Out of scope for this draft:**

- Allies / Safety Net icon additions (Boyfriend/Girlfriend, multi-friend redesign, split parent/grandparent tiles, possibly foster sibling) are parked — Josh is preparing those icons himself before that draft goes to Claude Code.
- The Getting Unstuck v4.2 changes (drop "how often", add the six locked appraisal items + 0-5 anchor scale, add "Other thought" option, rename Fight → Challenge yet again, Jessica's "add the word questions" copy edit, fix the pull-forward threshold bug) will follow as Draft 14.

*End of Draft 13.*

-->

---

### Pending requirement — PID linking between Qualtrics consent and ctac.app surveys

**Status:** Not a ready-to-ship prompt yet — captured here so it isn't forgotten when the Qualtrics consent build kicks off. This requirement is part of the IRB protocol (per the wording Josh sent Jessica on 2026-05-18 for the Description of Research Procedures), so it has to be in place before the first real participant goes through.

**Background.** The RSD study links the caregiver consent (collected in Qualtrics) to all child-facing surveys (assent, pretest, intervention activities, posttest, 90-day follow-up — all in ctac.app) via a Participant ID (PID). The child's name is never collected by ctac.app. The IRB language Josh proposed:

> A random alphanumeric PID is generated at the time of consent that contains no identifying information (no name, no date of birth, no email). The PID is passed to ctac.app as a URL parameter in the program link sent to the caregiver's email, and ctac.app stores all subsequent child-facing data keyed only by that PID. The caregiver's email address is required only to deliver the program link, the 90-day follow-up link, and the e-gift-card incentives; it is stored in a separate access-controlled table, not co-located with the child's response data.

**Build requirements (must be in place before first real participant):**

1. **PID generation.** Decide on Qualtrics' built-in `ResponseID` vs. a custom random PID stored as embedded data. Awaiting Jessica's preference — either works for the IRB. If we go custom, generate in Qualtrics with a JS embedded-data block (e.g., 12-char base32) so the PID is fixed at consent time.

2. **PID handoff to ctac.app.** The intervention link emailed from Qualtrics must include the PID as a URL parameter (e.g., `https://ctac.app/start?pid=ABC123XYZ`). ctac.app reads the PID on entry and stamps every saved row (assent, pretest, activity payloads, posttest) with it. Same mechanism for the 90-day follow-up link.

3. **Participants table in Supabase.** New `public.participants` table holding `(pid PRIMARY KEY, caregiver_email, consent_date, follow_up_due_date, follow_up_sent_at, completed_at)`. RLS-locked so it's accessible only to designated research personnel — no `anon` grants, only `service_role` / `authenticated` admins. This is the linking table; it lives separate from the response tables.

4. **Response tables stamped with PID.** Wherever child-facing data is currently saved (`assents`, `pretest_responses`, `activity_saves`, `posttest_responses`, `follow_up_responses` — exact table names per current schema), each row needs a `pid` column. Existing demo data may need a backfill or just left as null (demo-only). Decide based on schema state at build time.

5. **Child name never collected.** Audit all ctac.app screens to confirm no name-entry field for the kid. The "Other (custom)" ally tile names in Safety Net are fine — those are ally names, not the kid's name — but worth a sanity check on whatever copy currently asks for input.

6. **90-day follow-up scheduling.** A scheduled job (Supabase edge function on cron, or Resend-side schedule) reads from `participants` where `follow_up_due_date <= now()` AND `follow_up_sent_at IS NULL`, sends the follow-up email with the PID-stamped link, and marks `follow_up_sent_at`. Same gift-card workflow on completion of the follow-up survey.

**Supabase migration note.** Per CLAUDE.md, new public-schema tables created after 2026-10-30 need explicit Data API grants alongside RLS. The `participants` table is RLS-locked to admins only — `anon` gets no grants, `authenticated` gets nothing (RLS-policed), `service_role` gets full CRUD for the scheduled job.

**Questions to ask the caregiver inside the Qualtrics consent survey:**

Source: `Final Measures/Questions for Guardian.docx` (locked 2026-05-18).

1. Child first and last name (collected in Qualtrics only — never passed to ctac.app)
2. Caregiver first and last name
3. Caregiver email (collected twice with a "must match" validator — used for program-link delivery, follow-up reminder, gift cards)
4. Placement type — single-select: Foster care (non-relative) · Concurrent placement (foster/adoptive) · Relative caregiver · Other (specify)
5. County of residence (free text)

These five items live entirely in Qualtrics and never reach ctac.app. The bridge to ctac.app is the PID + caregiver email pair stored in the `participants` table per item 3 above. Placement type and county should be stored as embedded data in Qualtrics so they're exportable in the same SPSS bundle as the consent ResponseID.

**Open before build:**
- Jessica's preference on PID source (`ResponseID` vs custom random).
- Whether the gift-card-sending workflow is already wired up or needs to be part of this build.
- Coordination with whoever sets up the Qualtrics consent (likely Jessica or Adrienne) so the URL-parameter handoff is in place on both sides.
- Where (if anywhere) the placement-type and county fields surface in analysis — they're collected in consent but may also be useful as covariates in the child-facing data analysis. Decide whether to mirror those two fields into the ctac.app `participants` table at consent time, or just leave them in Qualtrics.

*End of pending requirement. When the Qualtrics consent build begins, this draft can be refined into a ready-to-ship implementation prompt.*

<!--

### Draft 11 — Revert Safety Net Inspect questions to Stephanie's PPT originals

Small copy revert. In commit `70d117b` (Draft 9) I reworded Stephanie's four PPT red-flag questions in the Safety Net Inspect modal — softened "usually" to "sometimes," added a "who care about you" qualifier to the isolation question, restructured the afraid-of question. The rewording wasn't driven by team feedback (Holly's clinical-safety concern was about the *keep/remove framing*, not the question wording itself); it was my judgment call about kid-friendly phrasing for clinical content Stephanie wrote. Josh decided 2026-05-12: restore Stephanie's wording as written.

**File:** `src/activities/AlliesSafetyNet.jsx` — find the four inspect-modal question strings and revert.

**Restore to these exact strings** (preserving the per-ally Yes / No / Not sure answer scheme):

1. *Does [name] usually get you into trouble?*
2. *Does [name] try to keep you from talking to or getting close to other people?*
3. *Does [name] frequently lie to you?*
4. *Do you feel afraid of [name]?*

Where `[name]` is the runtime substitution of the ally's display name (existing pattern in the code — don't change the substitution mechanism, just the question template strings).

The question framing notes from Slide 4 of Stephanie's PowerPoint:
- The PPT phrasing was a descriptive list under *"Is there anyone in your net that:"* — these are the bullets cast as per-ally yes/no questions, which is the natural modal form. Question 4's pronoun flips because the original is framed from the kid's perspective ("you feel afraid of"), not the ally's behavior.

**Version bump:** v4.0 → v4.1 (MINOR, copy revert). Prepend changelog entry: "Reverted inspect-modal question wording to Stephanie's PPT originals."

**No data-shape changes.** The `flags` keys (`trouble`, `isolate`, `lies`, `afraid`) and the Yes/No/Not sure value set are unchanged. Export columns unchanged.

*End of Draft 11.*

-->

<!--

### Draft 10 — 2026-05-11 evening revisions (Self-Reflection revert + Poem example removal + Getting Unstuck sequence change)

Three small-to-medium revisions to activities that shipped earlier today. Bundle as one commit.

#### Change 1 — Self-Reflection: revert exclusion prompt to original

In commit `7b7046e` Draft 1 we changed the exclusion prompt to *"Now think of a time someone made you feel like you did not belong."* That change should have gone past Ginny (who has final-word UX authority) and didn't. Revert it.

**File:** `src/activities/SelfReflection.jsx`

**Change:** Revert the exclusion prompt to its previous wording:

> Now think of a time you felt excluded — a time you felt like you did not belong.

The inclusion prompt stays as-is. This is the only change.

**Version bump:** v1.1 → v1.2 (MINOR, copy revert). Prepend changelog entry noting the revert and that Holly's reframe proposal is moved to team-level design discussion.

#### Change 2 — Who I Am Poem: remove the worked example

Draft 2 added a brief worked example of a finished poem before the input form. Take it back out.

**File:** `src/activities/WhoIAmPoem.jsx`

**Change:** Remove the example block entirely. Don't replace it with anything — the activity starts directly with the input form.

**Version bump:** v2.0 → v2.1 (MINOR, content removal). Prepend changelog entry: "Removed worked example before input form."

#### Change 3 — Getting Unstuck: separate rating from selection

In Draft 5 each thought had a 5-point appraisal scale plus an inline "I want to work on this" button that appeared when the thought met the eligibility threshold (freq ≥3 OR belief ≥3 on either scale). The kid rated AND chose what to work on in the same step. Restructure into two distinct steps.

**File:** `src/activities/GettingUnstuck.jsx`

**New flow:**

1. **Rate screen** (existing, modified). Show all 8 thoughts with the 5-point frequency + believability scales per thought. Below the list: a single primary **"Keep going"** button. **Remove the per-thought "I want to work on this" button entirely.**

2. **Pick screen** (new). Filter to thoughts where the kid rated ≥3 on EITHER frequency OR believability — same eligibility criteria as the previous build. Show those eligible thoughts as selectable cards. Header: *"Which of these thoughts would you like to work on?"* Subhead: *"Pick one or two."* Cards are tappable; selection limit is 2. Trying to select a third gently nudges with a small "Pick up to 2" hint (visual, non-blocking — show the hint as a small line under the cards or near the touched card). Continue button enabled when 1 or 2 are selected.

3. **Strategy screen** (existing). Plays out on the 1-2 thoughts the kid picked on the Pick screen. No other changes to this step.

**Edge case — no eligible thoughts.** If no thought meets the ≥3 threshold on either scale (kid rated everything low), skip the Pick screen entirely and show a brief affirmation screen: *"Looks like none of these thoughts are sticking with you right now — that's good news!"* with a Continue button that goes straight to Save (no strategy step).

**Data shape:** unchanged. The `unstuck_selected_st<n>` flag continues to mean "kid is working on this thought"; what changes is the path to becoming selected (previously: clicked "I want to work on this" inline; now: picked from filtered set on a separate screen).

**Version bump:** v2.0 → v3.0 (MAJOR, structural flow change). Prepend changelog entry: "Separated rating and selection into two distinct screens; max 2 thoughts may be selected to work on."

*End of 2026-05-11 evening revisions batch.*

-->

<!--

### Draft 9 — Trampoline-net visual component + Safety Net Step 2 (Inspect) + ally-icon transparency fix

Three coupled changes that ship together. **(1)** Strip the cream background tile from each of the 15 ally SVGs so they sit transparently on any backdrop. **(2)** Build the parameterized trampoline-net React component we've been designing — this is the visual that Step 1 (final screen) and Step 2 (centerpiece) both consume. **(3)** Build Step 2 "Inspect Your Safety Net" using that component as an interactive surface.

The trampoline-net visual is based on a Claude Design–generated reference at `Activity ideas/trampoline-safety-net.svg` (or wherever Josh dropped it — also in uploads as `trampoline-safety-net (1).svg`). The reference SVG has hardcoded wedge angles for a specific 2/4/3 ratio; we **do not** use it verbatim. We re-implement the geometry parametrically in React and use the reference as a visual target for patterns, colors, label pills, rim, and "YOU" hub.

---

#### Step 0 — Fix the ally-icon backgrounds

Per the icon-set README: *"delete the first `<rect>` element for a fully transparent background."* Apply this to all 15 SVGs in `src/assets/allies/`. The first `<rect>` is the `#FAF6EF` cream tile (`<rect x="0" y="0" width="100" height="100" rx="14" ry="14" fill="#FAF6EF" ... />`). One-line sed pass works:

```
sed -i -E 's|<rect x="0" y="0" width="100" height="100" rx="14" ry="14" fill="#FAF6EF"[^/]*/>||' src/assets/allies/*.svg
```

After the fix, the icons sit cleanly on any background — both the cream tile context of the Step 1 grid (the *tile* component still has its own card background) and the colored trampoline-net wedges in Step 2.

---

#### Step 1 — Build the `TrampolineNet` React component

**Location:** new `src/components/TrampolineNet.jsx` (or whatever the project's components convention is).

**Visual reference:** `Activity ideas/trampoline-safety-net.svg`. Match the rim styling (3 nested circles, dark brown → lighter brown → dark brown), the woven net patterns (one per support type with type-specific colors), the radial cord lines + concentric ring guides inside, the thick wedge-divider lines, the center "YOU" hub disc, and the label pills outside the rim.

**Type-specific palette** (lift from the reference SVG):
- **Practical**: bg `#FEF1D6`, stroke `#F59E0B`, dots `#B45309`, label pill `#B45309`
- **Emotional**: bg `#F8E5E5`, stroke `#C98686`, dots `#8E4A4A`, label pill `#8E4A4A`
- **Social**: bg `#E4EFE6`, stroke `#84A98C`, dots `#4E7257`, label pill `#4E7257`

**Props (component API):**
```
{
  allies: [
    { id, name, custom, support_types: ['practical', ...], inspected?, removed?: false },
    ...
  ],
  interactive: false,        // false in Step 1; true in Step 2
  onAllyTap?: (allyId) => {}, // fires only when interactive
  showLabels?: true,          // ally name pills under each icon
  showInspectedMarks?: false  // small checkmark on inspected allies (Step 2 only)
}
```

**Wedge sizing — proportional, with sliver-plus-label for empty types:**
- Compute counts per type from the allies array (allies with `removed === true` excluded).
- If a type has 0 allies, reserve a 15° sliver and label it *"no [type] allies yet"* in muted type.
- Remaining 345° (or 360° if no zero types) distributes proportionally by count.
- Edge case: all three types empty → render an empty net (rim + center hub, three equal grey-shaded sliver wedges, each labeled).

**Ally placement within wedges:**
- For each wedge, place each ally's icon as an `<image>` element at a position computed from:
  - Angle: distribute evenly within the wedge's angular range
  - Radius: stagger between ~70 and ~110 from center to avoid overlap (alternate inner/outer for adjacent allies)
- Icon size: 32×32 by default. For wedges with 6+ allies, scale down to 24×24. For 10+, 20×20.
- Each ally appears once per wedge they're in. A multi-type ally (e.g., Mom = practical + emotional) renders twice — once in each wedge. Honest about "she contributes to both."
- Ally name shown as a small pill below each icon (toggleable via `showLabels`).

**Inspected-mark rendering (`showInspectedMarks: true`):**
- Each inspected ally gets a small green checkmark in the upper-right of their icon
- Removed allies (when in a Step 2 review state) are shown faded/grayed within their wedge with an X overlay, OR moved to a separate "removed from net" area below — pick whichever reads cleaner

**Interactive behavior (`interactive: true`):**
- Each ally icon is a tappable target (full icon + small padding)
- Tap fires `onAllyTap(allyId)`
- Visual feedback on tap: brief amber ring pulse

**Mobile fidelity:** the visual must work at 390px wide. The rim+wedges scale down responsively; ally icons stay readable. Test at phone viewport.

---

#### Step 2 — Replace Step 1's placeholder final visual with the real `TrampolineNet`

In `src/activities/AlliesSafetyNet.jsx`, Screen 5 ("Your Safety Net") currently renders a placeholder (three stacked sections). Replace with:

```
<TrampolineNet allies={state.allies} interactive={false} showLabels={true} />
```

Keep the existing copy and Save button above/below the visual.

---

#### Step 3 — Build Safety Net Step 2 (Inspect)

**Add Step 2 as a follow-on flow** within the same `AlliesSafetyNet.jsx` activity, after the existing Step 1 save (or as a continue from the Step 1 final screen — TBD by you, but I'd lean toward a single Continue button on the Step 1 final screen that says "Inspect your net" and advances into Step 2). The save event for the whole activity fires at the end of Step 2.

**Framing matters here — clinical-safety language.** The whole purpose of this redesign is to address Holly's flag (don't imply real-life dropping) and Stephanie's "more visual, less per-person interrogation" ask. Use the copy below as written; if Stephanie wants to revise, she will.

**Screen 1 — Inspect intro.**

> **Inspect your safety net.**
>
> Your safety net is the people you'd reach out to when you really need support. Not every important person in your life belongs in your safety net — and that's okay.
>
> An ally who belongs in your safety net is someone who:
> - cares about you
> - is a positive influence
> - tries to help when you need it
>
> Let's check in on each ally. You can choose to keep them in your net or take them out. Taking someone out of your safety net doesn't mean they're not in your life — it just means they're not who you'd lean on right now for support.

Single Continue button → advances to Screen 2.

**Screen 2 — The interactive net.**

The `TrampolineNet` rendered with `interactive={true}` and `showInspectedMarks={true}`. Above the visual, a header strip:

> **Tap each ally to check in on them.**
> *X of Y inspected*

Where X is the count of allies with `inspected === true`, Y is the total. A "Done inspecting" button at the bottom — disabled until all allies are inspected, OR available with a confirmation modal asking "You haven't checked in on N allies — want to keep going, or finish anyway?" (let the kid skip if they want).

Tapping any ally opens the per-ally inspect modal (Screen 3, modal overlay).

**Screen 3 — Per-ally inspect modal.**

Modal overlay (not full screen — partial overlay, dismissable by Back or Save). Content:

> **Check in on [name].**
>
> [Ally icon, 80×80, centered]
>
> These questions might feel uncomfortable. You can answer honestly — the questions stay between you and the app.
>
> *Does [name] sometimes get you in trouble?* [Yes / No / Not sure]
> *Does [name] try to keep you from spending time with other people who care about you?* [Yes / No / Not sure]
> *Does [name] frequently lie to you?* [Yes / No / Not sure]
> *Does [name] sometimes make you feel afraid?* [Yes / No / Not sure]
>
> [Keep [name] in my net]    [Take [name] out of my net]

Visual treatment: if any "yes" is selected, the question card gets a subtle amber border — gentle acknowledgment, not an alarm. The keep/remove buttons stay equally weighted; don't style "remove" as destructive (no red).

**Keep button** → returns to Screen 2, ally marked `inspected: true`. If any "yes" was selected, show the keep-advisory (Screen 4) before returning to net.

**Remove button** → returns to Screen 2 with the removal acknowledgment (Screen 5) shown briefly, ally marked `inspected: true, removed: true`. Net re-renders with that ally faded/X'd or moved to a "removed" section, wedge proportions recalculate (a wedge may collapse to its sliver-plus-label state if its last ally got removed).

**Screen 4 — Keep-advisory (shown after kid keeps an ally with any "yes").**

> Keeping someone in your safety net is your choice, even when things feel complicated.
>
> Some things to remember:
> - You get to decide who you reach out to when you need support.
> - Some relationships are mixed — that's normal.
> - If a relationship feels really hard, talking to a trusted adult, counselor, or therapist can help.

Single Continue button → back to Screen 2.

**Screen 5 — Removal acknowledgment (shown after a remove).**

> Taken out of your safety net. They're still in your life — this is just about who you lean on for support right now.
>
> You can always change your mind later.

Single Continue button → back to Screen 2.

**Screen 6 — Inspection complete.**

When all allies are inspected (or the kid hits "Done inspecting" early), show:

> **Your safety net is ready.**
>
> [Final `TrampolineNet` rendering, non-interactive, showLabels true]
>
> [Save my safety net] button

Save fires the full activity save event.

---

**Save payload shape (extends Step 1's shape):**

```
{
  activity: "allies_safety_net",
  version: "3.0",
  allies: [
    {
      id: "foster",
      name: "Foster Parent",
      custom: false,
      support_types: ["practical", "emotional"],
      inspected: true,
      flags: { trouble: "no", isolate: "no", lies: "no", afraid: "no" },
      kept_in_net: true
    },
    {
      id: "other1",
      name: "Aunt Lisa",
      custom: true,
      support_types: ["emotional", "social"],
      inspected: true,
      flags: { trouble: "yes", isolate: "no", lies: "not_sure", afraid: "no" },
      kept_in_net: false
    },
    ...
  ],
  none_for: { practical: false, emotional: false, social: false },
  inspection_completed: true,  // false if kid skipped some
  saved_at: "..."
}
```

`flags` values are `"yes" | "no" | "not_sure"` strings. `kept_in_net` defaults to `true`; only `false` if kid actively removed.

**Export columns** (extend the `safety_net_*` set):
- `safety_net_inspected_count` — number of allies inspected
- `safety_net_kept_count` — number kept in net
- `safety_net_removed_count` — number removed
- `safety_net_total_flags` — sum of "yes" answers across all flag dimensions
- Per-flag rollups: `safety_net_flag_trouble_yes`, `_flag_isolate_yes`, `_flag_lies_yes`, `_flag_afraid_yes` — counts of "yes" across allies for each flag dimension
- Per-tile inspection columns deferred — discuss with Jessica before adding

`demoDataset.js` distribution: ~80% of demo participants complete inspection on all allies, 15% complete partial, 5% skip entirely. Of inspected, ~20% have at least one "yes" flag, ~10% remove at least one ally.

---

**Version bump:** `allies_safety_net` to v3.0 (MAJOR). Step 2 is new structural functionality and the save payload extends.

**Files to change / create:**
- `src/assets/allies/*.svg` — remove background `<rect>` (Step 0).
- New: `src/components/TrampolineNet.jsx` — parameterized net visual.
- `src/activities/AlliesSafetyNet.jsx` — swap Step 1 final-screen placeholder, append Step 2 flow.
- `src/lib/activityVersions.js` — bump to v3.0, prepend changelog entry.
- `src/lib/exportFlatten.js` — add new safety_net_* columns.
- `src/lib/demoDataset.js` — extend synthetic data for inspection state.

**Visual reference file location:** `Activity ideas/trampoline-safety-net (1).svg` in the repo root (or wherever Josh has it). Use as styling reference only — re-implement parametrically.

*End of 2026-05-11 Safety Net Step 2 + visual draft.*

-->

<!--

### Draft 8 — Allies / Safety Net Step 1 rebuild (Variant C flow + new SVG icon set)

Full replacement of `src/activities/AlliesSafetyNet.jsx`. The current 4-step flow (Build → Inspect → Strengthen → Review) is being torn down. This draft delivers Step 1 (Build) only, with a competent placeholder final visual. Steps 2–4 are queued as Task #7 — strip them entirely in this commit; they'll be rebuilt later after the team's Step 2 design discussion.

**Source of truth for the flow:** the 2026-05-11 review meeting + memory `project_team_email_pending.md` notes pending team discussion of ally-tile splits (don't pre-empt — build with the current 15 tiles, the team will weigh in on splits later).

**Variant chosen:** per-support-type multi-select grid (recorded transcript landing point — see meeting notes). Not one-at-a-time-per-tile, not pre-filter-then-categorize.

---

**Step 0 — Drop in the new SVG icon set.**

Source: `Activity ideas/safety-net-icons.zip` (in repo root). Contains 15 SVGs at 100×100 viewBox plus a `README.txt`.

Process for each SVG before committing it to the repo:
1. Strip the `data-om-id="..."` attributes that Claude Design embedded — these are internal tracking IDs, useless to us, and add ~30% size. A regex pass works: `sed -i -E 's/ data-om-id="[^"]*"//g' src/assets/allies/*.svg`
2. **Keep** the first `<rect>` background tile. The cream `#FAF6EF` tile reads as a card; the activity will look cleaner with it. If we later want transparent, the README explains the one-line removal.

Target location: `src/assets/allies/*.svg`. Use whatever SVG import pattern is already in the codebase (check if Vite is configured for `?react` component imports via vite-plugin-svgr, or just import as URL strings — either is fine for these).

**Tile registry.** Create `src/lib/allyTiles.js` (or co-locate in the activity file if cleaner) — a single data structure mapping tile ID → display name → icon import. The 15 entries:

| ID | Display name | Icon file |
|----|--------------|-----------|
| `foster` | Foster Parent | foster.svg |
| `bio` | Biological Parent | bio.svg |
| `sibling` | Sibling | sibling.svg |
| `grandparent` | Grandparent | grandparent.svg |
| `otherfam` | Other family (aunts, uncles, cousins) | otherfam.svg |
| `counselor` | School Counselor | counselor.svg |
| `teacher` | Teacher | teacher.svg |
| `coach` | Coach | coach.svg |
| `babysitter` | Babysitter | babysitter.svg |
| `neighbor` | Neighbor | neighbor.svg |
| `friend` | Friend | friend.svg |
| `therapist` | Therapist | therapist.svg |
| `caseworker` | Caseworker / Social Worker | caseworker.svg |
| `other1` | Other (custom) | other1.svg |
| `other2` | Other (custom) | other2.svg |

---

**Activity flow — 5 screens, paginated.**

Match the pretest's paginated pattern (Continue + Back buttons, progress strip up top). Single sandbox component, internal step state.

**Screen 1 — Intro.** Brief copy explaining what an "ally" is and previewing the three support types. Suggested copy (refine in voice as needed):

> **Who are the allies in your safety net?**
>
> An ally is someone you trust to provide support and help you become the person you want to be. They might not always get it right, but you know they care about you, they're a positive influence, and they try to help.
>
> The strongest safety nets have allies who provide different kinds of support:
>
> - **Practical** — people who help you solve problems, teach you things, or make sure you have what you need.
> - **Emotional** — people who help you feel good about yourself, listen to you, or help you cope with hard feelings.
> - **Social** — people you can be yourself around, or who help you feel less alone.
>
> Let's build your safety net.

Single Continue button to start.

**Screens 2, 3, 4 — One per support type (Practical → Emotional → Social).**

Each screen has the same structure:
1. **Header:** *"Who provides [practical] support for you?"*
2. **Definition repeated** (one line, lighter weight): *"People who help you solve problems, teach you things, or make sure you have what you need."*
3. **Tile grid:** all 15 tiles. **2 columns on mobile**, 3 columns on tablet/desktop. Each tile ≈ 180×140px showing the SVG icon (≈100×100) on top with the display name centered below. Tappable target is the full tile.
4. **Selection behavior:**
   - Tap = select (amber-500 ring + subtle checkmark in the corner)
   - Tap again = deselect
   - Multi-select; no limit on number selected
   - **Other tiles** (`other1`, `other2`): tapping opens an inline text input. The kid types a name; on commit (Enter or blur), the tile shows the custom name and is selected. The custom name persists across the three type screens — if the kid named "Aunt Lisa" on the Practical screen, the same `other1` tile shows "Aunt Lisa" pre-filled on the Emotional and Social screens.
5. **"None of these" affirmative button** below the grid: *"None of these are [practical] support for me."* This captures the kid affirmatively saying "no one for this type" — meaningfully different from "kid scrolled past without selecting." Tapping it deselects everything on the screen and visibly marks the "none" state.
6. **Back + Continue** buttons at the bottom (Continue is primary amber-500 CTA).

**Selection state is per-type-screen.** A kid selecting "Mom" on the Practical screen does NOT pre-select Mom on the Emotional screen. Mom starts unselected on Emotional; tapping her selects her there too. The cumulative result is one ally entity with the union of support types tapped across screens.

**Screen 5 — Your Safety Net (placeholder visual for now).**

Show the assembled set of selected allies grouped by support type. **Placeholder layout to ship in this commit:**

- Three labeled sections stacked vertically: Practical, Emotional, Social.
- Inside each section, show the SVG icons of all allies tagged with that support type, with names below. Use a soft section background to visually contain each group.
- If a support type has no allies, show muted copy: *"No practical support allies yet — that's okay. Sometimes it starts with looking for someone who could become one."*
- Multi-type allies appear once in each of their sections (they're duplicated visually but it's one ally entity in the data).

This placeholder is **deliberately not the final visual** — Josh is exploring a merged "net + pie" visual in Claude Design separately. A follow-up commit will swap this placeholder for the final visual. Build the data shape so the swap is just a render-layer change; the underlying data is the source of truth.

Below the visual: a Save button that fires the activity save and shows the standard "your responses are saved" confirmation.

---

**Save payload shape.**

```
{
  activity: "allies_safety_net",
  version: "2.0",
  allies: [
    { id: "foster", name: "Foster Parent", custom: false, support_types: ["practical", "emotional"] },
    { id: "sibling", name: "Sibling", custom: false, support_types: ["emotional"] },
    { id: "other1", name: "Aunt Lisa", custom: true, support_types: ["emotional", "social"] }
  ],
  none_for: { practical: false, emotional: false, social: true },
  saved_at: "..."
}
```

- `allies` is the **deduplicated** list — each tile ID (or custom name for `other1`/`other2`) appears once with the union of its support types.
- `none_for.<type>` is `true` only when the kid actively tapped the "None of these" button for that type. If they just continued without selecting anything *and* without tapping None, it's `false` (meaningful distinction — captures whether the kid considered the type vs. skipped through it).
- Empty `allies` array is valid — possible if all three types got "None of these."

Update `src/lib/demoDataset.js` to produce the new payload shape for this activity. Synthetic distribution: ~70% of demo participants have 2–4 allies, ~20% have 5–7, ~10% have 0–1 with at least one "None of these" flag.

Update the export pipeline columns to match the new shape — under the `safety_net_*` activity prefix that Draft 6 established:
- `safety_net_ally_count` — total deduplicated ally count
- `safety_net_practical_count`, `_emotional_count`, `_social_count`
- `safety_net_none_practical`, `_none_emotional`, `_none_social` (0/1)
- Per-tile selections may be too sparse to encode as columns — discuss with Jessica before going down that path; for now stick to counts + none-flags.

---

**Files to change / create:**
- `src/activities/AlliesSafetyNet.jsx` — full rewrite per above.
- `src/assets/allies/*.svg` — 15 new icon files (stripped of `data-om-id` attributes).
- `src/lib/allyTiles.js` (new) — tile registry data structure.
- `src/lib/activityVersions.js` — bump `allies_safety_net` to v2.0 (MAJOR). Prepend changelog entry. Set `updated` to today's date.
- `src/lib/exportFlatten.js` — update activity payload columns for the new shape.
- `src/lib/demoDataset.js` — generate synthetic data matching the new shape.

**Tear-down note.** The existing Step 2 (Inspect), Step 3 (Strengthen), Step 4 (Review) code paths in the current `AlliesSafetyNet.jsx` are gone in this commit. Don't preserve them. Task #7 will rebuild Step 2 from scratch after the team's design discussion next week.

**Version bump:** MAJOR. v1.x → v2.0. Per `CLAUDE.md` convention, bump in this same commit, prepend changelog entry to `activityVersions.js`.

*End of 2026-05-11 Safety Net Step 1 draft.*

-->

<!--

### Draft 6 — Export variable rename + .sps syntax generator + /demo data-export section simplification

Two coupled changes plus a UI cleanup. **(1)** Refactor the export pipeline to produce Jessica's SPSS-compatible column naming — the current `exportFlatten.js` produces names like `hopelessness_pre_bhs1`; after the rename that becomes `pre_bhs_1`. **(2)** Generate a companion `.sps` SPSS syntax file alongside the CSV that applies variable labels, value labels, types, and measurement levels in one syntax run after CSV import. This is what REDCap and KoboToolbox ship as their primary SPSS export today — research-platform standard, not a workaround. (Qualtrics ships both — native `.sav` *and* a separate `.sps` for relabeling. We're parking the native-.sav path as Task #11 Phase B, additive only if Jessica finds the syntax-run friction.) **(3)** Simplify the `/demo` data-export section to one CSV + .sps + Codebook bundle with a short explanation. Leave `/admin/data-export` untouched.

**Convention (memory: `project_spss_variable_naming.md`):**
- Pattern: `<timepoint>_<scale>_<item#>`
- Timepoints: `pre`, `post`, `fu`
- Numeric for likert/sliders (store the number, not the label); string for free text
- Response values must match across pre/post/follow-up surveys for the same scale

**Files to change:**
- `src/lib/exportFlatten.js` — primary refactor. Each scale needs an explicit `abbreviation` field; the column builder reads from a **column registry** data structure that becomes the single source of truth for both CSV columns and the .sps file. `sanitizeCol` stays as a safety net but the input it sanitizes is now constructed correctly upstream.
- **New: `src/lib/spssSyntax.js`** — generator for the `.sps` syntax file. Reads from the same column registry as `exportFlatten.js`. Emits the syntax text Jessica runs in SPSS after CSV import. Performs SPSS variable-name validation at generation time (64-char max, must start with a letter, no spaces, no reserved words like `ALL`/`AND`/`BY`/`EQ`/`GE`/`GT`/`LE`/`LT`/`NE`/`NOT`/`OR`/`TO`/`WITH`) — throw with a clear error if a column name fails, rather than emitting a bad file.
- `src/lib/demoDataset.js` — column references update; synthetic data *values* stay identical so the demo dataset remains reproducible.
- `src/pages/DemoPage.jsx` — drop Summary + Long buttons from the Data export demo section. Replace with three downloads: Wide CSV, `.sps` syntax, Codebook CSV. Add the explanation copy below. `/admin/data-export` is untouched (still has all four formats).

**Proposed scale abbreviations** (call these out in the commit message so Jessica can react in the next review batch):

| Scale | Abbreviation | Example column |
|------|--------------|----------------|
| Beck Hopelessness | `bhs` | `pre_bhs_1` |
| Adolescent Sense of Control | `ascs` | `pre_ascs_1` |
| UCLA 3-Item Loneliness | `ucla` | `pre_ucla_1` |
| Need to Belong | `nb` | `pre_nb_1` |
| Belonging Promoting Behaviors | `bpb` | `pre_bpb_1` |
| Belonging Worries (2-slider) | `bw` | `pre_bw_1`, `pre_bw_2` |
| Program Expectation | `pe` | `pre_pe_1` |

Score columns become `pre_bhs_score`, `pre_ascs_score`, etc.

**Demographic column names** (bare, no timepoint prefix):

| Field | Column(s) | Coding |
|------|-----------|--------|
| Age | `age` | numeric |
| Sex | `sex` | 1=Female, 2=Male, 3=Prefer not to answer |
| Grade | `grade` | numeric |
| Race (multi-select) | `race_white`, `race_black`, `race_amind`, `race_alaskan`, `race_pi`, `race_asian`, `race_pna`, `race_dunno` | 0/1 per column |
| Hispanic | `hispanic` | 0=No, 1=Yes |
| Time in current home | `home_years`, `home_months` | numeric |

**Activity payload columns** — not psychometric scales, so the `<timepoint>_<scale>_<item#>` pattern doesn't apply cleanly. Keep an activity-prefixed pattern: `unstuck_*`, `safety_net_*`, `letter_*`, `poem_*`, `sort_*`, `reflect_*`. Shorten existing names where they're clunky but preserve the meaning.

For the Getting Unstuck appraisal scores added in commit `7b7046e`: suggested `unstuck_freq_<thought_id>` and `unstuck_belief_<thought_id>` for the per-thought 5-point scores; `unstuck_strategy_<thought_id>` for the strategy choice (`challenge` / `bothand`); `unstuck_response_<thought_id>` for the open text.

**Discrepancy to investigate during build:** the current code produces columns under a scale called `appraisals_*` (e.g., `appraisals_pre_a1`) that isn't part of the locked pretest doc. Possibly the appraisal instrument Stephanie referenced for Getting Unstuck. Either rename to `pre_app_<item#>` and leave a comment flagging "origin unclear, confirm with Jessica/Stephanie," or drop it from the pretest export and route it through the activity-payload path under `unstuck_*`. Use your judgment based on what the scale's items look like.

**.sps syntax file format.** The generator emits a single text file that, when opened in SPSS, imports the CSV and applies every piece of metadata in one syntax run. Skeleton:

```
* Generated by RSD export — timestamp {ISO 8601}, rows {N}, activity versions {snapshot}.

GET DATA
  /TYPE=TXT
  /FILE='participant_data.csv'
  /ENCODING='UTF8'
  /DELIMITERS=','
  /QUALIFIER='"'
  /FIRSTCASE=2
  /VARIABLES={list with format specifiers like "age F2 sex F1 pre_bhs_1 F1 ..."}.

VARIABLE LABELS
  pre_bhs_1 "Beck Hopelessness item 1: I feel that my future is hopeless..."
  pre_bhs_2 "Beck Hopelessness item 2: My future seems dark to me."
  ...
  /.

VALUE LABELS
  pre_bhs_1 pre_bhs_2 pre_bhs_3 pre_bhs_4
    0 "Absolutely disagree"
    1 "Somewhat disagree"
    2 "Somewhat agree"
    3 "Absolutely agree"
  /
  pre_ascs_1 pre_ascs_2 pre_ascs_3
    1 "Never" 2 "Rarely" 3 "Sometimes" 4 "Often" 5 "Always"
  /
  sex
    1 "Female" 2 "Male" 3 "Prefer not to answer"
  /
  hispanic 0 "No" 1 "Yes"
  /.

VARIABLE LEVEL
  pre_bhs_1 pre_bhs_2 pre_bhs_3 pre_bhs_4 (ordinal)
  pre_bw_1 pre_bw_2 pre_pe_1 (scale)
  sex race_white race_black race_amind race_alaskan race_pi race_asian race_pna race_dunno hispanic (nominal)
  age grade home_years home_months (scale)
  /.

FORMATS
  age home_years home_months grade (F2)
  pre_bhs_1 pre_bhs_2 pre_bhs_3 pre_bhs_4 pre_ascs_1 pre_ascs_2 pre_ascs_3 (F1)
  pre_bw_1 pre_bw_2 pre_pe_1 (F2)
  /.

SAVE OUTFILE='participant_data.sav'.
EXECUTE.
```

The header comment at the top is critical for triage — when Jessica references "the export from last Tuesday" three weeks from now, the timestamp and activity-version snapshot let us identify which build it came from.

**Encoding details.** Emit the CSV as UTF-8 with BOM. The `/ENCODING='UTF8'` in the syntax handles any non-ASCII characters in free-text responses (which there will be).

**/demo Data export demo section — new copy:**

Replace the current 4-button layout with this:

> **Download the SPSS bundle.** Three files: the Wide CSV (your data), the `.sps` syntax file (variable labels, value labels, types, and measurement levels), and the Codebook CSV (short column names mapped to full item text). To get a labeled `.sav` dataset in SPSS, open the `.sps` file in SPSS — it imports the CSV and applies all metadata in one run, ending with a saved `.sav`. This is the same approach REDCap and KoboToolbox use as their primary SPSS export — it's the research-platform standard, not a workaround.
>
> Column names follow SPSS-import conventions: timepoint first, then scale abbreviation, then item number (e.g., `pre_bhs_1` is pretest Beck Hopelessness item 1).
>
> *Note: Qualtrics offers a native `.sav` file directly. We may add that as a second download option later if the open-via-syntax step proves clunky in practice — for now, all the same metadata lands in your `.sav` via this two-step.*
>
> [Download CSV] [Download .sps] [Download Codebook]

Drop the existing collapsible "How exports work" panel (or fold its substance into the new note). The Summary and Long buttons are gone from `/demo` — they remain available on `/admin/data-export`.

**Update `INFRASTRUCTURE.md`** with a change-log entry describing the new column naming and the .sps generator.

**No activity-version bumps** — none of the activities change.

---

### Draft 7 — Pretest Demo: interactive sandbox entry on /demo

Build the pretest as a fully interactive sandbox entry, rendered as it'll appear in the live app. Captures responses with the new SPSS column names from Draft 6.

**Source content (FINAL, confirmed by Josh 2026-05-11):** `Pretest Draft Belongingness_5.2.26.docx`. 29 items: 6 demographics + 7 scales. Embedded below verbatim so you don't need to re-extract from the docx.

**Files:**
- New: `src/activities/Pretest.jsx` — the rendered pretest.
- `src/lib/testRegistry.js` (or wherever `TEST_REGISTRY` lives) — add a new category `RSD test` with one entry: `pretest`.
- `src/pages/DemoPage.jsx` — add a new section "Tests" between the existing Activities and Data export demo sections; render items where `category === 'RSD test'` with the same card layout.
- `src/pages/DemoSandboxPage.jsx` — should accept the new pretest entry automatically via the registry pattern; verify the sandbox route `/demo/sandbox/pretest` renders.
- `src/lib/activityVersions.js` — add a `pretest` entry at v1.0 so the version badge works on the sandbox page. (Treat as a structural artifact, not a content version — initial 1.0.)
- `src/lib/demoDataset.js` — if it doesn't already generate pretest responses, extend it. Use the SPSS column names from Draft 6.

**Layout — paginated, mirroring the live session.** The goal of this demo is to show the team exactly how the pretest will paginate and feel in a real participant session — not to serve as a one-page review of items the team has already gone over endlessly. Build this to live-session fidelity from the start.

- **One section per screen.** Suggested screen breakdown: (1) Intro / "Begin" → (2) Demographics → (3) Beck Hopelessness → (4) Adolescent Sense of Control → (5) UCLA Loneliness → (6) Need to Belong → (7) Belonging Promoting Behaviors → (8) Belonging Worries → (9) Program Expectation → (10) Thank-you / Submit. Ten screens. Adjust if a tighter grouping reads better (e.g., combining the two-item Belonging Worries with Program Expectation), but err toward more screens, not fewer — short single-section screens are easier on a kid.
- **Progress indicator** at the top of each screen — either a thin progress bar or "Step X of 9" text. Pick whichever reads cleanest in the existing amber/slate style.
- **Continue button** at the bottom of each section (primary amber-500 CTA per repo conventions). Validation: don't advance until required items on the current screen are answered (sliders default to no-value; explicit interaction required).
- **Back button** available on every screen except the intro, so the kid can revise prior answers.
- **Mobile-first.** Participants will mostly be on phones. Make sure each screen fits within a phone viewport without horizontal scroll, sliders are thumb-friendly, and the Continue button stays reachable.
- **Conditional skip on Belonging Worries Q2** — if `pre_bw_1` is 0, the screen auto-advances past Q2 (or Q2 doesn't render and the section ends after Q1). `pre_bw_2` saves as null/empty.
- **Final screen** shows a brief "Thanks — your responses are saved" message and the Submit action that fires the save panel capture. Don't show the JSON payload on this screen (it's already visible in the sandbox save panel below the activity frame).

**Items (verbatim from the locked doc):**

#### Intro (display only, no input)

> Thank you for joining our project! We want to learn what helps kids and teens feel like they belong with their families and in their communities.
>
> We will ask you some questions before and after you watch some videos and complete some activities. Some of these questions might ask about feelings that are hard to talk about. If you feel upset and want to talk to someone, please tell your caregiver or email us at sprang@uky.edu. By completing the program today, you will receive a $25 e-gift card as a thank you. We're so glad you're working with us!

#### Section 1 — Demographics (6 items)

1. **How old are you?** — number input → `age`
2. **What is your sex?** — radio (Female=1, Male=2, Prefer not to answer=3) → `sex`
3. **What race do you consider yourself (choose all that apply)?** — checkboxes (White, Black/African American, American Indian, Alaska Native, Pacific Islander, Asian, Prefer not to answer, I don't know) → `race_white`, `race_black`, `race_amind`, `race_alaskan`, `race_pi`, `race_asian`, `race_pna`, `race_dunno`
4. **Are you Hispanic or Latino?** — radio (No=0, Yes=1) → `hispanic`
5. **What grade are you currently in at school?** — number input → `grade`
6. **How long have you lived in your current home?** — two number inputs (years + months) → `home_years`, `home_months`

#### Section 2 — Beck Hopelessness Scale (4 items)

Stem: *Please share how you are feeling right now, at this moment.*
Scale: Absolutely disagree (0) · Somewhat disagree (1) · Somewhat agree (2) · Absolutely agree (3)

- `pre_bhs_1` I feel that my future is hopeless and that things will not improve.
- `pre_bhs_2` My future seems dark to me.
- `pre_bhs_3` Things just won't work out the way I want them to.
- `pre_bhs_4` There is no use in really trying to get something I want because I probably won't get it.

#### Section 3 — Adolescent Sense of Control Scale (3 items)

Stem: *Below are several statements that may apply to you. There are no right or wrong answers or trick questions. Based on your understanding of the question, select how often this applies to you.*
Scale: Never (1) · Rarely (2) · Sometimes (3) · Often (4) · Always (5)

- `pre_ascs_1` If I decide to, I can make changes to get more control over how close I feel to other people in my life.
- `pre_ascs_2` I am able to act in ways that help me feel close to people in my life.
- `pre_ascs_3` I have the skills and ability to improve how close I get to people in my life.

#### Section 4 — UCLA 3-Item Loneliness Scale (3 items)

Stem: *Please answer the following:*
Scale: Hardly ever (1) · Some of the time (2) · Often (3)

- `pre_ucla_1` How often do you feel that you lack companionship?
- `pre_ucla_2` How often do you feel left out?
- `pre_ucla_3` How often do you feel isolated from others?

#### Section 5 — Need to Belong (3 items)

Stem: *For each of the statements below, indicate the degree to which you agree or disagree with the statement using the scale below.*
Scale: Strongly disagree (1) · Moderately disagree (2) · Neither agree nor disagree (3) · Moderately agree (4) · Strongly agree (5)

- `pre_nb_1` If other people don't seem to accept me, I don't let it bother me.
- `pre_nb_2` I seldom (hardly ever) worry about whether other people care about me.
- `pre_nb_3` My feelings are easily hurt when I feel that others do not accept me.

#### Section 6 — Belonging Promoting Behaviors (7 items)

Stem: *How often do you:*
Scale: Never (0) · Sometimes (1) · Often (2) · Always (3)

- `pre_bpb_1` Pay really close attention to what someone is saying to you without letting yourself get distracted (like not checking your phone while they are speaking)?
- `pre_bpb_2` Use words like "we" or "us" or "our group" that make people feel included?
- `pre_bpb_3` Say "Thank You" and/or tell others when they do something you appreciate?
- `pre_bpb_4` Help someone out when they need it?
- `pre_bpb_5` Invite others (like family members and friends) to spend time with you?
- `pre_bpb_6` Include others in conversations and/or invite them to join in your activities (like watching a movie together, going for a walk, or playing a game)?
- `pre_bpb_7` Talk through a disagreement with someone until you find an answer that works for everyone?

#### Section 7 — Belonging Worries (2 slider items)

Slider 0–10. Anchors: Not at all · Moderately · A lot

- `pre_bw_1` To what degree do you have worries about belonging (e.g., fitting in, being understood or accepted)?
  - **Conditional skip:** if `pre_bw_1` is 0, hide Q2 (don't show the slider). On save, store `pre_bw_2` as null/empty.
- `pre_bw_2` To what degree do your worries about belonging interfere with your desire to stay in your current home?

#### Section 8 — Program Expectation (1 slider)

Stem: *Please rate the following sentence based on how you feel at this moment.*
Slider 1–10. Anchors: Not at all · Somewhat · Very Much

- `pre_pe_1` At this point, how helpful do you think this program will be for helping you feel close to your family and friends?

**Save payload:** flat object keyed by the column names above, plus `saved_at`. The save panel on the sandbox shows the JSON so reviewers can confirm the shape matches the export.

**Registry entry shape (suggested):**
```
{
  id: 'pretest',
  category: 'RSD test',
  displayName: 'Pretest',
  description: 'The pretest survey shown before activities begin. Captures demographics and baseline measures (Beck Hopelessness, Adolescent Sense of Control, UCLA Loneliness, Need to Belong, Belonging Promoting Behaviors, Belonging Worries, Program Expectation).',
  component: 'Pretest',
  route: '/demo/sandbox/pretest',
}
```

**DemoPage new section:**

Add the new "Tests" section after the existing Activities section. Same card layout as Activities. Single card for now (pretest); posttest + follow-up will be added later. Section header copy:

> **Tests.** Pre-, post-, and follow-up surveys that bookend the program. Currently shown: pretest.

*End of 2026-05-11 data-and-pretest batch.*

-->

<!--

#### Draft 1 — Self-Reflection: sharpen "excluded" prompt wording

Holly flagged in the 2026-05-11 feedback round that the current exclusion prompt — *"Now think of a time you felt excluded — a time you felt like you did not belong"* — reads as a state of being rather than an event done to the kid. Reframe to make the exclusion agentive.

**File:** `src/activities/SelfReflection.jsx`

**Change:** Find the exclusion prompt (the second half of the inclusion/exclusion pair) and replace it with:

> Now think of a time someone made you feel like you did not belong.

The inclusion prompt stays as-is. This is the only copy change.

**Version bump:** MINOR. Prepend a one-line entry to this activity's `changelog` in `src/lib/activityVersions.js`, set `updated` to today's date.

**Approved by:** Josh, 2026-05-11. Treated as a clinical-content tweak Sprang doesn't need to weigh in on at this scale.

---

#### Draft 2 — Who I Am Poem: rebuild to Ginny's 10-line structure

Ginny sent a revised poem structure (image: `Poem structure.png` in the repo root). She has final word on platform UX per Josh's call. This supersedes the meeting transcript's "one stanza only" framing.

**File:** `src/activities/WhoIAmPoem.jsx`

**Replace the current poem flow with this 10-line structure.** Kid fills in 8 input fields; lines 6 and 10 auto-display whatever they wrote for line 1.

| Line | Prompt | Kid input |
|------|--------|-----------|
| 1 | I am | two special characteristics you have |
| 2 | I am from | a place, people, or way of life |
| 3 | I fear | something you are afraid of |
| 4 | I suffer when | an event that makes you sad or angry |
| 5 | I want | an actual desire |
| 6 | I am | *(auto: same text as line 1)* |
| 7 | I believe | something you believe in |
| 8 | I dream | something you actually dream about |
| 9 | I am going | where you hope to be |
| 10 | I am | *(auto: same text as line 1)* |

**Behavior:**
- 8 inputs (lines 1, 2, 3, 4, 5, 7, 8, 9). Lines 6 and 10 are display-only and mirror line 1.
- Single screen. No multi-page flow.
- Before the input form, show a brief worked example of a finished poem (Holly: *"I think we might want an example of a finished product here before we ask them to do it"*). Write something simple in-voice — don't pull from a published poet, since that's exactly what Ginny asked us to stop doing. Two to three lines of a sample is enough; doesn't need to be all 10.

**Copy changes:**
- Remove the "George Ella Lyon" / "Lyons format" / "Two-stanza George-Ella-Lyons-style poem with keepsake card" attribution entirely. Ginny was explicit: *"Remove this label — this isn't the Lyons format."* If a credit is wanted, "Inspired by traditional 'I am' poems" is fine. No named-poet attribution.
- Keep tone warm and kid-friendly.

**Data shape:**
Save payload preserves the 8 unique inputs:
```
{
  characteristics: "...",  // line 1
  from: "...",             // line 2
  fear: "...",             // line 3
  suffer_when: "...",      // line 4
  want: "...",             // line 5
  believe: "...",          // line 7
  dream: "...",            // line 8
  going: "...",            // line 9
  saved_at: "..."
}
```
Lines 6 and 10 reconstruct from `characteristics` at render time.

**Version bump:** MAJOR. Prepend changelog entry, update `updated`.

**Source:** `Poem structure.png` in the repo root.

---

#### Draft 3 — Belonging Skills Sort: kid-friendly labels + hover-define tooltips

Stephanie + Holly + Ginny all converged on this. Stephanie: language needs to be more child-friendly. Holly: *"reducing belonging uncertainty and creating space for belonging aren't specific enough... I'm not even sure what that means behaviorally."* Ginny: *"we should define these if you hover over the skill as a reminder."*

**Files:** `src/activities/BelongingSkillsSort.jsx` and any associated data file under `src/lib/` that defines the skill list (check both).

**Replace the existing 7 skill labels (`bs1`–`bs7`) with the 7 Belonging Promoting Behaviors items from the locked pretest doc** (`Pretest Draft Belongingness_5.2.26.docx`, "Belonging Promoting Behaviors (7 items)" section, confirmed final by Josh 2026-05-11). In this order:

1. **`bs1`** — Pay close attention when someone is talking to you (without checking your phone or getting distracted)
2. **`bs2`** — Use words like "we," "us," or "our group" to make people feel included
3. **`bs3`** — Say thank you or tell others when they do something you appreciate
4. **`bs4`** — Help someone out when they need it
5. **`bs5`** — Invite others to spend time with you
6. **`bs6`** — Include others in conversations and activities (like watching a movie, going for a walk, or playing a game)
7. **`bs7`** — Talk through a disagreement with someone until you find an answer that works for everyone

**Add hover-define tooltips** — each skill shows a 1–2 sentence definition on hover (desktop) or tap (mobile). Draft definitions below; refine in voice as needed:

1. Giving someone your full attention when they're speaking — eyes on them, no phone, no looking around.
2. Saying things that signal everyone belongs in the group — "we" instead of "you guys," "our team" instead of "the group."
3. Telling someone you noticed and appreciated what they did, instead of just thinking it.
4. Offering help when you see someone needs it, without waiting to be asked.
5. Reaching out to bring someone into your plans or your day, instead of waiting for them to ask.
6. Making space for others in what you're already doing — looping them into the conversation, the game, the show.
7. Staying with a disagreement until you find something that works for everyone, instead of walking away or giving up.

**Implementation notes:**
- Tooltip must be tap-accessible on mobile (use a small "?" affordance or tap-to-toggle, not hover-only).
- Skill IDs `bs1`–`bs7` stay sequential; the *meaning* of each ID is changing, but that's fine — demo-only state, no real participants.
- The three categories (`already_doing`, `willing_to_try`, `unplaced`) stay as-is.

**Version bump:** MAJOR (label set is structurally changing and per-ID meaning shifts).

---

#### Draft 4 — Letter to Another Youth: collapse to one-page free write

Meeting + feedback consensus 2026-05-11. Stephanie: *"the letter has too many steps and would be confusing for a kid"* — and she fed back to herself that the multi-section format produced a letter that *"was meaningless"* because the kid was just borrowing other people's words. Holly reported a bug where click-to-add inserts text before the prompt sentence — that whole interaction becomes moot once we remove click-to-add.

**File:** `src/activities/LetterBuilder.jsx`

**Rebuild as a single-screen free-write activity** modeled on the gains-professional one-page pattern. Look for that pattern elsewhere in `src/activities/` for the visual reference — it's a one-textarea, write-whatever-you-want layout.

**Required changes:**
1. **Collapse all 6 sections into one.** A single textarea, free-form. Save on continue.
2. **Remove every click-to-add prompt button.** Do not import phrases from other activities (Getting Unstuck, etc.). The letter should come entirely from the kid — Stephanie was explicit.
3. **Add a short context line above the textarea** describing who the kid is writing to (Stephanie: *"Maybe need to give them a little more context for who they are writing to"*). Suggested copy:
   > Write a letter to another teen who is starting where you are now. What do you want them to know?
4. **Optional small example** *outside* the textarea (greyed/italic) showing the kind of letter that's welcome. Keep it short — one sentence — and generic. Not a model letter to copy.

**Data shape:**
- Save payload becomes `{ letter: "<full text>", saved_at: "..." }`. Drop all the structured per-section fields. Breaking change to the saved schema; acceptable since demo-only.
- **Remove cross-activity coupling.** Stephanie's comment *"They may not do a both/and statement from getting unstuck, so not sure what would show up here if they didn't"* implies Letter Builder currently reads Getting Unstuck output. Kill that dependency entirely — the letter is freestanding now.

**Version bump:** MAJOR (structural change, feature removal, data shape change).

---

#### Draft 5 — Getting Unstuck: appraisal scale + restored challenge prompts + "Challenge it" rename

Three changes from Stephanie's feedback + the 2026-05-11 meeting.

**File:** `src/activities/GettingUnstuck.jsx`

**Change 1 — Replace the intro panel with a 5-point appraisal scale on the stuck-thoughts screen.**

Ginny called out that the current intro is confusing: the Kai quote followed by *"tap any thoughts that feel true for you"* doesn't read coherently — she had to re-read multiple times to figure out what to do. Stephanie's fix: drop the standalone intro panel and put the 5-point appraisal scale directly on the stuck-thoughts selection screen.

For each preset stuck thought, alongside the thought itself, ask:
- **How often do you have this thought?** (5-point scale)
- **How strongly do you believe this thought is true?** (5-point scale)

Anchors for both scales: 1 = Never / Not at all, 2 = Rarely / A little, 3 = Sometimes / Somewhat, 4 = Often / Mostly, 5 = Always / Completely.

Stephanie noted these *"may fit with the pretest appraisal questions"* — keep that compatibility in mind. The pretest doc as locked doesn't include this exact appraisal instrument (Beck Hopelessness, ASCS, UCLA, Need to Belong, BPB, Belonging sliders, Expectation slider are the locked scales). If a separate appraisal scale exists elsewhere in the planning materials, align anchors to that; otherwise the anchors above are the working values.

The kid then explicitly selects which thoughts they want to work on (suggested: any thought rated ≥ 3 on either scale is eligible; the kid picks from the eligible set).

Remove the standalone Kai-quote intro panel entirely. If a brief intro is still needed, fold it into the appraisal screen as a single header line — but don't restate the Kai context, it's confusing.

**Change 2 — Restore the three challenge prompts.**

Stephanie's PPT slide 12 lists three prompts for the challenge strategy. The current build appears to only show one. Restore all three, displayed together as scaffolding above a single open-ended response field (not three separate inputs):

> - Is there another way I can think about this?
> - Is this really true, or can I think of a way it isn't true?
> - Is this thought helping me, and if not, what is a thought that might be more helpful?

**Change 3 — Rename "Fight it" → "Challenge it" throughout.**

Stephanie's request — more clinically standard. Every UI label, button, and saved-data key that says "fight" or "fight_it" becomes "challenge" or "challenge_it." The "both/and" strategy stays as-is.

**Data shape:**
- Appraisal scores (frequency, believability) saved per stuck thought. New fields on the activity payload.
- Strategy key rename from `fight_it` to `challenge_it`. Demo-only, no migration needed.

**Version bump:** MAJOR.

**Open question (not blocking — build text for now):** Stephanie asked whether the strategy explanation should be audio/video rather than text. Build text; we can swap to video later without restructuring the form.

---

*End of 2026-05-11 batch. After all five ship, Josh announces one stopping point to the team for batched review.*

-->

---
