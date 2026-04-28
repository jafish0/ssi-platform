import PsychometricScale from '../components/items/PsychometricScale.jsx'
import VideoPlayer from '../components/items/VideoPlayer.jsx'
import TextPrompt from '../components/items/TextPrompt.jsx'
import FreeText from '../components/items/FreeText.jsx'
import StructuredActivity from '../components/items/StructuredActivity.jsx'
import GuidedCreative from '../components/items/GuidedCreative.jsx'
import Choice from '../components/items/Choice.jsx'
import PageBreak from '../components/items/PageBreak.jsx'
import CustomActivity from '../components/items/CustomActivity.jsx'

const RENDERERS = {
  psychometric_scale: PsychometricScale,
  video: VideoPlayer,
  text_prompt: TextPrompt,
  free_text: FreeText,
  structured_activity: StructuredActivity,
  guided_creative: GuidedCreative,
  choice: Choice,
  page_break: PageBreak,
  custom_activity: CustomActivity,
}

export default function ItemRenderer({
  item,
  onSave,
  sessionData,
  resolveToken,
  existingResponse,
}) {
  if (!item) return null
  const Component = RENDERERS[item.type]
  if (!Component) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-[14px] text-rose-700">
        Unsupported item type: <span className="font-mono">{item.type}</span>
      </div>
    )
  }
  return (
    <Component
      content={item.content_json}
      onSave={onSave}
      sessionData={sessionData}
      resolveToken={resolveToken}
      existingResponse={existingResponse}
    />
  )
}
