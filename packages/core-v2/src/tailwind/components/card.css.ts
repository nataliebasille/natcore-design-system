import { component, dsl } from "@nataliebasille/css-engine";

const module = component("card")
  .variant("solid", {
    "--bg": dsl.current(700),
    "--fg": dsl.currentText(700),
    "--border": dsl.current(600),
    "--section-border": dsl.current(600, 0.55),
  })
  .variant("soft", {
    "--bg": dsl.current(100),
    "--fg": dsl.currentText(100),
    "--border": dsl.current(200),
    "--section-border": dsl.current(200),
    "--hover-bg": dsl.current(200),
    "--hover-fg": dsl.currentText(200),
    "--hover-border": dsl.current(300),
  })
  .variant("outline", {
    "--bg": dsl.current(100, 0.1),
    "--fg": dsl.cssvar("--tone-current-fg"),
    "--border": dsl.current(300),
    "--section-border": dsl.current(200),
    "--hover-bg": dsl.current(600),
    "--hover-fg": dsl.currentText(600),
    "--hover-border": dsl.current(300),
  })
  .variant("ghost", {
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
  })
  .slot("header", "data-attr")
  .slot("content", "data-attr")
  .slot("footer", "data-attr")
  .body(({ slot }) => {
    const cardSections = dsl.select.list(
      ...[slot("header"), slot("content"), slot("footer")].map(
        (selector) => `& > ${selector}`,
      ),
    );

    return [
      "rounded-lg",
      {
        "background-color": dsl.cssvar("--bg"),
        color: dsl.cssvar("--fg"),
        border: dsl.cssv`1px solid ${dsl.cssvar("--border")}`,
        $: {
          [cardSections]: {
            padding: `${dsl.spacing("4")}`,
          },
          [`& > ${slot("header")}`]: {
            "border-bottom": dsl.cssv`1px solid ${dsl.cssvar("--section-border")}`,
          },
          [`& > ${slot("footer")}`]: {
            "border-top": dsl.cssv`1px solid ${dsl.cssvar("--section-border")}`,
          },
        },
      },
    ];
  })
  .utility("hover", {
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
  });

export default module;
