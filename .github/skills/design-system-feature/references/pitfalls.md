# Pitfalls

Each of these cost time while building the dialog component. Check the relevant ones before each phase.

## css-engine / core-v2 CSS

- **`.defaultVariant()` can create a circular `@apply`.** If the bare class (`dialog`) and the variants (`dialog-*`) share a root, `.defaultVariant("center")` emits `@utility dialog { @apply dialog-center }`, which Tailwind rejects. Use `.optionalVariants()` and put the default values in `.vars()` instead.
- **Numeric values can be dropped.** `opacity: 0` (a number) disappears from the output. Use strings: `opacity: "0"`.
- **New DSL helpers need a css-engine rebuild.** core-v2 and the showcase import css-engine's built `dist`, so run `pnpm --filter @nataliebasille/css-engine build` after adding a helper, or core-v2 tests fail with "x is not a function".
- **At-rules go in the body, not string keys.** Pass `dsl.startingStyle(...)`, `dsl.prefersReducedMotion(...)`, etc. as body arguments rather than `"@starting-style"` keys in `$`.
- **Cascade layers.** Inside `@layer utilities`, component bodies (static, dynamic, themeable, derived) compile into `@layer components { @layer base { … } }` (`utilities.components.base`), and `.utility()`/`.controlled()` utilities into `@layer components` (`utilities.components`). Styles directly in a layer beat its nested layers, so plain Tailwind utilities beat component utilities, which beat bodies, regardless of specificity or candidate order. Element defaults from `.applyTo()` land in the top-level `components.base`. Don't wrap utilities in `dsl.layer.*` by hand. Test with `findDecls(...).layer` and `winsByLayer(...)`; `test/cascade-layers.test.ts` covers each compiler path on raw and minified output.
- **Avoid `!important` in components.** `!important` reverses layer order: an important declaration in a nested layer beats important ones in outer layers, so a component's `!important` would beat a user's `!` utility. Rank with layers and specificity instead.
- **Refactors must not change output.** Before changing the compiler or an existing component, copy `packages/core-v2/dist`, rebuild, and diff every `.css` file.
- **css-engine type-check must stay clean.** It reports 0 errors and `pnpm test:core:2x` runs it, so any new error fails the release check.

## Tests

