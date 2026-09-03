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

import FeedbackButton from '../FeedbackButton.jsx'
import { GAINS_FEEDBACK_SECTIONS } from '../../pages/gainsFeedbackSections.js'

export const REVIEW_VIDEOS = [
  { title: 'Zone 1 — What is Trauma', id: '1223215595', h: '2b10eb8857', section: 'video-1' },
  { title: 'Zone 2 — The Four Reactions', id: '1223210105', h: '315f412718', section: 'video-2' },
  { title: 'Zone 3 — Getting the Best Therapy', id: '1223207965', h: 'd0c77b8f23', section: 'video-3' },
  { title: 'Zone 4 — What Therapy Feels Like', id: '1223708060', h: '2ab5970912', section: 'video-4' },
  { title: 'Zone 5 — Growth Mindset', id: '1223211325', h: 'b8579c9aa1', section: 'video-5' },
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
