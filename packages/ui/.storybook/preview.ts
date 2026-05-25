import type { Preview } from '@storybook/react';
import { createStorybookPreview } from '@open20/config/storybook';
import '../src/styles/storybook.css';

const preview: Preview = createStorybookPreview();

export default preview;
