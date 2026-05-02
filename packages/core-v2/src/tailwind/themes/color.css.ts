import {
  dsl,
  SHADES,
  theme,
  type Palette,
  type Shade,
  type ThemeProperties,
  colorKey,
  PALETTE,
  colorKeyWithoutPalette,
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
  return [
    // Define --color-* css variables for each palette and shade
    theme(
      "root",
      Object.fromEntries([
        [`--theme-disabled`, disabled.seed],
        ...PALETTE.flatMap((palette) => [
          anchorEntry(
            palette,
            50,
            dsl.lch(dsl.calc`min(l + 40, 98)`, dsl.calc`c * .55`, "h", {
              from: dsl.cssvar(`--theme-${palette}`),
            }),
          ),
          anchorEntry(palette, 500, dsl.cssvar(`--theme-${palette}`)),
          anchorEntry(
            palette,
            950,
            dsl.lch(dsl.calc`max(l - 45, 8)`, dsl.calc`c * .65`, "h", {
              from: dsl.cssvar(`--theme-${palette}`),
            }),
          ),

          ...SHADES.flatMap((shade, index) => [
            [
              `--color-light-${palette}-${shade}`,
              index % 5 === 0 ?
                dsl.cssvar(`--${palette}-anchor-${shade}`)
              : dsl.colorMix(
                  "oklch",
                  {
                    color: dsl.cssvar(
                      `--${palette}-anchor-${SHADES[5 * Math.floor(index / 5)]}`,
                    ),
                    percentage: dsl.primitive.percentage(
                      100 - (index % 5) * 20,
                    ),
                  },
                  {
                    color: dsl.cssvar(
                      `--${palette}-anchor-${SHADES[5 * Math.ceil(index / 5)]}`,
                    ),
                  },
                ),
            ],
            [
              `--color-on-light-${palette}-${shade}`,
              dsl.cssColor(
                "xyz",
                [CONTRAST_CHANNEL, CONTRAST_CHANNEL, CONTRAST_CHANNEL],
                palette === "disabled" ? disabled.fgOpacity : 1,
                {
                  from: dsl.cssvar(`--color-light-${palette}-${shade}`),
                },
              ),
            ],
          ]),

          ...SHADES.flatMap((shade, index) => [
            [
              `--color-dark-${palette}-${shade}`,
              dsl.cssvar(
                `--color-light-${palette}-${SHADES[SHADES.length - 1 - index]}`,
              ),
            ],
            [
              `--color-on-dark-${palette}-${shade}`,
              dsl.cssvar(
                `--color-on-light-${palette}-${SHADES[SHADES.length - 1 - index]}`,
              ),
            ],
          ]),

          ...SHADES.flatMap((shade) => [
            [
              `--color-${palette}-${shade}`,
              dsl.lightDark(
                dsl.cssvar(`--color-light-${palette}-${shade}`),
                dsl.cssvar(`--color-dark-${palette}-${shade}`),
              ),
            ],

            [
              `--color-on-${palette}-${shade}`,
              dsl.lightDark(
                dsl.cssvar(`--color-on-light-${palette}-${shade}`),
                dsl.cssvar(`--color-on-dark-${palette}-${shade}`),
              ),
            ],
          ]),

          // [
          //   `--select-chevron-${palette}`,

          //   `light-dark(${chevronUrl(contrastColor(palette, 50))}, ${chevronUrl(contrastColor(palette, 950))})`,
          // ],
        ]),
      ]),
    ),

    // These are used by the design system to match palette modifiers against palette color
    // Inline is used so that these variables are replaced with the actual color value
    theme(
      "inline",
      Object.fromEntries([
        ...PALETTE.flatMap((palette) =>
          SHADES.flatMap((shade) => [
            [
              `--bg-light-${shade}-${palette}`,
              dsl.cssvar(`--color-light-${palette}-${shade}`),
            ],
            [
              `--fg-light-${shade}-${palette}`,
              dsl.cssvar(`--color-on-light-${palette}-${shade}`),
            ],
            [
              `--bg-dark-${shade}-${palette}`,
              dsl.cssvar(`--color-dark-${palette}-${shade}`),
            ],
            [
              `--fg-dark-${shade}-${palette}`,
              dsl.cssvar(`--color-on-dark-${palette}-${shade}`),
            ],
            [
              `--bg-tone-${shade}-${palette}`,
              dsl.cssvar(`--color-${palette}-${shade}`),
            ],
            [
              `--fg-tone-${shade}-${palette}`,
              dsl.cssvar(`--color-on-${palette}-${shade}`),
            ],
          ]),
        ),

        ...SHADES.flatMap((shade) => [
          [
            `--color-${shade}`,
            dsl.cssvar(
              colorKeyWithoutPalette({
                role: "base",
                mode: "adaptive",
                shade,
              }),
            ),
          ],
          [
            `--color-on-${shade}`,
            dsl.cssvar(
              colorKeyWithoutPalette({
                role: "text",
                mode: "adaptive",
                shade,
              }),
            ),
          ],
        ]),
      ]),
    ),
  ];
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
