import {
  type ComponentConstruct,
  type UtilityConstruct,
  type ThemeConstruct,
  type StyleListAst_WithMetadata,
  type StyleRuleAst_WithMetadata,
  isThemeable,
  PALETTE,
} from "@nataliebasille/css-engine";
import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime/types";
import { DocPage, DocSection } from "./DocPage";
import { Spotlight } from "./spotlight";
import { DisplayPattern, type Pattern } from "./display-pattern";
import { UtilityReference, UtilityValue } from "./utility-reference";

type CssVarsFromMetadata<S> =
  S extends { readonly __metadata?: infer M } ? Extract<keyof M, `--${string}`>
  : never;

type ExtractCssVars<T> =
  T extends ThemeConstruct ? never
  : T extends ComponentConstruct ? CssVarsFromMetadata<T["styles"]>
  : T extends UtilityConstruct ? CssVarsFromMetadata<T["styles"][number]>
  : T extends readonly (infer E)[] ? ExtractCssVars<E>
  : never;

type ModuleLike =
  | ComponentConstruct
  | UtilityConstruct
  | ThemeConstruct
  | StyleListAst_WithMetadata
  | StyleRuleAst_WithMetadata;

type ComponentDocMeta<T extends ModuleLike> = {
  name: string;
  description: string;
  spotlights?: Partial<
    Record<keyof Extract<T, ComponentConstruct>["variants"], ShowcaseJsxNode>
  >;
};

type DocMeta<T extends ModuleLike> = {
  atAGlance?: React.ReactNode;
  playground: React.ReactNode;
  components: Record<
    Extract<T, ComponentConstruct>["name"],
    ComponentDocMeta<T>
  >;
  modifiers?: Partial<
    Record<Extract<T, UtilityConstruct>["name"], ModifierDocEntry>
  >;
  cssvars?: Partial<Record<ExtractCssVars<T>, CssVarDocEntry>>;
};

type ComponentDocEntry = ComponentDocMeta<ModuleLike> & {
  pattern: Pattern;
  composesWith: Pattern[];
};

type ModifierDocEntry = {
  name: string;
  description: string;
};

type CssVarDocEntry = {
  description: string;
  default: string;
};

type ResolvedDocMeta = {
  atAGlance?: React.ReactNode;
  playground: React.ReactNode;
  components: ComponentDocEntry[];
  modifiers: Partial<Record<string, ModifierDocEntry>>;
  cssvars: Partial<Record<string, CssVarDocEntry>>;
};

type ComponentDocPageProps<M extends ModuleLike = ModuleLike> = {
  title: string;
  description: string;
  module: M[];
  doc: DocMeta<M>;
};

export function ComponentDocPage<M extends ModuleLike>({
  title,
  description,
  module,
  doc,
}: ComponentDocPageProps<M>) {
  const docs = createDocs(module, doc);

  return (
    <DocPage title={title} description={description}>
      {docs.atAGlance && (
        <DocSection title="At a glance">
          <Spotlight>{docs.atAGlance}</Spotlight>
        </DocSection>
      )}

      <DocSection title="Playground">{docs.playground}</DocSection>

      {docs.components.map((component) => (
        <DocSection key={component.name} title={component.name}>
          <UtilityReference
            description={component.description}
            tags={["component"]}
            table={[
              {
                label: "Pattern",
                content: <DisplayPattern pattern={component.pattern} />,
              },
              ...(component.pattern.value ?
                [
                  {
                    label: capitalize(component.pattern.value.name),
                    content: (
                      <UtilityValue
                        values={component.pattern.value.values}
                        defaultValue={component.pattern.value.defaultValue}
                      />
                    ),
                  },
                ]
              : []),
              ...(component.pattern.modifier ?
                [
                  {
                    label: capitalize(component.pattern.modifier.name),
                    content: (
                      <UtilityValue
                        values={component.pattern.modifier.values}
                      />
                    ),
                  },
                ]
              : []),
              ...(component.composesWith.length > 0 ?
                [
                  {
                    label: "Composes with",
                    content: (
                      <UtilityValue
                        values={component.composesWith.map((x) => (
                          <DisplayPattern key={x.root} pattern={x} />
                        ))}
                        divider="+"
                      />
                    ),
                  },
                ]
              : []),
            ]}
          />
        </DocSection>
      ))}
    </DocPage>
  );
}

