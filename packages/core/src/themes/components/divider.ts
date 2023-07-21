import { type PluginAPI } from "tailwindcss/types/config";

export default (theme: PluginAPI["theme"]) => ({
  ".divider": {
    display: "flex",
    alignItems: "center",
    alignSelf: "stretch",
    margin: `${theme("spacing.4")!} 0`,
    letterSpacing: theme("letterSpacing.wide")!,
    color: theme("colors.slate.500")!,
    fontWeight: theme("fontWeight.bold")!,

    "&::before, &::after": {
      content: '""',
      flex: "1",
      height: "1px",
      backgroundColor: theme("colors.gray.400")!,
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: `0 ${theme("spacing.4")!}`,
    letterSpacing: theme("letterSpacing.wide")!,
    color: theme("colors.slate.500")!,
    fontWeight: theme("fontWeight.bold")!,

    "&::before, &::after": {
      content: '""',
      flex: "1",
      width: "1px",
      backgroundColor: theme("colors.gray.400")!,
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
