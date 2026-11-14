import { component, dsl } from "@nataliebasille/css-engine";

const { select } = dsl;

const TAB_SLOT = select.attr('data-slot="tab"');
const PANEL_SLOT = select.attr('data-slot="panel"');

const DETAILS = select.element("details");
// A <details> item needs no slots: its <summary> is the tab, and the rest of
// its content (the browser's ::details-content box) is the panel.
const TAB = select.is(TAB_SLOT, select.element("summary"));
const DETAILS_CONTENT = select.compound(
  DETAILS,
  select.pseudoElement("details-content"),
);

// A tab is selected by an open <details>, a checked radio inside it, or
// aria-selected (set by a script).
const OPEN_ITEM = select.compound(DETAILS, select.attr("open"));
const SELECTED = [
  select.attr('aria-selected="true"'),
  select.has(select.pseudo("checked")),
] as const;

const PANEL = select.list(
  select.child(select.child(select.parent(), select.not(DETAILS)), PANEL_SLOT),
  select.child(select.parent(), DETAILS_CONTENT),
);

// The panels of every item that isn't selected.
const CLOSED_PANEL = select.list(
  select.child(
    select.child(
      select.parent(),
      select.not(
        DETAILS,
        select.has(
          `> ${select.descendant(TAB_SLOT, select.pseudo("checked"))}`,
        ),
        select.has(
          `> ${select.compound(TAB_SLOT, select.attr('aria-selected="true"'))}`,
        ),
      ),
    ),
    PANEL_SLOT,
  ),
  select.child(
    select.parent(),
    select.compound(
      DETAILS,
      select.not(select.attr("open")),
      select.pseudoElement("details-content"),
    ),
  ),
);

const GAP = dsl.spacing("1");

// Fully rounded at any size, like Tailwind's rounded-full.
const FULL_RADIUS = dsl.calc`infinity * ${dsl.primitive.length.px(1)}`;

// One track per possible tab. Empty tracks are 0 wide, so the gap between
// tabs is a margin rather than a grid gap.
const TAB_TRACKS = "repeat(50, max-content)";

// The inherited text color, faded. Relative to currentColor so tabs follow
// whatever text color they sit in.
const MUTED_TEXT = fadedText(65);

// The look, set on the tabs element as --tabs-* vars by tabs-style-*. Bare
// tabs uses the underline look. Its colors are the tone of the tabs element,
// so the palette comes from tabs/<palette> or tabs-v/<palette>.
const UNDERLINE = {
  "--hover-bg": "transparent",
  "--hover-border": tone(600, 0.4),
  "--active-fg": "currentColor",
  "--active-bg": "transparent",
  "--active-border": tone(600),
  "--tab-sides": "0px",
  "--tab-edge": "2px",
  "--tab-radius": "0px",
  "--tab-edge-radius": "0px",
  "--divider": fadedText(15),
  "--divider-width": "1px",
  "--panel-fg": "currentColor",
  "--panel-bg": "transparent",
  "--panel-border": "transparent",
  "--panel-border-width": "0px",
  "--panel-padding": "0px",
  "--panel-gap": dsl.spacing("4"),
  "--panel-radius": "0px",
};

type StyleVar = keyof typeof UNDERLINE;

const S = style("--tab-sides");
const E = style("--tab-edge");
const OVERLAP = dsl.calc`-1 * ${style("--divider-width")}`;
const P = style("--panel-padding");
const P_GAP = dsl.calc`${P} + ${style("--panel-gap")}`;
const B = style("--panel-border-width");

/**
 * Tabs that switch between panels. Each direct child is one item: a tab and
 * the panel it shows. In a `<details name>` the `<summary>` is the tab and the
 * rest is the panel; any other item marks them with `data-slot="tab"` and
 * `data-slot="panel"`. An item is selected when it's an open `<details>`,
 * when its tab is a `<label>` around a checked radio, or when its tab has
 * `aria-selected="true"`.
 *
 * `tabs` puts the tabs in a row above the panel, `tabs-v` in a column beside
 * it; both take the palette (`tabs/primary`). Either way every panel shares
 * one grid cell and closed panels are only hidden, so the cell fits the
 * largest panel and switching tabs never resizes or moves the tabs.
 * `tabs-style-*` sets the look. Everything lands in `components.base`, so
 * Tailwind utilities override it.
 */
