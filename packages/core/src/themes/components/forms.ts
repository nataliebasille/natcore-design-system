/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type PluginAPI } from "tailwindcss/types/config";
import { createVariants } from "../colors.ts";

const formVariants = createVariants("forms", { defaultColor: "surface" });
export default (theme: PluginAPI["theme"]) => ({
  label: {
    ...formVariants,

    display: "flex",
    flexDirection: "column",

    "> *:not(input, select, textarea)": {
      fontSize: theme("fontSize.sm")!,
      fontWeight: theme("fontWeight.medium")!,
      color: theme("colors.gray.500")!,
    },
  },
  "input, select, textarea": {
    ...formVariants,

    appearance: "none",
    backgroundColor: formVariants("background-color"),
    color: formVariants("background-color-text"),
    borderColor: formVariants("border"),
    borderStyle: "solid",
    borderWidth: "1px",
    borderRadius: theme("borderRadius.md")!,
    padding: `.5em 2em .5em 1em`,
    backgroundPosition: "right 0.5em center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "1em 1em",
  },

  select: {
    backgroundImage:
      'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /%3E%3C/svg%3E\')',
  },
});
