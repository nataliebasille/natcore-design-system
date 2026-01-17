import { describe, expectTypeOf, it, expect, vi } from "vitest";
import { visit, type ParentVisitorNode } from "./visit";
import { styleRule, type StyleRuleAst } from "../ast/styleRule";
import {
  cls,
  element,
  id,
  pseudo,
  pseudoElement,
  attr,
  parent,
  descendant,
  child,
  adjacent,
  sibling,
  compound,
  list,
  type Selector,
} from "../ast/selector";

describe("selector visitor", () => {
  describe("type inference", () => {
    it("correctly infers node type in visitor function", () => {
      visit(styleRule(cls("test"), { color: "red" }), {
        selector: (node) => {
          expectTypeOf(node).toEqualTypeOf<Selector>();
        },
      });
    });
  });

  describe("visitor invocation", () => {
    it("calls selector visitor with selector node", () => {
      const selectorSpy = vi.fn();

      const ast = styleRule(cls("button"), {
        padding: "16px",
      });

      visit(ast, {
        selector: selectorSpy,
      });

      expect(selectorSpy).toHaveBeenCalledOnce();
      expect(selectorSpy).toHaveBeenCalledWith(".button", expect.any(Object));
    });

    it("calls selector visitor for each rule", () => {
      const selectorSpy = vi.fn();

      const ast = [
        styleRule(cls("button"), { padding: "8px" }),
        styleRule(cls("input"), { margin: "4px" }),
        styleRule(id("main"), { width: "100%" }),
      ];

      visit(ast, {
        selector: selectorSpy,
      });

      expect(selectorSpy).toHaveBeenCalledTimes(3);
    });

    it("calls selector visitor for nested rules", () => {
      const selectorSpy = vi.fn();

      const ast = styleRule(
        cls("parent"),
        { display: "block" },
        styleRule(cls("child"), { margin: "0" }),
      );

      visit(ast, {
        selector: selectorSpy,
      });

      expect(selectorSpy).toHaveBeenCalledTimes(2);
      expect(selectorSpy).toHaveBeenCalledWith(".parent", expect.any(Object));
      expect(selectorSpy).toHaveBeenCalledWith(".child", expect.any(Object));
    });

    it("handles different selector types", () => {
      const selectors: Selector[] = [];

      const ast = [
        styleRule(element("div"), { display: "block" }),
        styleRule(cls("card"), { padding: "16px" }),
        styleRule(id("header"), { height: "60px" }),
        styleRule(pseudo("hover"), { opacity: "0.8" }),
        styleRule(pseudoElement("before"), { content: "''" }),
        styleRule(attr("disabled"), { cursor: "not-allowed" }),
        styleRule("*", { boxSizing: "border-box" }),
      ];

      visit(ast, {
        selector: (node) => {
          selectors.push(node);
        },
      });

      expect(selectors).toEqual([
        "div",
        ".card",
        "#header",
        ":hover",
        "::before",
        "[disabled]",
        "*",
      ]);
    });
  });

  describe("visitor context", () => {
    it("receives style rule as parent", () => {
      const ast = styleRule(cls("test"), { color: "red" });

      visit(ast, {
        selector: (node, parent) => {
          expect(parent).toBeDefined();
          expect((parent as StyleRuleAst).type).toBe("style-rule");
          expect((parent as StyleRuleAst).selector).toBe(".test");
        },
      });
    });

    it("receives correct parent for nested rules", () => {
      const contexts: Array<{
        selector: Selector;
        parentHasSelector: boolean;
      }> = [];

      const ast = styleRule(
        cls("parent"),
        { color: "blue" },
        styleRule(cls("child"), { color: "red" }),
      );

      visit(ast, {
        selector: (node, parent) => {
          contexts.push({
            selector: node,
            parentHasSelector:
              parent ? "selector" in (parent as StyleRuleAst) : false,
          });
        },
      });

      expect(contexts).toHaveLength(2);
      expect(contexts[0]?.selector).toBe(".parent");
      expect(contexts[1]?.selector).toBe(".child");
    });
  });

  describe("visitor transformation", () => {
    it("allows visitor to return new selector", () => {
      const ast = styleRule(cls("old-selector"), { color: "red" });

      const result = visit(ast, {
        selector: () => cls("new-selector"),
      }) as StyleRuleAst;

      expect(result.selector).toBe(".new-selector");
    });

    it("allows visitor to transform based on selector value", () => {
      const ast = [
        styleRule(cls("button"), { padding: "8px" }),
        styleRule(cls("input"), { margin: "4px" }),
      ];

      const result = visit(ast, {
        selector: (node) => {
          if (node === ".button") {
            return ".btn";
          }
          return node;
        },
      });

      expect((result[0] as StyleRuleAst).selector).toBe(".btn");
      expect((result[1] as StyleRuleAst).selector).toBe(".input");
    });

    it("allows visitor to add prefixes to selectors", () => {
      const ast = [
        styleRule(cls("button"), { padding: "8px" }),
        styleRule(cls("card"), { margin: "16px" }),
      ];

      const result = visit(ast, {
        selector: (node) => {
          if (typeof node === "string" && node.startsWith(".")) {
            return `.prefix-${node.slice(1)}` as Selector;
          }
          return node;
        },
      });

      expect((result[0] as StyleRuleAst).selector).toBe(".prefix-button");
      expect((result[1] as StyleRuleAst).selector).toBe(".prefix-card");
    });

    it("allows visitor to return undefined", () => {
      const selectorSpy = vi.fn().mockReturnValue(undefined);

      const ast = styleRule(cls("test"), { color: "red" });
      const result = visit(ast, {
        selector: selectorSpy,
      }) as StyleRuleAst;

      expect(selectorSpy).toHaveBeenCalled();
      expect(result.selector).toBe(".test");
    });

    it("preserves original selector when visitor returns void", () => {
      const ast = styleRule(cls("preserved"), { color: "green" });

      const result = visit(ast, {
        selector: () => {
          // Perform some side effect but don't return
        },
      }) as StyleRuleAst;

      expect(result.selector).toBe(".preserved");
    });
  });

  describe("complex selectors", () => {
    it("handles compound selectors", () => {
      const ast = styleRule(compound("div", cls("card"), id("main")), {
        display: "flex",
      });

      visit(ast, {
        selector: (node) => {
          expect(typeof node).toBe("string");
        },
      });
    });

    it("handles descendant selectors", () => {
      const ast = styleRule(descendant(cls("parent"), cls("child")), {
        margin: "0",
      });

      visit(ast, {
        selector: (node) => {
          expect(node).toBe(".parent .child");
        },
      });
    });

    it("handles child combinator selectors", () => {
      const ast = styleRule(child(cls("parent"), cls("child")), {
        padding: "8px",
      });

      visit(ast, {
        selector: (node) => {
          expect(node).toBe(".parent > .child");
        },
      });
    });

    it("handles adjacent sibling selectors", () => {
      const ast = styleRule(adjacent(cls("first"), cls("second")), {
        marginTop: "16px",
      });

      visit(ast, {
        selector: (node) => {
          expect(node).toBe(".first + .second");
        },
      });
    });

    it("handles general sibling selectors", () => {
      const ast = styleRule(sibling(cls("first"), cls("sibling")), {
        color: "gray",
      });

      visit(ast, {
        selector: (node) => {
          expect(node).toBe(".first ~ .sibling");
        },
      });
    });

    it("handles selector lists", () => {
      const ast = styleRule(list(cls("button"), cls("link")), {
        cursor: "pointer",
      });

      visit(ast, {
        selector: (node) => {
          expect(node).toBe(".button, .link");
        },
      });
    });

    it("transforms complex compound selectors", () => {
      const ast = styleRule(compound("div", cls("old-class")), {
        display: "block",
      });

      const result = visit(ast, {
        selector: (node) => {
          if (typeof node === "string" && node.includes("old")) {
            return node.replace("old", "new") as Selector;
          }
          return node;
        },
      }) as StyleRuleAst;
      expect(result.selector).toBe("div.new-class");
    });
  });

  describe("pseudo-selectors and attribute selectors", () => {
    it("handles pseudo-class selectors", () => {
      const selectors: Selector[] = [];

      const ast = [
        styleRule(pseudo("hover"), { opacity: "0.8" }),
        styleRule(pseudo("focus"), { outline: "2px solid blue" }),
        styleRule(pseudo("active"), { transform: "scale(0.98)" }),
        styleRule(pseudo("disabled"), { cursor: "not-allowed" }),
      ];

      visit(ast, {
        selector: (node) => {
          selectors.push(node);
        },
      });

      expect(selectors).toEqual([":hover", ":focus", ":active", ":disabled"]);
    });

    it("handles pseudo-element selectors", () => {
      const selectors: Selector[] = [];

      const ast = [
        styleRule(pseudoElement("before"), { content: "''" }),
        styleRule(pseudoElement("after"), { display: "block" }),
        styleRule(pseudoElement("placeholder"), { color: "gray" }),
      ];

      visit(ast, {
        selector: (node) => {
          selectors.push(node);
        },
      });

      expect(selectors).toEqual(["::before", "::after", "::placeholder"]);
    });

    it("handles attribute selectors", () => {
      const selectors: Selector[] = [];

      const ast = [
        styleRule(attr("disabled"), { opacity: "0.5" }),
        styleRule(attr("type='text'"), { border: "1px solid" }),
        styleRule(attr("data-active='true'"), { fontWeight: "bold" }),
      ];

      visit(ast, {
        selector: (node) => {
          selectors.push(node);
        },
      });

      expect(selectors).toEqual([
        "[disabled]",
        "[type='text']",
        "[data-active='true']",
      ]);
    });

    it("transforms pseudo-class selectors", () => {
      const ast = styleRule(pseudo("hover"), { opacity: "0.8" });

      const result = visit(ast, {
        selector: (node) => {
          if (node === ":hover") {
            return ":focus-visible" as Selector;
          }
          return node;
        },
      }) as StyleRuleAst;

      expect(result.selector).toBe(":focus-visible");
    });
  });

  describe("parent reference selectors", () => {
    it("handles parent reference selector", () => {
      const ast = styleRule(parent(), { color: "red" });

      visit(ast, {
        selector: (node) => {
          expect(node).toBe("&");
        },
      });
    });

    it("handles parent reference with suffix", () => {
      const ast = styleRule(parent(":hover"), { opacity: "0.8" });

      visit(ast, {
        selector: (node) => {
          expect(node).toBe("&:hover");
        },
      });
    });

    it("transforms parent reference selectors", () => {
      const ast = styleRule(parent(":hover"), { opacity: "0.8" });

      const result = visit(ast, {
        selector: (node) => {
          if (typeof node === "string" && node.startsWith("&")) {
            return node.replace("&", ".parent") as Selector;
          }
          return node;
        },
      }) as StyleRuleAst;

      expect(result.selector).toBe(".parent:hover");
    });
  });

  describe("edge cases", () => {
    it("handles universal selector", () => {
      const ast = styleRule("*", { boxSizing: "border-box" });

      visit(ast, {
        selector: (node) => {
          expect(node).toBe("*");
        },
      });
    });

    it("handles element selector", () => {
      const ast = styleRule(element("div"), { display: "block" });

      visit(ast, {
        selector: (node) => {
          expect(node).toBe("div");
        },
      });
    });

    it("handles deeply nested selectors", () => {
      const selectorSpy = vi.fn();

      const ast = styleRule(
        cls("level1"),
        { color: "red" },
        styleRule(
          cls("level2"),
          { color: "green" },
          styleRule(
            cls("level3"),
            { color: "blue" },
            styleRule(cls("level4"), { color: "yellow" }),
          ),
        ),
      );

      visit(ast, {
        selector: selectorSpy,
      });

      expect(selectorSpy).toHaveBeenCalledTimes(4);
    });

    it("transforms selectors in deeply nested rules", () => {
      const ast = styleRule(
        cls("level1"),
        { color: "red" },
        styleRule(cls("level2"), { color: "green" }),
      );

      const result = visit(ast, {
        selector: (node) => {
          if (typeof node === "string" && node.startsWith(".level")) {
            return `.modified-${node.slice(1)}` as Selector;
          }
          return node;
        },
      });
      expect(result.selector).toBe(".modified-level1");

      const nestedRule = result.body[1];
      expect(nestedRule.selector).toBe(".modified-level2");
    });
  });

  describe("interaction with other visitors", () => {
    it("works alongside style-rule visitor", () => {
      const selectorSpy = vi.fn().mockImplementation((node) => node);
      const styleRuleSpy = vi.fn(); // Don't return anything so selector visitor runs

      const ast = styleRule(cls("test"), { color: "red" });

      visit(ast, {
        selector: selectorSpy,
        "style-rule": styleRuleSpy,
      });

      expect(selectorSpy).toHaveBeenCalled();
      expect(styleRuleSpy).toHaveBeenCalled();
    });

    it("selector transformation affects style-rule", () => {
      let capturedSelector: string | undefined;

      const ast = styleRule(cls("original"), { color: "red" });

      const result = visit(ast, {
        "style-rule": (node) => {
          // Style-rule visitor is called BEFORE selector transformation
          // So we should see the original selector here
          capturedSelector = node.selector as string;
        },
        selector: () => cls("transformed"),
      }) as StyleRuleAst;

      // Style-rule visitor saw the original
      expect(capturedSelector).toBe(".original");
      // But the final result has the transformed selector
      expect(result.selector).toBe(".transformed");
    });
  });
});
