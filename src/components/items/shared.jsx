// Small shared bits for item components.
import { useState } from 'react'

export function PrimaryButton({ children, disabled, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[16px] rounded-full px-8 py-4 min-h-[52px] transition-colors"
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
      className="bg-ctac-teal-100 hover:bg-ctac-teal-200 text-ctac-teal-800 font-semibold text-[16px] rounded-full px-8 py-4 min-h-[52px] transition-colors disabled:opacity-50"
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
      className="bg-transparent text-ctac-teal-700 hover:text-ctac-teal-900 border border-ctac-teal-200 hover:border-ctac-teal-400 font-semibold text-[16px] rounded-full px-6 py-3 min-h-[48px] transition-colors"
    >
      {children}
    </button>
  )
}

// Draft 100 — surfacing what's missing when Continue/Save is tapped while
// something required is still unanswered. Continue stays tappable rather
// than `disabled` (a disabled native <button> doesn't fire hover events in
// most browsers, and this is a phone-first app anyway — hover isn't a real
// interaction here at all), so a validation message on tap is the only
// interaction that works identically on phone and desktop.
export function MissingItemsNote({ message }) {
  if (!message) return null
  return (
    <p
      className="text-[13px] text-rose-600 text-center mt-3"
      role="alert"
      aria-live="assertive"
    >
      {message}
    </p>
  )
}

// Scrolls to and briefly highlights the row for the first missing item.
// Call with the DOM id you gave that row — convention: `item-${id}`.
export function scrollToMissingItem(domId) {
  if (typeof document === 'undefined' || !domId) return
  const el = document.getElementById(domId)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.classList.add('ring-2', 'ring-rose-300', 'rounded-2xl')
  setTimeout(() => el.classList.remove('ring-2', 'ring-rose-300', 'rounded-2xl'), 1500)
}

export function PullForwardCallout({ label, value, included, onToggle }) {
  if (!value) return null
  return (
    <div className="bg-ctac-teal-50 border-l-4 border-ctac-teal-300 rounded-2xl px-4 py-3 mb-4">
      {label && (
        <div className="text-[13px] font-medium text-ctac-teal-800 mb-1">{label}</div>
      )}
      <div className="text-[15px] text-slate-800 italic mb-2">{String(value)}</div>
      {onToggle && (
        <label className="inline-flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={!!included}
            onChange={(e) => onToggle(e.target.checked)}
            className="w-4 h-4 accent-ctac-teal-500"
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
          ? 'bg-ctac-teal-200 text-ctac-teal-900'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700')
      }
    >
      {chip.text}
    </button>
  )
}
