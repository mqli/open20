/**
 * @typedef {object} StorybookMainConfigOptions
 * @property {string[]} [stories]
 * @property {string[]} [addons]
 * @property {string} [frameworkName]
 */

/**
 * @param {StorybookMainConfigOptions} [options]
 */
export function createStorybookMainConfig({
  stories = ['../src/**/storybook/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons = ['@storybook/addon-links', '@storybook/addon-essentials'],
  frameworkName = '@storybook/react-vite',
} = {}) {
  return {
    stories,
    addons,
    framework: {
      name: frameworkName,
      options: {},
    },
  };
}

/**
 * @typedef {object} StorybookPreviewOptions
 * @property {string} [defaultTheme]
 * @property {'fullscreen' | 'padded' | 'centered'} [layout]
 */

/**
 * @param {StorybookPreviewOptions} [options]
 */
export function createStorybookPreview({ defaultTheme = 'light', layout = 'centered' } = {}) {
  return {
    parameters: {
      controls: {
        matchers: {
          color: /(background|color)$/i,
          date: /Date$/i,
        },
      },
      layout,
    },
    globalTypes: {
      theme: {
        name: 'Theme',
        description: 'App color theme',
        defaultValue: defaultTheme,
        toolbar: {
          icon: 'mirror',
          items: [
            { value: 'light', title: 'Light' },
            { value: 'dark', title: 'Dark' },
          ],
        },
      },
      locale: {
        name: 'Locale',
        description: 'Internationalization locale',
        defaultValue: 'en',
        toolbar: {
          icon: 'globe',
          items: [
            { value: 'en', title: 'English' },
            { value: 'zh-CN', title: '中文(简体)' },
          ],
        },
      },
    },
    decorators: [
      (Story, context) => {
        document.documentElement.setAttribute('data-theme', context.globals.theme);
        return Story();
      },
    ],
  };
}
