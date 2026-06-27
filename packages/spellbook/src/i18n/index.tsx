import {
  defaultTranslations,
  zhCNTranslations as defaultZhCNTranslations,
  type BaseTranslations,
  useI18n as useI18nFromUi,
  useTranslation as useTranslationFromUi,
} from '@open20/ui';

export type SpellbookTranslationKeys =
  // Search and filters
  | 'spells'
  | 'searchSpells'
  | 'clearSearch'
  | 'allLevels'
  | 'cantrip'
  | 'levelLabel'
  | 'ritual'
  | 'concentration'
  | 'classes'
  | 'schools'
  | 'clearFilter'
  | 'clearFilters'
  // Character management
  | 'createCharacter'
  | 'editCharacter'
  | 'characterName'
  | 'characterNamePlaceholder'
  | 'class'
  | 'level'
  | 'species'
  | 'background'
  | 'multiclass'
  | 'addClass'
  | 'abilityScores'
  | 'summonHero'
  | 'saveChanges'
  | 'saving'
  | 'cancel'
  // Character sheet
  | 'openCharacterSheet'
  | 'editCharacterStats'
  | 'pactMagic'
  | 'classSpellcasting'
  | 'combined'
  | 'concentrationBanner'
  | 'alwaysPrepared'
  | 'preparationSlots'
  | 'preparedSpells'
  | 'knownCantrips'
  | 'learnCantrip'
  | 'replaceCantrip'
  | 'add'
  | 'noCantripsAvailable'
  // Spell actions
  | 'cast'
  | 'attack'
  | 'damage'
  | 'healing'
  | 'rollAttack'
  | 'rollDamage'
  | 'rollHealing'
  | 'castAtLevel'
  | 'startConcentration'
  | 'endConcentration'
  | 'concentrate'
  | 'stop'
  // Spellbook controls
  | 'learnSpell'
  | 'unlearnSpell'
  | 'prepareSpell'
  | 'unprepareSpell'
  | 'learnCantripAction'
  | 'unlearnCantripAction'
  | 'alwaysPreparedLabel'
  | 'manageSpell'
  | 'addSpell'
  | 'preparedShort'
  | 'known'
  | 'prepared'
  // Dice rolling
  | 'rollResult'
  // Rest actions
  | 'shortRest'
  | 'longRest'
  // Character switching
  | 'switchCharacter'
  | 'createCharacterAction'
  | 'addCharacter'
  // Empty states
  | 'noPreparedSpells'
  | 'noKnownSpells'
  | 'noSpellsFound'
  // Class action dropdown
  | 'forLabel'
  | 'addForLabel'
  | 'unlearn'
  | 'unprepare'
  | 'learn'
  | 'prepare'
  | 'none'
  // Spell levels
  | 'cantripLevel'
  | 'firstLevel'
  | 'secondLevel'
  | 'thirdLevel'
  | 'fourthLevel'
  | 'fifthLevel'
  | 'sixthLevel'
  | 'seventhLevel'
  | 'eighthLevel'
  | 'ninthLevel'
  // Character sheet stats
  | 'ability'
  | 'saveDC'
  | 'attackBonus'
  | 'pactMagicSlots'
  | 'classSpellcastingStats'
  | 'knownCantripsCount'
  | 'alwaysPreparedSpells'
  | 'preparedSpellsCount'
  // Dice rolling labels
  | 'spellAttack'
  | 'damageRoll'
  | 'healingRoll'
  | 'rollDamageOfType'
  // Language switcher
  | 'switchToChinese'
  | 'switchToEnglish'
  | 'chineseShort'
  | 'englishShort'
  // Layout
  | 'character'
  | 'noCharacterSelected'
  | 'filters'
  // Loading
  | 'loading'
  // Custom spells
  | 'createCustomSpell'
  | 'editCustomSpell'
  | 'deleteCustomSpell'
  | 'deleteConfirm'
  | 'importFromText'
  | 'homebrew'
  | 'parseAndFill'
  | 'pasteSpellText'
  | 'pastePlaceholder'
  | 'saveSpell'
  | 'saveAndNew'
  | 'saveAndClose'
  // Custom classes / subclasses
  | 'createCustomClass'
  | 'editCustomClass'
  | 'deleteCustomClass'
  | 'customClass'
  | 'className'
  | 'classNamePlaceholder'
  | 'subclassName'
  | 'subclassNamePlaceholder'
  | 'spellcastingAbility'
  | 'slotPreset'
  | 'slotPresetFullCaster'
  | 'slotPresetHalfCaster'
  | 'slotPresetPactMagic'
  | 'knownSource'
  | 'knownSourceClassList'
  | 'knownSourceSpellbook'
  | 'preparationTiming'
  | 'preparationTimingLongRest'
  | 'preparationTimingLevelUp'
  | 'alwaysPreparedSpellsLevel'
  | 'addAlwaysPreparedLevel'
  | 'deleteConfirmCustomClass'
  | 'manageCustomClasses'
  | 'customClassTitle'
  | 'noCustomClasses'
  // Menu
  | 'language'
  | 'theme';

