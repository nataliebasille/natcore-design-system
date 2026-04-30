import {
  type AtRuleAst,
  type AtRuleBodyBuilder,
  type AtRuleContent,
  type CssDataType,
  type DesignSystemAst,
  dsl,
  type MatchValueAst,
  type Palette,
  PALETTE,
  type StyleListAst_WithMetadata,
  type StylePropertyValue,
  type StyleRuleAst_WithMetadata,
  type StyleRuleBodyBuilder,
  stylesheetVisitorBuilder,
} from "../../dsl/public.ts";
import { type ComponentBuilder } from "./component-builder.ts";
import { type ThemeProperties } from "../theme.ts";
import { colorKeyWithoutPalette, renderPalette } from "../palette-utils.ts";
import { ComponentStateRef } from "./component-state-ref.ts";
import { normalizeStyleBuilders } from "./utils.ts";
import {
  isControlledVar,
  type ComponentState,
  type ControlledVar,
  type VarsProperty,
} from "./types.ts";

type Themes = {
  inline: ThemeProperties;
  static: ThemeProperties;
  default: ThemeProperties;
};

type Generated = {
  themes: Themes;
  body: (dsl.StyleListAst | dsl.StyleRuleAst | dsl.AtRuleAst)[];
};

type GeneratorReduceFn = (acc: Generated, curr: ComponentStateRef) => Generated;

const varsGenerator: GeneratorReduceFn = (acc, curr) => {
  acc.themes.default = {
    ...acc.themes.default,
    ...curr.themeBag.rewriteScopedVariables(
      Object.fromEntries(
        Object.entries(curr.vars)
          .filter(
            (x): x is [`--${string}`, Exclude<VarsProperty, ControlledVar>] =>
              isControlledVar(x[1]) === false,
          )
          .map(([variable, value]) => [
            `--${curr.name}-${variable.slice(2)}`,
            value,
          ]),
      ),
    ),
  };

  return acc;
};

const variantVarsGenerator: GeneratorReduceFn = (acc, curr) => {
  for (const [variant, vars] of Object.entries(curr.variants.own ?? {})) {
    acc.themes.inline = {
      ...acc.themes.inline,
      ...Object.fromEntries(
        Object.entries(curr.themeBag.rewriteScopedVariables(vars)).map(
          ([variable, value]) => [
            `--${curr.name}-${variable.slice(2)}-${variant}`,
            value,
          ],
        ),
      ),
    };
  }

  return acc;
};

const staticComponentGenerator: GeneratorReduceFn = (acc, curr) => {
  if (
    (!curr.themeable.isThemeable || !curr.themeable.default) &&
    (!curr.variants.hasVariants || curr.variants.selection.mode === "optional")
  ) {
    // Standalone static component. Has it's own body
    appendComponentIfExists(
      acc.body,
      curr.name,
      curr.variants.hasVariants && curr.variants.selection.mode === "optional" ?
        resolveOptionalVariantReferences(curr, curr.body)
      : curr.body,
    );
  } else {
    // A static component that references a dynamic component needs to be generated
    // when the component has a default theme or variant.

    appendComponentIfExists(acc.body, curr.name, [
      curr.themeable.default ?
        !curr.variants.hasVariants ? `${curr.name}/${curr.themeable.default}`
        : curr.variants.selection.mode === "default" ?
          `${curr.name}-${curr.variants.selection.key}/${curr.themeable.default}`
        : curr.variants.selection.mode === "optional" ?
          `${curr.name}/${curr.themeable.default}`
        : null
      : (
        curr.themeable.isThemeable === false &&
        curr.variants.selection?.mode === "default"
      ) ?
        `${curr.name}-${curr.variants.selection.key}`
      : null,
    ]);
  }

  return acc;
};

const themeableStaticComponentsGenerator: GeneratorReduceFn = (acc, curr) => {
  if (!curr.themeable.isThemeable) return acc;

  for (const palette of PALETTE) {
    appendComponentIfExists(
      acc.body,
      `${curr.name}/${palette}`,
      !curr.variants.hasVariants ?
        [`palette-${palette}`, ...applyCurrentPalette(palette, curr.body)]
      : curr.variants.selection.mode === "optional" ?
        [
          `palette-${palette}`,
          ...resolveOptionalVariantReferences(
            curr,
            applyCurrentPalette(palette, curr.body),
          ),
        ]
      : [
          curr.variants.selection?.mode === "default" ?
            `${curr.name}-${curr.variants.selection.key}/${palette}`
          : null,
        ],
    );
  }

  return acc;
};

