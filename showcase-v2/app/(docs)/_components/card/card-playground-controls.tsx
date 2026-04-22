import { PlaygroundFormElement } from "@/app/_ui/playground/playground-form-element";

export type CardControlValues = {
  variant: "solid" | "soft" | "outline" | "ghost";
  palette: "primary" | "secondary" | "accent" | "surface";
  hover: boolean;
  title: string;
  footer: boolean;
};

export const defaultValues: CardControlValues = {
  variant: "soft",
  palette: "primary",
  hover: false,
  title: "Release summary",
  footer: true,
};

export function CardPlaygroundControls() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PlaygroundFormElement<CardControlValues>
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

      <PlaygroundFormElement<CardControlValues>
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

      <PlaygroundFormElement<CardControlValues>
        name="hover"
        label="Hover"
        input={HoverControl}
      />

      <PlaygroundFormElement<CardControlValues>
        name="footer"
        label="Footer"
        input={FooterControl}
      />

      <PlaygroundFormElement<CardControlValues>
        name="title"
        label="Title"
        input={<input type="text" placeholder="Card title" />}
      />
    </div>
  );
}

type BooleanControlProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

function HoverControl({ value, onChange }: BooleanControlProps) {
  return (
    <div className="-ml-(--btn-padding-inline) btn-group-ghost btn-size-sm">
      <label>
        Off
        <input
          type="radio"
          name="card-hover"
          checked={!value}
          onChange={() => onChange(false)}
        />
      </label>

      <label>
        On
        <input
          type="radio"
          name="card-hover"
          checked={value}
          onChange={() => onChange(true)}
        />
      </label>
    </div>
  );
}

function FooterControl({ value, onChange }: BooleanControlProps) {
  return (
    <div className="-ml-(--btn-padding-inline) btn-group-ghost btn-size-sm">
      <label>
        Hidden
        <input
          type="radio"
          name="card-footer"
          checked={!value}
          onChange={() => onChange(false)}
        />
      </label>

      <label>
        Visible
        <input
          type="radio"
          name="card-footer"
          checked={value}
          onChange={() => onChange(true)}
        />
      </label>
    </div>
  );
}
