import { useMemo, useState } from 'react'
import { PrimaryButton, GhostButton } from '../components/items/shared.jsx'

// Getting Unstuck — RSD's stuck-thought / strategy / reflection activity.
//
// v3.0 (2026-05-12, Draft 10): rating and selection are now separate
// screens — the previous build had them combined on a single screen
// with an inline "I want to work on this" button per card.
//
// Flow:
//   rate       — All 8 thoughts shown with frequency + believability
//                5-point scales. No selection happens here.
//   pick       — Eligible thoughts (rated ≥3 on either scale) shown as
//                tappable cards. Max 2 selected.
//   strategy   — Per-thought strategy (Challenge it / Both/And it) for
//                each thought the kid picked. Walks through them in
//                STUCK_THOUGHTS order.
//   review     — Read-back of what they wrote before saving.
//   affirmation — Alt path: shown instead of `pick` when no thought met
//                the eligibility threshold. Goes straight to save.
//
// Save payload shape is UNCHANGED from v2.0 — `appraisals` covers all
// 8 thoughts, `stuck_thought_ids` lists the picked ones (0–2 items),
// `responses` carries the strategy + open text per picked thought.

const STUCK_THOUGHTS = [
  { id: 'st1', text: "I'll never fit in here." },
  { id: 'st2', text: "My foster/adoptive family isn't my real family." },
  { id: 'st3', text: 'A lot of people have given up on me in the past.' },
  { id: 'st4', text: "Nobody really understands what I've been through." },
  { id: 'st5', text: "I can't trust people because things always change." },
  { id: 'st6', text: 'I have to figure everything out on my own.' },
  { id: 'st7', text: "I don't want to get my hopes up." },
  { id: 'st8', text: 'People treat me differently because of my story.' },
]

const FREQ_LABELS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
const BELIEF_LABELS = ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Completely']

const ELIGIBILITY_THRESHOLD = 3
const MAX_PICKS = 2

const CHALLENGE_PROMPTS = [
  'Is there another way I can think about this?',
  "Is this really true, or can I think of a way it isn't true?",
  'Is this thought helping me, and if not, what is a thought that might be more helpful?',
]

const BOTH_AND_EXAMPLES = [
  '"My foster family isn\'t my real family AND there can still be a place for them in my life"',
  '"I feel like no one understands me AND there are ways I can help people get to know me more"',
  '"A lot of people have given up on me in the past AND it doesn\'t mean everyone will"',
]

