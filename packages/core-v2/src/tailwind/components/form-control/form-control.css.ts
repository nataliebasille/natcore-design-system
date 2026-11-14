import { component, dsl } from "@nataliebasille/css-engine";
import { paddingBlock, paddingInline } from "../../../shared/inputs.ts";

const { select } = dsl;

const LABEL = select.is(
  select.element("label"),
  select.attr('data-slot="label"'),
);
const INPUT = select.is(
  select.element("input"),
  select.element("select"),
  select.element("textarea"),
  select.attr('data-slot="input"'),
);

const TRANSPARENT = dsl.primitive.color.transparent();

// The label and hint share one font so they read as a pair.
const TEXT_FONT = ["text-xs", "font-light", "tracking-wider"] as const;

// Left padding of the parts in a box; underline drops it to align with its line.
const BOXED_INDENTS = {
  "--label-indent": dsl.primitive.length.em(4 / 3),
  "--field-indent": paddingInline,
  "--prefix-indent": dsl.primitive.length.em(0.5),
};
const HINT_INDENT = dsl.primitive.length.rem(0.25);

export default component("form-control")
  .variant("outline", {
    "--bg": TRANSPARENT,
    "--fg": "inherit",
    "--border": dsl.current(300),
    "--focus-bg": TRANSPARENT,
    "--focus-border": dsl.current(800),
    "--edge-width": dsl.primitive.length.px(1),
    "--bottom-width": dsl.primitive.length.px(1),
    "--radius": dsl.cssvar("--radius-md"),
    ...BOXED_INDENTS,
    "--hint-indent": HINT_INDENT,
  })
  .variant("soft", {
    "--bg": dsl.current(300),
    "--fg": dsl.currentText(300),
    "--border": dsl.current(300),
    "--focus-bg": dsl.current(300),
    "--focus-border": dsl.current(500),
    "--edge-width": dsl.primitive.length.px(1),
    "--bottom-width": dsl.primitive.length.px(1),
    "--radius": dsl.cssvar("--radius-md"),
    ...BOXED_INDENTS,
    "--hint-indent": HINT_INDENT,
  })
  .variant("solid", {
    "--bg": dsl.current(800),
    "--fg": dsl.currentText(800),
    "--border": dsl.current(700),
    "--focus-bg": dsl.current(800),
    "--focus-border": dsl.current(950),
    "--edge-width": dsl.primitive.length.px(1),
    "--bottom-width": dsl.primitive.length.px(1),
    "--radius": dsl.cssvar("--radius-md"),
    ...BOXED_INDENTS,
    "--hint-indent": HINT_INDENT,
  })
  .variant("underline", {
    "--bg": TRANSPARENT,
    "--fg": "inherit",
    "--border": dsl.current(300),
    "--focus-bg": TRANSPARENT,
    "--focus-border": dsl.current(700),
    "--edge-width": dsl.primitive.length.px(0),
    "--bottom-width": dsl.primitive.length.px(2),
    "--radius": dsl.primitive.length.px(0),
    "--label-indent": dsl.primitive.length.px(0),
    "--field-indent": dsl.primitive.length.px(0),
    "--prefix-indent": dsl.primitive.length.px(0),
    "--hint-indent": dsl.primitive.length.px(0),
  })
  .optionalVariants("outline")
  .slot("label", LABEL)
  .slot("input", INPUT)
  .slot("prefix", "data-attr")
  .slot("suffix", "data-attr")
  .slot("hint", "data-attr")
  .body(({ slot }) => {
    // Widened to string: templating the full Selector union is too complex
    // for TypeScript once several slots are combined.
    const slots: Record<
      "label" | "input" | "prefix" | "suffix" | "hint",
      string
    > = {
      label: slot("label"),
      input: slot("input"),
      prefix: slot("prefix"),
      suffix: slot("suffix"),
      hint: slot("hint"),
    };
    const label = `& > ${slots.label}`;
    const input = `& > ${slots.input}`;
    const prefix = `& > ${slots.prefix}`;
    const suffix = `& > ${slots.suffix}`;
    const boxParts = select.list(label, input, prefix, suffix);
    const edge = dsl.cssvar("--edge-width");
    const radius = dsl.cssvar("--radius");

    return [
      "grid",
      {
        "grid-template-areas":
          '"label label label" "prefix input suffix" "hint hint hint"',
        "grid-template-columns": "max-content 1fr max-content",

        $: {
          [boxParts]: [
            "transition-colors",
            "duration-200",
            "ease-in-out",
            {
              "background-color": dsl.cssvar("--bg"),
              color: dsl.cssvar("--fg"),
              "border-style": "solid",
              "border-color": dsl.cssvar("--border"),
              "border-width": "0",
              "border-radius": "0",
            },
          ],

          [label]: [
            ...TEXT_FONT,
            {
              "grid-area": "label",
              "padding-block-start": dsl.primitive.length.em(0.25),
              "padding-inline-start": dsl.cssvar("--label-indent"),
              "padding-inline-end": dsl.primitive.length.em(4 / 3),
              "border-top-width": edge,
              "border-inline-width": edge,
              "border-start-start-radius": radius,
              "border-start-end-radius": radius,
            },
          ],

          [input]: {
            "grid-area": "input",
            "min-width": "0",
            outline: "none",
            "padding-inline-start": dsl.cssvar("--field-indent"),
            "padding-inline-end": paddingInline,
            "padding-block": paddingBlock,
            "border-top-width": edge,
            "border-inline-width": edge,
            "border-bottom-width": dsl.cssvar("--bottom-width"),
            "border-radius": radius,
          },

          [prefix]: [
            "flex",
            "items-center",
            {
              "grid-area": "prefix",
              "padding-inline-start": dsl.cssvar("--prefix-indent"),
              "border-top-width": edge,
              "border-inline-start-width": edge,
              "border-bottom-width": dsl.cssvar("--bottom-width"),
              "border-start-start-radius": radius,
              "border-end-start-radius": radius,
            },
          ],

          [suffix]: [
            "flex",
            "items-center",
            {
              "grid-area": "suffix",
              "padding-inline-end": dsl.primitive.length.em(0.5),
              "border-top-width": edge,
              "border-inline-end-width": edge,
              "border-bottom-width": dsl.cssvar("--bottom-width"),
              "border-start-end-radius": radius,
              "border-end-end-radius": radius,
            },
          ],

          [`& > ${slots.hint}`]: [
            ...TEXT_FONT,
            {
              "grid-area": "hint",
              "margin-top": dsl.spacing("1.5"),
              "padding-inline-start": dsl.cssvar("--hint-indent"),
            },
          ],

          // A label sits on top of the field row, so they join into one box.
          [select.list(
            `${label} ~ ${slots.input}`,
            `${label} ~ ${slots.prefix}`,
            `${label} ~ ${slots.suffix}`,
          )]: {
            "border-top-width": "0",
            "border-start-start-radius": "0",
            "border-start-end-radius": "0",
          },

          [`${prefix} ~ ${slots.input}`]: {
            "padding-inline-start": dsl.primitive.length.em(0.25),
            "border-inline-start-width": "0",
            "border-start-start-radius": "0",
            "border-end-start-radius": "0",
          },

          [`${input}:has(~ ${slots.suffix})`]: {
            "padding-inline-end": dsl.primitive.length.em(0.25),
            "border-inline-end-width": "0",
            "border-start-end-radius": "0",
            "border-end-end-radius": "0",
          },

          [select.parent(select.pseudo("focus-within"))]: {
            $: {
              [select.list(
                boxParts,
                select.parent(select.not(select.has(`> ${slots.input}`))),
              )]: {
                "background-color": dsl.cssvar("--focus-bg"),
                "border-color": dsl.cssvar("--focus-border"),
              },
            },
          },

          [select.parent(select.not(select.has(`> ${slots.input}`)))]: {
            "background-color": dsl.cssvar("--bg"),
            color: dsl.cssvar("--fg"),
            "border-style": "solid",
            "border-color": dsl.cssvar("--border"),
            "border-width": dsl.cssvar("--edge-width"),
            "border-bottom-width": dsl.cssvar("--bottom-width"),
            "border-radius": radius,
            "padding-inline": dsl.primitive.length.em(4 / 3),
            "padding-block": dsl.primitive.length.em(0.25),

            // Without a field the wrapper is the box, so the label is plain text.
            $: {
              [`& > ${slots.label}`]: {
                "background-color": TRANSPARENT,
                "border-width": "0",
                "padding-inline": "0",
              },
            },
          },
        },
      },
    ];
  });
