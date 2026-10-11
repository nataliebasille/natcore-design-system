// Shared palette formula used by BOTH the build-time built-in palette CSS
// (themes/builtin-palettes.css.ts) and the opt-in JS plugin
// (tailwind/plugins/builtin-palettes.ts) so their output is identical.
//
// Kept dependency-free (plain strings) so the plugin bundle does not pull in the
// css-engine.

// Per-channel contrast expression (matches color.css.ts). Derives a readable
// foreground from a background color via its XYZ luminance `y`.
export const CONTRAST_CHANNEL = "clamp(0, (.36 / y - 1) * 100, 1)";

export type ToneValue = {
  shade: string | number;
  bg: string;
  fg: string;
};

/**
 * Builds the adaptive `--bg-tone` / `--fg-tone` value expressions for one
 * palette color. Dark mode flips to the mirrored shade (50<->950) and the
 * foreground contrast follows the active side.
 *
 * @param name   color name (e.g. "red")
 * @param shades the color's shade keys in ascending order (e.g. 50..950)
 */
export function paletteToneValues(
  name: string,
  shades: ReadonlyArray<string | number>,
): ToneValue[] {
  const count = shades.length;

  return shades.map((shade, index) => {
    const flipped = shades[count - 1 - index]!;
    const light = toneOperand(name, shade);
    const dark = toneOperand(name, flipped);

    return {
      shade,
      bg: `light-dark(${light}, ${dark})`,
      fg: `light-dark(${contrast(light)}, ${contrast(dark)})`,
    };
  });
}

// A shade's resolved color: a per-shade `--theme-{name}-{shade}` override slot
// (never defined by us) falling back to Tailwind's `--color-{name}-{shade}`.
function toneOperand(name: string, shade: string | number): string {
  return `var(--theme-${name}-${shade}, var(--color-${name}-${shade}))`;
}

function contrast(operand: string): string {
  return `color(from ${operand} xyz ${CONTRAST_CHANNEL} ${CONTRAST_CHANNEL} ${CONTRAST_CHANNEL})`;
}
