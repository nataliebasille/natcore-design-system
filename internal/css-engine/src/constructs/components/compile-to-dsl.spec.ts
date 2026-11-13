import { describe, expect, it } from "vitest";
import { componentBuilderToDsl } from "./compile-to-dsl.ts";
import { dsl, PALETTE } from "../../dsl/public.ts";
import { component } from "./component-builder.ts";
import type { RegisteredProperty } from "./types.ts";
import { colorKeyWithoutPalette, renderPalette } from "../palette-utils.ts";

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
        componentBody(
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
        componentBody(
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
  it("generates an inherited static component and a utility for each palette in PALETTE", () => {
    const result = componentBuilderToDsl(
      component("btn").body({
        color: dsl.current(500),
      }),
    );

    const expected = [
      ...PALETTE.map((p) =>
        dsl.atRule(
          "utility",
          `btn/${p}`,
          componentBody(
            `palette-${p}`,
            dsl.styleList({
              color: dsl.adaptive(p, 500),
            }),
          ),
        ),
      ),

      dsl.atRule(
        "utility",
        "btn",
        componentBody(
          dsl.styleList({
            color: dsl.current(500),
          }),
        ),
      ),
    ];

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
          componentBody(
            `palette-${p}`,
            dsl.styleList({
              color: dsl.adaptive(p, 500),
            }),
          ),
        ),
      ),

      dsl.atRule("utility", "btn", "btn/primary"),
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
        componentBody(
          dsl.styleList({ color: dsl.match.variable("--btn-color") }),
        ),
      ),
    ];

    expect(result).toEqual(expected);
  });

  it("bridges variant vars used in utilities as CSS custom properties on the dynamic element", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .variant("primary", { "--hover-bg": "blue" })
        .variant("secondary", { "--hover-bg": "gray" })
        .body({ color: dsl.cssvar("--hover-bg") })
        .utility("hover", { "background-color": dsl.cssvar("--hover-bg") }),
    );

    expect(result).toEqual([
      dsl.atRule("theme", "inline", {
        "--btn-hover-bg-primary": "blue",
        "--btn-hover-bg-secondary": "gray",
      }),
      dsl.atRule(
        "utility",
        "btn-*",
        componentBody(
          dsl.styleList({
            "--btn-hover-bg": dsl.match.variable("--btn-hover-bg"),
          }),
          dsl.styleList({ color: dsl.match.variable("--btn-hover-bg") }),
        ),
      ),
      dsl.atRule(
        "utility",
        "btn-hover",
        dsl.layer.components(
          dsl.styleList({ "background-color": dsl.cssvar("--btn-hover-bg") }),
        ),
      ),
    ]);
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
        componentBody(
          dsl.styleList({
            color: dsl.match.variable("--btn-color"),
            "background-color": dsl.match.variable("--btn-bg"),
          }),
        ),
      ),

      dsl.atRule("utility", "btn", "btn-solid"),
    ];

    expect(result).toEqual(expected);
  });
});

