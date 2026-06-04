import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterChip } from '../../FilterChip';

const meta = {
  title: 'Components/FilterChip',
  component: FilterChip,
  args: {
    children: 'Concentration',
    variant: 'secondary',
    size: 'md',
    active: false,
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [active, setActive] = useState(args.active ?? false);

    return (
      <FilterChip {...args} active={active} onPressedChange={setActive}>
        {args.children}
      </FilterChip>
    );
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <FilterChip {...args} variant="secondary">
        Secondary
      </FilterChip>
      <FilterChip {...args} variant="primary" active>
        Primary
      </FilterChip>
      <FilterChip {...args} variant="success">
        Success
      </FilterChip>
      <FilterChip {...args} variant="warning">
        Warning
      </FilterChip>
      <FilterChip {...args} variant="danger">
        Danger
      </FilterChip>
      <FilterChip {...args} variant="info">
        Info
      </FilterChip>
    </div>
  ),
};
