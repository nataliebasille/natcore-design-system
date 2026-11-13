import { PlaygroundFormElement } from '@/app/_ui/playground/playground-form-element'

export type PopoverControlValues = {
  trigger: 'click' | 'interest' | 'hover' | 'focus' | 'checked'
  placement:
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'
  flip: 'off' | 'on'
  delay: 'default' | 'none' | 'slow'
}

export const defaultValues: PopoverControlValues = {
  trigger: 'hover',
  placement: 'bottom',
  flip: 'off',
  delay: 'default',
}

export function PopoverPlaygroundControls() {
  return (
    <div className="grid grid-cols-1 gap-4 desktop:grid-cols-4">
      <PlaygroundFormElement<PopoverControlValues>
        name="trigger"
        label="Trigger"
        input={
          <select>
            <option value="click">Click (commandfor)</option>
            <option value="interest">Hover or focus (interestfor)</option>
            <option value="hover">Hover (CSS)</option>
            <option value="focus">Focus (CSS)</option>
            <option value="checked">Checkbox (CSS)</option>
          </select>
        }
      />

      <PlaygroundFormElement<PopoverControlValues>
        name="placement"
        label="Placement"
        input={
          <select>
            <option value="bottom">Bottom</option>
            <option value="bottom-start">Bottom start</option>
            <option value="bottom-end">Bottom end</option>
            <option value="top">Top</option>
            <option value="top-start">Top start</option>
            <option value="top-end">Top end</option>
            <option value="left">Left</option>
            <option value="left-start">Left start</option>
            <option value="left-end">Left end</option>
            <option value="right">Right</option>
            <option value="right-start">Right start</option>
            <option value="right-end">Right end</option>
          </select>
        }
      />

      <PlaygroundFormElement<PopoverControlValues>
        name="flip"
        label="Flip near an edge"
        input={
          <select>
            <option value="off">Off (stays on its side)</option>
            <option value="on">On (popover-flip)</option>
          </select>
        }
      />

      <PlaygroundFormElement<PopoverControlValues>
        name="delay"
        label="Hover and focus delay"
        input={
          <select>
            <option value="default">Default (0.5s open, 0.25s close)</option>
            <option value="none">None (popover-trigger-delay-0)</option>
            <option value="slow">1s (popover-trigger-delay-1000)</option>
          </select>
        }
      />
    </div>
  )
}
