import { useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { PrimaryButton, GhostButton, SecondaryButton } from '../components/items/shared.jsx'

const SUPPORT_TYPES = [
  {
    id: 'instrumental',
    label: 'Instrumental / Practical',
    description:
      'Help you solve problems, teach you things, or make sure you have what you need',
  },
  {
    id: 'emotional',
    label: 'Emotional',
    description:
      'Help you feel good about yourself, listen to you, or help you cope with hard feelings',
  },
  {
    id: 'social',
    label: 'Social',
    description:
      'You feel like you can be yourself around them, or they help you feel less alone',
  },
]

const FLAGS = [
  { id: 'trouble', text: 'Usually gets you into trouble' },
  { id: 'isolates', text: 'Tries to keep you from talking to or getting close to other people' },
  { id: 'lies', text: 'Frequently lies to you' },
  { id: 'fear', text: 'Makes you feel afraid' },
]

const MAX_ALLIES = 5

function DraggableAlly({ id, name, dragId }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: dragId })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={
        'cursor-grab active:cursor-grabbing select-none rounded-full px-4 py-2 min-h-[44px] text-[14px] font-medium bg-white text-slate-800 shadow-card ' +
        (isDragging ? 'opacity-50' : '')
      }
    >
      {name}
    </div>
  )
}

function AllyDropBucket({ supportType, items, allies, onUntag }) {
  const { isOver, setNodeRef } = useDroppable({ id: `bucket-${supportType.id}` })
  return (
    <div
      ref={setNodeRef}
      className={
        'rounded-2xl border-2 border-dashed p-4 min-h-[140px] transition-colors ' +
        (isOver ? 'bg-amber-100 border-amber-400' : items.length > 0 ? 'bg-white border-amber-300' : 'bg-amber-50 border-amber-200')
      }
    >
      <div className="text-[14px] font-semibold text-amber-800 mb-1">{supportType.label}</div>
      <div className="text-[12px] text-slate-500 mb-3">{supportType.description}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((idx) => {
          const a = allies[idx]
          if (!a) return null
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onUntag(idx, supportType.id)}
              className="rounded-full px-3 py-1 min-h-[36px] text-[13px] bg-amber-200 text-amber-900 hover:bg-amber-300"
              title="Tap to remove from this bucket"
            >
              {a.name} ✕
            </button>
          )
        })}
        {items.length === 0 && (
          <div className="text-[13px] text-slate-500 italic">Drop allies here</div>
        )}
      </div>
    </div>
  )
}

