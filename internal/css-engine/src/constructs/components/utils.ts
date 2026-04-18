import type {
  StyleListAst_WithMetadata,
  StyleRuleAst_WithMetadata,
  StyleRuleBodyBuilder,
} from "../../dsl/ast/style-rule";
import { dsl, stylesheetVisitorBuilder } from "../../dsl/public";
import type { ComponentState } from "./public";
import { ThemeBag } from "./theme-bag";

export function normalizeStyleBuilders(
  builders: StyleRuleBodyBuilder[],
): (StyleListAst_WithMetadata | StyleRuleAst_WithMetadata)[] {
  const list: StyleRuleBodyBuilder[] =
    Array.isArray(builders) ? builders : [builders];

  return list.flatMap((builder) => {
    if (typeof builder === "object" && builder !== null && "$ast" in builder) {
      return [builder as StyleListAst_WithMetadata | StyleRuleAst_WithMetadata];
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
    ] as (StyleListAst_WithMetadata | StyleRuleAst_WithMetadata)[];
  });
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
  let hasVariantRefs = false;

  stylesheetVisitorBuilder()
    .on("css-var", (ast) => {
      hasVariantRefs ||= themeBag.isVariantVar(ast.name as `--${string}`);
      return ast;
    })
    .visit(state.body);

  return hasVariantRefs ?
      ({
        state: true,
        own: state.variants,
        default: state.defaultVariant,
      } as const)
    : ({ state: false } as const);
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
