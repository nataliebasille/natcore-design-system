import { component, dsl } from "@nataliebasille/natcore-css-engine";
import { currentBaseColor } from "../../shared/colors";

const TOGGLE_SIZE_MD = 1.75;
const PADDING_MD = 0.125;
const TOGGLE_SIZE_LG = 3;
const PADDING_LG = 0.3;

export default component("toggle", {
  themeable: "primary",
  variants: {
    default: {
      "--toggle-border": currentBaseColor(300),
      "--toggle-bg": currentBaseColor(100),
      "--toggle-hover": currentBaseColor(200),
      "--toggle-active": currentBaseColor(700),
    },
  },
  styles: [
    "inline-block",
    "items-center",
    "cursor-pointer",
    "rounded-full",
    {
      "box-sizing": "content-box",
      border: dsl.cssv`1px solid ${dsl.cssvar("--toggle-border")}`,
      "background-color": dsl.colorMix(
        "srgb",
        {
          color: dsl.cssvar("--toggle-bg"),
          percentage: dsl.primitive.percentage(20),
        },
        { color: dsl.primitive.color.transparent() },
      ),
      width: `${TOGGLE_SIZE_MD * 2}rem`,
      height: `${TOGGLE_SIZE_MD}rem`,
      padding: `${PADDING_MD}rem`,
      transition: "all 150ms ease-in-out",

      $: {
        [dsl.parent(":has(input[type='checkbox']:checked)")]: {
          "background-color": dsl.cssvar("--toggle-bg"),
        },

        [dsl.parent(':not(:has(input[type="checkbox"]:checked)):hover')]: {
          "background-color": dsl.colorMix(
            "srgb",
            {
              color: dsl.cssvar("--toggle-hover"),
              percentage: dsl.primitive.percentage(20),
            },
            { color: dsl.primitive.color.transparent() },
          ),
        },

        ["> input[type='checkbox']"]: {
          width: `${TOGGLE_SIZE_MD}rem`,
          height: `${TOGGLE_SIZE_MD}rem`,
          "border-radius": dsl.cssvar("--radius-full"),
          "min-width": "0",
          padding: "0",
          cursor: "inherit",
          "background-color": dsl.colorMix(
            "srgb",
            {
              color: dsl.cssvar("--toggle-bg"),
              percentage: dsl.primitive.percentage(20),
            },
            { color: dsl.primitive.color.transparent() },
          ),
          border: "none",
          transition: "all 150ms ease-in-out",

          $: {
            [dsl.parent(":hover")]: {
              "background-color": dsl.colorMix(
                "srgb",
                {
                  color: dsl.cssvar("--toggle-hover"),
                  percentage: dsl.primitive.percentage(50),
                },
                { color: dsl.primitive.color.transparent() },
              ),
            },

            [dsl.parent(":checked")]: {
              transform: "translate(100%, 0)",
              "background-color": dsl.cssvar("--toggle-active"),
            },
          },
        },

        [dsl.parent(".toggle-lg")]: {
          width: `${TOGGLE_SIZE_MD * 2}rem`,
          height: `${TOGGLE_SIZE_MD}rem`,
          padding: `${PADDING_LG}rem`,

          $: {
            ["> input[type='checkbox']"]: {
              width: `${TOGGLE_SIZE_LG}rem`,
              height: `${TOGGLE_SIZE_LG}rem`,
            },
          },
        },
      },
    },
  ],
});
