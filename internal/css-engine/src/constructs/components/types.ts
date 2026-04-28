import type { Palette } from "../../dsl/ast/cssvalue/color";
import type {
  MatchValueAst,
  TwArbitraryCandidate,
  TwBareCandidate,
} from "../../dsl/ast/cssvalue/match-value";
import type {
  StylePropertyValue,
  StyleRuleBodyBuilder,
} from "../../dsl/ast/style-rule";
import type { CssDataType, Selector } from "../../dsl/public";
import type { ThemeProperties } from "../theme";

export type ComponentSlot = {
  selector: "data-attr" | "class" | Selector;
};

export type ComponentState = {
  name: string;
  defaultTheme?: Palette;
  vars: Record<`--${string}`, VarsProperty>;
  variants: {
    values: Record<string, ThemeProperties>;
    selection:
      | { mode: "required" }
      | { mode: "optional" }
      | { mode: "default"; key: string };
  };
  slots: Record<string, ComponentSlot>;
  utilities: Record<string, StyleRuleBodyBuilder[]>;
  guards: Record<string, Selector>;
  body: StyleRuleBodyBuilder[];
  parent?: ComponentState;
};

export type ControlledVar = {
  default: StylePropertyValue | StylePropertyValue[];
  candidates: (
    | Record<string, StylePropertyValue | StylePropertyValue[]>
    | MatchValueAst<CssDataType>
  )[];
};

export type VarsProperty = StylePropertyValue | ControlledVar;

export function isControlledVar(
  varOrValue: VarsProperty | StylePropertyValue[],
): varOrValue is ControlledVar {
  return (
    typeof varOrValue === "object" &&
    varOrValue !== null &&
    "default" in varOrValue &&
    "candidates" in varOrValue
  );
}