// Spellbook translation structure
export type SpellbookTranslations = BaseTranslations & Record<SpellbookTranslationKeys, string>;

// English translations
export const enTranslations: SpellbookTranslations = {
  ...defaultTranslations,
  spells: 'Spells',
  searchSpells: 'Search spells...',
  clearSearch: 'Clear search',
  allLevels: 'All',
  cantrip: 'Cantrip',
  levelLabel: 'Level',
  ritual: 'Ritual',
  concentration: 'Concentration',
  classes: 'Classes',
  schools: 'Schools',
  clearFilter: 'Clear filter',
  clearFilters: 'Clear {count} filters',

  createCharacter: 'Create Your Hero',
  editCharacter: 'Edit Character',
  characterName: 'Character Name',
  characterNamePlaceholder: 'e.g. Melf the Archmage',
  class: 'Class',
  level: 'Level',
  species: 'Species',
  background: 'Background',
  multiclass: 'Multiclass',
  addClass: '+ Add Class',
  abilityScores: 'Ability Scores',
  summonHero: 'Summon Hero',
  saveChanges: 'Save Changes',
  saving: 'Saving...',
  cancel: 'Cancel',

  openCharacterSheet: 'Open character sheet',
  editCharacterStats: 'Edit Character Stats',
  pactMagic: 'Pact Magic',
  classSpellcasting: 'Class Spellcasting',
  combined: 'Combined',
  concentrationBanner: 'Concentrating',
  alwaysPrepared: 'Always Prepared',
  preparationSlots: 'Preparation Slots',
  preparedSpells: 'Prepared Spells',
  knownCantrips: 'Cantrips',
  learnCantrip: 'Learn Cantrip',
  replaceCantrip: 'Replace Cantrip',
  add: 'Add',
  noCantripsAvailable: 'No more cantrips available to learn.',

  cast: 'Cast',
  attack: 'Attack',
  damage: 'Damage',
  healing: 'Healing',
  rollAttack: 'Roll Attack',
  rollDamage: 'Roll Damage',
  rollHealing: 'Roll Healing',
  castAtLevel: 'Cast at {level}',
  startConcentration: 'Start Concentration',
  endConcentration: 'End Concentration',
  concentrate: 'Concentrate',
  stop: 'Stop',

  learnSpell: 'Learn Spell',
  unlearnSpell: 'Unlearn Spell',
  prepareSpell: 'Prepare Spell',
  unprepareSpell: 'Unprepare Spell',
  learnCantripAction: 'Learn Cantrip',
  unlearnCantripAction: 'Unlearn Cantrip',
  alwaysPreparedLabel: 'Always Prepared',
  manageSpell: 'Manage Spell',
  addSpell: 'Add Spell',
  preparedShort: 'Prep',
  known: 'Known',
  prepared: 'Prepared',

  rollResult: 'Roll Result',

  shortRest: 'Short',
  longRest: 'Long',

  switchCharacter: 'Switch character',
  createCharacterAction: 'Create character',
  addCharacter: 'Add character',

  noPreparedSpells: 'No prepared spells. Open a spell and click "Prepare".',
  noKnownSpells: 'No known spells yet. Open a spell and click "Learn".',
  noSpellsFound: 'No spells found matching your criteria.',

  forLabel: '{label} for',
  addForLabel: 'Add {label} for',
  unlearn: 'Unlearn',
  unprepare: 'Unprepare',
  learn: 'Learn',
  prepare: 'Prepare',
  none: 'None',

  // Spell levels
  cantripLevel: 'Cantrip',
  firstLevel: '1st',
  secondLevel: '2nd',
  thirdLevel: '3rd',
  fourthLevel: '4th',
  fifthLevel: '5th',
  sixthLevel: '6th',
  seventhLevel: '7th',
  eighthLevel: '8th',
  ninthLevel: '9th',

  // Character sheet stats
  ability: 'Ability',
  saveDC: 'Save DC',
  attackBonus: 'Attack',
  pactMagicSlots: 'Pact Magic',
  classSpellcastingStats: 'Class Spellcasting',
  knownCantripsCount: 'Cantrips',
  alwaysPreparedSpells: 'Always Prepared',
  preparedSpellsCount: 'Prepared Spells',

  // Dice rolling labels
  spellAttack: 'Spell Attack',
  damageRoll: 'Damage',
  healingRoll: 'Healing',
  rollDamageOfType: '{type} Damage',

  // Language switcher
  switchToChinese: 'Switch to Chinese',
  switchToEnglish: '切换到英文',
  chineseShort: '中文',
  englishShort: 'EN',

  // Layout
  character: 'Character',
  noCharacterSelected: 'No character selected',
  filters: 'Filters',
  // Loading
  loading: 'Loading...',

  // Custom spells
  createCustomSpell: 'Create Custom Spell',
  editCustomSpell: 'Edit Custom Spell',
  deleteCustomSpell: 'Delete',
  deleteConfirm: 'Delete this custom spell? This cannot be undone.',
  importFromText: 'Import from Text',
  homebrew: 'Homebrew',
  parseAndFill: 'Parse & Fill Form',
  pasteSpellText: 'Paste spell text copied from 5e tools, D&D Beyond, or Roll20.',
  pastePlaceholder: 'Paste spell text here...',
  saveSpell: 'Save',
  saveAndNew: 'Save & New',
  saveAndClose: 'Save & Close',

  // Custom classes / subclasses
  createCustomClass: 'Create Custom Class',
  editCustomClass: 'Edit Custom Class',
  deleteCustomClass: 'Delete',
  customClass: 'Custom Class',
  className: 'Class Name',
  classNamePlaceholder: 'e.g. Shadow Mage',
  subclassName: 'Subclass Name',
  subclassNamePlaceholder: 'e.g. Shadow Domain',
  spellcastingAbility: 'Spellcasting Ability',
  slotPreset: 'Spell Slot Progression',
  slotPresetFullCaster: 'Full Caster',
  slotPresetHalfCaster: 'Half Caster',
  slotPresetPactMagic: 'Pact Magic',
  knownSource: 'Spell Learning',
  knownSourceClassList: 'Knows full class list',
  knownSourceSpellbook: 'Learn from spellbook',
  preparationTiming: 'Preparation Timing',
  preparationTimingLongRest: 'Long Rest',
  preparationTimingLevelUp: 'Level Up',
  alwaysPreparedSpellsLevel: 'Always Prepared Spells (Level {level}+)',
  addAlwaysPreparedLevel: '+ Add Spell Level',
  deleteConfirmCustomClass: 'Delete this custom class? This cannot be undone.',
  manageCustomClasses: 'Manage Custom Classes',
  customClassTitle: 'Custom Classes & Subclasses',
  noCustomClasses: 'No custom classes yet. Create one to get started.',

  // Menu
  language: 'Language',
  theme: 'Theme',
};

