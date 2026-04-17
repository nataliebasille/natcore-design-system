import {
  type Palette,
  type StylePropertyValue,
  type StyleRuleBodyBuilder,
  type TwArbitraryCandidate,
  type TwBareCandidate,
} from "../dsl/public";
import type { ThemeProperties } from "./theme";

export type ControlledVar = {
  default: StylePropertyValue | StylePropertyValue[];
  candidates: (
    | {
        type: "token";
        token: string;
        value: StylePropertyValue | StylePropertyValue[];
      }
    | {
        type: "arbitrary";
        dataType: TwArbitraryCandidate["dataType"];
      }
    | {
        type: "bare";
        dataType: TwBareCandidate["dataType"];
      }
  )[];
};

export type VarsProperty = StylePropertyValue | ControlledVar;

export type ComponentState = {
  name: string;
  defaultTheme?: Palette;
  vars: Record<`--${string}`, VarsProperty>;
  variants: Record<string, ThemeProperties>;
  defaultVariant?: string;
  body: StyleRuleBodyBuilder[];
  utilities: Record<string, StyleRuleBodyBuilder[]>;
  parent?: ComponentState;
};

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
    } as Omit<T, "vars"> & {
      vars: Omit<T["vars"], V> & {
        [K in V]: {
          default: T["vars"][K];
          candidates: C;
        };
      };
    });
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
        vars: Record<`--${string}`, VarsProperty>;
        variants: T["variants"];
        body: StyleRuleBodyBuilder[];
        parent: ComponentState;
        utilities: Record<string, StyleRuleBodyBuilder[]>;
      }>,
    ) => ComponentBuilder<C>,
  ): ComponentBuilder<C> {
    const childBuilder = new ComponentBuilder({
      name: childName,
      vars: {},
      variants: {},
      body: [],
      parent: this.state as ComponentState,
      utilities: {},
    } as {
      name: N;
      vars: Record<`--${string}`, VarsProperty>;
      variants: T["variants"];
      body: StyleRuleBodyBuilder[];
      parent: ComponentState;
      utilities: Record<string, StyleRuleBodyBuilder[]>;
    });

    return configure(childBuilder);
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
