// Allies / Safety Net — Step 1 (Build) + Step 2 (Inspect), v3.0 per the
// 2026-05-11 Draft 9 batch.
//
// What ships:
//   Screen 0  Build · Intro
//   Screen 1  Build · Practical support (tile grid)
//   Screen 2  Build · Emotional support
//   Screen 3  Build · Social support
//   Screen 4  Build · Your Safety Net — TrampolineNet (non-interactive) + Continue
//   Screen 5  Inspect · Intro (clinical-safety framing)
//   Screen 6  Inspect · Interactive TrampolineNet — tap an ally to inspect
//             Modal overlays on this screen: per-ally inspect, keep-advisory,
//             removal-acknowledgment
//   Screen 7  Inspect · Complete — final TrampolineNet + Save
//
// Step 2's framing language (intro, advisory, removal-ack) is written
// to address two specific notes from the team review:
//   - Holly: don't imply real-life dropping the relationship
//   - Stephanie: more visual / less per-person interrogation
// Keep/Remove buttons stay equally weighted; "remove" is not styled as
// destructive.
//
// Build-phase selection is PER-TYPE — a kid tapping Mom on Practical
// does NOT pre-select her on Emotional. The cumulative ally entity is
// built from the union of types across screens. Custom names typed into
// other1/other2 persist across all three type screens.

import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { PrimaryButton, GhostButton } from '../components/items/shared.jsx'
import { ALLY_TILES, SUPPORT_TYPES } from '../lib/allyTiles.js'
import TrampolineNet from '../components/TrampolineNet.jsx'

// Convenience: which tile ids are custom-name-entry tiles. Keep ALLY_TILES
// as the source of truth (via `custom: true`); this is a derived set.
const CUSTOM_TILE_IDS = new Set(ALLY_TILES.filter((t) => t.custom).map((t) => t.id))

// Per-ally inspect questions. Order matters — these are the order shown
// in the modal and the keys are the column-name suffixes used in the
// export pipeline. See exportFlatten.js / demoDataset.js.
const INSPECT_QUESTIONS = [
  { key: 'trouble', text: (name) => `Does ${name} sometimes get you in trouble?` },
  { key: 'isolate', text: (name) => `Does ${name} try to keep you from spending time with other people who care about you?` },
  { key: 'lies',    text: (name) => `Does ${name} frequently lie to you?` },
  { key: 'afraid',  text: (name) => `Does ${name} sometimes make you feel afraid?` },
]
const INSPECT_ANSWERS = [
  { value: 'yes',      label: 'Yes' },
  { value: 'no',       label: 'No' },
  { value: 'not_sure', label: 'Not sure' },
]

// Initial selection shape — { [type_id]: Set<tile_id> } plus per-type
// "none of these" flags.
function initialSelection() {
  const sel = {}
  const none = {}
  for (const t of SUPPORT_TYPES) {
    sel[t.id] = new Set()
    none[t.id] = false
  }
  return { sel, none }
}

const TOTAL_SCREENS = 8

