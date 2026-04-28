import { PlaygroundFormElement } from "@/app/_ui/playground/playground-form-element";
import { usePlayground } from "@/ui/playground/playground-provider";
import { twMerge } from "tailwind-merge";

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
  placement: "start" | "center" | "end" | "custom";
  customPlacement: string;
  label: string;
};

export const defaultValues: DividerControlValues = {
  direction: "horizontal",
  palette: "primary",
  placement: "center",
  customPlacement: "33",
  label: "Overview",
};

export function DividerPlaygroundControls() {
  return (
    <div className="grid grid-cols-1 gap-4 desktop:grid-cols-2">
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
        input={PlacementControl}
      />

      <PlaygroundFormElement<DividerControlValues>
        name="label"
        label="Label"
        input={<input type="text" placeholder="Overview" />}
      />
    </div>
  );
}

type PlacementControlProps = {
  value: DividerControlValues["placement"];
  onChange: (value: DividerControlValues["placement"]) => void;
};

function PlacementControl({ value, onChange }: PlacementControlProps) {
  const { values, setValue } = usePlayground<DividerControlValues>();

  return (
    <>
      <select
        className="rounded-br-none"
        value={value}
        onChange={(event) =>
          onChange(event.target.value as DividerControlValues["placement"])
        }
      >
        <option value="start">Start</option>
        <option value="center">Center</option>
        <option value="end">End</option>
        <option value="custom">Custom</option>
      </select>

      <div className="form-control-suffix min-w-20 gap-1 border-l-0 pr-3 pl-2">
        <input
          aria-label="Custom placement percent"
          className="h-auto w-10 min-w-0 rounded-none border-0 bg-transparent p-0 text-right outline-hidden"
          inputMode="decimal"
          disabled={value !== "custom"}
          type="text"
          max={100}
          min={0}
          step={1}
          value={
            values.placement === "start" ? "0"
            : values.placement === "center" ?
              "50"
            : values.placement === "end" ?
              "100"
            : values.customPlacement
          }
          onChange={(event) => {
            setValue("customPlacement", event.target.value);
            setValue("placement", "custom");
          }}
          placeholder="33"
        />
        <span
          aria-hidden="true"
          className={twMerge(values.placement === "custom" && "text-muted")}
        >
          %
        </span>
      </div>
    </>
  );
}

type DirectionControlProps = {
  value: DividerControlValues["direction"];
  onChange: (value: DividerControlValues["direction"]) => void;
};

function DirectionControl({ value, onChange }: DirectionControlProps) {
  return (
    <div className="-ml-(--btn-padding-inline) btn-group-ghost btn-size-sm">
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
