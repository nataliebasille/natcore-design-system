# Strongly Typed CSS Variables in Component DSL

## Overview

The component DSL now provides strongly typed autocomplete for CSS variables. When you use `cssvar()` inside `base` or `variants`, TypeScript will autocomplete with the keys defined in `vars`.

## Example

```typescript
import { component, cssvar } from "@nataliebasille/natcore-css-engine/dsl";

const buttonComponent = component("btn", {
  vars: {
    "size-base": "1rem",
    "bg-color": "#fff",
    "border-radius": "4px",
    "hover-bg": "#f0f0f0",
  },
  base: {
    // ✅ Autocomplete shows: "size-base", "bg-color", "border-radius", "hover-bg"
    padding: cssvar("size-base"),
    backgroundColor: cssvar("bg-color"),
    borderRadius: cssvar("border-radius"),
  },
  variants: {
    large: {
      // ✅ Autocomplete works in variants too
      padding: cssvar("size-base"),
    },
    hover: {
      backgroundColor: cssvar("hover-bg"),
    }
  }
});
```

## Type Safety

The implementation provides compile-time type checking:

```typescript
// ❌ Type error: "invalid-var" is not a key in vars
const invalidComponent = component("btn", {
  vars: {
    "size": "1rem",
  },
  base: {
    padding: cssvar("invalid-var"), // Error!
  }
});
```

## How It Works

1. The `component` function extracts the keys from the `vars` object
2. These keys are passed as a generic type parameter to `StyleProperties`
3. `StyleProperties` constrains `cssvar()` to only accept those keys
4. TypeScript autocomplete and type checking work throughout `base` and `variants`
