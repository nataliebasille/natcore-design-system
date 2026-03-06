import { describe, it, expect, expectTypeOf } from "vitest";
import {
  atRule,
  media,
  mediaEnv,
  supports,
  container,
  layer,
  viewport,
  env,
  feature,
  scope,
  query,
  breakpoint,
  prefersDark,
  prefersLight,
  prefersReducedMotion,
  prefersHighContrast,
  supportsHover,
  supportsFinePointer,
  type AtRuleAst,
} from "./at-rule.ts";
import { styleRule, styleList, arbitraryValue } from "./style-rule.ts";
import { select } from "./selector.ts";

describe("at-rule tests", () => {
  describe("atRule()", () => {
    it("creates AtRuleAst with name, prelude, and rules", () => {
      const rule = styleRule(select.cls("container"), { maxWidth: "1200px" });
      const result = atRule("media", "(min-width: 768px)", rule);

      expect(result).toEqual({
        $ast: "at-rule",
        name: "media",
        prelude: "(min-width: 768px)",
        rules: [rule],
      });
      expectTypeOf(result).toMatchTypeOf<AtRuleAst>();
    });

    it("creates AtRuleAst without prelude", () => {
      const rule = styleRule(select.cls("button"), { padding: "8px" });
      const result = atRule("keyframes", rule);

      expect(result).toEqual({
        $ast: "at-rule",
        name: "keyframes",
        prelude: null,
        rules: [rule],
      });
      expectTypeOf(result).toMatchTypeOf<AtRuleAst>();
    });

    it("accepts multiple rules", () => {
      const rule1 = styleRule(select.cls("nav"), { display: "none" });
      const rule2 = styleRule(select.cls("main"), { padding: "1rem" });
      const result = atRule("media", "(max-width: 640px)", rule1, rule2);

      expect(result.rules).toHaveLength(2);
      expect(result.rules[0]).toBe(rule1);
      expect(result.rules[1]).toBe(rule2);
    });

    it("accepts multiple rules without prelude", () => {
      const rule1 = styleRule(select.cls("from"), { opacity: "0" });
      const rule2 = styleRule(select.cls("to"), { opacity: "1" });
      const result = atRule("keyframes", rule1, rule2);

      expect(result.rules).toHaveLength(2);
      expect(result.rules[0]).toBe(rule1);
      expect(result.rules[1]).toBe(rule2);
      expect(result.prelude).toBeNull();
    });

    it("accepts nested at-rules", () => {
      const innerRule = styleRule(select.cls("grid"), { display: "grid" });
      const nestedAtRule = atRule("supports", "(display: grid)", innerRule);
      const result = atRule("media", "(min-width: 1024px)", nestedAtRule);

      expect(result.rules[0]).toBe(nestedAtRule);
      expect(result.rules[0]?.$ast).toBe("at-rule");
    });

    it("accepts StyleListAst in rules", () => {
      const styles = styleList({ color: "red", padding: "1rem" });
      const result = atRule("keyframes", "fadeIn", styles);

      expect(result).toEqual({
        $ast: "at-rule",
        name: "keyframes",
        prelude: "fadeIn",
        rules: [styles],
      });
      expect(result.rules[0]?.$ast).toBe("style-list");
    });

    it("mixes StyleListAst with StyleRuleAst and AtRuleAst", () => {
      const styles = styleList({ opacity: "0" });
      const rule = styleRule(select.cls("from"), { transform: "scale(0)" });
      const nested = atRule(
        "media",
        "(prefers-reduced-motion: reduce)",
        styleRule(select.cls("to"), { transition: "none" }),
      );

      const result = atRule("keyframes", "bounce", styles, rule, nested);

      expect(result.rules).toHaveLength(3);
      expect(result.rules[0]?.$ast).toBe("style-list");
      expect(result.rules[1]?.$ast).toBe("style-rule");
      expect(result.rules[2]?.$ast).toBe("at-rule");
    });

    it("builds StyleListAst from style property objects", () => {
      const result = atRule("media", "(min-width: 768px)", {
        display: "flex",
        gap: "1rem",
      });

      expect(result.rules).toEqual([
        {
          $ast: "style-list",
          styles: [{ display: "flex", gap: "1rem" }],
        },
      ]);
      expect(result.rules[0]?.$ast).toBe("style-list");
    });

    it("builds TailwindClassAst from arbitrary utility objects", () => {
      const result = atRule(
        "media",
        "(min-width: 768px)",
        arbitraryValue("bg", "#101010"),
      );

      expect(result.rules).toEqual([
        {
          $ast: "tailwind-class",
          value: arbitraryValue("bg", "#101010"),
        },
      ]);
      expect(result.rules[0]?.$ast).toBe("tailwind-class");
    });
  });

  describe("media()", () => {
    it("creates media query with min-width", () => {
      const rule = styleRule(select.cls("container"), { maxWidth: "1200px" });
      const result = media("min-width", "768px", rule);

      expect(result).toEqual({
        $ast: "at-rule",
        name: "media",
        prelude: "(min-width: 768px)",
        rules: [rule],
      });
    });

    it("creates media query with max-width", () => {
      const rule = styleRule(select.cls("mobile"), { fontSize: "14px" });
      const result = media("max-width", "640px", rule);

      expect(result.name).toBe("media");
      expect(result.prelude).toBe("(max-width: 640px)");
    });

    it("creates media query with orientation", () => {
      const rule = styleRule(select.cls("layout"), { flexDirection: "column" });
      const result = media("orientation", "portrait", rule);

      expect(result.prelude).toBe("(orientation: portrait)");
    });

    it("creates media query with aspect-ratio", () => {
      const rule = styleRule(select.cls("video"), { aspectRatio: "16/9" });
      const result = media("aspect-ratio", "16/9", rule);

      expect(result.prelude).toBe("(aspect-ratio: 16/9)");
    });

    it("strongly types orientation values", () => {
      const portrait = media("orientation", "portrait");
      const landscape = media("orientation", "landscape");

      expectTypeOf(portrait).toMatchTypeOf<AtRuleAst>();
      expectTypeOf(landscape).toMatchTypeOf<AtRuleAst>();

      // @ts-expect-error - invalid orientation value
      media("orientation", "invalid");
    });
  });

  describe("mediaEnv()", () => {
    it("creates media query with color-scheme preference", () => {
      const rule = styleRule(select.cls("card"), {
        backgroundColor: "#1a1a1a",
      });
      const result = mediaEnv("color-scheme", "dark", rule);

      expect(result).toEqual({
        $ast: "at-rule",
        name: "media",
        prelude: "(prefers-color-scheme: dark)",
        rules: [rule],
      });
    });

    it("creates media query with contrast preference", () => {
      const rule = styleRule(select.cls("text"), { borderWidth: "2px" });
      const result = mediaEnv("contrast", "high", rule);

      expect(result.prelude).toBe("(prefers-contrast: high)");
    });

    it("creates media query with reduced-motion", () => {
      const rule = styleRule(select.cls("animated"), { animation: "none" });
      const result = mediaEnv("reduced-motion", "reduce", rule);

      expect(result.prelude).toBe("(prefers-reduced-motion: reduce)");
    });

    it("creates media query with hover capability", () => {
      const rule = styleRule(select.cls("link"), { cursor: "pointer" });
      const result = mediaEnv("hover", "hover", rule);

      expect(result.prelude).toBe("(prefers-hover: hover)");
    });

    it("creates media query with pointer precision", () => {
      const rule = styleRule(select.cls("precise"), { fontSize: "12px" });
      const result = mediaEnv("pointer", "fine", rule);

      expect(result.prelude).toBe("(prefers-pointer: fine)");
    });

    it("strongly types color-scheme values", () => {
      const dark = mediaEnv("color-scheme", "dark");
      const light = mediaEnv("color-scheme", "light");
      const noPreference = mediaEnv("color-scheme", "no-preference");

      expectTypeOf(dark).toMatchTypeOf<AtRuleAst>();
      expectTypeOf(light).toMatchTypeOf<AtRuleAst>();
      expectTypeOf(noPreference).toMatchTypeOf<AtRuleAst>();

      // @ts-expect-error - invalid color-scheme value
      mediaEnv("color-scheme", "blue");
    });
  });

  describe("supports()", () => {
    it("creates supports query with property and value", () => {
      const rule = styleRule(select.cls("grid"), { display: "grid" });
      const result = supports("display", "grid", rule);

      expect(result).toEqual({
        $ast: "at-rule",
        name: "supports",
        prelude: "(display: grid)",
        rules: [rule],
      });
    });

    it("creates supports query with property only", () => {
      const rule = styleRule(select.cls("transform"), {
        transform: "translateZ(0)",
      });
      const result = supports("transform-3d", undefined, rule);

      expect(result.prelude).toBe("(transform-3d)");
    });
  });

  describe("container()", () => {
    it("creates container query", () => {
      const rule = styleRule(select.cls("card"), { padding: "2rem" });
      const result = container("(min-width: 400px)", rule);

      expect(result).toEqual({
        $ast: "at-rule",
        name: "container",
        prelude: "(min-width: 400px)",
        rules: [rule],
      });
    });
  });

  describe("layer()", () => {
    it("creates layer at-rule", () => {
      const rule = styleRule(select.cls("button"), { padding: "8px 16px" });
      const result = layer("components", rule);

      expect(result).toEqual({
        $ast: "at-rule",
        name: "layer",
        prelude: "components",
        rules: [rule],
      });
    });
  });

  describe("breakpoint()", () => {
    it("creates media query wrapper for min-width", () => {
      const rule = styleRule(select.cls("container"), { maxWidth: "1200px" });
      const wrapper = breakpoint("min-width", "768px");
      const result = wrapper(rule);

      expect(result).toEqual({
        $ast: "at-rule",
        name: "media",
        prelude: "(min-width: 768px)",
        rules: [rule],
      });
    });

    it("creates media query wrapper for max-width", () => {
      const rule = styleRule(select.cls("mobile"), { fontSize: "14px" });
      const wrapper = breakpoint("max-width", "640px");
      const result = wrapper(rule);

      expect(result.prelude).toBe("(max-width: 640px)");
    });

    it("accepts multiple rules", () => {
      const rule1 = styleRule(select.cls("nav"), { display: "flex" });
      const rule2 = styleRule(select.cls("main"), { padding: "2rem" });
      const result = breakpoint("min-width", "1024px")(rule1, rule2);

      expect(result.rules).toHaveLength(2);
      expect(result.rules).toEqual([rule1, rule2]);
    });
  });

  describe("breakpoint convenience methods", () => {
    it("breakpoint.min() creates min-width media query", () => {
      const rule = styleRule(select.cls("container"), { width: "100%" });
      const result = breakpoint.min("768px")(rule);

      expect(result.name).toBe("media");
      expect(result.prelude).toBe("(min-width: 768px)");
    });

    it("breakpoint.max() creates max-width media query", () => {
      const rule = styleRule(select.cls("mobile"), { padding: "0.5rem" });
      const result = breakpoint.max("640px")(rule);

      expect(result.prelude).toBe("(max-width: 640px)");
    });

    it("breakpoint.minHeight() creates min-height media query", () => {
      const rule = styleRule(select.cls("tall"), { minHeight: "100vh" });
      const result = breakpoint.minHeight("600px")(rule);

      expect(result.prelude).toBe("(min-height: 600px)");
    });

    it("breakpoint.maxHeight() creates max-height media query", () => {
      const rule = styleRule(select.cls("short"), { overflow: "auto" });
      const result = breakpoint.maxHeight("400px")(rule);

      expect(result.prelude).toBe("(max-height: 400px)");
    });

    it("breakpoint.orientation() creates orientation media query", () => {
      const rule = styleRule(select.cls("portrait-layout"), {
        flexDirection: "column",
      });
      const result = breakpoint.orientation("portrait")(rule);

      expect(result.prelude).toBe("(orientation: portrait)");
    });

    it("breakpoint.aspectRatio() creates aspect-ratio media query", () => {
      const rule = styleRule(select.cls("widescreen"), { aspectRatio: "21/9" });
      const result = breakpoint.aspectRatio("21/9")(rule);

      expect(result.prelude).toBe("(aspect-ratio: 21/9)");
    });
  });

  describe("environment preference helpers", () => {
    it("prefersDark() creates dark color-scheme media query", () => {
      const rule = styleRule(select.cls("dark-card"), {
        backgroundColor: "#1a1a1a",
      });
      const result = prefersDark(rule);

      expect(result).toEqual({
        $ast: "at-rule",
        name: "media",
        prelude: "(prefers-color-scheme: dark)",
        rules: [rule],
      });
    });

    it("prefersLight() creates light color-scheme media query", () => {
      const rule = styleRule(select.cls("light-card"), {
        backgroundColor: "#ffffff",
      });
      const result = prefersLight(rule);

      expect(result.prelude).toBe("(prefers-color-scheme: light)");
    });

    it("prefersReducedMotion() creates reduced-motion media query", () => {
      const rule = styleRule(select.cls("no-anim"), { animation: "none" });
      const result = prefersReducedMotion(rule);

      expect(result.prelude).toBe("(prefers-reduced-motion: reduce)");
    });

    it("prefersHighContrast() creates high contrast media query", () => {
      const rule = styleRule(select.cls("high-contrast"), {
        borderWidth: "2px",
      });
      const result = prefersHighContrast(rule);

      expect(result.prelude).toBe("(prefers-contrast: high)");
    });

    it("supportsHover() creates hover media query", () => {
      const rule = styleRule(select.cls("hoverable"), {
        $: {
          [select.pseudo("hover")]: { opacity: "0.8" },
        },
      });
      const result = supportsHover(rule);

      expect(result.prelude).toBe("(prefers-hover: hover)");
    });

    it("supportsFinePointer() creates fine pointer media query", () => {
      const rule = styleRule(select.cls("precise"), { cursor: "pointer" });
      const result = supportsFinePointer(rule);

      expect(result.prelude).toBe("(prefers-pointer: fine)");
    });
  });

  describe("complex nested scenarios", () => {
    it("nests media query inside supports", () => {
      const innerRule = styleRule(select.cls("grid"), {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
      });
      const mediaQuery = media("min-width", "1024px", innerRule);
      const supportsQuery = supports("display", "grid", mediaQuery);

      expect(supportsQuery.rules[0]).toBe(mediaQuery);
      expect(supportsQuery.name).toBe("supports");
      expect((supportsQuery.rules[0] as AtRuleAst).name).toBe("media");
    });

    it("nests multiple levels of at-rules", () => {
      const rule = styleRule(select.cls("advanced"), { color: "blue" });
      const level1 = mediaEnv("color-scheme", "dark", rule);
      const level2 = mediaEnv("hover", "hover", level1);
      const level3 = media("min-width", "768px", level2);

      expect(level3.rules[0]).toBe(level2);
      expect(level2.rules[0]).toBe(level1);
      expect(level1.rules[0]).toBe(rule);
    });

    it("combines multiple rules under one at-rule", () => {
      const rule1 = styleRule(select.cls("nav"), { display: "flex" });
      const rule2 = styleRule(select.cls("sidebar"), { width: "250px" });
      const rule3 = styleRule(select.cls("main"), { marginLeft: "250px" });

      const result = media("min-width", "1024px", rule1, rule2, rule3);

      expect(result.rules).toHaveLength(3);
      expect(result.rules).toEqual([rule1, rule2, rule3]);
    });

    it("mixes regular and at-rule rules", () => {
      const baseRule = styleRule(select.cls("card"), { padding: "1rem" });
      const darkRule = prefersDark(
        styleRule(select.cls("card"), { backgroundColor: "#1a1a1a" }),
      );
      const responsiveRule = breakpoint.min("768px")(
        styleRule(select.cls("card"), { padding: "2rem" }),
      );

      const combined = layer("components", baseRule, darkRule, responsiveRule);

      expect(combined.rules).toHaveLength(3);
      expect(combined.rules[0]).toBe(baseRule);
      expect(combined.rules[1]?.$ast).toBe("at-rule");
      expect(combined.rules[2]?.$ast).toBe("at-rule");
    });
  });

  describe("integration with styleRule", () => {
    it("wraps styleRule with nested selectors", () => {
      const rule = styleRule(select.cls("button"), {
        padding: "8px 16px",
        $: {
          [select.pseudo("hover")]: {
            backgroundColor: "blue",
          },
          [select.pseudo("active")]: {
            backgroundColor: "darkblue",
          },
        },
      });

      const result = breakpoint.min("768px")(rule);

      expect(result.rules[0]).toBe(rule);
      const firstRule = result.rules[0];
      if (firstRule?.$ast === "style-rule") {
        expect(firstRule.body.length).toBeGreaterThan(0);
        expect(firstRule.body[0]?.$ast).toBe("style-list");
      }
    });

    it("applies at-rule to multiple style rules", () => {
      const button = styleRule(select.cls("button"), { fontSize: "16px" });
      const input = styleRule(select.cls("input"), { fontSize: "16px" });
      const selectRule = styleRule(select.cls("select"), { fontSize: "16px" });

      const result = breakpoint.min("768px")(button, input, selectRule);

      expect(result.rules).toEqual([button, input, selectRule]);
    });
  });
});
