# Natcore Design System - AI Agent Instructions

## Git Workflow

- **`develop` is the base branch for all work. `main` is release-only** (version
  bumps and tags land there through release PRs); never commit features to it.
- Create feature/fix branches from `develop`.
- **Open every pull request against `develop`** unless the user explicitly asks for
  a different base. Never target `main` directly.

### GitHub CLI authentication

`gh` is not logged in on this machine (`gh auth status` reports no hosts), and the
user-scope `GITHUB_TOKEN` env var is stale (GitHub returns HTTP 401). `git push` works
through Git Credential Manager, so reuse that credential for `gh` commands. Do not
give up and hand the user a compare URL.

```powershell
$cred = "protocol=https`nhost=github.com`n`n" | git credential fill 2>$null
$env:GH_TOKEN = ($cred | Select-String '^password=').Line -replace '^password=',''
gh pr create --base develop --head <branch> --title "<title>" --body-file <file>
```

- Set `GH_TOKEN` in the same command as the `gh` call; env vars don't persist between
  tool calls.
- Never print, log, or commit the token.

## Architecture Overview

This is a **monorepo design system** for Tailwind CSS 4:

- `packages/core-v2`: The published `@nataliebasille/natcore-design-system` package — compiled CSS (themes, components, utilities), plus `./utils`, `./postcss`, and `./vite` entry points
- `packages/react`: React components using design system classes
- `packages/icons`: SVG icon components
- `internal/css-engine`: Private DSL/compiler used to author `core-v2` styles (bundled into the published build)
- `internal/preview-jsx-runtime`: Private JSX runtime used for showcase previews
- `showcase-v2`: Next.js documentation site demonstrating components

## Development Workflow

### Building & Running

```bash
# Build the showcase (builds all natcore-* packages first)
pnpm build

# Start the showcase dev server
pnpm dev

# Clean all build artifacts
pnpm clean

# Type-check every workspace package (CI runs this; build the libraries first)
pnpm --filter "@nataliebasille/natcore-*" build
pnpm type-check
```

`vitest run` does not type-check, so passing tests do not mean the code compiles.
Run `pnpm type-check` before opening a PR.

**Critical**: `showcase-v2` consumes workspace packages through `workspace:*`, so rebuild `core-v2` (`pnpm --filter ./packages/core-v2 build:css`) after changing its styles.

### Package Structure

- Each package has its own `tsup.config.ts` for its JS entry points
- `core-v2` exports: `.`/`./css` (`natcore.css`), `./utils`, `./postcss`, and `./vite`
- React components use `classnames` for conditional classes

## Design System Patterns

### Core Styles

Styles live in `packages/core-v2/src/tailwind/` (`components/`, `typography/`, `utilities/`, `themes/`, `variants/`) as `*.css.ts` files authored with the `@nataliebasille/css-engine` DSL and compiled to CSS by `packages/core-v2/src/compile/`. `natcore.css` is the stylesheet entry point. Each component lives in its own folder (`components/<name>/<name>.css.ts`, `typography/<name>/<name>.css.ts`) alongside its tests (`<name>.test.ts`, `<name>.e2e.spec.ts`, `<name>.e2e.html`). Element defaults (e.g. `h1`, `article`) come from the builder's `.applyTo(selector, variant?)`, which puts them in the `components.base` layer so Tailwind utilities override them. Inside `@layer utilities`, component bodies compile to `components.base` and a component's `.utility()`/`.controlled()` utilities to `components`, so plain Tailwind utilities beat component utilities, which beat bodies.

### React Component Pattern

React components in `packages/react/src/` follow:

1. Use `forwardRef` for proper ref handling
2. Define props extending HTML element props
3. Use `classnames` for conditional CSS classes
4. Map props to design system class names (e.g., `btn-primary`, `btn-lg`)

### Showcase Documentation Pattern

Each component in `showcase-v2/app/(docs)/_components/[component]/` includes a `doc.tsx` plus optional playground files (`playground.tsx`, `*-playground-client.tsx`, `*-playground-controls.tsx`, `get-showcase.tsx`).

## File Naming Conventions

- **Packages**: Use `kebab-case` for file names, `PascalCase` for React components
- **Showcase**: Next.js App Router with `page.tsx` files
- **Components**: Match component name (e.g., `Button.tsx` → `btn` CSS classes)

## Key Integration Points

### Tailwind Configuration

`showcase-v2/app/globals.css` imports the stylesheet, and `showcase-v2/postcss.config.js` registers the `@nataliebasille/natcore-design-system/postcss` plugin (which expands `@natcore-palettes`).

### Build System

- `core-v2` uses `tsup` to output `.js` (ESM) and `.cjs` (CommonJS) with TypeScript declarations, and its compile step emits CSS into `dist/`
- No hot-reloading between packages - requires rebuild

## Common Gotchas

1. **Missing builds**: The showcase won't reflect `core-v2` changes until it's rebuilt
2. **Private packages**: `internal/*` packages are not published; anything the published build needs from them must be bundled (`noExternal`)
3. **File imports**: Use `.ts` extensions in relative imports (enforced by ESLint)
