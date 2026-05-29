import {
  defaultTranslations,
  zhCNTranslations as defualtZhCNTranslations,
  type BaseTranslations,
} from '@open20/ui';

// Spellbook translation structure
export interface SpellbookTranslations extends BaseTranslations {
  // Search and filters
  spells: string;
  searchSpells: string;
  clearSearch: string;
  allLevels: string;
  cantrip: string;
  levelLabel: string;
  ritual: string;
  concentration: string;
  classes: string;
  schools: string;
  clearFilter: string;
  clearFilters: string;

  // Character management
  createCharacter: string;
  editCharacter: string;
  characterName: string;
  characterNamePlaceholder: string;
  class: string;
  level: string;
  species: string;
  background: string;
  multiclass: string;
  addClass: string;
  abilityScores: string;
  summonHero: string;
  saveChanges: string;
  saving: string;
  cancel: string;

  // Character sheet
  openCharacterSheet: string;
  editCharacterStats: string;
  pactMagic: string;
  classSpellcasting: string;
  combined: string;
  concentrationBanner: string;
  alwaysPrepared: string;
  preparationSlots: string;
  preparedSpells: string;
  knownCantrips: string;
  learnCantrip: string;
  replaceCantrip: string;
  add: string;
  noCantripsAvailable: string;

  // Spell actions
  cast: string;
  attack: string;
  damage: string;
  healing: string;
  rollAttack: string;
  rollDamage: string;
  rollHealing: string;
  castAtLevel: string;
  startConcentration: string;
  endConcentration: string;
  concentrate: string;
  stop: string;

  // Spellbook controls
  learnSpell: string;
  unlearnSpell: string;
  prepareSpell: string;
  unprepareSpell: string;
  learnCantripAction: string;
  unlearnCantripAction: string;
  alwaysPreparedLabel: string;
  manageSpell: string;
  addSpell: string;
  preparedShort: string;
  known: string;
  prepared: string;

  // Dice rolling
  rollResult: string;

  // Rest actions
  shortRest: string;
  longRest: string;

  // Character switching
  switchCharacter: string;
  createCharacterAction: string;
  addCharacter: string;

  // Empty states
  noPreparedSpells: string;
  noKnownSpells: string;
  noSpellsFound: string;

  // Class action dropdown
  forLabel: string;
  addForLabel: string;
  unlearn: string;
  unprepare: string;
  learn: string;
  prepare: string;
  none: string;

  // Spell levels
  cantripLevel: string;
  firstLevel: string;
  secondLevel: string;
  thirdLevel: string;
  fourthLevel: string;
  fifthLevel: string;
  sixthLevel: string;
  seventhLevel: string;
  eighthLevel: string;
  ninthLevel: string;

  // Character sheet stats
  ability: string;
  saveDC: string;
  attackBonus: string;
  pactMagicSlots: string;
  classSpellcastingStats: string;
  knownCantripsCount: string;
  alwaysPreparedSpells: string;
  preparedSpellsCount: string;

  // Dice rolling labels
  spellAttack: string;
  damageRoll: string;
  healingRoll: string;
  rollDamageOfType: string;

  // Language switcher
  switchToChinese: string;
  switchToEnglish: string;
  chineseShort: string;
  englishShort: string;
}

// English translations
export const enTranslations: SpellbookTranslations = Object.assign(defaultTranslations, {
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
});

// Chinese (Simplified) translations
export const zhCNTranslations: SpellbookTranslations = Object.assign(defualtZhCNTranslations, {
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

  // Spell levels
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

  // Character sheet stats
  ability: '属性',
  saveDC: '豁免DC',
  attackBonus: '攻击',
  pactMagicSlots: '契约魔法',
  classSpellcastingStats: '职业施法',
  knownCantripsCount: '戏法',
  alwaysPreparedSpells: '始终准备',
  preparedSpellsCount: '已准备法术',

  // Dice rolling labels
  spellAttack: '法术攻击',
  damageRoll: '伤害',
  healingRoll: '治疗',
  rollDamageOfType: '{type}伤害',

  // Language switcher
  switchToChinese: '切换到中文',
  switchToEnglish: 'Switch to English',
  chineseShort: '中文',
  englishShort: 'EN',
});
