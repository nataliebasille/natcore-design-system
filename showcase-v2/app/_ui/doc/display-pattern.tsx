import type { Pattern } from "@nataliebasille/css-engine";
import type { ReactNode } from "react";

export function DisplayPattern({ pattern }: { pattern: Pattern }) {
  const { root, value, modifier } = pattern;

  return (
    <span className="font-mono text-sm">
      {root}
      {value && (
        <span>
          -
          <span className="text-accent-500">
            {"{"}
            {value?.name}
            {"}"}
          </span>
        </span>
      )}
      {modifier && (
        <OptionalSegment optional={modifier.optional}>
          /
          <span className="text-accent-500">
            {"{"}
            {modifier.name}
            {"}"}
          </span>
        </OptionalSegment>
      )}
    </span>
  );
}

function OptionalSegment({
  optional,
  children,
}: {
  optional?: boolean;
  children: ReactNode;
}) {
  if (!optional) {
    return <span>{children}</span>;
  }

  return (
    <span>
      <span className="text-on-surface-50/60">[</span>
      {children}
      <span className="text-on-surface-50/60">]</span>
    </span>
  );
}