// Chinese (Simplified) translations
export const zhCNTranslations: SpellbookTranslations = {
  ...defaultZhCNTranslations,
  spells: '法术',
  searchSpells: '搜索法术...',
  clearSearch: '清除搜索',
  allLevels: '全部',
  cantrip: '戏法',
  levelLabel: '等级',
  ritual: '仪式',
  concentration: '专注',
  classes: '职业',
  schools: '学派',
  clearFilter: '清除筛选',
  clearFilters: '清除 {count} 个筛选',

  createCharacter: '创建你的英雄',
  editCharacter: '编辑角色',
  characterName: '角色名称',
  characterNamePlaceholder: '例如：法师梅尔夫',
  class: '职业',
  level: '等级',
  species: '种族',
  background: '背景',
  multiclass: '兼职',
  addClass: '+ 添加职业',
  abilityScores: '属性值',
  summonHero: '召唤英雄',
  saveChanges: '保存更改',
  saving: '保存中...',
  cancel: '取消',

  openCharacterSheet: '打开角色表',
  editCharacterStats: '编辑角色属性',
  pactMagic: '契约魔法',
  classSpellcasting: '职业施法',
  combined: '合并',
  concentrationBanner: '专注中',
  alwaysPrepared: '始终准备',
  preparationSlots: '准备槽位',
  preparedSpells: '已准备法术',
  knownCantrips: '戏法',
  learnCantrip: '学习戏法',
  replaceCantrip: '替换戏法',
  add: '添加',
  noCantripsAvailable: '没有更多可学习的戏法。',

  cast: '施放',
  attack: '攻击',
  damage: '伤害',
  healing: '治疗',
  rollAttack: '掷攻击骰',
  rollDamage: '掷伤害骰',
  rollHealing: '掷治疗骰',
  castAtLevel: '在{level}级施放',
  startConcentration: '开始专注',
  endConcentration: '结束专注',
  concentrate: '专注',
  stop: '停止',

  learnSpell: '学习法术',
  unlearnSpell: '遗忘法术',
  prepareSpell: '准备法术',
  unprepareSpell: '取消准备',
  learnCantripAction: '学习戏法',
  unlearnCantripAction: '遗忘戏法',
  alwaysPreparedLabel: '始终准备',
  manageSpell: '管理法术',
  addSpell: '添加法术',
  preparedShort: '准备',
  prepared: '已准备',
  known: '已学习',

  rollResult: '掷骰结果',

  shortRest: '短休',
  longRest: '长休',

  switchCharacter: '切换角色',
  createCharacterAction: '创建角色',
  addCharacter: '添加角色',

  noPreparedSpells: '没有已准备的法术。打开一个法术并点击"准备"。',
  noKnownSpells: '还没有已知的法术。打开一个法术并点击"学习"。',
  noSpellsFound: '没有找到符合条件的法术。',

  forLabel: '{label}用于',
  addForLabel: '为{label}添加',
  unlearn: '遗忘',
  unprepare: '取消准备',
  learn: '学习',
  prepare: '准备',
  none: '无',

  cantripLevel: '戏法',
  firstLevel: '1环',
  secondLevel: '2环',
  thirdLevel: '3环',
  fourthLevel: '4环',
  fifthLevel: '5环',
  sixthLevel: '6环',
  seventhLevel: '7环',
  eighthLevel: '8环',
  ninthLevel: '9环',

  ability: '属性',
  saveDC: '豁免DC',
  attackBonus: '攻击',
  pactMagicSlots: '契约魔法',
  classSpellcastingStats: '职业施法',
  knownCantripsCount: '戏法',
  alwaysPreparedSpells: '始终准备',
  preparedSpellsCount: '已准备法术',

  spellAttack: '法术攻击',
  damageRoll: '伤害',
  healingRoll: '治疗',
  rollDamageOfType: '{type}伤害',

  switchToChinese: '切换到中文',
  switchToEnglish: 'Switch to English',
  chineseShort: '中文',
  englishShort: 'EN',

  // Layout
  character: '角色',
  noCharacterSelected: '未选择角色',
  filters: '筛选',

  // Loading
  loading: '加载中...',

  // Custom spells
  createCustomSpell: '创建自定义法术',
  editCustomSpell: '编辑自定义法术',
  deleteCustomSpell: '删除',
  deleteConfirm: '确定删除此自定义法术？此操作不可撤销。',
  importFromText: '从文本导入',
  homebrew: '自创',
  parseAndFill: '解析并填充表单',
  pasteSpellText: '粘贴从 5e tools、D&D Beyond 或 Roll20 复制的法术文本。',
  pastePlaceholder: '在此粘贴法术文本...',
  saveSpell: '保存',
  saveAndNew: '保存并新建',
  saveAndClose: '保存并关闭',

  // Custom classes / subclasses
  createCustomClass: '创建自定义职业',
  editCustomClass: '编辑自定义职业',
  deleteCustomClass: '删除',
  customClass: '自定义职业',
  className: '职业名称',
  classNamePlaceholder: '例如：暗影法师',
  subclassName: '子职业名称',
  subclassNamePlaceholder: '例如：暗影领域',
  spellcastingAbility: '施法关键属性',
  slotPreset: '法术位进度',
  slotPresetFullCaster: '全施法者',
  slotPresetHalfCaster: '半施法者',
  slotPresetPactMagic: '契约魔法',
  knownSource: '法术学习方式',
  knownSourceClassList: '知晓全部职业法术',
  knownSourceSpellbook: '从法术书学习',
  preparationTiming: '准备时机',
  preparationTimingLongRest: '长休后',
  preparationTimingLevelUp: '升级时',
  alwaysPreparedSpellsLevel: '始终准备法术（{level}级起）',
  addAlwaysPreparedLevel: '+ 添加法术等级',
  deleteConfirmCustomClass: '确定删除此自定义职业？此操作不可撤销。',
  manageCustomClasses: '管理自定义职业',
  customClassTitle: '自定义职业与子职业',
  noCustomClasses: '还没有自定义职业，创建一个开始吧。',

  // Menu
  language: '语言',
  theme: '主题',
};

export { I18nProvider } from '@open20/ui';

export function useTranslation() {
  return useTranslationFromUi<SpellbookTranslations>();
}

export function useI18n() {
  return useI18nFromUi<SpellbookTranslations>();
}
