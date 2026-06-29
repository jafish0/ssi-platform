// Public layout used by the temporary /demo page (and its sandbox sub-route).
// Intentionally NOT inside AdminLayout so it can be linked to anyone — the
// whole point of the demo is to share without needing admin sign-in.
//
// Marked as a TEMP demo file so when we no longer need this, it's easy to
// `git rm` together with src/pages/DemoPage.jsx + DemoSandboxPage.jsx and
// the two routes in App.jsx.

import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import LogoStrip from './LogoStrip.jsx'
import FeedbackButton from './FeedbackButton.jsx'

export default function DemoPageLayout({ children, narrow = false, banner = true }) {
  return (
    <div className="min-h-screen bg-ctac-teal-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
          <Link to="/demo" className="inline-flex items-center gap-2 text-slate-800">
            <Sparkles size={18} strokeWidth={1.5} className="text-ctac-teal-600" />
            <span className="font-semibold text-[16px]">SSI Platform · Demo</span>
          </Link>
          <div className="flex-1" />
          <LogoStrip variant="institutional" />
          <FeedbackButton />
        </div>
      </header>

      {banner && (
        <div className="bg-ctac-teal-100 border-b border-ctac-teal-200 text-ctac-teal-900 text-[13px] text-center px-4 py-2">
          This is a private demo for the IRF Team. No real participant data is
          involved.
        </div>
      )}

      <main className={'flex-1 px-4 py-6 ' + (narrow ? 'max-w-[760px] mx-auto w-full' : 'max-w-[1100px] mx-auto w-full')}>
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-8">
        <div className="max-w-[1100px] mx-auto px-4 py-4 text-[12px] text-slate-500 flex items-center justify-between gap-3 flex-wrap">
          <span>Center on Trauma and Children · University of Kentucky</span>
          <span className="font-mono">/demo</span>
        </div>
      </footer>
    </div>
  )
}
