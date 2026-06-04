import type { Meta, StoryObj } from '@storybook/react';
import { BookOpen, Clock, Zap, Star, ChevronDown } from 'lucide-react';
import { CardSurface } from './CardSurface';
import { CardMetaItem } from './CardMetaItem';

const meta: Meta<typeof CardSurface> = {
  title: 'Components/CardSurface',
  component: CardSurface,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    surfaceVariant: {
      control: 'select',
      options: ['default', 'tint', 'selected', 'warning', 'info'],
    },
    density: {
      control: 'select',
      options: ['default', 'compact'],
    },
    padding: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    clickable: { control: 'boolean' },
    glow: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CardSurface>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold">Default Card</h3>
        <p className="text-sm text-text-secondary mt-1">Basic CardSurface with default variant.</p>
      </div>
    ),
    surfaceVariant: 'default',
    padding: 'md',
    density: 'default',
  },
};

export const WithSource: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold">Card with Source</h3>
        <p className="text-sm text-text-secondary mt-1">
          Shows source label in the bottom-left corner.
        </p>
      </div>
    ),
    source: 'PHB 2024',
    surfaceVariant: 'default',
    padding: 'md',
  },
};

export const WithActions: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold">Card with Actions</h3>
        <p className="text-sm text-text-secondary mt-1">
          Action buttons appear in the bottom-right corner.
        </p>
      </div>
    ),
    renderActions: () => (
      <>
        <button className="px-2 py-1 text-xs rounded bg-primary-500 text-white">Edit</button>
        <button className="px-2 py-1 text-xs rounded border border-border">Delete</button>
      </>
    ),
    surfaceVariant: 'default',
    padding: 'md',
  },
};

export const Clickable: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold">Clickable Card</h3>
        <p className="text-sm text-text-secondary mt-1">
          Click me! I have hover styles and keyboard accessibility.
        </p>
      </div>
    ),
    clickable: true,
    onClick: () => {},

    surfaceVariant: 'default',
    padding: 'md',
  },
};

export const WithGlow: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold">Card with Glow</h3>
        <p className="text-sm text-text-secondary mt-1">Decorative glow in the top-right corner.</p>
      </div>
    ),
    glow: true,
    surfaceVariant: 'default',
    padding: 'md',
  },
};

export const CustomGlow: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold">Custom Glow</h3>
        <p className="text-sm text-text-secondary mt-1">
          Using renderGlow to customize the glow content.
        </p>
      </div>
    ),
    renderGlow: () => <div className="w-16 h-16 rounded-full bg-purple-500 opacity-10" />,
    surfaceVariant: 'default',
    padding: 'md',
  },
};

export const Compact: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-base font-semibold">Compact Card</h3>
        <p className="text-xs text-text-secondary mt-0.5">Smaller gaps and padding.</p>
      </div>
    ),
    density: 'compact',
    padding: 'sm',
    surfaceVariant: 'default',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      {(['default', 'tint', 'selected', 'warning', 'info'] as const).map((variant) => (
        <CardSurface key={variant} surfaceVariant={variant} padding="md">
          <h3 className="text-lg font-semibold capitalize">{variant}</h3>
          <p className="text-sm text-text-secondary mt-1">Surface variant: {variant}</p>
        </CardSurface>
      ))}
    </div>
  ),
};

export const WithMetaItems: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold">Spell Card Example</h3>
        <p className="text-sm text-text-secondary mt-1">Using CardMetaItem for metadata display.</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
          <CardMetaItem icon={<Clock className="w-4 h-4" />} label="1 action" />
          <CardMetaItem icon={<Zap className="w-4 h-4" />} label="Self" />
          <CardMetaItem icon={<Star className="w-4 h-4" />} label="V, S, M" />
        </div>
      </div>
    ),
    source: 'PHB',
    surfaceVariant: 'default',
    padding: 'md',
  },
};

export const WithSourceSuffix: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-lg font-semibold">Collapsible Card</h3>
        <p className="text-sm text-text-secondary mt-1">
          With a collapse toggle in the source row.
        </p>
      </div>
    ),
    source: 'PHB 2024',
    renderSourceSuffix: () => (
      <button className="text-xs flex items-center gap-1 px-2 py-0.5 rounded hover:bg-surface-hover">
        <ChevronDown className="w-3 h-3" />
        Details
      </button>
    ),
    surfaceVariant: 'default',
    padding: 'md',
  },
};

export const FullExample: Story = {
  args: {
    children: (
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold">Fireball</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-600 border border-primary-500/20">
            Level 3
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          <CardMetaItem icon={<Clock className="w-4 h-4" />} label="1 action" />
          <CardMetaItem icon={<Zap className="w-4 h-4" />} label="150 feet" />
          <CardMetaItem icon={<Star className="w-4 h-4" />} label="V, S, M" />
          <CardMetaItem icon={<Clock className="w-4 h-4" />} label="Instantaneous" />
        </div>
        <p className="text-sm text-text-secondary mt-2 leading-relaxed">
          A bright streak flashes from your pointing finger to a point you choose within range and
          then blossoms with a low roar into a fiery explosion.
        </p>
      </div>
    ),
    source: 'PHB',
    glow: true,
    renderGlow: () => <div className="w-12 h-12 rounded-full bg-orange-500 opacity-10" />,
    renderActions: () => (
      <>
        <button className="px-2 py-1 text-xs rounded bg-primary-500 text-white">Prepare</button>
      </>
    ),
    clickable: true,
    onClick: () => {},
    surfaceVariant: 'default',
    padding: 'md',
  },
};
