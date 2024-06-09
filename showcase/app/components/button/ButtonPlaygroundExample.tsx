"use client";

import { type ChangeEvent, useState } from "react";
import classnames from "classnames";
import { Example } from "@/components/doc/Example";

const classes = {
  variants: {
    primary: "btn-primary",
    secondary: "btn-secondary",
    surface: "btn-surface",
  },
  appearances: {
    filled: "btn-filled",
    outlined: "btn-outline",
    ghost: "btn-ghost",
  },
};
export const ButtonPlaygroundExample = ({ html }: { html: string }) => {
  const [value, setValue] = useState<{
    variant?: "primary" | "secondary" | "surface";
    appearance?: "filled" | "outlined" | "ghost";
  }>({
    variant: undefined,
    appearance: undefined,
  });

  const classesToAdd = classnames(
    value.variant && classes.variants[value.variant],
    value.appearance && classes.appearances[value.appearance],
  );
  const handleChange = (name: string, evt: ChangeEvent<HTMLSelectElement>) => {
    setValue({
      ...value,
      [name]: evt.target.value === "" ? undefined : evt.target.value,
    });
  };

  const htmlToRender = !classesToAdd
    ? html
    : html
        .replace('class="btn"', `class="btn ${classesToAdd}"`)
        .replace('class="btn-icon"', `class="btn-icon ${classesToAdd}"`);

  return (
    <>
      <Example html={htmlToRender} />
      <div className="divider" />
      <div className="flex justify-center gap-2">
        <div className="form-control">
          <label>Variant</label>
          <select
            name="variant"
            value={value.variant ?? ""}
            onChange={(e) => handleChange("variant", e)}
          >
            <option value="">default</option>
            <option value="primary">btn-primary</option>
            <option value="secondary">btn-secondary</option>
            <option value="surface">btn-surface</option>
          </select>
        </div>
        <div className="form-control">
          <label>Appearance</label>
          <select
            name="appearance"
            value={value?.appearance ?? ""}
            onChange={(e) => handleChange("appearance", e)}
          >
            <option value="default">default</option>
            <option value="filled">btn-filled</option>
            <option value="outlined">btn-outlined</option>
            <option value="ghost">btn-ghost</option>
          </select>
        </div>
      </div>
    </>
  );
};
