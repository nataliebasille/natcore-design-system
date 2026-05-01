/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import { twMerge } from "tailwind-merge";
import type { TrayControlValues } from "./tray-playground-controls";

const TRAY_DIRECTION_CLASS_NAMES = {
  left: "tray-left",
  right: "tray-right",
  top: "tray-top",
  bottom: "tray-bottom",
  inline: "tray-inline",
} as const;

const TRAY_SIZE_CLASS_NAMES = {
  left: "w-60",
  right: "w-60",
  top: "h-32",
  bottom: "h-32",
  inline: "w-60 shrink-0",
} as const;

const TRAY_PANEL_SHAPE_CLASS_NAMES = {
  left: "rounded-r-lg",
  right: "rounded-l-lg",
  top: "rounded-b-lg",
  bottom: "rounded-t-lg",
  inline: "rounded-lg",
} as const;

export function getTrayPlaygroundShowcase(values: TrayControlValues) {
  const title = "Filters";
  const toggleId = "tray-playground-toggle";
  const isInline = values.direction === "inline";
  const shellClassName = twMerge(
    "relative w-full overflow-hidden rounded-xl bg-surface-100/25",
    isInline ? "flex min-h-64 gap-4 p-4" : "h-64",
  );
  const workspaceClassName = twMerge(
    "min-w-0 p-5",
    isInline ? "order-2 flex-1" : "h-full",
  );
  const trayClassName = twMerge(
    TRAY_DIRECTION_CLASS_NAMES[values.direction],
    TRAY_SIZE_CLASS_NAMES[values.direction],
    TRAY_PANEL_SHAPE_CLASS_NAMES[values.direction],
    "bg-surface-50 p-5 shadow-xl",
    isInline ? "order-1 shadow-sm" : "",
  );

  return (
    <ui-div className={shellClassName}>
      <div className={workspaceClassName}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-on-surface-50">
              Workspace
            </p>
            <p className="text-xs text-on-surface-50/60">
              {isInline ?
                "The tray sits inline beside this content."
              : "The tray slides over this content from the selected edge."}
            </p>
          </div>

          <label
            htmlFor={toggleId}
            className="btn-solid/primary cursor-pointer btn-size-sm"
          >
            Toggle tray
          </label>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="h-3 w-1/2 rounded-full bg-surface-200/70" />
          <div className="h-3 w-4/5 rounded-full bg-surface-200/50" />
          <div className="h-3 w-2/3 rounded-full bg-surface-200/40" />
        </div>

        <div className="md:grid-cols-3 mt-6 grid gap-3">
          <ContentTile label="Status" value="Ready" />
          <ContentTile label="Queued" value="12" />
          <ContentTile label="Owner" value="Design" />
        </div>
      </div>

      <aside className={trayClassName}>
        <input
          key={`${values.direction}-${values.open}`}
          id={toggleId}
          data-slot="toggle"
          type="checkbox"
          defaultChecked={values.open}
        />
        <TrayPanelContent title={title} direction={values.direction} />
      </aside>
    </ui-div>
  );
}

function TrayPanelContent({
  title,
  direction,
}: {
  title: string;
  direction: TrayControlValues["direction"];
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-on-surface-50">{title}</p>
        <p className="font-mono text-xs text-on-surface-50/55">
          tray-{direction}
        </p>
      </div>

      <div className="space-y-2 text-xs text-on-surface-50/70">
        <div className="rounded-md bg-surface-100/60 px-3 py-2">Navigation</div>
        <div className="rounded-md bg-surface-100/60 px-3 py-2">Filters</div>
        <div className="rounded-md bg-surface-100/60 px-3 py-2">Settings</div>
      </div>
    </div>
  );
}

function ContentTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-50/45 p-3">
      <p className="text-xs text-on-surface-50/55">{label}</p>
      <p className="text-sm font-semibold text-on-surface-50">{value}</p>
    </div>
  );
}
