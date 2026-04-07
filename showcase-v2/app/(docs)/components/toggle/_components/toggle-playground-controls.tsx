import {
  PlaygroundFormElement,
  type PlaygroundFormElementProps,
} from "@/app/_ui/playground/playground-form-element";

export type ToggleControlValues = {
  variant: "solid" | "soft" | "outline" | "ghost";
  palette: "primary" | "secondary" | "accent" | "surface";
};

export const defaultValues: ToggleControlValues = {
  variant: "solid",
  palette: "primary",
};

export function TogglePlaygroundControls() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PlaygroundFormElement<ToggleControlValues>
        name="variant"
        label="Variant"
        input={
          <select>
            <option value="solid">Solid</option>
            <option value="soft">Soft</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
          </select>
        }
      />

      <PlaygroundFormElement<ToggleControlValues>
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
  );
}
