# File map and commands

Paths are relative to the repo root. Run commands from the repo root unless noted.

## Where things go

| Piece                          | Location                                                                                         | Notes                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component CSS                  | `packages/core-v2/src/tailwind/components/<name>.css.ts`                                         | Default export `component("<name>")`. Compiles to `dist/components/<name>.css`.                                                                     |
| Bundle registration            | `packages/core-v2/src/tailwind/natcore-base.css`                                                 | Add `@import "./components/<name>.css";`                                                                                                            |
| Plain CSS utilities / variants | `packages/core-v2/src/tailwind/utilities/*.css`, `variants/*.css`                                | Copied as-is; also imported in `natcore-base.css`. Not shown on docs pages.                                                                         |
| css-engine DSL helpers         | `internal/css-engine/src/dsl/ast/` (`selector.ts`, `at-rule.ts`, `cssvalue/css-functions.ts`, …) | Colocated `*.spec.ts`. Exported through `dsl`.                                                                                                      |
| css-engine component internals | `internal/css-engine/src/constructs/components/`                                                 | `compile-to-dsl.ts`, `component-builder.ts`, `types.ts`                                                                                             |
| CSS output conversion          | `packages/core-v2/src/compile/ts-to-css/`                                                        | `compile.ts` (`moduleToCss`), `dsl-to-css.ts`                                                                                                       |
| core-v2 unit tests             | `packages/core-v2/test/components/<name>.test.ts`                                                | Harness: `test/helpers/build-natcore-css.ts`. Example: `test/components/dialog.test.ts`.                                                            |
| Compile-level tests            | `packages/core-v2/test/compile/module-to-css.test.ts`                                            | For DSL features that change emitted CSS.                                                                                                           |
| Docs page                      | `showcase-v2/app/(docs)/_components/<name>/`                                                     | `doc.tsx`, `playground.tsx`, `<name>-playground-{client,controls,showcase-ui}.tsx`, `get-showcase.tsx`. Example: `_components/dialog/`.             |
| Docs routing                   | `showcase-v2/server/get-tailwind-modules.ts`                                                     | Lists every `*.css.ts` whose default export is a component builder. Route: `/components/<name>`. Needs the module, `doc.tsx`, and `playground.tsx`. |
| Docs types                     | `showcase-v2/types/showcase.d.ts`                                                                | `Documentation<T>`, `DocShowcaseEntry` (supports `table` rendered under the example).                                                               |
| Docs page renderer             | `showcase-v2/app/(docs)/[...designItem]/page.tsx`                                                | Shared `ShowcaseEntry`.                                                                                                                             |
| React attribute typings        | `showcase-v2/types/*.d.ts`                                                                       | e.g. `invoker-commands.d.ts` for attributes missing from `@types/react`.                                                                            |
| Playwright tests               | `packages/core-v2/src/tailwind/components/<name>.e2e.spec.ts` + `<name>.e2e.html` (next to `<name>.css.ts`) | Config: `packages/core-v2/playwright.config.ts` (Chromium + Firefox, matches `**/*.e2e.spec.ts`). `test/helpers/fixture-page.ts` mounts a fixture with natcore compiled from source. |
| CI                             | `.github/workflows/ci.yml`                                                                       | Unit tests + E2E on PRs to `develop`.                                                                                                               |

## Commands

| Purpose                                                                   | Command                                                                                                    |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Install (also builds css-engine + core-v2 CSS via postinstall)            | `pnpm install`                                                                                             |
| css-engine tests                                                          | `pnpm --filter @nataliebasille/css-engine test`                                                            |
| Rebuild css-engine (needed before core-v2 tests/showcase see new helpers) | `pnpm --filter @nataliebasille/css-engine build`                                                           |
| core-v2 tests                                                             | `pnpm --filter ./packages/core-v2 test`                                                                    |
| core-v2 type-check                                                        | `pnpm --filter ./packages/core-v2 type-check`                                                              |
| Rebuild core-v2 CSS (all / one file)                                      | `pnpm --filter ./packages/core-v2 build:css` / `... build:css -- --file components/<name>.css.ts`          |
| Showcase dev server (http://localhost:3001)                               | `cd showcase-v2; pnpm dev`                                                                                 |
| E2E (Chromium + Firefox; what CI runs)                                    | `pnpm --filter ./packages/core-v2 test:e2e`                                                                |
| E2E, one browser                                                          | `pnpm --filter ./packages/core-v2 test:e2e --project=firefox`                                              |
| Install Playwright browsers (first time)                                  | `pnpm --filter ./packages/core-v2 exec playwright install chromium firefox`                                |
| Release check for the published package                                   | `pnpm test:core:2x`                                                                                        |
| Lint changed files                                                        | `pnpm exec eslint --no-warn-ignored <files>`                                                               |
| Format check                                                              | `pnpm exec prettier --check --end-of-line auto <files>`                                                    |
| Lint a workflow                                                           | `actionlint .github/workflows/ci.yml` (download the binary with `gh release download -R rhysd/actionlint`) |

## Formatting configs

- Root `.prettierrc.cjs` (double quotes, semicolons): `packages/`, `internal/`, root files.
- `showcase-v2/prettier.config.mjs` (single quotes, no semicolons, width 100): showcase-v2 component files. Some older showcase-v2 files (e.g. `[...designItem]/page.tsx`) match neither config; edit those by hand without reformatting.
