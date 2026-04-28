// Type-specific configuration forms for the Builder.
// Every form takes { content, onChange(content), tokenItems } and renders a
// form whose state is fully controlled by the parent. onChange is called with
// the full updated content_json object — caller debounces persistence.

import { useRef } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import TokenPicker from './TokenPicker.jsx'
import { shortId } from '../../lib/builderUtils.js'
import { ACTIVITY_REGISTRY } from '../../lib/activityRegistry.js'

// ------------------- Shared low-level inputs -------------------

function Field({ label, hint, children }) {
  return (
    <div>
      {label && (
        <label className="block text-[13px] font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      {children}
      {hint && <div className="text-[12px] text-slate-500 mt-1">{hint}</div>}
    </div>
  )
}

function Input(props) {
  return (
    <input
      {...props}
      className={
        'w-full text-[14px] px-3 py-2 min-h-[40px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 ' +
        (props.className || '')
      }
    />
  )
}

function Textarea({ refProp, ...props }) {
  return (
    <textarea
      ref={refProp}
      rows={props.rows || 4}
      {...props}
      className={
        'w-full text-[14px] leading-relaxed px-3 py-2 bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 ' +
        (props.className || '')
      }
    />
  )
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className={
        'w-full text-[14px] px-3 py-2 min-h-[40px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 ' +
        (props.className || '')
      }
    >
      {children}
    </select>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px] text-slate-700 cursor-pointer">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-amber-500"
      />
      {label}
    </label>
  )
}

function IconButton({ icon: Icon, onClick, label, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={
        'p-1.5 rounded-full ' +
        (danger
          ? 'text-rose-500 hover:bg-rose-50'
          : 'text-slate-500 hover:bg-slate-100')
      }
    >
      <Icon size={16} strokeWidth={1.5} />
    </button>
  )
}

function AddButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[13px] font-medium text-amber-700 hover:text-amber-900 border border-amber-200 hover:border-amber-400 rounded-full px-3 py-1.5 min-h-[36px]"
    >
      <Plus size={14} strokeWidth={1.5} />
      {children}
    </button>
  )
}

// Insert text at the cursor of a textarea/input ref.
function insertAtCursor(ref, current, insertText, onChange) {
  const el = ref.current
  if (!el || typeof el.selectionStart !== 'number') {
    onChange((current || '') + insertText)
    return
  }
  const start = el.selectionStart
  const end = el.selectionEnd
  const next = (current || '').slice(0, start) + insertText + (current || '').slice(end)
  onChange(next)
  requestAnimationFrame(() => {
    el.focus()
    const pos = start + insertText.length
    el.setSelectionRange(pos, pos)
  })
}

// ------------------- psychometric_scale -------------------

