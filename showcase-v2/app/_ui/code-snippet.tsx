import { formatHTML } from "@/utlls/format-html";
import { type SupportedLanguages, highlight } from "@/utlls/syntax-highlighter";
import {
  type ForwardedRef,
  forwardRef,
  type PropsWithChildren,
  useMemo,
} from "react";

export type HighlightProps = PropsWithChildren<{
  content: string;
  language: SupportedLanguages;
  component?: "div" | "code";
}>;

export const CodeSnippet = forwardRef(
  (
    { content, language, component: Component = "code" }: HighlightProps,
    ref,
  ) => {
    const formatted = useMemo(() => {
      return content ?
          highlight(language === "html" ? formatHTML(content) : content, {
            lang: language,
          })
        : null;
    }, [content, language]);

    return (
      formatted && (
        <Component
          ref={ref as ForwardedRef<never>}
          className="w-full overflow-x-auto"
        >
          <span className="text-muted-foreground text-accent-500 relative -top-1.5 block font-sans text-[0.625rem] tracking-widest uppercase">
            {language}
          </span>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
        </Component>
      )
    );
  },
);
