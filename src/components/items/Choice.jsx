import { useMemo, useState } from 'react'
import { CheckCircle2, RefreshCw } from 'lucide-react'
import { PrimaryButton } from './shared.jsx'
import NarrationControls from './NarrationControls.jsx'

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Choice({ content, onSave, existingResponse }) {
  const isMultiple = content?.selection_type === 'multiple'
  const style = content?.display_style || 'card_grid'
  const quiz = content?.quiz // { correct_id, correct_message?, incorrect_message?, allow_retry? }

  const options = useMemo(() => {
    let opts = content?.options || []
    if (content?.show_none_option) {
      opts = [...opts, { id: '__none__', text: 'None of these' }]
    }
    if (content?.randomize_order) opts = shuffle(opts)
    return opts
  }, [content])

  const [selected, setSelected] = useState(() => {
    if (isMultiple) return existingResponse?.selected || []
    return existingResponse?.selected || null
  })
  const [submitting, setSubmitting] = useState(false)
  // Quiz state: feedback visible after a wrong/right tap
  const [feedback, setFeedback] = useState(null) // 'correct' | 'incorrect' | null
  const [attempts, setAttempts] = useState([])

  function isSelected(id) {
    if (isMultiple) return Array.isArray(selected) && selected.includes(id)
    return selected === id
  }

  async function commit(payload) {
    setSubmitting(true)
    try {
      await onSave(payload)
    } finally {
      setSubmitting(false)
    }
  }

  function handleClick(id) {
    if (submitting) return

    // Quiz flow takes priority for single-select with a quiz block.
    if (!isMultiple && quiz?.correct_id) {
      // Ignore taps while a "correct" feedback is animating away.
      if (feedback === 'correct') return
      const isCorrect = id === quiz.correct_id
      const nextAttempts = [...attempts, id]
      setAttempts(nextAttempts)
      setSelected(id)

      if (isCorrect) {
        setFeedback('correct')
        // Brief celebration, then commit + advance.
        setTimeout(() => {
          commit({
            selected: id,
            attempts: nextAttempts,
            got_correct: true,
          })
        }, 900)
        return
      }

      // Incorrect tap.
      setFeedback('incorrect')
      const allowRetry = quiz.allow_retry !== false
      if (allowRetry) {
        // Let them try again — clear selection after a beat so they can
        // tap a different option, but keep the feedback visible.
        setTimeout(() => setSelected(null), 600)
        return
      }
      // No retry: commit the wrong answer after a moment so the participant
      // sees the feedback before moving on.
      setTimeout(() => {
        commit({
          selected: id,
          attempts: nextAttempts,
          got_correct: false,
        })
      }, 1200)
      return
    }

    // Default (non-quiz) behavior.
    if (!isMultiple) {
      setSelected(id)
      // brief amber flash, then auto-advance via save
      setTimeout(() => commit({ selected: id }), 150)
      return
    }
    setSelected((prev) => {
      const arr = Array.isArray(prev) ? prev : []
      if (arr.includes(id)) return arr.filter((x) => x !== id)
      if (content?.max_selections && arr.length >= content.max_selections) return arr
      return [...arr, id]
    })
  }

  async function handleContinue() {
    if (!isMultiple) return
    if (!Array.isArray(selected) || selected.length === 0) return
    await commit({ selected })
  }

  const containerClass =
    style === 'card_grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
      : style === 'chip_row'
        ? 'flex flex-wrap gap-2'
        : 'flex flex-col gap-2'

  // Style override for incorrect-feedback visualization on the wrong button.
  function quizClassFor(id, baseSelectedCx, baseUnselectedCx) {
    if (!quiz?.correct_id) return null
    if (feedback === 'correct' && id === quiz.correct_id) {
      return 'bg-emerald-100 border-emerald-400 text-emerald-900'
    }
    if (feedback === 'incorrect' && attempts[attempts.length - 1] === id && selected === id) {
      return 'bg-rose-100 border-rose-300 text-rose-700'
    }
    return null
  }

  return (
    <div>
      {content?.prompt && (
        <p className={`text-[16px] leading-relaxed text-slate-800 ${(content?.audio_url || content?.answers_audio_url) ? 'mb-2' : 'mb-5'}`}>
          {content.prompt}
        </p>
      )}
      {(content?.audio_url || content?.answers_audio_url) && (
        <div className="mb-5">
          <NarrationControls questionAudioUrl={content.audio_url} answersAudioUrl={content.answers_audio_url} />
        </div>
      )}

      {feedback === 'correct' && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800">
          <CheckCircle2 size={18} strokeWidth={2} />
          <span className="text-[15px]">
            {quiz?.correct_message || "That's right."}
          </span>
        </div>
      )}
      {feedback === 'incorrect' && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-rose-700">
          <RefreshCw size={18} strokeWidth={2} />
          <span className="text-[15px]">
            {quiz?.incorrect_message || 'Not quite — give it another try.'}
          </span>
        </div>
      )}

      <div className={containerClass}>
        {options.map((opt) => {
          const sel = isSelected(opt.id)
          const quizCx = quizClassFor(opt.id)
          if (style === 'chip_row') {
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleClick(opt.id)}
                className={
                  'rounded-full px-4 py-2 min-h-[44px] text-[14px] transition-colors ' +
                  (quizCx ||
                    (sel
                      ? 'bg-ctac-teal-200 text-ctac-teal-900'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'))
                }
              >
                {opt.text}
              </button>
            )
          }
          if (style === 'list') {
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleClick(opt.id)}
                className={
                  'text-left rounded-2xl border min-h-[52px] px-5 py-3 text-[16px] transition-colors ' +
                  (quizCx ||
                    (sel
                      ? 'bg-ctac-teal-200 border-ctac-teal-400 text-ctac-teal-900'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-ctac-teal-300'))
                }
              >
                {opt.text}
              </button>
            )
          }
          // card_grid — an option may carry an optional `image` (Draft 67
          // Part B, variant thumbnails); options without one render exactly
          // as before. `content.hide_option_labels` (staged-preview review,
          // 2026-08-26 — the Sam's-Story picker) drops the visible text
          // label under an image option, showing just the portrait, larger
          // — the label moves to aria-label instead of disappearing, so a
          // screen reader still announces which option is which.
          const hideLabel = content?.hide_option_labels === true && !!opt.image
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleClick(opt.id)}
              aria-label={hideLabel ? opt.text : undefined}
              className={
                'text-left rounded-2xl border min-h-[80px] px-5 py-4 text-[16px] transition-colors ' +
                (hideLabel ? 'flex flex-col items-center justify-center text-center ' : '') +
                (quizCx ||
                  (sel
                    ? 'bg-ctac-teal-200 border-ctac-teal-400 text-ctac-teal-900'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-ctac-teal-300'))
              }
            >
              {opt.image && (
                <img
                  src={opt.image}
                  alt=""
                  aria-hidden="true"
                  className={
                    hideLabel
                      ? 'w-24 h-24 rounded-full object-cover object-top border border-slate-200'
                      : 'w-16 h-16 rounded-full object-cover object-top border border-slate-200 mb-2'
                  }
                />
              )}
              {!hideLabel && opt.text}
            </button>
          )
        })}
      </div>

      {isMultiple && (
        <div className="flex justify-end mt-6">
          <PrimaryButton
            onClick={handleContinue}
            disabled={!Array.isArray(selected) || selected.length === 0 || submitting}
          >
            {submitting ? 'Saving…' : 'Save'}
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}
