import type { Meta, StoryObj } from '@storybook/react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/Button';
import { SectionHeader } from '../../SectionHeader';

const meta = {
  title: 'Components/SectionHeader',
  component: SectionHeader,
  args: {
    title: 'Prepared Spells',
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithIconAndAction: Story = {
  args: {
    icon: <Sparkles className="h-4 w-4" />,
    action: <Button size="sm">Manage</Button>,
  },
};
