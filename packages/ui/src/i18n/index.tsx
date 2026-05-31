import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

// Translation keys are flat dot-notation strings.
// Consuming apps extend by adding their own flat keys.
export interface BaseTranslations {
  // Common UI elements
  'common.cancel': string;
  'common.save': string;
  'common.saving': string;
  'common.create': string;
  'common.update': string;
  'common.close': string;
  'common.details': string;
  'common.less': string;
  'common.atHigherLevels': string;
  'common.cantrip': string;
  'common.cantripUpgrade': string;
  'common.level': string;
  'common.ritual': string;
  'common.concentration': string;
  'common.source': string;
  'common.none': string;

  // Form validation messages
  'validation.required': string;
  'validation.idRequired': string;
  'validation.nameRequired': string;
  'validation.rangeRequired': string;
  'validation.durationRequired': string;
  'validation.componentsRequired': string;
  'validation.descriptionRequired': string;
  'validation.fixErrors': string;

  // Spell editor
  'spellEditor.livePreview': string;
  'spellEditor.basicInfo': string;
  'spellEditor.castingInfo': string;
  'spellEditor.description': string;
  'spellEditor.damageHealing': string;
  'spellEditor.cantripUpgrade': string;
  'spellEditor.createSpell': string;
  'spellEditor.updateSpell': string;

  // Empty state
  'emptyState.noItems': string;
  'emptyState.noResults': string;
  'emptyState.getStarted': string;

  // Theme toggle
  'themeToggle.switchToLight': string;
  'themeToggle.switchToDark': string;

  // Dialog
  'dialog.close': string;

  // Select
  'select.noOptions': string;
  'select.searchPlaceholder': string;
}

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
};

// Context type
interface I18nContextType<T = BaseTranslations> {
  t: (key: string, params?: Record<string, string | number>) => string;
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
