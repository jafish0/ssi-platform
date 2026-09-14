// /gains-demo/zone3 — Zone 3 "The Mistfields" walkable zone (Draft 80): the
// second instance of the walkable-zone template, built entirely from its
// `zone/zones.js` config on the same `GainsZonePage`.

import GainsZonePage from './GainsZonePage.jsx'
import { ZONES } from '../components/gains/zone/zones.js'

export default function GainsZone3Page() {
  return <GainsZonePage zone={ZONES.zone3} />
}
