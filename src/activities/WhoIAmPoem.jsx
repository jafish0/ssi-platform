import { useEffect, useState } from 'react'
import { PrimaryButton, GhostButton } from '../components/items/shared.jsx'

const STANZA_1_PROMPTS = [
  { id: 'i_am', starter: 'I am', hint: 'two special things about you', required: true },
  { id: 'i_wonder', starter: 'I wonder', hint: 'something you are actually curious about', required: true },
  { id: 'i_fear', starter: 'I fear', hint: 'something you are afraid of', required: false },
  { id: 'i_suffer_when', starter: 'I suffer when', hint: 'an event that makes you sad or angry', required: false },
  { id: 'i_want', starter: 'I want', hint: 'an actual desire', required: true },
]

const STANZA_2_PROMPTS = [
  { id: 'i_understand', starter: 'I understand', hint: 'something you know', required: true },
  { id: 'i_believe', starter: 'I believe', hint: 'something you believe in', required: false },
  { id: 'i_dream', starter: 'I dream', hint: 'something you actually dream about', required: false },
  { id: 'i_try', starter: 'I try', hint: 'something you really make an effort about', required: true },
  { id: 'i_hope', starter: 'I hope', hint: 'something you actually hope for', required: true },
]

function buildPoemText(s1, s2) {
  const lines = []
  for (const p of STANZA_1_PROMPTS) {
    const v = (s1[p.id] || '').trim()
    if (v) lines.push(`${p.starter} ${v}`)
  }
  if (s1.i_am) lines.push(`I am ${s1.i_am.trim()}`)
  lines.push('')
  for (const p of STANZA_2_PROMPTS) {
    const v = (s2[p.id] || '').trim()
    if (v) lines.push(`${p.starter} ${v}`)
  }
  if (s1.i_am) lines.push(`I am ${s1.i_am.trim()}`)
  return lines.join('\n')
}

export default function WhoIAmPoem({ onSave = console.log, initialStep = 1 }) {
  const [step, setStep] = useState(initialStep)
  const [s1, setS1] = useState({})
  const [s2, setS2] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function update1(id, v) { setS1((prev) => ({ ...prev, [id]: v })) }
  function update2(id, v) { setS2((prev) => ({ ...prev, [id]: v })) }

  function stanzaComplete(prompts, vals) {
    return prompts.every((p) => !p.required || (vals[p.id] || '').trim().length > 0)
  }

  async function handleSave() {
    setSubmitting(true)
    try {
      const fullText = buildPoemText(s1, s2)
      await onSave({
        activity: 'who_i_am_poem',
        stanza_1: { ...s1, i_am_repeat: s1.i_am || '' },
        stanza_2: { ...s2, i_am_repeat: s1.i_am || '' },
        full_poem_text: fullText,
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
        <h2 className="text-[22px] font-semibold mb-3">Saved</h2>
        <p className="text-[16px] text-slate-700">That&apos;s yours.</p>
      </div>
    )
  }

  // Step 1: Stanza 1
  if (step === 1) {
    const ok = stanzaComplete(STANZA_1_PROMPTS, s1)
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-1">Who I Am</h2>
        <p className="text-[14px] text-slate-500 mb-4">First half — just write what comes to mind.</p>

        <div className="space-y-4">
          {STANZA_1_PROMPTS.map((p) => (
            <PromptRow key={p.id} prompt={p} value={s1[p.id] || ''} onChange={(v) => update1(p.id, v)} />
          ))}
          <div>
            <label className="block text-[14px] font-medium text-slate-700 mb-2">
              I am <span className="text-slate-500 italic font-normal">— repeat your first line</span>
            </label>
            <input
              readOnly
              value={s1.i_am || ''}
              placeholder="Fill in the first line above"
              className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-amber-50 border border-amber-100 rounded-2xl text-slate-600"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <PrimaryButton onClick={() => setStep(2)} disabled={!ok}>Next →</PrimaryButton>
        </div>
      </div>
    )
  }

  // Step 2: Stanza 2
  if (step === 2) {
    const ok = stanzaComplete(STANZA_2_PROMPTS, s2)
    return (
      <div>
        <h2 className="text-[22px] font-semibold mb-1">Who I Am</h2>
        <p className="text-[14px] text-slate-500 mb-4">Second half — keep going.</p>

        <div className="space-y-4">
          {STANZA_2_PROMPTS.map((p) => (
            <PromptRow key={p.id} prompt={p} value={s2[p.id] || ''} onChange={(v) => update2(p.id, v)} />
          ))}
          <div>
            <label className="block text-[14px] font-medium text-slate-700 mb-2">
              I am <span className="text-slate-500 italic font-normal">— from your first line</span>
            </label>
            <input
              readOnly
              value={s1.i_am || ''}
              className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-amber-50 border border-amber-100 rounded-2xl text-slate-600"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <GhostButton onClick={() => setStep(1)}>← Back</GhostButton>
          <PrimaryButton onClick={() => setStep(3)} disabled={!ok}>See your poem →</PrimaryButton>
        </div>
      </div>
    )
  }

  // Step 3: Keepsake view
  const poem = buildPoemText(s1, s2)
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2 text-center">Your poem</h2>
      <p className="text-[14px] text-slate-500 text-center mb-5">It&apos;s yours to keep.</p>

      <div className="bg-amber-50 rounded-3xl border-2 border-amber-200 shadow-card p-8 text-center">
        <div className="text-[17px] leading-loose text-slate-800 whitespace-pre-wrap font-serif italic">
          {poem || '—'}
        </div>
      </div>

      <p className="text-[15px] text-center text-slate-700 mt-5 mb-6">
        That&apos;s your poem. It&apos;s yours to keep.
      </p>

      <div className="flex items-center justify-between">
        <GhostButton onClick={() => setStep(2)}>← Back</GhostButton>
        <PrimaryButton onClick={handleSave} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </div>
    </div>
  )
}

function PromptRow({ prompt, value, onChange }) {
  return (
    <div>
      <label className="block text-[14px] font-medium text-slate-700 mb-2">
        {prompt.starter}
        {prompt.required && <span className="text-rose-400 ml-1">*</span>}
        <span className="ml-2 text-slate-500 italic font-normal">— {prompt.hint}</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={80}
        className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
      />
    </div>
  )
}
