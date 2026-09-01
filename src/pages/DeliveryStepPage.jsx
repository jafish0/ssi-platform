import { useEffect, useRef, useState } from 'react'
import { useSession } from '../engine/SessionEngine.jsx'
import ItemRenderer from '../engine/ItemRenderer.jsx'
import {
  PrimaryButton,
  GhostButton,
} from '../components/items/shared.jsx'
import TreeGrowthInterstitial from '../components/TreeGrowthInterstitial.jsx'
import { deriveTreeStage, REAL_ACTIVITY_COMPONENT_NAMES } from '../lib/treeProgressStage.js'

function SectionTransition({ section, onContinue }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-ctac-teal-50">
      <div className="w-full max-w-[540px] text-center">
        <h1 className="text-[28px] font-bold leading-tight mb-4 text-slate-800">
          {section?.title || 'Next part'}
        </h1>
        {section?.config_json?.description && (
          <p className="text-[16px] leading-relaxed text-slate-700 mb-8 max-w-md mx-auto">
            {section.config_json.description}
          </p>
        )}
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
    </main>
  )
}

export default function DeliveryStepPage() {
  const {
    currentSection,
    currentItem,
    currentSectionIndex,
    currentItemIndex,
    isFirstItem,
    sections,
    goNext,
    goBack,
    saveResponse,
    responses,
    responsesByItemId,
    resolveToken,
  } = useSession()

  // Show a section transition card when entering a new section, except the first.
  const [showTransition, setShowTransition] = useState(false)
  const lastSectionRef = useRef(currentSectionIndex)

  // Set when saving a real, scored activity's response pushes the tree
  // (src/lib/treeProgressStage.js) to a new growth stage — holds
  // { fromStage, toStage, componentName } while the interstitial shows,
  // null otherwise.
  const [treeInterstitial, setTreeInterstitial] = useState(null)
  // Deferred version of the above (2026-08-27, Josh's ask on Who I Am):
  // when the activity is immediately followed by a `pull_forward_highlight`
  // text_prompt (i.e. a "here's what you just made" screen, like the real
  // poem display after WhoIAmPoem), let that screen show FIRST — the
  // personal reflection should land before the generic tree-growth
  // celebration, not get bumped behind it. Keyed off the format flag
  // generically rather than hardcoding a component name, so any future
  // activity gets the same ordering for free the moment it's given the
  // same kind of display screen right after it.
  const [pendingTreeInterstitial, setPendingTreeInterstitial] = useState(null)

  // Resume-by-code acknowledgment (Draft 69): when CodeEntryPage flagged
  // this navigation as a resume into an existing session, greet the
  // participant so landing mid-flow reads as intentional. The read and
  // the removal are deliberately separated: removing inside the useState
  // initializer breaks under StrictMode's dev double-mount (the first
  // mount eats the flag, the remount reads it as empty). The banner
  // clears on the first advance.
  const [resumedNotice, setResumedNotice] = useState(
    () =>
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem('resumed_notice') === '1',
  )
  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('resumed_notice')
    }
  }, [])

  // Scroll to top whenever the current item changes so a long form (e.g. the
  // demographics structured_activity) starts from its heading rather than
  // wherever the previous page was scrolled to.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [currentItem?.id, showTransition, treeInterstitial])

  useEffect(() => {
    if (lastSectionRef.current !== currentSectionIndex) {
      // Just advanced into a new section. Skip the transition card when the
      // section leads with a video (Draft 105) — every video now has its
      // own Vimeo begin-screen thumbnail carrying the section title, so
      // this in-app card was pure redundant repetition ("three intros to
      // the same thing," per the 8/31 meeting feedback). `currentSection`
      // here is closed over from this render, and `.items` is already
      // hidden-item-filtered by SessionEngine's normalizeSnapshot, so
      // index 0 correctly means the first VISIBLE item even for a section
      // like Sam's Story whose literal item 0 is a hidden bridge text.
      const leadsWithVideo = currentSection?.items?.[0]?.type === 'video'
      if (currentSectionIndex > 0 && currentItemIndex === 0 && !leadsWithVideo) {
        setShowTransition(true)
      }
      lastSectionRef.current = currentSectionIndex
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionIndex, currentItemIndex])

  if (!currentItem) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-[14px] text-slate-500">Loading…</p>
      </main>
    )
  }

  // Checked before showTransition. treeInterstitial is set from
  // handleItemSave either immediately (before goNext() runs, so the
  // section index can't have advanced yet) or, when a pull-forward
  // display screen deferred it, on the NEXT handleItemSave call — by then
  // any section transition from the intervening goNext() has already been
  // dismissed by the participant, so the two still never show at once.
  if (treeInterstitial) {
    return (
      <TreeGrowthInterstitial
        fromStage={treeInterstitial.fromStage}
        toStage={treeInterstitial.toStage}
        componentName={treeInterstitial.componentName}
        onContinue={() => {
          setTreeInterstitial(null)
          goNext()
        }}
      />
    )
  }

  if (showTransition) {
    return (
      <SectionTransition
        section={currentSection}
        onContinue={() => setShowTransition(false)}
      />
    )
  }

  async function handleItemSave(responseValue) {
    try {
      // Pre-save stage, from the CURRENT (pre-save) responsesByItemId —
      // React state won't reflect this save until a later render, so the
      // post-save stage below is computed from an explicitly merged map
      // rather than re-reading responsesByItemId.
      const fromStage = deriveTreeStage(sections, responsesByItemId)

      const result = await saveResponse(
        currentItem.id,
        currentItem.token_key,
        responseValue,
      )
      // If the item triggered a hard exit, the engine has already marked the
      // session completed and the shell will swap to the exit screen.
      if (result?.exited) return
      if (resumedNotice) setResumedNotice(false)

      const isRealActivity =
        currentItem.type === 'custom_activity' &&
        REAL_ACTIVITY_COMPONENT_NAMES.includes(currentItem.content_json?.component_name)
      if (isRealActivity) {
        const toStage = deriveTreeStage(sections, {
          ...responsesByItemId,
          [currentItem.id]: responseValue,
        })
        if (toStage > fromStage) {
          const interstitial = {
            fromStage,
            toStage,
            componentName: currentItem.content_json.component_name,
          }
          const nextItem = currentSection?.items?.[currentItemIndex + 1]
          const nextIsPullForwardDisplay =
            nextItem?.type === 'text_prompt' &&
            nextItem?.content_json?.format === 'pull_forward_highlight'
          if (nextIsPullForwardDisplay) {
            setPendingTreeInterstitial(interstitial)
            goNext()
            return
          }
          setTreeInterstitial(interstitial)
          return
        }
      }
      if (pendingTreeInterstitial) {
        setTreeInterstitial(pendingTreeInterstitial)
        setPendingTreeInterstitial(null)
        return
      }
      goNext()
    } catch (err) {
      console.error('Failed to save response', err)
    }
  }

  const existingResponse = responsesByItemId[currentItem.id]
  const totalItems = currentSection?.items?.length ?? 0

  // Draft 101 Part J: a text_prompt flagged `combine_with_next` renders
  // together with the very next item in its section on one screen (e.g.
  // Assent's body text + its Yes/No choice), instead of the engine's normal
  // one-item-per-screen flow. Generic on the flag rather than hardcoded to
  // Assent, matching this file's existing pull_forward_highlight pattern.
  // The combined item's own save is routed through its REAL id/token_key
  // (so a `choice` item's exit_on keeps working exactly as it does
  // standalone) and advances past both items at once via goNext(2) rather
  // than the normal single-item handleItemSave/goNext().
  const combinedNextItem =
    currentItem.type === 'text_prompt' && currentItem.content_json?.combine_with_next
      ? currentSection?.items?.[currentItemIndex + 1]
      : null

  async function handleCombinedSave(responseValue) {
    if (!combinedNextItem) return
    try {
      const result = await saveResponse(
        combinedNextItem.id,
        combinedNextItem.token_key,
        responseValue,
      )
      if (result?.exited) return
      if (resumedNotice) setResumedNotice(false)
      goNext(2)
    } catch (err) {
      console.error('Failed to save response', err)
    }
  }

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-[640px]">
        {resumedNotice && (
          <div className="mb-4 rounded-2xl bg-ctac-teal-100 border border-ctac-teal-300 text-ctac-teal-900 px-4 py-3 text-[14px]">
            Welcome back — picking up where you left off.
          </div>
        )}

        {/* Section header */}
        {currentSection?.title && (
          <div className="text-[13px] text-slate-500 mb-3 px-1">
            <span className="font-semibold text-slate-700">{currentSection.title}</span>
            <span className="ml-2">
              · {currentItemIndex + 1} of {totalItems}
            </span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
          <ItemRenderer
            item={currentItem}
            onSave={handleItemSave}
            sessionData={responses}
            resolveToken={resolveToken}
            existingResponse={existingResponse}
          />
          {combinedNextItem && (
            <div className="mt-2">
              <ItemRenderer
                item={combinedNextItem}
                onSave={handleCombinedSave}
                sessionData={responses}
                resolveToken={resolveToken}
                existingResponse={responsesByItemId[combinedNextItem.id]}
              />
            </div>
          )}
        </div>

        {!isFirstItem && (
          <div className="mt-4">
            <GhostButton onClick={goBack}>← Back</GhostButton>
          </div>
        )}

        {/* Section position pill */}
        {sections.length > 1 && (
          <div className="text-center mt-6 text-[12px] text-slate-400">
            Part {currentSectionIndex + 1} of {sections.length}
          </div>
        )}
      </div>
    </main>
  )
}