describe("themeable = FALSE / variants - OPTIONAL", () => {
  it("uses the base var default for optional variant refs before omitting unresolved ones", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--color": "black" })
        .variant("solid", { "--color": "blue" })
        .variant("outline", { "--bg": "red" })
        .optionalVariants()
        .body({
          color: dsl.cssvar("--color"),
          "background-color": dsl.cssvar("--bg"),
          padding: dsl.spacing("4"),
        }),
    );

    const expected = [
      dsl.atRule("theme", {
        "--btn-color": "black",
      }),
      dsl.atRule("theme", "inline", {
        "--btn-color-solid": "blue",
        "--btn-bg-outline": "red",
      }),

      dsl.atRule(
        "utility",
        "btn-*",
        componentBody(
          dsl.styleList({
            color: dsl.match.variable("--btn-color"),
            "background-color": dsl.match.variable("--btn-bg"),
            padding: dsl.spacing("4"),
          }),
        ),
      ),

      dsl.atRule(
        "utility",
        "btn",
        componentBody(
          dsl.styleList({ color: "black", padding: dsl.spacing("4") }),
        ),
      ),
    ];

    expect(result).toEqual(expected);
  });

  it("drops unresolved variant refs from the static base component while keeping non-variant styles", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .variant("solid", { "--color": "blue" })
        .variant("outline", { "--bg": "red" })
        .optionalVariants()
        .body({
          color: dsl.cssvar("--color"),
          "background-color": dsl.cssvar("--bg"),
          padding: dsl.spacing("4"),
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
        componentBody(
          dsl.styleList({
            color: dsl.match.variable("--btn-color"),
            "background-color": dsl.match.variable("--btn-bg"),
            padding: dsl.spacing("4"),
          }),
        ),
      ),

      dsl.atRule(
        "utility",
        "btn",
        componentBody(dsl.styleList({ padding: dsl.spacing("4") })),
      ),
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
        componentBody(
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

describe("themeable = TRUE NO DEFAULT / variants - OPTIONAL", () => {
  it("uses base defaults for optional variant refs in themeable static components", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--color": dsl.currentText(500) })
        .variant("solid", { "--color": dsl.currentText(700) })
        .variant("outline", { "--bg": dsl.current(500) })
        .optionalVariants()
        .body({
          color: dsl.cssvar("--color"),
          "background-color": dsl.cssvar("--bg"),
          padding: dsl.spacing("4"),
        }),
    );

    const expected = [
      dsl.atRule("theme", {
        "--btn-color": dsl.currentText(500),
      }),
      dsl.atRule("theme", "inline", {
        "--btn-color-solid": dsl.currentText(700),
        "--btn-bg-outline": dsl.current(500),
      }),
      dsl.atRule(
        "utility",
        "btn-*",
        componentBody(
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
            padding: dsl.spacing("4"),
          },
        ),
      ),

      ...PALETTE.map((p) =>
        dsl.atRule(
          "utility",
          `btn/${p}`,
          componentBody(
            `palette-${p}`,
            dsl.styleList({
              color: dsl.adaptiveText(p as (typeof PALETTE)[number], 500),
              padding: dsl.spacing("4"),
            }),
          ),
        ),
      ),

      dsl.atRule(
        "utility",
        "btn",
        componentBody(
          dsl.styleList({
            color: dsl.currentText(500),
            padding: dsl.spacing("4"),
          }),
        ),
      ),
    ];

    expect(result).toEqual(expected);
  });

  it("drops unresolved variant refs from themeable static components while keeping palette and non-variant styles", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .variant("solid", { "--color": dsl.currentText(500) })
        .variant("outline", { "--bg": dsl.current(500) })
        .optionalVariants()
        .body({
          color: dsl.cssvar("--color"),
          "background-color": dsl.cssvar("--bg"),
          padding: dsl.spacing("4"),
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
        componentBody(
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
            padding: dsl.spacing("4"),
          },
        ),
      ),

      ...PALETTE.map((p) =>
        dsl.atRule(
          "utility",
          `btn/${p}`,
          componentBody(
            `palette-${p}`,
            dsl.styleList({ padding: dsl.spacing("4") }),
          ),
        ),
      ),

      dsl.atRule(
        "utility",
        "btn",
        componentBody(dsl.styleList({ padding: dsl.spacing("4") })),
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
        componentBody(
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
        dsl.atRule("utility", `btn/${p}`, `btn-outline/${p}`),
      ),
    ];

    expect(result).toEqual(expected);
  });
});

