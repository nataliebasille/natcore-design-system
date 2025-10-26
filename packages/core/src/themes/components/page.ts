/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {  PluginAPI } from "../helpers.ts";

export default (theme: PluginAPI["theme"]) => ({
  ".page-container": {
    width: theme("width.screen")!,
    height: theme("height.screen")!,
    overflow: "hidden",
    background: theme("colors.gray.100")!,

    ".sidebar": {
      position: "fixed",
      top: 0,
      bottom: 0,
      left: 0,
      width: theme("width.1/3")!,

      "+ .content": {
        position: "fixed",
        top: 0,
        bottom: 0,
        right: 0,
        width: theme("width.2/3")!,
      },
    },

    [`@media(min-width: ${theme("screens.md")})`]: {},
  },
});
