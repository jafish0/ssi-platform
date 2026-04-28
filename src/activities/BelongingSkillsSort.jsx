import { useMemo, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { PrimaryButton } from '../components/items/shared.jsx'

const BEHAVIORS = [
  { id: 'bs1', text: 'Active listening / attention (smiling and eye contact)' },
  { id: 'bs2', text: 'Using inclusive language' },
  { id: 'bs3', text: 'Expressing gratitude' },
  { id: 'bs4', text: 'Providing support to others' },
  { id: 'bs5', text: 'Creating space for belonging' },
  { id: 'bs6', text: 'Reducing belonging uncertainty' },
  { id: 'bs7', text: 'Effective conflict resolution' },
]

const BUCKETS = [
  { id: 'already_doing', label: "What I'm already doing" },
  { id: 'willing_to_try', label: "What I'm willing to try" },
]

function DraggableCard({ id, text, selected, onTap }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onTap}
      className={
        'cursor-grab active:cursor-grabbing select-none rounded-2xl px-4 py-3 min-h-[52px] text-[15px] shadow-card transition-shadow ' +
        (selected
          ? 'bg-amber-200 text-amber-900 ring-2 ring-amber-400'
          : 'bg-white text-slate-800') +
        (isDragging ? ' opacity-50' : '')
      }
    >
      {text}
    </div>
  )
}

function DropBucket({ id, label, items, behaviors, onTapItem, tapSelected }) {
  const { isOver, setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={
        'rounded-2xl border-2 border-dashed p-4 min-h-[160px] transition-colors ' +
        (isOver
          ? 'bg-amber-100 border-amber-400'
          : items.length > 0
            ? 'bg-white border-amber-300'
            : 'bg-amber-50 border-amber-200')
      }
    >
      <div className="text-[14px] font-semibold text-amber-800 mb-3">{label}</div>
      <div className="flex flex-col gap-2">
        {items.map((bid) => {
          const b = behaviors.find((x) => x.id === bid)
          if (!b) return null
          return (
            <DraggableCard
              key={b.id}
              id={b.id}
              text={b.text}
              selected={tapSelected === b.id}
              onTap={(e) => {
                e.stopPropagation()
                onTapItem(b.id)
              }}
            />
          )
        })}
        {items.length === 0 && (
          <div className="text-[13px] text-slate-500 italic">Drag here</div>
        )}
      </div>
    </div>
  )
}

export default function BelongingSkillsSort({ onSave = console.log }) {
  const [placement, setPlacement] = useState({
    already_doing: [],
    willing_to_try: [],
  })
  const [tapSelected, setTapSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const unplaced = useMemo(() => {
    const all = BEHAVIORS.map((b) => b.id)
    const placed = new Set([...placement.already_doing, ...placement.willing_to_try])
    return all.filter((id) => !placed.has(id))
  }, [placement])

  function moveTo(itemId, bucketId) {
    setPlacement((prev) => {
      const next = {
        already_doing: prev.already_doing.filter((x) => x !== itemId),
        willing_to_try: prev.willing_to_try.filter((x) => x !== itemId),
      }
      if (bucketId === 'unplaced') return next
      next[bucketId] = [...next[bucketId], itemId]
      return next
    })
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return
    const targetId = over.id
    if (targetId === 'unplaced' || targetId === 'already_doing' || targetId === 'willing_to_try') {
      moveTo(active.id, targetId)
    }
  }

  function handleTap(itemId) {
    setTapSelected((prev) => (prev === itemId ? null : itemId))
  }
  function handleBucketTap(bucketId) {
    if (tapSelected) {
      moveTo(tapSelected, bucketId)
      setTapSelected(null)
    }
  }

  const anyPlaced =
    placement.already_doing.length > 0 || placement.willing_to_try.length > 0

  async function handleSave() {
    setSubmitting(true)
    try {
      await onSave({
        activity: 'belonging_skills_sort',
        already_doing: placement.already_doing,
        willing_to_try: placement.willing_to_try,
        unplaced,
        saved_at: new Date().toISOString(),
      })
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-3">Nice work</h2>
        <p className="text-[16px] text-slate-700">
          That&apos;s a snapshot of where you are. We&apos;ll come back to this.
        </p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <h2 className="text-[22px] font-semibold mb-2">Belonging skills</h2>
      <p className="text-[16px] leading-relaxed text-slate-700 mb-5">
        Drag each one into a bucket. If a skill isn&apos;t for you right now,
        leave it where it is. There&apos;s no grade.
      </p>

      <div className="mb-5">
        <div className="text-[13px] text-slate-500 mb-2">Skills</div>
        <div onClick={() => handleBucketTap('unplaced')}>
          <div className="flex flex-wrap gap-2 min-h-[60px]">
            {unplaced.map((id) => {
              const b = BEHAVIORS.find((x) => x.id === id)
              if (!b) return null
              return (
                <DraggableCard
                  key={id}
                  id={id}
                  text={b.text}
                  selected={tapSelected === id}
                  onTap={(e) => {
                    e.stopPropagation()
                    handleTap(id)
                  }}
                />
              )
            })}
            {unplaced.length === 0 && (
              <div className="text-[13px] text-slate-400 italic w-full">All sorted</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
        {BUCKETS.map((b) => (
          <div key={b.id} onClick={() => handleBucketTap(b.id)}>
            <DropBucket
              id={b.id}
              label={b.label}
              items={placement[b.id]}
              behaviors={BEHAVIORS}
              onTapItem={handleTap}
              tapSelected={tapSelected}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <PrimaryButton onClick={handleSave} disabled={!anyPlaced || submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </div>
    </DndContext>
  )
}
