// "Your Plan" — the seventh Ready for Roots activity (Draft 39; v2.0
// restructure per the 2026-07-07 meeting, Draft 43). Turns the kid's work
// across the other six activities into a single, takeable, action-oriented
// commitment document: "You did the work — here's what you're going to do
// with it."
//
// Nine paginated screens (v2.0):
//   1 Intro · 2 Skills to try (how + who + when) · 3 Thoughts to flip
//   (read-only) · 4 People in my corner (pick first ally + when) ·
//   5 Words of Wisdom (the letter surfaced back as the kid's own words,
//   + optional reflection) · 6 Who you are (full poem) · 7 When you felt
//   included (Self-Reflection inclusion moment + belonging-behaviors
//   checklist + safety qualifier; skipped when no inclusion text exists) ·
//   8 Review (adds behaviors-used + not-tried-yet radar + qualifier) ·
//   9 Saved (+ PNG / 6-page PDF keepsake)
//
// Real cross-activity persistence is deferred (Draft 21). For the
// /demo/sandbox preview this reads synthetic content from
// `src/lib/planDemoData.js` via the `planData` prop (defaulting to the
// demo). Screens 2 + 4 + 5 collect the kid's own input; the save payload
// shape is documented in Draft 39 Part B. When the flow is stitched,
// `planData` is fed real per-kid reads and nothing else changes.

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, FileText, ArrowLeft } from 'lucide-react'
import { PrimaryButton } from '../components/items/shared.jsx'
import { downloadSvgStringAsPng } from '../lib/imageDownload.js'
import { PLAN_DEMO_DATA, ALL_BELONGING_SKILLS } from '../lib/planDemoData.js'

const WHEN_OPTIONS = ['This week', 'This month', 'When the moment shows up', 'Other…']

// Safety qualifier (Draft 43 Part E — Sprang, 2026-07-07): shown wherever
// belonging-promoting behaviors surface on the plan, so the plan never
// inadvertently reinforces dangerous connections. Same text on Screen 7,
// the review card, and the PDF.
const BPB_QUALIFIER =
  'A note: we don’t want to use these belonging-promoting behaviors with people who get us in trouble or make us feel bad. Save them for the people who make you feel safe.'

