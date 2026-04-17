import { describe, expect, it } from "vitest";
import { componentBuilderToDsl } from "./component-builder-to-dsl.ts";
import { color, component, dsl, PALETTE } from "@nataliebasille/css-engine";
import { colorKeyWithoutPalette, renderPalette } from "../../shared/colors.ts";

describe("vars", () => {
  it("scopes vars to the component", () => {
    const result = componentBuilderToDsl(
      component("btn").vars({
        "--size": dsl.primitive.integer(100),
        "--color": "red",
        "--padding": dsl.spacing("4"),
      }),
    );

    const expected = [
      dsl.atRule("theme", null, {
        "--btn-size": dsl.primitive.integer(100),
        "--btn-color": "red",
        "--btn-padding": dsl.spacing("4"),
      }),
    ];

    expect(result).toEqual(expected);
  });

  it("vars that refernce other vars should have those references rewritten", () => {
    expect(
      componentBuilderToDsl(
        component("btn").vars({
          "--size": dsl.primitive.integer(100),
          "--border": dsl.cssvar("--size"),
          "--padding": dsl.calc`${dsl.cssvar("--size")} * 2`,
        }),
      ),
    ).toEqual([
      dsl.atRule("theme", null, {
        "--btn-size": dsl.primitive.integer(100),
        "--btn-border": dsl.cssvar("--btn-size"),
        "--btn-padding": dsl.calc`${dsl.cssvar("--btn-size")} * 2`,
      }),
    ]);
  });
});

describe("variants", () => {
  it("adds rewrited vars to inline theme", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .variant("primary", {
          "--color": "blue",
          "--background": "white",
          "--border": "1px solid black",
        })
        .body({
          color: dsl.cssvar("--color"),
        }),
    );

    const actual = result.find(
      (x) =>
        x.$ast === "at-rule" && x.name === "theme" && x.prelude === "inline",
    );

    const expected = dsl.atRule("theme", "inline", {
      "--btn-color-primary": "blue",
      "--btn-background-primary": "white",
      "--btn-border-primary": "1px solid black",
    });

    expect(actual).toEqual(expected);
  });

  it("adds vars for multiple variants", () => {
    expect(
      componentBuilderToDsl(
        component("btn")
          .variant("primary", {
            "--color": "blue",
          })
          .variant("secondary", {
            "--color": "gray",
            "--background": "lightgray",
          })
          .body({
            color: dsl.cssvar("--color"),
            "background-color": dsl.cssvar("--background"),
          }),
      ).filter(
        (x) =>
          x.$ast === "at-rule" && x.name === "theme" && x.prelude === "inline",
      ),
    ).toEqual([
      dsl.atRule("theme", "inline", {
        "--btn-color-primary": "blue",
        "--btn-color-secondary": "gray",
        "--btn-background-secondary": "lightgray",
      }),
    ]);
  });

  it("variants that reference vars should have those references rewritten", () => {
    const actual = componentBuilderToDsl(
      component("btn")
        .vars({
          "--color": "red",
        })
        .variant("primary", {
          "--bg": dsl.cssvar("--color"),
        })
        .body({
          color: dsl.cssvar("--bg"),
        }),
    );
    const expected = [
      dsl.atRule("theme", null, {
        "--btn-color": "red",
      }),
      dsl.atRule("theme", "inline", {
        "--btn-bg-primary": dsl.cssvar("--btn-color"),
      }),
      dsl.atRule(
        "utility",
        "btn-*",
        dsl.layer.components(
          dsl.styleList({
            color: dsl.match.variable("--btn-bg"),
          }),
        ),
      ),
    ];

    expect(actual).toEqual(expected);
  });
});

