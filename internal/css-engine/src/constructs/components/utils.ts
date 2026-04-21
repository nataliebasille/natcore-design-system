import type {
  StyleListAst_WithMetadata,
  StyleRuleBodyBuilder,
} from "../../dsl/ast/style-rule";
import { dsl, stylesheetVisitorBuilder } from "../../dsl/public";
import type { ThemeProperties } from "../theme";
import type { ComponentState } from "./public";
import { ThemeBag } from "./theme-bag";
import type { ComponentSlot } from "./types";

const SLOT_REGEX = /::slotted\(\s*([^)]+?)\s*\)/g;

export function normalizeStyleBuilders(
  state: ComponentState,
  builders: StyleRuleBodyBuilder[],
) {
  const list: StyleRuleBodyBuilder[] =
    Array.isArray(builders) ? builders : [builders];

  const body = list.flatMap((builder) => {
    if (
      typeof builder === "object" &&
      builder !== null &&
      "$ast" in builder &&
      builder.$ast !== "tailwind-class"
    ) {
      return [builder];
    }

    if (
      typeof builder === "string" ||
      (typeof builder === "object" && builder !== null && "prefix" in builder)
    ) {
      return [dsl.styleList(builder) as unknown as StyleListAst_WithMetadata];
    }

    const { $, ...styles } = builder as dsl.StyleProperties & {
      $?: {
        [K in dsl.Selector]?: StyleRuleBodyBuilder | StyleRuleBodyBuilder[];
      };
    };

    return [
      ...(Object.keys(styles).length > 0 ?
        [dsl.styleList(styles as dsl.StyleProperties)]
      : []),
      ...(typeof $ === "object" && $ !== null ?
        Object.entries($).map(([selector, body]) =>
          dsl.styleRule(
            selector as dsl.Selector,
            ...((!body ? []
            : Array.isArray(body) ? body
            : [body]) as StyleRuleBodyBuilder[]),
          ),
        )
      : []),
    ];
  });

  const slots = getSlots(state);

  return Object.keys(slots).length === 0 ?
      body
    : stylesheetVisitorBuilder()
        .on("style-rule", (ast) => {
          const selector = ast.selector.replace(
            SLOT_REGEX,
            (_match, slotName: string) => {
              return resolveSlotSelector(slotName.trim(), slots);
            },
          );

          ast.selector = selector as dsl.Selector;

          return ast;
        })
        .visit(body);
}

export function resolveComponentName(state: ComponentState): string {
  if (state.parent) {
    return `${resolveComponentName(state.parent)}-${state.name}`;
  }
  return state.name;
}

export function themeableDefinition(state: ComponentState) {
  return isComponentThemeable(state) ?
      ({
        state: true,
        default: state.defaultTheme,
      } as const)
    : ({ state: false } as const);
}

export function variantDefinition(state: ComponentState) {
  const themeBag = new ThemeBag(state);
  const variantVarsInBody = new Set<`--${string}`>();

  stylesheetVisitorBuilder()
    .on("css-var", (ast) => {
      if (themeBag.isVariantVar(ast.name as `--${string}`)) {
        variantVarsInBody.add(ast.name as `--${string}`);
      }
      return ast;
    })
    .visit(state.body);

  if (variantVarsInBody.size === 0) {
    return { state: false } as const;
  }

  const inheritedVariants: Record<string, ThemeProperties> = {};
  let defaultVariant = state.defaultVariant;
  let current = state.parent;

  while (current) {
    defaultVariant ??= current.defaultVariant;
    for (const [variantName, vars] of Object.entries(current.variants)) {
      if (
        Object.keys(vars).some((k) => variantVarsInBody.has(k as `--${string}`))
      ) {
        inheritedVariants[variantName] ??= vars;
      }
    }
    current = current.parent;
  }

  return {
    state: true,
    own: state.variants,
    inherited: inheritedVariants,
    default: defaultVariant,
  } as const;
}

function isComponentThemeable(state: ComponentState): boolean {
  // Auto-detect themeability: any ColorAst with palette === "current" in body, vars, or variants
  let themeable = false;
  stylesheetVisitorBuilder()
    .on("color", (ast) => {
      themeable ||= ast.palette === "current";
      return ast;
    })
    .visit([
      state.body,
      state.vars,
      state.variants,
      state.parent?.vars ?? {},
      state.parent?.variants ?? {},
    ]);

  return themeable;
}

export function traverseBottomUp(
  state: ComponentState,
  callback: (state: ComponentState) => void,
) {
  let current: ComponentState | undefined = state;

  while (current) {
    callback(current);
    current = current.parent;
  }
}

export function traverseTopDown(
  state: ComponentState,
  callback: (state: ComponentState) => void,
) {
  let stateStack: ComponentState[] = [];
  let current: ComponentState | undefined = state;

  while (current) {
    stateStack.unshift(current);
    current = current.parent;
  }

  for (const state of stateStack) {
    callback(state);
  }
}

export function getSlots(state: ComponentState) {
  let slotsMap: ComponentState["slots"] = {};

  traverseBottomUp(state, (s) => {
    slotsMap = Object.assign(slotsMap, s.slots);
  });

  return slotsMap;
}

export function resolveSlotSelector(
  slotName: string,
  slots: Record<string, ComponentSlot>,
) {
  const slot = slots[slotName];
  const selector = slot?.selector;

  return (
    selector === "class" ? `.${slotName}`
    : selector === "data-attr" ? `[data-slot="${slotName}"]`
    : (selector ?? slotName)
  );
}
