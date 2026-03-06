import { select } from "./selector.ts";

describe("selector type tests", () => {
  describe("select.element()", () => {
    it("returns Lowercase<T> selector string", () => {
      const result = select.element("DIV");
      expectTypeOf(result).toEqualTypeOf<"div">();
      expect(result).toEqual("div");
    });

    it("validates element selector format", () => {
      expect(() => select.element("div")).not.toThrow();
      expect(() => select.element("my-element")).not.toThrow();
      expect(() => select.element("div123")).not.toThrow();
      expect(() => select.element("invalid selector")).toThrow();
      expect(() => select.element("123invalid")).toThrow();
    });
  });

  describe("select.any()", () => {
    it("returns '*' selector string", () => {
      const result = select.any();
      expectTypeOf(result).toEqualTypeOf<"*">();
      expect(result).toEqual("*");
    });
  });

  describe("select.cls()", () => {
    it("returns `.${T}` selector string", () => {
      const result = select.cls("button");
      expectTypeOf(result).toEqualTypeOf<".button">();
      expect(result).toEqual(".button");
    });
  });

  describe("select.id()", () => {
    it("returns `#${T}` selector string", () => {
      const result = select.id("main");
      expectTypeOf(result).toEqualTypeOf<"#main">();
      expect(result).toEqual("#main");
    });
  });

  describe("select.attr()", () => {
    it("returns `[${T}]` selector string", () => {
      const result = select.attr("data-test");
      expectTypeOf(result).toEqualTypeOf<"[data-test]">();
      expect(result).toEqual("[data-test]");
    });
  });

  describe("select.pseudo()", () => {
    it("returns `:${T}` selector string", () => {
      const result = select.pseudo("hover");
      expectTypeOf(result).toEqualTypeOf<":hover">();
      expect(result).toEqual(":hover");
    });
  });

  describe("select.pseudoElement()", () => {
    it("returns `::${T}` selector string", () => {
      const result = select.pseudoElement("before");
      expectTypeOf(result).toEqualTypeOf<"::before">();
      expect(result).toEqual("::before");
    });
  });

  describe("select.parent()", () => {
    it("returns `&${T}` selector string", () => {
      const result = select.parent(":hover");
      expectTypeOf(result).toEqualTypeOf<"&:hover">();
      expect(result).toEqual("&:hover");
    });

    it("returns `&` when no suffix provided", () => {
      const result = select.parent();
      expectTypeOf(result).toEqualTypeOf<"&">();
      expect(result).toEqual("&");
    });
  });

  describe("select.descendant()", () => {
    it("returns descendant combinator selector string", () => {
      const result = select.descendant(select.cls("parent"), select.cls("child"));
      expectTypeOf(result).toEqualTypeOf<".parent .child">();
      expect(result).toEqual(".parent .child");
    });

    it("works with element selectors", () => {
      const result = select.descendant(select.element("div"), select.cls("button"));
      expectTypeOf(result).toEqualTypeOf<"div .button">();
      expect(result).toEqual("div .button");
    });
  });

  describe("select.child()", () => {
    it("returns child combinator selector string", () => {
      const result = select.child(select.cls("parent"), select.cls("child"));
      expectTypeOf(result).toEqualTypeOf<".parent > .child">();
      expect(result).toEqual(".parent > .child");
    });

    it("works with element selectors", () => {
      const result = select.child(select.element("ul"), select.element("li"));
      expectTypeOf(result).toEqualTypeOf<"ul > li">();
      expect(result).toEqual("ul > li");
    });
  });

  describe("select.adjacent()", () => {
    it("returns adjacent sibling combinator selector string", () => {
      const result = select.adjacent(select.cls("prev"), select.cls("next"));
      expectTypeOf(result).toEqualTypeOf<".prev + .next">();
      expect(result).toEqual(".prev + .next");
    });

    it("works with element selectors", () => {
      const result = select.adjacent(select.element("h1"), select.element("p"));
      expectTypeOf(result).toEqualTypeOf<"h1 + p">();
      expect(result).toEqual("h1 + p");
    });
  });

  describe("select.sibling()", () => {
    it("returns general sibling combinator selector string", () => {
      const result = select.sibling(select.cls("prev"), select.cls("sibling"));
      expectTypeOf(result).toEqualTypeOf<".prev ~ .sibling">();
      expect(result).toEqual(".prev ~ .sibling");
    });

    it("works with element selectors", () => {
      const result = select.sibling(select.element("h1"), select.element("p"));
      expectTypeOf(result).toEqualTypeOf<"h1 ~ p">();
      expect(result).toEqual("h1 ~ p");
    });
  });

  describe("select.compound()", () => {
    it("returns single selector when given one argument", () => {
      const result = select.compound(select.cls("button"));
      expectTypeOf(result).toEqualTypeOf<".button">();
      expect(result).toEqual(".button");
    });

    it("returns compound template literal for multiple selectors", () => {
      const result = select.compound(select.element("div"), select.cls("button"), select.id("main"));
      expectTypeOf(result).toEqualTypeOf<"div.button#main">();
      expect(result).toEqual("div.button#main");
    });

    it("builds compound selectors correctly", () => {
      const result = select.compound(
        select.element("button"),
        select.cls("primary"),
        select.pseudo("hover"),
      );
      expect(result).toEqual("button.primary:hover");
    });
  });

  describe("select.list()", () => {
    it("returns single selector when given one argument", () => {
      const result = select.list(select.cls("button"));
      expectTypeOf(result).toEqualTypeOf<".button">();
      expect(result).toEqual(".button");
    });

    it("returns selector list template literal for multiple selectors", () => {
      const result = select.list(select.cls("button"), select.cls("link"), select.cls("input"));
      expectTypeOf(result).toEqualTypeOf<".button, .link, .input">();
      expect(result).toEqual(".button, .link, .input");
    });

    it("builds selector lists correctly", () => {
      const result = select.list(select.element("button"), select.cls("btn"), select.id("submit"));
      expect(result).toEqual("button, .btn, #submit");
    });
  });

  describe("complex selector combinations", () => {
    it("builds complex nested selectors", () => {
      const complexSelector = select.child(
        select.compound(select.element("div"), select.cls("container")),
        select.descendant(select.cls("item"), select.pseudo("hover")),
      );
      expect(complexSelector).toEqual("div.container > .item :hover");
    });

    it("builds selector lists with combinators", () => {
      const listSelector = select.list(
        select.descendant(select.element("ul"), select.element("li")),
        select.child(select.cls("nav"), select.cls("item")),
        select.compound(select.element("a"), select.pseudo("visited")),
      );
      expect(listSelector).toEqual("ul li, .nav > .item, a:visited");
    });
  });
});
