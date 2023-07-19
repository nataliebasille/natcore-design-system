"use client";

import { useRef } from "react";

type CopyContainerProps = {
  children: React.ReactNode;
};

export const CopyContainer = ({ children }: CopyContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex" ref={ref}>
      {children}
      <span className="absolute right-0 top-0 flex-initial">copy</span>
    </div>
  );
};
