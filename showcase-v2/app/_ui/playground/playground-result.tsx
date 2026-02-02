"use client";

import { useEffect, useRef, useState } from "react";
import { CodeSnippet } from "../code-snippet";

export function PlaygroundResult({ children }: { children: React.ReactNode }) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const [sourceHtml, setSourceHtml] = useState("");

  useEffect(() => {
    const source = sourceRef.current;
    if (!source) return;

    const sync = () => {
      setSourceHtml(source.innerHTML);
    };

    // initial sync
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(source, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ul className="tabs-2 tabs-style-underline [&_label]:active:palette-accent">
      <li>
        <label>
          <input type="radio" name="playground-result" defaultChecked />
          Preview
        </label>
        <div ref={sourceRef}>{children}</div>
      </li>

      <li>
        <label>
          <input type="radio" name="playground-result" />
          Code
        </label>
        <CodeSnippet content={sourceHtml} language="html" />
      </li>
    </ul>
  );
}
