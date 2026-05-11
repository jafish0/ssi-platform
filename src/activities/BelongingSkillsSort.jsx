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

// Belonging Promoting Behaviors — kid-friendly labels and per-skill
// definitions per Stephanie + Holly + Ginny's 2026-05-11 feedback. The 7
// items below match the locked pretest doc ("Belonging Promoting
// Behaviors (7 items)" in Pretest Draft Belongingness_5.2.26.docx,
// confirmed final by Josh 2026-05-11). Skill IDs bs1-bs7 stay sequential
// but the meaning of each ID has shifted; this is acceptable while the
// platform is demo-only.
const BEHAVIORS = [
  {
    id: 'bs1',
    text: 'Pay close attention when someone is talking to you (without checking your phone or getting distracted)',
    definition:
      "Giving someone your full attention when they're speaking — eyes on them, no phone, no looking around.",
  },
  {
    id: 'bs2',
    text: 'Use words like "we," "us," or "our group" to make people feel included',
    definition:
      'Saying things that signal everyone belongs in the group — "we" instead of "you guys," "our team" instead of "the group."',
  },
  {
    id: 'bs3',
    text: 'Say thank you or tell others when they do something you appreciate',
    definition:
      'Telling someone you noticed and appreciated what they did, instead of just thinking it.',
  },
  {
    id: 'bs4',
    text: 'Help someone out when they need it',
    definition:
      'Offering help when you see someone needs it, without waiting to be asked.',
  },
  {
    id: 'bs5',
    text: 'Invite others to spend time with you',
    definition:
      'Reaching out to bring someone into your plans or your day, instead of waiting for them to ask.',
  },
  {
    id: 'bs6',
    text: 'Include others in conversations and activities (like watching a movie, going for a walk, or playing a game)',
    definition:
      "Making space for others in what you're already doing — looping them into the conversation, the game, the show.",
  },
  {
    id: 'bs7',
    text: 'Talk through a disagreement with someone until you find an answer that works for everyone',
    definition:
      'Staying with a disagreement until you find something that works for everyone, instead of walking away or giving up.',
  },
]

const BUCKETS = [
  { id: 'already_doing', label: "What I'm already doing" },
  { id: 'willing_to_try', label: "What I'm willing to try" },
]

function DraggableCard({ behavior, selected, onTap, defOpen, onToggleDef }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: behavior.id })
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
      <div className="flex items-start gap-2">
        <div className="flex-1 leading-snug">{behavior.text}</div>
        <button
          type="button"
          aria-label={defOpen ? 'Hide definition' : 'Show definition'}
          aria-expanded={defOpen}
          onPointerDown={(e) => {
            // Stop the drag sensor from activating when the kid hits the
            // "?" — without this, dnd-kit's PointerSensor swallows the
            // click intent and the popover never opens.
            e.stopPropagation()
          }}
          onClick={(e) => {
            e.stopPropagation()
            onToggleDef()
          }}
          className={
            'flex-shrink-0 inline-flex items-center justify-center rounded-full w-6 h-6 text-[12px] font-bold border transition-colors ' +
            (defOpen
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100')
          }
        >
          ?
        </button>
      </div>
      {defOpen && (
        <div className="mt-2 pt-2 border-t border-amber-200 text-[13px] leading-relaxed text-slate-600 italic">
          {behavior.definition}
        </div>
      )}
    </div>
  )
}

function DropBucket({ id, label, items, behaviors, onTapItem, tapSelected, defOpenId, onToggleDef }) {
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
              behavior={b}
              selected={tapSelected === b.id}
              onTap={(e) => {
                e.stopPropagation()
                onTapItem(b.id)
              }}
              defOpen={defOpenId === b.id}
              onToggleDef={() => onToggleDef(b.id)}
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
  // Which card has its definition popover open. Single-open at a time
  // keeps the layout from getting noisy.
  const [defOpenId, setDefOpenId] = useState(null)
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

  function toggleDef(itemId) {
    setDefOpenId((prev) => (prev === itemId ? null : itemId))
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
      <p className="text-[16px] leading-relaxed text-slate-700 mb-2">
        Drag each one into a bucket. If a skill isn&apos;t for you right now,
        leave it where it is. There&apos;s no grade.
      </p>
      <p className="text-[13px] text-slate-500 mb-5">
        Tap the <span className="font-semibold">?</span> on any skill for a quick definition.
      </p>

      <div className="mb-5">
        <div className="text-[13px] text-slate-500 mb-2">Skills</div>
        <div onClick={() => handleBucketTap('unplaced')}>
          <div className="flex flex-col gap-2 min-h-[60px]">
            {unplaced.map((id) => {
              const b = BEHAVIORS.find((x) => x.id === id)
              if (!b) return null
              return (
                <DraggableCard
                  key={id}
                  behavior={b}
                  selected={tapSelected === id}
                  onTap={(e) => {
                    e.stopPropagation()
                    handleTap(id)
                  }}
                  defOpen={defOpenId === id}
                  onToggleDef={() => toggleDef(id)}
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
              defOpenId={defOpenId}
              onToggleDef={toggleDef}
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
