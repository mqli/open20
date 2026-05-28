import type { Preview } from '@storybook/react';
import { createElement } from 'react';
import { createStorybookPreview } from '@open20/config/storybook';
import { I18nProvider } from '../src/i18n';
import '../src/styles/index.css';

const basePreview = createStorybookPreview();

const preview: Preview = {
  ...basePreview,
  decorators: [
    (Story) => createElement(I18nProvider, null, createElement(Story)),
    ...(basePreview.decorators || []),
  ],
};

export default preview;
