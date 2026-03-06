import {
  dsl,
  SHADES,
  theme,
  type Palette,
  type Shade,
  type ThemeProperties,
} from "@nataliebasille/natcore-css-engine";
import chroma from "chroma-js";
import * as culori from "culori";
import { colorKey } from "../../shared/colors.ts";

type Anchors = { c50: string; c500: string; c950: string };
type RoleInput =
  | { name: Palette; anchors: Anchors }
  | { name: Palette; seed: string };

const NEAR_BLACK = "#121212";
const NEAR_WHITE = "#FAFAFA";

// ---- CONFIG ----
// Example: your primary + your surface as anchors (recommended for surfaces!)
const roles: RoleInput[] = [
  { name: "primary", seed: "#462255" },
  { name: "secondary", seed: "#046E8F" },
  { name: "accent", seed: "#B36A5E" },
  // For a surface family, I strongly recommend anchors instead of “seed at 200”
  // so you control how close to white the light end is.
  {
    name: "surface",
    anchors: { c50: "#DBFBF2", c500: "#35E9B6", c950: "#02120E" },
  },
];

export default function compile() {
  return theme(
    ...roles.flatMap((r) => {
      const ramp = generateRamp(r);
      return roleToCssVars(r.name, ramp);
    }),
  );
}

function generateRamp(input: RoleInput): Record<Shade, string> {
  const { c50, c500, c950 } =
    "anchors" in input ? input.anchors : deriveAnchorsFromSeed(input.seed);

  // Use culori's OKLCH interpolation for perceptually uniform colors
  const interpolator = culori.interpolate([c50, c500, c950], "oklch");

  const colors = SHADES.map((_, i) => {
    const t = i / (SHADES.length - 1);
    const color = interpolator(t);
    // Format as OKLCH string for CSS
    return culori.formatCss(color);
  });

  const ramp: Record<Shade, string> = {} as any;
  for (let i = 0; i < SHADES.length; i++) ramp[SHADES[i]!] = colors[i]!;
  return ramp;
}

function deriveAnchorsFromSeed(seed: string): Anchors {
  const base = chroma(seed);

  // These are “nice defaults” -- you can tune per your taste:
  // - make the light end brighter + a bit less saturated
  // - make the dark end darker + a bit less saturated (helps avoid “crushed black”)
  const c500 = base.hex();
  const c50 = base.brighten(2.2).desaturate(0.6).hex();
  const c950 = base.darken(2.6).desaturate(0.4).hex();

  return { c50, c500, c950 };
}

/**
 * Pick the better of near-black/near-white based on WCAG contrast ratio.
 * Skeleton’s generator talks about auto-calculating contrast ratios. :contentReference[oaicite:3]{index=3}
 */
function bestContrastText(bg: string): string {
  const blackRatio = chroma.contrast(bg, NEAR_BLACK);
  const whiteRatio = chroma.contrast(bg, NEAR_WHITE);
  return whiteRatio >= blackRatio ? NEAR_WHITE : NEAR_BLACK;
}

const CHEVRON_SVG_TEMPLATE =
  "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke-width=%221.5%22 stroke=%22COLOR%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19.5 8.25l-7.5 7.5-7.5-7.5%22 /%3E%3C/svg%3E')";

function chevronUrl(color: string): string {
  // Encode the hex color (# → %23) for use inside a data URI attribute value
  const encoded = color.replace(/^#/, "%23");
  return CHEVRON_SVG_TEMPLATE.replace("COLOR", encoded);
}

function roleToCssVars(palette: Palette, ramp: Record<Shade, string>) {
  const colors: ThemeProperties = {};

  // Collect all color entries in a single loop for efficiency
  const lightEntries: Array<[`--${string}`, string]> = [];
  const darkEntries: Array<[`--${string}`, string]> = [];
  const scaleEntries: Array<[`--${string}`, any]> = [];

  for (const shade of SHADES) {
    const bg = ramp[shade];
    const fg = bestContrastText(bg);
    const darkShade = (1000 - shade) as Shade;

    // Light mode entries
    lightEntries.push(
      [colorKey({ role: "base", palette, mode: "light", shade }), bg],
      [colorKey({ role: "text", palette, mode: "light", shade }), fg],
    );

    // Dark mode entries
    darkEntries.push(
      [colorKey({ role: "base", palette, mode: "dark", shade }), bg],
      [colorKey({ role: "text", palette, mode: "dark", shade }), fg],
    );

    // Scale entries
    scaleEntries.push(
      [
        colorKey({
          role: "base",
          palette,
          mode: "adaptive",
          shade,
        }),
        dsl.lightDark(dsl.light(palette, shade), dsl.dark(palette, darkShade)),
      ],
      [
        colorKey({
          role: "text",
          palette,
          mode: "adaptive",
          shade,
        }),
        dsl.lightDark(
          dsl.lightText(palette, shade),
          dsl.darkText(palette, darkShade),
        ),
      ],
    );
  }

  // Chevron variable: light-dark(url with on-light-50 color, url with on-dark-950 color)
  const lightChevronColor = bestContrastText(ramp[50]);
  const darkChevronColor = bestContrastText(ramp[950]);
  const chevronKey = `--select-chevron-${palette}` as const;
  scaleEntries.push([
    chevronKey,
    `light-dark(${chevronUrl(lightChevronColor)}, ${chevronUrl(darkChevronColor)})`,
  ]);

  // Assign all entries in sorted order: light, then dark, then scale
  for (const [key, value] of [
    ...lightEntries,
    ...darkEntries,
    ...scaleEntries,
  ]) {
    colors[key] = value;
  }

  return colors;
}
