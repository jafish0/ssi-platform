import { useEffect, useRef, useState } from 'react'
import { useSession } from '../engine/SessionEngine.jsx'
import ItemRenderer from '../engine/ItemRenderer.jsx'
import {
  PrimaryButton,
  GhostButton,
} from '../components/items/shared.jsx'

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

  // Scroll to top whenever the current item changes so a long form (e.g. the
  // demographics structured_activity) starts from its heading rather than
  // wherever the previous page was scrolled to.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [currentItem?.id, showTransition])

  useEffect(() => {
    if (lastSectionRef.current !== currentSectionIndex) {
      // Just advanced into a new section
      if (currentSectionIndex > 0 && currentItemIndex === 0) {
        setShowTransition(true)
      }
      lastSectionRef.current = currentSectionIndex
    }
  }, [currentSectionIndex, currentItemIndex])

  if (!currentItem) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-[14px] text-slate-500">Loading…</p>
      </main>
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
      const result = await saveResponse(
        currentItem.id,
        currentItem.token_key,
        responseValue,
      )
      // If the item triggered a hard exit, the engine has already marked the
      // session completed and the shell will swap to the exit screen.
      if (result?.exited) return
      goNext()
    } catch (err) {
      console.error('Failed to save response', err)
    }
  }

  const existingResponse = responsesByItemId[currentItem.id]
  const totalItems = currentSection?.items?.length ?? 0

  return (
    <main className="min-h-screen flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-[640px]">
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
