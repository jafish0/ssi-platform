// Public sandbox at /demo/sandbox/:activityId. Mirrors TestingSandboxPage
// (same TEST_REGISTRY, same key-bump reset, same viewport toggle, same
// onSave capture panel) but with the public DemoPageLayout instead of
// AdminLayout.

import { Suspense, useCallback, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Smartphone, Monitor } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'
import { findTestEntry } from '../lib/testRegistry.js'
import { getActivityVersion } from '../lib/activityVersions.js'
import { resolveTokenPath } from '../lib/tokens.js'

function LoadingFallback() {
  return (
    <div className="text-[14px] text-slate-500 italic text-center py-12">
      Loading component…
    </div>
  )
}

export default function DemoSandboxPage() {
  const { activityId } = useParams()
  const entry = findTestEntry(activityId)

  const [resetCounter, setResetCounter] = useState(0)
  const [viewport, setViewport] = useState('desktop')

  // We deliberately don't surface the onSave payload as a JSON panel on
  // /demo — reviewers found the wall of JSON distracting. The admin-side
  // /admin/testing/* surface still renders the panel for QA. Payloads are
  // still logged to the browser console here so Josh can inspect them via
  // DevTools when needed.
  const handleSave = useCallback((value) => {
    // eslint-disable-next-line no-console
    console.log('[demo onSave]', value)
  }, [])

  const reset = useCallback(() => {
    setResetCounter((n) => n + 1)
  }, [])

  if (!entry) {
    return <Navigate to="/demo" replace />
  }

  const Component = entry.component
  const versionInfo = getActivityVersion(activityId)
  const props = {
    sessionData: {},
    resolveToken: (path) => resolveTokenPath(path, entry.mockProps?.sessionData || {}),
    ...entry.mockProps,
    onSave: handleSave,
  }

  const containerClass =
    viewport === 'mobile'
      ? 'mx-auto w-full max-w-[400px] border border-dashed border-ctac-teal-300 rounded-2xl p-2'
      : ''

  return (
    <DemoPageLayout banner={false}>
      {/* Sandbox toolbar */}
      <div className="bg-white rounded-2xl shadow-card mb-4">
        <div className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap">
          <Link
            to="/demo"
            className="inline-flex items-center gap-1 text-ctac-teal-700 hover:text-ctac-teal-900 text-[13px] font-medium"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to demo
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setViewport((v) => (v === 'mobile' ? 'desktop' : 'mobile'))}
              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full px-4 py-1.5 min-h-[40px] text-[13px]"
              title={viewport === 'mobile' ? 'Switch to desktop view' : 'Switch to mobile view'}
            >
              {viewport === 'mobile' ? (
                <>
                  <Monitor size={14} strokeWidth={1.5} />
                  Desktop view
                </>
              ) : (
                <>
                  <Smartphone size={14} strokeWidth={1.5} />
                  Mobile view
                </>
              )}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full px-4 py-1.5 min-h-[40px] text-[13px]"
            >
              <RotateCcw size={14} strokeWidth={1.5} />
              Reset
            </button>
          </div>
        </div>
        <div className="px-4 pb-3 text-[12px] text-slate-500 flex items-center flex-wrap gap-x-2 gap-y-1">
          <span className="font-semibold text-slate-700">{entry.displayName}</span>
          {versionInfo && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-ctac-teal-100 text-ctac-teal-800"
              title={`Updated ${versionInfo.updated}`}
            >
              {versionInfo.version}
            </span>
          )}
          <span>·</span>
          <span className="font-mono">{entry.id}</span>
          <span>·</span>
          <span>{entry.description}</span>
        </div>
      </div>

      {/* Sandbox container */}
      <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6 mb-4">
        <div className={containerClass}>
          <Suspense fallback={<LoadingFallback />}>
            <Component key={resetCounter} {...props} />
          </Suspense>
        </div>
      </div>

    </DemoPageLayout>
  )
}
