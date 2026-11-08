import { component_deprecated, dsl, utility } from "@nataliebasille/css-engine";

const tone700Mixed50 = dsl.colorMix(
  "srgb",
  { color: dsl.cssvar("--tone-700") },
  {
    color: dsl.primitive.color.transparent(),
    percentage: dsl.primitive.percentage(50),
  },
);

const tone700Mixed35 = dsl.colorMix(
  "srgb",
  { color: dsl.cssvar("--tone-700") },
  {
    color: dsl.primitive.color.transparent(),
    percentage: dsl.primitive.percentage(35),
  },
);

const dividerMixed85 = dsl.colorMix(
  "srgb",
  { color: dsl.cssvar("--tone-current-fg") },
  {
    color: dsl.primitive.color.transparent(),
    percentage: dsl.primitive.percentage(85),
  },
);

export default [
  utility(
    "tabs",
    { "--tabs-number-of-tabs": dsl.match.bare.integer() },
    "flex",
    "flex-wrap",
    {
      "column-gap": dsl.spacing("2"),

      $: {
        ["& > *"]: {
          display: "contents",
        },

        ["& > details > summary, & > * > label, & > * > :first-child"]: [
          "relative",
          "z-20",
          "order-1",
          "cursor-pointer",
          "p-2",
          "tracking-wide",
          {
            color: dsl.cssvar("--tabs-text-color"),
          },
        ],

        ["& > details::details-content, & > * > :not(summary, label):last-child"]:
          ["order-3", "hidden", "w-full"],

        ["& > details:not([open]) > summary:hover, & > *:not(*:has(input:checked), .active) > label:hover, & > *:not(*:has(input:checked), .active) > :first-child:hover"]:
          {
            "border-width": dsl.cssvar("--tabs-hover-border-width"),
            "border-style": dsl.cssvar("--tabs-hover-border-style"),
            "border-color": dsl.cssvar("--tabs-hover-border-color"),
            "font-weight": dsl.cssvar("--tabs-hover-font-weight"),
            color: dsl.cssvar("--tabs-hover-text-color"),
          },

        ["& > details[open] > summary, & > *:has(input:checked) > label, & > *:has(input:checked) > :first-child, & > *.active > :first-child"]:
          {
            "border-width": dsl.cssvar("--tabs-active-border-width"),
            "border-style": dsl.cssvar("--tabs-active-border-style"),
            "border-color": dsl.cssvar("--tabs-active-border-color"),
            "font-weight": dsl.cssvar("--tabs-active-font-weight"),
            color: dsl.cssvar("--tabs-active-text-color"),
          },

        ["& > details[open]::details-content, & > *:has(input:checked) > :last-child, & > *.active > :last-child"]:
          {
            display: "block",
          },

        ['& input[type="radio"]']: "sr-only",

        ["&::before"]: [
          {
            content: '""',
          },
          "relative",
          "z-10",
          "order-2",
          "-mt-0.5",
          "mb-4",
          "h-0.5",
          "w-full",
          {
            "border-style": dsl.cssvar("--tabs-divider-border-style"),
            "border-color": dsl.cssvar("--tabs-divider-border-color"),
            "border-width": dsl.cssvar("--tabs-divider-border-width"),
          },
        ],
      },
    },
  ),

  component_deprecated("tabs-style", {
    variants: {
      underline: {
        "--text-color": tone700Mixed50,
        "--hover-border-width": dsl.cssv`0 0 ${dsl.spacing("0.5")} 0`,
        "--hover-border-style": "solid",
        "--hover-border-color": tone700Mixed50,
        "--hover-font-weight": "normal",
        "--hover-text-color": tone700Mixed35,
        "--active-border-width": dsl.cssv`0 0 ${dsl.spacing("0.5")} 0`,
        "--active-border-style": "solid",
        "--active-border-color": dsl.cssvar("--tone-700"),
        "--active-font-weight": "bold",
        "--active-text-color": dsl.cssvar("--tone-700"),
        "--divider-border-width": dsl.cssv`0 0 ${dsl.spacing("0.5")} 0`,
        "--divider-border-style": "solid",
        "--divider-border-color": dividerMixed85,
      },
    },
    styles: {
      $: {
        ["&, *"]: {
          "--tabs-text-color": dsl.match.variable("--text-color"),
          "--tabs-hover-border-width": dsl.match.variable(
            "--hover-border-width",
          ),
          "--tabs-hover-border-style": dsl.match.variable(
            "--hover-border-style",
          ),
          "--tabs-hover-border-color": dsl.match.variable(
            "--hover-border-color",
          ),
          "--tabs-hover-font-weight": dsl.match.variable("--hover-font-weight"),
          "--tabs-hover-text-color": dsl.match.variable("--hover-text-color"),
          "--tabs-active-border-width": dsl.match.variable(
            "--active-border-width",
          ),
          "--tabs-active-border-style": dsl.match.variable(
            "--active-border-style",
          ),
          "--tabs-active-border-color": dsl.match.variable(
            "--active-border-color",
          ),
          "--tabs-active-font-weight": dsl.match.variable(
            "--active-font-weight",
          ),
          "--tabs-active-text-color": dsl.match.variable("--active-text-color"),

          "--tabs-divider-border-width": dsl.match.variable(
            "--divider-border-width",
          ),
          "--tabs-divider-border-style": dsl.match.variable(
            "--divider-border-style",
          ),
          "--tabs-divider-border-color": dsl.match.variable(
            "--divider-border-color",
          ),
        },
      },
    },
  }),
];
