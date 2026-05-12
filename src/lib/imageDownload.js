// Client-side SVG → PNG download. Used by activities that produce a
// visual artifact (the trampoline-net Safety Net visual, the Who-I-Am
// poem keepsake) so the participant can save a copy.
//
// Why not html2canvas? It's a transitive dep via jspdf so it'd work,
// but for our inline-SVG visuals we can just rasterize the SVG
// directly — deterministic across machines, no extra runtime.
//
// Gotchas handled here:
//   1. <image href> references to bundled asset URLs are inlined as
//      data URLs before serialization. Cross-origin or "tainted canvas"
//      problems would otherwise prevent the canvas.toBlob() step.
//   2. Cloned SVG nodes sometimes lose the xmlns attribute, which
//      breaks the new Image() load. We force it on the clone.
//   3. Transparent areas of the SVG get a cream-paper background on
//      the canvas so the downloaded PNG never looks "broken" against
//      a white viewer.

const PAPER_BG = '#FFFDF7'

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}

// Walk the SVG once, replacing every <image href="..."> reference with
// a data URL fetched from that href. Necessary so the off-DOM <img>
// load doesn't fail security checks and the canvas doesn't get tainted.
async function inlineImageHrefs(svgEl) {
  const images = svgEl.querySelectorAll('image')
  for (const img of Array.from(images)) {
    const href = img.getAttribute('href') || img.getAttribute('xlink:href')
    if (!href || href.startsWith('data:')) continue
    try {
      const res = await fetch(href)
      if (!res.ok) continue
      const blob = await res.blob()
      const dataUrl = await blobToDataUrl(blob)
      img.setAttribute('href', dataUrl)
      img.removeAttribute('xlink:href')
    } catch (err) {
      // Best-effort: if inlining fails, the image just won't appear in
      // the PNG. Better than crashing the whole download.
      console.warn('imageDownload: failed to inline', href, err)
    }
  }
}

function parseViewBox(svgEl) {
  const vb = svgEl.getAttribute('viewBox')
  if (vb) {
    const parts = vb.split(/[ ,]+/).map(Number)
    if (parts.length === 4) return { width: parts[2], height: parts[3] }
  }
  // Fallback to explicit width/height attributes.
  const w = parseFloat(svgEl.getAttribute('width')) || 400
  const h = parseFloat(svgEl.getAttribute('height')) || 400
  return { width: w, height: h }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Defer revoke so the browser has time to start the download — some
  // browsers race the click + revoke and the download cancels.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function rasterizeAndDownload(svgString, width, height, filename, opts = {}) {
  const scale = opts.scale || 2 // 2x for retina-quality keepsakes
  const background = opts.background ?? PAPER_BG

  const svgBlob = new Blob(
    ['<?xml version="1.0" encoding="UTF-8"?>\n', svgString],
    { type: 'image/svg+xml;charset=utf-8' },
  )
  const svgUrl = URL.createObjectURL(svgBlob)

  try {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject(new Error('Failed to load SVG into Image'))
      img.src = svgUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    const ctx = canvas.getContext('2d')
    if (background) {
      ctx.fillStyle = background
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('canvas.toBlob returned null'))
        triggerDownload(blob, filename)
        resolve()
      }, 'image/png')
    })
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}

// Rasterize a live SVG DOM element to PNG and trigger a download.
// Inlines any <image href> references first so the off-DOM render
// doesn't fail.
export async function downloadSvgElementAsPng(svgEl, filename, opts = {}) {
  if (!svgEl) throw new Error('downloadSvgElementAsPng: svgEl is required')
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  await inlineImageHrefs(clone)
  const { width, height } = parseViewBox(svgEl)
  const svgString = new XMLSerializer().serializeToString(clone)
  await rasterizeAndDownload(svgString, width, height, filename, opts)
}

// Rasterize a pre-built SVG string to PNG. Useful for activities that
// don't have an on-screen SVG to grab — they build one at download time.
export async function downloadSvgStringAsPng(svgString, width, height, filename, opts = {}) {
  await rasterizeAndDownload(svgString, width, height, filename, opts)
}
