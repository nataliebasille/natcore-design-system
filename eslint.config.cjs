const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/coverage/**",
      "**/*.d.ts",
    ],
  },
  {
    files: ["packages/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportDeclaration[source.value=/^\\.{1,2}/]:not([source.value=/\\.(?:[cm]?js|jsx|ts|tsx|json)$/])",
          message: "Relative imports must include a file extension (.ts/.tsx/.js/etc).",
        },
        {
          selector:
            "ExportNamedDeclaration[source.value=/^\\.{1,2}/]:not([source.value=/\\.(?:[cm]?js|jsx|ts|tsx|json)$/])",
          message: "Relative re-exports must include a file extension (.ts/.tsx/.js/etc).",
        },
        {
          selector:
            "ExportAllDeclaration[source.value=/^\\.{1,2}/]:not([source.value=/\\.(?:[cm]?js|jsx|ts|tsx|json)$/])",
          message: "Relative re-exports must include a file extension (.ts/.tsx/.js/etc).",
        },
      ],
    },
  },
];
