// Posttest — paginated sandbox rendering of the locked Posttest survey
// (Final Measures/Posttest Draft Belongingness_5.2.26.docx, confirmed
// 2026-05-18). Lives on /demo/sandbox/posttest so reviewers can walk
// through the live participant flow.
//
// 18 items across 6 sections + intro + submit. Save payload is FLAT and
// keyed by the SPSS column names from Draft 6's convention
// (post_bhs_1..4, post_ascs_1..3, post_nb_1..3, post_bw_1, post_bw_2,
// post_pe_1, post_pf_1..3, post_pf_open_like, post_pf_open_change).
// Identical wording + anchors to the Pretest where items overlap, so
// pre/post change scores are valid.
//
// Visual components are shared with Pretest + FollowUp via
// `src/components/survey/SurveyItems.jsx`.

import { useState } from 'react'
import { PrimaryButton, GhostButton } from '../components/items/shared.jsx'
import {
  LikertItem,
  SliderItem,
  ScaleScreen,
  ProgressStrip,
} from '../components/survey/SurveyItems.jsx'

// ---------- Scale definitions ----------
// BHS / ASCS / NB anchors match the Pretest exactly so the SPSS-side
// VALUE LABELS line up at pre/post.

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
const NB_ANCHORS = [
  { v: 1, label: 'Strongly disagree' },
  { v: 2, label: 'Moderately disagree' },
  { v: 3, label: 'Neither agree nor disagree' },
  { v: 4, label: 'Moderately agree' },
  { v: 5, label: 'Strongly agree' },
]
// Program Feedback Acceptability — new to posttest, never seen at pretest.
const PF_ANCHORS = [
  { v: 0, label: 'Really Disagree' },
  { v: 1, label: 'Disagree' },
  { v: 2, label: 'Neither' },
  { v: 3, label: 'Agree' },
  { v: 4, label: 'Really Agree' },
]

const BHS_ITEMS = [
  { key: 'post_bhs_1', text: 'I feel that my future is hopeless and that things will not improve.' },
  { key: 'post_bhs_2', text: 'My future seems dark to me.' },
  { key: 'post_bhs_3', text: "Things just won't work out the way I want them to." },
  { key: 'post_bhs_4', text: 'There is no use in really trying to get something I want because I probably won\'t get it.' },
]
const ASCS_ITEMS = [
  { key: 'post_ascs_1', text: 'If I decide to, I can make changes to get more control over how close I feel to other people in my life.' },
  { key: 'post_ascs_2', text: 'I am able to act in ways that help me feel close to people in my life.' },
  { key: 'post_ascs_3', text: 'I have the skills and ability to improve how close I get to people in my life.' },
]
const NB_ITEMS = [
  { key: 'post_nb_1', text: "If other people don't seem to accept me, I don't let it bother me." },
  { key: 'post_nb_2', text: 'I seldom (hardly ever) worry about whether other people care about me.' },
  { key: 'post_nb_3', text: 'My feelings are easily hurt when I feel that others do not accept me.' },
]
// PF Likert items (1–3); open items (4–5) live on their own screen.
const PF_LIKERT_ITEMS = [
  { key: 'post_pf_1', text: 'I enjoyed the program.' },
  { key: 'post_pf_2', text: 'I understood the program.' },
  { key: 'post_pf_3', text: 'I would recommend this program to other kids my age.' },
]

const SCREENS = [
  { id: 'intro',  label: 'Welcome back' },
  { id: 'bhs',   label: 'How you feel' },
  { id: 'ascs',  label: 'Your sense of control' },
  { id: 'nb',    label: 'Belonging beliefs' },
  { id: 'bw',    label: 'Belonging worries' },
  { id: 'pe',    label: 'How helpful was the program' },
  { id: 'pf_likert', label: 'Program feedback' },
  { id: 'pf_open',   label: 'What you\'d share' },
  { id: 'submit', label: 'Submit' },
]

const OPEN_MAX = 2000

