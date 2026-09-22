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
// Draft 41 also added two pieces of safety/reassurance copy from Dr.
// Sprang. REASSURANCE is still rendered exactly as she wrote it, informal
// em-dash-without-a-following-space punctuation included ("off- you") --
// clinical wording from a named source, not ours to re-typeset. Her
// original safety disclaimer went through a couple of revisions after
// that (see SAFETY_DISCLAIMER's own comment, Draft 62) and is no longer
// verbatim -- it's now a merged, Josh-approved version.

import { useEffect, useRef, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { addActionPlanItem } from '../lib/gainsActionPlan.js'

const ART = '/long-light/art/zone3'

// --- Draft 86: narration (Spark voice F) ---
// 32 clips under public/long-light/audio/guardian/. Only active when the
// `narrate` prop is true (Zone 3's Message to Your Guardian station passes
// it, and so does the standalone review page -- unlike Body Mapping, this
// one is meant to be heard both places).
const NARRATION_BASE = '/long-light/audio/guardian'
const STEP_NARRATION = {
  // 'intro' isn't listed here -- it chains two clips (see the step effect
  // below), not a single lookup.
  greeting: 'gm-02-greeting',
  situation: 'gm-03-situation',
  request: 'gm-04-request',
  normalize: 'gm-05-normalize',
  offer: 'gm-06-offer',
  help: 'gm-07-help',
  safety: 'gm-10-safety',
  done: 'gm-11-done',
}

const SPARK_INTRO =
  'Sometimes things feel like a dead end. For some teens, getting their parents or caregivers on board with trauma therapy feels like a bridge that can’t be crossed. But with a little preparation and courage, you can overcome any obstacle. Take this time to plan out a message for your guardians.'

// Draft 90 (item 13): a second clip right after the intro, chained the same
// way the review screen chains gm-08/gm-09 -- its text shows beneath the
// intro's on the same screen, not in place of it.
const WHAT_IT_IS =
  "This message is you asking a parent or guardian to help you start trauma therapy. We'll build it together, one piece at a time, and you can change anything before you save it."

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
  // Draft 74 (9/11 review): was "Therapy can also help me…" -- "also" dropped
  // now that this step comes first among the reasons.
  'Therapy can help me sleep better, make better grades, improve my connection to people',
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

// Draft 62 (2026-09-02): merges Sprang's escalation guidance (Draft 41, was
// its own SAFETY_DISCLAIMER) with the 988 definition Draft 59 had added as a
// separate phone-icon card -- Josh wants both, but as one line so 988 only
// appears once. Copy reviewed and approved by Josh; ships as-is, including
// her "your family physician" typo fix (was "you family physician").
const SAFETY_DISCLAIMER =
  'Note: if what is going on feels urgent — like you are struggling to cope or having thoughts of hurting yourself or someone else — don’t wait to convince your parents. Reach out immediately to a school counselor, your family physician, or call or text 988, the Suicide & Crisis Lifeline (free, confidential support, 24/7).'

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
function SelectStep({ options, selected, onChange, readingIndex = -1 }) {
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
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          aria-pressed={selected === opt}
          className="w-full text-left px-3.5 py-2.5 rounded-2xl text-[13px] leading-snug border transition-colors"
          style={{
            ...(selected === opt
              ? { background: 'var(--action-primary)', borderColor: 'var(--action-primary)', color: 'var(--text-on-warm)', fontWeight: 'var(--weight-bold)' }
              : { background: 'var(--action-quiet)', borderColor: 'var(--border-soft)', color: 'var(--text-body)' }),
            ...(i === readingIndex ? { boxShadow: '0 0 0 2px var(--border-warm)' } : {}),
          }}
        >
          {opt}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange('')}
        className="w-full text-left px-3.5 py-2.5 rounded-2xl text-[13px] leading-snug border border-dashed hover:border-[var(--border-warm)] hover:text-[var(--text-warm)] transition-colors"
        style={{ borderColor: 'var(--border-soft)', color: 'var(--text-body)' }}
      >
        Write your own
      </button>
    </div>
  )
}

// Draft 86: reads a select step's own options aloud, one after another.
// The button itself is the only way options are voiced (never on plain
// tap) so choosing stays quick for teens who don't need it.
function ReadToMeButton({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-2 inline-flex items-center gap-1.5 px-3.5 rounded-full text-[13px] font-bold transition-colors"
      style={{ height: 44, background: 'var(--action-quiet)', color: 'var(--text-bright)' }}
    >
      <Volume2 size={15} strokeWidth={2} />
      {active ? 'Stop' : 'Read to me'}
    </button>
  )
}

