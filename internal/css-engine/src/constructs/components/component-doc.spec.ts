import { describe, expect, it } from "vitest";
import { createDoc } from "./component-doc.ts";
import { component } from "./component-builder.ts";
import { dsl, PALETTE } from "../../dsl/public.ts";

describe("createDoc", () => {
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
      expect(result.components["btn-icon"]).toMatchObject({
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
        components: { btn: { name: "Button", description: "Base" } },
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

    it("component pattern includes palette modifier when component uses current color", () => {
      const builder = component("btn")
        .defaultTheme("primary")
        .body({ color: dsl.current(500) });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
      });

      expect(result.components["btn"]!.pattern.modifier).toEqual({
        name: "palette",
        default: "primary",
        tokens: PALETTE,
      });
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
        id: "btn-sm",
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
        varName: "--size",
        description: "Controls the size of the button",
        defaultValue: "1rem",
      });
      expect(result.cssvars).toContainEqual({
        varName: "--color",
        description: "Controls the text color",
        defaultValue: "blue",
      });
    });

    it("uses empty string description when var is not listed in cssvars meta", () => {
      const builder = component("btn").vars({
        "--size": "1rem",
        "--color": "blue",
      });

      const result = createDoc(builder, {
        title: "Button",
        description: "...",
        components: { btn: { name: "Button", description: "Base" } },
        // only --size documented; --color intentionally absent
        cssvars: { "--size": "Controls the size", "--color": "" },
      });

      expect(result.cssvars).toContainEqual({
        varName: "--color",
        description: "",
        defaultValue: "blue",
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

      expect(result.utilities["btn-disabled"]).toMatchObject({
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

      expect(result.utilities["btn-full"]!.composesWith).toContainEqual({
        type: "utility",
        id: "btn-sm",
      });
    });
  });

  describe("utilities (controlled vars)", () => {
    it("creates a utility entry for each controlled var", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem" })
        .controlled(
          "--size",
          { type: "token", token: "sm", value: "0.875rem" },
          { type: "token", token: "lg", value: "1.5rem" },
        );

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
        cssvars: {
          "--size": "Controls the size of the button",
        },
      });

      expect(result.utilities["btn-size"]).toMatchObject({
        name: "Size",
        description: "Controls button size",
      });
    });

    it("controlled var utility pattern lists token candidates", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem" })
        .controlled(
          "--size",
          { type: "token", token: "sm", value: "0.875rem" },
          { type: "token", token: "lg", value: "1.5rem" },
        );

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
        cssvars: {
          "--size": "Controls the size of the button",
        },
      });

      expect(result.utilities["btn-size"]!.pattern).toEqual({
        root: "btn-size",
        value: { name: "size", tokens: ["sm", "lg"] },
      });
    });

    it("controlled var utility pattern includes arbitrary candidates", () => {
      const builder = component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { type: "arbitrary", dataType: "length" });

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
        cssvars: {
          "--size": "Controls the size of the button",
        },
      });

      expect(result.utilities["btn-size"]!.pattern).toEqual({
        root: "btn-size",
        value: {
          name: "size",
          tokens: [{ type: "arbitrary", dataType: "length" }],
        },
      });
    });
  });
});
