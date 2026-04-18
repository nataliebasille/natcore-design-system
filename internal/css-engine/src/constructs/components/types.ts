import type { Palette } from "../../dsl/ast/cssvalue/color";
import type {
  TwArbitraryCandidate,
  TwBareCandidate,
} from "../../dsl/ast/cssvalue/match-value";
import type {
  StylePropertyValue,
  StyleRuleBodyBuilder,
} from "../../dsl/ast/style-rule";
import type { ThemeProperties } from "../theme";

export type ComponentState = {
  name: string;
  defaultTheme?: Palette;
  vars: Record<`--${string}`, VarsProperty>;
  variants: Record<string, ThemeProperties>;
  defaultVariant?: string;
  body: StyleRuleBodyBuilder[];
  utilities: Record<string, StyleRuleBodyBuilder[]>;
  parent?: ComponentState;
};

export type ControlledVar = {
  default: StylePropertyValue | StylePropertyValue[];
  candidates: (
    | {
        type: "token";
        token: string;
        value: StylePropertyValue | StylePropertyValue[];
      }
    | {
        type: "arbitrary";
        dataType: TwArbitraryCandidate["dataType"];
      }
    | {
        type: "bare";
        dataType: TwBareCandidate["dataType"];
      }
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
