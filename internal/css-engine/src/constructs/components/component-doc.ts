import { PALETTE } from "../../dsl/public";
import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";
import type { ExtendsNever } from "../../utils";
import {
  createPattern,
  type Pattern,
  type PatternValueToken,
} from "../pattern";
import type { MatchValueAst } from "../../dsl/ast/cssvalue/match-value";
import type { CssDataType, StylePropertyValue } from "../../dsl/public";
import { type ComponentBuilder } from "./component-builder";
import {
  isControlledVar,
  type ComponentState,
  type ControlledVar,
} from "./types";
import {
  getSlots,
  resolveComponentName,
  resolveSlotSelector,
  themeableDefinition,
  traverseTopDown,
  variantDefinition,
} from "./utils";
import { VarReferenceMap } from "./var-reference-map";

type ExtractVarName<T extends `--${string}`> =
  T extends `--${infer Name}` ? Name : never;

type DefinedComponentKeys<T extends ComponentState> =
  T extends { parent: infer P extends ComponentState } ?
    T["name"] | DefinedComponentKeys<P>
  : T["name"];

type ExtractControlledVars<T extends ComponentState> =
  T extends { parent: infer P extends ComponentState } ?
    | keyof {
        [K in keyof T["vars"] as T["vars"][K] extends ControlledVar ? K
        : never]: T["vars"][K];
      }
    | ExtractControlledVars<P>
  : keyof {
      [K in keyof T["vars"] as T["vars"][K] extends ControlledVar ? K
      : never]: T["vars"][K];
    };

type ExtractVariantVars<T extends ComponentState> =
  T extends { parent: infer P extends ComponentState } ?
    OwnVariantVars<T> | ExtractVariantVars<P>
  : OwnVariantVars<T>;

type OwnVariantVars<T extends ComponentState> = {
  [K in keyof T["variants"]["values"]]: keyof T["variants"]["values"][K];
}[keyof T["variants"]["values"]];

type DefinedUtilityKeys<T extends ComponentState> =
  T extends { parent: infer P extends ComponentState } ?
    | keyof T["utilities"]
    | ExtractVarName<ExtractControlledVars<T>>
    | DefinedUtilityKeys<P>
  : keyof T["utilities"] | ExtractVarName<ExtractControlledVars<T>>;

type DefinedCssVars<
  T extends ComponentState,
  V extends PropertyKey = ExtractVariantVars<T>,
> =
  T extends { parent: infer P extends ComponentState } ?
    ExtractCssVars<T, V> | DefinedCssVars<P, V>
  : ExtractCssVars<T, V>;

type ExtractCssVars<T extends ComponentState, V extends PropertyKey> = keyof {
  [K in keyof T["vars"] as T["vars"][K] extends ControlledVar ? never
  : K extends V ? never
  : K]: T["vars"][K];
};

export type DocComponentMeta = {
  name: string;
  description: string;
};

type VariantComponentDocKeys<K extends string> = `${K}@variant`;

type ComponentDocMetaComponents<T extends ComponentState> = {
  [K in DefinedComponentKeys<T>]: DocComponentMeta;
} & {
  [K in VariantComponentDocKeys<DefinedComponentKeys<T>>]?: DocComponentMeta;
};

export type ComponentDocMeta<T extends ComponentBuilder> = {
  title: string;
  description: string;
} & (T extends ComponentBuilder<infer S extends ComponentState> ?
  {
    components: ComponentDocMetaComponents<S>;
  } & (ExtendsNever<DefinedUtilityKeys<S>> extends true ?
    {
      utilities?: never;
    }
  : {
      utilities: {
        [K in DefinedUtilityKeys<S>]: {
          name: string;
          description: string;
        };
      };
    }) &
    (ExtendsNever<DefinedCssVars<S>> extends true ?
      {
        cssvars?: never;
      }
    : {
        cssvars: { [K in DefinedCssVars<S>]: string };
      })
: never);

export type ComposesWith = {
  type: "utility";
  id: string;
};

export type DocShowcase = {
  title?: string;
  description?: string;
  content: ShowcaseJsxNode;
};

export type DerivedDocSectionMeta = {
  title?: string;
  description?: string;
  showcases?: DocShowcase[];
};

type DerivedDocEntry = {
  name: string;
  selector: string;
};

type DerivedDocSection = {
  title: string;
  description?: string;
  showcases?: DocShowcase[];
  entries: DerivedDocEntry[];
};

export type ComponentDoc = {
  title: string;
  description: string;
  components: Record<
    string,
    {
      name: string;
      description: string;
      pattern: Pattern;
      composesWith: ComposesWith[];
    }
  >;
  utilities: Record<
    string,
    {
      name: string;
      description: string;
      pattern: Pattern;
      composesWith: ComposesWith[];
    }
  >;
  cssvars: {
    varName: string;
    description: string;
    defaultValue?: string;
  }[];
  slots?: DerivedDocSection;
  customVariants?: DerivedDocSection;
};

