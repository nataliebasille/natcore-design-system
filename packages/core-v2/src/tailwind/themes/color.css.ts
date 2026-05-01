import {
  dsl,
  SHADES,
  theme,
  type Palette,
  type Shade,
  type ThemeProperties,
  colorKey,
  PALETTE,
} from "@nataliebasille/css-engine";
import chroma from "chroma-js";
import * as culori from "culori";
import dedent from "dedent";

type Anchors = { c50: string; c500: string; c950: string };
type RoleBase = { name: Palette; fgOpacity?: number };
type RoleInput =
  | (RoleBase & { anchors: Anchors })
  | (RoleBase & { seed: string });

const NEAR_BLACK = "#121212";
const NEAR_WHITE = "#FAFAFA";

const disabled = {
  name: "disabled",
  seed: "#8A8F98",
  fgOpacity: 0.5,
};

const CONTRAST_CHANNEL = "clamp(0, (.36 / y - 1) * 100, 1)";

export default function compile() {
  return theme(
    "root",
    Object.fromEntries([
      [`--theme-disabled`, disabled.seed],
      ...PALETTE.flatMap((palette) => [
        anchorEntry(palette, 50, mixWithBase(palette, "white", 82)),
        anchorEntry(palette, 500, dsl.cssvar(`--theme-${palette}`)),
        anchorEntry(palette, 950, mixWithBase(palette, "black", 70)),

        ...SHADES.flatMap((shade, index) => [
          [
            `--color-light-${shade}-${palette}`,
            index % 5 === 0 ?
              dsl.cssvar(`--${palette}-anchor-${shade}`)
            : dsl.colorMix(
                "oklch",
                {
                  color: dsl.cssvar(
                    `--${palette}-anchor-${SHADES[5 * Math.floor(index / 5)]}`,
                  ),
                  percentage: dsl.primitive.percentage(100 - (index % 5) * 20),
                },
                {
                  color: dsl.cssvar(
                    `--${palette}-anchor-${SHADES[5 * Math.ceil(index / 5)]}`,
                  ),
                },
              ),
          ],
          [
            `--color-on-light-${shade}-${palette}`,
            dsl.cssColor(
              "xyz",
              [CONTRAST_CHANNEL, CONTRAST_CHANNEL, CONTRAST_CHANNEL],
              palette === "disabled" ? disabled.fgOpacity : 1,
              {
                from: dsl.cssvar(`--color-light-${shade}-${palette}`),
              },
            ),
          ],
        ]),

        ...SHADES.flatMap((shade, index) => [
          [
            `--color-dark-${shade}-${palette}`,
            dsl.cssvar(
              `--color-light-${SHADES[SHADES.length - 1 - index]}-${palette}`,
            ),
          ],
          [
            `--color-on-dark-${shade}-${palette}`,
            dsl.cssvar(
              `--color-on-light-${SHADES[SHADES.length - 1 - index]}-${palette}`,
            ),
          ],
        ]),

        ...SHADES.flatMap((shade) => [
          [
            `--color-tone-${shade}-${palette}`,
            dsl.lightDark(
              dsl.cssvar(`--color-light-${shade}-${palette}`),
              dsl.cssvar(`--color-dark-${shade}-${palette}`),
            ),
          ],

          [
            `--color-on-tone-${shade}-${palette}`,
            dsl.lightDark(
              dsl.cssvar(`--color-on-light-${shade}-${palette}`),
              dsl.cssvar(`--color-on-dark-${shade}-${palette}`),
            ),
          ],
        ]),

        // [
        //   `--select-chevron-${palette}`,

        //   `light-dark(${chevronUrl(contrastColor(palette, 50))}, ${chevronUrl(contrastColor(palette, 950))})`,
        // ],
      ]),
    ]),
  );
}

function anchorEntry(
  palette: string,
  shade: number,
  value: Parameters<typeof dsl.cssvar>[1],
): [string, unknown] {
  return [
    `--${palette}-anchor-${shade}`,
    dsl.cssvar(`--theme-${palette}-${shade}`, value),
  ];
}

function mixWithBase(
  palette: string,
  mixColor: "white" | "black",
  percentage: number,
) {
  return dsl.colorMix(
    "oklch",
    {
      color: dsl.primitive.color.custom(mixColor),
      percentage: dsl.primitive.percentage(percentage),
    },
    { color: dsl.cssvar(`--theme-${palette}`) },
  );
}

const CHEVRON_SVG_TEMPLATE =
  "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke-width=%221.5%22 stroke=%22COLOR%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22 /%3E%3C/svg%3E')";

function chevronUrl(color: string): string {
  // Encode the hex color (# -> %23) for use inside a data URI attribute value
  const encoded = color.replace(/^#/, "%23");
  return CHEVRON_SVG_TEMPLATE.replace("COLOR", encoded);
}
