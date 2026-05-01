import { type PropsWithChildren, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const Spotlight = (
  props: PropsWithChildren<{ title?: ReactNode; className?: string }>,
) => {
  return (
    <div
      className={twMerge("card-outline bg-50 p-4 text-on-50", props.className)}
    >
      {props.title && (
        <div className="mb-2 text-sm font-bold tracking-widest text-on-50/60 uppercase">
          {props.title}
        </div>
      )}
      {props.children}
    </div>
  );
};
