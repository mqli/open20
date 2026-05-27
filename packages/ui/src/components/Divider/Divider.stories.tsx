import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <div className="space-y-4">
          <p className="text-sm text-text-primary">Content above</p>
          <Story />
          <p className="text-sm text-text-primary">Content below</p>
        </div>
      </div>
    ),
  ],
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  decorators: [
    (Story) => (
      <div className="flex items-center gap-4">
        <p className="text-sm text-text-primary">Left</p>
        <Story />
        <p className="text-sm text-text-primary">Right</p>
      </div>
    ),
  ],
};

export const Small: Story = {
  args: {
    orientation: 'vertical',
    size: 'sm',
  },
  decorators: [
    (Story) => (
      <div className="flex items-center gap-4">
        <p className="text-sm text-text-primary">Left</p>
        <Story />
        <p className="text-sm text-text-primary">Right</p>
      </div>
    ),
  ],
};