function ScaleConfig({ content, onChange }) {
  function patch(p) {
    onChange({ ...content, ...p })
  }
  function patchAnchors(p) {
    onChange({ ...content, anchors: { ...(content.anchors || {}), ...p } })
  }
  function updateScaleItems(items) {
    onChange({ ...content, items })
  }
  function addItem() {
    updateScaleItems([
      ...(content.items || []),
      { id: shortId('si'), text: 'New scale item', reverse_scored: false },
    ])
  }
  function removeItem(idx) {
    updateScaleItems((content.items || []).filter((_, i) => i !== idx))
  }
  function patchItem(idx, p) {
    updateScaleItems((content.items || []).map((it, i) => (i === idx ? { ...it, ...p } : it)))
  }
  function moveItem(idx, dir) {
    const items = [...(content.items || [])]
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    ;[items[idx], items[j]] = [items[j], items[idx]]
    updateScaleItems(items)
  }

  function patchScoring(p) {
    onChange({ ...content, scoring: { ...(content.scoring || {}), ...p } })
  }
  function addBand() {
    const bands = [...((content.scoring || {}).interpretation_bands || []), { min: 0, max: 0, label: 'New band', color: 'amber' }]
    patchScoring({ interpretation_bands: bands })
  }
  function patchBand(idx, p) {
    const bands = [...((content.scoring || {}).interpretation_bands || [])]
    bands[idx] = { ...bands[idx], ...p }
    patchScoring({ interpretation_bands: bands })
  }
  function removeBand(idx) {
    const bands = [...((content.scoring || {}).interpretation_bands || [])]
    bands.splice(idx, 1)
    patchScoring({ interpretation_bands: bands })
  }

  return (
    <div className="space-y-4">
      <Field label="Scale name">
        <Input value={content.scale_name || ''} onChange={(e) => patch({ scale_name: e.target.value })} />
      </Field>
      <Field label="Instructions">
        <Textarea value={content.instructions || ''} onChange={(e) => patch({ instructions: e.target.value })} rows={3} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mode">
          <Select value={content.mode || 'research_only'} onChange={(e) => patch({ mode: e.target.value })}>
            <option value="research_only">research_only</option>
            <option value="display_score">display_score</option>
          </Select>
        </Field>
        <Field label="Format">
          <Select value={content.format || 'likert'} onChange={(e) => patch({ format: e.target.value })}>
            <option value="likert">likert</option>
            <option value="vas">vas</option>
            <option value="binary">binary</option>
          </Select>
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-medium text-slate-700">Scale items</div>
          <AddButton onClick={addItem}>Add scale item</AddButton>
        </div>
        <div className="space-y-2">
          {(content.items || []).map((it, idx) => (
            <div key={it.id || idx} className="flex items-start gap-2 bg-white border border-slate-200 rounded-2xl p-2">
              <div className="flex flex-col">
                <IconButton icon={GripVertical} onClick={() => moveItem(idx, -1)} label="Move up" />
                <IconButton icon={GripVertical} onClick={() => moveItem(idx, 1)} label="Move down" />
              </div>
              <div className="flex-1 space-y-1">
                <Input value={it.id} onChange={(e) => patchItem(idx, { id: e.target.value })} placeholder="id" />
                <Input value={it.text} onChange={(e) => patchItem(idx, { text: e.target.value })} placeholder="Statement text" />
                <Toggle checked={it.reverse_scored} onChange={(v) => patchItem(idx, { reverse_scored: v })} label="Reverse scored" />
              </div>
              <IconButton icon={Trash2} onClick={() => removeItem(idx)} label="Remove" danger />
            </div>
          ))}
        </div>
      </div>

      {content.format === 'likert' && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min value">
            <Input type="number" value={content.anchors?.min_value ?? 0} onChange={(e) => patchAnchors({ min_value: Number(e.target.value) })} />
          </Field>
          <Field label="Max value">
            <Input type="number" value={content.anchors?.max_value ?? 4} onChange={(e) => patchAnchors({ max_value: Number(e.target.value) })} />
          </Field>
          <Field label="Min label">
            <Input value={content.anchors?.min_label || ''} onChange={(e) => patchAnchors({ min_label: e.target.value })} />
          </Field>
          <Field label="Max label">
            <Input value={content.anchors?.max_label || ''} onChange={(e) => patchAnchors({ max_label: e.target.value })} />
          </Field>
          <Field label="">
            <Toggle checked={content.anchors?.show_midpoint_label} onChange={(v) => patchAnchors({ show_midpoint_label: v })} label="Show midpoint label" />
          </Field>
          {content.anchors?.show_midpoint_label && (
            <Field label="Midpoint label">
              <Input value={content.anchors?.midpoint_label || ''} onChange={(e) => patchAnchors({ midpoint_label: e.target.value })} />
            </Field>
          )}
        </div>
      )}

      {content.format === 'vas' && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="VAS min">
            <Input type="number" value={content.vas_config?.min_value ?? 0} onChange={(e) => onChange({ ...content, vas_config: { ...(content.vas_config || {}), min_value: Number(e.target.value) } })} />
          </Field>
          <Field label="VAS max">
            <Input type="number" value={content.vas_config?.max_value ?? 100} onChange={(e) => onChange({ ...content, vas_config: { ...(content.vas_config || {}), max_value: Number(e.target.value) } })} />
          </Field>
          <Field label="Step">
            <Input type="number" value={content.vas_config?.step ?? 1} onChange={(e) => onChange({ ...content, vas_config: { ...(content.vas_config || {}), step: Number(e.target.value) } })} />
          </Field>
          <Field label="Min label">
            <Input value={content.vas_config?.min_label || ''} onChange={(e) => onChange({ ...content, vas_config: { ...(content.vas_config || {}), min_label: e.target.value } })} />
          </Field>
          <Field label="Max label">
            <Input value={content.vas_config?.max_label || ''} onChange={(e) => onChange({ ...content, vas_config: { ...(content.vas_config || {}), max_label: e.target.value } })} />
          </Field>
        </div>
      )}

      {content.mode === 'display_score' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-3">
          <div className="text-[13px] font-medium text-amber-800">Score display</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Method">
              <Select value={content.scoring?.method || 'sum'} onChange={(e) => patchScoring({ method: e.target.value })}>
                <option value="sum">sum</option>
                <option value="mean">mean</option>
              </Select>
            </Field>
            <Field label="Display label">
              <Input value={content.scoring?.display_label || ''} onChange={(e) => patchScoring({ display_label: e.target.value })} />
            </Field>
            <Field label="Min possible">
              <Input type="number" value={content.scoring?.min_possible ?? 0} onChange={(e) => patchScoring({ min_possible: Number(e.target.value) })} />
            </Field>
            <Field label="Max possible">
              <Input type="number" value={content.scoring?.max_possible ?? 0} onChange={(e) => patchScoring({ max_possible: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Display message">
            <Textarea value={content.scoring?.display_message || ''} onChange={(e) => patchScoring({ display_message: e.target.value })} rows={2} />
          </Field>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[13px] font-medium text-slate-700">Interpretation bands</div>
              <AddButton onClick={addBand}>Add band</AddButton>
            </div>
            <div className="space-y-2">
              {(content.scoring?.interpretation_bands || []).map((b, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white border border-slate-200 rounded-2xl p-2">
                  <Input className="col-span-2" type="number" value={b.min} onChange={(e) => patchBand(idx, { min: Number(e.target.value) })} placeholder="min" />
                  <Input className="col-span-2" type="number" value={b.max} onChange={(e) => patchBand(idx, { max: Number(e.target.value) })} placeholder="max" />
                  <Input className="col-span-5" value={b.label} onChange={(e) => patchBand(idx, { label: e.target.value })} placeholder="label" />
                  <Input className="col-span-2" value={b.color || ''} onChange={(e) => patchBand(idx, { color: e.target.value })} placeholder="color" />
                  <div className="col-span-1 flex justify-end">
                    <IconButton icon={Trash2} onClick={() => removeBand(idx)} danger />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        <Toggle checked={content.display_one_at_a_time} onChange={(v) => patch({ display_one_at_a_time: v })} label="Display one item at a time" />
        <Toggle checked={content.randomize_order} onChange={(v) => patch({ randomize_order: v })} label="Randomize item order" />
        <Toggle checked={content.show_progress !== false} onChange={(v) => patch({ show_progress: v })} label="Show progress dots" />
      </div>
    </div>
  )
}

// ------------------- video -------------------

function VideoConfig({ content, onChange }) {
  const patch = (p) => onChange({ ...content, ...p })
  return (
    <div className="space-y-4">
      <Field label="Vimeo URL" hint="e.g. https://vimeo.com/123456789">
        <Input value={content.vimeo_url || ''} onChange={(e) => patch({ vimeo_url: e.target.value })} placeholder="https://vimeo.com/..." />
      </Field>
      <Field label="Title">
        <Input value={content.title || ''} onChange={(e) => patch({ title: e.target.value })} />
      </Field>
      <Field label="Context before">
        <Textarea value={content.context_before || ''} onChange={(e) => patch({ context_before: e.target.value })} rows={2} />
      </Field>
      <Field label="Context after">
        <Textarea value={content.context_after || ''} onChange={(e) => patch({ context_after: e.target.value })} rows={2} />
      </Field>
      <div className="space-y-2">
        <Toggle checked={content.required_completion} onChange={(v) => patch({ required_completion: v })} label="Require completion before continuing" />
        {content.required_completion && (
          <Field label={`Completion threshold (${Math.round((content.completion_threshold ?? 0.85) * 100)}%)`}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={content.completion_threshold ?? 0.85}
              onChange={(e) => patch({ completion_threshold: Number(e.target.value) })}
              className="w-full accent-amber-400"
            />
          </Field>
        )}
        <Toggle checked={content.autoplay} onChange={(v) => patch({ autoplay: v })} label="Autoplay" />
        <Toggle checked={content.show_controls !== false} onChange={(v) => patch({ show_controls: v })} label="Show player controls" />
      </div>
    </div>
  )
}

// ------------------- text_prompt -------------------

function TextPromptConfig({ content, onChange, tokenItems }) {
  const bodyRef = useRef(null)
  const patch = (p) => onChange({ ...content, ...p })
  return (
    <div className="space-y-4">
      <Field label="Heading (optional)">
        <Input value={content.heading || ''} onChange={(e) => patch({ heading: e.target.value })} />
      </Field>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[13px] font-medium text-slate-700">Body</label>
          <TokenPicker
            tokenItems={tokenItems}
            onInsert={(t) => insertAtCursor(bodyRef, content.body, t, (next) => patch({ body: next }))}
          />
        </div>
        <Textarea refProp={bodyRef} value={content.body || ''} onChange={(e) => patch({ body: e.target.value })} rows={6} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Format">
          <Select value={content.format || 'standard'} onChange={(e) => patch({ format: e.target.value })}>
            <option value="standard">standard</option>
            <option value="callout">callout</option>
            <option value="pull_forward_highlight">pull_forward_highlight</option>
          </Select>
        </Field>
        <Field label="Continue button label">
          <Input value={content.continue_label || ''} onChange={(e) => patch({ continue_label: e.target.value })} />
        </Field>
      </div>
      <Toggle
        checked={content.show_continue_button !== false}
        onChange={(v) => patch({ show_continue_button: v })}
        label="Show continue button"
      />
    </div>
  )
}

// ------------------- free_text -------------------

function FreeTextConfig({ content, onChange, tokenItems }) {
  const promptRef = useRef(null)
  const patch = (p) => onChange({ ...content, ...p })
  function patchPullForward(p) {
    onChange({ ...content, pull_forward: { ...(content.pull_forward || {}), ...p } })
  }
  function clearPullForward() {
    const { pull_forward: _drop, ...rest } = content
    onChange(rest)
  }
  function addChip() {
    onChange({ ...content, word_bank: [...(content.word_bank || []), { id: shortId('wb'), text: '' }] })
  }
  function patchChip(idx, p) {
    onChange({
      ...content,
      word_bank: (content.word_bank || []).map((c, i) => (i === idx ? { ...c, ...p } : c)),
    })
  }
  function removeChip(idx) {
    onChange({ ...content, word_bank: (content.word_bank || []).filter((_, i) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[13px] font-medium text-slate-700">Prompt</label>
          <TokenPicker
            tokenItems={tokenItems}
            onInsert={(t) => insertAtCursor(promptRef, content.prompt, t, (next) => patch({ prompt: next }))}
          />
        </div>
        <Textarea refProp={promptRef} value={content.prompt || ''} onChange={(e) => patch({ prompt: e.target.value })} rows={3} />
      </div>
      <Field label="Sentence starter (optional)">
        <Input value={content.sentence_starter || ''} onChange={(e) => patch({ sentence_starter: e.target.value })} />
      </Field>
      <Field label="Placeholder text">
        <Input value={content.placeholder || ''} onChange={(e) => patch({ placeholder: e.target.value })} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Min chars">
          <Input type="number" value={content.min_chars ?? 0} onChange={(e) => patch({ min_chars: Number(e.target.value) })} />
        </Field>
        <Field label="Max chars">
          <Input type="number" value={content.max_chars ?? 500} onChange={(e) => patch({ max_chars: Number(e.target.value) })} />
        </Field>
        <Field label="Rows">
          <Input type="number" value={content.rows ?? 5} onChange={(e) => patch({ rows: Number(e.target.value) })} />
        </Field>
      </div>
      <Toggle checked={content.show_char_count !== false} onChange={(v) => patch({ show_char_count: v })} label="Show character count" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-medium text-slate-700">Word bank</div>
          <AddButton onClick={addChip}>Add chip</AddButton>
        </div>
        <Field label="Word bank label">
          <Input value={content.word_bank_label || ''} onChange={(e) => patch({ word_bank_label: e.target.value })} />
        </Field>
        <div className="space-y-2 mt-2">
          {(content.word_bank || []).map((c, idx) => (
            <div key={c.id || idx} className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-2">
              <Input className="w-32" value={c.id} onChange={(e) => patchChip(idx, { id: e.target.value })} placeholder="id" />
              <Input className="flex-1" value={c.text} onChange={(e) => patchChip(idx, { text: e.target.value })} placeholder="chip text" />
              <IconButton icon={Trash2} onClick={() => removeChip(idx)} danger />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-medium text-amber-800">Pull-forward</div>
          {content.pull_forward ? (
            <button type="button" onClick={clearPullForward} className="text-[12px] text-rose-500 hover:text-rose-700">Remove</button>
          ) : (
            <TokenPicker
              tokenItems={tokenItems}
              onInsert={(t) => patchPullForward({ token: t })}
              label="Pick token"
            />
          )}
        </div>
        {content.pull_forward && (
          <>
            <Field label="Token">
              <Input value={content.pull_forward.token || ''} onChange={(e) => patchPullForward({ token: e.target.value })} />
            </Field>
            <Field label="Label">
              <Input value={content.pull_forward.label || ''} onChange={(e) => patchPullForward({ label: e.target.value })} />
            </Field>
            <Toggle
              checked={content.pull_forward.user_can_exclude !== false}
              onChange={(v) => patchPullForward({ user_can_exclude: v })}
              label="Allow user to exclude"
            />
          </>
        )}
      </div>
    </div>
  )
}

// ------------------- structured_activity -------------------

function StructuredActivityConfig({ content, onChange, tokenItems }) {
  const patch = (p) => onChange({ ...content, ...p })
  function setField(idx, p) {
    onChange({ ...content, fields: (content.fields || []).map((f, i) => (i === idx ? { ...f, ...p } : f)) })
  }
  function addField() {
    onChange({
      ...content,
      fields: [
        ...(content.fields || []),
        { id: shortId('f'), label: 'New field', type: 'free_text', required: false, max_chars: 200 },
      ],
    })
  }
  function removeField(idx) {
    onChange({ ...content, fields: (content.fields || []).filter((_, i) => i !== idx) })
  }
  function moveField(idx, dir) {
    const fields = [...(content.fields || [])]
    const j = idx + dir
    if (j < 0 || j >= fields.length) return
    ;[fields[idx], fields[j]] = [fields[j], fields[idx]]
    patch({ fields })
  }

  return (
    <div className="space-y-4">
      <Field label="Title">
        <Input value={content.title || ''} onChange={(e) => patch({ title: e.target.value })} />
      </Field>
      <Field label="Instructions">
        <Textarea value={content.instructions || ''} onChange={(e) => patch({ instructions: e.target.value })} rows={3} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Layout">
          <Select value={content.layout || 'single_column'} onChange={(e) => patch({ layout: e.target.value })}>
            <option value="single_column">single_column</option>
            <option value="two_column">two_column</option>
          </Select>
        </Field>
        <Field label="Completion message">
          <Input value={content.completion_message || ''} onChange={(e) => patch({ completion_message: e.target.value })} />
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-medium text-slate-700">Fields</div>
          <AddButton onClick={addField}>Add field</AddButton>
        </div>
        <div className="space-y-2">
          {(content.fields || []).map((f, idx) => (
            <FieldEditor key={f.id || idx} field={f} idx={idx} onChange={(p) => setField(idx, p)} onRemove={() => removeField(idx)} onMove={(dir) => moveField(idx, dir)} tokenItems={tokenItems} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FieldEditor({ field, onChange, onRemove, onMove, tokenItems }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3">
      <div className="flex items-start gap-2">
        <div className="flex flex-col">
          <IconButton icon={GripVertical} onClick={() => onMove(-1)} label="Move up" />
          <IconButton icon={GripVertical} onClick={() => onMove(1)} label="Move down" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <Input value={field.id} onChange={(e) => onChange({ id: e.target.value })} placeholder="id" />
            <Input className="col-span-2" value={field.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="label" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={field.type} onChange={(e) => onChange({ type: e.target.value })}>
              <option value="free_text">free_text</option>
              <option value="single_choice">single_choice</option>
              <option value="multiple_choice">multiple_choice</option>
              <option value="number_input">number_input</option>
              <option value="rating">rating</option>
              <option value="drag_and_drop">drag_and_drop</option>
            </Select>
            <Toggle checked={field.required} onChange={(v) => onChange({ required: v })} label="Required" />
          </div>
          {field.type === 'free_text' && (
            <div className="grid grid-cols-2 gap-2">
              <Input value={field.placeholder || ''} onChange={(e) => onChange({ placeholder: e.target.value })} placeholder="placeholder" />
              <Input type="number" value={field.max_chars ?? 200} onChange={(e) => onChange({ max_chars: Number(e.target.value) })} placeholder="max chars" />
            </div>
          )}
          {(field.type === 'single_choice' || field.type === 'multiple_choice') && (
            <OptionsEditor
              options={field.options || []}
              onChange={(options) => onChange({ options })}
            />
          )}
          {field.type === 'multiple_choice' && (
            <Field label="Max selections (blank = unlimited)">
              <Input type="number" value={field.max_selections ?? ''} onChange={(e) => onChange({ max_selections: e.target.value === '' ? null : Number(e.target.value) })} />
            </Field>
          )}
          {field.type === 'number_input' && (
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" value={field.min ?? 1} onChange={(e) => onChange({ min: Number(e.target.value) })} placeholder="min" />
              <Input type="number" value={field.max ?? 10} onChange={(e) => onChange({ max: Number(e.target.value) })} placeholder="max" />
              <Input type="number" value={field.step ?? 1} onChange={(e) => onChange({ step: Number(e.target.value) })} placeholder="step" />
            </div>
          )}
          {field.type === 'rating' && (
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" value={field.min_value ?? 1} onChange={(e) => onChange({ min_value: Number(e.target.value) })} placeholder="min" />
              <Input type="number" value={field.max_value ?? 5} onChange={(e) => onChange({ max_value: Number(e.target.value) })} placeholder="max" />
              <Input value={field.min_label || ''} onChange={(e) => onChange({ min_label: e.target.value })} placeholder="min label" />
              <Input value={field.max_label || ''} onChange={(e) => onChange({ max_label: e.target.value })} placeholder="max label" />
            </div>
          )}
          {field.type === 'drag_and_drop' && (
            <DragDropFieldEditor field={field} onChange={onChange} />
          )}
          <PullForwardEditor
            field={field}
            onChange={onChange}
            tokenItems={tokenItems}
          />
          <Field label="Token key (optional)">
            <Input className="font-mono text-[13px]" value={field.token_key || ''} onChange={(e) => onChange({ token_key: e.target.value })} placeholder="e.g. action_goal" />
          </Field>
        </div>
        <IconButton icon={Trash2} onClick={onRemove} danger />
      </div>
    </div>
  )
}

function OptionsEditor({ options, onChange }) {
  function add() {
    onChange([...options, { id: shortId('opt'), text: '' }])
  }
  function remove(idx) {
    onChange(options.filter((_, i) => i !== idx))
  }
  function patch(idx, p) {
    onChange(options.map((o, i) => (i === idx ? { ...o, ...p } : o)))
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-[12px] font-medium text-slate-600">Options</div>
        <AddButton onClick={add}>Add option</AddButton>
      </div>
      <div className="space-y-1">
        {options.map((o, idx) => (
          <div key={o.id || idx} className="flex items-center gap-2">
            <Input className="w-32" value={o.id} onChange={(e) => patch(idx, { id: e.target.value })} placeholder="id" />
            <Input className="flex-1" value={o.text} onChange={(e) => patch(idx, { text: e.target.value })} placeholder="text" />
            <IconButton icon={Trash2} onClick={() => remove(idx)} danger />
          </div>
        ))}
      </div>
    </div>
  )
}

function DragDropFieldEditor({ field, onChange }) {
  function patchItems(items) { onChange({ items }) }
  function patchBuckets(buckets) { onChange({ buckets }) }
  return (
    <div className="space-y-2">
      <OptionsEditor
        options={field.items || []}
        onChange={(items) => patchItems(items)}
      />
      <div className="text-[12px] text-slate-500 mt-1">Items above; buckets below.</div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-medium text-slate-600">Buckets</div>
          <AddButton onClick={() => patchBuckets([...(field.buckets || []), { id: shortId('b'), label: '' }])}>Add bucket</AddButton>
        </div>
        {(field.buckets || []).map((b, idx) => (
          <div key={b.id || idx} className="flex items-center gap-2">
            <Input className="w-32" value={b.id} onChange={(e) => patchBuckets((field.buckets || []).map((x, i) => i === idx ? { ...x, id: e.target.value } : x))} placeholder="id" />
            <Input className="flex-1" value={b.label} onChange={(e) => patchBuckets((field.buckets || []).map((x, i) => i === idx ? { ...x, label: e.target.value } : x))} placeholder="label" />
            <IconButton icon={Trash2} onClick={() => patchBuckets((field.buckets || []).filter((_, i) => i !== idx))} danger />
          </div>
        ))}
      </div>
      <Toggle checked={field.allow_unplaced !== false} onChange={(v) => onChange({ allow_unplaced: v })} label="Allow unplaced items" />
    </div>
  )
}

function PullForwardEditor({ field, onChange, tokenItems }) {
  function patch(p) { onChange({ pull_forward: { ...(field.pull_forward || {}), ...p } }) }
  function clear() {
    const { pull_forward: _drop, ...rest } = field
    onChange(rest)
  }
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[12px] font-medium text-amber-800">Pull-forward</div>
        {field.pull_forward ? (
          <button type="button" onClick={clear} className="text-[12px] text-rose-500 hover:text-rose-700">Remove</button>
        ) : (
          <TokenPicker tokenItems={tokenItems} onInsert={(t) => patch({ token: t })} label="Pick" />
        )}
      </div>
      {field.pull_forward && (
        <div className="space-y-1">
          <Input value={field.pull_forward.token || ''} onChange={(e) => patch({ token: e.target.value })} placeholder="{{response.x}}" />
          <Input value={field.pull_forward.label || ''} onChange={(e) => patch({ label: e.target.value })} placeholder="callout label" />
          <Toggle checked={field.pull_forward.user_can_exclude !== false} onChange={(v) => patch({ user_can_exclude: v })} label="User can exclude" />
        </div>
      )}
    </div>
  )
}

// ------------------- guided_creative -------------------

function GuidedCreativeConfig({ content, onChange }) {
  const patch = (p) => onChange({ ...content, ...p })

  function patchStanza(idx, p) {
    const stanzas = [...(content.stanzas || [])]
    stanzas[idx] = { ...stanzas[idx], ...p }
    patch({ stanzas })
  }
  function addStanza() {
    patch({ stanzas: [...(content.stanzas || []), { id: shortId('st'), prompts: [] }] })
  }
  function removeStanza(idx) {
    patch({ stanzas: (content.stanzas || []).filter((_, i) => i !== idx) })
  }
  function moveStanza(idx, dir) {
    const stanzas = [...(content.stanzas || [])]
    const j = idx + dir
    if (j < 0 || j >= stanzas.length) return
    ;[stanzas[idx], stanzas[j]] = [stanzas[j], stanzas[idx]]
    patch({ stanzas })
  }

  function patchPrompt(stIdx, pIdx, p) {
    const stanzas = [...(content.stanzas || [])]
    const prompts = [...(stanzas[stIdx].prompts || [])]
    prompts[pIdx] = { ...prompts[pIdx], ...p }
    stanzas[stIdx] = { ...stanzas[stIdx], prompts }
    patch({ stanzas })
  }
  function addPrompt(stIdx) {
    const stanzas = [...(content.stanzas || [])]
    stanzas[stIdx] = {
      ...stanzas[stIdx],
      prompts: [...(stanzas[stIdx].prompts || []), { id: shortId('p'), starter: '', hint: '', max_chars: 80, required: false }],
    }
    patch({ stanzas })
  }
  function removePrompt(stIdx, pIdx) {
    const stanzas = [...(content.stanzas || [])]
    stanzas[stIdx] = {
      ...stanzas[stIdx],
      prompts: (stanzas[stIdx].prompts || []).filter((_, i) => i !== pIdx),
    }
    patch({ stanzas })
  }
  function movePrompt(stIdx, pIdx, dir) {
    const stanzas = [...(content.stanzas || [])]
    const prompts = [...(stanzas[stIdx].prompts || [])]
    const j = pIdx + dir
    if (j < 0 || j >= prompts.length) return
    ;[prompts[pIdx], prompts[j]] = [prompts[j], prompts[pIdx]]
    stanzas[stIdx] = { ...stanzas[stIdx], prompts }
    patch({ stanzas })
  }

  // Word banks
  function setBankChip(bankKey, idx, p) {
    const banks = { ...(content.word_banks || {}) }
    const arr = [...(banks[bankKey] || [])]
    arr[idx] = { ...arr[idx], ...p }
    banks[bankKey] = arr
    patch({ word_banks: banks })
  }
  function addBankChip(bankKey) {
    const banks = { ...(content.word_banks || {}) }
    banks[bankKey] = [...(banks[bankKey] || []), { id: shortId('wb'), text: '' }]
    patch({ word_banks: banks })
  }
  function removeBankChip(bankKey, idx) {
    const banks = { ...(content.word_banks || {}) }
    banks[bankKey] = (banks[bankKey] || []).filter((_, i) => i !== idx)
    patch({ word_banks: banks })
  }

  const allPromptIds = (content.stanzas || []).flatMap((s) => (s.prompts || []).map((p) => p.id))

  return (
    <div className="space-y-4">
      <Field label="Title">
        <Input value={content.title || ''} onChange={(e) => patch({ title: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Artifact type">
          <Select value={content.artifact_type || 'poem'} onChange={(e) => patch({ artifact_type: e.target.value })}>
            <option value="poem">poem</option>
            <option value="letter">letter</option>
            <option value="card">card</option>
          </Select>
        </Field>
        <Field label="Completion message">
          <Input value={content.completion_message || ''} onChange={(e) => patch({ completion_message: e.target.value })} />
        </Field>
      </div>
      <Field label="Instructions">
        <Textarea value={content.instructions || ''} onChange={(e) => patch({ instructions: e.target.value })} rows={2} />
      </Field>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-medium text-slate-700">Stanzas</div>
          <AddButton onClick={addStanza}>Add stanza</AddButton>
        </div>
        <div className="space-y-2">
          {(content.stanzas || []).map((st, sIdx) => (
            <div key={st.id || sIdx} className="bg-white border border-slate-200 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Input className="flex-1" value={st.id} onChange={(e) => patchStanza(sIdx, { id: e.target.value })} placeholder="stanza id" />
                <IconButton icon={GripVertical} onClick={() => moveStanza(sIdx, -1)} label="Move up" />
                <IconButton icon={GripVertical} onClick={() => moveStanza(sIdx, 1)} label="Move down" />
                <IconButton icon={Trash2} onClick={() => removeStanza(sIdx)} danger />
              </div>
              <div className="space-y-1">
                {(st.prompts || []).map((p, pIdx) => (
                  <div key={p.id || pIdx} className="flex items-start gap-2">
                    <div className="flex flex-col">
                      <IconButton icon={GripVertical} onClick={() => movePrompt(sIdx, pIdx, -1)} label="Move up" />
                      <IconButton icon={GripVertical} onClick={() => movePrompt(sIdx, pIdx, 1)} label="Move down" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input value={p.id} onChange={(e) => patchPrompt(sIdx, pIdx, { id: e.target.value })} placeholder="id" />
                      <Input type="number" value={p.max_chars ?? 80} onChange={(e) => patchPrompt(sIdx, pIdx, { max_chars: Number(e.target.value) })} placeholder="max chars" />
                      <Input value={p.starter} onChange={(e) => patchPrompt(sIdx, pIdx, { starter: e.target.value })} placeholder="sentence starter" />
                      <Input value={p.hint || ''} onChange={(e) => patchPrompt(sIdx, pIdx, { hint: e.target.value })} placeholder="hint" />
                      <Toggle checked={p.required} onChange={(v) => patchPrompt(sIdx, pIdx, { required: v })} label="Required" />
                      <Select value={p.pull_forward_from || ''} onChange={(e) => patchPrompt(sIdx, pIdx, { pull_forward_from: e.target.value || undefined })}>
                        <option value="">No pull-forward</option>
                        {allPromptIds.filter((id) => id !== p.id).map((id) => (
                          <option key={id} value={id}>From {id}</option>
                        ))}
                      </Select>
                    </div>
                    <IconButton icon={Trash2} onClick={() => removePrompt(sIdx, pIdx)} danger />
                  </div>
                ))}
                <AddButton onClick={() => addPrompt(sIdx)}>Add prompt</AddButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 space-y-2">
        <div className="text-[13px] font-medium text-amber-800">Word banks</div>
        <BankEditor
          title="Global word bank"
          chips={content.word_banks?.__global__ || []}
          onAdd={() => addBankChip('__global__')}
          onPatch={(idx, p) => setBankChip('__global__', idx, p)}
          onRemove={(idx) => removeBankChip('__global__', idx)}
        />
        <details>
          <summary className="text-[13px] cursor-pointer text-amber-700">Per-prompt banks</summary>
          <div className="space-y-2 mt-2">
            {allPromptIds.map((pid) => (
              <BankEditor
                key={pid}
                title={`Bank for ${pid}`}
                chips={content.word_banks?.[pid] || []}
                onAdd={() => addBankChip(pid)}
                onPatch={(idx, p) => setBankChip(pid, idx, p)}
                onRemove={(idx) => removeBankChip(pid, idx)}
              />
            ))}
          </div>
        </details>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Header">
          <Input value={content.artifact_framing?.header || ''} onChange={(e) => patch({ artifact_framing: { ...(content.artifact_framing || {}), header: e.target.value } })} />
        </Field>
        <Field label="Footer">
          <Input value={content.artifact_framing?.footer || ''} onChange={(e) => patch({ artifact_framing: { ...(content.artifact_framing || {}), footer: e.target.value } })} />
        </Field>
      </div>
    </div>
  )
}

function BankEditor({ title, chips, onAdd, onPatch, onRemove }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-[12px] font-medium text-slate-600">{title}</div>
        <AddButton onClick={onAdd}>Add chip</AddButton>
      </div>
      <div className="space-y-1">
        {chips.map((c, idx) => (
          <div key={c.id || idx} className="flex items-center gap-2">
            <Input className="w-32" value={c.id} onChange={(e) => onPatch(idx, { id: e.target.value })} placeholder="id" />
            <Input className="flex-1" value={c.text} onChange={(e) => onPatch(idx, { text: e.target.value })} placeholder="chip text" />
            <IconButton icon={Trash2} onClick={() => onRemove(idx)} danger />
          </div>
        ))}
      </div>
    </div>
  )
}

// ------------------- choice -------------------

function ChoiceConfig({ content, onChange }) {
  const patch = (p) => onChange({ ...content, ...p })
  function patchOption(idx, p) {
    onChange({ ...content, options: (content.options || []).map((o, i) => i === idx ? { ...o, ...p } : o) })
  }
  function addOption() {
    onChange({ ...content, options: [...(content.options || []), { id: shortId('opt'), text: '' }] })
  }
  function removeOption(idx) {
    onChange({ ...content, options: (content.options || []).filter((_, i) => i !== idx) })
  }
  function moveOption(idx, dir) {
    const options = [...(content.options || [])]
    const j = idx + dir
    if (j < 0 || j >= options.length) return
    ;[options[idx], options[j]] = [options[j], options[idx]]
    patch({ options })
  }
  function patchScoring(optId, score) {
    const scoring = { ...(content.scoring || {}) }
    if (score === '' || isNaN(Number(score))) delete scoring[optId]
    else scoring[optId] = Number(score)
    patch({ scoring: Object.keys(scoring).length ? scoring : undefined })
  }
  return (
    <div className="space-y-4">
      <Field label="Prompt">
        <Textarea value={content.prompt || ''} onChange={(e) => patch({ prompt: e.target.value })} rows={2} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Selection type">
          <Select value={content.selection_type || 'single'} onChange={(e) => patch({ selection_type: e.target.value })}>
            <option value="single">single</option>
            <option value="multiple">multiple</option>
          </Select>
        </Field>
        <Field label="Display style">
          <Select value={content.display_style || 'card_grid'} onChange={(e) => patch({ display_style: e.target.value })}>
            <option value="card_grid">card_grid</option>
            <option value="list">list</option>
            <option value="chip_row">chip_row</option>
          </Select>
        </Field>
      </div>
      {content.selection_type === 'multiple' && (
        <Field label="Max selections (blank = unlimited)">
          <Input type="number" value={content.max_selections ?? ''} onChange={(e) => patch({ max_selections: e.target.value === '' ? null : Number(e.target.value) })} />
        </Field>
      )}
      <div className="space-y-2">
        <Toggle checked={content.randomize_order} onChange={(v) => patch({ randomize_order: v })} label="Randomize option order" />
        <Toggle checked={content.show_none_option} onChange={(v) => patch({ show_none_option: v })} label="Show 'None of these' option" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-medium text-slate-700">Options</div>
          <AddButton onClick={addOption}>Add option</AddButton>
        </div>
        <div className="space-y-2">
          {(content.options || []).map((o, idx) => (
            <div key={o.id || idx} className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-2">
              <div className="flex flex-col">
                <IconButton icon={GripVertical} onClick={() => moveOption(idx, -1)} label="Move up" />
                <IconButton icon={GripVertical} onClick={() => moveOption(idx, 1)} label="Move down" />
              </div>
              <Input className="w-28" value={o.id} onChange={(e) => patchOption(idx, { id: e.target.value })} placeholder="id" />
              <Input className="flex-1" value={o.text} onChange={(e) => patchOption(idx, { text: e.target.value })} placeholder="text" />
              <Input className="w-20" type="number" value={content.scoring?.[o.id] ?? ''} onChange={(e) => patchScoring(o.id, e.target.value)} placeholder="score" title="Optional score" />
              <IconButton icon={Trash2} onClick={() => removeOption(idx)} danger />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ------------------- page_break -------------------

function PageBreakConfig({ content, onChange }) {
  const patch = (p) => onChange({ ...content, ...p })
  return (
    <div className="space-y-3">
      <Field label="Heading (optional)">
        <Input value={content.heading || ''} onChange={(e) => patch({ heading: e.target.value })} />
      </Field>
      <Field label="Body (optional)">
        <Textarea value={content.body || ''} onChange={(e) => patch({ body: e.target.value })} rows={3} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Continue label">
          <Input value={content.continue_label || ''} onChange={(e) => patch({ continue_label: e.target.value })} />
        </Field>
        <Field label="Animation">
          <Select value={content.animation || 'fade'} onChange={(e) => patch({ animation: e.target.value })}>
            <option value="fade">fade</option>
            <option value="slide">slide</option>
            <option value="none">none</option>
          </Select>
        </Field>
      </div>
      <Toggle checked={content.show_progress} onChange={(v) => patch({ show_progress: v })} label="Show progress dots" />
    </div>
  )
}

// ------------------- custom_activity -------------------

function CustomActivityConfig({ content, onChange }) {
  const componentNames = Object.keys(ACTIVITY_REGISTRY)
  const propsText = (() => {
    try {
      return JSON.stringify(content.props || {}, null, 2)
    } catch {
      return '{}'
    }
  })()
  function patchProps(text) {
    try {
      const parsed = JSON.parse(text)
      onChange({ ...content, props: parsed, _propsText: undefined })
    } catch {
      // Keep editing without parsing — store raw text via a sidecar field.
      onChange({ ...content, _propsText: text })
    }
  }
  return (
    <div className="space-y-4">
      <Field label="Component name" hint="Must match a key in ACTIVITY_REGISTRY">
        <Select value={content.component_name || ''} onChange={(e) => onChange({ ...content, component_name: e.target.value })}>
          <option value="">— Pick —</option>
          {componentNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </Select>
      </Field>
      <Field label="Props (JSON)">
        <Textarea
          rows={6}
          className="font-mono text-[13px]"
          value={content._propsText !== undefined ? content._propsText : propsText}
          onChange={(e) => patchProps(e.target.value)}
        />
        {content._propsText !== undefined && (() => {
          try { JSON.parse(content._propsText); return null }
          catch (err) {
            return <div className="text-[12px] text-rose-600 mt-1">Invalid JSON — fix to save.</div>
          }
        })()}
      </Field>
    </div>
  )
}

// ------------------- DISPATCHER -------------------

const CONFIGS = {
  psychometric_scale: ScaleConfig,
  video: VideoConfig,
  text_prompt: TextPromptConfig,
  free_text: FreeTextConfig,
  structured_activity: StructuredActivityConfig,
  guided_creative: GuidedCreativeConfig,
  choice: ChoiceConfig,
  page_break: PageBreakConfig,
  custom_activity: CustomActivityConfig,
}

export default function ItemConfig({ item, onPatch, tokenItems }) {
  const Form = CONFIGS[item.type]
  if (!Form) {
    return <div className="text-[13px] text-rose-600">No config form for type "{item.type}".</div>
  }

  function setContent(content) {
    onPatch({ content_json: content })
  }

  return (
    <div>
      <Form content={item.content_json || {}} onChange={setContent} tokenItems={tokenItems} />
      <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
        <Field
          label="Token key (optional)"
          hint="Set this if you want to reference this item's response in pull-forward tokens."
        >
          <Input
            className="font-mono text-[13px]"
            value={item.token_key || ''}
            onChange={(e) => onPatch({ token_key: e.target.value || null })}
            placeholder="e.g. belonging_definition"
          />
        </Field>
        <Toggle
          checked={item.is_required !== false}
          onChange={(v) => onPatch({ is_required: v })}
          label="Required (participant must respond before advancing)"
        />
      </div>
    </div>
  )
}
