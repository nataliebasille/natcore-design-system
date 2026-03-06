import { dsl } from "@nataliebasille/natcore-css-engine";
import { colorKey, currentOrDefaultColor } from "../../../shared/colors";

export default [
  dsl.styleRule(dsl.select.element("label"), "flex", "flex-col", {
    $: {
      [`> *:not(input, select, textarea)`]: [
        "text-sm",
        "font-medium",
        "text-gray-500",
      ],
    },
  }),

  dsl.styleRule(
    dsl.select.list("input", "select", "textarea"),
    "appearance-none",
    "border-solid",
    "border-1",
    "rounded-md",
    {
      "background-color": currentOrDefaultColor(
        { role: "base", shade: 50 },
        "surface",
      ),
      color: currentOrDefaultColor({ role: "text", shade: 50 }, "surface"),
      "border-color": currentOrDefaultColor(
        { role: "base", shade: 200 },
        "surface",
      ),
      padding: `${dsl.primitive.length.em(0.5)} ${dsl.primitive.length.em(2)} ${dsl.primitive.length.em(0.5)} ${dsl.primitive.length.em(1)}`,
      "background-position": `right ${dsl.primitive.length.em(0.5)} center`,
      "background-repeat": "no-repeat",
      "background-size": `${dsl.primitive.length.em(1)} ${dsl.primitive.length.em(1)}`,
    },
  ),

  dsl.styleRule(dsl.select.element("select"), {
    "background-image": dsl.cssvar(
      "--select-chevron",
      dsl.cssvar("--select-chevron-surface"),
    ),
  }),
];
