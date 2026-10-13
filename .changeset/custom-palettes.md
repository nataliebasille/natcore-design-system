---
"@nataliebasille/natcore-design-system": minor
---

Add custom palette support via the `@natcore-palettes` at-rule.

Consumers can now define their own named palettes (beyond the built-in roles) that behave exactly like the built-ins — full anchor model (single color, 50/500/950 anchors, per-shade nudges, or a full ramp), `palette-{name}` / `bg-{name}-{shade}` / `text-on-{name}-{shade}` utilities, component modifiers, and per-shade tree-shaking.

- New `@natcore-palettes { … }` at-rule, expanded by a build-time transform.
- New `./postcss` and `./vite` plugin entry points (run before Tailwind). Both are
  emitted so a bare `require()` / `import` returns the plugin function directly
  (`require(".../postcss").postcss === true`), so they work as string-referenced
  plugins in a Next.js `postcss.config` with no local shim.
- Built-in palette generation refactored onto a shared generator so custom and built-in palettes stay identical; built-in CSS output is unchanged.
