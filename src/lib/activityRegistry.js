// Registry of named React components available to `custom_activity` items.
// Map from component_name (string, used in content_json) → React component.
import GettingUnstuck from '../activities/GettingUnstuck.jsx'
import AlliesSafetyNet from '../activities/AlliesSafetyNet.jsx'
import SelfReflection from '../activities/SelfReflection.jsx'
import BelongingSkillsSort from '../activities/BelongingSkillsSort.jsx'
import WhoIAmPoem from '../activities/WhoIAmPoem.jsx'
import LetterBuilder from '../activities/LetterBuilder.jsx'

export const ACTIVITY_REGISTRY = {
  GettingUnstuck,
  AlliesSafetyNet,
  SelfReflection,
  BelongingSkillsSort,
  WhoIAmPoem,
  LetterBuilder,
}
