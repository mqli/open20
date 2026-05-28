import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@open20/ui/components/Button';
import { Tooltip, TooltipProvider } from './Tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip.Root,
} satisfies Meta<typeof Tooltip.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button variant="secondary">Hover me</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>Concentration spell: requires active focus.</Tooltip.Content>
      </Tooltip.Root>
    </TooltipProvider>
  ),
};
