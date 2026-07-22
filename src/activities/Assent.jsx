// Assent — child assent screen shown at the very beginning of the program,
// before anything else (the first thing a participant sees). Copy is taken
// verbatim from the IRB assent document
// (Belongingness_Assent_ages 6-11_updated7.22.26.doc, provided by Josh
// 2026-07-22). The child reads the assent, then chooses Yes or No:
//   - Yes  → onSave({ assent: 'yes' }); the real session advances into the
//            pretest. Here in the sandbox we show a short confirmation.
//   - No   → onSave({ assent: 'no' }); the real session ends on a friendly
//            exit screen (the delivery engine's exit_on mechanism). Here we
//            render that same friendly message inline.
//
// In the live delivery this is authored as the first section of the
// "Ready! Set! Dedicate!" intervention: a text_prompt (this body) followed
// by a Yes/No `choice` item whose content_json.exit_on ends the session on
// "no". This component is the reviewable sandbox mirror of that flow.

import { useState } from 'react'
import { PrimaryButton, SecondaryButton } from '../components/items/shared.jsx'

// Body paragraphs, verbatim from the assent document.
const BODY = [
  'Dr. Ginny Sprang from the University of Kentucky is inviting you to be in a research study to help her learn about what helps kids feel like they belong in their families and communities. You are invited because you have experienced placement away from your birth parents.',
  'If you agree to be in the study, we will ask you to complete a 45-minute online program that will give you information about belonging (that is, how you feel you fit in with your family and friends). The program teaches you about belonging (fitting in) using videos and activities. You will be asked to answer some questions both before and after you complete the program. We will reach out to you again in 3 months to ask you to answer some more questions.',
  'You may want to be in the study because it may help you feel a greater sense of belonging (fitting in) in your family and community.',
  'You may also want to be in the study to help us help other young people feel like they fit in in their family and community.',
  'You may decide you do not want to be in the study because it will take up to 45 minutes in total for you to complete and will ask you some questions about your thoughts and feelings.',
  'Your parent or guardian will know that you are in the study. You can decide not to do the study even if your caregiver said “yes.” Being in the study is up to you. No one will be mad if you change your mind and decide not to finish the study.',
  'There are very few risks from being in the study, but it’s possible you may feel upset by some of the program content. You can tell your parent, guardian or Dr. Ginny Sprang (sprang@uky.edu) if something makes you feel bad while you are in the study. You may stop the study whenever you want by closing out of the program. Your responses will not be connected to your name. We will use numbers or initials instead of your name.',
  'If you complete all parts of the program and surveys today, you will receive a $25 e-gift card. You may also earn another $25 e-gift card if you complete the follow-up survey in 3 months. The e-gift cards will be in your name and will be emailed to your caregiver.',
  'If you have any questions, you can ask your guardian, caregiver or Dr. Ginny Sprang (sprang@uky.edu).',
]

export default function Assent({ onSave }) {
  // null (deciding) | 'yes' | 'no'
  const [decision, setDecision] = useState(null)

  function choose(value) {
    setDecision(value)
    onSave?.({ assent: value })
  }

  if (decision === 'no') {
    return (
      <div className="max-w-[560px] mx-auto text-center py-6">
        <h2 className="text-[24px] font-bold text-ctac-navy mb-3">
          That&rsquo;s okay.
        </h2>
        <p className="text-[17px] leading-relaxed text-slate-700 mb-6">
          Thanks for stopping by. You don&rsquo;t have to do the study. You can
          close this window now. If you change your mind, you can come back
          anytime.
        </p>
        <SecondaryButton onClick={() => setDecision(null)}>
          ← Go back
        </SecondaryButton>
      </div>
    )
  }

  if (decision === 'yes') {
    return (
      <div className="max-w-[560px] mx-auto text-center py-6">
        <h2 className="text-[24px] font-bold text-ctac-navy mb-3">
          You&rsquo;re all set!
        </h2>
        <p className="text-[17px] leading-relaxed text-slate-700 mb-6">
          Thanks for saying yes. Next you&rsquo;ll answer a few quick questions,
          and then we&rsquo;ll get started together.
        </p>
        <SecondaryButton onClick={() => setDecision(null)}>
          ← Go back
        </SecondaryButton>
      </div>
    )
  }

  return (
    <div className="max-w-[620px] mx-auto">
      {/* Title block */}
      <div className="text-center mb-6">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-ctac-teal-700 mb-1">
          A Single Session Program to Foster Belongingness
        </p>
        <h1 className="text-[26px] font-bold text-ctac-navy leading-tight mb-2">
          Do you want to be in this study?
        </h1>
        <p className="text-[13px] text-slate-500">
          University of Kentucky &middot; Center on Trauma and Children
        </p>
      </div>

      {/* Body */}
      <div className="space-y-4 mb-8">
        {BODY.map((para, i) => (
          <p key={i} className="text-[17px] leading-relaxed text-slate-800">
            {para}
          </p>
        ))}
      </div>

      {/* Decision */}
      <div className="bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl p-5">
        <p className="text-[17px] leading-relaxed text-slate-800 mb-1">
          By selecting &ldquo;Yes&rdquo; below, you are agreeing to be in the
          study. If you do not want to be in the study, select &ldquo;No.&rdquo;
        </p>
        <p className="text-[19px] font-semibold text-ctac-navy mb-4">
          Do you want to continue in the study?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <PrimaryButton onClick={() => choose('yes')}>
            Yes, I want to be in the study
          </PrimaryButton>
          <SecondaryButton onClick={() => choose('no')}>
            No, thank you
          </SecondaryButton>
        </div>
      </div>
    </div>
  )
}
