import { plugin } from "./wrapper";

/** @type {import('tailwindcss').Config} */
export const content = [
  "./app/**/*.{ts,tsx,mdx}",
  "./components/**/*.{ts,tsx}",
];

export const theme = {
  extend: {
    backgroundImage: {
      "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      "gradient-conic":
        "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
    },
  },
};

export const plugins = [plugin];
