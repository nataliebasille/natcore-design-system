import { component, dsl } from "@nataliebasille/css-engine";

const { select } = dsl;

/** The wrapper's anchor name; scoped to each wrapper. */
const ANCHOR = "--popover";

const GAP = dsl.spacing("2");

/**
 * The popover inside a `popover-anchor` wrapper. Wrapper and trigger
 * utilities find it by its slot rather than its class, so they keep working
 * when the popover's class has a variant (`md:popover-right`).
 */
const SLOT = select.attr('data-slot="popover"');

const FLIPS = "flip-block, flip-inline, flip-block flip-inline";
// min-width animates a 1px layout change alongside the fade (see showWhen).
const FADED = "opacity, visibility, min-width, display, overlay";

// Closed popovers stay laid out (hidden), so closing can wait and fade in
// every browser.
const CLOSED = {
  opacity: "0",
  visibility: "hidden",
};

const SHOWN = {
  opacity: "1",
  visibility: "visible",
  // Opening anchors the popover at once; only closing delays it.
  "transition-property": FADED,
};

// Firefox only: it supports the prefixed property and nothing else does.
const FIREFOX = "-moz-appearance: none";

// Above later positioned content when CSS opens it (natively opened popovers
// are in the top layer, which ignores z-index). Like Tailwind's z-50.
const RAISED = "50";

type Side = "top" | "right" | "bottom" | "left";

const FACING: Record<Side, Side> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

// Delays are milliseconds when bare (like Tailwind's `delay-*`); brackets take any value.
const DELAY = [
  dsl.calc`${dsl.match.bare.integer()} * ${dsl.primitive.time.ms(1)}`,
  dsl.match.arbitrary.any(),
];

