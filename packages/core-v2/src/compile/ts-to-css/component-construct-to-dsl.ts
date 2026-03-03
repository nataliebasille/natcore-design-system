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
import { renderPalette } from "../../shared/colors";

type StylePropertyValue = dsl.StyleProperties[keyof dsl.StyleProperties];

export function componentConstructToDsl(
  componentConstruct: ComponentConstruct,
) {
  const hasVariants = Object.keys(componentConstruct.variants ?? {}).length > 0;
  const paletteSet = getPaletteVarsUsedInComponent(componentConstruct);
  return hasVariants ?
      dynamicComponentConstructToDsl(componentConstruct)
    : staticComponentConstructToDsl(componentConstruct);
}

type PaletteUsage = { shade: Shade; role: "base" | "text" };

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
    dsl.atRule("utility", componentConstruct.name, ...baseStyles),
  ];

  if (!componentConstruct.themeable) {
    return output;
  }

  for (const palette of PALETTE) {
    output.push(
      dsl.atRule(
        "utility",
        `${componentConstruct.name}/${palette}`,
        ...resolveStylesForPalette(componentConstruct.styles, palette),
      ),
    );
  }

  return output;
}

function dynamicComponentConstructToDsl(
  componentConstruct: ComponentConstruct,
  paletteUsages = getPaletteVarsUsedInComponent(componentConstruct),
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
      dsl.layer(
        "component",
        dsl.styleList(renderPalette(paletteUsages, { modifier: true })),
        ...componentConstruct.styles,
      ),
    ),
  ];
}

function getPaletteVarsUsedInComponent(componentConstruct: ComponentConstruct) {
  const palette: Array<{ shade: Shade; role: "base" | "text" }> = [];

  const visitor = stylesheetVisitorBuilder().on("color", (color) => {
    if (color.palette === "current") {
      // Map each (shade, role) pair to a deterministic slot in an interleaved
      // palette array: [50-base, 50-text, 100-base, 100-text, ..., 950-base, 950-text].
      // This keeps deduplication/order stable in linear time over visited colors.
      const index =
        (color.shade === 50 ? 0
        : color.shade === 950 ? 10
        : color.shade / 100) *
          2 +
        (color.role === "text" ? 1 : 0);

      palette[index] = { shade: color.shade, role: color.role };
    }
    return color;
  });

  visitor.visit([
    ...componentConstruct.styles,
    ...Object.values(componentConstruct.variants ?? {}).flatMap(Object.values),
  ]);

  return palette.filter(Boolean) satisfies PaletteUsage[];
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
