import { type PluginAPI } from "tailwindcss/types/config";
import { createVariants } from "../colors";

const dividerVarients = createVariants("divider", { defaultColor: "surface" });
export default (theme: PluginAPI["theme"]) => ({
  ".divider": {
    ...dividerVarients,
    display: "flex",
    alignItems: "center",
    alignSelf: "stretch",
    margin: `${theme("spacing.4")!} 0`,
    letterSpacing: theme("letterSpacing.wide")!,
    color: "var(--divider-base)",
    fontWeight: theme("fontWeight.bold")!,

    "&::before, &::after": {
      content: '""',
      flex: "1",
      height: "1px",
      backgroundColor: "var(--divider-base)",
    },

    "&:empty::after": {
      marginLeft: "0",
    },

    "&:empty::before": {
      marginRight: "0",
    },

    "&::before": {
      marginRight: theme("spacing.2")!,
    },

    "&::after": {
      marginLeft: theme("spacing.2")!,
    },
  },

  ".divider-v": {
    ...dividerVarients,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: `0 ${theme("spacing.4")!}`,
    letterSpacing: theme("letterSpacing.wide")!,
    color: "var(--divider-base)",
    fontWeight: theme("fontWeight.bold")!,

    "&::before, &::after": {
      content: '""',
      flex: "1",
      width: "1px",
      backgroundColor: "var(--divider-base)",
    },

    "&:empty::after": {
      marginTop: "0",
    },

    "&:empty::before": {
      marginBottom: "0",
    },

    "&::before": {
      marginBottom: theme("spacing.2")!,
    },

    "&::after": {
      marginTop: theme("spacing.2")!,
    },
  },
});
