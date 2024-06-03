"use client";

import { ExampleContainer } from "@/components/doc/ExampleContainer";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

const colorToClass = {
  // empty because it's the default
  primary: "",
  secondary: "progress-secondary",
  accent: "progress-accent",
  surface: "progress-surface",
} as const;
const builtinSizes = {
  small: "progress-sm",
  large: "progress-lg",
  default: "",
  custom: "",
} as const;
const builtinSizeNameToPixels = {
  small: 48,
  default: 64,
  large: 88,
} as const;
const builtinSizeToBarWidthPixels = {
  small: 6,
  default: 8,
  large: 10,
} as const;

export const RadialProgressPlayground = () => {
  const [color, setColor] = useState<
    "primary" | "secondary" | "accent" | "surface"
  >("primary");
  const [progress, setProgress] = useState<number>(25);
  const [size, setSize] = useState<"small" | "default" | "large" | "custom">(
    "default",
  );
  const [customSize, setCustomSize] = useState<number>(
    builtinSizeNameToPixels["default"],
  );
  const [barWidth, setBarWidth] = useState<number>(8);

  const classes = twMerge([
    "radial-progress",
    colorToClass[color],
    builtinSizes[size],
  ]);
  const variables = {
    "--progress": `${progress}%`,
  } as Record<string, string | number>;

  if (size === "custom") {
    variables["--size"] = `${customSize}px`;
    variables["--bar-width"] = `${barWidth}px`;
  }

  return (
    <>
      <div className="mb-3 flex gap-2">
        <div className="form-control">
          <label>Color</label>
          <select
            value={color}
            onChange={(e) => {
              setColor(e.currentTarget.value as typeof color);
            }}
          >
            <option value="primary">progress-primary</option>
            <option value="secondary">progress-secondary</option>
            <option value="accent">progress-accent</option>
            <option value="surface">progress-surface</option>
          </select>
        </div>
        <div className="form-control">
          <label>Progress</label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={progress}
            onChange={(e) => {
              setProgress(parseInt(e.currentTarget.value));
            }}
          />
        </div>
        <div className="form-control">
          <label>Size</label>
          <select
            value={size}
            onChange={(e) => {
              const value = e.currentTarget.value as typeof size;
              setSize(value);

              if (value !== "custom") {
                setCustomSize(builtinSizeNameToPixels[value]);
                setBarWidth(builtinSizeToBarWidthPixels[value]);
              }
            }}
          >
            <option value="small">Small</option>
            <option value="default">Default</option>
            <option value="large">Large</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="form-control">
          <label>Custom size</label>
          <input
            type="number"
            min={0}
            max={200}
            step={1}
            disabled={size !== "custom"}
            value={customSize}
            onChange={(e) => {
              setCustomSize(parseInt(e.currentTarget.value));
            }}
          />
        </div>

        <div className="form-control">
          <label>Bar width</label>
          <input
            type="number"
            min={0}
            max={200}
            step={1}
            value={barWidth}
            disabled={size !== "custom"}
            onChange={(e) => {
              setBarWidth(parseInt(e.currentTarget.value));
            }}
          />
        </div>
      </div>

      <ExampleContainer
        outputClassName="justify-items-center"
        html={<div className={classes} style={variables}></div>}
      />
    </>
  );
};
