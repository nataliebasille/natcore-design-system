import {
  dsl,
  stylesheetVisitorBuilder,
  type StylePropertyValue,
  type ThemeConstruct,
} from "@nataliebasille/css-engine";

export function themeConstructToDsl(themeConstruct: ThemeConstruct) {
  const themeModePrelude = getThemeMode(themeConstruct);
  return dsl.atRule(
    "theme",
    themeModePrelude ?? null,
    dsl.styleList(themeConstruct.properties),
  );
}

function getThemeMode(themeConstruct: ThemeConstruct) {
  if (themeConstruct.mode) {
    return themeConstruct.mode;
  }

  const containsCssVar = Object.values(themeConstruct.properties).some(
    (value) => hasCssVarOrVarString(value),
  );

  return containsCssVar ? "inline" : undefined;
}

function hasCssVarOrVarString(
  value: StylePropertyValue | StylePropertyValue[] | undefined,
): boolean {
  if (!value) {
    return false;
  }

  if (containsVarFunctionString(value)) {
    return true;
  }

  let hasCssVar = false;
  stylesheetVisitorBuilder()
    .on("css-var", (ast) => {
      hasCssVar = true;
      return ast;
    })
    .visit(value);

  return hasCssVar;
}

function containsVarFunctionString(
  value: StylePropertyValue | StylePropertyValue[],
): boolean {
  if (typeof value === "string") {
    return value.includes("var(");
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsVarFunctionString(item));
  }

  if (typeof value !== "object" || value === null) {
    return false;
  }

  return Object.values(value).some((item) =>
    containsVarFunctionString(item as StylePropertyValue),
  );
}
