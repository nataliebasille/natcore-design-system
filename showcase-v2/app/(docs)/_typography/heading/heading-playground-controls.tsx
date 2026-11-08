import { PlaygroundFormElement } from '@/app/_ui/playground/playground-form-element'

export type HeadingControlValues = {
  level: '1' | '2' | '3' | '4' | '5' | '6'
  element: 'heading' | 'class'
  text: string
}

export const defaultValues: HeadingControlValues = {
  level: '2',
  element: 'heading',
  text: 'The quick brown fox',
}

export function HeadingPlaygroundControls() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PlaygroundFormElement<HeadingControlValues>
        name="level"
        label="Level"
        input={
          <select>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>
        }
      />

      <PlaygroundFormElement<HeadingControlValues>
        name="element"
        label="Markup"
        input={
          <select>
            <option value="heading">Heading element (&lt;hN&gt;)</option>
            <option value="class">Class on a paragraph (heading-N)</option>
          </select>
        }
      />

      <PlaygroundFormElement<HeadingControlValues>
        name="text"
        label="Text"
        input={<input type="text" placeholder="The quick brown fox" />}
      />
    </div>
  )
}
