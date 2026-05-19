// Pretest — paginated sandbox rendering of the locked Belonging pretest
// (Pretest Draft Belongingness_5.2.26.docx, confirmed final by Josh
// 2026-05-11). Lives on /demo/sandbox/pretest so reviewers can see
// exactly how the form will paginate and feel in a real participant
// session before posttest + follow-up are wired up.
//
// 29 items across 7 scales + 6 demographics. Save payload is FLAT and
// keyed by the SPSS column names defined in Draft 6's naming convention
// (e.g. age, sex, race_white, pre_bhs_1, pre_ucla_3, pre_bw_2). That
// shape is what the export pipeline already expects — keeping the
// pretest payload identical to the export columns means no recoding
// step between participant submission and analyst CSV.
//
// Slider items deliberately have no default value: the participant must
// drag (or tap) before the response counts as answered, matching the
// "explicit interaction required" line in the 2026-05-11 brief.

import { useState } from 'react'
import { PrimaryButton, GhostButton } from '../components/items/shared.jsx'

// ---------- Scale definitions ----------

const BHS_ANCHORS = [
  { v: 0, label: 'Absolutely disagree' },
  { v: 1, label: 'Somewhat disagree' },
  { v: 2, label: 'Somewhat agree' },
  { v: 3, label: 'Absolutely agree' },
]
const ASCS_ANCHORS = [
  { v: 1, label: 'Never' },
  { v: 2, label: 'Rarely' },
  { v: 3, label: 'Sometimes' },
  { v: 4, label: 'Often' },
  { v: 5, label: 'Always' },
]
const UCLA_ANCHORS = [
  { v: 1, label: 'Hardly ever' },
  { v: 2, label: 'Some of the time' },
  { v: 3, label: 'Often' },
]
const NB_ANCHORS = [
  { v: 1, label: 'Strongly disagree' },
  { v: 2, label: 'Moderately disagree' },
  { v: 3, label: 'Neither agree nor disagree' },
  { v: 4, label: 'Moderately agree' },
  { v: 5, label: 'Strongly agree' },
]
const BPB_ANCHORS = [
  { v: 0, label: 'Never' },
  { v: 1, label: 'Sometimes' },
  { v: 2, label: 'Often' },
  { v: 3, label: 'Always' },
]

const BHS_ITEMS = [
  { key: 'pre_bhs_1', text: 'I feel that my future is hopeless and that things will not improve.' },
  { key: 'pre_bhs_2', text: 'My future seems dark to me.' },
  { key: 'pre_bhs_3', text: "Things just won't work out the way I want them to." },
  { key: 'pre_bhs_4', text: 'There is no use in really trying to get something I want because I probably won\'t get it.' },
]
const ASCS_ITEMS = [
  { key: 'pre_ascs_1', text: 'If I decide to, I can make changes to get more control over how close I feel to other people in my life.' },
  { key: 'pre_ascs_2', text: 'I am able to act in ways that help me feel close to people in my life.' },
  { key: 'pre_ascs_3', text: 'I have the skills and ability to improve how close I get to people in my life.' },
]
const UCLA_ITEMS = [
  { key: 'pre_ucla_1', text: 'How often do you feel that you lack companionship?' },
  { key: 'pre_ucla_2', text: 'How often do you feel left out?' },
  { key: 'pre_ucla_3', text: 'How often do you feel isolated from others?' },
]
const NB_ITEMS = [
  { key: 'pre_nb_1', text: "If other people don't seem to accept me, I don't let it bother me." },
  { key: 'pre_nb_2', text: 'I seldom (hardly ever) worry about whether other people care about me.' },
  { key: 'pre_nb_3', text: 'My feelings are easily hurt when I feel that others do not accept me.' },
]
const BPB_ITEMS = [
  { key: 'pre_bpb_1', text: 'Pay really close attention to what someone is saying to you without letting yourself get distracted (like not checking your phone while they are speaking)?' },
  { key: 'pre_bpb_2', text: 'Use words like "we" or "us" or "our group" that make people feel included?' },
  { key: 'pre_bpb_3', text: 'Say "Thank You" and/or tell others when they do something you appreciate?' },
  { key: 'pre_bpb_4', text: 'Help someone out when they need it?' },
  { key: 'pre_bpb_5', text: 'Invite others (like family members and friends) to spend time with you?' },
  { key: 'pre_bpb_6', text: 'Include others in conversations and/or invite them to join in your activities (like watching a movie together, going for a walk, or playing a game)?' },
  { key: 'pre_bpb_7', text: 'Talk through a disagreement with someone until you find an answer that works for everyone?' },
]

