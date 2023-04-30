import { type PluginAPI } from "tailwindcss/types/config";
import button from "./button";
import card from "./card";
import code from "./code";
import divider from "./divider";
import list from "./list";
import layer from "./layer";
import radioGroup from "./radio-group";
import forms from "./forms";

export default (theme: PluginAPI["theme"]) => {
  return {
    ...button(theme),
    ...card(theme),
    ...code(theme),
    ...divider(theme),
    ...forms(theme),
    ...layer(theme),
    ...list(theme),
    ...radioGroup(theme),
  } as const;
};
