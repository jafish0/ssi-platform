// GAINS measurement packet (Draft 53, 2026-08-27) — shared instrument
// definitions for the Child Assent & Measures content.
//
// Source of truth: `Gains for Teens/Measurements/Gains Teens
// Measurements_SG.docx` (Stephanie). Every item below is transcribed
// verbatim, including the CTS and Beck-4 items that were embedded as images
// in the source doc. Nothing here is placeholder or invented content.
//
// Draft 54 (2026-09-01): this file used to render the whole packet as one
// flat scroll. It's now a data module -- each instrument's fields live in
// their own small component, and `PRE_TEST_PAGES`/`POST_TEST_PAGES` list
// them in administration order -- so `MeasurementFlow.jsx` can paginate
// through them one instrument per page without duplicating any item text.
//
// Scope, per Draft 53: this is for team review on the demo page (which
// already says no real participant data). All state is local/ephemeral --
// nothing is persisted, nothing is scored. Live data capture + scoring to
// Supabase is a SEPARATE follow-up, mirroring how Ready for Roots' own
// pretest/posttest went from demo-only to a real DB-driven pipeline.

import GainsBadge from './ds/Badge.jsx'
import RadioList from './ds/RadioList.jsx'
import CheckboxList from './ds/CheckboxList.jsx'
import LikertScale from './ds/LikertScale.jsx'
import { TextInput, TextArea } from './ds/TextInput.jsx'

// ---------- verbatim option sets ----------

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

const RACE_OPTIONS = [
  { value: 'white', label: 'White or Caucasian' },
  { value: 'black', label: 'Black or African American' },
  { value: 'native', label: 'American Indian/Native American/Alaska Native' },
  { value: 'asian', label: 'Asian' },
  { value: 'pacific', label: 'Native Hawaiian or Other Pacific Islander' },
  { value: 'prefer_not', label: 'Prefer not to say' },
]

const SEX_OPTIONS = [
  { value: 'boy', label: 'Boy/Male' },
  { value: 'girl', label: 'Girl/Female' },
  { value: 'nonbinary', label: 'Nonbinary' },
  { value: 'prefer_not', label: 'Prefer not to say' },
]

const CTS_SCALE = [
  { value: 0, label: 'Never/Rarely' },
  { value: 1, label: '1-2 times per month' },
  { value: 2, label: '1-2 times per week' },
  { value: 3, label: '3+ times per week' },
]

// Kept the source doc's own numbering (5-10) rather than renumbering from 1.
const CTS_ITEMS = [
  { n: 5, text: 'Strong feelings in your body when you remember something that happened (sweating, heart beats fast, feel sick).' },
  { n: 6, text: 'Try to stay away from people, places, or things that remind you about something that happened.' },
  { n: 7, text: 'Trouble feeling happy.' },
  { n: 8, text: 'Trouble sleeping.' },
  { n: 9, text: 'Hard to concentrate or pay attention.' },
  { n: 10, text: 'Feel alone and not close to people around you.' },
]

const THERAPY_TIMING_OPTIONS = [
  { value: 'week', label: 'Less Than A Week Ago' },
  { value: 'month', label: 'About A Month Ago' },
  { value: '2-6mo', label: 'Between 2-6 Months Ago' },
  { value: '6-12mo', label: 'Between 6 Months-1 Year Ago' },
  { value: '1yr+', label: 'Over 1 year Ago' },
]

const BECK4_SCALE = [
  { value: 0, label: 'Absolutely Disagree' },
  { value: 1, label: 'Somewhat Disagree' },
  { value: 2, label: 'Somewhat Agree' },
  { value: 3, label: 'Absolutely Agree' },
]

const BECK4_ITEMS = [
  'I feel that my future is hopeless and that things will not improve.',
  'My future seems dark to me.',
  'Things just won’t work out the way I want them to.',
  'There’s no use in really trying to get something I want, because I probably won’t get it.',
]

