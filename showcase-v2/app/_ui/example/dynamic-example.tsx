import { CodeSnippet } from "../code-snippet/code-snippet";
import { ExampleContainer } from "./example-container";

export type DynamicExampleProps = {
  className?: string;
  html: string;
};

export function DynamicExample({ className, html }: DynamicExampleProps) {
  return (
    <ExampleContainer
      className={className}
      ui={<div dangerouslySetInnerHTML={{ __html: html }} />}
      markup={<CodeSnippet code={html} language="html" />}
    />
  );
}
