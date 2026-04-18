import type { StylePropertyValue } from "../../css/ast/style-list";
import type { StyleRuleBodyBuilder } from "../../dsl/ast/style-rule";
import { dsl, stylesheetVisitorBuilder } from "../../dsl/public";
import type { ThemeProperties } from "../theme";

// Maps a var to the vars involved in its definition (i.e. vars it references in its value)
// example --size: calc(var(--base-size) * var(--multiplier)) => { "--size": Set{ "--base-size", "--multiplier" } }
type VarReferences = {
  [varName: `--${string}`]: Set<`--${string}`>;
};

export class VarReferenceMap {
  #varReferences: VarReferences = {};
  #definitions: Record<string, VarReferences> = {};

  constructor() {}

  addVars(vars: ThemeProperties) {
    for (const [varName, value] of Object.entries(vars)) {
      this.#varReferences[varName as `--${string}`] =
        this.#getReferencedVars(value);
    }
  }

  addUtility(id: string, value: StyleRuleBodyBuilder[]) {
    const rule = dsl.styleRule(`&`, ...value);

    if (!this.#definitions[id]) {
      this.#definitions[id] = {};
    }

    const utilityReferences: VarReferences = this.#definitions[id]!;

    stylesheetVisitorBuilder()
      .on("style-list", (ast) => {
        for (const style of ast.styles) {
          if ("$ast" in style) continue; // TailwindClassAst — leave unchanged

          for (const [key, value] of Object.entries(style)) {
            if (key.startsWith("--")) {
              if (!utilityReferences[key as `--${string}`]) {
                utilityReferences[key as `--${string}`] = new Set();
              }

              utilityReferences[key as `--${string}`]!.union(
                this.#getReferencedVars(value),
              );
            }
          }
        }
        return ast;
      })
      .visit(rule);
  }

  composesWith(value: StyleRuleBodyBuilder[]) {
    const referencedVars = this.#expandVars(this.#getReferencedVars(value));

    if (!referencedVars.size) return [];

    return Object.entries(this.#definitions)
      .filter(([_, varRefs]) =>
        Object.entries(varRefs).some(
          ([varName, refs]) =>
            referencedVars.has(varName as `--${string}`) ||
            [...refs].some((r) => referencedVars.has(r)),
        ),
      )
      .map(([id]) => id);
  }

  #expandVars(vars: Set<`--${string}`>): Set<`--${string}`> {
    const result = new Set<`--${string}`>(vars);
    const queue = [...vars];

    while (queue.length) {
      const v = queue.shift()!;
      const refs = this.#varReferences[v];
      if (refs) {
        for (const ref of refs) {
          if (!result.has(ref)) {
            result.add(ref);
            queue.push(ref);
          }
        }
      }
    }

    return result;
  }

  #getReferencedVars(value: unknown): Set<`--${string}`> {
    const referencedVars = new Set<`--${string}`>();

    stylesheetVisitorBuilder()
      .on("css-var", (ast) => {
        referencedVars.add(ast.name);
        return ast;
      })
      .visit(value);

    return referencedVars;
  }
}
