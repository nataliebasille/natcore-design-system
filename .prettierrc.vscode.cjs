/** @type {import('prettier').Config} */
const path = require("path");
const config = {
  arrowParens: "always",
  printWidth: 80,
  singleQuote: false,
  jsxSingleQuote: false,
  semi: true,
  trailingComma: "all",
  tabWidth: 2,
  embeddedLanguageFormatting: "off",
  experimentalTernaries: true,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["classnames", "clsx", "cn"],
  overrides: [
    {
      files: ["showcase-v2/**"],
      options: {
        tailwindStylesheet: path.join(__dirname, "showcase-v2", "app", "globals.css"),
      },
    },
  ],
};

module.exports = config;
