import type { Meta, StoryObj } from '@storybook/react';
import { Surface } from '../../Surface';
import { Text } from '@/components/base/Text';

const meta = {
  title: 'Components/Surface',
  component: Surface,
  args: {
    variant: 'default',
    padding: 'md',
    shadow: 'none',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'elevated', 'ghost', 'tint', 'selected', 'warning', 'info'],
    },
    padding: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg'],
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
    },
  },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: null,
  },
  render: (args) => (
    <Surface {...args} className="w-[320px]">
      <Text as="h3" variant="headingSm" className="mb-2">
        Spell Card Container
      </Text>
      <Text variant="body">Reusable panel for grouped UI content.</Text>
    </Surface>
  ),
};