const IMPLICIT_THEORIES_ITEMS = [
  'I can’t really control my feelings. It’s just the way I am.',
  'If I want to, I can change how I feel.',
  'My feelings are something about me that I can’t change very much.',
  'Even if I usually feel a certain way, I can change the feelings I have.',
  'No matter how hard I might try, I can’t really change the feelings I have.',
  'I can learn to change my feelings.',
]

const TRAUMA_BELIEFS_ITEMS = [
  { text: 'A traumatic event is a really scary experience that is almost impossible to recover from.' },
  { text: 'Once a trauma is over our bodies and reactions always go back to “normal,” like it never happened.', reverse: true },
  { text: 'Having a hard time sleeping, difficulties concentrating, and not being able to relax can be reactions to experiencing trauma.' },
  { text: 'Therapy doesn’t really help most people that have experienced trauma.', reverse: true },
  { text: 'If someone feels uncomfortable in therapy it means it is not working.', reverse: true },
  { text: 'How someone thinks about things can change how they feel and what they do.' },
]

const PROGRAM_FEEDBACK_ITEMS = [
  'This program was easy to use',
  'I understood the program',
  'I enjoyed the program',
  'I think the program would be helpful to other kids my age',
]

// ---------- shared layout pieces ----------

export function Instrument({ title, timing, prompt, note, children }) {
  return (
    <div
      className="rounded-[24px] p-5"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)', boxShadow: 'var(--shadow-md)' }}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <h4 className="text-[15px] font-bold" style={{ fontFamily: 'var(--font-core)', color: 'var(--text-bright)' }}>
          {title}
        </h4>
        <GainsBadge tone="water" style={{ flexShrink: 0 }}>{timing}</GainsBadge>
      </div>
      {prompt && (
        <p className="text-[13px] italic mb-4" style={{ color: 'var(--text-muted)' }}>
          {prompt}
        </p>
      )}
      <div className="space-y-5">{children}</div>
      {note && (
        <p className="text-[11px] italic mt-4 pt-3" style={{ color: 'var(--text-faint)', borderTop: '1px solid var(--border-soft)' }}>
          {note}
        </p>
      )}
    </div>
  )
}

function Item({ n, text, children }) {
  return (
    <div>
      <p className="text-[13px] leading-snug mb-2" style={{ color: 'var(--text-bright)' }}>
        {n != null && <span style={{ color: 'var(--text-warm)' }}>{n}. </span>}
        {text}
      </p>
      {children}
    </div>
  )
}

// ---------- one field-set per instrument ----------

function DemographicsFields({ v, set }) {
  return (
    <>
      <Item n={null} text="What is your current age?">
        <TextInput value={v.age || ''} onChange={set('age')} placeholder="Age" inputMode="numeric" />
      </Item>
      <Item n={null} text="What grade are you in?">
        <TextInput value={v.grade || ''} onChange={set('grade')} placeholder="Grade" />
      </Item>
      <Item n={null} text="Choose one or more races that you consider yourself to be.">
        <CheckboxList
          name="Race/ethnicity"
          options={RACE_OPTIONS}
          value={v.race || []}
          onChange={set('race')}
          otherOption="Another (write it in)"
          otherValue={v.race_other}
          onOtherChange={set('race_other')}
        />
      </Item>
      <Item n={null} text="Are you of Spanish, Hispanic, or Latino origin?">
        <RadioList name="Hispanic/Latino origin" options={YES_NO} value={v.hispanic} onChange={set('hispanic')} />
      </Item>
      <Item n={null} text="Please select your sex.">
        <CheckboxList
          name="Sex"
          options={SEX_OPTIONS}
          value={v.sex ? [v.sex] : []}
          onChange={(next) => set('sex')(next[next.length - 1] ?? null)}
          otherOption="Another (write it in)"
          otherValue={v.sex_other}
          onOtherChange={set('sex_other')}
        />
      </Item>
    </>
  )
}