describe("themeable = FALSE / variants = NONE", () => {
  it("renders static component", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({
          "--color": "red",
          "--other-color": dsl.cssvar("--color"),
        })
        .body({
          "--color": "blue",
          color: dsl.cssvar("--other-color"),
          background: "white",
          padding: dsl.spacing("4"),
        }),
    );

    const expected = [
      dsl.atRule("theme", null, {
        "--btn-color": "red",
        "--btn-other-color": dsl.cssvar("--btn-color"),
      }),
      dsl.atRule(
        "utility",
        "btn",
        dsl.layer.components(
          dsl.styleList({
            "--btn-color": "blue",
            color: dsl.cssvar("--btn-other-color"),
            background: "white",
            padding: dsl.spacing("4"),
          }),
        ),
      ),
    ];

    expect(result).toEqual(expected);
  });
});

describe("themeable = TRUE NO DEFAULT / variants = NONE", () => {
  it("generates a utility for each palette in PALETTE", () => {
    const result = componentBuilderToDsl(
      component("btn").body({
        color: dsl.current(500),
      }),
    );

    const expected = PALETTE.map((p) =>
      dsl.atRule(
        "utility",
        `btn/${p}`,
        dsl.layer.components(
          `palette-${p}`,
          dsl.styleList({
            color: dsl.adaptive(p, 500),
          }),
        ),
      ),
    );

    expect(result).toEqual(expected);
  });
});

describe("themeable = TRUE WITH DEFAULT / variants = NONE", () => {
  it("generates a static component with the default palette applied and static components for each palette", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .defaultTheme("primary")
        .body({
          color: dsl.current(500),
        }),
    );

    const expected = [
      ...PALETTE.map((p) =>
        dsl.atRule(
          "utility",
          `btn/${p}`,
          dsl.layer.components(
            `palette-${p}`,
            dsl.styleList({
              color: dsl.adaptive(p, 500),
            }),
          ),
        ),
      ),

      dsl.atRule("utility", "btn", dsl.layer.components("btn/primary")),
    ];

    expect(result).toEqual(expected);
  });
});

describe("themeable = FALSE / variants - NO DEFAULT", () => {
  it("generates an inline theme and dynamic utility with the scoped variant vars", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--bg": "black" })
        .variant("primary", { "--color": "blue" })
        .variant("secondary", { "--color": "gray" })
        .body({ color: dsl.cssvar("--color") }),
    );

    const expected = [
      dsl.atRule("theme", {
        "--btn-bg": "black",
      }),
      dsl.atRule("theme", "inline", {
        "--btn-color-primary": "blue",
        "--btn-color-secondary": "gray",
      }),
      dsl.atRule(
        "utility",
        "btn-*",
        dsl.layer.components(
          dsl.styleList({ color: dsl.match.variable("--btn-color") }),
        ),
      ),
    ];

    expect(result).toEqual(expected);
  });
});

describe("themeable = FALSE / variants - WITH DEFAULT", () => {
  it("generates inline theme, static component with default variant applied, and dynamic component", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .variant("solid", { "--color": "blue" })
        .variant("outline", { "--bg": "red" })
        .defaultVariant("solid")
        .body({
          color: dsl.cssvar("--color"),
          "background-color": dsl.cssvar("--bg"),
        }),
    );

    const expected = [
      dsl.atRule("theme", "inline", {
        "--btn-color-solid": "blue",
        "--btn-bg-outline": "red",
      }),

      dsl.atRule(
        "utility",
        "btn-*",
        dsl.layer.components(
          dsl.styleList({
            color: dsl.match.variable("--btn-color"),
            "background-color": dsl.match.variable("--btn-bg"),
          }),
        ),
      ),

      dsl.atRule("utility", "btn", dsl.layer.components("btn-solid")),
    ];

    expect(result).toEqual(expected);
  });
});

describe("themeable = TRUE NO DEFAULT / variants - NO DEFAULT", () => {
  it("generates inline theme, and dynamic component with palette modifiers", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .variant("solid", { "--color": dsl.currentText(500) })
        .variant("outline", { "--bg": dsl.current(500) })
        .body({
          color: dsl.cssvar("--color"),
          "background-color": dsl.cssvar("--bg"),
        }),
    );

    const expected = [
      dsl.atRule("theme", "inline", {
        "--btn-color-solid": dsl.currentText(500),
        "--btn-bg-outline": dsl.current(500),
      }),
      dsl.atRule(
        "utility",
        "btn-*",
        dsl.layer.components(
          renderPalette((color) =>
            dsl.match.asModifier(
              dsl.match.variable(
                colorKeyWithoutPalette({ ...color, mode: "adaptive" }),
              ),
            ),
          ),
          {
            color: dsl.match.variable("--btn-color"),
            "background-color": dsl.match.variable("--btn-bg"),
          },
        ),
      ),
    ];

    expect(result).toEqual(expected);
  });
});

