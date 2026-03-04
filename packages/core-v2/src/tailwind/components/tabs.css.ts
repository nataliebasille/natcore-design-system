import { component, dsl } from "@nataliebasille/natcore-css-engine";
import { currentBaseColor } from "../../shared/colors";

export default component("tabs", {
  themeable: "surface",
  variants: {
    default: {
      "--tabs-active": currentBaseColor(700),
    },
  },
  styles: [
    "flex",
    "items-center",
    "flex-wrap",
    "gap-y-2",
    {
      $: {
        ["> .tab"]: {
          padding: `${dsl.spacing("2")} ${dsl.spacing("4")}`,
          color: "currentColor",
          opacity: "0.75",
          cursor: "pointer",
        },

        ["input[type=radio]"]: {
          display: "none",
        },

        [".tab-content"]: {
          order: "100",
          width: "100%",
        },

        ["> input[type=radio]:not(:checked) + .tab + .tab-content"]: {
          display: "none",
        },

        ["> input[type=radio]:checked + .tab"]: {
          opacity: "1",
          "font-weight": dsl.cssvar("--font-weight-medium"),
          "border-bottom-width": "2px",
          "border-bottom-color": dsl.cssvar("--tabs-active"),
          color: dsl.cssvar("--tabs-active"),
        },

        ["> input[type=radio]:disabled + .tab"]: {
          cursor: "not-allowed",
          opacity: "0.5",
        },
      },
    },
  ],
});