export default component("tabs")
  // Tabs in the first row, the divider below them, and the panels below that.
  .vars({
    "--columns": `${TAB_TRACKS} 1fr`,
    "--rows": "auto auto 1fr",
    "--tab-row": "1",
    "--tab-column": "auto",
    "--divider-row": "2",
    "--divider-column": "1 / -1",
    "--panel-row": "3",
    "--panel-column": "1 / -1",
    "--tab-margin-block": dsl.cssv`0 ${OVERLAP}`,
    "--tab-margin-inline": dsl.cssv`0 ${GAP}`,
    "--tab-border-block": dsl.cssv`${S} ${E}`,
    "--tab-border-inline": S,
    "--tab-radius-start-end": style("--tab-radius"),
    "--tab-radius-end-start": style("--tab-edge-radius"),
    "--divider-border-block": dsl.cssv`${style("--divider-width")} 0`,
    "--divider-border-inline": "0",
    "--panel-padding-block": dsl.cssv`${P_GAP} ${P}`,
    "--panel-padding-inline": P,
    "--panel-border-block": dsl.cssv`0 ${B}`,
    "--panel-border-inline": B,
    "--panel-radius-start-end": "0",
    "--panel-radius-end-start": style("--panel-radius"),
  })
  // Tabs in a column with the divider and panels beside them. The panel cell
  // spans all rows and the tabs fill the first rows, so the panel starts level
  // with the first tab.
  .variant("v", {
    "--columns": "max-content auto 1fr",
    "--rows": "repeat(50, min-content) 1fr",
    "--tab-row": "auto",
    "--tab-column": "1",
    "--divider-row": "1 / -1",
    "--divider-column": "2",
    "--panel-row": "1 / -1",
    "--panel-column": "3",
    "--tab-margin-block": dsl.cssv`0 ${GAP}`,
    "--tab-margin-inline": dsl.cssv`0 ${OVERLAP}`,
    "--tab-border-block": S,
    "--tab-border-inline": dsl.cssv`${S} ${E}`,
    "--tab-radius-start-end": style("--tab-edge-radius"),
    "--tab-radius-end-start": style("--tab-radius"),
    "--divider-border-block": "0",
    "--divider-border-inline": dsl.cssv`${style("--divider-width")} 0`,
    "--panel-padding-block": P,
    "--panel-padding-inline": dsl.cssv`${P_GAP} ${P}`,
    "--panel-border-block": B,
    "--panel-border-inline": dsl.cssv`0 ${B}`,
    "--panel-radius-start-end": style("--panel-radius"),
    "--panel-radius-end-start": "0",
  })
  .optionalVariants()
  .slot("tab", TAB_SLOT)
  .slot("panel", PANEL_SLOT)
  .body(
    {
      display: "grid",
      "grid-template-columns": dsl.cssvar("--columns"),
      "grid-template-rows": dsl.cssvar("--rows"),
      "column-gap": "0",
      padding: "0",
      "list-style": "none",
      $: {
        // The underline look, at zero specificity so tabs-style-* wins.
        [select.pseudo(`where(${select.parent()})`)]: styleVars(UNDERLINE),

        [select.child(select.parent(), select.any())]: { display: "contents" },

        [inItem(TAB)]: {
          "grid-row": dsl.cssvar("--tab-row"),
          "grid-column": dsl.cssvar("--tab-column"),
          "z-index": "1",
          cursor: "pointer",
          "list-style": "none",
          "padding-block": dsl.spacing("2"),
          "padding-inline": dsl.spacing("3"),
          "font-weight": "500",
          color: MUTED_TEXT,
          "background-color": "transparent",
          "border-style": "solid",
          "border-color": "transparent",
          "border-block-width": dsl.cssvar("--tab-border-block"),
          "border-inline-width": dsl.cssvar("--tab-border-inline"),
          "border-start-start-radius": style("--tab-radius"),
          "border-start-end-radius": dsl.cssvar("--tab-radius-start-end"),
          "border-end-start-radius": dsl.cssvar("--tab-radius-end-start"),
          "border-end-end-radius": style("--tab-edge-radius"),
          // Overlaps the divider, so the selected tab can cover it.
          "margin-block": dsl.cssvar("--tab-margin-block"),
          "margin-inline": dsl.cssvar("--tab-margin-inline"),
          "transition-property": "color, background-color, border-color",
          "transition-duration": "150ms",
          "transition-timing-function": "ease-out",
          $: {
            [select.parent(select.pseudoElement("-webkit-details-marker"))]: {
              display: "none",
            },
          },
        },

        [select.child(
          select.child(select.parent(), select.not(OPEN_ITEM)),
          select.compound(TAB, select.not(...SELECTED), select.pseudo("hover")),
        )]: {
          color: "currentColor",
          "background-color": style("--hover-bg"),
          "border-color": style("--hover-border"),
        },

        [select.list(
          select.child(select.child(select.parent(), OPEN_ITEM), TAB),
          inItem(select.compound(TAB, select.is(...SELECTED))),
        )]: {
          color: style("--active-fg"),
          "background-color": style("--active-bg"),
          "border-color": style("--active-border"),
        },

        // A click would close the open <details> and leave no panel showing.
        [select.child(select.child(select.parent(), OPEN_ITEM), TAB)]: {
          "pointer-events": "none",
        },

        [inItem(
          select.compound(
            TAB,
            select.is(
              select.pseudo("focus-visible"),
              select.has(select.pseudo("focus-visible")),
            ),
          ),
        )]: {
          "outline-style": "solid",
          "outline-width": "2px",
          "outline-offset": "2px",
          "outline-color": dsl.current(500),
        },

        [inItem(select.descendant(TAB_SLOT, 'input[type="radio"]'))]: "sr-only",

        [select.parent(select.pseudoElement("before"))]: {
          content: '""',
          "grid-row": dsl.cssvar("--divider-row"),
          "grid-column": dsl.cssvar("--divider-column"),
          "border-style": "solid",
          "border-color": style("--divider"),
          "border-block-width": dsl.cssvar("--divider-border-block"),
          "border-inline-width": dsl.cssvar("--divider-border-inline"),
        },

        [PANEL]: {
          "grid-row": dsl.cssvar("--panel-row"),
          "grid-column": dsl.cssvar("--panel-column"),
          display: "block",
          color: style("--panel-fg"),
          "padding-block": dsl.cssvar("--panel-padding-block"),
          "padding-inline": dsl.cssvar("--panel-padding-inline"),
          "background-color": style("--panel-bg"),
          "border-style": "solid",
          "border-color": style("--panel-border"),
          "border-block-width": dsl.cssvar("--panel-border-block"),
          "border-inline-width": dsl.cssvar("--panel-border-inline"),
          "border-start-start-radius": "0",
          "border-start-end-radius": dsl.cssvar("--panel-radius-start-end"),
          "border-end-start-radius": dsl.cssvar("--panel-radius-end-start"),
          "border-end-end-radius": style("--panel-radius"),
        },

        // Hidden, closed panels can't be focused or read. A closed
        // <details> would also skip laying out its content; laid out, it
        // still sizes the panel cell.
        [CLOSED_PANEL]: {
          visibility: "hidden",
          "content-visibility": "visible",
        },
      },
    },
    dsl.prefersReducedMotion({
      $: { [inItem(TAB)]: { "transition-duration": "0s" } },
    }),
  )
  // The look of tabs or tabs-v on the same element.
  .derive("style", (child) =>
    child
      .variant("underline", UNDERLINE)
      .variant("pill", {
        "--hover-bg": tone(100),
        "--hover-border": "transparent",
        "--active-fg": toneText(600),
        "--active-bg": tone(600),
        "--active-border": "transparent",
        "--tab-sides": "0px",
        "--tab-edge": "0px",
        "--tab-radius": FULL_RADIUS,
        "--tab-edge-radius": FULL_RADIUS,
        "--divider": "transparent",
        "--divider-width": "0px",
        "--panel-fg": "currentColor",
        "--panel-bg": "transparent",
        "--panel-border": "transparent",
        "--panel-border-width": "0px",
        "--panel-padding": "0px",
        "--panel-gap": dsl.spacing("4"),
        "--panel-radius": "0px",
      })
      .variant("boxed", {
        "--hover-bg": tone(100),
        "--hover-border": "transparent",
        "--active-fg": toneText(50),
        "--active-bg": tone(50),
        "--active-border": tone(300),
        "--tab-sides": "1px",
        "--tab-edge": "0px",
        "--tab-radius": dsl.cssvar("--radius-md"),
        "--tab-edge-radius": "0px",
        "--divider": tone(300),
        "--divider-width": "1px",
        "--panel-fg": toneText(50),
        "--panel-bg": tone(50),
        "--panel-border": tone(300),
        "--panel-border-width": "1px",
        "--panel-padding": dsl.spacing("4"),
        "--panel-gap": "0px",
        "--panel-radius": dsl.cssvar("--radius-md"),
      })
      .optionalVariants("underline")
      .body(
        styleVars(
          Object.fromEntries(
            Object.keys(UNDERLINE).map((name) => [
              name,
              dsl.cssvar(name as StyleVar),
            ]),
          ),
        ),
      ),
  );

