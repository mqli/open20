const sharedTheme = {
  extend: {
    colors: {
      primary: {
        50: 'rgb(var(--color-primary-50-rgb) / <alpha-value>)',
        100: 'rgb(var(--color-primary-100-rgb) / <alpha-value>)',
        400: 'rgb(var(--color-primary-400-rgb) / <alpha-value>)',
        500: 'rgb(var(--color-primary-500-rgb) / <alpha-value>)',
        600: 'rgb(var(--color-primary-600-rgb) / <alpha-value>)',
        800: 'rgb(var(--color-primary-800-rgb) / <alpha-value>)',
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
