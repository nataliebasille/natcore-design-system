import { PlaygroundFormElement } from '@/app/_ui/playground/playground-form-element'

export type TrayControlValues = {
  direction: 'left' | 'right' | 'top' | 'bottom' | 'inline'
  open: boolean
}

export const defaultValues: TrayControlValues = {
  direction: 'left',
  open: true,
}

export function TrayPlaygroundControls() {
  return (
    <div className="grid grid-cols-1 gap-4 desktop:grid-cols-2">
      <PlaygroundFormElement<TrayControlValues>
        name="direction"
        label="Direction"
        input={
          <select>
            <option value="left">Left</option>
            <option value="right">Right</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="inline">Inline</option>
          </select>
        }
      />

      <PlaygroundFormElement<TrayControlValues>
        name="open"
        label="Initial state"
        input={OpenControl}
      />
    </div>
  )
}

type OpenControlProps = {
  value: boolean
  onChange: (value: boolean) => void
}

function OpenControl({ value, onChange }: OpenControlProps) {
  return (
    <div className="-ml-(--btn-padding-inline) btn-group-ghost btn-size-sm">
      <label>
        Closed
        <input
          type="radio"
          name="tray-open-state"
          checked={!value}
          onChange={() => onChange(false)}
        />
      </label>

      <label>
        Open
        <input
          type="radio"
          name="tray-open-state"
          checked={value}
          onChange={() => onChange(true)}
        />
      </label>
    </div>
  )
}
