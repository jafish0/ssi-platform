import { useMemo, useState } from 'react'
import { PrimaryButton, GhostButton } from '../components/items/shared.jsx'
import { APPRAISAL_ITEMS, APPRAISAL_SCALE } from '../lib/appraisals.js'
import KaiNarrationPlayer from '../components/KaiNarrationPlayer.jsx'

// Getting Unstuck — Ready for Roots' stuck-thought / strategy / reflection activity.
//
// v5.9 (2026-08-11, Draft 62 Part A): the old "affirmation" dead-end (kid
// rated nothing ≥2, saw a static two-strategies explainer, saved without
// practicing) is replaced — the kid now practices Challenge/Both-And on 2
// randomly-selected thoughts from the locked pool (`zero_endorsement_intro`
// phase, `randomly_selected: true` on those two payload entries). Also
// (Part B/C): a Kai audio-narration gate (`kai_strategy_intro`,
// KaiNarrationPlayer) now sits before EVERY first strategy screen —
// normal endorsed-pick path or the fallback — replacing the old
// affirmation screen's "Video Coming Soon" placeholder.
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

// Kai narration transcript for the Challenge/Both-And intro (Draft 62
// Part B, 2026-08-11 meeting) — verbatim from Stephanie's "Kai Audio
// Script for Activities.docx". Shown below the audio player so kids who
// can't hear well still get the content. Replaces the old "Video Coming
// Soon" placeholder that used to live in the (now-removed) zero-eligible
// affirmation screen.
const KAI_STRATEGY_TRANSCRIPT = (
  <>
    <p className="mb-3">
      There are two helpful ways to get unstuck from these thoughts.
    </p>
    <p className="mb-2">
      First, is to <strong>challenge</strong> them by asking yourself:
    </p>
    <ul className="list-disc pl-5 space-y-1 mb-3">
      <li>Is there another way I can think about this?</li>
      <li>Is this really true or can I think of a way it is not true?</li>
      <li>
        Is this thought helping me, and if not what is a thought that
        might be more helpful?
      </li>
    </ul>
    <p className="mb-3">
      Another way to get unstuck is to acknowledge that the thought might
      have a small piece of truth, but it leaves out other truths.
    </p>
    <p className="mb-2">
      For this, it is important to recognize that two things that seem
      different can be true at the same time. Starting with your stuck
      thought then saying AND… what else is also true. For example:
    </p>
    <ul className="list-disc pl-5 space-y-1">
      <li>My foster family isn&apos;t my real family AND there can still be a place for them in my life</li>
      <li>I feel like no one understands me AND there are ways I can help people get to know me more</li>
      <li>A lot of people have given up on me in the past AND it doesn&apos;t mean everyone will</li>
    </ul>
  </>
)

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
  //   zero_endorsement_intro → v5.9 (Draft 62 Part A): shown instead of
  //                 pick when nothing cleared the eligibility threshold —
  //                 tells the kid they'll still practice with 2 thoughts
  //                 the system picks at random from the locked pool
  //   kai_strategy_intro → v5.9 (Draft 62 Part B): Kai audio narration
  //                 gate before the first strategy screen, entered from
  //                 either 'pick' or 'zero_endorsement_intro'
  //   strategy    → per-picked: Challenge or Both/And + open text
  //   cycle_affirmation → brief "nice work, let's try the next one" beat
  //                 shown between consecutive picked thoughts (v5.3)
  //   review      → read-back before save
  const [phase, setPhase] = useState('rate')

  // Heading for the between-thoughts affirmation beat (randomized when we
  // enter the cycle_affirmation phase).
  const [cycleHeading, setCycleHeading] = useState(CYCLE_AFFIRMATIONS[0])

  // Kai narration gating (Draft 62 Part B) — Continue on kai_strategy_intro
  // is disabled until the narration has played once. Sticky: a later
  // replay (or revisiting the screen) doesn't re-lock it.
  const [strategyIntroNarrationDone, setStrategyIntroNarrationDone] = useState(false)

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

  // Selected (chosen to work on), in eligible-list order — plus, as of
  // v5.9 (Draft 62 Part A), any items the 0-endorsement fallback
  // auto-selected. Those carry `selected: true` but aren't in
  // `eligibleItems` (nothing cleared threshold in that branch), so a
  // second pass over the full locked list picks them up without
  // disturbing the normal endorsed-pick path (there, every `selected`
  // item is already inside `eligibleItems`, so this pass adds nothing).
  const selectedItems = useMemo(() => {
    const seen = new Set()
    const out = []
    for (const it of eligibleItems) {
      if (items[it.id]?.selected && !seen.has(it.id)) {
        seen.add(it.id)
        out.push(it)
      }
    }
    for (const it of APPRAISAL_ITEMS) {
      if (items[it.id]?.selected && !seen.has(it.id)) {
        seen.add(it.id)
        out.push(it)
      }
    }
    return out
  }, [eligibleItems, items])

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
        // v5.9 (Draft 62 Part A) — flags the two thoughts the
        // 0-endorsement fallback auto-picked, so export can tell
        // "endorsed" apart from "randomly given" for analysis.
        if (r.randomly_selected) entry.randomly_selected = true
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
      // threshold → the v5.9 0-endorsement fallback; otherwise → pick.
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
      if (hasEligible) {
        setPhase('pick')
      } else {
        // v5.9 (Draft 62 Part A, Holly's 2026-08-11 feedback): nothing
        // cleared threshold, but the kid still practices Challenge/Both-
        // And once — auto-select 2 random thoughts from the locked pool
        // (a_other deliberately excluded: forcing practice on a custom
        // thought the kid just typed and dismissed doesn't fit "in case a
        // new thought pops up in the future"). Random per participant;
        // stored in `items` state so it stays fixed if they navigate back.
        const pool = APPRAISAL_ITEMS.map((it) => it.id)
        const chosen = []
        while (chosen.length < Math.min(MAX_PICKS, pool.length)) {
          const i = Math.floor(Math.random() * pool.length)
          chosen.push(pool.splice(i, 1)[0])
        }
        setItems((prev) => {
          const next = { ...prev }
          for (const id of chosen) {
            next[id] = { ...(next[id] || {}), selected: true, randomly_selected: true }
          }
          return next
        })
        setPhase('zero_endorsement_intro')
      }
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
            Let's practice →
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
              setPhase('kai_strategy_intro')
              scrollTop()
            }}
            // Real bug (Josh, staged-preview review): the copy says "pick
            // the top two," but this only ever required at least one,
            // letting a participant continue after selecting just 1.
            // Requires exactly MAX_PICKS (2) — or the most that's actually
            // achievable if fewer than 2 thoughts cleared the eligibility
            // threshold, so this can't lock out a legitimately
            // 1-eligible-item case.
            disabled={selectedCount < Math.min(MAX_PICKS, eligibleItems.length)}
          >
            Keep going →
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // ---- Phase: zero_endorsement_intro ----
  // v5.9 (Draft 62 Part A) — replaces the old "affirmation" dead-end
  // (which just explained the two strategies and let the kid Save without
  // practicing). Now they practice with 2 randomly-selected thoughts,
  // same as if they'd endorsed 2 themselves — handleOtherContinue already
  // picked + flagged them before landing here.
  if (phase === 'zero_endorsement_intro') {
    return (
      <div className="py-4 text-center">
        <h2 className="text-[22px] font-semibold mb-3">That&apos;s great!</h2>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-8 max-w-[480px] mx-auto">
          Try out the following exercise in case a new thought pops up that
          you need to deal with in the future.
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
          <PrimaryButton
            onClick={() => {
              setPhase('kai_strategy_intro')
              scrollTop()
            }}
          >
            Keep going →
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // ---- Phase: kai_strategy_intro ----
  // v5.9 (Draft 62 Part B/C) — Kai audio narration gate shown once before
  // the first strategy screen, entered from either 'pick' (normal
  // endorsed path) or 'zero_endorsement_intro' (fallback path). Replaces
  // the old affirmation-only "Video Coming Soon" explainer above.
  if (phase === 'kai_strategy_intro') {
    const cameFromFallback = eligibleItems.length === 0
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-4">
          Two ways to get unstuck.
        </h2>
        <KaiNarrationPlayer
          audioSrc="/kai-narration/getting-unstuck-strategies-intro.mp3"
          transcript={KAI_STRATEGY_TRANSCRIPT}
          onComplete={() => setStrategyIntroNarrationDone(true)}
        />
        <div className="flex items-center justify-between">
          <GhostButton
            onClick={() => {
              setPhase(cameFromFallback ? 'zero_endorsement_intro' : 'pick')
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
            disabled={!strategyIntroNarrationDone}
          >
            Keep going →
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
                // v5.9 — the strategy screens are now always entered via
                // the kai_strategy_intro gate, from either path.
                setPhase('kai_strategy_intro')
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
