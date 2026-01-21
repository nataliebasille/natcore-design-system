import { describe, it, expectTypeOf } from "vitest";
import { visit } from "./visit";
import { theme } from "../ast/theme";
import { cssv } from "../ast/cssvalue";
import { cssvar } from "../ast/cssvar";
import { color } from "../ast/color";
import { styleRule } from "../ast/styleRule";
import { cls } from "../ast/selector";
import type { CssValueAst, CssVarAst, ColorAst } from "../ast";

describe("VisitorObject type transformations", () => {
  describe("css-var visitor returning string", () => {
    it("should type parent node to know css-var becomes string", () => {
      const ast = styleRule(cls("test"), {
        padding: cssvar("spacing"),
      });

      visit(ast, {
        "css-var": () => "10px",
        styles: (node) => {
          // When css-var returns string, node.padding should allow string | CssVarAst | etc
          // The type system understands that CssVarAst children might now be strings

          // This should be allowed since padding could now be a string
          if (typeof node.padding === "string") {
            expectTypeOf(node.padding).toBeString();
          }

          // CssVarAst should still be in the union
          if (
            node.padding &&
            typeof node.padding === "object" &&
            "type" in node.padding &&
            node.padding.type === "css-var"
          ) {
            expectTypeOf(node.padding).toMatchTypeOf<CssVarAst>();
          }

          return node;
        },
      });
    });
  });

  describe("css-value visitor returning string", () => {
    it("should type theme node to know css-value becomes string", () => {
      const ast = theme({
        "--gradient": cssv`linear-gradient(${color("500")}, ${color("700")})`,
      });

      visit(ast, {
        "css-value": () => "#ff0000",
        theme: (node) => {
          // When css-value returns string, node.theme props should reflect CssValueAst | string
          const gradientValue = node.theme["--gradient"];

          // This should be allowed since it could now be a string
          if (typeof gradientValue === "string") {
            expectTypeOf(gradientValue).toBeString();
          }

          // CssValueAst should still be in the union
          if (
            gradientValue &&
            typeof gradientValue === "object" &&
            "type" in gradientValue &&
            gradientValue.type === "css-value"
          ) {
            expectTypeOf(gradientValue).toMatchTypeOf<CssValueAst>();
          }

          return node;
        },
      });
    });

    it("should type apply visitor to know css-value becomes string", () => {
      const ast = styleRule(cls("test"), {
        "@apply": [cssv`flex items-center`, "justify-center"],
      });

      visit(ast, {
        "css-value": () => "transformed-class",
        apply: (node, parent) => {
          // node is the @apply array
          // The array should contain CssValueAst | string elements
          expectTypeOf(node).toBeArray();

          // Parent should have the transformed structure
          expectTypeOf(parent).toMatchTypeOf<{
            "@apply"?: readonly (string | CssValueAst<string>)[];
          }>();

          return node;
        },
      });
    });
  });

  describe("color visitor returning string", () => {
    it("should type theme node to know color becomes string", () => {
      const ast = theme({
        "--primary": color("500"),
        "--text": "#ffffff",
      });

      visit(ast, {
        color: () => "rgb(255, 0, 0)",
        theme: (node) => {
          const primaryValue = node.theme["--primary"];

          // Should allow string when color visitor returns string
          if (typeof primaryValue === "string") {
            expectTypeOf(primaryValue).toBeString();
          }

          // ColorAst should still be in the union
          if (
            primaryValue &&
            typeof primaryValue === "object" &&
            "type" in primaryValue &&
            primaryValue.type === "color"
          ) {
            expectTypeOf(primaryValue).toMatchTypeOf<ColorAst>();
          }

          return node;
        },
      });
    });

    it("should type styles node to know color becomes string", () => {
      const ast = styleRule(cls("button"), {
        backgroundColor: color("500"),
        color: color("500-text"),
      });

      visit(ast, {
        color: () => "rgb(0, 0, 255)",
        styles: (node) => {
          const bgColor = node.backgroundColor;

          // Should allow string when color visitor returns string
          if (typeof bgColor === "string") {
            expectTypeOf(bgColor).toBeString();
          }

          // ColorAst should still be in the union
          if (
            bgColor &&
            typeof bgColor === "object" &&
            "type" in bgColor &&
            bgColor.type === "color"
          ) {
            expectTypeOf(bgColor).toMatchTypeOf<ColorAst>();
          }

          return node;
        },
      });
    });
  });

  describe("multiple visitors returning alternatives", () => {
    it("should handle color and css-value both returning strings", () => {
      const ast = theme({
        "--color": color("500"),
        "--gradient": cssv`linear-gradient(${color("100")}, ${color("900")})`,
      });

      visit(ast, {
        color: () => "rgb(255, 0, 0)",
        "css-value": () => "linear-gradient(red, blue)",
        theme: (node) => {
          // Both color and css-value children should potentially be strings

          const colorValue = node.theme["--color"];
          const gradientValue = node.theme["--gradient"];

          // Both should allow string
          if (typeof colorValue === "string") {
            expectTypeOf(colorValue).toBeString();
          }
          if (typeof gradientValue === "string") {
            expectTypeOf(gradientValue).toBeString();
          }

          return node;
        },
      });
    });

    it("should handle all three transformable visitors", () => {
      const ast = styleRule(cls("test"), {
        padding: cssvar("spacing"),
        backgroundColor: color("500"),
        backgroundImage: cssv`linear-gradient(${color("100")}, ${color("900")})`,
      });

      visit(ast, {
        color: () => "rgb(255, 0, 0)",
        "css-value": () => "some-gradient",
        "css-var": () => "10px",
        styles: (node) => {
          // All three property types should potentially be strings

          if (typeof node.padding === "string") {
            expectTypeOf(node.padding).toBeString();
          }
          if (typeof node.backgroundColor === "string") {
            expectTypeOf(node.backgroundColor).toBeString();
          }
          if (typeof node.backgroundImage === "string") {
            expectTypeOf(node.backgroundImage).toBeString();
          }

          return node;
        },
      });
    });
  });

  describe("no transforming visitors", () => {
    it("should preserve original types when no transforming visitors", () => {
      const ast = theme({
        "--color": color("500"),
        "--gradient": cssv`linear-gradient(${color("100")}, ${color("900")})`,
      });

      visit(ast, {
        // No color or css-value visitor that returns string
        theme: (node) => {
          // Should still have original types
          const colorValue = node.theme["--color"];
          const gradientValue = node.theme["--gradient"];

          // Values can still be ColorAst, CssValueAst, string, or number
          if (
            colorValue &&
            typeof colorValue === "object" &&
            "type" in colorValue
          ) {
            if (colorValue.type === "color") {
              expectTypeOf(colorValue).toMatchTypeOf<ColorAst>();
            }
            if (colorValue.type === "css-value") {
              expectTypeOf(colorValue).toMatchTypeOf<CssValueAst>();
            }
          }

          return node;
        },
      });
    });
  });
});
