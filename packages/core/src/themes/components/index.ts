import { type PluginAPI } from "tailwindcss/types/config";
import button from "./button";
import card from "./card";
import code from "./code";
import divider from "./divider";
import formControl from "./form-control";
import forms from "./forms";
import layer from "./layer";
import list from "./list";
import progress from "./progress";
import radioGroup from "./radio-group";
import tabs from "./tabs";
import toggle from "./toggle";

export default (theme: PluginAPI["theme"]) => {
  return {
    ...button(theme),
    ...card(theme),
    ...code(theme),
    ...divider(theme),
    ...formControl(theme),
    ...forms(theme),
    ...layer(theme),
    ...list(theme),
    ...progress(),
    ...radioGroup(theme),
    ...tabs(theme),
    ...toggle(theme),
  } as const;
};
