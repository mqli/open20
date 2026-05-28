import type { Meta, StoryObj } from '@storybook/react';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/Button';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: {
    title: 'No spells found',
    description: 'Try adjusting filters or preparing a different class list.',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithIconAndAction: Story = {
  args: {
    icon: <SearchX className="h-10 w-10" />,
    action: <Button variant="outline">Reset Filters</Button>,
  },
};