export default function AlliesSafetyNet({ onSave = console.log }) {
  const [screenIdx, setScreenIdx] = useState(0)
  // ---- Build phase state ----
  const [selection, setSelection] = useState(() => initialSelection().sel)
  const [noneFor, setNoneFor] = useState(() => initialSelection().none)
  const [customNames, setCustomNames] = useState({})
  const [editingCustom, setEditingCustom] = useState({})
  // ---- Inspect phase state ----
  // inspectionState[tileId] = { inspected: bool, flags: {trouble,isolate,lies,afraid}, kept_in_net: bool }
  const [inspectionState, setInspectionState] = useState({})
  // Modal overlay state on the interactive-net screen.
  // type ∈ 'inspect' | 'keep-advisory' | 'removal-ack' | null
  const [modal, setModal] = useState({ type: null, allyId: null })
  // ---- Submit ----
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // ---- Build-phase helpers ----

  function toggleTile(typeId, tileId) {
    setNoneFor((prev) => ({ ...prev, [typeId]: false }))
    setSelection((prev) => {
      const next = { ...prev }
      const cur = new Set(prev[typeId])
      if (cur.has(tileId)) cur.delete(tileId)
      else cur.add(tileId)
      next[typeId] = cur
      return next
    })
  }

  function commitCustomName(tileId, raw) {
    const name = (raw || '').trim()
    setEditingCustom((prev) => ({ ...prev, [tileId]: false }))
    if (!name) {
      setCustomNames((prev) => {
        const next = { ...prev }
        delete next[tileId]
        return next
      })
      setSelection((prev) => {
        const next = {}
        for (const [k, v] of Object.entries(prev)) {
          const s = new Set(v)
          s.delete(tileId)
          next[k] = s
        }
        return next
      })
      return
    }
    setCustomNames((prev) => ({ ...prev, [tileId]: name }))
  }

  function handleNoneOfThese(typeId) {
    setNoneFor((prev) => ({ ...prev, [typeId]: !prev[typeId] }))
    setSelection((prev) => ({ ...prev, [typeId]: new Set() }))
  }

  // Deduplicated ally list — each tile id (or named custom tile) appears
  // once with the union of its support types across the three build screens.
  // Adds inspection state if present.
  const deduplicatedAllies = useMemo(() => {
    const byTile = new Map()
    for (const t of SUPPORT_TYPES) {
      for (const tileId of selection[t.id] || []) {
        if (CUSTOM_TILE_IDS.has(tileId) && !customNames[tileId]) continue
        const tile = ALLY_TILES.find((x) => x.id === tileId)
        if (!tile) continue
        const displayName = tile.custom ? customNames[tileId] : tile.name
        if (!byTile.has(tileId)) {
          byTile.set(tileId, {
            id: tileId,
            name: displayName,
            custom: !!tile.custom,
            support_types: [],
          })
        }
        byTile.get(tileId).support_types.push(t.id)
      }
    }
    // Fold in inspection state — `removed` is derived from kept_in_net so
    // the TrampolineNet visual knows to fade/X out removed allies.
    return Array.from(byTile.values()).map((a) => {
      const ins = inspectionState[a.id]
      if (!ins) return a
      return {
        ...a,
        inspected: !!ins.inspected,
        removed: ins.inspected && ins.kept_in_net === false,
        kept_in_net: ins.kept_in_net,
        flags: ins.flags,
      }
    })
  }, [selection, customNames, inspectionState])

  // Active allies = those still in the net (not removed). Used by the
  // Step 2 progress counter.
  const totalAllies = deduplicatedAllies.length
  const inspectedCount = deduplicatedAllies.filter((a) => a.inspected).length

  // ---- Inspect-phase helpers ----

  function openInspectModal(allyId) {
    setModal({ type: 'inspect', allyId })
  }
  function closeModal() {
    setModal({ type: null, allyId: null })
  }

  function setFlag(allyId, key, value) {
    setInspectionState((prev) => {
      const cur = prev[allyId] || { inspected: false, flags: {}, kept_in_net: true }
      return {
        ...prev,
        [allyId]: {
          ...cur,
          flags: { ...(cur.flags || {}), [key]: value },
        },
      }
    })
  }

  function commitKeep(allyId) {
    const cur = inspectionState[allyId] || { flags: {} }
    const hasYes = Object.values(cur.flags || {}).some((v) => v === 'yes')
    setInspectionState((prev) => ({
      ...prev,
      [allyId]: {
        inspected: true,
        flags: { ...(prev[allyId]?.flags || {}) },
        kept_in_net: true,
      },
    }))
    setModal(hasYes ? { type: 'keep-advisory', allyId } : { type: null, allyId: null })
  }

  function commitRemove(allyId) {
    setInspectionState((prev) => ({
      ...prev,
      [allyId]: {
        inspected: true,
        flags: { ...(prev[allyId]?.flags || {}) },
        kept_in_net: false,
      },
    }))
    setModal({ type: 'removal-ack', allyId })
  }

  // ---- Navigation ----

  function goNext() {
    if (screenIdx < TOTAL_SCREENS - 1) setScreenIdx((i) => i + 1)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function goBack() {
    if (screenIdx > 0) setScreenIdx((i) => i - 1)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // "Done inspecting" — if not all allies inspected, confirm before advancing.
  function handleDoneInspecting() {
    if (inspectedCount < totalAllies) {
      const remaining = totalAllies - inspectedCount
      const ok = window.confirm(
        `You haven't checked in on ${remaining} ${remaining === 1 ? 'ally' : 'allies'}.\n\nFinish anyway? You can come back if you change your mind.`,
      )
      if (!ok) return
    }
    goNext()
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const finalAllies = deduplicatedAllies.map((a) => ({
        id: a.id,
        name: a.name,
        custom: !!a.custom,
        support_types: a.support_types,
        inspected: !!a.inspected,
        flags: a.flags || {},
        kept_in_net: a.kept_in_net !== false,
      }))
      const inspectionCompleted =
        finalAllies.length > 0 && finalAllies.every((a) => a.inspected)
      await onSave({
        activity: 'allies_safety_net',
        version: '3.0',
        allies: finalAllies,
        none_for: {
          practical: !!noneFor.practical,
          emotional: !!noneFor.emotional,
          social: !!noneFor.social,
        },
        inspection_completed: inspectionCompleted,
        saved_at: new Date().toISOString(),
      })
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <h2 className="text-[22px] font-semibold mb-2">Saved</h2>
        <p className="text-[15px] text-slate-700">
          Your safety net is captured. You can come back to it any time.
        </p>
      </div>
    )
  }

  // ---- Screen routing ----
  const isBuildIntro      = screenIdx === 0
  const buildTypeIdx      = screenIdx - 1            // 0..2 are the 3 type screens (screenIdx 1..3)
  const isBuildTypeScreen = buildTypeIdx >= 0 && buildTypeIdx < SUPPORT_TYPES.length
  const isBuildFinal      = screenIdx === 4
  const isInspectIntro    = screenIdx === 5
  const isInspectNet      = screenIdx === 6
  const isInspectComplete = screenIdx === 7

  return (
    <div>
      {/* Progress strip */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] text-slate-500 uppercase tracking-wide">
            Step {screenIdx + 1} of {TOTAL_SCREENS}
          </span>
          <span className="text-[12px] text-slate-500">{progressLabel(screenIdx)}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all"
            style={{ width: `${((screenIdx + 1) / TOTAL_SCREENS) * 100}%` }}
          />
        </div>
      </div>

      {isBuildIntro && <IntroScreen />}

      {isBuildTypeScreen && (
        <TypeScreen
          type={SUPPORT_TYPES[buildTypeIdx]}
          selectedIds={selection[SUPPORT_TYPES[buildTypeIdx].id]}
          isNone={!!noneFor[SUPPORT_TYPES[buildTypeIdx].id]}
          customNames={customNames}
          editingCustom={editingCustom}
          onToggleTile={(tileId) => toggleTile(SUPPORT_TYPES[buildTypeIdx].id, tileId)}
          onStartCustomEdit={(tileId) =>
            setEditingCustom((prev) => ({ ...prev, [tileId]: true }))
          }
          onCommitCustomName={commitCustomName}
          onNoneOfThese={() => handleNoneOfThese(SUPPORT_TYPES[buildTypeIdx].id)}
        />
      )}

      {isBuildFinal && (
        <BuildFinalScreen allies={deduplicatedAllies} noneFor={noneFor} />
      )}

      {isInspectIntro && <InspectIntroScreen />}

      {isInspectNet && (
        <InspectNetScreen
          allies={deduplicatedAllies}
          inspectedCount={inspectedCount}
          totalAllies={totalAllies}
          onAllyTap={openInspectModal}
        />
      )}

      {isInspectComplete && (
        <InspectCompleteScreen allies={deduplicatedAllies} noneFor={noneFor} />
      )}

      <div className="flex items-center justify-between mt-6">
        {!isBuildIntro ? (
          <GhostButton onClick={goBack}>← Back</GhostButton>
        ) : (
          <span />
        )}
        <PrimaryAdvanceButton
          screenIdx={screenIdx}
          inspectedCount={inspectedCount}
          totalAllies={totalAllies}
          submitting={submitting}
          onNext={goNext}
          onDoneInspecting={handleDoneInspecting}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Modal overlays — only render while on the interactive-net screen */}
      {isInspectNet && modal.type === 'inspect' && (
        <InspectModal
          ally={deduplicatedAllies.find((a) => a.id === modal.allyId)}
          flags={inspectionState[modal.allyId]?.flags || {}}
          onSetFlag={(key, value) => setFlag(modal.allyId, key, value)}
          onKeep={() => commitKeep(modal.allyId)}
          onRemove={() => commitRemove(modal.allyId)}
          onDismiss={closeModal}
        />
      )}
      {isInspectNet && modal.type === 'keep-advisory' && (
        <KeepAdvisoryModal onContinue={closeModal} />
      )}
      {isInspectNet && modal.type === 'removal-ack' && (
        <RemovalAckModal onContinue={closeModal} />
      )}
    </div>
  )
}

