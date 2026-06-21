// ── WeaponEditor Component ─────────────────────────────────
// A reusable weapon editor for creating and editing D&D 5e weapons

export { WeaponEditor } from './WeaponEditor';
export {
  type WeaponEditorProps,
  type WeaponFormData,
  WEAPON_CATEGORIES,
  WEAPON_BASE_PROPERTIES,
  WEAPON_MASTERY_PROPERTIES,
  DAMAGE_TYPES,
  ABILITY_NAMES,
  DEFAULT_WEAPON_FORM_DATA,
  weaponToFormData,
  formDataToWeapon,
} from './WeaponEditor.types';
