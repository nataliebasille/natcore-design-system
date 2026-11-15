import {
  ApiReference,
  DerivedReference,
  DesignItemPageSection,
  EntityReference,
  ExampleEntry,
  toReferenceRows,
} from '@/ui/doc/design-item'
import { DocPage } from '@/ui/doc/DocPage'
import { Spotlight } from '@/ui/doc/spotlight'
import { UtilityReference } from '@/ui/doc/utility-reference'
import { DocsPlayground } from '@/ui/playground/docs-playground'
import type { ComponentDoc, DocModel, DocSectionBlock } from '@nataliebasille/css-engine'
import { renderToUi } from '@nataliebasille/preview-jsx-runtime'

/** Renders a page model built from a colocated `*.docs.tsx`. */
export function DocsModelPage({
  model,
  docsModulePath,
}: {
  model: DocModel
  docsModulePath: string
}) {
  return (
    <DocPage title={model.title} description={model.description}>
      {model.issues.length > 0 && <DocIssues issues={model.issues} />}

      {model.atAGlance !== undefined && (
        <DesignItemPageSection title="At a glance">
          <Spotlight>{renderToUi(model.atAGlance)}</Spotlight>
        </DesignItemPageSection>
      )}

      {model.blocks.map((block, index) => {
        switch (block.kind) {
          case 'prose':
            return <div key={index}>{renderToUi(block.node)}</div>
          case 'playground':
            return (
              <div key={index}>
                <DesignItemPageSection title="Playground">
                  <DocsPlayground block={block} docsModulePath={docsModulePath} />
                </DesignItemPageSection>
                <div className="divider"></div>
              </div>
            )
          case 'section':
            return <SectionBlock key={index} block={block} api={model.api} />
        }
      })}

      {model.api && (
        <>
          <div className="divider"></div>
          <ApiReference doc={model.api} />
        </>
      )}
    </DocPage>
  )
}

function SectionBlock({ block, api }: { block: DocSectionBlock; api: ComponentDoc | undefined }) {
  const keyed = block.entity !== undefined || block.derived !== undefined

  return (
    <DesignItemPageSection title={block.title} description={keyed ? undefined : block.description}>
      {block.entity && api ? (
        <EntityReference
          entity={block.entity}
          doc={api}
          tags={[block.entityKind === 'component' ? 'component' : 'modifier']}
          description={block.description}
          table={block.table}
        />
      ) : block.derived ? (
        <DerivedReference
          section={block.derived}
          tag={block.entityKind === 'slots' ? 'slot' : 'custom-variant'}
          description={block.description}
          table={block.table}
        />
      ) : block.table && block.table.length > 0 ? (
        <UtilityReference description={undefined} table={toReferenceRows(block.table)} />
      ) : null}

      {block.content.map((content, index) =>
        content.kind === 'example' ? (
          <ExampleEntry
            key={index}
            title={content.title}
            description={content.description}
            source={content.source}
            table={content.table}
          />
        ) : (
          <div key={index} className="mt-4">
            {renderToUi(content.node)}
          </div>
        )
      )}
    </DesignItemPageSection>
  )
}

function DocIssues({ issues }: { issues: string[] }) {
  return (
    <div role="alert" className="mb-6 card-soft/danger">
      <div data-slot="content">
        <p className="font-semibold">This docs file has authoring issues:</p>
        <ul className="list-disc pl-6">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
