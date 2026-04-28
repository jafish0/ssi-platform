import { useMemo, useState, useRef, useEffect } from 'react'
import { Braces, X } from 'lucide-react'

// `tokenItems` is an array of { token_key, item_type, section_title, sub_paths? }
// where sub_paths is an optional array of { path, label } for nested fields
// (used by structured_activity / guided_creative).
//
// The picker calls onInsert(text) where text = "{{response.token_key[.path]}}".
export default function TokenPicker({ tokenItems = [], onInsert, label = 'Insert token' }) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const popoverRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return tokenItems
    return tokenItems.filter(
      (t) =>
        t.token_key.toLowerCase().includes(q) ||
        (t.section_title || '').toLowerCase().includes(q) ||
        (t.item_type || '').toLowerCase().includes(q),
    )
  }, [tokenItems, filter])

  function handlePick(token) {
    onInsert?.(token)
    setOpen(false)
    setFilter('')
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[12px] font-medium text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full px-3 py-1 min-h-[32px]"
        title="Insert a pull-forward token"
      >
        <Braces size={14} strokeWidth={1.5} />
        {label}
      </button>

      {open && (
        <div className="absolute z-30 right-0 mt-2 w-[320px] max-h-[380px] bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-slate-200 flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search tokens…"
              className="flex-1 text-[13px] px-2 py-1 bg-amber-50 border border-amber-200 rounded-xl focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded text-slate-500 hover:bg-slate-100"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {tokenItems.length === 0 ? (
              <div className="p-4 text-[13px] text-slate-500">
                No items with token_keys yet. Set a token_key on an item to use it here.
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-[13px] text-slate-500">No matches.</div>
            ) : (
              <ul className="py-1">
                {filtered.map((t) => (
                  <li key={t.token_key}>
                    <button
                      type="button"
                      onClick={() => handlePick(`{{response.${t.token_key}}}`)}
                      className="w-full text-left px-3 py-2 hover:bg-amber-50"
                    >
                      <div className="font-mono text-[13px] text-amber-800">
                        {`{{response.${t.token_key}}}`}
                      </div>
                      <div className="text-[12px] text-slate-500">
                        {t.item_type} · {t.section_title}
                      </div>
                    </button>
                    {(t.sub_paths || []).map((sp) => (
                      <button
                        key={sp.path}
                        type="button"
                        onClick={() =>
                          handlePick(`{{response.${t.token_key}.${sp.path}}}`)
                        }
                        className="w-full text-left px-6 py-1.5 hover:bg-amber-50 text-[12px] text-slate-700"
                      >
                        <span className="text-slate-400">↳</span> {sp.label}{' '}
                        <span className="font-mono text-slate-500">.{sp.path}</span>
                      </button>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to derive sub_paths for known activity output shapes.
export function subPathsFor(itemType, contentJson) {
  switch (itemType) {
    case 'structured_activity': {
      const fields = contentJson?.fields || []
      return fields.map((f) => ({
        path: `fields.${f.id}`,
        label: f.label || f.id,
      }))
    }
    case 'guided_creative': {
      const stanzas = contentJson?.stanzas || []
      const sub = []
      for (const st of stanzas) {
        for (const p of st.prompts || []) {
          sub.push({ path: `prompts.${p.id}`, label: `${p.starter} (${p.id})` })
        }
      }
      sub.push({ path: 'full_artifact_text', label: 'Full artifact text' })
      return sub
    }
    case 'free_text':
      return [{ path: 'text', label: 'Text body' }]
    case 'choice':
      return [{ path: 'selected', label: 'Selected option(s)' }]
    case 'custom_activity': {
      // Known activity outputs (shapes documented in RSD_Activities_Documentation.md)
      const name = contentJson?.component_name
      if (name === 'GettingUnstuck')
        return [
          { path: 'responses.0.and_statement', label: 'First Both/And statement' },
          { path: 'responses.0.fight_response', label: 'First Fight reframe' },
        ]
      if (name === 'AlliesSafetyNet')
        return [
          { path: 'allies.0.name', label: 'First ally name' },
          { path: 'allies.0.support_types.0', label: 'First ally support type' },
        ]
      if (name === 'WhoIAmPoem')
        return [{ path: 'full_poem_text', label: 'Full poem text' }]
      if (name === 'LetterBuilder')
        return [{ path: 'full_letter_text', label: 'Full letter text' }]
      if (name === 'BelongingSkillsSort')
        return [
          { path: 'willing_to_try', label: 'Willing-to-try list' },
          { path: 'already_doing', label: 'Already-doing list' },
        ]
      if (name === 'SelfReflection')
        return [
          { path: 'inclusion.thoughts', label: 'Inclusion thoughts' },
          { path: 'exclusion.thoughts', label: 'Exclusion thoughts' },
        ]
      return []
    }
    default:
      return []
  }
}
