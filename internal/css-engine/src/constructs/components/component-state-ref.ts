import type {
  StyleListAst_WithMetadata,
  StylePropertyValue,
  StyleRuleAst_WithMetadata,
} from "../../dsl/ast/style-rule";
import { stylesheetVisitorBuilder } from "../../dsl/ast/stylesheet-visitor-builder";
import type { ThemeProperties } from "../theme";
import { ThemeBag } from "./theme-bag";
import type { ComponentSlot, ComponentState } from "./types";
import {
  normalizeStyleBuilders,
  resolveComponentName,
  themeableDefinition,
  traverseBottomUp,
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

  get state() {
    return this.#state;
  }

  #body: (StyleListAst_WithMetadata | StyleRuleAst_WithMetadata)[] | null =
    null;

  get body() {
    if (!this.#body) {
      this.#body = normalizeStyleBuilders(this.#state, this.#state.body);
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
        isThemeable: false;
        default?: never;
      }
    | {
        isThemeable: true;
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
        hasVariants: false;
        own?: never;
        selection?: never;
      }
    | {
        hasVariants: true;
        own: Record<
          string,
          Record<string, StylePropertyValue | StylePropertyValue[]>
        >;
        selection: ComponentState["variants"]["selection"];
      }
    | null = null;

  get variants() {
    if (!this.#variants) {
      let hasVariantRefs = false;

      stylesheetVisitorBuilder()
        .on("css-var", (ast) => {
          hasVariantRefs ||= !!this.#themeBag.getVariantVar(
            ast.name as `--${string}`,
          );
          return ast;
        })
        .visit(this.body);

      this.#variants =
        hasVariantRefs ?
          {
            hasVariants: true,
            own: this.#state.variants.values,
            selection: this.#state.variants.selection,
          }
        : { hasVariants: false };
    }

    return this.#variants;
  }

  get guards() {
    return this.#state.guards;
  }

  get utilities() {
    return this.#state.utilities;
  }

  #slots:
    | {
        hasSlots: true;
        slots: Record<string, { selector: ComponentSlot["selector"] }>;
      }
    | {
        hasSlots: false;
      } = { hasSlots: false };
  get slots() {
    if (!this.#slots) {
      let slots = {} as Record<string, { selector: ComponentSlot["selector"] }>;

      traverseBottomUp(this.#state, (state) => {
        slots = Object.assign(slots, state.slots);
      });

      this.#slots =
        Object.keys(slots).length > 0 ?
          { hasSlots: true, slots }
        : { hasSlots: false };
    }

    return this.#slots;
  }
}
