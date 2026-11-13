import { PALETTE, type Palette } from "../../dsl/public";
import type { ComponentBuilder } from "../components/component-builder";
import { isControlledVar, type ComponentState } from "../components/types";
import { traverseTopDown } from "../components/utils";

/** Text shown for each option; an option without one shows its value. */
export type OptionLabels<O extends string> = Partial<Record<O, string>>;

export type SelectControl<O extends string = string> = {
  kind: "select";
  options: readonly O[];
  default: O;
  label?: string;
  optionLabels?: OptionLabels<O>;
};

export type TextControl = { kind: "text"; default: string; label?: string };

export type BooleanControl = {
  kind: "boolean";
  default: boolean;
  label?: string;
  /** Text for the `false` state. Defaults to "Off". */
  offLabel?: string;
  /** Text for the `true` state. Defaults to "On". */
  onLabel?: string;
};

export type CustomControl = SelectControl | TextControl | BooleanControl;

/** The object form of `control.select()` and `control.palette()`. */
export type SelectControlConfig<O extends string> = Omit<
  Partial<SelectControl<O>>,
  "kind" | "options"
>;

/** The object form of `control.text()`. */
export type TextControlConfig = Omit<Partial<TextControl>, "kind">;

/** The object form of `control.boolean()`. */
export type BooleanControlConfig = Omit<Partial<BooleanControl>, "kind">;

/** Overrides a control derived from the builder (variant, controlled values). */
export type DerivedControlOverride<V extends string> = {
  label?: string;
  options?: readonly V[];
  default?: V;
  optionLabels?: OptionLabels<V>;
};

export type ResolvedControl =
  | {
      name: string;
      label: string;
      kind: "select";
      options: string[];
      /** Every option's text, keyed by option. */
      optionLabels: Record<string, string>;
      default: string;
    }
  | { name: string; label: string; kind: "text"; default: string }
  | {
      name: string;
      label: string;
      kind: "boolean";
      default: boolean;
      offLabel: string;
      onLabel: string;
    };

export type PlaygroundControlValue = string | boolean;

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type VariantNames<S extends ComponentState> =
  | (keyof S["variants"]["values"] & string)
  | (S extends { parent: infer P extends ComponentState } ? VariantNames<P>
    : never);

type PresetKeys<V> =
  V extends { candidates: readonly (infer E)[] } ?
    E extends { $ast: unknown } ?
      never
    : keyof E & string
  : never;

type OwnPresets<S extends ComponentState> = {
  -readonly [K in keyof S["vars"] as K extends `--${infer N}` ?
    [PresetKeys<S["vars"][K]>] extends [never] ?
      never
    : N
  : never]: PresetKeys<S["vars"][K]>;
};

// A derived component's presets replace its parent's for the same value.
type AllPresets<S extends ComponentState> = OwnPresets<S> &
  (S extends { parent: infer P extends ComponentState } ?
    Omit<AllPresets<P>, keyof OwnPresets<S>>
  : {});

type DerivedValues<S extends ComponentState> = ([VariantNames<S>] extends (
  [never]
) ?
  {}
: { variant: VariantNames<S> }) &
  AllPresets<S>;

/** Playground values derived from a builder: `variant` plus each controlled value's presets. */
export type PlaygroundValues<B extends ComponentBuilder> =
  B extends ComponentBuilder<infer S> ? Simplify<DerivedValues<S>> : never;

/** `controls` for a playground whose derived values are `D`. */
export type PlaygroundControlsInput<D, C> = {
  [K in keyof C]: K extends keyof D ?
    false | DerivedOverrideFor<D[K] & string, C[K]>
  : CustomControl;
};

// When `options` narrows a derived control, it can't be empty and `default` and `optionLabels` must use them.
type DerivedOverrideFor<V extends string, X> =
  X extends { options: readonly (infer O)[] } ?
    {
      label?: string;
      options: readonly [O & V, ...(O & V)[]];
      default?: O & V;
      optionLabels?: OptionLabelsFor<O & V, X>;
    }
  : { label?: string; default?: V; optionLabels?: OptionLabelsFor<V, X> };

// Typed from the labels given: generic constraints skip excess-property checks, so a key that isn't an option would otherwise pass.
type OptionLabelsFor<V extends string, X> =
  X extends { optionLabels: infer L } ?
    { [K in keyof L]: K extends V ? string : never }
  : OptionLabels<V>;

