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
  | 'spellEditor.basicInfo'
  | 'spellEditor.castingInfo'
  | 'spellEditor.description'
  | 'spellEditor.damageHealing'
  | 'spellEditor.cantripUpgrade'
  | 'spellEditor.createSpell'
  | 'spellEditor.updateSpell'
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
  | 'glossary.close';

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
  'spellEditor.basicInfo': 'Basic Info',
  'spellEditor.castingInfo': 'Casting Info',
  'spellEditor.description': 'Description',
  'spellEditor.damageHealing': 'Damage & Healing',
  'spellEditor.cantripUpgrade': 'Cantrip Upgrade',
  'spellEditor.createSpell': 'Create Spell',
  'spellEditor.updateSpell': 'Update Spell',

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
  'spellEditor.basicInfo': '基本信息',
  'spellEditor.castingInfo': '施法信息',
  'spellEditor.description': '描述',
  'spellEditor.damageHealing': '伤害与治疗',
  'spellEditor.cantripUpgrade': '戏法升级',
  'spellEditor.createSpell': '创建法术',
  'spellEditor.updateSpell': '更新法术',

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
