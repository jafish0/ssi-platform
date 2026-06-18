// Belonging Skills Sort — v3.1 (Draft 26, 2026-06-08).
//
// What's new in v3.1 (vs v3.0):
//   - Encouragement copy gains a "!" ("Nice work!").
//   - The post-submit screen renders a saveable PNG snapshot of the
//     three sorted buckets (downloadSvgElementAsPng, same path as Allies
//     / Safety Net + Who I Am Poem). Unsorted skills are excluded.
//   - A one-time "reconsider unsorted items?" prompt appears after the
//     first Save click if any skills are still unplaced (Yes → back to
//     the sort UI; No → save). Asked at most once.
//   Data shape unchanged.
//
// What was new in v3.0 (Draft 12, 2026-05-18 meeting batch) vs. v2.0:
//   1. The two CSS drop-zones are replaced with three illustrated bucket
//      SVGs side-by-side (desktop) / stacked (mobile).
//   2. New third bucket: "Not interested right now." Equal styling on
//      purpose — Stephanie's call. The whole point of adding the bucket
//      is to legitimize "not for me" as a valid answer; visually
//      desaturating it would undo that.
//   3. The placement interaction is rebuilt as a real drag with a
//      ghost-chip follower (Holly: "I want to see the text moving"). We
//      use pointer events (NOT @dnd-kit, NOT HTML5 drag) — they work
//      uniformly on mouse, touch, and pen, and let us render a fully
//      custom ghost.
//   4. Placed cards inside a bucket have a small × remove button that
//      returns them to the unplaced list (Jessica: "If they accidentally
//      drag an option, can they delete it or do they have to reset?").
//   5. Keyboard + screen-reader path: Tab → arrow keys → Space picks up
//      → arrow keys cycle buckets → Space drops. Escape cancels.
//      aria-live region announces transitions.
//
// Save payload (v3.0):
//   {
//     activity: "belonging_skills_sort",
//     already_doing: [bs_id],
//     willing_to_try: [bs_id],
//     not_interested: [bs_id],
//     unplaced: [bs_id],
//     saved_at: "..."
//   }
//
// `unplaced` is preserved in the payload (even though it's derivable
// from the placement arrays) so analysts can distinguish "kid skipped
// this skill" from "kid actively chose Not Interested."

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { PrimaryButton, GhostButton } from '../components/items/shared.jsx'
import { downloadSvgElementAsPng } from '../lib/imageDownload.js'

// Skill labels match the locked pretest doc (set in commit `7b7046e`,
// Draft 3). bs1–bs7 IDs are stable; the meaning of each ID is preserved
// across versions.
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
  { id: 'already_doing',  label: "What I'm already doing" },
  { id: 'willing_to_try', label: "What I'm willing to try" },
  { id: 'not_interested', label: 'Not interested right now' },
]

// Used to truncate the ghost-chip label so it doesn't cover the screen
// on mobile.
const GHOST_LABEL_MAX = 30

// Ghost chip vertical offsets — on mobile we float the chip well above
// the touching finger so the kid can see it. On desktop, a small offset
// from the cursor is fine.
const GHOST_OFFSET_TOUCH = -56 // px above the finger
const GHOST_OFFSET_MOUSE = -14 // px above the cursor

// Drop-animation duration. Brief asks for ~250ms ease-out on settle,
// ~200ms on spring-back. Close enough — using 240ms either way for
// simpler CSS.
const DROP_ANIM_MS = 240

// ---------- Bucket SVG ----------
// Simple trapezoidal bucket with an arched handle. Single shared SVG
// used by all three buckets (color is the same per the brief).

function BucketSvg({ className = '' }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
    >
      {/* Handle (back ear) */}
      <path
        d="M 70 38 Q 70 12 100 12 Q 130 12 130 38"
        stroke="#F59E0B"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* Bucket body — trapezoid with slightly rounded bottom corners */}
      <path
        d="M 22 52 L 178 52 L 162 184 Q 162 192 154 192 L 46 192 Q 38 192 38 184 Z"
        fill="#FCD34D"
        stroke="#F59E0B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Inner rim shadow for depth */}
      <line
        x1="28"
        y1="60"
        x2="172"
        y2="60"
        stroke="#F59E0B"
        strokeWidth="1.5"
        opacity="0.4"
      />
    </svg>
  )
}

