import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toggle } from './Toggle';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
  args: {
    children: 'Ritual',
    variant: 'secondary',
    size: 'md',
    pressed: false,
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [pressed, setPressed] = useState(args.pressed ?? false);

    return (
      <Toggle {...args} pressed={pressed} onPressedChange={setPressed}>
        {args.children}
      </Toggle>
    );
  },
};
