// ── SpellEditor Component ─────────────────────────────────
// A reusable spell editor for creating and editing D&D 5e spells

export { SpellEditor } from './SpellEditor';
export {
  type SpellEditorProps,
  type SpellFormData,
  type SpellFormDamage,
  type SpellFormDamageEntry,
  type SpellFormHeal,
  type SpellFormCantripUpgrade,
  SPELL_SCHOOLS,
  CASTING_TIMES,
  SPELL_COMPONENTS,
  SPELL_LEVELS,
  ABILITY_NAMES,
  DEFAULT_SPELL_FORM_DATA,
  spellToFormData,
  formDataToSpell,
} from './SpellEditor.types';
