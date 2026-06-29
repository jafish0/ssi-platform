import { useMemo, useState } from 'react'
import { PlayCircle } from 'lucide-react'
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
//     per item: how true it feels, on a 0-4 scale (v5.4; was 0-5) with anchors
//     "Not At All True / Somewhat True / Definitely True." This matches
//     the FollowUp Survey exactly so within-subject change scores work.
//   - The eligibility threshold for the Pick screen is **≥2** as of
//     v5.3. (See the ELIGIBILITY_THRESHOLD comment for the full flip
//     history — this line has now moved 3↔2 three times.)
//   - A new "Other thought" screen sits between Rate and Pick — kid
//     can name one of their own stuck thoughts and rate it on the same
//     scale. If they hit Yes + rate ≥3, the Other item also becomes
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

// ELIGIBILITY_THRESHOLD flip history (this single constant has moved
// 3 ↔ 2 three times — recorded here so future-us doesn't get whiplash):
//   - v3.0 / v4.0: ≥3 carries forward to Pick.
//   - v5.0 (Draft 15, commit 27e4d52): lowered to ≥2 per Stephanie.
//   - v5.1 (Draft 17, commit 6900549): reverted to ≥3 — Josh's call.
//   - v5.3 (Draft 20, 2026-06-01): back to ≥2, FINAL per the meeting.
//     A kid who rates an item at 2 is endorsing it enough to be worth
//     offering the Pick / Challenge / Both-and flow.
//   - v5.4 (Draft 26, 2026-06-08): scale shifted 0-5 → 0-4, so 2 is now
//     EXACTLY the middle "Somewhat True" anchor. Threshold stays ≥2 —
//     items rated "Somewhat True" or above (2, 3, 4) carry forward;
//     0 and 1 don't. Same behavior in spirit, cleaner anchor math.
const ELIGIBILITY_THRESHOLD = 2
const MAX_PICKS = 2

// Brief affirmation headings shown between consecutive thought-work
// cycles (Ginny's 2026-06-01 ask: "after each time they challenge that
// they needed an affirmation"). With MAX_PICKS=2 a kid sees at most one
// of these, so back-to-back repetition isn't really possible; we still
// randomize so it doesn't always read the same across sessions.
const CYCLE_AFFIRMATIONS = [
  'Nice work.',
  'Good job.',
  "You're doing this.",
  'Keep going.',
]

// Three "Challenge it" prompts (Stephanie's PPT slide 12). Shown as
// scaffolding above the open-ended response field when the kid picks
// "Challenge it" for an item.
const CHALLENGE_PROMPTS = [
  'Is there another way I can think about this?',
  "Is this really true, or can I think of a way it isn't true?",
  'Is this thought helping me, and if not, what is a thought that might be more helpful?',
]


const OTHER_ID = 'a_other'