function TraumaTimingFields({ v, set }) {
  return (
    <Item
      n={null}
      text="Sometimes scary or very upsetting things happen to people where they feel like their life or the life of someone close to them is in danger (like being hurt, seeing someone else hurt, being in a car accident, or not getting food or having a safe place to live). These things are called trauma experiences. When was the LAST time something like this happened to you?"
    >
      <div className="flex gap-2">
        <TextInput value={v.trauma_months || ''} onChange={set('trauma_months')} placeholder="Months" inputMode="numeric" />
        <TextInput value={v.trauma_years || ''} onChange={set('trauma_years')} placeholder="Years" inputMode="numeric" />
      </div>
    </Item>
  )
}

function CTSFields({ v, set }) {
  return CTS_ITEMS.map((item) => (
    <Item key={item.n} n={item.n} text={item.text}>
      <RadioList name={`CTS item ${item.n}`} options={CTS_SCALE} value={v[`cts_${item.n}`]} onChange={set(`cts_${item.n}`)} />
    </Item>
  ))
}

function TherapyHistoryFields({ v, set }) {
  return (
    <>
      <Item n={null} text="Are you currently talking to a mental health therapist about any stressful issues in your life or for any reason?">
        <RadioList name="Currently in therapy" options={YES_NO} value={v.therapy_current} onChange={set('therapy_current')} />
      </Item>

      {v.therapy_current === 'yes' && (
        <Item n={null} text="Are you talking with your therapist about any traumatic experiences you have had?">
          <RadioList name="Discussing trauma with current therapist" options={YES_NO} value={v.therapy_current_trauma} onChange={set('therapy_current_trauma')} />
        </Item>
      )}

      {v.therapy_current === 'no' && (
        <>
          <Item n={null} text="Have you ever talked to a mental health therapist in the past?">
            <RadioList name="Past therapy" options={YES_NO} value={v.therapy_past} onChange={set('therapy_past')} />
          </Item>
          {v.therapy_past === 'yes' && (
            <>
              <Item n={null} text="When was the last time you were in therapy?">
                <RadioList name="Last time in therapy" options={THERAPY_TIMING_OPTIONS} value={v.therapy_past_when} onChange={set('therapy_past_when')} />
              </Item>
              <Item n={null} text="Did you talk with your therapist about any traumatic experiences you have had?">
                <RadioList name="Discussed trauma with past therapist" options={YES_NO} value={v.therapy_past_trauma} onChange={set('therapy_past_trauma')} />
              </Item>
            </>
          )}
        </>
      )}
    </>
  )
}

function Beck4Fields({ v, set }) {
  return BECK4_ITEMS.map((text, i) => (
    <Item key={i} n={i + 1} text={text}>
      <RadioList name={`Beck-4 item ${i + 1}`} options={BECK4_SCALE} value={v[`beck_${i}`]} onChange={set(`beck_${i}`)} />
    </Item>
  ))
}

function MotivationFields({ v, set }) {
  return (
    <>
      <Item n={null} text="At this moment, how ready are you to work towards dealing with any of the difficulties you may have related to your trauma experiences?">
        <LikertScale name="Readiness" count={10} value={v.motiv_ready} onChange={set('motiv_ready')} />
      </Item>
      <Item n={null} text="At this moment, how confident are you in your ability to improve those difficulties related to your trauma experiences?">
        <LikertScale name="Confidence" count={10} value={v.motiv_confidence} onChange={set('motiv_confidence')} />
      </Item>
      <Item n={null} text="How helpful do you think trauma therapy would be for you?">
        <LikertScale name="Helpfulness" count={10} value={v.motiv_helpful} onChange={set('motiv_helpful')} />
      </Item>
      <Item n={null} text="What is the reason for your response/rating.">
        <TextArea value={v.motiv_reason || ''} onChange={set('motiv_reason')} placeholder="Type your answer" />
      </Item>
    </>
  )
}