export default component("popover")
  // The default placement (below, centered). The variants override it.
  .vars(placement("bottom", "bottom"))
  .variant("top", placement("top", "top"))
  .variant(
    "top-start",
    placement("top", "self-block-start span-self-inline-end"),
  )
  .variant(
    "top-end",
    placement("top", "self-block-start span-self-inline-start"),
  )
  .variant("bottom", placement("bottom", "bottom"))
  .variant(
    "bottom-start",
    placement("bottom", "self-block-end span-self-inline-end"),
  )
  .variant(
    "bottom-end",
    placement("bottom", "self-block-end span-self-inline-start"),
  )
  .variant("left", placement("left", "left"))
  .variant("left-start", placement("left", "left span-bottom"))
  .variant("left-end", placement("left", "left span-top"))
  .variant("right", placement("right", "right"))
  .variant("right-start", placement("right", "right span-bottom"))
  .variant("right-end", placement("right", "right span-top"))
  .optionalVariants()
  // Registered, so `[normal]` (or any non-time value) falls back to the
  // default, and a nested popover never inherits its parent's delays.
  .property("--delay-open", {
    syntax: "<time>",
    inherits: false,
    initialValue: "500ms",
  })
  .property("--delay-close", {
    syntax: "<time>",
    inherits: false,
    initialValue: "250ms",
  })
  .body(
    {
      position: "fixed",
      "position-anchor": "auto",
      inset: dsl.cssvar("--inset"),
      "align-self": dsl.cssvar("--align-self"),
      "justify-self": dsl.cssvar("--justify-self"),
      padding: "0",
      "z-index": RAISED,
      "position-area": dsl.cssvar("--area"),
      margin: dsl.cssvar("--margin"),
      ...CLOSED,
      // A length, so it can animate to showWhen's 1px.
      "min-width": "0",
      "transition-property": `${FADED}, position-anchor`,
      // The anchor switches off halfway through its transition: at the end
      // of the fade, so a closing popover doesn't jump while it fades out.
      "transition-duration": "150ms, 150ms, 150ms, 150ms, 150ms, 300ms",
      "transition-timing-function": "ease-out",
      // Lets display/overlay/visibility flip after the fade so closing can animate out.
      "transition-behavior": "allow-discrete",
      $: {
        [select.parent(select.pseudo("popover-open"))]: SHOWN,
      },
    },
    dsl.startingStyle({
      $: { [select.parent(select.pseudo("popover-open"))]: CLOSED },
    }),
    // Reduced motion drops the animation but keeps the delays.
    dsl.prefersReducedMotion({ "transition-duration": "0s" }),
  )
  // Opt-in: flips to the other side (or alignment) when it doesn't fit.
  // Without the stretched inset, so the browser can tell it doesn't fit.
  .utility("flip", { inset: "auto", "position-try-fallbacks": FLIPS })
  .utility(
    "anchor",
    {
      "anchor-name": ANCHOR,
      "anchor-scope": ANCHOR,
      $: {
        // Shrink-wraps the trigger so the popover lines up with it; zero
        // specificity so layout utilities (flex, block, …) still win.
        [select.pseudo(`where(${select.parent()})`)]: {
          display: "inline-block",
        },
        // Positioned against the wrapper.
        [wrapped()]: { "position-anchor": ANCHOR },
      },
    },
    // Chromium doesn't move a hidden anchored popover as the page scrolls, so
    // it would pick its flip from stale geometry when it opens. Anchoring
    // wrapped popovers only while shown makes each opening measure afresh.
    // Not in Firefox: changing the anchor as a popover opens and flips leaves
    // it stuck invisible there. (Firefox gets a fresh layout from the
    // min-width change in showWhen instead.)
    dsl.supports(`not (${FIREFOX})`, {
      $: {
        [wrapped()]: { "position-anchor": "none" },
        [`${wrapped()}${select.pseudo("popover-open")}`]: {
          "position-anchor": ANCHOR,
        },
      },
    }),
    // An open <details class="popover-anchor"> shows its popover.
    ...showWhen([select.child(select.parent(select.attr("open")), SLOT), "0s"]),
  )
  .utility(
    "trigger-hover",
    ...showWhen(
      [triggerPopover(select.pseudo("hover")), dsl.cssvar("--delay-open")],
      // Stays open while the pointer is anywhere in the wrapper, popover included.
      [
        select.child(
          select.compound(ownWrapper(""), select.pseudo("hover")),
          SLOT,
        ),
        dsl.cssvar("--delay-open"),
      ],
    ),
    {
      $: {
        // Waits before closing (the show rules set the delay before opening).
        [triggerPopover("")]: {
          "transition-delay": dsl.cssvar("--delay-close"),
        },
        // A ring around the hovered wrapper bridges the gap, so the pointer
        // can cross from the trigger to the popover. It only exists while the
        // wrapper is hovered, and sits under the trigger: the wrapper is its
        // stacking context, raised like the popover so the popover inside it
        // stays above later content. Zero specificity keeps any position or
        // z-index the wrapper already has.
        [select.pseudo(`where(${hoveredWrapper()})`)]: {
          position: "relative",
          "z-index": RAISED,
        },
        [select.compound(hoveredWrapper(), select.pseudoElement("after"))]: {
          content: '""',
          position: "absolute",
          inset: dsl.calc`-1 * ${GAP}`,
          "z-index": "-1",
        },
      },
    },
  )
  .utility(
    "trigger-focus",
    ...showWhen(
      // Keyboard focus waits like interestfor; a click opens right away.
      [
        triggerPopover(select.pseudo("focus-visible")),
        dsl.cssvar("--delay-open"),
      ],
      [
        triggerPopover(
          select.compound(
            select.pseudo("focus"),
            select.pseudo(`not(${select.pseudo("focus-visible")})`),
          ),
        ),
        "0s",
      ],
      // Stays open while focus is inside the popover.
      [
        select.child(
          select.compound(
            ownWrapper(""),
            select.has(
              `> ${select.compound(SLOT, select.pseudo("focus-within"))}`,
            ),
          ),
          SLOT,
        ),
        "0s",
      ],
    ),
    // Waits before closing (the show rules set the delay before opening).
    {
      $: {
        [triggerPopover("")]: {
          "transition-delay": dsl.cssvar("--delay-close"),
        },
      },
    },
  )
  .utility(
    "trigger-checked",
    // The trigger is the checkbox itself, or a label around one. (:has()
    // can't nest, so "a checked box inside the trigger" is a descendant.)
    ...showWhen([
      triggerPopover(select.pseudo("checked"), ` ${select.pseudo("checked")}`),
      "0s",
    ]),
  )
  .utility("trigger-delay-*", {
    "interest-delay": DELAY,
    "--interest-delay-start": DELAY,
    "--interest-delay-end": DELAY,
    $: {
      [triggerPopover("")]: { "--delay-open": DELAY, "--delay-close": DELAY },
    },
  })
  .utility("trigger-delay-open-*", {
    "interest-delay-start": DELAY,
    "--interest-delay-start": DELAY,
    $: { [triggerPopover("")]: { "--delay-open": DELAY } },
  })
  .utility("trigger-delay-close-*", {
    "interest-delay-end": DELAY,
    "--interest-delay-end": DELAY,
    $: { [triggerPopover("")]: { "--delay-close": DELAY } },
  });

