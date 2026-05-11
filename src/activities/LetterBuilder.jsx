import { useState } from 'react'
import { PrimaryButton } from '../components/items/shared.jsx'

// "Letter to Another Youth" — single-screen free-write activity.
//
// Rebuilt 2026-05-11 from a 6-section structured letter to a single
// textarea per Stephanie's 2026-05-11 feedback ("the letter has too many
// steps and would be confusing for a kid… meaningless when the kid was
// just borrowing other people's words"). Removed: click-to-add prompt
// chips, cross-activity pull-forward (Getting Unstuck, Allies/Safety
// Net), the keepsake-view step. The letter is freestanding now — comes
// entirely from the kid.
//
// Save payload is now { activity, letter, saved_at } — breaking change to
// the schema from the previous structured-per-section format. Acceptable
// because the platform is demo-only.

const PROMPT =
  'Write a letter to another teen who is starting where you are now. What do you want them to know?'

// Short generic example shown OUTSIDE the textarea (greyed/italic) so the
// kid sees the kind of letter that's welcome without having a model to
// copy. One sentence, deliberately mundane and in-voice.
const EXAMPLE =
  '"Hey — I know you don\'t know me, but I wanted to tell you what helped me when nothing felt steady…"'

export default function LetterBuilder({ onSave = console.log }) {
  const [letter, setLetter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const trimmed = letter.trim()
  const canSave = trimmed.length > 0

  async function handleSave() {
    if (!canSave) return
    setSubmitting(true)
    try {
      await onSave({
        activity: 'letter_builder',
        letter: trimmed,
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

  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2">A letter to another teen</h2>
      <p className="text-[16px] leading-relaxed text-slate-700 mb-2">{PROMPT}</p>
      <p className="text-[13px] text-slate-500 italic mb-5">
        Example: {EXAMPLE}
      </p>

      <textarea
        rows={12}
        value={letter}
        onChange={(e) => setLetter(e.target.value)}
        placeholder="Write as much or as little as you want. It can sound however you want."
        maxLength={5000}
        className="w-full text-[16px] leading-relaxed px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
      />
      <div className="text-[12px] text-slate-400 mt-1 text-right">
        {letter.length} / 5000
      </div>

      <div className="flex justify-end mt-6">
        <PrimaryButton onClick={handleSave} disabled={!canSave || submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </div>
    </div>
  )
}
