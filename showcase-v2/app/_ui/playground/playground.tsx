"use client";

import type { ReactNode } from "react";
import { ExampleContainer } from "../example/example-container";
import { PlaygroundPreview } from "./playground-preview";
import { PlaygroundProvider } from "./playground-provider";
import { PlaygroundCodeSnippet } from "./playground-code-snippet";

type PlaygroundProps<T extends Record<string, React.ReactElement>> = {
  controls: ReactNode;
  ui: ReactNode;
  renderMarkup: (values: PlaygroundValues<T>) => string;
  defaultValues: Record<keyof T, string>;
  initialHtml: string;
};

export type PlaygroundValues<
  in out T extends Record<string, React.ReactElement>,
> = {
  [K in keyof T]: string;
};

export function Playground<const T extends Record<string, React.ReactElement>>({
  controls,
  defaultValues,
  ui,
  renderMarkup,
  initialHtml,
}: PlaygroundProps<T>) {
  return (
    <PlaygroundProvider defaultValues={defaultValues}>
      <ExampleContainer
        ui={<PlaygroundPreview controls={controls}>{ui}</PlaygroundPreview>}
        markup={
          <PlaygroundCodeSnippet<T>
            renderMarkup={renderMarkup}
            initialHtml={initialHtml}
          />
        }
      />
    </PlaygroundProvider>
  );
}
