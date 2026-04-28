import { component, dsl } from "@nataliebasille/css-engine";

export default component("tray")
  .variant("left", {
    "--position": "absolute",
    "--inset-inline-start": "0",
    "--inset-block": "0",
    "--closed-transform": dsl.cssv`translateX(-100%)`,
    "--height": dsl.primitive.percentage(100),
    "--z-index": dsl.primitive.integer(200),
  })
  .variant("right", {
    "--position": "absolute",
    "--inset-inline-end": "0",
    "--inset-block": "0",
    "--closed-transform": dsl.cssv`translateX(100%)`,
    "--height": dsl.primitive.percentage(100),
    "--z-index": dsl.primitive.integer(200),
  })
  .variant("top", {
    "--position": "absolute",
    "--inset-block-start": "0",
    "--inset-inline": "0",
    "--closed-transform": dsl.cssv`translateY(-100%)`,
    "--width": dsl.primitive.percentage(100),
    "--z-index": dsl.primitive.integer(200),
  })
  .variant("bottom", {
    "--position": "absolute",
    "--inset-block-end": "0",
    "--inset-inline": "0",
    "--closed-transform": dsl.cssv`translateY(100%)`,
    "--width": dsl.primitive.percentage(100),
    "--z-index": dsl.primitive.integer(200),
  })
  .variant("inline", {
    "--position": "static",
    "--inset-inline": "auto",
    "--z-index": "auto",
  })
  .slot("toggle", "data-attr")
  .body(({ slot }) => ({
    position: dsl.cssvar("--position"),
    "z-index": dsl.cssvar("--z-index"),
    transition: "transform 300ms ease-in-out",
    "inset-inline-start": dsl.cssvar("--inset-inline-start"),
    "inset-inline-end": dsl.cssvar("--inset-inline-end"),
    "inset-block-start": dsl.cssvar("--inset-block-start"),
    "inset-block-end": dsl.cssvar("--inset-block-end"),
    "inset-inline": dsl.cssvar("--inset-inline"),
    "inset-block": dsl.cssvar("--inset-block"),
    transform: dsl.cssvar("--closed-transform"),
    width: dsl.cssvar("--width"),
    height: dsl.cssvar("--height"),
    $: {
      [slot("toggle")]: {
        display: "none",
      },
      [`&:has(${slot("toggle")}:checked), &[open]`]: {
        transform: "translate(0, 0) !important",
      },
    },
  }))
  .utility("open", {
    transform: "translate(0, 0) !important",
  });
