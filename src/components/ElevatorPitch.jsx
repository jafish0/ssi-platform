// Zone 3 "Elevator Pitch" (GAINS Zone 3 activity) — Draft 36.
//
// Holly's end-of-Zone-3 activity: the teen assembles a short message asking
// a guardian for trauma therapy, then earns the Wingsuit to cross the bridge
// (the Mistfields -> Bright Reaches flight). A guided message-builder over a
// full-bleed bridge backdrop, no-fail — the teen can change any pick before
// sending.
//
// Flow: intro (Spark) -> greeting (free text) -> situation (pick 1 of 4) ->
// request (pick 1 of 3) -> help (pick 1 of 5) -> review (assembled message) ->
// done (Wingsuit earned, message saved to the shared action-plan collector).
//
// Prompts and every option's wording are Holly's, kept exactly as written.
// The three select-one option sets are punctuated inconsistently in her
// draft (some end with a period, most don't) -- shown here exactly as given
// while selecting, since the instruction is to keep the option text exact.
// Assembly adds terminal punctuation only where a line doesn't already have
// it, so the combined message reads as one natural paragraph (matching
// Holly's own worked example, which does the same).

import { useState } from 'react'
import { addActionPlanItem } from '../lib/gainsActionPlan.js'

const ART = '/long-light/art/zone3'

const SPARK_INTRO =
  'Sometimes things feel like a dead end. For some teens, getting their parents or caregivers on board with trauma therapy feels like a bridge that can’t be crossed. But with a little preparation and courage, you can overcome any obstacle. Take this time to plan out a message for your guardians.'

const SITUATION_OPTIONS = [
  'I’ve been having a hard time lately.',
  'Something has been bothering me for a while',
  'I don’t feel like myself right now',
  'I’m struggling with what happened',
]

const REQUEST_OPTIONS = [
  'I would like to talk with a trauma therapist.',
  'I want to start trauma therapy.',
  'Can we talk about finding me a trauma therapist?',
]

const HELP_OPTIONS = [
  'I think this will help me feel better',
  'I think this will help me feel like myself again',
  'I think this will help me understand what happened',
  'I think this will help me get along with people better',
  'I think this will help me to be able to reach my goals at school',
]

const STEPS = ['intro', 'greeting', 'situation', 'request', 'help', 'review', 'done']

// Adds terminal punctuation only if the line doesn't already have some --
// preserves Holly's exact wording while giving the assembled message
// consistent sentence endings (matching her own worked example).
function endSentence(s) {
  const t = s.trim()
  return /[.!?]$/.test(t) ? t : t + '.'
}

function endGreeting(s) {
  const t = s.trim()
  return /,$/.test(t) ? t : t + ','
}

