import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/base/Button';
import { Text } from '@/components/base/Text';
import { Sheet } from '../../Sheet';

const meta = {
  title: 'Components/Sheet',
  component: Sheet,
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button>Open Sheet</Button>
      </Sheet.Trigger>
      <Sheet.Content side="right" className="w-[360px]">
        <Sheet.Header>
          <Sheet.Title>Character Filters</Sheet.Title>
          <Sheet.Close asChild>
            <Button variant="ghost" size="sm">
              Close
            </Button>
          </Sheet.Close>
        </Sheet.Header>
        <Sheet.Body>
          <Text variant="body">
            This panel can hold options, forms, or details that should not interrupt the main
            layout.
          </Text>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  ),
};
