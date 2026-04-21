import {
  type Palette,
  type Selector,
  type StyleRuleBodyBuilder,
} from "../../dsl/public";
import type { ThemeProperties } from "../theme";
import type {
  ComponentSlot,
  ComponentState,
  ControlledVar,
  VarsProperty,
} from "./types";

type DefinedVariants<T extends ComponentState> =
  T extends { parent: infer P extends ComponentState } ?
    keyof T["variants"] | DefinedVariants<P>
  : keyof T["variants"];

type VarsMap = Record<`--${string}`, VarsProperty>;

type UpdateState<T extends ComponentState, Next> = Omit<T, keyof Next> & Next;

type ChildState<N extends string, T extends ComponentState> = {
  name: N;
  parent: T;
  vars: {};
  variants: {};
  utilities: {};
  guards: {};
  slots: {};
  body: [];
};

type VarDefault<V extends VarsProperty> =
  V extends ControlledVar ? V["default"] : V;

type ControlledVars<
  T extends ComponentState,
  V extends keyof T["vars"],
  C extends ControlledVar["candidates"],
> = {
  [K in keyof T["vars"]]: K extends V ?
    {
      default: VarDefault<T["vars"][K] & VarsProperty>;
      candidates: C;
    }
  : T["vars"][K];
};

type UtilityMap<
  T extends ComponentState,
  U extends string,
  B extends StyleRuleBodyBuilder[],
> = Omit<T["utilities"], U> & Record<U, [...T["utilities"][U], ...B]>;

type BodyBuilderProps<T extends ComponentState> =
  T["slots"] extends [] ? {}
  : {
      slot(name: T["slots"][string]): Selector;
    };
type BodyBuilder<T extends ComponentState> = (
  props: BodyBuilderProps<T>,
) => StyleRuleBodyBuilder | StyleRuleBodyBuilder[];

export type ComponentBuilder<T extends ComponentState = ComponentState> = {
  state: T;
  vars<const P extends VarsMap>(
    vars: P,
  ): ComponentBuilder<UpdateState<T, { vars: P }>>;
  variant<const V extends string, const P extends ThemeProperties>(
    name: V,
    vars: P,
  ): ComponentBuilder<
    UpdateState<T, { variants: T["variants"] & Record<V, P> }>
  >;
  defaultTheme<P extends Palette>(
    palette: P,
  ): ComponentBuilder<UpdateState<T, { defaultTheme: P }>>;
  defaultVariant<const V extends DefinedVariants<T>>(
    variantName: V,
  ): ComponentBuilder<UpdateState<T, { defaultVariant: V }>>;
  controlled<
    const V extends keyof T["vars"],
    const C extends ControlledVar["candidates"],
  >(
    variable: V,
    ...candidates: C
  ): ComponentBuilder<UpdateState<T, { vars: ControlledVars<T, V, C> }>>;
  slot<N extends string>(
    name: N,
  ): ComponentBuilder<
    UpdateState<
      T,
      { slots: T["slots"] & Record<N, { selector: ComponentSlot }> }
    >
  >;
  slot<N extends string>(
    name: N,
    selector: ComponentSlot["selector"],
  ): ComponentBuilder<
    UpdateState<
      T,
      { slots: T["slots"] & Record<N, { selector: ComponentSlot["selector"] }> }
    >
  >;
  guard<const G extends string>(
    name: G,
    conditionSelector: Selector,
  ): ComponentBuilder<
    UpdateState<T, { guards: T["guards"] & Record<G, Selector> }>
  >;
  body<const B extends StyleRuleBodyBuilder[]>(
    ...styles: B
  ): ComponentBuilder<UpdateState<T, { body: B }>>;
  body(
    builder: BodyBuilder<T>,
  ): ComponentBuilder<UpdateState<T, { body: StyleRuleBodyBuilder[] }>>;
  derive<const N extends string, C extends ComponentState>(
    childName: N,
    configure: (
      child: ComponentBuilder<ChildState<N, T>>,
    ) => ComponentBuilder<C>,
  ): ComponentBuilder<UpdateState<C, { parent: T }>>;

  utility<const U extends string, const B extends StyleRuleBodyBuilder[]>(
    name: U,
    ...styles: B
  ): ComponentBuilder<UpdateState<T, { utilities: UtilityMap<T, U, B> }>>;
};

class ComponentBuilderImpl<T extends ComponentState = ComponentState> {
  readonly state: T;
  constructor(state: T) {
    this.state = state;
  }

