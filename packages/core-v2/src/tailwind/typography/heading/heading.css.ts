import { component, dsl } from "@nataliebasille/css-engine";

/**
 * Heading sizes: `heading-1` … `heading-6`. Bare `<h1>`–`<h6>` get the matching
 * class. Everything lands in the components layer, so Tailwind utilities like
 * `text-sm` or `leading-loose` override it.
 */
export default component("heading")
  .variant("1", { "--font-size": dsl.cssvar("--text-5xl") })
  .variant("2", { "--font-size": dsl.cssvar("--text-3xl") })
  .variant("3", { "--font-size": dsl.cssvar("--text-xl") })
  .variant("4", { "--font-size": dsl.cssvar("--text-lg") })
  .variant("5", { "--font-size": dsl.cssvar("--text-base") })
  .variant("6", { "--font-size": dsl.cssvar("--text-sm") })
  .body("tracking-wide", "leading-tight", {
    "font-size": dsl.cssvar("--font-size"),
  })
  .applyTo(dsl.select.element("h1"), "1")
  .applyTo(dsl.select.element("h2"), "2")
  .applyTo(dsl.select.element("h3"), "3")
  .applyTo(dsl.select.element("h4"), "4")
  .applyTo(dsl.select.element("h5"), "5")
  .applyTo(dsl.select.element("h6"), "6");
