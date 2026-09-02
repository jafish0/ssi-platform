// GAINS pretest/posttest measurement flow (Draft 54, 2026-09-01).
//
// Paginated administration flow for the measurement packet (Draft 53) --
// one instrument per page inside the mobile phone frame, with a progress
// indicator and a Continue button, matching how the measures will actually
// be administered in the real app. Reuses the exact page/instrument
// definitions from `MeasurementPacket.jsx` -- no items changed, only the
// layout (that file used to render everything as one flat scroll).
//
// Review-only: nothing is stored or scored here. Live capture + scoring to
// Supabase is a separate follow-up (see MeasurementPacket.jsx's header).

import { useState } from 'react'
import { PRE_TEST_PAGES, POST_TEST_PAGES, Instrument } from './MeasurementPacket.jsx'

export default function MeasurementFlow({ flow }) {
  const pages = flow === 'post' ? POST_TEST_PAGES : PRE_TEST_PAGES
  const stepLabel = flow === 'post' ? 'Post-test' : 'Pre-test'

  const [v, setV] = useState({})
  const [page, setPage] = useState(0)
  const set = (key) => (val) => setV((prev) => ({ ...prev, [key]: val }))

  const done = page >= pages.length
  const current = pages[page]

  // The therapy-history page reveals follow-up questions based on this
  // answer -- Continue waits for it so the branch a tester sees next
  // matches what they just picked, instead of skipping past unanswered.
  const continueDisabled = current?.id === 'therapy-history' && !v.therapy_current

  function restart() {
    setPage(0)
    setV({})
  }

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden" style={{ background: 'var(--surface-abyss)', fontFamily: 'var(--font-core)' }}>
      <div className="px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-soft)' }}>
        <div className="text-[10px] font-extrabold tracking-[0.16em] uppercase mb-2" style={{ color: 'var(--text-warm)' }}>
          {stepLabel}
        </div>
        {!done && (
          <>
            <p className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Step {page + 1} of {pages.length}
            </p>
            <div className="flex gap-1">
              {pages.map((p, i) => (
                <span
                  key={p.id}
                  className="h-1.5 flex-1 rounded-full"
                  style={{ background: i <= page ? 'var(--action-primary)' : 'var(--action-quiet)' }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {done ? (
          <div className="text-center py-8">
            <p className="font-extrabold text-[15px] mb-1" style={{ color: 'var(--text-warm)' }}>
              {stepLabel} complete
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-bright)' }}>
              Nothing here is saved or scored — this is a review-only preview
              of how the measures will be administered.
            </p>
          </div>
        ) : (
          <Instrument title={current.title} timing={current.timing} prompt={current.prompt} note={current.note}>
            <current.Fields v={v} set={set} />
          </Instrument>
        )}
      </div>

      <div className="px-4 pb-4 pt-3 flex-shrink-0" style={{ borderTop: done ? 'none' : '1px solid var(--border-soft)' }}>
        {done ? (
          <button
            type="button"
            onClick={restart}
            className="w-full py-2.5 rounded-full text-[14px] font-extrabold"
            style={{ background: 'var(--action-quiet)', color: 'var(--text-bright)', border: '1px solid var(--border-soft)' }}
          >
            Start over
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={continueDisabled}
            className="w-full py-2.5 rounded-full disabled:opacity-[.42] disabled:cursor-not-allowed text-[15px] font-extrabold"
            style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
          >
            {page === pages.length - 1 ? 'Finish' : 'Continue'}
          </button>
        )}
      </div>
    </div>
  )
}
