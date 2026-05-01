/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { BadgeControlValues } from "./badge-playground-controls";

export function getBadgePlaygroundShowcase(values: BadgeControlValues) {
  const badgeClassName = `badge-${values.variant}/${values.palette}`;
  const label = values.label.trim() || "Badge";

  return (
    <ui-div className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-surface-300/50 bg-surface-50 p-4 text-sm text-on-surface-50/70">
      <span>Release 2.3.0</span>
      <span className={badgeClassName}>{label}</span>
      <span>ready for rollout</span>
    </ui-div>
  );
}
