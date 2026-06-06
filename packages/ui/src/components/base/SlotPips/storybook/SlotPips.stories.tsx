import type { Meta, StoryObj } from '@storybook/react';
import { SlotPips } from '../../SlotPips';

const meta = {
  title: 'Components/SlotPips',
  component: SlotPips,
  args: {
    total: 4,
    used: 1,
    size: 'md',
  },
} satisfies Meta<typeof SlotPips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="space-y-3">
      <SlotPips {...args} size="sm" />
      <SlotPips {...args} size="md" />
      <SlotPips {...args} size="lg" />
    </div>
  ),
};
