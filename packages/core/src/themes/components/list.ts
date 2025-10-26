/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {  PluginAPI } from "../helpers.ts";
import { createVariants } from "../colors";

const listVariants = createVariants("list");
export default (theme: PluginAPI["theme"]) => ({
  ".list": {
    ...listVariants,
    display: "flex",
    flexDirection: "column",
    gap: theme("spacing.2")!,
    padding: "0",
    margin: "0",
    listStyle: "none",

    "> .list-item": {
      display: "block",
      padding: theme("spacing.2")!,
      margin: "0",
      cursor: "pointer",
      width: theme("width.full")!,
      borderRadius: theme("borderRadius.lg")!,
      lineHeight: theme("lineHeight.tight")!,
    },

    "&:not(.list-disc):not(.list-decimal)": {
      "> .list-item": {
        "&:hover,&:focus": {
          background: listVariants("background-color-hover"),
          color: listVariants("background-color-hover-text"),
        },

        "&.active": {
          backgroundColor: listVariants("base"),
          color: listVariants("base-text"),

          "&:hover,&:focus": {
            backgroundColor: listVariants("base"),
            color: listVariants("base-text"),
          },
        },
      },
    },

    "&.list-disc, &.list-decimal": {
      ".list-item": {
        "&::before": {
          content: '"•"',
          display: "inline-block",
          fontSize: "1.875rem",
          paddingRight: "0.5rem",
          marginLeft: "-20px",
          width: "20px",
          height: "20px",
          position: "relative",
          top: "-12px",
          verticalAlign: "top",
        },

        marginLeft: "20px",
        padding: "0",
        paddingRight: "20px",
        lineHeight: theme("lineHeight.tight")!,
        cursor: "inherit",

        "&:hover,&:focus": {
          background: "inherit",
          color: "inherit",
        },
      },
    },

    "&.list-decimal": {
      counterReset: "list-counter",

      ".list-item": {
        counterIncrement: "list-counter",
        "&::before": {
          content: 'counter(list-counter) "."',
          fontSize: "1rem",
          top: "0px",
        },
      },
    },
  },
});
