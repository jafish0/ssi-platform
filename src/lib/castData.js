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
// Sam (16) note: the `lines` array is ordered for SCRIPT-NARRATIVE
// reading (1 → 2 → 3 → 4 → 6 → 7 → 5), not recording order. The audio
// file numbers (…-line-5/6/7) stay as recorded; only this display order
// shifts so the team hears the story in sequence. Line 5 is the closing
// metaphor; lines 6 and 7 are mid-arc beats recorded after the rest.

export const CAST = [
  {
    id: 'sam-14',
    name: 'Sam (14 years old)',
    image: '/cast/images/sam-14.png',
    alt: 'Sam at 14 — the 14-year-old version of the main character',
    role: 'The 14-year-old version — at the heart of every flashback.',
    // Sam 14 image is landscape (2304×1296) — crop to a gentle ~4:3 so
    // faces stay centered (see `landscape` flag, handled in the view).
    landscape: true,
    lines: [
      {
        audio: '/cast/audio/sam-14-line-1.mp3',
        scene: 'Inner monologue voice-over (the moment after the adoption question)',
        text: 'How do I feel about that? I have literally no idea.',
      },
      {
        audio: '/cast/audio/sam-14-line-2.mp3',
        scene: 'At the dining table (becomes angry, before leaving)',
        text: 'You aren’t my parents and you never will be.',
      },
    ],
  },
  {
    id: 'sam-16',
    name: 'Sam (16 years old)',
    image: '/cast/images/sam-16.png',
    alt: 'Sam at 16 — the narrator, two years later',
    role: 'Our narrator — Sam two years later.',
    lines: [
      {
        audio: '/cast/audio/sam-16-line-1.mp3',
        scene: 'Voice-over (opening narration)',
        text:
          'I remember this moment like it was yesterday. I was removed from my real mom when I was 10 and lived with my foster family after bouncing around placements for a couple of years.',
      },
      {
        audio: '/cast/audio/sam-16-line-2.mp3',
        scene: 'Voice-over (reflecting on his thoughts at the adoption-offer moment)',
        text:
          'When she asked me this, the first thing I thought was “they don’t love me, they’re just offering to do this because they feel bad for me.” I remembered the years where I moved from family to family because no one wanted me and I thought “this will never work out, I don’t even want to get my hopes up.” But at the same time, I was already hopeful, and that made me feel guilty. What was wrong with me that I felt excited about being adopted by this family, when my real mom was still out there? I couldn’t give up on her by agreeing to be adopted.',
      },
      {
        audio: '/cast/audio/sam-16-line-3.mp3',
        scene: 'Voice-over (after the rejection — grimace)',
        text:
          'Yeah, that was a low blow. But at the time I really couldn’t picture myself belonging to their family. I had been through a lot. Going from elementary to middle to high school isn’t easy for anyone, but it was even harder for me because I was changing schools and houses all the time. Who could keep up with friends or teams during all of that? It was tough but I was used to doing everything by myself my whole life.',
      },
      {
        audio: '/cast/audio/sam-16-line-4.mp3',
        scene: 'Voice-over (Mrs. Johnson, backstage crew, opening night)',
        text:
          'After I said no, I stayed with my foster parents who said they understood but I could tell it was an issue. Not too long after they and my case worker really encouraged me to participate in something at school. My favorite teacher Mrs. Johnson was directing the school musical, and she suggested that I join the backstage crew. I had never done anything like that but I thought it was lowkey enough to try and I knew that Mrs. Johnson would support me if it was hard. Even though at first I didn’t really care, I got really into it when I saw how we were all working on this one massive production and by opening night I wanted the show to run perfectly. After the show when everyone in the cast and crew were cheering and celebrating together, I really felt like a part of something for maybe the first time ever… and then I knew what I had been missing out on by holding back.',
      },
      {
        audio: '/cast/audio/sam-16-line-6.mp3',
        scene: 'Voice-over (drive home, recognizing unhelpful thoughts)',
        text:
          'On the drive home with my foster family, I thought again about how I had said no to being adopted. I realized a lot of my thoughts weren’t necessarily true, like the thought that they only offered to adopt me because they felt bad for me, not because they loved me — I didn’t have any evidence for that. Even some thoughts that were true, like that past placements hadn’t stuck, weren’t helpful for me to think about, because my past placements and my current one weren’t the same. Those thoughts weren’t helping me, and they were actually getting in the way of me locking in with my current foster family.',
      },
      {
        audio: '/cast/audio/sam-16-line-7.mp3',
        scene: 'Voice-over (transitioning toward the realization)',
        text:
          'Recognizing that helped me begin to picture myself belonging to their family. But there was still something major that I couldn’t figure out: how could I be adopted and belong to a new family when my real mom was still out there?',
      },
      {
        audio: '/cast/audio/sam-16-line-5.mp3',
        scene: 'Voice-over (the metaphor and the resolution — closing narration)',
        text:
          'On the final night of our show, I was backstage using the light from the stage manager’s lamp to read the directions for the next scene change while looking out at the main character standing on stage in her spotlight. And I realized: this backstage light isn’t gone or unimportant just because of the spotlight shining on stage. Actually, the show only works because both lights are there. That’s a lot like my mom and my new family. I’m only me because of both of my families. That’s when I knew two things can be true at the same time: I can love and miss my mom, and I can belong to my new family too. I don’t have to choose between them because they’re just different roles in the same production, and they’re both part of my story.',
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
