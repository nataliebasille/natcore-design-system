import { Highlight } from "../Highlight";
import classnames from "classnames";

type ExampleContainerProps = {
  html: string;
  gridColumns?: number | "auto-fit";
  outputClassName?: string;
};

export const ExampleContainer = ({
  html,
  outputClassName,
  gridColumns = "auto-fit",
}: ExampleContainerProps) => {
  return (
    <div className="border-primary-shades-500 rounded-lg border p-3">
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
    </div>
  );
};
