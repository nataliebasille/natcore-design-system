import { type PluginAPI } from "tailwindcss/types/config";
import button from "./button.ts";
import card from "./card.ts";
import code from "./code.ts";
import divider from "./divider.ts";
import formControl from "./form-control.ts";
import forms from "./forms.ts";
import layer from "./layer.ts";
import list from "./list.ts";
import progress from "./progress.ts";
import radioGroup from "./radio-group.ts";
import tabs from "./tabs.ts";
import toggle from "./toggle.ts";

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
