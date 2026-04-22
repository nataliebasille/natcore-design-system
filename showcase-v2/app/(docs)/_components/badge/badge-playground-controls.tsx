import { PlaygroundFormElement } from "@/app/_ui/playground/playground-form-element";

export type BadgeControlValues = {
  variant: "solid" | "outline" | "ghost" | "soft";
  palette: "primary" | "secondary" | "accent" | "surface";
  label: string;
};

export const defaultValues: BadgeControlValues = {
  variant: "solid",
  palette: "primary",
  label: "Active",
};

export function BadgePlaygroundControls() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PlaygroundFormElement<BadgeControlValues>
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

      <PlaygroundFormElement<BadgeControlValues>
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

      <PlaygroundFormElement<BadgeControlValues>
        name="label"
        label="Label"
        input={<input type="text" placeholder="Badge label" />}
      />
    </div>
  );
}
