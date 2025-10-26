import { type SupportedLanguages, highlight } from "@/utlls/syntax-highlighter";
import {
  type FC,
  type ForwardedRef,
  forwardRef,
  type PropsWithChildren,
} from "react";

export type HighlightProps = PropsWithChildren<{
  content: string;
  language: SupportedLanguages;
  component?: "div" | "code";
}>;

export const Highlight = forwardRef(
  (
    { content, language, component: Component = "div" }: HighlightProps,
    ref,
  ) => {
    return (
      <Component
        ref={ref as ForwardedRef<never>}
        dangerouslySetInnerHTML={{
          __html: highlight(content, { lang: language }),
        }}
      />
    );
  },
);
