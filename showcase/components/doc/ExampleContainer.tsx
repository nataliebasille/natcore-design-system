import { Highlight } from "../Highlight";
import classnames from "classnames";
import { BasicContainer } from "./BasicContainer";

type ExampleContainerProps = {
  html: string;
  gridColumns?: number | "auto-fit";
  className?: string;
  outputClassName?: string;
};

export const ExampleContainer = ({
  html,
  className,
  outputClassName,
  gridColumns = "auto-fit",
}: ExampleContainerProps) => {
  return (
    <BasicContainer className={className}>
      <Highlight component="code" content={html} language="html" />
      <div className="divider mb-2">Output</div>
      <div
        className={classnames(
          "grid items-center justify-center gap-3",
          outputClassName,
        )}
        style={{
          gridTemplateColumns: `repeat(${gridColumns}, minmax(115px, 1fr))`,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </BasicContainer>
  );
};
