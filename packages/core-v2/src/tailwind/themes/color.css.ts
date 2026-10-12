import {
  theme,
  type Palette,
  PALETTE,
} from "@nataliebasille/css-engine";
import {
  paletteRootEntries,
  paletteInlineEntries,
  currentToneEntries,
} from "../../shared/palette-theme.ts";

const disabled = {
  name: "disabled" as Palette,
  seed: "#8A8F98",
  fgOpacity: 0.5,
};

export default function compile() {
  return [
    // Define --color-* css variables for each palette and shade
    theme(
      "root",
      Object.fromEntries([
        [`--theme-disabled`, disabled.seed],
        ...PALETTE.flatMap((palette) =>
          paletteRootEntries(palette, {
            fgOpacity: palette === disabled.name ? disabled.fgOpacity : 1,
          }),
        ),
      ]),
    ),

    // These are used by the design system to match palette modifiers against palette color
    // Inline is used so that these variables are replaced with the actual color value
    theme(
      "inline",
      Object.fromEntries([
        ...PALETTE.flatMap((palette) => paletteInlineEntries(palette)),
        ...currentToneEntries(),
      ]),
    ),
  ];
}
