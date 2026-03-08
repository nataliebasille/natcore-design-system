import {
  dsl,
  PALETTE,
  stylesheetVisitorBuilder,
  type ComponentConstruct,
} from "@nataliebasille/natcore-css-engine";
import { colorKeyWithoutPalette, renderPalette } from "../../shared/colors.ts";

type StylePropertyValue = dsl.StyleProperties[keyof dsl.StyleProperties];

export function componentConstructToDsl(
  componentConstruct: ComponentConstruct,
) {
  const themeable = isThemeable(componentConstruct);
  const {
    default: defaultVariant = (componentConstruct.defaultVariant &&
      componentConstruct.variants?.[componentConstruct.defaultVariant]) ||
      undefined,
    ...dynamicVariants
  } = componentConstruct.variants;
  const hasVariants = Object.keys(dynamicVariants).length > 0;
  // If there are no variant then default to static generation.
  // If there is a default variant, we can generate a static version of the component for it.
  const shouldGenerateStatic = !hasVariants || !!defaultVariant;
  return [
    ...(shouldGenerateStatic ?
      staticComponentConstructToDsl(componentConstruct, {
        themeable,
        defaultVariant,
      })
    : []),
    ...(hasVariants ?
      dynamicComponentConstructToDsl(componentConstruct, { themeable })
    : []),
  ];
}

function staticComponentConstructToDsl(
  componentConstruct: ComponentConstruct,
  {
    themeable,
    defaultVariant,
  }: {
    themeable: boolean;
    defaultVariant:
      | {
          [K: `--${string}`]: StylePropertyValue;
        }
      | undefined;
  },
) {
  const styles = applyVariantStyles(componentConstruct.styles, defaultVariant);
  const output: dsl.AtRuleAst[] = [
    dsl.atRule(
      "utility",
      componentConstruct.name,
      wrapComponentLayer(...styles),
    ),
  ];

  if (themeable) {
    for (const palette of PALETTE) {
      output.push(
        dsl.atRule(
          "utility",
          `${componentConstruct.name}/${palette}`,
          dsl.styleList(
            renderPalette((color) =>
              color.role === "base" ?
                dsl.adaptive(palette, color.shade)
              : dsl.adaptiveText(palette, color.shade),
            ),
          ),
          wrapComponentLayer(...styles),
        ),
      );
    }
  }

  return output;
}

function dynamicComponentConstructToDsl(
  componentConstruct: ComponentConstruct,
  { themeable }: { themeable: boolean },
) {
  const { variants, rootsMap } = buildScopedVariantVars(
    componentConstruct.name,
    componentConstruct.variants,
  );

  const normalizedStyles = normalizeVariantVariableReferences(
    componentConstruct,
    rootsMap,
  );

  return [
    dsl.atRule("theme", "inline", dsl.styleList(variants)),
    dsl.atRule(
      "utility",
      `${componentConstruct.name}-*`,
      ...(themeable ?
        [
          dsl.styleList(
            renderPalette((color) =>
              dsl.match.asModifier(
                dsl.match.variable(
                  colorKeyWithoutPalette({ ...color, mode: "adaptive" }),
                ),
              ),
            ),
          ),
        ]
      : []),
      wrapComponentLayer(...normalizedStyles),
    ),
  ];
}

function wrapComponentLayer(
  ...styles: Parameters<typeof dsl.layer.components>
) {
  return dsl.layer.components(...styles);
}

function applyVariantStyles(
  styles: ComponentConstruct["styles"],
  variant:
    | {
        [K: `--${string}`]: StylePropertyValue;
      }
    | undefined,
) {
  if (!variant) {
    return styles;
  }

  return stylesheetVisitorBuilder()
    .on("match-value", (ast) => {
      const candidateToTransform = ast.candidates.filter(
        (candidate): candidate is dsl.TwVariableCandidate => {
          return (
            candidate.$twCandidate === "variable" && candidate.root in variant
          );
        },
      )[0];

      return (
        !candidateToTransform ? ast : (
          variant[candidateToTransform.root]!
        )) as dsl.StylePropertyValue;
    })
    .visit(styles);
}
function buildScopedVariantVars(
  componentName: string,
  variants: ComponentConstruct["variants"],
): {
  variants: Record<`--${string}`, StylePropertyValue>;
  // Mapping of original variant variable names to their scoped counterparts for reference replacement
  rootsMap: Record<`--${string}`, `--${string}`>;
} {
  const rootsMap: Record<`--${string}`, `--${string}`> = {};
  return {
    variants: Object.fromEntries(
      Object.entries(variants).flatMap(([variantName, variantVars]) =>
        Object.entries(variantVars).map(([varName, value]) => {
          const root =
            `--${componentScopedVarName(componentName, varName)}` as const;
          rootsMap[varName as `--${string}`] =
            rootsMap?.[varName as `--${string}`] ?? root;
          const scopedVarName = `--${componentScopedVarName(componentName, varName)}-${variantName}`;
          return [scopedVarName, value];
        }),
      ),
    ) as Record<`--${string}`, StylePropertyValue>,
    rootsMap,
  };
}

function componentScopedVarName(componentName: string, varName: string) {
  return `${componentName}-${varName.replace(/^--/, "")}`;
}

function isThemeable(componentConstruct: ComponentConstruct) {
  let themeable = false;
  stylesheetVisitorBuilder()
    .on("color", (ast) => {
      themeable ||= ast.palette === "current";
      return ast;
    })
    .visit([componentConstruct.styles, componentConstruct.variants]);

  return themeable;
}

function normalizeVariantVariableReferences(
  componentConstruct: ComponentConstruct,
  rootsMap: Record<`--${string}`, `--${string}`>,
) {
  const { name, styles } = componentConstruct;
  return stylesheetVisitorBuilder()
    .on("css-var", (ast) => {
      if (rootsMap[ast.name]) {
        return { ...ast, name: rootsMap[ast.name] };
      }

      return ast;
    })
    .on("match-value", (ast) => ({
      ...ast,
      candidates: ast.candidates.map((candidate) => {
        if (candidate.$twCandidate !== "variable") {
          return candidate;
        }

        if (rootsMap[candidate.root]) {
          return { ...candidate, root: rootsMap[candidate.root]! };
        }

        return candidate;
      }),
    }))
    .visit(styles) as ComponentConstruct["styles"];
}
