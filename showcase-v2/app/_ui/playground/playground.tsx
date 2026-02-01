import { cloneElement } from "react";
import { PlaygroundResult } from "./playground-result";
import { PlaygroundProvider } from "./playground-provider";

type PlaygroundProps<out T extends Record<string, React.ReactElement>> = {
  controls: T;
  defaultValues: Record<keyof T, string>;
  children: React.ReactNode;
};

export type PlaygroundValues<
  in out T extends Record<string, React.ReactElement>,
> = {
  [K in keyof T]: string;
};

export function Playground<const T extends Record<string, React.ReactElement>>({
  controls,
  defaultValues,
  children,
}: PlaygroundProps<T>) {
  return (
    <PlaygroundProvider defaultValues={defaultValues}>
      <div className="card-ghost/secondary rounded-md">
        <div className="divide-secondary-scale-300 grid grid-cols-[1fr_auto] divide-x *:p-3">
          <div>
            <PlaygroundResult>{children}</PlaygroundResult>
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(controls).map(([key, control]) =>
              cloneElement(control, { key }),
            )}
          </div>
        </div>
      </div>
    </PlaygroundProvider>
  );
}
