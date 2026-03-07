import {
  dsl,
  PALETTE,
  SHADES,
  stylesheetVisitorBuilder,
  type ColorAst,
  type ComponentConstruct,
  type Palette,
  type Shade,
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
  return [
    dsl.atRule(
      "theme",
      "inline",
      dsl.styleList(buildVariantThemeVars(componentConstruct.variants)),
    ),
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
      wrapComponentLayer(...componentConstruct.styles),
    ),
  ];
}

function wrapComponentLayer(
  ...styles: Parameters<typeof dsl.layer.components>
) {
  return dsl.layer.components(...styles);
}

function buildVariantThemeVars(
  variants: ComponentConstruct["variants"],
): Record<`--${string}`, StylePropertyValue> {
  return Object.fromEntries(
    Object.entries(variants).flatMap(([variantName, variantVars]) =>
      Object.entries(variantVars).map(([varName, value]) => [
        `${varName}-${variantName}`,
        value,
      ]),
    ),
  ) as Record<`--${string}`, StylePropertyValue>;
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
