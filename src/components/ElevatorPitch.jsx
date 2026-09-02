// Zone 3 "Elevator Pitch" (GAINS Zone 3 activity) — Draft 36, revised Drafts 38, 41.
//
// Holly's end-of-Zone-3 activity: the teen assembles a short message asking
// a guardian for trauma therapy, then earns the Wingsuit to cross the bridge
// (the Mistfields -> Bright Reaches flight). A guided message-builder over a
// full-bleed bridge backdrop, no-fail — the teen can change any pick before
// saving.
//
// Draft 38: each select-one step also offers "Write your own", so a preset
// isn't the only option (the greeting was already free text). Picking it
// swaps the option list for a text input; the typed line becomes that step's
// value exactly as a preset would, so assembly doesn't need to know or care
// which kind it is -- SelectStep derives "currently in custom mode" from the
// value itself (non-null but not one of the presets) rather than tracking a
// separate flag, so a value set via "Change something" on the review screen
// still shows the right view without extra wiring.
//
// Flow: intro (Spark) -> greeting (free text) -> situation (pick 1 of 4) ->
// normalize (pick 1 of 4) -> offer (pick 1 of 4) -> request (pick 1 of 3) ->
// help (pick 1 of 5) -> review (assembled message) -> done (Wingsuit earned,
// message saved to the shared action-plan collector).
//
// Prompts and every option's wording are Holly's (situation/request/help) or
// Dr. Sprang's (normalize/offer, added in Draft 41), kept exactly as written.
// The five select-one option sets are punctuated inconsistently in the
// source drafts (some end with a period, most don't) -- shown here exactly
// as given while selecting, since the instruction is to keep the option text
// exact. Assembly adds terminal punctuation only where a line doesn't
// already have it, so the combined message reads as one natural paragraph
// (matching Holly's own worked example, which does the same).
//
// Draft 41 also added two pieces of verbatim safety/reassurance copy from
// Dr. Sprang, rendered exactly as written including her informal em-dash-
// without-a-following-space punctuation ("off- you", "parents- reach") --
// this is clinical wording from a named source, not ours to re-typeset.

import { useState } from 'react'
import { addActionPlanItem } from '../lib/gainsActionPlan.js'
import GainsCrisisLifelineNote from './gains/CrisisLifelineNote.jsx'

const ART = '/long-light/art/zone3'

const SPARK_INTRO =
  'Sometimes things feel like a dead end. For some teens, getting their parents or caregivers on board with trauma therapy feels like a bridge that can’t be crossed. But with a little preparation and courage, you can overcome any obstacle. Take this time to plan out a message for your guardians.'

const SITUATION_OPTIONS = [
  'I’ve been having a hard time lately.',
  'Something has been bothering me for a while',
  'I don’t feel like myself right now',
  'I’m struggling with what happened',
]

const NORMALIZE_OPTIONS = [
  'Therapy isn’t just for when things are in crisis',
  'A lot of kids my age use therapy to feel better',
  'Therapy is a good place to think things through',
  'Therapy can also help me sleep better, make better grades, improve my connection to people',
]

