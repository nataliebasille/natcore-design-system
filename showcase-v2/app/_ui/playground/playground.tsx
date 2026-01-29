import { cloneElement } from "react";
import { PlaygroundResult } from "./playground-result";

type PlaygroundProps<T extends Record<string, string>> = {
  controls: {
    [K in keyof T]: React.ReactElement;
  };
  defaultValues: T;
  render: NoInfer<(values: T) => React.ReactElement>;
};

export function Playground<T extends Record<string, string>>({
  controls,
  defaultValues,
  render,
}: PlaygroundProps<T>) {
  return (
    <div className="card-soft/secondary rounded-md">
      <div className="divide-secondary-scale-300 grid grid-cols-[1fr_auto] divide-x *:p-3">
        <div className="flex items-center">
          <PlaygroundResult>
            {render(
              Object.fromEntries(
                Object.entries(controls).map(([key]) => [
                  key,
                  defaultValues?.[key] || "",
                ]),
              ) as T,
            )}
          </PlaygroundResult>
        </div>
        <div className="flex flex-col gap-2">
          {Object.entries(controls).map(([key, control]) =>
            cloneElement(control, { key }),
          )}
        </div>
      </div>
    </div>
  );
}