const dynamicComponentGenerator: GeneratorReduceFn = (acc, curr) => {
  if (curr.variants.hasVariants) {
    // Bridge variant vars used in utilities onto the dynamic element so
    // utilities can read them via plain var().
    const utilityVariantVarNames = new Set<`--${string}`>();
    Object.values(curr.utilities).forEach((body) => {
      stylesheetVisitorBuilder()
        .on("css-var", (ast) => {
          if (curr.themeBag.getVariantVar(ast.name as `--${string}`)) {
            utilityVariantVarNames.add(
              curr.themeBag.tryScope(ast.name as `--${string}`),
            );
          }
          return ast;
        })
        .visit(normalizeStyleBuilders(curr.state, body));
    });

    const bridge =
      utilityVariantVarNames.size > 0 ?
        dsl.styleList(
          Object.fromEntries(
            [...utilityVariantVarNames].map((scopedName) => [
              scopedName,
              dsl.match.variable(scopedName),
            ]),
          ) as dsl.StyleProperties,
        )
      : null;

    appendComponentIfExists(acc.body, `${curr.name}-*`, [
      bridge,
      curr.themeable.isThemeable &&
        renderPalette((color) =>
          dsl.match.asModifier(
            dsl.match.variable(
              colorKeyWithoutPalette({ ...color, mode: "adaptive" }),
            ),
          ),
        ),
      ...stylesheetVisitorBuilder()
        .on("css-var", (ast) => {
          if (curr.themeBag.getVariantVar(ast.name as `--${string}`)) {
            return dsl.match.variable(ast.name as `--${string}`);
          }

          return ast;
        })
        .visit(curr.body),
    ]);

    return acc;
  }

  return acc;
};

const controlledVarGenerator: GeneratorReduceFn = (acc, curr) => {
  curr.themeBag.controlledVars.forEach(({ scopedVarName, value }) => {
    const matchers: MatchValueAst<CssDataType>[] = [];

    value.candidates.forEach((candidate) => {
      if ("$ast" in candidate && candidate.$ast === "match-value") {
        matchers.push(candidate as MatchValueAst<CssDataType>);
      } else {
        acc.themes.inline = {
          ...acc.themes.inline,
          ...Object.fromEntries(
            Object.entries(candidate).map(
              ([key, value]) => [`${scopedVarName}-${key}`, value] as const,
            ),
          ),
        };

        matchers.push(dsl.match.variable(scopedVarName));
      }
    });

    if (value.default) {
      acc.themes.default[scopedVarName] = value.default;
    }

    if (matchers.length > 0) {
      acc.body.push(
        dsl.atRule("utility", `${scopedVarName.slice(2)}-*`, {
          [scopedVarName]:
            matchers.length === 1 ? matchers[0]! : dsl.match.oneOf(...matchers),
        }),
      );
    }
  });

  return acc;
};

const utilitiesGenerator: GeneratorReduceFn = (acc, curr) => {
  Object.entries(curr.utilities).forEach(([utilityName, body]) => {
    const fullUtilityName = `${curr.name}-${utilityName}`;
    acc.body.push(
      dsl.atRule(
        "utility",
        fullUtilityName,
        ...normalizeStyleBuilders(curr.state, body),
      ),
    );
  });

  return acc;
};

const guardsGenerator: GeneratorReduceFn = (acc, curr) => {
  Object.entries(curr.guards).forEach(([guardName, selector]) => {
    acc.body.push(
      dsl.atRule("custom-variant", `${curr.name}-${guardName} (${selector})`),
    );
  });

  return acc;
};

const generators: GeneratorReduceFn[] = [
  varsGenerator,
  variantVarsGenerator,
  dynamicComponentGenerator,
  themeableStaticComponentsGenerator,
  staticComponentGenerator,
  controlledVarGenerator,
  utilitiesGenerator,
  guardsGenerator,
];

export function componentBuilderToDsl({
  state,
}: ComponentBuilder): (dsl.StyleListAst | dsl.StyleRuleAst | dsl.AtRuleAst)[] {
  const themes: Themes = {
    inline: {},
    static: {},
    default: {},
  };

  const result = internalComponentBuilderToDsl(state, themes);

  return [
    Object.keys(themes.default).length > 0 ?
      dsl.atRule("theme", themes.default)
    : null,
    Object.keys(themes.inline).length > 0 ?
      dsl.atRule("theme", "inline", themes.inline)
    : null,
    Object.keys(themes.static).length > 0 ?
      dsl.atRule("theme", "static", themes.static)
    : null,

    ...result,
  ].filter((x) => !!x);
}

function internalComponentBuilderToDsl(
  state: ComponentState,
  themes: Themes,
): (dsl.StyleListAst | dsl.StyleRuleAst | dsl.AtRuleAst)[] {
  // If this component was created via extend(), also compile the parent first
  const parentOutput =
    state.parent ? internalComponentBuilderToDsl(state.parent, themes) : [];

  return [...parentOutput, ...componentStateToDsl(state, themes)];
}

function componentStateToDsl(
  state: ComponentState,
  themes: Themes,
): (dsl.StyleListAst | dsl.StyleRuleAst | dsl.AtRuleAst)[] {
  const componentRef = new ComponentStateRef(state);

  const generated = generators.reduce(
    (acc, gen) => {
      return gen(acc, componentRef);
    },
    {
      themes,
      body: [],
    } satisfies Generated as Generated,
  );

  return [
    ...componentRef.themeBag.rewriteScopedVariables(generated.body),
  ].filter((x) => !!x);
}