describe("themeable = TRUE WITH DEFAULT / variants - OPTIONAL", () => {
  it("drops unresolved variant refs from themeable static components and keeps the default palette entry", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .variant("solid", { "--color": dsl.currentText(500) })
        .variant("outline", { "--bg": dsl.current(500) })
        .defaultTheme("secondary")
        .optionalVariants()
        .body({
          color: dsl.cssvar("--color"),
          "background-color": dsl.cssvar("--bg"),
          padding: dsl.spacing("4"),
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
        componentBody(
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
            padding: dsl.spacing("4"),
          },
        ),
      ),

      ...PALETTE.map((p) =>
        dsl.atRule(
          "utility",
          `btn/${p}`,
          componentBody(
            `palette-${p}`,
            dsl.styleList({ padding: dsl.spacing("4") }),
          ),
        ),
      ),

      dsl.atRule("utility", "btn", "btn/secondary"),
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
        componentBody(
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
        dsl.atRule("utility", `btn/${p}`, `btn-outline/${p}`),
      ),

      dsl.atRule("utility", "btn", `btn-outline/secondary`),
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
          .derive("group", (child) =>
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
          .derive("group", (child) =>
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
        componentBody(
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
          .derive("group", (child) =>
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
        componentBody(
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
          .derive("group", (child) =>
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
        componentBody(
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
          .derive("group", (child) =>
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
          .derive("group", (child) =>
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
        componentBody(
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
          .derive("group", (child) =>
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

      const expected = dsl.atRule("utility", "btn-group", "btn-group-solid");

      expect(actual).toEqual(expected);
    });
  });
});

describe("controlled vars", () => {
  it("generates a {varname}-* utility named after the scoped var for a token candidate", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { sm: "0.875rem" })
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

    describe("slots", () => {
      it("rewrites class slots used in nested selectors", () => {
        const result = componentBuilderToDsl(
          component("btn")
            .slot("icon", "class")
            .body(({ slot }) => ({
              $: {
                [`& > ${slot("icon")}`]: {
                  color: "red",
                },
              },
            })),
        );

        expect(
          result.find(
            (x) =>
              x.$ast === "at-rule" &&
              x.name === "utility" &&
              x.prelude === "btn",
          ),
        ).toEqual(
          dsl.atRule(
            "utility",
            "btn",
            componentBody(
              dsl.styleRule("& > .icon", {
                color: "red",
              }),
            ),
          ),
        );
      });

      it("rewrites data attribute slots used in nested selectors", () => {
        const result = componentBuilderToDsl(
          component("btn")
            .slot("icon", "data-attr")
            .body(({ slot }) => ({
              $: {
                [`&:has(${slot("icon")})`]: {
                  color: "red",
                },
              },
            })),
        );

        expect(
          result.find(
            (x) =>
              x.$ast === "at-rule" &&
              x.name === "utility" &&
              x.prelude === "btn",
          ),
        ).toEqual(
          dsl.atRule(
            "utility",
            "btn",
            componentBody(
              dsl.styleRule('&:has([data-slot="icon"])', {
                color: "red",
              }),
            ),
          ),
        );
      });

      it("lets derived components reference slots declared on the parent", () => {
        const result = componentBuilderToDsl(
          component("btn")
            .slot("icon", "class")
            .derive("group", (child) =>
              child.body(({ slot }) => ({
                $: {
                  [`& > ${slot("icon")}`]: {
                    color: "red",
                  },
                },
              })),
            ),
        );

        expect(
          result.find(
            (x) =>
              x.$ast === "at-rule" &&
              x.name === "utility" &&
              x.prelude === "btn-group",
          ),
        ).toEqual(
          dsl.atRule(
            "utility",
            "btn-group",
            componentBody(
              dsl.styleRule("& > .icon", {
                color: "red",
              }),
            ),
          ),
        );
      });
    });

    describe("guards", () => {
      it("emits custom variants for component guards", () => {
        const result = componentBuilderToDsl(
          component("btn")
            .guard("open", "&[data-open='true']")
            .guard("disabled", "&[aria-disabled='true']"),
        );

        expect(
          result.filter(
            (x) => x.$ast === "at-rule" && x.name === "custom-variant",
          ),
        ).toEqual([
          dsl.atRule("custom-variant", "btn-open (&[data-open='true'])"),
          dsl.atRule(
            "custom-variant",
            "btn-disabled (&[aria-disabled='true'])",
          ),
        ]);
      });

      it("emits parent and child guard variants with scoped names", () => {
        const result = componentBuilderToDsl(
          component("btn")
            .guard("open", "&[data-open='true']")
            .derive("group", (child) =>
              child.guard("active", "&[data-active='true']"),
            ),
        );

        expect(
          result.filter(
            (x) => x.$ast === "at-rule" && x.name === "custom-variant",
          ),
        ).toEqual([
          dsl.atRule("custom-variant", "btn-open (&[data-open='true'])"),
          dsl.atRule(
            "custom-variant",
            "btn-group-active (&[data-active='true'])",
          ),
        ]);
      });
    });
  });

  it("token candidates produce a match.variable in utility", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { sm: "0.875rem" })
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
      dsl.layer.components(
        dsl.styleList({
          "--btn-size": dsl.match.variable("--btn-size"),
        }),
      ),
    );

    expect(actual).toEqual(expected);
  });

  it("multiple token candidates collapse to a single match.variable for the scoped var", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { sm: "0.875rem", lg: "1.25rem" })
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
        dsl.layer.components(
          dsl.styleList({
            "--btn-size": dsl.match.oneOf(dsl.match.variable("--btn-size")),
          }),
        ),
      ),
    );
  });

  it("arbitrary candidate maps to match.arbitrary.{type}()", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", dsl.match.arbitrary.length())
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
        dsl.layer.components(
          dsl.styleList({
            "--btn-size": dsl.match.oneOf(dsl.match.arbitrary.length()),
          }),
        ),
      ),
    );
  });

  it("bare candidate maps to match.bare.{type}()", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", dsl.match.bare.integer())
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
        dsl.layer.components(
          dsl.styleList({
            "--btn-size": dsl.match.oneOf(dsl.match.bare.integer()),
          }),
        ),
      ),
    );
  });

  it("mixed candidates use single token variable lookup plus arbitrary/bare candidates", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled(
          "--size",
          { sm: "0.875rem" },
          dsl.match.arbitrary.length(),
          dsl.match.bare.number(),
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
        dsl.layer.components(
          dsl.styleList({
            "--btn-size": dsl.match.oneOf(
              dsl.match.variable("--btn-size"),
              dsl.match.arbitrary.length(),
              dsl.match.bare.number(),
            ),
          }),
        ),
      ),
    );
  });

  it("referenced controlled var is rewritted to scoped variable", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .vars({ "--size": "1rem" })
        .controlled("--size", { sm: "0.875rem" })
        .body({ padding: dsl.cssvar("--size") }),
    );

    const actual = result.find(
      (x) =>
        x.$ast === "at-rule" && x.name === "utility" && x.prelude === "btn",
    );

    const expected = dsl.atRule(
      "utility",
      "btn",
      componentBody(
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
        .controlled("--size", { sm: "0.875rem" })
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
        .controlled("--size", {
          sm: "0.875rem",
          md: "1rem",
          lg: "1.25rem",
        })
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
        .controlled("--size", dsl.match.arbitrary.length())
        .controlled("--weight", dsl.match.bare.number())
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
        .controlled("--size", dsl.match.arbitrary.length())
        .body({ padding: dsl.cssvar("--size") })
        .derive("group", (child) =>
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

    const expected = dsl.atRule(
      "utility",
      "btn-icon",
      dsl.layer.components({
        "--btn-px": "8px",
        "--btn-py": "8px",
      }),
    );

    expect(actual).toEqual(expected);
  });
});

