import { describe, it, expect } from "vitest";
import { transformTailwindV4 } from "../tailwindv4";
import { component, theme } from "../../../../css-engine/src/dsl/ast";

describe("transformTailwindV4 - component", () => {
  describe("basic component transformation", () => {
    it.only("transforms a component with simple style properties", () => {
      const ast = component("btn", {
        padding: "8px 16px",
        "border-radius": "4px",
        "font-weight": "600",
      });

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          
        }"
      `);
    });

    it("transforms a component with theme variables", () => {
      const ast = component(
        "btn",
        theme({
          "--btn-bg": "blue",
          "--btn-text": "white",
          "--btn-border": "transparent",
        }),
        {
          "background-color": "var(--btn-bg)",
          color: "var(--btn-text)",
          "border-color": "var(--btn-border)",
        },
      );

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --btn-bg: blue;
          --btn-text: white;
          --btn-border: transparent;
        }"
      `);
    });

    it("transforms a component with multiple style properties", () => {
      const ast = component("card", {
        padding: "16px",
        "border-radius": "8px",
        "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
        "background-color": "white",
        border: "1px solid #e5e5e5",
      });

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          
        }"
      `);
    });
  });

  describe("component with palette colors", () => {
    it("transforms component and generates utilities for primary, secondary, accent, surface", () => {
      const ast = component(
        "btn",
        theme({
          "--btn-primary-bg": "#0066cc",
          "--btn-secondary-bg": "#6c757d",
          "--btn-accent-bg": "#ff4081",
          "--btn-surface-bg": "#f5f5f5",
        }),
        {
          padding: "8px 16px",
          "border-radius": "4px",
        },
      );

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --btn-primary-bg: #0066cc;
          --btn-secondary-bg: #6c757d;
          --btn-accent-bg: #ff4081;
          --btn-surface-bg: #f5f5f5;
        }"
      `);
    });
  });

  describe("component with complex theme variables", () => {
    it("transforms component with spacing theme variables", () => {
      const ast = component(
        "input",
        theme({
          "--input-padding-x": "12px",
          "--input-padding-y": "8px",
          "--input-border-width": "1px",
          "--input-border-radius": "4px",
        }),
        {
          padding: "var(--input-padding-y) var(--input-padding-x)",
          "border-width": "var(--input-border-width)",
          "border-radius": "var(--input-border-radius)",
        },
      );

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --input-padding-x: 12px;
          --input-padding-y: 8px;
          --input-border-width: 1px;
          --input-border-radius: 4px;
        }"
      `);
    });

    it("transforms component with color theme variables", () => {
      const ast = component(
        "badge",
        theme({
          "--badge-bg": "rgb(239, 68, 68)",
          "--badge-text": "rgb(255, 255, 255)",
          "--badge-border": "rgb(220, 38, 38)",
        }),
        {
          "background-color": "var(--badge-bg)",
          color: "var(--badge-text)",
          "border-color": "var(--badge-border)",
          padding: "2px 8px",
          "border-radius": "9999px",
        },
      );

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --badge-bg: rgb(239, 68, 68);
          --badge-text: rgb(255, 255, 255);
          --badge-border: rgb(220, 38, 38);
        }"
      `);
    });

    it("transforms component with typography theme variables", () => {
      const ast = component(
        "heading",
        theme({
          "--heading-font-size": "24px",
          "--heading-line-height": "1.2",
          "--heading-font-weight": "700",
          "--heading-letter-spacing": "-0.025em",
        }),
        {
          "font-size": "var(--heading-font-size)",
          "line-height": "var(--heading-line-height)",
          "font-weight": "var(--heading-font-weight)",
          "letter-spacing": "var(--heading-letter-spacing)",
        },
      );

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --heading-font-size: 24px;
          --heading-line-height: 1.2;
          --heading-font-weight: 700;
          --heading-letter-spacing: -0.025em;
        }"
      `);
    });
  });

  describe("multiple components", () => {
    it("transforms array of multiple components", () => {
      const ast = [
        component(
          "btn",
          theme({
            "--btn-bg": "blue",
          }),
          {
            padding: "8px 16px",
          },
        ),
        component(
          "card",
          theme({
            "--card-bg": "white",
          }),
          {
            padding: "16px",
          },
        ),
      ];

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --btn-bg: blue;
          --card-bg: white;
        }"
      `);
    });

    it("transforms multiple components with different theme variables", () => {
      const ast = [
        component(
          "btn",
          theme({
            "--btn-primary": "#0066cc",
            "--btn-text": "white",
          }),
          {
            "background-color": "var(--btn-primary)",
            color: "var(--btn-text)",
          },
        ),
        component(
          "input",
          theme({
            "--input-border": "#d1d5db",
            "--input-focus": "#3b82f6",
          }),
          {
            "border-color": "var(--input-border)",
          },
        ),
        component(
          "card",
          theme({
            "--card-shadow": "0 1px 3px rgba(0,0,0,0.12)",
          }),
          {
            "box-shadow": "var(--card-shadow)",
          },
        ),
      ];

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --btn-primary: #0066cc;
          --btn-text: white;
          --input-border: #d1d5db;
          --input-focus: #3b82f6;
          --card-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }"
      `);
    });
  });

  describe("component with mixed body elements", () => {
    it("transforms component with both theme and style properties", () => {
      const ast = component(
        "alert",
        theme({
          "--alert-info-bg": "#dbeafe",
          "--alert-info-text": "#1e40af",
          "--alert-info-border": "#3b82f6",
        }),
        {
          padding: "12px 16px",
          "border-radius": "6px",
          "border-left-width": "4px",
          "background-color": "var(--alert-info-bg)",
          color: "var(--alert-info-text)",
          "border-left-color": "var(--alert-info-border)",
        },
      );

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --alert-info-bg: #dbeafe;
          --alert-info-text: #1e40af;
          --alert-info-border: #3b82f6;
        }"
      `);
    });

    it("transforms component with multiple theme definitions", () => {
      const ast = component(
        "btn",
        theme({
          "--btn-primary": "#0066cc",
        }),
        {
          padding: "8px 16px",
        },
        theme({
          "--btn-hover": "#0052a3",
        }),
        {
          "border-radius": "4px",
        },
      );

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --btn-primary: #0066cc;
          --btn-hover: #0052a3;
        }"
      `);
    });
  });

  describe("component edge cases", () => {
    it("transforms component with empty body", () => {
      const ast = component("empty", {});

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          
        }"
      `);
    });

    it("transforms component with only theme (no styles)", () => {
      const ast = component(
        "themed",
        theme({
          "--custom-var": "value",
        }),
      );

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --custom-var: value;
        }"
      `);
    });

    it("transforms component with CSS custom properties in values", () => {
      const ast = component("complex", {
        color: "var(--theme-primary)",
        "background-color": "var(--theme-surface)",
        border: "1px solid var(--theme-border)",
        "box-shadow": "0 0 0 3px var(--theme-shadow)",
      });

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          
        }"
      `);
    });

    it("transforms component with calc() expressions", () => {
      const ast = component(
        "calculated",
        theme({
          "--base-size": "16px",
        }),
        {
          padding: "calc(var(--base-size) * 0.5)",
          "margin-bottom": "calc(var(--base-size) * 2)",
          width: "calc(100% - 32px)",
        },
      );

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --base-size: 16px;
        }"
      `);
    });
  });

  describe("real-world component examples", () => {
    it("transforms a button component with variants", () => {
      const ast = component(
        "btn",
        theme({
          "--btn-font-size": "14px",
          "--btn-font-weight": "500",
          "--btn-line-height": "1.5",
          "--btn-padding-x": "16px",
          "--btn-padding-y": "8px",
          "--btn-border-radius": "6px",
          "--btn-transition": "all 150ms ease",
        }),
        {
          display: "inline-flex",
          "align-items": "center",
          "justify-content": "center",
          "font-size": "var(--btn-font-size)",
          "font-weight": "var(--btn-font-weight)",
          "line-height": "var(--btn-line-height)",
          padding: "var(--btn-padding-y) var(--btn-padding-x)",
          "border-radius": "var(--btn-border-radius)",
          transition: "var(--btn-transition)",
          border: "1px solid transparent",
          cursor: "pointer",
        },
      );

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --btn-font-size: 14px;
          --btn-font-weight: 500;
          --btn-line-height: 1.5;
          --btn-padding-x: 16px;
          --btn-padding-y: 8px;
          --btn-border-radius: 6px;
          --btn-transition: all 150ms ease;
        }"
      `);
    });

    it("transforms an input component", () => {
      const ast = component(
        "input",
        theme({
          "--input-font-size": "14px",
          "--input-padding": "10px 12px",
          "--input-border": "#d1d5db",
          "--input-border-radius": "6px",
          "--input-bg": "white",
          "--input-text": "#1f2937",
          "--input-placeholder": "#9ca3af",
          "--input-focus-border": "#3b82f6",
          "--input-focus-ring": "0 0 0 3px rgba(59, 130, 246, 0.1)",
        }),
        {
          width: "100%",
          "font-size": "var(--input-font-size)",
          padding: "var(--input-padding)",
          "background-color": "var(--input-bg)",
          color: "var(--input-text)",
          border: "1px solid var(--input-border)",
          "border-radius": "var(--input-border-radius)",
          outline: "none",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
        },
      );

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --input-font-size: 14px;
          --input-padding: 10px 12px;
          --input-border: #d1d5db;
          --input-border-radius: 6px;
          --input-bg: white;
          --input-text: #1f2937;
          --input-placeholder: #9ca3af;
          --input-focus-border: #3b82f6;
          --input-focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }"
      `);
    });

    it("transforms a card component", () => {
      const ast = component(
        "card",
        theme({
          "--card-bg": "white",
          "--card-border": "#e5e7eb",
          "--card-radius": "8px",
          "--card-shadow": "0 1px 3px rgba(0, 0, 0, 0.1)",
          "--card-padding": "24px",
        }),
        {
          "background-color": "var(--card-bg)",
          border: "1px solid var(--card-border)",
          "border-radius": "var(--card-radius)",
          "box-shadow": "var(--card-shadow)",
          padding: "var(--card-padding)",
        },
      );

      const result = transformTailwindV4(ast);

      expect(result).toMatchInlineSnapshot(`
        "@theme {
          --card-bg: white;
          --card-border: #e5e7eb;
          --card-radius: 8px;
          --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          --card-padding: 24px;
        }"
      `);
    });
  });
});
