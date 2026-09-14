// /gains-demo/zone4 — Zone 4 "The Bright Reaches" walkable zone. Draft 68
// built it; Draft 80 moved its content into `zone/zones.js` and generalized
// the page itself into `GainsZonePage` (this file is now just the route's
// config pick, unchanged in behavior).

import GainsZonePage from './GainsZonePage.jsx'
import { ZONES } from '../components/gains/zone/zones.js'

export default function GainsZone4Page() {
  return <GainsZonePage zone={ZONES.zone4} />
}