export default function Posttest({ onSave = console.log }) {
  const [screenIdx, setScreenIdx] = useState(0)
  const [data, setData] = useState({
    post_pf_open_like: '',
    post_pf_open_change: '',
  })
  const [touched, setTouched] = useState({}) // { post_bw_1, post_bw_2, post_pe_1 }
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
      case 'nb':
        return NB_ITEMS.every((it) => typeof data[it.key] === 'number')
      case 'bw': {
        if (!touched.post_bw_1) return false
        if ((data.post_bw_1 || 0) === 0) return true // conditional skip
        return !!touched.post_bw_2
      }
      case 'pe':
        return !!touched.post_pe_1
      case 'pf_likert':
        return PF_LIKERT_ITEMS.every((it) => typeof data[it.key] === 'number')
      case 'pf_open':
        // Both open items are optional; allow empty. Just check we
        // haven't overflowed the cap (which the textarea maxLength
        // already enforces, but be defensive).
        return (
          (data.post_pf_open_like || '').length <= OPEN_MAX &&
          (data.post_pf_open_change || '').length <= OPEN_MAX
        )
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
        activity: 'posttest',
        // BHS (0–3)
        post_bhs_1: data.post_bhs_1,
        post_bhs_2: data.post_bhs_2,
        post_bhs_3: data.post_bhs_3,
        post_bhs_4: data.post_bhs_4,
        // ASCS (1–5)
        post_ascs_1: data.post_ascs_1,
        post_ascs_2: data.post_ascs_2,
        post_ascs_3: data.post_ascs_3,
        // Need to Belong (1–5)
        post_nb_1: data.post_nb_1,
        post_nb_2: data.post_nb_2,
        post_nb_3: data.post_nb_3,
        // Belonging Worries (0–10 slider); conditional skip of Q2
        post_bw_1: data.post_bw_1,
        post_bw_2: (data.post_bw_1 || 0) === 0 ? null : data.post_bw_2,
        // Perceived helpfulness (1–10 slider; different wording from pretest pe_1)
        post_pe_1: data.post_pe_1,
        // Program Feedback Acceptability (0–4 likert)
        post_pf_1: data.post_pf_1,
        post_pf_2: data.post_pf_2,
        post_pf_3: data.post_pf_3,
        post_pf_open_like:   (data.post_pf_open_like   || '').trim(),
        post_pf_open_change: (data.post_pf_open_change || '').trim(),
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
          <p className="text-[15px] leading-relaxed text-slate-800 space-y-3">
            Thank you for your participation in this program! Now, we would
            like to ask you some questions about what you are thinking and
            feeling right now. Some of these questions will be the same as
            questions you answered at the start of this of the program,
            but others will be different. If you experience feelings of
            distress, please tell your caregiver or you can email us at
            sprang@uky.edu. Your experiences are very important to us!
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

    case 'bw': {
      const q1 = data.post_bw_1
      const skipQ2 = touched.post_bw_1 && q1 === 0
      return (
        <div>
          <h2 className="text-[20px] font-semibold mb-3">Belonging worries</h2>
          <SliderItem
            prompt="To what degree do you have worries about belonging (e.g., fitting in, being understood or accepted)?"
            min={0}
            max={10}
            anchors={['Not at all', 'Moderately', 'A lot']}
            value={data.post_bw_1 ?? 5}
            touched={!!touched.post_bw_1}
            onChange={(v) => setSlider('post_bw_1', v)}
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
              value={data.post_bw_2 ?? 5}
              touched={!!touched.post_bw_2}
              onChange={(v) => setSlider('post_bw_2', v)}
            />
          )}
        </div>
      )
    }

    case 'pe':
      return (
        <div>
          <h2 className="text-[20px] font-semibold mb-3">How helpful has the program been</h2>
          <p className="text-[14px] text-slate-600 mb-4">
            Please rate the following sentence based on how you feel at this moment.
          </p>
          <SliderItem
            prompt="At this point, how helpful has this program been for helping you feel close to your family and friends?"
            min={1}
            max={10}
            anchors={['Not at all', 'Somewhat', 'Very Much']}
            value={data.post_pe_1 ?? 5}
            touched={!!touched.post_pe_1}
            onChange={(v) => setSlider('post_pe_1', v)}
          />
        </div>
      )

    case 'pf_likert':
      return (
        <div>
          <h2 className="text-[20px] font-semibold mb-2">Program feedback</h2>
          <p className="text-[14px] text-slate-600 mb-4 italic">
            How much do you agree or disagree with each statement?
          </p>
          {PF_LIKERT_ITEMS.map((it) => (
            <LikertItem
              key={it.key}
              prompt={it.text}
              anchors={PF_ANCHORS}
              value={data[it.key]}
              onChange={(v) => setField(it.key, v)}
            />
          ))}
        </div>
      )

    case 'pf_open':
      return (
        <div>
          <h2 className="text-[20px] font-semibold mb-3">A little more</h2>
          <div className="mb-5">
            <label className="block text-[15px] text-slate-800 mb-2">
              What did you like about the program? Please share as many true
              thoughts and feelings as you would like.
            </label>
            <textarea
              rows={5}
              value={data.post_pf_open_like || ''}
              onChange={(e) => setField('post_pf_open_like', e.target.value)}
              maxLength={OPEN_MAX}
              placeholder="Whatever comes to mind…"
              className="w-full text-[16px] leading-relaxed px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-[15px] text-slate-800 mb-2">
              What would you change about the program? Please share as many
              true thoughts and feelings as you would like.
            </label>
            <textarea
              rows={5}
              value={data.post_pf_open_change || ''}
              onChange={(e) => setField('post_pf_open_change', e.target.value)}
              maxLength={OPEN_MAX}
              placeholder="Whatever comes to mind…"
              className="w-full text-[16px] leading-relaxed px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
            />
          </div>
          <p className="text-[12px] text-slate-500 mt-2 italic">
            Both questions are optional. You can skip them and submit if you&apos;d rather not write.
          </p>
        </div>
      )

    case 'submit':
      return (
        <div>
          <h2 className="text-[22px] font-semibold mb-3">All done with the posttest</h2>
          <p className="text-[15px] leading-relaxed text-slate-700">
            Tap Submit when you&apos;re ready.
          </p>
        </div>
      )

    default:
      return null
  }
}
