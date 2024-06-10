"use client";

import { Example } from "@/components/doc/Example";
import { useState } from "react";
import classnames from "classnames";
import { BasicContainer } from "@/components/doc/BasicContainer";

const classes = {
  variants: {
    default: false,
    primary: "card-primary",
    secondary: "card-secondary",
    surface: "card-surface",
    accent: "card-accent",
  },
  appearances: {
    default: false,
    soft: "card-soft",
    filled: "card-filled",
    ghost: "card-ghost",
  },
  hover: {
    false: false,
    true: "card-hover",
  },
};
export function CardPlayground({ html }: { html: string }) {
  const [variant, setVariant] = useState<
    "default" | "primary" | "secondary" | "surface" | "accent"
  >("default");

  const [appearance, setAppearance] = useState<
    "default" | "soft" | "filled" | "ghost"
  >("default");

  const [hover, setHover] = useState<boolean>(false);

  const classesToAdd = classnames(
    classes.variants[variant],
    classes.appearances[appearance],
    classes.hover[`${hover}`],
  );
  const htmlToRender = !classesToAdd
    ? html
    : html.replace('<div class="card', `<div class="card ${classesToAdd}`);

  return (
    <BasicContainer>
      <Example html={htmlToRender} />
      <div className="divider" />
      <div className="mb-3 flex justify-center gap-2">
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
            <option value="accent">card-accent</option>
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

        <div className="form-control">
          <label>Hover</label>
          <select
            value={`${hover}`}
            onChange={(e) => setHover(e.currentTarget.value === "true")}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
      </div>
    </BasicContainer>
  );
}
