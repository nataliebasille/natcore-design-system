import { DisplayPattern } from '@/ui/doc/display-pattern'
import { DocSection } from '@/ui/doc/DocPage.client'
import {
  ApiGroup,
  ApiRow,
  TagBadge,
  UtilityReference,
  UtilityValue,
  type UtilityTag,
} from '@/ui/doc/utility-reference'
import { StaticExample } from '@/ui/example/static-example'
import type { ComponentDoc, DocTableRow, PatternValue } from '@nataliebasille/css-engine'
import { renderToUi, type ShowcaseJsxChild } from '@nataliebasille/preview-jsx-runtime'
import type { PropsWithChildren, ReactNode } from 'react'

type DocEntity = ComponentDoc['components'][string]
type DerivedSection = NonNullable<ComponentDoc['slots']>

export function DesignItemPageSection({
  children,
  title,
  description,
}: PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <div className="mt-6 mb-8 card-soft">
      <div data-slot="content">
        <DocSection title={title} description={description} className="m-0">
          {children}
        </DocSection>
      </div>
    </div>
  )
}

/** The reference card for a component or utility: pattern, values, and what it composes with. */
export function EntityReference({
  entity,
  doc,
  tags,
  description,
  table = [],
}: {
  entity: DocEntity
  doc: ComponentDoc
  tags: UtilityTag[]
  description?: string
  table?: DocTableRow[]
}) {
  const composesWith = entity.composesWith.flatMap(({ id }) => {
    const pattern = doc.components[id]?.pattern ?? doc.utilities[id]?.pattern
    return pattern ? [pattern] : []
  })

  return (
    <UtilityReference
      description={description}
      tags={[...tags, ...(composesWith.length > 0 ? (['composable'] as const) : [])]}
      table={[
        { label: 'Pattern', content: <DisplayPattern pattern={entity.pattern} /> },
        ...(entity.pattern.value
          ? [
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
        ...(entity.pattern.modifier
          ? [
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
        ...(composesWith.length > 0
          ? [
              {
                label: 'Composes with',
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
        ...toReferenceRows(table),
      ]}
    />
  )
}

/** The reference card for a component's slots or custom variants. */
export function DerivedReference({
  section,
  tag,
  description,
  table = [],
}: {
  section: DerivedSection
  tag: UtilityTag
  description?: string
  table?: DocTableRow[]
}) {
  return (
    <UtilityReference
      tags={[tag]}
      description={description}
      table={[
        ...section.entries.map((entry) => ({
          label: tag === 'custom-variant' ? `${entry.name}:` : entry.name,
          content: renderToUi(entry.selector),
        })),
        ...toReferenceRows(table),
      ]}
    />
  )
}

export function ExampleEntry({
  title,
  description,
  source,
  table,
}: {
  title?: string
  description?: string
  source: ShowcaseJsxChild
  table?: DocTableRow[]
}) {
  return (
    <DocSection
      className="mt-4 last:mb-0"
      title={title ?? ''}
      description={<div className="mb-2">{description}</div>}
    >
      <StaticExample.FromShowcaseJsx source={source} />
      {table && table.length > 0 && (
        <div className="mt-4">
          <UtilityReference description={undefined} table={toReferenceRows(table)} />
        </div>
      )}
    </DocSection>
  )
}

/** The API reference for everything a component defines, generated from its builder. */
export function ApiReference({ doc }: { doc: ComponentDoc }) {
  const entities = [...Object.entries(doc.components), ...Object.entries(doc.utilities)]

  return (
    <DesignItemPageSection title="API Reference">
      <div className="space-y-8">
        {entities.length > 0 && (
          <ApiGroup label="Classes">
            {entities.map(([key, meta]) => (
              <ApiReferenceRow
                key={key}
                tag="component"
                label={<DisplayPattern pattern={meta.pattern} />}
                description={meta.description}
              >
                <div className="grid grid-cols-[max-content_1fr] items-start gap-x-4 gap-y-2 text-xs desktop:mt-2">
                  {meta.pattern.value && (
                    <>
                      <span className="text-on-surface-50/60">
                        {capitalize(meta.pattern.value.name)}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <UtilityValue values={patternValueToNodes(meta.pattern.value)} />
                      </div>
                    </>
                  )}

                  {meta.pattern.modifier && (
                    <>
                      <span className="text-on-surface-50/60">
                        {capitalize(meta.pattern.modifier.name)}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <UtilityValue
                          values={patternValueToNodes(meta.pattern.modifier)}
                          defaultValue={meta.pattern.modifier.default}
                        />
                      </div>
                    </>
                  )}
                </div>
              </ApiReferenceRow>
            ))}
          </ApiGroup>
        )}

        {doc.slots && doc.slots.entries.length > 0 && (
          <ApiGroup label="Slots">
            {doc.slots.entries.map((slot) => (
              <ApiReferenceRow
                key={slot.name}
                tag="slot"
                label={<span className="font-mono text-sm">{slot.name}</span>}
                description={
                  doc.slots?.description ||
                  'Add the slot selector to a child element to replace the default rendered part.'
                }
              >
                <SelectorDetail selector={slot.selector} />
              </ApiReferenceRow>
            ))}
          </ApiGroup>
        )}

        {doc.customVariants && doc.customVariants.entries.length > 0 && (
          <ApiGroup label="Custom Variants">
            {doc.customVariants.entries.map((variant) => (
              <ApiReferenceRow
                key={variant.name}
                tag="custom-variant"
                label={<span className="font-mono text-sm">{variant.name}:</span>}
                description={
                  doc.customVariants?.description ||
                  'Custom variant derived from component state selectors.'
                }
              >
                <SelectorDetail selector={variant.selector} breakAll />
              </ApiReferenceRow>
            ))}
          </ApiGroup>
        )}

        {doc.cssvars.length > 0 && (
          <ApiGroup label="CSS Variables">
            {doc.cssvars.map((cssVar) => (
              <ApiReferenceRow
                key={cssVar.varName}
                tag="css-variable"
                label={<span className="font-mono text-sm">{cssVar.varName}</span>}
                description={cssVar.description}
              >
                {cssVar.defaultValue && (
                  <div className="flex gap-1 pt-2 text-xs text-on-surface-50/60">
                    <span className="font-bold">default:</span>
                    <span className="font-mono tracking-wider text-accent-500">
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
  )
}

export function toReferenceRows(table: DocTableRow[]) {
  return table.map((row) => ({ label: row.label, content: renderToUi(row.content) }))
}

function ApiReferenceRow({
  label,
  tag,
  description,
  children,
}: {
  label: ReactNode
  tag: UtilityTag
  description: string
  children: ReactNode
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
        <div className="mb-2 text-xs text-on-surface-50/70 desktop:mt-2">{description}</div>
      )}

      {children}
    </ApiRow>
  )
}

function SelectorDetail({ selector, breakAll }: { selector: string; breakAll?: boolean }) {
  return (
    <div className="mt-2 flex gap-1 text-xs text-on-surface-50/60">
      <span className="font-bold">selector:</span>
      <span className={`font-mono tracking-wider text-accent-500 ${breakAll ? 'break-all' : ''}`}>
        {selector}
      </span>
    </div>
  )
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function patternValueToNodes(value: PatternValue | undefined) {
  if (!value) return []

  return value.tokens.flatMap((t) =>
    typeof t === 'string' ? (
      t
    ) : t.type === 'arbitrary' ? (
      <span className="font-mono text-accent-500">[{t.dataType === '*' ? 'any' : t.dataType}]</span>
    ) : (
      <span className="font-mono text-accent-500">{t.dataType}</span>
    )
  )
}
