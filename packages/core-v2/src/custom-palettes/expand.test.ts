import { describe, it, expect } from "vitest";
import path from "node:path";
import {
  expandNatcorePalettesInCss,
  inlineNatcorePaletteImports,
  type InlineImportsOptions,
} from "./expand.ts";

describe("expandNatcorePalettesInCss", () => {
  it("expands a real @natcore-palettes block into @theme output", () => {
    const css = `@natcore-palettes {\n  pumpkin: #e87a01;\n}\n`;
    const out = expandNatcorePalettesInCss(css);

    expect(out).not.toContain("@natcore-palettes");
    expect(out).toContain("--theme-pumpkin");
    expect(out).toContain("#e87a01");
  });

  it("ignores the token inside a comment and preserves the comment verbatim", () => {
    const comment =
      "/* Our brand palettes use the @natcore-palettes at-rule. */";
    const css = `${comment}\n@natcore-palettes {\n  pumpkin: #e87a01;\n}\n`;
    const out = expandNatcorePalettesInCss(css);

    // The comment survives unchanged.
    expect(out).toContain(comment);
    // The real block still expands.
    expect(out).toContain("--theme-pumpkin");
    expect(out).toContain("#e87a01");
    // No at-rule token leaks through outside the preserved comment.
    expect(out.replace(comment, "")).not.toContain("@natcore-palettes");
  });

  it("leaves a stylesheet untouched when the token only appears in a comment", () => {
    const css = `/* see @natcore-palettes docs */\n.foo { color: red; }\n`;
    const out = expandNatcorePalettesInCss(css);

    expect(out).toBe(css);
  });

  it("ignores the token inside a string value", () => {
    const css = `.note::before { content: "@natcore-palettes { brand: red; }"; }\n`;
    const out = expandNatcorePalettesInCss(css);

    expect(out).toBe(css);
  });

  it("does not treat an escaped quote in a selector as a string start", () => {
    const selector = `.foo\\"bar { color: red; }`;
    const css = `${selector}\n@natcore-palettes {\n  pumpkin: #e87a01;\n}\n`;
    const out = expandNatcorePalettesInCss(css);

    // The selector with the escaped quote survives verbatim.
    expect(out).toContain(selector);
    // The real block after it still expands.
    expect(out).toContain("--theme-pumpkin");
    expect(out).toContain("#e87a01");
    expect(out).not.toContain("@natcore-palettes");
  });

  it("ignores an escaped at-rule token in a selector", () => {
    const selector = `.x\\@natcore-palettes { color: red; }`;
    const css = `${selector}\n.y { color: blue; }\n`;
    const out = expandNatcorePalettesInCss(css);

    expect(out).toBe(css);
  });

  it("expands multiple real blocks that follow a comment mention", () => {
    const comment = "/* configure with @natcore-palettes */";
    const css =
      `${comment}\n` +
      `@natcore-palettes {\n  pumpkin: #e87a01;\n}\n` +
      `.spacer { margin: 0; }\n` +
      `@natcore-palettes {\n  seafoam: #2ec4b6;\n}\n`;
    const out = expandNatcorePalettesInCss(css);

    expect(out).toContain(comment);
    expect(out).toContain(".spacer");
    expect(out).toContain("--theme-pumpkin");
    expect(out).toContain("#e87a01");
    expect(out).toContain("--theme-seafoam");
    expect(out).toContain("#2ec4b6");
    expect(out.replace(comment, "")).not.toContain("@natcore-palettes");
  });

  it("handles a comment mention sitting between two real blocks", () => {
    const comment = "/* next block also uses @natcore-palettes */";
    const css =
      `@natcore-palettes {\n  pumpkin: #e87a01;\n}\n` +
      `${comment}\n` +
      `@natcore-palettes {\n  seafoam: #2ec4b6;\n}\n`;
    const out = expandNatcorePalettesInCss(css);

    expect(out).toContain(comment);
    expect(out).toContain("--theme-pumpkin");
    expect(out).toContain("--theme-seafoam");
    expect(out.replace(comment, "")).not.toContain("@natcore-palettes");
  });
});

/**
 * Build in-memory `resolveImport`/`readFile` callbacks over a `path -> contents`
 * map so the inliner can be exercised without touching the filesystem. Relative
 * paths resolve against the importing file; bare specifiers with a subpath map
 * to `/project/node_modules/<spec>`; bare entry specifiers resolve to `null`.
 */
