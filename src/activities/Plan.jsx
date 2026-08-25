// "Your Plan" — the seventh Ready for Roots activity. v3.0 streamlined the
// flow (2026-07-13 meeting, Draft 51). v3.1 (Draft 55, 2026-07-27 meeting)
// drops the additional "Words of Wisdom" writing prompt (Holly + Stephanie:
// the letter already IS the words of wisdom), so the creation flow goes from
// 6 screens to 5; the letter still surfaces in the final plan labeled "Words
// of Wisdom" (read-only). Skills to Try now enforces true pick-ONE.
//
// Five paginated screens (v3.1):
//   1 Intro
//   2 Skills to Try — PICK ONE willing-to-try skill to work through in
//     detail (how + who + when); once one is picked the others lock as a
//     "for later" list until you choose a different one
//   3 When you felt included (inclusion moment + belonging-behaviors
//     checklist w/ an Other option + safety qualifier; skipped when no
//     inclusion text exists)
//   4 Review — the rich final plan: skill commitment + other willing-to-try
//     + Thoughts to Practice + Your People (Allies Strengthening) + When
//     You Felt Included + Words of Wisdom (the letter, read-only) + Who You
//     Are (poem)
//   5 Saved (+ PNG / single-page PDF keepsake + screenshot guidance)
//
// Thoughts to Practice, Your People, and Who You Are (poem) are now
// display-only (no walkthrough screen) — a Continue click on a read-only
// screen was friction without value.
//
// v4.0 (Draft 72, 2026-08-15) — REAL cross-activity pull-forward, closing
// the item deferred since Draft 21. In a live session the component reads
// the actual upstream save payloads from `sessionData` (the engine's
// token_key-keyed responses map), mapped into the same planData contract
// by `src/lib/planRealData.js`. `planDemoData.js` is now strictly the
// sandbox / IRB-preview fallback (no real sessionData → synthetic content
// + the Draft 49 caveat note; real data → caveat suppressed). Every
// section handles a skipped/half-done upstream activity gracefully: an
// empty willing-to-try bucket offers the full skills list to pick from,
// and empty display-only sections collapse cleanly from both the review
// and the keepsake.

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, FileText, ArrowLeft } from 'lucide-react'
import { PrimaryButton } from '../components/items/shared.jsx'
import CrisisLifelineNote, { CRISIS_LIFELINE_TEXT } from '../components/CrisisLifelineNote.jsx'
import { downloadSvgStringAsPng } from '../lib/imageDownload.js'
import { PLAN_DEMO_DATA, ALL_BELONGING_SKILLS } from '../lib/planDemoData.js'
import { buildRealPlanData } from '../lib/planRealData.js'

const WHEN_OPTIONS = ['This week', 'This month', 'When the moment shows up', 'Other…']

// Safety qualifier (Draft 43 E — Sprang): shown wherever belonging-
// promoting behaviors surface, so the plan never reinforces dangerous
// connections. Same text on Screen 4, the review card, and the PDF/PNG.
const BPB_QUALIFIER =
  'A note: we don’t want to use these belonging-promoting behaviors with people who get us in trouble or make us feel bad. Save them for the people who make you feel safe.'

// Per-type clinical color coding (Practical amber / Emotional rose / Social
// sky), matching Allies / Safety Net.
const TONE = {
  practical: { label: 'Practical', text: 'text-amber-800', dot: 'bg-amber-400' },
  emotional: { label: 'Emotional', text: 'text-rose-800', dot: 'bg-rose-400' },
  social: { label: 'Social', text: 'text-sky-800', dot: 'bg-sky-400' },
}
const TYPE_ORDER = ['practical', 'emotional', 'social']

// ---------- Small shared bits ----------

function ScreenShell({ heading, sub, children }) {
  return (
    <div>
      <h2 className="text-[22px] font-bold text-ctac-navy mb-1">{heading}</h2>
      {sub && <p className="text-[14px] text-slate-500 mb-5">{sub}</p>}
      {children}
    </div>
  )
}

