import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import { slugify } from '../../lib/builderUtils.js'

export default function CreateInterventionModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState('')
  const [target, setTarget] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) {
      setName('')
      setSlug('')
      setSlugTouched(false)
      setDescription('')
      setTarget('')
      setSubmitting(false)
      setError(null)
    }
  }, [open])

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError('Please give this intervention a name.')
    const safeSlug = slugify(slug)
    if (!safeSlug) return setError('Please provide a valid slug (letters, numbers, hyphens).')

    setSubmitting(true)
    try {
      const { data: existing, error: lookupErr } = await supabase
        .from('interventions')
        .select('id')
        .eq('slug', safeSlug)
        .maybeSingle()
      if (lookupErr) throw lookupErr
      if (existing) {
        setError(`Slug "${safeSlug}" is already in use. Pick a different one.`)
        setSubmitting(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      const { data, error: insErr } = await supabase
        .from('interventions')
        .insert({
          name: name.trim(),
          slug: safeSlug,
          description: description.trim() || null,
          target_population: target.trim() || null,
          is_active: false,
          created_by: user?.id || null,
        })
        .select('id')
        .single()
      if (insErr) throw insErr

      onCreated?.(data.id)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to create intervention.')
    } finally {
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
        <h2 className="text-[20px] font-semibold mb-4">Create new intervention</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className="w-full text-[15px] px-4 py-2 min-h-[44px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">
              Slug <span className="text-slate-500 font-normal">(URL-safe)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value))
                setSlugTouched(true)
              }}
              className="w-full text-[15px] font-mono px-4 py-2 min-h-[44px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Description (optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-[15px] leading-relaxed px-4 py-2 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Target population (optional)</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full text-[15px] px-4 py-2 min-h-[44px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
            />
          </div>
          {error && (
            <div className="text-[13px] text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full px-5 py-2 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-50 text-white font-semibold rounded-full px-5 py-2 min-h-[44px]"
            >
              {submitting ? 'Creating…' : 'Create & open Builder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
