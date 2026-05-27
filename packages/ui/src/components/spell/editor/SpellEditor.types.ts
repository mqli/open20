import type { Spell } from 'open20-core';
import type { SpellLevel, SpellSchool, CastingTime, SpellComponent, AbilityName } from 'open20-core/types';
export { ABILITY_NAMES } from 'open20-core/types';

// ── 表单数据类型 ─────────────────────────────────────────
// 与 Spell 类型对应，但使用可变类型（mutable）以便表单编辑

export interface SpellFormData {
  id: string;
  name: string;
  level: SpellLevel;
  school: SpellSchool;
  castingTime: CastingTime;
  range: string;
  components: SpellComponent[];
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string[];
  cantripUpgrade?: SpellFormCantripUpgrade[];
  cantripUpgradeText?: string;
  usingAHigherLevelSpellSlot?: string[];
  damage?: SpellFormDamage;
  heal?: SpellFormHeal;
  save?: AbilityName;
  attack?: boolean;
  source: string;
  classes?: string[];
}

export interface SpellFormDamage {
  entries: SpellFormDamageEntry[];
  additional?: SpellFormDamageEntry[];
  perSlot?: SpellFormDamageEntry[];
}

export interface SpellFormDamageEntry {
  dice: string;
  type: string;
}

export interface SpellFormHeal {
  dice: string;
}

export interface SpellFormCantripUpgrade {
  atCharacterLevel: 5 | 11 | 17;
  damage?: SpellFormDamageEntry[];
}

// ── 组件 Props ─────────────────────────────────────────

export interface SpellEditorProps {
  /** 受控模式：当前法术数据 */
  value?: Partial<Spell>;
  /** 非受控模式：默认法术数据 */
  defaultValue?: Partial<Spell>;
  /** 表单值变化回调 */
  onChange?: (spell: Partial<Spell>) => void;
  /** 表单提交回调 */
  onSubmit?: (spell: Spell) => void;
  /** 取消按钮回调 */
  onCancel?: () => void;
  /** 是否显示实时预览 */
  showPreview?: boolean;
  /** 是否禁用所有输入 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
}

// ── 字段选项常量 ─────────────────────────────────────────

export const SPELL_SCHOOLS: SpellSchool[] = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

export const CASTING_TIMES: CastingTime[] = [
  'Action',
  'Bonus Action',
  'Reaction',
  'Minute',
  'Hour',
  'Special',
];

export const SPELL_COMPONENTS: SpellComponent[] = ['V', 'S', 'M'];

export const SPELL_LEVELS: SpellLevel[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const DND_CLASSES: string[] = [
  'Artificer',
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
];

export const DAMAGE_TYPES: string[] = [
  'Acid',
  'Bludgeoning',
  'Cold',
  'Fire',
  'Force',
  'Lightning',
  'Necrotic',
  'Piercing',
  'Poison',
  'Psychic',
  'Radiant',
  'Slashing',
  'Thunder',
];

// ── 默认值 ─────────────────────────────────────────

export const DEFAULT_SPELL_FORM_DATA: SpellFormData = {
  id: '',
  name: '',
  level: 0,
  school: 'Evocation',
  castingTime: 'Action',
  range: '60 feet',
  components: ['V', 'S'],
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: [''],
  source: 'Homebrew',
  classes: [],
};

// ── 工具函数 ─────────────────────────────────────────

/** 将 Partial<Spell> 转换为 SpellFormData */
export function spellToFormData(spell?: Partial<Spell>): SpellFormData {
  if (!spell) return { ...DEFAULT_SPELL_FORM_DATA };

  return {
    id: spell.id ?? DEFAULT_SPELL_FORM_DATA.id,
    name: spell.name ?? DEFAULT_SPELL_FORM_DATA.name,
    level: spell.level ?? DEFAULT_SPELL_FORM_DATA.level,
    school: spell.school ?? DEFAULT_SPELL_FORM_DATA.school,
    castingTime: spell.castingTime ?? DEFAULT_SPELL_FORM_DATA.castingTime,
    range: spell.range ?? DEFAULT_SPELL_FORM_DATA.range,
    components: [...(spell.components ?? DEFAULT_SPELL_FORM_DATA.components)],
    duration: spell.duration ?? DEFAULT_SPELL_FORM_DATA.duration,
    concentration: spell.concentration ?? DEFAULT_SPELL_FORM_DATA.concentration,
    ritual: spell.ritual ?? DEFAULT_SPELL_FORM_DATA.ritual,
    description: [...(spell.description ?? DEFAULT_SPELL_FORM_DATA.description)],
    cantripUpgrade: spell.cantripUpgrade as SpellFormCantripUpgrade[] | undefined,
    cantripUpgradeText: spell.cantripUpgradeText,
    usingAHigherLevelSpellSlot: spell.usingAHigherLevelSpellSlot
      ? [...spell.usingAHigherLevelSpellSlot]
      : undefined,
    damage: spell.damage
      ? {
          entries: [...(spell.damage.entries as SpellFormDamageEntry[])],
          additional: spell.damage.additional
            ? [...(spell.damage.additional as SpellFormDamageEntry[])]
            : undefined,
          perSlot: spell.damage.perSlot
            ? [...(spell.damage.perSlot as SpellFormDamageEntry[])]
            : undefined,
        }
      : undefined,
    heal: spell.heal ? { ...spell.heal } : undefined,
    save: spell.save,
    attack: spell.attack,
    source: spell.source ?? DEFAULT_SPELL_FORM_DATA.source,
    classes: spell.classes ? [...spell.classes] : [],
  };
}

/** 将 SpellFormData 转换为 Spell（只读字段转为 readonly） */
export function formDataToSpell(formData: SpellFormData): Spell {
  return {
    id: formData.id,
    name: formData.name,
    level: formData.level,
    school: formData.school,
    castingTime: formData.castingTime,
    range: formData.range,
    components: formData.components as readonly SpellComponent[],
    duration: formData.duration,
    concentration: formData.concentration,
    ritual: formData.ritual,
    description: formData.description as readonly string[],
    cantripUpgrade: formData.cantripUpgrade as readonly any[] | undefined,
    cantripUpgradeText: formData.cantripUpgradeText,
    usingAHigherLevelSpellSlot: formData.usingAHigherLevelSpellSlot as
      | readonly string[]
      | undefined,
    damage: formData.damage
      ? {
          entries: formData.damage.entries as readonly any[],
          additional: formData.damage.additional as readonly any[] | undefined,
          perSlot: formData.damage.perSlot as readonly any[] | undefined,
        }
      : undefined,
    heal: formData.heal,
    save: formData.save,
    attack: formData.attack,
    source: formData.source,
    classes: formData.classes as readonly string[] | undefined,
  } as Spell;
}
