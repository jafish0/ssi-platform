import { useState } from 'react'
import { CheckCircle2, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react'

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return (
    d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  )
}

export default function VersionsPanel({
  versions,
  currentVersionId,
  onRollback,
  onClose,
}) {
  const [expandedId, setExpandedId] = useState(null)

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-slate-800">Version history</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] text-slate-500 hover:text-slate-700"
          >
            Close
          </button>
        )}
      </div>
      {versions.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-[14px]">
          No versions published yet.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {versions.map((v) => {
            const isCurrent = v.id === currentVersionId
            const isExpanded = expandedId === v.id
            return (
              <li key={v.id}>
                <div className="px-5 py-3 flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : v.id)}
                    className="text-slate-400 hover:text-slate-600 mt-0.5"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-[15px] font-semibold text-slate-800">
                        Version {v.version_number}
                      </div>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-800 bg-emerald-100 rounded-full px-2 py-0.5">
                          <CheckCircle2 size={12} strokeWidth={2} />
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-slate-500 mt-0.5">
                      Published {fmtDate(v.published_at)}
                      {v.published_by_email ? ` by ${v.published_by_email}` : ''}
                    </div>
                    {v.notes && (
                      <div className="text-[13px] text-slate-700 mt-1 italic">{v.notes}</div>
                    )}
                  </div>
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Roll back to version ${v.version_number}? This makes it the current version. No new version is created.`)) {
                          onRollback(v.id)
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-ctac-teal-700 hover:text-ctac-teal-900"
                    >
                      <RotateCcw size={14} strokeWidth={1.5} />
                      Make current
                    </button>
                  )}
                </div>
                {isExpanded && (
                  <div className="px-5 pb-3 text-[12px] font-mono text-slate-600 bg-slate-50 max-h-[300px] overflow-auto whitespace-pre-wrap break-all">
                    {(() => {
                      try {
                        const summary = {
                          sections: (v.snapshot_json?.sections || []).map((s) => ({
                            order: s.order_index,
                            title: s.title,
                            type: s.type,
                            items: (s.items || []).length,
                          })),
                        }
                        return JSON.stringify(summary, null, 2)
                      } catch {
                        return '(could not render snapshot summary)'
                      }
                    })()}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
