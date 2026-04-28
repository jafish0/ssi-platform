import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, GripVertical, Trash2 } from 'lucide-react'
import { ITEM_TYPES } from '../../lib/builderUtils.js'

function previewText(item) {
  const c = item.content_json || {}
  switch (item.type) {
    case 'psychometric_scale':
      return c.scale_name || 'Untitled scale'
    case 'video':
      return c.title || c.vimeo_url || 'Video'
    case 'text_prompt':
      return c.heading || (c.body || '').slice(0, 80) || 'Text prompt'
    case 'free_text':
      return (c.prompt || '').slice(0, 80) || 'Free text'
    case 'structured_activity':
      return c.title || 'Structured activity'
    case 'guided_creative':
      return c.title || 'Guided creative'
    case 'choice':
      return (c.prompt || '').slice(0, 80) || 'Choice'
    case 'page_break':
      return c.heading || 'Page break'
    case 'custom_activity':
      return c.component_name || 'Custom activity'
    default:
      return item.type
  }
}

function SortableItem({ item, isSelected, onSelect, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(item.id)}
      className={
        'flex items-start gap-2 rounded-2xl p-3 cursor-pointer transition-colors ' +
        (isSelected
          ? 'bg-amber-100 border border-amber-300'
          : 'bg-white border border-slate-200 hover:border-amber-300')
      }
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        onClick={(e) => e.stopPropagation()}
        className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing pt-1"
        title="Drag to reorder"
      >
        <GripVertical size={16} strokeWidth={1.5} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-mono text-slate-400">{item.order_index + 1}</div>
          <span className="text-[11px] uppercase tracking-wide font-semibold text-amber-800 bg-amber-50 rounded-full px-2 py-0.5">
            {item.type}
          </span>
          {item.token_key && (
            <span className="text-[11px] font-mono text-slate-500 truncate" title="token_key">
              {item.token_key}
            </span>
          )}
        </div>
        <div className="text-[14px] text-slate-700 mt-1 truncate">{previewText(item)}</div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (confirm('Delete this item?')) onDelete(item.id)
        }}
        className="text-slate-400 hover:text-rose-500 p-1"
        title="Delete item"
      >
        <Trash2 size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export default function ItemList({
  section,
  items,
  selectedItemId,
  onSelect,
  onAddItem,
  onDeleteItem,
  onReorder,
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [newType, setNewType] = useState('text_prompt')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((it) => it.id === active.id)
    const newIndex = items.findIndex((it) => it.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(items, oldIndex, newIndex)
    onReorder(reordered.map((it) => it.id))
  }

  if (!section) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-500 text-[14px]">
        Select a section on the left to edit its items.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-card flex flex-col overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wide text-amber-800 font-semibold">
            {section.type}
          </div>
          <div className="text-[15px] font-semibold text-slate-800 truncate">
            {section.title || '(untitled section)'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="text-amber-700 hover:text-amber-900 text-[13px] flex items-center gap-1 whitespace-nowrap"
        >
          <Plus size={14} strokeWidth={1.5} /> Add item
        </button>
      </div>

      {showAdd && (
        <div className="px-4 py-3 border-b border-slate-200 bg-amber-50 flex items-center gap-2">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="flex-1 text-[14px] px-3 py-2 min-h-[40px] bg-white border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
          >
            {ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => { onAddItem(newType); setShowAdd(false) }}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-4 py-1.5 min-h-[40px] text-[13px]"
          >
            Add
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="text-[13px] text-slate-500 italic px-2 py-4 text-center">
            No items in this section yet.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  isSelected={item.id === selectedItemId}
                  onSelect={onSelect}
                  onDelete={onDeleteItem}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
