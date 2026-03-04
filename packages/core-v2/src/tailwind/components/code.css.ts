import { dsl, utility } from "@nataliebasille/natcore-css-engine";

const inlineCode = dsl.list(
  dsl.parent(dsl.cls("inline")),
  dsl.parent(dsl.cls("inline-block")),
  dsl.parent(dsl.cls("inline-flex")),
  dsl.parent(dsl.cls("inline-grid")),
);

export default [
  utility(
    "code",
    "block",
    "w-full",
    "overflow-hidden",
    "overflow-x-auto",
    "rounded-md",
    "whitespace-pre",
    "text-balance",
    {
      "background-color": dsl.cssvar("--color-tone-900"),
      color: dsl.cssvar("--color-on-tone-900"),
      padding: `${dsl.spacing("4")}`,
      "font-family":
        "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",

      $: {
        [inlineCode]: {
          width: "auto",
          padding: `0 ${dsl.spacing("2")}`,
          "vertical-align": "bottom",
        },
      },
    },
  ),
  dsl.styleRule(dsl.element("code")),
];
