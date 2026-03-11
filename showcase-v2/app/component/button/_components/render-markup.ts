import type { controls } from './button-playground-controls'
import type { PlaygroundValues } from '@/ui/playground/playground'

export function renderMarkup(values: PlaygroundValues<typeof controls>) {
  return `<button class="btn-${values.variant}/${values.palette}">Button</button>`
}
