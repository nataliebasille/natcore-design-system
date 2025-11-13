# Natcore Design System v2

A modern design system built for **Tailwind CSS 4.0**.

## Overview

This is version 2 of the Natcore Design System, specifically designed to work with Tailwind CSS 4.0 and its new features. This package provides the core theme, utilities, and plugin for the design system.

## Installation

```bash
npm install @nataliebasille/natcore-design-system-v2
# or
pnpm add @nataliebasille/natcore-design-system-v2
# or
yarn add @nataliebasille/natcore-design-system-v2
```

## Requirements

- **Tailwind CSS 4.0+** (peer dependency)
- **Node.js 18+**
- **TypeScript 5.0+** (recommended)

## Usage

### Basic Setup

```typescript
import natcorePlugin from "@nataliebasille/natcore-design-system-v2";

// Use with Tailwind CSS 4.0 configuration
export default {
  plugins: [
    natcorePlugin({
      // Plugin options
      prefix: "",
      darkMode: "class",
    }),
  ],
};
```

### Alternative Import Patterns

```typescript
// Named import from main package
import { natcorePlugin } from "@nataliebasille/natcore-design-system-v2";

// Direct import from plugin module
import { natcorePlugin } from "@nataliebasille/natcore-design-system-v2/plugin";

// Default import from plugin module
import natcorePlugin from "@nataliebasille/natcore-design-system-v2/plugin";
```

### CSS Import

```css
@import "@nataliebasille/natcore-design-system-v2/css";
```

### Utilities

```typescript
import { cn, mergeClasses } from "@nataliebasille/natcore-design-system-v2";

// Use utility functions
const classes = cn("base-class", {
  "conditional-class": condition,
});
```

## Development

This package is part of the Natcore Design System monorepo.

### Building

```bash
pnpm build
```

### Development Mode

```bash
pnpm dev
```

### Type Checking

```bash
pnpm type-check
```

## What's New in v2

- **Tailwind CSS 4.0 Support**: Built specifically for the latest Tailwind CSS
- **Modern ESM**: Full ESM support with proper CommonJS fallbacks
- **Enhanced Type Safety**: Improved TypeScript definitions
- **Performance Optimizations**: Better tree-shaking and bundle size
- **New CSS Architecture**: Leveraging Tailwind CSS 4.0's new features

## Migration from v1

Documentation for migrating from v1 to v2 will be provided as the system develops.

## License

MIT
