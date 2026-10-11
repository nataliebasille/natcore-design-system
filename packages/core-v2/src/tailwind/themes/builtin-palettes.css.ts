import { theme } from "@nataliebasille/css-engine";
import colors from "tailwindcss/colors";
import { paletteToneValues } from "../../shared/palette-formula.ts";

// Build-time generation of `palette-{name}` support for Tailwind's built-in
// colors. For every built-in scale color we emit the inline tone theme keys that
// the existing `palette-*` wildcard utility resolves, so `palette-red` (etc.)
// just works. Colors are referenced by `--color-{name}-{shade}` and overridable
// per shade via `--theme-{name}-{shade}` (see paletteToneValues).
//
// The color list comes from Tailwind's official `tailwindcss/colors` export at
// THIS package's build, so it covers the built-in colors shipped with that
// Tailwind version.
export default function compile() {
  const entries: Array<[string, string]> = [];

  for (const [name, scale] of Object.entries(colors)) {
    // Skip non-scale keywords (inherit/current/transparent/black/white).
    if (!scale || typeof scale !== "object") {
      continue;
    }

    const shades = Object.keys(scale);

    for (const { shade, bg, fg } of paletteToneValues(name, shades)) {
      entries.push([`--bg-tone-${shade}-${name}`, bg]);
      entries.push([`--fg-tone-${shade}-${name}`, fg]);
    }
  }

  return [theme("inline", Object.fromEntries(entries))];
}
