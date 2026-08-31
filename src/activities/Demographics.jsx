// Demographics — single-screen custom_activity filling the gap between the
// live Pretest and the polished (non-live) /demo Pretest.jsx reference
// component. The live pretest currently has no demographics screen at all;
// this component fills that gap so it can be inserted as its own section.
//
// Fields, validation, and the flat save-payload shape are copied verbatim
// from Pretest.jsx's 'demographics' screen (helper components, RACE_OPTIONS,
// canAdvance() logic, and screen JSX) so the SPSS column convention stays
// identical — this is deliberately NOT an import of Pretest.jsx, which is a
// TEMP demo-only file per CLAUDE.md and must not be a dependency of live
// content.
//
// Save payload is FLAT and keyed by the same SPSS column names Pretest.jsx
// uses (age, sex, race_white, ..., hispanic, grade, home_years, home_months,
// placements) — that shape is what the export pipeline expects.

import { useState } from 'react'
import {
  PrimaryButton,
  MissingItemsNote,
  scrollToMissingItem,
} from '../components/items/shared.jsx'

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

// ---------- Reusable item renderers (copied from Pretest.jsx verbatim) ----------

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
        className="w-full max-w-[140px] text-[16px] px-4 py-3 min-h-[48px] bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
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
                  ? 'bg-ctac-teal-200 border-ctac-teal-400 text-ctac-teal-900'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-ctac-teal-300')
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
                  ? 'bg-ctac-teal-100 border-ctac-teal-400 text-ctac-teal-900'
                  : 'bg-white border-slate-200 text-slate-800 hover:border-ctac-teal-300')
              }
            >
              <span
                className={
                  'inline-flex items-center justify-center rounded-md w-5 h-5 border-2 flex-shrink-0 ' +
                  (checked ? 'bg-ctac-teal-500 border-ctac-teal-500 text-white' : 'border-slate-300')
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

export default function Demographics({ onSave = console.log }) {
  const [data, setData] = useState(() => {
    const init = {}
    // Initialize all checkbox-style race columns to 0 so the save payload
    // always has a stable shape.
    for (const r of RACE_OPTIONS) init[r.key] = 0
    return init
  })
  const [submitting, setSubmitting] = useState(false)
  // Draft 100: Continue stays tappable when incomplete; tapping it while
  // incomplete surfaces which field(s) are missing instead of doing
  // nothing (a disabled native <button> doesn't fire hover in most
  // browsers, and this is phone-first anyway, so hover was never viable).
  const [showMissing, setShowMissing] = useState(false)

  function setField(key, value) {
    setData((prev) => ({ ...prev, [key]: value }))
  }
  function toggleRace(key) {
    setData((prev) => ({ ...prev, [key]: prev[key] === 1 ? 0 : 1 }))
  }

  function computeMissing() {
    const numericOk = (v) => typeof v === 'number' && !Number.isNaN(v)
    const missing = []
    if (!numericOk(data.age)) missing.push({ id: 'age', label: 'How old are you?' })
    if (![1, 2, 3].includes(data.sex)) missing.push({ id: 'sex', label: 'What is your sex?' })
    if (!RACE_OPTIONS.some((r) => data[r.key] === 1)) {
      missing.push({ id: 'race', label: 'What race do you consider yourself?' })
    }
    if (![0, 1].includes(data.hispanic)) {
      missing.push({ id: 'hispanic', label: 'Are you Hispanic or Latino?' })
    }
    if (!numericOk(data.grade)) missing.push({ id: 'grade', label: 'What grade are you currently in?' })
    // home_time (years lived in current home) is intentionally NOT required —
    // 2026-08-31 team decision: this question must never block Continue.
    if (!numericOk(data.placements)) {
      missing.push({ id: 'placements', label: 'How many out of home placements have you had?' })
    }
    return missing
  }

  const missingFields = computeMissing()
  const canAdvance = missingFields.length === 0
  const missingMessage =
    missingFields.length === 0
      ? null
      : missingFields.length === 1
        ? `Please answer "${missingFields[0].label}" before continuing.`
        : `Please answer the highlighted question before continuing (${missingFields.length} left).`

  async function handleContinue() {
    if (submitting) return
    if (!canAdvance) {
      setShowMissing(true)
      scrollToMissingItem(`item-${missingFields[0].id}`)
      return
    }
    setShowMissing(false)
    setSubmitting(true)
    try {
      await onSave({
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
        // home_months retired 2026-08-31 (see WORKING_NOTES) — key kept for
        // schema stability; export pipeline handles null via `?? ''`.
        home_months: null,
        placements: data.placements,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-3">About you</h2>
      <p className="text-[14px] text-slate-600 mb-5">
        A few quick questions before we get started.
      </p>
      <div id="item-age">
        <NumberInput
          prompt="How old are you?"
          value={data.age ?? null}
          onChange={(v) => setField('age', v)}
          min={1}
          max={99}
        />
      </div>
      <div id="item-sex">
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
      </div>
      <div id="item-race">
        <CheckboxGroup
          prompt="What race do you consider yourself (choose all that apply)?"
          options={RACE_OPTIONS}
          values={data}
          onToggle={toggleRace}
        />
      </div>
      <div id="item-hispanic">
        <RadioGroup
          prompt="Are you Hispanic or Latino?"
          options={[
            { value: 0, label: 'No' },
            { value: 1, label: 'Yes' },
          ]}
          value={data.hispanic}
          onChange={(v) => setField('hispanic', v)}
        />
      </div>
      <div id="item-grade">
        <NumberInput
          prompt="What grade are you currently in at school?"
          value={data.grade ?? null}
          onChange={(v) => setField('grade', v)}
          min={1}
          max={12}
        />
      </div>
      <div id="item-home_time" className="mb-4">
        <div className="text-[15px] text-slate-800 mb-2">
          How long have you lived in your current home?{' '}
          <span className="text-slate-400 font-normal">(optional)</span>
        </div>
        {!data.home_lt1yr && (
          <NumberInput
            prompt="Years"
            value={data.home_years ?? null}
            onChange={(v) => setField('home_years', v)}
            min={0}
            max={20}
          />
        )}
        <button
          type="button"
          onClick={() => {
            const next = !data.home_lt1yr
            setData((prev) => ({
              ...prev,
              home_lt1yr: next,
              home_years: next ? 0 : prev.home_years,
            }))
          }}
          aria-pressed={!!data.home_lt1yr}
          className={
            'text-left rounded-2xl border min-h-[44px] px-4 py-2 text-[14px] inline-flex items-center gap-3 transition-colors ' +
            (data.home_lt1yr
              ? 'bg-ctac-teal-100 border-ctac-teal-400 text-ctac-teal-900'
              : 'bg-white border-slate-200 text-slate-800 hover:border-ctac-teal-300')
          }
        >
          <span
            className={
              'inline-flex items-center justify-center rounded-md w-5 h-5 border-2 flex-shrink-0 ' +
              (data.home_lt1yr ? 'bg-ctac-teal-500 border-ctac-teal-500 text-white' : 'border-slate-300')
            }
          >
            {data.home_lt1yr ? '✓' : ''}
          </span>
          Less than 1 year
        </button>
      </div>
      <div id="item-placements">
        <NumberInput
          prompt="How many out of home placements have you had?"
          value={data.placements ?? null}
          onChange={(v) => setField('placements', v)}
          min={0}
          max={50}
        />
      </div>

      <div className="flex items-center justify-end mt-4">
        <PrimaryButton onClick={handleContinue} disabled={submitting}>
          {submitting ? 'Saving…' : 'Continue →'}
        </PrimaryButton>
      </div>
      <MissingItemsNote message={showMissing ? missingMessage : null} />
    </div>
  )
}
