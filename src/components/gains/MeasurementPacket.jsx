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
//
// Draft 71 (2026-09-03): re-chunked so every step fits a 9:16 phone frame
// with Continue always visible (no scrolling inside the frame). Long
// instruments are split across steps -- Demographics over three pages, the
// scales in groups of 2-3 items via a `range` on the page -- as parts of the
// same instrument ("Part 1 of 3"), and the therapy-history follow-ups are a
// conditional second page (`skip` when the tester is currently in therapy).
// Item wording and order are unchanged; the field components below just
// take a `range` slice where an instrument spans pages.

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

export function Instrument({ title, part, timing, prompt, note, children }) {
  return (
    <div
      className="rounded-[24px] p-4"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)', boxShadow: 'var(--shadow-md)' }}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
        <div className="min-w-0">
          <h4 className="text-[15px] font-bold leading-snug" style={{ fontFamily: 'var(--font-core)', color: 'var(--text-bright)' }}>
            {title}
          </h4>
          {part && (
            <p className="text-[11px] font-semibold mt-0.5" style={{ color: 'var(--text-faint)' }}>
              {part}
            </p>
          )}
        </div>
        <GainsBadge tone="water" style={{ flexShrink: 0 }}>{timing}</GainsBadge>
      </div>
      {prompt && (
        <p className="text-[13px] italic mb-4" style={{ color: 'var(--text-muted)' }}>
          {prompt}
        </p>
      )}
      <div className="space-y-4">{children}</div>
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
      <p className="text-[13px] leading-snug mb-1.5" style={{ color: 'var(--text-bright)' }}>
        {n != null && <span style={{ color: 'var(--text-warm)' }}>{n}. </span>}
        {text}
      </p>
      {children}
    </div>
  )
}

// ---------- one field-set per instrument ----------

// Demographics spans three pages (Draft 71); same five items, same order.
function DemographicsFieldsA({ v, set }) {
  return (
    <>
      <Item n={null} text="What is your current age?">
        <TextInput value={v.age || ''} onChange={set('age')} placeholder="Age" inputMode="numeric" />
      </Item>
      <Item n={null} text="What grade are you in?">
        <TextInput value={v.grade || ''} onChange={set('grade')} placeholder="Grade" />
      </Item>
    </>
  )
}

function DemographicsFieldsB({ v, set }) {
  return (
    <Item n={null} text="Choose one or more races that you consider yourself to be.">
      <CheckboxList
        name="Race/ethnicity"
        options={RACE_OPTIONS}
        value={v.race || []}
        onChange={set('race')}
        otherOption="Another (write it in)"
        otherValue={v.race_other}
        onOtherChange={set('race_other')}
        columns={2}
      />
    </Item>
  )
}

function DemographicsFieldsC({ v, set }) {
  return (
    <>
      <Item n={null} text="Are you of Spanish, Hispanic, or Latino origin?">
        <RadioList name="Hispanic/Latino origin" options={YES_NO} value={v.hispanic} onChange={set('hispanic')} columns={2} />
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
          columns={2}
        />
      </Item>
    </>
  )
}

