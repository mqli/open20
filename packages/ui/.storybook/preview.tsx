import type { Preview } from '@storybook/react';
import { createStorybookPreview } from '@open20/config/storybook';
import { I18nProvider, defaultTranslations, zhCNTranslations } from '../src/i18n';
import '../src/styles/index.css';

const basePreview = createStorybookPreview();

const preview: Preview = {
  ...basePreview,
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale;
      const translations = locale === 'zh-CN' ? zhCNTranslations : defaultTranslations;
      return (
        <I18nProvider translations={translations} initialLocale={locale}>
          <Story />
        </I18nProvider>
      );
    },
    ...(basePreview.decorators || []),
  ],
};

export default preview;
