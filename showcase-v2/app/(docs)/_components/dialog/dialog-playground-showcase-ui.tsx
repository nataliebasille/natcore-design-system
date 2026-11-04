'use client'

import { usePlayground } from '@/app/_ui/playground/playground-provider'
import { renderToUi } from '@nataliebasille/preview-jsx-runtime'
import { getDialogPlaygroundShowcase } from './get-showcase'
import type { DialogControlValues } from './dialog-playground-controls'

export function DialogPlaygroundShowcaseUI() {
  const { values } = usePlayground<DialogControlValues>()
  return <>{renderToUi(getDialogPlaygroundShowcase(values))}</>
}
