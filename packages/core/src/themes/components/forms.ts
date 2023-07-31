import { type PluginAPI } from "tailwindcss/types/config";
import { createVariants } from "../colors";

const variants = createVariants("forms", { defaultColor: "surface" });
export default (theme: PluginAPI["theme"]) => ({
  label: {
    ...variants,

    display: "flex",
    flexDirection: "column",

    "> *:not(input, select, textarea)": {
      fontSize: theme("fontSize.sm")!,
      fontWeight: theme("fontWeight.medium")!,
      color: theme("colors.gray.500")!,
    },
  },
  "input, select, textarea": {
    ...variants,

    appearance: "none",
    backgroundColor: "var(--forms-background-color)",
    color: "var(--forms-background-color-contrast)",
    borderColor: "var(--forms-border)",
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