- **Vitest can stall on re-imports.** The harness caches compiled stylesheets per process; don't add cache-busting query strings to imports in tests.
- **Prove the harness before trusting a red test.** When adding helper functionality, add a passing test against an existing component (tray, button) so a failing feature test can't be a harness bug.
- **Computed colors are `oklab(...)`.** Tailwind v4 colors don't come back as `rgba(...)`. Compare alpha/opacity, not exact color strings.
- **The showcase only has `tablet` and `desktop` breakpoints** (no `sm`/`md`), but `test/docs.test.ts` and e2e fixtures build with Tailwind's default breakpoints (no `tablet`). No named breakpoint works in both, so in docs files use breakpoint-free layouts (`grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]`) or arbitrary ones (`min-[48rem]:dialog-center`).
- **E2E specs never touch showcase-v2.** Each `*.e2e.spec.ts` sits next to the file it covers and mounts its sibling `*.e2e.html` fixture with `page.setContent`; the stylesheet is compiled from core-v2 source for the classes in the fixture, so there's no server or build step. The body gets `palette-surface` so `card-*` surfaces have colors. Vitest excludes `*.e2e.spec.ts`; Playwright runs only those.
- **Every spec runs in Chromium and Firefox.** Import `test`/`expect` from `test/helpers/browser-test.ts`. `test(...)` runs in every browser; `test("title", browsers("chromium"), fn)` or `browsers("chromium", "webkit")` skips the other browsers automatically (typed, so typos don't compile). Limit a test only for a documented platform gap (e.g. Firefox lacks `transition-property: overlay`), and keep the rest of the behavior covered in all browsers.

## Showcase docs

- **Write every class out literally.** The showcase's Tailwind build finds classes by scanning source text. A class only built from a template (`btn-${v.variant}/${v.palette}` in a playground `render`) renders unstyled unless the exact class also appears somewhere in a docs file, usually in an example. `test/docs.test.ts` fails with the class and where it's used; add an example (or narrow the control's options) rather than an allowlist entry.
- **Docs live outside the showcase app.** `showcase-v2/app/globals.css` has `@source "../../packages/core-v2/src/**/*.docs.tsx"` so Tailwind scans them. Without it, every class only used by docs renders unstyled.
- **The showcase build needs at least one `*.docs.tsx` under `packages/core-v2/src/`.** The docs index and playground import docs files with a template (``import(`…/core-v2/src/${path}.docs.tsx`)``); with zero matching files Turbopack fails with "Module not found". Don't delete the last docs file, and keep docs files under `src/` (files elsewhere are neither pages nor tested).
- **Two docs files can't share a URL.** `tailwind/components/button.docs.tsx` and `tailwind/components/button/button.docs.tsx` both resolve to `/components/button`; `test/docs.test.ts` fails and names both. Change a folder or set `<Page nav={{ path }}>`.
- **`toDocModel` reports, it doesn't throw.** A misplaced `<Example>`, a nested `<Section>`, a second `<Playground>`, an `of` key the builder no longer has, or a playground control with no options is skipped, falls back, or is rendered plainly, and is listed in `model.issues`; the page shows them in a red box and `test/docs.test.ts` fails on them. Helper components (e.g. `function SizeExamples() { return <Example>…</Example> }`) are expanded first, so markers they return are placed and checked as if written inline.
- **Docs pages render inside an `<article>`.** Article and heading defaults (margins, sizes) apply to every example. They sit in the `components.base` layer, so Tailwind utilities override them; to reset spacing in a preview without touching the copyable snippet, put `*:m-0` on a `ui-div` wrapper.
- **`<code>` is block-level.** Inline code in docs text needs `<code className="inline">`.
- **Preview vs. snippet.** In docs JSX, `ui-*` elements (e.g. `<ui-div>`) render only in the live preview, and `<markup>` content only in the code snippet. Use this for wrappers that shouldn't appear in copyable code.
- **No React event handlers in examples.** Examples are server-rendered. For script-driven examples, render the same HTML into both preview and snippet (see `ScriptTrigger` in the dialog docs).
- **Unknown attributes need types, not camelCase.** React warns on `commandFor`; use lowercase attributes and add them to `PendingHtmlAttributes` in `internal/preview-jsx-runtime/src/jsx-runtime.ts`, then rebuild the runtime.
- **Prettier trims spaces inside `className` templates.** The Tailwind Prettier plugin treats a `className={`…`}` template as a class list, so `${v.hover ? " card-hover" : ""}` loses its leading space and two classes merge. Build conditional classes in a variable or with `[…].filter(Boolean).join(" ")`; `test/docs.test.ts` catches the merged class.
- **Fallback examples must work without the feature they fall back from.** For example, the JavaScript `showModal()` example closes with `<form method="dialog">`, not `command="close"`.
- **Explain in context.** Put reference tables beneath the example they describe (`<Example table={…}>`), not in the section header. Keep shared copy (like the installation page) generic so it doesn't need editing for every new component.

## Dev environment

- **`pnpm dev` doesn't rebuild core-v2 CSS.** Its predev filter resolves from `showcase-v2/` and matches nothing. After editing `*.css.ts`, run `pnpm --filter ./packages/core-v2 build:css` from the repo root.
- **Stopping servers on Windows can leave orphans.** After stopping `next start`/`next dev`, check the port (`Get-NetTCPConnection -LocalPort <port>`) and stop leftovers by PID, only if the command line points at this worktree.
- **Port 3001 may belong to another worktree.** If `pnpm dev` fails with `EADDRINUSE`, don't stop the other server; run `pnpm exec next dev -p 3011` from `showcase-v2/` (after building core-v2 CSS yourself).
- **A fresh worktree needs its packages built first.** Run `pnpm --filter "@nataliebasille/natcore-*" build` before `next dev`; otherwise the showcase fails on `dist/postcss.cjs` or `natcore-icons`. If a server already started without them, stop it and delete `showcase-v2/.next`, or Turbopack keeps serving the cached error.
- **Prettier on Windows reports every file** because of CRLF. Always pass `--end-of-line auto`. Several files were unformatted before this work; check `HEAD`'s version before reformatting a whole file.
