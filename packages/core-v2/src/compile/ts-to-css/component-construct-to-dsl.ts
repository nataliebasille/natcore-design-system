import {
  dsl,
  PALETTE,
  stylesheetVisitorBuilder,
  type ComponentConstruct,
  type CssDataType,
} from "@nataliebasille/natcore-css-engine";
import { colorKeyWithoutPalette, renderPalette } from "../../shared/colors.ts";

type StylePropertyValue = dsl.StyleProperties[keyof dsl.StyleProperties];

export function componentConstructToDsl(
  componentConstruct: ComponentConstruct,
) {
  const hasVariants = Object.keys(componentConstruct.variants ?? {}).length > 0;
  return hasVariants ?
      dynamicComponentConstructToDsl(componentConstruct)
    : staticComponentConstructToDsl(componentConstruct);
}

function staticComponentConstructToDsl(componentConstruct: ComponentConstruct) {
  const themeable = isThemeable(componentConstruct);

  const output: dsl.AtRuleAst[] = [
    dsl.atRule(
      "utility",
      componentConstruct.name,
      wrapComponentLayer(...componentConstruct.styles),
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
          wrapComponentLayer(...componentConstruct.styles),
        ),
      );
    }
  }

  return output;
}

function dynamicComponentConstructToDsl(
  componentConstruct: ComponentConstruct,
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
      dsl.styleList(
        renderPalette((color) =>
          dsl.match.asModifier(
            dsl.match.variable(
              colorKeyWithoutPalette({ ...color, mode: "adaptive" }),
            ),
          ),
        ),
      ),
      wrapComponentLayer(...normalizedStyles),
    ),
  ];
}

function wrapComponentLayer(
  ...styles: Parameters<typeof dsl.layer.components>
) {
  return dsl.layer.components(...styles);
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
