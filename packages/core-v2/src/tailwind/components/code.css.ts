import { component_deprecated, dsl, utility } from "@nataliebasille/css-engine";

const inlineCode = dsl.select.list(
  dsl.select.parent(dsl.select.cls("inline")),
  dsl.select.parent(dsl.select.cls("inline-block")),
  dsl.select.parent(dsl.select.cls("inline-flex")),
  dsl.select.parent(dsl.select.cls("inline-grid")),
);

export default [
  component_deprecated("code", {
    styles: [
      "block",
      "w-full",
      "overflow-hidden",
      "overflow-x-auto",
      "rounded-md",
      "whitespace-pre",
      "text-balance",
      {
        "background-color": dsl.adaptive("surface", 50),
        color: dsl.adaptiveText("surface", 50),
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
    ],
  }),
  dsl.styleRule(dsl.select.element("code"), "code"),
];
