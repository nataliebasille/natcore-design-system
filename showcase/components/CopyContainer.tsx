"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import classnames from "classnames";

type CopyContainerProps = {
  children: React.ReactNode;
};

export const CopyContainer = ({ children }: CopyContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const copiedPromiseRef = useRef<NodeJS.Timer | null>(null);
  const mountedRef = useRef<boolean>(true);
  const [copiedText, setCopiedText] = useState<"copy" | "copied!">("copy");
  const handleClick = useCallback(async () => {
    if (ref.current) {
      const text = ref.current.textContent ?? "";
      await navigator.clipboard.writeText(text);
      setCopiedText("copied!");
      if (copiedPromiseRef.current) {
        clearTimeout(copiedPromiseRef.current);
      }

      copiedPromiseRef.current = setTimeout(() => {
        if (mountedRef.current) {
          copiedPromiseRef.current = null;
          setCopiedText("copy");
        }
      }, 2500);
    }
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="relative flex">
      <div className="flex-1 overflow-auto" ref={ref}>
        {children}
      </div>
      <span
        className={classnames("flex-initial cursor-pointer pl-2", {
          "text-secondary-500 font-bold": copiedText === "copied!",
        })}
        onClick={handleClick}
      >
        {copiedText}
      </span>
    </div>
  );
};
