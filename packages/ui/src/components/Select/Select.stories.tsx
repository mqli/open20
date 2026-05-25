import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Select } from './Select';

const meta = {
  title: 'Components/Select',
  component: Select.Root,
} satisfies Meta<typeof Select.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [value, setValue] = useState('wizard');

    return (
      <div className="w-[280px]">
        <Select.Root value={value} onValueChange={setValue}>
          <Select.Trigger placeholder="Choose class" />
          <Select.Content>
            <Select.Item value="wizard">Wizard</Select.Item>
            <Select.Item value="cleric">Cleric</Select.Item>
            <Select.Item value="druid">Druid</Select.Item>
            <Select.Item value="sorcerer">Sorcerer</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    );
  },
};
