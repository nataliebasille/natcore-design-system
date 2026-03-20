import {
  renderToMarkup,
  renderToUi,
  type ShowcaseJsxNode,
} from "@/lib/preview-jsx-runtime";
import { MarkupSpotlight } from "./code-spotlight";

export function ShowcaseSpotlight({
  title,
  source,
}: {
  title: string;
  source: ShowcaseJsxNode;
}) {
  return (
    <MarkupSpotlight
      title={title}
      preview={renderToUi(source)}
      markup={renderToMarkup(source)}
    />
  );
}
