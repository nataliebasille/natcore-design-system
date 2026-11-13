import { findDocsEntry, listDocsEntries, loadDocsModule } from '@/server/docs-index'
import { DocsModelPage } from '@/ui/doc/docs-page'
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

  return <DocsModelPage model={await loadDocsModule(entry.module)} docsModulePath={entry.module} />
}
