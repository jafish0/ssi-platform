// GAINS pretest/posttest measurement flow (Draft 54, 2026-09-01).
//
// Paginated administration flow for the measurement packet (Draft 53) --
// inside the mobile phone frame, with a progress indicator and a Continue
// button, matching how the measures will actually be administered in the
// real app. Reuses the exact item definitions from `MeasurementPacket.jsx`
// -- no items changed, only the layout.
//
// Review-only: nothing is stored or scored here. Live capture + scoring to
// Supabase is a separate follow-up (see MeasurementPacket.jsx's header).
//
// Draft 71 (2026-09-03): every step must fit the 9:16 frame with Continue
// always visible -- no scrolling inside the frame. The packet is chunked
// into short pages (see MeasurementPacket.jsx), and a page can be
// conditional: `skip(v)` drops it from the flow for the branch the tester
// picked, with the progress indicator counting only the pages this branch
// will actually see.
//
// 2026-09-03 (Josh): every question is mandatory. Each page declares
// `required(v)` (branch-aware); Continue stays enabled, but tapping it with
// anything unanswered highlights the missing questions on the page and
// holds the step until they're answered (the highlight clears as each one
// is answered). Scale names are no longer shown -- just the items.

import { useState } from 'react'
import { PRE_TEST_PAGES, POST_TEST_PAGES, Instrument } from './MeasurementPacket.jsx'

function answered(val) {
  if (val == null) return false
  if (Array.isArray(val)) return val.length > 0
  if (typeof val === 'string') return val.trim() !== ''
  return true
}

// `required(v)` returns keys; an entry may be an array of alternatives (any
// one answered satisfies it, and the first one is what gets highlighted).
function missingFor(page, v) {
  const req = page && page.required ? page.required(v) : []
  return req.filter((r) => (Array.isArray(r) ? !r.some((k) => answered(v[k])) : !answered(v[r]))).map((r) => (Array.isArray(r) ? r[0] : r))
}

export default function MeasurementFlow({ flow }) {
  const allPages = flow === 'post' ? POST_TEST_PAGES : PRE_TEST_PAGES
  const stepLabel = flow === 'post' ? 'Post-test' : 'Pre-test'

  const [v, setV] = useState({})
  const [page, setPage] = useState(0)
  const [attempted, setAttempted] = useState(false)
  const set = (key) => (val) => setV((prev) => ({ ...prev, [key]: val }))

  const pages = allPages.filter((p) => !(p.skip && p.skip(v)))
  const done = page >= pages.length
  const current = pages[page]
  const missing = attempted && current ? missingFor(current, v) : []

  function next() {
    if (missingFor(current, v).length) {
      setAttempted(true)
      return
    }
    setAttempted(false)
    setPage((p) => p + 1)
  }

  function restart() {
    setPage(0)
    setV({})
    setAttempted(false)
  }

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden" style={{ background: 'var(--surface-abyss)', fontFamily: 'var(--font-core)' }}>
      <div className="px-4 pt-3 pb-2.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-soft)' }}>
        <div className="text-[10px] font-extrabold tracking-[0.16em] uppercase mb-1.5" style={{ color: 'var(--text-warm)' }}>
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

      <div className="flex-1 overflow-y-auto px-4 py-4" data-measure-body>
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
          <Instrument prompt={current.prompt}>
            <current.Fields v={v} set={set} range={current.range} missing={missing} />
          </Instrument>
        )}
      </div>

      <div className="px-4 pb-3 pt-2.5 flex-shrink-0" style={{ borderTop: done ? 'none' : '1px solid var(--border-soft)' }}>
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
          <>
            {missing.length > 0 && (
              <p className="text-[12px] font-semibold text-center mb-2" style={{ color: 'var(--coral-400)' }} role="alert">
                Please answer the highlighted {missing.length === 1 ? 'question' : 'questions'} to continue.
              </p>
            )}
            <button
              type="button"
              onClick={next}
              className="w-full py-2.5 rounded-full text-[15px] font-extrabold"
              style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
            >
              {page === pages.length - 1 ? 'Finish' : 'Continue'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
