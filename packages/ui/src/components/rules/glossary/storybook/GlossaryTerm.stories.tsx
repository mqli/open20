import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { GlossaryEntry } from 'open20-core';
import { TooltipProvider } from '@/components/base/Tooltip';
import { GlossaryTerm } from '../GlossaryTerm';
import { GlossaryEntryFlyout } from '../GlossaryEntryFlyout';
import { GlossaryEntryTooltip } from '../GlossaryEntryTooltip';

const advantageEntry: GlossaryEntry = {
  id: 'advantage',
  source: 'SRD 5.2',
  name: 'Advantage',
  content: ['If you have Advantage on a D20 Test, roll two d20s, and use the higher roll.'],
};

const blindedEntry: GlossaryEntry = {
  id: 'blinded',
  source: 'SRD 5.2',
  name: 'Blinded',
  tag: 'Condition',
  condition: 'Blinded',
  content: ['While you have the Blinded condition, you experience the following effects.'],
  subsections: [
    {
      title: "Can't See.",
      content: ["You can't see and automatically fail any ability check that requires sight."],
    },
    {
      title: 'Attacks Affected.',
      content: [
        'Attack rolls against you have Advantage, and your attack rolls have Disadvantage.',
      ],
    },
  ],
  seeAlso: [{ type: 'entry', id: 'advantage' }],
};

const actionEntry: GlossaryEntry = {
  id: 'action',
  source: 'SRD 5.2',
  name: 'Action',
  content: ['On your turn, you can take one action.'],
  relatedEntryIds: ['attack', 'dash', 'dodge', 'help'],
};

const meta: Meta<typeof GlossaryTerm> = {
  title: 'rules/GlossaryTerm',
  component: GlossaryTerm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GlossaryTerm>;

export const TooltipTerm: Story = {
  render: () => (
    <p className="text-sm text-text-secondary">
      While concentrating, you may roll with{' '}
      <GlossaryTerm entry={advantageEntry} display="tooltip">
        Advantage
      </GlossaryTerm>{' '}
      on the check.
    </p>
  ),
};

export const FlyoutTerm: Story = {
  render: () => (
    <p className="text-sm text-text-secondary">
      The target has the{' '}
      <GlossaryTerm entry={blindedEntry} display="flyout">
        Blinded
      </GlossaryTerm>{' '}
      condition.
    </p>
  ),
};

export const AutoPicksFlyoutForRichEntry: Story = {
  render: () => (
    <p className="text-sm text-text-secondary">
      On your turn you can take an{' '}
      <GlossaryTerm entry={actionEntry} display="auto">
        Action
      </GlossaryTerm>
      .
    </p>
  ),
};

export const ControlledFlyout: Story = {
  render: function ControlledFlyoutStory() {
    const [open, setOpen] = useState(false);
    const [entry, setEntry] = useState<GlossaryEntry>(blindedEntry);

    return (
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Click a term to open the flyout:
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => {
              setEntry(blindedEntry);
              setOpen(true);
            }}
          >
            Blinded
          </button>
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => {
              setEntry(actionEntry);
              setOpen(true);
            }}
          >
            Action
          </button>
        </p>
        <GlossaryEntryFlyout
          entry={entry}
          open={open}
          onOpenChange={setOpen}
          onTermClick={(entryId) => {
            if (entryId === 'advantage') {
              setEntry(advantageEntry);
              setOpen(true);
            }
          }}
          resolveTermLabel={(entryId) =>
            ({
              advantage: 'Advantage',
              attack: 'Attack',
              dash: 'Dash',
              dodge: 'Dodge',
              help: 'Help',
            })[entryId] ?? entryId
          }
        />
      </div>
    );
  },
};

export const StandaloneTooltip: Story = {
  render: () => (
    <GlossaryEntryTooltip entry={advantageEntry} withProvider>
      <button type="button" className="underline">
        Advantage
      </button>
    </GlossaryEntryTooltip>
  ),
};