function progressLabel(idx) {
  if (idx === 0) return 'Intro'
  if (idx >= 1 && idx <= 3) return SUPPORT_TYPES[idx - 1].label
  if (idx === 4) return 'Your Safety Net'
  if (idx === 5) return 'Inspect · Intro'
  if (idx === 6) return 'Inspect · Check in'
  if (idx === 7) return 'Done'
  return ''
}

function PrimaryAdvanceButton({
  screenIdx,
  inspectedCount,
  totalAllies,
  submitting,
  onNext,
  onDoneInspecting,
  onSubmit,
}) {
  if (screenIdx === 0) {
    return <PrimaryButton onClick={onNext}>Let&apos;s build it →</PrimaryButton>
  }
  if (screenIdx >= 1 && screenIdx <= 3) {
    return <PrimaryButton onClick={onNext}>Continue →</PrimaryButton>
  }
  if (screenIdx === 4) {
    return <PrimaryButton onClick={onNext}>Inspect your net →</PrimaryButton>
  }
  if (screenIdx === 5) {
    return <PrimaryButton onClick={onNext}>Continue →</PrimaryButton>
  }
  if (screenIdx === 6) {
    const allDone = totalAllies > 0 && inspectedCount === totalAllies
    return (
      <PrimaryButton onClick={onDoneInspecting}>
        {allDone ? 'Done inspecting →' : 'Done inspecting'}
      </PrimaryButton>
    )
  }
  if (screenIdx === 7) {
    return (
      <PrimaryButton onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Saving…' : 'Save my safety net'}
      </PrimaryButton>
    )
  }
  return null
}

