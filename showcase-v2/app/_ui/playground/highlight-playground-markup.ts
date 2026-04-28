import { formatCode } from '@/utlls/format-code'
import { codeToHtml } from 'shiki/bundle/web'

export async function highlightPlaygroundMarkup(markup: string) {
  const formattedMarkup = await formatCode(markup, 'html')

  return codeToHtml(formattedMarkup, {
    lang: 'html',
    theme: 'github-dark',
    structure: 'inline',
  })
}
