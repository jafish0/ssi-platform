// The five zone psychoeducation videos for review (Draft 51/52/55), shared
// by the /gains-demo/videos page (Draft 71) and anything else that needs
// the current renders.
//
// These are unlisted Vimeo videos (id + privacy hash, not public), so
// they're embedded via player.vimeo.com's own `?h=` hash-embed URL rather
// than the public vimeo.com/{id} page -- the standard way to embed an
// unlisted Vimeo video anywhere.
// Draft 55 (2026-09-01): re-rendered links for 1/2/3/5, exported clean --
// no baked-in captions or "Spark" label; real captions go on in Vimeo as
// text tracks. Each carries its own feedback `section` tag so a comment
// maps to a specific video in the CSV export.
// Video 1 swapped again (2026-09-01, Josh) to a newer re-render.
// Video 4 swapped (Draft 70, 2026-09-03) to a render without the burned-in
// Spark subtitles; the Zone 4 walkable zone plays the same id (VIDEO4 in
// GainsZone4Page) -- keep the two in step.
// Draft 88 (2026-09-16): all five re-rendered again with the 9/11 edits and
// the new Spark cutout -- same ids swapped in `zones.js` for Zones 1/3/4.
// Draft 92 (2026-09-22): Video 3 re-rendered again -- five treatment types,
// a four-reaction opener; same id/hash swapped in `zones.js`'s zone3.video.

import FeedbackButton from '../FeedbackButton.jsx'
import { GAINS_FEEDBACK_SECTIONS } from '../../pages/gainsFeedbackSections.js'

export const REVIEW_VIDEOS = [
  // Draft 83: the new game-opening video (Zone 1's intro plate, plays when
  // you reach Spark there), replacing the old Exposition card.
  { title: 'Intro — Welcome to Shadowmend', id: '1227051194', h: '8c2fcaf83f', section: 'video-0' },
  { title: 'Zone 1 — What is Trauma', id: '1227441876', h: '651daacb8a', section: 'video-1' },
  { title: 'Zone 2 — The Four Reactions', id: '1227442904', h: '46f782197e', section: 'video-2' },
  { title: 'Zone 3 — Getting the Best Therapy', id: '1229296920', h: 'fff67e51d4', section: 'video-3' },
  { title: 'Zone 4 — What Therapy Feels Like', id: '1227445659', h: '3a88ca76d5', section: 'video-4' },
  { title: 'Zone 5 — Growth Mindset', id: '1227447165', h: 'f4fe21450f', section: 'video-5' },
  // Draft 94: the four Zone 2 camp station videos (OpenArt lip-sync
  // renders, done 2026-09-23), added after Video 5 per that draft's item 3.
  { title: 'Zone 2 station — Emberwick (reactivity)', id: '1229872174', h: 'af0ffa46d4', section: 'video-z2-emberwick' },
  { title: 'Zone 2 station — Mirefly (intrusion)', id: '1229872199', h: '36e4d74a97', section: 'video-z2-mirefly' },
  { title: 'Zone 2 station — Hollowshell (avoidance)', id: '1229872207', h: 'c2e7c80508', section: 'video-z2-hollowshell' },
  { title: 'Zone 2 station — Dimmet (negative mood and thoughts)', id: '1229872170', h: '7bc6212f82', section: 'video-z2-dimmet' },
]

// One phone-portrait (9:16) player with its own comment box, laid out by
// the caller (2-per-row grid on the videos page).
export function ReviewVideo({ title, id, h, section }) {
  return (
    <div>
      <p className="text-[13px] font-semibold mb-1.5" style={{ color: 'var(--text-bright)' }}>{title}</p>
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ aspectRatio: '9 / 16', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-md)' }}
      >
        <iframe
          src={`https://player.vimeo.com/video/${id}?h=${h}&title=0&byline=0&portrait=0`}
          title={title}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="mt-2">
        <FeedbackButton
          program="gains-teens"
          sections={GAINS_FEEDBACK_SECTIONS}
          defaultSection={section}
          label="Comment on this video"
          subtle
        />
      </div>
    </div>
  )
}
