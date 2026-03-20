import { renderToMarkup } from "@/lib/preview-jsx-runtime/core";
import type { ShowcaseJsxChild } from "@/lib/preview-jsx-runtime/types";
import { fetchFile } from "@/server/fetch-file";
import { type SupportedLanguages } from "@/utlls/format-code";
import { type PropsWithChildren, type ReactNode } from "react";
import { codeToHtml } from "shiki/bundle/web";
import { MarkupSpotlight } from "../doc/code-spotlight";

export type BaseExampleProps = { className?: string; title?: string };
export type ExampleLoader = Promise<{ markup: string; content: ReactNode }>;

type ExampleFromFileProps = BaseExampleProps & {
  path: string;
  language?: SupportedLanguages;
};

type ExampleFromShowcaseJsxProps = BaseExampleProps & {
  source: ShowcaseJsxChild;
  language?: SupportedLanguages;
};

export const StaticExample = async ({
  loader,
  title,
  className,
  language = "html",
}: BaseExampleProps & {
  loader: ExampleLoader;
  language?: SupportedLanguages;
}) => {
  const { markup, content } = await loader;

  return (
    <MarkupSpotlight
      title={title}
      preview={content}
      markup={markup}
      className={className}
    />
  );
};

StaticExample.FromChildren = ({
  children,
  className,
}: PropsWithChildren<BaseExampleProps>) => {
  return (
    <StaticExample
      className={className}
      loader={getHtml(children).then((markup) => ({
        markup,
        content: children,
      }))}
    />
  );
};

StaticExample.FromFile = ({
  path,
  className,
  language,
}: ExampleFromFileProps) => {
  const resolvedLanguage = language ?? inferLanguage(path);

  return (
    <StaticExample
      className={className}
      language={resolvedLanguage}
      loader={fetchFile(path).then((rawCode) => {
        const normalizedCode = normalizeUiHtml(rawCode);
        const uiHtml = resolveUiDisplay(normalizedCode);
        const markup = resolveMarkupDisplay(normalizedCode);
        const content =
          resolvedLanguage === "html" ?
            <div
              className="flex flex-wrap items-center justify-center gap-4"
              dangerouslySetInnerHTML={{ __html: uiHtml }}
            />
          : <pre className="font-mono text-xs">
              UI rendering is only available for HTML files.
            </pre>;

        return { markup, content };
      })}
    />
  );
};

StaticExample.FromShowcaseJsx = ({
  title,
  source,
  className,
  language,
}: ExampleFromShowcaseJsxProps) => {
  return (
    <StaticExample
      title={title}
      className={className}
      language="html"
      loader={(async () => {
        const { renderToUi } = await import("@/lib/preview-jsx-runtime/core");
        const content = renderToUi(source);
        const markup = await codeToHtml(renderToMarkup(source), {
          lang: "html",
          theme: "github-dark",
          structure: "inline",
        });
        return { markup, content };
      })()}
    />
  );
};

function inferLanguage(filePath: string): SupportedLanguages {
  const ext = filePath.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "ts":
      return "ts";
    case "tsx":
      return "tsx";
    case "js":
      return "js";
    case "jsx":
      return "jsx";
    case "json":
      return "json";
    default:
      return "html";
  }
}

function normalizeUiHtml(code: string) {
  return code.replace(/\bclassName=/g, "class=");
}

function resolveUiDisplay(source: string) {
  return resolveConditionalDisplay(source, "ui");
}

function resolveMarkupDisplay(source: string) {
  return resolveConditionalDisplay(source, "markup");
}

function resolveConditionalDisplay(source: string, mode: "ui" | "markup") {
  const uiMarkerPattern = /<!--\s*@example:ui\s*-->/g;
  const markupMarkerPattern = /<!--\s*@example:markup\s*-->/g;
  const endMarkerPattern = /<!--\s*@example:end\s*-->/g;
  const conditionalBlockPattern =
    /<!--\s*@example:ui\s*-->([\s\S]*?)<!--\s*@example:markup\s*-->([\s\S]*?)<!--\s*@example:end\s*-->/g;

  const uiCount = Array.from(source.matchAll(uiMarkerPattern)).length;
  const markupCount = Array.from(source.matchAll(markupMarkerPattern)).length;
  const endCount = Array.from(source.matchAll(endMarkerPattern)).length;

  if (uiCount === 0 && (markupCount > 0 || endCount > 0)) {
    throw new Error(
      "Invalid example file: found @example:markup/@example:end without @example:ui.",
    );
  }

  if (uiCount === 0) {
    return resolveUiOnlyAttributes(source, mode);
  }

  if (uiCount !== markupCount || uiCount !== endCount) {
    throw new Error(
      "Invalid example file: unmatched @example:ui/@example:markup/@example:end markers.",
    );
  }

  let replacedBlocks = 0;
  const resolved = source.replace(conditionalBlockPattern, (_, ui, markup) => {
    replacedBlocks += 1;
    return mode === "ui" ? ui : markup;
  });

  if (replacedBlocks !== uiCount) {
    throw new Error(
      "Invalid example file: each @example:ui marker must include matching @example:markup and @example:end markers.",
    );
  }

  return resolveUiOnlyAttributes(stripDirectiveComments(resolved), mode);
}

function stripDirectiveComments(source: string) {
  return source
    .replace(/<!--\s*@example:ui\s*-->/g, "")
    .replace(/<!--\s*@example:markup\s*-->/g, "")
    .replace(/<!--\s*@example:end\s*-->/g, "");
}

function resolveUiOnlyAttributes(source: string, mode: "ui" | "markup") {
  const uiOnlyAttributePattern =
    /(\s+)@example:ui-attr:([^\s=/>]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g;

  return source.replace(
    uiOnlyAttributePattern,
    (_, leadingWhitespace: string, name: string, value?: string) => {
      if (mode === "markup") {
        return "";
      }

      return `${leadingWhitespace}${name}${value ? `=${value}` : ""}`;
    },
  );
}

async function getHtml(children: ReactNode) {
  const { renderToStaticMarkup } = await import("react-dom/server");
  return renderToStaticMarkup(children);
}
