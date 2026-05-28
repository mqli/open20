import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

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
    cantripUpgrade: string;
    level: string;
    ritual: string;
    concentration: string;
    source: string;
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

// Context type - supports generic translations for extensibility
interface I18nContextType<T = BaseTranslations> {
  t: (key: keyof T | string) => string;
  locale: string;
  setLocale: (locale: string) => void;
  translations: T;
}

// Create context with generic support
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component - accepts extended translations
export function I18nProvider<T extends BaseTranslations = BaseTranslations>({
  children,
  translations = defaultTranslations as unknown as T,
  initialLocale = 'en',
}: {
  children: ReactNode;
  translations?: T;
  initialLocale?: string;
}) {
  const [locale, setLocale] = useState(initialLocale);

  const t = useCallback(
    (key: string): string => {
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

      return typeof value === 'string' ? value : key;
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
