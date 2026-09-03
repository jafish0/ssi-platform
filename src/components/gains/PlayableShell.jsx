// Shell for a dedicated GAINS playable page (Draft 71): the same pattern as
// /gains-demo/climb and /gains-demo/zone4 -- DemoPageLayout, a back link,
// the review card's blurb at the top, ONE centered 9:16 phone frame with
// the playable inside exactly as it will appear in the game, a Restart, and
// the page's feedback default pointed at that item's tag.
//
// `children` renders inside the frame; Restart remounts it (key bump) so
// every playable's own internal state resets without needing a reset API.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import DemoPageLayout from '../DemoPageLayout.jsx'
import { GAINS_FEEDBACK_SECTIONS } from '../../pages/gainsFeedbackSections.js'
import '../../styles/gains-tokens.css'

export default function PlayableShell({ title, docTitle, blurb, section, route, note, children }) {
  const [runKey, setRunKey] = useState(0)

  useEffect(() => {
    const prev = document.title
    document.title = docTitle || `GAINS for Teens — ${title}`
    return () => {
      document.title = prev
    }
  }, [title, docTitle])

  return (
    <DemoPageLayout
      banner={false}
      homeTo="/gains-demo"
      homeLabel="GAINS for Teens · Demo"
      footerPath={route}
      feedbackProgram="gains-teens"
      feedbackSections={GAINS_FEEDBACK_SECTIONS}
      feedbackDefaultSection={section}
    >
      <div className="mb-4">
        <Link to="/gains-demo" className="inline-flex items-center gap-1 text-ctac-teal-700 hover:text-ctac-teal-900 text-[13px] font-medium">
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to GAINS demo
        </Link>
      </div>

      <section className="mb-5">
        <h1 className="text-[24px] font-bold text-slate-800 mb-1">{title}</h1>
        {blurb && <p className="text-[14px] text-slate-600 leading-relaxed max-w-[620px]">{blurb}</p>}
        {note}
      </section>

      <div className="gains-theme">
        <div className="mx-auto w-full max-w-[420px]">
          <div
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: '9 / 16',
              borderRadius: 'var(--radius-2xl)',
              border: '1px solid var(--border-soft)',
              boxShadow: 'var(--shadow-lg)',
              background: 'var(--surface-abyss)',
              fontFamily: 'var(--font-core)',
            }}
          >
            <div key={runKey} className="absolute inset-0">
              {children}
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={() => setRunKey((k) => k + 1)}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full px-5 py-2 min-h-[40px] text-[13px]"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              <RotateCcw size={14} strokeWidth={2} />
              Restart
            </button>
          </div>

          <p className="text-center text-[12px] text-slate-400 mt-3" style={{ fontFamily: 'system-ui, sans-serif' }}>
            Review preview · shown the way it will appear in the game · nothing is saved
          </p>
        </div>
      </div>
    </DemoPageLayout>
  )
}
