import { type SupportedLanguages, highlight } from "@/utlls/syntax-highlighter";
import { type ForwardedRef, forwardRef } from "react";

export const Highlight = forwardRef(
  (
    {
      content,
      language,
      component: Component = "div",
    }: {
      content: string;
      language: SupportedLanguages;
      component?: "div" | "code";
    },
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