const OFFER_OPTIONS = [
  'I know some people I can ask to find out the best person to go to that is nearby',
  'There is a counselor at school that I could talk to',
  'If you can’t take me, we could check into telehealth options',
  'I am willing to call a few places and check to see if they take our insurance',
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

// Draft 48 (Stephanie + Holly, 2026-08-24): request moved up to right after
// situation -- it should come before normalize/offer, not after them. A new
// `safety` step sits between review (save) and done: the 988 disclaimer gets
// its own screen, shown after the message is saved but before the Wingsuit
// award.
const STEPS = ['intro', 'greeting', 'situation', 'request', 'normalize', 'offer', 'help', 'review', 'safety', 'done']

// Verbatim, Dr. Sprang (Draft 41) -- see the header comment on why the
// punctuation stays exactly as written.
const REASSURANCE =
  'If asking directly feels hard, how about writing this in a note first to take the pressure off- you will get a copy of this message in your action plan to make it easier'

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

// `selected` is the step's actual value: null (nothing chosen), one of
// `options` verbatim, or arbitrary custom text. Whether that's "custom mode"
// is derived from the value rather than tracked separately -- see the
// header comment.
function SelectStep({ options, selected, onChange }) {
  const customMode = selected !== null && !options.includes(selected)

  if (customMode) {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your own"
          autoFocus
          className="w-full text-[14px] px-3 py-2.5 rounded-2xl focus:outline-none"
          style={{ background: 'var(--action-quiet)', border: '1px solid var(--border-warm)', color: 'var(--text-bright)' }}
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[12px] font-semibold underline text-[var(--text-warm)] hover:text-[var(--brand-flame)] transition-colors"
        >
          Choose from the list instead
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          aria-pressed={selected === opt}
          className="w-full text-left px-3.5 py-2.5 rounded-2xl text-[13px] leading-snug border transition-colors"
          style={
            selected === opt
              ? { background: 'var(--action-primary)', borderColor: 'var(--action-primary)', color: 'var(--text-on-warm)', fontWeight: 'var(--weight-bold)' }
              : { background: 'var(--action-quiet)', borderColor: 'var(--border-soft)', color: 'var(--text-body)' }
          }
        >
          {opt}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange('')}
        className="w-full text-left px-3.5 py-2.5 rounded-2xl text-[13px] leading-snug border border-dashed hover:border-[var(--border-warm)] hover:text-[var(--text-warm)] transition-colors"
        style={{ borderColor: 'var(--border-soft)', color: 'var(--text-faint)' }}
      >
        Write your own
      </button>
    </div>
  )
}

