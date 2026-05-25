const sharedTheme = {
  extend: {
    colors: {
      primary: {
        50: 'var(--color-primary-50)',
        100: 'var(--color-primary-100)',
        400: 'var(--color-primary-400)',
        600: 'var(--color-primary-600)',
        800: 'var(--color-primary-800)',
      },
      bg: {
        primary: 'var(--color-bg-primary)',
        secondary: 'var(--color-bg-secondary)',
        tertiary: 'var(--color-bg-tertiary)',
      },
      text: {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-tertiary)',
      },
      border: 'var(--color-border)',
      success: 'var(--color-success)',
      danger: 'var(--color-danger)',
      warning: 'var(--color-warning)',
      info: 'var(--color-info)',
    },
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
    },
    borderRadius: {
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      full: '9999px',
    },
  },
};

export const sharedTailwindConfig = {
  theme: sharedTheme,
  plugins: [],
};
