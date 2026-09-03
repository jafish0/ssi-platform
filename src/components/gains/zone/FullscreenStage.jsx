// Full-viewport stage for a GAINS playable (2026-09-03, Josh's phone
// playthrough): the way the real game will feel -- a dark ground, a slim
// bar (back to the demo, Restart, Comment), and ONE 9:16 frame sized to the
// rest of the viewport: full width on a phone, full height on a desktop.
// No app header, no description (the hub card on /gains-demo carries it).
// Used by /gains-demo/zone4 and /gains-demo/climb.
//
// `frameRef` (optional) exposes the frame element to the page (Zone 4's
// gear-HUD fly-in measures against it).

import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import FeedbackButton from '../../FeedbackButton.jsx'
import { GAINS_FEEDBACK_SECTIONS } from '../../../pages/gainsFeedbackSections.js'
import '../../../styles/gains-tokens.css'

export default function FullscreenStage({ section, onRestart, showRestart = false, frameRef, children }) {
  return (
    <div className="gains-theme gains-fullstage fixed inset-0 flex flex-col" style={{ background: 'var(--surface-abyss)', fontFamily: 'var(--font-core)' }}>
      <header className="flex items-center justify-between gap-2 px-3 flex-shrink-0" style={{ height: 48 }}>
        <Link
          to="/gains-demo"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold"
          style={{ color: 'var(--text-muted)', background: 'var(--action-quiet)', border: '1px solid var(--border-soft)' }}
        >
          <ArrowLeft size={14} strokeWidth={2} />
          GAINS demo
        </Link>
        <div className="flex items-center gap-2">
          {showRestart && (
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold"
              style={{ color: 'var(--text-muted)', background: 'var(--action-quiet)', border: '1px solid var(--border-soft)' }}
            >
              <RotateCcw size={13} strokeWidth={2} />
              Restart
            </button>
          )}
          <FeedbackButton program="gains-teens" sections={GAINS_FEEDBACK_SECTIONS} defaultSection={section} label="Comment" subtle />
        </div>
      </header>

      <main className="flex-1 min-h-0 flex items-center justify-center px-2 pb-2">
        <div
          ref={frameRef}
          className="relative overflow-hidden"
          style={{
            width: 'min(100%, calc(var(--stage-vh, 100vh) - 64px) * 9 / 16)',
            aspectRatio: '9 / 16',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-lg)',
            background: 'var(--surface-abyss)',
            fontFamily: 'var(--font-core)',
          }}
        >
          {children}
        </div>
      </main>

      <style>{`
        /* dvh tracks the phone browser's real visible height (toolbars come
           and go); vh is the fallback. */
        .gains-fullstage { height: 100vh; height: 100dvh; --stage-vh: 100vh; }
        @supports (height: 100dvh) { .gains-fullstage { --stage-vh: 100dvh; } }
      `}</style>
    </div>
  )
}
