import { CodeSnippet } from "../code-snippet/code-snippet";
import { Spotlight } from "./spotlight";

type MarkupSpotlightProps = {
  className?: string;
  title?: string;
  preview: React.ReactNode;
  markup: string;
  description?: string;
};

export function MarkupSpotlight({
  title,
  description,
  preview,
  markup,
}: MarkupSpotlightProps) {
  return (
    <Spotlight
      title={title ? <div className="px-4">{title}</div> : undefined}
      className="px-0 pb-0"
    >
      <div className="flex flex-col items-center gap-4">
        {description && (
          <div className="w-full px-4 text-sm tracking-wider text-on-tone-50/60">
            {description}
          </div>
        )}
        <div className="w-full px-4">{preview}</div>
        <CodeSnippet
          language="html"
          code={markup}
          className="self-stretch rounded-t-none border-r-0 border-b-0 border-l-0"
        />
      </div>
    </Spotlight>
  );
}
