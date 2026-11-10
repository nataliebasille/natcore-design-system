'use client'

import { usePlayground } from '@/app/_ui/playground/playground-provider'
import { renderToUi } from '@nataliebasille/preview-jsx-runtime'
import { getHeadingPlaygroundShowcase } from './get-showcase'
import type { HeadingControlValues } from './heading-playground-controls'

export function HeadingPlaygroundShowcaseUI() {
  const { values } = usePlayground<HeadingControlValues>()
  return <>{renderToUi(getHeadingPlaygroundShowcase(values))}</>
}
