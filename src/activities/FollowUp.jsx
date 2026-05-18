// FollowUp Survey — paginated sandbox rendering of the locked 90-day
// follow-up survey (Final Measures/FollowUp Survey Draft
// Belongingness_5.2.26.docx, confirmed 2026-05-18). Lives on
// /demo/sandbox/followup.
//
// 30 items across 9 sections + intro + submit. Save payload is FLAT
// and keyed by the SPSS column names (`fu_*` prefix). Items shared
// with the Pretest (BHS / ASCS / UCLA / NB / BPB / BW) use identical
// wording + anchors so within-subject change scores work; appraisal
// items (6) are imported from `src/lib/appraisals.js` so they're
// identical to the Getting Unstuck intervention activity (Draft 15).
//
// Two items are unique to the follow-up: permanency (radio with
// Other-text) and placement-disruption-worry (0-4 likert).

import { useState } from 'react'
import { PrimaryButton, GhostButton } from '../components/items/shared.jsx'
import {
  LikertItem,
  SliderItem,
  ScaleScreen,
  RadioGroup,
  ProgressStrip,
} from '../components/survey/SurveyItems.jsx'
import { APPRAISAL_ITEMS, APPRAISAL_SCALE } from '../lib/appraisals.js'

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
// Disruption worry — locked 0-4 likert with these anchors.
const DISRUPTION_ANCHORS = [
  { v: 0, label: 'Not at all' },
  { v: 1, label: 'A little' },
  { v: 2, label: 'Somewhat' },
  { v: 3, label: 'Very' },
  { v: 4, label: 'Extremely' },
]
// Appraisals anchors come from the shared module; convert to the
// `{ v, label }` shape LikertItem expects. Intermediate values 1, 2, 4
// are unlabeled.
const APP_ANCHORS = (() => {
  const { min, max, anchors } = APPRAISAL_SCALE
  const labeled = new Map(anchors.map((a) => [a.v, a.label]))
  const out = []
  for (let v = min; v <= max; v++) {
    out.push({ v, label: labeled.get(v) || '' })
  }
  return out
})()

const BHS_ITEMS = [
  { key: 'fu_bhs_1', text: 'I feel that my future is hopeless and that things will not improve.' },
  { key: 'fu_bhs_2', text: 'My future seems dark to me.' },
  { key: 'fu_bhs_3', text: "Things just won't work out the way I want them to." },
  { key: 'fu_bhs_4', text: 'There is no use in really trying to get something I want because I probably won\'t get it.' },
]
const ASCS_ITEMS = [
  { key: 'fu_ascs_1', text: 'If I decide to, I can make changes to get more control over how close I feel to other people in my life.' },
  { key: 'fu_ascs_2', text: 'I am able to act in ways that help me feel close to people in my life.' },
  { key: 'fu_ascs_3', text: 'I have the skills and ability to improve how close I get to people in my life.' },
]
const UCLA_ITEMS = [
  { key: 'fu_ucla_1', text: 'How often do you feel that you lack companionship?' },
  { key: 'fu_ucla_2', text: 'How often do you feel left out?' },
  { key: 'fu_ucla_3', text: 'How often do you feel isolated from others?' },
]
const NB_ITEMS = [
  { key: 'fu_nb_1', text: "If other people don't seem to accept me, I don't let it bother me." },
  { key: 'fu_nb_2', text: 'I seldom (hardly ever) worry about whether other people care about me.' },
  { key: 'fu_nb_3', text: 'My feelings are easily hurt when I feel that others do not accept me.' },
]
const BPB_ITEMS = [
  { key: 'fu_bpb_1', text: 'Pay really close attention to what someone is saying to you without letting yourself get distracted (like not checking your phone while they are speaking)?' },
  { key: 'fu_bpb_2', text: 'Use words like "we" or "us" or "our group" that make people feel included?' },
  { key: 'fu_bpb_3', text: 'Say "Thank You" and/or tell others when they do something you appreciate?' },
  { key: 'fu_bpb_4', text: 'Help someone out when they need it?' },
  { key: 'fu_bpb_5', text: 'Invite others (like family members and friends) to spend time with you?' },
  { key: 'fu_bpb_6', text: 'Include others in conversations and/or invite them to join in your activities (like watching a movie together, going for a walk, or playing a game)?' },
  { key: 'fu_bpb_7', text: 'Talk through a disagreement with someone until you find an answer that works for everyone?' },
]
// Appraisals — imported from the shared module and remapped to fu_*
// column names (a1..a6 → fu_app_1..fu_app_6).
const APP_ITEMS = APPRAISAL_ITEMS.map((it, i) => ({
  key: `fu_app_${i + 1}`,
  text: it.text,
}))