export default function ElevatorPitch() {
  const [step, setStep] = useState('intro')
  const [greeting, setGreeting] = useState('')
  const [situation, setSituation] = useState(null)
  const [normalize, setNormalize] = useState(null)
  const [offer, setOffer] = useState(null)
  const [request, setRequest] = useState(null)
  const [help, setHelp] = useState(null)
  const [saved, setSaved] = useState(false)

  const stepIdx = STEPS.indexOf(step)
  const next = () => setStep(STEPS[stepIdx + 1])

  const message =
    greeting.trim() && situation && normalize && offer && request && help
      ? [greeting, situation, request, normalize, offer, help]
          .map((part, i) => (i === 0 ? endGreeting(part) : endSentence(part)))
          .join(' ')
      : ''

  function save() {
    addActionPlanItem({ source: 'zone3-elevator-pitch', text: message })
    setSaved(true)
    next()
  }

  function restart() {
    setStep('intro')
    setGreeting('')
    setSituation(null)
    setNormalize(null)
    setOffer(null)
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
  } else if (step === 'normalize') {
    promptLabel = 'Step 4'
    promptText = 'Normalize it'
  } else if (step === 'offer') {
    promptLabel = 'Step 5'
    promptText = 'Offer to make it easy'
  } else if (step === 'help') {
    promptLabel = 'Step 6'
    promptText = 'And finally, finish with how this will help you.'
  }

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden" style={{ background: 'var(--surface-abyss)', fontFamily: 'var(--font-core)' }}>
      <img
        src={`${ART}/bridge-bg.webp`}
        alt="A rope bridge over the Mistfields, reaching toward a far cliff"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* The art is busiest in the lower-center (the bridge and the drop into
          mist), so the message-builder card sits near the top on its own
          scrim, leaving that part of the scene clear. */}
      <div className="relative px-4 pt-4 pb-5 bg-gradient-to-b from-slate-950/90 via-slate-950/75 to-transparent">
        <div className="text-[10px] font-extrabold tracking-[0.16em] uppercase mb-1" style={{ color: 'var(--text-warm)' }}>
          Zone 3 · Message to Your Guardian
        </div>

        <div
          className="rounded-2xl px-3.5 py-3"
          style={{ background: 'var(--surface-sheet)', backdropFilter: 'var(--blur-sheet)', border: '1px solid var(--border-soft)' }}
        >
          {step === 'intro' && (
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-bright)' }}>{SPARK_INTRO}</p>
          )}

          {promptLabel && (
            <p className="text-[11px] font-bold uppercase mb-1" style={{ letterSpacing: 'var(--tracking-wide)', color: 'var(--text-warm)' }}>
              {promptLabel} of 6
            </p>
          )}

          {step === 'greeting' && (
            <>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-bright)' }}>{promptText}</p>
              <input
                type="text"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder="hey Dad"
                className="w-full text-[14px] px-3 py-2.5 rounded-2xl focus:outline-none"
                style={{ background: 'var(--action-quiet)', border: '1px solid var(--border-warm)', color: 'var(--text-bright)' }}
              />
            </>
          )}

          {step === 'situation' && (
            <>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-bright)' }}>{promptText}</p>
              <SelectStep options={SITUATION_OPTIONS} selected={situation} onChange={setSituation} />
            </>
          )}

          {step === 'request' && (
            <>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-bright)' }}>{promptText}</p>
              <SelectStep options={REQUEST_OPTIONS} selected={request} onChange={setRequest} />
            </>
          )}

          {step === 'normalize' && (
            <>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-bright)' }}>{promptText}</p>
              <SelectStep options={NORMALIZE_OPTIONS} selected={normalize} onChange={setNormalize} />
            </>
          )}

          {step === 'offer' && (
            <>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-bright)' }}>{promptText}</p>
              <SelectStep options={OFFER_OPTIONS} selected={offer} onChange={setOffer} />
            </>
          )}

          {step === 'help' && (
            <>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-bright)' }}>{promptText}</p>
              <SelectStep options={HELP_OPTIONS} selected={help} onChange={setHelp} />
            </>
          )}

          {step === 'review' && (
            <>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-bright)' }}>Here’s your message:</p>
              <p className="text-[14px] leading-relaxed italic pl-3" style={{ color: 'var(--text-bright)', borderLeft: '2px solid var(--border-warm)' }}>
                {message}
              </p>
              <p className="text-[12px] mt-2" style={{ color: 'var(--text-muted)' }}>
                You can go back and change any part before you save it.
              </p>
              <p
                className="text-[12px] mt-2 rounded-2xl px-3 py-2"
                style={{ background: 'rgba(253,230,138,.10)', border: '1px solid var(--border-warm)', color: 'var(--text-body)' }}
              >
                {REASSURANCE}
              </p>
            </>
          )}

          {/* Draft 48 (Holly/admin, 2026-08-24): the 988 disclaimer gets its
              own screen now, shown after the message is saved but before the
              Wingsuit award -- it used to sit alongside the Wingsuit message
              on `done`, below. Draft 59 (Holly, 2026-09-02) added the
              team-approved crisis-lifeline explainer below Sprang's verbatim
              disclaimer so 988 was actually explained; live-demo review the
              same day (Josh) found the two 988 mentions read as duplicated
              on screen, so only the phone-icon explainer stays. Sprang's
              exact wording is preserved in git history if it needs to come
              back. */}
          {step === 'safety' && <GainsCrisisLifelineNote />}

          {/* Draft 59 (Holly + Ginny, 2026-09-02): the old copy's "when the
              moment feels right" implied waiting for a magic moment (Holly),
              and didn't make clear the Wingsuit was earned by the planning
              just done (Ginny -- the same note she made about the Oxygen
              Mask). */}
          {step === 'done' && (
            <>
              <p className="font-extrabold text-[13px] mb-1" style={{ color: 'var(--text-warm)' }}>You did it</p>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-bright)' }}>
                You planned your message — and that’s exactly what earns your
                Wingsuit! You don’t have to wait for the perfect moment; the
                best time to share it is soon, while it’s fresh. Take the
                Wingsuit with you — it’ll help you cross the bridge ahead.
              </p>
            </>
          )}
        </div>

        {step === 'review' && (
          <div className="flex gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => setStep('situation')}
              className="flex-1 py-2.5 rounded-full text-[14px] font-extrabold"
              style={{ background: 'var(--action-quiet)', color: 'var(--text-bright)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)' }}
            >
              Change something
            </button>
            <button
              type="button"
              onClick={save}
              className="flex-1 py-2.5 rounded-full text-[14px] font-extrabold"
              style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
            >
              Save It
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
              (step === 'normalize' && !normalize) ||
              (step === 'offer' && !offer) ||
              (step === 'request' && !request) ||
              (step === 'help' && !help)
            }
            className="w-full mt-2.5 py-2.5 rounded-full disabled:opacity-[.42] disabled:cursor-not-allowed text-[15px] font-extrabold"
            style={{ background: 'var(--action-primary)', color: 'var(--text-on-warm)', boxShadow: 'var(--glow-sm)' }}
          >
            Continue
          </button>
        )}

        {step === 'done' && (
          <button
            type="button"
            onClick={restart}
            className="w-full mt-2.5 py-2 text-[13px] font-semibold underline text-[var(--text-warm)] hover:text-[var(--text-bright)] transition-colors"
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