// ---------- Screen 0: Build intro ----------

function IntroScreen() {
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-3">
        Who are the allies in your safety net?
      </h2>
      <p className="text-[15px] leading-relaxed text-slate-800 mb-4">
        An ally is someone you trust to provide support and help you become
        the person you want to be. They might not always get it right, but
        you know they care about you, they&apos;re a positive influence,
        and they try to help.
      </p>
      <p className="text-[15px] leading-relaxed text-slate-800 mb-3">
        The strongest safety nets have allies who provide different kinds
        of support:
      </p>
      <ul className="space-y-2 mb-4 text-[15px] leading-relaxed text-slate-800">
        {SUPPORT_TYPES.map((t) => (
          <li key={t.id} className="flex gap-2">
            <span className="font-semibold text-amber-800">{t.label}</span>
            <span>— {t.definition}</span>
          </li>
        ))}
      </ul>
      <p className="text-[15px] leading-relaxed text-slate-800">
        Let&apos;s build your safety net.
      </p>
    </div>
  )
}

// ---------- Screens 1/2/3: Per-support-type tile grid ----------

function TypeScreen({
  type,
  selectedIds,
  isNone,
  customNames,
  editingCustom,
  onToggleTile,
  onStartCustomEdit,
  onCommitCustomName,
  onNoneOfThese,
}) {
  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-1">
        Who provides {type.label.toLowerCase()} support for you?
      </h2>
      <p className="text-[14px] text-slate-600 mb-5 leading-relaxed">
        {type.definition}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {ALLY_TILES.map((tile) => (
          <AllyTile
            key={tile.id}
            tile={tile}
            selected={selectedIds.has(tile.id)}
            customName={customNames[tile.id]}
            isEditing={!!editingCustom[tile.id]}
            onToggle={() => onToggleTile(tile.id)}
            onStartEdit={() => onStartCustomEdit(tile.id)}
            onCommit={(v) => onCommitCustomName(tile.id, v)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onNoneOfThese}
        aria-pressed={isNone}
        className={
          'w-full text-[14px] font-medium rounded-2xl border min-h-[48px] px-4 py-2 transition-colors ' +
          (isNone
            ? 'bg-slate-200 border-slate-400 text-slate-800'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400')
        }
      >
        {isNone
          ? `✓ Nobody for ${type.label.toLowerCase()} support right now`
          : `None of these are ${type.label.toLowerCase()} support for me.`}
      </button>
    </div>
  )
}

function AllyTile({ tile, selected, customName, isEditing, onToggle, onStartEdit, onCommit }) {
  const displayName = tile.custom ? customName || tile.name : tile.name
  const showInput = tile.custom && isEditing

  function handleTap() {
    if (tile.custom && !customName) {
      onStartEdit()
      return
    }
    onToggle()
  }

  function handleInputKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const v = e.target.value
      onCommit(v)
      if ((v || '').trim()) onToggle()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCommit('')
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleTap}
        aria-pressed={selected}
        className={
          'w-full h-full flex flex-col items-center justify-start gap-2 rounded-2xl border-2 px-3 py-3 min-h-[160px] transition-all text-center ' +
          // Note: tiles now have a soft cream background to compensate for
          // the SVGs no longer carrying their own background rect.
          'bg-amber-50/60 ' +
          (selected
            ? 'border-amber-500 ring-2 ring-amber-200 shadow-card'
            : 'border-slate-200 hover:border-amber-300')
        }
      >
        <img
          src={tile.icon}
          alt=""
          className="w-[88px] h-[88px] flex-shrink-0 pointer-events-none"
          draggable={false}
        />
        {showInput ? (
          <input
            type="text"
            autoFocus
            defaultValue={customName || ''}
            onBlur={(e) => onCommit(e.target.value)}
            onKeyDown={handleInputKey}
            onClick={(e) => e.stopPropagation()}
            placeholder="Their name"
            maxLength={40}
            className="w-full text-[13px] px-2 py-1 bg-white border border-amber-200 rounded-full text-center focus:outline-none focus:border-amber-400"
          />
        ) : (
          <span
            className={
              'text-[13px] leading-tight font-medium ' +
              (selected ? 'text-amber-900' : 'text-slate-800')
            }
          >
            {displayName}
            {tile.custom && customName && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  onStartEdit()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    onStartEdit()
                  }
                }}
                className="block text-[11px] text-amber-700 hover:text-amber-900 underline mt-0.5 cursor-pointer"
              >
                edit name
              </span>
            )}
          </span>
        )}
      </button>
      {selected && !showInput && (
        <span
          aria-hidden="true"
          className="absolute top-2 right-2 inline-flex items-center justify-center bg-amber-500 text-white rounded-full w-6 h-6 shadow"
        >
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </div>
  )
}

