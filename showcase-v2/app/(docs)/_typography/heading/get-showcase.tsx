/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { HeadingControlValues } from './heading-playground-controls'

export function getHeadingPlaygroundShowcase(values: HeadingControlValues) {
  const text = values.text || 'The quick brown fox'

  if (values.element === 'class') {
    return <p className={`heading-${values.level}`}>{text}</p>
  }

  const Heading = `h${values.level}` as const
  return <Heading>{text}</Heading>
}