/** `selector` as a direct child of an item (written from the tabs element). */
function inItem<S extends string>(selector: S) {
  return select.child(select.child(select.parent(), select.any()), selector);
}

/** A look var as set on the tabs element (`--hover-bg` is `--tabs-hover-bg`). */
function style<N extends StyleVar>(name: N) {
  return dsl.cssvar(`--tabs-${name.slice(2)}` as `--tabs-${string}`);
}

/** Look vars renamed to the --tabs-* vars the tabs element reads. */
function styleVars(vars: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(vars).map(([name, value]) => [
      `--tabs-${name.slice(2)}`,
      value,
    ]),
  ) as dsl.StyleProperties;
}

/**
 * A shade of the tabs element's tone, like `dsl.current`. Written as a plain
 * var so tabs-style-* doesn't take a palette of its own: it resolves on the
 * tabs element, whose palette comes from tabs/<palette> or tabs-v/<palette>.
 */
function tone(shade: number, opacity?: number) {
  const color = dsl.cssvar(`--bg-tone-${shade}`);
  return opacity === undefined ? color : (
      dsl.colorMix(
        "srgb",
        { color, percentage: dsl.primitive.percentage(opacity * 100) },
        { color: dsl.primitive.color.transparent() },
      )
    );
}

/** The text color for a shade of the tabs element's tone. */
function toneText(shade: number) {
  return dsl.cssvar(`--fg-tone-${shade}`);
}

/** The inherited text color at `percentage` opacity. */
function fadedText(percentage: number) {
  return dsl.colorMix(
    "srgb",
    {
      color: dsl.primitive.color.currentColor(),
      percentage: dsl.primitive.percentage(percentage),
    },
    { color: dsl.primitive.color.transparent() },
  );
}