export default function AlliesSafetyNet({ onSave = console.log, initialStep = 1 }) {
  const [step, setStep] = useState(initialStep)
  // allies: [{ name, support_types: ['emotional', ...] }, ...]
  const [allies, setAllies] = useState([])
  const [draftName, setDraftName] = useState('')
  const [removedAllies, setRemovedAllies] = useState([])
  const [inspectIdx, setInspectIdx] = useState(0)
  const [flagsByAlly, setFlagsByAlly] = useState({}) // { idx: [flagId, ...] }
  const [strengthenIdx, setStrengthenIdx] = useState(0)
  const [gaps, setGaps] = useState([]) // [{ support_type, has_potential, potential_ally, action }]
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  )

  function addAlly() {
    const name = draftName.trim()
    if (!name) return
    if (allies.length >= MAX_ALLIES) return
    setAllies((prev) => [...prev, { name, support_types: [] }])
    setDraftName('')
  }

  function removeAlly(idx) {
    setAllies((prev) => prev.filter((_, i) => i !== idx))
  }

  function tagAlly(idx, supportTypeId) {
    setAllies((prev) =>
      prev.map((a, i) => {
        if (i !== idx) return a
        if (a.support_types.includes(supportTypeId)) return a
        return { ...a, support_types: [...a.support_types, supportTypeId] }
      }),
    )
  }

  function untagAlly(idx, supportTypeId) {
    setAllies((prev) =>
      prev.map((a, i) =>
        i === idx
          ? { ...a, support_types: a.support_types.filter((s) => s !== supportTypeId) }
          : a,
      ),
    )
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return
    const dragId = String(active.id)
    if (!dragId.startsWith('ally-')) return
    const idx = Number(dragId.slice(4))
    const overId = String(over.id)
    if (overId.startsWith('bucket-')) {
      const supportTypeId = overId.slice(7)
      tagAlly(idx, supportTypeId)
    }
  }

  // ---- Step 1 ----
  if (step === 1) {
    const allTagged = allies.length > 0 && allies.every((a) => a.support_types.length > 0)
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <h2 className="text-[22px] font-semibold mb-2">Build your safety net</h2>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-4">
          Name up to 5 people in your corner — first names or nicknames are fine.
          Then drag each one into the kind of support they give you. Someone can
          go in more than one bucket.
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
          <div className="text-[14px] font-medium text-slate-700 mb-2">
            Add an ally
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addAlly()
                }
              }}
              maxLength={40}
              placeholder="First name or nickname"
              disabled={allies.length >= MAX_ALLIES}
              className="flex-1 text-[16px] px-4 py-2 min-h-[48px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
            />
            <button
              type="button"
              onClick={addAlly}
              disabled={!draftName.trim() || allies.length >= MAX_ALLIES}
              className="bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-800 font-semibold rounded-full px-5 py-2 min-h-[48px]"
            >
              Add
            </button>
          </div>
          <div className="text-[12px] text-slate-500 mt-2">
            {allies.length}/{MAX_ALLIES} allies
          </div>
        </div>

        {allies.length > 0 && (
          <div className="mb-5">
            <div className="text-[13px] text-slate-500 mb-2">Drag your allies into a support type</div>
            <div className="flex flex-wrap gap-2">
              {allies.map((a, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white rounded-full pl-1 pr-2 shadow-card">
                  <DraggableAlly id={idx} dragId={`ally-${idx}`} name={a.name} />
                  <button
                    type="button"
                    onClick={() => removeAlly(idx)}
                    className="text-slate-500 hover:text-slate-700 text-[12px] px-1"
                    title="Remove this ally"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SUPPORT_TYPES.map((st) => {
            const items = allies
              .map((a, i) => (a.support_types.includes(st.id) ? i : null))
              .filter((x) => x !== null)
            return (
              <AllyDropBucket
                key={st.id}
                supportType={st}
                items={items}
                allies={allies}
                onUntag={untagAlly}
              />
            )
          })}
        </div>

        <div className="flex justify-end mt-6">
          <PrimaryButton onClick={() => setStep(2)} disabled={!allTagged}>
            Next →
          </PrimaryButton>
        </div>
      </DndContext>
    )
  }

  // ---- Step 2: Inspect ----
  if (step === 2) {
    const ally = allies[inspectIdx]
    if (!ally) {
      // No allies left → skip to strengthen
      setStep(3)
      return null
    }
    const flags = flagsByAlly[inspectIdx] || []
    const hasFlags = flags.length > 0
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-2">Inspect your net</h2>
        <p className="text-[14px] text-slate-600 mb-4">
          Ally {inspectIdx + 1} of {allies.length}
        </p>
        <div className="bg-amber-50 border-l-4 border-amber-300 rounded-2xl px-5 py-3 mb-4">
          <div className="text-[13px] font-medium text-amber-800 mb-1">Ally</div>
          <div className="text-[18px] font-semibold text-slate-800">{ally.name}</div>
        </div>
        <p className="text-[15px] text-slate-700 mb-3">
          Does {ally.name} ever do any of these things?
        </p>
        <div className="space-y-2 mb-5">
          {FLAGS.map((f) => {
            const sel = flags.includes(f.id)
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFlagsByAlly((prev) => {
                    const cur = prev[inspectIdx] || []
                    const next = cur.includes(f.id)
                      ? cur.filter((x) => x !== f.id)
                      : [...cur, f.id]
                    return { ...prev, [inspectIdx]: next }
                  })
                }}
                aria-pressed={sel}
                className={
                  'w-full text-left rounded-2xl border min-h-[52px] px-5 py-3 text-[15px] transition-colors ' +
                  (sel
                    ? 'bg-amber-100 border-amber-400 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300')
                }
              >
                {f.text}
              </button>
            )
          })}
        </div>

        {hasFlags && (
          <div className="bg-amber-100 border border-amber-300 rounded-2xl p-4 mb-5">
            <p className="text-[14px] text-amber-900 mb-3">
              These characteristics describe an unhealthy relationship. Would you
              like to remove {ally.name} from your safety net?
            </p>
            <div className="flex gap-2 flex-wrap">
              <SecondaryButton
                onClick={() => {
                  setRemovedAllies((prev) => [...prev, ally])
                  setAllies((prev) => prev.filter((_, i) => i !== inspectIdx))
                  setFlagsByAlly((prev) => {
                    const next = {}
                    Object.entries(prev).forEach(([k, v]) => {
                      const ki = Number(k)
                      if (ki < inspectIdx) next[ki] = v
                      else if (ki > inspectIdx) next[ki - 1] = v
                    })
                    return next
                  })
                  // Stay on the same index — it now points to the next ally (or out of bounds)
                  if (inspectIdx >= allies.length - 1) {
                    setStep(3)
                    setInspectIdx(0)
                  }
                }}
              >
                Remove {ally.name}
              </SecondaryButton>
              <GhostButton
                onClick={() => {
                  if (inspectIdx < allies.length - 1) setInspectIdx((i) => i + 1)
                  else {
                    setStep(3)
                    setInspectIdx(0)
                  }
                }}
              >
                Keep {ally.name}
              </GhostButton>
            </div>
          </div>
        )}

        {!hasFlags && (
          <div className="flex items-center justify-between">
            <GhostButton
              onClick={() => {
                if (inspectIdx > 0) setInspectIdx((i) => i - 1)
                else setStep(1)
              }}
            >
              ← Back
            </GhostButton>
            <PrimaryButton
              onClick={() => {
                if (inspectIdx < allies.length - 1) setInspectIdx((i) => i + 1)
                else {
                  setStep(3)
                  setInspectIdx(0)
                }
              }}
            >
              {inspectIdx < allies.length - 1 ? 'Next ally →' : 'Continue →'}
            </PrimaryButton>
          </div>
        )}
      </div>
    )
  }

  // ---- Step 3: Strengthen ----
  if (step === 3) {
    const counts = {}
    for (const st of SUPPORT_TYPES) counts[st.id] = 0
    for (const a of allies) for (const s of a.support_types) counts[s]++
    const gapTypes = SUPPORT_TYPES.filter((st) => counts[st.id] < 2)

    if (gapTypes.length === 0) {
      // No gaps → skip ahead
      return (
        <div>
          <h2 className="text-[22px] font-semibold mb-3">Your net is solid</h2>
          <p className="text-[16px] text-slate-700 mb-5">
            You have at least two people in every kind of support. That&apos;s
            real.
          </p>
          <div className="flex justify-end">
            <PrimaryButton onClick={() => setStep(4)}>Next →</PrimaryButton>
          </div>
        </div>
      )
    }

    const st = gapTypes[strengthenIdx]
    if (!st) {
      setStep(4)
      return null
    }
    const existingGap = gaps.find((g) => g.support_type === st.id) || {
      support_type: st.id,
      has_potential: null,
      potential_ally: '',
      action: '',
    }

    function updateGap(updates) {
      setGaps((prev) => {
        const without = prev.filter((g) => g.support_type !== st.id)
        return [...without, { ...existingGap, ...updates }]
      })
    }

    function next() {
      if (strengthenIdx < gapTypes.length - 1) setStrengthenIdx((i) => i + 1)
      else setStep(4)
    }

    const isLast = strengthenIdx === gapTypes.length - 1
    const canAdvance =
      existingGap.has_potential === false ||
      (existingGap.has_potential === true &&
        existingGap.potential_ally.trim() &&
        existingGap.action.trim())

    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-2">Strengthen your net</h2>
        <p className="text-[14px] text-slate-600 mb-4">
          Gap {strengthenIdx + 1} of {gapTypes.length}
        </p>
        <div className="bg-amber-50 border-l-4 border-amber-300 rounded-2xl px-5 py-3 mb-5">
          <div className="text-[13px] font-medium text-amber-800 mb-1">
            {st.label} support
          </div>
          <div className="text-[14px] text-slate-700">{st.description}</div>
        </div>
        <p className="text-[16px] text-slate-800 mb-3">
          Is there anyone who could provide {st.label.toLowerCase()} support?
        </p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { v: true, label: 'Yes / maybe' },
            { v: false, label: 'No' },
          ].map((opt) => (
            <button
              key={String(opt.v)}
              type="button"
              onClick={() => updateGap({ has_potential: opt.v })}
              className={
                'rounded-2xl border min-h-[52px] px-5 py-3 text-[16px] font-semibold transition-colors ' +
                (existingGap.has_potential === opt.v
                  ? 'bg-amber-200 border-amber-400 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300')
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {existingGap.has_potential === true && (
          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-[14px] font-medium text-slate-700 mb-2">
                Who?
              </label>
              <input
                type="text"
                value={existingGap.potential_ally}
                onChange={(e) => updateGap({ potential_ally: e.target.value })}
                maxLength={60}
                placeholder="First name or nickname"
                className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-slate-700 mb-2">
                What could you do to encourage that support?
              </label>
              <textarea
                rows={3}
                value={existingGap.action}
                onChange={(e) => updateGap({ action: e.target.value })}
                placeholder="One small thing you could try…"
                className="w-full text-[16px] leading-relaxed px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
              />
            </div>
          </div>
        )}

        {existingGap.has_potential === false && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
            <p className="text-[15px] text-slate-800">
              That&apos;s OK. Knowing what&apos;s missing is the first step.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <GhostButton
            onClick={() => {
              if (strengthenIdx > 0) setStrengthenIdx((i) => i - 1)
              else setStep(2)
            }}
          >
            ← Back
          </GhostButton>
          <PrimaryButton onClick={next} disabled={!canAdvance}>
            {isLast ? 'Continue →' : 'Next gap →'}
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // ---- Step 4: View + save ----
  if (done) {
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-3">Saved</h2>
        <p className="text-[16px] text-slate-700">That&apos;s your safety net.</p>
      </div>
    )
  }

  async function handleSave() {
    setSubmitting(true)
    try {
      await onSave({
        activity: 'allies_safety_net',
        allies,
        removed_allies: removedAllies,
        gaps_identified: gaps,
        saved_at: new Date().toISOString(),
      })
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-3">Your safety net</h2>
      <div className="space-y-4 mb-6">
        {SUPPORT_TYPES.map((st) => {
          const here = allies.filter((a) => a.support_types.includes(st.id))
          return (
            <div key={st.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-[14px] font-semibold text-amber-800 mb-1">{st.label}</div>
              <div className="text-[12px] text-slate-500 mb-3">{st.description}</div>
              <div className="flex flex-wrap gap-2">
                {here.length > 0 ? (
                  here.map((a, i) => (
                    <span key={i} className="rounded-full px-3 py-1 bg-amber-200 text-amber-900 text-[14px]">
                      {a.name}
                    </span>
                  ))
                ) : (
                  <span className="text-[13px] text-slate-500 italic">No one yet</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-end">
        <PrimaryButton onClick={handleSave} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </div>
    </div>
  )
}
