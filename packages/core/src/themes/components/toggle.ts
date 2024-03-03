/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type PluginAPI } from "tailwindcss/types/config";
import { createVariants } from "../colors";

const toggleVariants = createVariants("toggle");
const TOGGLE_SIZE_MD = 1.75;
const PADDING_MD = 0.125;

const TOGGLE_SIZE_LG = 3;
const PADDING_LG = 0.3;

export default (theme: PluginAPI["theme"]) => ({
  ".toggle": {
    ...toggleVariants,

    display: "inline-block",
    boxSizing: "content-box",
    border: `1px solid ${toggleVariants("border")}`,
    borderRadius: theme("borderRadius.full")!,
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: "rgb(0 0 0 / .2)",
    width: `${TOGGLE_SIZE_MD * 2}rem`,
    height: `${TOGGLE_SIZE_MD}rem`,
    padding: `${PADDING_MD}rem`,
    transition: "all 150ms ease-in-out",

    "&:has(input[type='checkbox']:checked)": {
      backgroundColor: toggleVariants("background-color"),
    },

    '&:not(:has(input[type="checkbox"]:checked)):hover': {
      backgroundColor: toggleVariants("background-color-hover", 0.2),
    },

    "> input[type='checkbox']": {
      width: `${TOGGLE_SIZE_MD}rem`,
      height: `${TOGGLE_SIZE_MD}rem`,
      borderRadius: theme("borderRadius.full")!,
      minWidth: "0",
      padding: "0",
      cursor: "inherit",
      backgroundColor: "rgb(0 0 0 / .2)",
      border: "none",
      transition: "all 150ms ease-in-out",

      "&:hover": {
        backgroundColor: toggleVariants("background-color-hover", 0.5),
      },

      "&:checked": {
        transform: "translate(100%, 0)",
        backgroundColor: toggleVariants("active"),
      },
    },

    "&.toggle-lg": {
      width: `${TOGGLE_SIZE_MD * 2}rem`,
      height: `${TOGGLE_SIZE_MD}rem`,
      padding: `${PADDING_LG}rem`,

      "> input[type='checkbox']": {
        width: `${TOGGLE_SIZE_LG}rem`,
        height: `${TOGGLE_SIZE_LG}rem`,
      },
    },
  },
});
