"use client";

import { Highlight } from "@/components/Highlight";
import { BasicContainer } from "@/components/doc/BasicContainer";
import { useState } from "react";
import classnames from "classnames";
export const VarientsExample = ({ html }: { html: string }) => {
  const [tabVarient, setTabVarient] = useState<
    "primary" | "secondary" | "accent" | "surface"
  >("surface");

  const tabsClassnames = classnames({
    "tabs-primary": tabVarient === "primary",
    "tabs-secondary": tabVarient === "secondary",
    "tabs-accent": tabVarient === "accent",
    "tabs-surface": tabVarient === "surface",
  });

  const htmlToRender = !tabsClassnames
    ? html
    : html.replace('class="tabs"', `class="tabs ${tabsClassnames}"`);

  return (
    <BasicContainer>
      <div className="mb-2 flex gap-3">
        <div className="flex items-center">
          <span>tabs-</span>
          <select onChange={(e) => setTabVarient(e.target.value as any)}>
            <option value="primary" selected={tabVarient === "primary"}>
              primary
            </option>
            <option value="secondary" selected={tabVarient === "secondary"}>
              secondary
            </option>
            <option value="accent" selected={tabVarient === "accent"}>
              accent
            </option>
            <option value="surface" selected={tabVarient === "surface"}>
              surface
            </option>
          </select>
        </div>
      </div>

      <Highlight component="code" content={htmlToRender} language="html" />

      <div className="divider mb-2">Output</div>

      <div dangerouslySetInnerHTML={{ __html: htmlToRender }} />
    </BasicContainer>
  );
};
