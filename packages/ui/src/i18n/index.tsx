import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';

// Translation structure - designed to be extendable by consuming apps
export interface BaseTranslations {
  // Common UI elements used across all components
  common: {
    cancel: string;
    save: string;
    saving: string;
    create: string;
    update: string;
    close: string;
    details: string;
    less: string;
    atHigherLevels: string;
    cantrip: string;
    cantripUpgrade: string;
    level: string;
    ritual: string;
    concentration: string;
    source: string;
    none: string;
  };

  // Form validation messages
  validation: {
    required: string;
    idRequired: string;
    nameRequired: string;
    rangeRequired: string;
    durationRequired: string;
    componentsRequired: string;
    descriptionRequired: string;
    fixErrors: string;
  };

  // Spell editor specific (since SpellEditor is in this package)
  spellEditor: {
    livePreview: string;
    basicInfo: string;
    castingInfo: string;
    description: string;
    damageHealing: string;
    cantripUpgrade: string;
    createSpell: string;
    updateSpell: string;
  };

  // Empty state defaults
  emptyState: {
    noItems: string;
    noResults: string;
    getStarted: string;
  };

  // Theme toggle
  themeToggle: {
    switchToLight: string;
    switchToDark: string;
  };

  // Dialog/Sheet
  dialog: {
    close: string;
  };

  // Select/Dropdown
  select: {
    noOptions: string;
    searchPlaceholder: string;
  };
}

// Allow extending with custom namespaces
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Translations<T = {}> = BaseTranslations & T;

// Default English translations
export const defaultTranslations: Translations = {
  common: {
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    create: 'Create',
    update: 'Update',
    close: 'Close',
    details: 'Details',
    less: 'Less',
    atHigherLevels: 'At Higher Levels',
    cantripUpgrade: 'Cantrip Upgrade',
    level: 'Level',
    ritual: 'Ritual',
    concentration: 'Concentration',
    source: 'Source',
    none: 'None',
    cantrip: 'Cantrip',
  },

  validation: {
    required: 'is required',
    idRequired: 'ID is required',
    nameRequired: 'Name is required',
    rangeRequired: 'Range is required',
    durationRequired: 'Duration is required',
    componentsRequired: 'At least one component is required',
    descriptionRequired: 'Description is required',
    fixErrors: 'Please fix the following errors:',
  },

  spellEditor: {
    livePreview: 'Live Preview',
    basicInfo: 'Basic Info',
    castingInfo: 'Casting Info',
    description: 'Description',
    damageHealing: 'Damage & Healing',
    cantripUpgrade: 'Cantrip Upgrade',
    createSpell: 'Create Spell',
    updateSpell: 'Update Spell',
  },

  emptyState: {
    noItems: 'No items',
    noResults: 'No results found',
    getStarted: 'Get started by creating your first item',
  },

  themeToggle: {
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
  },

  dialog: {
    close: 'Close',
  },

  select: {
    noOptions: 'No options available',
    searchPlaceholder: 'Search...',
  },
};

// Chinese (Simplified) translations
export const zhCNTranslations: Translations = {
  common: {
    cancel: '取消',
    save: '保存',
    saving: '保存中...',
    create: '创建',
    update: '更新',
    close: '关闭',
    details: '详情',
    less: '更少',
    atHigherLevels: '在更高等级',
    cantripUpgrade: '戏法升级',
    cantrip: '戏法',
    level: '等级',
    ritual: '仪式',
    concentration: '专注',
    source: '来源',
    none: '无',
  },

  validation: {
    required: '是必填项',
    idRequired: 'ID是必填项',
    nameRequired: '名称是必填项',
    rangeRequired: '范围是必填项',
    durationRequired: '持续时间是必填项',
    componentsRequired: '至少需要一个组件',
    descriptionRequired: '描述是必填项',
    fixErrors: '请修复以下错误：',
  },

  spellEditor: {
    livePreview: '实时预览',
    basicInfo: '基本信息',
    castingInfo: '施法信息',
    description: '描述',
    damageHealing: '伤害与治疗',
    cantripUpgrade: '戏法升级',
    createSpell: '创建法术',
    updateSpell: '更新法术',
  },

  emptyState: {
    noItems: '没有项目',
    noResults: '未找到结果',
    getStarted: '通过创建您的第一个项目开始',
  },

  themeToggle: {
    switchToLight: '切换到浅色模式',
    switchToDark: '切换到深色模式',
  },

  dialog: {
    close: '关闭',
  },

  select: {
    noOptions: '没有可用选项',
    searchPlaceholder: '搜索...',
  },
};

// Context type - supports generic translations for extensibility
interface I18nContextType<T = BaseTranslations> {
  t: (key: keyof T | string, params?: Record<string, string | number>) => string;
  locale: string;
  setLocale: (locale: string) => void;
  translations: T;
}

// Create context with generic support
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
  translationsSet?: Record<'en' | 'zh-CN', T>;
  initialLocale?: string;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const translations = translationsSet[locale as 'en' | 'zh-CN'] ?? translationsSet.en;

  useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale]);
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = translations;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }

      let result = typeof value === 'string' ? value : key;

      // Replace parameters in the string
      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        });
      }

      return result;
    },
    [translations],
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
