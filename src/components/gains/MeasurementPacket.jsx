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
// with Continue always visible (no scrolling inside the frame), and the
// therapy-history follow-ups became conditional pages (`skip` when off the
// tester's branch, `gate` holding Continue until the deciding answer).
//
// Same day, Josh: that landed at 24 Continues on the pre-test, "way too
// many" -- halve it. The rated scales now use ScaleMatrix (the paper-form
// layout: response options as column headers once, one row of circles per
// item), which is about half the height of a button per option per item,
// and the per-page header is compact (title + badge on one line). CTS runs
// three items per page and Beck-4 two (six / four on one page overflow a
// 375px-wide frame), the 6-point scales three items per page, the
// readiness ruler two per page, the trauma-event question rides with the
// first Demographics page, and the two conditional therapy follow-ups
// share one page. Pre-test: 14 Continues (15 on the past-therapy branch);
// post-test: 10. Item wording and order are unchanged throughout.

import RadioList from './ds/RadioList.jsx'
import CheckboxList from './ds/CheckboxList.jsx'
import LikertScale from './ds/LikertScale.jsx'
import ScaleMatrix from './ds/ScaleMatrix.jsx'
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

// 2026-09-03 (Josh): no scale names or timing badges on the pages -- the
// teen just sees the instructions (when an instrument has them) and the
// items. `title`/`timing` stay on the page objects for the reviewer-facing
// data and the CSV later, they're just not rendered here.
export function Instrument({ prompt, children }) {
  return (
    <div
      className="rounded-[24px] p-3.5"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-soft)', backdropFilter: 'var(--blur-panel)', boxShadow: 'var(--shadow-md)' }}
    >
      {prompt && (
        <p className="text-[12px] italic mb-2 leading-snug" style={{ color: 'var(--text-muted)' }}>
          {prompt}
        </p>
      )}
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

// `missing` marks a question the tester tried to skip: warm-coral text and
// edge, plus a one-line nudge, until it's answered.
function Item({ n, text, children, missing = false }) {
  return (
    <div
      data-missing={missing || undefined}
      style={missing ? { borderLeft: '3px solid var(--coral-400)', paddingLeft: 8, marginLeft: -11, borderRadius: 4 } : undefined}
    >
      <p className="text-[13px] leading-snug mb-1" style={{ color: missing ? 'var(--coral-400)' : 'var(--text-bright)' }}>
        {n != null && <span style={{ color: missing ? 'var(--coral-400)' : 'var(--text-warm)' }}>{n}. </span>}
        {text}
      </p>
      {children}
      {missing && (
        <p className="text-[11px] mt-1 font-semibold" style={{ color: 'var(--coral-400)' }}>
          Please answer this question.
        </p>
      )}
    </div>
  )
}

// Item keys `${prefix}_${i}` for i in [from, to).
function keysFor(prefix, from, to) {
  return Array.from({ length: to - from }, (_, k) => `${prefix}_${from + k}`)
}

// ---------- one field-set per instrument ----------

// Demographics spans three pages (Draft 71); same five items, same order.
// The trauma-event question (its own instrument in the source packet, and
// still shown as such via the Instrument that follows on the page) rides
// on the first Demographics page so it doesn't cost its own Continue.
function DemographicsFieldsA({ v, set, missing = [] }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Item n={null} text="What is your current age?" missing={missing.includes('age')}>
          <TextInput value={v.age || ''} onChange={set('age')} placeholder="Age" inputMode="numeric" />
        </Item>
        <Item n={null} text="What grade are you in?" missing={missing.includes('grade')}>
          <TextInput value={v.grade || ''} onChange={set('grade')} placeholder="Grade" />
        </Item>
      </div>
      <div className="pt-3 mt-1" style={{ borderTop: '1px solid var(--border-soft)' }}>
        <TraumaTimingFields v={v} set={set} missing={missing} />
      </div>
    </>
  )
}

