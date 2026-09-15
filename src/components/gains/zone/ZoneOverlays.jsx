// Ambient overlay layers for the walkable zone (GAINS Draft 68 Phase C,
// genericized Draft 80).
//
// Five Claude Design SVG layers per zone plus their shared motion.css, in
// exactly the Mindfulness `_ov` format: each is a full-frame SVG with
// viewBox 0 0 1080 1920 that sits over the plate. They render as DOM layers
// ABOVE the Phaser canvas (pointer-events: none), each with the blend mode
// the set was designed for (screen for light, normal for things like sway).
// motion.css already falls back to static under prefers-reduced-motion.
// Every file is optional: a layer that fails to fetch is simply skipped, so
// a set can land file by file. `layers` is the zone's own set (filenames +
// blend modes differ per plate); defaults to Zone 4's Bright Reaches set so
// existing callers are unaffected.
import { useEffect, useState } from 'react'

const DEFAULT_LAYERS = [
  { key: 'clouds', file: 'layer-clouds.svg', blend: 'screen' },
  { key: 'motes', file: 'layer-motes.svg', blend: 'screen' },
  { key: 'sway', file: 'layer-sway.svg', blend: 'normal' },
  { key: 'beacon', file: 'layer-beacon.svg', blend: 'screen' },
  { key: 'pondGlint', file: 'layer-pond-glint.svg', blend: 'screen' },
]

const CSS = `
.z4-ov { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.z4-ov svg { position: absolute; inset: 0; width: 100% !important; height: 100% !important; display: block; }
`

function fetchText(url) {
  return fetch(url).then((r) => (r.ok ? r.text() : null)).catch(() => null)
}

// Force the same object-cover behavior as the plate so the layers stay
// registered against it whatever the frame's exact size.
function prepSvg(svg) {
  return svg.replace(/preserveAspectRatio="[^"]*"/, '').replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ')
}

export default function ZoneOverlays({ base, sub, layers: layerSet = DEFAULT_LAYERS, visible = true }) {
  const [layers, setLayers] = useState(null) // [{ key, blend, svg }]
  const [motion, setMotion] = useState('')
  // Draft 83: Zone 1 keeps its two plates' overlay sets in their own
  // subfolders (ov/plate1/, ov/plate2/) rather than one flat ov/ -- `sub`
  // is that subfolder name, undefined for every other zone (flat ov/).
  const dir = sub ? `${base}/ov/${sub}` : `${base}/ov`

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchText(`${dir}/motion.css`), ...layerSet.map((l) => fetchText(`${dir}/${l.file}`))]).then(([css, ...svgs]) => {
      if (cancelled) return
      setMotion(css || '')
      setLayers(layerSet.map((l, i) => (svgs[i] ? { ...l, svg: prepSvg(svgs[i]) } : null)).filter(Boolean))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, layerSet])

  if (!layers || !layers.length) return null
  return (
    <div className="absolute inset-0" style={{ zIndex: 5, pointerEvents: 'none', opacity: visible ? 1 : 0, transition: 'opacity var(--dur-slow) var(--ease-soft)' }} aria-hidden="true">
      <style>{CSS}</style>
      {motion && <style>{motion}</style>}
      {layers.map((l) => (
        <div key={l.key} className="z4-ov" data-layer={l.key} style={{ mixBlendMode: l.blend }} dangerouslySetInnerHTML={{ __html: l.svg }} />
      ))}
    </div>
  )
}
