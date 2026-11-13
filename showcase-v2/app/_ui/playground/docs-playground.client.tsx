'use client'

import { docsModuleDefault } from '@/utlls/docs-module'
import {
  toDocModel,
  type DocBlock,
  type DocPlaygroundBlock,
  type PlaygroundControlValue,
  type ResolvedControl,
} from '@nataliebasille/css-engine'
import { renderToMarkup, renderToUi } from '@nataliebasille/preview-jsx-runtime'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { Playground } from './playground'
import { PlaygroundFormElement } from './playground-form-element'
import { usePlayground } from './playground-provider'

type Values = Record<string, PlaygroundControlValue>
type Render = DocPlaygroundBlock['render']

export function DocsPlaygroundClient({
  docsModulePath,
  controls,
  defaultValues,
  initialPreview,
  initialMarkup,
  initialHtml,
}: {
  docsModulePath: string
  controls: ResolvedControl[]
  defaultValues: Values
  initialPreview: ReactNode
  initialMarkup: string
  initialHtml: string
}) {
  const render = usePlaygroundRender(docsModulePath)

  return (
    <Playground<Values>
      defaultValues={defaultValues}
      initialHtml={initialHtml}
      controls={
        // Disabled until `render` loads, so no change is shown with stale markup.
        <fieldset disabled={!render} className="grid grid-cols-2 gap-4">
          {controls.map((control) => (
            <ControlField key={control.name} control={control} />
          ))}
        </fieldset>
      }
      ui={<PlaygroundPreview render={render} initialPreview={initialPreview} />}
      renderMarkup={(values) => (render ? renderToMarkup(render(values)) : initialMarkup)}
    />
  )
}

function usePlaygroundRender(docsModulePath: string) {
  const [render, setRender] = useState<Render>()

  useEffect(() => {
    let active = true

    // Static `.docs.tsx` suffix so Turbopack only bundles docs modules.
    import(`../../../../packages/core-v2/src/${docsModulePath}.docs.tsx`).then((mod: unknown) => {
      const block = toDocModel(docsModuleDefault(mod)).blocks.find(isPlayground)
      if (active && block) setRender(() => block.render)
    })

    return () => {
      active = false
    }
  }, [docsModulePath])

  return render
}

function PlaygroundPreview({
  render,
  initialPreview,
}: {
  render: Render | undefined
  initialPreview: ReactNode
}) {
  const { values } = usePlayground<Values>()
  return <>{render ? renderToUi(render(values)) : initialPreview}</>
}

function ControlField({ control }: { control: ResolvedControl }) {
  switch (control.kind) {
    case 'select':
      return (
        <PlaygroundFormElement<Values>
          name={control.name}
          label={control.label}
          input={
            <select>
              {control.options.map((option) => (
                <option key={option} value={option}>
                  {toLabel(option)}
                </option>
              ))}
            </select>
          }
        />
      )
    case 'text':
      return (
        <PlaygroundFormElement<Values>
          name={control.name}
          label={control.label}
          input={<input type="text" />}
        />
      )
    case 'boolean':
      return (
        <PlaygroundFormElement<Values>
          name={control.name}
          label={control.label}
          input={BooleanControl}
        />
      )
  }
}

function BooleanControl({
  value,
  onChange,
}: {
  value: PlaygroundControlValue
  onChange: (value: PlaygroundControlValue) => void
}) {
  const name = useId()

  return (
    <div className="-ml-(--btn-padding-inline) btn-group-ghost btn-size-sm">
      <label>
        Off
        <input type="radio" name={name} checked={value !== true} onChange={() => onChange(false)} />
      </label>
      <label>
        On
        <input type="radio" name={name} checked={value === true} onChange={() => onChange(true)} />
      </label>
    </div>
  )
}

function isPlayground(block: DocBlock): block is DocPlaygroundBlock {
  return block.kind === 'playground'
}

function toLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
