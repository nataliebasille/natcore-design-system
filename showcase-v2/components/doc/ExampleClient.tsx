import { useId, useLayoutEffect, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { Highlight } from "../Highlight";
import { formatHTML } from "@/utlls/format-html";

type ExampleProps = {
  html: string | ReactNode;
};

export const ExampleClient = ({ html }: ExampleProps) => {
  const uuid = useId();
  const [htmlToDisplay, setHtmlToDisplay] = useState(
    typeof html === "string" ? html : "",
  );

  useLayoutEffect(() => {
    if (typeof html === "string") {
      setHtmlToDisplay(html);
    } else {
      const div = document.createElement("div");
      const root = createRoot(div);

      setTimeout(() => {
        flushSync(() => {
          root.render(html);
        });
        setHtmlToDisplay(formatHTML(div.innerHTML));
      }, 0);
    }
  }, [html]);

  return (
    <div className="tabs tabs-primary">
      <input
        type="radio"
        id={`example-output-${uuid}`}
        name={`example-tabs-${uuid}`}
        defaultChecked
      />
      <label className="tab" htmlFor={`example-output-${uuid}`}>
        Output
      </label>
      <div
        className="tab-content"
        {...(typeof html === "string"
          ? { dangerouslySetInnerHTML: { __html: html } }
          : { children: html })}
      />

      <input
        type="radio"
        id={`example-source-${uuid}`}
        name={`example-tabs-${uuid}`}
      />
      <label className="tab" htmlFor={`example-source-${uuid}`}>
        Source
      </label>
      <div className="tab-content">
        <Highlight component="code" content={htmlToDisplay} language="html" />
      </div>
    </div>
  );
};
