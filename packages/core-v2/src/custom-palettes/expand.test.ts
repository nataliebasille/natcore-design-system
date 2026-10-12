import { describe, it, expect } from "vitest";
import { expandNatcorePalettesInCss } from "./expand.ts";

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
