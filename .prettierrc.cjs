/** @type {import('prettier').Config} */
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
};

module.exports = config;
