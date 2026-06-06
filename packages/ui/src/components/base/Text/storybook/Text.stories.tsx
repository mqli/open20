import type { Meta, StoryObj } from '@storybook/react';
import { Text } from '../../Text';

const meta = {
  title: 'Components/Text',
  component: Text,
  args: {
    children: 'Magic is just science we do not understand yet.',
    variant: 'body',
    as: 'p',
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Text {...args} variant="heading">
        Heading
      </Text>
      <Text {...args} variant="headingSm">
        Heading Small
      </Text>
      <Text {...args} variant="bodyBold">
        Body Bold
      </Text>
      <Text {...args} variant="labelSm">
        Label Small
      </Text>
      <Text {...args} variant="body">
        Body
      </Text>
      <Text {...args} variant="caption">
        Caption
      </Text>
    </div>
  ),
};
