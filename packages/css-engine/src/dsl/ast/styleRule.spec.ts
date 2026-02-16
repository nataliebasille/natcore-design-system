import { describe, it, expect, expectTypeOf } from "vitest";
import { styleRule, type StyleRuleAst } from "./styleRule";
import {
  cls,
  element,
  id,
  pseudo,
  descendant,
  type Selector,
} from "./selector";

describe("rule type tests", () => {
  describe("rule()", () => {
    it("returns RuleAst with correct selector and body types", () => {
      const result = styleRule(cls("button"), { color: "red" });
      expectTypeOf(result).toExtend<{
        $ast: "style-rule";
        selector: ".button";
        body: { color: "red" };
      }>();
      expect(result).toEqual({
        $ast: "style-rule",
        selector: ".button",
        body: { color: "red" },
      });
    });

    it("preserves exact body type with literal values", () => {
      const body = {
        padding: "1rem",
        margin: "0.5rem",
        display: "flex",
      } as const;
      const result = styleRule(cls("card"), body);

      expectTypeOf(result).toExtend<{
        $ast: "style-rule";
        selector: ".card";
        body: {
          readonly padding: "1rem";
          readonly margin: "0.5rem";
          readonly display: "flex";
        };
      }>();
      expect(result.body).toEqual(body);
    });

    it("preserves nested RuleAst in body type", () => {
      const nestedRule = styleRule(pseudo("hover"), { opacity: "0.8" });
      const result = styleRule(cls("button"), nestedRule);

      expectTypeOf(result).toExtend<{
        $ast: "style-rule";
        selector: ".button";
        body: {
          $ast: "style-rule";
          selector: ":hover";
          body: { opacity: "0.8" };
        };
      }>();
      expect(result.body).toEqual(nestedRule);
    });

    it("accepts SelectorAst and extracts value", () => {
      const buttonClass = cls("button");
      expectTypeOf(buttonClass).toExtend<".button">();

      const result = styleRule(buttonClass, { color: "blue" });
      expect(result.selector).toBe(".button");
      expect(result.$ast).toBe("style-rule");
    });

    it("works with element selectors", () => {
      const result = styleRule(element("div"), {
        display: "flex",
        padding: "1rem",
      });
      expectTypeOf(result).toExtend<StyleRuleAst<"div">>();
      expectTypeOf(result.selector).toExtend<"div">();
      expect(result).toEqual({
        $ast: "style-rule",
        selector: "div",
        body: {
          display: "flex",
          padding: "1rem",
        },
      });
    });

    it("works with id selectors", () => {
      const result = styleRule(id("main"), { width: "100%" });
      expectTypeOf(result).toExtend<StyleRuleAst<"#main">>();
      expectTypeOf(result.selector).toExtend<"#main">();
      expect(result).toEqual({
        $ast: "style-rule",
        selector: "#main",
        body: { width: "100%" },
      });
    });

    it("works with pseudo-class selectors", () => {
      const result = styleRule(pseudo("hover"), { opacity: "0.8" });
      expectTypeOf(result).toExtend<StyleRuleAst<":hover">>();
      expectTypeOf(result.selector).toExtend<":hover">();
      expect(result).toEqual({
        $ast: "style-rule",
        selector: ":hover",
        body: { opacity: "0.8" },
      });
    });

    it("works with combinator selectors", () => {
      const result = styleRule(descendant(element("ul"), element("li")), {
        "list-style": "none",
      });
      expectTypeOf(result).toExtend<StyleRuleAst<"ul li">>();
      expectTypeOf(result.selector).toExtend<"ul li">();
      expect(result).toEqual({
        $ast: "style-rule",
        selector: "ul li",
        body: { "list-style": "none" },
      });
    });

    it("accepts nested RuleAst as body", () => {
      const nestedRule: StyleRuleAst = {
        $ast: "style-rule",
        selector: "&:hover",
        body: { opacity: "0.9" },
      };

      const result = styleRule(cls("button"), nestedRule);
      expectTypeOf(result).toExtend<StyleRuleAst<".button">>();
      expect(result).toEqual({
        $ast: "style-rule",
        selector: ".button",
        body: nestedRule,
      });
    });

    it("accepts array of style properties", () => {
      const result = styleRule(cls("card"), {
        padding: "1rem",
        margin: "0.5rem",
      });
      expectTypeOf(result).toExtend<StyleRuleAst<".card">>();
      expectTypeOf(result.selector).toExtend<".card">();
      expect(result).toEqual({
        $ast: "style-rule",
        selector: ".card",
        body: { padding: "1rem", margin: "0.5rem" },
      });
    });

    it("accepts array with mixed style properties and nested rules", () => {
      const nestedRule: StyleRuleAst = {
        $ast: "style-rule",
        selector: "&:hover",
        body: { transform: "scale(1.05)" },
      };

      const result = styleRule(cls("button"), {
        padding: "0.5rem 1rem",
        "background-color": "blue",
        $: { "&:hover": nestedRule },
      });

      expect(result).toEqual({
        $ast: "style-rule",
        selector: ".button",
        body: {
          padding: "0.5rem 1rem",
          "background-color": "blue",
          $: { "&:hover": nestedRule },
        },
      });
    });

    it("preserves exact selector literal type", () => {
      const buttonRule = styleRule(cls("primary-button"), { color: "white" });
      expectTypeOf(buttonRule.selector).toExtend<".primary-button">();

      const divRule = styleRule(element("SECTION"), { display: "block" });
      expectTypeOf(divRule.selector).toExtend<"section">();
    });
  });

  describe("nested rules", () => {
    it("allows building component-style nested rules", () => {
      const component = styleRule(
        cls("card"),
        { padding: "1rem", border: "1px solid gray" },
        styleRule(pseudo("hover"), { "border-color": "blue" }),
        styleRule(descendant(cls("card"), cls("title")), {
          "font-size": "1.5rem",
        }),
      );

      expect(component.$ast).toBe("style-rule");
      expect(component.selector).toBe(".card");
      expect(typeof component.body).toBe("object");
    });

    it("allows deeply nested rules", () => {
      const deepRule = styleRule(cls("outer"), {
        margin: "1rem",
        $: {
          ".inner": { padding: "0.5rem", $: { ":hover": { opacity: "0.8" } } },
        },
      });

      expect(deepRule.body).toHaveProperty("$");
      const innerBody = (deepRule.body as any).$[".inner"];
      expect(innerBody).toHaveProperty("padding");
    });
  });

  describe("type compatibility", () => {
    it("RuleAst is assignable from rule() return type", () => {
      const result = styleRule(cls("test"), { color: "red" });
      const typed: StyleRuleAst = result;
      expect(typed.$ast).toBe("style-rule");
    });

    it("maintains generic selector type", () => {
      function createRule<S extends Selector>(selector: S): StyleRuleAst<S> {
        return styleRule(selector, { padding: "0.5rem" });
      }

      const result = createRule(cls("btn"));
      expectTypeOf(result).toExtend<StyleRuleAst<".btn">>();
      expect(result.selector).toBe(".btn");
    });
  });

  describe("runtime behavior", () => {
    it("correctly extracts value from SelectorAst", () => {
      const selector = cls("test");
      expect(selector).toBe(".test");

      const result = styleRule(selector, {});
      expect(result.selector).toBe(".test");
      expect(result.selector).toBe(selector);
    });
  });
});
