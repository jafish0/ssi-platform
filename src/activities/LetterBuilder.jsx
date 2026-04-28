import { useEffect, useMemo, useRef, useState } from 'react'
import { PrimaryButton, GhostButton, WordBankChip } from '../components/items/shared.jsx'

const SECTIONS = [
  {
    id: 's1_why_writing',
    title: "Why I'm writing",
    prompt: 'Start by telling them why you wrote this letter.',
    starter: "I wanted to write to you because ",
    maxChars: 200,
    wordBank: [
      { id: 'wb1_1', text: 'belonging is possible, even when it feels far away' },
      { id: 'wb1_2', text: 'you matter more than you might think right now' },
      { id: 'wb1_3', text: 'things can change, even when they feel stuck' },
      { id: 'wb1_4', text: "you don't have to figure this out alone" },
      { id: 'wb1_5', text: "your story isn't over" },
    ],
  },
  {
    id: 's2_real_talk',
    title: 'The real talk',
    prompt: 'What would you want them to know about how hard belonging can feel?',
    starter: 'I know belonging can feel ',
    maxChars: 200,
    wordBank: [
      { id: 'wb2_1', text: 'life has thrown a lot of changes at you' },
      { id: 'wb2_2', text: "it can feel like everyone else has something figured out that you don't" },
      { id: 'wb2_3', text: 'trusting people takes time, especially when things have changed a lot' },
      { id: 'wb2_4', text: "you're carrying more than most people know" },
      { id: 'wb2_5', text: "the world doesn't always make it easy" },
      { id: 'wb2_6', text: 'it can feel like you have to hide parts of yourself' },
    ],
  },
  {
    id: 's3_both_and',
    title: 'The Both/And',
    prompt: 'Two things can be true at the same time.',
    starter: 'Something I learned: ',
    maxChars: 200,
    pull: 'getting_unstuck',
  },
  {
    id: 's4_people',
    title: 'People in your corner',
    prompt: 'Tell them about finding support.',
    starter: 'When things feel heavy, ',
    maxChars: 200,
    pull: 'allies_safety_net',
  },
  {
    id: 's5_advice',
    title: 'What I want you to do',
    prompt: 'Give them one piece of advice.',
    starter: 'If I could tell you one thing, it would be: ',
    maxChars: 200,
    wordBank: [
      { id: 'wb5_1', text: 'look for one person who makes you feel safe, and let them know you appreciate them' },
      { id: 'wb5_2', text: 'notice one moment this week when you felt like you belonged, even a little' },
      { id: 'wb5_3', text: 'remind yourself that two things can be true at once' },
      { id: 'wb5_4', text: 'reach out to someone in your corner, even with something small' },
      { id: 'wb5_5', text: 'give it time — belonging can grow slowly' },
      { id: 'wb5_6', text: 'remember that you get to decide what belonging means for you' },
    ],
  },
  {
    id: 's6_last_thing',
    title: 'One last thing',
    prompt: 'End with something warm.',
    starter: 'Before I go, I want you to remember: ',
    maxChars: 200,
    wordBank: [
      { id: 'wb6_1', text: 'you are worth knowing' },
      { id: 'wb6_2', text: 'your story matters' },
      { id: 'wb6_3', text: "you belong here, even when it doesn't feel like it" },
      { id: 'wb6_4', text: 'better days are possible' },
      { id: 'wb6_5', text: 'someone out there is rooting for you' },
      { id: 'wb6_6', text: 'you are already doing the hard work' },
    ],
  },
]

const OPENING = 'To a young person who needs to hear this,'
const CLOSING = "You've got this. And now you know — you're not alone.\n— Someone who gets it"

function getPullForward(sectionId, sessionData) {
  if (!sessionData) return null
  if (sectionId === 's3_both_and') {
    const r = sessionData.getting_unstuck?.responses?.[0]
    if (r?.and_statement) {
      return {
        text: `${r.thought_text} AND ${r.and_statement}`,
        label: 'From Getting Unstuck:',
        sourceKey: 'getting_unstuck',
      }
    }
    if (r?.fight_response) {
      return {
        text: r.fight_response,
        label: 'From Getting Unstuck:',
        sourceKey: 'getting_unstuck',
      }
    }
  }
  if (sectionId === 's4_people') {
    const ally = sessionData.allies_safety_net?.allies?.[0]
    if (ally?.name) {
      const supportLabel = ally.support_types?.[0]
      return {
        text: supportLabel
          ? `${ally.name} gives me ${supportLabel} support.`
          : `${ally.name} is in my corner.`,
        label: 'From Allies / Safety Net:',
        sourceKey: 'allies_safety_net',
      }
    }
  }
  return null
}

function buildLetterText({ sectionsValues, includes, sessionData }) {
  const paragraphs = [OPENING, '']
  for (const sec of SECTIONS) {
    const userText = (sectionsValues[sec.id] || '').trim()
    const pull = getPullForward(sec.id, sessionData)
    const includePull = pull && includes[sec.id] !== false
    let para = ''
    if (includePull) para = pull.text
    if (userText) {
      para = para ? `${para} ${userText}` : userText
    }
    if (para) paragraphs.push(para)
  }
  paragraphs.push('')
  paragraphs.push(CLOSING)
  return paragraphs.join('\n\n')
}

