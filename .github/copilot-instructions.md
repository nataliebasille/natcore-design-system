# Natcore Design System - AI Agent Instructions

## Architecture Overview

This is a **monorepo design system** with three main packages and a Next.js showcase app:

- `packages/core`: Tailwind CSS plugin with themes, colors, and component styles
- `packages/react`: React components using design system classes 
- `packages/icons`: SVG icon components
- `showcase`: Next.js documentation site demonstrating components

**Key Integration**: The design system uses a custom Tailwind plugin (`packages/core/src/plugin.ts`) that generates CSS variables and utility classes based on color schemas defined in `packages/core/src/themes/colors.ts`.

## Development Workflow

### Building & Running
```bash
# Build all packages
pnpm build

# Start showcase dev server (automatically includes all packages)
pnpm dev

# Clean all build artifacts
pnpm clean
```

**Critical**: Always run `pnpm build` after modifying core packages before testing in showcase, as it uses workspace dependencies.

### Package Structure
- Each package has its own `tsup.config.ts` for building multiple entry points
- Core package exports: `index`, `plugin`, and `utils` as separate modules
- React components import from `@natcore/design-system-core` and use `classnames` for conditional classes

## Design System Patterns

### Color System Architecture
Colors are defined in `packages/core/src/themes/colors.ts` as:
```typescript
primary: toRgb("#230288"),
surface: {
  color: toRgb("#ebe0ff"),
  shade: 200,
  variables: { border: "300" }
}
```

The plugin auto-generates 10 shades (50-900) plus contrast text colors, creating CSS variables like `--primary-500`, `--primary-500-text`.

### Component Theme Pattern
All component styles follow this pattern in `packages/core/src/themes/components/`:
1. Import `createVariants` helper
2. Define component-specific CSS variables using color variants
3. Export function that takes Tailwind theme and returns style object

### React Component Pattern
React components in `packages/react/src/` follow:
1. Use `forwardRef` for proper ref handling
2. Define props extending HTML element props
3. Use `classnames` for conditional CSS classes
4. Map props to design system class names (e.g., `btn-primary`, `btn-lg`)

### Showcase Documentation Pattern
Each component page in `showcase/app/components/[component]/` includes:
- `page.tsx`: Main documentation with playground
- `ButtonPlaygroundExample.tsx`: Interactive component demo
- `examples/`: Static HTML examples
- Uses `generateThemeInfo()` to display available CSS classes

## File Naming Conventions

- **Packages**: Use `kebab-case` for file names, `PascalCase` for React components
- **Showcase**: Next.js App Router with `page.tsx` files, `+folder` for shared layouts
- **Components**: Match component name (e.g., `Button.tsx` → `btn` CSS classes)

## Key Integration Points

### Tailwind Configuration
`showcase/wrapper.ts` imports and configures the core plugin:
```typescript
import natcorePlugin from "../packages/core/src/plugin";
export const plugin = natcorePlugin();
```

### Workspace Dependencies
`showcase/package.json` uses `workspace:*` for local packages, allowing development without publishing.

### Build System
- Core uses `tsup` to output `.mjs` (ESM) and `.cjs` (CommonJS) with TypeScript declarations
- Builds are required before showcase can use updated packages
- No hot-reloading between packages - requires rebuild

## Common Gotchas

1. **Missing builds**: Showcase won't reflect core changes until `pnpm build`
2. **Path resolution**: Showcase uses absolute imports from workspace packages, not relative paths
3. **CSS variables**: Component styles depend on plugin-generated variables - check `wrapper.ts` integration
4. **File imports**: Use `.ts` extensions in imports (handled by bundler)