type ControlValue<C> =
  C extends { kind: "select"; options: readonly (infer O extends string)[] } ? O
  : C extends TextControl ? string
  : C extends BooleanControl ? boolean
  : never;

/** Values passed to `render` once `controls` are applied to the derived values `D`. */
export type ResolvedPlaygroundValues<D, C> = Simplify<
  {
    [K in keyof D as K extends keyof C ?
      C[K] extends false ?
        never
      : K
    : K]: K extends keyof C ?
      C[K] extends { options: readonly (infer O)[] } ?
        O
      : D[K]
    : D[K];
  } & { [K in Exclude<keyof C, keyof D>]: ControlValue<C[K]> }
>;

export const control = {
  /** A select; pass its default, or `{ default, label, optionLabels }`. */
  select<const O extends string>(
    options: readonly [O, ...O[]],
    config?: NoInfer<O> | SelectControlConfig<NoInfer<O>>,
  ): SelectControl<O> {
    return selectControl(options, config, options[0]);
  },

  /** A text input; pass its default, or `{ default, label }`. */
  text(config: string | TextControlConfig = ""): TextControl {
    const { default: defaultValue = "", ...rest } =
      typeof config === "string" ? { default: config } : config;
    return { kind: "text", default: defaultValue, ...rest };
  },

  /** An off/on toggle; pass its default, or `{ default, label, offLabel, onLabel }`. */
  boolean(config: boolean | BooleanControlConfig = false): BooleanControl {
    const { default: defaultValue = false, ...rest } =
      typeof config === "boolean" ? { default: config } : config;
    return { kind: "boolean", default: defaultValue, ...rest };
  },

  /** A palette select; defaults to every palette and to `primary` when listed. */
  palette: paletteControl,
};

/** The `controls` a `<Playground>` accepts, before typing against a builder. */
export type PlaygroundControls = Partial<
  Record<string, false | DerivedControlOverride<string> | CustomControl>
>;

export type ResolvedPlaygroundControls = {
  /** Absent when a control has no usable options, so the playground can't render. */
  controls: ResolvedControl[] | undefined;
  issues: string[];
};

/**
 * Derived controls (variant, then each controlled value with presets) with
 * `overrides` applied, followed by the custom controls in `overrides`.
 */
export function resolvePlaygroundControls(
  builder: ComponentBuilder | undefined,
  overrides: PlaygroundControls = {},
): ResolvedPlaygroundControls {
  const controls: ResolvedControl[] = [];
  const issues: string[] = [];
  const derived = builder ? deriveControls(builder.state) : [];
  const derivedNames = new Set(derived.map((c) => c.name));
  let usable = true;

  const addCustom = (name: string, value: CustomControl) => {
    if (value.kind === "select" && value.options.length === 0) {
      usable = false;
      issues.push(
        `Playground control "${name}" has no options, so the playground is omitted.`,
      );
      return;
    }
    if (value.kind === "select" && !value.options.includes(value.default)) {
      const fallback = value.options[0]!;
      issues.push(
        `Playground control "${name}" defaults to "${value.default}", which is not one of its options; using "${fallback}".`,
      );
      controls.push(toResolved(name, { ...value, default: fallback }, issues));
      return;
    }
    controls.push(toResolved(name, value, issues));
  };

  for (const base of derived) {
    const override = overrides[base.name];
    if (override === false) continue;

    if (isCustomControl(override)) {
      addCustom(base.name, override);
      continue;
    }

    let finalOptions = override?.options ? [...override.options] : base.options;
    if (finalOptions.length === 0) {
      finalOptions = base.options;
      issues.push(
        `Playground control "${base.name}" has no options; using the component's options.`,
      );
    }

    const requested = override?.default;
    let defaultValue =
      finalOptions.includes(base.default) ? base.default : finalOptions[0]!;

    if (requested !== undefined) {
      if (finalOptions.includes(requested)) {
        defaultValue = requested;
      } else {
        defaultValue = finalOptions[0]!;
        issues.push(
          `Playground control "${base.name}" defaults to "${requested}", which is not one of its options; using "${defaultValue}".`,
        );
      }
    }

    controls.push({
      name: base.name,
      label: override?.label ?? toLabel(base.name),
      kind: "select",
      options: finalOptions,
      optionLabels: resolveOptionLabels(
        base.name,
        finalOptions,
        override?.optionLabels,
        issues,
      ),
      default: defaultValue,
    });
  }

  for (const [name, value] of Object.entries(overrides)) {
    if (derivedNames.has(name) || value === undefined) continue;
    if (!isCustomControl(value)) {
      issues.push(
        `Playground control "${name}" is not derived from the component; use control.select(), control.text(), control.boolean(), or control.palette().`,
      );
      continue;
    }
    addCustom(name, value);
  }

  return { controls: usable ? controls : undefined, issues };
}

