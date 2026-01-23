module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        "last 2 chrome versions",
        "last 2 firefox versions",
        "last 2 safari versions",
      ],
      // Disable color space transformations to preserve OKLCH
      ignoreUnknownDeclarations: true,
    },
  },
};
