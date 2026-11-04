import { component, dsl } from "@nataliebasille/css-engine";

const { select } = dsl;

const OPEN = select.parent(select.attr("open"));
const BACKDROP = select.parent(select.pseudoElement("backdrop"));
const OPEN_BACKDROP = select.parent(
  select.compound(select.attr("open"), select.pseudoElement("backdrop")),
);
const PAGE_WITH_OPEN_MODAL = select.compound(
  select.pseudo("root"),
  select.has(select.parent(select.pseudo("modal"))),
);

const CENTER = {
  "--margin": "auto",
  "--closed-transform": dsl.scale(0.95),
};

const CLOSED = {
  opacity: "0",
  transform: dsl.cssvar("--closed-transform"),
};

const TRANSITION = {
  "transition-duration": dsl.cssvar("--duration"),
  "transition-timing-function": "ease-out",
  // Lets display/overlay flip after the fade so closing can animate out.
  "transition-behavior": "allow-discrete",
};

export default component("dialog")
  .vars({
    "--width": dsl.primitive.length.rem(32),
    "--gutter": dsl.spacing("4"),
    "--duration": "200ms",
    "--backdrop": dsl.primitive.color.rgba(0, 0, 0, 0.5),
    ...CENTER,
  })
  .variant("center", CENTER)
  .variant("top", {
    "--margin": dsl.cssv`${dsl.cssvar("--gutter")} auto auto`,
    "--closed-transform": dsl.cssv`${dsl.translateY(dsl.primitive.length.rem(-1))} ${dsl.scale(0.95)}`,
  })
  .variant("bottom", {
    "--margin": dsl.cssv`auto auto ${dsl.primitive.length.px(0)}`,
    "--closed-transform": dsl.translateY(dsl.primitive.length.percent(100)),
  })
  .optionalVariants()
  .body(
    {
      padding: dsl.primitive.length.px(0),
      margin: dsl.cssvar("--margin"),
      width: dsl.cssvar("--width"),
      "max-width": dsl.calc`100% - 2 * ${dsl.cssvar("--gutter")}`,
      "max-height": dsl.calc`100% - 2 * ${dsl.cssvar("--gutter")}`,
      overflow: "auto",
      ...CLOSED,
      "transition-property": "opacity, transform, overlay, display",
      ...TRANSITION,
      $: {
        [OPEN]: { opacity: "1", transform: "none" },
        [BACKDROP]: {
          "background-color": dsl.cssvar("--backdrop"),
          opacity: "0",
          "transition-property": "opacity, overlay, display",
          ...TRANSITION,
        },
        [OPEN_BACKDROP]: { opacity: "1" },
        // Lock page scroll only for modal (showModal) dialogs, not show().
        [PAGE_WITH_OPEN_MODAL]: { overflow: "hidden" },
      },
    },
    dsl.startingStyle({
      $: {
        [OPEN]: CLOSED,
        [OPEN_BACKDROP]: { opacity: "0" },
      },
    }),
    dsl.prefersReducedMotion({
      transition: "none",
      $: { [BACKDROP]: { transition: "none" } },
    }),
  )
  .utility("backdrop-none", {
    $: {
      [BACKDROP]: {
        "background-color": dsl.primitive.color.transparent(),
      },
    },
  });
