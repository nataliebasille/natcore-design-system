import { type Palette, type StyleRuleBodyBuilder } from "../../dsl/public";
import type { ThemeProperties } from "../theme";
import type { ComponentState, ControlledVar, VarsProperty } from "./types";

export class ComponentBuilder<T extends ComponentState = ComponentState> {
  readonly state: T;
  constructor(state: T) {
    this.state = state;
  }

  vars<const P extends ThemeProperties>(vars: P) {
    return new ComponentBuilder({
      ...this.state,
      vars,
    } as T & { vars: P });
  }

  variant<const V extends string, const P extends ThemeProperties>(
    name: V,
    vars: P,
  ) {
    return new ComponentBuilder({
      ...this.state,
      variants: {
        ...this.state.variants,
        [name]: vars,
      },
    } as T & { variants: Record<V, P> });
  }

  defaultTheme<P extends Palette>(
    palette: P,
  ): ComponentBuilder<Omit<T, "defaultTheme"> & { defaultTheme: P }> {
    return new ComponentBuilder({
      ...this.state,
      defaultTheme: palette,
    } as Omit<T, "defaultTheme"> & { defaultTheme: P });
  }

  defaultVariant<const V extends keyof T["variants"] & string>(variantName: V) {
    return new ComponentBuilder({
      ...this.state,
      defaultVariant: variantName,
    } as T & { defaultVariant: V });
  }

  controlled<
    const V extends keyof T["vars"],
    const C extends ControlledVar["candidates"],
  >(variable: V, ...candidates: C) {
    return new ComponentBuilder({
      ...this.state,
      vars: {
        ...this.state.vars,
        [variable]: {
          default: this.state["vars"][variable as `--${string}`],
          candidates,
        },
      },
    } as unknown as Omit<T, "vars"> & {
      vars: {
        [K in keyof T["vars"]]: K extends V ?
          {
            default: T["vars"][K];
            candidates: C;
          }
        : T["vars"][K];
      };
    } & T);
  }

  body<const B extends StyleRuleBodyBuilder[]>(...styles: B) {
    return new ComponentBuilder({
      ...this.state,
      body: styles,
    } as T & { body: B });
  }

  derive<const N extends string, C extends ComponentState>(
    childName: N,
    configure: (
      child: ComponentBuilder<{
        name: N;
        vars: {};
        variants: {};
        body: [];
        parent: T;
        utilities: {};
      }>,
    ) => ComponentBuilder<C>,
  ) {
    const childBuilder = new ComponentBuilder({
      name: childName,
      vars: {},
      variants: {},
      body: [],
      parent: this.state,
      utilities: {},
    });

    return configure(childBuilder) as ComponentBuilder<C & { parent: T }>;
  }

  utility<const U extends string, const B extends StyleRuleBodyBuilder[]>(
    name: U,
    ...styles: B
  ) {
    const existingUtilities = this.state.utilities[name] || [];
    const updatedUtilities = [...existingUtilities, ...styles];
    return new ComponentBuilder({
      ...this.state,
      utilities: {
        ...this.state.utilities,
        [name]: updatedUtilities,
      },
    } as T & {
      utilities: Omit<T["utilities"], U> &
        Record<U, [...T["utilities"][U], ...B]>;
    });
  }
}

export function component<const N extends string>(name: N) {
  return new ComponentBuilder({
    name,
    vars: {},
    variants: {},
    body: [],
    utilities: {},
  });
}
