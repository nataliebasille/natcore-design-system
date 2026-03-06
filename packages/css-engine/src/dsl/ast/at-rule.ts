/**
 * DSL layer - provides at-rule wrappers with strong typing
 */

import type { AstNode } from "../visitor/visitor-builder.types.ts";
import type {
  StyleRuleBodyBuilder,
  StyleRuleAst,
  StyleListBuilder,
  StyleListAst,
  TailwindClassAst,
} from "./style-rule.ts";
import { styleRule } from "./style-rule.ts";
import { select } from "./selector.ts";

/**
 * Reusable type for at-rule content - includes all possible rule types
 */
export type AtRuleContent =
  | StyleRuleAst
  | StyleListAst
  | AtRuleAst
  | TailwindClassAst;

/**
 * Viewport constraint types
 */
export type ViewportConstraint =
  | "min-width"
  | "max-width"
  | "min-height"
  | "max-height"
  | "width"
  | "height"
  | "aspect-ratio"
  | "orientation";

/**
 * Viewport constraint value map - strongly typed values for each constraint
 */
export type ViewportConstraintValues = {
  "min-width": string;
  "max-width": string;
  "min-height": string;
  "max-height": string;
  width: string;
  height: string;
  "aspect-ratio": string;
  orientation: "portrait" | "landscape";
};

/**
 * Query types for generic queries
 */
export type QueryType =
  | "media-type"
  | "container-type"
  | "container-name"
  | "print"
  | "screen"
  | "custom";

/**
 * Environment preference types
 */
export type EnvironmentPreference =
  | "color-scheme"
  | "contrast"
  | "reduced-motion"
  | "reduced-transparency"
  | "reduced-data"
  | "forced-colors"
  | "pointer"
  | "hover"
  | "inverted-colors";

/**
 * Environment preference value map - strongly typed values for each preference
 */
export type EnvironmentPreferenceValues = {
  "color-scheme": "light" | "dark" | "no-preference";
  contrast: "high" | "low" | "no-preference";
  "reduced-motion": "reduce" | "no-preference";
  "reduced-transparency": "reduce" | "no-preference";
  "reduced-data": "reduce" | "no-preference";
  "forced-colors": "active" | "none";
  pointer: "fine" | "coarse" | "none";
  hover: "hover" | "none";
  "inverted-colors": "inverted" | "none";
};

/**
 * At-rule AST - represents CSS at-rules like @media, @supports, @container, etc.
 */
export type AtRuleAst = AstNode<
  "at-rule",
  {
    name: string;
    prelude: string | null;
    rules: AtRuleContent[];
  }
>;

/**
 * Generic at-rule constructor - with prelude
 */
