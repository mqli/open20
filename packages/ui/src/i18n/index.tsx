import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

export type BaseTranslationKeys =
  // Common UI elements
  | 'common.cancel'
  | 'common.save'
  | 'common.saving'
  | 'common.create'
  | 'common.update'
  | 'common.close'
  | 'common.details'
  | 'common.less'
  | 'common.atHigherLevels'
  | 'common.cantrip'
  | 'common.cantripUpgrade'
  | 'common.level'
  | 'common.ritual'
  | 'common.concentration'
  | 'common.source'
  | 'common.none'
  // Form validation messages
  | 'validation.required'
  | 'validation.idRequired'
  | 'validation.nameRequired'
  | 'validation.rangeRequired'
  | 'validation.durationRequired'
  | 'validation.componentsRequired'
  | 'validation.descriptionRequired'
  | 'validation.fixErrors'
  // Spell editor
  | 'spellEditor.livePreview'
  | 'spellEditor.tabGeneral'
  | 'spellEditor.tabDescription'
  | 'spellEditor.tabEffects'
  | 'spellEditor.basicInfo'
  | 'spellEditor.castingInfo'
  | 'spellEditor.description'
  | 'spellEditor.damageHealing'
  | 'spellEditor.cantripUpgrade'
  | 'spellEditor.createSpell'
  | 'spellEditor.updateSpell'
  // Spell
  | 'spell.classes'
  // Empty state
  | 'emptyState.noItems'
  | 'emptyState.noResults'
  | 'emptyState.getStarted'
  // Theme toggle
  | 'themeToggle.switchToLight'
  | 'themeToggle.switchToDark'
  // Dialog
  | 'dialog.close'
  // Select
  | 'select.noOptions'
  | 'select.searchPlaceholder'
  // Rules - Feat
  | 'feat.repeatable'
  | 'feat.levelReq'
  | 'feat.abilityBonus'
  | 'feat.abilityBonusChoice'
  | 'feat.skillProficiencies'
  | 'feat.skillProficiencyChoice'
  | 'feat.toolProficiencies'
  | 'feat.toolProficiencyChoice'
  | 'feat.languages'
  | 'feat.armorTraining'
  | 'feat.weaponMastery'
  | 'feat.attackBonus'
  | 'feat.attackBonusRanged'
  | 'feat.attackBonusMelee'
  | 'feat.acBonus'
  | 'feat.acBonusLight'
  | 'feat.acBonusMedium'
  | 'feat.acBonusHeavy'
  | 'feat.specialAbilities'
  | 'feat.spellChoices'
  | 'feat.spellsCount'
  | 'feat.prerequisite'
  // Rules - Feature
  | 'feature.level'
  | 'feature.longRest'
  | 'feature.shortRest'
  | 'feature.daily'
  | 'feature.perTurn'
  | 'feature.never'
  | 'feature.max'
  | 'feature.maxScalesByLevel'
  | 'feature.reset'
  | 'feature.scalesWithPB'
  | 'feature.baseAC'
  | 'feature.noArmor'
  | 'feature.noShield'
  | 'feature.noHeavyArmor'
  | 'feature.requires'
  // Rules - Glossary
  | 'glossary.aliases'
  | 'glossary.relatedEntries'
  | 'glossary.seeAlso'
  | 'glossary.close'
  // Rules - Species
  | 'species.abilityBonuses'
  | 'species.speed'
  | 'species.languages'
  | 'species.darkvision'
  | 'species.baseTraits'
  | 'species.subtypes'
  | 'species.small'
  | 'species.medium'
  // Rules - Equipment
  | 'equipment.damage'
  | 'equipment.ability'
  | 'equipment.bonus'
  | 'equipment.range'
  | 'equipment.properties'
  | 'equipment.mastery'
  | 'equipment.versatile'
  | 'equipment.ac'
  | 'equipment.dexBonus'
  | 'equipment.unlimited'
  | 'equipment.strengthReq'
  | 'equipment.stealth'
  | 'equipment.disadvantage'
  | 'equipment.equipped'
  | 'equipment.weight'
  | 'equipment.cost'
  | 'equipment.quantity'
  | 'equipment.type.weapon'
  | 'equipment.type.armor'
  | 'equipment.type.gears'
  | 'equipment.type.consumable'
  // Monster Editor
  | 'monsterEditor.livePreview'
  | 'monsterEditor.createMonster'
  | 'monsterEditor.updateMonster'
  | 'monsterEditor.basicInfo'
  | 'monsterEditor.combat'
  | 'monsterEditor.abilityScores'
  | 'monsterEditor.defenses'
  | 'monsterEditor.senses'
  | 'monsterEditor.features'
  | 'monsterEditor.spellcasting'
  | 'monsterEditor.meta'
  | 'monsterEditor.validation.acRequired'
  | 'monsterEditor.validation.hpRequired'
  | 'monsterEditor.validation.abilityScoresRequired'
  // Monster
  | 'monster.armorClass'
  | 'monster.hitPoints'
  | 'monster.speed'
  | 'monster.initiative'
  | 'monster.savingThrows'
  | 'monster.skills'
  | 'monster.senses'
  | 'monster.languages'
  | 'monster.challenge'
  | 'monster.proficiencyBonus'
  | 'monster.traits'
  | 'monster.actions'
  | 'monster.bonusActions'
  | 'monster.reactions'
  | 'monster.legendaryActions'
  | 'monster.spellcasting'
  | 'monster.equipment'
  | 'monster.environments'
  | 'monster.conditionImmunities'
  | 'monster.damageVulnerabilities'
  | 'monster.damageResistances'
  | 'monster.damageImmunities'
  | 'monster.limitedUsage.xPerDay'
  | 'monster.limitedUsage.recharge'
  | 'monster.limitedUsage.rechargeAfterRest'
  // Monster - Legendary Actions
  | 'monster.legendaryActionsDesc'
  // Monster - Spellcasting
  | 'monster.spellcasting.abilityDc'
  | 'monster.spellcasting.attackBonus'
  | 'monster.spellcasting.atWill'
  | 'monster.spellcasting.daily'
  // Spell
  | 'spell.saveAbbr'
  | 'spell.attackRoll';