export default function LetterBuilder({
  onSave = console.log,
  initialStep = 1,
  sessionData = {},
}) {
  const [step, setStep] = useState(initialStep)
  // step 1..6 → section index, step 7 → keepsake view
  const [values, setValues] = useState(() => {
    const init = {}
    for (const s of SECTIONS) init[s.id] = s.starter || ''
    return init
  })
  const [usedChips, setUsedChips] = useState([])
  const [includes, setIncludes] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const inputRefs = useRef({})

  // Apply pull-forward defaults on mount for sections 3 and 4
  useEffect(() => {
    const next = {}
    for (const s of SECTIONS) {
      const pull = getPullForward(s.id, sessionData)
      if (pull) next[s.id] = true
    }
    setIncludes(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function update(id, v) {
    setValues((prev) => ({ ...prev, [id]: v }))
  }

  function appendChipToSection(sectionId, chip) {
    setUsedChips((prev) => (prev.includes(chip.id) ? prev : [...prev, chip.id]))
    const ta = inputRefs.current[sectionId]
    const cur = values[sectionId] || ''
    if (!ta) {
      const next = cur ? `${cur} ${chip.text}` : chip.text
      update(sectionId, next)
      return
    }
    const start = ta.selectionStart ?? cur.length
    const end = ta.selectionEnd ?? cur.length
    const before = cur.slice(0, start)
    const after = cur.slice(end)
    const insert = (before && !before.endsWith(' ') ? ' ' : '') + chip.text
    const next = before + insert + after
    update(sectionId, next)
    requestAnimationFrame(() => {
      ta.focus()
      const pos = (before + insert).length
      ta.setSelectionRange(pos, pos)
    })
  }

  async function handleSave() {
    setSubmitting(true)
    try {
      const fullLetterText = buildLetterText({
        sectionsValues: values,
        includes,
        sessionData,
      })
      const sectionsOut = {}
      for (const s of SECTIONS) sectionsOut[s.id] = values[s.id] || ''
      const pullForwardUsed = {
        getting_unstuck:
          !!getPullForward('s3_both_and', sessionData) && includes.s3_both_and !== false,
        allies_safety_net:
          !!getPullForward('s4_people', sessionData) && includes.s4_people !== false,
      }
      await onSave({
        activity: 'letter_builder',
        sections: sectionsOut,
        pull_forward_used: pullForwardUsed,
        full_letter_text: fullLetterText,
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
        <p className="text-[16px] text-slate-700">That letter is yours.</p>
      </div>
    )
  }

  // Steps 1–6 → section editing
  if (step >= 1 && step <= 6) {
    const sec = SECTIONS[step - 1]
    const text = values[sec.id] || ''
    const charCount = text.length
    const meetsMin = text.trim().length > 0
    const pull = getPullForward(sec.id, sessionData)
    const include = pull ? includes[sec.id] !== false : false

    return (
      <div>
        <div className="flex justify-center gap-2 mb-4" aria-hidden="true">
          {SECTIONS.map((_, i) => (
            <span
              key={i}
              className={
                'rounded-full ' +
                (i === step - 1
                  ? 'w-2 h-2 bg-amber-400'
                  : i < step - 1
                    ? 'w-2 h-2 bg-amber-200'
                    : 'w-1.5 h-1.5 bg-slate-200')
              }
            />
          ))}
        </div>
        <h2 className="text-[22px] font-semibold mb-1">{sec.title}</h2>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-4">{sec.prompt}</p>

        {pull && (
          <div className="bg-amber-50 border-l-4 border-amber-300 rounded-2xl px-4 py-3 mb-4">
            <div className="text-[13px] font-medium text-amber-800 mb-1">{pull.label}</div>
            <div className="text-[15px] text-slate-800 italic mb-2">{pull.text}</div>
            <label className="inline-flex items-center gap-2 text-[13px] text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={include}
                onChange={(e) =>
                  setIncludes((prev) => ({ ...prev, [sec.id]: e.target.checked }))
                }
                className="w-4 h-4 accent-amber-500"
              />
              Include what you wrote earlier
            </label>
          </div>
        )}

        <textarea
          ref={(el) => (inputRefs.current[sec.id] = el)}
          rows={4}
          value={text}
          onChange={(e) => update(sec.id, e.target.value)}
          maxLength={sec.maxChars}
          className="w-full text-[16px] leading-relaxed px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
        />
        <div className="text-[13px] text-slate-500 mt-2">
          {charCount} / {sec.maxChars}
        </div>

        {sec.wordBank?.length > 0 && (
          <div className="mt-4">
            <div className="text-[14px] font-medium text-slate-600 mb-2">
              Tap to add to your letter:
            </div>
            <div className="flex flex-wrap gap-2">
              {sec.wordBank.map((chip) => (
                <WordBankChip
                  key={chip.id}
                  chip={chip}
                  onTap={(c) => appendChipToSection(sec.id, c)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          {step > 1 ? (
            <GhostButton onClick={() => setStep(step - 1)}>← Back</GhostButton>
          ) : (
            <span />
          )}
          <PrimaryButton onClick={() => setStep(step + 1)} disabled={!meetsMin}>
            {step === 6 ? 'See the letter →' : 'Next →'}
          </PrimaryButton>
        </div>
      </div>
    )
  }

  // Step 7: Keepsake view
  const fullText = buildLetterText({
    sectionsValues: values,
    includes,
    sessionData,
  })

  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2 text-center">Your letter</h2>
      <p className="text-[14px] text-slate-500 text-center mb-5">It&apos;s yours to keep.</p>

      <div className="bg-amber-50 rounded-3xl border-2 border-amber-200 shadow-card p-8">
        <div className="text-[16px] leading-relaxed text-slate-800 whitespace-pre-wrap font-serif">
          {fullText}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <GhostButton onClick={() => setStep(6)}>← Back</GhostButton>
        <PrimaryButton onClick={handleSave} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </div>
    </div>
  )
}
