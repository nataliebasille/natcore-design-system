import { type PropsWithChildren, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const Spotlight = (
  props: PropsWithChildren<{ title?: ReactNode; className?: string }>,
) => {
  return (
    <div
      className={twMerge(
        "card-outline bg-tone-50 text-on-tone-50 p-4",
        props.className,
      )}
    >
      {props.title && (
        <div className="text-on-tone-50/60 mb-2 uppercase text-sm tracking-widest font-bold">
          {props.title}
        </div>
      )}
      {props.children}
    </div>
  );
};
