"use client";

import type { ReactNode } from "react";
import { Spotlight } from "../doc/spotlight";
import { PlaygroundCodeSnippet } from "./playground-code-snippet";
import { PlaygroundProvider } from "./playground-provider";

type PlaygroundProps<T extends Record<string, unknown>> = {
  controls: ReactNode;
  ui: ReactNode;
  renderMarkup: (values: T) => string;
  defaultValues: T;
  initialHtml: string;
};

export function Playground<T extends Record<string, unknown>>({
  controls,
  defaultValues,
  ui,
  renderMarkup,
  initialHtml,
}: PlaygroundProps<T>) {
  return (
    <PlaygroundProvider defaultValues={defaultValues}>
      <div className="flex flex-col gap-4">
        <Spotlight title="Controls">{controls}</Spotlight>

        <PlaygroundCodeSnippet<T>
          ui={ui}
          renderMarkup={renderMarkup}
          initialHtml={initialHtml}
        />
      </div>
    </PlaygroundProvider>
  );
}