describe("themeable = TRUE NO DEFAULT / variants - WITH DEFAULT", () => {
  it("generates inline theme, dynamic component with palette modifiers, and themeable static components with default variant", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .variant("solid", { "--color": dsl.currentText(500) })
        .variant("outline", { "--bg": dsl.current(500) })
        .defaultVariant("outline")
        .body({
          color: dsl.cssvar("--color"),
          "background-color": dsl.cssvar("--bg"),
        }),
    );

    const expected = [
      dsl.atRule("theme", "inline", {
        "--btn-color-solid": dsl.currentText(500),
        "--btn-bg-outline": dsl.current(500),
      }),
      dsl.atRule(
        "utility",
        "btn-*",
        dsl.layer.components(
          renderPalette((color) =>
            dsl.match.asModifier(
              dsl.match.variable(
                colorKeyWithoutPalette({ ...color, mode: "adaptive" }),
              ),
            ),
          ),
          {
            color: dsl.match.variable("--btn-color"),
            "background-color": dsl.match.variable("--btn-bg"),
          },
        ),
      ),

      ...PALETTE.map((p) =>
        dsl.atRule(
          "utility",
          `btn/${p}`,
          dsl.layer.components(`btn-outline/${p}`),
        ),
      ),
    ];

    expect(result).toEqual(expected);
  });
});

describe("themeable = TRUE WITH DEFAULT / variants - WITH DEFAULT", () => {
  it("generate inline theme, dynamic component with palette modifiers, themeable static components with default variant, and static component with default variant and palette applied", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .variant("solid", { "--color": dsl.currentText(500) })
        .variant("outline", { "--bg": dsl.current(500) })
        .defaultTheme("secondary")
        .defaultVariant("outline")
        .body({
          color: dsl.cssvar("--color"),
          "background-color": dsl.cssvar("--bg"),
        }),
    );

    const expected = [
      dsl.atRule("theme", "inline", {
        "--btn-color-solid": dsl.currentText(500),
        "--btn-bg-outline": dsl.current(500),
      }),
      dsl.atRule(
        "utility",
        "btn-*",
        dsl.layer.components(
          renderPalette((color) =>
            dsl.match.asModifier(
              dsl.match.variable(
                colorKeyWithoutPalette({ ...color, mode: "adaptive" }),
              ),
            ),
          ),
          {
            color: dsl.match.variable("--btn-color"),
            "background-color": dsl.match.variable("--btn-bg"),
          },
        ),
      ),

      ...PALETTE.map((p) =>
        dsl.atRule(
          "utility",
          `btn/${p}`,
          dsl.layer.components(`btn-outline/${p}`),
        ),
      ),

      dsl.atRule(
        "utility",
        "btn",
        dsl.layer.components(`btn-outline/secondary`),
      ),
    ];

    expect(result).toEqual(expected);
  });
});

