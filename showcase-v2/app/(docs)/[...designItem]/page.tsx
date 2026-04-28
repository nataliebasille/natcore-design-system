import {
  getModuleDoc,
  listTailwindModules,
} from "@/server/get-tailwind-modules";
import { DisplayPattern } from "@/ui/doc/display-pattern";
import { DocPage } from "@/ui/doc/DocPage";
import { DocSection } from "@/ui/doc/DocPage.client";
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
import {
  renderToUi,
  type ShowcaseJsxChild,
} from "@nataliebasille/preview-jsx-runtime";
import { notFound } from "next/navigation";
import { type PropsWithChildren, type ReactNode } from "react";

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
  const sections = moduleDoc.meta.sections ?? [];

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
      {sections.map((section, index) => (
        <StandaloneSection
          key={`${section.title}-${index}`}
          section={section}
        />
      ))}
      {resolvedDoc.slots && <DerivedSlotsSection section={resolvedDoc.slots} />}
      {resolvedDoc.customVariants && (
        <DerivedCustomVariantsSection section={resolvedDoc.customVariants} />
      )}
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
                              defaultValue={meta.pattern.modifier.default}
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

          {resolvedDoc.slots && resolvedDoc.slots.entries.length > 0 && (
            <ApiGroup label="Slots">
              {resolvedDoc.slots.entries.map((slot) => (
                <ApiReferenceRow
                  key={slot.name}
                  tag="slot"
                  label={<span className="font-mono text-sm">{slot.name}</span>}
                  description={
                    resolvedDoc.slots?.description ||
                    "Add the slot selector to a child element to replace the default rendered part."
                  }
                >
                  <div className="mt-2 flex gap-1 text-xs text-on-tone-50-surface/60">
                    <span className="font-bold">selector:</span>
                    <span className="font-mono tracking-wider text-tone-500-accent">
                      {slot.selector}
                    </span>
                  </div>
                </ApiReferenceRow>
              ))}
            </ApiGroup>
          )}

          {resolvedDoc.customVariants &&
            resolvedDoc.customVariants.entries.length > 0 && (
              <ApiGroup label="Custom Variants">
                {resolvedDoc.customVariants.entries.map((variant) => (
                  <ApiReferenceRow
                    key={variant.name}
                    tag="custom-variant"
                    label={
                      <span className="font-mono text-sm">{variant.name}:</span>
                    }
                    description={
                      resolvedDoc.customVariants?.description ||
                      "Custom variant derived from component state selectors."
                    }
                  >
                    <div className="mt-2 flex gap-1 text-xs text-on-tone-50-surface/60">
                      <span className="font-bold">selector:</span>
                      <span className="font-mono tracking-wider break-all text-tone-500-accent">
                        {variant.selector}
                      </span>
                    </div>
                  </ApiReferenceRow>
                ))}
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
                    <div className="flex gap-1 pt-2 text-xs text-on-tone-50-surface/60">
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
      <div data-slot="content">
        <DocSection title={title} description={description}>
          {children}
        </DocSection>
      </div>
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
                    defaultValue={entity.pattern.modifier.default}
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

function StandaloneSection({ section }: { section: DocStandaloneSection }) {
  return (
    <DesignItemPageSection
      title={section.title}
      description={section.description}
    >
      {((section.tags && section.tags.length > 0) ||
        (section.table && section.table.length > 0)) && (
        <UtilityReference
          tags={section.tags}
          description={undefined}
          table={
            section.table?.map((row) => ({
              label: row.label,
              content: renderToUi(row.content as ShowcaseJsxChild),
            })) ?? []
          }
        />
      )}

      {section.showcases?.map((showcase, index) => (
        <DocSection
          className="mt-4"
          key={index}
          title={showcase.title ?? ""}
          description={<div className="mb-2">{showcase.description}</div>}
        >
          <StaticExample.FromShowcaseJsx source={showcase.content} />
        </DocSection>
      ))}
    </DesignItemPageSection>
  );
}

function DerivedSlotsSection({
  section,
}: {
  section: NonNullable<ComponentDoc["slots"]>;
}) {
  return (
    <DesignItemPageSection title={section.title}>
      <UtilityReference
        tags={["slot"]}
        description={section.description}
        table={section.entries.map((slot) => ({
          label: slot.name,
          content: renderToUi(slot.selector),
        }))}
      />

      {section.showcases?.map((showcase, index) => (
        <DocSection
          className="mt-4"
          key={index}
          title={showcase.title ?? ""}
          description={<div className="mb-2">{showcase.description}</div>}
        >
          <StaticExample.FromShowcaseJsx source={showcase.content} />
        </DocSection>
      ))}
    </DesignItemPageSection>
  );
}

function DerivedCustomVariantsSection({
  section,
}: {
  section: NonNullable<ComponentDoc["customVariants"]>;
}) {
  return (
    <DesignItemPageSection title={section.title}>
      <UtilityReference
        tags={["custom-variant"]}
        description={section.description}
        table={section.entries.map((variant) => ({
          label: `${variant.name}:`,
          content: renderToUi(variant.selector),
        }))}
      />

      {section.showcases?.map((showcase, index) => (
        <DocSection
          className="mt-4"
          key={index}
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

      {description && (
        <div className="mb-2 text-xs text-on-tone-50-surface/70 desktop:mt-2">
          {description}
        </div>
      )}

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
