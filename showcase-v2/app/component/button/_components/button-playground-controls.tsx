import type { PlaygroundValues } from "@/app/_ui/playground/playground";
import { PlaygroundFormElement } from "@/app/_ui/playground/playground-form-element";

export const controls = {
  variant: (
    <PlaygroundFormElement
      name="variant"
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
};

export const defaultValues: PlaygroundValues<typeof controls> = {
  variant: "solid",
  palette: "primary",
};
