/**
 * Spec for the `form-control` component (form-control.css.ts). A form control
 * lays out a label, an optional prefix and suffix, the field, and a hint in a
 * grid. Parts are slots: a plain <label> and <input>/<select>/<textarea> are
 * found automatically, `data-slot="label"`/`data-slot="input"` place custom
 * elements, and `data-slot="prefix" | "suffix" | "hint"` mark the rest.
 */
import { describe, expect, it } from "vitest";
import {
  buildNatcoreCss,
  declarations,
  findDecls,
  flatten,
  resolveVars,
  winsByLayer,
} from "../../../../test/helpers/build-natcore-css.ts";

const VARIANTS = ["outline", "soft", "solid", "underline"] as const;

const LABEL = ':is(label, [data-slot="label"])';
const INPUT = ':is(input, select, textarea, [data-slot="input"])';

describe("form-control layout", () => {
  it("lays the parts out in a label / prefix-input-suffix / hint grid", async () => {
    const root = await buildNatcoreCss(["form-control"]);
    const decls = declarations(root, {
      selector: ".form-control",
      atRule: null,
    });

    expect(decls.display).toBe("grid");
    expect(decls["grid-template-areas"]).toMatch(
      /"label label label"\s*"prefix input suffix"\s*"hint hint hint"/,
    );
  });

  it.each([
    ["label", LABEL],
    ["input", INPUT],
    ["prefix", '[data-slot="prefix"]'],
    ["suffix", '[data-slot="suffix"]'],
    ["hint", '[data-slot="hint"]'],
  ])("puts the %s slot (%s) in its grid area", async (area, slot) => {
    const root = await buildNatcoreCss(["form-control"]);

    expect(slotDecls(root, "form-control", slot)["grid-area"]).toBe(area);
  });

  it("no longer styles parts through .form-control-* part classes", async () => {
    const root = await buildNatcoreCss(["form-control"]);
    const selectors = flatten(root).map((decl) => decl.selector);

    expect(selectors.some((s) => s.startsWith(".form-control"))).toBe(true);
    expect(
      selectors.filter((s) =>
        /\.form-control-(label|hint|prefix|suffix)\b/.test(s),
      ),
    ).toEqual([]);
  });

  it("draws the wrapper as a bordered box when it has no input inside", async () => {
    const root = await buildNatcoreCss(["form-control"]);
    const props = Object.keys(
      declarations(root, {
        selector: `.form-control:not(:has(> ${INPUT}))`,
        atRule: null,
      }),
    );

    expect(props.some((prop) => prop.startsWith("border"))).toBe(true);
    expect(props.some((prop) => prop.startsWith("padding"))).toBe(true);
  });
});

describe("form-control variants", () => {
  it.each(VARIANTS)("form-control-%s is generated", async (variant) => {
    const root = await buildNatcoreCss([`form-control-${variant}`]);

    expect(classRules(root, `form-control-${variant}`).length).toBeGreaterThan(
      0,
    );
  });

  it("has no ghost variant", async () => {
    const root = await buildNatcoreCss(["form-control-ghost"]);

    expect(classRules(root, "form-control-ghost")).toEqual([]);
  });

  it("`form-control` on its own renders the outline variant", async () => {
    const root = await buildNatcoreCss([
      "form-control",
      "form-control-outline",
    ]);

    const bare = classRules(root, "form-control");
    expect(bare.length).toBeGreaterThan(0);
    expect(bare).toEqual(classRules(root, "form-control-outline"));
  });

  it("every variant looks different", async () => {
    const root = await buildNatcoreCss(
      VARIANTS.map((variant) => `form-control-${variant}`),
    );
    const looks = VARIANTS.map((variant) =>
      JSON.stringify(classRules(root, `form-control-${variant}`)),
    );

    expect(new Set(looks).size).toBe(VARIANTS.length);
  });

  it.each(VARIANTS)(
    "form-control-%s/primary takes its colors from the primary palette",
    async (variant) => {
      const cls = `form-control-${variant}/primary`;
      const root = await buildNatcoreCss([cls]);
      const decls = declarations(root, {
        selector: `.${cls.replace("/", "\\/")}`,
        atRule: null,
      });

      expect(
        Object.entries(decls).some(
          ([prop, value]) =>
            prop.startsWith("--bg-tone-") && value.includes("primary"),
        ),
      ).toBe(true);
    },
  );

  it("variants combine with breakpoints", async () => {
    const root = await buildNatcoreCss([
      "form-control",
      "md:form-control-soft",
    ]);

    expect(
      findDecls(root, {
        selector: ".md\\:form-control-soft",
        atRule: "width >= 48rem",
      }).length,
    ).toBeGreaterThan(0);
  });
});

