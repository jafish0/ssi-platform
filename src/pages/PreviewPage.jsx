import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Eye, X } from 'lucide-react'
import ItemRenderer from '../engine/ItemRenderer.jsx'
import { GhostButton, PrimaryButton } from '../components/items/shared.jsx'
import { resolveTokenPath } from '../lib/tokens.js'
import { supabase } from '../lib/supabase.js'

function SectionTransition({ section, onContinue }) {
  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10 bg-amber-50">
      <div className="w-full max-w-[540px] text-center">
        <h1 className="text-[28px] font-bold leading-tight mb-4 text-slate-800">
          {section?.title || 'Next part'}
        </h1>
        {section?.config_json?.description && (
          <p className="text-[16px] leading-relaxed text-slate-700 mb-8 max-w-md mx-auto">
            {section.config_json.description}
          </p>
        )}
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
    </main>
  )
}

export default function PreviewPage() {
  const { id: interventionId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [intervention, setIntervention] = useState(null)
  const [sections, setSections] = useState([])
  const [items, setItems] = useState([])

  const [sectionIdx, setSectionIdx] = useState(0)
  const [itemIdx, setItemIdx] = useState(0)
  const [responses, setResponses] = useState({}) // by token_key
  const [responsesByItemId, setResponsesByItemId] = useState({})
  const [transitionVisible, setTransitionVisible] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      supabase.from('interventions').select('id, name, slug').eq('id', interventionId).single(),
      supabase.from('sections').select('id, intervention_id, order_index, type, title, config_json, is_required').eq('intervention_id', interventionId).order('order_index'),
      supabase.from('items').select('id, section_id, order_index, type, content_json, token_key, is_required').order('order_index'),
    ])
      .then(([ivRes, secRes, itRes]) => {
        if (cancelled) return
        if (ivRes.error) throw ivRes.error
        if (secRes.error) throw secRes.error
        if (itRes.error) throw itRes.error
        setIntervention(ivRes.data)
        setSections(secRes.data || [])
        const sectionIds = new Set((secRes.data || []).map((s) => s.id))
        setItems((itRes.data || []).filter((it) => sectionIds.has(it.section_id)))
      })
      .catch((err) => {
        if (cancelled) return
        console.error(err)
        setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [interventionId])

  const sectionsOrdered = useMemo(
    () => [...sections].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [sections],
  )
  const itemsBySection = useMemo(() => {
    const m = {}
    for (const it of items) {
      if (!m[it.section_id]) m[it.section_id] = []
      m[it.section_id].push(it)
    }
    for (const k of Object.keys(m)) m[k].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    return m
  }, [items])

  const currentSection = sectionsOrdered[sectionIdx]
  const currentItems = currentSection ? (itemsBySection[currentSection.id] || []) : []
  const currentItem = currentItems[itemIdx]
  const totalSections = sectionsOrdered.length
  const isFirstItem = sectionIdx === 0 && itemIdx === 0

  const goNext = useCallback(() => {
    if (!currentSection) return
    if (itemIdx < currentItems.length - 1) {
      setItemIdx((i) => i + 1)
      return
    }
    if (sectionIdx < totalSections - 1) {
      setSectionIdx((i) => i + 1)
      setItemIdx(0)
      setTransitionVisible(true)
      return
    }
    setCompleted(true)
  }, [currentSection, itemIdx, currentItems.length, sectionIdx, totalSections])

  const goBack = useCallback(() => {
    if (itemIdx > 0) {
      setItemIdx((i) => i - 1)
      return
    }
    if (sectionIdx > 0) {
      const prevIdx = sectionIdx - 1
      const prevSection = sectionsOrdered[prevIdx]
      const prevItems = prevSection ? itemsBySection[prevSection.id] || [] : []
      setSectionIdx(prevIdx)
      setItemIdx(Math.max(0, prevItems.length - 1))
    }
  }, [itemIdx, sectionIdx, sectionsOrdered, itemsBySection])

  function resolveToken(path) {
    return resolveTokenPath(path, responses)
  }

  async function handleSave(value) {
    // In preview, do NOT write to DB. Update local state and advance.
    if (currentItem) {
      setResponsesByItemId((prev) => ({ ...prev, [currentItem.id]: value }))
      if (currentItem.token_key) {
        setResponses((prev) => ({ ...prev, [currentItem.token_key]: value }))
      }
    }
    goNext()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>
  }
  if (error || !intervention) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-card p-6 max-w-md">
          <h2 className="text-[18px] font-semibold mb-2">Couldn't load preview</h2>
          <p className="text-[14px] text-slate-700">{error?.message || 'Unknown error'}</p>
        </div>
      </div>
    )
  }
  if (sectionsOrdered.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-card p-6 max-w-md text-center">
          <h2 className="text-[18px] font-semibold mb-2">No content</h2>
          <p className="text-[14px] text-slate-700">This intervention has no sections yet.</p>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <>
        <PreviewBanner onClose={() => window.close()} />
        <main className="min-h-screen flex items-center justify-center px-4 pt-14">
          <div className="bg-white rounded-2xl shadow-card p-6 max-w-md text-center">
            <h2 className="text-[22px] font-semibold mb-2">End of preview</h2>
            <p className="text-[14px] text-slate-700 mb-4">
              You reached the last item. Responses were not saved (preview mode).
            </p>
            <button
              onClick={() => { setSectionIdx(0); setItemIdx(0); setResponses({}); setResponsesByItemId({}); setCompleted(false) }}
              className="text-amber-700 hover:text-amber-900 text-[14px]"
            >
              Restart preview
            </button>
          </div>
        </main>
      </>
    )
  }

  const progressFraction = totalSections > 0 ? sectionIdx / totalSections : 0
  const totalItems = currentItems.length
  const existingResponse = currentItem ? responsesByItemId[currentItem.id] : undefined

  return (
    <>
      <PreviewBanner onClose={() => window.close()} />
      <div className="fixed top-[40px] left-0 right-0 h-1 bg-amber-100 z-40" aria-hidden="true">
        <div
          className="h-full bg-amber-400 transition-all duration-[600ms] ease-out"
          style={{ width: `${Math.round(progressFraction * 100)}%` }}
        />
      </div>

      {transitionVisible ? (
        <SectionTransition
          section={currentSection}
          onContinue={() => setTransitionVisible(false)}
        />
      ) : (
        <main className="min-h-screen flex items-start justify-center px-4 py-8 pt-16">
          <div className="w-full max-w-[640px]">
            {currentSection?.title && (
              <div className="text-[13px] text-slate-500 mb-3 px-1">
                <span className="font-semibold text-slate-700">{currentSection.title}</span>
                <span className="ml-2">· {itemIdx + 1} of {totalItems}</span>
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
              {currentItem ? (
                <ItemRenderer
                  item={currentItem}
                  onSave={handleSave}
                  sessionData={responses}
                  resolveToken={resolveToken}
                  existingResponse={existingResponse}
                />
              ) : (
                <div className="text-[14px] text-slate-500 italic text-center py-6">
                  This section has no items.
                </div>
              )}
            </div>
            {!isFirstItem && (
              <div className="mt-4">
                <GhostButton onClick={goBack}>← Back</GhostButton>
              </div>
            )}
            <div className="text-center mt-6 text-[12px] text-slate-400">
              Part {sectionIdx + 1} of {totalSections}
            </div>
          </div>
        </main>
      )}
    </>
  )
}

function PreviewBanner({ onClose }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-between shadow-card">
      <div className="flex items-center gap-2 text-[13px] font-semibold">
        <Eye size={16} strokeWidth={2} />
        Preview mode — responses are not saved
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded hover:bg-amber-600"
        title="Close preview"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  )
}
