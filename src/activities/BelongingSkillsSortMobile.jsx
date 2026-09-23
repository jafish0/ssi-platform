// Belonging Skills Sort — mobile-layout proposal (Draft 116 Part C,
// 2026-09-23), built out from the Draft 115 Part J concept for the team
// to try hands-on rather than just read about.
//
// The production BelongingSkillsSort.jsx (drag-and-drop + a tap-to-place
// bottom sheet, Draft 70) was flagged by Adrienne and a teammate as hard
// to use on mobile — three buckets and up to seven cards compete for a
// narrow, short viewport, so a participant has to scroll around to see
// everything at once. This is a DIFFERENT interaction model, not a
// restyle of the same one: one skill card at a time, three big
// full-width tap targets below it, nothing else on screen competing for
// space. Reuses BEHAVIORS/BUCKETS/SortSnapshotScreen from
// BelongingSkillsSort.jsx so the content and the save-payload shape stay
// identical between both layouts — this is a genuine head-to-head
// comparison, not a different activity.
//
// This is a PROTOTYPE for team review (Draft 116 Part C), reachable at
// /demo/sandbox/belonging-skills-sort-mobile — not wired into the live
// intervention. If the team prefers this layout, promoting it to
// production is a follow-up draft, not this one.
//
// Save payload — identical to BelongingSkillsSort.jsx v4.x:
//   {
//     activity: "belonging_skills_sort",
//     already_doing: [bs_id],
//     willing_to_try: [bs_id],
//     not_interested: [bs_id],
//     unplaced: [bs_id],
//     saved_at: "..."
//   }

import { useState } from 'react'
import { PrimaryButton, GhostButton, MissingItemsNote } from '../components/items/shared.jsx'
import NarrationControls from '../components/items/NarrationControls.jsx'
import { BEHAVIORS, BUCKETS, SortSnapshotScreen } from './BelongingSkillsSort.jsx'

// A skill can be in exactly one bucket, or in neither yet ("skipped for
// now" — the mobile equivalent of the production activity's `unplaced`,
// which is preserved in the save payload so analysts can tell "skipped"
// apart from "actively chose Not Interested").
function initialPlacement() {
  return { already_doing: [], willing_to_try: [], not_interested: [] }
}

function bucketOf(placement, skillId) {
  return BUCKETS.find((b) => placement[b.id].includes(skillId))?.id || null
}

// ---------- One-card-at-a-time sorter ----------

