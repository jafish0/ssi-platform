// TEMP — Sam-variant capability demo (Draft 67 Part D, "ship dark").
//
// Unlinked route at /demo/variant-preview so Josh can click through the
// new engine capability before it's authored into the live intervention:
// pick a Sam variant → variant-aware video items resolve to that
// variant's cut → reload the page ("resume") → the pick persists.
//
// This page mounts the REAL delivery components (Choice, VideoPlayer)
// against a miniature session whose responses live in sessionStorage —
// standing in for what save-response / get-session-responses do in a
// live session, where the choice item's token_key response IS the
// session variable (see the resolveSource comment in VideoPlayer.jsx).
//
// The live intervention is untouched: nothing here is authored into the
// builder, and the variant-selection framing copy below is PLACEHOLDER
// pending the 2026-08-17 team meeting (copy is data, swapped at
// authoring time, not code).
//
// Delete alongside the other TEMP demo routes when no longer needed.

import { useEffect, useMemo, useState } from 'react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'
import Choice from '../components/items/Choice.jsx'
import VideoPlayer, { resolveSource } from '../components/items/VideoPlayer.jsx'

const STORE_KEY = 'variant-preview-responses'

function loadStore() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY)) || {}
  } catch {
    return {}
  }
}

// The variant-selection choice item exactly as it would be authored
// (Draft 67 Part B). token_key is the session-variable name the video
// items read. PLACEHOLDER framing copy — team rewords Monday.
const VARIANT_CHOICE_CONTENT = {
  prompt:
    "Sam's story can be told a few different ways. Pick the Sam you'd like to follow today.",
  selection_type: 'single',
  display_style: 'card_grid',
  options: [
    { id: 'male', text: 'Sam (Male)', image: '/cast/images/sam-16.png' },
    { id: 'female', text: 'Sam (Female)', image: '/cast/images/sam-female-v3.png' },
    { id: 'gender_neutral', text: 'Sam (Gender Neutral)', image: '/cast/images/kai-variant-2.png' },
  ],
}
const VARIANT_TOKEN_KEY = 'sam_variant'

// Demo video items. Each { tokenKey, note, content } mounts a real
// VideoPlayer with that content_json.
const VIDEO_ITEMS = [
  {
    tokenKey: 'sam_story_video',
    note:
      'Production config: only the Male cut exists today, so the variants map has one entry and fallback covers Female / Gender Neutral until those cuts land next week (IDs are data — swap as they arrive).',
    content: {
      title: "Sam's Story (production config)",
      variant_key: VARIANT_TOKEN_KEY,
      variants: { male: 'eEgHiFWatA0' },
      fallback: 'male',
      orientation: 'portrait',
    },
  },
  {
    tokenKey: 'mechanism_demo_video',
    note:
      'Mechanism demo: three DIFFERENT videos (Kai Part 1 Scenes 1–3 standing in for the three Sam cuts) so you can see per-variant resolution visibly working. Not a content proposal.',
    content: {
      title: 'Variant resolution demo (stand-in videos)',
      variant_key: VARIANT_TOKEN_KEY,
      variants: {
        male: 'fNSK011fNnI',
        female: 'u1b2FoAwZPs',
        gender_neutral: 'z9IMWmArols',
      },
      fallback: 'male',
      orientation: 'portrait',
    },
  },
  {
    tokenKey: 'single_youtube',
    note: 'Single-source YouTube item (new youtube_id field) — no variant logic involved.',
    content: {
      title: 'Single-source YouTube (regression check)',
      youtube_id: 'GIxBJpD6O-E',
      orientation: 'portrait',
    },
  },
  {
    tokenKey: 'single_vimeo',
    note:
      "Single-source Vimeo item — the original config shape, unchanged (this is live v5's placeholder Vimeo video). Confirms existing items keep working.",
    content: {
      title: 'Single-source Vimeo (regression check)',
      vimeo_url: 'https://vimeo.com/76979871',
    },
  },
]

