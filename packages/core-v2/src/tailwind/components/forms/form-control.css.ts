import { component, dsl } from "@nataliebasille/natcore-css-engine";

const allSiblingInputs = "~ input, ~ select, ~ textarea";
const allChildInputs = "> input, > select, > textarea";

const bg = dsl.current(50);
const fg = dsl.currentText(50, 0.8);
const border = dsl.current(200);

export default component("form-control", {
  themeable: "surface",
  styles: [
    "grid",
    "transition-all",
    "duration-200",
    "ease-in-out",
    {
      "grid-template-areas":
        '"label label label" "prefix input suffix" "hint hint hint"',
      "grid-template-columns": "max-content 1fr max-content",

      $: {
        ["> .form-control-label, > label, > .form-control-hint"]: ["text-xs"],

        ["> .form-control-label, > label, > .form-control-prefix, > .form-control-suffix"]:
          [
            "font-light",
            "transition-all",
            "duration-200",
            "ease-in-out",
            "tracking-wider",
            {
              "background-color": bg,
              "border-color": border,
              color: fg,
            },
          ],

        ["> .form-control-label, > label"]: [
          "border-solid",
          "border",
          "border-b-0",
          "rounded-t-md",
          {
            "grid-area": "label",
            "padding-left": dsl.primitive.length.em(4 / 3),
            "padding-right": dsl.primitive.length.em(2),
            "padding-top": dsl.primitive.length.em(0.25),

            $: {
              [allSiblingInputs]: [
                "rounded-t-none",
                "border-t-0",
                {
                  "padding-top": dsl.primitive.length.em(0.25),
                },
              ],
              ["~ .form-control-prefix, ~ .form-control-suffix"]: [
                "rounded-t-none",
                "border-t-0",
              ],
            },
          },
        ],

        [allChildInputs]: [
          "outline-hidden",
          "transition-all",
          "duration-200",
          "ease-in-out",
          {
            "grid-area": "input",
            "background-color": bg,
            color: fg,
            "border-color": border,

            $: {
              [dsl.select.parent(":has(~ .form-control-suffix)")]: [
                "rounded-t-none",
                "border-r-0",
                {
                  "padding-right": dsl.primitive.length.em(0.25),
                },
              ],
            },
          },
        ],

        ["> .form-control-hint"]: {
          "grid-area": "hint",
          "padding-left": dsl.primitive.length.em(4 / 3),
        },

        [dsl.select.parent(".form-control-error")]: {
          $: {
            ["> .form-control-label, > label, > input, > select, > textarea, > .form-control-prefix, > .form-control-suffix"]:
              ["border-red-600"],
            ["> .form-control-label, > label, > .form-control-hint, > .form-control-prefix, > .form-control-suffix"]:
              ["border-red-600"],
          },
        },

        ["> .form-control-prefix"]: [
          "flex",
          "items-center",
          "border-solid",
          "border-y",
          "border-l",
          "rounded-l-md",
          "pl-1",
          {
            "grid-area": "prefix",
            $: {
              [allSiblingInputs]: ["rounded-l-none", "border-l-0", "pl-1"],
            },
          },
        ],

        ["> .form-control-suffix"]: [
          "flex",
          "items-center",
          "border-solid",
          "border-y",
          "border-r",
          "rounded-r-md",
          "pr-1",
          {
            "grid-area": "suffix",
          },
        ],

        [dsl.select.parent(":focus-within")]: {
          $: {
            [allChildInputs]: {
              "border-color": dsl.current(800),
            },
            ["> .form-control-label, > label, > .form-control-prefix, > .form-control-suffix"]:
              {
                "border-color": dsl.current(800),
                color: dsl.currentText(100, 0.7),
              },
          },
        },
      },
    },
  ],
});
