import type { Palette } from "../../dsl/ast/cssvalue/color";
import type {
  MatchValueAst,
  TwArbitraryCandidate,
  TwBareCandidate,
} from "../../dsl/ast/cssvalue/match-value";
import type {
  StyleListAst_WithMetadata,
  StylePropertyValue,
  StyleRuleAst_WithMetadata,
  StyleRuleBodyBuilder,
} from "../../dsl/ast/style-rule";
import type { AtRuleAst } from "../../dsl/ast/at-rule";
import type { calc } from "../../dsl/ast/cssvalue/css-functions";
import type { CssDataType, Selector } from "../../dsl/public";
import type { ThemeProperties } from "../theme";

/** A component body after normalization: style lists, nested rules, at-rules. */
export type ComponentBodyAst =
  | StyleListAst_WithMetadata
  | StyleRuleAst_WithMetadata
  | AtRuleAst;

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
      | { mode: "optional"; default?: string }
      | { mode: "default"; key: string };
  };
  slots: Record<string, ComponentSlot>;
  utilities: Record<string, StyleRuleBodyBuilder[]>;
  guards: Record<string, Selector>;
  body: StyleRuleBodyBuilder[];
  /** Selectors that get the component (or one of its variants) applied. */
  appliesTo?: ComponentApplyTo[];
  /** Custom properties registered with @property (see `.property()`). */
  properties?: Record<`--${string}`, RegisteredProperty>;
  parent?: ComponentState;
};

export type ComponentApplyTo = {
  selector: Selector;
  variant?: string;
};

/** An @property registration: its value syntax, inheritance, and initial value. */
export type RegisteredProperty = {
  /** One syntax, or several alternatives (rendered as `<a> | <b>`). */
  syntax: PropertySyntax | PropertySyntaxComponent[];
  inherits: boolean;
  initialValue: StylePropertyValue;
};

/** The data types an @property syntax can name. */
export type PropertySyntaxDataType =
  | "length"
  | "number"
  | "percentage"
  | "length-percentage"
  | "color"
  | "image"
  | "url"
  | "integer"
  | "angle"
  | "time"
  | "resolution"
  | "transform-function"
  | "custom-ident"
  | "string"
  | "transform-list";

/** A data type, or a space- (`+`) or comma-separated (`#`) list of one. */
export type PropertySyntaxComponent =
  | `<${PropertySyntaxDataType}>`
  | `<${Exclude<PropertySyntaxDataType, "transform-list">}>${"+" | "#"}`;

/** A single syntax component, or `*` for any value. */
export type PropertySyntax = "*" | PropertySyntaxComponent;

/**
 * A `calc()` around a matcher, e.g. `calc(--value(integer) * 1%)`, so a bare
 * value can be scaled into a unit.
 */
export type ControlledExpression = ReturnType<typeof calc>;

/** A controlled var candidate that looks up the class's value rather than naming presets. */
export type ControlledLookup =
  | MatchValueAst<CssDataType>
  | ControlledExpression;

export type ControlledVar = {
  default: StylePropertyValue | StylePropertyValue[];
  candidates: (
    | Record<string, StylePropertyValue | StylePropertyValue[]>
    | ControlledLookup
  )[];
};

export type VarsProperty = StylePropertyValue | ControlledVar;

/** Whether a controlled var candidate is a lookup (a matcher, or a calc around one) rather than a preset map. */
export function isControlledLookup(
  candidate: ControlledVar["candidates"][number],
): candidate is ControlledLookup {
  return (
    ("$ast" in candidate && candidate.$ast === "match-value") ||
    "$function" in candidate
  );
}

/** Whether a controlled var candidate is a matcher on its own. */
export function isMatchValueCandidate(
  candidate: ControlledVar["candidates"][number],
): candidate is MatchValueAst<CssDataType> {
  return "$ast" in candidate && candidate.$ast === "match-value";
}

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
