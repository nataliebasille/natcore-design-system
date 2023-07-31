"use client";

import { Highlight } from "@/components/Highlight";
import { BasicContainer } from "@/components/doc/BasicContainer";
import { useState } from "react";
import classnames from "classnames";
export const VarientsExample = () => {
  const [tabVarient, setTabVarient] = useState<
    "primary" | "secondary" | "tertiary" | "accent" | "surface"
  >("surface");

  const tabsClassnames = classnames("tabs", {
    "tabs-primary": tabVarient === "primary",
    "tabs-secondary": tabVarient === "secondary",
    "tabs-tertiary": tabVarient === "tertiary",
    "tabs-accent": tabVarient === "accent",
    "tabs-surface": tabVarient === "surface",
  });

  const html = `<div class="${tabsClassnames}">
    <input type="radio" name="tab" id="tab-1" checked />
    <label class="tab" for="tab-1">Tab 1</label>
    <div class="tab-content">
        <p>Tab 1 content</p>
    </div>

    <input type="radio" name="tab" id="tab-2" />
    <label class="tab" for="tab-2">Tab 2</label>
    <div class="tab-content">
        <p>Tab 2 content</p>
    </div>

    <input type="radio" name="tab" id="tab-3" />
    <label class="tab" for="tab-3">Tab 3</label>
    <div class="tab-content">
        <p>Tab 3 content</p>
    </div>
</div>`;

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
            <option value="tertiary" selected={tabVarient === "tertiary"}>
              tertiary
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

      <Highlight component="code" content={html} language="html" />

      <div className="divider mb-2">Output</div>

      <div dangerouslySetInnerHTML={{ __html: html }} />
    </BasicContainer>
  );
};
