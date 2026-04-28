// Helpers for the Builder UI: slug generation, default content_json per
// item type, and order-index reordering helpers.

export function slugify(input) {
  return (input || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

// Random short id (used for option ids, scale item ids, etc.)
export function shortId(prefix = 'id') {
  const r = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${r}`
}

export const SECTION_TYPES = [
  { value: 'intro', label: 'Intro' },
  { value: 'psychometric', label: 'Psychometric' },
  { value: 'psychoeducation', label: 'Psychoeducation' },
  { value: 'activity', label: 'Activity' },
  { value: 'outro', label: 'Outro' },
  { value: 'custom', label: 'Custom' },
]

export const ITEM_TYPES = [
  { value: 'psychometric_scale', label: 'Psychometric scale' },
  { value: 'video', label: 'Video' },
  { value: 'text_prompt', label: 'Text prompt' },
  { value: 'free_text', label: 'Free text' },
  { value: 'structured_activity', label: 'Structured activity' },
  { value: 'guided_creative', label: 'Guided creative' },
  { value: 'choice', label: 'Choice' },
  { value: 'page_break', label: 'Page break' },
  { value: 'custom_activity', label: 'Custom activity' },
]

// Sensible defaults so each newly-created item is immediately renderable.
export function defaultContentForType(type) {
  switch (type) {
    case 'psychometric_scale':
      return {
        scale_name: 'Untitled scale',
        instructions: 'Rate how true each statement feels for you.',
        mode: 'research_only',
        format: 'likert',
        items: [
          { id: shortId('si'), text: 'New scale item', reverse_scored: false },
        ],
        anchors: {
          min_value: 0,
          max_value: 4,
          min_label: 'Not at all',
          max_label: 'Very much',
          show_midpoint_label: false,
          midpoint_label: '',
        },
        show_progress: true,
        randomize_order: false,
        display_one_at_a_time: false,
      }
    case 'video':
      return {
        vimeo_url: '',
        title: 'Untitled video',
        context_before: '',
        context_after: '',
        required_completion: false,
        completion_threshold: 0.85,
        autoplay: false,
        show_controls: true,
      }
    case 'text_prompt':
      return {
        heading: '',
        body: '',
        format: 'standard',
        show_continue_button: true,
        continue_label: 'Keep going →',
      }
    case 'free_text':
      return {
        prompt: 'Write a few sentences.',
        sentence_starter: '',
        placeholder: '',
        min_chars: 0,
        max_chars: 500,
        show_char_count: true,
        word_bank: [],
        word_bank_label: '',
        word_bank_mode: 'append',
        rows: 5,
      }
    case 'structured_activity':
      return {
        title: 'Untitled activity',
        instructions: '',
        fields: [],
        layout: 'single_column',
        completion_message: '',
      }
    case 'guided_creative':
      return {
        title: 'Untitled creative',
        artifact_type: 'poem',
        instructions: '',
        stanzas: [
          {
            id: shortId('st'),
            prompts: [
              {
                id: shortId('p'),
                starter: 'I am',
                hint: '',
                max_chars: 80,
                required: true,
              },
            ],
          },
        ],
        word_banks: { __global__: [] },
        artifact_framing: { header: '', footer: '' },
        completion_message: '',
      }
    case 'choice':
      return {
        prompt: 'Pick one.',
        options: [
          { id: shortId('opt'), text: 'Option A' },
          { id: shortId('opt'), text: 'Option B' },
        ],
        selection_type: 'single',
        max_selections: null,
        display_style: 'card_grid',
        show_none_option: false,
        randomize_order: false,
      }
    case 'page_break':
      return {
        heading: '',
        body: '',
        continue_label: 'Keep going →',
        show_progress: false,
        animation: 'fade',
      }
    case 'custom_activity':
      return {
        component_name: '',
        props: {},
      }
    default:
      return {}
  }
}

// Build the published snapshot from an ordered list of sections (each with items).
export function assembleSnapshot({ sections, items, publishedAt, publishedBy }) {
  const itemsBySection = {}
  for (const it of items) {
    if (!itemsBySection[it.section_id]) itemsBySection[it.section_id] = []
    itemsBySection[it.section_id].push(it)
  }
  for (const sid of Object.keys(itemsBySection)) {
    itemsBySection[sid].sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
    )
  }
  const orderedSections = [...sections].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
  )
  return {
    published_at: publishedAt,
    published_by: publishedBy,
    sections: orderedSections.map((s) => ({
      id: s.id,
      order_index: s.order_index,
      type: s.type,
      title: s.title,
      config_json: s.config_json || {},
      is_required: s.is_required !== false,
      items: (itemsBySection[s.id] || []).map((it) => ({
        id: it.id,
        order_index: it.order_index,
        type: it.type,
        content_json: it.content_json || {},
        token_key: it.token_key || null,
        is_required: it.is_required !== false,
      })),
    })),
  }
}
