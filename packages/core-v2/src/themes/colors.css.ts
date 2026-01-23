import { css } from "@nataliebasille/natcore-css-engine";
import chroma from "chroma-js";
import * as culori from "culori";

type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
const SHADES: Shade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

type Anchors = { c50: string; c500: string; c950: string };
type RoleInput =
  | { name: string; anchors: Anchors }
  | { name: string; seed: string };

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
    anchors: { c50: "#f5faf9", c500: "#DDFFF7", c950: "#0B1C17" },
  },
];

export default function compile(): css.StylesheetAst {
  const stylesheet = css.atRule(
    "theme",
    null,
    ...roles.flatMap((r) => {
      const ramp = generateRamp(r);
      return roleToCssVars(r.name, ramp);
    }),
  );

  return stylesheet;
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

function roleToCssVars(name: string, ramp: Record<Shade, string>) {
  return SHADES.map((shade) => {
    const bg = ramp[shade];
    const fg = bestContrastText(bg);

    return css.styleList({
      [`--color-${shade}-${name}`]: bg,
      [`--color-text-${shade}-${name}`]: fg,
    });
  });
}
