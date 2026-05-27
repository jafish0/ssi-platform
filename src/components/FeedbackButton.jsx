// Persistent "Give feedback" button + modal used by the public /demo
// pages. Auto-fills the "Where you are" field from the current route so
// IRF Team submissions arrive with context already attached. Submits to
// the unauthenticated submit-feedback edge function.

import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { MessageSquare, X, CheckCircle2 } from 'lucide-react'
import { findTestEntry } from '../lib/testRegistry.js'
import { getActivityVersion } from '../lib/activityVersions.js'
import { callEdgeFunction } from '../lib/api.js'

const CATEGORIES = [
  { value: 'activity_copy', label: 'Activity copy / wording' },
  { value: 'activity_design', label: 'Activity design / flow' },
  { value: 'bug', label: 'Bug or technical issue' },
  { value: 'data_export', label: 'Data export' },
  { value: 'video', label: 'Video / animation' },
  { value: 'general', label: 'General comment' },
]

const SUBMITTERS = [
  { value: 'ginny', label: 'Ginny' },
  { value: 'adrienne', label: 'Adrienne' },
  { value: 'jessica', label: 'Jessica' },
  { value: 'holly', label: 'Holly' },
  { value: 'bianca', label: 'Bianca' },
  { value: 'stephanie', label: 'Stephanie' },
  { value: 'josh', label: 'Josh' },
  { value: 'anonymous', label: 'Anonymous' },
]

function deriveContext(pathname, params) {
  // /demo/sandbox/:activityId — try to resolve the displayName from
  // TEST_REGISTRY so the area string reads naturally ("Activity: Getting
  // Unstuck · v1.0"). Fall back to the raw slug if anything's off.
  if (pathname.startsWith('/demo/sandbox/')) {
    const id = params.activityId || pathname.split('/').pop()
    const entry = findTestEntry(id)
    const versionInfo = getActivityVersion(id)
    const versionTag = versionInfo ? ` · ${versionInfo.version}` : ''
    return {
      area: entry
        ? `Activity: ${entry.displayName}${versionTag}`
        : `Activity: ${id}${versionTag}`,
      activity_id: id || null,
      activity_version: versionInfo ? versionInfo.version : null,
    }
  }
  if (pathname === '/demo' || pathname === '/demo/') {
    return { area: 'Demo home', activity_id: null, activity_version: null }
  }
  return { area: pathname, activity_id: null, activity_version: null }
}

export default function FeedbackButton() {
  const location = useLocation()
  const params = useParams()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const ctx = useMemo(() => deriveContext(location.pathname, params), [location.pathname, params])

  const [area, setArea] = useState(ctx.area)
  const [areaEditing, setAreaEditing] = useState(false)
  // Default to Ginny Sprang (Josh's 2026-05-19 call). Anonymous is
  // still a selectable option in the dropdown; only the initial value
  // flips.
  const [submitter, setSubmitter] = useState('ginny')
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Re-sync the auto-filled area when the route changes (and the user
    // hasn't chosen to override it).
    if (!areaEditing) setArea(ctx.area)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.area])

  function reset() {
    setSubmitting(false)
    setError(null)
    setDone(false)
    setArea(ctx.area)
    setAreaEditing(false)
    setSubmitter('ginny')
    setCategory('general')
    setMessage('')
  }

  function close() {
    setOpen(false)
    // delay the reset so the success state isn't wiped while the modal
    // is still fading away
    setTimeout(reset, 200)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const trimmed = message.trim()
    if (trimmed.length === 0) {
      setError('Please write some feedback before sending.')
      return
    }
    setSubmitting(true)
    try {
      await callEdgeFunction('submit-feedback', {
        page_path: location.pathname,
        area: area?.trim() || ctx.area,
        activity_id: ctx.activity_id,
        activity_version: ctx.activity_version,
        category,
        submitter,
        message: trimmed,
      })
      setDone(true)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not send your feedback. Try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-4 py-2 min-h-[40px] text-[13px]"
      >
        <MessageSquare size={14} strokeWidth={2} />
        Give feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-8 bg-slate-900/40 overflow-y-auto">
          <div className="relative w-full max-w-[520px] bg-white rounded-2xl shadow-card p-6 my-4">
            <button
              type="button"
              onClick={close}
              className="absolute top-3 right-3 p-2 rounded-full text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            {done ? (
              <div role="status" className="text-center py-4">
                <CheckCircle2 size={36} strokeWidth={1.5} className="text-emerald-500 mx-auto mb-3" />
                <h2 className="text-[20px] font-semibold mb-2">Thanks — your feedback was sent.</h2>
                <p className="text-[14px] text-slate-700 mb-5">
                  Josh and the engineer will see it in the admin review.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-6 py-2 min-h-[44px] text-[14px]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-[20px] font-semibold mb-1">Give feedback</h2>
                <p className="text-[13px] text-slate-500 mb-5">
                  Quick reactions, ideas, or things to fix — anything helps.
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[13px] font-medium text-slate-700">
                        Where you are
                      </label>
                      {!areaEditing && (
                        <button
                          type="button"
                          onClick={() => setAreaEditing(true)}
                          className="text-[12px] text-amber-700 hover:text-amber-900 underline"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    {areaEditing ? (
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full text-[14px] px-3 py-2 min-h-[40px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
                      />
                    ) : (
                      <div className="text-[14px] px-3 py-2 min-h-[40px] bg-slate-50 border border-slate-200 rounded-2xl text-slate-700">
                        {area}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[13px] font-medium text-slate-700 mb-1">From</label>
                      <select
                        value={submitter}
                        onChange={(e) => setSubmitter(e.target.value)}
                        className="w-full text-[14px] px-3 py-2 min-h-[40px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
                      >
                        {SUBMITTERS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-slate-700 mb-1">
                        Type
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-[14px] px-3 py-2 min-h-[40px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-slate-700 mb-1">
                      Your feedback
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What worked, what didn't, what to change…"
                      maxLength={5000}
                      className="w-full text-[14px] leading-relaxed px-3 py-2 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
                    />
                    <div className="text-[11px] text-slate-400 mt-1 text-right">
                      {message.length} / 5000
                    </div>
                  </div>

                  {error && (
                    <div role="alert" className="text-[13px] text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-3 py-2">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={close}
                      disabled={submitting}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full px-5 py-2 min-h-[44px] text-[14px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-full px-5 py-2 min-h-[44px] text-[14px]"
                    >
                      {submitting ? 'Sending…' : 'Send feedback'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
