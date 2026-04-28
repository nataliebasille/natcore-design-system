import { Fragment, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const ApiGroup = ({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) => (
  <div>
    {label && (
      <p className="mb-2 text-xs font-semibold tracking-widest text-on-tone-50-surface/50 uppercase">
        {label}
      </p>
    )}
    <div className="grid grid-cols-[minmax(180px,220px)_1fr] items-start gap-px overflow-hidden rounded-lg border border-tone-300-surface/40 bg-tone-300-surface/40">
      {children}
    </div>
  </div>
);

export const ApiRow = ({
  label,
  children,
}: {
  label: ReactNode;
  children?: ReactNode;
}) => (
  <div className="col-span-2 gap-px desktop:grid desktop:grid-cols-subgrid">
    <div className="bg-tone-50-surface px-4 py-3 text-sm max-desktop:pb-0">
      {label}
    </div>
    <div className="bg-tone-50-surface px-4 py-3 text-sm max-desktop:pt-0">
      {children}
    </div>
  </div>
);

export type UtilityTag =
  | "utility"
  | "modifier"
  | "custom-variant"
  | "composable"
  | "component"
  | "slot"
  | "css-variable";

type TableRow = { label: string; content: ReactNode };

type UtilityReferenceProps = {
  tags?: UtilityTag[];
  description?: string;
  table: TableRow[];
};

type UtilityValueProps = {
  values: readonly ReactNode[] | ReactNode;
  defaultValue?: ReactNode;
  divider?: string;
};

export const UtilityValue = ({
  values,
  defaultValue,
  divider = "/",
}: UtilityValueProps) => {
  return (
    <>
      {Array.isArray(values) ?
        values.map((value, i) => (
          <Fragment key={i}>
            <span>{value}</span>
            {i < values.length - 1 && (
              <span className="mx-1 text-on-tone-50-surface/40">{divider}</span>
            )}
          </Fragment>
        ))
      : <>{values}</>}
      {defaultValue && (
        <>
          <span className="mx-1 text-on-tone-50-surface/40">{divider}</span>
          <span className="text-on-tone-50-surface/50">default:</span>
          <span className="font-mono text-tone-500-accent">
            {defaultValue}
          </span>
        </>
      )}
    </>
  );
};

const TAG_CLASSES: Record<UtilityTag, string> = {
  component: "badge-solid/primary",
  modifier: "badge-soft/primary",
  "custom-variant": "badge-soft/secondary",
  composable: "badge-solid/secondary",
  utility: "badge-solid/surface",
  slot: "badge-soft/accent",
  "css-variable": "badge-soft/surface",
};

export const TagBadge = ({
  className,
  tag,
}: {
  className?: string;
  tag: UtilityTag;
}) => (
  <span className={twMerge(TAG_CLASSES[tag], "inline-block", className)}>
    {tag}
  </span>
);

export const UtilityReference = ({
  tags,
  description,
  table,
}: UtilityReferenceProps) => {
  return (
    <div className="space-y-4">
      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="mt-0! text-tone-950-surface/60">{description}</p>
      )}

      {/* Reference table */}
      <ApiGroup>
        {table.map(({ label, content }) => (
          <ApiRow key={label} label={label}>
            <div className="flex flex-wrap items-center gap-1.5 text-on-tone-50-surface/80">
              {content}
            </div>
          </ApiRow>
        ))}
      </ApiGroup>
    </div>
  );
};
