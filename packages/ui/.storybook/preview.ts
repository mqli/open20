import type { Preview } from '@storybook/react';
import { createStorybookPreview } from '@open20/config/storybook';
import '@open20/config/storybook/preview.css';

const preview: Preview = createStorybookPreview();

export default preview;