// Slice helper for the scales that span pages: `range` is [from, to) into
// the instrument's item list; no range means the whole list.
function sliced(items, range) {
  return range ? items.slice(range[0], range[1]).map((item, i) => [item, range[0] + i]) : items.map((item, i) => [item, i])
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

function CTSFields({ v, set, range }) {
  return sliced(CTS_ITEMS, range).map(([item]) => (
    <Item key={item.n} n={item.n} text={item.text}>
      <RadioList name={`CTS item ${item.n}`} options={CTS_SCALE} value={v[`cts_${item.n}`]} onChange={set(`cts_${item.n}`)} columns={2} />
    </Item>
  ))
}

// Therapy history spans up to three pages (Draft 71): the current-therapy
// question with its follow-up; then -- only when the answer is "no" -- the
// past-therapy question with "when"; then -- only when past therapy is
// "yes" -- whether trauma came up. Pages not on the tester's branch are
// skipped (see PRE_TEST_PAGES). Same questions, same branching, same order.
function TherapyCurrentFields({ v, set }) {
  return (
    <>
      <Item n={null} text="Are you currently talking to a mental health therapist about any stressful issues in your life or for any reason?">
        <RadioList name="Currently in therapy" options={YES_NO} value={v.therapy_current} onChange={set('therapy_current')} columns={2} />
      </Item>

      {v.therapy_current === 'yes' && (
        <Item n={null} text="Are you talking with your therapist about any traumatic experiences you have had?">
          <RadioList name="Discussing trauma with current therapist" options={YES_NO} value={v.therapy_current_trauma} onChange={set('therapy_current_trauma')} columns={2} />
        </Item>
      )}
    </>
  )
}

function TherapyPastFields({ v, set }) {
  return (
    <>
      <Item n={null} text="Have you ever talked to a mental health therapist in the past?">
        <RadioList name="Past therapy" options={YES_NO} value={v.therapy_past} onChange={set('therapy_past')} columns={2} />
      </Item>
      {v.therapy_past === 'yes' && (
        <Item n={null} text="When was the last time you were in therapy?">
          <RadioList name="Last time in therapy" options={THERAPY_TIMING_OPTIONS} value={v.therapy_past_when} onChange={set('therapy_past_when')} columns={2} />
        </Item>
      )}
    </>
  )
}

function TherapyPastTraumaFields({ v, set }) {
  return (
    <Item n={null} text="Did you talk with your therapist about any traumatic experiences you have had?">
      <RadioList name="Discussed trauma with past therapist" options={YES_NO} value={v.therapy_past_trauma} onChange={set('therapy_past_trauma')} columns={2} />
    </Item>
  )
}

function Beck4Fields({ v, set, range }) {
  return sliced(BECK4_ITEMS, range).map(([text, i]) => (
    <Item key={i} n={i + 1} text={text}>
      <RadioList name={`Beck-4 item ${i + 1}`} options={BECK4_SCALE} value={v[`beck_${i}`]} onChange={set(`beck_${i}`)} columns={2} />
    </Item>
  ))
}

// The readiness ruler spans three pages (Draft 71): one 10-point ruler per
// page, the third with its reason.
function MotivationFieldsA({ v, set }) {
  return (
    <Item n={null} text="At this moment, how ready are you to work towards dealing with any of the difficulties you may have related to your trauma experiences?">
      <LikertScale name="Readiness" count={10} value={v.motiv_ready} onChange={set('motiv_ready')} />
    </Item>
  )
}

function MotivationFieldsB({ v, set }) {
  return (
    <Item n={null} text="At this moment, how confident are you in your ability to improve those difficulties related to your trauma experiences?">
      <LikertScale name="Confidence" count={10} value={v.motiv_confidence} onChange={set('motiv_confidence')} />
    </Item>
  )
}

function MotivationFieldsC({ v, set }) {
  return (
    <>
      <Item n={null} text="How helpful do you think trauma therapy would be for you?">
        <LikertScale name="Helpfulness" count={10} value={v.motiv_helpful} onChange={set('motiv_helpful')} />
      </Item>
      <Item n={null} text="What is the reason for your response/rating.">
        <TextArea value={v.motiv_reason || ''} onChange={set('motiv_reason')} placeholder="Type your answer" />
      </Item>
    </>
  )
}

function ImplicitTheoriesFields({ v, set, range }) {
  return sliced(IMPLICIT_THEORIES_ITEMS, range).map(([text, i]) => (
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

function TraumaBeliefsFields({ v, set, range }) {
  return sliced(TRAUMA_BELIEFS_ITEMS, range).map(([item, i]) => (
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

// The Program Feedback Scale spans three pages (Draft 71): the four rated
// items two at a time (`range`), then the two open questions.
function ProgramFeedbackFieldsA({ v, set, range }) {
  return sliced(PROGRAM_FEEDBACK_ITEMS, range).map(([text, i]) => (
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
  ))
}

function ProgramFeedbackFieldsB({ v, set }) {
  return (
    <>
      <Item n={5} text="What did you like about the program? Please share as many true thoughts and feelings as you would like.">
        <TextArea value={v.feedback_like || ''} onChange={set('feedback_like')} placeholder="Type your answer" />
      </Item>
      <Item n={6} text="What would you change about the program? Please share as many true thoughts and feelings as you would like.">
        <TextArea value={v.feedback_change || ''} onChange={set('feedback_change')} placeholder="Type your answer" />
      </Item>
    </>
  )
}

// ---------- administration order (Draft 54; re-chunked Draft 71) ----------
//
// Pre-test = Pre-only + Pre+Post instruments, in this order. Post-test =
// the Pre+Post instruments again + the Post-only Program Feedback Scale --
// built by reusing the same page objects rather than redefining them.
// A page may carry `part` (shown under the title), `range` (the slice of
// the instrument's items on this page), `skip(v)` (drop the page for this
// branch) and `gate(v)` (hold Continue until a branch-deciding answer).

const CTS_PROMPT = 'How often did each of these happen in the last 30 days?'
const BECK4_PROMPT = 'Please share how you are feeling, right now, at this moment.'

export const PRE_TEST_PAGES = [
  { id: 'demographics-1', title: 'Demographics', part: 'Part 1 of 3', timing: 'Pre', Fields: DemographicsFieldsA },
  { id: 'demographics-2', title: 'Demographics', part: 'Part 2 of 3', timing: 'Pre', Fields: DemographicsFieldsB },
  { id: 'demographics-3', title: 'Demographics', part: 'Part 3 of 3', timing: 'Pre', Fields: DemographicsFieldsC },
  { id: 'trauma-timing', title: 'Event: time since trauma', timing: 'Pre', Fields: TraumaTimingFields },
  // The two four-point scales with a label on every point (CTS, Beck-4) run
  // one item per page: two of them don't fit a 375px-wide frame.
  ...CTS_ITEMS.map((_, i) => ({
    id: `cts-${i + 1}`,
    title: 'Child Trauma Screen (CTS) — Reactions Subscale',
    part: `Part ${i + 1} of ${CTS_ITEMS.length}`,
    timing: 'Pre',
    prompt: CTS_PROMPT,
    Fields: CTSFields,
    range: [i, i + 1],
  })),
  // Continue waits for the branch-deciding answer so the page a tester sees
  // next matches what they just picked; pages off the branch are skipped.
  { id: 'therapy-current', title: 'Therapy history (present & past)', part: 'Part 1 of 3', timing: 'Pre', Fields: TherapyCurrentFields, gate: (v) => !!v.therapy_current },
  {
    id: 'therapy-past',
    title: 'Therapy history (present & past)',
    part: 'Part 2 of 3',
    timing: 'Pre',
    Fields: TherapyPastFields,
    skip: (v) => v.therapy_current !== 'no',
    gate: (v) => !!v.therapy_past,
  },
  {
    id: 'therapy-past-trauma',
    title: 'Therapy history (present & past)',
    part: 'Part 3 of 3',
    timing: 'Pre',
    Fields: TherapyPastTraumaFields,
    skip: (v) => v.therapy_current !== 'no' || v.therapy_past !== 'yes',
  },
  ...BECK4_ITEMS.map((_, i) => ({
    id: `beck4-${i + 1}`,
    title: 'Beck Hopelessness Scale-4',
    part: `Part ${i + 1} of ${BECK4_ITEMS.length}`,
    timing: 'Pre + Post',
    prompt: BECK4_PROMPT,
    note: i === BECK4_ITEMS.length - 1 ? 'Scored by summing all 4 items.' : undefined,
    Fields: Beck4Fields,
    range: [i, i + 1],
  })),
  { id: 'motivation-1', title: 'Motivation / Readiness to Change Ruler', part: 'Part 1 of 3', timing: 'Pre + Post', Fields: MotivationFieldsA },
  { id: 'motivation-2', title: 'Motivation / Readiness to Change Ruler', part: 'Part 2 of 3', timing: 'Pre + Post', Fields: MotivationFieldsB },
  { id: 'motivation-3', title: 'Motivation / Readiness to Change Ruler', part: 'Part 3 of 3', timing: 'Pre + Post', Fields: MotivationFieldsC },
  { id: 'implicit-1', title: 'Implicit Theories of Emotion Scale – Child Version', part: 'Part 1 of 3', timing: 'Pre + Post', Fields: ImplicitTheoriesFields, range: [0, 2] },
  { id: 'implicit-2', title: 'Implicit Theories of Emotion Scale – Child Version', part: 'Part 2 of 3', timing: 'Pre + Post', Fields: ImplicitTheoriesFields, range: [2, 4] },
  { id: 'implicit-3', title: 'Implicit Theories of Emotion Scale – Child Version', part: 'Part 3 of 3', timing: 'Pre + Post', Fields: ImplicitTheoriesFields, range: [4, 6] },
  { id: 'beliefs-1', title: 'Trauma and Treatment Beliefs', part: 'Part 1 of 3', timing: 'Pre + Post', Fields: TraumaBeliefsFields, range: [0, 2] },
  { id: 'beliefs-2', title: 'Trauma and Treatment Beliefs', part: 'Part 2 of 3', timing: 'Pre + Post', Fields: TraumaBeliefsFields, range: [2, 4] },
  { id: 'beliefs-3', title: 'Trauma and Treatment Beliefs', part: 'Part 3 of 3', timing: 'Pre + Post', Fields: TraumaBeliefsFields, range: [4, 6] },
]

export const POST_TEST_PAGES = [
  ...PRE_TEST_PAGES.filter((p) => p.timing === 'Pre + Post'),
  { id: 'feedback-1', title: 'Program Feedback Scale', part: 'Part 1 of 3', timing: 'Post', Fields: ProgramFeedbackFieldsA, range: [0, 2] },
  { id: 'feedback-2', title: 'Program Feedback Scale', part: 'Part 2 of 3', timing: 'Post', Fields: ProgramFeedbackFieldsA, range: [2, 4] },
  { id: 'feedback-3', title: 'Program Feedback Scale', part: 'Part 3 of 3', timing: 'Post', Fields: ProgramFeedbackFieldsB },
]
