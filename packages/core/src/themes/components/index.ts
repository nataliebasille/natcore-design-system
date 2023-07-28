import { type PluginAPI } from "tailwindcss/types/config";
import button from "./button";
import card from "./card";
import code from "./code";
import divider from "./divider";
import forms from "./forms";
import layer from "./layer";
import list from "./list";
import radioGroup from "./radio-group";
import tabs from "./tabs";

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
    ...tabs(theme),
  } as const;
};
