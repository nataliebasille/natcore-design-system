import { expect, it } from "vitest";
import { VarReferenceMap } from "./var-reference-map";
import { component } from "./component-builder";
import { dsl } from "../../dsl/public";

it("body that references a var composes with utility that sets that same var", () => {
  const map = new VarReferenceMap();
  const comp = component("btn")
    .utility("set-color", {
      "--color": "red",
    })
    .body({
      color: dsl.cssvar("--color"),
    });

  map.addUtility("set-color", comp.state.utilities["set-color"]);

  const actual = map.composesWith(comp.state.body);
  const expected = ["set-color"];

  expect(actual).toEqual(expected);
});

it("body that transitively references a var composes with utility that sets that var", () => {
  const comp = component("btn")
    .utility("set-size", {
      "--base-size": "red",
    })
    .body({
      "--multiplier": "2",
      "--sizes": dsl.calc`${dsl.cssvar("--base-size")} * ${dsl.cssvar("--multiplier")}`,
      color: dsl.cssvar("--sizes"),
    });

  const map = new VarReferenceMap();
  map.addUtility("set-size", comp.state.utilities["set-size"]);

  const actual = map.composesWith(comp.state.body);
  const expected = ["set-size"];

  expect(actual).toEqual(expected);
});

it("body that references a component var which transitively references a utility var composes with that utility", () => {
  const comp = component("btn")
    .vars({
      "--muliplier": "2",
      "--base-size": "2rem",
      "--sizes": dsl.calc`${dsl.cssvar("--base-size")} * ${dsl.cssvar("--multiplier")}`,
    })
    .utility("set-size", {
      "--multiplier": "10",
    })
    .body({
      color: dsl.cssvar("--sizes"),
    });

  const map = new VarReferenceMap();
  map.addVars(comp.state.vars);
  map.addUtility("set-size", comp.state.utilities["set-size"]);

  const actual = map.composesWith(comp.state.body);
  const expected = ["set-size"];

  expect(actual).toEqual(expected);
});