// ---------- Screen 4: Build final — TrampolineNet (non-interactive) ----------

function BuildFinalScreen({ allies, noneFor }) {
  const allEmpty =
    allies.length === 0 && Object.values(noneFor).some((v) => v)
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2">Your safety net</h2>
      <p className="text-[14px] text-slate-600 mb-5 leading-relaxed">
        {allEmpty
          ? 'No allies yet — that\'s okay. We\'ll look at where support could grow.'
          : 'Here\'s who you said is in your corner, grouped by the kind of support they give you. Some allies show up in more than one place — that\'s the strongest kind.'}
      </p>
      <div className="flex justify-center">
        <TrampolineNet
          allies={allies}
          interactive={false}
          showLabels={true}
          showInspectedMarks={false}
        />
      </div>
    </div>
  )
}

// ---------- Screen 5: Inspect intro ----------

function InspectIntroScreen() {
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-3">Inspect your safety net.</h2>
      <p className="text-[15px] leading-relaxed text-slate-800 mb-4">
        Your safety net is the people you&apos;d reach out to when you really
        need support. Not every important person in your life belongs in
        your safety net — and that&apos;s okay.
      </p>
      <p className="text-[15px] leading-relaxed text-slate-800 mb-2">
        An ally who belongs in your safety net is someone who:
      </p>
      <ul className="list-disc pl-6 space-y-1 text-[15px] leading-relaxed text-slate-800 mb-4">
        <li>cares about you</li>
        <li>is a positive influence</li>
        <li>tries to help when you need it</li>
      </ul>
      <p className="text-[15px] leading-relaxed text-slate-800">
        Let&apos;s check in on each ally. You can choose to keep them in
        your net or take them out. Taking someone out of your safety net
        doesn&apos;t mean they&apos;re not in your life — it just means
        they&apos;re not who you&apos;d lean on right now for support.
      </p>
    </div>
  )
}

