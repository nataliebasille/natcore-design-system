import { PlaygroundFormElement } from '@/app/_ui/playground/playground-form-element'

export type DialogControlValues = {
  placement: 'center' | 'top' | 'bottom'
  dismissal: 'any' | 'closerequest' | 'none'
  backdrop: 'default' | 'blur' | 'none'
}

export const defaultValues: DialogControlValues = {
  placement: 'center',
  dismissal: 'any',
  backdrop: 'default',
}

export function DialogPlaygroundControls() {
  return (
    <div className="grid grid-cols-1 gap-4 desktop:grid-cols-3">
      <PlaygroundFormElement<DialogControlValues>
        name="placement"
        label="Placement"
        input={
          <select>
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom sheet</option>
          </select>
        }
      />

      <PlaygroundFormElement<DialogControlValues>
        name="dismissal"
        label="Dismissal (closedby)"
        input={
          <select>
            <option value="any">Esc or backdrop click</option>
            <option value="closerequest">Esc only</option>
            <option value="none">Close button only</option>
          </select>
        }
      />

      <PlaygroundFormElement<DialogControlValues>
        name="backdrop"
        label="Backdrop"
        input={
          <select>
            <option value="default">Default dim</option>
            <option value="blur">Blurred (backdrop: utilities)</option>
            <option value="none">None (dialog-backdrop-none)</option>
          </select>
        }
      />
    </div>
  )
}
