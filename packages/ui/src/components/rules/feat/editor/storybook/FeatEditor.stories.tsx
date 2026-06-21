import type { Meta, StoryObj } from '@storybook/react';
import { FeatEditor } from '../FeatEditor';
import type { Feat } from 'open20-core';

const meta: Meta<typeof FeatEditor> = {
  title: 'Rules/Feat/Editor',
  component: FeatEditor,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FeatEditor>;

const defaultFeat: Partial<Feat> = {
  id: 'alert',
  name: 'Alert',
  source: 'SRD 5.2',
  category: 'Origin',
  description:
    'Always on the lookout for danger, you gain the following benefits: Proficiency Bonus to Initiative rolls, and you can swap Initiative with an ally within 30 feet.',
  repeatable: false,
};

export const Default: Story = {
  args: {
    value: defaultFeat,
    onChange: (f) => console.log('Feat changed:', f),
  },
};

export const Empty: Story = {
  args: {
    onChange: (f) => console.log('Feat changed:', f),
  },
};

export const WithPrerequisites: Story = {
  args: {
    value: {
      ...defaultFeat,
      prerequisites: { level: 4 },
    },
    onChange: (f) => console.log('Feat changed:', f),
  },
};

export const Disabled: Story = {
  args: {
    value: defaultFeat,
    disabled: true,
  },
};

export const WithActions: Story = {
  args: {
    value: defaultFeat,
    onSubmit: (f) => alert(`Saved: ${f.name}`),
    onCancel: () => console.log('Cancelled'),
  },
};
