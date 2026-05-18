import { useMemo, useState } from 'react'
import { PrimaryButton, GhostButton } from '../components/items/shared.jsx'
import { APPRAISAL_ITEMS, APPRAISAL_SCALE } from '../lib/appraisals.js'

// Getting Unstuck — Ready for Roots' stuck-thought / strategy / reflection activity.
//
// v5.0 (2026-05-13, Draft 15): structural rebuild.
//   - The 8 RSD-specific stuck thoughts are replaced with the 6 locked
//     **Appraisals** items shared with the FollowUp Survey (single
//     source of truth in `src/lib/appraisals.js`). Item wording is
//     verbatim from the locked clinical doc — see the appraisals module.
//   - The "how often" rating dimension is gone. There's now ONE rating
//     per item: how true it feels, on a 0-5 scale with anchors
//     "Not At All True / Somewhat True / Definitely True." This matches
//     the FollowUp Survey exactly so within-subject change scores work.
//   - The eligibility threshold for the Pick screen is lowered to ≥2
//     (Stephanie: kids who rated above 1 weren't being pulled forward
//     under the old ≥3-on-either rule).
//   - A new "Other thought" screen sits between Rate and Pick — kid
//     can name one of their own stuck thoughts and rate it on the same
//     scale. If they hit Yes + rate ≥2, the Other item also becomes
//     eligible in Pick under id `a_other`.
//   - The Fight ↔ Challenge naming has now flipped three times. As of
//     2026-05-18 the final answer is **Challenge**. Strategy data key
//     `'challenge'`, response field `challenge_response`, button label
//     "Challenge it" — this is the version that's staying.
//   - Jessica's 2026-05-18 copy edit: the response-screen prompt
//     ends with "those questions?" (was "those?").
//
// Save payload shape (v5.0):
//   {
//     activity: "getting_unstuck",
//     appraisals: {
//       a1: { truth_rating: 0..5, selected: bool,
//             strategy?: "challenge"|"both_and",
//             response?: "..." },
//       ... a6,
//       a_other?: { text: "...", truth_rating, selected, strategy?, response? }
//     },
//     saved_at: ISO,
//   }
//
// The `responses` array + `stuck_thought_ids` from v3/v4 are gone;
// everything is keyed by appraisal id inside the `appraisals` object.

const ELIGIBILITY_THRESHOLD = 2
const MAX_PICKS = 2

// Three "Challenge it" prompts (Stephanie's PPT slide 12). Shown as
// scaffolding above the open-ended response field when the kid picks
// "Challenge it" for an item.
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

const OTHER_ID = 'a_other'