const PERMANENCY_OPTIONS = [
  { value: 'same_home',    label: 'Remained in the same home' },
  { value: 'new_foster',   label: 'Moved to a new foster home' },
  { value: 'birth_family', label: 'Returned to live with birth family' },
  { value: 'other',        label: 'Other (please specify)' },
]

const SCREENS = [
  { id: 'intro',  label: 'Welcome back' },
  { id: 'bhs',    label: 'How you feel' },
  { id: 'ascs',   label: 'Your sense of control' },
  { id: 'ucla',   label: 'Connection' },
  { id: 'nb',     label: 'Belonging beliefs' },
  { id: 'bpb',    label: 'How often you do these' },
  { id: 'app',    label: 'Thoughts about yourself, others, and the future' },
  { id: 'bw',     label: 'Belonging worries' },
  { id: 'perm',   label: 'Where you are living' },
  { id: 'disr',   label: 'How you feel about your placement' },
  { id: 'submit', label: 'Submit' },
]

export default function FollowUp({ onSave = console.log }) {
  const [screenIdx, setScreenIdx] = useState(0)
  const [data, setData] = useState({
    fu_permanency: null,
    fu_permanency_other: '',
  })
  const [touched, setTouched] = useState({}) // { fu_bw_1, fu_bw_2 }
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const screen = SCREENS[screenIdx]
  const isFirst = screenIdx === 0
  const isLast = screenIdx === SCREENS.length - 1

  function setField(key, value) {
    setData((prev) => ({ ...prev, [key]: value }))
  }
  function setSlider(key, value) {
    setField(key, value)
    setTouched((prev) => ({ ...prev, [key]: true }))
  }

  function canAdvance() {
    switch (screen.id) {
      case 'intro':
        return true
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
      case 'app':
        return APP_ITEMS.every((it) => typeof data[it.key] === 'number')
      case 'bw': {
        if (!touched.fu_bw_1) return false
        if ((data.fu_bw_1 || 0) === 0) return true
        return !!touched.fu_bw_2
      }
      case 'perm': {
        if (!data.fu_permanency) return false
        if (data.fu_permanency === 'other') {
          return (data.fu_permanency_other || '').trim().length > 0
        }
        return true
      }
      case 'disr':
        return typeof data.fu_disruption_worry === 'number'
      case 'submit':
        return true
      default:
        return false
    }
  }

  function next() {
    if (!canAdvance() || isLast) return
    setScreenIdx((i) => i + 1)
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
      await onSave({
        activity: 'followup',
        // BHS (0–3)
        fu_bhs_1: data.fu_bhs_1, fu_bhs_2: data.fu_bhs_2,
        fu_bhs_3: data.fu_bhs_3, fu_bhs_4: data.fu_bhs_4,
        // ASCS (1–5)
        fu_ascs_1: data.fu_ascs_1, fu_ascs_2: data.fu_ascs_2, fu_ascs_3: data.fu_ascs_3,
        // UCLA (1–3)
        fu_ucla_1: data.fu_ucla_1, fu_ucla_2: data.fu_ucla_2, fu_ucla_3: data.fu_ucla_3,
        // Need to Belong (1–5)
        fu_nb_1: data.fu_nb_1, fu_nb_2: data.fu_nb_2, fu_nb_3: data.fu_nb_3,
        // Belonging Promoting Behaviors (0–3)
        fu_bpb_1: data.fu_bpb_1, fu_bpb_2: data.fu_bpb_2, fu_bpb_3: data.fu_bpb_3,
        fu_bpb_4: data.fu_bpb_4, fu_bpb_5: data.fu_bpb_5, fu_bpb_6: data.fu_bpb_6,
        fu_bpb_7: data.fu_bpb_7,
        // Appraisals (0–5)
        fu_app_1: data.fu_app_1, fu_app_2: data.fu_app_2, fu_app_3: data.fu_app_3,
        fu_app_4: data.fu_app_4, fu_app_5: data.fu_app_5, fu_app_6: data.fu_app_6,
        // Belonging Worries (0–10 slider); conditional skip of Q2
        fu_bw_1: data.fu_bw_1,
        fu_bw_2: (data.fu_bw_1 || 0) === 0 ? null : data.fu_bw_2,
        // Permanency (string enum) + optional Other text
        fu_permanency: data.fu_permanency,
        fu_permanency_other: data.fu_permanency === 'other'
          ? (data.fu_permanency_other || '').trim()
          : null,
        // Disruption worry (0–4)
        fu_disruption_worry: data.fu_disruption_worry,
        saved_at: new Date().toISOString(),
      })
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <h2 className="text-[24px] font-semibold mb-3">Thanks — your responses are saved.</h2>
        <p className="text-[15px] text-slate-700">
          The full payload is visible in the saved-output panel below.
        </p>
      </div>
    )
  }

  return (
    <div>
      <ProgressStrip
        stepIndex={screenIdx}
        totalSteps={SCREENS.length}
        screenLabel={screen.label}
      />

      <ScreenBody
        screen={screen}
        data={data}
        touched={touched}
        setField={setField}
        setSlider={setSlider}
      />

      <div className="flex items-center justify-between mt-4">
        {!isFirst ? <GhostButton onClick={back}>← Back</GhostButton> : <span />}
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

function ScreenBody({ screen, data, touched, setField, setSlider }) {
  switch (screen.id) {
    case 'intro':
      return (
        <div>
          <h2 className="text-[22px] font-semibold mb-3">Welcome back</h2>
          <p className="text-[15px] leading-relaxed text-slate-800">
            Thanks for participating in our program about 3 months ago. To
            better understand the helpfulness of this program to you and
            how you are thinking and feeling right now, we would like to
            ask you some questions. Some of these questions will be the
            same as questions you answered at the start of this of the
            program, but others will be different. When you complete this
            short survey, you will receive another $25 gift card to thank
            you for your time. If you experience feelings of distress when
            answering these questions, please tell your caregiver or you
            can email us at sprang@uky.edu.
          </p>
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

    case 'app':
      return (
        <ScaleScreen
          heading="Thoughts about yourself, others, and the future"
          stem="For each statement, rate how true it feels for you right now."
          items={APP_ITEMS}
          anchors={APP_ANCHORS}
          data={data}
          setField={setField}
        />
      )

    case 'bw': {
      const q1 = data.fu_bw_1
      const skipQ2 = touched.fu_bw_1 && q1 === 0
      return (
        <div>
          <h2 className="text-[20px] font-semibold mb-3">Belonging worries</h2>
          <SliderItem
            prompt="To what degree do you have worries about belonging (e.g., fitting in, being understood or accepted)?"
            min={0}
            max={10}
            anchors={['Not at all', 'Moderately', 'A lot']}
            value={data.fu_bw_1 ?? 5}
            touched={!!touched.fu_bw_1}
            onChange={(v) => setSlider('fu_bw_1', v)}
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
              value={data.fu_bw_2 ?? 5}
              touched={!!touched.fu_bw_2}
              onChange={(v) => setSlider('fu_bw_2', v)}
            />
          )}
        </div>
      )
    }

    case 'perm':
      return (
        <div>
          <h2 className="text-[20px] font-semibold mb-3">Where you are living</h2>
          <RadioGroup
            prompt="Since you completed the Belonging course have you (please select one of the following):"
            options={PERMANENCY_OPTIONS}
            value={data.fu_permanency}
            onChange={(v) => setField('fu_permanency', v)}
          />
          {data.fu_permanency === 'other' && (
            <div className="mb-4">
              <label className="block text-[14px] text-slate-700 mb-2">
                Please specify
              </label>
              <input
                type="text"
                value={data.fu_permanency_other || ''}
                onChange={(e) => setField('fu_permanency_other', e.target.value)}
                maxLength={200}
                placeholder="Tell us where you're living now"
                className="w-full text-[15px] px-4 py-2 min-h-[44px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
              />
            </div>
          )}
        </div>
      )

    case 'disr':
      return (
        <div>
          <h2 className="text-[20px] font-semibold mb-3">How you feel about your placement</h2>
          <LikertItem
            prompt="How worried are you right now that this placement will change?"
            anchors={DISRUPTION_ANCHORS}
            value={data.fu_disruption_worry}
            onChange={(v) => setField('fu_disruption_worry', v)}
          />
        </div>
      )

    case 'submit':
      return (
        <div>
          <h2 className="text-[22px] font-semibold mb-3">All done with the follow-up</h2>
          <p className="text-[15px] leading-relaxed text-slate-700">
            Tap Submit when you&apos;re ready. The full response payload will
            appear in the saved-output panel below so reviewers can confirm
            the shape matches the SPSS export.
          </p>
        </div>
      )

    default:
      return null
  }
}
