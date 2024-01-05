/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type PluginAPI } from "tailwindcss/types/config";

export default (theme: PluginAPI["theme"]) => ({
  code: {
    display: "block",
    whiteSpace: "pre",
    backgroundColor: theme("colors.slate.800")!,
    color: theme("colors.white")!,
    padding: theme("spacing.4")!,
    borderRadius: theme("borderRadius.DEFAULT")!,
    width: "100%",
    overflow: "hidden",
    overflowX: "auto",
    fontFamily:
      "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",
    textWrap: "balance",
    "&.inline, &.inline-block, &.inline-flex, &.inline-grid": {
      width: "auto",
      padding: `0 ${theme("spacing.2")}`,
      verticalAlign: "bottom",
    },
  },
});