/**
 * Variant values for a placement on `side` of the trigger: its
 * position-area, the gap on the side facing the trigger, and an inset that
 * stretches the space on that side past the edge of the screen. Near an edge
 * the popover still fits that space, so it stays on its side instead of
 * sliding back over the trigger (popover-flip resets the inset). Along the
 * side it still slides to stay on screen.
 */
function placement(side: Side, area: string) {
  const vertical = side === "top" || side === "bottom";
  const past = (edge: Side) =>
    edge !== side ? "auto"
    : vertical ? "-100vh"
    : "-100vw";
  // Toward the trigger, so it sits next to it instead of at the far end of
  // the stretched space. Explicit alignment also keeps its natural size.
  const toward = { top: "end", bottom: "start", left: "right", right: "left" }[
    side
  ];
  return {
    "--area": area,
    "--margin": edgeMargin(FACING[side]),
    "--inset": dsl.cssv`${past("top")} ${past("right")} ${past("bottom")} ${past("left")}`,
    "--align-self": vertical ? toward : "normal",
    "--justify-self": vertical ? "normal" : toward,
  };
}

/** A margin shorthand with the gap on `edge` and 0 elsewhere. */
function edgeMargin(edge: Side) {
  const at = (side: Side) => (side === edge ? GAP : "0");
  return dsl.cssv`${at("top")} ${at("right")} ${at("bottom")} ${at("left")}`;
}

/** The popover in the wrapper `&` (written from the wrapper's utility). */
function wrapped() {
  return select.child(select.parent(), SLOT);
}

/**
 * The wrapper whose trigger is `&` (written from a trigger's utility): the
 * trigger is a direct child, or inside a direct child other than the popover.
 * A trigger in a nested wrapper lives in the popover's content, so it doesn't
 * count. Matches only when the trigger is in one of `states`.
 */
function ownWrapper(...states: string[]) {
  const active = `:is(${select.list(...states.map((state) => select.parent(state)))})`;
  return select.has(
    select.list(
      `> ${active}`,
      select.descendant(`> ${select.pseudo(`not(${SLOT})`)}`, active),
    ),
  );
}

/** The popover of the wrapper whose trigger `&` is in one of `states`. */
function triggerPopover(...states: string[]) {
  return select.child(ownWrapper(...states), SLOT);
}

function hoveredWrapper() {
  return select.compound(
    ownWrapper(""),
    select.has(`> ${SLOT}`),
    select.pseudo("hover"),
  );
}

/**
 * Shows the popover for each `[selector, delay]`, after `delay`, fading in
 * from a starting style. The starting styles sit beside the rules they undo:
 * in the same layer and later, so they win when the popover first renders.
 */
function showWhen(
  ...rules: [selector: string, delay: dsl.StylePropertyValue | dsl.CssVarAst][]
) {
  return [
    {
      $: Object.fromEntries(
        rules.flatMap(([selector, delay]) => [
          [
            selector,
            {
              ...SHOWN,
              "position-anchor": ANCHOR,
              "transition-delay": delay,
              // A native popover is display: none until it's opened natively.
              $: {
                [select.parent(select.attr("popover"))]: { display: "block" },
              },
            },
          ],
          // A layout change on opening, so Firefox picks a fresh flip instead
          // of the one it remembers from when the popover was last laid out.
          // It animates with the fade: Firefox never runs a transition on a
          // flipped popover unless its layout changes every frame.
          // Zero specificity, so min-w-* utilities still win.
          [select.pseudo(`where(${selector})`), { "min-width": "1px" }],
        ]),
      ),
    },
    dsl.startingStyle({
      $: Object.fromEntries(rules.map(([selector]) => [selector, CLOSED])),
    }),
  ];
}
