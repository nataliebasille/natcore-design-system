// With Tailwind CSS 4.0, configuration is done in CSS using @plugin and @import
// However, JavaScript plugins still need to be registered in the config file

import { natcorePlugin } from '@nataliebasille/natcore-design-system-v2/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "../packages/core-v2/src/**/*.css",
  ],
  plugins: [
    natcorePlugin(),
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
}