describe("cascade layers", () => {
  // Inside Tailwind's `utilities` layer, styles directly in `components` beat
  // styles in its nested `base` layer, and plain utilities beat both.
  it.each([
    ["static body", component("box").body({ margin: "0" }), "box"],
    [
      "dynamic body",
      component("box")
        .variant("sm", { "--size": "1rem" })
        .body({ "font-size": dsl.cssvar("--size") }),
      "box-*",
    ],
    [
      "themeable body",
      component("box").body({ color: dsl.current(500) }),
      "box/primary",
    ],
    [
      "derived body",
      component("box")
        .body({ margin: "0" })
        .derive("group", (child) => child.body({ display: "flex" })),
      "box-group",
    ],
  ])("nests the %s in components > base", (_, builder, name) => {
    expect(
      layerPath(utilityNamed(componentBuilderToDsl(builder), name)),
    ).toEqual(["components", "base"]);
  });

  it("puts .utility() output in components, above the body", () => {
    const result = componentBuilderToDsl(
      component("box")
        .body({ margin: "0" })
        .utility("flush", { margin: "-1rem" }),
    );

    expect(layerPath(utilityNamed(result, "box-flush"))).toEqual([
      "components",
    ]);
  });

  it("puts controlled var utilities in components, above the body", () => {
    const result = componentBuilderToDsl(
      component("box")
        .vars({ "--size": "1rem" })
        .controlled("--size", dsl.match.arbitrary.length())
        .body({ padding: dsl.cssvar("--size") }),
    );

    expect(layerPath(utilityNamed(result, "box-size-*"))).toEqual([
      "components",
    ]);
  });

  it.each([
    [
      "default variant",
      component("box")
        .variant("sm", { "--size": "1rem" })
        .defaultVariant("sm")
        .body({ "font-size": dsl.cssvar("--size") }),
      "box",
      "box-sm",
    ],
    [
      "default theme",
      component("box")
        .defaultTheme("primary")
        .body({ color: dsl.current(500) }),
      "box",
      "box/primary",
    ],
    [
      "palette of a default variant",
      component("box")
        .variant("sm", { "--size": "1rem" })
        .defaultVariant("sm")
        .body({
          "font-size": dsl.cssvar("--size"),
          color: dsl.current(500),
        }),
      "box/accent",
      "box-sm/accent",
    ],
  ])(
    "leaves a %s alias unwrapped so it keeps the applied class's layer",
    (_, builder, name, applied) => {
      expect(utilityNamed(componentBuilderToDsl(builder), name)).toEqual(
        dsl.atRule("utility", name, applied),
      );
    },
  );
});

