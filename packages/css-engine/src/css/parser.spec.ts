import { describe, it, expect } from "vitest";
import { parse } from "./parser";
import { compile } from "./compile";

describe("CSS Parser", () => {
  describe("Style blocks", () => {
    it("should parse a simple style block with one property", () => {
      const css = `.button { color: red; }`;
      const ast = parse(css);

      expect(ast).toEqual({
        type: "style-block",
        selector: ".button",
        body: {
          type: "style-list",
          styles: {
            color: "red",
          },
        },
      });
    });

    it("should parse a style block with multiple properties", () => {
      const css = `
        .card {
          background: white;
          padding: 1rem;
          border-radius: 8px;
        }
      `;
      const ast = parse(css);

      expect(ast).toEqual({
        type: "style-block",
        selector: ".card",
        body: {
          type: "style-list",
          styles: {
            background: "white",
            padding: "1rem",
            "border-radius": "8px",
          },
        },
      });
    });

    it("should parse CSS custom properties (variables)", () => {
      const css = `
        :root {
          --primary: #230288;
          --secondary: #ff6b6b;
        }
      `;
      const ast = parse(css);

      expect(ast).toEqual({
        type: "style-block",
        selector: ":root",
        body: {
          type: "style-list",
          styles: {
            "--primary": "#230288",
            "--secondary": "#ff6b6b",
          },
        },
      });
    });

    it("should parse complex selectors", () => {
      const css = `.parent > .child:hover, .sibling + .adjacent { margin: 0; }`;
      const ast = parse(css);

      expect(ast).toMatchObject({
        type: "style-block",
        selector: ".parent > .child:hover, .sibling + .adjacent",
      });
    });
  });

  describe("Nested rules", () => {
    it("should parse nested style blocks", () => {
      const css = `
        .container {
          padding: 1rem;
          
          .item {
            color: blue;
          }
        }
      `;
      const ast = parse(css);

      expect(ast).toEqual({
        type: "style-block",
        selector: ".container",
        body: [
          {
            type: "style-list",
            styles: {
              padding: "1rem",
            },
          },
          {
            type: "style-block",
            selector: ".item",
            body: {
              type: "style-list",
              styles: {
                color: "blue",
              },
            },
          },
        ],
      });
    });

    it("should parse multiple nested blocks", () => {
      const css = `
        .parent {
          display: flex;
          
          .child1 {
            flex: 1;
          }
          
          .child2 {
            flex: 2;
          }
        }
      `;
      const ast = parse(css);

      expect(ast).toMatchObject({
        type: "style-block",
        selector: ".parent",
        body: expect.arrayContaining([
          expect.objectContaining({ type: "style-list" }),
          expect.objectContaining({
            type: "style-block",
            selector: ".child1",
          }),
          expect.objectContaining({
            type: "style-block",
            selector: ".child2",
          }),
        ]),
      });
    });
  });

  describe("At-rules", () => {
    it("should parse @media rule", () => {
      const css = `
        @media (min-width: 768px) {
          .container {
            max-width: 1200px;
          }
        }
      `;
      const ast = parse(css);

      expect(ast).toEqual({
        type: "at-rule",
        name: "media",
        prelude: "(min-width: 768px)",
        body: [
          {
            type: "style-block",
            selector: ".container",
            body: {
              type: "style-list",
              styles: {
                "max-width": "1200px",
              },
            },
          },
        ],
      });
    });

    it("should parse @import statement", () => {
      const css = `@import url("styles.css");`;
      const ast = parse(css);

      expect(ast).toEqual({
        type: "at-rule",
        name: "import",
        prelude: `url("styles.css")`,
        body: null,
      });
    });

    it("should parse @keyframes", () => {
      const css = `
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `;
      const ast = parse(css);

      expect(ast).toMatchObject({
        type: "at-rule",
        name: "keyframes",
        prelude: "fadeIn",
        body: [
          {
            type: "style-block",
            selector: "from",
          },
          {
            type: "style-block",
            selector: "to",
          },
        ],
      });
    });

    it("should parse @supports", () => {
      const css = `
        @supports (display: grid) {
          .grid {
            display: grid;
          }
        }
      `;
      const ast = parse(css);

      expect(ast).toMatchObject({
        type: "at-rule",
        name: "supports",
        prelude: "(display: grid)",
      });
    });

    it("should parse nested @media inside style block", () => {
      const css = `
        .button {
          padding: 0.5rem;
          
          @media (min-width: 768px) {
            padding: 1rem;
          }
        }
      `;
      const ast = parse(css);

      expect(ast).toMatchObject({
        type: "style-block",
        selector: ".button",
        body: expect.arrayContaining([
          expect.objectContaining({ type: "style-list" }),
          expect.objectContaining({
            type: "at-rule",
            name: "media",
          }),
        ]),
      });
    });
  });

  describe("Multiple top-level rules", () => {
    it("should parse multiple style blocks", () => {
      const css = `
        .button {
          color: blue;
        }
        
        .card {
          background: white;
        }
      `;
      const ast = parse(css);

      expect(Array.isArray(ast)).toBe(true);
      if (Array.isArray(ast)) {
        expect(ast).toHaveLength(2);
        expect(ast[0]).toMatchObject({ selector: ".button" });
        expect(ast[1]).toMatchObject({ selector: ".card" });
      }
    });

    it("should parse mixed at-rules and style blocks", () => {
      const css = `
        @import url("base.css");
        
        .container {
          width: 100%;
        }
        
        @media (min-width: 768px) {
          .container {
            width: 768px;
          }
        }
      `;
      const ast = parse(css);

      expect(Array.isArray(ast)).toBe(true);
      if (Array.isArray(ast)) {
        expect(ast).toHaveLength(3);
        expect(ast[0]).toMatchObject({ type: "at-rule", name: "import" });
        expect(ast[1]).toMatchObject({ type: "style-block" });
        expect(ast[2]).toMatchObject({ type: "at-rule", name: "media" });
      }
    });
  });

  describe("CSS Comments", () => {
    it("should skip single-line comments", () => {
      const css = `
        /* This is a comment */
        .button {
          color: red; /* inline comment */
        }
      `;
      const ast = parse(css);

      expect(ast).toMatchObject({
        type: "style-block",
        selector: ".button",
      });
    });

    it("should skip multi-line comments", () => {
      const css = `
        /*
         * Multi-line comment
         * with multiple lines
         */
        .card {
          padding: 1rem;
        }
      `;
      const ast = parse(css);

      expect(ast).toMatchObject({
        type: "style-block",
        selector: ".card",
      });
    });
  });

  describe("Complex values", () => {
    it("should parse values with functions", () => {
      const css = `
        .gradient {
          background: linear-gradient(to right, red, blue);
          transform: translate(10px, 20px);
        }
      `;
      const ast = parse(css);

      expect(ast).toMatchObject({
        type: "style-block",
        selector: ".gradient",
        body: {
          type: "style-list",
          styles: {
            background: "linear-gradient(to right, red, blue)",
            transform: "translate(10px, 20px)",
          },
        },
      });
    });

    it("should parse values with multiple parts", () => {
      const css = `
        .text {
          font: 16px/1.5 "Helvetica Neue", Arial, sans-serif;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
      `;
      const ast = parse(css);

      expect(ast).toMatchObject({
        type: "style-block",
        selector: ".text",
        body: {
          type: "style-list",
          styles: {
            font: `16px/1.5 "Helvetica Neue", Arial, sans-serif`,
            border: "1px solid rgba(0, 0, 0, 0.1)",
          },
        },
      });
    });
  });

  describe("Round-trip (parse -> compile)", () => {
    it("should produce valid CSS when parsed and compiled", () => {
      const originalCss = `
        .button {
          padding: 1rem;
          background: blue;
        }
      `.trim();

      const ast = parse(originalCss);
      const compiled = compile(ast);

      // The output should be valid CSS
      expect(compiled).toContain(".button");
      expect(compiled).toContain("padding: 1rem;");
      expect(compiled).toContain("background: blue;");
    });

    it("should handle nested rules in round-trip", () => {
      const originalCss = `
        .container {
          padding: 1rem;
          
          .item {
            color: red;
          }
        }
      `.trim();

      const ast = parse(originalCss);
      const compiled = compile(ast);

      // Re-parse the compiled output
      const reparsed = parse(compiled);

      // Should maintain structure
      expect(reparsed).toMatchObject({
        type: "style-block",
        selector: ".container",
      });
    });

    it("should handle @media rules in round-trip", () => {
      const originalCss = `
        @media (min-width: 768px) {
          .container {
            max-width: 1200px;
          }
        }
      `.trim();

      const ast = parse(originalCss);
      const compiled = compile(ast);

      expect(compiled).toContain("@media");
      expect(compiled).toContain("min-width: 768px");
      expect(compiled).toContain(".container");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty style blocks", () => {
      const css = `.empty {}`;
      const ast = parse(css);

      expect(ast).toMatchObject({
        type: "style-block",
        selector: ".empty",
      });
    });

    it("should handle properties without semicolon at end", () => {
      const css = `
        .button {
          color: red;
          padding: 1rem
        }
      `;
      const ast = parse(css);

      expect(ast).toMatchObject({
        type: "style-block",
        body: {
          type: "style-list",
          styles: {
            color: "red",
            padding: "1rem",
          },
        },
      });
    });

    it("should handle whitespace variations", () => {
      const css = `.btn{margin:0;padding:0}`;
      const ast = parse(css);

      expect(ast).toMatchObject({
        type: "style-block",
        selector: ".btn",
        body: {
          type: "style-list",
          styles: {
            margin: "0",
            padding: "0",
          },
        },
      });
    });
  });
});
