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

type OwnVariantVars<T extends ComponentState> =
  T["variants"]["values"][keyof T["variants"]["values"]] extends infer V ?
    keyof V
  : never;

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
  [K in keyof T["vars"] as
    T["vars"][K] extends ControlledVar ? never
    : K extends V ? never
    : K]: T["vars"][K];
};

type DocComponentMeta = {
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

export function createDoc<
  T extends ComponentBuilder,
  M extends ComponentDocMeta<T> & {
    slots?: DerivedDocSectionMeta;
    customVariants?: DerivedDocSectionMeta;
  },
>(builder: T, meta: M): ComponentDoc {
  const { state } = builder;
  const varReferenceMap = new VarReferenceMap();
  const components: ComponentDoc["components"] = {};
  const utilities: ComponentDoc["utilities"] = {};
  const cssvars: ComponentDoc["cssvars"] = [];
  const slotEntries: DerivedDocEntry[] = [];
  const customVariantEntries: DerivedDocEntry[] = [];
  const variantVars = getVariantVars(state);
  const cssvarDescriptions = (meta as { cssvars?: Record<string, string> })
    .cssvars;

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
        const varKey = varName.slice(2) as keyof typeof meta.utilities;
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

        const utilityMeta = meta.utilities[varKey]!;

        utilities[varKey] = {
          ...utilityMeta,
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
            description: cssvarDescriptions?.[varName] || "",
            defaultValue: `${varValue}`,
          });
        }

        varReferenceMap.addVars({ [varName]: varValue });
      }
    }

    for (const [id, body] of Object.entries(current.utilities)) {
      const utilityName = `${componentName}-${id}`;

      utilities[id] = {
        name: meta.utilities[id as keyof typeof meta.utilities]?.name || id,
        description:
          meta.utilities[id as keyof typeof meta.utilities]?.description || "",
        pattern: createPattern(utilityName, undefined, undefined),
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
      const componentMeta =
        meta.components[entryKey as keyof typeof meta.components];

      if (!componentMeta) {
        throw new Error(`Missing component doc metadata for \"${entryKey}\".`);
      }

      components[entryKey] = {
        ...componentMeta,
        pattern,
        composesWith: componentComposesWith,
      };
    }
  });

  return {
    title: meta.title,
    description: meta.description,
    components,
    utilities,
    cssvars,
    ...(slotEntries.length > 0 ?
      {
        slots: {
          title:
            meta.slots?.title ??
            (slotEntries.length === 1 ?
              `${capitalize(slotEntries[0]!.name)} Slot`
            : "Slots"),
          description: meta.slots?.description,
          showcases: meta.slots?.showcases,
          entries: slotEntries,
        },
      }
    : {}),
    ...(customVariantEntries.length > 0 ?
      {
        customVariants: {
          title: meta.customVariants?.title ?? "Custom Variants",
          description: meta.customVariants?.description,
          showcases: meta.customVariants?.showcases,
          entries: customVariantEntries,
        },
      }
    : {}),
  };
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
        variants.selection.mode === "default" ?
          variants.selection.key
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

function isMatchValueCandidate(
  candidate: ControlledVar["candidates"][number],
): candidate is MatchValueAst<CssDataType> {
  return "$ast" in candidate && candidate.$ast === "match-value";
}
