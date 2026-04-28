'use client'

import { usePlayground } from '@/app/_ui/playground/playground-provider'
import { renderToUi } from '@nataliebasille/preview-jsx-runtime'
import { getListPlaygroundShowcase } from './get-showcase'
import type { ListControlValues } from './list-playground-controls'

export function ListPlaygroundShowcaseUI() {
  const { values } = usePlayground<ListControlValues>()
  return <>{renderToUi(getListPlaygroundShowcase(values))}</>
}