// Translation keys are flat dot-notation strings.
// Consuming apps extend by adding their own flat keys.
export type BaseTranslations = Record<BaseTranslationKeys, string>;

// Allow extending with custom keys
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Translations<T = {}> = BaseTranslations & T;

// Default English translations (flat dot-notation keys)
export const defaultTranslations: Translations = {
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.saving': 'Saving...',
  'common.create': 'Create',
  'common.update': 'Update',
  'common.close': 'Close',
  'common.details': 'Details',
  'common.less': 'Less',
  'common.atHigherLevels': 'At Higher Levels',
  'common.cantripUpgrade': 'Cantrip Upgrade',
  'common.level': 'Level',
  'common.ritual': 'Ritual',
  'common.concentration': 'Concentration',
  'common.source': 'Source',
  'common.none': 'None',
  'common.cantrip': 'Cantrip',

  'validation.required': 'is required',
  'validation.idRequired': 'ID is required',
  'validation.nameRequired': 'Name is required',
  'validation.rangeRequired': 'Range is required',
  'validation.durationRequired': 'Duration is required',
  'validation.componentsRequired': 'At least one component is required',
  'validation.descriptionRequired': 'Description is required',
  'validation.fixErrors': 'Please fix the following errors:',

  'spellEditor.livePreview': 'Live Preview',
  'spellEditor.tabGeneral': 'General',
  'spellEditor.tabDescription': 'Description',
  'spellEditor.tabEffects': 'Effects',
  'spellEditor.basicInfo': 'Basic Info',
  'spellEditor.castingInfo': 'Casting Info',
  'spellEditor.description': 'Description',
  'spellEditor.damageHealing': 'Damage & Healing',
  'spellEditor.cantripUpgrade': 'Cantrip Upgrade',
  'spellEditor.createSpell': 'Create Spell',
  'spellEditor.updateSpell': 'Update Spell',

  // Monster Editor
  'monsterEditor.livePreview': 'Live Preview',
  'monsterEditor.createMonster': 'Create Monster',
  'monsterEditor.updateMonster': 'Update Monster',
  'monsterEditor.basicInfo': 'Basic Information',
  'monsterEditor.combat': 'Combat Stats',
  'monsterEditor.abilityScores': 'Ability Scores',
  'monsterEditor.defenses': 'Defenses',
  'monsterEditor.senses': 'Senses & Languages',
  'monsterEditor.features': 'Features & Actions',
  'monsterEditor.spellcasting': 'Spellcasting',
  'monsterEditor.meta': 'Meta',
  'monsterEditor.validation.acRequired': 'At least one Armor Class entry is required',
  'monsterEditor.validation.hpRequired': 'Hit Points value is required',
  'monsterEditor.validation.abilityScoresRequired': 'All ability scores must be set',

  // Spell
  'spell.classes': 'Classes',

  'emptyState.noItems': 'No items',
  'emptyState.noResults': 'No results found',
  'emptyState.getStarted': 'Get started by creating your first item',

  'themeToggle.switchToLight': 'Switch to light mode',
  'themeToggle.switchToDark': 'Switch to dark mode',

  'dialog.close': 'Close',

  'select.noOptions': 'No options available',
  'select.searchPlaceholder': 'Search...',

  // Rules - Feat
  'feat.repeatable': 'Repeatable',
  'feat.levelReq': 'Level {level}+',
  'feat.abilityBonus': 'Ability: {bonus}',
  'feat.abilityBonusChoice': 'Choose {count}× +{value} ability',
  'feat.skillProficiencies': 'Skills: {skills}',
  'feat.skillProficiencyChoice': 'Choose {count} skill/tool',
  'feat.toolProficiencies': 'Tools: {tools}',
  'feat.toolProficiencyChoice': 'Choose {count} tool',
  'feat.languages': 'Languages: {languages}',
  'feat.armorTraining': 'Armor: {armors}',
  'feat.weaponMastery': 'Weapons: {weapons}',
  'feat.attackBonus': 'Attack: {bonus}',
  'feat.attackBonusRanged': 'Ranged +{bonus}',
  'feat.attackBonusMelee': 'Melee +{bonus}',
  'feat.acBonus': 'AC: {bonus}',
  'feat.acBonusLight': 'Light +{bonus}',
  'feat.acBonusMedium': 'Medium +{bonus}',
  'feat.acBonusHeavy': 'Heavy +{bonus}',
  'feat.specialAbilities': 'Special: {abilities}',
  'feat.spellChoices': 'Spells: {count} spell(s)',
  'feat.spellsCount': '{count} spell(s)',
  'feat.prerequisite': 'REQ',

  // Rules - Feature
  'feature.level': 'Level {level}',
  'feature.longRest': 'Long Rest',
  'feature.shortRest': 'Short Rest',
  'feature.daily': 'Daily',
  'feature.perTurn': 'Per Turn',
  'feature.never': 'Never',
  'feature.max': 'Max: {max}',
  'feature.maxScalesByLevel': 'Max: scales by level',
  'feature.reset': 'Reset: {reset}',
  'feature.scalesWithPB': 'Scales with PB',
  'feature.baseAC': 'Base {ac}',
  'feature.noArmor': 'no armor',
  'feature.noShield': 'no shield',
  'feature.noHeavyArmor': 'no heavy armor',
  'feature.requires': '(requires {reqs})',

  // Rules - Glossary
  'glossary.aliases': 'Also known as: {aliases}',
  'glossary.relatedEntries': 'Related entries',
  'glossary.seeAlso': 'See also',
  'glossary.close': 'Close glossary entry',

  // Rules - Species
  'species.abilityBonuses': 'Ability Bonuses',
  'species.speed': 'Speed',
  'species.languages': 'Languages',
  'species.darkvision': 'Darkvision',
  'species.baseTraits': 'Base Traits',
  'species.subtypes': 'Subtypes',
  'species.small': 'Small',
  'species.medium': 'Medium',

  // Rules - Equipment
  'equipment.damage': 'Damage',
  'equipment.ability': 'Ability',
  'equipment.bonus': 'Bonus',
  'equipment.range': 'Range',
  'equipment.properties': 'Properties',
  'equipment.mastery': 'Mastery',
  'equipment.versatile': 'Versatile',
  'equipment.ac': 'AC',
  'equipment.dexBonus': 'Dex Bonus',
  'equipment.unlimited': 'Unlimited',
  'equipment.strengthReq': 'Str Req',
  'equipment.stealth': 'Stealth',
  'equipment.disadvantage': 'Disadvantage',
  'equipment.equipped': 'Equipped',
  'equipment.weight': 'Weight',
  'equipment.cost': 'Cost',
  'equipment.quantity': 'Qty',
  'equipment.type.weapon': 'Weapon',
  'equipment.type.armor': 'Armor',
  'equipment.type.gears': 'Gear',
  'equipment.type.consumable': 'Consumable',

  // Monster
  'monster.armorClass': 'Armor Class',
  'monster.hitPoints': 'Hit Points',
  'monster.speed': 'Speed',
  'monster.initiative': 'Initiative',
  'monster.savingThrows': 'Saving Throws',
  'monster.skills': 'Skills',
  'monster.senses': 'Senses',
  'monster.languages': 'Languages',
  'monster.challenge': 'Challenge',
  'monster.proficiencyBonus': 'Proficiency Bonus',
  'monster.traits': 'Traits',
  'monster.actions': 'Actions',
  'monster.bonusActions': 'Bonus Actions',
  'monster.reactions': 'Reactions',
  'monster.legendaryActions': 'Legendary Actions',
  'monster.spellcasting': 'Spellcasting',
  'monster.equipment': 'Equipment',
  'monster.environments': 'Environments',
  'monster.conditionImmunities': 'Condition Immunities',
  'monster.damageVulnerabilities': 'Damage Vulnerabilities',
  'monster.damageResistances': 'Damage Resistances',
  'monster.damageImmunities': 'Damage Immunities',
  'monster.limitedUsage.xPerDay': '{count}/Day',
  'monster.limitedUsage.recharge': 'Recharge {range}',
  'monster.limitedUsage.rechargeAfterRest': 'Recharge after {rest}',

  // Monster - Legendary Actions
  'monster.legendaryActionsDesc':
    'The {name} can take {count} legendary action(s) at the end of each turn.',

  // Monster - Spellcasting
  'monster.spellcasting.abilityDc': '{ability} DC {dc}',
  'monster.spellcasting.attackBonus': ', +{bonus} to hit',
  'monster.spellcasting.atWill': 'At will:',
  'monster.spellcasting.daily': '{times}/day:',

  // Spell
  'spell.saveAbbr': 'save',
  'spell.attackRoll': 'Attack roll',
};

