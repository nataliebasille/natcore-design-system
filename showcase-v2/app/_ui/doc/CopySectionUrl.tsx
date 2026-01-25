"use client";

import { useCallback } from "react";
import { LinkSVG } from "@nataliebasille/natcore-icons/link";

export const CopySectionUrl = ({ sectionId }: { sectionId: string }) => {
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/${window.location.pathname}#${sectionId}`,
    );
  }, [sectionId]);

  return (
    <span
      className="absolute left-0 top-0 flex h-full -translate-x-full items-center pr-2"
      onClick={copy}
    >
      <LinkSVG className="btn btn-icon btn-outline btn-sm cursor-pointer rounded-md !p-[.25em] opacity-0 transition-opacity hover:!bg-transparent hover:opacity-100 active:scale-90" />
    </span>
  );
};
