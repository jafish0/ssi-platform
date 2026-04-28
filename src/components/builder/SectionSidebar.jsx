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
import { SECTION_TYPES } from '../../lib/builderUtils.js'

function SortableSection({ section, items, isSelected, onSelect, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(section.id)}
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
        className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing pt-1"
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
      >
        <GripVertical size={16} strokeWidth={1.5} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-mono text-slate-400">{section.order_index + 1}</div>
          <div className="text-[14px] font-medium text-slate-800 truncate">
            {section.title || '(untitled)'}
          </div>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          {section.type} · {items.length} item{items.length === 1 ? '' : 's'}
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (confirm(`Delete section "${section.title || 'untitled'}" and all its items?`)) {
            onDelete(section.id)
          }
        }}
        className="text-slate-400 hover:text-rose-500 p-1"
        title="Delete section"
      >
        <Trash2 size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}

export default function SectionSidebar({
  sections,
  items,
  selectedSectionId,
  onSelect,
  onAddSection,
  onDeleteSection,
  onReorder,
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [newType, setNewType] = useState('activity')
  const [newTitle, setNewTitle] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(sections, oldIndex, newIndex)
    onReorder(reordered.map((s) => s.id))
  }

  function handleAdd() {
    if (!newTitle.trim()) return
    onAddSection({ type: newType, title: newTitle.trim() })
    setNewTitle('')
    setShowAdd(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-card flex flex-col overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="text-[13px] font-semibold text-slate-700 uppercase tracking-wide">Sections</div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="text-amber-700 hover:text-amber-900 text-[13px] flex items-center gap-1"
        >
          <Plus size={14} strokeWidth={1.5} /> Add
        </button>
      </div>

      {showAdd && (
        <div className="px-3 py-3 border-b border-slate-200 bg-amber-50 space-y-2">
          <input
            type="text"
            placeholder="Section title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full text-[14px] px-3 py-2 min-h-[40px] bg-white border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
            autoFocus
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="w-full text-[14px] px-3 py-2 min-h-[40px] bg-white border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400"
          >
            {SECTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-[13px] text-slate-600 hover:text-slate-800 px-2 py-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-full px-4 py-1.5 text-[13px]"
            >
              Add section
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sections.length === 0 ? (
          <div className="text-[13px] text-slate-500 italic px-2 py-4 text-center">
            No sections yet. Click "Add" to get started.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section) => {
                const sectionItems = items.filter((it) => it.section_id === section.id)
                return (
                  <SortableSection
                    key={section.id}
                    section={section}
                    items={sectionItems}
                    isSelected={section.id === selectedSectionId}
                    onSelect={onSelect}
                    onDelete={onDeleteSection}
                  />
                )
              })}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
