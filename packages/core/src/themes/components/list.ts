import { type PluginAPI } from "tailwindcss/types/config";
import { createVariants } from "../colors";

export default (theme: PluginAPI["theme"]) => ({
  ".list": {
    ...createVariants("list"),
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
      borderRadius: theme("borderRadius.DEFAULT")!,
      lineHeight: theme("lineHeight.tight")!,

      "&:hover,&:focus": {
        background: "var(--list-background-color-hover)",
        color: "var(--list-background-color-hover-contrast)",
      },

      "&.active": {
        backgroundColor: "var(--list-base)",
        color: "var(--list-base-contrast)",

        "&:hover,&:focus": {
          backgroundColor: "var(--list-base)",
          color: "var(--list-base-contrast)",
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
