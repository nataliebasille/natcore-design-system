"use client";

import { DeprecatedExampleContainer } from "@/components/doc/DeprecatedExampleContainer";
import { useState } from "react";
import classnames from "classnames";

const classes = {
  variants: {
    default: false,
    primary: "toggle-primary",
    secondary: "toggle-secondary",
    surface: "toggle-surface",
  },
  appearances: {
    default: false,
    soft: "toggle-soft",
    filled: "toggle-filled",
    ghost: "toggle-ghost",
  },
};
export function BasicToggleExample({ html }: { html: string }) {
  const [variant, setVariant] = useState<
    "default" | "primary" | "secondary" | "surface"
  >("default");

  const [appearance, setAppearance] = useState<
    "default" | "soft" | "filled" | "ghost"
  >("default");

  const classesToAdd = classnames(
    classes.variants[variant],
    classes.appearances[appearance],
  );
  const htmlToRender = !classesToAdd
    ? html
    : html.replace(
        '<label class="toggle',
        `<label class="toggle ${classesToAdd}`,
      );

  return (
    <>
      <div className="mb-3 flex gap-2">
        <div className="form-control">
          <label>Variant</label>
          <select
            value={variant}
            onChange={(e) =>
              setVariant(e.currentTarget.value as typeof variant)
            }
          >
            <option value="default">default</option>
            <option value="primary">card-primary</option>
            <option value="secondary">card-secondary</option>
            <option value="surface">card-surface</option>
          </select>
        </div>

        <div className="form-control">
          <label>Appearance</label>
          <select
            value={appearance}
            onChange={(e) =>
              setAppearance(e.currentTarget.value as typeof appearance)
            }
          >
            <option value="default">default</option>
            <option value="soft">card-soft</option>
            <option value="filled">card-filled</option>
            <option value="ghost">card-ghost</option>
          </select>
        </div>
      </div>

      <DeprecatedExampleContainer
        outputClassName="justify-items-center"
        html={htmlToRender}
      />
    </>
  );
}
