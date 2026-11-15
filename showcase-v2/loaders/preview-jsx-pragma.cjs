// Turbopack loader: *.docs.tsx files are written for the preview JSX runtime
// (configured in packages/core-v2/tsconfig.json), but showcase-v2 compiles
// everything else with React, so add the per-file pragma at build time.
module.exports = function previewJsxPragma(source) {
  return `/** @jsxImportSource @nataliebasille/preview-jsx-runtime */\n${source}`
}
