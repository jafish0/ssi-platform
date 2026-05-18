import { useState } from 'react'
import { Download } from 'lucide-react'
import { PrimaryButton } from '../components/items/shared.jsx'
import { downloadSvgStringAsPng } from '../lib/imageDownload.js'

// "Who I Am" poem — 10-line structure per Ginny's revision
// (`Poem structure.png` in repo root). 8 kid-filled lines, lines 6 and 10
// auto-mirror whatever the kid wrote for line 1. Single screen, no
// multi-page flow. Worked example shown above the inputs so the kid sees
// what a finished poem looks like before writing.
//
// Attribution to a named poet was intentionally removed per Ginny's note:
// "Remove this label — this isn't the Lyons format." If a credit is
// wanted later, "Inspired by traditional 'I am' poems" is fine.

const LINES = [
  { id: 'characteristics', n: 1, starter: 'I am',           hint: 'two special characteristics you have' },
  { id: 'from',            n: 2, starter: 'I am from',      hint: 'a place, people, or way of life' },
  { id: 'fear',            n: 3, starter: 'I fear',         hint: 'something you are afraid of' },
  { id: 'suffer_when',     n: 4, starter: 'I suffer when',  hint: 'an event that makes you sad or angry' },
  { id: 'want',            n: 5, starter: 'I want',         hint: 'an actual desire' },
  // line 6 auto-mirrors line 1 — no kid input
  { id: 'believe',         n: 7, starter: 'I believe',      hint: 'something you believe in' },
  { id: 'dream',           n: 8, starter: 'I dream',        hint: 'something you actually dream about' },
  { id: 'going',           n: 9, starter: 'I am going',     hint: 'where you hope to be' },
  // line 10 auto-mirrors line 1 — no kid input
]

// Note: a worked example block used to live here. It was removed
// 2026-05-12 per Draft 10 — feedback was that an example was nudging
// kids toward mimicry. The activity now opens directly with the input
// form.

function buildPoemText(vals) {
  const lineOne = (vals.characteristics || '').trim()
  const out = []
  for (const l of LINES) {
    const v = (vals[l.id] || '').trim()
    if (v) out.push(`${l.starter} ${v}`)
    // Insert the mirrored line 6 after line 5
    if (l.n === 5 && lineOne) out.push(`I am ${lineOne}`)
  }
  // Closing line 10 mirror
  if (lineOne) out.push(`I am ${lineOne}`)
  return out.join('\n')
}

