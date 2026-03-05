import { component, dsl, utility } from "@nataliebasille/natcore-css-engine";

const cardSections = dsl.select.list(
  dsl.select.child(dsl.select.parent(), dsl.select.cls("card-header")),
  dsl.select.child(dsl.select.parent(), dsl.select.cls("card-content")),
  dsl.select.child(dsl.select.parent(), dsl.select.cls("card-footer")),
);

export default [
  component("card", {
    themeable: "surface",
    variants: {
      default: {
        "--card-bg": dsl.current(100),
        "--card-fg": dsl.currentText(100),
        "--card-border": dsl.current(300),
        "--card-section-border": dsl.current(300),
        "--card-hover-bg": dsl.current(200),
        "--card-hover-fg": dsl.currentText(200),
        "--card-hover-border": dsl.current(300),
      },
      soft: {
        "--card-bg": dsl.current(100),
        "--card-fg": dsl.currentText(100),
        "--card-border": dsl.current(300),
        "--card-section-border": dsl.current(300),
        "--card-hover-bg": dsl.current(200),
        "--card-hover-fg": dsl.currentText(200),
        "--card-hover-border": dsl.current(300),
      },
      filled: {
        "--card-bg": dsl.current(500),
        "--card-fg": dsl.currentText(500),
        "--card-border": dsl.current(300),
        "--card-section-border": dsl.colorMix(
          "srgb",
          {
            color: dsl.cssvar("--on-tone-500"),
            percentage: dsl.primitive.percentage(25),
          },
          { color: dsl.primitive.color.transparent() },
        ),
        "--card-hover-bg": dsl.current(600),
        "--card-hover-fg": dsl.currentText(600),
        "--card-hover-border": dsl.current(300),
      },
      ghost: {
        "--card-bg": dsl.colorMix(
          "srgb",
          {
            color: dsl.cssvar("--tone-500"),
            percentage: dsl.primitive.percentage(20),
          },
          { color: dsl.primitive.color.transparent() },
        ),
        "--card-fg": dsl.current(700),
        "--card-border": dsl.colorMix(
          "srgb",
          {
            color: dsl.cssvar("--tone-500"),
            percentage: dsl.primitive.percentage(80),
          },
          { color: dsl.primitive.color.transparent() },
        ),
        "--card-section-border": dsl.colorMix(
          "srgb",
          {
            color: dsl.cssvar("--tone-500"),
            percentage: dsl.primitive.percentage(25),
          },
          { color: dsl.primitive.color.transparent() },
        ),
        "--card-hover-bg": dsl.colorMix(
          "srgb",
          {
            color: dsl.cssvar("--tone-500"),
            percentage: dsl.primitive.percentage(40),
          },
          { color: dsl.primitive.color.transparent() },
        ),
        "--card-hover-fg": dsl.current(700),
        "--card-hover-border": dsl.current(500),
      },
    },
    styles: [
      "rounded-lg",
      {
        "background-color": dsl.match.variable("--card-bg"),
        color: dsl.match.variable("--card-fg"),
        border: dsl.cssv`1px solid ${dsl.match.variable("--card-border")}`,

        $: {
          [cardSections]: {
            padding: `${dsl.spacing("4")}`,
          },

          [dsl.select.child(
            dsl.select.parent(),
            dsl.select.cls("card-header"),
          )]: {
            "border-bottom": dsl.cssv`1px solid ${dsl.match.variable("--card-section-border")}`,
          },

          [dsl.select.child(
            dsl.select.parent(),
            dsl.select.cls("card-footer"),
          )]: {
            "border-top": dsl.cssv`1px solid ${dsl.match.variable("--card-section-border")}`,
          },
        },
      },
    ],
  }),

  utility("card-hover", {
    cursor: "pointer",
    "transition-property":
      "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
    "transition-timing-function": "ease-in-out",
    "transition-duration": "250ms",

    $: {
      [dsl.select.parent(dsl.select.pseudo("hover"))]: {
        "background-color": dsl.cssvar("--card-hover-bg"),
        color: dsl.cssvar("--card-hover-fg"),
        "border-color": dsl.cssvar("--card-hover-border"),
        transform: "scale(1.01)",
      },
    },
  }),
];
