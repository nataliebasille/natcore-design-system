import {
  getModuleDoc,
  listTailwindModules,
} from "@/server/get-tailwind-modules";
import { ComponentDocPage } from "@/ui/doc/component-doc-page";
import { DisplayPattern } from "@/ui/doc/display-pattern";
import { DocPage } from "@/ui/doc/DocPage";
import { DocSection } from "@/ui/doc/DocPage.client";
import { ShowcaseSpotlight } from "@/ui/doc/showcase-spotlight";
import { Spotlight } from "@/ui/doc/spotlight";
import {
  ApiGroup,
  ApiRow,
  TagBadge,
  UtilityReference,
  UtilityValue,
  type UtilityTag,
} from "@/ui/doc/utility-reference";
import { StaticExample } from "@/ui/example/static-example";
import {
  type ComponentBuilder,
  createDoc,
  type ComponentDoc,
  type PatternValue,
} from "@nataliebasille/css-engine";
import { renderToUi } from "@nataliebasille/preview-jsx-runtime";
import { notFound } from "next/navigation";
import { Fragment, type PropsWithChildren, type ReactNode } from "react";

export async function generateStaticParams() {
  const modules = await listTailwindModules();
  return modules.map((m) => ({ designItem: [...m.category, m.name] }));
}

export default async function DesignItemPage({
  params,
}: {
  params: Promise<{ designItem: string[] }>;
}) {
  const { designItem } = await params;
  const entry = {
    category: designItem.slice(0, -1),
    name: designItem.slice(-1)[0]!,
  };

  const moduleDoc = await getModuleDoc(entry);

  if (!moduleDoc) {
    notFound();
  }

  const Playground = moduleDoc.playground;
  const resolvedDoc = createDoc(moduleDoc.module, moduleDoc.meta);

  return (
    <DocPage title={resolvedDoc.title} description={resolvedDoc.description}>
      {moduleDoc.meta.atAGlance && (
        <DesignItemPageSection title="At a glance">
          <Spotlight>{renderToUi(moduleDoc.meta.atAGlance)}</Spotlight>
        </DesignItemPageSection>
      )}
      <DesignItemPageSection title="Playground">
        <Playground />
      </DesignItemPageSection>

      <div className="divider"></div>

      {Object.entries(resolvedDoc.components ?? {}).map(([key, component]) => (
        <EntitySection
          key={key}
          entity={component}
          entityMeta={
            moduleDoc.meta.components?.[
              key as keyof typeof moduleDoc.meta.components
            ]!
          }
          doc={resolvedDoc}
          tags={["component"]}
        />
      ))}
      {Object.entries(resolvedDoc.utilities ?? {}).map(([key, utility]) => (
        <EntitySection
          key={key}
          entity={utility}
          entityMeta={
            moduleDoc.meta.utilities?.[
              key as keyof typeof moduleDoc.meta.utilities
            ]!
          }
          doc={resolvedDoc}
          tags={["modifier"]}
        />
      ))}
      <div className="divider"></div>
      <DesignItemPageSection title="API Reference">
        <div className="space-y-8">
          {/* ── Classes ── */}
          {(Object.keys(resolvedDoc.components).length > 0 ||
            Object.keys(resolvedDoc.utilities).length > 0) && (
            <ApiGroup label="Classes">
              {[
                ...Object.entries(resolvedDoc.components),
                ...Object.entries(resolvedDoc.utilities),
              ].map(([key, meta]) => {
                return (
                  <ApiReferenceRow
                    key={key}
                    tag="component"
                    label={<DisplayPattern pattern={meta.pattern} />}
                    description={meta.description}
                  >
                    <div className="grid grid-cols-[max-content_1fr] items-start gap-x-4 gap-y-2 text-xs desktop:mt-2">
                      {meta.pattern.value && (
                        <>
                          <span className="text-on-tone-50-surface/60">
                            {capitalize(meta.pattern.value.name)}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            <UtilityValue
                              values={patternValueToNodes(meta.pattern.value)}
                            />
                          </div>
                        </>
                      )}

                      {meta.pattern.modifier && (
                        <>
                          <span className="text-on-tone-50-surface/60">
                            {capitalize(meta.pattern.modifier.name)}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            <UtilityValue
                              values={patternValueToNodes(
                                meta.pattern.modifier,
                              )}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </ApiReferenceRow>
                );
              })}
            </ApiGroup>
          )}

          {Object.keys(resolvedDoc.cssvars ?? {}).length > 0 && (
            <ApiGroup label="CSS Variables">
              {Object.entries(resolvedDoc.cssvars).map(([key, cssVar]) => (
                <ApiReferenceRow
                  key={key}
                  tag="css-variable"
                  label={
                    <span className="font-mono text-sm">{cssVar.varName}</span>
                  }
                  description={cssVar.description}
                >
                  {cssVar.defaultValue && (
                    <div className="mt-2 flex gap-1 text-xs text-on-tone-50-surface/60">
                      <span className="font-bold">default:</span>
                      <span className="font-mono tracking-wider text-tone-500-accent">
                        {cssVar.defaultValue}
                      </span>
                    </div>
                  )}
                </ApiReferenceRow>
              ))}
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
                        <span className="text-on-tone-50-surface/80">
                          {extra.description}
                        </span>
                      )}
                      {v.default && (
                        <span className="flex gap-1">
                          <span className="text-on-tone-50-surface/60">
                            Default:{" "}
                          </span>
                          <span className="text-tone-500-accent">
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
                      <span className="text-on-tone-50-surface/80">
                        {v.description}
                      </span>
                    )}
                    {v.default && (
                      <span className="flex gap-1">
                        <span className="text-on-tone-50-surface/60">
                          Default:{" "}
                        </span>
                        <span className="text-tone-500-accent">
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
                    <span className="text-on-tone-50-surface/80">
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
                          <span className="text-on-tone-50-surface/60">
                            Selector:{" "}
                          </span>
                          <span className="break-all text-tone-500-accent">
                            {v.condition}
                          </span>
                        </>
                      )}
                      {extra?.description && (
                        <span className="mt-1 text-on-tone-50-surface/80">
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
      </DesignItemPageSection>
    </DocPage>
  );
}

function DesignItemPageSection({
  children,
  title,
  description,
}: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <div className="mt-6 mb-8 card-soft">
      <DocSection
        className="card-content"
        title={title}
        description={description}
      >
        {children}
      </DocSection>
    </div>
  );
}

function EntitySection({
  entity,
  entityMeta,
  doc,
  tags,
}: {
  entity:
    | ComponentDoc["components"][string]
    | ComponentDoc["utilities"][string];
  entityMeta:
    | Documentation<ComponentBuilder>["components"][string]
    | Documentation<ComponentBuilder>["utilities"][string];
  doc: ComponentDoc;
  tags: UtilityTag[];
}) {
  const composesWith =
    entity.composesWith
      .map(
        ({ id }) =>
          doc.components?.[id]?.pattern ?? doc.utilities?.[id]?.pattern,
      )
      .filter((x) => !!x) ?? [];

  return (
    <DesignItemPageSection title={entity.name}>
      <UtilityReference
        description={entity.description}
        tags={[
          ...tags,
          ...(composesWith.length > 0 ? (["composable"] as const) : []),
        ]}
        table={[
          {
            label: "Pattern",
            content: <DisplayPattern pattern={entity.pattern} />,
          },
          ...(entity.pattern.value ?
            [
              {
                label: capitalize(entity.pattern.value.name),
                content: (
                  <UtilityValue
                    values={patternValueToNodes(entity.pattern.value)}
                    defaultValue={entity.pattern.value.default}
                  />
                ),
              },
            ]
          : []),
          ...(entity.pattern.modifier ?
            [
              {
                label: capitalize(entity.pattern.modifier.name),
                content: (
                  <UtilityValue
                    values={patternValueToNodes(entity.pattern.modifier)}
                  />
                ),
              },
            ]
          : []),
          ...(composesWith.length > 0 ?
            [
              {
                label: "Composes with",
                content: (
                  <UtilityValue
                    values={composesWith.map((pattern) => (
                      <DisplayPattern pattern={pattern} />
                    ))}
                    divider="+"
                  />
                ),
              },
            ]
          : []),
        ]}
      />

      {entityMeta.showcases?.map((showcase, i) => (
        <DocSection
          className="mt-4"
          key={i}
          title={showcase.title ?? ""}
          description={<div className="mb-2">{showcase.description}</div>}
        >
          <StaticExample.FromShowcaseJsx source={showcase.content} />
        </DocSection>
      ))}
    </DesignItemPageSection>
  );
}

function ApiReferenceRow({
  label,
  tag,
  description,
  children,
}: {
  label: ReactNode;
  tag: UtilityTag;
  description: string;
  children: ReactNode;
}) {
  return (
    <ApiRow
      label={
        <div className="flex flex-col items-start gap-2 max-desktop:pb-2">
          <TagBadge tag={tag} className="desktop:hidden" />
          {label}
        </div>
      }
    >
      <TagBadge tag={tag} className="max-desktop:hidden" />

      <div className="mb-2 text-xs text-on-tone-50-surface/70 desktop:mt-2">
        {description}
      </div>

      {children}
    </ApiRow>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function patternValueToNodes(value: PatternValue | undefined) {
  if (!value) return [];

  return value.tokens.flatMap((t) =>
    typeof t === "string" ? t
    : t.type === "arbitrary" ?
      <span className="font-mono text-tone-500-accent">[{t.dataType}]</span>
    : <span className="font-mono text-tone-500-accent">{t.dataType}</span>,
  );
}
