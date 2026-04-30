/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { DividerControlValues } from "./divider-playground-controls";

export function getDividerPlaygroundShowcase(values: DividerControlValues) {
  const dividerClassName = [
    values.direction === "vertical" ? "divider-v" : "divider",
    values.palette ? `/${values.palette}` : "",
    getPlacementClassName(values),
    values.direction === "vertical" ? "h-24 shrink-0" : "w-full",
  ].join("");

  if (values.direction === "vertical") {
    return (
      <div className="flex h-28 items-center justify-center gap-4 rounded-2xl bg-surface/40 px-4">
        <span className="text-sm opacity-75">Account</span>
        <div className={dividerClassName}>{values.label}</div>
        <span className="text-sm opacity-75">Billing</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 rounded-2xl bg-surface/40 p-4">
      <div className="space-y-1">
        <p className="text-sm opacity-75">Current release</p>
        <p className="text-lg font-semibold">Natcore v2 preview</p>
      </div>
      <div className={dividerClassName}>{values.label}</div>
      <p className="text-sm opacity-75">
        Swap direction, palette, and placement to inspect the exact utility
        markup generated for the divider.
      </p>
    </div>
  );
}

function getPlacementClassName(values: DividerControlValues) {
  if (values.placement !== "custom") {
    return ` divider-place-content-${values.placement}`;
  }

  const percent = normalizePercent(values.customPlacement);
  return ` divider-place-content-[${percent}%]`;
}

function normalizePercent(input: string) {
  const parsed = Number.parseFloat(input);

  if (Number.isFinite(parsed) === false) {
    return "50";
  }

  return Math.min(100, Math.max(0, parsed)).toString();
}