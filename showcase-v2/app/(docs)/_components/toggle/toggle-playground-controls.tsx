import { PlaygroundFormElement } from "@/app/_ui/playground/playground-form-element";

export type ToggleControlValues = {
  variant: "solid" | "outline" | "ghost" | "soft";
  palette: "primary" | "secondary" | "accent" | "surface";
  trigger: "checkbox" | "aria" | "active-class";
  checked: boolean;
  thumb: boolean;
};

export const defaultValues: ToggleControlValues = {
  variant: "solid",
  palette: "primary",
  trigger: "checkbox",
  checked: true,
  thumb: false,
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

      <PlaygroundFormElement<ToggleControlValues>
        name="trigger"
        label="Trigger"
        input={
          <select>
            <option value="checkbox">Checkbox</option>
            <option value="aria">aria-checked</option>
            <option value="active-class">.toggle-active</option>
          </select>
        }
      />

      <PlaygroundFormElement<ToggleControlValues>
        name="checked"
        label="State"
        input={CheckedControl}
      />

      <PlaygroundFormElement<ToggleControlValues>
        name="thumb"
        label="Thumb"
        input={ThumbControl}
      />
    </div>
  );
}

type BooleanControlProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

function CheckedControl({ value, onChange }: BooleanControlProps) {
  return (
    <div className="btn-group-ghost btn-size-sm -ml-(--btn-padding-inline)">
      <label>
        Off
        <input
          type="radio"
          name="toggle-state"
          checked={!value}
          onChange={() => onChange(false)}
        />
      </label>

      <label>
        On
        <input
          type="radio"
          name="toggle-state"
          checked={value}
          onChange={() => onChange(true)}
        />
      </label>
    </div>
  );
}

function ThumbControl({ value, onChange }: BooleanControlProps) {
  return (
    <div className="btn-group-ghost btn-size-sm -ml-(--btn-padding-inline)">
      <label>
        Default
        <input
          type="radio"
          name="toggle-thumb"
          checked={!value}
          onChange={() => onChange(false)}
        />
      </label>

      <label>
        Custom
        <input
          type="radio"
          name="toggle-thumb"
          checked={value}
          onChange={() => onChange(true)}
        />
      </label>
    </div>
  );
}