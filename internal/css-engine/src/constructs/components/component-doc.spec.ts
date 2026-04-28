import { describe, expect, expectTypeOf, it } from "vitest";
import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";
import { createDoc } from "./component-doc.ts";
import { component } from "./component-builder.ts";
import { dsl, PALETTE } from "../../dsl/public.ts";

const showcaseNode = {} as ShowcaseJsxNode;

describe("createDoc", () => {
  describe("builder state typings", () => {
    it("preserves typed builder state across chained calls", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem" })
        .variant("primary", { "--color": "blue" })
        .defaultVariant("primary")
        .controlled("--size", { sm: "0.875rem" })
        .utility("icon", { display: "inline-flex" })
        .body({ padding: dsl.cssvar("--size") });

      expectTypeOf(builder.state.name).toEqualTypeOf<"btn">();
      expectTypeOf(
        builder.state.variants.selection.key,
      ).toEqualTypeOf<"primary">();
      expectTypeOf(
        builder.state.variants.values.primary["--color"],
      ).toEqualTypeOf<"blue">();
      expectTypeOf(builder.state.vars["--size"].candidates).toExtend<
        [{ sm: "0.875rem" }]
      >();
      expectTypeOf(builder.state.utilities).toHaveProperty("icon");
    });

    it("preserves parent state typing for derived builders", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem" })
        .derive("icon", (child) =>
          child.body({ padding: dsl.cssvar("--size") }),
        );

      expectTypeOf(builder.state.name).toEqualTypeOf<"icon">();
      expectTypeOf(builder.state.parent.name).toEqualTypeOf<"btn">();
      expectTypeOf(builder.state.parent.vars["--size"]).toEqualTypeOf<"1rem">();
    });
  });

  describe("top-level metadata", () => {
    it("includes name and description from meta", () => {
      const result = createDoc(component("btn"), {
        title: "Button",
        description: "A clickable button component",
        components: { btn: { name: "Button", description: "Base button" } },
      });

      expect(result.title).toBe("Button");
      expect(result.description).toBe("A clickable button component");
    });
  });

  describe("components", () => {
    it("registers the root component with name, description, and pattern", () => {
      const result = createDoc(component("btn"), {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base button" } },
      });

      expect(result.components["btn"]).toEqual({
        name: "Button",
        description: "Base button",
        pattern: { root: "btn" },
        composesWith: [],
      });
    });

    it("registers derived child components with resolved names", () => {
      // component keys in meta are leaf names; resolved names are used as output keys
      const builder = component("btn").derive("icon", (b) => b);

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: {
          btn: { name: "Button", description: "Base" },
          icon: { name: "Button Icon", description: "Icon slot" },
        },
      });

      expect(result.components["btn"]).toMatchObject({ name: "Button" });
      expect(result.components["icon"]).toMatchObject({
        name: "Button Icon",
      });
    });

    it("component pattern includes variant info when variants are referenced in body", () => {
      const builder = component("btn")
        .variant("primary", { "--color": "blue" })
        .variant("secondary", { "--color": "gray" })
        .defaultVariant("primary")
        .body({ color: dsl.cssvar("--color") });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: {
          btn: { name: "Button", description: "Base" },
          "btn@variant": {
            name: "Button Variant",
            description: "Variant form",
          },
        },
      });

      expect(result.components["btn"]!.pattern).toEqual({
        root: "btn",
        value: {
          name: "variant",
          default: "primary",
          tokens: ["primary", "secondary"],
        },
      });
    });

    it("component pattern includes both base and variant entries when variants are optional", () => {
      const builder = component("btn")
        .variant("primary", { "--color": "blue" })
        .variant("secondary", { "--color": "gray" })
        .optionalVariants()
        .body({ color: dsl.cssvar("--color") });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: {
          btn: { name: "Button", description: "Base" },
          "btn@variant": {
            name: "Button Variant",
            description: "Variant form",
          },
        },
      });

      expect(result.components["btn"]).toMatchObject({
        name: "Button",
        pattern: { root: "btn" },
      });
      expect(result.components["btn@variant"]).toMatchObject({
        name: "Button Variant",
        description: "Variant form",
        pattern: {
          root: "btn",
          value: {
            name: "variant",
            tokens: ["primary", "secondary"],
          },
        },
      });
    });

    it("optional single variant entries resolve to static component patterns", () => {
      const builder = component("divider")
        .variant("v", { "--direction": "column" })
        .optionalVariants()
        .body({ "flex-direction": dsl.cssvar("--direction") });

      const result = createDoc(builder, {
        title: "Divider",
        description: "...",
        components: {
          divider: { name: "Divider", description: "Base" },
          "divider@variant": {
            name: "Vertical Divider",
            description: "Vertical form",
          },
        },
      });

      expect(result.components["divider"]).toMatchObject({
        name: "Divider",
        pattern: { root: "divider" },
      });
      expect(result.components["divider@variant"]).toMatchObject({
        name: "Vertical Divider",
        description: "Vertical form",
        pattern: { root: "divider-v" },
      });
      expect(
        result.components["divider@variant"]!.pattern.value,
      ).toBeUndefined();
    });

    it("required single variant entries resolve to static component patterns", () => {
      const builder = component("badge")
        .variant("solid", { "--weight": "700" })
        .defaultVariant("solid")
        .body({ "font-weight": dsl.cssvar("--weight") });

      const result = createDoc(builder, {
        title: "Badge",
        description: "...",
        components: {
          badge: { name: "Badge", description: "Solid badge" },
        },
      });

      expect(result.components["badge"]!.pattern).toEqual({
        root: "badge-solid",
      });
    });

    it("component pattern includes palette modifier when component uses current color", () => {
      const builder = component("btn")
        .defaultTheme("primary")
        .body({ color: dsl.current(500) });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: {
          btn: { name: "Button", description: "Base" },
          "btn@variant": {
            name: "Button Variant",
            description: "Variant form",
          },
        },
      });

      expect(result.components["btn"]!.pattern.modifier).toEqual({
        name: "palette",
        default: "primary",
        optional: true,
        tokens: PALETTE,
      });
    });

    it("component pattern defaults palette to inherited when no default theme is set", () => {
      const builder = component("btn").body({ color: dsl.current(500) });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: {
          btn: { name: "Button", description: "Base" },
        },
      });

      expect(result.components["btn"]!.pattern.modifier).toEqual({
        name: "palette",
        default: "inherited",
        optional: true,
        tokens: PALETTE,
      });
    });

    it("optional variant entries preserve palette modifiers when themeable", () => {
      const builder = component("btn")
        .defaultTheme("primary")
        .variant("solid", { "--tone": dsl.current(700) })
        .variant("soft", { "--tone": dsl.current(300) })
        .optionalVariants()
        .body({ color: dsl.cssvar("--tone") });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: {
          btn: { name: "Button", description: "Base" },
          "btn@variant": {
            name: "Button Variant",
            description: "Variant form",
          },
        },
      });

      expect(result.components["btn"]!.pattern).toEqual({
        root: "btn",
        modifier: {
          name: "palette",
          default: "primary",
          optional: true,
          tokens: PALETTE,
        },
      });
      expect(result.components["btn@variant"]!.pattern).toEqual({
        root: "btn",
        value: {
          name: "variant",
          tokens: ["solid", "soft"],
        },
        modifier: {
          name: "palette",
          default: "primary",
          optional: true,
          tokens: PALETTE,
        },
      });
    });

    it("throws when optional variant metadata is missing", () => {
      const builder = component("btn")
        .variant("primary", { "--color": "blue" })
        .optionalVariants()
        .body({ color: dsl.cssvar("--color") });

      expect(() =>
        createDoc(builder, {
          title: "Button",
          description: "...",
          components: { btn: { name: "Button", description: "Base" } },
        }),
      ).toThrow('Missing component doc metadata for "btn@variant".');
    });

    it("component pattern has no modifier when not themeable", () => {
      const result = createDoc(component("btn").body({ display: "flex" }), {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
      });

      expect(result.components["btn"]!.pattern.modifier).toBeUndefined();
    });

    it("component composesWith utilities that define vars referenced in its body", () => {
      const builder = component("btn")
        .utility("sm", { "--btn-size": "0.5rem" })
        .body({ width: dsl.cssvar("--btn-size") });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        utilities: { sm: { name: "Small", description: "Small size" } },
      });

      expect(result.components["btn"]!.composesWith).toContainEqual({
        type: "utility",
        id: "sm",
      });
    });
  });

  describe("cssvars", () => {
    it("registers non-controlled vars with description from meta", () => {
      const builder = component("btn").vars({
        "--size": "1rem",
        "--color": "blue",
      });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        cssvars: {
          "--size": "Controls the size of the button",
          "--color": "Controls the text color",
        },
      });

      expect(result.cssvars).toContainEqual({
        varName: "--btn-size",
        description: "Controls the size of the button",
        defaultValue: "1rem",
      });
      expect(result.cssvars).toContainEqual({
        varName: "--btn-color",
        description: "Controls the text color",
        defaultValue: "blue",
      });
    });

    it("does not register controlled vars as cssvars", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { sm: "0.875rem" }, { lg: "1.5rem" });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        utilities: {
          size: { name: "Size", description: "Controls button size" },
        },
      });

      expect(result.cssvars).toEqual([]);
    });

    it("does not allow controlled vars in cssvars meta", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { sm: "0.875rem" });

      createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        utilities: {
          size: { name: "Size", description: "Controls button size" },
        },
        // @ts-expect-error - controlled vars are documented as utilities
        cssvars: { "--size": "Controls the size" },
      });
    });

    it("does not register variant vars as cssvars", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem", "--color": "blue" })
        .variant("primary", { "--color": "red" });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        cssvars: {
          "--size": "Controls the size",
        },
      });

      expect(result.cssvars).toEqual([
        {
          varName: "--btn-size",
          description: "Controls the size",
          defaultValue: "1rem",
        },
      ]);
    });

    it("does not allow variant vars in cssvars meta", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem", "--color": "blue" })
        .variant("primary", { "--color": "red" });

      createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        cssvars: {
          "--size": "Controls the size",
          // @ts-expect-error - variant vars are not public CSS variable docs
          "--color": "Controls the color",
        },
      });
    });

    it("does not allow parent vars used by child variants in cssvars meta", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem", "--color": "blue" })
        .derive("group", (child) =>
          child
            .variant("active", { "--color": "red" })
            .body({ color: dsl.cssvar("--color") }),
        );

      createDoc(builder, {
        title: "Button",
        description: "...",
        components: {
          btn: { name: "Button", description: "Base" },
          group: { name: "Button Group", description: "Group" },
        },
        cssvars: {
          "--size": "Controls the size",
          // @ts-expect-error - child variant vars are not public CSS variable docs
          "--color": "Controls the color",
        },
      });
    });
  });

  describe("utilities (explicit)", () => {
    it("registers explicit utilities under the scoped id", () => {
      const builder = component("btn").utility("disabled", {
        opacity: "0.5",
        "pointer-events": "none",
      });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        utilities: {
          disabled: { name: "Disabled", description: "Disables the button" },
        },
      });

      expect(result.utilities["disabled"]).toMatchObject({
        name: "Disabled",
        description: "Disables the button",
        pattern: { root: "btn-disabled" },
        composesWith: [],
      });
    });

    it("requires meta for all defined utilities (TypeScript error if missing)", () => {
      const builder = component("btn").utility("disabled", { opacity: "0.5" });

      createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        // @ts-expect-error - 'disabled' must be present in utilities meta
        utilities: {},
      });
    });

    it("utility composesWith utilities that define vars it references", () => {
      const builder = component("btn")
        .utility("sm", { "--btn-size": "0.5rem" })
        .utility("full", { width: dsl.cssvar("--btn-size") });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        utilities: {
          sm: { name: "Small", description: "Small size" },
          full: { name: "Full width", description: "Full width button" },
        },
      });

      expect(result.utilities["full"]!.composesWith).toContainEqual({
        type: "utility",
        id: "btn-sm",
      });
    });
  });

  describe("utilities (controlled vars)", () => {
    it("creates a utility entry for each controlled var", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { sm: "0.875rem" }, { lg: "1.5rem" });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        utilities: {
          size: {
            name: "Size",
            description: "Controls button size",
          },
        },
      });

      expect(result.utilities["size"]).toMatchObject({
        name: "Size",
        description: "Controls button size",
      });
    });

    it("controlled var utility pattern lists token candidates", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { sm: "0.875rem" }, { lg: "1.5rem" });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        utilities: {
          size: {
            name: "Size",
            description: "Controls button size",
          },
        },
      });

      expect(result.utilities["size"]!.pattern).toEqual({
        root: "btn-size",
        value: { name: "size", tokens: ["sm", "lg"] },
      });
    });

    it("controlled var utility pattern includes arbitrary candidates", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", dsl.match.arbitrary.length());

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        utilities: {
          size: {
            name: "Size",
            description: "Controls button size",
          },
        },
      });

      expect(result.utilities["size"]!.pattern).toEqual({
        root: "btn-size",
        value: {
          name: "size",
          tokens: [{ type: "arbitrary", dataType: "length" }],
        },
      });
    });
  });

  describe("slots and custom variants", () => {
    it("derives slot selectors from component state", () => {
      const builder = component("toggle")
        .slot("thumb", "data-attr")
        .slot("icon", "class");

      const result = createDoc(builder, {
        title: "Toggle",
        description: "...",
        components: { toggle: { name: "Toggle", description: "Base" } },
      });

      expect(result.slots).toEqual({
        title: "Slots",
        description: undefined,
        showcases: undefined,
        entries: [
          { name: "thumb", selector: '[data-slot="thumb"]' },
          { name: "icon", selector: ".icon" },
        ],
      });
    });

    it("derives custom variants from component guards", () => {
      const builder = component("toggle")
        .guard("on", "[aria-checked='true']")
        .guard("off", "&:not([aria-checked='true'])");

      const result = createDoc(builder, {
        title: "Toggle",
        description: "...",
        components: { toggle: { name: "Toggle", description: "Base" } },
      });

      expect(result.customVariants).toEqual({
        title: "Custom Variants",
        description: undefined,
        showcases: undefined,
        entries: [
          { name: "toggle-on", selector: "[aria-checked='true']" },
          { name: "toggle-off", selector: "&:not([aria-checked='true'])" },
        ],
      });
    });

    it("preserves authored descriptions and showcases for derived sections", () => {
      const builder = component("toggle")
        .slot("thumb", "data-attr")
        .guard("on", "[aria-checked='true']");

      const result = createDoc(builder, {
        title: "Toggle",
        description: "...",
        components: { toggle: { name: "Toggle", description: "Base" } },
        slots: {
          title: "Thumb Slot",
          description: "Replace the default thumb with a slotted child.",
          showcases: [
            {
              title: "Custom Thumb",
              description: "Shows a slotted thumb.",
              content: showcaseNode,
            },
          ],
        },
        customVariants: {
          description: "State selectors exposed as custom variants.",
          showcases: [
            {
              title: "State Styling",
              content: showcaseNode,
            },
          ],
        },
      });

      expect(result.slots).toMatchObject({
        title: "Thumb Slot",
        description: "Replace the default thumb with a slotted child.",
      });
      expect(result.slots?.showcases).toHaveLength(1);
      expect(result.customVariants).toMatchObject({
        title: "Custom Variants",
        description: "State selectors exposed as custom variants.",
      });
      expect(result.customVariants?.showcases).toHaveLength(1);
    });
  });
});
