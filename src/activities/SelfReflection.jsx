import { useState } from 'react'
import {
  PrimaryButton,
  GhostButton,
  MissingItemsNote,
  scrollToMissingItem,
} from '../components/items/shared.jsx'

const SCREENS = {
  inclusion_memory: {
    heading: 'A time you felt included',
    prompt:
      'Think of a time you felt included — a time you really felt like you belonged. Write a few sentences about that experience.',
    field: 'memory',
    section: 'inclusion',
    placeholder: 'Where you were, who was there, what made it feel that way…',
  },
  inclusion_thoughts_feelings: {
    heading: 'Thoughts & feelings — included',
    prompt: 'What thoughts and feelings were associated with that experience?',
    section: 'inclusion',
    twoCol: true,
  },
  exclusion_memory: {
    heading: 'A time you felt excluded',
    prompt:
      'Now think of a time you felt excluded — a time you felt like you did not belong. Write a few sentences about that experience.',
    field: 'memory',
    section: 'exclusion',
    placeholder: 'Where you were, who was there, what made it feel that way…',
  },
  exclusion_thoughts_feelings: {
    heading: 'Thoughts & feelings — excluded',
    prompt: 'What thoughts and feelings were associated with that experience?',
    section: 'exclusion',
    twoCol: true,
  },
}

const ORDER = [
  'inclusion_memory',
  'inclusion_thoughts_feelings',
  'exclusion_memory',
  'exclusion_thoughts_feelings',
]

// Example thought/feeling text shown as textarea placeholders on the
// two-column thoughts/feelings screens (Ginny's 2026-06-08 ask — the
// fields read as ambiguous without an example). Per support section.
const TF_EXAMPLES = {
  inclusion: { thoughts: 'e.g., People like me', feelings: 'e.g., Happy' },
  exclusion: { thoughts: 'e.g., Nobody likes me', feelings: 'e.g., I felt sad' },
}

