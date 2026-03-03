import { dsl, SHADES, utility } from "@nataliebasille/natcore-css-engine";
import {
  matchColor,
  matchTextColor,
  renderPalette,
  toneKey,
} from "../../shared/colors";

export default () => [
  utility(
    "palette",
    renderPalette(
      SHADES.flatMap((shade) => [
        { shade, role: "base" },
        { shade, role: "text" },
      ]),
    ),
  ),

  utility("bg", {
    "--tone-current-bg-raw": dsl.match.oneOf(
      matchColor(),
      dsl.match.arbitraryColor(),
      dsl.match.arbitraryAny(),
    ),
    "--_tone-bg-alpha": [
      dsl.match.asModifier(
        dsl.match.oneOf(
          dsl.match.arbitraryPercentage(),
          dsl.match.arbitraryNumber(),
        ),
      ),
      dsl.calc`${dsl.match.asModifier(dsl.match.bare.integer())} * ${dsl.primitive.percentage(1)}`,
      dsl.calc`${dsl.match.asModifier(dsl.match.bare.number())} * ${dsl.primitive.percentage(100)}`,
    ],

    "--tone-current-bg": dsl.colorMix(
      "oklab",
      {
        color: dsl.cssvar("--tone-current-bg-raw"),
        percentage: dsl.cssvar("--_tone-bg-alpha", "100%"),
      },
      {
        color: dsl.primitive.color.transparent(),
      },
    ),

    "--tone-current-fg": dsl.match.oneOf(
      matchTextColor(),
      dsl.match.arbitraryColor(),
    ),

    "background-color": dsl.colorMix(
      "oklab",
      {
        color: dsl.cssvar("--tone-current-bg-raw"),
        percentage: dsl.cssvar("--_tone-bg-alpha", "100%"),
      },
      {
        color: dsl.primitive.color.transparent(),
      },
    ),
  }),
];