/** Optional names and descriptions for the entities `createDoc` derives from a builder. */
export type ComponentDocDescriptions = {
  title: string;
  description: string;
  components?: Partial<Record<string, Partial<DocComponentMeta>>>;
  utilities?: Partial<Record<string, Partial<DocComponentMeta>>>;
  cssvars?: Partial<Record<string, string>>;
  slots?: DerivedDocSectionMeta;
  customVariants?: DerivedDocSectionMeta;
};

/**
 * Derives a component's API docs from its builder. Entities without an entry
 * in `descriptions` get a default name and an empty description.
 */
export function createDoc(
  builder: ComponentBuilder,
  descriptions: ComponentDocDescriptions,
): ComponentDoc {
  const { state } = builder;
  const varReferenceMap = new VarReferenceMap();
  const components: ComponentDoc["components"] = {};
  const utilities: ComponentDoc["utilities"] = {};
  const cssvars: ComponentDoc["cssvars"] = [];
  const slotEntries: DerivedDocEntry[] = [];
  const customVariantEntries: DerivedDocEntry[] = [];
  const variantVars = getVariantVars(state);

  const resolvedSlots = getSlots(state);
  for (const [name] of Object.entries(resolvedSlots)) {
    slotEntries.push({
      name,
      selector: resolveSlotSelector(name, resolvedSlots),
    });
  }

  traverseTopDown(state, (current) => {
    const componentName = resolveComponentName(current);

    for (const [name, selector] of Object.entries(current.guards)) {
      customVariantEntries.push({
        name: `${componentName}-${name}`,
        selector: String(selector),
      });
    }

    for (const [varName, varValue] of Object.entries(current.vars)) {
      if (isControlledVar(varValue)) {
        const varKey = varName.slice(2);
        const utilityName = `${componentName}-${varKey}`;
        const utilityValues = [
          varValue.default,
          ...resolveControlledVarValues(varValue.candidates),
        ].flat();

        varReferenceMap.addUtility(varKey, [
          {
            [varName]: utilityValues,
          },
        ]);

        utilities[varKey] = {
          ...utilityMeta(descriptions, varKey),
          pattern: createPattern(
            utilityName,
            {
              name: varKey,
              tokens: resolveControlledPatternTokens(varValue.candidates),
            },
            undefined,
          ),
          composesWith: [],
        };
      } else {
        if (!variantVars.has(varName as `--${string}`)) {
          cssvars.push({
            varName: `--${componentName}-${varName.slice(2)}`,
            description: descriptions.cssvars?.[varName] ?? "",
            defaultValue: `${varValue}`,
          });
        }

        varReferenceMap.addVars({ [varName]: varValue });
      }
    }

    for (const [id, body] of Object.entries(current.utilities)) {
      const utilityName = `${componentName}-${id}`;
      // `name-*` takes a value: document the values its body matches.
      const wildcardRoot =
        id.endsWith("-*") ? `${componentName}-${id.slice(0, -2)}` : undefined;

      utilities[id] = {
        ...utilityMeta(descriptions, id),
        pattern:
          wildcardRoot ?
            createPattern(
              wildcardRoot,
              { name: "value", tokens: resolveMatchedPatternTokens(body) },
              undefined,
            )
          : createPattern(utilityName, undefined, undefined),
        composesWith: varReferenceMap
          .composesWith(body)
          .map((id) => ({ type: "utility", id: `${componentName}-${id}` })),
      };

      varReferenceMap.addUtility(id, body);
    }

    const themeable = themeableDefinition(current);
    const variants = variantDefinition(current);

    const componentComposesWith: ComposesWith[] = varReferenceMap
      .composesWith(current.body)
      .map((id): ComposesWith => ({ type: "utility", id }));

    for (const [entryKey, pattern] of resolveComponentEntries(
      current.name,
      componentName,
      variants,
      themeable,
    )) {
      const componentMeta = descriptions.components?.[entryKey];

      components[entryKey] = {
        name:
          componentMeta?.name ??
          defaultComponentName(entryKey, !current.parent, descriptions.title),
        description: componentMeta?.description ?? "",
        pattern,
        composesWith: componentComposesWith,
      };
    }
  });

  return {
    title: descriptions.title,
    description: descriptions.description,
    components,
    utilities,
    cssvars,
    ...(slotEntries.length > 0 ?
      {
        slots: {
          title:
            descriptions.slots?.title ??
            (slotEntries.length === 1 ?
              `${capitalize(slotEntries[0]!.name)} Slot`
            : "Slots"),
          description: descriptions.slots?.description,
          showcases: descriptions.slots?.showcases,
          entries: slotEntries,
        },
      }
    : {}),
    ...(customVariantEntries.length > 0 ?
      {
        customVariants: {
          title: descriptions.customVariants?.title ?? "Custom Variants",
          description: descriptions.customVariants?.description,
          showcases: descriptions.customVariants?.showcases,
          entries: customVariantEntries,
        },
      }
    : {}),
  };
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// `placement-*` → `Placement`.
function toLabel(key: string) {
  return capitalize(key.replace(/-\*$/, "").replace(/-/g, " "));
}

function utilityMeta(descriptions: ComponentDocDescriptions, key: string) {
  const meta = descriptions.utilities?.[key];
  return {
    name: meta?.name ?? toLabel(key),
    description: meta?.description ?? "",
  };
}

// The root component is named after the page; `<key>@variant` after its base.
function defaultComponentName(
  entryKey: string,
  isRoot: boolean,
  pageTitle: string,
) {
  const isVariant = entryKey.endsWith("@variant");
  const base = isRoot ? pageTitle : toLabel(entryKey.replace(/@variant$/, ""));
  return isVariant ? `${base} Variants` : base;
}

function getVariantVars(state: ComponentState) {
  const variantVars = new Set<`--${string}`>();

  traverseTopDown(state, (current) => {
    for (const vars of Object.values(current.variants.values)) {
      for (const varName of Object.keys(vars)) {
        variantVars.add(varName as `--${string}`);
      }
    }
  });

  return variantVars;
}

function resolveComponentEntries(
  componentKey: string,
  componentName: string,
  variants: ReturnType<typeof variantDefinition>,
  themeable: ReturnType<typeof themeableDefinition>,
) {
  const basePattern = createPattern(
    componentName,
    undefined,
    themeable.isThemeable ?
      {
        name: "palette",
        default: themeable.default ?? "inherited",
        optional: true,
        tokens: PALETTE,
      }
    : undefined,
  );

  if (!variants.hasVariants) {
    return [[componentKey, basePattern]] as const;
  }

  const variantTokens = Object.keys({ ...variants.inherited, ...variants.own });
  if (variantTokens.length === 1) {
    const staticVariantPattern = createPattern(
      `${componentName}-${variantTokens[0]}`,
      undefined,
      themeable.isThemeable ?
        {
          name: "palette",
          default: themeable.default ?? "inherited",
          optional: true,
          tokens: PALETTE,
        }
      : undefined,
    );

    return variants.selection.mode === "optional" ?
        ([
          [componentKey, basePattern],
          [`${componentKey}@variant`, staticVariantPattern],
        ] as const)
      : ([[componentKey, staticVariantPattern]] as const);
  }

  const variantPattern = createPattern(
    componentName,
    {
      name: "variant",
      default:
        variants.selection.mode === "default" ? variants.selection.key
        : variants.selection.mode === "optional" ? variants.selection.default
        : undefined,
      tokens: variantTokens,
    },
    themeable.isThemeable ?
      {
        name: "palette",
        default: themeable.default ?? "inherited",
        optional: true,
        tokens: PALETTE,
      }
    : undefined,
  );

  return variants.selection.mode === "optional" ?
      ([
        [componentKey, basePattern],
        [`${componentKey}@variant`, variantPattern],
      ] as const)
    : ([[componentKey, variantPattern]] as const);
}

function resolveControlledVarValues(
  candidates: ControlledVar["candidates"],
): Array<StylePropertyValue | StylePropertyValue[]> {
  const values: Array<StylePropertyValue | StylePropertyValue[]> = [];

  for (const candidate of candidates) {
    if (isMatchValueCandidate(candidate)) {
      continue;
    }

    values.push(...Object.values(candidate));
  }

  return values;
}

function resolveControlledPatternTokens(
  candidates: ControlledVar["candidates"],
): PatternValueToken[] {
  const tokens: PatternValueToken[] = [];

  for (const candidate of candidates) {
    if (isMatchValueCandidate(candidate) === false) {
      tokens.push(...Object.keys(candidate));
      continue;
    }

    for (const valueCandidate of candidate.candidates) {
      switch (valueCandidate.$twCandidate) {
        case "arbitrary":
          tokens.push({ type: "arbitrary", dataType: valueCandidate.dataType });
          break;
        case "bare":
          tokens.push({ type: "bare", dataType: valueCandidate.dataType });
          break;
        case "variable":
          break;
      }
    }
  }

  return tokens;
}

/**
 * The values a utility body matches, from every match value anywhere in it
 * (including inside calc() and nested selectors), without repeats.
 */
function resolveMatchedPatternTokens(body: unknown): PatternValueToken[] {
  const matches: MatchValueAst<CssDataType>[] = [];
  const seen = new WeakSet<object>();
  const visit = (node: unknown) => {
    if (typeof node !== "object" || node === null || seen.has(node)) return;
    seen.add(node);
    if ((node as { $ast?: unknown }).$ast === "match-value") {
      matches.push(node as MatchValueAst<CssDataType>);
      return;
    }
    for (const child of Object.values(node)) visit(child);
  };
  visit(body);

  const tokens = resolveControlledPatternTokens(matches);
  return tokens.filter(
    (token, i) =>
      tokens.findIndex(
        (other) => JSON.stringify(other) === JSON.stringify(token),
      ) === i,
  );
}

function isMatchValueCandidate(
  candidate: ControlledVar["candidates"][number],
): candidate is MatchValueAst<CssDataType> {
  return "$ast" in candidate && candidate.$ast === "match-value";
}
