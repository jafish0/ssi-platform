// /gains-demo/zone1 — Zone 1 "The Dark Abyss" walkable zone (Draft 83): the
// opening of the game, built on the same GainsZonePage template as Zones
// 3/4, plus the template's new `introPlate` phase (the arrival plate) from
// its own config.

import GainsZonePage from './GainsZonePage.jsx'
import { ZONES } from '../components/gains/zone/zones.js'

export default function GainsZone1Page() {
  return <GainsZonePage zone={ZONES.zone1} />
}