describe("applyTo", () => {
  it("styles a selector with the component class", () => {
    const result = componentBuilderToDsl(
      component("article")
        .body({ margin: "0" })
        .applyTo(dsl.select.element("article")),
    );

    expect(result.filter((x) => x.$ast === "style-rule")).toEqual([
      dsl.styleRule(dsl.select.element("article"), "article"),
    ]);
  });

  it("styles a selector with a variant class", () => {
    const result = componentBuilderToDsl(
      component("heading")
        .variant("1", { "--size": "3rem" })
        .variant("2", { "--size": "2rem" })
        .body({ "font-size": dsl.cssvar("--size") })
        .applyTo(dsl.select.element("h1"), "1")
        .applyTo(dsl.select.element("h2"), "2"),
    );

    expect(result.filter((x) => x.$ast === "style-rule")).toEqual([
      dsl.styleRule(dsl.select.element("h1"), "heading-1"),
      dsl.styleRule(dsl.select.element("h2"), "heading-2"),
    ]);
  });

  it("emits the selector rules after the component's utilities", () => {
    const result = componentBuilderToDsl(
      component("heading")
        .variant("1", { "--size": "3rem" })
        .body({ "font-size": dsl.cssvar("--size") })
        .applyTo(dsl.select.element("h1"), "1"),
    );

    const lastUtility = result.findLastIndex(
      (x) => x.$ast === "at-rule" && x.name === "utility",
    );
    const rule = result.findIndex((x) => x.$ast === "style-rule");

    expect(lastUtility).toBeGreaterThanOrEqual(0);
    expect(rule).toBeGreaterThan(lastUtility);
  });

  it("uses the scoped name for derived components", () => {
    const result = componentBuilderToDsl(
      component("btn")
        .body({ margin: "0" })
        .derive("group", (child) =>
          child.body({ display: "flex" }).applyTo(dsl.select.element("menu")),
        ),
    );

    expect(result.filter((x) => x.$ast === "style-rule")).toEqual([
      dsl.styleRule(dsl.select.element("menu"), "btn-group"),
    ]);
  });

  it("rejects a variant the component doesn't define", () => {
    expect(() =>
      component("heading")
        .variant("1", { "--size": "3rem" })
        .body({ "font-size": dsl.cssvar("--size") })
        // @ts-expect-error "7" is not a defined variant
        .applyTo(dsl.select.element("h1"), "7"),
    ).toThrow(/heading.*"7"/);
  });

  it("rejects applying the bare class when variants are required", () => {
    const builder = component("heading")
      .variant("1", { "--size": "3rem" })
      .body({ "font-size": dsl.cssvar("--size") })
      .applyTo(dsl.select.element("h1"));

    expect(() => componentBuilderToDsl(builder)).toThrow(
      /heading.*requires a variant.*h1/,
    );
  });

  it("allows the bare class when variants are optional", () => {
    const result = componentBuilderToDsl(
      component("heading")
        .vars({ "--size": "1rem" })
        .variant("1", { "--size": "3rem" })
        .optionalVariants()
        .body({ "font-size": dsl.cssvar("--size") })
        .applyTo(dsl.select.element("h1")),
    );

    expect(result.filter((x) => x.$ast === "style-rule")).toEqual([
      dsl.styleRule(dsl.select.element("h1"), "heading"),
    ]);
  });

  it("rejects a variant whose class isn't generated because the body doesn't use it", () => {
    const builder = component("box")
      .variant("1", { "--size": "3rem" })
      .body({ margin: "0" })
      .applyTo(dsl.select.element("h1"), "1");

    expect(() => componentBuilderToDsl(builder)).toThrow(
      /box-1.*isn't generated.*h1/,
    );
  });

  it("rejects a variant whose vars the body never reads", () => {
    // Tailwind only generates box-2 from box-* if variant 2 sets a var the
    // body reads, so `@apply box-2` would fail the build.
    const builder = component("box")
      .variant("1", { "--size": "3rem" })
      .variant("2", { "--unused": "1px" })
      .body({ "font-size": dsl.cssvar("--size") })
      .applyTo(dsl.select.element("h2"), "2");

    expect(() => componentBuilderToDsl(builder)).toThrow(
      /box-2.*isn't generated.*h2/,
    );
  });
});

