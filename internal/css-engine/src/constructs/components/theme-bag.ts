import type { StylePropertyValue } from "../../dsl/ast/style-rule";
import { stylesheetVisitorBuilder } from "../../dsl/ast/stylesheet-visitor-builder";
import { dsl } from "../../dsl/public";
import {
  isControlledVar,
  type ComponentState,
  type ControlledVar,
} from "./types";
import { resolveComponentName } from "./utils";

export class ThemeBag {
  #resolvedName: string;
  #toScoped: Record<`--${string}`, `--${string}-${string}`>;
  #bag: Record<
    `--${string}-${string}`,
    | {
        original: `--${string}`;
        type: "variant";
        value: Record<string, StylePropertyValue | StylePropertyValue[]>;
      }
    | {
        original: `--${string}`;
        type: "default";
        value: StylePropertyValue | StylePropertyValue[];
      }
    | {
        original: `--${string}`;
        type: "static";
        value: StylePropertyValue | StylePropertyValue[];
      }
    | {
        original: `--${string}`;
        type: "controlled";
        value: ControlledVar;
      }
  >;
  #controlledVars: Array<{
    scopedVarName: `--${string}-${string}`;
    originalName: `--${string}`;
    value: ControlledVar;
  }> = [];

  constructor(state: ComponentState) {
    this.#resolvedName = resolveComponentName(state);
    this.#toScoped = {};
    this.#bag = {};

    const stateStack: ComponentState[] = [];
    let current: ComponentState | undefined = state;
    while (current) {
      stateStack.unshift(current);
      current = current.parent;
    }

    // Process states from parent to child, so that child overrides take precedence in the bag
    for (let i = 0; i < stateStack.length; i++) {
      this.#addStateVars(stateStack[i]!);
    }

    Object.entries(state.vars)
      .filter((x): x is [string, ControlledVar] => isControlledVar(x[1]))
      .forEach(([varName, value]) => {
        const scopedName = this.#getScopedName(state, varName as `--${string}`);

        this.#controlledVars.push({
          scopedVarName: scopedName,
          originalName: varName as `--${string}`,
          value,
        });
      });
  }

  tryScope(varName: `--${string}`) {
    return this.#toScoped[varName] ?? varName;
  }

  rewriteScopedVariables<T>(value: T) {
    return stylesheetVisitorBuilder()
      .on("match-value", (ast) => {
        const candidate = ast.candidates.find(
          (c) => c.$twCandidate === "variable",
        );
        if (candidate) {
          const rewrite =
            this.#toScoped[
              (candidate as { root: string }).root as `--${string}`
            ];
          if (rewrite) return dsl.match.variable(rewrite);
        }
        return ast;
      })
      .on("css-var", (ast) => {
        const themeVar = this.#toScoped[ast.name as `--${string}`] ?? ast.name;
        return dsl.cssvar(themeVar);
      })
      .on("style-list", (ast) => {
        const newStyles = ast.styles.map((style) => {
          if ("$ast" in style) return style; // TailwindClassAst — leave unchanged
          const rewritten: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(style)) {
            const rewrittenKey = this.#toScoped[key as `--${string}`] ?? key;
            rewritten[rewrittenKey] = value;
          }
          return rewritten as typeof style;
        });
        return { ...ast, styles: newStyles };
      })
      .visit(value);
  }

  isVariantVar(varName: `--${string}`) {
    const scoped = this.#toScoped[varName];
    return scoped ? this.#bag[scoped]?.type === "variant" : false;
  }

  get controlledVars() {
    return this.#controlledVars;
  }

  #getScopedName(state: ComponentState, varName: `--${string}`) {
    return `--${resolveComponentName(state)}-${varName.slice(2)}` as const;
  }

  #addStateVars(state: ComponentState) {
    Object.entries(state.vars).forEach(([varName, value]) => {
      const scopedName = this.#getScopedName(state, varName as `--${string}`);
      this.#toScoped[varName as `--${string}`] = scopedName;

      this.#bag[scopedName] =
        isControlledVar(value) ?
          {
            type: "controlled",
            original: varName as `--${string}`,
            value,
          }
        : {
            type: "default",
            original: varName as `--${string}`,
            value,
          };
    });

    Object.entries(state.variants).forEach(([variantName, vars]) => {
      Object.entries(vars).forEach((keyValue) => {
        const varName = keyValue[0] as `--${string}`;
        const value = keyValue[1];
        const scopedName = this.#getScopedName(state, varName);

        this.#toScoped[varName] = scopedName;

        if (!this.#bag[scopedName]) {
          this.#bag[scopedName] = {
            type: "variant",
            original: varName,
            value: {},
          };
        }

        if (this.#bag[scopedName]?.type === "variant") {
          this.#bag[scopedName].value[variantName] = value;
        }
      });
    });
  }
}
