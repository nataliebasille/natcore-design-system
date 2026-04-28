'use client'
import { useEffect, useRef, useState } from 'react'
import { usePlayground } from './playground-provider'
import { MarkupSpotlight } from '../doc/code-spotlight'
import { highlightPlaygroundMarkup } from './highlight-playground-markup'

export function PlaygroundCodeSnippet<T extends Record<string, unknown>>({
  ui,
  renderMarkup,
  initialHtml,
}: {
  ui: React.ReactNode
  renderMarkup: (values: T) => string
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
      const html = await highlightPlaygroundMarkup(rendererRef.current(values))

      if (mounted) setCode(html)
    }

    updateCode()

    return () => {
      mounted = false
    }
  }, [values])

  return (
    <MarkupSpotlight
      title="Preview"
      preview={<div className="flex justify-center">{ui}</div>}
      markup={code}
    />
  )
}
