import { type SupportedLanguages, highlight } from "@/utlls/syntax-highlighter";

export const Highlight = ({
  content,
  language,
  component: Component = "div",
}: {
  content: string;
  language: SupportedLanguages;
  component?: keyof JSX.IntrinsicElements;
}) => {
  return (
    <Component
      dangerouslySetInnerHTML={{
        __html: highlight(content, { lang: language }),
      }}
    />
  );
};
