import { dsl } from "@nataliebasille/natcore-css-engine";
import { currentOrDefaultColor } from "../../../shared/colors.ts";

const CHEVRON_SIZE = dsl.primitive.length.em(1);
export default dsl.layer.base(
  dsl.styleRule(dsl.select.element("select"), {
    appearance: "none",
    "background-image": dsl.cssvar(
      "--select-chevron",
      dsl.cssvar("--select-chevron-surface"),
    ),
    "background-position": `right ${CHEVRON_SIZE} center`,
    "background-repeat": "no-repeat",
    "background-size": `${CHEVRON_SIZE} ${CHEVRON_SIZE}`,
  }),

  dsl.supports(
    {
      appearance: "base-select",
    },

    dsl.styleRule("select", {
      appearance: "base-select",
      "background-image": "none",
    }),

    dsl.styleRule("::picker(select)", {
      appearance: "base-select",
      border: "none",
      color: currentOrDefaultColor({ role: "text", shade: 100 }, "surface"),
      "background-color": currentOrDefaultColor(
        { role: "base", shade: 100, opacity: 0.1 },
        "surface",
      ),
    }),

    dsl.styleRule("::picker-icon", {
      content: dsl.cssvar(
        "--select-chevron",
        dsl.cssvar("--select-chevron-surface"),
      ),
      "font-size": CHEVRON_SIZE,
      width: CHEVRON_SIZE,
    }),
  ),
);
