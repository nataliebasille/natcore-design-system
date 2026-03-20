import { CodeSnippet } from "../code-snippet/code-snippet";
import { Spotlight } from "./spotlight";

type MarkupSpotlightProps = {
  className?: string;
  title?: string;
  preview: React.ReactNode;
  markup: string;
};

export function MarkupSpotlight({
  title,
  preview,
  markup,
}: MarkupSpotlightProps) {
  return (
    <Spotlight
      title={title ? <div className="px-4">{title}</div> : undefined}
      className="pb-0 px-0"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-full px-4">{preview}</div>
        <CodeSnippet
          language="html"
          code={markup}
          className="self-stretch border-l-0 border-r-0 border-b-0 rounded-t-none"
        />
      </div>
    </Spotlight>
  );
}
