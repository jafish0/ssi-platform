// GAINS Exposition — restyled to the Shadowmend design system (Draft 49,
// 2026-08-27). This is the "one starter screen" proof of concept: the rest
// of the GAINS demo stays on the existing amber/slate Tailwind look until
// we roll the Shadowmend look outward screen by screen.
//
// Copy is unowned here on purpose -- `line` is passed in from
// GainsDemoPage.jsx, where SPARK_INTRO_LINE already lives as the single
// verbatim source (Stephanie's Option-2 text, adopted 2026-08-13). This
// component only restyles the presentation; it doesn't fork the copy.
//
// Assets are the app's EXISTING GAINS art (public/long-light/art/), not the
// design system's own uploaded copies -- map-and-world.webp,
// narrator-spark.webp and traveler-stage1-hallow.webp already look like
// (and in the case of the map, are almost certainly the same file as) the
// design system's world/map-mount-hope.webp, characters/spark.webp and
// characters/traveler-1-dark-abyss.webp. Reusing what's already staged
// keeps this a styling-only change with no new binaries to mirror/cache-bust.

import { useState } from 'react'
import SceneFrame from './ds/SceneFrame.jsx'
import SparkDialogue from './ds/SparkDialogue.jsx'
import CharacterFigure from './ds/CharacterFigure.jsx'
import Button from './ds/Button.jsx'

const ART = '/long-light/art'

export default function ExpositionIntro({ line }) {
  const [begun, setBegun] = useState(false)

  return (
    <SceneFrame image={`${ART}/map-and-world.webp`} alt="" sky="beacon" veil="both">
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-12)' }}>
        <CharacterFigure src={`${ART}/traveler-stage1-hallow.webp`} stage="dark" size={128} alt="The Traveler, still in darkness" />
      </div>

      <div style={{ marginTop: 'auto', padding: 'var(--gutter-screen)', paddingBottom: 'var(--space-8)' }}>
        <SparkDialogue
          speaker="Spark"
          avatar={`${ART}/narrator-spark.webp`}
          text={line}
          actions={
            <>
              <Button variant="primary" size="lg" fullWidth disabled={begun} onClick={() => setBegun(true)}>
                {begun ? 'Ready for Zone 1' : 'Begin the climb'}
              </Button>
              {begun && (
                <p
                  style={{
                    fontSize: 'var(--text-small)',
                    lineHeight: 'var(--leading-normal)',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    animation: 'sm-bloom var(--dur-slow) var(--ease-bloom) both',
                  }}
                >
                  Nice. The Dark Abyss is waiting -- Zone 1 picks up from here.
                </p>
              )}
            </>
          }
        />
      </div>
    </SceneFrame>
  )
}