// ---------- Reusable 0-5 truth-rating scale ----------
//
// Anchors come from APPRAISAL_SCALE so this component and the FollowUp
// Survey use literally the same labels.
function TruthRatingScale({ value, onChange, label }) {
  const { min, max, anchors } = APPRAISAL_SCALE
  const minAnchor = anchors.find((a) => a.v === min)
  const maxAnchor = anchors.find((a) => a.v === max)
  const midAnchor = anchors.find((a) => a.v === Math.round((min + max) / 2))
  return (
    <div>
      {label && <div className="text-[13px] text-slate-600 mb-2">{label}</div>}
      <div className="flex items-stretch gap-1.5">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => {
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
      <div className="grid grid-cols-3 mt-1 text-[11px] text-slate-500">
        <span className="text-left">{minAnchor?.label}</span>
        <span className="text-center">{midAnchor?.label}</span>
        <span className="text-right">{maxAnchor?.label}</span>
      </div>
    </div>
  )
}

export default function GettingUnstuck({ onSave = console.log }) {
  // Named phases:
  //   rate        → score the 6 appraisal items
  //   other       → Yes/No on an Other thought; if Yes, type + rate it
  //   pick        → choose 1-2 eligible items to work on
  //   strategy    → per-picked: Challenge or Both/And + open text
  //   review      → read-back before save
  //   affirmation → alt path when zero items clear threshold (skip pick + strategy)
  const [phase, setPhase] = useState('rate')

  // Per-item state keyed by id ('a1'…'a6' and optionally 'a_other').
  // Shape: { truth_rating?: 0..5, selected?: bool, strategy?, response?, and_statement? }
  // Plus on a_other only: { text }.
  const [items, setItems] = useState({})

  // Other-screen Yes/No state. null means "not chosen yet" (button row
  // visible); 'yes' shows the text + scale; 'no' skips straight on.
  const [otherChoice, setOtherChoice] = useState(null)
  const [otherText, setOtherText] = useState('')

  // Pick-screen walkthrough index.
  const [thoughtIdx, setThoughtIdx] = useState(0)
  const [limitNudge, setLimitNudge] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [savedDone, setSavedDone] = useState(false)

  // ---- Derived sets ----

  // All eligible item ids in display order (locked items first, then
  // a_other if it cleared threshold).
  const eligibleItems = useMemo(() => {
    const locked = APPRAISAL_ITEMS.filter(
      (it) => (items[it.id]?.truth_rating ?? -1) >= ELIGIBILITY_THRESHOLD,
    )
    const otherEligible =
      otherChoice === 'yes' &&
      otherText.trim().length > 0 &&
      (items[OTHER_ID]?.truth_rating ?? -1) >= ELIGIBILITY_THRESHOLD
    if (otherEligible) {
      return [
        ...locked,
        { id: OTHER_ID, text: otherText.trim(), dimension: 'other' },
      ]
    }
    return locked
  }, [items, otherChoice, otherText])

  // Selected (chosen to work on), in eligible-list order.
  const selectedItems = useMemo(
    () => eligibleItems.filter((it) => items[it.id]?.selected),
    [eligibleItems, items],
  )

  const allRated = useMemo(
    () => APPRAISAL_ITEMS.every((it) => items[it.id]?.truth_rating != null),
    [items],
  )

  // ---- Mutators ----

  function setRating(id, value) {
    setItems((prev) => {
      const cur = prev[id] || {}
      const next = { ...cur, truth_rating: value }
      // Defensive: if this rating drops below threshold and the item was
      // previously selected, clear the selection so eligibility/pick
      // stay consistent.
      if (value < ELIGIBILITY_THRESHOLD && next.selected) next.selected = false
      return { ...prev, [id]: next }
    })
  }

  function handlePickTap(id) {
    const cur = items[id] || {}
    if (cur.selected) {
      setItems((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), selected: false },
      }))
      setLimitNudge(false)
      return
    }
    const selectedCount = eligibleItems.filter(
      (it) => items[it.id]?.selected,
    ).length
    if (selectedCount >= MAX_PICKS) {
      setLimitNudge(true)
      return
    }
    setItems((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), selected: true },
    }))
    setLimitNudge(false)
  }

  function setStrategy(id, strategy) {
    setItems((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), strategy },
    }))
  }

  function setField(id, field, value) {
    setItems((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }))
  }

  function currentResponseValid(id) {
    const r = items[id] || {}
    if (!r.strategy) return false
    if (r.strategy === 'challenge') return (r.response || '').trim().length > 0
    if (r.strategy === 'both_and') return (r.and_statement || '').trim().length > 0
    return false
  }

  // ---- Save ----

  async function handleSave() {
    setSubmitting(true)
    try {
      // Build the appraisals dict for the payload. Only includes
      // a_other when otherChoice === 'yes' AND the kid actually typed
      // something — empty Other isn't useful to the analyst.
      const appraisals = {}
      for (const it of APPRAISAL_ITEMS) {
        const r = items[it.id] || {}
        const entry = {
          truth_rating: r.truth_rating ?? null,
          selected: !!r.selected,
        }
        if (r.selected) {
          if (r.strategy) entry.strategy = r.strategy
          if (r.strategy === 'challenge') entry.response = r.response || ''
          if (r.strategy === 'both_and') entry.and_statement = r.and_statement || ''
        }
        appraisals[it.id] = entry
      }
      if (otherChoice === 'yes' && otherText.trim().length > 0) {
        const r = items[OTHER_ID] || {}
        const entry = {
          text: otherText.trim(),
          truth_rating: r.truth_rating ?? null,
          selected: !!r.selected,
        }
        if (r.selected) {
          if (r.strategy) entry.strategy = r.strategy
          if (r.strategy === 'challenge') entry.response = r.response || ''
          if (r.strategy === 'both_and') entry.and_statement = r.and_statement || ''
        }
        appraisals[OTHER_ID] = entry
      }
      await onSave({
        activity: 'getting_unstuck',
        appraisals,
        saved_at: new Date().toISOString(),
      })
      setSavedDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  function scrollTop() {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // ---- Done ----
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
      setPhase('other')
      scrollTop()
    }
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-1">Stuck thoughts</h2>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-5">
          These are thoughts that can keep someone feeling stuck. For each
          one, rate how true it feels for you right now.
        </p>

        <div className="space-y-4 mb-6">
          {APPRAISAL_ITEMS.map((it) => {
            const a = items[it.id] || {}
            return (
              <div
                key={it.id}
                className="rounded-2xl border bg-white border-slate-200 p-4"
              >
                <div className="text-[15px] leading-relaxed text-slate-800 mb-4">
                  {it.text}
                </div>
                <TruthRatingScale
                  label="How true does this feel for you?"
                  value={a.truth_rating ?? null}
                  onChange={(v) => setRating(it.id, v)}
                />
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
            Rate every thought to continue.
          </p>
        )}
      </div>
    )
  }

  // ---- Phase: other ----
  if (phase === 'other') {
    function handleOtherContinue() {
      // Decide downstream phase based on eligibility after the Other
      // contribution. If no items (locked or Other) clear the
      // threshold → affirmation; otherwise → pick.
      const hasEligible = eligibleItems.length > 0
      // Defensive eligibility sweep before entering Pick, matching v3.0
      // behavior.
      setItems((prev) => {
        const next = { ...prev }
        for (const it of APPRAISAL_ITEMS) {
          const a = next[it.id] || {}
          if ((a.truth_rating ?? -1) < ELIGIBILITY_THRESHOLD && a.selected) {
            next[it.id] = { ...a, selected: false }
          }
        }
        // a_other only stays if Other path is yes + named + rated ≥2.
        const otherEligible =
          otherChoice === 'yes' &&
          otherText.trim().length > 0 &&
          (next[OTHER_ID]?.truth_rating ?? -1) >= ELIGIBILITY_THRESHOLD
        if (!otherEligible && next[OTHER_ID]?.selected) {
          next[OTHER_ID] = { ...next[OTHER_ID], selected: false }
        }
        return next
      })
      setLimitNudge(false)
      setPhase(hasEligible ? 'pick' : 'affirmation')
      scrollTop()
    }

    // Yes-path is gated: must type the thought AND rate it before continuing.
    // (Empty text reduces to a No.)
    const yesPathReady =
      otherChoice !== 'yes' ||
      (otherText.trim().length > 0 && items[OTHER_ID]?.truth_rating != null)

    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-3">One more.</h2>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-5">
          Is there another thought you&apos;ve had that we didn&apos;t
          list here?
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setOtherChoice('no')}
            aria-pressed={otherChoice === 'no'}
            className={
              'rounded-2xl border-2 px-4 py-3 min-h-[52px] text-[15px] font-semibold transition-colors ' +
              (otherChoice === 'no'
                ? 'bg-amber-100 border-amber-500 text-amber-900'
                : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300')
            }
          >
            No
          </button>
          <button
            type="button"
            onClick={() => setOtherChoice('yes')}
            aria-pressed={otherChoice === 'yes'}
            className={
              'rounded-2xl border-2 px-4 py-3 min-h-[52px] text-[15px] font-semibold transition-colors ' +
              (otherChoice === 'yes'
                ? 'bg-amber-100 border-amber-500 text-amber-900'
                : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300')
            }
          >
            Yes
          </button>
        </div>

        {otherChoice === 'yes' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6">
            <label className="block text-[14px] font-medium text-slate-700 mb-2">
              Type the thought in your own words
            </label>
            <textarea
              rows={3}
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              maxLength={280}
              placeholder="Whatever comes to mind…"
              className="w-full text-[16px] leading-relaxed px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white mb-4"
            />
            <TruthRatingScale
              label="How true does this feel for you?"
              value={items[OTHER_ID]?.truth_rating ?? null}
              onChange={(v) => setRating(OTHER_ID, v)}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <GhostButton
            onClick={() => {
              setPhase('rate')
              scrollTop()
            }}
          >
            ← Back
          </GhostButton>
          <PrimaryButton
            onClick={handleOtherContinue}
            disabled={otherChoice == null || !yesPathReady}
          >
            Keep going →
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // ---- Phase: pick ----
  if (phase === 'pick') {
    const selectedCount = selectedItems.length
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-1">
          Which of these thoughts would you like to work on?
        </h2>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-5">
          Pick one or two.
        </p>

        <div className="space-y-3 mb-2">
          {eligibleItems.map((it) => {
            const selected = !!items[it.id]?.selected
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => handlePickTap(it.id)}
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
                  <span className="flex-1">{it.text}</span>
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
              setPhase('other')
              scrollTop()
            }}
          >
            ← Back
          </GhostButton>
          <PrimaryButton
            onClick={() => {
              setThoughtIdx(0)
              setPhase('strategy')
              scrollTop()
            }}
            disabled={selectedCount < 1}
          >
            Keep going →
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // ---- Phase: affirmation ----
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
              setPhase('other')
              scrollTop()
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

  // ---- Phase: strategy (per picked item) ----
  if (phase === 'strategy') {
    const item = selectedItems[thoughtIdx]
    if (!item) {
      setPhase('pick')
      return null
    }
    const r = items[item.id] || {}
    const isLastThought = thoughtIdx === selectedItems.length - 1
    const valid = currentResponseValid(item.id)
    return (
      <div>
        <div className="flex justify-center gap-2 mb-4" aria-hidden="true">
          {selectedItems.map((_, i) => (
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
          <p className="text-[16px] text-slate-800">{item.text}</p>
        </div>

        <p className="text-[14px] text-slate-600 mb-3">Pick a strategy:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setStrategy(item.id, 'challenge')}
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
            onClick={() => setStrategy(item.id, 'both_and')}
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
              What comes up for you when you ask yourself those questions?
            </label>
            <textarea
              rows={5}
              value={r.response || ''}
              onChange={(e) => setField(item.id, 'response', e.target.value)}
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
                {item.text} <span className="font-semibold not-italic">AND</span>
              </div>
              <textarea
                rows={3}
                value={r.and_statement || ''}
                onChange={(e) => setField(item.id, 'and_statement', e.target.value)}
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
              scrollTop()
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
              scrollTop()
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
        {selectedItems.map((it) => {
          const r = items[it.id] || {}
          return (
            <div key={it.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-[13px] text-slate-500 mb-1">Stuck thought</div>
              <div className="text-[15px] text-slate-800 mb-3">{it.text}</div>
              <div className="text-[13px] text-amber-800 font-medium mb-1">
                {r.strategy === 'challenge' ? 'Challenge it' : 'Both/And it'}
              </div>
              {r.strategy === 'challenge' && (
                <div className="text-[15px] text-slate-800 italic">
                  {r.response}
                </div>
              )}
              {r.strategy === 'both_and' && (
                <div className="text-[15px] text-slate-800 italic">
                  {it.text} <span className="font-semibold not-italic">AND</span> {r.and_statement}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <GhostButton
          onClick={() => {
            setThoughtIdx(selectedItems.length - 1)
            setPhase('strategy')
            scrollTop()
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
