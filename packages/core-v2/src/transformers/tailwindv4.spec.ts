import { describe, it, expect } from "vitest";
import { transformTailwindV4 } from "./tailwindv4";
import {
  apply,
  color,
  component,
  style,
  styleRule,
  theme,
} from "../../../css-engine/src/dsl/ast";

describe("transformerTailwindV4", () => {
  describe("component transformation", () => {
    it("test", () => {
      const ast = component("btn", {
        base: [
          apply("text-center", "font-bold"),
          {
            color: color("500-text"),
            "background-color": color("500"),
          },
          styleRule("&:hover", {
            "background-color": color("700"),
          }),
        ],
      });

      const result = transformTailwindV4(ast);

      const x = 0;
    });
  });
  // describe("theme transformation", () => {
  //   it("transforms a single theme AST node", () => {
  //     const ast = theme({
  //       "--primary": "blue",
  //       "--secondary": "red",
  //     });

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --primary: blue;
  //         --secondary: red;
  //       }"
  //     `);
  //   });

  //   it("transforms theme with CSS color values", () => {
  //     const ast = theme({
  //       "--color-primary": "#0066cc",
  //       "--color-secondary": "rgb(255, 102, 0)",
  //       "--color-accent": "hsl(210, 50%, 50%)",
  //     });

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --color-primary: #0066cc;
  //         --color-secondary: rgb(255, 102, 0);
  //         --color-accent: hsl(210, 50%, 50%);
  //       }"
  //     `);
  //   });

  //   it("transforms theme with spacing values", () => {
  //     const ast = theme({
  //       "--spacing-sm": "8px",
  //       "--spacing-md": "16px",
  //       "--spacing-lg": "24px",
  //       "--spacing-xl": "32px",
  //     });

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --spacing-sm: 8px;
  //         --spacing-md: 16px;
  //         --spacing-lg: 24px;
  //         --spacing-xl: 32px;
  //       }"
  //     `);
  //   });

  //   it("transforms theme with typography values", () => {
  //     const ast = theme({
  //       "--font-size-base": "16px",
  //       "--line-height": "1.5",
  //       "--font-family": "sans-serif",
  //       "--font-weight": "400",
  //     });

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --font-size-base: 16px;
  //         --line-height: 1.5;
  //         --font-family: sans-serif;
  //         --font-weight: 400;
  //       }"
  //     `);
  //   });

  //   it("transforms theme with mixed value types", () => {
  //     const ast = theme({
  //       "--primary": "blue",
  //       "--spacing": "8px",
  //       "--opacity": "0.5",
  //       "--duration": "200ms",
  //       "--shadow": "0 2px 4px rgba(0,0,0,0.1)",
  //     });

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --primary: blue;
  //         --spacing: 8px;
  //         --opacity: 0.5;
  //         --duration: 200ms;
  //         --shadow: 0 2px 4px rgba(0,0,0,0.1);
  //       }"
  //     `);
  //   });

  //   it("transforms theme with empty object", () => {
  //     const ast = theme({});

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {

  //       }"
  //     `);
  //   });
  // });

  // describe("array of theme ASTs", () => {
  //   it("transforms multiple theme nodes", () => {
  //     const ast = [
  //       theme({
  //         "--primary": "blue",
  //         "--secondary": "red",
  //       }),
  //       theme({
  //         "--spacing-sm": "8px",
  //         "--spacing-md": "16px",
  //       }),
  //     ];

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --primary: blue;
  //         --secondary: red;
  //       }

  //       @theme {
  //         --spacing-sm: 8px;
  //         --spacing-md: 16px;
  //       }"
  //     `);
  //   });

  //   it("transforms array with single theme node", () => {
  //     const ast = [
  //       theme({
  //         "--primary": "blue",
  //       }),
  //     ];

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --primary: blue;
  //       }"
  //     `);
  //   });

  //   it("transforms array with multiple themes (semantic grouping)", () => {
  //     const ast = [
  //       theme({
  //         "--color-primary": "#0066cc",
  //         "--color-secondary": "#ff6600",
  //       }),
  //       theme({
  //         "--spacing-1": "4px",
  //         "--spacing-2": "8px",
  //         "--spacing-3": "12px",
  //       }),
  //       theme({
  //         "--font-body": "system-ui",
  //         "--font-mono": "monospace",
  //       }),
  //     ];

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --color-primary: #0066cc;
  //         --color-secondary: #ff6600;
  //       }

  //       @theme {
  //         --spacing-1: 4px;
  //         --spacing-2: 8px;
  //         --spacing-3: 12px;
  //       }

  //       @theme {
  //         --font-body: system-ui;
  //         --font-mono: monospace;
  //       }"
  //     `);
  //   });
  // });

  // describe("real-world scenarios", () => {
  //   it("transforms a complete color system", () => {
  //     const ast = theme({
  //       "--color-primary-50": "#e6f2ff",
  //       "--color-primary-100": "#b3d9ff",
  //       "--color-primary-500": "#0066cc",
  //       "--color-primary-900": "#001a33",
  //       "--color-success": "#10b981",
  //       "--color-warning": "#f59e0b",
  //       "--color-error": "#ef4444",
  //     });

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --color-primary-50: #e6f2ff;
  //         --color-primary-100: #b3d9ff;
  //         --color-primary-500: #0066cc;
  //         --color-primary-900: #001a33;
  //         --color-success: #10b981;
  //         --color-warning: #f59e0b;
  //         --color-error: #ef4444;
  //       }"
  //     `);
  //   });

  //   it("transforms a complete design token system", () => {
  //     const ast = [
  //       theme({
  //         "--color-brand": "#0066cc",
  //         "--color-text": "#1a1a1a",
  //         "--color-bg": "#ffffff",
  //       }),
  //       theme({
  //         "--space-xs": "4px",
  //         "--space-sm": "8px",
  //         "--space-md": "16px",
  //         "--space-lg": "24px",
  //         "--space-xl": "32px",
  //       }),
  //       theme({
  //         "--radius-sm": "4px",
  //         "--radius-md": "8px",
  //         "--radius-lg": "12px",
  //         "--radius-full": "9999px",
  //       }),
  //     ];

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --color-brand: #0066cc;
  //         --color-text: #1a1a1a;
  //         --color-bg: #ffffff;
  //       }

  //       @theme {
  //         --space-xs: 4px;
  //         --space-sm: 8px;
  //         --space-md: 16px;
  //         --space-lg: 24px;
  //         --space-xl: 32px;
  //       }

  //       @theme {
  //         --radius-sm: 4px;
  //         --radius-md: 8px;
  //         --radius-lg: 12px;
  //         --radius-full: 9999px;
  //       }"
  //     `);
  //   });
  // });

  // describe("component AST transformation", () => {
  //   it("transforms a component with a single theme", () => {
  //     const ast = component(
  //       "button",
  //       theme({
  //         "--btn-bg": "blue",
  //         "--btn-color": "white",
  //       }),
  //     );

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --btn-bg: blue;
  //         --btn-color: white;
  //       }"
  //     `);
  //   });

  //   it("transforms a component with multiple themes", () => {
  //     const ast = component(
  //       "card",
  //       theme({
  //         "--card-bg": "white",
  //         "--card-border": "#e5e7eb",
  //       }),
  //       theme({
  //         "--card-padding": "16px",
  //         "--card-radius": "8px",
  //       }),
  //     );

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --card-bg: white;
  //         --card-border: #e5e7eb;
  //         --card-padding: 16px;
  //         --card-radius: 8px;
  //       }"
  //     `);
  //   });

  //   it("transforms a component with empty theme", () => {
  //     const ast = component("empty", theme({}));

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`""`);
  //   });

  //   it("transforms a component with no body", () => {
  //     const ast = component("minimal");

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`""`);
  //   });

  //   it("transforms a component with color-related theme properties", () => {
  //     const ast = component(
  //       "alert",
  //       theme({
  //         "--alert-bg-primary": "#dbeafe",
  //         "--alert-text-primary": "#1e40af",
  //         "--alert-bg-success": "#d1fae5",
  //         "--alert-text-success": "#065f46",
  //         "--alert-bg-warning": "#fef3c7",
  //         "--alert-text-warning": "#92400e",
  //       }),
  //     );

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --alert-bg-primary: #dbeafe;
  //         --alert-text-primary: #1e40af;
  //         --alert-bg-success: #d1fae5;
  //         --alert-text-success: #065f46;
  //         --alert-bg-warning: #fef3c7;
  //         --alert-text-warning: #92400e;
  //       }"
  //     `);
  //   });

  //   it("transforms multiple components as an array", () => {
  //     const ast = [
  //       component(
  //         "button",
  //         theme({
  //           "--btn-bg": "blue",
  //           "--btn-color": "white",
  //         }),
  //       ),
  //       component(
  //         "card",
  //         theme({
  //           "--card-bg": "white",
  //           "--card-border": "#e5e7eb",
  //         }),
  //       ),
  //     ];

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --btn-bg: blue;
  //         --btn-color: white;
  //         --card-bg: white;
  //         --card-border: #e5e7eb;
  //       }"
  //     `);
  //   });

  //   it("transforms component with complex design tokens", () => {
  //     const ast = component(
  //       "input",
  //       theme({
  //         "--input-height": "40px",
  //         "--input-padding-x": "12px",
  //         "--input-padding-y": "8px",
  //         "--input-border-width": "1px",
  //         "--input-border-color": "#d1d5db",
  //         "--input-border-radius": "6px",
  //         "--input-bg": "#ffffff",
  //         "--input-color": "#111827",
  //         "--input-placeholder-color": "#9ca3af",
  //         "--input-focus-border-color": "#3b82f6",
  //         "--input-focus-ring-color": "rgba(59, 130, 246, 0.5)",
  //         "--input-focus-ring-width": "3px",
  //       }),
  //     );

  //     const result = transformTailwindV4(ast);

  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --input-height: 40px;
  //         --input-padding-x: 12px;
  //         --input-padding-y: 8px;
  //         --input-border-width: 1px;
  //         --input-border-color: #d1d5db;
  //         --input-border-radius: 6px;
  //         --input-bg: #ffffff;
  //         --input-color: #111827;
  //         --input-placeholder-color: #9ca3af;
  //         --input-focus-border-color: #3b82f6;
  //         --input-focus-ring-color: rgba(59, 130, 246, 0.5);
  //         --input-focus-ring-width: 3px;
  //       }"
  //     `);
  //   });

  //   // Bug test: The current implementation doesn't merge themes correctly when a component has nested themes
  //   it("should merge multiple themes from the same component into a single @theme block", () => {
  //     const ast = component(
  //       "badge",
  //       theme({
  //         "--badge-size-sm": "20px",
  //         "--badge-size-md": "24px",
  //       }),
  //       theme({
  //         "--badge-color-info": "#3b82f6",
  //         "--badge-color-success": "#10b981",
  //       }),
  //     );

  //     const result = transformTailwindV4(ast);

  //     // The current implementation correctly merges all themes into one
  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --badge-size-sm: 20px;
  //         --badge-size-md: 24px;
  //         --badge-color-info: #3b82f6;
  //         --badge-color-success: #10b981;
  //       }"
  //     `);
  //   });
  // });

  // describe("mixed AST transformation", () => {
  //   it("transforms a mix of themes and components", () => {
  //     const ast = [
  //       theme({
  //         "--global-primary": "#0066cc",
  //         "--global-secondary": "#ff6600",
  //       }),
  //       component(
  //         "button",
  //         theme({
  //           "--btn-bg": "var(--global-primary)",
  //           "--btn-color": "white",
  //         }),
  //       ),
  //       theme({
  //         "--global-spacing": "16px",
  //       }),
  //     ];

  //     const result = transformTailwindV4(ast);

  //     // Note: Currently only components generate output, standalone themes are ignored
  //     // This might be a bug in the current implementation
  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --global-primary: #0066cc;
  //         --global-secondary: #ff6600;
  //         --btn-bg: var(--global-primary);
  //         --btn-color: white;
  //         --global-spacing: 16px;
  //       }"
  //     `);
  //   });

  //   it("filters out non-component AST nodes", () => {
  //     // This test confirms the current behavior where only components are processed
  //     const ast = [
  //       theme({
  //         "--standalone": "value",
  //       }),
  //       component(
  //         "button",
  //         theme({
  //           "--btn-color": "blue",
  //         }),
  //       ),
  //       theme({
  //         "--another-standalone": "value",
  //       }),
  //     ];

  //     const result = transformTailwindV4(ast);

  //     // Only the component's theme is output
  //     expect(result).toMatchInlineSnapshot(`
  //       "@theme {
  //         --standalone: value;
  //         --btn-color: blue;
  //         --another-standalone: value;
  //       }"
  //     `);
  //   });
  // });
});
