import type { PlaygroundValues } from '@/app/_ui/playground/playground'
import { PlaygroundComboboxElement } from '@/app/_ui/playground/playground-combobox-element'
import { PlaygroundFormElement } from '@/app/_ui/playground/playground-form-element'

export const controls = {
  variant: (
    <PlaygroundFormElement
      name="variant"
      label="Variant"
      input={
        <select>
          <option value="solid">Solid</option>
          <option value="outline">Outline</option>
          <option value="ghost">Ghost</option>
        </select>
      }
    />
  ),
  palette: (
    <PlaygroundFormElement
      name="palette"
      label="Palette"
      input={
        <select>
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="accent">Accent</option>
          <option value="surface">Surface</option>
        </select>
      }
    />
  ),
  size: (
    <PlaygroundComboboxElement
      name="size"
      label="Size"
      options={[
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
      ]}
    />
  ),
}

export const defaultValues: PlaygroundValues<typeof controls> = {
  variant: 'solid',
  palette: 'primary',
  size: 'md',
}

export function ButtonPlaygroundControls() {
  return (
    <div className="flex gap-4 *:flex-1">
      <PlaygroundFormElement
        name="variant"
        label="Variant"
        input={
          <select>
            <option value="solid">Solid</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
          </select>
        }
      />

      <PlaygroundFormElement
        name="palette"
        label="Palette"
        input={
          <select>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="accent">Accent</option>
            <option value="surface">Surface</option>
          </select>
        }
      />
    </div>
  )
}
