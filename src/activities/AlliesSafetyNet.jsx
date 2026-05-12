// Allies / Safety Net — Step 1 (Build) only, v2.0 per the 2026-05-11
// review-meeting batch.
//
// The previous 4-step flow (Build → Inspect → Strengthen → Review) has
// been torn down in this commit. Steps 2–4 will be rebuilt later (Task
// #7) after the team's design discussion. For now this activity ships
// just the Build step plus a competent placeholder visual for the
// assembled Safety Net.
//
// Flow:
//   Screen 1 — Intro: what an ally is, three support types previewed
//   Screen 2 — Practical support: tile grid + multi-select + "None of these"
//   Screen 3 — Emotional support: same
//   Screen 4 — Social support: same
//   Screen 5 — Your Safety Net: placeholder visual, then Save
//
// Selection is PER-TYPE. A kid who selects Mom on Practical does not
// pre-select her on Emotional — the cumulative ally entity is built
// from the union of types across screens. Custom names typed into
// other1/other2 persist across the three type screens.

import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { PrimaryButton, GhostButton } from '../components/items/shared.jsx'
import { ALLY_TILES, SUPPORT_TYPES } from '../lib/allyTiles.js'

// Convenience: which tile ids are custom-name-entry tiles. Keep ALLY_TILES
// as the source of truth (via `custom: true`); this is a derived set.
const CUSTOM_TILE_IDS = new Set(ALLY_TILES.filter((t) => t.custom).map((t) => t.id))

// Initial selection shape — { [type_id]: Set<tile_id> } plus per-type
// "none of these" flags and per-custom-tile names.
function initialSelection() {
  const sel = {}
  const none = {}
  for (const t of SUPPORT_TYPES) {
    sel[t.id] = new Set()
    none[t.id] = false
  }
  return { sel, none }
}

