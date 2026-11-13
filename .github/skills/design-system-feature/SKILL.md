---
name: design-system-feature
description: 'Plan and build a natcore design-system feature with the repo''s test-first, approval-gated workflow. Use when adding or changing a core-v2 component, utility, or variant (e.g. a new dialog, tooltip, popover, or button variant), adding a css-engine DSL helper, or writing a component''s `<name>.docs.tsx` docs page, with Vitest and Playwright tests and a PR against develop.'
argument-hint: 'Describe the feature, e.g. "tooltip component" or "add a size modifier to badge"'
---

# Design-System Feature Workflow

Builds a feature end to end: questions → plan → failing tests → implementation → docs → verification → PR. This is the process used for the dialog component (PR #15); its files are the reference implementation throughout.

- [File map and commands](./references/file-map.md): where every piece goes and the verified commands.
- [Pitfalls](./references/pitfalls.md): problems already hit in this repo and how to avoid them.

## Ground rules (apply to every phase)

- **Ask, don't assume.** Use the `ask_user` tool for every decision. Phrase each field as an actual question. Explain any unfamiliar concept (API, attribute, term) _in the message_ before asking about it; never refer to an explanation you haven't written.
- **Tests before implementation.** Write the tests, run them, and confirm they fail _for the right reason_ (the feature is missing, not a broken harness) before writing feature code.
- **Approval gate.** After finishing each todo: stop, summarize what changed and the test results, and wait for explicit approval before starting the next todo.
- **Code layout.** Exported/main functions first; internal helper functions go at the **bottom** of the file as hoisted `function` declarations. Only constants and types may sit above the exports.
- **Use the DSL.** Write component CSS with css-engine DSL helpers (`dsl.select.*`, `dsl.primitive.*`, `dsl.cssvar`, `dsl.startingStyle`, `dsl.prefersReducedMotion`, …), not raw selector or value strings. If a needed helper is missing, add it to css-engine (test-first) instead of falling back to strings.
- **Prefer Tailwind over new classes.** Before adding a utility (sizes, spacing, blur, …), ask whether an existing Tailwind utility or variant already does it. Only add classes that encode something Tailwind can't.
- **Git.** Branch from `develop`, open the PR against `develop` (never `main`), use Conventional Commits (`feat:`, `fix:`, `chore:`), and include the `Co-authored-by: Copilot` trailer.

## Procedure

### 1. Plan (plan mode)

1. Explore the closest existing feature first (for overlays, start from `dialog`; for positional surfaces, `tray`; for tone/variant styling, `card` or `btn`). Read its `*.css.ts`, its docs page (`<name>.docs.tsx`), and tests. `button.docs.tsx` is the reference docs page.
2. Ask questions in focused rounds with `ask_user`:
   - **Scope:** which packages (core-v2 / css-engine / showcase-v2), what's in and out (e.g. no React component).
   - **API:** class names, variants vs utilities, defaults, how it composes with existing classes (e.g. surfaces come from `card-*`).
   - **Behavior:** states, animation, accessibility, browser-support fallbacks.
   - **Docs:** which sections and examples, which extra playground controls (palette, text, booleans) beyond the derived ones.
3. Write `plan.md` in the session folder: problem, decisions, todos, risks. Mirror the todos into the SQL `todos`/`todo_deps` tables.
4. Present the plan with `exit_plan_mode`. Iterate on feedback until approved.

Standard todo order (drop any that don't apply):

| #   | Todo                                   | Done when                                                              |
| --- | -------------------------------------- | ---------------------------------------------------------------------- |
| 1   | css-engine helpers: failing specs      | New `*.spec.ts` cases fail because the helper doesn't exist            |
| 2   | css-engine helpers: implement          | css-engine specs pass; css-engine rebuilt                              |
| 3   | core-v2 unit tests                     | `src/tailwind/components/<name>/<name>.test.ts` fails because the CSS isn't generated |
| 4   | Playwright e2e tests                   | `src/tailwind/components/<name>/<name>.e2e.spec.ts` fails because the CSS isn't generated |
| 5   | core-v2 CSS                            | All core-v2 unit and Playwright tests pass                             |
| 6   | Docs page (`<name>.docs.tsx`)          | `test/docs.test.ts` passes; page renders; screenshots checked          |
| 7   | CI updates (only if new test commands) | `actionlint` clean                                                     |
| 8   | Final verification                     | Every check in step 6 below passes                                     |

### 2. Unit tests first (core-v2 / css-engine)

- **core-v2:** create `packages/core-v2/src/tailwind/components/<name>/<name>.test.ts` (next to `<name>.css.ts`) using the harness in `packages/core-v2/test/helpers/build-natcore-css.ts` (`buildNatcoreCss`, `declarations`, `findDecls`, `flatten`, `resolveVars`). It compiles the real `natcore.css` from source through Tailwind, so it also catches a component that isn't imported in `natcore-base.css`. Model it on `src/tailwind/components/dialog/dialog.test.ts`.
- Assert behavior, not implementation details: generated rules per class, breakpoint variants (`atRule`), and **cascade layer** (`findDecls(...).layer`). Component bodies land in `utilities.components.base` and a component's own utilities in `utilities.components`; plain Tailwind utilities (layer `utilities`) beat both. `winsByLayer(root, tailwindDecl, componentDecl)` is how to prove "Tailwind can override this".
- **css-engine helpers:** add cases to the colocated spec (`internal/css-engine/src/dsl/ast/**/*.spec.ts`) and, if the helper affects compiled output, to `packages/core-v2/test/compile/module-to-css.test.ts`.
- Run, confirm every new test fails for the right reason, then stop for approval.

### 3. Playwright tests first (core-v2)

- Next to the component, create `packages/core-v2/src/tailwind/components/<name>/<name>.e2e.html` with the examples to exercise and `<name>.e2e.spec.ts` that mounts it with `loadFixture(page, new URL("./<name>.e2e.html", import.meta.url))` from `test/helpers/fixture-page.ts`. E2E tests are independent of showcase-v2. Put the **fixture contract** in the spec's header comment: every element id/attribute the tests rely on. Target elements by attributes the examples need anyway (`id`, `commandfor`, `aria-controls`).
- Cover real browser behavior the CSS tests can't: interaction, focus, geometry (`boundingBox`), computed styles (`getComputedStyle`), animation (`getAnimations()`), reduced motion (`page.emulateMedia`), and narrow viewports (`page.setViewportSize`).
- Every spec runs in Chromium and Firefox; import `test`/`expect` from `test/helpers/browser-test.ts` and pass `browsers("chromium", ...)` as the test details for a test that only applies to some browsers. Before relying on a browser feature, prove it works in the bundled browsers with a throwaway spec against `mountHtml(page, ...)`, then delete it.
- Run them; expect failures because the component's CSS doesn't exist yet. Stop for approval.

### 4. Implement the CSS

- Add `packages/core-v2/src/tailwind/components/<name>/<name>.css.ts` (each component gets its own folder) (default export: `component("<name>")`) and import it in `packages/core-v2/src/tailwind/natcore-base.css`.
- Iterate with `pnpm --filter ./packages/core-v2 test` and `pnpm --filter ./packages/core-v2 test:e2e` until green. Inspect the compiled output with `pnpm --filter ./packages/core-v2 build:css -- --file components/<name>.css.ts` and read `packages/core-v2/dist/components/<name>.css`.
- **Changing an existing component:** snapshot `packages/core-v2/dist` first, rebuild, and diff the CSS so every output change is intentional.
- Stop for approval.

### 5. Write the docs page

Create `packages/core-v2/src/tailwind/components/<name>/<name>.docs.tsx` next to `<name>.css.ts`, following `button/button.docs.tsx`. The page appears in the showcase sidebar and at `/components/<name>` as soon as the file exists; nothing in `showcase-v2` needs to change. Any `*.docs.tsx` under `packages/core-v2/src/` becomes a page: the URL and sidebar group come from its folders (`components/forms/select.docs.tsx` → `/components/forms/select`, under Components › Forms) and the label from `<Page title>`. Override with `<Page nav={{ label, group, order, path }}>` (`group: ""` for a top-level link; lower `order` sorts first).

```tsx
import { control, docsFor } from "@nataliebasille/css-engine";
import button from "./button.css.ts";

const { Page, Playground, Section, Example } = docsFor(button);

export default (
  <Page title="Button" description="…" atAGlance={<div>…</div>}>
    <Playground
      controls={{ palette: control.palette(["primary", "secondary"]) }}
      render={(v) => <button className={`btn-${v.variant}/${v.palette} btn-size-${v.size}`}>Button</button>}
    />
    <Section of="btn" description="…">
      <Example title="Solid">…</Example>
    </Section>
    <Section of="size" title="Sizes" description="…" vars={{ "--px": "…" }}>…</Section>
    <Section title="Overriding with Tailwind">…</Section>
  </Page>
);
```

- No JSX pragma: core-v2 compiles docs files with the preview JSX runtime. Helpers (icons, repeated markup) go **below** the export as `function` declarations.
- `Section of` takes the builder's components, utilities, `@slots`, and `@custom-variants`; `vars` takes its CSS variables. A section's `description` (and `title`) also feed the generated API reference, so write it once there. A `Section` without `of` needs a `title`.
- `Example` children are both the preview and the copyable HTML. Use `<ui>`/`<markup>`, `ui-div`, and `uiAttr()` for preview-only or code-only parts. `table` rows render beneath the example.
- `Playground` derives `variant` and each controlled value with presets (e.g. `size`) from the builder; `v` is typed. Add a palette with `control.palette([...])`, and other controls with `control.select/text/boolean`. Each helper takes its default, or an object to set labels: `control.select(options, { default, label, optionLabels })` (same for `palette`), `control.text({ default, label })`, `control.boolean({ default, label, offLabel, onLabel })`. Options without an `optionLabels` entry show their value. Override a derived control with `{ label, options, default, optionLabels }` or hide it with `false`.
- Every class must be written out literally somewhere in a docs file; see [pitfalls](./references/pitfalls.md).
- Run `pnpm --filter ./packages/core-v2 test`; `test/docs.test.ts` fails on authoring issues, classes with no CSS, and classes only built from templates.
- Check the page in the dev server (`pnpm dev`, see [file map](./references/file-map.md)). Take Playwright screenshots of key states and look at them; fix anything clipped, oversized, or misplaced. A red "authoring issues" box at the top of the page lists mistakes the test also reports.
- Stop for approval.

### 6. Verify

Run all of these, then delegate an independent review of the full diff to a `code-review` subagent:

- `pnpm test:core:2x` (release contract, css-engine tests, core build, export check)
- `pnpm --filter ./packages/core-v2 test` (includes `test/docs.test.ts`) and `pnpm --filter ./packages/core-v2 type-check`
- `pnpm --filter ./packages/core-v2 test:e2e` with `CI=true` (Chromium + Firefox)
- `pnpm exec eslint --no-warn-ignored <changed files>`
- `pnpm exec prettier --check --end-of-line auto <changed files>`; only fix files that were formatted at `HEAD` (see [pitfalls](./references/pitfalls.md))
- css-engine type-check if css-engine changed (`pnpm --filter @nataliebasille/css-engine type-check`; must report 0 errors)

### 7. Commit and open the PR

1. Confirm the branch is based on `origin/develop` (`git log --oneline origin/develop..HEAD` should list only this work). If it carries `main`-only release commits, ask before rebasing onto `develop`.
2. Commit with a Conventional Commits subject; `feat:` triggers a minor release bump once it reaches `main`.
3. Push, open the PR against `develop` with a description of what changed, why, reviewer notes, and verification results, then wait for `CI` (Unit tests, E2E tests) and the Vercel previews to pass.
4. Handle review comments test-first: add a failing test that reproduces the issue, fix, push.
