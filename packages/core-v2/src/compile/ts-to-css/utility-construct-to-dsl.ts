import {
  dsl,
  stylesheetVisitorBuilder,
  type UtilityConstruct,
} from "@nataliebasille/natcore-css-engine";

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

  return dsl.atRule(
    "utility",
    `${utilityConstruct.name}${isDynamic ? `-*` : ""}`,
    ...utilityConstruct.styles,
  );
}