// ---------- Reusable truth-rating scale (0-4 as of v5.4) ----------
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
                  ? 'bg-ctac-teal-500 border-ctac-teal-500 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-ctac-teal-300')
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
  //   cycle_affirmation → brief "nice work, let's try the next one" beat
  //                 shown between consecutive picked thoughts (v5.3)
  //   review      → read-back before save
  //   affirmation → alt path when zero items clear threshold (skip pick + strategy)
  const [phase, setPhase] = useState('rate')

  // Heading for the between-thoughts affirmation beat (randomized when we
  // enter the cycle_affirmation phase).
  const [cycleHeading, setCycleHeading] = useState(CYCLE_AFFIRMATIONS[0])

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

  // "I need help" panel (v5.4) — id of the item whose alternative-thought
  // suggestions panel is currently open, or null.
  const [helpOpenId, setHelpOpenId] = useState(null)

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
                ? 'bg-ctac-teal-100 border-ctac-teal-500 text-ctac-teal-900'
                : 'bg-white border-slate-200 text-slate-800 hover:border-ctac-teal-300')
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
                ? 'bg-ctac-teal-100 border-ctac-teal-500 text-ctac-teal-900'
                : 'bg-white border-slate-200 text-slate-800 hover:border-ctac-teal-300')
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
              className="w-full text-[16px] leading-relaxed px-4 py-3 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white mb-4"
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
        <h2 className="text-[22px] font-semibold mb-5">
          Pick the top two thoughts you would like to work on.
        </h2>

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
                    ? 'bg-ctac-teal-100 border-ctac-teal-500 text-ctac-teal-900'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-ctac-teal-300')
                }
              >
                <span className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={
                      'inline-flex items-center justify-center rounded-full w-6 h-6 flex-shrink-0 mt-0.5 ' +
                      (selected
                        ? 'bg-ctac-teal-500 text-white'
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
          <p className="text-[13px] text-ctac-teal-700 italic mt-2">
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
      <div className="py-4">
        <div className="text-center">
          <h2 className="text-[22px] font-semibold mb-3">That&apos;s good news.</h2>
          <p className="text-[16px] leading-relaxed text-slate-700 mb-6 max-w-[480px] mx-auto">
            Looks like none of these thoughts are sticking with you right now —
            you don&apos;t have to wrestle with them today.
          </p>
        </div>

        {/* Strategy explainer — even when there's no specific thought to
            work on, the kid still learns the two strategies (Ginny's
            2026-06-01 ask). Video is a placeholder for now (Adrian to
            record; Stephanie offered to script a ~1-min version); the
            text scaffolding below carries the content until then. */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 text-left max-w-[560px] mx-auto">
          <p className="text-[15px] leading-relaxed text-slate-800 mb-4">
            If a stuck thought ever does come up, here are two ways to work
            with it:
          </p>

          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="relative w-full bg-slate-900" style={{ paddingBottom: '56.25%' }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-200 gap-2">
                <PlayCircle size={44} strokeWidth={1.4} />
                <span className="text-[13px] uppercase tracking-widest">
                  Video coming soon
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 p-3">
              <div className="font-semibold text-[15px] mb-1">Challenge it</div>
              <div className="text-[13px] text-slate-600 leading-relaxed">
                Push back on the thought. Is there another way to see this? Is
                it really true, or is there a more helpful way to think about it?
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3">
              <div className="font-semibold text-[15px] mb-1">Both/And it</div>
              <div className="text-[13px] text-slate-600 leading-relaxed">
                The thought might hold a piece of truth, but it leaves out other
                truths. You hold both at once — &quot;this AND that.&quot;
              </div>
            </div>
          </div>
        </div>

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
    // Alternative-thought suggestions for the "I need help" panel. Only
    // the locked appraisal items carry these; a_other has none. As of
    // v5.5 (Draft 27) the content is strategy-keyed — surface the set
    // matching the kid's current strategy (default to Challenge if a
    // strategy isn't chosen yet, which shouldn't happen since the help
    // button only shows after selection).
    const helpByStrategy =
      APPRAISAL_ITEMS.find((it) => it.id === item.id)?.help_suggestions || null
    const helpSuggestions = helpByStrategy
      ? helpByStrategy[r.strategy === 'both_and' ? 'both_and' : 'challenge'] || []
      : []
    return (
      <div>
        <div className="flex justify-center gap-2 mb-4" aria-hidden="true">
          {selectedItems.map((_, i) => (
            <span
              key={i}
              className={
                'rounded-full ' +
                (i === thoughtIdx
                  ? 'w-2 h-2 bg-ctac-teal-400'
                  : i < thoughtIdx
                    ? 'w-2 h-2 bg-ctac-teal-200'
                    : 'w-1.5 h-1.5 bg-slate-200')
              }
            />
          ))}
        </div>

        <div className="bg-ctac-teal-50 border-l-4 border-ctac-teal-300 rounded-2xl px-5 py-4 mb-5">
          <div className="text-[13px] font-medium text-ctac-teal-800 mb-1">
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
                ? 'bg-ctac-teal-200 border-ctac-teal-400'
                : 'bg-white border-slate-200 hover:border-ctac-teal-300')
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
                ? 'bg-ctac-teal-200 border-ctac-teal-400'
                : 'bg-white border-slate-200 hover:border-ctac-teal-300')
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
              Now that you&apos;ve thought about your statement in different
              ways, what is a more helpful or more accurate statement you could
              tell yourself?
            </label>
            <textarea
              rows={5}
              value={r.response || ''}
              onChange={(e) => setField(item.id, 'response', e.target.value)}
              placeholder="Take any of the questions above and write what comes up."
              className="w-full text-[16px] leading-relaxed px-4 py-3 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
            />
          </div>
        )}

        {r.strategy === 'both_and' && (
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-slate-700 mb-2">
              Build the Both/And:
            </label>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              {/* Seed uses the softened `both_and_root` (v5.8) — you can't
                  coherently AND-extend the absolute original. Falls back to
                  `text` for the kid's custom "Other" thought (no root). */}
              <div className="text-[15px] text-slate-800 mb-2 italic">
                {item.both_and_root || item.text}{' '}
                <span className="font-semibold not-italic">AND</span>
              </div>
              <textarea
                rows={3}
                value={r.and_statement || ''}
                onChange={(e) => setField(item.id, 'and_statement', e.target.value)}
                placeholder="…there can still be other truths"
                className="w-full text-[16px] leading-relaxed px-4 py-3 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
              />
            </div>
            {/* The "Need an example?" disclosure was dropped in v5.7
                (Draft 32 Part D) — "I need help creating a new thought"
                below is now the single help affordance on both strategies. */}
          </div>
        )}

        {/* "I need help" (v5.4) — alternative-thought suggestions for this
            item. Shown once a strategy is chosen; only for the locked
            appraisal items (which carry help_suggestions), not a_other.
            Tapping a suggestion pre-fills the active response field. */}
        {r.strategy && helpSuggestions.length > 0 && (
          <div className="mb-5">
            {/* Secondary-CTA styling (v5.7) — bigger + bolder than the
                old text link so it reads as a usable affordance (Jessica
                + Holly), without competing with the primary Continue/Save.
                Renamed so kids know it's about generating a new thought,
                not tech support (Holly). Appears on both strategies. */}
            <button
              type="button"
              onClick={() => setHelpOpenId((id) => (id === item.id ? null : item.id))}
              aria-expanded={helpOpenId === item.id}
              className="inline-flex items-center text-[15px] font-semibold text-ctac-teal-800 bg-ctac-teal-100 hover:bg-ctac-teal-200 border border-ctac-teal-300 rounded-full px-4 py-2 min-h-[40px]"
            >
              {helpOpenId === item.id ? 'Hide help' : 'I need help creating a new thought'}
            </button>
            {helpOpenId === item.id && (
              <div className="mt-2 bg-white border border-slate-200 rounded-2xl p-4">
                <p className="text-[13px] text-slate-600 mb-2">
                  Here are some other ways to think about it. Tap one to use it
                  as a starting point, then make it your own.
                </p>
                <ul className="space-y-2">
                  {helpSuggestions.map((s, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => {
                          const field = r.strategy === 'both_and' ? 'and_statement' : 'response'
                          setField(item.id, field, s)
                          setHelpOpenId(null)
                        }}
                        className="w-full text-left text-[14px] leading-relaxed text-slate-800 bg-ctac-teal-50 hover:bg-ctac-teal-100 border border-ctac-teal-200 rounded-2xl px-3 py-2"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
                // Insert a brief affirmation beat before the next thought
                // (v5.3, Ginny's encouragement ask). Continue on that
                // screen advances thoughtIdx and returns to 'strategy'.
                setCycleHeading(
                  CYCLE_AFFIRMATIONS[
                    Math.floor(Math.random() * CYCLE_AFFIRMATIONS.length)
                  ],
                )
                setPhase('cycle_affirmation')
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

  // ---- Phase: cycle_affirmation (between consecutive picked thoughts) ----
  if (phase === 'cycle_affirmation') {
    return (
      <div className="text-center py-8">
        <h2 className="text-[24px] font-semibold mb-2">{cycleHeading}</h2>
        <p className="text-[16px] text-slate-700 mb-8">Let&apos;s try the next one.</p>
        <div className="flex items-center justify-end">
          <PrimaryButton
            onClick={() => {
              setThoughtIdx((i) => i + 1)
              setPhase('strategy')
              scrollTop()
            }}
          >
            Continue →
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
              <div className="text-[13px] text-ctac-teal-800 font-medium mb-1">
                {r.strategy === 'challenge' ? 'Challenge it' : 'Both/And it'}
              </div>
              {r.strategy === 'challenge' && (
                <div className="text-[15px] text-slate-800 italic">
                  {r.response}
                </div>
              )}
              {r.strategy === 'both_and' && (
                <div className="text-[15px] text-slate-800 italic">
                  {it.both_and_root || it.text} <span className="font-semibold not-italic">AND</span> {r.and_statement}
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
