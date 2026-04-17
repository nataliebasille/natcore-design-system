import {
  type AtRuleAst,
  type AtRuleBodyBuilder,
  type AtRuleContent,
  type DesignSystemAst,
  dsl,
  type Palette,
  PALETTE,
  type StyleListAst_WithMetadata,
  type StylePropertyValue,
  type StyleRuleAst_WithMetadata,
  type StyleRuleBodyBuilder,
  stylesheetVisitorBuilder,
} from "../dsl/public.ts";
import {
  type ComponentBuilder,
  type ComponentState,
  type ControlledVar,
  type VarsProperty,
} from "./component.ts";
import { type ThemeProperties } from "./theme.ts";
import { colorKeyWithoutPalette, renderPalette } from "./palette-utils.ts";

class ThemeBag {
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
    return `--${state.name}-${varName.slice(2)}` as const;
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

class ComponentStateRef {
  #state: ComponentState;
  #themeBag: ThemeBag;

  constructor(state: ComponentState) {
    const effectiveName = resolveComponentName(state);
    const effectiveState =
      effectiveName !== state.name ? { ...state, name: effectiveName } : state;
    this.#state = effectiveState;
    this.#themeBag = new ThemeBag(effectiveState);
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
    return this.#state.name;
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
      const themeable = isComponentThemeable(this.#state);
      this.#themeable =
        themeable ?
          { state: true, default: this.#state.defaultTheme }
        : { state: false };
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
  appendComponentIfExists(
    acc.body,
    curr.name,
    !curr.themeable.state && !curr.variants.state ?
      curr.body
    : [
        !!curr.themeable.default &&
          !!curr.variants.default &&
          `${curr.name}-${curr.variants.default}/${curr.themeable.default}`,

        !curr.themeable.state &&
          !!curr.variants.default &&
          `${curr.name}-${curr.variants.default}`,

        !!curr.themeable.default &&
          !curr.variants.state &&
          `${curr.name}/${curr.themeable.default}`,
      ],
  );

  return acc;
};

const themeableStaticComponentsGenerator: GeneratorReduceFn = (acc, curr) => {
  if (!curr.themeable.state) return acc;

  for (const palette of PALETTE) {
    appendComponentIfExists(
      acc.body,
      `${curr.name}/${palette}`,
      !curr.variants.state ?
        [`palette-${palette}`, ...applyCurrentPalette(palette, curr.body)]
      : [
          !!curr.variants.default &&
            `${curr.name}-${curr.variants.default}/${palette}`,
        ],
    );
  }

  return acc;
};

const dynamicComponentGenerator: GeneratorReduceFn = (acc, curr) => {
  if (curr.variants.state) {
    appendComponentIfExists(acc.body, `${curr.name}-*`, [
      curr.themeable.state &&
        renderPalette((color) =>
          dsl.match.asModifier(
            dsl.match.variable(
              colorKeyWithoutPalette({ ...color, mode: "adaptive" }),
            ),
          ),
        ),
      ...stylesheetVisitorBuilder()
        .on("css-var", (ast) => {
          if (curr.themeBag.isVariantVar(ast.name as `--${string}`)) {
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
    const [tokenCandidates, otherCandidates] = value.candidates.reduce(
      (acc, candidate) => {
        if (candidate.type === "token") {
          acc[0].push(candidate);
        } else {
          acc[1].push(candidate);
        }
        return acc;
      },
      [
        [] as Extract<ControlledVar["candidates"][number], { type: "token" }>[],
        [] as Exclude<ControlledVar["candidates"][number], { type: "token" }>[],
      ],
    );

    if (value.default) {
      acc.themes.default[scopedVarName] = value.default;
    }

    acc.themes.inline = {
      ...acc.themes.inline,
      ...Object.fromEntries(
        tokenCandidates.map(
          (candidate) =>
            [`${scopedVarName}-${candidate.token}`, candidate.value] as const,
        ),
      ),
    };

    const matchers = [
      ...(tokenCandidates.length > 0 ?
        [dsl.match.variable(scopedVarName)]
      : []),

      ...otherCandidates.map((candidate) => {
        if (candidate.type === "arbitrary") {
          return dsl.match.arbitrary[
            camelCase(candidate.dataType) as keyof typeof dsl.match.arbitrary
          ]();
        }

        return dsl.match.bare[
          camelCase(candidate.dataType) as keyof typeof dsl.match.bare
        ]();
      }),
    ];

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
      dsl.atRule("utility", fullUtilityName, ...normalizeStyleBuilders(body)),
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

function appendComponentIfExists(
  body: DesignSystemAst[],
  componentName: string,
  componentBody: (AtRuleBodyBuilder | false)[],
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

function wrapComponentLayer(
  ...styles: Parameters<typeof dsl.layer.components>
) {
  return dsl.layer.components(...styles);
}

function normalizeStyleBuilders(
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

function isControlledVar(
  varOrValue: VarsProperty | StylePropertyValue[],
): varOrValue is ControlledVar {
  return (
    typeof varOrValue === "object" &&
    varOrValue !== null &&
    "default" in varOrValue &&
    "candidates" in varOrValue
  );
}

function camelCase(str: string) {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

function resolveComponentName(state: ComponentState): string {
  if (state.parent) {
    return `${resolveComponentName(state.parent)}-${state.name}`;
  }
  return state.name;
}
