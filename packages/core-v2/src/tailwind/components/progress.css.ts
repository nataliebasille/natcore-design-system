import { component, dsl, utility } from "@nataliebasille/natcore-css-engine";

export default [
  component("radial-progress", {
    variants: {
      default: {
        "--progress-base": dsl.current(500),
        "--progress-track": dsl.colorMix(
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
        "--size": "64px",
        "--bar-width": "8px",
        width: dsl.cssvar("--size"),
        background: dsl.cssv`conic-gradient(${dsl.cssvar("--progress-base")} ${dsl.cssvar("--progress")}, ${dsl.cssvar("--progress-track")} 0%)`,
        transition: "--progress 500ms linear",
        "mask-image":
          "radial-gradient(circle at center, transparent calc(var(--size) / 2 - var(--bar-width)), white calc(var(--size) / 2 - var(--bar-width)))",
      },
    ],
  }),

  utility("progress-sm", {
    "--size": "48px",
    "--bar-width": "6px",
  }),

  utility("progress-lg", {
    "--size": "88px",
    "--bar-width": "10px",
  }),
];
