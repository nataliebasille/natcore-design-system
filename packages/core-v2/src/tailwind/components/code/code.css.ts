import { component, dsl } from "@nataliebasille/css-engine";

/**
 * Monospace code with a translucent surface tint, so it shows on any
 * container: `code` is a full-width block that scrolls sideways, `code-inline`
 * is a small chip in running text. Bare `<code>` gets the class. Everything
 * lands in the `components.base` layer, so Tailwind utilities like `p-0` or
 * `rounded-none` override it.
 */
export default component("code")
  .vars({
    "--display": "block",
    "--width": dsl.primitive.percentage(100),
    "--padding": dsl.spacing("4"),
    "--radius": dsl.cssvar("--radius-md"),
    "--white-space": "pre",
  })
  .variant("inline", {
    "--display": "inline",
    "--width": "auto",
    "--padding": dsl.cssv`${dsl.spacing("0.5")} ${dsl.spacing("1.5")}`,
    "--radius": dsl.cssvar("--radius-sm"),
    "--white-space": "normal",
  })
  .optionalVariants()
  .body("overflow-x-auto", "leading-relaxed", {
    display: dsl.cssvar("--display"),
    width: dsl.cssvar("--width"),
    padding: dsl.cssvar("--padding"),
    "border-radius": dsl.cssvar("--radius"),
    "white-space": dsl.cssvar("--white-space"),
    "background-color": dsl.adaptive("surface", 500, 0.15),
    "font-family":
      "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",
    "font-size": dsl.primitive.length.em(0.875),
  })
  .applyTo(dsl.select.element("code"));
