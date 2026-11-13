import { getModuleDoc } from '@/server/get-tailwind-modules'
import {
  findDocsEntry,
  listDocsEntries,
  loadDocsModule,
  type DocsEntry,
} from '@/server/docs-index'
import {
  ApiReference,
  DerivedReference,
  DesignItemPageSection,
  EntityReference,
  ExampleEntry,
  toReferenceRows,
} from '@/ui/doc/design-item'
import { DocPage } from '@/ui/doc/DocPage'
import { DocsModelPage } from '@/ui/doc/docs-page'
import { Spotlight } from '@/ui/doc/spotlight'
import { UtilityReference, type UtilityTag } from '@/ui/doc/utility-reference'
import { createDoc, type ComponentDoc } from '@nataliebasille/css-engine'
import { renderToUi } from '@nataliebasille/preview-jsx-runtime'
import { notFound } from 'next/navigation'

export const dynamicParams = false
export const revalidate = false

export async function generateStaticParams() {
  const entries = await listDocsEntries()
  return entries.map((entry) => ({ designItem: entry.path }))
}

export default async function DesignItemPage({
  params,
}: {
  params: Promise<{ designItem: string[] }>
}) {
  const { designItem } = await params
  const entry = await findDocsEntry(designItem)

  if (!entry) {
    notFound()
  }

  if (entry.source === 'colocated') {
    return (
      <DocsModelPage
        model={await loadDocsModule(entry.module)}
        docsModulePath={entry.module}
      />
    )
  }

  return <LegacyDesignItemPage entry={entry} />
}

// Pages still documented in `app/(docs)/_<category>/<name>/doc.tsx`.
async function LegacyDesignItemPage({
  entry,
}: {
  entry: Extract<DocsEntry, { source: 'legacy' }>
}) {
  const moduleDoc = await getModuleDoc(entry)

  if (!moduleDoc) {
    notFound()
  }

  const Playground = moduleDoc.playground
  const resolvedDoc = createDoc(moduleDoc.module, moduleDoc.meta)
  const sections = moduleDoc.meta.sections ?? []

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

      {Object.entries(resolvedDoc.components).map(([key, component]) => (
        <EntitySection
          key={key}
          entity={component}
          showcases={moduleDoc.meta.components[key]?.showcases}
          doc={resolvedDoc}
          tag="component"
        />
      ))}
      {Object.entries(resolvedDoc.utilities).map(([key, utility]) => (
        <EntitySection
          key={key}
          entity={utility}
          showcases={moduleDoc.meta.utilities?.[key]?.showcases}
          doc={resolvedDoc}
          tag="modifier"
        />
      ))}
      {sections.map((section, index) => (
        <DesignItemPageSection
          key={`${section.title}-${index}`}
          title={section.title}
          description={section.description}
        >
          {((section.tags && section.tags.length > 0) ||
            (section.table && section.table.length > 0)) && (
            <UtilityReference
              tags={section.tags}
              description={undefined}
              table={toReferenceRows(section.table ?? [])}
            />
          )}
          <Showcases showcases={section.showcases} />
        </DesignItemPageSection>
      ))}
      {resolvedDoc.slots && <DerivedSection section={resolvedDoc.slots} tag="slot" />}
      {resolvedDoc.customVariants && (
        <DerivedSection section={resolvedDoc.customVariants} tag="custom-variant" />
      )}
      <div className="divider"></div>
      <ApiReference doc={resolvedDoc} />
    </DocPage>
  )
}

function EntitySection({
  entity,
  showcases,
  doc,
  tag,
}: {
  entity: ComponentDoc['components'][string]
  showcases: DocShowcaseEntry[] | undefined
  doc: ComponentDoc
  tag: UtilityTag
}) {
  return (
    <DesignItemPageSection title={entity.name}>
      <EntityReference entity={entity} doc={doc} tags={[tag]} description={entity.description} />
      <Showcases showcases={showcases} />
    </DesignItemPageSection>
  )
}

function DerivedSection({
  section,
  tag,
}: {
  section: NonNullable<ComponentDoc['slots']>
  tag: UtilityTag
}) {
  return (
    <DesignItemPageSection title={section.title}>
      <DerivedReference section={section} tag={tag} description={section.description} />
      <Showcases showcases={section.showcases} />
    </DesignItemPageSection>
  )
}

function Showcases({ showcases }: { showcases: DocShowcaseEntry[] | undefined }) {
  return showcases?.map((showcase, index) => (
    <ExampleEntry
      key={index}
      title={showcase.title}
      description={showcase.description}
      source={showcase.content}
      table={showcase.table}
    />
  ))
}
