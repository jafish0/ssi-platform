// /gains-demo/videos — the five zone psychoeducation videos (Draft 71),
// in the 2-per-row grid Draft 55 built, each with its own comment box
// (video-1 … video-5); the page's own feedback default is the group tag
// review-videos.

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'
import FeedbackButton from '../components/FeedbackButton.jsx'
import { REVIEW_VIDEOS, ReviewVideo } from '../components/gains/reviewVideos.jsx'
import { GAINS_FEEDBACK_SECTIONS } from './gainsFeedbackSections.js'
import { reviewCard } from './gainsReviewCards.js'
import '../styles/gains-tokens.css'

export default function GainsVideosPage() {
  const card = reviewCard('videos')

  useEffect(() => {
    const prev = document.title
    document.title = 'GAINS for Teens — Videos'
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <DemoPageLayout
      banner={false}
      homeTo="/gains-demo"
      homeLabel="GAINS for Teens · Demo"
      footerPath="/gains-demo/videos"
      feedbackProgram="gains-teens"
      feedbackSections={GAINS_FEEDBACK_SECTIONS}
      feedbackDefaultSection="review-videos"
    >
      <div className="mb-4">
        <Link to="/gains-demo" className="inline-flex items-center gap-1 text-ctac-teal-700 hover:text-ctac-teal-900 text-[13px] font-medium">
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to GAINS demo
        </Link>
      </div>

      <section className="mb-5">
        <h1 className="text-[24px] font-bold text-slate-800 mb-1">Videos</h1>
        <p className="text-[14px] text-slate-600 leading-relaxed max-w-[760px]">{card.blurb}</p>
      </section>

      <div className="gains-theme">
        <div className="rounded-[28px] p-4 sm:p-6" style={{ background: 'var(--sky-abyss)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[900px] mx-auto">
            {REVIEW_VIDEOS.map((v) => (
              <ReviewVideo key={v.id} {...v} />
            ))}
          </div>
          <div className="mt-6 pt-4 flex items-center justify-between gap-3 flex-wrap max-w-[900px] mx-auto" style={{ borderTop: '1px solid var(--border-soft)' }}>
            <p className="text-[13px] italic" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-core)' }}>
              Anything about the videos as a group:
            </p>
            <FeedbackButton program="gains-teens" sections={GAINS_FEEDBACK_SECTIONS} defaultSection="review-videos" label="Comment on the videos" subtle />
          </div>
        </div>
      </div>
    </DemoPageLayout>
  )
}
