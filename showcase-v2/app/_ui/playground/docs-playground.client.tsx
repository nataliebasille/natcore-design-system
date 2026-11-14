'use client'

import { docsModuleDefault } from '@/utlls/docs-module'
import {
  toDocModel,
  type DocBlock,
  type DocPlaygroundBlock,
  type PlaygroundControlValue,
  type ResolvedControl,
  type ResolvedNumberRange,
} from '@nataliebasille/css-engine'
import { renderToMarkup, renderToUi } from '@nataliebasille/preview-jsx-runtime'
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react'
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
      if (control.custom) return <SelectWithCustomField control={control} custom={control.custom} />
      return (
        <PlaygroundFormElement<Values>
          name={control.name}
          label={control.label}
          input={
            <select>
              {control.options.map((option) => (
                <option key={option} value={option}>
                  {control.optionLabels[option] ?? option}
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
    case 'number':
      return <NumberField control={control} />
    case 'boolean':
      return <BooleanField control={control} />
  }
}

type SelectControl = Extract<ResolvedControl, { kind: 'select' }>
type CustomNumber = NonNullable<SelectControl['custom']>

// The custom option's value; a docs file would never use it as an option.
const CUSTOM_OPTION = '__playground-custom__'

function SelectWithCustomField({
  control,
  custom,
}: {
  control: SelectControl
  custom: CustomNumber
}) {
  // Stable so the inputs aren't remounted (losing focus) on every render.
  const input = useMemo(
    () =>
      function Input(props: {
        value: PlaygroundControlValue
        onChange: (value: PlaygroundControlValue) => void
      }) {
        return <SelectWithCustom {...props} control={control} custom={custom} />
      },
    [control, custom]
  )

  return <PlaygroundFormElement<Values> name={control.name} label={control.label} input={input} />
}

/** The options plus a custom one; picking it shows a number input whose value is the control's value. */
function SelectWithCustom({
  value,
  onChange,
  control,
  custom,
}: {
  value: PlaygroundControlValue
  onChange: (value: PlaygroundControlValue) => void
  control: SelectControl
  custom: CustomNumber
}) {
  const isCustom = typeof value === 'number'
  // The last number entered, restored when switching back to the custom option.
  const [lastCustom, setLastCustom] = useState(custom.default)

  // Fragment, so the select is a direct child of the form-control and fills
  // the field like a plain select; the number input sits in its suffix.
  return (
    <>
      <select
        aria-label={control.label}
        value={isCustom ? CUSTOM_OPTION : String(value)}
        onChange={(event) =>
          onChange(event.target.value === CUSTOM_OPTION ? lastCustom : event.target.value)
        }
      >
        {control.options.map((option) => (
          <option key={option} value={option}>
            {control.optionLabels[option] ?? option}
          </option>
        ))}
        <option value={CUSTOM_OPTION}>{custom.label}</option>
      </select>
      {isCustom && (
        <span data-slot="suffix" className="gap-2">
          <span aria-hidden="true" className="divider-v/surface h-5" />
          <NumberInput
            aria-label={`${control.label} (${custom.label})`}
            className="w-20 rounded-none border-0 bg-transparent p-0 outline-hidden"
            value={value}
            range={custom}
            onChange={(next) => {
              setLastCustom(next)
              onChange(next)
            }}
          />
        </span>
      )}
    </>
  )
}

function NumberField({ control }: { control: Extract<ResolvedControl, { kind: 'number' }> }) {
  const input = useMemo(
    () =>
      function Input(props: {
        value: PlaygroundControlValue
        onChange: (value: PlaygroundControlValue) => void
      }) {
        return (
          <NumberInput
            aria-label={control.label}
            value={Number(props.value)}
            range={control}
            onChange={props.onChange}
          />
        )
      },
    [control]
  )

  return <PlaygroundFormElement<Values> name={control.name} label={control.label} input={input} />
}

/**
 * A number input that reports only valid numbers (in range and on its step).
 * The text is kept locally, so clearing it or typing a partial number doesn't
 * jump back to the last value.
 */
function NumberInput({
  value,
  range,
  onChange,
  ...props
}: {
  value: number
  range: ResolvedNumberRange
  onChange: (value: number) => void
  className?: string
  'aria-label': string
}) {
  const [text, setText] = useState(String(value))

  return (
    <input
      {...props}
      type="number"
      inputMode="numeric"
      min={range.min}
      max={range.max}
      step={range.step}
      value={text}
      onChange={(event) => {
        setText(event.target.value)
        if (event.target.value !== '' && event.target.validity.valid) {
          onChange(event.target.valueAsNumber)
        }
      }}
    />
  )
}

function BooleanField({ control }: { control: Extract<ResolvedControl, { kind: 'boolean' }> }) {
  const { offLabel, onLabel } = control
  // Stable so the radios aren't remounted (and their name changed) on every render.
  const input = useMemo(
    () =>
      function Input(props: {
        value: PlaygroundControlValue
        onChange: (value: PlaygroundControlValue) => void
      }) {
        return <BooleanControl {...props} offLabel={offLabel} onLabel={onLabel} />
      },
    [offLabel, onLabel]
  )

  return <PlaygroundFormElement<Values> name={control.name} label={control.label} input={input} />
}

function BooleanControl({
  value,
  onChange,
  offLabel,
  onLabel,
}: {
  value: PlaygroundControlValue
  onChange: (value: PlaygroundControlValue) => void
  offLabel: string
  onLabel: string
}) {
  const name = useId()

  return (
    <div className="-ml-(--btn-padding-inline) btn-group-ghost btn-size-sm">
      <label>
        {offLabel}
        <input type="radio" name={name} checked={value !== true} onChange={() => onChange(false)} />
      </label>
      <label>
        {onLabel}
        <input type="radio" name={name} checked={value === true} onChange={() => onChange(true)} />
      </label>
    </div>
  )
}

function isPlayground(block: DocBlock): block is DocPlaygroundBlock {
  return block.kind === 'playground'
}
