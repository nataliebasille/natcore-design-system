import {
  PlaygroundFormElement,
  type PlaygroundFormElementProps,
} from "@/app/_ui/playground/playground-form-element";

export type ButtonControlValues = {
  variant: "solid" | "outline" | "ghost" | "soft";
  palette: "primary" | "secondary" | "accent" | "surface";
  size: "sm" | "md" | "lg";
};

export const defaultValues: ButtonControlValues = {
  variant: "solid",
  palette: "primary",
  size: "md",
};

export function ButtonPlaygroundControls() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PlaygroundFormElement<ButtonControlValues>
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

      <PlaygroundFormElement<ButtonControlValues>
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

      <PlaygroundFormElement<ButtonControlValues>
        name="size"
        label="Size"
        input={SizeControl}
      />
    </div>
  );
}

type SizeControlProps = {
  value: ButtonControlValues["size"];
  onChange: (value: ButtonControlValues["size"]) => void;
};

function SizeControl({ value, onChange }: SizeControlProps) {
  return (
    <div className="-ml-(--btn-padding-inline) btn-group-outline btn-size-sm">
      <label>
        SM
        <input
          type="radio"
          name="btn-size"
          value="sm"
          checked={value === "sm"}
          onChange={() => onChange("sm")}
        />
      </label>

      <label>
        MD
        <input
          type="radio"
          name="btn-size"
          value="md"
          checked={value === "md"}
          onChange={() => onChange("md")}
        />
      </label>

      <label>
        LG
        <input
          type="radio"
          name="btn-size"
          value="lg"
          checked={value === "lg"}
          onChange={() => onChange("lg")}
        />
      </label>
    </div>
  );
}
