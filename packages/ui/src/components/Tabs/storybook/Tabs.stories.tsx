import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from '../../Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs.Root,
} satisfies Meta<typeof Tabs.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Tabs.Root defaultValue="spells" className="w-[420px]">
      <Tabs.List>
        <Tabs.Trigger value="spells">Spells</Tabs.Trigger>
        <Tabs.Trigger value="equipment">Equipment</Tabs.Trigger>
        <Tabs.Trigger value="notes">Notes</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="spells">Prepared spells and slot usage go here.</Tabs.Content>
      <Tabs.Content value="equipment">Equipment and attunement details go here.</Tabs.Content>
      <Tabs.Content value="notes">Campaign notes and reminders go here.</Tabs.Content>
    </Tabs.Root>
  ),
};

export const Pills: Story = {
  render: () => (
    <Tabs.Root defaultValue="day">
      <Tabs.List variant="pills">
        <Tabs.Trigger variant="pills" value="day">
          Day
        </Tabs.Trigger>
        <Tabs.Trigger variant="pills" value="week">
          Week
        </Tabs.Trigger>
        <Tabs.Trigger variant="pills" value="month">
          Month
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="day">Daily overview</Tabs.Content>
      <Tabs.Content value="week">Weekly overview</Tabs.Content>
      <Tabs.Content value="month">Monthly overview</Tabs.Content>
    </Tabs.Root>
  ),
};
