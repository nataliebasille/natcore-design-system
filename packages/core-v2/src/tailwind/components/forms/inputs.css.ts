import { dsl } from "@nataliebasille/css-engine";
import { currentOrDefaultColor } from "../../../shared/colors.ts";
import { paddingBlock, paddingInline } from "../../../shared/inputs.ts";

export default dsl.layer.base(
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
    dsl.select.list(
      dsl.select.element("input"),
      dsl.select.element("select"),
      dsl.select.element("textarea"),
    ),
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
      "padding-inline": paddingInline,
      "padding-block": paddingBlock,
    },
  ),
);
