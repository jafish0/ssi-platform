// Tile registry for the Allies / Safety Net activity. Maps tile id →
// display name → SVG icon URL. Vite resolves the SVG imports below as
// asset URLs at build time, so each `icon` is a string we can drop into
// an <img src> attribute.
//
// 15 entries — the locked set from the 2026-05-11 review meeting.
// The team is discussing splits (e.g. "Other family" → aunts vs. uncles
// vs. cousins) separately; do not pre-empt those changes here.

import fosterIcon       from '../assets/allies/foster.svg'
import bioIcon          from '../assets/allies/bio.svg'
import siblingIcon      from '../assets/allies/sibling.svg'
import grandparentIcon  from '../assets/allies/grandparent.svg'
import otherfamIcon     from '../assets/allies/otherfam.svg'
import counselorIcon    from '../assets/allies/counselor.svg'
import teacherIcon      from '../assets/allies/teacher.svg'
import coachIcon        from '../assets/allies/coach.svg'
import babysitterIcon   from '../assets/allies/babysitter.svg'
import neighborIcon     from '../assets/allies/neighbor.svg'
import friendIcon       from '../assets/allies/friend.svg'
import therapistIcon    from '../assets/allies/therapist.svg'
import caseworkerIcon   from '../assets/allies/caseworker.svg'
import other1Icon       from '../assets/allies/other1.svg'
import other2Icon       from '../assets/allies/other2.svg'

export const ALLY_TILES = [
  { id: 'foster',      name: 'Foster Parent',                       icon: fosterIcon,      custom: false },
  { id: 'bio',         name: 'Biological Parent',                   icon: bioIcon,         custom: false },
  { id: 'sibling',     name: 'Sibling',                             icon: siblingIcon,     custom: false },
  { id: 'grandparent', name: 'Grandparent',                         icon: grandparentIcon, custom: false },
  { id: 'otherfam',    name: 'Other family (aunts, uncles, cousins)', icon: otherfamIcon,  custom: false },
  { id: 'counselor',   name: 'School Counselor',                    icon: counselorIcon,   custom: false },
  { id: 'teacher',     name: 'Teacher',                             icon: teacherIcon,     custom: false },
  { id: 'coach',       name: 'Coach',                               icon: coachIcon,       custom: false },
  { id: 'babysitter',  name: 'Babysitter',                          icon: babysitterIcon,  custom: false },
  { id: 'neighbor',    name: 'Neighbor',                            icon: neighborIcon,    custom: false },
  { id: 'friend',      name: 'Friend',                              icon: friendIcon,      custom: false },
  { id: 'therapist',   name: 'Therapist',                           icon: therapistIcon,   custom: false },
  { id: 'caseworker',  name: 'Caseworker / Social Worker',          icon: caseworkerIcon,  custom: false },
  { id: 'other1',      name: 'Other',                               icon: other1Icon,      custom: true  },
  { id: 'other2',      name: 'Other',                               icon: other2Icon,      custom: true  },
]

export const SUPPORT_TYPES = [
  {
    id: 'practical',
    label: 'Practical',
    definition:
      'People who help you solve problems, teach you things, or make sure you have what you need.',
  },
  {
    id: 'emotional',
    label: 'Emotional',
    definition:
      'People who help you feel good about yourself, listen to you, or help you cope with hard feelings.',
  },
  {
    id: 'social',
    label: 'Social',
    definition:
      'People you can be yourself around, or who help you feel less alone.',
  },
]
