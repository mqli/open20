import type { Meta, StoryObj } from '@storybook/react';
import { Star } from 'lucide-react';
import { IconButton } from './IconButton';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: {
    variant: 'secondary',
    size: 'md',
    active: false,
    children: <Star className="h-4 w-4" />,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['secondary', 'primary', 'info', 'warning', 'danger', 'success'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} active={false}>
        <Star className="h-4 w-4" />
      </IconButton>
      <IconButton {...args} active>
        <Star className="h-4 w-4 fill-current" />
      </IconButton>
      <IconButton {...args} disabled>
        <Star className="h-4 w-4" />
      </IconButton>
    </div>
  ),
};