export default function AlliesSafetyNet({ onSave = console.log }) {
  const [screenIdx, setScreenIdx] = useState(0)
  // selection[typeId] is a Set of tile ids
  const [selection, setSelection] = useState(() => initialSelection().sel)
  const [noneFor, setNoneFor] = useState(() => initialSelection().none)
  // customNames[tileId] is the user-typed name for other1/other2.
  // Persists across all three type screens.
  const [customNames, setCustomNames] = useState({})
  // editingCustom[tileId] toggles the inline text input on a custom tile.
  const [editingCustom, setEditingCustom] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const totalScreens = 2 + SUPPORT_TYPES.length // 1 intro + 3 types + 1 visual

  function goNext() {
    if (screenIdx < totalScreens - 1) setScreenIdx((i) => i + 1)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function goBack() {
    if (screenIdx > 0) setScreenIdx((i) => i - 1)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function toggleTile(typeId, tileId) {
    // Tapping any tile clears the "none of these" flag for the current
    // type. The two states are mutually exclusive — kid affirmed there
    // is at least one ally for this type.
    setNoneFor((prev) => ({ ...prev, [typeId]: false }))
    setSelection((prev) => {
      const next = { ...prev }
      const cur = new Set(prev[typeId])
      if (cur.has(tileId)) cur.delete(tileId)
      else cur.add(tileId)
      next[typeId] = cur
      return next
    })
  }

  function commitCustomName(tileId, raw) {
    const name = (raw || '').trim()
    setEditingCustom((prev) => ({ ...prev, [tileId]: false }))
    if (!name) {
      // If the user emptied the field, drop the custom name and any
      // selections of this tile across all type screens.
      setCustomNames((prev) => {
        const next = { ...prev }
        delete next[tileId]
        return next
      })
      setSelection((prev) => {
        const next = {}
        for (const [k, v] of Object.entries(prev)) {
          const s = new Set(v)
          s.delete(tileId)
          next[k] = s
        }
        return next
      })
      return
    }
    setCustomNames((prev) => ({ ...prev, [tileId]: name }))
  }

  function handleNoneOfThese(typeId) {
    setNoneFor((prev) => ({ ...prev, [typeId]: !prev[typeId] }))
    // Tapping "none of these" clears any tile selections for this type —
    // they're mutually exclusive states.
    setSelection((prev) => ({ ...prev, [typeId]: new Set() }))
  }

  // The deduplicated ally list — each tile id (or custom tile that has a
  // name) appears once with the union of its support types across the
  // three type screens. Memo because the safety-net visual reads from it.
  const deduplicatedAllies = useMemo(() => {
    const byTile = new Map() // tile_id → { id, name, custom, support_types: [] }
    for (const t of SUPPORT_TYPES) {
      for (const tileId of selection[t.id] || []) {
        // Skip custom tiles that don't have a name yet.
        if (CUSTOM_TILE_IDS.has(tileId) && !customNames[tileId]) continue
        const tile = ALLY_TILES.find((x) => x.id === tileId)
        if (!tile) continue
        const displayName = tile.custom ? customNames[tileId] : tile.name
        if (!byTile.has(tileId)) {
          byTile.set(tileId, {
            id: tileId,
            name: displayName,
            custom: !!tile.custom,
            support_types: [],
          })
        }
        byTile.get(tileId).support_types.push(t.id)
      }
    }
    return Array.from(byTile.values())
  }, [selection, customNames])

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await onSave({
        activity: 'allies_safety_net',
        version: '2.0',
        allies: deduplicatedAllies,
        none_for: {
          practical: !!noneFor.practical,
          emotional: !!noneFor.emotional,
          social: !!noneFor.social,
        },
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
        <h2 className="text-[22px] font-semibold mb-2">Saved</h2>
        <p className="text-[15px] text-slate-700">
          Your safety net is captured. You can come back to it any time.
        </p>
      </div>
    )
  }

  // ---- Screen routing ----
  // Index 0 = intro, 1..N = type screens, N+1 = visual
  const isIntro = screenIdx === 0
  const typeIdx = screenIdx - 1
  const isTypeScreen = typeIdx >= 0 && typeIdx < SUPPORT_TYPES.length
  const isVisual = screenIdx === totalScreens - 1

  return (
    <div>
      {/* Progress strip */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] text-slate-500 uppercase tracking-wide">
            Step {screenIdx + 1} of {totalScreens}
          </span>
          <span className="text-[12px] text-slate-500">
            {isIntro
              ? 'Intro'
              : isTypeScreen
                ? SUPPORT_TYPES[typeIdx].label
                : 'Your Safety Net'}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all"
            style={{ width: `${((screenIdx + 1) / totalScreens) * 100}%` }}
          />
        </div>
      </div>

      {isIntro && <IntroScreen />}

      {isTypeScreen && (
        <TypeScreen
          type={SUPPORT_TYPES[typeIdx]}
          selectedIds={selection[SUPPORT_TYPES[typeIdx].id]}
          isNone={!!noneFor[SUPPORT_TYPES[typeIdx].id]}
          customNames={customNames}
          editingCustom={editingCustom}
          onToggleTile={(tileId) => toggleTile(SUPPORT_TYPES[typeIdx].id, tileId)}
          onStartCustomEdit={(tileId) =>
            setEditingCustom((prev) => ({ ...prev, [tileId]: true }))
          }
          onCommitCustomName={commitCustomName}
          onNoneOfThese={() => handleNoneOfThese(SUPPORT_TYPES[typeIdx].id)}
        />
      )}

      {isVisual && (
        <SafetyNetVisual allies={deduplicatedAllies} noneFor={noneFor} />
      )}

      <div className="flex items-center justify-between mt-6">
        {!isIntro ? (
          <GhostButton onClick={goBack}>← Back</GhostButton>
        ) : (
          <span />
        )}
        {isVisual ? (
          <PrimaryButton onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={goNext}>
            {isIntro ? "Let's build it →" : 'Continue →'}
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}

// ---------- Screen 1: Intro ----------

function IntroScreen() {
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-3">
        Who are the allies in your safety net?
      </h2>
      <p className="text-[15px] leading-relaxed text-slate-800 mb-4">
        An ally is someone you trust to provide support and help you become
        the person you want to be. They might not always get it right, but
        you know they care about you, they&apos;re a positive influence,
        and they try to help.
      </p>
      <p className="text-[15px] leading-relaxed text-slate-800 mb-3">
        The strongest safety nets have allies who provide different kinds
        of support:
      </p>
      <ul className="space-y-2 mb-4 text-[15px] leading-relaxed text-slate-800">
        {SUPPORT_TYPES.map((t) => (
          <li key={t.id} className="flex gap-2">
            <span className="font-semibold text-amber-800">{t.label}</span>
            <span>— {t.definition}</span>
          </li>
        ))}
      </ul>
      <p className="text-[15px] leading-relaxed text-slate-800">
        Let&apos;s build your safety net.
      </p>
    </div>
  )
}

// ---------- Screens 2/3/4: Per-support-type tile grid ----------

function TypeScreen({
  type,
  selectedIds,
  isNone,
  customNames,
  editingCustom,
  onToggleTile,
  onStartCustomEdit,
  onCommitCustomName,
  onNoneOfThese,
}) {
  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-1">
        Who provides {type.label.toLowerCase()} support for you?
      </h2>
      <p className="text-[14px] text-slate-600 mb-5 leading-relaxed">
        {type.definition}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {ALLY_TILES.map((tile) => (
          <AllyTile
            key={tile.id}
            tile={tile}
            selected={selectedIds.has(tile.id)}
            customName={customNames[tile.id]}
            isEditing={!!editingCustom[tile.id]}
            onToggle={() => onToggleTile(tile.id)}
            onStartEdit={() => onStartCustomEdit(tile.id)}
            onCommit={(v) => onCommitCustomName(tile.id, v)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onNoneOfThese}
        aria-pressed={isNone}
        className={
          'w-full text-[14px] font-medium rounded-2xl border min-h-[48px] px-4 py-2 transition-colors ' +
          (isNone
            ? 'bg-slate-200 border-slate-400 text-slate-800'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400')
        }
      >
        {isNone
          ? `✓ Nobody for ${type.label.toLowerCase()} support right now`
          : `None of these are ${type.label.toLowerCase()} support for me.`}
      </button>
    </div>
  )
}

function AllyTile({ tile, selected, customName, isEditing, onToggle, onStartEdit, onCommit }) {
  const displayName = tile.custom ? customName || tile.name : tile.name
  const showInput = tile.custom && isEditing

  function handleTap() {
    // Custom tiles without a name yet route to the name editor instead of
    // toggling — there's no useful selection without a name.
    if (tile.custom && !customName) {
      onStartEdit()
      return
    }
    onToggle()
  }

  function handleInputKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const v = e.target.value
      onCommit(v)
      // After committing a name, auto-select the tile so the kid doesn't
      // have to tap a second time.
      if ((v || '').trim()) onToggle()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCommit('')
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleTap}
        aria-pressed={selected}
        className={
          'w-full h-full flex flex-col items-center justify-start gap-2 rounded-2xl border-2 px-3 py-3 min-h-[160px] transition-all bg-white text-center ' +
          (selected
            ? 'border-amber-500 ring-2 ring-amber-200 shadow-card'
            : 'border-slate-200 hover:border-amber-300')
        }
      >
        <img
          src={tile.icon}
          alt=""
          className="w-[88px] h-[88px] flex-shrink-0 pointer-events-none"
          draggable={false}
        />
        {showInput ? (
          <input
            type="text"
            autoFocus
            defaultValue={customName || ''}
            onBlur={(e) => onCommit(e.target.value)}
            onKeyDown={handleInputKey}
            onClick={(e) => e.stopPropagation()}
            placeholder="Their name"
            maxLength={40}
            className="w-full text-[13px] px-2 py-1 bg-amber-50 border border-amber-200 rounded-full text-center focus:outline-none focus:border-amber-400"
          />
        ) : (
          <span
            className={
              'text-[13px] leading-tight font-medium ' +
              (selected ? 'text-amber-900' : 'text-slate-800')
            }
          >
            {displayName}
            {tile.custom && customName && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  onStartEdit()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    onStartEdit()
                  }
                }}
                className="block text-[11px] text-amber-700 hover:text-amber-900 underline mt-0.5 cursor-pointer"
              >
                edit name
              </span>
            )}
          </span>
        )}
      </button>
      {selected && !showInput && (
        <span
          aria-hidden="true"
          className="absolute top-2 right-2 inline-flex items-center justify-center bg-amber-500 text-white rounded-full w-6 h-6 shadow"
        >
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </div>
  )
}

// ---------- Screen 5: Safety Net visual (placeholder) ----------
// Deliberately not the final visual — Josh is exploring a merged
// net + pie design in Claude Design separately. The data shape this
// reads from is the source of truth; the final visual is a render-layer
// swap.

function SafetyNetVisual({ allies, noneFor }) {
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-3">Your safety net</h2>
      <p className="text-[14px] text-slate-600 mb-5 leading-relaxed">
        Here&apos;s who you said is in your corner, grouped by the kind of
        support they give you. Some allies show up in more than one place
        — that&apos;s the strongest kind.
      </p>

      <div className="space-y-4">
        {SUPPORT_TYPES.map((type) => {
          const inGroup = allies.filter((a) => a.support_types.includes(type.id))
          const declaredNone = !!noneFor[type.id]
          return (
            <section
              key={type.id}
              className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4"
            >
              <h3 className="text-[16px] font-semibold text-amber-900 mb-2">
                {type.label}
              </h3>
              {inGroup.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {inGroup.map((ally) => {
                    const tile = ALLY_TILES.find((t) => t.id === ally.id)
                    return (
                      <div
                        key={ally.id}
                        className="flex flex-col items-center text-center"
                      >
                        <img
                          src={tile?.icon}
                          alt=""
                          className="w-[64px] h-[64px] mb-1"
                          draggable={false}
                        />
                        <span className="text-[12px] leading-tight text-slate-800">
                          {ally.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-[13px] text-slate-500 italic leading-relaxed">
                  {declaredNone
                    ? `No ${type.label.toLowerCase()} support allies yet — that's okay. Sometimes it starts with looking for someone who could become one.`
                    : `No ${type.label.toLowerCase()} support allies chosen.`}
                </p>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
