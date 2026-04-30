import {
  PlaygroundFormElement,
  type PlaygroundFormElementProps,
} from "@/app/_ui/playground/playground-form-element";

export type DividerControlValues = {
  direction: "horizontal" | "vertical";
  palette:
    | "primary"
    | "secondary"
    | "accent"
    | "surface"
    | "success"
    | "danger"
    | "disabled";
  placement: "before-start" | "before-center" | "before-end" | "custom";
  customPlacement: string;
  label: string;
};

export const defaultValues: DividerControlValues = {
  direction: "horizontal",
  palette: "primary",
  placement: "before-center",
  customPlacement: "33",
  label: "Overview",
};

export function DividerPlaygroundControls() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PlaygroundFormElement<DividerControlValues>
        name="direction"
        label="Direction"
        input={DirectionControl}
      />

      <PlaygroundFormElement<DividerControlValues>
        name="palette"
        label="Palette"
        input={
          <select>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="accent">Accent</option>
            <option value="surface">Surface</option>
            <option value="success">Success</option>
            <option value="danger">Danger</option>
            <option value="disabled">Disabled</option>
          </select>
        }
      />

      <PlaygroundFormElement<DividerControlValues>
        name="placement"
        label="Placement"
        input={
          <select>
            <option value="before-start">Before start</option>
            <option value="before-center">Before center</option>
            <option value="before-end">Before end</option>
            <option value="custom">Custom %</option>
          </select>
        }
      />

      <PlaygroundFormElement<DividerControlValues>
        name="customPlacement"
        label="Custom %"
        input={<input type="text" placeholder="33" />}
      />

      <PlaygroundFormElement<DividerControlValues>
        name="label"
        label="Label"
        input={<input type="text" placeholder="Overview" />}
      />
    </div>
  );
}

type DirectionControlProps = {
  value: DividerControlValues["direction"];
  onChange: (value: DividerControlValues["direction"]) => void;
};

function DirectionControl({ value, onChange }: DirectionControlProps) {
  return (
    <div className="btn-group-ghost btn-size-sm -ml-(--btn-padding-inline)">
      <label>
        Horizontal
        <input
          type="radio"
          name="divider-direction"
          checked={value === "horizontal"}
          onChange={() => onChange("horizontal")}
        />
      </label>

      <label>
        Vertical
        <input
          type="radio"
          name="divider-direction"
          checked={value === "vertical"}
          onChange={() => onChange("vertical")}
        />
      </label>
    </div>
  );
}