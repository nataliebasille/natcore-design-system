import {
  dsl,
  stylesheetVisitorBuilder,
  type UtilityConstruct,
} from "@nataliebasille/css-engine";
import { themeConstructToDsl } from "./theme-construct-to-dsl.ts";

export function utilityConstructToDsl(utilityConstruct: UtilityConstruct) {
  let isDynamic = false;

  stylesheetVisitorBuilder()
    .on("match-value", (ast) => {
      isDynamic = true;
      return ast;
    })
    .on("match-modifier", (ast) => {
      isDynamic = true;
      return ast;
    })
    .visit(utilityConstruct.styles);

  return [
    ...(utilityConstruct.theme ?
      [
        themeConstructToDsl({
          mode: "inline",
          ...utilityConstruct.theme,
        }),
      ]
    : []),
    dsl.atRule(
      "utility",
      `${utilityConstruct.name}${isDynamic ? `-*` : ""}`,
      ...utilityConstruct.styles,
    ),
  ];
}
