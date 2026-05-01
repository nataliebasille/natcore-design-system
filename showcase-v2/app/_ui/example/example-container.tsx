import { twMerge } from "tailwind-merge";
import { ServerFormattedCodeSnippet } from "../code-snippet/server-formatted-code-snippet";

export function ExampleContainer({
  className,
  ui,
  markup,
}: {
  className?: string;
  ui: React.ReactNode;
  markup: React.ReactNode;
}) {
  return (
    <div
      className={twMerge(
        `flex flex-wrap items-center overflow-hidden card-ghost/surface rounded-sm border border-surface-200 bg-transparent`,
        className,
      )}
    >
      <div data-slot="content" className="flex w-full justify-center gap-4">
        {ui}
      </div>

      <div className="w-full *:rounded-none *:border-r-0 *:border-b-0 *:border-l-0">
        {markup}
      </div>
    </div>
  );
}