function OptionList({ options, selected, onSelect }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          aria-pressed={selected === opt}
          className={
            'w-full text-left px-3.5 py-2.5 rounded-2xl text-[13px] leading-snug border transition-colors ' +
            (selected === opt
              ? 'bg-amber-500 border-amber-500 text-white font-semibold'
              : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300')
          }
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function ElevatorPitch() {
  const [step, setStep] = useState('intro')
  const [greeting, setGreeting] = useState('')
  const [situation, setSituation] = useState(null)
  const [request, setRequest] = useState(null)
  const [help, setHelp] = useState(null)
  const [saved, setSaved] = useState(false)

  const stepIdx = STEPS.indexOf(step)
  const next = () => setStep(STEPS[stepIdx + 1])

  const message =
    greeting.trim() && situation && request && help
      ? `${endGreeting(greeting)} ${endSentence(situation)} ${endSentence(request)} ${endSentence(help)}`
      : ''

  function send() {
    addActionPlanItem({ source: 'zone3-elevator-pitch', text: message })
    setSaved(true)
    next()
  }

  function restart() {
    setStep('intro')
    setGreeting('')
    setSituation(null)
    setRequest(null)
    setHelp(null)
    setSaved(false)
  }

  let promptLabel = null
  let promptText = null
  if (step === 'greeting') {
    promptLabel = 'Step 1'
    promptText = 'Start with a greeting'
  } else if (step === 'situation') {
    promptLabel = 'Step 2'
    promptText = 'Next, describe the situation.'
  } else if (step === 'request') {
    promptLabel = 'Step 3'
    promptText = 'Now make your request.'
  } else if (step === 'help') {
    promptLabel = 'Step 4'
    promptText = 'And finally, finish with how this will help you.'
  }

  return (
    <div className="relative flex flex-col h-full w-full bg-slate-900 overflow-hidden">
      <img
        src={`${ART}/bridge-bg.webp`}
        alt="A rope bridge over the Mistfields, reaching toward a far cliff"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* The art is busiest in the lower-center (the bridge and the drop into
          mist), so the message-builder card sits near the top on its own
          scrim, leaving that part of the scene clear. */}
      <div className="relative px-4 pt-4 pb-5 bg-gradient-to-b from-slate-950/90 via-slate-950/75 to-transparent">
        <div className="text-[10px] font-extrabold tracking-[0.16em] uppercase text-amber-300 mb-1">
          Zone 3 · Message to Your Guardian
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl px-3.5 py-3">
          {step === 'intro' && (
            <p className="text-[13px] text-slate-700 leading-relaxed">{SPARK_INTRO}</p>
          )}

          {promptLabel && (
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600 mb-1">
              {promptLabel} of 4
            </p>
          )}

          {step === 'greeting' && (
            <>
              <p className="text-[13px] font-semibold text-slate-800 mb-2">{promptText}</p>
              <input
                type="text"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder="hey Dad"
                className="w-full text-[14px] px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
              />
            </>
          )}

          {step === 'situation' && (
            <>
              <p className="text-[13px] font-semibold text-slate-800 mb-2">{promptText}</p>
              <OptionList options={SITUATION_OPTIONS} selected={situation} onSelect={setSituation} />
            </>
          )}

          {step === 'request' && (
            <>
              <p className="text-[13px] font-semibold text-slate-800 mb-2">{promptText}</p>
              <OptionList options={REQUEST_OPTIONS} selected={request} onSelect={setRequest} />
            </>
          )}

          {step === 'help' && (
            <>
              <p className="text-[13px] font-semibold text-slate-800 mb-2">{promptText}</p>
              <OptionList options={HELP_OPTIONS} selected={help} onSelect={setHelp} />
            </>
          )}

          {step === 'review' && (
            <>
              <p className="text-[13px] font-semibold text-slate-800 mb-2">Here’s your message:</p>
              <p className="text-[14px] text-slate-800 leading-relaxed italic border-l-2 border-amber-300 pl-3">
                {message}
              </p>
              <p className="text-[12px] text-slate-500 mt-2">
                You can go back and change any part before you send it.
              </p>
            </>
          )}

          {step === 'done' && (
            <>
              <p className="font-extrabold text-amber-700 text-[13px] mb-1">You did it</p>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                That’s a strong message to carry with you. When the moment feels
                right, you’ll know just what to say. Take this with you: a
                Wingsuit. It’ll help you cross the bridge ahead.
              </p>
            </>
          )}
        </div>

        {step === 'review' && (
          <div className="flex gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => setStep('situation')}
              className="flex-1 py-2.5 rounded-full bg-white/90 hover:bg-white text-amber-700 text-[14px] font-extrabold"
            >
              Change something
            </button>
            <button
              type="button"
              onClick={send}
              className="flex-1 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[14px] font-extrabold"
            >
              Send it
            </button>
          </div>
        )}

        {step !== 'review' && step !== 'done' && (
          <button
            type="button"
            onClick={next}
            disabled={
              (step === 'greeting' && !greeting.trim()) ||
              (step === 'situation' && !situation) ||
              (step === 'request' && !request) ||
              (step === 'help' && !help)
            }
            className="w-full mt-2.5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-[15px] font-extrabold"
          >
            Continue
          </button>
        )}

        {step === 'done' && (
          <button
            type="button"
            onClick={restart}
            className="w-full mt-2.5 py-2 text-[13px] font-semibold text-amber-200 hover:text-white underline"
          >
            Start over
          </button>
        )}

        {saved && step === 'done' && (
          <p className="sr-only" role="status">
            Message saved.
          </p>
        )}
      </div>
    </div>
  )
}
