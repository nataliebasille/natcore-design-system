import { PALETTE } from "../../dsl/public";
import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";
import type { ExtendsNever } from "../../utils";
import { createPattern, type Pattern } from "../pattern";
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

type DefinedUtilityKeys<T extends ComponentState> =
  T extends { parent: infer P extends ComponentState } ?
    | keyof T["utilities"]
    | ExtractVarName<ExtractControlledVars<T>>
    | DefinedUtilityKeys<P>
  : keyof T["utilities"] | ExtractVarName<ExtractControlledVars<T>>;

type DefinedCssVars<T extends ComponentState> =
  T extends { parent: infer P extends ComponentState } ?
    keyof T["vars"] | DefinedCssVars<P>
  : keyof T["vars"];

export type ComponentDocMeta<T extends ComponentBuilder> = {
  title: string;
  description: string;
} & (T extends ComponentBuilder<infer S extends ComponentState> ?
  {
    components: {
      [K in DefinedComponentKeys<S>]: {
        name: string;
        description: string;
      };
    };
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

        varReferenceMap.addUtility(varKey, [
          {
            [varName]: [
              varValue.default,
              ...varValue.candidates
                .filter((c) => c.type === "token")
                .map((c) => c.value),
            ].flat(),
          },
        ]);

        const utilityMeta = meta.utilities[varKey]!;

        cssvars.push({
          varName: `--${utilityName}`,
          description: meta.cssvars[varName as keyof typeof meta.cssvars] || "",
          defaultValue: `${varValue.default}`,
        });

        utilities[varKey] = {
          ...utilityMeta,
          pattern: createPattern(
            utilityName,
            {
              name: varKey,
              tokens: varValue.candidates.map((c) =>
                c.type === "token" ? c.token : c,
              ),
            },
            undefined,
          ),
          composesWith: [],
        };
      } else {
        cssvars.push({
          varName: `--${componentName}-${varName.slice(2)}`,
          description: meta.cssvars[varName as keyof typeof meta.cssvars] || "",
          defaultValue: `${varValue}`,
        });

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

    components[current.name] = {
      ...meta.components[current.name as keyof typeof meta.components]!,
      pattern: createPattern(
        componentName,
        variants.state === true ?
          {
            name: "variant",
            default: variants.default,
            tokens: Object.keys({ ...variants.inherited, ...variants.own }),
          }
        : undefined,
        themeable.state === true ?
          {
            name: "palette",
            default: themeable.default,
            tokens: PALETTE,
          }
        : undefined,
      ),
      composesWith: varReferenceMap
        .composesWith(current.body)
        .map((id) => ({ type: "utility", id })),
    };
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
