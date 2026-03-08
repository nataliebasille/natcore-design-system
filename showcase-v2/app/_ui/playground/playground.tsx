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
      <div className="card-ghost/secondary h-10 rounded-md">
        <div className="divider-test mt-2 h-2" />
        <div className="grid">
          {/* <div className="flex flex-col gap-2">
            {Object.entries(controls).map(([key, control]) =>
              cloneElement(control, { key }),
            )}
          </div>
          <div>
            <PlaygroundResult>{children}</PlaygroundResult>
          </div> */}
        </div>
      </div>
    </PlaygroundProvider>
  );
}
