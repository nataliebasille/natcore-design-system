/**
 * Spec for the `code` component (code.css.ts): `code` is a full-width,
 * horizontally scrolling monospace block with a translucent surface tint (so
 * it shows on any container), and
 * `code-inline` is a small chip in running text. Bare `<code>` gets the `code` class.
 * Element rules sit in `components.base` and the classes in
 * `utilities.components.base`, so Tailwind utilities (e.g. `p-0`,
 * `rounded-none`) override them without `!`.
 */
import { describe, expect, it } from "vitest";
import {
  buildNatcoreCss,
  declarations,
  findDecls,
  winsByLayer,
} from "../../../../test/helpers/build-natcore-css.ts";

type Root = Awaited<ReturnType<typeof buildNatcoreCss>>;

const MONOSPACE =
  "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace";

describe("code", () => {
  it("is a full-width, horizontally scrolling monospace block with a translucent surface tint", async () => {
    const root = await buildNatcoreCss(["code", "p-4"]);

    expect(styles(root, ".code")).toEqual({
      display: "block",
      width: "100%",
      "overflow-x": "auto",
      "border-radius": "var(--radius-md)",
      "white-space": "pre",
      "line-height": "var(--leading-relaxed)",
      "background-color": expect.stringMatching(
        /^color-mix\(in srgb, .*surface-500.* 15%, transparent\)$/,
      ),
      padding: tailwindValue(root, ".p-4", "padding"),
      "font-family": MONOSPACE,
      "font-size": "0.875em",
    });
  });

  it("bare <code> is styled like .code", async () => {
    const root = await buildNatcoreCss(["code"]);

    expect(styles(root, "code")).toEqual(styles(root, ".code"));
  });

  it("code-inline is an inline chip with auto width, tight padding, and a small radius", async () => {
    const root = await buildNatcoreCss([
      "code",
      "code-inline",
      "py-0.5",
      "px-1.5",
    ]);

    expect(styles(root, ".code-inline")).toEqual({
      ...styles(root, ".code"),
      display: "inline",
      width: "auto",
      "white-space": "normal",
      padding: `${tailwindValue(root, ".py-0\\.5", "padding-block")} ${tailwindValue(root, ".px-1\\.5", "padding-inline")}`,
      "border-radius": "var(--radius-sm)",
    });
  });

  it("does not style Tailwind's display classes", async () => {
    const root = await buildNatcoreCss([
      "code",
      "inline",
      "inline-block",
      "inline-flex",
      "inline-grid",
    ]);

    expect(findDecls(root, { selector: /^(code|\.code)\.inline/ })).toEqual([]);
  });
});

describe("code cascade layer", () => {
  it.each([".code", ".code-inline"])(
    "%s is in the components base layer",
    async (selector) => {
      const root = await buildNatcoreCss(["code", "code-inline"]);

      expect(layers(root, selector)).toEqual(["utilities.components.base"]);
    },
  );

  it("bare <code> is in the components base layer", async () => {
    const root = await buildNatcoreCss([]);

    expect(layers(root, "code")).toEqual(["components.base"]);
  });

  it("never uses !important", async () => {
    const root = await buildNatcoreCss(["code", "code-inline"]);
    const important = findDecls(root, {
      selector: /^(code|\.code|\.code-inline)$/,
    }).filter((decl) => decl.important);

    expect(important).toEqual([]);
  });
});

describe("code overrides", () => {
  it.each([
    ["p-0", "padding"],
    ["w-auto", "width"],
    ["rounded-none", "border-radius"],
    ["whitespace-normal", "white-space"],
    ["bg-transparent", "background-color"],
    ["text-base", "font-size"],
    ["leading-none", "line-height"],
  ])("Tailwind %s overrides %s", async (cls, prop) => {
    const root = await buildNatcoreCss(["code", "code-inline", cls]);
    const [tailwind] = findDecls(root, { selector: `.${cls}`, prop });

    for (const selector of [".code", ".code-inline", "code"]) {
      const [component] = componentDecls(root, selector, prop);
      expect(winsByLayer(root, tailwind!, component!)).toBe(true);
    }
  });
});

/**
 * Last value per property, ignoring preflight and `--tw-*`, with the code
 * component's own theme variables (`--code-*`) substituted.
 */
function styles(root: Root, selector: string) {
  const theme = declarations(root, { selector: /(^|,\s*):root\b/ });
  const decls: Record<string, string> = {};
  for (const decl of findDecls(root, { selector, atRule: null })) {
    if (decl.layer === "base" || decl.prop.startsWith("--")) continue;
    decls[decl.prop] = decl.value.replace(
      /var\((--code-[\w-]+)\)/g,
      (match, name: string) => theme[name] ?? match,
    );
  }
  return decls;
}

/** Distinct cascade layers of every non-preflight declaration for a selector. */
function layers(root: Root, selector: string) {
  return [
    ...new Set(
      findDecls(root, { selector })
        .filter((decl) => decl.layer !== "base")
        .map((decl) => decl.layer),
    ),
  ];
}

function componentDecls(root: Root, selector: string, prop: string) {
  return findDecls(root, { selector, prop, atRule: null }).filter(
    (decl) => decl.layer !== "base",
  );
}

function tailwindValue(root: Root, selector: string, prop: string) {
  const [decl] = findDecls(root, { selector, prop });
  return decl!.value;
}
