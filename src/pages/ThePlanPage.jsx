// ThePlanPage — placeholder destination for "The Plan," the kid's final
// reflective activity (Draft 37, Part H.2). The Plan itself is separate
// scope; this route just gives the SessionSummary "Ready for The Plan?"
// CTA somewhere to land. When the real Plan activity ships, this page
// gets replaced.
//
// TEMP demo file — remove alongside DemoPage / DemoSandboxPage and the
// demo routes in App.jsx when the demo is retired (or replace with the
// real Plan activity when that lands).

import { Link } from 'react-router-dom'
import DemoPageLayout from '../components/DemoPageLayout.jsx'

export default function ThePlanPage() {
  return (
    <DemoPageLayout narrow>
      <div className="bg-white rounded-2xl shadow-card p-8 text-center mt-6">
        <h1 className="text-3xl font-bold text-ctac-navy mb-4">The Plan</h1>
        <p className="text-[16px] text-slate-700 leading-relaxed mb-2">
          This is where your action plan will live.
        </p>
        <p className="text-[15px] text-slate-600 leading-relaxed mb-8 max-w-[520px] mx-auto">
          We’re still building it. The Plan will pull forward the skills you’re
          willing to try, the people in your safety net, and the new thoughts
          you wrote — and help you decide who you’ll do it with, and when.
          Check back soon.
        </p>
        <Link
          to="/demo"
          className="inline-block bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white rounded-full px-8 py-4 text-[16px] font-semibold transition-colors"
        >
          Back to demo
        </Link>
      </div>
    </DemoPageLayout>
  )
}
