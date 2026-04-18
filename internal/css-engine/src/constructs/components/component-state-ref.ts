import type {
  StyleListAst_WithMetadata,
  StylePropertyValue,
  StyleRuleAst_WithMetadata,
} from "../../dsl/ast/style-rule";
import { stylesheetVisitorBuilder } from "../../dsl/ast/stylesheet-visitor-builder";
import { ThemeBag } from "./theme-bag";
import type { ComponentState } from "./types";
import {
  normalizeStyleBuilders,
  resolveComponentName,
  themeableDefinition,
} from "./utils";

export class ComponentStateRef {
  #state: ComponentState;
  #resolvedName: string;
  #themeBag: ThemeBag;

  constructor(state: ComponentState) {
    const componentName = resolveComponentName(state);
    this.#state = state;
    this.#resolvedName = componentName;
    this.#themeBag = new ThemeBag(this.#state);
  }

  #body: (StyleListAst_WithMetadata | StyleRuleAst_WithMetadata)[] | null =
    null;

  get body() {
    if (!this.#body) {
      this.#body = normalizeStyleBuilders(this.#state.body);
    }

    return this.#body;
  }

  get themeBag() {
    return this.#themeBag;
  }

  get name() {
    return this.#resolvedName;
  }

  get vars() {
    return this.#state.vars;
  }

  #themeable:
    | {
        state: false;
        default?: never;
      }
    | {
        state: true;
        default: string | undefined;
      }
    | null = null;

  get themeable() {
    if (!this.#themeable) {
      this.#themeable = themeableDefinition(this.#state);
    }

    return this.#themeable;
  }

  #variants:
    | {
        state: false;
        own?: never;
        default?: never;
      }
    | {
        state: true;
        own: Record<
          string,
          Record<string, StylePropertyValue | StylePropertyValue[]>
        >;
        default: string | undefined;
      }
    | null = null;

  get variants() {
    if (!this.#variants) {
      let hasVariantRefs = false;

      stylesheetVisitorBuilder()
        .on("css-var", (ast) => {
          hasVariantRefs ||= this.#themeBag.isVariantVar(
            ast.name as `--${string}`,
          );
          return ast;
        })
        .visit(this.body);

      this.#variants =
        hasVariantRefs ?
          {
            state: true,
            own: this.#state.variants,
            default: this.#state.defaultVariant,
          }
        : { state: false };
    }

    return this.#variants;
  }

  get utilities() {
    return this.#state.utilities;
  }
}