function ResolutionReadout({ content, sessionData }) {
  const source = resolveSource(content, sessionData)
  const selectedRaw = content.variant_key
    ? sessionData?.[content.variant_key]?.selected
    : null
  let line
  if (!content.variants) {
    line = `single-source → ${source.kind}${source.id ? ` (${source.id})` : ''}`
  } else if (!selectedRaw) {
    line = `${content.variant_key} unset → fallback "${content.fallback}" → ${source.id ?? 'none'}`
  } else if (source.variantUsed === selectedRaw) {
    line = `${content.variant_key} = "${selectedRaw}" → ${source.id}`
  } else {
    line = `${content.variant_key} = "${selectedRaw}" → no cut for that key → fallback "${source.variantUsed}" → ${source.id ?? 'none'}`
  }
  return (
    <p className="text-[12px] font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-3">
      resolved: {line}
    </p>
  )
}

export default function VariantPreviewPage() {
  const [responses, setResponses] = useState(loadStore)

  useEffect(() => {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(responses))
  }, [responses])

  function makeOnSave(tokenKey) {
    return async (value) => {
      setResponses((prev) => ({ ...prev, [tokenKey]: value }))
    }
  }

  function resetDemo() {
    sessionStorage.removeItem(STORE_KEY)
    setResponses({})
  }

  const picked = responses[VARIANT_TOKEN_KEY]?.selected || null
  const pickedLabel = useMemo(() => {
    const opt = VARIANT_CHOICE_CONTENT.options.find((o) => o.id === picked)
    return opt ? opt.text : null
  }, [picked])

  return (
    <DemoPageLayout>
      <section className="mb-8 max-w-[760px]">
        <h1 className="text-[26px] font-bold text-slate-800 mb-2">
          Sam variant selection — capability preview
        </h1>
        <p className="text-[14px] text-slate-600 leading-relaxed mb-2">
          Prototype of the Draft 67 engine capability, shipped dark (nothing
          here is in the live intervention). A choice item saves the
          participant&apos;s Sam pick as a session variable; every
          variant-aware video item downstream resolves its cut from that
          pick, with a fallback when the pick is unset or that variant&apos;s
          cut doesn&apos;t exist yet.
        </p>
        <p className="text-[13px] text-slate-500 italic mb-4">
          The selection framing copy below is placeholder — the team rewords
          it at the 8/17 meeting. In a live session the pick is saved once
          and restored on resume; here it lives in this tab&apos;s
          sessionStorage, so <strong>reloading this page simulates a
          resume</strong> (the pick persists). Tap a different Sam anytime to
          watch every video below re-resolve.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-ctac-teal-500 hover:bg-ctac-teal-600 text-white font-semibold rounded-full px-4 py-2 text-[13px]"
          >
            Simulate resume (reload)
          </button>
          <button
            type="button"
            onClick={resetDemo}
            className="bg-ctac-teal-100 hover:bg-ctac-teal-200 text-ctac-teal-800 font-semibold rounded-full px-4 py-2 text-[13px]"
          >
            Reset demo
          </button>
        </div>
      </section>

      <section className="mb-10 max-w-[760px]">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-3">
          Step 1 — the variant-selection choice item
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <Choice
            key={picked || 'unpicked'}
            content={VARIANT_CHOICE_CONTENT}
            onSave={makeOnSave(VARIANT_TOKEN_KEY)}
            existingResponse={responses[VARIANT_TOKEN_KEY]}
          />
        </div>
        {picked && (
          <div className="mt-3 text-[13px] text-slate-600">
            <span className="font-semibold">Saved response row</span>{' '}
            (token_key <span className="font-mono">sam_variant</span>):{' '}
            <span className="font-mono bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
              {JSON.stringify(responses[VARIANT_TOKEN_KEY])}
            </span>{' '}
            — currently following <strong>{pickedLabel}</strong>.
          </div>
        )}
      </section>

      <section className="mb-10 max-w-[760px]">
        <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600 mb-3">
          Step 2 — video items downstream
        </h2>
        <div className="space-y-8">
          {VIDEO_ITEMS.map((item) => (
            <div key={item.tokenKey} className="bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-[13px] text-slate-500 italic mb-3">{item.note}</p>
              <ResolutionReadout content={item.content} sessionData={responses} />
              <VideoPlayer
                key={`${item.tokenKey}:${picked || 'unset'}`}
                content={item.content}
                onSave={makeOnSave(item.tokenKey)}
                sessionData={responses}
                existingResponse={responses[item.tokenKey]}
              />
              {responses[item.tokenKey] && (
                <p className="mt-3 text-[12px] font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  saved: {JSON.stringify(responses[item.tokenKey])}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </DemoPageLayout>
  )
}
