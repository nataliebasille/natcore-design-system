import { describe, it, expect, expectTypeOf } from "vitest";
import {
  element,
  any,
  cls,
  id,
  attr,
  pseudo,
  pseudoElement,
  parent,
  descendant,
  child,
  adjacent,
  sibling,
  compound,
  list,
  type Selector,
} from "./selector";

describe("selector type tests", () => {
  describe("element()", () => {
    it("returns Lowercase<T> selector string", () => {
      const result = element("DIV");
      expectTypeOf(result).toEqualTypeOf<"div">();
      expect(result).toEqual("div");
    });

    it("validates element selector format", () => {
      expect(() => element("div")).not.toThrow();
      expect(() => element("my-element")).not.toThrow();
      expect(() => element("div123")).not.toThrow();
      expect(() => element("invalid selector")).toThrow();
      expect(() => element("123invalid")).toThrow();
    });
  });

  describe("any()", () => {
    it("returns '*' selector string", () => {
      const result = any();
      expectTypeOf(result).toEqualTypeOf<"*">();
      expect(result).toEqual("*");
    });
  });

  describe("cls()", () => {
    it("returns `.${T}` selector string", () => {
      const result = cls("button");
      expectTypeOf(result).toEqualTypeOf<".button">();
      expect(result).toEqual(".button");
    });
  });

  describe("id()", () => {
    it("returns `#${T}` selector string", () => {
      const result = id("main");
      expectTypeOf(result).toEqualTypeOf<"#main">();
      expect(result).toEqual("#main");
    });
  });

  describe("attr()", () => {
    it("returns `[${T}]` selector string", () => {
      const result = attr("data-test");
      expectTypeOf(result).toEqualTypeOf<"[data-test]">();
      expect(result).toEqual("[data-test]");
    });
  });

  describe("pseudo()", () => {
    it("returns `:${T}` selector string", () => {
      const result = pseudo("hover");
      expectTypeOf(result).toEqualTypeOf<":hover">();
      expect(result).toEqual(":hover");
    });
  });

  describe("pseudoElement()", () => {
    it("returns `::${T}` selector string", () => {
      const result = pseudoElement("before");
      expectTypeOf(result).toEqualTypeOf<"::before">();
      expect(result).toEqual("::before");
    });
  });

  describe("parent()", () => {
    it("returns `&${T}` selector string", () => {
      const result = parent(":hover");
      expectTypeOf(result).toEqualTypeOf<"&:hover">();
      expect(result).toEqual("&:hover");
    });

    it("returns `&` when no suffix provided", () => {
      const result = parent();
      expectTypeOf(result).toEqualTypeOf<"&">();
      expect(result).toEqual("&");
    });
  });

  describe("descendant()", () => {
    it("returns descendant combinator selector string", () => {
      const result = descendant(cls("parent"), cls("child"));
      expectTypeOf(result).toEqualTypeOf<".parent .child">();
      expect(result).toEqual(".parent .child");
    });

    it("works with element selectors", () => {
      const result = descendant(element("div"), cls("button"));
      expectTypeOf(result).toEqualTypeOf<"div .button">();
      expect(result).toEqual("div .button");
    });
  });

  describe("child()", () => {
    it("returns child combinator selector string", () => {
      const result = child(cls("parent"), cls("child"));
      expectTypeOf(result).toEqualTypeOf<".parent > .child">();
      expect(result).toEqual(".parent > .child");
    });

    it("works with element selectors", () => {
      const result = child(element("ul"), element("li"));
      expectTypeOf(result).toEqualTypeOf<"ul > li">();
      expect(result).toEqual("ul > li");
    });
  });

  describe("adjacent()", () => {
    it("returns adjacent sibling combinator selector string", () => {
      const result = adjacent(cls("prev"), cls("next"));
      expectTypeOf(result).toEqualTypeOf<".prev + .next">();
      expect(result).toEqual(".prev + .next");
    });

    it("works with element selectors", () => {
      const result = adjacent(element("h1"), element("p"));
      expectTypeOf(result).toEqualTypeOf<"h1 + p">();
      expect(result).toEqual("h1 + p");
    });
  });

  describe("sibling()", () => {
    it("returns general sibling combinator selector string", () => {
      const result = sibling(cls("prev"), cls("sibling"));
      expectTypeOf(result).toEqualTypeOf<".prev ~ .sibling">();
      expect(result).toEqual(".prev ~ .sibling");
    });

    it("works with element selectors", () => {
      const result = sibling(element("h1"), element("p"));
      expectTypeOf(result).toEqualTypeOf<"h1 ~ p">();
      expect(result).toEqual("h1 ~ p");
    });
  });

  describe("compound()", () => {
    it("returns single selector when given one argument", () => {
      const result = compound(cls("button"));
      expectTypeOf(result).toEqualTypeOf<".button">();
      expect(result).toEqual(".button");
    });

    it("returns compound template literal for multiple selectors", () => {
      const result = compound(element("div"), cls("button"), id("main"));
      expectTypeOf(result).toEqualTypeOf<"div.button#main">();
      expect(result).toEqual("div.button#main");
    });

    it("builds compound selectors correctly", () => {
      const result = compound(
        element("button"),
        cls("primary"),
        pseudo("hover"),
      );
      expect(result).toEqual("button.primary:hover");
    });
  });

  describe("list()", () => {
    it("returns single selector when given one argument", () => {
      const result = list(cls("button"));
      expectTypeOf(result).toEqualTypeOf<".button">();
      expect(result).toEqual(".button");
    });

    it("returns selector list template literal for multiple selectors", () => {
      const result = list(cls("button"), cls("link"), cls("input"));
      expectTypeOf(result).toEqualTypeOf<".button, .link, .input">();
      expect(result).toEqual(".button, .link, .input");
    });

    it("builds selector lists correctly", () => {
      const result = list(element("button"), cls("btn"), id("submit"));
      expect(result).toEqual("button, .btn, #submit");
    });
  });

  describe("complex selector combinations", () => {
    it("builds complex nested selectors", () => {
      const complexSelector = child(
        compound(element("div"), cls("container")),
        descendant(cls("item"), pseudo("hover")),
      );
      expect(complexSelector).toEqual("div.container > .item :hover");
    });

    it("builds selector lists with combinators", () => {
      const listSelector = list(
        descendant(element("ul"), element("li")),
        child(cls("nav"), cls("item")),
        compound(element("a"), pseudo("visited")),
      );
      expect(listSelector).toEqual("ul li, .nav > .item, a:visited");
    });
  });
});