function createDocs(
  module: ModuleLike[],
  meta: DocMeta<ModuleLike>,
): ResolvedDocMeta {
  const components = module.filter(isComponentConstruct);
  const utilities = module.filter(isUtilityConstruct);
  const cssVars = new Set<string>();

  const componentMap = new Map<
    Pattern,
    {
      name: string;
      description: string;
      spotlights?: Partial<Record<string, ShowcaseJsxNode>>;
      cssvars: string[];
    }
  >();

  for (const construct of components) {
    const themeable = isThemeable(construct);
    const hasVariants = Object.keys(construct.variants).length > 0;
    const componentMeta = meta.components![construct.name]!;
    const pattern: Pattern = {
      root: construct.name,
      value:
        hasVariants ?
          {
            name: "variant",
            values: Object.keys(construct.variants),
            defaultValue: construct.defaultVariant,
          }
        : undefined,
      modifier:
        themeable ?
          {
            name: "palette",
            values: PALETTE,
          }
        : undefined,
    };

    componentMap.set(pattern, {
      ...componentMeta,
      cssvars: findSetVariables(construct),
    });
  }

  for (const construct of utilities) {
    for (const variableName of findSetVariables(construct)) {
      cssVars.add(variableName);
    }
  }

  const componentDocs = [...componentMap.entries()].map(
    ([pattern, { cssvars, ...docData }]) =>
      ({
        ...docData,
        pattern,
        composesWith: [],
      }) satisfies ComponentDocEntry,
  );

  const modifierEntries = createModifierDocs(utilities, meta);
  const cssVarEntries = createCssVarDocs(cssVars, meta);

  return {
    atAGlance: meta.atAGlance,
    playground: meta.playground,
    components: componentDocs,
    modifiers: {
      ...modifierEntries,
      ...meta.modifiers,
    },
    cssvars: {
      ...cssVarEntries,
      ...meta.cssvars,
    },
  };
}

function createModifierDocs<M extends ModuleLike>(
  modifiers: UtilityConstruct[],
  meta: DocMeta<M>,
): ResolvedDocMeta["modifiers"] {
  return Object.fromEntries(
    modifiers.map((construct) => [
      construct.name,
      meta.modifiers?.[
        construct.name as Extract<M, UtilityConstruct>["name"]
      ] ?? {
        name: construct.name,
        description: "",
      },
    ]),
  ) as ResolvedDocMeta["modifiers"];
}

function createCssVarDocs<M extends ModuleLike>(
  cssVars: Set<string>,
  meta: DocMeta<M>,
): ResolvedDocMeta["cssvars"] {
  return Object.fromEntries(
    [...cssVars].map((variableName) => [
      variableName,
      meta.cssvars?.[variableName as ExtractCssVars<M>] ?? {
        description: "",
        default: "",
      },
    ]),
  ) as ResolvedDocMeta["cssvars"];
}

function isComponentConstruct(value: ModuleLike): value is ComponentConstruct {
  return "$construct" in value && value.$construct === "component";
}

function isUtilityConstruct(value: ModuleLike): value is UtilityConstruct {
  return "$construct" in value && value.$construct === "utility";
}

function collectSetVariables(value: unknown, target: Set<string>) {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectSetVariables(item, target);
    }
    return;
  }

  for (const [key, nestedValue] of Object.entries(
    value as Record<string, unknown>,
  )) {
    if (key.startsWith("--")) {
      target.add(key);
    }

    collectSetVariables(nestedValue, target);
  }
}

export function findSetVariables(
  construct: ComponentConstruct | UtilityConstruct,
): `--${string}`[] {
  const variables = new Set<string>();

  collectSetVariables(construct.styles, variables);

  if (construct.$construct === "component") {
    collectSetVariables(construct.variants, variables);
  } else if (construct.theme?.mode !== "inline") {
    collectSetVariables(construct.theme?.properties, variables);
  }

  return [...variables].sort() as `--${string}`[];
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