// Chinese (Simplified) translations (flat dot-notation keys)
export const zhCNTranslations: Translations = {
  'common.cancel': '取消',
  'common.save': '保存',
  'common.saving': '保存中...',
  'common.create': '创建',
  'common.update': '更新',
  'common.close': '关闭',
  'common.details': '详情',
  'common.less': '更少',
  'common.atHigherLevels': '在更高等级',
  'common.cantripUpgrade': '戏法升级',
  'common.cantrip': '戏法',
  'common.level': '等级',
  'common.ritual': '仪式',
  'common.concentration': '专注',
  'common.source': '来源',
  'common.none': '无',

  'validation.required': '是必填项',
  'validation.idRequired': 'ID是必填项',
  'validation.nameRequired': '名称是必填项',
  'validation.rangeRequired': '范围是必填项',
  'validation.durationRequired': '持续时间是必填项',
  'validation.componentsRequired': '至少需要一个组件',
  'validation.descriptionRequired': '描述是必填项',
  'validation.fixErrors': '请修复以下错误：',

  'spellEditor.livePreview': '实时预览',
  'spellEditor.tabGeneral': '常规',
  'spellEditor.tabDescription': '描述',
  'spellEditor.tabEffects': '效果',
  'spellEditor.basicInfo': '基本信息',
  'spellEditor.castingInfo': '施法信息',
  'spellEditor.description': '描述',
  'spellEditor.damageHealing': '伤害与治疗',
  'spellEditor.cantripUpgrade': '戏法升级',
  'spellEditor.createSpell': '创建法术',
  'spellEditor.updateSpell': '更新法术',

  // Monster Editor
  'monsterEditor.livePreview': '实时预览',
  'monsterEditor.createMonster': '创建怪物',
  'monsterEditor.updateMonster': '更新怪物',
  'monsterEditor.basicInfo': '基本信息',
  'monsterEditor.combat': '战斗属性',
  'monsterEditor.abilityScores': '属性值',
  'monsterEditor.defenses': '防御',
  'monsterEditor.senses': '感官与语言',
  'monsterEditor.features': '特性与动作',
  'monsterEditor.spellcasting': '法术施展',
  'monsterEditor.meta': '其他',
  'monsterEditor.validation.acRequired': '至少需要一项护甲等级',
  'monsterEditor.validation.hpRequired': '生命值是必填项',
  'monsterEditor.validation.abilityScoresRequired': '所有属性值必须填写',

  // Spell
  'spell.classes': '职业',

  'emptyState.noItems': '没有项目',
  'emptyState.noResults': '未找到结果',
  'emptyState.getStarted': '通过创建您的第一个项目开始',

  'themeToggle.switchToLight': '切换到浅色模式',
  'themeToggle.switchToDark': '切换到深色模式',

  'dialog.close': '关闭',

  'select.noOptions': '没有可用选项',
  'select.searchPlaceholder': '搜索...',

  // Rules - Feat
  'feat.repeatable': '可重复',
  'feat.levelReq': '等级 {level}+',
  'feat.abilityBonus': '属性：{bonus}',
  'feat.abilityBonusChoice': '选择 {count}× +{value} 属性',
  'feat.skillProficiencies': '技能：{skills}',
  'feat.skillProficiencyChoice': '选择 {count} 技能/工具',
  'feat.toolProficiencies': '工具：{tools}',
  'feat.toolProficiencyChoice': '选择 {count} 工具',
  'feat.languages': '语言：{languages}',
  'feat.armorTraining': '护甲：{armors}',
  'feat.weaponMastery': '武器：{weapons}',
  'feat.attackBonus': '攻击：{bonus}',
  'feat.attackBonusRanged': '远程 +{bonus}',
  'feat.attackBonusMelee': '近战 +{bonus}',
  'feat.acBonus': 'AC：{bonus}',
  'feat.acBonusLight': '轻甲 +{bonus}',
  'feat.acBonusMedium': '中甲 +{bonus}',
  'feat.acBonusHeavy': '重甲 +{bonus}',
  'feat.specialAbilities': '特殊：{abilities}',
  'feat.spellChoices': '法术：{count} 个法术',
  'feat.spellsCount': '{count} 个法术',
  'feat.prerequisite': '需求',

  // Rules - Feature
  'feature.level': '等级 {level}',
  'feature.longRest': '长休',
  'feature.shortRest': '短休',
  'feature.daily': '每日',
  'feature.perTurn': '每回合',
  'feature.never': '永不',
  'feature.max': '上限：{max}',
  'feature.maxScalesByLevel': '上限：随等级提升',
  'feature.reset': '重置：{reset}',
  'feature.scalesWithPB': '随熟练加值提升',
  'feature.baseAC': '基础 {ac}',
  'feature.noArmor': '无护甲',
  'feature.noShield': '无盾牌',
  'feature.noHeavyArmor': '无重甲',
  'feature.requires': '（需要 {reqs}）',

  // Rules - Glossary
  'glossary.aliases': '亦称：{aliases}',
  'glossary.relatedEntries': '相关条目',
  'glossary.seeAlso': '另见',
  'glossary.close': '关闭术语条目',

  // Rules - Species
  'species.abilityBonuses': '属性加值',
  'species.speed': '速度',
  'species.languages': '语言',
  'species.darkvision': '黑暗视觉',
  'species.baseTraits': '基础特性',
  'species.subtypes': '亚种',
  'species.small': '小型',
  'species.medium': '中型',

  // Rules - Equipment
  'equipment.damage': '伤害',
  'equipment.ability': '属性',
  'equipment.bonus': '加值',
  'equipment.range': '射程',
  'equipment.properties': '属性',
  'equipment.mastery': '精通',
  'equipment.versatile': '通用',
  'equipment.ac': 'AC',
  'equipment.dexBonus': '敏捷加值',
  'equipment.unlimited': '无上限',
  'equipment.strengthReq': '力量需求',
  'equipment.stealth': '隐匿',
  'equipment.disadvantage': '劣势',
  'equipment.equipped': '已装备',
  'equipment.weight': '重量',
  'equipment.cost': '价格',
  'equipment.quantity': '数量',
  'equipment.type.weapon': '武器',
  'equipment.type.armor': '护甲',
  'equipment.type.gears': '装备',
  'equipment.type.consumable': '消耗品',

  // Monster
  'monster.armorClass': '护甲等级',
  'monster.hitPoints': '生命值',
  'monster.speed': '速度',
  'monster.initiative': '先攻',
  'monster.savingThrows': '豁免',
  'monster.skills': '技能',
  'monster.senses': '感知',
  'monster.languages': '语言',
  'monster.challenge': '挑战等级',
  'monster.proficiencyBonus': '熟练加值',
  'monster.traits': '特性',
  'monster.actions': '动作',
  'monster.bonusActions': '附赠动作',
  'monster.reactions': '反应',
  'monster.legendaryActions': '传奇动作',
  'monster.spellcasting': '法术施展',
  'monster.equipment': '装备',
  'monster.environments': '环境',
  'monster.conditionImmunities': '状态免疫',
  'monster.damageVulnerabilities': '伤害脆弱性',
  'monster.damageResistances': '伤害抗性',
  'monster.damageImmunities': '伤害免疫',
  'monster.limitedUsage.xPerDay': '每日{count}次',
  'monster.limitedUsage.recharge': '充能 {range}',
  'monster.limitedUsage.rechargeAfterRest': '{rest}后充能',

  // Monster - Legendary Actions
  'monster.legendaryActionsDesc': '{name} 在每回合结束时可以采取 {count} 个传奇动作。',

  // Monster - Spellcasting
  'monster.spellcasting.abilityDc': '{ability} DC {dc}',
  'monster.spellcasting.attackBonus': '，+{bonus} 命中',
  'monster.spellcasting.atWill': '随意：',
  'monster.spellcasting.daily': '每日{times}次：',

  // Spell
  'spell.saveAbbr': '豁免',
  'spell.attackRoll': '攻击检定',
};

