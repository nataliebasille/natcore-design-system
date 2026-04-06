import { describe, it, expect, expectTypeOf } from "vitest";
import {
  styleRule,
  styleList,
  type StyleRuleAst,
  type StyleListAst,
  type TailwindClassAst,
} from "./style-rule.ts";
import { select, type Selector } from "./selector.ts";
import type { constants } from "buffer";
import type { WithMetadata } from "../../utils/types.ts";
import { tw } from "./tailwind-utilities.ts";

describe("styleRule type tests", () => {
  describe("basic rule creation", () => {
    it("returns StyleRuleAst with correct selector and body array", () => {
      const result = styleRule(select.cls("button"), { color: "red" });

      expectTypeOf(result.$ast).toEqualTypeOf<"style-rule">();
      expectTypeOf(result).toExtend<
        WithMetadata<{}, Readonly<{ ".button": { color: "red" } }>>
      >();
      expect(result).toEqual({
        $ast: "style-rule",
        selector: ".button",
        body: [
          {
            $ast: "style-list",
            styles: [{ color: "red" }],
          },
        ],
      });
    });

    it("preserves exact body type with literal values", () => {
      const body = {
        padding: "1rem",
        margin: "0.5rem",
        display: "flex",
      } as const;
      const result = styleRule(select.cls("card"), body);

      expectTypeOf(result).toExtend<
        WithMetadata<{}, Readonly<{ ".card": typeof body }>>
      >();
      expect(result.body).toEqual([
        {
          $ast: "style-list",
          styles: [body],
        },
      ]);
    });

    it("handles empty body", () => {
      const result = styleRule(select.cls("empty"));

      expectTypeOf(result).toExtend<
        WithMetadata<{}, Readonly<{ ".empty": {} }>>
      >();
    });
  });

  describe("selector types", () => {
    it("works with class selectors", () => {
      const buttonClass = select.cls("button");
      expectTypeOf(buttonClass).toEqualTypeOf<".button">();

      const result = styleRule(buttonClass, { color: "blue" });
      expectTypeOf(result).toExtend<
        WithMetadata<{}, Readonly<{ ".button": { color: "blue" } }>>
      >();
      expect(result.selector).toBe(".button");
      expect(result.$ast).toBe("style-rule");
    });

    it("works with element selectors", () => {
      const result = styleRule(select.element("div"), {
        display: "flex",
        padding: "1rem",
      });

      expectTypeOf(result).toExtend<
        WithMetadata<
          {},
          Readonly<{ div: { display: "flex"; padding: "1rem" } }>
        >
      >();
      expect(result).toEqual({
        $ast: "style-rule",
        selector: "div",
        body: [
          {
            $ast: "style-list",
            styles: [{ display: "flex", padding: "1rem" }],
          },
        ],
      });
    });

    it("works with id selectors", () => {
      const result = styleRule(select.id("main"), { width: "100%" });

      expectTypeOf(result).toExtend<
        WithMetadata<{}, Readonly<{ "#main": { width: "100%" } }>>
      >();
    });

    it("works with pseudo-class selectors", () => {
      const result = styleRule(select.pseudo("hover"), { opacity: "0.8" });

      expectTypeOf(result).toExtend<
        WithMetadata<{}, Readonly<{ ":hover": { opacity: "0.8" } }>>
      >();
    });

    it("works with combinator selectors", () => {
      const result = styleRule(
        select.descendant(select.element("ul"), select.element("li")),
        {
          "list-style": "none",
        },
      );

      expectTypeOf(result).toExtend<
        WithMetadata<{}, Readonly<{ "ul li": { "list-style": "none" } }>>
      >();
      expect(result).toEqual({
        $ast: "style-rule",
        selector: "ul li",
        body: [
          {
            $ast: "style-list",
            styles: [{ "list-style": "none" }],
          },
        ],
      });
    });

    it("preserves exact selector literal type", () => {
      const buttonRule = styleRule(select.cls("primary-button"), {
        color: "white",
      });

      expectTypeOf(buttonRule).toExtend<
        WithMetadata<{}, Readonly<{ ".primary-button": { color: "white" } }>>
      >();

      const divRule = styleRule(select.element("section"), {
        display: "block",
      });
      expectTypeOf(divRule).toExtend<
        WithMetadata<{}, Readonly<{ section: { display: "block" } }>>
      >();
    });
  });

  describe("varargs body parameters", () => {
    it("accepts multiple body items as separate arguments", () => {
      const result = styleRule(
        select.cls("card"),
        { padding: "1rem" },
        { margin: "0.5rem" },
        { display: "flex" },
      );

      expectTypeOf(result).toExtend<
        WithMetadata<
          {},
          Readonly<{
            ".card": { padding: "1rem"; margin: "0.5rem"; display: "flex" };
          }>
        >
      >();
      expect(result.body).toEqual([
        {
          $ast: "style-list",
          styles: [{ padding: "1rem" }],
        },
        {
          $ast: "style-list",
          styles: [{ margin: "0.5rem" }],
        },
        {
          $ast: "style-list",
          styles: [{ display: "flex" }],
        },
      ]);
    });

    it("mixes style properties and nested rules", () => {
      const nestedRule = styleRule(select.pseudo("hover"), { opacity: "0.8" });
      const result = styleRule(
        select.cls("button"),
        { padding: "0.5rem 1rem" },
        nestedRule,
        { "background-color": "blue" },
      );

      expectTypeOf(result).toExtend<
        WithMetadata<
          {},
          Readonly<{
            ".button": {
              padding: "0.5rem 1rem";
              ":hover": { opacity: "0.8" };
              "background-color": "blue";
            };
          }>
        >
      >();

      expect(result.body).toEqual([
        {
          $ast: "style-list",
          styles: [{ padding: "0.5rem 1rem" }],
        },
        nestedRule,
        {
          $ast: "style-list",
          styles: [{ "background-color": "blue" }],
        },
      ]);
    });
  });

  describe("nested rules with $ syntax", () => {
    it("transforms $ nested selectors to StyleRuleAst array", () => {
      const result = styleRule(select.cls("button"), {
        padding: "0.5rem 1rem",
        $: {
          ":hover": { opacity: "0.8" },
          ":active": { opacity: "0.6" },
        },
      });

      expect(result.body).toHaveLength(3);
      expect(result.body[0]).toEqual({
        $ast: "style-list",
        styles: [{ padding: "0.5rem 1rem" }],
      });
      expect(result.body[1]).toMatchObject({
        $ast: "style-rule",
        selector: ":hover",
      });
      expect(result.body[2]).toMatchObject({
        $ast: "style-rule",
        selector: ":active",
      });
    });

    it("allows deeply nested rules with multiple $ levels", () => {
      const result = styleRule(select.cls("outer"), {
        margin: "1rem",
        $: {
          ".inner": {
            padding: "0.5rem",
            $: {
              ":hover": { opacity: "0.8" },
            },
          },
        },
      });

      expect(result.body).toHaveLength(2);
      expect(result.body[0]).toEqual({
        $ast: "style-list",
        styles: [{ margin: "1rem" }],
      });
      expect(result.body[1]).toMatchObject({
        $ast: "style-rule",
        selector: ".inner",
      });
      const innerRule = result.body[1] as StyleRuleAst;
      expect(innerRule.body).toHaveLength(2);
    });

    it("handles $ with array of body builders", () => {
      const result: StyleRuleAst = styleRule(select.cls("card"), {
        display: "flex",
        $: {
          ":hover": [{ opacity: "0.9" }, { transform: "scale(1.05)" }],
        },
      });

      // Should have 2 items: style-list for display, and style-rule for :hover
      expect(result.body.length).toBeGreaterThanOrEqual(2);
      expect(result.body[0]).toMatchObject({ $ast: "style-list" });

      // Verify second item is the hover rule
      const secondItem = result.body[1];
      expect(secondItem).toBeDefined();
      expect(secondItem).toMatchObject({
        $ast: "style-rule",
        selector: ":hover",
      });

      // Check body length if it's a style-rule
      if (secondItem && secondItem.$ast === "style-rule") {
        expect(secondItem.body).toHaveLength(2);
      }
    });
  });

  describe("tailwind utilities integration", () => {
    it("accepts tailwind utility strings and converts to TailwindClassAst", () => {
      const result = styleRule(select.cls("button"), "flex", "items-center");

      expectTypeOf(result).toExtend<
        WithMetadata<{}, { ".button": { tw: "flex" | "items-center" } }>
      >();
      expect(result.body).toHaveLength(2);
      expect(result.body[0]).toEqual({
        $ast: "tailwind-class",
        value: "flex",
      });
      expect(result.body[1]).toEqual({
        $ast: "tailwind-class",
        value: "items-center",
      });
    });

    it("mixes tailwind utilities with style properties", () => {
      const result = styleRule(
        select.cls("card"),
        "flex",
        { padding: "1rem" },
        "rounded-lg",
      );

      expectTypeOf(result).toExtend<
        WithMetadata<
          {},
          {
            ".card": {
              tw: "flex" | "rounded-lg";
              padding: "1rem";
            };
          }
        >
      >();
      expect(result.body).toHaveLength(3);
      expect(result.body[0]).toEqual({
        $ast: "tailwind-class",
        value: "flex",
      });
      expect(result.body[1]).toEqual({
        $ast: "style-list",
        styles: [{ padding: "1rem" }],
      });
      expect(result.body[2]).toEqual({
        $ast: "tailwind-class",
        value: "rounded-lg",
      });
    });

    it("accepts TailwindClassAst objects directly", () => {
      const twClass = tw("bg-blue-500");
      const result = styleRule(select.cls("button"), twClass);

      expectTypeOf(result).toExtend<
        WithMetadata<{}, { ".button": { tw: "bg-blue-500" } }>
      >();
      expect(result.body).toEqual([twClass]);
    });
  });

  describe("StyleListAst integration", () => {
    it("accepts StyleListAst directly", () => {
      const list = styleList({ color: "red" });
      const result = styleRule(select.cls("text"), list);

      expectTypeOf(result).toExtend<
        WithMetadata<{}, Readonly<{ ".text": { color: "red" } }>>
      >();
    });
  });

  describe("component-style nested rules", () => {
    it("allows building component with multiple nested rules as varargs", () => {
      const component = styleRule(
        select.cls("card"),
        { padding: "1rem", border: "1px solid gray" },
        styleRule(select.pseudo("hover"), { "border-color": "blue" }),
        styleRule(select.descendant(select.cls("card"), select.cls("title")), {
          "font-size": "1.5rem",
        }),
      );

      expect(component.$ast).toBe("style-rule");
      expect(component.selector).toBe(".card");
      expect(Array.isArray(component.body)).toBe(true);
      expect(component.body).toHaveLength(3);
      expect(component.body[0]).toMatchObject({ $ast: "style-list" });
      expect(component.body[1]).toMatchObject({
        $ast: "style-rule",
        selector: ":hover",
      });
      expect(component.body[2]).toMatchObject({
        $ast: "style-rule",
        selector: ".card .title",
      });
    });
  });

  describe("type compatibility", () => {
    it("StyleRuleAst is assignable from styleRule() return type", () => {
      const result = styleRule(select.cls("test"), { color: "red" });
      const typed: StyleRuleAst = result;
      expect(typed.$ast).toBe("style-rule");
    });

    it("maintains generic selector type", () => {
      function createRule<S extends Selector>(selector: S) {
        return styleRule(selector, { padding: "0.5rem" });
      }

      const result = createRule(select.cls("btn"));
      expectTypeOf(result).toExtend<
        WithMetadata<{}, Readonly<{ ".btn": { padding: "0.5rem" } }>>
      >();
    });
  });

  describe("runtime behavior", () => {
    it("correctly extracts value from selector", () => {
      const selector = select.cls("test");
      expect(selector).toBe(".test");

      const result = styleRule(selector);
      expectTypeOf(result).toExtend<
        WithMetadata<{}, Readonly<{ ".test": {} }>>
      >();
      expect(result.selector).toBe(".test");
      expect(result.selector).toBe(selector);
      expect(result.body).toEqual([]);
    });

    it("flattens nested body items correctly", () => {
      const result = styleRule(
        select.cls("complex"),
        { color: "red" },
        { $: { ":hover": { color: "blue" } } },
        { margin: "1rem" },
      );

      expectTypeOf(result).toExtend<
        WithMetadata<
          {},
          Readonly<{
            ".complex": {
              color: "red";
              ":hover": { color: "blue" };
              margin: "1rem";
            };
          }>
        >
      >();

      expect(result.body).toEqual([
        {
          $ast: "style-list",
          styles: [{ color: "red" }],
        },
        {
          $ast: "style-rule",
          selector: ":hover",
          body: [
            {
              $ast: "style-list",
              styles: [{ color: "blue" }],
            },
          ],
        },
        {
          $ast: "style-list",
          styles: [{ margin: "1rem" }],
        },
      ]);
    });
  });
});

