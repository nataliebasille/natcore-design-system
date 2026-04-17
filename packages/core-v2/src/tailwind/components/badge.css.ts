import { component_deprecated, dsl } from "@nataliebasille/css-engine";

export default component_deprecated("badge", {
  variants: {
    solid: {
      "--bg": dsl.current(700),
      "--fg": dsl.currentText(700),
      "--border": dsl.current(600),
    },
    soft: {
      "--bg": dsl.current(100),
      "--fg": dsl.current(800),
      "--border": dsl.current(600),
    },
    outline: {
      "--bg": "transparent",
      "--fg": dsl.current(300),
      "--border": dsl.current(300, 0.6),
    },
    ghost: {
      "--bg": "transparent",
      "--fg": dsl.current(300),
      "--border": "transparent",
    },
  },
  styles: [
    "inline-flex",
    "items-center",
    "rounded-full",
    {
      "background-color": dsl.match.variable("--bg"),
      color: dsl.match.variable("--fg"),
      border: dsl.cssv`1px solid ${dsl.match.variable("--border")}`,
      "padding-inline": dsl.spacing("2.5"),
      "padding-block": dsl.spacing("0.5"),
      "font-size": dsl.cssvar("--text-xs"),
      "line-height": dsl.cssvar("--leading-tight"),
      "font-weight": "500",
    },
  ],
});
