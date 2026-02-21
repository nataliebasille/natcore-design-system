import { dsl, type ThemeConstruct } from "@nataliebasille/natcore-css-engine";

export function themeConstructToDsl(themeConstruct: ThemeConstruct) {
  return dsl.atRule("theme", dsl.styleList(themeConstruct.properties));
}