function SortCard({ behavior, currentBucket, defOpen, onToggleDef, onPlace, onSkip, onBack, canBack, index, total }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {canBack ? (
          <GhostButton onClick={onBack}>← Back</GhostButton>
        ) : (
          <span />
        )}
        <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
          Skill {index + 1} of {total}
        </div>
      </div>

      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-ctac-teal-500 transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-card p-6 mb-6 text-center">
        <div className="text-[19px] leading-snug font-semibold text-ctac-navy mb-2">
          {behavior.text}
        </div>
        <button
          type="button"
          aria-label={defOpen ? 'Hide definition' : 'Show a quick definition'}
          aria-expanded={defOpen}
          onClick={onToggleDef}
          className={
            'mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold border transition-colors ' +
            (defOpen
              ? 'bg-ctac-teal-500 text-white border-ctac-teal-500'
              : 'bg-ctac-teal-50 text-ctac-teal-700 border-ctac-teal-300 hover:bg-ctac-teal-100')
          }
        >
          {defOpen ? 'Hide definition' : 'What does this mean?'}
        </button>
        {defOpen && (
          <div className="mt-3 pt-3 border-t border-ctac-teal-200 text-[13px] leading-relaxed text-slate-600 italic text-left">
            {behavior.definition}
            <NarrationControls
              className="mt-2 not-italic justify-start"
              questionAudioUrl={behavior.audio ? `/narration/${behavior.audio}` : undefined}
            />
          </div>
        )}
        {currentBucket && (
          <div className="mt-4 text-[13px] text-ctac-teal-700">
            Right now this is in{' '}
            <span className="font-semibold">
              {BUCKETS.find((b) => b.id === currentBucket)?.label}
            </span>
            .
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-3">
        {BUCKETS.map((b) => {
          const isCurrent = b.id === currentBucket
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onPlace(b.id)}
              className={
                'w-full min-h-[64px] rounded-2xl border-2 px-5 py-4 text-[16px] font-semibold text-left transition-colors ' +
                (isCurrent
                  ? 'bg-ctac-teal-100 border-ctac-teal-400 text-ctac-teal-900 active:bg-ctac-teal-200'
                  : 'bg-white border-ctac-teal-200 text-ctac-navy hover:border-ctac-teal-400 hover:bg-ctac-teal-50 active:bg-ctac-teal-100')
              }
            >
              {b.label}
              {/* Tapping this while it's already the current bucket just
                  confirms it and moves to the next card (place() is a
                  harmless no-op for a bucket a skill is already in) — not
                  disabled, since a participant revisiting via Back with no
                  change to make still needs a way to move forward. */}
              {isCurrent && (
                <span className="ml-2 text-[12px] font-normal italic text-ctac-teal-700">
                  it&apos;s here now — tap to keep it and continue
                </span>
              )}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="w-full min-h-[48px] rounded-full border border-slate-200 text-slate-600 text-[14px] font-medium hover:bg-slate-50"
      >
        Skip this one for now →
      </button>
    </div>
  )
}

// ---------- Review screen (after the last card) ----------

function ReviewSection({ bucket, behaviors, onRemove }) {
  return (
    <div className="mb-5">
      <div className="text-[13px] font-semibold text-ctac-teal-900 mb-2">{bucket.label}</div>
      {behaviors.length === 0 ? (
        <div className="text-[13px] text-slate-400 italic">Nothing here yet</div>
      ) : (
        <div className="flex flex-col gap-2">
          {behaviors.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between gap-3 bg-white rounded-2xl shadow-card px-4 py-3"
            >
              <span className="text-[14px] text-slate-800 leading-snug">{b.stem}</span>
              <button
                type="button"
                onClick={() => onRemove(b.id)}
                aria-label={`Move ${b.stem} back to sorting`}
                className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-ctac-teal-100 hover:bg-ctac-teal-200 text-slate-600 text-[15px] font-semibold leading-none"
                title="Move back to sorting"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewScreen({ placement, lookup, skipped, onReopen, onSave, onRemove, submitting, showMissing }) {
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-1">All sorted!</h2>
      <p className="text-[14px] text-slate-600 mb-5">
        Tap the × on anything you want to move, or tap a skipped skill to decide on it.
      </p>

      {BUCKETS.map((bucket) => (
        <ReviewSection
          key={bucket.id}
          bucket={bucket}
          behaviors={placement[bucket.id].map(lookup).filter(Boolean)}
          onRemove={onRemove}
        />
      ))}

      {skipped.length > 0 && (
        <div className="mb-5">
          <div className="text-[13px] font-semibold text-slate-500 mb-2">
            Still to decide ({skipped.length})
          </div>
          <div className="flex flex-col gap-2">
            {skipped.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onReopen(b.id)}
                className="text-left bg-white rounded-2xl shadow-card px-4 py-3 text-[14px] text-slate-800 hover:ring-2 hover:ring-ctac-teal-200"
              >
                {b.stem}
                <span className="block text-[12px] text-ctac-teal-700 mt-0.5">Tap to decide →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-2">
        <PrimaryButton onClick={onSave} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </div>
      <MissingItemsNote
        message={showMissing ? 'Sort at least one skill before continuing.' : null}
      />
    </div>
  )
}

// ---------- Main component ----------

export default function BelongingSkillsSortMobile({ onSave = console.log }) {
  const [placement, setPlacement] = useState(initialPlacement)
  const [cursor, setCursor] = useState(0)
  const [phase, setPhase] = useState('sort') // 'sort' | 'review' | 'done'
  const [defOpenId, setDefOpenId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showMissing, setShowMissing] = useState(false)

  const total = BEHAVIORS.length

  function place(skillId, bucketId) {
    setPlacement((prev) => {
      const stripped = {
        already_doing: prev.already_doing.filter((x) => x !== skillId),
        willing_to_try: prev.willing_to_try.filter((x) => x !== skillId),
        not_interested: prev.not_interested.filter((x) => x !== skillId),
      }
      stripped[bucketId] = [...stripped[bucketId], skillId]
      return stripped
    })
  }

  function removeFromBuckets(skillId) {
    setPlacement((prev) => ({
      already_doing: prev.already_doing.filter((x) => x !== skillId),
      willing_to_try: prev.willing_to_try.filter((x) => x !== skillId),
      not_interested: prev.not_interested.filter((x) => x !== skillId),
    }))
  }

  function handlePlaceFromCard(bucketId) {
    place(BEHAVIORS[cursor].id, bucketId)
    setDefOpenId(null)
    advance()
  }

  function handleSkipFromCard() {
    setDefOpenId(null)
    advance()
  }

  function advance() {
    if (cursor + 1 >= total) {
      setPhase('review')
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      setCursor((c) => c + 1)
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  function handleBack() {
    setDefOpenId(null)
    setCursor((c) => Math.max(0, c - 1))
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Reopen a skill from the review screen (either an already-placed one
  // via its × remove, or a skipped one) — jumps back into the one-at-a-
  // time flow at that skill's fixed position.
  function reopenSkill(skillId) {
    const idx = BEHAVIORS.findIndex((b) => b.id === skillId)
    if (idx === -1) return
    setCursor(idx)
    setPhase('sort')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function handleReviewRemove(skillId) {
    removeFromBuckets(skillId)
    reopenSkill(skillId)
  }

  const anyPlaced =
    placement.already_doing.length > 0 ||
    placement.willing_to_try.length > 0 ||
    placement.not_interested.length > 0

  async function handleSave() {
    if (!anyPlaced) {
      setShowMissing(true)
      return
    }
    setShowMissing(false)
    setSubmitting(true)
    try {
      const placedIds = new Set([
        ...placement.already_doing,
        ...placement.willing_to_try,
        ...placement.not_interested,
      ])
      const unplaced = BEHAVIORS.filter((b) => !placedIds.has(b.id)).map((b) => b.id)
      await onSave({
        activity: 'belonging_skills_sort',
        already_doing: placement.already_doing,
        willing_to_try: placement.willing_to_try,
        not_interested: placement.not_interested,
        unplaced,
        saved_at: new Date().toISOString(),
      })
      setPhase('done')
    } finally {
      setSubmitting(false)
    }
  }

  if (phase === 'done') {
    return <SortSnapshotScreen placement={placement} lookup={(id) => BEHAVIORS.find((b) => b.id === id)} />
  }

  if (phase === 'review') {
    const placedIds = new Set([
      ...placement.already_doing,
      ...placement.willing_to_try,
      ...placement.not_interested,
    ])
    const skipped = BEHAVIORS.filter((b) => !placedIds.has(b.id))
    return (
      <ReviewScreen
        placement={placement}
        lookup={(id) => BEHAVIORS.find((b) => b.id === id)}
        skipped={skipped}
        onReopen={reopenSkill}
        onRemove={handleReviewRemove}
        onSave={handleSave}
        submitting={submitting}
        showMissing={showMissing}
      />
    )
  }

  const behavior = BEHAVIORS[cursor]
  return (
    <div>
      <div className="text-center mb-1">
        <h2 className="text-[18px] font-semibold text-slate-700">Belonging skills</h2>
      </div>
      <SortCard
        behavior={behavior}
        currentBucket={bucketOf(placement, behavior.id)}
        defOpen={defOpenId === behavior.id}
        onToggleDef={() => setDefOpenId((prev) => (prev === behavior.id ? null : behavior.id))}
        onPlace={handlePlaceFromCard}
        onSkip={handleSkipFromCard}
        onBack={handleBack}
        canBack={cursor > 0}
        index={cursor}
        total={total}
      />
    </div>
  )
}
