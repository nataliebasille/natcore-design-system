import { describe, expect, it } from "vitest";
import { variantDefinition } from "./utils.ts";
import { component } from "./component-builder.ts";
import { dsl } from "../../dsl/public.ts";

describe("variantDefinition", () => {
  it("returns state: false when body has no variant var references", () => {
    const builder = component("btn")
      .vars({ "--size": "1rem" })
      .body({ "font-size": dsl.cssvar("--size") });

    expect(variantDefinition(builder.state)).toEqual({ state: false });
  });

  it("returns own variants when body references own variant vars", () => {
    const builder = component("btn")
      .variant("primary", { "--color": "blue" })
      .variant("secondary", { "--color": "gray" })
      .body({ color: dsl.cssvar("--color") });

    expect(variantDefinition(builder.state)).toEqual({
      state: true,
      own: {
        primary: { "--color": "blue" },
        secondary: { "--color": "gray" },
      },
      inherited: {},
      default: undefined,
    });
  });

  it("returns parent variants in inherited when body references parent variant vars", () => {
    const builder = component("btn")
      .variant("primary", { "--color": "blue" })
      .variant("secondary", { "--color": "gray" })
      .derive("icon", (child) => child.body({ color: dsl.cssvar("--color") }));

    expect(variantDefinition(builder.state)).toEqual({
      state: true,
      own: {},
      inherited: {
        primary: { "--color": "blue" },
        secondary: { "--color": "gray" },
      },
      default: undefined,
    });
  });

  it("inherits defaultVariant from parent when child does not set one", () => {
    const builder = component("btn")
      .variant("primary", { "--color": "blue" })
      .defaultVariant("primary")
      .derive("icon", (child) => child.body({ color: dsl.cssvar("--color") }));

    const result = variantDefinition(builder.state);
    expect(result.state).toBe(true);
    if (result.state) {
      expect(result.default).toBe("primary");
    }
  });
});
