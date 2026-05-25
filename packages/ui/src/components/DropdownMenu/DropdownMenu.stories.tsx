import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';
import { DropdownMenu } from './DropdownMenu';

const meta = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu.Root,
} satisfies Meta<typeof DropdownMenu.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary">Open Menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-56">
        <DropdownMenu.Label className="px-2 py-1.5 text-xs text-text-tertiary">Quick Actions</DropdownMenu.Label>
        <DropdownMenu.Separator className="my-1 h-px bg-border" />
        <DropdownMenu.Item>Long Rest</DropdownMenu.Item>
        <DropdownMenu.Item>Short Rest</DropdownMenu.Item>
        <DropdownMenu.Separator className="my-1 h-px bg-border" />
        <DropdownMenu.CheckboxItem checked>Show used slots</DropdownMenu.CheckboxItem>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ),
};
