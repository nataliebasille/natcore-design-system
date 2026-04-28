/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import type { DividerControlValues } from "./divider-playground-controls";

const DIVIDER_CLASS_NAMES = {
  horizontal: {
    primary: "divider/primary",
    secondary: "divider/secondary",
    accent: "divider/accent",
    surface: "divider/surface",
    success: "divider/success",
    danger: "divider/danger",
    disabled: "divider/disabled",
  },
  vertical: {
    primary: "divider-v/primary",
    secondary: "divider-v/secondary",
    accent: "divider-v/accent",
    surface: "divider-v/surface",
    success: "divider-v/success",
    danger: "divider-v/danger",
    disabled: "divider-v/disabled",
  },
} as const;

const PLACEMENT_CLASS_NAMES = {
  start: "divider-place-content-start",
  center: "divider-place-content-center",
  end: "divider-place-content-end",
  custom: "divider-place-content-[var(--divider-place-content)]",
} as const;

const DIRECTION_LAYOUT_CLASS_NAMES = {
  horizontal: "w-full",
  vertical: "h-full shrink-0",
} as const;

type DividerStyle = CSSProperties & {
  "--divider-place-content"?: string;
};

export function getDividerPlaygroundShowcase(values: DividerControlValues) {
  const dividerClassName = twMerge(
    "text-nowrap",
    DIVIDER_CLASS_NAMES[values.direction][values.palette],
    PLACEMENT_CLASS_NAMES[values.placement],
    DIRECTION_LAYOUT_CLASS_NAMES[values.direction],
  );
  const dividerStyle = getPlacementStyle(values);

  if (values.direction === "vertical") {
    return (
      <div className="bg-surface/40 flex h-28 items-center justify-center gap-4 rounded-2xl px-4">
        <span className="text-sm opacity-75">Account</span>
        <div className={dividerClassName} style={dividerStyle}>
          {values.label}
        </div>
        <span className="text-sm opacity-75">Billing</span>
      </div>
    );
  }

  return (
    <div className="bg-surface/40 w-full space-y-3 rounded-2xl p-4">
      <div className="space-y-1">
        <p className="text-sm opacity-75">Current release</p>
        <p className="text-lg font-semibold">Natcore v2 preview</p>
      </div>
      <div className={dividerClassName} style={dividerStyle}>
        {values.label}
      </div>
      <p className="text-sm opacity-75">
        Swap direction, palette, and placement to inspect the exact utility
        markup generated for the divider.
      </p>
    </div>
  );
}

function getPlacementStyle(
  values: DividerControlValues,
): DividerStyle | undefined {
  if (values.placement !== "custom") {
    return undefined;
  }

  const percent = normalizePercent(values.customPlacement);
  return { "--divider-place-content": `${percent}%` };
}

function normalizePercent(input: string) {
  const parsed = Number.parseFloat(input);

  if (Number.isFinite(parsed) === false) {
    return "50";
  }

  return Math.min(100, Math.max(0, parsed)).toString();
}