function createFs(
  files: Record<string, string>,
): Pick<InlineImportsOptions, "resolveImport" | "readFile"> {
  const resolveImport: InlineImportsOptions["resolveImport"] = (
    spec,
    fromFile,
  ) => {
    const clean = spec.replace(/[?#].*$/, "").trim();
    if (!clean) return null;

    if (
      clean.startsWith("./") ||
      clean.startsWith("../") ||
      clean.startsWith("/")
    ) {
      const base = fromFile ? path.posix.dirname(fromFile) : "/project";
      const resolved = path.posix.resolve(base, clean);
      return resolved in files ? resolved : null;
    }

    const hasSubpath =
      clean.startsWith("@") ? clean.split("/").length > 2 : clean.includes("/");
    if (!hasSubpath) return null;
    const resolved = `/project/node_modules/${clean}`;
    return resolved in files ? resolved : null;
  };

  const readFile: InlineImportsOptions["readFile"] = (absPath) =>
    absPath in files ? files[absPath] : null;

  return { resolveImport, readFile };
}

describe("inlineNatcorePaletteImports", () => {
  it("inlines a relative @import whose file declares @natcore-palettes", () => {
    const files = {
      "/project/styles/palettes.css":
        "@natcore-palettes {\n  pumpkin: #e87a01;\n}\n",
    };
    const css =
      `@import "tailwindcss";\n` +
      `@import "@nataliebasille/natcore-design-system";\n` +
      `@import "./styles/palettes.css";\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs(files),
    });

    // The palette block is now physically present...
    expect(out).toContain("@natcore-palettes");
    expect(out).toContain("pumpkin: #e87a01");
    // ...the palette import is gone...
    expect(out).not.toContain('@import "./styles/palettes.css"');
    // ...and expansion over the combined document produces the palette theme.
    const expanded = expandNatcorePalettesInCss(out);
    expect(expanded).toContain("--theme-pumpkin");
    expect(expanded).toContain("#e87a01");
    expect(expanded).not.toContain("@natcore-palettes");
  });

  it("recurses into nested palette imports", () => {
    const files = {
      "/project/styles/index.css": `@import "./pumpkin.css";\n`,
      "/project/styles/pumpkin.css":
        "@natcore-palettes {\n  pumpkin: #e87a01;\n}\n",
    };
    const css = `@import "./styles/index.css";\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs(files),
    });

    expect(out).toContain("pumpkin: #e87a01");
    expect(out).not.toContain("@import");
    const expanded = expandNatcorePalettesInCss(out);
    expect(expanded).toContain("--theme-pumpkin");
  });

  it("leaves a non-palette @import untouched", () => {
    const files = {
      "/project/styles/reset.css": ".reset { margin: 0; }\n",
    };
    const css = `@import "./styles/reset.css";\n.foo { color: red; }\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs(files),
    });

    expect(out).toBe(css);
  });

  it("leaves bare package specifiers for Tailwind", () => {
    const css =
      `@import "tailwindcss";\n` +
      `@import "@nataliebasille/natcore-design-system";\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs({}),
    });

    expect(out).toBe(css);
  });

  it("inlines a node_modules package subpath that declares palettes", () => {
    const files = {
      "/project/node_modules/@acme/brand/palettes.css":
        "@natcore-palettes {\n  brand: #f04e23;\n}\n",
    };
    const css = `@import "@acme/brand/palettes.css";\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs(files),
    });

    expect(out).toContain("brand: #f04e23");
    expect(out).not.toContain("@import");
    expect(expandNatcorePalettesInCss(out)).toContain("--theme-brand");
  });

  it("leaves a qualified palette @import (media/layer/supports) for Tailwind", () => {
    const files = {
      "/project/palettes.css": "@natcore-palettes {\n  pumpkin: #e87a01;\n}\n",
    };
    const qualifiers = [
      `@import "./palettes.css" print;`,
      `@import "./palettes.css" screen and (min-width: 600px);`,
      `@import "./palettes.css" layer(brand);`,
      `@import "./palettes.css" supports(display: grid);`,
      `@import url("./palettes.css") print;`,
    ];

    for (const statement of qualifiers) {
      const css = `${statement}\n`;
      const out = inlineNatcorePaletteImports(css, {
        fromFile: "/project/globals.css",
        ...createFs(files),
      });

      // The qualified import is left verbatim; its condition is not dropped and
      // the palette body is not inlined unconditionally.
      expect(out).toBe(css);
    }
  });

  it("still inlines an unqualified @import that uses url()", () => {
    const files = {
      "/project/palettes.css": "@natcore-palettes {\n  pumpkin: #e87a01;\n}\n",
    };
    const css = `@import url("./palettes.css");\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs(files),
    });

    expect(out).toContain("pumpkin: #e87a01");
    expect(out).not.toContain("@import");
  });

  it("does not hang or crash on an import cycle", () => {
    const files = {
      "/project/a.css":
        `@import "./b.css";\n@natcore-palettes {\n  alpha: #111111;\n}\n`,
      "/project/b.css":
        `@import "./a.css";\n@natcore-palettes {\n  beta: #222222;\n}\n`,
    };
    const css = `@import "./a.css";\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs(files),
    });

    const expanded = expandNatcorePalettesInCss(out);
    expect(expanded).toContain("--theme-alpha");
    expect(expanded).toContain("--theme-beta");
    // Each palette block is inlined exactly once.
    expect(out.match(/@natcore-palettes/g)?.length).toBe(2);
  });

  it("skips a missing file without throwing", () => {
    const css = `@import "./does-not-exist.css";\n.foo { color: red; }\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs({}),
    });

    expect(out).toBe(css);
  });

  it("ignores an @import token inside a comment or string", () => {
    const files = {
      "/project/palettes.css": "@natcore-palettes {\n  pumpkin: #e87a01;\n}\n",
    };
    const css =
      `/* use @import "./palettes.css" to load palettes */\n` +
      `.note::before { content: "@import \\"./palettes.css\\""; }\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs(files),
    });

    expect(out).toBe(css);
  });

  it("does not inline a file that only mentions @natcore-palettes in a comment/string", () => {
    const files = {
      "/project/docs.css":
        `/* configure with @natcore-palettes { brand: red } */\n` +
        `.hint::after { content: "@natcore-palettes"; }\n`,
    };
    const css = `@import "./docs.css";\n.foo { color: red; }\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs(files),
    });

    // The file has no real at-rule, so the import is left verbatim for Tailwind.
    expect(out).toBe(css);
  });

  it("defers inlined palettes past a later import so the prelude stays valid", () => {
    const files = {
      "/project/palettes.css": "@natcore-palettes {\n  pumpkin: #e87a01;\n}\n",
    };
    const css =
      `@import "tailwindcss";\n` +
      `@import "./palettes.css";\n` +
      `@import url("https://example.com/remote.css");\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs(files),
    });

    // The remote import survives...
    expect(out).toContain('@import url("https://example.com/remote.css");');
    // ...and the inlined palette block comes after it (imports before rules).
    const remoteAt = out.indexOf("remote.css");
    const paletteAt = out.indexOf("@natcore-palettes");
    expect(paletteAt).toBeGreaterThan(remoteAt);
    // The consumed palette import itself is gone.
    expect(out).not.toContain('@import "./palettes.css"');
  });

  it("keeps a trailing non-palette import ahead of the deferred palette block", () => {
    const files = {
      "/project/palettes.css": "@natcore-palettes {\n  pumpkin: #e87a01;\n}\n",
      "/project/reset.css": ".reset { margin: 0; }\n",
    };
    const css =
      `@import "./palettes.css";\n` +
      `@import url("https://example.com/remote.css");\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs(files),
    });

    expect(out.indexOf("@natcore-palettes")).toBeGreaterThan(
      out.indexOf("remote.css"),
    );
  });

  it("hoists only palette blocks from a mixed file, preserving cascade order of its rules", () => {
    const files = {
      "/project/brand.css":
        "@natcore-palettes {\n  pumpkin: #e87a01;\n}\n" +
        ".button { color: red; }\n",
      "/project/overrides.css": ".button { color: blue; }\n",
    };
    const css =
      `@import "./brand.css";\n` + `@import "./overrides.css";\n`;

    const out = inlineNatcorePaletteImports(css, {
      fromFile: "/project/globals.css",
      ...createFs(files),
    });

    const redAt = out.indexOf("color: red");
    const overridesAt = out.indexOf("overrides.css");
    const paletteAt = out.indexOf("@natcore-palettes");

    // brand's rule stays before the overrides import, so overrides still wins
    // the cascade (blue beats red).
    expect(redAt).toBeGreaterThanOrEqual(0);
    expect(redAt).toBeLessThan(overridesAt);
    // The palette block is extracted and hoisted after the import prelude.
    expect(paletteAt).toBeGreaterThan(overridesAt);
    // The non-palette overrides import is left for Tailwind.
    expect(out).toContain('@import "./overrides.css"');
  });
});