function ImplicitTheoriesFields({ v, set }) {
  return IMPLICIT_THEORIES_ITEMS.map((text, i) => (
    <Item key={i} n={i + 1} text={text}>
      <LikertScale
        name={`Implicit theories item ${i + 1}`}
        count={6}
        minLabel="Strongly disagree"
        maxLabel="Strongly agree"
        value={v[`implicit_${i}`]}
        onChange={set(`implicit_${i}`)}
      />
    </Item>
  ))
}

function TraumaBeliefsFields({ v, set }) {
  return TRAUMA_BELIEFS_ITEMS.map((item, i) => (
    <Item key={i} n={i + 1} text={item.reverse ? `${item.text} (reverse scored)` : item.text}>
      <LikertScale
        name={`Trauma beliefs item ${i + 1}`}
        count={6}
        minLabel="Strongly disagree"
        maxLabel="Strongly agree"
        value={v[`beliefs_${i}`]}
        onChange={set(`beliefs_${i}`)}
      />
    </Item>
  ))
}

function ProgramFeedbackFields({ v, set }) {
  return (
    <>
      {PROGRAM_FEEDBACK_ITEMS.map((text, i) => (
        <Item key={i} n={i + 1} text={text}>
          <LikertScale
            name={`Program feedback item ${i + 1}`}
            count={5}
            startAt={0}
            minLabel="Really disagree"
            maxLabel="Really agree"
            value={v[`feedback_${i}`]}
            onChange={set(`feedback_${i}`)}
          />
        </Item>
      ))}
      <Item n={5} text="What did you like about the program? Please share as many true thoughts and feelings as you would like.">
        <TextArea value={v.feedback_like || ''} onChange={set('feedback_like')} placeholder="Type your answer" />
      </Item>
      <Item n={6} text="What would you change about the program? Please share as many true thoughts and feelings as you would like.">
        <TextArea value={v.feedback_change || ''} onChange={set('feedback_change')} placeholder="Type your answer" />
      </Item>
    </>
  )
}

// ---------- administration order (Draft 54) ----------
//
// Pre-test = Pre-only + Pre+Post instruments, in this order. Post-test =
// the Pre+Post instruments again + the Post-only Program Feedback Scale --
// built by reusing the same page objects rather than redefining them.

export const PRE_TEST_PAGES = [
  { id: 'demographics', title: 'Demographics', timing: 'Pre', Fields: DemographicsFields },
  { id: 'trauma-timing', title: 'Event: time since trauma', timing: 'Pre', Fields: TraumaTimingFields },
  {
    id: 'cts',
    title: 'Child Trauma Screen (CTS) — Reactions Subscale',
    timing: 'Pre',
    prompt: 'How often did each of these happen in the last 30 days?',
    Fields: CTSFields,
  },
  { id: 'therapy-history', title: 'Therapy history (present & past)', timing: 'Pre', Fields: TherapyHistoryFields },
  {
    id: 'beck4',
    title: 'Beck Hopelessness Scale-4',
    timing: 'Pre + Post',
    prompt: 'Please share how you are feeling, right now, at this moment.',
    note: 'Scored by summing all 4 items.',
    Fields: Beck4Fields,
  },
  { id: 'motivation', title: 'Motivation / Readiness to Change Ruler', timing: 'Pre + Post', Fields: MotivationFields },
  { id: 'implicit', title: 'Implicit Theories of Emotion Scale – Child Version', timing: 'Pre + Post', Fields: ImplicitTheoriesFields },
  { id: 'beliefs', title: 'Trauma and Treatment Beliefs', timing: 'Pre + Post', Fields: TraumaBeliefsFields },
]

export const POST_TEST_PAGES = [
  ...PRE_TEST_PAGES.filter((p) => p.timing === 'Pre + Post'),
  { id: 'feedback', title: 'Program Feedback Scale', timing: 'Post', Fields: ProgramFeedbackFields },
]
