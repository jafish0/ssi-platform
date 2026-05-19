// Tile registry for the Allies / Safety Net activity. Maps tile id →
// display name → SVG icon URL. Vite resolves the SVG imports below as
// asset URLs at build time, so each `icon` is a string we can drop into
// an <img src> attribute.
//
// 22 entries (v5.0, 2026-05-19) — replaced the original 15-tile set
// from commit `d515d0e`. The 2026-05-19 zip included a 23rd tile
// (`sneaky-link.svg`) that we deliberately do NOT register here per
// Josh's 2026-05-19 call. The file is also not present in the repo
// (deleted from `src/assets/allies/` after extraction); this comment
// is the source of truth on why.
//
// Splits in v5.0 vs the 15-tile v4.x set:
//   - foster (single) → foster-mom + foster-dad
//   - bio (single) → bio-mom + bio-dad
//   - grandparent (single) → grandmother + grandfather
//   - friend (single) → friend + best-friend + friends (group)
//   - boyfriend, girlfriend — new
//   - sibling, otherfam, counselor, teacher, coach, babysitter,
//     neighbor, therapist, caseworker, other1, other2 — unchanged from v4

import fosterMomIcon    from '../assets/allies/foster-mom.svg'
import fosterDadIcon    from '../assets/allies/foster-dad.svg'
import bioMomIcon       from '../assets/allies/bio-mom.svg'
import bioDadIcon       from '../assets/allies/bio-dad.svg'
import siblingIcon      from '../assets/allies/sibling.svg'
import grandmotherIcon  from '../assets/allies/grandmother.svg'
import grandfatherIcon  from '../assets/allies/grandfather.svg'
import otherfamIcon     from '../assets/allies/otherfam.svg'
import counselorIcon    from '../assets/allies/counselor.svg'
import teacherIcon      from '../assets/allies/teacher.svg'
import coachIcon        from '../assets/allies/coach.svg'
import babysitterIcon   from '../assets/allies/babysitter.svg'
import neighborIcon     from '../assets/allies/neighbor.svg'
import friendIcon       from '../assets/allies/friend.svg'
import bestFriendIcon   from '../assets/allies/best-friend.svg'
import friendsIcon      from '../assets/allies/friends.svg'
import boyfriendIcon    from '../assets/allies/boyfriend.svg'
import girlfriendIcon   from '../assets/allies/girlfriend.svg'
import therapistIcon    from '../assets/allies/therapist.svg'
import caseworkerIcon   from '../assets/allies/caseworker.svg'
import other1Icon       from '../assets/allies/other1.svg'
import other2Icon       from '../assets/allies/other2.svg'

export const ALLY_TILES = [
  { id: 'foster-mom',  name: 'Foster Mom',                          icon: fosterMomIcon,   custom: false },
  { id: 'foster-dad',  name: 'Foster Dad',                          icon: fosterDadIcon,   custom: false },
  { id: 'bio-mom',     name: 'Biological Mom',                      icon: bioMomIcon,      custom: false },
  { id: 'bio-dad',     name: 'Biological Dad',                      icon: bioDadIcon,      custom: false },
  { id: 'sibling',     name: 'Sibling',                             icon: siblingIcon,     custom: false },
  { id: 'grandmother', name: 'Grandmother',                         icon: grandmotherIcon, custom: false },
  { id: 'grandfather', name: 'Grandfather',                         icon: grandfatherIcon, custom: false },
  { id: 'otherfam',    name: 'Other Family',                        icon: otherfamIcon,    custom: false },
  { id: 'counselor',   name: 'School Counselor',                    icon: counselorIcon,   custom: false },
  { id: 'teacher',     name: 'Teacher',                             icon: teacherIcon,     custom: false },
  { id: 'coach',       name: 'Coach',                               icon: coachIcon,       custom: false },
  { id: 'babysitter',  name: 'Babysitter',                          icon: babysitterIcon,  custom: false },
  { id: 'neighbor',    name: 'Neighbor',                            icon: neighborIcon,    custom: false },
  { id: 'friend',      name: 'Friend',                              icon: friendIcon,      custom: false },
  { id: 'best-friend', name: 'Best Friend',                         icon: bestFriendIcon,  custom: false },
  { id: 'friends',     name: 'Friends',                             icon: friendsIcon,     custom: false },
  { id: 'boyfriend',   name: 'Boyfriend',                           icon: boyfriendIcon,   custom: false },
  { id: 'girlfriend',  name: 'Girlfriend',                          icon: girlfriendIcon,  custom: false },
  { id: 'therapist',   name: 'Therapist',                           icon: therapistIcon,   custom: false },
  { id: 'caseworker',  name: 'Caseworker / Social Worker',          icon: caseworkerIcon,  custom: false },
  { id: 'other1',      name: 'Other',                               icon: other1Icon,      custom: true  },
  { id: 'other2',      name: 'Other',                               icon: other2Icon,      custom: true  },
]

// Support types — kept in sync with the trampoline-net visual and the
// activity flow. Color identity (added v5.0 per Holly) lives on the
// `tone` field; the activity component maps tone → Tailwind classes.
export const SUPPORT_TYPES = [
  {
    id: 'practical',
    label: 'Practical',
    definition:
      'The people who help you with things — rides, food, getting your homework done.',
    tone: 'amber',
  },
  {
    id: 'emotional',
    label: 'Emotional',
    definition:
      "The people you go to when you're upset or just need to talk.",
    tone: 'rose',
  },
  {
    id: 'social',
    label: 'Social',
    definition:
      'The people you have fun with — hanging out, playing games, going places.',
    tone: 'sky',
  },
]