// Per-type clinical color coding (Practical amber / Emotional rose / Social
// sky), matching Allies / Safety Net. Kept warm/distinct on purpose.
const TONE = {
  practical: { label: 'Practical', text: 'text-amber-800', chip: 'bg-amber-100 text-amber-900', dot: 'bg-amber-400' },
  emotional: { label: 'Emotional', text: 'text-rose-800', chip: 'bg-rose-100 text-rose-900', dot: 'bg-rose-400' },
  social: { label: 'Social', text: 'text-sky-800', chip: 'bg-sky-100 text-sky-900', dot: 'bg-sky-400' },
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
function Keepsake({ children, className = '' }) {
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
// v2.0: a full commitment is skill + HOW + who + when — the "how" text is
// the higher-order-learning piece (Sprang: "now, how would I actually do
// that"), so it's part of the completeness gate.
function isComplete(c) {
  return !!(c && (c.how || '').trim()) && !!resolveWho(c) && !!resolveWhen(c)
}

// ---------- Component ----------

export default function Plan({ onSave = console.log, planData }) {
  const d = planData || PLAN_DEMO_DATA
  const [screen, setScreen] = useState(1)
  const [skillCommits, setSkillCommits] = useState({}) // skillId -> {how,who,whoOther,when,whenOther}
  const [firstAlly, setFirstAlly] = useState({ ally: '', when: '', whenOther: '' })
  const [letterReflection, setLetterReflection] = useState('')
  // v2.0 Screen 7 — which belonging-promoting behaviors the kid was using
  // in their Self-Reflection inclusion moment (multi-select, unlimited).
  const [inclusionBehaviors, setInclusionBehaviors] = useState([])
  const [saving, setSaving] = useState(false)

  // Screen 7 only exists when the kid actually wrote an inclusion memory
  // in Self-Reflection (Draft 43 C.4 — never reflect on an empty callout).
  const hasInclusion = !!(d.inclusionText || '').trim()

  const allyNames = useMemo(() => d.keptAllies.map((a) => a.name), [d])
  const alliesByType = useMemo(() => {
    const map = { practical: [], emotional: [], social: [] }
    for (const a of d.keptAllies) {
      for (const t of a.types) if (map[t]) map[t].push(a)
    }
    return map
  }, [d])

  const go = (n) => setScreen(n)

  function updateSkill(id, patch) {
    setSkillCommits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const anySkillComplete = d.willingToTrySkills.some((s) => isComplete(skillCommits[s.id]))
  const firstAllyComplete = !!firstAlly.ally && !!resolveWhen(firstAlly)

  function buildPayload() {
    const skills_to_try = d.willingToTrySkills
      .filter((s) => isComplete(skillCommits[s.id]))
      .map((s) => {
        const c = skillCommits[s.id]
        return {
          skill_id: s.id,
          skill_text: s.title,
          how: (c.how || '').trim(),
          who: resolveWho(c),
          who_is_ally: c.who !== '__other__',
          when: resolveWhen(c),
          when_is_freetext: c.when === 'Other…',
        }
      })
    return {
      activity: 'plan',
      skills_to_try,
      first_ally_outreach: firstAllyComplete
        ? {
            ally: firstAlly.ally,
            when: resolveWhen(firstAlly),
            when_is_freetext: firstAlly.when === 'Other…',
          }
        : null,
      letter_reflection: letterReflection.trim() || null,
      // v2.0 — null when Screen 7 was skipped (no inclusion text).
      inclusion_reflection: hasInclusion ? { behaviors_used: inclusionBehaviors } : null,
      saved_at: new Date().toISOString(),
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(buildPayload())
      go(9)
    } finally {
      setSaving(false)
    }
  }

  // ---------- Screens ----------

  if (screen === 1) {
    return (
      <ScreenShell heading="Your Plan.">
        <p className="text-[16px] leading-relaxed text-slate-700">
          You worked through a lot. Now let’s turn what you found into something
          you can carry with you. We’re going to pull together the skills you
          wanted to try, the thoughts you’ve been working on, and the people in
          your corner — and you’ll decide what you want to do first.
        </p>
        <NavFooter onNext={() => go(2)} />
      </ScreenShell>
    )
  }

  if (screen === 2) {
    return (
      <ScreenShell
        heading="New Skills to Try"
        sub="Pick who you’ll try each one with, and when."
      >
        <div className="space-y-4">
          {d.willingToTrySkills.map((s) => {
            const c = skillCommits[s.id] || {}
            return (
              <div key={s.id} className="bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl p-5">
                <h3 className="text-[17px] font-semibold text-ctac-navy">{s.title}</h3>
                {s.definition && (
                  <p className="text-[13px] text-slate-500 mb-3">{s.definition}</p>
                )}

                {/* v2.0 (Draft 43 A): the higher-order "how" — required per
                    commitment so the kid thinks through actually doing it,
                    not just who/when. Placeholder is a per-skill example. */}
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
            )
          })}
        </div>
        <NavFooter
          onBack={() => go(1)}
          onNext={() => go(3)}
          nextDisabled={!anySkillComplete}
          skip={() => go(3)}
        />
      </ScreenShell>
    )
  }

  if (screen === 3) {
    return (
      <ScreenShell
        heading="Thoughts you’ve been working on."
        sub="When these show up next, here’s what you can tell yourself."
      >
        <div className="space-y-4">
          {d.pickedThoughts.map((t, i) => (
            <div key={i} className="bg-white border border-ctac-teal-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                  When this comes up
                </p>
                <p className="text-[15px] italic text-slate-600">“{t.original}”</p>
              </div>
              <div className="px-5 py-3">
                <p className="text-[12px] font-semibold text-ctac-teal-700 uppercase tracking-wide mb-0.5">
                  Tell yourself
                </p>
                <p className="text-[16px] font-semibold text-ctac-navy">{t.tellYourself}</p>
              </div>
            </div>
          ))}
        </div>
        <NavFooter onBack={() => go(2)} onNext={() => go(4)} />
      </ScreenShell>
    )
  }

  if (screen === 4) {
    return (
      <ScreenShell heading="Your people.">
        {/* Kept allies grouped by support type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {TYPE_ORDER.map((t) => (
            <div key={t} className="bg-white border border-ctac-teal-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${TONE[t].dot}`} />
                <span className={`text-[13px] font-semibold ${TONE[t].text}`}>{TONE[t].label}</span>
              </div>
              {alliesByType[t].length ? (
                <ul className="space-y-1">
                  {alliesByType[t].map((a) => (
                    <li key={a.id} className="text-[14px] text-slate-700">{a.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-slate-400 italic">No one yet</p>
              )}
            </div>
          ))}
        </div>

        {/* Strengthen commitments */}
        {d.strengthenCommitments.length > 0 && (
          <div className="space-y-2 mb-6">
            {d.strengthenCommitments.map((sc, i) => (
              <div key={i} className={`rounded-2xl px-4 py-2.5 text-[14px] ${TONE[sc.type].chip}`}>
                {sc.text}
              </div>
            ))}
          </div>
        )}

        {/* Pick one ally to reach out to first */}
        <div className="bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl p-5">
          <p className="text-[16px] font-semibold text-ctac-navy mb-3">
            Pick one person to reach out to first.
          </p>
          <select
            value={firstAlly.ally}
            onChange={(e) => setFirstAlly((p) => ({ ...p, ally: e.target.value }))}
            className="w-full text-[15px] px-4 py-2.5 bg-white border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 mb-4"
          >
            <option value="">Choose someone…</option>
            {allyNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <label className="block text-[14px] font-medium text-slate-700 mb-2">
            When will you reach out?
          </label>
          <WhenChips
            value={firstAlly.when}
            otherValue={firstAlly.whenOther}
            onPick={(v) => setFirstAlly((p) => ({ ...p, when: v }))}
            onOther={(v) => setFirstAlly((p) => ({ ...p, whenOther: v }))}
          />
        </div>
        <NavFooter onBack={() => go(3)} onNext={() => go(5)} skip={() => go(5)} />
      </ScreenShell>
    )
  }

  if (screen === 5) {
    // v2.0 (Draft 43 B): Sprang's "goosebump moment" reframe — the letter
    // the kid wrote for another youth, surfaced back as their own words of
    // wisdom to themselves.
    return (
      <ScreenShell
        heading="Words of Wisdom."
        sub="You wrote this for another kid. But these are the things you might need to hear too — your own words of wisdom, coming from you."
      >
        <Keepsake>
          <p className="text-[16px] leading-relaxed text-slate-800 font-serif italic whitespace-pre-line">
            {d.letter}
          </p>
        </Keepsake>
        <div className="mt-5">
          <label className="block text-[15px] font-medium text-slate-700 mb-1">
            Any words of wisdom that stand out to you here?{' '}
            <span className="text-slate-400 font-normal text-[13px]">— skip if you’d rather not</span>
          </label>
          <textarea
            value={letterReflection}
            onChange={(e) => setLetterReflection(e.target.value)}
            maxLength={200}
            rows={2}
            className="w-full text-[15px] px-4 py-3 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
          />
        </div>
        <NavFooter onBack={() => go(4)} onNext={() => go(6)} />
      </ScreenShell>
    )
  }

  if (screen === 6) {
    return (
      <ScreenShell
        heading="Who you are."
        sub="When the work gets hard, come back to this. Take it with you."
      >
        <Keepsake className="text-center">
          <div className="text-[17px] leading-loose text-slate-800 font-serif italic">
            {d.poemLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </Keepsake>
        <NavFooter onBack={() => go(5)} onNext={() => go(hasInclusion ? 7 : 8)} />
      </ScreenShell>
    )
  }

  if (screen === 7 && hasInclusion) {
    // v2.0 (Draft 43 C): surface the kid's Self-Reflection inclusion moment
    // and let them check which belonging-promoting behaviors they were
    // already using — "keep doing what already works," not just new things.
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
          Which belonging-promoting behaviors were you using?
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
                <span className="text-[15px] text-slate-700">{s.title}</span>
              </label>
            )
          })}
        </div>
        <QualifierNote className="mt-5" />
        <NavFooter onBack={() => go(6)} onNext={() => go(8)} />
      </ScreenShell>
    )
  }

  if (screen === 8 || (screen === 7 && !hasInclusion)) {
    const committed = d.willingToTrySkills.filter((s) => isComplete(skillCommits[s.id]))
    return (
      <ScreenShell heading="Here’s your plan.">
        <Keepsake>
          <PlanReview
            d={d}
            committed={committed}
            skillCommits={skillCommits}
            firstAlly={firstAlly}
            firstAllyComplete={firstAllyComplete}
            inclusionBehaviors={inclusionBehaviors}
            hasInclusion={hasInclusion}
          />
        </Keepsake>
        <div className="flex items-center justify-between mt-8 gap-3">
          <button
            type="button"
            onClick={() => go(hasInclusion ? 7 : 6)}
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

  // screen === 9 — Saved
  const committed = d.willingToTrySkills.filter((s) => isComplete(skillCommits[s.id]))
  return (
    <ScreenShell heading="Saved." sub="This is yours. Come back to it any time.">
      <Keepsake>
        <PlanReview
          d={d}
          committed={committed}
          skillCommits={skillCommits}
          firstAlly={firstAlly}
          firstAllyComplete={firstAllyComplete}
          inclusionBehaviors={inclusionBehaviors}
          hasInclusion={hasInclusion}
        />
      </Keepsake>
      <PlanDownloads
        d={d}
        committed={committed}
        skillCommits={skillCommits}
        firstAlly={firstAlly}
        firstAllyComplete={firstAllyComplete}
        inclusionBehaviors={inclusionBehaviors}
        hasInclusion={hasInclusion}
      />
      <div className="text-center mt-5">
        <Link to="/demo" className="inline-flex items-center gap-1 text-ctac-teal-700 hover:text-ctac-teal-900 text-[14px] font-medium">
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to demo
        </Link>
      </div>
    </ScreenShell>
  )
}

// ---------- Review summary (Screens 7 + 8) ----------

function PlanReview({
  d,
  committed,
  skillCommits,
  firstAlly,
  firstAllyComplete,
  inclusionBehaviors = [],
  hasInclusion = false,
}) {
  const letterExcerpt =
    d.letter.length > 120 ? d.letter.slice(0, 120).trim() + '…' : d.letter
  const behaviorsUsed = ALL_BELONGING_SKILLS.filter((s) => inclusionBehaviors.includes(s.id))
  const notTried = ALL_BELONGING_SKILLS.filter((s) => (d.notTriedYetIds || []).includes(s.id))
  const showBpbSection = (hasInclusion && behaviorsUsed.length > 0) || notTried.length > 0
  return (
    <div className="space-y-5 text-left">
      <Section title="Skills you’ll try">
        {committed.length ? (
          <ul className="space-y-2">
            {committed.map((s) => {
              const c = skillCommits[s.id]
              return (
                <li key={s.id} className="text-[15px] text-slate-700">
                  <span className="font-semibold text-ctac-navy">{s.title}</span> — with{' '}
                  {resolveWho(c)}, {resolveWhen(c).toLowerCase()}
                  <span className="block text-[14px] italic text-slate-600">
                    How: {(c.how || '').trim()}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-[14px] text-slate-400 italic">No skills picked yet — that’s okay.</p>
        )}
      </Section>

      <Section title="First person to reach out to">
        {firstAllyComplete ? (
          <p className="text-[15px] text-slate-700">
            <span className="font-semibold text-ctac-navy">{firstAlly.ally}</span> —{' '}
            {resolveWhen(firstAlly).toLowerCase()}
          </p>
        ) : (
          <p className="text-[14px] text-slate-400 italic">Not chosen yet.</p>
        )}
      </Section>

      <Section title="Thoughts to flip">
        <ul className="space-y-1">
          {d.pickedThoughts.map((t, i) => (
            <li key={i} className="text-[15px] text-slate-700">{t.tellYourself}</li>
          ))}
        </ul>
      </Section>

      {/* v2.0 (Draft 43 C/D/E): what already worked + what's still on the
          radar, with the safety qualifier leading the section. */}
      {showBpbSection && (
        <Section title="Belonging-promoting behaviors">
          <QualifierNote className="mb-3" />
          {hasInclusion && behaviorsUsed.length > 0 && (
            <>
              <p className="text-[14px] font-medium text-slate-500 mb-1">
                Already working for you — keep doing these:
              </p>
              <ul className="list-disc pl-5 space-y-0.5 mb-3">
                {behaviorsUsed.map((s) => (
                  <li key={s.id} className="text-[15px] text-slate-700">{s.title}</li>
                ))}
              </ul>
            </>
          )}
          {notTried.length > 0 && (
            <>
              <p className="text-[14px] font-medium text-slate-500 mb-1">
                Some other belonging-promoting behaviors to keep on your radar:
              </p>
              <ul className="list-disc pl-5 space-y-0.5">
                {notTried.map((s) => (
                  <li key={s.id} className="text-[15px] text-slate-700">{s.title}</li>
                ))}
              </ul>
            </>
          )}
        </Section>
      )}

      <Section title="Words of Wisdom">
        <p className="text-[15px] italic text-slate-600">“{letterExcerpt}”</p>
      </Section>

      <Section title="Who you are">
        <div className="text-[15px] leading-relaxed text-slate-700 font-serif italic">
          {d.poemLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </Section>
    </div>
  )
}

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

// ---------- Downloads (PNG + PDF) ----------

function PlanDownloads({
  d,
  committed,
  skillCommits,
  firstAlly,
  firstAllyComplete,
  inclusionBehaviors = [],
  hasInclusion = false,
}) {
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)

  const model = useMemo(
    () =>
      buildPlanModel({
        d,
        committed,
        skillCommits,
        firstAlly,
        firstAllyComplete,
        inclusionBehaviors,
        hasInclusion,
      }),
    [d, committed, skillCommits, firstAlly, firstAllyComplete, inclusionBehaviors, hasInclusion],
  )

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
      // jsPDF is loaded on demand so it doesn't bloat the activity's initial
      // chunk (only the kid who saves a PDF pays for it).
      const { jsPDF } = await import('jspdf')
      buildPlanPdf(jsPDF, model)
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
      <p className="text-[12px] text-slate-500">
        PNG for your phone · PDF to print or share with someone who’s helping you.
      </p>
      {error && <p role="alert" className="text-[12px] text-rose-600">{error}</p>}
    </div>
  )
}

// Normalize the plan into a flat model both exporters read from.
function buildPlanModel({
  d,
  committed,
  skillCommits,
  firstAlly,
  firstAllyComplete,
  inclusionBehaviors = [],
  hasInclusion = false,
}) {
  return {
    skills: committed.map((s) => {
      const c = skillCommits[s.id]
      return {
        title: s.title,
        how: (c.how || '').trim(),
        who: resolveWho(c),
        when: resolveWhen(c),
      }
    }),
    firstAlly: firstAllyComplete
      ? { ally: firstAlly.ally, when: resolveWhen(firstAlly) }
      : null,
    thoughts: d.pickedThoughts.map((t) => t.tellYourself),
    inclusionText: hasInclusion ? d.inclusionText : null,
    behaviorsUsed: hasInclusion
      ? ALL_BELONGING_SKILLS.filter((s) => inclusionBehaviors.includes(s.id)).map((s) => s.title)
      : [],
    notTried: ALL_BELONGING_SKILLS.filter((s) => (d.notTriedYetIds || []).includes(s.id)).map(
      (s) => s.title,
    ),
    letter: d.letter,
    poemLines: d.poemLines,
  }
}

// Word-wrap a string to a max character width (for SVG <text>, which
// doesn't wrap). Returns an array of lines.
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

// Build a tall single-image keepsake SVG of the whole plan.
function buildPlanKeepsakeSvg(model) {
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

  heading('Skills you’ll try')
  if (model.skills.length) {
    for (const s of model.skills) {
      body(`• ${s.title} — with ${s.who}, ${s.when.toLowerCase()}`)
      body(`How: ${s.how}`, { italic: true, indent: 14 })
    }
  } else body('—')

  heading('First person to reach out to')
  body(model.firstAlly ? `${model.firstAlly.ally} — ${model.firstAlly.when.toLowerCase()}` : '—')

  heading('Thoughts to flip')
  for (const t of model.thoughts) body(`• ${t}`)

  if (model.behaviorsUsed.length || model.notTried.length) {
    heading('Belonging-promoting behaviors')
    body(BPB_QUALIFIER, { italic: true })
    if (model.behaviorsUsed.length) {
      body('Already working for you — keep doing these:')
      for (const b of model.behaviorsUsed) body(`• ${b}`, { indent: 14 })
    }
    if (model.notTried.length) {
      body('Keep on your radar:')
      for (const b of model.notTried) body(`• ${b}`, { indent: 14 })
    }
  }

  heading('Words of Wisdom')
  body(model.letter, { italic: true })

  heading('Who you are')
  for (const line of model.poemLines) body(line, { italic: true })

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

// Build + save a 6-page PDF (title / commitments / mindset / inclusion
// reflection + belonging behaviors / Words of Wisdom / poem) — Draft 43 F.
function buildPlanPdf(jsPDF, model) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 56
  const stamp = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  const TOTAL = 6

  const footer = (pageNum) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text(`Ready for Roots · ${stamp} · Page ${pageNum} of ${TOTAL}`, W / 2, H - 30, { align: 'center' })
    doc.setTextColor(40)
  }

  const heading = (txt, y) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(0, 117, 109) // ctac-teal-700
    doc.text(txt.toUpperCase(), M, y)
    doc.setTextColor(40)
    return y + 22
  }
  const para = (txt, y, { italic = false, size = 12, gap = 18, indent = 0 } = {}) => {
    doc.setFont('times', italic ? 'italic' : 'normal')
    doc.setFontSize(size)
    const lines = doc.splitTextToSize(String(txt), W - M * 2 - indent)
    doc.text(lines, M + indent, y)
    return y + lines.length * gap + 4
  }

  // Page 1 — title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(14, 31, 86) // ctac-navy
  doc.text('Your Plan', W / 2, H / 2 - 30, { align: 'center' })
  doc.setTextColor(40)
  doc.setFont('times', 'italic')
  doc.setFontSize(14)
  doc.text('This is yours. Come back to it any time.', W / 2, H / 2 + 4, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(120)
  doc.text(stamp, W / 2, H / 2 + 30, { align: 'center' })
  doc.setTextColor(40)
  footer(1)

  // Page 2 — commitments (skills now include the "how")
  doc.addPage()
  let y = M + 10
  y = heading('Skills you’ll try', y)
  if (model.skills.length) {
    for (const s of model.skills) {
      y = para(`•  ${s.title} — with ${s.who}, ${s.when.toLowerCase()}`, y)
      y = para(`How: ${s.how}`, y, { italic: true, indent: 16 })
    }
  } else y = para('—', y)
  y += 14
  y = heading('First person to reach out to', y)
  y = para(model.firstAlly ? `${model.firstAlly.ally} — ${model.firstAlly.when.toLowerCase()}` : '—', y)
  footer(2)

  // Page 3 — mindset
  doc.addPage()
  y = M + 10
  y = heading('Thoughts to flip', y)
  for (const t of model.thoughts) y = para(`•  ${t}`, y)
  footer(3)

  // Page 4 — inclusion reflection + belonging behaviors + qualifier
  // (Draft 43 C/D/E). Also carries the not-tried-yet radar list.
  doc.addPage()
  y = M + 10
  y = heading('When you felt included', y)
  if (model.inclusionText) {
    y = para(`“${model.inclusionText}”`, y, { italic: true, gap: 20 })
    y += 8
  }
  if (model.behaviorsUsed.length) {
    y = para('Belonging-promoting behaviors already working for you — keep doing these:', y)
    for (const b of model.behaviorsUsed) y = para(`•  ${b}`, y, { indent: 16 })
    y += 8
  }
  if (model.notTried.length) {
    y = para('Some other belonging-promoting behaviors to keep on your radar:', y)
    for (const b of model.notTried) y = para(`•  ${b}`, y, { indent: 16 })
    y += 8
  }
  y = para(BPB_QUALIFIER, y, { italic: true, size: 11, gap: 16 })
  footer(4)

  // Page 5 — Words of Wisdom (the letter, reframed — Draft 43 B)
  doc.addPage()
  y = M + 10
  y = heading('Words of Wisdom', y)
  y = para(model.letter, y, { italic: true, gap: 20 })
  footer(5)

  // Page 6 — poem
  doc.addPage()
  y = M + 10
  y = heading('Who you are', y)
  for (const line of model.poemLines) y = para(line, y, { italic: true })
  footer(6)

  const fileStamp = new Date().toISOString().slice(0, 10)
  doc.save(`ready-for-roots-plan-${fileStamp}.pdf`)
}
