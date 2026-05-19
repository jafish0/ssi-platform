// Allies / Safety Net — v5.0 (Draft 19 Part A, 2026-05-19).
//
// Five-part activity:
//   Part 1 (Build) — intro + per-type transition + per-type tile grid,
//                    one transition + one selection screen per support
//                    type (Practical → Emotional → Social).
//   Part 1 final  — Your Safety Net (TrampolineNet, non-interactive).
//   Part 2 (Inspect) — educational screen (video placeholder + 4 red
//                    flags) + a single X-out screen where the kid taps
//                    × on any ally they want to take out of their net.
//   Part 3 (Strengthen) — for each support type with 0 or 1 ally
//                    post-removal, a per-type screen prompts "Who could
//                    that be? What's one thing you could do?" with
//                    suggestion chips drawn from the kid's other-type
//                    allies. Skippable.
//   Part 4 (Review) — final net (post-removal), kept-allies summary,
//                    Strengthen commitments rendered as callouts, save.
//
// Why the change from v4.x:
//   - Stephanie's 2026-05-18 transcript called for an educational-frame
//     + visual X-out pattern instead of per-ally modal walkthrough.
//   - Holly asked for color-coded support types (Practical / Emotional /
//     Social) so the kid can see they're on a different screen even
//     when looking at the same grid of icons.
//   - 22 new ally icons (vs v4's 15) — splits foster/bio/grandparent
//     into mom+dad / mother+father pairs, adds boyfriend, girlfriend,
//     best-friend, friends (group).
//   - The Strengthen step was torn down in v2.0 (commit d515d0e) pending
//     team design; Stephanie's 2026-05-18 transcript spec brings it back.
//
// Mobile vs desktop: every TrampolineNet render site wraps in
// `mx-auto w-full max-w-[420px] md:max-w-[700px]`. Build-phase tile
// grids stay at 2 columns on mobile / 3 on tablet+desktop.
//
// Save payload (v5.0 shape — see Draft 19 A.7):
//   {
//     activity: "allies_safety_net",
//     version: "5.0",
//     allies: [{id, name, custom, support_types: [...]}],
//     none_for: { practical, emotional, social },
//     removed_via_inspect: ["ally_id_1", ...],
//     inspection_completed: bool,
//     strengthened: {
//       practical: { gap_filler, action, skipped } | null,
//       emotional: { gap_filler, action, skipped } | null,
//       social:    { gap_filler, action, skipped } | null,
//     },
//     saved_at: "..."
//   }

import { useMemo, useRef, useState } from 'react'
import { Check, Download, PlayCircle } from 'lucide-react'
import { PrimaryButton, GhostButton } from '../components/items/shared.jsx'
import { ALLY_TILES, SUPPORT_TYPES } from '../lib/allyTiles.js'
import TrampolineNet from '../components/TrampolineNet.jsx'
import { downloadSvgElementAsPng } from '../lib/imageDownload.js'

// Which tile ids are custom-name-entry tiles. ALLY_TILES is the source
// of truth (via `custom: true`); this is a derived set.
const CUSTOM_TILE_IDS = new Set(ALLY_TILES.filter((t) => t.custom).map((t) => t.id))

// Per-tone color tokens (driven by SUPPORT_TYPES[*].tone — see allyTiles.js).
// Practical = amber (anchors the kid in the platform's primary palette),
// Emotional = rose (soft warm), Social = sky (cool blue). Holly's
// 2026-05-18 transcript suggestion.
const TONE_TOKENS = {
  amber: {
    word: 'text-amber-700',
    transitionBg: 'bg-amber-100',
    tileBg: 'bg-amber-50',
    selectedBorder: 'border-amber-500',
    selectedRing: 'ring-amber-200',
    headerAccent: 'text-amber-800',
    callout: 'bg-amber-50 border-amber-200',
    chip: 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300',
  },
  rose: {
    word: 'text-rose-700',
    transitionBg: 'bg-rose-100',
    tileBg: 'bg-rose-50',
    selectedBorder: 'border-rose-500',
    selectedRing: 'ring-rose-200',
    headerAccent: 'text-rose-800',
    callout: 'bg-rose-50 border-rose-200',
    chip: 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300',
  },
  sky: {
    word: 'text-sky-700',
    transitionBg: 'bg-sky-100',
    tileBg: 'bg-sky-50',
    selectedBorder: 'border-sky-500',
    selectedRing: 'ring-sky-200',
    headerAccent: 'text-sky-800',
    callout: 'bg-sky-50 border-sky-200',
    chip: 'bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-300',
  },
}