export default function SelfReflection({ onSave = console.log, initialStep = 1 }) {
  const [stepIdx, setStepIdx] = useState(Math.max(0, Math.min(3, initialStep - 1)))
  const [data, setData] = useState({
    inclusion: { memory: '', thoughts: '', feelings: '' },
    exclusion: { memory: '', thoughts: '', feelings: '' },
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  // Draft 100: Next/Save stays tappable when incomplete; tapping it while
  // incomplete surfaces what's missing instead of doing nothing (a
  // disabled native <button> doesn't fire hover in most browsers, and
  // this is phone-first anyway, so hover was never viable).
  const [showMissing, setShowMissing] = useState(false)

  const screenKey = ORDER[stepIdx]
  const screen = SCREENS[screenKey]
  const isLast = stepIdx === ORDER.length - 1

  function update(section, field, value) {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  // Returns { id, label } for whichever field(s) on the CURRENT screen are
  // still empty. The twoCol screens (thoughts/feelings) have two
  // independently-required fields; the memory screens have just one.
  function computeMissing() {
    const missing = []
    if (screen.twoCol) {
      const t = data[screen.section].thoughts.trim()
      const f = data[screen.section].feelings.trim()
      if (t.length === 0) missing.push({ id: 'thoughts', label: 'Thoughts' })
      if (f.length === 0) missing.push({ id: 'feelings', label: 'Feelings' })
    } else if (data[screen.section][screen.field].trim().length === 0) {
      missing.push({ id: screen.field, label: 'your response' })
    }
    return missing
  }

  const missingFields = computeMissing()
  const canAdvance = missingFields.length === 0
  const missingMessage =
    missingFields.length === 0
      ? null
      : missingFields.length === 1
        ? screen.twoCol
          ? `Please fill in "${missingFields[0].label}" before continuing.`
          : 'Please write a response before continuing.'
        : `Please answer the highlighted question before continuing (${missingFields.length} left).`

  async function handleNext() {
    if (submitting) return
    if (!canAdvance) {
      setShowMissing(true)
      scrollToMissingItem(`item-${missingFields[0].id}`)
      return
    }
    setShowMissing(false)
    if (!isLast) {
      setStepIdx((i) => i + 1)
      return
    }
    setSubmitting(true)
    try {
      await onSave({
        activity: 'self_reflection',
        inclusion: data.inclusion,
        exclusion: data.exclusion,
        saved_at: new Date().toISOString(),
      })
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  function handleBack() {
    setShowMissing(false)
    if (stepIdx > 0) setStepIdx((i) => i - 1)
  }

  if (done) {
    // Closing reworked v1.5 (Adrienne + Holly, 2026-06-29) — bare
    // "Thanks for sharing" read abrupt / slightly sarcastic; the context
    // line explains why we asked. The "!" is intentional warmth.
    // v1.6 (Draft 55, 2026-07-27 meeting): the insight line is the takeaway,
    // so it's promoted to the visual anchor of the screen (bigger + bold);
    // "Thanks for sharing!" is softened to a warm follow-on. No new content.
    return (
      <div>
        <h2 className="text-[22px] font-semibold text-ctac-navy leading-snug mb-2">
          Our experiences can drive our thoughts and feelings about belonging.
        </h2>
        <p className="text-[16px] leading-relaxed text-slate-600">Thanks for sharing!</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-center gap-2 mb-5" aria-hidden="true">
        {ORDER.map((_, i) => (
          <span
            key={i}
            className={
              'rounded-full ' +
              (i === stepIdx
                ? 'w-2 h-2 bg-ctac-teal-400'
                : i < stepIdx
                  ? 'w-2 h-2 bg-ctac-teal-200'
                  : 'w-1.5 h-1.5 bg-slate-200')
            }
          />
        ))}
      </div>

      <h2 className="text-[22px] font-semibold mb-2">{screen.heading}</h2>
      <p className="text-[16px] leading-relaxed text-slate-700 mb-5">
        {screen.prompt}
      </p>

      {screen.twoCol ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div id="item-thoughts">
            <label className="block text-[14px] font-medium text-slate-700 mb-1">
              Thoughts
            </label>
            {/* Example as persistent help text (not a placeholder) so it
                stays visible while the kid types — Holly's 2026-06-18 ask. */}
            <p className="text-[13px] italic text-slate-500 mb-2">
              {TF_EXAMPLES[screen.section].thoughts}
            </p>
            <textarea
              rows={5}
              value={data[screen.section].thoughts}
              onChange={(e) => update(screen.section, 'thoughts', e.target.value)}
              placeholder="Type your response here…"
              className="w-full text-[16px] leading-relaxed px-4 py-3 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
            />
          </div>
          <div id="item-feelings">
            <label className="block text-[14px] font-medium text-slate-700 mb-1">
              Feelings
            </label>
            <p className="text-[13px] italic text-slate-500 mb-2">
              {TF_EXAMPLES[screen.section].feelings}
            </p>
            <textarea
              rows={5}
              value={data[screen.section].feelings}
              onChange={(e) => update(screen.section, 'feelings', e.target.value)}
              placeholder="Type your response here…"
              className="w-full text-[16px] leading-relaxed px-4 py-3 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
            />
          </div>
        </div>
      ) : (
        <div id="item-memory">
          <textarea
            rows={5}
            value={data[screen.section][screen.field]}
            onChange={(e) => update(screen.section, screen.field, e.target.value)}
            placeholder={screen.placeholder}
            className="w-full text-[16px] leading-relaxed px-4 py-3 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        {stepIdx > 0 ? (
          <GhostButton onClick={handleBack}>← Back</GhostButton>
        ) : (
          <span />
        )}
        <PrimaryButton onClick={handleNext} disabled={submitting}>
          {submitting ? 'Saving…' : isLast ? 'Save' : 'Next →'}
        </PrimaryButton>
      </div>
      <MissingItemsNote message={showMissing ? missingMessage : null} />
    </div>
  )
}
