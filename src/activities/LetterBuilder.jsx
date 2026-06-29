import { useState } from 'react'
import { Download } from 'lucide-react'
import { PrimaryButton } from '../components/items/shared.jsx'
import { downloadSvgStringAsPng } from '../lib/imageDownload.js'

// "Letter to Another Youth" — single-screen free-write activity.
//
// Rebuilt 2026-05-11 from a 6-section structured letter to a single
// textarea per Stephanie's 2026-05-11 feedback ("the letter has too many
// steps and would be confusing for a kid… meaningless when the kid was
// just borrowing other people's words"). Removed: click-to-add prompt
// chips, cross-activity pull-forward (Getting Unstuck, Allies/Safety
// Net), the keepsake-view step. The letter is freestanding now — comes
// entirely from the kid.
//
// Save payload is now { activity, letter, saved_at } — breaking change to
// the schema from the previous structured-per-section format. Acceptable
// because the platform is demo-only.

// Stephanie's reframe (2026-05-15 → shipped 2026-05-13 batch): the
// recipient is anchored as another teen who feels like they don't
// belong (matching the emotional state of the kid being asked to
// write), rather than the vague "starting where you are." Direct
// second-person framing ("you would want to say") so the kid composes
// in their own voice rather than performing the task of letter-writing.
const PROMPT =
  "What you would want to say to another teen who feels like they don't belong."

// Short generic example shown OUTSIDE the textarea (greyed/italic) so the
// kid sees the kind of letter that's welcome without having a model to
// copy. One sentence, deliberately mundane and in-voice.
const EXAMPLE =
  '"Hey — I know you don\'t know me, but I wanted to tell you what helped me when nothing felt steady…"'

export default function LetterBuilder({ onSave = console.log }) {
  const [letter, setLetter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const trimmed = letter.trim()
  const canSave = trimmed.length > 0

  async function handleSave() {
    if (!canSave) return
    setSubmitting(true)
    try {
      await onSave({
        activity: 'letter_builder',
        letter: trimmed,
        saved_at: new Date().toISOString(),
      })
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return <LetterKeepsake letter={trimmed} />
  }

  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2">A letter to another teen</h2>
      <p className="text-[16px] leading-relaxed text-slate-700 mb-2">{PROMPT}</p>
      {/* Two optional scaffolding prompts (Draft 26 Part B) — seeds for
          kids who freeze on the blank textarea, not required reading. */}
      <ul className="text-[14px] text-slate-500 italic mb-2 list-disc pl-5 space-y-0.5">
        <li>What is one skill you would recommend?</li>
        <li>What is one helpful thought you could share?</li>
      </ul>
      <p className="text-[13px] text-slate-500 italic mb-5">
        Example: {EXAMPLE}
      </p>

      <textarea
        rows={12}
        value={letter}
        onChange={(e) => setLetter(e.target.value)}
        placeholder="Write as much or as little as you want. It can sound however you want."
        maxLength={5000}
        className="w-full text-[16px] leading-relaxed px-4 py-3 bg-ctac-teal-50 border border-ctac-teal-200 rounded-2xl focus:outline-none focus:border-ctac-teal-400 focus:bg-white"
      />
      <div className="text-[12px] text-slate-400 mt-1 text-right">
        {letter.length} / 5000
      </div>

      <div className="flex justify-end mt-6">
        <PrimaryButton onClick={handleSave} disabled={!canSave || submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </div>
    </div>
  )
}

// ---------- Done state: letter keepsake + Save-as-image ----------
//
// Shows the kid's letter back to them so they can read / print it, plus a
// Save-as-image button (rasterizes a self-contained SVG keepsake, same
// downloadSvgStringAsPng path as Who I Am Poem). The closing copy
// (Holly's 2026-06-18 ask) references "save or print," so the affordance
// is visible here.
function LetterKeepsake({ letter }) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)

  async function handleDownload() {
    setError(null)
    setDownloading(true)
    try {
      const stamp = new Date().toISOString().slice(0, 10)
      const { svg, width, height } = buildLetterKeepsakeSvg(letter)
      await downloadSvgStringAsPng(svg, width, height, `my-letter-${stamp}.png`)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not save the image.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2 text-center">Saved</h2>
      <p className="text-[15px] text-slate-700 text-center mb-5 max-w-[520px] mx-auto">
        You can save or print this letter and look back on it whenever you
        need a reminder or some encouragement.
      </p>
      <div className="bg-ctac-teal-50 rounded-3xl border-2 border-ctac-teal-200 shadow-card p-8">
        <div className="text-[16px] leading-relaxed text-slate-800 whitespace-pre-wrap">
          {letter || '—'}
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 mt-5">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || !letter}
          className="inline-flex items-center gap-2 bg-ctac-teal-500 hover:bg-ctac-teal-600 disabled:opacity-50 text-white font-semibold rounded-full px-5 py-2 min-h-[44px] text-[14px]"
        >
          <Download size={14} strokeWidth={2} />
          {downloading ? 'Saving image…' : 'Save as image'}
        </button>
        {error && <p role="alert" className="text-[12px] text-rose-600">{error}</p>}
      </div>
    </div>
  )
}

// Build a self-contained SVG keepsake of the letter — cream/amber card
// with a title + footer credit, matching the on-screen card and the Who
// I Am Poem keepsake. Long prose is word-wrapped to a fixed width and the
// canvas grows to fit; blank lines in the source are preserved as gaps.
function buildLetterKeepsakeSvg(letter) {
  const escapeXml = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  const WIDTH = 620
  const PAD_X = 48
  const LINE_H = 26
  const WRAP = 64 // chars per line at 17px in the available width

  // Wrap each source paragraph; keep blank lines as spacers.
  const wrapped = []
  for (const para of String(letter || '').split('\n')) {
    if (!para.trim()) {
      wrapped.push('')
      continue
    }
    let cur = ''
    for (const word of para.split(/\s+/)) {
      const cand = cur ? `${cur} ${word}` : word
      if (cand.length > WRAP && cur) {
        wrapped.push(cur)
        cur = word
      } else {
        cur = cand
      }
    }
    if (cur) wrapped.push(cur)
  }

  const titleY = 56
  const bodyStartY = titleY + 44
  const height = Math.max(320, bodyStartY + wrapped.length * LINE_H + 60)
  const cx = WIDTH / 2

  const lineEls = wrapped
    .map((line, i) => {
      if (!line) return ''
      const y = bodyStartY + i * LINE_H
      return `<text x="${PAD_X}" y="${y}" font-family="Georgia, 'Times New Roman', serif" font-size="17" fill="#1F2937">${escapeXml(line)}</text>`
    })
    .filter(Boolean)
    .join('\n  ')

  const stamp = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  const footerY = height - 28

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${height}" width="${WIDTH}" height="${height}">
  <rect x="6" y="6" width="${WIDTH - 12}" height="${height - 12}" rx="28" ry="28" fill="#FEF7E5" stroke="#F4D78F" stroke-width="3"/>
  <text x="${cx}" y="${titleY}" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="700" fill="#92400E" letter-spacing="0.16em">A LETTER TO ANOTHER TEEN</text>
  ${lineEls}
  <text x="${cx}" y="${footerY}" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="10" fill="#A8773D">SSI Platform · ${escapeXml(stamp)}</text>
</svg>`

  return { svg, width: WIDTH, height }
}
