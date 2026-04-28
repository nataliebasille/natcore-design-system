import { PlaygroundFormElement } from '@/app/_ui/playground/playground-form-element'

export type ListControlValues = {
  variant: 'plain' | 'disc' | 'decimal'
  palette: 'primary' | 'secondary' | 'accent' | 'surface' | 'success' | 'danger' | 'disabled'
}

export const defaultValues: ListControlValues = {
  variant: 'plain',
  palette: 'primary',
}

export function ListPlaygroundControls() {
  return (
    <div className="grid grid-cols-1 gap-4 desktop:grid-cols-2">
      <PlaygroundFormElement<ListControlValues>
        name="variant"
        label="Variant"
        input={
          <select>
            <option value="plain">Plain</option>
            <option value="disc">Disc</option>
            <option value="decimal">Decimal</option>
          </select>
        }
      />

      <PlaygroundFormElement<ListControlValues>
        name="palette"
        label="Palette"
        input={
          <select>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="accent">Accent</option>
            <option value="surface">Surface</option>
            <option value="success">Success</option>
            <option value="danger">Danger</option>
            <option value="disabled">Disabled</option>
          </select>
        }
      />
    </div>
  )
}