  vars<const P extends VarsMap>(vars: P) {
    return new ComponentBuilderImpl({
      ...this.state,
      vars,
    } as UpdateState<T, { vars: P }>);
  }

  variant<const V extends string, const P extends ThemeProperties>(
    name: V,
    vars: P,
  ) {
    return new ComponentBuilderImpl({
      ...this.state,
      variants: {
        ...this.state.variants,
        [name]: vars,
      },
    } as unknown as UpdateState<T, { variants: T["variants"] & Record<V, P> }>);
  }

  defaultTheme<P extends Palette>(palette: P) {
    return new ComponentBuilderImpl({
      ...this.state,
      defaultTheme: palette,
    } as UpdateState<T, { defaultTheme: P }>);
  }

  defaultVariant<const V extends DefinedVariants<T>>(variantName: V) {
    return new ComponentBuilderImpl({
      ...this.state,
      defaultVariant: variantName,
    } as UpdateState<T, { defaultVariant: V }>);
  }

  controlled<
    const V extends keyof T["vars"],
    const C extends ControlledVar["candidates"],
  >(variable: V, ...candidates: C) {
    return new ComponentBuilderImpl({
      ...this.state,
      vars: {
        ...this.state.vars,
        [variable]: {
          default: this.state["vars"][variable as `--${string}`],
          candidates,
        },
      },
    } as unknown as UpdateState<T, { vars: ControlledVars<T, V, C> }>);
  }

  guard<const G extends string>(name: G, conditionSelector: Selector) {
    return new ComponentBuilderImpl({
      ...this.state,
      guards: {
        ...this.state.guards,
        [name]: conditionSelector,
      },
    } as unknown as UpdateState<
      T,
      { guards: T["guards"] & Record<G, Selector> }
    >);
  }

  slot<const S extends string>(
    name: S,
    selector: ComponentSlot["selector"] = "data-attr",
  ) {
    return new ComponentBuilderImpl({
      ...this.state,
      slots: {
        ...this.state.slots,
        [name]: { selector },
      },
    } as unknown as UpdateState<
      T,
      { slots: T["slots"] & Record<S, { selector: ComponentSlot["selector"] }> }
    >);
  }

  body(
    builderOrFirstStyle: BodyBuilder<T> | StyleRuleBodyBuilder,
    ...styles: StyleRuleBodyBuilder[]
  ) {
    const bodyStyles =
      typeof builderOrFirstStyle === "function" ?
        builderOrFirstStyle({ slot: (name) => `::slotted(${name})` })
      : [builderOrFirstStyle, ...styles];
    return new ComponentBuilderImpl({
      ...this.state,
      body: bodyStyles,
    } as UpdateState<T, { body: StyleRuleBodyBuilder[] }>);
  }

  utility<const U extends string, const B extends StyleRuleBodyBuilder[]>(
    name: U,
    ...styles: B
  ) {
    const existingUtilities = this.state.utilities[name] || [];
    const updatedUtilities = [...existingUtilities, ...styles];
    return new ComponentBuilderImpl({
      ...this.state,
      utilities: {
        ...this.state.utilities,
        [name]: updatedUtilities,
      },
    } as unknown as UpdateState<T, { utilities: UtilityMap<T, U, B> }>);
  }

  derive<const N extends string, C extends ComponentState>(
    childName: N,
    configure: (
      child: ComponentBuilder<ChildState<N, T>>,
    ) => ComponentBuilder<C>,
  ) {
    const childBuilder = new ComponentBuilderImpl({
      name: childName,
      vars: {},
      variants: {},
      body: [],
      parent: this.state,
      utilities: {},
      slots: {},
      guards: {},
    } as ChildState<N, T>);

    return configure(
      childBuilder as ComponentBuilder<ChildState<N, T>>,
    ) as unknown as ComponentBuilder<UpdateState<C, { parent: T }>>;
  }
}

export function component<const N extends string>(name: N) {
  return new ComponentBuilderImpl({
    name,
    vars: {},
    variants: {},
    body: [],
    utilities: {},
    slots: {},
    guards: {},
  } as Omit<
    ChildState<N, ComponentState>,
    "parent"
  >) as unknown as ComponentBuilder<
    Omit<ChildState<N, ComponentState>, "parent">
  >;
}

export function isComponentBuilder(value: unknown): value is ComponentBuilder {
  return value instanceof ComponentBuilderImpl;
}