export function playgroundDefaults(
  controls: readonly ResolvedControl[],
): Record<string, PlaygroundControlValue> {
  return Object.fromEntries(controls.map((c) => [c.name, c.default]));
}

function deriveControls(state: ComponentState) {
  const controls: { name: string; options: string[]; default: string }[] = [];
  const variants: string[] = [];
  const presets: { name: string; options: string[]; default: string }[] = [];
  let root: ComponentState = state;

  traverseTopDown(state, (current) => {
    if (!current.parent) root = current;

    for (const variant of Object.keys(current.variants.values)) {
      if (!variants.includes(variant)) variants.push(variant);
    }

    for (const [varName, value] of Object.entries(current.vars)) {
      if (!isControlledVar(value)) continue;

      const options: string[] = [];
      let defaultKey: string | undefined;
      for (const candidate of value.candidates) {
        if ("$ast" in candidate) continue;
        for (const [key, presetValue] of Object.entries(candidate)) {
          options.push(key);
          if (sameValue(presetValue, value.default)) defaultKey ??= key;
        }
      }

      if (options.length > 0) {
        const preset = {
          name: varName.slice(2),
          options,
          default: defaultKey ?? options[0]!,
        };
        // Traversal runs root to leaf, so the most-derived definition wins.
        const existing = presets.findIndex((p) => p.name === preset.name);
        if (existing === -1) presets.push(preset);
        else presets[existing] = preset;
      }
    }
  });

  if (variants.length > 0) {
    const selection = root.variants.selection;
    controls.push({
      name: "variant",
      options: variants,
      default:
        selection.mode === "default" && variants.includes(selection.key) ?
          selection.key
        : variants[0]!,
    });
  }

  return [...controls, ...presets];
}

function paletteControl(): SelectControl<Palette>;
function paletteControl<const O extends Palette>(
  options: readonly [O, ...O[]],
  config?: NoInfer<O> | SelectControlConfig<NoInfer<O>>,
): SelectControl<O>;
function paletteControl(
  options: readonly Palette[] = PALETTE,
  config?: Palette | SelectControlConfig<Palette>,
): SelectControl<Palette> {
  return selectControl(
    options,
    config,
    options.includes("primary") ? "primary" : options[0]!,
  );
}

function selectControl<O extends string>(
  options: readonly O[],
  config: O | SelectControlConfig<O> | undefined,
  fallback: O,
): SelectControl<O> {
  const { default: defaultValue = fallback, ...rest } =
    typeof config === "object" ? config : { default: config };
  return { kind: "select", options, default: defaultValue, ...rest };
}

function isCustomControl(value: unknown): value is CustomControl {
  return typeof value === "object" && value !== null && "kind" in value;
}

function toResolved(
  name: string,
  value: CustomControl,
  issues: string[],
): ResolvedControl {
  const label = value.label ?? toLabel(name);

  switch (value.kind) {
    case "select":
      return {
        name,
        label,
        kind: "select",
        options: [...value.options],
        optionLabels: resolveOptionLabels(
          name,
          value.options,
          value.optionLabels,
          issues,
        ),
        default: value.default,
      };
    case "text":
      return { name, label, kind: "text", default: value.default };
    case "boolean":
      return {
        name,
        label,
        kind: "boolean",
        default: value.default,
        offLabel: value.offLabel ?? "Off",
        onLabel: value.onLabel ?? "On",
      };
  }
}

function resolveOptionLabels(
  name: string,
  options: readonly string[],
  labels: OptionLabels<string> = {},
  issues: string[],
): Record<string, string> {
  for (const key of Object.keys(labels)) {
    if (!options.includes(key)) {
      issues.push(
        `Playground control "${name}" has a label for "${key}", which is not one of its options.`,
      );
    }
  }
  return Object.fromEntries(
    options.map((o) => [o, (Object.hasOwn(labels, o) ? labels[o] : o) ?? o]),
  );
}

function toLabel(name: string) {
  const words = name.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function sameValue(a: unknown, b: unknown) {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}