// Context type
interface I18nContextType<T = BaseTranslations> {
  t: (key: keyof T, params?: Record<string, string | number>) => string;
  locale: string;
  setLocale: (locale: string) => void;
  translations: T;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component - accepts extended translations
export function I18nProvider<T extends BaseTranslations = BaseTranslations>({
  children,
  translationsSet = {
    en: defaultTranslations as unknown as T,
    'zh-CN': zhCNTranslations as unknown as T,
  },
  initialLocale = 'en',
}: {
  children: ReactNode;
  translationsSet?: Record<string, T>;
  initialLocale?: string;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const translations = translationsSet[locale] ?? translationsSet[Object.keys(translationsSet)[0]];

  // Cast to Record for string-keyed lookup (keys are now flat dot-notation strings)
  const dict = translations as unknown as Record<string, string>;

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const value = dict[key];
      if (typeof value !== 'string') {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }

      let result = value;
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        });
      }

      return result;
    },
    [dict],
  );

  const contextValue = useMemo(
    () => ({
      t,
      locale,
      setLocale,
      translations,
    }),
    [t, locale, translations],
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

// Hook to use i18n - returns typed translation function
export function useI18n<T = BaseTranslations>() {
  const context = useContext(I18nContext) as I18nContextType<T> | undefined;
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Convenience hook for translation only
export function useTranslation<T = BaseTranslations>() {
  const { t } = useI18n<T>();
  return t;
}
