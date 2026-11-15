import { component, dsl } from "@nataliebasille/css-engine";

const module = component("badge")
  .variant("solid", {
    "--bg": dsl.current(700),
    "--fg": dsl.currentText(700),
    "--border": dsl.current(600),
  })
  .variant("soft", {
    "--bg": dsl.current(100),
    "--fg": dsl.current(800),
    "--border": dsl.current(200),
  })
  .variant("outline", {
    "--bg": "transparent",
    "--fg": dsl.current(300),
    "--border": dsl.current(300, 0.6),
  })
  .variant("ghost", {
    "--bg": "transparent",
    "--fg": dsl.current(300),
    "--border": "transparent",
  })
  .body("inline-flex", "items-center", "rounded-full", {
    "background-color": dsl.cssvar("--bg"),
    color: dsl.cssvar("--fg"),
    border: dsl.cssv`1px solid ${dsl.cssvar("--border")}`,
    "padding-inline": dsl.spacing("2.5"),
    "padding-block": dsl.spacing("0.5"),
    "font-size": dsl.cssvar("--text-xs"),
    "line-height": dsl.cssvar("--leading-tight"),
    "font-weight": "500",
  });

export default module;
