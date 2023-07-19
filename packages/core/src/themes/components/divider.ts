import { type PluginAPI } from "tailwindcss/types/config";

export default (theme: PluginAPI["theme"]) => ({
  ".divider": {
    display: "flex",
    alignItems: "center",
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
});