function WhenChips({ value, otherValue, onPick, onOther }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {WHEN_OPTIONS.map((opt) => {
          const active = value === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onPick(opt)}
              className={
                'rounded-full px-4 py-2 text-[14px] font-medium border transition-colors ' +
                (active
                  ? 'bg-ctac-teal-500 border-ctac-teal-500 text-white'
                  : 'bg-white border-ctac-teal-200 text-slate-700 hover:bg-ctac-teal-50')
              }
            >
              {opt}
            </button>
          )
        })}
      </div>
      {value === 'Other…' && (
        <input
          type="text"
          value={otherValue || ''}
          onChange={(e) => onOther(e.target.value)}
          maxLength={80}
          placeholder="When?"
          className="mt-3 w-full text-[15px] px-4 py-2.5 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
        />
      )}
    </div>
  )
}

function NavFooter({ onBack, onNext, nextLabel = 'Continue', nextDisabled = false, skip }) {
  return (
    <div className="flex items-center justify-between mt-8 gap-3">
      <div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-ctac-teal-700 hover:text-ctac-teal-900 text-[14px] font-medium"
          >
            Back
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        {skip && (
          <button
            type="button"
            onClick={skip}
            className="text-slate-500 hover:text-slate-700 underline text-[14px]"
          >
            Skip for now
          </button>
        )}
        {onNext && (
          <PrimaryButton onClick={onNext} disabled={nextDisabled}>
            {nextLabel}
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}

// Warm cream keepsake surface (complements the teal UI; "this is yours").
// Exported (Draft 88): the post-posttest completion screen renders the
// same surface around the saved plan.
export function Keepsake({ children, className = '' }) {
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-3xl shadow-card p-6 ${className}`}>
      {children}
    </div>
  )
}

// The safety qualifier as a subtle "important note" callout.
function QualifierNote({ className = '' }) {
  return (
    <div className={`border-l-4 border-amber-300 bg-amber-50 rounded-r-2xl px-4 py-3 ${className}`}>
      <p className="text-sm italic text-slate-600">{BPB_QUALIFIER}</p>
    </div>
  )
}

// ---------- Value resolution ----------

function resolveWho(c) {
  if (!c) return ''
  return c.who === '__other__' ? (c.whoOther || '').trim() : c.who || ''
}
function resolveWhen(c) {
  if (!c) return ''
  return c.when === 'Other…' ? (c.whenOther || '').trim() : c.when || ''
}
// A complete commitment is skill + HOW + who + when.
function isComplete(c) {
  return !!(c && (c.how || '').trim()) && !!resolveWho(c) && !!resolveWhen(c)
}

// ---------- Component ----------

export default function Plan({ onSave = console.log, planData, sessionData }) {
  // Data source priority (v4.0): explicit planData prop (testing hook) →
  // real cross-activity payloads from the session → synthetic demo data
  // (sandbox / IRB preview, where sessionData is {} or absent).
  const realData = useMemo(() => buildRealPlanData(sessionData), [sessionData])
  const d = planData || realData || PLAN_DEMO_DATA
  const usingDemoData = !planData && !realData
  const [screen, setScreen] = useState(1)
  // Pick-one flow (Draft 51 A): the kid selects a single willing-to-try
  // skill to work through; skillCommits keeps its how/who/when.
  const [selectedSkillId, setSelectedSkillId] = useState(null)
  const [skillCommits, setSkillCommits] = useState({})
  const [inclusionBehaviors, setInclusionBehaviors] = useState([])
  const [otherUsed, setOtherUsed] = useState(false)
  const [otherText, setOtherText] = useState('')
  const [saving, setSaving] = useState(false)

  // Screen 4 only exists when the kid wrote an inclusion memory in
  // Self-Reflection (never reflect on an empty callout).
  const hasInclusion = !!(d.inclusionText || '').trim()

  const allyNames = useMemo(() => (d.keptAllies || []).map((a) => a.name), [d])

  const go = (n) => setScreen(n)

  function updateSkill(id, patch) {
    setSkillCommits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const selectedComplete = !!selectedSkillId && isComplete(skillCommits[selectedSkillId])

  const model = useMemo(
    () =>
      buildPlanModel(d, {
        selectedSkillId,
        skillCommits,
        inclusionBehaviors,
        otherUsed,
        otherText,
        hasInclusion,
      }),
    [d, selectedSkillId, skillCommits, inclusionBehaviors, otherUsed, otherText, hasInclusion],
  )

  function buildPayload() {
    const pick = selectedSkillId ? d.willingToTrySkills.find((s) => s.id === selectedSkillId) : null
    const c = pick ? skillCommits[pick.id] : null
    return {
      activity: 'plan',
      skill_commitment:
        pick && isComplete(c)
          ? {
              skill_id: pick.id,
              skill_text: pick.text,
              how: (c.how || '').trim(),
              who: resolveWho(c),
              who_is_ally: c.who !== '__other__',
              when: resolveWhen(c),
              when_is_freetext: c.when === 'Other…',
            }
          : null,
      inclusion_reflection: hasInclusion
        ? {
            behaviors_used: inclusionBehaviors,
            other_used: otherUsed,
            other_text: otherUsed ? otherText.trim() || null : null,
          }
        : null,
      saved_at: new Date().toISOString(),
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(buildPayload())
      go(5)
    } finally {
      setSaving(false)
    }
  }

  // ---------- Screens ----------

  if (screen === 1) {
    return (
      <ScreenShell heading="Your Plan.">
        <p className="text-[16px] leading-relaxed text-slate-700">
          You worked through a lot. Now let’s pull it together into something
          you can keep — the skill you want to try first, the thoughts you’ve
          been practicing, the people in your corner, and your own words. Let’s
          build your plan.
        </p>
        <NavFooter onNext={() => go(2)} />
      </ScreenShell>
    )
  }

  if (screen === 2) {
    return (
      <ScreenShell
        heading="New Skills to Try"
        sub="Pick one skill to focus on. You can come back to the others later."
      >
        {/* Draft 49 A caveat — demo/preview mode only (v4.0: real
            sessions render the kid's actual willing-to-try bucket, so the
            caveat is suppressed there). */}
        {usingDemoData && (
          <p className="text-sm italic text-slate-500 mb-4">
            In the real session, these are the skills you put in the &ldquo;willing
            to try&rdquo; bucket in Belonging Skills Sort. This preview shows sample
            skills for demonstration.
          </p>
        )}
        {/* Empty-bucket fallback (v4.0, Draft 72 C): the kid put nothing
            in willing-to-try, so the full skills list is offered instead —
            they still do the practice, GU-v5.9 style. */}
        {d.skillsFromFullList && (
          <p className="text-sm italic text-slate-600 mb-4">
            You didn&apos;t put anything in your willing-to-try bucket — no
            problem. Pick one from the full list that feels worth a try.
          </p>
        )}
        <div className="space-y-3">
          {d.willingToTrySkills.map((s) => {
            const c = skillCommits[s.id] || {}
            const selected = selectedSkillId === s.id
            // Pick-ONE gating (Draft 55 C.3): once a skill is picked, the
            // others lock ("for later") so the kid can't also fill them in.
            // "Pick a different skill" (below) clears the selection to switch.
            const locked = !!selectedSkillId && !selected
            return (
              <div
                key={s.id}
                className={
                  'rounded-2xl border transition-colors ' +
                  (selected
                    ? 'bg-ctac-teal-50 border-ctac-teal-400'
                    : 'bg-white border-ctac-teal-200') +
                  (locked ? ' opacity-60' : '')
                }
              >
                {/* Selector row — click anywhere to pick this skill */}
                <button
                  type="button"
                  onClick={() => setSelectedSkillId(s.id)}
                  disabled={locked}
                  className="w-full flex items-start gap-3 text-left p-4 disabled:cursor-not-allowed"
                >
                  <span
                    className={
                      'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ' +
                      (selected ? 'border-ctac-teal-500' : 'border-slate-300')
                    }
                  >
                    {selected && <span className="w-2.5 h-2.5 rounded-full bg-ctac-teal-500" />}
                  </span>
                  <span>
                    <span className="block text-[16px] font-semibold text-ctac-navy">{s.text}</span>
                    {s.definition && (
                      <span className="block text-[13px] text-slate-500 mt-0.5">{s.definition}</span>
                    )}
                  </span>
                </button>

                {/* Expanded inputs — only for the actively selected skill */}
                {selected && (
                  <div className="px-4 pb-4 pt-1">
                    <label className="block text-[14px] font-medium text-slate-700 mb-1">
                      How could you demonstrate this skill?
                    </label>
                    <input
                      type="text"
                      value={c.how || ''}
                      onChange={(e) => updateSkill(s.id, { how: e.target.value })}
                      maxLength={160}
                      placeholder={s.howExample || ''}
                      className="w-full text-[15px] px-4 py-2.5 bg-white border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 mb-3 placeholder:text-slate-400 placeholder:italic"
                    />
                    <label className="block text-[14px] font-medium text-slate-700 mb-1">
                      Who could you try this with?
                    </label>
                    <select
                      value={c.who || ''}
                      onChange={(e) => updateSkill(s.id, { who: e.target.value })}
                      className="w-full text-[15px] px-4 py-2.5 bg-white border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 mb-1"
                    >
                      <option value="">Choose someone…</option>
                      {allyNames.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                      <option value="__other__">Someone else…</option>
                    </select>
                    {c.who === '__other__' && (
                      <input
                        type="text"
                        value={c.whoOther || ''}
                        onChange={(e) => updateSkill(s.id, { whoOther: e.target.value })}
                        maxLength={60}
                        placeholder="Who?"
                        className="w-full text-[15px] px-4 py-2.5 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white mb-2"
                      />
                    )}
                    <label className="block text-[14px] font-medium text-slate-700 mt-3 mb-2">
                      When could you try it?
                    </label>
                    <WhenChips
                      value={c.when}
                      otherValue={c.whenOther}
                      onPick={(v) => updateSkill(s.id, { when: v })}
                      onOther={(v) => updateSkill(s.id, { whenOther: v })}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {selectedSkillId && (
          <button
            type="button"
            onClick={() => setSelectedSkillId(null)}
            className="mt-3 text-ctac-teal-700 hover:text-ctac-teal-900 text-[14px] font-medium"
          >
            ← Pick a different skill
          </button>
        )}
        <NavFooter
          onBack={() => go(1)}
          onNext={() => go(hasInclusion ? 3 : 4)}
          nextDisabled={!selectedComplete}
          skip={() => go(hasInclusion ? 3 : 4)}
        />
      </ScreenShell>
    )
  }

  if (screen === 3 && hasInclusion) {
    const toggleBehavior = (id) =>
      setInclusionBehaviors((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      )
    return (
      <ScreenShell heading="When you felt included." sub="Think back to what you wrote earlier.">
        <Keepsake>
          <p className="text-[16px] leading-relaxed text-slate-800 font-serif italic">
            “{d.inclusionText}”
          </p>
        </Keepsake>
        <p className="text-[16px] font-semibold text-ctac-navy mt-6 mb-3">
          Which belonging-promoting behaviors were you using before, during, or
          after this happened?
        </p>
        <div className="space-y-2">
          {ALL_BELONGING_SKILLS.map((s) => {
            const checked = inclusionBehaviors.includes(s.id)
            return (
              <label
                key={s.id}
                className={
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-colors ' +
                  (checked
                    ? 'bg-ctac-teal-50 border-ctac-teal-400'
                    : 'bg-white border-ctac-teal-200 hover:bg-ctac-teal-50')
                }
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleBehavior(s.id)}
                  className="w-4 h-4 accent-ctac-teal-500"
                />
                <span className="text-[15px] text-slate-700">{s.text}</span>
              </label>
            )
          })}
          {/* Other option (Draft 51 F.2) */}
          <label
            className={
              'flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-colors ' +
              (otherUsed
                ? 'bg-ctac-teal-50 border-ctac-teal-400'
                : 'bg-white border-ctac-teal-200 hover:bg-ctac-teal-50')
            }
          >
            <input
              type="checkbox"
              checked={otherUsed}
              onChange={() => setOtherUsed((v) => !v)}
              className="w-4 h-4 accent-ctac-teal-500"
            />
            <span className="text-[15px] text-slate-700">Something else</span>
          </label>
          {otherUsed && (
            <input
              type="text"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              maxLength={120}
              placeholder="What were you doing?"
              className="w-full text-[15px] px-4 py-2.5 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
            />
          )}
        </div>
        <QualifierNote className="mt-5" />
        <NavFooter onBack={() => go(2)} onNext={() => go(4)} />
      </ScreenShell>
    )
  }

  if (screen === 4 || (screen === 3 && !hasInclusion)) {
    return (
      <ScreenShell heading="Here’s your plan.">
        <Keepsake>
          <PlanReview model={model} />
        </Keepsake>
        <div className="flex items-center justify-between mt-8 gap-3">
          <button
            type="button"
            onClick={() => go(hasInclusion ? 3 : 2)}
            className="text-ctac-teal-700 hover:text-ctac-teal-900 text-[14px] font-medium"
          >
            Back
          </button>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save my plan'}
          </PrimaryButton>
        </div>
      </ScreenShell>
    )
  }

  // screen === 5 — Saved. Draft 88 Part B: the download buttons moved to
  // the post-posttest completion screen (DeliveryShellPage), so nothing
  // can pull the participant out of the app before the post-measures. In
  // the live flow this screen is never reached anyway (the engine
  // advances as soon as onSave resolves) — it exists for the sandbox.
  return (
    <ScreenShell heading="Saved." sub="This is yours. Come back to it any time.">
      <p className="text-[14px] text-slate-600 mb-5">
        You&apos;ll get to save your plan at the very end, after the last few
        questions.
      </p>
      <Keepsake>
        <PlanReview model={model} />
      </Keepsake>
      <div className="text-center mt-5">
        <Link to="/demo" className="inline-flex items-center gap-1 text-ctac-teal-700 hover:text-ctac-teal-900 text-[14px] font-medium">
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to demo
        </Link>
      </div>
    </ScreenShell>
  )
}

// ---------- Plan model (single source for review + PNG + PDF) ----------

function buildPlanModel(
  d,
  { selectedSkillId, skillCommits, inclusionBehaviors, otherUsed, otherText, hasInclusion },
) {
  const pick = selectedSkillId ? d.willingToTrySkills.find((s) => s.id === selectedSkillId) : null
  const c = pick ? skillCommits[pick.id] : null
  const skill =
    pick && isComplete(c)
      ? { text: pick.text, how: (c.how || '').trim(), who: resolveWho(c), when: resolveWhen(c) }
      : null
  // When the willing-to-try bucket was empty and the full list was
  // offered instead (v4.0 fallback), the non-picked skills are NOT
  // "skills you said you'd try" — suppress the for-later list rather
  // than mislabel it.
  const otherSkills = d.skillsFromFullList
    ? []
    : d.willingToTrySkills.filter((s) => s.id !== selectedSkillId).map((s) => s.text)
  const people = TYPE_ORDER.map((t) => (d.strengthening || []).find((x) => x.type === t))
    .filter((x) => x && ((x.person || '').trim() || (x.action || '').trim()))
    .map((x) => ({ typeKey: x.type, label: TONE[x.type].label, person: x.person, action: x.action }))
  return {
    skill,
    otherSkills,
    thoughts: (d.pickedThoughts || []).map((t) => t.tellYourself),
    people,
    inclusionText: hasInclusion ? d.inclusionText : null,
    behaviorsUsed: hasInclusion
      ? ALL_BELONGING_SKILLS.filter((s) => inclusionBehaviors.includes(s.id)).map((s) => s.text)
      : [],
    inclusionOther: hasInclusion && otherUsed ? otherText.trim() || null : null,
    notTried: ALL_BELONGING_SKILLS.filter((s) => (d.notTriedYetIds || []).includes(s.id)).map(
      (s) => s.text,
    ),
    letter: d.letter,
    poemLines: d.poemLines,
  }
}

// Rebuild the review/keepsake model for a SAVED plan from the engine's
// token_key-keyed responses map (Draft 88 Part B). Used by the post-
// posttest completion screen: the kid already saved their plan during
// the activity; this reconstructs the same model shape buildPlanModel
// produces, but from the saved payload (skill_commitment /
// inclusion_reflection) plus the upstream activity payloads via
// buildRealPlanData. Returns null when there is nothing real to show
// (e.g. the 90-day follow-up has no plan activity) — callers fall back
// to the plain celebration.
export function buildSavedPlanModel(sessionData) {
  const d = buildRealPlanData(sessionData)
  const saved = sessionData?.plan || null
  if (!d && !saved) return null
  const sc = saved?.skill_commitment || null
  const skill = sc
    ? { text: sc.skill_text || '', how: sc.how || '', who: sc.who || '', when: sc.when || '' }
    : null
  const otherSkills =
    !d || d.skillsFromFullList
      ? []
      : d.willingToTrySkills.filter((s) => s.id !== sc?.skill_id).map((s) => s.text)
  const ir = saved?.inclusion_reflection || null
  const people = TYPE_ORDER.map((t) => (d?.strengthening || []).find((x) => x.type === t))
    .filter((x) => x && ((x.person || '').trim() || (x.action || '').trim()))
    .map((x) => ({ typeKey: x.type, label: TONE[x.type].label, person: x.person, action: x.action }))
  return {
    skill,
    otherSkills,
    thoughts: (d?.pickedThoughts || []).map((t) => t.tellYourself),
    people,
    inclusionText: ir ? d?.inclusionText || null : null,
    behaviorsUsed: ALL_BELONGING_SKILLS.filter((s) =>
      (ir?.behaviors_used || []).includes(s.id),
    ).map((s) => s.text),
    inclusionOther: ir?.other_used ? ir.other_text || null : null,
    notTried: ALL_BELONGING_SKILLS.filter((s) => (d?.notTriedYetIds || []).includes(s.id)).map(
      (s) => s.text,
    ),
    letter: d?.letter || null,
    poemLines: d?.poemLines || [],
  }
}

// ---------- Review summary (rich final plan) ----------

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ctac-teal-700 mb-1">
        {title}
      </h3>
      {children}
    </div>
  )
}

export function PlanReview({ model }) {
  const m = model
  const showBpb = m.behaviorsUsed.length > 0 || m.inclusionOther || m.notTried.length > 0
  return (
    <div className="space-y-5 text-left">
      <Section title="The skill you’ll focus on">
        {m.skill ? (
          <p className="text-[15px] text-slate-700">
            <span className="font-semibold text-ctac-navy">{m.skill.text}</span> — with{' '}
            {m.skill.who}, {m.skill.when.toLowerCase()}
            <span className="block text-[14px] italic text-slate-600">How: {m.skill.how}</span>
          </p>
        ) : (
          <p className="text-[14px] text-slate-400 italic">No skill picked yet — that’s okay.</p>
        )}
        {m.otherSkills.length > 0 && (
          <div className="mt-2">
            <p className="text-[13px] font-medium text-slate-500 mb-1">
              Your other willing-to-try skills, for later:
            </p>
            <ul className="list-disc pl-5 space-y-0.5">
              {m.otherSkills.map((s, i) => (
                <li key={i} className="text-[14px] text-slate-600">{s}</li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* Display-only sections collapse when their upstream activity has
          no content (v4.0, Draft 72 C) — never a heading over an empty
          box. */}
      {m.thoughts.length > 0 && (
        <Section title="Thoughts to practice">
          <ul className="space-y-1">
            {m.thoughts.map((t, i) => (
              <li key={i} className="text-[15px] text-slate-700">{t}</li>
            ))}
          </ul>
        </Section>
      )}

      {m.people.length > 0 && (
        <Section title="Your people">
          <div className="space-y-3">
            {m.people.map((p) => (
              <div key={p.typeKey}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${TONE[p.typeKey].dot}`} />
                  <span className={`text-[13px] font-semibold ${TONE[p.typeKey].text}`}>{p.label}</span>
                </div>
                {p.person && (
                  <p className="text-[15px] text-slate-700">
                    <span className="text-slate-500">Who could that be? </span>
                    {p.person}
                  </p>
                )}
                {p.action && (
                  <p className="text-[15px] text-slate-700">
                    <span className="text-slate-500">What’s one thing you could do? </span>
                    {p.action}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-[13px] italic text-slate-500 mt-3">
            Stuck? You could ask another supportive person for a recommendation.
          </p>
        </Section>
      )}

      {showBpb && (
        <Section title="When you felt included">
          {m.inclusionText && (
            <p className="text-[15px] italic text-slate-600 mb-2">“{m.inclusionText}”</p>
          )}
          <QualifierNote className="mb-3" />
          {(m.behaviorsUsed.length > 0 || m.inclusionOther) && (
            <>
              <p className="text-[14px] font-medium text-slate-500 mb-1">
                Belonging-promoting behaviors you were using — keep doing these:
              </p>
              <ul className="list-disc pl-5 space-y-0.5 mb-3">
                {m.behaviorsUsed.map((b, i) => (
                  <li key={i} className="text-[15px] text-slate-700">{b}</li>
                ))}
                {m.inclusionOther && (
                  <li className="text-[15px] text-slate-700">{m.inclusionOther}</li>
                )}
              </ul>
            </>
          )}
          {m.notTried.length > 0 && (
            <>
              <p className="text-[14px] font-medium text-slate-500 mb-1">
                Some other belonging-promoting behaviors to keep on your radar:
              </p>
              <ul className="list-disc pl-5 space-y-0.5">
                {m.notTried.map((b, i) => (
                  <li key={i} className="text-[15px] text-slate-700">{b}</li>
                ))}
              </ul>
            </>
          )}
        </Section>
      )}

      {(m.letter || '').trim() && (
        <Section title="Words of Wisdom">
          <p className="text-[15px] italic text-slate-600 whitespace-pre-line">{m.letter}</p>
        </Section>
      )}

      {(m.poemLines || []).length > 0 && (
        <Section title="Who you are">
          <div className="text-[15px] leading-relaxed text-slate-700 font-serif italic">
            {m.poemLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </Section>
      )}

      {/* 988 Suicide & Crisis Lifeline callout (Draft 96) — Sprang was
          explicit this should be part of what they keep, not just shown
          once on-screen, so it's part of the same model both PlanReview
          and the PNG/PDF keepsake read from (see buildPlanKeepsakeSvg). */}
      <CrisisLifelineNote />
    </div>
  )
}

// ---------- Downloads (PNG + single-page PDF) ----------

export function PlanDownloads({ model }) {
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)

  async function savePng() {
    setError(null)
    setBusy('png')
    try {
      const stamp = new Date().toISOString().slice(0, 10)
      const { svg, width, height } = buildPlanKeepsakeSvg(model)
      await downloadSvgStringAsPng(svg, width, height, `ready-for-roots-plan-${stamp}.png`)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not save the image.')
    } finally {
      setBusy(null)
    }
  }

  async function savePdf() {
    setError(null)
    setBusy('pdf')
    try {
      const { jsPDF } = await import('jspdf')
      await buildPlanPdf(jsPDF, model)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not build the PDF.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={savePng}
          disabled={!!busy}
          className="inline-flex items-center gap-2 bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-50 text-white font-semibold rounded-full px-5 py-2.5 text-[14px]"
        >
          <Download size={15} strokeWidth={2} />
          {busy === 'png' ? 'Saving image…' : 'Save as image (PNG)'}
        </button>
        <button
          type="button"
          onClick={savePdf}
          disabled={!!busy}
          className="inline-flex items-center gap-2 bg-white hover:bg-ctac-teal-50 disabled:opacity-50 border border-ctac-teal-300 text-ctac-teal-700 font-semibold rounded-full px-5 py-2.5 text-[14px]"
        >
          <FileText size={15} strokeWidth={2} />
          {busy === 'pdf' ? 'Building PDF…' : 'Save as PDF'}
        </button>
      </div>
      {error && <p role="alert" className="text-[12px] text-rose-600">{error}</p>}
    </div>
  )
}

// ---------- Keepsake SVG (shared by PNG + PDF) ----------

function wrapText(str, maxChars) {
  const words = String(str || '').split(/\s+/)
  const lines = []
  let cur = ''
  for (const w of words) {
    if (!cur) cur = w
    else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w
    else {
      lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  return lines
}

const escapeXml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

// Build a tall single-image keepsake SVG of the whole plan. The PNG and
// the PDF both render from this, so they look identical (Draft 51 G).
function buildPlanKeepsakeSvg(model) {
  const m = model
  const width = 640
  const padX = 44
  const wrapAt = 64
  const els = []
  let y = 70

  els.push(
    `<text x="${width / 2}" y="${y}" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="26" font-weight="700" fill="#0E1F56">Your Plan</text>`,
  )
  y += 40

  const heading = (txt) => {
    y += 14
    els.push(
      `<text x="${padX}" y="${y}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="700" letter-spacing="0.08em" fill="#00756d">${escapeXml(txt.toUpperCase())}</text>`,
    )
    y += 24
  }
  const body = (txt, { italic = false, indent = 0 } = {}) => {
    for (const line of wrapText(txt, wrapAt - Math.round(indent / 8))) {
      els.push(
        `<text x="${padX + indent}" y="${y}" font-family="Georgia, 'Times New Roman', serif" font-size="16" ${italic ? 'font-style="italic" ' : ''}fill="#1F2937">${escapeXml(line)}</text>`,
      )
      y += 24
    }
  }

  heading('The skill you’ll focus on')
  if (m.skill) {
    body(`• ${m.skill.text} — with ${m.skill.who}, ${m.skill.when.toLowerCase()}`)
    body(`How: ${m.skill.how}`, { italic: true, indent: 14 })
  } else body('—')
  if (m.otherSkills.length) {
    body('Your other willing-to-try skills, for later:')
    for (const s of m.otherSkills) body(`• ${s}`, { indent: 14 })
  }

  // Empty display-only sections collapse from the keepsake too (v4.0,
  // Draft 72 C/D) — a heading over nothing reads as broken.
  if (m.thoughts.length) {
    heading('Thoughts to practice')
    for (const t of m.thoughts) body(`• ${t}`)
  }

  if (m.people.length) {
    heading('Your people')
    for (const p of m.people) {
      body(`${p.label}`)
      if (p.person) body(`Who could that be? ${p.person}`, { indent: 14 })
      if (p.action) body(`One thing you could do: ${p.action}`, { indent: 14 })
    }
    body('Stuck? You could ask another supportive person for a recommendation.', { italic: true })
  }

  if (m.behaviorsUsed.length || m.inclusionOther || m.notTried.length) {
    heading('When you felt included')
    if (m.inclusionText) body(`“${m.inclusionText}”`, { italic: true })
    body(BPB_QUALIFIER, { italic: true })
    if (m.behaviorsUsed.length || m.inclusionOther) {
      body('Belonging-promoting behaviors you were using — keep doing these:')
      for (const b of m.behaviorsUsed) body(`• ${b}`, { indent: 14 })
      if (m.inclusionOther) body(`• ${m.inclusionOther}`, { indent: 14 })
    }
    if (m.notTried.length) {
      body('Keep on your radar:')
      for (const b of m.notTried) body(`• ${b}`, { indent: 14 })
    }
  }

  if ((m.letter || '').trim()) {
    heading('Words of Wisdom')
    body(m.letter, { italic: true })
  }

  if ((m.poemLines || []).length) {
    heading('Who you are')
    for (const line of m.poemLines) body(line, { italic: true })
  }

  // 988 Suicide & Crisis Lifeline callout (Draft 96) — always present,
  // not conditional on any upstream content, same as the on-screen
  // PlanReview above.
  heading('A note')
  body(CRISIS_LIFELINE_TEXT)

  y += 20
  const height = y + 30
  const stamp = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="26" ry="26" fill="#FFFDF7" stroke="#99dfdb" stroke-width="3"/>
  ${els.join('\n  ')}
  <text x="${width / 2}" y="${height - 18}" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" fill="#00A79D">Ready for Roots · ${escapeXml(stamp)}</text>
</svg>`
  return { svg, width, height }
}

// Rasterize an SVG string to a PNG data URL (for the PDF's single image
// page). Cream background so transparent areas never look broken.
async function rasterizeSvgToPng(svgString, width, height, scale = 2) {
  const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', svgString], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    await new Promise((res, rej) => {
      img.onload = res
      img.onerror = () => rej(new Error('Failed to load SVG into Image'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFDF7'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Build + save the PDF as a single continuous page that IS the keepsake
// image — same look as the PNG (Draft 51 G). The page size matches the
// keepsake's aspect so nothing is split into title/section pages.
async function buildPlanPdf(jsPDF, model) {
  const { svg, width, height } = buildPlanKeepsakeSvg(model)
  const dataUrl = await rasterizeSvgToPng(svg, width, height, 2)
  const doc = new jsPDF({ unit: 'pt', format: [width, height], orientation: width > height ? 'landscape' : 'portrait' })
  doc.addImage(dataUrl, 'PNG', 0, 0, width, height)
  doc.save(`ready-for-roots-plan-${new Date().toISOString().slice(0, 10)}.pdf`)
}