// ---------- Skill card ----------
// Used both in the unplaced list AND inside buckets. The two contexts
// differ in:
//   - Unplaced cards are draggable (pointerdown starts a drag) and
//     keyboard-pickable (Space/Enter focuses the bucket row).
//   - Placed cards have a small × remove button instead of being
//     draggable. Tap × returns the skill to unplaced.
// Both render the "?" tooltip affordance.

function SkillCard({
  behavior,
  context, // 'unplaced' | 'placed'
  isBeingDragged, // dim to ~40% while ghost is flying
  isKeyboardPicked,
  defOpen,
  onToggleDef,
  onPointerDownStart,
  onRemove,
  onKeyboardActivate,
  index, // for the small leading "1." / "2." badge in unplaced
}) {
  const isUnplaced = context === 'unplaced'

  // Pointerdown handler — kicks off a drag. Only on unplaced cards.
  // We let buttons inside (the "?" affordance) stopPropagation in
  // their own handlers so the drag doesn't get triggered by tap-on-?
  function handlePointerDown(e) {
    if (!isUnplaced || !onPointerDownStart) return
    // Only respond to primary pointer button (or any touch / pen).
    if (e.pointerType === 'mouse' && e.button !== 0) return
    onPointerDownStart(behavior, e)
  }

  function handleKeyDown(e) {
    if (!isUnplaced || !onKeyboardActivate) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onKeyboardActivate(behavior.id)
    }
  }

  return (
    <div
      role={isUnplaced ? 'button' : 'group'}
      tabIndex={isUnplaced ? 0 : -1}
      aria-pressed={isKeyboardPicked || undefined}
      aria-label={
        isUnplaced
          ? `Skill ${index ?? ''}: ${behavior.text}`
          : behavior.text
      }
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      className={
        'relative select-none rounded-2xl px-4 py-3 min-h-[52px] text-[14px] shadow-card transition-all ' +
        (isUnplaced
          ? 'bg-white text-slate-800 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-amber-200 '
          : 'bg-white/95 text-slate-800 ') +
        (isBeingDragged ? ' opacity-40 ' : '') +
        (isKeyboardPicked
          ? ' ring-2 ring-amber-500 shadow-lg scale-[1.02] '
          : '')
      }
      style={{ touchAction: isUnplaced ? 'none' : undefined }}
    >
      <div className="flex items-start gap-2">
        {isUnplaced && index != null && (
          <span className="flex-shrink-0 inline-flex items-center justify-center bg-amber-100 text-amber-800 rounded-full w-5 h-5 text-[11px] font-bold mt-0.5">
            {index}
          </span>
        )}
        <div className="flex-1 leading-snug">{behavior.text}</div>
        <button
          type="button"
          aria-label={defOpen ? 'Hide definition' : 'Show definition'}
          aria-expanded={defOpen}
          onPointerDown={(e) => e.stopPropagation()}
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
        <div className="mt-2 pt-2 border-t border-amber-200 text-[12px] leading-relaxed text-slate-600 italic">
          {behavior.definition}
        </div>
      )}
      {!isUnplaced && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(behavior.id)
          }}
          aria-label={`Remove ${behavior.text.slice(0, 40)} from this bucket`}
          className="absolute top-1 right-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 hover:bg-amber-200 text-slate-600 text-[14px] font-semibold leading-none"
          title="Remove from this bucket"
        >
          ×
        </button>
      )}
    </div>
  )
}

// ---------- Bucket container ----------

