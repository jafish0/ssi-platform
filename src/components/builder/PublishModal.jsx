import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'

export default function PublishModal({
  open,
  onClose,
  sectionCount,
  itemCount,
  nextVersion,
  onPublish,
}) {
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) {
      setNotes('')
      setSubmitting(false)
      setError(null)
    }
  }, [open])

  if (!open) return null

  async function handlePublish() {
    setSubmitting(true)
    setError(null)
    try {
      await onPublish(notes)
    } catch (err) {
      setError(err.message || 'Publish failed.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-slate-900/40">
      <div className="relative w-full max-w-[520px] bg-white rounded-2xl shadow-card p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full text-slate-500 hover:bg-slate-100"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
        <h2 className="text-[20px] font-semibold mb-3">Publish version {nextVersion}</h2>
        <p className="text-[14px] text-slate-700 mb-4">
          You're about to publish a snapshot containing{' '}
          <span className="font-semibold">{sectionCount} sections</span> and{' '}
          <span className="font-semibold">{itemCount} items</span>.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 text-[13px] text-slate-700 flex items-start gap-2">
          <AlertTriangle size={16} strokeWidth={1.5} className="text-amber-700 mt-0.5 flex-shrink-0" />
          <div>
            This creates an immutable version snapshot. Ongoing sessions keep
            using their existing version — only sessions started after this
            publish will see the new content.
          </div>
        </div>

        <label className="block text-[13px] font-medium text-slate-700 mb-1">Release notes (optional)</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What changed in this version?"
          className="w-full text-[14px] leading-relaxed px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 mb-4"
        />

        {error && (
          <div className="text-[13px] text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full px-5 py-2 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={submitting}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-full px-5 py-2 min-h-[44px]"
          >
            {submitting ? 'Publishing…' : `Publish v${nextVersion}`}
          </button>
        </div>
      </div>
    </div>
  )
}
