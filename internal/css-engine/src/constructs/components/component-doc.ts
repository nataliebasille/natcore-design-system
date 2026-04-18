import {
  dsl,
  PALETTE,
  stylesheetVisitorBuilder,
  type DesignSystemAst,
  type StylePropertyValue,
  type StyleRuleBodyBuilder,
} from "../../dsl/public";
import type { ExtendsNever } from "../../utils";
import { createPattern, type Pattern } from "../pattern";
import { component, type ComponentBuilder } from "./component-builder";
import { ComponentStateRef } from "./component-state-ref";
import {
  isControlledVar,
  type ComponentState,
  type ControlledVar,
  type VarsProperty,
} from "./types";
import {
  resolveComponentName,
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

type ExtractControlledVars<T extends ComponentState> = keyof {
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
    Exclude<keyof T["vars"], ExtractControlledVars<T>> | DefinedCssVars<P>
  : Exclude<keyof T["vars"], ExtractControlledVars<T>>;

export type ComponentDocMeta<T extends ComponentBuilder> = {
  name: string;
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
        } & (`--${K}` extends ExtractControlledVars<S> ?
          {
            patternKey: string;
          }
        : {
            patternKey?: never;
          });
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

export type ComponentDoc = {
  name: string;
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
};

export function createDoc<T extends ComponentBuilder>(
  builder: T,
  meta: ComponentDocMeta<T>,
) {
  const { state } = builder;
  const varReferenceMap = new VarReferenceMap();
  const components: ComponentDoc["components"] = {};
  const utilities: ComponentDoc["utilities"] = {};
  const cssvars: ComponentDoc["cssvars"] = [];

  traverseTopDown(state, (current) => {
    const componentName = resolveComponentName(current);
    for (const [varName, varValue] of Object.entries(current.vars)) {
      if (isControlledVar(varValue)) {
        const utilityName = `${componentName}-${varName.slice(2)}`;

        varReferenceMap.addUtility(utilityName, [
          {
            [varName]: [
              varValue.default,
              ...varValue.candidates
                .filter((c) => c.type === "token")
                .map((c) => c.value),
            ].flat(),
          },
        ]);

        const varKey = varName.slice(2) as keyof typeof meta.utilities;
        const { patternKey = "", ...rest } = meta.utilities[varKey]!;

        utilities[utilityName] = {
          ...rest,
          pattern: createPattern(
            utilityName,
            {
              name: patternKey,
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
          varName,
          description: meta.cssvars[varName as keyof typeof meta.cssvars] || "",
          defaultValue: `${varValue}`,
        });

        varReferenceMap.addVars({ [varName]: varValue });
      }
    }

    for (const [utilityName, body] of Object.entries(current.utilities)) {
      const id = `${componentName}-${utilityName}`;

      utilities[id] = {
        name:
          meta.utilities[utilityName as keyof typeof meta.utilities]?.name ||
          utilityName,
        description:
          meta.utilities[utilityName as keyof typeof meta.utilities]
            ?.description || "",
        pattern: createPattern(id, undefined, undefined),
        composesWith: varReferenceMap
          .composesWith(body)
          .map((id) => ({ type: "utility", id })),
      };

      varReferenceMap.addUtility(id, body);
    }

    const themeable = themeableDefinition(current);
    const variants = variantDefinition(current);

    components[componentName] = {
      ...meta.components[current.name as keyof typeof meta.components]!,
      pattern: createPattern(
        componentName,
        variants.state === true ?
          {
            name: "variant",
            default: variants.default,
            tokens: Object.keys(variants.own),
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
    name: meta.name,
    description: meta.description,
    components,
    utilities,
    cssvars,
  };
}
