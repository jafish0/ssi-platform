import { ACTIVITY_REGISTRY } from '../../lib/activityRegistry.js'

export default function CustomActivity({ content, onSave, sessionData, resolveToken }) {
  const name = content?.component_name
  const Component = name ? ACTIVITY_REGISTRY[name] : null

  if (!Component) {
    return (
      <div className="bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl p-5">
        <div className="text-[14px] font-medium text-ctac-teal-800 mb-2">
          Activity not available
        </div>
        <p className="text-[14px] text-slate-700">
          This activity hasn&apos;t been added yet. Skip ahead and we&apos;ll come back to it.
        </p>
        <div className="text-[12px] text-slate-500 mt-3 font-mono break-all">
          component_name: {name || '—'}
        </div>
      </div>
    )
  }

  return (
    <Component
      {...(content?.props || {})}
      onSave={(data) => onSave(data)}
      sessionData={sessionData}
      resolveToken={resolveToken}
    />
  )
}
