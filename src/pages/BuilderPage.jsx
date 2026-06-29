import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Eye, Send, History, Check, AlertCircle, Loader2 } from 'lucide-react'
import AdminLayout from '../components/AdminLayout.jsx'
import SectionSidebar from '../components/builder/SectionSidebar.jsx'
import ItemList from '../components/builder/ItemList.jsx'
import ItemConfig from '../components/builder/ItemConfigs.jsx'
import PublishModal from '../components/builder/PublishModal.jsx'
import VersionsPanel from '../components/builder/VersionsPanel.jsx'
import { subPathsFor } from '../components/builder/TokenPicker.jsx'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import {
  defaultContentForType,
  assembleSnapshot,
} from '../lib/builderUtils.js'
import { useDebouncedCallback } from '../hooks/useDebouncedCallback.js'

// Postgres errcode for unique_violation; used during reorders.
const TEMP_OFFSET = 10000

function SaveStatus({ state }) {
  if (state === 'saving')
    return (
      <span className="inline-flex items-center gap-1 text-[13px] text-slate-500">
        <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
        Saving…
      </span>
    )
  if (state === 'saved')
    return (
      <span className="inline-flex items-center gap-1 text-[13px] text-emerald-700">
        <Check size={14} strokeWidth={1.5} />
        Saved
      </span>
    )
  if (state === 'error')
    return (
      <span className="inline-flex items-center gap-1 text-[13px] text-rose-600">
        <AlertCircle size={14} strokeWidth={1.5} />
        Save failed
      </span>
    )
  return null
}