function Bucket({
  bucket,
  placedBehaviors,
  defOpenId,
  onToggleDef,
  onRemove,
  isHovered,
  isKeyboardTarget,
  bucketRef,
  pulseKey,
}) {
  return (
    <div className="flex flex-col">
      <div className="text-[13px] font-semibold text-amber-900 mb-2 text-center px-2">
        {bucket.label}
      </div>
      <div
        ref={bucketRef}
        data-bucket-id={bucket.id}
        className={
          'relative w-full aspect-[5/4] transition-all duration-150 ' +
          (isHovered
            ? 'scale-[1.03] drop-shadow-xl '
            : isKeyboardTarget
              ? 'ring-4 ring-amber-300 ring-offset-2 rounded-3xl '
              : '')
        }
      >
        <BucketSvg className="absolute inset-0 w-full h-full" />
        {/* Drop-pulse animation — bumps the key on each commit so the
            animation re-fires. The inner div listens for the key change
            and runs a quick scale animation. */}
        <div
          key={pulseKey}
          className={
            'absolute inset-0 pointer-events-none ' +
            (pulseKey > 0 ? 'animate-bucket-drop' : '')
          }
        />
        {/* Content overlay positioned roughly inside the bucket
            interior (matches the trapezoidal viewBox of BucketSvg). */}
        <div
          className="absolute flex flex-col gap-1.5 overflow-y-auto pointer-events-auto"
          style={{ left: '15%', right: '15%', top: '28%', bottom: '8%' }}
        >
          {placedBehaviors.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[11px] text-amber-700/70 italic px-2 text-center">
              {isHovered ? 'Drop here' : 'empty'}
            </div>
          ) : (
            placedBehaviors.map((b) => (
              <SkillCard
                key={b.id}
                behavior={b}
                context="placed"
                defOpen={defOpenId === b.id}
                onToggleDef={() => onToggleDef(b.id)}
                onRemove={onRemove}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ---------- Ghost chip ----------
// The pill-shaped chip that follows the pointer / finger during a drag.
// Renders at fixed position in viewport coords. When dropMode is set,
// it transitions to the target position then unmounts after the
// animation runs.

function GhostChip({ behavior, x, y, dropMode, targetX, targetY }) {
  if (!behavior) return null
  const text = behavior.text
  const truncated =
    text.length > GHOST_LABEL_MAX ? text.slice(0, GHOST_LABEL_MAX - 1) + '…' : text
  const finalX = dropMode ? targetX : x
  const finalY = dropMode ? targetY : y
  const transition = dropMode
    ? `transform ${DROP_ANIM_MS}ms ease-out, opacity ${DROP_ANIM_MS}ms ease-out`
    : 'none'
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        transform: `translate(${finalX - 80}px, ${finalY - 22}px)`,
        transition,
        opacity: dropMode === 'settle' ? 0 : 1,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
      className="bg-amber-500 text-white rounded-full px-3 py-2 shadow-2xl ring-2 ring-amber-200 font-semibold text-[13px] flex items-center gap-2 max-w-[200px]"
    >
      <span className="inline-flex items-center justify-center bg-white text-amber-700 rounded-full w-5 h-5 text-[11px] font-bold flex-shrink-0">
        {/* Number badge derived from id (bs1 → 1) */}
        {behavior.id.replace(/\D/g, '')}
      </span>
      <span className="truncate leading-tight">{truncated}</span>
    </div>
  )
}

// ---------- Main component ----------

export default function BelongingSkillsSort({ onSave = console.log }) {
  // Three placement arrays. `unplaced` is derived from BEHAVIORS - all placed.
  const [placement, setPlacement] = useState({
    already_doing: [],
    willing_to_try: [],
    not_interested: [],
  })

  // Drag state. `null` when idle. While active, the ghost chip follows
  // the cursor/finger and we hit-test against bucket refs.
  const [drag, setDrag] = useState(null)
  // Drop animation — set on pointerup. Drives the ghost chip's
  // transition to the bucket center (settle) or origin (spring back).
  const [dropAnim, setDropAnim] = useState(null)

  // Keyboard pickup mode — runs in parallel to pointer drag.
  const [keyboardPickup, setKeyboardPickup] = useState(null)
  const [keyboardTargetBucket, setKeyboardTargetBucket] = useState(null)

  // Which skill's definition tooltip is open. One at a time.
  const [defOpenId, setDefOpenId] = useState(null)

  // aria-live status text — announced to screen readers on every
  // pickup / placement / removal.
  const [liveMessage, setLiveMessage] = useState('')

  // Pulse keys per bucket — incremented each time a skill is dropped
  // into that bucket, so the Bucket component's pulse animation
  // re-fires (via React's key-change pattern).
  const [pulseKeys, setPulseKeys] = useState({
    already_doing: 0,
    willing_to_try: 0,
    not_interested: 0,
  })

  const [submitting, setSubmitting] = useState(false)
  // Phase: 'sort' (main UI) → optional 'reconsider' (one-time prompt for
  // leftover unsorted skills) → 'done' (saved snapshot keepsake).
  const [phase, setPhase] = useState('sort')
  const [reconsidered, setReconsidered] = useState(false)

  // Refs for hit-testing against bucket rectangles on pointermove.
  // Keyed by bucket.id; each holds the bucket container's DOM node.
  const bucketRefs = useRef({})
  const setBucketRef = useCallback(
    (id) => (node) => {
      bucketRefs.current[id] = node
    },
    [],
  )

  const unplaced = useMemo(() => {
    const placed = new Set([
      ...placement.already_doing,
      ...placement.willing_to_try,
      ...placement.not_interested,
    ])
    return BEHAVIORS.filter((b) => !placed.has(b.id))
  }, [placement])

  const lookupBehavior = useCallback((id) => BEHAVIORS.find((b) => b.id === id), [])

  // ---------- Move helpers ----------

  // Place a skill into a bucket. Idempotent — if the skill is already
  // in another bucket, remove from there first.
  const placeIntoBucket = useCallback((skillId, bucketId) => {
    setPlacement((prev) => {
      const stripped = {
        already_doing:  prev.already_doing.filter((x) => x !== skillId),
        willing_to_try: prev.willing_to_try.filter((x) => x !== skillId),
        not_interested: prev.not_interested.filter((x) => x !== skillId),
      }
      stripped[bucketId] = [...stripped[bucketId], skillId]
      return stripped
    })
    setPulseKeys((prev) => ({ ...prev, [bucketId]: (prev[bucketId] || 0) + 1 }))
    const bucketLabel =
      BUCKETS.find((b) => b.id === bucketId)?.label || bucketId
    const b = lookupBehavior(skillId)
    setLiveMessage(`${b?.text || skillId} placed in ${bucketLabel}.`)
  }, [lookupBehavior])

  // Remove a skill from any bucket (returns to unplaced).
  const removeFromBuckets = useCallback((skillId) => {
    setPlacement((prev) => ({
      already_doing:  prev.already_doing.filter((x) => x !== skillId),
      willing_to_try: prev.willing_to_try.filter((x) => x !== skillId),
      not_interested: prev.not_interested.filter((x) => x !== skillId),
    }))
    const b = lookupBehavior(skillId)
    setLiveMessage(`${b?.text || skillId} returned to the skills list.`)
  }, [lookupBehavior])

  // ---------- Pointer drag ----------

  // Hit-test a viewport coordinate against the three bucket rects.
  // Returns the bucket id whose rect contains the point, or null.
  function bucketAtPoint(clientX, clientY) {
    for (const b of BUCKETS) {
      const node = bucketRefs.current[b.id]
      if (!node) continue
      const r = node.getBoundingClientRect()
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return b.id
      }
    }
    return null
  }

  function startPointerDrag(behavior, e) {
    if (dropAnim) return // ignore while a drop animation is in flight
    const isTouchish = e.pointerType !== 'mouse'
    const offsetY = isTouchish ? GHOST_OFFSET_TOUCH : GHOST_OFFSET_MOUSE
    const target = e.currentTarget
    const originRect = target.getBoundingClientRect()
    const originX = originRect.left + originRect.width / 2
    const originY = originRect.top + originRect.height / 2
    setDrag({
      skillId: behavior.id,
      pointerX: e.clientX,
      pointerY: e.clientY,
      ghostX: e.clientX,
      ghostY: e.clientY + offsetY,
      offsetY,
      originX,
      originY,
      hoveredBucket: null,
      pointerType: e.pointerType,
    })
    setLiveMessage(`${behavior.text} picked up.`)
  }

  // Global pointermove + pointerup while dragging.
  useEffect(() => {
    if (!drag || dropAnim) return
    function handleMove(e) {
      const hovered = bucketAtPoint(e.clientX, e.clientY)
      setDrag((d) => {
        if (!d) return d
        return {
          ...d,
          pointerX: e.clientX,
          pointerY: e.clientY,
          ghostX: e.clientX,
          ghostY: e.clientY + d.offsetY,
          hoveredBucket: hovered,
        }
      })
    }
    function handleUp() {
      setDrag((d) => {
        if (!d) return d
        // Resolve the drop. If a bucket is hovered, settle; else
        // spring back. We immediately commit the placement (or no-op
        // on spring), then animate the ghost to its visual resting
        // place, then unmount the ghost.
        if (d.hoveredBucket) {
          const bucketNode = bucketRefs.current[d.hoveredBucket]
          const r = bucketNode?.getBoundingClientRect()
          const targetX = r ? r.left + r.width / 2 : d.ghostX
          const targetY = r ? r.top + r.height / 2 : d.ghostY
          placeIntoBucket(d.skillId, d.hoveredBucket)
          setDropAnim({
            skillId: d.skillId,
            kind: 'settle',
            targetX,
            targetY,
          })
        } else {
          setDropAnim({
            skillId: d.skillId,
            kind: 'spring',
            targetX: d.originX,
            targetY: d.originY,
          })
        }
        return d
      })
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag !== null && !dropAnim, placeIntoBucket])

  // Clear drag + dropAnim after animation completes.
  useEffect(() => {
    if (!dropAnim) return
    const t = setTimeout(() => {
      setDropAnim(null)
      setDrag(null)
    }, DROP_ANIM_MS + 30)
    return () => clearTimeout(t)
  }, [dropAnim])

  // ---------- Keyboard nav ----------

  // Picks up a skill via keyboard. Focus moves into the bucket
  // selection mode; arrow keys cycle buckets, Space drops, Esc cancels.
  function handleKeyboardActivate(skillId) {
    if (keyboardPickup === skillId) {
      // Already picked up — cancel.
      setKeyboardPickup(null)
      setKeyboardTargetBucket(null)
      const b = lookupBehavior(skillId)
      setLiveMessage(`${b?.text || skillId} put back.`)
      return
    }
    setKeyboardPickup(skillId)
    setKeyboardTargetBucket(BUCKETS[0].id)
    const b = lookupBehavior(skillId)
    setLiveMessage(
      `${b?.text || skillId} picked up. Choose a bucket with the arrow keys, then Space to drop. Escape to cancel.`,
    )
  }

  // Document-level keydown for arrow-key bucket cycling + Space-to-drop
  // + Escape-to-cancel. Active only when a keyboard pickup is in flight.
  useEffect(() => {
    if (!keyboardPickup) return
    function handle(e) {
      const idx = BUCKETS.findIndex((b) => b.id === keyboardTargetBucket)
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const next = BUCKETS[(idx + 1) % BUCKETS.length]
        setKeyboardTargetBucket(next.id)
        setLiveMessage(`Bucket: ${next.label}`)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const next = BUCKETS[(idx - 1 + BUCKETS.length) % BUCKETS.length]
        setKeyboardTargetBucket(next.id)
        setLiveMessage(`Bucket: ${next.label}`)
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const targetBucket = keyboardTargetBucket || BUCKETS[0].id
        placeIntoBucket(keyboardPickup, targetBucket)
        setKeyboardPickup(null)
        setKeyboardTargetBucket(null)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        const b = lookupBehavior(keyboardPickup)
        setLiveMessage(`${b?.text || keyboardPickup} put back.`)
        setKeyboardPickup(null)
        setKeyboardTargetBucket(null)
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [keyboardPickup, keyboardTargetBucket, placeIntoBucket, lookupBehavior])

  // ---------- Save ----------

  const anyPlaced =
    placement.already_doing.length > 0 ||
    placement.willing_to_try.length > 0 ||
    placement.not_interested.length > 0

  // Primary-button handler. If the kid still has unsorted skills and we
  // haven't already offered the reconsider step, surface it once before
  // saving (Draft 26 Part C). Otherwise save straight through.
  function handlePrimary() {
    if (unplaced.length > 0 && !reconsidered) {
      setPhase('reconsider')
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    doSave()
  }

  async function doSave() {
    setSubmitting(true)
    try {
      await onSave({
        activity: 'belonging_skills_sort',
        already_doing:  placement.already_doing,
        willing_to_try: placement.willing_to_try,
        not_interested: placement.not_interested,
        unplaced:       unplaced.map((b) => b.id),
        saved_at:       new Date().toISOString(),
      })
      setPhase('done')
    } finally {
      setSubmitting(false)
    }
  }

  function handleReconsiderYes() {
    setReconsidered(true)
    setPhase('sort')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function handleReconsiderNo() {
    setReconsidered(true)
    doSave()
  }

  if (phase === 'reconsider') {
    return (
      <ReconsiderScreen
        unplaced={unplaced}
        onYes={handleReconsiderYes}
        onNo={handleReconsiderNo}
        submitting={submitting}
      />
    )
  }

  if (phase === 'done') {
    return <SortSnapshotScreen placement={placement} lookup={lookupBehavior} />
  }

  const draggedBehavior = drag ? lookupBehavior(drag.skillId) : null
  const draggingId = drag?.skillId || null

  return (
    <div>
      {/* Inline tailwind-extension @keyframes via plain CSS. The drop
          pulse runs once per pulseKey change. */}
      <style>{`
        @keyframes bucket-drop {
          0%   { transform: scale(1);    }
          40%  { transform: scale(1.06); }
          100% { transform: scale(1);    }
        }
        .animate-bucket-drop { animation: bucket-drop 280ms ease-out 1; }
      `}</style>

      <h2 className="text-[22px] font-semibold mb-2">Belonging skills</h2>
      <p className="text-[15px] leading-relaxed text-slate-700 mb-1">
        Drag each skill into a bucket. If a skill isn&apos;t for you right
        now, drop it in <em>Not interested right now</em> — that&apos;s a
        real answer, not a wrong one.
      </p>
      <p className="text-[12px] text-slate-500 mb-5">
        Tap <span className="font-semibold">?</span> for a quick definition.
        Tap <span className="font-semibold">×</span> on a placed card to send
        it back.
      </p>

      {/* Buckets — three across on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {BUCKETS.map((bucket) => {
          const placedBehaviors = placement[bucket.id]
            .map((id) => lookupBehavior(id))
            .filter(Boolean)
          return (
            <Bucket
              key={bucket.id}
              bucket={bucket}
              placedBehaviors={placedBehaviors}
              defOpenId={defOpenId}
              onToggleDef={(id) =>
                setDefOpenId((prev) => (prev === id ? null : id))
              }
              onRemove={removeFromBuckets}
              isHovered={drag?.hoveredBucket === bucket.id}
              isKeyboardTarget={
                keyboardPickup && keyboardTargetBucket === bucket.id
              }
              bucketRef={setBucketRef(bucket.id)}
              pulseKey={pulseKeys[bucket.id]}
            />
          )
        })}
      </div>

      {/* Unplaced list */}
      <div className="mb-5">
        <div className="text-[12px] uppercase tracking-wide text-slate-500 mb-2 font-semibold">
          Skills to sort {unplaced.length > 0 && `(${unplaced.length})`}
        </div>
        <div className="flex flex-col gap-2 min-h-[60px]">
          {unplaced.map((b, i) => (
            <SkillCard
              key={b.id}
              behavior={b}
              context="unplaced"
              index={i + 1}
              isBeingDragged={draggingId === b.id}
              isKeyboardPicked={keyboardPickup === b.id}
              defOpen={defOpenId === b.id}
              onToggleDef={() =>
                setDefOpenId((prev) => (prev === b.id ? null : b.id))
              }
              onPointerDownStart={startPointerDrag}
              onKeyboardActivate={handleKeyboardActivate}
            />
          ))}
          {unplaced.length === 0 && (
            <div className="text-[13px] text-slate-400 italic">All sorted</div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <PrimaryButton onClick={handlePrimary} disabled={!anyPlaced || submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </div>

      {/* aria-live region for screen readers — visually hidden */}
      <div role="status" aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      {/* Ghost chip — rendered last so it floats above everything */}
      {drag && draggedBehavior && (
        <GhostChip
          behavior={draggedBehavior}
          x={drag.ghostX}
          y={drag.ghostY}
          dropMode={dropAnim?.kind || null}
          targetX={dropAnim?.targetX}
          targetY={dropAnim?.targetY}
        />
      )}
    </div>
  )
}

// ---------- Reconsider-unsorted prompt (one-time) ----------

function ReconsiderScreen({ unplaced, onYes, onNo, submitting }) {
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2">You didn&apos;t sort these.</h2>
      <p className="text-[16px] leading-relaxed text-slate-700 mb-4">
        Are any of these worth reconsidering?
      </p>
      <ul className="flex flex-col gap-2 mb-6">
        {unplaced.map((b) => (
          <li
            key={b.id}
            className="rounded-2xl bg-white shadow-card px-4 py-3 text-[14px] text-slate-800 leading-snug"
          >
            {b.text}
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-end gap-2">
        <GhostButton onClick={onNo} disabled={submitting}>
          {submitting ? 'Saving…' : 'No, I’m done'}
        </GhostButton>
        <PrimaryButton onClick={onYes} disabled={submitting}>
          Yes, let me sort them
        </PrimaryButton>
      </div>
    </div>
  )
}

// ---------- Saved snapshot keepsake ----------
//
// Renders the kid's three sorted buckets (skill names inside each) as an
// SVG, with a Save-as-image button (downloadSvgElementAsPng, same path
// as Allies / Safety Net + Who I Am Poem). Unsorted skills are excluded.

function SortSnapshotScreen({ placement, lookup }) {
  const wrapRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)

  async function handleDownload() {
    setError(null)
    setDownloading(true)
    try {
      const svg = wrapRef.current?.querySelector('svg')
      if (!svg) throw new Error('No snapshot to download.')
      const stamp = new Date().toISOString().slice(0, 10)
      await downloadSvgElementAsPng(svg, `belonging-skills-${stamp}.png`)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not save the image.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-[22px] font-semibold mb-2">Nice work!</h2>
      <p className="text-[15px] text-slate-700 mb-5">
        Think about when you could try out one of these skills.
      </p>
      <div ref={wrapRef} className="mb-4 mx-auto w-full max-w-[560px]">
        <SortSnapshotSvg placement={placement} lookup={lookup} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-full px-5 py-2 min-h-[44px] text-[14px]"
        >
          <Download size={14} strokeWidth={2} />
          {downloading ? 'Saving image…' : 'Save as image'}
        </button>
        {error && <p role="alert" className="text-[12px] text-rose-600">{error}</p>}
      </div>
    </div>
  )
}

// Word-wrap a string into lines no longer than `max` characters,
// breaking on spaces.
function wrapText(text, max) {
  const words = String(text || '').split(/\s+/)
  const lines = []
  let cur = ''
  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w
    if (candidate.length > max && cur) {
      lines.push(cur)
      cur = w
    } else {
      cur = candidate
    }
  }
  if (cur) lines.push(cur)
  return lines
}

// Inline SVG snapshot of the three buckets. Computes a running y so the
// height fits the content. Renders all three bucket sections; empty ones
// show a muted "(none)". Unsorted skills are never included.
function SortSnapshotSvg({ placement, lookup }) {
  const WIDTH = 560
  const PAD_X = 28
  const WRAP_CHARS = 56
  const LINE_H = 19
  const SKILL_GAP = 8
  const SECTION_GAP = 20

  const TYPE_TONE = {
    already_doing: '#B45309',
    willing_to_try: '#8E4A4A',
    not_interested: '#4E7257',
  }

  // Build the element list + track y.
  const els = []
  let y = 48

  // Title
  els.push(
    <text
      key="title"
      x={WIDTH / 2}
      y={y}
      textAnchor="middle"
      fontFamily="ui-sans-serif, system-ui, sans-serif"
      fontSize="13"
      fontWeight="700"
      fill="#92400E"
      letterSpacing="0.18em"
    >
      BELONGING SKILLS
    </text>,
  )
  y += 32

  for (const bucket of BUCKETS) {
    const ids = placement[bucket.id] || []
    // Bucket header
    els.push(
      <text
        key={`h-${bucket.id}`}
        x={PAD_X}
        y={y}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="15"
        fontWeight="700"
        fill={TYPE_TONE[bucket.id] || '#92400E'}
      >
        {bucket.label}
      </text>,
    )
    y += 22

    if (ids.length === 0) {
      els.push(
        <text
          key={`none-${bucket.id}`}
          x={PAD_X + 12}
          y={y}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize="13"
          fontStyle="italic"
          fill="#94a3b8"
        >
          (none)
        </text>,
      )
      y += LINE_H + SECTION_GAP
      continue
    }

    for (const id of ids) {
      const b = lookup(id)
      if (!b) continue
      const lines = wrapText(`• ${b.text}`, WRAP_CHARS)
      lines.forEach((line, li) => {
        els.push(
          <text
            key={`s-${id}-${li}`}
            x={PAD_X + 12}
            y={y}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize="14"
            fill="#1f2937"
          >
            {line}
          </text>,
        )
        y += LINE_H
      })
      y += SKILL_GAP
    }
    y += SECTION_GAP
  }

  const height = y + 16

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      width="100%"
      role="img"
      aria-label="Snapshot of your sorted belonging skills"
      style={{ display: 'block', height: 'auto' }}
    >
      <rect
        x="4"
        y="4"
        width={WIDTH - 8}
        height={height - 8}
        rx="24"
        ry="24"
        fill="#FEF7E5"
        stroke="#F4D78F"
        strokeWidth="3"
      />
      {els}
    </svg>
  )
}
