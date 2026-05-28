import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/Button';
import { Dialog } from './Dialog';

const meta = {
  title: 'Components/Dialog',
  component: Dialog.Root,
} satisfies Meta<typeof Dialog.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>Open Dialog</Button>
      </Dialog.Trigger>
      <Dialog.Content className="w-[420px]">
        <Dialog.Header>
          <Dialog.Title>Arcane Settings</Dialog.Title>
          <Dialog.Description>Configure how your prepared spells are displayed.</Dialog.Description>
        </Dialog.Header>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            This is a sample dialog body. Replace this with your form fields or detail content.
          </p>
          <div className="flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost">Cancel</Button>
            </Dialog.Close>
            <Button>Save</Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  ),
};
