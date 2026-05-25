import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Switch } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    checked: false,
    disabled: false,
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked ?? false);

    return (
      <div className="flex items-center gap-3">
        <Switch {...args} checked={checked} onCheckedChange={setChecked} />
        <span className="text-sm text-text-secondary">{checked ? 'Enabled' : 'Disabled'}</span>
      </div>
    );
  },
};
