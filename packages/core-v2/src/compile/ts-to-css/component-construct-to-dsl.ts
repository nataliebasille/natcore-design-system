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
import { renderPaletteMatcher } from "../../shared/colors.ts";

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
  const defaultPalette =
    typeof componentConstruct.themeable === "string" ?
      componentConstruct.themeable
    : null;

  const baseStyles =
    defaultPalette ?
      resolveStylesForPalette(componentConstruct.styles, defaultPalette)
    : componentConstruct.styles;

  const output: dsl.AtRuleAst[] = [
    dsl.atRule(
      "utility",
      componentConstruct.name,
      wrapComponentLayer(...baseStyles),
    ),
  ];

  if (!componentConstruct.themeable) {
    return output;
  }

  for (const palette of PALETTE) {
    output.push(
      dsl.atRule(
        "utility",
        `${componentConstruct.name}/${palette}`,
        wrapComponentLayer(
          ...resolveStylesForPalette(componentConstruct.styles, palette),
        ),
      ),
    );
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
      dsl.styleList(renderPaletteMatcher({ modifier: true })),
      wrapComponentLayer(...componentConstruct.styles),
    ),
  ];
}

function wrapComponentLayer(...styles: Parameters<typeof dsl.layer>[2][]) {
  return dsl.layer("components", ...styles);
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

function buildThemeModifierBindings(
  themeable: ComponentConstruct["themeable"],
): Record<`--${string}`, StylePropertyValue> {
  if (!themeable) {
    return {};
  }

  const defaultPalette = typeof themeable === "string" ? themeable : null;

  return Object.fromEntries(
    SHADES.flatMap((shade) => {
      const toneVar = `--tone-${shade}` as const;
      const toneTextVar = `--tone-on-${shade}` as const;

      return [
        [toneVar, buildModifierValue(toneVar, defaultPalette)],
        [toneTextVar, buildModifierValue(toneTextVar, defaultPalette)],
      ];
    }),
  ) as Record<`--${string}`, StylePropertyValue>;
}

function buildModifierValue(
  rootVar: `--${string}`,
  defaultPalette: Palette | null,
): StylePropertyValue {
  const modifierValue = dsl.match.asModifier(dsl.match.variable(`${rootVar}-`));

  if (!defaultPalette) {
    return modifierValue;
  }

  return [dsl.cssvar(`${rootVar}-${defaultPalette}`), modifierValue];
}

function resolveStylesForPalette(
  styles: ComponentConstruct["styles"],
  palette: Palette,
) {
  return styles.map((style) =>
    stylesheetVisitorBuilder()
      .on("color", (color) => {
        if (color.palette !== "current") {
          return color;
        }

        return {
          ...color,
          palette,
        };
      })
      .visit(style),
  ) as ComponentConstruct["styles"];
}
