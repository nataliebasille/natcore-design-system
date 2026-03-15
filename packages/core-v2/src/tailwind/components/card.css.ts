import { component, dsl, utility } from "@nataliebasille/natcore-css-engine";

const cardSections = dsl.select.list(
  dsl.select.child(dsl.select.parent(), dsl.select.cls("card-header")),
  dsl.select.child(dsl.select.parent(), dsl.select.cls("card-content")),
  dsl.select.child(dsl.select.parent(), dsl.select.cls("card-footer")),
);

export default [
  component("card", {
    variants: {
      solid: {
        "--bg": dsl.current(700),
        "--fg": dsl.currentText(700),
        "--border": dsl.current(600),
        "--section-border": dsl.current(600, 0.55),
      },
      soft: {
        "--bg": dsl.current(100),
        "--fg": dsl.currentText(100),
        "--border": dsl.current(200),
        "--section-border": dsl.current(200),
        "--hover-bg": dsl.current(200),
        "--hover-fg": dsl.currentText(200),
        "--hover-border": dsl.current(300),
      },
      outline: {
        "--bg": dsl.current(100, 0.1),
        "--fg": dsl.cssvar("--tone-current-fg"),
        "--border": dsl.current(300),
        "--section-border": dsl.current(200),
        "--hover-bg": dsl.current(600),
        "--hover-fg": dsl.currentText(600),
        "--hover-border": dsl.current(300),
      },
      ghost: {
        "--bg": "transparent",
        "--fg": dsl.cssvar("--tone-current-fg"),
        "--border": "transparent",
        "--section-border": dsl.current(100, 0.06),
        "--hover-bg": dsl.colorMix(
          "srgb",
          {
            color: dsl.cssvar("--tone-500"),
            percentage: dsl.primitive.percentage(40),
          },
          { color: dsl.primitive.color.transparent() },
        ),
        "--hover-fg": dsl.current(700),
        "--hover-border": dsl.current(500),
      },
    },
    styles: [
      "rounded-lg",
      {
        "background-color": dsl.match.variable("--bg"),
        color: dsl.match.variable("--fg"),
        border: dsl.cssv`1px solid ${dsl.match.variable("--border")}`,

        $: {
          [cardSections]: {
            padding: `${dsl.spacing("4")}`,
          },

          [dsl.select.child(
            dsl.select.parent(),
            dsl.select.cls("card-header"),
          )]: {
            "border-bottom": dsl.cssv`1px solid ${dsl.match.variable("--section-border")}`,
          },

          [dsl.select.child(
            dsl.select.parent(),
            dsl.select.cls("card-footer"),
          )]: {
            "border-top": dsl.cssv`1px solid ${dsl.match.variable("--section-border")}`,
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
        "background-color": dsl.cssvar("--hover-bg"),
        color: dsl.cssvar("--hover-fg"),
        "border-color": dsl.cssvar("--hover-border"),
        transform: "scale(1.01)",
      },
    },
  }),
];
