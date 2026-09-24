// The lantern-parts tray (GAINS Draft 94, Zone 2, item 1e): four empty
// slots at the top of the frame, filling left to right in collection
// order. Persists across Zone 2's two plates (station collection only
// happens on plate 2, but the tray stays mounted the same way the gear HUD
// does). Draft 95 empties it again once the parts fly into the built
// Focusing Lens.

const SLOT = 34

export default function PartsTray({ stations, filled }) {
  return (
    <div className="absolute z-10 flex items-center gap-1.5" style={{ top: 12, right: 12, pointerEvents: 'none' }} aria-label="Lantern parts collected">
      {stations.map((p, i) => {
        const has = i < filled
        return (
          <div
            key={p.id}
            title={p.partLabel}
            aria-label={p.partLabel + (has ? '' : ' (not yet found)')}
            style={{
              width: SLOT,
              height: SLOT,
              borderRadius: 'var(--radius-pill)',
              display: 'grid',
              placeItems: 'center',
              background: has ? 'rgba(253,230,138,.18)' : 'var(--surface-sheet)',
              border: `1px ${has ? 'solid' : 'dashed'} ${has ? 'var(--border-warm)' : 'var(--border-soft)'}`,
              boxShadow: has ? 'var(--glow-sm)' : 'none',
              opacity: has ? 1 : 0.75,
              transition: 'background var(--dur-slow) var(--ease-soft), box-shadow var(--dur-slow) var(--ease-soft)',
              overflow: 'hidden',
            }}
          >
            {has && <img src={p.partSrc} alt="" style={{ width: SLOT - 8, height: SLOT - 8, objectFit: 'contain' }} />}
          </div>
        )
      })}
    </div>
  )
}