describe("derive", () => {
  describe("vars", () => {
    it("different vars get written to the @theme default block", () => {
      const result = componentBuilderToDsl(
        component("btn")
          .vars({ "--color": "red", "--size": "1rem" })
          .derive("btn-group", (child) =>
            child.vars({
              "--bg": "white",
            }),
          ),
      );

      const actual = result.find(
        (x) => x.$ast === "at-rule" && x.name === "theme" && x.prelude === null,
      );

      const expected = dsl.atRule("theme", null, {
        "--btn-color": "red",
        "--btn-size": "1rem",
        "--btn-group-bg": "white",
      });

      expect(actual).toEqual(expected);
    });

    it("child can reference parent vars", () => {
      const result = componentBuilderToDsl(
        component("btn")
          .vars({ "--color": "red", "--size": "1rem" })
          .derive("btn-group", (child) =>
            child
              .vars({
                "--bg": "white",
              })
              .body({
                color: dsl.cssvar("--color"),
                background: dsl.cssvar("--bg"),
              }),
          ),
      );

      const actual = result.find(
        (x) =>
          x.$ast === "at-rule" &&
          x.name === "utility" &&
          x.prelude === "btn-group",
      );

      const expected = dsl.atRule(
        "utility",
        "btn-group",
        dsl.layer.components(
          dsl.styleList({
            color: dsl.cssvar("--btn-color"),
            background: dsl.cssvar("--btn-group-bg"),
          }),
        ),
      );

      expect(actual).toEqual(expected);
    });

    it("child overrides parent vars", () => {
      const result = componentBuilderToDsl(
        component("btn")
          .vars({ "--color": "red", "--size": "1rem" })
          .body({
            color: dsl.cssvar("--color"),
          })
          .derive("btn-group", (child) =>
            child
              .vars({
                "--color": "blue",
              })
              .body({
                color: dsl.cssvar("--color"),
              }),
          ),
      );

      const actual = result.find(
        (x) =>
          x.$ast === "at-rule" &&
          x.name === "utility" &&
          x.prelude === "btn-group",
      );

      const expected = dsl.atRule(
        "utility",
        "btn-group",
        dsl.layer.components(
          dsl.styleList({
            color: dsl.cssvar("--btn-group-color"),
          }),
        ),
      );

      expect(actual).toEqual(expected);
    });

    it("parent still has reference to its own vars even when child overrides", () => {
      const result = componentBuilderToDsl(
        component("btn")
          .vars({ "--color": "red", "--size": "1rem" })
          .body({
            color: dsl.cssvar("--color"),
          })
          .derive("btn-group", (child) =>
            child
              .vars({
                "--color": "blue",
              })
              .body({
                color: dsl.cssvar("--color"),
              }),
          ),
      );

      const parentActual = result.find(
        (x) =>
          x.$ast === "at-rule" && x.name === "utility" && x.prelude === "btn",
      );

      const parentExpected = dsl.atRule(
        "utility",
        "btn",
        dsl.layer.components(
          dsl.styleList({
            color: dsl.cssvar("--btn-color"),
          }),
        ),
      );

      expect(parentActual).toEqual(parentExpected);
    });
  });

  describe("variants", () => {
    it("parent and child variants both get emitted to the @theme inline block with correct scoping", () => {
      const result = componentBuilderToDsl(
        component("btn")
          .variant("solid", { "--color": "blue" })
          .variant("soft", { "--color": "pink" })
          .body({
            color: dsl.cssvar("--color"),
          })
          .derive("btn-group", (child) =>
            child
              .variant("solid", { "--color": "green" })
              .variant("soft", { "--bg": "transparent" })
              .body({
                color: dsl.cssvar("--color"),
              }),
          ),
      );

      const actual = result.find(
        (x) =>
          x.$ast === "at-rule" && x.name === "theme" && x.prelude === "inline",
      );

      const expected = dsl.atRule("theme", "inline", {
        "--btn-color-solid": "blue",
        "--btn-color-soft": "pink",
        "--btn-group-color-solid": "green",
        "--btn-group-bg-soft": "transparent",
      });

      expect(actual).toEqual(expected);
    });

    it("child has dynamic utility when referencing parent variant", () => {
      const result = componentBuilderToDsl(
        component("btn")
          .variant("solid", { "--color": "blue" })
          .derive("btn-group", (child) =>
            child.body({
              color: dsl.cssvar("--color"),
            }),
          ),
      );

      const actual = result.find(
        (x) =>
          x.$ast === "at-rule" &&
          x.name === "utility" &&
          x.prelude === "btn-group-*",
      );

      const expected = dsl.atRule(
        "utility",
        "btn-group-*",
        dsl.layer.components(
          dsl.styleList({
            color: dsl.match.variable("--btn-color"),
          }),
        ),
      );

      expect(actual).toEqual(expected);
    });

    it("child can have default variant", () => {
      const result = componentBuilderToDsl(
        component("btn")
          .variant("solid", { "--color": "blue" })
          .derive("btn-group", (child) =>
            child
              .variant("solid", { "--color": "green" })
              .defaultVariant("solid")
              .body({
                color: dsl.cssvar("--color"),
              }),
          ),
      );

      const actual = result.find(
        (x) =>
          x.$ast === "at-rule" &&
          x.name === "utility" &&
          x.prelude === "btn-group",
      );

      const expected = dsl.atRule(
        "utility",
        "btn-group",
        dsl.layer.components("btn-group-solid"),
      );

      expect(actual).toEqual(expected);
    });
  });
});