describe("styleList function", () => {
  it("creates StyleListAst from style properties", () => {
    const result = styleList({ color: "red", padding: "1rem" });

    expectTypeOf(result.$ast).toEqualTypeOf<"style-list">();
    expectTypeOf(result).toExtend<
      WithMetadata<{}, Readonly<{ color: "red"; padding: "1rem" }>>
    >();
    expect(result).toEqual({
      $ast: "style-list",
      styles: [{ color: "red", padding: "1rem" }],
    });
  });

  it("creates StyleListAst from tailwind utility strings", () => {
    const result = styleList("flex", "items-center", "justify-between");

    expectTypeOf(result.$ast).toEqualTypeOf<"style-list">();
    expectTypeOf(result).toExtend<
      WithMetadata<
        {},
        Readonly<{ tw: "flex" | "items-center" | "justify-between" }>
      >
    >();
    expect(result).toEqual({
      $ast: "style-list",
      styles: [
        { $ast: "tailwind-class", value: "flex" },
        { $ast: "tailwind-class", value: "items-center" },
        { $ast: "tailwind-class", value: "justify-between" },
      ],
    });
  });

  it("creates StyleListAst from TailwindClassAst objects", () => {
    const tw1 = tw("flex");
    const tw2 = tw("gap-4");
    const result = styleList(tw1, tw2);

    expectTypeOf(result).toExtend<
      WithMetadata<{}, Readonly<{ tw: "flex" | "gap-4" }>>
    >();
    expect(result).toEqual({
      $ast: "style-list",
      styles: [tw1, tw2],
    });
  });

  it("creates StyleListAst from mixed style builders", () => {
    const result = styleList(
      { color: "blue" },
      "flex",
      { padding: "0.5rem" },
      "rounded-lg",
    );

    expectTypeOf(result).toExtend<
      WithMetadata<
        {},
        Readonly<{
          color: "blue";
          padding: "0.5rem";
          tw: "flex" | "rounded-lg";
        }>
      >
    >();
    expect(result).toEqual({
      $ast: "style-list",
      styles: [
        { color: "blue" },
        { $ast: "tailwind-class", value: "flex" },
        { padding: "0.5rem" },
        { $ast: "tailwind-class", value: "rounded-lg" },
      ],
    });
  });

  it("handles empty styleList", () => {
    const result = styleList();

    expectTypeOf(result).toExtend<WithMetadata<{}, {}>>();
    expect(result).toEqual({
      $ast: "style-list",
      styles: [],
    });
  });

  it("preserves literal types for style properties", () => {
    const styles = {
      display: "flex",
      "flex-direction": "column",
      gap: "1rem",
    } as const;
    const result = styleList(styles);

    expectTypeOf(result).toExtend<
      WithMetadata<
        {},
        {
          display: "flex";
          "flex-direction": "column";
          gap: "1rem";
        }
      >
    >();
    expect(result.styles).toEqual([styles]);
  });

  it("works with styleRule integration", () => {
    const list = styleList("flex", { padding: "1rem" }, "items-center");
    const rule = styleRule(select.cls("container"), list);

    expectTypeOf(rule).toExtend<
      WithMetadata<
        {},
        Readonly<{
          ".container": {
            tw: "flex" | "items-center";
            padding: "1rem";
          };
        }>
      >
    >();
    expect(rule.body).toEqual([list]);
  });

  it("handles multiple style property objects", () => {
    const result = styleList(
      { color: "red" },
      { "background-color": "blue" },
      { margin: "1rem" },
    );

    expectTypeOf(result).toExtend<
      WithMetadata<
        {},
        { color: "red"; "background-color": "blue"; margin: "1rem" }
      >
    >();
    expect(result.styles).toEqual([
      { color: "red" },
      { "background-color": "blue" },
      { margin: "1rem" },
    ]);
  });
});
