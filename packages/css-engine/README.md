# Natcore CSS Engine

CSS engine for the Natcore Design System, providing a DSL and transformers for CSS generation.

## Features

- **CSS DSL**: Domain-specific language for defining CSS in TypeScript
- **Transformers**: Convert DSL to various CSS formats (Tailwind v4, etc.)
- **Type-safe**: Full TypeScript support with type definitions

## Installation

```bash
pnpm add @nataliebasille/natcore-css-engine
```

## Usage

### CSS DSL

```typescript
import { dsl } from "@nataliebasille/natcore-css-engine/dsl";

const styles = dsl.styles({
  // Your styles here
});
```

### Transformers

```typescript
import { tailwindv4 } from "@nataliebasille/natcore-css-engine/transformers";

const css = tailwindv4(styles);
```

## License

MIT
