import {
  dsl,
  SHADES,
  colorKeyWithoutPalette,
} from "@nataliebasille/css-engine";
import { CONTRAST_CHANNEL } from "./palette-formula.ts";

type Entry = [string, dsl.StylePropertyValue];

/**
 * CSS-variable anchor for a single shade:
 * `--{palette}-anchor-{shade}: var(--theme-{palette}-{shade}, <computed-fallback>)`.
 * The consumer can override any shade via `--theme-{palette}-{shade}`.
 */
export function anchorEntry(
  palette: string,
  shade: number,
  value: Parameters<typeof dsl.cssvar>[1],
): Entry {
  return [
    `--${palette}-anchor-${shade}`,
    dsl.cssvar(`--theme-${palette}-${shade}`, value),
  ];
}

/**
 * Computed fallback for an anchor when no `--theme-{palette}-{shade}` seed is
 * provided. 50/500/950 derive from the palette base `--theme-{palette}`;
 * intermediate shades interpolate between the two bracketing 50/500/950 anchors
 * (independent pin semantics: pinning an intermediate shade does not re-bracket
 * its neighbors).
 */
export function anchorFallback(
  palette: string,
  shade: number,
  index: number,
): Parameters<typeof dsl.cssvar>[1] {
  if (shade === 50) {
    return dsl.lch(dsl.calc`min(l + 40, 98)`, dsl.calc`c * .55`, "h", {
      from: dsl.cssvar(`--theme-${palette}`),
    });
  }

  if (shade === 500) {
    return dsl.cssvar(`--theme-${palette}`);
  }

  if (shade === 950) {
    return dsl.lch(dsl.calc`max(l - 45, 8)`, dsl.calc`c * .65`, "h", {
      from: dsl.cssvar(`--theme-${palette}`),
    });
  }

  return dsl.colorMix(
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
  );
}

/**
 * Full `@theme` (root) derivation chain for one palette: anchors, light/dark
 * base colors, contrast foregrounds, and the adaptive `light-dark()` pair for
 * both base and foreground across every shade.
 */
export function paletteRootEntries(
  palette: string,
  { fgOpacity = 1 }: { fgOpacity?: number } = {},
): Entry[] {
  return [
    ...SHADES.map((shade, index) =>
      anchorEntry(palette, shade, anchorFallback(palette, shade, index)),
    ),

    ...SHADES.flatMap((shade): Entry[] => [
      [
        `--color-light-${palette}-${shade}`,
        dsl.cssvar(`--${palette}-anchor-${shade}`),
      ],
      [
        `--color-on-light-${palette}-${shade}`,
        dsl.cssColor(
          "xyz",
          [CONTRAST_CHANNEL, CONTRAST_CHANNEL, CONTRAST_CHANNEL],
          fgOpacity,
          {
            from: dsl.cssvar(`--color-light-${palette}-${shade}`),
          },
        ),
      ],
    ]),

    ...SHADES.flatMap((shade, index): Entry[] => [
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

    ...SHADES.flatMap((shade): Entry[] => [
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
  ];
}

/**
 * `@theme inline` tone keys for one palette. These are what the `palette-*`
 * utility matches via `--value(--bg-tone-{shade}-*)`, so a custom palette's
 * tones resolve exactly like a built-in's.
 */
export function paletteInlineEntries(palette: string): Entry[] {
  return SHADES.flatMap((shade): Entry[] => [
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
  ]);
}

/**
 * Palette-independent "current tone" aliases (`--color-{shade}` /
 * `--color-on-{shade}`) that resolve to whatever palette is active via
 * `palette-*`. These are emitted once, not per palette.
 */
export function currentToneEntries(): Entry[] {
  return SHADES.flatMap((shade): Entry[] => [
    [
      `--color-${shade}`,
      dsl.cssvar(
        colorKeyWithoutPalette({ role: "base", mode: "adaptive", shade }),
      ),
    ],
    [
      `--color-on-${shade}`,
      dsl.cssvar(
        colorKeyWithoutPalette({ role: "text", mode: "adaptive", shade }),
      ),
    ],
  ]);
}
