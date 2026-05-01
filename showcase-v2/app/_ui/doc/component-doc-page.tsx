import {
  type ComponentBuilder,
  createDoc,
  type ComponentDocMeta,
  type PatternValue,
} from "@nataliebasille/css-engine";
import type { ReactNode } from "react";
import { DisplayPattern } from "./display-pattern";
import { DocPage } from "./DocPage";
import { DocSection } from "./DocPage.client";
import { Spotlight } from "./spotlight";
import {
  ApiGroup,
  ApiRow,
  TagBadge,
  UtilityReference,
  UtilityValue,
  type UtilityTag,
} from "./utility-reference";

type ComponentDocPageProps<B extends ComponentBuilder> = {
  module: B;
  meta: ComponentDocMeta<B>;
  content: {
    atAGlance?: React.ReactNode;
    playground: React.ReactNode;
  };
};

export function ComponentDocPage<B extends ComponentBuilder>({
  module,
  meta,
  content,
}: ComponentDocPageProps<B>) {
  const resolvedDoc = createDoc(module, meta);

  return (
    <DocPage title={resolvedDoc.title} description={resolvedDoc.description}>
      {content.atAGlance && (
        <DocSection title="At a glance">
          <Spotlight>{content.atAGlance}</Spotlight>
        </DocSection>
      )}

      <DocSection title="Playground">{content.playground}</DocSection>

      {Object.entries(resolvedDoc.components ?? {}).map(([key, component]) => (
        <DocSection key={key} title={component.name}>
          <UtilityReference
            description={component.description}
            tags={[
              "component",
              ...(component.composesWith.length > 0 ?
                (["composable"] as const)
              : []),
            ]}
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
                        values={patternValueToNodes(component.pattern.value)}
                        defaultValue={component.pattern.value.default}
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
                        values={patternValueToNodes(component.pattern.modifier)}
                        defaultValue={component.pattern.modifier.default}
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
                        values={component.composesWith.map((x) =>
                          resolvedDoc.utilities[x.id]?.pattern ?
                            <DisplayPattern
                              pattern={resolvedDoc.utilities[x.id]!.pattern}
                            />
                          : null,
                        )}
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

      {Object.entries(resolvedDoc.utilities ?? {}).map(([key, utility]) => (
        <DocSection key={key} title={utility.name}>
          <UtilityReference
            description={utility.description}
            tags={[
              "modifier",
              ...(utility.composesWith.length > 0 ?
                (["composable"] as const)
              : []),
            ]}
            table={[
              {
                label: "Pattern",
                content: <DisplayPattern pattern={utility.pattern} />,
              },
              ...(utility.pattern.value ?
                [
                  {
                    label: capitalize(utility.pattern.value.name),
                    content: (
                      <UtilityValue
                        values={patternValueToNodes(utility.pattern.value)}
                        defaultValue={utility.pattern.value.default}
                      />
                    ),
                  },
                ]
              : []),
              ...(utility.pattern.modifier ?
                [
                  {
                    label: capitalize(utility.pattern.modifier.name),
                    content: (
                      <UtilityValue
                        values={patternValueToNodes(utility.pattern.modifier)}
                        defaultValue={utility.pattern.modifier.default}
                      />
                    ),
                  },
                ]
              : []),
              ...(utility.composesWith.length > 0 ?
                [
                  {
                    label: "Composes with",
                    content: (
                      <UtilityValue
                        values={utility.composesWith.map((x) =>
                          resolvedDoc.utilities[x.id]?.pattern ?
                            <DisplayPattern
                              pattern={resolvedDoc.utilities[x.id]!.pattern}
                            />
                          : null,
                        )}
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

      <div className="divider"></div>

      <DocSection title="API Reference">
        <div className="space-y-8">
          {/* ── Classes ── */}
          {(Object.keys(resolvedDoc.components).length > 0 ||
            Object.keys(resolvedDoc.utilities).length > 0) && (
            <ApiGroup label="Classes">
              {Object.entries(resolvedDoc.components).map(([key, meta]) => {
                return (
                  <TaggedApiRow
                    key={meta.name}
                    tag="component"
                    label={<DisplayPattern pattern={meta.pattern} />}
                  >
                    <div className="mb-2 text-xs text-on-surface-50/70">
                      {meta.description}
                    </div>

                    <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-1 text-xs desktop:mt-2">
                      <span className="text-on-surface-50/60">Variant</span>
                      <div className="flex flex-wrap gap-1.5">
                        <UtilityValue
                          values={patternValueToNodes(meta.pattern.value)}
                        />
                      </div>
                      <span className="text-on-surface-50/60">Palette</span>
                      <div className="flex flex-wrap gap-1.5">
                        <UtilityValue
                          values={patternValueToNodes(meta.pattern.modifier)}
                        />
                      </div>
                    </div>
                  </TaggedApiRow>
                );
              })}
              {Object.entries(resolvedDoc.utilities).map(([key, meta]) => {
                return (
                  <TaggedApiRow
                    key={meta.name}
                    tag="modifier"
                    label={<DisplayPattern pattern={meta.pattern} />}
                  >
                    <div className="mb-2 text-xs text-on-surface-50/70">
                      {meta.description}
                    </div>

                    {/* {meta.modifiers.length > 0 && (
                      <div className="grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-1 text-xs">
                        <span className="text-on-surface-50/60">
                          {capitalize(seg)}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <UtilityValue values={meta.modifiers} />
                        </div>
                      </div>
                    )} */}
                  </TaggedApiRow>
                );
              })}
            </ApiGroup>
          )}

          {/* ── CSS Variables ── */}
          {/* {hasVars && (
            <ApiGroup label="CSS Variables">
              {allVars.map((v) => {
                const extra = cssVarInfoMap.get(v.name);
                return (
                  <TaggedApiRow
                    key={v.name}
                    tag="css-variable"
                    label={<span className="font-mono text-sm">{v.name}</span>}
                  >
                    <span className="flex flex-col items-start gap-1.5 text-xs">
                      {extra?.description && (
                        <span className="text-on-surface-50/80">
                          {extra.description}
                        </span>
                      )}
                      {v.default && (
                        <span className="flex gap-1">
                          <span className="text-on-surface-50/60">
                            Default:{" "}
                          </span>
                          <span className="text-accent-500">
                            {v.default}
                          </span>
                        </span>
                      )}
                    </span>
                  </TaggedApiRow>
                );
              })}
              {standaloneVars.map((v) => (
                <TaggedApiRow
                  key={v.name}
                  tag="css-variable"
                  label={<span className="font-mono text-sm">{v.name}</span>}
                >
                  <span className="flex flex-col items-start gap-1.5 text-xs">
                    {v.description && (
                      <span className="text-on-surface-50/80">
                        {v.description}
                      </span>
                    )}
                    {v.default && (
                      <span className="flex gap-1">
                        <span className="text-on-surface-50/60">
                          Default:{" "}
                        </span>
                        <span className="text-accent-500">
                          {v.default}
                        </span>
                      </span>
                    )}
                  </span>
                </TaggedApiRow>
              ))}
            </ApiGroup>
          )} */}

          {/* ── Slot Classes ── */}
          {/* {slots && slots.length > 0 && (
            <ApiGroup label="Slot Classes">
              {slots.map((s) => (
                <TaggedApiRow
                  key={s.name}
                  tag="slot"
                  label={<span className="font-mono text-sm">{s.name}</span>}
                >
                  {s.description && (
                    <span className="text-on-surface-50/80">
                      {s.description}
                    </span>
                  )}
                </TaggedApiRow>
              ))}
            </ApiGroup>
          )} */}

          {/* ── Variants ── */}
          {/* {customVariants.length > 0 && (
            <ApiGroup label="Variants">
              {customVariants.map((v) => {
                const extra = variantInfoMap.get(v.name);
                return (
                  <ApiRow
                    key={v.name}
                    label={<span className="font-mono text-sm">{v.name}:</span>}
                  >
                    <span className="flex flex-col gap-0.5 text-xs">
                      {v.condition && (
                        <>
                          <span className="text-on-surface-50/60">
                            Selector:{" "}
                          </span>
                          <span className="break-all text-accent-500">
                            {v.condition}
                          </span>
                        </>
                      )}
                      {extra?.description && (
                        <span className="mt-1 text-on-surface-50/80">
                          {extra.description}
                        </span>
                      )}
                    </span>
                  </ApiRow>
                );
              })}
            </ApiGroup>
          )} */}
        </div>
      </DocSection>
    </DocPage>
  );
}

const TaggedApiRow = ({
  tag,
  label,
  children,
}: {
  tag: UtilityTag;
  label: ReactNode;
  children?: ReactNode;
}) => (
  <ApiRow
    label={
      <div className="flex flex-col items-start gap-2 max-desktop:pb-2">
        <TagBadge tag={tag} className="desktop:hidden" />
        {label}
      </div>
    }
  >
    <TagBadge tag={tag} className="max-desktop:hidden" />
    {children}
  </ApiRow>
);

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function patternValueToNodes(value: PatternValue | undefined) {
  if (!value) return [];

  return value.tokens.flatMap((t) =>
    typeof t === "string" ? t
    : t.type === "arbitrary" ? <span className="font-mono">[{t.dataType}]</span>
    : <span className="font-mono">{t.dataType}</span>,
  );
}
