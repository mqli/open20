export interface StorybookMainConfigOptions {
  stories?: string[];
  addons?: string[];
  frameworkName?: string;
}

export interface StorybookPreviewOptions {
  defaultTheme?: string;
  layout?: 'fullscreen' | 'padded' | 'centered';
}

export function createStorybookMainConfig(options?: StorybookMainConfigOptions): {
  stories: string[];
  addons: string[];
  framework: {
    name: string;
    options: Record<string, never>;
  };
};

export function createStorybookPreview(options?: StorybookPreviewOptions): {
  parameters: {
    controls: {
      matchers: {
        color: RegExp;
        date: RegExp;
      };
    };
    layout: 'fullscreen' | 'padded' | 'centered';
  };
  globalTypes: {
    theme: {
      name: string;
      description: string;
      defaultValue: string;
      toolbar: {
        icon: string;
        items: Array<{ value: string; title: string }>;
      };
    };
  };
  decorators: Array<
    (
      Story: () => unknown,
      context: { globals: { theme: string } },
    ) => unknown
  >;
};
