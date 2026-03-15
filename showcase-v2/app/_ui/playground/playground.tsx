"use client";

import type { ReactNode } from "react";
import { SpotlightContainer } from "../doc/spotlight-container";
import { PlaygroundProvider } from "./playground-provider";
import { PlaygroundPreview } from "./playground-preview";
import { PlaygroundCodeSnippet } from "./playground-code-snippet";

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
        <SpotlightContainer title="Controls">{controls}</SpotlightContainer>

        <SpotlightContainer title="Preview">
          <div className="card-ghost bg-tone-50-surface">
            <div className="card-content flex items-center justify-center">
              {ui}
            </div>
          </div>
        </SpotlightContainer>

        <PlaygroundCodeSnippet<T>
          renderMarkup={renderMarkup}
          initialHtml={initialHtml}
        />
      </div>
    </PlaygroundProvider>
  );
}
