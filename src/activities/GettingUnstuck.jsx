import { useMemo, useState } from 'react'
import { PrimaryButton, GhostButton, SecondaryButton } from '../components/items/shared.jsx'

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

const BOTH_AND_EXAMPLES = [
  '"My foster family isn\'t my real family AND there can still be a place for them in my life"',
  '"I feel like no one understands me AND there are ways I can help people get to know me more"',
  '"A lot of people have given up on me in the past AND it doesn\'t mean everyone will"',
]

export default function GettingUnstuck({ onSave = console.log, initialStep = 1 }) {
  const [step, setStep] = useState(initialStep)
  const [selectedIds, setSelectedIds] = useState([])
  const [thoughtIdx, setThoughtIdx] = useState(0)
  // responses keyed by thought id
  const [responses, setResponses] = useState({}) // { [thought_id]: { strategy, fight_response, and_statement } }
  const [submitting, setSubmitting] = useState(false)
  const [savedDone, setSavedDone] = useState(false)

  const selectedThoughts = useMemo(
    () => STUCK_THOUGHTS.filter((t) => selectedIds.includes(t.id)),
    [selectedIds],
  )

  function toggle(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
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
    if (r.strategy === 'fight') return (r.fight_response || '').trim().length > 0
    if (r.strategy === 'both_and') return (r.and_statement || '').trim().length > 0
    return false
  }

  async function handleSave() {
    setSubmitting(true)
    try {
      const payload = {
        activity: 'getting_unstuck',
        stuck_thought_ids: selectedIds,
        responses: selectedThoughts.map((t) => {
          const r = responses[t.id] || {}
          const out = {
            thought_id: t.id,
            thought_text: t.text,
            strategy: r.strategy,
          }
          if (r.strategy === 'fight') out.fight_response = r.fight_response
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

  // ---- Step 1: Select stuck thoughts ----
  if (step === 1) {
    return (
      <div>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-3">
          Like Kai said, it&apos;s usual to sometimes feel &quot;stuck&quot; and like
          it&apos;s impossible to feel like we belong. And usually when we feel
          this way, there are certain thoughts that are keeping us &quot;stuck.&quot;
        </p>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-5">
          Tap any thoughts that feel true for you. There&apos;s no right number.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {STUCK_THOUGHTS.map((t) => {
            const sel = selectedIds.includes(t.id)
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                aria-pressed={sel}
                className={
                  'text-left rounded-2xl border min-h-[80px] px-5 py-4 text-[15px] leading-relaxed transition-colors ' +
                  (sel
                    ? 'bg-amber-200 border-amber-400 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300')
                }
              >
                {t.text}
              </button>
            )
          })}
        </div>

        <div className="flex justify-end">
          <PrimaryButton
            onClick={() => {
              setStep(2)
              setThoughtIdx(0)
            }}
            disabled={selectedIds.length === 0}
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
            onClick={() => setStrategy(thought.id, 'fight')}
            className={
              'text-left rounded-2xl border p-4 transition-colors ' +
              (r.strategy === 'fight'
                ? 'bg-amber-200 border-amber-400'
                : 'bg-white border-slate-200 hover:border-amber-300')
            }
          >
            <div className="font-semibold text-[16px] mb-1">Fight it</div>
            <div className="text-[13px] text-slate-600">
              Is there another way I can think about this? Is this really true?
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

        {r.strategy === 'fight' && (
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-slate-700 mb-2">
              Another way to think about this:
            </label>
            <textarea
              rows={4}
              value={r.fight_response || ''}
              onChange={(e) => setField(thought.id, 'fight_response', e.target.value)}
              placeholder="What could be more true?"
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
                {r.strategy === 'fight' ? 'Fight it' : 'Both/And it'}
              </div>
              {r.strategy === 'fight' && (
                <div className="text-[15px] text-slate-800 italic">
                  {r.fight_response}
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
