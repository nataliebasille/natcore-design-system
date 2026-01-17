import { describe, expect, test } from "vitest";
import { compile } from "./compile";
import { atRule, styleBlock, styleList } from "./ast";

describe("css compiler", () => {
  test("compiles a style block with selector", () => {
    const ast = styleBlock(
      ".button",
      styleList({
        color: "red",
        "font-size": "16px",
      }),
    );

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      ".button {
        color: red;
        font-size: 16px;
      }"
    `);
  });

  test("compiles nested style blocks", () => {
    const ast = styleBlock(".container", [
      styleList({ padding: "20px" }),
      styleBlock(".header", styleList({ "font-size": "24px" })),
    ]);

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      ".container {
        padding: 20px;
        .header {
          font-size: 24px;
        }
      }"
    `);
  });

  test("compiles an at-rule with null body", () => {
    const ast = atRule("charset", '"UTF-8"');

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`"@charset "UTF-8";"`);
  });

  test("compiles an at-rule with body", () => {
    const ast = atRule("media", "screen and (min-width: 768px)", [
      styleBlock(".container", styleList({ width: "750px" })),
    ]);

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      "@media screen and (min-width: 768px) {
        .container {
          width: 750px;
        }
      }"
    `);
  });

  test("compiles nested at-rules", () => {
    const ast = atRule(
      "media",
      "screen",
      atRule("supports", "(display: grid)", [
        styleBlock(".grid", styleList({ display: "grid" })),
      ]),
    );

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      "@media screen {
        @supports (display: grid) {
          .grid {
            display: grid;
          }
        }
      }"
    `);
  });

  test("compiles an array of stylesheet nodes", () => {
    const ast = [
      styleBlock(".button", styleList({ color: "red" })),
      styleBlock(".input", styleList({ border: "1px solid black" })),
    ];

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      ".button {
        color: red;
      }

      .input {
        border: 1px solid black;
      }"
    `);
  });

  test("compiles complex structure with at-rules and style blocks", () => {
    const ast = [
      atRule("layer", "reset", [
        styleBlock("*", styleList({ margin: "0", padding: "0" })),
      ]),
      styleBlock(".container", styleList({ width: "100%" })),
      atRule("media", "(min-width: 768px)", [
        styleBlock(".container", styleList({ "max-width": "750px" })),
      ]),
    ];

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      "@layer reset {
        * {
          margin: 0;
          padding: 0;
        }
      }

      .container {
        width: 100%;
      }

      @media (min-width: 768px) {
        .container {
          max-width: 750px;
        }
      }"
    `);
  });

  test("compiles deeply nested style blocks", () => {
    const ast = styleBlock(
      ".level1",
      styleBlock(".level2", styleBlock(".level3", styleList({ color: "red" }))),
    );

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      ".level1 {
        .level2 {
          .level3 {
            color: red;
          }
        }
      }"
    `);
  });

  test("compiles style block with array of nested blocks", () => {
    const ast = styleBlock(".card", [
      styleList({ background: "white", padding: "1rem" }),
      styleBlock(".title", styleList({ "font-size": "1.5rem" })),
      styleBlock(".content", styleList({ "margin-top": "0.5rem" })),
    ]);

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      ".card {
        background: white;
        padding: 1rem;
        .title {
          font-size: 1.5rem;
        }
        .content {
          margin-top: 0.5rem;
        }
      }"
    `);
  });

  test("compiles style block with CSS custom properties", () => {
    const ast = styleBlock(
      ".button",
      styleList({
        color: "var(--primary-color)",
        background: "var(--bg-color, white)",
      }),
    );

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      ".button {
        color: var(--primary-color);
        background: var(--bg-color, white);
      }"
    `);
  });

  test("handles empty style properties", () => {
    const ast = styleBlock(".empty", styleList({}));

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      ".empty {

      }"
    `);
  });

  test("compiles at-rule with multiple style blocks", () => {
    const ast = atRule("layer", "components", [
      styleBlock(".btn", styleList({ padding: "0.5rem" })),
      styleBlock(".input", styleList({ border: "1px solid" })),
    ]);

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      "@layer components {
        .btn {
          padding: 0.5rem;
        }
        .input {
          border: 1px solid;
        }
      }"
    `);
  });

  test("compiles at-rule with nested at-rules and style blocks", () => {
    const ast = atRule("media", "print", [
      atRule("supports", "(display: flex)", [
        styleBlock(".flex", styleList({ display: "flex" })),
      ]),
      styleBlock(".page", styleList({ "page-break-after": "always" })),
    ]);

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      "@media print {
        @supports (display: flex) {
          .flex {
            display: flex;
          }
        }
        .page {
          page-break-after: always;
        }
      }"
    `);
  });

  test("compiles mixed array of at-rules and style blocks", () => {
    const ast = [
      atRule("charset", '"UTF-8"'),
      styleBlock("body", styleList({ margin: "0" })),
      atRule("media", "(prefers-color-scheme: dark)", [
        styleBlock("body", styleList({ background: "#000", color: "#fff" })),
      ]),
    ];

    const result = compile(ast);

    expect(result).toMatchInlineSnapshot(`
      "@charset "UTF-8";

      body {
        margin: 0;
      }

      @media (prefers-color-scheme: dark) {
        body {
          background: #000;
          color: #fff;
        }
      }"
    `);
  });
});
