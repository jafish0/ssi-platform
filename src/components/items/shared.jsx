// Small shared bits for item components.
import { useState } from 'react'

export function PrimaryButton({ children, disabled, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[16px] rounded-full px-8 py-4 min-h-[52px] transition-colors"
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, disabled, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold text-[16px] rounded-full px-8 py-4 min-h-[52px] transition-colors disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-transparent text-amber-700 hover:text-amber-900 border border-amber-200 hover:border-amber-400 font-semibold text-[16px] rounded-full px-6 py-3 min-h-[48px] transition-colors"
    >
      {children}
    </button>
  )
}

export function PullForwardCallout({ label, value, included, onToggle }) {
  if (!value) return null
  return (
    <div className="bg-amber-50 border-l-4 border-amber-300 rounded-2xl px-4 py-3 mb-4">
      {label && (
        <div className="text-[13px] font-medium text-amber-800 mb-1">{label}</div>
      )}
      <div className="text-[15px] text-slate-800 italic mb-2">{String(value)}</div>
      {onToggle && (
        <label className="inline-flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={!!included}
            onChange={(e) => onToggle(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          Include this
        </label>
      )}
    </div>
  )
}

// Word-bank chip with a brief amber flash on tap (per design system, 150ms).
export function WordBankChip({ chip, onTap }) {
  const [flashing, setFlashing] = useState(false)
  function handleClick() {
    setFlashing(true)
    onTap?.(chip)
    setTimeout(() => setFlashing(false), 150)
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        'rounded-full px-4 py-2 min-h-[44px] text-[14px] transition-colors duration-150 ' +
        (flashing
          ? 'bg-amber-200 text-amber-900'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700')
      }
    >
      {chip.text}
    </button>
  )
}
