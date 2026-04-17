import { component_deprecated, dsl, utility } from "@nataliebasille/css-engine";

export default [
  component_deprecated("radial-progress", {
    variants: {
      default: {
        "--base": dsl.current(500),
        "--track": dsl.colorMix(
          "srgb",
          {
            color: dsl.cssvar("--tone-500"),
            percentage: dsl.primitive.percentage(20),
          },
          { color: dsl.primitive.color.transparent() },
        ),
      },
    },
    styles: [
      "grid",
      "place-items-center",
      "aspect-square",
      "self-start",
      "text-3xl",
      "rounded-full",
      {
        "--radial-progress-size": "64px",
        "--radial-progress-bar-width": "8px",
        width: dsl.cssvar("--radial-progress-size"),
        background: dsl.cssv`conic-gradient(${dsl.cssvar("--radial-progress-base")} ${dsl.cssvar("--progress")}, ${dsl.cssvar("--radial-progress-track")} 0%)`,
        transition: "--progress 500ms linear",
        "mask-image":
          "radial-gradient(circle at center, transparent calc(var(--radial-progress-size) / 2 - var(--radial-progress-bar-width)), white calc(var(--radial-progress-size) / 2 - var(--radial-progress-bar-width)))",
      },
    ],
  }),

  utility("progress-sm", {
    "--radial-progress-size": "48px",
    "--radial-progress-bar-width": "6px",
  }),

  utility("progress-lg", {
    "--radial-progress-size": "88px",
    "--radial-progress-bar-width": "10px",
  }),
];
