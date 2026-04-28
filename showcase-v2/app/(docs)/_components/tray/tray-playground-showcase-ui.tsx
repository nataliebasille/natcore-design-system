'use client'

import { usePlayground } from '@/app/_ui/playground/playground-provider'
import { renderToUi } from '@nataliebasille/preview-jsx-runtime'
import { getTrayPlaygroundShowcase } from './get-showcase'
import type { TrayControlValues } from './tray-playground-controls'

export function TrayPlaygroundShowcaseUI() {
  const { values } = usePlayground<TrayControlValues>()
  return <>{renderToUi(getTrayPlaygroundShowcase(values))}</>
}