// --- Draft 80: `onComplete` ---
// Inside the Zone 3 walkable zone this activity is one scene in a larger
// in-frame loop, and the Wingsuit is awarded by a real Gear Award scene
// right after. When the `onComplete()` prop is provided, finishing the
// safety-disclaimer step hands off to it instead of advancing to the
// standalone `done` screen (the "You did it" ending + Start over). Without
// the prop (the review-list demo) the behavior is unchanged.
export default function ElevatorPitch({ onComplete = null, narrate: narrateOn = false, onNarrate = null }) {
  const [step, setStep] = useState('intro')
  const [greeting, setGreeting] = useState('')
  const [situation, setSituation] = useState(null)
  const [normalize, setNormalize] = useState(null)
  const [offer, setOffer] = useState(null)
  const [request, setRequest] = useState(null)
  const [help, setHelp] = useState(null)
  const [saved, setSaved] = useState(false)
  const [narrating, setNarrating] = useState(false)
  const narratingRef = useRef(false)
  narratingRef.current = narrating
  // Which select step is currently being read aloud, and which of its
  // options is on -- { step, index } | null.
  const [reading, setReading] = useState(null)

  const audioRef = useRef(null)
  const readTimerRef = useRef(null)
  useEffect(() => {
    audioRef.current = new Audio()
    return () => {
      clearTimeout(readTimerRef.current)
      const el = audioRef.current
      if (el) {
        el.pause()
        el.src = ''
      }
    }
  }, [])

  function narrate(name, onEnd) {
    if (!narrateOn) return
    const el = audioRef.current
    if (!el) return
    try {
      el.pause()
      el.currentTime = 0
      el.src = `${NARRATION_BASE}/${name}.mp3`
      onNarrate?.(true)
      setNarrating(true)
      el.onended = () => {
        onNarrate?.(false)
        setNarrating(false)
        onEnd?.()
      }
      el.onerror = () => {
        onNarrate?.(false)
        setNarrating(false)
      }
      const p = el.play()
      if (p && p.catch) {
        p.catch(() => {
          onNarrate?.(false)
          setNarrating(false)
        })
      }
    } catch {
      onNarrate?.(false)
      setNarrating(false)
    }
  }

  // One clip per screen, on entry -- including the review screen's two
  // back-to-back clips and the intro line on open. Re-fires whenever `step`
  // changes, so "Change something" (which sets step back to a select step)
  // and Start over (which resets to 'intro') both naturally replay the
  // right prompt.
  useEffect(() => {
    if (step === 'review') narrate('gm-08-review', () => narrate('gm-09-reassurance'))
    else if (step === 'intro') narrate('gm-01-intro', () => narrate('gm-01b-what-it-is'))
    else if (STEP_NARRATION[step]) narrate(STEP_NARRATION[step])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  function stopReadAloud() {
    clearTimeout(readTimerRef.current)
    setReading(null)
    audioRef.current?.pause()
  }

  function playReadStep(stepKey, options, index) {
    if (index >= options.length) {
      setReading(null)
      return
    }
    setReading({ step: stepKey, index })
    narrate(`gm-opt-${stepKey}-${index + 1}`, () => {
      readTimerRef.current = setTimeout(() => playReadStep(stepKey, options, index + 1), 350)
    })
  }

  // Draft 90 (item 11): five reporters found the first Read-to-me option
  // playing quiet, and step 6's first option sometimes not playing at all.
  // Root cause -- narrate() unconditionally does el.pause()/el.src=.../
  // el.play() on the ONE shared audio element; tapping Read-to-me while the
  // step's own entrance line (or a prior read-aloud clip) was still mid-
  // flight cut it off mid-load, and the option clip's own play() could
  // start into a not-yet-settled element (quiet first bytes, or on a slow
  // step, silently dropped). Now it waits for narrating to actually clear
  // (+150ms) before the sequence's first clip ever fires, exactly like the
  // draft's own fix note: "each clip starts at full level after the
  // previous has ended, and the step prompt's duck is released first."
  function toggleReadAloud(stepKey, options) {
    if (reading?.step === stepKey) {
      stopReadAloud()
      return
    }
    const begin = () => playReadStep(stepKey, options, 0)
    if (!narratingRef.current) {
      begin()
      return
    }
    const deadline = Date.now() + 6000
    const wait = () => {
      if (!narratingRef.current) {
        readTimerRef.current = setTimeout(begin, 150)
      } else if (Date.now() >= deadline) {
        begin()
      } else {
        readTimerRef.current = setTimeout(wait, 100)
      }
    }
    wait()
  }

  // Wraps a select step's setter so: a tap during "Read to me" stops the
  // sequence first (then selects, same as any other tap), and the very tap
  // that opens the "Write your own" field (value '' from a step that
  // wasn't already in custom mode) plays its own cue -- but clearing typed
  // text back to empty while ALREADY in custom mode doesn't re-fire it.
  function makeStepChange(stepKey, options, currentVal, setter) {
    return (val) => {
      if (reading?.step === stepKey) stopReadAloud()
      const wasCustom = currentVal !== null && !options.includes(currentVal)
      if (val === '' && !wasCustom) narrate('gm-opt-custom')
      setter(val)
    }
  }

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
    stopReadAloud()
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
        <div
          className="rounded-2xl px-3.5 py-3"
          style={{ background: 'var(--surface-sheet)', backdropFilter: 'var(--blur-sheet)', border: '1px solid var(--border-soft)' }}
        >
          {step === 'intro' && (
            <>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-bright)' }}>{SPARK_INTRO}</p>
              <p className="text-[13px] leading-relaxed mt-2" style={{ color: 'var(--text-bright)' }}>{WHAT_IT_IS}</p>
            </>
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
              <ReadToMeButton active={reading?.step === 'situation'} onClick={() => toggleReadAloud('situation', SITUATION_OPTIONS)} />
              <SelectStep
                options={SITUATION_OPTIONS}
                selected={situation}
                onChange={makeStepChange('situation', SITUATION_OPTIONS, situation, setSituation)}
                readingIndex={reading?.step === 'situation' ? reading.index : -1}
              />
            </>
          )}

          {step === 'request' && (
            <>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-bright)' }}>{promptText}</p>
              <ReadToMeButton active={reading?.step === 'request'} onClick={() => toggleReadAloud('request', REQUEST_OPTIONS)} />
              <SelectStep
                options={REQUEST_OPTIONS}
                selected={request}
                onChange={makeStepChange('request', REQUEST_OPTIONS, request, setRequest)}
                readingIndex={reading?.step === 'request' ? reading.index : -1}
              />
            </>
          )}

          {step === 'normalize' && (
            <>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-bright)' }}>{promptText}</p>
              <ReadToMeButton active={reading?.step === 'normalize'} onClick={() => toggleReadAloud('normalize', NORMALIZE_OPTIONS)} />
              <SelectStep
                options={NORMALIZE_OPTIONS}
                selected={normalize}
                onChange={makeStepChange('normalize', NORMALIZE_OPTIONS, normalize, setNormalize)}
                readingIndex={reading?.step === 'normalize' ? reading.index : -1}
              />
            </>
          )}

          {step === 'offer' && (
            <>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-bright)' }}>{promptText}</p>
              <ReadToMeButton active={reading?.step === 'offer'} onClick={() => toggleReadAloud('offer', OFFER_OPTIONS)} />
              <SelectStep
                options={OFFER_OPTIONS}
                selected={offer}
                onChange={makeStepChange('offer', OFFER_OPTIONS, offer, setOffer)}
                readingIndex={reading?.step === 'offer' ? reading.index : -1}
              />
            </>
          )}

          {step === 'help' && (
            <>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-bright)' }}>{promptText}</p>
              <ReadToMeButton active={reading?.step === 'help'} onClick={() => toggleReadAloud('help', HELP_OPTIONS)} />
              <SelectStep
                options={HELP_OPTIONS}
                selected={help}
                onChange={makeStepChange('help', HELP_OPTIONS, help, setHelp)}
                readingIndex={reading?.step === 'help' ? reading.index : -1}
              />
            </>
          )}

          {step === 'review' && (
            <>
              <p className="text-[13px] font-semibold mb-2" style={{ color: 'var(--text-bright)' }}>Here’s your message:</p>
              <p className="text-[14px] leading-relaxed italic pl-3" style={{ color: 'var(--text-bright)', borderLeft: '2px solid var(--border-warm)' }}>
                {message}
              </p>
              <p className="text-[12px] mt-2" style={{ color: 'var(--text-body)' }}>
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
              on `done`, below. Draft 59 added a separate phone-icon
              crisis-lifeline explainer below Sprang's line so 988 was
              actually explained, but live-demo review found the two 988
              mentions read as duplicated. Draft 62 (2026-09-02, approved by
              Josh) merges both into this one line instead -- Sprang's
              escalation guidance plus the 988 definition -- so it only
              appears once. */}
          {step === 'safety' && (
            <p
              className="text-[13px] leading-relaxed rounded-2xl px-3 py-2.5"
              style={{ background: 'rgba(253,230,138,.10)', border: '1px solid var(--border-warm)', color: 'var(--text-bright)' }}
            >
              {SAFETY_DISCLAIMER}
            </p>
          )}

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
            onClick={() => (step === 'safety' && onComplete ? onComplete() : next())}
            disabled={
              (step === 'greeting' && !greeting.trim()) ||
              (step === 'situation' && !situation) ||
              (step === 'normalize' && !normalize) ||
              (step === 'offer' && !offer) ||
              (step === 'request' && !request) ||
              (step === 'help' && !help) ||
              (step === 'safety' && narrating)
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