// ---------- Screen 6: Inspect — interactive net ----------

function InspectNetScreen({ allies, inspectedCount, totalAllies, onAllyTap }) {
  if (totalAllies === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-[15px] text-slate-700 mb-3">
          No allies to inspect right now — that&apos;s okay. You can come
          back and add some later. Hit Done inspecting to continue.
        </p>
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-[20px] font-semibold">Tap each ally to check in on them.</h2>
        <span className="text-[13px] text-slate-600">
          {inspectedCount} of {totalAllies} inspected
        </span>
      </div>
      <div className="flex justify-center">
        <TrampolineNet
          allies={allies}
          interactive={true}
          onAllyTap={onAllyTap}
          showLabels={true}
          showInspectedMarks={true}
        />
      </div>
    </div>
  )
}

// ---------- Modals (overlays) on the interactive-net screen ----------

function ModalShell({ children, onDismiss }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center px-4 py-6 bg-slate-900/40 overflow-y-auto"
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-card p-5 sm:p-6 my-2"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute top-3 right-3 p-2 rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

function InspectModal({ ally, flags, onSetFlag, onKeep, onRemove, onDismiss }) {
  if (!ally) return null
  const tile = ALLY_TILES.find((t) => t.id === ally.id)
  const allAnswered = INSPECT_QUESTIONS.every((q) => !!flags[q.key])
  const hasYes = INSPECT_QUESTIONS.some((q) => flags[q.key] === 'yes')

  return (
    <ModalShell onDismiss={onDismiss}>
      <h2 className="text-[20px] font-semibold mb-3 text-center">
        Check in on {ally.name}.
      </h2>
      {tile && (
        <div className="flex justify-center mb-3">
          <img
            src={tile.icon}
            alt=""
            className="w-[80px] h-[80px]"
            draggable={false}
          />
        </div>
      )}
      <p className="text-[13px] text-slate-600 italic text-center mb-5">
        These questions might feel uncomfortable. You can answer honestly —
        the questions stay between you and the app.
      </p>

      <div className="space-y-3 mb-5">
        {INSPECT_QUESTIONS.map((q) => {
          const value = flags[q.key]
          const yes = value === 'yes'
          return (
            <div
              key={q.key}
              className={
                'rounded-2xl border px-4 py-3 transition-colors ' +
                (yes
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-white border-slate-200')
              }
            >
              <p className="text-[14px] leading-relaxed text-slate-800 mb-2">
                {q.text(ally.name)}
              </p>
              <div className="flex gap-2 flex-wrap">
                {INSPECT_ANSWERS.map((opt) => {
                  const selected = value === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onSetFlag(q.key, opt.value)}
                      aria-pressed={selected}
                      className={
                        'rounded-full px-4 py-2 min-h-[40px] text-[13px] font-semibold border transition-colors ' +
                        (selected
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300')
                      }
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Keep + Remove buttons stay equally weighted — no destructive
          styling on "remove" per Holly's framing note. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onKeep}
          disabled={!allAnswered}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-full px-5 py-3 min-h-[48px] text-[14px]"
        >
          Keep {ally.name} in my net
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={!allAnswered}
          className="bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-900 font-semibold rounded-full px-5 py-3 min-h-[48px] text-[14px]"
        >
          Take {ally.name} out of my net
        </button>
      </div>
      {!allAnswered && (
        <p className="text-[12px] text-slate-500 italic text-center mt-3">
          Answer the questions above to choose.
        </p>
      )}
      {/* hasYes is referenced for the visual amber border above; declaring
          it inert here keeps the lint clean and signals it's intentional. */}
      <span className="sr-only">{hasYes ? '' : ''}</span>
    </ModalShell>
  )
}

function KeepAdvisoryModal({ onContinue }) {
  return (
    <ModalShell onDismiss={onContinue}>
      <p className="text-[15px] leading-relaxed text-slate-800 mb-3">
        Keeping someone in your safety net is your choice, even when things
        feel complicated.
      </p>
      <p className="text-[15px] leading-relaxed text-slate-800 mb-2">
        Some things to remember:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-[15px] leading-relaxed text-slate-800 mb-4">
        <li>You get to decide who you reach out to when you need support.</li>
        <li>Some relationships are mixed — that&apos;s normal.</li>
        <li>
          If a relationship feels really hard, talking to a trusted adult,
          counselor, or therapist can help.
        </li>
      </ul>
      <div className="flex justify-end">
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
    </ModalShell>
  )
}

function RemovalAckModal({ onContinue }) {
  return (
    <ModalShell onDismiss={onContinue}>
      <p className="text-[15px] leading-relaxed text-slate-800 mb-3">
        Taken out of your safety net. They&apos;re still in your life — this
        is just about who you lean on for support right now.
      </p>
      <p className="text-[15px] leading-relaxed text-slate-800 mb-4">
        You can always change your mind later.
      </p>
      <div className="flex justify-end">
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
    </ModalShell>
  )
}

// ---------- Screen 7: Inspection complete ----------

function InspectCompleteScreen({ allies, noneFor }) {
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2">Your safety net is ready.</h2>
      <p className="text-[14px] text-slate-600 mb-5 leading-relaxed">
        Here&apos;s the net you came out with. You can come back to it any
        time.
      </p>
      <div className="flex justify-center">
        <TrampolineNet
          allies={allies}
          interactive={false}
          showLabels={true}
          showInspectedMarks={true}
        />
      </div>
      {/* noneFor is preserved through to the save payload; not surfaced
          on this screen because the visual already communicates empty
          types via labelled slivers. Keeping the prop on hand if a
          future copy edit wants to call it out. */}
      <span className="sr-only">{Object.values(noneFor).join(',')}</span>
    </div>
  )
}