function appendComponentIfExists(
  body: DesignSystemAst[],
  componentName: string,
  componentBody: (AtRuleBodyBuilder | false | undefined | null)[],
) {
  const filtered = componentBody.filter((x): x is AtRuleBodyBuilder => !!x);
  if (filtered.length > 0) {
    body.push(
      dsl.atRule(
        "utility",
        componentName,
        wrapComponentLayer(...filtered),
      ) as AtRuleAst,
    );
  }
}

function applyCurrentPalette(
  palette: Palette,
  body: (StyleListAst_WithMetadata | StyleRuleAst_WithMetadata)[],
) {
  return stylesheetVisitorBuilder()
    .on("color", (ast) => {
      return {
        ...ast,
        palette: ast.palette === "current" ? palette : ast.palette,
      };
    })
    .visit(body);
}

function resolveOptionalVariantReferences(
  curr: ComponentStateRef,
  body: (StyleListAst_WithMetadata | StyleRuleAst_WithMetadata)[],
) {
  if (
    !curr.variants.hasVariants ||
    curr.variants.selection.mode !== "optional"
  ) {
    return body;
  }

  return stylesheetVisitorBuilder()
    .on("style-list", (ast) => {
      const styles = ast.styles.reduce<Array<(typeof ast.styles)[number]>>(
        (acc, style) => {
          if ("$ast" in style) {
            acc.push(style);
            return acc;
          }

          const entries = Object.entries(style).flatMap(([key, value]) => {
            const nextValue = rewriteOptionalVariantValue(curr, value);

            return nextValue === undefined ? [] : [[key, nextValue] as const];
          });

          if (entries.length > 0) {
            acc.push(Object.fromEntries(entries) as typeof style);
          }

          return acc;
        },
        [],
      );

      return {
        ...ast,
        styles,
      };
    })
    .on("style-rule", (ast) => {
      return {
        ...ast,
        body: ast.body.filter((entry) => !isEmptyStyleRuleBody(entry)),
      };
    })
    .visit(body)
    .filter((entry) => !isEmptyStyleNode(entry));
}

function rewriteOptionalVariantValue(
  curr: ComponentStateRef,
  value: StylePropertyValue | StylePropertyValue[] | undefined,
) {
  const rewritten = rewriteOptionalVariantNode(curr, value);

  return rewritten === OPTIONAL_VARIANT_OMIT ? undefined : rewritten;
}

const OPTIONAL_VARIANT_OMIT = Symbol("optional-variant-omit");

function rewriteOptionalVariantNode(
  curr: ComponentStateRef,
  value: unknown,
): unknown | typeof OPTIONAL_VARIANT_OMIT {
  if (value === undefined || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    const rewritten = value.map((entry) =>
      rewriteOptionalVariantNode(curr, entry),
    );

    return rewritten.some((entry) => entry === OPTIONAL_VARIANT_OMIT) ?
        OPTIONAL_VARIANT_OMIT
      : rewritten;
  }

  if (typeof value !== "object") {
    return value;
  }

  if ("$ast" in value) {
    if (value.$ast === "css-var") {
      const cssVar = value as dsl.CssVarAst;
      const variantVar = curr.themeBag.getVariantVar(
        cssVar.name as `--${string}`,
      );

      if (!variantVar) {
        if (cssVar.fallback === undefined) {
          return cssVar;
        }

        const fallback = rewriteOptionalVariantNode(curr, cssVar.fallback);
        return fallback === OPTIONAL_VARIANT_OMIT ?
            OPTIONAL_VARIANT_OMIT
          : { ...cssVar, fallback };
      }

      return variantVar.default ?? OPTIONAL_VARIANT_OMIT;
    }

    if (value.$ast === "match-value") {
      const matchValue = value as MatchValueAst<CssDataType>;
      const variableCandidate = matchValue.candidates.find(
        (candidate) => candidate.$twCandidate === "variable",
      );

      if (!variableCandidate) {
        return matchValue;
      }

      const variantVar = curr.themeBag.getVariantVar(
        variableCandidate.root as `--${string}`,
      );

      return variantVar?.default ?? OPTIONAL_VARIANT_OMIT;
    }
  }

  const rewrittenEntries = Object.entries(value).map(([key, entry]) => {
    const rewrittenEntry = rewriteOptionalVariantNode(curr, entry);

    return [key, rewrittenEntry] as const;
  });

  return rewrittenEntries.some(([, entry]) => entry === OPTIONAL_VARIANT_OMIT) ?
      OPTIONAL_VARIANT_OMIT
    : Object.fromEntries(rewrittenEntries);
}

function isEmptyStyleNode(entry: dsl.StyleListAst | dsl.StyleRuleAst) {
  if (entry.$ast === "style-list") {
    return entry.styles.length === 0;
  }

  return entry.body.length === 0;
}

function isEmptyStyleRuleBody(entry: dsl.StyleRuleBody) {
  if (entry.$ast === "tailwind-class") {
    return false;
  }

  return isEmptyStyleNode(entry);
}

function wrapComponentLayer(
  ...styles: Parameters<typeof dsl.layer.components>
) {
  return dsl.layer.components(...styles);
}

function camelCase(str: string) {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}
