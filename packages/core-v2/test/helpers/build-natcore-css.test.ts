import { describe, expect, it } from "vitest";
import {
  buildNatcoreCss,
  declarations,
  findDecls,
  resolveVars,
} from "./build-natcore-css.ts";

describe("buildNatcoreCss", () => {
  it("compiles the natcore bundle from source and flattens nesting", async () => {
    const root = await buildNatcoreCss(["tray-left"]);

    expect(
      declarations(root, { selector: ".tray-left", atRule: null }),
    ).toMatchObject({ position: "absolute", transform: "translateX(-100%)" });
    expect(declarations(root, { selector: ".tray-left[open]" })).toEqual({
      transform: "translate(0, 0) !important",
    });
    expect(
      declarations(root, { selector: '.tray-left [data-slot="toggle"]' }),
    ).toEqual({ display: "none" });
  });

  it("keeps breakpoint-prefixed classes inside their media query", async () => {
    const root = await buildNatcoreCss(["md:tray-right"]);

    expect(
      declarations(root, {
        selector: ".md\\:tray-right",
        atRule: "width >= 48rem",
      }),
    ).toMatchObject({ transform: "translateX(100%)" });
    expect(
      declarations(root, { selector: ".md\\:tray-right", atRule: null }),
    ).toEqual({});
  });

  it("reports the cascade layer of each declaration", async () => {
    const root = await buildNatcoreCss(["tray-left", "tray-open"]);

    expect(
      findDecls(root, { selector: ".tray-left", prop: "position" })[0]?.layer,
    ).toBe("utilities.components");
    expect(
      findDecls(root, { selector: ".tray-open", prop: "transform" })[0]?.layer,
    ).toBe("utilities");
  });

  it("resolves size values whether inlined or referenced", async () => {
    const root = await buildNatcoreCss(["btn-size-lg"]);
    const size = declarations(root, { selector: ".btn-size-lg" })["--btn-size"];

    expect(resolveVars(root, size!)).toBe("1.25rem");
    expect(resolveVars(root, "var(--missing, 2px)")).toBe("2px");
  });
});