function toneFor(typeId) {
  const t = SUPPORT_TYPES.find((x) => x.id === typeId)
  return TONE_TOKENS[t?.tone] || TONE_TOKENS.amber
}

// Initial selection shape — { [type_id]: Set<tile_id> } plus per-type
// "none of these" flags.
function initialSelection() {
  const sel = {}
  const none = {}
  for (const t of SUPPORT_TYPES) {
    sel[t.id] = new Set()
    none[t.id] = false
  }
  return { sel, none }
}

function initialStrengthened() {
  const m = {}
  for (const t of SUPPORT_TYPES) m[t.id] = null
  return m
}

export default function AlliesSafetyNet({ onSave = console.log }) {
  // ---- Build phase state ----
  const [selection, setSelection] = useState(() => initialSelection().sel)
  const [noneFor, setNoneFor] = useState(() => initialSelection().none)
  const [customNames, setCustomNames] = useState({})
  const [editingCustom, setEditingCustom] = useState({})
  // ---- Inspect phase state — v5.0: a flat set of ally ids the kid
  //      tapped × on. No per-ally flags anymore.
  const [removedViaInspect, setRemovedViaInspect] = useState(() => new Set())
  const [inspectionCompleted, setInspectionCompleted] = useState(false)
  // ---- Strengthen phase state — per-type entry or null if no gap. ----
  const [strengthened, setStrengthened] = useState(() => initialStrengthened())
  // ---- Submit ----
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // ---- Build-phase helpers ----

  function toggleTile(typeId, tileId) {
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
    setSelection((prev) => ({ ...prev, [typeId]: new Set() }))
  }

  // Deduplicated ally list — each tile id (or named custom tile) appears
  // once with the union of its support types across the three build screens.
  // Folds in v5.0 `removed_via_inspect` so the TrampolineNet visual knows
  // to fade/X-out tagged allies on the X-out screen, and so the Review
  // screen can drop them to the bottom "Taken out of net" strip.
  const deduplicatedAllies = useMemo(() => {
    const byTile = new Map()
    for (const t of SUPPORT_TYPES) {
      for (const tileId of selection[t.id] || []) {
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
    return Array.from(byTile.values()).map((a) => ({
      ...a,
      removed_via_inspect: removedViaInspect.has(a.id),
    }))
  }, [selection, customNames, removedViaInspect])

  // Allies for the Review screen — `removed_via_inspect` allies get
  // `removed: true` so the TrampolineNet bottom strip catches them.
  const reviewAllies = useMemo(
    () =>
      deduplicatedAllies.map((a) => ({
        ...a,
        removed: a.removed_via_inspect,
      })),
    [deduplicatedAllies],
  )

  // Allies still in the net after Inspect — drives gap detection.
  const keptAllies = useMemo(
    () => deduplicatedAllies.filter((a) => !a.removed_via_inspect),
    [deduplicatedAllies],
  )

  // Per-type kept ally count post-removal. Drives gap detection.
  const keptCountByType = useMemo(() => {
    const counts = {}
    for (const t of SUPPORT_TYPES) counts[t.id] = 0
    for (const a of keptAllies) {
      for (const tid of a.support_types || []) {
        if (counts[tid] != null) counts[tid] += 1
      }
    }
    return counts
  }, [keptAllies])

  // Types that need a Strengthen screen (post-removal count ≤ 1).
  // Order matches SUPPORT_TYPES (Practical → Emotional → Social).
  const gapTypeIds = useMemo(
    () =>
      SUPPORT_TYPES.filter((t) => keptCountByType[t.id] <= 1).map((t) => t.id),
    [keptCountByType],
  )

  // ---- Screen flow ----
  //
  // The screen list is computed from current state. Strengthen screens
  // come and go as the kid toggles allies on the X-out screen — but
  // they navigate forward (Continue) so index shifts under them aren't
  // a problem in practice.

  const screens = useMemo(() => {
    const list = [
      { type: 'intro' },
      // Per-type pairs: transition then selection.
      ...SUPPORT_TYPES.flatMap((t) => [
        { type: 'transition', supportType: t.id },
        { type: 'select', supportType: t.id },
      ]),
      { type: 'build-final' },
      { type: 'inspect-education' },
      { type: 'inspect-xout' },
      ...gapTypeIds.map((typeId) => ({ type: 'strengthen', supportType: typeId })),
      { type: 'review' },
    ]
    return list
  }, [gapTypeIds])

  const [screenIdx, setScreenIdx] = useState(0)
  // Clamp screenIdx if the screens array shrinks beneath the kid (e.g.
  // they restored an ally via × toggle and a Strengthen screen disappeared).
  // useMemo of `screens` recomputes on dependency change; clamp on render.
  const safeScreenIdx = Math.min(screenIdx, screens.length - 1)
  const screen = screens[safeScreenIdx]
  const isFirstScreen = safeScreenIdx === 0
  const isReviewScreen = screen?.type === 'review'

  // ---- Navigation ----
  function goNext() {
    setScreenIdx((i) => Math.min(i + 1, screens.length - 1))
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
    // Mark inspect-xout as complete when the kid hits Continue from it.
    if (screen?.type === 'inspect-xout') setInspectionCompleted(true)
  }
  function goBack() {
    if (safeScreenIdx > 0) setScreenIdx(safeScreenIdx - 1)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' })
  }

  // ---- Inspect-phase helpers ----
  function toggleAllyRemoved(allyId) {
    setRemovedViaInspect((prev) => {
      const next = new Set(prev)
      if (next.has(allyId)) next.delete(allyId)
      else next.add(allyId)
      return next
    })
  }

  // ---- Strengthen-phase helpers ----
  function updateStrengthen(typeId, patch) {
    setStrengthened((prev) => {
      const cur = prev[typeId] || { gap_filler: '', action: '', skipped: false }
      return { ...prev, [typeId]: { ...cur, ...patch } }
    })
  }
  function skipStrengthen(typeId) {
    setStrengthened((prev) => ({
      ...prev,
      [typeId]: { gap_filler: '', action: '', skipped: true },
    }))
    goNext()
  }

  // ---- Submit ----
  async function handleSubmit() {
    setSubmitting(true)
    try {
      const allies = deduplicatedAllies.map((a) => ({
        id: a.id,
        name: a.name,
        custom: !!a.custom,
        support_types: a.support_types,
      }))
      // Build strengthened payload — only keys for types that had a gap
      // get an entry; other types stay null.
      const strengthenedOut = {}
      for (const t of SUPPORT_TYPES) {
        const isGap = gapTypeIds.includes(t.id)
        if (!isGap) {
          strengthenedOut[t.id] = null
        } else if (strengthened[t.id]) {
          strengthenedOut[t.id] = {
            gap_filler: strengthened[t.id].gap_filler || '',
            action: strengthened[t.id].action || '',
            skipped: !!strengthened[t.id].skipped,
          }
        } else {
          // Kid hit a gap screen but moved through without entering anything
          // and without explicitly skipping — treat as skipped for cleanliness.
          strengthenedOut[t.id] = { gap_filler: '', action: '', skipped: true }
        }
      }
      await onSave({
        activity: 'allies_safety_net',
        version: '5.0',
        allies,
        none_for: {
          practical: !!noneFor.practical,
          emotional: !!noneFor.emotional,
          social: !!noneFor.social,
        },
        removed_via_inspect: Array.from(removedViaInspect),
        inspection_completed: inspectionCompleted,
        strengthened: strengthenedOut,
        saved_at: new Date().toISOString(),
      })
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return <SavedConfirmation allies={reviewAllies} noneFor={noneFor} strengthened={strengthened} gapTypeIds={gapTypeIds} />
  }

  return (
    <div>
      {/* Progress strip */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] text-slate-500 uppercase tracking-wide">
            Step {safeScreenIdx + 1} of {screens.length}
          </span>
          <span className="text-[12px] text-slate-500">
            {progressLabel(screen)}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all"
            style={{ width: `${((safeScreenIdx + 1) / screens.length) * 100}%` }}
          />
        </div>
      </div>

      {screen?.type === 'intro' && <IntroScreen />}

      {screen?.type === 'transition' && (
        <TransitionScreen typeId={screen.supportType} />
      )}

      {screen?.type === 'select' && (
        <TypeScreen
          typeId={screen.supportType}
          selectedIds={selection[screen.supportType]}
          isNone={!!noneFor[screen.supportType]}
          customNames={customNames}
          editingCustom={editingCustom}
          onToggleTile={(tileId) => toggleTile(screen.supportType, tileId)}
          onStartCustomEdit={(tileId) =>
            setEditingCustom((prev) => ({ ...prev, [tileId]: true }))
          }
          onCommitCustomName={commitCustomName}
          onNoneOfThese={() => handleNoneOfThese(screen.supportType)}
        />
      )}

      {screen?.type === 'build-final' && (
        <BuildFinalScreen allies={deduplicatedAllies} noneFor={noneFor} />
      )}

      {screen?.type === 'inspect-education' && <InspectEducationScreen />}

      {screen?.type === 'inspect-xout' && (
        <InspectXOutScreen
          allies={deduplicatedAllies}
          onToggleRemoved={toggleAllyRemoved}
        />
      )}

      {screen?.type === 'strengthen' && (
        <StrengthenScreen
          typeId={screen.supportType}
          keptCount={keptCountByType[screen.supportType]}
          keptAllies={keptAllies}
          entry={strengthened[screen.supportType]}
          onChange={(patch) => updateStrengthen(screen.supportType, patch)}
          onSkip={() => skipStrengthen(screen.supportType)}
        />
      )}

      {screen?.type === 'review' && (
        <ReviewScreen
          allies={reviewAllies}
          noneFor={noneFor}
          strengthened={strengthened}
          gapTypeIds={gapTypeIds}
        />
      )}

      <div className="flex items-center justify-between mt-6">
        {!isFirstScreen ? (
          <GhostButton onClick={goBack}>← Back</GhostButton>
        ) : (
          <span />
        )}
        <PrimaryAdvanceButton
          screen={screen}
          submitting={submitting}
          onNext={goNext}
          onSubmit={handleSubmit}
          isReview={isReviewScreen}
        />
      </div>
    </div>
  )
}

// ---------- Post-save confirmation (with downloadable keepsake) ----------

function SavedConfirmation({ allies, noneFor, strengthened, gapTypeIds }) {
  const wrapRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)

  async function handleDownload() {
    setError(null)
    setDownloading(true)
    try {
      const svg = wrapRef.current?.querySelector('svg')
      if (!svg) throw new Error('No safety-net visual to download.')
      const stamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
      await downloadSvgElementAsPng(svg, `my-safety-net-${stamp}.png`)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not save the image.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="text-center py-2">
      <h2 className="text-[22px] font-semibold mb-2">Saved</h2>
      <p className="text-[15px] text-slate-700 mb-5">
        Your safety net is captured. You can come back to it any time.
      </p>
      <div ref={wrapRef} className="mb-4">
        <NetWithListToggle allies={allies} noneFor={noneFor} />
      </div>
      {gapTypeIds && gapTypeIds.length > 0 && (
        <StrengthenSummary
          strengthened={strengthened}
          gapTypeIds={gapTypeIds}
        />
      )}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-full px-5 py-2 min-h-[44px] text-[14px]"
        >
          <Download size={14} strokeWidth={2} />
          {downloading ? 'Saving image…' : 'Save as image'}
        </button>
        {error && (
          <p role="alert" className="text-[12px] text-rose-600">{error}</p>
        )}
      </div>
    </div>
  )
}

function progressLabel(screen) {
  if (!screen) return ''
  switch (screen.type) {
    case 'intro': return 'Intro'
    case 'transition':
    case 'select': {
      const t = SUPPORT_TYPES.find((x) => x.id === screen.supportType)
      return t ? t.label : ''
    }
    case 'build-final': return 'Your Safety Net'
    case 'inspect-education': return 'Inspect · Watch out for'
    case 'inspect-xout': return 'Inspect · Take out'
    case 'strengthen': {
      const t = SUPPORT_TYPES.find((x) => x.id === screen.supportType)
      return t ? `Strengthen · ${t.label}` : 'Strengthen'
    }
    case 'review': return 'Review & save'
    default: return ''
  }
}

function PrimaryAdvanceButton({ screen, submitting, onNext, onSubmit, isReview }) {
  if (!screen) return null
  if (isReview) {
    return (
      <PrimaryButton onClick={onSubmit} disabled={submitting}>
        {submitting ? 'Saving…' : 'Save my safety net'}
      </PrimaryButton>
    )
  }
  if (screen.type === 'intro') {
    return <PrimaryButton onClick={onNext}>Let&apos;s build it →</PrimaryButton>
  }
  if (screen.type === 'transition') {
    return <PrimaryButton onClick={onNext}>Continue →</PrimaryButton>
  }
  if (screen.type === 'select') {
    return <PrimaryButton onClick={onNext}>Continue →</PrimaryButton>
  }
  if (screen.type === 'build-final') {
    return <PrimaryButton onClick={onNext}>Inspect your net →</PrimaryButton>
  }
  if (screen.type === 'inspect-education') {
    return <PrimaryButton onClick={onNext}>Continue →</PrimaryButton>
  }
  if (screen.type === 'inspect-xout') {
    return <PrimaryButton onClick={onNext}>Continue →</PrimaryButton>
  }
  if (screen.type === 'strengthen') {
    return <PrimaryButton onClick={onNext}>Continue →</PrimaryButton>
  }
  return null
}

// ---------- Intro screen ----------

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
        We&apos;ll walk through three kinds of support — one at a time:
      </p>
      <ul className="space-y-2 mb-4 text-[15px] leading-relaxed text-slate-800">
        {SUPPORT_TYPES.map((t) => {
          const tones = TONE_TOKENS[t.tone] || TONE_TOKENS.amber
          return (
            <li key={t.id} className="flex gap-2">
              <span className={`font-semibold ${tones.word}`}>{t.label}</span>
              <span>— {t.definition}</span>
            </li>
          )
        })}
      </ul>
      <p className="text-[15px] leading-relaxed text-slate-800">
        Let&apos;s build your safety net.
      </p>
    </div>
  )
}

// ---------- Transition screens (one per support type) ----------

function TransitionScreen({ typeId }) {
  const t = SUPPORT_TYPES.find((x) => x.id === typeId)
  if (!t) return null
  const tones = TONE_TOKENS[t.tone] || TONE_TOKENS.amber
  return (
    <div
      className={`rounded-3xl border border-slate-200 ${tones.transitionBg} px-6 py-10 text-center`}
    >
      <p className="text-[12px] uppercase tracking-widest text-slate-600 mb-2">
        Next up
      </p>
      <h2 className={`text-[28px] font-bold mb-3 ${tones.word}`}>
        {t.label} support
      </h2>
      <p className="text-[16px] leading-relaxed text-slate-800 max-w-[480px] mx-auto">
        {t.definition}
      </p>
    </div>
  )
}

// ---------- Selection screens (one per support type) ----------

function TypeScreen({
  typeId,
  selectedIds,
  isNone,
  customNames,
  editingCustom,
  onToggleTile,
  onStartCustomEdit,
  onCommitCustomName,
  onNoneOfThese,
}) {
  const t = SUPPORT_TYPES.find((x) => x.id === typeId)
  if (!t) return null
  const tones = TONE_TOKENS[t.tone] || TONE_TOKENS.amber
  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-1">
        Who provides{' '}
        <span className={`${tones.word} font-bold`}>{t.label.toLowerCase()}</span>{' '}
        support for you?
      </h2>
      <p className="text-[14px] text-slate-600 mb-5 leading-relaxed">
        {t.definition}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {ALLY_TILES.map((tile) => (
          <AllyTile
            key={tile.id}
            tile={tile}
            tones={tones}
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
          ? `✓ Nobody for ${t.label.toLowerCase()} support right now`
          : `None of these are ${t.label.toLowerCase()} support for me.`}
      </button>
    </div>
  )
}

function AllyTile({ tile, tones, selected, customName, isEditing, onToggle, onStartEdit, onCommit }) {
  const displayName = tile.custom ? customName || tile.name : tile.name
  const showInput = tile.custom && isEditing

  function handleTap() {
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
          'w-full h-full flex flex-col items-center justify-start gap-2 rounded-2xl border-2 px-3 py-3 min-h-[160px] transition-all text-center ' +
          `${tones.tileBg} ` +
          (selected
            ? `${tones.selectedBorder} ring-2 ${tones.selectedRing} shadow-card`
            : 'border-slate-200 hover:border-slate-400')
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
            className="w-full text-[13px] px-2 py-1 bg-white border border-amber-200 rounded-full text-center focus:outline-none focus:border-amber-400"
          />
        ) : (
          <span
            className={
              'text-[13px] leading-tight font-medium ' +
              (selected ? 'text-slate-900' : 'text-slate-800')
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
                className="block text-[11px] text-slate-600 hover:text-slate-900 underline mt-0.5 cursor-pointer"
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
          className="absolute top-2 right-2 inline-flex items-center justify-center bg-slate-900 text-white rounded-full w-6 h-6 shadow"
        >
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </div>
  )
}

// ---------- Build final — TrampolineNet (non-interactive) ----------

function BuildFinalScreen({ allies, noneFor }) {
  const allEmpty =
    allies.length === 0 && Object.values(noneFor).some((v) => v)
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2">Your safety net</h2>
      <p className="text-[14px] text-slate-600 mb-5 leading-relaxed">
        {allEmpty
          ? 'No allies yet — that\'s okay. We\'ll look at where support could grow.'
          : 'Here\'s who you said is in your corner, grouped by the kind of support they give you. Some allies show up in more than one place — that\'s the strongest kind.'}
      </p>
      <NetWithListToggle allies={allies} noneFor={noneFor} />
    </div>
  )
}

// ---------- Inspect Education ----------

function InspectEducationScreen() {
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-3">
        Watch out for warning signs.
      </h2>
      <p className="text-[15px] leading-relaxed text-slate-800 mb-4">
        Not everyone in your life belongs in your safety net. Sometimes
        people we&apos;re close to don&apos;t actually help us feel safer.
        Let&apos;s look at four warning signs.
      </p>

      {/* Video placeholder — Adrian will record the actual content;
          this is just a structurally-positioned container with a fixed
          16:9 aspect ratio so the eventual video drops in cleanly. */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div
          className="relative w-full bg-slate-900"
          style={{ paddingBottom: '56.25%' }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-200 gap-2">
            <PlayCircle size={48} strokeWidth={1.4} />
            <span className="text-[13px] uppercase tracking-widest">
              Video coming soon
            </span>
          </div>
        </div>
      </div>

      {/* Four red-flag bullets — Stephanie's PPT phrasing, verbatim
          from commit 71a37e9. Don't edit without Stephanie's sign-off. */}
      <p className="text-[15px] leading-relaxed text-slate-800 mb-2 font-medium">
        Watch out for relationships where the person:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-[15px] leading-relaxed text-slate-800 mb-4">
        <li>usually gets you into trouble</li>
        <li>
          tries to keep you from talking to or getting close to other people
        </li>
        <li>frequently lies to you</li>
        <li>makes you feel afraid</li>
      </ul>

      <p className="text-[15px] leading-relaxed text-slate-800">
        On the next screen, you&apos;ll see your safety net. You can take
        out anyone you&apos;d like to take out. They&apos;ll still be in
        your life — this is just about who you lean on for support right
        now.
      </p>
    </div>
  )
}

// ---------- Inspect X-out ----------
//
// Per Stephanie's transcript: the kid taps × on any ally they want to
// take out. Visual: faded to 30%, big red X overlays the icon. Tap × in
// the corner again to restore. No modals, no per-ally questions.

function InspectXOutScreen({ allies, onToggleRemoved }) {
  if (allies.length === 0) {
    return (
      <div className="text-center py-6">
        <h2 className="text-[20px] font-semibold mb-3">Nothing to inspect.</h2>
        <p className="text-[15px] text-slate-700">
          You don&apos;t have any allies in your safety net yet — that&apos;s
          okay. Use Continue below to keep going.
        </p>
      </div>
    )
  }
  const removedCount = allies.filter((a) => a.removed_via_inspect).length
  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-2">
        Anyone you want to take out of your net?
      </h2>
      <p className="text-[14px] text-slate-600 mb-5 leading-relaxed">
        Tap the <span className="font-semibold">×</span> on anyone you want
        to take out of your safety net. Tap again to put them back.
      </p>
      <div className="mx-auto w-full max-w-[420px] md:max-w-[700px]">
        <TrampolineNet
          allies={allies}
          inspectMode={true}
          onAllyToggleRemoved={onToggleRemoved}
          showLabels={true}
        />
      </div>
      {removedCount > 0 && (
        <p className="text-[13px] text-slate-600 italic text-center mt-3">
          {removedCount === 1
            ? '1 ally taken out — they\'re still in your life.'
            : `${removedCount} allies taken out — they're still in your life.`}
        </p>
      )}
    </div>
  )
}

// ---------- Strengthen (per gap) ----------

function StrengthenScreen({ typeId, keptCount, keptAllies, entry, onChange, onSkip }) {
  const t = SUPPORT_TYPES.find((x) => x.id === typeId)
  if (!t) return null
  const tones = TONE_TOKENS[t.tone] || TONE_TOKENS.amber
  // Suggestion chips — allies the kid has in OTHER support types that
  // could plausibly fit this one too. Holly's transcript point.
  const otherTypeAllies = keptAllies.filter(
    (a) => !(a.support_types || []).includes(typeId),
  )
  // Dedupe by id (an ally in two other types still suggests once).
  const suggestionIds = new Set()
  const suggestions = []
  for (const a of otherTypeAllies) {
    if (suggestionIds.has(a.id)) continue
    suggestionIds.add(a.id)
    suggestions.push(a)
  }
  const gapFiller = entry?.gap_filler || ''
  const action = entry?.action || ''

  const subLine =
    keptCount === 0
      ? `Right now nobody is in your ${t.label.toLowerCase()} support. Is there someone in your life who could be?`
      : `Right now you have one person in your ${t.label.toLowerCase()} support. Is there someone else who could help out?`

  return (
    <div>
      <h2 className={`text-[22px] font-bold mb-2 ${tones.word}`}>
        Let&apos;s strengthen your {t.label.toLowerCase()} support.
      </h2>
      <p className="text-[15px] leading-relaxed text-slate-800 mb-5">
        {subLine}
      </p>

      {suggestions.length > 0 && (
        <div className="mb-4">
          <p className="text-[13px] text-slate-600 mb-2">Anyone here also fit?</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onChange({ gap_filler: a.name, skipped: false })}
                className={
                  'inline-flex items-center rounded-full border px-3 py-1.5 text-[13px] font-medium ' +
                  tones.chip
                }
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-[13px] font-medium text-slate-700 mb-1">
          Who could that be?
        </label>
        <input
          type="text"
          value={gapFiller}
          onChange={(e) => onChange({ gap_filler: e.target.value, skipped: false })}
          maxLength={60}
          placeholder="A name"
          className="w-full text-[14px] px-3 py-2 min-h-[44px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
        />
      </div>

      <div className="mb-5">
        <label className="block text-[13px] font-medium text-slate-700 mb-1">
          What&apos;s one thing you could do to make that happen?
        </label>
        <textarea
          rows={3}
          value={action}
          onChange={(e) => onChange({ action: e.target.value, skipped: false })}
          maxLength={300}
          placeholder="e.g., text them and ask if we can hang out this weekend"
          className="w-full text-[14px] leading-relaxed px-3 py-2 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
        />
        <p className="text-[12px] text-slate-500 italic mt-1">
          Stuck? You could ask another supportive person for a recommendation.
        </p>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onSkip}
          className="text-[13px] font-medium text-slate-600 hover:text-slate-900 underline px-3 py-2"
        >
          Skip this one
        </button>
      </div>
    </div>
  )
}

// ---------- Review screen ----------

function ReviewScreen({ allies, noneFor, strengthened, gapTypeIds }) {
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2">Your safety net is ready.</h2>
      <p className="text-[14px] text-slate-600 mb-5 leading-relaxed">
        Here&apos;s the net you came out with. You can come back to it any
        time.
      </p>
      <NetWithListToggle allies={allies} noneFor={noneFor} />
      {gapTypeIds.length > 0 && (
        <StrengthenSummary
          strengthened={strengthened}
          gapTypeIds={gapTypeIds}
        />
      )}
    </div>
  )
}

function StrengthenSummary({ strengthened, gapTypeIds }) {
  // Render only the gaps the kid actually filled in (skipped or empty ones
  // don't get a callout — kid agency, no pressure).
  const filled = gapTypeIds
    .map((id) => ({ id, entry: strengthened[id] }))
    .filter(({ entry }) => entry && !entry.skipped && (entry.gap_filler || entry.action))
  if (filled.length === 0) return null
  return (
    <div className="mt-5 space-y-3 text-left max-w-[640px] mx-auto">
      <h3 className="text-[15px] font-semibold text-slate-800">
        Your plan to strengthen support
      </h3>
      {filled.map(({ id, entry }) => {
        const t = SUPPORT_TYPES.find((x) => x.id === id)
        const tones = TONE_TOKENS[t?.tone] || TONE_TOKENS.amber
        return (
          <div
            key={id}
            className={`rounded-2xl border p-3 ${tones.callout}`}
          >
            <p className={`text-[13px] font-semibold mb-1 ${tones.word}`}>
              {t?.label} support
            </p>
            {entry.gap_filler && (
              <p className="text-[14px] text-slate-800">
                <span className="font-medium">Who:</span> {entry.gap_filler}
              </p>
            )}
            {entry.action && (
              <p className="text-[14px] text-slate-800">
                <span className="font-medium">What I&apos;ll do:</span>{' '}
                {entry.action}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------- Reusable: net + "Show me a list instead" toggle ----------

function NetWithListToggle({ allies, noneFor }) {
  const [listOpen, setListOpen] = useState(false)
  return (
    <div>
      <div className="mx-auto w-full max-w-[420px] md:max-w-[700px]">
        <TrampolineNet
          allies={allies}
          interactive={false}
          showLabels={true}
        />
      </div>
      <div className="flex justify-center mt-3">
        <button
          type="button"
          onClick={() => setListOpen((v) => !v)}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-amber-700 hover:text-amber-900 underline-offset-2 hover:underline"
        >
          {listOpen ? 'Hide the list' : 'Show me a list of my allies instead'}
        </button>
      </div>
      {listOpen && (
        <div className="mt-4 mx-auto w-full max-w-[640px]">
          <AllyList allies={allies} noneFor={noneFor} />
        </div>
      )}
    </div>
  )
}

// ---------- Reusable: textual ally list, grouped by support type ----------

function AllyList({ allies, noneFor }) {
  return (
    <div className="space-y-3">
      {SUPPORT_TYPES.map((type) => {
        const tones = TONE_TOKENS[type.tone] || TONE_TOKENS.amber
        const inGroup = (allies || []).filter(
          (a) =>
            (a.support_types || []).includes(type.id) &&
            !a.removed_via_inspect &&
            !a.removed,
        )
        const declaredNone = !!(noneFor && noneFor[type.id])
        return (
          <section
            key={type.id}
            className={`border rounded-2xl p-3 ${tones.callout}`}
          >
            <h3 className={`text-[14px] font-semibold mb-2 ${tones.word}`}>
              {type.label}
            </h3>
            {inGroup.length > 0 ? (
              <ul className="space-y-1.5">
                {inGroup.map((ally) => {
                  const tile = ALLY_TILES.find((t) => t.id === ally.id)
                  return (
                    <li
                      key={`${ally.id}-${type.id}`}
                      className="flex items-center gap-3 text-[14px] text-slate-800"
                    >
                      {tile && (
                        <img
                          src={tile.icon}
                          alt=""
                          className="w-8 h-8 flex-shrink-0"
                          draggable={false}
                        />
                      )}
                      <span className="flex-1">{ally.name}</span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-[13px] text-slate-500 italic">
                {declaredNone
                  ? `Nobody for ${type.label.toLowerCase()} support right now.`
                  : `No ${type.label.toLowerCase()} support allies chosen.`}
              </p>
            )}
          </section>
        )
      })}
    </div>
  )
}
