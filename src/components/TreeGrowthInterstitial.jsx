// TreeGrowthInterstitial — a brief full-screen beat shown mid-delivery
// when completing a real, scored activity pushes the tree to a new
// growth stage (see src/lib/treeProgressStage.js for the stage math).
// Layout mirrors DeliveryStepPage's SectionTransition. The mount-old
// then-bump pattern mirrors DeliveryShellPage's CelebrationScreen: a
// <TreeProgress> mounted straight at `toStage` would NOT animate — it
// only plays its grow-in animation on a stage change AFTER mount — so
// we mount at `fromStage` and bump to `toStage` a beat later.
import { useEffect, useState } from 'react'
import TreeProgress from './TreeProgress.jsx'
import { PrimaryButton } from './items/shared.jsx'
import { INTERSTITIAL_COPY } from '../lib/treeProgressStage.js'

export default function TreeGrowthInterstitial({
  fromStage,
  toStage,
  componentName,
  onContinue,
}) {
  const [stage, setStage] = useState(fromStage)

  useEffect(() => {
    const t = setTimeout(() => setStage(toStage), 400)
    return () => clearTimeout(t)
    // Only re-run if the target stage itself changes; we don't want the
    // grow-in to replay on incidental re-renders of this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toStage])

  const copy = INTERSTITIAL_COPY[componentName] || INTERSTITIAL_COPY.DEFAULT

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-ctac-teal-50">
      <div className="w-full max-w-[540px] text-center">
        <div className="mx-auto w-full max-w-[260px] mb-4">
          <TreeProgress stage={stage} animated />
        </div>
        <h1 className="text-[28px] font-bold leading-tight mb-4 text-slate-800">
          {copy.heading}
        </h1>
        <p className="text-[16px] leading-relaxed text-slate-700 mb-8 max-w-md mx-auto">
          {copy.body}
        </p>
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
    </main>
  )
}
