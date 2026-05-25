import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    placeholder: 'Search spells...',
    disabled: false,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: (args) => (
    <div className="w-[320px] space-y-3">
      <Input {...args} />
      <Input {...args} value="Magic Missile" readOnly />
      <Input {...args} disabled value="Disabled input" />
    </div>
  ),
};