function DemographicsFieldsB({ v, set, missing = [] }) {
  return (
    <Item n={null} text="Choose one or more races that you consider yourself to be." missing={missing.includes('race')}>
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

function DemographicsFieldsC({ v, set, missing = [] }) {
  return (
    <>
      <Item n={null} text="Are you of Spanish, Hispanic, or Latino origin?" missing={missing.includes('hispanic')}>
        <RadioList name="Hispanic/Latino origin" options={YES_NO} value={v.hispanic} onChange={set('hispanic')} columns={2} />
      </Item>
      <Item n={null} text="Please select your sex." missing={missing.includes('sex')}>
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

function TraumaTimingFields({ v, set, missing = [] }) {
  return (
    <Item
      n={null}
      text="Sometimes scary or very upsetting things happen to people where they feel like their life or the life of someone close to them is in danger (like being hurt, seeing someone else hurt, being in a car accident, or not getting food or having a safe place to live). These things are called trauma experiences. When was the LAST time something like this happened to you?"
      missing={missing.includes('trauma_months')}
    >
      <div className="flex gap-2">
        <TextInput value={v.trauma_months || ''} onChange={set('trauma_months')} placeholder="Months" inputMode="numeric" />
        <TextInput value={v.trauma_years || ''} onChange={set('trauma_years')} placeholder="Years" inputMode="numeric" />
      </div>
    </Item>
  )
}

// The rated scales render as a ScaleMatrix (see its header). `matrix`
// adapts the page's `set(key)(value)` to the matrix's `onChange(key, value)`.
const matrixChange = (set) => (key, value) => set(key)(value)

function CTSFields({ v, set, range, missing }) {
  const items = sliced(CTS_ITEMS, range).map(([item]) => ({ key: `cts_${item.n}`, n: item.n, text: item.text }))
  return <ScaleMatrix name="Child Trauma Screen" items={items} options={CTS_SCALE} values={v} onChange={matrixChange(set)} missing={missing} />
}

// Therapy history spans up to three pages (Draft 71): the current-therapy
// question with its follow-up; then -- only when the answer is "no" -- the
// past-therapy question with "when"; then -- only when past therapy is
// "yes" -- whether trauma came up. Pages not on the tester's branch are
// skipped (see PRE_TEST_PAGES). Same questions, same branching, same order.
function TherapyCurrentFields({ v, set, missing = [] }) {
  return (
    <>
      <Item n={null} text="Are you currently talking to a mental health therapist about any stressful issues in your life or for any reason?" missing={missing.includes('therapy_current')}>
        <RadioList name="Currently in therapy" options={YES_NO} value={v.therapy_current} onChange={set('therapy_current')} columns={2} />
      </Item>

      {v.therapy_current === 'yes' && (
        <Item n={null} text="Are you talking with your therapist about any traumatic experiences you have had?" missing={missing.includes('therapy_current_trauma')}>
          <RadioList name="Discussing trauma with current therapist" options={YES_NO} value={v.therapy_current_trauma} onChange={set('therapy_current_trauma')} columns={2} />
        </Item>
      )}
    </>
  )
}

// The past-therapy question and both of its follow-ups share one page (only
// shown when the tester isn't currently in therapy).
function TherapyPastFields({ v, set, missing = [] }) {
  return (
    <>
      <Item n={null} text="Have you ever talked to a mental health therapist in the past?" missing={missing.includes('therapy_past')}>
        <RadioList name="Past therapy" options={YES_NO} value={v.therapy_past} onChange={set('therapy_past')} columns={2} />
      </Item>
      {v.therapy_past === 'yes' && (
        <>
          <Item n={null} text="When was the last time you were in therapy?" missing={missing.includes('therapy_past_when')}>
            <RadioList name="Last time in therapy" options={THERAPY_TIMING_OPTIONS} value={v.therapy_past_when} onChange={set('therapy_past_when')} columns={2} />
          </Item>
          <Item n={null} text="Did you talk with your therapist about any traumatic experiences you have had?" missing={missing.includes('therapy_past_trauma')}>
            <RadioList name="Discussed trauma with past therapist" options={YES_NO} value={v.therapy_past_trauma} onChange={set('therapy_past_trauma')} columns={2} />
          </Item>
        </>
      )}
    </>
  )
}

function Beck4Fields({ v, set, range, missing }) {
  const items = sliced(BECK4_ITEMS, range).map(([text, i]) => ({ key: `beck_${i}`, n: i + 1, text }))
  return <ScaleMatrix name="Beck Hopelessness Scale-4" items={items} options={BECK4_SCALE} values={v} onChange={matrixChange(set)} missing={missing} />
}

// The readiness ruler spans two pages: two 10-point rulers, then the third
// with its reason.
function MotivationFieldsA({ v, set, missing = [] }) {
  return (
    <>
      <Item n={null} text="At this moment, how ready are you to work towards dealing with any of the difficulties you may have related to your trauma experiences?" missing={missing.includes('motiv_ready')}>
        <LikertScale name="Readiness" count={10} value={v.motiv_ready} onChange={set('motiv_ready')} />
      </Item>
      <Item n={null} text="At this moment, how confident are you in your ability to improve those difficulties related to your trauma experiences?" missing={missing.includes('motiv_confidence')}>
        <LikertScale name="Confidence" count={10} value={v.motiv_confidence} onChange={set('motiv_confidence')} />
      </Item>
    </>
  )
}

function MotivationFieldsB({ v, set, missing = [] }) {
  return (
    <>
      <Item n={null} text="How helpful do you think trauma therapy would be for you?" missing={missing.includes('motiv_helpful')}>
        <LikertScale name="Helpfulness" count={10} value={v.motiv_helpful} onChange={set('motiv_helpful')} />
      </Item>
      <Item n={null} text="What is the reason for your response/rating." missing={missing.includes('motiv_reason')}>
        <TextArea value={v.motiv_reason || ''} onChange={set('motiv_reason')} placeholder="Type your answer" />
      </Item>
    </>
  )
}

const SIX_POINT = [1, 2, 3, 4, 5, 6].map((n) => ({ value: n, label: String(n) }))
const FIVE_POINT_FROM_ZERO = [0, 1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }))

function ImplicitTheoriesFields({ v, set, range, missing }) {
  const items = sliced(IMPLICIT_THEORIES_ITEMS, range).map(([text, i]) => ({ key: `implicit_${i}`, n: i + 1, text }))
  return (
    <ScaleMatrix
      name="Implicit Theories of Emotion"
      items={items}
      options={SIX_POINT}
      minLabel="Strongly disagree"
      maxLabel="Strongly agree"
      values={v}
      onChange={matrixChange(set)}
      missing={missing}
    />
  )
}

function TraumaBeliefsFields({ v, set, range, missing }) {
  const items = sliced(TRAUMA_BELIEFS_ITEMS, range).map(([item, i]) => ({
    key: `beliefs_${i}`,
    n: i + 1,
    text: item.reverse ? `${item.text} (reverse scored)` : item.text,
  }))
  return (
    <ScaleMatrix
      name="Trauma and Treatment Beliefs"
      items={items}
      options={SIX_POINT}
      minLabel="Strongly disagree"
      maxLabel="Strongly agree"
      values={v}
      onChange={matrixChange(set)}
      missing={missing}
    />
  )
}

// The Program Feedback Scale spans two pages: the four rated items, then
// the two open questions.
function ProgramFeedbackFieldsA({ v, set, missing }) {
  const items = PROGRAM_FEEDBACK_ITEMS.map((text, i) => ({ key: `feedback_${i}`, n: i + 1, text }))
  return (
    <ScaleMatrix
      name="Program Feedback Scale"
      items={items}
      options={FIVE_POINT_FROM_ZERO}
      minLabel="Really disagree"
      maxLabel="Really agree"
      values={v}
      onChange={matrixChange(set)}
      missing={missing}
    />
  )
}

function ProgramFeedbackFieldsB({ v, set, missing = [] }) {
  return (
    <>
      <Item n={5} text="What did you like about the program? Please share as many true thoughts and feelings as you would like." missing={missing.includes('feedback_like')}>
        <TextArea value={v.feedback_like || ''} onChange={set('feedback_like')} placeholder="Type your answer" />
      </Item>
      <Item n={6} text="What would you change about the program? Please share as many true thoughts and feelings as you would like." missing={missing.includes('feedback_change')}>
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
// A page may carry `range` (the slice of the instrument's items on this
// page), `skip(v)` (drop the page for this branch) and `required(v)` (the
// item keys that must be answered before Continue advances -- branch-aware;
// an entry may be an array of alternatives, any one of which satisfies it).
// `title`/`timing` identify the instrument for reviewers and the CSV; they
// are not shown to the teen. Pre-test: 14 pages (15 on the past-therapy
// branch). Post-test: 10.

const CTS_PROMPT = 'How often did each of these happen in the last 30 days?'
const BECK4_PROMPT = 'Please share how you are feeling, right now, at this moment.'
const ctsKeys = (from, to) => CTS_ITEMS.slice(from, to).map((i) => `cts_${i.n}`)

export const PRE_TEST_PAGES = [
  { id: 'demographics-1', title: 'Demographics', timing: 'Pre', Fields: DemographicsFieldsA, required: () => ['age', 'grade', ['trauma_months', 'trauma_years']] },
  { id: 'demographics-2', title: 'Demographics', timing: 'Pre', Fields: DemographicsFieldsB, required: () => [['race', 'race_other']] },
  { id: 'demographics-3', title: 'Demographics', timing: 'Pre', Fields: DemographicsFieldsC, required: () => ['hispanic', ['sex', 'sex_other']] },
  // Three CTS items per page (six on one page overflows a 375px frame).
  { id: 'cts-1', title: 'Child Trauma Screen (CTS) — Reactions Subscale', timing: 'Pre', prompt: CTS_PROMPT, Fields: CTSFields, range: [0, 3], required: () => ctsKeys(0, 3) },
  { id: 'cts-2', title: 'Child Trauma Screen (CTS) — Reactions Subscale', timing: 'Pre', prompt: CTS_PROMPT, Fields: CTSFields, range: [3, 6], required: () => ctsKeys(3, 6) },
  // The follow-up page is skipped when the tester is currently in therapy;
  // the follow-up questions are required only when their branch is open.
  {
    id: 'therapy-current',
    title: 'Therapy history (present & past)',
    timing: 'Pre',
    Fields: TherapyCurrentFields,
    required: (v) => ['therapy_current', ...(v.therapy_current === 'yes' ? ['therapy_current_trauma'] : [])],
  },
  {
    id: 'therapy-past',
    title: 'Therapy history (present & past)',
    timing: 'Pre',
    Fields: TherapyPastFields,
    skip: (v) => v.therapy_current !== 'no',
    required: (v) => ['therapy_past', ...(v.therapy_past === 'yes' ? ['therapy_past_when', 'therapy_past_trauma'] : [])],
  },
  // Two Beck-4 items per page (the four together overflow a 375px frame).
  { id: 'beck4-1', title: 'Beck Hopelessness Scale-4', timing: 'Pre + Post', prompt: BECK4_PROMPT, Fields: Beck4Fields, range: [0, 2], required: () => keysFor('beck', 0, 2) },
  // (The source doc's "Scored by summing all 4 items." is scoring guidance
  // for us, not for the teen -- not shown on the page, per Josh 2026-09-03.)
  { id: 'beck4-2', title: 'Beck Hopelessness Scale-4', timing: 'Pre + Post', prompt: BECK4_PROMPT, Fields: Beck4Fields, range: [2, 4], required: () => keysFor('beck', 2, 4) },
  { id: 'motivation-1', title: 'Motivation / Readiness to Change Ruler', timing: 'Pre + Post', Fields: MotivationFieldsA, required: () => ['motiv_ready', 'motiv_confidence'] },
  { id: 'motivation-2', title: 'Motivation / Readiness to Change Ruler', timing: 'Pre + Post', Fields: MotivationFieldsB, required: () => ['motiv_helpful', 'motiv_reason'] },
  { id: 'implicit-1', title: 'Implicit Theories of Emotion Scale – Child Version', timing: 'Pre + Post', Fields: ImplicitTheoriesFields, range: [0, 3], required: () => keysFor('implicit', 0, 3) },
  { id: 'implicit-2', title: 'Implicit Theories of Emotion Scale – Child Version', timing: 'Pre + Post', Fields: ImplicitTheoriesFields, range: [3, 6], required: () => keysFor('implicit', 3, 6) },
  { id: 'beliefs-1', title: 'Trauma and Treatment Beliefs', timing: 'Pre + Post', Fields: TraumaBeliefsFields, range: [0, 3], required: () => keysFor('beliefs', 0, 3) },
  { id: 'beliefs-2', title: 'Trauma and Treatment Beliefs', timing: 'Pre + Post', Fields: TraumaBeliefsFields, range: [3, 6], required: () => keysFor('beliefs', 3, 6) },
]

export const POST_TEST_PAGES = [
  ...PRE_TEST_PAGES.filter((p) => p.timing === 'Pre + Post'),
  { id: 'feedback-1', title: 'Program Feedback Scale', timing: 'Post', Fields: ProgramFeedbackFieldsA, required: () => keysFor('feedback', 0, 4) },
  { id: 'feedback-2', title: 'Program Feedback Scale', timing: 'Post', Fields: ProgramFeedbackFieldsB, required: () => ['feedback_like', 'feedback_change'] },
]
