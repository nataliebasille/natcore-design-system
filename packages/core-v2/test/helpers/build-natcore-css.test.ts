import { describe, expect, it } from "vitest";
import postcss from "postcss";
import {
  buildNatcoreCss,
  declarations,
  findDecls,
  minify,
  resolveVars,
  winsByLayer,
} from "./build-natcore-css.ts";

describe("buildNatcoreCss", () => {
  it("compiles the natcore bundle from source and flattens nesting", async () => {
    const root = await buildNatcoreCss(["tray-left"]);

    expect(
      declarations(root, { selector: ".tray-left", atRule: null }),
    ).toMatchObject({ position: "absolute", transform: "translateX(-100%)" });
    expect(declarations(root, { selector: ".tray-left[open]" })).toEqual({
      transform: "translate(0, 0)",
    });
    expect(
      declarations(root, { selector: '.tray-left [data-slot="toggle"]' }),
    ).toEqual({ display: "none" });
  });

  it("keeps breakpoint-prefixed classes inside their media query", async () => {
    const root = await buildNatcoreCss(["md:tray-right"]);

    expect(
      declarations(root, {
        selector: ".md\\:tray-right",
        atRule: "width >= 48rem",
      }),
    ).toMatchObject({ transform: "translateX(100%)" });
    expect(
      declarations(root, { selector: ".md\\:tray-right", atRule: null }),
    ).toEqual({});
  });

  it("reports the cascade layer of each declaration", async () => {
    const root = await buildNatcoreCss(["tray-left", "tray-open"]);

    expect(
      findDecls(root, { selector: ".tray-left", prop: "position" })[0]?.layer,
    ).toBe("utilities.components.base");
    expect(
      findDecls(root, { selector: ".tray-open", prop: "transform" })[0]?.layer,
    ).toBe("utilities.components");
  });

  it("ranks declarations by cascade layer", async () => {
    const root = await buildNatcoreCss(["dialog", "w-3xl", "max-w-none"]);
    const decl = (selector: string, prop: string) =>
      findDecls(root, { selector, prop, atRule: null }).find(
        (d) => d.layer !== "base", // skip preflight
      )!;

    // Directly in `utilities` beats the nested `utilities.components…`.
    expect(
      winsByLayer(root, decl(".w-3xl", "width"), decl(".dialog", "width")),
    ).toBe(true);
    expect(
      winsByLayer(root, decl(".dialog", "width"), decl(".w-3xl", "width")),
    ).toBe(false);
    // Sibling top-level layers: `utilities` is declared after `components`.
    expect(
      winsByLayer(root, decl(".w-3xl", "width"), decl("h1", "font-size")),
    ).toBe(true);
    // Same layer: decided by specificity and source order, not by layer.
    expect(
      winsByLayer(
        root,
        decl(".w-3xl", "width"),
        decl(".max-w-none", "max-width"),
      ),
    ).toBe(false);
  });

  it("ranks dotted layer names like the equivalent nesting", () => {
    const root = postcss.parse(
      "@layer utilities.alpha.base { .a { color: red } } @layer utilities.beta.base { .b { color: blue } }",
    );
    const [alpha] = findDecls(root, { selector: ".a" });
    const [beta] = findDecls(root, { selector: ".b" });

    expect(winsByLayer(root, beta!, alpha!)).toBe(true);
    expect(winsByLayer(root, alpha!, beta!)).toBe(false);
  });

  it("minify keeps declarations and their layers", async () => {
    const root = await buildNatcoreCss(["tray-left", "w-3xl"]);
    const minified = minify(root);

    expect(
      declarations(minified, { selector: ".tray-left", atRule: null }),
    ).toMatchObject({ position: "absolute" });
    expect(
      findDecls(minified, { selector: ".w-3xl", prop: "width" })[0]?.layer,
    ).toBe("utilities");
  });

  it("resolves size values whether inlined or referenced", async () => {
    const root = await buildNatcoreCss(["btn-size-lg"]);
    const size = declarations(root, { selector: ".btn-size-lg" })["--btn-size"];

    expect(resolveVars(root, size!)).toBe("1.25rem");
    expect(resolveVars(root, "var(--missing, 2px)")).toBe("2px");
  });
});
