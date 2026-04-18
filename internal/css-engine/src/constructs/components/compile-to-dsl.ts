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

function camelCase(str: string) {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}
