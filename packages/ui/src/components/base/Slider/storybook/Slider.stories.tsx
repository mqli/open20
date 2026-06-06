import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Slider } from '../../Slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  args: {
    min: 0,
    max: 20,
    step: 1,
    value: [8],
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState<number[]>(args.value ?? [8]);

    return (
      <div className="w-[320px] space-y-3">
        <Slider {...args} value={value} onValueChange={setValue} />
        <p className="text-sm text-text-secondary">Value: {value[0]}</p>
      </div>
    );
  },
};
