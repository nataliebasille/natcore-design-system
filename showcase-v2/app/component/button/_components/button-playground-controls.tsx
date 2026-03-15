import {
  PlaygroundFormElement,
  type PlaygroundFormElementProps,
} from "@/app/_ui/playground/playground-form-element";

type ButtonControls = {
  variant: "solid" | "outline" | "ghost" | "soft";
  palette: "primary" | "secondary" | "accent" | "surface";
  size: "sm" | "md" | "lg";
};
export const defaultValues: ButtonControls = {
  variant: "solid",
  palette: "primary",
  size: "md",
};

export function ButtonPlaygroundControls() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PlaygroundFormElement<ButtonControls>
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

      <PlaygroundFormElement<ButtonControls>
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

      <PlaygroundFormElement<ButtonControls>
        name="size"
        label="Size"
        input={SizeControl}
      />
    </div>
  );
}

type SizeControlProps = {
  value: ButtonControls["size"];
  onChange: (value: ButtonControls["size"]) => void;
};

function SizeControl({ value, onChange }: SizeControlProps) {
  return (
    <div className="btn-group-ghost btn-size-sm -ml-(--btn-padding-inline)">
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