export function atRule(
  name: string,
  prelude: string | null,
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst;

/**
 * Generic at-rule constructor - without prelude
 */
export function atRule(
  name: string,
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst;

/**
 * Generic at-rule constructor - implementation
 */
export function atRule(
  name: string,
  preludeOrFirstRule?:
    | string
    | null
    | AtRuleAst
    | StyleRuleBodyBuilder
    | StyleListBuilder,
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst {
  // Determine if first argument after name is prelude or first rule
  const hasPrelude =
    typeof preludeOrFirstRule === "string" ||
    preludeOrFirstRule === null ||
    preludeOrFirstRule === undefined;

  const prelude =
    hasPrelude ?
      ((preludeOrFirstRule as string | null | undefined) ?? null)
    : null;

  const allRules =
    hasPrelude ? rules : (
      [
        preludeOrFirstRule as
          | AtRuleAst
          | StyleRuleBodyBuilder
          | StyleListBuilder,
        ...rules,
      ]
    );

  const normalizedRules = allRules.flatMap((rule) => {
    // Preserve explicit AST nodes, including nested at-rules
    if (typeof rule === "object" && rule !== null && "$ast" in rule) {
      return [rule as AtRuleContent];
    }

    // Reuse styleRule body builder normalization for non-AST builder inputs
    return styleRule(select.any(), rule as StyleRuleBodyBuilder)
      .body as AtRuleContent[];
  });

  return {
    $ast: "at-rule",
    name,
    prelude,
    rules: normalizedRules,
  };
}

/**
 * Helper to build media query prelude from viewport constraint
 */
function buildMediaQuery<C extends ViewportConstraint>(
  constraint: C,
  value: ViewportConstraintValues[C],
): string {
  return `(${constraint}: ${value})`;
}

/**
 * Helper to build media query prelude from environment preference
 */
function buildEnvQuery<P extends EnvironmentPreference>(
  preference: P,
  value: EnvironmentPreferenceValues[P],
): string {
  return `(prefers-${preference}: ${value})`;
}

/**
 * Condition builders - create at-rules with proper preludes
 */

/**
 * Media query for viewport constraints
 */
export function media<C extends ViewportConstraint>(
  constraint: C,
  value: ViewportConstraintValues[C],
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst {
  return atRule("media", buildMediaQuery(constraint, value), ...rules);
}

/**
 * Media query for environment preferences
 */
export function mediaEnv<P extends EnvironmentPreference>(
  preference: P,
  value: EnvironmentPreferenceValues[P],
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst {
  return atRule("media", buildEnvQuery(preference, value), ...rules);
}

/**
 * Supports query for feature detection
 */
export function supports(
  property: string,
  value?: string,
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst {
  const prelude = value ? `(${property}: ${value})` : `(${property})`;
  return atRule("supports", prelude, ...rules);
}

/**
 * Container query
 */
export function container(
  query: string,
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst {
  return atRule("container", query, ...rules);
}

/**
 * Layer at-rule
 */
export function layer(
  name: string,
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst {
  return atRule("layer", name, ...rules);
}

/**
 * Legacy condition-based helpers (for backwards compatibility)
 */

/**
 * Viewport condition - creates media query
 */
export function viewport<C extends ViewportConstraint>(
  constraint: C,
  value: ViewportConstraintValues[C],
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst {
  return media(constraint, value, ...rules);
}

/**
 * Environment condition - creates media query with prefers-*
 */
export function env<P extends EnvironmentPreference>(
  preference: P,
  value: EnvironmentPreferenceValues[P],
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst {
  return mediaEnv(preference, value, ...rules);
}

/**
 * Feature condition - creates supports query
 */
export function feature(
  name: string,
  value?: string,
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst {
  return supports(name, value, ...rules);
}

/**
 * Scope condition - creates layer
 */
export function scope(
  name: string,
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst {
  return layer(name, ...rules);
}

/**
 * Query condition - generic at-rule
 */
export function query(
  type: QueryType,
  value: string,
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
): AtRuleAst {
  // Map query types to at-rule names
  const nameMap: Record<QueryType, string> = {
    "media-type": "media",
    "container-type": "container",
    "container-name": "container",
    print: "media",
    screen: "media",
    custom: "media",
  };
  return atRule(nameMap[type], value, ...rules);
}

/**
 * Generic breakpoint helper - creates media query for viewport constraints
 */
export function breakpoint<C extends ViewportConstraint>(
  constraint: C,
  value: ViewportConstraintValues[C],
): (
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
) => AtRuleAst {
  return (...rules) => media(constraint, value, ...rules);
}

/**
 * Convenience breakpoint helpers for common constraints
 */
breakpoint.min = (value: string) => breakpoint("min-width", value);
breakpoint.max = (value: string) => breakpoint("max-width", value);
breakpoint.minHeight = (value: string) => breakpoint("min-height", value);
breakpoint.maxHeight = (value: string) => breakpoint("max-height", value);
breakpoint.orientation = (value: "portrait" | "landscape") =>
  breakpoint("orientation", value);
breakpoint.aspectRatio = (value: string) => breakpoint("aspect-ratio", value);

/**
 * Common environment preference helpers - create media queries with prefers-*
 */
export const prefersDark = (
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
) => mediaEnv("color-scheme", "dark", ...rules);

export const prefersLight = (
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
) => mediaEnv("color-scheme", "light", ...rules);

export const prefersReducedMotion = (
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
) => mediaEnv("reduced-motion", "reduce", ...rules);

export const prefersHighContrast = (
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
) => mediaEnv("contrast", "high", ...rules);

export const supportsHover = (
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
) => mediaEnv("hover", "hover", ...rules);

export const supportsFinePointer = (
  ...rules: (AtRuleAst | StyleRuleBodyBuilder | StyleListBuilder)[]
) => mediaEnv("pointer", "fine", ...rules);