export default function WhoIAmPoem({ onSave = console.log }) {
  const [vals, setVals] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  function update(id, v) {
    setVals((prev) => ({ ...prev, [id]: v }))
  }

  // Require line 1 (since lines 6/10 mirror it, leaving it blank would
  // produce a poem with three missing lines). Everything else is optional
  // so the kid isn't punished for having one prompt they can't answer.
  const canSave = (vals.characteristics || '').trim().length > 0

  async function handleSave() {
    if (!canSave) return
    setSubmitting(true)
    try {
      await onSave({
        activity: 'who_i_am_poem',
        characteristics: (vals.characteristics || '').trim(),
        from: (vals.from || '').trim(),
        fear: (vals.fear || '').trim(),
        suffer_when: (vals.suffer_when || '').trim(),
        want: (vals.want || '').trim(),
        believe: (vals.believe || '').trim(),
        dream: (vals.dream || '').trim(),
        going: (vals.going || '').trim(),
        saved_at: new Date().toISOString(),
      })
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    const poem = buildPoemText(vals)
    return <PoemKeepsake poem={poem} />
  }

  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-1">Who I Am</h2>
      <p className="text-[14px] text-slate-500 mb-4">
        A short poem about you. Fill in the lines and we&apos;ll put it together.
      </p>

      <div className="space-y-4">
        {LINES.map((l) => (
          <div key={l.id}>
            <label className="block text-[14px] font-medium text-slate-700 mb-2">
              <span className="text-slate-400 mr-2">{l.n}.</span>
              {l.starter}
              {l.id === 'characteristics' && <span className="text-rose-400 ml-1">*</span>}
              <span className="ml-2 text-slate-500 italic font-normal">— {l.hint}</span>
            </label>
            <input
              type="text"
              value={vals[l.id] || ''}
              onChange={(e) => update(l.id, e.target.value)}
              maxLength={120}
              className="w-full text-[16px] px-4 py-3 min-h-[52px] bg-amber-50 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-400 focus:bg-white"
            />
            {/* After line 5 and line 9, show the auto-mirrored line as a
                read-only preview so the kid sees the structure. */}
            {l.n === 5 && (
              <MirroredLine n={6} value={vals.characteristics} />
            )}
            {l.n === 9 && (
              <MirroredLine n={10} value={vals.characteristics} />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <PrimaryButton onClick={handleSave} disabled={!canSave || submitting}>
          {submitting ? 'Saving…' : 'See your poem'}
        </PrimaryButton>
      </div>
    </div>
  )
}

function MirroredLine({ n, value }) {
  const text = (value || '').trim()
  return (
    <div className="mt-3 ml-6 pl-3 border-l-2 border-amber-200">
      <p className="text-[12px] text-slate-500 mb-1">
        Line {n} <span className="italic">— same as line 1</span>
      </p>
      <p className="text-[15px] text-slate-700 font-serif italic">
        {text ? `I am ${text}` : <span className="text-slate-400 not-italic">(fills in once you write line 1)</span>}
      </p>
    </div>
  )
}

// ---------- Keepsake screen + downloadable SVG ----------

function PoemKeepsake({ poem }) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(null)

  async function handleDownload() {
    setError(null)
    setDownloading(true)
    try {
      const stamp = new Date().toISOString().slice(0, 10)
      const { svg, width, height } = buildPoemKeepsakeSvg(poem)
      await downloadSvgStringAsPng(svg, width, height, `my-poem-${stamp}.png`)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not save the image.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-2 text-center">Who I Am</h2>
      <p className="text-[14px] text-slate-500 text-center mb-5">It&apos;s yours to keep.</p>
      <div className="bg-amber-50 rounded-3xl border-2 border-amber-200 shadow-card p-8 text-center">
        <div className="text-[17px] leading-loose text-slate-800 whitespace-pre-wrap font-serif italic">
          {poem || '—'}
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 mt-5">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || !poem}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold rounded-full px-5 py-2 min-h-[44px] text-[14px]"
        >
          <Download size={14} strokeWidth={2} />
          {downloading ? 'Saving image…' : 'Save as image'}
        </button>
        {error && (
          <p role="alert" className="text-[12px] text-rose-600">{error}</p>
        )}
      </div>
    </div>
  )
}

// Build a self-contained SVG poem keepsake — visually matches the
// on-screen amber card. Returns { svg, width, height }. Each non-empty
// poem line gets its own <text> at fixed vertical spacing; no wrapping
// is attempted because the activity caps inputs at 120 chars and the
// natural lines are short.
function buildPoemKeepsakeSvg(poem) {
  const escapeXml = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  const lines = String(poem || '').split('\n').map((l) => l.trim()).filter(Boolean)
  const lineHeight = 30
  const paddingY = 60
  const paddingX = 40
  const width = 600
  const height = Math.max(360, paddingY * 2 + lines.length * lineHeight + 60)
  const cx = width / 2

  const titleY = 50
  const linesStartY = titleY + 50

  const lineEls = lines
    .map((l, i) => {
      const y = linesStartY + i * lineHeight
      return `<text x="${cx}" y="${y}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="20" fill="#1F2937">${escapeXml(l)}</text>`
    })
    .join('\n  ')

  // Small footer credit — useful when the kid prints this out so it's
  // obvious where it came from.
  const stamp = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  const footerY = height - 30

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="28" ry="28" fill="#FEF7E5" stroke="#F4D78F" stroke-width="3"/>
  <text x="${cx}" y="${titleY}" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="700" fill="#92400E" letter-spacing="0.18em">WHO I AM</text>
  ${lineEls}
  <text x="${cx}" y="${footerY}" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="10" fill="#A8773D">SSI Platform · ${escapeXml(stamp)}</text>
</svg>`

  return { svg, width, height }
}