// ---------- Small reusable 5-point scale ----------
function FivePointScale({ value, onChange, anchors, label }) {
  return (
    <div>
      <div className="text-[13px] text-slate-600 mb-2">{label}</div>
      <div className="flex items-stretch gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-pressed={selected}
              className={
                'flex-1 min-h-[44px] rounded-full border text-[13px] font-semibold transition-colors ' +
                (selected
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300')
              }
            >
              {n}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between mt-1 text-[11px] text-slate-500">
        <span>{anchors[0]}</span>
        <span>{anchors[4]}</span>
      </div>
    </div>
  )
}

export default function GettingUnstuck({ onSave = console.log }) {
  // Named phases — clearer than numeric steps when there are
  // conditional paths (the affirmation branch skips `pick` and
  // `strategy` entirely).
  const [phase, setPhase] = useState('rate')

  // Per-thought appraisal + selection. Shape: { [id]: { frequency, believability, selected } }
  const [appraisal, setAppraisal] = useState({})

  // Per-thought strategy response. Shape: { [id]: { strategy, challenge_response, and_statement } }
  const [responses, setResponses] = useState({})

  const [thoughtIdx, setThoughtIdx] = useState(0)
  // Transient nudge state for the Pick screen's max-2 limit. Goes
  // false again on every state change so the hint doesn't linger.
  const [limitNudge, setLimitNudge] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [savedDone, setSavedDone] = useState(false)

  // Derived: which thoughts cleared the eligibility threshold on either
  // scale. Used by the Pick screen and the rate→? transition.
  const eligibleThoughts = useMemo(
    () =>
      STUCK_THOUGHTS.filter((t) => {
        const a = appraisal[t.id] || {}
        return (
          (a.frequency || 0) >= ELIGIBILITY_THRESHOLD ||
          (a.believability || 0) >= ELIGIBILITY_THRESHOLD
        )
      }),
    [appraisal],
  )

  // Selected (chosen to work on) thoughts in STUCK_THOUGHTS order.
  const selectedThoughts = useMemo(
    () => STUCK_THOUGHTS.filter((t) => appraisal[t.id]?.selected),
    [appraisal],
  )

  // True once every thought has had both scales rated. Gates the
  // Keep going button on the Rate screen.
  const allRated = useMemo(
    () =>
      STUCK_THOUGHTS.every((t) => {
        const a = appraisal[t.id] || {}
        return !!a.frequency && !!a.believability
      }),
    [appraisal],
  )

  function setRating(thoughtId, field, value) {
    setAppraisal((prev) => {
      const cur = prev[thoughtId] || {}
      const next = { ...cur, [field]: value }
      // If dropping both scales below threshold and the thought was
      // already selected, clear the selection so eligibility stays
      // consistent if the kid revisits the Rate screen later.
      const eligible =
        (next.frequency || 0) >= ELIGIBILITY_THRESHOLD ||
        (next.believability || 0) >= ELIGIBILITY_THRESHOLD
      if (!eligible && next.selected) next.selected = false
      return { ...prev, [thoughtId]: next }
    })
  }

  // Pick-screen tap handler. Enforces the max-2 limit by refusing the
  // tap and showing a non-blocking nudge.
  function handlePickTap(thoughtId) {
    const cur = appraisal[thoughtId] || {}
    if (cur.selected) {
      // Always allow deselect.
      setAppraisal((prev) => ({
        ...prev,
        [thoughtId]: { ...(prev[thoughtId] || {}), selected: false },
      }))
      setLimitNudge(false)
      return
    }
    // Trying to select a new one — check the cap.
    const selectedCount = STUCK_THOUGHTS.filter((t) => appraisal[t.id]?.selected).length
    if (selectedCount >= MAX_PICKS) {
      setLimitNudge(true)
      return
    }
    setAppraisal((prev) => ({
      ...prev,
      [thoughtId]: { ...(prev[thoughtId] || {}), selected: true },
    }))
    setLimitNudge(false)
  }

  function setStrategy(thoughtId, strategy) {
    setResponses((prev) => ({
      ...prev,
      [thoughtId]: { ...(prev[thoughtId] || {}), strategy },
    }))
  }

  function setField(thoughtId, field, value) {
    setResponses((prev) => ({
      ...prev,
      [thoughtId]: { ...(prev[thoughtId] || {}), [field]: value },
    }))
  }

  function currentResponseValid(thought) {
    const r = responses[thought.id]
    if (!r?.strategy) return false
    if (r.strategy === 'challenge') return (r.challenge_response || '').trim().length > 0
    if (r.strategy === 'both_and') return (r.and_statement || '').trim().length > 0
    return false
  }

  async function handleSave() {
    setSubmitting(true)
    try {
      const payload = {
        activity: 'getting_unstuck',
        appraisals: STUCK_THOUGHTS.map((t) => ({
          thought_id: t.id,
          thought_text: t.text,
          frequency: appraisal[t.id]?.frequency ?? null,
          believability: appraisal[t.id]?.believability ?? null,
          selected: !!appraisal[t.id]?.selected,
        })),
        stuck_thought_ids: selectedThoughts.map((t) => t.id),
        responses: selectedThoughts.map((t) => {
          const r = responses[t.id] || {}
          const out = {
            thought_id: t.id,
            thought_text: t.text,
            strategy: r.strategy,
          }
          if (r.strategy === 'challenge') out.challenge_response = r.challenge_response
          if (r.strategy === 'both_and') out.and_statement = r.and_statement
          return out
        }),
        saved_at: new Date().toISOString(),
      }
      await onSave(payload)
      setSavedDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Done state ----
  if (savedDone) {
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-3">Saved</h2>
        <p className="text-[16px] text-slate-700">That&apos;s real work. Let&apos;s keep going.</p>
      </div>
    )
  }

  // ---- Phase: rate ----
  if (phase === 'rate') {
    function handleRateContinue() {
      // Determine next phase based on whether any thoughts are eligible.
      // No eligible → affirmation path (skip pick + strategy).
      if (eligibleThoughts.length === 0) {
        setPhase('affirmation')
      } else {
        // Entering Pick: clear stale selections that are no longer
        // eligible (kid may have lowered ratings since picking). The
        // setRating effect already handles individual eligibility drops,
        // but a defensive sweep keeps the Pick screen clean.
        setAppraisal((prev) => {
          const next = { ...prev }
          for (const t of STUCK_THOUGHTS) {
            const a = next[t.id] || {}
            const eligible =
              (a.frequency || 0) >= ELIGIBILITY_THRESHOLD ||
              (a.believability || 0) >= ELIGIBILITY_THRESHOLD
            if (!eligible && a.selected) next[t.id] = { ...a, selected: false }
          }
          return next
        })
        setLimitNudge(false)
        setPhase('pick')
      }
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
    }

    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-1">Stuck thoughts</h2>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-5">
          These are thoughts that can keep someone feeling stuck. For each one,
          rate how it feels for you.
        </p>

        <div className="space-y-4 mb-6">
          {STUCK_THOUGHTS.map((t) => {
            const a = appraisal[t.id] || {}
            return (
              <div
                key={t.id}
                className="rounded-2xl border bg-white border-slate-200 p-4"
              >
                <div className="text-[15px] leading-relaxed text-slate-800 mb-4">
                  {t.text}
                </div>
                <div className="space-y-4">
                  <FivePointScale
                    label="How often do you have this thought?"
                    anchors={FREQ_LABELS}
                    value={a.frequency || 0}
                    onChange={(v) => setRating(t.id, 'frequency', v)}
                  />
                  <FivePointScale
                    label="How strongly do you believe this thought is true?"
                    anchors={BELIEF_LABELS}
                    value={a.believability || 0}
                    onChange={(v) => setRating(t.id, 'believability', v)}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-end">
          <PrimaryButton onClick={handleRateContinue} disabled={!allRated}>
            Keep going →
          </PrimaryButton>
        </div>
        {!allRated && (
          <p className="text-[12px] text-slate-500 italic text-right mt-2">
            Rate both scales on every thought to continue.
          </p>
        )}
      </div>
    )
  }

  // ---- Phase: pick (1-2 from the eligible set) ----
  if (phase === 'pick') {
    const selectedCount = selectedThoughts.length
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-1">
          Which of these thoughts would you like to work on?
        </h2>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-5">
          Pick one or two.
        </p>

        <div className="space-y-3 mb-2">
          {eligibleThoughts.map((t) => {
            const selected = !!appraisal[t.id]?.selected
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handlePickTap(t.id)}
                aria-pressed={selected}
                className={
                  'w-full text-left rounded-2xl border-2 px-4 py-3 min-h-[60px] text-[15px] leading-relaxed transition-colors ' +
                  (selected
                    ? 'bg-amber-100 border-amber-500 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300')
                }
              >
                <span className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={
                      'inline-flex items-center justify-center rounded-full w-6 h-6 flex-shrink-0 mt-0.5 ' +
                      (selected
                        ? 'bg-amber-500 text-white'
                        : 'border border-slate-300 text-transparent')
                    }
                  >
                    ✓
                  </span>
                  <span className="flex-1">{t.text}</span>
                </span>
              </button>
            )
          })}
        </div>

        {limitNudge && (
          <p className="text-[13px] text-amber-700 italic mt-2">
            Pick up to 2. Deselect one first if you want to swap it.
          </p>
        )}

        <div className="flex items-center justify-between mt-6">
          <GhostButton
            onClick={() => {
              setLimitNudge(false)
              setPhase('rate')
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
            }}
          >
            ← Back
          </GhostButton>
          <PrimaryButton
            onClick={() => {
              setThoughtIdx(0)
              setPhase('strategy')
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
            }}
            disabled={selectedCount < 1}
          >
            Keep going →
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // ---- Phase: affirmation (no eligible thoughts) ----
  if (phase === 'affirmation') {
    return (
      <div className="text-center py-4">
        <h2 className="text-[22px] font-semibold mb-3">That&apos;s good news.</h2>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-6 max-w-[480px] mx-auto">
          Looks like none of these thoughts are sticking with you right now —
          you don&apos;t have to wrestle with them today.
        </p>
        <div className="flex items-center justify-between">
          <GhostButton
            onClick={() => {
              setPhase('rate')
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
            }}
          >
            ← Back
          </GhostButton>
          <PrimaryButton onClick={handleSave} disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // ---- Phase: strategy (per picked thought) ----
  if (phase === 'strategy') {
    const thought = selectedThoughts[thoughtIdx]
    if (!thought) {
      // Safety: nothing selected; bounce back to pick.
      setPhase('pick')
      return null
    }
    const r = responses[thought.id] || {}
    const isLastThought = thoughtIdx === selectedThoughts.length - 1
    const valid = currentResponseValid(thought)
    return (
      <div>
        <div className="flex justify-center gap-2 mb-4" aria-hidden="true">
          {selectedThoughts.map((_, i) => (
            <span
              key={i}
              className={
                'rounded-full ' +
                (i === thoughtIdx
                  ? 'w-2 h-2 bg-amber-400'
                  : i < thoughtIdx
                    ? 'w-2 h-2 bg-amber-200'
                    : 'w-1.5 h-1.5 bg-slate-200')
              }
            />
          ))}
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-300 rounded-2xl px-5 py-4 mb-5">
          <div className="text-[13px] font-medium text-amber-800 mb-1">
            Stuck thought
          </div>
          <p className="text-[16px] text-slate-800">{thought.text}</p>
        </div>

        <p className="text-[14px] text-slate-600 mb-3">Pick a strategy:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setStrategy(thought.id, 'challenge')}
            className={
              'text-left rounded-2xl border p-4 transition-colors ' +
              (r.strategy === 'challenge'
                ? 'bg-amber-200 border-amber-400'
                : 'bg-white border-slate-200 hover:border-amber-300')
            }
          >
            <div className="font-semibold text-[16px] mb-1">Challenge it</div>
            <div className="text-[13px] text-slate-600">
              Push back on the thought. Is there another way to see this?
            </div>
          </button>
          <button
            type="button"
            onClick={() => setStrategy(thought.id, 'both_and')}
            className={
              'text-left rounded-2xl border p-4 transition-colors ' +
              (r.strategy === 'both_and'
                ? 'bg-amber-200 border-amber-400'
                : 'bg-white border-slate-200 hover:border-amber-300')
            }
          >
            <div className="font-semibold text-[16px] mb-1">Both/And it</div>
            <div className="text-[13px] text-slate-600">
              This thought might have a piece of truth, but it leaves out other
              truths.
            </div>
          </button>
        </div>

        {r.strategy === 'challenge' && (
          <div className="mb-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-3">
              <div className="text-[13px] font-medium text-slate-600 mb-2">
                Ask yourself:
              </div>
              <ul className="space-y-2 text-[15px] text-slate-800 list-disc pl-5 leading-relaxed">
                {CHALLENGE_PROMPTS.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
            <label className="block text-[14px] font-medium text-slate-700 mb-2">
              What comes up when you ask yourself those?
            </label>
            <textarea
              rows={5}
              value={r.challenge_response || ''}
              onChange={(e) => setField(thought.id, 'challenge_response', e.target.value)}
              placeholder="Take any of the questions above and write what comes up."
              className="w-full text-[16px] leading-relaxed px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
            />
          </div>
        )}

        {r.strategy === 'both_and' && (
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-slate-700 mb-2">
              Build the Both/And:
            </label>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-[15px] text-slate-800 mb-2 italic">
                {thought.text} <span className="font-semibold not-italic">AND</span>
              </div>
              <textarea
                rows={3}
                value={r.and_statement || ''}
                onChange={(e) => setField(thought.id, 'and_statement', e.target.value)}
                placeholder="…there can still be other truths"
                className="w-full text-[16px] leading-relaxed px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
              />
            </div>
            <details className="mt-3 text-[13px] text-slate-600">
              <summary className="cursor-pointer text-amber-700">Need an example?</summary>
              <ul className="mt-2 space-y-1">
                {BOTH_AND_EXAMPLES.map((ex, i) => (
                  <li key={i} className="italic">{ex}</li>
                ))}
              </ul>
            </details>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <GhostButton
            onClick={() => {
              if (thoughtIdx > 0) {
                setThoughtIdx((i) => i - 1)
              } else {
                setPhase('pick')
              }
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
            }}
          >
            ← Back
          </GhostButton>
          <PrimaryButton
            onClick={() => {
              if (!valid) return
              if (isLastThought) {
                setPhase('review')
              } else {
                setThoughtIdx((i) => i + 1)
              }
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
            }}
            disabled={!valid}
          >
            {isLastThought ? 'Review →' : 'Next thought →'}
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // ---- Phase: review ----
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-3">Your work</h2>
      <p className="text-[16px] leading-relaxed text-slate-700 mb-5">
        Here&apos;s what you wrote. Take a moment with it.
      </p>

      <div className="space-y-4 mb-6">
        {selectedThoughts.map((t) => {
          const r = responses[t.id] || {}
          return (
            <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-[13px] text-slate-500 mb-1">Stuck thought</div>
              <div className="text-[15px] text-slate-800 mb-3">{t.text}</div>
              <div className="text-[13px] text-amber-800 font-medium mb-1">
                {r.strategy === 'challenge' ? 'Challenge it' : 'Both/And it'}
              </div>
              {r.strategy === 'challenge' && (
                <div className="text-[15px] text-slate-800 italic">
                  {r.challenge_response}
                </div>
              )}
              {r.strategy === 'both_and' && (
                <div className="text-[15px] text-slate-800 italic">
                  {t.text} <span className="font-semibold not-italic">AND</span> {r.and_statement}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <GhostButton
          onClick={() => {
            setThoughtIdx(selectedThoughts.length - 1)
            setPhase('strategy')
            if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
          }}
        >
          ← Back
        </GhostButton>
        <PrimaryButton onClick={handleSave} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </div>
    </div>
  )
}
