import { component, dsl, utility } from "@nataliebasille/natcore-css-engine";

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
    { "--number-of-tabs": dsl.match.bare.integer() },
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
            color: dsl.cssvar("--tab-text-color"),
          },
        ],

        ["& > details::details-content, & > * > :not(summary, label):last-child"]:
          ["order-3", "hidden", "w-full"],

        ["& > details:not([open]) > summary:hover, & > *:not(*:has(input:checked), .active) > label:hover, & > *:not(*:has(input:checked), .active) > :first-child:hover"]:
          {
            "border-width": dsl.cssvar("--tab-hover-border-width"),
            "border-style": dsl.cssvar("--tab-hover-border-style"),
            "border-color": dsl.cssvar("--tab-hover-border-color"),
            "font-weight": dsl.cssvar("--tab-hover-font-weight"),
            color: dsl.cssvar("--tab-hover-text-color"),
          },

        ["& > details[open] > summary, & > *:has(input:checked) > label, & > *:has(input:checked) > :first-child, & > *.active > :first-child"]:
          {
            "border-width": dsl.cssvar("--tab-active-border-width"),
            "border-style": dsl.cssvar("--tab-active-border-style"),
            "border-color": dsl.cssvar("--tab-active-border-color"),
            "font-weight": dsl.cssvar("--tab-active-font-weight"),
            color: dsl.cssvar("--tab-active-text-color"),
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
            "border-style": dsl.cssvar("--tab-divider-border-style"),
            "border-color": dsl.cssvar("--tab-divider-border-color"),
            "border-width": dsl.cssvar("--tab-divider-border-width"),
          },
        ],
      },
    },
  ),

  component("tabs-style", {
    variants: {
      underline: {
        "--tab-text-color": tone700Mixed50,
        "--tab-hover-border-width": dsl.cssv`0 0 ${dsl.spacing("0.5")} 0`,
        "--tab-hover-border-style": "solid",
        "--tab-hover-border-color": tone700Mixed50,
        "--tab-hover-font-weight": "normal",
        "--tab-hover-text-color": tone700Mixed35,
        "--tab-active-border-width": dsl.cssv`0 0 ${dsl.spacing("0.5")} 0`,
        "--tab-active-border-style": "solid",
        "--tab-active-border-color": dsl.cssvar("--tone-700"),
        "--tab-active-font-weight": "bold",
        "--tab-active-text-color": dsl.cssvar("--tone-700"),
        "--tab-divider-border-width": dsl.cssv`0 0 ${dsl.spacing("0.5")} 0`,
        "--tab-divider-border-style": "solid",
        "--tab-divider-border-color": dividerMixed85,
      },
    },
    styles: {
      $: {
        ["&, *"]: {
          "--tab-text-color": dsl.match.variable("--tab-text-color"),
          "--tab-hover-border-width": dsl.match.variable(
            "--tab-hover-border-width",
          ),
          "--tab-hover-border-style": dsl.match.variable(
            "--tab-hover-border-style",
          ),
          "--tab-hover-border-color": dsl.match.variable(
            "--tab-hover-border-color",
          ),
          "--tab-hover-font-weight": dsl.match.variable(
            "--tab-hover-font-weight",
          ),
          "--tab-hover-text-color": dsl.match.variable(
            "--tab-hover-text-color",
          ),
          "--tab-active-border-width": dsl.match.variable(
            "--tab-active-border-width",
          ),
          "--tab-active-border-style": dsl.match.variable(
            "--tab-active-border-style",
          ),
          "--tab-active-border-color": dsl.match.variable(
            "--tab-active-border-color",
          ),
          "--tab-active-font-weight": dsl.match.variable(
            "--tab-active-font-weight",
          ),
          "--tab-active-text-color": dsl.match.variable(
            "--tab-active-text-color",
          ),

          "--tab-divider-border-width": dsl.match.variable(
            "--tab-divider-border-width",
          ),
          "--tab-divider-border-style": dsl.match.variable(
            "--tab-divider-border-style",
          ),
          "--tab-divider-border-color": dsl.match.variable(
            "--tab-divider-border-color",
          ),
        },
      },
    },
  }),
];