describe("form-control error state", () => {
  it("has no form-control-error utility; errors use the /danger palette", async () => {
    const root = await buildNatcoreCss(["form-control-error"]);

    expect(classRules(root, "form-control-error")).toEqual([]);
  });

  it("form-control/danger colors the control from the danger palette", async () => {
    const root = await buildNatcoreCss(["form-control/danger"]);

    expect(dangerDecls(root, ".form-control\\/danger").length).toBeGreaterThan(
      0,
    );
  });

  it("has no built-in invalid rule; has-user-invalid:/has-aria-invalid: opt in", async () => {
    const root = await buildNatcoreCss(["form-control"]);

    expect(
      flatten(root)
        .map((decl) => decl.selector)
        .filter(
          (selector) =>
            selector.startsWith(".form-control") &&
            /user-invalid|aria-invalid/.test(selector),
        ),
    ).toEqual([]);
  });
});

describe("form-control internals", () => {
  it("keeps a focus outline for the input in forced-colors mode", async () => {
    const root = await buildNatcoreCss(["form-control"]);

    expect(
      findDecls(root, {
        selector: `.form-control > ${INPUT}`,
        atRule: "forced-colors: active",
      }).map((decl) => decl.prop),
    ).toContain("outline");
  });

  it("sets no internal --state-* variables", async () => {
    const root = await buildNatcoreCss([
      "form-control",
      "form-control-soft/primary",
    ]);

    expect(
      flatten(root)
        .filter((decl) => decl.selector.startsWith(".form-control"))
        .filter((decl) => decl.prop.startsWith("--state-")),
    ).toEqual([]);
  });
});

describe("form-control cascade", () => {
  it("Tailwind utilities override the component's layout", async () => {
    const root = await buildNatcoreCss(["form-control", "grid-cols-1"]);
    const [component] = findDecls(root, {
      selector: ".form-control",
      prop: "grid-template-columns",
      atRule: null,
    });
    const [tailwind] = findDecls(root, {
      selector: ".grid-cols-1",
      prop: "grid-template-columns",
    });

    expect(component?.layer).toBe("utilities.components.base");
    expect(winsByLayer(root, tailwind!, component!)).toBe(true);
  });
});

/** Declarations for one slot, merged across every `.cls … > slot` rule. */
function slotDecls(
  root: Awaited<ReturnType<typeof buildNatcoreCss>>,
  cls: string,
  slot: string,
) {
  const decls: Record<string, string> = {};
  for (const decl of flatten(root)) {
    if (
      decl.atRules.length === 0 &&
      decl.selector.startsWith(`.${cls}`) &&
      decl.selector.endsWith(` > ${slot}`)
    ) {
      decls[decl.prop] = decl.value;
    }
  }
  return decls;
}

/** Declarations on (or nested under) a selector whose value resolves to the
 * danger palette. */
function dangerDecls(
  root: Awaited<ReturnType<typeof buildNatcoreCss>>,
  selector: string | RegExp,
) {
  const matches =
    typeof selector === "string" ?
      (s: string) =>
        s.startsWith(selector) && /^($|[ :>[])/.test(s.slice(selector.length))
    : (s: string) => selector.test(s);

  return flatten(root).filter(
    (decl) =>
      matches(decl.selector) &&
      resolveVars(root, decl.value).includes("danger"),
  );
}

/** All declarations for a class (including nested/pseudo selectors), with the
 * class swapped for `&` so different classes can be compared. */
function classRules(
  root: Awaited<ReturnType<typeof buildNatcoreCss>>,
  cls: string,
) {
  const escaped = cls.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const pattern = new RegExp(`\\.${escaped}(?![\\w-])`);

  return flatten(root)
    .filter((decl) => pattern.test(decl.selector))
    .map((decl) => ({
      selector: decl.selector.replace(pattern, "&"),
      atRules: decl.atRules,
      prop: decl.prop,
      value: decl.value,
    }));
}
