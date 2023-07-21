import { Highlight } from "../Highlight";

type ExampleContainerProps = {
  html: string;
  gridColumns?: number | "auto-fit";
  children?: string;
};
export const ExampleContainer = ({
  html,
  gridColumns = "auto-fit",
}: ExampleContainerProps) => {
  return (
    <div className="border-primary-shades-500 rounded-lg border p-3">
      <Highlight component="code" content={html} language="html" />
      <div className="divider mb-2">Output</div>
      <div
        className="grid items-center justify-center gap-3"
        style={{
          gridTemplateColumns: `repeat(${gridColumns}, minmax(115px, 1fr))`,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
