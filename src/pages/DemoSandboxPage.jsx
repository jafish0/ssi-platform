// Public sandbox at /demo/sandbox/:activityId. Mirrors TestingSandboxPage
// (same TEST_REGISTRY, same key-bump reset, same viewport toggle, same
// onSave capture panel) but with the public DemoPageLayout instead of
// AdminLayout.

import { Suspense, useCallback, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Smartphone, Monitor, Trash2 } from 'lucide-react'
import DemoPageLayout from '../components/DemoPageLayout.jsx'
import { findTestEntry } from '../lib/testRegistry.js'
import { resolveTokenPath } from '../lib/tokens.js'

function LoadingFallback() {
  return (
    <div className="text-[14px] text-slate-500 italic text-center py-12">
      Loading component…
    </div>
  )
}

function SaveEntry({ entry }) {
  let pretty
  try {
    pretty = JSON.stringify(entry.value, null, 2)
  } catch {
    pretty = String(entry.value)
  }
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-2">
      <div className="text-[12px] text-slate-500 mb-1">{entry.timestamp}</div>
      <pre className="text-[12px] font-mono text-slate-800 whitespace-pre-wrap break-all">
        {pretty}
      </pre>
    </div>
  )
}

export default function DemoSandboxPage() {
  const { activityId } = useParams()
  const entry = findTestEntry(activityId)

  const [resetCounter, setResetCounter] = useState(0)
  const [viewport, setViewport] = useState('desktop')
  const [saves, setSaves] = useState([])

  const handleSave = useCallback((value) => {
    const ts = new Date().toLocaleTimeString()
    setSaves((prev) => [{ id: Math.random().toString(36).slice(2), value, timestamp: ts }, ...prev])
    // eslint-disable-next-line no-console
    console.log('[demo onSave]', value)
  }, [])

  const reset = useCallback(() => {
    setResetCounter((n) => n + 1)
    setSaves([])
  }, [])

  if (!entry) {
    return <Navigate to="/demo" replace />
  }

  const Component = entry.component
  const props = {
    sessionData: {},
    resolveToken: (path) => resolveTokenPath(path, entry.mockProps?.sessionData || {}),
    ...entry.mockProps,
    onSave: handleSave,
  }

  const containerClass =
    viewport === 'mobile'
      ? 'mx-auto w-full max-w-[400px] border border-dashed border-amber-300 rounded-2xl p-2'
      : ''

  return (
    <DemoPageLayout banner={false}>
      {/* Sandbox toolbar */}
      <div className="bg-white rounded-2xl shadow-card mb-4">
        <div className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap">
          <Link
            to="/demo"
            className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 text-[13px] font-medium"
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
        <div className="px-4 pb-3 text-[12px] text-slate-500">
          <span className="font-semibold text-slate-700">{entry.displayName}</span>
          <span className="mx-2">·</span>
          <span className="font-mono">{entry.id}</span>
          <span className="mx-2">·</span>
          {entry.description}
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

      {/* Saves panel */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-slate-800">
            Saved output
            {saves.length > 0 && (
              <span className="ml-2 text-[12px] text-slate-500 font-normal">
                ({saves.length} call{saves.length === 1 ? '' : 's'})
              </span>
            )}
          </h3>
          {saves.length > 0 && (
            <button
              type="button"
              onClick={() => setSaves([])}
              className="inline-flex items-center gap-1 text-[12px] text-slate-500 hover:text-rose-600"
            >
              <Trash2 size={12} strokeWidth={1.5} />
              Clear
            </button>
          )}
        </div>
        {saves.length === 0 ? (
          <p className="text-[13px] text-slate-500 italic">
            Whatever the component passes to <span className="font-mono">onSave()</span> will
            appear here. Each save is also logged to the browser console.
          </p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {saves.map((s) => (
              <SaveEntry key={s.id} entry={s} />
            ))}
          </div>
        )}
      </div>
    </DemoPageLayout>
  )
}