export default function BuilderPage() {
  const { id: interventionId } = useParams()
  const { user, role } = useAuth()
  const isAdmin = role === 'admin'

  const [intervention, setIntervention] = useState(null)
  const [sections, setSections] = useState([])
  const [items, setItems] = useState([])
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [showPublish, setShowPublish] = useState(false)
  const [showVersions, setShowVersions] = useState(false)

  // Pending writes — keyed by `section:<id>` or `item:<id>`. Each value is the
  // diff to be flushed.
  const pendingRef = useRef({}) // { 'item:<id>': { content_json, ... }, 'section:<id>': { title, ... } }
  const flushingRef = useRef(false)

  // ---- Initial load ----
  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [ivRes, secRes, itRes, vRes] = await Promise.all([
        supabase.from('interventions').select('id, name, slug, description, target_population, is_active, current_version_id').eq('id', interventionId).single(),
        supabase.from('sections').select('id, intervention_id, order_index, type, title, config_json, is_required, created_at, updated_at').eq('intervention_id', interventionId).order('order_index'),
        supabase.from('items').select('id, section_id, order_index, type, content_json, token_key, is_required, created_at, updated_at').order('order_index'),
        supabase.from('intervention_versions').select('id, version_number, snapshot_json, published_by, published_at, notes').eq('intervention_id', interventionId).order('version_number', { ascending: false }),
      ])
      if (ivRes.error) throw ivRes.error
      if (secRes.error) throw secRes.error
      if (itRes.error) throw itRes.error
      if (vRes.error) throw vRes.error

      setIntervention(ivRes.data)
      setSections(secRes.data || [])
      // Filter items to those whose section_id is in our sections list
      const sectionIds = new Set((secRes.data || []).map((s) => s.id))
      setItems((itRes.data || []).filter((it) => sectionIds.has(it.section_id)))
      setVersions(vRes.data || [])

      // Default selection
      if ((secRes.data || []).length > 0) {
        setSelectedSectionId((prev) => prev || secRes.data[0].id)
      }
    } catch (err) {
      console.error(err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [interventionId])

  useEffect(() => { loadAll() }, [loadAll])

  // ---- Auto-save flush ----
  const flushPending = useCallback(async () => {
    if (flushingRef.current) return
    const pending = pendingRef.current
    const keys = Object.keys(pending)
    if (keys.length === 0) return
    flushingRef.current = true
    setSaveState('saving')

    const writes = []
    for (const key of keys) {
      const diff = pending[key]
      delete pending[key]
      const [kind, id] = key.split(':')
      if (kind === 'item') {
        writes.push(
          supabase.from('items').update(diff).eq('id', id),
        )
      } else if (kind === 'section') {
        writes.push(
          supabase.from('sections').update(diff).eq('id', id),
        )
      }
    }

    try {
      const results = await Promise.all(writes)
      const failed = results.find((r) => r.error)
      if (failed) {
        console.error('Auto-save failed', failed.error)
        setSaveState('error')
      } else {
        setSaveState('saved')
        setTimeout(() => setSaveState((s) => (s === 'saved' ? 'idle' : s)), 1500)
      }
    } catch (err) {
      console.error('Auto-save threw', err)
      setSaveState('error')
    } finally {
      flushingRef.current = false
      // If new diffs accumulated during the flush, flush again.
      if (Object.keys(pendingRef.current).length > 0) {
        flushPending()
      }
    }
  }, [])

  const debouncedFlush = useDebouncedCallback(flushPending, 500)

  function queueItemUpdate(itemId, diff) {
    const key = `item:${itemId}`
    pendingRef.current[key] = { ...(pendingRef.current[key] || {}), ...diff }
    setSaveState('saving')
    debouncedFlush()
  }

  function queueSectionUpdate(sectionId, diff) {
    const key = `section:${sectionId}`
    pendingRef.current[key] = { ...(pendingRef.current[key] || {}), ...diff }
    setSaveState('saving')
    debouncedFlush()
  }

  // ---- Sections ----
  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId) || null,
    [sections, selectedSectionId],
  )

  const sectionItems = useMemo(
    () => items
      .filter((it) => it.section_id === selectedSectionId)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [items, selectedSectionId],
  )

  const selectedItem = useMemo(
    () => items.find((it) => it.id === selectedItemId) || null,
    [items, selectedItemId],
  )

  async function handleAddSection({ type, title }) {
    const nextOrder = sections.length === 0 ? 0 : Math.max(...sections.map((s) => s.order_index)) + 1
    const { data, error: e } = await supabase
      .from('sections')
      .insert({
        intervention_id: interventionId,
        order_index: nextOrder,
        type,
        title,
        config_json: {},
        is_required: true,
      })
      .select('*')
      .single()
    if (e) {
      alert('Failed to add section: ' + e.message)
      return
    }
    setSections((prev) => [...prev, data])
    setSelectedSectionId(data.id)
  }

  async function handleDeleteSection(sectionId) {
    // Items in this section will be deleted via the FK ON DELETE CASCADE.
    const { error: e } = await supabase.from('sections').delete().eq('id', sectionId)
    if (e) {
      alert('Failed to delete section: ' + e.message)
      return
    }
    setItems((prev) => prev.filter((it) => it.section_id !== sectionId))
    setSections((prev) => {
      const remaining = prev.filter((s) => s.id !== sectionId)
      // Renumber order_index sequentially in DB.
      reorderSections(remaining.map((s) => s.id), remaining)
      return remaining.map((s, i) => ({ ...s, order_index: i }))
    })
    if (selectedSectionId === sectionId) setSelectedSectionId(null)
  }

  async function reorderSections(orderedIds, currentArr = null) {
    // Two-phase: bump everyone to (target+OFFSET) first to avoid uniqueness
    // collisions, then set to final values.
    const arr = currentArr || sections
    const targetIndex = {}
    orderedIds.forEach((id, i) => { targetIndex[id] = i })
    setSaveState('saving')

    try {
      // Phase 1: temp values
      for (const s of arr) {
        const target = targetIndex[s.id]
        if (target === undefined) continue
        await supabase.from('sections').update({ order_index: target + TEMP_OFFSET }).eq('id', s.id)
      }
      // Phase 2: final values
      for (const id of orderedIds) {
        await supabase.from('sections').update({ order_index: targetIndex[id] }).eq('id', id)
      }
      setSections((prev) => prev.map((s) => ({ ...s, order_index: targetIndex[s.id] ?? s.order_index })).sort((a, b) => a.order_index - b.order_index))
      setSaveState('saved')
      setTimeout(() => setSaveState((st) => st === 'saved' ? 'idle' : st), 1500)
    } catch (err) {
      console.error('Section reorder failed', err)
      setSaveState('error')
    }
  }

  async function handleAddItem(type) {
    if (!selectedSectionId) return
    const sectionItemsArr = items.filter((it) => it.section_id === selectedSectionId)
    const nextOrder = sectionItemsArr.length === 0 ? 0 : Math.max(...sectionItemsArr.map((it) => it.order_index)) + 1
    const { data, error: e } = await supabase
      .from('items')
      .insert({
        section_id: selectedSectionId,
        order_index: nextOrder,
        type,
        content_json: defaultContentForType(type),
        is_required: true,
      })
      .select('*')
      .single()
    if (e) {
      alert('Failed to add item: ' + e.message)
      return
    }
    setItems((prev) => [...prev, data])
    setSelectedItemId(data.id)
  }

  async function handleDeleteItem(itemId) {
    const { error: e } = await supabase.from('items').delete().eq('id', itemId)
    if (e) {
      alert('Failed to delete item: ' + e.message)
      return
    }
    setItems((prev) => {
      // Renumber section's items
      const remaining = prev.filter((it) => it.id !== itemId)
      const sect = items.find((it) => it.id === itemId)?.section_id
      if (sect) {
        const ordered = remaining
          .filter((it) => it.section_id === sect)
          .sort((a, b) => a.order_index - b.order_index)
          .map((it) => it.id)
        reorderItems(sect, ordered, remaining)
      }
      return remaining
    })
    if (selectedItemId === itemId) setSelectedItemId(null)
  }

  async function reorderItems(sectionId, orderedIds, currentItems = null) {
    const arr = currentItems || items
    const sectionItemsLocal = arr.filter((it) => it.section_id === sectionId)
    const targetIndex = {}
    orderedIds.forEach((id, i) => { targetIndex[id] = i })
    setSaveState('saving')
    try {
      // Phase 1
      for (const it of sectionItemsLocal) {
        const target = targetIndex[it.id]
        if (target === undefined) continue
        await supabase.from('items').update({ order_index: target + TEMP_OFFSET }).eq('id', it.id)
      }
      // Phase 2
      for (const id of orderedIds) {
        await supabase.from('items').update({ order_index: targetIndex[id] }).eq('id', id)
      }
      setItems((prev) => prev.map((it) => {
        if (it.section_id !== sectionId) return it
        return { ...it, order_index: targetIndex[it.id] ?? it.order_index }
      }))
      setSaveState('saved')
      setTimeout(() => setSaveState((st) => st === 'saved' ? 'idle' : st), 1500)
    } catch (err) {
      console.error('Item reorder failed', err)
      setSaveState('error')
    }
  }

  function handlePatchItem(diff) {
    if (!selectedItemId) return
    // Strip transient fields like _propsText
    const cleanDiff = { ...diff }
    if (cleanDiff.content_json && '_propsText' in cleanDiff.content_json) {
      const c = { ...cleanDiff.content_json }
      delete c._propsText
      cleanDiff.content_json = c
    }
    setItems((prev) => prev.map((it) => (it.id === selectedItemId ? { ...it, ...diff } : it)))
    queueItemUpdate(selectedItemId, cleanDiff)
  }

  // Token picker data — all items in this intervention with token_keys
  const tokenItems = useMemo(() => {
    const sectionTitle = (sectionId) => sections.find((s) => s.id === sectionId)?.title || ''
    return items
      .filter((it) => it.token_key)
      .map((it) => ({
        token_key: it.token_key,
        item_type: it.type,
        section_title: sectionTitle(it.section_id),
        sub_paths: subPathsFor(it.type, it.content_json),
      }))
  }, [items, sections])

  // ---- Publish ----
  const nextVersionNumber = useMemo(() => {
    const max = versions.reduce((acc, v) => Math.max(acc, v.version_number), -1)
    return max + 1
  }, [versions])

  async function handlePublish(notes) {
    // Make sure pending edits are flushed before snapshotting
    await flushPending()

    const snapshot = assembleSnapshot({
      sections,
      items,
      publishedAt: new Date().toISOString(),
      publishedBy: user?.email || null,
    })

    const { data: newV, error: insErr } = await supabase
      .from('intervention_versions')
      .insert({
        intervention_id: interventionId,
        version_number: nextVersionNumber,
        snapshot_json: snapshot,
        published_by: user?.id || null,
        notes: notes || null,
      })
      .select('id, version_number, snapshot_json, published_by, published_at, notes')
      .single()

    if (insErr) throw insErr

    const { error: ivErr } = await supabase
      .from('interventions')
      .update({ current_version_id: newV.id })
      .eq('id', interventionId)
    if (ivErr) throw ivErr

    setVersions((prev) => [newV, ...prev])
    setIntervention((prev) => prev ? { ...prev, current_version_id: newV.id } : prev)
    setShowPublish(false)
    alert(`Version ${newV.version_number} published.`)
  }

  async function handleRollback(versionId) {
    const { error: e } = await supabase
      .from('interventions')
      .update({ current_version_id: versionId })
      .eq('id', interventionId)
    if (e) {
      alert('Rollback failed: ' + e.message)
      return
    }
    setIntervention((prev) => prev ? { ...prev, current_version_id: versionId } : prev)
  }

  // ---- Render ----

  if (loading) {
    return (
      <AdminLayout title="Builder">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-500">Loading…</div>
      </AdminLayout>
    )
  }
  if (error || !intervention) {
    return (
      <AdminLayout title="Builder">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-[18px] font-semibold mb-2">Couldn't load intervention</h2>
          <p className="text-[14px] text-slate-700 mb-4">{error?.message || 'Not found.'}</p>
          <Link to="/admin/interventions" className="text-ctac-teal-700 hover:text-ctac-teal-900 text-[14px]">← Back to interventions</Link>
        </div>
      </AdminLayout>
    )
  }

  const itemCount = items.length

  return (
    <AdminLayout title={intervention.name}>
      <PublishModal
        open={showPublish}
        onClose={() => setShowPublish(false)}
        sectionCount={sections.length}
        itemCount={itemCount}
        nextVersion={nextVersionNumber}
        onPublish={handlePublish}
      />

      {/* Top toolbar */}
      <div className="bg-white rounded-2xl shadow-card px-4 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/admin/interventions" className="text-[13px] text-ctac-teal-700 hover:text-ctac-teal-900">← Back</Link>
          <div className="text-[13px] text-slate-500 font-mono truncate">{intervention.slug}</div>
          <SaveStatus state={saveState} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => window.open(`/preview/${interventionId}`, '_blank')}
            className="inline-flex items-center gap-1 bg-ctac-teal-100 hover:bg-ctac-teal-200 text-ctac-teal-800 font-semibold rounded-full px-4 py-1.5 min-h-[40px] text-[13px]"
          >
            <Eye size={14} strokeWidth={1.5} />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setShowVersions((v) => !v)}
            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full px-4 py-1.5 min-h-[40px] text-[13px]"
          >
            <History size={14} strokeWidth={1.5} />
            Versions ({versions.length})
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowPublish(true)}
              disabled={sections.length === 0}
              className="inline-flex items-center gap-1 bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-1.5 min-h-[40px] text-[13px]"
            >
              <Send size={14} strokeWidth={1.5} />
              Publish
            </button>
          )}
        </div>
      </div>

      {showVersions && (
        <div className="mb-4">
          <VersionsPanel
            versions={versions}
            currentVersionId={intervention.current_version_id}
            onRollback={handleRollback}
            onClose={() => setShowVersions(false)}
          />
        </div>
      )}

      {/* Three-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ minHeight: '70vh' }}>
        <div className="lg:col-span-3">
          <SectionSidebar
            sections={sections}
            items={items}
            selectedSectionId={selectedSectionId}
            onSelect={(id) => { setSelectedSectionId(id); setSelectedItemId(null) }}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            onReorder={(orderedIds) => reorderSections(orderedIds)}
          />
        </div>

        <div className="lg:col-span-4">
          {selectedSection && (
            <div className="bg-white rounded-2xl shadow-card p-4 mb-4 space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1">Section title</label>
                <input
                  type="text"
                  value={selectedSection.title || ''}
                  onChange={(e) => {
                    const newTitle = e.target.value
                    setSections((prev) => prev.map((s) => s.id === selectedSection.id ? { ...s, title: newTitle } : s))
                    queueSectionUpdate(selectedSection.id, { title: newTitle })
                  }}
                  className="w-full text-[14px] px-3 py-2 min-h-[40px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1">Section type</label>
                <select
                  value={selectedSection.type}
                  onChange={(e) => {
                    const t = e.target.value
                    setSections((prev) => prev.map((s) => s.id === selectedSection.id ? { ...s, type: t } : s))
                    queueSectionUpdate(selectedSection.id, { type: t })
                  }}
                  className="w-full text-[14px] px-3 py-2 min-h-[40px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400"
                >
                  <option value="intro">intro</option>
                  <option value="psychometric">psychometric</option>
                  <option value="psychoeducation">psychoeducation</option>
                  <option value="activity">activity</option>
                  <option value="outro">outro</option>
                  <option value="custom">custom</option>
                </select>
              </div>
            </div>
          )}
          <ItemList
            section={selectedSection}
            items={sectionItems}
            selectedItemId={selectedItemId}
            onSelect={setSelectedItemId}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onReorder={(orderedIds) => reorderItems(selectedSection.id, orderedIds)}
          />
        </div>

        <div className="lg:col-span-5">
          {selectedItem ? (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[16px] font-semibold text-slate-800">
                  {selectedItem.type}
                </h2>
                <span className="text-[12px] text-slate-500 font-mono">{selectedItem.id.slice(0, 8)}</span>
              </div>
              <ItemConfig
                item={selectedItem}
                onPatch={handlePatchItem}
                tokenItems={tokenItems}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-500 text-[14px]">
              Select an item to edit its content.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