/** Expected wrapper for a component body: `@layer components { @layer base { … } }`. */
function componentBody(...styles: dsl.AtRuleBodyBuilder[]) {
  return dsl.layer.components(dsl.layer.base(...styles));
}

function utilityNamed(
  result: ReturnType<typeof componentBuilderToDsl>,
  name: string,
) {
  return result.find(
    (x) => x.$ast === "at-rule" && x.name === "utility" && x.prelude === name,
  );
}

/** Names of the `@layer`s that wrap a utility's whole body, outermost first. */
function layerPath(node: ReturnType<typeof utilityNamed>) {
  const path: (string | null)[] = [];
  let rules = node?.$ast === "at-rule" ? node.rules : [];
  while (rules.length === 1 && rules[0]!.$ast === "at-rule") {
    const [only] = rules as [dsl.AtRuleAst];
    if (only.name !== "layer") break;
    path.push(only.prelude);
    rules = only.rules;
  }
  return path;
}

describe("property", () => {
  it("emits a top-level @property, scoped to the component", () => {
    const result = componentBuilderToDsl(
      component("tip").property("--delay", {
        syntax: "<time>",
        inherits: false,
        initialValue: "500ms",
      }),
    );

    expect(result).toEqual([
      dsl.atRule("property", "--tip-delay", {
        syntax: '"<time>"',
        inherits: "false",
        "initial-value": "500ms",
      }),
    ]);
  });

  it("renders inherits: true", () => {
    const result = componentBuilderToDsl(
      component("tip").property("--color", {
        syntax: "<color>",
        inherits: true,
        initialValue: "black",
      }),
    );

    expect(result).toEqual([
      dsl.atRule("property", "--tip-color", {
        syntax: '"<color>"',
        inherits: "true",
        "initial-value": "black",
      }),
    ]);
  });

  it("emits one @property per registered property, in order", () => {
    const result = componentBuilderToDsl(
      component("tip")
        .property("--open", {
          syntax: "<time>",
          inherits: false,
          initialValue: "500ms",
        })
        .property("--close", {
          syntax: "<time>",
          inherits: false,
          initialValue: "250ms",
        }),
    );

    expect(
      result
        .filter((x) => x.$ast === "at-rule" && x.name === "property")
        .map((x) => (x as { prelude: string }).prelude),
    ).toEqual(["--tip-open", "--tip-close"]);
  });

  it("scopes references and assignments in the body and utilities", () => {
    const result = componentBuilderToDsl(
      component("tip")
        .property("--delay", {
          syntax: "<time>",
          inherits: false,
          initialValue: "500ms",
        })
        .body({ "transition-delay": dsl.cssvar("--delay") })
        .utility("slow", { "--delay": "1s" }),
    );
    const utility = (name: string) =>
      result.find(
        (x) =>
          x.$ast === "at-rule" && x.name === "utility" && x.prelude === name,
      );

    expect(utility("tip")).toEqual(
      dsl.atRule(
        "utility",
        "tip",
        dsl.layer.components(
          dsl.layer.base({ "transition-delay": dsl.cssvar("--tip-delay") }),
        ),
      ),
    );
    expect(utility("tip-slow")).toEqual(
      dsl.atRule(
        "utility",
        "tip-slow",
        dsl.layer.components({ "--tip-delay": "1s" }),
      ),
    );
  });

  it("joins several syntax components with |", () => {
    const result = componentBuilderToDsl(
      component("tip").property("--size", {
        syntax: ["<length>", "<percentage>"],
        inherits: false,
        initialValue: "0px",
      }),
    );

    expect(result).toEqual([
      dsl.atRule("property", "--tip-size", {
        syntax: '"<length> | <percentage>"',
        inherits: "false",
        "initial-value": "0px",
      }),
    ]);
  });

  it("types syntax as the @property data types and their list forms", () => {
    const valid: RegisteredProperty["syntax"][] = [
      "*",
      "<time>",
      "<length-percentage>",
      "<custom-ident>+",
      "<color>#",
      ["<length>", "<percentage>"],
    ];
    expect(valid).toHaveLength(6);

    // @ts-expect-error - not a data type
    const typo: RegisteredProperty["syntax"] = "<tme>";
    // @ts-expect-error - data types are written in angle brackets
    const bare: RegisteredProperty["syntax"] = "time";
    // @ts-expect-error - <transform-list> is already a list
    const list: RegisteredProperty["syntax"] = "<transform-list>+";
    expect([typo, bare, list]).toHaveLength(3);
  });

  it("keeps the @property out of the component's utilities", () => {
    const result = componentBuilderToDsl(
      component("tip")
        .property("--delay", {
          syntax: "<time>",
          inherits: false,
          initialValue: "500ms",
        })
        .body({ "transition-delay": dsl.cssvar("--delay") }),
    );
    const nestedProperty = result.some(
      (x) =>
        x.$ast === "at-rule" &&
        x.name === "utility" &&
        JSON.stringify(x).includes('"name":"property"'),
    );

    expect(nestedProperty).toBe(false);
    expect(
      result.some((x) => x.$ast === "at-rule" && x.name === "property"),
    ).toBe(true);
  });
});
