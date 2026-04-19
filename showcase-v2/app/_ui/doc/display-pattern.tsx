import type { Pattern } from "@nataliebasille/css-engine";

export function DisplayPattern({ pattern }: { pattern: Pattern }) {
  const { root, value, modifier } = pattern;

  return (
    <span className="font-mono text-sm">
      {root}
      {value && (
        <span>
          -
          <span className="text-tone-500-accent">
            {"{"}
            {value?.name}
            {"}"}
          </span>
        </span>
      )}
      {modifier && (
        <span>
          /
          <span className="text-tone-500-accent">
            {"{"}
            {modifier?.name}
            {"}"}
          </span>
        </span>
      )}
    </span>
  );
}
