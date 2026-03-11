'use client'
import { CodeSnippet } from '../code-snippet/code-snippet'
import { usePlayground } from './playground-provider'
import type { PlaygroundValues } from './playground'
import { codeToHtml } from 'shiki/bundle/web'
import { useRef, useEffect, useState, useLayoutEffect } from 'react'

export function PlaygroundCodeSnippet<const T extends Record<string, React.ReactElement>>({
  renderMarkup,
  initialHtml,
}: {
  renderMarkup: (values: PlaygroundValues<T>) => string
  initialHtml: string
}) {
  const rendererRef = useRef(renderMarkup)
  const [code, setCode] = useState(initialHtml)
  useEffect(() => {
    rendererRef.current = renderMarkup
  })

  const { values } = usePlayground<T>()

  useEffect(() => {
    let mounted = true
    const updateCode = async () => {
      const html = await codeToHtml(rendererRef.current(values), {
        lang: 'html',
        theme: 'github-dark',
        structure: 'inline',
      })

      if (mounted) setCode(html)
    }

    updateCode()

    return () => {
      mounted = false
    }
  }, [values])

  return <CodeSnippet language="html" code={code} />
}
