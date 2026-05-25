import { sharedTailwindConfig } from '@open20/config/tailwind/base';

/** @type {import('tailwindcss').Config} */
export default {
  ...sharedTailwindConfig,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../ui/src/**/*.{js,ts,jsx,tsx}',
  ],
};
