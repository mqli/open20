import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ThemeToggle } from '../../ThemeToggle';

const meta = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  args: {
    theme: 'light',
    onToggle: () => {},
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    theme: 'light',
  },
  render: (args) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(args.theme ?? 'light');

    return (
      <ThemeToggle
        {...args}
        theme={theme}
        onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />
    );
  },
};