describe("controlled vars", () => {
  it("generates a {varname}-* utility named after the scoped var for a token candidate", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { type: "token", token: "sm", value: "0.875rem" })
        .body({ padding: dsl.cssvar("--size") }),
    );

    expect(
      result.some(
        (x) =>
          x.$ast === "at-rule" &&
          x.name === "utility" &&
          x.prelude === "btn-size-*",
      ),
    ).toBe(true);
  });

  it("token candidates produce a match.variable in utility", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { type: "token", token: "sm", value: "0.875rem" })
        .body({ padding: dsl.cssvar("--size") }),
    );

    const actual = result.find(
      (x) =>
        x.$ast === "at-rule" &&
        x.name === "utility" &&
        x.prelude === "btn-size-*",
    );

    const expected = dsl.atRule(
      "utility",
      "btn-size-*",
      dsl.styleList({
        "--btn-size": dsl.match.variable("--btn-size"),
      }),
    );

    expect(actual).toEqual(expected);
  });

  it("multiple token candidates collapse to a single match.variable for the scoped var", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled(
          "--size",
          { type: "token", token: "sm", value: "0.875rem" },
          { type: "token", token: "lg", value: "1.25rem" },
        )
        .body({ padding: dsl.cssvar("--size") }),
    );

    expect(
      result.find(
        (x) =>
          x.$ast === "at-rule" &&
          x.name === "utility" &&
          x.prelude === "btn-size-*",
      ),
    ).toEqual(
      dsl.atRule(
        "utility",
        "btn-size-*",
        dsl.styleList({
          "--btn-size": dsl.match.oneOf(dsl.match.variable("--btn-size")),
        }),
      ),
    );
  });

  it("arbitrary candidate maps to match.arbitrary.{type}()", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { type: "arbitrary", dataType: "length" })
        .body({ padding: dsl.cssvar("--size") }),
    );

    expect(
      result.find(
        (x) =>
          x.$ast === "at-rule" &&
          x.name === "utility" &&
          x.prelude === "btn-size-*",
      ),
    ).toEqual(
      dsl.atRule(
        "utility",
        "btn-size-*",
        dsl.styleList({
          "--btn-size": dsl.match.oneOf(dsl.match.arbitrary.length()),
        }),
      ),
    );
  });

  it("bare candidate maps to match.bare.{type}()", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { type: "bare", dataType: "integer" })
        .body({ padding: dsl.cssvar("--size") }),
    );

    expect(
      result.find(
        (x) =>
          x.$ast === "at-rule" &&
          x.name === "utility" &&
          x.prelude === "btn-size-*",
      ),
    ).toEqual(
      dsl.atRule(
        "utility",
        "btn-size-*",
        dsl.styleList({
          "--btn-size": dsl.match.oneOf(dsl.match.bare.integer()),
        }),
      ),
    );
  });

  it("mixed candidates use single token variable lookup plus arbitrary/bare candidates", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled(
          "--size",
          { type: "token", token: "sm", value: "0.875rem" },
          { type: "arbitrary", dataType: "length" },
          { type: "bare", dataType: "number" },
        )
        .body({ padding: dsl.cssvar("--size") }),
    );

    expect(
      result.find(
        (x) =>
          x.$ast === "at-rule" &&
          x.name === "utility" &&
          x.prelude === "btn-size-*",
      ),
    ).toEqual(
      dsl.atRule(
        "utility",
        "btn-size-*",
        dsl.styleList({
          "--btn-size": dsl.match.oneOf(
            dsl.match.variable("--btn-size"),
            dsl.match.arbitrary.length(),
            dsl.match.bare.number(),
          ),
        }),
      ),
    );
  });

  it("referenced controlled var is rewritted to scoped variable", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { type: "token", token: "sm", value: "0.875rem" })
        .body({ padding: dsl.cssvar("--size") }),
    );

    const actual = result.find(
      (x) =>
        x.$ast === "at-rule" && x.name === "utility" && x.prelude === "btn",
    );

    const expected = dsl.atRule(
      "utility",
      "btn",
      dsl.layer.components(
        dsl.styleList({
          padding: dsl.cssvar("--btn-size"),
        }),
      ),
    );

    expect(actual).toEqual(expected);
  });

  it("emits the default value in @theme for the controlled var", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { type: "token", token: "sm", value: "0.875rem" })
        .body({ padding: dsl.cssvar("--size") }),
    );

    expect(
      result.find(
        (x) => x.$ast === "at-rule" && x.name === "theme" && x.prelude === null,
      ),
    ).toEqual(
      dsl.atRule("theme", null, {
        "--btn-size": "1rem",
      }),
    );
  });

  it("emits the token candidates of a controlled var as an inline theme", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled(
          "--size",
          { type: "token", token: "sm", value: "0.875rem" },
          {
            type: "token",
            token: "md",
            value: "1rem",
          },
          {
            type: "token",
            token: "lg",
            value: "1.25rem",
          },
        )
        .body({ padding: dsl.cssvar("--size") }),
    );

    const actual = result.find(
      (x) =>
        x.$ast === "at-rule" && x.name === "theme" && x.prelude === "inline",
    );

    const expected = dsl.atRule("theme", "inline", {
      "--btn-size-sm": "0.875rem",
      "--btn-size-md": "1rem",
      "--btn-size-lg": "1.25rem",
    });

    expect(actual).toEqual(expected);
  });

  it("generates a separate utility for each controlled var", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem", "--weight": "400" })
        .controlled("--size", { type: "arbitrary", dataType: "length" })
        .controlled("--weight", { type: "bare", dataType: "number" })
        .body({
          padding: dsl.cssvar("--size"),
          fontWeight: dsl.cssvar("--weight"),
        }),
    );

    expect(
      result.some(
        (x) =>
          x.$ast === "at-rule" &&
          x.name === "utility" &&
          x.prelude === "btn-size-*",
      ),
    ).toBe(true);

    expect(
      result.some(
        (x) =>
          x.$ast === "at-rule" &&
          x.name === "utility" &&
          x.prelude === "btn-weight-*",
      ),
    ).toBe(true);
  });

  it("generates the utility once even when there is a derived component", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { type: "arbitrary", dataType: "length" })
        .body({ padding: dsl.cssvar("--size") })
        .derive("btn-group", (child) =>
          child.body({
            padding: dsl.cssvar("--size"),
          }),
        ),
    );

    const utilities = result.filter(
      (x) =>
        x.$ast === "at-rule" &&
        x.name === "utility" &&
        x.prelude === "btn-size-*",
    );

    expect(utilities).toHaveLength(1);
  });
});

describe("utility", () => {
  it("generates utility with scoped name and vars", () => {
    const result = componentBuilderToDsl(
      component("btn").vars({ "--px": "4px", "--py": "2px" }).utility("icon", {
        "--px": "8px",
        "--py": "8px",
      }),
    );

    const actual = result.find(
      (x) =>
        x.$ast === "at-rule" &&
        x.name === "utility" &&
        x.prelude === "btn-icon",
    );

    const expected = dsl.atRule("utility", "btn-icon", {
      "--btn-px": "8px",
      "--btn-py": "8px",
    });

    expect(actual).toEqual(expected);
  });
});