const RACE_OPTIONS = [
  { key: 'race_white',   label: 'White' },
  { key: 'race_black',   label: 'Black/African American' },
  { key: 'race_amind',   label: 'American Indian' },
  { key: 'race_alaskan', label: 'Alaska Native' },
  { key: 'race_pi',      label: 'Pacific Islander' },
  { key: 'race_asian',   label: 'Asian' },
  { key: 'race_pna',     label: 'Prefer not to answer' },
  { key: 'race_dunno',   label: "I don't know" },
]

// 10-screen flow. Each screen knows how to validate itself and which
// keys it owns; that keeps the master Pretest component small.
const SCREENS = [
  { id: 'intro', label: 'Welcome' },
  { id: 'demographics', label: 'About you' },
  { id: 'bhs', label: 'How you feel' },
  { id: 'ascs', label: 'Your sense of control' },
  { id: 'ucla', label: 'Connection' },
  { id: 'nb', label: 'Belonging beliefs' },
  { id: 'bpb', label: 'How often you do these' },
  { id: 'bw', label: 'Belonging worries' },
  { id: 'pe', label: 'Program expectation' },
  { id: 'submit', label: 'Submit' },
]

// ---------- Reusable item renderers ----------

function LikertItem({ prompt, anchors, value, onChange }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
      <div className="text-[15px] leading-relaxed text-slate-800 mb-3">{prompt}</div>
      <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${anchors.length}, minmax(0, 1fr))` }}>
        {anchors.map((a) => {
          const selected = value === a.v
          return (
            <button
              key={a.v}
              type="button"
              onClick={() => onChange(a.v)}
              aria-pressed={selected}
              className={
                'min-h-[56px] rounded-2xl border text-center px-1 py-2 transition-colors flex flex-col items-center justify-center ' +
                (selected
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300')
              }
            >
              <span className="text-[16px] font-semibold leading-none">{a.v}</span>
              <span className={'text-[10px] leading-tight mt-1 ' + (selected ? 'text-amber-50' : 'text-slate-500')}>
                {a.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SliderItem({ prompt, min, max, anchors, value, touched, onChange }) {
  // `touched` is hoisted up so the parent can use it for validation.
  // Until touched, we render the thumb at the middle of the track but
  // visually mute the indicator and show a "Drag the slider" hint
  // so participants don't accidentally submit the default.
  const displayValue = touched ? value : Math.round((min + max) / 2)
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4">
      <div className="text-[15px] leading-relaxed text-slate-800 mb-4">{prompt}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={displayValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className={
          'w-full h-2 rounded-full appearance-none cursor-pointer ' +
          (touched ? 'accent-amber-500' : 'accent-slate-300')
        }
      />
      <div className="flex justify-between mt-1 text-[11px] text-slate-500">
        {anchors.map((a, i) => (
          <span key={i}>{a}</span>
        ))}
      </div>
      <div className="text-center mt-3 text-[14px]">
        {touched ? (
          <span className="font-semibold text-amber-800">{value}</span>
        ) : (
          <span className="text-slate-400 italic">Drag the slider to choose.</span>
        )}
      </div>
    </div>
  )
}

function NumberInput({ prompt, value, onChange, min, max, hint }) {
  return (
    <div className="mb-4">
      <label className="block text-[15px] text-slate-800 mb-2">{prompt}</label>
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value
          if (raw === '') return onChange(null)
          const n = Number(raw)
          if (Number.isNaN(n)) return
          onChange(n)
        }}
        min={min}
        max={max}
        className="w-full max-w-[140px] text-[16px] px-4 py-3 min-h-[48px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
      />
      {hint && <p className="text-[12px] text-slate-500 mt-1">{hint}</p>}
    </div>
  )
}

function RadioGroup({ prompt, options, value, onChange }) {
  return (
    <div className="mb-4">
      <div className="text-[15px] text-slate-800 mb-2">{prompt}</div>
      <div className="flex flex-col gap-2">
        {options.map((o) => {
          const selected = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={selected}
              className={
                'text-left rounded-2xl border min-h-[48px] px-4 py-2 text-[15px] transition-colors ' +
                (selected
                  ? 'bg-amber-200 border-amber-400 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300')
              }
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CheckboxGroup({ prompt, options, values, onToggle }) {
  return (
    <div className="mb-4">
      <div className="text-[15px] text-slate-800 mb-2">{prompt}</div>
      <div className="flex flex-col gap-2">
        {options.map((o) => {
          const checked = values[o.key] === 1
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onToggle(o.key)}
              aria-pressed={checked}
              className={
                'text-left rounded-2xl border min-h-[44px] px-4 py-2 text-[14px] flex items-center gap-3 transition-colors ' +
                (checked
                  ? 'bg-amber-100 border-amber-400 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300')
              }
            >
              <span
                className={
                  'inline-flex items-center justify-center rounded-md w-5 h-5 border-2 flex-shrink-0 ' +
                  (checked ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300')
                }
              >
                {checked ? '✓' : ''}
              </span>
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------- Main component ----------

export default function Pretest({ onSave = console.log }) {
  const [screenIdx, setScreenIdx] = useState(0)
  const [data, setData] = useState(() => {
    const init = {}
    // Initialize all checkbox-style race columns to 0 so the save payload
    // always has a stable shape.
    for (const r of RACE_OPTIONS) init[r.key] = 0
    return init
  })
  // Slider-touched tracking, separate from values so we can detect
  // "drag the slider" without overloading the value with sentinel values.
  const [touched, setTouched] = useState({}) // { pre_bw_1: bool, pre_bw_2: bool, pre_pe_1: bool }
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const screen = SCREENS[screenIdx]
  const isFirst = screenIdx === 0
  const isLast = screenIdx === SCREENS.length - 1

  function setField(key, value) {
    setData((prev) => ({ ...prev, [key]: value }))
  }
  function toggleRace(key) {
    setData((prev) => ({ ...prev, [key]: prev[key] === 1 ? 0 : 1 }))
  }
  function setSlider(key, value) {
    setField(key, value)
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  // Per-screen validation — gates the Continue button.
  function canAdvance() {
    switch (screen.id) {
      case 'intro':
        return true
      case 'demographics': {
        const numericOk = (v) => typeof v === 'number' && !Number.isNaN(v)
        const raceAny = RACE_OPTIONS.some((r) => data[r.key] === 1)
        return (
          numericOk(data.age) &&
          [1, 2, 3].includes(data.sex) &&
          raceAny &&
          [0, 1].includes(data.hispanic) &&
          numericOk(data.grade) &&
          numericOk(data.home_years) &&
          numericOk(data.home_months)
        )
      }
      case 'bhs':
        return BHS_ITEMS.every((it) => typeof data[it.key] === 'number')
      case 'ascs':
        return ASCS_ITEMS.every((it) => typeof data[it.key] === 'number')
      case 'ucla':
        return UCLA_ITEMS.every((it) => typeof data[it.key] === 'number')
      case 'nb':
        return NB_ITEMS.every((it) => typeof data[it.key] === 'number')
      case 'bpb':
        return BPB_ITEMS.every((it) => typeof data[it.key] === 'number')
      case 'bw': {
        // pre_bw_1 must be touched. pre_bw_2 only if pre_bw_1 > 0.
        if (!touched.pre_bw_1) return false
        if ((data.pre_bw_1 || 0) === 0) return true // conditional skip
        return !!touched.pre_bw_2
      }
      case 'pe':
        return !!touched.pre_pe_1
      case 'submit':
        return true
      default:
        return false
    }
  }

  function next() {
    if (!canAdvance()) return
    if (isLast) return
    setScreenIdx((i) => i + 1)
    // Scroll to top so the kid lands on the new section's heading,
    // not somewhere down the previous screen.
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function back() {
    if (isFirst) return
    setScreenIdx((i) => i - 1)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const payload = {
        activity: 'pretest',
        // Demographics
        age: data.age,
        sex: data.sex,
        race_white: data.race_white,
        race_black: data.race_black,
        race_amind: data.race_amind,
        race_alaskan: data.race_alaskan,
        race_pi: data.race_pi,
        race_asian: data.race_asian,
        race_pna: data.race_pna,
        race_dunno: data.race_dunno,
        hispanic: data.hispanic,
        grade: data.grade,
        home_years: data.home_years,
        home_months: data.home_months,
        // Beck Hopelessness (0–3)
        pre_bhs_1: data.pre_bhs_1,
        pre_bhs_2: data.pre_bhs_2,
        pre_bhs_3: data.pre_bhs_3,
        pre_bhs_4: data.pre_bhs_4,
        // Adolescent Sense of Control (1–5)
        pre_ascs_1: data.pre_ascs_1,
        pre_ascs_2: data.pre_ascs_2,
        pre_ascs_3: data.pre_ascs_3,
        // UCLA 3-item (1–3)
        pre_ucla_1: data.pre_ucla_1,
        pre_ucla_2: data.pre_ucla_2,
        pre_ucla_3: data.pre_ucla_3,
        // Need to Belong (1–5)
        pre_nb_1: data.pre_nb_1,
        pre_nb_2: data.pre_nb_2,
        pre_nb_3: data.pre_nb_3,
        // Belonging Promoting Behaviors (0–3)
        pre_bpb_1: data.pre_bpb_1,
        pre_bpb_2: data.pre_bpb_2,
        pre_bpb_3: data.pre_bpb_3,
        pre_bpb_4: data.pre_bpb_4,
        pre_bpb_5: data.pre_bpb_5,
        pre_bpb_6: data.pre_bpb_6,
        pre_bpb_7: data.pre_bpb_7,
        // Belonging Worries (0–10 sliders); conditional skip of Q2
        pre_bw_1: data.pre_bw_1,
        pre_bw_2: (data.pre_bw_1 || 0) === 0 ? null : data.pre_bw_2,
        // Program Expectation (1–10)
        pre_pe_1: data.pre_pe_1,
        saved_at: new Date().toISOString(),
      }
      await onSave(payload)
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <h2 className="text-[24px] font-semibold mb-3">Thanks — your responses are saved.</h2>
      </div>
    )
  }

  return (
    <div>
      {/* Progress strip */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] text-slate-500 uppercase tracking-wide">
            Step {screenIdx + 1} of {SCREENS.length}
          </span>
          <span className="text-[12px] text-slate-500">{screen.label}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all"
            style={{ width: `${((screenIdx + 1) / SCREENS.length) * 100}%` }}
          />
        </div>
      </div>

      <ScreenBody
        screen={screen}
        data={data}
        touched={touched}
        setField={setField}
        toggleRace={toggleRace}
        setSlider={setSlider}
      />

      <div className="flex items-center justify-between mt-4">
        {!isFirst ? (
          <GhostButton onClick={back}>← Back</GhostButton>
        ) : (
          <span />
        )}
        {screen.id === 'submit' ? (
          <PrimaryButton onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving…' : 'Submit'}
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={next} disabled={!canAdvance()}>
            {isFirst ? 'Begin →' : 'Continue →'}
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}

function ScreenBody({ screen, data, touched, setField, toggleRace, setSlider }) {
  switch (screen.id) {
    case 'intro':
      return (
        <div>
          <h2 className="text-[22px] font-semibold mb-3">Welcome</h2>
          <div className="text-[15px] leading-relaxed text-slate-800 space-y-3">
            <p>
              Thank you for joining our project! We want to learn what helps
              kids and teens feel like they belong with their families and in
              their communities.
            </p>
            <p>
              We will ask you some questions before and after you watch some
              videos and complete some activities. Some of these questions
              might ask about feelings that are hard to talk about. If you
              feel upset and want to talk to someone, please tell your
              caregiver or email us at sprang@uky.edu. By completing the
              program today, you will receive a $25 e-gift card as a thank
              you. We&apos;re so glad you&apos;re working with us!
            </p>
          </div>
        </div>
      )

    case 'demographics':
      return (
        <div>
          <h2 className="text-[20px] font-semibold mb-3">About you</h2>
          <p className="text-[14px] text-slate-600 mb-5">
            A few quick questions before we get started.
          </p>
          <NumberInput
            prompt="How old are you?"
            value={data.age ?? null}
            onChange={(v) => setField('age', v)}
            min={1}
            max={99}
          />
          <RadioGroup
            prompt="What is your sex?"
            options={[
              { value: 1, label: 'Female' },
              { value: 2, label: 'Male' },
              { value: 3, label: 'Prefer not to answer' },
            ]}
            value={data.sex}
            onChange={(v) => setField('sex', v)}
          />
          <CheckboxGroup
            prompt="What race do you consider yourself (choose all that apply)?"
            options={RACE_OPTIONS}
            values={data}
            onToggle={toggleRace}
          />
          <RadioGroup
            prompt="Are you Hispanic or Latino?"
            options={[
              { value: 0, label: 'No' },
              { value: 1, label: 'Yes' },
            ]}
            value={data.hispanic}
            onChange={(v) => setField('hispanic', v)}
          />
          <NumberInput
            prompt="What grade are you currently in at school?"
            value={data.grade ?? null}
            onChange={(v) => setField('grade', v)}
            min={1}
            max={12}
          />
          <div className="mb-4">
            <div className="text-[15px] text-slate-800 mb-2">
              How long have you lived in your current home?
            </div>
            <div className="flex gap-4 flex-wrap">
              <NumberInput
                prompt="Years"
                value={data.home_years ?? null}
                onChange={(v) => setField('home_years', v)}
                min={0}
                max={20}
              />
              <NumberInput
                prompt="Months"
                value={data.home_months ?? null}
                onChange={(v) => setField('home_months', v)}
                min={0}
                max={11}
              />
            </div>
          </div>
        </div>
      )

    case 'bhs':
      return (
        <ScaleScreen
          heading="How you feel right now"
          stem="Please share how you are feeling right now, at this moment."
          items={BHS_ITEMS}
          anchors={BHS_ANCHORS}
          data={data}
          setField={setField}
        />
      )

    case 'ascs':
      return (
        <ScaleScreen
          heading="Your sense of control"
          stem="Below are several statements that may apply to you. There are no right or wrong answers or trick questions. Based on your understanding of the question, select how often this applies to you."
          items={ASCS_ITEMS}
          anchors={ASCS_ANCHORS}
          data={data}
          setField={setField}
        />
      )

    case 'ucla':
      return (
        <ScaleScreen
          heading="Connection"
          stem="Please answer the following:"
          items={UCLA_ITEMS}
          anchors={UCLA_ANCHORS}
          data={data}
          setField={setField}
        />
      )

    case 'nb':
      return (
        <ScaleScreen
          heading="Belonging beliefs"
          stem="For each of the statements below, indicate the degree to which you agree or disagree with the statement using the scale below."
          items={NB_ITEMS}
          anchors={NB_ANCHORS}
          data={data}
          setField={setField}
        />
      )

    case 'bpb':
      return (
        <ScaleScreen
          heading="How often you do these"
          stem="How often do you:"
          items={BPB_ITEMS}
          anchors={BPB_ANCHORS}
          data={data}
          setField={setField}
        />
      )

    case 'bw': {
      const q1 = data.pre_bw_1
      const skipQ2 = touched.pre_bw_1 && q1 === 0
      return (
        <div>
          <h2 className="text-[20px] font-semibold mb-3">Belonging worries</h2>
          <SliderItem
            prompt="To what degree do you have worries about belonging (e.g., fitting in, being understood or accepted)?"
            min={0}
            max={10}
            anchors={['Not at all', 'Moderately', 'A lot']}
            value={data.pre_bw_1 ?? 5}
            touched={!!touched.pre_bw_1}
            onChange={(v) => setSlider('pre_bw_1', v)}
          />
          {skipQ2 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] text-slate-600 italic">
              Since you said you don&apos;t have worries about belonging right
              now, we&apos;ll skip the next question.
            </div>
          ) : (
            <SliderItem
              prompt="To what degree do your worries about belonging interfere with your desire to stay in your current home?"
              min={0}
              max={10}
              anchors={['Not at all', 'Moderately', 'A lot']}
              value={data.pre_bw_2 ?? 5}
              touched={!!touched.pre_bw_2}
              onChange={(v) => setSlider('pre_bw_2', v)}
            />
          )}
        </div>
      )
    }

    case 'pe':
      return (
        <div>
          <h2 className="text-[20px] font-semibold mb-3">Program expectation</h2>
          <p className="text-[14px] text-slate-600 mb-4">
            Please rate the following sentence based on how you feel at this moment.
          </p>
          <SliderItem
            prompt="At this point, how helpful do you think this program will be for helping you feel close to your family and friends?"
            min={1}
            max={10}
            anchors={['Not at all', 'Somewhat', 'Very Much']}
            value={data.pre_pe_1 ?? 5}
            touched={!!touched.pre_pe_1}
            onChange={(v) => setSlider('pre_pe_1', v)}
          />
        </div>
      )

    case 'submit':
      return (
        <div>
          <h2 className="text-[22px] font-semibold mb-3">All done with the pretest</h2>
          <p className="text-[15px] leading-relaxed text-slate-700 mb-4">
            Tap Submit when you&apos;re ready.
          </p>
        </div>
      )

    default:
      return null
  }
}

function ScaleScreen({ heading, stem, items, anchors, data, setField }) {
  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-2">{heading}</h2>
      <p className="text-[14px] text-slate-600 mb-4 italic">{stem}</p>
      {items.map((it) => (
        <LikertItem
          key={it.key}
          prompt={it.text}
          anchors={anchors}
          value={data[it.key]}
          onChange={(v) => setField(it.key, v)}
        />
      ))}
    </div>
  )
}

