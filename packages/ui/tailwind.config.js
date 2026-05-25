import { sharedTailwindConfig } from '@open20/config/tailwind/base';

/** @type {import('tailwindcss').Config} */
export default {
  ...sharedTailwindConfig,
  content: ['./src/**/*.{js,ts,jsx,tsx}', './.storybook/**/*.{js,ts,jsx,tsx,mdx}'],
};
