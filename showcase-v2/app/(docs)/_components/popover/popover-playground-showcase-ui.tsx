'use client'

import { usePlayground } from '@/app/_ui/playground/playground-provider'
import { renderToUi } from '@nataliebasille/preview-jsx-runtime'
import { getPopoverPlaygroundShowcase } from './get-showcase'
import type { PopoverControlValues } from './popover-playground-controls'

export function PopoverPlaygroundShowcaseUI() {
  const { values } = usePlayground<PopoverControlValues>()
  return <>{renderToUi(getPopoverPlaygroundShowcase(values))}</>
}
