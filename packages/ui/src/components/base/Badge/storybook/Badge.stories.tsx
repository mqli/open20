import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    children: 'Cantrip',
    variant: 'slate',
    size: 'md',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Badge {...args} variant="slate">
        Slate
      </Badge>
      <Badge {...args} variant="primary">
        Primary
      </Badge>
      <Badge {...args} variant="success">
        Success
      </Badge>
      <Badge {...args} variant="warning">
        Warning
      </Badge>
      <Badge {...args} variant="danger">
        Danger
      </Badge>
      <Badge {...args} variant="info">
        Info
      </Badge>
    </div>
  ),
};
