import { useMemo, useState } from 'react'
import { PrimaryButton, GhostButton } from '../components/items/shared.jsx'

// Getting Unstuck — RSD's stuck-thought / strategy / reflection activity.
//
// 2026-05-11 rebuild:
// - Replaced the standalone Kai-quote intro (Ginny flagged as confusing)
//   with a 5-point appraisal scale on the stuck-thoughts screen itself.
//   Each thought gets a frequency rating ("How often do you have this
//   thought?") and a believability rating ("How strongly do you believe
//   it is true?"). Thoughts rated ≥3 on either scale are eligible to
//   work on; the kid explicitly picks which eligible ones to take into
//   the strategy step.
// - Restored the three challenge-strategy prompts as scaffolding above
//   a single open-ended response field (Stephanie's PPT slide 12).
// - Renamed "Fight it" → "Challenge it" throughout, including the
//   saved-data strategy key (`fight` → `challenge`,
//   `fight_response` → `challenge_response`). Both/And is unchanged.

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

// Thoughts at or above this on either scale are eligible to take into
// the strategy step. Tunable here in one place.
const ELIGIBILITY_THRESHOLD = 3

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

export default function GettingUnstuck({ onSave = console.log, initialStep = 1 }) {
  const [step, setStep] = useState(initialStep)

  // Per-thought appraisal + selection. Shape: { [id]: { frequency, believability, selected } }
  const [appraisal, setAppraisal] = useState({})

  // Per-thought strategy response. Shape: { [id]: { strategy, challenge_response, and_statement } }
  const [responses, setResponses] = useState({})

  const [thoughtIdx, setThoughtIdx] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [savedDone, setSavedDone] = useState(false)

  // Thoughts the kid chose to work on, preserving STUCK_THOUGHTS order.
  const selectedThoughts = useMemo(
    () => STUCK_THOUGHTS.filter((t) => appraisal[t.id]?.selected),
    [appraisal],
  )

  function setRating(thoughtId, field, value) {
    setAppraisal((prev) => {
      const cur = prev[thoughtId] || {}
      const next = { ...cur, [field]: value }
      // If raising a rating to threshold or above, leave selection alone.
      // If dropping both scales below threshold, also drop selection so
      // the eligibility rule stays consistent.
      const eligible =
        (next.frequency || 0) >= ELIGIBILITY_THRESHOLD ||
        (next.believability || 0) >= ELIGIBILITY_THRESHOLD
      if (!eligible && next.selected) next.selected = false
      return { ...prev, [thoughtId]: next }
    })
  }

  function toggleSelected(thoughtId) {
    setAppraisal((prev) => {
      const cur = prev[thoughtId] || {}
      const eligible =
        (cur.frequency || 0) >= ELIGIBILITY_THRESHOLD ||
        (cur.believability || 0) >= ELIGIBILITY_THRESHOLD
      if (!eligible) return prev // ignore taps on ineligible cards
      return { ...prev, [thoughtId]: { ...cur, selected: !cur.selected } }
    })
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
        // Full appraisal record across all 8 thoughts, not just the
        // chosen ones — useful for the data export later.
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

  // ---- Step 1: Appraise + select stuck thoughts ----
  if (step === 1) {
    const anySelected = selectedThoughts.length > 0
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-1">Stuck thoughts</h2>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-5">
          These are thoughts that can keep someone feeling stuck. For each one,
          rate how it feels for you. Then pick which ones you want to work on.
        </p>

        <div className="space-y-4 mb-6">
          {STUCK_THOUGHTS.map((t) => {
            const a = appraisal[t.id] || {}
            const eligible =
              (a.frequency || 0) >= ELIGIBILITY_THRESHOLD ||
              (a.believability || 0) >= ELIGIBILITY_THRESHOLD
            const selected = !!a.selected
            return (
              <div
                key={t.id}
                className={
                  'rounded-2xl border p-4 transition-colors ' +
                  (selected
                    ? 'bg-amber-50 border-amber-400'
                    : 'bg-white border-slate-200')
                }
              >
                <div className="text-[15px] leading-relaxed text-slate-800 mb-4">
                  {t.text}
                </div>

                <div className="space-y-4 mb-4">
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

                <button
                  type="button"
                  onClick={() => toggleSelected(t.id)}
                  disabled={!eligible}
                  className={
                    'w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 min-h-[40px] text-[14px] font-semibold transition-colors ' +
                    (selected
                      ? 'bg-amber-500 text-white border border-amber-500'
                      : eligible
                        ? 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-50'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed')
                  }
                >
                  {selected
                    ? '✓ Working on this'
                    : eligible
                      ? 'I want to work on this'
                      : 'Rate it first to choose this one'}
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex justify-end">
          <PrimaryButton
            onClick={() => {
              setStep(2)
              setThoughtIdx(0)
            }}
            disabled={!anySelected}
          >
            Keep going →
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // ---- Step 2: Strategy per thought ----
  if (step === 2) {
    const thought = selectedThoughts[thoughtIdx]
    if (!thought) {
      // safety: nothing selected; bounce back
      setStep(1)
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
              if (thoughtIdx > 0) setThoughtIdx((i) => i - 1)
              else setStep(1)
            }}
          >
            ← Back
          </GhostButton>
          <PrimaryButton
            onClick={() => {
              if (!valid) return
              if (isLastThought) setStep(3)
              else setThoughtIdx((i) => i + 1)
            }}
            disabled={!valid}
          >
            {isLastThought ? 'Review →' : 'Next thought →'}
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // ---- Step 3: Review ----
  if (savedDone) {
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-3">Saved</h2>
        <p className="text-[16px] text-slate-700">That&apos;s real work. Let&apos;s keep going.</p>
      </div>
    )
  }

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
        <GhostButton onClick={() => setStep(2)}>← Back</GhostButton>
        <PrimaryButton onClick={handleSave} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </div>
    </div>
  )
}
