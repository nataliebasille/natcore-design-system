"use client";

import { useState } from "react";
import { LogoSVG } from "@natcore/design-system-core";
import classnames from "classnames";

export function Preview() {
  const [variant, setVariant] = useState<
    "primary" | "secondary" | "tertiary" | "surface" | "ghost"
  >("primary");
  const [outlined] = useState<boolean>(false);
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const btnClasses = classnames({
    ["btn-primary"]: variant === "primary",
    ["btn-secondary"]: variant === "secondary",
    ["btn-tertiary"]: variant === "tertiary",
    ["btn-surface"]: variant === "surface",
    ["btn-ghost"]: variant === "ghost",
    ["btn-outline"]: outlined,
    ["btn-sm"]: size === "sm",
    ["btn-md"]: size === "md",
    ["btn-lg"]: size === "lg",
  });
  return (
    <>
      <div className="flex h-32 items-center justify-center gap-6">
        <button className={classnames("btn-icon", btnClasses)}>
          <LogoSVG />
        </button>
        <button className={classnames("btn", btnClasses)}>Button</button>
      </div>
      <div className="divider">PLAYGROUND</div>
      <div className="flex items-center justify-center gap-6">
        <label>
          <span>Variant</span>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as typeof variant)}
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="tertiary">Tertiary</option>
            <option value="surface">Surface</option>
            <option value="ghost">Ghost</option>
          </select>
        </label>

        <label>
          <span>Size</span>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as typeof size)}
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </label>
      </div>
    </>
  );
}
